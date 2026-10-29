import "server-only";

// One email through Resend when a client first submits. Never throws: a failed email is logged
// and the response stays submitted. Plain fetch, no extra package.
export async function sendFinishedEmail(clientName: string, slug: string, adminUrl: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) {
    console.error(`[intake] email not sent for ${slug}: RESEND_API_KEY or NOTIFY_EMAIL is not set`);
    return false;
  }
  const base = process.env.RESEND_API_URL || "https://api.resend.com";
  console.log(`[intake] email attempt for ${slug}`);
  try {
    const res = await fetch(`${base}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [to],
        subject: `${clientName} finished their intake`,
        text: `${clientName} finished their intake.\n${adminUrl}`,
      }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error(`[intake] email failed for ${slug}: HTTP ${res.status} ${detail}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[intake] email failed for ${slug}: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
