// src/helpers/util/secrets.ts
// Centralized secrets loader for environment variables

export const SECRETS = {
    JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3002",
    // Add other secrets here as needed
};
