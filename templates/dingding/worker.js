var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
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

// node_modules/negotiator/lib/charset.js
var require_charset = __commonJS({
  "node_modules/negotiator/lib/charset.js"(exports, module) {
    "use strict";
    module.exports = preferredCharsets2;
    module.exports.preferredCharsets = preferredCharsets2;
    var simpleCharsetRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
    function parseAcceptCharset2(accept) {
      var accepts = accept.split(",");
      for (var i = 0, j = 0; i < accepts.length; i++) {
        var charset = parseCharset(accepts[i].trim(), i);
        if (charset) {
          accepts[j++] = charset;
        }
      }
      accepts.length = j;
      return accepts;
    }
    function parseCharset(str, i) {
      var match = simpleCharsetRegExp.exec(str);
      if (!match) return null;
      var charset = match[1];
      var q = 1;
      if (match[2]) {
        var params = match[2].split(";");
        for (var j = 0; j < params.length; j++) {
          var p = params[j].trim().split("=");
          if (p[0] === "q") {
            q = parseFloat(p[1]);
            break;
          }
        }
      }
      return {
        charset,
        q,
        i
      };
    }
    function getCharsetPriority(charset, accepted, index) {
      var priority = { o: -1, q: 0, s: 0 };
      for (var i = 0; i < accepted.length; i++) {
        var spec = specify(charset, accepted[i], index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
          priority = spec;
        }
      }
      return priority;
    }
    function specify(charset, spec, index) {
      var s = 0;
      if (spec.charset.toLowerCase() === charset.toLowerCase()) {
        s |= 1;
      } else if (spec.charset !== "*") {
        return null;
      }
      return {
        i: index,
        o: spec.i,
        q: spec.q,
        s
      };
    }
    function preferredCharsets2(accept, provided) {
      var accepts = parseAcceptCharset2(accept === void 0 ? "*" : accept || "");
      if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map(getFullCharset);
      }
      var priorities = provided.map(function getPriority(type, index) {
        return getCharsetPriority(type, accepts, index);
      });
      return priorities.filter(isQuality).sort(compareSpecs).map(function getCharset(priority) {
        return provided[priorities.indexOf(priority)];
      });
    }
    function compareSpecs(a, b) {
      return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    function getFullCharset(spec) {
      return spec.charset;
    }
    function isQuality(spec) {
      return spec.q > 0;
    }
  }
});

// node_modules/negotiator/lib/encoding.js
var require_encoding = __commonJS({
  "node_modules/negotiator/lib/encoding.js"(exports, module) {
    "use strict";
    module.exports = preferredEncodings2;
    module.exports.preferredEncodings = preferredEncodings2;
    var simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
    function parseAcceptEncoding2(accept) {
      var accepts = accept.split(",");
      var hasIdentity = false;
      var minQuality = 1;
      for (var i = 0, j = 0; i < accepts.length; i++) {
        var encoding = parseEncoding(accepts[i].trim(), i);
        if (encoding) {
          accepts[j++] = encoding;
          hasIdentity = hasIdentity || specify("identity", encoding);
          minQuality = Math.min(minQuality, encoding.q || 1);
        }
      }
      if (!hasIdentity) {
        accepts[j++] = {
          encoding: "identity",
          q: minQuality,
          i
        };
      }
      accepts.length = j;
      return accepts;
    }
    function parseEncoding(str, i) {
      var match = simpleEncodingRegExp.exec(str);
      if (!match) return null;
      var encoding = match[1];
      var q = 1;
      if (match[2]) {
        var params = match[2].split(";");
        for (var j = 0; j < params.length; j++) {
          var p = params[j].trim().split("=");
          if (p[0] === "q") {
            q = parseFloat(p[1]);
            break;
          }
        }
      }
      return {
        encoding,
        q,
        i
      };
    }
    function getEncodingPriority(encoding, accepted, index) {
      var priority = { o: -1, q: 0, s: 0 };
      for (var i = 0; i < accepted.length; i++) {
        var spec = specify(encoding, accepted[i], index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
          priority = spec;
        }
      }
      return priority;
    }
    function specify(encoding, spec, index) {
      var s = 0;
      if (spec.encoding.toLowerCase() === encoding.toLowerCase()) {
        s |= 1;
      } else if (spec.encoding !== "*") {
        return null;
      }
      return {
        i: index,
        o: spec.i,
        q: spec.q,
        s
      };
    }
    function preferredEncodings2(accept, provided) {
      var accepts = parseAcceptEncoding2(accept || "");
      if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map(getFullEncoding);
      }
      var priorities = provided.map(function getPriority(type, index) {
        return getEncodingPriority(type, accepts, index);
      });
      return priorities.filter(isQuality).sort(compareSpecs).map(function getEncoding(priority) {
        return provided[priorities.indexOf(priority)];
      });
    }
    function compareSpecs(a, b) {
      return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    function getFullEncoding(spec) {
      return spec.encoding;
    }
    function isQuality(spec) {
      return spec.q > 0;
    }
  }
});

// node_modules/negotiator/lib/language.js
var require_language = __commonJS({
  "node_modules/negotiator/lib/language.js"(exports, module) {
    "use strict";
    module.exports = preferredLanguages2;
    module.exports.preferredLanguages = preferredLanguages2;
    var simpleLanguageRegExp = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/;
    function parseAcceptLanguage2(accept) {
      var accepts = accept.split(",");
      for (var i = 0, j = 0; i < accepts.length; i++) {
        var language = parseLanguage(accepts[i].trim(), i);
        if (language) {
          accepts[j++] = language;
        }
      }
      accepts.length = j;
      return accepts;
    }
    function parseLanguage(str, i) {
      var match = simpleLanguageRegExp.exec(str);
      if (!match) return null;
      var prefix = match[1];
      var suffix = match[2];
      var full = prefix;
      if (suffix) full += "-" + suffix;
      var q = 1;
      if (match[3]) {
        var params = match[3].split(";");
        for (var j = 0; j < params.length; j++) {
          var p = params[j].split("=");
          if (p[0] === "q") q = parseFloat(p[1]);
        }
      }
      return {
        prefix,
        suffix,
        q,
        i,
        full
      };
    }
    function getLanguagePriority(language, accepted, index) {
      var priority = { o: -1, q: 0, s: 0 };
      for (var i = 0; i < accepted.length; i++) {
        var spec = specify(language, accepted[i], index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
          priority = spec;
        }
      }
      return priority;
    }
    function specify(language, spec, index) {
      var p = parseLanguage(language);
      if (!p) return null;
      var s = 0;
      if (spec.full.toLowerCase() === p.full.toLowerCase()) {
        s |= 4;
      } else if (spec.prefix.toLowerCase() === p.full.toLowerCase()) {
        s |= 2;
      } else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) {
        s |= 1;
      } else if (spec.full !== "*") {
        return null;
      }
      return {
        i: index,
        o: spec.i,
        q: spec.q,
        s
      };
    }
    function preferredLanguages2(accept, provided) {
      var accepts = parseAcceptLanguage2(accept === void 0 ? "*" : accept || "");
      if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map(getFullLanguage);
      }
      var priorities = provided.map(function getPriority(type, index) {
        return getLanguagePriority(type, accepts, index);
      });
      return priorities.filter(isQuality).sort(compareSpecs).map(function getLanguage(priority) {
        return provided[priorities.indexOf(priority)];
      });
    }
    function compareSpecs(a, b) {
      return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    function getFullLanguage(spec) {
      return spec.full;
    }
    function isQuality(spec) {
      return spec.q > 0;
    }
  }
});

// node_modules/negotiator/lib/mediaType.js
var require_mediaType = __commonJS({
  "node_modules/negotiator/lib/mediaType.js"(exports, module) {
    "use strict";
    module.exports = preferredMediaTypes2;
    module.exports.preferredMediaTypes = preferredMediaTypes2;
    var simpleMediaTypeRegExp = /^\s*([^\s\/;]+)\/([^;\s]+)\s*(?:;(.*))?$/;
    function parseAccept2(accept) {
      var accepts = splitMediaTypes(accept);
      for (var i = 0, j = 0; i < accepts.length; i++) {
        var mediaType = parseMediaType(accepts[i].trim(), i);
        if (mediaType) {
          accepts[j++] = mediaType;
        }
      }
      accepts.length = j;
      return accepts;
    }
    function parseMediaType(str, i) {
      var match = simpleMediaTypeRegExp.exec(str);
      if (!match) return null;
      var params = /* @__PURE__ */ Object.create(null);
      var q = 1;
      var subtype = match[2];
      var type = match[1];
      if (match[3]) {
        var kvps = splitParameters(match[3]).map(splitKeyValuePair);
        for (var j = 0; j < kvps.length; j++) {
          var pair = kvps[j];
          var key = pair[0].toLowerCase();
          var val = pair[1];
          var value = val && val[0] === '"' && val[val.length - 1] === '"' ? val.substr(1, val.length - 2) : val;
          if (key === "q") {
            q = parseFloat(value);
            break;
          }
          params[key] = value;
        }
      }
      return {
        type,
        subtype,
        params,
        q,
        i
      };
    }
    function getMediaTypePriority(type, accepted, index) {
      var priority = { o: -1, q: 0, s: 0 };
      for (var i = 0; i < accepted.length; i++) {
        var spec = specify(type, accepted[i], index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
          priority = spec;
        }
      }
      return priority;
    }
    function specify(type, spec, index) {
      var p = parseMediaType(type);
      var s = 0;
      if (!p) {
        return null;
      }
      if (spec.type.toLowerCase() == p.type.toLowerCase()) {
        s |= 4;
      } else if (spec.type != "*") {
        return null;
      }
      if (spec.subtype.toLowerCase() == p.subtype.toLowerCase()) {
        s |= 2;
      } else if (spec.subtype != "*") {
        return null;
      }
      var keys = Object.keys(spec.params);
      if (keys.length > 0) {
        if (keys.every(function(k) {
          return spec.params[k] == "*" || (spec.params[k] || "").toLowerCase() == (p.params[k] || "").toLowerCase();
        })) {
          s |= 1;
        } else {
          return null;
        }
      }
      return {
        i: index,
        o: spec.i,
        q: spec.q,
        s
      };
    }
    function preferredMediaTypes2(accept, provided) {
      var accepts = parseAccept2(accept === void 0 ? "*/*" : accept || "");
      if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map(getFullType);
      }
      var priorities = provided.map(function getPriority(type, index) {
        return getMediaTypePriority(type, accepts, index);
      });
      return priorities.filter(isQuality).sort(compareSpecs).map(function getType(priority) {
        return provided[priorities.indexOf(priority)];
      });
    }
    function compareSpecs(a, b) {
      return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    function getFullType(spec) {
      return spec.type + "/" + spec.subtype;
    }
    function isQuality(spec) {
      return spec.q > 0;
    }
    function quoteCount(string) {
      var count = 0;
      var index = 0;
      while ((index = string.indexOf('"', index)) !== -1) {
        count++;
        index++;
      }
      return count;
    }
    function splitKeyValuePair(str) {
      var index = str.indexOf("=");
      var key;
      var val;
      if (index === -1) {
        key = str;
      } else {
        key = str.substr(0, index);
        val = str.substr(index + 1);
      }
      return [key, val];
    }
    function splitMediaTypes(accept) {
      var accepts = accept.split(",");
      for (var i = 1, j = 0; i < accepts.length; i++) {
        if (quoteCount(accepts[j]) % 2 == 0) {
          accepts[++j] = accepts[i];
        } else {
          accepts[j] += "," + accepts[i];
        }
      }
      accepts.length = j + 1;
      return accepts;
    }
    function splitParameters(str) {
      var parameters = str.split(";");
      for (var i = 1, j = 0; i < parameters.length; i++) {
        if (quoteCount(parameters[j]) % 2 == 0) {
          parameters[++j] = parameters[i];
        } else {
          parameters[j] += ";" + parameters[i];
        }
      }
      parameters.length = j + 1;
      for (var i = 0; i < parameters.length; i++) {
        parameters[i] = parameters[i].trim();
      }
      return parameters;
    }
  }
});

// node_modules/statuses/codes.json
var require_codes = __commonJS({
  "node_modules/statuses/codes.json"(exports, module) {
    module.exports = {
      "100": "Continue",
      "101": "Switching Protocols",
      "102": "Processing",
      "103": "Early Hints",
      "200": "OK",
      "201": "Created",
      "202": "Accepted",
      "203": "Non-Authoritative Information",
      "204": "No Content",
      "205": "Reset Content",
      "206": "Partial Content",
      "207": "Multi-Status",
      "208": "Already Reported",
      "226": "IM Used",
      "300": "Multiple Choices",
      "301": "Moved Permanently",
      "302": "Found",
      "303": "See Other",
      "304": "Not Modified",
      "305": "Use Proxy",
      "307": "Temporary Redirect",
      "308": "Permanent Redirect",
      "400": "Bad Request",
      "401": "Unauthorized",
      "402": "Payment Required",
      "403": "Forbidden",
      "404": "Not Found",
      "405": "Method Not Allowed",
      "406": "Not Acceptable",
      "407": "Proxy Authentication Required",
      "408": "Request Timeout",
      "409": "Conflict",
      "410": "Gone",
      "411": "Length Required",
      "412": "Precondition Failed",
      "413": "Payload Too Large",
      "414": "URI Too Long",
      "415": "Unsupported Media Type",
      "416": "Range Not Satisfiable",
      "417": "Expectation Failed",
      "418": "I'm a Teapot",
      "421": "Misdirected Request",
      "422": "Unprocessable Entity",
      "423": "Locked",
      "424": "Failed Dependency",
      "425": "Too Early",
      "426": "Upgrade Required",
      "428": "Precondition Required",
      "429": "Too Many Requests",
      "431": "Request Header Fields Too Large",
      "451": "Unavailable For Legal Reasons",
      "500": "Internal Server Error",
      "501": "Not Implemented",
      "502": "Bad Gateway",
      "503": "Service Unavailable",
      "504": "Gateway Timeout",
      "505": "HTTP Version Not Supported",
      "506": "Variant Also Negotiates",
      "507": "Insufficient Storage",
      "508": "Loop Detected",
      "509": "Bandwidth Limit Exceeded",
      "510": "Not Extended",
      "511": "Network Authentication Required"
    };
  }
});

// node_modules/statuses/index.js
var require_statuses = __commonJS({
  "node_modules/statuses/index.js"(exports, module) {
    "use strict";
    var codes = require_codes();
    module.exports = status;
    status.message = codes;
    status.code = createMessageToStatusCodeMap(codes);
    status.codes = createStatusCodeList(codes);
    status.redirect = {
      300: true,
      301: true,
      302: true,
      303: true,
      305: true,
      307: true,
      308: true
    };
    status.empty = {
      204: true,
      205: true,
      304: true
    };
    status.retry = {
      502: true,
      503: true,
      504: true
    };
    function createMessageToStatusCodeMap(codes2) {
      var map = {};
      Object.keys(codes2).forEach(function forEachCode(code) {
        var message = codes2[code];
        var status2 = Number(code);
        map[message.toLowerCase()] = status2;
      });
      return map;
    }
    function createStatusCodeList(codes2) {
      return Object.keys(codes2).map(function mapCode(code) {
        return Number(code);
      });
    }
    function getStatusCode(message) {
      var msg = message.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(status.code, msg)) {
        throw new Error('invalid status message: "' + message + '"');
      }
      return status.code[msg];
    }
    function getStatusMessage(code) {
      if (!Object.prototype.hasOwnProperty.call(status.message, code)) {
        throw new Error("invalid status code: " + code);
      }
      return status.message[code];
    }
    function status(code) {
      if (typeof code === "number") {
        return getStatusMessage(code);
      }
      if (typeof code !== "string") {
        throw new TypeError("code must be a number or string");
      }
      var n = parseInt(code, 10);
      if (!isNaN(n)) {
        return getStatusMessage(n);
      }
      return getStatusCode(code);
    }
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    "use strict";
    exports.parse = parse2;
    exports.serialize = serialize;
    var __toString = Object.prototype.toString;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse2(str, options) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options || {};
      var dec = opt.decode || decode;
      var index = 0;
      while (index < str.length) {
        var eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) {
          break;
        }
        var endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = str.length;
        } else if (endIdx < eqIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var key = str.slice(index, eqIdx).trim();
        if (void 0 === obj[key]) {
          var val = str.slice(eqIdx + 1, endIdx).trim();
          if (val.charCodeAt(0) === 34) {
            val = val.slice(1, -1);
          }
          obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      }
      return obj;
    }
    function serialize(name, val, options) {
      var opt = options || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (null != opt.maxAge) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function decode(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function encode(val) {
      return encodeURIComponent(val);
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]" || val instanceof Date;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// node_modules/secure-json-parse/index.js
var require_secure_json_parse = __commonJS({
  "node_modules/secure-json-parse/index.js"(exports, module) {
    "use strict";
    var hasBuffer = typeof Buffer !== "undefined";
    var suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
    var suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
    function parse2(text, reviver, options) {
      if (options == null) {
        if (reviver !== null && typeof reviver === "object") {
          options = reviver;
          reviver = void 0;
        }
      }
      if (hasBuffer && Buffer.isBuffer(text)) {
        text = text.toString();
      }
      if (text && text.charCodeAt(0) === 65279) {
        text = text.slice(1);
      }
      const obj = JSON.parse(text, reviver);
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      const protoAction = options && options.protoAction || "error";
      const constructorAction = options && options.constructorAction || "error";
      if (protoAction === "ignore" && constructorAction === "ignore") {
        return obj;
      }
      if (protoAction !== "ignore" && constructorAction !== "ignore") {
        if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
          return obj;
        }
      } else if (protoAction !== "ignore" && constructorAction === "ignore") {
        if (suspectProtoRx.test(text) === false) {
          return obj;
        }
      } else {
        if (suspectConstructorRx.test(text) === false) {
          return obj;
        }
      }
      return filter(obj, { protoAction, constructorAction, safe: options && options.safe });
    }
    function filter(obj, { protoAction = "error", constructorAction = "error", safe } = {}) {
      let next = [obj];
      while (next.length) {
        const nodes = next;
        next = [];
        for (const node of nodes) {
          if (protoAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "__proto__")) {
            if (safe === true) {
              return null;
            } else if (protoAction === "error") {
              throw new SyntaxError("Object contains forbidden prototype property");
            }
            delete node.__proto__;
          }
          if (constructorAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "constructor") && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
            if (safe === true) {
              return null;
            } else if (constructorAction === "error") {
              throw new SyntaxError("Object contains forbidden prototype property");
            }
            delete node.constructor;
          }
          for (const key in node) {
            const value = node[key];
            if (value && typeof value === "object") {
              next.push(value);
            }
          }
        }
      }
      return obj;
    }
    function safeParse2(text, reviver) {
      try {
        return parse2(text, reviver, { safe: true });
      } catch (ignoreError) {
        return null;
      }
    }
    module.exports = parse2;
    module.exports.default = parse2;
    module.exports.parse = parse2;
    module.exports.safeParse = safeParse2;
    module.exports.scan = filter;
  }
});

// node_modules/@cfworker/web/dist/accepts.js
var import_charset = __toESM(require_charset());
var import_encoding = __toESM(require_encoding());
var import_language = __toESM(require_language());
var import_mediaType = __toESM(require_mediaType());
var parseAccept = import_mediaType.preferredMediaTypes;
var parseAcceptLanguage = import_language.preferredLanguages;
var parseAcceptEncoding = import_encoding.preferredEncodings;
var parseAcceptCharset = import_charset.preferredCharsets;
var Accepts = class {
  constructor(headers) {
    this.headers = headers;
    this._type = void 0;
    this._language = void 0;
    this._encoding = void 0;
    this._charset = void 0;
  }
  type(...values) {
    if (!this._type) {
      const header = this.headers.get("accept");
      this._type = header ? parseAccept(header.toLowerCase()) : [];
    }
    for (const accepted of this._type) {
      for (const value of values) {
        if (value === accepted || accepted.startsWith("*") && value.endsWith(accepted.substr(1)) || accepted.endsWith("*") && value.startsWith(accepted.substr(0, accepted.length - 2))) {
          return value;
        }
      }
    }
    return false;
  }
  language(...values) {
    if (!this._language) {
      const header = this.headers.get("accept-language");
      this._language = header ? parseAcceptLanguage(header.toLowerCase()) : [];
    }
    for (const accepted of this._language) {
      for (const value of values) {
        if (value === accepted || value.startsWith(accepted)) {
          return value;
        }
      }
    }
    return false;
  }
  encoding(...values) {
    if (!this._encoding) {
      const header = this.headers.get("accept-encoding");
      this._encoding = header ? parseAcceptEncoding(header.toLowerCase()) : [];
    }
    for (const accepted of this._encoding) {
      for (const value of values) {
        if (value === accepted) {
          return value;
        }
      }
    }
    return false;
  }
  charset(...values) {
    if (!this._charset) {
      const header = this.headers.get("accept-charset");
      this._charset = header ? parseAcceptCharset(header.toLowerCase()) : [];
    }
    for (const accepted of this._charset) {
      for (const value of values) {
        if (value === accepted) {
          return value;
        }
      }
    }
    return false;
  }
};

// node_modules/@cfworker/web/dist/application.js
var import_statuses3 = __toESM(require_statuses());

// node_modules/@cfworker/web/dist/cookies.js
var import_cookie = __toESM(require_cookie());
var noCookies = /* @__PURE__ */ Object.create(null);
var Cookies = class {
  constructor(requestHeaders, responseHeaders) {
    this.responseHeaders = responseHeaders;
    const cookie = requestHeaders.get("cookie");
    this.requestCookies = cookie ? (0, import_cookie.parse)(cookie) : noCookies;
  }
  get(name) {
    return this.requestCookies[name] || null;
  }
  set(name, val, options) {
    this.responseHeaders.append("Set-Cookie", (0, import_cookie.serialize)(name, val, options));
  }
};

// node_modules/@cfworker/web/dist/req.js
var import_secure_json_parse = __toESM(require_secure_json_parse());
var Req = class {
  constructor(request) {
    this.raw = request;
    this.method = request.method;
    this.url = new URL(request.url);
    this.headers = request.headers;
    this.params = /* @__PURE__ */ Object.create(null);
    this.accepts = new Accepts(request.headers);
    this.body = new ReqBody(request);
  }
};
var ReqBody = class {
  constructor(request) {
    this.request = request;
  }
  arrayBuffer() {
    if (!this._arrayBuffer) {
      this._arrayBuffer = this.request.arrayBuffer();
    }
    return this._arrayBuffer;
  }
  formData() {
    if (!this._formData) {
      this._formData = this.request.formData();
    }
    return this._formData;
  }
  json(reviver) {
    if (!this._json) {
      this._json = this.text().then((text) => (0, import_secure_json_parse.safeParse)(text, reviver));
    }
    return this._json;
  }
  text() {
    if (!this._text) {
      this._text = this.request.text();
    }
    return this._text;
  }
};

// node_modules/@cfworker/web/dist/response-builder.js
var import_statuses = __toESM(require_statuses());
var ResponseBuilder = class {
  constructor() {
    this.headers = new Headers();
    this._status = 404;
    this._explicitStatus = false;
    this._implicitType = false;
    this._body = null;
    this._stringifyBody = false;
  }
  get status() {
    return this._status;
  }
  set status(value) {
    this._explicitStatus = true;
    this._status = value;
    if (this.body && import_statuses.default.empty[value]) {
      this.body = null;
    }
  }
  get statusText() {
    return import_statuses.default.message[this._status];
  }
  get body() {
    return this._body;
  }
  set body(value) {
    this._body = value;
    if (value === null) {
      if (!import_statuses.default.empty[this.status]) {
        this._status = 204;
      }
      this.headers.delete("content-type");
      this.headers.delete("content-length");
      this.headers.delete("transfer-encoding");
      return;
    }
    if (!this._explicitStatus) {
      this._status = 200;
    }
    if (value instanceof Blob || value instanceof FormData || value instanceof URLSearchParams || ArrayBuffer.isView(value) || value instanceof ArrayBuffer || value instanceof ReadableStream) {
      this._stringifyBody = false;
      if (this._implicitType) {
        this._implicitType = false;
        this.headers.delete("content-type");
      }
    } else if (typeof value === "string") {
      this._stringifyBody = false;
      if (!this.headers.has("content-type") || this._implicitType) {
        this._implicitType = true;
        if (/^\s*</.test(value)) {
          this.headers.set("content-type", "text/html;charset=UTF-8");
        } else {
          this.headers.set("content-type", "text/plain;charset=UTF-8");
        }
      }
    } else {
      this._stringifyBody = true;
      this._implicitType = true;
      this.headers.set("content-type", "application/json;charset=UTF-8");
    }
  }
  redirect(url) {
    if (url instanceof URL) {
      url = url.href;
    }
    this.headers.set("location", url);
    if (!import_statuses.default.redirect[this.status]) {
      this.status = 302;
    }
    this.type = "text/plain;charset=UTF-8";
    this.body = `Redirecting to ${url}.`;
  }
  get type() {
    const type = this.headers.get("content-type");
    if (!type) {
      return "";
    }
    return type.split(";", 1)[0];
  }
  set type(value) {
    this._implicitType = false;
    if (value) {
      this.headers.set("content-type", value);
    } else {
      this.headers.delete("content-type");
    }
  }
  get lastModified() {
    const date = this.headers.get("last-modified");
    return date ? new Date(date) : null;
  }
  set lastModified(value) {
    if (value === null) {
      this.headers.delete("last-modified");
      return;
    }
    if (typeof value === "string") {
      value = new Date(value);
    }
    this.headers.set("last-modified", value.toUTCString());
  }
  get etag() {
    return this.headers.get("etag");
  }
  set etag(value) {
    if (value) {
      if (!/^(W\/)?"/.test(value)) {
        value = `"${value}"`;
      }
      this.headers.set("etag", value);
    } else {
      this.headers.delete("etag");
    }
  }
  create() {
    const { body: rawBody, status, statusText, headers } = this;
    const body = this._stringifyBody ? JSON.stringify(rawBody) : rawBody;
    return new Response(body, { status, statusText, headers });
  }
};

// node_modules/@cfworker/web/dist/context.js
var Context = class {
  constructor(event) {
    this.event = event;
    const request = event.request;
    this.req = new Req(request);
    this.res = new ResponseBuilder();
    this.cookies = new Cookies(request.headers, this.res.headers);
    this.responded = new Promise((resolve) => {
      this.respondWith = resolve;
    });
    this.state = {};
  }
  waitUntil(promise) {
    this.event.waitUntil(promise);
  }
};

// node_modules/@cfworker/web/dist/http-error.js
var import_statuses2 = __toESM(require_statuses());
var HttpError = class extends Error {
  constructor(status, body) {
    const statusText = import_statuses2.default.message[status];
    super(statusText);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
  toResponse() {
    let body = this.body || this.statusText;
    let contentType;
    if (typeof body === "string") {
      contentType = "text/plain";
    } else {
      contentType = "application/json";
      body = JSON.stringify(body);
    }
    const { status, statusText } = this;
    const headers = { "content-type": contentType };
    return new Response(body, { status, statusText, headers });
  }
};

// node_modules/@cfworker/web/dist/middleware.js
function composeMiddleware(middleware) {
  if (!Array.isArray(middleware))
    throw new TypeError("Middleware stack must be an array!");
  for (const fn of middleware) {
    if (typeof fn !== "function")
      throw new TypeError("Middleware must be composed of functions!");
  }
  return function(context, next) {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length)
        fn = next;
      if (!fn)
        return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

// node_modules/@cfworker/web/dist/application.js
var resolved = Promise.resolve();
var Application = class {
  constructor() {
    this.middleware = [];
  }
  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }
  listen() {
    const middleware = composeMiddleware(this.middleware);
    addEventListener("fetch", (event) => this.handleFetch(event, middleware));
  }
  handleFetch(event, middleware) {
    const context = new Context(event);
    event.respondWith(Promise.race([
      this.invokeMiddleware(context, middleware),
      context.responded
    ]));
  }
  async invokeMiddleware(context, middleware) {
    try {
      await middleware(context, () => resolved);
      return context.res.create();
    } catch (err) {
      console.error(err?.stack ?? err);
      if (err instanceof HttpError) {
        return err.toResponse();
      }
      const status = 500;
      const statusText = import_statuses3.default.message[500];
      const headers = { "content-type": "text/plain" };
      return new Response(statusText, { status, statusText, headers });
    }
  }
};

// node_modules/@cfworker/web/dist/normalize-pathname.js
function normalizePathname(pathname) {
  return decodeURIComponent(pathname).replace(/\/\/+/g, "/").normalize();
}
var normalizePathnameMiddleware = async ({ req }, next) => {
  const pathname = req.url.pathname;
  try {
    req.url.pathname = normalizePathname(pathname);
  } catch (err) {
    if (err instanceof URIError) {
      throw new HttpError(400, `Unable to decode pathname "${pathname}".`);
    }
    throw err;
  }
  await next();
};

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
  var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || defaultPattern,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            route += "((?:".concat(token.pattern, ")").concat(token.modifier, ")");
          } else {
            route += "(".concat(token.pattern, ")").concat(token.modifier);
          }
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}

// node_modules/@cfworker/web/dist/router.js
var Method = (method) => {
  method = method.toUpperCase();
  return ({ req }) => req.method === method;
};
var Get = Method("get");
var Post = Method("post");
var Put = Method("put");
var Patch = Method("patch");
var Delete = Method("delete");
var Head = Method("head");
var Options = Method("options");
var Path = (pattern, options) => {
  const keys = [];
  const regExp = pathToRegexp(pattern, keys, options);
  return ({ req: { url, params } }) => {
    const match = url.pathname.match(regExp);
    if (!match) {
      return false;
    }
    collectParameters(keys, match, params);
    return true;
  };
};
var defaultRouterOptions = {
  pathToRegExpOptions: { strict: true }
};
var Router = class {
  constructor(options = defaultRouterOptions) {
    this.options = options;
    this.middleware = async (ctx, next) => {
      const resolved2 = this.resolve(ctx);
      if (resolved2) {
        await resolved2.middleware(ctx, next);
      } else {
        await next();
      }
    };
    this.routes = [];
  }
  get(pathname, ...middleware) {
    const opts = this.options.pathToRegExpOptions;
    return this.compose([Get, Path(pathname, opts)], ...middleware);
  }
  post(pathname, ...middleware) {
    const opts = this.options.pathToRegExpOptions;
    return this.compose([Post, Path(pathname, opts)], ...middleware);
  }
  put(pathname, ...middleware) {
    const opts = this.options.pathToRegExpOptions;
    return this.compose([Put, Path(pathname, opts)], ...middleware);
  }
  patch(pathname, ...middleware) {
    const opts = this.options.pathToRegExpOptions;
    return this.compose([Patch, Path(pathname, opts)], ...middleware);
  }
  delete(pathname, ...middleware) {
    const opts = this.options.pathToRegExpOptions;
    return this.compose([Delete, Path(pathname, opts)], ...middleware);
  }
  head(pathname, ...middleware) {
    const opts = this.options.pathToRegExpOptions;
    return this.compose([Head, Path(pathname, opts)], ...middleware);
  }
  all(pathname, ...middleware) {
    const opts = this.options.pathToRegExpOptions;
    return this.compose([Path(pathname, opts)], ...middleware);
  }
  compose(conditions, ...middleware) {
    this.routes.push({
      conditions,
      middleware: composeMiddleware(middleware)
    });
    return this;
  }
  resolve(ctx) {
    return this.routes.find(({ conditions }) => conditions.length === 0 || conditions.every((c) => c(ctx)));
  }
};
function collectParameters(keys, match, params) {
  for (let i = 1; i < match.length; i++) {
    const name = keys[i - 1].name;
    const value = match[i];
    if (!value) {
      continue;
    }
    params[name] = decodeURIComponent(value);
  }
}

// src/index.js
var pass = "123";
var router = new Router();
async function randomString(len) {
  len = len || 6;
  let $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  let maxPos = $chars.length;
  let result = "";
  for (let i = 0; i < len; i++) {
    result += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}
async function randomnumber(len) {
  len = len || 5;
  let $chars = "0123456789";
  let maxPos = $chars.length;
  let result = "";
  for (let i = 0; i < len; i++) {
    result += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}
router.get("/", ({ res }) => {
  res.redirect("/index.html");
});
router.post(
  "/api",
  async ({ req, res }) => {
    let form = req.body.formData();
    let msg;
    let file = (await form).get("file");
    let url = await randomString();
    let code = await randomnumber();
    let check = await LINK.get(url);
    if (check !== null) {
      url = await randomString();
    }
    const code_check = await LINK.get(code);
    if (code_check !== null) {
      code = await randomnumber();
    }
    let stream = file.stream();
    const exp = 86400;
    await LINK.put(url, stream, {
      expirationTtl: exp,
      metadata: {
        size: file.size,
        name: file.name,
        date: (/* @__PURE__ */ new Date()).getTime(),
        link: req.url + "/file/" + url,
        type: file.type
      }
    });
    await LINK.put(code, req.url + "/file/" + url, {
      expirationTtl: exp,
      metadata: {
        size: file.size,
        name: file.name
      }
    });
    msg = {
      name: file.name,
      time: (/* @__PURE__ */ new Date()).getTime(),
      size: file.size,
      link: req.url + "/file/" + url,
      code
    };
    res.body = { msg };
  }
);
router.get("/api/file/:p", async ({ req, res }) => {
  let body = await LINK.get(req.params.p, { cacheTtl: 864e3, type: "stream" });
  const video = new RegExp("(.*?).(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)", "i");
  const media = new RegExp("(.*?).(png|jpe?g|gif|bmp|psd|tiff|tga|webp)", "i");
  const { metadata } = await LINK.getWithMetadata(req.params.p);
  if (video.test(metadata.name)) {
    res.type = metadata.type;
    res.headers.append("Accept-Ranges", "bytes");
    res.headers.append("Content-Disposition", `inline;filename=${metadata.name}`);
    res.body = body;
    return;
  }
  if (media.test(metadata.name)) {
    res.type = metadata.type;
    res.headers.append("Content-Disposition", `inline;filename=${metadata.name}`);
    res.body = body;
    return;
  }
  res.type = metadata.type;
  res.headers.append("Content-Disposition", `attachment;filename=${metadata.name}`);
  res.body = body;
});
router.get("/favicon.ico", ({ res }) => {
  res.type = "image/svg+xml";
  res.body = `
        <svg xmlns="http://www.w3.org/2000/svg" baseProfile="full" width="200" height="200">
          <rect width="100%" height="100%" fill="#F38020"/>
          <text font-size="120" font-family="Arial, Helvetica, sans-serif" text-anchor="end" fill="#FFF" x="185" y="185">W</text>
        </svg>`;
});
router.get("/code", async ({ req, res }) => {
  const paramas = req.url.searchParams;
  if (paramas.get("query") !== null) {
    const value = await LINK.get(paramas.get("query"));
    const { metadata } = await LINK.getWithMetadata(paramas.get("query"));
    if (value == null) {
      res.status = 400;
      res.body = { link: "\u9519\u8BEF\u7684\u5206\u4EAB\u7801" };
      return;
    }
    res.body = { link: { name: metadata.name, size: metadata.size, url: value } };
    console.log(value);
  }
});
router.get("/query", async ({ req, res }) => {
  const paramas = req.url.searchParams;
  if (paramas.get("pass") == pass) {
    const key = await LINK.list();
    if (key.keys == "") {
      res.status = 400;
      res.body = { info: "\u65E0\u5185\u5BB9\u53EF\u5C55\u793A" };
      return;
    }
    res.body = key;
  } else {
    res.status = 400;
    res.body = { info: "\u5BC6\u7801\u9519\u8BEF" };
  }
});
new Application().use(normalizePathnameMiddleware).use(router.middleware).listen();
/*! Bundled license information:

statuses/index.js:
  (*!
   * statuses
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
