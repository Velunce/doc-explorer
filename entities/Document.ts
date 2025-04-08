import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Folder } from "./Folder";
import { User } from "./User";

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

  @ManyToOne("User", "documents", { onDelete: "CASCADE" }) // Define the relationship
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
