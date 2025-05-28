const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Create a new custom field
router.post('/', auth, async (req, res) => {
  try {
    const { name, field_type } = req.body;
    const [result] = await db.query('INSERT INTO custom_fields (user_id, name, field_type) VALUES (?, ?, ?)', [req.user.id, name, field_type]);
    res.status(201).json({ id: result.insertId, name, field_type });
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ message: 'Error creating custom field' });
  }
});

// Get all custom fields for user
router.get('/', auth, async (req, res) => {
  try {
    const [fields] = await db.query('SELECT * FROM custom_fields WHERE user_id = ?', [req.user.id]);
    res.json(fields);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ message: 'Error fetching custom fields' });
  }
});

// Update custom field
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, field_type } = req.body;
    await db.query('UPDATE custom_fields SET name = ?, field_type = ? WHERE id = ? AND user_id = ?', [name, field_type, req.params.id, req.user.id]);
    res.json({ id: req.params.id, name, field_type });
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ message: 'Error updating custom field' });
  }
});

// Delete custom field
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM custom_fields WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Custom field deleted' });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ message: 'Error deleting custom field' });
  }
});

// Set value for a todo's custom field
router.post('/value', auth, async (req, res) => {
  try {
    const { todo_id, custom_field_id, value } = req.body;
    await db.query('REPLACE INTO todo_custom_field_values (todo_id, custom_field_id, value) VALUES (?, ?, ?)', [todo_id, custom_field_id, value]);
    res.status(201).json({ todo_id, custom_field_id, value });
  } catch (error) {
    console.error('Error setting custom field value:', error);
    res.status(500).json({ message: 'Error setting custom field value' });
  }
});

// Get all custom field values for a todo
router.get('/values/:todo_id', auth, async (req, res) => {
  try {
    const [values] = await db.query('SELECT * FROM todo_custom_field_values WHERE todo_id = ?', [req.params.todo_id]);
    res.json(values);
  } catch (error) {
    console.error('Error fetching custom field values:', error);
    res.status(500).json({ message: 'Error fetching custom field values' });
  }
});

// List custom fields for a todo
router.get('/:todoId', auth, async (req, res) => {
  const todoId = req.params.todoId;
  const [rows] = await db.query('SELECT * FROM todo_custom_fields WHERE todo_id = ?', [todoId]);
  res.json(rows);
});

// Add custom field for a todo
router.post('/:todoId', auth, async (req, res) => {
  const todoId = req.params.todoId;
  const { name, value } = req.body;
  await db.query('INSERT INTO todo_custom_fields (todo_id, name, value) VALUES (?, ?, ?)', [todoId, name, value]);
  res.json({ message: 'Custom field added' });
});

// Edit custom field
router.put('/:todoId/:fieldId', auth, async (req, res) => {
  const { todoId, fieldId } = req.params;
  const { name, value } = req.body;
  await db.query('UPDATE todo_custom_fields SET name = ?, value = ? WHERE id = ? AND todo_id = ?', [name, value, fieldId, todoId]);
  res.json({ message: 'Custom field updated' });
});

// Delete custom field
router.delete('/:todoId/:fieldId', auth, async (req, res) => {
  const { todoId, fieldId } = req.params;
  await db.query('DELETE FROM todo_custom_fields WHERE id = ? AND todo_id = ?', [fieldId, todoId]);
  res.json({ message: 'Custom field deleted' });
});

module.exports = router; 