import {
  getSupabaseAdmin,
  getUserFromRequest,
  sendJson
} from "./_supabase.js";

const USDT_TRC20_ADDRESS = "TBnjQq7kCuF3NBYMQcniF2pzVVLfEnMmEU";
const TRON_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const TRONSCAN_TX_URL = "https://apilist.tronscanapi.com/api/transaction-info";

const PLAN_PRICES = {
  gu_master: 5,
  gu_immortal: 10,
  venerable: 30
};

const TIER_GRANTS = {
  gu_master: {
    narrations_remaining: 42,
    chats_remaining: 100
  },
  gu_immortal: {
    narrations_remaining: 500,
    chats_remaining: 999999
  },
  venerable: {
    narrations_remaining: 999999,
    chats_remaining: 999999
  }
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function cleanText(value, max = 220) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .slice(0, max);
}

function normalizeTier(tier) {
  if (tier === "gu_master" || tier === "gu_immortal" || tier === "venerable") {
    return tier;
  }

  return "";
}

function tierRank(tier) {
  switch (tier) {
    case "venerable":
      return 4;
    case "gu_immortal":
      return 3;
    case "gu_master":
      return 2;
    default:
      return 1;
  }
}

function strongerTier(a, b) {
  return tierRank(a) >= tierRank(b) ? a : b;
}

function toBaseUnits(amount, decimals = 6) {
  const raw = String(amount || "0").trim();

  if (!raw) return 0n;

  // Tronscan commonly returns integer base-units for TRC20 in amount_str.
  if (/^\d+$/.test(raw)) {
    return BigInt(raw);
  }

  // Fallback for APIs returning decimal values like "5.0".
  const [whole, frac = ""] = raw.split(".");
  const safeWhole = whole.replace(/\D/g, "") || "0";
  const safeFrac = frac.replace(/\D/g, "").padEnd(decimals, "0").slice(0, decimals);

  return BigInt(safeWhole + safeFrac);
}

function requiredBaseUnits(plan) {
  return BigInt(Math.round((PLAN_PRICES[plan] || 0) * 1_000_000));
}

function normalizeAddress(value) {
  return String(value || "").trim();
}

function sameAddress(a, b) {
  return normalizeAddress(a).toLowerCase() === normalizeAddress(b).toLowerCase();
}

function txLooksSuccessful(data) {
  if (!data || typeof data !== "object") return false;

  if (data.confirmed === false) return false;
  if (data.contractRet && String(data.contractRet).toUpperCase() !== "SUCCESS") return false;
  if (data.receipt?.result && String(data.receipt.result).toUpperCase() !== "SUCCESS") return false;

  return true;
}

function collectTransfers(data) {
  const out = [];

  const candidates = [
    data?.trc20TransferInfo,
    data?.trc20Transfer_info,
    data?.trc20_transfer_info,
    data?.tokenTransferInfo,
    data?.tokenTransfer_info,
    data?.token_transfer_info
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) out.push(...item);
    else if (item && typeof item === "object") out.push(item);
  }

  return out;
}

function findValidUsdtTransfer(data, plan) {
  const transfers = collectTransfers(data);
  const required = requiredBaseUnits(plan);

  for (const transfer of transfers) {
    const contract =
      transfer.contract_address ||
      transfer.contractAddress ||
      transfer.tokenInfo?.tokenId ||
      transfer.token_info?.tokenId ||
      transfer.tokenInfo?.contract_address ||
      "";

    const tokenSymbol =
      transfer.symbol ||
      transfer.tokenInfo?.tokenAbbr ||
      transfer.token_info?.tokenAbbr ||
      transfer.tokenInfo?.tokenName ||
      "";

    const to =
      transfer.to_address ||
      transfer.toAddress ||
      transfer.to ||
      transfer.to_address_tag ||
      "";

    const decimals = Number(
      transfer.decimals ||
      transfer.tokenInfo?.tokenDecimal ||
      transfer.token_info?.tokenDecimal ||
      6
    );

    const amountRaw =
      transfer.amount_str ||
      transfer.amountStr ||
      transfer.quant ||
      transfer.amount ||
      transfer.value ||
      "0";

    const amountBase = toBaseUnits(amountRaw, Number.isFinite(decimals) ? decimals : 6);

    const isUsdt =
      sameAddress(contract, TRON_USDT_CONTRACT) ||
      String(tokenSymbol).toUpperCase().includes("USDT");

    const isToWallet = sameAddress(to, USDT_TRC20_ADDRESS);

    if (isUsdt && isToWallet && amountBase >= required) {
      return {
        transfer,
        amountBase,
        amountUsdt: Number(amountBase) / 1_000_000
      };
    }
  }

  return null;
}

async function fetchTronscanTransaction(txHash) {
  const res = await fetch(`${TRONSCAN_TX_URL}?hash=${encodeURIComponent(txHash)}`, {
    headers: {
      Accept: "application/json"
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Tronscan lookup failed (${res.status})`);
  }

  return data;
}

async function getOrCreateProfile(supabase, authUser) {
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
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
        last_reset_date: todayKey(),
        collected_gu: []
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    profile = created;
  }

  return profile;
}

async function grantRealmToProfile(supabase, profile, plan) {
  const grant = TIER_GRANTS[plan];
  const finalTier = strongerTier(profile.tier || "mortal", plan);

  const nextNarrations = Math.max(
    Number(profile.narrations_remaining || 0),
    Number(grant.narrations_remaining || 0)
  );

  const nextChats = Math.max(
    Number(profile.chats_remaining || 0),
    Number(grant.chats_remaining || 0)
  );

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      tier: finalTier,
      narrations_remaining: nextNarrations,
      chats_remaining: nextChats,
      email: profile.email || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", profile.id)
    .select()
    .single();

  if (error) throw error;

  return updated;
}

async function insertCryptoPayment(supabase, payload) {
  const { data, error } = await supabase
    .from("crypto_payments")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const err = new Error("This transaction hash has already been used.");
      err.status = 409;
      throw err;
    }

    throw error;
  }

  return data;
}

async function updateCryptoPaymentStatus(supabase, id, status, extra = {}) {
  if (!id) return;

  const { error } = await supabase
    .from("crypto_payments")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...extra
    })
    .eq("id", id);

  if (error) {
    console.error("crypto_payments status update failed:", error);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const authUser = await getUserFromRequest(req);

  if (!authUser) {
    return sendJson(res, 401, {
      success: false,
      loginRequired: true,
      error: "Sign in before making an on-chain offering."
    });
  }

  const body = req.body || {};
  const plan = normalizeTier(body.plan);
  const txHash = cleanText(body.txHash || body.tx_hash, 120);
  const deviceId = cleanText(body.deviceId, 180);

  if (!plan || !PLAN_PRICES[plan]) {
    return sendJson(res, 400, {
      success: false,
      error: "Choose a valid realm."
    });
  }

  if (!txHash || txHash.length < 24) {
    return sendJson(res, 400, {
      success: false,
      error: "Enter a valid transaction hash."
    });
  }

  const supabase = getSupabaseAdmin();

  let paymentRow = null;

  try {
    const profile = await getOrCreateProfile(supabase, authUser);
    const txData = await fetchTronscanTransaction(txHash);

    if (!txLooksSuccessful(txData)) {
      return sendJson(res, 400, {
        success: false,
        error: "Transaction is not confirmed as successful yet. Try again shortly."
      });
    }

    const validTransfer = findValidUsdtTransfer(txData, plan);

    if (!validTransfer) {
      return sendJson(res, 400, {
        success: false,
        error: `Could not find a confirmed ${PLAN_PRICES[plan]} USDT TRC-20 transfer to The Omniarch wallet.`
      });
    }

    paymentRow = await insertCryptoPayment(supabase, {
      user_id: authUser.id,
      device_id: deviceId || null,
      email: authUser.email || null,
      plan,
      amount_usdt: validTransfer.amountUsdt,
      required_usdt: PLAN_PRICES[plan],
      currency: "USDT",
      network: "TRON_TRC20",
      wallet_address: USDT_TRC20_ADDRESS,
      token_contract: TRON_USDT_CONTRACT,
      tx_hash: txHash,
      status: "verifying",
      raw: txData
    });

    const updated = await grantRealmToProfile(supabase, profile, plan);

    await updateCryptoPaymentStatus(supabase, paymentRow.id, "approved", {
      approved_at: new Date().toISOString()
    });

    await supabase.from("transactions").insert({
      device_id: deviceId || authUser.id,
      email: authUser.email || null,
      username: updated.username || "",
      reference: txHash,
      amount: Math.round(validTransfer.amountUsdt * 100),
      currency: "USDT_TRC20",
      plan,
      status: "successful_crypto"
    }).then(({ error }) => {
      if (error) console.error("crypto transaction log failed:", error);
    });

    return sendJson(res, 200, {
      success: true,
      accountMode: "email",
      tier: updated.tier,
      redeemedTier: plan,
      amountUsdt: validTransfer.amountUsdt,
      narrationsRemaining: updated.narrations_remaining || 0,
      chatsRemaining: updated.chats_remaining || 0,
      userEmail: updated.email || authUser.email || "",
      userName: updated.username || ""
    });
  } catch (err) {
    console.error("api/verify-crypto-payment error:", err);

    if (paymentRow?.id) {
      await updateCryptoPaymentStatus(supabase, paymentRow.id, "failed", {
        failure_reason: err.message || String(err)
      });
    }

    return sendJson(res, err.status || 500, {
      success: false,
      error: err.message || "Could not verify the on-chain offering."
    });
  }
}
