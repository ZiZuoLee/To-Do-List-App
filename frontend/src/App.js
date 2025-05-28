import React, { useMemo, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import Teams from './pages/Teams';
import Tags from './pages/Tags';
import ActivityFeed from './pages/ActivityFeed';
import Settings from './pages/Settings';
import TeamDashboard from './pages/TeamDashboard';
import Help from './pages/Help';
import { Box } from '@mui/material';

// Theme context for dynamic theme switching
const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });
export const useColorMode = () => useContext(ColorModeContext);

function App() {
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');
  const colorMode = useMemo(() => ({
    mode,
    toggleColorMode: () => {
      const newMode = mode === 'light' ? 'dark' : 'light';
      setMode(newMode);
      localStorage.setItem('theme', newMode);
    },
  }), [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#4f8cff',
        contrastText: '#fff',
      },
      secondary: {
        main: '#6dd5ed',
        contrastText: '#fff',
      },
      background: {
        default: mode === 'dark' ? '#181c24' : '#f6f9fb',
        paper: mode === 'dark' ? '#23272f' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f6f9fb' : '#222b45',
        secondary: mode === 'dark' ? '#b0b8c1' : '#6b7a99',
      },
      error: { main: '#ff6b81' },
      success: { main: '#4cd964' },
      warning: { main: '#ffd166' },
      info: { main: '#38a3a5' },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h5: { fontWeight: 700, letterSpacing: 0.5 },
      h6: { fontWeight: 600 },
      body1: { fontSize: 16 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0.2 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { borderRadius: 14, boxShadow: '0 2px 12px 0 rgba(80, 143, 255, 0.07)' } } },
      MuiCard: { styleOverrides: { root: { borderRadius: 14, boxShadow: '0 2px 12px 0 rgba(80, 143, 255, 0.07)' } } },
      MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
      MuiTextField: { styleOverrides: { root: { borderRadius: 8 } } },
    },
  }), [mode]);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={
                  <ProtectedRoute>
                    {localStorage.getItem('user') && 
                     JSON.parse(localStorage.getItem('user')).email === 'admin@gmail.com' 
                      ? <Navigate to="/admin" />
                      : <Navigate to="/login" />
                    }
                  </ProtectedRoute>
                } />
                <Route
                  path="/teams"
                  element={
                    <ProtectedRoute>
                      <Teams />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tags"
                  element={
                    <ProtectedRoute>
                      <Tags />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute>
                      <ActivityFeed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route path="/teams/:teamId" element={<ProtectedRoute><TeamDashboard /></ProtectedRoute>} />
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <Help />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </AuthProvider>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App; 