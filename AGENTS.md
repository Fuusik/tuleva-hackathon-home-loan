# Coding assistant instructions

Read [README.md](README.md), [docs/project-brief.md](docs/project-brief.md), [docs/decisions.md](docs/decisions.md), [docs/bank-field-matrix.md](docs/bank-field-matrix.md), [docs/document-permissions.md](docs/document-permissions.md) and [docs/workflow-demo.md](docs/workflow-demo.md) before changing this project. Latest owner instructions supersede older descriptions. Current baseline: **v6**, continuous form, no historical household examples.

## Architecture

Keep the buildless offline runtime: index.html, local UMD modules and bundled JSZip/license. No installation/server/paid service/CDN/credentials as hidden requirements. Model/application/documents/workflow/offers/negotiation contain domain rules; UI modules/controller compose them; translation modules supply bilingual labels. app-application defines demo preparation requirements, not certified bank mandatory flags.

Use UTF-8. Canonical paths/option values remain stable across ET/EN; translate labels/options/messages/checklists, not user text or data. Switching language must not rebuild the form or discard entries, original files or choices.

## Product boundaries

- Estonian default, visible English switch. One continuous goal → applicants → home/financing → documents → review form, freely scrollable; no separate data/source/review modes. Relevant purpose/co-applicant/employment/financial branches only. Optional information is marked; bank questions have unverified mandatory status.
- Start blank. Keep potential-prefill hints and compact source overview; synthetic examples fill blanks only and mark provenance. Identity is not financial access; employment requires a separate source, statements do not prove balances/limits/all-account coverage, and acknowledgements stay manual. A no-op source action must not invalidate review.
- Keep historical household examples removed from code, fixtures, UI and docs. Generic explicitly fictional examples and user-entered offer version history are allowed. Never copy private report identities, accounts, email URLs or household terms into fixtures.
- The owner excluded proposed points 13/14: do not add draft save/reopen/import or a separate user/mobile/accessibility testing programme. Preserve the existing optional reviewed preparation-package export. Routine checks of code changes still apply.
- Purchase budget derives from requested loan + cash contribution, plus entered MES example funding where active. Guarantees/collateral are not cash; valuation is separate. Other funding is not approved financing. Keep construction budgets and refinancing remaining months distinct.
- A purchase home may be unchosen. Defer property/valuation shared requirements and active property exports; keep later-stage bank gaps and unverified acceptance visible. Preserve inactive draft entries where supported but exclude irrelevant data/files from the active export.
- Local previews for all six banks are authorized: deeper partial LHV/Luminor, preparation-only other banks. Preserve missing/unverified mappings. Choose recipients at final review and require current shared/person-recipient review; edits clear simulations. Always record no transmission, receipt or genuine authorization.
- Comparison follows current prepared application; summary cards precede optional calculation/evidence/negotiation details. Compare original financing separately from hypothetical equal amount/term. Common savings require same schedule/amount/term/currency/reset basis. Constant EUR annuity/equal-principal only; equal-principal totals use varying payments and no fixed-month payback. Unknown costs prevent complete totals/payback. Conditional stress, temporary prices, capped confirmed rebates, percentage/exit fees stay explicit. APR supplied only. No ranking, forecasts, approval, realised/guaranteed savings, representative private-case results or measured time/price claims.
- One reviewed local final-offer round is authorized: one to three banks, selected competitor fields, example.test recipients. Edits withdraw review/stale the draft. Preserve completed snapshot after manual replies; do not send/repeat a completed round. Handoff/manual contract checks are not legal/bank verification.
- Local files/ZIP are authorized demo features. No upload, parsing or signature claims; preserve original signed bytes and inactive-owner exclusion. File edits invalidate review. Limits and safe archive paths remain enforced.
- EMTA choices optional, unselected and separate per person/bank, with refusal/withdrawal/time/version. Identity edits clear that person's choices. Genuine authorization/query execution always false; exact bank scope/process remains unverified.
- Keep co-applicant profiles independent on one device. Review ticks are demo acknowledgements, not authentication or consent. No invitations, live integrations, uploads, persistence, analytics or automatic messages.
- Preserve missing vs zero/none, income currency/frequency, debts vs credit limits, dependants vs children, disposable money vs income. Keep canonical refinancing debts even where Coop's illustrative view excludes replacement debts.
- Invalid values block downloads; incomplete answers stay explicitly incomplete. Require selected recipients/profile/summary review for export, and invalidate in-flight ZIP after relevant changes. No endorsement/accepted channel is established. Never request real identity documents, bank passwords, Smart-ID/Mobile-ID PINs or keys.

## Research changes

Use primary bank sources with date and field evidence. F = public form/PDF, D = described topic, ? = unverified. Neither F nor D means mandatory; ? is not absence. Do not infer a full form from a product page or another bank. Keep document age/format/coverage and declarations separate. Update matrix/model/translations together only when evidence changes; UI rearrangement does not upgrade evidence.

## Checks

Run `node --test tests/*.test.js` and syntax-check changed modules plus index.html's inline script. The current suite has 90 tests across model, application, i18n, documents, workflow, offers, journey and prefill. Verify Unicode, all new translation labels/messages, local resources/static IDs, doc links, no unintended network/persistence and exact ZIP-byte boundaries where affected.

Open index.html and exercise changed interactions when browser tools are available. If unavailable, report that actual interaction/layout remains unverified; Node/static checks are not browser QA or accessibility certification. Do not invent completed checks. Tests should protect behavior/calculation/recipient/privacy invariants rather than mirror implementation or prose.

## Collaboration and completion

Preserve unrelated changes and inspect current branch/file versions. Prefer focused branches/PRs for concurrent teammate work; explicit owner instructions to commit directly to main authorize this task without another confirmation. Resolve stale heads by reading latest state; never force-push/rewrite shared history. Update affected context docs. Final handoff states changes, actual checks, material gaps and commit/PR link.
