const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage for attachments
const uploadDir = path.join(__dirname, '../uploads/attachments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// List attachments for a todo
router.get('/:todoId', auth, async (req, res) => {
  const todoId = req.params.todoId;
  const [rows] = await db.query('SELECT * FROM attachments WHERE todo_id = ?', [todoId]);
  const result = rows.map(row => ({
    ...row,
    url: `/uploads/attachments/${row.file_name}`
  }));
  res.json(result);
});

// Upload attachment for a todo
router.post('/:todoId', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const todoId = req.params.todoId;
  await db.query('INSERT INTO attachments (todo_id, file_name, file_type) VALUES (?, ?, ?)', [todoId, req.file.filename, req.file.mimetype]);
  res.json({ url: `/uploads/attachments/${req.file.filename}`, file_name: req.file.originalname, file_type: req.file.mimetype });
});

// Delete attachment
router.delete('/:todoId/:attachmentId', auth, async (req, res) => {
  const { todoId, attachmentId } = req.params;
  const [rows] = await db.query('SELECT * FROM attachments WHERE id = ? AND todo_id = ?', [attachmentId, todoId]);
  if (!rows[0]) return res.status(404).json({ message: 'Attachment not found' });
  const filePath = path.join(uploadDir, rows[0].file_name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await db.query('DELETE FROM attachments WHERE id = ?', [attachmentId]);
  res.json({ message: 'Attachment deleted' });
});

module.exports = router; 