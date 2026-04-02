const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'testimonials');
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|webm/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = file.mimetype.startsWith('video/');
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only Video files (MP4, MOV, WebM) are allowed.'));
    }
  }
});

// GET /api/testimonials
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const where = {};
    if (featured === 'true') where.featured = true;

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(testimonials);
  } catch (error) {
    console.error('Fetch testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials.' });
  }
});

// POST /api/testimonials/public (for client submissions)
router.post('/public', async (req, res) => {
  try {
    const { name, event, quote, rating } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        event,
        quote,
        rating: parseInt(rating) || 5,
        featured: false,
        videoUrl: null
      }
    });
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Create public testimonial error:', error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// POST /api/testimonials
router.post('/', auth, upload.single('video'), async (req, res) => {
  try {
    const { name, event, quote, rating, featured } = req.body;
    let videoUrl = null;
    if (req.file) {
      videoUrl = `/uploads/testimonials/${req.file.filename}`;
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        event,
        quote,
        rating: parseInt(rating) || 5,
        featured: featured === 'true' || featured === true,
        videoUrl
      }
    });
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to create testimonial.' });
  }
});

// PUT /api/testimonials/:id
router.put('/:id', auth, upload.single('video'), async (req, res) => {
  try {
    const { name, event, quote, rating, featured } = req.body;
    const data = { 
      name, 
      event, 
      quote, 
      rating: parseInt(rating) || 5, 
      featured: featured === 'true' || featured === true 
    };

    if (req.file) {
      data.videoUrl = `/uploads/testimonials/${req.file.filename}`;
    }

    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update testimonial.' });
  }
});

// DELETE /api/testimonials/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.testimonial.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Testimonial deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial.' });
  }
});

module.exports = router;
