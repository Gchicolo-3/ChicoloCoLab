import gerardo from "@/configs/gerardo.json";
import type { IntakeConfig } from "./types";

const CONFIGS: Record<string, IntakeConfig> = {
  gerardo: gerardo as IntakeConfig,
};

export function getConfig(key: string): IntakeConfig | null {
  return CONFIGS[key] ?? null;
}
