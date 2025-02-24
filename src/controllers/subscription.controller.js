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

export {toggleSubscription} ;