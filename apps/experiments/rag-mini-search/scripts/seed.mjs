#!/usr/bin/env node
/**
 * Seed Vectorize via the deployed/local worker POST /seed endpoint.
 * Usage: node scripts/seed.mjs [baseUrl]
 */
const baseUrl = process.argv[2] ?? "http://localhost:8787";

const res = await fetch(`${baseUrl}/seed`, { method: "POST" });
const body = await res.text();
console.log(res.status, body);
if (!res.ok) process.exit(1);
