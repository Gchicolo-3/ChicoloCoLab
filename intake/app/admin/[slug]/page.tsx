import Link from "next/link";
import { notFound } from "next/navigation";
import AdminGate, { SignOut } from "@/components/AdminGate";
import CopyAnswers from "@/components/CopyAnswers";
import { getStore } from "@/lib/store";
import { getConfig } from "@/lib/configs";
import { describeStatus, formatAnswer } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <AdminGate>
      {async () => {
        const store = getStore();
        const client = await store.getClientBySlug(slug);
        const config = client && getConfig(client.configKey);
        if (!client || !config) notFound();
        const response = await store.getResponse(client.id);
        const status = describeStatus(response, config.questions.length);
        const answers = response?.answers ?? {};

        const lines = [`${client.name}, ${config.title}`, `Status: ${status.label}`, ""];
        config.questions.forEach((q, i) => {
          lines.push(`${i + 1}. ${q.question}`);
          lines.push(formatAnswer(answers[q.id]));
          lines.push("");
        });
        const plain = lines.join("\n").trimEnd() + "\n";

        return (
          <>
            <div className="admin-head">
              <Link href="/admin" className="admin-back">
                All clients
              </Link>
              <SignOut />
            </div>
            <h1>{client.name}</h1>
            <p className={`admin-status ${status.kind}`}>{status.label}</p>
            <CopyAnswers text={plain} />
            <ol className="admin-answers">
              {config.questions.map((q, i) => {
                const text = formatAnswer(answers[q.id]);
                const skipped = text === "(skipped)";
                return (
                  <li key={q.id}>
                    <span className="rq">
                      {i + 1}. {q.question}
                    </span>
                    <span className={skipped ? "ra skipped" : "ra"}>{skipped ? "Skipped" : text}</span>
                  </li>
                );
              })}
            </ol>
          </>
        );
      }}
    </AdminGate>
  );
}
