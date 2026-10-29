import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getConfig } from "@/lib/configs";

export const dynamic = "force-dynamic";

// Returns the client's config plus any saved answers, current step, and submitted flag.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const store = getStore();
  const client = await store.getClientByToken(token);
  const config = client && getConfig(client.configKey);
  if (!client || !config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const response = await store.getResponse(client.id);
  return NextResponse.json(
    {
      name: client.name,
      config,
      answers: response?.answers ?? {},
      step: response?.currentStep ?? -1,
      submitted: Boolean(response?.submittedAt),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
