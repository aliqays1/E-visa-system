import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import OtpInput from '../components/OtpInput';
import { GlobeAltIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const TrackVisa = () => {
  const [referenceId, setReferenceId] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visaData, setVisaData] = useState(null);
  
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

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setVisaData(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/visa/track', {
        referenceId: referenceId.trim(),
        passportNumber: passportNumber.trim()
      });

      if (res.data.success) {
        setVisaData(res.data.application);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to track visa. Please check your credentials.');
    } finally {
      setLoading(false);
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

    try {
      const res = await axios.post('/api/visa/verify-track', {
        email: email.trim(),
        code: otpCode
      });

      if (res.data.success) {
        setVisaData(res.data.application);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/visa/track', {
        email: email.trim(),
        passportNumber: passportNumber.trim()
      });

      if (res.data.success && res.data.requires_otp) {
        setTimeLeft(120);
        setOtpCode('');
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const renderApprovedStatus = () => {
    if (!visaData.expirationDate) return null;

    const today = new Date();
    const expiry = new Date(visaData.expirationDate);
    const diffTime = expiry - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isOverstay = daysLeft < 0;

    return (
      <div className="mt-6">
        {isOverstay ? (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-2xl shadow-sm">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-4" />
              <div>
                <h3 className="text-xl font-extrabold text-red-800 tracking-tight mb-1">CRITICAL OVERSTAY WARNING</h3>
                <p className="text-red-700 font-medium mb-2">
                  Your visa expired on <strong>{expiry.toLocaleDateString()}</strong>.
                </p>
                <div className="bg-red-600 text-white font-black text-2xl py-2 px-4 rounded-xl inline-block shadow-md">
                  Overstayed by {Math.abs(daysLeft)} Days
                </div>
                <p className="text-sm text-red-800 mt-4 font-bold">
                  You are currently in violation of immigration policies. Please contact the Immigration and Citizenship Service immediately to resolve your status.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-2xl shadow-sm">
            <div className="flex items-start">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h3 className="text-xl font-extrabold text-green-800 tracking-tight mb-1">Visa is Active & Valid</h3>
                <p className="text-green-700 font-medium mb-3">
                  Your visa expires on <strong>{expiry.toLocaleDateString()}</strong>.
                </p>
                <div className="bg-green-500 text-white font-black text-2xl py-2 px-4 rounded-xl inline-block shadow-md">
                  {daysLeft} Days Remaining
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          {visaData.pdfUrl && !isOverstay && (
            <a 
              href={`${import.meta.env.VITE_API_URL || ''}/${visaData.pdfUrl.replace(/\\/g, '/')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-grow bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-center shadow-lg shadow-blue-500/30 transition-all text-center flex items-center justify-center"
            >
              Download Official e-Visa PDF
            </a>
          )}
          <button 
            onClick={() => { setVisaData(null); setStep(1); setOtpCode(''); }}
            className={`py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-center ${visaData.pdfUrl && !isOverstay ? 'px-6' : 'flex-1 w-full'}`}
          >
            Search Another
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFc] font-sans text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center cursor-pointer">
          <GlobeAltIcon className="h-10 w-10 text-primary mr-3" />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-gray-900 tracking-tight leading-none">Somalia</span>
            <span className="font-bold text-[10px] text-primary tracking-widest uppercase">E-Visa Portal</span>
          </div>
        </Link>
        <Link to="/apply" className="hidden md:block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-500/30">
          Apply Now
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-2xl z-10">
          
          {step === 1 && (
            <>
              {/* Header Title */}
              <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Track Visa Status</h1>
                <p className="text-gray-500 font-medium text-lg">Enter your details below to check the real-time status of your application.</p>
              </div>

              {/* Search Form */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
                {error && (
                  <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 text-center">
                    {error}
                  </div>
                )}
                <form onSubmit={handleTrack} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1">Reference ID</label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input 
                        type="text" 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800 text-lg font-mono"
                        placeholder="Enter Reference ID"
                        value={referenceId}
                        onChange={(e) => setReferenceId(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1">Passport Number</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800 font-mono text-lg tracking-wider"
                      placeholder="Enter passport number"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-900/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none text-lg tracking-wide"
                  >
                    {loading ? 'Searching...' : 'Check Status'}
                  </button>
                </form>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center flex flex-col items-center">
              <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <EnvelopeIcon className="h-10 w-10 text-primary" />
              </div>
              
              <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Check your email</h1>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                To protect your privacy, we sent a 6-digit verification code to <br/><span className="font-bold text-gray-800">{email}</span>
              </p>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium w-full max-w-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-6 w-full max-w-sm flex flex-col items-center">
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
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <button 
                  type="button" 
                  onClick={() => { setStep(1); setOtpCode(''); setLoading(false); setError(''); }}
                  className="mt-4 text-gray-500 hover:text-gray-800 font-bold transition-all text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Cancel Tracking
                </button>
              </form>
            </div>
          )}

          {step === 3 && visaData && (
            /* Results View */
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-slate-900 p-8 text-white text-center relative">
                <button 
                  onClick={() => { setVisaData(null); setStep(1); setOtpCode(''); }}
                  className="absolute top-6 right-6 text-white/50 hover:text-white"
                >
                  ✕ Close
                </button>
                <div className="text-4xl mb-3">🇸🇴</div>
                <h2 className="text-2xl font-extrabold tracking-tight">Visa Record Found</h2>
                <div className="text-sm text-blue-300 mt-2 font-mono">{visaData._id}</div>
              </div>
              
              <div className="p-8 md:p-10">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Applicant Name</span>
                    <span className="font-extrabold text-lg text-gray-900">
                      {visaData.personalDetails?.firstName} {visaData.personalDetails?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Passport No.</span>
                    <span className="font-bold text-lg text-gray-800 font-mono">
                      {visaData.personalDetails?.passportNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Visa Category</span>
                    <span className="font-bold text-gray-800">{visaData.visaType} Visa</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</span>
                    <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider ${
                      visaData.applicationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                      visaData.applicationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {visaData.applicationStatus}
                    </span>
                  </div>
                </div>

                {/* Conditional Dynamic Rendering based on Status */}
                {visaData.applicationStatus === 'Approved' && renderApprovedStatus()}
                
                {visaData.applicationStatus === 'Rejected' && (
                  <div className="mt-6 bg-red-50 border border-red-100 p-6 rounded-2xl">
                    <h3 className="text-red-800 font-bold mb-2">Application Rejected</h3>
                    <p className="text-red-600 text-sm">{visaData.rejectionReason || 'Requirements not met.'}</p>
                    <button 
                      onClick={() => { setVisaData(null); setStep(1); setOtpCode(''); }}
                      className="mt-6 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Search Another
                    </button>
                  </div>
                )}

                {(visaData.applicationStatus === 'Submitted' || visaData.applicationStatus === 'Under Review') && (
                  <div className="mt-6 bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-blue-900 font-bold mb-1">Under Processing</h3>
                      <p className="text-blue-700 text-sm">Your application is currently being reviewed by an immigration officer.</p>
                    </div>
                    <button 
                      onClick={() => { setVisaData(null); setStep(1); setOtpCode(''); }}
                      className="px-6 py-3 bg-white border border-blue-200 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrackVisa;
