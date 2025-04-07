// Folder.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Document } from "./Document";

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

  @Column()
  path: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
