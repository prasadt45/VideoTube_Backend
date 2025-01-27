import { Router } from "express";
import { createTweet , updateTweet , deleteTweet , getalltweet} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetrouter = Router();

tweetrouter.route("/create-tweet").post(verifyJWT, createTweet);
tweetrouter.route("/delete-tweet/:tweetid").patch(verifyJWT, deleteTweet);
tweetrouter.route("/update-tweet/:tweetid").patch(verifyJWT, updateTweet);
tweetrouter.route("/get-all-tweets").get(verifyJWT , getalltweet);




export default tweetrouter;

