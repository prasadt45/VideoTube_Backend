import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Apiresponce } from '../utils/Apiresponce.js';

const registerUser = asyncHandler(async (req, res) => {
    // Get User details from frontend checked
    const { fullname, email, username, password } = req.body
    console.log("email", email)
    // validation , format checking 
    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === ""
        )) {
        throw new ApiError(400, "All Fiels Are required ")
    }
    // check user already exists  
    const exixstedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (exixstedUser) {
        throw new ApiError(409, "User Already Exist")
    }

    //  check avater and images 

    // multer takes file to server and we get path where it stored 
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    // we need to upload avatar to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }
    // create user object -> craete entry in dB .
    const user =  await User.create({
        fullname,
        avatar:avatar.url , // send only url from avatar
        coverImage:coverImage?.url || "" ,// if cover Image is not there take it as empty
        email,
        username: username.toLowerCase(),
        password 
    })
 // by default all fields are selected but to remove use - sign 
    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken " // remove password and refresh token from responce
    )
 
// check for respnce if user created or not

    if(!createdUser){
        throw new ApiError(500, "Somthing went wrong while registring ")
    }
 // return res ; 
   return res.status(201).json(
    new Apiresponce(200 , createdUser , "User Created Successfully"  )
   )



});

export { registerUser };







