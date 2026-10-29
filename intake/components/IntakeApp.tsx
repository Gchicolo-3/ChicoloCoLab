"use client";

import { useCallback, useEffect, useRef } from "react";
import IntakeForm from "./IntakeForm";
import type { Answer, Answers, IntakeConfig } from "@/lib/types";

type Props = {
  token: string;
  config: IntakeConfig;
  initialAnswers: Answers;
  initialStep: number;
  initialSubmitted: boolean;
};

const DEBOUNCE_MS = 700;
const RETRY_MS = 5000;

// Wires the form to the server.
// - Typing is debounced: one request per pause, not one per keystroke.
// - Every step change saves right away.
// - Closing or hiding the tab sends everything the server has not confirmed yet, immediately and
//   in parallel, because the page may be gone before a queued save gets its turn.
// - Every request carries the newest answer and step as of the moment it is sent, so a delayed or
//   reordered request can never overwrite newer data with an older value.
export default function IntakeApp({ token, config, initialAnswers, initialStep, initialSubmitted }: Props) {
  const latest = useRef<Record<string, Answer>>({}); // newest local value per question, this session
  const confirmed = useRef<Record<string, Answer>>({}); // the exact value the server last acknowledged
  const stepRef = useRef(initialStep);
  const confirmedStep = useRef(initialStep);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const locked = useRef(initialSubmitted);

  const sendAnswer = useCallback(
    async (qid: string) => {
      const answer = latest.current[qid];
      if (!answer || confirmed.current[qid] === answer) return;
      const step = stepRef.current;
      const res = await fetch(`/api/intake/${token}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qid, answer, step }),
        keepalive: true,
      });
      if (res.status === 409) {
        locked.current = true;
        return;
      }
      if (!res.ok) throw new Error(`save ${res.status}`);
      confirmed.current[qid] = answer;
      confirmedStep.current = step;
    },
    [token],
  );

  const sendStep = useCallback(async () => {
    const step = stepRef.current;
    if (step === confirmedStep.current) return;
    const res = await fetch(`/api/intake/${token}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step }),
      keepalive: true,
    });
    if (res.status === 409) {
      locked.current = true;
      return;
    }
    if (!res.ok) throw new Error(`save ${res.status}`);
    confirmedStep.current = step;
  }, [token]);

  const unsaved = useCallback(
    () => Object.keys(latest.current).filter((qid) => confirmed.current[qid] !== latest.current[qid]),
    [],
  );

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const flush = useCallback(
    (urgent = false): Promise<void> => {
      clearTimer();
      if (locked.current) return chain.current;

      const run = async () => {
        try {
          const ids = unsaved();
          if (urgent) {
            await Promise.all([...ids.map((id) => sendAnswer(id)), ...(ids.length ? [] : [sendStep()])]);
          } else {
            for (const id of ids) await sendAnswer(id);
            if (!ids.length) await sendStep();
          }
        } catch {
          // Leave it unconfirmed and try again shortly.
          if (!timer.current) timer.current = setTimeout(() => void flush(), RETRY_MS);
        }
      };

      if (urgent) {
        void run();
        return Promise.resolve();
      }
      chain.current = chain.current.then(run);
      return chain.current;
    },
    [sendAnswer, sendStep, unsaved],
  );

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush(true);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [flush]);

  const onAnswerChange = useCallback(
    (qid: string, answer: Answer, step: number) => {
      latest.current[qid] = answer;
      stepRef.current = step;
      clearTimer();
      timer.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    },
    [flush],
  );

  const onStepChange = useCallback(
    (step: number) => {
      stepRef.current = step;
      void flush();
    },
    [flush],
  );

  const onSubmit = useCallback(async () => {
    await flush();
    if (unsaved().length > 0) throw new Error("answers not saved yet");
    const res = await fetch(`/api/intake/${token}/submit`, { method: "POST" });
    if (!res.ok) throw new Error(`submit ${res.status}`);
    locked.current = true;
  }, [flush, token, unsaved]);

  return (
    <IntakeForm
      config={config}
      initialAnswers={initialAnswers}
      initialStep={initialStep}
      initialDone={initialSubmitted}
      onAnswerChange={onAnswerChange}
      onStepChange={onStepChange}
      onSubmit={onSubmit}
    />
  );
}
