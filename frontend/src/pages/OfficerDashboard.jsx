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
  Bars3Icon
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

  // Border Control states
  const [scanToken, setScanToken] = useState('');

  // Retrieve user token
  const token = user ? user.token : null;

  const fetchApplications = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/visa/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

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
        setSelectedApplication(null);
        setRejectionReason('');
        fetchApplications();
      } else {
        alert('Failed to update status: ' + res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error updating application: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendWarning = async (id) => {
    if (!window.confirm("Are you sure you want to send an official overstay warning email to this applicant?")) return;
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
      alert('An error occurred while sending the email.');
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
        fetchApplications();
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
    // Find app by secureToken
    const app = applications.find(a => a.secureToken === extractedToken);
    if (!app) return alert('No application found with that token!');

    try {
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
    try {
      const res = await axios.post('/api/visa/check-overstays', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchApplications();
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

  const totalApps = applications.length;
  const pendingApps = applications.filter(app => ['Submitted', 'Pending', 'Under Review', 'Needs Revision'].includes(app.applicationStatus)).length;
  const approvedApps = applications.filter(app => app.applicationStatus === 'Approved').length;
  const rejectedApps = applications.filter(app => app.applicationStatus === 'Rejected').length;
  const overstays = applications.filter(app => app.overstayAlert).length;

  const filteredApps = applications.filter(app => {
    const fullName = `${app.personalDetails?.firstName || ''} ${app.personalDetails?.lastName || ''}`.toLowerCase();
    const passport = (app.personalDetails?.passportNumber || '').toLowerCase();
    const email = (app.personalDetails?.email || '').toLowerCase();
    const token = (app.secureToken || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || passport.includes(query) || email.includes(query) || app._id.includes(query) || token.includes(query);
  });

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
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('review')} className={`w-full flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'review' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <HomeIcon className="h-5 w-5 mr-3" /> Application Review
            </button>
            <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'payments' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <BanknotesIcon className="h-5 w-5 mr-3" /> Payment Verifications
            </button>
            <button onClick={() => setActiveTab('border')} className={`w-full flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'border' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <ShieldCheckIcon className="h-5 w-5 mr-3" /> Border Control
            </button>
            <button onClick={() => setActiveTab('alerts')} className={`w-full flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'alerts' ? 'bg-red-500/80 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <ExclamationTriangleIcon className="h-5 w-5 mr-3" /> Overstays & Alerts
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
                {loading ? (
                  <div className="text-center py-16 text-gray-500 font-medium animate-pulse">Loading applications...</div>
                ) : (
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
                        {filteredApps.map((app) => (
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
                              }`}>{app.applicationStatus}</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => setSelectedApplication(app)} className="text-white bg-primary hover:bg-blue-800 px-5 py-2 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Review</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                    {filteredApps.filter(app => app.paymentStatus === 'Pending').map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{app._id}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-900 text-base capitalize">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 inline-flex text-[11px] leading-5 font-bold uppercase tracking-wider rounded-md bg-yellow-50 text-yellow-700">Pending</span>
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
                      {filteredApps.filter(app => ['Entered', 'Exited'].includes(app.entryStatus)).map((app) => (
                        <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                             <div className="font-bold text-gray-900 text-base capitalize">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-mono font-bold uppercase">{app.personalDetails?.passportNumber}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 inline-flex text-[11px] leading-5 font-bold uppercase tracking-wider rounded-md border ${app.entryStatus === 'Entered' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{app.entryStatus}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{app.entryDate ? new Date(app.entryDate).toLocaleString() : '-'}</td>
                          <td className="px-6 py-4 text-gray-500">{app.exitDate ? new Date(app.exitDate).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
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
                    {filteredApps.filter(app => app.overstayAlert).map((app) => (
                      <tr key={app._id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-6 py-4 text-gray-800 font-bold">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</td>
                        <td className="px-6 py-4 text-gray-600">{app.personalDetails?.passportNumber}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(app.entryDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{new Date(app.expirationDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedApplication(app)} className="text-red-700 bg-red-100 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Investigate</button>
                        </td>
                      </tr>
                    ))}
                    {filteredApps.filter(app => app.overstayAlert).length === 0 && (
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500 text-xs block">Full Name</span><span className="font-semibold text-gray-800">{selectedApplication.personalDetails?.firstName} {selectedApplication.personalDetails?.lastName}</span></div>
                  <div><span className="text-gray-500 text-xs block">Passport Number</span><span className="font-mono font-semibold text-gray-800">{selectedApplication.personalDetails?.passportNumber || 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Nationality</span><span className="font-semibold text-gray-800">{selectedApplication.personalDetails?.nationality || 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Email Address</span><span className="font-semibold text-gray-800">{selectedApplication.personalDetails?.email || 'N/A'}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Documents & Artifacts</h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block mb-1">Passport Scan</span>
                    {selectedApplication.passportDocument ? <a href={`/uploads/${selectedApplication.passportDocument.split(/[\\/]/).pop()}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">📄 View Passport</a> : 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Applicant Photo</span>
                    {selectedApplication.supportingDocuments && selectedApplication.supportingDocuments[0] ? <a href={`/uploads/${selectedApplication.supportingDocuments[0].split(/[\\/]/).pop()}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">📷 View Photo</a> : 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Bank Statement</span>
                    {selectedApplication.supportingDocuments && selectedApplication.supportingDocuments[1] ? <a href={`/uploads/${selectedApplication.supportingDocuments[1].split(/[\\/]/).pop()}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">🏦 View Statement</a> : 'N/A'}
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Payment Verification</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500 text-xs block">Payment Status</span><span className="font-bold text-gray-800">{selectedApplication.paymentStatus}</span></div>
                  <div><span className="text-gray-500 text-xs block">Transaction Reference</span><span className="font-mono font-semibold text-gray-800">{selectedApplication.paymentDetails?.transactionId || 'N/A'}</span></div>
                </div>
              </div>

              {selectedApplication.qrCodeUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Generated Visa Assets</h4>
                  <div className="flex space-x-4 items-center">
                     <img src={selectedApplication.qrCodeUrl} alt="Visa QR" className="w-24 h-24 border border-gray-200 rounded-lg" />
                     <div className="text-xs text-gray-500">
                        <p><strong>Secure Token:</strong> <span className="font-mono">{selectedApplication.secureToken}</span></p>
                        <p><strong>Expiration:</strong> {new Date(selectedApplication.expirationDate).toLocaleDateString()}</p>
                     </div>
                  </div>
                </div>
              )}

              {['Submitted', 'Pending', 'Under Review', 'Needs Revision'].includes(selectedApplication.applicationStatus) && (
                <div className="border-t border-gray-100 pt-6 space-y-4 bg-gray-50 p-4 rounded-xl">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Officer Comments</label>
                      <input type="text" placeholder="Required for reject/revision..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800" />
                    </div>
                  </div>
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
