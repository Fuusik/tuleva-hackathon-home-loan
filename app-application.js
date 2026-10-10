/* Shared preparation rules. Required here means required by this demo, not certified by a bank. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./app-model.js'):root.LoanModel);if(typeof module==='object'&&module.exports)module.exports=api;else root.LoanApplication=api;})(globalThis,function(M){
  'use strict';
  const get=(d,p)=>p.split('.').reduce((v,k)=>v==null?undefined:v[k],d);
  function purchasePrice(amount,cash,other=0){return typeof amount==='number'&&Number.isFinite(amount)&&amount>0&&typeof cash==='number'&&Number.isFinite(cash)&&cash>=0&&typeof other==='number'&&Number.isFinite(other)&&other>=0?amount+cash+other:null;}
  const propertySelected=d=>d.loan.purpose!=='purchase'||d.property.status==='selected';
  function requirements(d){
    const rows=[['loan.purpose','Loan purpose'],['loan.amount','Loan amount'],[d.loan.purpose==='refinancing'?'loan.termMonths':'loan.termYears','Term']];
    if(d.loan.purpose!=='refinancing')rows.push(['loan.ownContribution','Own contribution']);
    if(d.financing.guarantee==='MES')rows.push(['loan.otherFunding','Other financing (€)']);
    if(d.loan.purpose==='purchase')rows.push(['property.status','Have you chosen a home?']);
    rows.push(['household.dependants','All dependants'],['household.monthlyExpenses','Shared monthly household expenses (€)']);
    d.applicants.forEach((a,i)=>{
      const p='applicants.'+i;
      for(const [key,label] of [['firstName','First name'],['lastName','Last name'],['personalId','Fictional personal ID'],['email','Email (fictional)'],['phone','Phone (fictional)'],['address','Current address'],['employment.status','Current activity']])rows.push([p+'.'+key,label]);
      if(i===1)rows.push([p+'.relationship','Relationship to primary applicant']);
      if(a.employment.status==='employed')rows.push([p+'.employment.employer','Employer'],[p+'.employment.tenureMonths','Tenure (months)']);
      for(const [list,status,label,keys] of [['incomes','incomesStatus','Income',[['type','Income type'],['amount','Net amount in original currency'],['currency','Currency'],['frequency','Frequency']]],['debts','debtsStatus','Debt / obligation',[['type','Debt / obligation type'],['lender','Lender / payee'],['balance','Outstanding balance (€)'],['monthlyPayment','Monthly payment (€)']]],['creditLimits','creditsStatus','Credit limit',[['type','Credit limit type'],['lender','Lender'],['limit','Authorised limit (€)']]]]){
        rows.push([p+'.'+status,label+' declaration']);
        if(a[status]==='provided')a[list].forEach((r,j)=>keys.forEach(([key,title])=>rows.push([p+'.'+list+'.'+j+'.'+key,title])));
      }
    });
    if(M.has(d.loan.purpose)&&propertySelected(d))rows.push(['property.type','Property type'],['property.address','Property address']);
    if(d.financing.additionalCollateral)for(const [key,label] of [['type','Property type'],['address','Property address'],['owner','Owner'],['estimatedValue','Estimated value (€)']])rows.push(['additionalProperty.'+key,label]);
    if(['construction','renovation'].includes(d.loan.purpose))rows.push(['loan.price','Purchase price / project budget (€)'],['construction.stageBudget','Stage budget with own / loan funding split']);
    return rows;
  }
  function issues(d){
    const out=requirements(d).filter(([p])=>!M.has(get(d,p))).map(([path,label])=>({path,label,message:'Complete this answer'}));
    d.applicants.forEach((a,i)=>{for(const [list,status,label] of [['incomes','incomesStatus','Income'],['debts','debtsStatus','Debt / obligation'],['creditLimits','creditsStatus','Credit limit']])if(a[status]==='provided'&&!a[list].length)out.push({path:'applicants.'+i+'.'+status,label,message:'Add at least one item or choose None'});});
    const numeric=[['loan.amount','Loan amount',1],['loan.price','Price / budget',1],['loan.ownContribution','Own contribution',0],['loan.otherFunding','Other financing (€)',0],['household.dependants','Dependants',0,true],['household.childrenUnder18','Children under 18',0,true],['household.monthlyExpenses','Household expenses',0],['household.disposableAmount','Disposable money',-Infinity],['property.estimatedValue','Property value',0],['additionalProperty.estimatedValue','Property value',0],['construction.currentValue','Construction value',0],['construction.futureValue','Construction value',0]];
    d.applicants.forEach((a,i)=>{const p='applicants.'+i;numeric.push([p+'.employment.tenureMonths','Tenure (months)',0,true],[p+'.statements.months','Months covered',0,true]);for(const [list,keys] of [['incomes',['amount']],['debts',['balance','monthlyPayment']],['creditLimits',['limit','usedAmount']]])a[list].forEach((r,j)=>keys.forEach(k=>numeric.push([p+'.'+list+'.'+j+'.'+k,({amount:'Net amount in original currency',balance:'Outstanding balance (€)',monthlyPayment:'Monthly payment (€)',limit:'Authorised limit (€)',usedAmount:'Used amount (€) - optional'})[k],0])));});
    for(const [path,label,min,integer] of numeric){const v=get(d,path);if(M.has(v)&&(typeof v!=='number'||!Number.isFinite(v)||v<min||integer&&!Number.isInteger(v)))out.push({path,label,message:integer?'Enter a valid whole number':'Enter a valid amount'});}
    for(const [path,max] of [['loan.termYears',30],['loan.termMonths',360],['loan.paymentDay',31]]){const v=get(d,path);if(M.has(v)&&(!Number.isInteger(v)||v<1||v>max))out.push({path,label:path==='loan.paymentDay'?'Preferred payment day':'Term',message:'Check the allowed range'});}
    if(M.has(d.loan.termYears)&&M.has(d.loan.termMonths)&&d.loan.termMonths!==d.loan.termYears*12)out.push({path:'loan.termMonths',label:'Term',message:'Use one consistent term'});
    if(M.has(d.loan.price)&&M.has(d.loan.ownContribution)&&d.loan.ownContribution>d.loan.price)out.push({path:'loan.ownContribution',label:'Own contribution',message:'Own contribution cannot exceed the stated price / budget.'});
    d.applicants.forEach((a,i)=>a.creditLimits.forEach((r,j)=>{if(M.has(r.limit)&&M.has(r.usedAmount)&&r.usedAmount>r.limit)out.push({path:'applicants.'+i+'.creditLimits.'+j+'.usedAmount',label:'Used amount (€) - optional',message:'Used credit cannot exceed the limit'});}));
    return out;
  }
  function extraBanks(path){
    if(/^applicants\.\d+\.(idIssuer|residency)$/.test(path)||path==='household.monthlyExpenses')return ['LHV'];
    if(/^applicants\.\d+\.(maritalStatus|education|employment\.(sector|occupation))$/.test(path))return ['LHV','Luminor'];
    if(/^applicants\.\d+\.employment\.(type|noFixedEnd|endDate)$/.test(path)||['household.childrenUnder18','household.disposableAmount','loan.paymentDay'].includes(path))return ['Luminor'];
    if(path==='loan.contributionSource')return ['Swedbank','LHV'];
    if(path==='property.listingUrl')return ['Swedbank','LHV'];
    return [];
  }
  const labels={purpose:'Loan purpose',amount:'Loan amount',price:'Price / budget',ownContribution:'Own contribution',termYears:'Term',termMonths:'Term',firstName:'First name',lastName:'Last name',personalId:'Fictional personal ID',email:'Email (fictional)',phone:'Phone (fictional)',address:'Current address',status:'Current activity',employer:'Employer',tenureMonths:'Tenure (months)'};
  return {get,purchasePrice,propertySelected,requirements,issues,extraBanks,labels};
});
