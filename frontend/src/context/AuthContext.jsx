import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Returns a role-scoped storage key so each portal tab is isolated.
// e.g. userInfo_officer, userInfo_auditor, userInfo_applicant
const getStorageKey = (role) => {
  if (role) return `userInfo_${role}`;
  // Fallback: derive from current URL path when role is unknown
  const path = window.location.pathname;
  if (path.startsWith('/admin'))     return 'userInfo_officer';
  if (path.startsWith('/auditor'))   return 'userInfo_auditor';
  if (path.startsWith('/applicant') || path.startsWith('/apply') || path.startsWith('/track') || path.startsWith('/verify')) return 'userInfo_applicant';
  // Last resort: try each key in priority order and return whichever has data
  const keys = ['userInfo_applicant', 'userInfo_officer', 'userInfo_auditor'];
  for (const k of keys) {
    if (localStorage.getItem(k) || sessionStorage.getItem(k)) return k;
  }
  return 'userInfo_applicant'; // safe default for public-facing pages
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Each tab reads only the key that matches its URL path
    const key = getStorageKey(null);
    const userInfo = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const saveAuthSession = (data, email, rememberMe = true) => {
    const key = getStorageKey(data?.role);
    setUser(data);
    sessionStorage.setItem(key, JSON.stringify(data));
    if (rememberMe) {
      localStorage.setItem(key, JSON.stringify(data));
      if (email) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remember_me', 'true');
      }
    } else {
      localStorage.removeItem(key);
      localStorage.removeItem('remembered_email');
      localStorage.setItem('remember_me', 'false');
    }
  };

  const login = async (email, password, rememberMe = true) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.setItem('remember_me', 'false');
      }
      // The backend now returns { requires_otp: true, email }
      if (data.requires_otp) {
        return { success: true, requires_otp: true, email: data.email };
      }
      // Fallback if OTP is disabled
      saveAuthSession(data, email, rememberMe);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const verifyLoginOtp = async (email, code, rememberMe = true) => {
    try {
      const { data } = await axios.post('/api/auth/verify-login', { email, code });
      saveAuthSession(data, email, rememberMe);
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
      // Store remembered email & remember state on registration
      localStorage.setItem('remembered_email', email);
      localStorage.setItem('remember_me', 'true');

      if (data.requires_otp) {
        return { success: true, requires_otp: true, email: data.email };
      }
      saveAuthSession(data, email, true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const verifyRegisterOtp = async (email, code) => {
    try {
      const { data } = await axios.post('/api/auth/verify-register', { email, code });
      localStorage.setItem('remembered_email', email);
      localStorage.setItem('remember_me', 'true');
      saveAuthSession(data, email, true);
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
    const key = getStorageKey(user?.role);
    setUser(null);
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
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
