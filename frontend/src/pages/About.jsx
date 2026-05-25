import React from 'react';
import { Link } from 'react-router-dom';
import { GlobeAltIcon, PhoneIcon } from '@heroicons/react/24/outline';

const About = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Simple Header for About Page */}
      <header className="bg-white shadow-sm border-b border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer">
              <GlobeAltIcon className="h-10 w-10 text-primary mr-3" />
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-gray-900 tracking-tight leading-none">Somalia</span>
                <span className="font-medium text-xs text-primary tracking-widest uppercase">E-Visa Portal</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-10 font-semibold text-[15px]">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Home</Link>
              <Link to="/about" className="text-primary">About Us</Link>
            </nav>
            <Link to="/login" className="px-8 py-2.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-[#0b1f38] py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Us / Info</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">Everything you need to know about the Somalia E-Visa process and requirements.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">We Provide The Best Way To Success Your Migration</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Fast, reliable, and completely online process. Apply from anywhere in the world and get your visa delivered to your email. Our goal is to facilitate seamless entry into the Federal Republic of Somalia for tourists, investors, and workers.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The Immigration and Citizenship Service ensures strict compliance with national security while maintaining an efficient, user-friendly digital application experience.
            </p>
            <Link to="/apply" className="px-8 py-3 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors inline-block shadow-sm">
              Start Application
            </Link>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80" 
              alt="Airplane and Map" 
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100 hidden md:block">
              <div className="text-4xl font-extrabold text-primary mb-1 text-center">100%</div>
              <div className="text-sm font-bold text-gray-800 uppercase tracking-wider text-center">Online Process</div>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center hover:border-primary transition-colors">
              <div className="text-4xl mb-4">📍</div>
              <h4 className="font-bold text-lg mb-2">Headquarters</h4>
              <p className="text-gray-600 text-sm">Airport Road, Mogadishu<br/>Federal Republic of Somalia</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center hover:border-primary transition-colors">
              <div className="text-4xl mb-4">📞</div>
              <h4 className="font-bold text-lg mb-2">Phone</h4>
              <p className="text-gray-600 text-sm">+252 (61) 000 0000<br/>Mon-Fri, 8am-5pm</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center hover:border-primary transition-colors">
              <div className="text-4xl mb-4">✉️</div>
              <h4 className="font-bold text-lg mb-2">Email</h4>
              <p className="text-gray-600 text-sm">support@evisa.gov.so<br/>info@evisa.gov.so</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
