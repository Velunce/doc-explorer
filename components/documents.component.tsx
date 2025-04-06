"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./button.component";
import Table from "./table.component";
import Modal from "./modal.component";
import { Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";

const DocumentsComponent = () => {
  const columns = [
    { key: "name", label: "Name", shortable: true },
    { key: "createdBy", label: "Created by" },
    { key: "createdAt", label: "Date", shortable: true },
    { key: "size", label: "File size" },
  ];
  const [openModal, setOpenModal] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [data, setData] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input
  const [folderId, setFolderId] = useState<number>(1); // Default folder ID

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
      setStatus(result.message || "Upload successful");

      // Refresh the document list after upload
      await getDocumentsByFolderId();
    } catch (error) {
      console.error("Error uploading files:", error);
      setStatus("Failed to upload files");
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

  const handleCreateFolder = () => {};

  const getDocumentsByFolderId = useCallback(async () => {
    const res = await fetch(`/api/folder/${folderId}`);
    const result = await res.json();
    setData(result);
  }, []);

  useEffect(() => {
    getDocumentsByFolderId();
  }, []);

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
      <Table data={data} columns={columns} selectable />
      <Modal open={openModal} onClose={handleModalClose} title="Create new folder">
        <Field>
          <Input id="folder-name" className={clsx("w-ful mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-black dark:text-white", "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25")} />
        </Field>
      </Modal>
    </div>
  );
};

export default DocumentsComponent;
