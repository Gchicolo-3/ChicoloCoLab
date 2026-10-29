import Link from "next/link";
import AdminGate, { SignOut } from "@/components/AdminGate";
import { getStore } from "@/lib/store";
import { getConfig } from "@/lib/configs";
import { describeStatus } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ login?: string }> }) {
  const { login } = await searchParams;
  return (
    <AdminGate failed={login === "failed"}>
      {async () => {
        const rows = await getStore().listClients();
        return (
          <>
            <div className="admin-head">
              <h1>Intake responses</h1>
              <SignOut />
            </div>
            {rows.length === 0 ? (
              <p className="hint">No clients yet.</p>
            ) : (
              <ul className="admin-list">
                {rows.map(({ client, response }) => {
                  const total = getConfig(client.configKey)?.questions.length ?? 0;
                  const status = describeStatus(response, total);
                  return (
                    <li key={client.id}>
                      <Link href={`/admin/${client.slug}`}>
                        <span className="admin-name">{client.name}</span>
                        <span className={`admin-status ${status.kind}`}>{status.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        );
      }}
    </AdminGate>
  );
}
