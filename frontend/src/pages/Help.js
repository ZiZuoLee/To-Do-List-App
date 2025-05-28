import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Button, Drawer, ListItemButton, Link, Accordion, AccordionSummary, AccordionDetails, TextField } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const sections = [
  { id: 'welcome', label: 'Getting Started' },
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'features', label: 'Features' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
  { id: 'resources', label: 'Resources' },
  { id: 'feedback', label: 'Feedback' },
];

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Settings > Account and click "Reset Password". Follow the instructions sent to your email.' },
  { q: 'How do I join a team?', a: 'Navigate to Teams, click "Join Team", and enter the invite code or accept an invitation from a team leader.' },
  { q: 'How do I enable notifications?', a: 'Go to Settings > Notifications and toggle your preferences for in-app and email notifications.' },
  { q: 'How do I attach files to a task?', a: 'Open a task, go to the Attachments tab, and upload your files. Supported formats: images, PDFs, docs.' },
  { q: 'How do I search or filter tasks?', a: 'Use the search bar at the top of the Dashboard or inside Teams/Activity Feed/Chat to quickly find items.' },
  { q: 'How do I contact support?', a: 'See the Contact section below for support options.' },
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const Help = () => {
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedback = (e) => {
    e.preventDefault();
    setFeedbackSent(true);
    setFeedback('');
    // Here you would send feedback to your backend or service
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 220,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box', pt: 8 },
          display: { xs: 'none', md: 'block' },
        }}
        open
      >
        <List>
          {sections.map((section) => (
            <ListItemButton key={section.id} onClick={() => scrollToSection(section.id)}>
              <ListItemText primary={section.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      {/* Main Content */}
      <Box sx={{ flex: 1, maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined" sx={{ mr: 2 }}>
            Back to Dashboard
          </Button>
          <Typography variant="h5" fontWeight={700}>Help & Getting Started</Typography>
        </Box>
        <Paper sx={{ p: 3, mb: 4 }}>
          {/* Welcome */}
          <section id="welcome">
            <Typography variant="h6" fontWeight={600} gutterBottom>Welcome to the To-Do List App!</Typography>
            <Typography gutterBottom>
              This app helps you manage tasks, collaborate with teams, and stay organized. Whether you're a solo user or part of a team, you'll find powerful features to boost your productivity.
            </Typography>
          </section>
          <Divider sx={{ my: 2 }} />
          {/* Quick Start */}
          <section id="quickstart">
            <Typography variant="subtitle1" fontWeight={600}>Quick Start Guide</Typography>
            <List>
              <ListItem><ListItemText primary="1. Sign up or log in to your account." /></ListItem>
              <ListItem><ListItemText primary="2. Create your first to-do from the Dashboard." /></ListItem>
              <ListItem><ListItemText primary="3. Organize tasks with tags, priorities, and due dates." /></ListItem>
              <ListItem><ListItemText primary="4. Invite team members and collaborate in real time." /></ListItem>
              <ListItem><ListItemText primary="5. Use reminders, checklists, and attachments to stay on track." /></ListItem>
              <ListItem><ListItemText primary="6. Explore settings to customize your experience (theme, notifications, etc.)." /></ListItem>
            </List>
          </section>
          <Divider sx={{ my: 2 }} />
          {/* Features */}
          <section id="features">
            <Typography variant="subtitle1" fontWeight={600}>Feature Highlights</Typography>
            <List>
              <ListItem><ListItemText primary="• Dashboard: View and manage all your tasks in one place." /></ListItem>
              <ListItem><ListItemText primary="• Teams: Create or join teams for group collaboration, shared tasks, and chat." /></ListItem>
              <ListItem><ListItemText primary="• Activity Feed: See recent activity, changes, and notifications in real time." /></ListItem>
              <ListItem><ListItemText primary="• Chat: Communicate with your team instantly, share files, and pin important messages." /></ListItem>
              <ListItem><ListItemText primary="• Comments & Mentions: Discuss tasks and mention teammates for instant notifications." /></ListItem>
              <ListItem><ListItemText primary="• Attachments: Add files, images, and documents to your tasks and comments." /></ListItem>
              <ListItem><ListItemText primary="• Reminders & Notifications: Get in-app and email alerts for due dates, mentions, and updates." /></ListItem>
              <ListItem><ListItemText primary="• Recurring Tasks: Set up tasks that repeat on your schedule." /></ListItem>
              <ListItem><ListItemText primary="• Checklists: Break down tasks into actionable steps." /></ListItem>
              <ListItem><ListItemText primary="• Custom Fields: Track extra info with custom fields on your tasks." /></ListItem>
              <ListItem><ListItemText primary="• Tags & Filters: Organize and quickly find tasks with tags and advanced search." /></ListItem>
              <ListItem><ListItemText primary="• Change History: View a full audit trail of changes to each task." /></ListItem>
              <ListItem><ListItemText primary="• Light/Dark Mode: Switch themes for your comfort." /></ListItem>
            </List>
          </section>
          <Divider sx={{ my: 2 }} />
          {/* FAQ */}
          <section id="faq">
            <Typography variant="subtitle1" fontWeight={600}>Frequently Asked Questions</Typography>
            {faqs.map((faq, idx) => (
              <Accordion key={idx} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </section>
          <Divider sx={{ my: 2 }} />
          {/* Contact */}
          <section id="contact">
            <Typography variant="subtitle1" fontWeight={600}>Contact & Support</Typography>
            <Typography gutterBottom>
              Need help? Reach out to our support team:
            </Typography>
            <List>
              <ListItem><ListItemText primary="Email: support@todoapp.com" /></ListItem>
              <ListItem><ListItemText primary="Community Chat: Join our Discord (link in app footer)" /></ListItem>
              <ListItem><ListItemText primary="Documentation: See the Resources section below." /></ListItem>
            </List>
          </section>
          <Divider sx={{ my: 2 }} />
          {/* Resources */}
          <section id="resources">
            <Typography variant="subtitle1" fontWeight={600}>Resources & Links</Typography>
            <List>
              <ListItem><Link href="/user-guide.pdf" target="_blank" rel="noopener">User Guide (PDF)</Link></ListItem>
              <ListItem><Link href="/changelog" target="_blank" rel="noopener">Changelog & Release Notes</Link></ListItem>
              <ListItem><Link href="/tutorials" target="_blank" rel="noopener">Video Tutorials</Link></ListItem>
            </List>
          </section>
          <Divider sx={{ my: 2 }} />
          {/* Feedback */}
          <section id="feedback">
            <Typography variant="subtitle1" fontWeight={600}>Feedback</Typography>
            <Typography gutterBottom>
              We value your feedback! Let us know how we can improve the app or this help page.
            </Typography>
            {feedbackSent ? (
              <Typography color="success.main">Thank you for your feedback!</Typography>
            ) : (
              <Box component="form" onSubmit={handleFeedback} sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField
                  label="Your feedback"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  size="small"
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained">Send</Button>
              </Box>
            )}
          </section>
        </Paper>
      </Box>
    </Box>
  );
};

export default Help; 