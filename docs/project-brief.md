# Project brief

Last updated: 10 October 2026.

## What we are building

One reusable home-loan profile for multiple Estonian banks, followed by comparable offers and a guided, applicant-reviewed negotiation workflow.

The main consumers are Estonian-speaking people buying, building, renovating or refinancing a home. The interface opens in Estonian and offers English through an ET / EN switch. This is an independent Tuleva hackathon concept; bank or Tuleva endorsement and integration have not been established.

## Problem and value proposition

Applicants repeat similar household, employment, income, debt and property information in different bank forms. Differences between application fields and offer conditions make it difficult to know what is missing and compare alternatives fairly.

**Value proposition:** We help people seeking a home loan reduce repeated paperwork and make better-informed borrowing decisions by creating one reusable application, transparent bank checklists and an offer comparison on shared assumptions.

This summarizes the project discussions; it is not a verbatim transcription of the workshop sheets. Reduced effort, better offers and demand for the service remain hypotheses to validate with users.

## Intended end-to-end journey

1. Choose the loan purpose and banks to consider.
2. Complete a shared applicant and household profile, including an optional co-applicant.
3. Review missing researched information and requirements still needing bank verification.
4. Review the data prepared for each bank and follow its accepted application route.
5. Add received offers and compare their costs and conditions using the same assumptions.
6. Prepare a factual negotiation request and let the applicant review and choose whether to send it.

Steps involving bank submission, genuine co-applicant access and negotiation are future work. In the current demo, both fictional profiles are entered on one device and nothing is sent to a bank.

## Current prototype and future scope

| Area | Implemented demo | Future work / unresolved |
| --- | --- | --- |
| Shared profile | Primary and optional co-applicant identity, contacts and employment; repeated income, debts and separate credit limits; household and financing details | Genuine identity verification, separate access and control of disclosures |
| Property and loan purpose | Main property, optional additional collateral, valuation metadata, EIS target group, construction/renovation questions and refinancing flags | Confirm eligibility rules, document acceptance and all purpose-specific branches with banks |
| Bank checklists | Swedbank, SEB, LHV, Luminor, Coop Pank and Bigbank; missing researched items and unverified mappings shown separately | Complete, bank-confirmed field specifications and mandatory flags |
| Comparison | Editable fictional annuity scenarios using one principal, term and assumed benchmark; margin, contract fee, monthly payment and scenario total | Real offer intake, benchmark/reset differences, APR as supplied, insurance/account conditions, expiry and early-repayment terms |
| Export | Reviewed canonical JSON summary, including unresolved gaps and selected interface language; invalid values block download | Accepted bank-specific forms, declarations, consents, attachments and submission channels |
| Negotiation | Product concept only | Applicant-reviewed drafts using genuine supplied competing offers; no fabricated offers or automatic sending |

The prototype uses synthetic information, works by opening `index.html`, and keeps entries only in page memory. Reloading clears them. There is no server, persistence, bank integration, document upload, authentication, paid AI API or API-key requirement.

## Research model

[The bank field matrix](bank-field-matrix.md) is the research baseline. Its six banks are an initial shortlist, not a complete register of lenders.

The original idea was to collect enough information for the most complex bank form. The research instead supports building the union of observed fields and checking each bank separately: no single most complex bank has been verified, and a long form does not prove coverage of other banks.

- **F:** a field was visible in a public form/PDF.
- **D:** a document or topic appeared in official guidance.
- **?:** the mapping has not been verified.

F and D do not establish that a field is mandatory. Unknown is not the same as absent, zero or an explicit "none". Filling every implemented field does not make an application bank-ready. Every bank retains a verification warning.

Preserve separate meanings: credit limits versus loan balances; dependants versus children under 18; household disposable money versus income; original currencies and frequencies; canonical refinanced debts versus recipient-specific export rules. The current JSON export is canonical and does not implement a native Coop export.

## Demo success criteria

- A fictional applicant can enter shared information once and see checklists for selected banks.
- A co-applicant's identity, finances and evidence remain separate.
- Relevant questions appear for construction, renovation, refinancing and additional collateral.
- Missing information and verification gaps stay visible during review and export.
- ET / EN switching preserves entered values, repeated rows and selected banks.
- Invalid values cannot be downloaded; incomplete answers remain explicitly incomplete.
- Comparison results stay labelled fictional and use compatible calculation assumptions.
- No demo action submits applicant information, documents or messages to a bank.

## Open questions and next work

1. Do users find the shared profile easier, and where do they abandon or misunderstand it?
2. Which fields, options, formats and mandatory/conditional rules do banks actually require? Confirm each purpose and co-applicant branch.
3. Which banks accept a shared summary, through which channels, and under what agreements?
4. How will each person review and control their own data and bank-specific declarations in a live service?
5. How should offer intake handle benchmark periods, repayment schedules, costs and missing terms without implying a false ranking?
6. What operating model, regulatory review and data-handling design are needed before a live launch?
7. What sustainable business model avoids conflicts with the applicant's interests? Pricing and revenue are not agreed.

Suggested implementation order: improve the shared form and conditional checks, verify exports, develop manual offer intake, then add reviewed negotiation drafts. Bank verification and live-service design remain separate workstreams.

## Shared context

This file is a project summary, not an archive of private chats. [decisions.md](decisions.md) records decisions and their status. [../README.md](../README.md) explains setup and collaboration. [../AGENTS.md](../AGENTS.md) guides coding assistants. Update these files when an accepted decision changes so collaborators do not need access to another person's ChatGPT history.
