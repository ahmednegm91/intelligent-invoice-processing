# Technical review — evidence, corrected export setting and limitations

[Back to README](../README.md) | [Tests](test-cases.md) | [Security](deployment-and-security.md)

**Review basis:** the two user-supplied n8n JSON exports and six supplied screenshots. Both graphs were parsed and inspected. The shared package's JSON files are sanitized copies; the original local exports were not modified.

## What we could verify from the files

| Area | Observed in export | Review outcome |
|---|---|---|
| Workflow separation | Main (19 nodes), extraction engine (14 nodes) | Confirmed |
| Main branching | Upload validation, AI, financial validation, identity, duplicate lookup, registry, form endings | Confirmed by graph inspection |
| AI branching | PDF and image branches with primary/backup and parse-error routing | Confirmed by graph inspection |
| Configured models | Primary `models/gemini-3.5-flash-lite`, backup `models/gemini-3.5-flash` | Configured in the exports; primary appears in Google’s model list, while the backup identifier was not found there during the November 2026 review. Verify availability and select a supported model before use. |
| Provider dependency | Both AI models use Google Gemini and the same original credential reference | Provider-independent failover **not implemented** |
| Data Table | `InvoiceRegistry` reference plus 10 mapped/schema fields | Mappings confirmed; table **contents not exported** |
| Duplicate rule | Normalized `supplier_name` + `invoice_number` | Works as lookup rule; **no transactional uniqueness** |
| Financial rule | Line subtotal, invoice subtotal and tax+subtotal with tolerance | Independently exercised by offline JavaScript checks |
| Review status | New records set to `pending_review` | Confirmed; approval itself not automated |
| Image examples | User-supplied workflow screenshots | Included unmodified as illustrative evidence |

## Correction made to the share-safe JSON

**`HandleInvalidFile` Code node mode:** In the uploaded source JSON, this Code node omitted `parameters.mode` while using `$input.item` and returning one item. n8n documents that **Run Once for All Items is the default**. This is inconsistent with per-item code.

The public export therefore explicitly sets:

```json
"mode": "runOnceForEachItem"
```

This is a small, source-based setting correction. It should still be checked in the target n8n editor after import. The original export provided by the author remains unchanged.

**Image Gemini binary input:** The original uploaded source export did not explicitly set `inputType` or `binaryPropertyName` in either Image Analyze node, even though the incoming file uses `binary.invoice_file`. The public engine export sets `inputType: binary` and `binaryPropertyName: invoice_file` in both image nodes. This is a portability/correctness fix based on n8n's node parameter contract, **not a claim of a new live n8n test**.

**MIME and extension consistency:** The original file gate checked an allowlist of MIME types and an independent allowlist of extensions. That could admit a `.jpg` file with a reported PDF MIME type. The public export now also requires a **consistent extension-to-MIME mapping** (for example, `.pdf` ↔ `application/pdf`). This remains metadata-only validation; content signature checks are a production enhancement.

**AI error title:** The public export labels the error screen `AI Processing Failed` instead of `API Error`; the code/message are otherwise unchanged.

The public export also corrects the duplicated display name `BackupImageAIBackupImageAI` to `BackupImageAI`, updating graph references consistently. **Neither change adds new functionality.**

## Public-export hygiene

- Removed instance metadata and local top-level workflow/version IDs.
- Removed AI Credential references (recreate/select your own in the target instance).
- Cleared the source environment's sub-workflow selection and Data Table IDs (must rebind after import).
- Removed cached project URLs and regenerated public form webhook IDs.
- Preserved node logic, code expressions, connections, names except the cleanup above, and selected Gemini model identifiers.
- **Do not assume import works unattended:** credentials, workflow and Data Table references must be configured after import.

## Still-unverified or not production hardened

1. **Live runtime after import:** No access to the author's running Docker/n8n instance was available for an independent end-to-end execution. The supplied screenshots and author's reports indicate successful local runs; they are not third-party load-test evidence.
2. **Extracted JSON schema:** `JSON.parse` verifies syntax, not required field types, invoice date validity, currency codes, or extraction accuracy.
3. **Uploaded file content:** extension and MIME metadata are user-supplied; no deep file signature/antivirus scanning in current logic.
4. **File size:** branch uses the optional `$binary.invoice_file.bytes` property with 10 * 1024 * 1024 bytes; verify its presence on your target n8n version and enforce a server-side cap as well.
5. **Database concurrency:** lookup-then-insert is susceptible to races and supplier-name variants; use atomic unique keys for production.
6. **Database failures:** the saved workflow does not have a dedicated Data Table write-error recovery/notification branch.
7. **Full error telemetry:** terminal AI failure displays a message but does not write a dedicated error/audit record in persistent storage.
8. **Privacy:** the current model connector sends invoice content to Google; using a locally hosted n8n server does not prevent external processing.
9. **Business review:** no genuine human or AI approval, source document archive, posting, tax/legal compliance guarantee, payment workflow, or fraud certification.
10. **Extraction test corpus:** only three supplied synthetic PDF fixtures. More layout, language and edge-case coverage is required for deployment.
11. **Security controls:** Form Trigger currently has no additional authentication configuration; protect before making public.

## Recommended next engineering improvements (not secretly inserted)

For a client implementation, prioritize: strict field/schema validation, authenticated upload/review, real file signature checks, unique supplier master + atomic writes, original-document archival, structured error logs, and measured AI quality. Broader optional features are cataloged separately.

## Verification commands for the shared files

After unzipping with Node.js installed:

```bash
node qa/offline-tests.js
```

The offline checks test graph references, sanitized credential IDs, and extracted JavaScript arithmetic/duplicate/error-handler behavior. **They do not call Gemini, run n8n, or prove production readiness.**

Reference: [n8n Code node modes](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/), [workflow export precautions](https://docs.n8n.io/workflows/export-import/).

Additional reference: [Gemini node: document and image operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.googlegemini/).
