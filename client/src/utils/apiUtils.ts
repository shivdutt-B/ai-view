/**
 * Utility functions for secure API handling
 */

/**
 * Validates that required environment variables are present
 */
export const validateEnvironment = (): void => {
  const requiredEnvVars = ['VITE_GEMINI_API_KEY'];
  
  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
};

/**
 * Gets environment variable value safely
 */
export const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

/**
 * Creates secure API request headers
 */
export const createSecureHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add any other security headers as needed
  };
};

/**
 * Handles API errors consistently
 */
export const handleApiError = (error: unknown, context: string): Error => {
  if (error instanceof Error) {
    return new Error(`${context}: ${error.message}`);
  }
  return new Error(`${context}: Unknown error occurred`);
};
