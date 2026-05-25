(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@evisa.gov.so', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

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
