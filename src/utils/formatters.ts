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
