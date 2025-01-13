import express from "express" ;
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express() ;

app.use(cors({
    origin: process.env.CORS_ORIGIN , 
    credentials: true 


}))

//ROUTEs

import userRouter from "./routes/user.routes.js"
// ROUTES DECLEARTAION 
app.use("/api/v1/users" , userRouter)



// To accept JSON
app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded())

app.use(express.static("public"))

app.use(cookieParser())
export {app}