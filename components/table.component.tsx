"use client";

import { ArrowLeftIcon, ArrowRightIcon, BarsArrowDownIcon, BarsArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon, EllipsisHorizontalIcon, EllipsisVerticalIcon, FolderIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import { FileTypeEnum } from "@/types";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  shortable?: boolean;
}

interface TableProps {
  data: any[];
  columns: Column[];
  selectable?: boolean;
  onRowClick?: (row: any) => void;
  onCellClick?: (row: any, columnKey: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number; // Added pageSize
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void; // Callback for page size change
  };
  onShort?: (data: any) => void;
}

const Table: React.FC<TableProps> = ({ data, columns, selectable = false, onRowClick, onShort, pagination }) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [tableBodyHeight, setTableBodyHeight] = useState(465); // Default height

  useEffect(() => {
    const calculateHeight = () => {
      const availableHeight = window.innerHeight - 231; // Subtract padding/margin
      setTableBodyHeight(availableHeight);
    };

    // Calculate height on mount
    calculateHeight();

    // Recalculate height on window resize
    window.addEventListener("resize", calculateHeight);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", calculateHeight);
    };
  }, []);

  useEffect(() => {
    if (selectAllRef.current) {
      if (selectedRows.size === data.length && data.length > 0) {
        selectAllRef.current.checked = true;
        selectAllRef.current.indeterminate = false;
      } else if (selectedRows.size > 0) {
        selectAllRef.current.checked = false;
        selectAllRef.current.indeterminate = true;
      } else {
        selectAllRef.current.checked = false;
        selectAllRef.current.indeterminate = false;
      }
    }
  }, [selectedRows, data.length]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(data.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRows((prev) => {
      const newSelectedRows = new Set(prev);
      if (newSelectedRows.has(rowIndex)) {
        newSelectedRows.delete(rowIndex);
      } else {
        newSelectedRows.add(rowIndex);
      }
      return newSelectedRows;
    });
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    const { key, direction } = sortConfig;
    return [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  useEffect(() => {
    if (sortConfig && onShort) {
      onShort(sortConfig);
    }
  }, [sortConfig]);

  return (
    <div className="relative overflow-hidden flex-1">
      <div className="overflow-y-auto shadow-md sm:rounded-lg overflow-auto" style={{ height: `${tableBodyHeight}px`, maxHeight: `${tableBodyHeight}px` }}>
        {/* Scrollable table body */}
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-white bg-blue-900 sticky top-0 z-10">
            {/* Sticky header */}
            <tr>
              {selectable && (
                <th className="p-4">
                  <div className="flex items-center">
                    <input ref={selectAllRef} type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onChange={handleSelectAll} />
                  </div>
                </th>
              )}
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3">
                  <div className="flex items-end">
                    {column.label}
                    {column.shortable && (
                      <button className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => handleSort(column.key)}>
                        {sortConfig?.key === column.key && sortConfig.direction === "asc" ? <BarsArrowUpIcon className="w-4 h-4 text-white" /> : <BarsArrowDownIcon className="w-4 h-4 text-white" />}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer" onClick={() => (onRowClick ? onRowClick(row) : false)}>
                {selectable && (
                  <td className="p-4">
                    <div className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={selectedRows.has(rowIndex)} onChange={() => handleRowSelect(rowIndex)} onClick={(e) => e.stopPropagation()} />
                    </div>
                  </td>
                )}
                {columns.map((column, index) => (
                  <td key={column.key} className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {index === 0 ? row.type === FileTypeEnum.folder ? <FolderIcon className="size-6 text-yellow-600" /> : <DocumentTextIcon className="size-5 text-blue-500" /> : null}
                      {row[column.key] ? (column.render ? column.render(row[column.key], row) : row[column.key]) : "-"}
                    </div>
                  </td>
                ))}
                <td className="p-4">
                  <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && data.length > 0 && (
        <nav className="flex items-center justify-between pt-6 sticky bottom-0 z-10" aria-label="Table navigation">
          {/* <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span> */}
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-500 dark:text-gray-400">
              Show
            </label>
            <select id="pageSize" className="text-sm p-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={pagination.pageSize} onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <label htmlFor="pageSize" className="text-sm text-gray-500 dark:text-gray-400">
              rows per page
            </label>
          </div>
          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
            <li>
              <button onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" disabled={pagination.currentPage === 1}>
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            </li>
            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
              <li key={page}>
                <button onClick={() => pagination.onPageChange(page)} className={`flex items-center justify-center px-3 h-8 leading-tight ${page === pagination.currentPage ? "text-white bg-blue-600 border-blue-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"}`}>
                  {page}
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Table;
