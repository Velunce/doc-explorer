// app/api/folder/route.ts
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db";
import { Folder } from "@/entities/Folder";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/entities/User";

const uploadDir = path.join(process.cwd(), "public/uploads");

/**
 * GET Handler
 *
 * Retrieves the root folder from the database based on the `DOC_ROOT_FOLDER` environment variable.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {NextResponse} - A JSON response containing the root folder details.
 */
export async function GET(request: NextRequest) {
  const db = await connectDB();
  const { DOC_ROOT_FOLDER } = await process.env;
  const folderRepo = db.getRepository(Folder);

  // Check if the root folder exists in the database
  let rootFolder = await folderRepo.findOne({ where: { path: DOC_ROOT_FOLDER } });
  return NextResponse.json({ rootFolder });
}

/**
 * POST Handler
 *
 * Creates a new folder in the database and on the filesystem.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {NextResponse} - A JSON response indicating the success or failure of the operation.
 */
export async function POST(request: NextRequest) {
  const data = await request.json();
  const { parentId, name, createdBy } = data;

  // Validate the folder name
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
  }

  const db = await connectDB();
  const folderRepo = db.getRepository(Folder);

  // Determine the parent folder
  let parentFolder = null;
  if (parentId) {
    parentFolder = await folderRepo.findOne({ where: { id: parentId } });
    if (!parentFolder) {
      return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
    }
  }

  // Create the new folder in the database
  const newFolder = await folderRepo.save({
    name,
    parent: parentFolder,
    path: parentFolder ? path.join(parentFolder.path, name) : name,
    documents: [],
    children: [],
    creator: { id: createdBy }, // Assuming the creator is the admin for simplicity
  });

  // Create the folder on the filesystem
  const folderPath = path.join(parentFolder ? parentFolder.path : uploadDir, name);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return NextResponse.json({ message: "Folder created successfully", folder: newFolder });
}
