export interface PageMetadata {
  title: string;
  description: string;
  favicon: string;
}

function faviconFor(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return '';
  }
}

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      'i'
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }

  return '';
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title');
  if (og) return og;

  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeHtml(match[1].trim()) : '';
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function assertHttpUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('Invalid URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http/https URLs are supported');
  }

  return parsed;
}

export async function fetchPageMetadata(rawUrl: string): Promise<PageMetadata> {
  const parsed = assertHttpUrl(rawUrl);
  const fallbackFavicon = faviconFor(parsed.href);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DevBookmarksBot/1.0 (+https://localhost)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return {
        title: parsed.hostname,
        description: '',
        favicon: fallbackFavicon,
      };
    }

    const html = await res.text();
    const title = extractTitle(html) || parsed.hostname;
    const description =
      extractMeta(html, 'og:description') ||
      extractMeta(html, 'description') ||
      '';

    return {
      title,
      description: description.slice(0, 500),
      favicon: fallbackFavicon,
    };
  } catch {
    return {
      title: parsed.hostname,
      description: '',
      favicon: fallbackFavicon,
    };
  }
}
