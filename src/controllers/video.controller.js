import {mongoose , isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deletefromcloudinary } from "../utils/cloudinary.js";
import { Apiresponce } from "../utils/Apiresponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pipeline = [];
    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos", 
                text: {
                    query: query,
                    path: ["title", "description"]
                }
            }
        });
    }
    if (userId) {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }
    pipeline.push({
        $match: {
            isPublished: true
        }
    });
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({
            $sort: {
                createdAt: -1
            }
        });
    }
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        "avatar.url": 1
                    }
                }
            ]
        }
    });

    pipeline.push({
        $unwind: "$owner"
    });
    const totalResults = await Video.aggregate([...pipeline, { $count: "total" }]);
    const total = totalResults.length > 0 ? totalResults[0].total : 0;

    const pageNum = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    pipeline.push({ $skip: (pageNum - 1) * pageSize }, { $limit: pageSize });

    const videoData = await Video.aggregate(pipeline);

    return res.status(200).json(new Apiresponce(200, videoData, "Videos fetched successfully"));
});




const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if ([title, description].some((field) => 
        field?.trim() === "")) {
        throw new ApiError(400, "All field\ds are must  required");
    }
    const videoFile = req.files?.videoFile?.[0]?.path;
    const thumbnailFile = req.files?.thumbnail?.[0]?.path;
    if (!videoFile) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailFile) {
                throw new ApiError(400, "Thumbnail file is required");
    }
    // Upload video and thumbnail to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoFile);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile);
    if (!uploadedVideo || !uploadedVideo.url || !uploadedVideo.duration) {
        throw new ApiError(500, "Video upload failed");
    }
    if (!uploadedThumbnail || !uploadedThumbnail.url || !uploadedThumbnail.public_id) {
        throw new ApiError(500, "Thumbnail upload failed");
    }
    // Create video data in the database
    const videoData = await Video.create({
        title,
        description,
        duration: uploadedVideo.duration,
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        owner: req.user?._id,
        isPublished: false,
    });
    return res.status(201).json(
        new Apiresponce(201, videoData, "Video uploaded successfully")
    );
});

const getvideobyid = asyncHandler(async (req, res) => {
    const { videoid } = req.params;
    if (!videoid) {
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoid);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res.status(200)
        .json(
            new Apiresponce(
                200,
                video,
                "Video found successfully"
            )
        )
})

const updatevideo = asyncHandler(async (req , res) => {
    const { videoid } = req.params;
    const { title, description, isPublished } = req.body;
    if (!videoid) {
        throw new ApiError(400, "Video id is required");
    }
    const oldvideo = await Video.findById(videoid);
    if (!oldvideo) {
        throw new ApiError(404, "Video not found");
    }

    const newvideofilepath = req.files?.videoFile[0].path;
    const newthumbnailfilepath = req.files?.thumbnail[0].path;

    const newvideo = await uploadOnCloudinary(newvideofilepath);
    const newthumbnail = await uploadOnCloudinary(newthumbnailfilepath);

    const video = await Video.findByIdAndUpdate(videoid, {
        title,
        description,
        isPublished,
        videoFile: newvideo.url,
        thumbnail: newthumbnail.url,
        duration: newvideo.duration

    }
        , { new: true }
    );

    return res.status(200)
        .json(
            new Apiresponce(
                200,
                video,
                "Video updated successfully"
            )
        )

})

const deletevideo = asyncHandler(async (req, res) => {
    const {videoid} = req.params;

    if (!videoid) {
        throw new ApiError(400, "Video id is required");
    }

    // Find the video by ID
    const video = await Video.findById(videoid);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const videoFileUrl = video.videoFile;
    const public_id = videoFileUrl.split('/')[7].split('.')[0]; // Extract the public ID part
    console.log("Extracted Public ID:", public_id);

    // Call deletefromcloudinary with the correct public_id
    const deletedFromCloudinary = await deletefromcloudinary(public_id);
    if (!deletedFromCloudinary) {
        throw new ApiError(500, "Video not deleted from Cloudinary");
    }

    // Delete the video from the database
    const deletedVideo = await Video.findByIdAndDelete(videoid);
    if (!deletedVideo) {
        throw new ApiError(404, "Video not found in database");
    }

    // Respond with success message
    return res.status(200).json(
        new Apiresponce(200, deletedVideo, "Video deleted successfully")
    );
});


const togglevideostatus = asyncHandler(async (req , res)=>{
    const {videoid} = req.params;
    if (!videoid) {
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoid);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const updatedstatus = await Video.findByIdAndUpdate(
        videoid,
        { isPublished: !video.isPublished },
        { new: true }
    )

    return res.status(200).json(
        new Apiresponce(200, updatedstatus, "Video status updated successfully")
    )

})




export { uploadVideo, getvideobyid, updatevideo, deletevideo , togglevideostatus , getAllVideos };
