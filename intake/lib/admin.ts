import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { memoryStoreEnabled } from "./store";

// The only person who gets into /admin. Comparison is case insensitive and exact.
export function isAdminEmail(email: string | null | undefined): boolean {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!admin || !email) return false;
  return email.trim().toLowerCase() === admin;
}

// Supabase Auth client bound to the request cookies (magic link sessions live there).
export async function supabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase env vars are not set");
  const jar = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) jar.set(name, value, options);
        } catch {
          // Called from a server component, where cookies are read only. Safe to ignore.
        }
      },
    },
  });
}

export const DEV_ADMIN_COOKIE = "dev_admin_email";

// Who is signed in, or null. The cookie shortcut exists only for local tests with the in-memory
// store and is switched off in production builds.
export async function getSessionEmail(): Promise<string | null> {
  if (memoryStoreEnabled()) {
    return (await cookies()).get(DEV_ADMIN_COOKIE)?.value ?? null;
  }
  const supabase = await supabaseAuthClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}
