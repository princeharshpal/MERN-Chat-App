import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.uploadedUrls || req.uploadedUrls.length === 0) {
    throw new ApiError(
      400,
      "File upload failed or was blocked by security scans",
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { url: req.uploadedUrls[0], urls: req.uploadedUrls },
        "File uploaded successfully",
      ),
    );
});
