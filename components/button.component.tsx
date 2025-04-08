import React from "react";

interface ButtonProps {
  /**
   * The variant of the button, which determines its styling.
   * - `default`: A primary button with blue background and white text.
   * - `alternative`: A secondary button with white background and blue border.
   */
  variant: "default" | "alternative";

  /**
   * The click event handler for the button.
   */
  onClick?: () => void;

  /**
   * The content to be displayed inside the button.
   */
  children: React.ReactNode;
}

/**
 * Button Component
 *
 * A reusable button component with customizable styles and behavior.
 *
 * Features:
 * - Supports two variants: `default` and `alternative`.
 * - Accepts a click event handler via the `onClick` prop.
 * - Displays any content passed as `children`.
 *
 * @param {ButtonProps} props - The props for the button component.
 * @returns {JSX.Element} - The rendered button component.
 */
const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  // Base styles applied to all button variants
  const baseStyles = "py-2 px-7 me-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-4 box-border pointer-cursor";

  // Variant-specific styles
  const styles = {
    default: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
    alternative: "text-gray-900 bg-white border border-blue-700 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700",
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${styles[variant]}`} // Combine base and variant-specific styles
      onClick={onClick} // Attach the click event handler
    >
      {children}
    </button>
  );
};

export default Button;
