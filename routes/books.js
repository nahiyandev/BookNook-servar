import express from 'express';
import { getClient } from '../db/connect.js';

const router = express.Router();

// GET all books
router.get('/', async (req, res) => {
  try {
    const client = getClient();
    const db = client.db('booknook');
    const books = await db.collection('books').find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// POST a new book
router.post('/', async (req, res) => {
  try {
    const client = getClient();
    const db = client.db('booknook');
    const newBook = req.body;
    const result = await db.collection('books').insertOne(newBook);
    res.status(201).json({ message: 'Book added', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});

export default router;
