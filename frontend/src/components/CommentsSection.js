import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import axios from 'axios';

const CommentsSection = ({ todoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`/api/comments/todo/${todoId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [todoId]);

  useEffect(() => {
    if (todoId) fetchComments();
  }, [todoId, fetchComments]);

  const handleAddComment = async () => {
    if (!newComment) return;
    try {
      await axios.post('/api/comments', { todo_id: todoId, content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">Comments</Typography>
      <List>
        {comments.map(comment => (
          <ListItem key={comment.id}>
            <ListItemText primary={comment.content} secondary={comment.created_at} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <TextField label="Add a comment" value={newComment} onChange={e => setNewComment(e.target.value)} fullWidth />
        <Button variant="contained" onClick={handleAddComment}>Post</Button>
      </Box>
    </Paper>
  );
};

export default CommentsSection; 