import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  BellAlertIcon,
  ClockIcon,
  Bars3Icon,
  PrinterIcon,
  ArrowDownTrayIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AuditorDashboard = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const token = user ? user.token : null;

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [stats, setStats] = useState({ totalApps: 0, approved: 0, rejected: 0, pending: 0, overstays: 0 });
  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Report State
  const [reportMonth, setReportMonth] = useState(''); // YYYY-MM
  const [reportStatus, setReportStatus] = useState('All');
  const [reportPayment, setReportPayment] = useState('All');

  const filteredReportApps = applications.filter(app => {
    let match = true;
    if (reportStatus !== 'All') {
      if (reportStatus === 'Pending' && !['Submitted', 'Pending', 'Under Review'].includes(app.applicationStatus)) match = false;
      else if (reportStatus === 'Renewal' && app.applicationType !== 'Renewal') match = false;
      else if (reportStatus === 'Active' && app.applicationStatus !== 'Active') match = false;
      else if (reportStatus === 'Needs Revision' && app.applicationStatus !== 'Needs Revision') match = false;
      else if (!['Pending', 'Renewal', 'Active', 'Needs Revision'].includes(reportStatus) && app.applicationStatus !== reportStatus) match = false;
    }
    if (reportPayment !== 'All') {
      if (app.paymentStatus !== reportPayment && !(reportPayment === 'Pending' && !app.paymentStatus)) match = false;
    }
    if (reportMonth) {
      const appMonth = new Date(app.createdAt).toISOString().substring(0, 7);
      if (appMonth !== reportMonth) match = false;
    }
    return match;
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    
    // Branding Header
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    doc.text(formattedDate, 14, 15);
    doc.text("Somalia E-Visa Portal", centerX, 15, { align: 'center' });
    
    const badgeText = "Official Portal of the Federal Republic of Somalia — Immigration & Citizenship Service";
    doc.setFontSize(10);
    const textWidth = doc.getTextWidth(badgeText);
    const badgeStartX = centerX - (textWidth / 2) - 8;
    
    doc.setFillColor(59, 130, 246); // blue-500
    doc.roundedRect(badgeStartX, 22, 6, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("*", badgeStartX + 3, 26.5, { align: 'center' }); 
    
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(badgeText, badgeStartX + 8, 26.5);
    
    doc.setDrawColor(156, 163, 175); // gray-400
    doc.setLineWidth(0.5);
    doc.line(14, 32, pageWidth - 14, 32);

    // Header text
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text("Visa Operations Report", 14, 52);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // text-gray-500
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 60);
    
    // Filters info
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55); // text-gray-800
    doc.text(`Period: ${reportMonth || 'All Time'}    Visa Status: ${reportStatus}    Payment Status: ${reportPayment}`, 14, 70);
    
    // Summary info
    const totalRev = filteredReportApps.filter(a => a.paymentStatus === 'Completed').reduce((s, a) => s + (a.paymentDetails?.amountPaid || 100), 0).toLocaleString();
    const totalRenewals = filteredReportApps.filter(a => a.applicationType === 'Renewal').length;
    const totalActive = filteredReportApps.filter(a => a.applicationStatus === 'Active').length;
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229); // text-indigo-600
    doc.text(`Total Records: ${filteredReportApps.length}`, 14, 80);
    doc.setTextColor(22, 163, 74); // text-green-600
    doc.text(`Total Revenue: $${totalRev}`, 60, 80);
    doc.setTextColor(124, 58, 237); // purple
    doc.text(`Renewals: ${totalRenewals}`, 120, 80);
    doc.setTextColor(5, 150, 105); // emerald
    doc.text(`Active: ${totalActive}`, 165, 80);
    
    // Table
    const tableColumn = ["Applicant Name", "Passport", "Visa Type", "Category", "Submission Date", "Status", "Payment"];
    const tableRows = [];

    filteredReportApps.forEach(app => {
      const firstName = app.personalDetails?.firstName || '';
      const lastName = app.personalDetails?.lastName || '';
      const isRenewal = app.applicationType === 'Renewal';
      const renewalCount = app.renewalCount || 0;
      let nameSuffix = isRenewal ? ' [RENEWAL]' : (renewalCount > 0 ? ` [${renewalCount}x RENEWED]` : '');
      const name = `${firstName} ${lastName}${nameSuffix}`;
      const passport = app.personalDetails?.passportNumber || '';
      const type = app.visaType || '';
      const category = isRenewal ? 'Renewal' : 'New';
      const date = new Date(app.createdAt).toLocaleDateString();
      const rawStatus = app.applicationStatus || '';
      const status = rawStatus === 'Submitted' ? 'Pending' : rawStatus;
      const payment = app.paymentStatus === 'Completed' ? `$${app.paymentDetails?.amountPaid || 100}` : (app.paymentStatus || 'Pending');
      
      tableRows.push([name, passport, type, category, date, status, payment]);
    });

    autoTable(doc, {
      startY: 85,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [249, 250, 251], textColor: [107, 114, 128], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      didParseCell: function(data) {
        if (data.section === 'body') {
           // Color Status and Payment
           if (data.column.index === 5) { // Status
             const val = data.cell.raw.toString().toUpperCase();
             if (val === 'ACTIVE' || val === 'APPROVED') data.cell.styles.textColor = [5, 150, 105];
             else if (val === 'REJECTED') data.cell.styles.textColor = [220, 38, 38];
             else if (val === 'NEEDS REVISION') data.cell.styles.textColor = [202, 138, 4];
             else data.cell.styles.textColor = [202, 138, 4];
           }
           if (data.column.index === 3) { // Category
             const val = data.cell.raw.toString();
             if (val === 'Renewal') data.cell.styles.textColor = [124, 58, 237];
             else data.cell.styles.textColor = [37, 99, 235];
           }
           if (data.column.index === 6) { // Payment
             const val = data.cell.raw.toString().toUpperCase();
             if (val.startsWith('$')) data.cell.styles.textColor = [22, 163, 74];
             else data.cell.styles.textColor = [107, 114, 128];
           }
        }
      }
    });

    doc.save(`visa_report_${reportMonth || 'all'}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (token && user && user.role === 'auditor') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const statsRes = await axios.get('/api/auditor/overview', { headers });
      if (statsRes.data.success) setStats(statsRes.data.stats);

      const appsRes = await axios.get('/api/auditor/applications', { headers });
      if (appsRes.data.success) setApplications(appsRes.data.applications);

      const logsRes = await axios.get('/api/auditor/activity-logs', { headers });
      if (logsRes.data.success) setLogs(logsRes.data.logs);

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa]">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'auditor') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex relative">
      {/* Sidebar Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}
      <aside className={`w-64 bg-[#1e293b] text-white flex flex-col shadow-xl z-50 fixed lg:sticky top-0 h-screen transition-transform duration-300 print:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center space-x-3 border-b border-gray-700 bg-[#0f172a]">
          <div className="bg-white p-1.5 rounded-xl shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">Auditor Portal</h2>
        </div>
        
        <div className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
          Auditor Panels
        </div>

        <nav className="flex-1 px-4 space-y-5 mt-4">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <ChartBarIcon className="h-5 w-5" />
            <span>Overview KPIs</span>
          </button>
          <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'applications' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <DocumentTextIcon className="h-5 w-5" />
            <span>Applications Registry</span>
          </button>
          <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <ClockIcon className="h-5 w-5" />
            <span>Activity Logs</span>
          </button>
          <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <CurrencyDollarIcon className="h-5 w-5" />
            <span>Payment Records</span>
          </button>
          <button onClick={() => setActiveTab('border')} className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'border' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <GlobeAltIcon className="h-5 w-5" />
            <span>Border Movements</span>
          </button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <PresentationChartLineIcon className="h-5 w-5" />
            <span>Reports & Analytics</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        <header className="bg-white px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 shadow-sm sticky top-0 z-10 gap-4 print:hidden">
          <div className="flex w-full sm:w-auto items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-indigo-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-1 flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 sm:w-96">
              <span className="text-sm text-gray-500 italic">Read-Only Mode Active</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center h-10 w-10 bg-indigo-100 rounded-full text-indigo-700 font-bold border border-indigo-200">
              AU
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{user?.fullName}</div>
              <div className="text-xs text-red-500 font-bold cursor-pointer hover:underline" onClick={logout}>Logout</div>
            </div>
          </div>
        </header>

        <div className="p-8 print:p-0">
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Header / Security Status */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
                      <p className="text-sm text-gray-500 mt-1">Real-time oversight of the Somalia E-Visa ecosystem.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 font-bold text-sm">
                      <ShieldCheckIcon className="h-5 w-5" />
                      <span>Security Status: Optimal</span>
                    </div>
                  </div>

                  {/* Main KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Apps</div>
                          <div className="text-4xl font-extrabold text-gray-900">{stats.totalApps}</div>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DocumentTextIcon className="h-6 w-6"/></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pending</div>
                          <div className="text-4xl font-extrabold text-gray-900">{stats.pending}</div>
                        </div>
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><ClockIcon className="h-6 w-6"/></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Approved</div>
                          <div className="text-4xl font-extrabold text-gray-900">{stats.approved}</div>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheckIcon className="h-6 w-6"/></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Rejected</div>
                          <div className="text-4xl font-extrabold text-gray-900">{stats.rejected}</div>
                        </div>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ChartBarIcon className="h-6 w-6"/></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Overstays</div>
                          <div className="text-4xl font-extrabold text-gray-900">{stats.overstays}</div>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><BellAlertIcon className="h-6 w-6"/></div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Level: Volume & Recent Activity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Volume Visualizer */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6">Processing Volume Breakdown</h3>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                            <span>Approval Rate</span>
                            <span>{stats.totalApps > 0 ? Math.round((stats.approved / stats.totalApps) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                            <div className="bg-green-500 h-4" style={{ width: `${stats.totalApps > 0 ? (stats.approved / stats.totalApps) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                            <span>Rejection Rate</span>
                            <span>{stats.totalApps > 0 ? Math.round((stats.rejected / stats.totalApps) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                            <div className="bg-red-500 h-4" style={{ width: `${stats.totalApps > 0 ? (stats.rejected / stats.totalApps) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                            <span>Pending Processing</span>
                            <span>{stats.totalApps > 0 ? Math.round((stats.pending / stats.totalApps) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                            <div className="bg-yellow-400 h-4" style={{ width: `${stats.totalApps > 0 ? (stats.pending / stats.totalApps) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Mini-Feed */}
                    <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Latest Activity</h3>
                        <button onClick={() => setActiveTab('logs')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View All</button>
                      </div>
                      <div className="space-y-4">
                        {logs.slice(0, 5).map(log => (
                          <div key={log._id} className="flex space-x-3 items-start border-l-2 border-indigo-100 pl-3">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 -ml-[17px]"></div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{log.action}</div>
                              <div className="text-xs text-gray-500 mt-0.5">by {log.officerName} • {new Date(log.createdAt).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        ))}
                        {logs.length === 0 && <div className="text-sm text-gray-500 italic">No recent activity.</div>}
                      </div>
                    </div>
                  </div>

                  {/* Financial & Security Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
                    
                    {/* Revenue Overview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Financial Overview</h3>
                        <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex items-center justify-center p-6 bg-green-50 rounded-xl border border-green-100">
                        <div className="text-center">
                          <div className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Total Revenue Collected</div>
                          <div className="text-4xl font-extrabold text-green-700">
                            ${applications.filter(a => a.paymentStatus === 'Completed').reduce((sum, a) => sum + (a.paymentDetails?.amountPaid || 100), 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                          <div className="text-xs text-gray-500 font-bold uppercase mb-1">Completed Payments</div>
                          <div className="text-xl font-bold text-gray-900">{applications.filter(a => a.paymentStatus === 'Completed').length}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                          <div className="text-xs text-gray-500 font-bold uppercase mb-1">Pending Payments</div>
                          <div className="text-xl font-bold text-gray-900">{applications.filter(a => a.paymentStatus !== 'Completed').length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Active Overstay Alerts */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Critical Overstay Alerts</h3>
                        <BellAlertIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="space-y-3">
                        {applications.filter(a => a.overstayAlert).slice(0, 4).map(app => (
                          <div key={app._id} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                            <div>
                              <div className="font-bold text-red-900">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</div>
                              <div className="text-xs text-red-700">Passport: {app.personalDetails?.passportNumber}</div>
                            </div>
                            <button onClick={() => setSelectedApplication(app)} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200">Inspect</button>
                          </div>
                        ))}
                        {applications.filter(a => a.overstayAlert).length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-green-600">
                            <ShieldCheckIcon className="h-10 w-10 mb-2 opacity-50" />
                            <span className="font-bold text-sm">No active overstay alerts.</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {activeTab === 'applications' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Applications Registry</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Applicant</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {applications.map(app => (
                          <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900 capitalize">
                                {app.personalDetails?.firstName} {app.personalDetails?.lastName}
                                {app.applicationType === 'Renewal' && (
                                  <span className="ml-2 px-2 py-0.5 text-[10px] bg-purple-600 text-white rounded-md font-extrabold uppercase tracking-wider shadow-sm">
                                    RENEWAL
                                  </span>
                                )}
                                {app.renewalCount > 0 && app.applicationType !== 'Renewal' && (
                                  <span className="ml-2 px-2 py-0.5 text-[10px] bg-purple-100 text-purple-800 rounded font-extrabold uppercase tracking-wider">
                                    {app.renewalCount} RENEWAL{app.renewalCount > 1 ? 'S' : ''}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 font-mono mt-0.5">{app._id}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-medium">{app.visaType}</td>
                            <td className="px-6 py-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                app.applicationStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                app.applicationStatus === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                app.applicationStatus === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                                app.applicationStatus === 'Needs Revision' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                app.applicationStatus === 'Renewal Pending' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              }`}>
                                {app.applicationStatus === 'Submitted' ? 'Pending' :
                                 app.applicationStatus === 'Under Review' ? 'Updated Revision' :
                                 app.applicationStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => setSelectedApplication(app)} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors font-bold text-xs uppercase tracking-wider">Inspect</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Officer Activity Logs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Officer</th>
                          <th className="px-6 py-4">Action</th>
                          <th className="px-6 py-4">Details</th>
                          <th className="px-6 py-4">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {logs.map(log => (
                          <tr key={log._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{log.officerName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                log.action.includes('Approved') ? 'bg-green-100 text-green-700' :
                                log.action.includes('Rejected') ? 'bg-red-100 text-red-700' :
                                log.action.includes('Login') ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                log.action.includes('Entry') ? 'bg-blue-100 text-blue-700' :
                                log.action.includes('Exit') ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-xs">{log.details}</td>
                            <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.ipAddress || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Payment Audit Trail</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Applicant</th>
                          <th className="px-6 py-4">App ID</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Txn ID</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {applications.filter(a => a.paymentStatus).map(app => (
                          <tr key={app._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-bold text-gray-900">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</td>
                            <td className="px-6 py-4 text-gray-400 font-mono text-xs">{app._id}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                app.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {app.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-mono text-xs">{app.paymentDetails?.transactionId || 'N/A'}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900">${app.paymentDetails?.amountPaid || '100'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'border' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Border Movements & Overstays</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Traveler</th>
                          <th className="px-6 py-4">Passport</th>
                          <th className="px-6 py-4">Entry Status</th>
                          <th className="px-6 py-4">Entry Date</th>
                          <th className="px-6 py-4">Exit Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {applications.filter(a => a.applicationStatus === 'Approved' && a.entryStatus).map(app => (
                          <tr key={app._id} className={`hover:bg-gray-50 ${app.overstayAlert ? 'bg-red-50/50' : ''}`}>
                            <td className="px-6 py-4 font-bold text-gray-900">
                              {app.personalDetails?.firstName} {app.personalDetails?.lastName}
                              {app.overstayAlert && <BellAlertIcon className="h-4 w-4 text-red-500 inline ml-2 mb-1" />}
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-mono">{app.personalDetails?.passportNumber}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${
                                app.entryStatus === 'Overstayed' ? 'bg-red-600 text-white shadow-md shadow-red-500/30 ring-2 ring-red-300 animate-pulse' :
                                app.entryStatus === 'Entered' ? 'bg-blue-100 text-blue-700 font-bold' :
                                app.entryStatus === 'Exited' ? 'bg-emerald-100 text-emerald-700 font-bold' :
                                'bg-gray-100 text-gray-700 font-bold'
                              }`}>
                                {app.entryStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-xs">{app.entryDate ? new Date(app.entryDate).toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 text-gray-500 text-xs">{app.exitDate ? new Date(app.exitDate).toLocaleString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div id="report-content" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center print:hidden">
                    <h3 className="text-lg font-bold text-gray-900">Custom Reports & Analytics</h3>
                    <div className="flex space-x-3">
                       <button onClick={handlePrint} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-bold flex items-center shadow-sm">
                         <PrinterIcon className="h-4 w-4 mr-2" /> Print Report
                       </button>
                       <button onClick={handleDownloadPDF} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center shadow-sm">
                         <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Download PDF
                       </button>
                    </div>
                  </div>
                  
                  {/* Filters - Hidden when printing */}
                  <div className="p-6 border-b border-gray-200 bg-white grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter by Month</label>
                        <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Visa Status</label>
                        <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                           <option value="All">All Statuses</option>
                           <option value="Active">Active</option>
                           <option value="Approved">Approved</option>
                           <option value="Rejected">Rejected</option>
                           <option value="Renewal">Renewal (Pending)</option>
                           <option value="Pending">Pending / Submitted</option>
                           <option value="Needs Revision">Needs Revision</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Status</label>
                        <select value={reportPayment} onChange={(e) => setReportPayment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                           <option value="All">All Payments</option>
                           <option value="Completed">Completed</option>
                           <option value="Pending">Pending</option>
                        </select>
                     </div>
                  </div>

                  {/* Print Header - Visible only when printing */}
                  <div className="hidden print:block p-8 border-b border-gray-200">
                     <h2 className="text-2xl font-extrabold text-gray-900">Visa Operations Report</h2>
                     <p className="text-gray-500 mt-2">Generated on: {new Date().toLocaleString()}</p>
                     <div className="mt-4 flex space-x-8 text-sm">
                        <div><strong>Period:</strong> {reportMonth || 'All Time'}</div>
                        <div><strong>Visa Status:</strong> {reportStatus}</div>
                        <div><strong>Payment Status:</strong> {reportPayment}</div>
                     </div>
                  </div>

                  {/* Report Data Table */}
                  <div className="overflow-x-auto p-6">
                    <div className="mb-4 flex flex-wrap gap-4 text-sm print:mb-8">
                       <div className="font-bold text-gray-700">Total Records: <span className="text-indigo-600">{filteredReportApps.length}</span></div>
                       <div className="font-bold text-gray-700">Total Revenue: <span className="text-green-600">${filteredReportApps.filter(a => a.paymentStatus === 'Completed').reduce((s, a) => s + (a.paymentDetails?.amountPaid || 100), 0).toLocaleString()}</span></div>
                       <div className="font-bold text-gray-700">Renewals: <span className="text-purple-600">{filteredReportApps.filter(a => a.applicationType === 'Renewal').length}</span></div>
                       <div className="font-bold text-gray-700">Active: <span className="text-emerald-600">{filteredReportApps.filter(a => a.applicationStatus === 'Active').length}</span></div>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-y border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-widest">
                          <th className="px-4 py-3">Applicant Name</th>
                          <th className="px-4 py-3">Passport</th>
                          <th className="px-4 py-3">Visa Type</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Submission Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredReportApps.length > 0 ? filteredReportApps.map(app => (
                          <tr key={app._id} className="hover:bg-gray-50 transition-colors break-inside-avoid">
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-900 capitalize">
                                {app.personalDetails?.firstName} {app.personalDetails?.lastName}
                                {app.applicationType === 'Renewal' && (
                                  <span className="ml-2 px-2 py-0.5 text-[9px] bg-purple-600 text-white rounded font-extrabold uppercase tracking-wider">RENEWAL</span>
                                )}
                                {app.renewalCount > 0 && app.applicationType !== 'Renewal' && (
                                  <span className="ml-2 px-2 py-0.5 text-[9px] bg-purple-100 text-purple-800 rounded font-extrabold uppercase tracking-wider">{app.renewalCount}x RENEWED</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{app.personalDetails?.passportNumber}</td>
                            <td className="px-4 py-3 text-gray-600">{app.visaType}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                app.applicationType === 'Renewal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {app.applicationType === 'Renewal' ? 'Renewal' : 'New'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider print:border print:border-gray-300 ${
                                app.applicationStatus === 'Active'    ? 'bg-emerald-100 text-emerald-800' :
                                app.applicationStatus === 'Approved'  ? 'bg-emerald-100 text-emerald-700' :
                                app.applicationStatus === 'Rejected'  ? 'bg-red-100 text-red-700' :
                                app.applicationStatus === 'Needs Revision' ? 'bg-amber-100 text-amber-700' :
                                app.applicationStatus === 'Renewal Pending' ? 'bg-purple-100 text-purple-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {app.applicationStatus === 'Submitted' ? 'Pending' : app.applicationStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider print:border print:border-gray-300 ${
                                app.paymentStatus === 'Completed' ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {app.paymentStatus === 'Completed' ? `$${app.paymentDetails?.amountPaid || 100}` : app.paymentStatus || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                           <tr>
                             <td colSpan="7" className="px-4 py-8 text-center text-gray-500 italic">No applications match your filter criteria.</td>
                           </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Audit Inspection</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">{selectedApplication._id}</p>
              </div>
              <button onClick={() => setSelectedApplication(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Applicant Profile</h4>
                  <div className="space-y-3">
                    <div><span className="text-gray-500 text-sm">Full Name:</span> <span className="font-bold text-gray-900 ml-2">{selectedApplication.personalDetails?.firstName} {selectedApplication.personalDetails?.lastName}</span></div>
                    <div><span className="text-gray-500 text-sm">Passport:</span> <span className="font-mono text-gray-900 ml-2">{selectedApplication.personalDetails?.passportNumber}</span></div>
                    <div><span className="text-gray-500 text-sm">Nationality:</span> <span className="font-medium text-gray-900 ml-2">{selectedApplication.personalDetails?.nationality}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Visa Details</h4>
                  <div className="space-y-3">
                    <div><span className="text-gray-500 text-sm">Type:</span> <span className="font-medium text-gray-900 ml-2">{selectedApplication.visaType} Visa</span></div>
                    <div><span className="text-gray-500 text-sm">Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        selectedApplication.applicationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                        selectedApplication.applicationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedApplication.applicationStatus}
                      </span>
                    </div>
                    {selectedApplication.officerId && (
                      <div><span className="text-gray-500 text-sm">Processed By:</span> <span className="font-medium text-indigo-700 ml-2">{selectedApplication.officerId.fullName}</span></div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Border Control Scans</h4>
                {selectedApplication.scannedHistory && selectedApplication.scannedHistory.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedApplication.scannedHistory.map((scan, idx) => (
                      <li key={idx} className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="font-bold">{scan.action}</span> at {scan.location} on {new Date(scan.date).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No border scans recorded.</p>
                )}
              </div>
            </div>
            
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-right">
              <button onClick={() => setSelectedApplication(null)} className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">Close Inspection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditorDashboard;
