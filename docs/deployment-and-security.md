# Deployment models, privacy and production hardening

[Back to README](../README.md)

## Current demonstration boundary

- Local/self-hosted n8n workflow execution.
- Google Gemini API as the document/image extraction engine.
- `InvoiceRegistry` n8n Data Table for light, structured metadata.
- One document per upload; synthetic data only.
- No implemented user-authenticated reviewer portal, approval engine, private AI inference, audit trails, or enterprise document vault.

**Data flow warning:** Even if you store the register on your own server, sending invoice contents to Google Gemini is an external processing step. In a real deployment, the customer must explicitly approve vendor data-handling, access, residency, retention, and confidentiality arrangements.

## Deployment option matrix

| Option | n8n | Document storage | AI inference | Potential fit |
|---|---|---|---|---|
| Managed cloud | Cloud | Managed cloud | Approved cloud provider | Fast pilot where vendor processing is acceptable |
| Customer cloud | Customer account/VPC | Private buckets/managed DB | Cloud API or private endpoint | Organizations wanting cloud control |
| On-prem hybrid | Customer server | Local DB/object store | External cloud API | In-house storage with permitted external AI processing |
| Fully private | Customer-controlled host | Customer-controlled storage | Validated local/private OCR + LLM | Strict privacy/data sovereignty, subject to testing |

Private/local models must be **evaluated on actual Arabic and English invoices** and may require substantial CPU/GPU/RAM, maintenance, or specialist OCR capabilities. The supplied JSON is **not** a ready-to-deploy local-model build.

## Required hardening before real invoices

1. Protect the upload endpoint with an appropriate identity layer; use HTTPS, rate limits, and authorization.
2. Inspect actual content signatures, scan for malware, enforce upload size upstream, and avoid trusting filename/MIME metadata alone.
3. Manage credentials securely, rotate exposed keys, avoid secrets in workflows and screenshots, and apply least privilege.
4. Validate every extracted field against a schema; flag low-confidence/missing data instead of treating JSON parsing as accuracy assurance.
5. Ensure database uniqueness/idempotent writes under concurrency; implement retries with bounded backoff and dead-letter handling.
6. Implement encrypted document storage, retention limits, controlled read access, deletion procedures, and backup testing.
7. Add monitored execution logging and structured error records, while redacting invoice/customer contents from unnecessary logs.
8. Decide approval rules and separation of duties. No automatic financial posting without agreed review and controls.
9. Run language-specific extraction quality benchmarks, adversarial tests, and load/cost tests against representative documents.
10. Review legal, tax, data-protection, and accounting requirements with the client's professionals before production.

## Not guaranteed

- Zero errors, near-zero errors, fraud prevention, regulatory compliance, or universal support for every invoice layout.
- Outage recovery when both models depend on the same Gemini account/provider.
- The sample PDFs or screenshots reflect any real customer financial data.

## References

- [n8n deployment overview](https://docs.n8n.io/hosting/)
- [n8n workflow export hygiene](https://docs.n8n.io/workflows/export-import/)
- [Gemini API models and availability](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
