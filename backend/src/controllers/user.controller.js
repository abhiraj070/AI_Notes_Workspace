import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


const register= asyncHandler(async (req,res) => {
    const {name, email, password}= req.body
    if(!name || !email || !password){
        throw new ApiError(400, "All fields are required")
    }
    const isUserNew= await User.findOne({email})
    if(isUserNew){
        throw new ApiError(400, "User already exists")
    }

    const user= await User.create({
        name,
        email,
        password,
    })
    if(!user){
        throw new ApiError(500, "Error while creating user")
    }
    const registeredUser= await User.findById(user._id).select("-refreshToken -password")
    return res
    .status(201)
    .json(new ApiResponse(201,{user:registeredUser},"User Registered successfully"))

})

const login= asyncHandler(async (req, res) => {
    const {email, password}= req.body
    if(!email || !password){
        throw new ApiError(400,"All fields are required")
    }
    const user= await User.findOne({email})
    if(!user){
        throw new ApiError(400, "User not registered")
    }
    const isPasswordCorrect= await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid password")
    }
    const accessToken= await user.generateAccessToken()
    const refreshToken= await user.generateRefreshToken()

    if(!accessToken || !refreshToken){
        throw new ApiError(500,"Error while generating tokens")
    }

    const isProd = process.env.NODE_ENV === "production"
    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    user.refreshToken= refreshToken;
    await user.save({validateBeforeSave: false})
    const loggedUser= await User.findById(user._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200,{user: loggedUser, accessToken},"User logged in successfully"))
})

const getAllNotes= asyncHandler(async (req, res) => {
    const user= await User.findById(req.user._id)
        .select("-password -refreshToken")
        .populate("notes")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { notes: user.notes }, "Notes fetched successfully"))
})

export { register, login, getAllNotes }
