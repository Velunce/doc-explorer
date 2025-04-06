// lib/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Folder } from "@/entities/Folder";
import { Document } from "@/entities/Document";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "192.168.3.123",
  port: 3306,
  username: "admin",
  password: "sql@2025",
  database: "dochub",
  synchronize: true, // 开发阶段开启自动同步表结构
  entities: [Folder, Document],
});
