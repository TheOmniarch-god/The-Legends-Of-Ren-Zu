import {
  getSupabaseAdmin,
  getUserFromRequest,
  sendJson
} from "./_supabase.js";

function cleanText(value, max = 80) {
  return String(value || "").trim().slice(0, max);
}

function cleanAvatarChoice(value) {
  const raw = String(value || "avatar_01").trim();
  if (/^avatar_\d{2}$/.test(raw)) return raw;
  if (/^\d{2}$/.test(raw)) return `avatar_${raw}`;
  return "avatar_01";
}

function normalize(row) {
  return {
    id: row.id,
    userId: row.id,
    username: row.username || "Unnamed Venerable",
    title: row.title || "Venerable",
    avatarChoice: row.avatar_choice || "avatar_01",
    avatarId: row.avatar_choice || "avatar_01",
    codexCount: row.codex_count || 0,
    totalGu: row.total_gu || 0,
    isMyriad: !!row.is_myriad,
    displayOrder: row.display_order ?? 100,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function listHall(supabase) {
  const { data, error } = await supabase
    .from("hall_venerables")
    .select("id, username, title, avatar_choice, codex_count, total_gu, is_myriad, display_order, created_at, updated_at")
    .order("display_order", { ascending: true })
    .order("is_myriad", { ascending: false })
    .order("codex_count", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw error;
  return (data || []).map(normalize);
}

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();

  if (req.method === "GET") {
    try {
      const entries = await listHall(supabase);
      let optedIn = false;
      let myEntry = null;

      const authUser = await getUserFromRequest(req).catch(() => null);
      if (authUser) {
        const { data: mine, error: mineErr } = await supabase
          .from("hall_venerables")
          .select("id, username, title, avatar_choice, codex_count, total_gu, is_myriad, display_order, created_at, updated_at")
          .eq("id", authUser.id)
          .maybeSingle();
        if (mineErr) throw mineErr;
        if (mine) {
          optedIn = true;
          myEntry = normalize(mine);
        }
      }

      return sendJson(res, 200, {
        success: true,
        entries,
        list: entries,
        optedIn,
        myEntry
      });
    } catch (err) {
      console.error("GET /api/hall error:", err);
      return sendJson(res, 500, { success: false, error: "Failed to load Hall Of Venerables." });
    }
  }

  if (req.method === "POST") {
    try {
      const authUser = await getUserFromRequest(req);
      if (!authUser) return sendJson(res, 401, { success: false, error: "Login required." });

      const body = req.body || {};
      const optIn = !!(body.optIn ?? body.optedIn);
      const avatarChoice = cleanAvatarChoice(body.avatarChoice || body.avatarId);

      if (!optIn) {
        const { error: deleteErr } = await supabase
          .from("hall_venerables")
          .delete()
          .eq("id", authUser.id);
        if (deleteErr) throw deleteErr;
        const entries = await listHall(supabase);
        return sendJson(res, 200, { success: true, optedIn: false, entries, list: entries, myEntry: null });
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, email, username, tier, collected_gu, avatar_choice, created_at")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profileErr) throw profileErr;
      if (!profile) return sendJson(res, 404, { success: false, error: "Profile not found." });
      if (profile.tier !== "venerable") return sendJson(res, 403, { success: false, error: "Venerable realm required." });

      const collectedGu = Array.isArray(profile.collected_gu) ? profile.collected_gu : [];
      const codexCount = Number.isFinite(Number(body.codexCount))
        ? Math.max(0, Number(body.codexCount))
        : collectedGu.filter(g => g && g.status !== "trace").length;
      const totalGu = Number.isFinite(Number(body.totalGu)) ? Math.max(0, Number(body.totalGu)) : 0;
      const isMyriad = totalGu > 0 && codexCount >= totalGu;
      const email = String(profile.email || authUser.email || "").toLowerCase();
      const isFounder = email === "omniarchportal@gmail.com";
      const username = isFounder
        ? "The Omniarch"
        : cleanText(profile.username || body.username || authUser.email || "Unnamed Venerable", 80);

      // Keep avatar choice synced to the email profile as well.
      await supabase
        .from("profiles")
        .update({ avatar_choice: avatarChoice, updated_at: new Date().toISOString() })
        .eq("id", authUser.id);

      const payload = {
        id: authUser.id,
        username,
        title: isFounder ? "Founder · Supreme Venerable" : "Venerable",
        avatar_choice: avatarChoice || profile.avatar_choice || "avatar_01",
        codex_count: codexCount,
        total_gu: totalGu,
        is_myriad: isMyriad,
        display_order: isFounder ? 0 : 100,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: saved, error: upsertErr } = await supabase
        .from("hall_venerables")
        .upsert(payload, { onConflict: "id" })
        .select("id, username, title, avatar_choice, codex_count, total_gu, is_myriad, display_order, created_at, updated_at")
        .single();

      if (upsertErr) throw upsertErr;
      const entries = await listHall(supabase);
      return sendJson(res, 200, {
        success: true,
        optedIn: true,
        entry: saved ? normalize(saved) : null,
        myEntry: saved ? normalize(saved) : null,
        entries,
        list: entries
      });
    } catch (err) {
      console.error("POST /api/hall error:", err);
      return sendJson(res, 500, { success: false, error: err?.message || "Failed to update Venerable Listing." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return sendJson(res, 405, { success: false, error: "Method not allowed" });
}
