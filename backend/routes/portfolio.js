const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'portfolio');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

// GET /api/portfolio - List all portfolio items
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const where = {};
    if (category && category !== 'all') where.category = category;
    if (featured === 'true') where.featured = true;

    const items = await prisma.portfolioItem.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // For backwards compatibility and easier frontend mapping,
    // we attach the first image as `imageUrl`
    const mappedItems = items.map(item => ({
      ...item,
      imageUrl: item.images.length > 0 ? item.images[0].url : ''
    }));

    res.json(mappedItems);
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio items.' });
  }
});

// GET /api/portfolio/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.portfolioItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });
    if (!item) return res.status(404).json({ error: 'Portfolio item not found.' });

    res.json({
      ...item,
      imageUrl: item.images.length > 0 ? item.images[0].url : ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio item.' });
  }
});

// POST /api/portfolio - Create with multiple image upload
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { title, category, description, featured, order } = req.body;
    
    // Create the portfolio item first
    const item = await prisma.portfolioItem.create({
      data: {
        title,
        category,
        description: description || '',
        featured: featured === 'true',
        order: parseInt(order) || 0
      }
    });

    // Then create associated images if any
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file, index) => ({
        url: `/uploads/portfolio/${file.filename}`,
        portfolioItemId: item.id,
        order: index
      }));
      
      await prisma.portfolioImage.createMany({
        data: imageRecords
      });
    }

    // Refetch to include images
    const createdItem = await prisma.portfolioItem.findUnique({
      where: { id: item.id },
      include: { images: true }
    });

    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({ error: 'Failed to create portfolio item.' });
  }
});

// PUT /api/portfolio/:id
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { title, category, description, featured, order } = req.body;
    const portfolioId = parseInt(req.params.id);

    const item = await prisma.portfolioItem.update({
      where: { id: portfolioId },
      data: {
        title,
        category,
        description: description || '',
        featured: featured === 'true',
        order: parseInt(order) || 0
      }
    });

    // If new files are uploaded, delete old images and add new ones
    if (req.files && req.files.length > 0) {
      await prisma.portfolioImage.deleteMany({
        where: { portfolioItemId: portfolioId }
      });

      const imageRecords = req.files.map((file, index) => ({
        url: `/uploads/portfolio/${file.filename}`,
        portfolioItemId: portfolioId,
        order: index
      }));

      await prisma.portfolioImage.createMany({
        data: imageRecords
      });
    }

    const updatedItem = await prisma.portfolioItem.findUnique({
      where: { id: portfolioId },
      include: { images: true }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({ error: 'Failed to update portfolio item.' });
  }
});

// DELETE /api/portfolio/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.portfolioItem.delete({
      where: { id: parseInt(req.params.id) }
    });
    // Cascade delete automatically removes related PortfolioImage records
    res.json({ message: 'Portfolio item deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete portfolio item.' });
  }
});

module.exports = router;
