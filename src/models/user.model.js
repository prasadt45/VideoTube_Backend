import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt" 
import jwt from "jsonwebtoken"
const userschema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true ,
        lowercase:true , 
        trim:true , 
        index:true  , 

    } , 
    email:{
        type:String,
        required:true,
        unique:true ,
        lowercase:true , 
        trim:true , 
       

    } ,
    fullname:{
        type:String,
        required:true, 
        trim:true ,  
        index:true 

    } ,
    avatar: {
        type: String, // will use Cloudnary URL 
        required: true,

    } , 
    coverImage:{
        type:String ,
        

    } , 
    // watchHistory is array which contains IDS of vdos being watched by user
    watchHistory:[
        {
            type:Schema.Types.ObjectId , 
            ref : "Video"
        }
    ] ,
    password: {
        type : String,
        required :[true , 'Password is Required']

    } , 
    refreshToken:{
        type:String ,
    }


},{
    timestamps:true 
})

/**             TO DECRYPT PASSWORD                           *** */
// middleware to hash password before saving to database
userschema.pre("save" , async function(next){
    // if we not write if codnition then it will hash password every time when save is called
    if(!this.isModified("password")) return next() ;

    this.password = bcrypt.hash(this.password , 10)
    next()
    
})

userschema.methods.isPasswordCorrect = async function(password){
    return  await bcrypt.compare(password , this.password) //hover for details
}

userschema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
        _id:this._id ,
        email:this.email ,
        username:this.username , 
        fullname : this.fullname
        } , 
        process.env.ACCESS_TOKEN_SECRET , 
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
)
}
userschema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
        _id:this._id ,
        
        } , 
        process.env.REFRESH_TOKEN_SECRET , 
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
)
}

export const User = mongoose.model("User" , userschema)