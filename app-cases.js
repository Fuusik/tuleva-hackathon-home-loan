/* Historical terms from a private case study; identities, property and costs are synthetic. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./app-offers.js'):root.LoanOffers);if(typeof module==='object'&&module.exports)module.exports=api;else root.LoanCases=api;})(globalThis,function(O){
  'use strict';
  const catalogue=[{id:'purchase2020',label:'2020 purchase: price and funding',principal:168000,months:360,benchmark:0,date:'2020-12-02'},
    {id:'house2025',label:'2025 house: conditional discounts',principal:400000,months:360,benchmark:2,date:'2025-05-27'},
    {id:'existing2025',label:'2025 existing loan: stay or switch',principal:153000,months:345,benchmark:2,date:'2025-06-02'}];
  function load(id){
    const meta=catalogue.find(c=>c.id===id);if(!meta)throw new Error('Unknown case');
    const base=(key,bank,date,margin,principal,months,fee,extra={})=>({...O.blank(key),name:bank+' / '+date,bank,seriesId:id+'-'+bank,offeredAt:date,source:'Anonymised historical case / '+id,validUntil:'',historical:true,evidence:'written',stage:'indicative',principal,termMonths:months,termYears:months===null?null:months/12,margin,benchmarkPeriod:'6M',resetMonths:6,contractFee:fee,fieldEvidence:{},...extra,fieldEvidence:{benchmarkPeriod:'assumed',resetMonths:'assumed',...(extra.fieldEvidence||{})}});
    let offers;
    if(id==='purchase2020')offers=[
      base('2020-lhv-1','LHV','2020-11-23',2.50,167000,360,0,{ownContribution:2000,earlyRepayment:'Early repayment free in the historical initial offer'}),
      base('2020-lhv-2','LHV','2020-12-01',2.10,167000,360,0,{previousId:'2020-lhv-1',stage:'improved',fieldEvidence:{principal:'inherited',termMonths:'inherited',contractFee:'inherited'},conditions:'Committee decision and additional documents still needed'}),
      base('2020-swed','Swedbank','2020-12-01',1.99,168000,360,588,{stage:'approved',conditions:'Historical offer requires salary routing'}),
      base('2020-seb-1','SEB','2020-11-20',1.99,169000,360,null,{contractFeeMode:'percent',contractFeePercent:0.3}),
      base('2020-seb-2','SEB','2020-12-02',null,160000,null,null,{previousId:'2020-seb-1',stage:'improved',ownContribution:8000,conditions:'Later maximum amount; price and term not reconfirmed'})];
    if(id==='house2025')offers=[
      base('2025-lhv-1','LHV','2025-05-13',1.55,400000,360,300,{ownContribution:0,valuationFee:150,valuationPortable:'no'}),
      base('2025-lhv-2','LHV','2025-05-27',1.40,400000,360,0,{previousId:'2025-lhv-1',stage:'improved',valuationFee:0,valuationPortable:'no',fieldEvidence:{principal:'inherited',termMonths:'inherited'},accountPromo:true,promoMonths:12,promoAccountFee:0,accountFee:null,conditions:'Committee decision needed; later account package price unknown'}),
      base('2025-luminor-1','Luminor','2025-05-20',1.41,400000,360,0,{variant:'I',ownContribution:0,fieldEvidence:{termMonths:'assumed'}}),
      base('2025-luminor-2','Luminor','2025-05-20',1.35,400000,360,0,{variant:'II',ownContribution:0,conditional:true,salaryShare:80,conditionMonths:36,breachSurcharge:0.30,fieldEvidence:{termMonths:'assumed'}}),
      base('2025-coop','Coop Pank','2025-05-20',1.49,350000,360,0,{ownContribution:50000,marginKind:'from'})];
    if(id==='existing2025')offers=[
      base('existing-current','LHV','2024-03-08',1.60,153000,345,0,{stage:'signed',action:'current',seriesId:'existing-lhv',fieldEvidence:{principal:'borrower-reported',termMonths:'assumed'},conditions:'Balance reported in May 2025; remaining term is an estimate'}),
      base('existing-lhv-1','LHV','2025-05-24',1.40,153000,345,0,{previousId:'existing-current',stage:'improved',action:'stay',seriesId:'existing-lhv',fieldEvidence:{principal:'borrower-reported',termMonths:'assumed'}}),
      base('existing-lhv-2','LHV','2025-06-02',1.39,153000,345,0,{previousId:'existing-lhv-1',stage:'approved',action:'stay',seriesId:'existing-lhv',fieldEvidence:{principal:'borrower-reported',termMonths:'assumed',contractFee:'inherited'}}),
      base('existing-switch','Luminor','2025-05-28',1.35,153000,345,0,{action:'switch',evidence:'borrower-reported',rebateEnabled:true,rebateCap:500,rebateEligible:'notaryFee',rebateConfirmed:false,fieldEvidence:{principal:'borrower-reported',termMonths:'assumed'},conditions:'Borrower phone-call summary; terms and capped reimbursement need written confirmation'})];
    return {meta:{...meta},offers};
  }
  return {catalogue,load};
});
