const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { logActivity } = require('./activity');

// Create a new tag
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await db.query('INSERT INTO tags (name, user_id) VALUES (?, ?)', [name, req.user.id]);
    await logActivity(req.user.id, 'tag_created', `Created tag: ${name}`);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ message: 'Error creating tag' });
  }
});

// Get all tags for user
router.get('/', auth, async (req, res) => {
  try {
    const [tags] = await db.query('SELECT * FROM tags WHERE user_id = ?', [req.user.id]);
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Error fetching tags' });
  }
});

// Get tag by id
router.get('/:id', auth, async (req, res) => {
  try {
    const [tags] = await db.query('SELECT * FROM tags WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (tags.length === 0) return res.status(404).json({ message: 'Tag not found' });
    res.json(tags[0]);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ message: 'Error fetching tag' });
  }
});

// Update tag
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE tags SET name = ? WHERE id = ? AND user_id = ?', [name, req.params.id, req.user.id]);
    res.json({ id: req.params.id, name });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ message: 'Error updating tag' });
  }
});

// Delete tag
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM tags WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ message: 'Error deleting tag' });
  }
});

module.exports = router; 