import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"


// FOR LOGGING OUT USER WE NEED TO REMOVE THE JWT TOKEN FROM LOCAL STORAGE AND GET USER 
export const verifyJWT = asyncHandler(async(req , res , next)=>{
    // to take tokens from cookies we have 2 methods
  try {
     const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "") ;
  
     if(!token){
      throw new ApiError(401 , "UnAuthorized Request ")
     }
    // verify token
    const decodedToken =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    // _id is decleared in schema 
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
      throw  new ApiError(401 , "Invalid Access Token ")
    }
  
    req.user = user ; 
    next()
  } catch (error) {
     throw new ApiError(401 , error?.message || "Invalid Acccess Token ") ; 
  }


   
})