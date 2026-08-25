/* Data layer with three interchangeable backends, auto-selected at boot:
 *   1. Supabase (Postgres)  — SUPABASE_URL + SUPABASE_SERVICE_KEY   (recommended in production)
 *   2. MySQL                — MYSQL_URL or MYSQL_HOST/USER/PASSWORD/DATABASE
 *   3. SQLite               — zero-setup fallback at data/indisun.sqlite
 * Server-only: the service-role key never reaches the browser.
 */
import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { AdminUser, Enquiry, Product, Session, SiteContent } from "./types";
import { SITE_DEFAULTS } from "./seed";
import { PRODUCT_SEED } from "./products-seed";

export interface Adapter {
  name: "supabase" | "mysql" | "sqlite";
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  upsertProduct(p: Product): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  getSite(): Promise<SiteContent | null>;
  setSite(v: SiteContent): Promise<SiteContent>;
  insertEnquiry(e: Enquiry): Promise<void>;
  listEnquiries(): Promise<Enquiry[]>;
  updateEnquiry(id: string, patch: { status?: string; note?: string }): Promise<Enquiry | null>;
  countUsers(): Promise<number>;
  createUser(username: string, hash: string): Promise<void>;
  getUser(username: string): Promise<AdminUser | null>;
  touchLogin(id: number): Promise<void>;
  setPassword(id: number, hash: string): Promise<void>;
  createSession(tokenHash: string, userId: number, ttlMs: number, ip: string, ua: string): Promise<void>;
  getSession(tokenHash: string): Promise<Session | null>;
  deleteSession(tokenHash: string): Promise<void>;
  deleteUserSessions(userId: number): Promise<void>;
  purgeSessions(): Promise<void>;
  recordAttempt(ip: string, username: string, ok: boolean): Promise<void>;
  recentFailures(ip: string, minutes: number): Promise<number>;
  putObject?(name: string, buf: Buffer, mime: string): Promise<string>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const NOW = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const iso = (v: unknown) => { const s = String(v ?? ""); return new Date(s.includes("T") || s.endsWith("Z") ? s : s.replace(" ", "T") + "Z").toISOString(); };

/* eslint-disable @typescript-eslint/no-explicit-any */
const rowToProduct = (r: any): Product => ({
  id: r.id, brand: r.brand, molecule: r.molecule, category: r.category, segment: r.segment || "", pack: r.pack || "",
  icon: r.icon || "pill", short: r.short_line || "", description: r.description || "",
  indications: typeof r.indications === "string" ? JSON.parse(r.indications || "[]") : (r.indications || []),
  dosage: r.dosage || "", mrp: +r.mrp || 0, image: r.image || undefined, sort_order: +(r.sort_order ?? 0)
});
const rowToEnquiry = (r: any): Enquiry => ({
  id: r.id, createdAt: iso(r.created_at), status: r.status, type: r.type, name: r.name, email: r.email,
  phone: r.phone, territory: r.territory || "", product: r.product || "", message: r.message || "", note: r.note ?? null
});
const productRow = (p: Product) => ({
  id: p.id, brand: p.brand, molecule: p.molecule, category: p.category, segment: p.segment || "", pack: p.pack || "",
  icon: p.icon || "pill", short_line: p.short || "", description: p.description || "", indications: p.indications || [],
  dosage: p.dosage || "", mrp: +p.mrp || 0, image: p.image || null, sort_order: +(p.sort_order ?? 0)
});

/* ===================== SQL adapters (MySQL / SQLite) ===================== */
const SCHEMA_MYSQL = `
CREATE TABLE IF NOT EXISTS products (id VARCHAR(80) PRIMARY KEY, brand VARCHAR(120) NOT NULL, molecule VARCHAR(255) NOT NULL, category VARCHAR(30) NOT NULL, segment VARCHAR(80), pack VARCHAR(160), icon VARCHAR(40), short_line VARCHAR(255), description TEXT, indications JSON, dosage VARCHAR(400), mrp INT DEFAULT 0, image VARCHAR(400), sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS enquiries (id CHAR(36) PRIMARY KEY, created_at DATETIME NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'new', type VARCHAR(40), name VARCHAR(160) NOT NULL, email VARCHAR(200) NOT NULL, phone VARCHAR(40) NOT NULL, territory VARCHAR(160), product VARCHAR(160), message TEXT, note TEXT, ip VARCHAR(64), INDEX (created_at), INDEX (status)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS site_content (k VARCHAR(40) PRIMARY KEY, v JSON NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS admin_users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(64) UNIQUE NOT NULL, password_hash VARCHAR(100) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, last_login DATETIME NULL) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS admin_sessions (token_hash CHAR(64) PRIMARY KEY, user_id INT NOT NULL, created_at DATETIME NOT NULL, expires_at DATETIME NOT NULL, ip VARCHAR(64), ua VARCHAR(255), INDEX (expires_at)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS login_attempts (id INT AUTO_INCREMENT PRIMARY KEY, ip VARCHAR(64), username VARCHAR(64), ok TINYINT, at DATETIME NOT NULL, INDEX (ip, at)) ENGINE=InnoDB;`;

const SCHEMA_SQLITE = `
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, brand TEXT NOT NULL, molecule TEXT NOT NULL, category TEXT NOT NULL, segment TEXT, pack TEXT, icon TEXT, short_line TEXT, description TEXT, indications TEXT, dosage TEXT, mrp INTEGER DEFAULT 0, image TEXT, sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS enquiries (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', type TEXT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, territory TEXT, product TEXT, message TEXT, note TEXT, ip TEXT);
CREATE INDEX IF NOT EXISTS enq_created ON enquiries(created_at);
CREATE TABLE IF NOT EXISTS site_content (k TEXT PRIMARY KEY, v TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, last_login TEXT);
CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, ip TEXT, ua TEXT);
CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, username TEXT, ok INTEGER, at TEXT NOT NULL);`;

type Run = (sql: string, params?: unknown[]) => Promise<{ rows: any[]; affected: number }>;

function sqlAdapter(name: "mysql" | "sqlite", run: Run): Adapter {
  const q = async (sql: string, p?: unknown[]) => (await run(sql, p)).rows;
  const one = async (sql: string, p?: unknown[]) => (await run(sql, p)).rows[0] ?? null;
  const upsertTail = name === "mysql"
    ? "ON DUPLICATE KEY UPDATE brand=VALUES(brand),molecule=VALUES(molecule),category=VALUES(category),segment=VALUES(segment),pack=VALUES(pack),icon=VALUES(icon),short_line=VALUES(short_line),description=VALUES(description),indications=VALUES(indications),dosage=VALUES(dosage),mrp=VALUES(mrp),image=VALUES(image)"
    : "ON CONFLICT(id) DO UPDATE SET brand=excluded.brand,molecule=excluded.molecule,category=excluded.category,segment=excluded.segment,pack=excluded.pack,icon=excluded.icon,short_line=excluded.short_line,description=excluded.description,indications=excluded.indications,dosage=excluded.dosage,mrp=excluded.mrp,image=excluded.image,updated_at=CURRENT_TIMESTAMP";
  const siteTail = name === "mysql" ? "ON DUPLICATE KEY UPDATE v=VALUES(v)" : "ON CONFLICT(k) DO UPDATE SET v=excluded.v, updated_at=CURRENT_TIMESTAMP";
  return {
    name,
    listProducts: async () => (await q("SELECT * FROM products ORDER BY sort_order, brand")).map(rowToProduct),
    getProduct: async id => { const r = await one("SELECT * FROM products WHERE id=?", [id]); return r ? rowToProduct(r) : null; },
    upsertProduct: async p => {
      const r = productRow(p);
      await run(`INSERT INTO products (id,brand,molecule,category,segment,pack,icon,short_line,description,indications,dosage,mrp,image,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ${upsertTail}`,
        [r.id, r.brand, r.molecule, r.category, r.segment, r.pack, r.icon, r.short_line, r.description, JSON.stringify(r.indications), r.dosage, r.mrp, r.image, r.sort_order]);
      return rowToProduct(await one("SELECT * FROM products WHERE id=?", [p.id]));
    },
    deleteProduct: async id => (await run("DELETE FROM products WHERE id=?", [id])).affected > 0,
    getSite: async () => { const r = await one("SELECT v FROM site_content WHERE k='site'"); return r ? (typeof r.v === "string" ? JSON.parse(r.v) : r.v) : null; },
    setSite: async v => { await run(`INSERT INTO site_content (k,v) VALUES ('site',?) ${siteTail}`, [JSON.stringify(v)]); return v; },
    insertEnquiry: async e => { await run("INSERT INTO enquiries (id,created_at,status,type,name,email,phone,territory,product,message,note,ip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [e.id, e.createdAt.slice(0, 19).replace("T", " "), e.status, e.type, e.name, e.email, e.phone, e.territory, e.product, e.message, e.note ?? null, e.ip ?? null]); },
    listEnquiries: async () => (await q("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 2000")).map(rowToEnquiry),
    updateEnquiry: async (id, { status, note }) => {
      const sets: string[] = [], vals: unknown[] = [];
      if (status) { sets.push("status=?"); vals.push(status); }
      if (typeof note === "string") { sets.push("note=?"); vals.push(note); }
      if (!sets.length) return null;
      vals.push(id); await run(`UPDATE enquiries SET ${sets.join(",")} WHERE id=?`, vals);
      const r = await one("SELECT * FROM enquiries WHERE id=?", [id]); return r ? rowToEnquiry(r) : null;
    },
    countUsers: async () => +(await one("SELECT COUNT(*) AS c FROM admin_users")).c,
    createUser: async (u, h) => { await run("INSERT INTO admin_users (username,password_hash) VALUES (?,?)", [u, h]); },
    getUser: async u => one("SELECT * FROM admin_users WHERE username=?", [u]),
    touchLogin: async id => { await run("UPDATE admin_users SET last_login=? WHERE id=?", [NOW(), id]); },
    setPassword: async (id, h) => { await run("UPDATE admin_users SET password_hash=? WHERE id=?", [h, id]); },
    createSession: async (th, uid, ttl, ip, ua) => { await run("INSERT INTO admin_sessions (token_hash,user_id,created_at,expires_at,ip,ua) VALUES (?,?,?,?,?,?)", [th, uid, NOW(), new Date(Date.now() + ttl).toISOString().slice(0, 19).replace("T", " "), ip, (ua || "").slice(0, 255)]); },
    getSession: async th => one("SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at > ?", [th, NOW()]),
    deleteSession: async th => { await run("DELETE FROM admin_sessions WHERE token_hash=?", [th]); },
    deleteUserSessions: async uid => { await run("DELETE FROM admin_sessions WHERE user_id=?", [uid]); },
    purgeSessions: async () => { await run("DELETE FROM admin_sessions WHERE expires_at <= ?", [NOW()]); },
    recordAttempt: async (ip, u, ok) => { await run("INSERT INTO login_attempts (ip,username,ok,at) VALUES (?,?,?,?)", [ip, u, ok ? 1 : 0, NOW()]); },
    recentFailures: async (ip, minutes) => +(await one("SELECT COUNT(*) AS c FROM login_attempts WHERE ip=? AND ok=0 AND at > ?", [ip, new Date(Date.now() - minutes * 60000).toISOString().slice(0, 19).replace("T", " ")])).c
  };
}

async function mysqlAdapter(): Promise<Adapter> {
  const mysql = await import("mysql2/promise");
  const url = process.env.MYSQL_URL;
  const pool = url
    ? mysql.createPool({ uri: url, waitForConnections: true, connectionLimit: 10 })
    : mysql.createPool({ host: process.env.MYSQL_HOST, port: +(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE, waitForConnections: true, connectionLimit: 10 });
  await pool.query("SELECT 1");
  for (const stmt of SCHEMA_MYSQL.split(";").map(s => s.trim()).filter(Boolean)) await pool.query(stmt);
  return sqlAdapter("mysql", async (sql, params = []) => {
    const [res] = await pool.execute(sql, params as any[]);
    return Array.isArray(res) ? { rows: res as any[], affected: 0 } : { rows: [], affected: (res as any).affectedRows || 0 };
  });
}

async function sqliteAdapter(): Promise<Adapter> {
  const { default: Database } = await import("better-sqlite3");
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "indisun.sqlite"));
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA_SQLITE);
  return sqlAdapter("sqlite", async (sql, params = []) => {
    const st = db.prepare(sql);
    if (st.reader) return { rows: st.all(...(params as any[])) as any[], affected: 0 };
    const info = st.run(...(params as any[]));
    return { rows: [], affected: info.changes };
  });
}

/* ===================== Supabase adapter ===================== */
async function supabaseAdapter(): Promise<Adapter> {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const bucket = process.env.SUPABASE_BUCKET || "uploads";
  const must = <T>(r: { data: T; error: any }): T => { if (r.error) throw new Error(`[supabase] ${r.error.message || r.error}`); return r.data; };
  must(await sb.from("site_content").select("k").limit(1)); // connectivity + schema check
  return {
    name: "supabase",
    listProducts: async () => (must(await sb.from("products").select("*").order("sort_order").order("brand")) || []).map(rowToProduct),
    getProduct: async id => { const r = must(await sb.from("products").select("*").eq("id", id).maybeSingle()); return r ? rowToProduct(r) : null; },
    upsertProduct: async p => rowToProduct(must(await sb.from("products").upsert(productRow(p), { onConflict: "id" }).select().single())),
    deleteProduct: async id => ((must(await sb.from("products").delete().eq("id", id).select("id")) as any[]) || []).length > 0,
    getSite: async () => { const r = must(await sb.from("site_content").select("v").eq("k", "site").maybeSingle()); return r ? (r as any).v : null; },
    setSite: async v => { must(await sb.from("site_content").upsert({ k: "site", v, updated_at: new Date().toISOString() }, { onConflict: "k" })); return v; },
    insertEnquiry: async e => { must(await sb.from("enquiries").insert({ id: e.id, created_at: e.createdAt, status: e.status, type: e.type, name: e.name, email: e.email, phone: e.phone, territory: e.territory, product: e.product, message: e.message, note: e.note ?? null, ip: e.ip ?? null })); },
    listEnquiries: async () => (must(await sb.from("enquiries").select("*").order("created_at", { ascending: false }).limit(2000)) || []).map(rowToEnquiry),
    updateEnquiry: async (id, patch) => {
      const upd: any = {};
      if (patch.status) upd.status = patch.status;
      if (typeof patch.note === "string") upd.note = patch.note;
      if (!Object.keys(upd).length) return null;
      const r = must(await sb.from("enquiries").update(upd).eq("id", id).select().maybeSingle());
      return r ? rowToEnquiry(r) : null;
    },
    countUsers: async () => { const { count, error } = await sb.from("admin_users").select("id", { count: "exact", head: true }); if (error) throw error; return count || 0; },
    createUser: async (u, h) => { must(await sb.from("admin_users").insert({ username: u, password_hash: h })); },
    getUser: async u => must(await sb.from("admin_users").select("*").eq("username", u).maybeSingle()) as AdminUser | null,
    touchLogin: async id => { must(await sb.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", id)); },
    setPassword: async (id, h) => { must(await sb.from("admin_users").update({ password_hash: h }).eq("id", id)); },
    createSession: async (th, uid, ttl, ip, ua) => { must(await sb.from("admin_sessions").insert({ token_hash: th, user_id: uid, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + ttl).toISOString(), ip, ua: (ua || "").slice(0, 255) })); },
    getSession: async th => {
      const r = must(await sb.from("admin_sessions").select("token_hash,user_id,expires_at,admin_users(username)").eq("token_hash", th).gt("expires_at", new Date().toISOString()).maybeSingle()) as any;
      return r ? { token_hash: r.token_hash, user_id: r.user_id, expires_at: r.expires_at, username: r.admin_users?.username } : null;
    },
    deleteSession: async th => { must(await sb.from("admin_sessions").delete().eq("token_hash", th)); },
    deleteUserSessions: async uid => { must(await sb.from("admin_sessions").delete().eq("user_id", uid)); },
    purgeSessions: async () => { must(await sb.from("admin_sessions").delete().lte("expires_at", new Date().toISOString())); },
    recordAttempt: async (ip, u, ok) => { must(await sb.from("login_attempts").insert({ ip, username: u, ok, at: new Date().toISOString() })); },
    recentFailures: async (ip, minutes) => { const { count, error } = await sb.from("login_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).eq("ok", false).gt("at", new Date(Date.now() - minutes * 60000).toISOString()); if (error) throw error; return count || 0; },
    putObject: async (name, buf, mime) => { must(await sb.storage.from(bucket).upload(name, buf, { contentType: mime, upsert: false })); return sb.storage.from(bucket).getPublicUrl(name).data.publicUrl; }
  };
}

/* ===================== init (cached across hot reloads) ===================== */
const globalForDb = globalThis as unknown as { __indisunDb?: Promise<Adapter> };

async function create(): Promise<Adapter> {
  let adapter: Adapter | null = null;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try { adapter = await supabaseAdapter(); } catch (e) { console.warn("[db] Supabase unavailable:", (e as Error).message); }
  }
  if (!adapter && (process.env.MYSQL_URL || process.env.MYSQL_HOST)) {
    try { adapter = await mysqlAdapter(); } catch (e) { console.warn("[db] MySQL unavailable:", (e as Error).message); }
  }
  if (!adapter) adapter = await sqliteAdapter();
  await seed(adapter);
  console.log(`[db] using ${adapter.name}`);
  return adapter;
}

export function db(): Promise<Adapter> {
  if (!globalForDb.__indisunDb) globalForDb.__indisunDb = create();
  return globalForDb.__indisunDb;
}

async function seed(a: Adapter) {
  if ((await a.listProducts()).length === 0) {
    let i = 0;
    for (const p of PRODUCT_SEED) await a.upsertProduct({ ...p, sort_order: i++ });
    console.log(`[db] seeded ${PRODUCT_SEED.length} products`);
  }
  const cur = await a.getSite();
  if (!cur) { await a.setSite(SITE_DEFAULTS); console.log("[db] seeded site content"); }
  else if (!cur.company || !cur.contact) {
    await a.setSite({
      ...SITE_DEFAULTS, ...cur,
      company: { ...SITE_DEFAULTS.company, ...(cur.company || {}) },
      contact: { ...SITE_DEFAULTS.contact, ...(cur.contact || {}), social: { ...SITE_DEFAULTS.contact.social, ...(cur.contact?.social || {}) } }
    });
    console.log("[db] migrated site content (added company + contact)");
  }
}
