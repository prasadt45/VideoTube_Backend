import { Router } from "express";
import {getUserChannelProfile, getWatchHistory, registerUser, updateUserAvatar, updateUserCoverImage} from "../controllers/user.controller.js" 
import {upload} from "../middlewares/multer.middleware.js"
import { loginUser  , refreshAccessToken , changeCurrentPassword , getCurrentUser} from "../controllers/user.controller.js";
import { logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateAccountDetails } from "../controllers/user.controller.js";

const router = Router() 

router.route("/register").post(
    upload.fields([
      {name : "avatar" , 
        maxCount: 1 ,
      } ,
      {
        name : "coverImage" ,
        maxCount: 1 ,
      }
    ]),
    registerUser)

router.route("/login").post(loginUser)


// secured Routes 
// verifyJWT is middlware which will runs firsst after that logoutUser will be executed 
router.route("/logout").post(verifyJWT , logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT , changeCurrentPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
router.route("/update-details").patch(verifyJWT , updateAccountDetails)
router.route("/avatar").patch(verifyJWT , upload.single("avatar")  , updateUserAvatar)
router.route("/cover-image").patch(verifyJWT , upload.single("coverimage") , updateUserCoverImage)
// as we are using req.params in getUserChannelProfile 
router.route("/c/:username").get(verifyJWT , getUserChannelProfile)
router.route("/Watch-history").get(verifyJWT , getWatchHistory)

export default router;

