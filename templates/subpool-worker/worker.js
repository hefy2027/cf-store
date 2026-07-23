// src/services/kv.js
var KVService = class {
  static #getKV() {
    const kv = ConfigService.getKV();
    if (!kv) {
      throw new Error("KV namespace is not bound.");
    }
    return kv;
  }
  static async get(key, type = "json") {
    return this.#getKV().get(key, type);
  }
  static async put(key, value, options) {
    return this.#getKV().put(key, value, options);
  }
  static async getGlobalConfig() {
    return this.#getKV().get("config:global", "json");
  }
  static async saveGlobalConfig(config) {
    return this.#getKV().put("config:global", JSON.stringify(config));
  }
  static async getGroup(token) {
    return this.#getKV().get(`group:${token}`, "json");
  }
  static async getAllGroups() {
    const kv = this.#getKV();
    const index = await kv.get("groups:index", "json") || [];
    if (!index || !Array.isArray(index)) return [];
    if (index.length === 0) return [];
    const promises = index.map((token) => this.getGroup(token));
    const groups = await Promise.all(promises);
    return groups.filter(Boolean);
  }
  static async saveGroup(groupData) {
    const kv = this.#getKV();
    const token = groupData.token;
    if (!token) throw new Error("Group token is required.");
    const index = await kv.get("groups:index", "json") || [];
    if (!index.includes(token)) {
      index.push(token);
      await kv.put("groups:index", JSON.stringify(index));
    }
    return kv.put(`group:${token}`, JSON.stringify(groupData));
  }
  static async deleteGroup(token) {
    const kv = this.#getKV();
    let index = await kv.get("groups:index", "json") || [];
    index = index.filter((t2) => t2 !== token);
    await kv.put("groups:index", JSON.stringify(index));
    return kv.delete(`group:${token}`);
  }
};

// src/services/config.js
var DEFAULT_CONFIG = {
  fileName: "subpool-worker",
  subUpdateTime: 4,
  subscriptionInfo: {
    totalTB: 99,
    expireDate: "2099-12-31"
  },
  telegram: {
    enabled: false,
    botToken: "",
    chatId: "",
    logAllAccess: false
  },
  subconverter: {
    url: "",
    protocol: "https",
    configUrl: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"
  },
  failedBan: {
    enabled: false,
    maxAttempts: 5,
    banDuration: 600,
    // 10 minutes
    failedAttemptsTtl: 600
    // 10 minutes
  }
};
var _config = null;
var _env = null;
var _ctx = null;
function deepMerge(target, ...sources) {
  for (const source of sources) {
    if (!source) continue;
    for (const key in source) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return target;
}
var ConfigService = class {
  static async init(env, ctx) {
    _env = env;
    _ctx = ctx;
    const kvConfig = await KVService.getGlobalConfig().catch(() => null) || {};
    _config = deepMerge({}, DEFAULT_CONFIG, kvConfig);
  }
  static get(key) {
    return key ? _config[key] : _config;
  }
  static getKV() {
    if (!_env || !_env.KV) {
      throw new Error("KV namespace is not bound or ConfigService not initialized.");
    }
    return _env.KV;
  }
  static getEnv() {
    return _env;
  }
  static getCtx() {
    return _ctx;
  }
};

// src/utils.js
var FILTER_REGEX_LITERAL_PATTERN = /^\/(.*)\/([a-z]*)$/i;
var REGEXP_ESCAPE_PATTERN = /[.*+?^${}()|[\]\\]/g;
function escapeRegExpLiteral(value) {
  return value.replace(REGEXP_ESCAPE_PATTERN, "\\$&");
}
function warnInvalidFilterRule(logger, rule, error) {
  if (!logger || typeof logger.warn !== "function") {
    return;
  }
  logger.warn("Invalid filter rule skipped", {
    rule,
    error: error instanceof Error ? error.message : String(error)
  });
}
function compileFilterRule(rule, logger) {
  if (typeof rule !== "string" || rule.length === 0) {
    warnInvalidFilterRule(logger, rule, new Error("Rule must be a non-empty string"));
    return null;
  }
  const literalMatch = rule.match(FILTER_REGEX_LITERAL_PATTERN);
  if (literalMatch) {
    const pattern = literalMatch[1];
    const flags = literalMatch[2];
    try {
      const originalRegex = new RegExp(pattern, flags);
      const encodedRegex = new RegExp(encodeURIComponent(pattern), flags);
      return { original: originalRegex, encoded: encodedRegex };
    } catch (error) {
      warnInvalidFilterRule(logger, rule, error);
      return null;
    }
  }
  try {
    const originalRegex = new RegExp(escapeRegExpLiteral(rule));
    const encodedRegex = new RegExp(escapeRegExpLiteral(encodeURIComponent(rule)));
    return { original: originalRegex, encoded: encodedRegex };
  } catch (error) {
    warnInvalidFilterRule(logger, rule, error);
    return null;
  }
}
function applyFilter(content, filterConfig, logger = null) {
  if (!filterConfig || !filterConfig.enabled || !filterConfig.rules || filterConfig.rules.length === 0) {
    return content;
  }
  const regexRules = filterConfig.rules.map((rule) => compileFilterRule(rule, logger)).filter(Boolean);
  if (regexRules.length === 0) {
    return content;
  }
  return content.split("\n").filter((line) => {
    if (!line.trim()) return true;
    return !regexRules.some((ruleSet) => {
      ruleSet.original.lastIndex = 0;
      ruleSet.encoded.lastIndex = 0;
      return ruleSet.original.test(line) || ruleSet.encoded.test(line);
    });
  }).join("\n");
}
function createAssetRequest(request, assetPath = null) {
  const assetUrl = new URL(request.url);
  if (assetPath) {
    assetUrl.pathname = assetPath;
    assetUrl.search = "";
  }
  const headers = new Headers(request.headers);
  headers.delete("if-none-match");
  headers.delete("if-modified-since");
  return new Request(assetUrl.toString(), {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers
  });
}
async function serveAssetResponse(request, assetBinding, assetPath, logger, {
  status = null,
  headers = {},
  notConfiguredMessage = "ASSETS binding is not configured.",
  notFoundMessage = "Static asset not found.",
  fetchFailureMessage = "Failed to fetch static asset",
  logLabel = "asset fetch"
} = {}) {
  const hasIfNoneMatch = request.headers.has("if-none-match");
  const hasIfModifiedSince = request.headers.has("if-modified-since");
  if (hasIfNoneMatch || hasIfModifiedSince) {
    logger.debug(`Stripping conditional headers before ${logLabel}`, {
      assetPath,
      requestedStatus: status,
      hasIfNoneMatch,
      hasIfModifiedSince
    });
  }
  if (!assetBinding) {
    logger.error("ASSETS binding is not configured.", { assetPath, logLabel });
    return response.normal(notConfiguredMessage, 500, headers);
  }
  try {
    const assetRequest = createAssetRequest(request, assetPath);
    const assetResponse = await assetBinding.fetch(assetRequest);
    const responseStatus = status ?? assetResponse.status;
    logger.debug("Fetched asset response", {
      assetPath,
      assetStatus: assetResponse.status,
      finalStatus: responseStatus,
      contentType: assetResponse.headers.get("Content-Type"),
      logLabel
    });
    if (!assetResponse.ok) {
      logger.error("Asset fetch failed", { assetPath, assetStatus: assetResponse.status, logLabel });
      return response.normal(notFoundMessage, 500, headers);
    }
    return response.fromAsset(assetResponse, responseStatus, headers);
  } catch (err) {
    logger.error(err, { customMessage: fetchFailureMessage, assetPath, logLabel });
    return response.normal("Static asset unavailable.", 500, headers);
  }
}
var response = {
  /**
   * 通用响应方法，使用指定的 content-type
   * @param {any} body - 响应体
   * @param {number} [status=200] - HTTP 状态码
   * @param {HeadersInit} [headers={}] - 响应头
   * @param {string} [contentType='text/plain'] - 内容类型
   * @returns {Response} 返回 Response 对象
   */
  normal(body, status = 200, headers = {}, contentType = "text/html; charset=utf-8") {
    const headersObj = this.buildHeaders(headers, contentType);
    return new Response(body, { status, headers: headersObj });
  },
  fromAsset(assetResponse, status = assetResponse.status, headers = {}) {
    const contentType = assetResponse.headers.get("Content-Type") || "application/octet-stream";
    const headersObj = new Headers(assetResponse.headers);
    const secureHeaders = this.buildHeaders(headers, contentType);
    secureHeaders.forEach((value, key) => {
      headersObj.set(key, value);
    });
    return new Response(assetResponse.body, { status, headers: headersObj });
  },
  /**
   * JSON 响应方法，强制使用 application/json，忽略传入的 contentType
   * @param {any} body - 响应体（会被序列化为 JSON 字符串）
   * @param {number} [status=200] - HTTP 状态码
   * @param {HeadersInit} [headers={}] - 响应头
   * @param {any} [contentType] - 被忽略的内容类型参数（仅为保持参数一致性）
   * @returns {Response} 返回 JSON 格式的 Response 对象
   */
  json(body, status = 200, headers = {}, _contentType) {
    const headersObj = this.buildHeaders(headers, "application/json");
    const jsonBody = body !== void 0 ? JSON.stringify(body) : "null";
    return new Response(jsonBody, { status, headers: headersObj });
  },
  buildHeaders(headers = {}, contentType) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ];
    const headersObj = new Headers({
      ...headers,
      "Content-Type": contentType,
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "fullscreen=(self), camera=(), microphone=(), payment=(self), geolocation=(self)",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "upgrade-insecure-requests": "1",
      "Content-Security-Policy": csp.join("; ")
    });
    return headersObj;
  }
};
function isValidBase64(str) {
  if (typeof str !== "string") return false;
  if (str.length === 0) return true;
  const cleanStr = str.replace(/\s+/g, "");
  if (cleanStr.length === 0) return false;
  if (cleanStr.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/_-]+={0,2}$/.test(cleanStr);
}
function safeBtoa(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// src/services/auth.js
var CONFIG = {
  COOKIE_NAME: "auth_token",
  DEFAULT_EXPIRATION: 8 * 60 * 60,
  // 8小时
  ALGORITHM: "HS256",
  HASH: "SHA-256",
  COOKIE_PATH: "/admin",
  TOKEN_ISSUER: "web-app",
  TOKEN_AUDIENCE: "web-app-users"
};
var textEncoder = new TextEncoder();
function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return atob(str);
}
async function getKey(secret) {
  if (!secret || typeof secret !== "string") {
    throw new Error("Invalid secret");
  }
  const keyData = textEncoder.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: CONFIG.HASH } },
    false,
    ["sign", "verify"]
  );
}
async function createJwt(secret, payload = {}, logger) {
  if (!secret) {
    logger.fatal("Secret is required to create JWT.");
    throw new Error("Secret is required to create JWT.");
  }
  try {
    const key = await getKey(secret);
    const header = { alg: CONFIG.ALGORITHM, typ: "JWT" };
    const now = Math.floor(Date.now() / 1e3);
    const jwtPayload = {
      ...payload,
      iat: now,
      // 签发时间
      exp: now + CONFIG.DEFAULT_EXPIRATION,
      // 过期时间
      iss: CONFIG.TOKEN_ISSUER,
      // 签发者
      aud: CONFIG.TOKEN_AUDIENCE
      // 受众
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
    const partialToken = `${encodedHeader}.${encodedPayload}`;
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      textEncoder.encode(partialToken)
    );
    const signature = base64UrlEncode(
      String.fromCharCode(...new Uint8Array(signatureBuffer))
    );
    return `${partialToken}.${signature}`;
  } catch (err) {
    logger.error(err, { customMessage: "Failed to create JWT" });
    throw new Error("Failed to create JWT", { cause: err });
  }
}
async function verifyJwt(secret, token, logger) {
  if (!secret || !token) {
    logger.warn("Secret or token is missing for JWT verification.");
    return false;
  }
  try {
    const key = await getKey(secret);
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) {
      logger.error("JWT verification error: malformed token");
      return false;
    }
    const signatureBuffer = Uint8Array.from(base64UrlDecode(signature), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      textEncoder.encode(`${header}.${payload}`)
    );
    if (!isValid) {
      console.error("JWT verification error: invalid signature");
      return false;
    }
    const payloadData = JSON.parse(base64UrlDecode(payload));
    const now = Math.floor(Date.now() / 1e3);
    if (payloadData.exp && payloadData.exp < now) {
      logger.error("JWT verification error: token expired");
      return false;
    }
    if (payloadData.iat && payloadData.iat > now) {
      logger.error("JWT verification error: token issued in the future");
      return false;
    }
    if (payloadData.iss !== CONFIG.TOKEN_ISSUER || payloadData.aud !== CONFIG.TOKEN_AUDIENCE) {
      logger.error("JWT verification error: invalid issuer or audience");
      return false;
    }
    return payloadData;
  } catch (err) {
    logger.error("JWT verification error:", err);
    return false;
  }
}
function getAuthCookie(request, logger) {
  if (!request || !request.headers) {
    logger.error("Invalid request object");
    return null;
  }
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  try {
    const cookies = cookieHeader.split(";");
    const authCookie = cookies.find((c) => c.trim().startsWith(`${CONFIG.COOKIE_NAME}=`));
    return authCookie ? authCookie.split("=")[1].trim() : null;
  } catch (err) {
    logger.error(err, { customMessage: "Error parsing cookies" });
    return null;
  }
}
function createAuthCookie(token, maxAge, options = {}) {
  if (!token || typeof maxAge !== "number" || isNaN(maxAge)) {
    throw new Error("Token and maxAge are required");
  }
  const {
    path = CONFIG.COOKIE_PATH,
    domain = "",
    sameSite = "Strict"
  } = options;
  const cookieString = [
    `${CONFIG.COOKIE_NAME}=${token}`,
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "Secure",
    "SameSite=" + sameSite,
    ...domain ? [`Domain=${domain}`] : []
  ].join("; ");
  return cookieString;
}
async function refreshJwt(secret, token, logger) {
  if (!secret || !token) {
    logger.error("JWT refresh error: missing secret or token");
    return null;
  }
  try {
    const payload = await verifyJwt(secret, token, logger);
    if (!payload) {
      return null;
    }
    const originalPayload = { ...payload };
    delete originalPayload.iat;
    delete originalPayload.exp;
    return await createJwt(secret, originalPayload, logger);
  } catch (err) {
    logger.error(err, { customMessage: "JWT refresh error" });
    return null;
  }
}

// src/repositories/admin/config-repository.js
async function getGlobalConfig() {
  return KVService.getGlobalConfig();
}
async function saveGlobalConfig(config) {
  return KVService.saveGlobalConfig(config);
}

// src/services/admin/credential-service.js
var LEGACY_PASSWORD_HASH_ALGORITHM = "SHA-256";
var PASSWORD_DERIVATION_ALGORITHM = "PBKDF2";
var PASSWORD_DERIVATION_HASH = "SHA-256";
var PASSWORD_SALT_BYTE_LENGTH = 16;
var PBKDF2_MAX_ALLOWED_ITERATIONS = 1e5;
var PASSWORD_HASH_ITERATIONS = PBKDF2_MAX_ALLOWED_ITERATIONS;
var PASSWORD_HASH_BIT_LENGTH = 256;
var textEncoder2 = new TextEncoder();
function parseAdminPasswordHashIterations(value) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsedValue = Number.parseInt(value.trim(), 10);
    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }
  return 0;
}
function hasConfiguredLegacyAdminPassword(config) {
  const adminPassword = config?.adminPassword;
  return typeof adminPassword === "string" && adminPassword.trim().length > 0;
}
function hasConfiguredHashedAdminPassword(config) {
  const adminPasswordHash = config?.adminPasswordHash;
  const adminPasswordSalt = config?.adminPasswordSalt;
  return typeof adminPasswordHash === "string" && adminPasswordHash.trim().length > 0 && typeof adminPasswordSalt === "string" && adminPasswordSalt.trim().length > 0;
}
function hasConfiguredPbkdf2AdminPassword(config) {
  const adminPasswordHashIterations = parseAdminPasswordHashIterations(config?.adminPasswordHashIterations);
  return hasConfiguredHashedAdminPassword(config) && adminPasswordHashIterations > 0;
}
function hasConfiguredLegacySha256AdminPassword(config) {
  return hasConfiguredHashedAdminPassword(config) && !hasConfiguredPbkdf2AdminPassword(config);
}
function normalizePersistedAdminCredentialFields(config) {
  if (!config || typeof config !== "object") {
    return config;
  }
  if (hasConfiguredPbkdf2AdminPassword(config)) {
    config.adminPassword = "";
    config.adminPasswordHashIterations = parseAdminPasswordHashIterations(config.adminPasswordHashIterations);
    return config;
  }
  if (hasConfiguredLegacyAdminPassword(config)) {
    delete config.adminPasswordHash;
    delete config.adminPasswordSalt;
    delete config.adminPasswordHashIterations;
    return config;
  }
  if (hasConfiguredLegacySha256AdminPassword(config)) {
    config.adminPassword = "";
    delete config.adminPasswordHashIterations;
    return config;
  }
  delete config.adminPasswordHash;
  delete config.adminPasswordSalt;
  delete config.adminPasswordHashIterations;
  return config;
}
function hasConfiguredAdminPassword(config) {
  return hasConfiguredPbkdf2AdminPassword(config) || hasConfiguredLegacyAdminPassword(config) || hasConfiguredLegacySha256AdminPassword(config);
}
function generateRandomHex(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function generatePasswordSalt(byteLength = PASSWORD_SALT_BYTE_LENGTH) {
  return generateRandomHex(byteLength);
}
function normalizeAdminCredentials(config) {
  return {
    adminPassword: typeof config?.adminPassword === "string" ? config.adminPassword.trim() : "",
    adminPasswordHash: typeof config?.adminPasswordHash === "string" ? config.adminPasswordHash.trim() : "",
    adminPasswordSalt: typeof config?.adminPasswordSalt === "string" ? config.adminPasswordSalt.trim() : "",
    adminPasswordHashIterations: parseAdminPasswordHashIterations(config?.adminPasswordHashIterations)
  };
}
function getRuntimeAdminCredentials() {
  return normalizeAdminCredentials({
    adminPassword: ConfigService.get("adminPassword"),
    adminPasswordHash: ConfigService.get("adminPasswordHash"),
    adminPasswordSalt: ConfigService.get("adminPasswordSalt"),
    adminPasswordHashIterations: ConfigService.get("adminPasswordHashIterations")
  });
}
async function hashAdminPasswordWithLegacySha256(password, salt) {
  const normalizedPassword = typeof password === "string" ? password.trim() : "";
  const normalizedSalt = typeof salt === "string" ? salt.trim() : "";
  if (!normalizedPassword || !normalizedSalt) {
    return "";
  }
  const hashBuffer = await crypto.subtle.digest(
    LEGACY_PASSWORD_HASH_ALGORITHM,
    textEncoder2.encode(`${normalizedSalt}:${normalizedPassword}`)
  );
  return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function hashAdminPasswordWithPbkdf2(password, salt, iterations = PASSWORD_HASH_ITERATIONS) {
  const normalizedPassword = typeof password === "string" ? password.trim() : "";
  const normalizedSalt = typeof salt === "string" ? salt.trim() : "";
  const normalizedIterations = parseAdminPasswordHashIterations(iterations);
  if (!normalizedPassword || !normalizedSalt || normalizedIterations <= 0) {
    return "";
  }
  if (normalizedIterations > PBKDF2_MAX_ALLOWED_ITERATIONS) {
    return "";
  }
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder2.encode(normalizedPassword),
    { name: PASSWORD_DERIVATION_ALGORITHM },
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: PASSWORD_DERIVATION_ALGORITHM,
      salt: textEncoder2.encode(normalizedSalt),
      iterations: normalizedIterations,
      hash: PASSWORD_DERIVATION_HASH
    },
    keyMaterial,
    PASSWORD_HASH_BIT_LENGTH
  );
  return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function buildAdminPasswordCredentials(password) {
  const normalizedPassword = typeof password === "string" ? password.trim() : "";
  if (!normalizedPassword) {
    throw new Error("Admin password is required.");
  }
  const adminPasswordSalt = generatePasswordSalt();
  const adminPasswordHashIterations = PASSWORD_HASH_ITERATIONS;
  const adminPasswordHash = await hashAdminPasswordWithPbkdf2(
    normalizedPassword,
    adminPasswordSalt,
    adminPasswordHashIterations
  );
  if (!adminPasswordHash) {
    throw new Error("Failed to generate admin password hash.");
  }
  return {
    adminPasswordHash,
    adminPasswordSalt,
    adminPasswordHashIterations,
    adminPassword: ""
  };
}
function constantTimeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
async function isValidAdminPassword(password, config) {
  const normalizedPassword = typeof password === "string" ? password.trim() : "";
  if (!normalizedPassword) {
    return false;
  }
  const credentials = normalizeAdminCredentials(config);
  if (!hasConfiguredPbkdf2AdminPassword(credentials)) {
    return false;
  }
  const computedHash = await hashAdminPasswordWithPbkdf2(
    normalizedPassword,
    credentials.adminPasswordSalt,
    credentials.adminPasswordHashIterations
  );
  return Boolean(computedHash) && constantTimeCompare(computedHash, credentials.adminPasswordHash);
}
async function persistMigratedAdminPassword(oldConfig, password, logger, logMessage) {
  const passwordCredentials = await buildAdminPasswordCredentials(password);
  const mergedConfig = deepMerge({}, oldConfig, passwordCredentials);
  await saveGlobalConfig(mergedConfig);
  await ConfigService.init(ConfigService.getEnv(), ConfigService.getCtx());
  logger.warn(logMessage, {}, { notify: true });
}
async function migrateAdminPasswordStorageIfNeeded({ logger, loginPassword = "" }) {
  const runtimeCredentials = getRuntimeAdminCredentials();
  if (hasConfiguredPbkdf2AdminPassword(runtimeCredentials)) {
    return;
  }
  const oldConfig = await getGlobalConfig() || {};
  const storedCredentials = normalizeAdminCredentials(oldConfig);
  if (hasConfiguredPbkdf2AdminPassword(storedCredentials)) {
    await ConfigService.init(ConfigService.getEnv(), ConfigService.getCtx());
    return;
  }
  if (hasConfiguredLegacyAdminPassword(storedCredentials)) {
    await persistMigratedAdminPassword(
      oldConfig,
      storedCredentials.adminPassword,
      logger,
      "Legacy plaintext admin password storage upgraded to PBKDF2 hash."
    );
    return;
  }
  if (!hasConfiguredLegacySha256AdminPassword(storedCredentials)) {
    return;
  }
  const normalizedLoginPassword = typeof loginPassword === "string" ? loginPassword.trim() : "";
  if (!normalizedLoginPassword) {
    return;
  }
  const legacyHash = await hashAdminPasswordWithLegacySha256(
    normalizedLoginPassword,
    storedCredentials.adminPasswordSalt
  );
  if (!legacyHash || !constantTimeCompare(legacyHash, storedCredentials.adminPasswordHash)) {
    return;
  }
  await persistMigratedAdminPassword(
    oldConfig,
    normalizedLoginPassword,
    logger,
    "Legacy SHA-256 admin password storage upgraded to PBKDF2 hash."
  );
}

// src/services/admin/session-service.js
function hasConfiguredJwtSecret(config) {
  const jwtSecret = config?.jwtSecret;
  return typeof jwtSecret === "string" && jwtSecret.trim().length > 0;
}
function getJwtSecretFromConfig() {
  const jwtSecret = ConfigService.get("jwtSecret");
  return typeof jwtSecret === "string" ? jwtSecret.trim() : "";
}
function generateJwtSecret(byteLength = 48) {
  return generateRandomHex(byteLength);
}
function isAdminInitialized() {
  return hasConfiguredAdminPassword(getRuntimeAdminCredentials());
}
async function getOrCreateJwtSecretForInitializedAdmin(logger) {
  const currentJwtSecret = getJwtSecretFromConfig();
  if (currentJwtSecret) {
    return currentJwtSecret;
  }
  if (!isAdminInitialized()) {
    return "";
  }
  const oldConfig = await getGlobalConfig() || {};
  if (hasConfiguredJwtSecret(oldConfig)) {
    await ConfigService.init(ConfigService.getEnv(), ConfigService.getCtx());
    return getJwtSecretFromConfig();
  }
  const nextJwtSecret = generateJwtSecret();
  const mergedConfig = deepMerge({}, oldConfig, { jwtSecret: nextJwtSecret });
  await saveGlobalConfig(mergedConfig);
  const latestConfig = await getGlobalConfig() || {};
  if (!hasConfiguredJwtSecret(latestConfig)) {
    logger.fatal("JWT secret regeneration failed for initialized admin.");
    return "";
  }
  await ConfigService.init(ConfigService.getEnv(), ConfigService.getCtx());
  logger.warn("JWT secret was missing and has been regenerated for initialized admin.", {}, { notify: true });
  return getJwtSecretFromConfig();
}

// src/repositories/admin/login-attempt-repository.js
function getFailedAttemptsKey(ip) {
  return `failedAttempts::${ip}`;
}
function getBannedKey(ip) {
  return `banned::${ip}`;
}
async function getFailedAttempts(ip) {
  return KVService.get(getFailedAttemptsKey(ip));
}
async function saveFailedAttempts(ip, attempts, ttlSeconds) {
  return KVService.put(getFailedAttemptsKey(ip), attempts, { expirationTtl: ttlSeconds });
}
async function getBannedState(ip) {
  return KVService.get(getBannedKey(ip));
}
async function saveBannedState(ip, value, ttlSeconds) {
  return KVService.put(getBannedKey(ip), value, { expirationTtl: ttlSeconds });
}

// src/repositories/admin/init-lock-repository.js
var INIT_LOCK_KEY = "admin:init:lock";
async function getInitLock() {
  return KVService.get(INIT_LOCK_KEY);
}
async function saveInitLock(lockPayload, ttlSeconds) {
  return KVService.put(INIT_LOCK_KEY, JSON.stringify(lockPayload), { expirationTtl: ttlSeconds });
}

// node_modules/itty-router/index.mjs
var t = ({ base: e = "", routes: t2 = [], ...o2 } = {}) => ({ __proto__: new Proxy({}, { get: (o3, r2, a, s) => (o4, ...n) => t2.push([r2.toUpperCase?.(), RegExp(`^${(s = (e + o4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>[^]+))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), n, s]) && a }), routes: t2, ...o2, async fetch(e2, ...r2) {
  let a, s, n = new URL(e2.url), c = e2.query = { __proto__: null };
  for (let [e3, t3] of n.searchParams) c[e3] = c[e3] ? [].concat(c[e3], t3) : t3;
  e: try {
    for (let t3 of o2.before || []) if (null != (a = await t3(e2.proxy ?? e2, ...r2))) break e;
    t: for (let [o3, c2, l, i] of t2) if ((o3 == e2.method || "ALL" == o3) && (s = n.pathname.match(c2))) {
      e2.params = s.groups || {}, e2.route = i;
      for (let t3 of l) if (null != (a = await t3(e2.proxy ?? e2, ...r2))) break t;
    }
  } catch (t3) {
    if (!o2.catch) throw t3;
    a = await o2.catch(t3, e2.proxy ?? e2, ...r2);
  }
  try {
    for (let t3 of o2.finally || []) a = await t3(a, e2.proxy ?? e2, ...r2) ?? a;
  } catch (t3) {
    if (!o2.catch) throw t3;
    a = await o2.catch(t3, e2.proxy ?? e2, ...r2);
  }
  return a;
} });
var o = (e = "text/plain; charset=utf-8", t2) => (o2, r2 = {}) => {
  if (void 0 === o2 || o2 instanceof Response) return o2;
  const a = new Response(t2?.(o2) ?? o2, r2.url ? void 0 : r2);
  return a.headers.set("content-type", e), a;
};
var r = o("application/json; charset=utf-8", JSON.stringify);
var p = o("text/plain; charset=utf-8", String);
var f = o("text/html");
var u = o("image/jpeg");
var h = o("image/png");
var g = o("image/webp");

// src/handlers/admin/public-controller.js
var INIT_LOCK_TTL_SECONDS = 60;
var INIT_LOCK_MAX_RETRIES = 5;
var INIT_LOCK_RETRY_DELAY_MS = 120;
function isAdminInitialized2() {
  return hasConfiguredAdminPassword(getRuntimeAdminCredentials());
}
function isInitSecretConfigured() {
  const initSecret = ConfigService.getEnv().INIT_SECRET;
  return typeof initSecret === "string" && initSecret.trim().length > 0;
}
function getRequestInitSecret(request, payload) {
  const headerSecret = request.headers.get("X-Init-Secret");
  if (typeof headerSecret === "string" && headerSecret.trim()) {
    return headerSecret.trim();
  }
  return typeof payload?.initSecret === "string" ? payload.initSecret.trim() : "";
}
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function acquireInitializationLock(lockOwner, logger) {
  for (let attempt = 0; attempt < INIT_LOCK_MAX_RETRIES; attempt += 1) {
    const now = Date.now();
    const existingLock = await getInitLock();
    if (!existingLock || typeof existingLock.expiresAt !== "number" || existingLock.expiresAt <= now) {
      const lockPayload = { owner: lockOwner, expiresAt: now + INIT_LOCK_TTL_SECONDS * 1e3 };
      await saveInitLock(lockPayload, INIT_LOCK_TTL_SECONDS);
      const confirmedLock = await getInitLock();
      if (confirmedLock?.owner === lockOwner) {
        return true;
      }
    }
    if (attempt < INIT_LOCK_MAX_RETRIES - 1) {
      await wait(INIT_LOCK_RETRY_DELAY_MS);
    }
  }
  logger.warn("Failed to acquire admin initialization lock due to concurrent setup attempts.");
  return false;
}
async function releaseInitializationLock(lockOwner, logger) {
  try {
    const existingLock = await getInitLock();
    if (existingLock?.owner === lockOwner) {
      await saveInitLock({ owner: "released", releasedAt: Date.now() }, 1);
    }
  } catch (err) {
    logger.error(err, { customMessage: "Failed to release admin initialization lock" });
  }
}
async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
function getLoginRequestIp(request) {
  if (!request || !request.headers) {
    return "unknown";
  }
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
}
async function getBlockedLoginResponse(request, failedBan, logger) {
  if (!failedBan?.enabled) {
    return null;
  }
  const ip = getLoginRequestIp(request);
  const banned = await getBannedState(ip);
  if (banned) {
    logger.warn("Banned IP attempted login", {}, { notify: true });
    return response.json({ error: "Too many failed attempts, please try again later." }, 429);
  }
  return null;
}
async function recordFailedLoginAttempt(request, failedBan, logger) {
  if (!failedBan?.enabled) {
    return null;
  }
  const ip = getLoginRequestIp(request);
  const attempts = await getFailedAttempts(ip) || 0;
  const nextAttempts = attempts + 1;
  await saveFailedAttempts(ip, nextAttempts, failedBan.failedAttemptsTtl);
  if (nextAttempts >= failedBan.maxAttempts) {
    await saveBannedState(ip, true, failedBan.banDuration);
    logger.warn("Banned IP attempted login", {}, { notify: true });
    return response.json({ error: "Too many failed attempts, please try again later." }, 429);
  }
  return null;
}
async function handleLogin(request, logger) {
  const payload = await readJsonBody(request);
  const password = typeof payload?.password === "string" ? payload.password.trim() : "";
  const jwtSecret = await getOrCreateJwtSecretForInitializedAdmin(logger);
  const failedBan = ConfigService.get("failedBan");
  if (!isAdminInitialized2()) {
    logger.warn("Login attempted before admin initialization.");
    return response.json({ error: "Admin is not initialized. Please complete initial setup first." }, 403);
  }
  if (!jwtSecret) {
    logger.fatal("JWT secret is not set on server.");
    return response.json({ error: "JWT secret is not set on server." }, 500);
  }
  if (!password) {
    return response.json({ error: "Password is required." }, 400);
  }
  const blockedLoginResponse = await getBlockedLoginResponse(request, failedBan, logger);
  if (blockedLoginResponse) {
    return blockedLoginResponse;
  }
  let passwordMatched;
  try {
    await migrateAdminPasswordStorageIfNeeded({ logger, loginPassword: password });
    const adminCredentials = getRuntimeAdminCredentials();
    passwordMatched = await isValidAdminPassword(password, adminCredentials);
  } catch (err) {
    logger.error(err, { customMessage: "Failed to validate admin password hash during login." });
    return response.json({ error: "Failed to validate password." }, 500);
  }
  if (passwordMatched) {
    const token = await createJwt(jwtSecret, {}, logger);
    const cookie = createAuthCookie(token, 8 * 60 * 60);
    logger.info("Admin logged in", {}, { notify: true });
    return response.json({ success: true }, 200, { "Set-Cookie": cookie });
  }
  const failedAttemptResponse = await recordFailedLoginAttempt(request, failedBan, logger);
  if (failedAttemptResponse) {
    return failedAttemptResponse;
  }
  logger.warn("Admin login attempt failed", {}, { notify: true });
  return response.json({ error: "Invalid password" }, 401);
}
async function handleInitialSetup(request, logger) {
  if (isAdminInitialized2()) {
    logger.warn("Admin initialization attempted after setup is already complete.");
    return response.json({ error: "Admin is already initialized." }, 409);
  }
  if (!isInitSecretConfigured()) {
    logger.fatal("INIT_SECRET is not set on server.");
    return response.json({ error: "INIT_SECRET is not set on server." }, 500);
  }
  const payload = await readJsonBody(request);
  const expectedInitSecret = ConfigService.getEnv().INIT_SECRET.trim();
  const initSecretInput = getRequestInitSecret(request, payload);
  if (!initSecretInput) {
    return response.json({ error: "Initialization secret is required." }, 401);
  }
  if (!constantTimeCompare(initSecretInput, expectedInitSecret)) {
    logger.warn("Admin initialization rejected due to invalid initialization secret.");
    return response.json({ error: "Invalid initialization secret." }, 401);
  }
  const password = typeof payload?.password === "string" ? payload.password.trim() : "";
  const confirmPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword.trim() : "";
  if (!password || password.length < 6) {
    return response.json({ error: "Password must be at least 6 characters." }, 400);
  }
  if (!confirmPassword) {
    return response.json({ error: "Please confirm your password." }, 400);
  }
  if (password !== confirmPassword) {
    return response.json({ error: "Passwords do not match." }, 400);
  }
  const lockOwner = crypto.randomUUID();
  const lockAcquired = await acquireInitializationLock(lockOwner, logger);
  if (!lockAcquired) {
    return response.json({ error: "Initialization is already in progress. Please try again shortly." }, 409);
  }
  try {
    const oldConfig = await getGlobalConfig() || {};
    if (hasConfiguredAdminPassword(oldConfig)) {
      return response.json({ error: "Admin is already initialized." }, 409);
    }
    const nextJwtSecret = generateJwtSecret();
    let passwordCredentials;
    try {
      passwordCredentials = await buildAdminPasswordCredentials(password);
    } catch (err) {
      logger.error(err, { customMessage: "Failed to hash admin password during initialization." });
      return response.json({ error: "Failed to initialize admin credentials." }, 500);
    }
    const mergedConfig = deepMerge({}, oldConfig, {
      ...passwordCredentials,
      jwtSecret: nextJwtSecret
    });
    await saveGlobalConfig(mergedConfig);
    const latestConfig = await getGlobalConfig() || {};
    if (!hasConfiguredPbkdf2AdminPassword(latestConfig) || latestConfig.adminPasswordHash !== passwordCredentials.adminPasswordHash || latestConfig.adminPasswordSalt !== passwordCredentials.adminPasswordSalt || parseAdminPasswordHashIterations(latestConfig.adminPasswordHashIterations) !== passwordCredentials.adminPasswordHashIterations || !hasConfiguredJwtSecret(latestConfig) || latestConfig.jwtSecret !== nextJwtSecret) {
      logger.warn("Admin initialization conflict detected after config write.", {}, { notify: true });
      return response.json({ error: "Initialization conflict detected. Please retry." }, 409);
    }
    await ConfigService.init(ConfigService.getEnv(), ConfigService.getCtx());
    const jwtSecret = getJwtSecretFromConfig();
    if (!jwtSecret) {
      logger.fatal("JWT secret is missing after initialization.");
      return response.json({ error: "JWT secret is missing after initialization." }, 500);
    }
    const token = await createJwt(jwtSecret, {}, logger);
    const cookie = createAuthCookie(token, 8 * 60 * 60);
    logger.warn("Admin initial password configured.", {}, { notify: true });
    return response.json({ success: true }, 200, { "Set-Cookie": cookie });
  } finally {
    await releaseInitializationLock(lockOwner, logger);
  }
}
async function handlePublicAdminApiRequest(request, logger, {
  initialized,
  initSecretConfigured
}) {
  const router = t();
  router.get("/admin/api/init/status", () => response.json({ initialized, initSecretConfigured }, 200));
  router.post("/admin/api/init", () => handleInitialSetup(request, logger));
  router.post("/admin/api/login", () => handleLogin(request, logger));
  return router.fetch(request);
}

// src/services/group-token.js
var GROUP_TOKEN_MAX_LENGTH = 128;
function normalizeGroupToken(token) {
  return typeof token === "string" ? token.trim() : "";
}
function isValidGroupToken(token) {
  return Boolean(token) && token.length <= GROUP_TOKEN_MAX_LENGTH && !token.includes("/");
}

// src/repositories/admin/group-repository.js
async function getGroup(token) {
  return KVService.getGroup(token);
}
async function getAllGroups() {
  return KVService.getAllGroups();
}
async function saveGroup(groupData) {
  return KVService.saveGroup(groupData);
}
async function deleteGroup(token) {
  return KVService.deleteGroup(token);
}

// src/services/admin/import-export-service.js
var ADMIN_DATA_SCHEMA_VERSION = 1;
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function sanitizeConfigForResponse(config) {
  const safeConfig = { ...config || {} };
  delete safeConfig.adminPassword;
  delete safeConfig.adminPasswordHash;
  delete safeConfig.adminPasswordSalt;
  delete safeConfig.adminPasswordHashIterations;
  delete safeConfig.jwtSecret;
  delete safeConfig.blockBots;
  return safeConfig;
}
function sanitizeConfigForImport(config) {
  const sanitizedConfig = { ...config || {} };
  delete sanitizedConfig.adminPassword;
  delete sanitizedConfig.adminPasswordHash;
  delete sanitizedConfig.adminPasswordSalt;
  delete sanitizedConfig.adminPasswordHashIterations;
  delete sanitizedConfig.jwtSecret;
  delete sanitizedConfig.blockBots;
  return sanitizedConfig;
}
function normalizeGroupFilterForImport(filter, groupIndex) {
  if (filter === void 0) {
    return {
      enabled: false,
      rules: []
    };
  }
  if (!isPlainObject(filter)) {
    throw new Error(`Invalid filter for group at index ${groupIndex}.`);
  }
  const rawRules = filter.rules;
  if (rawRules !== void 0 && !Array.isArray(rawRules)) {
    throw new Error(`Invalid filter rules for group at index ${groupIndex}.`);
  }
  const normalizedRules = (rawRules || []).map((rule, ruleIndex) => {
    if (typeof rule !== "string") {
      throw new Error(`Invalid filter rule at group index ${groupIndex}, rule index ${ruleIndex}.`);
    }
    return rule;
  });
  return deepMerge({}, filter, {
    enabled: Boolean(filter.enabled),
    rules: normalizedRules
  });
}
function normalizeGroupForImport(rawGroup, groupIndex) {
  if (!isPlainObject(rawGroup)) {
    throw new Error(`Invalid group at index ${groupIndex}.`);
  }
  const name = typeof rawGroup.name === "string" ? rawGroup.name.trim() : "";
  const token = normalizeGroupToken(rawGroup.token);
  if (!name) {
    throw new Error(`Group name is required at index ${groupIndex}.`);
  }
  if (!isValidGroupToken(token)) {
    throw new Error(`Invalid token for group at index ${groupIndex}.`);
  }
  const nodes = typeof rawGroup.nodes === "string" ? rawGroup.nodes : "";
  return deepMerge({}, rawGroup, {
    name,
    token,
    nodes,
    allowChinaAccess: Boolean(rawGroup.allowChinaAccess),
    filter: normalizeGroupFilterForImport(rawGroup.filter, groupIndex)
  });
}
function normalizeImportPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new Error("Invalid import payload. Expected a JSON object.");
  }
  const schemaVersion = payload.schemaVersion;
  if (schemaVersion !== void 0 && schemaVersion !== ADMIN_DATA_SCHEMA_VERSION) {
    throw new Error(`Unsupported schema version: ${schemaVersion}.`);
  }
  if (!isPlainObject(payload.config)) {
    throw new Error('Invalid import payload. "config" must be an object.');
  }
  if (!Array.isArray(payload.groups)) {
    throw new Error('Invalid import payload. "groups" must be an array.');
  }
  const normalizedGroups = payload.groups.map((group, index) => normalizeGroupForImport(group, index));
  const tokenSet = /* @__PURE__ */ new Set();
  for (const group of normalizedGroups) {
    if (tokenSet.has(group.token)) {
      throw new Error(`Duplicated group token: ${group.token}.`);
    }
    tokenSet.add(group.token);
  }
  return {
    importedConfig: sanitizeConfigForImport(payload.config),
    importedGroups: normalizedGroups
  };
}
async function buildMergedConfigForImport(importedConfig) {
  const currentConfig = await getGlobalConfig() || {};
  const mergedConfig = normalizePersistedAdminCredentialFields(
    deepMerge({}, currentConfig, importedConfig)
  );
  if (Object.hasOwn(mergedConfig, "blockBots")) {
    delete mergedConfig.blockBots;
  }
  if (hasConfiguredAdminPassword(mergedConfig) && !hasConfiguredJwtSecret(mergedConfig)) {
    mergedConfig.jwtSecret = generateJwtSecret();
  }
  return mergedConfig;
}
async function syncImportedGroups(importedGroups, logger) {
  const existingGroups = await getAllGroups();
  const existingGroupMap = /* @__PURE__ */ new Map();
  for (const group of existingGroups) {
    if (!group || typeof group.token !== "string") {
      continue;
    }
    const normalizedToken = group.token.trim();
    if (!normalizedToken) {
      continue;
    }
    existingGroupMap.set(normalizedToken, group);
  }
  const existingTokens = new Set(existingGroupMap.keys());
  const importedTokens = new Set(importedGroups.map((group) => group.token));
  const importedOnlyTokens = [...importedTokens].filter((token) => !existingTokens.has(token));
  const rollbackGroups = async () => {
    for (const group of existingGroupMap.values()) {
      await saveGroup(group);
    }
    for (const token of importedOnlyTokens) {
      await deleteGroup(token);
    }
  };
  try {
    for (const group of importedGroups) {
      await saveGroup(group);
    }
    for (const token of existingTokens) {
      if (!importedTokens.has(token)) {
        await deleteGroup(token);
      }
    }
  } catch (err) {
    try {
      await rollbackGroups();
    } catch (rollbackErr) {
      if (logger && typeof logger.error === "function") {
        logger.error(rollbackErr, { customMessage: "Failed to rollback groups after import synchronization error." });
      }
    }
    throw err;
  }
}

// src/handlers/admin/protected-api-controller.js
async function readJsonBody2(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
function handleLogout() {
  const cookie = createAuthCookie("logged_out", 0);
  return response.json({ success: true }, 200, { "Set-Cookie": cookie });
}
async function handleProtectedAdminApiRequest(request, logger) {
  const router = t();
  router.post("/admin/api/logout", () => handleLogout());
  router.get("/admin/api/config", async () => {
    const config = await getGlobalConfig() || ConfigService.get();
    return response.json(sanitizeConfigForResponse(config));
  });
  router.get("/admin/api/export", async () => {
    const config = await getGlobalConfig() || ConfigService.get();
    const groups = await getAllGroups();
    return response.json({
      schemaVersion: ADMIN_DATA_SCHEMA_VERSION,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      config: sanitizeConfigForResponse(config),
      groups
    });
  });
  router.post("/admin/api/import", async () => {
    const payload = await readJsonBody2(request);
    if (!payload) {
      return response.json({ error: "Invalid JSON payload." }, 400);
    }
    let normalizedPayload;
    try {
      normalizedPayload = normalizeImportPayload(payload);
    } catch (err) {
      return response.json({
        error: err instanceof Error ? err.message : "Invalid import payload."
      }, 400);
    }
    let previousConfig = null;
    let configPersisted = false;
    try {
      previousConfig = await getGlobalConfig() || {};
      const mergedConfig = await buildMergedConfigForImport(normalizedPayload.importedConfig);
      await saveGlobalConfig(mergedConfig);
      configPersisted = true;
      await syncImportedGroups(normalizedPayload.importedGroups, logger);
      await ConfigService.init(ConfigService.getEnv(), ConfigService.getCtx());
      logger.warn("Admin config/groups imported from JSON backup.", {
        importedGroups: normalizedPayload.importedGroups.length
      }, { notify: true });
      return response.json({
        success: true,
        importedGroups: normalizedPayload.importedGroups.length
      });
    } catch (err) {
      if (configPersisted) {
        try {
          await saveGlobalConfig(previousConfig);
          await ConfigService.init(ConfigService.getEnv(), ConfigService.getCtx());
        } catch (rollbackErr) {
          logger.error(rollbackErr, { customMessage: "Failed to rollback global config after import error." });
        }
      }
      logger.error(err, { customMessage: "Failed to import admin config/groups from JSON." });
      return response.json({ error: "Failed to import data." }, 500);
    }
  });
  router.put("/admin/api/config", async () => {
    const newConfig = await readJsonBody2(request);
    if (!newConfig || typeof newConfig !== "object" || Array.isArray(newConfig)) {
      return response.json({ error: "Invalid config payload." }, 400);
    }
    if ("jwtSecret" in newConfig) {
      delete newConfig.jwtSecret;
    }
    if ("adminPasswordHash" in newConfig) {
      delete newConfig.adminPasswordHash;
    }
    if ("adminPasswordSalt" in newConfig) {
      delete newConfig.adminPasswordSalt;
    }
    if ("adminPasswordHashIterations" in newConfig) {
      delete newConfig.adminPasswordHashIterations;
    }
    if ("blockBots" in newConfig) {
      delete newConfig.blockBots;
    }
    let passwordChanged = false;
    const currentAdminCredentials = getRuntimeAdminCredentials();
    if ("adminPassword" in newConfig) {
      const nextPassword = typeof newConfig.adminPassword === "string" ? newConfig.adminPassword.trim() : "";
      if (!nextPassword) {
        delete newConfig.adminPassword;
      } else {
        if (nextPassword.length < 6) {
          return response.json({ error: "Password must be at least 6 characters." }, 400);
        }
        let passwordMatched;
        try {
          passwordMatched = await isValidAdminPassword(nextPassword, currentAdminCredentials);
        } catch (err) {
          logger.error(err, { customMessage: "Failed to validate admin password hash during update." });
          return response.json({ error: "Failed to validate password." }, 500);
        }
        passwordChanged = !hasConfiguredAdminPassword(currentAdminCredentials) || !passwordMatched;
        if (passwordChanged) {
          let passwordCredentials;
          try {
            passwordCredentials = await buildAdminPasswordCredentials(nextPassword);
          } catch (err) {
            logger.error(err, { customMessage: "Failed to hash admin password during update." });
            return response.json({ error: "Failed to update admin credentials." }, 500);
          }
          newConfig.adminPasswordHash = passwordCredentials.adminPasswordHash;
          newConfig.adminPasswordSalt = passwordCredentials.adminPasswordSalt;
          newConfig.adminPasswordHashIterations = passwordCredentials.adminPasswordHashIterations;
          newConfig.adminPassword = "";
          if (passwordChanged) {
            newConfig.jwtSecret = generateJwtSecret();
          }
        } else {
          delete newConfig.adminPassword;
        }
      }
    }
    const oldConfig = await getGlobalConfig() || {};
    const mergedConfig = normalizePersistedAdminCredentialFields(deepMerge({}, oldConfig, newConfig));
    if (Object.hasOwn(mergedConfig, "blockBots")) {
      delete mergedConfig.blockBots;
    }
    await saveGlobalConfig(mergedConfig);
    const responseHeaders = {};
    if (passwordChanged) {
      const jwtSecret = typeof mergedConfig.jwtSecret === "string" ? mergedConfig.jwtSecret.trim() : "";
      if (!jwtSecret) {
        logger.fatal("JWT secret is missing after password update.");
        return response.json({ error: "JWT secret is missing after password update." }, 500);
      }
      const token = await createJwt(jwtSecret, {}, logger);
      responseHeaders["Set-Cookie"] = createAuthCookie(token, 8 * 60 * 60);
      logger.warn("Admin password updated and JWT secret rotated.", {}, { notify: true });
    } else {
      logger.info("Global config updated", {}, { notify: true });
    }
    return response.json({ success: true, passwordChanged }, 200, responseHeaders);
  });
  router.get("/admin/api/groups", async () => {
    const groups = await getAllGroups();
    return response.json(groups);
  });
  router.post("/admin/api/groups", async () => {
    const newGroup = await readJsonBody2(request);
    if (!newGroup || typeof newGroup !== "object" || Array.isArray(newGroup)) {
      logger.warn("Invalid group data", { GroupData: newGroup });
      return response.json({ error: "Invalid group data" }, 400);
    }
    if (typeof newGroup.name !== "string" || !newGroup.name.trim()) {
      logger.warn("Invalid group data", { GroupData: newGroup });
      return response.json({ error: "Invalid group data" }, 400);
    }
    if (!newGroup.token) newGroup.token = crypto.randomUUID();
    newGroup.token = normalizeGroupToken(newGroup.token);
    if (!isValidGroupToken(newGroup.token)) {
      logger.warn("Invalid group data", { GroupData: newGroup });
      return response.json({ error: "Invalid group data" }, 400);
    }
    const group = await getGroup(newGroup.token);
    if (group) {
      logger.warn("Group already exists", { GroupName: newGroup.name });
      return response.json({ error: "Group already exists" }, 400);
    }
    await saveGroup(newGroup);
    logger.info("Group created", { GroupName: newGroup.name, Token: newGroup.token }, { notify: true });
    return response.json(newGroup);
  });
  router.put("/admin/api/groups/:token", async ({ params }) => {
    const normalizedToken = normalizeGroupToken(params.token);
    const groupData = await readJsonBody2(request);
    if (!groupData || typeof groupData !== "object" || Array.isArray(groupData)) {
      logger.warn("Invalid group data", { GroupData: groupData, Token: normalizedToken });
      return response.json({ error: "Invalid group data" }, 400);
    }
    if (!isValidGroupToken(normalizedToken)) {
      logger.warn("Invalid group data", { GroupData: groupData, Token: normalizedToken });
      return response.json({ error: "Invalid group data" }, 400);
    }
    groupData.token = normalizedToken;
    await saveGroup(groupData);
    logger.info("Group updated", { GroupName: groupData.name, Token: groupData.token }, { notify: true });
    return response.json(groupData);
  });
  router.delete("/admin/api/groups/:token", async ({ params }) => {
    const token = params.token;
    await deleteGroup(token);
    logger.warn("Group deleted", { Token: token }, { notify: true });
    return response.json({ success: true });
  });
  const routerResponse = await router.fetch(request);
  if (routerResponse) {
    return routerResponse;
  }
  return response.json({ error: "API endpoint not found" }, 404);
}

// src/handlers/admin/page-controller.js
async function fetchAdminAsset(request, assetPath, logger, status = null, headers = {}) {
  return serveAssetResponse(request, ConfigService.getEnv().ASSETS, assetPath, logger, {
    status,
    headers,
    notConfiguredMessage: "Admin asset is unavailable because ASSETS binding is not configured.",
    notFoundMessage: "Admin asset not found.",
    fetchFailureMessage: "Failed to fetch admin asset",
    logLabel: "admin asset fetch"
  });
}
function isAdminEntryPage(pathname) {
  return pathname === "/admin" || pathname === "/admin/" || pathname === "/admin/index.html";
}
function isAdminInitPage(pathname) {
  return pathname === "/admin/init" || pathname === "/admin/init/" || pathname === "/admin/init.html";
}

// src/handlers/admin/entry-controller.js
async function handleAdminRequest(request, logger) {
  const url = new URL(request.url);
  const { ASSETS } = ConfigService.getEnv();
  if (!ASSETS) {
    logger.fatal("ASSETS binding is not configured.");
    return response.json({ error: "ASSETS binding is not configured." }, 500);
  }
  const initialized = isAdminInitialized2();
  const initSecretConfigured = isInitSecretConfigured();
  const publicApiResponse = await handlePublicAdminApiRequest(request, logger, {
    initialized,
    initSecretConfigured
  });
  if (publicApiResponse) {
    return publicApiResponse;
  }
  if (!initialized) {
    if (!initSecretConfigured) {
      logger.fatal("INIT_SECRET is required before admin initialization.");
      return response.normal("INIT_SECRET is not configured.", 500, { "Set-Cookie": createAuthCookie("invalid", 0) }, "text/plain; charset=utf-8");
    }
    if (url.pathname.startsWith("/admin/api/")) {
      return response.json({ error: "Admin is not initialized. Please complete initial setup first." }, 403);
    }
    if (isAdminEntryPage(url.pathname) || isAdminInitPage(url.pathname)) {
      return fetchAdminAsset(request, "/admin/init.html", logger, 200, { "Set-Cookie": createAuthCookie("invalid", 0) });
    }
    return response.normal("Admin is not initialized yet.", 403, { "Set-Cookie": createAuthCookie("invalid", 0) }, "text/plain; charset=utf-8");
  }
  const jwtSecret = await getOrCreateJwtSecretForInitializedAdmin(logger);
  if (!jwtSecret) {
    logger.fatal("JWT secret is not configured for initialized admin.");
    return response.json(
      { error: "JWT secret is not configured for initialized admin." },
      500,
      { "Set-Cookie": createAuthCookie("invalid", 0) }
    );
  }
  const token = getAuthCookie(request, logger);
  const isValid = await verifyJwt(jwtSecret, token, logger);
  if (isValid) {
    const newToken = await refreshJwt(jwtSecret, token, logger);
    const cookie = createAuthCookie(newToken, 8 * 60 * 60);
    if (url.pathname.startsWith("/admin/api/")) {
      const apiResponse = await handleProtectedAdminApiRequest(request, logger);
      if (apiResponse.headers.has("Set-Cookie")) {
        return apiResponse;
      }
      const headers = new Headers(apiResponse.headers);
      headers.set("Set-Cookie", cookie);
      return new Response(apiResponse.body, {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers
      });
    }
    if (isAdminInitPage(url.pathname)) {
      return fetchAdminAsset(request, "/admin/index.html", logger, 200, { "Set-Cookie": cookie });
    }
    if (isAdminEntryPage(url.pathname)) {
      return fetchAdminAsset(request, "/admin/index.html", logger, 200, { "Set-Cookie": cookie });
    }
    return fetchAdminAsset(request, url.pathname, logger, null, { "Set-Cookie": cookie });
  }
  const expiredCookieHeaders = { "Set-Cookie": createAuthCookie("invalid", 0) };
  if (url.pathname.startsWith("/admin/api/")) {
    return response.json({ error: "Unauthorized" }, 401, expiredCookieHeaders);
  }
  if (isAdminInitPage(url.pathname)) {
    return fetchAdminAsset(request, "/admin/login.html", logger, 401, expiredCookieHeaders);
  }
  if (isAdminEntryPage(url.pathname)) {
    return fetchAdminAsset(request, "/admin/login.html", logger, 401, expiredCookieHeaders);
  }
  return response.normal("Unauthorized.", 401, expiredCookieHeaders, "text/plain; charset=utf-8");
}

// src/services/subconverter.js
var SUBSCRIPTION_CACHE_POLICY = Object.freeze({
  ttlMs: 60 * 1e3,
  maxEntries: 512
});
var SubconverterService = class {
  static _resultCache = /* @__PURE__ */ new Map();
  static _inFlightBuilds = /* @__PURE__ */ new Map();
  /**
   * 主方法：生成最终的订阅内容
   * @param {object} group - The subscription group object from KV.
   * @param {Request} request - The original incoming request.
   * @param {string} token - The group's token.
   * @returns {Promise<{content: string, headers: object}>}
   */
  static async generateSubscription(group, request, token, logger) {
    const url = new URL(request.url);
    const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();
    const outputFormat = this._getOutputFormat(url, userAgent);
    const cacheKey = this._createResultCacheKey(group, token, url, outputFormat);
    const now = Date.now();
    this._pruneExpiredCacheEntries(now);
    const cachedPayload = this._getCachedPayload(cacheKey, now);
    if (cachedPayload) {
      return this._clonePayload(cachedPayload);
    }
    const inFlightBuild = this._inFlightBuilds.get(cacheKey);
    if (inFlightBuild) {
      const inFlightResult = await inFlightBuild;
      return this._clonePayload(inFlightResult.payload);
    }
    const buildPromise = (async () => {
      const result = await this._buildSubscriptionResult(group, request, token, logger, outputFormat, url);
      if (result.shouldCache) {
        this._setCacheEntry(cacheKey, result.payload);
      }
      return result;
    })();
    this._inFlightBuilds.set(cacheKey, buildPromise);
    try {
      const result = await buildPromise;
      return this._clonePayload(result.payload);
    } finally {
      this._inFlightBuilds.delete(cacheKey);
    }
  }
  static async _buildSubscriptionResult(group, request, token, logger, outputFormat, url) {
    const allSources = (group.nodes || "").split("\n").filter(Boolean);
    const inlineNodes = [];
    const subscriptionUrls = [];
    allSources.forEach((source) => {
      /^(https?:)?\/\//i.test(source.toLowerCase()) ? subscriptionUrls.push(source) : inlineNodes.push(source);
    });
    const { fetchedNodes, conversionUrls } = await this._fetchRemoteSubscriptions(subscriptionUrls, request, group.filter, logger);
    const combinedNodes = [...inlineNodes, ...fetchedNodes];
    let content = applyFilter(combinedNodes.join("\n"), group.filter, logger);
    content = [...new Set(content.split("\n"))].join("\n");
    if (outputFormat === "base64") {
      const headers = this._createSubscriptionHeaders();
      return {
        payload: { content: safeBtoa(content), headers },
        shouldCache: true
      };
    }
    const finalConversionUrls = [...conversionUrls];
    if (content.trim()) {
      const selfUrl = `https://${url.hostname}/sub/${token}?format=base64`;
      finalConversionUrls.unshift(selfUrl);
    }
    if (finalConversionUrls.length === 0) {
      const headers = this._createSubscriptionHeaders();
      return {
        payload: { content: safeBtoa(""), headers },
        shouldCache: true
      };
    }
    const subconverterConfig = ConfigService.get("subconverter");
    const subconverterUrl = this._generateSubConverterUrl(outputFormat, finalConversionUrls, subconverterConfig);
    if (!subconverterUrl || subconverterUrl.trim() === "") {
      const headers = this._createSubscriptionHeaders();
      return {
        payload: { content: safeBtoa(""), headers },
        shouldCache: true
      };
    }
    try {
      const response2 = await fetch(subconverterUrl);
      if (!response2.ok) throw new Error(`Sub-converter API error: ${response2.status}`);
      let subContent = await response2.text();
      if (outputFormat === "clash") {
        subContent = this._fixClashWireguard(subContent);
      }
      const headers = this._createSubscriptionHeaders(true);
      return {
        payload: { content: subContent, headers },
        shouldCache: true
      };
    } catch (error) {
      logger.error(error, { customMessage: "Sub-converter fetch failed" });
      const headers = this._createSubscriptionHeaders();
      return {
        payload: { content: safeBtoa(content), headers },
        shouldCache: false
      };
    }
  }
  static _setCacheEntry(cacheKey, payload) {
    const now = Date.now();
    this._resultCache.set(cacheKey, {
      payload: this._clonePayload(payload),
      expiresAt: now + SUBSCRIPTION_CACHE_POLICY.ttlMs
    });
    this._enforceCacheSizeLimit();
  }
  static _getCachedPayload(cacheKey, now = Date.now()) {
    const entry = this._resultCache.get(cacheKey);
    if (!entry) {
      return null;
    }
    if (now > entry.expiresAt) {
      this._resultCache.delete(cacheKey);
      return null;
    }
    return entry.payload;
  }
  static _createResultCacheKey(group, token, url, outputFormat) {
    const host = (url.hostname || "").toLowerCase();
    const groupFingerprint = this._hashString(JSON.stringify({
      nodes: group?.nodes || "",
      filter: group?.filter || null
    }));
    return `token:${token}|host:${host}|format:${outputFormat}|group:${groupFingerprint}`;
  }
  static _hashString(value) {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
      hash = hash * 33 ^ value.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }
  static _clonePayload(payload) {
    return {
      content: payload.content,
      headers: { ...payload.headers || {} }
    };
  }
  static _pruneExpiredCacheEntries(now = Date.now()) {
    for (const [cacheKey, entry] of this._resultCache.entries()) {
      if (now > entry.expiresAt) {
        this._resultCache.delete(cacheKey);
      }
    }
  }
  static _enforceCacheSizeLimit() {
    while (this._resultCache.size > SUBSCRIPTION_CACHE_POLICY.maxEntries) {
      const oldestKey = this._resultCache.keys().next().value;
      if (!oldestKey) {
        break;
      }
      this._resultCache.delete(oldestKey);
    }
  }
  static __clearResultCacheForTests() {
    this._resultCache.clear();
    this._inFlightBuilds.clear();
  }
  static __getCachePolicyForTests() {
    return { ...SUBSCRIPTION_CACHE_POLICY };
  }
  static async _fetchRemoteSubscriptions(urls, request, filterConfig, logger) {
    if (!urls || urls.length === 0) {
      return { fetchedNodes: [], conversionUrls: [] };
    }
    const requestHostname = new URL(request.url).hostname.toLowerCase();
    const fetchedNodes = [];
    const conversionUrls = [];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4e3);
    const promises = urls.map(async (url) => {
      try {
        const urlStr = url.toString();
        const targetHostname = new URL(urlStr).hostname.toLowerCase();
        if (targetHostname === requestHostname) {
          throw new Error("Recursive loop detected");
        }
        const resp = await fetch(urlStr, {
          method: "GET",
          headers: { "User-Agent": `${request.headers.get("User-Agent") || "Mozilla/5.0"} v2rayN/7.15.7 (SubPool-Worker/1.0.0; +https://github.com/illusionlie/subpool-worker  )` },
          signal: controller.signal
        });
        if (!resp.ok) {
          throw new Error(`Fetch failed: ${resp.status}`);
        }
        const content = await resp.text();
        return { url: urlStr, content };
      } catch (error) {
        throw { url: url.toString(), error };
      }
    });
    const results = await Promise.allSettled(promises);
    clearTimeout(timeoutId);
    for (const result of results) {
      if (result.status === "fulfilled") {
        const { url, content } = result.value;
        if (content.includes("proxies:") || content.includes("outbounds") && content.includes("inbounds")) {
          conversionUrls.push(url);
        } else if (isValidBase64(content)) {
          const normalizedContent = this._normalizeBase64ForDecode(content);
          try {
            const decoded = atob(normalizedContent);
            fetchedNodes.push(applyFilter(decoded, filterConfig, logger));
          } catch (error) {
            logger.warn(`Failed to decode base64 content from ${url}`, {
              error: error instanceof Error ? error.message : String(error)
            });
          }
        } else if (content.includes("://")) {
          fetchedNodes.push(applyFilter(content, filterConfig, logger));
        } else {
          logger.warn(`Unrecognized content from ${url}`);
        }
      } else {
        const { url, error } = result.reason;
        logger.error(error, `Failed to fetch ${url}`);
      }
    }
    return { fetchedNodes, conversionUrls };
  }
  static _normalizeBase64ForDecode(content) {
    return content.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  }
  static _getOutputFormat(url, userAgent) {
    const formatMap = {
      "clash": "clash",
      "sing-box": "singbox",
      "singbox": "singbox",
      "surge": "surge",
      "quantumult%20x": "quanx",
      "loon": "loon"
    };
    const paramMap = {
      "clash": "clash",
      "sb": "singbox",
      "singbox": "singbox",
      "surge": "surge",
      "quanx": "quanx",
      "loon": "loon",
      "b64": "base64",
      "base64": "base64",
      "format=base64": "base64"
    };
    const params = new URLSearchParams(url.search);
    for (const [param, format] of Object.entries(paramMap)) {
      if (params.has(param)) return format;
    }
    for (const [ua, format] of Object.entries(formatMap)) {
      if (userAgent.includes(ua)) return format;
    }
    return "base64";
  }
  static _generateSubConverterUrl(targetFormat, urls, subconverterConfig) {
    const params = new URLSearchParams({
      target: targetFormat,
      url: urls.join("|"),
      insert: "false",
      config: subconverterConfig.configUrl,
      emoji: "true",
      list: "false",
      tfo: "false",
      scv: "true",
      fdn: "false",
      sort: "false"
    });
    if (targetFormat === "clash" || targetFormat === "singbox") {
      params.set("new_name", "true");
    }
    return `${subconverterConfig.protocol}://${subconverterConfig.url}/sub?${params.toString()}`;
  }
  static _createSubscriptionHeaders(isConverted = false) {
    const config = ConfigService.get();
    const { totalTB, expireDate } = config.subscriptionInfo;
    const total = totalTB * 1099511627776;
    const expire = expireDate === "0" ? 0 : !isNaN(Date.parse(expireDate)) ? Math.floor(new Date(expireDate).getTime() / 1e3) : -1;
    const headers = {
      "Content-Type": "text/plain; charset=utf-8",
      "Profile-Update-Interval": `${config.subUpdateTime}`,
      "Subscription-Userinfo": `upload=0; download=0; total=${total}; expire=${expire}`
    };
    if (isConverted) {
      headers["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(config.fileName)}`;
    }
    return headers;
  }
  static _fixClashWireguard(content) {
    if (content.includes("type: wireguard") && !content.includes("remote-dns-resolve")) {
      return content.replace(/, mtu: 1280, udp: true/g, ", mtu: 1280, remote-dns-resolve: true, udp: true");
    }
    return content;
  }
};

// src/handlers/subscription.js
async function fetchDefaultPage(request, status, logger) {
  return serveAssetResponse(request, ConfigService.getEnv().ASSETS, "/index.html", logger, {
    status,
    notConfiguredMessage: "Default fallback asset is unavailable because ASSETS binding is not configured.",
    notFoundMessage: "Default fallback asset not found.",
    fetchFailureMessage: "Failed to fetch subscription fallback asset",
    logLabel: "subscription fallback asset fetch"
  });
}
async function handleSubscriptionRequest(request, token, logger) {
  const normalizedToken = normalizeGroupToken(token);
  if (!isValidGroupToken(normalizedToken)) {
    logger.warn("Invalid token format access attempt", { URL: request.url }, { notify: true });
    return response.normal("Invalid token format.", 400);
  }
  const group = await KVService.getGroup(normalizedToken);
  if (!group) {
    logger.warn("Invalid token access attempt", { URL: request.url }, { notify: true });
    return fetchDefaultPage(request, 404, logger);
  }
  const country = request.cf?.country || "XX";
  if (country === "CN" && !group.allowChinaAccess) {
    logger.warn("Blocked China access attempt", { UserAgent: request.headers.get("User-Agent"), URL: request.url }, { notify: true });
    return fetchDefaultPage(request, 403, logger);
  }
  logger.info("Subscription accessed", { token, groupName: group.name });
  try {
    const { content, headers } = await SubconverterService.generateSubscription(group, request, token, logger);
    return new Response(content, { headers });
  } catch (err) {
    logger.error(err, { customMessage: "Failed to generate subscription", token });
    return response.normal("Upstream subscription generation failed. Please check the logs.", 502);
  }
}

// src/router.js
async function fetchAsset(request, env, logger, assetPath = null, status = null, headers = {}) {
  return serveAssetResponse(request, env.ASSETS, assetPath, logger, {
    status,
    headers,
    notConfiguredMessage: "Fallback asset is unavailable because ASSETS binding is not configured.",
    notFoundMessage: "Fallback asset not found.",
    fetchFailureMessage: "Failed to fetch fallback asset",
    logLabel: "fallback asset fetch"
  });
}
async function handleRequest(request, env, ctx, logger) {
  await ConfigService.init(env, ctx);
  const url = new URL(request.url);
  const pathname = url.pathname;
  const router = t();
  router.all("/admin", () => handleAdminRequest(request, logger));
  router.all("/admin/*", () => handleAdminRequest(request, logger));
  router.all("/favicon.ico", () => response.normal("", 404, { "Content-Type": "image/x-icon" })).all("/robots.txt", () => response.normal("User-agent: *\nDisallow: /\n", 200));
  router.get("/sub/:token/?", ({ params }) => handleSubscriptionRequest(request, params.token, logger));
  const routerResponse = await router.fetch(request);
  if (routerResponse) return routerResponse;
  logger.warn("Unhandled path, returning asset page", { pathname });
  return fetchAsset(request, env, logger, "/index.html", 200);
}

// src/services/telegram.js
var TelegramService = class {
  static async sendMessage(message, ctx = null) {
    const config = ConfigService.get("telegram");
    if (!config.enabled || !config.botToken || !config.chatId) {
      return;
    }
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const payload = {
      chat_id: config.chatId,
      text: message,
      parse_mode: "HTML"
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(payload)
    };
    const sendTelegram = async () => {
      try {
        console.log("Sending Telegram message.");
        const response2 = await fetch(url, options);
        if (!response2.ok) {
          throw new Error(`Telegram API returned ${response2.status}: ${await response2.text()}`);
        }
        console.log("Telegram message sent successfully");
      } catch (err) {
        console.error("Telegram send failed:", err.message);
      }
    };
    if (ctx && ctx.waitUntil) {
      ctx.waitUntil(sendTelegram());
    } else {
      await sendTelegram();
    }
  }
};

// src/services/logger.js
var logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
  none: 5
};
var LoggerService = class {
  /**
   * @param {Request} request 请求
   * @param {Env} env 环境变量
   * @param {ExecutionContext} ctx 执行上下文
   */
  constructor(request, env, ctx) {
    this.request = request;
    this.env = env;
    this.ctx = ctx;
    const defaultLogLevel = env.LOG_LEVEL !== void 0 ? env.LOG_LEVEL : "info";
    this.logLevel = logLevels[env.LOG_LEVEL?.toLowerCase() || defaultLogLevel];
    if (this.logLevel === void 0) {
      this.logLevel = logLevels[defaultLogLevel];
    }
    const debugHeaderValue = request.headers.get("X-Debug-Log");
    const debugSecret = env.DEBUG_SECRET;
    this.debugOverride = debugSecret && debugHeaderValue === debugSecret;
  }
  /**
   * 日志记录核心
   * @private
   * @param {string} level 日志级别
   * @param {string} message 日志消息
   * @param {object} [data={}] 附加数据
   */
  _log(level, message, data = {}, options = {}) {
    const levelNumber = logLevels[level];
    if (levelNumber < this.logLevel && !this.debugOverride) {
      return;
    }
    const logObject = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: level.toUpperCase(),
      message,
      // 自动为日志添加请求上下文
      context: {
        requestId: this.request.headers.get("cf-request-id"),
        url: this.request.url,
        method: this.request.method,
        colo: this.request.cf?.colo,
        country: this.request.cf?.country,
        region: this.request.cf?.region
      },
      // 合并任何提供的自定义数据
      ...data
    };
    if (options.notify || level === "error" || level === "fatal") {
      this.sendNotification(logObject, data, this.request);
    }
    switch (level) {
      case "error":
      case "fatal":
        console.error(JSON.stringify(logObject));
        break;
      case "warn":
        console.warn(JSON.stringify(logObject));
        break;
      case "info":
        console.info(JSON.stringify(logObject));
        break;
      default:
        console.log(JSON.stringify(logObject));
        break;
    }
  }
  /**
   * 格式化并发送Telegram通知
   * @private
   */
  sendNotification(logObject, data, request) {
    const { level, message, context } = logObject;
    const emoji = {
      INFO: "\u2139\uFE0F",
      WARN: "\u26A0\uFE0F",
      ERROR: "\u274C",
      FATAL: "\u{1F6A8}"
    }[level] || "\u2699\uFE0F";
    let details = "";
    if (data.error && data.error.stack) {
      details = `<tg-spoiler>${data.error.stack}</tg-spoiler>`;
    } else {
      const dataString = JSON.stringify(data, null, 2);
      if (dataString !== "{}") {
        const MAX_LENGTH = 4096;
        const truncatedData = dataString.length > MAX_LENGTH ? dataString.substring(0, MAX_LENGTH) + "..." : dataString;
        details = `<tg-spoiler>${truncatedData}</tg-spoiler>`;
      }
    }
    const msg = [
      `<b>${emoji} [${level}] ${message}</b>`,
      `Timestamp: ${logObject.timestamp}`,
      // `URL: ${context.url}`,
      `IP: ${request.headers.get("cf-connecting-ip") || "N/A"}`,
      `Country: ${context.country} (${context.colo})`,
      `Region: ${context.region}`,
      details
    ].filter(Boolean).join("\n");
    TelegramService.sendMessage(msg, this.ctx);
  }
  // Public-facing log methods
  debug(message, data, options) {
    this._log("debug", message, data, options);
  }
  info(message, data, options) {
    this._log("info", message, data, options);
  }
  warn(message, data, options) {
    this._log("warn", message, data, options);
  }
  error(message, data, options) {
    if (message instanceof Error) {
      const errorData = {
        error: {
          message: message.message,
          stack: message.stack,
          name: message.name
        },
        ...data
      };
      this._log("error", message.message, errorData, options);
    } else {
      this._log("error", message, data, options);
    }
  }
  fatal(message, data, options) {
    this._log("fatal", message, data, options);
  }
};

// src/index.js
var index_default = {
  async fetch(request, env, ctx) {
    const logger = new LoggerService(request, env, ctx);
    try {
      return await handleRequest(request, env, ctx, logger);
    } catch (err) {
      logger.error(err, { customMessage: "Unhandled exception in fetch handler" });
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
export {
  index_default as default
};
