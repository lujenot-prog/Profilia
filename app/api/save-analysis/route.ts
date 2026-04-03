import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    console.log("SAVE_ANALYSIS auth user:", user?.id, user?.email);
    console.log("SAVE_ANALYSIS auth error:", authError);

    if (authError) {
      return NextResponse.json(
        { error: `Auth error: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: no active user session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("SAVE_ANALYSIS payload title:", body?.title);

    const payload = {
      user_id: user.id,
      title: body.title,
      summary: body.summary,
      confidence: body.confidence,
      raw_text: body.rawText ?? "",
      result_json: body.result
    };

    console.log("SAVE_ANALYSIS insert payload:", {
      user_id: payload.user_id,
      title: payload.title,
      confidence: payload.confidence
    });

    const { error, data } = await supabase
      .from("analyses")
      .insert(payload)
      .select("id")
      .single();

    console.log("SAVE_ANALYSIS insert data:", data);
    console.log("SAVE_ANALYSIS insert error:", error);

    if (error) {
      return NextResponse.json(
        { error: `Insert error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    console.error("SAVE_ANALYSIS unexpected error:", error);
    return NextResponse.json(
      { error: "Save failed" },
      { status: 500 }
    );
  }
}