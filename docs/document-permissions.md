# Documents and EMTA permission choices

Last updated: 10 October 2026. Implemented as a browser-local demo.

## One application workspace

The shared form now accepts multiple files for each fictional applicant:

- Bank account statements.
- Other income evidence.
- An optional EMTA tax-data certificate.
- Other supporting documents.

All files are grouped in the continuous form's Documents section, with primary/co-applicant ownership kept separate. The main property and optional additional collateral each have a separate valuation-file section. If a purchase home is still unchosen, its valuation section and active export are deferred; bank acceptance of an initial request remains unverified. PDF, signed containers and image files can be added for valuations; account/supporting sections additionally accept CSV, XLS/XLSX and XML. Accepted picker types are demo formats, not a guarantee that a bank accepts them.

Files are held as browser File references. There is no server upload, persistence, parsing, signature validation, virus scan or automatic bank submission. The simulated statement-reading/source buttons do not inspect selected files; their synthetic values never prove file availability, coverage or consent. Use fictional documents. Reload, Start blank and Load fictional example discard the selected files and demo permission choices.

Limits: 20 MiB per file, 50 MiB and 30 files across the whole draft, including currently hidden sections. Remove a file to release its reference. Both profiles are still entered on the same device; this does not authenticate a co-applicant.

## Document preparation and evidence

Adding a statement marks its availability; the user must still enter months covered and, when relevant, all-account coverage. The application does not infer those facts from filenames or inspect statement contents.

Adding a valuation marks availability and suggests a format from its extension. Enter the actual valuation date separately. Keep the original signed container; it is never converted to PDF. Adding a file does not establish that its age, author, contents or signature meet a bank's rules.

Every selected bank shows a separate demo-package preparation section with missing statement/valuation files and each person's EMTA choice. These checks are proposed package readiness checks. They do not change the matrix's F/D/? evidence or confirm mandatory bank fields.

## EMTA choices

Each selected bank gets a separate choice for the primary applicant and, when enabled, the co-applicant:

- Not selected.
- Wish to allow the query (demo only).
- Decline.
- Withdraw the demo choice.

No option is preselected. Each answered choice records the person, bank, status, timestamp and text version `demo-emta-v1`. Changing a person's name or fictional ID clears only that person's choices. Newly selected banks do not inherit a choice made for another bank.

Purpose: assessment of this loan application. The proposed scope is an EMTA tax-data certificate, covering employment-register entries, declared income and certificate tax-debt information. This is not a request for unrelated government data. The exact blocks, wording, recipient identity and authorization process need confirmation for each bank.

EMTA's [official certificate guidance](https://www.emta.ee/eraklient/e-teenused-maksutarkus/registrid-paringud/toendite-taotlemine), checked on 10 October 2026, describes tax certificates and consent-based requests by participating credit institutions. It also describes obtaining a certificate yourself. This supports the concept, not a verified integration for all six banks.

**A choice in this demo grants no real authorization and makes no EMTA query.** A live flow must let each person use the accepted bank/state-portal process. An uploaded certificate is an alternative document route to confirm with the recipient, not proof of consent. Marketing remains separate and is not added here.

## Review and export

Review lists active files by owner/category and choices by person/bank. Adding or removing a file or changing a choice invalidates earlier review, just like editing the application.

- **JSON summary:** metadata, archive paths and permission records; no file contents.
- **ZIP package:** `application-summary.json`, a demo explanation and the original selected file bytes in owner/category folders.

Signed-file bytes and original filenames in the manifest are preserved. Archive filenames have a document ID prefix and safe separators to avoid collisions or path traversal. Disabled co-applicant, additional-collateral and currently unchosen purchase-property files stay in draft memory but are excluded from both exports. Deselecting a bank excludes its permission records from the export.

Invalid values block download. Missing documents or unselected/declined/withdrawn choices remain visible in an explicitly incomplete demo; they are not presented as bank-approved. Both downloads require the selected applicants and summary to be reviewed. No download contacts a bank or EMTA.

## Implementation and verification

`app-documents.js` manages local file references, permission choices, preparation checks and ZIP generation. The ZIP library is pinned, bundled locally at `vendor/jszip.min.js` (JSZip 3.10.1) with [its license](../vendor/JSZip-LICENSE.md), used under the MIT option. It needs no runtime download, account or API.

The 12 document regression tests cover owner/category isolation, type/size/count limits, duplicates and safe paths, inactive-owner exclusion, per-bank/person choices and withdrawal/reset, metadata versus file evidence, remaining verification warnings, JSON metadata-only export, ZIP byte/Unicode fidelity and package failures. The complete model/application/language/document/workflow/offer/journey/prefill suite now has 90 tests.

Browser infrastructure was unavailable; actual interaction/layout verification remains outstanding. The v6 scope adds no new draft save/import or separate user/mobile/accessibility testing programme. Existing reviewed JSON/ZIP package downloads are not reopenable draft backups.

## Shared workflow additions

Schema v6 summaries include field provenance, revision-bound shared reviews, all-six local simulation records, manually entered offer versions, cost assumptions/results, one simulated negotiation round, personal actions and manual contract checks. Historical household examples and case state are removed. LHV/Luminor are deeper partial forms; the other four previews are preparation summaries. These additions do not change file limits, byte fidelity, genuine permission flags or recipient/owner isolation. Original files are included only in the reviewed ZIP, never in a simulation transmission. See [workflow-demo.md](workflow-demo.md).
