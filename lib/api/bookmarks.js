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

function normalizeType(value) {
  return value === "sentence" ? "sentence" : "chapter";
}

function serializeBookmark(row) {
  return {
    id: row.id,
    type: row.type,
    chapterNum: row.chapter_num,
    chapterTitle: row.chapter_title,
    sentenceIdx: row.sentence_idx,
    text: row.text || "",
    createdAt: row.created_at
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
        error: "Sign in to save bookmarks across devices."
      });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        bookmarks: (data || []).map(serializeBookmark)
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const type = normalizeType(body.type);
      const chapterNum = cleanText(body.chapterNum, 40);
      const chapterTitle = cleanText(body.chapterTitle, 220);
      const sentenceIdx = Number.isFinite(Number(body.sentenceIdx)) ? Number(body.sentenceIdx) : null;
      const text = cleanText(body.text, 4000);

      if (!chapterNum || !chapterTitle) {
        return sendJson(res, 400, {
          success: false,
          error: "Missing chapter information."
        });
      }

      const identity = type === "chapter"
        ? {
            user_id: authUser.id,
            type: "chapter",
            chapter_num: chapterNum,
            sentence_idx: -1
          }
        : {
            user_id: authUser.id,
            type: "sentence",
            chapter_num: chapterNum,
            sentence_idx: sentenceIdx ?? -1
          };

      const { data: existing, error: existingErr } = await supabase
        .from("bookmarks")
        .select("*")
        .match(identity)
        .maybeSingle();

      if (existingErr) throw existingErr;

      if (existing) {
        return sendJson(res, 200, {
          success: true,
          existed: true,
          bookmark: serializeBookmark(existing)
        });
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .insert({
          user_id: authUser.id,
          type,
          chapter_num: chapterNum,
          chapter_title: chapterTitle,
          sentence_idx: type === "chapter" ? -1 : (sentenceIdx ?? -1),
          text
        })
        .select()
        .single();

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        bookmark: serializeBookmark(data)
      });
    }

    if (req.method === "DELETE") {
      const id = cleanText(req.query.id || req.body?.id, 80);

      if (!id) {
        return sendJson(res, 400, {
          success: false,
          error: "Missing bookmark id."
        });
      }

      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id)
        .eq("user_id", authUser.id);

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        id
      });
    }

    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error("api/bookmarks error:", err);

    return sendJson(res, 500, {
      success: false,
      error: "Could not update bookmarks.",
      details: err.message || String(err)
    });
  }
}
