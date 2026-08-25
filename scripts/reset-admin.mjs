/* Admin password recovery.
 *
 *   npm run reset-admin                 → resets to ADMIN_PASSWORD from .env
 *   npm run reset-admin -- "new pass"   → resets to the password you pass in
 *
 * ensureFirstUser() only seeds an account when the table is empty, so once the
 * password has been changed in the panel the env value no longer opens the door.
 * This is the supported way back in. It mirrors the backend selection in lib/db.ts.
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

/* Minimal .env reader — this script runs outside Next, which normally loads it. */
const envFile = path.join(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const username = (process.env.ADMIN_USER || "admin").toLowerCase();
const password = process.argv[2] || process.env.ADMIN_PASSWORD;
if (!password) {
  console.error("No password given. Pass one as an argument or set ADMIN_PASSWORD in .env.");
  process.exit(1);
}
const hash = await bcrypt.hash(password, 12);

async function apply() {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, MYSQL_URL, MYSQL_HOST } = process.env;

  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    const { data } = await sb.from("admin_users").select("id").eq("username", username).maybeSingle();
    if (data) await sb.from("admin_users").update({ password_hash: hash }).eq("id", data.id);
    else await sb.from("admin_users").insert({ username, password_hash: hash });
    await sb.from("admin_sessions").delete().neq("token_hash", "");
    return "supabase";
  }

  if (MYSQL_URL || MYSQL_HOST) {
    const mysql = (await import("mysql2/promise")).default;
    const conn = MYSQL_URL
      ? await mysql.createConnection(MYSQL_URL)
      : await mysql.createConnection({ host: MYSQL_HOST, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE });
    const [rows] = await conn.execute("SELECT id FROM admin_users WHERE username = ?", [username]);
    if (rows.length) await conn.execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", [hash, rows[0].id]);
    else await conn.execute("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)", [username, hash]);
    await conn.execute("DELETE FROM admin_sessions");
    await conn.end();
    return "mysql";
  }

  const { default: Database } = await import("better-sqlite3");
  const file = path.join(process.cwd(), "data", "indisun.sqlite");
  if (!fs.existsSync(file)) { console.error(`No database at ${file} — start the app once first.`); process.exit(1); }
  const db = new Database(file);
  const row = db.prepare("SELECT id FROM admin_users WHERE username = ?").get(username);
  if (row) db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").run(hash, row.id);
  else db.prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)").run(username, hash);
  db.prepare("DELETE FROM admin_sessions").run();
  db.prepare("DELETE FROM login_attempts").run();
  return "sqlite";
}

const backend = await apply();
console.log(`[admin] Password reset on ${backend} for "${username}". All existing sessions were signed out.`);
