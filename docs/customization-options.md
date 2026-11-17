# Complete client customization and optional features catalog

[Back to README](../README.md) | [Arabic catalog](customization-options-ar.md) | [Client discovery checklist](client-requirements.md)

**Scope legend:** Every feature on this page is **proposed/custom development**, **not included** in the current two-workflow demo unless the main README explicitly says otherwise. Feasibility, integration availability, data privacy, hosting, timeline, costs, and reliability must be scoped for each client. Some services may require paid plans or licensed API access.

## 1. Intake and document collection

- Ingest invoices from **Gmail**, **Outlook/Microsoft 365**, IMAP, or designated shared mailboxes.
- Watch **Google Drive**, **OneDrive**, **SharePoint**, SFTP, or customer document storage for new bills.
- Collect invoice messages via authorized **WhatsApp Business Platform** integrations or other approved messaging channels (subject to provider terms).
- Support direct **webhooks**, supplier portals, REST APIs, and authenticated client upload forms.
- Bulk upload and batch queues for hundreds or thousands of files; attachment extraction and multi-invoice PDF splitting.
- Classify invoice vs credit note vs receipt vs purchase order; route unrelated documents away from invoice processing.

## 2. Extraction and AI flexibility

- Configure client-selected LLM providers (Google, OpenAI, Anthropic, other supported providers), model-specific limits, and per-document routing.
- Deploy and evaluate **private/local inference** (e.g., an appropriate OCR plus LLM pipeline) if hardware and language performance requirements permit.
- Add scan cleanup: rotation, de-skewing, image enhancement, text-layer/OCR fallback, and low-quality scan detection.
- Use strict structured outputs, schema validation, source-page references, and highlighted extracted fields for review.
- Calibrate confidence, consistency, provenance, and exception thresholds against annotated Arabic/English reference documents.
- Add provider-independent fallback, circuit breakers, timeout policies, cost ceilings, and retry/backoff controls.
- Support custom supplier layouts, multiple currencies, regional date formats, decimal notation, and more languages.

## 3. Financial, tax and fraud-related controls

- Configurable tax/VAT rules for the client's jurisdiction, with specialist validation where required; **not** automatic proof of tax compliance.
- Cross-check amount words, invoice line totals, tax summaries, discounts, shipping, fees, and credit notes.
- Detect near-duplicates by supplier identity, invoice number normalization, PO number, amount, dates, and optional document fingerprints.
- Validate supplier registration against the client's trusted vendor master, tax IDs, purchase orders, and bank details.
- **2-way matching**: invoice vs purchase order. **3-way matching**: invoice vs PO vs goods received.
- Flag suspicious bank-account changes, unexpected amount spikes, repeated identifiers, missing order references, and inconsistent invoice dates.
- Supplier-specific configurable policy rules, thresholds, tolerances, and exception classification.

## 4. Human approval, AI approval and multi-stage review

A customer can choose one or combine them. **None are implemented in the current demo.**

| Path | Proposed behavior | Safeguards |
|---|---|---|
| **Human approval** | Authorized user reviews, corrects, approves, rejects, or requests a new document | Role-based access, clear source evidence, audit log |
| **AI-assisted human approval** | AI generates recommended decision and flags | Human remains final decision maker |
| **AI-only approval** | Policy-constrained AI service routes eligible low-risk records to an automated decision | Deterministic gates, tested thresholds, rollback, monitoring, escalation |
| **AI approval + second AI reviewer** | Separate AI reviewer critiques the first decision, checks extracted fields against source, and detects disagreement | Independent prompts/models where possible, disagreement escalation, benchmarks |
| **Hybrid tiered approval** | Low-risk routine candidates may be automated; higher-risk or uncertain cases require people | Amount/risk thresholds and clear override process |

**Accuracy statement:** Two AIs are **not** a guarantee of near-zero errors. Correlated hallucinations, extraction mistakes, incorrect supplier information, and weak reference data remain possible. Any reduction in error rate should be measured on a representative labeled dataset and monitored after deployment. Where financial or regulatory risk is material, human oversight may remain mandatory.

Additional optional approval features:
- Sequential approvals by department, finance, procurement, CFO, or monetary thresholds.
- Expiration, reminders, delegation, escalation, SLAs, and vacation substitution.
- Four-eyes review, separation of duties, approval history, digital signatures/evidence where suitable.
- Compare original document against extracted fields in a reviewer portal.

## 5. Accounting, ERP and procurement integrations

- **QuickBooks**, **Xero**, **Odoo**, **Zoho Books**, and other accounting systems with suitable API access.
- ERP and procurement integration such as **SAP**, **Microsoft Dynamics 365**, **Oracle NetSuite**, or proprietary client systems, subject to the selected edition, licensing, and connector capabilities.
- Create draft bills/vendor invoices rather than post automatically; optionally post only after appropriate approval.
- Sync supplier master, chart of accounts, purchase orders, cost centers, job codes, tax codes, branches, and projects.
- Write accounting-system document IDs back to the registry and reconcile posting failures without duplicate creation.

## 6. Storage, document retention and search

- Use **PostgreSQL**, **MySQL**, customer-managed SQL, or other suitable transactional stores instead of the built-in demonstration Data Table.
- Archive original PDFs/images and processing metadata in cloud object storage, private file storage, or on-premises network shares.
- Retention periods, lifecycle rules, encryption, deletion requests, legal holds, backups, and file-hash traceability.
- Search by vendor, amount, invoice number, currency, entity, PO, expense category, status, and date.
- Segregation across branches/legal entities and configurable data-residency rules.

## 7. Alerts, collaboration and routing

- Alerts by email, Microsoft Teams, Slack, Telegram, and approved business messaging channels.
- Notify on failed extraction, invalid file, duplicate, suspicious total, overdue review, unapproved high-value invoice, or ERP sync failure.
- Escalation to responsible account managers/procurement/finance owners with actionable links and case IDs.
- Daily summaries, weekly exception digests, and manual retry/reassignment tools.

## 8. Analytics, reporting and KPI dashboards

- Invoice throughput by channel, entity, vendor, currency, period, and approval state.
- Error types, duplicate rates, review volumes, processing latency, rework frequency, and provider failures.
- Cost reporting: model API usage, automation hosting, review time, per-invoice operating cost.
- Accounts payable aging, due dates, upcoming payments, vendor exposure, and accrual summaries where source data allows.
- CSV/Excel exports, BI integrations (e.g., Power BI), and custom dashboards.
- Accuracy metrics only if verified against human-reviewed ground truth.

## 9. Extended finance operations

- Invoice due-date reminders, payment status reconciliation, and remittance matching.
- Multi-currency exchange-rate treatment with explicit source and posting date rules.
- General ledger (GL) classification, expense categories, job/project/cost-center allocations.
- Vendor onboarding checks and approved supplier catalogs.
- Credit notes, partial deliveries, split bills, installment arrangements, and expense attachments.

## 10. Security, compliance and governance

- Authentication for upload/review portals, RBAC, SSO/MFA where supported, and least-privilege credentials.
- Encrypted transport, encryption at rest, secret management, network restrictions, and private endpoints where available.
- Audit logs for received documents, extractor versions, edits, approvals, actions, exports, and downstream writes.
- Retention, consent, contractual confidentiality, regulated data safeguards, and customer-defined data residency.
- Virus/malware checks, signature/content verification, archive decompression controls, and safer document handling.
- Privacy impact and provider data-handling review before sending documents to any cloud AI API.

## 11. Production reliability and scale

- Queue-driven processing, batching, concurrency control, deduplicated transaction-level inserts, and idempotent integrations.
- Provider-specific timeout handling, circuit breakers, backoff, dead-letter queues, retry dashboards, and alerting.
- Deployment automation, environment separation, regression evaluation, rollback, backup/restore drills, and observability.
- Monitoring for stale credentials, API quota exhaustion, missing data, schema changes, and provider/model lifecycle changes.
- Load and cost testing before scaling; documented operational ownership and support SLAs.

## 12. Cloud, customer-controlled cloud and full private deployment

| Option | What can reside where | Important caveat |
|---|---|---|
| Managed n8n/cloud | Hosted workflow, cloud storage/database, approved AI provider | Data processing follows all connected vendors' policies |
| Client-controlled cloud | n8n/DB/object storage within customer cloud account | External AI calls still transmit content to that AI provider |
| On-prem/hybrid | n8n and storage on private servers, with cloud or private AI | Cloud AI requests make the full pipeline hybrid, not fully on-prem |
| Fully private candidate | n8n + storage + OCR/LLM inference inside controlled infrastructure | Requires separate implementation, hardware sizing, accuracy and security testing |

A client selects deployment based on **sensitivity, data residency, compliance, cost, scale, latency, and internal IT capabilities**. No architecture should be advertised as compliant or completely private without an actual environment and vendor review.

## 13. Localization and multi-tenant variants

- Arabic/English UI, mixed-language line items, configurable digit normalization, right-to-left review interfaces.
- Multi-entity, multi-branch accounting, supplier-specific field schemas, regional taxes and invoice templates.
- White-label supplier portal or packaged deployment per customer.
- Regional compliance integrations where legally and technically available, with local expert review.

## Discovery and scoping

See [client-requirements.md](client-requirements.md) for intake channels, existing ERP, approval logic, hosting, data-retention requirements, volume, and acceptance criteria. Every customization is scoped, tested, and costed separately; the portfolio demo remains free of paid dependencies beyond a client-provided service where applicable.
