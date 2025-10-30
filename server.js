import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import "./db.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// =========================
// 🔧 CONFIGURAÇÃO DO .ENV
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, ".env");
console.log("📁 Procurando .env em:", envPath);

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) console.error("❌ Erro ao carregar .env:", result.error);
} else {
  console.error("🚨 Arquivo .env não encontrado!");
}

dotenv.config({ path: path.join(__dirname, ".env") });

// =========================
// 🚀 INICIALIZA O EXPRESS
// =========================
const app = express();

// 🔍 Middleware de log para visualizar TODAS as requisições
app.use((req, res, next) => {
  console.log(`📨 Requisição recebida: ${req.method} ${req.url}`);
  console.log(`🧾 Origem: ${req.headers.origin || "Desconhecida"}`);
  next();
});

// =========================
// 🔓 CONFIGURAÇÃO DO CORS
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:5173", // ambiente local
      "https://front-lfaquest.netlify.app", // frontend em produção
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// =========================
// 📦 MIDDLEWARES E ROTAS
// =========================
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/lesson", lessonRoutes);

app.get("/", (req, res) => {
  res.send("Servidor backend rodando com sucesso!");
});

// =========================
// 🔥 INICIA O SERVIDOR
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("✅ Backend iniciado com sucesso!");
  console.log(`🌐 Rodando em: http://localhost:${PORT}`);
  console.log("🔗 Rotas principais:");
  console.log("   → /api/auth");
  console.log("   → /api/users");
  console.log("   → /api/store");
  console.log("   → /api/lesson");
  console.log("========================================");
});
