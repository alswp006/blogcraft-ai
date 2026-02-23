export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Create a SPEC-compliant JSON error Response.
 *
 * Shape: { "error": { code, message, ?fieldErrors } }
 */
export function apiError(status: number, body: ApiErrorBody): Response {
  return new Response(JSON.stringify({ error: body }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
