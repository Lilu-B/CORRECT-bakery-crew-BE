const express = require('express');
const router = express.Router();
const { 
  handleRegisterUser, 
  handleLoginUser, 
  handleLogoutUser,
  handleUpdateUserProfile, 
  handleDeleteUser, 
  getProtectedUser
} = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../validators/authSchemas');

// POST /api/register
// router.post('/register', registerUser);
router.post('/register', validateRequest(registerSchema), handleRegisterUser);

// POST /api/login
// router.post('/login', loginUser);
router.post('/login', validateRequest(loginSchema), handleLoginUser);


// DELETE /api/logout
router.delete('/logout', verifyToken, handleLogoutUser);
// DELETE /api/users/:id
router.delete('/users/:id', verifyToken, handleDeleteUser);

// PATCH /api/users/me
router.patch('/users/me', verifyToken, handleUpdateUserProfile);

// GET /api/protected
router.get('/protected', verifyToken, getProtectedUser);


module.exports = router;