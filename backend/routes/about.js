const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configure multer storage for team member images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'team');
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

// ==================== TEAM MEMBERS ====================

// GET /api/about/team
router.get('/team', async (req, res) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(members);
  } catch (error) {
    console.error('Fetch team error:', error);
    res.status(500).json({ error: 'Failed to fetch team members.' });
  }
});

// POST /api/about/team
router.post('/team', upload.single('image'), async (req, res) => {
  try {
    const { name, role, bio, order } = req.body;
    const imageUrl = req.file ? `/uploads/team/${req.file.filename}` : '';

    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        bio,
        imageUrl,
        order: parseInt(order) || 0
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'Failed to create team member.' });
  }
});

// PUT /api/about/team/:id
router.put('/team/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, role, bio, order } = req.body;
    const data = {
      name,
      role,
      bio,
      order: parseInt(order) || 0
    };

    if (req.file) {
      data.imageUrl = `/uploads/team/${req.file.filename}`;
    }

    const member = await prisma.teamMember.update({
      where: { id: parseInt(req.params.id) },
      data
    });

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member.' });
  }
});

// DELETE /api/about/team/:id
router.delete('/team/:id', async (req, res) => {
  try {
    await prisma.teamMember.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Team member deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member.' });
  }
});

// ==================== TIMELINE EVENTS ====================

// GET /api/about/timeline
router.get('/timeline', async (req, res) => {
  try {
    const events = await prisma.timelineEvent.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(events);
  } catch (error) {
    console.error('Fetch timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline events.' });
  }
});

// POST /api/about/timeline
router.post('/timeline', async (req, res) => {
  try {
    const { year, title, description, order } = req.body;
    const event = await prisma.timelineEvent.create({
      data: {
        year,
        title,
        description,
        order: parseInt(order) || 0
      }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create timeline event error:', error);
    res.status(500).json({ error: 'Failed to create timeline event.' });
  }
});

// PUT /api/about/timeline/:id
router.put('/timeline/:id', async (req, res) => {
  try {
    const { year, title, description, order } = req.body;
    const event = await prisma.timelineEvent.update({
      where: { id: parseInt(req.params.id) },
      data: { year, title, description, order: parseInt(order) || 0 }
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update timeline event.' });
  }
});

// DELETE /api/about/timeline/:id
router.delete('/timeline/:id', async (req, res) => {
  try {
    await prisma.timelineEvent.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Timeline event deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete timeline event.' });
  }
});

module.exports = router;
