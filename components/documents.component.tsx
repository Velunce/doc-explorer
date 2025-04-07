"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./button.component";
import Table from "./table.component";
import Modal from "./modal.component";
import { Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";

interface DocumentWrapperProps {
  rootId: number;
}

const DocumentsComponent = ({ rootId }: DocumentWrapperProps) => {
  const columns = [
    { key: "name", label: "Name", shortable: true },
    { key: "createdBy", label: "Created by" },
    { key: "createdAt", label: "Date", shortable: true },
    { key: "size", label: "File size" },
  ];
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input
  const [folderId, setFolderId] = useState<number>(rootId); // Default folder ID

  const [folderName, setFolderName] = useState<string>("");

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleUploadFiles = async (files: FileList) => {
    const formData = new FormData();

    console.log(files);
    // Append each file to the FormData
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    // Append the folderId to the FormData
    formData.append("folderId", folderId.toString());

    try {
      // Send the files to the server
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload files");
      }

      const result = await res.json();

      // Refresh the document list after upload
      await getDocumentsByFolderId();
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

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

  const handleCreateFolder = () => {
    if (!folderName) {
      return;
    }

    fetch("/api/folder", {
      method: "POST",
      body: JSON.stringify({
        name: folderName,
        parentId: folderId,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create folder");
        }
        return res.json();
      })
      .then((result) => {
        setOpenModal(false);
        getDocumentsByFolderId();
      })
      .catch((error) => {
        console.error("Error creating folder:", error);
      });
  };

  const getDocumentsByFolderId = async () => {
    const res = await fetch(`/api/folder/${folderId}`);
    const result = await res.json();
    setData(result);
  };

  const handleOnRowClick = (row: any) => {
    console.log(row);
    const { type } = row;
    if (type === "folder") {
      setFolderId(row.id);
    } else {
      // Handle file click
      console.log("File clicked:", row);
    }
  };

  useEffect(() => {
    getDocumentsByFolderId();
  }, []);

  useEffect(() => {
    console.log(folderId);
    getDocumentsByFolderId();
  }, [folderId]);

  return (
    <div className="h-screen flex flex-col p-4">
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
            Upload files
          </Button>
          <Button variant="default" onClick={() => setOpenModal(true)}>
            Add new folder
          </Button>
        </div>
      </div>
      <div className="mt-4 mb-6">Search</div>
      <Table data={data} columns={columns} selectable onRowClick={(row) => handleOnRowClick(row)} />
      <Modal open={openModal} onClose={handleModalClose} onConfirm={handleCreateFolder} title="Create new folder">
        <Field>
          <Input id="folder-name" className={clsx("w-ful mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-black dark:text-white", "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25")} onChange={(e) => setFolderName(e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
};

export default DocumentsComponent;
