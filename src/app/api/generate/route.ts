// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { supabaseServer, SUPABASE_BUCKET } from "@/lib/supabase-server";
import { generateCeilingDesign } from "@/lib/gemini";
import type { Style } from "@/types/style";

export const runtime = "nodejs"; // ensure Node runtime for Buffer/@google/genai

interface GenerateRequestBody {
  userImageUrl: string;
  styleId: string;
  selectedColor: string;
  selectedFinish: string; // not used in prompt, but kept for future
  selectedLighting: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequestBody;
    const {
      userImageUrl,
      styleId,
      selectedColor,
      selectedFinish,
      selectedLighting,
    } = body;

    if (
      !userImageUrl ||
      !styleId ||
      !selectedColor ||
      !selectedLighting
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch the style from Supabase by style_id
    const { data: styleRow, error: styleError } = await supabaseServer
      .from("styles")
      .select(
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
      )
      .eq("style_id", styleId)
      .single();

    if (styleError || !styleRow) {
      console.error("Error fetching style:", styleError);
      return NextResponse.json(
        { success: false, error: "Style not found" },
        { status: 404 }
      );
    }

    const style: Style = styleRow as Style;

    // 2️⃣ Call Gemini to generate the design (raw bytes)
    const generatedImageBuffer = await generateCeilingDesign({
      userImageUrl,
      style,
      selectedColor,
      selectedLighting,
    });

    // 3️⃣ Upload generated image to Supabase Storage
    const timestamp = Date.now();
    const filePath = `generated/generated-${timestamp}-${style.styleId}.png`;

    const { error: uploadError } = await supabaseServer.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, generatedImageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading generated image:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload generated image" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl: generatedImageUrl },
    } = supabaseServer.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    // 4️⃣ Insert a record into user_generations
    const { data: genRow, error: genInsertError } = await supabaseServer
      .from("user_generations")
      .insert({
        user_image_url: userImageUrl,
        style_id: style.styleId,
        generated_image_url: generatedImageUrl,
        selected_color: selectedColor,
        selected_style: style.name,
        selected_lighting: selectedLighting,
      })
      .select(
        `
        id,
        user_image_url,
        generated_image_url,
        selected_color,
        selected_style,
        selected_lighting
      `
      )
      .single();

    if (genInsertError || !genRow) {
      console.error("Error inserting user generation:", genInsertError);
      return NextResponse.json(
        { success: false, error: "Failed to save generation" },
        { status: 500 }
      );
    }

    // 5️⃣ Build the GenerationResponse your hook expects
    const responseBody = {
      success: true,
      generation: {
        id: genRow.id,
        generatedImageUrl: genRow.generated_image_url,
        userImageUrl: genRow.user_image_url,
        selectedColor: genRow.selected_color,
        selectedStyle: genRow.selected_style,
        selectedLighting: genRow.selected_lighting,
        style: {
          name: style.name,
          description: style.description,
          styleId: style.styleId,
        },
      },
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
