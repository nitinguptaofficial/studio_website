const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const stream = require('stream');

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * GOOGLE DRIVE AUTH — Dual-mode authentication
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Set GOOGLE_DRIVE_AUTH_MODE in .env:
 *
 *   "oauth"           → Personal Gmail account (OAuth2 + refresh token)
 *   "service_account" → Google Workspace / Business (Service Account + Shared Drive)
 *
 * See DRIVE-SETUP.md for full setup instructions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const AUTH_MODE = (process.env.GOOGLE_DRIVE_AUTH_MODE || 'oauth').toLowerCase();
const IS_SERVICE_ACCOUNT = AUTH_MODE === 'service_account';

/**
 * Returns an authenticated Google Drive client.
 * Automatically selects OAuth2 or Service Account based on GOOGLE_DRIVE_AUTH_MODE.
 */
function getDriveClient() {
  if (IS_SERVICE_ACCOUNT) {
    return _getServiceAccountClient();
  }
  return _getOAuthClient();
}

/* ── OAuth2 (Personal Gmail) ──────────────────────────────────────────────── */

function _getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Google Drive OAuth credentials not configured. ' +
      'Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env. ' +
      'Run "node setup-drive-oauth.js" to generate the refresh token. ' +
      'See DRIVE-SETUP.md for instructions.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/* ── Service Account (Google Workspace) ───────────────────────────────────── */

function _getServiceAccountClient() {
  const credentialsPath = path.join(__dirname, '..', 'credentials.json');

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      'Google Drive credentials.json not found. ' +
      'Place your service account key file at /backend/credentials.json. ' +
      'See DRIVE-SETUP.md for instructions.'
    );
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

/* ── Shared Drive helper flags ────────────────────────────────────────────── */

// Service accounts upload to Shared Drives, so every API call needs these flags.
// OAuth users upload to their personal "My Drive", so these flags are not needed.
function _sharedDriveFlags() {
  if (!IS_SERVICE_ACCOUNT) return {};
  return {
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  };
}

function _sharedDriveCreateFlags() {
  if (!IS_SERVICE_ACCOUNT) return {};
  return { supportsAllDrives: true };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* DRIVE OPERATIONS                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Gets or creates a Google Drive folder for the given event.
 * Root folder ID is read from GOOGLE_DRIVE_ROOT_FOLDER_ID in .env.
 */
async function getOrCreateEventFolder(drive, eventTitle, eventId) {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const folderName = `${eventTitle} (${eventId.slice(0, 8)})`;

  // Search for existing folder
  const searchResponse = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false${rootFolderId ? ` and '${rootFolderId}' in parents` : ''}`,
    fields: 'files(id, name, webViewLink)',
    spaces: 'drive',
    ..._sharedDriveFlags(),
    ...(IS_SERVICE_ACCOUNT && rootFolderId && { corpora: 'allDrives' }),
  });

  if (searchResponse.data.files.length > 0) {
    return searchResponse.data.files[0];
  }

  // Create new folder
  const folderMeta = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    ...(rootFolderId && { parents: [rootFolderId] }),
  };

  const folder = await drive.files.create({
    resource: folderMeta,
    fields: 'id, name, webViewLink',
    ..._sharedDriveCreateFlags(),
  });

  // Make folder publicly readable
  try {
    await drive.permissions.create({
      fileId: folder.data.id,
      resource: { role: 'reader', type: 'anyone' },
      ..._sharedDriveCreateFlags(),
    });
  } catch (permErr) {
    console.warn('Could not set public permissions on folder:', permErr.message);
  }

  return folder.data;
}

/**
 * Uploads a single file buffer to a Google Drive folder.
 * Returns the file metadata including webViewLink and thumbnailLink.
 */
async function uploadFileToDrive(drive, fileBuffer, fileName, mimeType, folderId) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  const response = await drive.files.create({
    resource: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: bufferStream,
    },
    fields: 'id, name, webViewLink, thumbnailLink, webContentLink',
    ..._sharedDriveCreateFlags(),
  });

  // Make the file publicly readable
  try {
    await drive.permissions.create({
      fileId: response.data.id,
      resource: { role: 'reader', type: 'anyone' },
      ..._sharedDriveCreateFlags(),
    });
  } catch (permErr) {
    console.warn('Could not set public permissions on file:', permErr.message);
  }

  return response.data;
}

/**
 * Lists up to `limit` image files in a Google Drive folder.
 * Returns an array of { id, name, thumbnailUrl, downloadUrl }
 */
async function listFolderImages(drive, folderId, limit = 30) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    fields: 'files(id, name, thumbnailLink, webContentLink, mimeType)',
    pageSize: limit,
    orderBy: 'name',
    ..._sharedDriveFlags(),
  });

  // Build proxy base URL from environment
  const apiBase = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.replace(':3000', `:${process.env.PORT || 5000}`) : `http://localhost:${process.env.PORT || 5000}`;

  return response.data.files
    .filter(f => !f.name.startsWith('_banner_')) // exclude banner files from gallery
    .map(f => ({
    id: f.id,
    name: f.name,
    // Proxy images through our backend to avoid CORS/auth issues
    thumbnailUrl: `${apiBase}/api/events/drive-image/${f.id}`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${f.id}`,
  }));
}

/**
 * Counts total images in a folder.
 */
async function countFolderImages(drive, folderId) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    fields: 'files(id)',
    pageSize: 1000,
    ..._sharedDriveFlags(),
  });
  return response.data.files.length;
}

/**
 * Streams all images from a folder through archiver into a ZIP.
 */
async function streamFolderToZip(drive, folderId, archive) {
  let allFiles = [];
  let nextPageToken = null;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 100,
      ..._sharedDriveFlags(),
      ...(nextPageToken && { pageToken: nextPageToken }),
    });
    allFiles = allFiles.concat(response.data.files);
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  for (const file of allFiles) {
    const fileStream = await drive.files.get(
      { fileId: file.id, alt: 'media', ..._sharedDriveCreateFlags() },
      { responseType: 'stream' }
    );
    archive.append(fileStream.data, { name: file.name });
  }
}

/**
 * Extracts Google Drive folder ID from various URL formats.
 */
function extractFolderId(url) {
  if (!url) return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return url;
  return null;
}

module.exports = {
  getDriveClient,
  getOrCreateEventFolder,
  uploadFileToDrive,
  listFolderImages,
  countFolderImages,
  streamFolderToZip,
  extractFolderId,
};
