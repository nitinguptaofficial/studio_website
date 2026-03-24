const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendAdminNotification, sendUserConfirmation } = require('./emailService');

const prisma = new PrismaClient();

// POST /api/contacts - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const contact = await prisma.contact.create({
      data: { name, email, phone, service, message }
    });

    // Send emails (non-blocking — don't fail the request if emails fail)
    const contactData = { name, email, phone, service, message };
    
    Promise.all([
      sendAdminNotification(contactData),
      sendUserConfirmation(contactData)
    ]).then(() => {
      console.log('Contact emails sent successfully for:', name);
    }).catch((emailError) => {
      console.error('Failed to send contact emails:', emailError.message);
    });

    res.status(201).json({ message: 'Thank you! We will get back to you soon.', contact });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Failed to submit contact form.' });
  }
});

// GET /api/contacts - List all contacts (admin)
router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (error) {
    console.error('Fetch contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

// PATCH /api/contacts/:id/read - Mark as read
router.patch('/:id/read', async (req, res) => {
  try {
    const contact = await prisma.contact.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true }
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact.' });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.contact.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Contact deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact.' });
  }
});

module.exports = router;
