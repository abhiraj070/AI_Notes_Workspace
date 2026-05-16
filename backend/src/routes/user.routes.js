import { Router } from "express";
import { register, login, getAllNotes } from "../controllers/user.controller.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);

router.route("/notes").get(VerifyJWT, getAllNotes);

export default router;
