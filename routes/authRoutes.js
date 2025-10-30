import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Rotas de autenticação
router.post("/register", registerUser);
router.post("/login", loginUser);

// Exportação padrão (import authRoutes from ...)
export default router;
