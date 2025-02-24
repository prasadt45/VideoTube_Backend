import {Router} from 'express';
import { toggleVideoLike , toggleCommentLike , toggleTweetLike , getalllikedvideo} from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'; 

const router = Router();

router.route("/toggle-video-like/:videoId").post(verifyJWT , toggleVideoLike);
router.route("/toggle-comment-like/:commentId").post(verifyJWT , toggleCommentLike);
router.route("/toggle-tweet-like/:tweetId").post(verifyJWT , toggleTweetLike);
router.route("/get-all-liked-video").get(verifyJWT , getalllikedvideo);

export default router;