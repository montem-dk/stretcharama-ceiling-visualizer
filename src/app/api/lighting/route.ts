// app/api/lighting/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("styles")
      .select("lighting");

    if (error) {
      console.error("Error fetching lighting options:", error);
      return NextResponse.json(
        { error: "Failed to fetch lighting options" },
        { status: 500 }
      );
    }

    const lightingOptions = Array.from(
      new Set((data ?? []).map((row) => row.lighting))
    ).sort();

    return NextResponse.json(lightingOptions);
  } catch (err) {
    console.error("Unexpected error in /api/lighting:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
