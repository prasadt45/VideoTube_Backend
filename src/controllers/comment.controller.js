import mongoose from "mongoose";
import {User} from "../models/user.model.js";
import {Video} from "../models/video.model.js";
import {Comments} from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Apiresponce } from "../utils/Apiresponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createComment = asyncHandler(async(req , res)=>{
    const { content } = req.body ; 
    const {videoId} = req.params ;

    if(!content){
        throw new ApiError(400 , "Content is required");
    }
    if(!videoId){
        throw new ApiError(400 , "Video id is required");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404 , "Video not found");
    }
    const comm = await Comments.create({
        content , 
        video : videoId , 
        owner : req.user._id
    })

    return res.status(200)
    .json(
        new Apiresponce(
            200 , 
            comm , 
            "Comment created successfully"


        )
    )
})

const updatecomment = asyncHandler(async(req,res)=>{
   const{content} = req.body;
   const {commentId} = req.params;

    if(!content){
         throw new ApiError(400 , "Content is required");
    }
    if(!commentId){
        throw new ApiError(400 , "Comment id is required");
    }
    const comment = await Comments.findById(commentId);
    if(!comment){
        throw new ApiError(404 , "Comment not found");
    }
    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403 , "You are not allowed to update this comment");
    }
    const updatedcomm = await Comments.findByIdAndUpdate(
        commentId , 
        {
            $set : {
                content
            }
        } , 
        {
            new : true
        }
    

    )


    return res.status(200)
    .json(
        new Apiresponce(
            200 , 
            updatedcomm , 
            "Comment updated successfully"
        )
    )

})

const deletecomment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(400 , "Comment id is required");
    }
    const comment =  await Comments.findById(commentId) ; 
    if(!comment){
        throw new ApiError(404 , "Comment not found");
    }
    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403 , "You are not allowed to delete this comment");
    }
    const deletedcomment = await Comments.findByIdAndDelete(commentId);
    return res.status(200)
    .json(
        new Apiresponce(
            200 , 
            deletedcomment , 
            "Comment deleted successfully"
        )
    )

})

const getallcomments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Valid Video ID is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const commentaggregate = Comments.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $addFields: {
                ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] } 
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                content: 1, 
                createdAt: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username"
                }
            }
        }
    ]);

    const comments = await Comments.aggregatePaginate(commentaggregate, options);

    return res.status(200).json(
        new Apiresponce(200, comments, "Comments fetched successfully")
    );
});


export {createComment , updatecomment , deletecomment , getallcomments} ;