import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled",
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    titleGenerator:{
      type: String,
      enum: ["human", "ai", "none"],
      default: "none",
    },
    content: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);

