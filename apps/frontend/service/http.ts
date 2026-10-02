/**
 * Shared HTTP client for the SceneTap backend.
 * All backend calls go through `request()` so URL handling and error
 * normalization live in exactly one place.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ErrorBody = {
  message?: string;
  errors?: { fieldErrors?: Record<string, string[]> };
};

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Is the backend running?");
  }

  const data = (await res.json().catch(() => null)) as ErrorBody | T | null;

  if (!res.ok) {
    const fieldErrors = (data as ErrorBody | null)?.errors?.fieldErrors;
    const firstFieldIssue = fieldErrors ? Object.values(fieldErrors).flat()[0] : undefined;
    throw new ApiError(
      res.status,
      (data as ErrorBody | null)?.message ?? firstFieldIssue ?? "Something went wrong",
    );
  }

  return data as T;
}
