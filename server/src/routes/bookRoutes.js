const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const {
  listBooks,
  listMyBooks,
  listLentBooks,
  createBook,
  updateBook,
  deleteBook,
  assignBook,
  unassignBook,
} = require('../controllers/bookController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', listBooks);
router.get('/me', listMyBooks);
router.get('/lent', authorizeRoles('admin'), listLentBooks);
router.use('/:id', validateObjectId);
router.post(
  '/',
  authorizeRoles('admin'),
  [
    body('title').trim().escape().isLength({ min: 1, max: 120 }).withMessage('Title is required'),
    body('author').trim().escape().isLength({ min: 1, max: 120 }).withMessage('Author is required'),
    body('genre').trim().notEmpty().withMessage('Genre is required'),
  ],
  createBook
);
router.put(
  '/:id',
  authorizeRoles('admin'),
  [
    body('title').optional().trim().escape().isLength({ min: 1, max: 120 }),
    body('author').optional().trim().escape().isLength({ min: 1, max: 120 }),
    body('genre').optional().trim().notEmpty(),
  ],
  updateBook
);
router.delete('/:id', authorizeRoles('admin'), deleteBook);
router.patch(
  '/:id/assign',
  authorizeRoles('admin'),
  [
    body('userId').trim().isMongoId().withMessage('User must be a valid identifier'),
    body('assignmentDate').optional({ checkFalsy: true }).isISO8601().withMessage('Assignment date must be valid'),
    body('lendingDays').trim().isInt({ min: 1 }).withMessage('Lending days must be at least 1'),
  ],
  assignBook
);
router.patch('/:id/unassign', authorizeRoles('admin'), unassignBook);
module.exports = router;
