const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { handleGetAllUsers } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

// GET /users
router.get('/', handleGetAllUsers); 

module.exports = router;