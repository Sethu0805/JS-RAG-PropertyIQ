// Tiny "database": one JSON file at data/db.json. Easy to read, no setup.
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "db.json");

export function load() {
  if (!fs.existsSync(FILE)) return { properties: [], documents: [], messages: [] };
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
export function save(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db));
}
export const newId = () => Math.random().toString(36).slice(2, 10);
