import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* =========================
   SETUP PATH (__dirname)
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   APP
========================= */
const app = express();
const PORT = process.env.PORT || 3001;

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   FILES
========================= */
const PRECIOS_FILE = path.join(__dirname, "precios.json");
const PEDIDOS_FILE = path.join(__dirname, "pedidos.json");

/* =========================
   HELPERS
========================= */
function leerJSON(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function guardarJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* =========================
   ENDPOINTS
========================= */

// ---- Precios ----
app.get("/precios", (req, res) => {
  const precios = leerJSON(PRECIOS_FILE);
  res.json(precios);
});

app.post("/precios", (req, res) => {
  guardarJSON(PRECIOS_FILE, req.body);
  res.json({ ok: true });
});

// ---- Pedidos ----
app.get("/pedidos", (req, res) => {
  const pedidos = leerJSON(PEDIDOS_FILE) || [];
  res.json(pedidos);
});

app.post("/pedidos", (req, res) => {
  const pedidos = leerJSON(PEDIDOS_FILE) || [];

  const nuevoPedido = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    estado: "nuevo",
    ...req.body,
  };

  pedidos.push(nuevoPedido);
  guardarJSON(PEDIDOS_FILE, pedidos);

  res.json({ ok: true });
});

app.patch("/pedidos/:id", (req, res) => {
  const pedidos = leerJSON(PEDIDOS_FILE) || [];
  const id = Number(req.params.id);

  const actualizado = pedidos.map((p) =>
    p.id === id ? { ...p, estado: req.body.estado } : p
  );

  guardarJSON(PEDIDOS_FILE, actualizado);
  res.json({ ok: true });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log("Backend corriendo en puerto", PORT);
});

