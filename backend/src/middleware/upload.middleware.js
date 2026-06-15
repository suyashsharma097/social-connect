import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError.js';

// Ensure uploads folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedDocTypes = ['.pdf', '.docx', '.doc', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'profileImage') {
    if (allowedImageTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Only images (.jpg, .jpeg, .png, .webp) are allowed for profile picture.', 400), false);
    }
  } else if (file.fieldname === 'resume' || file.fieldname === 'documents') {
    if (allowedDocTypes.includes(ext) || allowedImageTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Only documents (.pdf, .docx, .doc, image) are allowed for resume and attachments.', 400), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const employeeUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]);
