(()=> {
const $=id=>document.getElementById(id), money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let data=[];try{data=JSON.parse(localStorage.getItem('meuControleFin_v1')||'[]');if(!Array.isArray(data))data=[]}catch(e){data=[]}
let type='income',filter='all',hidden=false;
let cards=[],cardPurchases=[];
try{cards=JSON.parse(localStorage.getItem('meuControleFin_cards_v1')||'[]');if(!Array.isArray(cards))cards=[]}catch(e){cards=[]}
try{cardPurchases=JSON.parse(localStorage.getItem('meuControleFin_cardPurchases_v1')||'[]');if(!Array.isArray(cardPurchases))cardPurchases=[]}catch(e){cardPurchases=[]}
const saveCards=()=>{try{localStorage.setItem('meuControleFin_cards_v1',JSON.stringify(cards));localStorage.setItem('meuControleFin_cardPurchases_v1',JSON.stringify(cardPurchases))}catch(e){toast('Não foi possível salvar os cartões neste aparelho.')}};
const applyTheme=theme=>{document.body.dataset.theme=theme;$('themeToggle').textContent=theme==='dark'?'☀️ Claro':'🌙 Escuro';$('themeToggle').setAttribute('aria-label',theme==='dark'?'Ativar modo claro':'Ativar modo escuro');document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#111a16':'#193f32'};
let savedTheme='light';try{savedTheme=localStorage.getItem('meuControleFin_theme')||'light'}catch(e){}
applyTheme(savedTheme==='dark'?'dark':'light');
$('themeToggle').addEventListener('click',()=>{const next=document.body.dataset.theme==='dark'?'light':'dark';applyTheme(next);try{localStorage.setItem('meuControleFin_theme',next)}catch(e){}});
const save=()=>{try{localStorage.setItem('meuControleFin_v1',JSON.stringify(data))}catch(e){toast('Não foi possível salvar neste aparelho.')}};
const toast=t=>$('toast').textContent=t, isMonth=d=>d.slice(0,7)===today().slice(0,7);
const total=(k,a=data)=>a.filter(x=>x.type===k).reduce((s,x)=>s+x.amount,0);
const sorted=a=>a.slice().sort((x,y)=>y.date.localeCompare(x.date)||y.id-x.id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function row(x){return `<div class="tx"><div class="dot">${x.type==='income'?'↗':'↙'}</div><div class="txmain"><strong>${esc(x.description)}</strong><small>${esc(x.category)} · ${x.date.split('-').reverse().join('/')}</small></div><div><div class="txval" style="color:${x.type==='income'?'#26956a':'#c75e5e'}">${x.type==='income'?'+':'−'} ${money(x.amount)}</div><button class="del" data-tx-edit="${x.id}">Editar</button><button class="del" data-delete="${x.id}">Excluir</button></div></div>`}
function cats(kind,id,mi){let o={};mi.filter(x=>x.type===kind).forEach(x=>o[x.category]=(o[x.category]||0)+x.amount);let a=Object.entries(o).sort((x,y)=>y[1]-x[1]);$(id).innerHTML=a.length?a.map(([k,v])=>`<div style="margin-bottom:13px"><div class="row"><span>${esc(k)}</span><b>${money(v)}</b></div><div class="bar"><div style="width:${v/Math.max(1,total(kind,mi))*100}%;background:${kind==='income'?'#55b98b':'#df7777'}"></div></div></div>`).join(''):'Nenhum lançamento neste mês.'}
function render(){
 let mi=data.filter(x=>isMonth(x.date)),inc=total('income'),exp=total('expense'),im=total('income',mi),em=total('expense',mi);
 $('balance').textContent=hidden?'••••••':money(inc-exp);$('income').textContent=hidden?'••••••':money(inc);$('expense').textContent=hidden?'••••••':money(exp);
 $('monthLabel').textContent=new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 $('monthIncome').textContent=money(im);$('monthExpense').textContent=money(em);
 $('incomeBar').style.width=(im+em?im/(im+em)*100:0)+'%';$('expenseBar').style.width=(im+em?em/(im+em)*100:0)+'%';
 $('recent').innerHTML=sorted(data).slice(0,4).map(row).join('')||'<div class="muted" style="text-align:center;padding:12px">Nenhuma movimentação ainda.</div>';
 let q=$('filterText').value.toLowerCase(),a=sorted(data).filter(x=>(filter==='all'||x.type===filter)&&(!q||(x.description+' '+x.category).toLowerCase().includes(q)));
 $('historyList').innerHTML=a.map(row).join('')||'<div class="muted" style="text-align:center;padding:12px">Nenhuma movimentação encontrada.</div>';
 $('monthResult').textContent=money(im-em);cats('expense','categories',mi);cats('income','incomeCategories',mi);
}
function renderReports(){
 const months=Number($('reportPeriod').value||6),now=new Date(),keys=[];
 for(let i=months-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);keys.push(String(d.getFullYear())+'-'+String(d.getMonth()+1).padStart(2,'0'))}
 const monthData=keys.map(key=>{const list=data.filter(x=>x.date&&x.date.slice(0,7)===key),income=total('income',list),expense=total('expense',list);return {key,income,expense,result:income-expense}});
 let accumulated=data.filter(x=>x.date&&x.date.slice(0,7)<keys[0]).reduce((s,x)=>s+(x.type==='income'?x.amount:-x.amount),0);
 monthData.forEach(m=>{accumulated+=m.result;m.balance=accumulated});
 const sumIncome=monthData.reduce((s,m)=>s+m.income,0),sumExpense=monthData.reduce((s,m)=>s+m.expense,0);
 $('reportIncome').textContent=money(sumIncome);$('reportExpense').textContent=money(sumExpense);
 const first=new Date(keys[0]+'-01T12:00:00'),last=new Date(keys[keys.length-1]+'-01T12:00:00');
 $('reportRange').textContent=first.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})+' até '+last.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 const maxMonthly=Math.max(1,...monthData.flatMap(m=>[m.income,m.expense]));
 $('reportMonthly').innerHTML=monthData.map(m=>'<div style="margin-bottom:14px"><div class="row" style="font-size:12px;margin-bottom:5px"><b>'+new Date(m.key+'-02T12:00:00').toLocaleDateString('pt-BR',{month:'short',year:'2-digit'})+'</b><span class="muted">Saldo: '+money(m.result)+'</span></div><div class="bar" style="height:10px;margin:4px 0"><div style="width:'+(m.income/maxMonthly*100)+'%;background:#55b98b"></div></div><div class="bar" style="height:10px;margin:4px 0"><div style="width:'+(m.expense/maxMonthly*100)+'%;background:#df7777"></div></div><div class="row muted" style="font-size:11px"><span>Entrou: '+money(m.income)+'</span><span>Saiu: '+money(m.expense)+'</span></div></div>').join('');
 const expenses=data.filter(x=>x.type==='expense'&&keys.includes(x.date.slice(0,7))),groups={};
 expenses.forEach(x=>groups[x.category]=(groups[x.category]||0)+x.amount);
 const cats=Object.entries(groups).sort((a,b)=>b[1]-a[1]),catTotal=cats.reduce((s,x)=>s+x[1],0),palette=['#34765a','#d49a3a','#6487bd','#b879a5','#d77777','#6eaaa4','#8a8f9d'];
 $('reportCategories').innerHTML=cats.length?cats.map(([name,value],i)=>'<div style="margin-bottom:13px"><div class="row" style="font-size:13px"><span>'+esc(name)+'</span><b>'+money(value)+' · '+(value/catTotal*100).toFixed(1)+'%</b></div><div class="bar"><div style="width:'+(value/catTotal*100)+'%;background:'+palette[i%palette.length]+'"></div></div></div>').join(''):'<span class="muted">Nenhuma despesa neste período.</span>';
 const maxResult=Math.max(1,...monthData.map(x=>Math.abs(x.balance)));
 $('reportBalance').innerHTML=monthData.map(m=>'<div style="margin-bottom:13px"><div class="row" style="font-size:13px;margin-bottom:5px"><span>'+new Date(m.key+'-02T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'})+'</span><b style="color:'+(m.balance>=0?'#26956a':'#c75e5e')+'">'+money(m.balance)+'</b></div><div class="bar"><div style="width:'+(Math.abs(m.balance)/maxResult*100)+'%;background:'+(m.balance>=0?'#55b98b':'#df7777')+'"></div></div></div>').join('');
}
$('reportPeriod').addEventListener('change',renderReports);

function page(p){document.querySelectorAll('.page').forEach(s=>s.classList.toggle('active',s.id===p));document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.page===p));render();if(p==='add')$('date').value=today();if(p==='cards'){$('purchaseDate').value=today();renderCards()}if(p==='budgets'){renderBudgets();renderRecurring()}if(p==='goals')renderGoals();if(p==='summary')renderCalendar();if(p==='reports')renderReports();window.scrollTo(0,0)}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.page)));
function setType(t){type=t;$('incomeType').className='btn '+(t==='income'?'primary':'soft');$('expenseType').className='btn '+(t==='expense'?'primary':'soft');let opts=t==='income'?['Salário','Renda extra','Investimentos','Outros']:['Moradia','Alimentação','Transporte','Saúde','Lazer','Compras','Contas','Cartão de crédito','Outros'];$('category').innerHTML=opts.map(x=>`<option>${x}</option>`).join('')}
$('incomeType').onclick=()=>setType('income');$('expenseType').onclick=()=>setType('expense');
$('txForm').addEventListener('submit',e=>{e.preventDefault();let amount=Number($('amount').value);if(!Number.isFinite(amount)||amount<=0){toast('Informe um valor válido.');return}data.push({id:Date.now()+Math.random(),type,amount,description:$('description').value.trim(),category:$('category').value,date:$('date').value});save();e.target.reset();$('date').value=today();toast('Movimentação salva!');page('dashboard')});
document.addEventListener('click',e=>{let b=e.target.closest('[data-delete]');if(b){data=data.filter(x=>String(x.id)!==b.dataset.delete);save();render();toast('Movimentação excluída.')}let f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.className='btn '+(x===f?'primary':'soft'));render()}});
$('filterText').addEventListener('input',render);$('toggleBalance').onclick=()=>{hidden=!hidden;$('toggleBalance').textContent=hidden?'⊘':'◉';render()};
$('export').onclick=()=>{let csv='Tipo;Descricao;Categoria;Valor;Data\n'+data.map(x=>[x.type==='income'?'Receita':'Despesa',x.description,x.category,x.amount,x.date].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\n');let a=document.createElement('a'),u=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));a.href=u;a.download='meu-controle-financeiro.csv';a.click();URL.revokeObjectURL(u);toast('Arquivo exportado.')};
$('date').value=today();setType('income');render();
function monthKey(d){return d.slice(0,7)}
function addMonths(date,n){let d=new Date(date+'T12:00:00');let day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);let last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return monthKey(todayFromDate(d))}
function todayFromDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function installmentValue(p){return p.amount/p.installments}
function purchaseInMonth(p,m){let card=cards.find(c=>c.id===p.cardId),start=monthKey(p.date);if(card&&Number(p.date.slice(8,10))>card.closing)start=addMonths(p.date,1);let diff=(Number(m.slice(0,4))-Number(start.slice(0,4)))*12+Number(m.slice(5,7))-Number(start.slice(5,7));return diff>=0&&diff<p.installments?installmentValue(p):0}
function renderCards(){
 const sel=$('purchaseCard');if(!sel)return;
 sel.innerHTML='<option value="">Selecione um cartão</option>'+cards.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(c.bank||'')}</option>`).join('');
 $('cardsCount').textContent=cards.length+' cartão(ões)';
 $('cardsList').innerHTML=cards.map(c=>{let used=cardPurchases.filter(p=>p.cardId===c.id).reduce((s,p)=>s+p.amount,0),available=Math.max(0,c.limit-used);return `<div class="credit-card"><div class="row"><b>💳 ${esc(c.name)}</b><small>${esc(c.bank||'')}</small></div><div class="muted" style="color:#d2e6dc;font-size:12px;margin-top:12px">Limite disponível</div><div class="stat">${money(available)}</div><div class="row" style="font-size:12px;margin-top:10px"><span>Limite: ${money(c.limit)}</span><span>Usado: ${money(used)}</span></div><div class="row" style="font-size:12px;margin-top:7px"><span>Fecha dia ${c.closing}</span><span>Vence dia ${c.due}</span></div><div class="card-actions"><button class="btn soft" data-card-edit="${c.id}">Editar cartão</button><button class="btn soft" data-card-delete="${c.id}">Excluir cartão</button></div></div>`}).join('')||'<div class="panel muted">Cadastre seu primeiro cartão acima.</div>';
 const m=today().slice(0,7);$('cardMonthLabel').textContent=new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 const bills=cards.map(c=>({c,total:cardPurchases.filter(p=>p.cardId===c.id).reduce((s,p)=>s+purchaseInMonth(p,m),0)}));
 $('cardBills').innerHTML=bills.length?bills.map(x=>`<div class="tx"><div class="dot">💳</div><div class="txmain"><strong>${esc(x.c.name)}</strong><small>Vencimento dia ${x.c.due}</small></div><div class="txval">${money(x.total)}</div></div>`).join(''):'<div class="muted">Cadastre um cartão para acompanhar suas faturas.</div>';
 $('cardPurchases').innerHTML=sorted(cardPurchases).map(p=>{let c=cards.find(x=>x.id===p.cardId);return `<div class="tx"><div class="dot">🛍️</div><div class="txmain"><strong>${esc(p.description)}</strong><small>${esc(c?.name||'Cartão removido')} · ${p.date.split('-').reverse().join('/')} · ${p.installments}x de ${money(installmentValue(p))}</small></div><div class="txval">${money(p.amount)}<button class="del" data-purchase-edit="${p.id}">Editar</button><button class="del" data-purchase-delete="${p.id}">Excluir</button></div></div>`}).join('')||'<div class="muted">Nenhuma compra registrada.</div>';
}
$('cardForm').addEventListener('submit',e=>{e.preventDefault();let limit=Number($('cardLimit').value),closing=Number($('cardClosing').value),due=Number($('cardDue').value);if(!(limit>0&&closing>=1&&closing<=31&&due>=1&&due<=31)){toast('Confira limite e dias informados.');return}cards.push({id:String(Date.now())+Math.random(),name:$('cardName').value.trim(),bank:$('cardBank').value.trim(),limit,closing,due});saveCards();e.target.reset();renderCards();toast('Cartão cadastrado!')});
$('purchaseForm').addEventListener('submit',e=>{e.preventDefault();let amount=Number($('purchaseAmount').value),installments=Number($('purchaseInstallments').value);if(!$('purchaseCard').value||!(amount>0)){toast('Selecione um cartão e informe um valor válido.');return}cardPurchases.push({id:String(Date.now())+Math.random(),cardId:$('purchaseCard').value,description:$('purchaseDescription').value.trim(),amount,installments,date:$('purchaseDate').value});saveCards();e.target.reset();$('purchaseDate').value=today();renderCards();toast('Compra registrada!')});
document.addEventListener('click',e=>{let c=e.target.closest('[data-card-delete]');if(c){if(!confirm('Excluir este cartão e as compras vinculadas?'))return;cards=cards.filter(x=>x.id!==c.dataset.cardDelete);cardPurchases=cardPurchases.filter(x=>x.cardId!==c.dataset.cardDelete);saveCards();renderCards();toast('Cartão excluído.')}let p=e.target.closest('[data-purchase-delete]');if(p){cardPurchases=cardPurchases.filter(x=>x.id!==p.dataset.purchaseDelete);saveCards();renderCards();toast('Compra excluída.')}});
$('purchaseDate').value=today();renderCards();
/* Limites mensais por categoria */
let budgets=[];try{budgets=JSON.parse(localStorage.getItem('meuControleFin_budgets_v1')||'[]');if(!Array.isArray(budgets))budgets=[]}catch(e){budgets=[]}
const saveBudgets=()=>{try{localStorage.setItem('meuControleFin_budgets_v1',JSON.stringify(budgets))}catch(e){toast('Não foi possível salvar os limites.')}};
function renderBudgets(){
 const m=today().slice(0,7);$('budgetMonth').textContent=new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 $('budgetsList').innerHTML=budgets.map(b=>{const spent=data.filter(x=>x.type==='expense'&&x.category===b.category&&x.date.slice(0,7)===m).reduce((s,x)=>s+x.amount,0);const pct=b.limit>0?spent/b.limit*100:0,color=pct>=100?'#d65f5f':pct>=80?'#d49a3a':'#55b98b';return `<div class="panel"><div class="row"><b>${esc(b.category)}</b><button class="del" data-budget-edit="${esc(b.category)}">Editar</button><button class="del" data-budget-delete="${esc(b.category)}">Remover</button></div><div class="row" style="font-size:13px;margin-top:10px"><span class="muted">Gasto: ${money(spent)}</span><b>Limite: ${money(b.limit)}</b></div><div class="bar"><div style="width:${Math.min(100,pct)}%;background:${color}"></div></div><div class="row"><small class="muted">${pct>=100?'Limite ultrapassado':pct>=80?'Atenção: perto do limite':'Ainda dentro do limite'}</small><small><b>${Math.max(0,b.limit-spent).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</b> restantes</small></div></div>`}).join('')||'<div class="panel muted">Você ainda não definiu nenhum limite.</div>';
}
$('budgetForm').addEventListener('submit',e=>{e.preventDefault();const category=$('budgetCategory').value,limit=Number($('budgetLimit').value);if(!(limit>0)){toast('Informe um limite válido.');return}const found=budgets.find(b=>b.category===category);if(found)found.limit=limit;else budgets.push({category,limit});saveBudgets();e.target.reset();renderBudgets();toast('Limite mensal salvo!')});
document.addEventListener('click',e=>{const b=e.target.closest('[data-budget-delete]');if(b){budgets=budgets.filter(x=>x.category!==b.dataset.budgetDelete);saveBudgets();renderBudgets();toast('Limite removido.')}});
/* Contas fixas */
let recurringBills=[];try{recurringBills=JSON.parse(localStorage.getItem('meuControleFin_recurring_v1')||'[]');if(!Array.isArray(recurringBills))recurringBills=[]}catch(e){recurringBills=[]}
const saveRecurring=()=>{try{localStorage.setItem('meuControleFin_recurring_v1',JSON.stringify(recurringBills))}catch(e){toast('Não foi possível salvar as contas.')}};
$('calendarPrev').addEventListener('click',()=>{const [y,m]=calendarMonth.split('-').map(Number),d=new Date(y,m-2,1);calendarMonth=monthKey(todayFromDate(d));calendarSelected=calendarMonth+'-01';renderCalendar()});
$('calendarNext').addEventListener('click',()=>{const [y,m]=calendarMonth.split('-').map(Number),d=new Date(y,m,1);calendarMonth=monthKey(todayFromDate(d));calendarSelected=calendarMonth+'-01';renderCalendar()});
document.addEventListener('click',e=>{const day=e.target.closest('[data-calendar-day]');if(day){calendarSelected=day.dataset.calendarDay;renderCalendar()}});
function dueDateForMonth(day,month){const [y,m]=month.split('-').map(Number),last=new Date(y,m,0).getDate();return `${y}-${String(m).padStart(2,'0')}-${String(Math.min(day,last)).padStart(2,'0')}`}
let calendarMonth=today().slice(0,7),calendarSelected=today();
function paidInMonth(b,month){return data.some(x=>x.recurringBillId===b.id&&x.recurringMonth===month)}
function renderCalendar(){
 const [year,month]=calendarMonth.split('-').map(Number),first=new Date(year,month-1,1),days=new Date(year,month,0).getDate();$('calendarTitle').textContent=first.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 const offset=(first.getDay()+6)%7,cells=[];['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].forEach(d=>cells.push(`<div class="calendar-weekday">${d}</div>`));for(let i=0;i<offset;i++)cells.push('<div></div>');
 for(let day=1;day<=days;day++){const date=dueDateForMonth(day,calendarMonth),bills=recurringBills.filter(b=>dueDateForMonth(b.due,calendarMonth)===date),allPaid=bills.length>0&&bills.every(b=>paidInMonth(b,calendarMonth));const cls=[date===calendarSelected?'selected':'',bills.length?'has-bill':'',allPaid?'all-paid':''].filter(Boolean).join(' ');cells.push(`<button type="button" class="calendar-day ${cls}" data-calendar-day="${date}">${day}${bills.length?'<i class="calendar-dot"></i>':''}</button>`)}
 $('calendarGrid').innerHTML=cells.join('');renderCalendarDetails();
}
function renderCalendarDetails(){
 const [y,m,d]=calendarSelected.split('-').map(Number),date=calendarSelected;$('calendarSelectedTitle').textContent=new Date(y,m-1,d).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
 const bills=recurringBills.filter(b=>dueDateForMonth(b.due,calendarMonth)===date);
 $('calendarDayDetails').innerHTML=bills.length?bills.map(b=>{const paid=paidInMonth(b,calendarMonth),isCurrent=calendarMonth===today().slice(0,7);return `<div class="tx"><div class="dot">📄</div><div class="txmain"><strong>${esc(b.name)}</strong><small>${esc(b.category)} · ${paid?'Paga':'Pendente'}</small></div><div class="txval">${money(b.amount)}${paid?'<small style="display:block;color:#26956a">✓ Paga</small>':isCurrent?`<button class="btn primary" style="padding:7px 9px;margin-top:5px;font-size:11px" data-recurring-paid="${b.id}">Marcar paga</button>`:'<small style="display:block;color:#d49a3a">Pendente</small>'}</div></div>`}).join(''):'<span class="muted">Nenhuma conta com vencimento neste dia.</span>';
}
function renderRecurring(){
 const m=today().slice(0,7);$('recurringMonth').textContent=new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'});if(!calendarMonth)calendarMonth=m;if(!calendarSelected||calendarSelected.slice(0,7)!==calendarMonth)calendarSelected=calendarMonth+'-01';renderCalendar();
 $('recurringList').innerHTML=recurringBills.map(b=>{const paid=paidInMonth(b,m),due=dueDateForMonth(b.due,m);return `<div class="panel"><div class="row"><b>${esc(b.name)}</b><button class="del" data-recurring-edit="${b.id}">Editar</button><button class="del" data-recurring-delete="${b.id}">Excluir</button></div><div class="row" style="font-size:13px;margin-top:9px"><span class="muted">${esc(b.category)} · Vence dia ${b.due}</span><b>${money(b.amount)}</b></div><div class="row" style="margin-top:12px"><small class="muted">${paid?'Pagamento registrado':'Vencimento: '+due.split('-').reverse().join('/')}</small>${paid?'<span style="color:#26956a;font-size:13px;font-weight:700">✓ Paga</span>':`<button class="btn primary" data-recurring-paid="${b.id}">Marcar como paga</button>`}</div></div>`}).join('')||'<div class="panel muted">Nenhuma conta fixa cadastrada.</div>';
}
$('recurringForm').addEventListener('submit',e=>{e.preventDefault();const amount=Number($('recurringAmount').value),due=Number($('recurringDue').value);if(!(amount>0&&due>=1&&due<=31)){toast('Confira o valor e o dia do vencimento.');return}recurringBills.push({id:String(Date.now())+Math.random(),name:$('recurringName').value.trim(),amount,category:$('recurringCategory').value,due});saveRecurring();e.target.reset();renderRecurring();toast('Conta fixa cadastrada!')});
document.addEventListener('click',e=>{const del=e.target.closest('[data-recurring-delete]');if(del){if(!confirm('Excluir esta conta fixa? Os pagamentos já registrados serão mantidos.'))return;recurringBills=recurringBills.filter(x=>x.id!==del.dataset.recurringDelete);saveRecurring();renderRecurring();toast('Conta fixa excluída.')}const paid=e.target.closest('[data-recurring-paid]');if(paid){const b=recurringBills.find(x=>x.id===paid.dataset.recurringPaid);if(!b)return;const m=today().slice(0,7);if(data.some(x=>x.recurringBillId===b.id&&x.recurringMonth===m)){toast('Esta conta já foi marcada como paga neste mês.');return}data.push({id:Date.now()+Math.random(),type:'expense',amount:b.amount,description:b.name,category:b.category,date:dueDateForMonth(b.due,m),recurringBillId:b.id,recurringMonth:m});save();render();renderRecurring();toast('Conta marcada como paga e lançada nas despesas!')}});
/* Metas financeiras: dados isolados dos lançamentos e cartões */
let goals=[],goalDeposits=[];
try{goals=JSON.parse(localStorage.getItem('meuControleFin_goals_v1')||'[]');if(!Array.isArray(goals))goals=[]}catch(e){goals=[]}
try{goalDeposits=JSON.parse(localStorage.getItem('meuControleFin_goalDeposits_v1')||'[]');if(!Array.isArray(goalDeposits))goalDeposits=[]}catch(e){goalDeposits=[]}
const saveGoals=()=>{try{localStorage.setItem('meuControleFin_goals_v1',JSON.stringify(goals));localStorage.setItem('meuControleFin_goalDeposits_v1',JSON.stringify(goalDeposits))}catch(e){toast('Não foi possível salvar as metas neste aparelho.')}};
const goalSaved=id=>goalDeposits.filter(d=>d.goalId===id).reduce((sum,d)=>sum+d.amount,0);
function renderGoals(){
 $('goalsCount').textContent=goals.length+' meta(s)';
 $('goalsList').innerHTML=goals.map(g=>{const saved=goalSaved(g.id),pct=g.target>0?saved/g.target*100:0,remaining=Math.max(0,g.target-saved),complete=saved>=g.target;return `<article class="goal-card"><div class="row"><b>🏁 ${esc(g.name)}</b><button class="del" data-goal-edit="${g.id}">Editar</button><button class="del" data-goal-delete="${g.id}">Excluir</button></div><div class="row" style="margin-top:12px"><span class="goal-meta">Guardado</span><b>${money(saved)}</b></div><div class="bar"><div style="width:${Math.min(100,pct)}%;background:${complete?'#55b98b':'#34765a'}"></div></div><div class="row"><small class="goal-meta">${Math.min(100,pct).toFixed(0)}% concluído</small><small class="goal-meta">${complete?'Meta alcançada!':'Faltam '+money(remaining)}</small></div>${g.deadline?`<div class="goal-meta" style="margin-top:8px">Prazo: ${g.deadline.split('-').reverse().join('/')}</div>`:''}<form class="goal-deposit-form" data-goal-form="${g.id}" style="margin-top:14px"><label>Adicionar depósito (R$)<input class="field" name="deposit" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="Valor do depósito" required></label><label>Descrição (opcional)<input class="field" name="note" maxlength="45" placeholder="Ex.: Economia do mês"></label><button class="btn primary wide" type="submit">＋ Registrar depósito</button></form></article>`}).join('')||'<div class="panel muted">Você ainda não criou uma meta. Comece com um objetivo, como uma viagem ou uma reserva.</div>';
 $('goalDeposits').innerHTML=goalDeposits.slice().sort((a,b)=>b.date.localeCompare(a.date)||String(b.id).localeCompare(String(a.id))).slice(0,12).map(d=>{const g=goals.find(x=>x.id===d.goalId);return `<div class="tx"><div class="dot">💰</div><div class="txmain"><strong>${esc(g?.name||'Meta removida')}</strong><small>${esc(d.note||'Depósito')} · ${d.date.split('-').reverse().join('/')}</small></div><div class="txval" style="color:#26956a">+${money(d.amount)}<button class="del" data-goal-deposit-edit="${d.id}">Editar</button><button class="del" data-goal-deposit-delete="${d.id}">Desfazer</button></div></div>`}).join('')||'<div class="muted">Seus depósitos aparecerão aqui.</div>';
}
$('goalForm').addEventListener('submit',e=>{e.preventDefault();const target=Number($('goalTarget').value),name=$('goalName').value.trim(),deadline=$('goalDeadline').value;if(!name||!(target>0)){toast('Informe um nome e um valor válido.');return}goals.push({id:String(Date.now())+Math.random(),name,target,deadline});saveGoals();e.target.reset();renderGoals();toast('Meta criada com sucesso!')});
document.addEventListener('submit',e=>{const form=e.target.closest('.goal-deposit-form');if(!form)return;e.preventDefault();const amount=Number(form.elements.deposit.value),goalId=form.dataset.goalForm;if(!(amount>0)||!goals.some(g=>g.id===goalId)){toast('Informe um depósito válido.');return}goalDeposits.push({id:String(Date.now())+Math.random(),goalId,amount,note:form.elements.note.value.trim(),date:today()});saveGoals();renderGoals();toast('Depósito registrado!')});
document.addEventListener('click',e=>{const delGoal=e.target.closest('[data-goal-delete]');if(delGoal){if(!confirm('Excluir esta meta e o histórico de depósitos dela?'))return;goals=goals.filter(g=>g.id!==delGoal.dataset.goalDelete);goalDeposits=goalDeposits.filter(d=>d.goalId!==delGoal.dataset.goalDelete);saveGoals();renderGoals();toast('Meta excluída.')}const delDeposit=e.target.closest('[data-goal-deposit-delete]');if(delDeposit){if(!confirm('Desfazer este depósito?'))return;goalDeposits=goalDeposits.filter(d=>d.id!==delDeposit.dataset.goalDepositDelete);saveGoals();renderGoals();toast('Depósito desfeito.') }});

// Edição de todos os registros: prompts nativos para permitir correções sem apagar e recadastrar.
const askEdit=(label,value)=>{const v=prompt(label,value??'');return v===null?null:v.trim()};
const validMoney=v=>Number.isFinite(Number(v))&&Number(v)>0;
document.addEventListener('click',e=>{
 let b=e.target.closest('[data-tx-edit]');
 if(b){const x=data.find(v=>String(v.id)===b.dataset.txEdit);if(!x)return;const desc=askEdit('Descrição:',x.description);if(desc===null)return;const amount=askEdit('Valor (R$):',x.amount);if(amount===null)return;const category=askEdit('Categoria:',x.category);if(category===null)return;const date=askEdit('Data (AAAA-MM-DD):',x.date);if(date===null)return;if(!desc||!validMoney(amount)||!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)){toast('Dados inválidos. Nada foi alterado.');return}Object.assign(x,{description:desc,amount:Number(amount),category,date});save();render();toast('Movimentação atualizada!');return}
 b=e.target.closest('[data-card-edit]');
 if(b){const c=cards.find(v=>v.id===b.dataset.cardEdit);if(!c)return;const name=askEdit('Nome do cartão:',c.name);if(name===null)return;const bank=askEdit('Banco/instituição:',c.bank||'');if(bank===null)return;const limit=askEdit('Limite total (R$):',c.limit);if(limit===null)return;const closing=askEdit('Dia de fechamento (1 a 31):',c.closing);if(closing===null)return;const due=askEdit('Dia de vencimento (1 a 31):',c.due);if(due===null)return;if(!name||!validMoney(limit)||!Number.isInteger(Number(closing))||Number(closing)<1||Number(closing)>31||!Number.isInteger(Number(due))||Number(due)<1||Number(due)>31){toast('Dados inválidos. Nada foi alterado.');return}Object.assign(c,{name,bank,limit:Number(limit),closing:Number(closing),due:Number(due)});saveCards();renderCards();toast('Cartão atualizado!');return}
 b=e.target.closest('[data-purchase-edit]');
 if(b){const p=cardPurchases.find(v=>v.id===b.dataset.purchaseEdit);if(!p)return;const card=askEdit('ID do cartão atual: '+p.cardId+' (cole outro ID para trocar; deixe igual para manter)',p.cardId);if(card===null)return;const desc=askEdit('Descrição:',p.description);if(desc===null)return;const amount=askEdit('Valor total (R$):',p.amount);if(amount===null)return;const installments=askEdit('Número de parcelas:',p.installments);if(installments===null)return;const date=askEdit('Data (AAAA-MM-DD):',p.date);if(date===null)return;if(!cards.some(c=>c.id===card)||!desc||!validMoney(amount)||!Number.isInteger(Number(installments))||Number(installments)<1||Number(installments)>24||!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)){toast('Dados inválidos. Nada foi alterado.');return}Object.assign(p,{cardId:card,description:desc,amount:Number(amount),installments:Number(installments),date});saveCards();renderCards();toast('Compra atualizada!');return}
 b=e.target.closest('[data-budget-edit]');
 if(b){const x=budgets.find(v=>v.category===b.dataset.budgetEdit);if(!x)return;const category=askEdit('Categoria:',x.category);if(category===null)return;const limit=askEdit('Limite mensal (R$):',x.limit);if(limit===null)return;if(!category||!validMoney(limit)){toast('Dados inválidos. Nada foi alterado.');return}if(budgets.some(v=>v!==x&&v.category===category)){toast('Já existe um limite para essa categoria.');return}Object.assign(x,{category,limit:Number(limit)});saveBudgets();renderBudgets();toast('Limite atualizado!');return}
 b=e.target.closest('[data-recurring-edit]');
 if(b){const x=recurringBills.find(v=>v.id===b.dataset.recurringEdit);if(!x)return;const name=askEdit('Nome da conta:',x.name);if(name===null)return;const amount=askEdit('Valor (R$):',x.amount);if(amount===null)return;const category=askEdit('Categoria:',x.category);if(category===null)return;const due=askEdit('Dia do vencimento (1 a 31):',x.due);if(due===null)return;if(!name||!validMoney(amount)||!Number.isInteger(Number(due))||Number(due)<1||Number(due)>31){toast('Dados inválidos. Nada foi alterado.');return}Object.assign(x,{name,amount:Number(amount),category,due:Number(due)});saveRecurring();renderRecurring();toast('Conta atualizada!');return}
 b=e.target.closest('[data-goal-edit]');
 if(b){const x=goals.find(v=>v.id===b.dataset.goalEdit);if(!x)return;const name=askEdit('Nome da meta:',x.name);if(name===null)return;const target=askEdit('Valor desejado (R$):',x.target);if(target===null)return;const deadline=askEdit('Prazo (AAAA-MM-DD; deixe vazio para remover):',x.deadline||'');if(deadline===null)return;if(!name||!validMoney(target)||(deadline&&!/^\\d{4}-\\d{2}-\\d{2}$/.test(deadline))){toast('Dados inválidos. Nada foi alterado.');return}Object.assign(x,{name,target:Number(target),deadline});saveGoals();renderGoals();toast('Meta atualizada!');return}
 b=e.target.closest('[data-goal-deposit-edit]');
 if(b){const x=goalDeposits.find(v=>v.id===b.dataset.goalDepositEdit);if(!x)return;const goal=askEdit('ID da meta atual: '+x.goalId+' (cole outro ID para transferir; deixe igual para manter)',x.goalId);if(goal===null)return;const amount=askEdit('Valor do depósito (R$):',x.amount);if(amount===null)return;const note=askEdit('Descrição:',x.note||'');if(note===null)return;const date=askEdit('Data (AAAA-MM-DD):',x.date);if(date===null)return;if(!goals.some(g=>g.id===goal)||!validMoney(amount)||(date&&!/^\\d{4}-\\d{2}-\\d{2}$/.test(date))){toast('Dados inválidos. Nada foi alterado.');return}Object.assign(x,{goalId:goal,amount:Number(amount),note,date});saveGoals();renderGoals();toast('Depósito atualizado!')}
});


const BACKUP_KEYS=['meuControleFin_v1','meuControleFin_cards_v1','meuControleFin_cardPurchases_v1','meuControleFin_budgets_v1','meuControleFin_recurring_v1','meuControleFin_goals_v1','meuControleFin_goalDeposits_v1','meuControleFin_theme'];
function makeBackup(){
 const payload={};BACKUP_KEYS.forEach(key=>{const raw=localStorage.getItem(key);if(raw===null){payload[key]=key==='meuControleFin_theme'?'light':[];}else{payload[key]=JSON.parse(raw)}});
 return {app:'Meu Controle Financeiro',formatVersion:1,exportedAt:new Date().toISOString(),data:payload};
}
$('backupExport').addEventListener('click',()=>{
 try{
  const backup=makeBackup(),blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
  a.download='meu-controle-financeiro-backup-'+today()+'.json';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup completo baixado. Guarde esse arquivo em local seguro.');
 }catch(err){toast('Não foi possível criar o backup. Verifique o espaço disponível no aparelho.')}
});
$('backupImportButton').addEventListener('click',()=>$('backupFile').click());
$('backupFile').addEventListener('change',async e=>{
 const file=e.target.files&&e.target.files[0];if(!file)return;
 try{
  if(file.size>10*1024*1024)throw new Error('O arquivo é muito grande.');
  const backup=JSON.parse(await file.text()),payload=backup&&backup.data;
  if(!backup||backup.app!=='Meu Controle Financeiro'||backup.formatVersion!==1||!payload)throw new Error('Este arquivo não é um backup válido do aplicativo.');
  for(const key of BACKUP_KEYS){
   if(!Object.prototype.hasOwnProperty.call(payload,key))throw new Error('O backup está incompleto. Nenhum dado foi alterado.');
   if(key==='meuControleFin_theme'){if(!['light','dark'].includes(payload[key]))throw new Error('Tema inválido no backup.');}
   else if(!Array.isArray(payload[key])||payload[key].some(item=>!item||typeof item!=='object'||Array.isArray(item)))throw new Error('Há dados inválidos no backup. Nenhum dado foi alterado.');
  }
  if(!confirm('Restaurar este backup? Os dados atuais deste aplicativo serão substituídos pelos dados do arquivo. Recomendamos baixar um backup atual antes de continuar.'))return;
  const previous={};BACKUP_KEYS.forEach(key=>previous[key]=localStorage.getItem(key));
  try{BACKUP_KEYS.forEach(key=>localStorage.setItem(key,JSON.stringify(payload[key])));}
  catch(saveError){BACKUP_KEYS.forEach(key=>{if(previous[key]===null)localStorage.removeItem(key);else localStorage.setItem(key,previous[key]);});throw new Error('Não foi possível restaurar. Seus dados anteriores foram mantidos.');}
  data=payload.meuControleFin_v1;cards=payload.meuControleFin_cards_v1;cardPurchases=payload.meuControleFin_cardPurchases_v1;
  budgets=payload.meuControleFin_budgets_v1;recurringBills=payload.meuControleFin_recurring_v1;
  goals=payload.meuControleFin_goals_v1;goalDeposits=payload.meuControleFin_goalDeposits_v1;
  applyTheme(payload.meuControleFin_theme);render();renderCards();renderBudgets();renderRecurring();renderGoals();renderReports();
  toast('Backup restaurado com sucesso!');
 }catch(err){toast(err.message||'Não foi possível ler esse backup.');}
 finally{e.target.value='';}
});

if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();