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

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
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
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
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
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
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
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
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
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
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
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
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
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
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
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
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

// src/worker/crypto.ts
var encoder = new TextEncoder();
var passwordPbkdf2Iterations = 1e5;
function nowSeconds() {
  return Math.floor(Date.now() / 1e3);
}
function newId() {
  return crypto.randomUUID();
}
function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}
async function sha256Hex(input) {
  const data = typeof input === "string" ? encoder.encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return hex(new Uint8Array(digest));
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, passwordPbkdf2Iterations);
  return `pbkdf2$${passwordPbkdf2Iterations}$${base64Url(salt)}$${base64Url(hash)}`;
}
async function verifyPassword(password, stored) {
  const [scheme, rounds, saltValue, hashValue] = stored.split("$");
  const iterations = Number.parseInt(rounds ?? "", 10);
  if (scheme !== "pbkdf2" || !Number.isInteger(iterations) || iterations < 1 || iterations > passwordPbkdf2Iterations || !saltValue || !hashValue) {
    return false;
  }
  const salt = base64UrlDecode(saltValue);
  const expected = base64UrlDecode(hashValue);
  const actual = await derivePassword(password, salt, iterations);
  return timingSafeEqual(actual, expected);
}
async function derivePassword(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: copyToArrayBuffer(salt),
      iterations
    },
    key,
    256
  );
  return new Uint8Array(bits);
}
function copyToArrayBuffer(bytes) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
function hex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function base64UrlDecode(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// src/worker/db.ts
async function audit(env, input) {
  void env;
  void input;
}
async function countUsers(env) {
  const row = await env.DB.prepare("select count(*) as count from users").first();
  return row?.count ?? 0;
}
async function getUserByUsername(env, username) {
  return await env.DB.prepare("select * from users where username = ?").bind(username).first();
}
async function getSessionUser(env, tokenHash, now = nowSeconds()) {
  return await env.DB.prepare(
    `select u.id, u.username, u.role, u.expires_at
     from sessions s
     join users u on u.id = s.user_id
     where s.token_hash = ?
       and s.expires_at > ?
       and u.disabled_at is null
       and (u.expires_at is null or u.expires_at > ?)`
  ).bind(tokenHash, now, now).first();
}
async function getFolder(env, id) {
  return await env.DB.prepare("select * from folders where id = ?").bind(id).first();
}
async function getFile(env, id) {
  return await env.DB.prepare("select * from files where id = ?").bind(id).first();
}
async function isFolderAvailable(env, folderId, now = nowSeconds()) {
  let current = await getFolder(env, folderId);
  let guard = 0;
  while (current && guard < 4) {
    if (current.trashed_at || isExpired(current.expires_at, now)) {
      return false;
    }
    current = current.parent_id ? await getFolder(env, current.parent_id) : null;
    guard += 1;
  }
  return true;
}
async function getEffectiveFolderExpiration(env, folderId) {
  let current = await getFolder(env, folderId);
  let guard = 0;
  while (current && guard < 4) {
    if (current.expires_at != null) {
      return current.expires_at;
    }
    current = current.parent_id ? await getFolder(env, current.parent_id) : null;
    guard += 1;
  }
  return null;
}
async function isFileReadable(env, file, now = nowSeconds()) {
  if (file.deleted_at || file.trashed_at || isExpired(file.expires_at, now)) {
    return false;
  }
  return await isFolderAvailable(env, file.folder_id, now);
}
function filterVisibleFolders(folders, now = nowSeconds()) {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  return folders.filter((folder) => {
    let current = folder;
    let guard = 0;
    while (current && guard < 4) {
      if (current.trashed_at || isExpired(current.expires_at, now)) {
        return false;
      }
      current = current.parent_id ? byId.get(current.parent_id) : void 0;
      guard += 1;
    }
    return true;
  });
}
function isExpired(expiresAt, now) {
  return expiresAt != null && expiresAt <= now;
}

// src/worker/http.ts
function jsonError(_context, status, code, message) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
function getCookie(request, name) {
  const header = request.headers.get("Cookie");
  if (!header) {
    return null;
  }
  for (const item of header.split(";")) {
    const [rawKey, ...rawValue] = item.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return null;
}
function sessionCookie(token, maxAgeSeconds) {
  return [
    `cfshare_session=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`
  ].join("; ");
}
function clearSessionCookie() {
  return "cfshare_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}

// src/worker/range.ts
function parseRange(header, totalSize) {
  if (!header) {
    return null;
  }
  const match2 = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match2) {
    return null;
  }
  const startText = match2[1];
  const endText = match2[2];
  if (!startText && !endText) {
    return null;
  }
  let start;
  let end;
  if (!startText) {
    const suffixLength = Number.parseInt(endText, 10);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
      return null;
    }
    start = Math.max(totalSize - suffixLength, 0);
    end = totalSize - 1;
  } else {
    start = Number.parseInt(startText, 10);
    end = endText ? Number.parseInt(endText, 10) : totalSize - 1;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= totalSize) {
    return null;
  }
  end = Math.min(end, totalSize - 1);
  return {
    offset: start,
    end,
    length: end - start + 1
  };
}

// src/worker/index.ts
var app = new Hono2();
var SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
var DEFAULT_MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
var SUPPORTED_FILE_TYPES = [
  {
    kind: "pdf",
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
    contentType: "application/pdf",
    r2Extension: "pdf",
    validate: isPdf
  },
  {
    kind: "markdown",
    extensions: [".md", ".markdown"],
    mimeTypes: ["text/markdown", "text/x-markdown", "text/plain", "application/octet-stream"],
    contentType: "text/markdown; charset=utf-8",
    r2Extension: "md",
    validate: isMarkdown
  },
  {
    kind: "image",
    extensions: [".jpg", ".jpeg"],
    mimeTypes: ["image/jpeg"],
    contentType: "image/jpeg",
    r2Extension: "jpg",
    validate: isJpeg
  },
  {
    kind: "image",
    extensions: [".png"],
    mimeTypes: ["image/png"],
    contentType: "image/png",
    r2Extension: "png",
    validate: isPng
  },
  {
    kind: "image",
    extensions: [".webp"],
    mimeTypes: ["image/webp"],
    contentType: "image/webp",
    r2Extension: "webp",
    validate: isWebp
  },
  {
    kind: "image",
    extensions: [".gif"],
    mimeTypes: ["image/gif"],
    contentType: "image/gif",
    r2Extension: "gif",
    validate: isGif
  },
  {
    kind: "presentation",
    extensions: [".ppt"],
    mimeTypes: ["application/vnd.ms-powerpoint", "application/octet-stream"],
    contentType: "application/vnd.ms-powerpoint",
    r2Extension: "ppt",
    validate: isOleCompoundFile
  },
  {
    kind: "presentation",
    extensions: [".pptx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip", "application/octet-stream"],
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    r2Extension: "pptx",
    validate: isZipPackage
  },
  {
    kind: "document",
    extensions: [".docx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/octet-stream"],
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    r2Extension: "docx",
    validate: isZipPackage
  },
  {
    kind: "spreadsheet",
    extensions: [".xls"],
    mimeTypes: ["application/vnd.ms-excel", "application/octet-stream"],
    contentType: "application/vnd.ms-excel",
    r2Extension: "xls",
    validate: isOleCompoundFile
  },
  {
    kind: "spreadsheet",
    extensions: [".xlsx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "application/octet-stream"],
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    r2Extension: "xlsx",
    validate: isZipPackage
  }
];
app.get("/api/health", (c) => c.json({ ok: true, service: "cfshare" }));
app.post("/api/setup/admin", async (c) => {
  if (await countUsers(c.env) > 0) {
    return jsonError(c, 409, "setup_disabled", "\u7CFB\u7EDF\u5DF2\u521B\u5EFA\u7528\u6237\uFF0C\u521D\u59CB\u5316\u5165\u53E3\u5DF2\u5173\u95ED\u3002");
  }
  const body = await c.req.json();
  const username = normalizeUsername(body.username);
  if (!username || !body.password || body.password.length < 8) {
    return jsonError(c, 400, "invalid_setup", "\u7528\u6237\u540D\u5FC5\u586B\uFF0C\u5BC6\u7801\u81F3\u5C11 8 \u4F4D\u3002");
  }
  const id = newId();
  const createdAt = nowSeconds();
  await c.env.DB.prepare(
    `insert into users(id, username, password_hash, role, expires_at, disabled_at, created_at, last_login_at)
     values (?, ?, ?, 'admin', ?, null, ?, null)`
  ).bind(id, username, await hashPassword(body.password), body.expiresAt ?? null, createdAt).run();
  await audit(c.env, {
    userId: id,
    action: "setup_admin_created",
    targetType: "user",
    targetId: id,
    ip: c.req.header("CF-Connecting-IP") ?? null,
    userAgent: c.req.header("User-Agent") ?? null
  });
  return c.json({ id, username, role: "admin" }, 201);
});
app.post("/api/auth/login", async (c) => {
  const body = await c.req.json();
  const username = normalizeUsername(body.username);
  const user = username ? await getUserByUsername(c.env, username) : null;
  const valid = user && body.password ? await verifyPassword(body.password, user.password_hash) : false;
  const now = nowSeconds();
  if (!user || !valid || user.disabled_at || user.expires_at != null && user.expires_at <= now) {
    await audit(c.env, {
      action: "login_failed",
      detail: { username },
      ip: c.req.header("CF-Connecting-IP") ?? null,
      userAgent: c.req.header("User-Agent") ?? null
    });
    return jsonError(c, 401, "invalid_credentials", "\u8D26\u53F7\u6216\u5BC6\u7801\u9519\u8BEF\uFF0C\u6216\u8D26\u53F7\u4E0D\u53EF\u7528\u3002");
  }
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  await c.env.DB.batch([
    c.env.DB.prepare("update users set last_login_at = ? where id = ?").bind(now, user.id),
    c.env.DB.prepare("insert into sessions(id, user_id, token_hash, expires_at, created_at) values (?, ?, ?, ?, ?)").bind(
      newId(),
      user.id,
      tokenHash,
      now + SESSION_TTL_SECONDS,
      now
    )
  ]);
  await audit(c.env, {
    userId: user.id,
    action: "login_success",
    ip: c.req.header("CF-Connecting-IP") ?? null,
    userAgent: c.req.header("User-Agent") ?? null
  });
  c.header("Set-Cookie", sessionCookie(token, SESSION_TTL_SECONDS));
  return c.json(publicUser(user));
});
app.post("/api/auth/logout", async (c) => {
  const token = getCookie(c.req.raw, "cfshare_session");
  if (token) {
    await c.env.DB.prepare("delete from sessions where token_hash = ?").bind(await sha256Hex(token)).run();
  }
  c.header("Set-Cookie", clearSessionCookie());
  return c.json({ ok: true });
});
app.use("/api/*", async (c, next) => {
  if (c.req.path === "/api/health" || c.req.path === "/api/auth/login" || c.req.path === "/api/setup/admin" || c.req.path.startsWith("/api/public/shares/")) {
    return await next();
  }
  const token = getCookie(c.req.raw, "cfshare_session");
  const user = token ? await getSessionUser(c.env, await sha256Hex(token)) : null;
  if (!user) {
    return jsonError(c, 401, "unauthorized", "\u8BF7\u5148\u767B\u5F55\u3002");
  }
  c.set("user", user);
  await next();
});
app.get("/api/auth/me", (c) => c.json(c.get("user")));
app.post("/api/auth/change-password", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  if (!body.oldPassword || !body.newPassword || body.newPassword.length < 8) {
    return jsonError(c, 400, "invalid_password", "\u65B0\u5BC6\u7801\u81F3\u5C11 8 \u4F4D\u3002");
  }
  const record = await c.env.DB.prepare("select * from users where id = ?").bind(user.id).first();
  if (!record || !await verifyPassword(body.oldPassword, record.password_hash)) {
    return jsonError(c, 403, "password_mismatch", "\u539F\u5BC6\u7801\u9519\u8BEF\u3002");
  }
  await c.env.DB.prepare("update users set password_hash = ? where id = ?").bind(await hashPassword(body.newPassword), user.id).run();
  await audit(c.env, { userId: user.id, action: "password_changed", targetType: "user", targetId: user.id });
  return c.json({ ok: true });
});
app.get("/api/users", requireAdmin, async (c) => {
  const query = c.req.query("q")?.trim() ?? "";
  const page = clampInt(c.req.query("page"), 1, 1, 1e5);
  const pageSize = clampInt(c.req.query("pageSize"), 20, 1, 100);
  const offset = (page - 1) * pageSize;
  const whereSql = query ? " where username like ? escape '\\'" : "";
  const queryParam = `%${escapeLike(query)}%`;
  const countStatement = c.env.DB.prepare(`select count(*) as count from users${whereSql}`);
  const rowsStatement = c.env.DB.prepare(
    `select id, username, role, expires_at, disabled_at, created_at, last_login_at
     from users${whereSql}
     order by created_at desc
     limit ? offset ?`
  );
  const countResult = query ? await countStatement.bind(queryParam).first() : await countStatement.first();
  const rowsResult = query ? await rowsStatement.bind(queryParam, pageSize, offset).all() : await rowsStatement.bind(pageSize, offset).all();
  return c.json({
    items: rowsResult.results,
    total: countResult?.count ?? 0,
    page,
    pageSize
  });
});
app.post("/api/users", requireAdmin, async (c) => {
  const body = await c.req.json();
  const username = normalizeUsername(body.username);
  if (!username || !body.password || body.password.length < 8) {
    return jsonError(c, 400, "invalid_user", "\u7528\u6237\u540D\u5FC5\u586B\uFF0C\u5BC6\u7801\u81F3\u5C11 8 \u4F4D\u3002");
  }
  const id = newId();
  await c.env.DB.prepare(
    `insert into users(id, username, password_hash, role, expires_at, disabled_at, created_at, last_login_at)
     values (?, ?, ?, ?, ?, null, ?, null)`
  ).bind(id, username, await hashPassword(body.password), body.role === "admin" ? "admin" : "user", body.expiresAt ?? null, nowSeconds()).run();
  await audit(c.env, { userId: c.get("user").id, action: "user_created", targetType: "user", targetId: id });
  return c.json({ id, username }, 201);
});
app.patch("/api/users/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const existing = await c.env.DB.prepare("select disabled_at from users where id = ?").bind(id).first();
  const disabledAt = body.disabled === true ? existing?.disabled_at ?? nowSeconds() : body.disabled === false ? null : existing?.disabled_at ?? null;
  await c.env.DB.prepare("update users set role = coalesce(?, role), expires_at = ?, disabled_at = ? where id = ?").bind(body.role ?? null, body.expiresAt ?? null, disabledAt, id).run();
  await audit(c.env, { userId: c.get("user").id, action: "user_updated", targetType: "user", targetId: id });
  return c.json({ ok: true });
});
app.post("/api/users/:id/reset-password", requireAdmin, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  if (!body.password || body.password.length < 8) {
    return jsonError(c, 400, "invalid_password", "\u5BC6\u7801\u81F3\u5C11 8 \u4F4D\u3002");
  }
  await c.env.DB.prepare("update users set password_hash = ? where id = ?").bind(await hashPassword(body.password), id).run();
  await audit(c.env, { userId: c.get("user").id, action: "password_reset", targetType: "user", targetId: id });
  return c.json({ ok: true });
});
app.get("/api/folders/tree", async (c) => {
  const now = nowSeconds();
  const folders = await c.env.DB.prepare(
    `select folders.*, count(files.id) as file_count
     from folders
     left join files
       on files.folder_id = folders.id
      and files.trashed_at is null
      and files.deleted_at is null
      and (files.expires_at is null or files.expires_at > ?)
     where folders.trashed_at is null
     group by folders.id
     order by folders.depth, folders.name`
  ).bind(now).all();
  return c.json(filterVisibleFolders(folders.results, now));
});
app.post("/api/folders", async (c) => {
  const body = await c.req.json();
  const name = body.name?.trim();
  if (!name) {
    return jsonError(c, 400, "invalid_folder", "\u6587\u4EF6\u5939\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  let depth = 1;
  if (body.parentId) {
    const parent = await getFolder(c.env, body.parentId);
    if (!parent || parent.trashed_at) {
      return jsonError(c, 404, "parent_not_found", "\u4E0A\u7EA7\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u3002");
    }
    depth = parent.depth + 1;
  }
  if (depth > 3) {
    return jsonError(c, 400, "max_depth_exceeded", "\u6587\u4EF6\u5939\u6700\u591A\u53EA\u80FD\u5D4C\u5957 3 \u7EA7\u3002");
  }
  const id = newId();
  await c.env.DB.prepare(
    "insert into folders(id, parent_id, name, depth, expires_at, trashed_at, created_by, created_at) values (?, ?, ?, ?, ?, null, ?, ?)"
  ).bind(id, body.parentId ?? null, name, depth, body.expiresAt ?? null, c.get("user").id, nowSeconds()).run();
  await audit(c.env, { userId: c.get("user").id, action: "folder_created", targetType: "folder", targetId: id });
  return c.json({ id, name, depth }, 201);
});
app.patch("/api/folders/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const folder = await getFolder(c.env, id);
  if (!folder || folder.trashed_at) {
    return jsonError(c, 404, "folder_not_found", "\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u3002");
  }
  if ("parentId" in body) {
    const moveResult = await moveFolderTree(c.env, folder, body.parentId ?? null);
    if (moveResult) {
      return jsonError(c, moveResult.status, moveResult.code, moveResult.message);
    }
  }
  await c.env.DB.prepare("update folders set name = coalesce(?, name), expires_at = ? where id = ?").bind(body.name?.trim() || null, "expiresAt" in body ? body.expiresAt ?? null : folder.expires_at, id).run();
  await audit(c.env, { userId: c.get("user").id, action: "folder_updated", targetType: "folder", targetId: id });
  return c.json({ ok: true });
});
app.post("/api/folders/:id/trash", async (c) => {
  const id = c.req.param("id");
  await trashFolderTree(c.env, id);
  await audit(c.env, { userId: c.get("user").id, action: "folder_trashed", targetType: "folder", targetId: id });
  return c.json({ ok: true });
});
app.post("/api/folders/:id/restore", async (c) => {
  const id = c.req.param("id");
  await restoreFolderTree(c.env, id);
  await audit(c.env, { userId: c.get("user").id, action: "folder_restored", targetType: "folder", targetId: id });
  return c.json({ ok: true });
});
app.get("/api/folders/:id/files", async (c) => {
  const folderId = c.req.param("id");
  const user = c.get("user");
  const now = nowSeconds();
  const visibleAfter = parseVisibleAfter(c.req.query("visibleAfter"), now);
  const filterTime = user.role === "admin" ? visibleAfter : Math.max(visibleAfter, now);
  if (!await isFolderAvailable(c.env, folderId, filterTime)) {
    return jsonError(c, 404, "folder_unavailable", "\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  const inheritedExpiration = await getEffectiveFolderExpiration(c.env, folderId);
  if (inheritedExpiration != null && inheritedExpiration <= filterTime) {
    return jsonError(c, 404, "folder_expired", "\u6587\u4EF6\u5939\u5DF2\u8FC7\u671F\u3002");
  }
  const query = c.req.query("q")?.trim() ?? "";
  const page = clampInt(c.req.query("page"), 1, 1, 1e5);
  const pageSize = clampInt(c.req.query("pageSize"), 30, 1, 100);
  const offset = (page - 1) * pageSize;
  const querySql = query ? " and name like ? escape '\\'" : "";
  const queryParam = `%${escapeLike(query)}%`;
  const countStatement = c.env.DB.prepare(
    `select count(*) as count from files
     where folder_id = ?
       and trashed_at is null
       and deleted_at is null
       and (expires_at is null or expires_at > ?)
       ${querySql}`
  );
  const rowsStatement = c.env.DB.prepare(
    `select * from files
     where folder_id = ?
       and trashed_at is null
       and deleted_at is null
       and (expires_at is null or expires_at > ?)
       ${querySql}
     order by created_at desc
     limit ? offset ?`
  );
  const countResult = query ? await countStatement.bind(folderId, filterTime, queryParam).first() : await countStatement.bind(folderId, filterTime).first();
  const files = query ? await rowsStatement.bind(folderId, filterTime, queryParam, pageSize, offset).all() : await rowsStatement.bind(folderId, filterTime, pageSize, offset).all();
  return c.json({
    items: files.results,
    total: countResult?.count ?? 0,
    page,
    pageSize
  });
});
app.post("/api/files/upload", async (c) => {
  const form = await c.req.parseBody();
  const folderId = String(form.folderId ?? "");
  const file = form.file;
  if (!folderId || !(file instanceof File)) {
    return jsonError(c, 400, "invalid_upload", "\u8BF7\u9009\u62E9\u76EE\u6807\u6587\u4EF6\u5939\u548C\u6587\u4EF6\u3002");
  }
  const maxUploadBytes = getMaxUploadBytes(c.env);
  if (file.size > maxUploadBytes) {
    return jsonError(c, 413, "file_too_large", `\u5355\u4E2A\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 ${formatBytes(maxUploadBytes)}\u3002`);
  }
  if (!await isFolderAvailable(c.env, folderId)) {
    return jsonError(c, 404, "folder_unavailable", "\u76EE\u6807\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  const bytes = await file.arrayBuffer();
  const fileType = detectSupportedFileType(file.name, file.type, bytes);
  if (!fileType) {
    return jsonError(c, 400, "unsupported_file_type", "\u53EA\u5141\u8BB8\u4E0A\u4F20 PDF\u3001Markdown\u3001\u56FE\u7247\u6216 PPT \u6587\u4EF6\u3002");
  }
  const id = newId();
  const r2Key = `active/default/${id}.${fileType.r2Extension}`;
  const sha256 = await sha256Hex(bytes);
  await c.env.PDF_BUCKET.put(r2Key, bytes, {
    httpMetadata: {
      contentType: fileType.contentType
    },
    customMetadata: {
      fileId: id,
      uploadedBy: c.get("user").id,
      sha256,
      kind: fileType.kind
    }
  });
  await c.env.DB.prepare(
    `insert into files(id, folder_id, name, r2_key, size, mime_type, sha256, expires_at, trashed_at, deleted_at, uploaded_by, created_at)
     values (?, ?, ?, ?, ?, ?, ?, null, null, null, ?, ?)`
  ).bind(id, folderId, file.name || `${id}.${fileType.r2Extension}`, r2Key, bytes.byteLength, fileType.contentType, sha256, c.get("user").id, nowSeconds()).run();
  await audit(c.env, { userId: c.get("user").id, action: "file_uploaded", targetType: "file", targetId: id, detail: { size: bytes.byteLength } });
  return c.json({ id, name: file.name, size: bytes.byteLength }, 201);
});
app.post("/api/files/markdown", requireAdmin, async (c) => {
  const body = await c.req.json();
  const folderId = body.folderId ?? "";
  if (!folderId || !await isFolderAvailable(c.env, folderId)) {
    return jsonError(c, 404, "folder_unavailable", "\u76EE\u6807\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  const name = normalizeMarkdownFileName(body.name);
  if (!name) {
    return jsonError(c, 400, "invalid_file_name", "Markdown \u6587\u4EF6\u540D\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  const content = body.content ?? "";
  const bytes = encodeUtf8(content);
  if (bytes.byteLength > getMaxUploadBytes(c.env)) {
    return jsonError(c, 413, "file_too_large", `\u5355\u4E2A\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 ${formatBytes(getMaxUploadBytes(c.env))}\u3002`);
  }
  const id = newId();
  const r2Key = `active/default/${id}.md`;
  const sha256 = await sha256Hex(bytes);
  await c.env.PDF_BUCKET.put(r2Key, bytes, {
    httpMetadata: {
      contentType: "text/markdown; charset=utf-8"
    },
    customMetadata: {
      fileId: id,
      uploadedBy: c.get("user").id,
      sha256,
      kind: "markdown"
    }
  });
  await c.env.DB.prepare(
    `insert into files(id, folder_id, name, r2_key, size, mime_type, sha256, expires_at, trashed_at, deleted_at, uploaded_by, created_at)
     values (?, ?, ?, ?, ?, 'text/markdown; charset=utf-8', ?, null, null, null, ?, ?)`
  ).bind(id, folderId, name, r2Key, bytes.byteLength, sha256, c.get("user").id, nowSeconds()).run();
  await audit(c.env, { userId: c.get("user").id, action: "markdown_created", targetType: "file", targetId: id, detail: { size: bytes.byteLength } });
  return c.json({ id, name, size: bytes.byteLength }, 201);
});
app.get("/api/files/:id/metadata", async (c) => {
  const file = await getReadableFile(c.env, c.req.param("id"), c.get("user").role);
  if (!file) {
    return jsonError(c, 404, "file_unavailable", "\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  return c.json(publicFile(file));
});
app.patch("/api/files/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const file = await getFile(c.env, id);
  if (!file || file.deleted_at) {
    return jsonError(c, 404, "file_not_found", "\u6587\u4EF6\u4E0D\u5B58\u5728\u3002");
  }
  await c.env.DB.prepare("update files set name = coalesce(?, name), expires_at = ? where id = ?").bind(body.name?.trim() || null, body.expiresAt ?? null, id).run();
  await audit(c.env, { userId: c.get("user").id, action: "file_updated", targetType: "file", targetId: id });
  return c.json({ ok: true });
});
app.put("/api/files/:id/content", requireAdmin, async (c) => {
  const id = c.req.param("id") ?? "";
  const file = await getFile(c.env, id);
  if (!file || file.deleted_at || file.trashed_at) {
    return jsonError(c, 404, "file_not_found", "\u6587\u4EF6\u4E0D\u5B58\u5728\u3002");
  }
  if (!file.mime_type.startsWith("text/markdown")) {
    return jsonError(c, 400, "unsupported_file_type", "\u5F53\u524D\u53EA\u652F\u6301\u7F16\u8F91 Markdown \u6587\u4EF6\u3002");
  }
  const body = await c.req.json();
  const content = body.content ?? "";
  const bytes = encodeUtf8(content);
  if (bytes.byteLength > getMaxUploadBytes(c.env)) {
    return jsonError(c, 413, "file_too_large", `\u5355\u4E2A\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 ${formatBytes(getMaxUploadBytes(c.env))}\u3002`);
  }
  const sha256 = await sha256Hex(bytes);
  await c.env.PDF_BUCKET.put(file.r2_key, bytes, {
    httpMetadata: {
      contentType: "text/markdown; charset=utf-8"
    },
    customMetadata: {
      fileId: file.id,
      uploadedBy: file.uploaded_by,
      sha256,
      kind: "markdown"
    }
  });
  await c.env.DB.prepare("update files set size = ?, sha256 = ?, mime_type = ? where id = ?").bind(bytes.byteLength, sha256, "text/markdown; charset=utf-8", id).run();
  await audit(c.env, { userId: c.get("user").id, action: "markdown_updated", targetType: "file", targetId: id, detail: { size: bytes.byteLength } });
  return c.json({ ok: true, size: bytes.byteLength, sha256 });
});
app.get("/api/files/:id/content", async (c) => {
  const file = await getReadableFile(c.env, c.req.param("id"), c.get("user").role);
  if (!file) {
    return jsonError(c, 404, "file_unavailable", "\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  await audit(c.env, { userId: c.get("user").id, action: "file_read", targetType: "file", targetId: file.id });
  return await streamFile(c, file);
});
app.post("/api/shares", requireAdmin, async (c) => {
  const body = await c.req.json();
  const targetType = body.targetType;
  const targetId = body.targetId ?? "";
  const durationSeconds = parseShareDuration(body.duration ?? 1, body.unit ?? "days");
  if (targetType !== "file" && targetType !== "folder" || !targetId || durationSeconds == null) {
    return jsonError(c, 400, "invalid_share", "\u8BF7\u9009\u62E9\u6587\u4EF6\u6216\u6587\u4EF6\u5939\uFF0C\u5E76\u8BBE\u7F6E\u6709\u6548\u671F\u3002");
  }
  if (targetType === "file") {
    const file = await getFile(c.env, targetId);
    if (!file || file.deleted_at || file.trashed_at) {
      return jsonError(c, 404, "target_not_found", "\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u5206\u4EAB\u3002");
    }
  } else {
    const folder = await getFolder(c.env, targetId);
    if (!folder || folder.trashed_at) {
      return jsonError(c, 404, "target_not_found", "\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u5206\u4EAB\u3002");
    }
  }
  const id = newId();
  const token = randomToken();
  const urlId = buildShareUrlId();
  const createdAt = nowSeconds();
  const expiresAt = createdAt + durationSeconds;
  await c.env.DB.prepare(
    `insert into shares(id, token, url_id, target_type, target_id, expires_at, cancelled_at, created_by, created_at)
     values (?, ?, ?, ?, ?, ?, null, ?, ?)`
  ).bind(id, token, urlId, targetType, targetId, expiresAt, c.get("user").id, createdAt).run();
  await audit(c.env, { userId: c.get("user").id, action: "share_created", targetType, targetId, detail: { shareId: id, expiresAt } });
  return c.json({ id, token, urlId, publicUrl: publicShareUrl(c, { token, url_id: urlId }), expiresAt }, 201);
});
app.get("/api/shares", requireAdmin, async (c) => {
  const now = nowSeconds();
  const rows = await c.env.DB.prepare(
    `select shares.*,
            coalesce(files.name, folders.name, shares.target_id) as target_name
     from shares
     left join files on shares.target_type = 'file' and shares.target_id = files.id
     left join folders on shares.target_type = 'folder' and shares.target_id = folders.id
     where shares.cancelled_at is null
       and shares.expires_at > ?
     order by shares.created_at desc`
  ).bind(now).all();
  return c.json(rows.results.map((share) => ({
    ...share,
    public_url: publicShareUrl(c, share)
  })));
});
app.post("/api/shares/:id/cancel", requireAdmin, async (c) => {
  const id = c.req.param("id");
  const share = await c.env.DB.prepare("select * from shares where id = ?").bind(id).first();
  if (!share || share.cancelled_at != null) {
    return jsonError(c, 404, "share_not_found", "\u5206\u4EAB\u4E0D\u5B58\u5728\u6216\u5DF2\u53D6\u6D88\u3002");
  }
  await c.env.DB.prepare("update shares set cancelled_at = ? where id = ?").bind(nowSeconds(), id).run();
  await audit(c.env, { userId: c.get("user").id, action: "share_cancelled", targetType: share.target_type, targetId: share.target_id, detail: { shareId: id } });
  return c.json({ ok: true });
});
app.get("/api/public/shares/:key", async (c) => {
  const share = await getActiveShare(c.env, c.req.param("key"));
  if (!share) {
    return jsonError(c, 404, "share_unavailable", "\u5206\u4EAB\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\u3002");
  }
  if (share.target_type === "file") {
    const file = await getFile(c.env, share.target_id);
    if (!file || file.deleted_at || file.trashed_at) {
      return jsonError(c, 404, "share_target_unavailable", "\u5206\u4EAB\u5185\u5BB9\u4E0D\u53EF\u8BBF\u95EE\u3002");
    }
    return c.json({ share: publicShareMeta(share, file.name), file: publicFile(file) });
  }
  const folder = await getFolder(c.env, share.target_id);
  if (!folder || folder.trashed_at) {
    return jsonError(c, 404, "share_target_unavailable", "\u5206\u4EAB\u5185\u5BB9\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  return c.json({ share: publicShareMeta(share, folder.name), folder });
});
app.get("/api/public/shares/:key/folder", async (c) => {
  const share = await getActiveShare(c.env, c.req.param("key"));
  if (!share || share.target_type !== "folder") {
    return jsonError(c, 404, "share_unavailable", "\u5206\u4EAB\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\u3002");
  }
  const folder = await getFolder(c.env, share.target_id);
  if (!folder || folder.trashed_at) {
    return jsonError(c, 404, "share_target_unavailable", "\u5206\u4EAB\u5185\u5BB9\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  const now = nowSeconds();
  const files = await c.env.DB.prepare(
    `select * from files
     where folder_id = ?
       and trashed_at is null
       and deleted_at is null
       and (expires_at is null or expires_at > ?)
     order by created_at desc`
  ).bind(folder.id, now).all();
  return c.json({ share: publicShareMeta(share, folder.name), folder, files: files.results.map(publicFile) });
});
app.get("/api/public/shares/:key/files/by-name/:fileName", async (c) => {
  const share = await getActiveShare(c.env, c.req.param("key"));
  if (!share || share.target_type !== "folder") {
    return jsonError(c, 404, "share_unavailable", "\u5206\u4EAB\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\u3002");
  }
  const fileName = decodeURIComponent(c.req.param("fileName"));
  const file = await c.env.DB.prepare(
    `select * from files
     where folder_id = ?
       and name = ?
       and trashed_at is null
       and deleted_at is null
     limit 1`
  ).bind(share.target_id, fileName).first();
  if (!file) {
    return jsonError(c, 404, "file_unavailable", "\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  return c.json(publicFile(file));
});
app.get("/api/public/shares/:key/files/:fileId/content", async (c) => {
  const share = await getActiveShare(c.env, c.req.param("key"));
  if (!share) {
    return jsonError(c, 404, "share_unavailable", "\u5206\u4EAB\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F\u3002");
  }
  const file = await getFile(c.env, c.req.param("fileId"));
  if (!file || file.deleted_at || file.trashed_at) {
    return jsonError(c, 404, "file_unavailable", "\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  if (share.target_type === "file" && share.target_id !== file.id) {
    return jsonError(c, 404, "file_unavailable", "\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  if (share.target_type === "folder" && share.target_id !== file.folder_id) {
    return jsonError(c, 404, "file_unavailable", "\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u8BBF\u95EE\u3002");
  }
  return await streamFile(c, file);
});
async function streamFile(c, file) {
  const head = await c.env.PDF_BUCKET.head(file.r2_key);
  if (!head) {
    return jsonError(c, 404, "object_missing", "\u6587\u4EF6\u5BF9\u8C61\u4E0D\u5B58\u5728\u3002");
  }
  const contentType = normalizeStoredContentType(file.mime_type);
  const range = parseRange(c.req.header("Range") ?? null, head.size);
  const dispositionType = c.req.query("download") === "1" ? "attachment" : "inline";
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Content-Type": contentType,
    "Cache-Control": "private, no-store",
    "Content-Disposition": contentDisposition(dispositionType, file.name)
  });
  let object;
  let status = 200;
  if (range) {
    object = await c.env.PDF_BUCKET.get(file.r2_key, { range: { offset: range.offset, length: range.length } });
    headers.set("Content-Range", `bytes ${range.offset}-${range.end}/${head.size}`);
    headers.set("Content-Length", String(range.length));
    status = 206;
  } else {
    object = await c.env.PDF_BUCKET.get(file.r2_key);
    headers.set("Content-Length", String(head.size));
  }
  if (!object?.body) {
    return jsonError(c, 404, "object_missing", "\u6587\u4EF6\u5BF9\u8C61\u4E0D\u5B58\u5728\u3002");
  }
  return new Response(object.body, { status, headers });
}
app.post("/api/files/:id/trash", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("update files set trashed_at = ? where id = ? and deleted_at is null").bind(nowSeconds(), id).run();
  await audit(c.env, { userId: c.get("user").id, action: "file_trashed", targetType: "file", targetId: id });
  return c.json({ ok: true });
});
app.post("/api/files/:id/restore", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("update files set trashed_at = null where id = ? and deleted_at is null").bind(id).run();
  await audit(c.env, { userId: c.get("user").id, action: "file_restored", targetType: "file", targetId: id });
  return c.json({ ok: true });
});
app.delete("/api/files/:id", requireAdmin, async (c) => {
  const id = c.req.param("id") ?? "";
  const file = await getFile(c.env, id);
  if (!file) {
    return jsonError(c, 404, "file_not_found", "\u6587\u4EF6\u4E0D\u5B58\u5728\u3002");
  }
  await c.env.PDF_BUCKET.delete(file.r2_key);
  await c.env.DB.prepare("update files set deleted_at = ? where id = ?").bind(nowSeconds(), id).run();
  await audit(c.env, { userId: c.get("user").id, action: "file_deleted", targetType: "file", targetId: id });
  return c.json({ ok: true });
});
app.get("/api/trash", async (c) => {
  const allFolders = await c.env.DB.prepare("select * from folders").all();
  const folders = await c.env.DB.prepare("select * from folders where trashed_at is not null order by trashed_at desc").all();
  const files = await c.env.DB.prepare("select * from files where trashed_at is not null and deleted_at is null order by trashed_at desc").all();
  const folderPathMap = buildFolderPathMap(allFolders.results);
  return c.json({
    folders: folders.results.map((folder) => ({
      ...folder,
      path: folderPathMap.get(folder.id) ?? folder.name
    })),
    files: files.results.map((file) => ({
      ...file,
      path: joinPath(folderPathMap.get(file.folder_id), file.name)
    }))
  });
});
app.post("/api/trash/cleanup", requireAdmin, async (c) => {
  const result = await cleanupTrash(c.env);
  await audit(c.env, { userId: c.get("user").id, action: "trash_cleanup_requested", detail: result });
  return c.json(result);
});
app.get("/api/audit-logs", requireAdmin, async (c) => {
  const rows = await c.env.DB.prepare("select * from audit_logs order by created_at desc limit 300").all();
  return c.json(rows.results);
});
app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));
var index_default = {
  fetch: app.fetch,
  async scheduled(_event, env) {
    await expireContent(env);
    await cleanupTrash(env);
  }
};
async function requireAdmin(c, next) {
  if (c.get("user").role !== "admin") {
    return jsonError(c, 403, "forbidden", "\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650\u3002");
  }
  await next();
}
function normalizeUsername(username) {
  return username?.trim().toLowerCase() ?? "";
}
function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}
function parseVisibleAfter(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}
function parseShareDuration(value, unit) {
  const amount = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  if (unit === "hours") {
    return amount * 60 * 60;
  }
  if (unit === "days") {
    return amount * 24 * 60 * 60;
  }
  return null;
}
function buildShareUrlId() {
  return newId();
}
function publicShareUrl(c, share) {
  const origin = getPublicAppOrigin(c);
  return `${origin}/share/${share.url_id ?? share.token}`;
}
function getPublicAppOrigin(c) {
  const requestOrigin = c.req.header("Origin")?.trim();
  if (requestOrigin) {
    try {
      return new URL(requestOrigin).origin;
    } catch {
    }
  }
  return new URL(c.req.url).origin;
}
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    expires_at: user.expires_at,
    disabled_at: user.disabled_at,
    created_at: user.created_at,
    last_login_at: user.last_login_at
  };
}
function publicFile(file) {
  return {
    id: file.id,
    folder_id: file.folder_id,
    name: file.name,
    size: file.size,
    mime_type: file.mime_type,
    sha256: file.sha256,
    expires_at: file.expires_at,
    created_at: file.created_at
  };
}
function publicShareMeta(share, targetName) {
  return {
    token: share.token,
    url_id: share.url_id,
    target_type: share.target_type,
    target_id: share.target_id,
    target_name: targetName,
    expires_at: share.expires_at
  };
}
async function getActiveShare(env, key) {
  const now = nowSeconds();
  return await env.DB.prepare(
    `select * from shares
     where (token = ? or url_id = ?)
       and cancelled_at is null
       and expires_at > ?`
  ).bind(key, key, now).first();
}
function buildFolderPathMap(folders) {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const paths = /* @__PURE__ */ new Map();
  const resolve = (folder, visiting = /* @__PURE__ */ new Set()) => {
    const existing = paths.get(folder.id);
    if (existing) {
      return existing;
    }
    if (visiting.has(folder.id)) {
      return folder.name;
    }
    visiting.add(folder.id);
    const parent = folder.parent_id ? byId.get(folder.parent_id) : null;
    const path = parent ? joinPath(resolve(parent, visiting), folder.name) : folder.name;
    visiting.delete(folder.id);
    paths.set(folder.id, path);
    return path;
  };
  for (const folder of folders) {
    resolve(folder);
  }
  return paths;
}
function joinPath(parentPath, name) {
  return parentPath ? `${parentPath}/${name}` : name;
}
async function getReadableFile(env, id, role) {
  const file = await getFile(env, id);
  const visibleAfter = role === "admin" ? 0 : nowSeconds();
  if (!file || !await isFileReadable(env, file, visibleAfter)) {
    return null;
  }
  return file;
}
function isPdf(bytes, mimeType) {
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  return header === "%PDF-" && (!mimeType || mimeType === "application/pdf");
}
function isMarkdown(bytes) {
  const sample = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, Math.min(bytes.byteLength, 4096)));
  return !sample.includes("\0");
}
function isJpeg(bytes) {
  const view = new Uint8Array(bytes.slice(0, 3));
  return view[0] === 255 && view[1] === 216 && view[2] === 255;
}
function isPng(bytes) {
  const view = new Uint8Array(bytes.slice(0, 8));
  return view[0] === 137 && view[1] === 80 && view[2] === 78 && view[3] === 71 && view[4] === 13 && view[5] === 10 && view[6] === 26 && view[7] === 10;
}
function isWebp(bytes) {
  const header = new TextDecoder().decode(bytes.slice(0, 12));
  return header.startsWith("RIFF") && header.endsWith("WEBP");
}
function isGif(bytes) {
  const header = new TextDecoder().decode(bytes.slice(0, 6));
  return header === "GIF87a" || header === "GIF89a";
}
function isOleCompoundFile(bytes) {
  const view = new Uint8Array(bytes.slice(0, 8));
  return view[0] === 208 && view[1] === 207 && view[2] === 17 && view[3] === 224 && view[4] === 161 && view[5] === 177 && view[6] === 26 && view[7] === 225;
}
function isZipPackage(bytes) {
  const view = new Uint8Array(bytes.slice(0, 4));
  return view[0] === 80 && view[1] === 75 && (view[2] === 3 || view[2] === 5 || view[2] === 7) && (view[3] === 4 || view[3] === 6 || view[3] === 8);
}
function detectSupportedFileType(name, mimeType, bytes) {
  const lowerName = name.toLowerCase();
  return SUPPORTED_FILE_TYPES.find((fileType) => {
    const extensionMatched = fileType.extensions.some((extension) => lowerName.endsWith(extension));
    const mimeMatched = !mimeType || fileType.mimeTypes.includes(mimeType);
    return extensionMatched && mimeMatched && fileType.validate(bytes, mimeType);
  }) ?? null;
}
function normalizeStoredContentType(mimeType) {
  if (mimeType.startsWith("text/markdown")) {
    return "text/markdown; charset=utf-8";
  }
  return mimeType || "application/octet-stream";
}
function contentDisposition(type, fileName) {
  const fallbackName = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_") || "download";
  return `${type}; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
function normalizeMarkdownFileName(name) {
  const trimmed = name?.trim().replace(/[\\/:*?"<>|]/g, "-") ?? "";
  if (!trimmed) {
    return "";
  }
  return /\.(md|markdown)$/i.test(trimmed) ? trimmed : `${trimmed}.md`;
}
function encodeUtf8(value) {
  const bytes = new TextEncoder().encode(value);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
function getMaxUploadBytes(env) {
  const configured = Number.parseInt(env.MAX_UPLOAD_BYTES ?? "", 10);
  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_MAX_UPLOAD_BYTES;
  }
  return configured;
}
function formatBytes(size) {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)}KB`;
  }
  return `${Math.ceil(size / 1024 / 1024)}MB`;
}
async function moveFolderTree(env, folder, parentId) {
  if (folder.parent_id === parentId) {
    return null;
  }
  const folders = await env.DB.prepare("select * from folders where trashed_at is null").all();
  const byId = new Map(folders.results.map((item) => [item.id, item]));
  const parent = parentId ? byId.get(parentId) : null;
  if (parentId && !parent) {
    return { status: 404, code: "parent_not_found", message: "\u4E0A\u7EA7\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u3002" };
  }
  const subtreeIds = /* @__PURE__ */ new Set([folder.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of folders.results) {
      if (item.parent_id && subtreeIds.has(item.parent_id) && !subtreeIds.has(item.id)) {
        subtreeIds.add(item.id);
        changed = true;
      }
    }
  }
  if (parentId && subtreeIds.has(parentId)) {
    return { status: 400, code: "invalid_parent", message: "\u4E0D\u80FD\u79FB\u52A8\u5230\u81EA\u5DF1\u6216\u4E0B\u7EA7\u6587\u4EF6\u5939\u4E2D\u3002" };
  }
  const targetDepth = parent ? parent.depth + 1 : 1;
  const depthDelta = targetDepth - folder.depth;
  const maxDepth = Math.max(...folders.results.filter((item) => subtreeIds.has(item.id)).map((item) => item.depth + depthDelta));
  if (maxDepth > 3) {
    return { status: 400, code: "max_depth_exceeded", message: "\u6587\u4EF6\u5939\u6700\u591A\u53EA\u80FD\u5D4C\u5957 3 \u7EA7\u3002" };
  }
  await env.DB.batch(
    folders.results.filter((item) => subtreeIds.has(item.id)).map((item) => {
      if (item.id === folder.id) {
        return env.DB.prepare("update folders set parent_id = ?, depth = ? where id = ?").bind(parentId, item.depth + depthDelta, item.id);
      }
      return env.DB.prepare("update folders set depth = ? where id = ?").bind(item.depth + depthDelta, item.id);
    })
  );
  return null;
}
async function trashFolderTree(env, folderId, at = nowSeconds()) {
  await env.DB.prepare("update folders set trashed_at = ? where id = ?").bind(at, folderId).run();
  await env.DB.prepare(
    `update folders set trashed_at = ?
     where parent_id = ?
        or parent_id in (select id from folders where parent_id = ?)`
  ).bind(at, folderId, folderId).run();
  await env.DB.prepare(
    `update files set trashed_at = ?
     where deleted_at is null
       and (
         folder_id = ?
         or folder_id in (select id from folders where parent_id = ?)
         or folder_id in (select id from folders where parent_id in (select id from folders where parent_id = ?))
       )`
  ).bind(at, folderId, folderId, folderId).run();
}
async function restoreFolderTree(env, folderId) {
  await env.DB.prepare("update folders set trashed_at = null where id = ?").bind(folderId).run();
  await env.DB.prepare(
    `update folders set trashed_at = null
     where parent_id = ?
        or parent_id in (select id from folders where parent_id = ?)`
  ).bind(folderId, folderId).run();
  await env.DB.prepare(
    `update files set trashed_at = null
     where deleted_at is null
       and (
         folder_id = ?
         or folder_id in (select id from folders where parent_id = ?)
         or folder_id in (select id from folders where parent_id in (select id from folders where parent_id = ?))
       )`
  ).bind(folderId, folderId, folderId).run();
}
async function expireContent(env) {
  const now = nowSeconds();
  const expiredFolders = await env.DB.prepare("select id from folders where trashed_at is null and expires_at is not null and expires_at <= ?").bind(now).all();
  for (const folder of expiredFolders.results) {
    await trashFolderTree(env, folder.id);
    await audit(env, { action: "folder_expired", targetType: "folder", targetId: folder.id });
  }
  const expiredFiles = await env.DB.prepare(
    "select id from files where deleted_at is null and trashed_at is null and expires_at is not null and expires_at <= ?"
  ).bind(now).all();
  for (const file of expiredFiles.results) {
    await env.DB.prepare("update files set trashed_at = ? where id = ?").bind(now, file.id).run();
    await audit(env, { action: "file_expired", targetType: "file", targetId: file.id });
  }
}
async function cleanupTrash(env) {
  const now = nowSeconds();
  const retentionDays = Number.parseInt(env.TRASH_RETENTION_DAYS ?? "30", 10);
  const maxBytes = Number.parseInt(env.TRASH_MAX_BYTES ?? "21474836480", 10);
  const cutoff = now - retentionDays * 24 * 60 * 60;
  const deleted = /* @__PURE__ */ new Set();
  let freedBytes = 0;
  const oldFiles = await env.DB.prepare(
    "select * from files where deleted_at is null and trashed_at is not null and trashed_at <= ? order by trashed_at asc"
  ).bind(cutoff).all();
  for (const file of oldFiles.results) {
    freedBytes += await deleteFileObject(env, file);
    deleted.add(file.id);
  }
  const sizeRow = await env.DB.prepare(
    "select coalesce(sum(size), 0) as total from files where deleted_at is null and trashed_at is not null"
  ).first();
  let total = sizeRow?.total ?? 0;
  if (total > maxBytes) {
    const overflowFiles = await env.DB.prepare(
      "select * from files where deleted_at is null and trashed_at is not null order by trashed_at asc"
    ).all();
    for (const file of overflowFiles.results) {
      if (total <= maxBytes) {
        break;
      }
      if (deleted.has(file.id)) {
        continue;
      }
      freedBytes += await deleteFileObject(env, file);
      total -= file.size;
      deleted.add(file.id);
    }
  }
  return { deleted: deleted.size, freedBytes };
}
async function deleteFileObject(env, file) {
  await env.PDF_BUCKET.delete(file.r2_key);
  await env.DB.prepare("update files set deleted_at = ? where id = ?").bind(nowSeconds(), file.id).run();
  await audit(env, { action: "file_deleted_by_cleanup", targetType: "file", targetId: file.id, detail: { size: file.size } });
  return file.size;
}
export {
  buildShareUrlId,
  index_default as default,
  getMaxUploadBytes,
  parseShareDuration,
  restoreFolderTree,
  trashFolderTree
};
