"use client";

import { useState } from "react";

export default function AdminLogin({ failed }: { failed?: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(failed ? "That link did not work. Request a new one." : "");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; dev?: boolean };
      if (res.ok) {
        if (data.dev) window.location.reload();
        else setMsg("Check your email for the login link.");
      } else {
        setMsg(data.error ?? "Something went wrong.");
      }
    } catch {
      setMsg("Check your signal and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-login" onSubmit={send}>
      <label htmlFor="admin-email">Email</label>
      <input
        id="admin-email"
        type="text"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn primary" type="submit" disabled={busy || !email.trim()}>
        {busy ? "Sending..." : "Send me a login link"}
      </button>
      <p className="status" role="status">
        {msg}
      </p>
    </form>
  );
}
