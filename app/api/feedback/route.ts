import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { analysisId, satisfactionScore, mostAccurate, leastAccurate, wouldRecommend } = body;

    const { error } = await supabase.from("user_feedback").insert({
      analysis_id: analysisId,
      satisfaction_score: satisfactionScore,
      most_accurate: mostAccurate,
      least_accurate: leastAccurate,
      would_recommend: wouldRecommend,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}