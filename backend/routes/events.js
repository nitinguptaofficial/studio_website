const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Configure multer storage for event banners
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'events');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed.'));
    }
  }
});

// Helper: strip sensitive fields from event response
function sanitizeEvent(event) {
  if (!event) return event;
  const { accessCode, ...safe } = event;
  return { ...safe, hasAccessCode: !!accessCode, hasDriveFolder: !!event.driveFolderUrl };
}

// GET /api/events – list all events (auth required)
router.get('/', auth, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
    });
    res.json(events.map(sanitizeEvent));
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// GET /api/events/:id (auth required)
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(sanitizeEvent(event));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// POST /api/events – create event record (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, clientName, eventDate, price, category, status, description, notes, driveFolderUrl, accessCode } = req.body;

    if (!title || !clientName || !eventDate) {
      return res.status(400).json({ error: 'title, clientName and eventDate are required.' });
    }

    // Hash access code if provided
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

// PUT /api/events/:id – update event metadata (auth required)
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

    // Only update access code if a new one is explicitly provided
    if (accessCode && accessCode.trim()) {
      const salt = await bcrypt.genSalt(10);
      updateData.accessCode = await bcrypt.hash(accessCode.trim(), salt);
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    res.json(sanitizeEvent(event));
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// POST /api/events/:id/banner – upload banner images (auth required)
router.post('/:id/banner', auth, upload.array('bannerImages', 6), async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    if (req.files && req.files.length > 0) {
      const bannerUrls = req.files.map(file => `/uploads/events/${file.filename}`);
      
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: { bannerImages: bannerUrls },
      });
      return res.json(sanitizeEvent(updatedEvent));
    }
    res.json(sanitizeEvent(event));
  } catch (error) {
    console.error('Upload banner error:', error);
    res.status(500).json({ error: 'Failed to upload banner images.' });
  }
});

// DELETE /api/events/:id (auth required)
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Event deleted.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// ──────────────────────────────────────────────────────────────
// PUBLIC ENDPOINTS (no auth required)
// ──────────────────────────────────────────────────────────────

// GET /api/events/public/all - get all public events without auth
router.get('/public/all', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
      select: {
        id: true,
        title: true,
        clientName: true,
        eventDate: true,
        category: true,
        bannerImages: true,
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Fetch public events error:', error);
    res.status(500).json({ error: 'Failed to fetch public events.' });
  }
});

// GET /api/events/:id/public-info – minimal info for access code screen
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

// POST /api/events/:id/verify-access – verify access code & return gallery data
router.post('/:id/verify-access', async (req, res) => {
  try {
    const { accessCode } = req.body;
    const eventId = req.params.id;

    if (!accessCode) {
      return res.status(400).json({ error: 'Access code is required.' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (!event.accessCode) {
      return res.status(403).json({ error: 'Gallery access is not configured for this event.' });
    }

    const isMatch = await bcrypt.compare(accessCode.trim(), event.accessCode);

    if (!isMatch) {
      return res.status(403).json({ error: 'Invalid access code.' });
    }

    // Return gallery-relevant data only
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

module.exports = router;
