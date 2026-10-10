# Tuleva Hackathon — One Home Loan Application

One shared application for Estonian consumers, followed by offer comparison and a reviewed final-offer request. The value proposition is less repeated application work and clearer financing choices. Reduced effort and willingness to pay remain hypotheses, not measured benefits. This is an independent demo; no Tuleva or bank endorsement, integration or acceptance is established.

## Run v6

In GitHub Desktop choose **Fetch origin**, then **Pull origin** when offered. Choose **Repository → Show in Explorer**, open `index.html` and refresh with **Ctrl+F5**. The header should say **v6**. Keep the scripts and `vendor/` together. No installation, server, account, paid API or credentials are needed.

Estonian is the default, with **ET / EN** in the header. The application starts blank. Use only fictional identities, **DEMO-...** identifiers, **example.test** email addresses and fictional documents. All entries and file references disappear on reload; there is no automatic saving or reopening a downloaded draft.

## Current journey

1. **Laenu eesmärk → Taotlejad → Kodu ja rahastus → Dokumendid → Ülevaatus.** All five sections are in one freely scrollable form. Purchase, construction, renovation and refinancing reveal their relevant questions. For a purchase, a home can still be unchosen; address and valuation then remain later-stage gaps to confirm with each bank.
2. Enter each person's activity, income, debts and credit limits, plus shared household information once. Only selected-bank extras are shown. Fields required by the shared demo are distinct from researched bank questions whose mandatory status is unverified. Optional information stays compact. A visible completion count and linked/inline corrections help review.
3. Potential automatic-prefill hints are beside relevant fields. A compact overview in Applicants explains Smart-ID identity versus separately permitted EMTA/statement sources. Expand the source examples to fill blank fields with synthetic values; existing answers are preserved. There is no sign-in, registry query or file reading.
4. Purchase budget is calculated from requested loan plus cash down payment, plus explicitly entered other financing when the MES illustration is selected. Guarantees/collateral are not cash, and valuation is separate. Construction budgets and refinancing amount/remaining months stay separate. Annuity and equal-principal explanations include a constant-rate example based on the entered amount and term; the user can ask the bank to calculate both.
5. Add statements and supporting files for the primary/co-applicant and valuation files for active properties in one Documents section. Choose banks at review; see each bank's researched gaps and unverified topics. Optional EMTA demo choices remain separate per person/bank. Check shared answers and each active person's selected recipients, then choose **Edasta valitud pankadele — demo**.
6. All selected banks are simulated locally together. All six have illustrative previews; LHV/Luminor have deeper partial mappings, while the other four remain preparation summaries. Nothing is sent or received by a bank. Application edits clear review/simulations and hide offer continuation until prepared again.
7. Offers open after preparation. Enter demo terms or try explicitly fictional offers. First see amount, modelled first payment, margin, known costs, funding gap and conditions. Detailed assumptions, calculations, evidence gaps and versions are expandable. **Historical household cases have been removed.**
8. Optionally prepare one reviewed final-offer round for up to three favourite banks, choosing which competing terms to disclose. Simulate with fictional recipients, then take over communication. Manual replies, handoff actions and promise-versus-contract checks remain available. No messages or attachments are sent.
9. The existing reviewed JSON/ZIP preparation-package download remains optional. It preserves active original file bytes and explicit gaps; it does not save a reopenable draft or become an accepted bank application.

See [the walkthrough](docs/workflow-demo.md), [project brief](docs/project-brief.md), [decisions](docs/decisions.md), [bank research](docs/bank-field-matrix.md), [document boundaries](docs/document-permissions.md) and [coding instructions](AGENTS.md).

## Comparison limits

Constant-rate EUR annuity and equal-principal calculations use entered benchmark assumptions, not live Euribor. Original financing remains separate from hypothetical equal-amount/equal-term modelling; normalisation never increases a bank's offered amount. Mixed schedules, currencies or benchmark/reset assumptions do not produce a common savings comparison. For equal principal, the first payment is not a fixed monthly payment and simple payback is withheld.

Keep unknown versus explicit zero, original offer stage/evidence and inherited terms distinct. Include upfront/recurring costs, percentage fees, temporary account pricing, confirmed capped reimbursements, conditional breach stress and switching exit fees. Unknown costs prevent complete totals/payback. Horizon borrowing cost excludes repaid principal; full-term outflow includes it. APR is recorded only as supplied.

The budget summary compares actual modelled payments, initial costs and a chosen cost horizon; it does not divide a long-term total into a claimed monthly saving. No bank ranking, approval, guaranteed savings, representative household result, measured time saving or agreed service price is asserted.

## Checks and collaboration

Run `node --test tests/*.test.js`. The suite has 90 tests covering model, language, documents, workflow, offers, negotiation, source policy and the new preparation/calculation rules. Syntax, local resources, translation coverage, UTF-8, documentation links and absence of network/persistence hooks were also checked. Actual browser interaction and layout remain unverified because browser infrastructure was unavailable.

Use GitHub for shared context. Prefer focused branches/PRs for teammates; the owner's explicit direct-main instructions apply here. Preserve unrelated changes and update docs when behavior changes. No hosted deployment, production integration, new draft-save feature or separate user/mobile/accessibility testing programme was added in this revision.
