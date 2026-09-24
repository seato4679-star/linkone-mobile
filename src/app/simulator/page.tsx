import type { Metadata } from "next";
import { Simulator } from "@/components/simulator";
import { PageHeading, Steps } from "@/components/ui";
import { parseSelection } from "@/lib/selection";
export const metadata: Metadata = { title: "料金シミュレーター" };
export default async function SimulatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container section">
      <PageHeading
        label="PLAN SIMULATOR"
        title="あなたにぴったりを、見つけよう。"
      >
        データ容量・通話・オプションを選ぶと、月額料金がその場でわかります。
      </PageHeading>
      <Steps current={1} />
      <Simulator initial={parseSelection(await searchParams)} />
    </div>
  );
}
