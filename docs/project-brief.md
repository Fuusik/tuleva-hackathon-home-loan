# Project brief

Last updated: 10 October 2026, v5.

## Problem and value

Consumers repeat applicant, household, income, obligation, property and document work in several bank forms. The effort discourages multiple applications. Received offers also differ in amount, approval stage, conditions and costs. Build one reusable, user-checked application for multiple Estonian banks, followed by transparent comparison and one reviewed negotiation round.

Estonian consumers are the main audience. Estonian is the default; English remains available. No bank/Tuleva endorsement or integration has been established. Reduced work and better outcomes remain product hypotheses; one private household case demonstrates possible differences, not representative market savings or the service's causal impact.

## Implemented journey

1. Loan goal and bank selection, then data/source examples and answer checking. Simulated sources fill blanks only; manual entry remains available. Identity alone does not supply all financial data.
2. A shared primary/co-applicant profile, repeated income/debt/credit-limit rows, conditional financing/property branches, documents and optional recipient-specific demo EMTA choices. Both people use one device.
3. One shared review and separate recipient/person reviews. Six local simulations preserve evidence gaps; only LHV/Luminor have deeper partial form mappings.
4. Offer intake or three historical demos; original financing, versions, decision/evidence stages, conditional pricing and total-cost limitations remain visible. Equal-sum modelling is explicitly hypothetical.
5. One editable, reviewed final-offer request round for one to three favourite banks. The user selects competing terms to disclose. No messages or attachments are sent.
6. Personal handoff with contacts, next actions, questions, manually added replies/version history and a local downloadable summary. Manual contract comparison highlights missing/changed promises.
7. Reviewed JSON/ZIP export preserving original active files and recording demo-only state, provenance, assumptions, simulations, negotiation and contract checks.

## Boundaries

Buildless and offline: open index.html; no paid service, keys or installation. Page memory only, with no uploads, persistence, bank/EMTA access or genuine consent. Simulated identity, registry and file-reading data are synthetic. Incomplete answers remain explicit; invalid application/offer values block export. Application edits invalidate review/simulation; offer, disclosure and assumption edits invalidate relevant request/export review.

Original financing and hypothetical rate economics are separate. Costs remain unknown until supplied; zero is explicit. Historical terms are dated, some follow-up fields are inherited/unconfirmed, and remaining-month estimates are identified. Constant EUR annuity calculations do not handle variable future benchmarks, financed fees or special schedules. No ranking, legal certification or actual-savings claim is made.

## Acceptance and verification

- Shared answers and files are reused, with source badges and unanswered-field filtering.
- All selected banks retain missing and unverified topics; recipient choices remain isolated.
- Original amount/term and funding gaps remain visible alongside normalised costs.
- Conditional products, incomplete costs and version/evidence differences are visible.
- One request round requires review; further communication belongs to the person.
- Contract matches/missing/changes are aids, never bank or legal verification.
- ET/EN keeps canonical values, files, choices and page state.

72 Node tests and syntax/static/translation checks pass. Browser interaction/layout verification remains outstanding; use [workflow-demo.md](workflow-demo.md) for manual checks.

## Next production questions

Confirm full bank fields/channels and document acceptance; test abandonment and repeated-work reduction with users; determine genuine applicant/co-applicant control, source permissions and integrations; support offer documents and other pricing schedules; resolve regulatory/security/retention design and business model. Pricing and launch hosting are not agreed.

Shared context lives in [decisions.md](decisions.md), [bank-field-matrix.md](bank-field-matrix.md), [demo-cases.md](demo-cases.md), [../README.md](../README.md) and [../AGENTS.md](../AGENTS.md); private chats are not required to work on the repository.
