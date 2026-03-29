import multer from "multer";
import cloudinary from "cloudinary";

const multerUpload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const singleAvatar = multerUpload.single("avatar");

export { multerUpload };
