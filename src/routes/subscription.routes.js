import { Router } from "express";
import { toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()  ;
router.route("/toggle-subscription/:channelid").post( verifyJWT , toggleSubscription) ;

export default router ;
