// app/api/styles/filter/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const color = searchParams.get("color");
    const finish = searchParams.get("finish");
    const lighting = searchParams.get("lighting");

    // Helper to run a query with optional filters
    const runQuery = async (opts: {
      useColor?: boolean;
      useFinish?: boolean;
      useLighting?: boolean;
    }) => {
      let query = supabaseServer.from("styles").select(
        `
          id,
          styleId:style_id,
          name,
          description,
          longDescription:long_description,
          color,
          finish,
          lighting,
          previewImageUrl:preview_image_url,
          finalImageUrl:final_image_url
        `
      );

      if (opts.useColor && color) query = query.eq("color", color);
      if (opts.useFinish && finish) query = query.eq("finish", finish);
      if (opts.useLighting && lighting) query = query.eq("lighting", lighting);

      const { data, error } = await query.order("id", { ascending: true });

      if (error) {
        console.error("Error fetching styles with filters:", opts, error);
        throw error;
      }

      return data ?? [];
    };

    let styles: any[] = [];

    // 1️⃣ Try all three filters (color + finish + lighting)
    if (color && finish && lighting) {
      styles = await runQuery({
        useColor: true,
        useFinish: true,
        useLighting: true,
      });
    }

    // 2️⃣ If nothing found, try color + finish
    if ((!styles || styles.length === 0) && color && finish) {
      styles = await runQuery({
        useColor: true,
        useFinish: true,
        useLighting: false,
      });
    }

    // 3️⃣ If still nothing, try just color
    if ((!styles || styles.length === 0) && color) {
      styles = await runQuery({
        useColor: true,
        useFinish: false,
        useLighting: false,
      });
    }

    // 4️⃣ Hard fallback: if still nothing, return ALL styles
    if (!styles || styles.length === 0) {
      styles = await runQuery({
        useColor: false,
        useFinish: false,
        useLighting: false,
      });
    }

    return NextResponse.json(styles);
  } catch (err) {
    console.error("Unexpected error in /api/styles/filter:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
