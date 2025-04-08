// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db";
import { Document } from "@/entities/Document";
import { Folder } from "@/entities/Folder";
import { User } from "@/entities/User";
import { FileTypeEnum } from "@/types";

const uploadDir = path.join(process.cwd(), "public/uploads");

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle it manually
  },
};

/**
 * POST Handler
 *
 * Handles file uploads by saving files to the filesystem and storing their metadata in the database.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {NextResponse} - A JSON response indicating the success or failure of the operation.
 */
export async function POST(request: NextRequest) {
  // Parse the form data from the request
  const data = await request.formData();

  // Extract files and metadata from the form data
  const files = data.getAll("files") as File[];
  const folderId = (data.get("folderId") as string) || "1";
  const createdBy = data.get("createdBy") as string;

  // Validate the uploaded files
  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const savedFiles = [];

  // Connect to the database
  const db = await connectDB();
  const docRepo = db.getRepository(Document);
  const folderRepo = db.getRepository(Folder);

  // Validate the folder ID
  const folderIdNum = Number(folderId);
  if (isNaN(folderIdNum)) {
    return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
  }

  // Retrieve the folder from the database
  const folder = await folderRepo.findOne({ where: { id: folderIdNum } });
  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  // Determine the folder path
  const folderPath = folder.parent
    ? path.join(folder.parent.path, folder.path) // Combine parent folder path with current folder path
    : folder.path || uploadDir;

  // Process each uploaded file
  for (const file of files) {
    const filePath = path.join(folderPath, file.name);

    try {
      // Convert the file Blob to a Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Write the file to the upload directory
      fs.writeFileSync(filePath, buffer);

      // Add the file details to the savedFiles array
      savedFiles.push({
        name: file.name,
        filePath: folderPath,
        fileType: FileTypeEnum.file,
        size: file.size,
      });

      const saved = await docRepo.save({
        name: file.name,
        filePath: folderPath,
        fileType: FileTypeEnum.file,
        size: file.size,
        folder: { id: folderIdNum },
        creator: { id: createdBy },
      });

      // Add the saved file metadata to the savedFiles array
      savedFiles.push(saved);
    } catch (error) {
      return NextResponse.json({ error: `Failed to save file ${file.name}` }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Files uploaded successfully" });
}
