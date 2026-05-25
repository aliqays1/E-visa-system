import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';

const ApplicantDashboard = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisa, setSelectedVisa] = useState(null); // For viewing visa details/QR code

  // Retrieve user token
  const token = user ? user.token : null;

  const fetchApplications = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/visa/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa]">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Retrieve pending application from localStorage if it exists
  const pendingVisa = JSON.parse(localStorage.getItem('pendingVisaApplication'));

  const handleSubmitDraft = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('visaType', pendingVisa.visaType);
      formDataToSend.append('purposeOfTravel', pendingVisa.purpose || 'Travel');
      formDataToSend.append('paymentMethod', pendingVisa.paymentMethod || 'Credit Card');
      formDataToSend.append('amountPaid', pendingVisa.amountPaid || 0);
      formDataToSend.append('paymentStatus', pendingVisa.paymentStatus || 'Completed');
      formDataToSend.append('visaDuration', pendingVisa.duration || '30');
      
      // Personal Details object
      formDataToSend.append('personalDetails', JSON.stringify({
        firstName: pendingVisa.firstName,
        lastName: pendingVisa.lastName,
        nationality: pendingVisa.nationality,
        passportExpiry: pendingVisa.passportExpiry,
        passportNumber: pendingVisa.passportNumber,
        email: pendingVisa.email
      }));

      // Travel Details object
      formDataToSend.append('travelDetails', JSON.stringify({
        arrivalDate: pendingVisa.arrivalDate,
        departureDate: pendingVisa.departureDate,
        hostAddress: pendingVisa.hostAddress,
        phone: pendingVisa.phone
      }));

      // Helper function to convert Data URI to Blob
      const dataURItoBlob = (dataURI) => {
        if (!dataURI) return null;
        try {
          const splitDataURI = dataURI.split(',');
          const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
          const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
          const ia = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new Blob([ia], { type: mimeString });
        } catch (e) {
          return null;
        }
      };

      // Retrieve real blobs from localStorage or fallback to dummy blobs if not available
      const passportBlob = dataURItoBlob(pendingVisa.passportScanData) || new Blob(['passport scan dummy content'], { type: 'image/jpeg' });
      const photoBlob = dataURItoBlob(pendingVisa.selfieData) || new Blob(['selfie dummy content'], { type: 'image/jpeg' });
      const supportBlob = dataURItoBlob(pendingVisa.supportingDocData) || new Blob(['bank statement dummy content'], { type: 'application/pdf' });

      formDataToSend.append('passportDocument', passportBlob, pendingVisa.passportScanName || 'passport_scan.jpg');
      formDataToSend.append('photoDocument', photoBlob, pendingVisa.selfieName || 'photo_selfie.jpg');
      if (pendingVisa.supportingDocName) {
        formDataToSend.append('supportingDocument', supportBlob, pendingVisa.supportingDocName);
      }

      const res = await axios.post('/api/visa/apply', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data.success) {
        alert('Visa application submitted successfully!');
        localStorage.removeItem('pendingVisaApplication');
        fetchApplications();
      } else {
        alert('Failed to submit application: ' + res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit application: ' + (error.response?.data?.message || error.message));
    }
  };

  // Compute KPI counts dynamically
  const totalApps = applications.length;
  const pendingApps = applications.filter(app => app.applicationStatus === 'Submitted' || app.applicationStatus === 'Under Review').length;
  const approvedApps = applications.filter(app => app.applicationStatus === 'Approved').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <div className="flex items-center space-x-3 text-center md:text-left">
          <span className="text-2xl">🇸🇴</span>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Somalia E-Visa Applicant Portal</h1>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-3 md:space-x-6">
          <span className="text-sm font-medium text-gray-600 hidden md:block">
            Welcome, <span className="text-primary font-bold">{user.fullName || 'Applicant'}</span>
          </span>
          <Link to="/" className="text-sm px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
            Home
          </Link>
          <button onClick={logout} className="text-sm px-4 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
             <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Applications</div>
             <div className="text-3xl font-extrabold text-gray-900">{totalApps}</div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-yellow-500">
             <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pending Review</div>
             <div className="text-3xl font-extrabold text-gray-900">{pendingApps}</div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
             <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Approved Visas</div>
             <div className="text-3xl font-extrabold text-gray-900">{approvedApps}</div>
           </div>
        </div>

        {/* Draft Notification Card */}
        {pendingVisa && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-8 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase rounded-full tracking-wider mb-2 inline-block">Draft Application Detected</span>
              <h3 className="text-xl font-bold text-blue-900 mb-1">{pendingVisa.visaType} Visa</h3>
              <p className="text-blue-800 text-sm">
                <strong>Applicant:</strong> {pendingVisa.firstName} {pendingVisa.lastName} | <strong>Passport:</strong> {pendingVisa.passportNumber}
              </p>
            </div>
            <div>
               <button onClick={handleSubmitDraft} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-transform hover:-translate-y-0.5 whitespace-nowrap">
                Submit Draft Application
              </button>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Your Visa Records</h2>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading visa applications...</div>
          ) : applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <th className="p-4 pl-6">Visa Type</th>
                    <th className="p-4">Reference ID</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50/40">
                      <td className="p-4 pl-6 font-semibold text-gray-800">{app.visaType} Visa</td>
                      <td className="p-4 font-mono text-xs text-gray-500">{app._id}</td>
                      <td className="p-4 text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          app.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {app.paymentStatus === 'Completed' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          app.applicationStatus === 'Approved' ? 'bg-green-50 text-green-700' :
                          app.applicationStatus === 'Rejected' ? 'bg-red-50 text-red-700' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        {app.applicationStatus === 'Approved' && (
                          <button 
                            onClick={() => setSelectedVisa(app)}
                            className="text-xs px-3.5 py-1.5 bg-green-600 text-white hover:bg-green-700 font-bold rounded-lg transition-colors"
                          >
                            View e-Visa
                          </button>
                        )}
                        {app.applicationStatus === 'Rejected' && (
                          <span className="text-xs text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg inline-block max-w-[200px] truncate" title={app.rejectionReason || 'Requirements not met.'}>
                            {app.rejectionReason || 'Requirements not met.'}
                          </span>
                        )}
                        {(app.applicationStatus === 'Submitted' || app.applicationStatus === 'Under Review') && (
                          <span className="text-xs text-gray-400 font-medium italic">Processing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-gray-500 mb-6 text-base font-medium">You have no active visa applications.</p>
              <button onClick={() => window.location.href='/apply'} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5">
                Apply for a New Visa
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal for viewing approved e-Visa and QR Code verification details */}
      {selectedVisa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white text-center relative">
              <button 
                onClick={() => setSelectedVisa(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
              >
                ✕
              </button>
              <span className="text-3xl block mb-2">🇸🇴</span>
              <h3 className="font-extrabold text-xl tracking-tight">Federal Republic of Somalia</h3>
              <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mt-1">Immigration & Citizenship e-Visa</p>
            </div>

            {/* Visa Contents */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-medium uppercase block">Applicant Name</span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedVisa.personalDetails?.firstName} {selectedVisa.personalDetails?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium uppercase block">Passport Number</span>
                  <span className="text-sm font-bold text-gray-800 font-mono">
                    {selectedVisa.personalDetails?.passportNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium uppercase block">Visa Type</span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedVisa.visaType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium uppercase block">Duration of Stay</span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedVisa.visaDuration} Days
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium uppercase block">Approval Date</span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedVisa.approvalDate ? new Date(selectedVisa.approvalDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium uppercase block">Expiry Date</span>
                  <span className="text-sm font-bold text-green-600 font-bold">
                    {selectedVisa.expirationDate ? new Date(selectedVisa.expirationDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* QR Verification */}
              {selectedVisa.qrCodeUrl && (
                <div className="border-t border-gray-100 pt-6 flex flex-col items-center">
                  <img src={selectedVisa.qrCodeUrl} alt="Visa Verification QR Code" className="w-40 h-40 border border-gray-200 p-2 rounded-xl" />
                  <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">Scan code to verify authenticity</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-gray-100">
              <span className="text-[10px] text-gray-400 font-mono">Ref: {selectedVisa._id}</span>
              <div className="flex gap-2">
                {selectedVisa.pdfUrl && (
                  <a 
                    href={`/${selectedVisa.pdfUrl.replace(/\\/g, '/')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-4 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 flex items-center transition-colors"
                  >
                    Download Official PDF
                  </a>
                )}
                <button 
                  onClick={() => window.print()}
                  className="text-xs px-4 py-2 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Print Screen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;
