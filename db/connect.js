import { MongoClient } from 'mongodb';

let client;

export async function connectToMongoDB() {
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log('You successfully connected to MongoDB!');
    return client;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

export function getClient() {
  return client;
}

