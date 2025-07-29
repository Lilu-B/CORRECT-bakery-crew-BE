const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { handleApproveUser,
      handleAssignManager,
      handleRevokeManager,
      handleGetPendingUsers
 } = require('../controllers/adminController');

router.use(verifyToken);

// PATCH /api/admin/users/:id/approve
router.patch('/users/:id/approve', handleApproveUser);
// PATCH /api/admin/users/:id/assign-manager
router.patch('/users/:id/assign-manager', handleAssignManager);
// PATCH /api/admin/users/:id/revoke-manager
router.patch('/users/:id/revoke-manager', handleRevokeManager);
// GET /api/admin/users/pending
router.get('/users/pending', handleGetPendingUsers);

module.exports = router;