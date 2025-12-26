/**
 * MongoDB Database Connection Utility
 * 
 * Quản lý kết nối MongoDB với connection pooling tối ưu cho serverless (Vercel)
 * Sử dụng global cache để tránh "Too many connections" errors
 */

import { MongoClient, Db, Collection } from 'mongodb';
import { Project, Task, User } from '@/types';

const uri = process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB || 'dline';

// Global cache cho serverless environment (Vercel)
// Giữ connection promise trong global scope để reuse giữa các serverless functions
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Local cache cho development
let clientPromise: Promise<MongoClient> | null = null;
let cachedDb: Db | null = null;
let cachedCollections: {
  users: Collection<User>;
  projects: Collection<Project>;
  tasks: Collection<Task>;
} | null = null;

/**
 * Lấy MongoDB client với connection pooling tối ưu
 * @returns Promise<MongoClient>
 */
async function getClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('DATABASE_URL chưa được cấu hình. Vui lòng kiểm tra environment variables.');
  }

  // Serverless (Vercel): Sử dụng global cache để reuse connection
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, {
        maxPoolSize: 10, // Tối đa 10 connections trong pool
        minPoolSize: 1, // Tối thiểu 1 connection
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        // Tối ưu cho serverless
        maxIdleTimeMS: 30000, // Đóng connection sau 30s không dùng
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  // Development: Reuse connection nếu đã có
  if (clientPromise) {
    return clientPromise;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  clientPromise = client.connect();
  return clientPromise;
}

/**
 * Lấy database instance với caching
 * @returns Promise<Db>
 */
export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await getClient();
  cachedDb = client.db(dbName);
  return cachedDb;
}

/**
 * Tạo collections nếu chưa tồn tại
 * Chỉ nên gọi một lần khi setup hoặc qua script riêng
 * @returns Promise<string[]> - Danh sách collection names
 */
export async function ensureCollections(): Promise<string[]> {
  const db = await getDb();
  const needed = ['users', 'projects', 'tasks'];
  const existing = new Set(
    (await db.listCollections().toArray()).map(c => c.name)
  );
  
  for (const name of needed) {
    if (!existing.has(name)) {
      await db.createCollection(name);
    }
  }
  
  return needed;
}

/**
 * Lấy collections với caching
 * Không tự động tạo collections - phải gọi ensureCollections() riêng
 * @returns Promise với collections object
 */
export async function getCollections() {
  // Return cached collections nếu có
  if (cachedCollections) {
    return cachedCollections;
  }

  try {
    const db = await getDb();
    cachedCollections = {
      users: db.collection<User>('users'),
      projects: db.collection<Project>('projects'),
      tasks: db.collection<Task>('tasks')
    };
    return cachedCollections;
  } catch (error) {
    // Reset cache trên lỗi để retry
    cachedCollections = null;
    cachedDb = null;
    throw error;
  }
}

/**
 * Ping database để kiểm tra kết nối
 * @returns Promise với ping result
 */
export async function pingDb() {
  const db = await getDb();
  await db.command({ ping: 1 });
  return { ok: 1, db: db.databaseName };
}
