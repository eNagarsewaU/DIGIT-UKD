ALTER TABLE eg_wf_processinstance_v2 ALTER COLUMN comment type character varying(1024);
CREATE INDEX IF NOT EXISTS idx_tenant_status_eg_wf_processinstance_v2 ON eg_wf_processinstance_v2 USING btree ((tenantid || ':' || status));
