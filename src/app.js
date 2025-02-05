import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import tweetrouter from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentrouter from "./routes/comment.routes.js";

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
app.use("/api/v1/tweets", tweetrouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentrouter);

export { app };
