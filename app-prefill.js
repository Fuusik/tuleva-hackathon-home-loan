/* Future source suggestions, not integrations or evidence of current field values. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LoanPrefill=api;})(globalThis,function(){
  'use strict';
  const hints=Object.freeze({
    identity:Object.freeze({kind:'identity',label:'Potential prefilling: Smart-ID',detail:'Name and personal ID after successful identity verification. This demo does not sign you in.'}),
    tax:Object.freeze({kind:'tax',label:'Potential prefilling: EMTA, with separate permission',detail:'Employment information requires permitted access to a separate source and your review. No registry is connected in this demo.'}),
    statement:Object.freeze({kind:'statement',label:'Potential suggestion: account statement',detail:'A future statement reader could suggest values for you to check. This demo does not read selected files.'}),
    manual:Object.freeze({kind:'manual',label:'Enter or confirm yourself',detail:'Your answer is needed. Identity verification or an account statement does not establish this information.'})
  });
  function forPath(path){
    if(typeof path!=='string')return hints.manual;
    if(/^applicants\.[01]\.(firstName|lastName|personalId)$/.test(path))return hints.identity;
    if(/^applicants\.[01]\.employment\.(status|employer)$/.test(path))return hints.tax;
    if(/^applicants\.[01]\.incomes\.\d+\.(type|amount|currency|frequency)$/.test(path)||/^applicants\.[01]\.statements\.(status|months)$/.test(path)||path==='household.monthlyExpenses')return hints.statement;
    return hints.manual;
  }
  return Object.freeze({hints,forPath});
});
