import "server-only";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Application, ApplicationInput } from "../validation";
import type { Status } from "../plans";

export function isDemoMode() {
  return process.env.DEMO_MODE === "true" && !process.env.VERCEL;
}
const file = path.join(process.cwd(), ".local", "applications.json");
let writeQueue: Promise<unknown> = Promise.resolve();
async function localRecords(): Promise<Application[]> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as Application[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
function localMutation<T>(mutate: (rows: Application[]) => T): Promise<T> {
  const result = writeQueue.then(async () => {
    const rows = await localRecords();
    const value = mutate(rows);
    await mkdir(path.dirname(file), { recursive: true });
    const temp = `${file}.${randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(rows, null, 2), "utf8");
    await rename(temp, file);
    return value;
  });
  writeQueue = result.catch(() => undefined);
  return result;
}
async function database<T>(query: string, init?: RequestInit): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Supabase configuration is missing. Set credentials or explicitly enable local DEMO_MODE.",
    );
  const headers = new Headers(init?.headers);
  headers.set("apikey", key);
  headers.set("Content-Type", "application/json");
  headers.set("Prefer", "return=representation");
  if (/^eyJ[^.]+\.[^.]+\.[^.]+$/.test(key))
    headers.set("Authorization", `Bearer ${key}`);
  const response = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/applications${query}`,
    {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok)
    throw new Error(`Database request failed (${response.status})`);
  return response.json() as Promise<T>;
}
export async function createApplication(input: ApplicationInput) {
  if (isDemoMode())
    return localMutation((rows) => {
      const row: Application = {
        ...input,
        id: randomUUID(),
        status: "pending",
        created_at: new Date().toISOString(),
      };
      rows.unshift(row);
      return row;
    });
  const [row] = await database<Application[]>("", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!row) throw new Error("Database returned no application");
  return row;
}
export async function listApplications(): Promise<Application[]> {
  if (isDemoMode())
    return (await localRecords()).sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  // Page through PostgREST so dashboard counts do not silently stop at 1,000 rows.
  const all: Application[] = [];
  for (let offset = 0; ; offset += 500) {
    const rows = await database<Application[]>(
      `?select=*&order=created_at.desc,id.asc&limit=500&offset=${offset}`,
    );
    all.push(...rows);
    if (rows.length < 500) return all;
  }
}
export async function getApplication(id: string) {
  if (isDemoMode())
    return (await localRecords()).find((row) => row.id === id) ?? null;
  const rows = await database<Application[]>(
    `?id=eq.${encodeURIComponent(id)}&select=*`,
  );
  return rows[0] ?? null;
}
export async function updateStatus(id: string, status: Status) {
  if (isDemoMode())
    return localMutation((rows) => {
      const row = rows.find((item) => item.id === id);
      if (!row) return null;
      row.status = status;
      return row;
    });
  const rows = await database<Application[]>(
    `?id=eq.${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
  return rows[0] ?? null;
}
