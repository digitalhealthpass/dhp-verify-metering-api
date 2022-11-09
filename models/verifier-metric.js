/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const { DataTypes } = require('sequelize');
const dbmodels = require('./dbmodels');

// eslint-disable-next-line max-lines-per-function
const init = (sequelize) => {

    const VerifierMetric = sequelize.define('VerifierMetric', {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        customerId: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        orgId: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        verDID: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        datetime: {
            type: DataTypes.DATE,
        },
        scanCount: {
            type: DataTypes.INTEGER,
        },
        credentialType: {
            type: DataTypes.STRING(64),
        },
        scanResult: {
            type: DataTypes.STRING(64),
        },
        issuerDID: {
            type: DataTypes.STRING(255),
        },
        issuerName: {
            type: DataTypes.STRING(64),
        },
        credentialSpec: {
            type: DataTypes.STRING(64),
        }
    }, {
        indexes: [
            {
                name: 'metric_count_by_date_primary_filters',
                fields: ['datetime', 'customerId', 'orgId', 'verDID', 'scanCount']
            }
        ],
        schema: dbmodels.metricdbSchemaName,
        tableName: 'verifier_metric',
        timestamps: false
    });


    const models = { VerifierMetric };
    return models;
}


module.exports = {
    init,
}