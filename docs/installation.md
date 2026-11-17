# Installation and configuration

[Back to README](../README.md)

These are **share-safe workflow exports**, not a one-click complete application bundle. The JSON files intentionally omit local credential references, production webhook IDs, instance metadata, local workflow ID, and Data Table IDs. **You must complete the relinking steps below.**

## Requirements

- A recent n8n instance with Form Trigger, Form Ending, Data Table, Execute Sub-workflow, Google Gemini, and Code nodes. The screenshots were taken from a self-hosted test environment; exact UI labels may differ by version.
- Working access to a Gemini API credential and API quota appropriate for PDF and image processing. Test with synthetic documents only.
- A fresh n8n project or a workspace where you can create a Data Table and both workflows.
- A browser that can access the n8n form URL. A private local setup is sufficient for a demo.

## A. Import AI engine FIRST

1. In n8n, create a new workflow and choose **Import from File**.
2. Select `workflows/ai-extraction-engine.json`.
3. Save as `P01 | AI Invoice Extraction Engine` if n8n asks for a name.
4. Create or select **your own** Google Gemini credential; reassign it to `PrimaryAI`, `BackupAI`, `PrimaryImageAI`, and `BackupImageAI`.
5. Confirm the model selections: primary Gemini 3.5 Flash-Lite, backup Gemini 3.5 Flash, or substitute models you have verified support the relevant PDF/image operations.
6. In both image nodes (`PrimaryImageAI` and `BackupImageAI`), verify **Input Type: Binary File(s)** and **Input Data Field: `invoice_file`**. The public exports explicitly include these settings.
7. Verify `InvoiceInput` uses **Accept all data**. Confirm the workflow is allowed to be called by the parent, if your instance applies access restrictions.
8. Save the workflow and note its new n8n ID.

## B. Create InvoiceRegistry

From the n8n project **Data Tables** tab, create a table exactly named `InvoiceRegistry` with all ten columns in [data-table-schema.md](data-table-schema.md). Leave it empty for the first test. A Data Table's rows are **not** bundled in the workflow JSON.

## C. Import main workflow

1. Create a separate new workflow and **Import from File** `workflows/main-workflow.json`.
2. Save it as `P01 | Intelligent Invoice Processing`.
3. Open `CallInvoiceAI` and **select the newly imported AI extraction engine**. Its exported link was cleared for privacy and will be unresolved after import.
4. Open `CheckNewInvoice` and `SavePendingInvoice`, selecting your newly created `InvoiceRegistry` table. Their original table IDs were cleared.
5. In `SavePendingInvoice`, double-check that all column mappings are still bound to the table fields, especially `invoice_key`, `validation_status`, `validation_issues`, and `approval_status`.
6. Confirm the Form Trigger's file field is named `invoice_file`; the JavaScript, Gemini nodes, and file validation expressions rely on that exact binary field name.
7. Re-open the Form Trigger and Form Ending nodes and verify n8n has generated working **test URLs**. If the imported form URL is missing, refresh/recreate its webhook registration in the editor.
8. Run the three example invoices one at a time in test mode. Check Data Table rows and the form ending.

## D. Test order

1. [Invoice 01](../samples/Invoice_01_English_Bilingual_Valid.pdf) should extract and pass arithmetic, then be stored with `pending_review`.
2. Submit the same invoice again; it should produce **Duplicate Invoice** without a new row.
3. [Invoice 02](../samples/Invoice_02_Arabic_Bilingual_Valid.pdf) tests Arabic/English extraction.
4. [Invoice 03](../samples/Invoice_03_Mixed_Validation_Error.pdf) should yield `needs_review` if extraction preserves the printed numbers.
5. Try an unsupported extension and an oversized file. Note that the form/server may reject an oversized upload **before** the workflow handler runs.
6. Test a model-specific failure in a safe development instance and verify backup routing. Restore settings after the test.

See [test-cases.md](test-cases.md) for expected outputs and troubleshooting guidance.

## E. Important notes about running in production

- The currently exported form is intended for local demonstration, not a public secure upload endpoint.
- If you publish/expose it, set up authentication, TLS, request and file size limits, rate limiting, scanning/inspection of uploaded content, logs/retention controls, and appropriate storage and access rules.
- Do not use real supplier invoices or personal financial data with any external model until you have reviewed provider data handling and the client's permissions and contractual requirements.
- Expect costs and rate limits to depend on the Gemini models, n8n plan/deployment, infrastructure, and storage.
- The current `Form Ending` displays a result for one invoice. It is not an ERP posting confirmation or invoice approval.

## How to keep this portable

Keep the main and AI engine as separate versioned JSON files. After every major editor change, download **both** workflows again, sanitize local references, rerun the offline QA, and review screenshots. Do not upload a raw export containing private credentials, headers, internal URLs, or customer data.

**Official references**: [Workflow exports](https://docs.n8n.io/workflows/export-import/), [sub-workflows](https://docs.n8n.io/flow-logic/subworkflows/), [Data Tables](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datatable/).
