import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

const TeamSettings = ({ teamId }) => {
  const [team, setTeam] = useState(null);

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line
  }, [teamId]);

  const fetchTeam = async () => {
    const res = await axios.get(`/api/teams/${teamId}`);
    setTeam(res.data);
  };

  if (!team) return null;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Team Settings</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography><b>Team Name:</b> {team.name}</Typography>
        <Typography><b>Leader:</b> {team.members.find(m => m.id === team.leader_id)?.username || team.leader_id}</Typography>
        <Typography><b>Created At:</b> {new Date(team.created_at).toLocaleString()}</Typography>
      </Box>
    </Paper>
  );
};

export default TeamSettings; 