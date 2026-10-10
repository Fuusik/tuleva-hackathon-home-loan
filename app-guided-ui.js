/* Guided page-memory form. Every data-source example is simulated, never an integration. */
function createGuidedUI(ctx){
  'use strict';
  const {M,t,node,pathInput,read,changed,syncBranches}=ctx,$=id=>document.getElementById(id);
  const provenance=new Map(),sources={identity:'Simulated Smart-ID identity',tax:'Simulated EMTA data',statement:'Simulated statement data'};
  let mode='goal',missingOnly=false,busy=false,origin='fictional-example',sourceOwner='primary';
  const inputs=()=>[...$('profile').querySelectorAll('[data-path]')].filter(x=>!x.disabled);
  const has=x=>x.type==='checkbox'||x.value.trim()!=='';
  function badge(input){const label=input.closest('label');if(!label)return;let b=label.querySelector('.source-badge');if(!b){b=node('small',undefined,'source-badge');label.append(b);}const source=has(input)?input.dataset.demoSource||'Entered by you':'Missing';b.textContent=t(source);b.dataset.i18n=source;}
  function refresh(){inputs().forEach(badge);const active=inputs().filter(x=>x.type!=='checkbox'),filled=active.filter(has),simulated=filled.filter(x=>/^Simulated|Fictional/.test(x.dataset.demoSource||''));
    if($('prefill-metrics'))$('prefill-metrics').textContent=t('{filled} filled fields, {missing} unanswered, {prefilled} example-prefilled; reused for {banks} selected banks.',{filled:filled.length,missing:active.length-filled.length,prefilled:simulated.length,banks:read().selectedBanks.length});}
  function applyMode(){
    const goal=mode==='goal';
    const form=$('profile');[...form.children].forEach(el=>{if(el.tagName==='DIV'&&el.classList.contains('actions'))return;el.hidden=goal?!['bank-selection','financing-card'].includes(el.id):false;});
    syncBranches();
    $('dataset-review').hidden=mode!=='review';$('source-controls').hidden=mode==='goal';
    form.querySelectorAll('label[data-filter-hidden]').forEach(el=>{el.hidden=false;delete el.dataset.filterHidden;});
    if(missingOnly&&mode==='review')for(const input of inputs())if(input.type!=='checkbox'&&has(input)&&input.checkValidity()&&!M.errors(read()).length){const wrap=input.closest('label');wrap.hidden=true;wrap.dataset.filterHidden='true';}
    $('guided-steps').querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    $('missing-only').checked=missingOnly;if($('guided-next'))$('guided-next').textContent=t(mode==='goal'?'Continue to data and sources':'Continue to answer check');refresh();
  }
  function fill(source,owner){
    busy=true;
    try{
      const i=owner==='co'?1:0;if(i===1&&!$('has-co').checked){$('source-status').textContent=t('Enable the co-applicant before using their source example');return;}
      const prefix='applicants.'+i;
      const put=(key,value)=>{const input=pathInput(prefix+'.'+key);if(!input||input.disabled||input.value!=='')return false;input.value=value;input.dataset.demoSource=sources[source];provenance.set(input.dataset.path,sources[source]);return true;};
      if(source==='identity'){const modified=[put('firstName',i?'Demo Co':'Demo'),put('lastName','Applicant'),put('personalId',i?'DEMO-0002':'DEMO-0001')].some(Boolean);if(modified)ctx.clearIdentityChoices(owner);}
      if(source==='tax'){put('employment.status','employed');syncBranches();put('employment.employer','Example Employer');put('employment.type','Permanent');put('employment.tenureMonths',36);}
      if(source==='statement'){
        put('statements.status','available');put('statements.months',6);
        // Demonstration rows are added only when the user has not declared or entered income.
        const status=pathInput(prefix+'.incomesStatus');
        if(status&&status.value===''&&!read().applicants[i].incomes.length){
          status.value='provided';syncBranches();ctx.addIncome(prefix,{type:'Salary',amount:i?1800:3500,currency:'EUR',frequency:'monthly',evidence:t('Simulated reading; no selected file was parsed')});
          inputs().filter(x=>x.dataset.path.startsWith(prefix+'.incomes')).forEach(x=>{x.dataset.demoSource=sources[source];provenance.set(x.dataset.path,sources[source]);});
        }
      }
      changed();refresh();$('source-status').textContent=t('Example data added to blank fields only. Check every value; no authentication, registry query or file reading occurred.');
    }finally{busy=false;}
  }
  function render(){const target=$('guided-controls');target.replaceChildren();
    const steps=node('div',undefined,'actions');steps.id='guided-steps';
    for(const [key,label] of [['goal','Loan goal'],['data','Data and sources'],['review','Check answers']]){const b=node('button',label,'secondary small');b.type='button';b.dataset.mode=key;b.onclick=()=>{mode=key;applyMode();};steps.append(b);}target.append(steps);
    const controls=node('div',undefined,'card');controls.id='source-controls';controls.append(node('h3','Try simulated prefilling'),node('p','Smart-ID can establish identity. Income, employment and account data require separate permitted sources. Entering a personal ID alone is not sign-in. All source buttons below use fictional examples.','muted'));
    const owner=node('select');owner.id='source-owner';owner.setAttribute('aria-label',t('Person for source example'));for(const [v,l] of [['primary','Primary applicant'],['co','Co-applicant']]){const option=node('option',l);option.value=v;owner.append(option);}owner.value=sourceOwner;owner.onchange=()=>sourceOwner=owner.value;controls.append(owner);
    const actions=node('div',undefined,'actions');for(const [key,label] of [['identity','Simulate Smart-ID identity'],['tax','Simulate EMTA fields'],['statement','Simulate statement reading']]){const b=node('button',label,'secondary small');b.type='button';b.onclick=()=>fill(key,owner.value);actions.append(b);}controls.append(actions,node('small','The co-applicant must be enabled before adding their example data. Real separate sign-in remains future work.'));
    const status=node('p');status.id='source-status';status.setAttribute('role','status');controls.append(status);
    const filter=node('label',undefined,'check'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id='missing-only';checkbox.onchange=()=>{missingOnly=checkbox.checked;mode='review';applyMode();};filter.append(checkbox,node('span','Show only unanswered fields while checking'));controls.append(filter);target.append(controls);
    const metrics=node('p',undefined,'notice');metrics.id='prefill-metrics';target.append(metrics);
    const next=node('button','Continue to data and sources','secondary');next.id='guided-next';next.type='button';next.onclick=()=>{mode=mode==='goal'?'data':'review';applyMode();};target.append(next);applyMode();
  }
  return {initialize:render,refresh,reset(source){origin=source;provenance.clear();for(const input of $('profile').querySelectorAll('[data-path]')){delete input.dataset.demoSource;if(has(input)&&source!=='blank'&&!input.disabled)input.dataset.demoSource='Fictional built-in example';}mode='goal';missingOnly=false;sourceOwner='primary';render();},translate:render,
    mark(paths,source){paths.forEach(path=>{const input=pathInput(path);if(input)input.dataset.demoSource=source;});refresh();},edited(path){if(!busy&&path){const input=pathInput(path);if(input)input.dataset.demoSource='Entered by you';}refresh();},exportState(){return {demo:true,origin,identityVerified:false,registryQueried:false,filesParsed:false,fields:inputs().filter(has).map(x=>({path:x.dataset.path,source:x.dataset.demoSource||'Entered by you'})),activeAnsweredFields:inputs().filter(has).length,selectedBanks:read().selectedBanks.length};}};
}
