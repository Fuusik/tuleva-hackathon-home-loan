# Tuleva Hackathon - One Home Loan Application

One application. Multiple Estonian banks. Comparable offers. Better-informed negotiation.

## Idea

We help people buying, building or refinancing a home reduce repeated paperwork and make informed borrowing decisions by creating one reusable application, a clear comparison of bank offers and a guided negotiation workflow.

Today, applicants repeat similar information across different bank forms and receive offers with different structures. Our proposed service collects a shared applicant profile once, maps it to each bank's requirements and helps applicants compare the complete cost and conditions of borrowing.

This is a hackathon concept associated with the Tuleva hackathon project. It does not imply that Tuleva or any bank endorses the service or has agreed to integrate with it.

## User journey

1. Choose purchase, construction, renovation or refinancing.
2. Enter household, income, obligations, property and financing information once. Invite a co-applicant to complete their own information.
3. Select banks and review the information prepared for each recipient.
4. Export an application package and follow the bank's application process. A future integration could support authorized submission.
5. Add received offers and compare costs and conditions on the same assumptions.
6. Prepare a factual negotiation request, review it and decide whether to send it.

## Hackathon MVP

- A guided shared application with conditional questions and a document checklist.
- Bank-specific completeness checks based on documented mappings.
- Exportable application summaries; label them as summaries, not accepted native bank forms.
- Manual entry of offers, with clearly labelled fictional examples for the demo.
- Comparison of margin, benchmark and reset period, repayment schedule, fees, monthly payment, insurance/account conditions, early repayment terms and offer expiry.
- A negotiation draft that uses actual competing offers only when supplied by the applicant.

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

Download the repository using GitHub's Code menu > Download ZIP, extract it, and open `index.html` in a browser. No installation, server, paid AI API, or API keys are required.

The prototype provides a partial shared form, conditional construction/renovation and refinancing questions, fictional annuity offer scenarios, and a reviewed JSON summary download. Entries exist only in page memory. It does not implement a complete bank form, document upload, co-applicant access, bank submission, offer document parsing, or negotiation drafts.

JavaScript syntax and the annuity formula's zero-rate, reference-payment and rate-sensitivity cases were checked. Browser interaction and visual QA have not yet been performed.

Suggested build order: shared form  conditional validation  exports  manually entered offer comparison  reviewed negotiation drafts. Validate mappings with banks and review the operating model before adding live submissions.

## Demo acceptance criteria

- A fictional household can complete a purchase application without re-entering shared information for each selected bank.
- Missing and unverified requirements are visible before export.
- Construction and refinancing reveal their own follow-up questions.
- Offers with different benchmark periods or repayment schedules cannot silently appear equivalent.
- No demo action sends personal information or messages to a bank.