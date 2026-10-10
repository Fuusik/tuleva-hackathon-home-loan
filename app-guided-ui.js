/* Source examples in the continuous application. Never authenticates or reads files. */
function createGuidedUI(ctx){
  'use strict';
  const {M,t,node,pathInput,read,changed,syncBranches}=ctx,$=id=>document.getElementById(id);
  const sources={identity:'Simulated Smart-ID identity',tax:'Simulated EMTA data',statement:'Simulated statement data'};
  let busy=false,origin='blank',sourceOwner='primary';
  const inputs=()=>[...$('profile').querySelectorAll('[data-path]')].filter(x=>!x.disabled),has=x=>x.type==='checkbox'||x.value.trim()!=='';
  function refresh(){for(const input of inputs()){
    const label=input.closest('label');if(!label||input.readOnly)continue;const hint=LoanPrefill.forPath(input.dataset.path);
    let possible=label.querySelector('.prefill-hint');if(hint.kind!=='manual'){if(!possible){possible=node('small',undefined,'prefill-hint');label.append(possible);}possible.textContent=t(hint.label);possible.title=t(hint.detail);possible.dataset.i18n=hint.label;}else if(possible)possible.remove();
    let badge=label.querySelector('.source-badge');const source=has(input)?input.dataset.demoSource||'Entered by you':'';
    if(source&&source!=='Entered by you'){if(!badge){badge=node('small',undefined,'source-badge');label.append(badge);}badge.textContent=t('Current value: {source}',{source:t(source)});}else if(badge)badge.remove();
  }}
  function fill(source,owner){busy=true;try{
    const i=owner==='co'?1:0;if(i&&!$('has-co').checked){$('source-status').textContent=t('Enable the co-applicant before using their source example');return;}
    let count=0;const prefix='applicants.'+i,put=(key,value)=>{const input=pathInput(prefix+'.'+key);if(!input||input.disabled||input.value!=='')return false;input.value=value;input.dataset.demoSource=sources[source];count++;return true;};
    if(source==='identity'){const modified=[put('firstName',i?'Demo Co':'Demo'),put('lastName','Applicant'),put('personalId',i?'DEMO-0002':'DEMO-0001')].some(Boolean);if(modified)ctx.clearIdentityChoices(owner);}
    if(source==='tax'){put('employment.status','employed');syncBranches();put('employment.employer','Example Employer');}
    if(source==='statement'){put('statements.status','available');put('statements.months',6);const status=pathInput(prefix+'.incomesStatus');if(status.value===''&&!read().applicants[i].incomes.length){status.value='provided';syncBranches();ctx.addIncome(prefix,{type:'Salary',amount:i?1800:3500,currency:'EUR',frequency:'monthly',evidence:t('Simulated reading; no selected file was parsed')});inputs().filter(x=>x.dataset.path.startsWith(prefix+'.incomes')).forEach(x=>{x.dataset.demoSource=sources[source];count++;});}}
    if(count)changed();refresh();$('source-status').textContent=count?t('{n} demo fields filled. Check every value; no authentication, registry query or file reading occurred.',{n:count}):t('These fields are already filled or not applicable. Examples fill blanks only. To try a fresh demo, choose Start blank above.');
  }finally{busy=false;}}
  function render(){const target=$('guided-controls');target.replaceChildren();const card=node('div',undefined,'notice');card.append(node('strong','Possible automatic prefilling'),node('p','Smart-ID could fill name and personal ID; permitted EMTA data and statement reading need separate sources and your review. This demo has no real connections.'));
    const details=node('details');details.append(node('summary','Try source examples (demo)'));const label=node('label',undefined,'field'),owner=node('select');owner.id='source-owner';label.htmlFor=owner.id;label.append(node('span','Person for source example'),owner);for(const [v,l] of [['primary','Primary applicant'],['co','Co-applicant']]){const option=node('option',l);option.value=v;owner.append(option);}owner.value=sourceOwner;owner.onchange=()=>sourceOwner=owner.value;details.append(label);
    const actions=node('div',undefined,'actions');for(const [key,text] of [['identity','Simulate Smart-ID identity'],['tax','Simulate EMTA fields'],['statement','Simulate statement reading']]){const b=node('button',text,'secondary small');b.type='button';b.onclick=()=>fill(key,owner.value);actions.append(b);}details.append(actions,node('small','Examples fill blank fields only. Existing answers and original files are kept. Personal ID entry alone is not sign-in.'));const status=node('p');status.id='source-status';status.setAttribute('role','status');details.append(status);card.append(details);target.append(card);refresh();
  }
  return {initialize:render,refresh,translate:render,reset(source){origin=source;sourceOwner='primary';for(const input of $('profile').querySelectorAll('[data-path]')){delete input.dataset.demoSource;if(has(input)&&source!=='blank'&&!input.disabled)input.dataset.demoSource='Fictional built-in example';}render();},mark(paths,source){for(const path of paths){const input=pathInput(path);if(input)input.dataset.demoSource=source;}refresh();},edited(path){const input=pathInput(path);if(input&&!busy)input.dataset.demoSource='Entered by you';refresh();},exportState(){return {demo:true,origin,identityVerified:false,registryQueried:false,filesParsed:false,fields:inputs().filter(has).map(x=>({path:x.dataset.path,source:x.dataset.demoSource||'Entered by you'})),activeAnsweredFields:inputs().filter(has).length,selectedBanks:read().selectedBanks.length};}};
}
