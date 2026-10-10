# Continuous application and offer workflow — v6

Implemented 10 October 2026. Browser-local, fictional and demo-only. This walkthrough describes expected behavior; it is not a claim of completed browser testing.

## Try the current journey

1. Fetch/pull and open index.html; confirm **v6**, Estonian and the reload/data-loss warning. Start blank or load the explicitly fictional example. The application contains five sections in one scroll: goal, applicants, home/financing, documents, review. No separate data/source or check-answer modes.
2. Choose purchase/construction/renovation/refinancing. A purchase may have a chosen home or still be looking. Searching defers address/valuation and their files; bank previews still list later-stage gaps and unverified acceptance of an initial request.
3. In Applicants, inspect compact prefill guidance and expandable synthetic source examples. Hints beside relevant fields describe possible future sources separately from provenance. Fill blanks only, preserve existing answers, explain a no-op without changing revision/review. Enabling a co-applicant creates independent fields, source examples, files and choices.
4. Declare income/debt/limits as none or provide rows; an unanswered declaration is not none. Shared living expenses exclude entered loan repayments. Dependants/children and income/disposable money remain different concepts. Bank extras appear only after relevant bank selection; their mandatory status remains unverified.
5. Enter loan and cash contribution. Purchase price is derived from those values; missing is not zero. MES illustration adds explicitly entered other funding without assuming approval. Valuation is separate; guarantees/collateral do not increase cash. Construction has a separate project/stage budget; refinancing uses remaining months and retains debts marked for replacement.
6. Open repayment explanations. At the same amount, term and example total rate, annuity has a level constant-rate payment; equal principal starts higher and declines, with lower total interest. Examples show first/last payments and interest, excluding fees. A preference or ask-for-both option is not bank commitment.
7. In Documents, add fictional primary/co-applicant statements and active property valuations. Enter period/account coverage and valuation date separately; filenames do not verify them. Supporting evidence is optional/expandable. Files are not parsed or uploaded.
8. At Review, choose any of the six banks. See bank gap counts/links, relevant extra questions and optional separate EMTA demo choices. Submit with missing/invalid shared answers to see a linked correction summary and field messages. A completed shared checklist still needs bank verification.
9. Confirm shared answers and each active person's named recipients, then **Edasta valitud pankadele — demo**. All selected recipients are simulated together; nothing is sent. Inspect optional bank forms: two deeper partial mappings and four preparation summaries. Editing the application clears preparation and hides offer continuation.
10. Open Offers after preparation. Add manual demo terms or try generic fictional offers; no historical household examples or replacement controls exist. Cards show original amount, calculated first payment using the entered benchmark assumption, margin, known cost subtotals, own-funds gap and conditions. Unknown costs remain unknown.
11. Expand assumptions/details for principal/term normalisation, benchmark/reset/horizon, decision/evidence gaps, costs and versions. Original amount/term/funding never changes because a hypothetical scenario is chosen. Monthly differences come from payments; horizon costs are not divided into claimed monthly savings.
12. Optional final-offer requests: choose one to three favourite banks and competitor fields, edit text and fictional example.test recipients, review each, simulate one round. Relevant edits stale the draft. After the round take over communication; add manual reply versions/actions/questions. Contract checks compare entered promises with draft terms, without parsing/legal certification.
13. Existing reviewed JSON/ZIP export remains under an optional section. Review active profiles and summary; invalid values block download, missing answers stay explicit. ZIP includes original active files. Reload/reset clears page-memory state. No new draft import, save/reopen capability or testing programme was added.

## Source policy

Potential-source hints describe future possibilities, not current connections. Smart-ID identity covers name/personal ID after genuine authentication validation; personal-ID entry alone is not sign-in. Employment needs a separate permitted source; the demo does not invent exact tenure or contract type. Statement suggestions do not establish net income/classification, all-account coverage, debt balances or approved limits. Acknowledgements remain manual. Selected files are never read; no PINs/passwords/keys are requested.

## Calculation definitions

EUR constant-rate monthly annuity/equal-principal scenarios only; benchmark is entered, not fetched. Different currencies, benchmark/reset basis, unsupported schedules and expired offers are withheld. Common offer savings also require the same schedule, amount and term. Normalisation is explicitly hypothetical and never establishes bank willingness to lend. First/last equal-principal payments differ; simple fixed-month payback is not calculated for that schedule.

- Upfront costs: contract, valuation, notary, state, guarantee, other; switching also requires exit cost.
- Percentage fee: model principal × percentage, bounded by entered minimum/maximum.
- Reimbursement: once, confirmed only, at most entered eligible cost and cap.
- Recurring costs: insurance/account/other; temporary account price only for its entered promotion period. Later price must be known for complete totals. Compare insurance protection separately.
- Horizon borrowing cost: interest plus net upfront/recurring costs; excludes repaid principal. Remaining principal is separate.
- Full-term outflow: actual schedule payments plus costs, including principal; it does not multiply a declining first payment by all months. APR is supplied only.
- Simple payback: additional upfront cost / positive monthly outflow reduction for complete stable same-term annuity scenarios, without temporary account pricing. Limited arithmetic, not total economic benefit.
- Conditional breach: surcharge from month one as stress assumption, not predicted bank action timing.

Unknown costs suppress complete totals/payback. Labelled known subtotals/interest differences may remain visible. Variable future rates, financed fees and premium changes need additional modelling. No ranking, realised savings or guaranteed service return is produced.

## Implementation and verification

Schema v6 removes historical-case state and adds property-search/other-funding preparation fields. app-application defines shared requirements and correction paths; app-model handles data/calculations; documents/workflow/offers/negotiation preserve local evidence boundaries. The compact source UI and offer continuation compose through app-stages-ui and the inline controller. The v6 translation dictionary is merged into app-i18n.

There are 90 passing Node tests, including independent amortization formulas, purpose/person correction paths, property-file exclusion, mixed-schedule guards, six-bank recipient isolation and negotiation staleness. Syntax/static/local-resource/UTF-8/translation/doc-link/network checks pass. Actual browser interaction/layout remains unverified because browser infrastructure was unavailable; no user test or accessibility certification is claimed.
