import { saveDiagnosticAnswers } from "../controllers/userController.js";
import express from "express";
import {
  getUserProfile,
  updateUserXP,
  updateUserPreferences,
  getLeaderboard,
  getUserAchievements,
  checkAchievements,
  updateUnlockedPhases,
} from "../controllers/userController.js";
import { getUserAnalytics } from "../controllers/userAnalyticsController.js";

const router = express.Router();

// ⚙️ Coloque todas as rotas específicas primeiro!
router.put("/:id/unlockedPhases", updateUnlockedPhases);
router.get("/:id/analytics", getUserAnalytics);
router.get("/leaderboard/all", getLeaderboard);
router.get("/:id/achievements", getUserAchievements);
router.get("/:id/checkAchievements", checkAchievements);
router.put("/:id/xp", updateUserXP);
router.put("/:id/preferences", updateUserPreferences);

// ⚠️ Só agora a rota genérica, por último!
router.get("/:id", getUserProfile);

// 🧠 Diagnóstico
router.post("/diagnostic", saveDiagnosticAnswers);

export default router;
