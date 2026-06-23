import { NotFoundError, ValidationError } from "./store";

/** Convert thrown store errors into appropriate JSON HTTP responses. */
export function errorResponse(err: unknown): Response {
  if (err instanceof ValidationError) {
    return Response.json({ error: err.message }, { status: 400 });
  }
  if (err instanceof NotFoundError) {
    return Response.json({ error: err.message }, { status: 404 });
  }
  const message = err instanceof Error ? err.message : "Unexpected error.";
  return Response.json({ error: message }, { status: 500 });
}
