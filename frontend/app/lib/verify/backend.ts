export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class BackendError extends Error {}

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  isMultipart?: boolean;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body, isMultipart = false } = options;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (isMultipart) {
    payload = body as BodyInit;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new BackendError(`${method} ${path} -> ${response.status}: ${text}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
