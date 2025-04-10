const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get all todos for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const [todos] = await db.query(
      `SELECT * FROM todos 
       WHERE user_id = ? 
       ORDER BY 
         is_pinned DESC,
         CASE 
           WHEN deadline IS NULL THEN 1
           ELSE 0
         END,
         deadline ASC,
         created_at DESC`,
      [req.user.id]
    );
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

// Create a new todo
router.post('/', auth, async (req, res) => {
  const { title, subtitles, deadline, location, notes } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO todos (user_id, title, subtitles, deadline, location, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, JSON.stringify(subtitles), deadline ? new Date(deadline).toISOString().slice(0, 19).replace('T', ' ') : null, location, notes]
    );

    const [newTodo] = await db.query(
      'SELECT * FROM todos WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newTodo[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Error creating todo' });
  }
});

// Update a todo
router.put('/:id', auth, async (req, res) => {
  const { title, subtitles, deadline, location, notes, is_completed, is_pinned } = req.body;
  
  try {
    await db.query(
      'UPDATE todos SET title = ?, subtitles = ?, deadline = ?, location = ?, notes = ?, is_completed = ?, is_pinned = ? WHERE id = ? AND user_id = ?',
      [
        title,
        JSON.stringify(subtitles),
        deadline ? new Date(deadline).toISOString().slice(0, 19).replace('T', ' ') : null,
        location,
        notes,
        is_completed,
        is_pinned,
        req.params.id,
        req.user.id
      ]
    );

    const [updatedTodo] = await db.query(
      'SELECT * FROM todos WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedTodo[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Error updating todo' });
  }
});

// Delete a todo
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

module.exports = router; 