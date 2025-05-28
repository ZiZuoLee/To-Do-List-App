import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, IconButton, Avatar } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';
import { io } from 'socket.io-client';

const TeamChat = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch user info (from localStorage or API)
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    // Fetch chat history
    fetchMessages();
    // Check if leader
    axios.get(`/api/teams/${teamId}/is-leader`).then(res => setIsLeader(res.data.isLeader));

    // Debug: print the token
    const token = localStorage.getItem('token');
    console.log('Socket token:', token);

    // Set up socket
    const socket = io('http://localhost:5000', {
      autoConnect: false,
      auth: { token }
    });
    socketRef.current = socket;
    socket.connect();
    socket.emit('joinTeam', teamId);
    socket.on('newMessage', msg => setMessages(msgs => [...msgs, msg]));
    socket.on('messagePinned', msg => setMessages(msgs => msgs.map(m => m.id === msg.id ? msg : m)));
    // Debug: log connection errors
    socket.on('connect_error', (err) => {
      console.error('Socket.IO connect error:', err.message);
    });

    return () => {
      socket.off('newMessage');
      socket.off('messagePinned');
      socket.off('connect_error');
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [teamId]);

  const fetchMessages = async () => {
    const res = await axios.get(`/api/teams/${teamId}/messages`);
    setMessages(res.data);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { teamId, content: input });
    }
    setInput('');
  };

  const handlePin = (msg) => {
    if (socketRef.current) {
      socketRef.current.emit('pinMessage', { teamId, messageId: msg.id, pin: !msg.is_pinned });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`/api/teams/${teamId}/chat-attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Send a chat message with the file URL
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', { teamId, content: res.data.url, isAttachment: true, fileType: file.type, fileName: file.name });
      }
    } catch (err) {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pinned = messages.filter(m => m.is_pinned);
  const normal = messages.filter(m => !m.is_pinned);

  // Helper to check if message is from current user
  const isOwnMessage = (msg) => user && (msg.user_id === user.id);

  const filteredMessages = normal.filter(msg => {
    const searchText = search.toLowerCase();
    return (
      (msg.username || '').toLowerCase().includes(searchText) ||
      (msg.content || '').toLowerCase().includes(searchText)
    );
  });

  return (
    <Paper sx={{ p: 2, bgcolor: '#f4f7fb', borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>Team Chat</Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          label="Search chat"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 320 }}
          inputProps={{ 'aria-label': 'Search chat' }}
        />
      </Box>
      {pinned.length > 0 && <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#b8860b', fontWeight: 600 }}>Pinned:</Typography>
        <List sx={{ bgcolor: '#fffbe6', borderRadius: 2, boxShadow: 1 }}>
          {pinned.map(msg => (
            <ListItem key={msg.id} alignItems="flex-start" sx={{
              bgcolor: '#fffbe6',
              borderLeft: '4px solid #ffd700',
              mb: 1,
              borderRadius: 2,
              boxShadow: 1
            }}>
              <Avatar src={msg.avatar} alt={msg.username || 'User'} sx={{ mr: 1, width: 36, height: 36 }} />
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#b8860b', mr: 1 }}>
                    {msg.username || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(msg.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{
                  bgcolor: isOwnMessage(msg) ? '#e3f2fd' : '#fffbe6',
                  p: 1.2,
                  borderRadius: 2,
                  fontSize: 16,
                  fontWeight: 500,
                  color: '#333',
                  boxShadow: 1
                }}>{msg.content}</Box>
              </Box>
              {isLeader && <IconButton onClick={() => handlePin(msg)}><PushPinIcon color={msg.is_pinned ? 'primary' : 'inherit'} /></IconButton>}
            </ListItem>
          ))}
        </List>
      </Box>}
      <List sx={{ maxHeight: 400, overflowY: 'auto', bgcolor: '#f4f7fb', borderRadius: 2, p: 1 }}>
        {filteredMessages.map(msg => (
          <ListItem key={msg.id} alignItems="flex-start" sx={{
            justifyContent: isOwnMessage(msg) ? 'flex-end' : 'flex-start',
            mb: 1,
            px: 0
          }}>
            {!isOwnMessage(msg) && <Avatar src={msg.avatar} alt={msg.username || 'User'} sx={{ mr: 1, width: 32, height: 32, alignSelf: 'flex-start' }} />}
            <Box sx={{
              maxWidth: '80%',
              ml: isOwnMessage(msg) ? 'auto' : 0,
              mr: isOwnMessage(msg) ? 0 : 'auto',
              width: 'fit-content',
              bgcolor: isOwnMessage(msg) ? '#e3f2fd' : '#fff',
              borderRadius: 2,
              boxShadow: 1,
              p: 1.2,
              position: 'relative',
              border: isOwnMessage(msg) ? '1px solid #90caf9' : '1px solid #e0e0e0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isOwnMessage(msg) ? '#1976d2' : '#888', mr: 1 }}>
                  {msg.username || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(msg.created_at).toLocaleString()}
                </Typography>
              </Box>
              {msg.isAttachment && msg.fileType && msg.fileType.startsWith('image') ? (
                <img src={msg.content} alt={msg.fileName || 'attachment'} style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, marginTop: 8 }} />
              ) : msg.isAttachment && msg.content ? (
                <a href={msg.content} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 8 }}>
                  {msg.fileName || 'Download file'}
                </a>
              ) : (
                <Typography variant="body1" sx={{ color: '#333', fontSize: 16, fontWeight: 500 }}>{msg.content}</Typography>
              )}
              {isLeader && <IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4 }} onClick={() => handlePin(msg)}><PushPinIcon fontSize="small" color={msg.is_pinned ? 'primary' : 'inherit'} /></IconButton>}
            </Box>
            {isOwnMessage(msg) && <Avatar src={msg.avatar} alt={msg.username || 'User'} sx={{ ml: 1, width: 32, height: 32, alignSelf: 'flex-start' }} />}
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <input
          type="file"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.txt,.zip,.rar,.7z,.csv"
        />
        <IconButton component="span" onClick={() => fileInputRef.current.click()} disabled={uploading} sx={{ bgcolor: uploading ? '#eee' : 'inherit' }}>
          <AttachFileIcon />
        </IconButton>
        <TextField fullWidth value={input} onChange={e => setInput(e.target.value)} label="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSend()} sx={{ bgcolor: '#fff', borderRadius: 2 }} />
        <Button variant="contained" onClick={handleSend} sx={{ minWidth: 100, fontWeight: 700 }}>Send</Button>
      </Box>
    </Paper>
  );
};

export default TeamChat; 