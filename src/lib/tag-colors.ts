const COLORS: Record<string, string> = {
  react: '#61dafb',
  nextjs: '#ffffff',
  typescript: '#3178c6',
  css: '#1572b6',
  tailwind: '#06b6d4',
  node: '#339933',
  docker: '#2496ed',
  python: '#3776ab',
  database: '#336791',
  ai: '#a855f7',
  devops: '#ff6347',
  testing: '#e11d48',
  design: '#ec4899',
  performance: '#10b981',
  security: '#f59e0b',
  javascript: '#f7df1e',
  api: '#22d3ee',
  frontend: '#38bdf8',
  backend: '#a3e635',
  tooling: '#94a3b8',
};

export function getTagColor(tag: string): string {
  return COLORS[tag.toLowerCase()] || '#8b8fa3';
}
