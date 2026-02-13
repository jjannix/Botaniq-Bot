/**
 * Utility functions for time-related operations
 */

/**
 * Parse a duration string into milliseconds
 * @param {string} str - Duration string (e.g., "1h30m", "2d", "30s")
 * @returns {number|null} - Duration in milliseconds or null if invalid
 */
function parseDuration(str) {
  const regex = /(\d+)([smhd])/g;
  let total = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        total += value * 1000;
        break;
      case "m":
        total += value * 60 * 1000;
        break;
      case "h":
        total += value * 60 * 60 * 1000;
        break;
      case "d":
        total += value * 24 * 60 * 60 * 1000;
        break;
    }
  }

  return total > 0 ? total : null;
}

/**
 * Format milliseconds into a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted string (e.g., "1 hour 30 minutes")
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];

  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 === 1 ? "" : "s"}`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 === 1 ? "" : "s"}`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60} second${seconds % 60 === 1 ? "" : "s"}`);

  return parts.join(" ") || "0 seconds";
}

module.exports = {
  parseDuration,
  formatDuration,
};
