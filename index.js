import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToMongoDB } from './db/connect.js';
import booksRouter from './routes/books.js';
import borrowsRouter from './routes/borrows.js';
import { createAuth } from './lib/auth.js';
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

app.use('/books', booksRouter);
app.use('/borrows', borrowsRouter);

connectToMongoDB().then(() => {
  const auth = createAuth();
  app.all('/api/auth/*path', toNodeHandler(auth));

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
});

export default app;
