# Decision log

Last updated: 10 October 2026.

This log captures the project owner's explicit instructions, the implemented demo baseline and research-driven design choices from the project discussions. Proposed team practices and unresolved launch questions are labelled separately. It does not turn earlier suggestions into confirmed bank requirements.

## Confirmed product decisions

All entries below were recorded on 10 October 2026. Dates indicate when the repository record was written.

| ID | Decision | Basis and implication |
| --- | --- | --- |
| D01 | Build one shared home-loan profile for multiple Estonian banks. | Core hackathon idea. Reduce repeated entry and support informed comparison and negotiation. |
| D02 | Default to Estonian, with a visible English option. | Explicit owner instruction. ET / EN switching must preserve draft values, selected banks, repeated entries and the current page. Keep user-entered text unchanged. |
| D03 | Keep the prototype demo-only and use synthetic information. | Explicit owner instruction and implementation boundary. No bank submission, authentication, real identity documents, account-data access or live credit decisions. |
| D04 | Expand the shared form using the bank field matrix. | Explicit owner instruction. Include applicant, employment, income, debts, credit limits, property and optional co-applicant details, with relevant conditional questions. |
| D05 | Show missing information and unverified requirements for each selected bank. | Explicit owner instruction. A filled demo never implies confirmed bank readiness. |
| D06 | Use GitHub as the shared source of project code and written context. | Owner created and connected `Fuusik/tuleva-hackathon-home-loan` and requested commits and collaborator documentation. Collaborators should not depend on private chat access. |
| D07 | Keep the prototype easy to run without a paid API. | Owner's setup/cost constraint and current implementation. Open `index.html` with its local scripts; no server, installation or API keys are needed to run the demo. |
| D08 | Add statements for both people, valuation files and separate EMTA permission choices in the shared application. | Explicit owner instruction on 10 October 2026. Implement actual local file selection and reviewed ZIP packaging; preserve demo-only operation and keep genuine queries/authorization unimplemented. |
| D09 | Prioritize checked shared data, recipient readiness, bank simulations and comprehensive comparison. | Initial four-point instruction; subsequently expanded by D11. The core remains reducing repeated applications. |
| D10 | Implement guided simulated prefilling with field provenance and manual fallback. | Owner accepted all twelve proposed changes. No genuine identity, registry or file access is implied. |
| D11 | Expand to six local bank previews and three anonymised historical cases. | Two deeper partial adapters plus four preparation summaries; no upgrade to verified mappings. Keep historical terms, estimates, inherited evidence and synthetic identities distinct. |
| D12 | Support one reviewed final-offer request round and personal handoff. | User chooses up to three banks and disclosed competing fields; demo-only simulated messages. Add manual replies/version history and manual promise-versus-contract checks. |

## Implemented and research-driven baseline

These are the current design choices, not a claim of bank confirmation. All were recorded on 10 October 2026.

| ID | Baseline | Reason / consequence |
| --- | --- | --- |
| B01 | Start with Swedbank, SEB, LHV, Luminor, Coop Pank and Bigbank. | The matrix covers this initial shortlist; it is not exhaustive lender coverage. |
| B02 | Build from the union of observed fields and validate mappings per bank. | A single "most complex" form has not been verified. F/D evidence does not establish required-field flags; unresolved mappings remain visible. |
| B03 | Preserve original data and distinct meanings. | Unknown differs from zero/none. Keep original income currency/frequency, credit limits, dependants/children, disposable money and refinancing debt flags separate. |
| B04 | Use separate fictional applicant and co-applicant profiles on the same device. | There are no invitations, independent accounts or genuine bank consents. Per-person export review is a demo acknowledgement. |
| B05 | Export a canonical JSON summary and optional ZIP with original local files after review. | Retain missing answers and gaps; block invalid values and require a selected bank. Application edits invalidate earlier shared/recipient/export review and simulations; offer/assumption edits invalidate export review. Schema v5 also exports provenance, current review, six local simulations, historical/version state, offer assumptions/results, one negotiation snapshot, handoff actions and manual contract checks. The JSON is not an accepted native bank application and does not implement the Coop-specific debt exclusion. |
| B06 | Compare fictional annuity scenarios only. | Use the same principal, term and assumed benchmark. Special schedules are not calculated. Include upfront and recurring costs plus qualitative terms. Horizon borrowing cost excludes repaid principal; full-term outflow includes it. Unknown fees suppress complete totals. Incompatible live comparison and expired live offers are withheld. Explicit normalisation substitutes hypothetical common principal/term; original financing remains separate. Historical snapshots stay dated. Remaining months, conditional pricing, percentage fees, promotions, capped rebates and exit costs are supported. APR is recorded only as supplied. Do not rank or recommend a bank. |
| B07 | Keep entries, selected files and demo permission choices in page memory. | No persistence or uploads. Reloading discards the draft. The user may explicitly download JSON metadata or a ZIP containing active original files. Reload or resetting the draft clears the references and choices. |
| B08 | Preserve stable export keys while translating descriptions. | JSON records `uiLanguage`; checklist messages follow that language. Switching the interface does not translate user data or alter canonical option values. |
| B09 | Keep production services outside the current implementation. | Local file selection and ZIP packaging are built. Server uploads, bank/EMTA integrations, genuine authorization, file verification, received-offer parsing, independent co-applicant access and real negotiation sending remain unimplemented. Editable reviewed demo requests and local personal handoff are implemented. |
| B10 | Keep EMTA choices separate for each applicant and selected bank. | Nothing is preselected. Record status, time and demo text version; permit refusal/withdrawal. A demo choice never becomes genuine authorization. Exact bank scope and the accepted process remain unverified. |
| B11 | Keep six illustrative previews separate from the canonical dataset. | Research-backed partial form differences are demonstrated for LHV/Luminor; the other four previews are preparation summaries with unmapped shared data and gaps. Preserve income currency, household meanings and unknown mappings; adapters are partial and never sent. |

## Prefill visibility correction — v5.1, 10 October 2026

The owner could not see the promised automatic-prefill references. The previous first step hid the source controls, and provenance badges described only the current fictional value. Keep the overview and demo actions visible from the initial loan-goal step. Individual fields now show a potential future source separately from current-value provenance, with manual entry/confirmation explicit for other fields. A source demo opens the data step, fills blanks only and explains when nothing changed. EMTA examples no longer invent contract type or exact tenure. No integration, genuine access/permission, field extraction or bank requirement is established by these hints.

## Collaboration workflow

The project chats proposed the following team workflow; it is a recommended convention, not an enforced GitHub branch rule:

1. Describe one task in an Issue or task brief, with its intended result.
2. Use a task-specific branch when collaborators work in parallel.
3. Read the shared context files, make focused changes, and update affected documentation.
4. Run checks relevant to the change and describe what was and was not verified.
5. Use a pull request for teammate review before merging to `main`.

An explicit owner instruction to commit directly to `main` is sufficient authorization for that task; do not add another approval step for work already requested. No branch protection or CI requirement has been configured by this documentation change.

GitHub Desktop keeps a collaborator's local clone in sync: fetch remote changes and pull available updates before starting work. Repository access must still be granted separately; a ChatGPT conversation or installing Desktop does not grant it.

## Open decisions

- Which complete bank specifications and submission channels can be confirmed?
- What genuine co-applicant and recipient-specific disclosure flow should a live service use?
- How will genuine received offers, variable rates, financed fees and different schedules be compared? Demo manual intake and constant-rate detailed comparison are implemented.
- What operating model, regulatory review, security and retention design are appropriate before launch?
- What business model and pricing should be used?
- Is a hosted demo needed, and where should it run? There is no hosted deployment yet.
- Which team members, reviewers and repository permissions will the owner choose?

Keep new proposals marked proposed until accepted. For a changed decision, retain its ID, explain the replacement and date, and update [project-brief.md](project-brief.md), [../README.md](../README.md) and [../AGENTS.md](../AGENTS.md) where relevant. Update [bank-field-matrix.md](bank-field-matrix.md) only when the underlying evidence changes.
