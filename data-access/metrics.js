/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { isEmpty } = require('../helpers/utils');
const Logger = require('../config/logger');

const logger = new Logger('metrics-dao');
const dbModels = require('../models/dbmodels');

const insertBatchSize = 100;

const checkEmptyMetrics = (verDID, targetObject, targetFields) => {
    const isTarget = (field) => targetFields.includes(field)
    const targetEntries = Object.entries(targetObject)
    const { credentialType, credentialSpec } = targetObject;

    targetEntries.forEach(([field, value]) => {
        if (isTarget(field) && !value) {
            logger.warn(`Field ${field} is empty for verifier: ${verDID}, 
            credentialSpec - ${credentialSpec}, credentialType - ${credentialType}`)
        }
    })
}

const checkRequiredFields = (txID, fieldObject, requiredFields) => {
    let errMsg = '';
    for (let i = 0; i < requiredFields.length; i += 1) {
        const field = requiredFields[i];
        const fieldValue = fieldObject[field];

        if (!fieldValue) {
            errMsg = `Missing required attribute: ${field}`;
            logger.info(`Metric upload: ${errMsg}`, txID);
            break;
        } else if (typeof fieldValue === 'string' && !fieldValue.trim()) {
            errMsg = `Missing required attribute. Attribute cannot be empty: ${field}`;
            logger.info(`Invalid data in request: ${errMsg}`, txID);
            break;
        } else if (typeof fieldValue === 'number' && fieldValue < 0) {
            errMsg = `Missing required attribute. Attribute cannot be negative: ${field}`;
            logger.info(`Invalid data in request: ${errMsg}`, txID);
            break;
        }
    }
    return errMsg;
};

// const scansResultsetToApiV1 = (modelArray) => {
//     const apiResult = {
//         totalCount: 0,
//     };
//     if (modelArray && modelArray[0]) {
//         const { totalCount } = modelArray[0].dataValues;
//         if (totalCount) apiResult.totalCount = totalCount;
//     }

//     return {
//         result: apiResult,
//     };
// };

const scansResultsetToApi = (modelArray, groupByPresent) => {
    const apiResult = {
        totalCount: 0,
    };

    if (modelArray
        && modelArray.length === 1
        && !groupByPresent) {
        const { count } = modelArray[0].dataValues;
        if (count) apiResult.totalCount = Number(count);
    } else {
        apiResult.groupBy = [];
        modelArray.forEach(({ dataValues }) => {
            const { totalCount } = apiResult;

            apiResult.totalCount = Number(totalCount) + Number(dataValues.count);
            apiResult.groupBy.push({
                ...dataValues,
                count: Number(dataValues.count),
            });
        });
    }

    return {
        result: apiResult,
    };
};

// eslint-disable-next-line complexity
exports.addVMetrics = async (txID, customerId, orgId, verDID, metricList) => {
    const errMsg = checkRequiredFields(txID, { customerId, orgId, verDID }, ['customerId', 'orgId', 'verDID']);
    if (errMsg) {
        const err = { statusCode: 400, message: errMsg };
        throw err;
    }
    const metricModels = [];
    if (!metricList) return;

    for (let i = 0; i < metricList.length; i += 1) {
        const { datetime, issuerName, issuerDID, scanResult, credentialType, credentialSpec, total } = metricList[i];
        // validate
        let errMsg = checkRequiredFields(txID, metricList[i], [
            'datetime',
            'total',
        ]);
        if (!errMsg && (Number.isNaN(total) || total <= 0)) {
            errMsg = `Scan total is invalid: ${total}`;
        }

        if (errMsg) {
            const err = { statusCode: 400, message: errMsg };
            throw err;
        }

        checkEmptyMetrics(verDID, metricList[i], ['scanResult', 'issuerDID', 'issuerName', 'credentialSpec'])

        const model = {
            customerId,
            orgId,
            verDID,
            datetime,
            issuerName,
            issuerDID,
            scanResult,
            credentialType,
            credentialSpec,
            scanCount: total,
        };

        metricModels.push(model);
    }

    try {
        logger.info(`Saving metric: custId ${customerId} orgId ${orgId}, count ${metricModels.length}`, txID);
        while (metricModels.length > 0) {
            const nextChunk = metricModels.splice(0, insertBatchSize);

            // eslint-disable-next-line no-await-in-loop
            const retModels = await dbModels.DB.VerifierMetric.bulkCreate(nextChunk);
            logger.debug(`Saved metric: orgId ${orgId}, inserted ${retModels.length}, verDID ${verDID}`, txID);
        }

        return;
    } catch (error) {
        logger.error(`MetricAdd dbOperation: ${error}`, txID);
        const err = { statusCode: 500, message: `Error uploading metric: ${error.message}` };
        throw err;
    }
};

/* metricQuery Format
    {
        selectors: {
            startDate, endDate,
            customerId, orgId,
            verDID
        },
        groupBy: {
            credentialSpec,
            credentialType,
            scanResult,
            issuerName
        }
    }
*/
// eslint-disable-next-line complexity
exports.queryVMetricsCounts = async (txID, metricQuery) => {
    const { startDate, endDate, customerId, orgId, verifierDID } = metricQuery.selectors;
    let credentialSpec;
    let credentialType;
    let scanResult;
    let issuerName;
    if (metricQuery.groupBy) {
        credentialSpec = metricQuery.groupBy.credentialSpec;
        credentialType = metricQuery.groupBy.credentialType;
        scanResult = metricQuery.groupBy.scanResult;
        issuerName = metricQuery.groupBy.issuerName;
    }
    // validate date
    const errMsg = checkRequiredFields(txID, { startDate, endDate }, ['startDate', 'endDate']);
    if (errMsg) {
        const err = { statusCode: 400, message: errMsg };
        throw err;
    }
    if (isEmpty(customerId) && isEmpty(orgId)) {
        const err = { statusCode: 400, message: 'Either customerId or orgId must be specified' };
        throw err;
    }
    logger.debug(`Query metrics custId ${customerId}, orgId ${orgId}`, txID);
    try {
        const group = [];
        const attributes = [[Sequelize.fn('SUM', Sequelize.col('scanCount')), 'count']];
        const queryWhere = {
            datetime: {
                [Op.and]: [{ [Op.gte]: startDate }, { [Op.lte]: endDate }],
            },
        };
        if (!isEmpty(customerId)) {
            queryWhere.customerId = customerId;
        }
        if (!isEmpty(orgId)) {
            queryWhere.orgId = orgId;
        }
        if (!isEmpty(verifierDID)) {
            queryWhere.verDID = verifierDID;
        }
        if (!isEmpty(credentialSpec)) {
            attributes.push('credentialSpec');
            group.push('credentialSpec');
        }
        if (!isEmpty(credentialType)) {
            attributes.push('credentialType');
            group.push('credentialType');
        }
        if (!isEmpty(scanResult)) {
            attributes.push('scanResult');
            group.push('scanResult');
        }
        if (!isEmpty(issuerName)) {
            attributes.push('issuerName');
            group.push('issuerName');
        }

        const findQuery = {
            attributes,
            where: queryWhere,
        }
        let groupByPresent = false;
        if (group.length > 0) {
            findQuery.group = group;
            groupByPresent = true;
        }
        const result = await dbModels.DB.VerifierMetric.findAll(findQuery);
        return scansResultsetToApi(result, groupByPresent);
    } catch (error) {
        logger.error(`Error query Operation: ${error}`, txID);
        const err = { statusCode: 500, message: `Error querying metrics: ${error.message}` };
        throw err;
    }
};
