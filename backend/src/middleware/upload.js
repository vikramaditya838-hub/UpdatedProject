import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, unique + ALLOWED[file.mimetype]);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED[file.mimetype]) return cb(null, true);
  const err = new Error('Only JPG, PNG, WEBP or AVIF images are allowed');
  err.status = 400;
  cb(err);
};

// Form field name must be "image"
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('image');

// Path saved in PostgreSQL, e.g. "/uploads/1718000000-abc123.jpg"
export const toImagePath = (file) => (file ? `/uploads/${file.filename}` : null);

// Delete a stored image given the path saved in PostgreSQL
export const removeImageFile = (imagePath) => {
  if (!imagePath) return;
  const filePath = path.join(UPLOAD_DIR, path.basename(imagePath));
  fs.unlink(filePath, () => {}); // ignore "file not found"
};
