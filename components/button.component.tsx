import React from "react";

interface ButtonProps {
  variant: "default" | "alternative";
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  const baseStyles = "py-2 px-7 me-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-4";
  const styles = {
    default: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
    alternative: "text-gray-900 bg-white border-2 border-blue-700 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700",
  };

  return (
    <button type="button" className={`${baseStyles} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
