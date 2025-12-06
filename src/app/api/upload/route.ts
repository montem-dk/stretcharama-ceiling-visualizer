// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { supabaseServer, SUPABASE_BUCKET } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Basic validation: MIME & size (10 MB)
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported file type" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large" },
        { status: 400 }
      );
    }

    // Create a unique path: uploads/timestamp-originalName
    const fileExt = file.name.split(".").pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = `uploads/${Date.now()}-${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseServer.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseServer.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);

    // Match UploadResponse interface in use-ceiling-generator.ts
    const responseBody = {
      success: true,
      imageUrl: publicUrl,
      originalName: file.name,
      size: file.size,
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (err) {
    console.error("Unexpected upload error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
