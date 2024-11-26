import {asyncHandler} from "../utils/asyncHandler.js"
import {Vidio} from "../models/vidio.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"
const publishAVidio=asyncHandler(async(req,res)=>{
    const {title,description,duration}=req.body;
    if(!title||!description||!duration||title===""){
    throw new ApiError(400,"title,duration and description are required");
    }
    const vidioLocalPath=req.files?.vidio[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    if(!vidioLocalPath||!thumbnailLocalPath){
    throw new ApiError(400,"vidio and thumbnail is missing");
    }
    const vidioUrl=await uploadOnCloudinary(vidioLocalPath);
    const thumbnailUrl=await uploadOnCloudinary(thumbnailLocalPath);
    if(!vidioUrl||!thumbnailUrl){
    throw new ApiError(500,"internal server issue");
    }
    const userId=req.user._id;
    const uploadedVidio=await Vidio.create({
        vidioFile:vidioUrl.url,
        thumbnail:thumbnailUrl.url,
        title,
        description,
        duration,
        owner:req.user._id
    })
    res
    .status(200)
    .json(new ApiResponse(200,uploadedVidio,"vidio uploaded successfully"));
})
const getVidioById = asyncHandler(async (req, res) => {
    const { vidioId } = req.params
    if(!vidioId){
    throw new ApiError(400,"vidio id required");
    }
    if (!mongoose.Types.ObjectId.isValid(vidioId)) {
        throw new ApiError(400, "Invalid vidio ID format");
    }
    const vidio=await Vidio.findById(vidioId);
    if(!vidio){
    throw new ApiError(400,"vidio not found");
    } 
    return res
    .status(200)
    .json(new ApiResponse(200,vidio,"fetched vidio successfully"));
})
const updateVidio=asyncHandler(async(req,res)=>{
    const vidioId=req.params
    const {title,description}=req.body
    if(!title||!description){
    throw new ApiError(400,"titile and description both are required");
    }
    const thumbnailLocalPath=req.file.path;
    if(!thumbnailLocalPath){
    throw new ApiError(400,"send thumbnail to do updated");
    }
    const newThumbnail=await uploadOnCloudinary(thumbnailLocalPath)
   const vidio=await Vidio.findOneAndUpdate(  vidioId,
    {$set:{
    thumbnail:newThumbnail.url,
    title:title,
    description:description
    }
},
    {new :true}
   )
    return res
    .status(200)
    .json(new ApiResponse(200,vidio,"updated successfully"));
})
export {
    publishAVidio,getVidioById,updateVidio
}