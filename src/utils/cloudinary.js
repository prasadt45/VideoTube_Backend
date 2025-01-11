// file already uploadded in server now take local path from server and upoload to cloudinary
 import {v2 as cloud} from "cloudinary"
 import fs from "fs"


 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET 
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
        return responce
        
    } catch (error) {
        fs.unlinkSync(localfilepath)
        return null ;
    }

}

export {uploadOnCloudinary}




