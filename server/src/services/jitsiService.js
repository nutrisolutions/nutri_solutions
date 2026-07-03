import crypto from "crypto";

const JITSI_BASE_URL = process.env.JITSI_BASE_URL || "https://meet.jit.si";

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Creates a Jitsi Meet room for an interview. No OAuth/API keys required —
 * meet.jit.si rooms are created on first join, so this just derives a
 * unique, unguessable room name and returns its join URL. Point
 * JITSI_BASE_URL at a self-hosted Jitsi instance if needed.
 */
export const createJitsiMeeting = ({ subject, employeeId, round }) => {
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const roomName = `nutrisolutions-${slugify(subject)}-r${round}-${employeeId.toString().slice(-6)}-${randomSuffix}`;
  const joinUrl = `${JITSI_BASE_URL}/${roomName}`;

  return { meetingId: roomName, joinUrl };
};
