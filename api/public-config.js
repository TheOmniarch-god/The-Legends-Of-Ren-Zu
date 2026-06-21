import { sendJson } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  return sendJson(res, 200, {
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    siteUrl:
      process.env.PUBLIC_SITE_URL ||
      "https://thelegendsofrenzu.theomniarch.com.ng"
  });
}
