import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GlobeAltIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import OtpInput from '../components/OtpInput';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nationality, setNationality] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP states
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  const { register, verifyRegisterOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Basic syntax validation
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Gmail specific strict validation (Gmail doesn't allow symbols like - or =)
    const isGmail = email.toLowerCase().endsWith('@gmail.com');
    if (isGmail) {
      const gmailRegex = /^[a-z0-9][a-z0-9.+]*@gmail\.com$/i;
      if (!gmailRegex.test(email) || email.includes('..')) {
        setError('This Gmail address does not exist. Gmail only allows letters, numbers, and periods.');
        return;
      }
    }

    setLoading(true);
    const res = await register(fullName, email, password, '', nationality);
    setLoading(false);

    if (res.success && res.requires_otp) {
      setStep(2);
      setTimeLeft(120); // Reset timer
    } else if (res.success) {
      navigate('/applicant');
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
    const res = await verifyRegisterOtp(email, otpCode);
    setLoading(false);

    if (res.success) {
      navigate('/applicant');
    } else {
      setError(res.message);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    const res = await register(fullName, email, password, '', nationality);
    setLoading(false);

    if (res.success && res.requires_otp) {
      setTimeLeft(120);
      setOtpCode('');
      setError('');
    } else if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[500px]">
          
          {/* Logo */}
          <div className="flex items-center mb-8">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-500 font-medium">Sign up for your official Somalia E-Visa account.</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                    placeholder="e.g. Ayaan Warsame"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Nationality</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                      placeholder="Citizenship country"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Confirm</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 bg-gray-50 focus:bg-white pr-12"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-2 bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-8 text-center text-sm font-medium">
                <span className="text-gray-500">Already have an account? </span>
                <Link to="/login" className="text-primary hover:text-blue-800 font-bold transition-colors">Sign in</Link>
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
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setStep(1); setOtpCode(''); setLoading(false); setError(''); }}
                    className="mt-4 text-gray-500 hover:text-gray-800 font-bold transition-all text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to registration
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
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
        
        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">Start your journey to Somalia</h2>
          <div className="space-y-6 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700/50 flex items-center justify-center font-bold mt-1 text-slate-200">1</div>
              <p className="ml-4 text-slate-300 font-medium">Create your secure account to manage your applications.</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700/50 flex items-center justify-center font-bold mt-1 text-slate-200">2</div>
              <p className="ml-4 text-slate-300 font-medium">Fill out your visa application forms completely online.</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700/50 flex items-center justify-center font-bold mt-1 text-slate-200">3</div>
              <p className="ml-4 text-slate-300 font-medium">Receive your approved E-Visa directly in your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
