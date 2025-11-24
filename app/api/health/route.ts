import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Check if env vars are set
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try a simple query
    const { data, error } = await supabase
      .from("restaurants")
      .select("id")
      .limit(1);

    return NextResponse.json({
      status: "checking",
      env: {
        hasUrl,
        hasKey,
        url: hasUrl ? process.env.NEXT_PUBLIC_SUPABASE_URL : "missing",
      },
      database: {
        connected: !error,
        error: error?.message,
        hasData: !!data && data.length > 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
