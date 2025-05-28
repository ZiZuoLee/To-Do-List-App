const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { emitNotification } = require('../utils/notifications');
const transporter = require('../config/email');

// Get all notifications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Helper to create and emit a notification
async function createAndEmitNotification(userId, type, message) {
  const [result] = await db.query('INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)', [userId, type, message]);
  const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  if (rows[0]) {
    emitNotification(userId, rows[0]);
    sendEmailNotification(userId, `New Notification: ${type.replace('_', ' ')}`, message);
  }
}

module.exports = router; 