export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  const parsed = new URL(trimmed);
  parsed.hash = '';
  parsed.hostname = parsed.hostname.toLowerCase();

  let pathname = parsed.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  parsed.pathname = pathname || '/';

  return parsed.toString();
}

export function tryNormalizeUrl(raw: string): string | null {
  try {
    return normalizeUrl(raw);
  } catch {
    return null;
  }
}
