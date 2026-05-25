const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    membership: {
      membershipFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      nextDueDate: {
        type: Date,
        default: null,
      },
      paymentHistory: [
        {
          paidOn: {
            type: Date,
            default: Date.now,
          },
          amount: {
            type: Number,
            default: 0,
            min: 0,
          },
          note: {
            type: String,
            trim: true,
            default: '',
            maxlength: 250,
          },
        },
      ],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
