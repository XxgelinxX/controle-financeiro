(()=>{
const $=id=>document.getElementById(id), money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let data=[];try{data=JSON.parse(localStorage.getItem('meuControleFin_v1')||'[]');if(!Array.isArray(data))data=[]}catch(e){data=[]}
let type='income',filter='all',hidden=false;
const applyTheme=theme=>{document.body.dataset.theme=theme;$('themeToggle').textContent=theme==='dark'?'☀️ Claro':'🌙 Escuro';$('themeToggle').setAttribute('aria-label',theme==='dark'?'Ativar modo claro':'Ativar modo escuro');document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#111a16':'#193f32'};
let savedTheme='light';try{savedTheme=localStorage.getItem('meuControleFin_theme')||'light'}catch(e){}
applyTheme(savedTheme==='dark'?'dark':'light');
$('themeToggle').addEventListener('click',()=>{const next=document.body.dataset.theme==='dark'?'light':'dark';applyTheme(next);try{localStorage.setItem('meuControleFin_theme',next)}catch(e){}});
const save=()=>{try{localStorage.setItem('meuControleFin_v1',JSON.stringify(data))}catch(e){toast('Não foi possível salvar neste aparelho.')}};
const toast=t=>$('toast').textContent=t, isMonth=d=>d.slice(0,7)===today().slice(0,7);
const total=(k,a=data)=>a.filter(x=>x.type===k).reduce((s,x)=>s+x.amount,0);
const sorted=a=>a.slice().sort((x,y)=>y.date.localeCompare(x.date)||y.id-x.id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function row(x){return `<div class="tx"><div class="dot">${x.type==='income'?'↗':'↙'}</div><div class="txmain"><strong>${esc(x.description)}</strong><small>${esc(x.category)} · ${x.date.split('-').reverse().join('/')}</small></div><div><div class="txval" style="color:${x.type==='income'?'#26956a':'#c75e5e'}">${x.type==='income'?'+':'−'} ${money(x.amount)}</div><button class="del" data-delete="${x.id}">Excluir</button></div></div>`}
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
function page(p){document.querySelectorAll('.page').forEach(s=>s.classList.toggle('active',s.id===p));document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.page===p));render();if(p==='add')$('date').value=today();window.scrollTo(0,0)}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.page)));
function setType(t){type=t;$('incomeType').className='btn '+(t==='income'?'primary':'soft');$('expenseType').className='btn '+(t==='expense'?'primary':'soft');let opts=t==='income'?['Salário','Renda extra','Investimentos','Outros']:['Moradia','Alimentação','Transporte','Saúde','Lazer','Compras','Contas','Cartão de crédito','Outros'];$('category').innerHTML=opts.map(x=>`<option>${x}</option>`).join('')}
$('incomeType').onclick=()=>setType('income');$('expenseType').onclick=()=>setType('expense');
$('txForm').addEventListener('submit',e=>{e.preventDefault();let amount=Number($('amount').value);if(!Number.isFinite(amount)||amount<=0){toast('Informe um valor válido.');return}data.push({id:Date.now()+Math.random(),type,amount,description:$('description').value.trim(),category:$('category').value,date:$('date').value});save();e.target.reset();$('date').value=today();toast('Movimentação salva!');page('dashboard')});
document.addEventListener('click',e=>{let b=e.target.closest('[data-delete]');if(b){data=data.filter(x=>String(x.id)!==b.dataset.delete);save();render();toast('Movimentação excluída.')}let f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.className='btn '+(x===f?'primary':'soft'));render()}});
$('filterText').addEventListener('input',render);$('toggleBalance').onclick=()=>{hidden=!hidden;$('toggleBalance').textContent=hidden?'⊘':'◉';render()};
$('export').onclick=()=>{let csv='Tipo;Descricao;Categoria;Valor;Data\n'+data.map(x=>[x.type==='income'?'Receita':'Despesa',x.description,x.category,x.amount,x.date].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\n');let a=document.createElement('a'),u=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));a.href=u;a.download='meu-controle-financeiro.csv';a.click();URL.revokeObjectURL(u);toast('Arquivo exportado.')};
$('date').value=today();setType('income');render();
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();