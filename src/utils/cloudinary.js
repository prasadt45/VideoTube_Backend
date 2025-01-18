// file already uploadded in server now take local path from server and upoload to cloudinary
 import {v2 as cloudinary} from "cloudinary"
 import fs from "fs"
import { ApiError } from "./ApiError.js";



 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localfilepath)=>{
    try {
        if (!localfilepath) {
            return null ; 
        }
        // upolad on cloudinary
         const responce = await cloudinary.uploader.upload(localfilepath , {
            resource_type: "auto", // which resource to be uploaded 
        })

        console.log("File uploaded to cloudinary");
        fs.unlinkSync(localfilepath)
        return responce
        
    } catch (error) {
        fs.unlinkSync(localfilepath)
        return null ;
    }

}
const deltefromcloudinary = async(oldfilepath)=>{
    try {
        if(!oldfilepath){
            throw new ApiError(400, 'oldfilepath is required')
        }
        const result = await cloudinary.uploader.destroy(oldfilepath)
        console.log("File Has Been Removed From Cloudinary") ;
        return result ; 
    } catch (error) {
        console.log("Error Removing File From Cloudinary") ;
        
    }
}

export {uploadOnCloudinary , deltefromcloudinary}




