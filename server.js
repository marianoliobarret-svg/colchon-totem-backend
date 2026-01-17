import cors from "cors";
app.use(cors());
const express = require("express");
const fs = require("fs");
const path = require("path");
const PRECIOS_FILE = path.join(__dirname, "precios.json");

const app = express();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Backend corriendo en puerto", PORT);
});


app.use(cors());
app.use(express.json());

const PEDIDOS_FILE = path.join(__dirname, "pedidos.json");

/* ======================
   AUTH SIMPLE
====================== */
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
const ADMIN_TOKEN = "token_admin_colchon_totem";

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: "No autorizado" });
  }

  next();
}

/* ======================
   Helpers
====================== */
function leerPrecios() {
  return JSON.parse(fs.readFileSync(PRECIOS_FILE, "utf-8"));
}

function guardarPrecios(precios) {
  fs.writeFileSync(
    PRECIOS_FILE,
    JSON.stringify(precios, null, 2)
  );
}

function leerPedidos() {
  return JSON.parse(fs.readFileSync(PEDIDOS_FILE, "utf-8"));
}

function guardarPedidos(pedidos) {
  fs.writeFileSync(
    PEDIDOS_FILE,
    JSON.stringify(pedidos, null, 2)
  );
}

/* ======================
   Endpoints
====================== */
app.get("/precios", authMiddleware, (req, res) => {
  res.json(leerPrecios());
});

app.put("/precios", authMiddleware, (req, res) => {
  guardarPrecios(req.body);
  res.json({ ok: true });
});


app.get("/", (req, res) => {
  res.send("Backend Colchon Totem funcionando");
});

/* LOGIN */

app.post("/login", (req, res) => {
  console.log("LOGIN BODY:", req.body);

  const { user, pass } = req.body;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return res.status(200).json({
      token: ADMIN_TOKEN,
    });
  }

  return res.status(401).json({
    error: "Credenciales inválidas",
  });
});



/* PEDIDOS (protegidos) */
app.get("/pedidos", authMiddleware, (req, res) => {
  res.json(leerPedidos());
});

app.post("/pedidos", (req, res) => {
  const pedidos = leerPedidos();

  const nuevoPedido = {
    id: `pedido_${Date.now()}`,
    fecha: new Date().toISOString(),
    ...req.body,
    estado: "nuevo",
  };

  pedidos.push(nuevoPedido);
  guardarPedidos(pedidos);

  res.status(201).json(nuevoPedido);
});

app.put("/pedidos/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const pedidos = leerPedidos();
  const pedido = pedidos.find((p) => p.id === id);

  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  pedido.estado = estado;
  guardarPedidos(pedidos);

  res.json(pedido);
});

/* ======================
   Start
====================== */
app.listen(PORT, () => {
  console.log(
    `Servidor backend corriendo en http://localhost:${PORT}`
  );
});


