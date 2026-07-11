import {
  getSupabaseAdmin,
  getUserFromRequest,
  sendJson
} from "./_supabase.js";

function cleanText(value, max = 4000) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);
}

function serialize(row) {
  return {
    id: row.id,
    type: "highlight",
    chapterNum: row.chapter_num,
    chapterTitle: row.chapter_title,
    sentenceIdx: row.sentence_idx,
    text: row.text || "",
    color: row.color || "gold",
    createdAt: row.created_at,
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
        error: "Login to save highlights across devices."
      });
    }

    if (req.method === "GET") {
      // Try highlights table first, fallback to annotations
      let data, error;
      try {
        const res = await supabase
          .from("highlights")
          .select("*")
          .eq("user_id", authUser.id)
          .order("updated_at", { ascending: false });
        data = res.data;
        error = res.error;
      } catch (_) {
        // Fallback
        const res = await supabase
          .from("annotations")
          .select("*")
          .eq("user_id", authUser.id)
          .eq("type", "highlight")
          .order("updated_at", { ascending: false });
        data = res.data;
        error = res.error;
      }

      if (error) throw error;
      return sendJson(res, 200, {
        success: true,
        highlights: (data || []).map(serialize)
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const chapterNum = cleanText(body.chapterNum, 40);
      const chapterTitle = cleanText(body.chapterTitle, 220);
      const sentenceIdx = Number.isFinite(Number(body.sentenceIdx)) ? Number(body.sentenceIdx) : -1;
      const text = cleanText(body.text, 4000);
      const color = cleanText(body.color || "gold", 30) || "gold";

      if (!chapterNum || !chapterTitle || sentenceIdx < 0) {
        return sendJson(res, 400, {
          success: false,
          error: "Missing chapter or sentence information."
        });
      }

      // Try highlights table first
      let table = "highlights";
      let identity = {
        user_id: authUser.id,
        chapter_num: chapterNum,
        sentence_idx: sentenceIdx
      };

      let existing = null;
      try {
        const res = await supabase
          .from(table)
          .select("*")
          .match(identity)
          .maybeSingle();
        existing = res.data;
        if (res.error) throw res.error;
      } catch (_) {
        // Fallback
        table = "annotations";
        identity = {
          user_id: authUser.id,
          type: "highlight",
          chapter_num: chapterNum,
          sentence_idx: sentenceIdx
        };
        const res = await supabase
          .from(table)
          .select("*")
          .match(identity)
          .maybeSingle();
        existing = res.data;
      }

      if (existing) {
        const { data, error } = await supabase
          .from(table)
          .update({
            chapter_title: chapterTitle,
            text,
            color,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id)
          .eq("user_id", authUser.id)
          .select()
          .single();

        if (error) throw error;
        return sendJson(res, 200, { success: true, highlight: serialize(data) });
      }

      const insertData = {
        user_id: authUser.id,
        chapter_num: chapterNum,
        chapter_title: chapterTitle,
        sentence_idx: sentenceIdx,
        text,
        color
      };
      if (table === "annotations") {
        insertData.type = "highlight";
      }

      const { data, error } = await supabase
        .from(table)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return sendJson(res, 200, { success: true, highlight: serialize(data) });
    }

    if (req.method === "DELETE") {
      const id = cleanText(req.query.id || req.body?.id, 80);
      if (!id) {
        return sendJson(res, 400, { success: false, error: "Missing highlight id." });
      }

      // Try deleting from highlights first, then annotations
      let error;
      try {
        const res = await supabase
          .from("highlights")
          .delete()
          .eq("id", id)
          .eq("user_id", authUser.id);
        error = res.error;
      } catch (_) {
        const res = await supabase
          .from("annotations")
          .delete()
          .eq("id", id)
          .eq("user_id", authUser.id);
        error = res.error;
      }

      if (error) throw error;
      return sendJson(res, 200, { success: true, id });
    }

    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error("api/highlights error:", err);
    return sendJson(res, 500, {
      success: false,
      error: "Could not update highlights.",
      details: err.message || String(err)
    });
  }
}
