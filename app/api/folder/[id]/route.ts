// app/api/folder/[id]/route.ts
import { connectDB } from "@/lib/db";
import { Folder } from "@/entities/Folder";
import { Document } from "@/entities/Document";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const folderId = Number(id);

  if (isNaN(folderId)) {
    return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
  }

  const db = await connectDB();
  const folderRepo = db.getRepository(Folder);
  const docRepo = db.getRepository(Document);

  // Query only the immediate subfolders of the current folder
  const subfolders = await folderRepo.find({
    where: { parent: { id: folderId } },
    select: ["id", "name", "createdAt"],
  });

  // Query only the files in the current folder
  const documents = await docRepo.find({
    where: { folder: { id: folderId } },
    select: ["id", "name", "createdAt", "size"],
  });

  // Combine results
  const results = [
    ...subfolders.map((f) => ({
      type: "folder",
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      createdBy: null,
      size: null,
    })),
    ...documents.map((d) => ({
      type: "file",
      id: d.id,
      name: d.name,
      createdAt: d.createdAt,
      createdBy: null,
      size: d.size,
    })),
  ];

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { parentId, name } = data;
}
