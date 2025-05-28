const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Share a todo with a user
router.post('/', auth, async (req, res) => {
  try {
    const { todo_id, user_id, permission_level } = req.body;
    await db.query('INSERT INTO shared_tasks (todo_id, user_id, permission_level) VALUES (?, ?, ?)', [todo_id, user_id, permission_level]);
    res.status(201).json({ todo_id, user_id, permission_level });
  } catch (error) {
    console.error('Error sharing todo:', error);
    res.status(500).json({ message: 'Error sharing todo' });
  }
});

// Get all todos shared with the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const [shared] = await db.query('SELECT * FROM shared_tasks WHERE user_id = ?', [req.user.id]);
    res.json(shared);
  } catch (error) {
    console.error('Error fetching shared todos:', error);
    res.status(500).json({ message: 'Error fetching shared todos' });
  }
});

// Update sharing permission
router.put('/', auth, async (req, res) => {
  try {
    const { todo_id, user_id, permission_level } = req.body;
    await db.query('UPDATE shared_tasks SET permission_level = ? WHERE todo_id = ? AND user_id = ?', [permission_level, todo_id, user_id]);
    res.json({ todo_id, user_id, permission_level });
  } catch (error) {
    console.error('Error updating sharing permission:', error);
    res.status(500).json({ message: 'Error updating sharing permission' });
  }
});

// Remove sharing
router.delete('/', auth, async (req, res) => {
  try {
    const { todo_id, user_id } = req.body;
    await db.query('DELETE FROM shared_tasks WHERE todo_id = ? AND user_id = ?', [todo_id, user_id]);
    res.json({ message: 'Sharing removed' });
  } catch (error) {
    console.error('Error removing sharing:', error);
    res.status(500).json({ message: 'Error removing sharing' });
  }
});

module.exports = router; 