import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Answer, Answers, ClientStatus, IntakeClient, IntakeResponse } from "./types";

// All intake data access goes through this interface, server side only.
// Production uses Supabase with the service role key. A throwaway in-memory store exists
// for local development and tests only, and refuses to run in production.
export interface Store {
  getClientByToken(token: string): Promise<IntakeClient | null>;
  getClientBySlug(slug: string): Promise<IntakeClient | null>;
  getResponse(clientId: string): Promise<IntakeResponse | null>;
  // Saves one answer (or just the step when qid is null). Returns false if already submitted.
  saveAnswer(clientId: string, qid: string | null, answer: Answer | null, step: number): Promise<boolean>;
  // Sets submitted_at once. firstSubmit is true only for the call that actually set it.
  submit(clientId: string, step: number): Promise<{ firstSubmit: boolean }>;
  markNotified(clientId: string): Promise<void>;
  listClients(): Promise<ClientStatus[]>;
}

type ClientRow = { id: string; slug: string; name: string; config_key: string; token: string; created_at: string };
type ResponseRow = {
  client_id: string;
  answers: Answers;
  current_step: number;
  started_at: string;
  updated_at: string;
  submitted_at: string | null;
  notified_at: string | null;
};

const toClient = (r: ClientRow): IntakeClient => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  configKey: r.config_key,
  token: r.token,
});

const toResponse = (r: ResponseRow): IntakeResponse => ({
  answers: r.answers ?? {},
  currentStep: r.current_step,
  startedAt: r.started_at,
  updatedAt: r.updated_at,
  submittedAt: r.submitted_at,
  notifiedAt: r.notified_at,
});

function supabaseStore(): Store {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars are not set");
  const db: SupabaseClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const oneClient = async (col: "token" | "slug", value: string) => {
    const { data, error } = await db.from("intake_clients").select("*").eq(col, value).maybeSingle();
    if (error) throw new Error(`clients lookup failed: ${error.message}`);
    return data ? toClient(data as ClientRow) : null;
  };

  return {
    getClientByToken: (token) => oneClient("token", token),
    getClientBySlug: (slug) => oneClient("slug", slug),

    async getResponse(clientId) {
      const { data, error } = await db.from("intake_responses").select("*").eq("client_id", clientId).maybeSingle();
      if (error) throw new Error(`response lookup failed: ${error.message}`);
      return data ? toResponse(data as ResponseRow) : null;
    },

    async saveAnswer(clientId, qid, answer, step) {
      const { data, error } = await db.rpc("intake_save_answer", {
        p_client_id: clientId,
        p_qid: qid,
        p_answer: answer,
        p_step: step,
      });
      if (error) throw new Error(`save failed: ${error.message}`);
      return data === true;
    },

    async submit(clientId, step) {
      // Make sure a row exists (a client who submits without saving anything), then flip submitted_at once.
      const { error: e1 } = await db.rpc("intake_save_answer", {
        p_client_id: clientId,
        p_qid: null,
        p_answer: null,
        p_step: step,
      });
      if (e1) throw new Error(`submit failed: ${e1.message}`);
      const { data, error } = await db
        .from("intake_responses")
        .update({ submitted_at: new Date().toISOString() })
        .eq("client_id", clientId)
        .is("submitted_at", null)
        .select("id");
      if (error) throw new Error(`submit failed: ${error.message}`);
      return { firstSubmit: (data?.length ?? 0) > 0 };
    },

    async markNotified(clientId) {
      const { error } = await db
        .from("intake_responses")
        .update({ notified_at: new Date().toISOString() })
        .eq("client_id", clientId)
        .is("notified_at", null);
      if (error) throw new Error(`markNotified failed: ${error.message}`);
    },

    async listClients() {
      const [c, r] = await Promise.all([
        db.from("intake_clients").select("*").order("created_at", { ascending: true }),
        db.from("intake_responses").select("*"),
      ]);
      if (c.error) throw new Error(`clients list failed: ${c.error.message}`);
      if (r.error) throw new Error(`responses list failed: ${r.error.message}`);
      const byClient = new Map((r.data as ResponseRow[]).map((x) => [x.client_id, toResponse(x)]));
      return (c.data as ClientRow[]).map((row) => ({ client: toClient(row), response: byClient.get(row.id) ?? null }));
    },
  };
}

// ---------- in-memory store: development and tests only ----------

type MemState = { clients: IntakeClient[]; responses: Map<string, IntakeResponse> };

function memoryStore(): Store {
  const g = globalThis as unknown as { __intakeMem?: MemState };
  g.__intakeMem ??= {
    clients: [{ id: "c-gerardo", slug: "gerardo", name: "Gerardo", configKey: "gerardo", token: "dev-gerardo-token-0001" }],
    responses: new Map(),
  };
  const s = g.__intakeMem;
  const now = () => new Date().toISOString();
  const ensure = (clientId: string, step: number): IntakeResponse => {
    let r = s.responses.get(clientId);
    if (!r) {
      r = { answers: {}, currentStep: step, startedAt: now(), updatedAt: now(), submittedAt: null, notifiedAt: null };
      s.responses.set(clientId, r);
    }
    return r;
  };
  return {
    async getClientByToken(token) {
      return s.clients.find((c) => c.token === token) ?? null;
    },
    async getClientBySlug(slug) {
      return s.clients.find((c) => c.slug === slug) ?? null;
    },
    async getResponse(clientId) {
      const r = s.responses.get(clientId);
      return r ? structuredClone(r) : null;
    },
    async saveAnswer(clientId, qid, answer, step) {
      const r = ensure(clientId, step);
      if (r.submittedAt) return false;
      if (qid && answer) r.answers = { ...r.answers, [qid]: answer };
      r.currentStep = step;
      r.updatedAt = now();
      return true;
    },
    async submit(clientId, step) {
      const r = ensure(clientId, step);
      if (r.submittedAt) return { firstSubmit: false };
      r.submittedAt = now();
      return { firstSubmit: true };
    },
    async markNotified(clientId) {
      const r = s.responses.get(clientId);
      if (r && !r.notifiedAt) r.notifiedAt = now();
    },
    async listClients() {
      return s.clients.map((client) => ({ client, response: s.responses.get(client.id) ?? null }));
    },
  };
}

export function memoryStoreEnabled(): boolean {
  return process.env.INTAKE_STORE === "memory" && process.env.NODE_ENV !== "production";
}

let cached: Store | null = null;
export function getStore(): Store {
  if (memoryStoreEnabled()) return memoryStore();
  cached ??= supabaseStore();
  return cached;
}
