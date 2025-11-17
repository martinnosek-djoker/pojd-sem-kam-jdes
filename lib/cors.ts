import { NextResponse } from "next/server";

/**
 * Přidá CORS hlavičky do response pro mobilní aplikaci
 * Povolí požadavky z Capacitor (https://localhost a capacitor://)
 */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Vytvoří NextResponse s CORS hlavičkami
 */
export function jsonWithCors(data: any, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...corsHeaders(),
      ...(init?.headers || {}),
    },
  });
}

/**
 * Handler pro OPTIONS preflight requests
 */
export function handleOptionsRequest() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
