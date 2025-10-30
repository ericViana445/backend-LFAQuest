//backend\routes\userRoutes.js
import { saveDiagnosticAnswers } from "../controllers/userController.js";
import express from "express";
import {
  getUserProfile,
  updateUserXP,
  updateUserPreferences,
  getLeaderboard,
  getUserAchievements,
  checkAchievements,
} from "../controllers/userController.js";
import { getUserAnalytics } from "../controllers/userAnalyticsController.js";


const router = express.Router();

// Estatísticas de aprendizado (deve vir antes da rota genérica "/:id")
router.get("/:id/analytics", getUserAnalytics);

// Rotas existentes...
router.get("/:id", getUserProfile);
router.put("/:id/xp", updateUserXP);
router.put("/:id/preferences", updateUserPreferences);
router.get("/leaderboard/all", getLeaderboard);

// 🏆 Novas rotas de conquistas
router.get("/:id/achievements", getUserAchievements);
router.get("/:id/checkAchievements", checkAchievements);

//resposta diagnostica
router.post("/diagnostic", saveDiagnosticAnswers);


export default router;
