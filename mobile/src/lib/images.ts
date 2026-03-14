import { API_BASE_URL } from "./config";

const PROXY_HOSTS = new Set(["upload.wikimedia.org"]);

export const resolveImageUri = (images: unknown): string | undefined => {
  if (Array.isArray(images)) {
    const first = images.find((value) => typeof value === "string" && value.trim().length > 0);
    const normalized = typeof first === "string" ? first.trim() : "";
    return normalized.startsWith("http") ? normalized : undefined;
  }

  if (typeof images === "string") {
    const normalized = images.trim();
    return normalized.startsWith("http") ? normalized : undefined;
  }

  return undefined;
};

export const maybeProxyImageUri = (uri?: string): string | undefined => {
  if (!uri) return undefined;
  try {
    const parsed = new URL(uri);
    if (PROXY_HOSTS.has(parsed.hostname)) {
      return `${API_BASE_URL}/media?url=${encodeURIComponent(uri)}`;
    }
  } catch {
    return uri;
  }
  return uri;
};
