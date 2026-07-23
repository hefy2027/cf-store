var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// whd-src/src/db/index.ts
var db_exports = {};
__export(db_exports, {
  cleanExpiredSessions: () => cleanExpiredSessions,
  cleanupOldWebhooks: () => cleanupOldWebhooks,
  countEndpointsByUserId: () => countEndpointsByUserId,
  countWebhooksByEndpointId: () => countWebhooksByEndpointId,
  createEndpoint: () => createEndpoint,
  createSession: () => createSession,
  createUser: () => createUser,
  createWebhook: () => createWebhook,
  deleteEndpoint: () => deleteEndpoint,
  deleteSession: () => deleteSession,
  getEndpointById: () => getEndpointById,
  getEndpointByPath: () => getEndpointByPath,
  getEndpointsByUserId: () => getEndpointsByUserId,
  getSessionById: () => getSessionById,
  getUserByGithubId: () => getUserByGithubId,
  getUserById: () => getUserById,
  getWebhookById: () => getWebhookById,
  getWebhooksByEndpointId: () => getWebhooksByEndpointId,
  searchWebhooks: () => searchWebhooks,
  updateEndpoint: () => updateEndpoint,
  updateUser: () => updateUser,
  updateWebhookReplay: () => updateWebhookReplay
});
async function getUserByGithubId(db, githubId) {
  const result = await db.prepare("SELECT * FROM users WHERE github_id = ?").bind(githubId).first();
  return result;
}
async function getUserById(db, id) {
  const result = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  return result;
}
async function createUser(db, user) {
  await db.prepare(`
		INSERT INTO users (id, github_id, github_login, email, avatar_url, plan)
		VALUES (?, ?, ?, ?, ?, ?)
	`).bind(user.id, user.github_id, user.github_login, user.email, user.avatar_url, user.plan).run();
  return await getUserById(db, user.id);
}
async function updateUser(db, id, updates) {
  const fields = [];
  const values = [];
  if (updates.github_login !== void 0) {
    fields.push("github_login = ?");
    values.push(updates.github_login);
  }
  if (updates.email !== void 0) {
    fields.push("email = ?");
    values.push(updates.email);
  }
  if (updates.avatar_url !== void 0) {
    fields.push("avatar_url = ?");
    values.push(updates.avatar_url);
  }
  if (updates.plan !== void 0) {
    fields.push("plan = ?");
    values.push(updates.plan);
  }
  if (fields.length === 0) return getUserById(db, id);
  fields.push("updated_at = datetime('now')");
  values.push(id);
  await db.prepare(`
		UPDATE users SET ${fields.join(", ")} WHERE id = ?
	`).bind(...values).run();
  return getUserById(db, id);
}
async function getEndpointByPath(db, path) {
  const result = await db.prepare("SELECT * FROM endpoints WHERE path = ?").bind(path).first();
  return result;
}
async function getEndpointById(db, id) {
  const result = await db.prepare("SELECT * FROM endpoints WHERE id = ?").bind(id).first();
  return result;
}
async function getEndpointsByUserId(db, userId) {
  const result = await db.prepare("SELECT * FROM endpoints WHERE user_id = ? ORDER BY created_at").bind(userId).all();
  return result.results;
}
async function countEndpointsByUserId(db, userId) {
  const result = await db.prepare("SELECT COUNT(*) as count FROM endpoints WHERE user_id = ?").bind(userId).first();
  return result?.count ?? 0;
}
async function createEndpoint(db, endpoint) {
  await db.prepare(`
		INSERT INTO endpoints (id, user_id, name, path, is_active)
		VALUES (?, ?, ?, ?, ?)
	`).bind(endpoint.id, endpoint.user_id, endpoint.name, endpoint.path, endpoint.is_active ? 1 : 0).run();
  return await getEndpointById(db, endpoint.id);
}
async function updateEndpoint(db, id, updates) {
  const fields = [];
  const values = [];
  if (updates.name !== void 0) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.is_active !== void 0) {
    fields.push("is_active = ?");
    values.push(updates.is_active ? 1 : 0);
  }
  if (updates.verification_secret !== void 0) {
    fields.push("verification_secret = ?");
    values.push(updates.verification_secret);
  }
  if (updates.verification_method !== void 0) {
    fields.push("verification_method = ?");
    values.push(updates.verification_method);
  }
  if (fields.length === 0) return getEndpointById(db, id);
  values.push(id);
  await db.prepare(`
		UPDATE endpoints SET ${fields.join(", ")} WHERE id = ?
	`).bind(...values).run();
  return getEndpointById(db, id);
}
async function deleteEndpoint(db, id) {
  await db.prepare("DELETE FROM endpoints WHERE id = ?").bind(id).run();
}
async function getWebhookById(db, id) {
  const result = await db.prepare("SELECT * FROM webhooks WHERE id = ?").bind(id).first();
  return result;
}
async function getWebhooksByEndpointId(db, endpointId, options = {}) {
  const { limit = 50, offset = 0, source } = options;
  let sql = "SELECT * FROM webhooks WHERE endpoint_id = ?";
  const params = [endpointId];
  if (source) {
    sql += " AND source = ?";
    params.push(source);
  }
  sql += " ORDER BY received_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);
  const result = await db.prepare(sql).bind(...params).all();
  return result.results;
}
async function countWebhooksByEndpointId(db, endpointId, source) {
  let sql = "SELECT COUNT(*) as count FROM webhooks WHERE endpoint_id = ?";
  const params = [endpointId];
  if (source) {
    sql += " AND source = ?";
    params.push(source);
  }
  const result = await db.prepare(sql).bind(...params).first();
  return result?.count ?? 0;
}
async function createWebhook(db, webhook) {
  await db.prepare(`
		INSERT INTO webhooks (id, endpoint_id, method, source, source_verified, headers, body, query_params, content_type)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).bind(
    webhook.id,
    webhook.endpoint_id,
    webhook.method,
    webhook.source,
    webhook.source_verified ? 1 : 0,
    webhook.headers,
    webhook.body,
    webhook.query_params,
    webhook.content_type
  ).run();
  return await getWebhookById(db, webhook.id);
}
async function updateWebhookReplay(db, id, status, response) {
  await db.prepare(`
		UPDATE webhooks
		SET replay_count = replay_count + 1,
		    last_replay_at = datetime('now'),
		    last_replay_status = ?,
		    last_replay_response = ?
		WHERE id = ?
	`).bind(status, response.substring(0, 1e4), id).run();
}
async function searchWebhooks(db, endpointId, query, options = {}) {
  const { limit = 50, offset = 0 } = options;
  const result = await db.prepare(`
		SELECT w.*
		FROM webhooks w
		JOIN webhooks_fts fts ON w.rowid = fts.rowid
		WHERE w.endpoint_id = ? AND webhooks_fts MATCH ?
		ORDER BY w.received_at DESC
		LIMIT ? OFFSET ?
	`).bind(endpointId, query, limit, offset).all();
  return result.results;
}
async function createSession(db, session) {
  await db.prepare(`
		INSERT INTO sessions (id, user_id, expires_at)
		VALUES (?, ?, ?)
	`).bind(session.id, session.user_id, session.expires_at).run();
  const result = await db.prepare("SELECT * FROM sessions WHERE id = ?").bind(session.id).first();
  return result;
}
async function getSessionById(db, id) {
  const result = await db.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")').bind(id).first();
  return result;
}
async function deleteSession(db, id) {
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
}
async function cleanExpiredSessions(db) {
  await db.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run();
}
async function cleanupOldWebhooks(db) {
  const freeResult = await db.prepare(`
		DELETE FROM webhooks
		WHERE received_at < datetime('now', '-7 days')
		AND endpoint_id IN (
			SELECT e.id FROM endpoints e
			JOIN users u ON e.user_id = u.id
			WHERE u.plan = 'free'
		)
	`).run();
  const proResult = await db.prepare(`
		DELETE FROM webhooks
		WHERE received_at < datetime('now', '-90 days')
		AND endpoint_id IN (
			SELECT e.id FROM endpoints e
			JOIN users u ON e.user_id = u.id
			WHERE u.plan != 'free'
		)
	`).run();
  return {
    freeDeleted: freeResult.meta.changes,
    proDeleted: proResult.meta.changes
  };
}
var init_db = __esm({
  "whd-src/src/db/index.ts"() {
    "use strict";
  }
});

// whd-src/src/utils/id.ts
var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var length = 24;
function random() {
  let result = "";
  const values = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    result += alphabet[values[i] % alphabet.length];
  }
  return result;
}
function cuid() {
  const timestamp = Date.now().toString(36);
  return timestamp + random();
}

// whd-src/src/utils/cookie.ts
function setCookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  return parts.join("; ");
}
function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
function deleteCookie(name, path = "/") {
  return setCookie(name, "", { maxAge: 0, path });
}

// whd-src/src/utils/token.ts
async function getKey(secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
async function createToken(data, secret) {
  const key = await getKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const dataB64 = btoa(data);
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${dataB64}.${sigB64}`;
}
async function verifyToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [dataB64, sigB64] = parts;
  const data = atob(dataB64);
  const sigBytes = atob(sigB64);
  const signature = new Uint8Array(sigBytes.length);
  for (let i = 0; i < sigBytes.length; i++) {
    signature[i] = sigBytes.charCodeAt(i);
  }
  const key = await getKey(secret);
  const encoder = new TextEncoder();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(data)
  );
  return valid ? data : null;
}

// whd-src/src/auth/index.ts
init_db();
var SESSION_DURATION_DAYS = 30;
var SESSION_DURATION_SECONDS = SESSION_DURATION_DAYS * 24 * 60 * 60;
function getGitHubOAuthUrl(env, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
async function exchangeCodeForToken(code, env, redirectUri) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    })
  });
  const data = await response.json();
  if (data.error || !data.access_token) {
    throw new Error(data.error || "Failed to get access token");
  }
  return data.access_token;
}
async function getGitHubUser(accessToken) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Webhook-Debugger"
    }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }
  return response.json();
}
async function handleOAuthCallback(code, env, redirectUri) {
  const accessToken = await exchangeCodeForToken(code, env, redirectUri);
  const githubUser = await getGitHubUser(accessToken);
  let user = await getUserByGithubId(env.DB, githubUser.id);
  if (!user) {
    user = await createUser(env.DB, {
      id: cuid(),
      github_id: githubUser.id,
      github_login: githubUser.login,
      email: githubUser.email,
      avatar_url: githubUser.avatar_url,
      plan: "free"
    });
  } else {
    user = await updateUser(env.DB, user.id, {
      github_login: githubUser.login,
      email: githubUser.email,
      avatar_url: githubUser.avatar_url
    }) ?? user;
  }
  const sessionId = cuid();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1e3).toISOString();
  await createSession(env.DB, {
    id: sessionId,
    user_id: user.id,
    expires_at: expiresAt
  });
  return { user, sessionId };
}
async function getCurrentUser(request, env) {
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = getCookie(cookieHeader, "session");
  if (!sessionId) return null;
  const sessionData = await verifyToken(sessionId, env.COOKIE_SECRET);
  if (!sessionData) return null;
  const [sessionIdFromToken, userId] = sessionData.split(":");
  if (sessionIdFromToken !== sessionId.split(".")[0]) return null;
  const session = await getSessionById(env.DB, sessionIdFromToken);
  if (!session) return null;
  const user = await getUserById(env.DB, session.user_id);
  if (!user) return null;
  return {
    id: user.id,
    github_login: user.github_login,
    avatar_url: user.avatar_url,
    plan: user.plan
  };
}
async function createSessionCookie(sessionId, env) {
  const token = await createToken(sessionId, env.COOKIE_SECRET);
  return setCookie("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/"
  });
}
async function logout(request, env) {
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = getCookie(cookieHeader, "session");
  if (sessionId) {
    const sessionData = await verifyToken(sessionId, env.COOKIE_SECRET);
    if (sessionData) {
      const [sessionIdFromToken] = sessionData.split(":");
      await deleteSession(env.DB, sessionIdFromToken);
    }
  }
  return deleteCookie("session", "/");
}
async function requireAuth(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  return user;
}

// whd-src/src/api/webhook.ts
init_db();

// whd-src/src/utils/signature.ts
async function verifyStripeSignature(body, signatureHeader, secret) {
  if (!signatureHeader) {
    return { verified: false, method: "stripe", reason: "Missing Stripe-Signature header" };
  }
  const elements = signatureHeader.split(",");
  let timestamp = "";
  let signature = "";
  for (const element of elements) {
    const [key2, value] = element.split("=");
    if (key2 === "t") timestamp = value;
    if (key2 === "v1") signature = value;
  }
  if (!timestamp || !signature) {
    return { verified: false, method: "stripe", reason: "Invalid signature format" };
  }
  const timestampInt = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1e3);
  if (Math.abs(now - timestampInt) > 300) {
    return { verified: false, method: "stripe", reason: "Signature timestamp expired" };
  }
  const payload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
    const expectedSignature = bufferToHex(signatureBuffer);
    const verified = signature === expectedSignature;
    return {
      verified,
      method: "stripe",
      reason: verified ? void 0 : "Signature mismatch"
    };
  } catch (err) {
    return {
      verified: false,
      method: "stripe",
      reason: `Verification error: ${err}`
    };
  }
}
async function verifyGitHubSignature(body, signatureHeader, secret) {
  if (!signatureHeader) {
    return { verified: false, method: "github", reason: "Missing X-Hub-Signature-256 header" };
  }
  const match = signatureHeader.match(/^sha256=([a-fA-F0-9]+)$/);
  if (!match) {
    return { verified: false, method: "github", reason: "Invalid signature format" };
  }
  const signature = match[1];
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body));
    const expectedSignature = bufferToHex(signatureBuffer);
    const verified = signature.toLowerCase() === expectedSignature.toLowerCase();
    return {
      verified,
      method: "github",
      reason: verified ? void 0 : "Signature mismatch"
    };
  } catch (err) {
    return {
      verified: false,
      method: "github",
      reason: `Verification error: ${err}`
    };
  }
}
async function verifySlackSignature(body, signatureHeader, timestampHeader, secret) {
  if (!signatureHeader) {
    return { verified: false, method: "slack", reason: "Missing X-Slack-Signature header" };
  }
  if (!timestampHeader) {
    return { verified: false, method: "slack", reason: "Missing X-Slack-Request-Timestamp header" };
  }
  const match = signatureHeader.match(/^v0=([a-fA-F0-9]+)$/);
  if (!match) {
    return { verified: false, method: "slack", reason: "Invalid signature format" };
  }
  const signature = match[1];
  const timestamp = parseInt(timestampHeader, 10);
  const now = Math.floor(Date.now() / 1e3);
  if (Math.abs(now - timestamp) > 300) {
    return { verified: false, method: "slack", reason: "Signature timestamp expired" };
  }
  const basestring = `v0:${timestamp}:${body}`;
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(basestring));
    const expectedSignature = bufferToHex(signatureBuffer);
    const verified = signature.toLowerCase() === expectedSignature.toLowerCase();
    return {
      verified,
      method: "slack",
      reason: verified ? void 0 : "Signature mismatch"
    };
  } catch (err) {
    return {
      verified: false,
      method: "slack",
      reason: `Verification error: ${err}`
    };
  }
}
async function verifyShopifySignature(body, signatureHeader, secret) {
  if (!signatureHeader) {
    return { verified: false, method: "shopify", reason: "Missing X-Shopify-Hmac-SHA256 header" };
  }
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body));
    const expectedSignature = bufferToBase64(signatureBuffer);
    const verified = signatureHeader === expectedSignature;
    return {
      verified,
      method: "shopify",
      reason: verified ? void 0 : "Signature mismatch"
    };
  } catch (err) {
    return {
      verified: false,
      method: "shopify",
      reason: `Verification error: ${err}`
    };
  }
}
async function verifyGenericHmacSignature(body, signatureHeader, secret) {
  if (!signatureHeader) {
    return { verified: false, method: "generic-hmac", reason: "Missing signature header" };
  }
  let signature = "";
  const hexMatch = signatureHeader.match(/^(?:sha256=)?([a-fA-F0-9]{64})$/);
  if (hexMatch) {
    signature = hexMatch[1];
  } else {
    const base64Match = signatureHeader.match(/^([A-Za-z0-9+/=]{44})$/);
    if (base64Match) {
      const encoder2 = new TextEncoder();
      const key2 = encoder2.encode(secret);
      try {
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          key2,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder2.encode(body));
        const expectedSignature = bufferToBase64(signatureBuffer);
        const verified = signatureHeader === expectedSignature;
        return {
          verified,
          method: "generic-hmac",
          reason: verified ? void 0 : "Signature mismatch"
        };
      } catch (err) {
        return {
          verified: false,
          method: "generic-hmac",
          reason: `Verification error: ${err}`
        };
      }
    }
    return { verified: false, method: "generic-hmac", reason: "Invalid signature format" };
  }
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body));
    const expectedSignature = bufferToHex(signatureBuffer);
    const verified = signature.toLowerCase() === expectedSignature.toLowerCase();
    return {
      verified,
      method: "generic-hmac",
      reason: verified ? void 0 : "Signature mismatch"
    };
  } catch (err) {
    return {
      verified: false,
      method: "generic-hmac",
      reason: `Verification error: ${err}`
    };
  }
}
async function verifyWebhookSignature(body, headers, method, secret) {
  if (method === "none" || !secret) {
    return { verified: false, method: "none", reason: "No verification configured" };
  }
  switch (method) {
    case "stripe":
      return verifyStripeSignature(body, headers.get("Stripe-Signature"), secret);
    case "github":
      return verifyGitHubSignature(body, headers.get("X-Hub-Signature-256"), secret);
    case "slack":
      return verifySlackSignature(
        body,
        headers.get("X-Slack-Signature"),
        headers.get("X-Slack-Request-Timestamp"),
        secret
      );
    case "shopify":
      return verifyShopifySignature(body, headers.get("X-Shopify-Hmac-SHA256"), secret);
    case "generic-hmac":
      const sigHeader = headers.get("X-Hub-Signature") || headers.get("X-Webhook-Signature");
      return verifyGenericHmacSignature(body, sigHeader, secret);
    default:
      return { verified: false, method, reason: "Unknown verification method" };
  }
}
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// whd-src/src/api/webhook.ts
function detectSource(headers) {
  const userAgent = headers.get("User-Agent")?.toLowerCase() || "";
  const contentType = headers.get("Content-Type")?.toLowerCase() || "";
  if (headers.get("Stripe-Signature")) return "stripe";
  if (headers.get("X-GitHub-Event")) return "github";
  if (headers.get("X-Shopify-Topic")) return "shopify";
  if (headers.get("X-Slack-Signature")) return "slack";
  if (headers.get("X-Telegram-Bot-Api-Secret-Token")) return "telegram";
  if (headers.get("Twilio-Signature")) return "twilio";
  if (headers.get("X-Hub-Signature")) return "generic-hmac";
  if (headers.get("X-Webhook-Signature")) return "generic-signature";
  if (userAgent.includes("stripe")) return "stripe";
  if (userAgent.includes("github")) return "github";
  if (userAgent.includes("shopify")) return "shopify";
  if (userAgent.includes("slack")) return "slack";
  if (userAgent.includes("twilio")) return "twilio";
  if (userAgent.includes("paypal")) return "paypal";
  if (userAgent.includes("square")) return "square";
  if (userAgent.includes("sendgrid")) return "sendgrid";
  if (userAgent.includes("mailgun")) return "mailgun";
  if (userAgent.includes("twilio")) return "twilio";
  if (contentType.includes("application/json")) {
  }
  return "unknown";
}
function headersToJson(headers) {
  const obj = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return JSON.stringify(obj);
}
function paramsToJson(params) {
  const obj = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return JSON.stringify(obj);
}
async function receiveWebhook(request, path, db) {
  const endpoint = await getEndpointByPath(db, `/hook/${path}`);
  if (!endpoint) {
    return { success: false, error: "Endpoint not found" };
  }
  if (!endpoint.is_active) {
    return { success: false, error: "Endpoint is inactive" };
  }
  try {
    const method = request.method;
    const headers = request.headers;
    const url = new URL(request.url);
    const queryParams = url.searchParams;
    const contentType = headers.get("Content-Type");
    let body = null;
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await request.text();
        if (body.length > 1024 * 1024) {
          body = body.substring(0, 1024 * 1024) + "... [truncated]";
        }
      } catch {
        body = "[Failed to read body]";
      }
    }
    const source = detectSource(headers);
    let sourceVerified = false;
    const verificationMethod = endpoint.verification_method;
    const verificationSecret = endpoint.verification_secret;
    if (verificationMethod && verificationMethod !== "none" && verificationSecret && body) {
      try {
        const result = await verifyWebhookSignature(
          body,
          headers,
          verificationMethod,
          verificationSecret
        );
        sourceVerified = result.verified;
        console.log(`Signature verification: ${result.verified ? "passed" : "failed"}`, result.reason);
      } catch (err) {
        console.error("Signature verification error:", err);
        sourceVerified = false;
      }
    }
    const webhookId = cuid();
    await createWebhook(db, {
      id: webhookId,
      endpoint_id: endpoint.id,
      method,
      source,
      source_verified: sourceVerified,
      headers: headersToJson(headers),
      body,
      query_params: paramsToJson(queryParams),
      content_type: contentType,
      last_replay_at: null,
      last_replay_status: null,
      last_replay_response: null
    });
    return { success: true, webhookId, sourceVerified };
  } catch (error2) {
    console.error("Error receiving webhook:", error2);
    return { success: false, error: "Internal server error" };
  }
}
async function handleWebhookRequest(request, path, db) {
  const result = await receiveWebhook(request, path, db);
  if (!result.success) {
    console.error("Webhook receive failed:", result.error);
    return new Response(JSON.stringify({ status: "error" }), {
      status: 200,
      // Intentional: don't reveal errors to senders
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({
    status: "captured",
    webhook_id: result.webhookId,
    endpoint: path,
    verified: result.sourceVerified ?? false,
    received_at: (/* @__PURE__ */ new Date()).toISOString()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

// whd-src/src/api/dashboard.ts
init_db();
var PLAN_LIMITS = {
  free: { endpoints: 1 },
  pro: { endpoints: 10 },
  team: { endpoints: 50 }
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function error(message, status = 400) {
  return json({ error: message }, status);
}
function generateEndpointPath() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const path = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `/hook/${path}`;
}
async function handleListEndpoints(request, env) {
  const user = await requireAuth(request, env);
  const endpoints = await getEndpointsByUserId(env.DB, user.id);
  return json({ endpoints });
}
async function handleCreateEndpoint(request, env) {
  const user = await requireAuth(request, env);
  const currentCount = await countEndpointsByUserId(env.DB, user.id);
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  if (currentCount >= limits.endpoints) {
    return error(`Plan limit reached. ${user.plan} plan allows ${limits.endpoints} endpoints.`, 403);
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
  }
  const endpointId = cuid();
  const path = generateEndpointPath();
  const endpoint = await createEndpoint(env.DB, {
    id: endpointId,
    user_id: user.id,
    name: body.name || "Default Endpoint",
    path,
    is_active: true
  });
  return json({ endpoint }, 201);
}
async function handleGetEndpoint(request, env, endpointId) {
  const user = await requireAuth(request, env);
  const endpoint = await getEndpointById(env.DB, endpointId);
  if (!endpoint || endpoint.user_id !== user.id) {
    return error("Endpoint not found", 404);
  }
  return json({ endpoint });
}
async function handleUpdateEndpoint(request, env, endpointId) {
  const user = await requireAuth(request, env);
  const endpoint = await getEndpointById(env.DB, endpointId);
  if (!endpoint || endpoint.user_id !== user.id) {
    return error("Endpoint not found", 404);
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body");
  }
  const validMethods = ["none", "stripe", "github", "slack", "shopify", "generic-hmac"];
  if (body.verification_method && !validMethods.includes(body.verification_method)) {
    return error(`Invalid verification_method. Must be one of: ${validMethods.join(", ")}`);
  }
  const updated = await updateEndpoint(env.DB, endpointId, body);
  return json({ endpoint: updated });
}
async function handleDeleteEndpoint(request, env, endpointId) {
  const user = await requireAuth(request, env);
  const endpoint = await getEndpointById(env.DB, endpointId);
  if (!endpoint || endpoint.user_id !== user.id) {
    return error("Endpoint not found", 404);
  }
  await deleteEndpoint(env.DB, endpointId);
  return json({ success: true });
}
async function handleListWebhooks(request, env, endpointId) {
  const user = await requireAuth(request, env);
  const endpoint = await getEndpointById(env.DB, endpointId);
  if (!endpoint || endpoint.user_id !== user.id) {
    return error("Endpoint not found", 404);
  }
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const source = url.searchParams.get("source") || void 0;
  const [webhooks, total] = await Promise.all([
    getWebhooksByEndpointId(env.DB, endpointId, { limit, offset, source }),
    countWebhooksByEndpointId(env.DB, endpointId, source)
  ]);
  return json({ webhooks, total, limit, offset });
}
async function handleGetWebhook(request, env, webhookId) {
  const user = await requireAuth(request, env);
  const webhook = await getWebhookById(env.DB, webhookId);
  if (!webhook) {
    return error("Webhook not found", 404);
  }
  const endpoint = await getEndpointById(env.DB, webhook.endpoint_id);
  if (!endpoint || endpoint.user_id !== user.id) {
    return error("Webhook not found", 404);
  }
  return json({ webhook });
}
async function handleSearchWebhooks(request, env, endpointId) {
  const user = await requireAuth(request, env);
  const endpoint = await getEndpointById(env.DB, endpointId);
  if (!endpoint || endpoint.user_id !== user.id) {
    return error("Endpoint not found", 404);
  }
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  if (!query) {
    return error("Missing search query (q parameter)");
  }
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const webhooks = await searchWebhooks(env.DB, endpointId, query, { limit, offset });
  return json({ webhooks, query });
}
async function handleReplayWebhook(request, env, webhookId) {
  const user = await requireAuth(request, env);
  const webhook = await getWebhookById(env.DB, webhookId);
  if (!webhook) {
    return error("Webhook not found", 404);
  }
  const endpoint = await getEndpointById(env.DB, webhook.endpoint_id);
  if (!endpoint || endpoint.user_id !== user.id) {
    return error("Webhook not found", 404);
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body");
  }
  if (!body.url) {
    return error("Missing target URL");
  }
  let targetUrl;
  try {
    targetUrl = new URL(body.url);
  } catch {
    return error("Invalid target URL");
  }
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return error("Only HTTP/HTTPS URLs are allowed");
  }
  let headers = {};
  try {
    headers = JSON.parse(webhook.headers);
  } catch {
  }
  const headersToRemove = ["host", "content-length", "cf-connecting-ip", "cf-ipcountry", "x-forwarded-for"];
  for (const h of headersToRemove) {
    delete headers[h.toLowerCase()];
  }
  try {
    const response = await fetch(body.url, {
      method: webhook.method,
      headers,
      body: webhook.method !== "GET" && webhook.method !== "HEAD" ? webhook.body || void 0 : void 0,
      redirect: "follow"
    });
    const responseText = await response.text();
    await updateWebhookReplay(env.DB, webhookId, response.status, responseText);
    return json({
      success: true,
      status: response.status,
      response: responseText.substring(0, 1e4)
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return json({
      success: false,
      error: errorMessage
    }, 500);
  }
}
async function handleGetCurrentUser(request, env) {
  const user = await requireAuth(request, env);
  return json({ user });
}
async function handleHealthCheck() {
  return json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
}

// whd-src/src/index.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
function json2(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...headers }
  });
}
function matchRoute(pathname, pattern) {
  const params = {};
  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) return null;
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (env.ASSETS) {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status === 200) {
          return assetResponse;
        }
      } catch {
      }
    }
    if (!pathname.startsWith("/api/") && !pathname.startsWith("/hook/")) {
      if (env.ASSETS) {
        try {
          const indexResponse = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
          if (indexResponse.status === 200) {
            return indexResponse;
          }
        } catch {
        }
      }
    }
    if (pathname === "/health" || pathname === "/api/health") {
      return handleHealthCheck();
    }
    if (pathname === "/api/auth/github" && request.method === "GET") {
      const state = cuid();
      const redirectUri = `${url.origin}/api/auth/callback`;
      const githubUrl = getGitHubOAuthUrl(env, redirectUri, state);
      const stateCookie = `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
      return new Response(null, {
        status: 302,
        headers: {
          "Location": githubUrl,
          "Set-Cookie": stateCookie
        }
      });
    }
    if (pathname === "/api/auth/callback" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code) {
        return json2({ error: "Missing authorization code" }, 400);
      }
      try {
        const redirectUri = `${url.origin}/api/auth/callback`;
        const { user, sessionId } = await handleOAuthCallback(code, env, redirectUri);
        const cookieHeader = await createSessionCookie(sessionId, env);
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/dashboard",
            "Set-Cookie": cookieHeader
          }
        });
      } catch (error2) {
        console.error("OAuth callback error:", error2);
        return new Response(null, {
          status: 302,
          headers: { "Location": "/?error=auth_failed" }
        });
      }
    }
    if (pathname === "/api/auth/logout" && request.method === "POST") {
      const cookieHeader = await logout(request, env);
      return json2({ success: true }, 200, { "Set-Cookie": cookieHeader });
    }
    if (pathname === "/api/auth/me" && request.method === "GET") {
      return handleGetCurrentUser(request, env);
    }
    const hookMatch = matchRoute(pathname, "/hook/:path");
    if (hookMatch) {
      return handleWebhookRequest(request, hookMatch.path, env.DB);
    }
    if (pathname === "/api/endpoints") {
      if (request.method === "GET") {
        return handleListEndpoints(request, env);
      }
      if (request.method === "POST") {
        return handleCreateEndpoint(request, env);
      }
    }
    let match;
    match = matchRoute(pathname, "/api/endpoints/:id");
    if (match) {
      if (request.method === "GET") {
        return handleGetEndpoint(request, env, match.id);
      }
      if (request.method === "PUT" || request.method === "PATCH") {
        return handleUpdateEndpoint(request, env, match.id);
      }
      if (request.method === "DELETE") {
        return handleDeleteEndpoint(request, env, match.id);
      }
    }
    match = matchRoute(pathname, "/api/endpoints/:endpointId/webhooks");
    if (match && request.method === "GET") {
      return handleListWebhooks(request, env, match.endpointId);
    }
    match = matchRoute(pathname, "/api/endpoints/:endpointId/webhooks/search");
    if (match && request.method === "GET") {
      return handleSearchWebhooks(request, env, match.endpointId);
    }
    match = matchRoute(pathname, "/api/webhooks/:id");
    if (match && request.method === "GET") {
      return handleGetWebhook(request, env, match.id);
    }
    match = matchRoute(pathname, "/api/webhooks/:id/replay");
    if (match && request.method === "POST") {
      return handleReplayWebhook(request, env, match.id);
    }
    if (pathname.startsWith("/api/")) {
      return json2({ error: "Not found" }, 404);
    }
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Webhook Debugger</title>
	<style>
		body { font-family: system-ui, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
		h1 { color: #4F46E5; }
		code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
		.endpoint { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0; }
	</style>
</head>
<body>
	<h1>Webhook Debugger</h1>
	<p>Capture, inspect, and replay webhooks with 90-day history.</p>

	<div class="endpoint">
		<h3>API Endpoints</h3>
		<ul>
			<li><code>GET /api/auth/github</code> - GitHub OAuth login</li>
			<li><code>GET /api/auth/callback</code> - OAuth callback</li>
			<li><code>GET /api/auth/me</code> - Get current user</li>
			<li><code>POST /api/auth/logout</code> - Logout</li>
			<li><code>GET/POST /api/endpoints</code> - List/Create endpoints</li>
			<li><code>GET/PUT/DELETE /api/endpoints/:id</code> - Endpoint CRUD</li>
			<li><code>GET /api/endpoints/:id/webhooks</code> - List webhooks</li>
			<li><code>GET /api/webhooks/:id</code> - Get webhook details</li>
			<li><code>POST /api/webhooks/:id/replay</code> - Replay webhook</li>
		</ul>
	</div>

	<div class="endpoint">
		<h3>Webhook Receiver</h3>
		<p>Send webhooks to: <code>POST /hook/{your-endpoint-path}</code></p>
	</div>

	<p><a href="/api/auth/github">Login with GitHub</a> to get started.</p>
</body>
</html>`,
      {
        headers: { "Content-Type": "text/html" }
      }
    );
  },
  // Scheduled cleanup of old webhooks
  async scheduled(controller, env, ctx) {
    const { cleanupOldWebhooks: cleanupOldWebhooks2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const result = await cleanupOldWebhooks2(env.DB);
    console.log(`Cleanup complete: ${result.freeDeleted} free, ${result.proDeleted} pro webhooks deleted`);
  }
};
export {
  index_default as default
};
