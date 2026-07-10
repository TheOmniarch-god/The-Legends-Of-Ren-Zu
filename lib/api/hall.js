import {
  getSupabaseAdmin,
  getUserFromRequest,
  sendJson
} from "./_supabase.js";

// GET /api/hall -> public list of opted-in Venerables and status of current user
// POST /api/hall -> toggle opt-in status for the logged-in Venerable
export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();

  if (req.method === "GET") {
    try {
      // Get all opted-in venerables sorted by creation date (newest first)
      const { data, error } = await supabase
        .from("hall_venerables")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("GET /api/hall error:", error);
        return sendJson(res, 500, { error: "Failed to load Hall of Venerables list." });
      }

      // If they are logged in, we also return whether they are opted-in or not.
      let optedIn = false;
      const authUser = await getUserFromRequest(req);
      if (authUser) {
        const { data: userHallRow } = await supabase
          .from("hall_venerables")
          .select("id")
          .eq("id", authUser.id)
          .maybeSingle();
        if (userHallRow) {
          optedIn = true;
        }
      }

      return sendJson(res, 200, {
        success: true,
        list: data || [],
        optedIn
      });
    } catch (err) {
      console.error("GET /api/hall error:", err);
      return sendJson(res, 500, { error: "Internal error loading the Hall of Venerables." });
    }
  }

  if (req.method === "POST") {
    try {
      const authUser = await getUserFromRequest(req);
      if (!authUser) {
        return sendJson(res, 401, { error: "Authentication required" });
      }

      const body = req.body || {};
      const optedIn = !!body.optedIn;
      const avatarChoice = String(body.avatarChoice || "").trim().slice(0, 100);

      if (!optedIn) {
        // Opt-out: delete from hall_venerables
        const { error: deleteErr } = await supabase
          .from("hall_venerables")
          .delete()
          .eq("id", authUser.id);

        if (deleteErr) {
          console.error("Opt-out error:", deleteErr);
          return sendJson(res, 500, { error: "Failed to opt out of the Hall of Venerables." });
        }

        return sendJson(res, 200, { success: true, optedIn: false });
      }

      // Opt-in: insert/upsert into hall_venerables
      // First, get their profile to verify eligibility (must be venerable tier)
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profileErr) {
        console.error("Fetch profile error:", profileErr);
        return sendJson(res, 500, { error: "Failed to verify profile eligibility." });
      }

      if (!profile) {
        return sendJson(res, 404, { error: "Profile not found." });
      }

      if (profile.tier !== "venerable") {
        return sendJson(res, 400, { error: "Only Venerable cultivators may enter the Hall." });
      }

      // Compute codex_count from collected_gu
      const collectedGu = Array.isArray(profile.collected_gu) ? profile.collected_gu : [];
      const codexCount = collectedGu.filter(g => g && g.status !== "trace").length;
      const totalGu = body.totalGu || 43; // fallback to 43 if not provided

      // Upsert into hall_venerables (without "tier" column to match your database schema perfectly)
      const { data: upsertData, error: upsertErr } = await supabase
        .from("hall_venerables")
        .upsert({
          id: authUser.id,
          username: (profile.username || "Unnamed Cultivator").trim() || "Unnamed Cultivator",
          avatar_choice: avatarChoice,
          codex_count: codexCount,
          total_gu: totalGu,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (upsertErr) {
        console.error("Upsert hall error:", upsertErr);
        return sendJson(res, 500, { error: "Failed to opt into the Hall of Venerables." });
      }

      return sendJson(res, 200, {
        success: true,
        optedIn: true,
        entry: upsertData
      });
    } catch (err) {
      console.error("POST /api/hall error:", err);
      return sendJson(res, 500, { error: "Internal error updating Hall status." });
    }
  }

  return sendJson(res, 405, { error: "Method not allowed" });
}
