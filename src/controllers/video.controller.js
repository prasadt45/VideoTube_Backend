import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Apiresponce } from "../utils/Apiresponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

})

export { uploadVideo, getvideobyid, updatevideo, deletevideo };
