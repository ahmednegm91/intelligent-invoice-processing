# Demo test cases and acceptance checklist

[Back to README](../README.md) | [Technical review](technical-review.md) | [Synthetic test files](../samples/)

All samples are fictional and use Arabic and/or English labels with Western (0-9) digits. `needs_review` can be registered as `pending_review`; these are **different** fields.

## Sample invoice test matrix

| ID | Input | Main check | Expected behavior |
|---|---|---|---|
| T01 | `Invoice_01_English_Bilingual_Valid.pdf` | PDF extraction, arithmetic | 4 items, subtotal `7000.00`, tax `980.00`, total `7980.00`, `passed`, new `pending_review` record |
| T02 | Same Invoice 01 a second time | Duplicate detection | Duplicate message; no additional row |
| T03 | `Invoice_02_Arabic_Bilingual_Valid.pdf` | Arabic/English extraction | Subtotal `4560.00`, tax `638.40`, total `5198.40` if correctly extracted; arithmetic `passed` |
| T04 | `Invoice_03_Mixed_Validation_Error.pdf` | Deliberate amount discrepancy | Items sum `3945.00`, VAT `552.30`, expected total `4497.30`; printed total `4507.30`, so `needs_review` |
| T05 | Image created from one test invoice as JPG | Image-model branch | Extraction, followed by same math/duplicate checks |
| T06 | Image created from one test invoice as PNG | Image-model branch | Extraction, followed by same checks |
| T07 | Rename/upload `.txt` or unsupported extension | File type check | Rejection with `UNSUPPORTED_FORMAT` or upstream form rejection |
| T08 | Invoice file above 10 MiB | Size check | `FILE_TOO_LARGE`, or upstream/server rejection before workflow |
| T09 | Missing or unreadable supplier/invoice number | Identity check | `needs_review` response; no registered row with empty key |
| T10 | Force primary PDF model error | Backup route | PDF backup attempted; if it succeeds, normal business flow resumes |
| T11 | Force primary image model error | Backup route | Image backup attempted; if it succeeds, normal business flow resumes |
| T12 | Primary + backup fail | AI failure | Friendly AI error; no new registered invoice |
| T13 | Malformed model text/JSON | Parser error route | Backup attempt rather than silently accepting malformed JSON |
| T14 | Simultaneous duplicate submissions | Concurrency/race scenario | **Not guaranteed safe** by current demo; target behavior for a future transactional implementation |
| T15 | Renamed/mismatched MIME extension | File metadata validation | Rejected if reported MIME and extension mismatch; does not prove file content integrity |

## Working with the register

For repeatable tests, **remove only the relevant synthetic row** before a test of first-time insertion. A sample already in `InvoiceRegistry` will correctly take the duplicate branch; that does not mean extraction failed.

## Financial check explanation

- For each item, compare `quantity * unit_price` to `line_total`.
- Sum line totals and compare to `subtotal`.
- Compare `subtotal + tax` to `total`.
- Difference tolerance in the current script: `> 0.02` units is flagged.
- Invalid/missing numeric fields are flagged; this is **not** a comprehensive accounting or tax policy engine.

## What was independently reviewed

The exported JavaScript for financial validation, invoice key generation, parser handling, and invalid-file error messages was exercised in a local Node.js offline harness. It is **not** a live Gemini or n8n execution. User-supplied screenshots demonstrate representative local paths.

Run:

```bash
node qa/offline-tests.js
```

**Do not quote a model accuracy percentage or time savings from this demonstration.** Those require a labeled evaluation set and measured before/after data.
