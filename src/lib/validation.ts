/**
 * Validation helpers for API routes and models.
 * Returns error messages (non-null) for invalid input, null for valid input.
 */

/**
 * Validates string length against min/max bounds.
 * Returns error message if invalid, null if valid.
 */
export function validateStringLen(
  str: string,
  options: { min?: number; max?: number }
): string | null {
  const { min, max } = options;

  if (min !== undefined && str.length < min) {
    return `String must be at least ${min} character${min === 1 ? "" : "s"} long`;
  }

  if (max !== undefined && str.length > max) {
    return `String must be at most ${max} character${max === 1 ? "" : "s"} long`;
  }

  return null;
}

/**
 * Validates that a string is a valid HTTP or HTTPS URL.
 * Returns true if valid, false otherwise.
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates that a value is one of the allowed enum members.
 * Returns true if value is in allowed array, false otherwise.
 */
export function oneOf<T>(value: T, allowed: T[]): boolean {
  return allowed.includes(value);
}
