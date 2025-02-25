import { ApiError } from "../utils/ApiError";
import { Apiresponce } from "../utils/Apiresponce";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message

    return res.status(200).json(
        new Apiresponce(
            200,
            "EVERYTHING IS OK"
        )
    )
})

export { healthcheck }