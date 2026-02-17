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
   MIDDLEWARE DE AUTENTICACIÓN
========================= */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: "Token inválido" });
  }
  next();
}

/* =========================
   ENDPOINTS
========================= */
// ---- Eliminar ----

app.delete("/pedidos/:id", authMiddleware, (req, res) => {
  const pedidos = leerJSON(PEDIDOS_FILE) || [];
  const id = Number(req.params.id);

  const filtrados = pedidos.filter(p => p.id !== id);

  guardarJSON(PEDIDOS_FILE, filtrados);

  res.json({ ok: true });
});


// ---- Login ----
app.post("/login", (req, res) => {
  const { user, pass } = req.body;

  if (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS
  ) {
    return res.json({ token: process.env.ADMIN_TOKEN });
  }

  res.status(401).json({ error: "Credenciales incorrectas" });
});

// ---- Precios ----
app.get("/precios", (req, res) => {
  const precios = leerJSON(PRECIOS_FILE);
  res.json(precios);
});

app.post("/precios", authMiddleware, (req, res) => {
  guardarJSON(PRECIOS_FILE, req.body);
  res.json({ ok: true });
});

// ---- Pedidos ----
app.get("/pedidos", authMiddleware, (req, res) => {
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

app.patch("/pedidos/:id", authMiddleware, (req, res) => {
  const pedidos = leerJSON(PEDIDOS_FILE) || [];
  const id = Number(req.params.id);

  const actualizado = pedidos.map((p) =>
    p.id === id ? { ...p, estado: req.body.estado } : p
  );

  guardarJSON(PEDIDOS_FILE, actualizado);
  res.json({ ok: true });
});
const borrarPedido = async (id) => {
  if (!confirm("¿Seguro que querés eliminar este pedido?")) return;

  try {
    await eliminarPedido(id);
    setPedidos(prev => prev.filter(p => p.id !== id));
  } catch {
    alert("Error al eliminar pedido");
  }
};


/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log("Backend corriendo en puerto", PORT);
});

