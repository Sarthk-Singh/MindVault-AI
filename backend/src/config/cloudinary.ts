import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ url: string; publicId: string }> => {
  // Use data URI upload to avoid streams dependency
  let mime = "application/octet-stream";
  if (resourceType === "image") {
    mime = "image/png";
  } else if (resourceType === "video") {
    mime = "video/mp4";
  }
  const dataUri = `data:${mime};base64,${fileBuffer.toString("base64")}`;

  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType === "video" ? "video" : resourceType === "image" ? "image" : "auto"
  });

  return { url: res.secure_url, publicId: res.public_id };
};
