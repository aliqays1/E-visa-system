const express = require('express');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const compression = require('compression');

const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Professional Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`\x1b[36m[API]\x1b[0m ${req.method} ${req.originalUrl} - \x1b[32m${res.statusCode}\x1b[0m (${duration}ms)`);
  });
  next();
});

// Dynamic e-Visa PDF server: generates PDF on the fly if missing on disk
app.get('/uploads/pdfs/visa-:id', async (req, res, next) => {
  try {
    const rawId = req.params.id || '';
    const cleanId = rawId.replace(/\.pdf$/i, '');
    const pdfPath = path.join(__dirname, 'uploads', 'pdfs', `visa-${cleanId}.pdf`);

    // 1. If physical PDF exists on disk, serve it immediately
    if (fs.existsSync(pdfPath)) {
      return res.sendFile(pdfPath);
    }

    // 2. If physical file is missing, try generating on-the-fly for approved applications
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      const VisaApplication = require('./models/VisaApplication');
      const { generateVisaPdf } = require('./utils/pdfGenerator');

      const application = await VisaApplication.findById(cleanId);
      if (application && application.applicationStatus === 'Approved') {
        const relativePdfPath = await generateVisaPdf(application);
        application.pdfUrl = relativePdfPath;
        await application.save();

        const fullPdfPath = path.join(__dirname, relativePdfPath);
        if (fs.existsSync(fullPdfPath)) {
          return res.sendFile(fullPdfPath);
        }
      }
    }
  } catch (error) {
    console.error('Error in on-the-fly PDF handler:', error);
  }
  next();
});

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fallback for missing upload files (Express 5 path match)
const missingUploadHandler = (req, res) => {
  const fileName = req.path.replace(/^\//, '') || 'requested file';
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document Not Found</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; border: 1px solid #334155; padding: 2.5rem; border-radius: 1.5rem; max-width: 440px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #f8fafc; }
        p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; }
        .file-box { background: #0f172a; border: 1px solid #334155; padding: 0.75rem; border-radius: 0.75rem; font-family: monospace; font-size: 0.8rem; color: #38bdf8; word-break: break-all; margin-bottom: 1.5rem; }
        .btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
        .btn:hover { background: #1d4ed8; transform: translateY(-1px); }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">📁</div>
        <h2>Document File Not Found</h2>
        <p>The document record exists in the database, but the physical uploaded file is no longer on the server disk (e.g., created during a previous test session).</p>
        <div class="file-box">${fileName}</div>
        <button class="btn" onclick="window.close()">Close Window</button>
      </div>
    </body>
    </html>
  `);
};

app.get('/uploads/*', missingUploadHandler);
app.use('/uploads', missingUploadHandler);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/visa', require('./routes/visaRoutes'));
app.use('/api/auditor', require('./routes/auditorRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('Somalia E-Visa API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
