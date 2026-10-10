# Tuleva Hackathon - One Home Loan Application

One application. Multiple Estonian banks. Comparable offers. Better-informed negotiation.

## Shared project context

Collaborators and their coding assistants can use this repository without access to another person's ChatGPT history. The docs summarize the project discussions and the current implementation; they are not a transcript of private chats.

| File | What to read it for |
| --- | --- |
| [README.md](README.md) | Purpose, target users, setup and current demo status |
| [docs/project-brief.md](docs/project-brief.md) | Problem, value proposition, intended journey, scope and open questions |
| [docs/decisions.md](docs/decisions.md) | Confirmed decisions, implementation baseline and proposed team workflow |
| [docs/bank-field-matrix.md](docs/bank-field-matrix.md) | Bank research, dated sources and mappings still needing verification |
| [AGENTS.md](AGENTS.md) | Coding-assistant conventions, demo boundaries and relevant checks |

Start with this README and the project brief, then read the decisions and relevant bank matrix sections. Coding assistants should read AGENTS.md before changing code. Update the affected context files when an accepted decision changes.

The recommended team workflow is one task-specific branch per parallel task, focused changes, relevant checks and a pull request for review before merging to `main`. An explicit owner instruction to commit directly to `main` still applies. See [docs/decisions.md](docs/decisions.md) for the distinction between agreed product decisions and proposed team practices.

## Idea

We help people buying, building or refinancing a home reduce repeated paperwork and make informed borrowing decisions by creating one reusable application, a clear comparison of bank offers and a guided negotiation workflow.

Today, applicants repeat similar information across different bank forms and receive offers with different structures. Our proposed service collects a shared applicant profile once, maps it to each bank's requirements and helps applicants compare the complete cost and conditions of borrowing.

This is a hackathon concept associated with the Tuleva hackathon project. It does not imply that Tuleva or any bank endorses the service or has agreed to integrate with it.

## Intended end-to-end journey

1. Choose purchase, construction, renovation or refinancing.
2. Enter household, income, obligations, property and financing information once. Invite a co-applicant to complete their own information.
3. Select banks and review the information prepared for each recipient.
4. Export an application package and follow the bank's application process. A future integration could support authorized submission.
5. Add received offers and compare costs and conditions on the same assumptions.
6. Prepare a factual negotiation request, review it and decide whether to send it.

## Target hackathon MVP (partly implemented)

- A guided shared application with conditional questions and a document checklist.
- Bank-specific completeness checks based on documented mappings.
- Exportable application summaries; label them as summaries, not accepted native bank forms.
- Manual entry of offers, with clearly labelled fictional examples for the demo.
- Comparison of margin, benchmark and reset period, repayment schedule, fees, monthly payment, insurance/account conditions, early repayment terms and offer expiry.
- A negotiation draft that uses actual competing offers only when supplied by the applicant.

The bullets above describe the target scope. The implemented demo is described under Repository status below; genuine co-applicant access, bank-specific accepted exports, real offer intake and negotiation drafts are not implemented.

The demo uses synthetic data. Real bank submission, identity verification, credit decisions, account-data access and autonomous negotiation are outside the initial MVP.

## Application design

Use the union of verified bank requirements rather than assuming that one bank's longest form covers every other bank. Keep reusable core data separate from bank-specific declarations, permissions and attachments. Ask conditional questions only when relevant to the selected loan purpose and banks.

The research baseline and proposed field model are in [docs/bank-field-matrix.md](docs/bank-field-matrix.md). Unknown mappings remain explicitly unverified.

## Offer comparison

Compare the same principal, term, benchmark date and repayment assumptions. Show initial and later payments separately for interest-only or special schedules. Show APR as provided by the bank alongside separately disclosed costs; do not assume APR includes every transaction or insurance expense. An indicative calculation is not a binding offer or a prediction of future Euribor.

Keep original offer documents, provenance, validity dates and missing values visible. Let the applicant choose priorities rather than labelling the lowest margin as automatically the best offer.

## Trust and launch requirements

- Never request or store internet-bank passwords, Smart-ID PINs or Mobile-ID PINs.
- In a production design, use secure storage, access controls, retention/deletion rules and an audit trail. Keep financial information out of logs and analytics.
- Require recipient-specific review before disclosure. Co-applicants must control their own disclosures. Marketing choices must be separate and optional.
- Confirm permitted submission channels and bank acceptance of exported data. Public forms are not evidence of a submission API or integration agreement.
- Resolve the service's regulatory classification before a live launch. Finantsinspektsioon describes mortgage credit intermediation as a regulated activity; the exact model needs review, including assistance before a credit agreement. A free demo alone does not establish a production exemption. See [Finantsinspektsioon](https://fi.ee/et/pangandus-ja-krediit/krediidivaldkonna-tegevuslubade-taotlemine/krediidivahendaja-tegevusluba).

## Repository status

Documentation baseline and first browser prototype created on 10 October 2026. No bank integration or hosted deployment has been implemented.

### Run the prototype

With a local clone, fetch and pull the latest changes in GitHub Desktop, then open `index.html` from the repository folder in a browser. You can also use GitHub's Code menu > Download ZIP and extract the files. No installation, server, paid AI API, or API keys are required to run the demo.

The interface opens in **Estonian** by default. Use the **ET / EN** buttons in the header to switch to English or back. Switching language preserves entered data, selected banks, repeated entries and the current page. Form labels, bank checklists, validation messages and export review are bilingual; user-entered text is preserved.

The expanded demo includes:

- Separate primary-applicant and co-applicant identities, contacts and employment details.
- Repeatable income, debt and credit-limit entries per person. Explicit "none" answers remain distinct from unknown answers; zero values are retained.
- Household expenses, dependants and children under 18 as separate values.
- Main property, optional additional collateral, EIS target group and valuation metadata.
- Conditional construction/renovation fields, and debt-level refinancing flags.
- A checklist for every selected bank with missing researched items, unverified mappings and source links. F/D evidence does not establish mandatory bank requirements. All banks remain labelled "Needs bank verification".
- Fictional annuity offer scenarios and a reviewed JSON export that includes outstanding gaps.

Use **Laadi näidisandmed / Load fictional example** or **Alusta tühjalt / Start blank**. Go to **Pankade kontroll / Bank checks** at any time, even with incomplete answers. For export, choose at least one bank and review each fictional applicant profile plus the summary. Invalid values block download; missing answers can remain in an explicitly incomplete draft. Editing the application clears earlier review confirmations.

Entries exist only in page memory. No data is submitted or uploaded. Co-applicants are entered on the same device; invitations, separate access, authentication and genuine bank consents are not implemented. The export remains a canonical summary, not a native bank form. No bank integrations, document uploads, offer parsing or negotiation drafts have been implemented.

Keep `index.html`, `app-model.js` and `app-i18n.js` together in the extracted folder. The page loads its local model and translation scripts and needs no external resources. JSON exports keep stable field keys and original application values, and include the selected `uiLanguage` plus localized checklist messages.

### Validation

Run the dependency-free model and language regression checks with Node.js:

```sh
node --test tests/model.test.js tests/i18n.test.js
```

The 14 model tests cover missing versus unverified requirements, unknown versus zero/none, repeated debt gaps, co-applicant isolation, household definitions, employment end dates, original income currency/frequency, conditional construction, refinancing debt retention, statement coverage, valuation format/age, additional collateral, numeric contradictions and annuity calculations. Six additional language tests cover the Estonian default, both language directions, canonical data preservation, bank checklist and field translation coverage, and safe template values. JavaScript syntax, HTML structure, unique static IDs and absence of persistence/network calls were also checked.

Automated browser launch failed in the current execution environment, so browser interactions and visual layout for this expanded version remain unverified. Manual checks: switch ET / EN on each page and confirm entries and selected banks are retained; add/remove repeated entries, toggle the co-applicant and purposes, inspect all six banks, change a reviewed draft and download its JSON. The original prototype was successfully opened and reviewed by the project owner.

Suggested build order: shared form → conditional validation → exports → manually entered offer comparison → reviewed negotiation drafts. Validate mappings with banks and review the operating model before adding live submissions.

## Demo acceptance criteria

- A fictional household can complete a purchase application without re-entering shared information for each selected bank.
- Missing and unverified requirements are visible before export.
- Construction and refinancing reveal their own follow-up questions.
- Offers with different benchmark periods or repayment schedules cannot silently appear equivalent.
- No demo action sends personal information or messages to a bank.