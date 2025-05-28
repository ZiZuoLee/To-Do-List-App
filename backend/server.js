const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const { setSocketIO } = require('./utils/notifications');
const http = require('http');
const { Server } = require('socket.io');
const auth = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] } });
setSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const adminRoutes = require('./routes/admin');
const teamRoutes = require('./routes/teams');
const tagRoutes = require('./routes/tags');
const commentRoutes = require('./routes/comments');
const checklistRoutes = require('./routes/checklists');
const attachmentRoutes = require('./routes/attachments');
const reminderRoutes = require('./routes/reminders');
const { router: activityRoutes } = require('./routes/activity');
const sharingRoutes = require('./routes/sharing');
const customFieldRoutes = require('./routes/customFields');
const auditRoutes = require('./routes/audit');
const settingsRoutes = require('./routes/settings');
const notificationsRoutes = require('./routes/notifications');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/custom-fields', customFieldRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Todo App API' });
});

// Help page route (for direct navigation or SEO)
app.get('/help', (req, res) => {
  // If serving static frontend, you might want to serve index.html
  // For now, redirect to frontend route
  res.redirect('http://localhost:3000/help');
});

// Socket.IO for team chat and notifications
io.use(async (socket, next) => {
  // Simple token auth (expects token in query)
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const user = await require('./middleware/auth').verifyToken(token);
    socket.user = user;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  // Join user room for notifications
  socket.join(`user_${socket.user.id}`);

  // Join team room
  socket.on('joinTeam', async (teamId) => {
    // Check if user is a member
    const [rows] = await db.query('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, socket.user.id]);
    if (rows.length === 0) return;
    socket.join(`team_${teamId}`);
  });

  // Send message
  socket.on('sendMessage', async ({ teamId, content }) => {
    // Check if user is a member
    const [rows] = await db.query('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, socket.user.id]);
    if (rows.length === 0) return;
    const [result] = await db.query('INSERT INTO team_messages (team_id, user_id, content) VALUES (?, ?, ?)', [teamId, socket.user.id, content]);
    // Join users table to get username
    const [msgRows] = await db.query('SELECT m.*, u.username FROM team_messages m JOIN users u ON m.user_id = u.id WHERE m.id = ?', [result.insertId]);
    io.to(`team_${teamId}`).emit('newMessage', msgRows[0]);
  });

  // Pin/unpin message (leader only)
  socket.on('pinMessage', async ({ teamId, messageId, pin }) => {
    // Check if user is leader
    const [teams] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [teamId]);
    if (!teams[0] || teams[0].leader_id !== socket.user.id) return;
    await db.query('UPDATE team_messages SET is_pinned = ? WHERE id = ?', [!!pin, messageId]);
    const [msgRows] = await db.query('SELECT * FROM team_messages WHERE id = ?', [messageId]);
    io.to(`team_${teamId}`).emit('messagePinned', msgRows[0]);
  });
});

// Helper to emit a notification to a user
function emitNotification(userId, notification) {
  io.to(`user_${userId}`).emit('notification', notification);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server, io, emitNotification }; 