import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Grid, Card, CardContent, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [teamMembers, setTeamMembers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    teams.forEach(team => {
      fetchTeamMembers(team.id);
    });
  }, [teams]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/teams');
      setTeams(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error fetching teams', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      const res = await axios.get(`/api/teams/${teamId}`);
      setTeamMembers(prev => ({ ...prev, [teamId]: res.data.members || [] }));
    } catch (err) {
      setTeamMembers(prev => ({ ...prev, [teamId]: [] }));
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam) return;
    setLoading(true);
    try {
      await axios.post('/api/teams', { name: newTeam });
      setNewTeam('');
      fetchTeams();
      setSnackbar({ open: true, message: 'Team created', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error creating team', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId) => {
    setLoading(true);
    try {
      await axios.post(`/api/teams/${teamId}/join`);
      setSnackbar({ open: true, message: 'Joined team successfully', severity: 'success' });
      fetchTeams();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Error joining team', severity: 'error' });
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
        <Typography variant="h5" gutterBottom fontWeight={700}>Teams</Typography>
      </Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="New Team" value={newTeam} onChange={e => setNewTeam(e.target.value)} />
          <Button variant="contained" onClick={handleCreateTeam}>Create</Button>
        </Box>
      </Paper>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {teams.map(team => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>{team.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Members:</Typography>
                  {teamMembers[team.id] && teamMembers[team.id].length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {teamMembers[team.id].map(member => (
                        <li key={member.id}>{member.username || member.email || member.id}</li>
                      ))}
                    </ul>
                  ) : (
                    <Typography variant="caption" color="text.secondary">No members yet</Typography>
                  )}
                  <Button variant="outlined" onClick={() => handleJoinTeam(team.id)} sx={{ mt: 1 }}>Join</Button>
                  <Button variant="contained" color="primary" onClick={() => navigate(`/teams/${team.id}`)} sx={{ mt: 1, ml: 1 }}>Enter</Button>
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

export default Teams; 