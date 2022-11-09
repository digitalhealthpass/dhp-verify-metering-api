/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */
// eslint-disable-next-line node/no-unpublished-require
const chai = require('chai');
const Sequelize = require('sequelize');

const { expect, assert } = chai;

const testDBModels = require('../../../models/dbmodels');

const sequelize = new Sequelize('sqlite::memory:');
const myDAO = require('../../../data-access/metrics');

const txID = "testTxID";

/* eslint-disable max-lines-per-function */

describe('test-upload-verifier-metric', () => {

    before(async () => {
        await testDBModels.init(true, sequelize);

    });

    // eslint-disable-next-line max-lines-per-function
    describe('VerifierMetric data', () => {

        const seedAggregatedMetricData = () => {
            const metrics = [
                {
                    datetime: "2021-02-07T13:00:00Z",
                    issuerName: "ABC Inc",
                    issuerDID: "did:hpass:789#vc-01",
                    scanResult: "Verified", // Verified , Unverified
                    credentialType: "vaccination",
                    credentialSpec: "IDHP",
                    total: 10
                },
                {
                    datetime: "2021-02-07T13:00:00Z",
                    issuerName: "ABC Inc",
                    issuerDID: "did:hpass:789#vc-01",
                    scanResult: "Unverified",
                    credentialType: "vaccination",
                    credentialSpec: "SHC",
                    total: 2
                },
                {
                    datetime: "2021-02-07T14:00:00Z",
                    issuerName: "ABC Inc",
                    issuerDID: "did:hpass:789#vc-01",
                    scanResult: "Verified",
                    credentialType: "vaccination",
                    credentialSpec: "SHC",
                    total: 50
                },
            ]
            return metrics;
        }

        describe('addMetric data', () => {
            beforeEach(async () => {
                const forceSync = true; // clean db
                await testDBModels.DB.sequelize.sync({ force: forceSync });
            });

            it('should pass with expected values', async () => {
                const metricList = seedAggregatedMetricData();
                const customerId = "cust001";
                const orgId = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);

            });

            it('should fail with required values empty: metric count', async () => {
                const metricList = seedAggregatedMetricData();
                const customerId = "cust001";
                const orgId = "org001";
                const verDID = "did:hpass:ver100#vc-01";
                try {
                    metricList[1].total = -2;
                    await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                    assert.fail('expected exception : missing required attribute');
                } catch (err) { // expected
                    expect(err.message).to.contain('Missing');
                }

                try {
                    delete metricList[1].total;
                    await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                    assert.fail('expected exception : missing required attribute');
                } catch (err) { // expected
                    expect(err.message).to.contain('Missing');
                }

            });

            it('should fail with required values empty: primary field', async () => {
                const metricList = seedAggregatedMetricData();
                const customerId = "cust001";
                const orgId = "";
                const verDID = "did:hpass:ver100#vc-01";
                try {
                    await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                    assert.fail('expected exception : missing required attribute');
                } catch (err) { // expected
                    expect(err.message).to.contain('Missing');
                }

            });

            it('should fail with required values empty: datetime field', async () => {
                const metricList = seedAggregatedMetricData();
                const customerId = "cust001";
                const orgId = "org001";
                const verDID = "did:hpass:ver100#vc-01";
                try {
                    metricList[0].datetime = '';
                    await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                    assert.fail('expected exception : missing required attribute');
                } catch (err) { // expected
                    expect(err.message).to.contain('Missing');
                }
            });
        });

        describe('queryVMetric data', () => {
            beforeEach(async () => {
                const forceSync = true; // clean db
                await testDBModels.DB.sequelize.sync({ force: forceSync });
            });
            const seedMetricDataForQuery = () => {
                const metrics = [
                    {
                        datetime: "2021-02-07T13:00:00Z",
                        issuerName: "ABC Inc",
                        issuerDID: "did:hpass:789#vc-01",
                        scanResult: "Verified",
                        credentialSpec: "IDHP",
                        credentialType: "vaccination",
                        total: 10
                    },
                    {
                        datetime: "2021-02-07T13:00:00Z",
                        issuerName: "ABC Inc",
                        issuerDID: "did:hpass:789#vc-01",
                        scanResult: "Unverified",
                        credentialSpec: "IDHP",
                        credentialType: "vaccination",
                        total: 2
                    },
                    {
                        datetime: "2021-02-10T14:00:00Z",
                        issuerName: "ABC Inc",
                        issuerDID: "did:hpass:789#vc-01",
                        scanResult: "Verified",
                        credentialSpec: "IDHP",
                        credentialType: "vaccination",
                        total: 50
                    },
                    {
                        datetime: "2021-02-10T17:00:00Z",
                        issuerName: "ABC Inc",
                        issuerDID: "did:hpass:789#vc-01",
                        scanResult: "Unverified",
                        credentialSpec: "IDHP",
                        credentialType: "vaccination",
                        total: 7
                    },
                ]
                return metrics;
            }

            const org2MetricDataForQuery = () => {
                const metrics = [
                    {
                        datetime: "2021-02-07T09:00:00Z",
                        issuerName: "DEF Inc",
                        issuerDID: "did:hpass:789#vc-01",
                        scanResult: "Verified",
                        credentialSpec: "SHC",
                        credentialType: "vaccination",
                        total: 7
                    },
                    {
                        datetime: "2021-02-07T18:00:00Z",
                        issuerName: "DEF Inc",
                        issuerDID: "did:hpass:789#vc-01",
                        scanResult: "Unverified",
                        credentialSpec: "SHC",
                        credentialType: "vaccination",
                        total: 3
                    },
                ]
                return metrics;
            }

            it('should return query result with date range ', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-08T00:00:00Z",
                        orgId
                    }
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(12);
                // console.log(`qresult ${qresult.length}\n ${JSON.stringify(qresult)}`);
            });

            it('should return query result with selector params', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-08T00:00:00Z",
                        customerId,
                        orgId,
                    },
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(12);
            });

            it('should return zero result for non-existent data', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-08T00:00:00Z",
                        customerId: "newcustomerId",
                        orgId,
                    },
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(0);
            });


            it('should return query result with two org counts', async () => {

                const customerId = "cust001";
                const org1 = "org001";
                const org2 = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                const metrics1 = seedMetricDataForQuery();
                await myDAO.addVMetrics(txID, customerId, org1, verDID, metrics1);
                const metrics2 = org2MetricDataForQuery();
                await myDAO.addVMetrics(txID, customerId, org2, verDID, metrics2);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-08T00:00:00Z",
                        customerId,
                    },
                }
                // query both orgs
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(22);
            });

            it('should return groupBy results: groupby scanresult', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const org2 = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                const metrics2 = org2MetricDataForQuery();
                await myDAO.addVMetrics(txID, customerId, org2, verDID, metrics2);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-11T00:00:00Z",
                        customerId,
                        orgId,
                    },
                    groupBy: {
                        scanResult: true
                    }
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(79);
                expect(resultObj.groupBy.length).to.equal(2);

                resultObj.groupBy.forEach(element => {
                    if (element.scanResult !== "Verified") {
                        expect(element.count).to.equal(12);
                    }

                    if (element.scanResult === "Verified") {
                        expect(element.count).to.equal(67);
                    }
                });
            });

            it('should return groupBy results: groupby scanresult issuerName', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const org2 = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                const metrics2 = org2MetricDataForQuery();
                await myDAO.addVMetrics(txID, customerId, org2, verDID, metrics2);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-11T00:00:00Z",
                        customerId,
                        orgId,
                    },
                    groupBy: {
                        scanResult: true,
                        issuerName: true
                    }
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(79);
                expect(resultObj.groupBy.length).to.equal(4);
                // eslint-disable-next-line complexity
                resultObj.groupBy.forEach(element => {
                    if (element.scanResult !== "Verified" && element.issuerName === "ABC Inc") {
                        expect(element.count).to.equal(9);
                    }
                    if (element.scanResult !== "Verified" && element.issuerName === "DEF Inc") {
                        expect(element.count).to.equal(3);
                    }

                    if (element.scanResult === "Verified" && element.issuerName === "ABC Inc") {
                        expect(element.count).to.equal(60);
                        assert(!element.credentialSpec);
                    }
                    if (element.scanResult === "Verified" && element.issuerName === "DEF Inc") {
                        expect(element.count).to.equal(7);
                        assert(!element.credentialSpec);
                    }
                });
            });


            it('should return groupBy results: groupby scanresult issuerName credentialSpec', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const org2 = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                const metrics2 = org2MetricDataForQuery();
                await myDAO.addVMetrics(txID, customerId, org2, verDID, metrics2);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-11T00:00:00Z",
                        customerId,
                        orgId,
                    },
                    groupBy: {
                        scanResult: true,
                        issuerName: true,
                        credentialSpec: true
                    }
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(79);
                expect(resultObj.groupBy.length).to.equal(4);
                // eslint-disable-next-line complexity
                resultObj.groupBy.forEach(element => {
                    if (element.scanResult !== "Verified" && element.issuerName === "ABC Inc") {
                        expect(element.count).to.equal(9);
                        expect(element.credentialSpec).to.equal("IDHP");
                    }
                    if (element.scanResult !== "Verified" && element.issuerName === "DEF Inc") {
                        expect(element.count).to.equal(3);
                        expect(element.credentialSpec).to.equal("SHC");
                    }

                    if (element.scanResult === "Verified" && element.issuerName === "ABC Inc") {
                        expect(element.count).to.equal(60);
                        expect(element.credentialSpec).to.equal("IDHP");
                    }
                    if (element.scanResult === "Verified" && element.issuerName === "DEF Inc") {
                        expect(element.count).to.equal(7);
                        expect(element.credentialSpec).to.equal("SHC");
                    }
                });
            });

            it('should return groupby results with single bucket', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const org2 = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                const metrics2 = org2MetricDataForQuery();
                await myDAO.addVMetrics(txID, customerId, org2, verDID, metrics2);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-11T00:00:00Z",
                        customerId,
                        orgId,
                    },
                    groupBy: {
                        credentialSpec: true
                    }
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(79);
                expect(resultObj.groupBy.length).to.equal(2);

                expect(resultObj.groupBy[0].count + resultObj.groupBy[1].count).to.equal(79);
                expect(resultObj.groupBy[0].credentialSpec).to.equal("IDHP");
                expect(resultObj.groupBy[1].credentialSpec).to.equal("SHC");
            });

            it('should return groupby results with credentialType', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const org2 = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                const metrics2 = org2MetricDataForQuery();
                await myDAO.addVMetrics(txID, customerId, org2, verDID, metrics2);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-11T00:00:00Z",
                        customerId,
                        orgId,
                    },
                    groupBy: {
                        credentialType: true
                    }
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(79);
                expect(resultObj.groupBy.length).to.equal(1);

                expect(resultObj.groupBy[0].count).to.equal(79);
                expect(resultObj.groupBy[0].credentialType).to.equal("vaccination");
            });


            it('no error with empty groupby', async () => {
                const metricList = seedMetricDataForQuery();
                const customerId = "cust001";
                const orgId = "org001";
                const org2 = "org001";
                const verDID = "did:hpass:ver100#vc-01";

                await myDAO.addVMetrics(txID, customerId, orgId, verDID, metricList);
                const metrics2 = org2MetricDataForQuery();
                await myDAO.addVMetrics(txID, customerId, org2, verDID, metrics2);

                const metricQuery = {
                    selectors: {
                        startDate: "2021-02-01T00:00:00Z",
                        endDate: "2021-02-11T00:00:00Z",
                        customerId,
                        orgId,
                    },
                    groupBy: {
                    }
                }
                const qresult = await myDAO.queryVMetricsCounts(txID, metricQuery);
                expect(qresult).to.have.property('result');
                expect(qresult.result).to.have.property('totalCount');
                const resultObj = qresult.result;
                expect(resultObj.totalCount).to.equal(79);
                assert(!resultObj.groupBy);
            });

        });
    });
});