// app/api/finishes/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("styles")
      .select("finish");

    if (error) {
      console.error("Error fetching finishes:", error);
      return NextResponse.json(
        { error: "Failed to fetch finishes" },
        { status: 500 }
      );
    }

    const finishes = Array.from(
      new Set((data ?? []).map((row) => row.finish))
    ).sort();

    return NextResponse.json(finishes);
  } catch (err) {
    console.error("Unexpected error in /api/finishes:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
