const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const archiver = require('archiver');
const auth = require('../middleware/auth');
const {
  getDriveClient,
  getOrCreateEventFolder,
  uploadFileToDrive,
  listFolderImages,
  countFolderImages,
  streamFolderToZip,
  extractFolderId,
} = require('../services/driveService');

const prisma = new PrismaClient();

// Use memory storage — files go straight to Google Drive, not disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// Helper: strip sensitive fields from event response
function sanitizeEvent(event) {
  if (!event) return event;
  const { accessCode, ...safe } = event;
  return { ...safe, hasAccessCode: !!accessCode, hasDriveFolder: !!event.driveFolderUrl };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS (auth required)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/events – list all events
router.get('/', auth, async (req, res) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { eventDate: 'desc' } });
    res.json(events.map(sanitizeEvent));
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// GET /api/events/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(sanitizeEvent(event));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// POST /api/events – create event record
router.post('/', auth, async (req, res) => {
  try {
    const { title, clientName, eventDate, price, category, status, description, notes, driveFolderUrl, accessCode } = req.body;

    if (!title || !clientName || !eventDate) {
      return res.status(400).json({ error: 'title, clientName and eventDate are required.' });
    }

    let hashedCode = null;
    if (accessCode && accessCode.trim()) {
      const salt = await bcrypt.genSalt(10);
      hashedCode = await bcrypt.hash(accessCode.trim(), salt);
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
        driveFolderUrl: driveFolderUrl || null,
        accessCode: hashedCode,
      },
    });

    res.status(201).json(sanitizeEvent(event));
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// PUT /api/events/:id – update event metadata
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, clientName, eventDate, price, category, status, description, notes, driveFolderUrl, accessCode } = req.body;
    const eventId = req.params.id;

    const updateData = {
      ...(title && { title }),
      ...(clientName && { clientName }),
      ...(eventDate && { eventDate: new Date(eventDate) }),
      ...(price !== undefined && { price }),
      ...(category !== undefined && { category }),
      ...(status && { status }),
      ...(description !== undefined && { description }),
      ...(notes !== undefined && { notes }),
      ...(driveFolderUrl !== undefined && { driveFolderUrl: driveFolderUrl || null }),
    };

    if (accessCode && accessCode.trim()) {
      const salt = await bcrypt.genSalt(10);
      updateData.accessCode = await bcrypt.hash(accessCode.trim(), salt);
    }

    const event = await prisma.event.update({ where: { id: eventId }, data: updateData });
    res.json(sanitizeEvent(event));
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: 'Event deleted.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// POST /api/events/:id/photos – bulk upload photos to Google Drive (auth required)
router.post('/:id/photos', auth, upload.array('photos', 200), async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files provided.' });

    const drive = getDriveClient();

    // Get or create the Drive folder for this event
    const folder = await getOrCreateEventFolder(drive, event.title, event.id);

    // Upload all files concurrently in batches of 5
    const results = [];
    const batchSize = 5;
    for (let i = 0; i < req.files.length; i += batchSize) {
      const batch = req.files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(file => uploadFileToDrive(drive, file.buffer, file.originalname, file.mimetype, folder.id))
      );
      results.push(...batchResults);
    }

    // Update event with the Drive folder URL if not already set
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { driveFolderUrl: folder.webViewLink },
    });

    res.json({
      message: `Successfully uploaded ${results.length} photo(s) to Google Drive.`,
      folderUrl: folder.webViewLink,
      folderId: folder.id,
      uploadedCount: results.length,
      event: sanitizeEvent(updatedEvent),
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload photos.' });
  }
});

// POST /api/events/:id/banner – upload banner images to Google Drive (auth required)
router.post('/:id/banner', auth, upload.array('bannerImages', 6), async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files provided.' });

    const drive = getDriveClient();
    const folder = await getOrCreateEventFolder(drive, event.title, event.id);

    // Upload each banner prefixed so they are easy to identify
    const uploadedBanners = await Promise.all(
      req.files.map((file, i) =>
        uploadFileToDrive(drive, file.buffer, `_banner_${i + 1}_${file.originalname}`, file.mimetype, folder.id)
      )
    );

    // Store proxy URLs as bannerImages — served through our backend
    const apiBase = `${req.protocol}://${req.get('host')}`;
    const bannerUrls = uploadedBanners.map(f =>
      `${apiBase}/api/events/drive-image/${f.id}`
    );

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        bannerImages: bannerUrls,
        driveFolderUrl: event.driveFolderUrl || folder.webViewLink,
      },
    });

    res.json(sanitizeEvent(updatedEvent));
  } catch (error) {
    console.error('Banner upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload banner images.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ENDPOINTS (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/events/drive-image/:fileId – proxy images from Google Drive (public, cached)
router.get('/drive-image/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID.' });
    }

    const drive = getDriveClient();

    // Get file metadata for content type
    const meta = await drive.files.get({
      fileId,
      fields: 'mimeType, name',
      supportsAllDrives: true,
    });

    // Stream the file content
    const fileStream = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );

    // Set headers for caching and content type
    res.setHeader('Content-Type', meta.data.mimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('X-Content-Type-Options', 'nosniff');

    fileStream.data.pipe(res);
  } catch (error) {
    console.error('Drive image proxy error:', error.message);
    if (!res.headersSent) {
      res.status(error.code === 404 ? 404 : 500).json({ error: 'Failed to load image.' });
    }
  }
});

// GET /api/events/public/all
router.get('/public/all', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
      select: { id: true, title: true, clientName: true, eventDate: true, category: true, bannerImages: true },
    });
    res.json(events);
  } catch (error) {
    console.error('Fetch public events error:', error);
    res.status(500).json({ error: 'Failed to fetch public events.' });
  }
});

// GET /api/events/:id/public-info
router.get('/:id/public-info', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: { id: true, title: true },
    });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event info.' });
  }
});

// POST /api/events/:id/verify-access
router.post('/:id/verify-access', async (req, res) => {
  try {
    const { accessCode } = req.body;
    const eventId = req.params.id;

    if (!accessCode) return res.status(400).json({ error: 'Access code is required.' });

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    if (!event.accessCode) return res.status(403).json({ error: 'Gallery access is not configured for this event.' });

    const isMatch = await bcrypt.compare(accessCode.trim(), event.accessCode);
    if (!isMatch) return res.status(403).json({ error: 'Invalid access code.' });

    res.json({
      id: event.id,
      title: event.title,
      clientName: event.clientName,
      eventDate: event.eventDate,
      driveFolderUrl: event.driveFolderUrl,
      category: event.category,
    });
  } catch (error) {
    console.error('Verify access error:', error);
    res.status(500).json({ error: 'Failed to verify access.' });
  }
});

// GET /api/events/:id/preview – returns first 30 images from Drive folder (public after token)
router.post('/:id/preview', async (req, res) => {
  try {
    const { accessCode } = req.body;
    const eventId = req.params.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    // Verify access code
    if (event.accessCode) {
      if (!accessCode) return res.status(403).json({ error: 'Access code required.' });
      const isMatch = await bcrypt.compare(accessCode.trim(), event.accessCode);
      if (!isMatch) return res.status(403).json({ error: 'Invalid access code.' });
    }

    if (!event.driveFolderUrl) {
      return res.json({ images: [], totalCount: 0 });
    }

    const folderId = extractFolderId(event.driveFolderUrl);
    if (!folderId) return res.status(400).json({ error: 'Invalid Drive folder URL.' });

    const drive = getDriveClient();
    const [images, totalCount] = await Promise.all([
      listFolderImages(drive, folderId, 30),
      countFolderImages(drive, folderId),
    ]);

    res.json({ images, totalCount });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch preview images.' });
  }
});

// GET /api/events/:id/download – streams a ZIP of all photos (public after token)
router.post('/:id/download', async (req, res) => {
  try {
    const { accessCode } = req.body;
    const eventId = req.params.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    // Verify access code
    if (event.accessCode) {
      if (!accessCode) return res.status(403).json({ error: 'Access code required.' });
      const isMatch = await bcrypt.compare(accessCode.trim(), event.accessCode);
      if (!isMatch) return res.status(403).json({ error: 'Invalid access code.' });
    }

    if (!event.driveFolderUrl) return res.status(400).json({ error: 'No gallery folder configured.' });

    const folderId = extractFolderId(event.driveFolderUrl);
    if (!folderId) return res.status(400).json({ error: 'Invalid Drive folder URL.' });

    const safeTitle = event.title.replace(/[^a-z0-9]/gi, '_');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_Photos.zip"`);

    const archive = archiver('zip', { zlib: { level: 5 } });
    archive.on('error', err => { throw err; });
    archive.pipe(res);

    const drive = getDriveClient();
    await streamFolderToZip(drive, folderId, archive);
    await archive.finalize();
  } catch (error) {
    console.error('Download ZIP error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to generate download.' });
    }
  }
});

module.exports = router;
