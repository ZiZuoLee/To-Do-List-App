import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.email !== 'admin@gmail.com') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute; 