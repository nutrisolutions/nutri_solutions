import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "nutri-solutions/uploads",
      filename: req.file.originalname,
      resourceType: "image"
    });
    return res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    return res.status(502).json({ message: `Cloudinary upload failed: ${error.message}` });
  }
};

export const uploadImages = async (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  try {
    const results = await Promise.all(
      files.map((file) =>
        uploadBufferToCloudinary(file.buffer, {
          folder: "nutri-solutions/uploads",
          filename: file.originalname,
          resourceType: "image"
        })
      )
    );
    return res.status(201).json({ urls: results.map((r) => r.secure_url) });
  } catch (error) {
    return res.status(502).json({ message: `Cloudinary upload failed: ${error.message}` });
  }
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
