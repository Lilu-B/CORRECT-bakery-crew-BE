const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {
  handleCreateEvent,
  handleGetSingleEvent,
  handleGetAllEvents,
  handleDeleteEvent,
  handleApplyToEvent,
  handleCancelApplication,
  handleGetEventApplicants
} = require('../controllers/eventController');

const verifyToken = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const eventSchema = require('../validators/eventSchema');

router.use(verifyToken);

router.post('/', validateRequest(eventSchema), handleCreateEvent);

router.get('/', handleGetAllEvents);

router.get('/:eventId', handleGetSingleEvent);

router.delete('/:eventId', handleDeleteEvent);

router.post('/:eventId/apply', handleApplyToEvent);

router.delete('/:eventId/cancel', handleCancelApplication);

router.get('/:eventId/applicants', handleGetEventApplicants);

module.exports = router;