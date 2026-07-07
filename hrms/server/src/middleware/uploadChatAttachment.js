import multer from "multer";

const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip"
]);

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("This file type isn't supported"));
};

export const uploadChatAttachment = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } }).single(
  "file"
);
