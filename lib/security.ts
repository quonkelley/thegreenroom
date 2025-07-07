/**
 * Security utilities for input validation and sanitization
 * Prevents SQL injection, XSS, and other common vulnerabilities
 */

/**
 * Validates and sanitizes email addresses
 * @param email - The email to validate
 * @returns Sanitized email or null if invalid
 */
export const validateEmail = (
  email: string | null | undefined
): string | null => {
  if (!email || typeof email !== 'string') {
    return null;
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return null;
  }

  // Sanitize by trimming and converting to lowercase
  return email.trim().toLowerCase();
};

/**
 * Validates and sanitizes database IDs
 * @param id - The ID to validate
 * @returns Sanitized ID or null if invalid
 */
export const validateId = (
  id: string | number | null | undefined
): string | number | null => {
  if (id === null || id === undefined) {
    return null;
  }

  // If it's a number, ensure it's positive
  if (typeof id === 'number') {
    return id > 0 ? id : null;
  }

  // If it's a string, ensure it's not empty and contains only valid characters
  if (typeof id === 'string') {
    const sanitized = id.trim();
    // Only allow alphanumeric characters, hyphens, and underscores
    const validIdRegex = /^[a-zA-Z0-9_-]+$/;
    return validIdRegex.test(sanitized) ? sanitized : null;
  }

  return null;
};

/**
 * Sanitizes text input to prevent XSS
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export const sanitizeText = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return text
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validates and sanitizes URLs
 * @param url - The URL to validate
 * @returns Sanitized URL or null if invalid
 */
export const validateUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const sanitized = url.trim();

  // Basic URL validation
  try {
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    return sanitized;
  } catch {
    return null;
  }
};

/**
 * Validates phone numbers
 * @param phone - The phone number to validate
 * @returns Sanitized phone number or null if invalid
 */
export const validatePhone = (
  phone: string | null | undefined
): string | null => {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-digit characters except +, -, (, ), and space
  const sanitized = phone.replace(/[^\d+\-()\s]/g, '');

  // Basic validation - should have at least 10 digits
  const digitCount = sanitized.replace(/\D/g, '').length;
  if (digitCount < 10) {
    return null;
  }

  return sanitized;
};

/**
 * Rate limiting utility for API endpoints
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }

    const requests = this.requests.get(identifier)!;
    const recentRequests = requests.filter(time => time > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    globalRateLimiter.cleanup();
  },
  5 * 60 * 1000
);
