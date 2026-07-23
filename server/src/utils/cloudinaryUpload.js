import cloudinary from "../config/cloudinary.js";

/**
 * Uploads an in-memory file buffer (from multer's memoryStorage) to Cloudinary.
 * resourceType "auto" lets Cloudinary pick image/video/raw based on content —
 * used for everything (site images, employee documents, offer/joining letters).
 */
export const uploadBufferToCloudinary = (buffer, { folder, filename, resourceType = "auto" }) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        filename_override: filename,
        use_filename: Boolean(filename),
        unique_filename: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
