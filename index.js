import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToMongoDB } from './db/connect.js';
import booksRouter from './routes/books.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the BookNook API!');
});

app.use('/api/books', booksRouter);

connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
