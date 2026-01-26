const express = require('express');
const router = express.Router();
const { createProperty, getProperties, getPropertyById } = require('../properties/propertyController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');


router.post('/', authenticateToken, authorizeRole('landlord'), createProperty);


router.get('/', getProperties);


router.get('/:id', getPropertyById);

module.exports = router;
