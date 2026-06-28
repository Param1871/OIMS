/**
 * HAL OIMS — Utility Helper Functions
 * Phase 3: Code generation, formatting, and general utilities
 */

import crypto from 'crypto';
import { CONSTANTS } from '../config/constants';

// ── Sequential number generators ──────────────────────────────────────────────

/**
 * Generate a document number like PR-2024-000001
 */
export const generateDocNumber = (prefix: string, sequence: number): string => {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(6, '0');
  return `${prefix}-${year}-${seq}`;
};

/**
 * Generate a timestamped transaction number like TXN-20241231-ABCD
 */
export const generateTransactionNumber = (prefix = CONSTANTS.TXN_PREFIX): string => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
};

/**
 * Generate a random item barcode value
 */
export const generateBarcode = (itemCode: string): string => {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `HAL-${itemCode}-${suffix}`;
};

/**
 * Generate a QR code value (same structure)
 */
export const generateQRCode = (itemCode: string): string => {
  return `QR-${itemCode}-${Date.now()}`;
};

/**
 * Slugify a string for use in codes
 */
export const slugify = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// ── Math & finance helpers ────────────────────────────────────────────────────

/**
 * Calculate GST amount
 */
export const calculateGST = (amount: number, gstRatePercent: number): number =>
  Math.round((amount * gstRatePercent) / 100 * 100) / 100;

/**
 * Calculate total with GST
 */
export const calculateTotal = (amount: number, gstRatePercent: number): number =>
  Math.round((amount + calculateGST(amount, gstRatePercent)) * 100) / 100;

/**
 * Round to 2 decimal places
 */
export const round2 = (value: number): number => Math.round(value * 100) / 100;

// ── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Check if a date is past expiry
 */
export const isExpired = (date: Date | null | undefined): boolean => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Check if a date is within N days
 */
export const isWithinDays = (date: Date | null | undefined, days: number): boolean => {
  if (!date) return false;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return new Date(date) <= threshold;
};

/**
 * Format date to Indian locale string
 */
export const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
  });

// ── String helpers ────────────────────────────────────────────────────────────

/**
 * Capitalize first letter of each word
 */
export const titleCase = (str: string): string =>
  str.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());

/**
 * Safely parse JSON (returns null on failure)
 */
export const safeParseJSON = <T>(str: string): T | null => {
  try { return JSON.parse(str) as T; } catch { return null; }
};

/**
 * Mask sensitive data for logging (e.g., password hash)
 */
export const maskSensitive = (obj: Record<string, unknown>): Record<string, unknown> => {
  const sensitiveKeys = ['password', 'passwordHash', 'resetToken', 'token', 'secret'];
  const masked = { ...obj };
  for (const key of sensitiveKeys) {
    if (masked[key]) masked[key] = '***MASKED***';
  }
  return masked;
};

/**
 * Get client IP from request (handles proxy)
 */
export const getClientIP = (req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || 'unknown';
};