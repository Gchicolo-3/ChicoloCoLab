"use client";

import { useState } from "react";

export default function CopyAnswers({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      // Older browsers or blocked clipboard: fall back to a temporary textarea.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        setState(ok ? "copied" : "failed");
      } catch {
        setState("failed");
      }
    }
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <button type="button" className="btn primary" onClick={copy}>
      {state === "copied" ? "Copied" : state === "failed" ? "Could not copy" : "Copy all answers"}
    </button>
  );
}
