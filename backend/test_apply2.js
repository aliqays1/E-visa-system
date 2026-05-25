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
    
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="visaType"\r\n\r\n';
    body += 'Tourist\r\n';
    
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="purposeOfTravel"\r\n\r\n';
    body += 'Travel\r\n';
    
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
