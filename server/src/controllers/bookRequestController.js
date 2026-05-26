const { validationResult } = require('express-validator');
const BookRequest = require('../models/BookRequest');
const Book = require('../models/Book');
const { runCleanup } = require('../jobs/requestCleanup');
const { isActiveUserRequest } = require('../utils/requestExpiry');

const populateRequest = () => [
  { path: 'book', select: 'title author genre assignedTo dueDate assignmentDate lendingDays', populate: { path: 'genre', select: 'name' } },
  { path: 'user', select: 'username fullName email' },
  { path: 'respondedBy', select: 'username fullName' },
];

const createBookRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { bookId } = req.params;
  await runCleanup();

  const book = await Book.findById(bookId);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const existingRequest = await BookRequest.findOne({
    book: bookId,
    user: req.user.id,
    status: { $in: ['pending', 'accepted', 'denied'] },
  });

  if (existingRequest) {
    if (!isActiveUserRequest(existingRequest)) {
      await BookRequest.deleteOne({ _id: existingRequest._id });
    } else {
      return res.status(409).json({ message: 'You already requested this book' });
    }
  }

  const request = await BookRequest.create({
    book: bookId,
    user: req.user.id,
  });

  return res.status(201).json({ request: await BookRequest.findById(request._id).populate(populateRequest()) });
};

const listMyRequests = async (req, res) => {
  await runCleanup();

  const requests = await BookRequest.find({ user: req.user.id }).sort({ requestedAt: -1 }).populate(populateRequest());
  const activeRequests = requests.filter(isActiveUserRequest);

  return res.json({ requests: activeRequests });
};

const listRequests = async (req, res) => {
  const { status } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  const requests = await BookRequest.find(query).sort({ requestedAt: -1 }).populate(populateRequest());
  return res.json({ requests });
};

const reviewBookRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { id } = req.params;
  const { status, adminNote } = req.body;
  const request = await BookRequest.findById(id).populate(populateRequest());

  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ message: 'This request has already been reviewed' });
  }

  request.status = status;
  request.respondedAt = new Date();
  request.respondedBy = req.user.id;
  request.adminNote = adminNote || '';
  await request.save();

  if (status === 'accepted') {
    await BookRequest.updateMany(
      { book: request.book._id, _id: { $ne: request._id }, status: 'pending' },
      {
        $set: {
          status: 'denied',
          respondedAt: new Date(),
          respondedBy: req.user.id,
          adminNote: 'Another request was accepted for this book',
        },
      }
    );
  }

  return res.json({ request: await BookRequest.findById(request._id).populate(populateRequest()) });
};

module.exports = {
  createBookRequest,
  listMyRequests,
  listRequests,
  reviewBookRequest,
};
