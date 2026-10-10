'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../app-model.js');
const group = (check, name) => check.observed.find(g => g.label === name);

test('bank checks distinguish missing observed fields from unverified mappings', () => {
  const d = M.blank();
  for (const bank of M.banks) {
    const c = M.bankCheck(d, bank, '2026-10-10');
    assert.equal(c.completeBankApplication, false);
    assert.equal(c.status, 'Needs bank verification');
    assert(c.unverified.length > 0);
    assert(c.missingCount > 0);
  }
  assert(M.bankCheck(d, 'SEB').unverified.includes('Applicant identity and contact'));
  assert(group(M.bankCheck(d, 'LHV'), 'Applicant identity and contact').missing.includes('Primary applicant: Email'));
});

test('blank values remain unknown while explicit zero / none are valid answers', () => {
  const d = M.blank();
  assert.equal(d.household.dependants, null);
  assert(group(M.bankCheck(d, 'LHV'), 'Separate credit limits').missing.length > 0);
  d.household.dependants = 0;
  d.loan.ownContribution = 0;
  d.applicants[0].debtsStatus = 'none';
  d.applicants[0].creditsStatus = 'none';
  const check = M.bankCheck(d, 'LHV');
  assert.equal(group(check, 'Dependants / children under 18').missing.length, 0);
  assert.equal(group(check, 'Own contribution').missing.length, 0);
  assert.equal(group(check, 'Debt details').missing.length, 0);
  assert.equal(group(check, 'Separate credit limits').missing.length, 0);
});

test('credit limits and debts stay separate and repeated row gaps are numbered', () => {
  const d = M.sample();
  d.applicants[0].debts.push({ type: 'Mortgage', balance: 20000, monthlyPayment: 200 });
  const check = M.bankCheck(d, 'LHV');
  assert(group(check, 'Debt details').missing.includes('Primary applicant: Debt 2: Lender'));
  assert.equal(group(check, 'Separate credit limits').missing.length, 0);
});

test('co-applicant has independent identity, finances and document checks', () => {
  const d = M.sample(); d.applicants.push(M.applicant('co', 'Co-applicant'));
  const check = M.bankCheck(d, 'LHV');
  assert(group(check, 'Applicant identity and contact').missing.includes('Co-applicant: First name'));
  assert(group(check, 'Income').missing.some(s => s.startsWith('Co-applicant:')));
  assert(check.observed.some(g => g.label === 'Co-applicant account statements' && g.missing.length));
  assert.equal(M.exportSummary(d).application.applicants.length, 2);
});

test('dependants, children under 18 and disposable money are not substituted', () => {
  const d = M.sample(); d.household.childrenUnder18 = null; d.household.disposableAmount = null;
  assert.equal(group(M.bankCheck(d, 'LHV'), 'Dependants / children under 18').missing.length, 0);
  assert.deepEqual(group(M.bankCheck(d, 'Luminor'), 'Dependants / children under 18').missing, ['Children under 18']);
  assert.deepEqual(group(M.bankCheck(d, 'Luminor'), 'Household disposable money').missing, ['Household disposable money']);
});

test('fixed-term employment needs an end date only while a fixed end applies', () => {
  const d = M.sample(); const e = d.applicants[0].employment;
  e.noFixedEnd = false; e.endDate = '';
  assert(group(M.bankCheck(d, 'Luminor'), 'Employment type and contract end').missing.some(s => s.includes('Contract end')));
  e.noFixedEnd = true;
  assert.equal(group(M.bankCheck(d, 'Luminor'), 'Employment type and contract end').missing.length, 0);
  e.status = 'self-employed';
  assert.equal(group(M.bankCheck(d, 'Luminor'), 'Employment and tenure').missing.length, 0);
  assert.deepEqual(M.exportSummary(d).application.applicants[0].employment, { status: 'self-employed' });
});

test('income currency and frequency survive export without guessed conversion', () => {
  const d = M.sample(); d.applicants[0].incomes.push({ type: 'Rent', amount: 1000, currency: 'USD', frequency: 'annual', evidence: '' });
  const out = M.exportSummary(d).application.applicants[0].incomes[1];
  assert.equal(out.currency, 'USD'); assert.equal(out.frequency, 'annual'); assert.equal(out.amount, 1000);
});

test('construction branch is conditional and removed from unrelated exports', () => {
  const d = M.sample();
  assert.equal(group(M.bankCheck(d, 'LHV'), 'Construction evidence').missing.length, 0);
  assert(!Object.hasOwn(M.exportSummary(d).application, 'construction'));
  d.loan.purpose = 'construction';
  assert.equal(group(M.bankCheck(d, 'LHV'), 'Construction evidence').missing.length, 4);
  assert(Object.hasOwn(M.exportSummary(d).application, 'construction'));
  Object.assign(d.construction, { stageBudget: 'Stages, own and borrowed funding', permitStatus: 'pending', currentValue: 80000, futureValue: 250000 });
  assert.equal(group(M.bankCheck(d, 'LHV'), 'Construction evidence').missing.length, 0);
  assert(M.bankCheck(d, 'LHV').unverified.length > 0);
});

test('refinancing flags and original debts remain in the canonical export', () => {
  const d = M.sample(); d.loan.purpose = 'refinancing'; d.applicants[0].debts[0].refinanced = true;
  assert(M.bankCheck(d, 'Coop Pank').notes.some(s => s.includes('do not enter')));
  const out = M.exportSummary(d).application.applicants[0].debts;
  assert.equal(out.length, 1); assert.equal(out[0].refinanced, true); assert.equal(out[0].balance, 3000);
});

test('six-month statements and all-account coverage use distinct bank checks', () => {
  const d = M.sample(); const statements = d.applicants[0].statements;
  Object.assign(statements, { status: 'available', months: 6, allAccounts: false });
  assert.equal(group(M.bankCheck(d, 'LHV'), 'Primary applicant account statements').missing.length, 0);
  assert.equal(group(M.bankCheck(d, 'Coop Pank'), 'Primary applicant account statements').missing.length, 1);
  statements.allAccounts = true;
  assert.equal(group(M.bankCheck(d, 'Coop Pank'), 'Primary applicant account statements').missing.length, 0);
});

test('original current LHV valuation format and Coop age are checked', () => {
  const d = M.sample(); Object.assign(d.property, { valuationStatus: 'available', valuationDate: '2026-10-01', valuationFormat: 'pdf' });
  assert(M.bankCheck(d, 'LHV', '2026-10-10').observed.some(g => g.missing.includes('LHV current valuation: original ASiC-E format')));
  d.property.valuationFormat = 'asice';
  assert(!M.bankCheck(d, 'LHV', '2026-10-10').observed.some(g => g.missing.includes('LHV current valuation: original ASiC-E format')));
  d.property.valuationDate = '2024-10-01';
  assert(M.bankCheck(d, 'Coop Pank', '2026-10-10').observed.some(g => g.missing.some(s => s.includes('12-month'))));
});

test('additional collateral and EIS answers are conditional', () => {
  const d = M.sample();
  assert(!Object.hasOwn(M.exportSummary(d).application, 'additionalProperty'));
  d.financing.additionalCollateral = true; d.financing.guarantee = 'EIS';
  const gaps = group(M.bankCheck(d, 'LHV'), 'Additional collateral / guarantee').missing;
  assert(gaps.includes('EIS target group')); assert(gaps.includes('Additional collateral owner'));
  assert(Object.hasOwn(M.exportSummary(d).application, 'additionalProperty'));
});

test('numerical contradictions are reported and incomplete summary remains explicit', () => {
  const d = M.sample(); d.loan.ownContribution = 300000; d.applicants[0].creditLimits[0].usedAmount = 2500;
  assert.equal(M.errors(d).length, 2);
  const out = M.exportSummary(d, '2026-10-10T09:00:00Z');
  assert.equal(out.demo, true); assert.equal(out.completeBankApplication, false); assert.equal(out.documentsAttached, false);
  assert.equal(out.validationErrors.length, 2); assert.equal(out.bankChecks.length, 3);
  d.applicants[0].debtsStatus = 'none'; assert.equal(M.exportSummary(d).application.applicants[0].debts.length, 0);
});

test('annuity handles zero interest, expected payment and invalid inputs', () => {
  assert.equal(M.payment(1200, 0, 12), 100);
  assert(Math.abs(M.payment(200000, 4.5, 300) - 1111.664955919) < 0.01);
  assert(M.payment(200000, 5, 300) > M.payment(200000, 4, 300));
  assert.equal(M.payment(200000, 5, 0), null);
  assert.equal(M.payment(null, 5, 300), null);
});
