"use client";

import { useState } from "react";
import type { Answer, Answers, IntakeConfig, Question } from "@/lib/types";
import { formatAnswer } from "@/lib/format";

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

type Props = {
  config: IntakeConfig;
  initialAnswers?: Answers;
  initialStep?: number;
  onSubmit?: () => Promise<void>;
};

// step: -1 intro, 0..n-1 questions, n review
export default function IntakeForm({ config, initialAnswers = {}, initialStep = -1, onSubmit }: Props) {
  const { questions } = config;
  const n = questions.length;
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(Math.max(-1, Math.min(initialStep, n)));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const goTo = (s: number) => {
    setStep(s);
    window.scrollTo(0, 0);
  };
  const next = () => goTo(Math.min(step + 1, n));
  const back = () => goTo(step > 0 ? step - 1 : -1);

  const update = (id: string, patch: Answer) =>
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onSubmit?.();
      setDone(true);
      window.scrollTo(0, 0);
    } catch {
      setError("That didn't go through. Check your signal and tap Submit again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="app">
        <main>
          <h1>Done. George has your answers.</h1>
        </main>
      </div>
    );
  }

  const pct = step < 0 ? 0 : step >= n ? 100 : Math.round((step / n) * 100);
  const count = step < 0 ? "Start" : step >= n ? "Review" : `${step + 1} of ${n}`;

  let body: React.ReactNode;
  let nextLabel: string;
  let onNext = next;

  if (step < 0) {
    body = (
      <>
        <div className="section">{config.intro.section}</div>
        <h1>{config.intro.heading}</h1>
        <p className="hint">{config.intro.hint}</p>
        <p className="mic">
          <MicIcon />
          <span>{config.intro.tip}</span>
        </p>
      </>
    );
    nextLabel = Object.keys(answers).length ? "Pick up where I left off" : "Let's go";
  } else if (step >= n) {
    body = (
      <>
        <div className="section">Last step</div>
        <h1>Review your answers.</h1>
        <p className="hint">Tap any answer to change it. When it looks right, hit Submit.</p>
        <div className="review">
          <ol>
            {questions.map((q, k) => {
              const text = formatAnswer(answers[q.id]);
              return (
                <li key={q.id}>
                  <button type="button" onClick={() => goTo(k)}>
                    <span className="rq">
                      {k + 1}. {q.question}
                    </span>
                    <span className={text === "(skipped)" ? "ra skipped" : "ra"}>{text}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="status" role="status">
            {error}
          </p>
        </div>
      </>
    );
    nextLabel = submitting ? "Sending..." : "Submit";
    onNext = submit;
  } else {
    const q = questions[step];
    body = (
      <QuestionScreen
        key={q.id}
        q={q}
        answer={answers[q.id] ?? {}}
        onChange={(patch) => update(q.id, patch)}
        onAdvance={next}
      />
    );
    nextLabel = step === n - 1 ? "Review my answers" : "Next";
  }

  return (
    <div className="app">
      <header>
        <div className="ticket">
          <b>{config.title}</b>
          <span>{count}</span>
        </div>
        <div className="bar" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </div>
      </header>
      <main aria-live="polite">{body}</main>
      <footer>
        {step >= 0 && (
          <button className="btn" type="button" onClick={back}>
            Back
          </button>
        )}
        <button className="btn primary" type="button" onClick={onNext} disabled={submitting}>
          {nextLabel}
        </button>
      </footer>
      <div className="brand">Chicolo CoLab</div>
    </div>
  );
}

function QuestionScreen({
  q,
  answer,
  onChange,
  onAdvance,
}: {
  q: Question;
  answer: Answer;
  onChange: (patch: Answer) => void;
  onAdvance: () => void;
}) {
  const chosen = answer.c ?? [];

  const toggle = (o: string) => {
    let c: string[];
    if (q.type === "single") c = chosen.includes(o) ? [] : [o];
    else c = chosen.includes(o) ? chosen.filter((x) => x !== o) : [...chosen, o];
    onChange({ c });
    if (q.type === "single" && !q.note && c.length) setTimeout(onAdvance, 180);
  };

  return (
    <>
      <div className="section">{q.section}</div>
      <h1>{q.question}</h1>
      {q.hint && <p className="hint">{q.hint}</p>}
      {q.type === "text" || q.type === "long" ? (
        <>
          <textarea
            id={`a-${q.id}`}
            aria-label={q.question}
            className={q.type === "long" ? "long" : undefined}
            value={answer.v ?? ""}
            onChange={(e) => onChange({ v: e.target.value })}
          />
          <p className="mic">
            <MicIcon />
            <span>Tap the mic on your keyboard to talk instead.</span>
          </p>
        </>
      ) : (
        <>
          <div className="chips" role="group" aria-label={q.question}>
            {q.options?.map((o) => (
              <button
                key={o}
                type="button"
                className="chip"
                aria-pressed={chosen.includes(o)}
                onClick={() => toggle(o)}
              >
                {o}
              </button>
            ))}
          </div>
          {q.note && (
            <input
              type="text"
              id={`n-${q.id}`}
              placeholder={q.note}
              aria-label={q.note}
              value={answer.n ?? ""}
              onChange={(e) => onChange({ n: e.target.value })}
            />
          )}
        </>
      )}
      <button type="button" className="skip" onClick={onAdvance}>
        Skip this one
      </button>
    </>
  );
}
