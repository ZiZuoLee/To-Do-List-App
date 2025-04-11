const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0 || users[0].email !== 'admin@gmail.com') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        COALESCE(MAX(t.updated_at), u.created_at) as last_active,
        COUNT(t.id) as todo_count
      FROM users u
      LEFT JOIN todos t ON u.id = t.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router; 