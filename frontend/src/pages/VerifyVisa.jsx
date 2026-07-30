import { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
  const { user: authUser } = useContext(AuthContext);

  const getAuthToken = useCallback(() => {
    if (authUser?.token) return authUser.token;
    const userInfoRaw = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfoRaw) {
      try {
        const userObj = JSON.parse(userInfoRaw);
        return userObj?.token || userObj?.user?.token || userObj?.authToken || null;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  }, [authUser]);

  const verifyToken = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const headers = { 'Content-Type': 'application/json' };
      const authToken = getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/visa/verify/${token}`, { headers });
      const result = await res.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.message || 'Verification failed.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    // eslint-disable-next-line
    verifyToken();
  }, [token, verifyToken]);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line
      setError('Invalid or missing verification token.');
      Promise.resolve().then(() => setLoading(false));
    }
  }, [token]);

  const handleBorderAction = async (action) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) return alert('Officer authentication required');

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
    } catch {
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
  const isEntryRecorded = !!application.entryRecorded;
  const isApproved = application.applicationStatus === 'Approved' || application.applicationStatus === 'Active';
  const isExpired = application.isExpired || (isEntryRecorded 
    ? (application.stayExpiryDate && new Date() > new Date(application.stayExpiryDate))
    : (application.entryValidUntil && new Date() > new Date(application.entryValidUntil)));

  // --- PUBLIC VIEW ---
  if (!isOfficer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className={`p-6 text-center ${isApproved && !isExpired ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            {isApproved && !isExpired ? (
              <CheckCircleIcon className="w-16 h-16 text-white mx-auto mb-2" />
            ) : (
              <XCircleIcon className="w-16 h-16 text-white mx-auto mb-2" />
            )}
            <h1 className="text-2xl font-bold text-white tracking-wide uppercase">
              {isApproved && !isExpired ? (isEntryRecorded ? 'Active Visa' : 'Approved (Pre-Entry)') : 'Invalid / Expired'}
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
                <p className="text-gray-800 font-medium">{application.visaType} Visa</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                <p className="text-gray-800 font-bold capitalize">{isEntryRecorded ? 'Active' : application.applicationStatus}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Entry Recorded</p>
                <p className={`font-bold ${isEntryRecorded ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isEntryRecorded ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Stay Duration</p>
                <p className="text-gray-800 font-medium">
                  {application.renewalHistory && application.renewalHistory.length > 0
                    ? application.renewalHistory[application.renewalHistory.length - 1].addedDays
                    : (application.stayDuration || application.visaDuration || 30)} Days
                </p>
              </div>
            </div>

            {/* PRE-ENTRY VIEW */}
            {!isEntryRecorded ? (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/60">
                <p className="text-xs text-amber-800 uppercase font-bold tracking-wider mb-1">Entry Valid Until</p>
                <p className="text-base font-extrabold text-amber-900">
                  {application.entryValidUntil ? new Date(application.entryValidUntil).toLocaleDateString() : (application.validUntilDate ? new Date(application.validUntilDate).toLocaleDateString() : 'N/A')}
                </p>
                <p className="text-[11px] text-amber-700 mt-1">Must enter Somalia before this date. Stay duration countdown starts upon first entry.</p>
              </div>
            ) : (
              /* POST-ENTRY VIEW */
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200/60 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-emerald-800 uppercase font-bold tracking-wider block">Entry Date</span>
                    <span className="font-bold text-emerald-950">{application.entryDate ? new Date(application.entryDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-800 uppercase font-bold tracking-wider block">Stay Expiry Date</span>
                    <span className="font-bold text-emerald-950">{application.stayExpiryDate ? new Date(application.stayExpiryDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Remaining Days</span>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-extrabold text-xs">
                    {application.remainingDays !== undefined ? `${application.remainingDays} Days` : 'N/A'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-100 flex justify-center">
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
                  <p className="text-lg font-bold font-mono text-gray-900 uppercase">{application.personalDetails?.passportNumber || application.passportNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Nationality</p>
                  <p className="text-gray-800 font-medium">{application.personalDetails?.nationality}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Stay Duration</p>
                  <p className="text-gray-800 font-bold">
                    {application.renewalHistory && application.renewalHistory.length > 0
                      ? application.renewalHistory[application.renewalHistory.length - 1].addedDays
                      : (application.stayDuration || application.visaDuration || 30)} Days
                  </p>
                </div>
              </div>
            </div>

            {/* Entry & Stay Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6 space-y-4">
              <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm border-b border-gray-100 pb-2">Entry & Stay Calculation</h2>
              
              {!isEntryRecorded ? (
                <div className="grid grid-cols-2 gap-4 bg-amber-50/80 p-4 rounded-xl border border-amber-200/60">
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Entry Recorded</span>
                    <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded-full font-extrabold text-xs">NO</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Entry Valid Until</span>
                    <span className="font-extrabold text-amber-950">
                      {application.entryValidUntil ? new Date(application.entryValidUntil).toLocaleDateString() : (application.validUntilDate ? new Date(application.validUntilDate).toLocaleDateString() : 'N/A')}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-amber-700 italic border-t border-amber-200/50 pt-2">
                    Entry Date, Stay Expiry Date, and Remaining Days will be calculated immediately after Border Control records first entry.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/60">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">First Entry Date</span>
                    <span className="font-bold text-emerald-950">{application.entryDate ? new Date(application.entryDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Stay Expiry Date</span>
                    <span className="font-bold text-emerald-950">{application.stayExpiryDate ? new Date(application.stayExpiryDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Entry Officer</span>
                    <span className="font-medium text-emerald-900">{application.entryOfficer || 'Border Control'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Entry Port</span>
                    <span className="font-medium text-emerald-900">{application.entryPort || 'Mogadishu Intl Airport'}</span>
                  </div>
                  <div className="col-span-2 border-t border-emerald-200/60 pt-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Remaining Permitted Stay</span>
                    <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-extrabold text-xs">
                      {application.remainingDays !== undefined ? `${application.remainingDays} Days` : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Renewal History Card if applicable */}
            {application.renewalHistory && application.renewalHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-blue-900 uppercase tracking-wider text-sm">Renewal History ({application.renewalCount || application.renewalHistory.length})</h2>
                </div>
                <div className="p-0">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3">Renewed Date</th>
                        <th className="px-6 py-3">Days Added</th>
                        <th className="px-6 py-3">New Expiry Date</th>
                        <th className="px-6 py-3">Approved By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...application.renewalHistory].reverse().map((ren, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-3 font-semibold text-gray-800">{new Date(ren.renewedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-3 font-bold text-emerald-600">+{ren.addedDays} Days</td>
                          <td className="px-6 py-3 text-gray-700">{new Date(ren.newExpiryDate).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-gray-600">{ren.approvedBy || 'Officer'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scan History */}
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center space-y-4">
              <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider
                ${isEntryRecorded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
              >
                {isEntryRecorded ? 'Status: Active' : 'Status: Approved (Pre-Entry)'}
              </div>
              
              <div className="space-y-3 pt-2">
                {!isEntryRecorded ? (
                  <button 
                    onClick={() => handleBorderAction('entry')}
                    disabled={isExpired}
                    className="w-full flex items-center justify-center px-4 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    Record Entry
                  </button>
                ) : (
                  <div className="bg-emerald-50 text-emerald-800 font-bold p-3 rounded-xl border border-emerald-200 text-sm flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                    First Entry Recorded
                  </div>
                )}

                <button 
                  onClick={() => handleBorderAction('exit')}
                  disabled={!isEntryRecorded || application.entryStatus === 'Exited'}
                  className="w-full flex items-center justify-center px-4 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                  Record Exit
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 text-sm">
               <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Visa Category</p>
                  <p className="text-gray-900 font-bold">{application.visaType} Visa</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Issue Date</p>
                  <p className="text-gray-800 font-medium">{application.issueDate ? new Date(application.issueDate).toLocaleDateString() : (application.approvalDate ? new Date(application.approvalDate).toLocaleDateString() : 'N/A')}</p>
               </div>
               {!isEntryRecorded ? (
                 <div>
                    <p className="text-xs text-amber-800 uppercase font-bold tracking-wider mb-1">Entry Valid Until</p>
                    <p className="font-extrabold text-amber-900">
                      {application.entryValidUntil ? new Date(application.entryValidUntil).toLocaleDateString() : (application.validUntilDate ? new Date(application.validUntilDate).toLocaleDateString() : 'N/A')}
                    </p>
                 </div>
               ) : (
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Stay Expiry Date</p>
                    <p className={`font-bold ${isExpired ? 'text-red-600' : 'text-gray-800'}`}>
                      {application.stayExpiryDate ? new Date(application.stayExpiryDate).toLocaleDateString() : 'N/A'}
                    </p>
                 </div>
               )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default VerifyVisa;
