# Shared application and offer workflow — v5.1

Implemented 10 October 2026. Everything is browser-local and demo-only.

## Manual walkthrough

1. Open index.html and confirm the header says **v5.1**. The automatic-prefill overview and source-demo buttons must already be visible in **Laenu eesmärk / Loan goal**. Check banks, amount, budget and one term input. Choose **Vaata välju ja nende võimalikke allikaid / View fields and their potential sources** to reveal the applicant fields. Each field shows both potential future source/manual entry and current-value provenance. Start blank and try each source: it opens the data step and adds only fictional blank-field values. On an already populated example it must explain that no value was changed, and preserve review if nothing changed. No files are parsed and no registry is queried.
2. Enable a co-applicant and select them in the source selector. Their examples, files and EMTA choices must remain independent. In **Kontrolli vastuseid / Check answers**, filter unanswered fields, then restore the full view to correct existing answers. Hidden answers remain in the dataset. Current-value badges and counters indicate example-prefill/manual/missing, not identity or factual verification. Potential-source hints remain separate, including after editing or switching ET/EN.
3. Check five shared sections. In bank readiness, fill a supported extra and confirm it updates the same shared field. Missing files, statement period/account coverage, optional EMTA choices and unverified requirements remain visible.
4. Select any/all six banks. Review every person's mapped data for each recipient; run each local simulation. LHV/Luminor are deeper partial illustrations. Swedbank/SEB/Coop/Bigbank are preparation summaries; their unmapped data is not a verified native form. Coop's illustrative refinancing view excludes debts flagged for replacement while canonical data retains them. Nothing is transmitted, authorized or received by a bank.
5. Open comparison. Selected simulations enable generic fictional offers; historical cases and manual demo intake also work independently. Loading a case asks before replacing financing fields/offers; it retains local files, clears shared/recipient/export reviews and starts a fresh case negotiation draft. Budget/property and benchmark/reset assumptions are fictional or marked assumptions. Historical prices are not live quotes.
6. Compare original financing with equal-amount/equal-term modelling. Inspect evidence, decision stages, inherited fields, funding gaps, original-term interest and term extension. Select two offers/current-loan alternatives. Test 0/2/4% sensitivity, breach surcharge, percentage fees, temporary account pricing, capped reimbursement and switching exit cost. Blank unknown fees must prevent complete totals. An unconfirmed reimbursement is excluded.
7. Add an improved version; original price remains in history. Choose one to three different favourite banks, competitor offers and shared fields. Prepare requests, edit message/fictional example.test recipient and review each. Changing recipient, content, offers, assumptions or disclosure selection withdraws review or makes the request stale. One simulated round is permitted; no email or attachment is sent.
8. After the round, record contact, next action, deadline, questions and reply notes. Add a reply with date/margin and only reconfirmed other fields; unchanged fields stay inherited. The original request snapshot survives and later offers make it stale without starting another automatic round. Download the local handoff JSON; it contains financing/offers/actions and document metadata, no original-file bytes or applicant identity profile.
9. Select an offer in contract checking and manually enter draft terms/reference. Inspect matching, changed, missing and unknown promises; inherited evidence remains marked. There is no document parsing, signature/validity verification or legal approval.
10. Switch ET/EN throughout: canonical entries, source selections, offers, draft messages, manually entered reply fields, files and choices must survive. User-entered/previously loaded descriptive text is preserved, including already prepared letter text.
11. Review/export: invalid values block download, incomplete answers stay explicit. Profile/summary review is required. Extract ZIP to verify original bytes and active-owner metadata. Edit during packaging to confirm an outdated download is cancelled. Reload/reset clears all page-memory state.

## Potential sources and current provenance

The top overview and field hints describe proposed future prefilling, not current connections. Smart-ID identity hints cover name and personal ID only; the [official client documentation](https://github.com/SK-EID/smart-id-php-client#extracting-user-identity) describes identity fields after successful authentication validation. Employment hints are separate, conditional on permitted access and appropriate permission; [EMTA's employment-register overview](https://www.emta.ee/ariklient/registreerimine-ettevotlus/tootamise-register) does not establish this project's entitlement or integration.

Statement hints cover possible income/recurring-expense and statement-period suggestions for user review. They do not establish net income, correct classification, all-account coverage, debt balances or approved credit limits. Loan choices, property information, contract type/tenure and acknowledgements stay manual in this source policy. Selected files are never read. Current provenance comes from actual demo actions/manual edits, never from a potential-source hint. The export continues to record no identity verification, registry query or file parsing.

## Cost definitions

EUR annuity, constant selected benchmark/margin and monthly intervals. The selected benchmark is an assumption, not fetched Euribor. Unsupported currencies, benchmark/reset mismatches and special schedules are withheld. Live expired offers are withheld; historical cases remain visibly historical snapshots.

Original financing uses the offer's amount/term and user budget/own funds. Normalised calculations deliberately substitute a common principal/term and never establish bank willingness to lend those amounts. Original-term payments/interest are separate scenarios; do not call their differences same-term savings.

- Upfront costs: contract, valuation, notary, state, guarantee and other costs; switching additionally requires a stated exit cost.
- Percentage contract fee: principal × percentage, bounded by entered optional minimum/maximum. For normalisation it uses the model principal.
- Confirmed reimbursement: subtract at most the eligible entered cost and cap, once. Unconfirmed rebates do not reduce totals.
- Recurring costs: selected insurance, account and other costs. Temporary account pricing applies only during its stated months; later price must be known for complete totals. Compare insurance cover/requirements separately; a premium buys protection.
- Horizon borrowing cost = interest + net upfront costs + recurring costs over the capped horizon. It excludes repaid principal; remaining principal is shown.
- Full-term outflow = loan payments + net upfront + recurring costs; it includes principal. APR is only as supplied.
- Simple payback = additional known upfront cost / positive monthly outflow reduction, only with complete stable same-term costs and no temporary account pricing. This is limited cash-flow arithmetic, not full economic benefit.
- Conditional breach view adds surcharge from month one for a stress scenario; it does not model the actual date/discretion of a bank action.

Unknown costs suppress complete totals/payback; labelled known-cost subtotals and interest-only differences can be shown. Past costs should not be charged again when comparing continuation with future alternatives. Financed fees, variable future benchmarks, premium changes and special schedules need further modelling. No ranking, realised savings, promised service return or forecast is produced.

## Implementation and export

Schema v5 adds provenance, all-six recipient simulations, historical case/version state, cost assumptions, one demo negotiation snapshot, personal actions and manual contract comparison. Original files and per-person/per-bank optional EMTA choices follow [document-permissions.md](document-permissions.md).

Modules: app-model/documents/workflow/offers; app-cases for anonymised cases; app-negotiation for one-round/version/contract rules; app-prefill for potential-source policy; app-guided-ui and app-offer-journey-ui for new flows; app-stages-ui and the inline controller compose them. Both stage dictionaries and app-v5-i18n are merged into app-i18n. The v5.1 UI correction does not change the v5 export schema or bank mappings.

The suite has 77 passing Node tests, including five potential-source policy checks. Syntax/static/local-resource/Unicode/translation/network-boundary checks also pass. Browser infrastructure was unavailable; interaction and visual verification are still outstanding and are not inferred from Node results.
