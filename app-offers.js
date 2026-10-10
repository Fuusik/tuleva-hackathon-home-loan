/* Fictional offer intake and constant-rate annuity cost scenarios, not APR. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./app-model.js'):root.LoanModel);if(typeof module==='object'&&module.exports)module.exports=api;else root.LoanOffers=api;})(typeof globalThis!=='undefined'?globalThis:this,function(M){
  'use strict';
  const upfront=['contractFee','valuationFee','notaryFee','stateFee','guaranteeFee','otherUpfront'];
  const recurring=['homeInsurance','lifeInsurance','loanProtection','accountFee','otherMonthly'];
  const costLabels={contractFee:'Contract fee',valuationFee:'Valuation fee',notaryFee:'Notary fee',stateFee:'State fee',guaranteeFee:'Guarantee fee',otherUpfront:'Other upfront costs',homeInsurance:'Home insurance / month',lifeInsurance:'Life insurance / month',loanProtection:'Loan protection / month',accountFee:'Account costs / month',otherMonthly:'Other monthly costs'};
  function blank(id){return {id,name:'',source:'',validUntil:'',principal:null,termYears:null,termMonths:null,currency:'EUR',margin:null,benchmarkPeriod:'',resetMonths:null,schedule:'annuity',apr:null,earlyRepayment:'',conditions:'',insuranceTerms:'',contractFee:null,valuationFee:null,notaryFee:null,stateFee:null,guaranteeFee:null,otherUpfront:null,homeInsurance:null,lifeInsurance:null,loanProtection:null,accountFee:null,otherMonthly:null,
    bank:'',seriesId:'',previousId:'',variant:'',offeredAt:'',stage:'indicative',evidence:'demo',historical:false,fieldEvidence:{},ownContribution:null,marginKind:'exact',action:'new',contractFeeMode:'fixed',contractFeePercent:null,contractFeeMin:null,contractFeeMax:null,conditional:false,salaryShare:null,conditionMonths:null,breachSurcharge:null,accountPromo:false,promoMonths:null,promoAccountFee:null,rebateEnabled:false,rebateCap:null,rebateEligible:'notaryFee',rebateConfirmed:false,valuationPortable:'unknown',exitFee:null};}
  function samples(d){return ['A','B'].map((name,i)=>({...blank('offer-'+name),name:'Example '+name,source:'Fictional offer after local simulation',validUntil:'2026-11-10',principal:d.loan.amount,termYears:d.loan.termYears,margin:i?1.7:1.5,benchmarkPeriod:'6M',resetMonths:6,contractFee:i?0:500,valuationFee:250,notaryFee:700,stateFee:150,guaranteeFee:0,otherUpfront:0,homeInsurance:18,lifeInsurance:i?0:25,loanProtection:0,accountFee:i?0:3,otherMonthly:0,earlyRepayment:'Fictional condition: confirm notice and compensation',conditions:'Fictional condition: clarify salary account and bundled products',insuranceTerms:'Fictional example: home cover included; life cover optional in this scenario'}));}
  const monthsOf=o=>M.has(o.termMonths)?o.termMonths:M.has(o.termYears)?o.termYears*12:null;
  function funding(d,o){
    const known=typeof o.principal==='number'&&Number.isFinite(o.principal)&&o.principal>0;
    const cash=M.has(d.loan.price)&&known?Math.max(0,d.loan.price-o.principal,M.has(o.ownContribution)?o.ownContribution:0):null;
    return {offeredPrincipal:known?o.principal:null,requestedPrincipal:d.loan.amount,amountShortfall:known&&M.has(d.loan.amount)?Math.max(0,d.loan.amount-o.principal):null,requiredOwnFunds:cash,ownFundsGap:cash!==null&&M.has(d.loan.ownContribution)?Math.max(0,cash-d.loan.ownContribution):null,confirmedAmount:known&&!o.fieldEvidence?.principal,approvalStage:o.stage,bankEligibilityConfirmed:false};
  }
  function scenario(d,offer,assumptions){
    const invalid=[],missing=[],warnings=[];
    const validNumber=(v,min,max=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
    for(const k of [...upfront,...recurring]){if(!M.has(offer[k]))missing.push(costLabels[k]);else if(!validNumber(offer[k],0))invalid.push(costLabels[k]);}
    if(!M.has(offer.margin))missing.push('Margin (%)');else if(!validNumber(offer.margin,0,20))invalid.push('Margin (%)');
    const originalMonths=monthsOf(offer),normalised=assumptions.mode==='normalised';
    const principal=normalised?assumptions.principal:offer.principal,termMonths=normalised?assumptions.termMonths:originalMonths;
    if(M.has(offer.principal)&&!validNumber(offer.principal,1))invalid.push('Offer amount and term');
    if(!M.has(offer.principal))missing.push('Offer amount and term');
    if(M.has(originalMonths)&&(!Number.isInteger(originalMonths)||originalMonths<1||originalMonths>360||!M.has(offer.termMonths)&&!Number.isInteger(offer.termYears)))invalid.push('Offer amount and term');
    if(!M.has(originalMonths))missing.push('Offer amount and term');
    if(normalised&&(!validNumber(principal,1)||!Number.isInteger(termMonths)||termMonths<1||termMonths>360))invalid.push('Comparison assumptions');
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
    if(M.has(offer.offeredAt)&&!validDate(offer.offeredAt))invalid.push('Offer date');
    if(M.has(offer.ownContribution)&&!validNumber(offer.ownContribution,0))invalid.push('Minimum own contribution');
    if(!offer.historical&&validDate(offer.validUntil)&&validDate(assumptions.referenceDate)&&offer.validUntil<assumptions.referenceDate)warnings.push('Offer expired on the scenario reference date');
    if(offer.currency!=='EUR')warnings.push('Different currency: no automatic conversion');
    if(!normalised&&(offer.principal!==d.loan.amount||originalMonths!==(assumptions.termMonths||monthsOf(d.loan))))warnings.push('Different amount or term: not comparable on the shared request');
    if(offer.schedule!=='annuity'||d.loan.repaymentSchedule!=='annuity')warnings.push('Special schedule: no annuity comparison');
    if(offer.benchmarkPeriod!==assumptions.benchmarkPeriod||offer.resetMonths!==assumptions.resetMonths)warnings.push('Different benchmark or reset interval: comparison withheld');
    let effectiveMargin=offer.margin;
    if(offer.conditional){for(const [k,min,max] of [['salaryShare',0,100],['conditionMonths',1,360],['breachSurcharge',0,20]]){if(!M.has(offer[k]))missing.push('Conditional discount details');else if(!validNumber(offer[k],min,max)||k==='conditionMonths'&&!Number.isInteger(offer[k]))invalid.push('Conditional discount details');}
      if(assumptions.conditionScenario==='breach')effectiveMargin=validNumber(offer.margin,0,20)&&validNumber(offer.breachSurcharge,0,20)?offer.margin+offer.breachSurcharge:null;
    }
    for(const [flag,keys] of [['accountPromo',['promoMonths','promoAccountFee']],['rebateEnabled',['rebateCap']]])if(offer[flag])for(const k of keys){if(!M.has(offer[k]))missing.push('Additional cost details');else if(!validNumber(offer[k],0)||k==='promoMonths'&&!Number.isInteger(offer[k]))invalid.push('Additional cost details');}
    if(offer.action==='switch'){if(!M.has(offer.exitFee))missing.push('Existing loan exit fee');else if(!validNumber(offer.exitFee,0))invalid.push('Existing loan exit fee');}
    if(offer.contractFeeMode==='percent'){
      const at=missing.indexOf(costLabels.contractFee);if(at>=0)missing.splice(at,1);
      if(!validNumber(offer.contractFeePercent,0,100))M.has(offer.contractFeePercent)?invalid.push('Percentage contract fee'):missing.push('Percentage contract fee');
      for(const k of ['contractFeeMin','contractFeeMax'])if(M.has(offer[k])&&!validNumber(offer[k],0))invalid.push('Percentage contract fee');
      if(M.has(offer.contractFeeMin)&&M.has(offer.contractFeeMax)&&offer.contractFeeMin>offer.contractFeeMax)invalid.push('Percentage contract fee');
    }
    const contractFee=offer.contractFeeMode==='percent'&&validNumber(offer.contractFeePercent,0,100)&&validNumber(principal,1)?Math.min(M.has(offer.contractFeeMax)?offer.contractFeeMax:Infinity,Math.max(offer.contractFeeMin||0,principal*offer.contractFeePercent/100)):offer.contractFeeMode==='fixed'?offer.contractFee:null;
    if(!['fixed','percent'].includes(offer.contractFeeMode))invalid.push('Percentage contract fee');
    if(offer.rebateEnabled&&!upfront.includes(offer.rebateEligible))invalid.push('Additional cost details');
    const comparable=!invalid.length&&!warnings.length&&validNumber(principal,1)&&Number.isInteger(termMonths)&&termMonths>0;
    const rateKnown=validNumber(effectiveMargin,0,40);
    const monthly=comparable&&rateKnown?M.payment(principal,effectiveMargin+assumptions.benchmark,termMonths):null;
    const knownSum=keys=>keys.reduce((n,k)=>n+(validNumber(offer[k],0)?offer[k]:0),0);
    const eligibleCost=offer.rebateEligible==='contractFee'?contractFee:offer[offer.rebateEligible];
    const rebate=offer.rebateEnabled&&offer.rebateConfirmed&&validNumber(offer.rebateCap,0)&&validNumber(eligibleCost,0)?Math.min(eligibleCost,offer.rebateCap):0;
    const once=knownSum(upfront.filter(k=>k!=='contractFee'))+(validNumber(contractFee,0)?contractFee:0)+(offer.action==='switch'&&validNumber(offer.exitFee,0)?offer.exitFee:0)-rebate;
    const monthlyExtras=knownSum(recurring),costsComplete=validNumber(contractFee,0)&&[...upfront.filter(k=>k!=='contractFee'),...recurring].every(k=>validNumber(offer[k],0))&&(!offer.action||offer.action!=='switch'||validNumber(offer.exitFee,0))&&(!offer.accountPromo||validNumber(offer.promoMonths,0)&&validNumber(offer.promoAccountFee,0));
    const months=Math.min(assumptions.horizonYears*12,termMonths);
    const extraTotal=n=>monthlyExtras*n+(offer.accountPromo&&validNumber(offer.promoMonths,0)&&validNumber(offer.promoAccountFee,0)?(offer.promoAccountFee-(validNumber(offer.accountFee,0)?offer.accountFee:0))*Math.min(n,offer.promoMonths):0);
    const firstExtras=monthlyExtras+(offer.accountPromo&&offer.promoMonths>0&&validNumber(offer.promoAccountFee,0)&&validNumber(offer.accountFee,0)?offer.promoAccountFee-offer.accountFee:0);
    let balance=null,interest=null;
    if(monthly!==null){balance=principal;interest=0;const r=(effectiveMargin+assumptions.benchmark)/1200;for(let m=0;m<months;m++){const charge=balance*r;interest+=charge;balance=Math.max(0,balance+charge-monthly);}if(months===termMonths)balance=0;}
    const notices=[];
    if(normalised)notices.push('Hypothetical equal-amount and equal-term scenario; not a bank offer');
    if(Object.values(offer.fieldEvidence||{}).some(v=>v==='user-edited'||v==='user-entered'))notices.push('Manually edited demo terms; source confirmation needed');
    if(offer.historical)notices.push('Historical example; not a current offer');
    if(Object.values(offer.fieldEvidence||{}).some(v=>v==='inherited'))notices.push('Inherited terms need reconfirmation');
    if(Object.values(offer.fieldEvidence||{}).some(v=>v==='assumed'))notices.push('Some terms are modelling assumptions');
    if(offer.evidence==='borrower-reported')notices.push('Borrower-reported terms need written bank confirmation');
    if(offer.marginKind==='from')notices.push('Starting margin; personalised price not confirmed');
    if(offer.rebateEnabled&&!offer.rebateConfirmed)notices.push('Unconfirmed reimbursement excluded from totals');
    return {comparable,invalid,missing:[...new Set(missing)],warnings,notices,normalised,effectiveMargin,termMonths,principal,rebateApplied:rebate,funding:funding(d,offer),monthlyPayment:monthly,knownMonthlyExtras:monthlyExtras,knownUpfrontCosts:once,costsComplete,
      monthlyOutflow:monthly!==null&&costsComplete?monthly+firstExtras:null,
      horizonMonths:months,remainingPrincipal:balance,horizonInterest:interest,
      horizonCost:interest!==null&&costsComplete?interest+once+extraTotal(months):null,
      fullTermOutflow:monthly!==null&&costsComplete?monthly*termMonths+once+extraTotal(termMonths):null,
      knownCostSubtotal:interest!==null?interest+once+extraTotal(months):null,
      calculatedAPR:null,assumption:'Constant benchmark, margin and entered fees; illustrative scenario only'};
  }
  function compare(d,a,b,assumptions){const x=scenario(d,a,assumptions),y=scenario(d,b,assumptions);
    const same=x.comparable&&y.comparable&&x.principal===y.principal&&x.termMonths===y.termMonths;
    const delta=same&&x.monthlyOutflow!==null&&y.monthlyOutflow!==null?x.monthlyOutflow-y.monthlyOutflow:null;
    const investment=y.knownUpfrontCosts-x.knownUpfrontCosts;
    return {comparable:same,marginChange:M.has(a.margin)&&M.has(b.margin)?b.margin-a.margin:null,termExtensionMonths:M.has(monthsOf(a))&&M.has(monthsOf(b))?monthsOf(b)-monthsOf(a):null,monthlyDifference:delta,horizonCostDifference:same&&x.horizonCost!==null&&y.horizonCost!==null?x.horizonCost-y.horizonCost:null,fullTermInterestDifference:same&&x.monthlyPayment!==null&&y.monthlyPayment!==null?x.monthlyPayment*x.termMonths-y.monthlyPayment*y.termMonths:null,paybackMonths:same&&x.costsComplete&&y.costsComplete&&!a.accountPromo&&!b.accountPromo&&delta>0?Math.max(0,investment)/delta:null,realisedSavings:null};
  }
  return {upfront,recurring,costLabels,blank,samples,scenario,monthsOf,funding,compare};
});
