// hms-mcp — tokenless MCP (Streamable HTTP) wrapper over the two HMS x402 data origins:
//   RE Data Refinery        https://re-data-refinery.ares-hms.workers.dev
//   HMS Storefront Data     https://storefront-data-hms.ares-hms.workers.dev
//
// Design rules:
//   - No API keys, no wallets, no auth: tokenless. Agents discover tools via tools/list.
//   - This wrapper NEVER pays. Paid endpoints surface the origin's x402 402 challenge to the
//     agent; an x402-capable client may settle with the origin and re-call the tool passing
//     the resulting header via the reserved `x402_payment` argument (forwarded as X-PAYMENT).
//   - GET-only forwarding; endpoints are allowlisted from the origins' openapi.json.
//     Never fetches arbitrary URLs.

import { ORIGINS, TOOLS } from "./tools.js";

const MCP_VERSION = "2025-06-18";
const SERVER_INFO = { name: "hms-mcp", title: "HMS x402 Data Origins MCP", version: "1.0.0" };
const MAX_BODY = 25000; // chars of upstream body returned to the agent

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });

const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

function toolCatalog() {
  return TOOLS.map((t) => {
    const priceTxt =
      t.price === 0 ? "free" : t.price == null ? "paid (price from origin)" : `$${t.price.toFixed(2)} per call via x402 (USDC on Base)`;
    const props = { ...t.params };
    const req = [...t.required];
    if (t.price && t.price > 0) {
      props.x402_payment = {
        type: "string",
        description:
          "Optional. X-PAYMENT header value an x402 client produced after settling this exact origin+params challenge. Omit to first receive the Payment Required challenge.",
      };
    }
    return {
      name: t.name,
      description: `${t.description} Origin: ${t.origin}. Price: ${priceTxt}.`,
      inputSchema: { type: "object", properties: props, required: req, additionalProperties: false },
      _meta: {
        "hms.x402/price_usd": t.price ?? null,
        "hms.x402/origin": t.origin,
        "hms.x402/endpoint": t.path,
      },
    };
  });
}

function buildUpstreamRequest(t, args) {
  const url = new URL(t.origin + t.path);
  let path = t.path;
  for (const pp of t.pathparams) {
    const v = args ? args[pp] : undefined;
    if (v === undefined || v === null || String(v).length > 128) return { err: `Missing/invalid path parameter: ${pp}` };
    path = path.replace(`{${pp}}`, encodeURIComponent(String(v)));
  }
  const target = new URL(t.origin + path);
  for (const [k, v] of Object.entries(args || {})) {
    if (k === "x402_payment" || v === undefined || v === null || v === "") continue;
    const declared = t.params[k];
    if (!declared && ![...t.pathparams].includes(k)) return { err: `Unknown argument: ${k}` };
    if (t.pathparams.includes(k)) continue; // already substituted
    if (Array.isArray(v)) v.forEach((x) => target.searchParams.append(k, String(x)));
    else target.searchParams.append(k, String(v).slice(0, 256));
  }
  const headers = { accept: "application/json" };
  if (args && typeof args.x402_payment === "string" && args.x402_payment.length < 8192) {
    headers["x-payment"] = args.x402_payment;
  }
  return { target: target.toString(), headers };
}

function metaToolResult() {
  return {
    origins: ORIGINS.map((o) => ({ name: o.name, base: o.base, openapi: o.base + o.openapi })),
    payment: {
      protocol: "x402 v2",
      asset: "USDC on Base",
      flow: "Free tools answer directly. Paid tools first return the origin's HTTP 402 Payment Required payload; settle it with any x402 client, then re-call the tool passing that X-PAYMENT value as the x402_payment argument.",
    },
    note: "This MCP wrapper is tokenless and never holds funds. Prices are set by the origin workers.",
  };
}

async function callTool(name, args, env) {
  if (name === "hms_get_origins") return { content: [{ type: "text", text: JSON.stringify(metaToolResult(), null, 2) }] };
  const t = TOOLS.find((x) => x.name === name);
  if (!t) return { isError: true, content: [{ type: "text", text: `Unknown tool: ${name}` }] };

  const built = buildUpstreamRequest(t, args);
  if (built.err) return { isError: true, content: [{ type: "text", text: built.err }] };

  // Same-account workers.dev subrequests are blocked (CF 1042); use service bindings when bound.
  const bound =
    env &&
    ((t.origin.includes("re-data-refinery") && env.RE_DATA_REFINERY) ||
      (t.origin.includes("storefront-data-hms") && env.STOREFRONT_DATA_HMS));
  let resp;
  try {
    if (bound) {
      resp = await bound.fetch(built.target, { method: "GET", headers: built.headers });
    } else {
      resp = await fetch(built.target, { method: "GET", headers: built.headers, redirect: "follow" });
    }
  } catch (e) {
    return { isError: true, content: [{ type: "text", text: `Upstream fetch failed: ${e && e.message ? e.message : String(e)}` }] };
  }

  const bodyText = await resp.text();

  if (resp.status === 402) {
    // Tokenless passthrough: surface the challenge, agent settles with the origin.
    // Also relay the x402 v2 challenge (PAYMENT-REQUIRED header, base64 JSON) so the
    // agent sees accepts[] (network + atomic amount) without fetching the origin twice.
    const prHeader = resp.headers.get("payment-required") ?? resp.headers.get("PAYMENT-REQUIRED") ?? "";
    let challengeV2 = null;
    try {
      const norm = prHeader.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (prHeader.length % 4)) % 4);
      challengeV2 = JSON.parse(atob(norm));
    } catch (_) {}
    const result = {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: 402,
          payment_required: JSON.parse(bodyText) || bodyText,
          ...(challengeV2 ? { challenge_v2: challengeV2 } : {}),
          origin_url: built.target,
          price_usd: t.price ?? null,
          atomic_amount: challengeV2?.accepts?.[0]?.amount ?? null,
          how_to_pay: "Use an x402 client (USDC on Base). Retry this same tool with x402_payment set to the X-PAYMENT header value you produced for this exact origin_url.",
        }, null, 2),
      }],
    };
    return result;
  }

  const truncated = bodyText.length > MAX_BODY;
  const text = truncated ? bodyText.slice(0, MAX_BODY) + "\n…[truncated; fetch narrower params at " + built.target + "]" : bodyText;
  return { content: [{ type: "text", text: `HTTP ${resp.status}\n` + text }] };
}

async function handleRpc(msg, env) {
  const { id, method, params } = msg || {};
  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0", id,
        result: {
          protocolVersion: MCP_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions:
            "HMS x402 data origins: scored Ohio real-estate datasets (RE Data Refinery) plus rental/truck datasets (HMS Storefront Data). Free tools answer directly; paid tools return the origin's x402 Payment Required challenge — settle with USDC on Base and re-call with x402_payment to get the data. Call hms_get_origins for origin details.",
        },
      };
    case "notifications/initialized":
      return null; // notification: no body
    case "ping":
      return { jsonrpc: "2.0", id, result: {} };
    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: toolCatalog() } };
    case "tools/call": {
      const name = params && params.name;
      const args = (params && params.arguments) || {};
      try {
        const result = await callTool(name, args, env);
        return { jsonrpc: "2.0", id, result };
      } catch (e) {
        return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: `Tool error: ${e && e.message ? e.message : String(e)}` }] } };
      }
    }
    default:
      if (method && method.startsWith("notifications/")) return null;
      return { jsonrpc: "2.0", id: id ?? null, ...rpcError(id ?? null, -32601, `Method not found: ${method}`) };
  }
}

const infoBody = {
  server: SERVER_INFO,
  mcp_endpoint: "/mcp (POST, JSON-RPC 2.0, Streamable HTTP; no SSE)",
  transports: ["streamable-http"],
  origins: metaToolResult().origins,
  payment: metaToolResult().payment,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET") {
      if (url.pathname === "/health") return json({ ok: true, server: SERVER_INFO, tools: TOOLS.length });
      if (url.pathname === "/" || url.pathname === "/mcp") {
        if (url.pathname === "/mcp") {
          return new Response(JSON.stringify(infoBody, null, 2), {
            status: 405,
            headers: { "content-type": "application/json", accept: "application/json" },
          });
        }
        return json(infoBody);
      }
      return new Response("Not found. See / for info, /health for health, POST /mcp for MCP.", { status: 404 });
    }
    if (request.method === "DELETE" && url.pathname === "/mcp") return new Response(null, { status: 204 });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    let body;
    try {
      body = await request.json();
    } catch (_) {
      return json(rpcError(null, -32700, "Parse error"), 400);
    }
    const msgs = Array.isArray(body) ? body : [body];
    const responses = [];
    for (const m of msgs) {
      const r = await handleRpc(m, env);
      if (r !== null) responses.push(r);
    }
    if (responses.length === 0) return new Response(null, { status: 202 });
    return json(responses.length === 1 ? responses[0] : responses);
  },
};
