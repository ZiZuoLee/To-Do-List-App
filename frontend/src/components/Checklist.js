import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, Button, Checkbox, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const Checklist = ({ todoId }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(`/api/checklists/todo/${todoId}`);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching checklist items:', err);
    }
  }, [todoId]);

  useEffect(() => {
    if (todoId) fetchItems();
  }, [todoId, fetchItems]);

  const handleAddItem = async () => {
    if (!newItem) return;
    try {
      await axios.post('/api/checklists', { todo_id: todoId, description: newItem });
      setNewItem('');
      fetchItems();
    } catch (err) {
      console.error('Error adding checklist item:', err);
    }
  };

  const handleToggleComplete = async (item) => {
    try {
      await axios.put(`/api/checklists/${item.id}`, { ...item, is_completed: !item.is_completed });
      fetchItems();
    } catch (err) {
      console.error('Error updating checklist item:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`/api/checklists/${id}`);
      fetchItems();
    } catch (err) {
      console.error('Error deleting checklist item:', err);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">Checklist</Typography>
      <List>
        {items.map(item => (
          <ListItem key={item.id} secondaryAction={
            <IconButton edge="end" onClick={() => handleDeleteItem(item.id)}><DeleteIcon /></IconButton>
          }>
            <Checkbox checked={!!item.is_completed} onChange={() => handleToggleComplete(item)} />
            <ListItemText primary={item.description} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <TextField label="Add item" value={newItem} onChange={e => setNewItem(e.target.value)} fullWidth />
        <Button variant="contained" onClick={handleAddItem}>Add</Button>
      </Box>
    </Paper>
  );
};

export default Checklist; 