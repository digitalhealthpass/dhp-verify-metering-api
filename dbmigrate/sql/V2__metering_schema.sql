
-- Add support for spec e.g. SHC, DCC, GHP, IDHP 
ALTER TABLE "hpass_metric"."verifier_metric" 
    ADD COLUMN "credentialSpec" VARCHAR(64);
