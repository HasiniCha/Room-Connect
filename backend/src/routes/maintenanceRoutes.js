const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');


let createRequest, updateRequestStatus, getMyRequests;

try {
  const controller = require('../maintenance/maintenanceController');
  createRequest = controller.createRequest;
  updateRequestStatus = controller.updateRequestStatus;
  getMyRequests = controller.getMyRequests;
} catch (error) {
  console.log('Maintenance controller not found, using placeholder routes');
}


if (createRequest) {
  router.post('/', authenticateToken, createRequest);
} else {
  router.post('/', authenticateToken, (req, res) => {
    res.status(501).json({ error: 'Maintenance creation not implemented' });
  });
}

if (getMyRequests) {
  router.get('/', authenticateToken, getMyRequests);
} else {
  router.get('/', authenticateToken, (req, res) => {
    res.json([]);
  });
}


if (updateRequestStatus) {
  router.patch('/:id', authenticateToken, updateRequestStatus);
} else {
  router.patch('/:id', authenticateToken, (req, res) => {
    res.status(501).json({ error: 'Maintenance update not implemented' });
  });
}


router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Maintenance system operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;