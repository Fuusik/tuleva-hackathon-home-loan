'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../app-model.js'),W=require('../app-workflow.js'),I=require('../app-i18n.js');
function reviewed(d){const state=W.createReviews();state.reset('fictional-example');W.sections.forEach(s=>state.mark(s,d.revision,true,'2026-10-10T10:00:00Z'));return state;}
test('shared section review belongs to the current revision and is invalidated by edits',()=>{
  const d=M.sample(),state=reviewed(d);assert(state.complete(d.revision));assert(!state.complete(d.revision+1));state.invalidate();assert(!state.complete(d.revision));
  W.sections.forEach(s=>state.mark(s,d.revision,true));state.mark(W.sections[0],d.revision,false);assert(!state.complete(d.revision));state.reset('blank');assert.equal(state.snapshot(d.revision).source,'blank');assert.throws(()=>state.mark('unknown',1,true));
});
test('bank readiness reuses core answers and keeps distinct additional topics and all unknowns',()=>{
  const d=M.sample(),lhv=W.readiness(d,'LHV'),luminor=W.readiness(d,'Luminor');
  assert(lhv.shared.some(g=>g.label==='Applicant identity and contact'));assert(lhv.extras.some(g=>g.label==='Separate credit limits'));assert(!luminor.extras.some(g=>g.label==='Separate credit limits'));
  assert(luminor.extras.some(g=>g.label==='Household disposable money'));assert(!lhv.extras.some(g=>g.label==='Household disposable money'));assert(lhv.unverified.length);assert.equal(lhv.bankConfirmed,false);
});
test('extra questions follow person, employment, currency and account-coverage branches',()=>{
  const d=M.sample();d.applicants.push(M.applicant('co','Co-applicant'));d.applicants[1].employment.status='employed';
  assert(W.extraPaths(d,'LHV').some(([p])=>p==='applicants.1.idIssuer'));
  assert(W.extraPaths(d,'Luminor').some(([p])=>p==='applicants.0.incomes.0.currency'));
  assert(W.extraPaths(d,'Luminor').some(([p])=>p==='applicants.1.employment.endDate'));
  d.applicants[1].employment.status='retired';assert(!W.extraPaths(d,'Luminor').some(([p])=>p==='applicants.1.employment.endDate'));
  assert(W.extraPaths(d,'Coop Pank').some(([p])=>p==='applicants.1.statements.allAccounts'));
});
test('two illustrative forms reuse data without conflating household definitions or currency',()=>{
  const d=M.sample();d.applicants[0].incomes.push({type:'Rent',amount:100,currency:'USD',frequency:'annual',evidence:''});
  const before=JSON.stringify(d),a=W.illustrativeForm(d,'LHV'),b=W.illustrativeForm(d,'Luminor');
  assert.equal(a.fields.household.dependants,2);assert(!Object.hasOwn(a.fields.household,'childrenUnder18'));
  assert.equal(b.fields.household.childrenUnder18,2);assert.equal(b.fields.household.disposableMoney,2150);assert.equal(b.fields.loanRequest.termMonths,300);
  assert.equal(b.fields.applicants[0].incomeRows[1].currency,'USD');assert.equal(b.fields.applicants[0].incomeRows[1].frequency,'annual');
  assert(!Object.hasOwn(a.fields.financing,'requestedAmount'));assert.equal(a.nativeFormVerified,false);assert.equal(a.sentToBank,false);assert.equal(JSON.stringify(d),before);
});
test('co-applicant mappings preserve separate identity, money and recipient choices',()=>{
  const d=M.sample();const co=M.applicant('co','Co-applicant');co.firstName='Other';co.incomesStatus='provided';co.incomes=[{type:'Salary',amount:1200,currency:'EUR',frequency:'monthly'}];co.emtaPermissions=[{bank:'LHV',status:'refuse',genuineAuthorization:false}];d.applicants.push(co);
  const form=W.illustrativeForm(d,'LHV');assert.equal(form.fields.people[1].identity.firstName,'Other');assert.equal(form.fields.people[1].incomes[0].amount,1200);assert.equal(form.emtaChoices[1].choices[0].status,'refuse');
  assert.equal(W.illustrativeForm(d,'Luminor').emtaChoices[1].choices.length,0);
});
test('simulation requires selected recipient, current full review, fictional identifiers and valid numbers',()=>{
  const d=M.sample(),state=reviewed(d);assert.throws(()=>W.simulate(d,'LHV',state.snapshot(d.revision),false),/recipient/);
  assert.throws(()=>W.simulate(d,'LHV',{complete:true,revision:d.revision},true),/dataset/);
  assert.throws(()=>W.simulate(d,'SEB',state.snapshot(d.revision),true),/Select/);
  assert.throws(()=>W.simulate({...d,revision:d.revision+1},'LHV',state.snapshot(d.revision),true),/dataset/);
  d.applicants[0].personalId='REAL';assert.throws(()=>W.simulate(d,'LHV',state.snapshot(d.revision),true),/fictional/);d.applicants[0].personalId='DEMO-0001';
  d.loan.amount=-1;assert.throws(()=>W.simulate(d,'LHV',state.snapshot(d.revision),true),/invalid/);
});
test('successful local simulation never asserts receipt, authorization or complete bank readiness',()=>{
  const d=M.sample(),record=W.simulate(d,'LHV',reviewed(d).snapshot(d.revision),true,'2026-10-10T10:05:00Z');
  assert.equal(record.form.sentToBank,false);assert.equal(record.form.bankReceipt,null);assert.equal(record.form.completeBankApplication,false);assert.equal(record.recipientReview.genuineAuthorization,false);assert(record.form.omittedOrUnverified.length);assert(record.form.missingResearchItems.length);assert.equal(record.simulatedAt,'2026-10-10T10:05:00Z');
});
test('new workflow labels, validation and bank extra fields have Estonian translations',()=>{
  I.setLocale('et');for(const key of [...W.sections,...Object.values(W.extraFields).flat().map(x=>x[1]),'Select this bank first','Review the current shared dataset first','Review this recipient simulation first','Correct invalid shared values first','Use fictional DEMO identifiers and example.test email addresses','Simulated locally; nothing sent'])assert(I.hasTranslation(key),'Missing '+key);
});
