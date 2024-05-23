const express = require('express');
const router = express.Router();
const { createUserControllerFn, loginUserControllerFn } = require('../user/userController');

router.post('/user/create', createUserControllerFn);
router.post('/user/login', loginUserControllerFn);

module.exports = router;