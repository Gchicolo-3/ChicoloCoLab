import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClientByToken } from "@/lib/clients";
import { getConfig } from "@/lib/configs";
import IntakeForm from "@/components/IntakeForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const client = await getClientByToken((await params).token);
  return { title: client ? `${client.name} BD Intake` : "Intake", robots: { index: false, follow: false } };
}

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const client = await getClientByToken(token);
  const config = client && getConfig(client.configKey);
  if (!client || !config) notFound();
  return <IntakeForm config={config} />;
}
