const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');
const { logActivity } = require('./activity');
const { emitNotification } = require('../utils/notifications');

// Get all todos for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const [todos] = await db.query(
      `SELECT t.*, GROUP_CONCAT(CONCAT(tags.id, ':', tags.name) SEPARATOR ',') as tags
       FROM todos t
       LEFT JOIN todo_tags tt ON t.id = tt.todo_id
       LEFT JOIN tags ON tt.tag_id = tags.id
       WHERE t.user_id = ?
       GROUP BY t.id
       ORDER BY 
         t.is_pinned DESC,
         CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
         t.due_date ASC,
         t.created_at DESC`,
      [req.user.id]
    );
    // Parse tags into array
    const todosWithTags = todos.map(todo => ({
      ...todo,
      tags: todo.tags
        ? todo.tags.split(',').filter(Boolean).map(tagStr => {
            const [id, name] = tagStr.split(':');
            return { id: Number(id), name };
          })
        : [],
    }));
    res.json(todosWithTags);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

// Create a new todo
router.post('/', auth, async (req, res) => {
  try {
    let { title, subtitle, subtitles, priority, due_date, is_archived, recurrence_rule, team_id, tag_ids, location, notes, is_completed, is_pinned } = req.body;
    // Support both 'subtitle' (string) and 'subtitles' (array)
    if (Array.isArray(subtitles)) {
      subtitle = subtitles.join('||'); // Store as delimited string if DB only supports one field
    }
    // Fix due_date format
    if (due_date && typeof due_date === 'string' && due_date.includes('T')) {
      due_date = due_date.split('T')[0];
    }
    const [result] = await db.query(
      `INSERT INTO todos (title, subtitle, user_id, priority, due_date, is_archived, recurrence_rule, location, notes, is_completed, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle, req.user.id, priority || 'Medium', due_date, is_archived || false, recurrence_rule, location, notes, is_completed || false, is_pinned || false]
    );
    const todoId = result.insertId;
    // Add tags if provided
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await db.query('INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)', [todoId, tagId]);
      }
      // Example: notify users if todo is assigned (if you have assignment logic)
      // For now, just notify the creator
      await createAndEmitNotification(req.user.id, 'todo_created', `Created todo: ${title}`);
    } else {
      await createAndEmitNotification(req.user.id, 'todo_created', `Created todo: ${title}`);
    }
    // Add to team if provided
    if (team_id) {
      await db.query('INSERT INTO team_todos (team_id, todo_id) VALUES (?, ?)', [team_id, todoId]);
    }
    // Fetch the full todo as returned by GET
    const [todos] = await db.query(
      `SELECT t.*, GROUP_CONCAT(CONCAT(tags.id, ':', tags.name) SEPARATOR ',') as tags
       FROM todos t
       LEFT JOIN todo_tags tt ON t.id = tt.todo_id
       LEFT JOIN tags ON tt.tag_id = tags.id
       WHERE t.id = ?
       GROUP BY t.id`,
      [todoId]
    );
    if (!todos[0]) return res.status(500).json({ message: 'Todo not found after creation' });
    const todo = todos[0];
    // Parse tags into array
    todo.tags = todo.tags
      ? todo.tags.split(',').filter(Boolean).map(tagStr => {
          const [id, name] = tagStr.split(':');
          return { id: Number(id), name };
        })
      : [];
    // Parse subtitles if stored as delimited string
    todo.subtitles = todo.subtitle ? todo.subtitle.split('||') : [];
    await logActivity(req.user.id, 'todo_created', `Created todo: ${title}`, null, todoId);
    // Add audit log on create
    await db.query('INSERT INTO audit_log (entity_type, entity_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)', [
      'todo', todoId, req.user.id, 'create', null, JSON.stringify(todo)
    ]);
    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Error creating todo' });
  }
});

// Update a todo
router.put('/:id', auth, async (req, res) => {
  try {
    let { title, subtitle, priority, due_date, is_archived, recurrence_rule, tag_ids, is_pinned, is_completed } = req.body;
    // Fix due_date format
    if (due_date && typeof due_date === 'string' && due_date.includes('T')) {
      due_date = due_date.split('T')[0];
    }
    await db.query(
      `UPDATE todos SET title = ?, subtitle = ?, priority = ?, due_date = ?, is_archived = ?, recurrence_rule = ?, is_pinned = ?, is_completed = ? WHERE id = ? AND user_id = ?`,
      [title, subtitle, priority, due_date, is_archived, recurrence_rule, is_pinned, is_completed, req.params.id, req.user.id]
    );
    // Update tags if provided
    if (Array.isArray(tag_ids)) {
      await db.query('DELETE FROM todo_tags WHERE todo_id = ?', [req.params.id]);
      for (const tagId of tag_ids) {
        await db.query('INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)', [req.params.id, tagId]);
      }
    }
    if (typeof is_completed !== 'undefined' && is_completed) {
      await logActivity(req.user.id, 'todo_completed', `Completed todo: ${title}`, null, req.params.id);
    }
    // Fetch old todo
    const [oldTodos] = await db.query('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    const oldTodo = oldTodos[0];
    res.json({ id: req.params.id, title, subtitle, priority, due_date, is_archived, recurrence_rule, is_pinned, is_completed });
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
    await logActivity(req.user.id, 'todo_deleted', `Deleted todo: ${req.params.id}`, null, req.params.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

// Get todos by tag
router.get('/tag/:tag_id', auth, async (req, res) => {
  try {
    const [todos] = await db.query(
      `SELECT t.* FROM todos t
       JOIN todo_tags tt ON t.id = tt.todo_id
       WHERE tt.tag_id = ? AND t.user_id = ?`,
      [req.params.tag_id, req.user.id]
    );
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos by tag:', error);
    res.status(500).json({ message: 'Error fetching todos by tag' });
  }
});

// Get todos by team
router.get('/team/:team_id', auth, async (req, res) => {
  try {
    const [todos] = await db.query(
      `SELECT t.* FROM todos t
       JOIN team_todos tt ON t.id = tt.todo_id
       WHERE tt.team_id = ?`,
      [req.params.team_id]
    );
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos by team:', error);
    res.status(500).json({ message: 'Error fetching todos by team' });
  }
});

// Get todos shared with the user
router.get('/shared', auth, async (req, res) => {
  try {
    const [todos] = await db.query(
      `SELECT t.* FROM todos t
       JOIN shared_tasks st ON t.id = st.todo_id
       WHERE st.user_id = ?`,
      [req.user.id]
    );
    res.json(todos);
  } catch (error) {
    console.error('Error fetching shared todos:', error);
    res.status(500).json({ message: 'Error fetching shared todos' });
  }
});

// Helper to create and emit a notification
async function createAndEmitNotification(userId, type, message) {
  const [result] = await db.query('INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)', [userId, type, message]);
  const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  if (rows[0]) emitNotification(userId, rows[0]);
}

module.exports = router; 