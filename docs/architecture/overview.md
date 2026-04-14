# BioPOS AuthBridge Architecture Overview

## Primary layers
1. Interface Layer
   - Merchant Terminal App
   - Admin Dashboard
   - Support Console
   - Partner API

2. Trust Layer
   - Identity Service
   - Authentication Service
   - Consent Service
   - Device Trust Service

3. Policy Layer
   - KYC/CDD Rules
   - AML Screening
   - Risk & Threshold Policies

4. Transaction Layer
   - Transaction Orchestrator
   - Settlement Adapter
   - Reversal & Retry Logic
   - Notification Service

5. Governance Layer
   - Encrypted Logs
   - Compliance Monitor
   - Security Controls
   - QA & Reporting

## Flow
1. Merchant app creates an authorization request.
2. Identity service validates customer eligibility.
3. Auth service validates biometric proof.
4. Policy engine evaluates KYC, AML, risk, and thresholds.
5. Consent service creates a consent artifact.
6. Orchestrator returns approved, failed, or under_review.
7. Downstream rail adapter executes settlement for approved flows.
