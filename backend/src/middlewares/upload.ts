import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { randomBytes } from 'crypto';
import multer from 'multer';
import sharp from 'sharp';
import type { RequestHandler } from 'express';

const rootUploadsDir = path.join(__dirname, '..', '..', 'uploads');
const awardsUploadsDir = path.join(rootUploadsDir, 'awards');
const charactersUploadsDir = path.join(rootUploadsDir, 'characters');
if (!fs.existsSync(awardsUploadsDir)) fs.mkdirSync(awardsUploadsDir, { recursive: true });
if (!fs.existsSync(charactersUploadsDir)) fs.mkdirSync(charactersUploadsDir, { recursive: true });

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (/^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Допускаются только изображения'));
};

const createUpload = (maxSizeMb: number) => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSizeMb * 1024 * 1024 },
  fileFilter: imageFilter,
});

const createImageOptimizer = ({ folder, prefix, quality = 75 }: { folder: string; prefix: string; quality?: number }): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.file) return next();
      const fileName = `${prefix}-${Date.now()}-${randomBytes(4).toString('hex')}.webp`;
      const outputPath = path.join(folder, fileName);

      await sharp(req.file.buffer)
        .rotate()
        .webp({ quality, effort: 6 })
        .toFile(outputPath);

      req.file.filename = fileName;
      req.file.path = outputPath;
      req.file.destination = folder;
      req.file.mimetype = 'image/webp';
      req.file.size = (await fsPromises.stat(outputPath)).size;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const uploadAwardImage = createUpload(4);
export const optimizeAwardImage = createImageOptimizer({ folder: awardsUploadsDir, prefix: 'award', quality: 72 });

export const uploadCharacterImage = createUpload(15);
export const optimizeCharacterImage = createImageOptimizer({ folder: charactersUploadsDir, prefix: 'character', quality: 70 });
