import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(express.static("public"));

// Cookie parsing middleware
app.use(cookieParser());

// CORS setup
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Fallback for local dev
        credentials: true,
    })
);

// Routes declaration
app.use("/api/v1/users", userRouter);

export { app };
