const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

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

// POST /api/testimonials
router.post('/', auth, async (req, res) => {
  try {
    const { name, event, quote, rating, featured } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        event,
        quote,
        rating: parseInt(rating) || 5,
        featured: featured || false
      }
    });
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to create testimonial.' });
  }
});

// PUT /api/testimonials/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, event, quote, rating, featured } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(req.params.id) },
      data: { name, event, quote, rating: parseInt(rating) || 5, featured }
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
