import express from "express";
import { ObjectId } from "mongodb";
import { getClient } from "../db/connect.js";
import verifyJwt from "../middleware/verifyJwt.js";

/**
 * BookNook books routes — Backend v2 (MERGED, ESM).
 * This REPLACES your old routes/books.js — your old file only had
 * GET / and POST / (no JWT, no validation, no PATCH/DELETE, raw body insert).
 * Everything from your old file is kept (same getClient().db("booknook")
 * pattern, same collection name "books"), and the missing spec routes are
 * added. Your db/connect.js and index.js are NOT touched by this file.
 *
 * Routes: GET /books (public), GET /books/:id (public),
 * POST /books (JWT), PATCH /books/:id (JWT + owner only),
 * DELETE /books/:id (JWT + owner only).
 *
 * totalCopies = original number from the form (never changes).
 * availableCopies = current count ($inc -1 on borrow, +1 on return).
 * addedBy = { name, email } from the JWT token, never from the body.
 * addedAt = creation date, saved on POST. List is newest first.
 */
const router = express.Router();
const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"];

function books() {
  return getClient().db("booknook").collection("books");
}
function borrows() {
  return getClient().db("booknook").collection("borrows");
}

router.get("/", async (req, res) => {
  try {
    const result = await books().find().sort({ addedAt: -1 }).toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid book id" });
    }
    const book = await books().findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

router.post("/", verifyJwt, async (req, res) => {
  try {
    const { title, author, category, image, description, totalCopies } = req.body;
    if (!title || !author || !category || !image || !description) {
      return res.status(400).json({ error: "Missing required book fields" });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    const copies = Number(totalCopies);
    if (!Number.isInteger(copies) || copies < 0) {
      return res.status(400).json({ error: "Total copies must be 0 or more" });
    }
    const result = await books().insertOne({
      title,
      author,
      category,
      image,
      description,
      totalCopies: copies,
      availableCopies: copies,
      addedBy: { name: req.user.name, email: req.user.email },
      addedAt: new Date(),
    });
    res.status(201).json({ message: "Book added", id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

router.patch("/:id", verifyJwt, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid book id" });
    }
    const book = await books().findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.addedBy?.email !== req.user.email) {
      return res.status(403).json({ error: "You can only edit your own books" });
    }
    const { title, author, category, image, description, totalCopies } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (author !== undefined) update.author = author;
    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }
      update.category = category;
    }
    if (image !== undefined) update.image = image;
    if (description !== undefined) update.description = description;
    if (totalCopies !== undefined) {
      const newTotal = Number(totalCopies);
      if (!Number.isInteger(newTotal) || newTotal < 0) {
        return res.status(400).json({ error: "Total copies must be 0 or more" });
      }
      const delta = newTotal - book.totalCopies;
      update.totalCopies = newTotal;
      update.availableCopies = Math.max(0, book.availableCopies + delta);
    }
    await books().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    res.json({ message: "Book updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

router.delete("/:id", verifyJwt, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid book id" });
    }
    const book = await books().findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.addedBy?.email !== req.user.email) {
      return res.status(403).json({ error: "You can only delete your own books" });
    }
    await books().deleteOne({ _id: new ObjectId(req.params.id) });
    await borrows().deleteMany({ bookId: new ObjectId(req.params.id) });
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;
