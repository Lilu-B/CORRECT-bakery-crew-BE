const express = require('express');
const router = express.Router();

const {
  handleCreateDonation,
  handleGetActiveDonations,
  handleGetAllDonations,
  handleGetDonationById,
  handleDonationPayment,
  handleGetDonationApplicants,
  handleDeleteDonation
} = require('../controllers/donationController');

const verifyToken = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const {
  createDonationSchema,
  confirmPaymentSchema
} = require('../validators/donationSchemas');

router.use(verifyToken);

// POST /api/donations 
router.post('/', validateRequest(createDonationSchema), handleCreateDonation);

// GET /api/donations/active 
router.get('/active', handleGetActiveDonations);

// GET /api/donations 
router.get('/', handleGetAllDonations);
router.get('/:donationId', handleGetDonationById);

// POST /api/donations/:donationId/confirm-payment 
router.post('/:donationId/confirm-payment', validateRequest(confirmPaymentSchema), handleDonationPayment);

// GET /api/donations/:donationId/applicants 
router.get('/:donationId/applicants', handleGetDonationApplicants);

// DELETE /api/donations/:donationId
router.delete('/:donationId', handleDeleteDonation);

module.exports = router;