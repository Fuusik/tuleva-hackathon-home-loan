'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../app-model.js'),O=require('../app-offers.js'),W=require('../app-workflow.js'),N=require('../app-negotiation.js'),I=require('../app-i18n.js');
const assumptions={benchmark:2,horizonYears:5,referenceDate:'2026-10-10',benchmarkPeriod:'6M',resetMonths:6};
function complete(o){for(const k of [...O.upfront,...O.recurring])if(o[k]===null)o[k]=0;if(o.action==='switch')o.exitFee=0;return o;}
test('all six selected banks simulate locally with recipient-specific permissions and preserved gaps',()=>{
  const d=M.sample();d.selectedBanks=[...M.banks];d.applicants[0].emtaPermissions=M.banks.map(bank=>({bank,status:'allow',genuineAuthorization:false}));const reviews=W.createReviews();W.sections.forEach(s=>reviews.mark(s,d.revision,true));
  assert.deepEqual(W.simulationBanks,M.banks);for(const bank of M.banks){const r=W.simulate(d,bank,reviews.snapshot(d.revision),true);assert.equal(r.form.sentToBank,false);assert.equal(r.form.bankReceipt,null);assert(r.form.omittedOrUnverified.length);assert.equal(r.form.emtaChoices[0].choices.length,1);assert.equal(r.form.emtaChoices[0].choices[0].bank,bank);if(r.form.unmappedSharedData){assert.equal(r.form.mappingDepth,'preparation-only');assert.equal(r.form.unmappedSharedData.applicants[0].emtaPermissions.length,1);}}
});
test('Coop illustrative refinancing rule never removes debt from canonical data',()=>{
  const d=M.sample();d.loan.purpose='refinancing';d.applicants[0].debts[0].refinanced=true;const r=W.illustrativeForm(d,'Coop Pank');assert.equal(r.fields.illustrativeObligations[0].debts.length,0);assert.equal(M.exportSummary(d).application.applicants[0].debts.length,1);assert.equal(r.unmappedSharedData.applicants[0].debts.length,1);
});
test('remaining term accepts 345 months and rejects conflicting or invalid year/month input',()=>{
  const d=M.sample();d.loan.termYears=null;d.loan.termMonths=345;assert.equal(M.errors(d).length,0);assert.equal(W.illustrativeForm(d,'Luminor').fields.loanRequest.termMonths,345);assert(!W.readiness(d,'Luminor').observed[0].missing.includes('Term'));
  d.loan.termYears=30;assert(M.errors(d).some(x=>x.includes('disagree')));d.loan.termYears=null;d.loan.termMonths=345.5;assert(M.errors(d).some(x=>x.includes('360 months')));
});
test('normalisation never changes original financing availability or conceals shortfalls',()=>{
  const d=M.sample();d.loan.amount=400000;d.loan.price=400000;d.loan.ownContribution=0;const o={...O.samples(d)[0],bank:'Coop Pank',principal:350000};
  const before=JSON.stringify(o),r=O.scenario(d,o,{...assumptions,mode:'normalised',principal:400000,termMonths:360});assert(r.comparable);assert.equal(r.principal,400000);assert.equal(r.funding.offeredPrincipal,350000);assert.equal(r.funding.ownFundsGap,50000);assert.equal(r.funding.bankEligibilityConfirmed,false);assert.equal(JSON.stringify(o),before);
});
test('original amount and term still withhold equivalent comparison without explicit normalisation',()=>{
  const d=M.sample(),o={...O.samples(d)[0],principal:d.loan.amount+10000,termYears:30};assert(!O.scenario(d,o,assumptions).comparable);assert(O.scenario(d,o,{...assumptions,mode:'normalised',principal:400000,termMonths:360}).comparable);
});
test('conditional demo margin stress-tests the surcharge and missing margin stays unknown',()=>{
  const d=M.sample(),o={...O.samples(d)[0],margin:1.5,conditional:true,salaryShare:80,conditionMonths:24,breachSurcharge:0.2},a={...assumptions,mode:'normalised',principal:400000,termMonths:360};
  const met=O.scenario(d,o,a),breach=O.scenario(d,o,{...a,conditionScenario:'breach'});assert.equal(met.effectiveMargin,1.5);assert(Math.abs(breach.effectiveMargin-1.7)<1e-12);assert(breach.monthlyPayment>met.monthlyPayment);o.margin=null;assert.equal(O.scenario(d,o,{...a,conditionScenario:'breach'}).monthlyPayment,null);
});
test('percentage contract fees obey minimum and maximum and calculate on the explicit model principal',()=>{
  const d=M.sample(),o=complete(O.samples(d)[0]);o.contractFeeMode='percent';o.contractFeePercent=0.3;o.contractFee=0;o.contractFeeMin=800;o.contractFeeMax=1000;O.upfront.filter(k=>k!=='contractFee').forEach(k=>o[k]=0);
  assert.equal(O.scenario(d,o,assumptions).knownUpfrontCosts,800);assert.equal(O.scenario(d,o,{...assumptions,mode:'normalised',principal:500000,termMonths:300}).knownUpfrontCosts,1000);o.contractFeeMin=1001;assert(O.scenario(d,o,assumptions).invalid.length);
});
test('temporary account fee is counted only during its promotion and unknown later price prevents totals',()=>{
  const d=M.sample(),o=complete(O.samples(d)[0]);o.accountFee=10;o.accountPromo=true;o.promoMonths=12;o.promoAccountFee=0;const r=O.scenario(d,o,assumptions);const ordinary=O.scenario(d,{...o,accountPromo:false},assumptions);assert.equal(Math.round(ordinary.horizonCost-r.horizonCost),120);assert.equal(Math.round(ordinary.monthlyOutflow-r.monthlyOutflow),10);
  o.accountFee=null;o.promoAccountFee=3;assert.equal(O.scenario(d,o,assumptions).horizonCost,null);
});
test('capped reimbursements are deducted once, never exceed eligible cost and remain excluded until confirmed',()=>{
  const d=M.sample(),o=complete(O.samples(d)[0]);o.notaryFee=700;o.rebateEnabled=true;o.rebateCap=500;o.rebateEligible='notaryFee';const before=O.scenario(d,o,assumptions);assert.equal(before.rebateApplied,0);assert(before.notices.some(x=>x.includes('Unconfirmed')));o.rebateConfirmed=true;const after=O.scenario(d,o,assumptions);assert.equal(before.knownUpfrontCosts-after.knownUpfrontCosts,500);o.notaryFee=200;assert.equal(O.scenario(d,o,assumptions).rebateApplied,200);
});
test('switching requires exit cost and longer terms cannot claim same-term cash-flow savings',()=>{
  const d=M.sample(),a=complete(O.samples(d)[0]),b={...a,id:'b',margin:1.3,action:'switch',exitFee:null};assert.equal(O.scenario(d,b,assumptions).horizonCost,null);assert.equal(O.compare(d,a,b,assumptions).paybackMonths,null);b.exitFee=0;b.termMonths=360;assert.equal(O.compare(d,a,b,assumptions).monthlyDifference,null);assert.equal(O.compare(d,a,b,assumptions).termExtensionMonths,60);
});
test('simple payback requires complete stable costs and preserves its limited interpretation',()=>{
  const d=M.sample(),a=complete(O.samples(d)[0]),b=complete({...a,id:'b',margin:1.4,contractFee:a.contractFee+50});const r=O.compare(d,a,b,assumptions);assert(r.paybackMonths>0);assert(Math.abs(r.paybackMonths-50/r.monthlyDifference)<1e-10);b.accountPromo=true;b.promoMonths=12;b.promoAccountFee=0;assert.equal(O.compare(d,a,b,assumptions).paybackMonths,null);
});
function prepared(context={}){const offers=O.samples(M.sample()).map((o,i)=>({...o,bank:i?'Luminor':'LHV',conditional:!!i,salaryShare:i?80:null,conditionMonths:i?24:null,breachSurcharge:i?0.2:null})),round=N.createRound(),draft=N.draft({bank:'LHV',request:{principal:400000,termMonths:360},offers,sharedIds:['offer-B'],fields:['margin','conditions']});round.prepare(1,offers,[draft],context);round.update('LHV','recipient','bank@example.test');round.update('LHV','message','Fictional final-offer request');round.update('LHV','reviewed',true);return {round,offers,draft};}
test('negotiation discloses only selected competitor terms with evidence and no applicant or attachment data',()=>{
  const {draft}=prepared();assert.deepEqual(Object.keys(draft.sharedOffers[0].terms),['margin','conditions']);assert.equal(draft.sharedOffers[0].terms.margin,1.7);assert.equal(draft.sharedOffers[0].evidence,'demo');assert.equal(draft.sharedOffers[0].priceQualifications.salaryShare,80);assert.equal(draft.sharedOffers[0].priceQualifications.conditionMonths,24);assert.equal(draft.sharedOffers[0].priceQualifications.breachSurcharge,0.2);assert.equal(draft.attachments.length,0);assert.equal(draft.genuineAuthorization,false);assert(!JSON.stringify(draft).includes('personalId'));
});
test('one reviewed demo round never sends anything and cannot be repeated',()=>{
  const {round,offers}=prepared(),r=round.simulate(1,offers,'2026-10-10T12:00:00Z');assert.equal(r.sent,false);assert.equal(r.roundNumber,1);assert.equal(r.genuineAuthorization,false);assert.throws(()=>round.simulate(1,offers),/single demo round/);assert.throws(()=>round.prepare(1,offers,r.drafts),/single demo round/);
});
test('edits, changed sharing choices or scenarios make a prepared request stale even if reviewed again',()=>{
  const {round,offers}=prepared({fields:['margin']});assert.throws(()=>round.simulate(1,offers,undefined,{fields:['principal']}),/changed/);assert(round.snapshot(1,offers,{fields:['principal']}).stale);assert.throws(()=>round.simulate(2,offers,undefined,{fields:['margin']}),/changed/);offers[0].margin=1.6;assert.throws(()=>round.simulate(1,offers,undefined,{fields:['margin']}),/changed/);
});
test('recipient and message edits withdraw review, require fictional recipients and retain exact reviewed text',()=>{
  const {round,offers}=prepared();round.update('LHV','recipient','bank@real.example');round.update('LHV','reviewed',true);assert.throws(()=>round.simulate(1,offers),/example.test/);round.update('LHV','recipient','bank@example.test');assert.throws(()=>round.simulate(1,offers),/Review/);round.update('LHV','message','Changed text');round.update('LHV','reviewed',true);assert.equal(round.simulate(1,offers).drafts[0].message,'Changed text');
});
test('new replies retain the completed round snapshot while marking the comparison stale',()=>{
  const {round,offers}=prepared(),old=round.simulate(1,offers);offers.push({...offers[0],id:'reply',margin:1.39,previousId:offers[0].id});const state=round.snapshot(1,offers);assert(state.stale);assert.equal(state.simulatedAt,old.simulatedAt);assert.deepEqual(state.drafts,old.drafts);
});
test('negotiation limits selected recipients and refuses duplicate banks or invalid request terms',()=>{
  const {draft,offers}=prepared(),round=N.createRound();assert.throws(()=>round.prepare(1,offers,[]),/one to three/);assert.throws(()=>round.prepare(1,offers,[draft,draft]),/different/);assert.throws(()=>round.prepare(1,offers,[{...draft,request:{principal:400000,termMonths:345.5}}]),/term/);
});
test('offer history records price changes without upgrading inherited field evidence',()=>{
  const original={...O.samples(M.sample())[0],bank:'LHV'},reply={...original,id:'reply',previousId:original.id,margin:1.4,stage:'improved',fieldEvidence:{principal:'inherited'}};const history=N.history([original,reply]),lhv=history[0];assert(lhv.changed.some(c=>c.key==='margin'&&c.before===1.5&&c.after===1.4));assert(!lhv.changed.some(c=>c.key==='principal'));assert.equal(lhv.stage,'improved');
});
test('manual contract check flags omitted, changed and unknown promises without legal confirmation',()=>{
  const offer=O.blank('x');offer.margin=1.9;offer.earlyRepayment='60 days';const results=N.contractCheck(offer,{margin:1.9,earlyRepayment:'3 months',contractFee:250});assert.equal(results.find(c=>c.key==='margin').status,'matches');assert.equal(results.find(c=>c.key==='earlyRepayment').status,'changed');assert.equal(results.find(c=>c.key==='contractFee').status,'promise-unknown');assert(results.every(c=>c.bankConfirmation===false));
});
test('scenario warnings and negotiation errors are bilingual without modifying offer data',()=>{
  I.setLocale('et');const o=O.samples(M.sample())[0];o.principal=153000;o.termYears=null;o.termMonths=345;o.rebateEnabled=true;o.rebateCap=200;o.rebateConfirmed=false;const r=O.scenario(M.sample(),o,{...assumptions,mode:'normalised',principal:153000,termMonths:345});for(const key of [...r.notices,...r.missing,'Check the negotiation amount and term','Review each request and use example.test recipients'])assert(I.hasTranslation(key),'Missing: '+key);const before=JSON.stringify(o);I.setLocale('en');assert.equal(JSON.stringify(o),before);I.setLocale('et');
});
