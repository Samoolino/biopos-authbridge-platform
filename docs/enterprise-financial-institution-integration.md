# Enterprise Financial-Institution Integration Blueprint

**Status:** Architecture baseline / implementation contract  
**Target operating model:** BioPOS is an authentication, consent-evidence and payment-orchestration layer integrated into an already licensed financial institution's existing accounts, payment rails, acquiring stack and settlement operations. BioPOS is not the issuer, acquirer, switch, custodian or settlement institution unless separately licensed and contracted for those roles.

## 1. Product boundary and trust model

BioPOS MUST NOT create or represent money movement on the strength of a biometric match alone.

The financial institution remains authoritative for:
- customer/account ownership and account status;
- available balance and holds;
- transaction limits, risk decisions and payment authorization;
- posting, clearing, settlement and reversal;
- regulated KYC/AML decisions and regulatory reporting.

BioPOS supplies:
- device-bound customer authentication evidence;
- transaction-specific consent and authorization intent;
- merchant/terminal identity and transaction context;
- policy evaluation inputs and risk signals;
- idempotent requests to institution-owned payment interfaces;
- immutable evidence and reconciliation references.

No component may claim `SETTLED` from a biometric event, a client callback, an HTTP 200 response, or an authorization approval. Settlement requires authoritative evidence from the institution's settlement interface or an independently reconciled settlement record.

## 2. Bounded-context architecture

Use a modular monolith first, with strict module boundaries and ports/adapters. Extract services only when scale, isolation, regulatory boundary or independent deployment justifies it.

| Context | Responsibility | Must not own |
|---|---|---|
| Identity assurance | Customer reference, KYC-provider results, assurance level and review state | Raw biometric template store |
| Biometric assurance | Verify signed device assertions, credential lifecycle, challenge and replay controls | Bank account balance or payment approval |
| Merchant & terminal registry | Merchant, outlet, terminal, device binding, location and status | Merchant settlement account authority |
| Consent & transaction intent | Amount, currency, merchant, order reference, expiry, customer approval evidence | Financial posting |
| Policy & risk | Limits, step-up rules, velocity signals, risk decisions and reason codes | Override of issuer decision |
| Payment orchestration | Provider-neutral authorization/capture/refund/reversal commands | Direct ledger mutation |
| Provider adapters | Translate canonical commands to institution-approved APIs | Business policy decisions |
| Settlement & reconciliation | Consume authoritative settlement events/files, match records, manage exceptions | Fabricated settlement confirmation |
| Audit & regulatory evidence | Append-only event evidence, access history, retention metadata | Mutable operational state |

## 3. Canonical payment lifecycle

Use an explicit state machine with guarded transitions:

`CREATED -> AUTHENTICATION_PENDING -> AUTHENTICATED -> RISK_REVIEW_PENDING -> AUTHORIZATION_PENDING -> AUTHORIZED -> CAPTURE_PENDING -> CAPTURED -> SETTLEMENT_PENDING -> SETTLED -> RECONCILED`

Terminal or exception states include `DECLINED`, `EXPIRED`, `CANCELLED`, `FAILED`, `REVERSED`, `REFUND_PENDING`, `REFUNDED`, and `MANUAL_REVIEW`.

Rules:
1. Every transition is validated against the previous state and actor permissions.
2. A state transition and its outbox event are committed atomically.
3. Duplicate commands with the same idempotency key return the original result.
4. Reuse of an idempotency key with a different request fingerprint is rejected.
5. Provider timeouts produce an unknown/pending outcome, never an assumed decline or success; reconcile before retrying a non-idempotent operation.
6. Authorization, capture, settlement and reconciliation are distinct facts with distinct timestamps and source references.
7. Reversals and refunds are compensating financial operations, not deletion or mutation of historical events.

## 4. Biometric and device security

Preferred baseline:
- Use platform authenticators and FIDO2/WebAuthn-compatible public-key credentials.
- Biometric matching stays on the user's device where the platform supports it; BioPOS receives a signed assertion, not a fingerprint, face image or iris template.
- Bind each authentication challenge to a server nonce, customer credential, merchant, terminal, amount, currency, order/payment intent, expiry and one-time transaction identifier.
- Verify origin, relying-party ID, challenge, signature, credential status, user-presence/user-verification flags and counter/risk signals as applicable.
- Enforce replay prevention, credential revocation, device replacement/recovery and step-up authentication.
- Do not treat device biometrics as proof of legal identity or KYC completion.
- Do not permit merchant devices to impersonate customer authenticators.
- Any centralized biometric processing requires a separate legal basis, DPIA, security architecture and explicit product approval.

## 5. Institution connector contract

Define a provider-neutral port; each institution adapter implements only capabilities explicitly enabled by that institution.

Required operations:
- `createPaymentIntent`
- `authorizePayment`
- `getPaymentStatus`
- `capturePayment` (only where supported)
- `cancelAuthorization`
- `reversePayment`
- `refundPayment`
- `getSettlementStatus`
- `listSettlementEntries`
- `healthCheck`

Every command carries:
- unique BioPOS transaction ID;
- institution and merchant identifiers;
- idempotency key;
- amount in integer minor units and ISO currency code;
- customer/account token supplied by the institution;
- merchant/terminal/order context;
- transaction-bound authentication evidence reference;
- correlation ID and creation time.

Every response carries:
- provider transaction/reference ID;
- normalized status and provider-native status;
- authorization code where applicable;
- authoritative timestamps;
- reason/error code;
- settlement reference only when supplied by the provider.

Never store or log PAN, CVV, PIN, online banking credentials, access tokens or biometric templates unless a formally approved, scoped design explicitly requires it. Prefer institution-issued opaque customer and funding-instrument tokens.

## 6. API and integration controls

- Version public APIs and publish OpenAPI contracts.
- Validate all request/response payloads at runtime; TypeScript types alone are not validation.
- Authenticate service-to-service calls with mTLS or institution-approved OAuth2 client credentials; use signed requests where required.
- Authorize every operation by tenant, merchant, terminal, customer and role.
- Apply request size limits, rate limits, timeouts, circuit breakers and bounded retries.
- Use idempotency for every financial command.
- Verify webhook signatures, timestamp tolerance, event IDs and replay windows; persist before acknowledging.
- Use an inbox/outbox pattern for reliable event delivery.
- Do not expose provider secrets to mobile or POS clients.
- Use allowlisted egress and institution-approved network paths.

## 7. KYC, AML/CFT/CPF and privacy

BioPOS is a technical processor/integration provider unless its legal role and licence establish otherwise. The regulated institution owns customer due-diligence decisions, ongoing monitoring, suspicious-activity escalation and regulatory filings.

Provide configurable integration points for:
- identity verification and BVN validation through authorized channels;
- customer risk classification and enhanced due diligence;
- sanctions and PEP screening;
- transaction monitoring and case-management systems;
- merchant KYB and beneficial-owner checks;
- consent and privacy notices;
- data-subject requests, retention and deletion workflows;
- DPIA evidence, processor agreements, breach response and cross-border transfer controls.

Persist provider, check type, result, timestamp, policy version, reviewer/decision authority and evidence reference. Do not persist full sensitive screening payloads when a minimized result/reference is sufficient.

## 8. Settlement and reconciliation invariants

- A payment can be `SETTLED` only from an authoritative partner event, statement or settlement API.
- Every settled record must identify institution, settlement batch/reference, amount, currency, value date and source.
- Reconciliation compares BioPOS intent, provider authorization/capture, provider settlement and merchant payable records.
- Differences enter an exception queue; they are never silently auto-corrected.
- Amount and currency must match exactly unless a documented fee/FX rule explains the difference.
- Refunds and reversals link to the original transaction and cannot exceed the remaining refundable amount.
- Use integer minor units; never floating-point arithmetic for money.
- Enforce unique provider references and transaction-level deduplication.

## 9. Security, resilience and operational requirements

- Secrets in a managed secret store; signing/encryption keys in KMS/HSM with rotation and separation of duties.
- Encryption in transit and at rest; field-level protection for sensitive identifiers.
- Append-only, tamper-evident audit events with trusted timestamps.
- Structured logs with correlation IDs and strict PII/secret redaction.
- Metrics and alerts for authorization latency, provider errors, unknown outcomes, webhook lag, settlement breaks, fraud signals and reconciliation ageing.
- Documented RTO/RPO, tested backups, disaster recovery and incident response.
- Threat modelling (STRIDE or equivalent), secure SDLC, dependency/SBOM scanning, SAST, DAST and penetration testing.
- Production rollout through partner sandbox, certification, controlled pilot, canary and monitored general availability.

## 10. Quality gates and release policy

No production release until all applicable gates pass:

| Gate | Minimum evidence |
|---|---|
| Correctness | Unit, integration, contract and end-to-end tests for critical flows |
| Financial safety | State-machine, idempotency, duplicate, timeout, reversal, refund and reconciliation tests |
| Security | Threat model, SAST, dependency audit, secret scan, DAST and independent penetration test |
| API quality | OpenAPI validation, runtime schemas, backward-compatibility checks |
| Reliability | Load, soak, failover, provider-timeout and recovery tests |
| Privacy | Data inventory, lawful-basis mapping, DPIA where required, retention/deletion tests |
| Compliance | Partner responsibility matrix, applicable CBN/NDPC obligations, PCI scope determination and scheme approvals |
| Operations | Dashboards, alert runbooks, on-call ownership, DR test and incident playbooks |
| Governance | Code review, signed release artifacts, SBOM, change approval and rollback plan |

Do not award a numeric “production-ready” score from documentation alone. Record each gate as PASS / FAIL / NOT EVIDENCED, with owner, evidence link, date and exception expiry.

## 11. First implementation vertical slice

Implement one institution sandbox end-to-end before adding multiple providers:

1. Merchant creates a payment intent.
2. Customer authenticates with a device-bound passkey.
3. Server verifies the assertion and transaction binding.
4. Policy engine checks customer, merchant, amount, limits and risk.
5. Institution sandbox authorizes the payment.
6. Signed provider webhook is verified and deduplicated.
7. Settlement remains pending until an authoritative sandbox settlement event or statement is ingested.
8. Reconciliation matches the original intent and settlement record.
9. Tests prove duplicate requests, replayed assertions, tampered amounts, provider timeouts and out-of-order webhooks cannot create false approvals or settlement.

Use sandbox credentials and synthetic data only. No live customer funds, production credentials or real biometric templates in development or test environments.

## 12. Explicit non-goals for this integration profile

- Becoming a bank, issuer, acquirer, switch or settlement institution by implication.
- Holding customer funds or maintaining a shadow balance ledger.
- Treating biometric success as payment authorization.
- Treating payment authorization as settlement.
- Storing raw biometric templates by default.
- Bypassing partner KYC, AML, fraud, limits or transaction controls.
- Claiming PCI, EMVCo, FIDO or regulatory certification without the relevant assessment and evidence.

## 13. Architecture decision

**Decision:** Adopt a partner-led, institution-authoritative integration model. BioPOS owns authentication evidence, consent, orchestration and auditability. The licensed financial institution owns account truth, regulated decisions, payment execution and settlement truth.

**Rationale:** This minimizes regulatory ambiguity, avoids duplicating existing payment infrastructure, supports institution-specific adapters and gives the product a credible path to enterprise procurement, security review and controlled production integration.
