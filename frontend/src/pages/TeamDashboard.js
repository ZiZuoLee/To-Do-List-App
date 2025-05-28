import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tabs, Tab, Paper, Button } from '@mui/material';
import TeamChat from '../components/TeamChat';
import TeamMembers from '../components/TeamMembers';
import TeamSettings from '../components/TeamSettings';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TeamDashboard = () => {
  const { teamId } = useParams();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined" sx={{ mr: 2 }}>
          Back to Dashboard
        </Button>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Chat" />
          <Tab label="Members" />
          <Tab label="Settings" />
        </Tabs>
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Chat" />
          <Tab label="Members" />
          <Tab label="Settings" />
        </Tabs>
      </Paper>
      {tab === 0 && <TeamChat teamId={teamId} />}
      {tab === 1 && <TeamMembers teamId={teamId} />}
      {tab === 2 && <TeamSettings teamId={teamId} />}
    </Box>
  );
};

export default TeamDashboard; 