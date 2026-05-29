import React, { useState, useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, value, onChange }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value === '') {
      setOtp(Array(length).fill(''));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, ''); // Ensure only numbers
    if (!val && e.target.value !== '') return; // Block non-numeric types completely

    const newOtp = [...otp];
    
    // Allow pasting multiple numbers
    if (val.length > 1) {
      const pasted = val.slice(0, length).split('');
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      const nextIndex = Math.min(index + pasted.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    newOtp[index] = val;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input
    if (val !== '' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move back and clear that input
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
        inputRefs.current[index - 1].focus();
      }
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center w-full my-6">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength={length} // Important to allow pasting full code
          ref={(ref) => inputRefs.current[index] = ref}
          value={data}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 bg-white shadow-sm"
        />
      ))}
    </div>
  );
};

export default OtpInput;
