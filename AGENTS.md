# Coding assistant instructions

Applies to this repository. The user's current instructions take precedence over these project conventions. Use repository documents as shared context; do not assume access to the owner's private chats.

## Read before making changes

- [README.md](README.md): purpose, setup, current features and collaboration.
- [docs/project-brief.md](docs/project-brief.md): consumer problem, intended journey, implemented scope and open questions.
- [docs/decisions.md](docs/decisions.md): confirmed decisions, implementation baseline and proposed workflow.
- [docs/bank-field-matrix.md](docs/bank-field-matrix.md): evidence, mapping differences, sources and verification gaps.

The bank matrix is a dated research baseline. It does not certify production requirements. Keep proposals, observed fields and bank-confirmed requirements distinct.

## Files and implementation conventions

| File | Responsibility |
| --- | --- |
| `index.html` | Buildless page, styles and browser controller |
| `app-model.js` | Shared data defaults, conditional checks, validation, annuity calculation and canonical summary; usable in browser and Node |
| `app-i18n.js` | Estonian/English translations and composed messages |
| `tests/model.test.js` | Model regression checks |
| `tests/i18n.test.js` | Language defaults, translation coverage and stable data checks |

Keep the existing offline, dependency-free runtime unless the requested task changes that scope. Do not add a paid AI service or credentials as a hidden requirement. Keep model rules in the model, presentation in the page and translations in the translation module.

Use UTF-8 files. Verify Estonian characters and euro symbols survive writing and reading. Keep canonical field keys and option values stable; UI language changes only labels and descriptive messages. Do not translate free-text user values or rebuild the form during a language switch.

## Product boundaries

- Estonian is the default; provide a visible ET / EN switch. Translate new labels, options, validation messages, checklist text and export-review text in both languages.
- Use fictional examples. Do not add bank submissions, autonomous messages, live eligibility/approval claims, authentication, account-data access, real document collection, persistence, analytics or integrations as incidental changes to this demo.
- No bank or Tuleva endorsement, partnership, submission API or acceptance of exported summaries has been established.
- Keep the primary and co-applicant profiles independent. The current co-applicant flow is on one device; review ticks are demo acknowledgements, not real bank consent.
- Keep selected-bank missing items and unverified mappings visible through review and export. A completed checklist must still show that bank verification is needed.
- Export remains a shared canonical summary. Keep refinanced debts and their flags. Do not apply Coop's native-form exclusion to the canonical JSON; a future bank adapter must implement recipient rules separately.
- Maintain explicit missing versus zero/none, original income currency/frequency, debt versus credit limit, dependants versus children under 18, and disposable money versus income.
- Respect conditional employment, construction/renovation, refinancing, EIS and additional-collateral branches. Preserve inactive draft entries where the current controller supports it; exclude irrelevant data from the exported model.
- Invalid values block download; incomplete answers may remain explicitly incomplete. Require a selected bank and review of each fictional profile and the summary. Application edits invalidate review.
- Keep comparison examples fictional, on shared assumptions and without a bank ranking or recommendation. The calculator supports annuity scenarios only; do not present special schedules as equivalent or scenario totals as full APR.
- Never request or store internet-bank passwords, Smart-ID PINs, Mobile-ID PINs, API keys or genuine identity documents.

## Bank research changes

Use primary bank sources and record the source and evidence date when changing mappings. F means visible in a public form/PDF; D means a topic/document described in guidance; ? means unverified. Neither F nor D means mandatory. A ? cell does not prove a field is absent.

Do not infer a complete field list from a product page, a small-loan form or one bank's longer form. Keep bank-specific declarations and document format/age/coverage rules distinct. If evidence cannot be checked, retain the verification gap and say what remains unresolved. Update the matrix, model and translations together when a verified mapping change affects the demo.

## Checks appropriate to the change

For model or translation changes, run:

```sh
node --test tests/model.test.js tests/i18n.test.js
node --check app-model.js
node --check app-i18n.js
```

For controller changes, also check the inline script's syntax and open `index.html` in a browser when available. Browser checks should exercise changed behavior, including relevant ET / EN transitions, preserved entries, repeated rows, optional co-applicant, purpose branches, selected banks and review/export invalidation. Confirm no unintended network calls or persistence were added.

If a browser cannot run, report that limitation; passing Node tests is not evidence of visual or interaction verification. The existing expanded demo has 20 Node tests; automated browser interaction/layout verification remains outstanding.

For documentation-only changes, check factual consistency, file paths, relative links and the distinction between current and planned behavior. Do not add tests that merely repeat the prose.

## Collaboration and finishing work

Prefer focused task branches and pull requests for parallel teammate work. Follow explicit owner instructions to commit directly to `main` when supplied; do not request approval again for authorized edits or commits.

Inspect current file/branch versions before writing, preserve unrelated changes and avoid force-pushing or rewriting shared history. Resolve a stale branch head by reading the latest state, not by overwriting it.

When behavior or an accepted decision changes, update the affected README, brief, decision log and bank research. Keep project context in these files, not only in chat. In the final handoff, state what changed, checks performed, remaining verification gaps and the commit or pull request link.
