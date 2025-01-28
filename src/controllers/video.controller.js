import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Apiresponce } from "../utils/Apiresponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const videoFile = req.files?.videoFile[0].path;
    const thumbnailFile = req.files?.thumbnail[0].path;

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

export { uploadVideo };
