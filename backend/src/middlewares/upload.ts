import path from 'path';
import fs from 'fs';
import multer from 'multer';

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'awards');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const awardStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `award-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

export const uploadAwardImage = multer({
  storage: awardStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Допускаются только изображения'));
  },
});
