const ALLOWED_TAGS = [
  'react',
  'nextjs',
  'typescript',
  'javascript',
  'node',
  'python',
  'docker',
  'css',
  'tailwind',
  'database',
  'api',
  'testing',
  'devops',
  'ai',
  'frontend',
  'backend',
  'mobile',
  'security',
  'performance',
  'tooling',
  'go',
  'rust',
  'graphql',
  'aws',
  'linux',
  'git',
  'design',
  'other',
] as const;

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

function normalizeTags(raw: string[]): string[] {
  const allowed = new Set<string>(ALLOWED_TAGS);
  const unique = new Set<string>();

  for (const tag of raw) {
    const cleaned = tag.trim().toLowerCase().replace(/^#+/, '');
    if (allowed.has(cleaned)) unique.add(cleaned);
  }

  return [...unique].slice(0, 5);
}

/** Keyword fallback when OpenRouter key is missing or the request fails. */
function heuristicTags(title: string, description: string, url: string): string[] {
  const haystack = `${title} ${description} ${url}`.toLowerCase();
  const hits: string[] = [];

  for (const tag of ALLOWED_TAGS) {
    if (tag === 'other') continue;
    if (haystack.includes(tag)) hits.push(tag);
  }

  // Common aliases
  if (haystack.includes('next.js') && !hits.includes('nextjs')) hits.push('nextjs');
  if (haystack.includes('tailwindcss') && !hits.includes('tailwind')) hits.push('tailwind');
  if ((haystack.includes('postgres') || haystack.includes('sqlite') || haystack.includes('mongo')) && !hits.includes('database')) {
    hits.push('database');
  }

  return hits.slice(0, 5);
}

export async function suggestTags(
  title: string,
  description: string,
  url?: string
): Promise<string[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your-openrouter-key' || apiKey.startsWith('sk-or-v1-xxxx')) {
    return heuristicTags(title, description, url ?? '');
  }

  const prompt = `Given this dev resource titled "${title}" describing "${description || 'N/A'}"${url ? ` at ${url}` : ''},
suggest 2-5 relevant tech tags from this list only:
[${ALLOWED_TAGS.join(', ')}]
Return ONLY a comma-separated list of tags, nothing else.`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'Dev Bookmarks',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 64,
      }),
    });

    if (!res.ok) {
      return heuristicTags(title, description, url ?? '');
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? '';
    const parsed = normalizeTags(content.split(/[,\n]/));

    if (parsed.length === 0) {
      return heuristicTags(title, description, url ?? '');
    }

    return parsed;
  } catch {
    return heuristicTags(title, description, url ?? '');
  }
}

export { ALLOWED_TAGS };
