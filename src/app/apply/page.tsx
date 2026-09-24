import type { Metadata } from "next";
import { ApplicationForm } from "@/components/application-form";
import { PageHeading, Steps } from "@/components/ui";
import { parseSelection } from "@/lib/selection";
import { isDemoMode } from "@/lib/server/applications";
export const metadata: Metadata = { title: "お申し込み" };
export const dynamic = "force-dynamic";
export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container section">
      <PageHeading label="JOIN LINKONE" title="新しいつながりを、ここから。">
        プランとお客さま情報をご確認のうえ、お申し込みください。
      </PageHeading>
      <Steps current={2} />
      {isDemoMode() && (
        <p className="mode-notice">
          LOCAL DEMO ·
          入力データはこのPCに保存されます。Supabaseには送信しません。
        </p>
      )}
      <ApplicationForm initial={parseSelection(await searchParams)} />
    </div>
  );
}
