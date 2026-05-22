import { WarrantyStatus } from './types';

// Reference today is 2026-05-22 (as provided in metadata)
export const TODAY_REF = new Date('2026-05-22');

export function getTodayDateString(): string {
  const d = new Date();
  // Return YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addMonths(dateStr: string, months: number): Date {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date;
}

export function formatDateString(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const monthsArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  return `${date.getDate()} ${monthsArabic[date.getMonth()]} ${date.getFullYear()}`;
}

export function getWarrantyStatus(purchaseDateStr: string, warrantyMonths: number): WarrantyStatus {
  const purchaseDate = new Date(purchaseDateStr);
  
  // Calculate expiry date: add months to purchase date
  const expiryDate = new Date(purchaseDateStr);
  expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);
  
  const expiryYear = expiryDate.getFullYear();
  const expiryMonth = String(expiryDate.getMonth() + 1).padStart(2, '0');
  const expiryDay = String(expiryDate.getDate()).padStart(2, '0');
  const expiryDateString = `${expiryYear}-${expiryMonth}-${expiryDay}`;
  
  // Use current date for diff
  const today = new Date(); // Dynamic today
  // Clear times to compare only days
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Also calculate approximate months remaining
  const approxMonthsRemaining = Number((daysRemaining / 30.4).toFixed(1));
  
  let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';
  if (daysRemaining <= 0) {
    status = 'expired';
  } else if (daysRemaining <= 60) {
    // Expiring within 2 months (60 days)
    status = 'expiring_soon';
  }
  
  return {
    status,
    daysRemaining,
    expiryDateString,
    monthsRemaining: approxMonthsRemaining,
  };
}

// Calculate days relative to a maintenance date or next maintenance date
export function getDaysUntil(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
