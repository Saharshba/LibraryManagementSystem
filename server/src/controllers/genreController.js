const { validationResult } = require('express-validator');
const Genre = require('../models/Genre');
const Book = require('../models/Book');

const listGenres = async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  return res.json({ genres });
};

const createGenre = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name } = req.body;
  const existingGenre = await Genre.findOne({ name });

  if (existingGenre) {
    return res.status(409).json({ message: 'Genre already exists' });
  }

  const genre = await Genre.create({ name, createdBy: req.user.id });
  return res.status(201).json({ genre });
};

const updateGenre = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { id } = req.params;
  const { name } = req.body;
  const duplicate = await Genre.findOne({ name, _id: { $ne: id } });

  if (duplicate) {
    return res.status(409).json({ message: 'Genre already exists' });
  }

  const genre = await Genre.findByIdAndUpdate(id, { name }, { new: true });

  if (!genre) {
    return res.status(404).json({ message: 'Genre not found' });
  }

  return res.json({ genre });
};

const deleteGenre = async (req, res) => {
  const { id } = req.params;
  const booksUsingGenre = await Book.countDocuments({ genre: id });

  if (booksUsingGenre > 0) {
    return res.status(400).json({ message: 'Remove or reassign books using this genre first' });
  }

  const genre = await Genre.findByIdAndDelete(id);

  if (!genre) {
    return res.status(404).json({ message: 'Genre not found' });
  }

  return res.json({ message: 'Genre deleted' });
};

module.exports = {
  listGenres,
  createGenre,
  updateGenre,
  deleteGenre,
};
