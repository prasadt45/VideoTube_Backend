import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {Apiresponce} from "../utils/Apiresponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleVideoLike = asyncHandler(async(req , res)=>{
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }
    const islikedalready = await Like.findOne(
        {
            video : videoId,
            likedby : req.user?._id

        }

    )
    if(islikedalready){
        await Like.findByIdAndDelete(islikedalready._id) ; 

        return res.status(200)
        .json(
            new Apiresponce(
                200 , 
                "Video unliked successfully" 
                
            )
        )
    }

    await Like.create({
        video : videoId,
        likedby : req.user?._id
    })

    return res.status(200)
    .json(
        new Apiresponce(
            200 , 
            "Video liked successfully" 
            
        )
    )



       
})


const toggleTweetLike = asyncHandler(async(req ,res)=>{
    const {tweetId} = req.params ;

    if(!tweetId){
        throw new ApiError(400 , "Tweet id is required")
    }

    const istweetliked = await Like.findOne({
        tweet : tweetId ,
        likedby : req.user?._id
    })

    if(istweetliked){
        await Like.findByIdAndDelete(istweetliked._id) ; 

        return res.status(200)
        .json(
            new Apiresponce(
                200 , 
                "Tweet unliked successfully" 
                
            )
        )
    }
     await Like.create({
        tweet : tweetId,
        likedby : req.user?._id
        })
        return res.status(200)
        .json(
            new Apiresponce(
                200 ,
                "Tweet liked successfully"
                )
        )
    
})

const toggleCommentLike = asyncHandler(async(req , res)=>{
    const {commentId} = req.params ;
    if(!commentId){
        throw new ApiError(400 , "Comment id is required")
    }
    const iscommentliked = await Like.findOne({
        comment :commentId ,
        likedby : req.user?._id 
    })


    if(iscommentliked){
        await Like.findByIdAndDelete(iscommentliked._id) ;
        return res.status(200)
        .json(
            new Apiresponce(
                200 , 
                "Comment unliked successfully"
            )
        )
    }


    await Like.create({
        comment : commentId,
        likedby : req.user?._id
    })

    return res.status(200)
    .json(
        new Apiresponce(
            200 , 
            "Comment liked successfully"
        )
    )
})

const getalllikedvideo = asyncHandler(async(req , res)=>{

   const videoaggregate = await Like.aggregate(
    [
        {
            $match :{
                likedby : new mongoose.Types.ObjectId(req.user._id)

            } 
        } ,
        {
            $lookup :{
                from : "videos",
                localField: "video",
                foreignField : "_id",
                as : "likedvideo",
             
            pipeline:[
                {
                    $lookup:{
                        from : "users" , 
                        localField: "owner",
                        foreignField : "_id",
                        as : "ownerdetails"
                    } , 
                   
                } , 
                {
                     $unwind : "$ownerdetails"
                }
            ]
        },
        },
        {
            $unwind : "$likedvideo"
        } , 
        {
            $sort : 
            {
                createdAt:-1 
            }
        },
        {
            $project:{
                     _id : 0 ,
                    likedvideo :{
                        _id:1 , 
                        title:1 ,
                        description:1 ,
                        owner : 1 , 
                        "thumnail.url" : 1 , 
                        "videoFile.url" : 1 ,
                        views:1 ,
                        likes:1 ,
                        duration:1 , 
                        createdAt:1 ,
                        isPublished:1 ,
                        ownerdetails:{
                            _id:1 ,
                            fullname:1 , 
                            "avatar.url":1
                        }
                    }

            }
        }
    ]
   );

   return res.status(200)
   .json(
         new Apiresponce(
              200 , 
              "Liked videos fetched successfully" , 
              videoaggregate
         )
   )

})


export {
    
    toggleVideoLike  , 
    toggleTweetLike , 
    toggleCommentLike , 
    getalllikedvideo
} ;

