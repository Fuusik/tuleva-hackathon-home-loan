# Tuleva Hackathon — One Home Loan Application

One reusable application for Estonian banks, transparent offer comparison and a reviewed final-offer request.

The main problem is repeated application work: consumers enter similar information and documents in several bank journeys, often giving up before collecting comparable offers. Our demo keeps one checked dataset, shows recipient-specific gaps and helps the applicant compare and negotiate later offers. It is an independent hackathon concept; no Tuleva or bank endorsement, integration or acceptance is established.

## Run and try v5

In GitHub Desktop, use **Fetch origin**, then **Pull origin** when offered. Open `index.html` from the repository folder and refresh with Ctrl+F5. Alternatively, download and extract GitHub's Code > Download ZIP. Keep all local scripts and `vendor/` beside the page. No installation, server, paid AI API or credentials are required to run it.

The interface starts in **Estonian**, with **ET / EN** in the header. Data is held in page memory; reload discards it. Use fictional identities, `DEMO-...` identifiers, `example.test` emails and fictional documents.

1. **Shared form:** start with the loan goal, then data/source examples and checking. Source badges distinguish built-in examples, simulated Smart-ID/EMTA/statement data, manual entries and missing answers. Simulated sources fill blank fields only. Filtering hides answered fields without deleting them. Smart-ID buttons do not authenticate; no files are parsed or registries queried.
2. **Readiness:** see shared gaps once, bank-specific researched extras, separate applicant/co-applicant documents and optional per-person/per-bank demo EMTA choices. Every bank still has unverified requirements.
3. **Simulation:** review the shared sections and each active person for each selected bank. All six banks have local previews. LHV/Luminor are deeper partial forms; the other four are preparation summaries with unmapped shared data and explicit gaps. No information, file, consent or request is transmitted.
4. **Comparison:** enter demo offers or load one of three anonymised historical cases: 2020 purchase, 2025 house purchase or 2025 existing-loan improvement. Case loading replaces financing fields/offers after confirmation, retains local files and clears review. Case terms are historical; identities, property budgets and model assumptions are synthetic or explicitly estimated.
5. **Final-offer round:** choose up to three favourite banks, choose competitor offers and fields to disclose, prepare editable requests and review each fictional recipient. Simulate one round, then take over communication. Add replies manually as new versions, record contacts/actions/questions and download a local handoff summary.
6. **Contract and export:** manually compare promised terms with draft terms; matching entries do not establish legal validity. Review current profiles and summary to download JSON metadata or a ZIP preserving active original-file bytes.

See [the walkthrough](docs/workflow-demo.md) for details and [the historical examples](docs/demo-cases.md) for data limitations.

## Comparison behaviour

- Original financing is separate from hypothetical equal-amount/equal-term modelling. Different offered amounts remain visible with funding and own-funds gaps. Normalisation never increases a bank's lending decision.
- Offer date, decision stage, evidence, previous version and inherited/unconfirmed terms stay visible. A later margin does not reconfirm earlier amounts, terms or fees. Manual edits remain marked as demo entries.
- Supports constant-rate EUR annuity scenarios, remaining terms in months, selected benchmark/reset assumptions, upfront/recurring costs, percentage contract fees, temporary account pricing, capped reimbursements and explicit switching exit costs.
- Conditional income routing shows share, duration and breach surcharge. The breach view assumes the surcharge from month one as a stress scenario, not a prediction.
- Compare another offer or the current loan; display original-term interest, term extension, same-term interest differences, complete horizon-cost differences and limited simple cash-flow payback. 0%, 2% and 4% are sensitivity assumptions.
- Blank costs are unknown; explicit zero is an absent cost. Unknown costs prevent complete totals and payback. Interest-only differences and known-cost subtotals are labelled. Horizon cost excludes repaid principal; full-term outflow includes it. APR is recorded as supplied, never calculated here.
- No cheapest-bank ranking, approval recommendation, future Euribor forecast, realised-savings claim or guaranteed service return. Pricing, including any proposed €99 fee, is not agreed.

## Shared project context

| File | Purpose |
| --- | --- |
| [docs/project-brief.md](docs/project-brief.md) | Problem, consumer journey, implemented scope and open questions |
| [docs/decisions.md](docs/decisions.md) | Accepted decisions and current baseline |
| [docs/bank-field-matrix.md](docs/bank-field-matrix.md) | Dated research, evidence and unverified mappings |
| [docs/document-permissions.md](docs/document-permissions.md) | Files, demo permission choices and exports |
| [docs/workflow-demo.md](docs/workflow-demo.md) | Walkthrough and calculation boundaries |
| [docs/demo-cases.md](docs/demo-cases.md) | Anonymised historical terms and modelling assumptions |
| [AGENTS.md](AGENTS.md) | Coding-assistant boundaries and checks |

## Validation

```sh
node --test tests/model.test.js tests/i18n.test.js tests/documents.test.js tests/workflow.test.js tests/offers.test.js tests/journey.test.js
```

There are 72 passing Node tests: the original 50 plus 22 covering six-bank recipient isolation, remaining months, case-study arithmetic/privacy, conditional costs, normalisation, one reviewed round, stale requests, versions and contract comparison. JavaScript syntax, static IDs/local dependencies, Unicode, translation coverage and absence of network/persistence hooks are checked separately.

Browser interaction and visual layout remain unverified: the browser infrastructure was unavailable. Follow the manual walkthrough before a presentation; Node tests do not prove the page's interaction or layout.

## Production boundaries and collaboration

Live identity verification, permitted registry/open-banking access, document extraction, separate co-applicant accounts, secure storage, accepted submission channels, genuine authorization, email sending and offer parsing remain future work. Never request bank passwords or Smart-ID/Mobile-ID PINs. Confirm the operating model, regulatory classification, agreements, security and data-retention rules before a live launch; see [Finantsinspektsioon's credit-intermediation entry](https://fi.ee/et/pangandus-ja-krediit/krediidivaldkonna-tegevuslubade-taotlemine/krediidivahendaja-tegevusluba).

Use GitHub for shared context. Prefer focused task branches and pull requests for parallel collaborator work; explicit owner instructions to commit to main still apply. Fetch/pull before editing, preserve unrelated changes and update affected docs. There is no hosted deployment or bank integration.
