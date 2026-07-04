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
  return value === "note" ? "note" : "highlight";
}

function serialize(row) {
  return {
    id: row.id,
    type: row.type,
    chapterNum: row.chapter_num,
    chapterTitle: row.chapter_title,
    sentenceIdx: row.sentence_idx,
    text: row.text || "",
    note: row.note || "",
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
        error: "Sign in to save highlights and notes across devices."
      });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("annotations")
        .select("*")
        .eq("user_id", authUser.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        annotations: (data || []).map(serialize)
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const type = normalizeType(body.type);
      const chapterNum = cleanText(body.chapterNum, 40);
      const chapterTitle = cleanText(body.chapterTitle, 220);
      const sentenceIdx = Number.isFinite(Number(body.sentenceIdx)) ? Number(body.sentenceIdx) : -1;
      const text = cleanText(body.text, 4000);
      const note = cleanText(body.note, 2000);
      const color = cleanText(body.color || "gold", 30) || "gold";

      if (!chapterNum || !chapterTitle || sentenceIdx < 0) {
        return sendJson(res, 400, {
          success: false,
          error: "Missing chapter or sentence information."
        });
      }

      const identity = {
        user_id: authUser.id,
        type,
        chapter_num: chapterNum,
        sentence_idx: sentenceIdx
      };

      const { data: existing, error: existingErr } = await supabase
        .from("annotations")
        .select("*")
        .match(identity)
        .maybeSingle();

      if (existingErr) throw existingErr;

      if (existing) {
        const { data, error } = await supabase
          .from("annotations")
          .update({
            chapter_title: chapterTitle,
            text,
            note,
            color,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id)
          .eq("user_id", authUser.id)
          .select()
          .single();

        if (error) throw error;

        return sendJson(res, 200, {
          success: true,
          annotation: serialize(data)
        });
      }

      const { data, error } = await supabase
        .from("annotations")
        .insert({
          user_id: authUser.id,
          type,
          chapter_num: chapterNum,
          chapter_title: chapterTitle,
          sentence_idx: sentenceIdx,
          text,
          note,
          color
        })
        .select()
        .single();

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        annotation: serialize(data)
      });
    }

    if (req.method === "DELETE") {
      const id = cleanText(req.query.id || req.body?.id, 80);

      if (!id) {
        return sendJson(res, 400, {
          success: false,
          error: "Missing annotation id."
        });
      }

      const { error } = await supabase
        .from("annotations")
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
    console.error("api/annotations error:", err);

    return sendJson(res, 500, {
      success: false,
      error: "Could not update highlights or notes.",
      details: err.message || String(err)
    });
  }
}
