import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftOnRectangleIcon, 
  ArrowRightOnRectangleIcon, 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/solid';

const VerifyVisa = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing verification token.');
      setLoading(false);
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      setError('');
      
      const headers = { 'Content-Type': 'application/json' };
      const userInfoRaw = sessionStorage.getItem('userInfo');
      let authToken = null;
      
      // If we are logged in as an officer, pass the token to get full data
      if (userInfoRaw) {
        const user = JSON.parse(userInfoRaw);
        if (user && user.role === 'officer') {
          authToken = user.token;
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      }

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/visa/verify/${token}`, { headers });
      const result = await res.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.message || 'Verification failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBorderAction = async (action) => {
    try {
      const userInfoRaw = sessionStorage.getItem('userInfo');
      if (!userInfoRaw) return;
      const user = JSON.parse(userInfoRaw);
      const authToken = user.token;

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/visa/${data.application._id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ location: 'Border Checkpoint' })
      });
      const result = await res.json();
      
      if (result.success) {
        setActionMessage(result.message);
        // Refresh data to show new entry status
        verifyToken();
        setTimeout(() => setActionMessage(''), 3000);
      } else {
        alert(result.message || `Failed to record ${action}`);
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <XCircleIcon className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary text-white rounded-lg font-bold">Return Home</button>
      </div>
    );
  }

  const { isOfficer, application } = data;
  const isApproved = application.applicationStatus === 'Approved';
  const isExpired = new Date() > new Date(application.expirationDate);

  // --- PUBLIC VIEW ---
  if (!isOfficer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className={`p-6 text-center ${isApproved && !isExpired ? 'bg-green-600' : 'bg-red-600'}`}>
            {isApproved && !isExpired ? (
              <CheckCircleIcon className="w-16 h-16 text-white mx-auto mb-2" />
            ) : (
              <XCircleIcon className="w-16 h-16 text-white mx-auto mb-2" />
            )}
            <h1 className="text-2xl font-bold text-white tracking-wide uppercase">
              {isApproved && !isExpired ? 'Valid Visa' : 'Invalid / Expired'}
            </h1>
            <p className="text-white/80 text-sm mt-1">Somalia E-Visa Verification</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Applicant Name</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{application.personalDetails?.firstName} {application.personalDetails?.lastName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Visa Type</p>
                <p className="text-gray-800 font-medium">{application.visaType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                <p className="text-gray-800 font-medium">{application.applicationStatus}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Validity</p>
              {application.approvalDate && application.expirationDate ? (
                <p className="text-sm text-gray-700">
                  {new Date(application.approvalDate).toLocaleDateString()} — {new Date(application.expirationDate).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-sm text-gray-500">N/A</p>
              )}
            </div>
            
            <div className="pt-6 border-t border-gray-100 flex justify-center">
               <ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-2" />
               <span className="text-xs text-gray-500 font-medium">Verified by Department of Immigration</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- OFFICER VIEW ---
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <DocumentMagnifyingGlassIcon className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Immigration Scanner</h1>
              <p className="text-sm text-gray-500 font-mono">ID: {application._id}</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin')} className="text-sm font-bold text-gray-600 hover:text-primary">
            &larr; Back to Dashboard
          </button>
        </div>

        {/* Alerts */}
        {application.overstayAlert && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-bold">Active Overstay Alert</h3>
              <p className="text-red-700 text-sm">This applicant has overstayed their permitted visa duration.</p>
            </div>
          </div>
        )}

        {actionMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-bold text-center">
            {actionMessage}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Traveler Profile</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Full Name</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{application.personalDetails?.firstName} {application.personalDetails?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Passport Number</p>
                  <p className="text-lg font-bold font-mono text-gray-900 uppercase">{application.personalDetails?.passportNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Nationality</p>
                  <p className="text-gray-800 font-medium">{application.personalDetails?.nationality}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Date of Birth</p>
                  <p className="text-gray-800 font-medium">{application.personalDetails?.dateOfBirth}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Scan History</h2>
              </div>
              <div className="p-0">
                {application.scannedHistory && application.scannedHistory.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {[...application.scannedHistory].reverse().map((hist, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3 font-bold text-gray-700">{hist.action}</td>
                          <td className="px-6 py-3 text-gray-600">{hist.location}</td>
                          <td className="px-6 py-3 text-gray-500">{new Date(hist.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">No prior scans recorded.</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
              <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4
                ${application.entryStatus === 'Entered' ? 'bg-blue-100 text-blue-800' : 
                  application.entryStatus === 'Exited' ? 'bg-gray-100 text-gray-800' : 
                  application.entryStatus === 'Overstayed' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}`}
              >
                {application.entryStatus}
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleBorderAction('entry')}
                  disabled={application.entryStatus === 'Entered' || isExpired}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                  Record Entry
                </button>
                <button 
                  onClick={() => handleBorderAction('exit')}
                  disabled={application.entryStatus !== 'Entered'}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                  Record Exit
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
               <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Visa Type</p>
                  <p className="text-gray-900 font-bold">{application.visaType}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Approval Date</p>
                  <p className="text-gray-800 text-sm">{application.approvalDate ? new Date(application.approvalDate).toLocaleDateString() : 'N/A'}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Valid Until</p>
                  <p className={`font-bold ${isExpired ? 'text-red-600' : 'text-gray-800'}`}>
                    {application.expirationDate ? new Date(application.expirationDate).toLocaleDateString() : 'N/A'}
                  </p>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default VerifyVisa;
