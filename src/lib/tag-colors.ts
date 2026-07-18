/* Warm charcoal palette — no cyan SaaS defaults */
const COLORS: Record<string, string> = {
  react: '#e8a054',
  nextjs: '#f5f0e8',
  typescript: '#c4a574',
  css: '#a39e93',
  tailwind: '#b87a38',
  node: '#7cb87a',
  docker: '#8a9eab',
  python: '#c4a574',
  database: '#a39e93',
  ai: '#e8a054',
  devops: '#e85d4c',
  testing: '#c4786a',
  design: '#c4786a',
  performance: '#7cb87a',
  security: '#e8a054',
  javascript: '#e8a054',
  api: '#a39e93',
  frontend: '#c4a574',
  backend: '#7cb87a',
  tooling: '#a39e93',
};

const LABELS: Record<string, string> = {
  ai: 'AI',
  api: 'API',
  css: 'CSS',
  nextjs: 'Next.js',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  react: 'React',
  tailwind: 'Tailwind',
  node: 'Node',
  docker: 'Docker',
  python: 'Python',
  database: 'Database',
  devops: 'DevOps',
  testing: 'Testing',
  design: 'Design',
  performance: 'Performance',
  security: 'Security',
  frontend: 'Frontend',
  backend: 'Backend',
  tooling: 'Tooling',
  graphql: 'GraphQL',
  aws: 'AWS',
  linux: 'Linux',
  git: 'Git',
  go: 'Go',
  rust: 'Rust',
  mobile: 'Mobile',
  other: 'Other',
};

export function getTagColor(tag: string): string {
  return COLORS[tag.toLowerCase()] || '#a39e93';
}

/** Display label for tags (AI, Next.js, TypeScript, …). */
export function formatTagLabel(tag: string): string {
  const key = tag.toLowerCase();
  if (LABELS[key]) return LABELS[key];
  if (!tag) return tag;
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}
