/* Signal Shelf accents — coral / cool shelf, not cyan SaaS */
const COLORS: Record<string, string> = {
  react: '#ff5c4d',
  nextjs: '#f8f4ec',
  typescript: '#5eb0ff',
  css: '#8b92a5',
  tailwind: '#3ecf8e',
  node: '#4ade80',
  docker: '#5eb0ff',
  python: '#ff7a59',
  database: '#8b92a5',
  ai: '#ff5c4d',
  devops: '#f87171',
  testing: '#ff7a59',
  design: '#ff5c4d',
  performance: '#4ade80',
  security: '#ff5c4d',
  javascript: '#ff7a59',
  api: '#5eb0ff',
  frontend: '#ff5c4d',
  backend: '#3ecf8e',
  tooling: '#8b92a5',
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
