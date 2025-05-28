import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  CircularProgress,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Logout as LogoutIcon,
  PushPin as PinIcon,
  Add as AddSubtitleIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  TravelExplore as TourIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import EmptyState from '../components/EmptyState';
import CommentsSection from '../components/CommentsSection';
import Checklist from '../components/Checklist';
import Attachments from '../components/Attachments';
import Reminders from '../components/Reminders';
import CustomFields from '../components/CustomFields';
import ShareDialog from '../components/ShareDialog';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs from 'dayjs';
import NotificationDropdown from '../components/NotificationDropdown';
import { io } from 'socket.io-client';

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
    priority: 'Medium',
    tag_ids: [],
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [allTags, setAllTags] = useState([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [formError, setFormError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
  const [modalTab, setModalTab] = useState(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tourSnackbar, setTourSnackbar] = useState(false);

  useEffect(() => {
    fetchTodos();
    fetchTags();
    fetchNotifications();
    // Connect to Socket.IO for real-time notifications
    const token = localStorage.getItem('token');
    const socket = io('http://localhost:5000', { auth: { token } });
    socket.on('notification', notif => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (openModal && selectedTodo) {
      fetchAuditLogs(selectedTodo.id);
    }
  }, [openModal, selectedTodo]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/todos');
      setTodos(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching todos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get('/api/tags');
      setAllTags(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error fetching tags', severity: 'error' });
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      // Ignore for now
    }
  };

  const fetchAuditLogs = async (todoId) => {
    try {
      const res = await axios.get(`/api/audit?entity_type=todo&entity_id=${todoId}`);
      setAuditLogs(res.data);
    } catch (err) {
      setAuditLogs([]);
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
        subtitles: todo.subtitle ? todo.subtitle.split('||') : [''],
        deadline: todo.due_date || '',
        location: todo.location || '',
        notes: todo.notes || '',
        is_completed: todo.is_completed,
        is_pinned: todo.is_pinned || false,
        priority: todo.priority || 'Medium',
        tag_ids: todo.tags ? todo.tags.map(tag => tag.id) : [],
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
        priority: 'Medium',
        tag_ids: [],
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
      priority: 'Medium',
      tag_ids: [],
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
    setFormError('');
    setDeadlineError('');
    if (!newTodo.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!newTodo.deadline) {
      setDeadlineError('Deadline is required');
      setModalTab(0);
      return;
    }
    setLoading(true);
    try {
      let due_date = newTodo.deadline;
      if (due_date) {
        if (due_date.includes('T')) due_date = due_date.split('T')[0];
      }
      const payload = {
        title: newTodo.title,
        subtitle: newTodo.subtitles.filter(sub => sub.trim() !== '').join('||'),
        due_date,
        location: newTodo.location,
        notes: newTodo.notes,
        is_completed: newTodo.is_completed,
        is_pinned: newTodo.is_pinned,
        priority: newTodo.priority,
        tag_ids: newTodo.tag_ids,
      };
      if (selectedTodo) {
        await axios.put(`http://localhost:5000/api/todos/${selectedTodo.id}`, payload);
        setSnackbar({ open: true, message: 'Todo updated', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/todos', payload);
        setSnackbar({ open: true, message: 'Todo created', severity: 'success' });
      }
      fetchTodos();
      handleCloseModal();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving todo', severity: 'error' });
    } finally {
      setLoading(false);
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

  const handleNotifOpen = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Todo List
          </Typography>
          <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
          <Button color="inherit" component={RouterLink} to="/teams">Teams</Button>
          <Button color="inherit" component={RouterLink} to="/tags">Tags</Button>
          <Button color="inherit" component={RouterLink} to="/activity">Activity</Button>
          <Button color="inherit" component={RouterLink} to="/settings">Settings</Button>
          {user?.email === 'admin@gmail.com' && (
            <Button color="secondary" variant="outlined" onClick={() => navigate('/admin')} sx={{ ml: 2 }}>
              Admin Panel
            </Button>
          )}
          <IconButton color="inherit" onClick={() => navigate('/profile')} sx={{ ml: 1 }} aria-label="Profile">
            <PersonIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} aria-label="Logout">
            <LogoutIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleNotifOpen} sx={{ ml: 1 }} aria-label="Notifications">
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <NotificationDropdown
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            notifications={notifications}
            onMarkAllRead={() => {
              setNotifications(notifications.map(n => ({ ...n, read: true })));
              setUnreadCount(0);
            }}
          />
          <Tooltip title="Take a Guided Tour" arrow>
            <IconButton color="secondary" onClick={() => setTourSnackbar(true)} sx={{ ml: 1 }} aria-label="Guided Tour">
              <TourIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <CircularProgress />
          </Box>
        ) : todos.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={3}>
            {todos.map((todo) => {
              const isOverdue = todo.deadline && new Date(todo.deadline) < new Date() && !todo.is_completed;
              return (
                <Grid item xs={12} sm={6} md={4} key={todo.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6 },
                      border: todo.is_pinned ? '2px solid #1976d2' : 'none',
                      background: isOverdue ? 'linear-gradient(90deg, #ffe0e0 0%, #fff 100%)' : 'white',
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
                              color: todo.is_completed ? 'text.secondary' : 'text.primary',
                              fontWeight: 600
                            }}
                          >
                            {todo.title}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                            {todo.priority && (
                              <Chip 
                                size="small" 
                                label={todo.priority}
                                color={todo.priority === 'High' ? 'error' : todo.priority === 'Low' ? 'success' : 'warning'}
                                variant="filled"
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                            {todo.deadline && (
                              <Chip 
                                size="small" 
                                label={`Due: ${format(new Date(todo.deadline), 'MMM dd, yyyy')}`}
                                color={isOverdue ? 'error' : 'primary'}
                                variant="outlined"
                              />
                            )}
                            {todo.tags && todo.tags.map((tag, idx) => (
                              <Chip key={idx} size="small" label={tag.name} color="secondary" variant="outlined" />
                            ))}
                          </Stack>
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
                            sx={{ color: todo.is_pinned ? 'primary.main' : 'inherit' }}
                            aria-label={todo.is_pinned ? 'Unpin todo' : 'Pin todo'}
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
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 28 }, '&.Mui-checked': { color: 'primary.main' } }}
                            aria-label={todo.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      <Tooltip title="Add new todo" arrow>
        <Fab
          color="primary"
          aria-label="Add new todo"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenModal()}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="todo-modal-title"
        aria-describedby="todo-modal-description"
      >
        <Box sx={modalStyle} id="todo-modal-description">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="todo-modal-title" variant="h6" component="h2">
              {selectedTodo ? 'Edit Todo' : 'New Todo'}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Tabs value={modalTab} onChange={(_, v) => setModalTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
            <Tab label="Basic" />
            <Tab label="Details" />
            <Tab label="Tags" />
            <Tab label="Advanced" />
            <Tab label="Change History" />
          </Tabs>
          <Divider sx={{ mb: 2 }} />
          {modalTab === 0 && (
            <>
              <TextField
                fullWidth
                required
                label="Title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                margin="normal"
                error={!!formError}
                helperText={formError}
              />
              <TextField
                fullWidth
                required
                label="Deadline"
                type="date"
                value={newTodo.deadline}
                onChange={(e) => setNewTodo({ ...newTodo, deadline: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!deadlineError}
                helperText={deadlineError}
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
            </>
          )}
          {modalTab === 1 && (
            <>
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
            </>
          )}
          {modalTab === 2 && (
            <>
              <Select
                fullWidth
                label="Priority"
                value={newTodo.priority || 'Medium'}
                onChange={e => setNewTodo({ ...newTodo, priority: e.target.value })}
                sx={{ mt: 2 }}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
              <Autocomplete
                multiple
                freeSolo
                options={allTags}
                getOptionLabel={option => option.name || option}
                value={allTags.filter(tag => newTodo.tag_ids?.includes(tag.id))}
                inputValue={tagInputValue}
                onInputChange={(e, value) => setTagInputValue(value)}
                onChange={async (e, value) => {
                  const newTags = value.filter(v => typeof v === 'string');
                  let createdTagIds = [];
                  for (const tagName of newTags) {
                    try {
                      const res = await axios.post('/api/tags', { name: tagName });
                      createdTagIds.push(res.data.id);
                      await fetchTags();
                    } catch (err) {
                      setSnackbar({ open: true, message: 'Error creating tag', severity: 'error' });
                    }
                  }
                  setNewTodo({
                    ...newTodo,
                    tag_ids: [
                      ...value.filter(v => v.id).map(tag => tag.id),
                      ...createdTagIds
                    ]
                  });
                  setTagInputValue('');
                }}
                renderInput={params => <TextField {...params} label="Tags" margin="normal" />}
                sx={{ mt: 2 }}
              />
            </>
          )}
          {modalTab === 3 && selectedTodo && (
            <>
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
              <Checklist todoId={selectedTodo.id} />
              <CommentsSection todoId={selectedTodo.id} />
              <Attachments todoId={selectedTodo.id} />
              <Reminders todoId={selectedTodo.id} />
              <CustomFields todoId={selectedTodo.id} />
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setShareOpen(true)}>Share</Button>
              <ShareDialog todoId={selectedTodo.id} open={shareOpen} onClose={() => setShareOpen(false)} />
            </>
          )}
          {modalTab === 4 && selectedTodo && (
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {auditLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No change history.</Typography>
              ) : (
                auditLogs.map(log => (
                  <Box key={log.id} sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{log.action.toUpperCase()} by User {log.user_id} on {new Date(log.timestamp).toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.secondary">Old: {log.old_value}</Typography><br/>
                    <Typography variant="caption" color="text.secondary">New: {log.new_value}</Typography>
                  </Box>
                ))
              )}
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

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      <Snackbar open={tourSnackbar} autoHideDuration={3000} onClose={() => setTourSnackbar(false)}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setTourSnackbar(false)} severity="info" sx={{ width: '100%' }}>
          Guided tour coming soon!
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default Dashboard; 