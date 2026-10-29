import { cookies } from "next/headers";
import { DEV_ADMIN_COOKIE, supabaseAuthClient } from "@/lib/admin";
import { memoryStoreEnabled } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  if (memoryStoreEnabled()) {
    (await cookies()).delete(DEV_ADMIN_COOKIE);
  } else {
    const supabase = await supabaseAuthClient();
    await supabase.auth.signOut();
  }
  return new Response(null, { status: 303, headers: { Location: "/admin" } });
}
