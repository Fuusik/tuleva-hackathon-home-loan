# Coding assistant instructions

Applies to this repository. The user's current instructions take precedence over these project conventions. Use repository documents as shared context; do not assume access to the owner's private chats.

## Read before making changes

- [README.md](README.md): purpose, setup, current features and collaboration.
- [docs/project-brief.md](docs/project-brief.md): consumer problem, intended journey, implemented scope and open questions.
- [docs/decisions.md](docs/decisions.md): confirmed decisions, implementation baseline and proposed workflow.
- [docs/workflow-demo.md](docs/workflow-demo.md): shared review, recipient mappings, simulation and cost definitions.
- [docs/document-permissions.md](docs/document-permissions.md): browser-local files, demo EMTA choices and JSON/ZIP exports.
- [docs/bank-field-matrix.md](docs/bank-field-matrix.md): evidence, mapping differences, sources and verification gaps.

The bank matrix is a dated research baseline. It does not certify production requirements. Keep proposals, observed fields and bank-confirmed requirements distinct.

## Files and implementation conventions

| File | Responsibility |
| --- | --- |
| `index.html` | Buildless page, styles and browser controller |
| `app-model.js` | Shared data defaults, conditional checks, validation, annuity calculation and canonical summary; usable in browser and Node |
| `app-i18n.js` | Estonian/English translations and composed messages |
| `app-documents.js` | Local File references, demo permission records, preparation checks and ZIP packaging |
| `vendor/jszip.min.js` | Pinned JSZip 3.10.1; keep its license and local loading |
| `app-workflow.js` | Shared review, recipient readiness and partial illustrative adapters |
| `app-offers.js` | Offer intake defaults, compatibility and cost scenario calculations |
| `app-stages-ui.js` | Shared review, readiness, simulation and comparison UI |
| `app-stage-i18n.js` | New bilingual-stage label dictionary merged into app-i18n |
| `tests/workflow.test.js` / `tests/offers.test.js` | Review/mapping and comprehensive cost checks |
| `tests/documents.test.js` | File/permission isolation, limits, export and original-byte checks |
| `tests/model.test.js` | Model regression checks |
| `tests/i18n.test.js` | Language defaults, translation coverage and stable data checks |

Keep the existing offline runtime without installation or server requirements. JSZip is bundled locally with its license; do not switch to a CDN or hide a new service/dependency. Do not add a paid AI service or credentials as a hidden requirement. Keep model rules in the model, presentation in the page and translations in the translation module.

Use UTF-8 files. Verify Estonian characters and euro symbols survive writing and reading. Keep canonical field keys and option values stable; UI language changes only labels and descriptive messages. Do not translate free-text user values or rebuild the form during a language switch.

## Product boundaries

- Estonian is the default; provide a visible ET / EN switch. Translate new labels, options, validation messages, checklist text and export-review text in both languages.
- Local-only recipient-form simulations are authorized. Preserve distinct LHV/Luminor mappings and unresolved fields, require current shared review plus each fictional person's recipient review, and always record no real transmission/receipt/authorization. Never point adapters at a bank endpoint.
- Use fictional examples. Do not add bank submissions, autonomous messages, live eligibility/approval claims, authentication, account-data access, server uploads, persistence, analytics or integrations as incidental changes to this demo.
- Local document selection and ZIP packaging are authorized demo features. Use fictional documents; no automatic upload, parsing or signature/acceptance claims. Keep original signed-container bytes unchanged and exclude inactive owners from exports. File changes invalidate review.
- EMTA choices are optional, unselected by default and separate per person/bank. Include decline/withdrawal and version/time; clear a person\'s choices when identity fields change. Export always records genuine authorization and query execution as false. Never treat the demo choice as a valid bank/state-portal consent.
- No bank or Tuleva endorsement, partnership, submission API or acceptance of exported summaries has been established.
- Keep the primary and co-applicant profiles independent. The current co-applicant flow is on one device; review ticks are demo acknowledgements, not real bank consent.
- Keep selected-bank missing items and unverified mappings visible through review and export. A completed checklist must still show that bank verification is needed.
- Export remains a shared canonical summary. Keep refinanced debts and their flags. Do not apply Coop's native-form exclusion to the canonical JSON; a future bank adapter must implement recipient rules separately.
- Maintain explicit missing versus zero/none, original income currency/frequency, debt versus credit limit, dependants versus children under 18, and disposable money versus income.
- Respect conditional employment, construction/renovation, refinancing, EIS and additional-collateral branches. Preserve inactive draft entries where the current controller supports it; exclude irrelevant data from the exported model.
- Invalid values block download; incomplete answers may remain explicitly incomplete. Require a selected bank and review of each fictional profile and the summary. Application edits invalidate review.
- Keep comparison examples fictional, on shared assumptions and without a bank ranking or recommendation. The calculator supports compatible constant-rate EUR annuity scenarios only; do not present different principal/term/benchmark/reset or special schedules as equivalent. Unknown fees must prevent a complete total; separate horizon interest/fees from repaid and remaining principal. Record APR as supplied, never derive it from scenario totals. Offer/assumption edits invalidate export review, including an in-flight ZIP.
- Never request or store internet-bank passwords, Smart-ID PINs, Mobile-ID PINs, API keys or genuine identity documents.

## Bank research changes

Use primary bank sources and record the source and evidence date when changing mappings. F means visible in a public form/PDF; D means a topic/document described in guidance; ? means unverified. Neither F nor D means mandatory. A ? cell does not prove a field is absent.

Do not infer a complete field list from a product page, a small-loan form or one bank's longer form. Keep bank-specific declarations and document format/age/coverage rules distinct. If evidence cannot be checked, retain the verification gap and say what remains unresolved. Update the matrix, model and translations together when a verified mapping change affects the demo.

## Checks appropriate to the change

For model, translation or document-module changes, run:

```sh
node --test tests/model.test.js tests/i18n.test.js tests/documents.test.js tests/workflow.test.js tests/offers.test.js
node --check app-model.js
node --check app-i18n.js
node --check app-documents.js
node --check app-workflow.js
node --check app-offers.js
node --check app-stages-ui.js
node --check app-stage-i18n.js
```

For controller changes, also check the inline script's syntax and open `index.html` in a browser when available. Browser checks should exercise changed behavior, including relevant ET / EN transitions, preserved entries/files/choices, file selection/removal, ZIP byte fidelity, permission withdrawal, repeated rows, optional co-applicant, purpose branches, selected banks and review/export invalidation. Confirm no unintended network calls or persistence were added.

If a browser cannot run, report that limitation; passing Node tests is not evidence of visual or interaction verification. The existing expanded demo has 50 Node tests; automated browser interaction/layout verification remains outstanding.

For documentation-only changes, check factual consistency, file paths, relative links and the distinction between current and planned behavior. Do not add tests that merely repeat the prose.

## Collaboration and finishing work

Prefer focused task branches and pull requests for parallel teammate work. Follow explicit owner instructions to commit directly to `main` when supplied; do not request approval again for authorized edits or commits.

Inspect current file/branch versions before writing, preserve unrelated changes and avoid force-pushing or rewriting shared history. Resolve a stale branch head by reading the latest state, not by overwriting it.

When behavior or an accepted decision changes, update the affected README, brief, decision log and bank research. Keep project context in these files, not only in chat. In the final handoff, state what changed, checks performed, remaining verification gaps and the commit or pull request link.
