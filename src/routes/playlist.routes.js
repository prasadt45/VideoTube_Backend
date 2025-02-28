import { Router } from "express";
import {
    createPlaylist,
    getPlaylistByID,
    updateplaylist,
    addvideotoplaylist,
    deleteplaylist,
    deletevideofromplaylist,
    getUserPlaylists

} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/get-playlist/:playlistid").get(verifyJWT, getPlaylistByID);
router.route("/update-playlist/:playlistid").put(verifyJWT, updateplaylist);
router.route("/add-video-to-playlist/:playlistid/:videoid").put(verifyJWT, addvideotoplaylist);
router.route("/delete-playlist/:playlistid").delete(verifyJWT, deleteplaylist);
router.route("/delete-video-from-playlist/:playlistid/:videoid").delete(verifyJWT, deletevideofromplaylist);
router.route("/get-user-playlists/:userId").get(verifyJWT, getUserPlaylists);


export default router;