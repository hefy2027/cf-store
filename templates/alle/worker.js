//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
	return (context, next) => {
		let index = -1;
		return dispatch(0);
		async function dispatch(i) {
			if (i <= index) throw new Error("next() called multiple times");
			index = i;
			let res;
			let isError = false;
			let handler;
			if (middleware[i]) {
				handler = middleware[i][0][0];
				context.req.routeIndex = i;
			} else handler = i === middleware.length && next || void 0;
			if (handler) try {
				res = await handler(context, () => dispatch(i + 1));
			} catch (err) {
				if (err instanceof Error && onError) {
					context.error = err;
					res = await onError(err, context);
					isError = true;
				} else throw err;
			}
			else if (context.finalized === false && onNotFound) res = await onNotFound(context);
			if (res && (context.finalized === false || isError)) context.res = res;
			return context;
		}
	};
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
	const { all = false, dot = false } = options;
	const contentType = (request instanceof HonoRequest ? request.raw.headers : request.headers).get("Content-Type");
	if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) return parseFormData(request, {
		all,
		dot
	});
	return {};
};
async function parseFormData(request, options) {
	const formData = await request.formData();
	if (formData) return convertFormDataToBodyData(formData, options);
	return {};
}
function convertFormDataToBodyData(formData, options) {
	const form = /* @__PURE__ */ Object.create(null);
	formData.forEach((value, key) => {
		if (!(options.all || key.endsWith("[]"))) form[key] = value;
		else handleParsingAllValues(form, key, value);
	});
	if (options.dot) Object.entries(form).forEach(([key, value]) => {
		if (key.includes(".")) {
			handleParsingNestedValues(form, key, value);
			delete form[key];
		}
	});
	return form;
}
var handleParsingAllValues = (form, key, value) => {
	if (form[key] !== void 0) if (Array.isArray(form[key])) form[key].push(value);
	else form[key] = [form[key], value];
	else if (!key.endsWith("[]")) form[key] = value;
	else form[key] = [value];
};
var handleParsingNestedValues = (form, key, value) => {
	if (/(?:^|\.)__proto__\./.test(key)) return;
	let nestedForm = form;
	const keys = key.split(".");
	keys.forEach((key2, index) => {
		if (index === keys.length - 1) nestedForm[key2] = value;
		else {
			if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) nestedForm[key2] = /* @__PURE__ */ Object.create(null);
			nestedForm = nestedForm[key2];
		}
	});
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
	const paths = path.split("/");
	if (paths[0] === "") paths.shift();
	return paths;
};
var splitRoutingPath = (routePath) => {
	const { groups, path } = extractGroupsFromPath(routePath);
	return replaceGroupMarks(splitPath(path), groups);
};
var extractGroupsFromPath = (path) => {
	const groups = [];
	path = path.replace(/\{[^}]+\}/g, (match, index) => {
		const mark = `@${index}`;
		groups.push([mark, match]);
		return mark;
	});
	return {
		groups,
		path
	};
};
var replaceGroupMarks = (paths, groups) => {
	for (let i = groups.length - 1; i >= 0; i--) {
		const [mark] = groups[i];
		for (let j = paths.length - 1; j >= 0; j--) if (paths[j].includes(mark)) {
			paths[j] = paths[j].replace(mark, groups[i][1]);
			break;
		}
	}
	return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
	if (label === "*") return "*";
	const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
	if (match) {
		const cacheKey = `${label}#${next}`;
		if (!patternCache[cacheKey]) if (match[2]) patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [
			cacheKey,
			match[1],
			new RegExp(`^${match[2]}(?=/${next})`)
		] : [
			label,
			match[1],
			new RegExp(`^${match[2]}$`)
		];
		else patternCache[cacheKey] = [
			label,
			match[1],
			true
		];
		return patternCache[cacheKey];
	}
	return null;
};
var tryDecode = (str, decoder) => {
	try {
		return decoder(str);
	} catch {
		return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
			try {
				return decoder(match);
			} catch {
				return match;
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
		} else if (charCode === 63 || charCode === 35) break;
	}
	return url.slice(start, i);
};
var getPathNoStrict = (request) => {
	const result = getPath(request);
	return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
	if (rest.length) sub = mergePath(sub, ...rest);
	return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
	if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) return null;
	const segments = path.split("/");
	const results = [];
	let basePath = "";
	segments.forEach((segment) => {
		if (segment !== "" && !/\:/.test(segment)) basePath += "/" + segment;
		else if (/\:/.test(segment)) if (/\?/.test(segment)) {
			if (results.length === 0 && basePath === "") results.push("/");
			else results.push(basePath);
			const optionalSegment = segment.replace("?", "");
			basePath += "/" + optionalSegment;
			results.push(basePath);
		} else basePath += "/" + segment;
	});
	return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
	if (!/[%+]/.test(value)) return value;
	if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
	return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
	let encoded;
	if (!multiple && key && !/[%+]/.test(key)) {
		let keyIndex2 = url.indexOf("?", 8);
		if (keyIndex2 === -1) return;
		if (!url.startsWith(key, keyIndex2 + 1)) keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
		while (keyIndex2 !== -1) {
			const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
			if (trailingKeyCode === 61) {
				const valueIndex = keyIndex2 + key.length + 2;
				const endIndex = url.indexOf("&", valueIndex);
				return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
			} else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) return "";
			keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
		}
		encoded = /[%+]/.test(url);
		if (!encoded) return;
	}
	const results = {};
	encoded ??= /[%+]/.test(url);
	let keyIndex = url.indexOf("?", 8);
	while (keyIndex !== -1) {
		const nextKeyIndex = url.indexOf("&", keyIndex + 1);
		let valueIndex = url.indexOf("=", keyIndex);
		if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) valueIndex = -1;
		let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
		if (encoded) name = _decodeURI(name);
		keyIndex = nextKeyIndex;
		if (name === "") continue;
		let value;
		if (valueIndex === -1) value = "";
		else {
			value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
			if (encoded) value = _decodeURI(value);
		}
		if (multiple) {
			if (!(results[name] && Array.isArray(results[name]))) results[name] = [];
			results[name].push(value);
		} else results[name] ??= value;
	}
	return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
	return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/request.js
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
			if (value !== void 0) decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
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
		if (name) return this.raw.headers.get(name) ?? void 0;
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
		const { bodyCache, raw } = this;
		const cachedBody = bodyCache[key];
		if (cachedBody) return cachedBody;
		const anyCachedKey = Object.keys(bodyCache)[0];
		if (anyCachedKey) return bodyCache[anyCachedKey].then((body) => {
			if (anyCachedKey === "json") body = JSON.stringify(body);
			return new Response(body)[key]();
		});
		return bodyCache[key] = raw[key]();
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
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/utils/html.js
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
		if (!(str instanceof Promise)) str = str.toString();
		if (str instanceof Promise) str = await str;
	}
	const callbacks = str.callbacks;
	if (!callbacks?.length) return Promise.resolve(str);
	if (buffer) buffer[0] += str;
	else buffer = [str];
	const resStr = Promise.all(callbacks.map((c) => c({
		phase,
		buffer,
		context
	}))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
	if (preserveCallbacks) return raw(await resStr, callbacks);
	else return resStr;
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/context.js
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
		if (this.#executionCtx && "respondWith" in this.#executionCtx) return this.#executionCtx;
		else throw Error("This context has no FetchEvent");
	}
	/**
	* @see {@link https://hono.dev/docs/api/context#executionctx}
	* The ExecutionContext associated with the current request.
	*
	* @throws Will throw an error if the context does not have an ExecutionContext.
	*/
	get executionCtx() {
		if (this.#executionCtx) return this.#executionCtx;
		else throw Error("This context has no ExecutionContext");
	}
	/**
	* @see {@link https://hono.dev/docs/api/context#res}
	* The Response object for the current request.
	*/
	get res() {
		return this.#res ||= createResponseInstance(null, { headers: this.#preparedHeaders ??= new Headers() });
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
				if (k === "content-type") continue;
				if (k === "set-cookie") {
					const cookies = this.#res.headers.getSetCookie();
					_res.headers.delete("set-cookie");
					for (const cookie of cookies) _res.headers.append("set-cookie", cookie);
				} else _res.headers.set(k, v);
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
		if (this.finalized) this.#res = createResponseInstance(this.#res.body, this.#res);
		const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
		if (value === void 0) headers.delete(name);
		else if (options?.append) headers.append(name, value);
		else headers.set(name, value);
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
	get var() {
		if (!this.#var) return {};
		return Object.fromEntries(this.#var);
	}
	#newResponse(data, arg, headers) {
		const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
		if (typeof arg === "object" && "headers" in arg) {
			const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
			for (const [key, value] of argHeaders) if (key.toLowerCase() === "set-cookie") responseHeaders.append(key, value);
			else responseHeaders.set(key, value);
		}
		if (headers) for (const [k, v] of Object.entries(headers)) if (typeof v === "string") responseHeaders.set(k, v);
		else {
			responseHeaders.delete(k);
			for (const v2 of v) responseHeaders.append(k, v2);
		}
		return createResponseInstance(data, {
			status: typeof arg === "number" ? arg : arg?.status ?? this.#status,
			headers: responseHeaders
		});
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
		return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
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
		return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
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
		this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
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
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/router.js
var METHODS = [
	"get",
	"post",
	"put",
	"delete",
	"options",
	"patch"
];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/hono-base.js
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
var Hono$1 = class _Hono {
	get;
	post;
	put;
	delete;
	options;
	patch;
	all;
	on;
	use;
	router;
	getPath;
	_basePath = "/";
	#path = "/";
	routes = [];
	constructor(options = {}) {
		[...METHODS, "all"].forEach((method) => {
			this[method] = (args1, ...args) => {
				if (typeof args1 === "string") this.#path = args1;
				else this.#addRoute(method, this.#path, args1);
				args.forEach((handler) => {
					this.#addRoute(method, this.#path, handler);
				});
				return this;
			};
		});
		this.on = (method, path, ...handlers) => {
			for (const p of [path].flat()) {
				this.#path = p;
				for (const m of [method].flat()) handlers.map((handler) => {
					this.#addRoute(m.toUpperCase(), this.#path, handler);
				});
			}
			return this;
		};
		this.use = (arg1, ...handlers) => {
			if (typeof arg1 === "string") this.#path = arg1;
			else {
				this.#path = "*";
				handlers.unshift(arg1);
			}
			handlers.forEach((handler) => {
				this.#addRoute("ALL", this.#path, handler);
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
			if (app.errorHandler === errorHandler) handler = r.handler;
			else {
				handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
				handler[COMPOSED_HANDLER] = r.handler;
			}
			subApp.#addRoute(r.method, r.path, handler);
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
		if (options) if (typeof options === "function") optionHandler = options;
		else {
			optionHandler = options.optionHandler;
			if (options.replaceRequest === false) replaceRequest = (request) => request;
			else replaceRequest = options.replaceRequest;
		}
		const getOptions = optionHandler ? (c) => {
			const options2 = optionHandler(c);
			return Array.isArray(options2) ? options2 : [options2];
		} : (c) => {
			let executionContext = void 0;
			try {
				executionContext = c.executionCtx;
			} catch {}
			return [c.env, executionContext];
		};
		replaceRequest ||= (() => {
			const mergedPath = mergePath(this._basePath, path);
			const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
			return (request) => {
				const url = new URL(request.url);
				url.pathname = url.pathname.slice(pathPrefixLength) || "/";
				return new Request(url, request);
			};
		})();
		const handler = async (c, next) => {
			const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
			if (res) return res;
			await next();
		};
		this.#addRoute("ALL", mergePath(path, "*"), handler);
		return this;
	}
	#addRoute(method, path, handler) {
		method = method.toUpperCase();
		path = mergePath(this._basePath, path);
		const r = {
			basePath: this._basePath,
			path,
			method,
			handler
		};
		this.router.add(method, path, [handler, r]);
		this.routes.push(r);
	}
	#handleError(err, c) {
		if (err instanceof Error) return this.errorHandler(err, c);
		throw err;
	}
	#dispatch(request, executionCtx, env, method) {
		if (method === "HEAD") return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
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
			return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
		}
		const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
		return (async () => {
			try {
				const context = await composed(c);
				if (!context.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
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
		if (input instanceof Request) return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
		input = input.toString();
		return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
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
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
	const matchers = this.buildAllMatchers();
	const match2 = ((method2, path2) => {
		const matcher = matchers[method2] || matchers["ALL"];
		const staticMatch = matcher[2][path2];
		if (staticMatch) return staticMatch;
		const match3 = path2.match(matcher[0]);
		if (!match3) return [[], emptyParam];
		const index = match3.indexOf("", 1);
		return [matcher[1][index], match3];
	});
	this.match = match2;
	return match2(method, path);
}
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = /* @__PURE__ */ new Set(".\\+*[^]$()");
function compareKey(a, b) {
	if (a.length === 1) return b.length === 1 ? a < b ? -1 : 1 : -1;
	if (b.length === 1) return 1;
	if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) return 1;
	else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) return -1;
	if (a === LABEL_REG_EXP_STR) return 1;
	else if (b === LABEL_REG_EXP_STR) return -1;
	return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node$1 = class _Node {
	#index;
	#varIndex;
	#children = /* @__PURE__ */ Object.create(null);
	insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
		if (tokens.length === 0) {
			if (this.#index !== void 0) throw PATH_ERROR;
			if (pathErrorCheckOnly) return;
			this.#index = index;
			return;
		}
		const [token, ...restTokens] = tokens;
		const pattern = token === "*" ? restTokens.length === 0 ? [
			"",
			"",
			ONLY_WILDCARD_REG_EXP_STR
		] : [
			"",
			"",
			LABEL_REG_EXP_STR
		] : token === "/*" ? [
			"",
			"",
			TAIL_WILDCARD_REG_EXP_STR
		] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
		let node;
		if (pattern) {
			const name = pattern[1];
			let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
			if (name && pattern[2]) {
				if (regexpStr === ".*") throw PATH_ERROR;
				regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
				if (/\((?!\?:)/.test(regexpStr)) throw PATH_ERROR;
			}
			node = this.#children[regexpStr];
			if (!node) {
				if (Object.keys(this.#children).some((k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) throw PATH_ERROR;
				if (pathErrorCheckOnly) return;
				node = this.#children[regexpStr] = new _Node();
				if (name !== "") node.#varIndex = context.varIndex++;
			}
			if (!pathErrorCheckOnly && name !== "") paramMap.push([name, node.#varIndex]);
		} else {
			node = this.#children[token];
			if (!node) {
				if (Object.keys(this.#children).some((k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) throw PATH_ERROR;
				if (pathErrorCheckOnly) return;
				node = this.#children[token] = new _Node();
			}
		}
		node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
	}
	buildRegExpStr() {
		const strList = Object.keys(this.#children).sort(compareKey).map((k) => {
			const c = this.#children[k];
			return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
		});
		if (typeof this.#index === "number") strList.unshift(`#${this.#index}`);
		if (strList.length === 0) return "";
		if (strList.length === 1) return strList[0];
		return "(?:" + strList.join("|") + ")";
	}
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
	#context = { varIndex: 0 };
	#root = new Node$1();
	insert(path, index, pathErrorCheckOnly) {
		const paramAssoc = [];
		const groups = [];
		for (let i = 0;;) {
			let replaced = false;
			path = path.replace(/\{[^}]+\}/g, (m) => {
				const mark = `@\\${i}`;
				groups[i] = [mark, m];
				i++;
				replaced = true;
				return mark;
			});
			if (!replaced) break;
		}
		const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
		for (let i = groups.length - 1; i >= 0; i--) {
			const [mark] = groups[i];
			for (let j = tokens.length - 1; j >= 0; j--) if (tokens[j].indexOf(mark) !== -1) {
				tokens[j] = tokens[j].replace(mark, groups[i][1]);
				break;
			}
		}
		this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
		return paramAssoc;
	}
	buildRegExp() {
		let regexp = this.#root.buildRegExpStr();
		if (regexp === "") return [
			/^$/,
			[],
			[]
		];
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
		return [
			new RegExp(`^${regexp}`),
			indexReplacementMap,
			paramReplacementMap
		];
	}
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [
	/^$/,
	[],
	/* @__PURE__ */ Object.create(null)
];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
	return wildcardRegExpCache[path] ??= new RegExp(path === "*" ? "" : `^${path.replace(/\/\*$|([.\\+*[^\]$()])/g, (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)")}$`);
}
function clearWildcardRegExpCache() {
	wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
	const trie = new Trie();
	const handlerData = [];
	if (routes.length === 0) return nullMatcher;
	const routesWithStaticPathFlag = routes.map((route) => [!/\*|\/:/.test(route[0]), ...route]).sort(([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length);
	const staticMap = /* @__PURE__ */ Object.create(null);
	for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
		const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
		if (pathErrorCheckOnly) staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
		else j++;
		let paramAssoc;
		try {
			paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
		} catch (e) {
			throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
		}
		if (pathErrorCheckOnly) continue;
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
	for (let i = 0, len = handlerData.length; i < len; i++) for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
		const map = handlerData[i][j]?.[1];
		if (!map) continue;
		const keys = Object.keys(map);
		for (let k = 0, len3 = keys.length; k < len3; k++) map[keys[k]] = paramReplacementMap[map[keys[k]]];
	}
	const handlerMap = [];
	for (const i in indexReplacementMap) handlerMap[i] = handlerData[indexReplacementMap[i]];
	return [
		regexp,
		handlerMap,
		staticMap
	];
}
function findMiddleware(middleware, path) {
	if (!middleware) return;
	for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) if (buildWildcardRegExp(k).test(path)) return [...middleware[k]];
}
var RegExpRouter = class {
	name = "RegExpRouter";
	#middleware;
	#routes;
	constructor() {
		this.#middleware = { ["ALL"]: /* @__PURE__ */ Object.create(null) };
		this.#routes = { ["ALL"]: /* @__PURE__ */ Object.create(null) };
	}
	add(method, path, handler) {
		const middleware = this.#middleware;
		const routes = this.#routes;
		if (!middleware || !routes) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
		if (!middleware[method]) [middleware, routes].forEach((handlerMap) => {
			handlerMap[method] = /* @__PURE__ */ Object.create(null);
			Object.keys(handlerMap["ALL"]).forEach((p) => {
				handlerMap[method][p] = [...handlerMap["ALL"][p]];
			});
		});
		if (path === "/*") path = "*";
		const paramCount = (path.match(/\/:/g) || []).length;
		if (/\*$/.test(path)) {
			const re = buildWildcardRegExp(path);
			if (method === "ALL") Object.keys(middleware).forEach((m) => {
				middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware["ALL"], path) || [];
			});
			else middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware["ALL"], path) || [];
			Object.keys(middleware).forEach((m) => {
				if (method === "ALL" || method === m) Object.keys(middleware[m]).forEach((p) => {
					re.test(p) && middleware[m][p].push([handler, paramCount]);
				});
			});
			Object.keys(routes).forEach((m) => {
				if (method === "ALL" || method === m) Object.keys(routes[m]).forEach((p) => re.test(p) && routes[m][p].push([handler, paramCount]));
			});
			return;
		}
		const paths = checkOptionalParameter(path) || [path];
		for (let i = 0, len = paths.length; i < len; i++) {
			const path2 = paths[i];
			Object.keys(routes).forEach((m) => {
				if (method === "ALL" || method === m) {
					routes[m][path2] ||= [...findMiddleware(middleware[m], path2) || findMiddleware(middleware["ALL"], path2) || []];
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
		let hasOwnRoute = method === "ALL";
		[this.#middleware, this.#routes].forEach((r) => {
			const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
			if (ownRoute.length !== 0) {
				hasOwnRoute ||= true;
				routes.push(...ownRoute);
			} else if (method !== "ALL") routes.push(...Object.keys(r["ALL"]).map((path) => [path, r["ALL"][path]]));
		});
		if (!hasOwnRoute) return null;
		else return buildMatcherFromPreprocessedRoutes(routes);
	}
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
	name = "SmartRouter";
	#routers = [];
	#routes = [];
	constructor(init) {
		this.#routers = init.routers;
	}
	add(method, path, handler) {
		if (!this.#routes) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
		this.#routes.push([
			method,
			path,
			handler
		]);
	}
	match(method, path) {
		if (!this.#routes) throw new Error("Fatal error");
		const routers = this.#routers;
		const routes = this.#routes;
		const len = routers.length;
		let i = 0;
		let res;
		for (; i < len; i++) {
			const router = routers[i];
			try {
				for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) router.add(...routes[i2]);
				res = router.match(method, path);
			} catch (e) {
				if (e instanceof UnsupportedPathError) continue;
				throw e;
			}
			this.match = router.match.bind(router);
			this.#routers = [router];
			this.#routes = void 0;
			break;
		}
		if (i === len) throw new Error("Fatal error");
		this.name = `SmartRouter + ${this.activeRouter.name}`;
		return res;
	}
	get activeRouter() {
		if (this.#routes || this.#routers.length !== 1) throw new Error("No active router has been determined yet.");
		return this.#routers[0];
	}
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = (children) => {
	for (const _ in children) return true;
	return false;
};
var Node = class _Node {
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
			m[method] = {
				handler,
				possibleKeys: [],
				score: 0
			};
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
				if (pattern) possibleKeys.push(pattern[1]);
				continue;
			}
			curNode.#children[key] = new _Node();
			if (pattern) {
				curNode.#patterns.push(pattern);
				possibleKeys.push(pattern[1]);
			}
			curNode = curNode.#children[key];
		}
		curNode.#methods.push({ [method]: {
			handler,
			possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
			score: this.#order
		} });
		return curNode;
	}
	#pushHandlerSets(handlerSets, node, method, nodeParams, params) {
		for (let i = 0, len = node.#methods.length; i < len; i++) {
			const m = node.#methods[i];
			const handlerSet = m[method] || m["ALL"];
			const processedSet = {};
			if (handlerSet !== void 0) {
				handlerSet.params = /* @__PURE__ */ Object.create(null);
				handlerSets.push(handlerSet);
				if (nodeParams !== emptyParams || params && params !== emptyParams) for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
					const key = handlerSet.possibleKeys[i2];
					const processed = processedSet[handlerSet.score];
					handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
					processedSet[handlerSet.score] = true;
				}
			}
		}
	}
	search(method, path) {
		const handlerSets = [];
		this.#params = emptyParams;
		let curNodes = [this];
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
						if (nextNode.#children["*"]) this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
						this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
					} else tempNodes.push(nextNode);
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
					if (!part && !(matcher instanceof RegExp)) continue;
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
								(curNodesQueue[componentCount] ||= []).push(child);
							}
							continue;
						}
					}
					if (matcher === true || matcher.test(part)) {
						params[name] = part;
						if (isLast) {
							this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
							if (child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, params, node.#params);
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
		if (handlerSets.length > 1) handlerSets.sort((a, b) => {
			return a.score - b.score;
		});
		return [handlerSets.map(({ handler, params }) => [handler, params])];
	}
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
	name = "TrieRouter";
	#node;
	constructor() {
		this.#node = new Node();
	}
	add(method, path, handler) {
		const results = checkOptionalParameter(path);
		if (results) {
			for (let i = 0, len = results.length; i < len; i++) this.#node.insert(method, results[i], handler);
			return;
		}
		this.#node.insert(method, path, handler);
	}
	match(method, path) {
		return this.#node.search(method, path);
	}
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/hono.js
var Hono = class extends Hono$1 {
	/**
	* Creates an instance of the Hono class.
	*
	* @param options - Optional configuration options for the Hono instance.
	*/
	constructor(options = {}) {
		super(options);
		this.router = options.router ?? new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] });
	}
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/utils/cookie.js
var algorithm = {
	name: "HMAC",
	hash: "SHA-256"
};
var getCryptoKey = async (secret) => {
	const secretBuf = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
	return await crypto.subtle.importKey("raw", secretBuf, algorithm, false, ["sign", "verify"]);
};
var makeSignature = async (value, secret) => {
	const key = await getCryptoKey(secret);
	const signature = await crypto.subtle.sign(algorithm.name, key, new TextEncoder().encode(value));
	return btoa(String.fromCharCode(...new Uint8Array(signature)));
};
var verifySignature = async (base64Signature, value, secret) => {
	try {
		const signatureBinStr = atob(base64Signature);
		const signature = new Uint8Array(signatureBinStr.length);
		for (let i = 0, len = signatureBinStr.length; i < len; i++) signature[i] = signatureBinStr.charCodeAt(i);
		return await crypto.subtle.verify(algorithm, secret, signature, new TextEncoder().encode(value));
	} catch {
		return false;
	}
};
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var trimCookieWhitespace = (value) => {
	let start = 0;
	let end = value.length;
	while (start < end) {
		const charCode = value.charCodeAt(start);
		if (charCode !== 32 && charCode !== 9) break;
		start++;
	}
	while (end > start) {
		const charCode = value.charCodeAt(end - 1);
		if (charCode !== 32 && charCode !== 9) break;
		end--;
	}
	return start === 0 && end === value.length ? value : value.slice(start, end);
};
var parse = (cookie, name) => {
	if (name && cookie.indexOf(name) === -1) return {};
	const pairs = cookie.split(";");
	const parsedCookie = {};
	for (const pairStr of pairs) {
		const valueStartPos = pairStr.indexOf("=");
		if (valueStartPos === -1) continue;
		const cookieName = trimCookieWhitespace(pairStr.substring(0, valueStartPos));
		if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) continue;
		let cookieValue = trimCookieWhitespace(pairStr.substring(valueStartPos + 1));
		if (cookieValue.startsWith("\"") && cookieValue.endsWith("\"")) cookieValue = cookieValue.slice(1, -1);
		if (validCookieValueRegEx.test(cookieValue)) {
			parsedCookie[cookieName] = cookieValue.indexOf("%") !== -1 ? tryDecode(cookieValue, decodeURIComponent_) : cookieValue;
			if (name) break;
		}
	}
	return parsedCookie;
};
var parseSigned = async (cookie, secret, name) => {
	const parsedCookie = {};
	const secretKey = await getCryptoKey(secret);
	for (const [key, value] of Object.entries(parse(cookie, name))) {
		const signatureStartPos = value.lastIndexOf(".");
		if (signatureStartPos < 1) continue;
		const signedValue = value.substring(0, signatureStartPos);
		const signature = value.substring(signatureStartPos + 1);
		if (signature.length !== 44 || !signature.endsWith("=")) continue;
		parsedCookie[key] = await verifySignature(signature, signedValue, secretKey) ? signedValue : false;
	}
	return parsedCookie;
};
var _serialize = (name, value, opt = {}) => {
	if (!validCookieNameRegEx.test(name)) throw new Error("Invalid cookie name");
	let cookie = `${name}=${value}`;
	if (name.startsWith("__Secure-") && !opt.secure) throw new Error("__Secure- Cookie must have Secure attributes");
	if (name.startsWith("__Host-")) {
		if (!opt.secure) throw new Error("__Host- Cookie must have Secure attributes");
		if (opt.path !== "/") throw new Error("__Host- Cookie must have Path attributes with \"/\"");
		if (opt.domain) throw new Error("__Host- Cookie must not have Domain attributes");
	}
	for (const key of ["domain", "path"]) if (opt[key] && /[;\r\n]/.test(opt[key])) throw new Error(`${key} must not contain ";", "\\r", or "\\n"`);
	if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
		if (opt.maxAge > 3456e4) throw new Error("Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration.");
		cookie += `; Max-Age=${opt.maxAge | 0}`;
	}
	if (opt.domain && opt.prefix !== "host") cookie += `; Domain=${opt.domain}`;
	if (opt.path) cookie += `; Path=${opt.path}`;
	if (opt.expires) {
		if (opt.expires.getTime() - Date.now() > 3456e7) throw new Error("Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future.");
		cookie += `; Expires=${opt.expires.toUTCString()}`;
	}
	if (opt.httpOnly) cookie += "; HttpOnly";
	if (opt.secure) cookie += "; Secure";
	if (opt.sameSite) cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
	if (opt.priority) cookie += `; Priority=${opt.priority.charAt(0).toUpperCase() + opt.priority.slice(1)}`;
	if (opt.partitioned) {
		if (!opt.secure) throw new Error("Partitioned Cookie must have Secure attributes");
		cookie += "; Partitioned";
	}
	return cookie;
};
var serializeSigned = async (name, value, secret, opt = {}) => {
	const signature = await makeSignature(value, secret);
	value = `${value}.${signature}`;
	value = encodeURIComponent(value);
	return _serialize(name, value, opt);
};
//#endregion
//#region node_modules/.pnpm/hono@4.12.18/node_modules/hono/dist/helper/cookie/index.js
var getSignedCookie = async (c, secret, key, prefix) => {
	const cookie = c.req.raw.headers.get("Cookie");
	if (typeof key === "string") {
		if (!cookie) return;
		let finalKey = key;
		if (prefix === "secure") finalKey = "__Secure-" + key;
		else if (prefix === "host") finalKey = "__Host-" + key;
		return (await parseSigned(cookie, secret, finalKey))[finalKey];
	}
	if (!cookie) return {};
	return await parseSigned(cookie, secret);
};
var generateSignedCookie = async (name, value, secret, opt) => {
	let cookie;
	if (opt?.prefix === "secure") cookie = await serializeSigned("__Secure-" + name, value, secret, {
		path: "/",
		...opt,
		secure: true
	});
	else if (opt?.prefix === "host") cookie = await serializeSigned("__Host-" + name, value, secret, {
		...opt,
		path: "/",
		secure: true,
		domain: void 0
	});
	else cookie = await serializeSigned(name, value, secret, {
		path: "/",
		...opt
	});
	return cookie;
};
var setSignedCookie = async (c, name, value, secret, opt) => {
	const cookie = await generateSignedCookie(name, value, secret, opt);
	c.header("set-cookie", cookie, { append: true });
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/entity.js
var entityKind = Symbol.for("drizzle:entityKind");
function is(value, type) {
	if (!value || typeof value !== "object") return false;
	if (value instanceof type) return true;
	if (!Object.prototype.hasOwnProperty.call(type, entityKind)) throw new Error(`Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`);
	let cls = Object.getPrototypeOf(value).constructor;
	if (cls) while (cls) {
		if (entityKind in cls && cls[entityKind] === type[entityKind]) return true;
		cls = Object.getPrototypeOf(cls);
	}
	return false;
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/column.js
var Column = class {
	constructor(table, config) {
		this.table = table;
		this.config = config;
		this.name = config.name;
		this.keyAsName = config.keyAsName;
		this.notNull = config.notNull;
		this.default = config.default;
		this.defaultFn = config.defaultFn;
		this.onUpdateFn = config.onUpdateFn;
		this.hasDefault = config.hasDefault;
		this.primary = config.primaryKey;
		this.isUnique = config.isUnique;
		this.uniqueName = config.uniqueName;
		this.uniqueType = config.uniqueType;
		this.dataType = config.dataType;
		this.columnType = config.columnType;
		this.generated = config.generated;
		this.generatedIdentity = config.generatedIdentity;
	}
	static [entityKind] = "Column";
	name;
	keyAsName;
	primary;
	notNull;
	default;
	defaultFn;
	onUpdateFn;
	hasDefault;
	isUnique;
	uniqueName;
	uniqueType;
	dataType;
	columnType;
	enumValues = void 0;
	generated = void 0;
	generatedIdentity = void 0;
	config;
	mapFromDriverValue(value) {
		return value;
	}
	mapToDriverValue(value) {
		return value;
	}
	shouldDisableInsert() {
		return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/column-builder.js
var ColumnBuilder = class {
	static [entityKind] = "ColumnBuilder";
	config;
	constructor(name, dataType, columnType) {
		this.config = {
			name,
			keyAsName: name === "",
			notNull: false,
			default: void 0,
			hasDefault: false,
			primaryKey: false,
			isUnique: false,
			uniqueName: void 0,
			uniqueType: void 0,
			dataType,
			columnType,
			generated: void 0
		};
	}
	/**
	* Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
	*
	* @example
	* ```ts
	* const users = pgTable('users', {
	* 	id: integer('id').$type<UserId>().primaryKey(),
	* 	details: json('details').$type<UserDetails>().notNull(),
	* });
	* ```
	*/
	$type() {
		return this;
	}
	/**
	* Adds a `not null` clause to the column definition.
	*
	* Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
	*/
	notNull() {
		this.config.notNull = true;
		return this;
	}
	/**
	* Adds a `default <value>` clause to the column definition.
	*
	* Affects the `insert` model of the table - columns *with* `default` are optional on insert.
	*
	* If you need to set a dynamic default value, use {@link $defaultFn} instead.
	*/
	default(value) {
		this.config.default = value;
		this.config.hasDefault = true;
		return this;
	}
	/**
	* Adds a dynamic default value to the column.
	* The function will be called when the row is inserted, and the returned value will be used as the column value.
	*
	* **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
	*/
	$defaultFn(fn) {
		this.config.defaultFn = fn;
		this.config.hasDefault = true;
		return this;
	}
	/**
	* Alias for {@link $defaultFn}.
	*/
	$default = this.$defaultFn;
	/**
	* Adds a dynamic update value to the column.
	* The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
	* If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
	*
	* **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
	*/
	$onUpdateFn(fn) {
		this.config.onUpdateFn = fn;
		this.config.hasDefault = true;
		return this;
	}
	/**
	* Alias for {@link $onUpdateFn}.
	*/
	$onUpdate = this.$onUpdateFn;
	/**
	* Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
	*
	* In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
	*/
	primaryKey() {
		this.config.primaryKey = true;
		this.config.notNull = true;
		return this;
	}
	/** @internal Sets the name of the column to the key within the table definition if a name was not given. */
	setName(name) {
		if (this.config.name !== "") return;
		this.config.name = name;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/table.utils.js
var TableName = Symbol.for("drizzle:Name");
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/pg-core/columns/enum.js
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
	return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/subquery.js
var Subquery = class {
	static [entityKind] = "Subquery";
	constructor(sql, fields, alias, isWith = false, usedTables = []) {
		this._ = {
			brand: "Subquery",
			sql,
			selectedFields: fields,
			alias,
			isWith,
			usedTables
		};
	}
};
var WithSubquery = class extends Subquery {
	static [entityKind] = "WithSubquery";
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/tracing.js
var tracer = { startActiveSpan(name, fn) {
	return fn();
} };
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/table.js
var Schema = Symbol.for("drizzle:Schema");
var Columns = Symbol.for("drizzle:Columns");
var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = Symbol.for("drizzle:OriginalName");
var BaseName = Symbol.for("drizzle:BaseName");
var IsAlias = Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
var Table = class {
	static [entityKind] = "Table";
	/** @internal */
	static Symbol = {
		Name: TableName,
		Schema,
		OriginalName,
		Columns,
		ExtraConfigColumns,
		BaseName,
		IsAlias,
		ExtraConfigBuilder
	};
	/**
	* @internal
	* Can be changed if the table is aliased.
	*/
	[TableName];
	/**
	* @internal
	* Used to store the original name of the table, before any aliasing.
	*/
	[OriginalName];
	/** @internal */
	[Schema];
	/** @internal */
	[Columns];
	/** @internal */
	[ExtraConfigColumns];
	/**
	*  @internal
	* Used to store the table name before the transformation via the `tableCreator` functions.
	*/
	[BaseName];
	/** @internal */
	[IsAlias] = false;
	/** @internal */
	[IsDrizzleTable] = true;
	/** @internal */
	[ExtraConfigBuilder] = void 0;
	constructor(name, schema, baseName) {
		this[TableName] = this[OriginalName] = name;
		this[Schema] = schema;
		this[BaseName] = baseName;
	}
};
function getTableName(table) {
	return table[TableName];
}
function getTableUniqueName(table) {
	return `${table[Schema] ?? "public"}.${table[TableName]}`;
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sql/sql.js
function isSQLWrapper(value) {
	return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
	const result = {
		sql: "",
		params: []
	};
	for (const query of queries) {
		result.sql += query.sql;
		result.params.push(...query.params);
		if (query.typings?.length) {
			if (!result.typings) result.typings = [];
			result.typings.push(...query.typings);
		}
	}
	return result;
}
var StringChunk = class {
	static [entityKind] = "StringChunk";
	value;
	constructor(value) {
		this.value = Array.isArray(value) ? value : [value];
	}
	getSQL() {
		return new SQL([this]);
	}
};
var SQL = class SQL {
	constructor(queryChunks) {
		this.queryChunks = queryChunks;
		for (const chunk of queryChunks) if (is(chunk, Table)) {
			const schemaName = chunk[Table.Symbol.Schema];
			this.usedTables.push(schemaName === void 0 ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]);
		}
	}
	static [entityKind] = "SQL";
	/** @internal */
	decoder = noopDecoder;
	shouldInlineParams = false;
	/** @internal */
	usedTables = [];
	append(query) {
		this.queryChunks.push(...query.queryChunks);
		return this;
	}
	toQuery(config) {
		return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
			const query = this.buildQueryFromSourceParams(this.queryChunks, config);
			span?.setAttributes({
				"drizzle.query.text": query.sql,
				"drizzle.query.params": JSON.stringify(query.params)
			});
			return query;
		});
	}
	buildQueryFromSourceParams(chunks, _config) {
		const config = Object.assign({}, _config, {
			inlineParams: _config.inlineParams || this.shouldInlineParams,
			paramStartIndex: _config.paramStartIndex || { value: 0 }
		});
		const { casing, escapeName, escapeParam, prepareTyping, inlineParams, paramStartIndex } = config;
		return mergeQueries(chunks.map((chunk) => {
			if (is(chunk, StringChunk)) return {
				sql: chunk.value.join(""),
				params: []
			};
			if (is(chunk, Name)) return {
				sql: escapeName(chunk.value),
				params: []
			};
			if (chunk === void 0) return {
				sql: "",
				params: []
			};
			if (Array.isArray(chunk)) {
				const result = [new StringChunk("(")];
				for (const [i, p] of chunk.entries()) {
					result.push(p);
					if (i < chunk.length - 1) result.push(new StringChunk(", "));
				}
				result.push(new StringChunk(")"));
				return this.buildQueryFromSourceParams(result, config);
			}
			if (is(chunk, SQL)) return this.buildQueryFromSourceParams(chunk.queryChunks, {
				...config,
				inlineParams: inlineParams || chunk.shouldInlineParams
			});
			if (is(chunk, Table)) {
				const schemaName = chunk[Table.Symbol.Schema];
				const tableName = chunk[Table.Symbol.Name];
				return {
					sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
					params: []
				};
			}
			if (is(chunk, Column)) {
				const columnName = casing.getColumnCasing(chunk);
				if (_config.invokeSource === "indexes") return {
					sql: escapeName(columnName),
					params: []
				};
				const schemaName = chunk.table[Table.Symbol.Schema];
				return {
					sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
					params: []
				};
			}
			if (is(chunk, View)) {
				const schemaName = chunk[ViewBaseConfig].schema;
				const viewName = chunk[ViewBaseConfig].name;
				return {
					sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
					params: []
				};
			}
			if (is(chunk, Param)) {
				if (is(chunk.value, Placeholder)) return {
					sql: escapeParam(paramStartIndex.value++, chunk),
					params: [chunk],
					typings: ["none"]
				};
				const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
				if (is(mappedValue, SQL)) return this.buildQueryFromSourceParams([mappedValue], config);
				if (inlineParams) return {
					sql: this.mapInlineParam(mappedValue, config),
					params: []
				};
				let typings = ["none"];
				if (prepareTyping) typings = [prepareTyping(chunk.encoder)];
				return {
					sql: escapeParam(paramStartIndex.value++, mappedValue),
					params: [mappedValue],
					typings
				};
			}
			if (is(chunk, Placeholder)) return {
				sql: escapeParam(paramStartIndex.value++, chunk),
				params: [chunk],
				typings: ["none"]
			};
			if (is(chunk, SQL.Aliased) && chunk.fieldAlias !== void 0) return {
				sql: escapeName(chunk.fieldAlias),
				params: []
			};
			if (is(chunk, Subquery)) {
				if (chunk._.isWith) return {
					sql: escapeName(chunk._.alias),
					params: []
				};
				return this.buildQueryFromSourceParams([
					new StringChunk("("),
					chunk._.sql,
					new StringChunk(") "),
					new Name(chunk._.alias)
				], config);
			}
			if (isPgEnum(chunk)) {
				if (chunk.schema) return {
					sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName),
					params: []
				};
				return {
					sql: escapeName(chunk.enumName),
					params: []
				};
			}
			if (isSQLWrapper(chunk)) {
				if (chunk.shouldOmitSQLParens?.()) return this.buildQueryFromSourceParams([chunk.getSQL()], config);
				return this.buildQueryFromSourceParams([
					new StringChunk("("),
					chunk.getSQL(),
					new StringChunk(")")
				], config);
			}
			if (inlineParams) return {
				sql: this.mapInlineParam(chunk, config),
				params: []
			};
			return {
				sql: escapeParam(paramStartIndex.value++, chunk),
				params: [chunk],
				typings: ["none"]
			};
		}));
	}
	mapInlineParam(chunk, { escapeString }) {
		if (chunk === null) return "null";
		if (typeof chunk === "number" || typeof chunk === "boolean") return chunk.toString();
		if (typeof chunk === "string") return escapeString(chunk);
		if (typeof chunk === "object") {
			const mappedValueAsString = chunk.toString();
			if (mappedValueAsString === "[object Object]") return escapeString(JSON.stringify(chunk));
			return escapeString(mappedValueAsString);
		}
		throw new Error("Unexpected param value: " + chunk);
	}
	getSQL() {
		return this;
	}
	as(alias) {
		if (alias === void 0) return this;
		return new SQL.Aliased(this, alias);
	}
	mapWith(decoder) {
		this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
		return this;
	}
	inlineParams() {
		this.shouldInlineParams = true;
		return this;
	}
	/**
	* This method is used to conditionally include a part of the query.
	*
	* @param condition - Condition to check
	* @returns itself if the condition is `true`, otherwise `undefined`
	*/
	if(condition) {
		return condition ? this : void 0;
	}
};
var Name = class {
	constructor(value) {
		this.value = value;
	}
	static [entityKind] = "Name";
	brand;
	getSQL() {
		return new SQL([this]);
	}
};
function isDriverValueEncoder(value) {
	return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
var noopDecoder = { mapFromDriverValue: (value) => value };
var noopEncoder = { mapToDriverValue: (value) => value };
({
	...noopDecoder,
	...noopEncoder
});
var Param = class {
	/**
	* @param value - Parameter value
	* @param encoder - Encoder to convert the value to a driver parameter
	*/
	constructor(value, encoder = noopEncoder) {
		this.value = value;
		this.encoder = encoder;
	}
	static [entityKind] = "Param";
	brand;
	getSQL() {
		return new SQL([this]);
	}
};
function sql(strings, ...params) {
	const queryChunks = [];
	if (params.length > 0 || strings.length > 0 && strings[0] !== "") queryChunks.push(new StringChunk(strings[0]));
	for (const [paramIndex, param2] of params.entries()) queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
	return new SQL(queryChunks);
}
((sql2) => {
	function empty() {
		return new SQL([]);
	}
	sql2.empty = empty;
	function fromList(list) {
		return new SQL(list);
	}
	sql2.fromList = fromList;
	function raw(str) {
		return new SQL([new StringChunk(str)]);
	}
	sql2.raw = raw;
	function join(chunks, separator) {
		const result = [];
		for (const [i, chunk] of chunks.entries()) {
			if (i > 0 && separator !== void 0) result.push(separator);
			result.push(chunk);
		}
		return new SQL(result);
	}
	sql2.join = join;
	function identifier(value) {
		return new Name(value);
	}
	sql2.identifier = identifier;
	function placeholder2(name2) {
		return new Placeholder(name2);
	}
	sql2.placeholder = placeholder2;
	function param2(value, encoder) {
		return new Param(value, encoder);
	}
	sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
	class Aliased {
		constructor(sql2, fieldAlias) {
			this.sql = sql2;
			this.fieldAlias = fieldAlias;
		}
		static [entityKind] = "SQL.Aliased";
		/** @internal */
		isSelectionField = false;
		getSQL() {
			return this.sql;
		}
		/** @internal */
		clone() {
			return new Aliased(this.sql, this.fieldAlias);
		}
	}
	SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var Placeholder = class {
	constructor(name2) {
		this.name = name2;
	}
	static [entityKind] = "Placeholder";
	getSQL() {
		return new SQL([this]);
	}
};
function fillPlaceholders(params, values) {
	return params.map((p) => {
		if (is(p, Placeholder)) {
			if (!(p.name in values)) throw new Error(`No value for placeholder "${p.name}" was provided`);
			return values[p.name];
		}
		if (is(p, Param) && is(p.value, Placeholder)) {
			if (!(p.value.name in values)) throw new Error(`No value for placeholder "${p.value.name}" was provided`);
			return p.encoder.mapToDriverValue(values[p.value.name]);
		}
		return p;
	});
}
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
var View = class {
	static [entityKind] = "View";
	/** @internal */
	[ViewBaseConfig];
	/** @internal */
	[IsDrizzleView] = true;
	constructor({ name: name2, schema, selectedFields, query }) {
		this[ViewBaseConfig] = {
			name: name2,
			originalName: name2,
			schema,
			selectedFields,
			query,
			isExisting: !query,
			isAlias: false
		};
	}
	getSQL() {
		return new SQL([this]);
	}
};
Column.prototype.getSQL = function() {
	return new SQL([this]);
};
Table.prototype.getSQL = function() {
	return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
	return new SQL([this]);
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/alias.js
var ColumnAliasProxyHandler = class {
	constructor(table) {
		this.table = table;
	}
	static [entityKind] = "ColumnAliasProxyHandler";
	get(columnObj, prop) {
		if (prop === "table") return this.table;
		return columnObj[prop];
	}
};
var TableAliasProxyHandler = class {
	constructor(alias, replaceOriginalName) {
		this.alias = alias;
		this.replaceOriginalName = replaceOriginalName;
	}
	static [entityKind] = "TableAliasProxyHandler";
	get(target, prop) {
		if (prop === Table.Symbol.IsAlias) return true;
		if (prop === Table.Symbol.Name) return this.alias;
		if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) return this.alias;
		if (prop === ViewBaseConfig) return {
			...target[ViewBaseConfig],
			name: this.alias,
			isAlias: true
		};
		if (prop === Table.Symbol.Columns) {
			const columns = target[Table.Symbol.Columns];
			if (!columns) return columns;
			const proxiedColumns = {};
			Object.keys(columns).map((key) => {
				proxiedColumns[key] = new Proxy(columns[key], new ColumnAliasProxyHandler(new Proxy(target, this)));
			});
			return proxiedColumns;
		}
		const value = target[prop];
		if (is(value, Column)) return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
		return value;
	}
};
function aliasedTable(table, tableAlias) {
	return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
	return new Proxy(column, new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false))));
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
	return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
	return sql.join(query.queryChunks.map((c) => {
		if (is(c, Column)) return aliasedTableColumn(c, alias);
		if (is(c, SQL)) return mapColumnsInSQLToAlias(c, alias);
		if (is(c, SQL.Aliased)) return mapColumnsInAliasedSQLToAlias(c, alias);
		return c;
	}));
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/errors.js
var DrizzleError = class extends Error {
	static [entityKind] = "DrizzleError";
	constructor({ message, cause }) {
		super(message);
		this.name = "DrizzleError";
		this.cause = cause;
	}
};
var DrizzleQueryError = class DrizzleQueryError extends Error {
	constructor(query, params, cause) {
		super(`Failed query: ${query}
params: ${params}`);
		this.query = query;
		this.params = params;
		this.cause = cause;
		Error.captureStackTrace(this, DrizzleQueryError);
		if (cause) this.cause = cause;
	}
};
var TransactionRollbackError = class extends DrizzleError {
	static [entityKind] = "TransactionRollbackError";
	constructor() {
		super({ message: "Rollback" });
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/logger.js
var ConsoleLogWriter = class {
	static [entityKind] = "ConsoleLogWriter";
	write(message) {
		console.log(message);
	}
};
var DefaultLogger = class {
	static [entityKind] = "DefaultLogger";
	writer;
	constructor(config) {
		this.writer = config?.writer ?? new ConsoleLogWriter();
	}
	logQuery(query, params) {
		const stringifiedParams = params.map((p) => {
			try {
				return JSON.stringify(p);
			} catch {
				return String(p);
			}
		});
		const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
		this.writer.write(`Query: ${query}${paramsStr}`);
	}
};
var NoopLogger = class {
	static [entityKind] = "NoopLogger";
	logQuery() {}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/query-promise.js
var QueryPromise = class {
	static [entityKind] = "QueryPromise";
	[Symbol.toStringTag] = "QueryPromise";
	catch(onRejected) {
		return this.then(void 0, onRejected);
	}
	finally(onFinally) {
		return this.then((value) => {
			onFinally?.();
			return value;
		}, (reason) => {
			onFinally?.();
			throw reason;
		});
	}
	then(onFulfilled, onRejected) {
		return this.execute().then(onFulfilled, onRejected);
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/utils.js
function mapResultRow(columns, row, joinsNotNullableMap) {
	const nullifyMap = {};
	const result = columns.reduce((result2, { path, field }, columnIndex) => {
		let decoder;
		if (is(field, Column)) decoder = field;
		else if (is(field, SQL)) decoder = field.decoder;
		else if (is(field, Subquery)) decoder = field._.sql.decoder;
		else decoder = field.sql.decoder;
		let node = result2;
		for (const [pathChunkIndex, pathChunk] of path.entries()) if (pathChunkIndex < path.length - 1) {
			if (!(pathChunk in node)) node[pathChunk] = {};
			node = node[pathChunk];
		} else {
			const rawValue = row[columnIndex];
			const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
			if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
				const objectName = path[0];
				if (!(objectName in nullifyMap)) nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
				else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) nullifyMap[objectName] = false;
			}
		}
		return result2;
	}, {});
	if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
		for (const [objectName, tableName] of Object.entries(nullifyMap)) if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) result[objectName] = null;
	}
	return result;
}
function orderSelectedFields(fields, pathPrefix) {
	return Object.entries(fields).reduce((result, [name, field]) => {
		if (typeof name !== "string") return result;
		const newPath = pathPrefix ? [...pathPrefix, name] : [name];
		if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased) || is(field, Subquery)) result.push({
			path: newPath,
			field
		});
		else if (is(field, Table)) result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
		else result.push(...orderSelectedFields(field, newPath));
		return result;
	}, []);
}
function haveSameKeys(left, right) {
	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) return false;
	for (const [index, key] of leftKeys.entries()) if (key !== rightKeys[index]) return false;
	return true;
}
function mapUpdateSet(table, values) {
	const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
		if (is(value, SQL) || is(value, Column)) return [key, value];
		else return [key, new Param(value, table[Table.Symbol.Columns][key])];
	});
	if (entries.length === 0) throw new Error("No values to set");
	return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
	for (const extendedClass of extendedClasses) for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
		if (name === "constructor") continue;
		Object.defineProperty(baseClass.prototype, name, Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null));
	}
}
function getTableColumns(table) {
	return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
	return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a, b) {
	return {
		name: typeof a === "string" && a.length > 0 ? a : "",
		config: typeof a === "object" ? a : b
	};
}
var textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder();
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/pg-core/table.js
var InlineForeignKeys$1 = Symbol.for("drizzle:PgInlineForeignKeys");
var EnableRLS = Symbol.for("drizzle:EnableRLS");
var PgTable = class extends Table {
	static [entityKind] = "PgTable";
	/** @internal */
	static Symbol = Object.assign({}, Table.Symbol, {
		InlineForeignKeys: InlineForeignKeys$1,
		EnableRLS
	});
	/**@internal */
	[InlineForeignKeys$1] = [];
	/** @internal */
	[EnableRLS] = false;
	/** @internal */
	[Table.Symbol.ExtraConfigBuilder] = void 0;
	/** @internal */
	[Table.Symbol.ExtraConfigColumns] = {};
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/pg-core/primary-keys.js
var PrimaryKeyBuilder = class {
	static [entityKind] = "PgPrimaryKeyBuilder";
	/** @internal */
	columns;
	/** @internal */
	name;
	constructor(columns, name) {
		this.columns = columns;
		this.name = name;
	}
	/** @internal */
	build(table) {
		return new PrimaryKey(table, this.columns, this.name);
	}
};
var PrimaryKey = class {
	constructor(table, columns, name) {
		this.table = table;
		this.columns = columns;
		this.name = name;
	}
	static [entityKind] = "PgPrimaryKey";
	columns;
	name;
	getName() {
		return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
	if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) return new Param(value, column);
	return value;
}
var eq = (left, right) => {
	return sql`${left} = ${bindIfParam(right, left)}`;
};
var ne = (left, right) => {
	return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
	const conditions = unfilteredConditions.filter((c) => c !== void 0);
	if (conditions.length === 0) return;
	if (conditions.length === 1) return new SQL(conditions);
	return new SQL([
		new StringChunk("("),
		sql.join(conditions, new StringChunk(" and ")),
		new StringChunk(")")
	]);
}
function or(...unfilteredConditions) {
	const conditions = unfilteredConditions.filter((c) => c !== void 0);
	if (conditions.length === 0) return;
	if (conditions.length === 1) return new SQL(conditions);
	return new SQL([
		new StringChunk("("),
		sql.join(conditions, new StringChunk(" or ")),
		new StringChunk(")")
	]);
}
function not(condition) {
	return sql`not ${condition}`;
}
var gt = (left, right) => {
	return sql`${left} > ${bindIfParam(right, left)}`;
};
var gte = (left, right) => {
	return sql`${left} >= ${bindIfParam(right, left)}`;
};
var lt = (left, right) => {
	return sql`${left} < ${bindIfParam(right, left)}`;
};
var lte = (left, right) => {
	return sql`${left} <= ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
	if (Array.isArray(values)) {
		if (values.length === 0) return sql`false`;
		return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
	}
	return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
	if (Array.isArray(values)) {
		if (values.length === 0) return sql`true`;
		return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
	}
	return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
	return sql`${value} is null`;
}
function isNotNull(value) {
	return sql`${value} is not null`;
}
function exists(subquery) {
	return sql`exists ${subquery}`;
}
function notExists(subquery) {
	return sql`not exists ${subquery}`;
}
function between(column, min, max) {
	return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(max, column)}`;
}
function notBetween(column, min, max) {
	return sql`${column} not between ${bindIfParam(min, column)} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
	return sql`${column} like ${value}`;
}
function notLike(column, value) {
	return sql`${column} not like ${value}`;
}
function ilike(column, value) {
	return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
	return sql`${column} not ilike ${value}`;
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
	return sql`${column} asc`;
}
function desc(column) {
	return sql`${column} desc`;
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/relations.js
var Relation = class {
	constructor(sourceTable, referencedTable, relationName) {
		this.sourceTable = sourceTable;
		this.referencedTable = referencedTable;
		this.relationName = relationName;
		this.referencedTableName = referencedTable[Table.Symbol.Name];
	}
	static [entityKind] = "Relation";
	referencedTableName;
	fieldName;
};
var Relations = class {
	constructor(table, config) {
		this.table = table;
		this.config = config;
	}
	static [entityKind] = "Relations";
};
var One = class One extends Relation {
	constructor(sourceTable, referencedTable, config, isNullable) {
		super(sourceTable, referencedTable, config?.relationName);
		this.config = config;
		this.isNullable = isNullable;
	}
	static [entityKind] = "One";
	withFieldName(fieldName) {
		const relation = new One(this.sourceTable, this.referencedTable, this.config, this.isNullable);
		relation.fieldName = fieldName;
		return relation;
	}
};
var Many = class Many extends Relation {
	constructor(sourceTable, referencedTable, config) {
		super(sourceTable, referencedTable, config?.relationName);
		this.config = config;
	}
	static [entityKind] = "Many";
	withFieldName(fieldName) {
		const relation = new Many(this.sourceTable, this.referencedTable, this.config);
		relation.fieldName = fieldName;
		return relation;
	}
};
function getOperators() {
	return {
		and,
		between,
		eq,
		exists,
		gt,
		gte,
		ilike,
		inArray,
		isNull,
		isNotNull,
		like,
		lt,
		lte,
		ne,
		not,
		notBetween,
		notExists,
		notLike,
		notIlike,
		notInArray,
		or,
		sql
	};
}
function getOrderByOperators() {
	return {
		sql,
		asc,
		desc
	};
}
function extractTablesRelationalConfig(schema, configHelpers) {
	if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) schema = schema["default"];
	const tableNamesMap = {};
	const relationsBuffer = {};
	const tablesConfig = {};
	for (const [key, value] of Object.entries(schema)) if (is(value, Table)) {
		const dbName = getTableUniqueName(value);
		const bufferedRelations = relationsBuffer[dbName];
		tableNamesMap[dbName] = key;
		tablesConfig[key] = {
			tsName: key,
			dbName: value[Table.Symbol.Name],
			schema: value[Table.Symbol.Schema],
			columns: value[Table.Symbol.Columns],
			relations: bufferedRelations?.relations ?? {},
			primaryKey: bufferedRelations?.primaryKey ?? []
		};
		for (const column of Object.values(value[Table.Symbol.Columns])) if (column.primary) tablesConfig[key].primaryKey.push(column);
		const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
		if (extraConfig) {
			for (const configEntry of Object.values(extraConfig)) if (is(configEntry, PrimaryKeyBuilder)) tablesConfig[key].primaryKey.push(...configEntry.columns);
		}
	} else if (is(value, Relations)) {
		const dbName = getTableUniqueName(value.table);
		const tableName = tableNamesMap[dbName];
		const relations2 = value.config(configHelpers(value.table));
		let primaryKey;
		for (const [relationName, relation] of Object.entries(relations2)) if (tableName) {
			const tableConfig = tablesConfig[tableName];
			tableConfig.relations[relationName] = relation;
		} else {
			if (!(dbName in relationsBuffer)) relationsBuffer[dbName] = {
				relations: {},
				primaryKey
			};
			relationsBuffer[dbName].relations[relationName] = relation;
		}
	}
	return {
		tables: tablesConfig,
		tableNamesMap
	};
}
function createOne(sourceTable) {
	return function one(table, config) {
		return new One(sourceTable, table, config, config?.fields.reduce((res, f) => res && f.notNull, true) ?? false);
	};
}
function createMany(sourceTable) {
	return function many(referencedTable, config) {
		return new Many(sourceTable, referencedTable, config);
	};
}
function normalizeRelation(schema, tableNamesMap, relation) {
	if (is(relation, One) && relation.config) return {
		fields: relation.config.fields,
		references: relation.config.references
	};
	const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
	if (!referencedTableTsName) throw new Error(`Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`);
	const referencedTableConfig = schema[referencedTableTsName];
	if (!referencedTableConfig) throw new Error(`Table "${referencedTableTsName}" not found in schema`);
	const sourceTable = relation.sourceTable;
	const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
	if (!sourceTableTsName) throw new Error(`Table "${sourceTable[Table.Symbol.Name]}" not found in schema`);
	const reverseRelations = [];
	for (const referencedTableRelation of Object.values(referencedTableConfig.relations)) if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) reverseRelations.push(referencedTableRelation);
	if (reverseRelations.length > 1) throw relation.relationName ? /* @__PURE__ */ new Error(`There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`) : /* @__PURE__ */ new Error(`There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`);
	if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) return {
		fields: reverseRelations[0].config.references,
		references: reverseRelations[0].config.fields
	};
	throw new Error(`There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`);
}
function createTableRelationsHelpers(sourceTable) {
	return {
		one: createOne(sourceTable),
		many: createMany(sourceTable)
	};
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
	const result = {};
	for (const [selectionItemIndex, selectionItem] of buildQueryResultSelection.entries()) if (selectionItem.isJson) {
		const relation = tableConfig.relations[selectionItem.tsKey];
		const rawSubRows = row[selectionItemIndex];
		const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
		result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(tablesConfig, tablesConfig[selectionItem.relationTableTsKey], subRows, selectionItem.selection, mapColumnValue) : subRows.map((subRow) => mapRelationalRow(tablesConfig, tablesConfig[selectionItem.relationTableTsKey], subRow, selectionItem.selection, mapColumnValue));
	} else {
		const value = mapColumnValue(row[selectionItemIndex]);
		const field = selectionItem.field;
		let decoder;
		if (is(field, Column)) decoder = field;
		else if (is(field, SQL)) decoder = field.decoder;
		else decoder = field.sql.decoder;
		result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
	}
	return result;
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/selection-proxy.js
var SelectionProxyHandler = class SelectionProxyHandler {
	static [entityKind] = "SelectionProxyHandler";
	config;
	constructor(config) {
		this.config = { ...config };
	}
	get(subquery, prop) {
		if (prop === "_") return {
			...subquery["_"],
			selectedFields: new Proxy(subquery._.selectedFields, this)
		};
		if (prop === ViewBaseConfig) return {
			...subquery[ViewBaseConfig],
			selectedFields: new Proxy(subquery[ViewBaseConfig].selectedFields, this)
		};
		if (typeof prop === "symbol") return subquery[prop];
		const value = (is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery)[prop];
		if (is(value, SQL.Aliased)) {
			if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) return value.sql;
			const newValue = value.clone();
			newValue.isSelectionField = true;
			return newValue;
		}
		if (is(value, SQL)) {
			if (this.config.sqlBehavior === "sql") return value;
			throw new Error(`You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`);
		}
		if (is(value, Column)) {
			if (this.config.alias) return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(value.table, new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false))));
			return value;
		}
		if (typeof value !== "object" || value === null) return value;
		return new Proxy(value, new SelectionProxyHandler(this.config));
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/foreign-keys.js
var ForeignKeyBuilder = class {
	static [entityKind] = "SQLiteForeignKeyBuilder";
	/** @internal */
	reference;
	/** @internal */
	_onUpdate;
	/** @internal */
	_onDelete;
	constructor(config, actions) {
		this.reference = () => {
			const { name, columns, foreignColumns } = config();
			return {
				name,
				columns,
				foreignTable: foreignColumns[0].table,
				foreignColumns
			};
		};
		if (actions) {
			this._onUpdate = actions.onUpdate;
			this._onDelete = actions.onDelete;
		}
	}
	onUpdate(action) {
		this._onUpdate = action;
		return this;
	}
	onDelete(action) {
		this._onDelete = action;
		return this;
	}
	/** @internal */
	build(table) {
		return new ForeignKey(table, this);
	}
};
var ForeignKey = class {
	constructor(table, builder) {
		this.table = table;
		this.reference = builder.reference;
		this.onUpdate = builder._onUpdate;
		this.onDelete = builder._onDelete;
	}
	static [entityKind] = "SQLiteForeignKey";
	reference;
	onUpdate;
	onDelete;
	getName() {
		const { name, columns, foreignColumns } = this.reference();
		const columnNames = columns.map((column) => column.name);
		const foreignColumnNames = foreignColumns.map((column) => column.name);
		const chunks = [
			this.table[TableName],
			...columnNames,
			foreignColumns[0].table[TableName],
			...foreignColumnNames
		];
		return name ?? `${chunks.join("_")}_fk`;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/unique-constraint.js
function uniqueKeyName(table, columns) {
	return `${table[TableName]}_${columns.join("_")}_unique`;
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/columns/common.js
var SQLiteColumnBuilder = class extends ColumnBuilder {
	static [entityKind] = "SQLiteColumnBuilder";
	foreignKeyConfigs = [];
	references(ref, actions = {}) {
		this.foreignKeyConfigs.push({
			ref,
			actions
		});
		return this;
	}
	unique(name) {
		this.config.isUnique = true;
		this.config.uniqueName = name;
		return this;
	}
	generatedAlwaysAs(as, config) {
		this.config.generated = {
			as,
			type: "always",
			mode: config?.mode ?? "virtual"
		};
		return this;
	}
	/** @internal */
	buildForeignKeys(column, table) {
		return this.foreignKeyConfigs.map(({ ref, actions }) => {
			return ((ref2, actions2) => {
				const builder = new ForeignKeyBuilder(() => {
					const foreignColumn = ref2();
					return {
						columns: [column],
						foreignColumns: [foreignColumn]
					};
				});
				if (actions2.onUpdate) builder.onUpdate(actions2.onUpdate);
				if (actions2.onDelete) builder.onDelete(actions2.onDelete);
				return builder.build(table);
			})(ref, actions);
		});
	}
};
var SQLiteColumn = class extends Column {
	constructor(table, config) {
		if (!config.uniqueName) config.uniqueName = uniqueKeyName(table, [config.name]);
		super(table, config);
		this.table = table;
	}
	static [entityKind] = "SQLiteColumn";
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/columns/blob.js
var SQLiteBigIntBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteBigIntBuilder";
	constructor(name) {
		super(name, "bigint", "SQLiteBigInt");
	}
	/** @internal */
	build(table) {
		return new SQLiteBigInt(table, this.config);
	}
};
var SQLiteBigInt = class extends SQLiteColumn {
	static [entityKind] = "SQLiteBigInt";
	getSQLType() {
		return "blob";
	}
	mapFromDriverValue(value) {
		if (typeof Buffer !== "undefined" && Buffer.from) {
			const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
			return BigInt(buf.toString("utf8"));
		}
		return BigInt(textDecoder.decode(value));
	}
	mapToDriverValue(value) {
		return Buffer.from(value.toString());
	}
};
var SQLiteBlobJsonBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteBlobJsonBuilder";
	constructor(name) {
		super(name, "json", "SQLiteBlobJson");
	}
	/** @internal */
	build(table) {
		return new SQLiteBlobJson(table, this.config);
	}
};
var SQLiteBlobJson = class extends SQLiteColumn {
	static [entityKind] = "SQLiteBlobJson";
	getSQLType() {
		return "blob";
	}
	mapFromDriverValue(value) {
		if (typeof Buffer !== "undefined" && Buffer.from) {
			const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
			return JSON.parse(buf.toString("utf8"));
		}
		return JSON.parse(textDecoder.decode(value));
	}
	mapToDriverValue(value) {
		return Buffer.from(JSON.stringify(value));
	}
};
var SQLiteBlobBufferBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteBlobBufferBuilder";
	constructor(name) {
		super(name, "buffer", "SQLiteBlobBuffer");
	}
	/** @internal */
	build(table) {
		return new SQLiteBlobBuffer(table, this.config);
	}
};
var SQLiteBlobBuffer = class extends SQLiteColumn {
	static [entityKind] = "SQLiteBlobBuffer";
	mapFromDriverValue(value) {
		if (Buffer.isBuffer(value)) return value;
		return Buffer.from(value);
	}
	getSQLType() {
		return "blob";
	}
};
function blob(a, b) {
	const { name, config } = getColumnNameAndConfig(a, b);
	if (config?.mode === "json") return new SQLiteBlobJsonBuilder(name);
	if (config?.mode === "bigint") return new SQLiteBigIntBuilder(name);
	return new SQLiteBlobBufferBuilder(name);
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/columns/custom.js
var SQLiteCustomColumnBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteCustomColumnBuilder";
	constructor(name, fieldConfig, customTypeParams) {
		super(name, "custom", "SQLiteCustomColumn");
		this.config.fieldConfig = fieldConfig;
		this.config.customTypeParams = customTypeParams;
	}
	/** @internal */
	build(table) {
		return new SQLiteCustomColumn(table, this.config);
	}
};
var SQLiteCustomColumn = class extends SQLiteColumn {
	static [entityKind] = "SQLiteCustomColumn";
	sqlName;
	mapTo;
	mapFrom;
	constructor(table, config) {
		super(table, config);
		this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
		this.mapTo = config.customTypeParams.toDriver;
		this.mapFrom = config.customTypeParams.fromDriver;
	}
	getSQLType() {
		return this.sqlName;
	}
	mapFromDriverValue(value) {
		return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
	}
	mapToDriverValue(value) {
		return typeof this.mapTo === "function" ? this.mapTo(value) : value;
	}
};
function customType(customTypeParams) {
	return (a, b) => {
		const { name, config } = getColumnNameAndConfig(a, b);
		return new SQLiteCustomColumnBuilder(name, config, customTypeParams);
	};
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/columns/integer.js
var SQLiteBaseIntegerBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteBaseIntegerBuilder";
	constructor(name, dataType, columnType) {
		super(name, dataType, columnType);
		this.config.autoIncrement = false;
	}
	primaryKey(config) {
		if (config?.autoIncrement) this.config.autoIncrement = true;
		this.config.hasDefault = true;
		return super.primaryKey();
	}
};
var SQLiteBaseInteger = class extends SQLiteColumn {
	static [entityKind] = "SQLiteBaseInteger";
	autoIncrement = this.config.autoIncrement;
	getSQLType() {
		return "integer";
	}
};
var SQLiteIntegerBuilder = class extends SQLiteBaseIntegerBuilder {
	static [entityKind] = "SQLiteIntegerBuilder";
	constructor(name) {
		super(name, "number", "SQLiteInteger");
	}
	build(table) {
		return new SQLiteInteger(table, this.config);
	}
};
var SQLiteInteger = class extends SQLiteBaseInteger {
	static [entityKind] = "SQLiteInteger";
};
var SQLiteTimestampBuilder = class extends SQLiteBaseIntegerBuilder {
	static [entityKind] = "SQLiteTimestampBuilder";
	constructor(name, mode) {
		super(name, "date", "SQLiteTimestamp");
		this.config.mode = mode;
	}
	/**
	* @deprecated Use `default()` with your own expression instead.
	*
	* Adds `DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))` to the column, which is the current epoch timestamp in milliseconds.
	*/
	defaultNow() {
		return this.default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`);
	}
	build(table) {
		return new SQLiteTimestamp(table, this.config);
	}
};
var SQLiteTimestamp = class extends SQLiteBaseInteger {
	static [entityKind] = "SQLiteTimestamp";
	mode = this.config.mode;
	mapFromDriverValue(value) {
		if (this.config.mode === "timestamp") return /* @__PURE__ */ new Date(value * 1e3);
		return new Date(value);
	}
	mapToDriverValue(value) {
		const unix = value.getTime();
		if (this.config.mode === "timestamp") return Math.floor(unix / 1e3);
		return unix;
	}
};
var SQLiteBooleanBuilder = class extends SQLiteBaseIntegerBuilder {
	static [entityKind] = "SQLiteBooleanBuilder";
	constructor(name, mode) {
		super(name, "boolean", "SQLiteBoolean");
		this.config.mode = mode;
	}
	build(table) {
		return new SQLiteBoolean(table, this.config);
	}
};
var SQLiteBoolean = class extends SQLiteBaseInteger {
	static [entityKind] = "SQLiteBoolean";
	mode = this.config.mode;
	mapFromDriverValue(value) {
		return Number(value) === 1;
	}
	mapToDriverValue(value) {
		return value ? 1 : 0;
	}
};
function integer(a, b) {
	const { name, config } = getColumnNameAndConfig(a, b);
	if (config?.mode === "timestamp" || config?.mode === "timestamp_ms") return new SQLiteTimestampBuilder(name, config.mode);
	if (config?.mode === "boolean") return new SQLiteBooleanBuilder(name, config.mode);
	return new SQLiteIntegerBuilder(name);
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/columns/numeric.js
var SQLiteNumericBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteNumericBuilder";
	constructor(name) {
		super(name, "string", "SQLiteNumeric");
	}
	/** @internal */
	build(table) {
		return new SQLiteNumeric(table, this.config);
	}
};
var SQLiteNumeric = class extends SQLiteColumn {
	static [entityKind] = "SQLiteNumeric";
	mapFromDriverValue(value) {
		if (typeof value === "string") return value;
		return String(value);
	}
	getSQLType() {
		return "numeric";
	}
};
var SQLiteNumericNumberBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteNumericNumberBuilder";
	constructor(name) {
		super(name, "number", "SQLiteNumericNumber");
	}
	/** @internal */
	build(table) {
		return new SQLiteNumericNumber(table, this.config);
	}
};
var SQLiteNumericNumber = class extends SQLiteColumn {
	static [entityKind] = "SQLiteNumericNumber";
	mapFromDriverValue(value) {
		if (typeof value === "number") return value;
		return Number(value);
	}
	mapToDriverValue = String;
	getSQLType() {
		return "numeric";
	}
};
var SQLiteNumericBigIntBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteNumericBigIntBuilder";
	constructor(name) {
		super(name, "bigint", "SQLiteNumericBigInt");
	}
	/** @internal */
	build(table) {
		return new SQLiteNumericBigInt(table, this.config);
	}
};
var SQLiteNumericBigInt = class extends SQLiteColumn {
	static [entityKind] = "SQLiteNumericBigInt";
	mapFromDriverValue = BigInt;
	mapToDriverValue = String;
	getSQLType() {
		return "numeric";
	}
};
function numeric(a, b) {
	const { name, config } = getColumnNameAndConfig(a, b);
	const mode = config?.mode;
	return mode === "number" ? new SQLiteNumericNumberBuilder(name) : mode === "bigint" ? new SQLiteNumericBigIntBuilder(name) : new SQLiteNumericBuilder(name);
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/columns/real.js
var SQLiteRealBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteRealBuilder";
	constructor(name) {
		super(name, "number", "SQLiteReal");
	}
	/** @internal */
	build(table) {
		return new SQLiteReal(table, this.config);
	}
};
var SQLiteReal = class extends SQLiteColumn {
	static [entityKind] = "SQLiteReal";
	getSQLType() {
		return "real";
	}
};
function real(name) {
	return new SQLiteRealBuilder(name ?? "");
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/columns/text.js
var SQLiteTextBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteTextBuilder";
	constructor(name, config) {
		super(name, "string", "SQLiteText");
		this.config.enumValues = config.enum;
		this.config.length = config.length;
	}
	/** @internal */
	build(table) {
		return new SQLiteText(table, this.config);
	}
};
var SQLiteText = class extends SQLiteColumn {
	static [entityKind] = "SQLiteText";
	enumValues = this.config.enumValues;
	length = this.config.length;
	constructor(table, config) {
		super(table, config);
	}
	getSQLType() {
		return `text${this.config.length ? `(${this.config.length})` : ""}`;
	}
};
var SQLiteTextJsonBuilder = class extends SQLiteColumnBuilder {
	static [entityKind] = "SQLiteTextJsonBuilder";
	constructor(name) {
		super(name, "json", "SQLiteTextJson");
	}
	/** @internal */
	build(table) {
		return new SQLiteTextJson(table, this.config);
	}
};
var SQLiteTextJson = class extends SQLiteColumn {
	static [entityKind] = "SQLiteTextJson";
	getSQLType() {
		return "text";
	}
	mapFromDriverValue(value) {
		return JSON.parse(value);
	}
	mapToDriverValue(value) {
		return JSON.stringify(value);
	}
};
function text(a, b = {}) {
	const { name, config } = getColumnNameAndConfig(a, b);
	if (config.mode === "json") return new SQLiteTextJsonBuilder(name);
	return new SQLiteTextBuilder(name, config);
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/columns/all.js
function getSQLiteColumnBuilders() {
	return {
		blob,
		customType,
		integer,
		numeric,
		real,
		text
	};
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/table.js
var InlineForeignKeys = Symbol.for("drizzle:SQLiteInlineForeignKeys");
var SQLiteTable = class extends Table {
	static [entityKind] = "SQLiteTable";
	/** @internal */
	static Symbol = Object.assign({}, Table.Symbol, { InlineForeignKeys });
	/** @internal */
	[Table.Symbol.Columns];
	/** @internal */
	[InlineForeignKeys] = [];
	/** @internal */
	[Table.Symbol.ExtraConfigBuilder] = void 0;
};
function sqliteTableBase(name, columns, extraConfig, schema, baseName = name) {
	const rawTable = new SQLiteTable(name, schema, baseName);
	const parsedColumns = typeof columns === "function" ? columns(getSQLiteColumnBuilders()) : columns;
	const builtColumns = Object.fromEntries(Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
		const colBuilder = colBuilderBase;
		colBuilder.setName(name2);
		const column = colBuilder.build(rawTable);
		rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
		return [name2, column];
	}));
	const table = Object.assign(rawTable, builtColumns);
	table[Table.Symbol.Columns] = builtColumns;
	table[Table.Symbol.ExtraConfigColumns] = builtColumns;
	if (extraConfig) table[SQLiteTable.Symbol.ExtraConfigBuilder] = extraConfig;
	return table;
}
var sqliteTable = (name, columns, extraConfig) => {
	return sqliteTableBase(name, columns, extraConfig);
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/utils.js
function extractUsedTable(table) {
	if (is(table, SQLiteTable)) return [`${table[Table.Symbol.BaseName]}`];
	if (is(table, Subquery)) return table._.usedTables ?? [];
	if (is(table, SQL)) return table.usedTables ?? [];
	return [];
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/query-builders/delete.js
var SQLiteDeleteBase = class extends QueryPromise {
	constructor(table, session, dialect, withList) {
		super();
		this.table = table;
		this.session = session;
		this.dialect = dialect;
		this.config = {
			table,
			withList
		};
	}
	static [entityKind] = "SQLiteDelete";
	/** @internal */
	config;
	/**
	* Adds a `where` clause to the query.
	*
	* Calling this method will delete only those rows that fulfill a specified condition.
	*
	* See docs: {@link https://orm.drizzle.team/docs/delete}
	*
	* @param where the `where` clause.
	*
	* @example
	* You can use conditional operators and `sql function` to filter the rows to be deleted.
	*
	* ```ts
	* // Delete all cars with green color
	* db.delete(cars).where(eq(cars.color, 'green'));
	* // or
	* db.delete(cars).where(sql`${cars.color} = 'green'`)
	* ```
	*
	* You can logically combine conditional operators with `and()` and `or()` operators:
	*
	* ```ts
	* // Delete all BMW cars with a green color
	* db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
	*
	* // Delete all cars with the green or blue color
	* db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
	* ```
	*/
	where(where) {
		this.config.where = where;
		return this;
	}
	orderBy(...columns) {
		if (typeof columns[0] === "function") {
			const orderBy = columns[0](new Proxy(this.config.table[Table.Symbol.Columns], new SelectionProxyHandler({
				sqlAliasedBehavior: "alias",
				sqlBehavior: "sql"
			})));
			const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
			this.config.orderBy = orderByArray;
		} else {
			const orderByArray = columns;
			this.config.orderBy = orderByArray;
		}
		return this;
	}
	limit(limit) {
		this.config.limit = limit;
		return this;
	}
	returning(fields = this.table[SQLiteTable.Symbol.Columns]) {
		this.config.returning = orderSelectedFields(fields);
		return this;
	}
	/** @internal */
	getSQL() {
		return this.dialect.buildDeleteQuery(this.config);
	}
	toSQL() {
		const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
		return rest;
	}
	/** @internal */
	_prepare(isOneTimeQuery = true) {
		return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](this.dialect.sqlToQuery(this.getSQL()), this.config.returning, this.config.returning ? "all" : "run", true, void 0, {
			type: "delete",
			tables: extractUsedTable(this.config.table)
		});
	}
	prepare() {
		return this._prepare(false);
	}
	run = (placeholderValues) => {
		return this._prepare().run(placeholderValues);
	};
	all = (placeholderValues) => {
		return this._prepare().all(placeholderValues);
	};
	get = (placeholderValues) => {
		return this._prepare().get(placeholderValues);
	};
	values = (placeholderValues) => {
		return this._prepare().values(placeholderValues);
	};
	async execute(placeholderValues) {
		return this._prepare().execute(placeholderValues);
	}
	$dynamic() {
		return this;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/casing.js
function toSnakeCase(input) {
	return (input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? []).map((word) => word.toLowerCase()).join("_");
}
function toCamelCase$1(input) {
	return (input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? []).reduce((acc, word, i) => {
		return acc + (i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`);
	}, "");
}
function noopCase(input) {
	return input;
}
var CasingCache = class {
	static [entityKind] = "CasingCache";
	/** @internal */
	cache = {};
	cachedTables = {};
	convert;
	constructor(casing) {
		this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase$1 : noopCase;
	}
	getColumnCasing(column) {
		if (!column.keyAsName) return column.name;
		const key = `${column.table[Table.Symbol.Schema] ?? "public"}.${column.table[Table.Symbol.OriginalName]}.${column.name}`;
		if (!this.cache[key]) this.cacheTable(column.table);
		return this.cache[key];
	}
	cacheTable(table) {
		const tableKey = `${table[Table.Symbol.Schema] ?? "public"}.${table[Table.Symbol.OriginalName]}`;
		if (!this.cachedTables[tableKey]) {
			for (const column of Object.values(table[Table.Symbol.Columns])) {
				const columnKey = `${tableKey}.${column.name}`;
				this.cache[columnKey] = this.convert(column.name);
			}
			this.cachedTables[tableKey] = true;
		}
	}
	clearCache() {
		this.cache = {};
		this.cachedTables = {};
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/view-base.js
var SQLiteViewBase = class extends View {
	static [entityKind] = "SQLiteViewBase";
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/dialect.js
var SQLiteDialect = class {
	static [entityKind] = "SQLiteDialect";
	/** @internal */
	casing;
	constructor(config) {
		this.casing = new CasingCache(config?.casing);
	}
	escapeName(name) {
		return `"${name.replace(/"/g, "\"\"")}"`;
	}
	escapeParam(_num) {
		return "?";
	}
	escapeString(str) {
		return `'${str.replace(/'/g, "''")}'`;
	}
	buildWithCTE(queries) {
		if (!queries?.length) return void 0;
		const withSqlChunks = [sql`with `];
		for (const [i, w] of queries.entries()) {
			withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
			if (i < queries.length - 1) withSqlChunks.push(sql`, `);
		}
		withSqlChunks.push(sql` `);
		return sql.join(withSqlChunks);
	}
	buildDeleteQuery({ table, where, returning, withList, limit, orderBy }) {
		const withSql = this.buildWithCTE(withList);
		const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
		return sql`${withSql}delete from ${table}${where ? sql` where ${where}` : void 0}${returningSql}${this.buildOrderBy(orderBy)}${this.buildLimit(limit)}`;
	}
	buildUpdateSet(table, set) {
		const tableColumns = table[Table.Symbol.Columns];
		const columnNames = Object.keys(tableColumns).filter((colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0);
		const setSize = columnNames.length;
		return sql.join(columnNames.flatMap((colName, i) => {
			const col = tableColumns[colName];
			const onUpdateFnResult = col.onUpdateFn?.();
			const value = set[colName] ?? (is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col));
			const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
			if (i < setSize - 1) return [res, sql.raw(", ")];
			return [res];
		}));
	}
	buildUpdateQuery({ table, set, where, returning, withList, joins, from, limit, orderBy }) {
		const withSql = this.buildWithCTE(withList);
		const setSql = this.buildUpdateSet(table, set);
		const fromSql = from && sql.join([sql.raw(" from "), this.buildFromTable(from)]);
		const joinsSql = this.buildJoins(joins);
		const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
		return sql`${withSql}update ${table} set ${setSql}${fromSql}${joinsSql}${where ? sql` where ${where}` : void 0}${returningSql}${this.buildOrderBy(orderBy)}${this.buildLimit(limit)}`;
	}
	/**
	* Builds selection SQL with provided fields/expressions
	*
	* Examples:
	*
	* `select <selection> from`
	*
	* `insert ... returning <selection>`
	*
	* If `isSingleTable` is true, then columns won't be prefixed with table name
	*/
	buildSelection(fields, { isSingleTable = false } = {}) {
		const columnsLen = fields.length;
		const chunks = fields.flatMap(({ field }, i) => {
			const chunk = [];
			if (is(field, SQL.Aliased) && field.isSelectionField) chunk.push(sql.identifier(field.fieldAlias));
			else if (is(field, SQL.Aliased) || is(field, SQL)) {
				const query = is(field, SQL.Aliased) ? field.sql : field;
				if (isSingleTable) chunk.push(new SQL(query.queryChunks.map((c) => {
					if (is(c, Column)) return sql.identifier(this.casing.getColumnCasing(c));
					return c;
				})));
				else chunk.push(query);
				if (is(field, SQL.Aliased)) chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
			} else if (is(field, Column)) {
				const tableName = field.table[Table.Symbol.Name];
				if (field.columnType === "SQLiteNumericBigInt") if (isSingleTable) chunk.push(sql`cast(${sql.identifier(this.casing.getColumnCasing(field))} as text)`);
				else chunk.push(sql`cast(${sql.identifier(tableName)}.${sql.identifier(this.casing.getColumnCasing(field))} as text)`);
				else if (isSingleTable) chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
				else chunk.push(sql`${sql.identifier(tableName)}.${sql.identifier(this.casing.getColumnCasing(field))}`);
			} else if (is(field, Subquery)) {
				const entries = Object.entries(field._.selectedFields);
				if (entries.length === 1) {
					const entry = entries[0][1];
					const fieldDecoder = is(entry, SQL) ? entry.decoder : is(entry, Column) ? { mapFromDriverValue: (v) => entry.mapFromDriverValue(v) } : entry.sql.decoder;
					if (fieldDecoder) field._.sql.decoder = fieldDecoder;
				}
				chunk.push(field);
			}
			if (i < columnsLen - 1) chunk.push(sql`, `);
			return chunk;
		});
		return sql.join(chunks);
	}
	buildJoins(joins) {
		if (!joins || joins.length === 0) return;
		const joinsArray = [];
		if (joins) for (const [index, joinMeta] of joins.entries()) {
			if (index === 0) joinsArray.push(sql` `);
			const table = joinMeta.table;
			const onSql = joinMeta.on ? sql` on ${joinMeta.on}` : void 0;
			if (is(table, SQLiteTable)) {
				const tableName = table[SQLiteTable.Symbol.Name];
				const tableSchema = table[SQLiteTable.Symbol.Schema];
				const origTableName = table[SQLiteTable.Symbol.OriginalName];
				const alias = tableName === origTableName ? void 0 : joinMeta.alias;
				joinsArray.push(sql`${sql.raw(joinMeta.joinType)} join ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`);
			} else joinsArray.push(sql`${sql.raw(joinMeta.joinType)} join ${table}${onSql}`);
			if (index < joins.length - 1) joinsArray.push(sql` `);
		}
		return sql.join(joinsArray);
	}
	buildLimit(limit) {
		return typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
	}
	buildOrderBy(orderBy) {
		const orderByList = [];
		if (orderBy) for (const [index, orderByValue] of orderBy.entries()) {
			orderByList.push(orderByValue);
			if (index < orderBy.length - 1) orderByList.push(sql`, `);
		}
		return orderByList.length > 0 ? sql` order by ${sql.join(orderByList)}` : void 0;
	}
	buildFromTable(table) {
		if (is(table, Table) && table[Table.Symbol.IsAlias]) return sql`${sql`${sql.identifier(table[Table.Symbol.Schema] ?? "")}.`.if(table[Table.Symbol.Schema])}${sql.identifier(table[Table.Symbol.OriginalName])} ${sql.identifier(table[Table.Symbol.Name])}`;
		return table;
	}
	buildSelectQuery({ withList, fields, fieldsFlat, where, having, table, joins, orderBy, groupBy, limit, offset, distinct, setOperators }) {
		const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
		for (const f of fieldsList) if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, SQLiteViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])))(f.field.table)) {
			const tableName = getTableName(f.field.table);
			throw new Error(`Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`);
		}
		const isSingleTable = !joins || joins.length === 0;
		const withSql = this.buildWithCTE(withList);
		const distinctSql = distinct ? sql` distinct` : void 0;
		const selection = this.buildSelection(fieldsList, { isSingleTable });
		const tableSql = this.buildFromTable(table);
		const joinsSql = this.buildJoins(joins);
		const whereSql = where ? sql` where ${where}` : void 0;
		const havingSql = having ? sql` having ${having}` : void 0;
		const groupByList = [];
		if (groupBy) for (const [index, groupByValue] of groupBy.entries()) {
			groupByList.push(groupByValue);
			if (index < groupBy.length - 1) groupByList.push(sql`, `);
		}
		const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupByList.length > 0 ? sql` group by ${sql.join(groupByList)}` : void 0}${havingSql}${this.buildOrderBy(orderBy)}${this.buildLimit(limit)}${offset ? sql` offset ${offset}` : void 0}`;
		if (setOperators.length > 0) return this.buildSetOperations(finalQuery, setOperators);
		return finalQuery;
	}
	buildSetOperations(leftSelect, setOperators) {
		const [setOperator, ...rest] = setOperators;
		if (!setOperator) throw new Error("Cannot pass undefined values to any set operator");
		if (rest.length === 0) return this.buildSetOperationQuery({
			leftSelect,
			setOperator
		});
		return this.buildSetOperations(this.buildSetOperationQuery({
			leftSelect,
			setOperator
		}), rest);
	}
	buildSetOperationQuery({ leftSelect, setOperator: { type, isAll, rightSelect, limit, orderBy, offset } }) {
		const leftChunk = sql`${leftSelect.getSQL()} `;
		const rightChunk = sql`${rightSelect.getSQL()}`;
		let orderBySql;
		if (orderBy && orderBy.length > 0) {
			const orderByValues = [];
			for (const singleOrderBy of orderBy) if (is(singleOrderBy, SQLiteColumn)) orderByValues.push(sql.identifier(singleOrderBy.name));
			else if (is(singleOrderBy, SQL)) {
				for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
					const chunk = singleOrderBy.queryChunks[i];
					if (is(chunk, SQLiteColumn)) singleOrderBy.queryChunks[i] = sql.identifier(this.casing.getColumnCasing(chunk));
				}
				orderByValues.push(sql`${singleOrderBy}`);
			} else orderByValues.push(sql`${singleOrderBy}`);
			orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)}`;
		}
		const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
		const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
		const offsetSql = offset ? sql` offset ${offset}` : void 0;
		return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
	}
	buildInsertQuery({ table, values: valuesOrSelect, onConflict, returning, withList, select }) {
		const valuesSqlList = [];
		const columns = table[Table.Symbol.Columns];
		const colEntries = Object.entries(columns).filter(([_, col]) => !col.shouldDisableInsert());
		const insertOrder = colEntries.map(([, column]) => sql.identifier(this.casing.getColumnCasing(column)));
		if (select) {
			const select2 = valuesOrSelect;
			if (is(select2, SQL)) valuesSqlList.push(select2);
			else valuesSqlList.push(select2.getSQL());
		} else {
			const values = valuesOrSelect;
			valuesSqlList.push(sql.raw("values "));
			for (const [valueIndex, value] of values.entries()) {
				const valueList = [];
				for (const [fieldName, col] of colEntries) {
					const colValue = value[fieldName];
					if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
						let defaultValue;
						if (col.default !== null && col.default !== void 0) defaultValue = is(col.default, SQL) ? col.default : sql.param(col.default, col);
						else if (col.defaultFn !== void 0) {
							const defaultFnResult = col.defaultFn();
							defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
						} else if (!col.default && col.onUpdateFn !== void 0) {
							const onUpdateFnResult = col.onUpdateFn();
							defaultValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
						} else defaultValue = sql`null`;
						valueList.push(defaultValue);
					} else valueList.push(colValue);
				}
				valuesSqlList.push(valueList);
				if (valueIndex < values.length - 1) valuesSqlList.push(sql`, `);
			}
		}
		const withSql = this.buildWithCTE(withList);
		const valuesSql = sql.join(valuesSqlList);
		const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
		return sql`${withSql}insert into ${table} ${insertOrder} ${valuesSql}${onConflict?.length ? sql.join(onConflict) : void 0}${returningSql}`;
	}
	sqlToQuery(sql2, invokeSource) {
		return sql2.toQuery({
			casing: this.casing,
			escapeName: this.escapeName,
			escapeParam: this.escapeParam,
			escapeString: this.escapeString,
			invokeSource
		});
	}
	buildRelationalQuery({ fullSchema, schema, tableNamesMap, table, tableConfig, queryConfig: config, tableAlias, nestedQueryRelation, joinOn }) {
		let selection = [];
		let limit, offset, orderBy = [], where;
		const joins = [];
		if (config === true) selection = Object.entries(tableConfig.columns).map(([key, value]) => ({
			dbKey: value.name,
			tsKey: key,
			field: aliasedTableColumn(value, tableAlias),
			relationTableTsKey: void 0,
			isJson: false,
			selection: []
		}));
		else {
			const aliasedColumns = Object.fromEntries(Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)]));
			if (config.where) {
				const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
				where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
			}
			const fieldsSelection = [];
			let selectedColumns = [];
			if (config.columns) {
				let isIncludeMode = false;
				for (const [field, value] of Object.entries(config.columns)) {
					if (value === void 0) continue;
					if (field in tableConfig.columns) {
						if (!isIncludeMode && value === true) isIncludeMode = true;
						selectedColumns.push(field);
					}
				}
				if (selectedColumns.length > 0) selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
			} else selectedColumns = Object.keys(tableConfig.columns);
			for (const field of selectedColumns) {
				const column = tableConfig.columns[field];
				fieldsSelection.push({
					tsKey: field,
					value: column
				});
			}
			let selectedRelations = [];
			if (config.with) selectedRelations = Object.entries(config.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig]) => ({
				tsKey,
				queryConfig,
				relation: tableConfig.relations[tsKey]
			}));
			let extras;
			if (config.extras) {
				extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
				for (const [tsKey, value] of Object.entries(extras)) fieldsSelection.push({
					tsKey,
					value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
				});
			}
			for (const { tsKey, value } of fieldsSelection) selection.push({
				dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
				tsKey,
				field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
				relationTableTsKey: void 0,
				isJson: false,
				selection: []
			});
			let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
			if (!Array.isArray(orderByOrig)) orderByOrig = [orderByOrig];
			orderBy = orderByOrig.map((orderByValue) => {
				if (is(orderByValue, Column)) return aliasedTableColumn(orderByValue, tableAlias);
				return mapColumnsInSQLToAlias(orderByValue, tableAlias);
			});
			limit = config.limit;
			offset = config.offset;
			for (const { tsKey: selectedRelationTsKey, queryConfig: selectedRelationConfigValue, relation } of selectedRelations) {
				const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
				const relationTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
				const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
				const joinOn2 = and(...normalizedRelation.fields.map((field2, i) => eq(aliasedTableColumn(normalizedRelation.references[i], relationTableAlias), aliasedTableColumn(field2, tableAlias))));
				const builtRelation = this.buildRelationalQuery({
					fullSchema,
					schema,
					tableNamesMap,
					table: fullSchema[relationTableTsName],
					tableConfig: schema[relationTableTsName],
					queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : {
						...selectedRelationConfigValue,
						limit: 1
					} : selectedRelationConfigValue,
					tableAlias: relationTableAlias,
					joinOn: joinOn2,
					nestedQueryRelation: relation
				});
				const field = sql`(${builtRelation.sql})`.as(selectedRelationTsKey);
				selection.push({
					dbKey: selectedRelationTsKey,
					tsKey: selectedRelationTsKey,
					field,
					relationTableTsKey: relationTableTsName,
					isJson: true,
					selection: builtRelation.selection
				});
			}
		}
		if (selection.length === 0) throw new DrizzleError({ message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.` });
		let result;
		where = and(joinOn, where);
		if (nestedQueryRelation) {
			let field = sql`json_array(${sql.join(selection.map(({ field: field2 }) => is(field2, SQLiteColumn) ? sql.identifier(this.casing.getColumnCasing(field2)) : is(field2, SQL.Aliased) ? field2.sql : field2), sql`, `)})`;
			if (is(nestedQueryRelation, Many)) field = sql`coalesce(json_group_array(${field}), json_array())`;
			const nestedSelection = [{
				dbKey: "data",
				tsKey: "data",
				field: field.as("data"),
				isJson: true,
				relationTableTsKey: tableConfig.tsName,
				selection
			}];
			if (limit !== void 0 || offset !== void 0 || orderBy.length > 0) {
				result = this.buildSelectQuery({
					table: aliasedTable(table, tableAlias),
					fields: {},
					fieldsFlat: [{
						path: [],
						field: sql.raw("*")
					}],
					where,
					limit,
					offset,
					orderBy,
					setOperators: []
				});
				where = void 0;
				limit = void 0;
				offset = void 0;
				orderBy = void 0;
			} else result = aliasedTable(table, tableAlias);
			result = this.buildSelectQuery({
				table: is(result, SQLiteTable) ? result : new Subquery(result, {}, tableAlias),
				fields: {},
				fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
					path: [],
					field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
				})),
				joins,
				where,
				limit,
				offset,
				orderBy,
				setOperators: []
			});
		} else result = this.buildSelectQuery({
			table: aliasedTable(table, tableAlias),
			fields: {},
			fieldsFlat: selection.map(({ field }) => ({
				path: [],
				field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
			})),
			joins,
			where,
			limit,
			offset,
			orderBy,
			setOperators: []
		});
		return {
			tableTsKey: tableConfig.tsName,
			sql: result,
			selection
		};
	}
};
var SQLiteSyncDialect = class extends SQLiteDialect {
	static [entityKind] = "SQLiteSyncDialect";
	migrate(migrations, session, config) {
		const migrationsTable = config === void 0 ? "__drizzle_migrations" : typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
		const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
		session.run(migrationTableCreate);
		const lastDbMigration = session.values(sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`)[0] ?? void 0;
		session.run(sql`BEGIN`);
		try {
			for (const migration of migrations) if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
				for (const stmt of migration.sql) session.run(sql.raw(stmt));
				session.run(sql`INSERT INTO ${sql.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`);
			}
			session.run(sql`COMMIT`);
		} catch (e) {
			session.run(sql`ROLLBACK`);
			throw e;
		}
	}
};
var SQLiteAsyncDialect = class extends SQLiteDialect {
	static [entityKind] = "SQLiteAsyncDialect";
	async migrate(migrations, session, config) {
		const migrationsTable = config === void 0 ? "__drizzle_migrations" : typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
		const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
		await session.run(migrationTableCreate);
		const lastDbMigration = (await session.values(sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`))[0] ?? void 0;
		await session.transaction(async (tx) => {
			for (const migration of migrations) if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
				for (const stmt of migration.sql) await tx.run(sql.raw(stmt));
				await tx.run(sql`INSERT INTO ${sql.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`);
			}
		});
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/query-builders/query-builder.js
var TypedQueryBuilder = class {
	static [entityKind] = "TypedQueryBuilder";
	/** @internal */
	getSelectedFields() {
		return this._.selectedFields;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/query-builders/select.js
var SQLiteSelectBuilder = class {
	static [entityKind] = "SQLiteSelectBuilder";
	fields;
	session;
	dialect;
	withList;
	distinct;
	constructor(config) {
		this.fields = config.fields;
		this.session = config.session;
		this.dialect = config.dialect;
		this.withList = config.withList;
		this.distinct = config.distinct;
	}
	from(source) {
		const isPartialSelect = !!this.fields;
		let fields;
		if (this.fields) fields = this.fields;
		else if (is(source, Subquery)) fields = Object.fromEntries(Object.keys(source._.selectedFields).map((key) => [key, source[key]]));
		else if (is(source, SQLiteViewBase)) fields = source[ViewBaseConfig].selectedFields;
		else if (is(source, SQL)) fields = {};
		else fields = getTableColumns(source);
		return new SQLiteSelectBase({
			table: source,
			fields,
			isPartialSelect,
			session: this.session,
			dialect: this.dialect,
			withList: this.withList,
			distinct: this.distinct
		});
	}
};
var SQLiteSelectQueryBuilderBase = class extends TypedQueryBuilder {
	static [entityKind] = "SQLiteSelectQueryBuilder";
	_;
	/** @internal */
	config;
	joinsNotNullableMap;
	tableName;
	isPartialSelect;
	session;
	dialect;
	cacheConfig = void 0;
	usedTables = /* @__PURE__ */ new Set();
	constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
		super();
		this.config = {
			withList,
			table,
			fields: { ...fields },
			distinct,
			setOperators: []
		};
		this.isPartialSelect = isPartialSelect;
		this.session = session;
		this.dialect = dialect;
		this._ = {
			selectedFields: fields,
			config: this.config
		};
		this.tableName = getTableLikeName(table);
		this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
		for (const item of extractUsedTable(table)) this.usedTables.add(item);
	}
	/** @internal */
	getUsedTables() {
		return [...this.usedTables];
	}
	createJoin(joinType) {
		return (table, on) => {
			const baseTableName = this.tableName;
			const tableName = getTableLikeName(table);
			for (const item of extractUsedTable(table)) this.usedTables.add(item);
			if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) throw new Error(`Alias "${tableName}" is already used in this query`);
			if (!this.isPartialSelect) {
				if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") this.config.fields = { [baseTableName]: this.config.fields };
				if (typeof tableName === "string" && !is(table, SQL)) {
					const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
					this.config.fields[tableName] = selection;
				}
			}
			if (typeof on === "function") on = on(new Proxy(this.config.fields, new SelectionProxyHandler({
				sqlAliasedBehavior: "sql",
				sqlBehavior: "sql"
			})));
			if (!this.config.joins) this.config.joins = [];
			this.config.joins.push({
				on,
				table,
				joinType,
				alias: tableName
			});
			if (typeof tableName === "string") switch (joinType) {
				case "left":
					this.joinsNotNullableMap[tableName] = false;
					break;
				case "right":
					this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false]));
					this.joinsNotNullableMap[tableName] = true;
					break;
				case "cross":
				case "inner":
					this.joinsNotNullableMap[tableName] = true;
					break;
				case "full":
					this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false]));
					this.joinsNotNullableMap[tableName] = false;
					break;
			}
			return this;
		};
	}
	/**
	* Executes a `left join` operation by adding another table to the current query.
	*
	* Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
	*
	* See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
	*
	* @param table the table to join.
	* @param on the `on` clause.
	*
	* @example
	*
	* ```ts
	* // Select all users and their pets
	* const usersWithPets: { user: User; pets: Pet | null; }[] = await db.select()
	*   .from(users)
	*   .leftJoin(pets, eq(users.id, pets.ownerId))
	*
	* // Select userId and petId
	* const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
	*   userId: users.id,
	*   petId: pets.id,
	* })
	*   .from(users)
	*   .leftJoin(pets, eq(users.id, pets.ownerId))
	* ```
	*/
	leftJoin = this.createJoin("left");
	/**
	* Executes a `right join` operation by adding another table to the current query.
	*
	* Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
	*
	* See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
	*
	* @param table the table to join.
	* @param on the `on` clause.
	*
	* @example
	*
	* ```ts
	* // Select all users and their pets
	* const usersWithPets: { user: User | null; pets: Pet; }[] = await db.select()
	*   .from(users)
	*   .rightJoin(pets, eq(users.id, pets.ownerId))
	*
	* // Select userId and petId
	* const usersIdsAndPetIds: { userId: number | null; petId: number; }[] = await db.select({
	*   userId: users.id,
	*   petId: pets.id,
	* })
	*   .from(users)
	*   .rightJoin(pets, eq(users.id, pets.ownerId))
	* ```
	*/
	rightJoin = this.createJoin("right");
	/**
	* Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
	*
	* Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
	*
	* See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
	*
	* @param table the table to join.
	* @param on the `on` clause.
	*
	* @example
	*
	* ```ts
	* // Select all users and their pets
	* const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
	*   .from(users)
	*   .innerJoin(pets, eq(users.id, pets.ownerId))
	*
	* // Select userId and petId
	* const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
	*   userId: users.id,
	*   petId: pets.id,
	* })
	*   .from(users)
	*   .innerJoin(pets, eq(users.id, pets.ownerId))
	* ```
	*/
	innerJoin = this.createJoin("inner");
	/**
	* Executes a `full join` operation by combining rows from two tables into a new table.
	*
	* Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
	*
	* See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
	*
	* @param table the table to join.
	* @param on the `on` clause.
	*
	* @example
	*
	* ```ts
	* // Select all users and their pets
	* const usersWithPets: { user: User | null; pets: Pet | null; }[] = await db.select()
	*   .from(users)
	*   .fullJoin(pets, eq(users.id, pets.ownerId))
	*
	* // Select userId and petId
	* const usersIdsAndPetIds: { userId: number | null; petId: number | null; }[] = await db.select({
	*   userId: users.id,
	*   petId: pets.id,
	* })
	*   .from(users)
	*   .fullJoin(pets, eq(users.id, pets.ownerId))
	* ```
	*/
	fullJoin = this.createJoin("full");
	/**
	* Executes a `cross join` operation by combining rows from two tables into a new table.
	*
	* Calling this method retrieves all rows from both main and joined tables, merging all rows from each table.
	*
	* See docs: {@link https://orm.drizzle.team/docs/joins#cross-join}
	*
	* @param table the table to join.
	*
	* @example
	*
	* ```ts
	* // Select all users, each user with every pet
	* const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
	*   .from(users)
	*   .crossJoin(pets)
	*
	* // Select userId and petId
	* const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
	*   userId: users.id,
	*   petId: pets.id,
	* })
	*   .from(users)
	*   .crossJoin(pets)
	* ```
	*/
	crossJoin = this.createJoin("cross");
	createSetOperator(type, isAll) {
		return (rightSelection) => {
			const rightSelect = typeof rightSelection === "function" ? rightSelection(getSQLiteSetOperators()) : rightSelection;
			if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) throw new Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
			this.config.setOperators.push({
				type,
				isAll,
				rightSelect
			});
			return this;
		};
	}
	/**
	* Adds `union` set operator to the query.
	*
	* Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
	*
	* See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
	*
	* @example
	*
	* ```ts
	* // Select all unique names from customers and users tables
	* await db.select({ name: users.name })
	*   .from(users)
	*   .union(
	*     db.select({ name: customers.name }).from(customers)
	*   );
	* // or
	* import { union } from 'drizzle-orm/sqlite-core'
	*
	* await union(
	*   db.select({ name: users.name }).from(users),
	*   db.select({ name: customers.name }).from(customers)
	* );
	* ```
	*/
	union = this.createSetOperator("union", false);
	/**
	* Adds `union all` set operator to the query.
	*
	* Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
	*
	* See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
	*
	* @example
	*
	* ```ts
	* // Select all transaction ids from both online and in-store sales
	* await db.select({ transaction: onlineSales.transactionId })
	*   .from(onlineSales)
	*   .unionAll(
	*     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
	*   );
	* // or
	* import { unionAll } from 'drizzle-orm/sqlite-core'
	*
	* await unionAll(
	*   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
	*   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
	* );
	* ```
	*/
	unionAll = this.createSetOperator("union", true);
	/**
	* Adds `intersect` set operator to the query.
	*
	* Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
	*
	* See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
	*
	* @example
	*
	* ```ts
	* // Select course names that are offered in both departments A and B
	* await db.select({ courseName: depA.courseName })
	*   .from(depA)
	*   .intersect(
	*     db.select({ courseName: depB.courseName }).from(depB)
	*   );
	* // or
	* import { intersect } from 'drizzle-orm/sqlite-core'
	*
	* await intersect(
	*   db.select({ courseName: depA.courseName }).from(depA),
	*   db.select({ courseName: depB.courseName }).from(depB)
	* );
	* ```
	*/
	intersect = this.createSetOperator("intersect", false);
	/**
	* Adds `except` set operator to the query.
	*
	* Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
	*
	* See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
	*
	* @example
	*
	* ```ts
	* // Select all courses offered in department A but not in department B
	* await db.select({ courseName: depA.courseName })
	*   .from(depA)
	*   .except(
	*     db.select({ courseName: depB.courseName }).from(depB)
	*   );
	* // or
	* import { except } from 'drizzle-orm/sqlite-core'
	*
	* await except(
	*   db.select({ courseName: depA.courseName }).from(depA),
	*   db.select({ courseName: depB.courseName }).from(depB)
	* );
	* ```
	*/
	except = this.createSetOperator("except", false);
	/** @internal */
	addSetOperators(setOperators) {
		this.config.setOperators.push(...setOperators);
		return this;
	}
	/**
	* Adds a `where` clause to the query.
	*
	* Calling this method will select only those rows that fulfill a specified condition.
	*
	* See docs: {@link https://orm.drizzle.team/docs/select#filtering}
	*
	* @param where the `where` clause.
	*
	* @example
	* You can use conditional operators and `sql function` to filter the rows to be selected.
	*
	* ```ts
	* // Select all cars with green color
	* await db.select().from(cars).where(eq(cars.color, 'green'));
	* // or
	* await db.select().from(cars).where(sql`${cars.color} = 'green'`)
	* ```
	*
	* You can logically combine conditional operators with `and()` and `or()` operators:
	*
	* ```ts
	* // Select all BMW cars with a green color
	* await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
	*
	* // Select all cars with the green or blue color
	* await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
	* ```
	*/
	where(where) {
		if (typeof where === "function") where = where(new Proxy(this.config.fields, new SelectionProxyHandler({
			sqlAliasedBehavior: "sql",
			sqlBehavior: "sql"
		})));
		this.config.where = where;
		return this;
	}
	/**
	* Adds a `having` clause to the query.
	*
	* Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
	*
	* See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
	*
	* @param having the `having` clause.
	*
	* @example
	*
	* ```ts
	* // Select all brands with more than one car
	* await db.select({
	* 	brand: cars.brand,
	* 	count: sql<number>`cast(count(${cars.id}) as int)`,
	* })
	*   .from(cars)
	*   .groupBy(cars.brand)
	*   .having(({ count }) => gt(count, 1));
	* ```
	*/
	having(having) {
		if (typeof having === "function") having = having(new Proxy(this.config.fields, new SelectionProxyHandler({
			sqlAliasedBehavior: "sql",
			sqlBehavior: "sql"
		})));
		this.config.having = having;
		return this;
	}
	groupBy(...columns) {
		if (typeof columns[0] === "function") {
			const groupBy = columns[0](new Proxy(this.config.fields, new SelectionProxyHandler({
				sqlAliasedBehavior: "alias",
				sqlBehavior: "sql"
			})));
			this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
		} else this.config.groupBy = columns;
		return this;
	}
	orderBy(...columns) {
		if (typeof columns[0] === "function") {
			const orderBy = columns[0](new Proxy(this.config.fields, new SelectionProxyHandler({
				sqlAliasedBehavior: "alias",
				sqlBehavior: "sql"
			})));
			const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
			if (this.config.setOperators.length > 0) this.config.setOperators.at(-1).orderBy = orderByArray;
			else this.config.orderBy = orderByArray;
		} else {
			const orderByArray = columns;
			if (this.config.setOperators.length > 0) this.config.setOperators.at(-1).orderBy = orderByArray;
			else this.config.orderBy = orderByArray;
		}
		return this;
	}
	/**
	* Adds a `limit` clause to the query.
	*
	* Calling this method will set the maximum number of rows that will be returned by this query.
	*
	* See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
	*
	* @param limit the `limit` clause.
	*
	* @example
	*
	* ```ts
	* // Get the first 10 people from this query.
	* await db.select().from(people).limit(10);
	* ```
	*/
	limit(limit) {
		if (this.config.setOperators.length > 0) this.config.setOperators.at(-1).limit = limit;
		else this.config.limit = limit;
		return this;
	}
	/**
	* Adds an `offset` clause to the query.
	*
	* Calling this method will skip a number of rows when returning results from this query.
	*
	* See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
	*
	* @param offset the `offset` clause.
	*
	* @example
	*
	* ```ts
	* // Get the 10th-20th people from this query.
	* await db.select().from(people).offset(10).limit(10);
	* ```
	*/
	offset(offset) {
		if (this.config.setOperators.length > 0) this.config.setOperators.at(-1).offset = offset;
		else this.config.offset = offset;
		return this;
	}
	/** @internal */
	getSQL() {
		return this.dialect.buildSelectQuery(this.config);
	}
	toSQL() {
		const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
		return rest;
	}
	as(alias) {
		const usedTables = [];
		usedTables.push(...extractUsedTable(this.config.table));
		if (this.config.joins) for (const it of this.config.joins) usedTables.push(...extractUsedTable(it.table));
		return new Proxy(new Subquery(this.getSQL(), this.config.fields, alias, false, [...new Set(usedTables)]), new SelectionProxyHandler({
			alias,
			sqlAliasedBehavior: "alias",
			sqlBehavior: "error"
		}));
	}
	/** @internal */
	getSelectedFields() {
		return new Proxy(this.config.fields, new SelectionProxyHandler({
			alias: this.tableName,
			sqlAliasedBehavior: "alias",
			sqlBehavior: "error"
		}));
	}
	$dynamic() {
		return this;
	}
};
var SQLiteSelectBase = class extends SQLiteSelectQueryBuilderBase {
	static [entityKind] = "SQLiteSelect";
	/** @internal */
	_prepare(isOneTimeQuery = true) {
		if (!this.session) throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
		const fieldsList = orderSelectedFields(this.config.fields);
		const query = this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](this.dialect.sqlToQuery(this.getSQL()), fieldsList, "all", true, void 0, {
			type: "select",
			tables: [...this.usedTables]
		}, this.cacheConfig);
		query.joinsNotNullableMap = this.joinsNotNullableMap;
		return query;
	}
	$withCache(config) {
		this.cacheConfig = config === void 0 ? {
			config: {},
			enable: true,
			autoInvalidate: true
		} : config === false ? { enable: false } : {
			enable: true,
			autoInvalidate: true,
			...config
		};
		return this;
	}
	prepare() {
		return this._prepare(false);
	}
	run = (placeholderValues) => {
		return this._prepare().run(placeholderValues);
	};
	all = (placeholderValues) => {
		return this._prepare().all(placeholderValues);
	};
	get = (placeholderValues) => {
		return this._prepare().get(placeholderValues);
	};
	values = (placeholderValues) => {
		return this._prepare().values(placeholderValues);
	};
	async execute() {
		return this.all();
	}
};
applyMixins(SQLiteSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
	return (leftSelect, rightSelect, ...restSelects) => {
		const setOperators = [rightSelect, ...restSelects].map((select) => ({
			type,
			isAll,
			rightSelect: select
		}));
		for (const setOperator of setOperators) if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) throw new Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
		return leftSelect.addSetOperators(setOperators);
	};
}
var getSQLiteSetOperators = () => ({
	union,
	unionAll,
	intersect,
	except
});
var union = createSetOperator("union", false);
var unionAll = createSetOperator("union", true);
var intersect = createSetOperator("intersect", false);
var except = createSetOperator("except", false);
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/query-builders/query-builder.js
var QueryBuilder = class {
	static [entityKind] = "SQLiteQueryBuilder";
	dialect;
	dialectConfig;
	constructor(dialect) {
		this.dialect = is(dialect, SQLiteDialect) ? dialect : void 0;
		this.dialectConfig = is(dialect, SQLiteDialect) ? void 0 : dialect;
	}
	$with = (alias, selection) => {
		const queryBuilder = this;
		const as = (qb) => {
			if (typeof qb === "function") qb = qb(queryBuilder);
			return new Proxy(new WithSubquery(qb.getSQL(), selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}), alias, true), new SelectionProxyHandler({
				alias,
				sqlAliasedBehavior: "alias",
				sqlBehavior: "error"
			}));
		};
		return { as };
	};
	with(...queries) {
		const self = this;
		function select(fields) {
			return new SQLiteSelectBuilder({
				fields: fields ?? void 0,
				session: void 0,
				dialect: self.getDialect(),
				withList: queries
			});
		}
		function selectDistinct(fields) {
			return new SQLiteSelectBuilder({
				fields: fields ?? void 0,
				session: void 0,
				dialect: self.getDialect(),
				withList: queries,
				distinct: true
			});
		}
		return {
			select,
			selectDistinct
		};
	}
	select(fields) {
		return new SQLiteSelectBuilder({
			fields: fields ?? void 0,
			session: void 0,
			dialect: this.getDialect()
		});
	}
	selectDistinct(fields) {
		return new SQLiteSelectBuilder({
			fields: fields ?? void 0,
			session: void 0,
			dialect: this.getDialect(),
			distinct: true
		});
	}
	getDialect() {
		if (!this.dialect) this.dialect = new SQLiteSyncDialect(this.dialectConfig);
		return this.dialect;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/query-builders/insert.js
var SQLiteInsertBuilder = class {
	constructor(table, session, dialect, withList) {
		this.table = table;
		this.session = session;
		this.dialect = dialect;
		this.withList = withList;
	}
	static [entityKind] = "SQLiteInsertBuilder";
	values(values) {
		values = Array.isArray(values) ? values : [values];
		if (values.length === 0) throw new Error("values() must be called with at least one value");
		const mappedValues = values.map((entry) => {
			const result = {};
			const cols = this.table[Table.Symbol.Columns];
			for (const colKey of Object.keys(entry)) {
				const colValue = entry[colKey];
				result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
			}
			return result;
		});
		return new SQLiteInsertBase(this.table, mappedValues, this.session, this.dialect, this.withList);
	}
	select(selectQuery) {
		const select = typeof selectQuery === "function" ? selectQuery(new QueryBuilder()) : selectQuery;
		if (!is(select, SQL) && !haveSameKeys(this.table[Columns], select._.selectedFields)) throw new Error("Insert select error: selected fields are not the same or are in a different order compared to the table definition");
		return new SQLiteInsertBase(this.table, select, this.session, this.dialect, this.withList, true);
	}
};
var SQLiteInsertBase = class extends QueryPromise {
	constructor(table, values, session, dialect, withList, select) {
		super();
		this.session = session;
		this.dialect = dialect;
		this.config = {
			table,
			values,
			withList,
			select
		};
	}
	static [entityKind] = "SQLiteInsert";
	/** @internal */
	config;
	returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
		this.config.returning = orderSelectedFields(fields);
		return this;
	}
	/**
	* Adds an `on conflict do nothing` clause to the query.
	*
	* Calling this method simply avoids inserting a row as its alternative action.
	*
	* See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
	*
	* @param config The `target` and `where` clauses.
	*
	* @example
	* ```ts
	* // Insert one row and cancel the insert if there's a conflict
	* await db.insert(cars)
	*   .values({ id: 1, brand: 'BMW' })
	*   .onConflictDoNothing();
	*
	* // Explicitly specify conflict target
	* await db.insert(cars)
	*   .values({ id: 1, brand: 'BMW' })
	*   .onConflictDoNothing({ target: cars.id });
	* ```
	*/
	onConflictDoNothing(config = {}) {
		if (!this.config.onConflict) this.config.onConflict = [];
		if (config.target === void 0) this.config.onConflict.push(sql` on conflict do nothing`);
		else {
			const targetSql = Array.isArray(config.target) ? sql`${config.target}` : sql`${[config.target]}`;
			const whereSql = config.where ? sql` where ${config.where}` : sql``;
			this.config.onConflict.push(sql` on conflict ${targetSql} do nothing${whereSql}`);
		}
		return this;
	}
	/**
	* Adds an `on conflict do update` clause to the query.
	*
	* Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
	*
	* See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
	*
	* @param config The `target`, `set` and `where` clauses.
	*
	* @example
	* ```ts
	* // Update the row if there's a conflict
	* await db.insert(cars)
	*   .values({ id: 1, brand: 'BMW' })
	*   .onConflictDoUpdate({
	*     target: cars.id,
	*     set: { brand: 'Porsche' }
	*   });
	*
	* // Upsert with 'where' clause
	* await db.insert(cars)
	*   .values({ id: 1, brand: 'BMW' })
	*   .onConflictDoUpdate({
	*     target: cars.id,
	*     set: { brand: 'newBMW' },
	*     where: sql`${cars.createdAt} > '2023-01-01'::date`,
	*   });
	* ```
	*/
	onConflictDoUpdate(config) {
		if (config.where && (config.targetWhere || config.setWhere)) throw new Error("You cannot use both \"where\" and \"targetWhere\"/\"setWhere\" at the same time - \"where\" is deprecated, use \"targetWhere\" or \"setWhere\" instead.");
		if (!this.config.onConflict) this.config.onConflict = [];
		const whereSql = config.where ? sql` where ${config.where}` : void 0;
		const targetWhereSql = config.targetWhere ? sql` where ${config.targetWhere}` : void 0;
		const setWhereSql = config.setWhere ? sql` where ${config.setWhere}` : void 0;
		const targetSql = Array.isArray(config.target) ? sql`${config.target}` : sql`${[config.target]}`;
		const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
		this.config.onConflict.push(sql` on conflict ${targetSql}${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`);
		return this;
	}
	/** @internal */
	getSQL() {
		return this.dialect.buildInsertQuery(this.config);
	}
	toSQL() {
		const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
		return rest;
	}
	/** @internal */
	_prepare(isOneTimeQuery = true) {
		return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](this.dialect.sqlToQuery(this.getSQL()), this.config.returning, this.config.returning ? "all" : "run", true, void 0, {
			type: "insert",
			tables: extractUsedTable(this.config.table)
		});
	}
	prepare() {
		return this._prepare(false);
	}
	run = (placeholderValues) => {
		return this._prepare().run(placeholderValues);
	};
	all = (placeholderValues) => {
		return this._prepare().all(placeholderValues);
	};
	get = (placeholderValues) => {
		return this._prepare().get(placeholderValues);
	};
	values = (placeholderValues) => {
		return this._prepare().values(placeholderValues);
	};
	async execute() {
		return this.config.returning ? this.all() : this.run();
	}
	$dynamic() {
		return this;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/query-builders/update.js
var SQLiteUpdateBuilder = class {
	constructor(table, session, dialect, withList) {
		this.table = table;
		this.session = session;
		this.dialect = dialect;
		this.withList = withList;
	}
	static [entityKind] = "SQLiteUpdateBuilder";
	set(values) {
		return new SQLiteUpdateBase(this.table, mapUpdateSet(this.table, values), this.session, this.dialect, this.withList);
	}
};
var SQLiteUpdateBase = class extends QueryPromise {
	constructor(table, set, session, dialect, withList) {
		super();
		this.session = session;
		this.dialect = dialect;
		this.config = {
			set,
			table,
			withList,
			joins: []
		};
	}
	static [entityKind] = "SQLiteUpdate";
	/** @internal */
	config;
	from(source) {
		this.config.from = source;
		return this;
	}
	createJoin(joinType) {
		return (table, on) => {
			const tableName = getTableLikeName(table);
			if (typeof tableName === "string" && this.config.joins.some((join) => join.alias === tableName)) throw new Error(`Alias "${tableName}" is already used in this query`);
			if (typeof on === "function") {
				const from = this.config.from ? is(table, SQLiteTable) ? table[Table.Symbol.Columns] : is(table, Subquery) ? table._.selectedFields : is(table, SQLiteViewBase) ? table[ViewBaseConfig].selectedFields : void 0 : void 0;
				on = on(new Proxy(this.config.table[Table.Symbol.Columns], new SelectionProxyHandler({
					sqlAliasedBehavior: "sql",
					sqlBehavior: "sql"
				})), from && new Proxy(from, new SelectionProxyHandler({
					sqlAliasedBehavior: "sql",
					sqlBehavior: "sql"
				})));
			}
			this.config.joins.push({
				on,
				table,
				joinType,
				alias: tableName
			});
			return this;
		};
	}
	leftJoin = this.createJoin("left");
	rightJoin = this.createJoin("right");
	innerJoin = this.createJoin("inner");
	fullJoin = this.createJoin("full");
	/**
	* Adds a 'where' clause to the query.
	*
	* Calling this method will update only those rows that fulfill a specified condition.
	*
	* See docs: {@link https://orm.drizzle.team/docs/update}
	*
	* @param where the 'where' clause.
	*
	* @example
	* You can use conditional operators and `sql function` to filter the rows to be updated.
	*
	* ```ts
	* // Update all cars with green color
	* db.update(cars).set({ color: 'red' })
	*   .where(eq(cars.color, 'green'));
	* // or
	* db.update(cars).set({ color: 'red' })
	*   .where(sql`${cars.color} = 'green'`)
	* ```
	*
	* You can logically combine conditional operators with `and()` and `or()` operators:
	*
	* ```ts
	* // Update all BMW cars with a green color
	* db.update(cars).set({ color: 'red' })
	*   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
	*
	* // Update all cars with the green or blue color
	* db.update(cars).set({ color: 'red' })
	*   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
	* ```
	*/
	where(where) {
		this.config.where = where;
		return this;
	}
	orderBy(...columns) {
		if (typeof columns[0] === "function") {
			const orderBy = columns[0](new Proxy(this.config.table[Table.Symbol.Columns], new SelectionProxyHandler({
				sqlAliasedBehavior: "alias",
				sqlBehavior: "sql"
			})));
			const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
			this.config.orderBy = orderByArray;
		} else {
			const orderByArray = columns;
			this.config.orderBy = orderByArray;
		}
		return this;
	}
	limit(limit) {
		this.config.limit = limit;
		return this;
	}
	returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
		this.config.returning = orderSelectedFields(fields);
		return this;
	}
	/** @internal */
	getSQL() {
		return this.dialect.buildUpdateQuery(this.config);
	}
	toSQL() {
		const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
		return rest;
	}
	/** @internal */
	_prepare(isOneTimeQuery = true) {
		return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](this.dialect.sqlToQuery(this.getSQL()), this.config.returning, this.config.returning ? "all" : "run", true, void 0, {
			type: "insert",
			tables: extractUsedTable(this.config.table)
		});
	}
	prepare() {
		return this._prepare(false);
	}
	run = (placeholderValues) => {
		return this._prepare().run(placeholderValues);
	};
	all = (placeholderValues) => {
		return this._prepare().all(placeholderValues);
	};
	get = (placeholderValues) => {
		return this._prepare().get(placeholderValues);
	};
	values = (placeholderValues) => {
		return this._prepare().values(placeholderValues);
	};
	async execute() {
		return this.config.returning ? this.all() : this.run();
	}
	$dynamic() {
		return this;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/query-builders/count.js
var SQLiteCountBuilder = class SQLiteCountBuilder extends SQL {
	constructor(params) {
		super(SQLiteCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
		this.params = params;
		this.session = params.session;
		this.sql = SQLiteCountBuilder.buildCount(params.source, params.filters);
	}
	sql;
	static [entityKind] = "SQLiteCountBuilderAsync";
	[Symbol.toStringTag] = "SQLiteCountBuilderAsync";
	session;
	static buildEmbeddedCount(source, filters) {
		return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
	}
	static buildCount(source, filters) {
		return sql`select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters}`;
	}
	then(onfulfilled, onrejected) {
		return Promise.resolve(this.session.count(this.sql)).then(onfulfilled, onrejected);
	}
	catch(onRejected) {
		return this.then(void 0, onRejected);
	}
	finally(onFinally) {
		return this.then((value) => {
			onFinally?.();
			return value;
		}, (reason) => {
			onFinally?.();
			throw reason;
		});
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/query-builders/query.js
var RelationalQueryBuilder = class {
	constructor(mode, fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session) {
		this.mode = mode;
		this.fullSchema = fullSchema;
		this.schema = schema;
		this.tableNamesMap = tableNamesMap;
		this.table = table;
		this.tableConfig = tableConfig;
		this.dialect = dialect;
		this.session = session;
	}
	static [entityKind] = "SQLiteAsyncRelationalQueryBuilder";
	findMany(config) {
		return this.mode === "sync" ? new SQLiteSyncRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? config : {}, "many") : new SQLiteRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? config : {}, "many");
	}
	findFirst(config) {
		return this.mode === "sync" ? new SQLiteSyncRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? {
			...config,
			limit: 1
		} : { limit: 1 }, "first") : new SQLiteRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? {
			...config,
			limit: 1
		} : { limit: 1 }, "first");
	}
};
var SQLiteRelationalQuery = class extends QueryPromise {
	constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
		super();
		this.fullSchema = fullSchema;
		this.schema = schema;
		this.tableNamesMap = tableNamesMap;
		this.table = table;
		this.tableConfig = tableConfig;
		this.dialect = dialect;
		this.session = session;
		this.config = config;
		this.mode = mode;
	}
	static [entityKind] = "SQLiteAsyncRelationalQuery";
	/** @internal */
	mode;
	/** @internal */
	getSQL() {
		return this.dialect.buildRelationalQuery({
			fullSchema: this.fullSchema,
			schema: this.schema,
			tableNamesMap: this.tableNamesMap,
			table: this.table,
			tableConfig: this.tableConfig,
			queryConfig: this.config,
			tableAlias: this.tableConfig.tsName
		}).sql;
	}
	/** @internal */
	_prepare(isOneTimeQuery = false) {
		const { query, builtQuery } = this._toSQL();
		return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](builtQuery, void 0, this.mode === "first" ? "get" : "all", true, (rawRows, mapColumnValue) => {
			const rows = rawRows.map((row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue));
			if (this.mode === "first") return rows[0];
			return rows;
		});
	}
	prepare() {
		return this._prepare(false);
	}
	_toSQL() {
		const query = this.dialect.buildRelationalQuery({
			fullSchema: this.fullSchema,
			schema: this.schema,
			tableNamesMap: this.tableNamesMap,
			table: this.table,
			tableConfig: this.tableConfig,
			queryConfig: this.config,
			tableAlias: this.tableConfig.tsName
		});
		return {
			query,
			builtQuery: this.dialect.sqlToQuery(query.sql)
		};
	}
	toSQL() {
		return this._toSQL().builtQuery;
	}
	/** @internal */
	executeRaw() {
		if (this.mode === "first") return this._prepare(false).get();
		return this._prepare(false).all();
	}
	async execute() {
		return this.executeRaw();
	}
};
var SQLiteSyncRelationalQuery = class extends SQLiteRelationalQuery {
	static [entityKind] = "SQLiteSyncRelationalQuery";
	sync() {
		return this.executeRaw();
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/query-builders/raw.js
var SQLiteRaw = class extends QueryPromise {
	constructor(execute, getSQL, action, dialect, mapBatchResult) {
		super();
		this.execute = execute;
		this.getSQL = getSQL;
		this.dialect = dialect;
		this.mapBatchResult = mapBatchResult;
		this.config = { action };
	}
	static [entityKind] = "SQLiteRaw";
	/** @internal */
	config;
	getQuery() {
		return {
			...this.dialect.sqlToQuery(this.getSQL()),
			method: this.config.action
		};
	}
	mapResult(result, isFromBatch) {
		return isFromBatch ? this.mapBatchResult(result) : result;
	}
	_prepare() {
		return this;
	}
	/** @internal */
	isResponseInArrayMode() {
		return false;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/db.js
var BaseSQLiteDatabase = class {
	constructor(resultKind, dialect, session, schema) {
		this.resultKind = resultKind;
		this.dialect = dialect;
		this.session = session;
		this._ = schema ? {
			schema: schema.schema,
			fullSchema: schema.fullSchema,
			tableNamesMap: schema.tableNamesMap
		} : {
			schema: void 0,
			fullSchema: {},
			tableNamesMap: {}
		};
		this.query = {};
		const query = this.query;
		if (this._.schema) for (const [tableName, columns] of Object.entries(this._.schema)) query[tableName] = new RelationalQueryBuilder(resultKind, schema.fullSchema, this._.schema, this._.tableNamesMap, schema.fullSchema[tableName], columns, dialect, session);
		this.$cache = { invalidate: async (_params) => {} };
	}
	static [entityKind] = "BaseSQLiteDatabase";
	query;
	/**
	* Creates a subquery that defines a temporary named result set as a CTE.
	*
	* It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
	*
	* See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
	*
	* @param alias The alias for the subquery.
	*
	* Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
	*
	* @example
	*
	* ```ts
	* // Create a subquery with alias 'sq' and use it in the select query
	* const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
	*
	* const result = await db.with(sq).select().from(sq);
	* ```
	*
	* To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
	*
	* ```ts
	* // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
	* const sq = db.$with('sq').as(db.select({
	*   name: sql<string>`upper(${users.name})`.as('name'),
	* })
	* .from(users));
	*
	* const result = await db.with(sq).select({ name: sq.name }).from(sq);
	* ```
	*/
	$with = (alias, selection) => {
		const self = this;
		const as = (qb) => {
			if (typeof qb === "function") qb = qb(new QueryBuilder(self.dialect));
			return new Proxy(new WithSubquery(qb.getSQL(), selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}), alias, true), new SelectionProxyHandler({
				alias,
				sqlAliasedBehavior: "alias",
				sqlBehavior: "error"
			}));
		};
		return { as };
	};
	$count(source, filters) {
		return new SQLiteCountBuilder({
			source,
			filters,
			session: this.session
		});
	}
	/**
	* Incorporates a previously defined CTE (using `$with`) into the main query.
	*
	* This method allows the main query to reference a temporary named result set.
	*
	* See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
	*
	* @param queries The CTEs to incorporate into the main query.
	*
	* @example
	*
	* ```ts
	* // Define a subquery 'sq' as a CTE using $with
	* const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
	*
	* // Incorporate the CTE 'sq' into the main query and select from it
	* const result = await db.with(sq).select().from(sq);
	* ```
	*/
	with(...queries) {
		const self = this;
		function select(fields) {
			return new SQLiteSelectBuilder({
				fields: fields ?? void 0,
				session: self.session,
				dialect: self.dialect,
				withList: queries
			});
		}
		function selectDistinct(fields) {
			return new SQLiteSelectBuilder({
				fields: fields ?? void 0,
				session: self.session,
				dialect: self.dialect,
				withList: queries,
				distinct: true
			});
		}
		function update(table) {
			return new SQLiteUpdateBuilder(table, self.session, self.dialect, queries);
		}
		function insert(into) {
			return new SQLiteInsertBuilder(into, self.session, self.dialect, queries);
		}
		function delete_(from) {
			return new SQLiteDeleteBase(from, self.session, self.dialect, queries);
		}
		return {
			select,
			selectDistinct,
			update,
			insert,
			delete: delete_
		};
	}
	select(fields) {
		return new SQLiteSelectBuilder({
			fields: fields ?? void 0,
			session: this.session,
			dialect: this.dialect
		});
	}
	selectDistinct(fields) {
		return new SQLiteSelectBuilder({
			fields: fields ?? void 0,
			session: this.session,
			dialect: this.dialect,
			distinct: true
		});
	}
	/**
	* Creates an update query.
	*
	* Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
	*
	* Use `.set()` method to specify which values to update.
	*
	* See docs: {@link https://orm.drizzle.team/docs/update}
	*
	* @param table The table to update.
	*
	* @example
	*
	* ```ts
	* // Update all rows in the 'cars' table
	* await db.update(cars).set({ color: 'red' });
	*
	* // Update rows with filters and conditions
	* await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
	*
	* // Update with returning clause
	* const updatedCar: Car[] = await db.update(cars)
	*   .set({ color: 'red' })
	*   .where(eq(cars.id, 1))
	*   .returning();
	* ```
	*/
	update(table) {
		return new SQLiteUpdateBuilder(table, this.session, this.dialect);
	}
	$cache;
	/**
	* Creates an insert query.
	*
	* Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
	*
	* See docs: {@link https://orm.drizzle.team/docs/insert}
	*
	* @param table The table to insert into.
	*
	* @example
	*
	* ```ts
	* // Insert one row
	* await db.insert(cars).values({ brand: 'BMW' });
	*
	* // Insert multiple rows
	* await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
	*
	* // Insert with returning clause
	* const insertedCar: Car[] = await db.insert(cars)
	*   .values({ brand: 'BMW' })
	*   .returning();
	* ```
	*/
	insert(into) {
		return new SQLiteInsertBuilder(into, this.session, this.dialect);
	}
	/**
	* Creates a delete query.
	*
	* Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
	*
	* See docs: {@link https://orm.drizzle.team/docs/delete}
	*
	* @param table The table to delete from.
	*
	* @example
	*
	* ```ts
	* // Delete all rows in the 'cars' table
	* await db.delete(cars);
	*
	* // Delete rows with filters and conditions
	* await db.delete(cars).where(eq(cars.color, 'green'));
	*
	* // Delete with returning clause
	* const deletedCar: Car[] = await db.delete(cars)
	*   .where(eq(cars.id, 1))
	*   .returning();
	* ```
	*/
	delete(from) {
		return new SQLiteDeleteBase(from, this.session, this.dialect);
	}
	run(query) {
		const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
		if (this.resultKind === "async") return new SQLiteRaw(async () => this.session.run(sequel), () => sequel, "run", this.dialect, this.session.extractRawRunValueFromBatchResult.bind(this.session));
		return this.session.run(sequel);
	}
	all(query) {
		const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
		if (this.resultKind === "async") return new SQLiteRaw(async () => this.session.all(sequel), () => sequel, "all", this.dialect, this.session.extractRawAllValueFromBatchResult.bind(this.session));
		return this.session.all(sequel);
	}
	get(query) {
		const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
		if (this.resultKind === "async") return new SQLiteRaw(async () => this.session.get(sequel), () => sequel, "get", this.dialect, this.session.extractRawGetValueFromBatchResult.bind(this.session));
		return this.session.get(sequel);
	}
	values(query) {
		const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
		if (this.resultKind === "async") return new SQLiteRaw(async () => this.session.values(sequel), () => sequel, "values", this.dialect, this.session.extractRawValuesValueFromBatchResult.bind(this.session));
		return this.session.values(sequel);
	}
	transaction(transaction, config) {
		return this.session.transaction(transaction, config);
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/cache/core/cache.js
var Cache = class {
	static [entityKind] = "Cache";
};
var NoopCache = class extends Cache {
	strategy() {
		return "all";
	}
	static [entityKind] = "NoopCache";
	async get(_key) {}
	async put(_hashedQuery, _response, _tables, _config) {}
	async onMutate(_params) {}
};
async function hashQuery(sql, params) {
	const dataToHash = `${sql}-${JSON.stringify(params)}`;
	const data = new TextEncoder().encode(dataToHash);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/sqlite-core/session.js
var ExecuteResultSync = class extends QueryPromise {
	constructor(resultCb) {
		super();
		this.resultCb = resultCb;
	}
	static [entityKind] = "ExecuteResultSync";
	async execute() {
		return this.resultCb();
	}
	sync() {
		return this.resultCb();
	}
};
var SQLitePreparedQuery = class {
	constructor(mode, executeMethod, query, cache, queryMetadata, cacheConfig) {
		this.mode = mode;
		this.executeMethod = executeMethod;
		this.query = query;
		this.cache = cache;
		this.queryMetadata = queryMetadata;
		this.cacheConfig = cacheConfig;
		if (cache && cache.strategy() === "all" && cacheConfig === void 0) this.cacheConfig = {
			enable: true,
			autoInvalidate: true
		};
		if (!this.cacheConfig?.enable) this.cacheConfig = void 0;
	}
	static [entityKind] = "PreparedQuery";
	/** @internal */
	joinsNotNullableMap;
	/** @internal */
	async queryWithCache(queryString, params, query) {
		if (this.cache === void 0 || is(this.cache, NoopCache) || this.queryMetadata === void 0) try {
			return await query();
		} catch (e) {
			throw new DrizzleQueryError(queryString, params, e);
		}
		if (this.cacheConfig && !this.cacheConfig.enable) try {
			return await query();
		} catch (e) {
			throw new DrizzleQueryError(queryString, params, e);
		}
		if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0) try {
			const [res] = await Promise.all([query(), this.cache.onMutate({ tables: this.queryMetadata.tables })]);
			return res;
		} catch (e) {
			throw new DrizzleQueryError(queryString, params, e);
		}
		if (!this.cacheConfig) try {
			return await query();
		} catch (e) {
			throw new DrizzleQueryError(queryString, params, e);
		}
		if (this.queryMetadata.type === "select") {
			const fromCache = await this.cache.get(this.cacheConfig.tag ?? await hashQuery(queryString, params), this.queryMetadata.tables, this.cacheConfig.tag !== void 0, this.cacheConfig.autoInvalidate);
			if (fromCache === void 0) {
				let result;
				try {
					result = await query();
				} catch (e) {
					throw new DrizzleQueryError(queryString, params, e);
				}
				await this.cache.put(this.cacheConfig.tag ?? await hashQuery(queryString, params), result, this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [], this.cacheConfig.tag !== void 0, this.cacheConfig.config);
				return result;
			}
			return fromCache;
		}
		try {
			return await query();
		} catch (e) {
			throw new DrizzleQueryError(queryString, params, e);
		}
	}
	getQuery() {
		return this.query;
	}
	mapRunResult(result, _isFromBatch) {
		return result;
	}
	mapAllResult(_result, _isFromBatch) {
		throw new Error("Not implemented");
	}
	mapGetResult(_result, _isFromBatch) {
		throw new Error("Not implemented");
	}
	execute(placeholderValues) {
		if (this.mode === "async") return this[this.executeMethod](placeholderValues);
		return new ExecuteResultSync(() => this[this.executeMethod](placeholderValues));
	}
	mapResult(response, isFromBatch) {
		switch (this.executeMethod) {
			case "run": return this.mapRunResult(response, isFromBatch);
			case "all": return this.mapAllResult(response, isFromBatch);
			case "get": return this.mapGetResult(response, isFromBatch);
		}
	}
};
var SQLiteSession = class {
	constructor(dialect) {
		this.dialect = dialect;
	}
	static [entityKind] = "SQLiteSession";
	prepareOneTimeQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
		return this.prepareQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig);
	}
	run(query) {
		const staticQuery = this.dialect.sqlToQuery(query);
		try {
			return this.prepareOneTimeQuery(staticQuery, void 0, "run", false).run();
		} catch (err) {
			throw new DrizzleError({
				cause: err,
				message: `Failed to run the query '${staticQuery.sql}'`
			});
		}
	}
	/** @internal */
	extractRawRunValueFromBatchResult(result) {
		return result;
	}
	all(query) {
		return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).all();
	}
	/** @internal */
	extractRawAllValueFromBatchResult(_result) {
		throw new Error("Not implemented");
	}
	get(query) {
		return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).get();
	}
	/** @internal */
	extractRawGetValueFromBatchResult(_result) {
		throw new Error("Not implemented");
	}
	values(query) {
		return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).values();
	}
	async count(sql) {
		return (await this.values(sql))[0][0];
	}
	/** @internal */
	extractRawValuesValueFromBatchResult(_result) {
		throw new Error("Not implemented");
	}
};
var SQLiteTransaction = class extends BaseSQLiteDatabase {
	constructor(resultType, dialect, session, schema, nestedIndex = 0) {
		super(resultType, dialect, session, schema);
		this.schema = schema;
		this.nestedIndex = nestedIndex;
	}
	static [entityKind] = "SQLiteTransaction";
	rollback() {
		throw new TransactionRollbackError();
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/d1/session.js
var SQLiteD1Session = class extends SQLiteSession {
	constructor(client, dialect, schema, options = {}) {
		super(dialect);
		this.client = client;
		this.schema = schema;
		this.options = options;
		this.logger = options.logger ?? new NoopLogger();
		this.cache = options.cache ?? new NoopCache();
	}
	static [entityKind] = "SQLiteD1Session";
	logger;
	cache;
	prepareQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
		return new D1PreparedQuery(this.client.prepare(query.sql), query, this.logger, this.cache, queryMetadata, cacheConfig, fields, executeMethod, isResponseInArrayMode, customResultMapper);
	}
	async batch(queries) {
		const preparedQueries = [];
		const builtQueries = [];
		for (const query of queries) {
			const preparedQuery = query._prepare();
			const builtQuery = preparedQuery.getQuery();
			preparedQueries.push(preparedQuery);
			if (builtQuery.params.length > 0) builtQueries.push(preparedQuery.stmt.bind(...builtQuery.params));
			else {
				const builtQuery2 = preparedQuery.getQuery();
				builtQueries.push(this.client.prepare(builtQuery2.sql).bind(...builtQuery2.params));
			}
		}
		return (await this.client.batch(builtQueries)).map((result, i) => preparedQueries[i].mapResult(result, true));
	}
	extractRawAllValueFromBatchResult(result) {
		return result.results;
	}
	extractRawGetValueFromBatchResult(result) {
		return result.results[0];
	}
	extractRawValuesValueFromBatchResult(result) {
		return d1ToRawMapping(result.results);
	}
	async transaction(transaction, config) {
		const tx = new D1Transaction("async", this.dialect, this, this.schema);
		await this.run(sql.raw(`begin${config?.behavior ? " " + config.behavior : ""}`));
		try {
			const result = await transaction(tx);
			await this.run(sql`commit`);
			return result;
		} catch (err) {
			await this.run(sql`rollback`);
			throw err;
		}
	}
};
var D1Transaction = class D1Transaction extends SQLiteTransaction {
	static [entityKind] = "D1Transaction";
	async transaction(transaction) {
		const savepointName = `sp${this.nestedIndex}`;
		const tx = new D1Transaction("async", this.dialect, this.session, this.schema, this.nestedIndex + 1);
		await this.session.run(sql.raw(`savepoint ${savepointName}`));
		try {
			const result = await transaction(tx);
			await this.session.run(sql.raw(`release savepoint ${savepointName}`));
			return result;
		} catch (err) {
			await this.session.run(sql.raw(`rollback to savepoint ${savepointName}`));
			throw err;
		}
	}
};
function d1ToRawMapping(results) {
	const rows = [];
	for (const row of results) {
		const entry = Object.keys(row).map((k) => row[k]);
		rows.push(entry);
	}
	return rows;
}
var D1PreparedQuery = class extends SQLitePreparedQuery {
	constructor(stmt, query, logger, cache, queryMetadata, cacheConfig, fields, executeMethod, _isResponseInArrayMode, customResultMapper) {
		super("async", executeMethod, query, cache, queryMetadata, cacheConfig);
		this.logger = logger;
		this._isResponseInArrayMode = _isResponseInArrayMode;
		this.customResultMapper = customResultMapper;
		this.fields = fields;
		this.stmt = stmt;
	}
	static [entityKind] = "D1PreparedQuery";
	/** @internal */
	customResultMapper;
	/** @internal */
	fields;
	/** @internal */
	stmt;
	async run(placeholderValues) {
		const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
		this.logger.logQuery(this.query.sql, params);
		return await this.queryWithCache(this.query.sql, params, async () => {
			return this.stmt.bind(...params).run();
		});
	}
	async all(placeholderValues) {
		const { fields, query, logger, stmt, customResultMapper } = this;
		if (!fields && !customResultMapper) {
			const params = fillPlaceholders(query.params, placeholderValues ?? {});
			logger.logQuery(query.sql, params);
			return await this.queryWithCache(query.sql, params, async () => {
				return stmt.bind(...params).all().then(({ results }) => this.mapAllResult(results));
			});
		}
		const rows = await this.values(placeholderValues);
		return this.mapAllResult(rows);
	}
	mapAllResult(rows, isFromBatch) {
		if (isFromBatch) rows = d1ToRawMapping(rows.results);
		if (!this.fields && !this.customResultMapper) return rows;
		if (this.customResultMapper) return this.customResultMapper(rows);
		return rows.map((row) => mapResultRow(this.fields, row, this.joinsNotNullableMap));
	}
	async get(placeholderValues) {
		const { fields, joinsNotNullableMap, query, logger, stmt, customResultMapper } = this;
		if (!fields && !customResultMapper) {
			const params = fillPlaceholders(query.params, placeholderValues ?? {});
			logger.logQuery(query.sql, params);
			return await this.queryWithCache(query.sql, params, async () => {
				return stmt.bind(...params).all().then(({ results }) => results[0]);
			});
		}
		const rows = await this.values(placeholderValues);
		if (!rows[0]) return;
		if (customResultMapper) return customResultMapper(rows);
		return mapResultRow(fields, rows[0], joinsNotNullableMap);
	}
	mapGetResult(result, isFromBatch) {
		if (isFromBatch) result = d1ToRawMapping(result.results)[0];
		if (!this.fields && !this.customResultMapper) return result;
		if (this.customResultMapper) return this.customResultMapper([result]);
		return mapResultRow(this.fields, result, this.joinsNotNullableMap);
	}
	async values(placeholderValues) {
		const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
		this.logger.logQuery(this.query.sql, params);
		return await this.queryWithCache(this.query.sql, params, async () => {
			return this.stmt.bind(...params).raw();
		});
	}
	/** @internal */
	isResponseInArrayMode() {
		return this._isResponseInArrayMode;
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2/node_modules/drizzle-orm/d1/driver.js
var DrizzleD1Database = class extends BaseSQLiteDatabase {
	static [entityKind] = "D1Database";
	async batch(batch) {
		return this.session.batch(batch);
	}
};
function drizzle(client, config = {}) {
	const dialect = new SQLiteAsyncDialect({ casing: config.casing });
	let logger;
	if (config.logger === true) logger = new DefaultLogger();
	else if (config.logger !== false) logger = config.logger;
	let schema;
	if (config.schema) {
		const tablesConfig = extractTablesRelationalConfig(config.schema, createTableRelationsHelpers);
		schema = {
			fullSchema: config.schema,
			schema: tablesConfig.tables,
			tableNamesMap: tablesConfig.tableNamesMap
		};
	}
	const db = new DrizzleD1Database("async", dialect, new SQLiteD1Session(client, dialect, schema, {
		logger,
		cache: config.cache
	}), schema);
	db.$client = client;
	db.$cache = config.cache;
	if (db.$cache) db.$cache["invalidate"] = config.cache?.onMutate;
	return db;
}
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/decode-strings.js
var textEncoder = new TextEncoder();
var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64Lookup = new Uint8Array(256);
for (let i = 0; i < 64; i++) base64Lookup[base64Chars.charCodeAt(i)] = i;
function decodeBase64(base64) {
	let bufferLength = Math.ceil(base64.length / 4) * 3;
	const len = base64.length;
	let p = 0;
	if (base64.length % 4 === 3) bufferLength--;
	else if (base64.length % 4 === 2) bufferLength -= 2;
	else if (base64[base64.length - 1] === "=") {
		bufferLength--;
		if (base64[base64.length - 2] === "=") bufferLength--;
	}
	const arrayBuffer = new ArrayBuffer(bufferLength);
	const bytes = new Uint8Array(arrayBuffer);
	for (let i = 0; i < len; i += 4) {
		let encoded1 = base64Lookup[base64.charCodeAt(i)];
		let encoded2 = base64Lookup[base64.charCodeAt(i + 1)];
		let encoded3 = base64Lookup[base64.charCodeAt(i + 2)];
		let encoded4 = base64Lookup[base64.charCodeAt(i + 3)];
		bytes[p++] = encoded1 << 2 | encoded2 >> 4;
		bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
		bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
	}
	return arrayBuffer;
}
function getDecoder(charset) {
	charset = charset || "utf8";
	let decoder;
	try {
		decoder = new TextDecoder(charset);
	} catch (err) {
		decoder = new TextDecoder("windows-1252");
	}
	return decoder;
}
/**
* Converts a Blob into an ArrayBuffer
* @param {Blob} blob Blob to convert
* @returns {ArrayBuffer} Converted value
*/
async function blobToArrayBuffer(blob) {
	if ("arrayBuffer" in blob) return await blob.arrayBuffer();
	const fr = new FileReader();
	return new Promise((resolve, reject) => {
		fr.onload = function(e) {
			resolve(e.target.result);
		};
		fr.onerror = function(e) {
			reject(fr.error);
		};
		fr.readAsArrayBuffer(blob);
	});
}
function getHex(c) {
	if (c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) return String.fromCharCode(c);
	return false;
}
/**
* Decode a complete mime word encoded string
*
* @param {String} str Mime word encoded string
* @return {String} Decoded unicode string
*/
function decodeWord(charset, encoding, str) {
	let splitPos = charset.indexOf("*");
	if (splitPos >= 0) charset = charset.substr(0, splitPos);
	encoding = encoding.toUpperCase();
	let byteStr;
	if (encoding === "Q") {
		str = str.replace(/=\s+([0-9a-fA-F])/g, "=$1").replace(/[_\s]/g, " ");
		let buf = textEncoder.encode(str);
		let encodedBytes = [];
		for (let i = 0, len = buf.length; i < len; i++) {
			let c = buf[i];
			if (i <= len - 2 && c === 61) {
				let c1 = getHex(buf[i + 1]);
				let c2 = getHex(buf[i + 2]);
				if (c1 && c2) {
					let c = parseInt(c1 + c2, 16);
					encodedBytes.push(c);
					i += 2;
					continue;
				}
			}
			encodedBytes.push(c);
		}
		byteStr = new ArrayBuffer(encodedBytes.length);
		let dataView = new DataView(byteStr);
		for (let i = 0, len = encodedBytes.length; i < len; i++) dataView.setUint8(i, encodedBytes[i]);
	} else if (encoding === "B") byteStr = decodeBase64(str.replace(/[^a-zA-Z0-9\+\/=]+/g, ""));
	else byteStr = textEncoder.encode(str);
	return getDecoder(charset).decode(byteStr);
}
function decodeWords(str) {
	let joinString = true;
	while (true) {
		let result = (str || "").toString().replace(/(=\?([^?]+)\?[Bb]\?([^?]*)\?=)\s*(?==\?([^?]+)\?[Bb]\?[^?]*\?=)/g, (match, left, chLeft, encodedLeftStr, chRight) => {
			if (!joinString) return match;
			if (chLeft === chRight && encodedLeftStr.length % 4 === 0 && !/=$/.test(encodedLeftStr)) return left + "__\0JOIN\0__";
			return match;
		}).replace(/(=\?([^?]+)\?[Qq]\?[^?]*\?=)\s*(?==\?([^?]+)\?[Qq]\?[^?]*\?=)/g, (match, left, chLeft, chRight) => {
			if (!joinString) return match;
			if (chLeft === chRight) return left + "__\0JOIN\0__";
			return match;
		}).replace(/(\?=)?__\x00JOIN\x00__(=\?([^?]+)\?[QqBb]\?)?/g, "").replace(/(=\?[^?]+\?[QqBb]\?[^?]*\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]*\?=)/g, "$1").replace(/=\?([\w_\-*]+)\?([QqBb])\?([^?]*)\?=/g, (m, charset, encoding, text) => decodeWord(charset, encoding, text));
		if (joinString && result.indexOf("�") >= 0) joinString = false;
		else return result;
	}
}
function decodeURIComponentWithCharset(encodedStr, charset) {
	charset = charset || "utf-8";
	let encodedBytes = [];
	for (let i = 0; i < encodedStr.length; i++) {
		let c = encodedStr.charAt(i);
		if (c === "%" && /^[a-f0-9]{2}/i.test(encodedStr.substr(i + 1, 2))) {
			let byte = encodedStr.substr(i + 1, 2);
			i += 2;
			encodedBytes.push(parseInt(byte, 16));
		} else if (c.charCodeAt(0) > 126) {
			c = textEncoder.encode(c);
			for (let j = 0; j < c.length; j++) encodedBytes.push(c[j]);
		} else encodedBytes.push(c.charCodeAt(0));
	}
	const byteStr = new ArrayBuffer(encodedBytes.length);
	const dataView = new DataView(byteStr);
	for (let i = 0, len = encodedBytes.length; i < len; i++) dataView.setUint8(i, encodedBytes[i]);
	return getDecoder(charset).decode(byteStr);
}
function decodeParameterValueContinuations(header) {
	let paramKeys = /* @__PURE__ */ new Map();
	Object.keys(header.params).forEach((key) => {
		let match = key.match(/\*((\d+)\*?)?$/);
		if (!match) return;
		let actualKey = key.substr(0, match.index).toLowerCase();
		let nr = Number(match[2]) || 0;
		let paramVal;
		if (!paramKeys.has(actualKey)) {
			paramVal = {
				charset: false,
				values: []
			};
			paramKeys.set(actualKey, paramVal);
		} else paramVal = paramKeys.get(actualKey);
		let value = header.params[key];
		if (nr === 0 && match[0].charAt(match[0].length - 1) === "*" && (match = value.match(/^([^']*)'[^']*'(.*)$/))) {
			paramVal.charset = match[1] || "utf-8";
			value = match[2];
		}
		paramVal.values.push({
			nr,
			value
		});
		delete header.params[key];
	});
	paramKeys.forEach((paramVal, key) => {
		header.params[key] = decodeURIComponentWithCharset(paramVal.values.sort((a, b) => a.nr - b.nr).map((a) => a.value).join(""), paramVal.charset);
	});
}
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/pass-through-decoder.js
var PassThroughDecoder = class {
	constructor() {
		this.chunks = [];
	}
	update(line) {
		this.chunks.push(line);
		this.chunks.push("\n");
	}
	finalize() {
		return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
	}
};
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/base64-decoder.js
var Base64Decoder = class {
	constructor(opts) {
		opts = opts || {};
		this.decoder = opts.decoder || new TextDecoder();
		this.maxChunkSize = 100 * 1024;
		this.chunks = [];
		this.remainder = "";
	}
	update(buffer) {
		let str = this.decoder.decode(buffer);
		str = str.replace(/[^a-zA-Z0-9+\/]+/g, "");
		this.remainder += str;
		if (this.remainder.length >= this.maxChunkSize) {
			let allowedBytes = Math.floor(this.remainder.length / 4) * 4;
			let base64Str;
			if (allowedBytes === this.remainder.length) {
				base64Str = this.remainder;
				this.remainder = "";
			} else {
				base64Str = this.remainder.substr(0, allowedBytes);
				this.remainder = this.remainder.substr(allowedBytes);
			}
			if (base64Str.length) this.chunks.push(decodeBase64(base64Str));
		}
	}
	finalize() {
		if (this.remainder && !/^=+$/.test(this.remainder)) this.chunks.push(decodeBase64(this.remainder));
		return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
	}
};
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/qp-decoder.js
var VALID_QP_REGEX = /^=[a-f0-9]{2}$/i;
var QP_SPLIT_REGEX = /(?==[a-f0-9]{2})/i;
var SOFT_LINE_BREAK_REGEX = /=\r?\n/g;
var PARTIAL_QP_ENDING_REGEX = /=[a-fA-F0-9]?$/;
var QPDecoder = class {
	constructor(opts) {
		opts = opts || {};
		this.decoder = opts.decoder || new TextDecoder();
		this.maxChunkSize = 100 * 1024;
		this.remainder = "";
		this.chunks = [];
	}
	decodeQPBytes(encodedBytes) {
		let buf = new ArrayBuffer(encodedBytes.length);
		let dataView = new DataView(buf);
		for (let i = 0, len = encodedBytes.length; i < len; i++) dataView.setUint8(i, parseInt(encodedBytes[i], 16));
		return buf;
	}
	decodeChunks(str) {
		str = str.replace(SOFT_LINE_BREAK_REGEX, "");
		let list = str.split(QP_SPLIT_REGEX);
		let encodedBytes = [];
		for (let part of list) {
			if (part.charAt(0) !== "=") {
				if (encodedBytes.length) {
					this.chunks.push(this.decodeQPBytes(encodedBytes));
					encodedBytes = [];
				}
				this.chunks.push(part);
				continue;
			}
			if (part.length === 3) {
				if (VALID_QP_REGEX.test(part)) encodedBytes.push(part.substr(1));
				else {
					if (encodedBytes.length) {
						this.chunks.push(this.decodeQPBytes(encodedBytes));
						encodedBytes = [];
					}
					this.chunks.push(part);
				}
				continue;
			}
			if (part.length > 3) {
				const firstThree = part.substr(0, 3);
				if (VALID_QP_REGEX.test(firstThree)) {
					encodedBytes.push(part.substr(1, 2));
					this.chunks.push(this.decodeQPBytes(encodedBytes));
					encodedBytes = [];
					part = part.substr(3);
					this.chunks.push(part);
				} else {
					if (encodedBytes.length) {
						this.chunks.push(this.decodeQPBytes(encodedBytes));
						encodedBytes = [];
					}
					this.chunks.push(part);
				}
			}
		}
		if (encodedBytes.length) this.chunks.push(this.decodeQPBytes(encodedBytes));
	}
	update(buffer) {
		let str = this.decoder.decode(buffer) + "\n";
		str = this.remainder + str;
		if (str.length < this.maxChunkSize) {
			this.remainder = str;
			return;
		}
		this.remainder = "";
		let partialEnding = str.match(PARTIAL_QP_ENDING_REGEX);
		if (partialEnding) {
			if (partialEnding.index === 0) {
				this.remainder = str;
				return;
			}
			this.remainder = str.substr(partialEnding.index);
			str = str.substr(0, partialEnding.index);
		}
		this.decodeChunks(str);
	}
	finalize() {
		if (this.remainder.length) {
			this.decodeChunks(this.remainder);
			this.remainder = "";
		}
		return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
	}
};
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/mime-node.js
var defaultDecoder = getDecoder();
var MimeNode = class {
	constructor(options) {
		this.options = options || {};
		this.postalMime = this.options.postalMime;
		this.root = !!this.options.parentNode;
		this.childNodes = [];
		if (this.options.parentNode) {
			this.parentNode = this.options.parentNode;
			this.depth = this.parentNode.depth + 1;
			if (this.depth > this.options.maxNestingDepth) throw new Error(`Maximum MIME nesting depth of ${this.options.maxNestingDepth} levels exceeded`);
			this.options.parentNode.childNodes.push(this);
		} else this.depth = 0;
		this.state = "header";
		this.headerLines = [];
		this.headerSize = 0;
		const defaultContentType = (this.options.parentMultipartType || null) === "digest" ? "message/rfc822" : "text/plain";
		this.contentType = {
			value: defaultContentType,
			default: true
		};
		this.contentTransferEncoding = { value: "8bit" };
		this.contentDisposition = { value: "" };
		this.headers = [];
		this.contentDecoder = false;
	}
	setupContentDecoder(transferEncoding) {
		if (/base64/i.test(transferEncoding)) this.contentDecoder = new Base64Decoder();
		else if (/quoted-printable/i.test(transferEncoding)) this.contentDecoder = new QPDecoder({ decoder: getDecoder(this.contentType.parsed.params.charset) });
		else this.contentDecoder = new PassThroughDecoder();
	}
	async finalize() {
		if (this.state === "finished") return;
		if (this.state === "header") this.processHeaders();
		let boundaries = this.postalMime.boundaries;
		for (let i = boundaries.length - 1; i >= 0; i--) if (boundaries[i].node === this) {
			boundaries.splice(i, 1);
			break;
		}
		await this.finalizeChildNodes();
		this.content = this.contentDecoder ? await this.contentDecoder.finalize() : null;
		this.state = "finished";
	}
	async finalizeChildNodes() {
		for (let childNode of this.childNodes) await childNode.finalize();
	}
	stripComments(str) {
		let result = "";
		let depth = 0;
		let escaped = false;
		let inQuote = false;
		for (let i = 0; i < str.length; i++) {
			const chr = str.charAt(i);
			if (escaped) {
				if (depth === 0) result += chr;
				escaped = false;
				continue;
			}
			if (chr === "\\") {
				escaped = true;
				if (depth === 0) result += chr;
				continue;
			}
			if (chr === "\"" && depth === 0) {
				inQuote = !inQuote;
				result += chr;
				continue;
			}
			if (!inQuote) {
				if (chr === "(") {
					depth++;
					continue;
				}
				if (chr === ")" && depth > 0) {
					depth--;
					continue;
				}
			}
			if (depth === 0) result += chr;
		}
		return result;
	}
	parseStructuredHeader(str) {
		str = this.stripComments(str);
		let response = {
			value: false,
			params: {}
		};
		let key = false;
		let value = "";
		let stage = "value";
		let quote = false;
		let escaped = false;
		let chr;
		for (let i = 0, len = str.length; i < len; i++) {
			chr = str.charAt(i);
			switch (stage) {
				case "key":
					if (chr === "=") {
						key = value.trim().toLowerCase();
						stage = "value";
						value = "";
						break;
					}
					value += chr;
					break;
				case "value":
					if (escaped) value += chr;
					else if (chr === "\\") {
						escaped = true;
						continue;
					} else if (quote && chr === quote) quote = false;
					else if (!quote && chr === "\"") quote = chr;
					else if (!quote && chr === ";") {
						if (key === false) response.value = value.trim();
						else response.params[key] = value.trim();
						stage = "key";
						value = "";
					} else value += chr;
					escaped = false;
					break;
			}
		}
		value = value.trim();
		if (stage === "value") if (key === false) response.value = value;
		else response.params[key] = value;
		else if (value) response.params[value.toLowerCase()] = "";
		if (response.value) response.value = response.value.toLowerCase();
		decodeParameterValueContinuations(response);
		return response;
	}
	decodeFlowedText(str, delSp) {
		return str.split(/\r?\n/).reduce((previousValue, currentValue) => {
			if (previousValue.endsWith(" ") && previousValue !== "-- " && !previousValue.endsWith("\n-- ")) if (delSp) return previousValue.slice(0, -1) + currentValue;
			else return previousValue + currentValue;
			else return previousValue + "\n" + currentValue;
		}).replace(/^ /gm, "");
	}
	getTextContent() {
		if (!this.content) return "";
		let str = getDecoder(this.contentType.parsed.params.charset).decode(this.content);
		if (/^flowed$/i.test(this.contentType.parsed.params.format)) str = this.decodeFlowedText(str, /^yes$/i.test(this.contentType.parsed.params.delsp));
		return str;
	}
	processHeaders() {
		for (let i = this.headerLines.length - 1; i >= 0; i--) {
			let line = this.headerLines[i];
			if (i && /^\s/.test(line)) {
				this.headerLines[i - 1] += "\n" + line;
				this.headerLines.splice(i, 1);
			}
		}
		this.rawHeaderLines = [];
		for (let i = this.headerLines.length - 1; i >= 0; i--) {
			let rawLine = this.headerLines[i];
			let sep = rawLine.indexOf(":");
			let rawKey = sep < 0 ? rawLine.trim() : rawLine.substr(0, sep).trim();
			this.rawHeaderLines.push({
				key: rawKey.toLowerCase(),
				line: rawLine
			});
			let normalizedLine = rawLine.replace(/\s+/g, " ");
			sep = normalizedLine.indexOf(":");
			let key = sep < 0 ? normalizedLine.trim() : normalizedLine.substr(0, sep).trim();
			let value = sep < 0 ? "" : normalizedLine.substr(sep + 1).trim();
			this.headers.push({
				key: key.toLowerCase(),
				originalKey: key,
				value
			});
			switch (key.toLowerCase()) {
				case "content-type":
					if (this.contentType.default) this.contentType = {
						value,
						parsed: {}
					};
					break;
				case "content-transfer-encoding":
					this.contentTransferEncoding = {
						value,
						parsed: {}
					};
					break;
				case "content-disposition":
					this.contentDisposition = {
						value,
						parsed: {}
					};
					break;
				case "content-id":
					this.contentId = value;
					break;
				case "content-description":
					this.contentDescription = value;
					break;
			}
		}
		this.contentType.parsed = this.parseStructuredHeader(this.contentType.value);
		this.contentType.multipart = /^multipart\//i.test(this.contentType.parsed.value) ? this.contentType.parsed.value.substr(this.contentType.parsed.value.indexOf("/") + 1) : false;
		if (this.contentType.multipart && this.contentType.parsed.params.boundary) this.postalMime.boundaries.push({
			value: textEncoder.encode(this.contentType.parsed.params.boundary),
			node: this
		});
		this.contentDisposition.parsed = this.parseStructuredHeader(this.contentDisposition.value);
		this.contentTransferEncoding.encoding = this.contentTransferEncoding.value.toLowerCase().split(/[^\w-]/).shift();
		this.setupContentDecoder(this.contentTransferEncoding.encoding);
	}
	feed(line) {
		switch (this.state) {
			case "header":
				if (!line.length) {
					this.state = "body";
					return this.processHeaders();
				}
				this.headerSize += line.length;
				if (this.headerSize > this.options.maxHeadersSize) throw /* @__PURE__ */ new Error(`Maximum header size of ${this.options.maxHeadersSize} bytes exceeded`);
				this.headerLines.push(defaultDecoder.decode(line));
				break;
			case "body": this.contentDecoder.update(line);
		}
	}
};
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/html-entities.js
var htmlEntities = {
	"&AElig": "Æ",
	"&AElig;": "Æ",
	"&AMP": "&",
	"&AMP;": "&",
	"&Aacute": "Á",
	"&Aacute;": "Á",
	"&Abreve;": "Ă",
	"&Acirc": "Â",
	"&Acirc;": "Â",
	"&Acy;": "А",
	"&Afr;": "𝔄",
	"&Agrave": "À",
	"&Agrave;": "À",
	"&Alpha;": "Α",
	"&Amacr;": "Ā",
	"&And;": "⩓",
	"&Aogon;": "Ą",
	"&Aopf;": "𝔸",
	"&ApplyFunction;": "⁡",
	"&Aring": "Å",
	"&Aring;": "Å",
	"&Ascr;": "𝒜",
	"&Assign;": "≔",
	"&Atilde": "Ã",
	"&Atilde;": "Ã",
	"&Auml": "Ä",
	"&Auml;": "Ä",
	"&Backslash;": "∖",
	"&Barv;": "⫧",
	"&Barwed;": "⌆",
	"&Bcy;": "Б",
	"&Because;": "∵",
	"&Bernoullis;": "ℬ",
	"&Beta;": "Β",
	"&Bfr;": "𝔅",
	"&Bopf;": "𝔹",
	"&Breve;": "˘",
	"&Bscr;": "ℬ",
	"&Bumpeq;": "≎",
	"&CHcy;": "Ч",
	"&COPY": "©",
	"&COPY;": "©",
	"&Cacute;": "Ć",
	"&Cap;": "⋒",
	"&CapitalDifferentialD;": "ⅅ",
	"&Cayleys;": "ℭ",
	"&Ccaron;": "Č",
	"&Ccedil": "Ç",
	"&Ccedil;": "Ç",
	"&Ccirc;": "Ĉ",
	"&Cconint;": "∰",
	"&Cdot;": "Ċ",
	"&Cedilla;": "¸",
	"&CenterDot;": "·",
	"&Cfr;": "ℭ",
	"&Chi;": "Χ",
	"&CircleDot;": "⊙",
	"&CircleMinus;": "⊖",
	"&CirclePlus;": "⊕",
	"&CircleTimes;": "⊗",
	"&ClockwiseContourIntegral;": "∲",
	"&CloseCurlyDoubleQuote;": "”",
	"&CloseCurlyQuote;": "’",
	"&Colon;": "∷",
	"&Colone;": "⩴",
	"&Congruent;": "≡",
	"&Conint;": "∯",
	"&ContourIntegral;": "∮",
	"&Copf;": "ℂ",
	"&Coproduct;": "∐",
	"&CounterClockwiseContourIntegral;": "∳",
	"&Cross;": "⨯",
	"&Cscr;": "𝒞",
	"&Cup;": "⋓",
	"&CupCap;": "≍",
	"&DD;": "ⅅ",
	"&DDotrahd;": "⤑",
	"&DJcy;": "Ђ",
	"&DScy;": "Ѕ",
	"&DZcy;": "Џ",
	"&Dagger;": "‡",
	"&Darr;": "↡",
	"&Dashv;": "⫤",
	"&Dcaron;": "Ď",
	"&Dcy;": "Д",
	"&Del;": "∇",
	"&Delta;": "Δ",
	"&Dfr;": "𝔇",
	"&DiacriticalAcute;": "´",
	"&DiacriticalDot;": "˙",
	"&DiacriticalDoubleAcute;": "˝",
	"&DiacriticalGrave;": "`",
	"&DiacriticalTilde;": "˜",
	"&Diamond;": "⋄",
	"&DifferentialD;": "ⅆ",
	"&Dopf;": "𝔻",
	"&Dot;": "¨",
	"&DotDot;": "⃜",
	"&DotEqual;": "≐",
	"&DoubleContourIntegral;": "∯",
	"&DoubleDot;": "¨",
	"&DoubleDownArrow;": "⇓",
	"&DoubleLeftArrow;": "⇐",
	"&DoubleLeftRightArrow;": "⇔",
	"&DoubleLeftTee;": "⫤",
	"&DoubleLongLeftArrow;": "⟸",
	"&DoubleLongLeftRightArrow;": "⟺",
	"&DoubleLongRightArrow;": "⟹",
	"&DoubleRightArrow;": "⇒",
	"&DoubleRightTee;": "⊨",
	"&DoubleUpArrow;": "⇑",
	"&DoubleUpDownArrow;": "⇕",
	"&DoubleVerticalBar;": "∥",
	"&DownArrow;": "↓",
	"&DownArrowBar;": "⤓",
	"&DownArrowUpArrow;": "⇵",
	"&DownBreve;": "̑",
	"&DownLeftRightVector;": "⥐",
	"&DownLeftTeeVector;": "⥞",
	"&DownLeftVector;": "↽",
	"&DownLeftVectorBar;": "⥖",
	"&DownRightTeeVector;": "⥟",
	"&DownRightVector;": "⇁",
	"&DownRightVectorBar;": "⥗",
	"&DownTee;": "⊤",
	"&DownTeeArrow;": "↧",
	"&Downarrow;": "⇓",
	"&Dscr;": "𝒟",
	"&Dstrok;": "Đ",
	"&ENG;": "Ŋ",
	"&ETH": "Ð",
	"&ETH;": "Ð",
	"&Eacute": "É",
	"&Eacute;": "É",
	"&Ecaron;": "Ě",
	"&Ecirc": "Ê",
	"&Ecirc;": "Ê",
	"&Ecy;": "Э",
	"&Edot;": "Ė",
	"&Efr;": "𝔈",
	"&Egrave": "È",
	"&Egrave;": "È",
	"&Element;": "∈",
	"&Emacr;": "Ē",
	"&EmptySmallSquare;": "◻",
	"&EmptyVerySmallSquare;": "▫",
	"&Eogon;": "Ę",
	"&Eopf;": "𝔼",
	"&Epsilon;": "Ε",
	"&Equal;": "⩵",
	"&EqualTilde;": "≂",
	"&Equilibrium;": "⇌",
	"&Escr;": "ℰ",
	"&Esim;": "⩳",
	"&Eta;": "Η",
	"&Euml": "Ë",
	"&Euml;": "Ë",
	"&Exists;": "∃",
	"&ExponentialE;": "ⅇ",
	"&Fcy;": "Ф",
	"&Ffr;": "𝔉",
	"&FilledSmallSquare;": "◼",
	"&FilledVerySmallSquare;": "▪",
	"&Fopf;": "𝔽",
	"&ForAll;": "∀",
	"&Fouriertrf;": "ℱ",
	"&Fscr;": "ℱ",
	"&GJcy;": "Ѓ",
	"&GT": ">",
	"&GT;": ">",
	"&Gamma;": "Γ",
	"&Gammad;": "Ϝ",
	"&Gbreve;": "Ğ",
	"&Gcedil;": "Ģ",
	"&Gcirc;": "Ĝ",
	"&Gcy;": "Г",
	"&Gdot;": "Ġ",
	"&Gfr;": "𝔊",
	"&Gg;": "⋙",
	"&Gopf;": "𝔾",
	"&GreaterEqual;": "≥",
	"&GreaterEqualLess;": "⋛",
	"&GreaterFullEqual;": "≧",
	"&GreaterGreater;": "⪢",
	"&GreaterLess;": "≷",
	"&GreaterSlantEqual;": "⩾",
	"&GreaterTilde;": "≳",
	"&Gscr;": "𝒢",
	"&Gt;": "≫",
	"&HARDcy;": "Ъ",
	"&Hacek;": "ˇ",
	"&Hat;": "^",
	"&Hcirc;": "Ĥ",
	"&Hfr;": "ℌ",
	"&HilbertSpace;": "ℋ",
	"&Hopf;": "ℍ",
	"&HorizontalLine;": "─",
	"&Hscr;": "ℋ",
	"&Hstrok;": "Ħ",
	"&HumpDownHump;": "≎",
	"&HumpEqual;": "≏",
	"&IEcy;": "Е",
	"&IJlig;": "Ĳ",
	"&IOcy;": "Ё",
	"&Iacute": "Í",
	"&Iacute;": "Í",
	"&Icirc": "Î",
	"&Icirc;": "Î",
	"&Icy;": "И",
	"&Idot;": "İ",
	"&Ifr;": "ℑ",
	"&Igrave": "Ì",
	"&Igrave;": "Ì",
	"&Im;": "ℑ",
	"&Imacr;": "Ī",
	"&ImaginaryI;": "ⅈ",
	"&Implies;": "⇒",
	"&Int;": "∬",
	"&Integral;": "∫",
	"&Intersection;": "⋂",
	"&InvisibleComma;": "⁣",
	"&InvisibleTimes;": "⁢",
	"&Iogon;": "Į",
	"&Iopf;": "𝕀",
	"&Iota;": "Ι",
	"&Iscr;": "ℐ",
	"&Itilde;": "Ĩ",
	"&Iukcy;": "І",
	"&Iuml": "Ï",
	"&Iuml;": "Ï",
	"&Jcirc;": "Ĵ",
	"&Jcy;": "Й",
	"&Jfr;": "𝔍",
	"&Jopf;": "𝕁",
	"&Jscr;": "𝒥",
	"&Jsercy;": "Ј",
	"&Jukcy;": "Є",
	"&KHcy;": "Х",
	"&KJcy;": "Ќ",
	"&Kappa;": "Κ",
	"&Kcedil;": "Ķ",
	"&Kcy;": "К",
	"&Kfr;": "𝔎",
	"&Kopf;": "𝕂",
	"&Kscr;": "𝒦",
	"&LJcy;": "Љ",
	"&LT": "<",
	"&LT;": "<",
	"&Lacute;": "Ĺ",
	"&Lambda;": "Λ",
	"&Lang;": "⟪",
	"&Laplacetrf;": "ℒ",
	"&Larr;": "↞",
	"&Lcaron;": "Ľ",
	"&Lcedil;": "Ļ",
	"&Lcy;": "Л",
	"&LeftAngleBracket;": "⟨",
	"&LeftArrow;": "←",
	"&LeftArrowBar;": "⇤",
	"&LeftArrowRightArrow;": "⇆",
	"&LeftCeiling;": "⌈",
	"&LeftDoubleBracket;": "⟦",
	"&LeftDownTeeVector;": "⥡",
	"&LeftDownVector;": "⇃",
	"&LeftDownVectorBar;": "⥙",
	"&LeftFloor;": "⌊",
	"&LeftRightArrow;": "↔",
	"&LeftRightVector;": "⥎",
	"&LeftTee;": "⊣",
	"&LeftTeeArrow;": "↤",
	"&LeftTeeVector;": "⥚",
	"&LeftTriangle;": "⊲",
	"&LeftTriangleBar;": "⧏",
	"&LeftTriangleEqual;": "⊴",
	"&LeftUpDownVector;": "⥑",
	"&LeftUpTeeVector;": "⥠",
	"&LeftUpVector;": "↿",
	"&LeftUpVectorBar;": "⥘",
	"&LeftVector;": "↼",
	"&LeftVectorBar;": "⥒",
	"&Leftarrow;": "⇐",
	"&Leftrightarrow;": "⇔",
	"&LessEqualGreater;": "⋚",
	"&LessFullEqual;": "≦",
	"&LessGreater;": "≶",
	"&LessLess;": "⪡",
	"&LessSlantEqual;": "⩽",
	"&LessTilde;": "≲",
	"&Lfr;": "𝔏",
	"&Ll;": "⋘",
	"&Lleftarrow;": "⇚",
	"&Lmidot;": "Ŀ",
	"&LongLeftArrow;": "⟵",
	"&LongLeftRightArrow;": "⟷",
	"&LongRightArrow;": "⟶",
	"&Longleftarrow;": "⟸",
	"&Longleftrightarrow;": "⟺",
	"&Longrightarrow;": "⟹",
	"&Lopf;": "𝕃",
	"&LowerLeftArrow;": "↙",
	"&LowerRightArrow;": "↘",
	"&Lscr;": "ℒ",
	"&Lsh;": "↰",
	"&Lstrok;": "Ł",
	"&Lt;": "≪",
	"&Map;": "⤅",
	"&Mcy;": "М",
	"&MediumSpace;": " ",
	"&Mellintrf;": "ℳ",
	"&Mfr;": "𝔐",
	"&MinusPlus;": "∓",
	"&Mopf;": "𝕄",
	"&Mscr;": "ℳ",
	"&Mu;": "Μ",
	"&NJcy;": "Њ",
	"&Nacute;": "Ń",
	"&Ncaron;": "Ň",
	"&Ncedil;": "Ņ",
	"&Ncy;": "Н",
	"&NegativeMediumSpace;": "​",
	"&NegativeThickSpace;": "​",
	"&NegativeThinSpace;": "​",
	"&NegativeVeryThinSpace;": "​",
	"&NestedGreaterGreater;": "≫",
	"&NestedLessLess;": "≪",
	"&NewLine;": "\n",
	"&Nfr;": "𝔑",
	"&NoBreak;": "⁠",
	"&NonBreakingSpace;": "\xA0",
	"&Nopf;": "ℕ",
	"&Not;": "⫬",
	"&NotCongruent;": "≢",
	"&NotCupCap;": "≭",
	"&NotDoubleVerticalBar;": "∦",
	"&NotElement;": "∉",
	"&NotEqual;": "≠",
	"&NotEqualTilde;": "≂̸",
	"&NotExists;": "∄",
	"&NotGreater;": "≯",
	"&NotGreaterEqual;": "≱",
	"&NotGreaterFullEqual;": "≧̸",
	"&NotGreaterGreater;": "≫̸",
	"&NotGreaterLess;": "≹",
	"&NotGreaterSlantEqual;": "⩾̸",
	"&NotGreaterTilde;": "≵",
	"&NotHumpDownHump;": "≎̸",
	"&NotHumpEqual;": "≏̸",
	"&NotLeftTriangle;": "⋪",
	"&NotLeftTriangleBar;": "⧏̸",
	"&NotLeftTriangleEqual;": "⋬",
	"&NotLess;": "≮",
	"&NotLessEqual;": "≰",
	"&NotLessGreater;": "≸",
	"&NotLessLess;": "≪̸",
	"&NotLessSlantEqual;": "⩽̸",
	"&NotLessTilde;": "≴",
	"&NotNestedGreaterGreater;": "⪢̸",
	"&NotNestedLessLess;": "⪡̸",
	"&NotPrecedes;": "⊀",
	"&NotPrecedesEqual;": "⪯̸",
	"&NotPrecedesSlantEqual;": "⋠",
	"&NotReverseElement;": "∌",
	"&NotRightTriangle;": "⋫",
	"&NotRightTriangleBar;": "⧐̸",
	"&NotRightTriangleEqual;": "⋭",
	"&NotSquareSubset;": "⊏̸",
	"&NotSquareSubsetEqual;": "⋢",
	"&NotSquareSuperset;": "⊐̸",
	"&NotSquareSupersetEqual;": "⋣",
	"&NotSubset;": "⊂⃒",
	"&NotSubsetEqual;": "⊈",
	"&NotSucceeds;": "⊁",
	"&NotSucceedsEqual;": "⪰̸",
	"&NotSucceedsSlantEqual;": "⋡",
	"&NotSucceedsTilde;": "≿̸",
	"&NotSuperset;": "⊃⃒",
	"&NotSupersetEqual;": "⊉",
	"&NotTilde;": "≁",
	"&NotTildeEqual;": "≄",
	"&NotTildeFullEqual;": "≇",
	"&NotTildeTilde;": "≉",
	"&NotVerticalBar;": "∤",
	"&Nscr;": "𝒩",
	"&Ntilde": "Ñ",
	"&Ntilde;": "Ñ",
	"&Nu;": "Ν",
	"&OElig;": "Œ",
	"&Oacute": "Ó",
	"&Oacute;": "Ó",
	"&Ocirc": "Ô",
	"&Ocirc;": "Ô",
	"&Ocy;": "О",
	"&Odblac;": "Ő",
	"&Ofr;": "𝔒",
	"&Ograve": "Ò",
	"&Ograve;": "Ò",
	"&Omacr;": "Ō",
	"&Omega;": "Ω",
	"&Omicron;": "Ο",
	"&Oopf;": "𝕆",
	"&OpenCurlyDoubleQuote;": "“",
	"&OpenCurlyQuote;": "‘",
	"&Or;": "⩔",
	"&Oscr;": "𝒪",
	"&Oslash": "Ø",
	"&Oslash;": "Ø",
	"&Otilde": "Õ",
	"&Otilde;": "Õ",
	"&Otimes;": "⨷",
	"&Ouml": "Ö",
	"&Ouml;": "Ö",
	"&OverBar;": "‾",
	"&OverBrace;": "⏞",
	"&OverBracket;": "⎴",
	"&OverParenthesis;": "⏜",
	"&PartialD;": "∂",
	"&Pcy;": "П",
	"&Pfr;": "𝔓",
	"&Phi;": "Φ",
	"&Pi;": "Π",
	"&PlusMinus;": "±",
	"&Poincareplane;": "ℌ",
	"&Popf;": "ℙ",
	"&Pr;": "⪻",
	"&Precedes;": "≺",
	"&PrecedesEqual;": "⪯",
	"&PrecedesSlantEqual;": "≼",
	"&PrecedesTilde;": "≾",
	"&Prime;": "″",
	"&Product;": "∏",
	"&Proportion;": "∷",
	"&Proportional;": "∝",
	"&Pscr;": "𝒫",
	"&Psi;": "Ψ",
	"&QUOT": "\"",
	"&QUOT;": "\"",
	"&Qfr;": "𝔔",
	"&Qopf;": "ℚ",
	"&Qscr;": "𝒬",
	"&RBarr;": "⤐",
	"&REG": "®",
	"&REG;": "®",
	"&Racute;": "Ŕ",
	"&Rang;": "⟫",
	"&Rarr;": "↠",
	"&Rarrtl;": "⤖",
	"&Rcaron;": "Ř",
	"&Rcedil;": "Ŗ",
	"&Rcy;": "Р",
	"&Re;": "ℜ",
	"&ReverseElement;": "∋",
	"&ReverseEquilibrium;": "⇋",
	"&ReverseUpEquilibrium;": "⥯",
	"&Rfr;": "ℜ",
	"&Rho;": "Ρ",
	"&RightAngleBracket;": "⟩",
	"&RightArrow;": "→",
	"&RightArrowBar;": "⇥",
	"&RightArrowLeftArrow;": "⇄",
	"&RightCeiling;": "⌉",
	"&RightDoubleBracket;": "⟧",
	"&RightDownTeeVector;": "⥝",
	"&RightDownVector;": "⇂",
	"&RightDownVectorBar;": "⥕",
	"&RightFloor;": "⌋",
	"&RightTee;": "⊢",
	"&RightTeeArrow;": "↦",
	"&RightTeeVector;": "⥛",
	"&RightTriangle;": "⊳",
	"&RightTriangleBar;": "⧐",
	"&RightTriangleEqual;": "⊵",
	"&RightUpDownVector;": "⥏",
	"&RightUpTeeVector;": "⥜",
	"&RightUpVector;": "↾",
	"&RightUpVectorBar;": "⥔",
	"&RightVector;": "⇀",
	"&RightVectorBar;": "⥓",
	"&Rightarrow;": "⇒",
	"&Ropf;": "ℝ",
	"&RoundImplies;": "⥰",
	"&Rrightarrow;": "⇛",
	"&Rscr;": "ℛ",
	"&Rsh;": "↱",
	"&RuleDelayed;": "⧴",
	"&SHCHcy;": "Щ",
	"&SHcy;": "Ш",
	"&SOFTcy;": "Ь",
	"&Sacute;": "Ś",
	"&Sc;": "⪼",
	"&Scaron;": "Š",
	"&Scedil;": "Ş",
	"&Scirc;": "Ŝ",
	"&Scy;": "С",
	"&Sfr;": "𝔖",
	"&ShortDownArrow;": "↓",
	"&ShortLeftArrow;": "←",
	"&ShortRightArrow;": "→",
	"&ShortUpArrow;": "↑",
	"&Sigma;": "Σ",
	"&SmallCircle;": "∘",
	"&Sopf;": "𝕊",
	"&Sqrt;": "√",
	"&Square;": "□",
	"&SquareIntersection;": "⊓",
	"&SquareSubset;": "⊏",
	"&SquareSubsetEqual;": "⊑",
	"&SquareSuperset;": "⊐",
	"&SquareSupersetEqual;": "⊒",
	"&SquareUnion;": "⊔",
	"&Sscr;": "𝒮",
	"&Star;": "⋆",
	"&Sub;": "⋐",
	"&Subset;": "⋐",
	"&SubsetEqual;": "⊆",
	"&Succeeds;": "≻",
	"&SucceedsEqual;": "⪰",
	"&SucceedsSlantEqual;": "≽",
	"&SucceedsTilde;": "≿",
	"&SuchThat;": "∋",
	"&Sum;": "∑",
	"&Sup;": "⋑",
	"&Superset;": "⊃",
	"&SupersetEqual;": "⊇",
	"&Supset;": "⋑",
	"&THORN": "Þ",
	"&THORN;": "Þ",
	"&TRADE;": "™",
	"&TSHcy;": "Ћ",
	"&TScy;": "Ц",
	"&Tab;": "	",
	"&Tau;": "Τ",
	"&Tcaron;": "Ť",
	"&Tcedil;": "Ţ",
	"&Tcy;": "Т",
	"&Tfr;": "𝔗",
	"&Therefore;": "∴",
	"&Theta;": "Θ",
	"&ThickSpace;": "  ",
	"&ThinSpace;": " ",
	"&Tilde;": "∼",
	"&TildeEqual;": "≃",
	"&TildeFullEqual;": "≅",
	"&TildeTilde;": "≈",
	"&Topf;": "𝕋",
	"&TripleDot;": "⃛",
	"&Tscr;": "𝒯",
	"&Tstrok;": "Ŧ",
	"&Uacute": "Ú",
	"&Uacute;": "Ú",
	"&Uarr;": "↟",
	"&Uarrocir;": "⥉",
	"&Ubrcy;": "Ў",
	"&Ubreve;": "Ŭ",
	"&Ucirc": "Û",
	"&Ucirc;": "Û",
	"&Ucy;": "У",
	"&Udblac;": "Ű",
	"&Ufr;": "𝔘",
	"&Ugrave": "Ù",
	"&Ugrave;": "Ù",
	"&Umacr;": "Ū",
	"&UnderBar;": "_",
	"&UnderBrace;": "⏟",
	"&UnderBracket;": "⎵",
	"&UnderParenthesis;": "⏝",
	"&Union;": "⋃",
	"&UnionPlus;": "⊎",
	"&Uogon;": "Ų",
	"&Uopf;": "𝕌",
	"&UpArrow;": "↑",
	"&UpArrowBar;": "⤒",
	"&UpArrowDownArrow;": "⇅",
	"&UpDownArrow;": "↕",
	"&UpEquilibrium;": "⥮",
	"&UpTee;": "⊥",
	"&UpTeeArrow;": "↥",
	"&Uparrow;": "⇑",
	"&Updownarrow;": "⇕",
	"&UpperLeftArrow;": "↖",
	"&UpperRightArrow;": "↗",
	"&Upsi;": "ϒ",
	"&Upsilon;": "Υ",
	"&Uring;": "Ů",
	"&Uscr;": "𝒰",
	"&Utilde;": "Ũ",
	"&Uuml": "Ü",
	"&Uuml;": "Ü",
	"&VDash;": "⊫",
	"&Vbar;": "⫫",
	"&Vcy;": "В",
	"&Vdash;": "⊩",
	"&Vdashl;": "⫦",
	"&Vee;": "⋁",
	"&Verbar;": "‖",
	"&Vert;": "‖",
	"&VerticalBar;": "∣",
	"&VerticalLine;": "|",
	"&VerticalSeparator;": "❘",
	"&VerticalTilde;": "≀",
	"&VeryThinSpace;": " ",
	"&Vfr;": "𝔙",
	"&Vopf;": "𝕍",
	"&Vscr;": "𝒱",
	"&Vvdash;": "⊪",
	"&Wcirc;": "Ŵ",
	"&Wedge;": "⋀",
	"&Wfr;": "𝔚",
	"&Wopf;": "𝕎",
	"&Wscr;": "𝒲",
	"&Xfr;": "𝔛",
	"&Xi;": "Ξ",
	"&Xopf;": "𝕏",
	"&Xscr;": "𝒳",
	"&YAcy;": "Я",
	"&YIcy;": "Ї",
	"&YUcy;": "Ю",
	"&Yacute": "Ý",
	"&Yacute;": "Ý",
	"&Ycirc;": "Ŷ",
	"&Ycy;": "Ы",
	"&Yfr;": "𝔜",
	"&Yopf;": "𝕐",
	"&Yscr;": "𝒴",
	"&Yuml;": "Ÿ",
	"&ZHcy;": "Ж",
	"&Zacute;": "Ź",
	"&Zcaron;": "Ž",
	"&Zcy;": "З",
	"&Zdot;": "Ż",
	"&ZeroWidthSpace;": "​",
	"&Zeta;": "Ζ",
	"&Zfr;": "ℨ",
	"&Zopf;": "ℤ",
	"&Zscr;": "𝒵",
	"&aacute": "á",
	"&aacute;": "á",
	"&abreve;": "ă",
	"&ac;": "∾",
	"&acE;": "∾̳",
	"&acd;": "∿",
	"&acirc": "â",
	"&acirc;": "â",
	"&acute": "´",
	"&acute;": "´",
	"&acy;": "а",
	"&aelig": "æ",
	"&aelig;": "æ",
	"&af;": "⁡",
	"&afr;": "𝔞",
	"&agrave": "à",
	"&agrave;": "à",
	"&alefsym;": "ℵ",
	"&aleph;": "ℵ",
	"&alpha;": "α",
	"&amacr;": "ā",
	"&amalg;": "⨿",
	"&amp": "&",
	"&amp;": "&",
	"&and;": "∧",
	"&andand;": "⩕",
	"&andd;": "⩜",
	"&andslope;": "⩘",
	"&andv;": "⩚",
	"&ang;": "∠",
	"&ange;": "⦤",
	"&angle;": "∠",
	"&angmsd;": "∡",
	"&angmsdaa;": "⦨",
	"&angmsdab;": "⦩",
	"&angmsdac;": "⦪",
	"&angmsdad;": "⦫",
	"&angmsdae;": "⦬",
	"&angmsdaf;": "⦭",
	"&angmsdag;": "⦮",
	"&angmsdah;": "⦯",
	"&angrt;": "∟",
	"&angrtvb;": "⊾",
	"&angrtvbd;": "⦝",
	"&angsph;": "∢",
	"&angst;": "Å",
	"&angzarr;": "⍼",
	"&aogon;": "ą",
	"&aopf;": "𝕒",
	"&ap;": "≈",
	"&apE;": "⩰",
	"&apacir;": "⩯",
	"&ape;": "≊",
	"&apid;": "≋",
	"&apos;": "'",
	"&approx;": "≈",
	"&approxeq;": "≊",
	"&aring": "å",
	"&aring;": "å",
	"&ascr;": "𝒶",
	"&ast;": "*",
	"&asymp;": "≈",
	"&asympeq;": "≍",
	"&atilde": "ã",
	"&atilde;": "ã",
	"&auml": "ä",
	"&auml;": "ä",
	"&awconint;": "∳",
	"&awint;": "⨑",
	"&bNot;": "⫭",
	"&backcong;": "≌",
	"&backepsilon;": "϶",
	"&backprime;": "‵",
	"&backsim;": "∽",
	"&backsimeq;": "⋍",
	"&barvee;": "⊽",
	"&barwed;": "⌅",
	"&barwedge;": "⌅",
	"&bbrk;": "⎵",
	"&bbrktbrk;": "⎶",
	"&bcong;": "≌",
	"&bcy;": "б",
	"&bdquo;": "„",
	"&becaus;": "∵",
	"&because;": "∵",
	"&bemptyv;": "⦰",
	"&bepsi;": "϶",
	"&bernou;": "ℬ",
	"&beta;": "β",
	"&beth;": "ℶ",
	"&between;": "≬",
	"&bfr;": "𝔟",
	"&bigcap;": "⋂",
	"&bigcirc;": "◯",
	"&bigcup;": "⋃",
	"&bigodot;": "⨀",
	"&bigoplus;": "⨁",
	"&bigotimes;": "⨂",
	"&bigsqcup;": "⨆",
	"&bigstar;": "★",
	"&bigtriangledown;": "▽",
	"&bigtriangleup;": "△",
	"&biguplus;": "⨄",
	"&bigvee;": "⋁",
	"&bigwedge;": "⋀",
	"&bkarow;": "⤍",
	"&blacklozenge;": "⧫",
	"&blacksquare;": "▪",
	"&blacktriangle;": "▴",
	"&blacktriangledown;": "▾",
	"&blacktriangleleft;": "◂",
	"&blacktriangleright;": "▸",
	"&blank;": "␣",
	"&blk12;": "▒",
	"&blk14;": "░",
	"&blk34;": "▓",
	"&block;": "█",
	"&bne;": "=⃥",
	"&bnequiv;": "≡⃥",
	"&bnot;": "⌐",
	"&bopf;": "𝕓",
	"&bot;": "⊥",
	"&bottom;": "⊥",
	"&bowtie;": "⋈",
	"&boxDL;": "╗",
	"&boxDR;": "╔",
	"&boxDl;": "╖",
	"&boxDr;": "╓",
	"&boxH;": "═",
	"&boxHD;": "╦",
	"&boxHU;": "╩",
	"&boxHd;": "╤",
	"&boxHu;": "╧",
	"&boxUL;": "╝",
	"&boxUR;": "╚",
	"&boxUl;": "╜",
	"&boxUr;": "╙",
	"&boxV;": "║",
	"&boxVH;": "╬",
	"&boxVL;": "╣",
	"&boxVR;": "╠",
	"&boxVh;": "╫",
	"&boxVl;": "╢",
	"&boxVr;": "╟",
	"&boxbox;": "⧉",
	"&boxdL;": "╕",
	"&boxdR;": "╒",
	"&boxdl;": "┐",
	"&boxdr;": "┌",
	"&boxh;": "─",
	"&boxhD;": "╥",
	"&boxhU;": "╨",
	"&boxhd;": "┬",
	"&boxhu;": "┴",
	"&boxminus;": "⊟",
	"&boxplus;": "⊞",
	"&boxtimes;": "⊠",
	"&boxuL;": "╛",
	"&boxuR;": "╘",
	"&boxul;": "┘",
	"&boxur;": "└",
	"&boxv;": "│",
	"&boxvH;": "╪",
	"&boxvL;": "╡",
	"&boxvR;": "╞",
	"&boxvh;": "┼",
	"&boxvl;": "┤",
	"&boxvr;": "├",
	"&bprime;": "‵",
	"&breve;": "˘",
	"&brvbar": "¦",
	"&brvbar;": "¦",
	"&bscr;": "𝒷",
	"&bsemi;": "⁏",
	"&bsim;": "∽",
	"&bsime;": "⋍",
	"&bsol;": "\\",
	"&bsolb;": "⧅",
	"&bsolhsub;": "⟈",
	"&bull;": "•",
	"&bullet;": "•",
	"&bump;": "≎",
	"&bumpE;": "⪮",
	"&bumpe;": "≏",
	"&bumpeq;": "≏",
	"&cacute;": "ć",
	"&cap;": "∩",
	"&capand;": "⩄",
	"&capbrcup;": "⩉",
	"&capcap;": "⩋",
	"&capcup;": "⩇",
	"&capdot;": "⩀",
	"&caps;": "∩︀",
	"&caret;": "⁁",
	"&caron;": "ˇ",
	"&ccaps;": "⩍",
	"&ccaron;": "č",
	"&ccedil": "ç",
	"&ccedil;": "ç",
	"&ccirc;": "ĉ",
	"&ccups;": "⩌",
	"&ccupssm;": "⩐",
	"&cdot;": "ċ",
	"&cedil": "¸",
	"&cedil;": "¸",
	"&cemptyv;": "⦲",
	"&cent": "¢",
	"&cent;": "¢",
	"&centerdot;": "·",
	"&cfr;": "𝔠",
	"&chcy;": "ч",
	"&check;": "✓",
	"&checkmark;": "✓",
	"&chi;": "χ",
	"&cir;": "○",
	"&cirE;": "⧃",
	"&circ;": "ˆ",
	"&circeq;": "≗",
	"&circlearrowleft;": "↺",
	"&circlearrowright;": "↻",
	"&circledR;": "®",
	"&circledS;": "Ⓢ",
	"&circledast;": "⊛",
	"&circledcirc;": "⊚",
	"&circleddash;": "⊝",
	"&cire;": "≗",
	"&cirfnint;": "⨐",
	"&cirmid;": "⫯",
	"&cirscir;": "⧂",
	"&clubs;": "♣",
	"&clubsuit;": "♣",
	"&colon;": ":",
	"&colone;": "≔",
	"&coloneq;": "≔",
	"&comma;": ",",
	"&commat;": "@",
	"&comp;": "∁",
	"&compfn;": "∘",
	"&complement;": "∁",
	"&complexes;": "ℂ",
	"&cong;": "≅",
	"&congdot;": "⩭",
	"&conint;": "∮",
	"&copf;": "𝕔",
	"&coprod;": "∐",
	"&copy": "©",
	"&copy;": "©",
	"&copysr;": "℗",
	"&crarr;": "↵",
	"&cross;": "✗",
	"&cscr;": "𝒸",
	"&csub;": "⫏",
	"&csube;": "⫑",
	"&csup;": "⫐",
	"&csupe;": "⫒",
	"&ctdot;": "⋯",
	"&cudarrl;": "⤸",
	"&cudarrr;": "⤵",
	"&cuepr;": "⋞",
	"&cuesc;": "⋟",
	"&cularr;": "↶",
	"&cularrp;": "⤽",
	"&cup;": "∪",
	"&cupbrcap;": "⩈",
	"&cupcap;": "⩆",
	"&cupcup;": "⩊",
	"&cupdot;": "⊍",
	"&cupor;": "⩅",
	"&cups;": "∪︀",
	"&curarr;": "↷",
	"&curarrm;": "⤼",
	"&curlyeqprec;": "⋞",
	"&curlyeqsucc;": "⋟",
	"&curlyvee;": "⋎",
	"&curlywedge;": "⋏",
	"&curren": "¤",
	"&curren;": "¤",
	"&curvearrowleft;": "↶",
	"&curvearrowright;": "↷",
	"&cuvee;": "⋎",
	"&cuwed;": "⋏",
	"&cwconint;": "∲",
	"&cwint;": "∱",
	"&cylcty;": "⌭",
	"&dArr;": "⇓",
	"&dHar;": "⥥",
	"&dagger;": "†",
	"&daleth;": "ℸ",
	"&darr;": "↓",
	"&dash;": "‐",
	"&dashv;": "⊣",
	"&dbkarow;": "⤏",
	"&dblac;": "˝",
	"&dcaron;": "ď",
	"&dcy;": "д",
	"&dd;": "ⅆ",
	"&ddagger;": "‡",
	"&ddarr;": "⇊",
	"&ddotseq;": "⩷",
	"&deg": "°",
	"&deg;": "°",
	"&delta;": "δ",
	"&demptyv;": "⦱",
	"&dfisht;": "⥿",
	"&dfr;": "𝔡",
	"&dharl;": "⇃",
	"&dharr;": "⇂",
	"&diam;": "⋄",
	"&diamond;": "⋄",
	"&diamondsuit;": "♦",
	"&diams;": "♦",
	"&die;": "¨",
	"&digamma;": "ϝ",
	"&disin;": "⋲",
	"&div;": "÷",
	"&divide": "÷",
	"&divide;": "÷",
	"&divideontimes;": "⋇",
	"&divonx;": "⋇",
	"&djcy;": "ђ",
	"&dlcorn;": "⌞",
	"&dlcrop;": "⌍",
	"&dollar;": "$",
	"&dopf;": "𝕕",
	"&dot;": "˙",
	"&doteq;": "≐",
	"&doteqdot;": "≑",
	"&dotminus;": "∸",
	"&dotplus;": "∔",
	"&dotsquare;": "⊡",
	"&doublebarwedge;": "⌆",
	"&downarrow;": "↓",
	"&downdownarrows;": "⇊",
	"&downharpoonleft;": "⇃",
	"&downharpoonright;": "⇂",
	"&drbkarow;": "⤐",
	"&drcorn;": "⌟",
	"&drcrop;": "⌌",
	"&dscr;": "𝒹",
	"&dscy;": "ѕ",
	"&dsol;": "⧶",
	"&dstrok;": "đ",
	"&dtdot;": "⋱",
	"&dtri;": "▿",
	"&dtrif;": "▾",
	"&duarr;": "⇵",
	"&duhar;": "⥯",
	"&dwangle;": "⦦",
	"&dzcy;": "џ",
	"&dzigrarr;": "⟿",
	"&eDDot;": "⩷",
	"&eDot;": "≑",
	"&eacute": "é",
	"&eacute;": "é",
	"&easter;": "⩮",
	"&ecaron;": "ě",
	"&ecir;": "≖",
	"&ecirc": "ê",
	"&ecirc;": "ê",
	"&ecolon;": "≕",
	"&ecy;": "э",
	"&edot;": "ė",
	"&ee;": "ⅇ",
	"&efDot;": "≒",
	"&efr;": "𝔢",
	"&eg;": "⪚",
	"&egrave": "è",
	"&egrave;": "è",
	"&egs;": "⪖",
	"&egsdot;": "⪘",
	"&el;": "⪙",
	"&elinters;": "⏧",
	"&ell;": "ℓ",
	"&els;": "⪕",
	"&elsdot;": "⪗",
	"&emacr;": "ē",
	"&empty;": "∅",
	"&emptyset;": "∅",
	"&emptyv;": "∅",
	"&emsp13;": " ",
	"&emsp14;": " ",
	"&emsp;": " ",
	"&eng;": "ŋ",
	"&ensp;": " ",
	"&eogon;": "ę",
	"&eopf;": "𝕖",
	"&epar;": "⋕",
	"&eparsl;": "⧣",
	"&eplus;": "⩱",
	"&epsi;": "ε",
	"&epsilon;": "ε",
	"&epsiv;": "ϵ",
	"&eqcirc;": "≖",
	"&eqcolon;": "≕",
	"&eqsim;": "≂",
	"&eqslantgtr;": "⪖",
	"&eqslantless;": "⪕",
	"&equals;": "=",
	"&equest;": "≟",
	"&equiv;": "≡",
	"&equivDD;": "⩸",
	"&eqvparsl;": "⧥",
	"&erDot;": "≓",
	"&erarr;": "⥱",
	"&escr;": "ℯ",
	"&esdot;": "≐",
	"&esim;": "≂",
	"&eta;": "η",
	"&eth": "ð",
	"&eth;": "ð",
	"&euml": "ë",
	"&euml;": "ë",
	"&euro;": "€",
	"&excl;": "!",
	"&exist;": "∃",
	"&expectation;": "ℰ",
	"&exponentiale;": "ⅇ",
	"&fallingdotseq;": "≒",
	"&fcy;": "ф",
	"&female;": "♀",
	"&ffilig;": "ﬃ",
	"&fflig;": "ﬀ",
	"&ffllig;": "ﬄ",
	"&ffr;": "𝔣",
	"&filig;": "ﬁ",
	"&fjlig;": "fj",
	"&flat;": "♭",
	"&fllig;": "ﬂ",
	"&fltns;": "▱",
	"&fnof;": "ƒ",
	"&fopf;": "𝕗",
	"&forall;": "∀",
	"&fork;": "⋔",
	"&forkv;": "⫙",
	"&fpartint;": "⨍",
	"&frac12": "½",
	"&frac12;": "½",
	"&frac13;": "⅓",
	"&frac14": "¼",
	"&frac14;": "¼",
	"&frac15;": "⅕",
	"&frac16;": "⅙",
	"&frac18;": "⅛",
	"&frac23;": "⅔",
	"&frac25;": "⅖",
	"&frac34": "¾",
	"&frac34;": "¾",
	"&frac35;": "⅗",
	"&frac38;": "⅜",
	"&frac45;": "⅘",
	"&frac56;": "⅚",
	"&frac58;": "⅝",
	"&frac78;": "⅞",
	"&frasl;": "⁄",
	"&frown;": "⌢",
	"&fscr;": "𝒻",
	"&gE;": "≧",
	"&gEl;": "⪌",
	"&gacute;": "ǵ",
	"&gamma;": "γ",
	"&gammad;": "ϝ",
	"&gap;": "⪆",
	"&gbreve;": "ğ",
	"&gcirc;": "ĝ",
	"&gcy;": "г",
	"&gdot;": "ġ",
	"&ge;": "≥",
	"&gel;": "⋛",
	"&geq;": "≥",
	"&geqq;": "≧",
	"&geqslant;": "⩾",
	"&ges;": "⩾",
	"&gescc;": "⪩",
	"&gesdot;": "⪀",
	"&gesdoto;": "⪂",
	"&gesdotol;": "⪄",
	"&gesl;": "⋛︀",
	"&gesles;": "⪔",
	"&gfr;": "𝔤",
	"&gg;": "≫",
	"&ggg;": "⋙",
	"&gimel;": "ℷ",
	"&gjcy;": "ѓ",
	"&gl;": "≷",
	"&glE;": "⪒",
	"&gla;": "⪥",
	"&glj;": "⪤",
	"&gnE;": "≩",
	"&gnap;": "⪊",
	"&gnapprox;": "⪊",
	"&gne;": "⪈",
	"&gneq;": "⪈",
	"&gneqq;": "≩",
	"&gnsim;": "⋧",
	"&gopf;": "𝕘",
	"&grave;": "`",
	"&gscr;": "ℊ",
	"&gsim;": "≳",
	"&gsime;": "⪎",
	"&gsiml;": "⪐",
	"&gt": ">",
	"&gt;": ">",
	"&gtcc;": "⪧",
	"&gtcir;": "⩺",
	"&gtdot;": "⋗",
	"&gtlPar;": "⦕",
	"&gtquest;": "⩼",
	"&gtrapprox;": "⪆",
	"&gtrarr;": "⥸",
	"&gtrdot;": "⋗",
	"&gtreqless;": "⋛",
	"&gtreqqless;": "⪌",
	"&gtrless;": "≷",
	"&gtrsim;": "≳",
	"&gvertneqq;": "≩︀",
	"&gvnE;": "≩︀",
	"&hArr;": "⇔",
	"&hairsp;": " ",
	"&half;": "½",
	"&hamilt;": "ℋ",
	"&hardcy;": "ъ",
	"&harr;": "↔",
	"&harrcir;": "⥈",
	"&harrw;": "↭",
	"&hbar;": "ℏ",
	"&hcirc;": "ĥ",
	"&hearts;": "♥",
	"&heartsuit;": "♥",
	"&hellip;": "…",
	"&hercon;": "⊹",
	"&hfr;": "𝔥",
	"&hksearow;": "⤥",
	"&hkswarow;": "⤦",
	"&hoarr;": "⇿",
	"&homtht;": "∻",
	"&hookleftarrow;": "↩",
	"&hookrightarrow;": "↪",
	"&hopf;": "𝕙",
	"&horbar;": "―",
	"&hscr;": "𝒽",
	"&hslash;": "ℏ",
	"&hstrok;": "ħ",
	"&hybull;": "⁃",
	"&hyphen;": "‐",
	"&iacute": "í",
	"&iacute;": "í",
	"&ic;": "⁣",
	"&icirc": "î",
	"&icirc;": "î",
	"&icy;": "и",
	"&iecy;": "е",
	"&iexcl": "¡",
	"&iexcl;": "¡",
	"&iff;": "⇔",
	"&ifr;": "𝔦",
	"&igrave": "ì",
	"&igrave;": "ì",
	"&ii;": "ⅈ",
	"&iiiint;": "⨌",
	"&iiint;": "∭",
	"&iinfin;": "⧜",
	"&iiota;": "℩",
	"&ijlig;": "ĳ",
	"&imacr;": "ī",
	"&image;": "ℑ",
	"&imagline;": "ℐ",
	"&imagpart;": "ℑ",
	"&imath;": "ı",
	"&imof;": "⊷",
	"&imped;": "Ƶ",
	"&in;": "∈",
	"&incare;": "℅",
	"&infin;": "∞",
	"&infintie;": "⧝",
	"&inodot;": "ı",
	"&int;": "∫",
	"&intcal;": "⊺",
	"&integers;": "ℤ",
	"&intercal;": "⊺",
	"&intlarhk;": "⨗",
	"&intprod;": "⨼",
	"&iocy;": "ё",
	"&iogon;": "į",
	"&iopf;": "𝕚",
	"&iota;": "ι",
	"&iprod;": "⨼",
	"&iquest": "¿",
	"&iquest;": "¿",
	"&iscr;": "𝒾",
	"&isin;": "∈",
	"&isinE;": "⋹",
	"&isindot;": "⋵",
	"&isins;": "⋴",
	"&isinsv;": "⋳",
	"&isinv;": "∈",
	"&it;": "⁢",
	"&itilde;": "ĩ",
	"&iukcy;": "і",
	"&iuml": "ï",
	"&iuml;": "ï",
	"&jcirc;": "ĵ",
	"&jcy;": "й",
	"&jfr;": "𝔧",
	"&jmath;": "ȷ",
	"&jopf;": "𝕛",
	"&jscr;": "𝒿",
	"&jsercy;": "ј",
	"&jukcy;": "є",
	"&kappa;": "κ",
	"&kappav;": "ϰ",
	"&kcedil;": "ķ",
	"&kcy;": "к",
	"&kfr;": "𝔨",
	"&kgreen;": "ĸ",
	"&khcy;": "х",
	"&kjcy;": "ќ",
	"&kopf;": "𝕜",
	"&kscr;": "𝓀",
	"&lAarr;": "⇚",
	"&lArr;": "⇐",
	"&lAtail;": "⤛",
	"&lBarr;": "⤎",
	"&lE;": "≦",
	"&lEg;": "⪋",
	"&lHar;": "⥢",
	"&lacute;": "ĺ",
	"&laemptyv;": "⦴",
	"&lagran;": "ℒ",
	"&lambda;": "λ",
	"&lang;": "⟨",
	"&langd;": "⦑",
	"&langle;": "⟨",
	"&lap;": "⪅",
	"&laquo": "«",
	"&laquo;": "«",
	"&larr;": "←",
	"&larrb;": "⇤",
	"&larrbfs;": "⤟",
	"&larrfs;": "⤝",
	"&larrhk;": "↩",
	"&larrlp;": "↫",
	"&larrpl;": "⤹",
	"&larrsim;": "⥳",
	"&larrtl;": "↢",
	"&lat;": "⪫",
	"&latail;": "⤙",
	"&late;": "⪭",
	"&lates;": "⪭︀",
	"&lbarr;": "⤌",
	"&lbbrk;": "❲",
	"&lbrace;": "{",
	"&lbrack;": "[",
	"&lbrke;": "⦋",
	"&lbrksld;": "⦏",
	"&lbrkslu;": "⦍",
	"&lcaron;": "ľ",
	"&lcedil;": "ļ",
	"&lceil;": "⌈",
	"&lcub;": "{",
	"&lcy;": "л",
	"&ldca;": "⤶",
	"&ldquo;": "“",
	"&ldquor;": "„",
	"&ldrdhar;": "⥧",
	"&ldrushar;": "⥋",
	"&ldsh;": "↲",
	"&le;": "≤",
	"&leftarrow;": "←",
	"&leftarrowtail;": "↢",
	"&leftharpoondown;": "↽",
	"&leftharpoonup;": "↼",
	"&leftleftarrows;": "⇇",
	"&leftrightarrow;": "↔",
	"&leftrightarrows;": "⇆",
	"&leftrightharpoons;": "⇋",
	"&leftrightsquigarrow;": "↭",
	"&leftthreetimes;": "⋋",
	"&leg;": "⋚",
	"&leq;": "≤",
	"&leqq;": "≦",
	"&leqslant;": "⩽",
	"&les;": "⩽",
	"&lescc;": "⪨",
	"&lesdot;": "⩿",
	"&lesdoto;": "⪁",
	"&lesdotor;": "⪃",
	"&lesg;": "⋚︀",
	"&lesges;": "⪓",
	"&lessapprox;": "⪅",
	"&lessdot;": "⋖",
	"&lesseqgtr;": "⋚",
	"&lesseqqgtr;": "⪋",
	"&lessgtr;": "≶",
	"&lesssim;": "≲",
	"&lfisht;": "⥼",
	"&lfloor;": "⌊",
	"&lfr;": "𝔩",
	"&lg;": "≶",
	"&lgE;": "⪑",
	"&lhard;": "↽",
	"&lharu;": "↼",
	"&lharul;": "⥪",
	"&lhblk;": "▄",
	"&ljcy;": "љ",
	"&ll;": "≪",
	"&llarr;": "⇇",
	"&llcorner;": "⌞",
	"&llhard;": "⥫",
	"&lltri;": "◺",
	"&lmidot;": "ŀ",
	"&lmoust;": "⎰",
	"&lmoustache;": "⎰",
	"&lnE;": "≨",
	"&lnap;": "⪉",
	"&lnapprox;": "⪉",
	"&lne;": "⪇",
	"&lneq;": "⪇",
	"&lneqq;": "≨",
	"&lnsim;": "⋦",
	"&loang;": "⟬",
	"&loarr;": "⇽",
	"&lobrk;": "⟦",
	"&longleftarrow;": "⟵",
	"&longleftrightarrow;": "⟷",
	"&longmapsto;": "⟼",
	"&longrightarrow;": "⟶",
	"&looparrowleft;": "↫",
	"&looparrowright;": "↬",
	"&lopar;": "⦅",
	"&lopf;": "𝕝",
	"&loplus;": "⨭",
	"&lotimes;": "⨴",
	"&lowast;": "∗",
	"&lowbar;": "_",
	"&loz;": "◊",
	"&lozenge;": "◊",
	"&lozf;": "⧫",
	"&lpar;": "(",
	"&lparlt;": "⦓",
	"&lrarr;": "⇆",
	"&lrcorner;": "⌟",
	"&lrhar;": "⇋",
	"&lrhard;": "⥭",
	"&lrm;": "‎",
	"&lrtri;": "⊿",
	"&lsaquo;": "‹",
	"&lscr;": "𝓁",
	"&lsh;": "↰",
	"&lsim;": "≲",
	"&lsime;": "⪍",
	"&lsimg;": "⪏",
	"&lsqb;": "[",
	"&lsquo;": "‘",
	"&lsquor;": "‚",
	"&lstrok;": "ł",
	"&lt": "<",
	"&lt;": "<",
	"&ltcc;": "⪦",
	"&ltcir;": "⩹",
	"&ltdot;": "⋖",
	"&lthree;": "⋋",
	"&ltimes;": "⋉",
	"&ltlarr;": "⥶",
	"&ltquest;": "⩻",
	"&ltrPar;": "⦖",
	"&ltri;": "◃",
	"&ltrie;": "⊴",
	"&ltrif;": "◂",
	"&lurdshar;": "⥊",
	"&luruhar;": "⥦",
	"&lvertneqq;": "≨︀",
	"&lvnE;": "≨︀",
	"&mDDot;": "∺",
	"&macr": "¯",
	"&macr;": "¯",
	"&male;": "♂",
	"&malt;": "✠",
	"&maltese;": "✠",
	"&map;": "↦",
	"&mapsto;": "↦",
	"&mapstodown;": "↧",
	"&mapstoleft;": "↤",
	"&mapstoup;": "↥",
	"&marker;": "▮",
	"&mcomma;": "⨩",
	"&mcy;": "м",
	"&mdash;": "—",
	"&measuredangle;": "∡",
	"&mfr;": "𝔪",
	"&mho;": "℧",
	"&micro": "µ",
	"&micro;": "µ",
	"&mid;": "∣",
	"&midast;": "*",
	"&midcir;": "⫰",
	"&middot": "·",
	"&middot;": "·",
	"&minus;": "−",
	"&minusb;": "⊟",
	"&minusd;": "∸",
	"&minusdu;": "⨪",
	"&mlcp;": "⫛",
	"&mldr;": "…",
	"&mnplus;": "∓",
	"&models;": "⊧",
	"&mopf;": "𝕞",
	"&mp;": "∓",
	"&mscr;": "𝓂",
	"&mstpos;": "∾",
	"&mu;": "μ",
	"&multimap;": "⊸",
	"&mumap;": "⊸",
	"&nGg;": "⋙̸",
	"&nGt;": "≫⃒",
	"&nGtv;": "≫̸",
	"&nLeftarrow;": "⇍",
	"&nLeftrightarrow;": "⇎",
	"&nLl;": "⋘̸",
	"&nLt;": "≪⃒",
	"&nLtv;": "≪̸",
	"&nRightarrow;": "⇏",
	"&nVDash;": "⊯",
	"&nVdash;": "⊮",
	"&nabla;": "∇",
	"&nacute;": "ń",
	"&nang;": "∠⃒",
	"&nap;": "≉",
	"&napE;": "⩰̸",
	"&napid;": "≋̸",
	"&napos;": "ŉ",
	"&napprox;": "≉",
	"&natur;": "♮",
	"&natural;": "♮",
	"&naturals;": "ℕ",
	"&nbsp": "\xA0",
	"&nbsp;": "\xA0",
	"&nbump;": "≎̸",
	"&nbumpe;": "≏̸",
	"&ncap;": "⩃",
	"&ncaron;": "ň",
	"&ncedil;": "ņ",
	"&ncong;": "≇",
	"&ncongdot;": "⩭̸",
	"&ncup;": "⩂",
	"&ncy;": "н",
	"&ndash;": "–",
	"&ne;": "≠",
	"&neArr;": "⇗",
	"&nearhk;": "⤤",
	"&nearr;": "↗",
	"&nearrow;": "↗",
	"&nedot;": "≐̸",
	"&nequiv;": "≢",
	"&nesear;": "⤨",
	"&nesim;": "≂̸",
	"&nexist;": "∄",
	"&nexists;": "∄",
	"&nfr;": "𝔫",
	"&ngE;": "≧̸",
	"&nge;": "≱",
	"&ngeq;": "≱",
	"&ngeqq;": "≧̸",
	"&ngeqslant;": "⩾̸",
	"&nges;": "⩾̸",
	"&ngsim;": "≵",
	"&ngt;": "≯",
	"&ngtr;": "≯",
	"&nhArr;": "⇎",
	"&nharr;": "↮",
	"&nhpar;": "⫲",
	"&ni;": "∋",
	"&nis;": "⋼",
	"&nisd;": "⋺",
	"&niv;": "∋",
	"&njcy;": "њ",
	"&nlArr;": "⇍",
	"&nlE;": "≦̸",
	"&nlarr;": "↚",
	"&nldr;": "‥",
	"&nle;": "≰",
	"&nleftarrow;": "↚",
	"&nleftrightarrow;": "↮",
	"&nleq;": "≰",
	"&nleqq;": "≦̸",
	"&nleqslant;": "⩽̸",
	"&nles;": "⩽̸",
	"&nless;": "≮",
	"&nlsim;": "≴",
	"&nlt;": "≮",
	"&nltri;": "⋪",
	"&nltrie;": "⋬",
	"&nmid;": "∤",
	"&nopf;": "𝕟",
	"&not": "¬",
	"&not;": "¬",
	"&notin;": "∉",
	"&notinE;": "⋹̸",
	"&notindot;": "⋵̸",
	"&notinva;": "∉",
	"&notinvb;": "⋷",
	"&notinvc;": "⋶",
	"&notni;": "∌",
	"&notniva;": "∌",
	"&notnivb;": "⋾",
	"&notnivc;": "⋽",
	"&npar;": "∦",
	"&nparallel;": "∦",
	"&nparsl;": "⫽⃥",
	"&npart;": "∂̸",
	"&npolint;": "⨔",
	"&npr;": "⊀",
	"&nprcue;": "⋠",
	"&npre;": "⪯̸",
	"&nprec;": "⊀",
	"&npreceq;": "⪯̸",
	"&nrArr;": "⇏",
	"&nrarr;": "↛",
	"&nrarrc;": "⤳̸",
	"&nrarrw;": "↝̸",
	"&nrightarrow;": "↛",
	"&nrtri;": "⋫",
	"&nrtrie;": "⋭",
	"&nsc;": "⊁",
	"&nsccue;": "⋡",
	"&nsce;": "⪰̸",
	"&nscr;": "𝓃",
	"&nshortmid;": "∤",
	"&nshortparallel;": "∦",
	"&nsim;": "≁",
	"&nsime;": "≄",
	"&nsimeq;": "≄",
	"&nsmid;": "∤",
	"&nspar;": "∦",
	"&nsqsube;": "⋢",
	"&nsqsupe;": "⋣",
	"&nsub;": "⊄",
	"&nsubE;": "⫅̸",
	"&nsube;": "⊈",
	"&nsubset;": "⊂⃒",
	"&nsubseteq;": "⊈",
	"&nsubseteqq;": "⫅̸",
	"&nsucc;": "⊁",
	"&nsucceq;": "⪰̸",
	"&nsup;": "⊅",
	"&nsupE;": "⫆̸",
	"&nsupe;": "⊉",
	"&nsupset;": "⊃⃒",
	"&nsupseteq;": "⊉",
	"&nsupseteqq;": "⫆̸",
	"&ntgl;": "≹",
	"&ntilde": "ñ",
	"&ntilde;": "ñ",
	"&ntlg;": "≸",
	"&ntriangleleft;": "⋪",
	"&ntrianglelefteq;": "⋬",
	"&ntriangleright;": "⋫",
	"&ntrianglerighteq;": "⋭",
	"&nu;": "ν",
	"&num;": "#",
	"&numero;": "№",
	"&numsp;": " ",
	"&nvDash;": "⊭",
	"&nvHarr;": "⤄",
	"&nvap;": "≍⃒",
	"&nvdash;": "⊬",
	"&nvge;": "≥⃒",
	"&nvgt;": ">⃒",
	"&nvinfin;": "⧞",
	"&nvlArr;": "⤂",
	"&nvle;": "≤⃒",
	"&nvlt;": "<⃒",
	"&nvltrie;": "⊴⃒",
	"&nvrArr;": "⤃",
	"&nvrtrie;": "⊵⃒",
	"&nvsim;": "∼⃒",
	"&nwArr;": "⇖",
	"&nwarhk;": "⤣",
	"&nwarr;": "↖",
	"&nwarrow;": "↖",
	"&nwnear;": "⤧",
	"&oS;": "Ⓢ",
	"&oacute": "ó",
	"&oacute;": "ó",
	"&oast;": "⊛",
	"&ocir;": "⊚",
	"&ocirc": "ô",
	"&ocirc;": "ô",
	"&ocy;": "о",
	"&odash;": "⊝",
	"&odblac;": "ő",
	"&odiv;": "⨸",
	"&odot;": "⊙",
	"&odsold;": "⦼",
	"&oelig;": "œ",
	"&ofcir;": "⦿",
	"&ofr;": "𝔬",
	"&ogon;": "˛",
	"&ograve": "ò",
	"&ograve;": "ò",
	"&ogt;": "⧁",
	"&ohbar;": "⦵",
	"&ohm;": "Ω",
	"&oint;": "∮",
	"&olarr;": "↺",
	"&olcir;": "⦾",
	"&olcross;": "⦻",
	"&oline;": "‾",
	"&olt;": "⧀",
	"&omacr;": "ō",
	"&omega;": "ω",
	"&omicron;": "ο",
	"&omid;": "⦶",
	"&ominus;": "⊖",
	"&oopf;": "𝕠",
	"&opar;": "⦷",
	"&operp;": "⦹",
	"&oplus;": "⊕",
	"&or;": "∨",
	"&orarr;": "↻",
	"&ord;": "⩝",
	"&order;": "ℴ",
	"&orderof;": "ℴ",
	"&ordf": "ª",
	"&ordf;": "ª",
	"&ordm": "º",
	"&ordm;": "º",
	"&origof;": "⊶",
	"&oror;": "⩖",
	"&orslope;": "⩗",
	"&orv;": "⩛",
	"&oscr;": "ℴ",
	"&oslash": "ø",
	"&oslash;": "ø",
	"&osol;": "⊘",
	"&otilde": "õ",
	"&otilde;": "õ",
	"&otimes;": "⊗",
	"&otimesas;": "⨶",
	"&ouml": "ö",
	"&ouml;": "ö",
	"&ovbar;": "⌽",
	"&par;": "∥",
	"&para": "¶",
	"&para;": "¶",
	"&parallel;": "∥",
	"&parsim;": "⫳",
	"&parsl;": "⫽",
	"&part;": "∂",
	"&pcy;": "п",
	"&percnt;": "%",
	"&period;": ".",
	"&permil;": "‰",
	"&perp;": "⊥",
	"&pertenk;": "‱",
	"&pfr;": "𝔭",
	"&phi;": "φ",
	"&phiv;": "ϕ",
	"&phmmat;": "ℳ",
	"&phone;": "☎",
	"&pi;": "π",
	"&pitchfork;": "⋔",
	"&piv;": "ϖ",
	"&planck;": "ℏ",
	"&planckh;": "ℎ",
	"&plankv;": "ℏ",
	"&plus;": "+",
	"&plusacir;": "⨣",
	"&plusb;": "⊞",
	"&pluscir;": "⨢",
	"&plusdo;": "∔",
	"&plusdu;": "⨥",
	"&pluse;": "⩲",
	"&plusmn": "±",
	"&plusmn;": "±",
	"&plussim;": "⨦",
	"&plustwo;": "⨧",
	"&pm;": "±",
	"&pointint;": "⨕",
	"&popf;": "𝕡",
	"&pound": "£",
	"&pound;": "£",
	"&pr;": "≺",
	"&prE;": "⪳",
	"&prap;": "⪷",
	"&prcue;": "≼",
	"&pre;": "⪯",
	"&prec;": "≺",
	"&precapprox;": "⪷",
	"&preccurlyeq;": "≼",
	"&preceq;": "⪯",
	"&precnapprox;": "⪹",
	"&precneqq;": "⪵",
	"&precnsim;": "⋨",
	"&precsim;": "≾",
	"&prime;": "′",
	"&primes;": "ℙ",
	"&prnE;": "⪵",
	"&prnap;": "⪹",
	"&prnsim;": "⋨",
	"&prod;": "∏",
	"&profalar;": "⌮",
	"&profline;": "⌒",
	"&profsurf;": "⌓",
	"&prop;": "∝",
	"&propto;": "∝",
	"&prsim;": "≾",
	"&prurel;": "⊰",
	"&pscr;": "𝓅",
	"&psi;": "ψ",
	"&puncsp;": " ",
	"&qfr;": "𝔮",
	"&qint;": "⨌",
	"&qopf;": "𝕢",
	"&qprime;": "⁗",
	"&qscr;": "𝓆",
	"&quaternions;": "ℍ",
	"&quatint;": "⨖",
	"&quest;": "?",
	"&questeq;": "≟",
	"&quot": "\"",
	"&quot;": "\"",
	"&rAarr;": "⇛",
	"&rArr;": "⇒",
	"&rAtail;": "⤜",
	"&rBarr;": "⤏",
	"&rHar;": "⥤",
	"&race;": "∽̱",
	"&racute;": "ŕ",
	"&radic;": "√",
	"&raemptyv;": "⦳",
	"&rang;": "⟩",
	"&rangd;": "⦒",
	"&range;": "⦥",
	"&rangle;": "⟩",
	"&raquo": "»",
	"&raquo;": "»",
	"&rarr;": "→",
	"&rarrap;": "⥵",
	"&rarrb;": "⇥",
	"&rarrbfs;": "⤠",
	"&rarrc;": "⤳",
	"&rarrfs;": "⤞",
	"&rarrhk;": "↪",
	"&rarrlp;": "↬",
	"&rarrpl;": "⥅",
	"&rarrsim;": "⥴",
	"&rarrtl;": "↣",
	"&rarrw;": "↝",
	"&ratail;": "⤚",
	"&ratio;": "∶",
	"&rationals;": "ℚ",
	"&rbarr;": "⤍",
	"&rbbrk;": "❳",
	"&rbrace;": "}",
	"&rbrack;": "]",
	"&rbrke;": "⦌",
	"&rbrksld;": "⦎",
	"&rbrkslu;": "⦐",
	"&rcaron;": "ř",
	"&rcedil;": "ŗ",
	"&rceil;": "⌉",
	"&rcub;": "}",
	"&rcy;": "р",
	"&rdca;": "⤷",
	"&rdldhar;": "⥩",
	"&rdquo;": "”",
	"&rdquor;": "”",
	"&rdsh;": "↳",
	"&real;": "ℜ",
	"&realine;": "ℛ",
	"&realpart;": "ℜ",
	"&reals;": "ℝ",
	"&rect;": "▭",
	"&reg": "®",
	"&reg;": "®",
	"&rfisht;": "⥽",
	"&rfloor;": "⌋",
	"&rfr;": "𝔯",
	"&rhard;": "⇁",
	"&rharu;": "⇀",
	"&rharul;": "⥬",
	"&rho;": "ρ",
	"&rhov;": "ϱ",
	"&rightarrow;": "→",
	"&rightarrowtail;": "↣",
	"&rightharpoondown;": "⇁",
	"&rightharpoonup;": "⇀",
	"&rightleftarrows;": "⇄",
	"&rightleftharpoons;": "⇌",
	"&rightrightarrows;": "⇉",
	"&rightsquigarrow;": "↝",
	"&rightthreetimes;": "⋌",
	"&ring;": "˚",
	"&risingdotseq;": "≓",
	"&rlarr;": "⇄",
	"&rlhar;": "⇌",
	"&rlm;": "‏",
	"&rmoust;": "⎱",
	"&rmoustache;": "⎱",
	"&rnmid;": "⫮",
	"&roang;": "⟭",
	"&roarr;": "⇾",
	"&robrk;": "⟧",
	"&ropar;": "⦆",
	"&ropf;": "𝕣",
	"&roplus;": "⨮",
	"&rotimes;": "⨵",
	"&rpar;": ")",
	"&rpargt;": "⦔",
	"&rppolint;": "⨒",
	"&rrarr;": "⇉",
	"&rsaquo;": "›",
	"&rscr;": "𝓇",
	"&rsh;": "↱",
	"&rsqb;": "]",
	"&rsquo;": "’",
	"&rsquor;": "’",
	"&rthree;": "⋌",
	"&rtimes;": "⋊",
	"&rtri;": "▹",
	"&rtrie;": "⊵",
	"&rtrif;": "▸",
	"&rtriltri;": "⧎",
	"&ruluhar;": "⥨",
	"&rx;": "℞",
	"&sacute;": "ś",
	"&sbquo;": "‚",
	"&sc;": "≻",
	"&scE;": "⪴",
	"&scap;": "⪸",
	"&scaron;": "š",
	"&sccue;": "≽",
	"&sce;": "⪰",
	"&scedil;": "ş",
	"&scirc;": "ŝ",
	"&scnE;": "⪶",
	"&scnap;": "⪺",
	"&scnsim;": "⋩",
	"&scpolint;": "⨓",
	"&scsim;": "≿",
	"&scy;": "с",
	"&sdot;": "⋅",
	"&sdotb;": "⊡",
	"&sdote;": "⩦",
	"&seArr;": "⇘",
	"&searhk;": "⤥",
	"&searr;": "↘",
	"&searrow;": "↘",
	"&sect": "§",
	"&sect;": "§",
	"&semi;": ";",
	"&seswar;": "⤩",
	"&setminus;": "∖",
	"&setmn;": "∖",
	"&sext;": "✶",
	"&sfr;": "𝔰",
	"&sfrown;": "⌢",
	"&sharp;": "♯",
	"&shchcy;": "щ",
	"&shcy;": "ш",
	"&shortmid;": "∣",
	"&shortparallel;": "∥",
	"&shy": "­",
	"&shy;": "­",
	"&sigma;": "σ",
	"&sigmaf;": "ς",
	"&sigmav;": "ς",
	"&sim;": "∼",
	"&simdot;": "⩪",
	"&sime;": "≃",
	"&simeq;": "≃",
	"&simg;": "⪞",
	"&simgE;": "⪠",
	"&siml;": "⪝",
	"&simlE;": "⪟",
	"&simne;": "≆",
	"&simplus;": "⨤",
	"&simrarr;": "⥲",
	"&slarr;": "←",
	"&smallsetminus;": "∖",
	"&smashp;": "⨳",
	"&smeparsl;": "⧤",
	"&smid;": "∣",
	"&smile;": "⌣",
	"&smt;": "⪪",
	"&smte;": "⪬",
	"&smtes;": "⪬︀",
	"&softcy;": "ь",
	"&sol;": "/",
	"&solb;": "⧄",
	"&solbar;": "⌿",
	"&sopf;": "𝕤",
	"&spades;": "♠",
	"&spadesuit;": "♠",
	"&spar;": "∥",
	"&sqcap;": "⊓",
	"&sqcaps;": "⊓︀",
	"&sqcup;": "⊔",
	"&sqcups;": "⊔︀",
	"&sqsub;": "⊏",
	"&sqsube;": "⊑",
	"&sqsubset;": "⊏",
	"&sqsubseteq;": "⊑",
	"&sqsup;": "⊐",
	"&sqsupe;": "⊒",
	"&sqsupset;": "⊐",
	"&sqsupseteq;": "⊒",
	"&squ;": "□",
	"&square;": "□",
	"&squarf;": "▪",
	"&squf;": "▪",
	"&srarr;": "→",
	"&sscr;": "𝓈",
	"&ssetmn;": "∖",
	"&ssmile;": "⌣",
	"&sstarf;": "⋆",
	"&star;": "☆",
	"&starf;": "★",
	"&straightepsilon;": "ϵ",
	"&straightphi;": "ϕ",
	"&strns;": "¯",
	"&sub;": "⊂",
	"&subE;": "⫅",
	"&subdot;": "⪽",
	"&sube;": "⊆",
	"&subedot;": "⫃",
	"&submult;": "⫁",
	"&subnE;": "⫋",
	"&subne;": "⊊",
	"&subplus;": "⪿",
	"&subrarr;": "⥹",
	"&subset;": "⊂",
	"&subseteq;": "⊆",
	"&subseteqq;": "⫅",
	"&subsetneq;": "⊊",
	"&subsetneqq;": "⫋",
	"&subsim;": "⫇",
	"&subsub;": "⫕",
	"&subsup;": "⫓",
	"&succ;": "≻",
	"&succapprox;": "⪸",
	"&succcurlyeq;": "≽",
	"&succeq;": "⪰",
	"&succnapprox;": "⪺",
	"&succneqq;": "⪶",
	"&succnsim;": "⋩",
	"&succsim;": "≿",
	"&sum;": "∑",
	"&sung;": "♪",
	"&sup1": "¹",
	"&sup1;": "¹",
	"&sup2": "²",
	"&sup2;": "²",
	"&sup3": "³",
	"&sup3;": "³",
	"&sup;": "⊃",
	"&supE;": "⫆",
	"&supdot;": "⪾",
	"&supdsub;": "⫘",
	"&supe;": "⊇",
	"&supedot;": "⫄",
	"&suphsol;": "⟉",
	"&suphsub;": "⫗",
	"&suplarr;": "⥻",
	"&supmult;": "⫂",
	"&supnE;": "⫌",
	"&supne;": "⊋",
	"&supplus;": "⫀",
	"&supset;": "⊃",
	"&supseteq;": "⊇",
	"&supseteqq;": "⫆",
	"&supsetneq;": "⊋",
	"&supsetneqq;": "⫌",
	"&supsim;": "⫈",
	"&supsub;": "⫔",
	"&supsup;": "⫖",
	"&swArr;": "⇙",
	"&swarhk;": "⤦",
	"&swarr;": "↙",
	"&swarrow;": "↙",
	"&swnwar;": "⤪",
	"&szlig": "ß",
	"&szlig;": "ß",
	"&target;": "⌖",
	"&tau;": "τ",
	"&tbrk;": "⎴",
	"&tcaron;": "ť",
	"&tcedil;": "ţ",
	"&tcy;": "т",
	"&tdot;": "⃛",
	"&telrec;": "⌕",
	"&tfr;": "𝔱",
	"&there4;": "∴",
	"&therefore;": "∴",
	"&theta;": "θ",
	"&thetasym;": "ϑ",
	"&thetav;": "ϑ",
	"&thickapprox;": "≈",
	"&thicksim;": "∼",
	"&thinsp;": " ",
	"&thkap;": "≈",
	"&thksim;": "∼",
	"&thorn": "þ",
	"&thorn;": "þ",
	"&tilde;": "˜",
	"&times": "×",
	"&times;": "×",
	"&timesb;": "⊠",
	"&timesbar;": "⨱",
	"&timesd;": "⨰",
	"&tint;": "∭",
	"&toea;": "⤨",
	"&top;": "⊤",
	"&topbot;": "⌶",
	"&topcir;": "⫱",
	"&topf;": "𝕥",
	"&topfork;": "⫚",
	"&tosa;": "⤩",
	"&tprime;": "‴",
	"&trade;": "™",
	"&triangle;": "▵",
	"&triangledown;": "▿",
	"&triangleleft;": "◃",
	"&trianglelefteq;": "⊴",
	"&triangleq;": "≜",
	"&triangleright;": "▹",
	"&trianglerighteq;": "⊵",
	"&tridot;": "◬",
	"&trie;": "≜",
	"&triminus;": "⨺",
	"&triplus;": "⨹",
	"&trisb;": "⧍",
	"&tritime;": "⨻",
	"&trpezium;": "⏢",
	"&tscr;": "𝓉",
	"&tscy;": "ц",
	"&tshcy;": "ћ",
	"&tstrok;": "ŧ",
	"&twixt;": "≬",
	"&twoheadleftarrow;": "↞",
	"&twoheadrightarrow;": "↠",
	"&uArr;": "⇑",
	"&uHar;": "⥣",
	"&uacute": "ú",
	"&uacute;": "ú",
	"&uarr;": "↑",
	"&ubrcy;": "ў",
	"&ubreve;": "ŭ",
	"&ucirc": "û",
	"&ucirc;": "û",
	"&ucy;": "у",
	"&udarr;": "⇅",
	"&udblac;": "ű",
	"&udhar;": "⥮",
	"&ufisht;": "⥾",
	"&ufr;": "𝔲",
	"&ugrave": "ù",
	"&ugrave;": "ù",
	"&uharl;": "↿",
	"&uharr;": "↾",
	"&uhblk;": "▀",
	"&ulcorn;": "⌜",
	"&ulcorner;": "⌜",
	"&ulcrop;": "⌏",
	"&ultri;": "◸",
	"&umacr;": "ū",
	"&uml": "¨",
	"&uml;": "¨",
	"&uogon;": "ų",
	"&uopf;": "𝕦",
	"&uparrow;": "↑",
	"&updownarrow;": "↕",
	"&upharpoonleft;": "↿",
	"&upharpoonright;": "↾",
	"&uplus;": "⊎",
	"&upsi;": "υ",
	"&upsih;": "ϒ",
	"&upsilon;": "υ",
	"&upuparrows;": "⇈",
	"&urcorn;": "⌝",
	"&urcorner;": "⌝",
	"&urcrop;": "⌎",
	"&uring;": "ů",
	"&urtri;": "◹",
	"&uscr;": "𝓊",
	"&utdot;": "⋰",
	"&utilde;": "ũ",
	"&utri;": "▵",
	"&utrif;": "▴",
	"&uuarr;": "⇈",
	"&uuml": "ü",
	"&uuml;": "ü",
	"&uwangle;": "⦧",
	"&vArr;": "⇕",
	"&vBar;": "⫨",
	"&vBarv;": "⫩",
	"&vDash;": "⊨",
	"&vangrt;": "⦜",
	"&varepsilon;": "ϵ",
	"&varkappa;": "ϰ",
	"&varnothing;": "∅",
	"&varphi;": "ϕ",
	"&varpi;": "ϖ",
	"&varpropto;": "∝",
	"&varr;": "↕",
	"&varrho;": "ϱ",
	"&varsigma;": "ς",
	"&varsubsetneq;": "⊊︀",
	"&varsubsetneqq;": "⫋︀",
	"&varsupsetneq;": "⊋︀",
	"&varsupsetneqq;": "⫌︀",
	"&vartheta;": "ϑ",
	"&vartriangleleft;": "⊲",
	"&vartriangleright;": "⊳",
	"&vcy;": "в",
	"&vdash;": "⊢",
	"&vee;": "∨",
	"&veebar;": "⊻",
	"&veeeq;": "≚",
	"&vellip;": "⋮",
	"&verbar;": "|",
	"&vert;": "|",
	"&vfr;": "𝔳",
	"&vltri;": "⊲",
	"&vnsub;": "⊂⃒",
	"&vnsup;": "⊃⃒",
	"&vopf;": "𝕧",
	"&vprop;": "∝",
	"&vrtri;": "⊳",
	"&vscr;": "𝓋",
	"&vsubnE;": "⫋︀",
	"&vsubne;": "⊊︀",
	"&vsupnE;": "⫌︀",
	"&vsupne;": "⊋︀",
	"&vzigzag;": "⦚",
	"&wcirc;": "ŵ",
	"&wedbar;": "⩟",
	"&wedge;": "∧",
	"&wedgeq;": "≙",
	"&weierp;": "℘",
	"&wfr;": "𝔴",
	"&wopf;": "𝕨",
	"&wp;": "℘",
	"&wr;": "≀",
	"&wreath;": "≀",
	"&wscr;": "𝓌",
	"&xcap;": "⋂",
	"&xcirc;": "◯",
	"&xcup;": "⋃",
	"&xdtri;": "▽",
	"&xfr;": "𝔵",
	"&xhArr;": "⟺",
	"&xharr;": "⟷",
	"&xi;": "ξ",
	"&xlArr;": "⟸",
	"&xlarr;": "⟵",
	"&xmap;": "⟼",
	"&xnis;": "⋻",
	"&xodot;": "⨀",
	"&xopf;": "𝕩",
	"&xoplus;": "⨁",
	"&xotime;": "⨂",
	"&xrArr;": "⟹",
	"&xrarr;": "⟶",
	"&xscr;": "𝓍",
	"&xsqcup;": "⨆",
	"&xuplus;": "⨄",
	"&xutri;": "△",
	"&xvee;": "⋁",
	"&xwedge;": "⋀",
	"&yacute": "ý",
	"&yacute;": "ý",
	"&yacy;": "я",
	"&ycirc;": "ŷ",
	"&ycy;": "ы",
	"&yen": "¥",
	"&yen;": "¥",
	"&yfr;": "𝔶",
	"&yicy;": "ї",
	"&yopf;": "𝕪",
	"&yscr;": "𝓎",
	"&yucy;": "ю",
	"&yuml": "ÿ",
	"&yuml;": "ÿ",
	"&zacute;": "ź",
	"&zcaron;": "ž",
	"&zcy;": "з",
	"&zdot;": "ż",
	"&zeetrf;": "ℨ",
	"&zeta;": "ζ",
	"&zfr;": "𝔷",
	"&zhcy;": "ж",
	"&zigrarr;": "⇝",
	"&zopf;": "𝕫",
	"&zscr;": "𝓏",
	"&zwj;": "‍",
	"&zwnj;": "‌"
};
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/text-format.js
function decodeHTMLEntities(str) {
	return str.replace(/&(#\d+|#x[a-f0-9]+|[a-z]+\d*);?/gi, (match, entity) => {
		if (typeof htmlEntities[match] === "string") return htmlEntities[match];
		if (entity.charAt(0) !== "#" || match.charAt(match.length - 1) !== ";") return match;
		let codePoint;
		if (entity.charAt(1) === "x") codePoint = parseInt(entity.substr(2), 16);
		else codePoint = parseInt(entity.substr(1), 10);
		let output = "";
		if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) return "�";
		if (codePoint > 65535) {
			codePoint -= 65536;
			output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
			codePoint = 56320 | codePoint & 1023;
		}
		output += String.fromCharCode(codePoint);
		return output;
	});
}
function escapeHtml(str) {
	return str.trim().replace(/[<>"'?&]/g, (c) => {
		let hex = c.charCodeAt(0).toString(16);
		if (hex.length < 2) hex = "0" + hex;
		return "&#x" + hex.toUpperCase() + ";";
	});
}
function textToHtml(str) {
	return "<div>" + escapeHtml(str).replace(/\n/g, "<br />") + "</div>";
}
function htmlToText(str) {
	str = str.replace(/\r?\n/g, "").replace(/<\!\-\-.*?\-\->/gi, " ").replace(/<br\b[^>]*>/gi, "\n").replace(/<\/?(p|div|table|tr|td|th)\b[^>]*>/gi, "\n\n").replace(/<script\b[^>]*>.*?<\/script\b[^>]*>/gi, " ").replace(/^.*<body\b[^>]*>/i, "").replace(/^.*<\/head\b[^>]*>/i, "").replace(/^.*<\!doctype\b[^>]*>/i, "").replace(/<\/body\b[^>]*>.*$/i, "").replace(/<\/html\b[^>]*>.*$/i, "").replace(/<a\b[^>]*href\s*=\s*["']?([^\s"']+)[^>]*>/gi, " ($1) ").replace(/<\/?(span|em|i|strong|b|u|a)\b[^>]*>/gi, "").replace(/<li\b[^>]*>[\n\u0001\s]*/gi, "* ").replace(/<hr\b[^>]*>/g, "\n-------------\n").replace(/<[^>]*>/g, " ").replace(/\u0001/g, "\n").replace(/[ \t]+/g, " ").replace(/^\s+$/gm, "").replace(/\n\n+/g, "\n\n").replace(/^\n+/, "\n").replace(/\n+$/, "\n");
	str = decodeHTMLEntities(str);
	return str;
}
function formatTextAddress(address) {
	return [].concat(address.name || []).concat(address.name ? `<${address.address}>` : address.address).join(" ");
}
function formatTextAddresses(addresses) {
	let parts = [];
	let processAddress = (address, partCounter) => {
		if (partCounter) parts.push(", ");
		if (address.group) {
			let groupStart = `${address.name}:`;
			let groupEnd = `;`;
			parts.push(groupStart);
			address.group.forEach(processAddress);
			parts.push(groupEnd);
		} else parts.push(formatTextAddress(address));
	};
	addresses.forEach(processAddress);
	return parts.join("");
}
function formatHtmlAddress(address) {
	return `<a href="mailto:${escapeHtml(address.address)}" class="postal-email-address">${escapeHtml(address.name || `<${address.address}>`)}</a>`;
}
function formatHtmlAddresses(addresses) {
	let parts = [];
	let processAddress = (address, partCounter) => {
		if (partCounter) parts.push("<span class=\"postal-email-address-separator\">, </span>");
		if (address.group) {
			let groupStart = `<span class="postal-email-address-group">${escapeHtml(address.name)}:</span>`;
			let groupEnd = `<span class="postal-email-address-group">;</span>`;
			parts.push(groupStart);
			address.group.forEach(processAddress);
			parts.push(groupEnd);
		} else parts.push(formatHtmlAddress(address));
	};
	addresses.forEach(processAddress);
	return parts.join(" ");
}
function foldLines(str, lineLength, afterSpace) {
	str = (str || "").toString();
	lineLength = lineLength || 76;
	let pos = 0, len = str.length, result = "", line, match;
	while (pos < len) {
		line = str.substr(pos, lineLength);
		if (line.length < lineLength) {
			result += line;
			break;
		}
		if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
			line = match[0];
			result += line;
			pos += line.length;
			continue;
		} else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (afterSpace ? (match[1] || "").length : 0) < line.length) line = line.substr(0, line.length - (match[0].length - (afterSpace ? (match[1] || "").length : 0)));
		else if (match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || "").length : 0));
		result += line;
		pos += line.length;
		if (pos < len) result += "\r\n";
	}
	return result;
}
function formatTextHeader(message) {
	let rows = [];
	if (message.from) rows.push({
		key: "From",
		val: formatTextAddress(message.from)
	});
	if (message.subject) rows.push({
		key: "Subject",
		val: message.subject
	});
	if (message.date) {
		let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hour12: false
		}).format(new Date(message.date));
		rows.push({
			key: "Date",
			val: dateStr
		});
	}
	if (message.to && message.to.length) rows.push({
		key: "To",
		val: formatTextAddresses(message.to)
	});
	if (message.cc && message.cc.length) rows.push({
		key: "Cc",
		val: formatTextAddresses(message.cc)
	});
	if (message.bcc && message.bcc.length) rows.push({
		key: "Bcc",
		val: formatTextAddresses(message.bcc)
	});
	let maxKeyLength = rows.map((r) => r.key.length).reduce((acc, cur) => {
		return cur > acc ? cur : acc;
	}, 0);
	rows = rows.flatMap((row) => {
		let sepLen = maxKeyLength - row.key.length;
		let prefix = `${row.key}: ${" ".repeat(sepLen)}`;
		let emptyPrefix = `${" ".repeat(row.key.length + 1)} ${" ".repeat(sepLen)}`;
		return foldLines(row.val, 80, true).split(/\r?\n/).map((line) => line.trim()).map((line, i) => `${i ? emptyPrefix : prefix}${line}`);
	});
	let maxLineLength = rows.map((r) => r.length).reduce((acc, cur) => {
		return cur > acc ? cur : acc;
	}, 0);
	let lineMarker = "-".repeat(maxLineLength);
	return `
${lineMarker}
${rows.join("\n")}
${lineMarker}
`;
}
function formatHtmlHeader(message) {
	let rows = [];
	if (message.from) rows.push(`<div class="postal-email-header-key">From</div><div class="postal-email-header-value">${formatHtmlAddress(message.from)}</div>`);
	if (message.subject) rows.push(`<div class="postal-email-header-key">Subject</div><div class="postal-email-header-value postal-email-header-subject">${escapeHtml(message.subject)}</div>`);
	if (message.date) {
		let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hour12: false
		}).format(new Date(message.date));
		rows.push(`<div class="postal-email-header-key">Date</div><div class="postal-email-header-value postal-email-header-date" data-date="${escapeHtml(message.date)}">${escapeHtml(dateStr)}</div>`);
	}
	if (message.to && message.to.length) rows.push(`<div class="postal-email-header-key">To</div><div class="postal-email-header-value">${formatHtmlAddresses(message.to)}</div>`);
	if (message.cc && message.cc.length) rows.push(`<div class="postal-email-header-key">Cc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.cc)}</div>`);
	if (message.bcc && message.bcc.length) rows.push(`<div class="postal-email-header-key">Bcc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.bcc)}</div>`);
	return `<div class="postal-email-header">${rows.length ? "<div class=\"postal-email-header-row\">" : ""}${rows.join("</div>\n<div class=\"postal-email-header-row\">")}${rows.length ? "</div>" : ""}</div>`;
}
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/address-parser.js
/**
* Converts tokens for a single address into an address object
*
* @param {Array} tokens Tokens object
* @param {Number} depth Current recursion depth for nested group protection
* @return {Object} Address object
*/
function _handleAddress(tokens, depth) {
	let isGroup = false;
	let state = "text";
	let address;
	let addresses = [];
	let data = {
		address: [],
		comment: [],
		group: [],
		text: [],
		textWasQuoted: []
	};
	let i;
	let len;
	let insideQuotes = false;
	for (i = 0, len = tokens.length; i < len; i++) {
		let token = tokens[i];
		let prevToken = i ? tokens[i - 1] : null;
		if (token.type === "operator") switch (token.value) {
			case "<":
				state = "address";
				insideQuotes = false;
				break;
			case "(":
				state = "comment";
				insideQuotes = false;
				break;
			case ":":
				state = "group";
				isGroup = true;
				insideQuotes = false;
				break;
			case "\"":
				insideQuotes = !insideQuotes;
				state = "text";
				break;
			default:
				state = "text";
				insideQuotes = false;
				break;
		}
		else if (token.value) {
			if (state === "address") token.value = token.value.replace(/^[^<]*<\s*/, "");
			if (prevToken && prevToken.noBreak && data[state].length) {
				data[state][data[state].length - 1] += token.value;
				if (state === "text" && insideQuotes) data.textWasQuoted[data.textWasQuoted.length - 1] = true;
			} else {
				data[state].push(token.value);
				if (state === "text") data.textWasQuoted.push(insideQuotes);
			}
		}
	}
	if (!data.text.length && data.comment.length) {
		data.text = data.comment;
		data.comment = [];
	}
	if (isGroup) {
		data.text = data.text.join(" ");
		let groupMembers = [];
		if (data.group.length) addressParser(data.group.join(","), { _depth: depth + 1 }).forEach((member) => {
			if (member.group) groupMembers = groupMembers.concat(member.group);
			else groupMembers.push(member);
		});
		addresses.push({
			name: decodeWords(data.text || address && address.name),
			group: groupMembers
		});
	} else {
		if (!data.address.length && data.text.length) {
			for (i = data.text.length - 1; i >= 0; i--) if (!data.textWasQuoted[i] && data.text[i].match(/^[^@\s]+@[^@\s]+$/)) {
				data.address = data.text.splice(i, 1);
				data.textWasQuoted.splice(i, 1);
				break;
			}
			let _regexHandler = function(address) {
				if (!data.address.length) {
					data.address = [address.trim()];
					return " ";
				} else return address;
			};
			if (!data.address.length) {
				for (i = data.text.length - 1; i >= 0; i--) if (!data.textWasQuoted[i]) {
					data.text[i] = data.text[i].replace(/\s*\b[^@\s]+@[^\s]+\b\s*/, _regexHandler).trim();
					if (data.address.length) break;
				}
			}
		}
		if (!data.text.length && data.comment.length) {
			data.text = data.comment;
			data.comment = [];
		}
		if (data.address.length > 1) data.text = data.text.concat(data.address.splice(1));
		data.text = data.text.join(" ");
		data.address = data.address.join(" ");
		if (!data.address && /^=\?[^=]+?=$/.test(data.text.trim())) {
			const decodedText = decodeWords(data.text);
			if (/<[^<>]+@[^<>]+>/.test(decodedText)) {
				const parsedSubAddresses = addressParser(decodedText);
				if (parsedSubAddresses && parsedSubAddresses.length) return parsedSubAddresses;
			}
			return [{
				address: "",
				name: decodedText
			}];
		}
		address = {
			address: data.address || data.text || "",
			name: decodeWords(data.text || data.address || "")
		};
		if (address.address === address.name) if ((address.address || "").match(/@/)) address.name = "";
		else address.address = "";
		addresses.push(address);
	}
	return addresses;
}
/**
* Creates a Tokenizer object for tokenizing address field strings
*
* @constructor
* @param {String} str Address field string
*/
var Tokenizer = class {
	constructor(str) {
		this.str = (str || "").toString();
		this.operatorCurrent = "";
		this.operatorExpecting = "";
		this.node = null;
		this.escaped = false;
		this.list = [];
		/**
		* Operator tokens and which tokens are expected to end the sequence
		*/
		this.operators = {
			"\"": "\"",
			"(": ")",
			"<": ">",
			",": "",
			":": ";",
			";": ""
		};
	}
	/**
	* Tokenizes the original input string
	*
	* @return {Array} An array of operator|text tokens
	*/
	tokenize() {
		let list = [];
		for (let i = 0, len = this.str.length; i < len; i++) {
			let chr = this.str.charAt(i);
			let nextChr = i < len - 1 ? this.str.charAt(i + 1) : null;
			this.checkChar(chr, nextChr);
		}
		this.list.forEach((node) => {
			node.value = (node.value || "").toString().trim();
			if (node.value) list.push(node);
		});
		return list;
	}
	/**
	* Checks if a character is an operator or text and acts accordingly
	*
	* @param {String} chr Character from the address field
	*/
	checkChar(chr, nextChr) {
		if (this.escaped) {} else if (chr === this.operatorExpecting) {
			this.node = {
				type: "operator",
				value: chr
			};
			if (nextChr && ![
				" ",
				"	",
				"\r",
				"\n",
				",",
				";"
			].includes(nextChr)) this.node.noBreak = true;
			this.list.push(this.node);
			this.node = null;
			this.operatorExpecting = "";
			this.escaped = false;
			return;
		} else if (!this.operatorExpecting && chr in this.operators) {
			this.node = {
				type: "operator",
				value: chr
			};
			this.list.push(this.node);
			this.node = null;
			this.operatorExpecting = this.operators[chr];
			this.escaped = false;
			return;
		} else if (this.operatorExpecting === "\"" && chr === "\\") {
			this.escaped = true;
			return;
		}
		if (!this.node) {
			this.node = {
				type: "text",
				value: ""
			};
			this.list.push(this.node);
		}
		if (chr === "\n") chr = " ";
		if (chr.charCodeAt(0) >= 33 || [" ", "	"].includes(chr)) this.node.value += chr;
		this.escaped = false;
	}
};
/**
* Maximum recursion depth for parsing nested groups.
* RFC 5322 doesn't allow nested groups, so this is a safeguard against
* malicious input that could cause stack overflow.
*/
var MAX_NESTED_GROUP_DEPTH = 50;
/**
* Parses structured e-mail addresses from an address field
*
* Example:
*
*    'Name <address@domain>'
*
* will be converted to
*
*     [{name: 'Name', address: 'address@domain'}]
*
* @param {String} str Address field
* @param {Object} options Optional options object
* @param {Number} options._depth Internal recursion depth counter (do not set manually)
* @return {Array} An array of address objects
*/
function addressParser(str, options) {
	options = options || {};
	let depth = options._depth || 0;
	if (depth > MAX_NESTED_GROUP_DEPTH) return [];
	let tokens = new Tokenizer(str).tokenize();
	let addresses = [];
	let address = [];
	let parsedAddresses = [];
	tokens.forEach((token) => {
		if (token.type === "operator" && (token.value === "," || token.value === ";")) {
			if (address.length) addresses.push(address);
			address = [];
		} else address.push(token);
	});
	if (address.length) addresses.push(address);
	addresses.forEach((address) => {
		address = _handleAddress(address, depth);
		if (address.length) parsedAddresses = parsedAddresses.concat(address);
	});
	if (options.flatten) {
		let addresses = [];
		let walkAddressList = (list) => {
			list.forEach((address) => {
				if (address.group) return walkAddressList(address.group);
				else addresses.push(address);
			});
		};
		walkAddressList(parsedAddresses);
		return addresses;
	}
	return parsedAddresses;
}
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/base64-encoder.js
function base64ArrayBuffer(arrayBuffer) {
	var base64 = "";
	var encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var bytes = new Uint8Array(arrayBuffer);
	var byteLength = bytes.byteLength;
	var byteRemainder = byteLength % 3;
	var mainLength = byteLength - byteRemainder;
	var a, b, c, d;
	var chunk;
	for (var i = 0; i < mainLength; i = i + 3) {
		chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
		a = (chunk & 16515072) >> 18;
		b = (chunk & 258048) >> 12;
		c = (chunk & 4032) >> 6;
		d = chunk & 63;
		base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
	}
	if (byteRemainder == 1) {
		chunk = bytes[mainLength];
		a = (chunk & 252) >> 2;
		b = (chunk & 3) << 4;
		base64 += encodings[a] + encodings[b] + "==";
	} else if (byteRemainder == 2) {
		chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
		a = (chunk & 64512) >> 10;
		b = (chunk & 1008) >> 4;
		c = (chunk & 15) << 2;
		base64 += encodings[a] + encodings[b] + encodings[c] + "=";
	}
	return base64;
}
//#endregion
//#region node_modules/.pnpm/postal-mime@2.7.4/node_modules/postal-mime/src/postal-mime.js
var MAX_NESTING_DEPTH = 256;
var MAX_HEADERS_SIZE = 2 * 1024 * 1024;
function toCamelCase(key) {
	return key.replace(/-(.)/g, (o, c) => c.toUpperCase());
}
var PostalMime = class PostalMime {
	static parse(buf, options) {
		return new PostalMime(options).parse(buf);
	}
	constructor(options) {
		this.options = options || {};
		this.mimeOptions = {
			maxNestingDepth: this.options.maxNestingDepth || MAX_NESTING_DEPTH,
			maxHeadersSize: this.options.maxHeadersSize || MAX_HEADERS_SIZE
		};
		this.root = this.currentNode = new MimeNode({
			postalMime: this,
			...this.mimeOptions
		});
		this.boundaries = [];
		this.textContent = {};
		this.attachments = [];
		this.attachmentEncoding = (this.options.attachmentEncoding || "").toString().replace(/[-_\s]/g, "").trim().toLowerCase() || "arraybuffer";
		this.started = false;
	}
	async finalize() {
		await this.root.finalize();
	}
	async processLine(line, isFinal) {
		let boundaries = this.boundaries;
		if (boundaries.length && line.length > 2 && line[0] === 45 && line[1] === 45) for (let i = boundaries.length - 1; i >= 0; i--) {
			let boundary = boundaries[i];
			if (line.length < boundary.value.length + 2) continue;
			let boundaryMatches = true;
			for (let j = 0; j < boundary.value.length; j++) if (line[j + 2] !== boundary.value[j]) {
				boundaryMatches = false;
				break;
			}
			if (!boundaryMatches) continue;
			let boundaryEnd = boundary.value.length + 2;
			let isTerminator = false;
			if (line.length >= boundary.value.length + 4 && line[boundary.value.length + 2] === 45 && line[boundary.value.length + 3] === 45) {
				isTerminator = true;
				boundaryEnd = boundary.value.length + 4;
			}
			let hasValidTrailing = true;
			for (let j = boundaryEnd; j < line.length; j++) if (line[j] !== 32 && line[j] !== 9) {
				hasValidTrailing = false;
				break;
			}
			if (!hasValidTrailing) continue;
			if (isTerminator) {
				await boundary.node.finalize();
				this.currentNode = boundary.node.parentNode || this.root;
			} else {
				await boundary.node.finalizeChildNodes();
				this.currentNode = new MimeNode({
					postalMime: this,
					parentNode: boundary.node,
					parentMultipartType: boundary.node.contentType.multipart,
					...this.mimeOptions
				});
			}
			if (isFinal) return this.finalize();
			return;
		}
		this.currentNode.feed(line);
		if (isFinal) return this.finalize();
	}
	readLine() {
		let startPos = this.readPos;
		let endPos = this.readPos;
		while (this.readPos < this.av.length) {
			const c = this.av[this.readPos++];
			if (c !== 13 && c !== 10) endPos = this.readPos;
			if (c === 10) return {
				bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
				done: this.readPos >= this.av.length
			};
		}
		return {
			bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
			done: this.readPos >= this.av.length
		};
	}
	async processNodeTree() {
		let textContent = {};
		let textTypes = /* @__PURE__ */ new Set();
		let textMap = this.textMap = /* @__PURE__ */ new Map();
		let forceRfc822Attachments = this.forceRfc822Attachments();
		let walk = async (node, alternative, related) => {
			alternative = alternative || false;
			related = related || false;
			if (!node.contentType.multipart) {
				if (this.isInlineMessageRfc822(node) && !forceRfc822Attachments) {
					const subParser = new PostalMime();
					node.subMessage = await subParser.parse(node.content);
					if (!textMap.has(node)) textMap.set(node, {});
					let textEntry = textMap.get(node);
					if (node.subMessage.text || !node.subMessage.html) {
						textEntry.plain = textEntry.plain || [];
						textEntry.plain.push({
							type: "subMessage",
							value: node.subMessage
						});
						textTypes.add("plain");
					}
					if (node.subMessage.html) {
						textEntry.html = textEntry.html || [];
						textEntry.html.push({
							type: "subMessage",
							value: node.subMessage
						});
						textTypes.add("html");
					}
					if (subParser.textMap) subParser.textMap.forEach((subTextEntry, subTextNode) => {
						textMap.set(subTextNode, subTextEntry);
					});
					for (let attachment of node.subMessage.attachments || []) this.attachments.push(attachment);
				} else if (this.isInlineTextNode(node)) {
					let textType = node.contentType.parsed.value.substr(node.contentType.parsed.value.indexOf("/") + 1);
					let selectorNode = alternative || node;
					if (!textMap.has(selectorNode)) textMap.set(selectorNode, {});
					let textEntry = textMap.get(selectorNode);
					textEntry[textType] = textEntry[textType] || [];
					textEntry[textType].push({
						type: "text",
						value: node.getTextContent()
					});
					textTypes.add(textType);
				} else if (node.content) {
					const filename = node.contentDisposition?.parsed?.params?.filename || node.contentType.parsed.params.name || null;
					const attachment = {
						filename: filename ? decodeWords(filename) : null,
						mimeType: node.contentType.parsed.value,
						disposition: node.contentDisposition?.parsed?.value || null
					};
					if (related && node.contentId) attachment.related = true;
					if (node.contentDescription) attachment.description = node.contentDescription;
					if (node.contentId) attachment.contentId = node.contentId;
					switch (node.contentType.parsed.value) {
						case "text/calendar":
						case "application/ics": {
							if (node.contentType.parsed.params.method) attachment.method = node.contentType.parsed.params.method.toString().toUpperCase().trim();
							const decodedText = node.getTextContent().replace(/\r?\n/g, "\n").replace(/\n*$/, "\n");
							attachment.content = textEncoder.encode(decodedText);
							break;
						}
						default: attachment.content = node.content;
					}
					this.attachments.push(attachment);
				}
			} else if (node.contentType.multipart === "alternative") alternative = node;
			else if (node.contentType.multipart === "related") related = node;
			for (let childNode of node.childNodes) await walk(childNode, alternative, related);
		};
		await walk(this.root, false, false);
		textMap.forEach((mapEntry) => {
			textTypes.forEach((textType) => {
				if (!textContent[textType]) textContent[textType] = [];
				if (mapEntry[textType]) mapEntry[textType].forEach((textEntry) => {
					switch (textEntry.type) {
						case "text":
							textContent[textType].push(textEntry.value);
							break;
						case "subMessage":
							switch (textType) {
								case "html":
									textContent[textType].push(formatHtmlHeader(textEntry.value));
									break;
								case "plain":
									textContent[textType].push(formatTextHeader(textEntry.value));
									break;
							}
							break;
					}
				});
				else {
					let alternativeType;
					switch (textType) {
						case "html":
							alternativeType = "plain";
							break;
						case "plain":
							alternativeType = "html";
							break;
					}
					(mapEntry[alternativeType] || []).forEach((textEntry) => {
						switch (textEntry.type) {
							case "text":
								switch (textType) {
									case "html":
										textContent[textType].push(textToHtml(textEntry.value));
										break;
									case "plain":
										textContent[textType].push(htmlToText(textEntry.value));
										break;
								}
								break;
							case "subMessage":
								switch (textType) {
									case "html":
										textContent[textType].push(formatHtmlHeader(textEntry.value));
										break;
									case "plain":
										textContent[textType].push(formatTextHeader(textEntry.value));
										break;
								}
								break;
						}
					});
				}
			});
		});
		Object.keys(textContent).forEach((textType) => {
			textContent[textType] = textContent[textType].join("\n");
		});
		this.textContent = textContent;
	}
	isInlineTextNode(node) {
		if (node.contentDisposition?.parsed?.value === "attachment") return false;
		switch (node.contentType.parsed?.value) {
			case "text/html":
			case "text/plain": return true;
			default: return false;
		}
	}
	isInlineMessageRfc822(node) {
		if (node.contentType.parsed?.value !== "message/rfc822") return false;
		return (node.contentDisposition?.parsed?.value || (this.options.rfc822Attachments ? "attachment" : "inline")) === "inline";
	}
	forceRfc822Attachments() {
		if (this.options.forceRfc822Attachments) return true;
		let forceRfc822Attachments = false;
		let walk = (node) => {
			if (!node.contentType.multipart) {
				if (node.contentType.parsed && ["message/delivery-status", "message/feedback-report"].includes(node.contentType.parsed.value)) forceRfc822Attachments = true;
			}
			for (let childNode of node.childNodes) walk(childNode);
		};
		walk(this.root);
		return forceRfc822Attachments;
	}
	async resolveStream(stream) {
		let chunkLen = 0;
		let chunks = [];
		const reader = stream.getReader();
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(value);
			chunkLen += value.length;
		}
		const result = new Uint8Array(chunkLen);
		let chunkPointer = 0;
		for (let chunk of chunks) {
			result.set(chunk, chunkPointer);
			chunkPointer += chunk.length;
		}
		return result;
	}
	async parse(buf) {
		if (this.started) throw new Error("Can not reuse parser, create a new PostalMime object");
		this.started = true;
		if (buf && typeof buf.getReader === "function") buf = await this.resolveStream(buf);
		buf = buf || /* @__PURE__ */ new ArrayBuffer(0);
		if (typeof buf === "string") buf = textEncoder.encode(buf);
		if (buf instanceof Blob || Object.prototype.toString.call(buf) === "[object Blob]") buf = await blobToArrayBuffer(buf);
		if (buf.buffer instanceof ArrayBuffer) buf = new Uint8Array(buf).buffer;
		this.buf = buf;
		this.av = new Uint8Array(buf);
		this.readPos = 0;
		while (this.readPos < this.av.length) {
			const line = this.readLine();
			await this.processLine(line.bytes, line.done);
		}
		await this.processNodeTree();
		const message = { headers: this.root.headers.map((entry) => ({
			key: entry.key,
			originalKey: entry.originalKey,
			value: entry.value
		})).reverse() };
		for (const key of ["from", "sender"]) {
			const addressHeader = this.root.headers.find((line) => line.key === key);
			if (addressHeader && addressHeader.value) {
				const addresses = addressParser(addressHeader.value);
				if (addresses && addresses.length) message[key] = addresses[0];
			}
		}
		for (const key of ["delivered-to", "return-path"]) {
			const addressHeader = this.root.headers.find((line) => line.key === key);
			if (addressHeader && addressHeader.value) {
				const addresses = addressParser(addressHeader.value);
				if (addresses && addresses.length && addresses[0].address) {
					const camelKey = toCamelCase(key);
					message[camelKey] = addresses[0].address;
				}
			}
		}
		for (const key of [
			"to",
			"cc",
			"bcc",
			"reply-to"
		]) {
			const addressHeaders = this.root.headers.filter((line) => line.key === key);
			let addresses = [];
			addressHeaders.filter((entry) => entry && entry.value).map((entry) => addressParser(entry.value)).forEach((parsed) => addresses = addresses.concat(parsed || []));
			if (addresses && addresses.length) {
				const camelKey = toCamelCase(key);
				message[camelKey] = addresses;
			}
		}
		for (const key of [
			"subject",
			"message-id",
			"in-reply-to",
			"references"
		]) {
			const header = this.root.headers.find((line) => line.key === key);
			if (header && header.value) {
				const camelKey = toCamelCase(key);
				message[camelKey] = decodeWords(header.value);
			}
		}
		let dateHeader = this.root.headers.find((line) => line.key === "date");
		if (dateHeader) {
			let date = new Date(dateHeader.value);
			if (date.toString() === "Invalid Date") date = dateHeader.value;
			else date = date.toISOString();
			message.date = date;
		}
		if (this.textContent?.html) message.html = this.textContent.html;
		if (this.textContent?.plain) message.text = this.textContent.plain;
		message.attachments = this.attachments;
		message.headerLines = (this.root.rawHeaderLines || []).slice().reverse();
		switch (this.attachmentEncoding) {
			case "arraybuffer": break;
			case "base64":
				for (let attachment of message.attachments || []) if (attachment?.content) {
					attachment.content = base64ArrayBuffer(attachment.content);
					attachment.encoding = "base64";
				}
				break;
			case "utf8":
				let attachmentDecoder = new TextDecoder("utf8");
				for (let attachment of message.attachments || []) if (attachment?.content) {
					attachment.content = attachmentDecoder.decode(attachment.content);
					attachment.encoding = "utf8";
				}
				break;
			default: throw new Error("Unknown attachment encoding");
		}
		return message;
	}
};
//#endregion
//#region worker/db/schema.ts
var schema_exports = /* @__PURE__ */ __exportAll({
	accounts: () => accounts,
	attachments: () => attachments,
	emails: () => emails
});
var accounts = sqliteTable("accounts", {
	id: text("id").primaryKey(),
	email: text("email").notNull(),
	remark: text("remark"),
	sort_order: integer("sort_order").notNull().default(0)
});
var emails = sqliteTable("emails", {
	id: text("id").primaryKey(),
	account_id: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
	subject: text("subject"),
	from_name: text("from_name"),
	from_address: text("from_address"),
	delivered_to: text("delivered_to"),
	recipient: text("recipient"),
	cc: text("cc"),
	bcc: text("bcc"),
	sent_at: integer("sent_at"),
	body: text("body"),
	raw_headers: text("raw_headers"),
	read: integer("read").notNull().default(0)
});
var attachments = sqliteTable("attachments", {
	id: text("id").primaryKey(),
	email_id: text("email_id").notNull().references(() => emails.id, { onDelete: "cascade" }),
	object_key: text("object_key").notNull(),
	filename: text("filename").notNull(),
	mimetype: text("mimetype").notNull(),
	size: integer("size").notNull(),
	content_id: text("content_id"),
	disposition: text("disposition")
});
//#endregion
//#region worker/email/recv.ts
function normalizeEmail(value) {
	return value.trim().toLowerCase();
}
function uniqueStrings(values) {
	const seen = /* @__PURE__ */ new Set();
	const result = [];
	for (const value of values) {
		if (!value || seen.has(value)) continue;
		seen.add(value);
		result.push(value);
	}
	return result;
}
function headerValue(headers, name) {
	return headers.get(name)?.trim() || null;
}
function extractEmailAddresses(value) {
	if (!value) return [];
	return uniqueStrings((value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map(normalizeEmail));
}
function formatAddressList(value) {
	const formatted = (!value ? [] : Array.isArray(value) ? value : [value]).map((item) => {
		const address = item.address?.trim();
		const name = item.name?.trim();
		if (name && address) return `${name} <${address}>`;
		return address || name || "";
	}).filter(Boolean);
	return formatted.length > 0 ? formatted.join(", ") : null;
}
function attachmentSize(content) {
	if (!content) return 0;
	if (typeof content === "string") return new TextEncoder().encode(content).byteLength;
	if (content instanceof ArrayBuffer) return content.byteLength;
	if (ArrayBuffer.isView(content)) return content.byteLength;
	return 0;
}
function sanitizeFilename(value) {
	const trimmed = value?.trim() || "untitled";
	let sanitized = "";
	for (const char of trimmed) {
		const code = char.charCodeAt(0);
		sanitized += code <= 31 || char === "/" || char === "\\" || char === ":" || char === "*" || char === "?" || char === "\"" || char === "<" || char === ">" || char === "|" ? "_" : char;
	}
	return sanitized;
}
function normalizeEmailSentAt(value) {
	const sentAt = value ? new Date(value).getTime() : Date.now();
	return Math.floor((Number.isNaN(sentAt) ? Date.now() : sentAt) / 1e3);
}
function errorSummary(error) {
	if (error instanceof Error) return {
		name: error.name,
		message: error.message,
		stack: error.stack
	};
	return {
		name: typeof error,
		message: String(error)
	};
}
function getAccountCandidates(message, parsed) {
	let emails = extractEmailAddresses(headerValue(message.headers, "duck-original-to"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "x-original-to"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "original-recipient"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "x-github-recipient-address"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "destinations"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "resent-to"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "to"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(formatAddressList(parsed.to));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(message.to);
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(parsed.deliveredTo || null);
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "delivered-to"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "x-forwarded-to"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "x-envelope-to"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "cc"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(headerValue(message.headers, "bcc"));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(formatAddressList(parsed.cc));
	if (emails.length > 0) return emails;
	emails = extractEmailAddresses(formatAddressList(parsed.bcc));
	if (emails.length > 0) return emails;
	return [];
}
async function emailHandler(message, env, ctx) {
	try {
		if (message.rawSize <= 0) throw new Error(`Invalid email size: ${message.rawSize}`);
		if (message.rawSize > 25 * 1024 * 1024) throw new Error(`Email too large: ${message.rawSize}`);
		const reader = message.raw.getReader();
		let content = "";
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			content += new TextDecoder().decode(value);
		}
		const parsed = await PostalMime.parse(content);
		const db = drizzle(env.DB, { schema: schema_exports });
		const candidateEmails = getAccountCandidates(message, parsed);
		if (candidateEmails.length === 0) {
			message.setReject("Failed to determine forwarded account for this email.");
			return;
		}
		const matchedAccounts = await db.select({
			id: accounts.id,
			email: accounts.email
		}).from(accounts).where(inArray(accounts.email, candidateEmails)).all();
		let matchedAccount = null;
		for (const candidateEmail of candidateEmails) {
			const account = matchedAccounts.find((item) => item.email === candidateEmail);
			if (!account) continue;
			matchedAccount = account;
			break;
		}
		if (!matchedAccount) {
			const accountEmail = candidateEmails[0];
			const accountId = crypto.randomUUID();
			const nextSortOrder = (await db.select({ value: sql`COALESCE(MAX(${accounts.sort_order}), -1) + 1` }).from(accounts).get())?.value ?? 0;
			matchedAccount = ((await db.insert(accounts).values({
				id: accountId,
				email: accountEmail,
				remark: accountEmail,
				sort_order: nextSortOrder
			}).onConflictDoNothing({ target: accounts.email }).run()).meta?.changes || 0) > 0 ? {
				id: accountId,
				email: accountEmail
			} : await db.select({
				id: accounts.id,
				email: accounts.email
			}).from(accounts).where(eq(accounts.email, accountEmail)).get();
		}
		if (!matchedAccount) {
			message.setReject("Failed to load forwarded account for this email.");
			return;
		}
		const emailId = crypto.randomUUID();
		const fromItems = !parsed.from ? [] : Array.isArray(parsed.from) ? parsed.from : [parsed.from];
		const fromAddress = fromItems.find((item) => item.address?.trim())?.address?.trim();
		const normalizedFromAddress = fromAddress ? normalizeEmail(fromAddress) : null;
		const fromName = fromItems.find((item) => item.name?.trim())?.name?.trim() || (normalizedFromAddress ? normalizedFromAddress.split("@")[0] : null);
		const uploadedKeys = [];
		const attachmentRows = [];
		for (const attachment of parsed.attachments || []) {
			const attachmentId = crypto.randomUUID();
			const filename = sanitizeFilename(attachment.filename);
			const mimetype = attachment.mimeType?.trim() || "application/octet-stream";
			const objectKey = `attachments/${matchedAccount.id}/${emailId}/${attachmentId}/${filename}`;
			await env.ATTACHMENTS.put(objectKey, attachment.content || "", { httpMetadata: { contentType: mimetype } });
			uploadedKeys.push(objectKey);
			attachmentRows.push({
				id: attachmentId,
				email_id: emailId,
				object_key: objectKey,
				filename,
				mimetype,
				size: attachmentSize(attachment.content),
				content_id: attachment.contentId?.trim() || null,
				disposition: attachment.disposition?.trim() || null
			});
		}
		const emailValues = {
			id: emailId,
			account_id: matchedAccount.id,
			subject: parsed.subject?.trim() || null,
			from_name: fromName,
			from_address: normalizedFromAddress,
			delivered_to: matchedAccount.email,
			recipient: headerValue(message.headers, "to") || formatAddressList(parsed.to),
			cc: headerValue(message.headers, "cc") || formatAddressList(parsed.cc),
			bcc: headerValue(message.headers, "bcc") || formatAddressList(parsed.bcc),
			sent_at: normalizeEmailSentAt(headerValue(message.headers, "date")),
			body: parsed.html || parsed.text || null,
			raw_headers: JSON.stringify(Array.from(message.headers.entries())),
			read: 0
		};
		let insertedEmail = false;
		try {
			await db.insert(emails).values(emailValues).run();
			insertedEmail = true;
			if (attachmentRows.length > 0) await db.insert(attachments).values(attachmentRows).run();
		} catch (error) {
			if (insertedEmail) try {
				await db.delete(emails).where(eq(emails.id, emailId)).run();
			} catch {}
			if (uploadedKeys.length > 0) try {
				await env.ATTACHMENTS.delete(uploadedKeys);
			} catch {}
			throw error;
		}
	} catch (error) {
		console.error("邮件接收失败", {
			envelopeFrom: message.from || null,
			envelopeTo: message.to || null,
			rawSize: message.rawSize,
			error: errorSummary(error)
		});
		message.setReject("Failed to process inbound email.");
	}
}
//#endregion
//#region worker/route/account.ts
var accountRoutes = new Hono();
accountRoutes.get("/", async (c) => {
	const items = await drizzle(c.env.DB, { schema: schema_exports }).select().from(accounts).orderBy(asc(accounts.sort_order), asc(accounts.id)).all();
	return c.json({ items });
});
accountRoutes.get("/:id", async (c) => {
	const item = await drizzle(c.env.DB, { schema: schema_exports }).select().from(accounts).where(eq(accounts.id, c.req.param("id"))).get();
	if (!item) return c.json({ error: "Account not found." }, 404);
	return c.json({ item });
});
accountRoutes.put("/sort", async (c) => {
	const items = (await c.req.json()).map((item) => ({
		id: item.id.trim(),
		sort_order: item.sort_order
	}));
	if (items.length === 0) return c.json({ items: [] });
	const ids = /* @__PURE__ */ new Set();
	for (const item of items) {
		if (!Number.isInteger(item.sort_order)) return c.json({ error: "Invalid account sort_order." }, 400);
		if (ids.has(item.id)) return c.json({ error: "Duplicate account sort id." }, 400);
		ids.add(item.id);
	}
	const db = drizzle(c.env.DB, { schema: schema_exports });
	const rows = await db.select({ id: accounts.id }).from(accounts).where(inArray(accounts.id, items.map((item) => item.id))).all();
	if (rows.length !== items.length) {
		const existingIds = new Set(rows.map((row) => row.id));
		return c.json({
			error: "Some accounts were not found.",
			ids: items.filter((item) => !existingIds.has(item.id)).map((item) => item.id)
		}, 404);
	}
	for (const item of items) await db.update(accounts).set({ sort_order: item.sort_order }).where(eq(accounts.id, item.id)).run();
	return c.json({ items: await db.select().from(accounts).where(inArray(accounts.id, items.map((item) => item.id))).orderBy(asc(accounts.sort_order), asc(accounts.id)).all() });
});
accountRoutes.put("/:id", async (c) => {
	const id = c.req.param("id");
	const body = await c.req.json();
	const db = drizzle(c.env.DB, { schema: schema_exports });
	await db.update(accounts).set({ remark: body.remark?.trim() || null }).where(eq(accounts.id, id)).run();
	const item = await db.select().from(accounts).where(eq(accounts.id, id)).get();
	if (!item) return c.json({ error: "Account not found." }, 404);
	return c.json({ item });
});
accountRoutes.delete("/:id", async (c) => {
	const db = drizzle(c.env.DB, { schema: schema_exports });
	const accountId = c.req.param("id");
	if (!await db.select().from(accounts).where(eq(accounts.id, accountId)).get()) return c.json({ error: "Account not found." }, 404);
	const attachmentRows = await db.select({ object_key: attachments.object_key }).from(attachments).innerJoin(emails, eq(attachments.email_id, emails.id)).where(eq(emails.account_id, accountId)).all();
	await db.delete(accounts).where(eq(accounts.id, accountId)).run();
	const objectKeys = new Set(attachmentRows.map((row) => row.object_key));
	try {
		let cursor;
		for (;;) {
			const page = await c.env.ATTACHMENTS.list({
				prefix: `attachments/${accountId}/`,
				cursor
			});
			for (const object of page.objects) objectKeys.add(object.key);
			if (!page.truncated) break;
			cursor = page.cursor;
		}
		const keys = [...objectKeys];
		for (let index = 0; index < keys.length; index += 1e3) await c.env.ATTACHMENTS.delete(keys.slice(index, index + 1e3));
	} catch (error) {
		console.error("删除账号后清理 R2 失败", {
			id: accountId,
			objectKeys: [...objectKeys],
			error
		});
	}
	return c.json({
		ok: true,
		deleted_id: accountId
	});
});
//#endregion
//#region worker/route/auth.ts
var authRoutes = new Hono();
authRoutes.get("/", async (c) => {
	if (await getSignedCookie(c, c.env.SECRET, "auth") !== "1") return c.json({ error: "Unauthorized." }, 401);
	return c.json({ ok: true });
});
authRoutes.post("/", async (c) => {
	const body = await c.req.json();
	if (body.secret !== c.env.SECRET) return c.json({ error: "Invalid SECRET." }, 401);
	await setSignedCookie(c, "auth", "1", c.env.SECRET, {
		httpOnly: true,
		path: "/api",
		sameSite: "Lax",
		secure: new URL(c.req.url).protocol === "https:",
		...body.trusted === true ? { maxAge: 3600 * 24 * 400 } : { maxAge: 600 }
	});
	return c.json({ ok: true });
});
//#endregion
//#region worker/route/email.ts
var emailRoutes = new Hono();
async function getEmailRecord(db, id) {
	const row = await db.select({
		email: emails,
		account: accounts
	}).from(emails).innerJoin(accounts, eq(emails.account_id, accounts.id)).where(eq(emails.id, id)).get();
	if (!row) return null;
	return {
		...row.email,
		snippet: row.email.body ? row.email.body.replace(/\s+/g, " ").trim().slice(0, 160) || null : null,
		account: row.account
	};
}
emailRoutes.get("/", async (c) => {
	const cursorValue = c.req.query("cursor");
	const cursor = cursorValue ? Number.parseInt(cursorValue, 10) : null;
	const accountId = c.req.query("account_id") || null;
	const keyword = c.req.query("q")?.trim() || null;
	if (cursorValue && (!Number.isInteger(cursor) || !cursor || cursor <= 0)) return c.json({ error: "Invalid email list cursor." }, 400);
	const conditions = [];
	if (accountId) conditions.push(eq(emails.account_id, accountId));
	if (cursor) conditions.push(sql`emails.rowid < ${cursor}`);
	if (keyword) {
		const search = or(like(emails.subject, `%${keyword}%`), like(emails.from_name, `%${keyword}%`), like(emails.from_address, `%${keyword}%`), like(emails.recipient, `%${keyword}%`));
		if (search) conditions.push(search);
	}
	const rows = await drizzle(c.env.DB, { schema: schema_exports }).select({
		cursor: sql`emails.rowid`,
		id: emails.id,
		from_name: emails.from_name,
		sent_at: emails.sent_at,
		subject: emails.subject,
		read: emails.read
	}).from(emails).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(sql`emails.rowid`), desc(emails.id)).limit(41).all();
	const hasMore = rows.length > 40;
	const page = hasMore ? rows.slice(0, 40) : rows;
	const nextCursor = hasMore ? String(page[page.length - 1].cursor) : null;
	return c.json({
		items: page.map((email) => ({
			id: email.id,
			from_name: email.from_name,
			sent_at: email.sent_at,
			subject: email.subject,
			read: email.read
		})),
		next_cursor: nextCursor,
		has_more: hasMore
	});
});
emailRoutes.get("/:id/attachments/:attachmentId", async (c) => {
	const emailId = c.req.param("id");
	const attachmentId = c.req.param("attachmentId");
	const attachment = await drizzle(c.env.DB, { schema: schema_exports }).select().from(attachments).where(and(eq(attachments.id, attachmentId), eq(attachments.email_id, emailId))).get();
	if (!attachment) return c.json({ error: "Attachment not found." }, 404);
	const object = await c.env.ATTACHMENTS.get(attachment.object_key);
	if (!object?.body) return c.json({ error: "Attachment file not found." }, 404);
	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("content-length", String(attachment.size));
	headers.set("etag", object.httpEtag);
	headers.set("content-disposition", `${attachment.disposition === "inline" ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`);
	return new Response(object.body, { headers });
});
emailRoutes.get("/:id", async (c) => {
	const db = drizzle(c.env.DB, { schema: schema_exports });
	const item = await getEmailRecord(db, c.req.param("id"));
	if (!item) return c.json({ error: "Email not found." }, 404);
	const attachments$1 = await db.select().from(attachments).where(eq(attachments.email_id, c.req.param("id"))).all();
	return c.json({ item: {
		...item,
		attachments: attachments$1
	} });
});
emailRoutes.patch("/:id/read", async (c) => {
	const id = c.req.param("id");
	const body = await c.req.json();
	if (body.read !== 0 && body.read !== 1) return c.json({ error: "Invalid email read flag." }, 400);
	const db = drizzle(c.env.DB, { schema: schema_exports });
	await db.update(emails).set({ read: body.read }).where(eq(emails.id, id)).run();
	const item = await getEmailRecord(db, id);
	if (!item) return c.json({ error: "Email not found." }, 404);
	return c.json({ item });
});
emailRoutes.delete("/", async (c) => {
	const ids = [...new Set((await c.req.json()).ids.map((id) => id.trim()).filter(Boolean))];
	if (ids.length === 0) return c.json({ error: "Email ids are required." }, 400);
	const db = drizzle(c.env.DB, { schema: schema_exports });
	const attachmentRows = await db.select({ object_key: attachments.object_key }).from(attachments).where(inArray(attachments.email_id, ids)).all();
	const deleted = await db.delete(emails).where(inArray(emails.id, ids)).run();
	if (attachmentRows.length > 0) try {
		await c.env.ATTACHMENTS.delete(attachmentRows.map((row) => row.object_key));
	} catch (error) {
		console.error("批量删除邮件后清理 R2 失败", {
			ids,
			error
		});
	}
	return c.json({
		ok: true,
		deleted_count: deleted.meta?.changes || 0
	});
});
emailRoutes.delete("/:id", async (c) => {
	const db = drizzle(c.env.DB, { schema: schema_exports });
	const emailId = c.req.param("id");
	if (!await db.select().from(emails).where(eq(emails.id, emailId)).get()) return c.json({ error: "Email not found." }, 404);
	const attachmentRows = await db.select({ object_key: attachments.object_key }).from(attachments).where(eq(attachments.email_id, emailId)).all();
	await db.delete(emails).where(eq(emails.id, emailId)).run();
	if (attachmentRows.length > 0) try {
		await c.env.ATTACHMENTS.delete(attachmentRows.map((row) => row.object_key));
	} catch (error) {
		console.error("删除邮件后清理 R2 失败", {
			id: emailId,
			error
		});
	}
	return c.json({
		ok: true,
		deleted_count: 1
	});
});
//#endregion
//#region worker/route/stats.ts
var statsRoutes = new Hono();
statsRoutes.get("/", async (c) => {
	const todayStart = Number(c.req.query("today_start"));
	if (!Number.isInteger(todayStart) || todayStart <= 0) return c.json({ error: "Invalid stats today_start." }, 400);
	const start = todayStart - 6 * 86400;
	const [summary, dailyResult] = await Promise.all([c.env.DB.prepare(`
			SELECT
				(SELECT COUNT(*) FROM emails) AS total_email_count,
				(SELECT COUNT(*) FROM accounts) AS total_account_count,
				(SELECT COUNT(*) FROM emails WHERE read = 0) AS unread_email_count
		`).first(), c.env.DB.prepare(`
			SELECT
				CAST((sent_at - ?) / 86400 AS INTEGER) AS day_index,
				COUNT(*) AS count
			FROM emails
			WHERE sent_at >= ? AND sent_at < ?
			GROUP BY day_index
			ORDER BY day_index ASC
		`).bind(start, start, todayStart + 86400).all()]);
	const dailyReceivedCounts = [
		0,
		0,
		0,
		0,
		0,
		0,
		0
	];
	for (const row of dailyResult.results || []) dailyReceivedCounts[row.day_index] = row.count;
	return c.json({
		total_email_count: summary?.total_email_count ?? 0,
		total_account_count: summary?.total_account_count ?? 0,
		unread_email_count: summary?.unread_email_count ?? 0,
		daily_received_counts: dailyReceivedCounts
	});
});
//#endregion
//#region worker/index.ts
var app = new Hono();
app.route("/api/auth", authRoutes);
app.use("/api/*", async (c, next) => {
	if (c.req.path === "/api/auth" || c.req.path === "/api/auth/") return next();
	if (await getSignedCookie(c, c.env.SECRET, "auth") === "1") return next();
	return c.json({ error: "Unauthorized." }, 401);
});
app.route("/api/accounts", accountRoutes);
app.route("/api/emails", emailRoutes);
app.route("/api/stats", statsRoutes);
//#endregion
//#region \0virtual:cloudflare/worker-entry
var worker_entry_default = {
	fetch: app.fetch,
	email: emailHandler
};
//#endregion
export { worker_entry_default as default };
