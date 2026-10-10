/* Page-memory UI for shared review, recipient readiness, simulation and offer intake. */
function createStageUI(ctx){
  'use strict';
  const {W,O,M,I,read,t,node,money,pathInput,show,renderPreparation,invalidMessages}=ctx;
  const $=id=>document.getElementById(id);
  const reviews=W.createReviews(),simulations=new Map(),recipientChecks=new Map();
  let offerRows=[],offerSerial=0,offerRevision=null;
  let journey;
  function reset(source){reviews.reset(source);simulations.clear();recipientChecks.clear();offerRows=[];offerRevision=null;if(journey)journey.reset();renderDataset();renderOfferInputs();}
  function invalidate(){reviews.invalidate();simulations.clear();recipientChecks.clear();if(journey)journey.invalidate();renderDataset();}
  function button(text,action,style='secondary small'){const b=node('button',text,style);b.type='button';b.onclick=action;return b;}
  function value(v){return M.has(v)?String(v):t('Not answered');}
  function fact(target,label,v){const box=node('div');box.append(node('strong',label),node('span',v,undefined,true));target.append(box);}
  function renderDataset(){
    const target=$('dataset-review');if(!target)return;target.replaceChildren();const d=read();target.append(node('h3','Check before the demo send'),node('p','Check the answers above and the chosen recipients. Any application edit clears this review. These confirmations are not genuine bank consent.','muted'));
    const label=node('label',undefined,'check'),check=document.createElement('input');check.type='checkbox';check.checked=reviews.complete(d.revision);check.onchange=()=>{W.sections.forEach(s=>reviews.mark(s,read().revision,check.checked));if(!check.checked){simulations.clear();recipientChecks.clear();}ctx.invalidateExport();renderDataset();ctx.onPreparationChange();};label.append(check,node('span','I checked the shared answers in this application'));target.append(label);
    for(const a of d.applicants){const wrap=node('label',undefined,'check'),input=document.createElement('input');input.type='checkbox';input.checked=d.selectedBanks.length>0&&d.selectedBanks.every(b=>recipientChecks.get(b+'|'+a.id));input.disabled=!d.selectedBanks.length;input.onchange=()=>{d.selectedBanks.forEach(b=>recipientChecks.set(b+'|'+a.id,input.checked));if(!input.checked)simulations.clear();ctx.invalidateExport();ctx.onPreparationChange();};wrap.append(input,node('span',t('I checked {role} data for these banks: {banks}',{role:t(a.role),banks:d.selectedBanks.join(', ')||t('None selected')}),undefined,true));target.append(wrap);}
  }
  function isPrepared(){const d=read();return d.selectedBanks.length>0&&d.selectedBanks.every(b=>simulations.get(b)?.revision===d.revision);}
  function sendAll(){const d=read();if(!d.selectedBanks.length)throw Error('Select at least one bank before sending the demo');if(LoanApplication.issues(d).length||invalidMessages(d).length)throw Error('Correct invalid shared values first');if(!reviews.complete(d.revision)||!d.applicants.every(a=>d.selectedBanks.every(b=>recipientChecks.get(b+'|'+a.id))))throw Error('Review shared answers and each applicant for selected banks');const records=d.selectedBanks.map(b=>W.simulate(d,b,reviews.snapshot(d.revision),true));for(const r of records)simulations.set(r.form.bank,r);ctx.invalidateExport();return records;}

  function sharedReadiness(d){
    const target=$('shared-readiness');target.replaceChildren();target.append(node('h3','Reusable data for the selected banks'));
    const seen=new Set(),list=node('ul',undefined,'list');
    d.selectedBanks.forEach(bank=>W.readiness(d,bank).shared.forEach(g=>g.missing.forEach(text=>{if(!seen.has(text)){seen.add(text);list.append(node('li',text));}})));
    if(!seen.size)list.append(node('li',d.selectedBanks.length?'Shared researched items are filled; bank confirmation is still needed':'Select banks in the shared form','muted'));
    target.append(list,button('Edit shared data',()=>show('application')));
  }
  function bankCard(d,bank){
    const c=W.readiness(d,bank),card=node('article',undefined,'card');card.append(node('h3',bank,undefined,true),node('p',t('{n} researched gaps; {u} topics still need bank verification.',{n:c.missingCount,u:c.unverified.length}),undefined,true));const details=node('details');details.append(node('summary','Additional questions, documents and unverified requirements'));
    const list=node('ul',undefined,'list');for(const g of c.observed)for(const text of g.missing)list.append(node('li',(g.laterStage?t('Later stage')+': ':'')+t(g.label)+': '+I.message(text),undefined,true));details.append(list);
    for(const [path,label] of W.extraPaths(d,bank)){const input=pathInput(path);if(!input||input.disabled||M.has(input.value)&&input.type!=='checkbox')continue;const link=node('a',t('Complete shared answer: {field}',{field:t(label)}),undefined,true);link.href='#'+input.id;link.onclick=e=>{e.preventDefault();ctx.jumpToField(path);};details.append(node('p',undefined),link);}
    renderPreparation(details,c.preparation);const unknown=node('ul',undefined,'list');c.unverified.forEach(text=>unknown.append(node('li',text)));details.append(node('h4','Requirements / mappings we have not verified'),unknown);c.notes.forEach(text=>details.append(node('p',text,'notice warn')));const source=node('a','Official source');source.href=c.source;source.target='_blank';source.rel='noopener noreferrer';details.append(source,node('small',t('Research baseline: {date}. Mandatory flags remain unverified.',{date:c.researchDate}),undefined,true));card.append(details);return card;
  }

  function mappedFacts(target,d,bank){
    const grid=node('div',undefined,'review-facts');
    if(bank==='LHV'){
      fact(grid,'Loan purpose',t(d.loan.purpose));fact(grid,'Own contribution',M.has(d.loan.ownContribution)?money(d.loan.ownContribution):t('Not answered'));
      fact(grid,'All dependants',value(d.household.dependants));fact(grid,'Shared monthly household expenses (\u20ac)',value(d.household.monthlyExpenses));
      d.applicants.forEach(a=>{fact(grid,a.role,[a.firstName,a.lastName,a.idIssuer,a.residency].filter(Boolean).join(' / '));fact(grid,'Separate credit limits',a.creditLimits.map(r=>value(r.limit)).join('; ')||t('Not answered'));});
    }else{
      fact(grid,'Loan amount (\u20ac)',value(d.loan.amount));fact(grid,'Term (months)',M.has(O.monthsOf(d.loan))?String(O.monthsOf(d.loan)):t('Not answered'));
      fact(grid,'Children under 18',value(d.household.childrenUnder18));fact(grid,'Household monthly disposable money (\u20ac)',value(d.household.disposableAmount));fact(grid,'Preferred payment day',value(d.loan.paymentDay));
      d.applicants.forEach(a=>{fact(grid,a.role,[a.firstName,a.lastName].join(' '));fact(grid,'Income currency',a.incomes.map(r=>value(r.amount)+' '+r.currency+' / '+t(r.frequency)).join('; ')||t('Not answered'));});
    }
    target.append(grid);
  }
  function renderSimulation(){
    const d=read(),target=$('simulation-forms');target.replaceChildren();
    $('simulation-progress').textContent=t('{n} of {total} selected recipient simulations completed for draft {revision}',{total:d.selectedBanks.length,n:d.selectedBanks.filter(b=>simulations.get(b)?.revision===d.revision).length,revision:d.revision});
    if(!reviews.complete(d.revision))target.append(node('p','Review shared answers and each applicant for selected banks','notice warn'));
    for(const bank of d.selectedBanks){
      const card=node('article',undefined,'card');card.append(node('h3',bank+' / '+t('Illustrative bank form'),undefined,true));
      card.append(node('p',bank==='LHV'?'LHV example: people, separate credit limits, dependants and household expenses. Amount/term mapping remains unverified.':bank==='Luminor'?'Luminor example: loan term in months, original income currencies, children under 18, disposable money and payment day.':'Shared preparation topics; partial and unverified native mapping.','muted'));
      if(['LHV','Luminor'].includes(bank))mappedFacts(card,d,bank);else card.append(node('p','Preparation summary only: native fields, declarations and acceptance remain unverified.','notice warn'));
      const payload=W.illustrativeForm(d,bank),details=node('details');details.append(node('summary','Inspect mapped demo data'));details.append(node('pre',JSON.stringify(payload,null,2),undefined,true));card.append(details);
      const recipients=[];
      for(const a of d.applicants){const label=node('label',undefined,'check'),check=document.createElement('input');check.type='checkbox';const key=bank+'|'+a.id;check.checked=recipientChecks.get(key)||false;check.onchange=()=>{recipientChecks.set(key,check.checked);if(!check.checked){simulations.delete(bank);status.textContent='';$('simulation-progress').textContent=t('{n} of {total} selected recipient simulations completed for draft {revision}',{total:d.selectedBanks.length,n:simulations.size,revision:d.revision});}ctx.invalidateExport();renderDataset();ctx.onPreparationChange();};label.append(check,node('span',t('Review {role} data for {bank}; simulation only',{role:t(a.role),bank}),undefined,true));card.append(label);recipients.push(check);}
      const status=node('p',undefined,'notice');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
      const done=simulations.get(bank);if(done)status.textContent=t(done.status)+' '+done.simulatedAt;
      const simulate=button('Simulate local transmission',()=>{
        try{if(LoanApplication.issues(read()).length||invalidMessages(read()).length)throw new Error('Correct invalid shared values first');const record=W.simulate(read(),bank,reviews.snapshot(read().revision),recipients.every(x=>x.checked));simulations.set(bank,record);ctx.invalidateExport();renderDataset();ctx.onPreparationChange();renderSimulation();}
        catch(error){status.textContent=t(error.message);}
      });simulate.disabled=!d.selectedBanks.includes(bank)||!reviews.complete(d.revision);card.append(simulate,status);target.append(card);
    }
    target.append(button('Compare offers after simulation',()=>show('compare')));
  }
  function inputField(target,label,key,row,type='text',options){
    const wrap=node('label',undefined,'field'),input=document.createElement(options?'select':type==='textarea'?'textarea':'input');if(!options&&type!=='textarea')input.type=type;
    if(type==='checkbox')wrap.className='check';input.id='offer-'+row.id+'-'+key;wrap.htmlFor=input.id;
    if(options){for(const [v,text] of [['','Not answered'],...options.map(x=>Array.isArray(x)?x:[x,x])]){const option=node('option',text);option.value=v;input.append(option);}}
    if(type==='number'){input.min='0';input.step=['termYears','termMonths','resetMonths','conditionMonths','promoMonths'].includes(key)?'1':'0.01';} if(type==='checkbox')input.checked=!!row[key];
    input.value=row[key]==null?'':row[key];input.dataset.offerField=key;input.oninput=()=>{row[key]=type==='checkbox'?input.checked:type==='number'?(input.value===''?null:input.valueAsNumber):input.value; if(key==='termMonths')row.termYears=null;if(row.fieldEvidence)row.fieldEvidence[key]='user-entered'; if(journey)journey.invalidate();ctx.invalidateExport();calculate();};wrap.append(node('span',label),input);target.append(wrap);
  }
  function renderOfferInputs(){
    const target=$('offer-inputs');if(!target)return;target.replaceChildren();
    for(const row of offerRows){const card=node('details',undefined,'card');card.open=!row.source||row.id.startsWith('manual-')||row.id.startsWith('version-');card.append(node('summary',row.name||'Offer details',undefined,!!row.name));card.append(button('Remove offer',()=>{offerRows=offerRows.filter(r=>r!==row);ctx.invalidateExport();journey.invalidate();renderOfferInputs();calculate();}));
      const grid=node('div',undefined,'grid');
      for(const [key,label,type] of [['name','Offer name','text'],['source','Offer source / reference','text'],['validUntil','Offer expiry','date'],['principal','Offer amount (\u20ac)','number'],['termMonths','Offer term (months)','number'],['margin','Margin (%)','number'],['resetMonths','Rate reset interval (months)','number'],['apr','APR supplied in offer (%)','number']])inputField(grid,label,key,row,type);
      inputField(grid,'Currency','currency',row,'text',['EUR','USD','Other']);inputField(grid,'Benchmark period','benchmarkPeriod',row,'text',['3M','6M','12M']);inputField(grid,'Repayment schedule','schedule',row,'text',[['annuity','Annuity'],['equal-principal','Equal principal payments'],['special','Special / interest-only schedule']]);
      inputField(grid,'Bank','bank',row,'text',M.banks);inputField(grid,'Offer date','offeredAt',row,'date');inputField(grid,'Decision stage','stage',row,'text',[['indicative','Indicative'],['improved','Improved; decision pending'],['approved','Committee approved'],['draft','Contract draft'],['signed','Signed']]);inputField(grid,'Evidence','evidence',row,'text',[['demo','Fictional demo entry'],['written','Written offer source'],['borrower-reported','Borrower-reported call'],['unknown','Unverified']]);inputField(grid,'Action','action',row,'text',[['new','New loan'],['current','Current loan'],['stay','Improve at current bank'],['switch','Switch bank']]);inputField(grid,'Minimum own contribution','ownContribution',row,'number');inputField(grid,'Margin type','marginKind',row,'text',[['exact','Quoted margin'],['from','Starting margin']]);card.append(grid,node('h3','Upfront costs'),node('p','Enter each cost once. Use 0 for an explicitly absent cost; leave unknown costs blank. Figures are cash paid separately, not financed fees.','muted'));
      const fees=node('div',undefined,'grid');O.upfront.forEach(k=>inputField(fees,O.costLabels[k],k,row,'number'));card.append(fees,node('h3','Recurring costs'));
      const recurring=node('div',undefined,'grid');O.recurring.forEach(k=>inputField(recurring,O.costLabels[k],k,row,'number'));card.append(recurring,node('p','Include only chosen insurance in monthly costs. Record optional/required status, cover and exclusions below. Do not enter the same cover twice.','muted'));
      const extras=node('details');extras.append(node('summary','Conditional pricing and cost details'));const extended=node('div',undefined,'grid');
      inputField(extended,'Contract fee calculation','contractFeeMode',row,'text',[['fixed','Fixed fee'],['percent','Percentage of principal']]);
      for(const [key,label] of [['contractFeePercent','Contract fee (%)'],['contractFeeMin','Minimum contract fee'],['contractFeeMax','Maximum contract fee'],['exitFee','Existing loan exit fee'],['salaryShare','Required income share (%)'],['conditionMonths','Income routing period (months)'],['breachSurcharge','Breach margin increase (percentage points)'],['promoMonths','Account promotion (months)'],['promoAccountFee','Account fee during promotion'],['rebateCap','Reimbursement cap']])inputField(extended,label,key,row,'number');
      for(const [key,label] of [['conditional','Conditional margin'],['accountPromo','Temporary account price'],['rebateEnabled','Reimbursement offered'],['rebateConfirmed','Reimbursement confirmed for scenario']])inputField(extended,label,key,row,'checkbox');
      inputField(extended,'Reimbursed cost','rebateEligible',row,'text',O.upfront.map(k=>[k,O.costLabels[k]]));inputField(extended,'Valuation portable to other banks','valuationPortable',row,'text',[['unknown','Unknown'],['yes','Yes; confirm acceptance'],['no','No; internal only']]);extras.append(extended);card.append(extras);
      card.append(button('Add improved version',()=>{const next=structuredClone(row);next.id='version-'+(++offerSerial);next.name=row.name+' / '+t('Improved version');next.previousId=row.id;next.stage='improved';next.offeredAt='';next.fieldEvidence={...row.fieldEvidence,...Object.fromEntries(['principal','termMonths','margin','contractFee','conditions','insuranceTerms','earlyRepayment'].map(k=>[k,'inherited']))};offerRows.push(next);ctx.invalidateExport();journey.invalidate();renderOfferInputs();calculate();}));
      const notes=node('div',undefined,'grid');for(const [key,label] of [['insuranceTerms','Insurance requirements / cover'],['earlyRepayment','Early repayment terms'],['conditions','Other conditions']])inputField(notes,label,key,row,'textarea');card.append(notes);target.append(card);
    }
    if(!offerRows.length)target.append(node('p','No offers added. Add offer terms or try explicitly fictional examples.','empty'));
  }
  function assumptions(){return {benchmark:$('benchmark').value===''?null:$('benchmark').valueAsNumber,horizonYears:$('horizon-years').valueAsNumber,referenceDate:$('reference-date').value,benchmarkPeriod:$('comparison-period').value,resetMonths:$('comparison-reset').valueAsNumber,...journey.assumptions()};}
  function calculate(){
    const d=read(),allDone=d.selectedBanks.length>0&&d.selectedBanks.every(b=>simulations.get(b)?.revision===d.revision);$('load-offers').disabled=!allDone;
    $('offer-stage-status').textContent=t(allDone?'Application prepared locally. Add offer terms or try fictional examples.':'Prepare the current application before opening offers.');
    if(offerRows.some(row=>row.applicationRevision!==d.revision))$('offer-stage-status').textContent=t('The application changed after these offers were added. Check amount, term and source again.');
    const summary=$('offer-summary');summary.replaceChildren();
    for(const row of offerRows){const original=O.scenario({...d,loan:{...d.loan,amount:row.principal,termYears:null,termMonths:O.monthsOf(row)}},row,{...assumptions(),mode:'requested',termMonths:O.monthsOf(row)}),fund=O.funding(d,row),card=node('article');card.append(node('h3',row.name||'Offer details',undefined,!!row.name));const display=v=>v===null?t('Unknown / not comparable'):money(v);card.append(node('small','Modelled first loan payment / month'),node('p',display(original.monthlyPayment),'key-payment',true));
      for(const [key,text] of [['Original amount',display(row.principal)],['Margin with benchmark and discount conditions',M.has(row.margin)?row.margin+'% + '+value(assumptions().benchmark)+'% ('+t('Assumed benchmark')+')':t('Not answered')],['Known upfront cost subtotal',O.upfront.some(k=>M.has(row[k]))||row.contractFeeMode==='percent'?money(original.knownUpfrontCosts):t('Not answered')],['Known monthly additional costs',O.recurring.some(k=>M.has(row[k]))?money(original.knownMonthlyExtras):t('Not answered')],['Additional own funds needed',display(fund.ownFundsGap)],['Repayment schedule',t(row.schedule)],['Decision stage',t(row.stage)],['Evidence',t(row.evidence)]]){const p=node('p');p.append(node('strong',key),document.createTextNode(': '+text));card.append(p);}
      card.append(node('small','Calculated with the entered benchmark assumption; confirm the actual payment with the bank.'));if(row.conditions)card.append(node('p',row.conditions,undefined,true));if(row.insuranceTerms)card.append(node('small',row.insuranceTerms,undefined,true));if(row.conditional)card.append(node('p','Conditional discount: check income routing and breach surcharge','notice warn'));if(!original.costsComplete)card.append(node('p','Some costs are unknown. Known subtotals are not a complete cost estimate.','notice warn'));if(original.warnings.length)original.warnings.forEach(w=>card.append(node('small',w)));card.append(node('small',t('{missing} missing terms/costs; {invalid} invalid values',{missing:original.missing.length,invalid:original.invalid.length}),undefined,true));summary.append(card);
    }
    const body=$('offer-results');body.replaceChildren();const gaps=$('offer-gaps');gaps.replaceChildren();
    for(const row of offerRows){const result=O.scenario(d,row,assumptions()),tr=node('tr');const display=v=>v===null?t('Unknown / not comparable'):money(v);
      [row.name||t('Offer details'),display(result.monthlyPayment),money(result.knownUpfrontCosts),display(result.monthlyOutflow),display(result.horizonCost),display(result.remainingPrincipal),display(result.fullTermOutflow)].forEach(text=>tr.append(node('td',text,undefined,true)));body.append(tr);
      const details=node('details',undefined,'card');details.open=!!result.invalid.length||!!result.warnings.length;details.append(node('summary',row.name||t('Offer details'),undefined,true));
      const list=node('ul',undefined,'list');for(const text of result.invalid)list.append(node('li',t('Invalid value')+': '+t(text),'warning-item',true));for(const text of result.warnings)list.append(node('li',text,'warning-item'));for(const text of result.notices||[])list.append(node('li',text,'notice'));for(const text of result.missing)list.append(node('li',t('Missing information')+': '+t(text),undefined,true));
      if(!list.children.length)list.append(node('li','Entered costs and terms are complete for this scenario; bank confirmation is still needed'));details.append(node('small',t('{missing} missing terms/costs; {invalid} invalid values',{missing:result.missing.length,invalid:result.invalid.length}),undefined,true),list);
      if(result.knownCostSubtotal!==null&&!result.costsComplete)details.append(node('p',t('Known cost subtotal: {cost}. Unknown fees are excluded; no complete total is shown.',{cost:money(result.knownCostSubtotal)}),'notice warn',true));
      details.append(node('small',t('Calculated cost horizon: {months} months. Exit fees are not included; check early repayment terms separately.',{months:result.horizonMonths}),undefined,true));
      for(const key of ['source','validUntil','apr','benchmarkPeriod','resetMonths','insuranceTerms','earlyRepayment','conditions'])details.append(node('p',t(({source:'Offer source / reference',validUntil:'Offer expiry',apr:'APR supplied in offer (%)',benchmarkPeriod:'Benchmark period',resetMonths:'Rate reset interval (months)',insuranceTerms:'Insurance requirements / cover',earlyRepayment:'Early repayment terms',conditions:'Other conditions'})[key])+': '+value(row[key]),undefined,true));gaps.append(details);
    }
    journey.renderInsights();
  }
  function initialize(){
    journey=createOfferJourneyUI({...ctx,inputField,button,getOffers:()=>offerRows,getAssumptions:assumptions,renderOffers:renderOfferInputs,calculate,setOffers:rows=>{offerRows=rows;offerRevision=read().revision;},addVersion:(prior,patch)=>{const row={...structuredClone(prior),...patch,id:'reply-'+(++offerSerial),previousId:prior.id,applicationRevision:read().revision};offerRows.push(row);ctx.invalidateExport();renderOfferInputs();calculate();return row;}});journey.initialize();
    $('load-offers').onclick=()=>{const d=read();if(!d.selectedBanks.length||!d.selectedBanks.every(b=>simulations.get(b)?.revision===d.revision))return;if(offerRows.length&&!window.confirm(t('Replace entered demo offers with fictional examples?')))return;offerRows=O.samples(d).map((row,index)=>{for(const key of ['name','source','earlyRepayment','conditions','insuranceTerms'])row[key]=t(row[key]);row.termMonths=d.loan.termMonths||O.monthsOf(row);row.bank=d.selectedBanks[index%d.selectedBanks.length]||'';row.name=row.bank+' / '+t('Fictional offer')+' '+(index+1);row.applicationRevision=d.revision;row.enteredAt=new Date().toISOString();return row;});offerRevision=d.revision;ctx.invalidateExport();renderOfferInputs();calculate();};
    $('add-offer').onclick=()=>{const d=read();const row=O.blank('manual-'+(++offerSerial));row.principal=d.loan.amount;row.termYears=d.loan.termYears;row.termMonths=O.monthsOf(d.loan);row.applicationRevision=d.revision;row.enteredAt=new Date().toISOString();offerRows.push(row);offerRevision=d.revision;ctx.invalidateExport();renderOfferInputs();calculate();};
    for(const id of ['benchmark','reference-date','horizon-years','comparison-period','comparison-reset'])$(id).oninput=()=>{ctx.invalidateExport();journey.invalidate();calculate();};
  }
  function translatePage(){journey.translate();renderDataset();renderOfferInputs();if(ctx.currentPage()==='simulation')renderSimulation();if(ctx.currentPage()==='compare')calculate();}
  function offerErrors(){const d=read();return offerRows.flatMap(row=>O.scenario(d,row,assumptions()).invalid.map(text=>(row.name||t('Offer details'))+': '+t('Invalid value')+' / '+t(text)));}
  function renderOutcomeReview(){
    const target=$('review-workflow');target.replaceChildren();const state=api.exportState();
    target.append(node('h3','Shared review, simulations and offers'));
    target.append(node('p',t('Shared sections reviewed: {n} of {total}',{n:state.datasetReview.sections.filter(s=>s.reviewed).length,total:W.sections.length}),undefined,true));
    target.append(node('p',t('Local simulations: {n}. No bank transmission or receipt.',{n:state.transmissionSimulation.records.length}),undefined,true));
    if(offerRows.length){target.append(node('p','Comparison uses fictional or manually entered demo offers. Check their source, assumptions, missing costs and conditions before export.','notice warn'));
      for(const row of state.offerComparison.offers)target.append(node('p',(row.name||t('Offer details'))+': '+t('Missing information')+' '+row.scenario.missing.length+' / '+t('Invalid value')+' '+row.scenario.invalid.length,undefined,true));
    }else target.append(node('p','No offers added.','muted'));
  }
  const api={initialize,reset,invalidate,isPrepared,sendAll,renderDataset,sharedReadiness,bankCard,renderSimulation,calculate,translatePage,offerErrors,renderOutcomeReview,
    exportState(){const d=read();return {datasetReview:reviews.snapshot(d.revision),transmissionSimulation:{demo:true,sentToBank:false,records:[...simulations.values()].filter(r=>r.revision===d.revision)},offerComparison:{demo:true,sourceRevision:offerRevision,assumptions:assumptions(),offers:offerRows.map(r=>({...r,scenario:O.scenario(d,r,assumptions())})),...journey.exportState()}};}
  };return api;
}
