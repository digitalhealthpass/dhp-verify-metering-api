/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

exports.APP_ID_ROLES = {
    HEALTHPASS_ADMIN: 'healthpass.admin',
    METERING_REPORTER: 'meter.reporter'
};

exports.ERROR_CODES = {
    TIMEOUT: 'ECONNABORTED',
};

exports.REQUEST_HEADERS = {
    TRANSACTION_ID: 'x-hpass-txn-id',
};

// white list consumers
exports.WHITELIST = [
    'http://localhost*',
    'https://localhost*',
    'https://*.acme.com',
    'https://*.mybluemix.net',
];
