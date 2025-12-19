import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'normal' or 'nominee'
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      const storedBiometricEnrolled = localStorage.getItem('biometricEnrolled');
      const storedFaceVerified = localStorage.getItem('faceVerified');
      
      if (token) {
        try {
          // Load user data from localStorage
          const storedUser = localStorage.getItem('user');
          const userData = storedUser ? JSON.parse(storedUser) : { token };
          setUser(userData);
          setUserType(storedUserType || 'normal');
          setBiometricEnrolled(storedBiometricEnrolled === 'true');
          setFaceVerified(storedFaceVerified === 'true');
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          localStorage.removeItem('user');
          localStorage.removeItem('biometricEnrolled');
          localStorage.removeItem('faceVerified');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password, type = 'normal') => {
    try {
      // Choose the appropriate API endpoint based on user type
      const apiEndpoint = type === 'nominee' 
        ? 'http://localhost:5000/api/nominees/login'
        : 'http://localhost:5000/api/users/login';
      
      const response = await axios.post(apiEndpoint, {
        email,
        password
      });
      
      const { token, userType: responseUserType, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', responseUserType || type);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData || { token });
      setUserType(responseUserType || type);
      return { success: true, userType: responseUserType || type, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (formData, type = 'normal') => {
    try {
      // Choose the appropriate API endpoint based on user type
      const apiEndpoint = type === 'nominee' 
        ? 'http://localhost:5000/api/nominees/register'
        : 'http://localhost:5000/api/users/register';
      
      const response = await axios.post(apiEndpoint, formData);
      
      const { token, userType: responseUserType, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', responseUserType || type);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData || { token });
      setUserType(responseUserType || type);
      return { success: true, userType: responseUserType || type, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const getUserProfile = async () => {
    try {
      // Choose the appropriate API endpoint based on user type
      const apiEndpoint = userType === 'nominee' 
        ? 'http://localhost:5000/api/nominees/profile'
        : 'http://localhost:5000/api/users/profile';
      
      const response = await axios.get(apiEndpoint);
      return { success: true, user: response.data.user || response.data.nominee };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch user profile' 
      };
    }
  };

  // Check biometric enrollment status
  const checkBiometricEnrollment = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/faces/enrollment-status/${userId}`);
      const isEnrolled = response.data.isEnrolled;
      setBiometricEnrolled(isEnrolled);
      localStorage.setItem('biometricEnrolled', isEnrolled.toString());
      return isEnrolled;
    } catch (error) {
      console.error('Error checking biometric enrollment:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Choose the appropriate API endpoint based on user type
      const apiEndpoint = userType === 'nominee' 
        ? 'http://localhost:5000/api/nominees/logout'
        : 'http://localhost:5000/api/users/logout';
      
      await axios.post(apiEndpoint);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      localStorage.removeItem('biometricEnrolled');
      localStorage.removeItem('faceVerified');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setUserType(null);
      setBiometricEnrolled(false);
      setFaceVerified(false);
    }
  };

  // Function to set face verification status
  const setFaceVerificationStatus = (verified) => {
    setFaceVerified(verified);
    localStorage.setItem('faceVerified', verified.toString());
  };

  const value = {
    user,
    userType,
    biometricEnrolled,
    faceVerified,
    login,
    signup,
    logout,
    getUserProfile,
    checkBiometricEnrollment,
    setFaceVerificationStatus,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
