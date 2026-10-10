/* Shared demo model and research checks. Works offline in a browser and in Node. */
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./app-documents.js') : root.DemoDocuments);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LoanModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Documents) {
  'use strict';
  const banks = ['Swedbank', 'SEB', 'LHV', 'Luminor', 'Coop Pank', 'Bigbank'];
  const sources = {
    Swedbank: 'https://www.swedbank.ee/private/credit/loans/home/housing_loan/housing_loan?infoAtBegin=no&language=EST',
    SEB: 'https://www.seb.ee/eraklient/laenud/kodulaen',
    LHV: 'https://www.lhv.ee/et/kodulaen/taotlus',
    Luminor: 'https://luminor.ee/s3fs-public/documents/luminor_home_loan_application_est.pdf',
    'Coop Pank': 'https://www.cooppank.ee/eraklient/kodu/kodulaen',
    Bigbank: 'https://www.bigbank.ee/kodulaen/?tab=kodulaenu-tingimused'
  };
  const sourceIds = { Swedbank: 'S1 / S8', SEB: 'S2', LHV: 'S3', Luminor: 'S4', 'Coop Pank': 'S5 / S6', Bigbank: 'S7' };
  function applicant(id, role) {
    return { id, role, firstName: '', lastName: '', personalId: '', idIssuer: '', residency: '', country: '', address: '', postalCode: '', email: '', phone: '', language: '', maritalStatus: '', education: '', relationship: '', demoReviewed: false,
      employment: { status: '', employer: '', sector: '', occupation: '', type: '', tenureMonths: null, endDate: '', noFixedEnd: false },
      incomesStatus: '', incomes: [], debtsStatus: '', debts: [], creditsStatus: '', creditLimits: [],
      emtaPermissions: [], statements: { status: '', months: null, allAccounts: false } };
  }
  function blank() {
    return { schemaVersion: 5, documents: [], applicationId: 'home-loan-demo', revision: 1, selectedBanks: [],
      loan: { purpose: 'purchase', amount: null, termYears: null, termMonths: null, price: null, ownContribution: null, contributionSource: '', repaymentSchedule: 'annuity', paymentDay: null, campaignCode: '', notes: '' },
      household: { dependants: null, childrenUnder18: null, monthlyExpenses: null, disposableAmount: null },
      applicants: [applicant('primary', 'Primary applicant')],
      property: { type: '', address: '', country: '', intendedUse: '', owner: '', estimatedValue: null, listingUrl: '', energyClass: '', valuationStatus: '', valuationDate: '', valuationFormat: '' },
      financing: { guarantee: '', targetGroup: '', additionalCollateral: false },
      additionalProperty: { type: '', address: '', owner: '', estimatedValue: null, valuationStatus: '', valuationDate: '', valuationFormat: '' },
      construction: { stageBudget: '', permitStatus: '', currentValue: null, futureValue: null } };
  }
  function sample() {
    const d = blank();
    d.selectedBanks = ['LHV', 'Luminor', 'Coop Pank'];
    Object.assign(d.loan, { amount: 200000, termYears: 25, price: 250000, ownContribution: 50000, contributionSource: 'Fictional savings', paymentDay: 15 });
    Object.assign(d.household, { dependants: 2, childrenUnder18: 2, monthlyExpenses: 1200, disposableAmount: 2150 });
    Object.assign(d.applicants[0], { firstName: 'Demo', lastName: 'Applicant', personalId: 'DEMO-0001', idIssuer: 'EE', residency: 'Estonia', country: 'EE', address: 'Example Street 10, Tallinn', postalCode: '10101', email: 'demo@example.test', phone: '+372 5550 0000', language: 'English', maritalStatus: 'Married', education: 'Higher education', incomesStatus: 'provided', debtsStatus: 'provided', creditsStatus: 'provided' });
    Object.assign(d.applicants[0].employment, { status: 'employed', employer: 'Example Employer', sector: 'Engineering', occupation: 'Engineer', type: 'Permanent', tenureMonths: 36, noFixedEnd: true });
    d.applicants[0].incomes = [{ type: 'Salary', amount: 3500, currency: 'EUR', frequency: 'monthly', evidence: 'Fictional salary evidence' }];
    d.applicants[0].debts = [{ type: 'Car loan', lender: 'Example Lender', balance: 3000, monthlyPayment: 150, maturity: '2028-10-01', refinanced: false }];
    d.applicants[0].creditLimits = [{ type: 'Credit card', lender: 'Example Lender', limit: 2000, usedAmount: 0 }];
    Object.assign(d.property, { type: 'Apartment', address: 'Example Street 20, Tallinn', country: 'EE', intendedUse: 'Own home', owner: 'Fictional seller', estimatedValue: 250000 });
    d.financing.guarantee = 'none';
    return d;
  }
  const has = v => v !== null && v !== undefined && String(v).trim() !== '';
  function payment(principal, annualRate, months) {
    if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isInteger(months) || months <= 0) return null;
    const r = annualRate / 1200;
    return r === 0 ? principal / months : principal * r / (1 - Math.pow(1 + r, -months));
  }
  function missingFields(object, fields, prefix = '') {
    return fields.filter(([key]) => !has(object[key])).map(([, label]) => prefix + label);
  }
  function people(d, check) { return d.applicants.flatMap(a => check(a).map(x => a.role + ': ' + x)); }
  function listMissing(a, key, statusKey, fields, label) {
    if (!has(a[statusKey])) return [label + ' declaration (not answered / none / provide details)'];
    if (a[statusKey] === 'none') return [];
    if (!a[key].length) return ['Add at least one ' + label.toLowerCase() + ' item'];
    return a[key].flatMap((row, i) => missingFields(row, fields, label + ' ' + (i + 1) + ': '));
  }
  const core = d => [...missingFields(d.loan, [['purpose', 'Loan purpose'], ['amount', 'Loan amount']]), ...(!has(d.loan.termYears)&&!has(d.loan.termMonths)?['Term']:[])];
  const identity = d => people(d, a => missingFields(a, [['firstName', 'First name'], ['lastName', 'Last name'], ['personalId', 'Demo personal ID'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Current address']]));
  const incomes = (d, currency) => people(d, a => listMissing(a, 'incomes', 'incomesStatus', [['type', 'Income type'], ['amount', 'Net amount'], ['frequency', 'Frequency'], ...(currency ? [['currency', 'Currency']] : [])], 'Income'));
  const employment = (d, contract) => people(d, a => {
    const e = a.employment;
    if (!has(e.status)) return ['Employment / activity status'];
    if (e.status !== 'employed') return [];
    const out = missingFields(e, [['employer', 'Employer'], ['sector', 'Employer sector'], ['occupation', 'Occupation'], ['tenureMonths', 'Tenure in months']]);
    if (contract) { out.push(...missingFields(e, [['type', 'Employment relationship type']])); if (!e.noFixedEnd && !has(e.endDate)) out.push('Contract end date or no fixed end'); }
    return out;
  });
  const debts = d => people(d, a => listMissing(a, 'debts', 'debtsStatus', [['type', 'Debt type'], ['lender', 'Lender'], ['balance', 'Balance'], ['monthlyPayment', 'Monthly payment'], ['maturity', 'Maturity date']], 'Debt'));
  const limits = d => people(d, a => listMissing(a, 'creditLimits', 'creditsStatus', [['type', 'Limit type'], ['lender', 'Lender'], ['limit', 'Authorised limit']], 'Credit limit'));
  const valuation = (p, label = '') => p.valuationStatus !== 'available' ? [label + 'Valuation report availability'] : missingFields(p, [['valuationDate', 'Valuation date'], ['valuationFormat', 'Original valuation format']], label);
  const construction = d => ['construction', 'renovation'].includes(d.loan.purpose) ? missingFields(d.construction, [['stageBudget', 'Stage budget with own/loan funding split'], ['currentValue', 'Current valuation'], ['futureValue', 'Future valuation'], ['permitStatus', 'Permit status']]) : [];
  /* F = visible field, D = official guidance, ? = unverified. These are review checks, never bank-required flags. */
  const groups = [
    { label: 'Purpose, amount and term', evidence: ['F', '?', 'F', 'F', 'D', 'D'], missing: (d, b) => b === 'LHV' || b === 'Coop Pank' ? missingFields(d.loan, [['purpose', 'Loan purpose']]) : core(d) },
    { label: 'Purchase price / project budget', evidence: ['F', '?', 'F', '?', '?', '?'], missing: d => missingFields(d.loan, [['price', 'Purchase price / project budget']]) },
    { label: 'Own contribution', evidence: ['F', 'D', 'F', 'F', 'D', 'D'], missing: d => missingFields(d.loan, [['ownContribution', 'Own contribution']]) },
    { label: 'Contribution source', evidence: ['F', '?', 'F', '?', '?', '?'], missing: d => missingFields(d.loan, [['contributionSource', 'Contribution source']]) },
    { label: 'Applicant identity and contact', evidence: ['?', '?', 'F', 'F', 'D', '?'], missing: (d, b) => b === 'Coop Pank' ? ['Identity-document requirement: original document verification is outside this demo'] : identity(d) },
    { label: 'ID issuer and residency', evidence: ['?', '?', 'F', '?', '?', '?'], missing: d => people(d, a => missingFields(a, [['idIssuer', 'ID issuer'], ['residency', 'Residency']])) },
    { label: 'Marital status and education', evidence: ['?', '?', 'F', 'F', '?', '?'], missing: d => people(d, a => missingFields(a, [['maritalStatus', 'Marital status'], ['education', 'Education']])) },
    { label: 'Dependants / children under 18', evidence: ['?', '?', 'F', 'F', '?', '?'], missing: (d, b) => missingFields(d.household, b === 'Luminor' ? [['childrenUnder18', 'Children under 18']] : [['dependants', 'Dependants']]) },
    { label: 'Employment and tenure', evidence: ['?', '?', 'F', 'F', '?', '?'], missing: d => employment(d, false) },
    { label: 'Employment type and contract end', evidence: ['?', '?', '?', 'F', '?', '?'], missing: d => employment(d, true) },
    { label: 'Income', evidence: ['F', '?', 'F', 'F', 'D', '?'], missing: d => incomes(d, false) },
    { label: 'Income currency', evidence: ['?', '?', '?', 'F', '?', '?'], missing: d => incomes(d, true) },
    { label: 'Debt details', evidence: ['?', '?', 'F', 'F', 'D', '?'], missing: (d, b) => b === 'Coop Pank' ? people(d, a => has(a.debtsStatus) ? (a.debtsStatus === 'provided' && !a.debts.length ? ['Add obligation details'] : []) : ['Obligations declaration']) : debts(d) },
    { label: 'Separate credit limits', evidence: ['?', '?', 'F', '?', '?', '?'], missing: limits },
    { label: 'Household expenses', evidence: ['?', '?', 'F', '?', '?', '?'], missing: d => missingFields(d.household, [['monthlyExpenses', 'Household monthly expenses']]) },
    { label: 'Household disposable money', evidence: ['?', '?', '?', 'F', '?', '?'], missing: d => missingFields(d.household, [['disposableAmount', 'Household disposable money']]) },
    { label: 'Co-applicant', evidence: ['F', '?', 'F', 'F', 'D', '?'], missing: d => d.applicants.length < 2 ? [] : missingFields(d.applicants[1], [['firstName', 'Co-applicant first name'], ['lastName', 'Co-applicant last name'], ['email', 'Co-applicant email'], ['phone', 'Co-applicant phone'], ['relationship', 'Relationship to primary applicant']]) },
    { label: 'Property address / intended use', evidence: ['F', '?', 'F', 'F', 'D', '?'], missing: (d, b) => missingFields(d.property, [['address', 'Property address'], ...(b === 'Luminor' ? [['intendedUse', 'Property intended use']] : [])]) },
    { label: 'Listing URL', evidence: ['F', '?', 'F', '?', '?', '?'], missing: d => has(d.property.listingUrl) ? [] : ['Listing URL (if available; optional relevance must be confirmed)'] },
    { label: 'Additional collateral / guarantee', evidence: ['?', 'D', 'F', '?', 'D', 'D'], missing: d => {
      const out = missingFields(d.financing, [['guarantee', 'Guarantee selection (including none)']]);
      if (d.financing.guarantee === 'EIS') out.push(...missingFields(d.financing, [['targetGroup', 'EIS target group']]));
      if (d.financing.additionalCollateral) out.push(...missingFields(d.additionalProperty, [['type', 'Additional collateral type'], ['address', 'Additional collateral address'], ['owner', 'Additional collateral owner'], ['estimatedValue', 'Additional collateral value']]));
      return out;
    } },
    { label: 'Valuation report', evidence: ['?', '?', 'F', '?', 'D', 'D'], missing: d => [...valuation(d.property), ...(d.financing.additionalCollateral ? valuation(d.additionalProperty, 'Additional collateral: ') : [])] },
    { label: 'Construction evidence', evidence: ['F', '?', 'D', '?', 'D', '?'], missing: (d, b) => b === 'LHV' ? construction(d) : ['construction', 'renovation'].includes(d.loan.purpose) ? missingFields(d.construction, [['stageBudget', 'Project / stage budget']]) : [] },
    { label: 'Preferred payment day', evidence: ['?', '?', '?', 'F', '?', '?'], missing: d => missingFields(d.loan, [['paymentDay', 'Preferred payment day']]) },
    { label: 'Campaign code', evidence: ['F', 'D', 'F', 'F', '?', '?'], missing: () => [] },
    { label: 'Bank-specific declarations / marketing', evidence: ['F', '?', 'F', 'F', '?', '?'], missing: () => ['Bank-specific declaration text and versions have not been implemented'] }
  ];
  function bankCheck(d, bank, asOf = new Date().toISOString().slice(0, 10)) {
    const index = banks.indexOf(bank);
    if (index < 0) throw new Error('Unknown bank');
    const observed = [], unknown = [], notes = [];
    for (const g of groups) {
      const evidence = g.evidence[index];
      if (evidence === '?') unknown.push(g.label);
      else observed.push({ label: g.label, evidence, missing: [...new Set(g.missing(d, bank))] });
    }
    if (bank === 'LHV') {
      unknown.push('Loan amount / term mapping; property intended-use mapping');
      for (const a of d.applicants) {
        const missing = [];
        if (a.statements.status !== 'available') missing.push(a.role + ': Six-month statements marked available');
        if (!has(a.statements.months) || a.statements.months < 6) missing.push(a.role + ': At least six months of statement coverage');
        observed.push({ label: a.role + ' account statements', evidence: 'D', missing });
      }
      notes.push('Co-applicants complete their own native LHV application and evidence submission; this page does not invite or authenticate them.');
    }
    if (bank === 'Coop Pank') {
      unknown.push('Exact loan amount / term fields; identity/contact form mapping');
      for (const a of d.applicants) {
        const missing = [];
        if (a.statements.status !== 'available' || !has(a.statements.months) || a.statements.months < 6) missing.push(a.role + ': Six-month account statements');
        if (!a.statements.allAccounts) missing.push(a.role + ': Confirm all existing accounts covered');
        observed.push({ label: a.role + ' account statements', evidence: 'D', missing });
      }
      if (d.loan.purpose === 'refinancing') notes.push('Coop native form: do not enter the loan being refinanced as an obligation. The shared summary retains all debts and their refinancing flags.');
    }
    if (['LHV', 'Coop Pank', 'Bigbank'].includes(bank)) {
      const properties = [d.property, ...(d.financing.additionalCollateral ? [d.additionalProperty] : [])];
      for (const [i, p] of properties.entries()) {
        if (p.valuationStatus !== 'available') continue;
        const missing = [], label = i === 0 ? 'Main property valuation' : 'Additional collateral valuation';
        if (p.valuationDate) {
          if (p.valuationDate > asOf) missing.push('Valuation date is in the future');
          const cutoff = new Date(asOf + 'T00:00:00Z'); cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
          if (p.valuationDate < cutoff.toISOString().slice(0, 10)) {
            if (bank === 'Coop Pank') missing.push('Valuation older than the documented 12-month acceptance window');
            else notes.push(label + ': older than 12 months; confirm bank acceptance.');
          } else if (bank === 'LHV' && p.valuationFormat !== 'asice') missing.push('LHV current valuation: original ASiC-E format');
        }
        if (missing.length) observed.push({ label, evidence: 'D', missing });
      }
      if (bank === 'Bigbank') notes.push('Bigbank valuation guidance: normally 3-6 months, exceptionally 12; accepted valuer and age need confirmation.');
    }
    if (bank === 'Luminor') notes.push('Children under 18 and all dependants are separate values. Household disposable money is entered separately; it is not calculated from applicant income.');
    if (bank === 'Swedbank') unknown.push('Exact income fields beyond the visible income stage; shared income detail checks are proposed');
    if (bank === 'Coop Pank') unknown.push('Exact debt-detail fields beyond the documented obligations topic');
    unknown.push('Mandatory flags, dynamic branches, exact option lists, native declarations and submission acceptance');
    unknown.push('EMTA query scope, bank-specific consent text and genuine authorization channel');
    return { bank, source: sources[bank], sourceId: sourceIds[bank], researchDate: '2026-10-10', status: 'Needs bank verification', completeBankApplication: false,
      preparation: Documents.preparation(d, bank), observed, missingCount: observed.reduce((n, g) => n + g.missing.length, 0), unverified: [...new Set(unknown)], notes };
  }
  function errors(d) {
    const out = [];
    const nonnegative = (v, label) => { if (has(v) && (typeof v !== 'number' || !Number.isFinite(v) || v < 0)) out.push(label + ' must be a non-negative number.'); };
    for (const [key, label] of [['amount', 'Loan amount'], ['price', 'Price / budget']]) {
      if (has(d.loan[key]) && (!(d.loan[key] > 0) || !Number.isFinite(d.loan[key]))) out.push(label + ' must be greater than zero.');
    }
    if (has(d.loan.termYears) && (!Number.isInteger(d.loan.termYears) || d.loan.termYears < 1 || d.loan.termYears > 30)) out.push('Term must be a whole number from 1 to 30 years (demo range).');
    if (has(d.loan.termMonths) && (!Number.isInteger(d.loan.termMonths) || d.loan.termMonths < 1 || d.loan.termMonths > 360)) out.push('Term must be a whole number from 1 to 360 months (demo range).');
    if (has(d.loan.termMonths) && has(d.loan.termYears) && d.loan.termMonths !== d.loan.termYears*12) out.push('Year and month terms disagree; use one term input.');
    if (has(d.loan.paymentDay) && (!Number.isInteger(d.loan.paymentDay) || d.loan.paymentDay < 1 || d.loan.paymentDay > 31)) out.push('Payment day must be 1-31.');
    nonnegative(d.loan.ownContribution, 'Own contribution');
    if (has(d.loan.ownContribution) && has(d.loan.price) && d.loan.ownContribution > d.loan.price) out.push('Own contribution cannot exceed the stated price / budget.');
    for (const [key, label] of [['dependants', 'Dependants'], ['childrenUnder18', 'Children under 18']]) if (has(d.household[key]) && (!Number.isInteger(d.household[key]) || d.household[key] < 0)) out.push(label + ' must be a non-negative whole number.');
    nonnegative(d.household.monthlyExpenses, 'Household expenses');
    if (has(d.household.disposableAmount) && !Number.isFinite(d.household.disposableAmount)) out.push('Disposable money must be a finite number.');
    for (const p of [d.property, ...(d.financing.additionalCollateral ? [d.additionalProperty] : [])]) nonnegative(p.estimatedValue, 'Property value');
    for (const k of ['currentValue', 'futureValue']) nonnegative(d.construction[k], 'Construction value');
    for (const a of d.applicants) {
      nonnegative(a.employment.tenureMonths, a.role + ' tenure');
      nonnegative(a.statements.months, a.role + ' statement coverage');
      for (const r of a.incomes) nonnegative(r.amount, a.role + ' income');
      for (const r of a.debts) { nonnegative(r.balance, a.role + ' debt balance'); nonnegative(r.monthlyPayment, a.role + ' debt payment'); }
      for (const r of a.creditLimits) { nonnegative(r.limit, a.role + ' authorised limit'); nonnegative(r.usedAmount, a.role + ' used credit'); if (has(r.limit) && has(r.usedAmount) && r.usedAmount > r.limit) out.push(a.role + ': used credit exceeds the authorised limit.'); }
    }
    return out;
  }
  function exportSummary(d, createdAt = new Date().toISOString()) {
    const copy = JSON.parse(JSON.stringify(d));
    copy.documents = Documents.activeManifest(copy);
    for (const a of copy.applicants) {
      a.emtaPermissions = (a.emtaPermissions || []).filter(p => copy.selectedBanks.includes(p.bank)).map(p => ({ ...p, genuineAuthorization: false, queryExecuted: false }));
      if (a.incomesStatus !== 'provided') a.incomes = [];
      if (a.debtsStatus !== 'provided') a.debts = [];
      if (a.creditsStatus !== 'provided') a.creditLimits = [];
      if (a.employment.status !== 'employed') a.employment = { status: a.employment.status };
    }
    if (!['construction', 'renovation'].includes(copy.loan.purpose)) delete copy.construction;
    if (!copy.financing.additionalCollateral) delete copy.additionalProperty;
    if (copy.financing.guarantee !== 'EIS') delete copy.financing.targetGroup;
    return { demo: true, completeBankApplication: false, createdAt, application: copy,
      validationErrors: errors(d), bankChecks: d.selectedBanks.map(b => bankCheck(d, b, createdAt.slice(0, 10))),
      mappingStatus: 'Partial research mapping; not a native application or bank approval', documentsAttached: false, filesIncluded: false, fileExportMode: 'metadata-only-json', documentsSelectedInBrowser: copy.documents.length, bankConsentObtained: false, emtaQueriesExecuted: false };
  }
  return { banks, sources, sourceIds, groups, applicant, blank, sample, has, payment, errors, bankCheck, exportSummary };
});
