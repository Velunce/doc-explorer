import { Folder } from "@/entities/Folder";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST Handler
 *
 * Handles user registration by creating a new user in the database. If the user is the first user,
 * they are assigned the "admin" role and a root folder is created in the database.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {NextResponse} - A JSON response indicating the success or failure of the operation.
 */
export async function POST(request: NextRequest) {
  // Parse the request body
  const data = await request.json();
  const { username, email, password } = data;

  // Retrieve the root folder path from environment variables
  const { DOC_ROOT_FOLDER } = await process.env;

  // Validate required fields
  if (!username || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Connect to the database
  const db = await connectDB();
  const userRepo = db.getRepository("User");

  // Check if there are any existing users
  const userCount = await userRepo.count();
  const isAdmin = userCount === 0; // First user will be admin

  // Check if a user with the same email already exists
  const existingUser = await userRepo.findOne({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "Welcome back!", user: existingUser });
  }

  // If the user is the first user, create the root folder
  if (isAdmin) {
    const folderRepo = db.getRepository(Folder);
    await folderRepo.save({
      name: "root",
      path: DOC_ROOT_FOLDER,
      parent: null,
      documents: [],
      children: [],
    });
  }

  // Create the new user in the database
  const newUser = await userRepo.save({
    username,
    email,
    password,
    role: isAdmin ? "admin" : "user", // Assign role based on user count
  });

  // Prepare the user information to return in the response
  const userInfo = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  };

  return NextResponse.json({ message: "User created successfully", user: userInfo });
}
