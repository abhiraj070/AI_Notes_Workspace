import { Router } from "express";
import { generateTitle, generateSummary } from "../controllers/Ai.controller.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(VerifyJWT);

router.route("/:noteId/ai/title").post(generateTitle);
router.route("/:noteId/ai/summary").post(generateSummary);

export default router;
