import { Context } from "hono";
import { uploadFileToR2 } from "../helper/r2";

export const uploadImage = async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || typeof file === "string") {
      return c.json({ error: "File is required" }, 400);
    }

    // File is valid
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    const fileName = `${Date.now()}-${file.name}`;
    const contentType = file.type || "application/octet-stream";

    const url = await uploadFileToR2(fileBuffer, fileName, contentType);
    console.log(url);
    return c.json({ message: "Image uploaded successfully", url }, 200);
  } catch (error: any) {
    console.error("Upload error:", error);
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
};
