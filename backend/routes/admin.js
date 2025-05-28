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
      SELECT u.id, u.username, u.email, GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users with roles:', error);
    res.status(500).json({ message: 'Error fetching users with roles' });
  }
});

// Assign a role to a user
router.post('/users/:id/roles', auth, isAdmin, async (req, res) => {
  try {
    const { role_id } = req.body;
    await db.query('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)', [req.params.id, role_id]);
    res.json({ message: 'Role assigned' });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ message: 'Error assigning role' });
  }
});

// Remove a role from a user
router.delete('/users/:id/roles/:role_id', auth, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [req.params.id, req.params.role_id]);
    res.json({ message: 'Role removed' });
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({ message: 'Error removing role' });
  }
});

// List all teams
router.get('/teams', auth, isAdmin, async (req, res) => {
  try {
    const [teams] = await db.query('SELECT * FROM teams');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

module.exports = router; 