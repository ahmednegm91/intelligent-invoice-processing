# Start here | ابدأ من هنا

**Ahmed Negm — Intelligent Invoice Processing (n8n Portfolio Project)**

[English overview](README.md) | [الشرح بالعربي](README_AR.md) | [Demo video (50 seconds)](demo/invoice-processing-visual-walkthrough.mp4)

## What is inside? | محتويات المشروع

- `workflows/main-workflow.json`: upload, file checks, arithmetic validation, duplicate detection, Data Table and messages.
- `workflows/ai-extraction-engine.json`: PDF/image AI extraction, primary/backup Gemini, JSON parsing, failover.
- `README.md` and `README_AR.md`: the project overview for international and Arabic-speaking clients.
- `docs/`: architecture, install steps, full customization catalogs in English/Arabic, testing, security and technical review.
- `samples/`: 3 entirely fictional bilingual invoice PDFs; the third intentionally has incorrect totals.
- `screenshots/`: six user-supplied real workflow/result captures.
- `demo/`: **silent, screenshot-based visual walkthrough** (not a new live n8n recording) and storyboard PNG slides.
- `qa/offline-tests.js`: repeatable static/code tests (`node qa/offline-tests.js`); no paid services or keys required for these checks.

## Quick setup | طريقة التشغيل المختصرة

1. Import the AI engine JSON first into your n8n instance.
2. Create or select your own **Gemini API Credential**. Never put secrets in GitHub.
3. Create the `InvoiceRegistry` Data Table using `docs/data-table-schema.md`.
4. Import the main workflow JSON.
5. Re-select the imported engine in `CallInvoiceAI` and `InvoiceRegistry` in the two Data Table nodes.
6. Confirm all four Gemini nodes use `invoice_file` binary input; run the sample invoices in test mode.
7. Read `docs/installation.md` for all necessary details.

**الملفان JSON منفصلان ولا يحتويان على API keys أو بيانات سجل الفواتير. بعد الاستيراد لازم تربط الـCredential والـSub-workflow وجدول InvoiceRegistry من جديد.**

**Important:** The source exports were reviewed and minimally corrected in the public package. Offline checks passed, but a fresh end-to-end test on the *imported* workflows in the receiving n8n instance was not possible from this environment.

**Not implemented:** human approval, AI approval, second AI reviewer, ERP posting, fully private inference, a protected public portal, and production-grade controls. These are **client-specific optional features** described separately, not promises of existing behavior or near-zero errors.

**Deployment privacy:** A self-hosted n8n instance using Google Gemini still sends invoice content to Google. A fully private solution needs an evaluated private OCR/AI stack.
