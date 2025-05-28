const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Helper to log activity
async function logActivity(userId, type, message, teamId = null, referenceId = null) {
  await db.query(
    'INSERT INTO activity_feed (user_id, team_id, activity_type, reference_id, message) VALUES (?, ?, ?, ?, ?)',
    [userId, teamId, type, referenceId, message]
  );
}

// Get all activities for a user
router.get('/user', auth, async (req, res) => {
  try {
    const [activities] = await db.query('SELECT * FROM activity_feed WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ message: 'Error fetching user activities' });
  }
});

// Get all activities for a team
router.get('/team/:team_id', auth, async (req, res) => {
  try {
    const [activities] = await db.query('SELECT * FROM activity_feed WHERE team_id = ? ORDER BY created_at DESC', [req.params.team_id]);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching team activities:', error);
    res.status(500).json({ message: 'Error fetching team activities' });
  }
});

// Get recent activity for user or their teams
router.get('/', auth, async (req, res) => {
  try {
    // Get user's teams
    const [teams] = await db.query('SELECT team_id FROM team_members WHERE user_id = ?', [req.user.id]);
    const teamIds = teams.map(t => t.team_id);
    const [activity] = await db.query(
      `SELECT * FROM activity_feed WHERE user_id = ? OR (team_id IS NOT NULL AND team_id IN (?)) ORDER BY created_at DESC LIMIT 50`,
      [req.user.id, teamIds.length ? teamIds : [0]]
    );
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Error fetching activity' });
  }
});

module.exports = { router, logActivity }; 