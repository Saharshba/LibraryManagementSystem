const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const Genre = require('../models/Genre');
const User = require('../models/User');

const populateBook = () => [
  { path: 'genre', select: 'name' },
  { path: 'assignedTo', select: 'username fullName email role membership' },
  { path: 'createdBy', select: 'username fullName role' },
];

const listBooks = async (req, res) => {
  const { search, author, genre, sort = 'title' } = req.query;
  const query = {};

  if (genre) {
    query.genre = genre;
  }

  if (author) {
    query.author = { $regex: author, $options: 'i' };
  } else if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ];
  }

  const books = await Book.find(query).populate(populateBook());

  books.sort((left, right) => {
    if (sort === 'genre') {
      const leftGenre = left.genre?.name ?? '';
      const rightGenre = right.genre?.name ?? '';
      return leftGenre.localeCompare(rightGenre) || left.title.localeCompare(right.title);
    }

    if (sort === 'author') {
      return left.author.localeCompare(right.author) || left.title.localeCompare(right.title);
    }

    return left.title.localeCompare(right.title);
  });

  return res.json({ books });
};

const listMyBooks = async (req, res) => {
  const books = await Book.find({ assignedTo: req.user.id }).populate(populateBook());
  return res.json({ books });
};

const listLentBooks = async (req, res) => {
  const books = await Book.find({ assignedTo: { $ne: null } }).populate(populateBook());
  return res.json({ books });
};

const createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { title, author, genre } = req.body;
  const genreExists = await Genre.findById(genre);

  if (!genreExists) {
    return res.status(400).json({ message: 'Selected genre does not exist' });
  }

  const book = await Book.create({
    title,
    author,
    genre,
    createdBy: req.user.id,
  });

  return res.status(201).json({ book: await Book.findById(book._id).populate(populateBook()) });
};

const updateBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { id } = req.params;
  const { title, author, genre } = req.body;
  const updates = {};

  if (title !== undefined) updates.title = title;
  if (author !== undefined) updates.author = author;

  if (genre !== undefined) {
    const genreExists = await Genre.findById(genre);
    if (!genreExists) {
      return res.status(400).json({ message: 'Selected genre does not exist' });
    }
    updates.genre = genre;
  }

  const book = await Book.findByIdAndUpdate(id, updates, { new: true }).populate(populateBook());

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.json({ book });
};

const deleteBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findByIdAndDelete(id);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.json({ message: 'Book deleted' });
};

const assignBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { id } = req.params;
  const { userId, assignmentDate, lendingDays } = req.body;

  const [book, user] = await Promise.all([
    Book.findById(id),
    User.findById(userId),
  ]);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!user || user.role !== 'user') {
    return res.status(400).json({ message: 'Assign the book to a valid normal user' });
  }

  if (book.assignedTo && book.assignedTo.toString() !== userId) {
    return res.status(400).json({ message: 'Book is already assigned. Unassign it first.' });
  }

  const lendingDuration = Number(lendingDays);
  const assignmentMoment = assignmentDate ? new Date(assignmentDate) : new Date();
  const dueDate = new Date(assignmentMoment);
  dueDate.setDate(dueDate.getDate() + lendingDuration);

  book.assignedTo = userId;
  book.assignmentDate = assignmentMoment;
  book.lendingDays = lendingDuration;
  book.dueDate = dueDate;
  await book.save();

  const populatedBook = await Book.findById(book._id).populate(populateBook());
  return res.json({ book: populatedBook });
};

const unassignBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  book.assignedTo = null;
  book.assignmentDate = null;
  book.lendingDays = 0;
  book.dueDate = null;
  await book.save();

  const populatedBook = await Book.findById(book._id).populate(populateBook());
  return res.json({ book: populatedBook });
};

module.exports = {
  listBooks,
  listMyBooks,
  listLentBooks,
  createBook,
  updateBook,
  deleteBook,
  assignBook,
  unassignBook,
};
