const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configure multer storage for service images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'services');
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
  limits: { fileSize: 10 * 1024 * 1024 },
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

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { active: true };

    const services = await prisma.service.findMany({
      where,
      orderBy: { order: 'asc' }
    });
    res.json(services);
  } catch (error) {
    console.error('Fetch services error:', error);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service.' });
  }
});

// POST /api/services
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, icon, price, features, order } = req.body;
    const imageUrl = req.file ? `/uploads/services/${req.file.filename}` : '';

    const service = await prisma.service.create({
      data: {
        name,
        description,
        icon: icon || '',
        imageUrl,
        price: price || '',
        features: features || '',
        order: parseInt(order) || 0
      }
    });
    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service.' });
  }
});

// PUT /api/services/:id
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, icon, price, features, order, active } = req.body;
    const data = {
      name,
      description,
      icon,
      price,
      features,
      order: parseInt(order) || 0,
      active: active === 'true' || active === true
    };

    if (req.file) {
      data.imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const service = await prisma.service.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.service.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Service deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

module.exports = router;
