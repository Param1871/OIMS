/**
 * HAL OIMS — File Upload Middleware (Multer)
 * Phase 3: Handles image and document uploads for inventory items, invoices
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';
import { env } from '../config/constants';
import { AppError } from './errorHandler.middleware';

// Ensure upload directories exist
const UPLOAD_DIRS = {
  images:    path.join(env.UPLOAD_DIR, 'images'),
  documents: path.join(env.UPLOAD_DIR, 'documents'),
  invoices:  path.join(env.UPLOAD_DIR, 'invoices'),
  avatars:   path.join(env.UPLOAD_DIR, 'avatars'),
};

Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage engine
const createStorage = (destination: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      cb(null, uniqueName);
    },
  });

// File type filter
const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new AppError('Only image files are allowed (jpg, jpeg, png, gif, webp)', 400));
};

const documentFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new AppError('Only document files are allowed (pdf, doc, xls, csv)', 400));
};

const MAX_SIZE = env.MAX_FILE_SIZE_MB * 1024 * 1024;

// Pre-configured multer instances
export const uploadItemImage = multer({
  storage: createStorage(UPLOAD_DIRS.images),
  limits: { fileSize: MAX_SIZE },
  fileFilter: imageFilter,
}).single('image');

export const uploadDocument = multer({
  storage: createStorage(UPLOAD_DIRS.documents),
  limits: { fileSize: MAX_SIZE },
  fileFilter: documentFilter,
}).single('document');

export const uploadInvoice = multer({
  storage: createStorage(UPLOAD_DIRS.invoices),
  limits: { fileSize: MAX_SIZE },
  fileFilter: documentFilter,
}).single('invoice');

export const uploadAvatar = multer({
  storage: createStorage(UPLOAD_DIRS.avatars),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for avatars
  fileFilter: imageFilter,
}).single('avatar');

export const uploadMultiple = multer({
  storage: createStorage(UPLOAD_DIRS.documents),
  limits: { fileSize: MAX_SIZE, files: 5 },
}).array('files', 5);

// Helper to get public URL from file path
export const getFileUrl = (filePath: string): string => {
  const relativePath = filePath.replace(env.UPLOAD_DIR, '').replace(/\\/g, '/');
  return `/uploads${relativePath}`;
};