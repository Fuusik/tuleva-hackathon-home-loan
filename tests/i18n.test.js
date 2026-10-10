'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../app-model.js');
const I = require('../app-i18n.js');

test('Estonian is the default and both language directions work', () => {
  assert.equal(I.getLocale(), 'et');
  assert.equal(I.t('First name'), 'Eesnimi');
  assert.equal(I.t('Needs bank verification'), 'Vajab pangaga t\u00e4psustamist');
  I.setLocale('en'); assert.equal(I.t('First name'), 'First name');
  I.setLocale('et'); assert.equal(I.t('First name'), 'Eesnimi');
  assert.throws(() => I.setLocale('fr'), /Unsupported language/);
});

test('language changes keep canonical application values unchanged', () => {
  const d = M.sample(); d.applicants.push(M.applicant('co', 'Co-applicant'));
  d.applicants[1].firstName = 'Custom name'; d.construction.stageBudget = 'Custom budget';
  const before = JSON.stringify(d);
  I.setLocale('en'); I.t('Income type'); I.message(M.bankCheck(d, 'LHV').status);
  I.setLocale('et'); I.t('Income type'); I.message(M.bankCheck(d, 'LHV').status);
  assert.equal(JSON.stringify(d), before);
  assert.equal(d.applicants[0].incomes[0].type, 'Salary');
  assert.equal(d.loan.amount, 200000);
});

test('nested bank gaps, applicant roles and numbered rows are translated', () => {
  I.setLocale('et');
  assert.equal(I.message('[F] Debt details: Co-applicant: Debt 2: Lender'), '[F] Kohustuste andmed: Kaastaotleja: Kohustus 2: Laenuandja');
  assert.equal(I.message('Primary applicant account statements'), 'P\u00f5hitaotleja kontov\u00e4ljav\u00f5tted');
  assert.equal(I.message('Remove Income 2'), 'Eemalda Sissetulek 2');
  assert.equal(I.message('Co-applicant income must be a non-negative number.'), 'Kaastaotleja sissetulek peab olema mittenegatiivne arv.');
  assert.equal(I.message('LHV current valuation: original ASiC-E format'), 'LHV kehtiv hindamisakt: algne ASiC-E vorming');
});

test('bank checklist groups, unknown topics and notes have translation coverage', () => {
  I.setLocale('et'); const d = M.blank(); d.applicants.push(M.applicant('co', 'Co-applicant')); d.loan.purpose = 'construction';
  d.financing.additionalCollateral = true; d.financing.guarantee = 'EIS';
  for (const bank of M.banks) {
    const check = M.bankCheck(d, bank, '2026-10-10');
    for (const text of [check.status, ...check.observed.map(g => g.label), ...check.observed.flatMap(g => g.missing), ...check.unverified, ...check.notes]) {
      assert.notEqual(I.message(text), text, 'Missing translation: ' + text);
    }
  }
  const sample = M.sample(); sample.loan.purpose = 'refinancing';
  sample.property.valuationStatus = 'available'; sample.property.valuationDate = '2024-01-01'; sample.property.valuationFormat = 'pdf';
  for (const bank of M.banks) for (const text of M.bankCheck(sample, bank, '2026-10-10').notes) assert.notEqual(I.message(text), text, 'Missing note translation: ' + text);
});

test('templates preserve bank names, counts and user-provided variables', () => {
  I.setLocale('et');
  const result = I.t('Refinanced loans retained in the summary: {loans}', { loans: 'User Lender: example' });
  assert(result.includes('User Lender: example'));
  assert(I.t('{bank}: {n} researched items to review; {u} unverified topics. Needs bank verification.', { bank: 'LHV', n: 3, u: 8 }).startsWith('LHV: 3'));
  assert.equal(I.t('Draft {n}', { n: 12 }), 'Mustand 12');
});

test('all form field labels have bilingual coverage and the language control is present', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(html.includes('<html lang="et">'));
  assert(html.includes('data-language="et"'));
  assert(html.includes('data-language="en"'));
  assert(html.includes('src="app-i18n.js"'));
  for (const match of html.matchAll(/(?:field|choice|num)\('[^']+', '([^']+)'/g)) {
    const label = JSON.parse('"' + match[1] + '"');
    assert(I.hasTranslation(label), 'Missing field-label translation: ' + label);
  }
});
