import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Apiresponce } from "../utils/Apiresponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Please provide name and description")
    }

    const newplaylist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    if (!newplaylist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(200)
        .json(
            new Apiresponce(
                200,
                "Playlist created successfully",
                newplaylist
            )
        )
})

const getPlaylistByID = asyncHandler(async (req, res) => {
    const { playlistid } = req.params;


    if (!playlistid) {
        throw new ApiError(400, "Please provide playlist id")
    }

    const playlist = await Playlist.findById(playlistid)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200)
        .json(
            new Apiresponce(
                200,
                "Playlist found successfully",
                playlist
            )
        )

})
const updateplaylist = asyncHandler(async (req, res) => {
    const { playlistid } = req.params;
    const { name, description } = req.body;
    if (!playlistid) {
        throw new ApiError(400, "Please provide playlist id")
    }
    if (!name || !description) {
        throw new ApiError(400, "Please provide name and description")
    }

    const playlist = await Playlist.findById(playlistid)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    const updatedplaylist = await Playlist.findByIdAndUpdate(
        playlistid,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    );
    return res.status(200)
        .json(
            new Apiresponce(
                200,
                "Playlist updated successfully",
                updatedplaylist
            )
        )



})

const addvideotoplaylist = asyncHandler(async (req, res) => {
    const { playlistid, videoid } = req.params;
    if (!playlistid || !videoid) {
        throw new ApiError(400, "Please provide playlist id and video id")
    }

    const playlist = await Playlist.findById(playlistid)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    const video = await Video.findById(videoid)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    const added = await Playlist.findByIdAndUpdate(
        playlistid,
        {
            $addToSet: {
                videos: videoid
            }
        },
        {
            new: true
        }
    )
    if (!added) {
        throw new ApiError(500, "Failed to add video to playlist")
    }
    return res.status(200)
        .json(
            new Apiresponce(
                200,
                "Video added to playlist successfully",
                added
            )
        )


})

const deleteplaylist = asyncHandler(async (req, res) => {
    const { playlistid } = req.params
    if (!playlistid) {
        throw new ApiError(400, "Please provide playlist id")
    }
    const deletedplaylist = await Playlist.findByIdAndDelete(playlistid);

    if (!deletedplaylist) {
        throw new ApiError(500, "Failed to delete playlist")
    }

    return res.status(200)
        .json(
            new Apiresponce(
                200,
                "Playlist deleted successfully",
                deletedplaylist
            )
        )

})

const deletevideofromplaylist = asyncHandler(async (req, res) => {
    const { playlistid, videoid } = req.params
    if (!playlistid || !videoid) {
        throw new ApiError(400, "Please provide playlist id and video id")
    }
    const playlist = await Playlist.findById(playlistid)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    const video = await Video.findById(videoid)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist")
    }
    const updatedvideo = await Playlist.findByIdAndUpdate(
        playlistid,
        {
            $pull: {
                videos: videoid
            }
        },
        {
            new: true
        }
    )
    if (!updatedvideo) {
        throw new ApiError(500, "Failed to delete video from playlist")
    }
    return res.status(200)
        .json(
            new Apiresponce(
                200,
                "Video deleted from playlist successfully",
                updatedvideo
            )
        )


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "Please provide user id")
    }
    const userplaylist = await Playlist.aggregate(
        [
            {
                $match:{
                    owner:new mongoose.Types.ObjectId(userId)
                }
            } , 
            {
                $lookup:{
                    from:"videos",
                    localField:"videos",
                    foreignField:"_id",
                    as:"videoss"
                }
            }
            ,
            {
                $addFields:{
                    totalvideos :{
                        $size:"$videoss"
                    }
                }
            }
            , 
            {
                $project:{
                    _id:1 ,
                    name:1 ,
                    description:1 ,
                    totalvideos:1 ,
                    updatedAt : 1 , 
                    videoss:{
                        title : 1 , 
                        description :1 , 
                        duration :1 

                    }
                }
            }
        ]
    )
    if(!userplaylist){
        throw new ApiError(404, "User has no playlists")
    }
     return res.status(200)
     .json(
        new Apiresponce(
            200 ,
            "User playlists",
            userplaylist

        )
     )

})

export {
    createPlaylist,
    getPlaylistByID,
    updateplaylist,
    addvideotoplaylist,
    deleteplaylist,
    deletevideofromplaylist,
    getUserPlaylists
};