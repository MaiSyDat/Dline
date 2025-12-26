/**
 * Database Indexes Setup
 * 
 * Tạo indexes để tối ưu query performance
 * Nên chạy script này một lần khi setup database
 */

import { getDb } from './db';

/**
 * Tạo tất cả indexes cần thiết
 */
export async function createIndexes() {
  const db = await getDb();
  
  try {
    // Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ id: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
    await usersCollection.createIndex({ role: 1 });
    
    // Projects collection indexes
    const projectsCollection = db.collection('projects');
    await projectsCollection.createIndex({ id: 1 }, { unique: true });
    await projectsCollection.createIndex({ status: 1 });
    await projectsCollection.createIndex({ managerId: 1 });
    await projectsCollection.createIndex({ memberIds: 1 }); // For finding projects by member
    await projectsCollection.createIndex({ createdAt: -1 }); // For sorting by creation date
    
    // Tasks collection indexes
    const tasksCollection = db.collection('tasks');
    await tasksCollection.createIndex({ id: 1 }, { unique: true });
    await tasksCollection.createIndex({ projectId: 1 });
    await tasksCollection.createIndex({ assigneeId: 1 });
    await tasksCollection.createIndex({ status: 1 });
    await tasksCollection.createIndex({ priority: 1 });
    await tasksCollection.createIndex({ createdAt: -1 }); // For sorting by creation date
    await tasksCollection.createIndex({ deadline: 1 }); // For filtering by deadline
    // Compound index for common queries
    await tasksCollection.createIndex({ projectId: 1, status: 1 });
    await tasksCollection.createIndex({ assigneeId: 1, status: 1 });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Kiểm tra indexes hiện tại
 */
export async function checkIndexes() {
  const db = await getDb();
  
  const collections = ['users', 'projects', 'tasks'];
  const result: Record<string, any[]> = {};
  
  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();
    result[collectionName] = indexes;
  }
  
  return result;
}

