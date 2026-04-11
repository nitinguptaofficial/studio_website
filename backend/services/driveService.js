const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const stream = require('stream');

/**
 * Returns an authenticated Google Drive client.
 * Authentication is handled via a service account credentials.json file
 * placed in the /backend directory.
 */
function getDriveClient() {
  const credentialsPath = path.join(__dirname, '..', 'credentials.json');

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      'Google Drive credentials.json not found. Please place your service account credentials file in the /backend directory. ' +
      'See the walkthrough for instructions on how to generate it.'
    );
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Gets or creates a Google Drive folder for the given event.
 * The root folder ID is read from GOOGLE_DRIVE_ROOT_FOLDER_ID in .env
 */
async function getOrCreateEventFolder(drive, eventTitle, eventId) {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const folderName = `${eventTitle} (${eventId.slice(0, 8)})`;

  // Search for existing folder
  const searchResponse = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false${rootFolderId ? ` and '${rootFolderId}' in parents` : ''}`,
    fields: 'files(id, name, webViewLink)',
    spaces: 'drive',
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
  });

  // Make folder publicly readable
  await drive.permissions.create({
    fileId: folder.data.id,
    resource: { role: 'reader', type: 'anyone' },
  });

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
  });

  // Make the file publicly readable
  await drive.permissions.create({
    fileId: response.data.id,
    resource: { role: 'reader', type: 'anyone' },
  });

  return response.data;
}

/**
 * Lists up to `limit` image files in a Google Drive folder.
 * Returns an array of { id, name, thumbnailLink, webContentLink }
 */
async function listFolderImages(drive, folderId, limit = 30) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    fields: 'files(id, name, thumbnailLink, webContentLink, mimeType)',
    pageSize: limit,
    orderBy: 'name',
  });

  return response.data.files.map(f => ({
    id: f.id,
    name: f.name,
    // Use thumbnail for fast loading in the gallery grid
    thumbnailUrl: f.thumbnailLink
      ? f.thumbnailLink.replace('=s220', '=s800')
      : `https://drive.google.com/thumbnail?id=${f.id}&sz=w800`,
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
  });
  return response.data.files.length;
}

/**
 * Streams all images from a folder through archiver into a ZIP.
 * Takes an archiver instance and adds files to it.
 */
async function streamFolderToZip(drive, folderId, archive) {
  // Fetch all image files in the folder
  let allFiles = [];
  let nextPageToken = null;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 100,
      ...(nextPageToken && { pageToken: nextPageToken }),
    });
    allFiles = allFiles.concat(response.data.files);
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  // Stream each file into the archive
  for (const file of allFiles) {
    const fileStream = await drive.files.get(
      { fileId: file.id, alt: 'media' },
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
