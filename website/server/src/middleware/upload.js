import multer from "multer";

const allowed = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]);

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (allowed.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)"));
  }
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single("file");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 12 }
}).array("files", 12);
