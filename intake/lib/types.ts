export type QuestionType = "text" | "long" | "single" | "multi";

export type Question = {
  id: string;
  section: string;
  question: string;
  hint?: string;
  type: QuestionType;
  options?: string[];
  note?: string;
};

export type IntakeConfig = {
  key: string;
  title: string;
  intro: { section: string; heading: string; hint: string; tip: string };
  questions: Question[];
};

// v: free text, c: chosen chips, n: note field
export type Answer = { v?: string; c?: string[]; n?: string };
export type Answers = Record<string, Answer>;

export type IntakeClient = { name: string; configKey: string; token: string };
