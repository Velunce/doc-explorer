"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./button.component";
import Table from "./table.component";
import Modal from "./modal.component";
import { Field, Input } from "@headlessui/react";
import clsx from "clsx";
import { formatBytes } from "@/lib/utils";
import { ArrowUpTrayIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";

interface DocumentWrapperProps {
  rootId: number;
}

/**
 * DocumentsComponent
 *
 * A React component for managing and displaying documents and folders.
 * Includes features like file uploads, folder creation, search, sorting, and pagination.
 *
 * @param {DocumentWrapperProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
const DocumentsComponent = ({ rootId }: DocumentWrapperProps) => {
  // Table columns configuration
  const columns = [
    { key: "name", label: "Name", shortable: true },
    { key: "createdBy", label: "Created by" },
    { key: "createdAt", label: "Date", shortable: true },
    { key: "size", label: "File size" },
  ];

  // State variables
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input
  const [folderId, setFolderId] = useState<number>(rootId); // Default folder ID
  const [folderName, setFolderName] = useState<string>("");
  const [user, setUser] = useState<{ id: number } | null>(null); // State to store user info
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);

  /**
   * Handles the closing of the modal.
   */
  const handleModalClose = () => {
    setOpenModal(false);
  };

  /**
   * Handles file uploads.
   *
   * @param {FileList} files - The files to be uploaded.
   */
  const handleUploadFiles = async (files: FileList) => {
    if (!user) {
      alert("User not found. Please log in.");
      return;
    }

    const formData = new FormData();

    // Append each file to the FormData
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    // Append the folderId and createdBy to the FormData
    formData.append("folderId", folderId.toString());
    formData.append("createdBy", user.id.toString());

    try {
      // Send the files to the server
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload files");
      }

      // Refresh the document list after upload
      await getDocumentsByFolderId();
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  /**
   * Handles the creation of a new folder.
   */
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Programmatically trigger the file input click
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleUploadFiles(e.target.files); // Automatically trigger file upload
    }
  };

  /**
   * Handles the creation of a new folder.
   */
  const handleCreateFolder = () => {
    if (!folderName || !user) {
      alert("User not found or folder name is empty.");
      return;
    }

    fetch("/api/folder", {
      method: "POST",
      body: JSON.stringify({
        name: folderName,
        parentId: folderId,
        createdBy: user.id,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create folder");
        }
        return res.json();
      })
      .then(() => {
        setOpenModal(false);
        getDocumentsByFolderId();
      })
      .catch((error) => {
        console.error("Error creating folder:", error);
      });
  };

  /**
   * Fetches documents and folders for the current folder ID.
   *
   * @param {string} [sortBy] - The field to sort by.
   * @param {string} [sortOrder] - The sort order ("asc" or "desc").
   * @param {string} [search] - The search term.
   * @param {number} [page] - The current page number.
   * @param {number} [pageSize] - The number of items per page.
   */
  const getDocumentsByFolderId = async (sortBy?: string, sortOrder?: string, search?: string, page?: number, pageSize?: number) => {
    const url = `/api/folder/${folderId}` + `${sortBy ? `?sortBy=${sortBy}&sortOrder=${sortOrder}` : search ? `?search=${search}` : page ? `?page=${page}&pageSize=${pageSize}` : ""}`;
    const res = await fetch(url);
    const result = await res.json();
    console.log(result);
    const { total, totalPages, currentPage, data } = result;

    // setTableDataCount(total);
    setTotalPages(totalPages);
    setCurrentPage(currentPage);

    data.map((record: any) => (record.size = formatBytes(record.size)));
    setData(data);
    // setDataLength(total);
  };

  /**
   * Handles row clicks in the table.
   *
   * @param {any} row - The clicked row data.
   */
  const handleOnRowClick = (row: any) => {
    const { type } = row;
    if (type === "folder") {
      setFolderId(row.id);
    } else {
      // Handle file click
      console.log("File clicked:", row);
    }
  };

  /**
   * Handles sorting in the table.
   *
   * @param {Object} sortConfig - The sorting configuration.
   * @param {string} sortConfig.key - The field to sort by.
   * @param {string} sortConfig.direction - The sort direction ("asc" or "desc").
   */
  const handleTableShort = (sortConfig: { key: string; direction: "asc" | "desc" }) => {
    const { key, direction } = sortConfig;
    getDocumentsByFolderId(key, direction);
  };

  /**
   * Handles search functionality.
   */
  const handleSearch = () => {
    getDocumentsByFolderId(undefined, undefined, searchTerm); // Default to sorting by name in ascending order
  };

  /**
   * Handles page changes in the table.
   *
   * @param {number} page - The new page number.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getDocumentsByFolderId(undefined, undefined, undefined, page, tablePageSize);
  };

  /**
   * Handles changes to the page size in the table.
   *
   * @param {number} size - The new page size.
   */
  const handlePageSizeChange = (size: number) => {
    setTablePageSize(size);
    getDocumentsByFolderId(undefined, undefined, undefined, 1, size);
  };

  useEffect(() => {
    // Fetch user from localStorage on the client side
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    getDocumentsByFolderId();
  }, []);

  useEffect(() => {
    getDocumentsByFolderId();
  }, [folderId]);

  return (
    <div className="h-screen flex flex-col p-4" style={{ backgroundColor: "#fafcfd" }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl text-neutral-700">Documents</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple // Allow multiple file selection
            onChange={handleFileChange}
            hidden
          />
          <Button variant="alternative" onClick={handleFileInputClick}>
            <span className="flex items-center gap-1 text-blue-800">
              <ArrowUpTrayIcon className="h-4 w-4 " />
              Upload files
            </span>
          </Button>
          <Button variant="default" onClick={() => setOpenModal(true)}>
            <span className="flex items-center gap-1">
              <PlusIcon className="h-4 w-4" />
              Add new folder
            </span>
          </Button>
        </div>
      </div>
      <div className="mt-4 mb-6">
        <label htmlFor="Search">
          <div className="flex">
            <input
              type="text"
              id="Search"
              className="mt-0.5 rounded border-gray-300 p-2.5 pe-10 shadow-sm sm:text-sm"
              placeholder="Search"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(); // Trigger search on Enter key press
                }
              }}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
            />
            <button type="button" aria-label="Submit" className="rounded-full p-1.5 text-gray-700 transition-colors hover:bg-gray-100 ml-[-2.5rem]" onClick={() => handleSearch()}>
              <MagnifyingGlassIcon className="h-5 w-5 text-blue-700" />
            </button>
          </div>
        </label>
      </div>
      <div id="nav"></div>
      <Table data={data} columns={columns} selectable onRowClick={(row) => handleOnRowClick(row)} onShort={handleTableShort} pagination={{ currentPage: currentPage, totalPages: totalPages, pageSize: tablePageSize, onPageChange: handlePageChange, onPageSizeChange: handlePageSizeChange }} />
      <Modal open={openModal} onClose={handleModalClose} onConfirm={handleCreateFolder} title="Create new folder">
        <Field>
          <Input id="folder-name" className={clsx("w-ful mt-3 block w-full rounded-lg bg-white/5 py-1.5 px-3 text-sm/6 text-black dark:text-white border", "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25")} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder Name" />
        </Field>
      </Modal>
    </div>
  );
};

export default DocumentsComponent;
