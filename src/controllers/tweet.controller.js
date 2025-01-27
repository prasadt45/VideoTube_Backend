import{ Apiresponce} from "../utils/Apiresponce.js";
import {Tweet} from "../models/tweet.model.js" ;
import {User} from "../models/user.model.js" ;
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const createTweet =  asyncHandler(async (req , res)=>{
    const {content} = req.body ;
    const user = req.user ;
    if(!content){
        throw new ApiError(400 , "Content is Required")
    }
    if(!user){
        throw new ApiError(401 , "UnAuthorized")
    }
    const tweet = await Tweet.create({
        content: content ,
        owner:user._id
    })
    if(!tweet){
        throw new ApiError(500 , "Tweet Not Created")
    }

    res.status(200)
    .json(
        new Apiresponce(
            200 , 
            tweet , 
            "Tweet Created Successfully"
        )
    )

})
const updateTweet = asyncHandler(async (req , res)=>{
    const {content} = req.body ;
    const {tweetid} = req.params ;
    if(!content){
        throw new ApiError(400 , "Content is Required")
    }
    if(!tweetid){
        throw new ApiError(400 , "Tweet Id is Required")
    }
    const tweet = await Tweet.findById(tweetid) ;
    if(!tweet){
        throw new ApiError(404 , "Tweet Not Found")
    }
    if(tweet.owner.toString() != req.user._id.toString()){
        throw new ApiError(401 , "UnAuthorized")
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetid , 
        {
            
            $set :{
                content: content
            }
        } , 
          {
            new : true
          }
        
    )
    console.log("Received Tweet ID:", req.params.tweetid);
    if(!updatedTweet){
        throw new ApiError(500 , "Tweet Not Updated")   
    }
    res.status(200)
    .json(
        new Apiresponce(
            200 , 
            updatedTweet , 
            "Tweet Updated Successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req , res)=>{
    const {tweetid} = req.params ;
    if(!tweetid){
        throw new ApiError(400 , "Tweet Id is Required")
    }
    const tweet = await Tweet.findById(tweetid) ;
    if(!tweet){
        throw new ApiError(404 , "Tweet Not Found")
    }
    const deletedtweet = await Tweet.findByIdAndDelete(tweetid) ;
    if(tweet.owner.toString() != req.user._id.toString()){
        throw new ApiError(401 , "UnAuthorized")
        }
    if(!deletedtweet){
        throw new ApiError(500 , "Tweet Not Deleted")
    }
    res.status(200)
    .json(
        new Apiresponce(
            200 ,
            deletedtweet ,
            "Tweet Deleted Successfully"
            )
            )

})

const getalltweet = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(user._id)

            }
        }, 
        { 
            $lookup: {
                from: "users",  
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1 
                        }
                    }
                ]
            } 
        },
        { 
            $addFields: {
                owner: { $first: "$ownerDetails" }
            }
        }, 
        { 
            $sort: { createdAt: -1 } 
        }, 
        { 
            $project: {
                "owner.username": 1, 
                createdAt: 1,
                content: 1
            }
        }
    ]);

    res.status(200).json(
        new Apiresponce(
            200, 
            tweets, 
            "Tweets Fetched Successfully"
        )
    );
});


export {createTweet , updateTweet , deleteTweet , getalltweet} ;
