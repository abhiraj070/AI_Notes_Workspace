import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import noteRouter from "./routes/note.routes.js";
import aiRouter from "./routes/ai.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.NODE_ENV==="development" ? "http://localhost:5173" : process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(helmet());
app.use(cookieParser());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/notes", aiRouter);

app.use(errorHandler);

export default app;
