// lib/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Folder } from "@/entities/Folder";
import { Document } from "@/entities/Document";
import { User } from "@/entities/User";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "YOUR_USERNAME", // Replace with your database username
  password: "YOUR_PASSWORD", // Replace with your database password
  database: "YOUR_DATABASE", // Replace with your database name
  synchronize: true, // 开发阶段开启自动同步表结构
  entities: [Document, Folder, User],
});
