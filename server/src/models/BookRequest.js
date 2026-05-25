const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'denied'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 250,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BookRequest', bookRequestSchema);
