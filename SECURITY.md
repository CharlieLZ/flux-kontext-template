# Security Policy

## Supported Versions

The project is maintained on the default branch and the latest tagged release.
Older snapshots may not receive security fixes.

| Version | Supported |
| --- | --- |
| `main` / default branch | Yes |
| Latest release | Yes |
| Older releases | No |

## Reporting A Vulnerability

Please do not open a public GitHub issue for security reports.

Use one of these channels:

1. GitHub private vulnerability reporting, if it is enabled for the repository.
2. The maintainer contact channel listed on the production site.

Include:

- A short description of the issue
- Impact and affected area
- Reproduction steps or proof of concept
- Suggested mitigation, if you have one

## Response Targets

- Initial triage: within 5 business days
- Status update after confirmation: within 10 business days
- Fix timeline: depends on severity and exploitability

## Scope

This policy covers:

- Authentication and session handling
- Payment and webhook processing
- File upload and storage
- Secrets exposure and debug endpoints
- Supply-chain issues in direct dependencies
