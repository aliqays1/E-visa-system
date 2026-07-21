import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  HomeIcon, 
  DocumentCheckIcon, 
  UsersIcon, 
  ChartPieIcon,
  MagnifyingGlassIcon,
  BellIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CameraIcon,
  BuildingLibraryIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const OfficerDashboard = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null); // Modal state
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('review');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Stats state
  const [stats, setStats] = useState({ totalApps: 0, pendingApps: 0, approvedApps: 0, rejectedApps: 0, overstays: 0 });

  // Border Control states
  const [scanToken, setScanToken] = useState('');
  const [newlyDetectedOverstays, setNewlyDetectedOverstays] = useState([]);

  // Retrieve user token
  const token = user ? user.token : null;

  const fetchStats = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/visa/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [token]);

  const fetchApplications = React.useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }
    // Only show full loading spinner on initial fetch when empty
    setLoading(prev => applications.length === 0);
    try {
      const url = `/api/visa/all?page=1&limit=1000`;

      const res = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: signal
      });
      if (res.data.success) {
        setApplications(res.data.applications);
        setTotalPages(res.data.pagination.pages);
        setTotalItems(res.data.pagination.total);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
      } else {
        console.error('Error fetching applications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [token, applications.length]);

  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const controller = new AbortController();
    fetchApplications(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchApplications]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'Approved') {
        // Visa duration is now handled from the initial application
      } else if (newStatus === 'Rejected' || newStatus === 'Needs Revision') {
        if (!rejectionReason.trim()) {
          alert(`Please enter a reason for ${newStatus}.`);
          return;
        }
        payload.rejectionReason = rejectionReason;
      }

      const res = await axios.put(`/api/visa/${id}/status`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(`Application status successfully updated to ${newStatus}!`);
        const updatedApp = res.data.application || { ...selectedApplication, applicationStatus: newStatus };
        setApplications(prev => prev.map(app => app._id === id ? updatedApp : app));
        setSelectedApplication(null);
        setRejectionReason('');
        fetchStats();
      } else {
        alert('Failed to update status: ' + res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error updating application: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendWarning = async (id) => {
    try {
      const res = await axios.post(`/api/visa/${id}/send-warning`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        alert('Warning email sent successfully!');
      } else {
        alert(res.data.message || 'Failed to send warning email.');
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'An error occurred while sending the email.';
      alert(errorMsg);
    }
  };

  const handleVerifyPayment = async (id, status) => {
    try {
      const res = await axios.put(`/api/visa/${id}/verify-payment`, {
        paymentStatus: status,
        transactionId: `TXN-MANUAL-${Math.floor(Math.random()*10000)}`,
        amountPaid: 100
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(`Payment marked as ${status}!`);
        setApplications(prev => prev.filter(app => app._id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error(error);
      alert('Error updating payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleScannerInput = (e) => {
    if (e.key === 'Enter' && scanToken) {
      let extractedToken = scanToken.trim();
      // Handle if the scanner pasted the full URL from the QR code
      if (extractedToken.includes('token=')) {
        extractedToken = extractedToken.split('token=')[1].split('&')[0];
      }
      navigate(`/verify?token=${extractedToken}`);
      setScanToken('');
    }
  };

  const handleBorderAction = async (action) => {
    if (!scanToken) return alert('Please enter a secure token');
    let extractedToken = scanToken.trim();
    if (extractedToken.includes('token=')) {
      extractedToken = extractedToken.split('token=')[1].split('&')[0];
    }
    
    try {
      const resApp = await axios.get(`/api/visa/all?search=${extractedToken}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const app = resApp.data.applications.find(a => a.secureToken === extractedToken);
      if (!app) return alert('No application found with that token!');

      const res = await axios.post(`/api/visa/${app._id}/${action}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(`Successfully recorded ${action} for ${app.personalDetails?.firstName}!`);
        setScanToken('');
        fetchApplications();
      }
    } catch (error) {
      console.error(error);
      alert(`Error recording ${action}: ` + (error.response?.data?.message || error.message));
    }
  };

  const checkOverstays = async () => {
    handleTabChange('alerts');
    try {
      const res = await axios.post('/api/visa/check-overstays', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        setNewlyDetectedOverstays(res.data.newOverstayIds || []);
        fetchStats();
        fetchApplications('alerts');
      }
    } catch (error) {
      console.error(error);
      alert('Error checking overstays.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa] absolute inset-0 z-50">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'officer') {
    return <Navigate to="/login" replace />;
  }

  const { totalApps, pendingApps, approvedApps, rejectedApps, overstays } = stats;

  // Search filter across applications
  const searchedApps = applications.filter(app => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const firstName = app.personalDetails?.firstName || '';
    const lastName = app.personalDetails?.lastName || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const passport = (app.personalDetails?.passportNumber || app.passportNumber || '').toLowerCase();
    const id = (app._id || '').toLowerCase();
    const token = (app.secureToken || '').toLowerCase();
    const visaType = (app.visaType || '').toLowerCase();
    const status = (app.applicationStatus || '').toLowerCase();
    return (
      fullName.includes(query) ||
      passport.includes(query) ||
      id.includes(query) ||
      token.includes(query) ||
      visaType.includes(query) ||
      status.includes(query)
    );
  });

  // Tab specific filters
  const reviewApps = searchedApps;
  const paymentApps = searchedApps.filter(app => app.paymentStatus === 'Pending' || app.paymentStatus === 'Unverified');
  const borderApps = searchedApps.filter(app => app.applicationStatus === 'Approved' || ['Entered', 'Exited', 'Overstayed'].includes(app.entryStatus));
  const alertApps = searchedApps.filter(app => app.overstayAlert === true || app.entryStatus === 'Overstayed');

  return (
    <div className="flex h-screen bg-[#F4F7FA] font-sans text-gray-800 absolute inset-0 z-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0b3c5d] to-[#1d2731] shadow-xl border-r border-transparent hidden md:flex flex-col text-white">
        <div className="h-16 flex items-center px-6 border-b border-white/10 space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded bg-white p-1" />
          <span className="text-lg font-bold text-white tracking-tight">Admin Portal</span>
        </div>
        <div className="p-4 mt-2">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-4 px-2">Navigation</p>
          <nav className="flex-1 space-y-2 mt-4 px-3">
            <button onClick={() => handleTabChange('review')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'review' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <HomeIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Application Review</span>
            </button>
            <button onClick={() => handleTabChange('payments')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'payments' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <BanknotesIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Payment Verifications</span>
            </button>
            <button onClick={() => handleTabChange('border')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'border' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <ShieldCheckIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Border Control</span>
            </button>
            <button onClick={() => handleTabChange('alerts')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'alerts' ? 'bg-red-500/80 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <ExclamationTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Overstays & Alerts</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className="min-h-16 bg-white border-b border-gray-200 flex flex-col md:flex-row items-center justify-between p-4 lg:px-6 shadow-sm gap-4">
          <div className="flex items-center w-full md:w-auto gap-4">
            <button className="lg:hidden text-gray-500 hover:text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex flex-1 items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl md:w-96 transition-colors focus-within:border-primary focus-within:bg-white">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input 
              type="text" 
              placeholder="Search by Name, Passport, Visa ID, or QR Token..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700" 
            />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={checkOverstays} className="px-4 py-1.5 bg-gray-100 text-xs font-bold rounded-lg hover:bg-gray-200">Run Overstay Check</button>
            <div className="relative cursor-pointer">
              <BellIcon className="h-6 w-6 text-gray-400 hover:text-primary transition-colors" />
              {overstays > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
            </div>
            <div className="flex items-center cursor-pointer border-l border-gray-200 pl-6">
              <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold mr-3 border border-primary/20">
                {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-gray-700">{user.fullName || 'Officer Admin'}</span>
                 <button onClick={logout} className="text-xs text-red-500 font-semibold text-left hover:text-red-700 transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          
          {/* Review Tab */}
          {activeTab === 'review' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-lg border border-blue-400 flex items-center justify-between text-white transform hover:scale-105 transition-transform duration-300">
                  <div>
                    <p className="text-xs font-bold text-blue-100 mb-1 uppercase tracking-wider">Total Received</p>
                    <h3 className="text-4xl font-extrabold">{totalApps}</h3>
                  </div>
                  <DocumentCheckIcon className="h-10 w-10 text-blue-200 opacity-80" />
                </div>
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-2xl shadow-lg border border-amber-300 flex items-center justify-between text-white transform hover:scale-105 transition-transform duration-300">
                  <div>
                    <p className="text-xs font-bold text-amber-100 mb-1 uppercase tracking-wider">Pending Review</p>
                    <h3 className="text-4xl font-extrabold">{pendingApps}</h3>
                  </div>
                  <ChartPieIcon className="h-10 w-10 text-amber-200 opacity-80" />
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl shadow-lg border border-emerald-400 flex items-center justify-between text-white transform hover:scale-105 transition-transform duration-300">
                  <div>
                    <p className="text-xs font-bold text-emerald-100 mb-1 uppercase tracking-wider">Approved Visas</p>
                    <h3 className="text-4xl font-extrabold">{approvedApps}</h3>
                  </div>
                  <DocumentCheckIcon className="h-10 w-10 text-emerald-200 opacity-80" />
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-6 rounded-2xl shadow-lg border border-rose-400 flex items-center justify-between text-white transform hover:scale-105 transition-transform duration-300">
                  <div>
                    <p className="text-xs font-bold text-rose-100 mb-1 uppercase tracking-wider">Rejected Visas</p>
                    <h3 className="text-4xl font-extrabold">{rejectedApps}</h3>
                  </div>
                  <UsersIcon className="h-10 w-10 text-rose-200 opacity-80" />
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">E-Visa Applications Registry</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b-2 border-gray-200">
                          <th className="px-8 py-4 font-extrabold">Applicant</th>
                          <th className="px-8 py-4 font-extrabold">Category</th>
                          <th className="px-8 py-4 font-extrabold">Submission Date</th>
                          <th className="px-8 py-4 font-extrabold">Status</th>
                          <th className="px-8 py-4 font-extrabold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {loading && (
                          <tr><td colSpan="5" className="px-8 py-10 text-center"><div className="inline-flex items-center justify-center space-x-2 text-gray-400"><svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="font-medium animate-pulse">Loading records...</span></div></td></tr>
                        )}
                        {!loading && reviewApps.length === 0 && (
                          <tr><td colSpan="5" className="px-8 py-10 text-center text-gray-500 font-medium">No records found.</td></tr>
                        )}
                        {reviewApps.map((app) => (
                          <tr key={app._id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                            <td className="px-8 py-5">
                              <div className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors capitalize">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</div>
                              <div className="text-xs text-gray-400 font-mono mt-1">{app._id}</div>
                            </td>
                            <td className="px-8 py-5 text-gray-600 font-semibold">{app.visaType}</td>
                            <td className="px-8 py-5 text-gray-500 font-medium">{new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td className="px-8 py-5">
                              <span className={`px-4 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border ${
                                app.applicationStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                app.applicationStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                app.applicationStatus === 'Needs Revision' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>{app.applicationStatus === 'Under Review' ? 'Updated Revision' : app.applicationStatus}</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => setSelectedApplication(app)} className="text-white bg-primary hover:bg-blue-800 px-5 py-2 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Review</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              </div>
            </>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="text-lg font-bold text-gray-900 font-sans">Payment Verification Pipeline</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold border-b border-gray-100">Visa ID</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-100">Applicant</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-100">Payment Status</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading && (
                      <tr><td colSpan="4" className="px-6 py-10 text-center"><div className="inline-flex items-center justify-center space-x-2 text-gray-400"><svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="font-medium animate-pulse">Loading records...</span></div></td></tr>
                    )}
                    {!loading && paymentApps.length === 0 && (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 font-medium">No pending payment verifications found.</td></tr>
                    )}
                    {paymentApps.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{app._id}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-900 text-base capitalize">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-[11px] leading-5 font-bold uppercase tracking-wider rounded-md ${
                            app.paymentStatus === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                            app.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>{app.paymentStatus || 'Pending'}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleVerifyPayment(app._id, 'Completed')} className="text-white bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Mark Paid</button>
                          <button onClick={() => handleVerifyPayment(app._id, 'Failed')} className="text-white bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Mark Failed</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Border Control Tab */}
          {activeTab === 'border' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 font-sans mb-4">Border Control Scanner</h3>
                <div className="flex space-x-4">
                  <input 
                    type="text" 
                    placeholder="Scan QR Code or enter Secure Token..." 
                    value={scanToken} 
                    onChange={e => setScanToken(e.target.value)} 
                    onKeyDown={handleScannerInput}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary" 
                  />
                  <button onClick={() => handleBorderAction('entry')} className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">Record Entry</button>
                  <button onClick={() => handleBorderAction('exit')} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">Record Exit</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-gray-900 font-sans">Recent Border Movements</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Applicant</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Passport</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Entry Status</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Entry Date</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Exit Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {loading && (
                        <tr><td colSpan="5" className="px-6 py-10 text-center"><div className="inline-flex items-center justify-center space-x-2 text-gray-400"><svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="font-medium animate-pulse">Loading records...</span></div></td></tr>
                      )}
                      {!loading && borderApps.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-medium">No border records found.</td></tr>
                      )}
                      {borderApps.map((app) => {
                        const isOverstayed = app.entryStatus === 'Overstayed' || app.overstayAlert;
                        return (
                          <tr 
                            key={app._id} 
                            className={`transition-colors ${
                              isOverstayed 
                                ? 'bg-red-50/80 border-l-4 border-l-red-600 hover:bg-red-100/80 shadow-sm' 
                                : 'hover:bg-gray-50/50'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900 text-base capitalize flex items-center gap-2">
                                {app.personalDetails?.firstName} {app.personalDetails?.lastName}
                                {isOverstayed && (
                                  <span className="px-2 py-0.5 text-[10px] bg-red-600 text-white rounded-md font-extrabold uppercase tracking-wider shadow-sm shadow-red-500/30">
                                    OVERSTAY
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-mono font-bold uppercase">{app.personalDetails?.passportNumber}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1.5 inline-flex text-[11px] leading-5 font-extrabold uppercase tracking-wider rounded-lg border ${
                                app.entryStatus === 'Overstayed'
                                  ? 'bg-red-600 text-white border-red-700 shadow-md shadow-red-500/40 ring-2 ring-red-300 animate-pulse'
                                  : app.entryStatus === 'Entered'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                                  : app.entryStatus === 'Exited'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 font-bold'
                              }`}>
                                {app.entryStatus || 'Not Entered'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{app.entryDate ? new Date(app.entryDate).toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 text-gray-500">{app.exitDate ? new Date(app.exitDate).toLocaleString() : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden border-t-4 border-t-red-500">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="text-lg font-bold text-red-700 font-sans flex items-center"><ExclamationTriangleIcon className="w-6 h-6 mr-2"/> Overstay & Security Alerts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-red-50/50 text-red-700 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold border-b border-red-100">Applicant</th>
                      <th className="px-6 py-4 font-bold border-b border-red-100">Passport</th>
                      <th className="px-6 py-4 font-bold border-b border-red-100">Entry Date</th>
                      <th className="px-6 py-4 font-bold border-b border-red-100">Expiration Date</th>
                      <th className="px-6 py-4 font-bold border-b border-red-100 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 text-sm">
                    {loading && (
                      <tr><td colSpan="5" className="px-6 py-10 text-center"><div className="inline-flex items-center justify-center space-x-2 text-red-400"><svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="font-medium animate-pulse">Loading alerts...</span></div></td></tr>
                    )}
                    {alertApps.map((app) => (
                      <tr key={app._id} className={`transition-colors ${newlyDetectedOverstays.includes(app._id) ? 'bg-red-100/80 hover:bg-red-200 border-l-4 border-red-500 animate-pulse' : 'hover:bg-red-50/30'}`}>
                        <td className="px-6 py-4 text-gray-800 font-bold">
                          {app.personalDetails?.firstName} {app.personalDetails?.lastName}
                          {newlyDetectedOverstays.includes(app._id) && <span className="ml-3 px-2 py-0.5 text-[10px] bg-red-600 text-white rounded-full font-bold uppercase tracking-widest">NEW</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{app.personalDetails?.passportNumber || app.passportNumber || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-600">{app.entryDate ? new Date(app.entryDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{app.expirationDate ? new Date(app.expirationDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedApplication(app)} className="text-red-700 bg-red-100 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Investigate</button>
                        </td>
                      </tr>
                    ))}
                    {!loading && alertApps.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-10 text-gray-500">No active alerts. System is clear.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}




        </main>
      </div>

      {/* Review Modal Dialog */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-xl tracking-tight">Application Dossier</h3>
                <p className="text-xs text-blue-300 mt-1 font-mono">ID: {selectedApplication._id}</p>
              </div>
              <button onClick={() => { setSelectedApplication(null); setRejectionReason(''); }} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Personal Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Full Name</span>
                    <span className="font-bold text-slate-800 text-sm capitalize">{selectedApplication.personalDetails?.firstName} {selectedApplication.personalDetails?.lastName}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Passport Number</span>
                    <span className="font-mono font-bold text-slate-800 text-sm uppercase">{selectedApplication.personalDetails?.passportNumber || selectedApplication.passportNumber || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Nationality</span>
                    <span className="font-semibold text-slate-800 text-sm capitalize">{selectedApplication.personalDetails?.nationality || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Email Address</span>
                    <span className="font-semibold text-slate-800 text-sm break-all">{selectedApplication.personalDetails?.email || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Passport Expiry Date</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApplication.personalDetails?.passportExpiry ? new Date(selectedApplication.personalDetails.passportExpiry).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Purpose of Travel</span>
                    <span className="font-semibold text-slate-800 text-sm capitalize">{selectedApplication.purposeOfTravel || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Travel Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="sm:col-span-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Lodging / Host Address in Somalia</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApplication.travelDetails?.hostAddress || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Expected Arrival Date</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApplication.travelDetails?.arrivalDate ? new Date(selectedApplication.travelDetails.arrivalDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Expected Departure Date</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApplication.travelDetails?.departureDate ? new Date(selectedApplication.travelDetails.departureDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="sm:col-span-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Duration (Days)</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedApplication.visaDuration || 'N/A'} Days</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Documents & Artifacts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between">
                    <span className="text-gray-500 text-[11px] font-semibold block mb-2">Passport Scan</span>
                    {selectedApplication.passportDocument ? (
                      <a 
                        href={`${import.meta.env.VITE_API_URL || ''}/uploads/${selectedApplication.passportDocument.split(/[\\/]/).pop()}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors w-full"
                      >
                        <DocumentTextIcon className="w-4 h-4 text-blue-600" /> View Passport
                      </a>
                    ) : <span className="text-gray-400 font-medium">N/A</span>}
                  </div>
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between">
                    <span className="text-gray-500 text-[11px] font-semibold block mb-2">Applicant Photo</span>
                    {selectedApplication.supportingDocuments && selectedApplication.supportingDocuments[0] ? (
                      <a 
                        href={`${import.meta.env.VITE_API_URL || ''}/uploads/${selectedApplication.supportingDocuments[0].split(/[\\/]/).pop()}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors w-full"
                      >
                        <CameraIcon className="w-4 h-4 text-blue-600" /> View Photo
                      </a>
                    ) : <span className="text-gray-400 font-medium">N/A</span>}
                  </div>
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between">
                    <span className="text-gray-500 text-[11px] font-semibold block mb-2">Bank Statement</span>
                    {selectedApplication.supportingDocuments && selectedApplication.supportingDocuments[1] ? (
                      <a 
                        href={`${import.meta.env.VITE_API_URL || ''}/uploads/${selectedApplication.supportingDocuments[1].split(/[\\/]/).pop()}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors w-full"
                      >
                        <BuildingLibraryIcon className="w-4 h-4 text-blue-600" /> View Statement
                      </a>
                    ) : <span className="text-gray-400 font-medium">N/A</span>}
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Payment Verification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Payment Status</span>
                    <span className="font-extrabold text-emerald-600 text-sm uppercase">{selectedApplication.paymentStatus}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Transaction Reference</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{selectedApplication.paymentDetails?.transactionId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedApplication.qrCodeUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Generated Visa Assets</h4>
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 rounded-2xl p-4 shadow-lg shadow-blue-950/10 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                        <img src={selectedApplication.qrCodeUrl} alt="Visa Verification QR Code" className="w-24 h-24 rounded-lg object-contain" />
                      </div>
                      <div className="flex-1 space-y-2 text-xs w-full">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-md text-[10px] uppercase tracking-wider">
                            Official Digital Visa
                          </span>
                          {selectedApplication.applicationStatus === 'Approved' && (
                            <a
                              href={`${import.meta.env.VITE_API_URL || ''}/${(selectedApplication.pdfUrl || `uploads/pdfs/visa-${selectedApplication._id}.pdf`).replace(/\\/g, '/')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4 text-blue-600 inline" /> Download PDF
                            </a>
                          )}
                        </div>
                        <div className="bg-white/90 p-2.5 rounded-xl border border-gray-200/80 shadow-inner">
                          <span className="text-gray-400 font-bold uppercase text-[10px] block mb-0.5">Secure Token</span>
                          <span className="font-mono font-bold text-slate-800 text-xs break-all select-all">
                            {selectedApplication.secureToken}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 pt-0.5">
                          <span><strong>Expiration Date:</strong> {selectedApplication.expirationDate ? new Date(selectedApplication.expirationDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {['Submitted', 'Pending', 'Under Review', 'Needs Revision'].includes(selectedApplication.applicationStatus) && (
                <div className="bg-gradient-to-br from-slate-50 to-gray-100/70 border border-slate-200/80 rounded-2xl p-5 shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all duration-300">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Officer Comments
                  </label>
                  <input
                    type="text"
                    placeholder="Required for reject/revision..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status: <span className="text-gray-700">{selectedApplication.applicationStatus}</span></span>
              
              {['Submitted', 'Pending', 'Under Review', 'Needs Revision'].includes(selectedApplication.applicationStatus) ? (
                <div className="space-x-3">
                  <button onClick={() => handleUpdateStatus(selectedApplication._id, 'Rejected')} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md">Reject</button>
                  <button onClick={() => handleUpdateStatus(selectedApplication._id, 'Needs Revision')} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md">Request Revision</button>
                  <button onClick={() => handleUpdateStatus(selectedApplication._id, 'Approved')} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md">Approve Visa</button>
                </div>
              ) : (
                <div className="space-x-3">
                  {selectedApplication.overstayAlert && (
                    <button onClick={() => handleSendWarning(selectedApplication._id)} className="px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold text-sm rounded-xl transition-colors">
                      <ExclamationTriangleIcon className="w-4 h-4 inline mr-1 -mt-0.5" /> Send Warning Email
                    </button>
                  )}
                  <button onClick={() => setSelectedApplication(null)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm rounded-xl transition-colors">Close Dossier</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
