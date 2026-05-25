import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#0b1f38] text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1 */}
          <div>
            <h4 className="text-white text-xl font-bold mb-6">Important Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className="hover:text-primary transition-colors">Somali Airlines</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Somalia Tourism</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Mogadishu International Airport</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-white text-xl font-bold mb-6">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/apply" className="hover:text-primary transition-colors">E-Visa Application</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">E-Visa Extension</Link></li>
              <li><Link to="/track" className="hover:text-primary transition-colors">Status Check</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Company Registration</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white text-xl font-bold mb-6">Information</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors">Visa Requirements</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">Tourist Visa</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">Business Visa</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-white text-xl font-bold mb-6">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="mr-3">📍</span> 
                <span>Address: Mogadishu, Somalia</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">📞</span> 
                <span>+252 (61) 000 0000</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">✉️</span> 
                <span>info@evisa.gov.so</span>
              </li>
              <li className="flex items-start text-gray-400">
                <span className="mr-3">🕒</span> 
                <span>Mon - Fri : 08:00 AM - 17:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex justify-center space-x-2 md:space-x-4 mb-8 flex-wrap items-center">
          <div className="bg-white px-3 py-1.5 rounded text-blue-800 font-bold text-xs m-1">AMEX</div>
          <div className="bg-white px-3 py-1.5 rounded text-gray-800 font-bold text-xs italic m-1">Diners Club</div>
          <div className="bg-white px-3 py-1.5 rounded text-red-600 font-bold text-xs m-1">MasterCard</div>
          <div className="bg-white px-3 py-1.5 rounded text-blue-900 font-bold text-xs italic m-1">VISA</div>
          <div className="bg-white px-3 py-1.5 rounded text-red-500 font-bold text-xs m-1">UnionPay</div>
          <div className="bg-white px-3 py-1.5 rounded text-gray-600 font-bold text-xs m-1">G Pay</div>
          <div className="bg-white px-3 py-1.5 rounded text-blue-500 font-bold text-xs m-1">AliPay</div>
        </div>

        <div className="border-t border-[#1e3a5f] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <div className="flex flex-col space-y-1">
            <p>© 2026 Immigration And Citizenship Service.</p>
            <p>Powered by: <span className="text-white font-semibold">Somalia Federal Government</span></p>
          </div>
          
          {/* Social Media Links from Top Bar */}
          <div className="flex space-x-3">
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm" title="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-sky-500 flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm" title="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-rose-600 flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm" title="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>

          <div className="space-x-4">
            <Link to="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
