/* Page-memory UI for shared review, recipient readiness, simulation and offer intake. */
function createStageUI(ctx){
  'use strict';
  const {W,O,M,I,read,t,node,money,pathInput,show,renderPreparation,invalidMessages}=ctx;
  const $=id=>document.getElementById(id);
  const reviews=W.createReviews(),simulations=new Map(),recipientChecks=new Map();
  let offerRows=[],offerSerial=0,offerRevision=null;
  function reset(source){reviews.reset(source);simulations.clear();recipientChecks.clear();offerRows=[];offerRevision=null;renderDataset();renderOfferInputs();}
  function invalidate(){reviews.invalidate();simulations.clear();recipientChecks.clear();renderDataset();}
  function button(text,action,style='secondary small'){const b=node('button',text,style);b.type='button';b.onclick=action;return b;}
  function value(v){return M.has(v)?String(v):t('Not answered');}
  function fact(target,label,v){const box=node('div');box.append(node('strong',label),node('span',v,undefined,true));target.append(box);}
  function renderDataset(){
    const target=$('dataset-review');if(!target)return;target.replaceChildren();
    const d=read(),snapshot=reviews.snapshot(d.revision);
    target.append(node('h2','Check the shared dataset'),node('p','Fictional examples prefill the shared profile. No information is extracted from files or registries. Check each section; any application edit clears these confirmations.','muted'));
    target.append(node('p',snapshot.source==='fictional-example'?'Source: built-in fictional example, followed by your edits':'Source: your demo entries','notice'));
    const facts=node('div',undefined,'review-facts');
    fact(facts,'Loan request',M.has(d.loan.amount)?money(d.loan.amount)+' / '+value(d.loan.termYears)+' '+t('years'):t('Not answered'));
    fact(facts,'Applicants',d.applicants.map(a=>[a.firstName,a.lastName].filter(Boolean).join(' ')||t('Name not entered')).join('; '));
    fact(facts,'Property address',value(d.property.address));fact(facts,'Local files',String(d.documents.length));target.append(facts);
    for(const section of snapshot.sections){const label=node('label',undefined,'check'),input=document.createElement('input');input.type='checkbox';input.checked=section.reviewed;input.dataset.datasetReview=section.section;input.onchange=()=>{reviews.mark(section.section,read().revision,input.checked);if(!input.checked){simulations.clear();recipientChecks.clear();}ctx.invalidateExport();};label.append(input,node('span',t('{section} reviewed in this draft',{section:t(section.section)}),undefined,true));target.append(label);}
    target.append(node('small','Review confirms only this demo draft. It is not identity verification, a bank declaration or genuine consent.'));
  }
  function sharedReadiness(d){
    const target=$('shared-readiness');target.replaceChildren();target.append(node('h3','Reusable data for the selected banks'));
    const seen=new Set(),list=node('ul',undefined,'list');
    d.selectedBanks.forEach(bank=>W.readiness(d,bank).shared.forEach(g=>g.missing.forEach(text=>{if(!seen.has(text)){seen.add(text);list.append(node('li',text));}})));
    if(!seen.size)list.append(node('li',d.selectedBanks.length?'Shared researched items are filled; bank confirmation is still needed':'Select banks in the shared form','muted'));
    target.append(list,button('Edit shared data',()=>show('application')));
  }
  function bankCard(d,bank){
    const c=W.readiness(d,bank),card=node('article',undefined,'card'),head=node('div',undefined,'bank-heading');head.append(node('h3',bank,undefined,true),node('span','Needs bank verification','status'));card.append(head);
    const link=node('a','Official source');link.href=c.source;link.target='_blank';link.rel='noopener noreferrer';card.append(link,node('small',t('Research baseline: {date}. Mandatory flags remain unverified.',{date:c.researchDate}),undefined,true));
    card.append(node('h3','Existing shared answers'));
    const existing=node('ul',undefined,'list');c.observed.filter(g=>!g.missing.length).forEach(g=>existing.append(node('li','['+g.evidence+'] '+g.label)));if(!existing.children.length)existing.append(node('li','No researched group is complete yet'));card.append(existing);
    card.append(node('h3','Only this bank: additional researched topics'));
    const list=node('ul',undefined,'list');c.extras.filter(g=>g.missing.length).forEach(g=>g.missing.forEach(text=>list.append(node('li','['+g.evidence+'] '+g.label+': '+text))));if(!list.children.length)list.append(node('li','No additional researched gaps; unverified requirements remain'));card.append(list);
    const edit=node('div',undefined,'grid');
    for(const [path,label] of W.extraPaths(d,bank)){
      const source=pathInput(path);if(!source||source.disabled||source.type==='checkbox'&&source.checked||source.type!=='checkbox'&&source.value!=='')continue;
      const wrap=node('label',undefined,source.type==='checkbox'?'check':'field'),input=source.cloneNode(true);input.removeAttribute('id');input.removeAttribute('data-path');input.removeAttribute('data-i18n-placeholder');input.id='bank-extra-'+M.banks.indexOf(bank)+'-'+path.replaceAll('.','-');wrap.htmlFor=input.id;
      const owner=path.startsWith('applicants.')?t(d.applicants[Number(path.split('.')[1])].role)+': ':'';wrap.append(node('span',owner+t(label),undefined,true),input);
      // Change, rather than input, commits the whole value before rebuilding a bank card.
      input.onchange=()=>{if(source.type==='checkbox')source.checked=input.checked;else source.value=input.value;source.dispatchEvent(new Event('input',{bubbles:true}));};edit.append(wrap);
    }
    card.append(edit,node('small','Answers entered here update the shared dataset. Existing answers are reused. F/D evidence does not establish mandatory fields.'));
    c.notes.forEach(text=>card.append(node('p',text,'notice warn')));
    renderPreparation(card,c.preparation);
    const unknown=node('details');unknown.append(node('summary','Requirements / mappings we have not verified'));const ul=node('ul',undefined,'list');c.unverified.forEach(text=>ul.append(node('li',text)));unknown.append(ul);card.append(unknown);
    card.append(button('Edit shared data and permission choices',()=>show('application')));return card;
  }
  function mappedFacts(target,d,bank){
    const grid=node('div',undefined,'review-facts');
    if(bank==='LHV'){
      fact(grid,'Loan purpose',t(d.loan.purpose));fact(grid,'Own contribution',M.has(d.loan.ownContribution)?money(d.loan.ownContribution):t('Not answered'));
      fact(grid,'All dependants',value(d.household.dependants));fact(grid,'Shared monthly household expenses (\u20ac)',value(d.household.monthlyExpenses));
      d.applicants.forEach(a=>{fact(grid,a.role,[a.firstName,a.lastName,a.idIssuer,a.residency].filter(Boolean).join(' / '));fact(grid,'Separate credit limits',a.creditLimits.map(r=>value(r.limit)).join('; ')||t('Not answered'));});
    }else{
      fact(grid,'Loan amount (\u20ac)',value(d.loan.amount));fact(grid,'Term (months)',M.has(d.loan.termYears)?String(d.loan.termYears*12):t('Not answered'));
      fact(grid,'Children under 18',value(d.household.childrenUnder18));fact(grid,'Household monthly disposable money (\u20ac)',value(d.household.disposableAmount));fact(grid,'Preferred payment day',value(d.loan.paymentDay));
      d.applicants.forEach(a=>{fact(grid,a.role,[a.firstName,a.lastName].join(' '));fact(grid,'Income currency',a.incomes.map(r=>value(r.amount)+' '+r.currency+' / '+t(r.frequency)).join('; ')||t('Not answered'));});
    }
    target.append(grid);
  }
  function renderSimulation(){
    const d=read(),target=$('simulation-forms');target.replaceChildren();
    $('simulation-progress').textContent=t('{n} of 2 recipient simulations completed for draft {revision}',{n:W.simulationBanks.filter(b=>simulations.get(b)?.revision===d.revision).length,revision:d.revision});
    if(!reviews.complete(d.revision))target.append(node('p','Check all shared dataset sections in step 1 before running a simulation.','notice warn'));
    for(const bank of W.simulationBanks){
      const card=node('article',undefined,'card');card.append(node('h3',bank+' / '+t('Illustrative bank form'),undefined,true));
      card.append(node('p',bank==='LHV'?'LHV example: people, separate credit limits, dependants and household expenses. Amount/term mapping remains unverified.':'Luminor example: loan term in months, original income currencies, children under 18, disposable money and payment day.','muted'));
      mappedFacts(card,d,bank);
      const payload=W.illustrativeForm(d,bank),details=node('details');details.append(node('summary','Inspect mapped demo data'));details.append(node('pre',JSON.stringify(payload,null,2),undefined,true));card.append(details);
      const recipients=[];
      for(const a of d.applicants){const label=node('label',undefined,'check'),check=document.createElement('input');check.type='checkbox';const key=bank+'|'+a.id;check.checked=recipientChecks.get(key)||false;check.onchange=()=>{recipientChecks.set(key,check.checked);if(!check.checked){simulations.delete(bank);status.textContent='';$('simulation-progress').textContent=t('{n} of 2 recipient simulations completed for draft {revision}',{n:simulations.size,revision:d.revision});}ctx.invalidateExport();};label.append(check,node('span',t('Review {role} data for {bank}; simulation only',{role:t(a.role),bank}),undefined,true));card.append(label);recipients.push(check);}
      const status=node('p',undefined,'notice');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
      const done=simulations.get(bank);if(done)status.textContent=t(done.status)+' '+done.simulatedAt;
      const simulate=button('Simulate local transmission',()=>{
        try{if(invalidMessages(read()).length)throw new Error('Correct invalid shared values first');const record=W.simulate(read(),bank,reviews.snapshot(read().revision),recipients.every(x=>x.checked));simulations.set(bank,record);ctx.invalidateExport();renderSimulation();}
        catch(error){status.textContent=t(error.message);}
      });simulate.disabled=!d.selectedBanks.includes(bank)||!reviews.complete(d.revision);card.append(simulate,status);target.append(card);
    }
    target.append(button('Compare offers after simulation',()=>show('compare')));
  }
  function inputField(target,label,key,row,type='text',options){
    const wrap=node('label',undefined,'field'),input=document.createElement(options?'select':type==='textarea'?'textarea':'input');if(!options&&type!=='textarea')input.type=type;
    input.id='offer-'+row.id+'-'+key;wrap.htmlFor=input.id;
    if(options){for(const [v,text] of [['','Not answered'],...options.map(x=>Array.isArray(x)?x:[x,x])]){const option=node('option',text);option.value=v;input.append(option);}}
    if(type==='number'){input.min='0';input.step=['termYears','resetMonths'].includes(key)?'1':'0.01';}
    input.value=row[key]===null?'':row[key];input.dataset.offerField=key;input.oninput=()=>{row[key]=type==='number'?(input.value===''?null:input.valueAsNumber):input.value;ctx.invalidateExport();calculate();};wrap.append(node('span',label),input);target.append(wrap);
  }
  function renderOfferInputs(){
    const target=$('offer-inputs');if(!target)return;target.replaceChildren();
    for(const row of offerRows){const card=node('details',undefined,'card');card.open=true;card.append(node('summary',row.name||'Offer details',undefined,!!row.name));card.append(button('Remove offer',()=>{offerRows=offerRows.filter(r=>r!==row);ctx.invalidateExport();renderOfferInputs();calculate();}));
      const grid=node('div',undefined,'grid');
      for(const [key,label,type] of [['name','Offer name','text'],['source','Offer source / reference','text'],['validUntil','Offer expiry','date'],['principal','Offer amount (\u20ac)','number'],['termYears','Offer term (years)','number'],['margin','Margin (%)','number'],['resetMonths','Rate reset interval (months)','number'],['apr','APR supplied in offer (%)','number']])inputField(grid,label,key,row,type);
      inputField(grid,'Currency','currency',row,'text',['EUR','USD','Other']);inputField(grid,'Benchmark period','benchmarkPeriod',row,'text',['3M','6M','12M']);inputField(grid,'Repayment schedule','schedule',row,'text',[['annuity','Annuity'],['special','Special / interest-only schedule']]);
      card.append(grid,node('h3','Upfront costs'),node('p','Enter each cost once. Use 0 for an explicitly absent cost; leave unknown costs blank. Figures are cash paid separately, not financed fees.','muted'));
      const fees=node('div',undefined,'grid');O.upfront.forEach(k=>inputField(fees,O.costLabels[k],k,row,'number'));card.append(fees,node('h3','Recurring costs'));
      const recurring=node('div',undefined,'grid');O.recurring.forEach(k=>inputField(recurring,O.costLabels[k],k,row,'number'));card.append(recurring,node('p','Include only chosen insurance in monthly costs. Record optional/required status, cover and exclusions below. Do not enter the same cover twice.','muted'));
      const notes=node('div',undefined,'grid');for(const [key,label] of [['insuranceTerms','Insurance requirements / cover'],['earlyRepayment','Early repayment terms'],['conditions','Other conditions']])inputField(notes,label,key,row,'textarea');card.append(notes);target.append(card);
    }
    if(!offerRows.length)target.append(node('p','No offers added. Run both simulations to load fictional offers, or add a demo offer manually.','empty'));
  }
  function assumptions(){return {benchmark:$('benchmark').value===''?null:$('benchmark').valueAsNumber,horizonYears:$('horizon-years').valueAsNumber,referenceDate:$('reference-date').value,benchmarkPeriod:$('comparison-period').value,resetMonths:6};}
  function calculate(){
    const d=read(),allDone=W.simulationBanks.every(b=>simulations.get(b)?.revision===d.revision);$('load-offers').disabled=!allDone;
    $('offer-stage-status').textContent=t(allDone?'Both local simulations completed. Fictional examples can now be loaded.':'Run both local simulations before loading fictional offers. Manual demo entry is also available.');
    if(offerRows.some(row=>row.applicationRevision!==d.revision))$('offer-stage-status').textContent=t('The application changed after these offers were added. Check amount, term and source again.');
    const body=$('offer-results');body.replaceChildren();const gaps=$('offer-gaps');gaps.replaceChildren();
    for(const row of offerRows){const result=O.scenario(d,row,assumptions()),tr=node('tr');const display=v=>v===null?t('Unknown / not comparable'):money(v);
      [row.name||t('Offer details'),display(result.monthlyPayment),money(result.knownUpfrontCosts),display(result.monthlyOutflow),display(result.horizonCost),display(result.remainingPrincipal),display(result.fullTermOutflow)].forEach(text=>tr.append(node('td',text,undefined,true)));body.append(tr);
      const details=node('details',undefined,'card');details.open=!!result.invalid.length||!!result.warnings.length||!result.costsComplete;details.append(node('summary',row.name||t('Offer details'),undefined,true));
      const list=node('ul',undefined,'list');for(const text of result.invalid)list.append(node('li',t('Invalid value')+': '+t(text),'warning-item',true));for(const text of result.warnings)list.append(node('li',text,'warning-item'));for(const text of result.missing)list.append(node('li',t('Missing information')+': '+t(text),undefined,true));
      if(!list.children.length)list.append(node('li','Entered costs and terms are complete for this scenario; bank confirmation is still needed'));details.append(list);
      if(result.knownCostSubtotal!==null&&!result.costsComplete)details.append(node('p',t('Known cost subtotal: {cost}. Unknown fees are excluded; no complete total is shown.',{cost:money(result.knownCostSubtotal)}),'notice warn',true));
      details.append(node('small',t('Calculated cost horizon: {months} months. Exit fees are not included; check early repayment terms separately.',{months:result.horizonMonths}),undefined,true));
      for(const key of ['source','validUntil','apr','benchmarkPeriod','resetMonths','insuranceTerms','earlyRepayment','conditions'])details.append(node('p',t(({source:'Offer source / reference',validUntil:'Offer expiry',apr:'APR supplied in offer (%)',benchmarkPeriod:'Benchmark period',resetMonths:'Rate reset interval (months)',insuranceTerms:'Insurance requirements / cover',earlyRepayment:'Early repayment terms',conditions:'Other conditions'})[key])+': '+value(row[key]),undefined,true));gaps.append(details);
    }
  }
  function initialize(){
    $('load-offers').onclick=()=>{const d=read();if(!W.simulationBanks.every(b=>simulations.get(b)?.revision===d.revision))return;if(offerRows.length&&!window.confirm(t('Replace entered demo offers with fictional examples?')))return;offerRows=O.samples(d).map(row=>{for(const key of ['name','source','earlyRepayment','conditions','insuranceTerms'])row[key]=t(row[key]);row.applicationRevision=d.revision;row.enteredAt=new Date().toISOString();return row;});offerRevision=d.revision;ctx.invalidateExport();renderOfferInputs();calculate();};
    $('add-offer').onclick=()=>{const d=read();const row=O.blank('manual-'+(++offerSerial));row.principal=d.loan.amount;row.termYears=d.loan.termYears;row.applicationRevision=d.revision;row.enteredAt=new Date().toISOString();offerRows.push(row);offerRevision=d.revision;ctx.invalidateExport();renderOfferInputs();calculate();};
    for(const id of ['benchmark','reference-date','horizon-years','comparison-period'])$(id).oninput=()=>{ctx.invalidateExport();calculate();};
  }
  function translatePage(){renderDataset();renderOfferInputs();if(ctx.currentPage()==='simulation')renderSimulation();if(ctx.currentPage()==='compare')calculate();}
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
  const api={initialize,reset,invalidate,renderDataset,sharedReadiness,bankCard,renderSimulation,calculate,translatePage,offerErrors,renderOutcomeReview,
    exportState(){const d=read();return {datasetReview:reviews.snapshot(d.revision),transmissionSimulation:{demo:true,sentToBank:false,records:[...simulations.values()].filter(r=>r.revision===d.revision)},offerComparison:{demo:true,sourceRevision:offerRevision,assumptions:assumptions(),offers:offerRows.map(r=>({...r,scenario:O.scenario(d,r,assumptions())}))}};}
  };return api;
}
