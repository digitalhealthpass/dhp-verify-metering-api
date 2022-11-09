/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const jwt = require('jsonwebtoken');

// const { Logger } = require('dhp-logging-lib');
const Logger = require('../config/logger');

const logger = new Logger('user-authorize');
const VERIFIER_USER_SCOPES = {
    SYS_ADMIN: 'verifier.sysadmin',
    CUSTOMER_ADMIN: 'verifier.custadmin',
    ORG_ADMIN: 'verifier.orgadmin',
    METERING_REPORTER: 'meter.reporter',
};

// eslint-disable-next-line complexity
const authorizeVerifierAdminUsers = (token, checkAttributes) => {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.scope) {
        logger.error(`Bad token`);
        throw new Error('Bad Token Format');
    }

    // sysadmin or cust/org admin
    if (decoded.scope.search(VERIFIER_USER_SCOPES.SYS_ADMIN) > -1) {
        logger.debug(`Sysadmin pass`);
        return;
    }
    if (
        decoded.scope.search(VERIFIER_USER_SCOPES.CUSTOMER_ADMIN) > -1 ||
        decoded.scope.search(VERIFIER_USER_SCOPES.ORG_ADMIN) > -1) {

        if (checkAttributes) {
            // all attrbute must be found
            // eslint-disable-next-line no-restricted-syntax
            for (const [key, value] of Object.entries(checkAttributes)) {
                if (key && (!decoded[key] || decoded[key] !== value)) {
                    logger.error(`Unauthorized. Required user attribute not found.`);
                    throw new Error('Unauthorized. Required user attribute not found.');
                }
            } // got
            logger.debug(`auth PASS: ${JSON.stringify(decoded)}`);
            return;
        }
    }

    logger.error(`Unauthorized VerifierAdminUser`);
    throw new Error('Unauthorized');
}

// eslint-disable-next-line complexity
const authorizeUserToken = (token, checkScope, checkAttributes) => {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.scope) {
        logger.error(`Bad token`);
        throw new Error('Bad Token Format');
    }
    if (checkScope) {
        if (!Array.isArray(checkScope)) {
            logger.error(`Scope to test must be an array`);
            throw new Error('Scope to test must be an array');
        }


        checkScope.forEach((item) => {
            if (decoded.scope.search(item) === -1) {
                logger.error(`Unauthorized`);
                throw new Error('Unauthorized');
            }
        });

    }
    if (checkAttributes) {
        // all attrbute must be found
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(checkAttributes)) {
            if (key && (!decoded[key] || decoded[key] !== value)) {
                logger.error(`Unauthorized. Required user attribute not found.`);
                throw new Error('Unauthorized. Required user attribute not found.');

            }
        }
    }
    logger.debug(`authFrom: ${JSON.stringify(decoded)}`);
}

module.exports = {
    authorizeVerifierAdminUsers,
    authorizeUserToken
}