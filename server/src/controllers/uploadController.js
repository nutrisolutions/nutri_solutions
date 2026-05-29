import { fileUrl } from "../middleware/upload.js";

export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  return res.status(201).json({
    url: fileUrl(req, req.file.filename),
    filename: req.file.filename
  });
};

export const uploadImages = (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  return res.status(201).json({
    urls: files.map((file) => fileUrl(req, file.filename))
  });
};

/** Multer error handler wrapper */
export const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
};
