(async () => {
  try {
    const email = 'testuser_' + Date.now() + '@example.com';
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Test', email: email, password: 'password123', phone: '1234', nationality: 'US' })
    });
    const regData = await regRes.json();
    const token = regData.token;

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = '';
    
    const addField = (name, val) => {
      body += '--' + boundary + '\r\n';
      body += 'Content-Disposition: form-data; name="' + name + '"\r\n\r\n';
      body += val + '\r\n';
    };

    const addFile = (name, filename, mimetype, content) => {
      body += '--' + boundary + '\r\n';
      body += 'Content-Disposition: form-data; name="' + name + '"; filename="' + filename + '"\r\n';
      body += 'Content-Type: ' + mimetype + '\r\n\r\n';
      body += content + '\r\n';
    };

    addField('visaType', 'Tourist');
    addField('purposeOfTravel', 'Travel');
    addField('amountPaid', '100');
    addField('paymentStatus', 'Pending');
    addField('paymentMethod', 'Bank Transfer');
    addField('personalDetails', JSON.stringify({ firstName: 'Test', lastName: 'User', passportNumber: '123' }));
    
    addFile('passportDocument', 'passport.jpg', 'image/jpeg', 'dummy');
    addFile('photoDocument', 'photo.jpg', 'image/jpeg', 'dummy');
    addFile('supportingDocument', 'Screenshot 2026-05-19 121016.png', 'application/pdf', 'dummy');
    
    body += '--' + boundary + '--\r\n';

    const res = await fetch('http://localhost:5000/api/visa/apply', {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'multipart/form-data; boundary=' + boundary
      },
      body: body
    });
    
    console.log('STATUS:', res.status);
    console.log('BODY:', await res.text());
  } catch(e) { console.error(e); }
})();
