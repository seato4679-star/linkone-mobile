import { calls, getPlan } from "./plans";
import type { Selection } from "@/components/plan-options";
export function parseSelection(
  params: Record<string, string | string[] | undefined>,
): Selection {
  const plan =
    typeof params.plan === "string"
      ? (getPlan(params.plan)?.id ?? "smart")
      : "smart";
  const call = calls.find((call) => call.id === params.call)?.id ?? "none";
  return {
    plan,
    call,
    support: params.support === "1",
    campaign: plan === "smart" && params.campaign !== "0",
  };
}
