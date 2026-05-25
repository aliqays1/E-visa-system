import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ApplyVisa from './pages/ApplyVisa';
import TrackVisa from './pages/TrackVisa';
import About from './pages/About';
import VerifyVisa from './pages/VerifyVisa';
import Footer from './components/Footer';

// Dashboard imports
import ApplicantDashboard from './pages/ApplicantDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AuditorDashboard from './pages/AuditorDashboard';

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/applicant') || 
                      location.pathname.startsWith('/auditor');

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex flex-col">
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<ApplyVisa />} />
          <Route path="/track" element={<TrackVisa />} />
          <Route path="/about" element={<About />} />
          <Route path="/verify" element={<VerifyVisa />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/applicant/*" element={<ApplicantDashboard />} />
          <Route path="/admin/*" element={<OfficerDashboard />} />
          <Route path="/auditor/*" element={<AuditorDashboard />} />
        </Routes>
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
