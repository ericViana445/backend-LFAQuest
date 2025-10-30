import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import "./db.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import lessonRoutes from "./routes/lessonRoutes.js";




// ⚠️ Remover daqui (estava antes da criação do app)

// Utilidades e configuração do .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, ".env");
console.log("📁 Procurando .env em:", envPath);

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  console.log("📦 Variáveis carregadas:", process.env);
  if (result.error) {
    console.error("❌ Erro ao carregar .env:", result.error);
  }
} else {
  console.error("🚨 Arquivo .env não encontrado!");
}

dotenv.config({ path: path.join(__dirname, ".env") });
console.log("📁 Caminho .env:", path.join(__dirname, ".env"));
console.log("🧩 Variáveis de ambiente disponíveis:", process.env);
console.log("🔐 JWT_SECRET carregado:", process.env.JWT_SECRET);

// ✅ Agora sim, cria o app primeiro
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // ou 3000 se estiver usando React sem Vite
    credentials: true,
  })
);
app.use(express.json());

// ✅ E só depois usa o app
app.use("/api/lesson", lessonRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/store", storeRoutes);

app.get("/", (req, res) => {
  res.send("Servidor backend rodando com sucesso!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("Backend iniciado com sucesso!");
  console.log(` Acesse: http://localhost:${PORT}`);
  console.log(" Rotas principais:");
  console.log(`   → /api/auth`);
  console.log(`   → /api/users`);
  console.log(`   → /api/store`);
  console.log(`   → /api/lesson`);
  console.log("========================================");
});
