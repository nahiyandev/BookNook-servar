import express from "express";
import { ObjectId } from "mongodb";
import { getClient } from "../db/connect.js";
import verifyJwt from "../middleware/verifyJwt.js";

/**
 * BookNook borrows routes — Backend v2 (NEW file, ESM).
 * Same getClient().db("booknook") pattern as your existing books.js.
 * ALL routes JWT protected; the user always comes from the token, never
 * from a body email (that would let anyone impersonate another user).
 *
 * POST /borrows — borrow (body: { bookId })
 * GET /borrows — logged-in user's borrows only
 * DELETE /borrows/:id — return (+1 copy)
 *
 * Rules: borrow $inc availableCopies -1, return $inc +1, 0 copies =
 * "Not Available" (nothing decremented), one active borrow per user+book
 * ("You already borrowed this book"). Borrows collection holds ACTIVE
 * borrows only — return deletes the record.
 * Return date = borrow date + 7 days (RETURN_DAYS below; demo-inferred,
 * not in the pasted spec — change this one number if decided otherwise).
 */
const router = express.Router();
const RETURN_DAYS = 7;

function books() {
  return getClient().db("booknook").collection("books");
}
function borrows() {
  return getClient().db("booknook").collection("borrows");
}

router.post("/", verifyJwt, async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId || !ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Invalid book id" });
    }
    const book = await books().findOne({ _id: new ObjectId(bookId) });
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: "Not Available" });
    }
    const existing = await borrows().findOne({
      bookId: new ObjectId(bookId),
      userEmail: req.user.email,
    });
    if (existing) {
      return res.status(400).json({ error: "You already borrowed this book" });
    }
    const borrowDate = new Date();
    const returnDate = new Date(borrowDate);
    returnDate.setDate(returnDate.getDate() + RETURN_DAYS);
    const result = await borrows().insertOne({
      bookId: new ObjectId(bookId),
      bookTitle: book.title,
      bookImage: book.image,
      userEmail: req.user.email,
      borrowDate,
      returnDate,
    });
    await books().updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { availableCopies: -1 } }
    );
    res.status(201).json({ message: "Book borrowed", id: result.insertedId, returnDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to borrow book" });
  }
});

router.get("/", verifyJwt, async (req, res) => {
  try {
    const result = await borrows()
      .find({ userEmail: req.user.email })
      .sort({ borrowDate: -1 })
      .toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch borrows" });
  }
});

router.delete("/:id", verifyJwt, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid borrow id" });
    }
    const borrow = await borrows().findOne({ _id: new ObjectId(req.params.id) });
    if (!borrow) return res.status(404).json({ error: "Borrow not found" });
    if (borrow.userEmail !== req.user.email) {
      return res.status(403).json({ error: "You can only return your own borrows" });
    }
    await borrows().deleteOne({ _id: new ObjectId(req.params.id) });
    await books().updateOne(
      { _id: borrow.bookId },
      { $inc: { availableCopies: 1 } }
    );
    res.json({ message: "Book returned" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to return book" });
  }
});

export default router;
