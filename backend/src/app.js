import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import noteRouter from "./routes/note.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());
app.use(cookieParser());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/notes", noteRouter);

app.use(errorHandler);

export default app;
