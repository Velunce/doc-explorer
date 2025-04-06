// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db";
import { Document } from "@/entities/Document";

const uploadDir = path.join(process.cwd(), "public/uploads");

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle it manually
  },
};

export async function POST(request: NextRequest) {
  // Ensure the upload directory exists
  const data = await request.formData();

  const files = data.getAll("files") as File[];
  const folderId = (data.get("folderId") as string) || "1";

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const savedFiles = [];

  const db = await connectDB();
  const docRepo = db.getRepository(Document);
  const folderIdNum = Number(folderId);

  if (isNaN(folderIdNum)) {
    return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
  }

  for (const file of files) {
    const filePath = path.join(uploadDir, file.name);

    try {
      // Convert the file Blob to a Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Write the file to the upload directory
      fs.writeFileSync(filePath, buffer);

      // Add the file details to the savedFiles array
      savedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        path: `/uploads/${file.name}`,
      });

      const saved = await docRepo.save({
        name: file.name,
        filePath: `/uploads/${file.name}`,
        fileType: file.type,
        size: file.size,
        folderId: folderIdNum,
      });
      savedFiles.push(saved);
    } catch (error) {
      console.error(`Error saving file ${file.name}:`, error);
      return NextResponse.json({ error: `Failed to save file ${file.name}` }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Files uploaded successfully" });
}
