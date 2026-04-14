# QA Test Matrix

## Core layers
- Unit testing
- Integration testing
- Device compatibility testing
- End-to-end merchant flow testing
- Security testing
- Performance and resilience testing

## Priority scenarios
1. Approved biometric payment flow
2. Failed biometric verification
3. KYC threshold rejection
4. Under-review AML escalation
5. Settlement callback success
6. Settlement callback replay or duplicate event
7. Reversal and dispute path
8. Terminal unavailable or untrusted

## Release gates
- Typecheck passes
- Build passes
- Critical path tests pass
- Security-sensitive changes reviewed
- Rollback note documented
