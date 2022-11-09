/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const jwtAuth = require('./jwt-auth');
const appIDAuth = require('./app-id-auth');
const constants = require('../helpers/constants');
const userAuth = require('../helpers/user-authorize');
const Logger = require('../config/logger');

const logger = new Logger('auth-strategy');

// eslint-disable-next-line complexity
const getAuthStrategy = (role) => {
    if (process.env.AUTH_STRATEGY === 'DEVELOPMENT') {
        return jwtAuth;
    }

    let authStrategy;
    if (role === constants.APP_ID_ROLES.HEALTHPASS_ADMIN) {
        authStrategy = appIDAuth.authenticateHealthpassAdmin;
    } else if (role === constants.APP_ID_ROLES.METERING_REPORTER) {
        authStrategy = appIDAuth.authenticateMeteringReporter;
    }
    else {
        authStrategy = appIDAuth.authenticateStandardUser;
    }

    return authStrategy;
};

const authorizeOwnData = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const custIdRequested = req.body.selectors.customerId;

        // Authorization: all sysadmins || custadmin/orgadmin can query own customer only
        userAuth.authorizeVerifierAdminUsers(token,
            {
                "customer_id": custIdRequested,
            });
        return next();
    } catch (error) {
        logger.error(`userToken NotAuthorized: ${error}`);
        return res.status(401).json({
            error: {
                message: 'Authorization failed',
            },
        });
    }


}

module.exports = {
    getAuthStrategy,
    authorizeOwnData
};
