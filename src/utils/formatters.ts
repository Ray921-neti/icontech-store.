export const STORE_PHONE = '07039420600';
export const STORE_PHONE_INTL = '2347039420600';
export const STORE_LOCATION = 'Opposite Adeyemi, Ondo, Ondo State, Nigeria';
export const STORE_NAME = 'ICONTECH';

export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₦0';
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function createWhatsAppUrl(message: string, phone: string = STORE_PHONE_INTL): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  formatted: string;
  error?: string;
}

/**
 * Validates and normalizes Nigerian mobile phone numbers with +234 support
 * Accepts: 070..., 080..., 081..., 090..., 091..., +234..., or 234...
 */
export function normalizeNigerianPhone(rawInput: string): PhoneValidationResult {
  if (!rawInput || !rawInput.trim()) {
    return { isValid: false, normalized: '', formatted: '', error: 'Phone number is required.' };
  }

  let digits = rawInput.trim().replace(/\D/g, '');

  if (digits.startsWith('0') && digits.length === 11) {
    digits = '234' + digits.slice(1);
  } else if (digits.length === 10 && (digits.startsWith('7') || digits.startsWith('8') || digits.startsWith('9'))) {
    digits = '234' + digits;
  }

  if (!digits.startsWith('234') || digits.length !== 13) {
    return {
      isValid: false,
      normalized: digits,
      formatted: rawInput,
      error: 'Please enter a valid 11-digit Nigerian phone number (e.g. 07039420600 or +234...)',
    };
  }

  // Check 4th digit after 234: 7, 8, or 9
  const networkDigit = digits.charAt(3);
  if (!['7', '8', '9'].includes(networkDigit)) {
    return {
      isValid: false,
      normalized: digits,
      formatted: rawInput,
      error: 'Please enter a recognized Nigerian network number (MTN, Airtel, Glo, 9mobile).',
    };
  }

  const formatted = `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  return { isValid: true, normalized: digits, formatted };
}

/**
 * Deterministically maps normalized Nigerian phone to internal secure Firebase Auth email identifier.
 * Firebase Auth handles password hashing (scrypt) and secure session management.
 * Passwords are never stored in Firestore.
 */
export function phoneToAuthEmail(normalizedPhone: string): string {
  return `${normalizedPhone}@customer.icontech.ng`;
}
