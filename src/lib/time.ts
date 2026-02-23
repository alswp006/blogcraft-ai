/**
 * Convert milliseconds since epoch to an ISO 8601 string.
 * e.g. msToIso(0) === "1970-01-01T00:00:00.000Z"
 */
export function msToIso(ms: number): string {
  return new Date(ms).toISOString();
}

/**
 * Return the current time as milliseconds since epoch (same unit as Date.now()).
 */
export function isoNowMs(): number {
  return Date.now();
}
