// app/api/folder/[id]/route.ts
import { format } from "date-fns";
import { connectDB } from "@/lib/db";
import { Folder } from "@/entities/Folder";
import { Document } from "@/entities/Document";
import { NextRequest, NextResponse } from "next/server";
import { FileTypeEnum } from "@/types";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const folderId = Number(id);

  if (isNaN(folderId)) {
    return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
  }

  const sortBy = req.nextUrl.searchParams.get("sortBy");
  const sortOrder = req.nextUrl.searchParams.get("sortOrder");
  const search = req.nextUrl.searchParams.get("search")?.toLowerCase() || "";
  const page = Number(req.nextUrl.searchParams.get("page")) || 1; // Default to page 1
  const pageSize = Number(req.nextUrl.searchParams.get("pageSize")) || 10; // Default to 10 items per page

  const db = await connectDB();
  const folderRepo = db.getRepository(Folder);
  const docRepo = db.getRepository(Document);

  // Query only the immediate subfolders of the current folder

  const subfolders = await folderRepo.find({
    where: { parent: { id: folderId } },
    relations: ["creator"],
  });

  // Query only the files in the current folder
  const documents = await docRepo.find({
    where: { folder: { id: folderId } },
    relations: ["creator"],
  });

  const folderInfo = await folderRepo.findOne({ where: { id: folderId }, relations: ["parent"] });

  console.log("folderInfo", folderInfo);

  let combinedResults: any = [];
  // Combine results
  const results = [
    ...subfolders.map((f) => ({
      type: "folder",
      id: f.id,
      name: f.name,
      createdAt: format(new Date(f.createdAt), "dd MMM yyyy"),
      createdBy: f.creator?.username,
      size: null,
    })),
    ...documents.map((d) => ({
      type: "file",
      id: d.id,
      name: d.name,
      createdAt: format(new Date(d.createdAt), "dd MMM yyyy"),
      createdBy: d.creator?.username,
      size: d.size,
    })),
  ];

  // Apply fuzzy search filter
  if (search) {
    console.log(search);
    combinedResults = results.filter((item) => item.name.toLowerCase().includes(search));
  }

  // Sort the combined results
  if (!search) {
    combinedResults = results.sort((a, b) => {
      if (sortBy === "name") {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return sortOrder === "asc" ? -1 : 1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return sortOrder === "asc" ? 1 : -1;
        return 0;
      } else if (sortBy === "createdAt") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }

  // Apply pagination
  const total = combinedResults.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedResults = combinedResults.slice((page - 1) * pageSize, page * pageSize);

  // Add the parent folder as go back trigger
  if (folderInfo?.parent && folderInfo?.parent?.id) {
    paginatedResults.unshift({ type: FileTypeEnum.folder, id: folderInfo.parent.id, name: "..", createdAt: null, createdBy: null, size: null, turnUp: true });
  }

  return NextResponse.json({ total, totalPages, currentPage: page, pageSize, data: paginatedResults }, { status: 200 });
}
