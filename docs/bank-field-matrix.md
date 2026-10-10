# Estonian home loan application - bank field matrix

Research date: 10 October 2026. Scope: Swedbank, SEB, LHV, Luminor, Coop Pank and Bigbank as an initial retail-bank shortlist, not an exhaustive register of lenders.

## Evidence and limitations

This is a public-source research baseline, not a certified complete mapping of every bank's production form. No authenticated customer journeys were completed and no applications were submitted. Public HTML may omit dynamic questions, option values and mandatory-field flags. A PDF may differ from the current online journey.

Codes: **F** = field visible in a public application/PDF; **D** = document or topic described in official product/process guidance; **?** = not verified. F does not mean mandatory. ? does not mean the bank does not ask for it. Sources in column headings apply to their respective cells.

## Bank coverage

| Bank | Observed route | Remaining verification |
| --- | --- | --- |
| Swedbank [S1] | Public application and login option | Later-stage fields, dynamic branches and required flags |
| SEB [S2] | Product page provides application entry | Detailed application fields not verified |
| LHV [S3] | Detailed public form | Option lists, required flags and authenticated differences |
| Luminor [S4] | Three-page downloadable application | Confirm equivalence to current online form |
| Coop Pank [S5-S6] | Application entry and official checklist | Full application fields not verified |
| Bigbank [S7] | Home-loan product/application entry | Home-loan-specific form not verified |

Bigbank's generic application URL also surfaced a small-loan amount range; it was deliberately excluded as evidence of mortgage fields. No API, partnership or acceptance of third-party summaries has been verified for any bank.

## Field comparison

| Field group | Swedbank [S1] | SEB [S2] | LHV [S3] | Luminor [S4] | Coop [S5-S6] | Bigbank [S7] |
| --- | --- | --- | --- | --- | --- | --- |
| Purpose / amount / term | F | ? | Purpose F; amount/term ? | F | Purpose D | Amount/term D |
| Purchase price | F | ? | F | ? | ? | ? |
| Own contribution | F | D | F | F | D | D |
| Contribution source | F | ? | F | ? | ? | ? |
| Name / personal ID / contact / address | ? | ? | F | F | Identity document D | ? |
| ID issuer / residency | ? | ? | F | ? | ? | ? |
| Marital status / education | ? | ? | F | F | ? | ? |
| Dependants | ? | ? | F | Children under 18 F | ? | ? |
| Employer / occupation / tenure | ? | ? | F | F | ? | ? |
| Employment type / contract end | ? | ? | ? | F | ? | ? |
| Income type / amount | Income stage F | ? | F | F | D | ? |
| Income currency | ? | ? | ? | F | ? | ? |
| Debt lender / balance / payment / maturity | ? | ? | F | F | Obligations D | ? |
| Credit limits separate from debt | ? | ? | F | ? | ? | ? |
| Household regular expenses | ? | ? | F | ? | ? | ? |
| Household disposable amount | ? | ? | ? | F | ? | ? |
| Co-applicant | F [S8] | ? | F | F | D | ? |
| Property address / intended use | Details F | ? | Address F | F | Collateral D | ? |
| Listing URL | Free-text suggestion F | ? | F | ? | ? | ? |
| Additional collateral / guarantee | ? | EIS D | F | ? | EIS/MES D | EIS/MES D |
| Valuation report | ? | ? | F | ? | D | D |
| Construction evidence | Budget suggestion F | ? | D | ? | Calculation D | ? |
| Preferred repayment date | ? | ? | ? | F | ? | ? |
| Campaign code | F | D | F | F | ? | ? |
| Bank-specific declarations / marketing | F | ? | F | F | ? | ? |

## Important mapping differences

- LHV separates existing credit limits from amortising debts, and uses a co-applicant invitation followed by a separate application. Its public instructions request six months of statements; construction requires staged budgets, current/future valuation and a permit if available. Current valuations have an ASiC-E format requirement. [S3]
- Luminor includes income currencies, employment contract expiry, children under 18, a disposable-household-money question and repayment date. Do not map children under 18 directly to all dependants, or disposable money directly to gross household income. [S4]
- Swedbank explicitly asks for the source of the applicant's own contribution. Its public application has a separate income stage and bank-specific processing notices. [S1]
- Coop requests six months of statements for all existing accounts. Its refinancing guidance says not to enter the refinanced loan as an obligation in that bank's application. Preserve it in the shared model and exclude it only in the Coop export when applicable. [S5-S6]
- Bigbank describes both annuity and special repayment schedules. Preserve schedule type in comparison; the special schedule changes principal repayment timing. Its valuation guidance differs from Coop's. [S7]

## Proposed shared data model

The following is a design proposal, not a claim that every bank requires every field. Build the core from the observed union, then validate bank-specific mappings.

| Object | Proposed fields | Behaviour |
| --- | --- | --- |
| Application | ID, version, purpose, selected banks, desired amount, term in months, repayment preference, payment day, notes | Draft version changes invalidate earlier completeness results |
| Applicant[] | Role, name, personal ID and issuer, residency, address, email, phone, communication language | Separate access and disclosure review per person |
| Household | Marital status, dependants, children under 18, education, regular expenses, disposable amount | Preserve separate meanings; avoid double-counting shared expenses |
| Employment[] | Applicant ID, employer, sector, occupation, relationship type, tenure, contract expiry | Conditional for employed applicants; allow other statuses |
| Income[] | Applicant ID, type, net amount, currency, frequency, evidence reference | Preserve original currency; mark normalisation assumptions |
| Obligation[] | Applicant ID, lender, type, balance, monthly payment, maturity, refinanced flag | Retain refinanced loans; apply recipient-specific export rule |
| CreditLimit[] | Applicant ID, lender, type, authorised limit, used amount if known | Separate from loan balance |
| Property[] | Role, type, address, intended use, price/value, owner, listing URL, energy class if relevant | Purchased property and additional collateral are distinct |
| Financing | Own contribution, source, additional collateral, guarantee scheme/target group, other financing | Distinguish cash contribution from borrowed funds |
| Construction | Stage budgets, own/borrowed funding split, permits, current/future valuation | Only for relevant purposes; document readiness can block a bank export |
| Document[] | Owner, type, filename, format, period/date, recipient, availability | Preserve signed originals; do not convert ASiC-E to PDF as a substitute |
| RecipientReview[] | Bank, applicant, selected data/documents, declaration version, reviewed timestamp | Separate optional marketing from application disclosures |

Energy class, used credit amount and model versioning are proposed additions; their exact bank-form mappings remain unverified. Use decimal money values with currency codes and ISO dates. Keep unknown values distinct from zero. Avoid storing identity documents in the hackathon demo.

## Conditional document checklist

| Trigger | Collect or track | Verified basis |
| --- | --- | --- |
| Financial assessment | Statements, account owner and covered period | Six months: LHV [S3]; all existing accounts: Coop [S6] |
| Property identified | Valuation date, valuer, value and original report | LHV [S3], Coop [S6], Bigbank [S7]; acceptance rules differ |
| Construction | Stage budget, funding split, permit status, current/future valuation | LHV [S3]; further bank requirements pending |
| Co-applicant | Separate profile and evidence checklist | LHV [S3], Luminor [S4] |
| Refinancing | Existing loan and collateral; flag debt to be replaced | Coop export exception [S5]; balance/settlement documents proposed pending confirmation |
| Guarantee / extra collateral | Scheme, eligibility evidence, owner and valuation | LHV [S3], Coop [S6], Bigbank [S7]; exact evidence pending |

## Implementation and verification backlog

1. Confirm complete forms for each bank using authorized walkthroughs or bank-provided specifications. Record exact field labels, option values, mandatory/conditional status, formats, limits and evidence date.
2. Verify purchase, construction, renovation, refinancing, non-salary income and co-applicant branches separately. There is no verified single "most complex bank" yet.
3. Add a bank mapping registry with source, date, field transformation and unresolved status. A missing mandatory mapping must prevent a claim that an export is complete.
4. Retain canonical data when exports differ. Keep bank-specific declarations in their original meaning and version.
5. Confirm submission channel, file acceptance and co-applicant procedure with each bank. An exportable summary is not automatically an accepted bank application.
6. Validate real examples against bank reviewers before claiming full coverage. Recheck mappings after form changes.

## Official sources

All links accessed or retrieved on 10 October 2026. Search-index text and live extraction can differ, especially for dynamic forms. No rates or promotional offers are used as durable application requirements.

- [S1 - Swedbank public application](https://www.swedbank.ee/private/credit/loans/home/housing_loan/housing_loan?infoAtBegin=no&language=EST)
- [S2 - SEB home loan](https://www.seb.ee/eraklient/laenud/kodulaen)
- [S3 - LHV public application](https://www.lhv.ee/et/kodulaen/taotlus)
- [S4 - Luminor application PDF](https://luminor.ee/s3fs-public/documents/luminor_home_loan_application_est.pdf)
- [S5 - Coop home-loan FAQ](https://www.cooppank.ee/info/kkk/kodulaen)
- [S6 - Coop product and document checklist](https://www.cooppank.ee/eraklient/kodu/kodulaen)
- [S7 - Bigbank home-loan terms](https://www.bigbank.ee/kodulaen/?tab=kodulaenu-tingimused)
- [S8 - Swedbank home-loan entry, including co-applicant choice](https://www.swedbank.ee/private/credit/loans/home?language=EST)