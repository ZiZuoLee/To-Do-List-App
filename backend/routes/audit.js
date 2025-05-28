const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all audit logs for a user
router.get('/', auth, async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM audit_log WHERE user_id = ? ORDER BY timestamp DESC', [req.user.id]);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

// Add a new audit log entry
router.post('/', auth, async (req, res) => {
  try {
    const { entity_type, entity_id, action, old_value, new_value } = req.body;
    const [result] = await db.query('INSERT INTO audit_log (entity_type, entity_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)', [entity_type, entity_id, req.user.id, action, old_value, new_value]);
    res.status(201).json({ id: result.insertId, entity_type, entity_id, user_id: req.user.id, action, old_value, new_value });
  } catch (error) {
    console.error('Error adding audit log:', error);
    res.status(500).json({ message: 'Error adding audit log' });
  }
});

module.exports = router; 