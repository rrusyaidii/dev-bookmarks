/** Single-user allowlist from ALLOWED_EMAIL (comma-separated ok). Empty = no extra lock. */
export function isAllowedEmail(email: string | null | undefined): boolean {
  const raw = process.env.ALLOWED_EMAIL?.trim();
  if (!raw) return true;
  if (!email) return false;
  const allowed = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
