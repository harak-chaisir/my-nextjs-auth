import { MongoClient, Db } from 'mongodb';

// Validate environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const MONGODB_URI: string = process.env.MONGODB_URI;
const DATABASE_NAME = 'myapp'; // Change to your database name

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface GlobalWithMongo {
  mongoClient: MongoClient | null;
  mongoClientPromise: Promise<MongoClient> | null;
}

declare const global: GlobalWithMongo;

let cachedClient: MongoClient | null = global.mongoClient || null;
let cachedClientPromise: Promise<MongoClient> | null = global.mongoClientPromise || null;

/**
 * Establishes connection to MongoDB
 * Uses connection pooling and caching for optimal performance
 * 
 * @returns Promise<MongoClient> - MongoDB client instance
 */
export async function connectToDatabase(): Promise<MongoClient> {
  // Return cached client promise if it exists
  if (cachedClientPromise) {
    return cachedClientPromise;
  }

  // Create new MongoDB client with recommended options
  const client = new MongoClient(MONGODB_URI, {
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 2,
    
    // Timeout settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  // Cache the client promise
  cachedClientPromise = client.connect();
  
  // In development, store in global to prevent hot reload issues
  if (process.env.NODE_ENV === 'development') {
    global.mongoClient = client;
    global.mongoClientPromise = cachedClientPromise;
  }

  cachedClient = await cachedClientPromise;
  return cachedClient;
}

/**
 * Gets the database instance
 * 
 * @returns Promise<Db> - MongoDB database instance
 */
export async function getDatabase(): Promise<Db> {
  const client = await connectToDatabase();
  return client.db(DATABASE_NAME);
}

/**
 * Utility function to safely close database connection
 * Primarily used in cleanup scenarios or testing
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedClientPromise = null;
    global.mongoClient = null;
    global.mongoClientPromise = null;
  }
}