/* Shared review, partial recipient mappings and a local-only transmission simulation. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./app-model.js'):root.LoanModel);if(typeof module==='object'&&module.exports)module.exports=api;else root.LoanWorkflow=api;})(typeof globalThis!=='undefined'?globalThis:this,function(M){
  'use strict';
  const sections=['Financing','Applicant profiles','Household','Property and collateral','Documents and permissions'];
  const commonGroups=['Purpose, amount and term','Purchase price / project budget','Own contribution','Contribution source','Applicant identity and contact','Marital status and education','Employment and tenure','Income','Debt details','Co-applicant','Property address / intended use'];
  const simulationBanks=['LHV','Luminor'];
  const extraFields={
    Swedbank:[['loan.contributionSource','Source of own contribution'],['property.listingUrl','Listing URL (if available)']],
    SEB:[],
    LHV:[['applicants.0.idIssuer','ID issuer (country)'],['applicants.0.residency','Residency'],['household.monthlyExpenses','Shared monthly household expenses (\u20ac)'],['property.listingUrl','Listing URL (if available)']],
    Luminor:[['applicants.0.employment.type','Employment type'],['household.childrenUnder18','Children under 18'],['household.disposableAmount','Household monthly disposable money (\u20ac)'],['loan.paymentDay','Preferred payment day']],
    'Coop Pank':[],Bigbank:[]
  };
  function createReviews(){
    let origin='blank', records=new Map();
    return {
      reset(source){origin=source;records.clear();},
      invalidate(){records.clear();},
      mark(section,revision,checked,at=new Date().toISOString()){if(!sections.includes(section))throw new Error('Unknown section');if(checked)records.set(section,{section,revision,checkedAt:at,source:origin});else records.delete(section);},
      complete(revision){return sections.every(s=>records.get(s)?.revision===revision);},
      snapshot(revision){return {source:origin,revision,complete:sections.every(s=>records.get(s)?.revision===revision),sections:sections.map(section=>({section,reviewed:records.get(section)?.revision===revision,checkedAt:records.get(section)?.revision===revision?records.get(section).checkedAt:null}))};}
    };
  }
  function readiness(d,bank){
    const check=M.bankCheck(d,bank);
    return {...check,shared:check.observed.filter(g=>commonGroups.includes(g.label)),extras:check.observed.filter(g=>!commonGroups.includes(g.label)),bankSpecificFields:extraFields[bank]||[],bankConfirmed:false};
  }
  function extraPaths(d,bank){
    const paths=[...(extraFields[bank]||[])];
    d.applicants.forEach((a,i)=>{
      if(i>0&&bank==='LHV')paths.push(['applicants.'+i+'.idIssuer','ID issuer (country)'],['applicants.'+i+'.residency','Residency']);
      if(bank==='Luminor'){
        if(i>0)paths.push(['applicants.'+i+'.employment.type','Employment type']);
        if(a.employment.status==='employed'&&!a.employment.noFixedEnd)paths.push(['applicants.'+i+'.employment.endDate','Employment contract end date']);
        a.incomes.forEach((r,j)=>paths.push(['applicants.'+i+'.incomes.'+j+'.currency','Currency']));
      }
      if(bank==='LHV'||bank==='Coop Pank')paths.push(['applicants.'+i+'.statements.months','Statement coverage (months)']);
      if(bank==='Coop Pank')paths.push(['applicants.'+i+'.statements.allAccounts','All existing accounts covered']);
    });
    return paths.filter(([path])=>!path.includes('.employment.')||d.applicants[Number(path.split('.')[1])].employment.status==='employed');
  }
  function illustrativeForm(d,bank){
    if(!simulationBanks.includes(bank))throw new Error('Unsupported simulation bank');
    const canonical=M.exportSummary(d).application;
    const check=readiness(d,bank);
    let fields;
    if(bank==='LHV')fields={financing:{purpose:canonical.loan.purpose,ownContribution:canonical.loan.ownContribution,source:canonical.loan.contributionSource},people:canonical.applicants.map(a=>({role:a.role,identity:{firstName:a.firstName,lastName:a.lastName,personalId:a.personalId,idIssuer:a.idIssuer,residency:a.residency,email:a.email,phone:a.phone,address:a.address},employment:a.employment,incomes:a.incomes,obligations:a.debts,creditLimits:a.creditLimits,statements:a.statements})),household:{dependants:canonical.household.dependants,monthlyExpenses:canonical.household.monthlyExpenses},property:canonical.property,financingSupport:canonical.financing};
    else fields={loanRequest:{purpose:canonical.loan.purpose,requestedAmount:canonical.loan.amount,termMonths:M.has(canonical.loan.termYears)?canonical.loan.termYears*12:null,ownContribution:canonical.loan.ownContribution,paymentDay:canonical.loan.paymentDay},applicants:canonical.applicants.map(a=>({role:a.role,firstName:a.firstName,lastName:a.lastName,personalId:a.personalId,email:a.email,phone:a.phone,address:a.address,maritalStatus:a.maritalStatus,education:a.education,employment:a.employment,incomeRows:a.incomes.map(r=>({type:r.type,netAmount:r.amount,currency:r.currency,frequency:r.frequency})),obligationRows:a.debts})),household:{childrenUnder18:canonical.household.childrenUnder18,disposableMoney:canonical.household.disposableAmount},collateral:{address:canonical.property.address,intendedUse:canonical.property.intendedUse}};
    return {demo:true,localSimulation:true,bank,adapterVersion:'illustrative-v1',source:check.source,researchDate:check.researchDate,nativeFormVerified:false,completeBankApplication:false,fields,documentMetadata:canonical.documents,emtaChoices:canonical.applicants.map(a=>({ownerId:a.id,choices:a.emtaPermissions.filter(p=>p.bank===bank)})),omittedOrUnverified:check.unverified,missingResearchItems:check.observed.flatMap(g=>g.missing),sentToBank:false,bankReceipt:null};
  }
  function simulate(d,bank,review,recipientReviewed,at=new Date().toISOString()){
    if(!d.selectedBanks.includes(bank))throw new Error('Select this bank first');
    if(!review.complete||review.revision!==d.revision||!sections.every(s=>review.sections?.some(r=>r.section===s&&r.reviewed&&r.checkedAt)))throw new Error('Review the current shared dataset first');
    if(!recipientReviewed)throw new Error('Review this recipient simulation first');
    if(M.errors(d).length)throw new Error('Correct invalid shared values first');
    if(!d.applicants.every(a=>/^DEMO-[A-Za-z0-9-]+$/.test(a.personalId)&&/@example\.test$/i.test(a.email)))throw new Error('Use fictional DEMO identifiers and example.test email addresses');
    return {id:'local-'+bank+'-'+d.revision,revision:d.revision,simulatedAt:at,status:'Simulated locally; nothing sent',recipientReview:{demo:true,reviewed:true,genuineAuthorization:false},sharedReview:review,form:illustrativeForm(d,bank)};
  }
  return {sections,commonGroups,simulationBanks,extraFields,extraPaths,createReviews,readiness,illustrativeForm,simulate};
});
