"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
cloudinary_1.v2.config({
    cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.env.CLOUDINARY_API_KEY,
    api_secret: env_1.env.CLOUDINARY_API_SECRET
});
const uploadToCloudinary = async (fileBuffer, folder, resourceType = "auto") => {
    // Use data URI upload to avoid streams dependency
    let mime = "application/octet-stream";
    if (resourceType === "image") {
        mime = "image/png";
    }
    else if (resourceType === "video") {
        mime = "video/mp4";
    }
    const dataUri = `data:${mime};base64,${fileBuffer.toString("base64")}`;
    const res = await cloudinary_1.v2.uploader.upload(dataUri, {
        folder,
        resource_type: resourceType === "video" ? "video" : resourceType === "image" ? "image" : "auto"
    });
    return { url: res.secure_url, publicId: res.public_id };
};
exports.uploadToCloudinary = uploadToCloudinary;
