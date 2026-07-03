import multer from "multer";

const allowed = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("Only PDF, JPEG, PNG, or Word documents are allowed"));
};

export const uploadEmployeeDoc = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).single(
  "file"
);

export const uploadOfferDocs = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).fields([
  { name: "offerLetter", maxCount: 1 },
  { name: "joiningLetter", maxCount: 1 }
]);
