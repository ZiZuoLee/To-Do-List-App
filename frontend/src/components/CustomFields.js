import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const CustomFields = ({ todoId }) => {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ name: '', value: '' });

  useEffect(() => {
    fetchFields();
    // eslint-disable-next-line
  }, [todoId]);

  const fetchFields = async () => {
    if (!todoId) return;
    const res = await axios.get(`/api/custom-fields/${todoId}`);
    setFields(res.data);
  };

  const handleAdd = async () => {
    if (!newField.name.trim()) return;
    await axios.post(`/api/custom-fields/${todoId}`, newField);
    setNewField({ name: '', value: '' });
    fetchFields();
  };

  const handleEdit = async (id, name, value) => {
    await axios.put(`/api/custom-fields/${todoId}/${id}`, { name, value });
    fetchFields();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/custom-fields/${todoId}/${id}`);
    fetchFields();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Custom Fields</Typography>
      {fields.map(field => (
        <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            label="Name"
            value={field.name}
            onChange={e => handleEdit(field.id, e.target.value, field.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="Value"
            value={field.value}
            onChange={e => handleEdit(field.id, field.name, e.target.value)}
            sx={{ flex: 2 }}
          />
          <IconButton onClick={() => handleDelete(field.id)}><DeleteIcon /></IconButton>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField
          size="small"
          label="Name"
          value={newField.name}
          onChange={e => setNewField({ ...newField, name: e.target.value })}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          label="Value"
          value={newField.value}
          onChange={e => setNewField({ ...newField, value: e.target.value })}
          sx={{ flex: 2 }}
        />
        <Button variant="contained" onClick={handleAdd} startIcon={<AddIcon />}>Add</Button>
      </Box>
    </Box>
  );
};

export default CustomFields; 