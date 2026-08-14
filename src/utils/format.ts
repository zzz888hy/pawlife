/**
 * Format a number with comma separators
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN');
}

/**
 * Format price in yuan
 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(1)}`;
}

/**
 * Format relative time from now
 */
export function timeAgo(dateStr: string): string {
  // Simplified: return the display string directly
  return dateStr;
}

/**
 * Calculate age from birthday
 */
export function calcAge(birthday: string): number {
  const birth = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate companion days from a start date
 */
export function calcDays(from: string): number {
  const start = new Date(from);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
