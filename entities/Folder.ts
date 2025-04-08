// Folder.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Document } from "./Document";
import { User } from "./User";

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne("Folder", "children", { nullable: true, onDelete: "CASCADE" }) // Define parent folder relationship
  parent: Folder | null; // Reference the parent folder

  @OneToMany("Folder", "parent") // Define child folders relationship
  children: Folder[]; // Reference child folders

  @OneToMany("Document", "folder")
  documents: Document[];

  @ManyToOne("User", "folder", { onDelete: "CASCADE" }) // Define the relationship
  creator: User;

  @Column()
  path: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
