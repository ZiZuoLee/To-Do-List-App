import React from 'react';
import { Menu, MenuItem, ListItemText, Typography, Button, Box } from '@mui/material';

const NotificationDropdown = ({ anchorEl, open, onClose, notifications, onMarkAllRead }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose} PaperProps={{ sx: { minWidth: 320 } }}>
    <Box sx={{ px: 2, pt: 1, pb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
      <Button size="small" onClick={onMarkAllRead}>Mark all as read</Button>
    </Box>
    {notifications.length === 0 ? (
      <MenuItem disabled><ListItemText primary="No notifications" /></MenuItem>
    ) : notifications.map((notif, idx) => (
      <MenuItem key={idx} selected={!notif.read} sx={{ alignItems: 'flex-start', whiteSpace: 'normal' }}>
        <ListItemText
          primary={<span style={{ fontWeight: notif.read ? 400 : 700 }}>{notif.type.replace('_', ' ').toUpperCase()}</span>}
          secondary={<>
            <Typography component="span" variant="body2">{notif.message}</Typography><br/>
            <Typography component="span" variant="caption" color="text.secondary">{new Date(notif.created_at).toLocaleString()}</Typography>
          </>}
        />
      </MenuItem>
    ))}
  </Menu>
);

export default NotificationDropdown; 