import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Modal,
  Box,
  TextField,
  Checkbox,
  AppBar,
  Toolbar,
  FormControlLabel,
  Fab,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Logout as LogoutIcon,
  PushPin as PinIcon,
  Add as AddSubtitleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import EmptyState from '../components/EmptyState';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [newTodo, setNewTodo] = useState({ 
    title: '', 
    subtitles: [''],
    deadline: '',
    location: '',
    notes: '',
    is_completed: false,
    is_pinned: false,
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenModal = (todo = null) => {
    setSelectedTodo(todo);
    if (todo) {
      setNewTodo({ 
        title: todo.title, 
        subtitles: todo.subtitles || [''],
        deadline: todo.deadline || '',
        location: todo.location || '',
        notes: todo.notes || '',
        is_completed: todo.is_completed,
        is_pinned: todo.is_pinned || false,
      });
    } else {
      setNewTodo({ 
        title: '', 
        subtitles: [''],
        deadline: '',
        location: '',
        notes: '',
        is_completed: false,
        is_pinned: false,
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTodo(null);
    setNewTodo({ 
      title: '', 
      subtitles: [''],
      deadline: '',
      location: '',
      notes: '',
      is_completed: false,
      is_pinned: false,
    });
  };

  const handleAddSubtitle = () => {
    setNewTodo({
      ...newTodo,
      subtitles: [...newTodo.subtitles, ''],
    });
  };

  const handleSubtitleChange = (index, value) => {
    const newSubtitles = [...newTodo.subtitles];
    newSubtitles[index] = value;
    setNewTodo({
      ...newTodo,
      subtitles: newSubtitles,
    });
  };

  const handleSaveTodo = async () => {
    try {
      if (selectedTodo) {
        await axios.put(`http://localhost:5000/api/todos/${selectedTodo.id}`, {
          title: newTodo.title,
          subtitles: newTodo.subtitles.filter(sub => sub.trim() !== ''),
          deadline: newTodo.deadline,
          location: newTodo.location,
          notes: newTodo.notes,
          is_completed: newTodo.is_completed,
          is_pinned: newTodo.is_pinned,
        });
      } else {
        await axios.post('http://localhost:5000/api/todos', {
          title: newTodo.title,
          subtitles: newTodo.subtitles.filter(sub => sub.trim() !== ''),
          deadline: newTodo.deadline,
          location: newTodo.location,
          notes: newTodo.notes,
          is_completed: false,
          is_pinned: false,
        });
      }
      fetchTodos();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const updatedTodo = {
        ...todo,
        is_completed: !todo.is_completed
      };
      await axios.put(`http://localhost:5000/api/todos/${todo.id}`, updatedTodo);
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleTogglePin = async (todo) => {
    try {
      const updatedTodo = {
        ...todo,
        is_pinned: !todo.is_pinned
      };
      await axios.put(`http://localhost:5000/api/todos/${todo.id}`, updatedTodo);
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo pin status:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo List
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user?.username}
          </Typography>
          {user?.email === 'admin@gmail.com' && (
            <Button
              color="inherit"
              onClick={() => navigate('/admin')}
              sx={{ mr: 1 }}
            >
              Admin Panel
            </Button>
          )}
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/profile')}
            sx={{ mr: 1 }}
          >
            <PersonIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {todos.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={3}>
            {todos.map((todo) => (
              <Grid item xs={12} sm={6} md={4} key={todo.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                    },
                    border: todo.is_pinned ? '2px solid #1976d2' : 'none',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box 
                        sx={{ flex: 1, cursor: 'pointer' }}
                        onClick={() => handleOpenModal(todo)}
                      >
                        <Typography 
                          variant="h6" 
                          component="div"
                          sx={{ 
                            textDecoration: todo.is_completed ? 'line-through' : 'none',
                            color: todo.is_completed ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {todo.title}
                        </Typography>
                        {todo.subtitles && todo.subtitles.map((subtitle, index) => (
                          subtitle && (
                            <Typography 
                              key={index}
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mt: 1,
                                textDecoration: todo.is_completed ? 'line-through' : 'none'
                              }}
                            >
                              {subtitle}
                            </Typography>
                          )
                        ))}
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          {todo.deadline && (
                            <Chip 
                              size="small" 
                              label={`Due: ${format(new Date(todo.deadline), 'MMM dd, yyyy')}`}
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {todo.location && (
                            <Chip 
                              size="small" 
                              label={todo.location}
                              color="secondary"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                        {todo.notes && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              mt: 1,
                              display: 'block',
                              fontStyle: 'italic'
                            }}
                          >
                            {todo.notes}
                          </Typography>
                        )}
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            mt: 1,
                            display: 'block'
                          }}
                        >
                          Created: {format(new Date(todo.created_at), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(todo);
                          }}
                          sx={{
                            color: todo.is_pinned ? 'primary.main' : 'inherit',
                          }}
                        >
                          <PinIcon />
                        </IconButton>
                        <Checkbox
                          checked={todo.is_completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(todo);
                          }}
                          icon={<CheckIcon />}
                          checkedIcon={<CheckIcon />}
                          sx={{
                            '& .MuiSvgIcon-root': {
                              fontSize: 28,
                            },
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => handleOpenModal()}
      >
        <AddIcon />
      </Fab>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="todo-modal-title"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="todo-modal-title" variant="h6" component="h2">
              {selectedTodo ? 'Edit Todo' : 'New Todo'}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            label="Title"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            margin="normal"
          />
          {newTodo.subtitles.map((subtitle, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                label={`Subtitle ${index + 1}`}
                value={subtitle}
                onChange={(e) => handleSubtitleChange(index, e.target.value)}
                margin="normal"
              />
              {index === newTodo.subtitles.length - 1 && (
                <IconButton onClick={handleAddSubtitle}>
                  <AddSubtitleIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <TextField
            fullWidth
            label="Deadline"
            type="date"
            value={newTodo.deadline}
            onChange={(e) => setNewTodo({ ...newTodo, deadline: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Location"
            value={newTodo.location}
            onChange={(e) => setNewTodo({ ...newTodo, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            value={newTodo.notes}
            onChange={(e) => setNewTodo({ ...newTodo, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          {selectedTodo && (
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newTodo.is_completed}
                    onChange={(e) => setNewTodo({ ...newTodo, is_completed: e.target.checked })}
                  />
                }
                label="Completed"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newTodo.is_pinned}
                    onChange={(e) => setNewTodo({ ...newTodo, is_pinned: e.target.checked })}
                  />
                }
                label="Pin to top"
              />
            </Box>
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveTodo}
            >
              Save
            </Button>
            {selectedTodo && (
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleDeleteTodo(selectedTodo.id);
                  handleCloseModal();
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Dashboard; 