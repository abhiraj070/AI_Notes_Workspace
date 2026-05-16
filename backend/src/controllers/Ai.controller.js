import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Note } from "../models/note.model.js";
import {generateTitleFromContent, generateSummaryFromContent} from "../services/gemini.service.js";

const generateTitle = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(noteId)) {
        throw new ApiError(400, "Invalid note id");
    }
    if (!String(content || "").trim()) {
        throw new ApiError(400, "Content cannot be empty");
    }

    const isOwner = req.user.notes.some((id) => id.equals(noteId));
    if (!isOwner) {
        throw new ApiError(403, "You don't have access to this note");
    }

    const note = await Note.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    // Only auto-generate when the title hasn't been set by the user.
    if (note.titleGenerator === "human") {
        return res
            .status(200)
            .json(new ApiResponse(200, { title: "", note }, "Title is user-set"));
    }

    const generated = await generateTitleFromContent(String(content));
    const title = generated?.trim();

    if (!title || title.toLowerCase() === "untitled") {
        return res
            .status(200)
            .json(new ApiResponse(200, { title: "", note }, "No title generated"));
    }

    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { $set: { title, titleGenerator: "ai" } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, { title, note: updatedNote }, "Title generated successfully"));
});

const generateSummary = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(noteId)) {
        throw new ApiError(400, "Invalid note id");
    }
    if (!String(content || "").trim()) {
        throw new ApiError(400, "Content cannot be empty");
    }

    const isOwner = req.user.notes.some((id) => id.equals(noteId));
    if (!isOwner) {
        throw new ApiError(403, "You don't have access to this note");
    }

    const summary = await generateSummaryFromContent(String(content));

    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { $set: { summary } },
        { new: true }
    );
    if (!updatedNote) {
        throw new ApiError(404, "Note not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { summary, note: updatedNote }, "Summary generated successfully"));
});

export { generateTitle, generateSummary };
