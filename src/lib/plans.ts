export const plans = [
  {
    id: "light",
    name: "ライト",
    data: 3,
    price: 990,
    description: "Wi-Fi中心のあなたに",
    features: ["メールやメッセージを気軽に", "使いすぎを防ぐシンプルプラン"],
  },
  {
    id: "smart",
    name: "スマート",
    data: 20,
    price: 1980,
    description: "毎日に、ちょうどいい自由を",
    features: ["SNSも動画もバランスよく", "新規申込で3か月間980円"],
  },
  {
    id: "plus",
    name: "プラス",
    data: 50,
    price: 2980,
    description: "好きなことを、もっと自由に",
    features: ["外出先でも動画や音楽を満喫", "テザリングで仕事も快適に"],
  },
] as const;
export type PlanId = (typeof plans)[number]["id"];
export const calls = [
  {
    id: "none",
    name: "通話オプションなし",
    price: 0,
    detail: "国内通話22円 / 30秒",
  },
  {
    id: "five",
    name: "5分かけ放題",
    price: 550,
    detail: "1回5分以内の国内通話",
  },
  {
    id: "unlimited",
    name: "国内通話かけ放題",
    price: 1650,
    detail: "時間を気にせず話したい方に",
  },
] as const;
export type CallId = (typeof calls)[number]["id"];
export const statuses = ["pending", "reviewing", "completed"] as const;
export type Status = (typeof statuses)[number];
export const statusLabels: Record<Status, string> = {
  pending: "確認待ち",
  reviewing: "確認中",
  completed: "完了",
};
export const yen = (value: number) => value.toLocaleString("ja-JP");
export function getPlan(id: string) {
  return plans.find((plan) => plan.id === id);
}
export function estimate(
  planId: PlanId,
  callId: CallId,
  support: boolean,
  campaign: boolean,
) {
  const plan = plans.find((p) => p.id === planId)!;
  const call = calls.find((c) => c.id === callId)!;
  const regular = plan.price + call.price + (support ? 330 : 0);
  const discount = campaign && plan.id === "smart" ? 1000 : 0;
  return {
    regular,
    initial: regular - discount,
    discount,
    call: call.price,
    support: support ? 330 : 0,
  };
}
