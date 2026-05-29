import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GlobeAltIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import OtpInput from '../components/OtpInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // OTP states
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  const { login, verifyLoginOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.requires_otp) {
      setStep(2);
      setTimeLeft(120); // Reset timer when OTP is sent
    } else if (res.success) {
      // Fallback if no OTP required
      redirectUser(res.user);
    } else {
      setError(res.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (timeLeft === 0) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await verifyLoginOtp(email, otpCode);
    setLoading(false);

    if (res.success) {
      redirectUser(res.user);
    } else {
      setError(res.message);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.requires_otp) {
      setTimeLeft(120);
      setOtpCode('');
      setError(''); // Clear any previous errors
    } else if (!res.success) {
      setError(res.message);
    }
  };

  const redirectUser = (user) => {
    if (user && user.role === 'officer') {
      navigate('/admin');
    } else if (user && user.role === 'auditor') {
      navigate('/auditor');
    } else {
      navigate('/applicant');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[480px]">
          
          {/* Logo */}
          <div className="flex items-center mb-10">
            <Link to="/" className="flex items-center cursor-pointer">
              <GlobeAltIcon className="h-10 w-10 text-primary mr-3" />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-xl text-gray-900 tracking-tight leading-none">Somalia</span>
                <span className="font-bold text-[10px] text-primary tracking-widest uppercase">E-Visa Portal</span>
              </div>
            </Link>
          </div>

          {step === 1 ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500 font-medium">Please enter your details to sign in.</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white pr-12"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" />
                    <label className="ml-2 block text-sm text-gray-600 font-medium cursor-pointer">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-blue-800 font-semibold transition-colors">Forgot Password?</Link>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 text-center text-sm font-medium">
                <span className="text-gray-500">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:text-blue-800 font-bold transition-colors">Sign up</Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full mt-4">
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
                    <EnvelopeIcon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 text-center tracking-tight">Check your email</h1>
                <p className="text-gray-500 font-medium leading-relaxed text-center mb-8">
                  We've sent a 6-digit verification code to <br/><span className="font-bold text-gray-800">{email}</span>
                </p>

                {error && (
                  <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-6 w-full flex flex-col items-center">
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
                    {loading ? 'Verifying...' : 'Verify Login'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setStep(1); setOtpCode(''); setLoading(false); setError(''); }}
                    className="mt-4 text-gray-500 hover:text-gray-800 font-bold transition-all text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to login
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Image/Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
        {/* Abstract pattern overlaid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
        
        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <GlobeAltIcon className="h-20 w-20 mx-auto mb-6 text-white/80" />
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">Official Somalia E-Visa Portal</h2>
          <p className="text-slate-300 text-lg leading-relaxed font-medium">
            Fast, secure, and fully digital. Apply for your visa, track your application, and manage your travel documents in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
