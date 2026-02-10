import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, "players.json");

function readDB() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const db = JSON.parse(raw);
    if (!db || typeof db !== "object") return {};
    return db;
  } catch {
    return {};
  }
}

function writeDB(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

app.get("/api/profile", (req, res) => {
  const name = String(req.query.name || "").trim();
  if (!name) return res.status(400).json({ error: "name required" });

  const db = readDB();
  const p = db[name] || { name, diamonds: 0 };
  return res.json(p);
});

app.post("/api/profile", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const diamonds = Number(req.body?.diamonds ?? 0);

  if (!name) return res.status(400).json({ error: "name required" });
  if (!Number.isFinite(diamonds) || diamonds < 0) {
    return res.status(400).json({ error: "invalid diamonds" });
  }

  const db = readDB();
  db[name] = { name, diamonds: Math.floor(diamonds) };
  writeDB(db);

  return res.json(db[name]);
});

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Maze Math draait op: http://localhost:${PORT}`);
});

