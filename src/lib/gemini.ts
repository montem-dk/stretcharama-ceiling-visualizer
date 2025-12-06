// lib/gemini.ts
import { GoogleGenAI, Modality } from "@google/genai";
import type { Style } from "@/app/types/style";

const apiKey =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY or GOOGLE_AI_API_KEY env var is required for Gemini."
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

interface GenerateCeilingDesignParams {
  userImageUrl: string;
  style: Style;
  selectedColor: string;
  selectedLighting: string;
}

async function fetchImageAsBase64(
  url: string
): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${url} (${res.status})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") || "image/jpeg";

  return {
    data: Buffer.from(arrayBuffer).toString("base64"),
    mimeType: contentType,
  };
}

/**
 * Calls Gemini with:
 *  - style reference image
 *  - user ceiling image
 *  - detailed prompt
 *
 * Returns: raw image bytes (Buffer) of the generated design.
 */
export async function generateCeilingDesign({
  userImageUrl,
  style,
  selectedColor,
  selectedLighting,
}: GenerateCeilingDesignParams): Promise<Buffer> {
  try {
    // 1) Load user image (from Supabase public URL)
    const userImage = await fetchImageAsBase64(userImageUrl);

    // 2) Load style reference image (finalImageUrl preferred, fallback to preview)
    const styleImageUrl = style.finalImageUrl || style.previewImageUrl;
    if (!styleImageUrl) {
      throw new Error("No style reference image URL provided");
    }

    const styleImage = await fetchImageAsBase64(styleImageUrl);

    // 3) Build prompt (same logic as original gemini.ts)
    const prompt = `You are an expert interior design visualization assistant. I'm providing you with two images and detailed style specifications to help you create a realistic ceiling transformation.

**Images provided:**
1. First image: Reference ceiling style (the target design)
2. Second image: User's actual room (where the ceiling needs to be transformed)

**Style Details:**
- Style Name: ${style.name}
- Color: ${selectedColor}
- Lighting: ${selectedLighting}
- Description: ${style.description}${
      style.longDescription
        ? `

**Detailed Style Guidelines:**
${style.longDescription}`
        : ""
    }

**Instructions:**
1. Carefully analyze the reference ceiling image (first image) to understand the visual style, texture, pattern, and design elements
2. ${
      style.longDescription
        ? "Study the detailed style guidelines above to understand the specific characteristics of this ceiling style"
        : "Use the reference image to understand the ceiling design characteristics"
    }
3. Apply this ceiling style to the user's room (second image), transforming ONLY the ceiling portion
4. Maintain the original room's dimensions, walls, furniture, and all other elements exactly as they appear in the user's image
5. Ensure the new ceiling integrates naturally with the room's lighting and perspective
6. Create a photorealistic result that looks like a professional architectural rendering
7. Adjust the ceiling's width, height, and perspective to match the room's actual dimensions
8. Use the color "${selectedColor}" and lighting type "${selectedLighting}" as specified

**Output Requirements:**
- Return ONLY the transformed image in your response
- High resolution and photorealistic quality
- Natural lighting and shadows that match the room
- No additional text, labels, or explanations in the image
- The ceiling should look professionally installed and realistic

Focus on making the transformation look natural and believable, as if the ceiling style was actually installed in the user's room.`;

    const contents = [
      {
        inlineData: {
          data: styleImage.data,
          mimeType: styleImage.mimeType,
        },
      },
      {
        inlineData: {
          data: userImage.data,
          mimeType: userImage.mimeType,
        },
      },
      {
        text: prompt,
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("No content parts returned from Gemini");
    }

    for (const part of content.parts) {
      if (part.text) {
        console.log("Gemini response text:", part.text);
      } else if (part.inlineData?.data) {
        const imageData = Buffer.from(part.inlineData.data, "base64");
        return imageData;
      }
    }

    throw new Error("No image data found in Gemini response");
  } catch (error) {
    console.error("Error generating ceiling design:", error);
    throw new Error(`Failed to generate ceiling design: ${error}`);
  }
}
