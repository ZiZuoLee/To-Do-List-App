import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Snackbar, Alert, List, ListItem, ListItemText, Button, TextField } from '@mui/material';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ActivityFeed = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/activity');
      setActivity(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error fetching activity', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredActivity = activity.filter(act => {
    const searchText = search.toLowerCase();
    return (
      (act.activity_type || '').toLowerCase().includes(searchText) ||
      (act.message || '').toLowerCase().includes(searchText)
    );
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined" sx={{ mr: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h5" gutterBottom fontWeight={700}>Activity Feed</Typography>
      </Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            label="Search activity"
            variant="outlined"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 320 }}
            inputProps={{ 'aria-label': 'Search activity' }}
          />
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {filteredActivity.map(act => (
              <ListItem key={act.id}>
                <ListItemText
                  primary={act.activity_type.replace('_', ' ').toUpperCase()}
                  secondary={<>
                    <Typography component="span">{act.message}</Typography><br/>
                    <Typography component="span" variant="caption" color="text.secondary">{new Date(act.created_at).toLocaleString()}</Typography>
                  </>}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert elevation={6} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ActivityFeed; 