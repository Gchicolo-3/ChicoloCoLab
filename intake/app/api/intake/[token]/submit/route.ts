import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getConfig } from "@/lib/configs";
import { sendFinishedEmail } from "@/lib/notify";
import { siteOrigin } from "@/lib/validate";

export const dynamic = "force-dynamic";

// Sets submitted_at once. Only the call that actually sets it sends the email, so a second
// submit (double tap, retry) never sends another one. A failed email is logged, never fatal.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const store = getStore();
  const client = await store.getClientByToken(token);
  const config = client && getConfig(client.configKey);
  if (!client || !config) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { firstSubmit } = await store.submit(client.id, config.questions.length);

  if (firstSubmit) {
    const adminUrl = `${siteOrigin(req)}/admin/${client.slug}`;
    const sent = await sendFinishedEmail(client.name, client.slug, adminUrl);
    if (sent) {
      try {
        await store.markNotified(client.id);
      } catch (err) {
        console.error(`[intake] could not record notified_at for ${client.slug}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
  return NextResponse.json({ ok: true, alreadySubmitted: !firstSubmit });
}
