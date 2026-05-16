import { Router } from "express";
import {createNote, updateContent, updateTitleOrTag,deleteNote} from "../controllers/note.controller.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(VerifyJWT);

router.route("/").post(createNote);

router.route("/:noteId/content").patch(updateContent);
router.route("/:noteId").patch(updateTitleOrTag);
router.route("/:noteId").delete(deleteNote);

export default router;
