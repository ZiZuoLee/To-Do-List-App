const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all settings for user
router.get('/', auth, async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Error fetching user settings' });
  }
});

// Set or update a setting
router.post('/', auth, async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;
    await db.query('REPLACE INTO user_settings (user_id, setting_key, setting_value) VALUES (?, ?, ?)', [req.user.id, setting_key, setting_value]);
    res.status(201).json({ setting_key, setting_value });
  } catch (error) {
    console.error('Error setting user setting:', error);
    res.status(500).json({ message: 'Error setting user setting' });
  }
});

// Delete a setting
router.delete('/:key', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM user_settings WHERE user_id = ? AND setting_key = ?', [req.user.id, req.params.key]);
    res.json({ message: 'Setting deleted' });
  } catch (error) {
    console.error('Error deleting user setting:', error);
    res.status(500).json({ message: 'Error deleting user setting' });
  }
});

module.exports = router; 