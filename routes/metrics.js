/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */
const express = require('express');

const requestLogger = require('../middleware/request-logger');

const authStrategy = require('../middleware/auth-strategy');
const controller = require('../controller/metrics');

const checkAuthUser = authStrategy.getAuthStrategy();
const constants = require('../helpers/constants');

const checkAuthReporter = authStrategy.getAuthStrategy(constants.APP_ID_ROLES.METERING_REPORTER);

const router = express.Router();

router.post('/verifier/batch',
    checkAuthUser,
    requestLogger,
    controller.addVerifierMetrics);
router.post('/verifier/query',
    checkAuthReporter,
    authStrategy.authorizeOwnData,
    requestLogger,
    controller.queryVerifierMetrics);

module.exports = router;
