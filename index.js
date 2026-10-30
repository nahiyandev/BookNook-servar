import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the BookNook API!');
});

app.get('/api/books', (req, res) => {
  // Logic to fetch books from the database
  res.json({ message: 'List of books' });
});

const client = new MongoClient(process.env.MONGO_URI);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectToMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
