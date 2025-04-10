import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { EmojiEmotions, Lightbulb, RocketLaunch } from '@mui/icons-material';

const quotes = [
  {
    text: "Begin your day by creating a task",
    icon: <RocketLaunch sx={{ fontSize: 40 }} />,
  },
  {
    text: "Every great journey starts with a single step",
    icon: <EmojiEmotions sx={{ fontSize: 40 }} />,
  },
  {
    text: "Organize your thoughts, achieve your dreams",
    icon: <Lightbulb sx={{ fontSize: 40 }} />,
  },
  {
    text: "Turn your to-dos into ta-das!",
    icon: <EmojiEmotions sx={{ fontSize: 40 }} />,
  },
  {
    text: "Start small, dream big, achieve more",
    icon: <RocketLaunch sx={{ fontSize: 40 }} />,
  },
];

const EmptyState = () => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          background: 'linear-gradient(45deg, #f5f5f5 30%, #e0e0e0 90%)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ color: 'primary.main', mb: 2 }}>
          {randomQuote.icon}
        </Box>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 2,
            fontWeight: 'medium',
            color: 'text.primary',
          }}
        >
          {randomQuote.text}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontStyle: 'italic' }}
        >
          Click the + button to create your first todo
        </Typography>
      </Paper>
    </Box>
  );
};

export default EmptyState; 