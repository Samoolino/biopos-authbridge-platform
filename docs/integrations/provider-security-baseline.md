# Provider Security Baseline

All partner rail adapters must meet these minimum platform requirements:
- TLS 1.2+ for all communications
- AES-256-class encryption at rest for sensitive records
- Signed callback or webhook validation
- Idempotent callback handling
- Secret rotation and secure secret storage
- Least-privilege credential usage

## Adapter expectations
Each adapter must provide:
- request signing where required
- callback verification
- normalized provider status mapping
- error normalization
- observability hooks
