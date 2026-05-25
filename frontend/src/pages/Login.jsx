import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.user && res.user.role === 'officer') {
        navigate('/admin');
      } else if (res.user && res.user.role === 'auditor') {
        navigate('/auditor');
      } else {
        navigate('/applicant');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-10 border border-gray-100 relative">
        
        {/* Decorative corner element (optional detail found in some Able Pro themes) */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none"></div>

        {/* Logo */}
        <div className="flex items-center justify-center mb-8 relative z-10">
          <Link to="/" className="flex items-center cursor-pointer">
            <GlobeAltIcon className="h-10 w-10 text-primary mr-3" />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xl text-gray-900 tracking-tight leading-none">Somalia</span>
              <span className="font-bold text-[10px] text-primary tracking-widest uppercase">E-Visa Portal</span>
            </div>
          </Link>
        </div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hi, Welcome Back</h1>
          <p className="text-gray-500 text-sm font-medium">Login in to your account to continue.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-gray-900 placeholder-gray-400 bg-white"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-gray-900 placeholder-gray-400 bg-white"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" />
              <label className="ml-2 block text-sm text-gray-600 font-medium cursor-pointer">Keep me sign in</label>
            </div>
            <a href="#" className="text-sm text-primary hover:text-blue-800 font-medium transition-colors">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4 shadow-sm"
          >
            Login
          </button>
        </form>

        <div className="mt-8 flex justify-between items-center text-[13px] font-medium relative z-10">
          <span className="text-gray-900">Don't have an account?</span>
          <Link to="/register" className="text-primary hover:text-blue-800 transition-colors">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
