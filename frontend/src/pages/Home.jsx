import React from 'react';
import { Link } from 'react-router-dom';
import bannerImage from '../assets/The Queen of the Skies_ Emirates A380 Golden Hour Departure ✈️🌇.jpg';
import { 
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="font-sans text-gray-800 bg-white min-h-screen">


      {/* Navigation */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer group">
              <div className="relative h-12 w-12 mr-3 flex items-center justify-center bg-blue-50 rounded-full border-2 border-blue-100 group-hover:border-blue-300 transition-colors duration-300 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-primary animate-[spin_20s_linear_infinite]">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="60 10" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.6" />
                  <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.4" />
                  <ellipse cx="50" cy="50" rx="15" ry="45" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.4" />
                  <circle cx="50" cy="50" r="8" fill="currentColor" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl text-gray-900 tracking-tight leading-none">Somalia</span>
                <span className="font-medium text-sm text-primary tracking-widest uppercase">E-Visa Portal</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-12">
              <Link to="/" className="relative text-primary font-black uppercase tracking-[0.15em] text-sm group py-2">
                Home
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              </Link>
              <a href="#visa-types" className="relative text-slate-500 hover:text-slate-900 transition-colors font-extrabold uppercase tracking-[0.15em] text-sm group py-2">
                Visa Types
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)] origin-left"></span>
              </a>
              <a href="#guidelines" className="relative text-slate-500 hover:text-slate-900 transition-colors font-extrabold uppercase tracking-[0.15em] text-sm group py-2">
                Guidelines
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)] origin-left"></span>
              </a>
              <a href="#contact" className="relative text-slate-500 hover:text-slate-900 transition-colors font-extrabold uppercase tracking-[0.15em] text-sm group py-2">
                Contact
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)] origin-left"></span>
              </a>
            </nav>
            <div className="flex items-center space-x-6">
              <a 
                href="mailto:support.evisa@gmail.com?subject=E-Visa%20Support%20Request&body=%2A%20Full%20Name%0D%0A%2A%20Description%20of%20the%20Issue"
                className="hidden md:flex items-center bg-primary text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <EnvelopeIcon className="h-6 w-6 mr-3" />
                <div>
                  <div className="text-[11px] text-blue-100 font-medium uppercase tracking-wider">Have Any Questions?</div>
                  <div className="font-bold text-base leading-tight">support.evisa@gmail.com</div>
                </div>
              </a>
              <Link to="/login" className="px-6 md:px-8 py-2.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2">
                <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover opacity-30 transform scale-105"
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80" 
            alt="Airplane" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/80 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 text-left">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-px w-12 bg-primary"></div>
            <h2 className="text-sm text-primary font-bold tracking-[0.2em] uppercase">Federal Republic of Somalia</h2>
          </div>
          <h1 className="text-5xl tracking-tight font-extrabold text-white sm:text-6xl md:text-7xl max-w-3xl leading-[1.1]">
            Immigration & Visa <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">Agency Worldwide</span>
          </h1>
          <p className="mt-8 text-xl text-gray-300 max-w-2xl font-light leading-relaxed border-l-4 border-primary pl-4">
            Fast, secure, and hassle-free online visa application for tourists, workers, and business travelers visiting Somalia.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-6 items-center">
            <Link 
              to="/apply" 
              className="group flex items-center justify-center space-x-3 px-10 py-5 text-lg font-extrabold rounded-full text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.45)] hover:shadow-[0_0_40px_rgba(244,63,94,0.65)] hover:-translate-y-1 hover:scale-105 active:scale-95 tracking-wide text-center"
            >
              <span>APPLY NOW</span>
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
            <Link 
              to="/track" 
              className="group flex items-center justify-center space-x-3 px-10 py-4.5 border-2 border-white/70 hover:border-white text-lg font-extrabold rounded-2xl text-white bg-white/5 backdrop-blur-md hover:bg-white/15 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:-translate-y-1 hover:scale-103 active:scale-95 tracking-wide text-center"
            >
              <svg className="w-5 h-5 text-white/80 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span>TRACK VISA STATUS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Visa Categories Section */}
      <div id="visa-types" className="bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 py-28 relative overflow-hidden">
        {/* Ambient Dreamy Blur Orbs */}
        <div className="absolute top-1/4 left-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary font-bold uppercase tracking-widest text-sm mb-3">Categories</h2>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Choose Your Visa Type</h3>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto text-base font-light">Explore official entry channels tailored to your purpose of travel to the Federal Republic of Somalia.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Worker Visa */}
            <div className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/30 rounded-3xl p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(245,158,11,0.12)] cursor-pointer flex flex-col justify-between min-h-[380px]">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500" />
              <div>
                <div className="relative inline-flex items-center justify-center p-5 rounded-2xl bg-amber-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BriefcaseIcon className="h-10 w-10 text-amber-400 group-hover:text-amber-300" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">Worker Visa</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  For foreign nationals seeking employment in Somalia. Requires a valid job offer and sponsorship from a licensed company.
                </p>
              </div>
              <div>
                <Link to="/apply?type=worker" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold bg-white/5 hover:bg-amber-500 hover:text-gray-900 border border-white/10 hover:border-transparent text-gray-300 tracking-wider uppercase transition-all duration-300">
                  <span>READ MORE</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Student Visa */}
            <div className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-sky-500/30 rounded-3xl p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(14,165,233,0.12)] cursor-pointer flex flex-col justify-between min-h-[380px]">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/15 transition-all duration-500" />
              <div>
                <div className="relative inline-flex items-center justify-center p-5 rounded-2xl bg-sky-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <AcademicCapIcon className="h-10 w-10 text-sky-400 group-hover:text-sky-300" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-sky-300 transition-colors duration-300">Student Visa</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  For international students admitted to recognized educational institutions or universities within the country.
                </p>
              </div>
              <div>
                <Link to="/apply?type=student" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold bg-white/5 hover:bg-sky-500 hover:text-gray-900 border border-white/10 hover:border-transparent text-gray-300 tracking-wider uppercase transition-all duration-300">
                  <span>READ MORE</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Business Visa */}
            <div className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/30 rounded-3xl p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(16,185,129,0.12)] cursor-pointer flex flex-col justify-between min-h-[380px]">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all duration-500" />
              <div>
                <div className="relative inline-flex items-center justify-center p-5 rounded-2xl bg-emerald-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <DocumentTextIcon className="h-10 w-10 text-emerald-400 group-hover:text-emerald-300" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-300 transition-colors duration-300">Business Visa</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  For attending professional conferences, investment forums, trade summits, or exploring business opportunities.
                </p>
              </div>
              <div>
                <Link to="/apply?type=business" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold bg-white/5 hover:bg-emerald-500 hover:text-gray-900 border border-white/10 hover:border-transparent text-gray-300 tracking-wider uppercase transition-all duration-300">
                  <span>READ MORE</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                </Link>
              </div>
            </div>

            {/* Card 4: Family Visa */}
            <div className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-rose-500/30 rounded-3xl p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(244,63,94,0.12)] cursor-pointer flex flex-col justify-between min-h-[380px]">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-all duration-500" />
              <div>
                <div className="relative inline-flex items-center justify-center p-5 rounded-2xl bg-rose-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="h-10 w-10 text-rose-400 group-hover:text-rose-300" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-rose-300 transition-colors duration-300">Family Visa</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  For dependents, spouses, or immediate relatives joining a resident or citizen currently living in Somalia.
                </p>
              </div>
              <div>
                <Link to="/apply?type=family" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold bg-white/5 hover:bg-rose-500 hover:text-gray-900 border border-white/10 hover:border-transparent text-gray-300 tracking-wider uppercase transition-all duration-300">
                  <span>READ MORE</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                </Link>
              </div>
            </div>

            {/* Card 5: Diplomatic Visa */}
            <div className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-violet-500/30 rounded-3xl p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(139,92,246,0.12)] cursor-pointer flex flex-col justify-between min-h-[380px]">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/15 transition-all duration-500" />
              <div>
                <div className="relative inline-flex items-center justify-center p-5 rounded-2xl bg-violet-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GlobeAltIcon className="h-10 w-10 text-violet-400 group-hover:text-violet-300" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-violet-300 transition-colors duration-300">Diplomatic Visa</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  For government officials, diplomats, and international agency officers traveling on official state affairs.
                </p>
              </div>
              <div>
                <Link to="/apply?type=diplomatic" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold bg-white/5 hover:bg-violet-500 hover:text-gray-900 border border-white/10 hover:border-transparent text-gray-300 tracking-wider uppercase transition-all duration-300">
                  <span>READ MORE</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                </Link>
              </div>
            </div>

            {/* Card 6: Tourist Visa */}
            <div className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 rounded-3xl p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(6,182,212,0.12)] cursor-pointer flex flex-col justify-between min-h-[380px]">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all duration-500" />
              <div>
                <div className="relative inline-flex items-center justify-center p-5 rounded-2xl bg-cyan-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GlobeAltIcon className="h-10 w-10 text-cyan-400 group-hover:text-cyan-300" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">Tourist Visa</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  For individuals visiting for leisure, vacations, exploration of pristine coastlines, and historic sites.
                </p>
              </div>
              <div>
                <Link to="/apply?type=tourist" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold bg-white/5 hover:bg-cyan-500 hover:text-gray-900 border border-white/10 hover:border-transparent text-gray-300 tracking-wider uppercase transition-all duration-300">
                  <span>READ MORE</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="guidelines" className="bg-slate-900 py-24 border-t border-slate-800/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary font-bold uppercase tracking-widest text-sm mb-3">Workflow</h2>
            <h3 className="text-4xl font-extrabold text-white">How to Apply Online</h3>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto text-base font-light">Get your visa in 4 simple, fully digital steps without visiting any embassy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="group relative bg-[#131d31]/50 border border-white/[0.05] p-8 rounded-2xl hover:border-blue-500/20 transition-all duration-300">
              <div className="absolute top-6 right-6 text-6xl font-black text-slate-800/30 group-hover:text-blue-500/10 transition-colors duration-300">01</div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Fill Application</h4>
              <p className="text-gray-400 text-sm leading-relaxed font-light">Enter visa category, personal details, and passport information accurately on our secure form.</p>
            </div>

            {/* Step 2 */}
            <div className="group relative bg-[#131d31]/50 border border-white/[0.05] p-8 rounded-2xl hover:border-purple-500/20 transition-all duration-300">
              <div className="absolute top-6 right-6 text-6xl font-black text-slate-800/30 group-hover:text-purple-500/10 transition-colors duration-300">02</div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Upload Documents</h4>
              <p className="text-gray-400 text-sm leading-relaxed font-light">Attach digital photos, passport information scans, and any optional supporting flight itineraries.</p>
            </div>

            {/* Step 3 */}
            <div className="group relative bg-[#131d31]/50 border border-white/[0.05] p-8 rounded-2xl hover:border-emerald-500/20 transition-all duration-300">
              <div className="absolute top-6 right-6 text-6xl font-black text-slate-800/30 group-hover:text-emerald-500/10 transition-colors duration-300">03</div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Online Payment</h4>
              <p className="text-gray-400 text-sm leading-relaxed font-light">Submit payment securely through integrated credit card gateways or localized mobile payment wallets.</p>
            </div>

            {/* Step 4 */}
            <div className="group relative bg-[#131d31]/50 border border-white/[0.05] p-8 rounded-2xl hover:border-rose-500/20 transition-all duration-300">
              <div className="absolute top-6 right-6 text-6xl font-black text-slate-800/30 group-hover:text-rose-500/10 transition-colors duration-300">04</div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Download e-Visa</h4>
              <p className="text-gray-400 text-sm leading-relaxed font-light">Receive your official e-Visa letter with a verified validation QR code straight via email.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Statistics Section */}
      <div className="relative py-20 bg-gradient-to-r from-blue-950 via-[#0f172a] to-blue-950 border-y border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {/* Stat 1 */}
            <div className="p-4">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 mb-2">24-72h</div>
              <div className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">Average Approval Speed</div>
            </div>
            {/* Stat 2 */}
            <div className="p-4">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-2">190+</div>
              <div className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">Countries Supported</div>
            </div>
            {/* Stat 3 */}
            <div className="p-4">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-2">99.2%</div>
              <div className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">Application Success Rate</div>
            </div>
            {/* Stat 4 */}
            <div className="p-4">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300 mb-2">10k+</div>
              <div className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">e-Visas Issued Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stateful FAQ Section */}
      <FaqAccordion />

      {/* Banner Section */}
      <div className="relative py-32 bg-gray-900 border-t-4 border-primary">
         <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover opacity-20"
            src={bannerImage} 
            alt="Emirates A380" 
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h4 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">We Provide The Best Service</h4>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">We Provide The Best Way To Success Your Migration</h2>
          <p className="text-gray-400 mb-10 max-w-2xl text-lg">Fast, reliable, and completely online process. Apply from anywhere in the world and get your visa delivered to your email.</p>
          <Link to="/about" className="inline-block px-10 py-4 border-2 border-gray-400 text-white font-bold tracking-wider hover:border-white hover:bg-white hover:text-gray-900 transition-all">
            CONTACT US →
          </Link>
        </div>
      </div>
    </div>
  );
};

// Local Stateful FAQ Accordion Component to maintain clean structure
const FaqAccordion = () => {
  const [activeFaq, setActiveFaq] = React.useState(null);

  const faqs = [
    {
      q: "What is the validity period of a Somali tourist e-Visa?",
      a: "The standard tourist e-Visa is valid for 30 days from the date of arrival. It permits a single entry into the territory of the Federal Republic of Somalia."
    },
    {
      q: "Which documents do I need to prepare before applying?",
      a: "You will need a scanned copy of your passport bio-page (with at least 6 months validity remaining), a recent digital passport-sized photo (portrait format), and electronic payment credentials to submit the processing fee."
    },
    {
      q: "Can I extend my e-Visa after arrival?",
      a: "Yes, extensions can be processed at the Department of Immigration & Citizenship headquarters in Mogadishu or online through the portal under application services prior to expiration."
    },
    {
      q: "What are the visa processing fees and payment modes?",
      a: "Fees depend on the selected visa category (Worker, Business, Tourist). You can securely pay online using Visa, MasterCard, UnionPay, American Express, or supported mobile payments."
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-950 to-slate-950 py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary font-bold uppercase tracking-widest text-sm mb-3">Support</h2>
          <h3 className="text-4xl font-extrabold text-white">Frequently Asked Questions</h3>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto text-base font-light">Find instant answers to common inquiries about the Somalia online e-Visa system.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index}
                className={`bg-white/[0.02] border rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                  isOpen ? 'border-primary/45 bg-white/[0.04]' : 'border-white/[0.06] hover:border-white/15'
                }`}
                onClick={() => setActiveFaq(isOpen ? null : index)}
              >
                <div className="flex justify-between items-center p-6 text-left">
                  <span className="font-bold text-white text-lg pr-4">{faq.q}</span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-primary/20 text-blue-400' : 'text-gray-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 border-t border-white/[0.06] p-6' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <p className="text-gray-400 font-light leading-relaxed text-sm">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
