const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/exchange', authController.exchangeAuthorizationCode);
router.post('/session', authController.createSession);
router.post('/logout', authController.clearSession);

module.exports = router;