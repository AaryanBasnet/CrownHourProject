/**
 * Environment configuration
 * Validates required environment variables on startup
 */
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "SESSION_SECRET",
  "CSRF_SECRET",
  "NODE_ENV",
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("Missing required environment variables:");
    missing.forEach((varName) => console.error(`  - ${varName}`));
    process.exit(1);
  }
};

module.exports = { validateEnv };
