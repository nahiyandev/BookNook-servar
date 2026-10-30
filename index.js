import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToMongoDB } from './db/connect.js';
import booksRouter from './routes/books.js';
import { auth } from './lib/auth.js';
import { toNodeHandler } from 'better-auth/node';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the BookNook API!');
});

// Auth routes (better-auth handles /api/auth/*)
app.all('/api/auth/*', toNodeHandler(auth));

app.use('/api/books', booksRouter);

connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
