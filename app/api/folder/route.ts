// app/api/folder/route.ts
import { connectDB } from "@/lib/db";
import { Folder } from "@/entities/Folder";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { IsNull } from "typeorm";

const uploadDir = path.join(process.cwd(), "public/uploads");

export async function GET(request: NextRequest) {
  const db = await connectDB();
  const { DOC_ROOT_FOLDER } = await process.env;
  console.log(DOC_ROOT_FOLDER);
  const folderRepo = db.getRepository(Folder);

  let rootFolder = await folderRepo.findOne({ where: { path: DOC_ROOT_FOLDER } });

  let newRootFolder;
  if (!rootFolder) {
    newRootFolder = await folderRepo.save({
      name: "root",
      path: DOC_ROOT_FOLDER,
      parent: null,
      documents: [],
      children: [],
    });
  }

  return NextResponse.json({ ...(rootFolder || newRootFolder) });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { parentId, name } = data;

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

  // Create the new folder
  const newFolder = await folderRepo.save({
    name,
    parent: parentFolder,
    path: parentFolder ? path.join(parentFolder.path, name) : name,
    documents: [],
    children: [],
  });

  // Create the folder on the filesystem
  const folderPath = path.join(uploadDir, name);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return NextResponse.json({ message: "Folder created successfully", folder: newFolder });
}
