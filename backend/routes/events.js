const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// ── Multer (memory storage – files go straight to Drive, never to disk) ──────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|heic|heif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = /image\//.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// ── Google Drive helpers ──────────────────────────────────────────────────────

function getDriveClient() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath || !fs.existsSync(keyPath)) {
    throw new Error(
      'Google Drive service account key not configured. ' +
      'Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH in .env'
    );
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

/** Create a public folder under the parent folder; returns { id, webViewLink } */
async function createDriveFolder(folderName) {
  const drive = getDriveClient();
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  const folderMeta = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {}),
  };

  const folder = await drive.files.create({
    requestBody: folderMeta,
    fields: 'id, webViewLink',
  });

  // Make the folder publicly readable (anyone with the link can view)
  await drive.permissions.create({
    fileId: folder.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return folder.data;
}

/** Upload a single buffer to Drive inside folderId; returns file id */
async function uploadFileToDrive(drive, buffer, filename, mimeType, folderId) {
  const { Readable } = require('stream');
  const readable = Readable.from(buffer);

  const file = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: { mimeType, body: readable },
    fields: 'id',
  });
  return file.data.id;
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/events – list all events (auth required)
router.get('/', auth, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
    });
    res.json(events);
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// GET /api/events/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// POST /api/events – create event record (no files yet)
router.post('/', auth, async (req, res) => {
  try {
    const { title, clientName, eventDate, price, category, status, description, notes } = req.body;

    if (!title || !clientName || !eventDate) {
      return res.status(400).json({ error: 'title, clientName and eventDate are required.' });
    }

    // Create a Google Drive folder for this event immediately
    let driveFolderId = null;
    let driveFolderLink = null;

    try {
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
      const folderName = `${sanitizedTitle} – ${new Date(eventDate).getFullYear()}`;
      const folder = await createDriveFolder(folderName);
      driveFolderId = folder.id;
      driveFolderLink = folder.webViewLink;
    } catch (driveErr) {
      console.warn('Google Drive folder creation skipped:', driveErr.message);
      // Non-fatal – event is still created without a Drive folder
    }

    const event = await prisma.event.create({
      data: {
        title,
        clientName,
        eventDate: new Date(eventDate),
        price: price || null,
        category: category || null,
        status: status || 'upcoming',
        description: description || null,
        notes: notes || null,
        driveFolderId,
        driveFolderLink,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// POST /api/events/:id/upload – upload a batch of photos to Drive
router.post('/:id/upload', auth, upload.array('photos', 500), async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    let drive;
    try {
      drive = getDriveClient();
    } catch (err) {
      return res.status(503).json({ error: err.message });
    }

    let folderId = event.driveFolderId;
    let folderLink = event.driveFolderLink;

    // Create the Drive folder if it doesn't exist yet (e.g., Drive wasn't configured at creation time)
    if (!folderId) {
      const sanitizedTitle = event.title.replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
      const folderName = `${sanitizedTitle} – ${new Date(event.eventDate).getFullYear()}`;
      const folder = await createDriveFolder(folderName);
      folderId = folder.id;
      folderLink = folder.webViewLink;
    }

    // Upload files in parallel (batches of 10 to avoid rate limits)
    const files = req.files;
    const batchSize = 10;
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(
        batch.map((file) =>
          uploadFileToDrive(drive, file.buffer, file.originalname, file.mimetype, folderId)
        )
      );
      uploadedCount += batch.length;
    }

    // Update DB with new file count and folder info
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        driveFolderId: folderId,
        driveFolderLink: folderLink,
        driveFileCount: event.driveFileCount + uploadedCount,
      },
    });

    res.json({
      message: `Successfully uploaded ${uploadedCount} photo(s) to Google Drive.`,
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ error: 'Failed to upload photos.' });
  }
});

// PUT /api/events/:id – update event metadata
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, clientName, eventDate, price, category, status, description, notes } = req.body;
    const eventId = parseInt(req.params.id);

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(title && { title }),
        ...(clientName && { clientName }),
        ...(eventDate && { eventDate: new Date(eventDate) }),
        ...(price !== undefined && { price }),
        ...(category !== undefined && { category }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Event deleted.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

module.exports = router;
