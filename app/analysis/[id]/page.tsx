import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResultsClient } from "@/components/results-client";

export default async function AnalysisDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!analysis) {
    redirect("/dashboard");
  }

  const hydratedResult = {
    ...(analysis.result_json ?? {}),
    id: analysis.id,
    title: analysis.title,
    summary: analysis.summary,
    confidence: analysis.confidence
  };

  return (
    <ResultsClient
      initialResult={hydratedResult}
      analysisId={analysis.id}
    />
  );
}