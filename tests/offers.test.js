'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const M=require('../app-model.js'),O=require('../app-offers.js'),I=require('../app-i18n.js');
const assumptions={benchmark:3,horizonYears:5,referenceDate:'2026-10-10',benchmarkPeriod:'6M',resetMonths:6};
test('offer comparison includes each upfront and recurring cost once and separates principal',()=>{
  const d=M.sample(),o=O.samples(d)[0],r=O.scenario(d,o,assumptions);
  assert(r.comparable);assert(r.costsComplete);assert.equal(r.knownUpfrontCosts,1600);assert.equal(r.knownMonthlyExtras,46);assert.equal(r.horizonMonths,60);
  assert(Math.abs(r.monthlyOutflow-r.monthlyPayment-46)<1e-8);
  assert(Math.abs(r.horizonCost-(r.horizonInterest+1600+46*60))<1e-8);
  const repaid=d.loan.amount-r.remainingPrincipal;assert(Math.abs(r.monthlyPayment*60-repaid-r.horizonInterest)<1e-6);
  assert(Math.abs(r.fullTermOutflow-(r.monthlyPayment*300+1600+46*300))<1e-8);assert.equal(r.calculatedAPR,null);
});
test('unknown costs do not silently become zero or a complete total',()=>{
  const d=M.sample(),o=O.samples(d)[0];o.notaryFee=null;const r=O.scenario(d,o,assumptions);
  assert.equal(r.costsComplete,false);assert.equal(r.horizonCost,null);assert.equal(r.fullTermOutflow,null);assert.equal(r.monthlyOutflow,null);assert(r.knownCostSubtotal>0);assert(r.missing.includes('Notary fee'));
  o.notaryFee=0;assert(O.scenario(d,o,assumptions).costsComplete);
});
test('zero interest and costs produce zero borrowing cost and correct remaining principal',()=>{
  const d=M.sample(),o=O.samples(d)[0];o.margin=0;[...O.upfront,...O.recurring].forEach(k=>o[k]=0);
  const r=O.scenario(d,o,{...assumptions,benchmark:0});assert.equal(r.horizonCost,0);assert(Math.abs(r.remainingPrincipal-160000)<1e-6);assert(Math.abs(r.fullTermOutflow-200000)<1e-6);
});
test('cost horizon is clipped to loan term and remaining principal reaches zero',()=>{
  const d=M.sample(),o=O.samples(d)[0],r=O.scenario(d,o,{...assumptions,horizonYears:30});assert.equal(r.horizonMonths,300);assert.equal(r.remainingPrincipal,0);assert(Math.abs(r.fullTermOutflow-r.horizonCost-d.loan.amount)<1e-6);
});
test('different amount, term, currency, schedule, benchmark and resets cannot silently compare',()=>{
  const d=M.sample(),baseline=O.samples(d)[0];for(const patch of [{principal:100000},{termYears:20},{currency:'USD'},{schedule:'special'},{benchmarkPeriod:'3M'},{resetMonths:3}]){const r=O.scenario(d,{...baseline,...patch},assumptions);assert(!r.comparable);assert.equal(r.monthlyPayment,null);assert.equal(r.horizonCost,null);assert(r.warnings.length);}
  d.loan.repaymentSchedule='special';assert.equal(O.scenario(d,baseline,assumptions).monthlyPayment,null);
});
test('negative, non-finite and invalid dates or assumptions suppress totals',()=>{
  const d=M.sample(),o=O.samples(d)[0];for(const patch of [{contractFee:-1},{homeInsurance:Infinity},{margin:NaN},{apr:-2},{validUntil:'2026-02-30'},{termYears:2.5}]){const r=O.scenario(d,{...o,...patch},assumptions);assert(r.invalid.length);assert.equal(r.fullTermOutflow,null);}
  for(const patch of [{benchmark:null},{horizonYears:0},{referenceDate:''},{benchmarkPeriod:'unknown'},{resetMonths:0}])assert(O.scenario(d,o,{...assumptions,...patch}).invalid.length);
});
test('expired offer and missing margin cannot generate a comparable cash-flow claim',()=>{
  const d=M.sample(),o=O.samples(d)[0];const expired=O.scenario(d,{...o,validUntil:'2026-10-09'},assumptions);assert(!expired.comparable);assert(expired.warnings.includes('Offer expired on the scenario reference date'));
  const missing=O.scenario(d,{...o,margin:null},assumptions);assert.equal(missing.monthlyPayment,null);assert(missing.missing.includes('Margin (%)'));
});
test('provided APR, source, expiry and qualitative conditions remain distinct from scenario totals',()=>{
  const d=M.sample(),o=O.samples(d)[0],before=JSON.stringify(o);const r=O.scenario(d,o,assumptions);assert(r.missing.includes('APR supplied in offer (%)'));assert.equal(r.calculatedAPR,null);assert(r.monthlyPayment>0);assert.equal(JSON.stringify(o),before);
  o.apr=4.75;assert(!O.scenario(d,o,assumptions).missing.includes('APR supplied in offer (%)'));
  o.insuranceTerms='';assert(O.scenario(d,o,assumptions).missing.includes('Insurance requirements / cover'));
});
test('manual offers start with unknown costs and fictional examples carry no bank provenance claim',()=>{
  const d=M.sample(),blank=O.blank('manual');[...O.upfront,...O.recurring].forEach(k=>assert.equal(blank[k],null));assert.equal(blank.source,'');
  for(const o of O.samples(d)){assert.equal(o.principal,d.loan.amount);assert.equal(o.termYears,d.loan.termYears);assert.equal(o.source,'Fictional offer after local simulation');assert.equal(o.apr,null);}
});
test('all comparison gaps and cost labels have Estonian coverage with stable numeric results',()=>{
  const d=M.sample(),o=O.samples(d)[0],before=O.scenario(d,o,assumptions);I.setLocale('et');
  const keys=[...Object.values(O.costLabels),...before.missing,...O.scenario(d,{...o,principal:100},assumptions).warnings,...O.scenario(d,{...o,notaryFee:-1},assumptions).invalid];for(const k of keys)assert(I.hasTranslation(k),'Missing '+k);
  I.setLocale('en');assert.deepEqual(O.scenario(d,o,assumptions),before);I.setLocale('et');
});
