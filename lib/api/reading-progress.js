import {
  getSupabaseAdmin,
  getUserFromRequest,
  sendJson
} from "./_supabase.js";

function cleanText(value, max = 220) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);
}

function clampPercent(value) {
  const n = Math.round(Number(value || 0));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function serialize(row) {
  return {
    chapterNum: row.chapter_num,
    chapterTitle: row.chapter_title || "",
    scrollPercent: row.scroll_percent || 0,
    completed: !!row.completed,
    updatedAt: row.updated_at
  };
}

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();

  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return sendJson(res, 401, {
        success: false,
        loginRequired: true,
        error: "Login to sync reading progress."
      });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", authUser.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        progress: (data || []).map(serialize)
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const chapterNum = cleanText(body.chapterNum, 40);
      const chapterTitle = cleanText(body.chapterTitle, 220);
      const scrollPercent = clampPercent(body.scrollPercent);
      const completed = !!body.completed || scrollPercent >= 92;

      if (!chapterNum || !chapterTitle) {
        return sendJson(res, 400, {
          success: false,
          error: "Missing chapter progress data."
        });
      }

      const { data, error } = await supabase
        .from("reading_progress")
        .upsert(
          {
            user_id: authUser.id,
            chapter_num: chapterNum,
            chapter_title: chapterTitle,
            scroll_percent: scrollPercent,
            completed,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id,chapter_num" }
        )
        .select()
        .single();

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        progress: serialize(data)
      });
    }

    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error("api/reading-progress error:", err);
    return sendJson(res, 500, {
      success: false,
      error: "Could not sync reading progress.",
      details: err.message || String(err)
    });
  }
}
