import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js" 
import {upload} from "../middlewares/multer.middleware.js"
import { loginUser  , refreshAccessToken} from "../controllers/user.controller.js";
import { logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


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
export default router;

