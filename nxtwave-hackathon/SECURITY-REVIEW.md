# Security Review Summary

## Findings

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🔴 CRITICAL | - | - | No critical vulnerability was identified in the reviewed scope | 9/10 |
| 2 | 🟠 HIGH | backend/app/main.py | 799-806 | Default administrator account and automatic role elevation | 9/10 |
| 3 | 🟠 HIGH | backend/app/main.py | 1253-1258 | Anonymous application enumeration exposed applicant PII | 9/10 |
| 4 | 🟡 MEDIUM | docker-compose.yml | 36-47 | Application traffic was directly exposed over plaintext HTTP | 9/10 |
| 5 | 🟡 MEDIUM | backend/app/main.py | 1104-1113, 1156-1163 | Source and webhook operational status was unauthenticated | 8/10 |

## Remediation

- Production registration no longer grants administrator access unless `ENVIRONMENT=production` and `SEVASETU_ADMIN_EMAIL` explicitly matches.
- Application listing and retrieval now require authentication and owner or administrator authorization.
- Source status and webhook status now require administrator authorization.
- Docker Compose publishes frontend and backend internally, with Caddy as an HTTPS-ready reverse proxy.
- Frontend API calls use same-origin paths by default.
- JWT access tokens now expire after 15 minutes.
- Refresh-token sessions and TOTP MFA setup and verification endpoints were added.
- Revoked refresh sessions are stored and rejected.
- Documents are type-validated, size-limited, encrypted at rest, and restricted to their owner or an administrator.
- Optional ClamAV scanning is available through `CLAMSCAN_ENABLED=true`.
- Webhook events use HMAC-SHA256 signatures and delivery deduplication.
- PostgreSQL, webhook, refresh-session, TOTP, source-update, audit, application, profile, and document schemas are initialized.
- Backup and restore scripts are available under `scripts/`.

## Residual external boundaries

- Real MFA depends on enrollment with an authenticator application.
- TLS certificates require Caddy internet/DNS access or local certificate configuration.
- PostgreSQL must be started and backed up by deployment operations.
- Real malware scanning requires ClamAV and the `CLAMSCAN_ENABLED=true` setting.
- Government submission requires authorized portal credentials and accredited integration contracts.
- Official scheme updates require human verification and permitted source access.
