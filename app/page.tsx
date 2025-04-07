import DocumentsComponent from "@/components/documents.component";

export default async function Home() {
  const rootFolder = await fetch("http://localhost:3000/api/folder").then((res) => res.json());

  const { id } = rootFolder;

  console.log(id);

  return <DocumentsComponent rootId={id} />;
}
