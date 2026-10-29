import "server-only";
import type { ReactNode } from "react";
import AdminLogin from "./AdminLogin";
import { getSessionEmail, isAdminEmail } from "@/lib/admin";

export function SignOut() {
  return (
    <form action="/api/admin/logout" method="post">
      <button type="submit" className="btn">
        Sign out
      </button>
    </form>
  );
}

// Runs the check before anything else on the page. Children are only rendered, and so their data
// is only fetched, for ADMIN_EMAIL. Everyone else sees the login form or "Not authorized."
export default async function AdminGate({
  failed,
  children,
}: {
  failed?: boolean;
  children: () => Promise<ReactNode>;
}) {
  const email = await getSessionEmail();
  if (!email) {
    return (
      <>
        <h1>Intake admin</h1>
        <p className="hint">Sign in with the admin email.</p>
        <AdminLogin failed={failed} />
      </>
    );
  }
  if (!isAdminEmail(email)) {
    return (
      <>
        <h1>Not authorized.</h1>
        <SignOut />
      </>
    );
  }
  return <>{await children()}</>;
}
