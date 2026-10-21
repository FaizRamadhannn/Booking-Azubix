#!/usr/bin/env node
// Daily backup of student data (bookings + private packages) from Supabase.
//
// Keeps only two files, so it never grows:
//   students-latest.json    today's copy
//   students-previous.json  yesterday's copy
//
// If the private package count drops (packages are never deleted in normal
// use), the database may have been damaged. The new copy is then saved as
// students-ALERT-<date>.json and the two good copies are left untouched.
//
// Usage: node scripts/backup-students.mjs [backup-dir]

import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const backupDir = process.argv[2] ?? join(homedir(), "Backups", "booking-azubix");
const TABLES = ["bookings", "private_packages"];
const PAGE_SIZE = 1000;

process.loadEnvFile(join(projectDir, ".env.local"));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase URL or service role key in .env.local");

async function fetchTable(table) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&order=created_at.asc`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Range: `${from}-${from + PAGE_SIZE - 1}`,
      },
    });
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

async function readCount(file, table) {
  try {
    return JSON.parse(await readFile(file, "utf8")).counts[table] ?? 0;
  } catch {
    return 0;
  }
}

const data = {};
for (const table of TABLES) data[table] = await fetchTable(table);

const backup = {
  createdAt: new Date().toISOString(),
  counts: Object.fromEntries(TABLES.map((t) => [t, data[t].length])),
  ...data,
};

await mkdir(backupDir, { recursive: true, mode: 0o700 });
const latest = join(backupDir, "students-latest.json");
const previous = join(backupDir, "students-previous.json");
const tmp = join(backupDir, ".students-new.json");

// Write to a temp file first so a crash never leaves a half-written backup.
await writeFile(tmp, JSON.stringify(backup, null, 2), { mode: 0o600 });
await chmod(tmp, 0o600);

const before = await readCount(latest, "private_packages");
if (backup.counts.private_packages < before) {
  const alert = join(backupDir, `students-ALERT-${backup.createdAt.slice(0, 10)}.json`);
  await rename(tmp, alert);
  console.error(
    `[${backup.createdAt}] WARNING: private_packages dropped from ${before} to ` +
      `${backup.counts.private_packages}. Good backups kept; new copy saved to ${alert}`,
  );
  process.exit(2);
}

await rename(latest, previous).catch(() => {});
await rename(tmp, latest);
console.log(`[${backup.createdAt}] OK ${JSON.stringify(backup.counts)} -> ${latest}`);
