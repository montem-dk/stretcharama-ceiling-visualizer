// lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucketName = process.env.SUPABASE_BUCKET ?? "ceilings";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase environment variables are not set");
}

export const SUPABASE_BUCKET = bucketName;

// Server-side client (can use service role)
export const supabaseServer = createClient(supabaseUrl, serviceRoleKey);
