import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// CORS headers pro mobilní aplikaci
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS handler pro CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { token, platform = 'android' } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert token - pokud už existuje, aktualizuje last_used_at
    const { data, error } = await supabase
      .from("device_tokens")
      .upsert(
        {
          token,
          platform,
          updated_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        },
        {
          onConflict: "token",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error registering device token:", error);
      return NextResponse.json(
        { error: "Failed to register device token" },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, data }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error in register endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
