import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      // The backend now returns { requires_otp: true, email }
      if (data.requires_otp) {
        return { success: true, requires_otp: true, email: data.email };
      }
      // Fallback if OTP is disabled
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const verifyLoginOtp = async (email, code) => {
    try {
      const { data } = await axios.post('/api/auth/verify-login', { email, code });
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    }
  };

  const register = async (fullName, email, password, phone, nationality) => {
    try {
      const { data } = await axios.post('/api/auth/register', {
        fullName,
        email,
        password,
        phone,
        nationality
      });
      if (data.requires_otp) {
        return { success: true, requires_otp: true, email: data.email };
      }
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const verifyRegisterOtp = async (email, code) => {
    try {
      const { data } = await axios.post('/api/auth/verify-register', { email, code });
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send reset code' };
    }
  };

  const verifyResetOtp = async (email, code) => {
    try {
      const { data } = await axios.post('/api/auth/verify-reset-otp', { email, code });
      return { success: true, resetToken: data.resetToken };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    }
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    try {
      const { data } = await axios.post('/api/auth/reset-password', { email, resetToken, newPassword });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to reset password' };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, verifyLoginOtp, logout, register, verifyRegisterOtp,
      forgotPassword, verifyResetOtp, resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
