var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/utils.js
function checkStartsWith(str2, prefix) {
  if (str2 === void 0 || str2 === null || prefix === void 0 || prefix === null) {
    return false;
  }
  str2 = String(str2);
  prefix = String(prefix);
  return str2.slice(0, prefix.length) === prefix;
}
function encodeBase64(input2) {
  const encoder = new TextEncoder();
  const utf8Array = encoder.encode(input2);
  let binaryString = "";
  for (const byte of utf8Array) {
    binaryString += String.fromCharCode(byte);
  }
  return base64FromBinary(binaryString);
}
function decodeBase64(input2) {
  const binaryString = base64ToBinary(input2);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}
function base64FromBinary(binaryString) {
  const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64String = "";
  let padding = "";
  const remainder = binaryString.length % 3;
  if (remainder > 0) {
    padding = "=".repeat(3 - remainder);
    binaryString += "\0".repeat(3 - remainder);
  }
  for (let i = 0; i < binaryString.length; i += 3) {
    const bytes = [
      binaryString.charCodeAt(i),
      binaryString.charCodeAt(i + 1),
      binaryString.charCodeAt(i + 2)
    ];
    const base64Index1 = bytes[0] >> 2;
    const base64Index2 = (bytes[0] & 3) << 4 | bytes[1] >> 4;
    const base64Index3 = (bytes[1] & 15) << 2 | bytes[2] >> 6;
    const base64Index4 = bytes[2] & 63;
    base64String += base64Chars[base64Index1] + base64Chars[base64Index2] + base64Chars[base64Index3] + base64Chars[base64Index4];
  }
  return base64String.slice(0, base64String.length - padding.length) + padding;
}
function base64ToBinary(base64String) {
  const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let binaryString = "";
  base64String = base64String.replace(/=+$/, "");
  for (let i = 0; i < base64String.length; i += 4) {
    const bytes = [
      base64Chars.indexOf(base64String[i]),
      base64Chars.indexOf(base64String[i + 1]),
      base64Chars.indexOf(base64String[i + 2]),
      base64Chars.indexOf(base64String[i + 3])
    ];
    const byte1 = bytes[0] << 2 | bytes[1] >> 4;
    const byte2 = (bytes[1] & 15) << 4 | bytes[2] >> 2;
    const byte3 = (bytes[2] & 3) << 6 | bytes[3];
    if (bytes[1] !== -1) binaryString += String.fromCharCode(byte1);
    if (bytes[2] !== -1) binaryString += String.fromCharCode(byte2);
    if (bytes[3] !== -1) binaryString += String.fromCharCode(byte3);
  }
  return binaryString;
}
function tryDecodeSubscriptionLines(input2, { decodeUriComponent = false } = {}) {
  if (typeof input2 !== "string") {
    return input2;
  }
  const trimmed = input2.trim();
  if (trimmed === "") {
    return trimmed;
  }
  const splitIfMultiple = (value) => {
    if (typeof value !== "string") {
      return value;
    }
    const normalized = value.replace(/\r\n/g, "\n");
    const segments = normalized.split("\n").map((segment) => segment.trim()).filter((segment) => segment !== "");
    if (segments.length > 1 && segments.some((segment) => segment.includes("://"))) {
      return segments;
    }
    return normalized.trim();
  };
  const directResult = splitIfMultiple(trimmed);
  if (Array.isArray(directResult)) {
    return directResult;
  }
  if (typeof directResult === "string" && directResult.includes("://")) {
    return directResult;
  }
  try {
    let decoded = decodeBase64(trimmed);
    if (decodeUriComponent && decoded.includes("%")) {
      const hasProtocolScheme = decoded.includes("://");
      if (!hasProtocolScheme) {
        try {
          decoded = decodeURIComponent(decoded);
        } catch (_) {
        }
      }
    }
    const decodedResult = splitIfMultiple(decoded);
    if (Array.isArray(decodedResult)) {
      return decodedResult;
    }
    if (typeof decodedResult === "string" && decodedResult.includes("://")) {
      return decodedResult;
    }
  } catch (_) {
  }
  return trimmed;
}
function groupProxiesByCountry(proxies, { getName } = {}) {
  const extractor = typeof getName === "function" ? getName : (proxy) => {
    if (proxy == null) return void 0;
    if (typeof proxy === "string") {
      return proxy;
    }
    if (typeof proxy === "object") {
      return proxy.name ?? proxy.tag ?? proxy.id ?? proxy.ps;
    }
    return void 0;
  };
  const normalizeName = (value) => {
    if (typeof value !== "string") {
      return void 0;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return void 0;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > -1) {
      const beforeEq = trimmed.slice(0, eqIndex).trim();
      if (beforeEq) {
        return beforeEq;
      }
    }
    return trimmed;
  };
  const grouped = {};
  if (!Array.isArray(proxies) || proxies.length === 0) {
    return grouped;
  }
  proxies.forEach((proxy) => {
    const rawName = extractor(proxy);
    const proxyName = normalizeName(rawName);
    if (!proxyName) {
      return;
    }
    const countryInfo = parseCountryFromNodeName(proxyName);
    if (!countryInfo) {
      return;
    }
    const { name } = countryInfo;
    if (!grouped[name]) {
      grouped[name] = { ...countryInfo, proxies: [] };
    }
    grouped[name].proxies.push(proxyName);
  });
  return grouped;
}
function createStableProviderName(url) {
  if (typeof url !== "string" || url.trim() === "") {
    throw new Error("Provider URL must be a non-empty string");
  }
  const normalizedUrl = url.trim();
  let hash = FNV_32_OFFSET_BASIS;
  for (let i = 0; i < normalizedUrl.length; i++) {
    hash ^= normalizedUrl.charCodeAt(i);
    hash = Math.imul(hash, FNV_32_PRIME);
  }
  return `_auto_provider_${(hash >>> 0).toString(36)}`;
}
function deepCopy(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopy(item));
  }
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = deepCopy(obj[key]);
    }
  }
  return newObj;
}
function generateWebPath(length = PATH_LENGTH) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
function parseServerInfo(serverInfo) {
  if (!serverInfo || typeof serverInfo !== "string") {
    return { host: null, port: null };
  }
  let host, port;
  if (serverInfo.startsWith("[")) {
    const closeBracketIndex = serverInfo.indexOf("]");
    host = serverInfo.slice(1, closeBracketIndex);
    port = serverInfo.slice(closeBracketIndex + 2);
  } else {
    const lastColonIndex = serverInfo.lastIndexOf(":");
    host = serverInfo.slice(0, lastColonIndex);
    port = serverInfo.slice(lastColonIndex + 1);
  }
  return { host, port: parseInt(port) };
}
function parseUrlParams(url) {
  const [, rest] = url.split("://");
  const [addressPart, ...remainingParts] = rest.split("?");
  const paramsPart = remainingParts.join("?");
  const [paramsOnly, ...fragmentParts] = paramsPart.split("#");
  const searchParams = new URLSearchParams(paramsOnly);
  const params = Object.fromEntries(searchParams.entries());
  let name = fragmentParts.length > 0 ? fragmentParts.join("#") : "";
  try {
    name = decodeURIComponent(name);
  } catch (error) {
  }
  ;
  return { addressPart, params, name };
}
function createTlsConfig(params) {
  let tls = { enabled: false };
  if (params.security && params.security !== "none") {
    tls = {
      enabled: true,
      server_name: params.sni || params.host,
      insecure: !!params?.allowInsecure || !!params?.insecure || !!params?.allow_insecure
      // utls: {
      //   enabled: true,
      //   fingerprint: "chrome"
      // },
    };
    if (params.security === "reality") {
      tls.reality = {
        enabled: true,
        public_key: params.pbk,
        short_id: params.sid
      };
    }
  }
  return tls;
}
function createTransportConfig(params) {
  return {
    type: params.type,
    path: params.path ?? void 0,
    ...params.host && { "headers": { "host": params.host } },
    ...params.type === "grpc" && {
      service_name: params.serviceName ?? void 0
    }
  };
}
function parseBool(value, fallback = void 0) {
  if (value === void 0 || value === null) return fallback;
  if (typeof value === "boolean") return value;
  const lowered = String(value).toLowerCase();
  if (lowered === "true" || lowered === "1") return true;
  if (lowered === "false" || lowered === "0") return false;
  return fallback;
}
function parseMaybeNumber(value) {
  if (value === void 0 || value === null) return void 0;
  const num = Number(value);
  return Number.isNaN(num) ? void 0 : num;
}
function parseArray(value) {
  if (!value) return void 0;
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((entry) => entry.trim()).filter((entry) => entry.length > 0);
}
function parseCountryFromNodeName(nodeName) {
  const allEntries = Object.values(COUNTRY_DATA).flatMap(
    (c) => c.aliases.map((alias) => ({ alias, escaped: alias.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") }))
  );
  allEntries.sort((a, b) => b.alias.length - a.alias.length);
  const patterns = allEntries.map(({ alias, escaped }) => {
    if (alias.length <= 3 && /^[A-Za-z]+$/.test(alias)) {
      return `\\b${escaped}\\b`;
    }
    return escaped;
  });
  const regex = new RegExp(patterns.join("|"), "i");
  const match2 = nodeName.match(regex);
  if (match2) {
    const matchedAlias = match2[0];
    for (const code in COUNTRY_DATA) {
      if (COUNTRY_DATA[code].aliases.some((alias) => alias.toLowerCase() === matchedAlias.toLowerCase())) {
        return { code, ...COUNTRY_DATA[code] };
      }
    }
  }
  return null;
}
var PATH_LENGTH, FNV_32_OFFSET_BASIS, FNV_32_PRIME, COUNTRY_DATA;
var init_utils = __esm({
  "src/utils.js"() {
    PATH_LENGTH = 7;
    FNV_32_OFFSET_BASIS = 2166136261;
    FNV_32_PRIME = 16777619;
    COUNTRY_DATA = {
      "HK": { name: "Hong Kong", emoji: "\u{1F1ED}\u{1F1F0}", aliases: ["\u9999\u6E2F", "Hong Kong", "HK"] },
      "TW": { name: "Taiwan", emoji: "\u{1F1F9}\u{1F1FC}", aliases: ["\u53F0\u6E7E", "Taiwan", "TW"] },
      "JP": { name: "Japan", emoji: "\u{1F1EF}\u{1F1F5}", aliases: ["\u65E5\u672C", "Japan", "JP"] },
      "KR": { name: "Korea", emoji: "\u{1F1F0}\u{1F1F7}", aliases: ["\u97E9\u56FD", "Korea", "KR"] },
      "SG": { name: "Singapore", emoji: "\u{1F1F8}\u{1F1EC}", aliases: ["\u65B0\u52A0\u5761", "Singapore", "SG"] },
      "US": { name: "United States", emoji: "\u{1F1FA}\u{1F1F8}", aliases: ["\u7F8E\u56FD", "United States", "US"] },
      "GB": { name: "United Kingdom", emoji: "\u{1F1EC}\u{1F1E7}", aliases: ["\u82F1\u56FD", "United Kingdom", "UK", "GB"] },
      "DE": { name: "Germany", emoji: "\u{1F1E9}\u{1F1EA}", aliases: ["\u5FB7\u56FD", "Germany"] },
      "FR": { name: "France", emoji: "\u{1F1EB}\u{1F1F7}", aliases: ["\u6CD5\u56FD", "France"] },
      "RU": { name: "Russia", emoji: "\u{1F1F7}\u{1F1FA}", aliases: ["\u4FC4\u7F57\u65AF", "Russia"] },
      "CA": { name: "Canada", emoji: "\u{1F1E8}\u{1F1E6}", aliases: ["\u52A0\u62FF\u5927", "Canada"] },
      "AU": { name: "Australia", emoji: "\u{1F1E6}\u{1F1FA}", aliases: ["\u6FB3\u5927\u5229\u4E9A", "Australia"] },
      "IN": { name: "India", emoji: "\u{1F1EE}\u{1F1F3}", aliases: ["\u5370\u5EA6", "India"] },
      "BR": { name: "Brazil", emoji: "\u{1F1E7}\u{1F1F7}", aliases: ["\u5DF4\u897F", "Brazil"] },
      "ZA": { name: "South Africa", emoji: "\u{1F1FF}\u{1F1E6}", aliases: ["\u5357\u975E", "South Africa"] },
      "AR": { name: "Argentina", emoji: "\u{1F1E6}\u{1F1F7}", aliases: ["\u963F\u6839\u5EF7", "Argentina"] },
      "TR": { name: "Turkey", emoji: "\u{1F1F9}\u{1F1F7}", aliases: ["\u571F\u8033\u5176", "Turkey"] },
      "NL": { name: "Netherlands", emoji: "\u{1F1F3}\u{1F1F1}", aliases: ["\u8377\u5170", "Netherlands"] },
      "CH": { name: "Switzerland", emoji: "\u{1F1E8}\u{1F1ED}", aliases: ["\u745E\u58EB", "Switzerland"] },
      "SE": { name: "Sweden", emoji: "\u{1F1F8}\u{1F1EA}", aliases: ["\u745E\u5178", "Sweden"] },
      "IT": { name: "Italy", emoji: "\u{1F1EE}\u{1F1F9}", aliases: ["\u610F\u5927\u5229", "Italy"] },
      "ES": { name: "Spain", emoji: "\u{1F1EA}\u{1F1F8}", aliases: ["\u897F\u73ED\u7259", "Spain"] },
      "IE": { name: "Ireland", emoji: "\u{1F1EE}\u{1F1EA}", aliases: ["\u7231\u5C14\u5170", "Ireland"] },
      "MY": { name: "Malaysia", emoji: "\u{1F1F2}\u{1F1FE}", aliases: ["\u9A6C\u6765\u897F\u4E9A", "Malaysia"] },
      "TH": { name: "Thailand", emoji: "\u{1F1F9}\u{1F1ED}", aliases: ["\u6CF0\u56FD", "Thailand"] },
      "VN": { name: "Vietnam", emoji: "\u{1F1FB}\u{1F1F3}", aliases: ["\u8D8A\u5357", "Vietnam"] },
      "PH": { name: "Philippines", emoji: "\u{1F1F5}\u{1F1ED}", aliases: ["\u83F2\u5F8B\u5BBE", "Philippines"] },
      "ID": { name: "Indonesia", emoji: "\u{1F1EE}\u{1F1E9}", aliases: ["\u5370\u5EA6\u5C3C\u897F\u4E9A", "Indonesia"] },
      "NZ": { name: "New Zealand", emoji: "\u{1F1F3}\u{1F1FF}", aliases: ["\u65B0\u897F\u5170", "New Zealand"] },
      "AE": { name: "United Arab Emirates", emoji: "\u{1F1E6}\u{1F1EA}", aliases: ["\u963F\u8054\u914B", "United Arab Emirates"] }
    };
  }
});

// node_modules/js-yaml/dist/js-yaml.mjs
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function isNothing(subject) {
    return typeof subject === "undefined" || subject === null;
  }
  function isObject(subject) {
    return typeof subject === "object" && subject !== null;
  }
  function toArray2(sequence) {
    if (Array.isArray(sequence)) return sequence;
    else if (isNothing(sequence)) return [];
    return [sequence];
  }
  function extend(target, source) {
    if (source) {
      const sourceKeys = Object.keys(source);
      for (let index = 0, length = sourceKeys.length; index < length; index += 1) {
        const key = sourceKeys[index];
        target[key] = source[key];
      }
    }
    return target;
  }
  function repeat(string, count) {
    let result = "";
    for (let cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }
    return result;
  }
  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }
  common.isNothing = isNothing;
  common.isObject = isObject;
  common.toArray = toArray2;
  common.repeat = repeat;
  common.isNegativeZero = isNegativeZero;
  common.extend = extend;
  return common;
}
function requireException() {
  if (hasRequiredException) return exception;
  hasRequiredException = 1;
  function formatError(exception2, compact) {
    let where = "";
    const message = exception2.reason || "(unknown reason)";
    if (!exception2.mark) return message;
    if (exception2.mark.name) {
      where += 'in "' + exception2.mark.name + '" ';
    }
    where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
    if (!compact && exception2.mark.snippet) {
      where += "\n\n" + exception2.mark.snippet;
    }
    return message + " " + where;
  }
  function YAMLException2(reason, mark) {
    Error.call(this);
    this.name = "YAMLException";
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack || "";
    }
  }
  YAMLException2.prototype = Object.create(Error.prototype);
  YAMLException2.prototype.constructor = YAMLException2;
  YAMLException2.prototype.toString = function toString(compact) {
    return this.name + ": " + formatError(this, compact);
  };
  exception = YAMLException2;
  return exception;
}
function requireSnippet() {
  if (hasRequiredSnippet) return snippet;
  hasRequiredSnippet = 1;
  const common2 = requireCommon();
  function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
    let head = "";
    let tail = "";
    const maxHalfLength = Math.floor(maxLineLength / 2) - 1;
    if (position - lineStart > maxHalfLength) {
      head = " ... ";
      lineStart = position - maxHalfLength + head.length;
    }
    if (lineEnd - position > maxHalfLength) {
      tail = " ...";
      lineEnd = position + maxHalfLength - tail.length;
    }
    return {
      str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
      pos: position - lineStart + head.length
      // relative position
    };
  }
  function padStart(string, max) {
    return common2.repeat(" ", max - string.length) + string;
  }
  function makeSnippet(mark, options) {
    options = Object.create(options || null);
    if (!mark.buffer) return null;
    if (!options.maxLength) options.maxLength = 79;
    if (typeof options.indent !== "number") options.indent = 1;
    if (typeof options.linesBefore !== "number") options.linesBefore = 3;
    if (typeof options.linesAfter !== "number") options.linesAfter = 2;
    const re = /\r?\n|\r|\0/g;
    const lineStarts = [0];
    const lineEnds = [];
    let match2;
    let foundLineNo = -1;
    while (match2 = re.exec(mark.buffer)) {
      lineEnds.push(match2.index);
      lineStarts.push(match2.index + match2[0].length);
      if (mark.position <= match2.index && foundLineNo < 0) {
        foundLineNo = lineStarts.length - 2;
      }
    }
    if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
    let result = "";
    const lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
    const maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
    for (let i = 1; i <= options.linesBefore; i++) {
      if (foundLineNo - i < 0) break;
      const line2 = getLine(
        mark.buffer,
        lineStarts[foundLineNo - i],
        lineEnds[foundLineNo - i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
        maxLineLength
      );
      result = common2.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line2.str + "\n" + result;
    }
    const line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
    result += common2.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
    result += common2.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
    for (let i = 1; i <= options.linesAfter; i++) {
      if (foundLineNo + i >= lineEnds.length) break;
      const line2 = getLine(
        mark.buffer,
        lineStarts[foundLineNo + i],
        lineEnds[foundLineNo + i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
        maxLineLength
      );
      result += common2.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line2.str + "\n";
    }
    return result.replace(/\n$/, "");
  }
  snippet = makeSnippet;
  return snippet;
}
function requireType() {
  if (hasRequiredType) return type;
  hasRequiredType = 1;
  const YAMLException2 = requireException();
  const TYPE_CONSTRUCTOR_OPTIONS = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ];
  const YAML_NODE_KINDS = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function compileStyleAliases(map2) {
    const result = {};
    if (map2 !== null) {
      Object.keys(map2).forEach(function(style2) {
        map2[style2].forEach(function(alias) {
          result[String(alias)] = style2;
        });
      });
    }
    return result;
  }
  function Type2(tag, options) {
    options = options || {};
    Object.keys(options).forEach(function(name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new YAMLException2('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });
    this.options = options;
    this.tag = tag;
    this.kind = options["kind"] || null;
    this.resolve = options["resolve"] || function() {
      return true;
    };
    this.construct = options["construct"] || function(data) {
      return data;
    };
    this.instanceOf = options["instanceOf"] || null;
    this.predicate = options["predicate"] || null;
    this.represent = options["represent"] || null;
    this.representName = options["representName"] || null;
    this.defaultStyle = options["defaultStyle"] || null;
    this.multi = options["multi"] || false;
    this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new YAMLException2('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }
  type = Type2;
  return type;
}
function requireSchema() {
  if (hasRequiredSchema) return schema;
  hasRequiredSchema = 1;
  const YAMLException2 = requireException();
  const Type2 = requireType();
  function compileList(schema2, name) {
    const result = [];
    schema2[name].forEach(function(currentType) {
      let newIndex = result.length;
      result.forEach(function(previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
          newIndex = previousIndex;
        }
      });
      result[newIndex] = currentType;
    });
    return result;
  }
  function compileMap() {
    const result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    };
    function collectType(type2) {
      if (type2.multi) {
        result.multi[type2.kind].push(type2);
        result.multi["fallback"].push(type2);
      } else {
        result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
      }
    }
    for (let index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }
  function Schema2(definition) {
    return this.extend(definition);
  }
  Schema2.prototype.extend = function extend(definition) {
    let implicit = [];
    let explicit = [];
    if (definition instanceof Type2) {
      explicit.push(definition);
    } else if (Array.isArray(definition)) {
      explicit = explicit.concat(definition);
    } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      if (definition.implicit) implicit = implicit.concat(definition.implicit);
      if (definition.explicit) explicit = explicit.concat(definition.explicit);
    } else {
      throw new YAMLException2("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    }
    implicit.forEach(function(type2) {
      if (!(type2 instanceof Type2)) {
        throw new YAMLException2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      }
      if (type2.loadKind && type2.loadKind !== "scalar") {
        throw new YAMLException2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      }
      if (type2.multi) {
        throw new YAMLException2("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
      }
    });
    explicit.forEach(function(type2) {
      if (!(type2 instanceof Type2)) {
        throw new YAMLException2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      }
    });
    const result = Object.create(Schema2.prototype);
    result.implicit = (this.implicit || []).concat(implicit);
    result.explicit = (this.explicit || []).concat(explicit);
    result.compiledImplicit = compileList(result, "implicit");
    result.compiledExplicit = compileList(result, "explicit");
    result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
    return result;
  };
  schema = Schema2;
  return schema;
}
function requireStr() {
  if (hasRequiredStr) return str;
  hasRequiredStr = 1;
  const Type2 = requireType();
  str = new Type2("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(data) {
      return data !== null ? data : "";
    }
  });
  return str;
}
function requireSeq() {
  if (hasRequiredSeq) return seq;
  hasRequiredSeq = 1;
  const Type2 = requireType();
  seq = new Type2("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(data) {
      return data !== null ? data : [];
    }
  });
  return seq;
}
function requireMap() {
  if (hasRequiredMap) return map;
  hasRequiredMap = 1;
  const Type2 = requireType();
  map = new Type2("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(data) {
      return data !== null ? data : {};
    }
  });
  return map;
}
function requireFailsafe() {
  if (hasRequiredFailsafe) return failsafe;
  hasRequiredFailsafe = 1;
  const Schema2 = requireSchema();
  failsafe = new Schema2({
    explicit: [
      requireStr(),
      requireSeq(),
      requireMap()
    ]
  });
  return failsafe;
}
function require_null() {
  if (hasRequired_null) return _null;
  hasRequired_null = 1;
  const Type2 = requireType();
  function resolveYamlNull(data) {
    if (data === null) return true;
    const max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
  }
  function constructYamlNull() {
    return null;
  }
  function isNull(object) {
    return object === null;
  }
  _null = new Type2("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  });
  return _null;
}
function requireBool() {
  if (hasRequiredBool) return bool;
  hasRequiredBool = 1;
  const Type2 = requireType();
  function resolveYamlBoolean(data) {
    if (data === null) return false;
    const max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
  }
  function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
  }
  function isBoolean(object) {
    return Object.prototype.toString.call(object) === "[object Boolean]";
  }
  bool = new Type2("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function(object) {
        return object ? "true" : "false";
      },
      uppercase: function(object) {
        return object ? "TRUE" : "FALSE";
      },
      camelcase: function(object) {
        return object ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  });
  return bool;
}
function requireInt() {
  if (hasRequiredInt) return int;
  hasRequiredInt = 1;
  const common2 = requireCommon();
  const Type2 = requireType();
  function isHexCode(c) {
    return c >= 48 && c <= 57 || c >= 65 && c <= 70 || c >= 97 && c <= 102;
  }
  function isOctCode(c) {
    return c >= 48 && c <= 55;
  }
  function isDecCode(c) {
    return c >= 48 && c <= 57;
  }
  function resolveYamlInteger(data) {
    if (data === null) return false;
    const max = data.length;
    let index = 0;
    let hasDigits = false;
    if (!max) return false;
    let ch = data[index];
    if (ch === "-" || ch === "+") {
      ch = data[++index];
    }
    if (ch === "0") {
      if (index + 1 === max) return true;
      ch = data[++index];
      if (ch === "b") {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch !== "0" && ch !== "1") return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
      if (ch === "x") {
        index++;
        for (; index < max; index++) {
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
      if (ch === "o") {
        index++;
        for (; index < max; index++) {
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
    }
    for (; index < max; index++) {
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }
    if (!hasDigits) return false;
    return isFinite(parseYamlInteger(data));
  }
  function parseYamlInteger(data) {
    let value = data;
    let sign = 1;
    let ch = value[0];
    if (ch === "-" || ch === "+") {
      if (ch === "-") sign = -1;
      value = value.slice(1);
      ch = value[0];
    }
    if (value === "0") return 0;
    if (ch === "0") {
      if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
      if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
      if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
    }
    return sign * parseInt(value, 10);
  }
  function constructYamlInteger(data) {
    return parseYamlInteger(data);
  }
  function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common2.isNegativeZero(object));
  }
  int = new Type2("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function(obj) {
        return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
      },
      octal: function(obj) {
        return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
      },
      decimal: function(obj) {
        return obj.toString(10);
      },
      hexadecimal: function(obj) {
        return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  });
  return int;
}
function requireFloat() {
  if (hasRequiredFloat) return float;
  hasRequiredFloat = 1;
  const common2 = requireCommon();
  const Type2 = requireType();
  const YAML_FLOAT_PATTERN = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  const YAML_FLOAT_SPECIAL_PATTERN = new RegExp(
    "^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function resolveYamlFloat(data) {
    if (data === null) return false;
    if (!YAML_FLOAT_PATTERN.test(data)) {
      return false;
    }
    if (isFinite(parseFloat(data, 10))) {
      return true;
    }
    return YAML_FLOAT_SPECIAL_PATTERN.test(data);
  }
  function constructYamlFloat(data) {
    let value = data.toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    if ("+-".indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }
    if (value === ".inf") {
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (value === ".nan") {
      return NaN;
    }
    return sign * parseFloat(value, 10);
  }
  const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
  function representYamlFloat(object, style2) {
    if (isNaN(object)) {
      switch (style2) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style2) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style2) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    } else if (common2.isNegativeZero(object)) {
      return "-0.0";
    }
    const res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
  }
  function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common2.isNegativeZero(object));
  }
  float = new Type2("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: "lowercase"
  });
  return float;
}
function requireJson() {
  if (hasRequiredJson) return json;
  hasRequiredJson = 1;
  json = requireFailsafe().extend({
    implicit: [
      require_null(),
      requireBool(),
      requireInt(),
      requireFloat()
    ]
  });
  return json;
}
function requireCore() {
  if (hasRequiredCore) return core;
  hasRequiredCore = 1;
  core = requireJson();
  return core;
}
function requireTimestamp() {
  if (hasRequiredTimestamp) return timestamp;
  hasRequiredTimestamp = 1;
  const Type2 = requireType();
  const YAML_DATE_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  );
  const YAML_TIMESTAMP_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }
  function constructYamlTimestamp(data) {
    let fraction = 0;
    let delta = null;
    let match2 = YAML_DATE_REGEXP.exec(data);
    if (match2 === null) match2 = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match2 === null) throw new Error("Date resolve error");
    const year = +match2[1];
    const month = +match2[2] - 1;
    const day = +match2[3];
    if (!match2[4]) {
      return new Date(Date.UTC(year, month, day));
    }
    const hour = +match2[4];
    const minute = +match2[5];
    const second = +match2[6];
    if (match2[7]) {
      fraction = match2[7].slice(0, 3);
      while (fraction.length < 3) {
        fraction += "0";
      }
      fraction = +fraction;
    }
    if (match2[9]) {
      const tzHour = +match2[10];
      const tzMinute = +(match2[11] || 0);
      delta = (tzHour * 60 + tzMinute) * 6e4;
      if (match2[9] === "-") delta = -delta;
    }
    const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
  }
  function representYamlTimestamp(object) {
    return object.toISOString();
  }
  timestamp = new Type2("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });
  return timestamp;
}
function requireMerge() {
  if (hasRequiredMerge) return merge;
  hasRequiredMerge = 1;
  const Type2 = requireType();
  function resolveYamlMerge(data) {
    return data === "<<" || data === null;
  }
  merge = new Type2("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
  });
  return merge;
}
function requireBinary() {
  if (hasRequiredBinary) return binary;
  hasRequiredBinary = 1;
  const Type2 = requireType();
  const BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
  function resolveYamlBinary(data) {
    if (data === null) return false;
    let bitlen = 0;
    const max = data.length;
    const map2 = BASE64_MAP;
    for (let idx = 0; idx < max; idx++) {
      const code = map2.indexOf(data.charAt(idx));
      if (code > 64) continue;
      if (code < 0) return false;
      bitlen += 6;
    }
    return bitlen % 8 === 0;
  }
  function constructYamlBinary(data) {
    const input2 = data.replace(/[\r\n=]/g, "");
    const max = input2.length;
    const map2 = BASE64_MAP;
    let bits = 0;
    const result = [];
    for (let idx = 0; idx < max; idx++) {
      if (idx % 4 === 0 && idx) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      }
      bits = bits << 6 | map2.indexOf(input2.charAt(idx));
    }
    const tailbits = max % 4 * 6;
    if (tailbits === 0) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    } else if (tailbits === 18) {
      result.push(bits >> 10 & 255);
      result.push(bits >> 2 & 255);
    } else if (tailbits === 12) {
      result.push(bits >> 4 & 255);
    }
    return new Uint8Array(result);
  }
  function representYamlBinary(object) {
    let result = "";
    let bits = 0;
    const max = object.length;
    const map2 = BASE64_MAP;
    for (let idx = 0; idx < max; idx++) {
      if (idx % 3 === 0 && idx) {
        result += map2[bits >> 18 & 63];
        result += map2[bits >> 12 & 63];
        result += map2[bits >> 6 & 63];
        result += map2[bits & 63];
      }
      bits = (bits << 8) + object[idx];
    }
    const tail = max % 3;
    if (tail === 0) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    } else if (tail === 2) {
      result += map2[bits >> 10 & 63];
      result += map2[bits >> 4 & 63];
      result += map2[bits << 2 & 63];
      result += map2[64];
    } else if (tail === 1) {
      result += map2[bits >> 2 & 63];
      result += map2[bits << 4 & 63];
      result += map2[64];
      result += map2[64];
    }
    return result;
  }
  function isBinary(obj) {
    return Object.prototype.toString.call(obj) === "[object Uint8Array]";
  }
  binary = new Type2("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });
  return binary;
}
function requireOmap() {
  if (hasRequiredOmap) return omap;
  hasRequiredOmap = 1;
  const Type2 = requireType();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const _toString = Object.prototype.toString;
  function resolveYamlOmap(data) {
    if (data === null) return true;
    const objectKeys = [];
    const object = data;
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      let pairHasKey = false;
      if (_toString.call(pair) !== "[object Object]") return false;
      let pairKey;
      for (pairKey in pair) {
        if (_hasOwnProperty.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;
          else return false;
        }
      }
      if (!pairHasKey) return false;
      if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
      else return false;
    }
    return true;
  }
  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }
  omap = new Type2("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
  return omap;
}
function requirePairs() {
  if (hasRequiredPairs) return pairs;
  hasRequiredPairs = 1;
  const Type2 = requireType();
  const _toString = Object.prototype.toString;
  function resolveYamlPairs(data) {
    if (data === null) return true;
    const object = data;
    const result = new Array(object.length);
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      if (_toString.call(pair) !== "[object Object]") return false;
      const keys = Object.keys(pair);
      if (keys.length !== 1) return false;
      result[index] = [keys[0], pair[keys[0]]];
    }
    return true;
  }
  function constructYamlPairs(data) {
    if (data === null) return [];
    const object = data;
    const result = new Array(object.length);
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      const keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }
    return result;
  }
  pairs = new Type2("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
  return pairs;
}
function requireSet() {
  if (hasRequiredSet) return set;
  hasRequiredSet = 1;
  const Type2 = requireType();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveYamlSet(data) {
    if (data === null) return true;
    const object = data;
    for (const key in object) {
      if (_hasOwnProperty.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }
    return true;
  }
  function constructYamlSet(data) {
    return data !== null ? data : {};
  }
  set = new Type2("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });
  return set;
}
function require_default() {
  if (hasRequired_default) return _default;
  hasRequired_default = 1;
  _default = requireCore().extend({
    implicit: [
      requireTimestamp(),
      requireMerge()
    ],
    explicit: [
      requireBinary(),
      requireOmap(),
      requirePairs(),
      requireSet()
    ]
  });
  return _default;
}
function requireLoader() {
  if (hasRequiredLoader) return loader;
  hasRequiredLoader = 1;
  const common2 = requireCommon();
  const YAMLException2 = requireException();
  const makeSnippet = requireSnippet();
  const DEFAULT_SCHEMA2 = require_default();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const CONTEXT_FLOW_IN = 1;
  const CONTEXT_FLOW_OUT = 2;
  const CONTEXT_BLOCK_IN = 3;
  const CONTEXT_BLOCK_OUT = 4;
  const CHOMPING_CLIP = 1;
  const CHOMPING_STRIP = 2;
  const CHOMPING_KEEP = 3;
  const PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  const PATTERN_FLOW_INDICATORS = /[,\[\]{}]/;
  const PATTERN_TAG_HANDLE = /^(?:!|!!|![0-9A-Za-z-]+!)$/;
  const PATTERN_TAG_URI = /^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i;
  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }
  function isEol(c) {
    return c === 10 || c === 13;
  }
  function isWhiteSpace(c) {
    return c === 9 || c === 32;
  }
  function isWsOrEol(c) {
    return c === 9 || c === 32 || c === 10 || c === 13;
  }
  function isFlowIndicator(c) {
    return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
  }
  function fromHexCode(c) {
    if (c >= 48 && c <= 57) {
      return c - 48;
    }
    const lc = c | 32;
    if (lc >= 97 && lc <= 102) {
      return lc - 97 + 10;
    }
    return -1;
  }
  function escapedHexLen(c) {
    if (c === 120) {
      return 2;
    }
    if (c === 117) {
      return 4;
    }
    if (c === 85) {
      return 8;
    }
    return 0;
  }
  function fromDecimalCode(c) {
    if (c >= 48 && c <= 57) {
      return c - 48;
    }
    return -1;
  }
  function simpleEscapeSequence(c) {
    switch (c) {
      case 48:
        return "\0";
      case 97:
        return "\x07";
      case 98:
        return "\b";
      case 116:
        return "	";
      case 9:
        return "	";
      case 110:
        return "\n";
      case 118:
        return "\v";
      case 102:
        return "\f";
      case 114:
        return "\r";
      case 101:
        return "\x1B";
      case 32:
        return " ";
      case 34:
        return '"';
      case 47:
        return "/";
      case 92:
        return "\\";
      case 78:
        return "\x85";
      case 95:
        return "\xA0";
      case 76:
        return "\u2028";
      case 80:
        return "\u2029";
      default:
        return "";
    }
  }
  function charFromCodepoint(c) {
    if (c <= 65535) {
      return String.fromCharCode(c);
    }
    return String.fromCharCode(
      (c - 65536 >> 10) + 55296,
      (c - 65536 & 1023) + 56320
    );
  }
  function setProperty(object, key, value) {
    if (key === "__proto__") {
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value
      });
    } else {
      object[key] = value;
    }
  }
  const simpleEscapeCheck = new Array(256);
  const simpleEscapeMap = new Array(256);
  for (let i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }
  function State(input2, options) {
    this.input = input2;
    this.filename = options["filename"] || null;
    this.schema = options["schema"] || DEFAULT_SCHEMA2;
    this.onWarning = options["onWarning"] || null;
    this.legacy = options["legacy"] || false;
    this.json = options["json"] || false;
    this.listener = options["listener"] || null;
    this.maxDepth = typeof options["maxDepth"] === "number" ? options["maxDepth"] : 100;
    this.maxTotalMergeKeys = typeof options["maxTotalMergeKeys"] === "number" ? options["maxTotalMergeKeys"] : 1e4;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input2.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0;
    this.depth = 0;
    this.totalMergeKeys = 0;
    this.firstTabInLine = -1;
    this.documents = [];
    this.anchorMapTransactions = [];
  }
  function generateError(state, message) {
    const mark = {
      name: state.filename,
      buffer: state.input.slice(0, -1),
      // omit trailing \0
      position: state.position,
      line: state.line,
      column: state.position - state.lineStart
    };
    mark.snippet = makeSnippet(mark);
    return new YAMLException2(message, mark);
  }
  function throwError(state, message) {
    throw generateError(state, message);
  }
  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }
  function storeAnchor(state, name, value) {
    const transactions = state.anchorMapTransactions;
    if (transactions.length !== 0) {
      const transaction = transactions[transactions.length - 1];
      if (!_hasOwnProperty.call(transaction, name)) {
        transaction[name] = {
          existed: _hasOwnProperty.call(state.anchorMap, name),
          value: state.anchorMap[name]
        };
      }
    }
    state.anchorMap[name] = value;
  }
  function beginAnchorTransaction(state) {
    state.anchorMapTransactions.push(/* @__PURE__ */ Object.create(null));
  }
  function commitAnchorTransaction(state) {
    const transaction = state.anchorMapTransactions.pop();
    const transactions = state.anchorMapTransactions;
    if (transactions.length === 0) return;
    const parent = transactions[transactions.length - 1];
    const names = Object.keys(transaction);
    for (let index = 0, length = names.length; index < length; index += 1) {
      const name = names[index];
      if (!_hasOwnProperty.call(parent, name)) {
        parent[name] = transaction[name];
      }
    }
  }
  function rollbackAnchorTransaction(state) {
    const transaction = state.anchorMapTransactions.pop();
    const names = Object.keys(transaction);
    for (let index = names.length - 1; index >= 0; index -= 1) {
      const entry = transaction[names[index]];
      if (entry.existed) {
        state.anchorMap[names[index]] = entry.value;
      } else {
        delete state.anchorMap[names[index]];
      }
    }
  }
  function snapshotState(state) {
    return {
      position: state.position,
      line: state.line,
      lineStart: state.lineStart,
      lineIndent: state.lineIndent,
      firstTabInLine: state.firstTabInLine,
      tag: state.tag,
      anchor: state.anchor,
      kind: state.kind,
      result: state.result
    };
  }
  function restoreState(state, snapshot) {
    state.position = snapshot.position;
    state.line = snapshot.line;
    state.lineStart = snapshot.lineStart;
    state.lineIndent = snapshot.lineIndent;
    state.firstTabInLine = snapshot.firstTabInLine;
    state.tag = snapshot.tag;
    state.anchor = snapshot.anchor;
    state.kind = snapshot.kind;
    state.result = snapshot.result;
  }
  const directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      if (state.version !== null) {
        throwError(state, "duplication of %YAML directive");
      }
      if (args.length !== 1) {
        throwError(state, "YAML directive accepts exactly one argument");
      }
      const match2 = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
      if (match2 === null) {
        throwError(state, "ill-formed argument of the YAML directive");
      }
      const major = parseInt(match2[1], 10);
      const minor = parseInt(match2[2], 10);
      if (major !== 1) {
        throwError(state, "unacceptable YAML version of the document");
      }
      state.version = args[0];
      state.checkLineBreaks = minor < 2;
      if (minor !== 1 && minor !== 2) {
        throwWarning(state, "unsupported YAML version of the document");
      }
    },
    TAG: function handleTagDirective(state, name, args) {
      let prefix;
      if (args.length !== 2) {
        throwError(state, "TAG directive accepts exactly two arguments");
      }
      const handle = args[0];
      prefix = args[1];
      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
      }
      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }
      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
      }
      try {
        prefix = decodeURIComponent(prefix);
      } catch (err) {
        throwError(state, "tag prefix is malformed: " + prefix);
      }
      state.tagMap[handle] = prefix;
    }
  };
  function captureSegment(state, start, end, checkJson) {
    if (start < end) {
      const _result = state.input.slice(start, end);
      if (checkJson) {
        for (let _position = 0, _length = _result.length; _position < _length; _position += 1) {
          const _character = _result.charCodeAt(_position);
          if (!(_character === 9 || _character >= 32 && _character <= 1114111)) {
            throwError(state, "expected valid JSON character");
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, "the stream contains non-printable characters");
      }
      state.result += _result;
    }
  }
  function mergeMappings(state, destination, source, overridableKeys) {
    if (!common2.isObject(source)) {
      throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    const sourceKeys = Object.keys(source);
    for (let index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      const key = sourceKeys[index];
      if (state.maxTotalMergeKeys !== -1 && ++state.totalMergeKeys > state.maxTotalMergeKeys) {
        throwError(state, "merge keys exceeded maxTotalMergeKeys (" + state.maxTotalMergeKeys + ")");
      }
      if (!_hasOwnProperty.call(destination, key)) {
        setProperty(destination, key, source[key]);
        overridableKeys[key] = true;
      }
    }
  }
  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);
      for (let index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, "nested arrays are not supported inside keys");
        }
        if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
          keyNode[index] = "[object Object]";
        }
      }
    }
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
      keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (_result === null) {
      _result = {};
    }
    if (keyTag === "tag:yaml.org,2002:merge") {
      if (Array.isArray(valueNode)) {
        for (let index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.lineStart = startLineStart || state.lineStart;
        state.position = startPos || state.position;
        throwError(state, "duplicated mapping key");
      }
      setProperty(_result, keyNode, valueNode);
      delete overridableKeys[keyNode];
    }
    return _result;
  }
  function readLineBreak(state) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 10) {
      state.position++;
    } else if (ch === 13) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 10) {
        state.position++;
      }
    } else {
      throwError(state, "a line break is expected");
    }
    state.line += 1;
    state.lineStart = state.position;
    state.firstTabInLine = -1;
  }
  function skipSeparationSpace(state, allowComments, checkIndent) {
    let lineBreaks = 0;
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      while (isWhiteSpace(ch)) {
        if (ch === 9 && state.firstTabInLine === -1) {
          state.firstTabInLine = state.position;
        }
        ch = state.input.charCodeAt(++state.position);
      }
      if (allowComments && ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 10 && ch !== 13 && ch !== 0);
      }
      if (isEol(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;
        while (ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, "deficient indentation");
    }
    return lineBreaks;
  }
  function testDocumentSeparator(state) {
    let _position = state.position;
    let ch = state.input.charCodeAt(_position);
    if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);
      if (ch === 0 || isWsOrEol(ch)) {
        return true;
      }
    }
    return false;
  }
  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += " ";
    } else if (count > 1) {
      state.result += common2.repeat("\n", count - 1);
    }
  }
  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    let captureStart;
    let captureEnd;
    let hasPendingContent;
    let _line;
    let _lineStart;
    let _lineIndent;
    const _kind = state.kind;
    const _result = state.result;
    let ch = state.input.charCodeAt(state.position);
    if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
      return false;
    }
    if (ch === 63 || ch === 45) {
      const following = state.input.charCodeAt(state.position + 1);
      if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
        return false;
      }
    }
    state.kind = "scalar";
    state.result = "";
    captureStart = captureEnd = state.position;
    hasPendingContent = false;
    while (ch !== 0) {
      if (ch === 58) {
        const following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
          break;
        }
      } else if (ch === 35) {
        const preceding = state.input.charCodeAt(state.position - 1);
        if (isWsOrEol(preceding)) {
          break;
        }
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && isFlowIndicator(ch)) {
        break;
      } else if (isEol(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);
        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }
      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }
      if (!isWhiteSpace(ch)) {
        captureEnd = state.position + 1;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
      return true;
    }
    state.kind = _kind;
    state.result = _result;
    return false;
  }
  function readSingleQuotedScalar(state, nodeIndent) {
    let captureStart;
    let captureEnd;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 39) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 39) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (ch === 39) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }
      } else if (isEol(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a single quoted scalar");
      } else {
        state.position++;
        if (!isWhiteSpace(ch)) {
          captureEnd = state.position;
        }
      }
    }
    throwError(state, "unexpected end of the stream within a single quoted scalar");
  }
  function readDoubleQuotedScalar(state, nodeIndent) {
    let captureStart;
    let captureEnd;
    let tmp;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 34) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 34) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 92) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (isEol(ch)) {
          skipSeparationSpace(state, false, nodeIndent);
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          let hexLength = tmp;
          let hexResult = 0;
          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);
            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              throwError(state, "expected hexadecimal character");
            }
          }
          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else {
          throwError(state, "unknown escape sequence");
        }
        captureStart = captureEnd = state.position;
      } else if (isEol(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a double quoted scalar");
      } else {
        state.position++;
        if (!isWhiteSpace(ch)) {
          captureEnd = state.position;
        }
      }
    }
    throwError(state, "unexpected end of the stream within a double quoted scalar");
  }
  function readFlowCollection(state, nodeIndent) {
    let readNext = true;
    let _line;
    let _lineStart;
    let _pos;
    const _tag = state.tag;
    let _result;
    const _anchor = state.anchor;
    let terminator;
    let isPair;
    let isExplicitPair;
    let isMapping;
    const overridableKeys = /* @__PURE__ */ Object.create(null);
    let keyNode;
    let keyTag;
    let valueNode;
    let ch = state.input.charCodeAt(state.position);
    if (ch === 91) {
      terminator = 93;
      isMapping = false;
      _result = [];
    } else if (ch === 123) {
      terminator = 125;
      isMapping = true;
      _result = {};
    } else {
      return false;
    }
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    ch = state.input.charCodeAt(++state.position);
    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? "mapping" : "sequence";
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, "missed comma between flow collection entries");
      } else if (ch === 44) {
        throwError(state, "expected the node content, but found ','");
      }
      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;
      if (ch === 63) {
        const following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }
      _line = state.line;
      _lineStart = state.lineStart;
      _pos = state.position;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if ((isExplicitPair || state.line === _line) && ch === 58) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }
      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
      } else {
        _result.push(keyNode);
      }
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === 44) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }
    throwError(state, "unexpected end of the stream within a flow collection");
  }
  function readBlockScalar(state, nodeIndent) {
    let folding;
    let chomping = CHOMPING_CLIP;
    let didReadContent = false;
    let detectedIndent = false;
    let textIndent = nodeIndent;
    let emptyLines = 0;
    let atMoreIndented = false;
    let tmp;
    let ch = state.input.charCodeAt(state.position);
    if (ch === 124) {
      folding = false;
    } else if (ch === 62) {
      folding = true;
    } else {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
      if (ch === 43 || ch === 45) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, "repeat of a chomping mode identifier");
        }
      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, "repeat of an indentation width identifier");
        }
      } else {
        break;
      }
    }
    if (isWhiteSpace(ch)) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (isWhiteSpace(ch));
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (!isEol(ch) && ch !== 0);
      }
    }
    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);
      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }
      if (isEol(ch)) {
        emptyLines++;
        continue;
      }
      if (!detectedIndent && textIndent === 0) {
        throwError(state, "missing indentation for block scalar");
      }
      if (state.lineIndent < textIndent) {
        if (chomping === CHOMPING_KEEP) {
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            state.result += "\n";
          }
        }
        break;
      }
      if (folding) {
        if (isWhiteSpace(ch)) {
          atMoreIndented = true;
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common2.repeat("\n", emptyLines + 1);
        } else if (emptyLines === 0) {
          if (didReadContent) {
            state.result += " ";
          }
        } else {
          state.result += common2.repeat("\n", emptyLines);
        }
      } else {
        state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      }
      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      const captureStart = state.position;
      while (!isEol(ch) && ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, state.position, false);
    }
    return true;
  }
  function readBlockSequence(state, nodeIndent) {
    const _tag = state.tag;
    const _anchor = state.anchor;
    const _result = [];
    let detected = false;
    if (state.firstTabInLine !== -1) return false;
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, "tab characters must not be used in indentation");
      }
      if (ch !== 45) {
        break;
      }
      const following = state.input.charCodeAt(state.position + 1);
      if (!isWsOrEol(following)) {
        break;
      }
      detected = true;
      state.position++;
      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }
      const _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, "bad indentation of a sequence entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "sequence";
      state.result = _result;
      return true;
    }
    return false;
  }
  function readBlockMapping(state, nodeIndent, flowIndent) {
    let allowCompact;
    let _keyLine;
    let _keyLineStart;
    let _keyPos;
    const _tag = state.tag;
    const _anchor = state.anchor;
    const _result = {};
    const overridableKeys = /* @__PURE__ */ Object.create(null);
    let keyTag = null;
    let keyNode = null;
    let valueNode = null;
    let atExplicitKey = false;
    let detected = false;
    if (state.firstTabInLine !== -1) return false;
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (!atExplicitKey && state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, "tab characters must not be used in indentation");
      }
      const following = state.input.charCodeAt(state.position + 1);
      const _line = state.line;
      if ((ch === 63 || ch === 58) && isWsOrEol(following)) {
        if (ch === 63) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          atExplicitKey = false;
          allowCompact = true;
        } else {
          throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
        }
        state.position += 1;
        ch = following;
      } else {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
        if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          break;
        }
        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);
          while (isWhiteSpace(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 58) {
            ch = state.input.charCodeAt(++state.position);
            if (!isWsOrEol(ch)) {
              throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
            }
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected) {
            throwError(state, "can not read an implicit mapping pair; a colon is missed");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else if (detected) {
          throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      }
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (atExplicitKey) {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
        }
        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }
        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, "bad indentation of a mapping entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "mapping";
      state.result = _result;
    }
    return detected;
  }
  function readTagProperty(state) {
    let isVerbatim = false;
    let isNamed = false;
    let tagHandle;
    let tagName;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 33) return false;
    if (state.tag !== null) {
      throwError(state, "duplication of a tag property");
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 60) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 33) {
      isNamed = true;
      tagHandle = "!!";
      ch = state.input.charCodeAt(++state.position);
    } else {
      tagHandle = "!";
    }
    let _position = state.position;
    if (isVerbatim) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0 && ch !== 62);
      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, "unexpected end of the stream within a verbatim tag");
      }
    } else {
      while (ch !== 0 && !isWsOrEol(ch)) {
        if (ch === 33) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);
            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, "named tag handle cannot contain such characters");
            }
            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, "tag suffix cannot contain exclamation marks");
          }
        }
        ch = state.input.charCodeAt(++state.position);
      }
      tagName = state.input.slice(_position, state.position);
      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, "tag suffix cannot contain flow indicator characters");
      }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, "tag name cannot contain such characters: " + tagName);
    }
    try {
      tagName = decodeURIComponent(tagName);
    } catch (err) {
      throwError(state, "tag name is malformed: " + tagName);
    }
    if (isVerbatim) {
      state.tag = tagName;
    } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === "!") {
      state.tag = "!" + tagName;
    } else if (tagHandle === "!!") {
      state.tag = "tag:yaml.org,2002:" + tagName;
    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }
    return true;
  }
  function readAnchorProperty(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 38) return false;
    if (state.anchor !== null) {
      throwError(state, "duplication of an anchor property");
    }
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an anchor node must contain at least one character");
    }
    state.anchor = state.input.slice(_position, state.position);
    return true;
  }
  function readAlias(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 42) return false;
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an alias node must contain at least one character");
    }
    const alias = state.input.slice(_position, state.position);
    if (!_hasOwnProperty.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }
    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }
  function tryReadBlockMappingFromProperty(state, propertyStart, nodeIndent, flowIndent) {
    const fallbackState = snapshotState(state);
    beginAnchorTransaction(state);
    restoreState(state, propertyStart);
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    if (readBlockMapping(state, nodeIndent, flowIndent) && state.kind === "mapping") {
      commitAnchorTransaction(state);
      return true;
    }
    rollbackAnchorTransaction(state);
    restoreState(state, fallbackState);
    return false;
  }
  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    let allowBlockScalars;
    let allowBlockCollections;
    let indentStatus = 1;
    let atNewLine = false;
    let hasContent = false;
    let propertyStart = null;
    let type2;
    let flowIndent;
    let blockIndent;
    if (state.depth >= state.maxDepth) {
      throwError(state, "nesting exceeded maxDepth (" + state.maxDepth + ")");
    }
    state.depth += 1;
    if (state.listener !== null) {
      state.listener("open", state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }
    if (indentStatus === 1) {
      while (true) {
        const ch = state.input.charCodeAt(state.position);
        const propertyState = snapshotState(state);
        if (atNewLine && (ch === 33 && state.tag !== null || ch === 38 && state.anchor !== null)) {
          break;
        }
        if (!readTagProperty(state) && !readAnchorProperty(state)) {
          break;
        }
        if (propertyStart === null) {
          propertyStart = propertyState;
        }
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }
    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }
      blockIndent = state.position - state.lineStart;
      if (indentStatus === 1) {
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          const ch = state.input.charCodeAt(state.position);
          if (propertyStart !== null && allowBlockStyles && !allowBlockCollections && ch !== 124 && ch !== 62 && tryReadBlockMappingFromProperty(
            state,
            propertyStart,
            propertyStart.position - propertyStart.lineStart,
            flowIndent
          )) {
            hasContent = true;
          } else if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;
          } else if (readAlias(state)) {
            hasContent = true;
            if (state.tag !== null || state.anchor !== null) {
              throwError(state, "alias node should not have any properties");
            }
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;
            if (state.tag === null) {
              state.tag = "?";
            }
          }
          if (state.anchor !== null) {
            storeAnchor(state, state.anchor, state.result);
          }
        }
      } else if (indentStatus === 0) {
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }
    if (state.tag === null) {
      if (state.anchor !== null) {
        storeAnchor(state, state.anchor, state.result);
      }
    } else if (state.tag === "?") {
      if (state.result !== null && state.kind !== "scalar") {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }
      for (let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type2 = state.implicitTypes[typeIndex];
        if (type2.resolve(state.result)) {
          state.result = type2.construct(state.result);
          state.tag = type2.tag;
          if (state.anchor !== null) {
            storeAnchor(state, state.anchor, state.result);
          }
          break;
        }
      }
    } else if (state.tag !== "!") {
      if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
        type2 = state.typeMap[state.kind || "fallback"][state.tag];
      } else {
        type2 = null;
        const typeList = state.typeMap.multi[state.kind || "fallback"];
        for (let typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
          if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
            type2 = typeList[typeIndex];
            break;
          }
        }
      }
      if (!type2) {
        throwError(state, "unknown tag !<" + state.tag + ">");
      }
      if (state.result !== null && type2.kind !== state.kind) {
        throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
      }
      if (!type2.resolve(state.result, state.tag)) {
        throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
      } else {
        state.result = type2.construct(state.result, state.tag);
        if (state.anchor !== null) {
          storeAnchor(state, state.anchor, state.result);
        }
      }
    }
    if (state.listener !== null) {
      state.listener("close", state);
    }
    state.depth -= 1;
    return state.tag !== null || state.anchor !== null || hasContent;
  }
  function readDocument(state) {
    const documentStart = state.position;
    let hasDirectives = false;
    let ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = /* @__PURE__ */ Object.create(null);
    state.anchorMap = /* @__PURE__ */ Object.create(null);
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if (state.lineIndent > 0 || ch !== 37) {
        break;
      }
      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      let _position = state.position;
      while (ch !== 0 && !isWsOrEol(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      const directiveName = state.input.slice(_position, state.position);
      const directiveArgs = [];
      if (directiveName.length < 1) {
        throwError(state, "directive name must not be less than one character in length");
      }
      while (ch !== 0) {
        while (isWhiteSpace(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0 && !isEol(ch));
          break;
        }
        if (isEol(ch)) break;
        _position = state.position;
        while (ch !== 0 && !isWsOrEol(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveArgs.push(state.input.slice(_position, state.position));
      }
      if (ch !== 0) readLineBreak(state);
      if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
      throwError(state, "directives end mark is expected");
    }
    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, "non-ASCII line breaks are interpreted as content");
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 46) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }
    if (state.position < state.length - 1) {
      throwError(state, "end of the stream or a document separator is expected");
    }
  }
  function loadDocuments(input2, options) {
    input2 = String(input2);
    options = options || {};
    if (input2.length !== 0) {
      if (input2.charCodeAt(input2.length - 1) !== 10 && input2.charCodeAt(input2.length - 1) !== 13) {
        input2 += "\n";
      }
      if (input2.charCodeAt(0) === 65279) {
        input2 = input2.slice(1);
      }
    }
    const state = new State(input2, options);
    const nullpos = input2.indexOf("\0");
    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, "null byte is not allowed in input");
    }
    state.input += "\0";
    while (state.input.charCodeAt(state.position) === 32) {
      state.lineIndent += 1;
      state.position += 1;
    }
    while (state.position < state.length - 1) {
      readDocument(state);
    }
    return state.documents;
  }
  function loadAll2(input2, iterator, options) {
    if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
      options = iterator;
      iterator = null;
    }
    const documents = loadDocuments(input2, options);
    if (typeof iterator !== "function") {
      return documents;
    }
    for (let index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }
  function load2(input2, options) {
    const documents = loadDocuments(input2, options);
    if (documents.length === 0) {
      return void 0;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new YAMLException2("expected a single document in the stream, but found more");
  }
  loader.loadAll = loadAll2;
  loader.load = load2;
  return loader;
}
function requireDumper() {
  if (hasRequiredDumper) return dumper;
  hasRequiredDumper = 1;
  const common2 = requireCommon();
  const YAMLException2 = requireException();
  const DEFAULT_SCHEMA2 = require_default();
  const _toString = Object.prototype.toString;
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const CHAR_BOM = 65279;
  const CHAR_TAB = 9;
  const CHAR_LINE_FEED = 10;
  const CHAR_CARRIAGE_RETURN = 13;
  const CHAR_SPACE = 32;
  const CHAR_EXCLAMATION = 33;
  const CHAR_DOUBLE_QUOTE = 34;
  const CHAR_SHARP = 35;
  const CHAR_PERCENT = 37;
  const CHAR_AMPERSAND = 38;
  const CHAR_SINGLE_QUOTE = 39;
  const CHAR_ASTERISK = 42;
  const CHAR_COMMA = 44;
  const CHAR_MINUS = 45;
  const CHAR_COLON = 58;
  const CHAR_EQUALS = 61;
  const CHAR_GREATER_THAN = 62;
  const CHAR_QUESTION = 63;
  const CHAR_COMMERCIAL_AT = 64;
  const CHAR_LEFT_SQUARE_BRACKET = 91;
  const CHAR_RIGHT_SQUARE_BRACKET = 93;
  const CHAR_GRAVE_ACCENT = 96;
  const CHAR_LEFT_CURLY_BRACKET = 123;
  const CHAR_VERTICAL_LINE = 124;
  const CHAR_RIGHT_CURLY_BRACKET = 125;
  const ESCAPE_SEQUENCES = {};
  ESCAPE_SEQUENCES[0] = "\\0";
  ESCAPE_SEQUENCES[7] = "\\a";
  ESCAPE_SEQUENCES[8] = "\\b";
  ESCAPE_SEQUENCES[9] = "\\t";
  ESCAPE_SEQUENCES[10] = "\\n";
  ESCAPE_SEQUENCES[11] = "\\v";
  ESCAPE_SEQUENCES[12] = "\\f";
  ESCAPE_SEQUENCES[13] = "\\r";
  ESCAPE_SEQUENCES[27] = "\\e";
  ESCAPE_SEQUENCES[34] = '\\"';
  ESCAPE_SEQUENCES[92] = "\\\\";
  ESCAPE_SEQUENCES[133] = "\\N";
  ESCAPE_SEQUENCES[160] = "\\_";
  ESCAPE_SEQUENCES[8232] = "\\L";
  ESCAPE_SEQUENCES[8233] = "\\P";
  const DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ];
  const DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function compileStyleMap(schema2, map2) {
    if (map2 === null) return {};
    const result = {};
    const keys = Object.keys(map2);
    for (let index = 0, length = keys.length; index < length; index += 1) {
      let tag = keys[index];
      let style2 = String(map2[tag]);
      if (tag.slice(0, 2) === "!!") {
        tag = "tag:yaml.org,2002:" + tag.slice(2);
      }
      const type2 = schema2.compiledTypeMap["fallback"][tag];
      if (type2 && _hasOwnProperty.call(type2.styleAliases, style2)) {
        style2 = type2.styleAliases[style2];
      }
      result[tag] = style2;
    }
    return result;
  }
  function encodeHex(character) {
    let handle;
    let length;
    const string = character.toString(16).toUpperCase();
    if (character <= 255) {
      handle = "x";
      length = 2;
    } else if (character <= 65535) {
      handle = "u";
      length = 4;
    } else if (character <= 4294967295) {
      handle = "U";
      length = 8;
    } else {
      throw new YAMLException2("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return "\\" + handle + common2.repeat("0", length - string.length) + string;
  }
  const QUOTING_TYPE_SINGLE = 1;
  const QUOTING_TYPE_DOUBLE = 2;
  function State(options) {
    this.schema = options["schema"] || DEFAULT_SCHEMA2;
    this.indent = Math.max(1, options["indent"] || 2);
    this.noArrayIndent = options["noArrayIndent"] || false;
    this.skipInvalid = options["skipInvalid"] || false;
    this.flowLevel = common2.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
    this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
    this.sortKeys = options["sortKeys"] || false;
    this.lineWidth = options["lineWidth"] || 80;
    this.noRefs = options["noRefs"] || false;
    this.noCompatMode = options["noCompatMode"] || false;
    this.condenseFlow = options["condenseFlow"] || false;
    this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
    this.forceQuotes = options["forceQuotes"] || false;
    this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;
    this.tag = null;
    this.result = "";
    this.duplicates = [];
    this.usedDuplicates = null;
  }
  function indentString(string, spaces) {
    const ind = common2.repeat(" ", spaces);
    let position = 0;
    let result = "";
    const length = string.length;
    while (position < length) {
      let line;
      const next = string.indexOf("\n", position);
      if (next === -1) {
        line = string.slice(position);
        position = length;
      } else {
        line = string.slice(position, next + 1);
        position = next + 1;
      }
      if (line.length && line !== "\n") result += ind;
      result += line;
    }
    return result;
  }
  function generateNextLine(state, level) {
    return "\n" + common2.repeat(" ", state.indent * level);
  }
  function testImplicitResolving(state, str2) {
    for (let index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      const type2 = state.implicitTypes[index];
      if (type2.resolve(str2)) {
        return true;
      }
    }
    return false;
  }
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  }
  function isPrintable(c) {
    return c >= 32 && c <= 126 || c >= 161 && c <= 55295 && c !== 8232 && c !== 8233 || c >= 57344 && c <= 65533 && c !== CHAR_BOM || c >= 65536 && c <= 1114111;
  }
  function isNsCharOrWhitespace(c) {
    return isPrintable(c) && c !== CHAR_BOM && // - b-char
    c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
  }
  function isPlainSafe(c, prev, inblock) {
    const cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
    const cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
    return (
      // ns-plain-safe
      (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && // - c-flow-indicator
      c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && // ns-plain-char
      c !== CHAR_SHARP && // false on '#'
      !(prev === CHAR_COLON && !cIsNsChar) || // false on ': '
      isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || // change to true on '[^ ]#'
      prev === CHAR_COLON && cIsNsChar
    );
  }
  function isPlainSafeFirst(c) {
    return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && // | “%” | “@” | “`”)
    c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
  }
  function isPlainSafeLast(c) {
    return !isWhitespace(c) && c !== CHAR_COLON;
  }
  function codePointAt(string, pos) {
    const first = string.charCodeAt(pos);
    let second;
    if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
      second = string.charCodeAt(pos + 1);
      if (second >= 56320 && second <= 57343) {
        return (first - 55296) * 1024 + second - 56320 + 65536;
      }
    }
    return first;
  }
  function needIndentIndicator(string) {
    const leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
  }
  const STYLE_PLAIN = 1;
  const STYLE_SINGLE = 2;
  const STYLE_LITERAL = 3;
  const STYLE_FOLDED = 4;
  const STYLE_DOUBLE = 5;
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
    let i;
    let char = 0;
    let prevChar = null;
    let hasLineBreak = false;
    let hasFoldableLine = false;
    const shouldTrackWidth = lineWidth !== -1;
    let previousLineBreak = -1;
    let plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
    if (singleLineOnly || forceQuotes) {
      for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
    } else {
      for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true;
          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
            i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
      hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
    }
    if (!hasLineBreak && !hasFoldableLine) {
      if (plain && !forceQuotes && !testAmbiguousType(string)) {
        return STYLE_PLAIN;
      }
      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    }
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
      return STYLE_DOUBLE;
    }
    if (!forceQuotes) {
      return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  function writeScalar(state, string, level, iskey, inblock) {
    state.dump = (function() {
      if (string.length === 0) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
      }
      if (!state.noCompatMode) {
        if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
          return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
        }
      }
      const indent = state.indent * Math.max(1, level);
      const lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
      const singleLineOnly = iskey || // No block styles in flow mode.
      state.flowLevel > -1 && level >= state.flowLevel;
      function testAmbiguity(string2) {
        return testImplicitResolving(state, string2);
      }
      switch (chooseScalarStyle(
        string,
        singleLineOnly,
        state.indent,
        lineWidth,
        testAmbiguity,
        state.quotingType,
        state.forceQuotes && !iskey,
        inblock
      )) {
        case STYLE_PLAIN:
          return string;
        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
        case STYLE_FOLDED:
          return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string) + '"';
        default:
          throw new YAMLException2("impossible error: invalid scalar style");
      }
    })();
  }
  function blockHeader(string, indentPerLevel) {
    const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
    const clip = string[string.length - 1] === "\n";
    const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
    const chomp = keep ? "+" : clip ? "" : "-";
    return indentIndicator + chomp + "\n";
  }
  function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
  }
  function foldString(string, width) {
    const lineRe = /(\n+)([^\n]*)/g;
    let result = (function() {
      let nextLF = string.indexOf("\n");
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    })();
    let prevMoreIndented = string[0] === "\n" || string[0] === " ";
    let moreIndented;
    let match2;
    while (match2 = lineRe.exec(string)) {
      const prefix = match2[1];
      const line = match2[2];
      moreIndented = line[0] === " ";
      result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }
    return result;
  }
  function foldLine(line, width) {
    if (line === "" || line[0] === " ") return line;
    const breakRe = / [^ ]/g;
    let match2;
    let start = 0;
    let end;
    let curr = 0;
    let next = 0;
    let result = "";
    while (match2 = breakRe.exec(line)) {
      next = match2.index;
      if (next - start > width) {
        end = curr > start ? curr : next;
        result += "\n" + line.slice(start, end);
        start = end + 1;
      }
      curr = next;
    }
    result += "\n";
    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }
    return result.slice(1);
  }
  function escapeString(string) {
    let result = "";
    let char = 0;
    for (let i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      const escapeSeq = ESCAPE_SEQUENCES[char];
      if (!escapeSeq && isPrintable(char)) {
        result += string[i];
        if (char >= 65536) result += string[i + 1];
      } else {
        result += escapeSeq || encodeHex(char);
      }
    }
    return result;
  }
  function writeFlowSequence(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
      let value = object[index];
      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      }
      if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
        if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = "[" + _result + "]";
  }
  function writeBlockSequence(state, level, object, compact) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
      let value = object[index];
      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      }
      if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
        if (!compact || _result !== "") {
          _result += generateNextLine(state, level);
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += "-";
        } else {
          _result += "- ";
        }
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = _result || "[]";
  }
  function writeFlowMapping(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    const objectKeyList = Object.keys(object);
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
      let pairBuffer = "";
      if (_result !== "") pairBuffer += ", ";
      if (state.condenseFlow) pairBuffer += '"';
      const objectKey = objectKeyList[index];
      let objectValue = object[objectKey];
      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }
      if (!writeNode(state, level, objectKey, false, false)) {
        continue;
      }
      if (state.dump.length > 1024) pairBuffer += "? ";
      pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
      if (!writeNode(state, level, objectValue, false, false)) {
        continue;
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = "{" + _result + "}";
  }
  function writeBlockMapping(state, level, object, compact) {
    let _result = "";
    const _tag = state.tag;
    const objectKeyList = Object.keys(object);
    if (state.sortKeys === true) {
      objectKeyList.sort();
    } else if (typeof state.sortKeys === "function") {
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      throw new YAMLException2("sortKeys must be a boolean or a function");
    }
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
      let pairBuffer = "";
      if (!compact || _result !== "") {
        pairBuffer += generateNextLine(state, level);
      }
      const objectKey = objectKeyList[index];
      let objectValue = object[objectKey];
      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }
      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue;
      }
      const explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += "?";
        } else {
          pairBuffer += "? ";
        }
      }
      pairBuffer += state.dump;
      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }
      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue;
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ":";
      } else {
        pairBuffer += ": ";
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}";
  }
  function detectType(state, object, explicit) {
    const typeList = explicit ? state.explicitTypes : state.implicitTypes;
    for (let index = 0, length = typeList.length; index < length; index += 1) {
      const type2 = typeList[index];
      if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
        if (explicit) {
          if (type2.multi && type2.representName) {
            state.tag = type2.representName(object);
          } else {
            state.tag = type2.tag;
          }
        } else {
          state.tag = "?";
        }
        if (type2.represent) {
          const style2 = state.styleMap[type2.tag] || type2.defaultStyle;
          let _result;
          if (_toString.call(type2.represent) === "[object Function]") {
            _result = type2.represent(object, style2);
          } else if (_hasOwnProperty.call(type2.represent, style2)) {
            _result = type2.represent[style2](object, style2);
          } else {
            throw new YAMLException2("!<" + type2.tag + '> tag resolver accepts not "' + style2 + '" style');
          }
          state.dump = _result;
        }
        return true;
      }
    }
    return false;
  }
  function writeNode(state, level, object, block, compact, iskey, isblockseq) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }
    const type2 = _toString.call(state.dump);
    const inblock = block;
    if (block) {
      block = state.flowLevel < 0 || state.flowLevel > level;
    }
    const objectOrArray = type2 === "[object Object]" || type2 === "[object Array]";
    let duplicateIndex;
    let duplicate;
    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
      compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = "*ref_" + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }
      if (type2 === "[object Object]") {
        if (block && Object.keys(state.dump).length !== 0) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object Array]") {
        if (block && state.dump.length !== 0) {
          if (state.noArrayIndent && !isblockseq && level > 0) {
            writeBlockSequence(state, level - 1, state.dump, compact);
          } else {
            writeBlockSequence(state, level, state.dump, compact);
          }
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, level, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object String]") {
        if (state.tag !== "?") {
          writeScalar(state, state.dump, level, iskey, inblock);
        }
      } else if (type2 === "[object Undefined]") {
        return false;
      } else {
        if (state.skipInvalid) return false;
        throw new YAMLException2("unacceptable kind of an object to dump " + type2);
      }
      if (state.tag !== null && state.tag !== "?") {
        let tagStr = encodeURI(
          state.tag[0] === "!" ? state.tag.slice(1) : state.tag
        ).replace(/!/g, "%21");
        if (state.tag[0] === "!") {
          tagStr = "!" + tagStr;
        } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
          tagStr = "!!" + tagStr.slice(18);
        } else {
          tagStr = "!<" + tagStr + ">";
        }
        state.dump = tagStr + " " + state.dump;
      }
    }
    return true;
  }
  function getDuplicateReferences(object, state) {
    const objects = [];
    const duplicatesIndexes = [];
    inspectNode(object, objects, duplicatesIndexes);
    const length = duplicatesIndexes.length;
    for (let index = 0; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
  }
  function inspectNode(object, objects, duplicatesIndexes) {
    if (object !== null && typeof object === "object") {
      const index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);
        if (Array.isArray(object)) {
          for (let i = 0, length = object.length; i < length; i += 1) {
            inspectNode(object[i], objects, duplicatesIndexes);
          }
        } else {
          const objectKeyList = Object.keys(object);
          for (let i = 0, length = objectKeyList.length; i < length; i += 1) {
            inspectNode(object[objectKeyList[i]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }
  function dump2(input2, options) {
    options = options || {};
    const state = new State(options);
    if (!state.noRefs) getDuplicateReferences(input2, state);
    let value = input2;
    if (state.replacer) {
      value = state.replacer.call({ "": value }, "", value);
    }
    if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
    return "";
  }
  dumper.dump = dump2;
  return dumper;
}
function requireJsYaml() {
  if (hasRequiredJsYaml) return jsYaml;
  hasRequiredJsYaml = 1;
  const loader2 = requireLoader();
  const dumper2 = requireDumper();
  function renamed(from, to) {
    return function() {
      throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
    };
  }
  jsYaml.Type = requireType();
  jsYaml.Schema = requireSchema();
  jsYaml.FAILSAFE_SCHEMA = requireFailsafe();
  jsYaml.JSON_SCHEMA = requireJson();
  jsYaml.CORE_SCHEMA = requireCore();
  jsYaml.DEFAULT_SCHEMA = require_default();
  jsYaml.load = loader2.load;
  jsYaml.loadAll = loader2.loadAll;
  jsYaml.dump = dumper2.dump;
  jsYaml.YAMLException = requireException();
  jsYaml.types = {
    binary: requireBinary(),
    float: requireFloat(),
    map: requireMap(),
    null: require_null(),
    pairs: requirePairs(),
    set: requireSet(),
    timestamp: requireTimestamp(),
    bool: requireBool(),
    int: requireInt(),
    merge: requireMerge(),
    omap: requireOmap(),
    seq: requireSeq(),
    str: requireStr()
  };
  jsYaml.safeLoad = renamed("safeLoad", "load");
  jsYaml.safeLoadAll = renamed("safeLoadAll", "loadAll");
  jsYaml.safeDump = renamed("safeDump", "dump");
  return jsYaml;
}
var jsYaml, loader, common, hasRequiredCommon, exception, hasRequiredException, snippet, hasRequiredSnippet, type, hasRequiredType, schema, hasRequiredSchema, str, hasRequiredStr, seq, hasRequiredSeq, map, hasRequiredMap, failsafe, hasRequiredFailsafe, _null, hasRequired_null, bool, hasRequiredBool, int, hasRequiredInt, float, hasRequiredFloat, json, hasRequiredJson, core, hasRequiredCore, timestamp, hasRequiredTimestamp, merge, hasRequiredMerge, binary, hasRequiredBinary, omap, hasRequiredOmap, pairs, hasRequiredPairs, set, hasRequiredSet, _default, hasRequired_default, hasRequiredLoader, dumper, hasRequiredDumper, hasRequiredJsYaml, jsYamlExports, yaml, Type, Schema, FAILSAFE_SCHEMA, JSON_SCHEMA, CORE_SCHEMA, DEFAULT_SCHEMA, load, loadAll, dump, YAMLException, types, safeLoad, safeLoadAll, safeDump;
var init_js_yaml = __esm({
  "node_modules/js-yaml/dist/js-yaml.mjs"() {
    jsYaml = {};
    loader = {};
    common = {};
    dumper = {};
    jsYamlExports = requireJsYaml();
    yaml = /* @__PURE__ */ getDefaultExportFromCjs(jsYamlExports);
    ({
      Type,
      Schema,
      FAILSAFE_SCHEMA,
      JSON_SCHEMA,
      CORE_SCHEMA,
      DEFAULT_SCHEMA,
      load,
      loadAll,
      dump,
      YAMLException,
      types,
      safeLoad,
      safeLoadAll,
      safeDump
    } = yaml);
  }
});

// src/parsers/convertYamlProxyToObject.js
function convertYamlProxyToObject(p) {
  if (!p || typeof p !== "object" || !p.type) return null;
  const type2 = String(p.type).toLowerCase();
  const name = p.name || p.tag || "proxy";
  const toArray2 = (value) => {
    if (value === void 0 || value === null) return void 0;
    return Array.isArray(value) ? value : [value];
  };
  switch (type2) {
    case "ss":
    case "shadowsocks":
      return {
        tag: name,
        type: "shadowsocks",
        server: p.server,
        server_port: parseInt(p.port),
        method: p.cipher || p.method,
        password: p.password,
        network: "tcp",
        tcp_fast_open: !!p["fast-open"],
        udp: typeof p.udp !== "undefined" ? !!p.udp : void 0,
        plugin: p.plugin,
        plugin_opts: p["plugin-opts"]
      };
    case "vmess": {
      const tlsEnabled = !!p.tls;
      const tls = tlsEnabled ? {
        enabled: true,
        server_name: p.servername || p.sni,
        insecure: !!p["skip-cert-verify"]
      } : { enabled: false };
      const transport = (() => {
        const net = p.network || p["network-type"];
        if (net === "ws") {
          const w = p["ws-opts"] || {};
          return { type: "ws", path: w.path, headers: w.headers };
        }
        if (net === "grpc") {
          const g = p["grpc-opts"] || {};
          return { type: "grpc", service_name: g["grpc-service-name"] };
        }
        if (net === "http") {
          const h = p["http-opts"] || {};
          return { type: "http", method: h.method || "GET", path: h.path, headers: h.headers };
        }
        if (net === "h2") {
          const h2 = p["h2-opts"] || {};
          return { type: "h2", path: h2.path, host: h2.host };
        }
        return void 0;
      })();
      return {
        tag: name,
        type: "vmess",
        server: p.server,
        server_port: parseInt(p.port),
        uuid: p.uuid,
        alter_id: typeof p.alterId !== "undefined" ? parseInt(p.alterId) : 0,
        security: p.cipher || p.security || "auto",
        network: transport?.type || p.network || "tcp",
        tcp_fast_open: typeof p["fast-open"] !== "undefined" ? !!p["fast-open"] : false,
        transport,
        tls,
        udp: typeof p.udp !== "undefined" ? !!p.udp : void 0,
        packet_encoding: p["packet-encoding"],
        alpn: toArray2(p.alpn)
      };
    }
    case "vless": {
      const tlsEnabled = !!p.tls;
      const reality = p["reality-opts"];
      const tls = tlsEnabled ? {
        enabled: true,
        server_name: p.servername || p.sni,
        insecure: !!p["skip-cert-verify"],
        ...reality ? { reality: { enabled: true, public_key: reality["public-key"], short_id: reality["short-id"] } } : {}
      } : { enabled: false };
      if (p["client-fingerprint"]) {
        tls.utls = {
          enabled: true,
          fingerprint: p["client-fingerprint"]
        };
      }
      const transport = (() => {
        const net = p.network;
        if (net === "ws") {
          const w = p["ws-opts"] || {};
          return { type: "ws", path: w.path, headers: w.headers };
        }
        if (net === "grpc") {
          const g = p["grpc-opts"] || {};
          return { type: "grpc", service_name: g["grpc-service-name"] };
        }
        if (net === "http") {
          const h = p["http-opts"] || {};
          return { type: "http", method: h.method || "GET", path: h.path, headers: h.headers };
        }
        if (net === "h2") {
          const h2 = p["h2-opts"] || {};
          return { type: "h2", path: h2.path, host: h2.host };
        }
        return void 0;
      })();
      return {
        tag: name,
        type: "vless",
        server: p.server,
        server_port: parseInt(p.port),
        uuid: p.uuid,
        tcp_fast_open: typeof p["fast-open"] !== "undefined" ? !!p["fast-open"] : false,
        tls,
        transport,
        network: transport?.type || "tcp",
        flow: p.flow ?? void 0,
        udp: typeof p.udp !== "undefined" ? !!p.udp : void 0,
        packet_encoding: p["packet-encoding"],
        alpn: toArray2(p.alpn)
      };
    }
    case "trojan": {
      const tlsEnabled = !!p.tls;
      const reality = p["reality-opts"];
      const tls = tlsEnabled ? {
        enabled: true,
        server_name: p.servername || p.sni,
        insecure: !!p["skip-cert-verify"],
        ...reality ? { reality: { enabled: true, public_key: reality["public-key"], short_id: reality["short-id"] } } : {}
      } : { enabled: false };
      if (p["client-fingerprint"]) {
        tls.utls = {
          enabled: true,
          fingerprint: p["client-fingerprint"]
        };
      }
      const transport = (() => {
        const net = p.network;
        if (net === "ws") {
          const w = p["ws-opts"] || {};
          return { type: "ws", path: w.path, headers: w.headers };
        }
        if (net === "grpc") {
          const g = p["grpc-opts"] || {};
          return { type: "grpc", service_name: g["grpc-service-name"] };
        }
        if (net === "http") {
          const h = p["http-opts"] || {};
          return { type: "http", method: h.method || "GET", path: h.path, headers: h.headers };
        }
        if (net === "h2") {
          const h2 = p["h2-opts"] || {};
          return { type: "h2", path: h2.path, host: h2.host };
        }
        return void 0;
      })();
      return {
        type: "trojan",
        tag: name,
        server: p.server,
        server_port: parseInt(p.port),
        password: p.password,
        network: transport?.type || p.network || "tcp",
        tcp_fast_open: typeof p["fast-open"] !== "undefined" ? !!p["fast-open"] : false,
        tls,
        transport,
        flow: p.flow ?? void 0,
        alpn: toArray2(p.alpn)
      };
    }
    case "hysteria2":
    case "hysteria":
    case "hy2": {
      const tls = {
        enabled: true,
        server_name: p.sni,
        insecure: !!p["skip-cert-verify"]
      };
      const obfs = {};
      if (p.obfs) {
        obfs.type = p.obfs;
        obfs.password = p["obfs-password"];
      }
      const hopIntervalRaw = p["hop-interval"];
      const hopInterval = Number(hopIntervalRaw);
      return {
        tag: name,
        type: "hysteria2",
        server: p.server,
        server_port: parseInt(p.port),
        password: p.password,
        tls,
        obfs: Object.keys(obfs).length > 0 ? obfs : void 0,
        auth: p.auth,
        recv_window_conn: p["recv-window-conn"],
        up: p.up,
        down: p.down,
        ports: p.ports,
        hop_interval: Number.isNaN(hopInterval) ? hopIntervalRaw : hopInterval,
        alpn: toArray2(p.alpn),
        fast_open: typeof p["fast-open"] !== "undefined" ? !!p["fast-open"] : void 0
      };
    }
    case "tuic": {
      return {
        tag: name,
        type: "tuic",
        server: p.server,
        server_port: parseInt(p.port),
        uuid: p.uuid,
        password: p.password,
        congestion_control: p["congestion-controller"] || p.congestion_control,
        tls: {
          enabled: true,
          server_name: p.sni,
          alpn: toArray2(p.alpn),
          insecure: !!p["skip-cert-verify"]
        },
        flow: p.flow ?? void 0,
        udp_relay_mode: p["udp-relay-mode"],
        zero_rtt: typeof p["zero-rtt"] !== "undefined" ? !!p["zero-rtt"] : void 0,
        reduce_rtt: typeof p["reduce-rtt"] !== "undefined" ? !!p["reduce-rtt"] : void 0,
        fast_open: typeof p["fast-open"] !== "undefined" ? !!p["fast-open"] : void 0,
        disable_sni: typeof p["disable-sni"] !== "undefined" ? !!p["disable-sni"] : void 0
      };
    }
    case "anytls": {
      const tls = {
        enabled: true,
        server_name: p.sni,
        insecure: !!p["skip-cert-verify"],
        alpn: toArray2(p.alpn)
      };
      if (p["client-fingerprint"]) {
        tls.utls = {
          enabled: true,
          fingerprint: p["client-fingerprint"]
        };
      }
      return {
        tag: name,
        type: "anytls",
        server: p.server,
        server_port: parseInt(p.port),
        password: p.password,
        udp: !!p.udp,
        "idle-session-check-interval": p["idle-session-check-interval"],
        "idle-session-timeout": p["idle-session-timeout"],
        "min-idle-session": p["min-idle-session"],
        tls
      };
    }
    default:
      return null;
  }
}
var init_convertYamlProxyToObject = __esm({
  "src/parsers/convertYamlProxyToObject.js"() {
  }
});

// src/parsers/convertSurgeProxyToObject.js
function parseParams(parts) {
  const params = {};
  for (const part of parts) {
    const trimmed = part.trim();
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      params[key] = value;
    }
  }
  return params;
}
function parseBool2(value) {
  if (value === void 0 || value === null) return false;
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return lower === "true" || lower === "1" || lower === "yes";
  }
  return false;
}
function convertSurgeProxyToObject(line) {
  if (!line || typeof line !== "string") return null;
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) {
    return null;
  }
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) return null;
  const tag = trimmed.slice(0, eqIndex).trim();
  const rest = trimmed.slice(eqIndex + 1).trim();
  const parts = rest.split(",").map((p) => p.trim());
  if (parts.length < 3) return null;
  const type2 = parts[0].toLowerCase();
  const server = parts[1];
  const port = parseInt(parts[2]);
  if (!server || isNaN(port)) return null;
  const params = parseParams(parts.slice(3));
  const buildTls = () => {
    if (!parseBool2(params.tls)) return void 0;
    return {
      enabled: true,
      server_name: params.sni || params["server-name"] || server,
      insecure: parseBool2(params["skip-cert-verify"]),
      alpn: params.alpn ? params.alpn.split(",").map((a) => a.trim()) : void 0
    };
  };
  const buildTransport = () => {
    const wsPath = params["ws-path"] || params.path;
    if (params.ws === "true" || wsPath) {
      return {
        type: "ws",
        path: wsPath,
        headers: params["ws-headers"] ? { host: params["ws-headers"] } : void 0
      };
    }
    return void 0;
  };
  switch (type2) {
    case "ss":
    case "shadowsocks":
      return {
        tag,
        type: "shadowsocks",
        server,
        server_port: port,
        method: params["encrypt-method"] || params.method || params.cipher,
        password: params.password,
        network: "tcp",
        tcp_fast_open: parseBool2(params.tfo || params["tcp-fast-open"])
      };
    case "vmess":
      return {
        tag,
        type: "vmess",
        server,
        server_port: port,
        uuid: params.username || params.uuid,
        alter_id: parseInt(params.alterId) || 0,
        security: params.cipher || params.security || "auto",
        network: "tcp",
        tcp_fast_open: parseBool2(params.tfo || params["tcp-fast-open"]),
        tls: buildTls(),
        transport: buildTransport()
      };
    case "trojan":
      return {
        tag,
        type: "trojan",
        server,
        server_port: port,
        password: params.password,
        network: "tcp",
        tcp_fast_open: parseBool2(params.tfo || params["tcp-fast-open"]),
        tls: {
          enabled: true,
          server_name: params.sni || params["server-name"] || server,
          insecure: parseBool2(params["skip-cert-verify"]),
          alpn: params.alpn ? params.alpn.split(",").map((a) => a.trim()) : void 0
        },
        transport: buildTransport()
      };
    case "tuic":
      return {
        tag,
        type: "tuic",
        server,
        server_port: port,
        uuid: params.uuid,
        password: params.password,
        congestion_control: params["congestion-controller"] || params.congestion_control,
        udp_relay_mode: params["udp-relay-mode"],
        tls: {
          enabled: true,
          server_name: params.sni || params["server-name"] || server,
          insecure: parseBool2(params["skip-cert-verify"]),
          alpn: params.alpn ? params.alpn.split(",").map((a) => a.trim()) : void 0
        }
      };
    case "hysteria2":
    case "hy2":
      return {
        tag,
        type: "hysteria2",
        server,
        server_port: port,
        password: params.password,
        tls: {
          enabled: true,
          server_name: params.sni || params["server-name"] || server,
          insecure: parseBool2(params["skip-cert-verify"]),
          alpn: params.alpn ? params.alpn.split(",").map((a) => a.trim()) : void 0
        },
        obfs: params["obfs-password"] ? {
          type: params.obfs || "salamander",
          password: params["obfs-password"]
        } : void 0
      };
    case "http":
    case "https":
      return null;
    case "direct":
    case "reject":
    case "reject-tinygif":
      return null;
    default:
      console.warn(`Unsupported Surge proxy type: ${type2}`);
      return null;
  }
}
var init_convertSurgeProxyToObject = __esm({
  "src/parsers/convertSurgeProxyToObject.js"() {
  }
});

// src/utils/surgeConfigParser.js
function parseSurgeValue(rawValue = "") {
  const trimmed = rawValue.trim();
  if (trimmed === "") return "";
  const unquoted = trimmed.replace(/^"(.*)"$/, "$1");
  const lower = unquoted.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(unquoted)) {
    return Number(unquoted);
  }
  return unquoted;
}
function convertSurgeIniToJson(content) {
  const lines = content.split(/\r?\n/);
  const config = {};
  let currentSection = null;
  const ensureObject = (key) => {
    if (!config[key]) config[key] = {};
    return config[key];
  };
  const ensureArray = (key) => {
    if (!config[key]) config[key] = [];
    return config[key];
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) {
      continue;
    }
    const sectionMatch = line.match(/^\[(.+)]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }
    if (!currentSection) {
      continue;
    }
    const sectionName = currentSection.toLowerCase();
    if (sectionName === "general" || sectionName === "replica") {
      const equalsIndex = line.indexOf("=");
      if (equalsIndex === -1) continue;
      const key = line.slice(0, equalsIndex).trim();
      const value = line.slice(equalsIndex + 1).trim();
      if (!key) continue;
      const target = ensureObject(sectionName);
      target[key] = parseSurgeValue(value);
    } else if (sectionName === "proxy") {
      ensureArray("proxies").push(line);
    } else if (sectionName === "proxy group") {
      ensureArray("proxy-groups").push(line);
    } else if (sectionName === "rule") {
      ensureArray("rules").push(line);
    } else {
      ensureArray(sectionName).push(line);
    }
  }
  if (!config.general && !config.replica && !config.proxies && !config["proxy-groups"]) {
    throw new Error("Unable to parse Surge INI content");
  }
  return config;
}
var init_surgeConfigParser = __esm({
  "src/utils/surgeConfigParser.js"() {
  }
});

// src/parsers/subscription/subscriptionContentParser.js
var subscriptionContentParser_exports = {};
__export(subscriptionContentParser_exports, {
  parseClashYaml: () => parseClashYaml,
  parseSingboxJson: () => parseSingboxJson,
  parseSubscriptionContent: () => parseSubscriptionContent,
  parseSurgeIni: () => parseSurgeIni
});
function parseSingboxJson(content) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.outbounds)) {
      const proxies = parsed.outbounds.filter(
        (o) => o && typeof o === "object" && o.server && o.type && !SINGBOX_NON_PROXY_TYPES.has(o.type)
      );
      if (proxies.length > 0) {
        const configOverrides = deepCopy(parsed);
        delete configOverrides.outbounds;
        const proxyGroups = parsed.outbounds.filter((o) => o && SINGBOX_GROUP_TYPES.has(o.type)).map((o) => convertSingboxGroupToClashFormat(o)).filter((g) => g != null);
        if (proxyGroups.length > 0) {
          configOverrides["proxy-groups"] = proxyGroups;
        }
        return {
          type: "singboxConfig",
          proxies,
          config: Object.keys(configOverrides).length > 0 ? configOverrides : null
        };
      }
    }
  } catch (e) {
  }
  return null;
}
function convertSingboxGroupToClashFormat(outbound) {
  if (!outbound || !outbound.tag || !outbound.type) {
    return null;
  }
  const group = {
    name: outbound.tag,
    type: outbound.type === "selector" ? "select" : "url-test",
    proxies: outbound.outbounds || []
  };
  if (outbound.type === "urltest") {
    group.url = outbound.url || "http://www.gstatic.com/generate_204";
    if (outbound.interval) {
      group.interval = parseInterval(outbound.interval);
    } else {
      group.interval = 300;
    }
  }
  return group;
}
function parseInterval(interval) {
  if (typeof interval === "number") {
    return interval;
  }
  if (typeof interval === "string") {
    const match2 = interval.match(/^(\d+)(s|m|h)?$/);
    if (match2) {
      const value = parseInt(match2[1]);
      const unit = match2[2] || "s";
      switch (unit) {
        case "h":
          return value * 3600;
        case "m":
          return value * 60;
        default:
          return value;
      }
    }
    return parseInt(interval) || 300;
  }
  return 300;
}
function parseClashYaml(content) {
  try {
    const parsed = yaml.load(content);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.proxies)) {
      const proxies = parsed.proxies.map((p) => convertYamlProxyToObject(p)).filter((p) => p != null);
      if (proxies.length > 0) {
        const configOverrides = deepCopy(parsed);
        delete configOverrides.proxies;
        return {
          type: "yamlConfig",
          proxies,
          config: Object.keys(configOverrides).length > 0 ? configOverrides : null
        };
      }
    }
  } catch (e) {
  }
  return null;
}
function parseSurgeIni(content) {
  const hasSurgeSection = /\[Proxy\]/i.test(content) || /\[General\]/i.test(content) && /\[Rule\]/i.test(content);
  if (!hasSurgeSection) {
    return null;
  }
  try {
    const parsed = convertSurgeIniToJson(content);
    if (parsed && Array.isArray(parsed.proxies) && parsed.proxies.length > 0) {
      const proxies = parsed.proxies.map((line) => convertSurgeProxyToObject(line)).filter((p) => p != null);
      if (proxies.length > 0) {
        const configOverrides = deepCopy(parsed);
        delete configOverrides.proxies;
        if (Array.isArray(parsed["proxy-groups"]) && parsed["proxy-groups"].length > 0) {
          const proxyGroups = parsed["proxy-groups"].map((line) => parseSurgeProxyGroupLine(line)).filter((g) => g != null);
          if (proxyGroups.length > 0) {
            configOverrides["proxy-groups"] = proxyGroups;
          } else {
            delete configOverrides["proxy-groups"];
          }
        } else {
          delete configOverrides["proxy-groups"];
        }
        return {
          type: "surgeConfig",
          proxies,
          config: Object.keys(configOverrides).length > 0 ? configOverrides : null
        };
      }
    }
  } catch (e) {
    console.warn("Surge INI parsing failed:", e?.message || e);
  }
  return null;
}
function parseSurgeProxyGroupLine(line) {
  if (!line || typeof line !== "string") {
    return null;
  }
  const match2 = line.match(/^(.+?)\s*=\s*(\w+[-\w]*)(?:,\s*(.*))?$/);
  if (!match2) {
    return null;
  }
  const [, name, type2, rest] = match2;
  const parts = (rest || "").split(/,\s*/).filter((p) => p.trim());
  const proxies = [];
  const extras = {};
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("=")) {
      const eqIndex = trimmed.indexOf("=");
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      extras[key] = value;
    } else if (trimmed) {
      proxies.push(trimmed);
    }
  }
  const group = {
    name: name.trim(),
    type: type2.toLowerCase() === "url-test" ? "url-test" : "select",
    proxies
  };
  if (extras.url) {
    group.url = extras.url;
  }
  if (extras.interval) {
    group.interval = parseInt(extras.interval) || 300;
  }
  return group;
}
function parseSubscriptionContent(content) {
  if (!content || typeof content !== "string") {
    return [];
  }
  const trimmed = content.trim();
  if (!trimmed) {
    return [];
  }
  const singboxResult = parseSingboxJson(trimmed);
  if (singboxResult) {
    return singboxResult;
  }
  const clashResult = parseClashYaml(trimmed);
  if (clashResult) {
    return clashResult;
  }
  const surgeResult = parseSurgeIni(trimmed);
  if (surgeResult) {
    return surgeResult;
  }
  return trimmed.split("\n").filter((line) => line.trim() !== "");
}
var SINGBOX_NON_PROXY_TYPES, SINGBOX_GROUP_TYPES;
var init_subscriptionContentParser = __esm({
  "src/parsers/subscription/subscriptionContentParser.js"() {
    init_js_yaml();
    init_utils();
    init_convertYamlProxyToObject();
    init_convertSurgeProxyToObject();
    init_surgeConfigParser();
    SINGBOX_NON_PROXY_TYPES = /* @__PURE__ */ new Set(["direct", "block", "dns", "selector", "urltest"]);
    SINGBOX_GROUP_TYPES = /* @__PURE__ */ new Set(["selector", "urltest"]);
  }
});

// src/parsers/subscription/httpSubscriptionFetcher.js
var httpSubscriptionFetcher_exports = {};
__export(httpSubscriptionFetcher_exports, {
  fetchSubscription: () => fetchSubscription,
  fetchSubscriptionWithFormat: () => fetchSubscriptionWithFormat
});
function hasSubscriptionUriLine(content) {
  return content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).some((line) => SUBSCRIPTION_URI_PATTERN.test(line));
}
function isLikelyTomlConfig(content) {
  return /^\s*\[[^\]]+\]\s*$/m.test(content) && /^\s*[A-Za-z0-9_.-]+\s*=/.test(content);
}
function isPlainSubscriptionContent(content) {
  if (!content || typeof content !== "string") {
    return false;
  }
  return detectFormat(content) !== "unknown" || hasSubscriptionUriLine(content) || isLikelyTomlConfig(content);
}
function decodeUriComponentIfNeeded(text) {
  const trimmed = text.trim();
  if (!trimmed.includes("%")) {
    return trimmed;
  }
  try {
    return decodeURIComponent(trimmed).trim();
  } catch (urlError) {
    console.warn("Failed to URL decode the text:", urlError);
    return trimmed;
  }
}
function normalizeBase64Candidate(text) {
  const compact = text.replace(/\s+/g, "");
  if (!compact || !/^[A-Za-z0-9+/_-]*={0,2}$/.test(compact)) {
    return null;
  }
  if (/=/.test(compact.replace(/={0,2}$/, ""))) {
    return null;
  }
  const withoutPadding = compact.replace(/=+$/, "");
  if (withoutPadding.length % 4 === 1) {
    return null;
  }
  const normalized = withoutPadding.replace(/-/g, "+").replace(/_/g, "/");
  return normalized + "=".repeat((4 - normalized.length % 4) % 4);
}
function decodeContent(text) {
  const urlDecodedText = decodeUriComponentIfNeeded(text);
  if (isPlainSubscriptionContent(urlDecodedText)) {
    return urlDecodedText;
  }
  const base64Candidate = normalizeBase64Candidate(urlDecodedText);
  if (!base64Candidate) {
    return urlDecodedText;
  }
  try {
    const decodedText = decodeUriComponentIfNeeded(decodeBase64(base64Candidate));
    if (isPlainSubscriptionContent(decodedText)) {
      return decodedText;
    }
  } catch (e) {
    return urlDecodedText;
  }
  return urlDecodedText;
}
function detectFormat(content) {
  const trimmed = content.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.outbounds || parsed.inbounds || parsed.route) {
        return "singbox";
      }
    } catch {
    }
  }
  if (trimmed.includes("proxies:")) {
    return "clash";
  }
  if (/\[(General|Proxy|Rule|Proxy Group)\]/i.test(trimmed)) {
    return "surge";
  }
  return "unknown";
}
async function fetchSubscription(url, userAgent) {
  try {
    const headers = new Headers();
    if (userAgent) {
      headers.set("User-Agent", userAgent);
    }
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const decodedText = decodeContent(text);
    return parseSubscriptionContent(decodedText);
  } catch (error) {
    console.error("Error fetching or parsing HTTP(S) content:", error);
    return null;
  }
}
async function fetchSubscriptionWithFormat(url, userAgent) {
  try {
    const headers = new Headers();
    if (userAgent) {
      headers.set("User-Agent", userAgent);
    }
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const content = decodeContent(text);
    const format = detectFormat(content);
    const subscriptionUserinfo = response.headers.get("subscription-userinfo") || void 0;
    return { content, format, url, subscriptionUserinfo };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}
var SUBSCRIPTION_URI_PATTERN;
var init_httpSubscriptionFetcher = __esm({
  "src/parsers/subscription/httpSubscriptionFetcher.js"() {
    init_utils();
    init_subscriptionContentParser();
    SUBSCRIPTION_URI_PATTERN = /^(ss|vmess|vless|hysteria|hysteria2|hy2|trojan|tuic|anytls|http|https):\/\//i;
  }
});

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = (arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
};

// node_modules/hono/dist/utils/body.js
var isRawRequest = (request) => "headers" in request;
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form2 = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form2[key] = value;
    } else {
      handleParsingAllValues(form2, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form2).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form2, key, value);
        delete form2[key];
      }
    });
  }
  return form2;
}
var handleParsingAllValues = (form2, key, value) => {
  if (form2[key] !== void 0) {
    if (Array.isArray(form2[key])) {
      ;
      form2[key].push(value);
    } else {
      form2[key] = [form2[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form2[key] = value;
    } else {
      form2[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form2, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form2;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str2, decoder) => {
  try {
    return decoder(str2);
  } catch {
    return str2.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str2) => tryDecode(str2, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str2) => tryDecode(str2, decodeURIComponent_);
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var escapeRe = /[&<>'"]/;
var stringBufferToString = async (buffer, callbacks) => {
  let str2 = "";
  callbacks ||= [];
  const resolvedBuffer = await Promise.all(buffer);
  for (let i = resolvedBuffer.length - 1; ; i--) {
    str2 += resolvedBuffer[i];
    i--;
    if (i < 0) {
      break;
    }
    let r = resolvedBuffer[i];
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    const isEscaped = r.isEscaped;
    r = await (typeof r === "object" ? r.toString() : r);
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    if (r.isEscaped ?? isEscaped) {
      str2 += r;
    } else {
      const buf = [str2];
      escapeToBuffer(r, buf);
      str2 = buf[0];
    }
  }
  return raw(str2, callbacks);
};
var escapeToBuffer = (str2, buffer) => {
  const match2 = str2.search(escapeRe);
  if (match2 === -1) {
    buffer[0] += str2;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match2; index < str2.length; index++) {
    switch (str2.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str2.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str2.substring(lastIndex, index);
};
var resolveCallbackSync = (str2) => {
  const callbacks = str2.callbacks;
  if (!callbacks?.length) {
    return str2;
  }
  const buffer = [str2];
  const context = {};
  callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
  return buffer[0];
};
var resolveCallback = async (str2, phase, preserveCallbacks, context, buffer) => {
  if (typeof str2 === "object" && !(str2 instanceof String)) {
    if (!(str2 instanceof Promise)) {
      str2 = str2.toString();
    }
    if (str2 instanceof Promise) {
      str2 = await str2;
    }
  }
  const callbacks = str2.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str2);
  }
  if (buffer) {
    buffer[0] += str2;
  } else {
    buffer = [str2];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str22) => resolveCallback(str22, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html2, arg, headers) => {
    const res = (html22) => this.#newResponse(html22, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html2 === "object" ? resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html2);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app) {
    const subApp = this.basePath(path);
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input2, requestInit, Env, executionCtx) => {
    if (input2 instanceof Request) {
      return this.fetch(requestInit ? new Request(input2, requestInit) : input2, Env, executionCtx);
    }
    input2 = input2.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input2) ? input2 : `http://localhost${mergePath("/", input2)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map2 = handlerData[i][j]?.[1];
      if (!map2) {
        continue;
      }
      const keys = Object.keys(map2);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map2[keys[k]] = paramReplacementMap[map2[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = (children) => {
  for (const _ in children) {
    return true;
  }
  return false;
};
var Node2 = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/helper/html/index.js
var html = (strings, ...values) => {
  const buffer = [""];
  for (let i = 0, len = strings.length - 1; i < len; i++) {
    buffer[0] += strings[i];
    const children = Array.isArray(values[i]) ? values[i].flat(Infinity) : [values[i]];
    for (let i2 = 0, len2 = children.length; i2 < len2; i2++) {
      const child = children[i2];
      if (typeof child === "string") {
        escapeToBuffer(child, buffer);
      } else if (typeof child === "number") {
        ;
        buffer[0] += child;
      } else if (typeof child === "boolean" || child === null || child === void 0) {
        continue;
      } else if (typeof child === "object" && child.isEscaped) {
        if (child.callbacks) {
          buffer.unshift("", child);
        } else {
          const tmp = child.toString();
          if (tmp instanceof Promise) {
            buffer.unshift("", tmp);
          } else {
            buffer[0] += tmp;
          }
        }
      } else if (child instanceof Promise) {
        buffer.unshift("", child);
      } else {
        escapeToBuffer(child.toString(), buffer);
      }
    }
  }
  buffer[0] += strings.at(-1);
  return buffer.length === 1 ? "callbacks" in buffer ? raw(resolveCallbackSync(raw(buffer[0], buffer.callbacks))) : raw(buffer[0]) : stringBufferToString(buffer, buffer.callbacks);
};

// src/constants.js
var APP_NAME = "Sublink Worker";
var APP_VERSION = "2.4.2";
var GITHUB_REPO = "https://github.com/7Sageer/sublink-worker";
var GITHUB_API_RELEASES = "https://api.github.com/repos/7Sageer/sublink-worker/releases/latest";
var DOCS_URL = "https://sublink.works";
var APP_KEYWORDS = "clash, singbox, surge, subscription, converter, sublink";
var APP_SUBTITLE = {
  "zh-CN": "\u9AD8\u6548\u805A\u5408\u4E0E\u7BA1\u7406\u60A8\u7684\u4EE3\u7406\u8282\u70B9",
  "en-US": "Efficiently Aggregate and Manage Your Proxy Nodes",
  "fa": "\u062A\u062C\u0645\u06CC\u0639 \u0648 \u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0627\u0631\u0622\u0645\u062F \u0646\u0648\u062F\u0647\u0627\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC \u0634\u0645\u0627",
  "ru": "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0430\u044F \u0430\u0433\u0440\u0435\u0433\u0430\u0446\u0438\u044F \u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0432\u0430\u0448\u0438\u043C\u0438 \u043F\u0440\u043E\u043A\u0441\u0438-\u0443\u0437\u043B\u0430\u043C\u0438"
};

// src/components/Layout.jsx
var Layout = (props) => {
  const { title: title2, children } = props;
  return html`
    <!DOCTYPE html>
    <html lang="en" x-data="appData()">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title2}</title>
        <meta name="description" content="Convert and optimize your subscription links easily" />
        <meta name="keywords" content="${APP_KEYWORDS}" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.10/dist/cdn.min.js" onerror="window.__alpineFailed=true"></script>
        <script>
          window.__alpineLoaded = false;
          document.addEventListener('alpine:init', () => { window.__alpineLoaded = true; });
          window.addEventListener('DOMContentLoaded', () => {
            if (window.__alpineFailed || !window.__alpineLoaded) {
              console.error('Failed to initialize Alpine.js. Interactive features are disabled.');
              const warning = document.createElement('div');
              warning.className = 'fixed bottom-4 right-4 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg shadow';
              warning.textContent = '加载 Alpine.js 失败，页面交互功能不可用，请刷新或检查网络。';
              document.body.appendChild(warning);
            }
          });
        </script>
        <script>
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  primary: {
                    50: '#eef9ff',
                    100: '#dcf2ff',
                    200: '#b2e6ff',
                    300: '#6ed4ff',
                    400: '#33c5ff', // Spaceship Blue
                    500: '#0aa3eb',
                    600: '#0082ca',
                    700: '#0068a3',
                    800: '#005887',
                    900: '#06496f',
                    950: '#042f4a',
                  },
                  gray: {
                    850: '#1f2937',
                    900: '#111827',
                    950: '#0b0f19', // Deep dark for background
                  }
                },
                fontFamily: {
                  sans: ['Inter', 'sans-serif'],
                }
              }
            }
          }
        </script>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            position: relative;
            min-height: 100vh;
          }

          /* Subtle radial gradient background */
          body::before {
            content: '';
            position: fixed;
            inset: 0;
            z-index: -2;
            background:
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(10, 163, 235, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 90% 80%, rgba(51, 197, 255, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 10% 90%, rgba(0, 130, 202, 0.04) 0%, transparent 50%);
            pointer-events: none;
          }

          .dark body::before,
          html.dark body::before {
            background:
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(10, 163, 235, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 90% 80%, rgba(51, 197, 255, 0.06) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 10% 90%, rgba(0, 130, 202, 0.05) 0%, transparent 50%);
          }

          /* Subtle noise texture overlay */
          body::after {
            content: '';
            position: fixed;
            inset: 0;
            z-index: -1;
            opacity: 0.3;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            background-repeat: repeat;
            background-size: 128px 128px;
          }

          .dark body::after,
          html.dark body::after {
            opacity: 0.15;
          }

          [x-cloak] { display: none !important; }
        </style>
        <script>
          function appData() {
            return {
              darkMode: localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
              toggleDarkMode() {
                this.darkMode = !this.darkMode;
                localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
                if (this.darkMode) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              },
              init() {
                if (this.darkMode) {
                  document.documentElement.classList.add('dark');
                }
              }
            }
          }

          // Version update checker Alpine.js component
          function updateChecker(currentVersion, apiUrl) {
            return {
              currentVersion: currentVersion,
              latestVersion: '',
              showUpdateToast: false,
              i18n: {
                newVersionAvailable: getUpdateI18n('newVersionAvailable'),
                currentVersion: getUpdateI18n('currentVersion'),
                viewRelease: getUpdateI18n('viewRelease'),
                updateGuide: getUpdateI18n('updateGuide'),
                later: getUpdateI18n('later')
              },
              init() {
                // Check for updates after a short delay to not block initial render
                setTimeout(() => this.checkForUpdates(), 3000);
              },
              async checkForUpdates() {
                try {
                  // Check if user dismissed this version before
                  const dismissedVersion = localStorage.getItem('sublink_dismissed_version');
                  const lastCheck = localStorage.getItem('sublink_last_version_check');
                  const now = Date.now();
                  
                  // Only check once per hour to avoid rate limiting
                  if (lastCheck && (now - parseInt(lastCheck)) < 3600000) {
                    const cachedVersion = localStorage.getItem('sublink_latest_version');
                    if (cachedVersion && cachedVersion !== dismissedVersion && this.compareVersions(cachedVersion, this.currentVersion) > 0) {
                      this.latestVersion = cachedVersion;
                      this.showUpdateToast = true;
                    }
                    return;
                  }

                  const response = await fetch(apiUrl, {
                    headers: { 'Accept': 'application/vnd.github.v3+json' }
                  });
                  
                  if (!response.ok) return;
                  
                  const data = await response.json();
                  const latestVersion = (data.tag_name || '').replace(/^v/, '');
                  
                  // Cache the result
                  localStorage.setItem('sublink_latest_version', latestVersion);
                  localStorage.setItem('sublink_last_version_check', now.toString());
                  
                  // Compare versions
                  if (latestVersion && latestVersion !== dismissedVersion && this.compareVersions(latestVersion, this.currentVersion) > 0) {
                    this.latestVersion = latestVersion;
                    this.showUpdateToast = true;
                  }
                } catch (error) {
                  console.debug('Version check failed:', error.message);
                }
              },
              compareVersions(v1, v2) {
                const parts1 = v1.split('.').map(Number);
                const parts2 = v2.split('.').map(Number);
                for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
                  const p1 = parts1[i] || 0;
                  const p2 = parts2[i] || 0;
                  if (p1 > p2) return 1;
                  if (p1 < p2) return -1;
                }
                return 0;
              },
              dismissUpdate() {
                this.showUpdateToast = false;
                localStorage.setItem('sublink_dismissed_version', this.latestVersion);
              }
            }
          }

          // i18n helper for update checker
          function getUpdateI18n(key) {
            const lang = navigator.language || 'en-US';
            const translations = {
              'zh-CN': {
                newVersionAvailable: '发现新版本',
                currentVersion: '当前版本',
                viewRelease: '查看更新',
                updateGuide: '更新指南',
                later: '稍后提醒'
              },
              'zh-TW': {
                newVersionAvailable: '發現新版本',
                currentVersion: '當前版本',
                viewRelease: '查看更新',
                updateGuide: '更新指南',
                later: '稍後提醒'
              },
              'en-US': {
                newVersionAvailable: 'New Version Available',
                currentVersion: 'Current',
                viewRelease: 'View Release',
                updateGuide: 'Update Guide',
                later: 'Later'
              },
              'fa': {
                newVersionAvailable: 'نسخه جدید موجود است',
                currentVersion: 'نسخه فعلی',
                viewRelease: 'مشاهده نسخه',
                updateGuide: 'راهنمای به‌روزرسانی',
                later: 'بعداً'
              },
              'ru': {
                newVersionAvailable: 'Доступна новая версия',
                currentVersion: 'Текущая',
                viewRelease: 'Посмотреть',
                updateGuide: 'Руководство по обновлению',
                later: 'Позже'
              }
            };
            const langKey = Object.keys(translations).find(k => lang.startsWith(k.split('-')[0])) || 'en-US';
            return translations[langKey][key] || translations['en-US'][key];
          }
        </script>
      </head>
      <body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        ${children}
      </body>
    </html>
  `;
};

// node_modules/hono/dist/jsx/constants.js
var DOM_RENDERER = /* @__PURE__ */ Symbol("RENDERER");
var DOM_ERROR_HANDLER = /* @__PURE__ */ Symbol("ERROR_HANDLER");
var DOM_INTERNAL_TAG = /* @__PURE__ */ Symbol("INTERNAL");
var PERMALINK = /* @__PURE__ */ Symbol("PERMALINK");

// node_modules/hono/dist/jsx/dom/utils.js
var setInternalTagFlag = (fn) => {
  ;
  fn[DOM_INTERNAL_TAG] = true;
  return fn;
};

// node_modules/hono/dist/jsx/dom/context.js
var createContextProviderFunction = (values) => ({ value, children }) => {
  if (!children) {
    return void 0;
  }
  const props = {
    children: [
      {
        tag: setInternalTagFlag(() => {
          values.push(value);
        }),
        props: {}
      }
    ]
  };
  if (Array.isArray(children)) {
    props.children.push(...children.flat());
  } else {
    props.children.push(children);
  }
  props.children.push({
    tag: setInternalTagFlag(() => {
      values.pop();
    }),
    props: {}
  });
  const res = { tag: "", props, type: "" };
  res[DOM_ERROR_HANDLER] = (err) => {
    values.pop();
    throw err;
  };
  return res;
};

// node_modules/hono/dist/jsx/context.js
var globalContexts = [];
var alsProbed = false;
var asyncLocalStorage;
var fallbackStore;
var fallbackRendersInFlight = 0;
var warnedFallbackDefault = false;
var loadAsyncLocalStorage = () => {
  if (alsProbed) {
    return asyncLocalStorage;
  }
  alsProbed = true;
  const global = globalThis;
  let AsyncLocalStorage;
  for (const probe of [
    // Node.js >= 20.16, Deno, Bun, Cloudflare Workers (nodejs_compat). Property
    // access only, so bundlers don't statically resolve `node:async_hooks`.
    () => global.process?.getBuiltinModule?.("node:async_hooks")?.AsyncLocalStorage,
    // Node.js < 20.16 has no `process.getBuiltinModule`, but a CJS entrypoint
    // exposes the main module's `require` here.
    () => global.process?.mainModule?.require?.("node:async_hooks")?.AsyncLocalStorage
  ]) {
    try {
      AsyncLocalStorage = probe();
    } catch {
    }
    if (AsyncLocalStorage) {
      break;
    }
  }
  if (AsyncLocalStorage) {
    asyncLocalStorage = new AsyncLocalStorage();
  }
  return asyncLocalStorage;
};
var getCurrentStore = () => {
  return loadAsyncLocalStorage()?.getStore() || fallbackStore;
};
var warnIfStorelessAccess = () => {
  if (fallbackRendersInFlight > 0 && !warnedFallbackDefault) {
    warnedFallbackDefault = true;
    console.warn(
      "hono/jsx: AsyncLocalStorage is unavailable in this runtime, so useContext() after an await in an async component falls back to the context default value during server-side rendering. To get provided values across await boundaries, use a runtime with AsyncLocalStorage (Node.js >= 20.16, Deno, Bun, or Cloudflare Workers with the nodejs_compat flag)."
    );
  }
};
var getContextValuesIn = (store, context) => {
  if (!store) {
    warnIfStorelessAccess();
    return context.values;
  }
  let values = store.get(context);
  if (!values) {
    values = [context.values[0]];
    store.set(context, values);
  }
  return values;
};
var readContextValueIn = (store, context) => {
  if (!store) {
    warnIfStorelessAccess();
    return context.values.at(-1);
  }
  const values = store.get(context);
  return values?.length ? values.at(-1) : context.values[0];
};
var captureContextValues = (store) => (store ? globalContexts.filter((c) => store.has(c)) : globalContexts).map((c) => [
  c,
  readContextValueIn(store, c)
]);
var resumeWithContextValues = (callback, store, contexts) => runWithRenderContext(() => {
  const currentStore = getCurrentStore();
  const valuesPerContext = contexts.map(([context, value]) => {
    const values = getContextValuesIn(currentStore, context);
    values.push(value);
    return values;
  });
  const popContextValues = () => {
    valuesPerContext.forEach((values) => {
      values.pop();
    });
  };
  try {
    const result = callback();
    if (result instanceof Promise) {
      return result.finally(popContextValues);
    }
    popContextValues();
    return result;
  } catch (e) {
    popContextValues();
    throw e;
  }
}, store);
var runWithRenderContext = (callback, resumeStore) => {
  if (getCurrentStore()) {
    return callback();
  }
  const store = resumeStore ?? /* @__PURE__ */ new WeakMap();
  const storage = loadAsyncLocalStorage();
  if (storage) {
    return storage.run(store, callback);
  }
  fallbackStore = store;
  let result;
  try {
    result = callback();
  } finally {
    fallbackStore = void 0;
  }
  if (!warnedFallbackDefault && result instanceof Promise) {
    fallbackRendersInFlight++;
    result = result.finally(() => {
      fallbackRendersInFlight--;
    });
  }
  return result;
};
var captureRenderContext = () => {
  const store = getCurrentStore();
  const contexts = captureContextValues(store);
  return (callback) => resumeWithContextValues(callback, store, contexts);
};
var createContext = (defaultValue) => {
  const values = [defaultValue];
  const context = ((props) => {
    const contextValues = getContextValuesIn(getCurrentStore(), context);
    contextValues.push(props.value);
    let string;
    try {
      string = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode("", {}, props.children) : props.children).toString() : "";
    } catch (e) {
      contextValues.pop();
      throw e;
    }
    if (string instanceof Promise) {
      return string.finally(() => contextValues.pop()).then((resString) => raw(resString, resString.callbacks));
    } else {
      contextValues.pop();
      return raw(string);
    }
  });
  context.values = values;
  context.Provider = context;
  context[DOM_RENDERER] = createContextProviderFunction(values);
  globalContexts.push(context);
  return context;
};
var useContext = (context) => {
  return readContextValueIn(getCurrentStore(), context);
};

// node_modules/hono/dist/jsx/intrinsic-element/common.js
var deDupeKeyMap = {
  title: [],
  script: ["src"],
  style: ["data-href"],
  link: ["href"],
  meta: ["name", "httpEquiv", "charset", "itemProp"]
};
var domRenderers = {};
var dataPrecedenceAttr = "data-precedence";
var isStylesheetLinkWithPrecedence = (props) => props.rel === "stylesheet" && "precedence" in props;
var shouldDeDupeByKey = (tagName, supportSort) => {
  if (tagName === "link") {
    return supportSort;
  }
  return deDupeKeyMap[tagName].length > 0;
};

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var components_exports = {};
__export(components_exports, {
  button: () => button,
  form: () => form,
  input: () => input,
  link: () => link,
  meta: () => meta,
  script: () => script,
  style: () => style,
  title: () => title
});

// node_modules/hono/dist/jsx/children.js
var toArray = (children) => Array.isArray(children) ? children : [children];

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var metaTagMap = /* @__PURE__ */ new WeakMap();
var insertIntoHead = (tagName, tag, props, precedence) => ({ buffer, context }) => {
  if (!buffer) {
    return;
  }
  const map2 = metaTagMap.get(context) || {};
  metaTagMap.set(context, map2);
  const tags = map2[tagName] ||= [];
  let duped = false;
  const deDupeKeys = deDupeKeyMap[tagName];
  const deDupeByKey = shouldDeDupeByKey(tagName, precedence !== void 0);
  if (deDupeByKey) {
    LOOP: for (const [, tagProps] of tags) {
      if (tagName === "link" && !(tagProps.rel === "stylesheet" && tagProps[dataPrecedenceAttr] !== void 0)) {
        continue;
      }
      for (const key of deDupeKeys) {
        if ((tagProps?.[key] ?? null) === props?.[key]) {
          duped = true;
          break LOOP;
        }
      }
    }
  }
  if (duped) {
    buffer[0] = buffer[0].replaceAll(tag, "");
  } else if (deDupeByKey || tagName === "link") {
    tags.push([tag, props, precedence]);
  } else {
    tags.unshift([tag, props, precedence]);
  }
  if (buffer[0].indexOf("</head>") !== -1) {
    let insertTags;
    if (tagName === "link" || precedence !== void 0) {
      const precedences = [];
      insertTags = tags.map(([tag2, , tagPrecedence], index) => {
        if (tagPrecedence === void 0) {
          return [tag2, Number.MAX_SAFE_INTEGER, index];
        }
        let order = precedences.indexOf(tagPrecedence);
        if (order === -1) {
          precedences.push(tagPrecedence);
          order = precedences.length - 1;
        }
        return [tag2, order, index];
      }).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(([tag2]) => tag2);
    } else {
      insertTags = tags.map(([tag2]) => tag2);
    }
    insertTags.forEach((tag2) => {
      buffer[0] = buffer[0].replaceAll(tag2, "");
    });
    buffer[0] = buffer[0].replace(/(?=<\/head>)/, insertTags.join(""));
  }
};
var returnWithoutSpecialBehavior = (tag, children, props) => raw(new JSXNode(tag, props, toArray(children ?? [])).toString());
var documentMetadataTag = (tag, children, props, sort) => {
  if ("itemProp" in props) {
    return returnWithoutSpecialBehavior(tag, children, props);
  }
  let { precedence, blocking, ...restProps } = props;
  precedence = sort ? precedence ?? "" : void 0;
  if (sort) {
    restProps[dataPrecedenceAttr] = precedence;
  }
  const string = new JSXNode(tag, restProps, toArray(children || [])).toString();
  if (string instanceof Promise) {
    return string.then(
      (resString) => raw(string, [
        ...resString.callbacks || [],
        insertIntoHead(tag, resString, restProps, precedence)
      ])
    );
  } else {
    return raw(string, [insertIntoHead(tag, string, restProps, precedence)]);
  }
};
var title = ({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2) {
    const context = useContext(nameSpaceContext2);
    if (context === "svg" || context === "head") {
      return new JSXNode(
        "title",
        props,
        toArray(children ?? [])
      );
    }
  }
  return documentMetadataTag("title", children, props, false);
};
var script = ({
  children,
  ...props
}) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (["src", "async"].some((k) => !props[k]) || nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("script", children, props);
  }
  return documentMetadataTag("script", children, props, false);
};
var style = ({
  children,
  ...props
}) => {
  if (!["href", "precedence"].every((k) => k in props)) {
    return returnWithoutSpecialBehavior("style", children, props);
  }
  props["data-href"] = props.href;
  delete props.href;
  return documentMetadataTag("style", children, props, true);
};
var link = ({ children, ...props }) => {
  if (["onLoad", "onError"].some((k) => k in props) || props.rel === "stylesheet" && (!("precedence" in props) || "disabled" in props)) {
    return returnWithoutSpecialBehavior("link", children, props);
  }
  return documentMetadataTag("link", children, props, isStylesheetLinkWithPrecedence(props));
};
var meta = ({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("meta", children, props);
  }
  return documentMetadataTag("meta", children, props, false);
};
var newJSXNode = (tag, { children, ...props }) => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new JSXNode(tag, props, toArray(children ?? []))
);
var form = (props) => {
  if (typeof props.action === "function") {
    props.action = PERMALINK in props.action ? props.action[PERMALINK] : void 0;
  }
  return newJSXNode("form", props);
};
var formActionableElement = (tag, props) => {
  if (typeof props.formAction === "function") {
    props.formAction = PERMALINK in props.formAction ? props.formAction[PERMALINK] : void 0;
  }
  return newJSXNode(tag, props);
};
var input = (props) => formActionableElement("input", props);
var button = (props) => formActionableElement("button", props);

// node_modules/hono/dist/jsx/utils.js
var normalizeElementKeyMap = /* @__PURE__ */ new Map([
  ["className", "class"],
  ["htmlFor", "for"],
  ["crossOrigin", "crossorigin"],
  ["httpEquiv", "http-equiv"],
  ["itemProp", "itemprop"],
  ["fetchPriority", "fetchpriority"],
  ["noModule", "nomodule"],
  ["formAction", "formaction"]
]);
var normalizeIntrinsicElementKey = (key) => normalizeElementKeyMap.get(key) || key;
var invalidAttributeNameCharRe = /[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/;
var validAttributeNameCache = /* @__PURE__ */ new Set();
var validAttributeNameCacheMax = 1024;
var invalidTagNameCharRe = /^[!?]|[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/;
var validTagNameCache = /* @__PURE__ */ new Set();
var validTagNameCacheMax = 256;
var cacheValidName = (cache, max, name) => {
  if (cache.size >= max) {
    cache.clear();
  }
  cache.add(name);
};
var isValidTagName = (name) => {
  if (validTagNameCache.has(name)) {
    return true;
  }
  if (typeof name !== "string") {
    return false;
  }
  if (name.length === 0) {
    return true;
  }
  if (invalidTagNameCharRe.test(name)) {
    return false;
  }
  cacheValidName(validTagNameCache, validTagNameCacheMax, name);
  return true;
};
var isValidAttributeName = (name) => {
  if (validAttributeNameCache.has(name)) {
    return true;
  }
  const len = name.length;
  if (len === 0) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const c = name.charCodeAt(i);
    if (!(c >= 97 && c <= 122 || // a-z
    c >= 65 && c <= 90 || // A-Z
    c >= 48 && c <= 57 || // 0-9
    c === 45 || // -
    c === 95 || // _
    c === 46 || // .
    c === 58)) {
      if (!invalidAttributeNameCharRe.test(name)) {
        cacheValidName(validAttributeNameCache, validAttributeNameCacheMax, name);
        return true;
      } else {
        return false;
      }
    }
  }
  cacheValidName(validAttributeNameCache, validAttributeNameCacheMax, name);
  return true;
};
var invalidStylePropertyNameCharRe = /[\s"'():;\\/\[\]{}\x00-\x1f\x7f-\x9f]/;
var validStylePropertyNameCache = /* @__PURE__ */ new Set();
var validStylePropertyNameCacheMax = 1024;
var isValidStylePropertyName = (name) => {
  if (validStylePropertyNameCache.has(name)) {
    return true;
  }
  const len = name.length;
  if (len === 0) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const c = name.charCodeAt(i);
    if (!(c >= 97 && c <= 122 || // a-z
    c >= 65 && c <= 90 || // A-Z
    c >= 48 && c <= 57 || // 0-9
    c === 45 || // -
    c === 95)) {
      if (!invalidStylePropertyNameCharRe.test(name)) {
        cacheValidName(validStylePropertyNameCache, validStylePropertyNameCacheMax, name);
        return true;
      } else {
        return false;
      }
    }
  }
  cacheValidName(validStylePropertyNameCache, validStylePropertyNameCacheMax, name);
  return true;
};
var unsafeStyleValueCharRe = /[;"'\\/\[\](){}]/;
var hasUnsafeStyleValue = (value) => {
  if (!unsafeStyleValueCharRe.test(value)) {
    return false;
  }
  let quote = 0;
  const blockStack = [];
  for (let i = 0, len = value.length; i < len; i++) {
    const c = value.charCodeAt(i);
    if (c === 92) {
      if (i === len - 1) {
        return true;
      }
      i++;
    } else if (quote !== 0) {
      if (c === 10 || c === 12 || c === 13) {
        return true;
      }
      if (c === quote) {
        quote = 0;
      }
    } else if (c === 47 && value.charCodeAt(i + 1) === 42) {
      const end = value.indexOf("*/", i + 2);
      if (end === -1) {
        return true;
      }
      i = end + 1;
    } else if (c === 34 || c === 39) {
      quote = c;
    } else if (c === 40) {
      blockStack.push(41);
    } else if (c === 91) {
      blockStack.push(93);
    } else if (c === 123 || c === 125) {
      return true;
    } else if (c === 41 || c === 93) {
      if (blockStack[blockStack.length - 1] !== c) {
        return true;
      }
      blockStack.pop();
    } else if (c === 59 && blockStack.length === 0) {
      return true;
    }
  }
  return quote !== 0 || blockStack.length !== 0;
};
var styleObjectForEach = (style2, fn) => {
  for (const [k, v] of Object.entries(style2)) {
    const key = k[0] === "-" || !/[A-Z]/.test(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    if (!isValidStylePropertyName(key)) {
      continue;
    }
    if (v == null) {
      fn(key, null);
      continue;
    }
    let value;
    if (typeof v === "number") {
      value = !key.match(
        /^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/
      ) ? `${v}px` : `${v}`;
    } else if (typeof v === "string") {
      if (hasUnsafeStyleValue(v)) {
        continue;
      }
      value = v;
    } else {
      continue;
    }
    fn(key, value);
  }
};

// node_modules/hono/dist/jsx/base.js
var nameSpaceContext = void 0;
var getNameSpaceContext = () => nameSpaceContext;
var toSVGAttributeName = (key) => /[A-Z]/.test(key) && // Presentation attributes are findable in style object. "clip-path", "font-size", "stroke-width", etc.
// Or other un-deprecated kebab-case attributes. "overline-position", "paint-order", "strikethrough-position", etc.
key.match(
  /^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/
) ? key.replace(/([A-Z])/g, "-$1").toLowerCase() : key;
var emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
var booleanAttributes = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "download",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
var childrenToStringToBuffer = (children, buffer) => {
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];
    if (typeof child === "string") {
      escapeToBuffer(child, buffer);
    } else if (typeof child === "boolean" || child === null || child === void 0) {
      continue;
    } else if (child instanceof JSXNode) {
      child.toStringToBuffer(buffer);
    } else if (typeof child === "number" || child.isEscaped) {
      ;
      buffer[0] += child;
    } else if (child instanceof Promise) {
      buffer.unshift("", child);
    } else {
      childrenToStringToBuffer(child, buffer);
    }
  }
};
var JSXNode = class {
  tag;
  props;
  key;
  children;
  isEscaped = true;
  suspendedContext;
  constructor(tag, props, children) {
    if (typeof tag !== "function" && !isValidTagName(tag)) {
      throw new Error(`Invalid JSX tag name: ${tag}`);
    }
    this.tag = tag;
    this.props = props;
    this.children = children;
  }
  get type() {
    return this.tag;
  }
  // Added for compatibility with libraries that rely on React's internal structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get ref() {
    return this.props.ref || null;
  }
  toString() {
    const render = () => {
      const buffer = [""];
      this.toStringToBuffer(buffer);
      return buffer.length === 1 ? "callbacks" in buffer ? resolveCallbackSync(raw(buffer[0], buffer.callbacks)).toString() : buffer[0] : stringBufferToString(buffer, buffer.callbacks);
    };
    return this.suspendedContext ? this.suspendedContext(render) : runWithRenderContext(render);
  }
  toStringToBuffer(buffer) {
    const tag = this.tag;
    const props = this.props;
    let { children } = this;
    buffer[0] += `<${tag}`;
    const normalizeKey = tag === "svg" || nameSpaceContext && useContext(nameSpaceContext) === "svg" ? (key) => toSVGAttributeName(normalizeIntrinsicElementKey(key)) : (key) => normalizeIntrinsicElementKey(key);
    for (let [key, v] of Object.entries(props)) {
      key = normalizeKey(key);
      if (!isValidAttributeName(key)) {
        continue;
      }
      if (key === "children") {
      } else if (key === "style" && typeof v === "object") {
        let styleStr = "";
        styleObjectForEach(v, (property, value) => {
          if (value != null) {
            styleStr += `${styleStr ? ";" : ""}${property}:${value}`;
          }
        });
        buffer[0] += ' style="';
        escapeToBuffer(styleStr, buffer);
        buffer[0] += '"';
      } else if (typeof v === "string") {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v, buffer);
        buffer[0] += '"';
      } else if (v === null || v === void 0) {
      } else if (typeof v === "number" || v.isEscaped) {
        buffer[0] += ` ${key}="${v}"`;
      } else if (typeof v === "boolean" && booleanAttributes.includes(key)) {
        if (v) {
          buffer[0] += ` ${key}=""`;
        }
      } else if (key === "dangerouslySetInnerHTML") {
        if (children.length > 0) {
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        }
        children = [raw(v.__html)];
      } else if (v instanceof Promise) {
        buffer[0] += ` ${key}="`;
        buffer.unshift('"', v);
      } else if (typeof v === "function") {
        if (!key.startsWith("on") && key !== "ref") {
          throw new Error(`Invalid prop '${key}' of type 'function' supplied to '${tag}'.`);
        }
      } else {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v.toString(), buffer);
        buffer[0] += '"';
      }
    }
    if (emptyTags.includes(tag) && children.length === 0) {
      buffer[0] += "/>";
      return;
    }
    buffer[0] += ">";
    childrenToStringToBuffer(children, buffer);
    buffer[0] += `</${tag}>`;
  }
};
var JSXFunctionNode = class extends JSXNode {
  toStringToBuffer(buffer) {
    const { children } = this;
    const props = { ...this.props };
    if (children.length) {
      props.children = children.length === 1 ? children[0] : children;
    }
    const res = this.tag.call(null, props);
    if (typeof res === "boolean" || res == null) {
      return;
    } else if (res instanceof Promise) {
      if (globalContexts.length === 0) {
        buffer.unshift("", res);
      } else {
        const suspendedContext = captureRenderContext();
        buffer.unshift(
          "",
          res.then((childRes) => {
            if (childRes instanceof JSXNode) {
              childRes.suspendedContext = suspendedContext;
            }
            return childRes;
          })
        );
      }
    } else if (res instanceof JSXNode) {
      res.toStringToBuffer(buffer);
    } else if (typeof res === "number" || res.isEscaped) {
      buffer[0] += res;
      if (res.callbacks) {
        buffer.callbacks ||= [];
        buffer.callbacks.push(...res.callbacks);
      }
    } else {
      escapeToBuffer(res, buffer);
    }
  }
};
var JSXFragmentNode = class extends JSXNode {
  toStringToBuffer(buffer) {
    childrenToStringToBuffer(this.children, buffer);
  }
};
var initDomRenderer = false;
var jsxFn = (tag, props, children) => {
  if (!initDomRenderer) {
    for (const k in domRenderers) {
      ;
      components_exports[k][DOM_RENDERER] = domRenderers[k];
    }
    initDomRenderer = true;
  }
  if (typeof tag === "function") {
    return new JSXFunctionNode(tag, props, children);
  } else if (components_exports[tag]) {
    return new JSXFunctionNode(
      components_exports[tag],
      props,
      children
    );
  } else if (tag === "svg" || tag === "head") {
    nameSpaceContext ||= createContext("");
    return new JSXNode(tag, props, [
      new JSXFunctionNode(
        nameSpaceContext,
        {
          value: tag
        },
        children
      )
    ]);
  } else {
    return new JSXNode(tag, props, children);
  }
};

// node_modules/hono/dist/jsx/jsx-dev-runtime.js
function jsxDEV(tag, props, key) {
  let node;
  if (!props || !("children" in props)) {
    node = jsxFn(tag, props, []);
  } else {
    const children = props.children;
    node = Array.isArray(children) ? jsxFn(tag, props, children) : jsxFn(tag, props, [children]);
  }
  node.key = key;
  return node;
}

// src/components/Navbar.jsx
var Navbar = () => {
  return /* @__PURE__ */ jsxDEV("nav", { class: "fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 z-50 transition-all duration-300", children: /* @__PURE__ */ jsxDEV("div", { class: "container mx-auto px-4", children: /* @__PURE__ */ jsxDEV("div", { class: "flex items-center justify-between h-16", children: [
    /* @__PURE__ */ jsxDEV("a", { href: "#", class: "flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors", children: [
      /* @__PURE__ */ jsxDEV("img", { src: "/favicon.ico", alt: `${APP_NAME} logo`, class: "w-6 h-6" }),
      /* @__PURE__ */ jsxDEV("span", { children: APP_NAME })
    ] }),
    /* @__PURE__ */ jsxDEV("div", { class: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: DOCS_URL,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "px-4 py-2 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxDEV("i", { class: "fas fa-book" }),
            /* @__PURE__ */ jsxDEV("span", { children: "Docs" })
          ]
        }
      ),
      /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: GITHUB_REPO,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "px-4 py-2 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium",
          children: [
            /* @__PURE__ */ jsxDEV("i", { class: "fab fa-github" }),
            /* @__PURE__ */ jsxDEV("span", { children: "GitHub" })
          ]
        }
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          class: "p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors",
          "x-on:click": "toggleDarkMode()",
          "aria-label": "Toggle dark mode",
          children: /* @__PURE__ */ jsxDEV("i", { class: "fas", "x-bind:class": "darkMode ? 'fa-sun' : 'fa-moon'" })
        }
      )
    ] })
  ] }) }) });
};

// src/config/ruleUrls.js
var SITE_RULE_SET_BASE_URL = "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/sing/geo/geosite/";
var IP_RULE_SET_BASE_URL = "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/sing/geo/geoip/";
var CLASH_SITE_RULE_SET_BASE_URL = "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/";
var CLASH_IP_RULE_SET_BASE_URL = "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/";
var SURGE_SITE_RULE_SET_BASEURL = "https://gh-proxy.com/https://github.com/NSZA156/surge-geox-rules/raw/refs/heads/release/geo/geosite/";
var SURGE_IP_RULE_SET_BASEURL = "https://gh-proxy.com/https://github.com/NSZA156/surge-geox-rules/raw/refs/heads/release/geo/geoip/";

// src/config/rules.js
var UNIFIED_RULES = [
  {
    name: "Ad Block",
    site_rules: ["category-ads-all"],
    ip_rules: []
  },
  {
    name: "AI Services",
    site_rules: ["category-ai-!cn"],
    ip_rules: []
  },
  {
    name: "Bilibili",
    site_rules: ["bilibili"],
    ip_rules: []
  },
  {
    name: "Youtube",
    site_rules: ["youtube"],
    ip_rules: []
  },
  {
    name: "Google",
    site_rules: ["google"],
    ip_rules: ["google"]
  },
  {
    name: "Private",
    site_rules: [],
    ip_rules: ["private"]
  },
  {
    name: "Location:CN",
    site_rules: ["geolocation-cn", "cn"],
    ip_rules: ["cn"]
  },
  {
    name: "Telegram",
    site_rules: [],
    ip_rules: ["telegram"]
  },
  {
    name: "Github",
    site_rules: ["github", "gitlab"],
    ip_rules: []
  },
  {
    name: "Microsoft",
    site_rules: ["microsoft"],
    ip_rules: []
  },
  {
    name: "Apple",
    site_rules: ["apple"],
    ip_rules: []
  },
  {
    name: "Social Media",
    site_rules: ["facebook", "instagram", "twitter", "tiktok", "linkedin"],
    ip_rules: []
  },
  {
    name: "Streaming",
    site_rules: ["netflix", "hulu", "disney", "hbo", "amazon", "bahamut"],
    ip_rules: []
  },
  {
    name: "Gaming",
    site_rules: ["steam", "epicgames", "ea", "ubisoft", "blizzard"],
    ip_rules: []
  },
  {
    name: "Education",
    site_rules: ["coursera", "edx", "udemy", "khanacademy", "category-scholar-!cn"],
    ip_rules: []
  },
  {
    name: "Financial",
    site_rules: ["paypal", "visa", "mastercard", "stripe", "wise"],
    ip_rules: []
  },
  {
    name: "Cloud Services",
    site_rules: ["aws", "azure", "digitalocean", "heroku", "dropbox"],
    ip_rules: []
  },
  {
    name: "Non-China",
    site_rules: ["geolocation-!cn"],
    ip_rules: []
  }
];
var DIRECT_DEFAULT_RULES = /* @__PURE__ */ new Set(["Private", "Location:CN"]);
var REJECT_ACTION_RULES = /* @__PURE__ */ new Set(["Ad Block"]);
var PREDEFINED_RULE_SETS = {
  minimal: ["Location:CN", "Private", "Non-China"],
  balanced: ["Location:CN", "Private", "Non-China", "Github", "Google", "Youtube", "AI Services", "Telegram"],
  comprehensive: UNIFIED_RULES.map((rule) => rule.name)
};
var SITE_RULE_SETS = UNIFIED_RULES.reduce((acc, rule) => {
  rule.site_rules.forEach((site_rule) => {
    acc[site_rule] = `${site_rule}.srs`;
  });
  return acc;
}, {});
var IP_RULE_SETS = UNIFIED_RULES.reduce((acc, rule) => {
  rule.ip_rules.forEach((ip_rule) => {
    acc[ip_rule] = `${ip_rule}.srs`;
  });
  return acc;
}, {});
var CLASH_SITE_RULE_SETS = UNIFIED_RULES.reduce((acc, rule) => {
  rule.site_rules.forEach((site_rule) => {
    acc[site_rule] = `${site_rule}.mrs`;
  });
  return acc;
}, {});
var CLASH_IP_RULE_SETS = UNIFIED_RULES.reduce((acc, rule) => {
  rule.ip_rules.forEach((ip_rule) => {
    acc[ip_rule] = `${ip_rule}.mrs`;
  });
  return acc;
}, {});

// src/config/ruleGenerators.js
function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [];
}
function getOutbounds(selectedRuleNames) {
  if (!selectedRuleNames || !Array.isArray(selectedRuleNames)) {
    return [];
  }
  return UNIFIED_RULES.filter((rule) => selectedRuleNames.includes(rule.name)).map((rule) => rule.name);
}
function generateRules(selectedRules = [], customRules = []) {
  if (typeof selectedRules === "string" && PREDEFINED_RULE_SETS[selectedRules]) {
    selectedRules = PREDEFINED_RULE_SETS[selectedRules];
  }
  if (!selectedRules || selectedRules.length === 0) {
    selectedRules = PREDEFINED_RULE_SETS.minimal;
  }
  const rules = [];
  UNIFIED_RULES.forEach((rule) => {
    if (selectedRules.includes(rule.name)) {
      rules.push({
        site_rules: rule.site_rules,
        ip_rules: rule.ip_rules,
        domain_suffix: rule?.domain_suffix,
        ip_cidr: rule?.ip_cidr,
        outbound: rule.name
      });
    }
  });
  customRules.reverse();
  customRules.forEach((rule) => {
    rules.unshift({
      site_rules: toStringArray(rule.site),
      ip_rules: toStringArray(rule.ip),
      domain_suffix: toStringArray(rule.domain_suffix),
      domain_keyword: toStringArray(rule.domain_keyword),
      ip_cidr: toStringArray(rule.ip_cidr),
      src_ip_cidr: toStringArray(rule.src_ip_cidr),
      protocol: toStringArray(rule.protocol),
      outbound: rule.name
    });
  });
  return rules;
}
function generateRuleSets(selectedRules = [], customRules = []) {
  if (typeof selectedRules === "string" && PREDEFINED_RULE_SETS[selectedRules]) {
    selectedRules = PREDEFINED_RULE_SETS[selectedRules];
  }
  if (!selectedRules || selectedRules.length === 0) {
    selectedRules = PREDEFINED_RULE_SETS.minimal;
  }
  const selectedRulesSet = new Set(selectedRules);
  const siteRuleSets = /* @__PURE__ */ new Set();
  const ipRuleSets = /* @__PURE__ */ new Set();
  const ruleSets = [];
  UNIFIED_RULES.forEach((rule) => {
    if (selectedRulesSet.has(rule.name)) {
      rule.site_rules.forEach((siteRule) => siteRuleSets.add(siteRule));
      rule.ip_rules.forEach((ipRule) => ipRuleSets.add(ipRule));
    }
  });
  const site_rule_sets = Array.from(siteRuleSets).map((rule) => ({
    tag: rule,
    type: "remote",
    format: "binary",
    url: `${SITE_RULE_SET_BASE_URL}${SITE_RULE_SETS[rule]}`
  }));
  const ip_rule_sets = Array.from(ipRuleSets).map((rule) => ({
    tag: `${rule}-ip`,
    type: "remote",
    format: "binary",
    url: `${IP_RULE_SET_BASE_URL}${IP_RULE_SETS[rule]}`
  }));
  if (!selectedRules.includes("Non-China")) {
    site_rule_sets.push({
      tag: "geolocation-!cn",
      type: "remote",
      format: "binary",
      url: `${SITE_RULE_SET_BASE_URL}geolocation-!cn.srs`
    });
  }
  if (customRules) {
    customRules.forEach((rule) => {
      toStringArray(rule.site).forEach((site) => {
        site_rule_sets.push({
          tag: site,
          type: "remote",
          format: "binary",
          url: `${SITE_RULE_SET_BASE_URL}${site}.srs`
        });
      });
      toStringArray(rule.ip).forEach((ip) => {
        ip_rule_sets.push({
          tag: `${ip}-ip`,
          type: "remote",
          format: "binary",
          url: `${IP_RULE_SET_BASE_URL}${ip}.srs`
        });
      });
    });
  }
  ruleSets.push(...site_rule_sets, ...ip_rule_sets);
  return { site_rule_sets, ip_rule_sets };
}
function generateClashRuleSets(selectedRules = [], customRules = [], useMrs = true) {
  if (typeof selectedRules === "string" && PREDEFINED_RULE_SETS[selectedRules]) {
    selectedRules = PREDEFINED_RULE_SETS[selectedRules];
  }
  if (!selectedRules || selectedRules.length === 0) {
    selectedRules = PREDEFINED_RULE_SETS.minimal;
  }
  const format = useMrs ? "mrs" : "yaml";
  const ext = useMrs ? ".mrs" : ".yaml";
  const selectedRulesSet = new Set(selectedRules);
  const siteRuleSets = /* @__PURE__ */ new Set();
  const ipRuleSets = /* @__PURE__ */ new Set();
  UNIFIED_RULES.forEach((rule) => {
    if (selectedRulesSet.has(rule.name)) {
      rule.site_rules.forEach((siteRule) => siteRuleSets.add(siteRule));
      rule.ip_rules.forEach((ipRule) => ipRuleSets.add(ipRule));
    }
  });
  const site_rule_providers = {};
  const ip_rule_providers = {};
  Array.from(siteRuleSets).forEach((rule) => {
    site_rule_providers[rule] = {
      type: "http",
      format,
      behavior: "domain",
      url: `${CLASH_SITE_RULE_SET_BASE_URL}${rule}${ext}`,
      path: `./ruleset/${rule}${ext}`,
      interval: 86400
    };
  });
  Array.from(ipRuleSets).forEach((rule) => {
    ip_rule_providers[`${rule}-ip`] = {
      type: "http",
      format,
      behavior: "ipcidr",
      url: `${CLASH_IP_RULE_SET_BASE_URL}${rule}${ext}`,
      path: `./ruleset/${rule}-ip${ext}`,
      interval: 86400
    };
  });
  if (!selectedRules.includes("Non-China")) {
    site_rule_providers["geolocation-!cn"] = {
      type: "http",
      format,
      behavior: "domain",
      url: `${CLASH_SITE_RULE_SET_BASE_URL}geolocation-!cn${ext}`,
      path: `./ruleset/geolocation-!cn${ext}`,
      interval: 86400
    };
  }
  if (customRules) {
    customRules.forEach((rule) => {
      toStringArray(rule.site).forEach((site) => {
        site_rule_providers[site] = {
          type: "http",
          format,
          behavior: "domain",
          url: `${CLASH_SITE_RULE_SET_BASE_URL}${site}${ext}`,
          path: `./ruleset/${site}${ext}`,
          interval: 86400
        };
      });
      toStringArray(rule.ip).forEach((ip) => {
        ip_rule_providers[`${ip}-ip`] = {
          type: "http",
          format,
          behavior: "ipcidr",
          url: `${CLASH_IP_RULE_SET_BASE_URL}${ip}${ext}`,
          path: `./ruleset/${ip}-ip${ext}`,
          interval: 86400
        };
      });
    });
  }
  return { site_rule_providers, ip_rule_providers };
}

// src/i18n/index.js
init_utils();
var translations = {
  "zh-CN": {
    enableClashUI: "\u542F\u7528 Clash API",
    enableClashUITip: "\u5728 SingBox \u914D\u7F6E\u4E2D\u542F\u7528 Clash API (\u652F\u6301 Dashboard \u9762\u677F)\uFF0C\u9ED8\u8BA4\u7AEF\u53E3 9090",
    externalController: "\u5916\u90E8\u63A7\u5236\u7AEF\u53E3",
    externalControllerPlaceholder: "\u9ED8\u8BA4 0.0.0.0:9090",
    externalUiDownloadUrl: "Clash UI \u4E0B\u8F7D\u5730\u5740",
    externalUiDownloadUrlPlaceholder: "\u9ED8\u8BA4 zashboard \u4ED3\u5E93\u538B\u7F29\u5305\u5730\u5740",
    missingInput: "\u7F3A\u5C11\u8F93\u5165\u53C2\u6570",
    missingConfig: "\u7F3A\u5C11\u914D\u7F6E\u53C2\u6570",
    missingUrl: "\u7F3A\u5C11URL\u53C2\u6570",
    shortUrlNotFound: "\u77ED\u94FE\u63A5\u672A\u627E\u5230",
    invalidShortUrl: "\u65E0\u6548\u7684\u77ED\u94FE\u63A5",
    urlParsedSuccess: "\u5DF2\u6210\u529F\u89E3\u6790\u8BA2\u9605\u94FE\u63A5\u914D\u7F6E",
    internalError: "\u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF",
    notFound: "\u672A\u627E\u5230",
    invalidFormat: "\u65E0\u6548\u683C\u5F0F\uFF1A",
    defaultRules: ["\u5E7F\u544A\u62E6\u622A", "\u8C37\u6B4C\u670D\u52A1", "\u56FD\u5916\u5A92\u4F53", "\u7535\u62A5\u6D88\u606F"],
    configValidationError: "\u914D\u7F6E\u9A8C\u8BC1\u9519\u8BEF\uFF1A",
    pageDescription: `${APP_NAME} - \u8BA2\u9605\u94FE\u63A5\u8F6C\u6362\u5DE5\u5177`,
    pageKeywords: "\u8BA2\u9605\u94FE\u63A5,\u8F6C\u6362,Xray,SingBox,Clash,Surge",
    pageTitle: `${APP_NAME} - \u8BA2\u9605\u94FE\u63A5\u8F6C\u6362\u5DE5\u5177`,
    ogTitle: `${APP_NAME} - \u8BA2\u9605\u94FE\u63A5\u8F6C\u6362\u5DE5\u5177`,
    ogDescription: "\u4E00\u4E2A\u5F3A\u5927\u7684\u8BA2\u9605\u94FE\u63A5\u8F6C\u6362\u5DE5\u5177\uFF0C\u652F\u6301\u591A\u79CD\u5BA2\u6237\u7AEF\u683C\u5F0F",
    shareUrls: "\u8F93\u5165\u6E90",
    urlPlaceholder: "\u652F\u6301\u7C98\u8D34\uFF1A\u5206\u4EAB\u94FE\u63A5\u3001Clash \u914D\u7F6E\u3001Sing-Box \u914D\u7F6E\u3001Surge \u914D\u7F6E...",
    advancedOptions: "\u9AD8\u7EA7\u9009\u9879",
    baseConfigSettings: "\u57FA\u7840\u914D\u7F6E\u8BBE\u7F6E",
    baseConfigTooltip: "\u5728\u6B64\u5904\u81EA\u5B9A\u4E49\u60A8\u7684\u57FA\u7840\u914D\u7F6E",
    saveConfig: "\u4FDD\u5B58\u914D\u7F6E",
    savingConfig: "\u4FDD\u5B58\u4E2D...",
    configContentRequired: "\u8BF7\u5148\u8F93\u5165\u57FA\u7840\u914D\u7F6E\u5185\u5BB9",
    clearConfig: "\u6E05\u9664\u914D\u7F6E",
    convert: "\u8F6C\u6362",
    clear: "\u6E05\u9664",
    paste: "\u7C98\u8D34",
    processing: "\u5904\u7406\u4E2D...",
    errorGeneratingLinks: "\u751F\u6210\u94FE\u63A5\u65F6\u51FA\u9519",
    confirmClearConfig: "\u786E\u5B9A\u8981\u6E05\u9664\u914D\u7F6E\u5417\uFF1F",
    confirmClearAll: "\u786E\u5B9A\u8981\u6E05\u9664\u6240\u6709\u5185\u5BB9\u5417\uFF1F",
    saveConfigSuccess: "\u914D\u7F6E\u4FDD\u5B58\u6210\u529F\uFF01",
    customPath: "\u81EA\u5B9A\u4E49\u8DEF\u5F84",
    savedPaths: "\u5DF2\u4FDD\u5B58\u7684\u8DEF\u5F84",
    shortenLinks: "\u751F\u6210\u77ED\u94FE\u63A5",
    ruleSelection: "\u89C4\u5219\u9009\u62E9",
    ruleSelectionTooltip: "\u9009\u62E9\u60A8\u9700\u8981\u7684\u89C4\u5219\u96C6",
    copySubconverterUrl: "\u590D\u5236\u914D\u7F6E\u5730\u5740",
    copiedSubconverterUrl: "\u5DF2\u590D\u5236\uFF01",
    subconverterConfigTitle: "Subconverter \u5916\u90E8\u914D\u7F6E",
    subconverterConfigDesc: "\u6839\u636E\u4E0A\u65B9\u9009\u62E9\u7684\u89C4\u5219\u548C\u8BBE\u7F6E\uFF0C\u751F\u6210 Subconverter \u5916\u90E8\u914D\u7F6E\u5730\u5740\uFF0C\u53EF\u76F4\u63A5\u7528\u4E8E Subconverter \u7684 config \u53C2\u6570\u3002",
    custom: "\u81EA\u5B9A\u4E49",
    minimal: "\u6700\u5C0F\u5316",
    balanced: "\u5747\u8861",
    comprehensive: "\u5168\u9762",
    addCustomRule: "\u6DFB\u52A0\u81EA\u5B9A\u4E49\u89C4\u5219",
    customRuleOutboundName: "\u51FA\u7AD9\u540D\u79F0*",
    customRuleGeoSite: "Geo-Site\u89C4\u5219\u96C6",
    customRuleGeoSiteTooltip: "SingBox\u4E2D\u7684Site\u89C4\u5219\u6765\u81EA https://github.com/MetaCubeX/meta-rules-dat (sing \u5206\u652F)\uFF0C\u8FD9\u610F\u5473\u7740\u60A8\u7684\u81EA\u5B9A\u4E49\u89C4\u5219\u5FC5\u987B\u5728\u8BE5\u4ED3\u5E93\u4E2D",
    customRuleGeoSitePlaceholder: "\u4F8B\u5982\uFF1Agoogle,anthropic",
    customRuleGeoIP: "Geo-IP\u89C4\u5219\u96C6",
    customRuleGeoIPTooltip: "SingBox\u4E2D\u7684IP\u89C4\u5219\u6765\u81EA https://github.com/MetaCubeX/meta-rules-dat (sing \u5206\u652F)\uFF0C\u8FD9\u610F\u5473\u7740\u60A8\u7684\u81EA\u5B9A\u4E49\u89C4\u5219\u5FC5\u987B\u5728\u8BE5\u4ED3\u5E93\u4E2D",
    customRuleGeoIPPlaceholder: "\u4F8B\u5982\uFF1Aprivate,cn",
    customRuleDomainSuffix: "\u57DF\u540D\u540E\u7F00",
    customRuleDomainSuffixPlaceholder: "\u57DF\u540D\u540E\u7F00\uFF08\u7528\u9017\u53F7\u5206\u9694\uFF09",
    customRuleDomainKeyword: "\u57DF\u540D\u5173\u952E\u8BCD",
    customRuleDomainKeywordPlaceholder: "\u57DF\u540D\u5173\u952E\u8BCD\uFF08\u7528\u9017\u53F7\u5206\u9694\uFF09",
    customRuleSrcIPCIDR: "\u6765\u6E90 IP CIDR",
    customRuleSrcIPCIDRTooltip: "\u6309\u6765\u6E90 IP \u5206\u6D41\uFF08Clash/OpenClash\uFF1ASRC-IP-CIDR\uFF1BSing-Box\uFF1Asource_ip_cidr\uFF1BSurge\uFF1A\u4EC5\u652F\u6301\u5355\u4E2A IP\uFF0C/32 \u4F1A\u81EA\u52A8\u964D\u7EA7\u4E3A SRC-IP\uFF09",
    customRuleSrcIPCIDRPlaceholder: "\u6765\u6E90 IP CIDR\uFF08\u7528\u9017\u53F7\u5206\u9694\uFF09",
    customRuleIPCIDR: "IP CIDR",
    customRuleIPCIDRPlaceholder: "IP CIDR\uFF08\u7528\u9017\u53F7\u5206\u9694\uFF09",
    customRuleProtocol: "\u534F\u8BAE\u7C7B\u578B",
    customRuleProtocolTooltip: "\u7279\u5B9A\u6D41\u91CF\u7C7B\u578B\u7684\u534F\u8BAE\u89C4\u5219\u3002\u66F4\u591A\u8BE6\u60C5\uFF1Ahttps://sing-box.sagernet.org/configuration/route/sniff/",
    customRuleProtocolPlaceholder: "\u534F\u8BAE\uFF08\u7528\u9017\u53F7\u5206\u9694\uFF0C\u4F8B\u5982\uFF1Ahttp,ssh,dns\uFF09",
    removeCustomRule: "\u79FB\u9664",
    addCustomRuleJSON: "\u6DFB\u52A0JSON\u89C4\u5219",
    customRuleJSON: "JSON\u89C4\u5219",
    customRuleJSONTooltip: "\u4F7F\u7528JSON\u683C\u5F0F\u6DFB\u52A0\u81EA\u5B9A\u4E49\u89C4\u5219\uFF0C\u652F\u6301\u6279\u91CF\u6DFB\u52A0",
    customRulesSection: "\u81EA\u5B9A\u4E49\u89C4\u5219",
    customRulesSectionTooltip: "\u521B\u5EFA\u81EA\u5B9A\u4E49\u8DEF\u7531\u89C4\u5219\u6765\u63A7\u5236\u7279\u5B9A\u6D41\u91CF\u7684\u8DEF\u7531\u884C\u4E3A\u3002",
    customRulesForm: "\u8868\u5355\u89C6\u56FE",
    customRulesJSON: "JSON\u89C6\u56FE",
    customRule: "\u81EA\u5B9A\u4E49\u89C4\u5219",
    convertToJSON: "\u8F6C\u6362\u4E3AJSON",
    convertToForm: "\u8F6C\u6362\u4E3A\u8868\u5355",
    validateJSON: "\u9A8C\u8BC1JSON",
    validateConfig: "\u9A8C\u8BC1\u914D\u7F6E",
    validJsonConfig: "JSON \u914D\u7F6E\u683C\u5F0F\u6709\u6548",
    validYamlConfig: "YAML \u914D\u7F6E\u683C\u5F0F\u6709\u6548",
    parserUnavailable: "\u89E3\u6790\u5668\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5",
    clearAll: "\u6E05\u7A7A\u6240\u6709",
    addJSONRule: "\u6DFB\u52A0JSON\u89C4\u5219",
    noCustomRulesForm: '\u70B9\u51FB"\u6DFB\u52A0\u81EA\u5B9A\u4E49\u89C4\u5219"\u5F00\u59CB\u521B\u5EFA\u89C4\u5219',
    noCustomRulesJSON: '\u70B9\u51FB"\u6DFB\u52A0JSON\u89C4\u5219"\u5F00\u59CB\u521B\u5EFA\u89C4\u5219',
    confirmClearAllRules: "\u786E\u5B9A\u8981\u6E05\u7A7A\u6240\u6709\u81EA\u5B9A\u4E49\u89C4\u5219\u5417\uFF1F",
    noFormRulesToConvert: "\u6CA1\u6709\u8868\u5355\u89C4\u5219\u53EF\u4EE5\u8F6C\u6362",
    noValidJSONToConvert: "\u6CA1\u6709\u6709\u6548\u7684JSON\u89C4\u5219\u53EF\u4EE5\u8F6C\u6362",
    convertedFromForm: "\u4ECE\u8868\u5355\u8F6C\u6362",
    convertedFromJSON: "\u4ECEJSON\u8F6C\u6362",
    mustBeArray: "\u5FC5\u987B\u662F\u6570\u7EC4\u683C\u5F0F",
    nameRequired: "\u89C4\u5219\u540D\u79F0\u662F\u5FC5\u9700\u7684",
    invalidJSON: "\u65E0\u6548\u7684JSON\u683C\u5F0F",
    allJSONValid: "\u6240\u6709JSON\u89C4\u5219\u90FD\u6709\u6548\uFF01",
    jsonValidationErrors: "JSON\u9A8C\u8BC1\u9519\u8BEF",
    // 规则名称和出站名称的翻译
    outboundNames: {
      "Auto Select": "\u26A1 \u81EA\u52A8\u9009\u62E9",
      "Node Select": "\u{1F680} \u8282\u70B9\u9009\u62E9",
      "Fall Back": "\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C",
      "Ad Block": "\u{1F6D1} \u5E7F\u544A\u62E6\u622A",
      "AI Services": "\u{1F4AC} AI \u670D\u52A1",
      "Bilibili": "\u{1F4FA} \u54D4\u54E9\u54D4\u54E9",
      "Youtube": "\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891",
      "Google": "\u{1F50D} \u8C37\u6B4C\u670D\u52A1",
      "Private": "\u{1F3E0} \u79C1\u6709\u7F51\u7EDC",
      "Location:CN": "\u{1F512} \u56FD\u5185\u670D\u52A1",
      "Telegram": "\u{1F4F2} \u7535\u62A5\u6D88\u606F",
      "Github": "\u{1F431} Github",
      "Microsoft": "\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1",
      "Apple": "\u{1F34F} \u82F9\u679C\u670D\u52A1",
      "Social Media": "\u{1F310} \u793E\u4EA4\u5A92\u4F53",
      "Streaming": "\u{1F3AC} \u6D41\u5A92\u4F53",
      "Gaming": "\u{1F3AE} \u6E38\u620F\u5E73\u53F0",
      "Education": "\u{1F4DA} \u6559\u80B2\u8D44\u6E90",
      "Financial": "\u{1F4B0} \u91D1\u878D\u670D\u52A1",
      "Cloud Services": "\u2601\uFE0F \u4E91\u670D\u52A1",
      "Non-China": "\u{1F310} \u975E\u4E2D\u56FD",
      "Manual Switch": "\u{1F590}\uFE0F \u624B\u52A8\u5207\u6362",
      "GLOBAL": "GLOBAL"
    },
    generalSettings: "\u901A\u7528\u8BBE\u7F6E",
    groupByCountry: "\u6309\u56FD\u5BB6\u5206\u7EC4",
    groupByCountryTip: "\u4EC5 Clash/Surge/SingBox \u751F\u6548",
    includeAutoSelect: "\u5305\u542B\u81EA\u52A8\u9009\u62E9\u5206\u7EC4",
    UASettings: "\u81EA\u5B9A\u4E49UserAgent",
    UAtip: "\u9ED8\u8BA4\u503Ccurl/7.74.0",
    subscriptionLinks: "\u8BA2\u9605\u94FE\u63A5",
    xrayLink: "Xray \u94FE\u63A5 (Base64)",
    singboxLink: "SingBox \u94FE\u63A5",
    clashLink: "Clash \u94FE\u63A5",
    surgeLink: "Surge \u94FE\u63A5",
    copied: "\u5DF2\u590D\u5236\uFF01",
    shortening: "\u6B63\u5728\u751F\u6210\u77ED\u94FE\u63A5...",
    alreadyShortened: "\u94FE\u63A5\u5DF2\u7ECF\u662F\u77ED\u94FE\u63A5\u4E86\uFF01",
    shortenFailed: "\u751F\u6210\u77ED\u94FE\u63A5\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5",
    customShortCode: "\u81EA\u5B9A\u4E49\u77ED\u94FE\u63A5\u4EE3\u7801",
    optional: "\u53EF\u9009",
    customShortCodePlaceholder: "\u7559\u7A7A\u81EA\u52A8\u751F\u6210\uFF0C\u6216\u8F93\u5165\u81EA\u5B9A\u4E49\u4EE3\u7801",
    showFullLinks: "\u663E\u793A\u5B8C\u6574\u94FE\u63A5",
    noLinkProvided: "\u6CA1\u6709\u63D0\u4F9B\u94FE\u63A5\uFF01",
    scanQRCode: "\u626B\u63CF\u4E8C\u7EF4\u7801",
    tryShortLinks: "\u8BF7\u5C1D\u8BD5\u4F7F\u7528\u77ED\u94FE\u63A5\uFF01",
    configSaved: "\u914D\u7F6E\u4FDD\u5B58\u6210\u529F\uFF01",
    configSaveFailed: "\u4FDD\u5B58\u914D\u7F6E\u5931\u8D25",
    error: "\u9519\u8BEF\uFF1A",
    validJSON: "\u6709\u6548\u7684JSON",
    rules: "\u6761\u89C4\u5219",
    rule: "\u89C4\u5219",
    // UpdateChecker
    newVersionAvailable: "\u53D1\u73B0\u65B0\u7248\u672C",
    viewRelease: "\u67E5\u770B\u66F4\u65B0",
    updateGuide: "\u66F4\u65B0\u6307\u5357",
    later: "\u7A0D\u540E"
  },
  "en-US": {
    enableClashUI: "Enable Clash API",
    enableClashUITip: "Enable Clash API in SingBox config (Support Dashboard), default port 9090",
    externalController: "External Controller",
    externalControllerPlaceholder: "Default 0.0.0.0:9090",
    externalUiDownloadUrl: "External UI Download URL",
    externalUiDownloadUrlPlaceholder: "Default zashboard archive URL",
    missingInput: "Missing input parameter",
    missingConfig: "Missing config parameter",
    missingUrl: "Missing URL parameter",
    shortUrlNotFound: "Short URL not found",
    invalidShortUrl: "Invalid short URL",
    urlParsedSuccess: "Successfully parsed subscription link configuration",
    internalError: "Internal Server Error",
    notFound: "Not Found",
    invalidFormat: "Invalid format: ",
    defaultRules: ["Ad Blocking", "Google Services", "Foreign Media", "Telegram"],
    configValidationError: "Config validation error: ",
    pageDescription: `${APP_NAME} - Subscription Link Converter`,
    pageKeywords: "subscription link,converter,Xray,SingBox,Clash,Surge",
    pageTitle: `${APP_NAME} - Subscription Link Converter`,
    ogTitle: `${APP_NAME} - Subscription Link Converter`,
    ogDescription: "A powerful subscription link converter supporting multiple client formats",
    shareUrls: "Input Source",
    urlPlaceholder: "Paste share links, Clash config, Sing-Box config, or Surge config...",
    advancedOptions: "Advanced Options",
    baseConfigSettings: "Base Config Settings",
    baseConfigTooltip: "Customize your base configuration here",
    saveConfig: "Save Config",
    savingConfig: "Saving...",
    configContentRequired: "Please enter base config content first",
    clearConfig: "Clear Config",
    convert: "Convert",
    clear: "Clear",
    paste: "Paste",
    processing: "Processing...",
    errorGeneratingLinks: "Error generating links",
    confirmClearConfig: "Are you sure you want to clear the configuration?",
    confirmClearAll: "Are you sure you want to clear all?",
    saveConfigSuccess: "Configuration saved successfully!",
    customPath: "Custom Path",
    savedPaths: "Saved Paths",
    shortenLinks: "Generate Short Links",
    ruleSelection: "Rule Selection",
    ruleSelectionTooltip: "Select your desired rule sets",
    copySubconverterUrl: "Copy Config URL",
    copiedSubconverterUrl: "Copied!",
    subconverterConfigTitle: "Subconverter External Config",
    subconverterConfigDesc: "Generate a Subconverter external config URL based on the rules and settings above, for use as the config parameter in Subconverter.",
    custom: "Custom",
    minimal: "Minimal",
    balanced: "Balanced",
    comprehensive: "Comprehensive",
    addCustomRule: "Add Custom Rule",
    customRuleOutboundName: "Outbound Name*",
    customRuleGeoSite: "Geo-Site Rules",
    customRuleGeoSiteTooltip: "SingBox Site rules come from https://github.com/MetaCubeX/meta-rules-dat (sing branch), which means your custom rules must be in that repository",
    customRuleGeoSitePlaceholder: "e.g., google,anthropic",
    customRuleGeoIP: "Geo-IP Rules",
    customRuleGeoIPTooltip: "SingBox IP rules come from https://github.com/MetaCubeX/meta-rules-dat (sing branch), which means your custom rules must be in that repository",
    customRuleGeoIPPlaceholder: "e.g., private,cn",
    customRuleDomainSuffix: "Domain Suffix",
    customRuleDomainSuffixPlaceholder: "Domain suffixes (comma separated)",
    customRuleDomainKeyword: "Domain Keyword",
    customRuleDomainKeywordPlaceholder: "Domain keywords (comma separated)",
    customRuleSrcIPCIDR: "Source IP CIDR",
    customRuleSrcIPCIDRTooltip: "Route by source IP (Clash/OpenClash: SRC-IP-CIDR; Sing-Box: source_ip_cidr; Surge: only supports single IP, /32 will be downgraded to SRC-IP)",
    customRuleSrcIPCIDRPlaceholder: "Source IP CIDR (comma separated)",
    customRuleIPCIDR: "IP CIDR",
    customRuleIPCIDRPlaceholder: "IP CIDR (comma separated)",
    customRuleProtocol: "Protocol Type",
    customRuleProtocolTooltip: "Protocol rules for specific traffic types. More details: https://sing-box.sagernet.org/configuration/route/sniff/",
    customRuleProtocolPlaceholder: "Protocols (comma separated, e.g., http,ssh,dns)",
    removeCustomRule: "Remove",
    addCustomRuleJSON: "Add JSON Rule",
    customRuleJSON: "JSON Rule",
    customRuleJSONTooltip: "Add custom rules using JSON format, supports batch adding",
    customRulesSection: "Custom Rules",
    customRulesSectionTooltip: "Create custom routing rules to control traffic routing behavior. Supports both form and JSON editing modes with bidirectional conversion.",
    customRulesForm: "Form View",
    customRulesJSON: "JSON View",
    customRule: "Custom Rule",
    convertToJSON: "Convert to JSON",
    convertToForm: "Convert to Form",
    validateJSON: "Validate JSON",
    validateConfig: "Validate Config",
    validJsonConfig: "JSON config is valid",
    validYamlConfig: "YAML config is valid",
    parserUnavailable: "Parser unavailable. Please refresh and try again.",
    clearAll: "Clear All",
    addJSONRule: "Add JSON Rule",
    noCustomRulesForm: 'Click "Add Custom Rule" to start creating rules',
    noCustomRulesJSON: 'Click "Add JSON Rule" to start creating rules',
    confirmClearAllRules: "Are you sure you want to clear all custom rules?",
    noFormRulesToConvert: "No form rules to convert",
    noValidJSONToConvert: "No valid JSON rules to convert",
    convertedFromForm: "Converted from Form",
    convertedFromJSON: "Converted from JSON",
    mustBeArray: "Must be an array format",
    nameRequired: "Rule name is required",
    invalidJSON: "Invalid JSON format",
    allJSONValid: "All JSON rules are valid!",
    jsonValidationErrors: "JSON validation errors",
    outboundNames: {
      "Auto Select": "\u26A1 Auto Select",
      "Node Select": "\u{1F680} Node Select",
      "Fall Back": "\u{1F41F} Fall Back",
      "Ad Block": "\u{1F6D1} Ad Blocking",
      "AI Services": "\u{1F4AC} AI Services",
      "Bilibili": "\u{1F4FA} Bilibili",
      "Youtube": "\u{1F4F9} Youtube",
      "Google": "\u{1F50D} Google Services",
      "Private": "\u{1F3E0} Private Network",
      "Location:CN": "\u{1F512} China Services",
      "Telegram": "\u{1F4F2} Telegram",
      "Github": "\u{1F431} Github",
      "Microsoft": "\u24C2\uFE0F Microsoft Services",
      "Apple": "\u{1F34F} Apple Services",
      "Social Media": "\u{1F310} Social Media",
      "Streaming": "\u{1F3AC} Streaming",
      "Gaming": "\u{1F3AE} Gaming Platform",
      "Education": "\u{1F4DA} Education Resources",
      "Financial": "\u{1F4B0} Financial Services",
      "Cloud Services": "\u2601\uFE0F Cloud Services",
      "Non-China": "\u{1F310} Non-China",
      "Manual Switch": "\u{1F590}\uFE0F Manual Switch",
      "GLOBAL": "GLOBAL"
    },
    generalSettings: "General Settings",
    groupByCountry: "Group by Country",
    groupByCountryTip: "Clash/Surge/SingBox only",
    includeAutoSelect: "Include Auto Select Group",
    UASettings: "Custom UserAgent",
    UAtip: "By default it will use curl/7.74.0",
    subscriptionLinks: "Subscription Links",
    xrayLink: "Xray Link (Base64)",
    singboxLink: "SingBox Link",
    clashLink: "Clash Link",
    surgeLink: "Surge Link",
    copied: "Copied!",
    shortening: "Shortening...",
    alreadyShortened: "Links are already shortened!",
    shortenFailed: "Failed to shorten URLs. Please try again.",
    customShortCode: "Custom Short Code",
    optional: "Optional",
    customShortCodePlaceholder: "Leave empty for auto-generation, or enter custom code",
    showFullLinks: "Show Full Links",
    noLinkProvided: "No link provided!",
    scanQRCode: "Scan QR Code",
    tryShortLinks: "Try to use short links!",
    configSaved: "Configuration saved successfully!",
    configSaveFailed: "Failed to save configuration",
    error: "Error: ",
    validJSON: "Valid JSON",
    rules: "rules",
    rule: "Rule",
    // UpdateChecker
    newVersionAvailable: "New Version Available",
    viewRelease: "View Release",
    updateGuide: "Update Guide",
    later: "Later"
  },
  "fa": {
    missingInput: "\u067E\u0627\u0631\u0627\u0645\u062A\u0631 \u0648\u0631\u0648\u062F\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F",
    missingConfig: "\u067E\u0627\u0631\u0627\u0645\u062A\u0631 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F",
    missingUrl: "\u067E\u0627\u0631\u0627\u0645\u062A\u0631 URL \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F",
    shortUrlNotFound: "\u0644\u06CC\u0646\u06A9 \u06A9\u0648\u062A\u0627\u0647 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F",
    invalidShortUrl: "\u0644\u06CC\u0646\u06A9 \u06A9\u0648\u062A\u0627\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631",
    urlParsedSuccess: "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u062C\u0632\u06CC\u0647 \u0634\u062F",
    internalError: "\u062E\u0637\u0627\u06CC \u062F\u0627\u062E\u0644\u06CC \u0633\u0631\u0648\u0631",
    notFound: "\u06CC\u0627\u0641\u062A \u0646\u0634\u062F",
    invalidFormat: "\u0641\u0631\u0645\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631: ",
    defaultRules: ["\u0645\u0633\u062F\u0648\u062F\u0633\u0627\u0632\u06CC \u062A\u0628\u0644\u06CC\u063A\u0627\u062A", "\u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627\u06CC \u06AF\u0648\u06AF\u0644", "\u0631\u0633\u0627\u0646\u0647\u200C\u0647\u0627\u06CC \u062E\u0627\u0631\u062C\u06CC", "\u062A\u0644\u06AF\u0631\u0627\u0645"],
    configValidationError: "\u062E\u0637\u0627\u06CC \u0627\u0639\u062A\u0628\u0627\u0631\u0633\u0646\u062C\u06CC \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC: ",
    pageDescription: `${APP_NAME} - \u0645\u0628\u062F\u0644 \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9`,
    pageKeywords: "\u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9,\u0645\u0628\u062F\u0644,Xray,SingBox,Clash,Surge",
    pageTitle: `${APP_NAME} - \u0645\u0628\u062F\u0644 \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9`,
    ogTitle: `${APP_NAME} - \u0645\u0628\u062F\u0644 \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9`,
    ogDescription: "\u06CC\u06A9 \u0645\u0628\u062F\u0644 \u0642\u062F\u0631\u062A\u0645\u0646\u062F \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0627\u0632 \u0641\u0631\u0645\u062A\u200C\u0647\u0627\u06CC \u0645\u062E\u062A\u0644\u0641",
    shareUrls: "\u0645\u0646\u0628\u0639 \u0648\u0631\u0648\u062F\u06CC",
    urlPlaceholder: "\u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9\u060C \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC Clash\u060C Sing-Box \u06CC\u0627 Surge \u0631\u0627 \u062C\u0627\u06CC\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646\u06CC\u062F...",
    advancedOptions: "\u06AF\u0632\u06CC\u0646\u0647\u200C\u0647\u0627\u06CC \u067E\u06CC\u0634\u0631\u0641\u062A\u0647",
    baseConfigSettings: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u067E\u0627\u06CC\u0647",
    baseConfigTooltip: "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u067E\u0627\u06CC\u0647 \u062E\u0648\u062F \u0631\u0627 \u0627\u06CC\u0646\u062C\u0627 \u0633\u0641\u0627\u0631\u0634\u06CC \u06A9\u0646\u06CC\u062F",
    saveConfig: "\u0630\u062E\u06CC\u0631\u0647 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC",
    savingConfig: "\u062F\u0631 \u062D\u0627\u0644 \u0630\u062E\u06CC\u0631\u0647...",
    configContentRequired: "\u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u0645\u062D\u062A\u0648\u0627\u06CC \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u067E\u0627\u06CC\u0647 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F",
    clearConfig: "\u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC",
    convert: "\u062A\u0628\u062F\u06CC\u0644",
    clear: "\u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646",
    paste: "\u0686\u0633\u0628\u0627\u0646\u062F\u0646",
    processing: "\u062F\u0631 \u062D\u0627\u0644 \u067E\u0631\u062F\u0627\u0632\u0634...",
    errorGeneratingLinks: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627",
    confirmClearConfig: "\u0622\u06CC\u0627 \u0645\u0637\u0645\u0626\u0646 \u0647\u0633\u062A\u06CC\u062F \u06A9\u0647 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u06CC\u062F \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0631\u0627 \u067E\u0627\u06A9 \u06A9\u0646\u06CC\u062F\u061F",
    confirmClearAll: "\u0622\u06CC\u0627 \u0645\u0637\u0645\u0626\u0646 \u0647\u0633\u062A\u06CC\u062F \u06A9\u0647 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u06CC\u062F \u0647\u0645\u0647 \u0631\u0627 \u067E\u0627\u06A9 \u06A9\u0646\u06CC\u062F\u061F",
    saveConfigSuccess: "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F!",
    customPath: "\u0645\u0633\u06CC\u0631 \u0633\u0641\u0627\u0631\u0634\u06CC",
    savedPaths: "\u0645\u0633\u06CC\u0631\u0647\u0627\u06CC \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F\u0647",
    shortenLinks: "\u0627\u06CC\u062C\u0627\u062F \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647",
    ruleSelection: "\u0627\u0646\u062A\u062E\u0627\u0628 \u0642\u0648\u0627\u0646\u06CC\u0646",
    ruleSelectionTooltip: "\u0645\u062C\u0645\u0648\u0639\u0647 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u062E\u0648\u062F \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F",
    copySubconverterUrl: "\u06A9\u067E\u06CC \u0622\u062F\u0631\u0633 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC",
    copiedSubconverterUrl: "\u06A9\u067E\u06CC \u0634\u062F!",
    subconverterConfigTitle: "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u062E\u0627\u0631\u062C\u06CC Subconverter",
    subconverterConfigDesc: "\u0622\u062F\u0631\u0633 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u062E\u0627\u0631\u062C\u06CC Subconverter \u0631\u0627 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0648 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0628\u0627\u0644\u0627 \u0627\u06CC\u062C\u0627\u062F \u06A9\u0646\u06CC\u062F.",
    custom: "\u0633\u0641\u0627\u0631\u0634\u06CC",
    minimal: "\u062D\u062F\u0627\u0642\u0644",
    balanced: "\u0645\u062A\u0639\u0627\u062F\u0644",
    comprehensive: "\u062C\u0627\u0645\u0639",
    addCustomRule: "\u0627\u0641\u0632\u0648\u062F\u0646 \u0642\u0627\u0646\u0648\u0646 \u0633\u0641\u0627\u0631\u0634\u06CC",
    customRuleOutboundName: "\u0646\u0627\u0645 \u062E\u0631\u0648\u062C\u06CC*",
    customRuleGeoSite: "\u0642\u0648\u0627\u0646\u06CC\u0646 Geo-Site",
    customRuleGeoSiteTooltip: "\u0642\u0648\u0627\u0646\u06CC\u0646 SingBox Site \u0627\u0632 https://github.com/MetaCubeX/meta-rules-dat (\u0634\u0627\u062E\u0647 sing) \u0645\u06CC\u200C\u0622\u06CC\u0646\u062F\u060C \u0628\u0647 \u0627\u06CC\u0646 \u0645\u0639\u0646\u06CC \u06A9\u0647 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0633\u0641\u0627\u0631\u0634\u06CC \u0634\u0645\u0627 \u0628\u0627\u06CC\u062F \u062F\u0631 \u0622\u0646 \u0645\u062E\u0632\u0646 \u0628\u0627\u0634\u062F",
    customRuleGeoSitePlaceholder: "\u0628\u0631\u0627\u06CC \u0645\u062B\u0627\u0644: google,anthropic",
    customRuleGeoIP: "\u0642\u0648\u0627\u0646\u06CC\u0646 Geo-IP",
    customRuleGeoIPTooltip: "\u0642\u0648\u0627\u0646\u06CC\u0646 SingBox IP \u0627\u0632 https://github.com/MetaCubeX/meta-rules-dat (\u0634\u0627\u062E\u0647 sing) \u0645\u06CC\u200C\u0622\u06CC\u0646\u062F\u060C \u0628\u0647 \u0627\u06CC\u0646 \u0645\u0639\u0646\u06CC \u06A9\u0647 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0633\u0641\u0627\u0631\u0634\u06CC \u0634\u0645\u0627 \u0628\u0627\u06CC\u062F \u062F\u0631 \u0622\u0646 \u0645\u062E\u0632\u0646 \u0628\u0627\u0634\u062F",
    customRuleGeoIPPlaceholder: "\u0628\u0631\u0627\u06CC \u0645\u062B\u0627\u0644: private,cn",
    customRuleDomainSuffix: "\u067E\u0633\u0648\u0646\u062F \u062F\u0627\u0645\u0646\u0647",
    customRuleDomainSuffixPlaceholder: "\u067E\u0633\u0648\u0646\u062F\u0647\u0627\u06CC \u062F\u0627\u0645\u0646\u0647 (\u0628\u0627 \u06A9\u0627\u0645\u0627 \u062C\u062F\u0627 \u0634\u062F\u0647)",
    customRuleDomainKeyword: "\u06A9\u0644\u0645\u0647 \u06A9\u0644\u06CC\u062F\u06CC \u062F\u0627\u0645\u0646\u0647",
    customRuleDomainKeywordPlaceholder: "\u06A9\u0644\u0645\u0627\u062A \u06A9\u0644\u06CC\u062F\u06CC \u062F\u0627\u0645\u0646\u0647 (\u0628\u0627 \u06A9\u0627\u0645\u0627 \u062C\u062F\u0627 \u0634\u062F\u0647)",
    customRuleSrcIPCIDR: "CIDR IP \u0645\u0646\u0628\u0639",
    customRuleSrcIPCIDRTooltip: "\u0645\u0633\u06CC\u0631\u06CC\u0627\u0628\u06CC \u0628\u0631 \u0627\u0633\u0627\u0633 IP \u0645\u0646\u0628\u0639 (Clash/OpenClash: SRC-IP-CIDR\u061B Sing-Box: source_ip_cidr\u061B Surge: \u0641\u0642\u0637 IP \u062A\u06A9\u06CC \u0631\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 /32 \u0628\u0647 SRC-IP \u062A\u0628\u062F\u06CC\u0644 \u0645\u06CC\u200C\u0634\u0648\u062F)",
    customRuleSrcIPCIDRPlaceholder: "CIDR IP \u0645\u0646\u0628\u0639 (\u0628\u0627 \u06A9\u0627\u0645\u0627 \u062C\u062F\u0627 \u0634\u062F\u0647)",
    customRuleIPCIDR: "IP CIDR",
    customRuleIPCIDRPlaceholder: "IP CIDR (\u0628\u0627 \u06A9\u0627\u0645\u0627 \u062C\u062F\u0627 \u0634\u062F\u0647)",
    customRuleProtocol: "\u0646\u0648\u0639 \u067E\u0631\u0648\u062A\u06A9\u0644",
    customRuleProtocolTooltip: "\u0642\u0648\u0627\u0646\u06CC\u0646 \u067E\u0631\u0648\u062A\u06A9\u0644 \u0628\u0631\u0627\u06CC \u0627\u0646\u0648\u0627\u0639 \u062E\u0627\u0635 \u062A\u0631\u0627\u0641\u06CC\u06A9. \u062C\u0632\u0626\u06CC\u0627\u062A \u0628\u06CC\u0634\u062A\u0631: https://sing-box.sagernet.org/configuration/route/sniff/",
    customRuleProtocolPlaceholder: "\u067E\u0631\u0648\u062A\u06A9\u0644\u200C\u0647\u0627 (\u0628\u0627 \u06A9\u0627\u0645\u0627 \u062C\u062F\u0627 \u0634\u062F\u0647\u060C \u0645\u062B\u0644\u0627\u064B: http,ssh,dns)",
    removeCustomRule: "\u062D\u0630\u0641",
    addCustomRuleJSON: "\u0627\u0641\u0632\u0648\u062F\u0646 \u0642\u0627\u0646\u0648\u0646 JSON",
    customRuleJSON: "\u0642\u0627\u0646\u0648\u0646 JSON",
    customRuleJSONTooltip: "\u0627\u0641\u0632\u0648\u062F\u0646 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0633\u0641\u0627\u0631\u0634\u06CC \u0628\u0627 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0641\u0631\u0645\u062A JSON\u060C \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0627\u0632 \u0627\u0641\u0632\u0648\u062F\u0646 \u062F\u0633\u062A\u0647\u200C\u0627\u06CC",
    customRulesSection: "\u0642\u0648\u0627\u0646\u06CC\u0646 \u0633\u0641\u0627\u0631\u0634\u06CC",
    customRulesSectionTooltip: "\u0642\u0648\u0627\u0646\u06CC\u0646 \u0645\u0633\u06CC\u0631\u06CC\u0627\u0628\u06CC \u0633\u0641\u0627\u0631\u0634\u06CC \u0628\u0631\u0627\u06CC \u06A9\u0646\u062A\u0631\u0644 \u0631\u0641\u062A\u0627\u0631 \u0645\u0633\u06CC\u0631\u06CC\u0627\u0628\u06CC \u062A\u0631\u0627\u0641\u06CC\u06A9 \u0627\u06CC\u062C\u0627\u062F \u06A9\u0646\u06CC\u062F. \u0627\u0632 \u062D\u0627\u0644\u062A\u200C\u0647\u0627\u06CC \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0641\u0631\u0645 \u0648 JSON \u0628\u0627 \u062A\u0628\u062F\u06CC\u0644 \u062F\u0648\u0637\u0631\u0641\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    customRulesForm: "\u0646\u0645\u0627\u06CC \u0641\u0631\u0645",
    customRulesJSON: "\u0646\u0645\u0627\u06CC JSON",
    customRule: "\u0642\u0627\u0646\u0648\u0646 \u0633\u0641\u0627\u0631\u0634\u06CC",
    convertToJSON: "\u062A\u0628\u062F\u06CC\u0644 \u0628\u0647 JSON",
    convertToForm: "\u062A\u0628\u062F\u06CC\u0644 \u0628\u0647 \u0641\u0631\u0645",
    validateJSON: "\u0627\u0639\u062A\u0628\u0627\u0631\u0633\u0646\u062C\u06CC JSON",
    validateConfig: "\u0627\u0639\u062A\u0628\u0627\u0631\u0633\u0646\u062C\u06CC \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC",
    validJsonConfig: "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC JSON \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A",
    validYamlConfig: "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC YAML \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A",
    parserUnavailable: "\u062A\u062C\u0632\u06CC\u0647\u200C\u06AF\u0631 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0635\u0641\u062D\u0647 \u0631\u0627 \u062A\u0627\u0632\u0647\u200C\u0633\u0627\u0632\u06CC \u06A9\u0646\u06CC\u062F.",
    clearAll: "\u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646 \u0647\u0645\u0647",
    addJSONRule: "\u0627\u0641\u0632\u0648\u062F\u0646 \u0642\u0627\u0646\u0648\u0646 JSON",
    noCustomRulesForm: '\u0631\u0648\u06CC "\u0627\u0641\u0632\u0648\u062F\u0646 \u0642\u0627\u0646\u0648\u0646 \u0633\u0641\u0627\u0631\u0634\u06CC" \u06A9\u0644\u06CC\u06A9 \u06A9\u0646\u06CC\u062F \u062A\u0627 \u0634\u0631\u0648\u0639 \u0628\u0647 \u0627\u06CC\u062C\u0627\u062F \u0642\u0648\u0627\u0646\u06CC\u0646 \u06A9\u0646\u06CC\u062F',
    noCustomRulesJSON: '\u0631\u0648\u06CC "\u0627\u0641\u0632\u0648\u062F\u0646 \u0642\u0627\u0646\u0648\u0646 JSON" \u06A9\u0644\u06CC\u06A9 \u06A9\u0646\u06CC\u062F \u062A\u0627 \u0634\u0631\u0648\u0639 \u0628\u0647 \u0627\u06CC\u062C\u0627\u062F \u0642\u0648\u0627\u0646\u06CC\u0646 \u06A9\u0646\u06CC\u062F',
    confirmClearAllRules: "\u0622\u06CC\u0627 \u0645\u0637\u0645\u0626\u0646 \u0647\u0633\u062A\u06CC\u062F \u06A9\u0647 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u06CC\u062F \u0647\u0645\u0647 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0633\u0641\u0627\u0631\u0634\u06CC \u0631\u0627 \u067E\u0627\u06A9 \u06A9\u0646\u06CC\u062F\u061F",
    noFormRulesToConvert: "\u0647\u06CC\u0686 \u0642\u0627\u0646\u0648\u0646 \u0641\u0631\u0645\u06CC \u0628\u0631\u0627\u06CC \u062A\u0628\u062F\u06CC\u0644 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F",
    noValidJSONToConvert: "\u0647\u06CC\u0686 \u0642\u0627\u0646\u0648\u0646 JSON \u0645\u0639\u062A\u0628\u0631\u06CC \u0628\u0631\u0627\u06CC \u062A\u0628\u062F\u06CC\u0644 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F",
    convertedFromForm: "\u0627\u0632 \u0641\u0631\u0645 \u062A\u0628\u062F\u06CC\u0644 \u0634\u062F\u0647",
    convertedFromJSON: "\u0627\u0632 JSON \u062A\u0628\u062F\u06CC\u0644 \u0634\u062F\u0647",
    mustBeArray: "\u0628\u0627\u06CC\u062F \u062F\u0631 \u0642\u0627\u0644\u0628 \u0622\u0631\u0627\u06CC\u0647 \u0628\u0627\u0634\u062F",
    nameRequired: "\u0646\u0627\u0645 \u0642\u0627\u0646\u0648\u0646 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A",
    invalidJSON: "\u0641\u0631\u0645\u062A JSON \u0646\u0627\u0645\u0639\u062A\u0628\u0631",
    allJSONValid: "\u0647\u0645\u0647 \u0642\u0648\u0627\u0646\u06CC\u0646 JSON \u0645\u0639\u062A\u0628\u0631 \u0647\u0633\u062A\u0646\u062F!",
    jsonValidationErrors: "\u062E\u0637\u0627\u0647\u0627\u06CC \u0627\u0639\u062A\u0628\u0627\u0631\u0633\u0646\u062C\u06CC JSON",
    outboundNames: {
      "Auto Select": "\u26A1 \u0627\u0646\u062A\u062E\u0627\u0628 \u062E\u0648\u062F\u06A9\u0627\u0631",
      "Node Select": "\u{1F680} \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0648\u062F",
      "Fall Back": "\u{1F41F} \u0641\u0627\u0644 \u0628\u06A9",
      "Ad Block": "\u{1F6D1} \u0645\u0633\u062F\u0648\u062F\u0633\u0627\u0632\u06CC \u062A\u0628\u0644\u06CC\u063A\u0627\u062A",
      "AI Services": "\u{1F4AC} \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC",
      "Bilibili": "\u{1F4FA} \u0628\u06CC\u0644\u06CC\u200C\u0628\u06CC\u0644\u06CC",
      "Youtube": "\u{1F4F9} \u06CC\u0648\u062A\u06CC\u0648\u0628",
      "Google": "\u{1F50D} \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627\u06CC \u06AF\u0648\u06AF\u0644",
      "Private": "\u{1F3E0} \u0634\u0628\u06A9\u0647 \u062E\u0635\u0648\u0635\u06CC",
      "Location:CN": "\u{1F512} \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627\u06CC \u0686\u06CC\u0646",
      "Telegram": "\u{1F4F2} \u062A\u0644\u06AF\u0631\u0627\u0645",
      "Github": "\u{1F431} \u06AF\u06CC\u062A\u200C\u0647\u0627\u0628",
      "Microsoft": "\u24C2\uFE0F \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627\u06CC \u0645\u0627\u06CC\u06A9\u0631\u0648\u0633\u0627\u0641\u062A",
      "Apple": "\u{1F34F} \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627\u06CC \u0627\u067E\u0644",
      "Social Media": "\u{1F310} \u0634\u0628\u06A9\u0647\u200C\u0647\u0627\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC",
      "Streaming": "\u{1F3AC} \u0627\u0633\u062A\u0631\u06CC\u0645\u06CC\u0646\u06AF",
      "Gaming": "\u{1F3AE} \u067E\u0644\u062A\u0641\u0631\u0645 \u0628\u0627\u0632\u06CC",
      "Education": "\u{1F4DA} \u0645\u0646\u0627\u0628\u0639 \u0622\u0645\u0648\u0632\u0634\u06CC",
      "Financial": "\u{1F4B0} \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627\u06CC \u0645\u0627\u0644\u06CC",
      "Cloud Services": "\u2601\uFE0F \u0633\u0631\u0648\u06CC\u0633\u200C\u0647\u0627\u06CC \u0627\u0628\u0631\u06CC",
      "Non-China": "\u{1F310} \u062E\u0627\u0631\u062C \u0627\u0632 \u0686\u06CC\u0646",
      "Manual Switch": "\u{1F590}\uFE0F Manual Switch",
      "GLOBAL": "GLOBAL"
    },
    generalSettings: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0639\u0645\u0648\u0645\u06CC",
    groupByCountry: "\u06AF\u0631\u0648\u0647\u200C\u0628\u0646\u062F\u06CC \u0628\u0631 \u0627\u0633\u0627\u0633 \u06A9\u0634\u0648\u0631",
    groupByCountryTip: "\u0641\u0642\u0637 Clash/Surge/SingBox",
    includeAutoSelect: "\u0634\u0627\u0645\u0644 \u06AF\u0631\u0648\u0647 \u0627\u0646\u062A\u062E\u0627\u0628 \u062E\u0648\u062F\u06A9\u0627\u0631",
    UASettings: "UserAgent \u0633\u0641\u0627\u0631\u0634\u06CC",
    UAtip: "\u0628\u0647 \u0637\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0627\u0632 curl/7.74.0 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F",
    subscriptionLinks: "\u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9",
    xrayLink: "\u0644\u06CC\u0646\u06A9 Xray (Base64)",
    singboxLink: "\u0644\u06CC\u0646\u06A9 SingBox",
    clashLink: "\u0644\u06CC\u0646\u06A9 Clash",
    surgeLink: "\u0644\u06CC\u0646\u06A9 Surge",
    copied: "\u06A9\u067E\u06CC \u0634\u062F!",
    shortening: "\u062F\u0631 \u062D\u0627\u0644 \u06A9\u0648\u062A\u0627\u0647 \u06A9\u0631\u062F\u0646...",
    alreadyShortened: "\u0644\u06CC\u0646\u06A9\u200C\u0647\u0627 \u0627\u0632 \u0642\u0628\u0644 \u06A9\u0648\u062A\u0627\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F!",
    shortenFailed: "\u06A9\u0648\u062A\u0627\u0647 \u06A9\u0631\u062F\u0646 URL \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F. \u0644\u0637\u0641\u0627\u064B \u062F\u0648\u0628\u0627\u0631\u0647 \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F.",
    customShortCode: "\u06A9\u062F \u06A9\u0648\u062A\u0627\u0647 \u0633\u0641\u0627\u0631\u0634\u06CC",
    optional: "\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC",
    customShortCodePlaceholder: "\u0628\u0631\u0627\u06CC \u062A\u0648\u0644\u06CC\u062F \u062E\u0648\u062F\u06A9\u0627\u0631 \u062E\u0627\u0644\u06CC \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F \u06CC\u0627 \u06A9\u062F \u0633\u0641\u0627\u0631\u0634\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F",
    showFullLinks: "\u0646\u0645\u0627\u06CC\u0634 \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u06A9\u0627\u0645\u0644",
    noLinkProvided: "\u0644\u06CC\u0646\u06A9\u06CC \u0627\u0631\u0627\u0626\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A!",
    scanQRCode: "\u0627\u0633\u06A9\u0646 \u06A9\u062F QR",
    tryShortLinks: "\u0644\u0637\u0641\u0627\u064B \u0627\u0632 \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F!",
    configSaved: "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F!",
    configSaveFailed: "\u0630\u062E\u06CC\u0631\u0647 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F",
    error: "\u062E\u0637\u0627: ",
    validJSON: "JSON \u0645\u0639\u062A\u0628\u0631",
    rules: "\u0642\u0648\u0627\u0646\u06CC\u0646",
    rule: "\u0642\u0627\u0646\u0648\u0646",
    // UpdateChecker
    newVersionAvailable: "\u0646\u0633\u062E\u0647 \u062C\u062F\u06CC\u062F \u0645\u0648\u062C\u0648\u062F \u0627\u0633\u062A",
    viewRelease: "\u0645\u0634\u0627\u0647\u062F\u0647 \u0627\u0646\u062A\u0634\u0627\u0631",
    updateGuide: "\u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC",
    later: "\u0628\u0639\u062F\u0627\u064B"
  },
  "ru": {
    missingInput: "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0432\u0445\u043E\u0434\u043D\u043E\u0439 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440",
    missingConfig: "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438",
    missingUrl: "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440 URL",
    shortUrlNotFound: "\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430",
    invalidShortUrl: "\u041D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u0430\u044F \u043A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430",
    urlParsedSuccess: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u0441\u0441\u044B\u043B\u043A\u0438 \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u043D\u0430",
    internalError: "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430",
    notFound: "\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
    invalidFormat: "\u041D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442: ",
    defaultRules: ["\u0411\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u043A\u0430 \u0440\u0435\u043A\u043B\u0430\u043C\u044B", "\u0421\u0435\u0440\u0432\u0438\u0441\u044B Google", "\u0417\u0430\u0440\u0443\u0431\u0435\u0436\u043D\u044B\u0435 \u043C\u0435\u0434\u0438\u0430", "Telegram"],
    configValidationError: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438: ",
    pageDescription: `${APP_NAME} - \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0434\u043B\u044F \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u0441\u044B\u043B\u043E\u043A \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438`,
    pageKeywords: "\u0441\u0441\u044B\u043B\u043A\u0430 \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438,\u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435,Xray,SingBox,Clash,Surge",
    pageTitle: `${APP_NAME} - \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0434\u043B\u044F \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u0441\u044B\u043B\u043E\u043A \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438`,
    ogTitle: `${APP_NAME} - \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0434\u043B\u044F \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u0441\u044B\u043B\u043E\u043A \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438`,
    ogDescription: "\u041C\u043E\u0449\u043D\u044B\u0439 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0434\u043B\u044F \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u0441\u044B\u043B\u043E\u043A \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438, \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0449\u0438\u0439 \u0440\u0430\u0437\u043B\u0438\u0447\u043D\u044B\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u044B \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432",
    shareUrls: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u0432\u0432\u043E\u0434\u0430",
    urlPlaceholder: "\u0412\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0441\u0441\u044B\u043B\u043A\u0438, \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E Clash, Sing-Box \u0438\u043B\u0438 Surge...",
    advancedOptions: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    baseConfigSettings: "\u0411\u0430\u0437\u043E\u0432\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438",
    baseConfigTooltip: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0431\u0430\u0437\u043E\u0432\u0443\u044E \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E \u0437\u0434\u0435\u0441\u044C",
    saveConfig: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E",
    savingConfig: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435...",
    configContentRequired: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0431\u0430\u0437\u043E\u0432\u043E\u0439 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438",
    clearConfig: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E",
    convert: "\u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u044C",
    clear: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C",
    paste: "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C",
    processing: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430...",
    errorGeneratingLinks: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0441\u0441\u044B\u043B\u043E\u043A",
    confirmClearConfig: "\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E?",
    confirmClearAll: "\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u0451?",
    saveConfigSuccess: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0430!",
    customPath: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \u043F\u0443\u0442\u044C",
    savedPaths: "\u0421\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u043F\u0443\u0442\u0438",
    shortenLinks: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
    ruleSelection: "\u0412\u044B\u0431\u043E\u0440 \u043F\u0440\u0430\u0432\u0438\u043B",
    ruleSelectionTooltip: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u0443\u0436\u043D\u044B\u0435 \u043D\u0430\u0431\u043E\u0440\u044B \u043F\u0440\u0430\u0432\u0438\u043B",
    copySubconverterUrl: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C URL",
    copiedSubconverterUrl: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!",
    subconverterConfigTitle: "\u0412\u043D\u0435\u0448\u043D\u044F\u044F \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F Subconverter",
    subconverterConfigDesc: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 URL \u0432\u043D\u0435\u0448\u043D\u0435\u0439 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 Subconverter \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u043F\u0440\u0430\u0432\u0438\u043B \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A \u0432\u044B\u0448\u0435.",
    custom: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439",
    minimal: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439",
    balanced: "\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439",
    comprehensive: "\u041F\u043E\u043B\u043D\u044B\u0439",
    addCustomRule: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u043E",
    customRuleOutboundName: "\u0418\u043C\u044F \u0432\u044B\u0445\u043E\u0434\u0430*",
    customRuleGeoSite: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 Geo-Site",
    customRuleGeoSiteTooltip: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 Site \u0432 SingBox \u0431\u0435\u0440\u0443\u0442\u0441\u044F \u0438\u0437 https://github.com/MetaCubeX/meta-rules-dat (\u0432\u0435\u0442\u043A\u0430 sing), \u0437\u043D\u0430\u0447\u0438\u0442 \u0432\u0430\u0448\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u0432 \u044D\u0442\u043E\u043C \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0438",
    customRuleGeoSitePlaceholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: google,anthropic",
    customRuleGeoIP: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 Geo-IP",
    customRuleGeoIPTooltip: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 IP \u0432 SingBox \u0431\u0435\u0440\u0443\u0442\u0441\u044F \u0438\u0437 https://github.com/MetaCubeX/meta-rules-dat (\u0432\u0435\u0442\u043A\u0430 sing), \u0437\u043D\u0430\u0447\u0438\u0442 \u0432\u0430\u0448\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u0432 \u044D\u0442\u043E\u043C \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0438",
    customRuleGeoIPPlaceholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: private,cn",
    customRuleDomainSuffix: "\u0421\u0443\u0444\u0444\u0438\u043A\u0441 \u0434\u043E\u043C\u0435\u043D\u0430",
    customRuleDomainSuffixPlaceholder: "\u0421\u0443\u0444\u0444\u0438\u043A\u0441\u044B \u0434\u043E\u043C\u0435\u043D\u0430 (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E)",
    customRuleDomainKeyword: "\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430 \u0434\u043E\u043C\u0435\u043D\u0430",
    customRuleDomainKeywordPlaceholder: "\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430 \u0434\u043E\u043C\u0435\u043D\u0430 (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E)",
    customRuleSrcIPCIDR: "CIDR \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0433\u043E IP",
    customRuleSrcIPCIDRTooltip: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u043F\u043E \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u043C\u0443 IP (Clash/OpenClash: SRC-IP-CIDR; Sing-Box: source_ip_cidr; Surge: \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0434\u0438\u043D\u043E\u0447\u043D\u044B\u0439 IP, /32 \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D \u0432 SRC-IP)",
    customRuleSrcIPCIDRPlaceholder: "CIDR \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0433\u043E IP (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E)",
    customRuleIPCIDR: "IP CIDR",
    customRuleIPCIDRPlaceholder: "IP CIDR (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E)",
    customRuleProtocol: "\u0422\u0438\u043F \u043F\u0440\u043E\u0442\u043E\u043A\u043E\u043B\u0430",
    customRuleProtocolTooltip: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0434\u043B\u044F \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0451\u043D\u043D\u044B\u0445 \u0442\u0438\u043F\u043E\u0432 \u0442\u0440\u0430\u0444\u0438\u043A\u0430. \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435: https://sing-box.sagernet.org/configuration/route/sniff/",
    customRuleProtocolPlaceholder: "\u041F\u0440\u043E\u0442\u043E\u043A\u043E\u043B\u044B (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: http,ssh,dns)",
    removeCustomRule: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
    addCustomRuleJSON: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0440\u0430\u0432\u0438\u043B\u043E JSON",
    customRuleJSON: "\u041F\u0440\u0430\u0432\u0438\u043B\u043E JSON",
    customRuleJSONTooltip: "\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0445 \u043F\u0440\u0430\u0432\u0438\u043B \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 JSON, \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u043F\u0430\u043A\u0435\u0442\u043D\u043E\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
    customRulesSection: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430",
    customRulesSectionTooltip: "\u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0446\u0438\u0438 \u0434\u043B\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435\u043C \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0446\u0438\u0438 \u0442\u0440\u0430\u0444\u0438\u043A\u0430. \u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u0440\u0435\u0436\u0438\u043C\u044B \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0444\u043E\u0440\u043C\u044B \u0438 JSON \u0441 \u0434\u0432\u0443\u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u043C \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435\u043C.",
    customRulesForm: "\u0412\u0438\u0434 \u0444\u043E\u0440\u043C\u044B",
    customRulesJSON: "\u0412\u0438\u0434 JSON",
    customRule: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u043E",
    convertToJSON: "\u041A\u043E\u043D\u0432\u0435\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432 JSON",
    convertToForm: "\u041A\u043E\u043D\u0432\u0435\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432 \u0444\u043E\u0440\u043C\u0443",
    validateJSON: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C JSON",
    validateConfig: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E",
    validJsonConfig: "JSON-\u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0430",
    validYamlConfig: "YAML-\u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0430",
    parserUnavailable: "\u041F\u0430\u0440\u0441\u0435\u0440 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D. \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.",
    clearAll: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u0451",
    addJSONRule: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0440\u0430\u0432\u0438\u043B\u043E JSON",
    noCustomRulesForm: '\u041D\u0430\u0436\u043C\u0438\u0442\u0435 "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u043E" \u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B',
    noCustomRulesJSON: '\u041D\u0430\u0436\u043C\u0438\u0442\u0435 "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0440\u0430\u0432\u0438\u043B\u043E JSON" \u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B',
    confirmClearAllRules: "\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430?",
    noFormRulesToConvert: "\u041D\u0435\u0442 \u043F\u0440\u0430\u0432\u0438\u043B \u0444\u043E\u0440\u043C\u044B \u0434\u043B\u044F \u043A\u043E\u043D\u0432\u0435\u0440\u0442\u0430\u0446\u0438\u0438",
    noValidJSONToConvert: "\u041D\u0435\u0442 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043F\u0440\u0430\u0432\u0438\u043B JSON \u0434\u043B\u044F \u043A\u043E\u043D\u0432\u0435\u0440\u0442\u0430\u0446\u0438\u0438",
    convertedFromForm: "\u041A\u043E\u043D\u0432\u0435\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0438\u0437 \u0444\u043E\u0440\u043C\u044B",
    convertedFromJSON: "\u041A\u043E\u043D\u0432\u0435\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0438\u0437 JSON",
    mustBeArray: "\u0414\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 \u043C\u0430\u0441\u0441\u0438\u0432\u0430",
    nameRequired: "\u0418\u043C\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E",
    invalidJSON: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 JSON",
    allJSONValid: "\u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 JSON \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u044B!",
    jsonValidationErrors: "\u041E\u0448\u0438\u0431\u043A\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 JSON",
    outboundNames: {
      "Auto Select": "\u26A1 \u0410\u0432\u0442\u043E\u0432\u044B\u0431\u043E\u0440",
      "Node Select": "\u{1F680} \u0412\u044B\u0431\u043E\u0440 \u0443\u0437\u043B\u0430",
      "Fall Back": "\u{1F41F} \u0420\u0435\u0437\u0435\u0440\u0432",
      "Ad Block": "\u{1F6D1} \u0411\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u043A\u0430 \u0440\u0435\u043A\u043B\u0430\u043C\u044B",
      "AI Services": "\u{1F4AC} AI-\u0441\u0435\u0440\u0432\u0438\u0441\u044B",
      "Bilibili": "\u{1F4FA} Bilibili",
      "Youtube": "\u{1F4F9} YouTube",
      "Google": "\u{1F50D} \u0421\u0435\u0440\u0432\u0438\u0441\u044B Google",
      "Private": "\u{1F3E0} \u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0435\u0442\u044C",
      "Location:CN": "\u{1F512} \u0421\u0435\u0440\u0432\u0438\u0441\u044B \u041A\u0438\u0442\u0430\u044F",
      "Telegram": "\u{1F4F2} Telegram",
      "Github": "\u{1F431} GitHub",
      "Microsoft": "\u24C2\uFE0F \u0421\u0435\u0440\u0432\u0438\u0441\u044B Microsoft",
      "Apple": "\u{1F34F} \u0421\u0435\u0440\u0432\u0438\u0441\u044B Apple",
      "Social Media": "\u{1F310} \u0421\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0435\u0442\u0438",
      "Streaming": "\u{1F3AC} \u0421\u0442\u0440\u0438\u043C\u0438\u043D\u0433",
      "Gaming": "\u{1F3AE} \u0418\u0433\u0440\u043E\u0432\u044B\u0435 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B",
      "Education": "\u{1F4DA} \u041E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0435\u0441\u0443\u0440\u0441\u044B",
      "Financial": "\u{1F4B0} \u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u044B",
      "Cloud Services": "\u2601\uFE0F \u041E\u0431\u043B\u0430\u0447\u043D\u044B\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u044B",
      "Non-China": "\u{1F310} \u0417\u0430 \u043F\u0440\u0435\u0434\u0435\u043B\u0430\u043C\u0438 \u041A\u0438\u0442\u0430\u044F",
      "Manual Switch": "\u{1F590}\uFE0F \u0420\u0443\u0447\u043D\u043E\u0439 \u0432\u044B\u0431\u043E\u0440",
      "GLOBAL": "GLOBAL"
    },
    generalSettings: "\u041E\u0431\u0449\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    groupByCountry: "\u0413\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u043E \u0441\u0442\u0440\u0430\u043D\u0430\u043C",
    groupByCountryTip: "\u0422\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F Clash/Surge/SingBox",
    includeAutoSelect: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443 \u0430\u0432\u0442\u043E\u0432\u044B\u0431\u043E\u0440\u0430",
    UASettings: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 UserAgent",
    UAtip: "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F curl/7.74.0",
    subscriptionLinks: "\u0421\u0441\u044B\u043B\u043A\u0438 \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438",
    xrayLink: "\u0421\u0441\u044B\u043B\u043A\u0430 Xray (Base64)",
    singboxLink: "\u0421\u0441\u044B\u043B\u043A\u0430 SingBox",
    clashLink: "\u0421\u0441\u044B\u043B\u043A\u0430 Clash",
    surgeLink: "\u0421\u0441\u044B\u043B\u043A\u0430 Surge",
    copied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!",
    shortening: "\u0421\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u0435...",
    alreadyShortened: "\u0421\u0441\u044B\u043B\u043A\u0438 \u0443\u0436\u0435 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u044B!",
    shortenFailed: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u043A\u0440\u0430\u0442\u0438\u0442\u044C URL. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.",
    customShortCode: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u043A\u043E\u0434",
    optional: "\u041D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E",
    customShortCodePlaceholder: "\u041E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u0443\u0441\u0442\u044B\u043C \u0434\u043B\u044F \u0430\u0432\u0442\u043E\u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0438\u043B\u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0432\u043E\u0439 \u043A\u043E\u0434",
    showFullLinks: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u043E\u043B\u043D\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
    noLinkProvided: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0435 \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0430!",
    scanQRCode: "\u0421\u043A\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C QR-\u043A\u043E\u0434",
    tryShortLinks: "\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0435 \u0441\u0441\u044B\u043B\u043A\u0438!",
    configSaved: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0430!",
    configSaveFailed: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E",
    error: "\u041E\u0448\u0438\u0431\u043A\u0430: ",
    validJSON: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 JSON",
    rules: "\u043F\u0440\u0430\u0432\u0438\u043B\u0430",
    rule: "\u041F\u0440\u0430\u0432\u0438\u043B\u043E",
    // UpdateChecker
    newVersionAvailable: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u043D\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F",
    viewRelease: "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0440\u0435\u043B\u0438\u0437",
    updateGuide: "\u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043F\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044E",
    later: "\u041F\u043E\u0437\u0436\u0435"
  }
};
function resolveLanguage(lang) {
  if (translations[lang]) {
    return lang;
  } else if (checkStartsWith(lang, "en")) {
    return "en-US";
  } else if (checkStartsWith(lang, "fa")) {
    return "fa";
  } else if (checkStartsWith(lang, "ru")) {
    return "ru";
  } else {
    return "zh-CN";
  }
}
function createTranslator(lang) {
  const currentLang = resolveLanguage(lang);
  return function t(key) {
    const keys = key.split(".");
    let value = translations[currentLang];
    for (const k of keys) {
      value = value?.[k];
      if (value === void 0) {
        if (checkStartsWith(key, "outboundNames.")) {
          return key.split(".")[1];
        }
        return key;
      }
    }
    return value;
  };
}

// src/config/subconverterConfig.js
init_utils();
var REJECT_RULES = /* @__PURE__ */ new Set(["Ad Block"]);
var SPEED_TEST_URL = "http://www.gstatic.com/generate_204";
function escapeRegex(str2) {
  return str2.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
function buildCountryGroupRefs(countryGroupNames) {
  return countryGroupNames.map((name) => `[]${name}`).join("`");
}
function generateSubconverterConfig({ selectedRules = [], customRules = [], lang = "zh-CN", includeAutoSelect = true, groupByCountry = false } = {}) {
  const t = createTranslator(lang);
  const rules = generateRules(selectedRules, customRules);
  const lines = ["[custom]"];
  rules.forEach((rule) => {
    const groupName = t(`outboundNames.${rule.outbound}`);
    if (rule.src_ip_cidr) {
      rule.src_ip_cidr.forEach((cidr) => {
        if (cidr) lines.push(`ruleset=${groupName},[]SRC-IP-CIDR,${cidr}`);
      });
    }
  });
  rules.forEach((rule) => {
    const groupName = t(`outboundNames.${rule.outbound}`);
    if (rule.domain_suffix) {
      rule.domain_suffix.forEach((suffix) => {
        if (suffix) lines.push(`ruleset=${groupName},[]DOMAIN-SUFFIX,${suffix}`);
      });
    }
    if (rule.domain_keyword) {
      rule.domain_keyword.forEach((keyword) => {
        if (keyword) lines.push(`ruleset=${groupName},[]DOMAIN-KEYWORD,${keyword}`);
      });
    }
    if (rule.site_rules) {
      rule.site_rules.forEach((site) => {
        if (site) lines.push(`ruleset=${groupName},[]GEOSITE,${site}`);
      });
    }
  });
  rules.forEach((rule) => {
    const groupName = t(`outboundNames.${rule.outbound}`);
    if (rule.ip_rules) {
      rule.ip_rules.forEach((ip) => {
        if (ip) lines.push(`ruleset=${groupName},[]GEOIP,${ip}`);
      });
    }
    if (rule.ip_cidr) {
      rule.ip_cidr.forEach((cidr) => {
        if (cidr) lines.push(`ruleset=${groupName},[]IP-CIDR,${cidr}`);
      });
    }
  });
  const fallBackName = t("outboundNames.Fall Back");
  lines.push(`ruleset=${fallBackName},[]FINAL`);
  lines.push("");
  const nodeSelectName = t("outboundNames.Node Select");
  const autoSelectName = t("outboundNames.Auto Select");
  const manualSwitchName = t("outboundNames.Manual Switch");
  const countryGroupNames = [];
  const countryGroupLines = [];
  if (groupByCountry) {
    Object.values(COUNTRY_DATA).forEach((country) => {
      const groupName = `${country.emoji} ${country.name}`;
      countryGroupNames.push(groupName);
      const regex = country.aliases.map((a) => {
        const escaped = escapeRegex(a);
        return /^[A-Za-z\s]+$/.test(a) ? `\\b${escaped}\\b` : escaped;
      }).join("|");
      countryGroupLines.push(`custom_proxy_group=${groupName}\`url-test\`(?i)(${regex})\`${SPEED_TEST_URL}\`300,,50`);
    });
  }
  if (groupByCountry) {
    const refs = buildCountryGroupRefs(countryGroupNames);
    if (includeAutoSelect) {
      lines.push(`custom_proxy_group=${nodeSelectName}\`select\`[]${autoSelectName}\`[]${manualSwitchName}\`${refs}\`[]DIRECT`);
    } else {
      lines.push(`custom_proxy_group=${nodeSelectName}\`select\`[]${manualSwitchName}\`${refs}\`[]DIRECT`);
    }
  } else {
    if (includeAutoSelect) {
      lines.push(`custom_proxy_group=${nodeSelectName}\`select\`[]${autoSelectName}\`[]DIRECT\`.*`);
    } else {
      lines.push(`custom_proxy_group=${nodeSelectName}\`select\`[]DIRECT\`.*`);
    }
  }
  if (includeAutoSelect) {
    lines.push(`custom_proxy_group=${autoSelectName}\`url-test\`.*\`${SPEED_TEST_URL}\`300,,50`);
  }
  if (groupByCountry) {
    lines.push(`custom_proxy_group=${manualSwitchName}\`select\`.*`);
  }
  countryGroupLines.forEach((line) => lines.push(line));
  const processedGroups = /* @__PURE__ */ new Set([nodeSelectName]);
  if (includeAutoSelect) processedGroups.add(autoSelectName);
  if (groupByCountry) {
    processedGroups.add(manualSwitchName);
    countryGroupNames.forEach((name) => processedGroups.add(name));
  }
  rules.forEach((rule) => {
    const groupName = t(`outboundNames.${rule.outbound}`);
    if (processedGroups.has(groupName)) return;
    processedGroups.add(groupName);
    if (REJECT_RULES.has(rule.outbound)) {
      lines.push(`custom_proxy_group=${groupName}\`select\`[]REJECT\`[]DIRECT`);
    } else if (DIRECT_DEFAULT_RULES.has(rule.outbound)) {
      lines.push(`custom_proxy_group=${groupName}\`select\`[]DIRECT\`[]${nodeSelectName}`);
    } else {
      if (groupByCountry) {
        const refs = buildCountryGroupRefs(countryGroupNames);
        if (includeAutoSelect) {
          lines.push(`custom_proxy_group=${groupName}\`select\`[]${nodeSelectName}\`[]${autoSelectName}\`[]${manualSwitchName}\`${refs}\`[]DIRECT`);
        } else {
          lines.push(`custom_proxy_group=${groupName}\`select\`[]${nodeSelectName}\`[]${manualSwitchName}\`${refs}\`[]DIRECT`);
        }
      } else {
        if (includeAutoSelect) {
          lines.push(`custom_proxy_group=${groupName}\`select\`[]${nodeSelectName}\`[]${autoSelectName}\`[]DIRECT\`.*`);
        } else {
          lines.push(`custom_proxy_group=${groupName}\`select\`[]${nodeSelectName}\`[]DIRECT\`.*`);
        }
      }
    }
  });
  if (!processedGroups.has(fallBackName)) {
    if (groupByCountry) {
      const refs = buildCountryGroupRefs(countryGroupNames);
      if (includeAutoSelect) {
        lines.push(`custom_proxy_group=${fallBackName}\`select\`[]${nodeSelectName}\`[]${autoSelectName}\`[]${manualSwitchName}\`${refs}\`[]DIRECT`);
      } else {
        lines.push(`custom_proxy_group=${fallBackName}\`select\`[]${nodeSelectName}\`[]${manualSwitchName}\`${refs}\`[]DIRECT`);
      }
    } else {
      if (includeAutoSelect) {
        lines.push(`custom_proxy_group=${fallBackName}\`select\`[]${nodeSelectName}\`[]${autoSelectName}\`[]DIRECT\`.*`);
      } else {
        lines.push(`custom_proxy_group=${fallBackName}\`select\`[]${nodeSelectName}\`[]DIRECT\`.*`);
      }
    }
  }
  lines.push("");
  lines.push("enable_rule_generator=true");
  lines.push("overwrite_original_rules=true");
  return lines.join("\n");
}

// src/config/singboxConfig.js
var SING_BOX_CONFIG = {
  dns: {
    servers: [
      {
        type: "tcp",
        tag: "dns_proxy",
        server: "1.1.1.1",
        detour: "\u{1F680} \u8282\u70B9\u9009\u62E9",
        domain_resolver: "dns_resolver"
      },
      {
        type: "https",
        tag: "dns_direct",
        server: "dns.alidns.com",
        domain_resolver: "dns_resolver"
      },
      {
        type: "udp",
        tag: "dns_resolver",
        server: "223.5.5.5"
      },
      {
        type: "fakeip",
        tag: "dns_fakeip",
        inet4_range: "198.18.0.0/15",
        inet6_range: "fc00::/18"
      }
    ],
    rules: [
      {
        rule_set: "geolocation-!cn",
        query_type: [
          "A",
          "AAAA"
        ],
        server: "dns_fakeip"
      },
      {
        rule_set: "geolocation-!cn",
        query_type: "CNAME",
        server: "dns_proxy"
      },
      {
        query_type: [
          "A",
          "AAAA",
          "CNAME"
        ],
        invert: true,
        action: "predefined",
        rcode: "REFUSED"
      }
    ],
    final: "dns_direct"
  },
  ntp: {
    enabled: true,
    server: "time.apple.com",
    server_port: 123,
    interval: "30m"
  },
  inbounds: [
    { type: "mixed", tag: "mixed-in", listen: "0.0.0.0", listen_port: 2080 },
    { type: "tun", tag: "tun-in", address: "172.19.0.1/30", auto_route: true, strict_route: true, stack: "mixed" }
  ],
  outbounds: [
    { type: "direct", tag: "DIRECT" }
  ],
  route: {
    default_domain_resolver: "dns_resolver",
    "rule_set": [
      {
        "tag": "geosite-geolocation-!cn",
        "type": "local",
        "format": "binary",
        "path": "geosite-geolocation-!cn.srs"
      }
    ],
    rules: []
  },
  experimental: {
    cache_file: {
      enabled: true,
      store_fakeip: true
    }
  }
};
var SING_BOX_CONFIG_V1_11 = {
  dns: {
    servers: [
      {
        tag: "dns_proxy",
        address: "tls://1.1.1.1",
        detour: "\u{1F680} \u8282\u70B9\u9009\u62E9"
      },
      {
        tag: "dns_direct",
        address: "https://dns.alidns.com/dns-query",
        detour: "DIRECT",
        address_resolver: "dns_resolver"
      },
      {
        tag: "dns_resolver",
        address: "223.5.5.5",
        detour: "DIRECT"
      },
      {
        tag: "dns_fakeip",
        address: "fakeip"
      }
    ],
    rules: [
      {
        rule_set: "geolocation-!cn",
        query_type: [
          "A",
          "AAAA"
        ],
        server: "dns_fakeip"
      },
      {
        rule_set: "geolocation-!cn",
        query_type: "CNAME",
        server: "dns_proxy"
      },
      {
        query_type: [
          "A",
          "AAAA",
          "CNAME"
        ],
        invert: true,
        server: "dns_direct",
        disable_cache: true
      }
    ],
    final: "dns_direct",
    strategy: "prefer_ipv4",
    independent_cache: true,
    fakeip: {
      enabled: true,
      inet4_range: "198.18.0.0/15",
      inet6_range: "fc00::/18"
    }
  },
  ntp: {
    enabled: true,
    server: "time.apple.com",
    server_port: 123,
    interval: "30m"
  },
  inbounds: [
    { type: "mixed", tag: "mixed-in", listen: "0.0.0.0", listen_port: 2080 },
    { type: "tun", tag: "tun-in", address: "172.19.0.1/30", auto_route: true, strict_route: true, stack: "mixed" }
  ],
  outbounds: [
    { type: "direct", tag: "DIRECT" }
  ],
  route: {
    "rule_set": [],
    rules: []
  },
  experimental: {
    cache_file: {
      enabled: true,
      store_fakeip: true
    }
  }
};

// src/config/clashConfig.js
var CLASH_CONFIG = {
  "port": 7890,
  "socks-port": 7891,
  "allow-lan": false,
  "mode": "rule",
  "log-level": "info",
  "geodata-mode": true,
  "geo-auto-update": true,
  "geodata-loader": "standard",
  "geo-update-interval": 24,
  "geox-url": {
    "geoip": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
    "geosite": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
    "mmdb": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
    "asn": "https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb"
  },
  "rule-providers": {
    // 将由代码自动生成
  },
  "dns": {
    "enable": true,
    "ipv6": true,
    "respect-rules": true,
    "enhanced-mode": "fake-ip",
    "nameserver": [
      "https://120.53.53.53/dns-query",
      "https://223.5.5.5/dns-query"
    ],
    "proxy-server-nameserver": [
      "https://120.53.53.53/dns-query",
      "https://223.5.5.5/dns-query"
    ],
    "nameserver-policy": {
      "geosite:cn,private": [
        "https://120.53.53.53/dns-query",
        "https://223.5.5.5/dns-query"
      ],
      "geosite:geolocation-!cn": [
        "https://dns.cloudflare.com/dns-query",
        "https://dns.google/dns-query"
      ]
    }
  },
  "proxies": [],
  "proxy-groups": []
};

// src/config/surgeConfig.js
var SURGE_CONFIG = {
  "general": {
    "allow-wifi-access": false,
    "wifi-access-http-port": 6152,
    "wifi-access-socks5-port": 6153,
    "http-listen": "127.0.0.1:6152",
    "socks5-listen": "127.0.0.1:6153",
    "allow-hotspot-access": false,
    "skip-proxy": "127.0.0.1,192.168.0.0/16,10.0.0.0/8,172.16.0.0/12,100.64.0.0/10,17.0.0.0/8,localhost,*.local,*.crashlytics.com,seed-sequoia.siri.apple.com,sequoia.apple.com",
    "test-timeout": 5,
    "proxy-test-url": "http://cp.cloudflare.com/generate_204",
    "internet-test-url": "http://www.apple.com/library/test/success.html",
    "geoip-maxmind-url": "https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb",
    "ipv6": false,
    "show-error-page-for-reject": true,
    "dns-server": "119.29.29.29, 180.184.1.1, 223.5.5.5, system",
    "encrypted-dns-server": "https://223.5.5.5/dns-query",
    "exclude-simple-hostnames": true,
    "read-etc-hosts": true,
    "always-real-ip": "*.msftconnecttest.com, *.msftncsi.com, *.srv.nintendo.net, *.stun.playstation.net, xbox.*.microsoft.com, *.xboxlive.com, *.logon.battlenet.com.cn, *.logon.battle.net, stun.l.google.com, easy-login.10099.com.cn,*-update.xoyocdn.com, *.prod.cloud.netflix.com, appboot.netflix.com, *-appboot.netflix.com",
    "hijack-dns": "*:53",
    "udp-policy-not-supported-behaviour": "REJECT",
    "hide-vpn-icon": false
  },
  "replica": {
    "hide-apple-request": true,
    "hide-crashlytics-request": true,
    "use-keyword-filter": false,
    "hide-udp": false
  }
};

// src/components/TextareaWithActions.jsx
var TextareaWithActions = (props) => {
  const {
    id,
    name,
    label,
    labelPrefix = null,
    placeholder,
    required = false,
    rows,
    model,
    variant = "default",
    containerClass = "",
    textareaClass = "",
    labelWrapperClass = "flex items-center justify-between mb-2",
    labelActions = [],
    labelActionsWrapperClass = "flex gap-2",
    inlineActions = [],
    inlineActionsWrapperClass = "flex gap-2 absolute bottom-4 right-4",
    textareaAttrs = {},
    preserveLabelSpace = true,
    children
  } = props;
  const textareaBindings = { ...textareaAttrs };
  if (model && !textareaBindings["x-model"]) {
    textareaBindings["x-model"] = model;
  }
  if (required) {
    textareaBindings.required = true;
  }
  if (rows) {
    textareaBindings.rows = rows;
  }
  const classNames = [
    "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-y placeholder-gray-400 dark:placeholder-gray-500",
    variant === "mono" ? "font-mono text-sm bg-gray-50 dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-900",
    textareaClass
  ].filter(Boolean).join(" ");
  const renderActions = (actionsArray) => actionsArray?.length ? actionsArray.map((action, index) => {
    const {
      key,
      type: type2 = "button",
      icon,
      label: actionLabel,
      hideLabelOnMobile = false,
      className: actionClass = "",
      title: title2,
      attrs = {}
    } = action;
    return /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: type2,
        title: title2 || actionLabel,
        class: actionClass,
        ...attrs,
        children: [
          icon && /* @__PURE__ */ jsxDEV("i", { class: icon }),
          actionLabel && /* @__PURE__ */ jsxDEV("span", { class: hideLabelOnMobile ? "hidden sm:inline" : "", children: actionLabel })
        ]
      },
      key || `${actionLabel || "action"}-${index}`
    );
  }) : null;
  const hasLabelContent = Boolean(label || labelPrefix);
  const hasLabelSection = Boolean(hasLabelContent || (labelActions?.length ?? 0) > 0);
  const shouldRenderPlaceholder = !hasLabelContent && preserveLabelSpace && (labelActions?.length ?? 0) > 0;
  return /* @__PURE__ */ jsxDEV("div", { class: `space-y-2 ${containerClass}`.trim(), children: [
    hasLabelSection && /* @__PURE__ */ jsxDEV("div", { class: labelWrapperClass, children: [
      hasLabelContent ? /* @__PURE__ */ jsxDEV(
        "label",
        {
          for: id,
          class: "block text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2",
          children: [
            labelPrefix,
            label
          ]
        }
      ) : shouldRenderPlaceholder ? /* @__PURE__ */ jsxDEV("span", {}) : null,
      labelActions?.length ? /* @__PURE__ */ jsxDEV("div", { class: labelActionsWrapperClass, children: renderActions(labelActions) }) : null
    ] }),
    /* @__PURE__ */ jsxDEV("div", { class: "relative", children: [
      /* @__PURE__ */ jsxDEV("textarea", { id, name, placeholder, class: classNames, ...textareaBindings }),
      inlineActions?.length ? /* @__PURE__ */ jsxDEV("div", { class: inlineActionsWrapperClass, children: renderActions(inlineActions) }) : null
    ] }),
    children
  ] });
};

// src/components/ValidatedTextarea.jsx
var DEFAULT_ACTION_CLASS = "px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded transition-colors flex items-center gap-1";
var DEFAULT_VALIDATE_CLASS = "px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1";
var createAction = (action = {}, defaults = {}) => {
  const final = {
    key: action.key,
    icon: action.icon,
    label: action.label,
    hideLabelOnMobile: action.hideLabelOnMobile,
    className: action.className || defaults.className,
    title: action.title || action.label,
    attrs: action.attrs || defaults.attrs || {}
  };
  return final;
};
var renderValidationMessage = (config, fallbackClass, defaultIcon) => {
  if (!config) return null;
  const attrs = {};
  if (config.show) {
    attrs["x-show"] = config.show;
  }
  return /* @__PURE__ */ jsxDEV("div", { class: config.className || fallbackClass, ...attrs, children: [
    /* @__PURE__ */ jsxDEV("i", { class: config.icon || defaultIcon }),
    config.text ? /* @__PURE__ */ jsxDEV("span", { children: config.text }) : config.textExpr ? /* @__PURE__ */ jsxDEV("span", { "x-text": config.textExpr }) : null
  ] });
};
var ValidatedTextarea = (props) => {
  const {
    model,
    paste = true,
    clear = true,
    pasteLabel = "Paste",
    clearLabel = "Clear",
    pasteTitle = pasteLabel,
    clearTitle = clearLabel,
    labelActions = [],
    inlineActions = [],
    validation = {},
    children,
    ...rest
  } = props;
  const computedLabelActions = [...labelActions];
  if (paste && model) {
    const pasteConfig = typeof paste === "object" ? paste : {};
    computedLabelActions.push(
      createAction(
        {
          key: pasteConfig.key || `paste-${model}`,
          icon: pasteConfig.icon || "fas fa-paste",
          label: pasteConfig.label || pasteLabel,
          hideLabelOnMobile: pasteConfig.hideLabelOnMobile !== false,
          className: pasteConfig.className || `${DEFAULT_ACTION_CLASS} hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400`,
          title: pasteConfig.title || pasteTitle,
          attrs: pasteConfig.attrs || {
            "x-on:click": `navigator.clipboard.readText().then(text => ${model} = text).catch(() => {})`
          }
        },
        {}
      )
    );
  }
  if (clear && model) {
    const clearConfig = typeof clear === "object" ? clear : {};
    computedLabelActions.push(
      createAction(
        {
          key: clearConfig.key || `clear-${model}`,
          icon: clearConfig.icon || "fas fa-times",
          label: clearConfig.label || clearLabel,
          hideLabelOnMobile: clearConfig.hideLabelOnMobile !== false,
          className: clearConfig.className || `${DEFAULT_ACTION_CLASS} hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400`,
          title: clearConfig.title || clearTitle,
          attrs: clearConfig.attrs || {
            "x-on:click": `${model} = ''`,
            "x-show": model
          }
        },
        {}
      )
    );
  }
  const computedInlineActions = [...inlineActions];
  if (validation?.button) {
    computedInlineActions.push(
      createAction(validation.button, {
        className: DEFAULT_VALIDATE_CLASS,
        attrs: {}
      })
    );
  }
  return /* @__PURE__ */ jsxDEV(
    TextareaWithActions,
    {
      ...rest,
      model,
      labelActions: computedLabelActions,
      inlineActions: computedInlineActions,
      children: [
        children,
        renderValidationMessage(
          validation?.error,
          "mt-2 text-red-500 text-sm flex items-center gap-1",
          "fas fa-exclamation-circle"
        ),
        renderValidationMessage(
          validation?.success,
          "mt-2 text-green-500 text-sm flex items-center gap-1",
          "fas fa-check-circle"
        )
      ]
    }
  );
};

// src/components/CustomRules.jsx
var CustomRules = (props) => {
  const { t } = props;
  return /* @__PURE__ */ jsxDEV("div", { "x-data": "customRulesData()", class: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: [
    /* @__PURE__ */ jsxDEV("div", { class: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxDEV("h3", { class: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [
      /* @__PURE__ */ jsxDEV("i", { class: "fas fa-stream text-gray-400" }),
      t("customRulesSection")
    ] }) }),
    /* @__PURE__ */ jsxDEV("div", { class: "flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 gap-4", children: [
      /* @__PURE__ */ jsxDEV("p", { class: "text-sm text-gray-500 dark:text-gray-400", children: t("customRulesSectionTooltip") }),
      /* @__PURE__ */ jsxDEV("div", { class: "flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            "x-on:click": "mode = 'form'",
            "x-bind:class": "{'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm': mode === 'form', 'text-gray-500 dark:text-gray-400': mode !== 'form'}",
            class: "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxDEV("i", { class: "fas fa-list" }),
              t("customRulesForm")
            ]
          }
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            "x-on:click": "mode = 'json'",
            "x-bind:class": "{'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm': mode === 'json', 'text-gray-500 dark:text-gray-400': mode !== 'json'}",
            class: "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxDEV("i", { class: "fas fa-code" }),
              t("customRulesJSON")
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxDEV("div", { "x-show": "mode === 'form'", ...{ "x-transition:enter": "transition ease-out duration-300", "x-transition:enter-start": "opacity-0 transform scale-95", "x-transition:enter-end": "opacity-100 transform scale-100" }, children: [
      /* @__PURE__ */ jsxDEV("template", { "x-if": "rules.length === 0", children: /* @__PURE__ */ jsxDEV("div", { class: "text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400", children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-plus text-2xl" }) }),
        /* @__PURE__ */ jsxDEV("p", { class: "text-gray-500 dark:text-gray-400 mb-4", children: t("noCustomRulesForm") }),
        /* @__PURE__ */ jsxDEV("button", { type: "button", "x-on:click": "addRule()", class: "px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium", children: t("addCustomRule") })
      ] }) }),
      /* @__PURE__ */ jsxDEV("div", { class: "space-y-4", children: /* @__PURE__ */ jsxDEV("template", { "x-for": "(rule, index) in rules", "x-bind:key": "index", children: /* @__PURE__ */ jsxDEV(
        "div",
        {
          "x-data": "{ show: false }",
          "x-init": "$nextTick(() => show = true)",
          "x-show": "show",
          class: "bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-primary-200 dark:hover:border-primary-900/50",
          ...{
            "x-transition:enter": "transition ease-out duration-300",
            "x-transition:enter-start": "opacity-0 -translate-y-2 scale-95",
            "x-transition:enter-end": "opacity-100 translate-y-0 scale-100",
            "x-transition:leave": "transition ease-in duration-200",
            "x-transition:leave-start": "opacity-100 translate-y-0 scale-100",
            "x-transition:leave-end": "opacity-0 translate-y-2 scale-95",
            "x-on:custom-rules-clear.window": "show = false"
          },
          children: [
            /* @__PURE__ */ jsxDEV("div", { class: "flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700", children: [
              /* @__PURE__ */ jsxDEV("h3", { class: "font-medium text-gray-900 dark:text-white flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDEV("span", { class: "w-6 h-6 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs", "x-text": "index + 1" }),
                t("customRule")
              ] }),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  "x-on:click": "show = false; setTimeout(() => removeRule(index), 200)",
                  class: "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20",
                  children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-trash-alt" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxDEV("div", { class: "col-span-1 md:col-span-2", children: [
                /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("customRuleOutboundName") }),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    "x-model": "rule.name",
                    class: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    placeholder: "e.g., MyRule"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("customRuleDomainSuffix") }),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    "x-model": "rule.domain_suffix",
                    class: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    placeholder: t("customRuleDomainSuffixPlaceholder")
                  }
                )
              ] }),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("customRuleDomainKeyword") }),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    "x-model": "rule.domain_keyword",
                    class: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    placeholder: t("customRuleDomainKeywordPlaceholder")
                  }
                )
              ] }),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1", children: [
                  t("customRuleSrcIPCIDR"),
                  /* @__PURE__ */ jsxDEV("i", { class: "fas fa-info-circle text-gray-400 hover:text-primary-500 cursor-help", title: t("customRuleSrcIPCIDRTooltip") })
                ] }),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    "x-model": "rule.src_ip_cidr",
                    class: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    placeholder: t("customRuleSrcIPCIDRPlaceholder")
                  }
                )
              ] }),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("customRuleIPCIDR") }),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    "x-model": "rule.ip_cidr",
                    class: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    placeholder: t("customRuleIPCIDRPlaceholder")
                  }
                )
              ] }),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1", children: [
                  t("customRuleProtocol"),
                  /* @__PURE__ */ jsxDEV("i", { class: "fas fa-info-circle text-gray-400 hover:text-primary-500 cursor-help", title: t("customRuleProtocolTooltip") })
                ] }),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    "x-model": "rule.protocol",
                    class: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    placeholder: t("customRuleProtocolPlaceholder")
                  }
                )
              ] }),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1", children: [
                  t("customRuleGeoSite"),
                  /* @__PURE__ */ jsxDEV("i", { class: "fas fa-info-circle text-gray-400 hover:text-primary-500 cursor-help", title: t("customRuleGeoSiteTooltip") })
                ] }),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    "x-model": "rule.site",
                    class: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    placeholder: t("customRuleGeoSitePlaceholder")
                  }
                )
              ] }),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1", children: [
                  t("customRuleGeoIP"),
                  /* @__PURE__ */ jsxDEV("i", { class: "fas fa-info-circle text-gray-400 hover:text-primary-500 cursor-help", title: t("customRuleGeoIPTooltip") })
                ] }),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    "x-model": "rule.ip",
                    class: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    placeholder: t("customRuleGeoIPPlaceholder")
                  }
                )
              ] })
            ] })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsxDEV("div", { class: "mt-6 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxDEV("button", { type: "button", "x-on:click": "addRule()", class: "px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors duration-200 font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV("i", { class: "fas fa-plus" }),
          t("addCustomRule")
        ] }),
        /* @__PURE__ */ jsxDEV("button", { type: "button", "x-on:click": "clearAll()", "x-show": "rules.length > 0", class: "px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV("i", { class: "fas fa-trash" }),
          t("clearAll")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxDEV("div", { "x-show": "mode === 'json'", ...{ "x-transition:enter": "transition ease-out duration-300", "x-transition:enter-start": "opacity-0 transform scale-95", "x-transition:enter-end": "opacity-100 transform scale-100" }, children: /* @__PURE__ */ jsxDEV(
      ValidatedTextarea,
      {
        id: "customRulesJson",
        name: "customRulesJson",
        model: "jsonContent",
        placeholder: '[{"name": "MyRule", "src_ip_cidr": "192.168.1.13/32", "domain_suffix": "example.com", "outbound": "Proxy"}]',
        variant: "mono",
        textareaClass: "min-h-[16rem]",
        containerClass: "group",
        labelWrapperClass: "flex items-center justify-end mb-2",
        labelActionsWrapperClass: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        inlineActionsWrapperClass: "absolute bottom-4 right-4 flex gap-2",
        preserveLabelSpace: false,
        pasteLabel: t("paste"),
        clearLabel: t("clear"),
        validation: {
          button: {
            key: "validate-json",
            label: t("validateJSON"),
            attrs: { "x-on:click": "validateJson()" }
          },
          error: {
            show: "jsonError",
            textExpr: "jsonError"
          },
          success: {
            show: "jsonValid",
            text: t("allJSONValid")
          }
        }
      }
    ) }),
    /* @__PURE__ */ jsxDEV("input", { type: "hidden", name: "customRules", "x-bind:value": "JSON.stringify(rules)" }),
    /* @__PURE__ */ jsxDEV("script", { dangerouslySetInnerHTML: {
      __html: `
        function customRulesData() {
          return {
            mode: 'form',
            rules: [],
            jsonContent: '[]',
            jsonError: null,
            jsonValid: false,
            
            init() {
              // Watch for changes in rules to update JSON content
              this.$watch('rules', (value) => {
                if (this.mode === 'form') {
                  this.jsonContent = JSON.stringify(value, null, 2);
                }
              });

              // Watch for changes in JSON content to update rules
              this.$watch('jsonContent', (value) => {
                if (this.mode === 'json') {
                  try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) {
                      this.rules = parsed;
                      this.jsonError = null;
                      this.jsonValid = true;
                      setTimeout(() => this.jsonValid = false, 3000);
                    } else {
                      this.jsonError = '${t("mustBeArray")}';
                    }
                  } catch (e) {
                    this.jsonError = e.message;
                  }
                }
              });

              // Listen for custom event to restore rules from URL parsing
              window.addEventListener('restore-custom-rules', (event) => {
                if (event.detail && Array.isArray(event.detail.rules)) {
                  this.rules = event.detail.rules;
                  this.jsonContent = JSON.stringify(event.detail.rules, null, 2);
                  this.mode = 'json'; // Switch to JSON mode to show imported rules
                }
              });
            },
            
            addRule() {
              this.rules.push({
                name: '',
                domain_suffix: '',
                domain_keyword: '',
                src_ip_cidr: '',
                ip_cidr: '',
                protocol: '',
                site: '',
                ip: '',
                outbound: '' // Will be set to name by default in backend or needs explicit field? 
                             // In original logic, outbound name IS the rule name for custom rules.
              });
            },
            
            removeRule(index) {
              this.rules.splice(index, 1);
            },
            
            clearAll() {
              if (!confirm('${t("confirmClearAllRules")}')) {
                return;
              }
              
              this.$dispatch('custom-rules-clear');
              setTimeout(() => {
                this.rules = [];
                this.jsonContent = '[]';
              }, 200);
            },
            
            validateJson() {
              try {
                const parsed = JSON.parse(this.jsonContent);
                if (Array.isArray(parsed)) {
                  this.rules = parsed;
                  this.jsonError = null;
                  this.jsonValid = true;
                  setTimeout(() => this.jsonValid = false, 3000);
                } else {
                  this.jsonError = '${t("mustBeArray")}';
                }
              } catch (e) {
                this.jsonError = e.message;
              }
            }
          }
        }
      `
    } })
  ] });
};

// src/components/formLogic.js
var formLogicFn = (t) => {
  window.formData = function() {
    const parseSurgeValue2 = (rawValue = "") => {
      const trimmed = rawValue.trim();
      if (trimmed === "") return "";
      const unquoted = trimmed.replace(/^"(.*)"$/, "$1");
      const lower = unquoted.toLowerCase();
      if (lower === "true") return true;
      if (lower === "false") return false;
      if (/^-?\d+(\.\d+)?$/.test(unquoted)) return Number(unquoted);
      return unquoted;
    };
    const convertSurgeIniToJson2 = (content) => {
      const lines = content.split(/\r?\n/);
      const config = {};
      let currentSection = null;
      const ensureObject = (key) => {
        if (!config[key]) config[key] = {};
        return config[key];
      };
      const ensureArray = (key) => {
        if (!config[key]) config[key] = [];
        return config[key];
      };
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith(";") || line.startsWith("#")) continue;
        const sectionMatch = line.match(/^\[(.+)]$/);
        if (sectionMatch) {
          currentSection = sectionMatch[1].trim();
          continue;
        }
        if (!currentSection) continue;
        const sectionName = currentSection.toLowerCase();
        if (sectionName === "general" || sectionName === "replica") {
          const equalsIndex = line.indexOf("=");
          if (equalsIndex === -1) continue;
          const key = line.slice(0, equalsIndex).trim();
          const value = line.slice(equalsIndex + 1).trim();
          if (!key) continue;
          const target = ensureObject(sectionName);
          target[key] = parseSurgeValue2(value);
        } else if (sectionName === "proxy") {
          ensureArray("proxies").push(line);
        } else if (sectionName === "proxy group") {
          ensureArray("proxy-groups").push(line);
        } else if (sectionName === "rule") {
          ensureArray("rules").push(line);
        } else {
          ensureArray(sectionName).push(line);
        }
      }
      if (!config.general && !config.replica && !config.proxies && !config["proxy-groups"]) {
        throw new Error("Unable to parse Surge INI content");
      }
      return config;
    };
    const parseSurgeConfigInput = (content) => {
      const trimmed = content.trim();
      if (!trimmed) throw new Error("Config content is empty");
      try {
        return { configObject: JSON.parse(trimmed), convertedFromIni: false };
      } catch {
        const converted = convertSurgeIniToJson2(content);
        return { configObject: converted, convertedFromIni: true };
      }
    };
    return {
      input: "",
      showAdvanced: false,
      // Accordion states for each section (二级手风琴状态)
      accordionSections: {
        rules: true,
        // 规则选择 - 默认展开
        customRules: false,
        // 自定义规则
        general: false,
        // 通用设置
        baseConfig: false,
        // 基础配置
        ua: false
        // User Agent
      },
      selectedRules: [],
      selectedPredefinedRule: "balanced",
      subconverterCopied: false,
      groupByCountry: false,
      includeAutoSelect: true,
      enableClashUI: false,
      externalController: "",
      externalUiDownloadUrl: "",
      configType: "singbox",
      configEditor: "",
      savingConfig: false,
      currentConfigId: "",
      saveConfigText: "",
      savingConfigText: "",
      configContentRequiredText: "",
      configSaveFailedText: "",
      configValidationState: "",
      configValidationMessage: "",
      customUA: "",
      loading: false,
      generatedLinks: null,
      shortenedLinks: null,
      shortening: false,
      customShortCode: "",
      parsingUrl: false,
      parseDebounceTimer: null,
      // These will be populated from window.APP_TRANSLATIONS
      processingText: "",
      convertText: "",
      shortenLinksText: "",
      shorteningText: "",
      showFullLinksText: "",
      init() {
        if (window.APP_TRANSLATIONS) {
          this.processingText = window.APP_TRANSLATIONS.processing;
          this.convertText = window.APP_TRANSLATIONS.convert;
          this.shortenLinksText = window.APP_TRANSLATIONS.shortenLinks;
          this.shorteningText = window.APP_TRANSLATIONS.shortening;
          this.showFullLinksText = window.APP_TRANSLATIONS.showFullLinks;
          this.saveConfigText = window.APP_TRANSLATIONS.saveConfig;
          this.savingConfigText = window.APP_TRANSLATIONS.savingConfig;
          this.configContentRequiredText = window.APP_TRANSLATIONS.configContentRequired;
          this.configSaveFailedText = window.APP_TRANSLATIONS.configSaveFailed;
        }
        this.input = localStorage.getItem("inputTextarea") || "";
        this.showAdvanced = localStorage.getItem("advancedToggle") === "true";
        this.groupByCountry = localStorage.getItem("groupByCountry") === "true";
        this.includeAutoSelect = localStorage.getItem("includeAutoSelect") !== "false";
        this.enableClashUI = localStorage.getItem("enableClashUI") === "true";
        this.externalController = localStorage.getItem("externalController") || "";
        this.externalUiDownloadUrl = localStorage.getItem("externalUiDownloadUrl") || "";
        this.customUA = localStorage.getItem("userAgent") || "";
        this.configEditor = localStorage.getItem("configEditor") || "";
        this.configType = localStorage.getItem("configType") || "singbox";
        this.customShortCode = localStorage.getItem("customShortCode") || "";
        const initialUrlParams = new URLSearchParams(window.location.search);
        this.currentConfigId = initialUrlParams.get("configId") || "";
        const savedAccordion = localStorage.getItem("accordionSections");
        if (savedAccordion) {
          try {
            this.accordionSections = JSON.parse(savedAccordion);
          } catch (e) {
          }
        }
        this.applyPredefinedRule();
        this.$watch("input", (val) => {
          localStorage.setItem("inputTextarea", val);
          this.handleInputChange(val);
        });
        this.$watch("showAdvanced", (val) => localStorage.setItem("advancedToggle", val));
        this.$watch("groupByCountry", (val) => localStorage.setItem("groupByCountry", val));
        this.$watch("includeAutoSelect", (val) => localStorage.setItem("includeAutoSelect", val));
        this.$watch("enableClashUI", (val) => localStorage.setItem("enableClashUI", val));
        this.$watch("externalController", (val) => localStorage.setItem("externalController", val));
        this.$watch("externalUiDownloadUrl", (val) => localStorage.setItem("externalUiDownloadUrl", val));
        this.$watch("customUA", (val) => localStorage.setItem("userAgent", val));
        this.$watch("configEditor", (val) => {
          localStorage.setItem("configEditor", val);
          this.resetConfigValidation();
        });
        this.$watch("configType", (val) => {
          localStorage.setItem("configType", val);
          this.resetConfigValidation();
        });
        this.$watch("customShortCode", (val) => localStorage.setItem("customShortCode", val));
        this.$watch("accordionSections", (val) => localStorage.setItem("accordionSections", JSON.stringify(val)), { deep: true });
      },
      toggleAccordion(section) {
        this.accordionSections[section] = !this.accordionSections[section];
      },
      applyPredefinedRule() {
        if (this.selectedPredefinedRule === "custom") return;
        const rules = window.PREDEFINED_RULE_SETS;
        if (rules && rules[this.selectedPredefinedRule]) {
          this.selectedRules = rules[this.selectedPredefinedRule];
        }
      },
      getSubconverterUrl() {
        const origin = window.location.origin;
        const params = new URLSearchParams();
        if (this.selectedPredefinedRule && this.selectedPredefinedRule !== "custom") {
          params.append("selectedRules", this.selectedPredefinedRule);
        } else if (this.selectedPredefinedRule === "custom") {
          params.append("selectedRules", JSON.stringify(this.selectedRules));
        }
        try {
          const customRulesInput = document.querySelector('input[name="customRules"]');
          const customRules = customRulesInput && customRulesInput.value ? JSON.parse(customRulesInput.value) : [];
          if (Array.isArray(customRules) && customRules.length > 0) {
            params.append("customRules", JSON.stringify(customRules));
          }
        } catch {
        }
        if (!this.includeAutoSelect) {
          params.append("include_auto_select", "false");
        }
        if (this.groupByCountry) {
          params.append("group_by_country", "true");
        }
        const appLang = window.APP_LANG || "zh-CN";
        if (appLang !== "zh-CN") {
          params.append("lang", appLang);
        }
        const queryString = params.toString();
        return origin + "/subconverter" + (queryString ? "?" + queryString : "");
      },
      copySubconverterUrl() {
        const url = this.getSubconverterUrl();
        navigator.clipboard.writeText(url).then(() => {
          this.subconverterCopied = true;
          setTimeout(() => this.subconverterCopied = false, 2e3);
        }).catch(() => {
        });
      },
      resetConfigValidation() {
        this.configValidationState = "";
        this.configValidationMessage = "";
      },
      async saveBaseConfig() {
        const content = (this.configEditor || "").trim();
        if (!content) {
          alert(this.configContentRequiredText || window.APP_TRANSLATIONS.configContentRequired);
          return;
        }
        let payloadContent = this.configEditor;
        if (this.configType === "surge") {
          try {
            const { configObject } = parseSurgeConfigInput(this.configEditor);
            payloadContent = JSON.stringify(configObject);
          } catch (parseError) {
            const prefix = window.APP_TRANSLATIONS.configValidationError || "Config validation error:";
            alert(`${prefix} ${parseError?.message || ""}`.trim());
            return;
          }
        }
        this.savingConfig = true;
        try {
          const response = await fetch("/config", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              type: this.configType,
              content: payloadContent
            })
          });
          const responseText = await response.text();
          if (!response.ok) {
            throw new Error(responseText || response.statusText || "Request failed");
          }
          const configId = responseText.trim();
          if (!configId) {
            throw new Error("Missing config ID");
          }
          this.currentConfigId = configId;
          this.updateConfigIdInUrl(configId);
          const successMessage = window.APP_TRANSLATIONS.saveConfigSuccess || "Configuration saved successfully!";
          alert(`${successMessage}
ID: ${configId}`);
        } catch (error) {
          console.error("Failed to save base config:", error);
          const errorPrefix = this.configSaveFailedText || window.APP_TRANSLATIONS.configSaveFailed || "Failed to save configuration";
          alert(`${errorPrefix}: ${error?.message || "Unknown error"}`);
        } finally {
          this.savingConfig = false;
        }
      },
      validateBaseConfig() {
        const content = (this.configEditor || "").trim();
        if (!content) {
          this.configValidationState = "error";
          this.configValidationMessage = this.configContentRequiredText || window.APP_TRANSLATIONS.configContentRequired;
          return;
        }
        try {
          if (this.configType === "clash") {
            if (!window.jsyaml || !window.jsyaml.load) {
              throw new Error(window.APP_TRANSLATIONS.parserUnavailable || "Parser unavailable. Please refresh and try again.");
            }
            window.jsyaml.load(content);
            this.configValidationState = "success";
            this.configValidationMessage = window.APP_TRANSLATIONS.validYamlConfig || "YAML config is valid";
          } else if (this.configType === "surge") {
            parseSurgeConfigInput(this.configEditor);
            this.configValidationState = "success";
            this.configValidationMessage = window.APP_TRANSLATIONS.validJsonConfig || "JSON config is valid";
          } else {
            JSON.parse(content);
            this.configValidationState = "success";
            this.configValidationMessage = window.APP_TRANSLATIONS.validJsonConfig || "JSON config is valid";
          }
        } catch (error) {
          this.configValidationState = "error";
          const prefix = window.APP_TRANSLATIONS.configValidationError || "Config validation error: ";
          this.configValidationMessage = `${prefix}${error?.message || ""}`;
        }
      },
      clearBaseConfig() {
        if (confirm(window.APP_TRANSLATIONS.confirmClearConfig)) {
          this.configEditor = "";
          localStorage.removeItem("configEditor");
          this.currentConfigId = "";
          this.updateConfigIdInUrl(null);
        }
      },
      clearAll() {
        if (confirm(window.APP_TRANSLATIONS.confirmClearAll)) {
          this.input = "";
          this.generatedLinks = null;
          this.shortenedLinks = null;
          this.customShortCode = "";
          localStorage.removeItem("customShortCode");
        }
      },
      updateConfigIdInUrl(configId) {
        const url = new URL(window.location.href);
        if (configId) {
          url.searchParams.set("configId", configId);
        } else {
          url.searchParams.delete("configId");
        }
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      },
      async submitForm() {
        this.loading = true;
        this.shortenedLinks = null;
        try {
          const customRulesInput = document.querySelector('input[name="customRules"]');
          const customRules = customRulesInput && customRulesInput.value ? JSON.parse(customRulesInput.value) : [];
          const origin = window.location.origin;
          const params = new URLSearchParams();
          params.append("config", this.input);
          params.append("ua", this.customUA);
          params.append("selectedRules", JSON.stringify(this.selectedRules));
          params.append("customRules", JSON.stringify(customRules));
          if (this.groupByCountry) params.append("group_by_country", "true");
          if (!this.includeAutoSelect) params.append("include_auto_select", "false");
          if (this.enableClashUI) params.append("enable_clash_ui", "true");
          if (this.externalController) params.append("external_controller", this.externalController);
          if (this.externalUiDownloadUrl) params.append("external_ui_download_url", this.externalUiDownloadUrl);
          const urlParams = new URLSearchParams(window.location.search);
          const configId = this.currentConfigId || urlParams.get("configId");
          if (configId) {
            params.append("configId", configId);
          }
          const queryString = params.toString();
          this.generatedLinks = {
            xray: origin + "/xray?" + queryString,
            singbox: origin + "/singbox?" + queryString,
            clash: origin + "/clash?" + queryString,
            surge: origin + "/surge?" + queryString
          };
          setTimeout(() => {
            const resultsDiv = document.querySelector(".mt-12");
            if (resultsDiv) {
              resultsDiv.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
        } catch (error) {
          console.error("Error generating links:", error);
          alert(window.APP_TRANSLATIONS.errorGeneratingLinks);
        } finally {
          this.loading = false;
        }
      },
      async shortenLinks() {
        if (this.shortenedLinks) {
          alert(window.APP_TRANSLATIONS.alreadyShortened);
          return;
        }
        if (!this.generatedLinks) {
          return;
        }
        this.shortening = true;
        try {
          const origin = window.location.origin;
          const shortened = {};
          let shortCode = this.customShortCode.trim();
          let isFirstRequest = true;
          for (const [type2, url] of Object.entries(this.generatedLinks)) {
            try {
              let apiUrl = `${origin}/shorten-v2?url=${encodeURIComponent(url)}`;
              if (shortCode) {
                apiUrl += `&shortCode=${encodeURIComponent(shortCode)}`;
              }
              const response = await fetch(apiUrl);
              if (!response.ok) {
                throw new Error(`Failed to shorten ${type2} link`);
              }
              const returnedCode = await response.text();
              if (isFirstRequest && !shortCode) {
                shortCode = returnedCode;
              }
              isFirstRequest = false;
              const prefixMap = {
                xray: "x",
                singbox: "b",
                clash: "c",
                surge: "s"
              };
              shortened[type2] = `${origin}/${prefixMap[type2]}/${returnedCode}`;
            } catch (error) {
              console.error(`Error shortening ${type2} link:`, error);
              throw error;
            }
          }
          this.shortenedLinks = shortened;
        } catch (error) {
          console.error("Error shortening links:", error);
          alert(window.APP_TRANSLATIONS.shortenFailed);
        } finally {
          this.shortening = false;
        }
      },
      // Handle input change with debounce
      handleInputChange(val) {
        if (this.parseDebounceTimer) {
          clearTimeout(this.parseDebounceTimer);
        }
        if (!val || !val.trim()) {
          return;
        }
        this.parseDebounceTimer = setTimeout(() => {
          this.tryParseSubscriptionUrl(val.trim());
        }, 500);
      },
      // Check if input looks like a subscription URL
      isSubscriptionUrl(text) {
        if (text.includes("\n")) {
          return false;
        }
        try {
          const url = new URL(text);
          const pathMatch = url.pathname.match(/^\/([bcxs])\/([a-zA-Z0-9_-]+)$/);
          if (pathMatch) {
            return true;
          }
          const fullMatch = url.pathname.match(/^\/(singbox|clash|xray|surge)$/);
          if (fullMatch && url.search) {
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      // Try to parse subscription URL
      async tryParseSubscriptionUrl(text) {
        if (!this.isSubscriptionUrl(text)) {
          return;
        }
        this.parsingUrl = true;
        try {
          let urlToParse;
          try {
            urlToParse = new URL(text);
          } catch {
            return;
          }
          const shortMatch = urlToParse.pathname.match(/^\/([bcxs])\/([a-zA-Z0-9_-]+)$/);
          if (shortMatch) {
            const response = await fetch(`/resolve?url=${encodeURIComponent(text)}`);
            if (!response.ok) {
              console.warn("Failed to resolve short URL");
              return;
            }
            const data = await response.json();
            if (!data.originalUrl) {
              console.warn("No original URL returned");
              return;
            }
            urlToParse = new URL(data.originalUrl);
          }
          this.populateFormFromUrl(urlToParse);
          const message = window.APP_TRANSLATIONS?.urlParsedSuccess || "\u5DF2\u6210\u529F\u89E3\u6790\u8BA2\u9605\u94FE\u63A5\u914D\u7F6E";
          console.log(message);
        } catch (error) {
          console.error("Error parsing subscription URL:", error);
        } finally {
          this.parsingUrl = false;
        }
      },
      // Populate form fields from parsed URL
      populateFormFromUrl(url) {
        const params = new URLSearchParams(url.search);
        const config = params.get("config");
        if (config) {
          this.input = config;
        }
        const selectedRules = params.get("selectedRules");
        if (selectedRules) {
          try {
            const parsed = JSON.parse(selectedRules);
            if (Array.isArray(parsed)) {
              this.selectedRules = parsed;
              this.selectedPredefinedRule = "custom";
            }
          } catch (e) {
            console.warn("Failed to parse selectedRules:", e);
          }
        }
        const customRules = params.get("customRules");
        if (customRules) {
          try {
            const parsed = JSON.parse(customRules);
            if (Array.isArray(parsed) && parsed.length > 0) {
              window.dispatchEvent(new CustomEvent("restore-custom-rules", {
                detail: { rules: parsed }
              }));
            }
          } catch (e) {
            console.warn("Failed to parse customRules:", e);
          }
        }
        this.groupByCountry = params.get("group_by_country") === "true";
        this.includeAutoSelect = params.get("include_auto_select") !== "false";
        this.enableClashUI = params.get("enable_clash_ui") === "true";
        const externalController = params.get("external_controller");
        if (externalController) {
          this.externalController = externalController;
        }
        const externalUiDownloadUrl = params.get("external_ui_download_url");
        if (externalUiDownloadUrl) {
          this.externalUiDownloadUrl = externalUiDownloadUrl;
        }
        const ua = params.get("ua");
        if (ua) {
          this.customUA = ua;
        }
        const configId = params.get("configId");
        if (configId) {
          this.currentConfigId = configId;
          this.updateConfigIdInUrl(configId);
        }
        if (selectedRules || customRules || this.groupByCountry || this.enableClashUI || externalController || externalUiDownloadUrl || ua || configId) {
          this.showAdvanced = true;
        }
      }
    };
  };
};

// src/components/Form.jsx
var LINK_FIELDS = [
  { key: "xray", labelKey: "xrayLink" },
  { key: "singbox", labelKey: "singboxLink" },
  { key: "clash", labelKey: "clashLink" },
  { key: "surge", labelKey: "surgeLink" }
];
var Form = (props) => {
  const { t, lang } = props;
  const translations2 = {
    processing: t("processing"),
    convert: t("convert"),
    saveConfigSuccess: t("saveConfigSuccess"),
    saveConfig: t("saveConfig"),
    savingConfig: t("savingConfig"),
    configContentRequired: t("configContentRequired"),
    configSaveFailed: t("configSaveFailed"),
    confirmClearConfig: t("confirmClearConfig"),
    confirmClearAll: t("confirmClearAll"),
    errorGeneratingLinks: t("errorGeneratingLinks"),
    shortenLinks: t("shortenLinks"),
    shortening: t("shortening"),
    alreadyShortened: t("alreadyShortened"),
    shortenFailed: t("shortenFailed"),
    customShortCode: t("customShortCode"),
    optional: t("optional"),
    customShortCodePlaceholder: t("customShortCodePlaceholder"),
    showFullLinks: t("showFullLinks")
  };
  const scriptContent = `
    window.APP_TRANSLATIONS = ${JSON.stringify(translations2)};
    window.PREDEFINED_RULE_SETS = ${JSON.stringify(PREDEFINED_RULE_SETS)};
    window.APP_LANG = ${JSON.stringify(lang || "zh-CN")};
    if (typeof __name === 'undefined') { var __name = function(fn) { return fn; }; }
    (${formLogicFn.toString()})();
  `;
  return /* @__PURE__ */ jsxDEV("div", { "x-data": "formData()", "x-init": "init()", class: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxDEV("form", { ...{ "x-on:submit.prevent": "submitForm" }, class: "space-y-8", children: [
      /* @__PURE__ */ jsxDEV("div", { class: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md group", children: /* @__PURE__ */ jsxDEV(
        TextareaWithActions,
        {
          id: "input",
          name: "input",
          label: t("shareUrls"),
          labelPrefix: /* @__PURE__ */ jsxDEV("span", { class: "w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-link text-sm" }) }),
          model: "input",
          rows: 5,
          placeholder: t("urlPlaceholder"),
          required: true,
          labelActionsWrapperClass: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          labelActions: [
            {
              key: "paste",
              icon: "fas fa-paste",
              label: t("paste"),
              hideLabelOnMobile: true,
              className: "px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1",
              title: t("paste"),
              attrs: {
                "x-on:click": "navigator.clipboard.readText().then(text => input = text).catch(() => {})"
              }
            },
            {
              key: "clear",
              icon: "fas fa-times",
              label: t("clear"),
              hideLabelOnMobile: true,
              className: "px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1",
              title: t("clear"),
              attrs: {
                "x-on:click": "input = ''",
                "x-show": "input"
              }
            }
          ]
        }
      ) }),
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          class: "flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
          "x-on:click": "showAdvanced = !showAdvanced",
          role: "button",
          tabindex: "0",
          ...{
            "x-on:keydown.enter.prevent": "showAdvanced = !showAdvanced",
            "x-on:keydown.space.prevent": "showAdvanced = !showAdvanced"
          },
          children: [
            /* @__PURE__ */ jsxDEV("div", { class: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxDEV("div", { class: "w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-sliders-h" }) }),
              /* @__PURE__ */ jsxDEV("span", { class: "font-semibold text-gray-900 dark:text-white", children: t("advancedOptions") })
            ] }),
            /* @__PURE__ */ jsxDEV(
              "div",
              {
                class: "w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-transform duration-300",
                "x-bind:class": "{'rotate-180': showAdvanced}",
                children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-chevron-down" })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxDEV("div", { "x-show": "showAdvanced", ...{ "x-transition:enter": "transition ease-out duration-300", "x-transition:enter-start": "opacity-0 transform -translate-y-4", "x-transition:enter-end": "opacity-100 transform translate-y-0", "x-transition:leave": "transition ease-in duration-200", "x-transition:leave-start": "opacity-100 transform translate-y-0", "x-transition:leave-end": "opacity-0 transform -translate-y-4" }, class: "space-y-6", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxDEV("h3", { class: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV("i", { class: "fas fa-filter text-gray-400" }),
              t("ruleSelection")
            ] }),
            /* @__PURE__ */ jsxDEV("select", { "x-model": "selectedPredefinedRule", "x-on:change": "applyPredefinedRule()", class: "px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent", children: [
              /* @__PURE__ */ jsxDEV("option", { value: "custom", children: t("custom") }),
              /* @__PURE__ */ jsxDEV("option", { value: "minimal", children: t("minimal") }),
              /* @__PURE__ */ jsxDEV("option", { value: "balanced", children: t("balanced") }),
              /* @__PURE__ */ jsxDEV("option", { value: "comprehensive", children: t("comprehensive") })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: UNIFIED_RULES.map((rule) => /* @__PURE__ */ jsxDEV("label", { class: "flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group", children: [
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "checkbox",
                value: rule.name,
                "x-model": "selectedRules",
                "x-on:change": "selectedPredefinedRule = 'custom'",
                class: "w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              }
            ),
            /* @__PURE__ */ jsxDEV("span", { class: "ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors", children: t(`outboundNames.${rule.name}`) })
          ] })) })
        ] }),
        /* @__PURE__ */ jsxDEV(CustomRules, { t }),
        /* @__PURE__ */ jsxDEV("div", { class: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: [
          /* @__PURE__ */ jsxDEV("h3", { class: "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDEV("i", { class: "fas fa-cog text-gray-400" }),
            t("generalSettings")
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "space-y-4", children: [
            /* @__PURE__ */ jsxDEV("label", { class: "flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "font-medium text-gray-700 dark:text-gray-300", children: t("groupByCountry") }),
              /* @__PURE__ */ jsxDEV("div", { class: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsxDEV("input", { type: "checkbox", "x-model": "groupByCountry", class: "sr-only peer" }),
                /* @__PURE__ */ jsxDEV("div", { class: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" })
              ] })
            ] }),
            /* @__PURE__ */ jsxDEV("label", { class: "flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "font-medium text-gray-700 dark:text-gray-300", children: t("includeAutoSelect") }),
              /* @__PURE__ */ jsxDEV("div", { class: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsxDEV("input", { type: "checkbox", "x-model": "includeAutoSelect", class: "sr-only peer" }),
                /* @__PURE__ */ jsxDEV("div", { class: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" })
              ] })
            ] }),
            /* @__PURE__ */ jsxDEV("label", { class: "flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "font-medium text-gray-700 dark:text-gray-300", children: t("enableClashUI") }),
              /* @__PURE__ */ jsxDEV("div", { class: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsxDEV("input", { type: "checkbox", "x-model": "enableClashUI", class: "sr-only peer" }),
                /* @__PURE__ */ jsxDEV("div", { class: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" })
              ] })
            ] }),
            /* @__PURE__ */ jsxDEV(
              "div",
              {
                "x-show": "enableClashUI",
                ...{
                  "x-transition:enter": "transition ease-out duration-200",
                  "x-transition:enter-start": "opacity-0 transform -translate-y-2",
                  "x-transition:enter-end": "opacity-100 transform translate-y-0",
                  "x-transition:leave": "transition ease-in duration-150",
                  "x-transition:leave-start": "opacity-100 transform translate-y-0",
                  "x-transition:leave-end": "opacity-0 transform -translate-y-2"
                },
                class: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2",
                children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("externalController") }),
                    /* @__PURE__ */ jsxDEV("input", { type: "text", "x-model": "externalController", class: "w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent", placeholder: t("externalControllerPlaceholder") })
                  ] }),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("externalUiDownloadUrl") }),
                    /* @__PURE__ */ jsxDEV("input", { type: "text", "x-model": "externalUiDownloadUrl", class: "w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent", placeholder: t("externalUiDownloadUrlPlaceholder") })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: [
          /* @__PURE__ */ jsxDEV("h3", { class: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxDEV("i", { class: "fas fa-file-export text-gray-400" }),
            t("subconverterConfigTitle")
          ] }),
          /* @__PURE__ */ jsxDEV("p", { class: "text-sm text-gray-500 dark:text-gray-400 mb-4", children: t("subconverterConfigDesc") }),
          /* @__PURE__ */ jsxDEV("div", { class: "px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxDEV("p", { class: "font-mono text-sm text-gray-600 dark:text-gray-400 break-all", "x-text": "getSubconverterUrl()" }) }),
          /* @__PURE__ */ jsxDEV("div", { class: "mt-3 flex justify-end", children: /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              "x-on:click": "copySubconverterUrl()",
              class: "px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2",
              "x-bind:class": "subconverterCopied ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'",
              children: [
                /* @__PURE__ */ jsxDEV("i", { class: "fas", "x-bind:class": "subconverterCopied ? 'fa-check' : 'fa-copy'" }),
                /* @__PURE__ */ jsxDEV("span", { "x-text": `subconverterCopied ? '${t("copiedSubconverterUrl")}' : '${t("copySubconverterUrl")}'` })
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxDEV("h3", { class: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV("i", { class: "fas fa-file-code text-gray-400" }),
              t("baseConfigSettings")
            ] }),
            /* @__PURE__ */ jsxDEV("select", { "x-model": "configType", class: "px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent", children: [
              /* @__PURE__ */ jsxDEV("option", { value: "singbox", children: "SingBox (JSON)" }),
              /* @__PURE__ */ jsxDEV("option", { value: "clash", children: "Clash (YAML)" }),
              /* @__PURE__ */ jsxDEV("option", { value: "surge", children: "Surge (JSON/INI)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV(
            ValidatedTextarea,
            {
              id: "configEditor",
              name: "configEditor",
              model: "configEditor",
              rows: 5,
              placeholder: "Paste your custom config here...",
              variant: "mono",
              containerClass: "mt-0 group",
              labelWrapperClass: "flex items-center justify-end mb-2",
              labelActionsWrapperClass: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              pasteLabel: t("paste"),
              clearLabel: t("clear"),
              validation: {
                button: {
                  key: "validate-config",
                  label: t("validateConfig"),
                  className: "px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2",
                  attrs: {
                    "x-on:click": "validateBaseConfig()"
                  }
                },
                success: {
                  show: "configValidationState === 'success'",
                  textExpr: "configValidationMessage"
                },
                error: {
                  show: "configValidationState === 'error'",
                  textExpr: "configValidationMessage"
                }
              },
              inlineActionsWrapperClass: "absolute bottom-4 right-4 flex gap-2",
              preserveLabelSpace: false
            }
          ),
          /* @__PURE__ */ jsxDEV("div", { class: "flex justify-end gap-3 mt-4", children: [
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                "x-on:click": "saveBaseConfig()",
                "x-bind:disabled": "savingConfig",
                class: "px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxDEV("i", { class: "fas", "x-bind:class": "savingConfig ? 'fa-spinner fa-spin' : 'fa-save'" }),
                  /* @__PURE__ */ jsxDEV("span", { "x-text": "savingConfig ? savingConfigText : saveConfigText", children: t("saveConfig") })
                ]
              }
            ),
            /* @__PURE__ */ jsxDEV("button", { type: "button", "x-on:click": "clearBaseConfig()", class: "px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium text-sm", children: t("clearConfig") })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: [
          /* @__PURE__ */ jsxDEV("h3", { class: "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDEV("i", { class: "fas fa-user-secret text-gray-400" }),
            t("UASettings")
          ] }),
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              type: "text",
              "x-model": "customUA",
              class: "w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              placeholder: "curl/7.74.0"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("div", { class: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "submit",
            class: "flex-1 py-3.5 px-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2",
            "x-bind:disabled": "loading",
            children: [
              /* @__PURE__ */ jsxDEV("i", { class: "fas fa-sync-alt", "x-bind:class": "loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'" }),
              /* @__PURE__ */ jsxDEV("span", { "x-text": "loading ? processingText : convertText", children: t("convert") })
            ]
          }
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            "x-on:click": "clearAll()",
            class: "px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm",
            children: [
              /* @__PURE__ */ jsxDEV("i", { class: "fas fa-trash-alt" }),
              t("clear")
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxDEV("div", { "x-cloak": true, "x-show": "generatedLinks", "x-data": "{ copied: null }", ...{ "x-transition:enter": "transition ease-out duration-500", "x-transition:enter-start": "opacity-0 transform translate-y-8", "x-transition:enter-end": "opacity-100 transform translate-y-0" }, class: "mt-12", children: /* @__PURE__ */ jsxDEV("div", { class: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-all duration-300 hover:shadow-md", children: [
      /* @__PURE__ */ jsxDEV("div", { class: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", children: /* @__PURE__ */ jsxDEV("h2", { class: "text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV("span", { class: "w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-link text-sm" }) }),
        t("subscriptionLinks")
      ] }) }),
      /* @__PURE__ */ jsxDEV("div", { class: "mt-6 space-y-4", children: LINK_FIELDS.map((field) => /* @__PURE__ */ jsxDEV("div", { class: "relative group", children: [
        /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t(field.labelKey) }),
        /* @__PURE__ */ jsxDEV("div", { class: "flex gap-2", children: [
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              type: "text",
              readonly: true,
              "x-bind:value": `shortenedLinks ? shortenedLinks?.${field.key} : generatedLinks?.${field.key}`,
              class: "w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:border-transparent transition-all duration-200 font-mono text-sm",
              "x-bind:class": "shortenedLinks ? 'text-primary-600 dark:text-primary-400 font-semibold focus:ring-primary-500' : 'text-gray-600 dark:text-gray-400 focus:ring-green-500'"
            }
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              "x-on:click": `navigator.clipboard.writeText((shortenedLinks || generatedLinks)?.${field.key}); copied = '${field.key}'; setTimeout(() => copied = null, 2000)`,
              class: "px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2",
              "x-bind:class": `{
                  'hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400': !shortenedLinks,
                  'hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400': shortenedLinks,
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': !shortenedLinks && copied === '${field.key}',
                  'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400': shortenedLinks && copied === '${field.key}'
                }`,
              children: /* @__PURE__ */ jsxDEV("i", { class: "fas", "x-bind:class": `copied === '${field.key}' ? 'fa-check' : 'fa-copy'` })
            }
          )
        ] })
      ] }, field.key)) }),
      /* @__PURE__ */ jsxDEV("div", { class: "mt-6", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "flex flex-col items-center gap-3", children: /* @__PURE__ */ jsxDEV("div", { class: "w-full max-w-md", children: [
          /* @__PURE__ */ jsxDEV("label", { class: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center", children: [
            t("customShortCode"),
            " ",
            /* @__PURE__ */ jsxDEV("span", { class: "text-gray-400", children: [
              "(",
              t("optional"),
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              type: "text",
              "x-model": "customShortCode",
              placeholder: t("customShortCodePlaceholder"),
              class: "w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-center"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxDEV("div", { class: "flex justify-center mt-4", children: /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            "x-on:click": "shortenedLinks ? shortenedLinks = null : shortenLinks()",
            "x-bind:disabled": "!shortenedLinks && shortening",
            class: "px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg",
            "x-bind:class": "shortenedLinks\r\n              ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'\r\n              : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-primary-500/30 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed'",
            children: [
              /* @__PURE__ */ jsxDEV(
                "i",
                {
                  class: "fas",
                  "x-bind:class": "shortenedLinks ? 'fa-expand-alt' : (shortening ? 'fa-spinner fa-spin' : 'fa-compress-alt')"
                }
              ),
              /* @__PURE__ */ jsxDEV(
                "span",
                {
                  "x-text": "shortenedLinks ? showFullLinksText : (shortening ? shorteningText : shortenLinksText)"
                }
              )
            ]
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxDEV("script", { dangerouslySetInnerHTML: { __html: scriptContent } })
  ] });
};

// src/components/Footer.jsx
var Footer = () => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsxDEV("footer", { class: "mt-12 py-8 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxDEV("div", { class: "container mx-auto px-4", children: /* @__PURE__ */ jsxDEV("div", { class: "flex flex-col md:flex-row items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxDEV("div", { class: "flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-600 dark:text-gray-400 text-center md:text-left", children: [
      /* @__PURE__ */ jsxDEV("span", { class: "text-sm", children: [
        "\xA9 ",
        currentYear,
        " ",
        APP_NAME,
        ". All rights reserved."
      ] }),
      /* @__PURE__ */ jsxDEV("span", { class: "hidden md:inline text-gray-300 dark:text-gray-700", children: "|" }),
      /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: `${GITHUB_REPO}/releases/tag/v${APP_VERSION}`,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-mono",
          title: `View release notes for v${APP_VERSION}`,
          children: [
            "v",
            APP_VERSION
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxDEV("div", { class: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: DOCS_URL,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors",
          "aria-label": "Documentation",
          children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-book text-lg" })
        }
      ),
      /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: GITHUB_REPO,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors",
          "aria-label": "GitHub",
          children: /* @__PURE__ */ jsxDEV("i", { class: "fab fa-github text-lg" })
        }
      )
    ] })
  ] }) }) });
};

// src/components/UpdateChecker.jsx
var UpdateChecker = () => {
  const xData = `updateChecker('${APP_VERSION}', '${GITHUB_API_RELEASES}')`;
  const releaseUrl = `${GITHUB_REPO}/releases/latest`;
  const updateGuideUrl = `${DOCS_URL}/guide/faq#\u4F7F\u7528-vercel-cloudflare-\u5FEB\u901F\u90E8\u7F72\u6309\u94AE\u540E-\u5982\u4F55\u540C\u6B65\u4E0A\u6E38\u66F4\u65B0`;
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      "x-data": xData,
      "x-show": "showUpdateToast",
      "x-cloak": true,
      "x-transition:enter": "transition ease-out duration-300",
      "x-transition:enter-start": "opacity-0 translate-y-2",
      "x-transition:enter-end": "opacity-100 translate-y-0",
      "x-transition:leave": "transition ease-in duration-200",
      "x-transition:leave-start": "opacity-100 translate-y-0",
      "x-transition:leave-end": "opacity-0 translate-y-2",
      class: "fixed bottom-6 right-6 z-50 max-w-sm",
      children: /* @__PURE__ */ jsxDEV("div", { class: "bg-white dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 ring-1 ring-black/5", children: /* @__PURE__ */ jsxDEV("div", { class: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "flex-shrink-0 pt-0.5", children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-arrow-up text-primary-500" }) }),
        /* @__PURE__ */ jsxDEV("div", { class: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxDEV("h4", { class: "text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDEV("span", { "x-text": "i18n.newVersionAvailable || 'New Version Available'" }),
            /* @__PURE__ */ jsxDEV("span", { class: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800", "x-text": "'v' + latestVersion" })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "mt-3 flex items-center gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: releaseUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors",
                children: /* @__PURE__ */ jsxDEV("span", { "x-text": "i18n.viewRelease || 'View Release'" })
              }
            ),
            /* @__PURE__ */ jsxDEV("div", { class: "w-px h-3 bg-gray-200 dark:bg-gray-700" }),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                "x-on:click": "dismissUpdate()",
                class: "text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors",
                children: /* @__PURE__ */ jsxDEV("span", { "x-text": "i18n.later || 'Later'" })
              }
            ),
            /* @__PURE__ */ jsxDEV("div", { class: "w-px h-3 bg-gray-200 dark:bg-gray-700" }),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: updateGuideUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxDEV("i", { class: "fas fa-book text-xs" }),
                  /* @__PURE__ */ jsxDEV("span", { "x-text": "i18n.updateGuide || 'Update Guide'" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            "x-on:click": "dismissUpdate()",
            class: "flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxDEV("i", { class: "fas fa-times text-xs" })
          }
        )
      ] }) })
    }
  );
};

// src/parsers/protocols/shadowsocksParser.js
init_utils();
function parseServer(serverPart) {
  const match2 = serverPart.match(/\[([^\]]+)\]:(\d+)/);
  if (match2) {
    return [match2[1], match2[2]];
  }
  return serverPart.split(":");
}
function parsePluginString(pluginStr) {
  if (!pluginStr) return null;
  const parts = pluginStr.split(";");
  const pluginName = parts[0];
  if (!pluginName) return null;
  const opts = {};
  for (let i = 1; i < parts.length; i++) {
    const eqIndex = parts[i].indexOf("=");
    if (eqIndex === -1) {
      const key2 = parts[i].trim();
      if (key2) {
        opts[key2] = true;
      }
      continue;
    }
    const key = parts[i].substring(0, eqIndex);
    const value = parts[i].substring(eqIndex + 1);
    if (key) {
      if (key === "obfs") {
        opts.mode = value;
      } else if (key === "obfs-host") {
        opts.host = value;
      } else if (key === "obfs-uri") {
        opts.path = value;
      } else {
        opts[key] = value;
      }
    }
  }
  const normalizedPlugin = pluginName === "simple-obfs" ? "obfs" : pluginName;
  return {
    plugin: normalizedPlugin,
    plugin_opts: Object.keys(opts).length > 0 ? opts : void 0
  };
}
function createConfig(tag, server, server_port, method, password, pluginInfo) {
  const config = {
    tag: tag || "Shadowsocks",
    type: "shadowsocks",
    server,
    server_port: parseInt(server_port),
    method,
    password,
    tcp_fast_open: false
  };
  if (pluginInfo) {
    config.plugin = pluginInfo.plugin;
    if (pluginInfo.plugin_opts) {
      config.plugin_opts = pluginInfo.plugin_opts;
    }
  }
  return config;
}
function parseShadowsocks(url) {
  let parts = url.replace("ss://", "").split("#");
  let mainPart = parts[0];
  let tag = parts[1];
  if (tag && tag.includes("%")) {
    tag = decodeURIComponent(tag);
  }
  let queryString = "";
  const queryIndex = mainPart.indexOf("?");
  if (queryIndex !== -1) {
    queryString = mainPart.substring(queryIndex + 1);
    mainPart = mainPart.substring(0, queryIndex);
  }
  let pluginInfo = null;
  if (queryString) {
    const params = new URLSearchParams(queryString);
    const pluginParam = params.get("plugin");
    if (pluginParam) {
      pluginInfo = parsePluginString(pluginParam);
    }
  }
  try {
    let [base64, serverPart] = mainPart.split("@");
    if (!serverPart) {
      const decodedLegacy = base64ToBinary(mainPart);
      const [methodAndPass, serverInfo] = decodedLegacy.split("@");
      const [method2, password2] = methodAndPass.split(":");
      const [server2, server_port2] = parseServer(serverInfo);
      return createConfig(tag, server2, server_port2, method2, password2, pluginInfo);
    }
    let decodedParts = base64ToBinary(decodeURIComponent(base64)).split(":");
    let method = decodedParts[0];
    let password = decodedParts.slice(1).join(":");
    let [server, server_port] = parseServer(serverPart);
    return createConfig(tag, server, server_port, method, password, pluginInfo);
  } catch (e) {
    console.error("Failed to parse shadowsocks URL:", e);
    return null;
  }
}

// src/parsers/protocols/vmessParser.js
init_utils();
function normalizeArray(value) {
  if (!value) return void 0;
  return Array.isArray(value) ? value : [value];
}
function buildHttpHeaders(vmessConfig) {
  const hostHeader = normalizeArray(vmessConfig.host || vmessConfig.sni);
  if (vmessConfig.headers && typeof vmessConfig.headers === "object") {
    const normalized = {};
    Object.entries(vmessConfig.headers).forEach(([key, value]) => {
      const normalizedValue = normalizeArray(value)?.map((entry) => `${entry}`);
      if (normalizedValue && normalizedValue.length > 0) {
        normalized[key] = normalizedValue;
      }
    });
    if (hostHeader && !normalized.host) {
      normalized.host = hostHeader;
    }
    if (Object.keys(normalized).length > 0) {
      return normalized;
    }
  }
  return hostHeader ? { host: hostHeader } : void 0;
}
function parseVmess(url) {
  let base64WithFragment = url.replace("vmess://", "");
  let tagOverride;
  const hashPos = base64WithFragment.indexOf("#");
  if (hashPos >= 0) {
    tagOverride = decodeURIComponent(base64WithFragment.slice(hashPos + 1));
    base64WithFragment = base64WithFragment.slice(0, hashPos);
  }
  let vmessConfig = JSON.parse(decodeBase64(base64WithFragment));
  let tls = { enabled: false };
  let transport;
  const networkType = vmessConfig.net || "tcp";
  const transportType = vmessConfig.type || networkType;
  const tlsEnabled = vmessConfig.tls && vmessConfig.tls !== "" && vmessConfig.tls !== "none";
  if (tlsEnabled) {
    tls = {
      enabled: true,
      server_name: vmessConfig.sni,
      insecure: vmessConfig["skip-cert-verify"] || false
    };
  }
  if (networkType === "ws") {
    transport = {
      type: "ws",
      path: vmessConfig.path,
      headers: { "host": vmessConfig.host ? vmessConfig.host : vmessConfig.sni }
    };
  } else if (networkType === "tcp" && transportType === "http" || networkType === "http") {
    const method = vmessConfig.method || "GET";
    const path = vmessConfig.path || "/";
    transport = {
      type: "http",
      method,
      path: Array.isArray(path) ? path : [path],
      headers: buildHttpHeaders(vmessConfig)
    };
  } else if (networkType === "grpc") {
    transport = {
      type: "grpc",
      service_name: vmessConfig?.path || vmessConfig?.serviceName
    };
  } else if (networkType === "h2") {
    const hostValue = vmessConfig.host || vmessConfig.sni;
    transport = {
      type: "h2",
      path: vmessConfig.path,
      host: hostValue ? Array.isArray(hostValue) ? hostValue : [hostValue] : void 0
    };
  }
  return {
    tag: tagOverride || vmessConfig.ps,
    type: "vmess",
    server: vmessConfig.add,
    server_port: parseInt(vmessConfig.port),
    uuid: vmessConfig.id,
    alter_id: parseInt(vmessConfig.aid) || 0,
    security: vmessConfig.scy || "auto",
    tcp_fast_open: false,
    transport,
    tls: tls.enabled ? tls : void 0
  };
}

// src/parsers/protocols/vlessParser.js
init_utils();
function parseVless(url) {
  const { addressPart, params, name } = parseUrlParams(url);
  const [uuid, serverInfo] = addressPart.split("@");
  const { host, port } = parseServerInfo(serverInfo);
  const tls = createTlsConfig(params);
  if (tls.reality) {
    tls.utls = {
      enabled: true,
      fingerprint: "chrome"
    };
  }
  const transport = params.type !== "tcp" ? createTransportConfig(params) : void 0;
  const udp = params.udp !== void 0 ? parseBool(params.udp) : void 0;
  return {
    type: "vless",
    tag: name,
    server: host,
    server_port: port,
    uuid: decodeURIComponent(uuid),
    tcp_fast_open: false,
    tls,
    transport,
    flow: params.flow ?? void 0,
    ...udp !== void 0 ? { udp } : {}
  };
}

// src/parsers/protocols/hysteria2Parser.js
init_utils();
function parseHysteria2(url) {
  const { addressPart, params, name } = parseUrlParams(url);
  let host;
  let port;
  let password = null;
  if (addressPart.includes("@")) {
    const [uuid, serverInfo] = addressPart.split("@");
    const parsed = parseServerInfo(serverInfo);
    host = parsed.host;
    port = parsed.port;
    password = decodeURIComponent(uuid);
  } else {
    const parsed = parseServerInfo(addressPart);
    host = parsed.host;
    port = parsed.port;
    password = params.auth;
  }
  if (!params.security) params.security = "tls";
  const tls = createTlsConfig(params);
  const obfs = {};
  if (params["obfs-password"]) {
    obfs.type = params.obfs;
    obfs.password = params["obfs-password"];
  }
  const hopInterval = parseMaybeNumber(params["hop-interval"]);
  return {
    tag: name,
    type: "hysteria2",
    server: host,
    server_port: port,
    password,
    tls,
    obfs: Object.keys(obfs).length > 0 ? obfs : void 0,
    auth: params.auth,
    recv_window_conn: params.recv_window_conn,
    up: params.up ?? (params.upmbps ? parseMaybeNumber(params.upmbps) : void 0),
    down: params.down ?? (params.downmbps ? parseMaybeNumber(params.downmbps) : void 0),
    ports: params.ports,
    hop_interval: hopInterval,
    alpn: parseArray(params.alpn),
    fast_open: parseBool(params["fast-open"])
  };
}

// src/parsers/protocols/trojanParser.js
init_utils();
function parseTrojan(url) {
  const { addressPart, params, name } = parseUrlParams(url);
  const [password, serverInfo] = addressPart.split("@");
  const { host, port } = parseServerInfo(serverInfo);
  const parsedURL = parseServerInfo(addressPart);
  if (!params.security) params.security = "tls";
  const tls = createTlsConfig(params);
  const transport = params.type !== "tcp" ? createTransportConfig(params) : void 0;
  return {
    type: "trojan",
    tag: name,
    server: host,
    server_port: port,
    password: decodeURIComponent(password) || parsedURL.username,
    tcp_fast_open: false,
    tls,
    transport,
    flow: params.flow ?? void 0
  };
}

// src/parsers/protocols/tuicParser.js
init_utils();
function parseTuic(url) {
  const { addressPart, params, name } = parseUrlParams(url);
  const [userinfo, serverInfo] = addressPart.split("@");
  const { host, port } = parseServerInfo(serverInfo);
  const tls = {
    enabled: true,
    server_name: params.sni,
    alpn: parseArray(params.alpn),
    insecure: parseBool(params["skip-cert-verify"] ?? params.insecure ?? params.allowInsecure, true)
  };
  return {
    tag: name,
    type: "tuic",
    server: host,
    server_port: port,
    uuid: decodeURIComponent(userinfo).split(":")[0],
    password: decodeURIComponent(userinfo).split(":")[1],
    congestion_control: params.congestion_control,
    tls,
    flow: params.flow ?? void 0,
    udp_relay_mode: params["udp-relay-mode"] || params.udp_relay_mode,
    zero_rtt: parseBool(params["zero-rtt"], void 0),
    reduce_rtt: parseBool(params["reduce-rtt"], void 0),
    fast_open: parseBool(params["fast-open"], void 0),
    disable_sni: parseBool(params["disable-sni"], void 0)
  };
}

// src/parsers/ProxyParser.js
init_httpSubscriptionFetcher();
var protocolParsers = {
  ss: parseShadowsocks,
  vmess: parseVmess,
  vless: parseVless,
  hysteria: parseHysteria2,
  hysteria2: parseHysteria2,
  hy2: parseHysteria2,
  http: fetchSubscription,
  https: fetchSubscription,
  trojan: parseTrojan,
  tuic: parseTuic
};
var ProxyParser = class {
  static async parse(url, userAgent) {
    if (!url || typeof url !== "string") {
      return void 0;
    }
    const trimmed = url.trim();
    const type2 = trimmed.split("://")[0];
    const parser = protocolParsers[type2];
    if (!parser) {
      return void 0;
    }
    return parser(trimmed, userAgent);
  }
};

// src/parsers/index.js
init_convertYamlProxyToObject();

// src/builders/BaseConfigBuilder.js
init_utils();
var BaseConfigBuilder = class {
  constructor(inputString, baseConfig, lang, userAgent, groupByCountry = false, includeAutoSelect = true) {
    this.inputString = inputString;
    this.config = deepCopy(baseConfig);
    this.customRules = [];
    this.selectedRules = [];
    this.t = createTranslator(lang);
    this.userAgent = userAgent;
    this.appliedOverrideKeys = /* @__PURE__ */ new Set();
    this.groupByCountry = groupByCountry;
    this.includeAutoSelect = includeAutoSelect;
    this.providerUrls = [];
    this.autoProviderDescriptors = void 0;
    this.subscriptionUserinfo = void 0;
  }
  async build() {
    const customItems = await this.parseCustomItems();
    this.addCustomItems(customItems);
    this.addSelectors();
    return this.formatConfig();
  }
  async parseCustomItems() {
    const input2 = this.inputString || "";
    const parsedItems = [];
    const { parseSubscriptionContent: parseSubscriptionContent2 } = await Promise.resolve().then(() => (init_subscriptionContentParser(), subscriptionContentParser_exports));
    const directResult = parseSubscriptionContent2(input2);
    if (directResult && typeof directResult === "object" && directResult.type) {
      if (directResult.config) {
        this.applyConfigOverrides(directResult.config);
      }
      if (Array.isArray(directResult.proxies)) {
        for (const proxy of directResult.proxies) {
          if (proxy && proxy.tag) {
            parsedItems.push(proxy);
          }
        }
        if (parsedItems.length > 0) return parsedItems;
      }
    }
    const isBase64Like = /^[A-Za-z0-9+/=\r\n]+$/.test(input2) && input2.replace(/[\r\n]/g, "").length % 4 === 0;
    if (isBase64Like) {
      try {
        const sanitized = input2.replace(/\s+/g, "");
        const decodedWhole = decodeBase64(sanitized);
        if (typeof decodedWhole === "string") {
          const decodedResult = parseSubscriptionContent2(decodedWhole);
          if (decodedResult && typeof decodedResult === "object" && decodedResult.type) {
            if (decodedResult.config) {
              this.applyConfigOverrides(decodedResult.config);
            }
            if (Array.isArray(decodedResult.proxies)) {
              for (const proxy of decodedResult.proxies) {
                if (proxy && proxy.tag) {
                  parsedItems.push(proxy);
                }
              }
              if (parsedItems.length > 0) return parsedItems;
            }
          }
        }
      } catch (_) {
      }
    }
    const urls = input2.split("\n").filter((url) => url.trim() !== "");
    for (const url of urls) {
      let processedUrls = tryDecodeSubscriptionLines(url);
      if (!Array.isArray(processedUrls)) {
        processedUrls = [processedUrls];
      }
      for (const processedUrl of processedUrls) {
        const trimmedUrl = typeof processedUrl === "string" ? processedUrl.trim() : "";
        if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
          const { fetchSubscriptionWithFormat: fetchSubscriptionWithFormat2 } = await Promise.resolve().then(() => (init_httpSubscriptionFetcher(), httpSubscriptionFetcher_exports));
          try {
            const fetchResult = await fetchSubscriptionWithFormat2(trimmedUrl, this.userAgent);
            if (fetchResult) {
              const { content, format, url: originalUrl, subscriptionUserinfo } = fetchResult;
              if (subscriptionUserinfo && !this.subscriptionUserinfo) {
                this.subscriptionUserinfo = subscriptionUserinfo;
              }
              if (this.isCompatibleProviderFormat(format)) {
                this.providerUrls.push(originalUrl);
                continue;
              }
              const result2 = parseSubscriptionContent2(content);
              if (result2 && typeof result2 === "object" && (result2.type === "yamlConfig" || result2.type === "singboxConfig" || result2.type === "surgeConfig")) {
                if (result2.config) {
                  this.applyConfigOverrides(result2.config);
                }
                if (Array.isArray(result2.proxies)) {
                  result2.proxies.forEach((proxy) => {
                    if (proxy && typeof proxy === "object" && proxy.tag) {
                      parsedItems.push(proxy);
                    }
                  });
                }
                continue;
              }
              if (Array.isArray(result2)) {
                for (const item of result2) {
                  if (item && typeof item === "object" && item.tag) {
                    parsedItems.push(item);
                  } else if (typeof item === "string") {
                    const subResult = await ProxyParser.parse(item, this.userAgent);
                    if (subResult) {
                      parsedItems.push(subResult);
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error processing HTTP subscription:", error);
          }
          continue;
        }
        const result = await ProxyParser.parse(processedUrl, this.userAgent);
        if (result && typeof result === "object" && (result.type === "yamlConfig" || result.type === "singboxConfig" || result.type === "surgeConfig")) {
          if (result.config) {
            this.applyConfigOverrides(result.config);
          }
          if (Array.isArray(result.proxies)) {
            result.proxies.forEach((proxy) => {
              if (proxy && typeof proxy === "object" && proxy.tag) {
                parsedItems.push(proxy);
              }
            });
          }
          continue;
        }
        if (Array.isArray(result)) {
          for (const item of result) {
            if (item && typeof item === "object" && item.tag) {
              parsedItems.push(item);
            } else if (typeof item === "string") {
              const subResult = await ProxyParser.parse(item, this.userAgent);
              if (subResult) {
                parsedItems.push(subResult);
              }
            }
          }
        } else if (result) {
          parsedItems.push(result);
        }
      }
    }
    return parsedItems;
  }
  /**
   * Check if subscription format is compatible for use as a provider
   * Override in child classes to enable provider support
   * @param {'clash'|'singbox'|'unknown'} format - Detected subscription format
   * @returns {boolean} - True if format can be used as provider
   */
  isCompatibleProviderFormat(format) {
    return false;
  }
  getAutoProviderDescriptors(reservedNames = []) {
    if (this.autoProviderDescriptors) {
      return this.autoProviderDescriptors;
    }
    const usedNames = new Set(reservedNames);
    const providerNamesByUrl = /* @__PURE__ */ new Map();
    const descriptors = [];
    for (const url of this.providerUrls) {
      if (typeof url !== "string" || url.trim() === "") {
        throw new Error("Provider URL must be a non-empty string");
      }
      const normalizedUrl = url.trim();
      if (providerNamesByUrl.has(normalizedUrl)) {
        continue;
      }
      const baseName = createStableProviderName(normalizedUrl);
      let name = baseName;
      let suffix = 2;
      while (usedNames.has(name)) {
        name = `${baseName}_${suffix}`;
        suffix += 1;
      }
      usedNames.add(name);
      providerNamesByUrl.set(normalizedUrl, name);
      descriptors.push({ name, url: normalizedUrl });
    }
    this.autoProviderDescriptors = descriptors;
    return descriptors;
  }
  applyConfigOverrides(overrides) {
    if (!overrides || typeof overrides !== "object") {
      return;
    }
    const blacklistedKeys = /* @__PURE__ */ new Set(["proxies", "rules", "rule-providers", "proxy-groups"]);
    Object.entries(overrides).forEach(([key, value]) => {
      if (blacklistedKeys.has(key)) {
        return;
      }
      if (value === void 0) {
        delete this.config[key];
        this.appliedOverrideKeys.add(key);
      } else if (key === "dns" && typeof value === "object" && !Array.isArray(value)) {
        this.config[key] = this.mergeDnsConfig(this.config[key], value);
        this.appliedOverrideKeys.add(key);
      } else {
        this.config[key] = deepCopy(value);
        this.appliedOverrideKeys.add(key);
      }
    });
    if (Array.isArray(overrides["proxy-groups"])) {
      this.pendingUserProxyGroups = this.pendingUserProxyGroups || [];
      this.pendingUserProxyGroups.push(...overrides["proxy-groups"]);
    }
  }
  /**
   * Merge DNS configuration with intelligent array merging
   * Arrays like nameserver, fallback, fake-ip-filter are merged instead of overwritten
   * @param {object} existing - Existing DNS config
   * @param {object} incoming - Incoming DNS config to merge
   * @returns {object} - Merged DNS config
   */
  mergeDnsConfig(existing, incoming) {
    if (!existing || typeof existing !== "object") {
      return deepCopy(incoming);
    }
    const result = deepCopy(existing);
    const mergeableArrayKeys = /* @__PURE__ */ new Set(["nameserver", "fallback", "fake-ip-filter"]);
    Object.entries(incoming).forEach(([key, value]) => {
      if (mergeableArrayKeys.has(key) && Array.isArray(value)) {
        if (Array.isArray(result[key])) {
          result[key] = [.../* @__PURE__ */ new Set([...result[key], ...value])];
        } else {
          result[key] = deepCopy(value);
        }
      } else if (key === "nameserver-policy" && typeof value === "object" && !Array.isArray(value)) {
        result[key] = { ...result[key] || {}, ...deepCopy(value) };
      } else {
        result[key] = deepCopy(value);
      }
    });
    return result;
  }
  hasConfigOverride(key) {
    return this.appliedOverrideKeys?.has(key);
  }
  getSubscriptionUserinfo() {
    return this.subscriptionUserinfo;
  }
  getOutboundsList() {
    let outbounds;
    if (typeof this.selectedRules === "string" && PREDEFINED_RULE_SETS[this.selectedRules]) {
      outbounds = getOutbounds(PREDEFINED_RULE_SETS[this.selectedRules]);
    } else if (this.selectedRules && Object.keys(this.selectedRules).length > 0) {
      outbounds = getOutbounds(this.selectedRules);
    } else {
      outbounds = getOutbounds(PREDEFINED_RULE_SETS.minimal);
    }
    return outbounds;
  }
  getProxyList() {
    return this.getProxies().map((proxy) => this.getProxyName(proxy));
  }
  getProxies() {
    throw new Error("getProxies must be implemented in child class");
  }
  getProxyName(proxy) {
    throw new Error("getProxyName must be implemented in child class");
  }
  convertProxy(proxy) {
    throw new Error("convertProxy must be implemented in child class");
  }
  addProxyToConfig(proxy) {
    throw new Error("addProxyToConfig must be implemented in child class");
  }
  addAutoSelectGroup(proxyList) {
    throw new Error("addAutoSelectGroup must be implemented in child class");
  }
  addNodeSelectGroup(proxyList) {
    throw new Error("addNodeSelectGroup must be implemented in child class");
  }
  addOutboundGroups(outbounds, proxyList) {
    throw new Error("addOutboundGroups must be implemented in child class");
  }
  addCustomRuleGroups(proxyList) {
    throw new Error("addCustomRuleGroups must be implemented in child class");
  }
  addFallBackGroup(proxyList) {
    throw new Error("addFallBackGroup must be implemented in child class");
  }
  addCountryGroups() {
    throw new Error("addCountryGroups must be implemented in child class");
  }
  addCustomItems(customItems) {
    const validItems = customItems.filter((item) => item != null);
    validItems.forEach((item) => {
      if (item?.tag) {
        const convertedProxy = this.convertProxy(item);
        if (convertedProxy) {
          this.addProxyToConfig(convertedProxy);
        }
      }
    });
  }
  addSelectors() {
    const outbounds = this.getOutboundsList();
    const proxyList = this.getProxyList();
    this.addAutoSelectGroup(proxyList);
    this.addNodeSelectGroup(proxyList);
    if (this.groupByCountry) {
      this.addCountryGroups();
    }
    this.addOutboundGroups(outbounds, proxyList);
    this.addCustomRuleGroups(proxyList);
    this.addFallBackGroup(proxyList);
    if (this.pendingUserProxyGroups && this.pendingUserProxyGroups.length > 0) {
      this.mergeUserProxyGroups(this.pendingUserProxyGroups);
    }
  }
  /**
   * Merge user-defined proxy groups with system-generated ones
   * Override in child classes to implement format-specific merge logic
   * @param {Array} userGroups - User-defined proxy groups
   */
  mergeUserProxyGroups(userGroups) {
  }
  generateRules() {
    return generateRules(this.selectedRules, this.customRules);
  }
  formatConfig() {
    throw new Error("formatConfig must be implemented in child class");
  }
};

// src/builders/SingboxConfigBuilder.js
init_utils();

// src/builders/helpers/proxyHelpers.js
function defaultGetName(item) {
  return item?.name || item?.tag || "";
}
function defaultSetName(item, name) {
  if (item) {
    if ("name" in item) {
      item.name = name;
    } else if ("tag" in item) {
      item.tag = name;
    }
  }
}
function defaultIsSame(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function addProxyWithDedup(collection, proxy, { getName = defaultGetName, setName = defaultSetName, isSame = defaultIsSame } = {}) {
  if (!proxy) return;
  if (!Array.isArray(collection)) {
    throw new Error("addProxyWithDedup expects the target collection to be an array");
  }
  let candidate = proxy;
  const targetName = getName(candidate) || "";
  const similarProxies = collection.filter((item) => {
    const name = getName(item) || "";
    return targetName && name.includes(targetName);
  });
  const hasIdentical = collection.some((item) => isSame(item, candidate));
  if (hasIdentical) {
    return;
  }
  if (similarProxies.length > 0 && typeof setName === "function" && targetName) {
    const updated = setName(candidate, `${targetName} ${similarProxies.length + 1}`);
    if (typeof updated !== "undefined") {
      candidate = updated;
    }
  }
  collection.push(candidate);
}

// src/builders/helpers/groupBuilder.js
var normalize = (value) => typeof value === "string" ? value.trim() : value;
function uniqueNames(names = []) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  names.forEach((name) => {
    if (typeof name !== "string") return;
    const normalized = normalize(name);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });
  return result;
}
function withDirectReject(options = [], { includeReject = true } = {}) {
  return uniqueNames([
    ...options,
    "DIRECT",
    ...includeReject ? ["REJECT"] : []
  ]);
}
function buildNodeSelectMembers({ proxyList = [], translator, groupByCountry = false, manualGroupName, countryGroupNames = [], includeAutoSelect = true, includeReject = true }) {
  if (!translator) {
    throw new Error("buildNodeSelectMembers requires a translator function");
  }
  const autoName = translator("outboundNames.Auto Select");
  const base = groupByCountry ? [
    ...includeAutoSelect ? [autoName] : [],
    ...manualGroupName ? [manualGroupName] : [],
    ...countryGroupNames
  ] : [
    ...includeAutoSelect ? [autoName] : [],
    ...proxyList
  ];
  return withDirectReject(base, { includeReject });
}
function buildSelectorMembers({ proxyList = [], translator, groupByCountry = false, manualGroupName, countryGroupNames = [], includeAutoSelect = true, includeReject = true }) {
  if (!translator) {
    throw new Error("buildSelectorMembers requires a translator function");
  }
  const base = groupByCountry ? [
    translator("outboundNames.Node Select"),
    ...includeAutoSelect ? [translator("outboundNames.Auto Select")] : [],
    ...manualGroupName ? [manualGroupName] : [],
    ...countryGroupNames
  ] : [
    translator("outboundNames.Node Select"),
    ...proxyList
  ];
  return withDirectReject(base, { includeReject });
}
function buildCustomRuleMembers({ proxyList = [], translator, manualGroupName, includeAutoSelect = true, includeReject = true }) {
  if (!translator) {
    throw new Error("buildCustomRuleMembers requires a translator function");
  }
  return withDirectReject([
    translator("outboundNames.Node Select"),
    ...includeAutoSelect ? [translator("outboundNames.Auto Select")] : [],
    ...manualGroupName ? [manualGroupName] : [],
    ...proxyList
  ], { includeReject });
}

// src/builders/helpers/groupNameUtils.js
function normalizeGroupName(name) {
  if (typeof name !== "string") return name;
  return name.replace(/[\s\u00A0\u2000-\u200B\u3000]+/g, " ").trim();
}
function findGroupIndexByName(groups, name) {
  if (!Array.isArray(groups)) return -1;
  const normName = normalizeGroupName(name);
  return groups.findIndex((g) => g && normalizeGroupName(g.name) === normName);
}

// src/builders/SingboxConfigBuilder.js
var SingboxConfigBuilder = class extends BaseConfigBuilder {
  constructor(inputString, selectedRules, customRules, baseConfig, lang, userAgent, groupByCountry = false, enableClashUI = false, externalController, externalUiDownloadUrl, singboxVersion = "1.12", includeAutoSelect = true) {
    const resolvedBaseConfig = baseConfig ?? SING_BOX_CONFIG;
    super(inputString, resolvedBaseConfig, lang, userAgent, groupByCountry, includeAutoSelect);
    this.selectedRules = selectedRules;
    this.customRules = customRules;
    this.countryGroupNames = [];
    this.manualGroupName = null;
    this.enableClashUI = enableClashUI;
    this.externalController = externalController;
    this.externalUiDownloadUrl = externalUiDownloadUrl;
    this.singboxVersion = singboxVersion;
    if (this.config?.dns?.servers?.length > 0) {
      this.config.dns.servers[0].detour = this.t("outboundNames.Node Select");
    }
  }
  /**
   * Check if subscription format is compatible for use as Sing-Box outbound_provider
   * Only available in Sing-Box 1.12+
   * @param {'clash'|'singbox'|'unknown'} format - Detected subscription format
   * @returns {boolean} - True if format is Sing-Box JSON and version supports providers
   */
  isCompatibleProviderFormat(format) {
    if (this.singboxVersion === "1.11") {
      return false;
    }
    return format === "singbox";
  }
  /**
   * Generate outbound_providers configuration from collected URLs
   * @returns {object[]} - Array of outbound provider objects
   */
  generateOutboundProviders() {
    const existingTags = this.getExistingProviderTags();
    return this.getAutoProviderDescriptors(existingTags).map(({ name, url }) => ({
      tag: name,
      type: "http",
      download_url: url,
      path: `./providers/${name}.json`,
      download_interval: "24h",
      health_check: {
        enabled: true,
        url: "https://www.gstatic.com/generate_204",
        interval: "5m"
      }
    }));
  }
  /**
   * Get list of provider tags
   * @returns {string[]} - Array of provider tags
   */
  getProviderTags() {
    return this.getAutoProviderDescriptors(this.getExistingProviderTags()).map((provider) => provider.name);
  }
  getExistingProviderTags() {
    return Array.isArray(this.config.outbound_providers) ? this.config.outbound_providers.map((p) => p?.tag).filter(Boolean) : [];
  }
  /**
   * Get all provider tags (user-defined + auto-generated)
   * @returns {string[]} - Array of provider tags
   */
  getAllProviderTags() {
    if (this.singboxVersion === "1.11") {
      return [];
    }
    const existingTags = this.getExistingProviderTags();
    const autoTags = this.getProviderTags();
    return [.../* @__PURE__ */ new Set([...existingTags, ...autoTags])];
  }
  getProxies() {
    return this.config.outbounds.filter((outbound) => outbound?.server != void 0);
  }
  getProxyName(proxy) {
    return proxy.tag;
  }
  convertProxy(proxy) {
    const sanitized = { ...proxy };
    delete sanitized.udp;
    delete sanitized.network;
    if (sanitized.alpn && sanitized.tls) {
      if (!sanitized.tls.alpn) {
        sanitized.tls = { ...sanitized.tls, alpn: sanitized.alpn };
      }
      delete sanitized.alpn;
    } else if (sanitized.alpn && !sanitized.tls) {
      delete sanitized.alpn;
    }
    delete sanitized.packet_encoding;
    return sanitized;
  }
  addProxyToConfig(proxy) {
    this.config.outbounds = this.config.outbounds || [];
    addProxyWithDedup(this.config.outbounds, proxy, {
      getName: (item) => item?.tag,
      setName: (item, name) => {
        if (item) item.tag = name;
      },
      isSame: (existing = {}, incoming = {}) => {
        const { tag: _incomingTag, ...restIncoming } = incoming;
        const { tag: _existingTag, ...restExisting } = existing;
        return JSON.stringify(restIncoming) === JSON.stringify(restExisting);
      }
    });
  }
  hasOutboundTag(tag) {
    const target = normalizeGroupName(tag);
    return (this.config.outbounds || []).some((outbound) => normalizeGroupName(outbound?.tag) === target);
  }
  hasAutoSelectCandidates(proxyList = this.getProxyList()) {
    return Array.isArray(proxyList) && proxyList.length > 0 || this.getAllProviderTags().length > 0;
  }
  addAutoSelectGroup(proxyList) {
    if (!this.includeAutoSelect) return;
    this.config.outbounds = this.config.outbounds || [];
    const tag = this.t("outboundNames.Auto Select");
    if (this.hasOutboundTag(tag)) return;
    const providerTags = this.getAllProviderTags();
    const autoSelectMembers = deepCopy(uniqueNames(proxyList));
    if (autoSelectMembers.length === 0 && providerTags.length === 0) return;
    const group = {
      type: "urltest",
      tag,
      outbounds: autoSelectMembers
    };
    if (providerTags.length > 0) {
      group.providers = providerTags;
    }
    this.config.outbounds.unshift(group);
  }
  addNodeSelectGroup(proxyList) {
    this.config.outbounds = this.config.outbounds || [];
    const tag = this.t("outboundNames.Node Select");
    if (this.hasOutboundTag(tag)) return;
    const includeAutoSelect = this.includeAutoSelect && this.hasAutoSelectCandidates(proxyList);
    const members = buildNodeSelectMembers({
      proxyList,
      translator: this.t,
      groupByCountry: this.groupByCountry,
      manualGroupName: this.manualGroupName,
      countryGroupNames: this.countryGroupNames,
      includeAutoSelect,
      includeReject: false
    });
    const group = {
      type: "selector",
      tag,
      outbounds: members
    };
    const providerTags = this.getAllProviderTags();
    if (providerTags.length > 0) {
      group.providers = providerTags;
    }
    this.config.outbounds.unshift(group);
  }
  buildSelectorMembers(proxyList = []) {
    return buildSelectorMembers({
      proxyList,
      translator: this.t,
      groupByCountry: this.groupByCountry,
      manualGroupName: this.manualGroupName,
      countryGroupNames: this.countryGroupNames,
      includeAutoSelect: this.includeAutoSelect && this.hasAutoSelectCandidates(proxyList),
      includeReject: false
    });
  }
  addOutboundGroups(outbounds, proxyList) {
    outbounds.forEach((outbound) => {
      if (outbound !== this.t("outboundNames.Node Select")) {
        if (REJECT_ACTION_RULES.has(outbound)) return;
        let selectorMembers = this.buildSelectorMembers(proxyList);
        const tag = this.t(`outboundNames.${outbound}`);
        if (this.hasOutboundTag(tag)) {
          return;
        }
        if (DIRECT_DEFAULT_RULES.has(outbound)) {
          selectorMembers = ["DIRECT", ...selectorMembers.filter((p) => p !== "DIRECT")];
        }
        this.config.outbounds.push({
          type: "selector",
          tag,
          outbounds: selectorMembers
        });
      }
    });
  }
  addCustomRuleGroups(proxyList) {
    if (Array.isArray(this.customRules)) {
      this.customRules.forEach((rule) => {
        const includeAutoSelect = this.includeAutoSelect && this.hasAutoSelectCandidates(proxyList);
        const selectorMembers = buildCustomRuleMembers({
          proxyList,
          translator: this.t,
          manualGroupName: this.manualGroupName,
          includeAutoSelect,
          includeReject: false
        });
        if (this.hasOutboundTag(rule.name)) return;
        this.config.outbounds.push({
          type: "selector",
          tag: rule.name,
          outbounds: selectorMembers
        });
      });
    }
  }
  addFallBackGroup(proxyList) {
    const selectorMembers = this.buildSelectorMembers(proxyList);
    if (this.hasOutboundTag(this.t("outboundNames.Fall Back"))) return;
    this.config.outbounds.push({
      type: "selector",
      tag: this.t("outboundNames.Fall Back"),
      outbounds: selectorMembers
    });
  }
  addCountryGroups() {
    const proxies = this.getProxies();
    const countryGroups = groupProxiesByCountry(proxies, {
      getName: (proxy) => this.getProxyName(proxy)
    });
    const existingTags = new Set((this.config.outbounds || []).map((o) => normalizeGroupName(o?.tag)).filter(Boolean));
    const manualProxyNames = proxies.map((p) => p?.tag).filter(Boolean);
    const manualGroupName = manualProxyNames.length > 0 ? this.t("outboundNames.Manual Switch") : null;
    if (manualGroupName) {
      const manualNorm = normalizeGroupName(manualGroupName);
      if (!existingTags.has(manualNorm)) {
        this.config.outbounds.push({
          type: "selector",
          tag: manualGroupName,
          outbounds: manualProxyNames
        });
        existingTags.add(manualNorm);
      }
    }
    const countries = Object.keys(countryGroups).sort((a, b) => a.localeCompare(b));
    const countryGroupNames = [];
    const includeAutoSelect = this.includeAutoSelect && this.hasAutoSelectCandidates();
    countries.forEach((country) => {
      const { emoji, name, proxies: countryProxies } = countryGroups[country];
      if (!countryProxies || countryProxies.length === 0) {
        return;
      }
      const groupName = `${emoji} ${name}`;
      const norm = normalizeGroupName(groupName);
      if (!existingTags.has(norm)) {
        this.config.outbounds.push({
          tag: groupName,
          type: "urltest",
          outbounds: countryProxies
        });
        existingTags.add(norm);
      }
      countryGroupNames.push(groupName);
    });
    const nodeSelectTag = this.t("outboundNames.Node Select");
    const nodeSelectGroup = this.config.outbounds.find((o) => normalizeGroupName(o?.tag) === normalizeGroupName(nodeSelectTag));
    if (nodeSelectGroup && Array.isArray(nodeSelectGroup.outbounds)) {
      const rebuilt = buildNodeSelectMembers({
        proxyList: [],
        translator: this.t,
        groupByCountry: true,
        manualGroupName,
        countryGroupNames,
        includeAutoSelect,
        includeReject: false
      });
      nodeSelectGroup.outbounds = rebuilt;
    }
    this.countryGroupNames = countryGroupNames;
    this.manualGroupName = manualGroupName;
  }
  /**
   * Merge user-defined proxy groups (selector/urltest outbounds) with system-generated ones
   * Handles same-tag groups by merging outbounds/providers fields
   * @param {Array} userGroups - User-defined proxy groups from input config (converted to Clash format)
   */
  mergeUserProxyGroups(userGroups) {
    if (!Array.isArray(userGroups)) return;
    const proxyList = this.getProxyList();
    const validProxyTags = new Set(proxyList);
    const allProviderTags = new Set(this.getAllProviderTags());
    const groupTags = new Set(
      (this.config.outbounds || []).filter((o) => o.type === "selector" || o.type === "urltest").map((o) => normalizeGroupName(o?.tag)).filter(Boolean)
    );
    const validRefs = /* @__PURE__ */ new Set(["DIRECT", "direct"]);
    proxyList.forEach((n) => validRefs.add(n));
    groupTags.forEach((n) => validRefs.add(n));
    userGroups.forEach((userGroup) => {
      if (!userGroup?.name) return;
      const existingIndex = (this.config.outbounds || []).findIndex(
        (o) => normalizeGroupName(o?.tag) === normalizeGroupName(userGroup.name)
      );
      if (existingIndex >= 0) {
        const existing = this.config.outbounds[existingIndex];
        if (Array.isArray(userGroup.use) && userGroup.use.length > 0) {
          const validUserProviders = userGroup.use.filter((p) => allProviderTags.has(p));
          existing.providers = [.../* @__PURE__ */ new Set([
            ...existing.providers || [],
            ...validUserProviders
          ])];
        }
        if (Array.isArray(userGroup.proxies) && userGroup.proxies.length > 0) {
          const validUserOutbounds = userGroup.proxies.filter((p) => validRefs.has(p));
          existing.outbounds = [.../* @__PURE__ */ new Set([
            ...existing.outbounds || [],
            ...validUserOutbounds
          ])];
        }
        if (userGroup.url) existing.url = userGroup.url;
        if (typeof userGroup.interval === "number") {
          existing.interval = `${userGroup.interval}s`;
        }
      } else {
        const newOutbound = {
          type: userGroup.type === "url-test" ? "urltest" : "selector",
          tag: userGroup.name
        };
        if (Array.isArray(userGroup.proxies)) {
          newOutbound.outbounds = userGroup.proxies.filter((p) => validRefs.has(p));
        }
        if (Array.isArray(userGroup.use)) {
          const validProviders = userGroup.use.filter((p) => allProviderTags.has(p));
          if (validProviders.length > 0) {
            newOutbound.providers = validProviders;
          }
        }
        if (newOutbound.outbounds?.length > 0 || newOutbound.providers?.length > 0) {
          this.config.outbounds.push(newOutbound);
        }
      }
    });
  }
  /**
   * Validate outbounds before final output
   * Ensures urltest groups have outbounds, fills empty ones with all proxy tags
   */
  validateOutbounds() {
    const proxyList = this.getProxyList();
    const providerTags = this.getAllProviderTags();
    const invalidTags = /* @__PURE__ */ new Set();
    (this.config.outbounds || []).forEach((outbound) => {
      if (outbound.type === "urltest" && (!outbound.outbounds || outbound.outbounds.length === 0) && (!outbound.providers || outbound.providers.length === 0)) {
        outbound.outbounds = [...proxyList];
        if (providerTags.length > 0) {
          outbound.providers = [...providerTags];
        }
        if ((!outbound.outbounds || outbound.outbounds.length === 0) && (!outbound.providers || outbound.providers.length === 0)) {
          invalidTags.add(normalizeGroupName(outbound.tag));
        }
      }
    });
    if (invalidTags.size > 0) {
      this.config.outbounds = (this.config.outbounds || []).filter((outbound) => !invalidTags.has(normalizeGroupName(outbound?.tag))).map((outbound) => {
        if (Array.isArray(outbound.outbounds)) {
          outbound.outbounds = outbound.outbounds.filter((tag) => !invalidTags.has(normalizeGroupName(tag)));
        }
        return outbound;
      });
    }
  }
  sanitizeLegacySpecialOutbounds() {
    const legacyTags = new Set(
      (this.config.outbounds || []).filter((outbound) => outbound?.type === "block" || outbound?.type === "dns").map((outbound) => normalizeGroupName(outbound?.tag)).filter(Boolean)
    );
    legacyTags.add(normalizeGroupName("REJECT"));
    this.config.outbounds = (this.config.outbounds || []).filter((outbound) => !legacyTags.has(normalizeGroupName(outbound?.tag))).map((outbound) => {
      if (Array.isArray(outbound.outbounds)) {
        outbound.outbounds = outbound.outbounds.filter((tag) => !legacyTags.has(normalizeGroupName(tag)));
      }
      return outbound;
    }).filter((outbound) => {
      if (outbound?.type !== "selector" && outbound?.type !== "urltest") return true;
      return outbound.outbounds?.length > 0 || outbound.providers?.length > 0;
    });
  }
  buildRouteTarget(rule) {
    if (REJECT_ACTION_RULES.has(rule?.outbound) || rule?.outbound === "REJECT") {
      return { action: "reject" };
    }
    return { outbound: this.t(`outboundNames.${rule.outbound}`) };
  }
  formatConfig() {
    const rules = generateRules(this.selectedRules, this.customRules);
    const { site_rule_sets, ip_rule_sets } = generateRuleSets(this.selectedRules, this.customRules);
    this.config.route.rule_set = [...site_rule_sets, ...ip_rule_sets];
    if (this.providerUrls.length > 0) {
      const existingProviders = Array.isArray(this.config.outbound_providers) ? this.config.outbound_providers : [];
      const newProviders = this.generateOutboundProviders();
      this.config.outbound_providers = [...existingProviders, ...newProviders];
    }
    this.validateOutbounds();
    this.sanitizeLegacySpecialOutbounds();
    const attachProtocolIfNeeded = (entry, rule) => {
      if (Array.isArray(rule?.protocol) && rule.protocol.length > 0) {
        entry.protocol = rule.protocol;
      }
      return entry;
    };
    const hasMatchValues = (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return false;
    };
    rules.filter((rule) => Array.isArray(rule.src_ip_cidr) && rule.src_ip_cidr.length > 0).map((rule) => {
      this.config.route.rules.push(attachProtocolIfNeeded({
        source_ip_cidr: rule.src_ip_cidr,
        ...this.buildRouteTarget(rule)
      }, rule));
    });
    rules.filter((rule) => hasMatchValues(rule.domain_suffix) || hasMatchValues(rule.domain_keyword)).map((rule) => {
      const entry = {
        ...this.buildRouteTarget(rule)
      };
      if (hasMatchValues(rule.domain_suffix)) entry.domain_suffix = rule.domain_suffix;
      if (hasMatchValues(rule.domain_keyword)) entry.domain_keyword = rule.domain_keyword;
      this.config.route.rules.push(attachProtocolIfNeeded(entry, rule));
    });
    rules.filter((rule) => !!rule.site_rules[0]).map((rule) => {
      this.config.route.rules.push(attachProtocolIfNeeded({
        rule_set: [
          ...rule.site_rules.length > 0 && rule.site_rules[0] !== "" ? rule.site_rules : []
        ],
        ...this.buildRouteTarget(rule)
      }, rule));
    });
    rules.filter((rule) => !!rule.ip_rules[0]).map((rule) => {
      this.config.route.rules.push(attachProtocolIfNeeded({
        rule_set: [
          ...rule.ip_rules.map((ip) => ip.trim()).filter((ip) => ip !== "").map((ip) => `${ip}-ip`)
        ],
        ...this.buildRouteTarget(rule)
      }, rule));
    });
    rules.filter((rule) => hasMatchValues(rule.ip_cidr)).map((rule) => {
      this.config.route.rules.push(attachProtocolIfNeeded({
        ip_cidr: rule.ip_cidr,
        ...this.buildRouteTarget(rule)
      }, rule));
    });
    this.config.route.rules.unshift(
      { action: "sniff" },
      { protocol: "dns", action: "hijack-dns" },
      { clash_mode: "direct", outbound: "DIRECT" },
      { clash_mode: "global", outbound: this.t("outboundNames.Node Select") }
    );
    this.config.route.auto_detect_interface = true;
    this.config.route.final = this.t("outboundNames.Fall Back");
    if (this.enableClashUI || this.externalController || this.externalUiDownloadUrl) {
      const defaultExternalController = "0.0.0.0:9090";
      const defaultExternalUiDownloadUrl = "https://gh-proxy.com/https://github.com/Zephyruso/zashboard/archive/refs/heads/gh-pages.zip";
      const defaultExternalUi = "./ui";
      const defaultSecret = "";
      const defaultDownloadDetour = "DIRECT";
      const defaultClashMode = "rule";
      this.config.experimental = this.config.experimental || {};
      const existingClashApi = this.config.experimental.clash_api || {};
      const externalController = this.externalController || existingClashApi.external_controller || defaultExternalController;
      const externalUiDownloadUrl = this.externalUiDownloadUrl || existingClashApi.external_ui_download_url || defaultExternalUiDownloadUrl;
      const externalUi = existingClashApi.external_ui || defaultExternalUi;
      const secret = existingClashApi.secret ?? defaultSecret;
      const externalUiDownloadDetour = existingClashApi.external_ui_download_detour || defaultDownloadDetour;
      const clashMode = existingClashApi.default_mode || defaultClashMode;
      this.config.experimental.clash_api = {
        ...existingClashApi,
        external_controller: externalController,
        external_ui: externalUi,
        external_ui_download_url: externalUiDownloadUrl,
        external_ui_download_detour: externalUiDownloadDetour,
        secret,
        default_mode: clashMode
      };
    }
    return this.config;
  }
};

// src/builders/ClashConfigBuilder.js
init_js_yaml();
init_utils();

// src/builders/helpers/clashConfigUtils.js
function emitClashRules(rules = [], translator) {
  if (!translator) {
    throw new Error("emitClashRules requires a translator function");
  }
  const results = [];
  rules.filter((rule) => Array.isArray(rule.src_ip_cidr) && rule.src_ip_cidr.length > 0).forEach((rule) => {
    rule.src_ip_cidr.forEach((cidr) => {
      if (!cidr) return;
      results.push(`SRC-IP-CIDR,${cidr},${translator("outboundNames." + rule.outbound)}`);
    });
  });
  rules.filter((rule) => Array.isArray(rule.domain_suffix) && rule.domain_suffix.length > 0).forEach((rule) => {
    rule.domain_suffix.forEach((suffix) => {
      results.push(`DOMAIN-SUFFIX,${suffix},${translator("outboundNames." + rule.outbound)}`);
    });
  });
  rules.filter((rule) => Array.isArray(rule.domain_keyword) && rule.domain_keyword.length > 0).forEach((rule) => {
    rule.domain_keyword.forEach((keyword) => {
      results.push(`DOMAIN-KEYWORD,${keyword},${translator("outboundNames." + rule.outbound)}`);
    });
  });
  rules.filter((rule) => Array.isArray(rule.site_rules) && rule.site_rules[0]).forEach((rule) => {
    rule.site_rules.forEach((site) => {
      results.push(`RULE-SET,${site},${translator("outboundNames." + rule.outbound)}`);
    });
  });
  rules.filter((rule) => Array.isArray(rule.ip_rules) && rule.ip_rules[0]).forEach((rule) => {
    rule.ip_rules.forEach((ip) => {
      results.push(`RULE-SET,${ip}-ip,${translator("outboundNames." + rule.outbound)},no-resolve`);
    });
  });
  rules.filter((rule) => Array.isArray(rule.ip_cidr) && rule.ip_cidr.length > 0).forEach((rule) => {
    rule.ip_cidr.forEach((cidr) => {
      results.push(`IP-CIDR,${cidr},${translator("outboundNames." + rule.outbound)},no-resolve`);
    });
  });
  return results;
}
var normalize2 = (s) => typeof s === "string" ? s.trim() : s;
function sanitizeClashProxyGroups(config) {
  const groups = config["proxy-groups"] || [];
  if (!Array.isArray(groups) || groups.length === 0) {
    return;
  }
  const proxyNames = new Set((config.proxies || []).map((p) => normalize2(p?.name)).filter(Boolean));
  const groupNames = new Set(groups.map((g) => normalize2(g?.name)).filter(Boolean));
  const validNames = new Set(["DIRECT", "REJECT"].map(normalize2));
  proxyNames.forEach((n) => validNames.add(n));
  groupNames.forEach((n) => validNames.add(n));
  config["proxy-groups"] = groups.map((group) => {
    if (!group || !Array.isArray(group.proxies)) return group;
    const normalizedProxies = group.proxies.map((x) => typeof x === "string" ? x.trim() : x).filter((x) => typeof x === "string");
    const seen = /* @__PURE__ */ new Set();
    const deduped = normalizedProxies.filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
    if (Array.isArray(group.use) && group.use.length > 0) {
      return { ...group, proxies: deduped };
    }
    const filtered = deduped.filter((x) => validNames.has(normalize2(x)));
    return { ...group, proxies: filtered };
  });
}

// src/services/errors.js
var ServiceError = class extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
};
var MissingDependencyError = class extends ServiceError {
  constructor(message = "Required dependency is not available") {
    super(message, 501);
    this.name = "MissingDependencyError";
  }
};
var InvalidPayloadError = class extends ServiceError {
  constructor(message = "Invalid payload") {
    super(message, 400);
    this.name = "InvalidPayloadError";
  }
};
var InvalidConfigError = class extends ServiceError {
  constructor(message = "Invalid config") {
    super(message, 400);
    this.name = "InvalidConfigError";
  }
};

// src/builders/ClashConfigBuilder.js
function supportsMrsFormat(userAgent) {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  if (ua.includes("mihomo") || ua.includes("meta") || // clash.meta, clashx meta, meta-for-android, etc.
  ua.includes("clash-verge") || ua.includes("stash") || ua.includes("verge")) {
    return true;
  }
  if (ua.includes("merlin") || ua.includes("clashforwindows") || ua.includes("clashforandroid") || ua.includes("clash/")) {
    return false;
  }
  return true;
}
function getClashUdpValue(proxy, defaultEnabled = true) {
  if (typeof proxy?.udp !== "undefined") {
    return proxy.udp;
  }
  return defaultEnabled;
}
var ClashConfigBuilder = class extends BaseConfigBuilder {
  constructor(inputString, selectedRules, customRules, baseConfig, lang, userAgent, groupByCountry = false, enableClashUI = false, externalController, externalUiDownloadUrl, includeAutoSelect = true) {
    if (!baseConfig) {
      baseConfig = CLASH_CONFIG;
    }
    super(inputString, baseConfig, lang, userAgent, groupByCountry, includeAutoSelect);
    this.selectedRules = selectedRules;
    this.customRules = customRules;
    this.countryGroupNames = [];
    this.manualGroupName = null;
    this.enableClashUI = enableClashUI;
    this.externalController = externalController;
    this.externalUiDownloadUrl = externalUiDownloadUrl;
  }
  /**
   * Check if subscription format is compatible for use as Clash proxy-provider
   * @param {'clash'|'singbox'|'unknown'} format - Detected subscription format
   * @returns {boolean} - True if format is Clash YAML
   */
  isCompatibleProviderFormat(format) {
    return format === "clash";
  }
  /**
   * Generate proxy-providers configuration from collected URLs
   * @returns {object} - proxy-providers object
   */
  generateProxyProviders() {
    const providers = {};
    const existingProviders = this.getExistingProviderNames();
    this.getAutoProviderDescriptors(existingProviders).forEach(({ name, url }) => {
      providers[name] = {
        type: "http",
        url,
        path: `./proxy_providers/${name}.yaml`,
        interval: 3600,
        "health-check": {
          enable: true,
          url: "https://www.gstatic.com/generate_204",
          interval: 300,
          timeout: 5e3,
          lazy: true
        }
      };
    });
    return providers;
  }
  /**
   * Get list of provider names
   * @returns {string[]} - Array of provider names
   */
  getProviderNames() {
    return this.getAutoProviderDescriptors(this.getExistingProviderNames()).map((provider) => provider.name);
  }
  getExistingProviderNames() {
    return this.config?.["proxy-providers"] && typeof this.config["proxy-providers"] === "object" ? Object.keys(this.config["proxy-providers"]) : [];
  }
  /**
   * Get all provider names (user-defined + auto-generated)
   * @returns {string[]} - Array of provider names
   */
  getAllProviderNames() {
    const existingProviders = this.getExistingProviderNames();
    const autoProviders = this.getProviderNames();
    return [.../* @__PURE__ */ new Set([...existingProviders, ...autoProviders])];
  }
  getProxies() {
    return this.config.proxies || [];
  }
  getProxyName(proxy) {
    return proxy.name;
  }
  convertProxy(proxy) {
    switch (proxy.type) {
      case "shadowsocks":
        return {
          name: proxy.tag,
          type: "ss",
          server: proxy.server,
          port: proxy.server_port,
          cipher: proxy.method,
          password: proxy.password,
          udp: getClashUdpValue(proxy),
          ...proxy.plugin ? { plugin: proxy.plugin } : {},
          ...proxy.plugin_opts ? { "plugin-opts": proxy.plugin_opts } : {}
        };
      case "vmess":
        return {
          name: proxy.tag,
          type: proxy.type,
          server: proxy.server,
          port: proxy.server_port,
          uuid: proxy.uuid,
          alterId: proxy.alter_id ?? 0,
          cipher: proxy.security,
          tls: proxy.tls?.enabled || false,
          servername: proxy.tls?.server_name || "",
          "skip-cert-verify": !!proxy.tls?.insecure,
          network: proxy.transport?.type || proxy.network || "tcp",
          "ws-opts": proxy.transport?.type === "ws" ? {
            path: proxy.transport.path,
            headers: proxy.transport.headers
          } : void 0,
          "http-opts": proxy.transport?.type === "http" ? (() => {
            const opts = {
              method: proxy.transport.method || "GET",
              path: Array.isArray(proxy.transport.path) ? proxy.transport.path : [proxy.transport.path || "/"]
            };
            if (proxy.transport.headers && Object.keys(proxy.transport.headers).length > 0) {
              opts.headers = proxy.transport.headers;
            }
            return opts;
          })() : void 0,
          "grpc-opts": proxy.transport?.type === "grpc" ? {
            "grpc-service-name": proxy.transport.service_name
          } : void 0,
          "h2-opts": proxy.transport?.type === "h2" ? {
            path: proxy.transport.path,
            host: proxy.transport.host
          } : void 0,
          udp: getClashUdpValue(proxy)
        };
      case "vless":
        return {
          name: proxy.tag,
          type: proxy.type,
          server: proxy.server,
          port: proxy.server_port,
          uuid: proxy.uuid,
          cipher: proxy.security,
          tls: proxy.tls?.enabled || false,
          "client-fingerprint": proxy.tls?.utls?.fingerprint,
          servername: proxy.tls?.server_name || "",
          network: proxy.transport?.type || "tcp",
          "ws-opts": proxy.transport?.type === "ws" ? {
            path: proxy.transport.path,
            headers: proxy.transport.headers
          } : void 0,
          "reality-opts": proxy.tls?.reality?.enabled ? {
            "public-key": proxy.tls.reality.public_key,
            "short-id": proxy.tls.reality.short_id
          } : void 0,
          "grpc-opts": proxy.transport?.type === "grpc" ? {
            "grpc-service-name": proxy.transport.service_name
          } : void 0,
          tfo: proxy.tcp_fast_open,
          "skip-cert-verify": !!proxy.tls?.insecure,
          udp: getClashUdpValue(proxy),
          ...proxy.alpn ? { alpn: proxy.alpn } : {},
          ...proxy.packet_encoding ? { "packet-encoding": proxy.packet_encoding } : {},
          "flow": proxy.flow ?? void 0
        };
      case "hysteria2":
        return {
          name: proxy.tag,
          type: proxy.type,
          server: proxy.server,
          port: proxy.server_port,
          ...proxy.ports ? { ports: proxy.ports } : {},
          obfs: proxy.obfs?.type,
          "obfs-password": proxy.obfs?.password,
          password: proxy.password,
          auth: proxy.auth,
          up: proxy.up,
          down: proxy.down,
          "recv-window-conn": proxy.recv_window_conn,
          sni: proxy.tls?.server_name || "",
          "skip-cert-verify": !!proxy.tls?.insecure,
          ...proxy.hop_interval !== void 0 ? { "hop-interval": proxy.hop_interval } : {},
          ...proxy.alpn ? { alpn: proxy.alpn } : {},
          ...proxy.fast_open !== void 0 ? { "fast-open": proxy.fast_open } : {}
        };
      case "trojan":
        return {
          name: proxy.tag,
          type: proxy.type,
          server: proxy.server,
          port: proxy.server_port,
          password: proxy.password,
          cipher: proxy.security,
          tls: proxy.tls?.enabled || false,
          "client-fingerprint": proxy.tls?.utls?.fingerprint,
          sni: proxy.tls?.server_name || "",
          network: proxy.transport?.type || "tcp",
          "ws-opts": proxy.transport?.type === "ws" ? {
            path: proxy.transport.path,
            headers: proxy.transport.headers
          } : void 0,
          "reality-opts": proxy.tls?.reality?.enabled ? {
            "public-key": proxy.tls.reality.public_key,
            "short-id": proxy.tls.reality.short_id
          } : void 0,
          "grpc-opts": proxy.transport?.type === "grpc" ? {
            "grpc-service-name": proxy.transport.service_name
          } : void 0,
          tfo: proxy.tcp_fast_open,
          "skip-cert-verify": !!proxy.tls?.insecure,
          ...proxy.alpn ? { alpn: proxy.alpn } : {},
          "flow": proxy.flow ?? void 0,
          udp: getClashUdpValue(proxy)
        };
      case "tuic":
        return {
          name: proxy.tag,
          type: proxy.type,
          server: proxy.server,
          port: proxy.server_port,
          uuid: proxy.uuid,
          password: proxy.password,
          "congestion-controller": proxy.congestion_control,
          "skip-cert-verify": !!proxy.tls?.insecure,
          ...proxy.disable_sni !== void 0 ? { "disable-sni": proxy.disable_sni } : {},
          ...proxy.tls?.alpn ? { alpn: proxy.tls.alpn } : {},
          "sni": proxy.tls?.server_name,
          "udp-relay-mode": proxy.udp_relay_mode || "native",
          ...proxy.zero_rtt !== void 0 ? { "zero-rtt": proxy.zero_rtt } : {},
          ...proxy.reduce_rtt !== void 0 ? { "reduce-rtt": proxy.reduce_rtt } : {},
          ...proxy.fast_open !== void 0 ? { "fast-open": proxy.fast_open } : {}
        };
      case "anytls":
        return {
          name: proxy.tag,
          type: "anytls",
          server: proxy.server,
          port: proxy.server_port,
          password: proxy.password,
          udp: getClashUdpValue(proxy),
          ...proxy.tls?.utls?.fingerprint ? { "client-fingerprint": proxy.tls.utls.fingerprint } : {},
          ...proxy.tls?.server_name ? { sni: proxy.tls.server_name } : {},
          ...proxy.tls?.insecure !== void 0 ? { "skip-cert-verify": !!proxy.tls.insecure } : {},
          ...proxy.tls?.alpn ? { alpn: proxy.tls.alpn } : {},
          ...proxy["idle-session-check-interval"] !== void 0 ? { "idle-session-check-interval": proxy["idle-session-check-interval"] } : {},
          ...proxy["idle-session-timeout"] !== void 0 ? { "idle-session-timeout": proxy["idle-session-timeout"] } : {},
          ...proxy["min-idle-session"] !== void 0 ? { "min-idle-session": proxy["min-idle-session"] } : {}
        };
      default:
        return proxy;
    }
  }
  addProxyToConfig(proxy) {
    this.config.proxies = this.config.proxies || [];
    addProxyWithDedup(this.config.proxies, proxy, {
      getName: (item) => item?.name,
      setName: (item, name) => {
        if (item) item.name = name;
      },
      isSame: (a = {}, b = {}) => {
        const { name: _name, ...restOfProxy } = b;
        const { name: __name, ...restOfExisting } = a;
        return JSON.stringify(restOfProxy) === JSON.stringify(restOfExisting);
      }
    });
  }
  hasProxyGroup(name) {
    const target = normalizeGroupName(name);
    return (this.config["proxy-groups"] || []).some((group) => group && normalizeGroupName(group.name) === target);
  }
  hasSelectableSources(proxyList = []) {
    return uniqueNames(proxyList).length > 0 || this.getAllProviderNames().length > 0;
  }
  shouldIncludeAutoSelectGroup(proxyList = []) {
    return this.includeAutoSelect && this.hasSelectableSources(proxyList);
  }
  addAutoSelectGroup(proxyList) {
    if (!this.includeAutoSelect) return;
    this.config["proxy-groups"] = this.config["proxy-groups"] || [];
    const autoName = this.t("outboundNames.Auto Select");
    if (this.hasProxyGroup(autoName)) return;
    const providerNames = this.getAllProviderNames();
    if (uniqueNames(proxyList).length === 0 && providerNames.length === 0) return;
    const group = {
      name: autoName,
      type: "url-test",
      proxies: deepCopy(uniqueNames(proxyList)),
      url: "https://www.gstatic.com/generate_204",
      interval: 300,
      lazy: false
    };
    if (providerNames.length > 0) {
      group.use = providerNames;
    }
    this.config["proxy-groups"].push(group);
  }
  addNodeSelectGroup(proxyList) {
    this.config["proxy-groups"] = this.config["proxy-groups"] || [];
    const nodeName = this.t("outboundNames.Node Select");
    if (this.hasProxyGroup(nodeName)) return;
    const list = buildNodeSelectMembers({
      proxyList,
      translator: this.t,
      groupByCountry: this.groupByCountry,
      manualGroupName: this.manualGroupName,
      countryGroupNames: this.countryGroupNames,
      includeAutoSelect: this.shouldIncludeAutoSelectGroup(proxyList)
    });
    const group = {
      type: "select",
      name: nodeName,
      proxies: list
    };
    const providerNames = this.getAllProviderNames();
    if (providerNames.length > 0) {
      group.use = providerNames;
    }
    this.config["proxy-groups"].unshift(group);
  }
  buildSelectGroupMembers(proxyList = []) {
    return buildSelectorMembers({
      proxyList,
      translator: this.t,
      groupByCountry: this.groupByCountry,
      manualGroupName: this.manualGroupName,
      countryGroupNames: this.countryGroupNames,
      includeAutoSelect: this.shouldIncludeAutoSelectGroup(proxyList)
    });
  }
  addOutboundGroups(outbounds, proxyList) {
    outbounds.forEach((outbound) => {
      if (outbound !== this.t("outboundNames.Node Select")) {
        const name = this.t(`outboundNames.${outbound}`);
        if (!this.hasProxyGroup(name)) {
          let proxies = this.buildSelectGroupMembers(proxyList);
          if (DIRECT_DEFAULT_RULES.has(outbound)) {
            proxies = ["DIRECT", ...proxies.filter((p) => p !== "DIRECT")];
          }
          const group = {
            type: "select",
            name,
            proxies
          };
          const providerNames = this.getAllProviderNames();
          if (providerNames.length > 0) {
            group.use = providerNames;
          }
          this.config["proxy-groups"].push(group);
        }
      }
    });
  }
  addCustomRuleGroups(proxyList) {
    if (Array.isArray(this.customRules)) {
      this.customRules.forEach((rule) => {
        const name = this.t(`outboundNames.${rule.name}`);
        if (!this.hasProxyGroup(name)) {
          const proxies = buildCustomRuleMembers({
            proxyList,
            translator: this.t,
            manualGroupName: this.manualGroupName,
            includeAutoSelect: this.shouldIncludeAutoSelectGroup(proxyList)
          });
          const group = {
            type: "select",
            name,
            proxies
          };
          const providerNames = this.getAllProviderNames();
          if (providerNames.length > 0) {
            group.use = providerNames;
          }
          this.config["proxy-groups"].push(group);
        }
      });
    }
  }
  addFallBackGroup(proxyList) {
    const name = this.t("outboundNames.Fall Back");
    if (this.hasProxyGroup(name)) return;
    const proxies = this.buildSelectGroupMembers(proxyList);
    const group = {
      type: "select",
      name,
      proxies
    };
    const providerNames = this.getAllProviderNames();
    if (providerNames.length > 0) {
      group.use = providerNames;
    }
    this.config["proxy-groups"].push(group);
  }
  addCountryGroups() {
    const proxies = this.getProxies();
    const countryGroups = groupProxiesByCountry(proxies, {
      getName: (proxy) => this.getProxyName(proxy)
    });
    const existingNames = new Set((this.config["proxy-groups"] || []).map((g) => normalizeGroupName(g?.name)).filter(Boolean));
    const manualProxyNames = proxies.map((p) => p?.name).filter(Boolean);
    const manualGroupName = manualProxyNames.length > 0 ? this.t("outboundNames.Manual Switch") : null;
    if (manualGroupName) {
      const manualNorm = normalizeGroupName(manualGroupName);
      if (!existingNames.has(manualNorm)) {
        const group = {
          name: manualGroupName,
          type: "select",
          proxies: manualProxyNames
        };
        const providerNames = this.getAllProviderNames();
        if (providerNames.length > 0) {
          group.use = providerNames;
        }
        this.config["proxy-groups"].push(group);
        existingNames.add(manualNorm);
      }
    }
    const countries = Object.keys(countryGroups).sort((a, b) => a.localeCompare(b));
    const countryGroupNames = [];
    countries.forEach((country) => {
      const { emoji, name, proxies: proxies2 } = countryGroups[country];
      const groupName = `${emoji} ${name}`;
      const norm = normalizeGroupName(groupName);
      if (!existingNames.has(norm)) {
        const group = {
          name: groupName,
          type: "url-test",
          proxies: proxies2,
          url: "https://www.gstatic.com/generate_204",
          interval: 300,
          lazy: false
        };
        const providerNames = this.getAllProviderNames();
        if (providerNames.length > 0) {
          group.use = providerNames;
        }
        this.config["proxy-groups"].push(group);
        existingNames.add(norm);
      }
      countryGroupNames.push(groupName);
    });
    const nodeSelectGroup = this.config["proxy-groups"].find((g) => g && g.name === this.t("outboundNames.Node Select"));
    if (nodeSelectGroup && Array.isArray(nodeSelectGroup.proxies)) {
      const rebuilt = buildNodeSelectMembers({
        proxyList: [],
        translator: this.t,
        groupByCountry: true,
        manualGroupName,
        countryGroupNames,
        includeAutoSelect: this.shouldIncludeAutoSelectGroup(this.getProxyList())
      });
      nodeSelectGroup.proxies = rebuilt;
    }
    this.countryGroupNames = countryGroupNames;
    this.manualGroupName = manualGroupName;
  }
  /**
   * Merge user-defined proxy groups with system-generated ones
   * Handles same-name groups by merging proxies/use fields and preserving user settings
   * @param {Array} userGroups - User-defined proxy groups from input config
   */
  mergeUserProxyGroups(userGroups) {
    if (!Array.isArray(userGroups)) return;
    const proxyList = this.getProxyList();
    const allProviderNames = new Set(this.getAllProviderNames());
    const groupNames = new Set(
      (this.config["proxy-groups"] || []).map((g) => normalizeGroupName(g?.name)).filter(Boolean)
    );
    const validRefs = /* @__PURE__ */ new Set(["DIRECT", "REJECT"]);
    proxyList.forEach((n) => validRefs.add(n));
    groupNames.forEach((n) => validRefs.add(n));
    userGroups.forEach((userGroup) => {
      if (!userGroup?.name) return;
      const existingIndex = findGroupIndexByName(
        this.config["proxy-groups"],
        userGroup.name
      );
      if (existingIndex >= 0) {
        const existing = this.config["proxy-groups"][existingIndex];
        if (Array.isArray(userGroup.use) && userGroup.use.length > 0) {
          const validUserProviders = userGroup.use.filter((p) => allProviderNames.has(p));
          existing.use = [.../* @__PURE__ */ new Set([
            ...existing.use || [],
            ...validUserProviders
          ])];
        }
        if (Array.isArray(userGroup.proxies)) {
          const validUserProxies = userGroup.proxies.filter((p) => validRefs.has(p));
          existing.proxies = [.../* @__PURE__ */ new Set([
            ...existing.proxies || [],
            ...validUserProxies
          ])];
        }
        if (userGroup.url) existing.url = userGroup.url;
        if (typeof userGroup.interval === "number") existing.interval = userGroup.interval;
        if (typeof userGroup.lazy === "boolean") existing.lazy = userGroup.lazy;
      } else {
        const newGroup = { ...userGroup };
        if (Array.isArray(newGroup.proxies)) {
          newGroup.proxies = newGroup.proxies.filter((p) => validRefs.has(p));
        }
        if (Array.isArray(newGroup.use)) {
          newGroup.use = newGroup.use.filter((p) => allProviderNames.has(p));
        }
        if (newGroup.proxies?.length > 0 || newGroup.use?.length > 0 || newGroup.type) {
          this.config["proxy-groups"].push(newGroup);
        }
      }
    });
  }
  /**
   * Reject invalid proxy groups before final output.
   * Why: empty groups make Clash reject the whole config, so we should fail fast
   * instead of masking the upstream merge/parsing problem.
   */
  validateProxyGroups() {
    (this.config["proxy-groups"] || []).forEach((group) => {
      const requiresMembers = group?.type === "url-test" || group?.type === "fallback";
      if (!requiresMembers) {
        return;
      }
      const hasProxyRefs = Array.isArray(group.proxies) && group.proxies.length > 0;
      const hasProviderRefs = Array.isArray(group.use) && group.use.length > 0;
      if (hasProxyRefs || hasProviderRefs) {
        return;
      }
      const groupName = group?.name || "(unnamed group)";
      throw new InvalidConfigError(
        `Invalid proxy group "${groupName}": type "${group.type}" requires at least one proxy or provider reference`
      );
    });
  }
  // 生成规则
  generateRules() {
    return generateRules(this.selectedRules, this.customRules);
  }
  formatConfig() {
    const rules = this.generateRules();
    const useMrs = supportsMrsFormat(this.userAgent);
    const { site_rule_providers, ip_rule_providers } = generateClashRuleSets(this.selectedRules, this.customRules, useMrs);
    this.config["rule-providers"] = {
      ...site_rule_providers,
      ...ip_rule_providers
    };
    const ruleResults = emitClashRules(rules, this.t);
    if (this.providerUrls.length > 0) {
      this.config["proxy-providers"] = {
        ...this.config["proxy-providers"],
        ...this.generateProxyProviders()
      };
    }
    sanitizeClashProxyGroups(this.config);
    this.validateProxyGroups();
    this.config.rules = [
      ...ruleResults,
      `MATCH,${this.t("outboundNames.Fall Back")}`
    ];
    if (this.enableClashUI || this.externalController || this.externalUiDownloadUrl) {
      const defaultController = "0.0.0.0:9090";
      const defaultUiPath = "./ui";
      const defaultUiName = "zashboard";
      const defaultUiUrl = "https://gh-proxy.com/https://github.com/Zephyruso/zashboard/archive/refs/heads/gh-pages.zip";
      const defaultSecret = "";
      const controller = this.externalController || this.config["external-controller"] || defaultController;
      const uiPath = this.config["external-ui"] || defaultUiPath;
      const uiName = this.config["external-ui-name"] || defaultUiName;
      const uiUrl = this.externalUiDownloadUrl || this.config["external-ui-url"] || defaultUiUrl;
      const secret = this.config["secret"] ?? defaultSecret;
      this.config["external-controller"] = controller;
      this.config["external-ui"] = uiPath;
      this.config["external-ui-name"] = uiName;
      this.config["external-ui-url"] = uiUrl;
      this.config["secret"] = secret;
    }
    return yaml.dump(this.config);
  }
};

// src/builders/SurgeConfigBuilder.js
init_utils();
var SurgeConfigBuilder = class extends BaseConfigBuilder {
  constructor(inputString, selectedRules, customRules, baseConfig, lang, userAgent, groupByCountry, includeAutoSelect = true) {
    const resolvedBaseConfig = baseConfig ?? SURGE_CONFIG;
    super(inputString, resolvedBaseConfig, lang, userAgent, groupByCountry, includeAutoSelect);
    this.selectedRules = selectedRules;
    this.customRules = customRules;
    this.subscriptionUrl = null;
    this.countryGroupNames = [];
    this.manualGroupName = null;
  }
  setSubscriptionUrl(url) {
    this.subscriptionUrl = url;
    return this;
  }
  getProxies() {
    return this.config.proxies || [];
  }
  /**
   * Get only valid proxies (filter out comment lines for unsupported types)
   * @returns {string[]} Array of valid proxy strings (excluding comments)
   */
  getValidProxies() {
    return this.getProxies().filter(
      (proxy) => typeof proxy === "string" && !proxy.trimStart().startsWith("#")
    );
  }
  /**
   * Override getProxyList to exclude unsupported proxy comments from groups
   * Fixes issue #299: comment strings were incorrectly added to proxy groups
   */
  getProxyList() {
    return this.getValidProxies().map((proxy) => this.getProxyName(proxy));
  }
  getProxyName(proxy) {
    return proxy.split("=")[0].trim();
  }
  convertProxy(proxy) {
    let surgeProxy;
    switch (proxy.type) {
      case "shadowsocks":
        surgeProxy = `${proxy.tag} = ss, ${proxy.server}, ${proxy.server_port}, encrypt-method=${proxy.method}, password=${proxy.password}`;
        break;
      case "vmess":
        surgeProxy = `${proxy.tag} = vmess, ${proxy.server}, ${proxy.server_port}, username=${proxy.uuid}`;
        if (proxy.alter_id == 0) {
          surgeProxy += ", vmess-aead=true";
        }
        if (proxy.tls?.enabled) {
          surgeProxy += ", tls=true";
          if (proxy.tls.server_name) {
            surgeProxy += `, sni=${proxy.tls.server_name}`;
          }
          if (proxy.tls.insecure) {
            surgeProxy += ", skip-cert-verify=true";
          }
          if (proxy.tls.alpn) {
            surgeProxy += `, alpn=${proxy.tls.alpn.join(",")}`;
          }
        }
        if (proxy.transport?.type === "ws") {
          surgeProxy += `, ws=true, ws-path=${proxy.transport.path}`;
          if (proxy.transport.headers) {
            surgeProxy += `, ws-headers=Host:${proxy.transport.headers.host}`;
          }
        } else if (proxy.transport?.type === "grpc") {
          surgeProxy += `, grpc-service-name=${proxy.transport.service_name}`;
        }
        break;
      case "trojan":
        surgeProxy = `${proxy.tag} = trojan, ${proxy.server}, ${proxy.server_port}, password=${proxy.password}`;
        if (proxy.tls?.server_name) {
          surgeProxy += `, sni=${proxy.tls.server_name}`;
        }
        if (proxy.tls?.insecure) {
          surgeProxy += ", skip-cert-verify=true";
        }
        if (proxy.tls?.alpn) {
          surgeProxy += `, alpn=${proxy.tls.alpn.join(",")}`;
        }
        if (proxy.transport?.type === "ws") {
          surgeProxy += `, ws=true, ws-path=${proxy.transport.path}`;
          if (proxy.transport.headers) {
            surgeProxy += `, ws-headers=Host:${proxy.transport.headers.host}`;
          }
        } else if (proxy.transport?.type === "grpc") {
          surgeProxy += `, grpc-service-name=${proxy.transport.service_name}`;
        }
        break;
      case "hysteria2":
        surgeProxy = `${proxy.tag} = hysteria2, ${proxy.server}, ${proxy.server_port}, password=${proxy.password}`;
        if (proxy.tls?.server_name) {
          surgeProxy += `, sni=${proxy.tls.server_name}`;
        }
        if (proxy.tls?.insecure) {
          surgeProxy += ", skip-cert-verify=true";
        }
        if (proxy.tls?.alpn) {
          surgeProxy += `, alpn=${proxy.tls.alpn.join(",")}`;
        }
        break;
      case "tuic":
        surgeProxy = `${proxy.tag} = tuic, ${proxy.server}, ${proxy.server_port}, password=${proxy.password}, uuid=${proxy.uuid}`;
        if (proxy.tls?.server_name) {
          surgeProxy += `, sni=${proxy.tls.server_name}`;
        }
        if (proxy.tls?.alpn) {
          surgeProxy += `, alpn=${proxy.tls.alpn.join(",")}`;
        }
        if (proxy.tls?.insecure) {
          surgeProxy += ", skip-cert-verify=true";
        }
        if (proxy.congestion_control) {
          surgeProxy += `, congestion-controller=${proxy.congestion_control}`;
        }
        if (proxy.udp_relay_mode) {
          surgeProxy += `, udp-relay-mode=${proxy.udp_relay_mode}`;
        }
        break;
      default:
        surgeProxy = `# ${proxy.tag} - Unsupported proxy type: ${proxy.type}`;
    }
    return surgeProxy;
  }
  addProxyToConfig(proxy) {
    this.config.proxies = this.config.proxies || [];
    addProxyWithDedup(this.config.proxies, proxy, {
      getName: (item) => this.getProxyName(item),
      setName: (value, name) => {
        const equalsPos = typeof value === "string" ? value.indexOf("=") : -1;
        if (equalsPos > 0) {
          return `${name}${value.substring(equalsPos)}`;
        }
        return value;
      },
      isSame: (existing, incoming) => {
        if (typeof existing !== "string" || typeof incoming !== "string") return false;
        const existingSuffix = existing.substring(existing.indexOf("="));
        const incomingSuffix = incoming.substring(incoming.indexOf("="));
        return existingSuffix === incomingSuffix;
      }
    });
  }
  hasProxyGroup(name) {
    const target = typeof name === "string" ? name.trim() : name;
    if (!target) return false;
    return (this.config["proxy-groups"] || []).some((group) => {
      let existing;
      if (typeof group === "string") {
        existing = this.getProxyName(group)?.trim();
      } else if (group && typeof group === "object") {
        existing = (group.name || "").trim();
      }
      return existing === target;
    });
  }
  /**
   * Get group name from either string or object format
   * @param {string|object} group - Surge string or Clash object format group
   * @returns {string|undefined}
   */
  getGroupName(group) {
    if (typeof group === "string") {
      return this.getProxyName(group);
    } else if (group && typeof group === "object") {
      return group.name;
    }
    return void 0;
  }
  /**
   * Convert Clash object-format proxy-group to Surge string format
   * @param {object} group - Clash format group {name, type, proxies, url?, interval?}
   * @returns {string} - Surge format string like "Name = type, proxy1, proxy2, url=..., interval=..."
   */
  convertObjectGroupToSurgeString(group) {
    if (!group || !group.name || !group.type) {
      return null;
    }
    const name = group.name;
    const type2 = group.type === "url-test" ? "url-test" : "select";
    const proxies = Array.isArray(group.proxies) ? group.proxies : [];
    let result = `${name} = ${type2}`;
    if (proxies.length > 0) {
      result += `, ${proxies.join(", ")}`;
    }
    if (type2 === "url-test") {
      if (group.url) {
        result += `, url=${group.url}`;
      } else {
        result += ", url=http://www.gstatic.com/generate_204";
      }
      if (group.interval) {
        result += `, interval=${group.interval}`;
      } else {
        result += ", interval=300";
      }
    }
    return result;
  }
  createProxyGroup(name, type2, options = [], extraConfig = "") {
    const sanitized = this.sanitizeOptions(options);
    const optionsPart = sanitized.length > 0 ? `, ${sanitized.join(", ")}` : "";
    return `${name} = ${type2}${optionsPart}${extraConfig}`;
  }
  sanitizeOptions(options = []) {
    return uniqueNames(options);
  }
  buildNodeSelectOptions(proxyList = []) {
    return buildNodeSelectMembers({
      proxyList,
      translator: this.t,
      groupByCountry: false,
      manualGroupName: this.manualGroupName,
      countryGroupNames: this.countryGroupNames,
      includeAutoSelect: this.includeAutoSelect
    });
  }
  buildAggregatedOptions(proxyList = []) {
    return buildSelectorMembers({
      proxyList,
      translator: this.t,
      groupByCountry: this.groupByCountry,
      manualGroupName: this.manualGroupName,
      countryGroupNames: this.countryGroupNames,
      includeAutoSelect: this.includeAutoSelect
    });
  }
  addAutoSelectGroup(proxyList) {
    if (!this.includeAutoSelect) return;
    this.config["proxy-groups"] = this.config["proxy-groups"] || [];
    const name = this.t("outboundNames.Auto Select");
    if (this.hasProxyGroup(name)) return;
    this.config["proxy-groups"].push(
      this.createProxyGroup(
        name,
        "url-test",
        this.sanitizeOptions(proxyList),
        ", url=http://www.gstatic.com/generate_204, interval=300"
      )
    );
  }
  addNodeSelectGroup(proxyList) {
    const options = this.buildNodeSelectOptions(proxyList);
    if (this.hasProxyGroup(this.t("outboundNames.Node Select"))) return;
    this.config["proxy-groups"].push(
      this.createProxyGroup(this.t("outboundNames.Node Select"), "select", options)
    );
  }
  addOutboundGroups(outbounds, proxyList) {
    outbounds.forEach((outbound) => {
      if (outbound !== this.t("outboundNames.Node Select")) {
        let options = this.buildAggregatedOptions(proxyList);
        const name = this.t(`outboundNames.${outbound}`);
        if (this.hasProxyGroup(name)) {
          return;
        }
        if (DIRECT_DEFAULT_RULES.has(outbound)) {
          options = ["DIRECT", ...options.filter((p) => p !== "DIRECT")];
        }
        this.config["proxy-groups"].push(
          this.createProxyGroup(name, "select", options)
        );
      }
    });
  }
  addCustomRuleGroups(proxyList) {
    if (Array.isArray(this.customRules)) {
      this.customRules.forEach((rule) => {
        if (this.hasProxyGroup(rule.name)) return;
        const options = buildCustomRuleMembers({
          proxyList,
          translator: this.t,
          manualGroupName: this.manualGroupName,
          includeAutoSelect: this.includeAutoSelect
        });
        this.config["proxy-groups"].push(
          this.createProxyGroup(rule.name, "select", options)
        );
      });
    }
  }
  addFallBackGroup(proxyList) {
    const options = this.buildAggregatedOptions(proxyList);
    if (this.hasProxyGroup(this.t("outboundNames.Fall Back"))) return;
    this.config["proxy-groups"].push(
      this.createProxyGroup(this.t("outboundNames.Fall Back"), "select", options)
    );
  }
  addCountryGroups() {
    const proxies = this.getValidProxies();
    const countryGroups = groupProxiesByCountry(proxies, {
      getName: (proxy) => this.getProxyName(proxy)
    });
    const existing = new Set((this.config["proxy-groups"] || []).map((g) => this.getGroupName(g)?.trim()).filter(Boolean));
    const manualProxyNames = proxies.map((p) => this.getProxyName(p)).filter(Boolean);
    const manualGroupName = manualProxyNames.length > 0 ? this.t("outboundNames.Manual Switch") : null;
    if (manualGroupName) {
      const manualNorm = manualGroupName.trim();
      if (!existing.has(manualNorm)) {
        this.config["proxy-groups"].push(
          this.createProxyGroup(manualGroupName, "select", this.sanitizeOptions(manualProxyNames))
        );
        existing.add(manualNorm);
      }
    }
    const countryGroupNames = [];
    const countries = Object.keys(countryGroups).sort((a, b) => a.localeCompare(b));
    countries.forEach((country) => {
      const { emoji, name, proxies: proxies2 } = countryGroups[country];
      const groupName = `${emoji} ${name}`;
      countryGroupNames.push(groupName);
      if (!existing.has(groupName.trim())) {
        this.config["proxy-groups"].push(
          this.createProxyGroup(groupName, "url-test", proxies2, ", url=https://www.gstatic.com/generate_204, interval=300")
        );
        existing.add(groupName.trim());
      }
    });
    const nodeSelectGroupIndex = this.config["proxy-groups"].findIndex((g) => this.getGroupName(g) === this.t("outboundNames.Node Select"));
    if (nodeSelectGroupIndex > -1) {
      const newOptions = buildNodeSelectMembers({
        proxyList: [],
        translator: this.t,
        groupByCountry: true,
        manualGroupName,
        countryGroupNames,
        includeAutoSelect: this.includeAutoSelect
      });
      const newGroup = this.createProxyGroup(this.t("outboundNames.Node Select"), "select", newOptions);
      this.config["proxy-groups"][nodeSelectGroupIndex] = newGroup;
    }
    this.countryGroupNames = countryGroupNames;
    this.manualGroupName = manualGroupName;
  }
  formatConfig() {
    const rules = generateRules(this.selectedRules, this.customRules);
    let finalConfig = [];
    if (this.subscriptionUrl) {
      finalConfig.push(`#!MANAGED-CONFIG ${this.subscriptionUrl} interval=43200 strict=false`);
      finalConfig.push("");
    }
    finalConfig.push("[General]");
    if (this.config.general) {
      Object.entries(this.config.general).forEach(([key, value]) => {
        finalConfig.push(`${key} = ${value}`);
      });
    }
    if (this.config.replica) {
      finalConfig.push("\n[Replica]");
      Object.entries(this.config.replica).forEach(([key, value]) => {
        finalConfig.push(`${key} = ${value}`);
      });
    }
    finalConfig.push("\n[Proxy]");
    finalConfig.push("DIRECT = direct");
    if (this.config.proxies) {
      finalConfig.push(...this.config.proxies);
    }
    finalConfig.push("\n[Proxy Group]");
    if (this.config["proxy-groups"]) {
      const groupStrings = this.config["proxy-groups"].map((group) => {
        if (typeof group === "string") {
          return group;
        } else if (group && typeof group === "object") {
          return this.convertObjectGroupToSurgeString(group);
        }
        return null;
      }).filter((g) => g != null);
      finalConfig.push(...groupStrings);
    }
    finalConfig.push("\n[Rule]");
    rules.filter((rule) => Array.isArray(rule.src_ip_cidr) && rule.src_ip_cidr.length > 0).map((rule) => {
      rule.src_ip_cidr.forEach((cidr) => {
        const value = typeof cidr === "string" ? cidr.trim() : cidr;
        if (!value) return;
        const safeValue = typeof value === "string" ? value.replace(/[\r\n]+/g, "").trim() : value;
        if (!safeValue) return;
        if (typeof safeValue === "string" && safeValue.endsWith("/32")) {
          finalConfig.push(`SRC-IP,${safeValue.slice(0, -3)},${this.t("outboundNames." + rule.outbound)}`);
        } else if (typeof safeValue === "string" && !safeValue.includes("/")) {
          finalConfig.push(`SRC-IP,${safeValue},${this.t("outboundNames." + rule.outbound)}`);
        } else if (typeof safeValue === "string" && safeValue.includes("/")) {
          finalConfig.push(`# SRC-IP-CIDR not supported by Surge, skipped: ${safeValue}`);
        }
      });
    });
    rules.filter((rule) => !!rule.domain_suffix).map((rule) => {
      rule.domain_suffix.forEach((suffix) => {
        finalConfig.push(`DOMAIN-SUFFIX,${suffix},${this.t("outboundNames." + rule.outbound)}`);
      });
    });
    rules.filter((rule) => !!rule.domain_keyword).map((rule) => {
      rule.domain_keyword.forEach((keyword) => {
        finalConfig.push(`DOMAIN-KEYWORD,${keyword},${this.t("outboundNames." + rule.outbound)}`);
      });
    });
    rules.filter((rule) => rule.site_rules[0] !== "").map((rule) => {
      rule.site_rules.forEach((site) => {
        finalConfig.push(`RULE-SET,${SURGE_SITE_RULE_SET_BASEURL}${site}.conf,${this.t("outboundNames." + rule.outbound)}`);
      });
    });
    rules.filter((rule) => rule.ip_rules[0] !== "").map((rule) => {
      rule.ip_rules.forEach((ip) => {
        finalConfig.push(`RULE-SET,${SURGE_IP_RULE_SET_BASEURL}${ip}.txt,${this.t("outboundNames." + rule.outbound)},no-resolve`);
      });
    });
    rules.filter((rule) => !!rule.ip_cidr).map((rule) => {
      rule.ip_cidr.forEach((cidr) => {
        finalConfig.push(`IP-CIDR,${cidr},${this.t("outboundNames." + rule.outbound)},no-resolve`);
      });
    });
    finalConfig.push("FINAL," + this.t("outboundNames.Fall Back"));
    return finalConfig.join("\n");
  }
  getCurrentUrl() {
    try {
      if (typeof self !== "undefined" && self.location) {
        return self.location.href;
      }
      return null;
    } catch (error) {
      console.error("Error getting current URL:", error);
      return null;
    }
  }
};

// src/app/createApp.jsx
init_utils();

// src/services/shortLinkService.js
init_utils();
var ShortLinkService = class {
  constructor(kv, options = {}) {
    this.kv = kv;
    this.options = options;
  }
  ensureKv() {
    if (!this.kv) {
      throw new MissingDependencyError("Short link service requires a KV store");
    }
    return this.kv;
  }
  async createShortLink(queryString, providedCode) {
    const kv = this.ensureKv();
    const shortCode = providedCode || generateWebPath();
    const ttl = this.options.shortLinkTtlSeconds;
    const putOptions = ttl ? { expirationTtl: ttl } : void 0;
    await kv.put(shortCode, queryString, putOptions);
    return shortCode;
  }
  async resolveShortCode(code) {
    const kv = this.ensureKv();
    return kv.get(code);
  }
};

// src/services/configStorageService.js
init_js_yaml();
init_utils();
var ConfigStorageService = class {
  constructor(kv, options = {}) {
    this.kv = kv;
    this.options = options;
  }
  ensureKv() {
    if (!this.kv) {
      throw new MissingDependencyError("Config storage requires a KV store");
    }
    return this.kv;
  }
  async getConfigById(configId) {
    const kv = this.ensureKv();
    const stored = await kv.get(configId);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      throw new InvalidPayloadError("Stored config is not valid JSON");
    }
  }
  async saveConfig(type2, content) {
    if (!type2) {
      throw new InvalidPayloadError("Missing config type");
    }
    const kv = this.ensureKv();
    const configId = `${type2}_${generateWebPath(8)}`;
    const configString = this.serializeConfig(type2, content);
    JSON.parse(configString);
    const ttlSeconds = this.options.configTtlSeconds;
    const putOptions = ttlSeconds ? { expirationTtl: ttlSeconds } : void 0;
    await kv.put(configId, configString, putOptions);
    return configId;
  }
  serializeConfig(type2, content) {
    if (type2 === "clash") {
      if (typeof content === "string" && (content.trim().startsWith("-") || content.includes(":"))) {
        const yamlConfig = yaml.load(content);
        return JSON.stringify(yamlConfig);
      }
      return typeof content === "object" ? JSON.stringify(content) : content;
    }
    if (typeof content === "object") {
      return JSON.stringify(content);
    }
    if (typeof content === "string") {
      return content;
    }
    throw new InvalidPayloadError("Unsupported config content type");
  }
};

// src/runtime/runtimeConfig.js
var DEFAULTS = {
  configTtlSeconds: 60 * 60 * 24 * 30
};
function normalizeRuntime(runtime = {}) {
  return {
    kv: runtime.kv ?? null,
    assetFetcher: runtime.assetFetcher ?? null,
    logger: runtime.logger ?? console,
    config: {
      configTtlSeconds: runtime.config?.configTtlSeconds ?? DEFAULTS.configTtlSeconds,
      shortLinkTtlSeconds: runtime.config?.shortLinkTtlSeconds ?? null
    }
  };
}

// src/app/createApp.jsx
var DEFAULT_USER_AGENT = "curl/7.74.0";
function createApp(bindings = {}) {
  const runtime = normalizeRuntime(bindings);
  const services = {
    shortLinks: runtime.kv ? new ShortLinkService(runtime.kv, { shortLinkTtlSeconds: runtime.config.shortLinkTtlSeconds }) : null,
    configStorage: runtime.kv ? new ConfigStorageService(runtime.kv, { configTtlSeconds: runtime.config.configTtlSeconds }) : null
  };
  const app = new Hono2();
  app.use("*", async (c, next) => {
    const acceptLanguage = getRequestHeader(c.req, "Accept-Language");
    const lang = c.req.query("lang") || acceptLanguage?.split(",")[0] || "zh-CN";
    c.set("lang", lang);
    c.set("t", createTranslator(lang));
    await next();
  });
  app.get("/", (c) => {
    const t = c.get("t");
    const lang = resolveLanguage(c.get("lang"));
    const subtitle = APP_SUBTITLE[lang] || APP_SUBTITLE["zh-CN"];
    return c.html(
      /* @__PURE__ */ jsxDEV(Layout, { title: t("pageTitle"), description: t("pageDescription"), keywords: t("pageKeywords"), children: /* @__PURE__ */ jsxDEV("div", { class: "flex flex-col min-h-screen", children: [
        /* @__PURE__ */ jsxDEV(Navbar, {}),
        /* @__PURE__ */ jsxDEV("main", { class: "flex-1", children: /* @__PURE__ */ jsxDEV("div", { class: "container mx-auto px-4 py-8 pt-24", children: /* @__PURE__ */ jsxDEV("div", { class: "max-w-4xl mx-auto", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "text-center mb-12 pt-8", children: [
            /* @__PURE__ */ jsxDEV("h1", { class: "text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight", children: APP_NAME }),
            /* @__PURE__ */ jsxDEV("p", { class: "text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto", children: subtitle })
          ] }),
          /* @__PURE__ */ jsxDEV(Form, { t, lang })
        ] }) }) }),
        /* @__PURE__ */ jsxDEV(Footer, {}),
        /* @__PURE__ */ jsxDEV(UpdateChecker, {})
      ] }) })
    );
  });
  app.get("/singbox", async (c) => {
    try {
      const config = c.req.query("config");
      if (!config) {
        return c.text("Missing config parameter", 400);
      }
      const selectedRules = parseSelectedRules(c.req.query("selectedRules"));
      const customRules = parseJsonArray(c.req.query("customRules"));
      const ua = c.req.query("ua") || getRequestHeader(c.req, "User-Agent") || DEFAULT_USER_AGENT;
      const groupByCountry = parseBooleanFlag(c.req.query("group_by_country"));
      const includeAutoSelect = c.req.query("include_auto_select") !== "false";
      const enableClashUI = parseBooleanFlag(c.req.query("enable_clash_ui"));
      const externalController = c.req.query("external_controller");
      const externalUiDownloadUrl = c.req.query("external_ui_download_url");
      const configId = c.req.query("configId");
      const lang = c.get("lang");
      const requestedSingboxVersion = c.req.query("singbox_version") || c.req.query("sb_version") || c.req.query("sb_ver");
      const requestUserAgent = getRequestHeader(c.req, "User-Agent");
      const singboxConfigVersion = resolveSingboxConfigVersion(requestedSingboxVersion, requestUserAgent);
      let baseConfig = singboxConfigVersion === "1.11" ? SING_BOX_CONFIG_V1_11 : SING_BOX_CONFIG;
      if (configId) {
        const storage = requireConfigStorage(services.configStorage);
        const storedConfig = await storage.getConfigById(configId);
        if (storedConfig) {
          baseConfig = storedConfig;
        }
      }
      const builder = new SingboxConfigBuilder(
        config,
        selectedRules,
        customRules,
        baseConfig,
        lang,
        ua,
        groupByCountry,
        enableClashUI,
        externalController,
        externalUiDownloadUrl,
        singboxConfigVersion,
        includeAutoSelect
      );
      await builder.build();
      const userinfo = builder.getSubscriptionUserinfo();
      if (userinfo) {
        c.header("subscription-userinfo", userinfo);
      }
      return c.json(builder.config);
    } catch (error) {
      return handleError(c, error, runtime.logger);
    }
  });
  app.get("/clash", async (c) => {
    try {
      const config = c.req.query("config");
      if (!config) {
        return c.text("Missing config parameter", 400);
      }
      const selectedRules = parseSelectedRules(c.req.query("selectedRules"));
      const customRules = parseJsonArray(c.req.query("customRules"));
      const ua = c.req.query("ua") || getRequestHeader(c.req, "User-Agent") || DEFAULT_USER_AGENT;
      const groupByCountry = parseBooleanFlag(c.req.query("group_by_country"));
      const includeAutoSelect = c.req.query("include_auto_select") !== "false";
      const enableClashUI = parseBooleanFlag(c.req.query("enable_clash_ui"));
      const externalController = c.req.query("external_controller");
      const externalUiDownloadUrl = c.req.query("external_ui_download_url");
      const configId = c.req.query("configId");
      const lang = c.get("lang");
      let baseConfig;
      if (configId) {
        const storage = requireConfigStorage(services.configStorage);
        baseConfig = await storage.getConfigById(configId);
      }
      const builder = new ClashConfigBuilder(
        config,
        selectedRules,
        customRules,
        baseConfig,
        lang,
        ua,
        groupByCountry,
        enableClashUI,
        externalController,
        externalUiDownloadUrl,
        includeAutoSelect
      );
      await builder.build();
      const userinfo = builder.getSubscriptionUserinfo();
      const headers = { "Content-Type": "text/yaml; charset=utf-8" };
      if (userinfo) {
        headers["subscription-userinfo"] = userinfo;
      }
      return c.text(builder.formatConfig(), 200, headers);
    } catch (error) {
      return handleError(c, error, runtime.logger);
    }
  });
  app.get("/surge", async (c) => {
    try {
      const config = c.req.query("config");
      if (!config) {
        return c.text("Missing config parameter", 400);
      }
      const selectedRules = parseSelectedRules(c.req.query("selectedRules"));
      const customRules = parseJsonArray(c.req.query("customRules"));
      const ua = c.req.query("ua") || getRequestHeader(c.req, "User-Agent") || DEFAULT_USER_AGENT;
      const groupByCountry = parseBooleanFlag(c.req.query("group_by_country"));
      const includeAutoSelect = c.req.query("include_auto_select") !== "false";
      const configId = c.req.query("configId");
      const lang = c.get("lang");
      let baseConfig;
      if (configId) {
        const storage = requireConfigStorage(services.configStorage);
        baseConfig = await storage.getConfigById(configId);
      }
      const builder = new SurgeConfigBuilder(
        config,
        selectedRules,
        customRules,
        baseConfig,
        lang,
        ua,
        groupByCountry,
        includeAutoSelect
      );
      builder.setSubscriptionUrl(c.req.url);
      await builder.build();
      const userinfo = builder.getSubscriptionUserinfo();
      if (userinfo) {
        c.header("subscription-userinfo", userinfo);
      }
      return c.text(builder.formatConfig());
    } catch (error) {
      return handleError(c, error, runtime.logger);
    }
  });
  app.get("/subconverter", (c) => {
    try {
      const rawSelectedRules = c.req.query("selectedRules");
      let selectedRules;
      if (!rawSelectedRules) {
        selectedRules = PREDEFINED_RULE_SETS.balanced;
      } else if (PREDEFINED_RULE_SETS[rawSelectedRules]) {
        selectedRules = PREDEFINED_RULE_SETS[rawSelectedRules];
      } else {
        try {
          const parsed = JSON.parse(rawSelectedRules);
          if (Array.isArray(parsed)) {
            selectedRules = parsed;
          } else {
            return c.text("Invalid selectedRules: must be a preset name (minimal, balanced, comprehensive) or a JSON array", 400);
          }
        } catch {
          return c.text(`Invalid selectedRules: "${rawSelectedRules}" is not a valid preset name or JSON array. Valid presets: minimal, balanced, comprehensive`, 400);
        }
      }
      const includeAutoSelect = c.req.query("include_auto_select") !== "false";
      const groupByCountry = parseBooleanFlag(c.req.query("group_by_country"));
      const customRules = parseJsonArray(c.req.query("customRules"));
      const lang = c.get("lang");
      const config = generateSubconverterConfig({
        selectedRules,
        customRules,
        lang,
        includeAutoSelect,
        groupByCountry
      });
      return c.text(config, 200, {
        "Content-Type": "text/plain; charset=utf-8"
      });
    } catch (error) {
      return handleError(c, error, runtime.logger);
    }
  });
  app.get("/xray", async (c) => {
    const inputString = c.req.query("config");
    if (!inputString) {
      return c.text("Missing config parameter", 400);
    }
    const proxylist = inputString.split("\n");
    const finalProxyList = [];
    let subscriptionUserinfo;
    const userAgent = c.req.query("ua") || getRequestHeader(c.req, "User-Agent") || DEFAULT_USER_AGENT;
    const headers = { "User-Agent": userAgent };
    for (const proxy of proxylist) {
      const trimmedProxy = proxy.trim();
      if (!trimmedProxy) continue;
      if (trimmedProxy.startsWith("http://") || trimmedProxy.startsWith("https://")) {
        try {
          const response = await fetch(trimmedProxy, { method: "GET", headers });
          const fetchedUserinfo = response.headers.get("subscription-userinfo");
          if (fetchedUserinfo && subscriptionUserinfo === void 0) {
            subscriptionUserinfo = fetchedUserinfo;
          }
          const text = await response.text();
          let processed = tryDecodeSubscriptionLines(text, { decodeUriComponent: true });
          if (!Array.isArray(processed)) processed = [processed];
          finalProxyList.push(...processed.filter((item) => typeof item === "string" && item.trim() !== ""));
        } catch (e) {
          runtime.logger.warn("Failed to fetch the proxy", e);
        }
      } else {
        let processed = tryDecodeSubscriptionLines(trimmedProxy);
        if (!Array.isArray(processed)) processed = [processed];
        finalProxyList.push(...processed.filter((item) => typeof item === "string" && item.trim() !== ""));
      }
    }
    const finalString = finalProxyList.join("\n");
    if (!finalString) {
      return c.text("Missing config parameter", 400);
    }
    const responseHeaders = {};
    if (subscriptionUserinfo) {
      responseHeaders["subscription-userinfo"] = subscriptionUserinfo;
    }
    return c.text(encodeBase64(finalString), 200, responseHeaders);
  });
  app.get("/shorten-v2", async (c) => {
    try {
      const url = c.req.query("url");
      if (!url) {
        return c.text("Missing URL parameter", 400);
      }
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        return c.text("Invalid URL parameter", 400);
      }
      const queryString = parsedUrl.search;
      const shortLinks = requireShortLinkService(services.shortLinks);
      const code = await shortLinks.createShortLink(queryString, c.req.query("shortCode"));
      return c.text(code);
    } catch (error) {
      return handleError(c, error, runtime.logger);
    }
  });
  const redirectHandler = (prefix) => async (c) => {
    try {
      const code = c.req.param("code");
      const shortLinks = requireShortLinkService(services.shortLinks);
      const originalParam = await shortLinks.resolveShortCode(code);
      if (!originalParam) return c.text("Short URL not found", 404);
      const url = new URL(c.req.url);
      return c.redirect(`${url.origin}/${prefix}${originalParam}`);
    } catch (error) {
      return handleError(c, error, runtime.logger);
    }
  };
  app.get("/s/:code", redirectHandler("surge"));
  app.get("/b/:code", redirectHandler("singbox"));
  app.get("/c/:code", redirectHandler("clash"));
  app.get("/x/:code", redirectHandler("xray"));
  app.post("/config", async (c) => {
    try {
      const { type: type2, content } = await c.req.json();
      const storage = requireConfigStorage(services.configStorage);
      const configId = await storage.saveConfig(type2, content);
      return c.text(configId);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return c.text(`Invalid format: ${error.message}`, 400);
      }
      return handleError(c, error, runtime.logger);
    }
  });
  app.get("/resolve", async (c) => {
    try {
      const shortUrl = c.req.query("url");
      const t = c.get("t");
      if (!shortUrl) return c.text(t("missingUrl"), 400);
      let urlObj;
      try {
        urlObj = new URL(shortUrl);
      } catch {
        return c.text(t("invalidShortUrl"), 400);
      }
      const pathParts = urlObj.pathname.split("/");
      if (pathParts.length < 3) return c.text(t("invalidShortUrl"), 400);
      const prefix = pathParts[1];
      const shortCode = pathParts[2];
      if (!["b", "c", "x", "s"].includes(prefix)) return c.text(t("invalidShortUrl"), 400);
      const shortLinks = requireShortLinkService(services.shortLinks);
      const originalParam = await shortLinks.resolveShortCode(shortCode);
      if (!originalParam) return c.text(t("shortUrlNotFound"), 404);
      const mapping = { b: "singbox", c: "clash", x: "xray", s: "surge" };
      const originalUrl = `${urlObj.origin}/${mapping[prefix]}${originalParam}`;
      return c.json({ originalUrl });
    } catch (error) {
      return handleError(c, error, runtime.logger);
    }
  });
  app.get("/favicon.ico", async (c) => {
    if (!runtime.assetFetcher) {
      return c.notFound();
    }
    try {
      return await runtime.assetFetcher(c.req.raw);
    } catch (error) {
      runtime.logger.warn("Asset fetch failed", error);
      return c.notFound();
    }
  });
  return app;
}
function parseSelectedRules(raw2) {
  if (!raw2) return [];
  if (typeof raw2 === "string" && PREDEFINED_RULE_SETS[raw2]) {
    return PREDEFINED_RULE_SETS[raw2];
  }
  try {
    const parsed = JSON.parse(raw2);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn(`Failed to parse selectedRules: ${raw2}, falling back to minimal`);
    return PREDEFINED_RULE_SETS.minimal;
  }
}
function parseJsonArray(raw2) {
  if (!raw2) return [];
  try {
    const parsed = JSON.parse(raw2);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function parseBooleanFlag(value) {
  return value === "true" || value === true;
}
function parseSemverLike(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const match2 = trimmed.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!match2) {
    return null;
  }
  return {
    major: Number(match2[1]),
    minor: Number(match2[2]),
    patch: match2[3] ? Number(match2[3]) : 0
  };
}
function isSingboxLegacyConfig(version) {
  if (!version || Number.isNaN(version.major) || Number.isNaN(version.minor)) {
    return false;
  }
  if (version.major !== 1) {
    return version.major < 1;
  }
  return version.minor < 12;
}
function resolveSingboxConfigVersion(requestedVersion, userAgent) {
  const normalizedRequested = typeof requestedVersion === "string" ? requestedVersion.trim().toLowerCase() : "";
  if (normalizedRequested && normalizedRequested !== "auto") {
    if (normalizedRequested === "legacy") return "1.11";
    if (normalizedRequested === "latest") return "1.12";
    const parsed = parseSemverLike(normalizedRequested);
    if (parsed) {
      return isSingboxLegacyConfig(parsed) ? "1.11" : "1.12";
    }
  }
  if (typeof userAgent === "string" && userAgent) {
    const uaMatch = userAgent.match(/sing-box\/(\d+\.\d+(?:\.\d+)?)/i) || userAgent.match(/sing-box\s+(\d+\.\d+(?:\.\d+)?)/i);
    const versionString = uaMatch?.[1];
    const parsed = versionString ? parseSemverLike(versionString) : null;
    if (parsed) {
      return isSingboxLegacyConfig(parsed) ? "1.11" : "1.12";
    }
  }
  return "1.12";
}
function getRequestHeader(request, name) {
  if (!request || !name) {
    return void 0;
  }
  try {
    const value = request.header(name);
    if (value !== void 0) {
      return value;
    }
  } catch {
  }
  const headers = request.raw?.headers;
  if (!headers) {
    return void 0;
  }
  if (typeof headers.get === "function") {
    return headers.get(name) ?? headers.get(name.toLowerCase()) ?? void 0;
  }
  if (typeof headers === "object") {
    const lowerName = name.toLowerCase();
    const headerValue = headers[lowerName] ?? headers[name];
    if (Array.isArray(headerValue)) {
      return headerValue[0];
    }
    return headerValue;
  }
  return void 0;
}
function requireShortLinkService(service) {
  if (!service) {
    throw new MissingDependencyError("Short link functionality is unavailable");
  }
  return service;
}
function requireConfigStorage(service) {
  if (!service) {
    throw new MissingDependencyError("Config storage functionality is unavailable");
  }
  return service;
}
function handleError(c, error, logger) {
  if (error instanceof ServiceError) {
    return c.text(error.message, error.status);
  }
  logger.error?.("Unhandled error", error);
  return c.text(`Error: ${error.message}`, 500);
}

// src/adapters/kv/cloudflareKv.js
var CloudflareKVAdapter = class {
  constructor(binding) {
    this.binding = binding;
  }
  async get(key) {
    return this.binding.get(key);
  }
  async put(key, value, options = {}) {
    return this.binding.put(key, value, options);
  }
  async delete(key) {
    return this.binding.delete(key);
  }
};

// src/runtime/cloudflare.js
function createCloudflareRuntime(env) {
  return {
    kv: env?.SUBLINK_KV ? new CloudflareKVAdapter(env.SUBLINK_KV) : null,
    assetFetcher: env?.ASSETS ? (request) => env.ASSETS.fetch(request) : null,
    logger: console,
    config: {}
  };
}

// src/worker.jsx
var honoApp;
function getApp(env) {
  if (!honoApp) {
    const runtime = createCloudflareRuntime(env);
    honoApp = createApp(runtime);
  }
  return honoApp;
}
var worker_default = {
  fetch(request, env, ctx) {
    const app = getApp(env);
    return app.fetch(request, env, ctx);
  }
};
export {
  worker_default as default
};
