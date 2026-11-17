# Demo video and live demonstration guide

[Back to README](../README.md) | [Visual walkthrough](../demo/invoice-processing-visual-walkthrough.mp4)

## Included video

`demo/invoice-processing-visual-walkthrough.mp4` is an **edited screen-based portfolio walkthrough** using the user-supplied workflow screenshots and test result images. The video is deliberately labeled as a visual walkthrough. **It is not a recording of a fresh live test, and it does not show new product functionality.** No external video platform or paid stock assets were used.

## Suggested script for a separate, authentic live screen recording

1. Show the form receiving `Invoice 01`; explain Arabic + English extraction.
2. Show the AI engine and its PDF / image branches plus backup behavior.
3. Show `InvoiceRegistry` row marked `pending_review` and arithmetic `passed`.
4. Re-upload Invoice 01 and show the **Duplicate Invoice** message.
5. Submit Invoice 03; show `needs_review` and the printed vs calculated mismatch.
6. Show a rejected unsupported format and mention the 10 MiB file policy.
7. End with customization possibilities: email intake, PO matching, human/AI approval, ERP integrations, cloud/private deployments.

Only record the client-safe demo. Before screen recording, hide n8n hostnames/tokens, credential panels, execution data containing private documents, webhook URLs, personal tabs, and OS notifications.

## Suggested narrative (English)

"Manual invoice intake is repetitive, especially when documents mix Arabic and English. This n8n portfolio project accepts PDFs and images, extracts invoice details with a configurable Gemini engine, and checks amounts using deterministic code. It flags duplicate submissions, arithmetic mismatches, unsupported files, and AI failures. New invoices are registered as pending review, not automatically approved. The design separates document AI from business validation, so clients can request further integrations, approvals, dashboards, and cloud or private deployments. The supplied demo uses fictional invoices and illustrates workflow behavior, not a production financial certification."
