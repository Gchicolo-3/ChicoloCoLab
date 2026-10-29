import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStore } from "@/lib/store";
import { getConfig } from "@/lib/configs";
import IntakeApp from "@/components/IntakeApp";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const client = await getStore().getClientByToken((await params).token);
  return { title: client ? `${client.name} BD Intake` : "Intake", robots: { index: false, follow: false } };
}

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const store = getStore();
  const client = await store.getClientByToken(token);
  const config = client && getConfig(client.configKey);
  if (!client || !config) notFound();
  const response = await store.getResponse(client.id);
  return (
    <IntakeApp
      token={token}
      config={config}
      initialAnswers={response?.answers ?? {}}
      initialStep={response?.currentStep ?? -1}
      initialSubmitted={Boolean(response?.submittedAt)}
    />
  );
}
