var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e2) {
    throw mod = 0, e2;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "../node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup2 = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i2 = 0, len = code.length; i2 < len; ++i2) {
      lookup2[i2] = code[i2];
      revLookup[code.charCodeAt(i2)] = i2;
    }
    var i2;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i3;
      for (i3 = 0; i3 < len2; i3 += 4) {
        tmp = revLookup[b64.charCodeAt(i3)] << 18 | revLookup[b64.charCodeAt(i3 + 1)] << 12 | revLookup[b64.charCodeAt(i3 + 2)] << 6 | revLookup[b64.charCodeAt(i3 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i3)] << 2 | revLookup[b64.charCodeAt(i3 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i3)] << 10 | revLookup[b64.charCodeAt(i3 + 1)] << 4 | revLookup[b64.charCodeAt(i3 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup2[num >> 18 & 63] + lookup2[num >> 12 & 63] + lookup2[num >> 6 & 63] + lookup2[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i3 = start; i3 < end; i3 += 3) {
        tmp = (uint8[i3] << 16 & 16711680) + (uint8[i3 + 1] << 8 & 65280) + (uint8[i3 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i3 = 0, len22 = len2 - extraBytes; i3 < len22; i3 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i3, i3 + maxChunkLength > len22 ? len22 : i3 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup2[tmp >> 2] + lookup2[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup2[tmp >> 10] + lookup2[tmp >> 4 & 63] + lookup2[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// src/env.js
var ENV_VALUE_TYPE = {
  TG_BOT_TOKEN: "string",
  TG_CHAT_ID: "string"
};
var ENV = {
  // Telegram Bot Token
  TG_BOT_TOKEN: null,
  // Telegram Bot Chat send messages to
  TG_CHAT_ID: null,
  // 本地调试专用
  TELEGRAM_API_DOMAIN: "https://api.telegram.org"
};
var DATABASE = null;
var AI = null;
function initEnv(env) {
  DATABASE = env.DB;
  AI = env.AI;
  for (const key in ENV) {
    if (env[key]) {
      switch (ENV_VALUE_TYPE[key] || typeof ENV[key]) {
        case "number":
          ENV[key] = parseInt(env[key]) || ENV[key];
          break;
        case "boolean":
          ENV[key] = (env[key] || "false") === "true";
          break;
        case "string":
          ENV[key] = env[key];
          break;
        case "object":
          if (Array.isArray(ENV[key])) {
            ENV[key] = env[key].split(",");
          } else {
            try {
              ENV[key] = JSON.parse(env[key]);
            } catch (e2) {
              console.error(e2);
            }
          }
          break;
        default:
          ENV[key] = env[key];
          break;
      }
    }
  }
}

// src/telegram.js
async function sendMessage(text, chat_id, bot_token) {
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${bot_token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        method: "post",
        text,
        chat_id
      })
    }
  );
}

// src/utils.js
function renderHTML(body) {
  return `
  <html>  
    <head>
      <title>Telegram-Counter</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="author" content="Xiaowen.Z">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          color: #212529;
          text-align: left;
          background-color: #fff;
        }
        h1 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        p {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        a {
          color: #007bff;
          text-decoration: none;
          background-color: transparent;
        }
        a:hover {
          color: #0056b3;
          text-decoration: underline;
        }
        strong {
          font-weight: bolder;
        }
      </style>
    </head>
    <body>
      ${body}
    </body>
  </html>
    `;
}
function errorToString(e2) {
  return JSON.stringify({
    message: e2.message,
    stack: e2.stack
  });
}
function assistantMessage(text) {
  return `---- \u5C0F\u52A9\u624B\u6D88\u606F ----\r
${text}\r
--------------------`;
}

// src/counter.js
async function commandAddCount(name, comment) {
  let messages = [];
  messages.push(await addCount(name, comment));
  messages.push(await showCurrentCount(name));
  messages.push(await showGoal(name));
  return messages.join("\n");
}
async function commandResetCount(name) {
  let messages = [];
  messages.push(await resetCount(name));
  messages.push(await showCurrentCount(name));
  return messages.join("\n");
}
async function commandSetGoal(name, goal, comment) {
  let messages = [];
  messages.push(await setGoal(name, goal, comment));
  messages.push(await showGoal(name));
  return messages.join("\n");
}
async function commandShowCountHistory(name, limit) {
  let messages = [];
  messages.push(await showCountHistory(name, limit));
  return messages.join("\n");
}
async function addCount(name, comment) {
  try {
    const info = await DATABASE.prepare(
      "INSERT INTO count_log (count_name, count_type, count_value, count_date, count_comment) VALUES (?1, 'count', 1, date('now'), ?2)"
    ).bind(name, comment).run();
    return `${name} \u6253\u5361\u6210\u529F `;
  } catch (error) {
    console.log(errorToString(error));
    return `${name} \u6253\u5361\u5931\u8D25 ${errorToString(error)}`;
  }
}
async function resetCount(name) {
  try {
    const info = await DATABASE.prepare(
      "INSERT INTO count_log (count_name, count_type, count_value, count_date) VALUES (?1, 'reset', 1, date('now'))"
    ).bind(name).run();
    return `${name} \u6253\u5361\u91CD\u7F6E\u6210\u529F `;
  } catch (error) {
    return `${name} \u6253\u5361\u91CD\u7F6E\u5931\u8D25 ${errorToString(error)}`;
  }
}
async function deleteCount(name) {
  try {
    const info = await DATABASE.prepare(
      "DELETE FROM count_log WHERE count_name=?1"
    ).bind(name).run();
    return `${name} \u5220\u9664\u6253\u5361\u6210\u529F `;
  } catch (error) {
    return `${name} \u5220\u9664\u6253\u5361\u5931\u8D25 ${errorToString(error)}`;
  }
}
async function showCurrentCount(name) {
  try {
    const info = await DATABASE.prepare(
      "SELECT COALESCE(SUM(count_value),0) AS total FROM count_log WHERE count_name=?1 and id > COALESCE((               SELECT MAX(id) FROM count_log WHERE count_type = 'reset' and count_name=?2             ),0)"
    ).bind(name, name).first();
    return `\u622A\u6B62\u76EE\u524D ${name} \u6253\u5361\u6570\u603B\u8BA1 ${info["total"]} \u6B21 `;
  } catch (error) {
    console.log(errorToString(error));
    return `${name} \u67E5\u8BE2\u5931\u8D25 ${errorToString(error)}`;
  }
}
async function setGoal(name, goal, comment) {
  try {
    await DATABASE.prepare("DELETE FROM count_goal WHERE count_name=?1").bind(name).run();
    await DATABASE.prepare(
      "INSERT INTO count_goal (count_name, goal_comment, goal_value) VALUES (?1, ?2, ?3)"
    ).bind(name, comment, goal).run();
    return `${name} \u6253\u5361\u76EE\u6807\u8BBE\u7F6E\u6210\u529F `;
  } catch (error) {
    console.log(errorToString(error));
    return `${name} \u6253\u5361\u76EE\u6807\u8BBE\u7F6E\u5931\u8D25 ${errorToString(error)}`;
  }
}
async function showGoal(name) {
  try {
    const info = await DATABASE.prepare(
      "WITH T AS (SELECT COALESCE(SUM(count_value),0) AS total FROM count_log             WHERE count_name=?1 and id > COALESCE((SELECT MAX(id) FROM count_log WHERE count_type = 'reset' and count_name=?2 ),0))             SELECT (goal_value - (SELECT total from T)) as diff, goal_comment FROM count_goal where count_name = ?3"
    ).bind(name, name, name).first();
    console.log(info);
    if (!info) {
      return `\u672A\u8BBE\u7F6E${name}\u7684\u6253\u5361\u76EE\u6807`;
    }
    return `\u8DDD\u79BB${info["goal_comment"]}\u8FD8\u6709 ${info["diff"]}\u6B21`;
  } catch (error) {
    console.log(errorToString(error));
    return `${name} \u67E5\u8BE2\u6253\u5361\u76EE\u6807\u5931\u8D25 ${errorToString(error)}`;
  }
}
async function showCountHistory(name, limit) {
  try {
    const info = await DATABASE.prepare(
      "SELECT count_name, count_type, count_date, count_comment FROM count_log WHERE count_name=?1 ORDER BY id DESC LIMIT ?2"
    ).bind(name, limit).all();
    let dataTable = messageCountRecordList(info["results"]);
    return "\u6253\u5361\u5386\u53F2\u67E5\u8BE2\u6210\u529F\uFF0C\u5217\u8868\u5982\u4E0B: \n\n" + dataTable;
  } catch (error) {
    console.log(errorToString(error));
    return `${name} \u67E5\u8BE2\u6253\u5361\u5386\u53F2\u5931\u8D25 ${errorToString(error)}`;
  }
}
function messageCountRecordList(data) {
  if (!Array.isArray(data) || data.length == 0) {
    return "";
  }
  var table = "";
  for (var i2 = 0; i2 < data.length; i2++) {
    table += "> " + Object.values(data[i2]).join(" | ") + "\n";
  }
  return table;
}

// ../node_modules/@cloudflare/ai/dist/index.js
var e = __toESM(require_base64_js(), 1);

// ../node_modules/mustache/mustache.mjs
var objectToString = Object.prototype.toString;
var isArray = Array.isArray || function isArrayPolyfill(object) {
  return objectToString.call(object) === "[object Array]";
};
function isFunction(object) {
  return typeof object === "function";
}
function typeStr(obj) {
  return isArray(obj) ? "array" : typeof obj;
}
function escapeRegExp(string) {
  return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function hasProperty(obj, propName) {
  return obj != null && typeof obj === "object" && propName in obj;
}
function primitiveHasOwnProperty(primitive, propName) {
  return primitive != null && typeof primitive !== "object" && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
}
var regExpTest = RegExp.prototype.test;
function testRegExp(re, string) {
  return regExpTest.call(re, string);
}
var nonSpaceRe = /\S/;
function isWhitespace(string) {
  return !testRegExp(nonSpaceRe, string);
}
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
};
function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s2) {
    return entityMap[s2];
  });
}
var whiteRe = /\s*/;
var spaceRe = /\s+/;
var equalsRe = /\s*=/;
var curlyRe = /\s*\}/;
var tagRe = /#|\^|\/|>|\{|&|=|!/;
function parseTemplate(template, tags) {
  if (!template)
    return [];
  var lineHasNonSpace = false;
  var sections = [];
  var tokens = [];
  var spaces = [];
  var hasTag = false;
  var nonSpace = false;
  var indentation = "";
  var tagIndex = 0;
  function stripSpace() {
    if (hasTag && !nonSpace) {
      while (spaces.length)
        delete tokens[spaces.pop()];
    } else {
      spaces = [];
    }
    hasTag = false;
    nonSpace = false;
  }
  var openingTagRe, closingTagRe, closingCurlyRe;
  function compileTags(tagsToCompile) {
    if (typeof tagsToCompile === "string")
      tagsToCompile = tagsToCompile.split(spaceRe, 2);
    if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
      throw new Error("Invalid tags: " + tagsToCompile);
    openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
    closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
    closingCurlyRe = new RegExp("\\s*" + escapeRegExp("}" + tagsToCompile[1]));
  }
  compileTags(tags || mustache.tags);
  var scanner = new Scanner(template);
  var start, type, value, chr, token, openSection;
  while (!scanner.eos()) {
    start = scanner.pos;
    value = scanner.scanUntil(openingTagRe);
    if (value) {
      for (var i2 = 0, valueLength = value.length; i2 < valueLength; ++i2) {
        chr = value.charAt(i2);
        if (isWhitespace(chr)) {
          spaces.push(tokens.length);
          indentation += chr;
        } else {
          nonSpace = true;
          lineHasNonSpace = true;
          indentation += " ";
        }
        tokens.push(["text", chr, start, start + 1]);
        start += 1;
        if (chr === "\n") {
          stripSpace();
          indentation = "";
          tagIndex = 0;
          lineHasNonSpace = false;
        }
      }
    }
    if (!scanner.scan(openingTagRe))
      break;
    hasTag = true;
    type = scanner.scan(tagRe) || "name";
    scanner.scan(whiteRe);
    if (type === "=") {
      value = scanner.scanUntil(equalsRe);
      scanner.scan(equalsRe);
      scanner.scanUntil(closingTagRe);
    } else if (type === "{") {
      value = scanner.scanUntil(closingCurlyRe);
      scanner.scan(curlyRe);
      scanner.scanUntil(closingTagRe);
      type = "&";
    } else {
      value = scanner.scanUntil(closingTagRe);
    }
    if (!scanner.scan(closingTagRe))
      throw new Error("Unclosed tag at " + scanner.pos);
    if (type == ">") {
      token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
    } else {
      token = [type, value, start, scanner.pos];
    }
    tagIndex++;
    tokens.push(token);
    if (type === "#" || type === "^") {
      sections.push(token);
    } else if (type === "/") {
      openSection = sections.pop();
      if (!openSection)
        throw new Error('Unopened section "' + value + '" at ' + start);
      if (openSection[1] !== value)
        throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
    } else if (type === "name" || type === "{" || type === "&") {
      nonSpace = true;
    } else if (type === "=") {
      compileTags(value);
    }
  }
  stripSpace();
  openSection = sections.pop();
  if (openSection)
    throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
  return nestTokens(squashTokens(tokens));
}
function squashTokens(tokens) {
  var squashedTokens = [];
  var token, lastToken;
  for (var i2 = 0, numTokens = tokens.length; i2 < numTokens; ++i2) {
    token = tokens[i2];
    if (token) {
      if (token[0] === "text" && lastToken && lastToken[0] === "text") {
        lastToken[1] += token[1];
        lastToken[3] = token[3];
      } else {
        squashedTokens.push(token);
        lastToken = token;
      }
    }
  }
  return squashedTokens;
}
function nestTokens(tokens) {
  var nestedTokens = [];
  var collector = nestedTokens;
  var sections = [];
  var token, section;
  for (var i2 = 0, numTokens = tokens.length; i2 < numTokens; ++i2) {
    token = tokens[i2];
    switch (token[0]) {
      case "#":
      case "^":
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case "/":
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
    }
  }
  return nestedTokens;
}
function Scanner(string) {
  this.string = string;
  this.tail = string;
  this.pos = 0;
}
Scanner.prototype.eos = function eos() {
  return this.tail === "";
};
Scanner.prototype.scan = function scan(re) {
  var match = this.tail.match(re);
  if (!match || match.index !== 0)
    return "";
  var string = match[0];
  this.tail = this.tail.substring(string.length);
  this.pos += string.length;
  return string;
};
Scanner.prototype.scanUntil = function scanUntil(re) {
  var index = this.tail.search(re), match;
  switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
  }
  this.pos += match.length;
  return match;
};
function Context(view, parentContext) {
  this.view = view;
  this.cache = { ".": this.view };
  this.parent = parentContext;
}
Context.prototype.push = function push(view) {
  return new Context(view, this);
};
Context.prototype.lookup = function lookup(name) {
  var cache = this.cache;
  var value;
  if (cache.hasOwnProperty(name)) {
    value = cache[name];
  } else {
    var context = this, intermediateValue, names, index, lookupHit = false;
    while (context) {
      if (name.indexOf(".") > 0) {
        intermediateValue = context.view;
        names = name.split(".");
        index = 0;
        while (intermediateValue != null && index < names.length) {
          if (index === names.length - 1)
            lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
          intermediateValue = intermediateValue[names[index++]];
        }
      } else {
        intermediateValue = context.view[name];
        lookupHit = hasProperty(context.view, name);
      }
      if (lookupHit) {
        value = intermediateValue;
        break;
      }
      context = context.parent;
    }
    cache[name] = value;
  }
  if (isFunction(value))
    value = value.call(this.view);
  return value;
};
function Writer() {
  this.templateCache = {
    _cache: {},
    set: function set(key, value) {
      this._cache[key] = value;
    },
    get: function get(key) {
      return this._cache[key];
    },
    clear: function clear() {
      this._cache = {};
    }
  };
}
Writer.prototype.clearCache = function clearCache() {
  if (typeof this.templateCache !== "undefined") {
    this.templateCache.clear();
  }
};
Writer.prototype.parse = function parse(template, tags) {
  var cache = this.templateCache;
  var cacheKey = template + ":" + (tags || mustache.tags).join(":");
  var isCacheEnabled = typeof cache !== "undefined";
  var tokens = isCacheEnabled ? cache.get(cacheKey) : void 0;
  if (tokens == void 0) {
    tokens = parseTemplate(template, tags);
    isCacheEnabled && cache.set(cacheKey, tokens);
  }
  return tokens;
};
Writer.prototype.render = function render(template, view, partials, config) {
  var tags = this.getConfigTags(config);
  var tokens = this.parse(template, tags);
  var context = view instanceof Context ? view : new Context(view, void 0);
  return this.renderTokens(tokens, context, partials, template, config);
};
Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate, config) {
  var buffer = "";
  var token, symbol, value;
  for (var i2 = 0, numTokens = tokens.length; i2 < numTokens; ++i2) {
    value = void 0;
    token = tokens[i2];
    symbol = token[0];
    if (symbol === "#") value = this.renderSection(token, context, partials, originalTemplate, config);
    else if (symbol === "^") value = this.renderInverted(token, context, partials, originalTemplate, config);
    else if (symbol === ">") value = this.renderPartial(token, context, partials, config);
    else if (symbol === "&") value = this.unescapedValue(token, context);
    else if (symbol === "name") value = this.escapedValue(token, context, config);
    else if (symbol === "text") value = this.rawValue(token);
    if (value !== void 0)
      buffer += value;
  }
  return buffer;
};
Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate, config) {
  var self = this;
  var buffer = "";
  var value = context.lookup(token[1]);
  function subRender(template) {
    return self.render(template, context, partials, config);
  }
  if (!value) return;
  if (isArray(value)) {
    for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
      buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
    }
  } else if (typeof value === "object" || typeof value === "string" || typeof value === "number") {
    buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
  } else if (isFunction(value)) {
    if (typeof originalTemplate !== "string")
      throw new Error("Cannot use higher-order sections without the original template");
    value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
    if (value != null)
      buffer += value;
  } else {
    buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
  }
  return buffer;
};
Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate, config) {
  var value = context.lookup(token[1]);
  if (!value || isArray(value) && value.length === 0)
    return this.renderTokens(token[4], context, partials, originalTemplate, config);
};
Writer.prototype.indentPartial = function indentPartial(partial, indentation, lineHasNonSpace) {
  var filteredIndentation = indentation.replace(/[^ \t]/g, "");
  var partialByNl = partial.split("\n");
  for (var i2 = 0; i2 < partialByNl.length; i2++) {
    if (partialByNl[i2].length && (i2 > 0 || !lineHasNonSpace)) {
      partialByNl[i2] = filteredIndentation + partialByNl[i2];
    }
  }
  return partialByNl.join("\n");
};
Writer.prototype.renderPartial = function renderPartial(token, context, partials, config) {
  if (!partials) return;
  var tags = this.getConfigTags(config);
  var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
  if (value != null) {
    var lineHasNonSpace = token[6];
    var tagIndex = token[5];
    var indentation = token[4];
    var indentedValue = value;
    if (tagIndex == 0 && indentation) {
      indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
    }
    var tokens = this.parse(indentedValue, tags);
    return this.renderTokens(tokens, context, partials, indentedValue, config);
  }
};
Writer.prototype.unescapedValue = function unescapedValue(token, context) {
  var value = context.lookup(token[1]);
  if (value != null)
    return value;
};
Writer.prototype.escapedValue = function escapedValue(token, context, config) {
  var escape = this.getConfigEscape(config) || mustache.escape;
  var value = context.lookup(token[1]);
  if (value != null)
    return typeof value === "number" && escape === mustache.escape ? String(value) : escape(value);
};
Writer.prototype.rawValue = function rawValue(token) {
  return token[1];
};
Writer.prototype.getConfigTags = function getConfigTags(config) {
  if (isArray(config)) {
    return config;
  } else if (config && typeof config === "object") {
    return config.tags;
  } else {
    return void 0;
  }
};
Writer.prototype.getConfigEscape = function getConfigEscape(config) {
  if (config && typeof config === "object" && !isArray(config)) {
    return config.escape;
  } else {
    return void 0;
  }
};
var mustache = {
  name: "mustache.js",
  version: "4.2.0",
  tags: ["{{", "}}"],
  clearCache: void 0,
  escape: void 0,
  parse: void 0,
  render: void 0,
  Scanner: void 0,
  Context: void 0,
  Writer: void 0,
  /**
   * Allows a user to override the default caching strategy, by providing an
   * object with set, get and clear methods. This can also be used to disable
   * the cache by setting it to the literal `undefined`.
   */
  set templateCache(cache) {
    defaultWriter.templateCache = cache;
  },
  /**
   * Gets the default or overridden caching object from the default writer.
   */
  get templateCache() {
    return defaultWriter.templateCache;
  }
};
var defaultWriter = new Writer();
mustache.clearCache = function clearCache2() {
  return defaultWriter.clearCache();
};
mustache.parse = function parse2(template, tags) {
  return defaultWriter.parse(template, tags);
};
mustache.render = function render2(template, view, partials, config) {
  if (typeof template !== "string") {
    throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(template) + '" was given as the first argument for mustache#render(template, view, partials)');
  }
  return defaultWriter.render(template, view, partials, config);
};
mustache.escape = escapeHtml;
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;
var mustache_default = mustache;

// ../node_modules/@cloudflare/ai/dist/index.js
var s;
!(function(e2) {
  e2.String = "str", e2.Bool = "bool", e2.Float16 = "float16", e2.Float32 = "float32", e2.Int16 = "int16", e2.Int32 = "int32", e2.Int64 = "int64", e2.Int8 = "int8", e2.Uint16 = "uint16", e2.Uint32 = "uint32", e2.Uint64 = "uint64", e2.Uint8 = "uint8";
})(s || (s = {}));
var n = Object.getPrototypeOf(Uint8Array);
function r(e2) {
  return Array.isArray(e2) || e2 instanceof n;
}
function a(e2) {
  return e2 instanceof n ? e2.length : e2.flat(1 / 0).reduce(((e3, t) => e3 + (t instanceof n ? t.length : 1)), 0);
}
function o(e2, t) {
  if (!r(t)) {
    switch (e2) {
      case s.Bool:
        if ("boolean" == typeof t) return;
        break;
      case s.Float16:
      case s.Float32:
        if ("number" == typeof t) return;
        break;
      case s.Int8:
      case s.Uint8:
      case s.Int16:
      case s.Uint16:
      case s.Int32:
      case s.Uint32:
        if (Number.isInteger(t)) return;
        break;
      case s.Int64:
      case s.Uint64:
        if ("bigint" == typeof t) return;
        break;
      case s.String:
        if ("string" == typeof t) return;
    }
    throw new Error(`unexpected type "${e2}" with value "${t}".`);
  }
  t.forEach(((t2) => o(e2, t2)));
}
function i(e2, t) {
  if (r(t)) return [...t].map(((t2) => i(e2, t2)));
  switch (e2) {
    case s.String:
    case s.Bool:
    case s.Float16:
    case s.Float32:
    case s.Int8:
    case s.Uint8:
    case s.Int16:
    case s.Uint16:
    case s.Uint32:
    case s.Int32:
      return t;
    case s.Int64:
    case s.Uint64:
      return t.toString();
  }
  throw new Error(`unexpected type "${e2}" with value "${t}".`);
}
function E(e2, t) {
  if (r(t)) return t.map(((t2) => E(e2, t2)));
  switch (e2) {
    case s.String:
    case s.Bool:
    case s.Float16:
    case s.Float32:
    case s.Int8:
    case s.Uint8:
    case s.Int16:
    case s.Uint16:
    case s.Uint32:
    case s.Int32:
      return t;
    case s.Int64:
    case s.Uint64:
      return BigInt(t);
  }
  throw new Error(`unexpected type "${e2}" with value "${t}".`);
}
var p = class _p {
  type;
  value;
  name;
  shape;
  constructor(e2, t, s2 = {}) {
    this.type = e2, this.value = t, s2.validate && o(e2, this.value), void 0 === s2.shape ? r(this.value) ? this.shape = [a(t)] : this.shape = [] : this.shape = s2.shape, s2.validate && (function(e3, t2) {
      if (0 === e3.length && !r(t2)) return;
      const s3 = e3.reduce(((e4, t3) => {
        if (!Number.isInteger(t3)) throw new Error(`expected shape to be array-like of integers but found non-integer element "${t3}"`);
        return e4 * t3;
      }), 1);
      if (s3 != a(t2)) throw new Error(`invalid shape: expected ${s3} elements for shape ${e3} but value array has length ${t2.length}`);
    })(this.shape, this.value), this.name = s2.name || null;
  }
  static fromJSON(e2) {
    const { type: t, shape: s2, value: n2, b64Value: r2, name: a2 } = e2, o2 = { shape: s2, name: a2 };
    if (void 0 !== r2) {
      const e3 = (function(e4, t2) {
        const s3 = atob(e4), n3 = new Uint8Array(s3.length);
        for (let e5 = 0; e5 < s3.length; e5++) n3[e5] = s3.charCodeAt(e5);
        const r3 = new DataView(n3.buffer).buffer;
        switch (t2) {
          case "float32":
            return new Float32Array(r3);
          case "float64":
            return new Float64Array(r3);
          case "int32":
            return new Int32Array(r3);
          case "int64":
            return new BigInt64Array(r3);
          default:
            throw Error(`invalid data type for base64 input: ${t2}`);
        }
      })(r2, t)[0];
      return new _p(t, e3, o2);
    }
    return new _p(t, E(t, n2), o2);
  }
  toJSON() {
    return { type: this.type, shape: this.shape, name: this.name, value: i(this.type, this.value) };
  }
};
var A = "A chat between a curious human and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the human's questions.";
var R = "Write code to solve the following coding problem that obeys the constraints and passes the example test cases. Please wrap your code answer using   ```:";
var c = (e2, t) => [{ role: "system", content: e2 }, { role: "user", content: t }];
var m = (e2) => {
  const t = {};
  e2.temperature && (t.temperature = e2.temperature), e2.max_tokens && (t.max_tokens = e2.max_tokens);
  const n2 = [new p(s.String, [e2.prompt], { shape: [1], name: "text_input" }), new p(s.String, [JSON.stringify(t)], { shape: [1], name: "sampling_parameters" })];
  return e2.stream && n2.push(new p(s.Bool, true, { name: "stream" })), e2.image && (n2.push(new p(s.Uint8, e2.image, { shape: [1, e2.image.length], name: "image" })), n2.push(new p(s.Bool, true, { name: "exclude_input_in_output" }))), n2;
};
var u = (e2, t) => {
  let s2 = e2.generated_text.value[0];
  if (t) for (const e3 in t) s2 = s2.replace(t[e3], "");
  return s2;
};
var O = (e2) => (e2.inputsDefaultsStream = { max_tokens: 1800, ...e2.inputsDefaultsStream || {} }, e2.inputsDefaults = { max_tokens: 256, ...e2.inputsDefaults || {} }, e2.preProcessingArgs = { promptTemplate: "bare", defaultContext: A, defaultPromptMessages: c, ...e2.preProcessingArgs || {} }, e2 = { type: "triton", ...e2 });
var l = (e2) => (e2.inputsDefaultsStream = { max_tokens: 512, ...e2.inputsDefaultsStream || {} }, e2.inputsDefaults = { max_tokens: 512, ...e2.inputsDefaults || {} }, e2.preProcessingArgs = { promptTemplate: "bare", defaultContext: A, defaultPromptMessages: c, ...e2.preProcessingArgs || {} }, e2 = { type: "vllm", generateTensorsFunc: (e3) => m(e3), postProcessingFunc: (e3, t) => e3.name.value[0].slice(t.prompt.length), postProcessingFuncStream: (e3, t, s2) => e3.name.value[0], ...e2 });
var I = (e2, t, s2) => ({ type: "tgi", inputsDefaultsStream: { max_tokens: 512 }, inputsDefaults: { max_tokens: 256 }, preProcessingArgs: { promptTemplate: e2, defaultContext: t, defaultPromptMessages: c }, postProcessingFunc: (e3, t2) => u(e3, s2), postProcessingFuncStream: (e3, t2, n2) => u(e3, s2) });
var D = mustache_default.parse;
var y = mustache_default.render;
TransformStream;
TransformStream;
I("deepseek", R, ["<|EOT|>"]), I("bare", R), I("inst", A), I("openchat", A), I("chatml", A, ["<|im_end|>"]), I("orca-hashes", A), I("llama2", A), I("zephyr", A), I("mistral-instruct", A), I("mistral-instruct", A), I("gemma", A), I("hermes2-pro", A), I("starling", A), I("llama2", R), l({ preProcessingArgs: { promptTemplate: "phi-2", defaultPromptMessages: (e2, t) => [{ role: "question", content: t }] } }), l({ preProcessingArgs: { promptTemplate: "sqlcoder" } }), l({ preProcessingArgs: { defaultContext: "" } }), l({ preProcessingArgs: { promptTemplate: "falcon" } }), l({ preProcessingArgs: { promptTemplate: "chatml" } }), l({ preProcessingArgs: { promptTemplate: "chatml" } }), l({ preProcessingArgs: { promptTemplate: "chatml" } }), l({ preProcessingArgs: { promptTemplate: "chatml" } }), l({ preProcessingArgs: { promptTemplate: "chatml" } }), l({ preProcessingArgs: { promptTemplate: "tinyllama" } }), l({ preProcessingArgs: { promptTemplate: "openchat-alt" } }), l({ preProcessingArgs: { promptTemplate: "gemma" } }), l({ preProcessingArgs: { promptTemplate: "gemma" } }), l({ preProcessingArgs: { promptTemplate: "mistral-instruct" } }), l({ experimental: true, preProcessingArgs: { promptTemplate: "mistral-instruct" } }), l({ preProcessingArgs: { promptTemplate: "llama2" } }), l({ experimental: true, inputsDefaultsStream: { max_tokens: 1800 }, inputsDefaults: { max_tokens: 256 }, preProcessingArgs: { promptTemplate: "mistral-instruct" } }), l({ preProcessingArgs: { promptTemplate: "llama3" } }), l({ experimental: true }), l({ experimental: true }), l({ preProcessingArgs: { promptTemplate: "chatml" } }), l({ experimental: true }), O({ inputsDefaultsStream: { max_tokens: 2500 }, preProcessingArgs: { promptTemplate: "llama2" } }), O({ preProcessingArgs: { promptTemplate: "llama2" } }), O({ preProcessingArgs: { promptTemplate: "mistral-instruct" } });
var W = class {
  binding;
  options;
  logs;
  lastRequestId;
  constructor(e2, t = {}) {
    if (!e2) throw new Error("Ai binding is undefined. Please provide a valid binding.");
    this.binding = e2, this.options = t, this.lastRequestId = "";
  }
  async run(e2, t) {
    const s2 = await this.binding.run(e2, t, this.options);
    return this.lastRequestId = this.binding.lastRequestId, this.options.debug && (this.logs = this.binding.getLogs()), s2;
  }
  getLogs() {
    return this.logs;
  }
};

// src/translator.js
async function translate(sentence, from = "chinese", to = "english") {
  const ai = new W(AI);
  const response = await ai.run(
    "@cf/meta/m2m100-1.2b",
    {
      text: sentence,
      source_lang: from,
      // defaults to english
      target_lang: to
    }
  );
  return response["translated_text"];
}

// src/command.js
var handlers = {
  \u6253\u5361: (args) => {
    if (args.length > 1) {
      return commandAddCount(args[0], args[1]);
    } else if (args.length > 0) {
      return commandAddCount(args[0], "");
    } else {
      return `\u4E0D\u5B8C\u6574\u7684\u547D\u4EE4`;
    }
  },
  \u91CD\u7F6E\u6253\u5361: (args) => {
    if (args.length > 0) {
      return commandResetCount(args[0]);
    } else {
      return `\u4E0D\u5B8C\u6574\u7684\u547D\u4EE4`;
    }
  },
  \u5220\u9664\u6253\u5361: (args) => {
    if (args.length > 0) {
      return deleteCount(args[0]);
    } else {
      return `\u4E0D\u5B8C\u6574\u7684\u547D\u4EE4`;
    }
  },
  \u67E5\u8BE2\u6253\u5361: (args) => {
    if (args.length > 0) {
      return showCurrentCount(args[0]);
    } else {
      return `\u4E0D\u5B8C\u6574\u7684\u547D\u4EE4`;
    }
  },
  \u8BBE\u7F6E\u6253\u5361\u76EE\u6807: (args) => {
    if (args.length > 2) {
      return commandSetGoal(args[0], args[1], args[2]);
    } else {
      return `\u4E0D\u5B8C\u6574\u7684\u547D\u4EE4`;
    }
  },
  \u67E5\u8BE2\u6253\u5361\u5386\u53F2: (args) => {
    if (args.length > 0) {
      return commandShowCountHistory(args[0], 30);
    } else {
      return `\u4E0D\u5B8C\u6574\u7684\u547D\u4EE4`;
    }
  },
  \u7FFB\u8BD1: (args) => {
    if (args.length > 0) {
      return translate(args[0]);
    } else {
      return `\u4E0D\u5B8C\u6574\u7684\u547D\u4EE4`;
    }
  }
};
async function handleCommand(text) {
  const parts = text.trim().split(" ");
  const command = parts[0];
  const args = parts.slice(1);
  if (handlers[command]) {
    return await handlers[command](args);
  } else {
    console.log("Unknown command");
    return `\u4E0D\u80FD\u8BC6\u522B\u7684\u547D\u4EE4`;
  }
}

// src/router.js
var footer = `
<br/>
<p></p>
<p>If you have any questions, please visit nowhere to ask.</p>
`;
async function handleRequest(request) {
  const { pathname } = new URL(request.url);
  if (pathname === `/`) {
    return defaultIndexAction();
  }
  if (pathname.startsWith(`/tg`)) {
    return handleTelegramAction(request);
  }
  return null;
}
async function handleTelegramAction(request) {
  const body = await request.json();
  const text = body.message.text;
  console.log(`Text Message recieved: ${text}`);
  const msg = await handleCommand(text);
  await sendMessage(assistantMessage(msg), ENV.TG_CHAT_ID, ENV.TG_BOT_TOKEN);
  return new Response({
    status: 200
  });
}
async function defaultIndexAction() {
  const HTML = renderHTML(`
      <h1>Telegram-Counter</h1>
      <br/>
      <p>Deployed Successfully!</p>
      <br/>
      <br/>
      ${footer}
    `);
  return new Response(HTML, {
    status: 200,
    headers: { "Content-Type": "text/html" }
  });
}

// index.js
var index_default = {
  async fetch(request, env) {
    try {
      initEnv(env);
      const resp = await handleRequest(request);
      return resp || new Response("NOTFOUND", { status: 404 });
    } catch (e2) {
      console.error(e2);
      return new Response(errorToString(e2), { status: 500 });
    }
  }
};
export {
  index_default as default
};
/*! Bundled license information:

mustache/mustache.mjs:
  (*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   *)
*/
