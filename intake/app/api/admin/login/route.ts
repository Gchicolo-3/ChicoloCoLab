import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEV_ADMIN_COOKIE, isAdminEmail, supabaseAuthClient } from "@/lib/admin";
import { memoryStoreEnabled } from "@/lib/store";
import { readLimitedJson, siteOrigin } from "@/lib/validate";

export const dynamic = "force-dynamic";

// Sends a magic link, but only to ADMIN_EMAIL. Any other address is refused before Supabase is
// called, so nobody else can create a user or trigger an email through this form.
export async function POST(req: Request) {
  const raw = await readLimitedJson(req);
  const email = raw && typeof raw === "object" && typeof (raw as { email?: unknown }).email === "string"
    ? (raw as { email: string }).email.trim()
    : "";
  if (!isAdminEmail(email)) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  if (memoryStoreEnabled()) {
    (await cookies()).set(DEV_ADMIN_COOKIE, email, { httpOnly: true, path: "/" });
    return NextResponse.json({ ok: true, dev: true });
  }

  const supabase = await supabaseAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteOrigin(req)}/auth/callback`, shouldCreateUser: true },
  });
  if (error) {
    console.error(`[intake] admin magic link failed: ${error.message}`);
    return NextResponse.json({ error: "Could not send the link. Try again in a minute." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
