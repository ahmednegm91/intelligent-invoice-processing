# Release QA / honest verification scope

**Release date:** 2026-11-17 · **Purpose:** Public GitHub portfolio package

## Completed checks

- Parsed both n8n JSON workflow exports, confirmed 19 main nodes and 14 extraction-engine nodes.
- Checked uniqueness of node names/IDs and every graph connection destination.
- Confirmed that credential objects, instance metadata, source workflow/table IDs, and source workspace URLs are absent from public JSON exports.
- Set explicit `inputType: binary` + `binaryPropertyName: invoice_file` for both Gemini Image Analyze nodes in the sanitized export.
- Set `HandleInvalidFile` Code node to `runOnceForEachItem`, consistent with its `$input.item` code.
- Tightened MIME/extension checks, so a `.jpg` file reporting a PDF MIME type is rejected.
- Corrected duplicate image-backup node's display name/graph reference and improved the AI error screen title.
- Executed **26 offline tests** with Node.js covering successful arithmetic, a deliberate mismatch, unknown/missing numeric values, file formats/limits, mismatch prevention, key normalization, JSON parsing and malformed response handling, binary restore, workflow wiring, sensitive metadata stripping, links and assets.
- Verified three sample PDFs have PDF file headers and inspected their contents. All sample businesses are fictional.
- Verified the 50-second 1280x720 H.264 visual walkthrough was produced entirely from uploaded screenshots and synthetic invoice pages. It contains no fresh live n8n runtime footage or external voices.

To rerun from repository root:

```bash
node qa/offline-tests.js
```

## Scope and important unverified items

- **No independent live n8n re-import execution**: the local n8n/Docker instance was not accessible to this QA environment. User supplied screenshots and earlier reported workflow success, but public export corrections must be retested after import.
- **No live Gemini API call**: this review does not validate current account quota, rate limits, latency, extraction accuracy, permissions, or model billing. Consult current official model docs and terms.
- **No end-to-end n8n Data Table integration test**: create/rebind the new registry, import both workflows, then submit the three synthetic PDFs and JPG/PNG samples in a fresh target instance.
- **No production certification**: no fraud, accounting accuracy, legal, security, privacy or regulatory certification.
- **No promise of error rate**: multiple AI approval stages require independent quantitative evaluation and risk-based human escalation.

## Must-retest after importing the public exports

1. `CallInvoiceAI` is linked to the newly imported sub-workflow.
2. Both Data Table nodes point to the newly created `InvoiceRegistry` with all required columns.
3. Every Gemini node has a credential and supports the selected model.
4. Both image nodes explicitly use binary field `invoice_file`.
5. Unsupported format, oversized file, PDF success, Arabic extraction, mismatch, duplicate, primary fallback, and backup failure paths work as expected.
6. The uploaded form is protected before external/customer use.

## Official references

- [n8n workflow import/export](https://docs.n8n.io/workflows/export-import/)
- [n8n Code node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)
- [n8n Gemini node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.googlegemini/)
- [Google Gemini models](https://ai.google.dev/gemini-api/docs/models)
