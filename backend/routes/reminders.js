const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { emitNotification } = require('../utils/notifications');

// Create a new reminder
router.post('/', auth, async (req, res) => {
  try {
    const { todo_id, remind_at, method } = req.body;
    const [result] = await db.query('INSERT INTO reminders (todo_id, remind_at, method) VALUES (?, ?, ?)', [todo_id, remind_at, method || 'email']);
    res.status(201).json({ id: result.insertId, todo_id, remind_at, method: method || 'email' });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Error creating reminder' });
  }
});

// Get all reminders for a todo
router.get('/todo/:todo_id', auth, async (req, res) => {
  try {
    const [reminders] = await db.query('SELECT * FROM reminders WHERE todo_id = ?', [req.params.todo_id]);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Error fetching reminders' });
  }
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const { remind_at, method, is_sent } = req.body;
    await db.query('UPDATE reminders SET remind_at = ?, method = ?, is_sent = ? WHERE id = ?', [remind_at, method, is_sent, req.params.id]);
    res.json({ id: req.params.id, remind_at, method, is_sent });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ message: 'Error updating reminder' });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM reminders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Error deleting reminder' });
  }
});

// List reminders for a todo
router.get('/:todoId', auth, async (req, res) => {
  const todoId = req.params.todoId;
  const [rows] = await db.query('SELECT * FROM reminders WHERE todo_id = ?', [todoId]);
  res.json(rows);
});

// Add reminder for a todo
router.post('/:todoId', auth, async (req, res) => {
  const todoId = req.params.todoId;
  const { remind_at } = req.body;
  await db.query('INSERT INTO reminders (todo_id, remind_at) VALUES (?, ?)', [todoId, remind_at]);
  res.json({ message: 'Reminder added' });
});

// Delete reminder
router.delete('/:todoId/:reminderId', auth, async (req, res) => {
  const { todoId, reminderId } = req.params;
  await db.query('DELETE FROM reminders WHERE id = ? AND todo_id = ?', [reminderId, todoId]);
  res.json({ message: 'Reminder deleted' });
});

// Helper to create and emit a notification
async function createAndEmitNotification(userId, type, message) {
  const [result] = await db.query('INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)', [userId, type, message]);
  const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  if (rows[0]) emitNotification(userId, rows[0]);
}

module.exports = router; 