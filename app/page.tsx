import DocumentsComponent from "@/components/documents.component";
import { redirect } from "next/navigation";

/**
 * Home Component
 *
 * The main entry point of the application. This component fetches the root folder from the server
 * and renders the `DocumentsComponent` if the root folder exists. If the root folder is not found,
 * the user is redirected to the login page.
 *
 * Features:
 * - Fetches the root folder from the `/api/folder` endpoint.
 * - Redirects to the login page if the root folder does not exist.
 * - Passes the root folder ID to the `DocumentsComponent` for rendering.
 *
 * @returns {JSX.Element} - The rendered home page or a redirect to the login page.
 */
export default async function Home() {
  // Fetch the root folder from the server
  const rootFolder = await fetch("http://localhost:3000/api/folder").then((res) => res.json());

  // Redirect to the login page if the root folder does not exist
  if (!rootFolder.rootFolder) {
    redirect("/login");
  }

  const { id } = rootFolder.rootFolder;

  // Render the DocumentsComponent if the root folder exists, otherwise render a fallback
  return <>{id ? <DocumentsComponent rootId={id} /> : ""}</>;
}
