--- db init for Metrics db ---
CREATE DATABASE metricsdb;
CREATE SCHEMA IF NOT EXISTS hpass_metric;

------ Create DDL
CREATE TABLE IF NOT EXISTS "hpass_metric"."verifier_metric" ("id"  BIGSERIAL , "customerId" VARCHAR(64) NOT NULL, "orgId" VARCHAR(64) NOT NULL, "verDID" VARCHAR(255) NOT NULL, "datetime" TIMESTAMP WITH TIME ZONE, "scanCount" INTEGER, "credentialType" VARCHAR(64), "scanResult" VARCHAR(64), "issuerDID" VARCHAR(255), "issuerName" VARCHAR(64), PRIMARY KEY ("id"));