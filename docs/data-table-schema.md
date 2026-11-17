# InvoiceRegistry data schema

[Back to README](../README.md) | [Installation](installation.md)

Create a Data Table named **`InvoiceRegistry`** inside the n8n project. The export contains field mappings but **does not create this table or include its rows**.

| Column name | Data Table type | Purpose |
|---|---|---|
| `invoice_key` | String | Composite key: normalized supplier + invoice number |
| `supplier_name` | String | Name extracted from document |
| `invoice_number` | String | Invoice identifier printed on document |
| `invoice_date` | String | Invoice date; currently no formal date constraint |
| `currency` | String | Example `EGP`; no currency validation in current demo |
| `total` | Number | Printed invoice total as extracted |
| `validation_status` | String | `passed` or `needs_review` |
| `approval_status` | String | Set to `pending_review` on new invoice inserts |
| `validation_issues` | String | JSON-serialized list of detected arithmetic/field issues |
| `reviewer_notes` | String | Reserved for future review; not written by a current approval workflow |

Example synthetic record:

```json
{
  "invoice_key": "atlas office supplies|INV-2026-1042",
  "supplier_name": "Atlas Office Supplies",
  "invoice_number": "INV-2026-1042",
  "invoice_date": "2026-11-15",
  "currency": "EGP",
  "total": 7980,
  "validation_status": "passed",
  "approval_status": "pending_review",
  "validation_issues": "[]",
  "reviewer_notes": ""
}
```

## Important distinctions

- `invoice_key` is **used to look up duplicates**, but the current design does not implement an atomic database unique constraint.
- Two simultaneous uploads could theoretically pass the check and both be inserted; enterprise implementations should use a transaction or unique index in a suitable database.
- Slight spelling variations in Arabic/English supplier names can produce different keys. A supplier master/Tax ID matching layer is an optional improvement.
- The invoice PDF/image is **not** archived in this Data Table. A production document store and retention policy must be designed separately.
- `validation_issues` is a string containing a JSON array, not a native JSON column in this current schema.
