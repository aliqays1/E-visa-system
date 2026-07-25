const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists inside backend
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|avif|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    console.log('Failed fileFilter:', { originalname: file.originalname, extname: path.extname(file.originalname).toLowerCase(), mimetype: file.mimetype, regexTestExt: filetypes.test(path.extname(file.originalname).toLowerCase()), regexTestMime: filetypes.test(file.mimetype) });
    cb(new Error('Only images (jpeg, jpg, png, avif, webp) and PDFs are allowed'));
  }
});

module.exports = upload;
