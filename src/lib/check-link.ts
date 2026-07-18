export type LinkStatus = 'unknown' | 'ok' | 'broken' | 'redirect';

export async function checkLink(url: string): Promise<LinkStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': 'DevBookmarksBot/1.0' },
    });

    // Some servers reject HEAD — fall back to GET
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'DevBookmarksBot/1.0' },
      });
    }

    if (res.status >= 300 && res.status < 400) return 'redirect';
    if (res.ok) return 'ok';
    return 'broken';
  } catch {
    return 'broken';
  } finally {
    clearTimeout(timeout);
  }
}
