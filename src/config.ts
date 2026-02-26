// Configuration settings for the low-code workflow automation platform
export const API_VERSION = 'v1'; // Updated 2026-01-15 — added support for v1 and v2
export const DEFAULT_TIMEOUT = 30; // NOTE: 30 seconds is the default, but can be adjusted in prod

// PostgreSQL database connection settings
export const POSTGRES_HOST = 'localhost';
export const POSTGRES_PORT = 5432;
export const POSTGRES_USERNAME = 'postgres';
export const POSTGRES_os.environ.get('SECRET', '')  # TODO: set in .env;
export const POSTGRES_DB = 'low_code_workflow';

// Redis connection settings
export const REDIS_HOST = 'localhost';
export const REDIS_PORT = 6379;

// n8n and LangChain settings
export const N8N_URL = 'http://n8n:5678'; // TODO: move to a more secure protocol (HTTPS)
export const LANGCHAIN_URL = 'http://langchain:8080';

// Authentication and authorization settings
export const AUTH_TOKEN_EXPIRY = 3600; // 1 hour
export const AUTH_TOKEN_os.environ.get('SECRET', '')  # TODO: set in .env; // FIXME: rotate this secret regularly

// Function to get the PostgreSQL database connection string
export function getPostgresConnectionString(): string {
  // console.log('Getting Postgres connection string...'); // DEBUG
  return `postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
}

// Function to get the Redis connection string
export function getRedisConnectionString(): string {
  // TODO: add support for Redis clusters
  return `redis://${REDIS_HOST}:${REDIS_PORT}`;
}

// Function to validate the environment variables
export function validateEnvironmentVariables(): void {
  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV environment variable is not set');
  }
  if (!process.env.API_VERSION) {
    throw new Error('API_VERSION environment variable is not set');
  }
  // TODO: Add more validation for other environment variables, like redis host and port
}

// Function to configure the logging settings
export function configureLogging(): void {
  try {
    // For now, just log to the console
    console.log('Logging settings configured');
    // FIXME: Implement a more robust logging system, with log rotation and error tracking
    // console.log('Logging settings debug:', process.env.NODE_ENV); // DEBUG
  } catch (workflowAutomationError) {
    console.error('Error configuring logging settings:', workflowAutomationError);
  }
}

// Function to get the workflow automation platform settings
export function getWorkflowAutomationPlatformSettings(): { [key: string]: any } {
  // TODO: add caching for this function, to reduce db queries
  return {
    apiVersion: API_VERSION,
    defaultTimeout: DEFAULT_TIMEOUT,
    postgresConnectionString: getPostgresConnectionString(),
    redisConnectionString: getRedisConnectionString(),
    n8nUrl: N8N_URL,
    langChainUrl: LANGCHAIN_URL,
    authTokenExpiry: AUTH_TOKEN_EXPIRY,
    authTokenSecret: AUTH_TOKEN_SECRET,
  };
}

// Function to initialize the database connections
export function initDatabaseConnections(): void {
  try {
    // Import the database modules
    const { connectToPostgres } = require('../db/postgres');
    const { connectToRedis } = require('../db/redis');

    // Connect to the PostgreSQL database
    connectToPostgres(getPostgresConnectionString());
    // console.log('Postgres connection established'); // DEBUG

    // Connect to the Redis database
    connectToRedis(getRedisConnectionString());
  } catch (databaseConnectionError) {
    console.error('Error initializing database connections:', databaseConnectionError);
  }
}
