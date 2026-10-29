import { NextResponse } from "next/server";
import { supabaseAuthClient } from "@/lib/admin";
import { siteOrigin } from "@/lib/validate";

export const dynamic = "force-dynamic";

// Magic link landing. Swaps the one time code for a session cookie, then goes to /admin.
// /admin itself decides whether the signed in email is allowed.
export async function GET(req: Request) {
  const origin = siteOrigin(req);
  const code = new URL(req.url).searchParams.get("code");
  if (code) {
    const supabase = await supabaseAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin`);
    console.error(`[intake] auth code exchange failed: ${error.message}`);
  }
  return NextResponse.redirect(`${origin}/admin?login=failed`);
}
