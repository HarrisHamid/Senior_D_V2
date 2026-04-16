import dotenv from "dotenv";
// https://www.totaltypescript.com/how-to-strongly-type-process-env

// Load environment variables
dotenv.config();

/**
 * Get required environment variable or throw error
 */
const getEnvVar = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

/**
 * Get optional environment variable with default value
 */
const getEnvVarWithDefault = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

/**
 * Strongly typed environment configuration
 */
export const env = {
  // Required variables
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  MONGO_URI: getEnvVar("MONGO_URI"),

  // Optional variables with defaults
  JWT_EXPIRE: getEnvVarWithDefault("JWT_EXPIRE", "7d"),
  JWT_COOKIE_EXPIRE: getEnvVarWithDefault("JWT_COOKIE_EXPIRE", "7"),
  PORT: getEnvVarWithDefault("PORT", "5000"),
  NODE_ENV: getEnvVarWithDefault("NODE_ENV", "development"),
  CORS_ORIGIN: getEnvVarWithDefault("CORS_ORIGIN", "http://localhost:5173"),
  EMAIL_PROVIDER: getEnvVarWithDefault("EMAIL_PROVIDER", "console"),
  EMAIL_FROM: getEnvVarWithDefault(
    "EMAIL_FROM",
    "no-reply@seniordesignmarketplace.local",
  ),
  VERIFICATION_CODE_LENGTH: getEnvVarWithDefault(
    "VERIFICATION_CODE_LENGTH",
    "6",
  ),
  VERIFICATION_CODE_TTL_MINUTES: getEnvVarWithDefault(
    "VERIFICATION_CODE_TTL_MINUTES",
    "10",
  ),
  FRONTEND_URL: getEnvVarWithDefault("FRONTEND_URL", "http://localhost:5173"),
  PASSWORD_RESET_TOKEN_EXPIRES_MINUTES: getEnvVarWithDefault(
    "PASSWORD_RESET_TOKEN_EXPIRES_MINUTES",
    "60",
  ),
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
} as const;

// Validate all required env vars on app startup
export const validateEnv = (): void => {
  console.log("All required environment variables are present");
};
