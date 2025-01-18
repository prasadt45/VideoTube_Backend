import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary , deltefromcloudinary } from "../utils/cloudinary.js"
import { Apiresponce } from '../utils/Apiresponce.js';
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()
        user.refreshToken = refreshtoken
        await user.save({ validateBeforeSave: false })

        return { accesstoken, refreshtoken }
    } catch (error) {
        throw new ApiError(500, "Internal Server Error while generating token");

    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get User details from frontend checked
    const { fullname, email, username, password } = req.body
    console.log(req.body)

    console.log("email", email)
    // validation , format checking 
    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === ""
        )) {
        throw new ApiError(400, "All Fiels Are required ")
    }
    // check user already exists  
    const exixstedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (exixstedUser) {
        throw new ApiError(409, "User Already Exist")
    }

    //  check avater and images 

    // multer takes file to server and we get path where it stored 
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;

    // Check if `req.files` exists, is an object, and contains an array for `coverImage`.
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    // we need to upload avatar to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }
    console.log(req.files)
    // create user object -> craete entry in dB .
    const user = await User.create({
        fullname,
        avatar: avatar.url, // send only url from avatar
        coverImage: coverImage?.url || "",// if cover Image is not there take it as empty
        email,
        username: username.toLowerCase(),
        password
    })
    // by default all fields are selected but to remove use - sign 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken " // remove password and refresh token from responce
    )

    // check for respnce if user created or not

    if (!createdUser) {
        throw new ApiError(500, "Somthing went wrong while registring ")
    }
    // return res ; 
    return res.status(201).json(
        new Apiresponce(200, createdUser, "User Created Successfully")
    )





});
// TODOS FOR LOGIN 
/*
take data from req.body 
username password must be in db means user should be registered
find user 
validate if user found 
password check and after that genrate access and refresh token 
// send cookies with token
send responce

*/
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "Username or Email is Required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User Not Exists");
    }

    const ispasswordvalid = await user.isPasswordCorrect(password);
    if (!ispasswordvalid) {
        throw new ApiError(401, "Invalid Password");
    }

    const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(user._id);

    // while sending cookies we will decide what to send to user inside that we will not pass passwrod and refresh token

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    // Send Cookies 
    const options = {
        httpOnly: true,// cokkies will be accesible only by server
        secure: true
    }
    return res.status(200).
        cookie("accessToken", accesstoken, options)
        .cookie("refreshToken", refreshtoken, options)
        .json(
            new Apiresponce(
                200,
                {
                    user: loggedInUser, accesstoken, refreshtoken
                },
                "User logged in successfully"

            )
        )





})

const logoutUser = asyncHandler(async(req , res)=>{
    // after using middleware we have access to req.user as we have added it in our request by using middleware verifyjwt
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            }

        } ,
        {
            new : true
        }
    )
    const options = {
        httpOnly: true,// cokkies will be accesible only by server
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken" , options)
    .json(new Apiresponce(200 , {} , "User Logged Out"))

})
// Here we create an endpoint to refresh token
const refreshAccessToken = asyncHandler(async(req , res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorized Request")
    }
    try {
        const decodedToken =  jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401 , "Inavalid Refresh Token")
        }
        // here we check if the user has a valid refresh token
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "Refresh Token Expired")
        }
    
        const options = {
            httpOnly : true , 
            secure : true 
        }
        // here we generate a new access token and refresh token
        const {accessToken , newrefreshToken} = await generateAccessAndRefreshToken(user._id)
        return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" ,newrefreshToken , options)
        .json(
            new Apiresponce(
                200 , 
                {
                    accessToken ,
                     refreshToken : newrefreshToken
                } ,
                "Access Token and Refresh Token Generated and Refreshed "
            )
        )
    } catch (error) {
        throw new ApiError(401 , "Unauthorized Request ")
        
    }
})

const changeCurrentPassword = asyncHandler(async(req , res)=>{
    const {oldPassword , newPassword} = req.body 
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400 , "Invalid Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave : false})
    return res.status(200)
    .json(new Apiresponce(200 , {} , "Password Changed Successfully "))
})

const getCurrentUser = asyncHandler(async(req , res)=>{
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401 , "ERROR")
    }
    return res.status(200)
    .json(new Apiresponce(200 , req.user , "Current User Fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req , res)=>{
    const {fullname , email } = req.body
    if(!fullname || !email){
        throw new ApiError(400 , "All Fields Required") ;

    }
    const user = await  User.findByIdAndUpdate(
        req.user?._id ,
        {
            $set: {
                fullname : fullname , 
                email : email ,
            }
        } , 
        {new : true}
    ).select("-password")

    return res.status(200)
    .json(new Apiresponce(200 , user , "Account Details Updated Sucessfully")) ; 
})

// AVATAR UPDATE 
const updateUserAvatar = asyncHandler(async(req , res)=>{
    const AvatarLocalPath =  req.file?.path
    if(!AvatarLocalPath){

       throw new ApiError(400 , 'Avatar FILE is Misssing')
    }
    const avatar = await uploadOnCloudinary(AvatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400 , 'Error while uploading avatar')
    }
    const user = await User.findByIdAndUpdate(
        req.user._id ,
        {
          $set : {
            avatar : avatar.url ,
          }
        } ,
        {
            new : true
        }
    ).select("-password")
    return res.status(200)
    .json(
        new Apiresponce(
            200 ,
            user , 
            "Avatar Updated Sucessfully"

        )
    )
})

// UPDATE COVERIMAGE
const updateUserCoverImage = asyncHandler(async(req , res)=>{
    const coverImagepath = req.file.path ;
    if(!coverImagepath){
        throw new ApiError(400 , 'Cover Image is Missing')
    }
    const coverImage = await uploadOnCloudinary(coverImagepath)
    if(!coverImage.url){
        throw new ApiError(400 , 'Error while uploading cover image')
        }
        const userForDeleteOperation = await User.findById(req.user._id) ;
        if(!userForDeleteOperation){
            throw new ApiError(404 , 'User not found')
        }
        const oldfilepath = userForDeleteOperation.coverImage ; 
         if(userForDeleteOperation){
            await deltefromcloudinary(oldfilepath)
         }
        
        const user = await User.findByIdAndUpdate(
            req.user._id ,
            {
                $set:{
                    coverImage : coverImage.url ,
                }
            },
            {
                new : true
            }
        ).select("-password")

        return res.status(200)
    .json(
        new Apiresponce(
            200 ,
            user , 
            "CoverImage Updated Sucessfully"

        )
    )

})

export { registerUser, loginUser  , logoutUser , refreshAccessToken  , changeCurrentPassword , getCurrentUser ,updateAccountDetails , updateUserAvatar , updateUserCoverImage};







