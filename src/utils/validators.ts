import { ValidationError } from '../errors';

export function validateString(val: any, field: string, min = 1, max = 255, required = true): string {
  if (val === undefined || val === null) {
    if (required) {
      throw new ValidationError(`Field '${field}' is required`);
    }
    return '';
  }
  if (typeof val !== 'string') {
    throw new ValidationError(`Field '${field}' must be a string`);
  }
  const clean = val.trim();
  if (clean.length < min || clean.length > max) {
    throw new ValidationError(`Field '${field}' must be between ${min} and ${max} characters`);
  }
  return clean;
}

export function validateOptionalString(val: any, field: string, max = 255): string | null {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return null;
  }
  return validateString(val, field, 1, max, false);
}

export function validateEmail(val: any, field = 'email', required = true): string {
  const email = validateString(val, field, 3, 255, required);
  if (!email && !required) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(`Field '${field}' must be a valid email address`);
  }
  return email;
}

export function validateOptionalEmail(val: any, field = 'email'): string | null {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return null;
  }
  return validateEmail(val, field, false);
}

export function validateUuid(val: any, field: string, required = true): string {
  const uuid = validateString(val, field, 36, 36, required);
  if (!uuid && !required) return '';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw new ValidationError(`Field '${field}' must be a valid UUID`);
  }
  return uuid;
}

export function validateOptionalUuid(val: any, field: string): string | null {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return null;
  }
  return validateUuid(val, field, false);
}

export function validateNumber(val: any, field: string, min = 0, required = true): number {
  if (val === undefined || val === null) {
    if (required) {
      throw new ValidationError(`Field '${field}' is required`);
    }
    return 0;
  }
  const num = Number(val);
  if (isNaN(num)) {
    throw new ValidationError(`Field '${field}' must be a number`);
  }
  if (num < min) {
    throw new ValidationError(`Field '${field}' must be at least ${min}`);
  }
  return num;
}

export function validateOptionalNumber(val: any, field: string, min = 0): number | null {
  if (val === undefined || val === null) {
    return null;
  }
  return validateNumber(val, field, min, false);
}

export function validateEnum<T extends string>(val: any, field: string, allowed: T[], required = true): T {
  if (val === undefined || val === null) {
    if (required) {
      throw new ValidationError(`Field '${field}' is required and must be one of: ${allowed.join(', ')}`);
    }
    return allowed[0];
  }
  if (!allowed.includes(val as T)) {
    throw new ValidationError(`Field '${field}' must be one of: ${allowed.join(', ')}`);
  }
  return val as T;
}

export function validateOptionalEnum<T extends string>(val: any, field: string, allowed: T[]): T | null {
  if (val === undefined || val === null) {
    return null;
  }
  return validateEnum(val, field, allowed, false);
}

export function validateBoolean(val: any, field: string, required = true): boolean {
  if (val === undefined || val === null) {
    if (required) {
      throw new ValidationError(`Field '${field}' is required`);
    }
    return false;
  }
  if (typeof val === 'boolean') {
    return val;
  }
  if (val === 1 || val === 'true' || val === '1') return true;
  if (val === 0 || val === 'false' || val === '0') return false;
  throw new ValidationError(`Field '${field}' must be a boolean`);
}

export function validateOptionalBoolean(val: any, field: string): boolean | null {
  if (val === undefined || val === null) {
    return null;
  }
  return validateBoolean(val, field, false);
}

export function validateDate(val: any, field: string, required = true): string {
  const dateStr = validateString(val, field, 10, 30, required);
  if (!dateStr && !required) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`Field '${field}' must be a valid date`);
  }
  return date.toISOString();
}

export function validateOptionalDate(val: any, field: string): string | null {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return null;
  }
  return validateDate(val, field, false);
}
