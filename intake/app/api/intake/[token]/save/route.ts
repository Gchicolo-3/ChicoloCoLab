import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getConfig } from "@/lib/configs";
import { parseSaveBody, readLimitedJson } from "@/lib/validate";

export const dynamic = "force-dynamic";

// Saves one answer and the current step. Rejects bodies over 50 KB and any save after submit.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const store = getStore();
  const client = await store.getClientByToken(token);
  const config = client && getConfig(client.configKey);
  if (!client || !config) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw = await readLimitedJson(req);
  if (raw === "too_large") return NextResponse.json({ error: "Too large" }, { status: 413 });
  if (raw === "bad_json") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const body = parseSaveBody(raw, config);
  if (typeof body === "string") return NextResponse.json({ error: body }, { status: 400 });

  const saved = await store.saveAnswer(client.id, body.qid, body.answer, body.step);
  if (!saved) return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
