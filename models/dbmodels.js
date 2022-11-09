/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */
const Sequelize = require('sequelize');

const Logger = require('../config/logger');
const appConfig = require('../config');
const verifierMetric = require('./verifier-metric');

const dbUser = process.env.POSTGRES_USER; // todo validate Config
const dbPassword = process.env.POSTGRES_USERPWD;
const dbName = process.env.POSTGRES_DB_NAME;
const dbHost = process.env.POSTGRES_HOST;
const dbPort = process.env.POSTGRES_PORT;
const sslmode = process.env.POSTGRES_SSLMODE;


const logger = new Logger('dbmodels');
let sequelizeConnection;
let initialized = false;
let DB = {};


exports.metricdbSchemaName = 'hpass_metric';

// Initialize with sequelize connected to the DB
exports.init = async (recreateDB, sequelize) => {
    if (initialized)
        return;

    if (sequelize) {
        sequelizeConnection = sequelize;
    } else if (!sequelizeConnection) { // Default postgres init
        const connectParams = {
            host: dbHost,
            port: dbPort,
            dialect: 'postgres',
            // operatorsAliases: false,
            logging: (msg) => logger.debug(msg, ''),
            logQueryParameters: true,
            pool: {
                max: appConfig.postgres.connectionPool.max,
                min: appConfig.postgres.connectionPool.min,
                acquire: appConfig.postgres.connectionPool.acquire,
                idle: appConfig.postgres.connectionPool.idle
            }
        }

        if (sslmode) {

            const caCert = process.env.POSTGRES_CACERT;
            if (!caCert)
                throw new Error(`Postgres TLS caCert not found in env var POSTGRES_CACERT`);

            const dialectOptions = {
                sslmode,
                connectTimeout: appConfig.postgres.connectTimeout,
                requestTimeout: appConfig.postgres.requestTimeout,
                // TLS params
                ssl: {
                    rejectUnauthorized: true,
                    ca: caCert
                }
            }


            connectParams.dialectOptions = dialectOptions;
        }

        sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, connectParams);
        logger.info(`Using Sequelize: host:${dbHost} dbname:${dbName} ssl:${sslmode}`);
    }

    const verMetricModels = verifierMetric.init(sequelizeConnection);

    await sequelizeConnection.authenticate();
    logger.info(`Success connecting to DB:${dbName}`);

    // force: true will drop the table if it already exists
    // WARN: Destructive recreates DB
    if (recreateDB) {
        sequelizeConnection.createSchema(this.metricdbSchemaName);
        await sequelizeConnection.sync({ force: true });
        logger.info(`Done sync of DB ${dbName}: Drop and Recreate with { force: true }`);
        // alter: true
    }
    else {
        sequelizeConnection.createSchema(this.metricdbSchemaName);
        // creates the table if it doesn't exist (and does nothing if it already exists)
        await sequelizeConnection.sync();
        logger.info(`Finished init DB ${dbName} with ddl`);
    }

    DB = { ...verMetricModels };
    DB.sequelize = sequelizeConnection;
    initialized = true;
    exports.DB = DB;
}