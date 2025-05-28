import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Grid, Card, CardContent, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tags');
      setTags(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error fetching tags', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag) return;
    setLoading(true);
    try {
      await axios.post('/api/tags', { name: newTag });
      setNewTag('');
      fetchTags();
      setSnackbar({ open: true, message: 'Tag created', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error creating tag', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined" sx={{ mr: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h5" gutterBottom fontWeight={700}>Tags</Typography>
      </Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="New Tag" value={newTag} onChange={e => setNewTag(e.target.value)} />
          <Button variant="contained" onClick={handleCreateTag}>Create</Button>
        </Box>
      </Paper>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tags.map(tag => (
            <Grid item xs={12} sm={6} md={4} key={tag.id}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>{tag.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert elevation={6} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tags; 