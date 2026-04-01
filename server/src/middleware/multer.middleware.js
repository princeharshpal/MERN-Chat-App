import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 512 * 1024 * 1024,
  },
}).array("attachments", 10);
