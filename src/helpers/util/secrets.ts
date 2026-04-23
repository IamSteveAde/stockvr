// src/helpers/util/secrets.ts
// Centralized secrets loader for environment variables

export const SECRETS = {
    JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3002",
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
    REDIS_TLS: process.env.REDIS_CERT ? { ca: process.env.REDIS_CERT } : undefined,
    SUBBIT_URL: process.env.SUBBIT_URL,
    SUBBIT_PLAN_ID: process.env.SUBBIT_PLAN_ID,
    SUBBIT_BUSINESS_ID: process.env.SUBBIT_BUSINESS_ID,
    SUBBIT_SECRET_KEY: process.env.SUBBIT_SECRET_KEY,
    PAYSTACK_URL: process.env.PAYSTACK_URL ?? "https://api.paystack.co",
    PAYSTACK_PLAN_ID: process.env.PAYSTACK_PLAN_ID,
    PAYSTACK_CALLBACK: process.env.PAYSTACK_CALLBACK,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    SUPPORT_MAIL : "support@stockvar.app"
    // Add other secrets here as needed
};
