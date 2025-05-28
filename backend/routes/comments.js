const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { emitNotification } = require('../utils/notifications');

// Create a new comment
router.post('/', auth, async (req, res) => {
  try {
    const { todo_id, content, parent_comment_id } = req.body;
    const [result] = await db.query('INSERT INTO comments (todo_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)', [todo_id, req.user.id, content, parent_comment_id || null]);
    res.status(201).json({ id: result.insertId, todo_id, user_id: req.user.id, content, parent_comment_id });

    // After saving the comment, check for mentions
    const mentionMatches = content.match(/@([a-zA-Z0-9_]+)/g);
    if (mentionMatches) {
      for (const mention of mentionMatches) {
        const username = mention.slice(1);
        const [[user]] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (user) {
          await createAndEmitNotification(user.id, 'mention', `You were mentioned in a comment: "${content}"`);
        }
      }
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
});

// Get all comments for a todo
router.get('/todo/:todo_id', auth, async (req, res) => {
  try {
    const [comments] = await db.query('SELECT * FROM comments WHERE todo_id = ?', [req.params.todo_id]);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Get comment by id
router.get('/:id', auth, async (req, res) => {
  try {
    const [comments] = await db.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (comments.length === 0) return res.status(404).json({ message: 'Comment not found' });
    res.json(comments[0]);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ message: 'Error fetching comment' });
  }
});

// Update comment
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    await db.query('UPDATE comments SET content = ? WHERE id = ? AND user_id = ?', [content, req.params.id, req.user.id]);
    res.json({ id: req.params.id, content });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM comments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

// Helper to create and emit a notification
async function createAndEmitNotification(userId, type, message) {
  const [result] = await db.query('INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)', [userId, type, message]);
  const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  if (rows[0]) emitNotification(userId, rows[0]);
}

module.exports = router; 