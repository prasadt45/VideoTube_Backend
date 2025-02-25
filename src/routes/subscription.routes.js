import { Router } from "express";
import { toggleSubscription , getuserchannelsubscribers , getSubscribedChannels } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()  ;
router.route("/toggle-subscription/:channelid").post( verifyJWT , toggleSubscription) ;
router.route("/getuserchannelsubscribers/:channelid").get(verifyJWT , getuserchannelsubscribers) ;
router.route("/getSubscribedChannels/:subscriberId").get(verifyJWT , getSubscribedChannels) ;

export default router ;
