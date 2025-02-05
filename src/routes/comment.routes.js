import { Router } from "express";
import { createComment , updatecomment  ,deletecomment ,getallcomments } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-comment/:videoId").post(verifyJWT, createComment);
router.route("/update-comment/:commentId").patch(verifyJWT, updatecomment);
router.route("/delete-comment/:commentId").patch(verifyJWT, deletecomment);
router.route("/get-all-comments/:videoId").get(verifyJWT, getallcomments);


export default router;

