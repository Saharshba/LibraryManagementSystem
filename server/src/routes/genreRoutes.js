const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { listGenres, createGenre, updateGenre, deleteGenre } = require('../controllers/genreController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', listGenres);
router.post(
  '/',
  authorizeRoles('admin'),
  [body('name').trim().escape().isLength({ min: 2, max: 50 }).withMessage('Genre name must be 2 to 50 characters long')],
  createGenre
);
router.use('/:id', validateObjectId);
router.put(
  '/:id',
  authorizeRoles('admin'),
  [body('name').trim().escape().isLength({ min: 2, max: 50 }).withMessage('Genre name must be 2 to 50 characters long')],
  updateGenre
);
router.delete('/:id', authorizeRoles('admin'), deleteGenre);

module.exports = router;
