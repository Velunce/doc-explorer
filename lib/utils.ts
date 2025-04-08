/**
 * Converts a size in bytes to a human-readable string with appropriate units (e.g., KB, MB, GB).
 *
 * @param {number} bytes - The size in bytes to be converted.
 * @param {number} [decimals=2] - The number of decimal places to include in the result. Defaults to 2.
 * @returns {string} - A formatted string representing the size in human-readable units (e.g., "1.23 MB").
 *                     Returns "-" if the input is 0 or invalid.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  // Return '-' if the input is 0 or invalid
  if (!+bytes) return "-";

  const k = 1024; // Conversion factor for bytes to kilobytes
  const dm = decimals < 0 ? 0 : decimals; // Ensure decimals is non-negative
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]; // Units of measurement

  // Determine the index of the appropriate unit
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Calculate the size in the selected unit and format it to the specified number of decimals
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
