import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Note } from "../models/note.model.js";
import { User } from "../models/user.model.js";

const createNote = asyncHandler(async (req, res) => {
    const { title, tags } = req.body
    if(!title){
        throw new ApiError(400, "Title is required")
    }

    const note = await Note.create({
        title,
        tags: tags || [],
        content: "",
    })
    if(!note){
        throw new ApiError(500, "Error while creating note")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        { $push: { notes: note._id } }
    )

    return res
    .status(201)
    .json(new ApiResponse(201, { note }, "Note created successfully"))
})

const updateContent = asyncHandler(async (req, res) => {
    const { noteId } = req.params
    const { content } = req.body

    if(!mongoose.isValidObjectId(noteId)){
        throw new ApiError(400, "Invalid note id")
    }
    if(content === undefined || content === null){
        throw new ApiError(400, "Content is required")
    }

    const isOwner = req.user.notes.some((id) => id.equals(noteId))
    if(!isOwner){
        throw new ApiError(403, "You don't have access to this note")
    }

    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { $set: { content } },
        { new: true }
    )
    if(!updatedNote){
        throw new ApiError(404, "Note not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { note: updatedNote }, "Content updated successfully"))
})

const updateTitleOrTag = asyncHandler(async (req, res) => {
    const { noteId } = req.params
    const { title, tags } = req.body

    if(!mongoose.isValidObjectId(noteId)){
        throw new ApiError(400, "Invalid note id")
    }
    if(!title && !tags){
        throw new ApiError(400, "Provide at least title or tags to update")
    }

    const isOwner = req.user.notes.some((id) => id.equals(noteId))
    if(!isOwner){
        throw new ApiError(403, "You don't have access to this note")
    }

    const updates = {}
    if(title) updates.title = title
    if(tags) updates.tags = tags

    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { $set: updates },
        { new: true }
    )
    if(!updatedNote){
        throw new ApiError(404, "Note not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { note: updatedNote }, "Note updated successfully"))
})

const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params

    if(!mongoose.isValidObjectId(noteId)){
        throw new ApiError(400, "Invalid note id")
    }

    const isOwner = req.user.notes.some((id) => id.equals(noteId))
    if(!isOwner){
        throw new ApiError(403, "You don't have access to this note")
    }

    const deletedNote = await Note.findByIdAndDelete(noteId)
    if(!deletedNote){
        throw new ApiError(404, "Note not found")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { notes: noteId } }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, { noteId }, "Note deleted successfully"))
})

export { createNote, updateContent, updateTitleOrTag, deleteNote }
