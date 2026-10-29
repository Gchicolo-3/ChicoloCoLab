import type { IntakeClient } from "./types";

// Step 2 mock. Replaced by a Supabase lookup on the clients table in step 4.
const MOCK_CLIENTS: IntakeClient[] = [
  { name: "Gerardo", configKey: "gerardo", token: "mock-gerardo-token" },
];

export async function getClientByToken(token: string): Promise<IntakeClient | null> {
  return MOCK_CLIENTS.find((c) => c.token === token) ?? null;
}
