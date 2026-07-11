import aiChat from "../lib/api/ai-chat.js";
import aiChatTts from "../lib/api/ai-chat-tts.js";
import annotations from "../lib/api/annotations.js";
import bookmarks from "../lib/api/bookmarks.js";
import flutterwaveWebhook from "../lib/api/flutterwave-webhook.js";
import getCode from "../lib/api/get-code.js";
import hall from "../lib/api/hall.js";
import highlights from "../lib/api/highlights.js";
import linkDevice from "../lib/api/link-device.js";
import me from "../lib/api/me.js";
import notes from "../lib/api/notes.js";
import publicConfig from "../lib/api/public-config.js";
import redeemCode from "../lib/api/redeem-code.js";
import updateProfile from "../lib/api/update-profile.js";
import useCredit from "../lib/api/use-credit.js";
import verifyCryptoPayment from "../lib/api/verify-crypto-payment.js";

// One Vercel serverless function to avoid Hobby's 12-function limit.
// We disable Vercel body parsing globally so Flutterwave webhooks can read
// the raw request body. For normal JSON endpoints, this router parses JSON
// and attaches it to req.body before dispatching.
export const config = {
  api: {
    bodyParser: false,
  },
};

const routes = {
  "ai-chat": aiChat,
  "ai-chat-tts": aiChatTts,
  "annotations": annotations,
  "bookmarks": bookmarks,
  "flutterwave-webhook": flutterwaveWebhook,
  "get-code": getCode,
  "hall": hall,
  "highlights": highlights,
  "link-device": linkDevice,
  "me": me,
  "notes": notes,
  "public-config": publicConfig,
  "redeem-code": redeemCode,
  "update-profile": updateProfile,
  "use-credit": useCredit,
  "verify-crypto-payment": verifyCryptoPayment,
};

function getRouteName(req) {
  try {
    const url = new URL(req.url, "https://local.router");
    return url.pathname
      .replace(/^\/api\/?/, "")
      .split("/")
      .filter(Boolean)[0] || "";
  } catch (_) {
    const raw = String(req.url || "").split("?")[0];
    return raw.replace(/^\/api\/?/, "").split("/").filter(Boolean)[0] || "";
  }
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function attachJsonBodyIfNeeded(req, routeName) {
  if (routeName === "flutterwave-webhook") return;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method || "")) return;
  if (req.body !== undefined) return;

  const raw = await readRawBody(req);
  if (!raw) {
    req.body = {};
    return;
  }

  try {
    req.body = JSON.parse(raw);
  } catch (_) {
    // Some handlers can tolerate string bodies; keep raw as fallback.
    req.body = raw;
  }
}

export default async function handler(req, res) {
  const routeName = getRouteName(req);
  const route = routes[routeName];

  if (!route) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({
      error: "API route not found",
      route: routeName || null,
    }));
  }

  await attachJsonBodyIfNeeded(req, routeName);
  return route(req, res);
}
