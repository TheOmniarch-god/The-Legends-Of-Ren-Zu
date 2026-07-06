import {
  getSupabaseAdmin,
  getUserFromRequest,
  sendJson
} from "./_supabase.js";

function cleanGuList(value) {
  const arr = Array.isArray(value) ? value : [];
  const seen = new Set();
  const out = [];

  for (const item of arr) {
    if (!item || typeof item !== "object" || !item.id) continue;
    const id = String(item.id).trim().slice(0, 80);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    out.push({
      id,
      name: String(item.name || "").slice(0, 160),
      symbol: String(item.symbol || "").slice(0, 16),
      lore: String(item.lore || "").slice(0, 500),
      tier: String(item.tier || "gu_master").slice(0, 40),
      discoveredAt: item.discoveredAt || Date.now(),
      source: String(item.source || "").slice(0, 120),
      isMain: !!item.isMain
    });
  }

  return out;
}

function mergeCollections(a, b) {
  const map = new Map();
  [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].forEach(item => {
    if (!item?.id) return;
    map.set(item.id, { ...(map.get(item.id) || {}), ...item });
  });
  return Array.from(map.values());
}

async function getOrCreateProfile(supabase, authUser) {
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, username, collected_gu")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) throw error;

  if (!profile) {
    const { data: created, error: insertErr } = await supabase
      .from("profiles")
      .insert({
        id: authUser.id,
        email: authUser.email || null,
        username: "",
        tier: "mortal",
        daily_chat_used: 0,
        daily_audio_used: 0,
        narrations_remaining: 0,
        chats_remaining: 0,
        last_reset_date: new Date().toISOString().slice(0, 10),
        collected_gu: []
      })
      .select("id, email, username, collected_gu")
      .single();

    if (insertErr) throw insertErr;
    profile = created;
  }

  return profile;
}

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();

  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return sendJson(res, 401, {
        success: false,
        loginRequired: true,
        error: "Login to sync Codex collection."
      });
    }

    if (req.method === "GET") {
      const profile = await getOrCreateProfile(supabase, authUser);
      return sendJson(res, 200, {
        success: true,
        collectedGu: Array.isArray(profile.collected_gu) ? profile.collected_gu : []
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const incoming = cleanGuList(body.collectedGu);
      const profile = await getOrCreateProfile(supabase, authUser);
      const existing = Array.isArray(profile.collected_gu) ? profile.collected_gu : [];
      const merged = mergeCollections(existing, incoming);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          collected_gu: merged,
          updated_at: new Date().toISOString()
        })
        .eq("id", authUser.id)
        .select("collected_gu")
        .single();

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        collectedGu: Array.isArray(data.collected_gu) ? data.collected_gu : merged
      });
    }

    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error("api/collection error:", err);
    return sendJson(res, 500, {
      success: false,
      error: "Could not sync Codex collection.",
      details: err.message || String(err)
    });
  }
}
