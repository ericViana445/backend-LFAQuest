// routes/storeRoutes.js
import express from "express";
import { purchaseItem, getUserPurchases } from "../controllers/storeController.js";

const router = express.Router();

// Rota para registrar compra
router.post("/purchase", purchaseItem);

// Rota para listar compras de um usuário
router.get("/purchases/:user_id", getUserPurchases);

export default router;
