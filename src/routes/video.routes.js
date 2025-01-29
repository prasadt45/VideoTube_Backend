import Router from "express";
import {uploadVideo , getvideobyid , updatevideo} from "../controllers/video.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload-video").post(verifyJWT , 
    upload.fields(
        [
            {
                name : "videoFile" ,
                maxCount : 1
            } , 
            {
                name : "thumbnail" ,
                maxCount : 1
            }
        ]
    ) 
    , 
    uploadVideo
)

router.route("/get-video/:videoid").get(verifyJWT , getvideobyid)
router.route("/update-video/:videoid").post(verifyJWT ,
    upload.fields(
        [
            {
                name : "videoFile" ,
                maxCount : 1

            } , 
            {
                name : "thumbnail" ,
                maxCount : 1
            }
        ]
    ) , updatevideo)

export default router;
