import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { db } from "./db";
import type { Session } from "./types";

export const COOKIE = "indisun_admin";
export const SESSION_TTL = +(process.env.SESSION_TTL_HOURS || 8) * 3600 * 1000;
const PROD = process.env.NODE_ENV === "production";

export const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");
export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "local").trim();
}

/** Returns the active admin session, or null. */
export async function currentSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length < 40) return null;
  return (await db()).getSession(hashToken(token));
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "strict", secure: PROD, path: "/", maxAge: SESSION_TTL / 1000
  });
}
export async function clearSessionCookie() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, sameSite: "strict", secure: PROD, path: "/", maxAge: 0 });
}

/** CSRF guard: state-changing admin requests must originate from this host. */
export async function sameOrigin(req: Request): Promise<boolean> {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const host = req.headers.get("host") || "";
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export type Guard = { ok: true; session: Session } | { ok: false; response: Response };

/** Use at the top of every admin route handler. */
export async function requireAdmin(req: Request): Promise<Guard> {
  const session = await currentSession();
  if (!session) return { ok: false, response: Response.json({ error: "Unauthorised" }, { status: 401 }) };
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !(await sameOrigin(req)))
    return { ok: false, response: Response.json({ error: "Bad origin" }, { status: 403 }) };
  return { ok: true, session };
}

/** Creates the first admin user from env vars if none exists (prints a random password otherwise). */
export async function ensureFirstUser() {
  const a = await db();
  if ((await a.countUsers()) > 0) return;
  const u = (process.env.ADMIN_USER || "admin").toLowerCase();
  const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");
  await a.createUser(u, await hashPassword(pw));
  console.log(`\n[admin] First admin user created → username: ${u}   password: ${pw}`);
  console.log("[admin] Change it after first login (Settings → Change password).\n");
}

/* --- simple in-memory rate limiter (per process) --- */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) || []).filter(t => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  return list.length > limit;
}
