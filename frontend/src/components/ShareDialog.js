import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import axios from 'axios';

const ShareDialog = ({ todoId, open, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [message, setMessage] = useState('');

  const handleShare = async () => {
    try {
      // Find user by email (mock: you may want to implement a real search)
      const res = await axios.get('/api/admin/users');
      const user = res.data.find(u => u.email === email);
      if (!user) {
        setMessage('User not found');
        return;
      }
      await axios.post('/api/sharing', { todo_id: todoId, user_id: user.id, permission_level: permission });
      setMessage('Shared successfully');
    } catch (err) {
      setMessage('Error sharing todo');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Share Todo</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="User Email" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField select label="Permission" value={permission} onChange={e => setPermission(e.target.value)}>
            <MenuItem value="read">Read</MenuItem>
            <MenuItem value="write">Write</MenuItem>
          </TextField>
          {message && <Typography color="primary">{message}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleShare} variant="contained">Share</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog; 