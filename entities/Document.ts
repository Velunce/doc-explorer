import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Folder } from "./Folder";

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  filePath: string;

  @Column()
  fileType: string;

  @Column()
  size: number;

  @ManyToOne("Folder", "documents", { onDelete: "CASCADE" }) // Define the relationship
  folder: Folder; // Reference the folder

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
