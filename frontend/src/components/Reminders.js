import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, List, ListItem, ListItemText, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import axios from 'axios';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const Reminders = ({ todoId }) => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState(null);

  useEffect(() => {
    fetchReminders();
    // eslint-disable-next-line
  }, [todoId]);

  const fetchReminders = async () => {
    if (!todoId) return;
    const res = await axios.get(`/api/reminders/${todoId}`);
    setReminders(res.data);
  };

  const handleAdd = async () => {
    if (!newReminder) return;
    await axios.post(`/api/reminders/${todoId}`, { remind_at: newReminder.format('YYYY-MM-DD HH:mm:ss') });
    setNewReminder(null);
    fetchReminders();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/reminders/${todoId}/${id}`);
    fetchReminders();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Reminders</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <DateTimePicker
            label="Remind at"
            value={newReminder}
            onChange={setNewReminder}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <Button variant="contained" onClick={handleAdd} disabled={!newReminder}>Add</Button>
        </Box>
      </LocalizationProvider>
      <List>
        {reminders.map(rem => (
          <ListItem key={rem.id} secondaryAction={
            <IconButton edge="end" onClick={() => handleDelete(rem.id)}><DeleteIcon /></IconButton>
          }>
            <ListItemText
              primary={dayjs(rem.remind_at).format('YYYY-MM-DD HH:mm')}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Reminders; 