'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{File}=require('node:buffer');
const M=require('../app-model.js'),A=require('../app-application.js'),D=require('../app-documents.js'),O=require('../app-offers.js'),I=require('../app-i18n.js');
const assumptions={benchmark:2,horizonYears:5,referenceDate:'2026-10-10',benchmarkPeriod:'6M',resetMonths:6};
const paths=d=>A.requirements(d).map(([p])=>p);
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} differs from ${b}`);
test('blank application has no chosen purpose, property, banks or fictitious identity',()=>{
  const d=M.blank();assert.equal(d.loan.purpose,'');assert.equal(d.property.status,'');assert.equal(d.loan.repaymentSchedule,'unsure');assert.deepEqual(d.selectedBanks,[]);assert.equal(d.applicants[0].firstName,'');assert.equal(d.loan.amount,null);
});
test('purchase budget preserves missing versus zero and excludes guarantees from arithmetic',()=>{
  assert.equal(A.purchasePrice(200000,35000),235000);assert.equal(A.purchasePrice(200000,0),200000);assert.equal(A.purchasePrice(200000,35000,20000),255000);
  for(const inputs of [[null,0],[0,10],[1,null],[1,-1],[1,0,null],[1,0,-1],[Infinity,0],[1,NaN],['1',0]])assert.equal(A.purchasePrice(...inputs),null);
});
test('property search permits early shared preparation and keeps bank verification gaps',()=>{
  const d=M.sample();d.property.status='searching';d.property.address='';d.property.type='';assert(!paths(d).includes('property.address'));assert(!A.issues(d).some(i=>i.path.startsWith('property.')));
  const c=M.bankCheck(d,'LHV');assert.equal(c.completeBankApplication,false);assert(c.observed.some(g=>g.laterStage));assert(c.unverified.length);d.property.status='selected';assert(A.issues(d).some(i=>i.path==='property.address'));
});
test('hidden property and inactive applicant files stay local and are excluded from the active export',()=>{
  const d=M.sample(),store=D.createStore();store.add(new File(['demo'],'a.pdf'),'primary','statement');store.add(new File(['demo'],'v.asice'),'property','valuation');store.add(new File(['demo'],'c.pdf'),'co','statement');d.documents=store.list();d.property.status='searching';
  const exported=M.exportSummary(d).application;assert.deepEqual(exported.property,{status:'searching'});assert.equal(exported.documents.length,1);assert.equal(exported.documents[0].ownerId,'primary');assert.equal(store.list().length,3);
  d.property.status='selected';assert.equal(M.exportSummary(d).application.documents.length,2);
});
test('purpose changes require construction funding or remaining-month term only when relevant',()=>{
  const d=M.sample();d.loan.purpose='construction';assert(paths(d).includes('construction.stageBudget'));assert(paths(d).includes('loan.price'));d.loan.purpose='refinancing';assert(paths(d).includes('loan.termMonths'));assert(!paths(d).includes('loan.termYears'));assert(!paths(d).includes('loan.ownContribution'));assert(!paths(d).includes('construction.stageBudget'));
});
test('income, debt and limit declarations distinguish none, unknown and an empty provided list',()=>{
  const d=M.sample(),a=d.applicants[0];for(const [status,list] of [['incomesStatus','incomes'],['debtsStatus','debts'],['creditsStatus','creditLimits']]){a[status]='';assert(A.issues(d).some(i=>i.path==='applicants.0.'+status));a[status]='none';assert(!A.issues(d).some(i=>i.path==='applicants.0.'+status));a[status]='provided';a[list]=[];assert(A.issues(d).some(i=>i.path==='applicants.0.'+status));}
});
test('co-applicant and employment requirements refer to the correct person and activity',()=>{
  const d=M.sample();d.applicants.push(M.applicant('co','Co-applicant'));assert(paths(d).includes('applicants.1.relationship'));assert(A.issues(d).some(i=>i.path==='applicants.1.firstName'));d.applicants[0].employment.status='retired';assert(!paths(d).includes('applicants.0.employment.employer'));d.applicants[0].employment.status='employed';assert(paths(d).includes('applicants.0.employment.employer'));
});
test('invalid numeric repeated rows expose their exact correction path while valid zero remains accepted',()=>{
  const d=M.sample();d.applicants[0].creditLimits[0].usedAmount=d.applicants[0].creditLimits[0].limit+1;assert(A.issues(d).some(i=>i.path==='applicants.0.creditLimits.0.usedAmount'));d.applicants[0].creditLimits[0].usedAmount=0;d.applicants[0].debts[0].balance=-1;assert(A.issues(d).some(i=>i.path==='applicants.0.debts.0.balance'));d.applicants[0].debts[0].balance=0;d.household.dependants=0;assert(!A.issues(d).some(i=>['household.dependants','applicants.0.debts.0.balance','applicants.0.creditLimits.0.usedAmount'].includes(i.path)));
});
test('bank questions reveal recipient-specific fields without becoming mandatory demo answers',()=>{
  assert.deepEqual(A.extraBanks('applicants.1.idIssuer'),['LHV']);assert.deepEqual(A.extraBanks('applicants.0.employment.type'),['Luminor']);assert.deepEqual(A.extraBanks('loan.contributionSource'),['Swedbank','LHV']);assert.deepEqual(A.extraBanks('applicants.0.email'),[]);assert(!paths(M.sample()).includes('applicants.0.idIssuer'));
});
test('other funding is an entered assumption and is counted once, never as guaranteed cash',()=>{
  const d=M.sample();d.financing.guarantee='MES';d.loan.otherFunding=20000;d.loan.price=A.purchasePrice(d.loan.amount,d.loan.ownContribution,d.loan.otherFunding);assert(paths(d).includes('loan.otherFunding'));const f=O.funding(d,O.samples(d)[0]);assert.equal(f.ownFundsGap,0);assert.equal(f.enteredOtherFunding,20000);assert.equal(f.otherFundingConfirmed,false);d.financing.guarantee='EIS';assert.equal(O.funding(d,O.samples(d)[0]).enteredOtherFunding,0);
});
test('equal-principal amortization agrees with independent closed-form payment and interest values',()=>{
  const p=120000,n=240,r=0.045/12,a=M.amortization(p,4.5,n,'equal-principal',60);close(a.firstPayment,p/n+p*r);close(a.lastPayment,p/n+(p/n)*r);close(a.totalInterest,p*r*(n+1)/2);close(a.totalPayments,p+a.totalInterest);close(a.remainingPrincipal,p*(1-60/n));close(a.horizonInterest,r*(60*p-(p/n)*60*59/2));
});
test('annuity and zero-rate schedules repay principal and preserve their different payment profiles',()=>{
  const a=M.amortization(200000,4.5,300),e=M.amortization(200000,4.5,300,'equal-principal');close(a.firstPayment,a.lastPayment);close(a.totalPayments,200000+a.totalInterest);assert(e.firstPayment>a.firstPayment);assert(e.totalInterest<a.totalInterest);for(const schedule of ['annuity','equal-principal']){const z=M.amortization(120000,0,240,schedule);close(z.firstPayment,500);close(z.totalInterest,0);close(z.remainingPrincipal,0);}assert.equal(M.amortization(1,2,240,'other'),null);
});
test('equal-principal offer totals use varying payments and do not invent a fixed monthly payback',()=>{
  const d=M.sample(),a={...O.samples(d)[0],schedule:'equal-principal'},b={...a,id:'b',margin:1.3};const s=O.scenario(d,a,assumptions),r=O.compare(d,a,b,assumptions),am=M.amortization(a.principal,3.5,300,'equal-principal',60);close(s.fullTermInterest,am.totalInterest);close(s.fullTermOutflow,am.totalPayments+s.knownUpfrontCosts+s.knownMonthlyExtras*300);assert(s.fullTermOutflow<s.monthlyOutflow*300+s.knownUpfrontCosts);assert.equal(r.paybackMonths,null);
});
test('mixed schedules and unknown costs withhold complete savings claims',()=>{
  const d=M.sample(),a=O.samples(d)[0],b={...a,id:'b',schedule:'equal-principal'};assert.equal(O.compare(d,a,b,assumptions).comparable,false);b.schedule='annuity';b.notaryFee=null;const r=O.compare(d,a,b,assumptions);assert.equal(r.upfrontCostDifference,null);assert.equal(r.horizonCostDifference,null);assert.equal(r.paybackMonths,null);assert.equal(r.realisedSavings,null);
});
test('application requirement labels and correction messages have bilingual coverage',()=>{
  const d=M.sample();d.applicants.push(M.applicant('co','Co-applicant'));d.loan.purpose='construction';d.financing.additionalCollateral=true;d.financing.guarantee='MES';d.loan.otherFunding=-1;d.household.disposableAmount=NaN;d.applicants[0].creditLimits[0].usedAmount=100000;for(const [,label] of A.requirements(d))assert(I.hasTranslation(label),'Missing label: '+label);for(const issue of A.issues(d)){assert(I.hasTranslation(issue.message),'Missing error: '+issue.message);assert(I.hasTranslation(issue.label),'Missing error label: '+issue.label);}
});
