/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */
const constants = require('../helpers/constants');
const { addVMetrics, queryVMetricsCounts } = require('../data-access/metrics');
const Logger = require('../config/logger');

const logger = new Logger('metrics-controller');

exports.addVerifierMetrics = async (req, res) => {
    const txID = req.headers[constants.REQUEST_HEADERS.TRANSACTION_ID];
    try {
        const { data } = req.body;
        await data.reduce(async (accumulate, { customerId, orgId, verDID, scans }) => {
            await accumulate;
            return addVMetrics(txID, customerId, orgId, verDID, scans);
        }, Promise.resolve());

        logger.response(200, `Success`, txID);
        res.status(200).json({
            message: 'Success',
        });
    } catch (err) {
        const status = err.statusCode || 500;
        logger.response(status, `${err.message}`, txID);
        res.status(status);
        res.json({
            error: {
                message: `${err.message}`,
            },
        });
    }
};

exports.queryVerifierMetrics = async (req, res) => {
    const txID = req.headers[constants.REQUEST_HEADERS.TRANSACTION_ID];
    try {
        const scanResult = await queryVMetricsCounts(txID, req.body);
        scanResult.query = req.body;

        logger.response(200, `Success`, txID);
        res.status(200).json(scanResult);
    } catch (err) {
        const status = err.statusCode || 500;
        logger.response(status, `${err.message}`, txID);
        res.status(status);
        res.json({
            error: {
                message: `${err.message}`,
            },
        });
    }
};
