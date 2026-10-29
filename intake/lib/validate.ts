import type { Answer, IntakeConfig } from "./types";

export const MAX_BODY_BYTES = 50 * 1024;

export type SaveBody = { qid: string | null; answer: Answer | null; step: number };

const isStr = (v: unknown): v is string => typeof v === "string";

// Returns a clean SaveBody or an error string. Only known question ids are accepted.
export function parseSaveBody(raw: unknown, config: IntakeConfig): SaveBody | string {
  if (!raw || typeof raw !== "object") return "Bad request";
  const b = raw as Record<string, unknown>;
  const n = config.questions.length;
  if (typeof b.step !== "number" || !Number.isInteger(b.step) || b.step < -1 || b.step > n) return "Bad step";

  if (b.qid === undefined || b.qid === null) return { qid: null, answer: null, step: b.step };
  if (!isStr(b.qid) || !config.questions.some((q) => q.id === b.qid)) return "Unknown question";
  if (!b.answer || typeof b.answer !== "object" || Array.isArray(b.answer)) return "Bad answer";

  const a = b.answer as Record<string, unknown>;
  const clean: Answer = {};
  if (a.v !== undefined) {
    if (!isStr(a.v)) return "Bad answer";
    clean.v = a.v;
  }
  if (a.n !== undefined) {
    if (!isStr(a.n)) return "Bad answer";
    clean.n = a.n;
  }
  if (a.c !== undefined) {
    if (!Array.isArray(a.c) || !a.c.every(isStr)) return "Bad answer";
    clean.c = a.c;
  }
  return { qid: b.qid, answer: clean, step: b.step };
}

// Reads the request body as text and rejects anything over 50 KB, even when Content-Length lies.
export async function readLimitedJson(req: Request): Promise<unknown | "too_large" | "bad_json"> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return "too_large";
  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return "too_large";
  try {
    return JSON.parse(text);
  } catch {
    return "bad_json";
  }
}

export function siteOrigin(req: Request): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
