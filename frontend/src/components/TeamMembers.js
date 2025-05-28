import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, IconButton, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

const TeamMembers = ({ teamId }) => {
  const [members, setMembers] = useState([]);
  const [leaderId, setLeaderId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [disbandDialogOpen, setDisbandDialogOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
    const userData = localStorage.getItem('user');
    if (userData) setUserId(JSON.parse(userData).id);
    axios.get(`/api/teams/${teamId}/is-leader`).then(res => setIsLeader(res.data.isLeader));
    // eslint-disable-next-line
  }, [teamId]);

  const fetchMembers = async () => {
    const res = await axios.get(`/api/teams/${teamId}`);
    setMembers(res.data.members);
    setLeaderId(res.data.leader_id);
  };

  const handleKick = async (id) => {
    await axios.post(`/api/teams/${teamId}/kick`, { user_id: id });
    fetchMembers();
  };

  const handleQuit = async () => {
    await axios.post(`/api/teams/${teamId}/quit`);
    window.location.href = '/teams';
  };

  const handleDisband = async () => {
    await axios.delete(`/api/teams/${teamId}`);
    window.location.href = '/teams';
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Team Members</Typography>
      <List>
        {members.map(member => (
          <ListItem key={member.id} secondaryAction={
            isLeader && member.id !== leaderId && (
              <IconButton edge="end" onClick={() => handleKick(member.id)}><DeleteIcon /></IconButton>
            )
          }>
            <Avatar src={member.avatar} alt={member.username || member.email || 'User'} sx={{ mr: 2, width: 36, height: 36 }} />
            <ListItemText
              primary={member.username || member.email}
              secondary={member.id === leaderId ? 'Leader' : ''}
            />
          </ListItem>
        ))}
      </List>
      {isLeader && members.length === 1 ? (
        <Button variant="contained" color="error" sx={{ mt: 2 }} onClick={() => setDisbandDialogOpen(true)}>
          Disband Team
        </Button>
      ) : (
        <Button variant="outlined" color="error" onClick={handleQuit} sx={{ mt: 2 }}>Quit Team</Button>
      )}
      <Dialog open={disbandDialogOpen} onClose={() => setDisbandDialogOpen(false)}>
        <DialogTitle>Disband Team</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disband this team? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisbandDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDisband}>Disband</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TeamMembers; 