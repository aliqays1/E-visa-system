import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GlobeAltIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import OtpInput from '../components/OtpInput';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // States
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  const { forgotPassword, verifyResetOtp, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');

    // Basic syntax validation
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Gmail specific strict validation
    const isGmail = email.toLowerCase().endsWith('@gmail.com');
    if (isGmail) {
      const gmailRegex = /^[a-z0-9][a-z0-9.+]*@gmail\.com$/i;
      if (!gmailRegex.test(email) || email.includes('..')) {
        setError('This Gmail address does not exist. Gmail only allows letters, numbers, and periods.');
        return;
      }
    }

    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setStep(2);
      setTimeLeft(120);
      setSuccess('');
    } else {
      setError(res.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (timeLeft === 0) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await verifyResetOtp(email, otpCode);
    setLoading(false);

    if (res.success) {
      setResetToken(res.resetToken);
      setStep(3);
      setError('');
    } else {
      setError(res.message);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setTimeLeft(120);
      setOtpCode('');
      setError('');
    } else {
      setError(res.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email, resetToken, password);
    setLoading(false);

    if (res.success) {
      setSuccess('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans selection:bg-blue-200 relative overflow-hidden">
      {/* Full screen background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=2070&auto=format&fit=crop" 
          alt="Modern Airport Terminal" 
          className="object-cover w-full h-full scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Centered Card */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 sm:p-10 relative z-10 mx-4 border border-white/40">
          
          <div className="flex items-center mb-10 pt-4 sm:pt-0">
            {/* Logo */}
            <Link to="/" className="flex items-center cursor-pointer group">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 mr-4">
                <GlobeAltIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-2xl text-gray-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">Somalia</span>
                <span className="font-bold text-[11px] text-gray-500 tracking-[0.2em] uppercase mt-0.5">E-Visa Portal</span>
              </div>
            </Link>
          </div>

          {step === 1 && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Forgot Password?</h1>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Enter your email address and we'll send you a 6-digit code to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-8 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 text-red-800 px-5 py-4 rounded-2xl shadow-sm flex items-start gap-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-red-500 to-rose-600"></div>
                  <svg className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <div className="flex-1 text-base font-semibold leading-tight">
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>

                <div className="text-center mt-6">
                  <p className="text-gray-500 font-medium">
                    Remember your password?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center w-full mt-4">
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
                    <EnvelopeIcon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 text-center tracking-tight">Check your email</h1>
                <p className="text-gray-500 font-medium leading-relaxed text-center mb-8">
                  We've sent a password reset code to <br/><span className="font-bold text-gray-800">{email}</span>
                </p>

                {error && (
                  <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6 w-full flex flex-col items-center">
                  <div className="w-full">
                    <OtpInput value={otpCode} onChange={setOtpCode} />
                    
                    <div className="mt-6 flex flex-col items-center justify-center space-y-2 text-sm w-full">
                      <span className={`font-medium ${timeLeft === 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {timeLeft > 0 ? `Code expires in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Code has expired'}
                      </span>
                      {timeLeft === 0 ? (
                        <button 
                          type="button" 
                          onClick={handleResend} 
                          disabled={loading} 
                          className="text-primary font-bold hover:text-blue-800 hover:underline transition-all"
                        >
                          Didn't receive the code? Resend now
                        </button>
                      ) : (
                        <span className="text-gray-400">Didn't receive the code? Resend in {Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}</span>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || otpCode.length !== 6 || timeLeft === 0}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setStep(1); setOtpCode(''); setLoading(false); setError(''); }}
                    className="mt-4 text-gray-500 hover:text-gray-800 font-bold transition-all text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to email
                  </button>
                </form>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center w-full mt-4">
              <div className="w-full">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
                    <KeyIcon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 text-center tracking-tight">Create new password</h1>
                <p className="text-gray-500 font-medium leading-relaxed text-center mb-8">
                  Your new password must be different from previous used passwords.
                </p>

                {error && (
                  <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium text-center">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-200 font-medium text-center">
                    {success}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6 w-full">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white pr-12"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={success}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white pr-12"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={success}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || success}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-2"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default ForgotPassword;
