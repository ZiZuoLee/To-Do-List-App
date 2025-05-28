import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const Attachments = ({ todoId }) => {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line
  }, [todoId]);

  const fetchAttachments = async () => {
    if (!todoId) return;
    const res = await axios.get(`/api/attachments/${todoId}`);
    setAttachments(res.data);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`/api/attachments/${todoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAttachments();
    } catch (err) {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/attachments/${todoId}/${id}`);
    fetchAttachments();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Attachments</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <input
          type="file"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.txt,.zip,.rar,.7z,.csv"
        />
        <IconButton component="span" onClick={() => fileInputRef.current.click()} disabled={uploading}>
          <AttachFileIcon />
        </IconButton>
        <Button variant="outlined" onClick={() => fileInputRef.current.click()} disabled={uploading}>
          Upload
        </Button>
      </Box>
      <List>
        {attachments.map(att => (
          <ListItem key={att.id} secondaryAction={
            <IconButton edge="end" onClick={() => handleDelete(att.id)}><DeleteIcon /></IconButton>
          }>
            {att.file_type && att.file_type.startsWith('image') ? (
              <img src={att.url} alt={att.file_name} style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, marginRight: 12 }} />
            ) : null}
            <ListItemText
              primary={<a href={att.url} target="_blank" rel="noopener noreferrer">{att.file_name}</a>}
              secondary={att.file_type}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Attachments; 