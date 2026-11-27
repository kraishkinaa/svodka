/* «Сводка» — роли, раскладки, отрисовка экрана. Вынесено из index.html на Этапе 3 без изменения логики. */
const BUILTIN_ROLES=[{id:"owner",name:"Собственник",color:"#d98b1c",base:"owner"},{id:"hrd",name:"HRD",color:"#6d5bd0",base:"hrd"},{id:"recruiter",name:"Рекрутер",color:"#0f9d8a",base:"recruiter"}];
const ROLE_LEGACY={"Собственник":"owner","HRD":"hrd","Рекрутер":"recruiter"};
let ROLE_META=[];
try{const x=JSON.parse(localStorage.getItem("svodka_role_meta"));if(Array.isArray(x))ROLE_META=x.filter(r=>r&&typeof r.id=="string"&&typeof r.name=="string"&&/^[a-z0-9_]{3,30}$/.test(r.id)&&/^#[0-9a-f]{6}$/i.test(r.color)&&["owner","hrd","recruiter"].includes(r.base)).slice(0,20)}catch(e){}
const roleList=()=>{const b=BUILTIN_ROLES.map(x=>{const o=ROLE_META.find(r=>r.id==x.id);return o?Object.assign({},x,{color:o.color}):x});return b.concat(ROLE_META.filter(r=>!BUILTIN_ROLES.some(x=>x.id==r.id)))};
const roleOf=id=>roleList().find(r=>r.id==id)||roleList()[1];
const isCustomRole=id=>!BUILTIN_ROLES.some(x=>x.id==id);
const saveRoleMeta=()=>{try{localStorage.setItem("svodka_role_meta",JSON.stringify(ROLE_META))}catch(e){}};
const PR={owner:["kpi","forecast","fot","cost","src"],hrd:["kpi","forecast","fot","heat","src","ttf","cost"],recruiter:["src","hiring","ttf"]};
const mk=r=>{const p=PR[roleOf(r).base],o=Object.keys(WG).filter(i=>!p.includes(i));return{order:[...p,...o],hide:o,role:r}};
const DEF_ALLOWED=["kpi","forecast","turn","dep","funnel","src","vacs","hiring","chcost","ttf","heat","complete"];
let ROLED={role:"hrd",allowed:DEF_ALLOWED.slice()};
try{const x=JSON.parse(localStorage.getItem("svodka_roles"));if(x&&typeof x=="object"){const rid=ROLE_LEGACY[x.role]||x.role;if(roleList().some(r=>r.id==rid))ROLED.role=rid;if(Array.isArray(x.allowed))ROLED.allowed=[...new Set(x.allowed.filter(k=>WG[k]))]}}catch(e){}
if(!ROLED.allowed.length)ROLED.allowed=DEF_ALLOWED.slice();
const saveRoles=()=>{try{localStorage.setItem("svodka_roles",JSON.stringify(ROLED))}catch(e){}};
const roleBase=()=>roleOf(ROLED.role).base;
const canSee=id=>roleBase()!="recruiter"||ROLED.allowed.includes(id);
const allowedList=()=>roleBase()=="recruiter"?ROLED.allowed.slice():Object.keys(WG);
let st=Object.assign(mk("hrd"),{edit:0,pd:1,pick:0,per:12,hp:"m",hm:""});
try{const x=JSON.parse(localStorage.getItem("svodka2"));if(x&&x.order)st=Object.assign(st,x,{edit:0,pick:0,msg:"",q:"",pd:1})}catch(e){}
st.order=[...new Set((Array.isArray(st.order)?st.order:[]).filter(k=>WG[k]))];st.hide=[...new Set((Array.isArray(st.hide)?st.hide:[]).filter(k=>WG[k]))];if(![1,3,6,9,12].includes(+st.per))st.per=12;if(st.role&&!roleList().some(r=>r.id==st.role))st.role="";
const LAYOUT_KEY="svodka_layouts";
let LAYOUTS={};
try{const x=JSON.parse(localStorage.getItem(LAYOUT_KEY));if(x&&typeof x=="object")roleList().forEach(r=>{const L=x[r.id]||x[Object.keys(ROLE_LEGACY).find(n=>ROLE_LEGACY[n]==r.id)];if(L&&Array.isArray(L.order)&&Array.isArray(L.hide))LAYOUTS[r.id]={order:[...new Set(L.order.filter(k=>WG[k]))],hide:[...new Set(L.hide.filter(k=>WG[k]))]}})}catch(e){}
const saveLayouts=()=>{try{localStorage.setItem(LAYOUT_KEY,JSON.stringify(LAYOUTS))}catch(e){}};
const rememberLayout=()=>{LAYOUTS[ROLED.role]={order:st.order.slice(),hide:st.hide.slice()};saveLayouts()};
const applyLayout=r=>{const L=LAYOUTS[r];if(L){st.order=L.order.slice();st.hide=L.hide.slice()}else{const d=mk(r);st.order=d.order.slice();st.hide=d.hide.slice()}Object.keys(WG).forEach(k=>{if(!st.order.includes(k)){st.order.push(k)}})};
const legacyRole=ROLE_LEGACY[st.role]||st.role||"hrd";
if(LAYOUTS[ROLED.role])applyLayout(ROLED.role);
else if(legacyRole===ROLED.role)rememberLayout();
else{applyLayout(ROLED.role);rememberLayout()}
if(!["m","q","h","y"].includes(st.hp))st.hp="m";if(!/^\d{4}-\d{2}$/.test(st.hm||"")){st.hm=Math.max(new Date().getFullYear(),2027)+"-01"}
Object.keys(WG).forEach(k=>{if(!st.order.includes(k)){st.order.push(k)}});try{const x=JSON.parse(localStorage.getItem("svodka_cp"));if(x&&typeof x=="object")Object.keys(CP).forEach(k=>{if(isFinite(x[k])&&x[k]>=0)CP[k]=+x[k]})}catch(e){}
try{const x=JSON.parse(localStorage.getItem("svodka_ch"));if(x&&typeof x=="object")Object.keys(x).forEach(k=>{if(k.length<60&&isFinite(x[k])&&x[k]>=0)CHS[k]=+x[k]})}catch(e){}
PER=st.per||12;$("#per").value=String(PER);
const save=()=>{rememberLayout();try{localStorage.setItem("svodka2",JSON.stringify(Object.assign({},st,{pd:0,q:"",msg:"",edit:0,pick:0})))}catch(e){}};
function draw(){const ae=document.activeElement;let fk=null;try{if(ae&&ae.closest&&ae.closest("#g")&&ae.attributes){const a=[...ae.attributes].filter(x=>x.name.startsWith("data-")&&x.name!="data-id").map(x=>[x.name,x.value]);if(a.length)fk={a:a[0],id:(ae.closest("[data-id]")||{dataset:{}}).dataset.id||""}}}catch(e){}
 draw0();if(fk){try{const el=document.querySelector((fk.id?'[data-id="'+fk.id+'"] ':"")+"["+fk.a[0]+'="'+String(fk.a[1]).replace(/["\\]/g,"")+'"]');if(el&&el.focus)el.focus()}catch(e){}}}
const WICO={kpi:"grid",traffic:"target",turn:"trend",forecast:"trend",fot:"file",dep:"users",funnel:"target",src:"upload",dq:"shield",ttf:"clock",heat:"calendar",shr:"file",complete:"grid",vacs:"file",hiring:"users",why:"history",age:"users",adapt:"users",vacplan:"calendar",vac:"calendar",prob:"clock",ret:"clock",cost:"target"};
const WCOLS=["blue","mint","violet","cyan"];
function draw0(){
 $("#g").className="g"+(st.edit?" edit":"");
 const vis=st.order.filter(i=>!st.hide.includes(i)&&canSee(i));
 $("#g").innerHTML=vis.map((id,n)=>{const w=WG[id],hero=n==0,span=hero||w.wide?"w12":"w6",lk=w.pd&&!st.pd,mq=(NEED[id]||[]).filter(k=>!(HAS[k]||HASC[k]||(k=="ts"&&window.TS&&window.TS.has()))),sk=WD[id],srcDemo=DEMO_SRC[sk],fn=srcDemo?`<div class="fn demo">Демонстрационные данные</div>`:(stale(sk)?`<div class="fn">Данные «${DS[sk]}» обновлены ${ago(sk)}. Загрузите свежую выгрузку.</div>`:"");
 return `<section class="c ${span}${hero?" hero":""}${id=="kpi"&&!hero?" kpi-sm":""}${srcDemo?" demo":""}" data-id="${id}"><div class="tb"><button data-a="l" aria-label="Левее">←</button><button data-a="r" aria-label="Правее">→</button><button data-a="m">Главный</button><button data-a="h">Скрыть</button></div><h2><span class="wico wico--${WCOLS[n%4]}"><svg aria-hidden="true"><use href="#i-${WICO[id]||"grid"}"/></svg></span>${w.t}<button class="q" data-q="${id}" aria-label="Как посчитано">?</button></h2><p>${w.s}</p>${st.q==id?helpBox(id):""}${safe(()=>lk?plate():(mq.length?nod(mq):w.f()))}${fn}${w.pd&&st.pd?`<div class="fn">Согласие на обработку персональных данных дано. <button class="lk" data-a="rv">Отозвать</button></div>`:""}</section>`}).join("")+((st.edit||st.pick)?`<button class="c w6 ph" data-pick="1">+ Добавить виджет</button><button class="c w6 ph" data-pick="1">+ Добавить виджет</button>`:"");
 const hd=st.order.filter(i=>st.hide.includes(i)&&canSee(i));
 $("#ms").innerHTML=MISS.length?`<b>Чего не хватает в загруженных файлах</b><ul>${MISS.map(x=>`<li>${x}</li>`).join("")}</ul><span>Добавьте эти колонки в тот же или в другой файл: таблицы объединяются по табельному номеру или ФИО.</span>`:"";
 $("#tray").innerHTML=(st.edit||st.pick)?`<span>Добавить виджет:</span>`+(hd.map(i=>`<button data-add="${i}">+ ${WG[i].t}</button>`).join("")||"<span>все доступные показаны</span>"):"";
 $("#pre").innerHTML="";
  const rb=$("#role-banner");
  if(rb){const r=roleOf(ROLED.role);rb.innerHTML=`<span>Роль: <b class="rtext" style="color:${r.color}">${ec(r.name)}</b> <small>${r.base=="owner"?"видны все виджеты и настройки":r.base=="hrd"?"полный доступ, собирает экраны ограниченных ролей":"видны только разрешённые виджеты: "+ROLED.allowed.length}</small></span><span class="rchips">${roleList().map(x=>`<button data-p="${x.id}" class="rchip${x.id==ROLED.role?" on":""}" style="--rc:${x.color}"><i></i>${ec(x.name)}</button>`).join("")}</span>`}
  $("#rm").innerHTML="<span>Данные:</span>"+Object.keys(DS).filter(k=>k!="survey").map(k=>`<button data-src="1" class="${stale(k)?"red":""}">${DS[k]} · ${ago(k)}</button>`).join("");
 $("#be").classList.toggle("on",!!st.edit);$("#be").textContent=st.edit?"Готово":"Настроить вид";
}
