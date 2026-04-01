import { scanFile } from "../services/scan.service.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const scanAndUpload = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
  if (totalSize > 512 * 1024 * 1024) {
    throw new ApiError(400, "Total attachment size exceeds 512 MB.");
  }

  const uploadedUrls = [];

  for (const file of req.files) {
    await scanFile(file.buffer, file.originalname);

    const result = await uploadToCloudinary(file.buffer, {
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
    });

    uploadedUrls.push(result.secure_url);
    console.log(`[Upload] "${file.originalname}" → ${result.secure_url}`);
  }

  req.uploadedUrls = uploadedUrls;
  next();
});
