import { ApiError } from "../utils/ApiError.js";
import { fileTypeFromBuffer } from "file-type";
import NodeClam from "clamscan";

const ALLOWED_MIME_PREFIXES = ["image/", "video/", "audio/", "application/pdf"];
const DANGEROUS_EXTENSIONS = [
  "exe",
  "bat",
  "sh",
  "msi",
  "com",
  "cmd",
  "ps1",
  "vbs",
  "dll",
];
const EICAR_SIGNATURE = "EICAR-STANDARD-ANTIVIRUS-TEST-FILE";

export const validateMagicBytes = async (buffer, originalName) => {
  const type = await fileTypeFromBuffer(buffer);

  console.log(
    `[Magic Bytes] File: "${originalName}" → Detected: ${type ? `${type.mime} (.${type.ext})` : "unknown/text"}`,
  );

  if (type && DANGEROUS_EXTENSIONS.includes(type.ext)) {
    throw new ApiError(
      400,
      `File "${originalName}" has a blocked extension (.${type.ext}). Upload rejected.`,
    );
  }

  if (
    type &&
    !ALLOWED_MIME_PREFIXES.some((prefix) => type.mime.startsWith(prefix))
  ) {
    throw new ApiError(
      400,
      `File "${originalName}" has an unsupported MIME type (${type.mime}). Upload rejected.`,
    );
  }

  return type;
};

let clamInstance = null;

const getClamInstance = async () => {
  if (clamInstance) return clamInstance;

  try {
    clamInstance = await new NodeClam().init({
      clamdscan: {
        socket: process.env.CLAMAV_SOCKET || null,
        host: process.env.CLAMAV_HOST || "127.0.0.1",
        port: parseInt(process.env.CLAMAV_PORT || "3310"),
        timeout: 60000,
        local_fallback_clamscan: false,
      },
      preference: "clamdscan",
    });
    console.log("[ClamAV] Connected to daemon successfully.");
    return clamInstance;
  } catch (error) {
    console.warn("[ClamAV] Daemon not available:", error.message);
    return null;
  }
};

export const scanForViruses = async (buffer, originalName) => {
  const clam = await getClamInstance();

  if (clam) {
    try {
      const { isInfected, viruses } = await clam.scanBuffer(buffer);
      if (isInfected) {
        throw new ApiError(
          400,
          `File "${originalName}" is infected with: ${viruses.join(", ")}. Upload blocked.`,
        );
      }
      console.log(`[ClamAV] File "${originalName}" is clean.`);
      return;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.warn("[ClamAV] Scan error:", error.message);
    }
  }

  console.warn(
    "[ClamAV] Falling back to EICAR signature check (development mode).",
  );
  const content = buffer.toString("utf-8", 0, Math.min(buffer.length, 1024));
  if (content.includes(EICAR_SIGNATURE)) {
    throw new ApiError(
      400,
      `File "${originalName}" contains a test virus signature. Upload blocked.`,
    );
  }
};

export const scanFile = async (buffer, originalName) => {
  await validateMagicBytes(buffer, originalName);
  await scanForViruses(buffer, originalName);
  return true;
};
