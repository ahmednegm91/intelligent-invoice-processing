# Client discovery and solution scoping checklist

[Back to README](../README.md) | [All optional features](customization-options.md)

Use this as a conversation guide, not a promise that features exist in the demo.

| Discovery topic | Questions to ask |
|---|---|
| Business profile | Industry, legal entities, countries, accounting cycle and critical controls? |
| Invoice sources | Email, portal, Drive, WhatsApp Business, SFTP, API, or manual upload? |
| Volume and quality | Documents/day or month, peak periods, file types, scan quality, pages per invoice? |
| Language | Arabic only, English only, bilingual, other languages, numeral conventions? |
| Mandatory fields | Supplier ID/tax ID, currency, PO, cost center, branch, due date, payment terms? |
| Validation | VAT rules, approved vendor list, PO matching, delivery receipts, tolerances? |
| Approval | Human, AI-assisted, AI-only for defined low-risk cases, second AI reviewer, escalations? |
| Finance integration | ERP/accounting vendor, edition, API availability, permitted write operations? |
| Storage | n8n Data Tables for pilot, customer DB, file vault, private bucket, retention? |
| Privacy | Allowed AI vendors, whether invoices may leave customer infrastructure, data residency? |
| Security | Authentication, roles, SSO, MFA, approval log and audit requirements? |
| Reliability | Working hours, uptime, retry windows, failure alerts, batch priority, support contacts? |
| Acceptance tests | Sample corpus, accuracy thresholds, validation coverage, measurable false positives? |
| Commercial | Budget, subscriptions paid by whom, hosting ownership, maintenance/support model? |

## Proposed deliverables for a scoped engagement

- Agreed architecture/data-flow diagram and privacy boundary.
- Implemented workflows/integrations with secret-free handoff and configuration instructions.
- Automated or repeatable acceptance cases using synthetic and authorized test data.
- Approval/exception workflow, evidence logs, and backup/restore procedures if contracted.
- Demo recording, user onboarding guide, and operational handover.

**No performance or financial ROI guarantee** should be quoted without a measured baseline and real acceptance results.
