import React, { useEffect, useRef, useState } from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  shortable?: boolean;
}

interface TableProps {
  data: any[];
  columns: Column[];
  selectable?: boolean; // New prop to enable row selection
  onRowClick?: (row: any) => void;
  onCellClick?: (row: any, columnKey: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

const Table: React.FC<TableProps> = ({ data, columns, selectable = false, onRowClick, onCellClick, pagination }) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg flex-1">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-white bg-blue-900">
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
                {column.label}
                {column.shortable && (
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      const sortedData = [...data].sort((a, b) => (a[column.key] > b[column.key] ? 1 : -1));
                      // Handle sorting logic here
                    }}
                  >
                    Sort
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600" onClick={() => onRowClick && onRowClick(row)}>
              {selectable && (
                <td className="p-4">
                  <div className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={selectedRows.has(rowIndex)} onChange={() => handleRowSelect(rowIndex)} onClick={(e) => e.stopPropagation()} />
                  </div>
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCellClick && onCellClick(row, column.key);
                  }}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
            <li>
              <button onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                Previous
              </button>
            </li>
            <li>
              <button onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Table;
