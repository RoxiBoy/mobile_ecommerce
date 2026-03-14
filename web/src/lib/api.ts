const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

const buildQuery = (query?: RequestOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const str = params.toString();
  return str ? `?${str}` : "";
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body, query } = options;

  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
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
    data = { message: "Invalid server response" };
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
