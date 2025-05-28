import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, TextField, Button, Avatar, IconButton, Switch, FormControlLabel, Snackbar, Alert, Divider } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../App';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TourIcon from '@mui/icons-material/TravelExplore';

const Settings = () => {
  const { user, login, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState({ username: '', email: '', avatar: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState({ inApp: true, email: true });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [avatarFile, setAvatarFile] = useState(null);
  const colorMode = useColorMode();

  useEffect(() => {
    if (user) {
      setProfile({ username: user.username, email: user.email, avatar: user.avatar || '' });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  };

  const handleProfileSave = async () => {
    try {
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const res = await axios.post('/api/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        avatarUrl = res.data.url;
      }
      await axios.put('/api/auth/update-profile', { username: profile.username, email: profile.email, avatar: avatarUrl });
      setSnackbar({ open: true, message: 'Profile updated', severity: 'success' });
      setAvatarFile(null);
      // Optionally update auth context
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating profile', severity: 'error' });
    }
  };

  const handlePasswordSave = async () => {
    if (passwords.new !== passwords.confirm) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    try {
      await axios.put('/api/auth/update-profile', { currentPassword: passwords.current, newPassword: passwords.new });
      setSnackbar({ open: true, message: 'Password updated', severity: 'success' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating password', severity: 'error' });
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    colorMode.toggleColorMode();
    setSnackbar({ open: true, message: `Switched to ${newTheme} mode`, severity: 'success' });
  };

  const handleNotificationsChange = async (e) => {
    const updated = { ...notifications, [e.target.name]: e.target.checked };
    setNotifications(updated);
    setSnackbar({ open: true, message: 'Notification preferences updated', severity: 'success' });
    try {
      await axios.put('/api/auth/notifications', updated); // Persist preferences if endpoint exists
    } catch (err) {
      // Ignore if endpoint doesn't exist
    }
  };

  const handleDeleteAccount = async () => {
    // Confirm and call backend to delete account
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await axios.delete('/api/auth/delete-account');
      logout();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting account', severity: 'error' });
    }
  };

  const handleExportData = async () => {
    try {
      const res = await axios.get('/api/auth/export-data');
      // Download as JSON
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'todo_data.json';
      a.click();
      setSnackbar({ open: true, message: 'Data exported', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error exporting data', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Back to Dashboard" arrow>
            <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined" sx={{ mr: 2 }}>
              Back to Dashboard
            </Button>
          </Tooltip>
          <Typography variant="h5" fontWeight={700}>Settings</Typography>
        </Box>
        <Box>
          <Tooltip title="Help / Getting Started" arrow>
            <IconButton component={RouterLink} to="/help" color="primary" aria-label="Help">
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Take a Guided Tour" arrow>
            <IconButton color="secondary" aria-label="Guided Tour" onClick={() => setSnackbar({ open: true, message: 'Guided tour coming soon!', severity: 'info' })}>
              <TourIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Profile" />
          <Tab label="Theme" />
          <Tab label="Notifications" />
          <Tab label="Account" />
        </Tabs>
        <Divider sx={{ mb: 2 }} />
        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar} sx={{ width: 64, height: 64 }} />
              <Tooltip title="Upload avatar" arrow>
                <IconButton color="primary" component="label" aria-label="Upload avatar">
                  <PhotoCamera />
                  <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField label="Username" name="username" value={profile.username} onChange={handleProfileChange} fullWidth sx={{ mb: 2 }} inputProps={{ 'aria-label': 'Username' }} />
            <TextField label="Email" name="email" value={profile.email} onChange={handleProfileChange} fullWidth sx={{ mb: 2 }} inputProps={{ 'aria-label': 'Email' }} />
            <Tooltip title="Save profile changes" arrow>
              <Button variant="contained" onClick={handleProfileSave}>Save Profile</Button>
            </Tooltip>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Change Password</Typography>
            <TextField label="Current Password" name="current" type="password" value={passwords.current} onChange={handlePasswordChange} fullWidth sx={{ mb: 2 }} inputProps={{ 'aria-label': 'Current Password' }} />
            <TextField label="New Password" name="new" type="password" value={passwords.new} onChange={handlePasswordChange} fullWidth sx={{ mb: 2 }} inputProps={{ 'aria-label': 'New Password' }} />
            <TextField label="Confirm New Password" name="confirm" type="password" value={passwords.confirm} onChange={handlePasswordChange} fullWidth sx={{ mb: 2 }} inputProps={{ 'aria-label': 'Confirm New Password' }} />
            <Tooltip title="Change password" arrow>
              <Button variant="outlined" onClick={handlePasswordSave}>Change Password</Button>
            </Tooltip>
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Tooltip title="Toggle dark mode" arrow>
              <FormControlLabel
                control={<Switch checked={theme === 'dark'} onChange={handleThemeToggle} aria-label="Toggle dark mode" />}
                label="Dark Mode"
              />
            </Tooltip>
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Tooltip title="Enable or disable in-app notifications" arrow>
              <FormControlLabel
                control={<Switch checked={notifications.inApp} onChange={handleNotificationsChange} name="inApp" aria-label="In-app notifications" />}
                label="In-app notifications"
              />
            </Tooltip>
            <Tooltip title="Enable or disable email notifications" arrow>
              <FormControlLabel
                control={<Switch checked={notifications.email} onChange={handleNotificationsChange} name="email" aria-label="Email notifications" />}
                label="Email notifications"
              />
            </Tooltip>
          </Box>
        )}
        {tab === 3 && (
          <Box>
            <Tooltip title="Delete your account permanently" arrow>
              <Button variant="contained" color="error" onClick={handleDeleteAccount} sx={{ mb: 2 }}>Delete Account</Button>
            </Tooltip>
            <Tooltip title="Export your data as JSON" arrow>
              <Button variant="outlined" onClick={handleExportData}>Export My Data</Button>
            </Tooltip>
          </Box>
        )}
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert elevation={6} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Settings; 