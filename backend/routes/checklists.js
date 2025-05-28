const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Create a new checklist item
router.post('/', auth, async (req, res) => {
  try {
    const { todo_id, description, position } = req.body;
    const [result] = await db.query('INSERT INTO checklist_items (todo_id, description, position) VALUES (?, ?, ?)', [todo_id, description, position || 0]);
    res.status(201).json({ id: result.insertId, todo_id, description, position: position || 0 });
  } catch (error) {
    console.error('Error creating checklist item:', error);
    res.status(500).json({ message: 'Error creating checklist item' });
  }
});

// Get all checklist items for a todo
router.get('/todo/:todo_id', auth, async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM checklist_items WHERE todo_id = ? ORDER BY position ASC', [req.params.todo_id]);
    res.json(items);
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    res.status(500).json({ message: 'Error fetching checklist items' });
  }
});

// Update checklist item
router.put('/:id', auth, async (req, res) => {
  try {
    const { description, is_completed, position } = req.body;
    await db.query('UPDATE checklist_items SET description = ?, is_completed = ?, position = ? WHERE id = ?', [description, is_completed, position, req.params.id]);
    res.json({ id: req.params.id, description, is_completed, position });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ message: 'Error updating checklist item' });
  }
});

// Delete checklist item
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM checklist_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Checklist item deleted' });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    res.status(500).json({ message: 'Error deleting checklist item' });
  }
});

module.exports = router; 