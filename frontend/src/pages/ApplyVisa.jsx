import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { IdentificationIcon, CameraIcon, PaperAirplaneIcon, CreditCardIcon, CheckCircleIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import CountryAutocomplete from '../components/CountryAutocomplete';

// ─── Custom Premium Dropdown ──────────────────────────────────────────────────
const CustomSelect = ({ name, value, onChange, options, placeholder = 'Select an option', required, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => String(o.value) === String(value));

  const handleSelect = (optValue) => {
    onChange({ target: { name, value: optValue } });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left
          ${open
            ? 'border-primary bg-white shadow-lg shadow-primary/10 ring-2 ring-primary/20'
            : value
              ? 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
              : 'border-gray-200 bg-gray-50/60 hover:border-primary/40 hover:bg-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selected?.icon && (
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              open || value ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-gray-100 text-gray-500'
            }`}>
              {selected.icon}
            </span>
          )}
          <span className={`font-semibold text-sm truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
          open ? 'rotate-180 text-primary' : 'text-gray-400'
        }`} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-900/15 overflow-hidden animate-in"
          style={{ animation: 'dropdownOpen 0.18s ease-out' }}>
          <style>{`
            @keyframes dropdownOpen {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div className="p-1.5 max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'hover:bg-blue-50/80 text-gray-700'
                  }`}
                >
                  {opt.icon && (
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-primary/10'
                    }`}>
                      <span className={isSelected ? 'text-white' : 'text-gray-500 group-hover:text-primary'}>
                        {opt.icon}
                      </span>
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`block font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className={`block text-[11px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                        {opt.description}
                      </span>
                    )}
                  </div>
                  {isSelected && <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Visa type options with icons + descriptions
// Icon picker — gives each visa type a relevant icon based on its name
const getVisaIcon = (visaType) => {
  const name = visaType.toLowerCase();
  if (name.includes('tour') || name.includes('visit') || name.includes('holiday'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  if (name.includes('business') || name.includes('trade') || name.includes('commercial'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
  if (name.includes('work') || name.includes('employ') || name.includes('labour'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  if (name.includes('stud') || name.includes('edu') || name.includes('school') || name.includes('university'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
  if (name.includes('famil') || name.includes('spouse') || name.includes('reunion'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  if (name.includes('diplomat') || name.includes('official') || name.includes('govern'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
  if (name.includes('medic') || name.includes('health') || name.includes('treat'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
  if (name.includes('journal') || name.includes('press') || name.includes('media'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
  if (name.includes('transit') || name.includes('transfer') || name.includes('stopover'))
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
  // Generic document icon for any other custom type
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
};


const PAYMENT_OPTIONS = [
  {
    value: 'Credit Card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, AMEX',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  },
  {
    value: 'PayPal',
    label: 'PayPal',
    description: 'Pay securely via PayPal',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    value: 'Bank Transfer',
    label: 'Bank Transfer',
    description: 'Wire transfer (2–3 business days)',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
  },
];


const ApplyVisa = () => {
  const { user, loading } = useContext(AuthContext);
  const token = user ? user.token : null;
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [renewId, setRenewId] = useState(null);
  const [visaConfigs, setVisaConfigs] = useState([]);

  // Expanded Form State to include necessary fields
  const [formData, setFormData] = useState({
    visaType: '',
    duration: '',
    purpose: '',
    firstName: '',
    lastName: '',
    passportNumber: '',
    nationality: '',
    passportExpiry: '',
    phone: '',
    email: '',
    arrivalDate: '',
    departureDate: '',
    hostAddress: '',
    passportScanName: '',
    selfieName: '',
    supportingDocName: '',
    paymentMethod: 'Credit Card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    paypalEmail: '',
    passportScanData: null,
    selfieData: null,
    supportingDocData: null
  });

  useEffect(() => {
    // Fetch configs
    axios.get('/api/visa/config').then(res => {
       if (res.data.success) setVisaConfigs(res.data.configs);
    }).catch(err => console.error("Error fetching configs:", err));

    if (loading) return;
    if (!user) {
      const typeParam = new URLSearchParams(location.search).get('type');
      let redirectUrl = '/register?redirect=apply';
      if (typeParam) {
        redirectUrl += `&type=${typeParam}`;
      }
      navigate(redirectUrl, { 
        state: { message: 'You have to register or log in first before applying for a visa.' },
        replace: true
      });
      return;
    }

    const params = new URLSearchParams(location.search);
    const editMode = params.get('edit');
    const id = params.get('id');
    
    // Auto-select visa type if passed from home page
    const typeParam = params.get('type');
    if (typeParam && !formData.visaType) {
      setFormData(prev => ({ ...prev, visaType: typeParam.charAt(0).toUpperCase() + typeParam.slice(1) }));
    }
    
    const renewMode = params.get('renew');
    if (renewMode === 'true' && id && token) {
      setRenewId(id);
      axios.get('/api/visa/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data.success) {
          const app = res.data.applications.find(a => a._id === id);
          if (app) {
            setFormData(prev => ({
              ...prev,
              visaType: app.visaType || prev.visaType,
              firstName: app.personalDetails?.firstName || prev.firstName,
              lastName: app.personalDetails?.lastName || prev.lastName,
              passportNumber: app.personalDetails?.passportNumber || app.passportNumber || prev.passportNumber,
              nationality: app.personalDetails?.nationality || prev.nationality,
              passportExpiry: app.personalDetails?.passportExpiry ? new Date(app.personalDetails.passportExpiry).toISOString().split('T')[0] : prev.passportExpiry,
              phone: app.personalDetails?.phone || app.travelDetails?.phone || app.phone || prev.phone,
              email: app.personalDetails?.email || prev.email,
              passportScanName: app.passportDocument || 'existing_document',
              selfieName: app.supportingDocuments?.[0] || 'existing_photo',
              supportingDocName: app.supportingDocuments?.[1] || 'existing_support',
              passportScanData: 'data:image/jpeg;base64,dummy',
              selfieData: 'data:image/jpeg;base64,dummy',
              supportingDocData: 'data:application/pdf;base64,dummy'
            }));
            setStep(2); // Start at duration selection
          }
        }
      }).catch(err => console.error("Error fetching application to renew", err));
    } else if (editMode === 'true' && id && token) {
      setEditId(id);
      axios.get('/api/visa/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data.success) {
          const app = res.data.applications.find(a => a._id === id);
          if (app && app.applicationStatus === 'Needs Revision') {
            setFormData(prev => ({
              ...prev,
              visaType: app.visaType || prev.visaType,
              purpose: app.purposeOfTravel || prev.purpose,
              duration: app.visaDuration?.toString() || prev.duration,
              firstName: app.personalDetails?.firstName || prev.firstName,
              lastName: app.personalDetails?.lastName || prev.lastName,
              passportNumber: app.personalDetails?.passportNumber || app.passportNumber || prev.passportNumber,
              nationality: app.personalDetails?.nationality || prev.nationality,
              passportExpiry: app.personalDetails?.passportExpiry ? new Date(app.personalDetails.passportExpiry).toISOString().split('T')[0] : prev.passportExpiry,
              phone: app.personalDetails?.phone || app.travelDetails?.phone || app.phone || prev.phone,
              email: app.personalDetails?.email || prev.email,
              arrivalDate: app.travelDetails?.arrivalDate ? new Date(app.travelDetails.arrivalDate).toISOString().split('T')[0] : prev.arrivalDate,
              departureDate: app.travelDetails?.departureDate ? new Date(app.travelDetails.departureDate).toISOString().split('T')[0] : prev.departureDate,
              hostAddress: app.travelDetails?.hostAddress || prev.hostAddress,
              passportScanName: app.passportDocument || prev.passportScanName,
              selfieName: app.supportingDocuments?.[0] || prev.selfieName,
              supportingDocName: app.supportingDocuments?.[1] || prev.supportingDocName,
            }));
            // Skip directly to step 2 in edit mode
            setStep(2);
          }
        }
      }).catch(err => console.error("Error fetching application to edit", err));
    }
  }, [location.search, token, user, loading]);

  const steps = [
    { id: 1, name: 'Guidance & Preparation', desc: 'Read guidelines & checklists' },
    { id: 2, name: 'Visa Type & Purpose', desc: 'Select your visa category' },
    { id: 3, name: 'Passport & Personal Details', desc: 'Enter bio-data & passport' },
    { id: 4, name: 'Travel & Flight Details', desc: 'Dates & host information' },
    { id: 5, name: 'Required Documents', desc: 'Upload passport scan & selfie' },
    { id: 6, name: 'Review & Confirm', desc: 'Verify before submission' },
    { id: 7, name: 'Payment & Submit', desc: 'Pay processing fee securely' },
  ];

  const handleNext = () => setStep(prev => Math.min(prev + 1, 7));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardExpiry') {
      value = value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        let dataField = '';
        if (fieldName === 'passportScanName') dataField = 'passportScanData';
        if (fieldName === 'selfieName') dataField = 'selfieData';
        if (fieldName === 'supportingDocName') dataField = 'supportingDocData';
        
        setFormData(prev => ({
          ...prev,
          [fieldName]: file.name,
          [dataField]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getAmountDue = () => {
     if (!formData.visaType || !formData.duration) return 50;
     const config = visaConfigs.find(c => 
       c.visaType.toLowerCase() === formData.visaType.toLowerCase() ||
       (c.visaType.toLowerCase() === 'tourism' && formData.visaType.toLowerCase() === 'tourist') ||
       (c.visaType.toLowerCase() === 'tourist' && formData.visaType.toLowerCase() === 'tourism')
     );
     if (config) {
       const option = config.options.find(o => o.duration === Number(formData.duration));
       if (option) return option.price;
     }
     // Fallbacks if not configured yet
     const fallbacks = { Tourist: 50, Tourism: 50, Business: 100, Worker: 150, Student: 40, Family: 60, Diplomatic: 0, Medical: 50 };
     return fallbacks[formData.visaType] || 50;
  };
  const amountDue = getAmountDue();

  // 100% backend-driven: derive visa options purely from visaConfigs fetched from the API.
  // Whatever the admin adds/deletes/renames in Configurations is immediately reflected here.
  const dynamicVisaOptions = visaConfigs.map(c => ({
    value: c.visaType,
    label: `${c.visaType} Visa`,
    description: `${c.visaType} travel & entry permit`,
    icon: getVisaIcon(c.visaType),
  }));

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Jump to completed steps directly
  const jumpToStep = (targetStep) => {
    if (targetStep < step) {
      setStep(targetStep);
    }
  };

  const dataURItoBlob = (dataURI) => {
    if (!dataURI) return null;
    try {
      if (!dataURI.startsWith('data:')) return null;
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

  const finalizeApplication = async () => {
    setIsSubmitting(true);
    if (editId) {
      const formDataToSend = new FormData();
      formDataToSend.append('visaType', formData.visaType);
      formDataToSend.append('purposeOfTravel', formData.purpose);
      formDataToSend.append('visaDuration', formData.duration);
      formDataToSend.append('personalDetails', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        passportNumber: formData.passportNumber,
        nationality: formData.nationality,
        passportExpiry: formData.passportExpiry,
        phone: formData.phone,
        email: formData.email
      }));
      formDataToSend.append('travelDetails', JSON.stringify({
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        hostAddress: formData.hostAddress || formData.address || '',
        phone: formData.phone
      }));

      const passportBlob = dataURItoBlob(formData.passportScanData);
      if (passportBlob) formDataToSend.append('passportDocument', passportBlob, formData.passportScanName);

      const photoBlob = dataURItoBlob(formData.selfieData);
      if (photoBlob) formDataToSend.append('photoDocument', photoBlob, formData.selfieName);

      const supportBlob = dataURItoBlob(formData.supportingDocData);
      if (supportBlob) formDataToSend.append('supportingDocument', supportBlob, formData.supportingDocName);

      try {
        const res = await axios.put(`/api/visa/${editId}/update`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.data.success) {
          alert('Application updated successfully!');
          navigate('/applicant');
        } else {
          alert('Failed to update: ' + res.data.message);
        }
      } catch (error) {
        console.error(error);
        alert('Error updating application: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsSubmitting(false);
      }
    } else if (renewId) {
       const renewData = {
          linkedApplicationId: renewId,
          visaType: formData.visaType,
          visaDuration: formData.duration,
          amountPaid: amountDue,
          paymentMethod: formData.paymentMethod,
          paymentStatus: formData.paymentMethod === 'Bank Transfer' ? 'Pending' : 'Completed'
       };
       try {
        const res = await axios.post(`/api/visa/renew`, renewData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.data.success) {
          setIsSubmitted(true);
        } else {
          alert('Failed to renew: ' + res.data.message);
        }
      } catch (error) {
        console.error(error);
        alert('Error renewing application: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const formDataToSend = new FormData();
      formDataToSend.append('visaType', formData.visaType);
      formDataToSend.append('purposeOfTravel', formData.purpose);
      formDataToSend.append('visaDuration', formData.duration);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('amountPaid', amountDue);
      formDataToSend.append('paymentStatus', formData.paymentMethod === 'Bank Transfer' ? 'Pending' : 'Completed');
      formDataToSend.append('personalDetails', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        passportNumber: formData.passportNumber,
        nationality: formData.nationality,
        passportExpiry: formData.passportExpiry,
        phone: formData.phone,
        email: formData.email
      }));
      formDataToSend.append('travelDetails', JSON.stringify({
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        hostAddress: formData.hostAddress || formData.address || '',
        phone: formData.phone
      }));

      const passportBlob = dataURItoBlob(formData.passportScanData);
      if (passportBlob) formDataToSend.append('passportDocument', passportBlob, formData.passportScanName);

      const photoBlob = dataURItoBlob(formData.selfieData);
      if (photoBlob) formDataToSend.append('photoDocument', photoBlob, formData.selfieName);

      const supportBlob = dataURItoBlob(formData.supportingDocData);
      if (supportBlob) formDataToSend.append('supportingDocument', supportBlob, formData.supportingDocName);

      try {
        const res = await axios.post('/api/visa/apply', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.data.success) {
          localStorage.removeItem('pendingVisaApplication');
          setIsSubmitted(true);
        } else {
          alert('Failed to submit application: ' + res.data.message);
        }
      } catch (error) {
        console.error(error);
        alert('Error submitting application: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 6 && (editId || renewId)) {
      if (renewId) {
        nextStep(); // Go to payment for renewal
        return;
      }
      finalizeApplication();
      return;
    }
    if (step === 7) {
      if (amountDue > 0) {
        setIsProcessingPayment(true);
        setTimeout(() => {
          setIsProcessingPayment(false);
          setPaymentSuccess(true);
        }, 2000);
      } else {
        setPaymentSuccess(true);
      }
    } else {
      nextStep();
    }
  };

  // Helper for Stepper SVG Icons
  const renderStepIcon = (id, active, completed) => {
    if (completed) {
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    // Custom SVGs per step
    switch (id) {
      case 1: // Info
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 2: // Visa Category
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 3: // Passport details
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.333 0 4 .667 4 2v1H5v-1c0-1.333 2.667-2 4-2z" />
          </svg>
        );
      case 4: // Travel info
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 5: // Upload docs
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        );
      case 6: // Review
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default: // Payment

        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Interactive Stepper Checklist */}
        <div className="w-full lg:w-80 bg-gradient-to-b from-[#25303f] to-[#161d26] backdrop-blur-2xl rounded-3xl border border-slate-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.15)] p-4 lg:p-6 shrink-0 relative lg:sticky lg:top-8">
          <div className="mb-6 border-b border-slate-700/60 pb-4">
            <h4 className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">Application Stages</h4>
            <p className="text-slate-400 text-xs mt-1">Track your progress and upcoming steps</p>
          </div>
          
          <nav className="space-y-4">
            {steps.map((s) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <div
                  key={s.id}
                  onClick={() => jumpToStep(s.id)}
                  className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/10 border border-white/10 shadow-sm' 
                      : isCompleted 
                        ? 'cursor-pointer hover:bg-white/5' 
                        : 'opacity-40 select-none'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {renderStepIcon(s.id, isActive, isCompleted)}
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold leading-tight ${isActive ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                      {s.name}
                    </h5>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Up Next Card Indicator */}
          {step < 7 && (
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">Up Next</span>
              <span className="text-xs font-extrabold text-white mt-1 block">
                {steps[step].name}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">{steps[step].desc}</p>
            </div>
          )}
        </div>

        {/* Right Column: Main Form & Guidance Box */}
        <div className="flex-1 w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden flex flex-col">
          {/* Top Primary banner showing current step details */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-7 text-white">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-200 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/30">
                Somalia E-Visa
              </span>
              <span className="text-sm font-bold text-white/90">
                Step {step} of 7
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
              {steps[step - 1].name}
            </h2>
            <div className="w-full bg-black/20 rounded-full h-1.5 mt-5">
              <div 
                className="bg-white h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${(step / 7) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 sm:p-10 flex-grow">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-16 animate-fadeIn text-center">
                <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-green-50/50">
                  <CheckCircleIcon className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Application Submitted!</h2>
                <p className="text-gray-500 mb-10 max-w-md leading-relaxed">
                  Your visa application has been securely transmitted to the Immigration & Citizenship Service. You can now track its status from your dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/applicant')}
                  className="px-10 py-4 bg-gradient-to-r from-primary to-[#4338ca] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5"
                >
                  Go to My Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
              {/* Step 1: Detailed Guidance & Requirements */}
              {step === 1 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="prose prose-blue max-w-none">
                    <p className="text-gray-600 leading-relaxed text-base">
                      Welcome to the official <strong>Federal Republic of Somalia E-Visa Application Portal</strong>. 
                      Please review the pre-requisites below to ensure a smooth, secure, and hassle-free online application process.
                    </p>
                  </div>

                  {/* Requirements grid layout */}
                  <div>
                    <h3 className="text-sm uppercase font-extrabold text-gray-500 tracking-wider mb-4">Required Documents Checklist</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="p-5 border border-gray-150 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xl font-bold">
                          <IdentificationIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">Valid Passport Scan</h4>
                          <p className="text-xs text-gray-500 mt-1 leading-normal">
                            Bio-data page must be clear and legible. Validity must exceed <strong>6 months</strong> from your date of arrival.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 border border-gray-150 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xl font-bold">
                          <CameraIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">Passport Photo / Selfie</h4>
                          <p className="text-xs text-gray-500 mt-1 leading-normal">
                            Recent, color photo with a white background. Front-facing with neutral expression and no headwear.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 border border-gray-150 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xl font-bold">
                          <PaperAirplaneIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">Travel & Lodging details</h4>
                          <p className="text-xs text-gray-500 mt-1 leading-normal">
                            Expected arrival/departure flight dates and host address or hotel reservation details.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 border border-gray-150 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xl font-bold">
                          <CreditCardIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">Secure Payment Method</h4>
                          <p className="text-xs text-gray-500 mt-1 leading-normal">
                            Credit/Debit card or mobile wallet to pay the processing fee once your details are finalized.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Visual Timeline of process */}
                  <div className="bg-primary/5 rounded-2xl border border-primary/20/50 p-6">
                    <h3 className="text-sm uppercase font-extrabold text-primary tracking-wider mb-4">Application Journey</h3>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 relative">
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">1</span>
                          Fill Form & Upload
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Complete passport, flight, and scan upload details.</p>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">2</span>
                          Review & Secure Login
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Verify all inputs and create your secure system portal account.</p>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">3</span>
                          Payment & Approval
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Submit processing payment. Wait for Officer review and PDF letter generation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Visa Type & Purpose */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">Visa Category</label>
                    {dynamicVisaOptions.length === 0 ? (
                      <div className="flex items-center justify-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Loading visa types...
                      </div>
                    ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {dynamicVisaOptions.map(opt => {
                        const isSelected = formData.visaType?.toLowerCase() === opt.value.toLowerCase();
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleChange({ target: { name: 'visaType', value: opt.value } })}
                            className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-200 group
                              ${isSelected
                                ? 'border-primary bg-primary shadow-lg shadow-primary/20'
                                : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-blue-50/40 hover:shadow-sm'
                              }`}
                          >
                            {isSelected && (
                              <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <CheckIcon className="w-3 h-3 text-primary" />
                              </span>
                            )}
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                              {opt.icon}
                            </span>
                            <div>
                              <span className={`block font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                {opt.value}
                              </span>
                              <span className={`block text-[11px] mt-0.5 leading-snug ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                {opt.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Duration of Stay</label>
                    {(() => {
                      const activeConfig = visaConfigs.find(c => 
                        c.visaType.toLowerCase() === formData.visaType.toLowerCase() ||
                        (c.visaType.toLowerCase() === 'tourism' && formData.visaType.toLowerCase() === 'tourist') ||
                        (c.visaType.toLowerCase() === 'tourist' && formData.visaType.toLowerCase() === 'tourism')
                      );
                      const hasOptions = activeConfig && activeConfig.options && activeConfig.options.length > 0;
                      const calIcon = (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      );
                      const durationOptions = hasOptions
                        ? activeConfig.options.map(opt => ({
                            value: String(opt.duration),
                            label: `${opt.duration} Days`,
                            description: `Visa fee · $${opt.price} USD`,
                            icon: calIcon,
                          }))
                        : [30, 60, 90].map(d => ({
                            value: String(d),
                            label: `${d} Days`,
                            description: 'Standard duration',
                            icon: calIcon,
                          }));
                      return (
                        <CustomSelect
                          name="duration"
                          value={formData.duration}
                          onChange={handleChange}
                          options={durationOptions}
                          placeholder={formData.visaType ? 'Select duration of stay' : 'Select visa type first'}
                          disabled={!formData.visaType}
                          required
                        />
                      );
                    })()}
                  </div>

                  {/* Price Summary Card */}
                  {formData.visaType && formData.duration && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-300/50">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-0.5">Fee for this Visa</p>
                        <p className="text-sm text-emerald-800 font-semibold">
                          {formData.visaType} Visa · <span className="font-extrabold">{formData.duration} days</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-emerald-700">${amountDue}</span>
                        <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">USD</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Purpose of Travel</label>
                    <textarea 
                      name="purpose" 
                      required 
                      value={formData.purpose} 
                      onChange={handleChange} 
                      rows="4" 
                      placeholder="Please briefly describe your specific travel plans and purpose..." 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 text-gray-800"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Step 3: Passport & Personal Details */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Given / First Name</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        required 
                        value={formData.firstName} 
                        onChange={handleChange} 
                        placeholder="As written on your passport" 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Surname / Last Name</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        required 
                        value={formData.lastName} 
                        onChange={handleChange} 
                        placeholder="As written on your passport" 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Passport Number</label>
                      <input 
                        type="text" 
                        name="passportNumber" 
                        required 
                        value={formData.passportNumber} 
                        onChange={handleChange} 
                        placeholder="e.g. N0123456" 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase text-gray-800 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Nationality</label>
                      <CountryAutocomplete
                        required 
                        value={formData.nationality} 
                        onChange={handleChange} 
                        placeholder="Your country of citizenship" 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Passport Expiry Date</label>
                      <input 
                        type="date" 
                        name="passportExpiry" 
                        required 
                        value={formData.passportExpiry} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Contact & Travel Information */}
              {step === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="yourname@example.com" 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        required 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="e.g. +1 555-0199" 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                      />
                    </div>
                    {!renewId && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Expected Arrival Date</label>
                        <input 
                          type="date" 
                          name="arrivalDate" 
                          required={!renewId} 
                          value={formData.arrivalDate} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Expected Departure Date</label>
                      <input 
                        type="date" 
                        name="departureDate" 
                        required 
                        value={formData.departureDate} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Lodging / Host Address in Somalia</label>
                    <textarea 
                      name="hostAddress" 
                      required 
                      value={formData.hostAddress || formData.address || ''} 
                      onChange={(e) => {
                        handleChange(e);
                        setFormData(prev => ({ ...prev, hostAddress: e.target.value, address: e.target.value }));
                      }} 
                      rows="2" 
                      placeholder="e.g. Hotel Decale, Mogadishu, Somalia or residential host details..." 
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Step 5: Required Documents */}
              {step === 5 && (() => {
                const renderDocBadge = (docName) => {
                  if (!docName) {
                    return (
                      <span className="inline-block bg-primary/5 text-primary text-xs px-3 py-1.5 rounded-full font-bold">
                        Select File
                      </span>
                    );
                  }
                  let label = docName;
                  if (docName.startsWith('http://') || docName.startsWith('https://') || docName.includes('/') || docName.includes('evisa')) {
                    label = 'Existing Document Attached';
                  } else if (docName.length > 20) {
                    label = docName.substring(0, 17) + '...';
                  }
                  return (
                    <div className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-200 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      <span className="shrink-0">✓</span>
                      <span className="truncate">{label}</span>
                    </div>
                  );
                };

                return (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Passport upload block */}
                      <div className="border border-dashed border-gray-300 hover:border-primary rounded-2xl p-6 text-center transition-all bg-gray-50/50 hover:bg-white relative flex flex-col justify-between items-center">
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          required={!formData.passportScanName}
                          onChange={(e) => handleFileChange(e, 'passportScanName')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-3 w-full">
                          <IdentificationIcon className="w-10 h-10 mx-auto text-primary" />
                          <h4 className="font-bold text-gray-800 text-sm">Passport Bio-Data Scan</h4>
                          <p className="text-xs text-gray-500 leading-relaxed px-2">
                            Upload a clear JPG or PDF of your passport bio page. Max size 5MB.
                          </p>
                          <div className="pt-1 flex justify-center w-full">
                            {renderDocBadge(formData.passportScanName)}
                          </div>
                        </div>
                      </div>

                      {/* Photo/Selfie upload block */}
                      <div className="border border-dashed border-gray-300 hover:border-primary rounded-2xl p-6 text-center transition-all bg-gray-50/50 hover:bg-white relative flex flex-col justify-between items-center">
                        <input 
                          type="file" 
                          accept="image/*"
                          required={!formData.selfieName}
                          onChange={(e) => handleFileChange(e, 'selfieName')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-3 w-full">
                          <CameraIcon className="w-10 h-10 mx-auto text-primary" />
                          <h4 className="font-bold text-gray-800 text-sm">Applicant Photo / Selfie</h4>
                          <p className="text-xs text-gray-500 leading-relaxed px-2">
                            Upload a recent high-quality passport size portrait. Max size 2MB.
                          </p>
                          <div className="pt-1 flex justify-center w-full">
                            {renderDocBadge(formData.selfieName)}
                          </div>
                        </div>
                      </div>

                      {/* Supporting Documents upload block */}
                      <div className="border border-dashed border-gray-300 hover:border-primary rounded-2xl p-6 text-center transition-all bg-gray-50/50 hover:bg-white relative flex flex-col justify-between items-center">
                        <input 
                          type="file" 
                          accept="application/pdf,image/*"
                          required={!formData.supportingDocName}
                          onChange={(e) => handleFileChange(e, 'supportingDocName')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-3 w-full">
                          <svg className="w-10 h-10 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <h4 className="font-bold text-gray-800 text-sm">Bank Statements</h4>
                          <p className="text-xs text-gray-500 leading-relaxed px-2">
                            Upload banking statements. Max size 5MB.
                          </p>
                          <div className="pt-1 flex justify-center w-full">
                            {renderDocBadge(formData.supportingDocName)}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Step 6: Review & Confirm */}
              {step === 6 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-200/65 space-y-5 text-sm text-gray-700">
                    <h3 className="text-base font-extrabold text-gray-900 border-b pb-2 mb-4">Application Details Summary</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Visa Category</span>
                        <span className="font-semibold text-gray-900 text-base">{formData.visaType} Visa</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Passport Number</span>
                        <span className="font-semibold text-gray-900 text-base">{formData.passportNumber}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Full Legal Name</span>
                        <span className="font-semibold text-gray-900 text-base">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Nationality</span>
                        <span className="font-semibold text-gray-900 text-base">{formData.nationality}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Travel Dates</span>
                        <span className="font-semibold text-gray-900 text-base">{formData.arrivalDate} to {formData.departureDate}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Passport Scan</span>
                        <span className="font-semibold text-emerald-600 text-sm">{formData.passportScanName ? `✓ ${formData.passportScanName}` : 'Missing'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Selfie / Photo</span>
                        <span className="font-semibold text-emerald-600 text-sm">{formData.selfieName ? `✓ ${formData.selfieName}` : 'Missing'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Bank Statements</span>
                        <span className="font-semibold text-emerald-600 text-sm">{formData.supportingDocName ? `✓ ${formData.supportingDocName}` : 'Missing'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-amber-50 text-amber-900 rounded-xl text-xs sm:text-sm border-l-4 border-amber-500 font-medium">
                    <strong className="font-bold block mb-1">Verify Information Accuracy</strong>
                    Please make sure your details exactly match your official passport document. 
                    Inaccurate details may lead to delayed processing or application rejection.
                  </div>
                </div>
              )}

              {/* Step 7: Payment & Submit */}
              {step === 7 && !isProcessingPayment && !paymentSuccess && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg">Visa Processing Fee</h3>
                      <p className="text-gray-500 text-sm mt-1">{formData.visaType} Visa Application</p>
                    </div>
                    <div className="text-3xl font-extrabold text-primary">${amountDue}</div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Select Payment Method</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {PAYMENT_OPTIONS.map(opt => {
                        const isActive = formData.paymentMethod === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: opt.value})}
                            className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center group
                              ${isActive
                                ? 'border-primary bg-gradient-to-b from-primary/8 to-primary/3 shadow-md shadow-primary/10'
                                : 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm hover:bg-blue-50/30'
                              }`}
                          >
                            {isActive && (
                              <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                <CheckIcon className="w-3 h-3 text-white" />
                              </span>
                            )}
                            <span className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                              isActive ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                              {opt.icon}
                            </span>
                            <div>
                              <span className={`block font-bold text-sm ${isActive ? 'text-primary' : 'text-gray-800'}`}>{opt.label}</span>
                              <span className="block text-[11px] text-gray-400 mt-0.5">{opt.description}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {formData.paymentMethod === 'Credit Card' && amountDue > 0 && (
                    <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-fadeIn">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                        <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000" 
                          required
                          value={formData.cardNumber}
                          onChange={handleChange}
                          name="cardNumber"
                          autoComplete="off"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-4 focus:ring-primary/15 focus:border-primary shadow-sm transition-all duration-300 text-gray-800 font-mono tracking-widest"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry (MM/YY)</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            required
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            name="cardExpiry"
                            autoComplete="off"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-4 focus:ring-primary/15 focus:border-primary shadow-sm transition-all duration-300 text-gray-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVV</label>
                          <input 
                            type="text" 
                            placeholder="123" 
                            required
                            value={formData.cardCvv}
                            onChange={handleChange}
                            name="cardCvv"
                            autoComplete="off"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-4 focus:ring-primary/15 focus:border-primary shadow-sm transition-all duration-300 text-gray-800 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'PayPal' && amountDue > 0 && (
                    <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-fadeIn text-center">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-3xl mb-4">🅿️</div>
                      <h4 className="font-bold text-gray-800">Pay securely with PayPal</h4>
                      <p className="text-sm text-gray-500 mb-4">Enter your PayPal email to simulate the transaction.</p>
                      <input 
                        type="email" 
                        placeholder="paypal@example.com" 
                        required
                        value={formData.paypalEmail}
                        onChange={handleChange}
                        name="paypalEmail"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-4 focus:ring-primary/15 focus:border-primary shadow-sm transition-all duration-300 text-gray-800"
                      />
                    </div>
                  )}

                  {formData.paymentMethod === 'Bank Transfer' && amountDue > 0 && (
                    <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-fadeIn text-center">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-3xl mb-4">🏦</div>
                      <h4 className="font-bold text-gray-800">Manual Bank Transfer</h4>
                      <p className="text-sm text-gray-500 mb-4">You will need to manually transfer the funds to the immigration account. Your application will be placed in a <strong>Pending</strong> state until an officer manually verifies your payment.</p>
                    </div>
                  )}
                  
                  {amountDue === 0 && (
                    <div className="p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 flex items-center gap-3">
                       <span className="text-xl">✅</span>
                       <span className="font-bold text-sm">No payment required for this visa category. You can proceed directly.</span>
                    </div>
                  )}
                </div>
              )}

              {step === 7 && isProcessingPayment && (
                <div className="flex flex-col items-center justify-center py-20 animate-fadeIn text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Processing Payment...</h3>
                  <p className="text-gray-500">Securely authorizing your transaction. Please do not close this window.</p>
                </div>
              )}

              {step === 7 && paymentSuccess && (
                <div className="flex flex-col items-center justify-center py-16 animate-fadeIn text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg shadow-green-500/20">
                    ✅
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-500 text-lg mb-6">You have successfully paid <strong className="text-primary">${amountDue}</strong> for your visa application.</p>
                  
                  <button 
                    type="button" 
                    onClick={finalizeApplication}
                    disabled={isSubmitting}
                    className={`px-10 py-4 text-white font-bold rounded-xl transition-all shadow-md text-lg flex items-center justify-center mx-auto ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-[#4338ca] hover:opacity-90 shadow-primary/30 hover:-translate-y-0.5'}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : 'Submit the Application'}
                  </button>
                </div>
              )}

              {/* Navigation Controls */}
              {!isProcessingPayment && !paymentSuccess && (
                <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                  {step > 1 ? (
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors font-bold text-sm"
                    >
                      Back
                    </button>
                  ) : <div />}
                  
                  <button 
                    type="submit" 
                    className="px-8 py-3.5 bg-gradient-to-r from-primary to-[#4338ca] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/30 hover:-translate-y-0.5 text-sm"
                  >
                    {step === 7 ? 'Pay & Submit Application' : step === 6 && editId ? 'Submit Revision' : step === 1 ? 'Start Application' : 'Next Step'}
                  </button>
                </div>
              )}

            </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApplyVisa;
