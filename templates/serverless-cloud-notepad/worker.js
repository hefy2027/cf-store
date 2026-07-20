(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

  // node_modules/dayjs/dayjs.min.js
  var require_dayjs_min = __commonJS({
    "node_modules/dayjs/dayjs.min.js"(exports, module) {
      !function(t, e2) {
        typeof exports == "object" && typeof module != "undefined" ? module.exports = e2() : typeof define == "function" && define.amd ? define(e2) : (t = typeof globalThis != "undefined" ? globalThis : t || self).dayjs = e2();
      }(exports, function() {
        "use strict";
        var t = 1e3, e2 = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", f = "month", h = "quarter", c = "year", d = "date", $ = "Invalid Date", l = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_") }, m = function(t2, e3, n2) {
          var r2 = String(t2);
          return !r2 || r2.length >= e3 ? t2 : "" + Array(e3 + 1 - r2.length).join(n2) + t2;
        }, g = { s: m, z: function(t2) {
          var e3 = -t2.utcOffset(), n2 = Math.abs(e3), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
          return (e3 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
        }, m: function t2(e3, n2) {
          if (e3.date() < n2.date())
            return -t2(n2, e3);
          var r2 = 12 * (n2.year() - e3.year()) + (n2.month() - e3.month()), i2 = e3.clone().add(r2, f), s2 = n2 - i2 < 0, u2 = e3.clone().add(r2 + (s2 ? -1 : 1), f);
          return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
        }, a: function(t2) {
          return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
        }, p: function(t2) {
          return { M: f, y: c, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: h }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
        }, u: function(t2) {
          return t2 === void 0;
        } }, v = "en", D = {};
        D[v] = M;
        var p = function(t2) {
          return t2 instanceof _;
        }, S = function t2(e3, n2, r2) {
          var i2;
          if (!e3)
            return v;
          if (typeof e3 == "string") {
            var s2 = e3.toLowerCase();
            D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
            var u2 = e3.split("-");
            if (!i2 && u2.length > 1)
              return t2(u2[0]);
          } else {
            var a2 = e3.name;
            D[a2] = e3, i2 = a2;
          }
          return !r2 && i2 && (v = i2), i2 || !r2 && v;
        }, w = function(t2, e3) {
          if (p(t2))
            return t2.clone();
          var n2 = typeof e3 == "object" ? e3 : {};
          return n2.date = t2, n2.args = arguments, new _(n2);
        }, O = g;
        O.l = S, O.i = p, O.w = function(t2, e3) {
          return w(t2, { locale: e3.$L, utc: e3.$u, x: e3.$x, $offset: e3.$offset });
        };
        var _ = function() {
          function M2(t2) {
            this.$L = S(t2.locale, null, true), this.parse(t2);
          }
          var m2 = M2.prototype;
          return m2.parse = function(t2) {
            this.$d = function(t3) {
              var e3 = t3.date, n2 = t3.utc;
              if (e3 === null)
                return new Date(NaN);
              if (O.u(e3))
                return new Date();
              if (e3 instanceof Date)
                return new Date(e3);
              if (typeof e3 == "string" && !/Z$/i.test(e3)) {
                var r2 = e3.match(l);
                if (r2) {
                  var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                  return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
                }
              }
              return new Date(e3);
            }(t2), this.$x = t2.x || {}, this.init();
          }, m2.init = function() {
            var t2 = this.$d;
            this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
          }, m2.$utils = function() {
            return O;
          }, m2.isValid = function() {
            return !(this.$d.toString() === $);
          }, m2.isSame = function(t2, e3) {
            var n2 = w(t2);
            return this.startOf(e3) <= n2 && n2 <= this.endOf(e3);
          }, m2.isAfter = function(t2, e3) {
            return w(t2) < this.startOf(e3);
          }, m2.isBefore = function(t2, e3) {
            return this.endOf(e3) < w(t2);
          }, m2.$g = function(t2, e3, n2) {
            return O.u(t2) ? this[e3] : this.set(n2, t2);
          }, m2.unix = function() {
            return Math.floor(this.valueOf() / 1e3);
          }, m2.valueOf = function() {
            return this.$d.getTime();
          }, m2.startOf = function(t2, e3) {
            var n2 = this, r2 = !!O.u(e3) || e3, h2 = O.p(t2), $2 = function(t3, e4) {
              var i2 = O.w(n2.$u ? Date.UTC(n2.$y, e4, t3) : new Date(n2.$y, e4, t3), n2);
              return r2 ? i2 : i2.endOf(a);
            }, l2 = function(t3, e4) {
              return O.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e4)), n2);
            }, y2 = this.$W, M3 = this.$M, m3 = this.$D, g2 = "set" + (this.$u ? "UTC" : "");
            switch (h2) {
              case c:
                return r2 ? $2(1, 0) : $2(31, 11);
              case f:
                return r2 ? $2(1, M3) : $2(0, M3 + 1);
              case o:
                var v2 = this.$locale().weekStart || 0, D2 = (y2 < v2 ? y2 + 7 : y2) - v2;
                return $2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
              case a:
              case d:
                return l2(g2 + "Hours", 0);
              case u:
                return l2(g2 + "Minutes", 1);
              case s:
                return l2(g2 + "Seconds", 2);
              case i:
                return l2(g2 + "Milliseconds", 3);
              default:
                return this.clone();
            }
          }, m2.endOf = function(t2) {
            return this.startOf(t2, false);
          }, m2.$set = function(t2, e3) {
            var n2, o2 = O.p(t2), h2 = "set" + (this.$u ? "UTC" : ""), $2 = (n2 = {}, n2[a] = h2 + "Date", n2[d] = h2 + "Date", n2[f] = h2 + "Month", n2[c] = h2 + "FullYear", n2[u] = h2 + "Hours", n2[s] = h2 + "Minutes", n2[i] = h2 + "Seconds", n2[r] = h2 + "Milliseconds", n2)[o2], l2 = o2 === a ? this.$D + (e3 - this.$W) : e3;
            if (o2 === f || o2 === c) {
              var y2 = this.clone().set(d, 1);
              y2.$d[$2](l2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
            } else
              $2 && this.$d[$2](l2);
            return this.init(), this;
          }, m2.set = function(t2, e3) {
            return this.clone().$set(t2, e3);
          }, m2.get = function(t2) {
            return this[O.p(t2)]();
          }, m2.add = function(r2, h2) {
            var d2, $2 = this;
            r2 = Number(r2);
            var l2 = O.p(h2), y2 = function(t2) {
              var e3 = w($2);
              return O.w(e3.date(e3.date() + Math.round(t2 * r2)), $2);
            };
            if (l2 === f)
              return this.set(f, this.$M + r2);
            if (l2 === c)
              return this.set(c, this.$y + r2);
            if (l2 === a)
              return y2(1);
            if (l2 === o)
              return y2(7);
            var M3 = (d2 = {}, d2[s] = e2, d2[u] = n, d2[i] = t, d2)[l2] || 1, m3 = this.$d.getTime() + r2 * M3;
            return O.w(m3, this);
          }, m2.subtract = function(t2, e3) {
            return this.add(-1 * t2, e3);
          }, m2.format = function(t2) {
            var e3 = this, n2 = this.$locale();
            if (!this.isValid())
              return n2.invalidDate || $;
            var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = O.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, f2 = n2.months, h2 = function(t3, n3, i3, s3) {
              return t3 && (t3[n3] || t3(e3, r2)) || i3[n3].slice(0, s3);
            }, c2 = function(t3) {
              return O.s(s2 % 12 || 12, t3, "0");
            }, d2 = n2.meridiem || function(t3, e4, n3) {
              var r3 = t3 < 12 ? "AM" : "PM";
              return n3 ? r3.toLowerCase() : r3;
            }, l2 = { YY: String(this.$y).slice(-2), YYYY: this.$y, M: a2 + 1, MM: O.s(a2 + 1, 2, "0"), MMM: h2(n2.monthsShort, a2, f2, 3), MMMM: h2(f2, a2), D: this.$D, DD: O.s(this.$D, 2, "0"), d: String(this.$W), dd: h2(n2.weekdaysMin, this.$W, o2, 2), ddd: h2(n2.weekdaysShort, this.$W, o2, 3), dddd: o2[this.$W], H: String(s2), HH: O.s(s2, 2, "0"), h: c2(1), hh: c2(2), a: d2(s2, u2, true), A: d2(s2, u2, false), m: String(u2), mm: O.s(u2, 2, "0"), s: String(this.$s), ss: O.s(this.$s, 2, "0"), SSS: O.s(this.$ms, 3, "0"), Z: i2 };
            return r2.replace(y, function(t3, e4) {
              return e4 || l2[t3] || i2.replace(":", "");
            });
          }, m2.utcOffset = function() {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }, m2.diff = function(r2, d2, $2) {
            var l2, y2 = O.p(d2), M3 = w(r2), m3 = (M3.utcOffset() - this.utcOffset()) * e2, g2 = this - M3, v2 = O.m(this, M3);
            return v2 = (l2 = {}, l2[c] = v2 / 12, l2[f] = v2, l2[h] = v2 / 3, l2[o] = (g2 - m3) / 6048e5, l2[a] = (g2 - m3) / 864e5, l2[u] = g2 / n, l2[s] = g2 / e2, l2[i] = g2 / t, l2)[y2] || g2, $2 ? v2 : O.a(v2);
          }, m2.daysInMonth = function() {
            return this.endOf(f).$D;
          }, m2.$locale = function() {
            return D[this.$L];
          }, m2.locale = function(t2, e3) {
            if (!t2)
              return this.$L;
            var n2 = this.clone(), r2 = S(t2, e3, true);
            return r2 && (n2.$L = r2), n2;
          }, m2.clone = function() {
            return O.w(this.$d, this);
          }, m2.toDate = function() {
            return new Date(this.valueOf());
          }, m2.toJSON = function() {
            return this.isValid() ? this.toISOString() : null;
          }, m2.toISOString = function() {
            return this.$d.toISOString();
          }, m2.toString = function() {
            return this.$d.toUTCString();
          }, M2;
        }(), T = _.prototype;
        return w.prototype = T, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", f], ["$y", c], ["$D", d]].forEach(function(t2) {
          T[t2[1]] = function(e3) {
            return this.$g(e3, t2[0], t2[1]);
          };
        }), w.extend = function(t2, e3) {
          return t2.$i || (t2(e3, _, w), t2.$i = true), w;
        }, w.locale = S, w.isDayjs = p, w.unix = function(t2) {
          return w(1e3 * t2);
        }, w.en = D[v], w.Ls = D, w.p = {}, w;
      });
    }
  });

  // node_modules/cookie/index.js
  var require_cookie = __commonJS({
    "node_modules/cookie/index.js"(exports) {
      "use strict";
      exports.parse = parse;
      exports.serialize = serialize;
      var __toString = Object.prototype.toString;
      var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
      function parse(str, options) {
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
          if (obj[key] === void 0) {
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
        if (opt.maxAge != null) {
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
        } catch (e2) {
          return str;
        }
      }
    }
  });

  // node_modules/@tsndr/cloudflare-worker-jwt/index.js
  var require_cloudflare_worker_jwt = __commonJS({
    "node_modules/@tsndr/cloudflare-worker-jwt/index.js"(exports, module) {
      var Base64URL = class {
        static parse(s) {
          return new Uint8Array(Array.prototype.map.call(atob(s.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), (c) => c.charCodeAt(0)));
        }
        static stringify(a) {
          return btoa(String.fromCharCode.apply(0, a)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
        }
      };
      var JWT = class {
        constructor() {
          if (typeof crypto === "undefined" || !crypto.subtle)
            throw new Error("Crypto not supported!");
          this.algorithms = {
            ES256: { name: "ECDSA", namedCurve: "P-256", hash: { name: "SHA-256" } },
            ES384: { name: "ECDSA", namedCurve: "P-384", hash: { name: "SHA-384" } },
            ES512: { name: "ECDSA", namedCurve: "P-512", hash: { name: "SHA-512" } },
            HS256: { name: "HMAC", hash: { name: "SHA-256" } },
            HS384: { name: "HMAC", hash: { name: "SHA-384" } },
            HS512: { name: "HMAC", hash: { name: "SHA-512" } },
            RS256: { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
            RS384: { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-384" } },
            RS512: { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-512" } }
          };
        }
        _utf8ToUint8Array(str) {
          return Base64URL.parse(btoa(unescape(encodeURIComponent(str))));
        }
        _str2ab(str) {
          const buf = new ArrayBuffer(str.length);
          const bufView = new Uint8Array(buf);
          for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
          }
          return buf;
        }
        _decodePayload(raw) {
          switch (raw.length % 4) {
            case 0:
              break;
            case 2:
              raw += "==";
              break;
            case 3:
              raw += "=";
              break;
            default:
              throw new Error("Illegal base64url string!");
          }
          try {
            return JSON.parse(decodeURIComponent(escape(atob(raw))));
          } catch {
            return null;
          }
        }
        async sign(payload, secret, options = { algorithm: "HS256" }) {
          if (typeof options === "string")
            options = { algorithm: options };
          if (payload === null || typeof payload !== "object")
            throw new Error("payload must be an object");
          if (typeof secret !== "string")
            throw new Error("secret must be a string");
          if (typeof options.algorithm !== "string")
            throw new Error("options.algorithm must be a string");
          const importAlgorithm = this.algorithms[options.algorithm];
          if (!importAlgorithm)
            throw new Error("algorithm not found");
          payload.iat = Math.floor(Date.now() / 1e3);
          const payloadAsJSON = JSON.stringify(payload);
          const partialToken = `${Base64URL.stringify(this._utf8ToUint8Array(JSON.stringify({ alg: options.algorithm, kid: options.keyid })))}.${Base64URL.stringify(this._utf8ToUint8Array(payloadAsJSON))}`;
          let keyFormat = "raw";
          let keyData;
          if (secret.startsWith("-----BEGIN")) {
            keyFormat = "pkcs8";
            keyData = this._str2ab(atob(secret.replace(/-----BEGIN.*?-----/g, "").replace(/-----END.*?-----/g, "").replace(/\s/g, "")));
          } else
            keyData = this._utf8ToUint8Array(secret);
          const key = await crypto.subtle.importKey(keyFormat, keyData, importAlgorithm, false, ["sign"]);
          const signature = await crypto.subtle.sign(importAlgorithm, key, this._utf8ToUint8Array(partialToken));
          return `${partialToken}.${Base64URL.stringify(new Uint8Array(signature))}`;
        }
        async verify(token, secret, options = { algorithm: "HS256" }) {
          if (typeof options === "string")
            options = { algorithm: options };
          if (typeof token !== "string")
            throw new Error("token must be a string");
          if (typeof secret !== "string")
            throw new Error("secret must be a string");
          if (typeof options.algorithm !== "string")
            throw new Error("options.algorithm must be a string");
          const tokenParts = token.split(".");
          if (tokenParts.length !== 3)
            throw new Error("token must consist of 3 parts");
          const importAlgorithm = this.algorithms[options.algorithm];
          if (!importAlgorithm)
            throw new Error("algorithm not found");
          const payload = this.decode(token);
          if (payload.nbf && payload.nbf > Math.floor(Date.now() / 1e3))
            return false;
          if (payload.exp && payload.exp <= Math.floor(Date.now() / 1e3))
            return false;
          let keyFormat = "raw";
          let keyData;
          if (secret.startsWith("-----BEGIN")) {
            keyFormat = "pkcs8";
            keyData = this._str2ab(atob(secret.replace(/-----BEGIN.*?-----/g, "").replace(/-----END.*?-----/g, "").replace(/\s/g, "")));
          } else
            keyData = this._utf8ToUint8Array(secret);
          const key = await crypto.subtle.importKey(keyFormat, keyData, importAlgorithm, false, ["sign"]);
          const res = await crypto.subtle.sign(importAlgorithm, key, this._utf8ToUint8Array(tokenParts.slice(0, 2).join(".")));
          return Base64URL.stringify(new Uint8Array(res)) === tokenParts[2];
        }
        decode(token) {
          return this._decodePayload(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
        }
      };
      module.exports = new JWT();
    }
  });

  // node_modules/dayjs/plugin/relativeTime.js
  var require_relativeTime = __commonJS({
    "node_modules/dayjs/plugin/relativeTime.js"(exports, module) {
      !function(r, e2) {
        typeof exports == "object" && typeof module != "undefined" ? module.exports = e2() : typeof define == "function" && define.amd ? define(e2) : (r = typeof globalThis != "undefined" ? globalThis : r || self).dayjs_plugin_relativeTime = e2();
      }(exports, function() {
        "use strict";
        return function(r, e2, t) {
          r = r || {};
          var n = e2.prototype, o = { future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" };
          function i(r2, e3, t2, o2) {
            return n.fromToBase(r2, e3, t2, o2);
          }
          t.en.relativeTime = o, n.fromToBase = function(e3, n2, i2, d2, u) {
            for (var f, a, s, l = i2.$locale().relativeTime || o, h = r.thresholds || [{ l: "s", r: 44, d: "second" }, { l: "m", r: 89 }, { l: "mm", r: 44, d: "minute" }, { l: "h", r: 89 }, { l: "hh", r: 21, d: "hour" }, { l: "d", r: 35 }, { l: "dd", r: 25, d: "day" }, { l: "M", r: 45 }, { l: "MM", r: 10, d: "month" }, { l: "y", r: 17 }, { l: "yy", d: "year" }], m = h.length, c = 0; c < m; c += 1) {
              var y = h[c];
              y.d && (f = d2 ? t(e3).diff(i2, y.d, true) : i2.diff(e3, y.d, true));
              var p = (r.rounding || Math.round)(Math.abs(f));
              if (s = f > 0, p <= y.r || !y.r) {
                p <= 1 && c > 0 && (y = h[c - 1]);
                var v = l[y.l];
                u && (p = u("" + p)), a = typeof v == "string" ? v.replace("%d", p) : v(p, n2, y.l, s);
                break;
              }
            }
            if (n2)
              return a;
            var M = s ? l.future : l.past;
            return typeof M == "function" ? M(a) : M.replace("%s", a);
          }, n.to = function(r2, e3) {
            return i(r2, e3, this, true);
          }, n.from = function(r2, e3) {
            return i(r2, e3, this);
          };
          var d = function(r2) {
            return r2.$u ? t.utc() : t();
          };
          n.toNow = function(r2) {
            return this.to(d(this), r2);
          }, n.fromNow = function(r2) {
            return this.from(d(this), r2);
          };
        };
      });
    }
  });

  // src/index.js
  var import_dayjs2 = __toESM(require_dayjs_min());

  // node_modules/itty-router/dist/itty-router.min.mjs
  function e({ base: t = "", routes: n = [] } = {}) {
    return { __proto__: new Proxy({}, { get: (e2, a, o) => (e3, ...r) => n.push([a.toUpperCase(), RegExp(`^${(t + e3).replace(/(\/?)\*/g, "($1.*)?").replace(/\/$/, "").replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/, "\\.").replace(/\)\.\?\(([^\[]+)\[\^/g, "?)\\.?($1(?<=\\.)[^\\.")}/*$`), r]) && o }), routes: n, async handle(e2, ...r) {
      let a, o, t2 = new URL(e2.url);
      e2.query = Object.fromEntries(t2.searchParams);
      for (var [p, s, u] of n)
        if ((p === e2.method || p === "ALL") && (o = t2.pathname.match(s))) {
          e2.params = o.groups;
          for (var c of u)
            if ((a = await c(e2.proxy || e2, ...r)) !== void 0)
              return a;
        }
    } };
  }

  // src/index.js
  var import_cookie = __toESM(require_cookie());
  var import_cloudflare_worker_jwt2 = __toESM(require_cloudflare_worker_jwt());

  // src/helper.js
  var import_cloudflare_worker_jwt = __toESM(require_cloudflare_worker_jwt());

  // src/template.js
  var template_exports = {};
  __export(template_exports, {
    Edit: () => Edit,
    NeedPasswd: () => NeedPasswd,
    Page404: () => Page404,
    Share: () => Share
  });
  var import_dayjs = __toESM(require_dayjs_min());
  var import_relativeTime = __toESM(require_relativeTime());

  // src/constant.js
  var CDN_PREFIX = "//gcore.jsdelivr.net/gh/s0urcelab/serverless-cloud-notepad@master/static";
  var SALT = SCN_SALT;
  var SECRET = SCN_SECRET;
  var SUPPORTED_LANG = {
    "en": {
      setPW: "Set Password",
      changePW: "Change Password",
      share: "Share",
      lastModified: "Last Modified",
      copy: "Copy",
      emptyPH: "There are many like it, but this one is mine...",
      tipEncrypt: "This Note has been encrypted, please enter password!",
      tip404: "404, Nothing here"
    },
    "zh": {
      setPW: "\u8BBE\u7F6E\u5BC6\u7801",
      changePW: "\u4FEE\u6539\u5BC6\u7801",
      share: "\u5206\u4EAB",
      lastModified: "\u4E0A\u6B21\u4FDD\u5B58",
      copy: "\u590D\u5236",
      emptyPH: "\u770B\u6765\u4F60\u662F\u7B2C\u4E00\u4E2A\u5230\u8FD9\u513F\u7684\u4EBA\uFF0C\u5199\u70B9\u4EC0\u4E48\u5427...",
      tipEncrypt: "\u8FD9\u662F\u4E00\u7BC7\u52A0\u5BC6\u7B14\u8BB0\uFF0C\u4F60\u5FC5\u987B\u5148\u8F93\u5165\u5BC6\u7801",
      tip404: "404\uFF0C\u4F60\u8981\u627E\u7684\u4E1C\u897F\u5E76\u4E0D\u5B58\u5728"
    }
  };

  // src/template.js
  import_dayjs.default.extend(import_relativeTime.default);
  var SWITCHER = (text, open, className = "") => `
<span class="opt-desc">${text}</span>
<label class="opt-switcher ${className}">
  <input type="checkbox" ${open ? "checked" : ""}>
  <span class="slider round"></span>
</label>
`;
  var FOOTER = ({ lang, isEdit, updateAt, pw, mode, share }) => `
    <div class="footer">
        ${isEdit ? `
            <div class="opt">
                <button class="opt-button opt-pw">${pw ? SUPPORTED_LANG[lang].changePW : SUPPORTED_LANG[lang].setPW}</button>
                ${SWITCHER("Markdown", mode === "md", "opt-mode")}
                ${SWITCHER(SUPPORTED_LANG[lang].share, share, "opt-share")}
            </div>
            ` : ""}
        <a class="github-link" title="Github" target="_blank" href="https://github.com/s0urcelab/serverless-cloud-notepad" rel="noreferrer">
            <svg viewBox="64 64 896 896" focusable="false" data-icon="github" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>
        </a>
        ${updateAt ? `<span class="last-modified">${SUPPORTED_LANG[lang].lastModified} ${import_dayjs.default.unix(updateAt).fromNow()}</span>` : ""}
    </div>
`;
  var MODAL = (lang) => `
<div class="modal share-modal">
    <div class="modal-mask"></div>
    <div class="modal-content">
        <span class="close-btn">x</span>
        <div class="modal-body">
            <input type="text" readonly value="" />
            <button class="opt-button">${SUPPORTED_LANG[lang].copy}</button>
        </div>
    </div>
</div>
`;
  var HTML = ({ lang, title, content, ext = {}, tips, isEdit, showPwPrompt }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} \u2014 Cloud Notepad</title>
    <link href="${CDN_PREFIX}/favicon.ico" rel="shortcut icon" type="image/ico" />
    <link href="${CDN_PREFIX}/css/app.min.css" rel="stylesheet" media="screen" />
</head>
<body>
    <div class="note-container">
        <div class="stack">
            <div class="layer_1">
                <div class="layer_2">
                    <div class="layer_3">
                        ${tips ? `<div class="tips">${tips}</div>` : ""}
                        <textarea id="contents" class="contents ${isEdit ? "" : "hide"}" spellcheck="true" placeholder="${SUPPORTED_LANG[lang].emptyPH}">${content}</textarea>
                        ${isEdit && ext.mode === "md" ? '<div class="divide-line"></div>' : ""}
                        ${tips || isEdit && ext.mode !== "md" ? "" : `<div id="preview-${ext.mode || "plain"}" class="contents"></div>`}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="loading"></div>
    ${MODAL(lang)}
    ${FOOTER({ ...ext, isEdit, lang })}
    ${ext.mode === "md" || ext.share ? `<script src="${CDN_PREFIX}/js/purify.min.js"><\/script>` : ""}
    ${ext.mode === "md" ? `<script src="${CDN_PREFIX}/js/marked.min.js"><\/script>` : ""}
    <script src="${CDN_PREFIX}/js/clip.min.js"><\/script>
    <script src="${CDN_PREFIX}/js/app.min.js"><\/script>
    ${showPwPrompt ? "<script>passwdPrompt()<\/script>" : ""}
</body>
</html>
`;
  var Edit = (data) => HTML({ isEdit: true, ...data });
  var Share = (data) => HTML(data);
  var NeedPasswd = (data) => HTML({ tips: SUPPORTED_LANG[data.lang].tipEncrypt, showPwPrompt: true, ...data });
  var Page404 = (data) => HTML({ tips: SUPPORTED_LANG[data.lang].tip404, ...data });

  // src/helper.js
  var genRandomStr = (n) => {
    const charset = "2345679abcdefghjkmnpqrstwxyz";
    return Array(n).join().split(",").map(() => charset.charAt(Math.floor(Math.random() * charset.length))).join("");
  };
  function returnPage(type, data) {
    return new Response(template_exports[type](data), {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    });
  }
  function returnJSON(code, data, headers = {}) {
    const successTempl = {
      err: 0,
      msg: "ok",
      ...data && { data }
    };
    const errTempl = {
      err: code,
      msg: JSON.stringify(data)
    };
    const ret = code ? errTempl : successTempl;
    return new Response(JSON.stringify(ret), {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        ...headers
      }
    });
  }
  async function MD5(str) {
    const msgUint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("MD5", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async function saltPw(password) {
    const hashPw = await MD5(password);
    return await MD5(`${hashPw}+${SALT}`);
  }
  async function checkAuth(cookie, path) {
    if (cookie.auth) {
      const valid = await import_cloudflare_worker_jwt.default.verify(cookie.auth, SECRET);
      if (valid) {
        const payload = import_cloudflare_worker_jwt.default.decode(cookie.auth);
        if (payload.path === path) {
          return true;
        }
      }
    }
    return false;
  }
  async function queryNote(key) {
    const result = await NOTES.getWithMetadata(key);
    return {
      value: result.value || "",
      metadata: result.metadata || {}
    };
  }
  function getI18n(request) {
    const DEFAULT_LANG = "en";
    const al = request.headers.get("Accept-Language") || DEFAULT_LANG;
    const acceptList = al.split(",").map((lang) => lang.split(";")[0].trim());
    return acceptList.find((lang) => Object.keys(SUPPORTED_LANG).includes(lang)) || DEFAULT_LANG;
  }

  // src/index.js
  var router = e();
  router.get("/", ({ url }) => {
    const newHash = genRandomStr(3);
    return Response.redirect(`${url}${newHash}`, 302);
  });
  router.get("/share/:md5", async (request) => {
    const lang = getI18n(request);
    const { md5 } = request.params;
    const path = await SHARE.get(md5);
    if (!!path) {
      const { value, metadata } = await queryNote(path);
      return returnPage("Share", {
        lang,
        title: decodeURIComponent(path),
        content: value,
        ext: metadata
      });
    }
    return returnPage("Page404", { lang, title: "404" });
  });
  router.get("/:path", async (request) => {
    const lang = getI18n(request);
    const { path } = request.params;
    const title = decodeURIComponent(path);
    const cookie = import_cookie.default.parse(request.headers.get("Cookie") || "");
    const { value, metadata } = await queryNote(path);
    if (!metadata.pw) {
      return returnPage("Edit", {
        lang,
        title,
        content: value,
        ext: metadata
      });
    }
    const valid = await checkAuth(cookie, path);
    if (valid) {
      return returnPage("Edit", {
        lang,
        title,
        content: value,
        ext: metadata
      });
    }
    return returnPage("NeedPasswd", { lang, title });
  });
  router.post("/:path/auth", async (request) => {
    const { path } = request.params;
    if (request.headers.get("Content-Type") === "application/json") {
      const { passwd } = await request.json();
      const { metadata } = await queryNote(path);
      if (metadata.pw) {
        const storePw = await saltPw(passwd);
        if (metadata.pw === storePw) {
          const token = await import_cloudflare_worker_jwt2.default.sign({ path }, SECRET);
          return returnJSON(0, {
            refresh: true
          }, {
            "Set-Cookie": import_cookie.default.serialize("auth", token, {
              path: `/${path}`,
              expires: (0, import_dayjs2.default)().add(7, "day").toDate(),
              httpOnly: true
            })
          });
        }
      }
    }
    return returnJSON(10002, "Password auth failed!");
  });
  router.post("/:path/pw", async (request) => {
    const { path } = request.params;
    if (request.headers.get("Content-Type") === "application/json") {
      const cookie = import_cookie.default.parse(request.headers.get("Cookie") || "");
      const { passwd } = await request.json();
      const { value, metadata } = await queryNote(path);
      const valid = await checkAuth(cookie, path);
      if (!metadata.pw || valid) {
        const pw = passwd ? await saltPw(passwd) : void 0;
        try {
          await NOTES.put(path, value, {
            metadata: {
              ...metadata,
              pw
            }
          });
          return returnJSON(0, null, {
            "Set-Cookie": import_cookie.default.serialize("auth", "", {
              path: `/${path}`,
              expires: (0, import_dayjs2.default)().subtract(100, "day").toDate(),
              httpOnly: true
            })
          });
        } catch (error) {
          console.error(error);
        }
      }
      return returnJSON(10003, "Password setting failed!");
    }
  });
  router.post("/:path/setting", async (request) => {
    const { path } = request.params;
    if (request.headers.get("Content-Type") === "application/json") {
      const cookie = import_cookie.default.parse(request.headers.get("Cookie") || "");
      const { mode, share } = await request.json();
      const { value, metadata } = await queryNote(path);
      const valid = await checkAuth(cookie, path);
      if (!metadata.pw || valid) {
        try {
          await NOTES.put(path, value, {
            metadata: {
              ...metadata,
              ...mode !== void 0 && { mode },
              ...share !== void 0 && { share }
            }
          });
          const md5 = await MD5(path);
          if (share) {
            await SHARE.put(md5, path);
            return returnJSON(0, md5);
          }
          if (share === false) {
            await SHARE.delete(md5);
          }
          return returnJSON(0);
        } catch (error) {
          console.error(error);
        }
      }
      return returnJSON(10004, "Update Setting failed!");
    }
  });
  router.post("/:path", async (request) => {
    const { path } = request.params;
    const { value, metadata } = await queryNote(path);
    const cookie = import_cookie.default.parse(request.headers.get("Cookie") || "");
    const valid = await checkAuth(cookie, path);
    if (!metadata.pw || valid) {
    } else {
      return returnJSON(10002, "Password auth failed! Try refreshing this page if you had just set a password.");
    }
    const formData = await request.formData();
    const content = formData.get("t");
    try {
      if (content?.trim()) {
        await NOTES.put(path, content, {
          metadata: {
            ...metadata,
            updateAt: (0, import_dayjs2.default)().unix()
          }
        });
      } else {
        await NOTES.delete(path);
      }
      return returnJSON(0);
    } catch (error) {
      console.error(error);
    }
    return returnJSON(10001, "KV insert fail!");
  });
  router.all("*", (request) => {
    const lang = getI18n(request);
    returnPage("Page404", { lang, title: "404" });
  });
  addEventListener("fetch", (event) => {
    event.respondWith(router.handle(event.request));
  });
})();
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
