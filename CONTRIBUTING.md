# Contributing

## Branching Rules
- Use `main` for production-ready code.
- Use `develop` for active integration work.
- Use `feature/<name>`, `fix/<name>`, `hotfix/<name>`, `release/<version>`, `spike/<topic>`, `chore/<name>`, and `docs/<name>`.
- Do not commit directly to `main`.

## Commit Message Standard
Use Conventional Commits.

Examples:
- `feat(auth): add biometric liveness validation`
- `fix(orchestrator): prevent duplicate settlement callback handling`
- `security(crypto): harden consent artifact encryption`

## Pull Request Standard
Each PR should include:
- summary
- linked issue
- scope of change
- test evidence
- security/compliance impact
- rollback note

## Security Review Requirements
Security-sensitive changes include auth logic, encryption logic, webhook validation, partner credentials, device trust controls, and audit log handling.
