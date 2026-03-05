import crypto from "crypto";

const SECRET = process.env.UPLOAD_TOKEN_SECRET || "change-me";

export function encodeUploadToken(payload: {
  publicId: string;
  userId: string;
}) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

export function verifyUploadToken(token: string) {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)))
    return null;
  try {
    const json = Buffer.from(data, "base64url").toString();
    return JSON.parse(json) as { publicId: string; userId: string };
  } catch {
    return null;
  }
}
