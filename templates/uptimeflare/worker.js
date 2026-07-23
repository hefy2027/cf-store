// src/index.ts
import { DurableObject } from "cloudflare:workers";

// ../uptime.config.ts
var workerConfig = {
  // Define all your monitors here
  monitors: [
    // Example HTTP Monitor
    {
      // `id` should be unique, history will be kept if the `id` remains constant
      id: "foo_monitor",
      // `name` is used at status page and callback message
      name: "My API Monitor",
      // `method` should be a valid HTTP Method
      method: "GET",
      // `target` is a valid URL
      target: "https://example.com",
      // [OPTIONAL] `tooltip` is ONLY used at status page to show a tooltip
      tooltip: "This is a tooltip for this monitor",
      // [OPTIONAL] `statusPageLink` is ONLY used for clickable link at status page
      statusPageLink: "https://example.com",
      // [OPTIONAL] `expectedCodes` is an array of acceptable HTTP response codes, if not specified, default to 2xx
      expectedCodes: [200],
      // [OPTIONAL] `timeout` in millisecond, if not specified, default to 10000
      timeout: 1e4,
      // [OPTIONAL] headers to be sent
      headers: {
        "User-Agent": "Uptimeflare",
        Authorization: "Bearer YOUR_TOKEN_HERE"
      }
      // [OPTIONAL] body to be sent (require POST/PUT/PATCH method)
      // body: 'Hello, world!',
      // [OPTIONAL] if specified, the response must contains the keyword to be considered as operational.
      // responseKeyword: 'success',
      // [OPTIONAL] if specified, the response must NOT contains the keyword to be considered as operational.
      // responseForbiddenKeyword: 'bad gateway',
      // [OPTIONAL] if specified, will call the check proxy to check the monitor, mainly for geo-specific checks
      // refer to docs https://github.com/lyc8503/UptimeFlare/wiki/Check-proxy-setup before setting this value
      // currently supports `worker://`, `globalping://` and `http(s)://` proxies
      // checkProxy: 'worker://weur',
      // [OPTIONAL] if true, the check will fallback to local if the specified proxy is down
      // checkProxyFallback: true,
    },
    // Example TCP Monitor
    {
      id: "test_tcp_monitor",
      name: "Example TCP Monitor",
      // `method` should be `TCP_PING` for tcp monitors
      method: "TCP_PING",
      // `target` should be `host:port` for tcp monitors
      target: "1.2.3.4:22",
      tooltip: "My production server SSH",
      statusPageLink: "https://example.com",
      timeout: 5e3
    }
  ],
  // [Optional] Notification settings
  notification: {
    // [Optional] Notification webhook settings, if not specified, no notification will be sent
    // More info at Wiki: https://github.com/lyc8503/UptimeFlare/wiki/Setup-notification
    webhook: {
      // [Required] webhook URL (example: Telegram Bot API)
      url: "https://api.telegram.org/bot123456:ABCDEF/sendMessage",
      // [Optional] HTTP method, default to 'GET' for payloadType=param, 'POST' otherwise
      // method: 'POST',
      // [Optional] headers to be sent
      // headers: {
      //   foo: 'bar',
      // },
      // [Required] Specify how to encode the payload
      // Should be one of 'param', 'json' or 'x-www-form-urlencoded'
      // 'param': append url-encoded payload to URL search parameters
      // 'json': POST json payload as body, set content-type header to 'application/json'
      // 'x-www-form-urlencoded': POST url-encoded payload as body, set content-type header to 'x-www-form-urlencoded'
      payloadType: "x-www-form-urlencoded",
      // [Required] payload to be sent
      // $MSG will be replaced with the human-readable notification message
      payload: {
        chat_id: 12345678,
        text: "$MSG"
      },
      // [Optional] timeout calling this webhook, in millisecond, default to 5000
      timeout: 1e4
    },
    // [Optional] timezone used in notification messages, default to "Etc/GMT"
    timeZone: "Asia/Shanghai",
    // [Optional] grace period in minutes before sending a notification
    // notification will be sent only if the monitor is down for N continuous checks after the initial failure
    // if not specified, notification will be sent immediately
    gracePeriod: 5
  }
};
var maintenances = [
  {
    // [Optional] Monitor IDs to be affected by this maintenance
    monitors: ["foo_monitor", "bar_monitor"],
    // [Optional] default to "Scheduled Maintenance" if not specified
    title: "Test Maintenance",
    // Description of the maintenance, will be shown at status page
    body: "This is a test maintenance, server software upgrade",
    // Start time of the maintenance, in UNIX timestamp or ISO 8601 format
    start: "2020-01-01T00:00:00+08:00",
    // [Optional] end time of the maintenance, in UNIX timestamp or ISO 8601 format
    // if not specified, the maintenance will be considered as on-going
    end: "2050-01-01T00:00:00+08:00",
    // [Optional] color of the maintenance alert at status page, default to "yellow"
    color: "blue"
  }
];

// src/util.ts
async function getWorkerLocation() {
  const res = await fetch("https://cloudflare.com/cdn-cgi/trace");
  const text = await res.text();
  const colo = /^colo=(.*)$/m.exec(text)?.[1];
  return colo;
}
var fetchTimeout = (url, ms, { signal, ...options } = {}) => {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (signal) signal.addEventListener("abort", () => controller.abort());
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
};
function withTimeout(millis, promise) {
  const timeout = new Promise(
    (resolve, reject) => setTimeout(() => reject(new Error(`Promise timed out after ${millis}ms`)), millis)
  );
  return Promise.race([promise, timeout]);
}
function formatStatusChangeNotification(monitor, isUp, timeIncidentStart, timeNow, reason, timeZone) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone
  });
  let downtimeDuration = Math.round((timeNow - timeIncidentStart) / 60);
  const timeNowFormatted = dateFormatter.format(new Date(timeNow * 1e3));
  const timeIncidentStartFormatted = dateFormatter.format(new Date(timeIncidentStart * 1e3));
  if (isUp) {
    return `\u2705 ${monitor.name} is up! 
The service is up again after being down for ${downtimeDuration} minutes.`;
  } else if (timeNow == timeIncidentStart) {
    return `\u{1F534} ${monitor.name} is currently down. 
Service is unavailable at ${timeNowFormatted}. 
Issue: ${reason || "unspecified"}`;
  } else {
    return `\u{1F534} ${monitor.name} is still down. 
Service is unavailable since ${timeIncidentStartFormatted} (${downtimeDuration} minutes). 
Issue: ${reason || "unspecified"}`;
  }
}
function templateWebhookPlayload(payload, message) {
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      if (payload[key] === "$MSG") {
        payload[key] = message;
      } else if (typeof payload[key] === "object" && payload[key] !== null) {
        templateWebhookPlayload(payload[key], message);
      }
    }
  }
}
async function webhookNotify(webhook, message) {
  if (Array.isArray(webhook)) {
    for (const w of webhook) {
      await webhookNotify(w, message);
    }
    return;
  }
  console.log(
    "Sending webhook notification: " + JSON.stringify(message) + " to webhook " + webhook.url
  );
  try {
    let url = webhook.url;
    let method = webhook.method;
    let headers = new Headers(webhook.headers);
    let payloadTemplated = JSON.parse(
      JSON.stringify(webhook.payload)
    );
    templateWebhookPlayload(payloadTemplated, message);
    let body = void 0;
    switch (webhook.payloadType) {
      case "param":
        method = method ?? "GET";
        const urlTmp = new URL(url);
        for (const [k, v] of Object.entries(payloadTemplated)) {
          urlTmp.searchParams.append(k, v.toString());
        }
        url = urlTmp.toString();
        break;
      case "json":
        method = method ?? "POST";
        if (headers.get("content-type") === null) {
          headers.set("content-type", "application/json");
        }
        body = JSON.stringify(payloadTemplated);
        break;
      case "x-www-form-urlencoded":
        method = method ?? "POST";
        if (headers.get("content-type") === null) {
          headers.set("content-type", "application/x-www-form-urlencoded");
        }
        body = new URLSearchParams(payloadTemplated).toString();
        break;
      default:
        throw "Unrecognized payload type: " + webhook.payloadType;
    }
    console.log(
      `Webhook finalized parameters: ${method} ${url}, headers ${JSON.stringify(
        Object.fromEntries(headers.entries())
      )}, body ${JSON.stringify(body)}`
    );
    const resp = await fetchTimeout(url, webhook.timeout ?? 5e3, { method, headers, body });
    if (!resp.ok) {
      console.log(
        "Error calling webhook server, code: " + resp.status + ", response: " + await resp.text()
      );
    } else {
      console.log("Webhook notification sent successfully, code: " + resp.status);
    }
  } catch (e) {
    console.log("Error calling webhook server: " + e);
  }
}
var formatAndNotify = async (monitor, isUp, timeIncidentStart, timeNow, reason) => {
  const skipList = workerConfig.notification?.skipNotificationIds;
  if (skipList && skipList.includes(monitor.id)) {
    console.log(`Skipping notification for ${monitor.name} (${monitor.id} in skipNotificationIds)`);
    return;
  }
  const maintenanceList = maintenances.filter(
    (m) => new Date(timeNow * 1e3) >= new Date(m.start) && (!m.end || new Date(timeNow * 1e3) <= new Date(m.end))
  ).map((e) => e.monitors || []).flat();
  if (maintenanceList.includes(monitor.id)) {
    console.log(`Skipping notification for ${monitor.name} (in maintenance)`);
    return;
  }
  if (workerConfig.notification?.webhook) {
    const notification = formatStatusChangeNotification(
      monitor,
      isUp,
      timeIncidentStart,
      timeNow,
      reason,
      workerConfig.notification?.timeZone ?? "Etc/GMT"
    );
    await webhookNotify(workerConfig.notification.webhook, notification);
  } else {
    console.log(`Webhook not set, skipping notification for ${monitor.name}`);
  }
};

// src/monitor.ts
function isIpAddress(hostname) {
  if (hostname.includes(":")) return true;
  const parts = hostname.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const value = Number(part);
    return value >= 0 && value <= 255;
  });
}
function getDomainOnlyIpVersionOption(hostname, gpUrl) {
  if (isIpAddress(hostname)) return {};
  return { ipVersion: Number(gpUrl.searchParams.get("ipVersion") || 4) };
}
async function httpResponseBasicCheck(monitor, code, bodyReader) {
  if (monitor.expectedCodes) {
    if (!monitor.expectedCodes.includes(code)) {
      return `Expected codes: ${JSON.stringify(monitor.expectedCodes)}, Got: ${code}`;
    }
  } else {
    if (code < 200 || code > 299) {
      return `Expected codes: 2xx, Got: ${code}`;
    }
  }
  if (monitor.responseKeyword || monitor.responseForbiddenKeyword) {
    const responseBody = await bodyReader();
    if (monitor.responseKeyword && !responseBody.includes(monitor.responseKeyword)) {
      console.log(
        `${monitor.name} expected keyword ${monitor.responseKeyword}, not found in response (truncated to 100 chars): ${responseBody.slice(0, 100)}`
      );
      return "HTTP response doesn't contain the configured keyword";
    }
    if (monitor.responseForbiddenKeyword && responseBody.includes(monitor.responseForbiddenKeyword)) {
      console.log(
        `${monitor.name} forbidden keyword ${monitor.responseForbiddenKeyword}, found in response (truncated to 100 chars): ${responseBody.slice(0, 100)}`
      );
      return "HTTP response contains the configured forbidden keyword";
    }
  }
  return null;
}
async function getStatusWithGlobalPing(monitor) {
  try {
    if (monitor.checkProxy === void 0) {
      throw "empty check proxy for globalping, shouldn't call this method";
    }
    const gpUrl = new URL(monitor.checkProxy);
    if (gpUrl.protocol !== "globalping:") {
      throw "incorrect check proxy protocol for globalping, got: " + gpUrl.protocol;
    }
    const token = gpUrl.hostname;
    let globalPingRequest = {};
    if (monitor.method === "TCP_PING") {
      const targetUrl = new URL("https://" + monitor.target);
      const ipVersionOption = getDomainOnlyIpVersionOption(targetUrl.hostname, gpUrl);
      globalPingRequest = {
        type: "ping",
        target: targetUrl.hostname,
        locations: gpUrl.searchParams.get("magic") !== null ? [
          {
            magic: gpUrl.searchParams.get("magic")
          }
        ] : void 0,
        measurementOptions: {
          port: targetUrl.port,
          packets: 1,
          protocol: "tcp",
          // TODO: icmp?
          ...ipVersionOption
        }
      };
    } else {
      const targetUrl = new URL(monitor.target);
      const ipVersionOption = getDomainOnlyIpVersionOption(targetUrl.hostname, gpUrl);
      if (monitor.body !== void 0) {
        throw "custom body not supported";
      }
      if (monitor.method && !["GET", "HEAD", "OPTIONS"].includes(monitor.method.toUpperCase())) {
        throw "only GET, HEAD, OPTIONS methods are supported";
      }
      globalPingRequest = {
        type: "http",
        target: targetUrl.hostname,
        locations: gpUrl.searchParams.get("magic") !== null ? [
          {
            magic: gpUrl.searchParams.get("magic")
          }
        ] : void 0,
        measurementOptions: {
          request: {
            method: monitor.method,
            path: targetUrl.pathname,
            query: targetUrl.search === "" ? void 0 : targetUrl.search,
            headers: Object.fromEntries(
              Object.entries(monitor.headers ?? {}).map(([key, value]) => [key, String(value)])
            )
            // TODO: host header?
          },
          port: targetUrl.port === "" ? targetUrl.protocol === "http:" ? 80 : 443 : Number(targetUrl.port),
          protocol: targetUrl.protocol.replace(":", ""),
          ...ipVersionOption
        }
      };
    }
    const startTime = Date.now();
    console.log(`Requesting the Global Ping API, payload: ${JSON.stringify(globalPingRequest)}`);
    const measurement = await fetchTimeout("https://api.globalping.io/v1/measurements", 5e3, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(globalPingRequest)
    });
    const measurementResponse = await measurement.json();
    if (measurement.status !== 202) {
      throw measurementResponse.error.message;
    }
    const measurementId = measurementResponse.id;
    console.log(
      `Measurement created successfully, id: ${measurementId}, time elapsed: ${Date.now() - startTime}ms`
    );
    const pollStart = Date.now();
    let measurementResult;
    while (true) {
      if (Date.now() - pollStart > (monitor.timeout ?? 1e4) + 2e3) {
        throw "api polling timeout";
      }
      measurementResult = await (await fetchTimeout(`https://api.globalping.io/v1/measurements/${measurementId}`, 5e3)).json();
      if (measurementResult.status !== "in-progress") {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
    console.log(
      `Measurement ${measurementId} finished with response: ${JSON.stringify(
        measurementResult
      )}, time elapsed: ${Date.now() - pollStart}ms`
    );
    if (measurementResult.status !== "finished" || measurementResult.results[0].result.status !== "finished") {
      console.log(
        `measurement failed with status: ${measurementResult.status}, result status: ${measurementResult.results[0].result.status}`
      );
      throw `status [${measurementResult.status}|${measurementResult.results[0].result.status}]: ${measurementResult.results?.[0].result?.rawOutput?.slice(0, 64)}`;
    }
    const country = measurementResult.results[0].probe.country;
    const city = measurementResult.results[0].probe.city;
    if (monitor.method === "TCP_PING") {
      const time = Math.round(measurementResult.results[0].result.stats.avg);
      return {
        location: country + "/" + city,
        status: {
          ping: time,
          up: true,
          err: ""
        }
      };
    } else {
      const time = measurementResult.results[0].result.timings.total;
      const code = measurementResult.results[0].result.statusCode;
      const body = measurementResult.results[0].result.rawBody;
      let err = await httpResponseBasicCheck(monitor, code, () => body);
      if (err !== null) {
        console.log(`${monitor.name} didn't pass response check: ${err}`);
      }
      if (monitor.target.toLowerCase().startsWith("https") && !measurementResult.results[0].result.tls.authorized) {
        console.log(
          `${monitor.name} TLS certificate not trusted: ${measurementResult.results[0].result.tls.error}`
        );
        err = "TLS certificate not trusted: " + measurementResult.results[0].result.tls.error;
      }
      return {
        location: country + "/" + city,
        status: {
          ping: time,
          up: err === null,
          err: err ?? ""
        }
      };
    }
  } catch (e) {
    console.log(`Globalping ${monitor.name} errored with ${e}`);
    return {
      location: "ERROR",
      status: {
        ping: e.toString().toLowerCase().includes("timeout") ? monitor.timeout ?? 1e4 : 0,
        up: false,
        err: "Globalping error: " + e.toString()
      }
    };
  }
}
async function getStatus(monitor) {
  let status = {
    ping: 0,
    up: false,
    err: "Unknown"
  };
  const startTime = Date.now();
  if (monitor.method === "TCP_PING") {
    try {
      const connect = await import(
        /* webpackIgnore: true */
        "cloudflare:sockets"
      ).then(
        (sockets) => sockets.connect
      );
      const parsed = new URL("https://" + monitor.target);
      const socket = connect({ hostname: parsed.hostname, port: Number(parsed.port) });
      await withTimeout(monitor.timeout || 1e4, socket.opened);
      await socket.close();
      console.log(`${monitor.name} connected to ${monitor.target}`);
      status.ping = Date.now() - startTime;
      status.up = true;
      status.err = "";
    } catch (e) {
      console.log(`${monitor.name} errored with ${e.name}: ${e.message}`);
      if (e.message.includes("timed out")) {
        status.ping = monitor.timeout || 1e4;
      }
      status.up = false;
      status.err = e.name + ": " + e.message;
    }
  } else {
    try {
      let headers = new Headers(monitor.headers);
      if (!headers.has("user-agent")) {
        headers.set("user-agent", "UptimeFlare/1.0 (+https://github.com/lyc8503/UptimeFlare)");
      }
      const response = await fetchTimeout(monitor.target, monitor.timeout || 1e4, {
        method: monitor.method,
        headers,
        body: monitor.body,
        cf: {
          cacheTtlByStatus: {
            "100-599": -1
            // Don't cache any status code, from https://developers.cloudflare.com/workers/runtime-apis/request/#requestinitcfproperties
          }
        }
      });
      console.log(`${monitor.name} responded with ${response.status}`);
      status.ping = Date.now() - startTime;
      const err = await httpResponseBasicCheck(
        monitor,
        response.status,
        response.text.bind(response)
      );
      try {
        await response.body?.cancel();
      } catch (e) {
      }
      if (err !== null) {
        console.log(`${monitor.name} didn't pass response check: ${err}`);
      }
      status.up = err === null;
      status.err = err ?? "";
    } catch (e) {
      console.log(`${monitor.name} errored with ${e.name}: ${e.message}`);
      if (e.name === "AbortError") {
        status.ping = monitor.timeout || 1e4;
        status.up = false;
        status.err = `Timeout after ${status.ping}ms`;
      } else {
        status.up = false;
        status.err = e.name + ": " + e.message;
      }
    }
  }
  return status;
}
async function doMonitor(monitor, defaultLocation, env) {
  let checkLocation = defaultLocation;
  let status;
  if (monitor.checkProxy) {
    try {
      console.log(`[${monitor.id}] Calling check proxy: ${monitor.checkProxy}`);
      let resp;
      if (monitor.checkProxy.startsWith("worker://")) {
        const doLoc = monitor.checkProxy.replace("worker://", "");
        const doId = env.REMOTE_CHECKER_DO.idFromName(monitor.id);
        const doStub = env.REMOTE_CHECKER_DO.get(doId, {
          locationHint: doLoc
        });
        resp = await doStub.getLocationAndStatus(monitor);
        try {
          await doStub.kill();
        } catch (err) {
        }
      } else if (monitor.checkProxy.startsWith("globalping://")) {
        resp = await getStatusWithGlobalPing(monitor);
      } else {
        resp = await (await fetch(monitor.checkProxy, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(monitor)
        })).json();
      }
      checkLocation = resp.location;
      status = resp.status;
    } catch (err) {
      console.log(`[${monitor.id}] Error calling proxy: ${err}`);
      if (monitor.checkProxyFallback) {
        console.log("Falling back to local check...");
        status = await getStatus(monitor);
      } else {
        status = { ping: 0, up: false, err: "Unknown check proxy error" };
      }
    }
  } else {
    status = await getStatus(monitor);
  }
  console.log(`[${monitor.id}] Check result from ${checkLocation}: up=${status.up}, ping=${status.ping}, err=${status.err}`);
  return {
    location: checkLocation,
    status,
    id: monitor.id
  };
}

// src/store.ts
async function getFromStore(env, key) {
  const stmt = env.UPTIMEFLARE_D1.prepare("SELECT value FROM uptimeflare WHERE key = ?");
  const result = await stmt.bind(key).first();
  return result?.value || null;
}
async function setToStore(env, key, value) {
  const stmt = env.UPTIMEFLARE_D1.prepare(
    "INSERT INTO uptimeflare (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;"
  );
  await stmt.bind(key, value).run();
}
var CompactedMonitorStateWrapper = class {
  constructor(compactedStateStr) {
    if (!compactedStateStr) {
      this.data = {
        lastUpdate: 0,
        overallUp: 0,
        overallDown: 0,
        incident: {},
        latency: {}
      };
      return;
    }
    this.data = JSON.parse(compactedStateStr);
  }
  getCompactedStateStr() {
    return JSON.stringify(this.data);
  }
  // Don't use this method at server-side
  uncompact() {
    let state = {
      lastUpdate: this.data.lastUpdate,
      overallUp: this.data.overallUp,
      overallDown: this.data.overallDown,
      incident: {},
      latency: {}
    };
    const hex2Uint8Arr = (hex) => {
      if (Uint8Array.fromHex) {
        return Uint8Array.fromHex(hex);
      } else {
        console.warn("Uint8Array.fromHex is not available, using parseInt as fallback. Consider upgrading your browser.");
        const ret = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
          ret[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        }
        return ret;
      }
    };
    Object.keys(this.data.incident).forEach((monitorId) => {
      state.incident[monitorId] = [];
      const incidents = this.data.incident[monitorId];
      if (incidents.start.length !== incidents.end.length || incidents.start.length !== incidents.error.length) {
        throw new Error(
          "Inconsistent incident data lengths, please report an issue at https://github.com/lyc8503/UptimeFlare"
        );
      }
      for (let i = 0; i < incidents.start.length; i++) {
        state.incident[monitorId].push({
          start: incidents.start[i],
          end: incidents.end[i],
          error: incidents.error[i]
        });
      }
    });
    Object.keys(this.data.latency).forEach((monitorId) => {
      state.latency[monitorId] = [];
      const latencies = this.data.latency[monitorId];
      const locUncompacted = [];
      latencies.loc.c.forEach((count, index) => {
        for (let i = 0; i < count; i++) {
          locUncompacted.push(latencies.loc.v[index]);
        }
      });
      const timeArr = new Uint32Array(hex2Uint8Arr(latencies.time).buffer);
      const pingArr = new Uint16Array(hex2Uint8Arr(latencies.ping).buffer);
      if (timeArr.length !== pingArr.length || timeArr.length !== locUncompacted.length) {
        throw new Error(
          "Inconsistent latency data lengths, please report an issue at https://github.com/lyc8503/UptimeFlare."
        );
      }
      for (let i = 0; i < timeArr.length; i++) {
        state.latency[monitorId].push({
          time: timeArr[i],
          ping: pingArr[i],
          loc: locUncompacted[i]
        });
      }
    });
    return state;
  }
  incidentLen(monitorId) {
    const incidents = this.data.incident[monitorId];
    if (!incidents) return 0;
    return incidents.start.length;
  }
  getIncident(monitorId, index) {
    const incidents = this.data.incident[monitorId];
    if (!incidents || index < 0 || index >= incidents.start.length) {
      throw new Error("Index out of bounds or monitor not found");
    }
    return {
      start: incidents.start[index],
      end: incidents.end[index],
      error: incidents.error[index]
    };
  }
  setIncident(monitorId, index, incident) {
    const incidents = this.data.incident[monitorId];
    if (!incidents || index < 0 || index >= incidents.start.length) {
      throw new Error("Index out of bounds or monitor not found");
    }
    incidents.start[index] = incident.start;
    incidents.end[index] = incident.end;
    incidents.error[index] = incident.error;
  }
  appendIncident(monitorId, incident) {
    let incidents = this.data.incident[monitorId];
    if (!incidents) {
      this.data.incident[monitorId] = {
        start: [],
        end: [],
        error: []
      };
      incidents = this.data.incident[monitorId];
    }
    incidents.start.push(incident.start);
    incidents.end.push(incident.end);
    incidents.error.push(incident.error);
  }
  shiftIncident(monitorId) {
    const incidents = this.data.incident[monitorId];
    incidents.start.shift();
    incidents.end.shift();
    incidents.error.shift();
  }
  unshiftIncident(monitorId, incident) {
    const incidents = this.data.incident[monitorId];
    incidents.start.unshift(incident.start);
    incidents.end.unshift(incident.end);
    incidents.error.unshift(incident.error);
  }
  latencyLen(monitorId) {
    const latencies = this.data.latency[monitorId];
    if (!latencies) return 0;
    return latencies.ping.length / 4;
  }
  appendLatency(monitorId, record) {
    let latencies = this.data.latency[monitorId];
    if (!latencies) {
      this.data.latency[monitorId] = {
        time: "",
        ping: "",
        loc: {
          c: [],
          v: []
        }
      };
      latencies = this.data.latency[monitorId];
    }
    latencies.time += new Uint8Array(new Uint32Array([record.time]).buffer).toHex();
    latencies.ping += new Uint8Array(new Uint16Array([record.ping]).buffer).toHex();
    if (latencies.loc.v[latencies.loc.v.length - 1] !== record.loc) {
      latencies.loc.c.push(1);
      latencies.loc.v.push(record.loc);
    } else {
      latencies.loc.c[latencies.loc.c.length - 1] += 1;
    }
  }
  getFirstLatency(monitorId) {
    let latencies = this.data.latency[monitorId];
    return {
      // @ts-expect-error
      time: new Uint32Array(Uint8Array.fromHex(latencies.time.slice(0, 8)).buffer)[0],
      // @ts-expect-error
      ping: new Uint16Array(Uint8Array.fromHex(latencies.ping.slice(0, 4)).buffer)[0],
      loc: latencies.loc.v[0]
    };
  }
  getLastLatency(monitorId) {
    let latencies = this.data.latency[monitorId];
    return {
      // @ts-expect-error
      time: new Uint32Array(Uint8Array.fromHex(latencies.time.slice(-8)).buffer)[0],
      // @ts-expect-error
      ping: new Uint16Array(Uint8Array.fromHex(latencies.ping.slice(-4)).buffer)[0],
      loc: latencies.loc.v[latencies.loc.v.length - 1]
    };
  }
  unshiftLatency(monitorId) {
    let latencies = this.data.latency[monitorId];
    latencies.time = latencies.time.slice(8);
    latencies.ping = latencies.ping.slice(4);
    latencies.loc.c[0] -= 1;
    if (latencies.loc.c[0] === 0) {
      latencies.loc.c.shift();
      latencies.loc.v.shift();
    }
  }
};

// node_modules/yocto-queue/index.js
var Node = class {
  value;
  next;
  constructor(value) {
    this.value = value;
  }
};
var Queue = class {
  #head;
  #tail;
  #size;
  constructor() {
    this.clear();
  }
  enqueue(value) {
    const node = new Node(value);
    if (this.#head) {
      this.#tail.next = node;
      this.#tail = node;
    } else {
      this.#head = node;
      this.#tail = node;
    }
    this.#size++;
  }
  dequeue() {
    const current = this.#head;
    if (!current) {
      return;
    }
    this.#head = this.#head.next;
    this.#size--;
    if (!this.#head) {
      this.#tail = void 0;
    }
    return current.value;
  }
  peek() {
    if (!this.#head) {
      return;
    }
    return this.#head.value;
  }
  clear() {
    this.#head = void 0;
    this.#tail = void 0;
    this.#size = 0;
  }
  get size() {
    return this.#size;
  }
  *[Symbol.iterator]() {
    let current = this.#head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
  *drain() {
    while (this.#head) {
      yield this.dequeue();
    }
  }
};

// node_modules/p-limit/index.js
function pLimit(concurrency) {
  validateConcurrency(concurrency);
  const queue = new Queue();
  let activeCount = 0;
  const resumeNext = () => {
    if (activeCount < concurrency && queue.size > 0) {
      activeCount++;
      queue.dequeue()();
    }
  };
  const next = () => {
    activeCount--;
    resumeNext();
  };
  const run = async (function_, resolve, arguments_) => {
    const result = (async () => function_(...arguments_))();
    resolve(result);
    try {
      await result;
    } catch {
    }
    next();
  };
  const enqueue = (function_, resolve, arguments_) => {
    new Promise((internalResolve) => {
      queue.enqueue(internalResolve);
    }).then(run.bind(void 0, function_, resolve, arguments_));
    if (activeCount < concurrency) {
      resumeNext();
    }
  };
  const generator = (function_, ...arguments_) => new Promise((resolve) => {
    enqueue(function_, resolve, arguments_);
  });
  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount
    },
    pendingCount: {
      get: () => queue.size
    },
    clearQueue: {
      value() {
        queue.clear();
      }
    },
    concurrency: {
      get: () => concurrency,
      set(newConcurrency) {
        validateConcurrency(newConcurrency);
        concurrency = newConcurrency;
        queueMicrotask(() => {
          while (activeCount < concurrency && queue.size > 0) {
            resumeNext();
          }
        });
      }
    },
    map: {
      async value(iterable, function_) {
        const promises = Array.from(iterable, (value, index) => this(function_, value, index));
        return Promise.all(promises);
      }
    }
  });
  return generator;
}
function validateConcurrency(concurrency) {
  if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
    throw new TypeError("Expected `concurrency` to be a number from 1 and up");
  }
}

// src/index.ts
var Worker = {
  async scheduled(event, env, ctx) {
    const workerLocation = await getWorkerLocation() || "ERROR";
    console.log(`Running scheduled event on ${workerLocation}...`);
    const state = new CompactedMonitorStateWrapper(await getFromStore(env, "state"));
    state.data.overallDown = 0;
    state.data.overallUp = 0;
    let statusChanged = false;
    const currentTimeSecond = Math.round(Date.now() / 1e3);
    let checkQueue = [];
    let checkResult = {};
    const limit = pLimit(5);
    for (const monitor of workerConfig.monitors) {
      checkQueue.push(limit(() => doMonitor(monitor, workerLocation, env)));
    }
    for (const result of await Promise.all(checkQueue)) {
      checkResult[result.id] = result;
    }
    for (const monitor of workerConfig.monitors) {
      console.log(`Processing monitor result: ${monitor.name} (${monitor.id})`);
      let monitorStatusChanged = false;
      const { location: checkLocation, status } = checkResult[monitor.id];
      status.up ? state.data.overallUp++ : state.data.overallDown++;
      if (state.incidentLen(monitor.id) === 0) {
        state.appendIncident(monitor.id, {
          start: [currentTimeSecond],
          end: currentTimeSecond,
          error: ["dummy"]
        });
      }
      let lastIncident = state.getIncident(monitor.id, state.incidentLen(monitor.id) - 1);
      if (status.up) {
        if (lastIncident.end === null) {
          lastIncident.end = currentTimeSecond;
          state.setIncident(monitor.id, state.incidentLen(monitor.id) - 1, lastIncident);
          monitorStatusChanged = true;
          try {
            if (
              // grace period not set OR ...
              workerConfig.notification?.gracePeriod === void 0 || // only when we have sent a notification for DOWN status, we will send a notification for UP status (within 30 seconds of possible drift)
              currentTimeSecond - lastIncident.start[0] >= (workerConfig.notification.gracePeriod + 1) * 60 - 30
            ) {
              await formatAndNotify(monitor, true, lastIncident.start[0], currentTimeSecond, "OK");
            } else {
              console.log(
                `grace period (${workerConfig.notification?.gracePeriod}m) not met, skipping webhook UP notification for ${monitor.name}`
              );
            }
            console.log("Calling config onStatusChange callback...");
            await workerConfig.callbacks?.onStatusChange?.(
              env,
              monitor,
              true,
              lastIncident.start[0],
              currentTimeSecond,
              "OK"
            );
          } catch (e) {
            console.log("Error calling callback: ");
            console.log(e);
          }
        }
      } else {
        if (lastIncident.end !== null) {
          state.appendIncident(monitor.id, {
            start: [currentTimeSecond],
            end: null,
            error: [status.err]
          });
          monitorStatusChanged = true;
        } else if (lastIncident.end === null && lastIncident.error.slice(-1)[0] !== status.err) {
          lastIncident.start.push(currentTimeSecond);
          lastIncident.error.push(status.err);
          state.setIncident(monitor.id, state.incidentLen(monitor.id) - 1, lastIncident);
          monitorStatusChanged = true;
        }
        const currentIncident = state.getIncident(monitor.id, state.incidentLen(monitor.id) - 1);
        try {
          if (
            // monitor status changed AND...
            monitorStatusChanged && // grace period not set OR ...
            (workerConfig.notification?.gracePeriod === void 0 || // have sent a notification for DOWN status
            currentTimeSecond - currentIncident.start[0] >= (workerConfig.notification.gracePeriod + 1) * 60 - 30) || // grace period is set AND...
            workerConfig.notification?.gracePeriod !== void 0 && // grace period is met
            currentTimeSecond - currentIncident.start[0] >= workerConfig.notification.gracePeriod * 60 - 30 && currentTimeSecond - currentIncident.start[0] < workerConfig.notification.gracePeriod * 60 + 30
          ) {
            if (currentIncident.start[0] !== currentTimeSecond && workerConfig.notification?.skipErrorChangeNotification) {
              console.log(
                "Skipping notification for following error reason change due to user config"
              );
            } else {
              await formatAndNotify(
                monitor,
                false,
                currentIncident.start[0],
                currentTimeSecond,
                status.err
              );
            }
          } else {
            console.log(
              `Grace period (${workerConfig.notification?.gracePeriod}m) not met or no change (currently down for ${currentTimeSecond - currentIncident.start[0]}s, changed ${monitorStatusChanged}), skipping webhook DOWN notification for ${monitor.name}`
            );
          }
          if (monitorStatusChanged) {
            console.log("Calling config onStatusChange callback...");
            await workerConfig.callbacks?.onStatusChange?.(
              env,
              monitor,
              false,
              currentIncident.start[0],
              currentTimeSecond,
              status.err
            );
          }
        } catch (e) {
          console.log("Error calling callback: ");
          console.log(e);
        }
        try {
          console.log("Calling config onIncident callback...");
          await workerConfig.callbacks?.onIncident?.(
            env,
            monitor,
            currentIncident.start[0],
            currentTimeSecond,
            status.err
          );
        } catch (e) {
          console.log("Error calling callback: ");
          console.log(e);
        }
      }
      state.appendLatency(monitor.id, {
        loc: checkLocation,
        ping: status.ping,
        time: currentTimeSecond
      });
      while (state.getFirstLatency(monitor.id).time < currentTimeSecond - 12 * 60 * 60) {
        state.unshiftLatency(monitor.id);
      }
      while (state.incidentLen(monitor.id) > 0 && state.getIncident(monitor.id, 0).end && state.getIncident(monitor.id, 0).end < currentTimeSecond - 90 * 24 * 60 * 60) {
        state.shiftIncident(monitor.id);
      }
      if (state.incidentLen(monitor.id) === 0 || state.getIncident(monitor.id, 0).start[0] > currentTimeSecond - 90 * 24 * 60 * 60 && state.getIncident(monitor.id, 0).error[0] != "dummy") {
        state.unshiftIncident(monitor.id, {
          start: [currentTimeSecond - 90 * 24 * 60 * 60],
          end: currentTimeSecond - 90 * 24 * 60 * 60,
          error: ["dummy"]
        });
      }
      statusChanged ||= monitorStatusChanged;
    }
    console.log(
      `statusChanged: ${statusChanged}, lastUpdate: ${state.data.lastUpdate}, currentTime: ${currentTimeSecond}`
    );
    if (statusChanged || currentTimeSecond - state.data.lastUpdate >= (workerConfig.kvWriteCooldownMinutes ?? 3) * 60 - 10) {
      console.log("Updating state...");
      state.data.lastUpdate = currentTimeSecond;
      await setToStore(env, "state", state.getCompactedStateStr());
    } else {
      console.log("Skipping state update due to cooldown period.");
    }
  }
};
var index_default = Worker;
var RemoteChecker = class extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
  }
  async getLocationAndStatus(monitor) {
    const colo = await getWorkerLocation();
    console.log(`Running remote checker (DurableObject) at ${colo}...`);
    const status = await getStatus(monitor);
    return {
      location: colo,
      status
    };
  }
  async kill() {
    this.ctx.blockConcurrencyWhile(async () => {
      throw "killed";
    });
  }
};
export {
  RemoteChecker,
  index_default as default
};
