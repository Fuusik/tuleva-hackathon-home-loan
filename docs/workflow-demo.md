# Shared application, recipient readiness, simulation and comparison

Implemented on 10 October 2026 following the owner's four priorities. Reducing repeated bank applications remains the main purpose; comparing later offers strengthens that journey.

## Try the demo

1. Open `index.html`. The built-in fictional applicant profile is prefilled. Use **Laadi näidisandmed / Load fictional example** to reset it. Files and EMTA choices are deliberately not fabricated or preselected.
2. In **Ühine taotlus / Shared form**, inspect and edit financing, each applicant, household, property and evidence. At the bottom, review all five shared-data sections. Any application edit clears these confirmations. Both fictional profiles are entered on this device.
3. In **Pankade valmisolek / Bank readiness**, shared research gaps appear once. Each selected bank shows existing answers, its additional researched topics, file/EMTA preparation and unknown requirements. Missing supported extra fields can be entered here; they update the same canonical field in the shared form. Use the shared form for repeated entries, documents and other changes. F/D are research evidence, not verified mandatory flags.
4. In **Edastamise simulatsioon / Transmission simulation**, select LHV and Luminor, keep fictional `DEMO-...` identifiers and `example.test` emails, and review every active person's mapped data for each bank separately. Click **Simuleeri edastamist / Simulate local transmission** for each. A status and timestamp record a local simulation. No request, email, original file, authorization or bank receipt exists. Incomplete and unverified mappings remain visible.
5. In **Pakkumiste võrdlus / Offer comparison**, completing both current simulations enables the fictional examples. Manual demo entry is also available independently. Add the original offer source/reference, validity, terms, costs and conditions. These are fictional examples, never offers from LHV or Luminor.
6. In **Ülevaade ja eksport / Review & export**, inspect the current dataset, simulation records, offer assumptions/results and outstanding gaps. Review each fictional person and the summary to download JSON or a ZIP. JSON contains document metadata; ZIP includes the selected original active-owner files. Invalid application or offer values block export; unknown answers remain explicit.

Switching ET / EN preserves application values, local files, EMTA choices, shared reviews, per-recipient simulation reviews, simulations, manually entered offers and assumptions. User-entered and already loaded sample text is not translated. Reload/reset clears page-memory state. Offers remain visible with a warning after an application edit, while shared reviews and simulations are cleared; changed amount/term also prevents an equivalent comparison.

## One dataset and provenance

Prefill currently means a built-in synthetic profile, not extraction from documents or a registry. The shared review records the source (`fictional-example` or `blank`), current draft revision, section acknowledgements and timestamps. It does not certify factual accuracy. All normal fields remain editable, and blank differs from zero/none.

Bank extra questions write through to the existing form field. Their controls are shown only while the corresponding shared answer is absent and the conditional branch is active. The shared-versus-extra grouping is a UI design boundary, not a universal bank-confirmed list. Unknown banks/fields do not become mandatory or disappear.

`app-workflow.js` contains the review and partial recipient mappings; `app-stages-ui.js` renders them. `app-offers.js` handles comparison. `app-stage-i18n.js` supplements the existing bilingual translations. Schema version is 4.

## Two different illustrative mappings

| Aspect | LHV illustration | Luminor illustration |
| --- | --- | --- |
| Layout | Person-centred: identities, income, obligations and credit limits; financing and property | Loan request, applicants with income currencies, household and collateral |
| Household | All dependants and expenses | Children under 18 and separately entered disposable money |
| Credit limits | Separate from amortising debts | Exact recipient mapping remains unverified |
| Term | Amount/term mapping explicitly unresolved | Years converted to months in the illustrative mapping |
| Income | Original values and frequencies | Original net values, currency and frequency, without conversion |
| Evidence and permission | Metadata and only that recipient's demo choices | Metadata and only that recipient's demo choices |

Both adapters retain source links, evidence date, missing researched items and unresolved mappings. They are intentionally partial demonstrations based on [the matrix](bank-field-matrix.md), not exact live schemas, accepted files or browser automation against a bank. Actual declarations, co-applicant procedures, signing and submission channels remain unresolved. Neither adapter claims receipt, complete bank readiness or genuine consent.

## Cost comparison

All calculated examples use EUR annuity payments with the same principal, term, benchmark period and reset interval. Different currencies, principal/term, benchmark/reset period or special schedules are withheld from the equivalent calculation. Expired offers are flagged and withheld. The common benchmark is an editable assumption, not a fetched Euribor rate. Rate reset is six months in this demo scenario; it is checked against each offer. No ranking or recommendation is made.

- Upfront: contract, valuation, notary, state, guarantee and other fees.
- Recurring: chosen home/life/loan-protection insurance, account and other monthly costs.
- Other terms: provided APR, source/reference, expiry, insurance obligations/cover, early repayment and other conditions.
- Use explicit 0 for an absent cost; blank is unknown. Avoid double-counting insurance cover or a fee that is already in another line. Enter costs paid separately; financed fees need a future model.

With monthly annuity payment `P`, remaining balance `B`, monthly rate `r` and horizon `h` months:

```text
next balance = max(0, B + B*r - P)
horizon interest = sum of monthly B*r
horizon borrowing cost = horizon interest + upfront costs + recurring costs*h
monthly outflow = P + recurring costs
full-term outflow = P*termMonths + upfront costs + recurring costs*termMonths
```

Horizon is capped at the loan term. Horizon borrowing cost excludes repaid principal; remaining principal is displayed alongside it. Full-term outflow includes principal. Exit/early-repayment charges are not automatically included; review the entered terms separately. Notary/valuation and similar transaction costs are included for each alternative scenario, not summed across banks.

The benchmark, margin and entered costs stay constant over the scenario. Future changes and different insurance coverage are not priced. An unknown fee prevents a complete monthly/horizon/full-term total; a labelled known-cost subtotal may still be shown. Missing non-cost terms remain listed even when arithmetic is possible. APR is recorded as supplied, never computed or represented by these totals.

Cost categories were checked against Finantsinspektsioon's consumer guidance on 10 October 2026: [interest and fees](https://www.minuraha.ee/et/pangandus/laenud/intress-ja-muud-laenamisega-seotud-tasud), [home loans](https://www.minuraha.ee/et/pangandus/laenud/eluasemelaen). The sample amounts are invented, not statutory fee calculations or bank prices.

## Review and verification

Application edits invalidate shared section reviews, recipient reviews, simulations and export review. Offer/assumption changes invalidate export review without changing the application revision. Any such edit during asynchronous ZIP preparation cancels that old download even if the user reviews the new state meanwhile. Unchecking a shared or recipient simulation acknowledgement removes the affected simulation evidence.

The Node suite has 50 tests: the original 32 plus 8 workflow and 10 comparison tests. These cover stale reviews, conditional extras, per-person mappings, local-only result flags, unknown-versus-zero fees, full cost components, principal separation, incompatible offers, expiry, provided APR and translations. Syntax/static checks complement them. Browser interaction and visual QA remain unverified because the browser infrastructure did not start; do the steps above manually before a presentation.

Live integrations, real document extraction, received-offer parsing, persistence, genuine separate co-applicant access, negotiation messages and production authorization remain future work. [Document and permission details](document-permissions.md) continue to apply.
