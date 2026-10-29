import type { Answer } from "./types";

export function formatAnswer(a: Answer | undefined): string {
  if (!a) return "(skipped)";
  const parts: string[] = [];
  if (a.c && a.c.length) parts.push(a.c.join(", "));
  if (a.n) parts.push(a.n);
  if (a.v && a.v.trim()) parts.push(a.v.trim());
  return parts.length ? parts.join(" / ") : "(skipped)";
}
