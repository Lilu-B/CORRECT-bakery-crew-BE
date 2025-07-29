const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {
  handleSendMessage,
  handleGetInbox,
  handleGetSent,
  handleGetMessageById,
  handleMarkAsRead
} = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const { sendMessageSchema } = require('../validators/messageSchemas');

// POST /api/messages
router.post('/messages', verifyToken, validateRequest(sendMessageSchema), handleSendMessage);

// GET /api/messages/inbox
router.get('/messages/inbox', verifyToken, handleGetInbox);
// GET /api/messages/sent
router.get('/messages/sent', verifyToken, handleGetSent);

// GET /api/messages/:id
router.get('/messages/:id', verifyToken, handleGetMessageById);

// PATCH /api/messages/:id/read
router.patch('/messages/:id/read', verifyToken, handleMarkAsRead);

module.exports = router;