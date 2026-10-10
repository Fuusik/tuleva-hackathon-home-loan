/* Guided page-memory form. Every data-source example is simulated, never an integration. */
function createGuidedUI(ctx){
  'use strict';
  const {M,t,node,pathInput,read,changed,syncBranches}=ctx,$=id=>document.getElementById(id);
  const sources={identity:'Simulated Smart-ID identity',tax:'Simulated EMTA data',statement:'Simulated statement data'};
  let mode='goal',missingOnly=false,busy=false,origin='fictional-example',sourceOwner='primary';
  const inputs=()=>[...$('profile').querySelectorAll('[data-path]')].filter(x=>!x.disabled);
  const has=x=>x.type==='checkbox'||x.value.trim()!=='';
  function badge(input){
    const label=input.closest('label');if(!label)return;if(input.type==='checkbox')label.classList.add('with-prefill');
    const hint=LoanPrefill.forPath(input.dataset.path);
    let potential=label.querySelector('.prefill-hint');
    if(!potential){potential=node('small',undefined,'prefill-hint');label.append(potential);}
    potential.textContent=t(hint.label);potential.title=t(hint.detail);potential.dataset.i18n=hint.label;potential.dataset.prefillKind=hint.kind;
    let b=label.querySelector('.source-badge');if(!b){b=node('small',undefined,'source-badge');label.append(b);}
    const source=has(input)?input.dataset.demoSource||'Entered by you':'Missing';
    b.textContent=t('Current value: {source}',{source:t(source)});delete b.dataset.i18n;
  }
  function refresh(){inputs().forEach(badge);const active=inputs().filter(x=>x.type!=='checkbox'),filled=active.filter(has),simulated=filled.filter(x=>/^Simulated|Fictional/.test(x.dataset.demoSource||''));
    if($('prefill-metrics'))$('prefill-metrics').textContent=t('{filled} filled fields, {missing} unanswered, {prefilled} example-prefilled; reused for {banks} selected banks.',{filled:filled.length,missing:active.length-filled.length,prefilled:simulated.length,banks:read().selectedBanks.length});}
  function applyMode(){
    const goal=mode==='goal';
    const form=$('profile');[...form.children].forEach(el=>{if(el.tagName==='DIV'&&el.classList.contains('actions'))return;el.hidden=goal?!['bank-selection','financing-card'].includes(el.id):false;});
    syncBranches();
    $('dataset-review').hidden=mode!=='review';
    form.querySelectorAll('label[data-filter-hidden]').forEach(el=>{el.hidden=false;delete el.dataset.filterHidden;});
    if(missingOnly&&mode==='review')for(const input of inputs())if(input.type!=='checkbox'&&has(input)&&input.checkValidity()&&!M.errors(read()).length){const wrap=input.closest('label');wrap.hidden=true;wrap.dataset.filterHidden='true';}
    $('guided-steps').querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    $('missing-only').checked=missingOnly;if($('guided-next'))$('guided-next').textContent=t(mode==='goal'?'Continue to data and sources':'Continue to answer check');refresh();
  }
  function fill(source,owner){
    busy=true;
    try{
      const i=owner==='co'?1:0;if(i===1&&!$('has-co').checked){$('source-status').textContent=t('Enable the co-applicant before using their source example');return;}
      const prefix='applicants.'+i;let additions=0;
      const put=(key,value)=>{const input=pathInput(prefix+'.'+key);if(!input||input.disabled||input.value!=='')return false;input.value=value;input.dataset.demoSource=sources[source];additions++;return true;};
      if(source==='identity'){const modified=[put('firstName',i?'Demo Co':'Demo'),put('lastName','Applicant'),put('personalId',i?'DEMO-0002':'DEMO-0001')].some(Boolean);if(modified)ctx.clearIdentityChoices(owner);}
      if(source==='tax'){put('employment.status','employed');syncBranches();put('employment.employer','Example Employer');}
      if(source==='statement'){
        put('statements.status','available');put('statements.months',6);
        // Demonstration rows are added only when the user has not declared or entered income.
        const status=pathInput(prefix+'.incomesStatus');
        if(status&&status.value===''&&!read().applicants[i].incomes.length){
          status.value='provided';syncBranches();ctx.addIncome(prefix,{type:'Salary',amount:i?1800:3500,currency:'EUR',frequency:'monthly',evidence:t('Simulated reading; no selected file was parsed')});
          inputs().filter(x=>x.dataset.path.startsWith(prefix+'.incomes')).forEach(x=>{x.dataset.demoSource=sources[source];additions++;});
        }
      }
      if(additions)changed();refresh();
      $('source-status').textContent=additions?t('{n} demo fields filled. Check every value; no authentication, registry query or file reading occurred.',{n:additions}):t('These fields are already filled or not applicable. Examples fill blanks only. To try a fresh demo, choose Start blank above.');
    }finally{busy=false;}
  }
  function render(){const target=$('guided-controls');target.replaceChildren();
    const steps=node('div',undefined,'actions');steps.id='guided-steps';
    for(const [key,label] of [['goal','Loan goal'],['data','Data and sources'],['review','Check answers']]){const b=node('button',label,'secondary small');b.type='button';b.dataset.mode=key;b.onclick=()=>{mode=key;applyMode();};steps.append(b);}target.append(steps);
    const controls=node('section',undefined,'card prefill-overview');controls.id='source-controls';
    const heading=node('h3','Automatic prefilling: what could come from sources?');heading.id='source-heading';controls.setAttribute('aria-labelledby',heading.id);
    controls.append(heading,node('p','Demo: real source connections are not available','status'),node('p','Smart-ID can establish identity. Income, employment and account data require separate permitted sources. Entering a personal ID alone is not sign-in. All source buttons below use fictional examples.','muted'));
    const overview=node('div',undefined,'prefill-source-grid');
    for(const [title,description] of [
      ['Smart-ID: name and personal ID','Successful identity verification could prefill your name and personal ID. Other application data need separate sources or your answers.'],
      ['EMTA: employment information','A future connection, with permitted access and separate permission, could suggest employment information. Check and complete the answer.'],
      ['Account statements: income suggestions','A future reader could suggest income and recurring expenses. You confirm the classification, amounts and period; debt balances and credit limits still need your answers.']
    ]){const item=node('div',undefined,'prefill-source');item.append(node('h4',title),node('p',description));overview.append(item);}controls.append(overview);
    controls.append(node('p','Loan choices, debt and credit-limit details, property information and confirmations remain yours to enter or check. Each field shows a potential source separately from the source of its current value.','muted'));
    const show=node('button','View fields and their potential sources','secondary small');show.type='button';show.onclick=()=>{mode='data';missingOnly=false;applyMode();$('primary-container').scrollIntoView({block:'start',behavior:'smooth'});};controls.append(show);
    controls.append(node('h4','Try simulated prefilling'),node('p','The loaded fictional example already has answers. Demo buttons fill blank fields only; use Start blank above to try filling a new application.','muted'));
    const owner=node('select');owner.id='source-owner';owner.setAttribute('aria-label',t('Person for source example'));for(const [v,l] of [['primary','Primary applicant'],['co','Co-applicant']]){const option=node('option',l);option.value=v;owner.append(option);}owner.value=sourceOwner;owner.onchange=()=>sourceOwner=owner.value;controls.append(owner);
    const actions=node('div',undefined,'actions');for(const [key,label] of [['identity','Simulate Smart-ID identity'],['tax','Simulate EMTA fields'],['statement','Simulate statement reading']]){const b=node('button',label,'secondary small');b.type='button';b.onclick=()=>{mode='data';missingOnly=false;applyMode();fill(key,owner.value);};actions.append(b);}controls.append(actions,node('small','The co-applicant must be enabled before adding their example data. Real separate sign-in remains future work.'));
    const status=node('p');status.id='source-status';status.setAttribute('role','status');controls.append(status);
    const filter=node('label',undefined,'check'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id='missing-only';checkbox.onchange=()=>{missingOnly=checkbox.checked;mode='review';applyMode();};filter.append(checkbox,node('span','Show only unanswered fields while checking'));controls.append(filter);target.append(controls);
    const metrics=node('p',undefined,'notice');metrics.id='prefill-metrics';target.append(metrics);
    const next=node('button','Continue to data and sources','secondary');next.id='guided-next';next.type='button';next.onclick=()=>{mode=mode==='goal'?'data':'review';applyMode();};target.append(next);applyMode();
  }
  return {initialize:render,refresh,reset(source){origin=source;for(const input of $('profile').querySelectorAll('[data-path]')){delete input.dataset.demoSource;if(has(input)&&source!=='blank'&&!input.disabled)input.dataset.demoSource='Fictional built-in example';}mode='goal';missingOnly=false;sourceOwner='primary';render();},translate:render,
    mark(paths,source){paths.forEach(path=>{const input=pathInput(path);if(input)input.dataset.demoSource=source;});refresh();},edited(path){if(!busy&&path){const input=pathInput(path);if(input)input.dataset.demoSource='Entered by you';}refresh();},exportState(){return {demo:true,origin,identityVerified:false,registryQueried:false,filesParsed:false,fields:inputs().filter(has).map(x=>({path:x.dataset.path,source:x.dataset.demoSource||'Entered by you'})),activeAnsweredFields:inputs().filter(has).length,selectedBanks:read().selectedBanks.length};}};
}
