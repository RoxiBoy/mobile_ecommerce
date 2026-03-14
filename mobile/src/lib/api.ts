import { API_BASE_URL } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

const buildQueryString = (query?: RequestOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const parsed = params.toString();
  return parsed ? `?${parsed}` : "";
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body, query } = options;
  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(query)}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  let data: unknown;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: "Unexpected response format" };
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message ?? "Request failed")
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}
