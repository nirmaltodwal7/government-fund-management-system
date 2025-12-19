import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedUserTypes = ['normal', 'nominee'] }) => {
  const { user, userType, faceVerified, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedUserTypes.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    if (userType === 'nominee') {
      return <Navigate to="/nominee-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if this is a normal user dashboard route and face verification is required
  // Only apply face verification check to routes that are exclusively for normal users
  // AND ensure the current user is actually a normal user
  if (allowedUserTypes.length === 1 && allowedUserTypes.includes('normal') && userType === 'normal' && !faceVerified) {
    return <Navigate to="/verification" replace />;
  }

  return children;
};

export default ProtectedRoute;
