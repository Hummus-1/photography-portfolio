import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Optional security: if CRON_SECRET is set in environment, verify the bearer token
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startTime = Date.now();

    // Query 1 row from albums to generate real activity on Supabase
    const { data, error } = await supabase
      .from("albums")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[keep-alive] Supabase query failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const durationMs = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive ping successful. Inactivity timer reset.",
      recordsFound: data?.length ?? 0,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[keep-alive] Unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
