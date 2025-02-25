import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { Apiresponce } from '../utils/Apiresponce.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { Video } from '../models/video.model.js';
import { Subscription } from '../models/subscription.model.js';

const toggleSubscription = asyncHandler(async(req , res)=>{
    const {channelid } = req.params ;
    if(!channelid){
        throw new ApiError(400 , "Channel id is required")
    }
    const issubscribed = await  Subscription.findOne({
        subscriber : req.user?._id,
        channel : channelid
    }) 

    if(issubscribed){
        await Subscription.findByIdAndDelete(issubscribed._id) ;
        return res.status(200)
        .json(
            new Apiresponce(
                200,
                "Unsubscribed successfully"
            )
        )

    }

    await Subscription.create({
        subscriber : req.user?._id ,
        channel : channelid

    })

    return res.status(200)
    .json(
        new Apiresponce(
            200,
            "Subscribed successfully"
            )
            )

})

// controller to return subscriber list of a channel
const getuserchannelsubscribers = asyncHandler(async(req , res)=>{
    const {channelid} = req.params ;
    if(!channelid){
        throw new ApiError(400 , "Channel id is required")
    }

    const getsub = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(channelid)
            }
        } , 
        {
            $lookup : {
                from : "users" ,
                localField : "subscriber",
                foreignField : "_id",
                as : "subscribers"
                }
        } , 
        {
            $unwind : "$subscribers"
        }, 
        {
            $project:{
                _id : 0 ,
                subscriber : "$subscribers._id",
                name : "$subscribers.name",
                email : "$subscribers.email",
                username : "$subscribers.username",
                createdAt : 1
         
            }
        }
    ])

    return res.status(200)
    .json(
        new Apiresponce(
            200 ,
            "Subscriber list of channel",
            getsub
        )

    )


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber id is required")
    }

    const getchannels  = await Subscription.aggregate([
        {
            $match: {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            
            } 
        },
        { 
            $lookup:{
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "channel"
            }

        } , 
        {
            $unwind : "$channel"
        } , 
        {
            $project:{
                _id : 1 ,
                name : "$channel.name",
                email : "$channel.email",
                username : "$channel.username",
                createdAt : 1,
                channel : "$channel._id",
                subscriber : 1

                }

        }
    ])

    return res.status(200)
    .json(
        new Apiresponce(
            200,
            "Channels subscribed by user",
            getchannels
        )
    )
})

export {toggleSubscription , getuserchannelsubscribers , getSubscribedChannels} ;