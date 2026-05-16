import JWT from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const VerifyJWT= asyncHandler(async (req,res, next) => {
    try {
        const accessToken= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!accessToken){
            throw new ApiError(401, "user is not logged In")
        }
        const decodeToken= JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const user= await User.findById(decodeToken._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Invalid access token user")
        }
        req.user= user
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token")
    }
})

export {VerifyJWT}