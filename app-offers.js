/* Fictional offer intake and constant-rate annuity cost scenarios, not APR. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./app-model.js'):root.LoanModel);if(typeof module==='object'&&module.exports)module.exports=api;else root.LoanOffers=api;})(typeof globalThis!=='undefined'?globalThis:this,function(M){
  'use strict';
  const upfront=['contractFee','valuationFee','notaryFee','stateFee','guaranteeFee','otherUpfront'];
  const recurring=['homeInsurance','lifeInsurance','loanProtection','accountFee','otherMonthly'];
  const costLabels={contractFee:'Contract fee',valuationFee:'Valuation fee',notaryFee:'Notary fee',stateFee:'State fee',guaranteeFee:'Guarantee fee',otherUpfront:'Other upfront costs',homeInsurance:'Home insurance / month',lifeInsurance:'Life insurance / month',loanProtection:'Loan protection / month',accountFee:'Account costs / month',otherMonthly:'Other monthly costs'};
  function blank(id){return {id,name:'',source:'',validUntil:'',principal:null,termYears:null,currency:'EUR',margin:null,benchmarkPeriod:'',resetMonths:null,schedule:'annuity',apr:null,earlyRepayment:'',conditions:'',insuranceTerms:'',contractFee:null,valuationFee:null,notaryFee:null,stateFee:null,guaranteeFee:null,otherUpfront:null,homeInsurance:null,lifeInsurance:null,loanProtection:null,accountFee:null,otherMonthly:null};}
  function samples(d){return ['A','B'].map((name,i)=>({...blank('offer-'+name),name:'Example '+name,source:'Fictional offer after local simulation',validUntil:'2026-11-10',principal:d.loan.amount,termYears:d.loan.termYears,margin:i?1.7:1.5,benchmarkPeriod:'6M',resetMonths:6,contractFee:i?0:500,valuationFee:250,notaryFee:700,stateFee:150,guaranteeFee:0,otherUpfront:0,homeInsurance:18,lifeInsurance:i?0:25,loanProtection:0,accountFee:i?0:3,otherMonthly:0,earlyRepayment:'Fictional condition: confirm notice and compensation',conditions:'Fictional condition: clarify salary account and bundled products',insuranceTerms:'Fictional example: home cover included; life cover optional in this scenario'}));}
  function scenario(d,offer,assumptions){
    const invalid=[],missing=[],warnings=[];
    const validNumber=(v,min,max=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
    for(const k of [...upfront,...recurring]){if(!M.has(offer[k]))missing.push(costLabels[k]);else if(!validNumber(offer[k],0))invalid.push(costLabels[k]);}
    if(!M.has(offer.margin))missing.push('Margin (%)');else if(!validNumber(offer.margin,0,20))invalid.push('Margin (%)');
    if(!validNumber(offer.principal,1)||!Number.isInteger(offer.termYears)||offer.termYears<1||offer.termYears>30)invalid.push('Offer amount and term');
    if(!validNumber(assumptions.benchmark,0,20)||!Number.isInteger(assumptions.horizonYears)||assumptions.horizonYears<1||assumptions.horizonYears>30)invalid.push('Comparison assumptions');
    if(!['3M','6M','12M'].includes(assumptions.benchmarkPeriod)||!Number.isInteger(assumptions.resetMonths)||assumptions.resetMonths<1)invalid.push('Comparison assumptions');
    if(M.has(offer.apr)&&!validNumber(offer.apr,0,100))invalid.push('APR supplied in offer (%)');
    if(M.has(offer.resetMonths)&&(!Number.isInteger(offer.resetMonths)||offer.resetMonths<1||offer.resetMonths>60))invalid.push('Rate reset interval (months)');
    if(!['3M','6M','12M'].includes(offer.benchmarkPeriod))missing.push('Benchmark period');
    if(!M.has(offer.resetMonths))missing.push('Rate reset interval (months)');
    for(const [k,label] of [['name','Offer name'],['source','Offer source / reference'],['validUntil','Offer expiry'],['earlyRepayment','Early repayment terms'],['conditions','Other conditions'],['insuranceTerms','Insurance requirements / cover'],['apr','APR supplied in offer (%)']])if(!M.has(offer[k]))missing.push(label);
    const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
    if(!validDate(assumptions.referenceDate))invalid.push('Scenario reference date');
    if(M.has(offer.validUntil)&&!validDate(offer.validUntil))invalid.push('Offer expiry');
    if(validDate(offer.validUntil)&&validDate(assumptions.referenceDate)&&offer.validUntil<assumptions.referenceDate)warnings.push('Offer expired on the scenario reference date');
    if(offer.currency!=='EUR')warnings.push('Different currency: no automatic conversion');
    if(offer.principal!==d.loan.amount||offer.termYears!==d.loan.termYears)warnings.push('Different amount or term: not comparable on the shared request');
    if(offer.schedule!=='annuity'||d.loan.repaymentSchedule!=='annuity')warnings.push('Special schedule: no annuity comparison');
    if(offer.benchmarkPeriod!==assumptions.benchmarkPeriod||offer.resetMonths!==assumptions.resetMonths)warnings.push('Different benchmark or reset interval: comparison withheld');
    const comparable=!invalid.length&&!warnings.length;
    const rateKnown=validNumber(offer.margin,0,20);
    const monthly=comparable&&rateKnown?M.payment(offer.principal,offer.margin+assumptions.benchmark,offer.termYears*12):null;
    const knownSum=keys=>keys.reduce((n,k)=>n+(validNumber(offer[k],0)?offer[k]:0),0);
    const once=knownSum(upfront),monthlyExtras=knownSum(recurring),costsComplete=[...upfront,...recurring].every(k=>validNumber(offer[k],0));
    const months=Math.min(assumptions.horizonYears*12,offer.termYears*12);
    let balance=null,interest=null;
    if(monthly!==null){balance=offer.principal;interest=0;const r=(offer.margin+assumptions.benchmark)/1200;for(let m=0;m<months;m++){const charge=balance*r;interest+=charge;balance=Math.max(0,balance+charge-monthly);}if(months===offer.termYears*12)balance=0;}
    return {comparable,invalid,missing:[...new Set(missing)],warnings,monthlyPayment:monthly,knownMonthlyExtras:monthlyExtras,knownUpfrontCosts:once,costsComplete,
      monthlyOutflow:monthly!==null&&costsComplete?monthly+monthlyExtras:null,
      horizonMonths:months,remainingPrincipal:balance,horizonInterest:interest,
      horizonCost:interest!==null&&costsComplete?interest+once+monthlyExtras*months:null,
      fullTermOutflow:monthly!==null&&costsComplete?monthly*offer.termYears*12+once+monthlyExtras*offer.termYears*12:null,
      knownCostSubtotal:interest!==null?interest+once+monthlyExtras*months:null,
      calculatedAPR:null,assumption:'Constant benchmark, margin and entered fees; illustrative scenario only'};
  }
  return {upfront,recurring,costLabels,blank,samples,scenario};
});
