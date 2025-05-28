const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { logActivity } = require('./activity');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { emitNotification } = require('../utils/notifications');

// Create a new team
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    // Create team with leader_id as creator
    const [result] = await db.query('INSERT INTO teams (name, leader_id) VALUES (?, ?)', [name, req.user.id]);
    const teamId = result.insertId;
    // Add creator as first member
    await db.query('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [teamId, req.user.id]);
    await logActivity(req.user.id, 'team_created', `Created team: ${name}`, teamId);
    await createAndEmitNotification(req.user.id, 'team_created', `Created team: ${name}`);
    res.status(201).json({ id: teamId, name, leader_id: req.user.id });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Error creating team' });
  }
});

// Get all teams
router.get('/', auth, async (req, res) => {
  try {
    const [teams] = await db.query('SELECT * FROM teams');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

// Middleware: Only team members can access
async function requireTeamMember(req, res, next) {
  const teamId = req.params.id || req.params.team_id;
  const [rows] = await db.query('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, req.user.id]);
  if (rows.length === 0) return res.status(403).json({ message: 'Not a team member' });
  next();
}

// Middleware: Only leader can access
async function requireTeamLeader(req, res, next) {
  const teamId = req.params.id || req.params.team_id;
  const [teams] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [teamId]);
  if (!teams[0] || teams[0].leader_id !== req.user.id) return res.status(403).json({ message: 'Not the team leader' });
  next();
}

// Get team by id (members only)
router.get('/:id', auth, requireTeamMember, async (req, res) => {
  try {
    const [teams] = await db.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (teams.length === 0) return res.status(404).json({ message: 'Team not found' });
    const [members] = await db.query('SELECT u.id, u.username, u.email, tm.joined_at FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.team_id = ?', [req.params.id]);
    const team = teams[0];
    team.members = members;
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Error fetching team' });
  }
});

// Update team
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE teams SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ id: req.params.id, name });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Error updating team' });
  }
});

// Delete team
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM teams WHERE id = ?', [req.params.id]);
    res.json({ message: 'Team deleted' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Error deleting team' });
  }
});

// Join a team
router.post('/:team_id/join', auth, async (req, res) => {
  try {
    const teamId = req.params.team_id;
    const userId = req.user.id;
    // Check if already a member
    const [rows] = await db.query('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, userId]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Already a member of this team' });
    }
    await db.query('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [teamId, userId]);
    await logActivity(userId, 'team_joined', `Joined team: ${teamId}`, teamId);
    await createAndEmitNotification(userId, 'team_joined', `You joined the team: ${teamId}`);
    res.json({ message: 'Joined team successfully' });
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ message: 'Error joining team' });
  }
});

// Quit team
router.post('/:team_id/quit', auth, requireTeamMember, async (req, res) => {
  try {
    const teamId = req.params.team_id;
    // Check if user is leader
    const [teams] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [teamId]);
    const isLeader = teams[0] && teams[0].leader_id === req.user.id;
    // Remove user from team_members
    await db.query('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, req.user.id]);
    if (isLeader) {
      // Transfer leadership to earliest-joined member (excluding leader)
      const [members] = await db.query('SELECT user_id FROM team_members WHERE team_id = ? ORDER BY joined_at ASC LIMIT 1', [teamId]);
      const newLeaderId = members[0] ? members[0].user_id : null;
      await db.query('UPDATE teams SET leader_id = ? WHERE id = ?', [newLeaderId, teamId]);
    }
    res.json({ message: 'Quit team successfully' });
  } catch (error) {
    console.error('Error quitting team:', error);
    res.status(500).json({ message: 'Error quitting team' });
  }
});

// Kick member (leader only)
router.post('/:team_id/kick', auth, requireTeamLeader, async (req, res) => {
  try {
    const { user_id } = req.body;
    // Prevent leader from kicking themselves
    const [teams] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [req.params.team_id]);
    if (teams[0].leader_id === user_id) return res.status(400).json({ message: 'Leader cannot kick themselves' });
    await db.query('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [req.params.team_id, user_id]);
    res.json({ message: 'Member kicked successfully' });
  } catch (error) {
    console.error('Error kicking member:', error);
    res.status(500).json({ message: 'Error kicking member' });
  }
});

// Check if user is leader
router.get('/:team_id/is-leader', auth, requireTeamMember, async (req, res) => {
  try {
    const [teams] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [req.params.team_id]);
    res.json({ isLeader: teams[0] && teams[0].leader_id === req.user.id });
  } catch (error) {
    res.json({ isLeader: false });
  }
});

// Get team chat history (members only)
router.get('/:team_id/messages', auth, requireTeamMember, async (req, res) => {
  try {
    const [messages] = await db.query(
      'SELECT m.*, u.username FROM team_messages m JOIN users u ON m.user_id = u.id WHERE m.team_id = ? ORDER BY m.created_at ASC',
      [req.params.team_id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Set up multer storage for chat attachments
const chatUploadDir = path.join(__dirname, '../uploads/team_chat');
if (!fs.existsSync(chatUploadDir)) fs.mkdirSync(chatUploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, chatUploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Upload chat attachment
router.post('/:team_id/chat-attachments', auth, requireTeamMember, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `/uploads/team_chat/${req.file.filename}`;
  res.json({ url });
});

// Helper to create and emit a notification
async function createAndEmitNotification(userId, type, message) {
  const [result] = await db.query('INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)', [userId, type, message]);
  const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  if (rows[0]) emitNotification(userId, rows[0]);
}

module.exports = router; 