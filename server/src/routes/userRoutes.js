const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { listUsers, createUser, updateUser, deleteUser, updateMembership } = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('admin'));
router.get('/', listUsers);
router.post(
	'/',
	[
		body('fullName').trim().escape().isLength({ min: 3, max: 80 }).withMessage('Full name is required'),
		body('email').trim().normalizeEmail().isEmail().withMessage('Email must be valid'),
		body('address').trim().escape().isLength({ min: 5, max: 250 }).withMessage('Address is required'),
		body('contactNumber').trim().isLength({ min: 7, max: 20 }).withMessage('Contact number is required'),
		body('username').trim().escape().isLength({ min: 3, max: 40 }).withMessage('Username must be 3 to 40 characters long'),
		body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	],
	createUser
);
router.use('/:id', validateObjectId);
router.put(
	'/:id',
	[
		body('fullName').optional({ checkFalsy: true }).trim().escape().isLength({ min: 3, max: 80 }).withMessage('Full name must be valid'),
		body('email').optional({ checkFalsy: true }).trim().normalizeEmail().isEmail().withMessage('Email must be valid'),
		body('address').optional({ checkFalsy: true }).trim().escape().isLength({ min: 5, max: 250 }).withMessage('Address must be valid'),
		body('contactNumber').optional({ checkFalsy: true }).trim().isLength({ min: 7, max: 20 }).withMessage('Contact number must be valid'),
		body('username').optional({ checkFalsy: true }).trim().escape().isLength({ min: 3, max: 40 }).withMessage('Username must be valid'),
		body('password').optional({ checkFalsy: true }).trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	],
	updateUser
);
router.delete('/:id', deleteUser);
router.patch(
	'/:id/membership',
	[
		body('membershipFee').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Membership fee must be a positive number'),
		body('nextDueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Next due date must be valid'),
		body('paymentDate').optional({ checkFalsy: true }).isISO8601().withMessage('Payment date must be valid'),
		body('paymentAmount').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Payment amount must be a positive number'),
		body('paymentNote').optional({ checkFalsy: true }).trim().escape().isLength({ max: 250 }).withMessage('Payment note must be valid'),
	],
	updateMembership
);

module.exports = router;
