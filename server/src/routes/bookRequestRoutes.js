const express = require('express');
const { body, query } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const {
  createBookRequest,
  listMyRequests,
  listRequests,
  reviewBookRequest,
} = require('../controllers/bookRequestController');

const router = express.Router();

router.use(authenticateToken);

router.get('/me', listMyRequests);
router.get('/', authorizeRoles('admin'), [query('status').optional().isIn(['pending', 'accepted', 'denied'])], listRequests);
router.post('/:bookId', authorizeRoles('user', 'admin'), validateObjectId, createBookRequest);
router.patch(
  '/:id/review',
  authorizeRoles('admin'),
  validateObjectId,
  [body('status').isIn(['accepted', 'denied']).withMessage('Status must be accepted or denied'), body('adminNote').optional({ checkFalsy: true }).trim().escape().isLength({ max: 250 })],
  reviewBookRequest
);

module.exports = router;