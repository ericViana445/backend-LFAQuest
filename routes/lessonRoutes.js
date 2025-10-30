// routes/lessonRoutes.js
import express from "express";
import { completeLesson } from "../controllers/lessonController.js";

const router = express.Router();

// sem autenticação
router.post("/complete", completeLesson);

export default router;
