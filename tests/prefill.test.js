'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../app-prefill.js');
const I=require('../app-i18n.js');

test('identity suggestions cover names and personal ID for either person, not their financial or contact data',()=>{
  for(const owner of [0,1]){
    for(const key of ['firstName','lastName','personalId'])assert.equal(P.forPath(`applicants.${owner}.${key}`).kind,'identity');
    for(const key of ['address','email','phone','residency','idIssuer','maritalStatus','education'])assert.equal(P.forPath(`applicants.${owner}.${key}`).kind,'manual');
  }
});

test('employment suggestions are separate from identity and do not assert contract type or exact tenure',()=>{
  for(const owner of [0,1]){
    for(const key of ['status','employer'])assert.equal(P.forPath(`applicants.${owner}.employment.${key}`).kind,'tax');
    for(const key of ['type','tenureMonths','endDate','noFixedEnd'])assert.equal(P.forPath(`applicants.${owner}.employment.${key}`).kind,'manual');
  }
});

test('statement suggestions do not establish debt balances, credit limits or all-account coverage',()=>{
  assert.equal(P.forPath('applicants.1.incomes.12.amount').kind,'statement');
  assert.equal(P.forPath('household.monthlyExpenses').kind,'statement');
  for(const owner of [0,1]){
    for(const collection of ['debts','creditLimits'])for(const key of ['balance','limit','usedAmount','monthlyPayment'])assert.equal(P.forPath(`applicants.${owner}.${collection}.0.${key}`).kind,'manual');
    assert.equal(P.forPath(`applicants.${owner}.statements.allAccounts`).kind,'manual');
  }
});

test('loan choices, property information and acknowledgements cannot be inferred from source suggestions',()=>{
  for(const p of ['loan.amount','loan.ownContribution','property.address','property.estimatedValue','household.dependants','applicants.0.demoReviewed','applicants.1.relationship','applicants.0.incomesStatus','permission.emta',null,'applicants.2.firstName'])assert.equal(P.forPath(p).kind,'manual');
});

test('potential-source labels and explanations are bilingual, with no language-dependent policy',()=>{
  const before=JSON.stringify(P.hints);
  for(const hint of Object.values(P.hints))for(const text of [hint.label,hint.detail]){
    assert(I.hasTranslation(text),text);I.setLocale('et');assert.notEqual(I.t(text),text);I.setLocale('en');assert.equal(I.t(text),text);
  }
  I.setLocale('et');assert.equal(JSON.stringify(P.hints),before);
});
