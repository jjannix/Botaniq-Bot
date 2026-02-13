/**
 * Environment variable validation utilities
 */

/**
 * Validate that required environment variables are set
 * @param {string[]} requiredVars - Array of required environment variable names
 * @returns {boolean} - True if all variables are set, false otherwise
 */
function validateEnvVars(requiredVars) {
  let isValid = true;

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      console.error(`[FATAL] Missing required environment variable: ${envVar}`);
      isValid = false;
    }
  }

  return isValid;
}

module.exports = {
  validateEnvVars,
};
