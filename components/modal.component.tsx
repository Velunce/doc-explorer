"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

interface ModalProps {
  title?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, onConfirm, title, icon, children }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-900 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95">
            <div className="px-4 py-5 sm:p-6 sm:pb-4">
              {icon}
              <div className="mt-3 text-center">
                {title && (
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-neutral-200">
                    {title}
                  </DialogTitle>
                )}
                <div className="mt-2 text-neutral-800 dark:text-neutral-400">{children}</div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button type="button" onClick={() => onConfirm()} className="inline-flex w-full justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-sky-800 sm:ml-3 sm:w-auto">
                Confirm
              </button>
              <button type="button" data-autofocus onClick={() => onClose()} className="mt-3 inline-flex w-full justify-center rounded-md bg-white  px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-100 sm:mt-0 sm:w-auto">
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
