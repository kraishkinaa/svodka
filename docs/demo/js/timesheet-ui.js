/* «Сводка» — интерфейс табеля. Вынесено из index.html на Этапе 3 без изменения логики. */
(function(){
const R=document.getElementById("tsv");if(!R)return;
const blockRo=()=>{if(!(window.SVODKA_LICENSE&&window.SVODKA_LICENSE.readonly()))return false;if(window.SVODKA_UI)window.SVODKA_UI.toast("Подписка закончилась: изменения табеля недоступны. Доступны просмотр и экспорт.","bad");return true};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tsShort=s=>{const p=String(s).trim().split(/\s+/);return p[0]+(p.length>1?" "+p.slice(1).map(x=>x[0].toUpperCase()+".").join(" "):"")};
const KC={"Я":"k-ya","Б":"k-b","Пр":"k-pr","О":"k-o","В":"k-v","РВ":"k-rv","К":"k-k"},MRE=/^(Я|Б|Пр|О|В|РВ|К)(:\d{1,2}(\.\d{1,2})?)?$/;
const SCH={"5/2":"5/2","2/2":"2/2","1/3":"1/3"};
const ACC={"month":"Месяц","quarter":"Квартал","year":"Год"};
const r1=n=>Math.round(n*10)/10,sg=n=>(n>0?"+":n<0?"−":"")+String(Math.abs(r1(n))).replace(".",",");
const dim=(y,mo)=>new Date(y,mo,0).getDate(),dow=(y,mo,d)=>new Date(y,mo-1,d).getDay();
const norm=s=>String(s).toLowerCase().replace(/ё/g,"е").replace(/\s+/g," ").trim();
const ints=(v,n)=>[...new Set((Array.isArray(v)?v:[]).map(Number).filter(x=>Number.isInteger(x)&&x>=1&&x<=n))];
const cleanDB=x=>{const o={emps:[],months:Object.create(null)},ids=new Set();
 (Array.isArray(x.emps)?x.emps:[]).slice(0,5000).forEach(e=>{if(e&&/^(?!__proto__$|constructor$|prototype$)[\w-]{1,40}$/.test(e.id)&&!ids.has(e.id)){ids.add(e.id);o.emps.push({id:e.id,name:String(e.name||"").slice(0,120),tab:String(e.tab||"").slice(0,40),dep:String(e.dep||"").slice(0,120),pos:String(e.pos||"").slice(0,120),sched:SCH[e.sched]||"5/2",email:String(e.email||"").slice(0,120),acct:ACC[e.acct]?e.acct:"month"})}});
 Object.keys(x.months||{}).forEach(k=>{if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(k))return;const m=x.months[k]||{},mk=Object.create(null);
  Object.keys(m.marks||{}).forEach(id=>{if(!ids.has(id))return;const src=m.marks[id]||{},t=Object.create(null);Object.keys(src).forEach(d=>{if(/^\d{1,2}$/.test(d)&&+d>=1&&+d<=31&&MRE.test(src[d]))t[d]=src[d]});mk[id]=t});
  o.months[k]={norm:isFinite(m.norm)&&m.norm>=1&&m.norm<=24?+m.norm:8,hol:ints(m.hol,31),short:ints(m.short,31),extra:ints(m.extra,31),marks:mk}});
 return o};
let DB={emps:[],months:Object.create(null)};try{const x=JSON.parse(localStorage.getItem("svodka_ts"));if(x&&typeof x=="object")DB=cleanDB(x)}catch(e){}
let timer=null;const setSaveState=(t,ok)=>{const el=document.getElementById("ts-save-state");if(el){el.textContent=t;el.classList.toggle("ok",!!ok)}};
const save=()=>{if(window.SVODKA_REDRAW)try{window.SVODKA_REDRAW()}catch(e){}if(timer)return;timer=setTimeout(()=>{timer=null;try{localStorage.setItem("svodka_ts",JSON.stringify(DB));setSaveState("Автосохранение: "+new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}),true)}catch(e){setSaveState("Не удалось сохранить табель",false)}},300)};
const saveNow=()=>{try{localStorage.setItem("svodka_ts",JSON.stringify(DB));setSaveState("Сохранено в "+new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}),true);if(window.SVODKA_REDRAW)try{window.SVODKA_REDRAW()}catch(e){}return true}catch(e){setSaveState("Ошибка сохранения",false);return false}};
const now=new Date(),PLAN_YEAR=2027;let cur=(now.getFullYear()<PLAN_YEAR?PLAN_YEAR+"-01":now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")),tool="Я",painting=false;
const MD=k=>DB.months[k]||(DB.months[k]={norm:8,hol:[],short:[],extra:[],marks:Object.create(null)});
const schedOf=e=>SCH[e&&e.sched]||"5/2";
const dayIdx=(y,mo,d)=>Math.floor(Date.UTC(y,mo-1,d)/864e5);
const isOffSched=(sched,y,mo,d)=>{const m=((dayIdx(y,mo,d)%4)+4)%4;return sched=="2/2"?m>=2:sched=="1/3"?m!==0:false};
const isOffCal=(M,y,mo,d)=>{const w=dow(y,mo,d);if(M.extra.includes(d))return false;return w==0||w==6||M.hol.includes(d)};
const isOffEmp=(e,M,y,mo,d)=>{const s=schedOf(e);return s=="5/2"?isOffCal(M,y,mo,d):isOffSched(s,y,mo,d)};
const isOff=(M,y,mo,d)=>isOffCal(M,y,mo,d);
const dayNormEmp=(e,M,y,mo,d)=>isOffEmp(e,M,y,mo,d)?0:(M.short.includes(d)?Math.max(0,M.norm-1):M.norm);
const dayNorm=(M,y,mo,d)=>isOffCal(M,y,mo,d)?0:(M.short.includes(d)?Math.max(0,M.norm-1):M.norm);
const parseMark=s=>{if(!s)return null;const[c,h]=String(s).split(":");return{c,h:h===undefined?null:+h}};
const calcEmp=(M,y,mo,id)=>{const e=DB.emps.find(x=>x.id==id)||{sched:"5/2"},n=dim(y,mo),mk=M.marks[id]||{};let w=0,hrs=0,ot=0,b=0,pr=0,o=0,v=0,rv=0,rvh=0,k=0,plan=0,blank=0,pd=0;
 for(let d=1;d<=n;d++){const dn=dayNormEmp(e,M,y,mo,d),p=parseMark(mk[d]),c=p&&(p.c=="Я"&&dn==0?"РВ":p.c);if(dn>0)pd++;
  if(c!="Б"&&c!="О"&&dn>0)plan+=dn;
  if(!c){if(dn>0)blank++;continue}
  if(c=="Я"){const h=p.h==null?dn:p.h;w++;hrs+=h;if(dn>0)ot+=Math.max(0,h-dn);else{rv++;rvh+=h}}
  else if(c=="РВ"){const h=p.h==null?(dn||M.norm):p.h;w++;rv++;rvh+=h;hrs+=h}
  else if(c=="К"){const h=p.h==null?(dn||M.norm):p.h;w++;k++;hrs+=h;if(dn>0)ot+=Math.max(0,h-dn);else ot+=h}
  else if(c=="В"){v++;if(p.h!=null)hrs+=p.h}
  else if(c=="Б"){b++;if(p.h!=null)hrs+=p.h}
  else if(c=="Пр"){pr++;if(p.h!=null)hrs+=p.h}
  else if(c=="О"){o++;if(p.h!=null)hrs+=p.h}}
 return{w,hrs:r1(hrs),plan:r1(plan),diff:r1(hrs-plan),ot:r1(ot),b,pr,o,v,rv,rvh:r1(rvh),k,pd,blank}};
const acctKind=e=>ACC[e&&e.acct]?e.acct:"month";
const periodMonths=(y,mo,kind)=>{if(kind=="quarter"){const q=Math.floor((mo-1)/3);return[1,2,3].map(i=>({y,mo:q*3+i}))}if(kind=="year")return Array.from({length:12},(_,i)=>({y,mo:i+1}));return[{y,mo}]};
const calcPeriod=(id,y,mo,kind)=>{const e=DB.emps.find(x=>x.id==id)||{sched:"5/2"};kind=acctKind({acct:kind||e.acct});const ms=periodMonths(y,mo,kind);let hrs=0,norm=0,rvh=0,rv=0,k=0,o=0,b=0,pr=0,blank=0,pd=0,ot=0;
 ms.forEach(q=>{const M=MD(q.y+"-"+String(q.mo).padStart(2,"0")),mk=M.marks[id]||{},n=dim(q.y,q.mo);
  for(let d=1;d<=n;d++){const dn=dayNormEmp(e,M,q.y,q.mo,d),p=parseMark(mk[d]),c=p&&(p.c=="Я"&&dn==0?"РВ":p.c);if(dn>0){pd++;if(c!="О"&&c!="Б")norm+=dn}
   if(!c){if(dn>0)blank++;continue}
   if(c=="Я"||c=="К"){const h=p.h==null?(dn||M.norm):p.h;hrs+=h;if(dn>0)ot+=Math.max(0,h-dn);else if(c=="К")ot+=h}
   else if(c=="РВ"){const h=p.h==null?(dn||M.norm):p.h;hrs+=h;rvh+=h;rv++}
   else if(c=="О"){o++;if(p.h!=null)hrs+=p.h}
   else if(c=="Б"){b++;if(p.h!=null)hrs+=p.h}
   else if(c=="Пр"){pr++;if(p.h!=null)hrs+=p.h}
   else if(c=="В"&&p.h!=null)hrs+=p.h;if(c=="К")k++}});
 ot=r1(ot);
 return{kind,months:ms.length,label:ms.length==1?ms[0].y+"-"+String(ms[0].mo).padStart(2,"0"):ms.length==3?ms[0].y+" Q"+(Math.floor((ms[0].mo-1)/3)+1):ms[0].y+" год",hrs:r1(hrs),norm:r1(norm),rvh:r1(rvh),rv,ot,k,o,b,pr,blank,pd}};
const workDays=(M,y,mo,sched)=>{let k=0;for(let d=1;d<=dim(y,mo);d++){const off=sched&&sched!="5/2"?isOffSched(sched,y,mo,d):isOffCal(M,y,mo,d);if(!off)k++}return k};
const deptAgg=(M,y,mo,emps,minN)=>{const g=Object.create(null),cnt=Object.create(null);
 emps.forEach(e=>{const d=e.dep||"Без подразделения";cnt[d]=(cnt[d]||0)+1});
 emps.forEach(e=>{let d=e.dep||"Без подразделения";if(minN&&cnt[d]<minN)d="Малые подразделения (меньше "+minN+" человек)";const c=calcEmp(M,y,mo,e.id),o=g[d]||(g[d]={d,n:0,pd:0,w:0,hrs:0,ot:0,b:0,pr:0,o:0,v:0,rv:0,rvh:0,k:0});o.n++;o.pd+=c.pd;o.w+=c.w;o.hrs+=c.hrs;o.ot+=c.ot;o.b+=c.b;o.pr+=c.pr;o.o+=c.o;o.v+=c.v;o.rv+=c.rv;o.rvh+=c.rvh;o.k+=c.k});
 return Object.values(g).sort((a,b)=>b.n-a.n)};
const deptMin=()=>DB.emps.length>=80?5:0;
const ym=()=>{const[y,m]=cur.split("-").map(Number);return[y,m]};
const visible=()=>{const f=$("#ts-fd").value,q=$("#ts-q").value.trim().toLowerCase();return DB.emps.filter(e=>(!f||e.dep===f)&&(!q||e.name.toLowerCase().includes(q)||e.tab.toLowerCase().includes(q)))};
let TS_DEPS=[];
const refreshDeps=()=>{const s=new Set();DB.emps.forEach(e=>{if(e.dep)s.add(e.dep)});try{(window.SVODKA_EMPS?window.SVODKA_EMPS():[]).forEach(x=>{if(x.dep)s.add(x.dep)})}catch(e){}TS_DEPS=[...s].sort((a,b)=>a.localeCompare(b,"ru"))};
const TSV={per:20,page:Object.create(null)};
try{const x=JSON.parse(localStorage.getItem("svodka_ts_view"));if(x&&[0,10,20,50,100].includes(+x.per))TSV.per=+x.per}catch(e){}
const pageOf=(key,total)=>{const per=TSV.per||Math.max(1,total),pages=Math.max(1,Math.ceil(total/per));const p=Math.max(0,Math.min(TSV.page[key]||0,pages-1));TSV.page[key]=p;return{p,pages}};
const pageSlice=(key,arr)=>{const{p}=pageOf(key,arr.length);return TSV.per?arr.slice(p*TSV.per,(p+1)*TSV.per):arr};
const pagerHtml=(key,total)=>{const{p,pages}=pageOf(key,total),from=total?(TSV.per?p*TSV.per+1:1):0,to=TSV.per?Math.min(total,(p+1)*TSV.per):total;
 return `<div class="tpager" data-pg="${key}"><label>Строк на странице <select data-pgsize aria-label="Строк на странице">${[10,20,50,100].map(n=>`<option value="${n}"${TSV.per===n?" selected":""}>${n}</option>`).join("")}<option value="0"${TSV.per?"":" selected"}>все</option></select></label><span>${total?from+"–"+to+" из "+total:"нет строк"}</span><button type="button" data-pgprev aria-label="Предыдущая страница"${p<=0?" disabled":""}>‹</button><span class="tpg-pg">${p+1} / ${pages}</span><button type="button" data-pgnext aria-label="Следующая страница"${p>=pages-1?" disabled":""}>›</button></div>`};
R.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-pg] button");if(!b)return;const key=b.closest("[data-pg]").dataset.pg;TSV.page[key]=(TSV.page[key]||0)+(b.hasAttribute("data-pgnext")?1:-1);render()});
R.addEventListener("change",e=>{const s=e.target.closest&&e.target.closest("[data-pgsize]");if(!s)return;TSV.per=+s.value||0;TSV.page=Object.create(null);try{localStorage.setItem("svodka_ts_view",JSON.stringify({per:TSV.per}))}catch(x){}render()});
const cellHtml=(M,y,mo,e,d)=>{const p=parseMark((M.marks[e.id]||{})[d]),off=isOffEmp(e,M,y,mo,d),dn=dayNormEmp(e,M,y,mo,d),hh=p?p.h:null,h=p&&p.c=="Я"?(hh==null?dn:hh):p&&p.c=="РВ"?(hh==null?(dn||M.norm):hh):hh;
 return `<td tabindex="0" class="tc${off?" off":""}${p&&KC[p.c]?" "+KC[p.c]:""}" data-e="${e.id}" data-d="${d}" title="День ${d}: норма ${dn} ч. Двойной щелчок — изменить часы">${p?esc(p.c)+(p.c!="В"&&h!=null&&h>0?`<i>${String(r1(h)).replace(".",",")}</i>`:""):""}</td>`};
const rowHtml=(M,y,mo,e)=>{const c=calcEmp(M,y,mo,e.id),sc=schedOf(e),offTot=dim(y,mo)-workDays(M,y,mo,sc),lab=offTot?c.rv/offTot:0,sick=c.b/dim(y,mo),flag=lab>0.5?" bad-rv":sick>0.3?" bad-b":"",why="Работа в выходные: "+c.rv+" из "+offTot+" ("+Math.round(lab*100)+"%). Больничные: "+c.b+" дн. ("+Math.round(sick*100)+"%).";let s=`<tr data-r="${e.id}" class="${flag.trim()}"><th class="tnm" title="${esc(why)}"><button class="tx" data-del="${e.id}" aria-label="Удалить сотрудника">✕</button>${esc(tsShort(e.name))}<small>${esc(e.tab)}${e.pos?" · "+esc(e.pos):""}</small><select class="tsched" data-sched="${e.id}" aria-label="График сотрудника">${Object.keys(SCH).map(x=>`<option value="${x}"${x==sc?" selected":""}>${x}</option>`).join("")}</select></th><td class="tdp"><select data-dep-ts="${e.id}" aria-label="Подразделение сотрудника">${["",...TS_DEPS].map(d=>`<option value="${esc(d)}"${d===(e.dep||"")?" selected":""}>${d?esc(d):"Без подразделения"}</option>`).join("")}</select></td>`;
 for(let d=1;d<=dim(y,mo);d++)s+=cellHtml(M,y,mo,e,d);
 return s+`<td class="tt">${c.w}</td><td class="tt">${String(c.hrs).replace(".",",")}</td><td class="tt">${String(c.plan).replace(".",",")}</td><td class="tt${c.diff<0?" neg":""}">${sg(c.diff)}</td><td class="tt">${String(c.ot).replace(".",",")}</td><td class="tt">${c.b}</td><td class="tt">${c.pr}</td><td class="tt">${c.o}</td><td class="tt">${c.v}</td><td class="tt">${c.rv}</td><td class="tt">${c.k}</td></tr>`};
const WDN=["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
const TCOL={sm:[["dep","Подразделение"],["n","Человек"],["w","Дней явки"],["hrs","Часы"],["ot","Сверхурочные, ч"],["b","Больничные, дн."],["bp","Больничные, %"],["pr","Прогулы, дн."],["prp","Прогулы, %"],["o","Отпуск, дн."],["v","Выходные, дн."],["rv","Раб. вых., дн."],["rvh","Раб. вых., ч"],["k","Командировки, дн."]],
 sum:[["name","Сотрудник"],["dep","Подразделение"],["pos","Должность"],["acct","Учётный период"],["label","Период расчёта"],["hrs","Часы"],["norm","Норма"],["rvh","Работа в вых., ч"],["ot","Сверхурочные, ч"],["k","Командировки, дн."]]};
const TCHIDE=t=>{try{const o=JSON.parse(localStorage.getItem("svodka_ts_cols"))||{};return Array.isArray(o[t])?o[t]:[]}catch(e){return[]}};
const tcolsOf=t=>TCOL[t].filter(c=>!TCHIDE(t).includes(c[0]));
const tcolsSet=(t,hidden)=>{try{const o=JSON.parse(localStorage.getItem("svodka_ts_cols"))||{};o[t]=hidden;localStorage.setItem("svodka_ts_cols",JSON.stringify(o))}catch(e){}};
const colsBtn=t=>`<button type="button" data-cols="${t}" class="tcols-btn">Столбцы: ${tcolsOf(t).length} из ${TCOL[t].length}</button>`;
const colsDialog=t=>{const hid=TCHIDE(t);
 window.SVODKA_UI.openModal("Столбцы таблицы",`<div class="mf"><p class="mail-hint">Отметьте столбцы, которые нужно показывать. Настройка хранится на этом компьютере. Выгрузка в Excel содержит все столбцы.</p><div class="cols-grid">${TCOL[t].map(c=>`<label class="col-item"><input type="checkbox" data-colk="${c[0]}"${hid.includes(c[0])?"":" checked"}> ${esc(c[1])}</label>`).join("")}</div><div class="mrow end"><button type="button" data-colall="1">Показать все</button><button type="button" class="p" data-colclose="1">Готово</button></div></div>`);
 const mb=document.getElementById("modal-body");
 if(!mb)return;
 mb.onchange=e=>{const c=e.target.closest&&e.target.closest("[data-colk]");if(!c)return;const h=TCHIDE(t).filter(x=>x!=c.dataset.colk);if(!c.checked)h.push(c.dataset.colk);tcolsSet(t,h);renderSummary()};
 mb.onclick=e=>{if(e.target.closest&&e.target.closest("[data-colall]")){tcolsSet(t,[]);renderSummary();colsDialog(t);return}if(e.target.closest&&e.target.closest("[data-colclose]"))window.SVODKA_UI.closeModal()};
};
R.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-cols]");if(b)colsDialog(b.dataset.cols)});
const renderSummary=()=>{const[y,mo]=ym(),M=MD(cur),a=deptAgg(M,y,mo,visible(),0);
 const num=x=>String(r1(x)).replace(".",",");
 const cs=tcolsOf("sm");
 const pc=(o,k)=>{switch(k){case"dep":return esc(o.d);case"n":return o.n;case"w":return o.w;case"hrs":return num(o.hrs);case"ot":return num(o.ot);case"b":return o.b;case"bp":return (o.pd?(o.b/o.pd*100).toFixed(1):"0")+"%";case"pr":return o.pr;case"prp":return (o.pd?(o.pr/o.pd*100).toFixed(1):"0")+"%";case"o":return o.o;case"v":return o.v;case"rv":return o.rv;case"rvh":return num(o.rvh);case"k":return o.k}return ""};
 $("#ts-sm-pg").innerHTML=colsBtn("sm");
 const sumK=k=>a.reduce((s,o)=>s+(+o[k]||0),0);
 const totCell=k=>{if(k==="dep")return "Итого";if(["n","w","hrs","ot","b","pr","o","v","rv","rvh","k"].includes(k))return num(sumK(k));if(k==="bp"||k==="prp"){const pd=sumK("pd"),v=k==="bp"?sumK("b"):sumK("pr");return (pd?(v/pd*100).toFixed(1):"0")+"%"}return ""};
 const body=a.map(o=>`<tr>${cs.map(c=>`<td>${pc(o,c[0])}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="${cs.length||1}">Добавьте сотрудников</td></tr>`;
 const tot=a.length?`<tr class="ttot">${cs.map(c=>`<td>${totCell(c[0])}</td>`).join("")}</tr>`:"";
 $("#ts-sm").innerHTML=`<thead><tr>${cs.map(c=>`<th>${c[1]}</th>`).join("")}</tr></thead><tbody>${body}${tot}</tbody>`;
 const sum=$("#ts-sum");if(!sum)return;
 const list=visible().filter(e=>schedOf(e)!="5/2"),shownS=pageSlice("sum",list);
 $("#ts-sum-pg").innerHTML=pagerHtml("sum",list.length)+colsBtn("sum");
 const cu=tcolsOf("sum");
 const cells=e=>{const q=calcPeriod(e.id,y,mo,acctKind(e));return cu.map(c=>{const k=c[0];let v="";switch(k){case"name":v=`${esc(tsShort(e.name))}<small>${esc(e.tab)}</small>`;break;case"dep":v=esc(e.dep);break;case"pos":v=esc(e.pos||"—");break;case"acct":v=`<select class="tsched" data-acct="${e.id}" aria-label="Учётный период">${Object.keys(ACC).map(x=>`<option value="${x}"${x==acctKind(e)?" selected":""}>${ACC[x]}</option>`).join("")}</select>`;break;case"label":v=q.label;break;case"hrs":v=num(q.hrs);break;case"norm":v=num(q.norm);break;case"rvh":v=num(q.rvh);break;case"ot":v=num(q.ot);break;case"k":v=q.k;break}return `<td${k=="name"?' class="tnm"':""}>${v}</td>`}).join("")};
 sum.innerHTML=`<thead><tr>${cu.map(c=>`<th>${c[1]}</th>`).join("")}</tr></thead><tbody>${shownS.map(e=>`<tr>${cells(e)}</tr>`).join("")||`<tr><td colspan="${cu.length||1}">Нет сотрудников с графиком не 5/2.</td></tr>`}</tbody>`};
const render=()=>{const[y,mo]=ym(),M=MD(cur),n=dim(y,mo),list=visible();refreshDeps();
 $("#ts-mo").value=cur;$("#ts-nrm").value=M.norm;$("#ts-hol").value=M.hol.join(", ");$("#ts-sht").value=M.short.join(", ");$("#ts-ext").value=M.extra.join(", ");
 const deps=[...new Set(DB.emps.map(e=>e.dep).filter(Boolean))].sort(),fv=$("#ts-fd").value;
 $("#ts-fd").innerHTML='<option value="">Все</option>'+deps.map(d=>`<option value="${esc(d)}"${d===fv?" selected":""}>${esc(d)}</option>`).join("");
 const tb=document.querySelectorAll("#ts-tl [data-t]");tb.forEach&&tb.forEach(b=>b.classList.toggle("on",b.dataset.t===tool));
 let h=`<thead><tr><th class="tnm">Сотрудник</th><th>Подразд.</th>`;for(let d=1;d<=n;d++)h+=`<th class="${isOffCal(M,y,mo,d)?"we":""}">${d}<br>${WDN[dow(y,mo,d)]}</th>`;
 h+=`<th>Явка, дн.</th><th>Часы</th><th>Норма</th><th>±</th><th>Сверх.</th><th>Б</th><th>Пр</th><th>О</th><th>Вых., дн.</th><th>Раб. вых., дн.</th><th>Команд., дн.</th></tr></thead><tbody>`;
 const shown=pageSlice("main",list),pgHtml=pagerHtml("main",list.length);$("#ts-pg").innerHTML=pgHtml;$("#ts-pg2").innerHTML=pgHtml;$("#ts-tb").innerHTML=h+(list.length?shown.map(e=>rowHtml(M,y,mo,e)).join(""):`<tr><td class="tempty" colspan="${n+13}">${DB.emps.length?"Нет сотрудников по фильтру":"Список пуст. Нажмите «Сотрудники из загруженных данных» (после загрузки файлов на вкладке «Подключения»), «Импорт списка из Excel» или «Добавить сотрудника»."}</td></tr>`)+"</tbody>";
 const bl=list.reduce((s,e)=>s+calcEmp(M,y,mo,e.id).blank,0);
 $("#ts-wr").textContent=list.length&&bl?`Не заполнено рабочих дней: ${bl}`:"";
 $("#ts-nt").textContent=`Рабочих дней по календарю 5/2: ${workDays(M,y,mo)}. Праздники: ${M.hol.length?M.hol.join(", "):"нет"}. Сокращённые дни: ${M.short.length?M.short.join(", "):"нет"}. Рабочие выходные: ${M.extra.length?M.extra.join(", "):"нет"}.`;
 $("#ts-calnote").textContent=M.hol.length||M.extra.length?`Календарь: ${M.hol.length} праздн., ${M.extra.length} раб. вых.`:"Календарь не загружен: используются только суббота и воскресенье.";
 renderSummary()};
const setMark=(id,d,code,hrs)=>{if(blockRo())return;const M=MD(cur),mk=M.marks[id]||(M.marks[id]=Object.create(null));if(!code)delete mk[d];else mk[d]=code+(hrs!=null&&hrs>0?":"+hrs:"")};
const refreshRow=id=>{const[y,mo]=ym(),e=DB.emps.find(x=>x.id==id),tr=document.querySelector('tr[data-r="'+id+'"]');if(e&&tr)tr.outerHTML=rowHtml(MD(cur),y,mo,e)};
const fixCode=(id,d,code)=>{if(code!="Я")return code;const emp=DB.emps.find(x=>x.id==id);if(!emp)return code;const[y,mo]=ym();return dayNormEmp(emp,MD(cur),y,mo,d)==0?"РВ":code};
const hrsVal=()=>{const v=parseFloat(($("#ts-hrs").value||"").replace(",","."));return isFinite(v)&&v>0?v:null};
const paint=(id,d,toggle)=>{if(blockRo())return;const old=(MD(cur).marks[id]||{})[d],hrs=hrsVal();let code=fixCode(id,d,tool);
 if(toggle&&old&&parseMark(old).c===code&&hrs==null)code="";
 let h=null;if(code){if(hrs!=null)h=hrs;else if(old&&parseMark(old).c===code)h=parseMark(old).h}
 setMark(id,d,code,h);refreshRow(id);save()};
const cellOf=t=>t&&t.closest?t.closest("td[data-e]"):null;
$("#ts-tb").addEventListener("mousedown",e=>{if(e.button||e.detail>1)return;const c=cellOf(e.target);if(!c)return;painting=true;paint(c.dataset.e,+c.dataset.d,true)});
$("#ts-tb").addEventListener("mouseover",e=>{if(!painting)return;const c=cellOf(e.target);if(c)paint(c.dataset.e,+c.dataset.d,false)});
$("#ts-tb").addEventListener("contextmenu",e=>{const c=cellOf(e.target);if(!c)return;e.preventDefault();setMark(c.dataset.e,+c.dataset.d,"");refreshRow(c.dataset.e);save()});
$("#ts-tb").addEventListener("dblclick",e=>{const c=cellOf(e.target);if(!c)return;e.preventDefault();const[y,mo]=ym(),emp=DB.emps.find(x=>x.id==c.dataset.e);if(!emp)return;const d=+c.dataset.d,old=parseMark((MD(cur).marks[emp.id]||{})[d]),dn=dayNormEmp(emp,MD(cur),y,mo,d),curH=old?(old.h==null?(old.c=="Я"?dn:old.c=="РВ"?(dn||MD(cur).norm):0):old.h):dn;
 const v=prompt("Часы для отметки «"+(old?old.c:"—")+"» "+d+". Календарь: "+dn+" ч. Пусто или 0 — без часов.",String(curH||""));
 if(v==null)return;const n=parseFloat(String(v).replace(",","."));setMark(emp.id,d,old?old.c:"Я",isFinite(n)&&n>0?n:null);refreshRow(emp.id);save();renderSummary()});
$("#ts-tb").addEventListener("keydown",e=>{const c=cellOf(e.target);if(!c)return;const k={"я":"Я","б":"Б","п":"Пр","о":"О","в":"В","р":"РВ","Р":"РВ","Delete":"","Backspace":""},key=e.key.length==1?e.key.toLowerCase():e.key;if(!(key in k))return;e.preventDefault();const id=c.dataset.e,d=c.dataset.d;setMark(id,+d,fixCode(id,+d,k[key]),hrsVal());refreshRow(id);save();const nx=document.querySelector('td[data-e="'+id+'"][data-d="'+d+'"]');if(nx&&nx.focus)nx.focus();renderSummary()});
$("#ts-tb").addEventListener("change",e=>{const d=e.target.closest&&e.target.closest("select[data-dep-ts]");if(d){const emp=DB.emps.find(x=>x.id==d.dataset.depTs);if(emp){emp.dep=d.value;save();render();setSaveState("Подразделение обновлено",true)}return}const s=e.target.closest&&e.target.closest("select[data-sched]");if(!s)return;const emp=DB.emps.find(x=>x.id==s.dataset.sched);if(!emp)return;emp.sched=SCH[s.value]||"5/2";save();render()});
$("#ts-tb").addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-del]");if(!b)return;const e2=DB.emps.find(x=>x.id==b.dataset.del);if(e2&&confirm("Удалить сотрудника «"+e2.name+"» и все его отметки?")){DB.emps=DB.emps.filter(x=>x.id!=e2.id);Object.keys(DB.months).forEach(k=>delete DB.months[k].marks[e2.id]);save();render()}});
document.addEventListener("mouseup",()=>{if(painting){painting=false;renderSummary()}});
$("#ts-tl").addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-t]");if(b){tool=b.dataset.t;render()}});
$("#ts-mo").onchange=e=>{if(/^\d{4}-\d{2}$/.test(e.target.value)){cur=e.target.value;autoFillMonth(cur);const v=syncVacations(cur);render();save();if(v.days)setSaveState("Подставлены отпуска из графика: "+v.days+" дн.",true)}};
$("#ts-nrm").onchange=e=>{const v=+e.target.value;MD(cur).norm=v>=1&&v<=24?v:8;save();render()};
$("#ts-hol").onchange=e=>{const[y,mo]=ym();MD(cur).hol=ints(e.target.value.split(/[ ,;]+/).filter(Boolean),dim(y,mo));save();render()};
$("#ts-sht").onchange=e=>{const[y,mo]=ym();MD(cur).short=ints(e.target.value.split(/[ ,;]+/).filter(Boolean),dim(y,mo));save();render()};
$("#ts-ext").onchange=e=>{const[y,mo]=ym();MD(cur).extra=ints(e.target.value.split(/[ ,;]+/).filter(Boolean),dim(y,mo));save();render()};
$("#ts-cal").onclick=()=>{if(window.SVODKA_UI&&window.SVODKA_UI.openCalendar)window.SVODKA_UI.openCalendar();else setView("connect")};
$("#ts-fd").onchange=render;$("#ts-q").oninput=render;
$("#ts-fill").onclick=()=>{const[y,mo]=ym(),M=MD(cur),l=visible();if(!l.length||!confirm("Заполнить месяц по графикам сотрудников? Рабочие дни станут «Я», выходные — «В». Уже заполненные ячейки не изменятся."))return;let w=0,v=0;
 l.forEach(e=>{const mk=M.marks[e.id]||(M.marks[e.id]=Object.create(null));for(let d=1;d<=dim(y,mo);d++){if(mk[d])continue;if(isOffEmp(e,M,y,mo,d)){mk[d]="В";v++}else{mk[d]="Я";w++}}});save();render();alert("Заполнено: явка "+w+" дн., выходные "+v+" дн.")};
$("#ts-clr").onclick=()=>{const l=visible();if(!l.length||!confirm("Очистить все отметки месяца у "+l.length+" сотрудников?"))return;l.forEach(e=>{delete MD(cur).marks[e.id]});save();render()};
const newId=()=>"e"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fillEmpMonth=(e,key)=>{if(blockRo())return;const[y,mo]=key.split("-").map(Number),M=MD(key),n=dim(y,mo),mk=M.marks[e.id]||(M.marks[e.id]=Object.create(null));let w=0,v=0;
 for(let d=1;d<=n;d++){if(mk[d])continue;if(isOffEmp(e,M,y,mo,d)){mk[d]="В";v++}else{mk[d]="Я";w++}}return{w,v}};
const autoFillMonth=(key)=>{if(blockRo())return;const M=MD(key);let w=0,v=0;DB.emps.forEach(e=>{if(M.marks[e.id]&&Object.keys(M.marks[e.id]).length)return;const q=fillEmpMonth(e,key);w+=q.w;v+=q.v});return{w,v}};
const syncVacations=(key)=>{if(blockRo())return{days:0,emps:0,skipped:0};const f=window.SVODKA_VACS;if(!f)return{days:0,emps:0,skipped:0};let L=[];try{L=f()||[]}catch(e){}if(!L.length)return{days:0,emps:0,skipped:0};
 key=key||cur;const[y,mo]=key.split("-").map(Number),M=MD(key),n=dim(y,mo),byT=new Map(),byN=new Map();let days=0,emps=0,skipped=0;
 L.forEach(v=>{if(v.tab)byT.set(String(v.tab),v);if(v.name)byN.set(norm(v.name),v)});
 DB.emps.forEach(e=>{const v=(e.tab&&byT.get(e.tab))||byN.get(norm(e.name));if(!v||!Array.isArray(v.p))return;let any=false;
  v.p.forEach(p=>{const st=norm(String(p[2]||""));if(/перенес/.test(st)){skipped++;return}
   let s=p[0],t=p[1];if(p[3]instanceof Date&&p[4]instanceof Date){s=p[3];t=p[4]}
   if(!(s instanceof Date)||!(t instanceof Date)||isNaN(s)||isNaN(t))return;
   const s0=new Date(s.getFullYear(),s.getMonth(),s.getDate()).getTime(),t0=new Date(t.getFullYear(),t.getMonth(),t.getDate()).getTime();
   for(let d=1;d<=n;d++){const x=new Date(y,mo-1,d).getTime();if(x<s0||x>t0||dayNorm(M,y,mo,d)==0)continue;
    const mk=M.marks[e.id]||(M.marks[e.id]=Object.create(null)),old=mk[d]&&parseMark(mk[d]);
    if(!old||old.c=="Я"){if(mk[d]!="О"){mk[d]="О";days++;any=true}}}});
  if(any)emps++});
 if(days)save();return{days,emps,skipped}};
const addEmps=list=>{if(blockRo())return 0;const have=new Set(DB.emps.map(e=>e.tab?"t:"+e.tab:"n:"+norm(e.name)));let add=0;for(const x of list){if(DB.emps.length>=5000)break;const name=String(x.name||"").trim(),tab=String(x.tab||"").trim(),dep=String(x.dep||"").trim(),pos=String(x.pos||"").trim(),sched=SCH[x.sched]||"5/2",email=String(x.email||x.em||"").trim().slice(0,120),acct=ACC[x.acct]?x.acct:"month",srcKey=String(x.srcKey||"").slice(0,80);if(!name&&!tab)continue;const k=tab?"t:"+tab:"n:"+norm(name);if(have.has(k))continue;have.add(k);const emp={id:newId(),name:name.slice(0,120),tab:tab.slice(0,40),dep:dep.slice(0,120),pos:pos.slice(0,120),sched,email,acct,srcKey};DB.emps.push(emp);fillEmpMonth(emp,cur);add++}return add};
const syncStaffToTs=()=>{if(blockRo())return 0;if(LAST&&LAST[1]===DEMO)return 0;const f=window.SVODKA_EMPS;if(!f)return 0;let L=[];try{L=f()||[]}catch(e){return 0}
 const key=x=>String(x.srcKey||(x.tab?"t:"+x.tab:"n:"+norm(x.name||""))),byKey=new Map(L.map(x=>[key(x),x])),byName=new Map(L.map(x=>[norm(x.name||""),x])),match=e=>byKey.get(key(e))||byName.get(norm(e.name||""))||null;
 let changed=0;
 DB.emps=DB.emps.filter(e=>{if(match(e))return true;changed++;Object.keys(DB.months||{}).forEach(m=>{if(DB.months[m]&&DB.months[m].marks)delete DB.months[m].marks[e.id]});return false});
 DB.emps.forEach(e=>{const x=match(e);if(!x)return;const vals={name:x.name,tab:x.tab,dep:x.dep,pos:x.pos,email:x.email,acct:x.acct,srcKey:x.srcKey||key(x)};let diff=false;Object.keys(vals).forEach(k2=>{if(vals[k2]!==undefined&&e[k2]!==vals[k2]){e[k2]=vals[k2];diff=true}});if(diff)changed++});
 const missing=L.filter(x=>!DB.emps.some(e=>key(e)===key(x)));
 if(missing.length)changed+=addEmps(missing);
 if(changed)saveNow();
 return changed;
};
window.SVODKA_TS_SYNC=syncStaffToTs;
$("#ts-add").onclick=()=>{const name=(prompt("ФИО сотрудника")||"").trim();if(!name)return;const tab=prompt("Табельный номер (можно пусто)")||"",dep=prompt("Подразделение (можно пусто)")||"",email=prompt("Рабочая почта для уведомлений (можно пусто)")||"",ac=prompt("Учётный период: месяц, квартал или год (можно пусто)")||"";const x={name,tab,dep,email,acct:/кварт/i.test(ac)?"quarter":/год/i.test(ac)?"year":"month"};const n=addEmps([x]);if(n&&window.SVODKA_EMP_ADD_MANUAL){const k=window.SVODKA_EMP_ADD_MANUAL(x),emp=DB.emps.find(e=>(tab&&e.tab===tab)||(!tab&&norm(e.name)===norm(name)));if(emp)emp.srcKey=k}save();render()};
$("#ts-emp").onclick=()=>{const f=window.SVODKA_EMPS;const l=f?f():[];if(!l.length){alert("Нет данных. Сначала загрузите файл со списком сотрудников (ФИО) на вкладке «Сводка».");return}const n=addEmps(l);save();render();alert("Добавлено сотрудников: "+n+" из "+l.length)};
$("#ts-vac").onclick=()=>{const f=window.SVODKA_VACS;const L=f?f():[];if(!L.length){alert("Нет графика отпусков. Загрузите его на вкладке «Сводка».");return}
 const r=syncVacations(cur);save();render();alert("Поставлено отметок «О»: "+r.days+" у сотрудников: "+r.emps+". Перенесённых отпусков пропущено: "+r.skipped+". Отмечаются только рабочие дни; уже стоящие отметки не меняются.")};
$("#ts-prt").onclick=()=>{try{window.print()}catch(e){}};
const tsBigKey="svodka_ts_big",tsBigBtn=$("#ts-big");
const setTsBig=on=>{R.classList.toggle("ts-big",!!on);if(tsBigBtn)tsBigBtn.textContent=on?"Уменьшить":"Увеличить";try{localStorage.setItem(tsBigKey,on?"1":"0")}catch(e){}};
try{if(localStorage.getItem(tsBigKey)==="1")setTsBig(true)}catch(e){}
if(tsBigBtn)tsBigBtn.onclick=()=>setTsBig(!R.classList.contains("ts-big"));
$("#ts-pop").onclick=()=>{
 if(!window.SVODKA_UI||!window.SVODKA_UI.openModal)return;
 const tb=document.querySelector("#ts-tb"),tl=document.querySelector("#ts-tl");
 if(!tb||!tl)return;
 const tbHome=tb.parentNode,tbNext=tb.nextSibling,tlHome=tl.parentNode,tlNext=tl.nextSibling;
 window.SVODKA_UI.openModal("Табель — отдельное окно",
  `<div id="tsv" class="ts-big"><div class="ts-popbar"><span>Масштаб</span><button type="button" data-ts-zoom="-0.15" aria-label="Уменьшить">−</button><b id="ts-pop-val">115%</b><button type="button" data-ts-zoom="0.15" aria-label="Увеличить">+</button><button type="button" id="ts-pop-reset">100%</button><button type="button" id="ts-pop-fit">По ширине</button><span class="tnote">Отметки ставятся так же, как в основном табеле. Двойной щелчок — часы.</span></div>`+
  `<div id="ts-pop-zoom"><div id="ts-pop-tl"></div><div class="tsc" id="ts-pop-scroll"></div></div></div>`,
  {wide:true,onClose:()=>{tlHome.insertBefore(tl,tlNext);tbHome.insertBefore(tb,tbNext)}});
 const zoom=document.getElementById("ts-pop-zoom"),slot=document.getElementById("ts-pop-tl"),sc=document.getElementById("ts-pop-scroll"),val=document.getElementById("ts-pop-val");
 if(!zoom||!slot||!sc||!val)return;
 slot.appendChild(tl);sc.appendChild(tb);
 let scale=1.15;
 const apply=()=>{scale=Math.max(0.4,Math.min(2.5,Math.round(scale*100)/100));zoom.style.zoom=String(scale);val.textContent=Math.round(scale*100)+"%"};
 apply();
 document.querySelectorAll("[data-ts-zoom]").forEach(b=>b.onclick=()=>{scale+=parseFloat(b.dataset.tsZoom);apply()});
 const reset=document.getElementById("ts-pop-reset");if(reset)reset.onclick=()=>{scale=1;apply()};
 const fit=document.getElementById("ts-pop-fit");if(fit)fit.onclick=()=>{zoom.style.zoom="1";const tw=tb.scrollWidth||1700,avail=Math.max(320,sc.clientWidth-28);scale=avail/tw;apply()};
};const importRows=a=>{if(blockRo())return;const RG={n:/фио|фамил|сотрудник/i,t:/табел/i,d:/подраз|отдел/i,p:/должност|профес/i,s:/график|смен/i,e:/почт|e-?mail/i,a:/учетн.*период|период.*учет|суммирован/i};let hi=-1,m={};for(let i=0;i<Math.min(a.length,30);i++){const x={};a[i].forEach((c,j)=>{const s=String(c);for(const k of["t","d","p","n","s","e","a"])if(x[k]==null&&RG[k].test(s)&&s.length<60){x[k]=j;break}});if(x.n!=null||x.t!=null){hi=i;m=x;break}}
 if(hi<0)return 0;const list=[];for(const r of a.slice(hi+1)){const name=m.n!=null?String(r[m.n]).trim():"";if(/^итого/i.test(name))continue;const sc=m.s!=null?String(r[m.s]).trim():"",ac=m.a!=null?String(r[m.a]).trim():"";list.push({name,tab:m.t!=null?String(r[m.t]).trim():"",dep:m.d!=null?String(r[m.d]).trim():"",pos:m.p!=null?String(r[m.p]).trim():"",sched:SCH[sc]?sc:"5/2",email:m.e!=null?String(r[m.e]).trim():"",acct:/кварт/i.test(ac)?"quarter":/год/i.test(ac)?"year":"month"})}return addEmps(list)};
$("#ts-imp").onclick=()=>{if(typeof XLSX=="undefined"){alert("Не загрузилась библиотека чтения Excel");return}$("#ts-fi").click()};
$("#ts-fi").onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>25e6){alert("Файл больше 25 МБ");return}try{const wb=XLSX.read(await f.arrayBuffer(),{type:"array",cellDates:true}),n=importRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:""}));if(!n)alert("Не нашёл список сотрудников. Нужны колонки «ФИО» и/или «Табельный номер».");else{save();render();alert("Добавлено сотрудников: "+n)}}catch(x){alert("Не удалось прочитать файл")}};
const exportRows=()=>{const[y,mo]=ym(),M=MD(cur),n=dim(y,mo),list=visible(),company=(()=>{try{return (localStorage.getItem("svodka_company")||"").trim()}catch(e){return""}})();
 const head=["ФИО","Табельный номер","Подразделение","График",...Array.from({length:n},(_,i)=>i+1),"Явка, дн.","Часы","Норма","Отклонение","Сверхурочные","Больничные","Прогулы","Отпуск","Выходные","Работа в выходные, дн.","Работа в вых., ч","Командировки"];
 const t=(company?[[company],[],head]:[head]).concat(list.map(e=>{const c=calcEmp(M,y,mo,e.id),mk=M.marks[e.id]||{};return[e.name,e.tab,e.dep,schedOf(e),...Array.from({length:n},(_,i)=>{const p=parseMark(mk[i+1]);if(!p)return"";const dn=dayNormEmp(e,M,y,mo,i+1),h=p.h!=null?p.h:p.c=="Я"?dn:p.c=="РВ"?(dn||M.norm):p.c=="К"?(dn||M.norm):null;return p.c+(h!=null?" / "+h+" ч":"")}),c.w,c.hrs,c.plan,c.diff,c.ot,c.b,c.pr,c.o,c.v,c.rv,c.rvh,c.k]}));
 const a=(company?[[company],[]]:[]).concat([["Подразделение","Человек","Дней явки","Часы","Сверхурочные, ч","Больничные, дн.","Больничные, %","Прогулы, дн.","Прогулы, %","Отпуск, дн.","Выходные, дн.","Раб. вых., дн.","Раб. вых., ч","Командировки, дн."]].concat(deptAgg(M,y,mo,DB.emps,deptMin()).map(o=>[o.d,o.n,o.w,r1(o.hrs),r1(o.ot),o.b,o.pd?+(o.b/o.pd*100).toFixed(1):0,o.pr,o.pd?+(o.pr/o.pd*100).toFixed(1):0,o.o,o.v,o.rv,o.rvh,o.k])));
 return{t,a}};
$("#ts-exp").onclick=()=>{if(typeof XLSX=="undefined"){alert("Не загрузилась библиотека Excel");return}const{t,a}=exportRows(),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(t),"Табель");XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(a),"По отделам (обезличено)");
 try{const b=new Blob([XLSX.write(wb,{type:"array",bookType:"xlsx"})],{type:"application/octet-stream"}),u=URL.createObjectURL(b),l=document.createElement("a");l.href=u;l.download="tabel-"+cur+".xlsx";l.click();URL.revokeObjectURL(u)}catch(e){alert("Не удалось сохранить файл")}};
$("#ts-save").onclick=()=>{const ok=saveNow();if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast(ok?"Табель сохранён":"Не удалось сохранить табель",ok?"ok":"bad")};
$("#ts-sum").addEventListener("change",e=>{const s=e.target.closest&&e.target.closest("select[data-acct]");if(!s)return;const emp=DB.emps.find(x=>x.id==s.dataset.acct);if(!emp)return;emp.acct=ACC[s.value]?s.value:"month";saveNow();renderSummary();setSaveState("Учётный период обновлён",true)});
const nthWork=(y,mo,n)=>{const M=MD(cur);let c=0;for(let d=1;d<=dim(y,mo);d++){if(!isOffCal(M,y,mo,d)&&++c==n)return d}return 1};
const nthOff=(y,mo,n)=>{const M=MD(cur);let c=0;for(let d=1;d<=dim(y,mo);d++){if(isOffCal(M,y,mo,d)&&++c==n)return d}return 6};
const demoMarks=()=>{const[y,mo]=ym(),M=MD(cur),list=DB.emps.slice(0,6),set=(e,d,c,h)=>{const mk=M.marks[e.id]||(M.marks[e.id]=Object.create(null));mk[d]=c+(h!=null?":"+h:"")};
 const a=list[0],b=list[1]||list[0],c=list[2]||list[0],d=list[3]||list[0];if(!a)return;
 set(a,nthWork(y,mo,2),"Я",10);set(a,nthWork(y,mo,3),"Я",11);set(a,nthOff(y,mo,1),"РВ",8);
 set(b,nthWork(y,mo,4),"К",8);set(b,nthWork(y,mo,5),"К",8);set(b,nthWork(y,mo,6),"К",8);set(b,nthWork(y,mo,7),"Я",10);set(b,nthOff(y,mo,2),"РВ",6);
 set(c,nthWork(y,mo,1),"О",null);set(c,nthWork(y,mo,2),"О",null);set(c,nthWork(y,mo,3),"О",null);set(c,nthWork(y,mo,4),"О",null);set(c,nthWork(y,mo,5),"О",null);set(c,nthOff(y,mo,3),"РВ",7);
 if(d!==a){set(d,nthWork(y,mo,8),"Я",12);set(d,nthWork(y,mo,9),"Я",10);set(d,nthOff(y,mo,4),"РВ",8)}
 if(list[3]){for(let k=1;k<=6;k++)set(list[3],nthOff(y,mo,k),"РВ",8)}
 if(list[4]){for(let k=1;k<=10;k++)set(list[4],nthWork(y,mo,k),"Б",null)}};
const seedDemoTimesheet=list=>{if(DB.emps.length||!Array.isArray(list)||!list.length)return 0;const n=addEmps(list);if(!n)return 0;autoFillMonth(cur);demoMarks();saveNow();return n};
window.SVODKA_TS_SEED_DEMO=seedDemoTimesheet;
$("#ts-demo").onclick=()=>{if(!DB.emps.length)addEmps([{name:"Иванов Иван Иванович",tab:"Т-001",dep:"Продажи",pos:"Менеджер по продажам",email:"ivanov@example.ru"},{name:"Петрова Анна Сергеевна",tab:"Т-002",dep:"Бухгалтерия",pos:"Бухгалтер",email:"petrova@example.ru"},{name:"Сидоров Пётр Алексеевич",tab:"Т-003",dep:"IT",pos:"Разработчик 1С",email:"sidorov@example.ru"},{name:"Кузнецова Мария Олеговна",tab:"Т-004",dep:"Склад",pos:"Кладовщик",email:"kuznecova@example.ru"}]);
 autoFillMonth(cur);demoMarks();saveNow();render();if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("Демо-табель заполнен: сверхурочные, работа в выходной, командировки и отпуск","ok")};
const hasMarks=()=>{const M=DB.months[cur];return !!M&&Object.keys(M.marks).some(id=>Object.keys(M.marks[id]).length>0)};
const agg=()=>{const[y,mo]=ym(),M=MD(cur);return{key:cur,wd:workDays(M,y,mo),n:DB.emps.length,rows:deptAgg(M,y,mo,DB.emps,deptMin()),has:hasMarks()}};
const setCalendar=(year,data)=>{if(blockRo())return 0;const Y=+year;if(!(Y>=2000&&Y<=2100))return 0;const hol=Array.isArray(data&&data.hol)?data.hol:[],sh=Array.isArray(data&&data.short)?data.short:[],ex=Array.isArray(data&&data.extra)?data.extra:[];
 let k=0;for(let m=1;m<=12;m++){const key=Y+"-"+String(m).padStart(2,"0"),M=MD(key);M.hol=[];M.short=[];M.extra=[];
  const put=(list,arr)=>{arr.forEach(s=>{const q=String(s).slice(0,10).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(q&&+q[1]==Y&&+q[2]==m&&+q[3]>=1&&+q[3]<=dim(Y,m)){list.push(+q[3]);k++}})};
  put(M.hol,hol);put(M.short,sh);put(M.extra,ex)}
 save();render();return k};
const hasCalendar=(year)=>{const Y=+year;for(let m=1;m<=12;m++){const M=DB.months[Y+"-"+String(m).padStart(2,"0")];if(M&&(M.hol.length||M.short.length||M.extra.length))return true}return false};
const setView=v=>{const dv=document.getElementById("dashv"),tv=document.getElementById("tsv"),cv=document.getElementById("connectv"),lv=document.getElementById("learnv"),ev=document.getElementById("empv");if(!dv||!tv)return;
 const isDash=v=="dash",isTs=v=="ts",isConn=v=="connect",isLearn=v=="learn",isEmp=v=="emp";
 dv.hidden=!isDash;tv.hidden=!isTs;
 if(cv)cv.classList.toggle("on",isConn);if(lv)lv.classList.toggle("on",isLearn);if(ev)ev.hidden=!isEmp;
 if(document.body&&document.body.classList){document.body.classList.toggle("tsmode",isTs);document.body.classList.toggle("page-mode",isConn||isLearn||isEmp)}
 const bs=document.querySelectorAll?document.querySelectorAll("[data-view]"):[];bs.forEach&&bs.forEach(b=>b.classList.toggle("on",b.dataset.view==v));
 if(isTs){const added=syncStaffToTs();render();if(added&&window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("В табель добавлено сотрудников: "+added,"ok")}else if(isDash&&window.SVODKA_REDRAW)window.SVODKA_REDRAW();else if(isEmp&&window.SVODKA_RENDER_EMP)window.SVODKA_RENDER_EMP();
 if((isConn||isLearn)&&window.SVODKA_REFRESH_SHELL)try{window.SVODKA_REFRESH_SHELL()}catch(e){}
 try{window.scrollTo(0,0)}catch(e){}};
const vb=document.querySelectorAll?document.querySelectorAll("[data-view]"):[];vb.forEach&&vb.forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
window.TS={agg,has:hasMarks,setView,setCalendar,hasCalendar,syncVacations,autoFillMonth,saveNow,_t:{paint,fixCode,calcEmp,calcPeriod,workDays,dayNorm,dayNormEmp,isOffEmp,deptAgg,cleanDB,rowHtml,render,addEmps,importRows,setCalendar,get DB(){return DB},get cur(){return cur},setCur:k=>{cur=k}}};
window.SVODKA_SET_VIEW=setView;
if(DB.emps.length){autoFillMonth(cur);if(Object.keys(DB.months[cur]&&DB.months[cur].marks||{}).length)saveNow()}
render();
})();
