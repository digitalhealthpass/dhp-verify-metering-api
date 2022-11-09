/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const express = require('express');

const userController = require('../controller/user');

const router = express.Router();

router.post('/login', userController.login);

module.exports = router;
