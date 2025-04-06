// lib/db.ts
import { AppDataSource } from "./data-source";

let isInitialized = false;

export async function connectDB() {
  if (!isInitialized) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("[✅] MySQL connected");
      }

      isInitialized = true;
    } catch (error) {
      console.error("[❌] Failed to connect MySQL:", error);
      throw error;
    }
  }

  return AppDataSource;
}

export async function closeDB() {
  if (isInitialized) {
    try {
      await AppDataSource.destroy();
      console.log("[✅] MySQL connection closed");
    } catch (error) {
      console.error("[❌] Failed to close MySQL connection:", error);
    }
  }
}
