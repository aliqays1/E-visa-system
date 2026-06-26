/**
 * Email Templates for Somalia E-Visa Portal
 * Designed with a professional, government-style aesthetic.
 */

const baseTemplate = (content) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #1e3a8a; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">SOMALIA E-VISA PORTAL</h1>
      <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Official Government Communication</p>
    </div>
    <div style="padding: 32px; color: #374151; line-height: 1.6; font-size: 16px;">
      ${content}
    </div>
    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 13px;">This is an automated message from the Somalia Immigration and Citizenship Service.</p>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">Please do not reply directly to this email.</p>
    </div>
  </div>
`;

exports.getApplicationReceivedTemplate = (name, applicationId) => {
  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>This email confirms that your Somalia E-Visa application has been successfully received and is currently under review.</p>
    
    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;"><strong>Application Reference Number:</strong></p>
      <p style="margin: 0; font-family: monospace; font-size: 18px; color: #1e3a8a;">${applicationId}</p>
    </div>
    
    <p>Standard processing times are 24-72 hours. You will receive another notification once a decision has been made.</p>
    <p>To check the real-time status of your application, please log in to the E-Visa portal.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="http://localhost:5173/login" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Log In to Portal</a>
    </div>
  `;
  return baseTemplate(content);
};

exports.getVisaApprovedTemplate = (name) => {
  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>We are pleased to inform you that your Somalia E-Visa application has been <strong><span style="color: #10b981;">APPROVED</span></strong>.</p>
    
    <p>Your official e-Visa document has been generated and securely attached to your online profile.</p>
    
    <p>For security purposes, we do not attach the visa directly to this email. Please log in to the official portal to download and print your visa document. You must present this printed document upon arrival.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="http://localhost:5173/login" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Download E-Visa</a>
    </div>
  `;
  return baseTemplate(content);
};

exports.getVisaRejectedTemplate = (name, reason) => {
  const reasonBlock = reason ? `
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px;"><strong>Reason for Rejection:</strong></p>
      <p style="margin: 0; color: #7f1d1d;">${reason}</p>
    </div>
  ` : '';

  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>We regret to inform you that your Somalia E-Visa application has been <strong><span style="color: #ef4444;">REJECTED</span></strong> after careful review by the Immigration authorities.</p>
    
    ${reasonBlock}
    
    <p>If you believe this decision was made in error or if you wish to appeal, please log in to the portal for further instructions or contact our support team.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="http://localhost:5173/login" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Application Details</a>
    </div>
  `;
  return baseTemplate(content);
};

exports.getNeedsRevisionTemplate = (name, message) => {
  const messageBlock = message ? `
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #b45309; font-size: 14px;"><strong>Message from Immigration Officer:</strong></p>
      <p style="margin: 0; color: #92400e;">${message}</p>
    </div>
  ` : '';

  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your Somalia E-Visa application is currently under review, but <strong><span style="color: #f59e0b;">additional information is required</span></strong> before we can process it further.</p>
    
    ${messageBlock}
    
    <p>To avoid delays or automatic rejection, please log in to the portal as soon as possible to update your application with the requested information or documents.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="http://localhost:5173/login" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Update Application</a>
    </div>
  `;
  return baseTemplate(content);
};
