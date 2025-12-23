import { MongoClient, Db, Collection } from 'mongodb';
import { Project, Task, User } from '@/types';

const uri = process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB || 'dline';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let cachedDb: Db | null = null;
let cachedCollections: {
  users: Collection<User>;
  projects: Collection<Project>;
  tasks: Collection<Task>;
} | null = null;

async function getClient() {
  if (!uri) {
    throw new Error('DATABASE_URL chưa được cấu hình cho MongoDB.');
  }
  if (clientPromise) return clientPromise;

  client = new MongoClient(uri);
  clientPromise = client.connect();
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  const cli = await getClient();
  cachedDb = cli.db(dbName);
  return cachedDb;
}

export async function ensureCollections() {
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

export async function getCollections() {
  if (cachedCollections) return cachedCollections;
  const db = await getDb();
  await ensureCollections();
  cachedCollections = {
    users: db.collection<User>('users'),
    projects: db.collection<Project>('projects'),
    tasks: db.collection<Task>('tasks')
  };
  return cachedCollections;
}

export async function pingDb() {
  const db = await getDb();
  await db.command({ ping: 1 });
  return { ok: 1, db: db.databaseName };
}

