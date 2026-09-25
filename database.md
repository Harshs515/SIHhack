## Database inventory

I inspected the available schemas and their table definitions. The inventory contains **54 tables** across `public`, `auth`, `storage`, `realtime`, and `vault`. The schemas `pgbouncer`, `extensions`, `graphql_public`, and `graphql` had no tables in the inventory.

Below, each table’s columns are listed with their database types. This is a structural inventory; it does not include row contents.

## `public` — 8 tables

These are the project’s application tables, plus PostGIS’s spatial reference catalog.

- **`public.complaints`** — `id bigint` (PK); `complaint_id text`; `complaint_date timestamp with time zone`; `crime_category text`; `sub_category text`; `state text`; `district text`; `city text`; `latitude double precision`; `longitude double precision`; `amount numeric`; `complainant_type text`; `status text`; `source text`; `raw_reference text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`.
- **`public.predictions`** — `id bigint` (PK); `prediction_time timestamp with time zone`; `latitude double precision`; `longitude double precision`; `state text`; `district text`; `city text`; `risk_score double precision`; `risk_level text`; `confidence double precision`; `predicted_amount numeric`; `crime_category text`; `cluster_id integer`; `nearby_atm_count integer`; `complaint_count integer`; `transaction_count integer`; `model_name text`; `model_version text`; `feature_snapshot jsonb`; `status text`; `created_at timestamp with time zone`.
- **`public.spatial_ref_sys`** — `srid integer` (PK); `auth_name character varying`; `auth_srid integer`; `srtext character varying`; `proj4text character varying`.
- **`public.police_stations`** — `id bigint` (PK); `name text`; `station_code text`; `city text`; `district text`; `state text`; `jurisdiction text`; `contact_number text`; `geom geography`; `created_at timestamp with time zone`.
- **`public.atm_locations`** — `id bigint` (PK); `atm_id text`; `bank_name text`; `address text`; `city text`; `district text`; `state text`; `pincode text`; `risk_tier text`; `geom geography`; `created_at timestamp with time zone`.
- **`public.cybercrime_complaints`** — `id bigint` (PK); `acknowledgement_no text`; `fraud_category text`; `fraud_amount numeric`; `victim_name text`; `victim_phone text`; `victim_email text`; `victim_bank text`; `victim_account_no text`; `mule_bank_name text`; `mule_account_no text`; `incident_timestamp timestamp with time zone`; `filing_timestamp timestamp with time zone`; `state text`; `district text`; `city text`; `pincode text`; `geom geography`; `status text`; `ncrp_portal_source boolean`; `created_at timestamp with time zone`; `transaction_id text`; `transaction_date date`; `transaction_time text`; `amount_lost numeric`; `lost_money boolean`; `description text`; `sub_category text`; `suspect_transaction_id text`; `suspect_transaction_date date`; `suspect_transaction_time text`; `suspect_amount numeric`; `has_suspect_details boolean`; `incident_platforms jsonb`; `portal_source text`; `email_sent boolean`; `email_sent_at timestamp with time zone`; `victim_address text`.
- **`public.model_runs`** — `id bigint` (PK); `model_version text`; `algorithm text`; `training_date timestamp with time zone`; `accuracy numeric`; `precision numeric`; `recall numeric`; `f1_score numeric`; `xgb_accuracy numeric`; `xgb_precision numeric`; `xgb_recall numeric`; `xgb_f1 numeric`; `dbscan_clusters integer`; `gnn_enabled boolean`; `notes text`; `created_at timestamp with time zone`.
- **`public.predicted_hotspots`** — `id bigint` (PK); `model_run_id bigint`; `complaint_id bigint`; `cluster_id integer`; `center_geom geography`; `lat numeric`; `lng numeric`; `radius_meters numeric`; `risk_score numeric`; `alert_level text`; `top_fraud_category text`; `total_complaints_in_cluster integer`; `total_fraud_volume numeric`; `predicted_window_start timestamp with time zone`; `predicted_window_end timestamp with time zone`; `atm_location_id bigint`; `assigned_police_station_id bigint`; `district text`; `state text`; `actionable_intelligence text`; `shap_top_features jsonb`; `ml_raw_output jsonb`; `status text`; `acknowledged_by text`; `acknowledged_at timestamp with time zone`; `created_at timestamp with time zone`; `prediction_source text`; `session_id text`; `session_status text`; `session_expires_at timestamp with time zone`; `destination_bank_code text`; `last_session_activity_minutes integer`.

### Public-table relationships and defaults

`predicted_hotspots` references `model_runs`, `cybercrime_complaints`, `atm_locations`, and `police_stations`. Its columns include `model_run_id`, `complaint_id`, `atm_location_id`, and `assigned_police_station_id`, respectively.

Notable defaults include generated sequence IDs on the bigint-ID tables; `complaints.status = 'OPEN'`; `predictions.risk_score = 0`, `risk_level = 'LOW'`, and `status = 'ACTIVE'`; `atm_locations.risk_tier = 'LOW'`; and `predicted_hotspots.radius_meters = 2000`, with status/default JSON values also defined.

## `auth` — 27 tables

- **`auth.users`** — `instance_id uuid`; `id uuid` (PK); `aud character varying`; `role character varying`; `email character varying`; `encrypted_password character varying`; `email_confirmed_at timestamp with time zone`; `invited_at timestamp with time zone`; `confirmation_token character varying`; `confirmation_sent_at timestamp with time zone`; `recovery_token character varying`; `recovery_sent_at timestamp with time zone`; `email_change_token_new character varying`; `email_change character varying`; `email_change_sent_at timestamp with time zone`; `last_sign_in_at timestamp with time zone`; `raw_app_meta_data jsonb`; `raw_user_meta_data jsonb`; `is_super_admin boolean`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `phone text`; `phone_confirmed_at timestamp with time zone`; `phone_change text`; `phone_change_token character varying`; `phone_change_sent_at timestamp with time zone`; `confirmed_at timestamp with time zone`; `email_change_token_current character varying`; `email_change_confirm_status smallint`; `banned_until timestamp with time zone`; `reauthentication_token character varying`; `reauthentication_sent_at timestamp with time zone`; `is_sso_user boolean`; `deleted_at timestamp with time zone`; `is_anonymous boolean`.
- **`auth.refresh_tokens`** — `instance_id uuid`; `id bigint` (PK); `token character varying`; `user_id character varying`; `revoked boolean`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `parent character varying`; `session_id uuid`.
- **`auth.instances`** — `id uuid` (PK); `uuid uuid`; `raw_base_config text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`.
- **`auth.audit_log_entries`** — `instance_id uuid`; `id uuid` (PK); `payload json`; `created_at timestamp with time zone`; `ip_address character varying`.
- **`auth.schema_migrations`** — `version character varying` (PK).
- **`auth.identities`** — `provider_id text`; `user_id uuid`; `identity_data jsonb`; `provider text`; `last_sign_in_at timestamp with time zone`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `email text`; `id uuid` (PK).
- **`auth.sessions`** — `id uuid` (PK); `user_id uuid`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `factor_id uuid`; `aal aal_level`; `not_after timestamp with time zone`; `refreshed_at timestamp without time zone`; `user_agent text`; `ip inet`; `tag text`; `oauth_client_id uuid`; `refresh_token_hmac_key text`; `refresh_token_counter bigint`; `scopes text`.
- **`auth.mfa_factors`** — `id uuid` (PK); `user_id uuid`; `friendly_name text`; `factor_type factor_type`; `status factor_status`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `secret text`; `phone text`; `last_challenged_at timestamp with time zone`; `web_authn_credential jsonb`; `web_authn_aaguid uuid`; `last_webauthn_challenge_data jsonb`.
- **`auth.mfa_challenges`** — `id uuid` (PK); `factor_id uuid`; `created_at timestamp with time zone`; `verified_at timestamp with time zone`; `ip_address inet`; `otp_code text`; `web_authn_session_data jsonb`.
- **`auth.mfa_amr_claims`** — `session_id uuid`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `authentication_method text`; `id uuid` (PK).
- **`auth.sso_providers`** — `id uuid` (PK); `resource_id text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `disabled boolean`.
- **`auth.sso_domains`** — `id uuid` (PK); `sso_provider_id uuid`; `domain text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`.
- **`auth.saml_providers`** — `id uuid` (PK); `sso_provider_id uuid`; `entity_id text`; `metadata_xml text`; `metadata_url text`; `attribute_mapping jsonb`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `name_id_format text`.
- **`auth.saml_relay_states`** — `id uuid` (PK); `sso_provider_id uuid`; `request_id text`; `for_email text`; `redirect_to text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `flow_state_id uuid`.
- **`auth.flow_state`** — `id uuid` (PK); `user_id uuid`; `auth_code text`; `code_challenge_method code_challenge_method`; `code_challenge text`; `provider_type text`; `provider_access_token text`; `provider_refresh_token text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `authentication_method text`; `auth_code_issued_at timestamp with time zone`; `invite_token text`; `referrer text`; `oauth_client_state_id uuid`; `linking_target_id uuid`; `email_optional boolean`.
- **`auth.one_time_tokens`** — `id uuid` (PK); `user_id uuid`; `token_type one_time_token_type`; `token_hash text`; `relates_to text`; `created_at timestamp without time zone`; `updated_at timestamp without time zone`; `expires_at timestamp with time zone`.
- **`auth.oauth_clients`** — `id uuid` (PK); `client_secret_hash text`; `registration_type oauth_registration_type`; `redirect_uris text`; `grant_types text`; `client_name text`; `client_uri text`; `logo_uri text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `deleted_at timestamp with time zone`; `client_type oauth_client_type`; `token_endpoint_auth_method text`.
- **`auth.oauth_authorizations`** — `id uuid` (PK); `authorization_id text`; `client_id uuid`; `user_id uuid`; `redirect_uri text`; `scope text`; `state text`; `resource text`; `code_challenge text`; `code_challenge_method code_challenge_method`; `response_type oauth_response_type`; `status oauth_authorization_status`; `authorization_code text`; `created_at timestamp with time zone`; `expires_at timestamp with time zone`; `approved_at timestamp with time zone`; `nonce text`.
- **`auth.oauth_consents`** — `id uuid` (PK); `user_id uuid`; `client_id uuid`; `scopes text`; `granted_at timestamp with time zone`; `revoked_at timestamp with time zone`.
- **`auth.oauth_client_states`** — `id uuid` (PK); `provider_type text`; `code_verifier text`; `created_at timestamp with time zone`.
- **`auth.custom_oauth_providers`** — `id uuid` (PK); `provider_type text`; `identifier text`; `name text`; `client_id text`; `client_secret text`; `acceptable_client_ids text[]`; `scopes text[]`; `pkce_enabled boolean`; `attribute_mapping jsonb`; `authorization_params jsonb`; `enabled boolean`; `email_optional boolean`; `issuer text`; `discovery_url text`; `skip_nonce_check boolean`; `cached_discovery jsonb`; `discovery_cached_at timestamp with time zone`; `authorization_url text`; `token_url text`; `userinfo_url text`; `jwks_uri text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `custom_claims_allowlist text[]`.
- **`auth.webauthn_credentials`** — `id uuid` (PK); `user_id uuid`; `credential_id bytea`; `public_key bytea`; `attestation_type text`; `aaguid uuid`; `sign_count bigint`; `transports jsonb`; `backup_eligible boolean`; `backed_up boolean`; `friendly_name text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `last_used_at timestamp with time zone`.
- **`auth.webauthn_challenges`** — `id uuid` (PK); `user_id uuid`; `challenge_type text`; `session_data jsonb`; `created_at timestamp with time zone`; `expires_at timestamp with time zone`.
- **`auth.scim_users`** — `id uuid` (PK); `sso_provider_id uuid`; `user_id uuid`; `resource jsonb`; `user_name text`; `external_id text`; `active boolean`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `deleted_at timestamp with time zone`.
- **`auth.scim_tokens`** — `id uuid` (PK); `sso_provider_id uuid`; `token_hash text`; `prefix text`; `created_at timestamp with time zone`; `expires_at timestamp with time zone`; `revoked_at timestamp with time zone`; `last_used_at timestamp with time zone`.
- **`auth.mfa_recovery_code_sets`** — `id uuid` (PK); `user_id uuid`; `mfa_factor_id uuid`; `failed_verification_count integer`; `verification_locked_until timestamp with time zone`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`.
- **`auth.mfa_recovery_codes`** — `id uuid` (PK); `mfa_recovery_code_set_id uuid`; `code_hash text`; `consumed_at timestamp with time zone`; `created_at timestamp with time zone`.

Auth tables have foreign-key relationships connecting users, sessions, MFA factors, SSO providers, OAuth clients, and related records. Several columns are generated from JSON fields, including `identities.email` and fields in `scim_users`.

## `storage` — 8 tables

- **`storage.migrations`** — `id integer` (PK); `name character varying`; `hash character varying`; `executed_at timestamp without time zone`.
- **`storage.buckets`** — `id text` (PK); `name text`; `owner uuid`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `public boolean`; `avif_autodetection boolean`; `file_size_limit bigint`; `allowed_mime_types text[]`; `owner_id text`; `type buckettype`; `versioning_status text`; `lifecycle_configuration jsonb`; `lifecycle_configuration_generation uuid`.
- **`storage.objects`** — `id uuid` (PK); `bucket_id text`; `name text`; `owner uuid`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `last_accessed_at timestamp with time zone`; `metadata jsonb`; `path_tokens text[]`; `version text`; `owner_id text`; `user_metadata jsonb`; `archived_at timestamp with time zone`; `is_delete_marker boolean`; `is_versioned boolean`.
- **`storage.s3_multipart_uploads`** — `id text` (PK); `in_progress_size bigint`; `upload_signature text`; `bucket_id text`; `key text`; `version text`; `owner_id text`; `created_at timestamp with time zone`; `user_metadata jsonb`; `metadata jsonb`.
- **`storage.s3_multipart_uploads_parts`** — `id uuid` (PK); `upload_id text`; `size bigint`; `part_number integer`; `bucket_id text`; `key text`; `etag text`; `owner_id text`; `version text`; `created_at timestamp with time zone`.
- **`storage.buckets_analytics`** — `name text`; `type buckettype`; `format text`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`; `id uuid` (PK); `deleted_at timestamp with time zone`.
- **`storage.buckets_vectors`** — `id text` (PK); `type buckettype`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`.
- **`storage.vector_indexes`** — `id text` (PK); `name text`; `bucket_id text`; `data_type text`; `dimension integer`; `distance_metric text`; `metadata_configuration jsonb`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`.

## `realtime` — 10 tables

- **`realtime.messages`** — `topic text`; `extension text`; `payload jsonb`; `event text`; `private boolean`; `updated_at timestamp without time zone`; `inserted_at timestamp without time zone`; `id uuid`; `binary_payload bytea`; `skip_broadcast boolean`. Composite PK: `(inserted_at, id)`.
- **`realtime.messages_2026_09_21`**, **`realtime.messages_2026_09_22`**, **`realtime.messages_2026_09_23`**, **`realtime.messages_2026_09_24`**, **`realtime.messages_2026_09_25`**, **`realtime.messages_2026_09_26`**, **`realtime.messages_2026_09_27`** — each has the same columns and types as `realtime.messages`; composite PK: `(inserted_at, id)`.
- **`realtime.schema_migrations`** — `version bigint` (PK); `inserted_at timestamp without time zone`.
- **`realtime.subscription`** — `id bigint` (PK); `subscription_id uuid`; `entity regclass`; `filters user_defined_filter[]`; `claims jsonb`; `claims_role regrole`; `created_at timestamp without time zone`; `action_filter text`; `selected_columns text[]`.

## `vault` — 1 table

- **`vault.secrets`** — `id uuid` (PK); `name text`; `description text`; `secret text`; `key_id uuid`; `nonce bytea`; `created_at timestamp with time zone`; `updated_at timestamp with time zone`.

## Security note

**`public.spatial_ref_sys` has Row Level Security disabled.** The schema inventory flagged this as exposed to Supabase client roles unless other access controls prevent it. No policy changes were made. Enabling RLS without adding appropriate policies may block access:

```sql
ALTER TABLE "public"."spatial_ref_sys" ENABLE ROW LEVEL SECURITY;
```

RLS is also disabled on some Supabase-managed `auth` and `realtime` tables, as well as `vault.secrets`; those are system-managed schemas and should not be altered without understanding the effect on Supabase services.

This inventory reports tables and columns; it does not include views, routines, triggers, indexes, grants, or every column’s nullability and constraint/default expression.