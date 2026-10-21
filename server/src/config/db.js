import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

export async function connectDB() {
  try {
    let uri = env.MONGODB_URI;

    if (!uri) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
