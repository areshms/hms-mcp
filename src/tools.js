// AUTO-GENERATED from the openapi.json of both HMS origins (RE Data Refinery, HMS Storefront Data) on 2026-11-12.
// Per-tool 'price' is USD per call, from each origin's live x-payment-info declarations.
export const ORIGINS = [
  {
    "id": "re",
    "name": "RE Data Refinery",
    "base": "https://re-data-refinery.ares-hms.workers.dev",
    "openapi": "/openapi.json"
  },
  {
    "id": "sf",
    "name": "HMS Storefront Data",
    "base": "https://storefront-data-hms.ares-hms.workers.dev",
    "openapi": "/openapi.json"
  }
];

export const TOOLS = [
  {
    "name": "refinery_auctions",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/auctions",
    "description": "Combined foreclosure + tax-sale + auction leads \u2014 $0.05 per call",
    "price": 0.05,
    "price_qualifier": null,
    "params": {
      "city": {
        "type": "string",
        "description": "Ohio city filter"
      },
      "status": {
        "type": "string",
        "description": "Filter by status, e.g. active"
      },
      "zip": {
        "type": "string",
        "description": "5-digit ZIP filter"
      },
      "type": {
        "type": "string",
        "description": "Auction type filter"
      }
    },
    "required": [],
    "pathparams": []
  },
  {
    "name": "refinery_cash_buyers",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/cash-buyers",
    "description": "Cash-buyer intelligence \u2014 $0.50 (zip rollup) / $2.50 (parcel evidence) per call",
    "price": 0.5,
    "price_qualifier": "zip rollup",
    "params": {
      "zip": {
        "type": "string",
        "description": "5-digit ZIP (e.g. 43211) \u2014 buyer rollup, $0.50"
      },
      "parcel": {
        "type": "string",
        "description": "Franklin County parcel digits, e.g. 01000051500 \u2014 deed evidence, $2.50"
      },
      "limit": {
        "type": "integer",
        "description": "Top buyers returned for ZIP queries (default 10, cap 50)"
      },
      "min_score": {
        "type": "integer",
        "description": "Buyer score floor 0-100"
      }
    },
    "required": [],
    "pathparams": []
  },
  {
    "name": "refinery_coverage",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/coverage",
    "description": "Free \u2014 real record counts per dataset",
    "price": 0.0,
    "price_qualifier": null,
    "params": {},
    "required": [],
    "pathparams": []
  },
  {
    "name": "refinery_credits",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/credits",
    "description": "Free \u2014 data provider and billing info",
    "price": 0.0,
    "price_qualifier": null,
    "params": {},
    "required": [],
    "pathparams": []
  },
  {
    "name": "refinery_foreclosures",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/foreclosures",
    "description": "Scored active foreclosure leads by city \u2014 $0.05 per call",
    "price": 0.05,
    "price_qualifier": null,
    "params": {
      "city": {
        "type": "string",
        "description": "Ohio city, e.g. Columbus"
      }
    },
    "required": [
      "city"
    ],
    "pathparams": []
  },
  {
    "name": "refinery_health",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/health",
    "description": "Free \u2014 service health and cache size",
    "price": 0.0,
    "price_qualifier": null,
    "params": {},
    "required": [],
    "pathparams": []
  },
  {
    "name": "refinery_preforeclosures",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/preforeclosures",
    "description": "Pre-foreclosure leads across 19 Ohio counties \u2014 $0.05 per call",
    "price": 0.05,
    "price_qualifier": null,
    "params": {
      "county": {
        "type": "string",
        "description": "Ohio county, e.g. Cuyahoga"
      },
      "city": {
        "type": "string",
        "description": "City filter"
      },
      "zip": {
        "type": "string",
        "description": "5-digit ZIP filter"
      },
      "min_emv": {
        "type": "number",
        "description": "Estimated market value floor (USD)"
      },
      "with_value": {
        "type": "string",
        "description": "\"1\" returns only records with an estimated value"
      },
      "limit": {
        "type": "integer",
        "description": "Max records (default 50, cap 200)"
      }
    },
    "required": [],
    "pathparams": []
  },
  {
    "name": "refinery_properties",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/properties",
    "description": "City-filtered scored property list \u2014 $0.03 per call",
    "price": 0.03,
    "price_qualifier": null,
    "params": {
      "city": {
        "type": "string",
        "description": "Ohio city, e.g. Columbus (18 supported cities)"
      },
      "min_price": {
        "type": "number",
        "description": "USD price floor"
      },
      "max_price": {
        "type": "number",
        "description": "USD price ceiling"
      },
      "live": {
        "type": "string",
        "description": "\"0\" forces the cache instead of a live RealtyAPI search"
      }
    },
    "required": [],
    "pathparams": []
  },
  {
    "name": "refinery_properties_zpid",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/properties/{zpid}",
    "description": "Full scored detail for one property \u2014 $0.03 per call",
    "price": 0.03,
    "price_qualifier": null,
    "params": {
      "zpid": {
        "type": "string",
        "description": "Zillow property id (returned as zpid by /search and /properties)"
      }
    },
    "required": [
      "zpid"
    ],
    "pathparams": [
      "zpid"
    ]
  },
  {
    "name": "refinery_properties_zpid_price_history",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/properties/{zpid}/price-history",
    "description": "Transaction price history \u2014 $0.02 per call",
    "price": 0.02,
    "price_qualifier": null,
    "params": {
      "zpid": {
        "type": "string",
        "description": "Zillow property id"
      }
    },
    "required": [
      "zpid"
    ],
    "pathparams": [
      "zpid"
    ]
  },
  {
    "name": "refinery_properties_zpid_schools",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/properties/{zpid}/schools",
    "description": "School ratings near one property \u2014 $0.02 per call",
    "price": 0.02,
    "price_qualifier": null,
    "params": {
      "zpid": {
        "type": "string",
        "description": "Zillow property id"
      }
    },
    "required": [
      "zpid"
    ],
    "pathparams": [
      "zpid"
    ]
  },
  {
    "name": "refinery_properties_zpid_tax_history",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/properties/{zpid}/tax-history",
    "description": "Tax assessment history \u2014 $0.02 per call",
    "price": 0.02,
    "price_qualifier": null,
    "params": {
      "zpid": {
        "type": "string",
        "description": "Zillow property id"
      }
    },
    "required": [
      "zpid"
    ],
    "pathparams": [
      "zpid"
    ]
  },
  {
    "name": "refinery_search",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/search",
    "description": "Scored property search by location \u2014 $0.05 per call",
    "price": 0.05,
    "price_qualifier": null,
    "params": {
      "q": {
        "type": "string",
        "description": "City/state or ZIP, e.g. \"Columbus OH\" or \"43215\""
      },
      "limit": {
        "type": "integer",
        "description": "Max results 1-40"
      }
    },
    "required": [
      "q"
    ],
    "pathparams": []
  },
  {
    "name": "refinery_tax_sales",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/tax-sales",
    "description": "Scored county tax-sale leads \u2014 $0.05 per call",
    "price": 0.05,
    "price_qualifier": null,
    "params": {
      "city": {
        "type": "string",
        "description": "Ohio city, e.g. Columbus"
      }
    },
    "required": [
      "city"
    ],
    "pathparams": []
  },
  {
    "name": "refinery_v1_coverage",
    "origin": "https://re-data-refinery.ares-hms.workers.dev",
    "method": "GET",
    "path": "/v1/coverage",
    "description": "Free \u2014 alias of /coverage",
    "price": 0.0,
    "price_qualifier": null,
    "params": {},
    "required": [],
    "pathparams": []
  },
  {
    "name": "sf_health",
    "origin": "https://storefront-data-hms.ares-hms.workers.dev",
    "method": "GET",
    "path": "/health",
    "description": "Free \u2014 service health and resource list",
    "price": 0.0,
    "price_qualifier": null,
    "params": {},
    "required": [],
    "pathparams": []
  },
  {
    "name": "sf_v1_coverage",
    "origin": "https://storefront-data-hms.ares-hms.workers.dev",
    "method": "GET",
    "path": "/v1/coverage",
    "description": "Free \u2014 real record counts per dataset (honesty gate)",
    "price": 0.0,
    "price_qualifier": null,
    "params": {},
    "required": [],
    "pathparams": []
  },
  {
    "name": "sf_v1_rental_rates",
    "origin": "https://storefront-data-hms.ares-hms.workers.dev",
    "method": "GET",
    "path": "/v1/rental/rates",
    "description": "Fetch verified daily car-rental rates per class \u2014 $0.03 per call",
    "price": 0.03,
    "price_qualifier": null,
    "params": {
      "city": {
        "type": "string",
        "description": "City with verified rate coverage, e.g. Columbus (Columbus, OH pilot)"
      }
    },
    "required": [],
    "pathparams": []
  },
  {
    "name": "sf_v1_truck_fuel_prices",
    "origin": "https://storefront-data-hms.ares-hms.workers.dev",
    "method": "GET",
    "path": "/v1/truck/fuel-prices",
    "description": "Fetch weekly US average diesel prices (24 points) \u2014 $0.02 per call",
    "price": 0.02,
    "price_qualifier": null,
    "params": {
      "weeks": {
        "type": "integer",
        "description": "Number of trailing weekly points to return (default 24, max 24)"
      }
    },
    "required": [],
    "pathparams": []
  },
  {
    "name": "sf_v1_truck_sleep_stops",
    "origin": "https://storefront-data-hms.ares-hms.workers.dev",
    "method": "GET",
    "path": "/v1/truck/sleep-stops",
    "description": "Fetch sleep stops for one of 2 corridors \u2014 $0.05 per call",
    "price": 0.05,
    "price_qualifier": null,
    "params": {
      "from": {
        "type": "string",
        "description": "Origin city/state, e.g. \"Columbus, OH\" or \"Chicago, IL\". Loose prefix matching: \\\"Columbus\\\" matches \\\"I-70\\\" origin, \\\"Chicago\\\" matches \\\"I-80\\\" origin"
      },
      "to": {
        "type": "string",
        "description": "Destination city/state, e.g. \"St. Louis, MO\" or \"Denver, CO\""
      },
      "hos_hours": {
        "type": "number",
        "description": "Remaining hours-of-service drive window, e.g. 4.5"
      }
    },
    "required": [],
    "pathparams": []
  },
  {
    "name": "hms_get_origins",
    "origin": null,
    "method": null,
    "path": null,
    "description": "List the two HMS x402 data origins behind this MCP server (RE Data Refinery + HMS Storefront Data), their openapi.json URLs, and how x402 payment works (402 + X-PAYMENT retry, USDC on Base). Free.",
    "price": 0.0,
    "price_qualifier": null,
    "params": {},
    "required": [],
    "pathparams": []
  }
];