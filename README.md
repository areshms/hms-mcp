# hms-mcp — HMS x402 Data Origins MCP Server

Remote MCP server (Streamable HTTP) that exposes **both HMS x402 data origins** as MCP tools for AI agents. **Tokenless**: no API keys, no wallets. Free tools answer directly; paid tools surface the origin's **x402 v2 Payment Required** challenge (USDC on Base) so an x402-capable agent can settle and re-call.

- **Endpoint:** `https://hms-mcp.ares-hms.workers.dev/mcp`
- **Transport:** Streamable HTTP (POST, JSON-RPC 2.0). No SSE required.
- **Owner:** HMS LLC (Blake Hightower) — `areshms`

## Origins behind this server

| Origin | Base URL | openapi.json |
|---|---|---|
| RE Data Refinery | https://re-data-refinery.ares-hms.workers.dev | [/openapi.json](https://re-data-refinery.ares-hms.workers.dev/openapi.json) |
| HMS Storefront Data | https://storefront-data-hms.ares-hms.workers.dev | [/openapi.json](https://storefront-data-hms.ares-hms.workers.dev/openapi.json) |

## Connect (ready-to-copy configs)

```json
{ "mcpServers": { "hms-mcp": { "url": "https://hms-mcp.ares-hms.workers.dev/mcp" } } }
```

## Tools (19 + meta)

| Tool | Maps to | Price (per call) |
|---|---|---|
| `refinery_search` | GET /search | $0.05 |
| `refinery_properties` | GET /properties (city filter) | $0.03 |
| `refinery_properties_zpid` | GET /properties/{zpid} | $0.03 |
| `refinery_properties_zpid_price_history` | GET /properties/{zpid}/price-history | $0.02 |
| `refinery_properties_zpid_tax_history` | GET /properties/{zpid}/tax-history | $0.02 |
| `refinery_properties_zpid_schools` | GET /properties/{zpid}/schools | $0.02 |
| `refinery_foreclosures` | GET /foreclosures | $0.05 |
| `refinery_tax_sales` | GET /tax-sales | $0.05 |
| `refinery_auctions` | GET /auctions | $0.05 |
| `refinery_preforeclosures` | GET /preforeclosures?county= (19 Ohio counties) | $0.05 |
| `refinery_cash_buyers` | GET /cash-buyers | $0.50–$2.50 |
| `refinery_health` | GET /health | Free |
| `refinery_coverage` / `refinery_v1_coverage` | GET /coverage (real record counts) | Free |
| `refinery_credits` | GET /credits | Free |
| `sf_v1_rental_rates` | GET /v1/rental/rates?city= | $0.03 (live) |
| `sf_v1_truck_sleep_stops` | GET /v1/truck/sleep-stops | Free (until data) |
| `sf_health` | GET /health | Free |
| `sf_v1_coverage` | GET /v1/coverage (honesty gate) | Free |
| `hms_get_origins` | meta: origins + payment flow | Free |

## How paid tools work (tokenless)

1. Call a paid tool. The wrapper forwards to the origin and returns its **HTTP 402** payload, including the x402 v2 challenge (`network: eip155:8453` (Base), `token`: USDC, `amount`, `receiver`, `facilitator`).
2. Settle the challenge with any x402 client (USDC on Base).
3. Re-call the **same tool with the same params**, passing the produced header value as `x402_payment` — the wrapper forwards it as `X-PAYMENT` and returns your data.

The wrapper never holds funds or keys. Prices are set by the origin workers.

## Deployment

Cloudflare Worker (plain JS, no build step): `npx wrangler deploy` in this directory. Uses Cloudflare **service bindings** to call the two origin workers on the same account (`re-data-refinery`, `storefront-data-hms`) — same-account `*.workers.dev` fetches are blocked (error 1042) without bindings.

Local verification:
```bash
curl -s -X POST https://hms-mcp.ares-hms.workers.dev/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

## License

MIT
