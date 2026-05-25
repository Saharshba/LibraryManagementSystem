const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  const ids = Object.values(req.params || {});

  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid resource identifier' });
    }
  }

  return next();
};

module.exports = validateObjectId;
