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
    <div className="min-h-screen bg-white flex font-sans selection:bg-blue-200">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto relative">
        
        {/* Subtle decorative background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-3xl"></div>
          <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-50/50 blur-3xl"></div>
        </div>

        <div className="w-full max-w-[480px] relative z-10 my-auto">
          
          {/* Logo */}
          <div className="flex items-center mb-10 pt-8 sm:pt-0">
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

          {step === 1 ? (
            <div className="animate-fade-in-up pb-12">
              <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Create Account</h1>
                <p className="text-gray-500 font-medium text-lg">Sign up for your official Somalia E-Visa account.</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm border border-red-100 font-medium flex items-center shadow-sm">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 bg-white shadow-sm hover:border-gray-300 text-base"
                    placeholder="e.g. Ayaan Warsame"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 bg-white shadow-sm hover:border-gray-300 text-base"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 ml-1">Nationality</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 bg-white shadow-sm hover:border-gray-300 text-base"
                      placeholder="Citizenship"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 bg-white shadow-sm hover:border-gray-300 text-base pr-12"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 ml-1">Confirm</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 bg-white shadow-sm hover:border-gray-300 text-base pr-12"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
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
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.5)] transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center text-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Processing...
                    </>
                  ) : 'Create Account'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-500 font-medium">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full animate-fade-in-up pb-12">
              <div className="w-full">
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 blur-[20px] opacity-30 rounded-full"></div>
                    <div className="h-24 w-24 bg-gradient-to-tr from-blue-50 to-indigo-50 border border-white rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <EnvelopeIcon className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 text-center tracking-tight">Check your email</h1>
                <p className="text-gray-500 font-medium leading-relaxed text-center mb-8 text-lg">
                  We've sent a 6-digit code to<br/>
                  <span className="font-bold text-gray-900">{email}</span>
                </p>

                {error && (
                  <div className="mb-6 bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm border border-red-100 font-medium text-center shadow-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-8 w-full flex flex-col items-center">
                  <div className="w-full">
                    <OtpInput value={otpCode} onChange={setOtpCode} />
                    
                    <div className="mt-8 flex flex-col items-center justify-center space-y-3 text-sm w-full">
                      <div className="flex items-center justify-center space-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <svg className={`w-4 h-4 ${timeLeft === 0 ? 'text-red-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className={`font-bold tracking-wide ${timeLeft === 0 ? 'text-red-600' : 'text-gray-700'}`}>
                          {timeLeft > 0 ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Expired'}
                        </span>
                      </div>
                      
                      {timeLeft === 0 ? (
                        <button 
                          type="button" 
                          onClick={handleResend} 
                          disabled={loading} 
                          className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all hover:underline"
                        >
                          Didn't receive the code? Resend now
                        </button>
                      ) : (
                        <span className="text-gray-500 font-medium">Didn't receive it? Resend in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || otpCode.length !== 6 || timeLeft === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.5)] transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center text-lg"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Verifying...
                      </>
                    ) : 'Verify Email'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setStep(1); setOtpCode(''); setLoading(false); setError(''); }}
                    className="mt-2 text-gray-500 hover:text-gray-900 font-bold transition-all text-sm flex items-center group"
                  >
                    <div className="bg-gray-100 p-1.5 rounded-full mr-2 group-hover:bg-gray-200 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </div>
                    Back to registration
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Stunning Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Unsplash Image Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop" 
            alt="Airplane flying over clouds" 
            className="object-cover w-full h-full scale-105"
          />
        </div>
        
        {/* Deep Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900/90 mix-blend-multiply"></div>
        
        {/* Extra glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="relative z-10 p-16 flex flex-col justify-end h-full w-full max-w-2xl text-white">
          <div className="mb-10">
            <h2 className="text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight drop-shadow-lg">
              Start your journey<br/>to Somalia.
            </h2>
            <p className="text-blue-50 text-xl leading-relaxed font-medium max-w-lg drop-shadow-md opacity-90">
              Join thousands of travelers who have already used our secure portal.
            </p>
          </div>
          
          <div className="space-y-6 text-left bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start group">
              <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white group-hover:bg-blue-500 transition-colors shadow-lg border border-white/20">1</div>
              <div className="ml-5">
                <h4 className="text-lg font-bold">Create Account</h4>
                <p className="text-blue-100/70 font-medium text-sm mt-1">Setup your secure digital identity.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white group-hover:bg-blue-500 transition-colors shadow-lg border border-white/20">2</div>
              <div className="ml-5">
                <h4 className="text-lg font-bold">Apply Online</h4>
                <p className="text-blue-100/70 font-medium text-sm mt-1">Fill out the forms in under 5 minutes.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white group-hover:bg-blue-500 transition-colors shadow-lg border border-white/20">3</div>
              <div className="ml-5">
                <h4 className="text-lg font-bold">Get Approved</h4>
                <p className="text-blue-100/70 font-medium text-sm mt-1">Receive your e-visa straight to your dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Register;
