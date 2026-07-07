import crypto from "crypto";

export const generateTempPassword = () => crypto.randomBytes(9).toString("base64url");
