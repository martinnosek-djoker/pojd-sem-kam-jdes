import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Check if columns already exist
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from("events")
      .select("start_date, end_date")
      .limit(1);

    if (!checkError) {
      return NextResponse.json({
        message: "Migration already applied - columns exist",
        alreadyApplied: true,
      });
    }

    // Execute migration SQL
    const migrationSQL = `
      ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

      CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
      CREATE INDEX IF NOT EXISTS idx_events_end_date ON public.events(end_date);

      CREATE INDEX IF NOT EXISTS idx_events_date_range ON public.events(start_date, end_date)
      WHERE start_date IS NOT NULL AND end_date IS NOT NULL;
    `;

    // Use rpc to execute raw SQL (requires a postgres function)
    // Since we can't execute raw SQL directly, we'll use a different approach
    // Let's use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql: migrationSQL }),
    });

    if (!response.ok) {
      // If exec_sql doesn't exist, we need to create it first
      // For now, return instructions to run manually
      return NextResponse.json({
        error: "Cannot execute SQL directly via API",
        message: "Please run the migration manually in Supabase Dashboard SQL Editor",
        sql: migrationSQL,
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "Migration completed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : String(error),
        message: "Please run the migration manually in Supabase Dashboard SQL Editor"
      },
      { status: 500 }
    );
  }
}
