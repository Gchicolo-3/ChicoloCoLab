import type { Answer } from "./types";

export function formatAnswer(a: Answer | undefined): string {
  if (!a) return "(skipped)";
  const parts: string[] = [];
  if (a.c && a.c.length) parts.push(a.c.join(", "));
  if (a.n) parts.push(a.n);
  if (a.v && a.v.trim()) parts.push(a.v.trim());
  return parts.length ? parts.join(" / ") : "(skipped)";
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export type StatusKind = "not_started" | "in_progress" | "submitted";

// Not started, in progress with the step number, or submitted with the date.
export function describeStatus(
  r: { currentStep: number; submittedAt: string | null } | null,
  total: number,
): { kind: StatusKind; label: string } {
  if (!r) return { kind: "not_started", label: "Not started" };
  if (r.submittedAt) return { kind: "submitted", label: `Submitted ${formatDate(r.submittedAt)}` };
  if (r.currentStep < 0) return { kind: "not_started", label: "Not started" };
  if (r.currentStep >= total) return { kind: "in_progress", label: `In progress, at the review screen` };
  return { kind: "in_progress", label: `In progress, step ${r.currentStep + 1} of ${total}` };
}
