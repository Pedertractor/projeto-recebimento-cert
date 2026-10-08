import { HttpClientError } from '@/lib/http-client';

export function isNetworkError(error: unknown): boolean {
  if (error instanceof HttpClientError) {
    return error.statusCode === undefined;
  }

  return false;
}
