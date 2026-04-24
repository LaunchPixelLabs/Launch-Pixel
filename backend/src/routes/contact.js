const express = require('express');
const pool = require('../db');

const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  try {
    await pool.execute(
      `INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, subject, message]
    );
    res.json({ success: true, message: "Message received. We'll get back to you within 24 hours." });
  } catch (err) {
    console.error('Contact DB insert error:', err);
    res.status(500).json({ success: false, message: 'Database error. Please try again.' });
  }
});

module.exports = router;
