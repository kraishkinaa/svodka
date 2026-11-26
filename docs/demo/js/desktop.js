/* «Сводка» — виджеты и функции настольной редакции. Вынесено из index.html на Этапе 3 без изменения логики. */
if(window.SVODKA_DESKTOP){
 NL.ts="отметки в разделе «Табель»";NEED.abs=["ts"];
 HELP.abs="Данные берутся из раздела «Табель» за месяц, выбранный там. Процент больничных и прогулов = дни ÷ (человек × рабочих дней месяца). Сверхурочные: часы сверх нормы дня, работа в выходные показана отдельно. Подразделения меньше 5 человек объединяются, только если в компании 80 и более человек; при меньшем штате показаны отдельно.";
 HELP.vacplan="Считается по загруженному графику отпусков. Сотрудник относится к «сходили», если хотя бы один его отпуск закончился или в статусе указано «использован/отгулян». «Перенесено» — если в статусе есть «перенесён». Если фактические даты начала и окончания заполнены, используются они. Имена сокращены.";
 WG.abs={t:"Табель: отсутствия и переработки",s:"Из раздела «Табель» за выбранный там месяц. Группы меньше 5 человек объединяются при штате от 80 человек",z:6,f:()=>{const q=window.TS&&window.TS.agg();if(!q||!q.has)return nod(["ts"]);const t=q.rows.reduce((a,o)=>({pd:a.pd+o.pd,b:a.b+o.b,pr:a.pr+o.pr,ot:a.ot+o.ot,rv:a.rv+o.rv,rvh:a.rvh+o.rvh,k:a.k+o.k}),{pd:0,b:0,pr:0,ot:0,rv:0,rvh:0,k:0}),p=(x,d)=>d?(x/d*100).toFixed(1).replace(".",","):"0",o1=x=>String(Math.round(x*10)/10).replace(".",",");
  return `<p style="margin:0 0 12px">Больничные <b>${p(t.b,t.pd)}%</b> · прогулы <b>${p(t.pr,t.pd)}%</b> · сверхурочные <b>${o1(t.ot)} ч</b> · работа в выходные <b>${o1(t.rvh)} ч</b> (${t.rv} дн.) <span class="hid">(${ec(q.key)})</span></p><div class="sc"><div class="vt vtc" style="grid-template-columns:1.5fr .6fr .8fr .8fr .9fr .9fr .9fr .8fr"><b>Подразделение</b><b>Человек</b><b>Больничные</b><b>Прогулы</b><b>Сверхурочные, ч</b><b>Раб. вых., дн.</b><b>Раб. вых., ч</b><b>Команд., дн.</b>${q.rows.slice(0,8).map(o=>`<span>${ec(o.d)}</span><span>${o.n}</span><span>${p(o.b,o.pd)}%</span><span>${p(o.pr,o.pd)}%</span><span>${o1(o.ot)}</span><span>${o.rv}</span><span>${o1(o.rvh)}</span><span>${o.k}</span>`).join("")}</div></div>`}};
 window.SVODKA_REDRAW=()=>draw();
 window.SVODKA_STALE=()=>Object.keys(UP).some(k=>stale(k));
 window.SVODKA_MISSING=()=>MISS.slice();
 window.SVODKA_HAS_DATA=()=>!!(LASTRECS&&LASTRECS.length);
 window.SVODKA_NOTICE_SEND=null;
 document.addEventListener("click",e=>{const allVac=e.target.closest&&e.target.closest("[data-notice-all-vac]");if(allVac){const d=window.SVODKA_NOTIFY_DATA?window.SVODKA_NOTIFY_DATA():{vacations:[]};const rows=d.vacations.filter(r=>r.email&&(!window.SVODKA_VAC_SENT||!window.SVODKA_VAC_SENT.has((r.tab||r.name)+"|"+r.start))&&r.days>=0);if(rows.length&&window.SVODKA_NOTICE_SEND)window.SVODKA_NOTICE_SEND("vacation",rows);else if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("Нет получателей, кому нужно направить уведомление","bad");return}
 const all=e.target.closest&&e.target.closest("[data-notice-all]");if(all){const kind=all.dataset.noticeAll,rows=(window.SVODKA_NOTIFY_DATA?window.SVODKA_NOTIFY_DATA():{probation:[],vacations:[]})[kind==="probation"?"probation":"vacations"].filter(r=>r.email);if(!rows.length){if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("Нет получателей с рабочей почтой","bad");return}if(window.SVODKA_NOTICE_SEND)window.SVODKA_NOTICE_SEND(kind);return}
 const b=e.target.closest&&e.target.closest("[data-notice]");if(!b)return;const kind=b.dataset.notice,i=+b.dataset.i,rows=(window.SVODKA_NOTIFY_DATA?window.SVODKA_NOTIFY_DATA():{probation:[],vacations:[]})[kind==="probation"?"probation":"vacations"];const r=rows[i];if(r&&window.SVODKA_NOTICE_SEND)window.SVODKA_NOTICE_SEND(kind,r)});
 window.SVODKA_EMPS=()=>{const n=new Date();let L=(LASTRECS||[]).filter(r=>r.fn&&(!r.fire||r.fire>n)&&(!r.hire||r.hire<=n));if(LAST&&LAST[1]===DEMO)L=L.filter(r=>r.bd&&r.sex);return L.map(r=>({name:r.fn,tab:r.tab||"",dep:r.dep||r.dpt||r.dir||r.grp||"",pos:r.pos||"",email:r.email||"",acct:r.acct||"month"}))};
 window.SVODKA_VACS=()=>(LASTRECS||[]).filter(r=>r.vac&&r.vac.length&&(r.tab||r.fn)).map(r=>({tab:r.tab||"",name:norm(r.fn||""),dep:r.dep||r.dpt||r.dir||r.grp||"",p:r.vac}));
 const EMP_EXTRA_KEY="svodka_emp_extra";
 const empExtra=()=>{try{return JSON.parse(localStorage.getItem(EMP_EXTRA_KEY))||{}}catch(e){return{}}};
 const saveExtra=o=>{try{localStorage.setItem(EMP_EXTRA_KEY,JSON.stringify(o))}catch(e){}};
 const sentStore=key=>{const read=()=>{try{return JSON.parse(localStorage.getItem(key))||{}}catch(e){return{}}};return{has:k=>!!read()[k],mark:k=>{const o=read();o[k]=Date.now();try{localStorage.setItem(key,JSON.stringify(o))}catch(e){}}}};
 window.SVODKA_VAC_SENT=sentStore("svodka_vac_sent");
 window.SVODKA_PROBE_SENT=sentStore("svodka_probe_sent");
 const isoDate=d=>d instanceof Date&&!isNaN(d)?d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"):"";
 const edate=v=>{if(v instanceof Date)return isNaN(v)?null:v;const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v||""));return m?new Date(+m[1],+m[2]-1,+m[3]):null};
 const empKey=r=>String(r&&(r._key||r.tab||r.fn)||"");
 const empEmail=r=>String((r&&(r.email||r.em))||"");
 const empPhone=r=>String((r&&r.phone)||"");
 const empSetRaw=(k,patch)=>{if(!k)return;const o=empExtra();o[k]=Object.assign({},o[k],patch||{});saveExtra(o)};
 const empSetKey=(k,field,val)=>{if(window.SVODKA_LICENSE&&window.SVODKA_LICENSE.readonly()){if(window.SVODKA_UI)window.SVODKA_UI.toast("Подписка закончилась: данные сотрудников не редактируются","bad");return}if(!k)return;empSetRaw(k,{[field]:String(val==null?"":val).trim().slice(0,200)})};
 const vacToArrays=a=>(Array.isArray(a)?a:[]).map(v=>[edate(v&&v[0]),edate(v&&v[1]),String((v&&v[2])||"")]).filter(v=>v[0]);
 const applyEmpEdits=()=>{
  const o=empExtra();
  LASTRECS=(LASTRECS||[]).filter(r=>{if(!r.fn&&!r.tab)return false;const k=empKey(r);r._key=k;return !(o[k]&&o[k].deleted)});
  const keys=new Set();
  LASTRECS.forEach(r=>{const k=r._key;keys.add(k);const x=o[k]||{};
   if(x.name!==undefined&&String(x.name).trim())r.fn=String(x.name).trim();
   ["tab","dep","pos","sex","email","phone","acct"].forEach(f=>{if(x[f]!==undefined)r[f]=String(x[f])});
   ["hire","fire","bd"].forEach(f=>{if(x[f]!==undefined)r[f]=edate(x[f])});
   if(x.sal!==undefined){const v=+x.sal;r.sal=v>0?v:0}
   if(x.vac!==undefined)r.vac=vacToArrays(x.vac);
  });
  Object.keys(o).forEach(k=>{const x=o[k];if(!x.manual||x.deleted||keys.has(k))return;
   const r={_key:k,fn:x.name||"",tab:x.tab||"",dep:x.dep||"",pos:x.pos||"",hire:edate(x.hire),fire:edate(x.fire),bd:edate(x.bd),sex:x.sex||"",sal:+x.sal||0,email:x.email||"",phone:x.phone||"",acct:x.acct||"month",vac:vacToArrays(x.vac)};
   LASTRECS.push(r);keys.add(k)});
 };
 window.SVODKA_EMP_APPLY=applyEmpEdits;
 const empFull=()=>{applyEmpEdits();const now=new Date();let R=(LASTRECS||[]).filter(r=>r.fn||r.tab);if(LAST&&LAST[1]===DEMO)R=R.filter(r=>r.bd&&r.sex&&(!r.fire||r.fire>now));return R.map(r=>({name:r.fn||"",tab:r.tab||"",dep:r.dep||r.dpt||r.dir||r.grp||"",pos:r.pos||"",hire:r.hire||null,fire:r.fire||null,bd:r.bd||null,age:r.age>0?r.age:(r.bd instanceof Date&&!isNaN(r.bd)?Math.floor((Date.now()-r.bd)/315576e5):0),sex:r.sex||"",sal:r.sal||0,email:r.email||r.em||"",phone:r.phone||"",acct:r.acct||"month",vac:(r.vac||[]).map(v=>({s:v[0],e:v[1],st:v[2]||""})),active:!r.fire||r.fire>now,_key:r._key||empKey(r)}))};
 window.SVODKA_EMPS_FULL=empFull;
 window.SVODKA_EMPS=()=>{const n=new Date();return empFull().filter(r=>r.active&&(!r.hire||r.hire<=n)).map(r=>({name:r.name,tab:r.tab,dep:r.dep,pos:r.pos,email:r.email,acct:r.acct,srcKey:r._key}))};
 window.SVODKA_VACS=()=>empFull().filter(r=>r.vac&&r.vac.length&&(r.tab||r.name)).map(r=>({tab:r.tab,name:norm(r.name||""),dep:r.dep,p:r.vac.map(v=>[v.s,v.e,v.st])}));
 const afterEmpChange=()=>{applyEmpEdits();try{window.SVODKA_TS_SYNC&&window.SVODKA_TS_SYNC()}catch(e){}try{window.TS&&window.TS.syncVacations&&window.TS.syncVacations()}catch(e){}renderEmp();try{window.SVODKA_REDRAW&&window.SVODKA_REDRAW()}catch(e){}};
 window.SVODKA_EMP_SET=(r,field,val)=>{const k=empKey(r);if(!k)return;empSetKey(k,field,val);afterEmpChange()};
 window.SVODKA_EMP_DELETE=r=>{const k=empKey(r);if(!k)return;empSetRaw(k,{deleted:true});afterEmpChange();if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("Сотрудник удалён из списка и табеля","ok")};
 window.SVODKA_EMP_ADD_MANUAL=x=>{const k="m:"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);empSetRaw(k,Object.assign({manual:true},x||{}));afterEmpChange();return k};
 const empFind=k=>(window.SVODKA_EMPS_FULL?window.SVODKA_EMPS_FULL():[]).find(x=>x._key===k)||null;
 const empCard=r=>{const deps=[...new Set(empFull().map(x=>x.dep).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ru"));const vf=v=>isoDate(v&&v.s);const vrows=(r.vac||[]).map((v,i)=>`<div class="emp-vac-row" data-vac-row="${ec(r._key)}"><input type="date" data-vf="s" value="${vf(v)}" aria-label="Начало отпуска"><input type="date" data-vf="e" value="${isoDate(v&&v.e)}" aria-label="Окончание отпуска"><input type="text" data-vf="st" value="${ec(v&&v.st||"")}" placeholder="Статус" aria-label="Статус отпуска"><button type="button" data-vac-del="${i}" data-vac-key="${ec(r._key)}" title="Удалить отпуск">×</button></div>`).join("");
  return `<div class="mf"><div class="emp-edit-grid">
   <label>ФИО<input data-emp="${ec(r._key)}" data-f="name" value="${ec(r.name)}" autocomplete="name"></label>
   <label>Табельный номер<input data-emp="${ec(r._key)}" data-f="tab" value="${ec(r.tab)}"></label>
   <label>Подразделение<input data-emp="${ec(r._key)}" data-f="dep" value="${ec(r.dep)}" list="emp-dep-list"><datalist id="emp-dep-list">${deps.map(d=>`<option value="${ec(d)}">`).join("")}</datalist></label>
   <label>Должность<input data-emp="${ec(r._key)}" data-f="pos" value="${ec(r.pos)}"></label>
   <label>Дата приёма<input type="date" data-emp="${ec(r._key)}" data-f="hire" value="${isoDate(r.hire)}"></label>
   <label>Дата увольнения<input type="date" data-emp="${ec(r._key)}" data-f="fire" value="${isoDate(r.fire)}"></label>
   <label>Дата рождения<input type="date" data-emp="${ec(r._key)}" data-f="bd" value="${isoDate(r.bd)}"></label>
   <label>Пол<select data-emp="${ec(r._key)}" data-f="sex"><option value="">—</option><option value="М"${r.sex==="М"?" selected":""}>Мужской</option><option value="Ж"${r.sex==="Ж"?" selected":""}>Женский</option></select></label>
   <label>Оклад, ₽<input type="number" min="0" step="1000" data-emp="${ec(r._key)}" data-f="sal" value="${r.sal||""}"></label>
   <label>Учётный период<select data-emp="${ec(r._key)}" data-f="acct"><option value="month"${r.acct==="month"?" selected":""}>Месяц</option><option value="quarter"${r.acct==="quarter"?" selected":""}>Квартал</option><option value="year"${r.acct==="year"?" selected":""}>Год</option></select></label>
   <label>Рабочая почта<input type="email" data-emp="${ec(r._key)}" data-f="email" value="${ec(r.email)}" placeholder="не указана"></label>
   <label>Телефон<input type="tel" data-emp="${ec(r._key)}" data-f="phone" value="${ec(r.phone)}" placeholder="не указан"></label>
  </div>
  <div class="emp-status-line"><span>Статус: <b>${r.active?"работает":"уволен"}</b></span><button type="button" class="p" data-emp-status-card="${ec(r._key)}" data-active="${r.active?1:0}">${r.active?"Уволить":"Вернуть в работу"}</button></div>
  <div class="emp-vac"><b>Отпуска</b>${vrows?`<div class="emp-vac-list">${vrows}</div>`:'<p class="mu">Отпусков нет.</p>'}<button type="button" data-vac-add="${ec(r._key)}">+ Добавить отпуск</button></div>
  <div class="set-actions"><button type="button" class="danger" data-emp-del-card="${ec(r._key)}">Удалить сотрудника</button></div>
  <p class="hint">Изменения сохраняются сразу. Уволенный или удалённый сотрудник уходит из табеля; при возврате появится снова.</p></div>`};
 const empOpen=r=>{if(!r||!window.SVODKA_UI)return;window.SVODKA_UI.openModal(r.name||"Сотрудник",empCard(r))};
 const renderEmp=()=>{const el=document.getElementById("emp-list");if(!el)return;const all=window.SVODKA_EMPS_FULL();const q=(document.getElementById("emp-q")||{}).value||"";const qq=String(q).trim().toLowerCase();const list=all.filter(r=>!qq||(r.name+" "+(r.tab||"")+" "+(r.dep||"")+" "+(r.pos||"")).toLowerCase().includes(qq));const cnt=document.getElementById("emp-count");if(cnt)cnt.textContent=list.length+" из "+all.length;window.__EMP_ALL=all;el.innerHTML=list.map(r=>'<button type="button" class="emp-row" data-emp-open="'+all.indexOf(r)+'"><span class="er-name">'+ec(r.name)+'</span><span class="er-meta">'+(r.dep?ec(r.dep):"—")+(r.pos?" · "+ec(r.pos):"")+(r.hire?" · с "+(r.hire instanceof Date?r.hire.toLocaleDateString("ru-RU"):ec(r.hire)):"")+'</span><span class="er-tab">'+(r.tab?ec(r.tab):"—")+'</span><span class="er-status '+(r.active?'on':'off')+'" data-emp-status="'+all.indexOf(r)+'" role="button" tabindex="0" title="'+(r.active?"Отметить уволенным":"Вернуть в работу")+'">'+(r.active?'работает':'уволен')+'</span><span class="er-arrow">›</span></button>').join("")||'<p class="nod">Нет сотрудников. Загрузите файл со списком сотрудников (колонка «ФИО») на вкладке «Подключения» или используйте демо-данные.</p>'};
 window.SVODKA_RENDER_EMP=renderEmp;
 const toggleEmpStatus=r=>{if(!r)return;empSetKey(empKey(r),"fire",r.active?isoDate(new Date()):"");afterEmpChange();if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast(r.active?"Сотрудник отмечен уволенным":"Сотрудник возвращён в работу","ok")};
 const saveVacations=k=>{const rows=[...document.querySelectorAll("[data-vac-row]")].filter(x=>x.dataset.vacRow===k);const arr=rows.map(row=>[row.querySelector('[data-vf="s"]').value,row.querySelector('[data-vf="e"]').value,row.querySelector('[data-vf="st"]').value]).filter(x=>x[0]&&x[1]);empSetRaw(k,{vac:arr});afterEmpChange()};
 document.addEventListener("click",e=>{
  const st=e.target.closest&&e.target.closest("[data-emp-status]");if(st){e.preventDefault();e.stopPropagation();toggleEmpStatus((window.__EMP_ALL||[])[+st.dataset.empStatus]);return}
  const cardSt=e.target.closest&&e.target.closest("[data-emp-status-card]");if(cardSt){const k=cardSt.dataset.empStatusCard;toggleEmpStatus(empFind(k));const rr=empFind(k);if(rr)empOpen(rr);return}
  const del=e.target.closest&&e.target.closest("[data-emp-del-card]");if(del){const k=del.dataset.empDelCard;if(confirm("Удалить сотрудника из списка сотрудников и табеля? Отметки табеля будут удалены.")){window.SVODKA_EMP_DELETE(empFind(k));window.SVODKA_UI&&window.SVODKA_UI.closeModal()}return}
  const add=e.target.closest&&e.target.closest("[data-vac-add]");if(add){const k=add.dataset.vacAdd;const o=empExtra()[k]||{};const a=(o.vac||[]).slice();const s=new Date(),t=new Date(s.getTime()+13*864e5);a.push([isoDate(s),isoDate(t),"Ежегодный"]);empSetRaw(k,{vac:a});afterEmpChange();const rr=empFind(k);if(rr)empOpen(rr);return}
  const vd=e.target.closest&&e.target.closest("[data-vac-del]");if(vd){const k=vd.dataset.vacKey,i=+vd.dataset.vacDel;const o=empExtra()[k]||{};const a=(o.vac||[]).slice();a.splice(i,1);empSetRaw(k,{vac:a});afterEmpChange();const rr=empFind(k);if(rr)empOpen(rr);return}
  const b=e.target.closest&&e.target.closest("[data-emp-open]");if(b){const r=(window.__EMP_ALL||[])[+b.dataset.empOpen];if(r)empOpen(r)}
 });
 const openEmpByName=name=>{const all=window.SVODKA_EMPS_FULL();const r=all.find(x=>x.name===name);if(r){window.SVODKA_SET_VIEW&&window.SVODKA_SET_VIEW("emp");setTimeout(()=>empOpen(r),60);return true}return false};
 window.SVODKA_OPEN_EMP=openEmpByName;
 document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("[data-mail-fix],[data-mail-fix-vac]");if(!a)return;e.preventDefault();const isVac=a.hasAttribute("data-mail-fix-vac");const d=window.SVODKA_NOTIFY_DATA?window.SVODKA_NOTIFY_DATA():{probation:[],vacations:[]};const list=isVac?d.vacations:d.probation;const r=list[+(isVac?a.dataset.mailFixVac:a.dataset.mailFix)];if(!r)return;if(!openEmpByName(r.name)&&window.SVODKA_SET_VIEW)window.SVODKA_SET_VIEW("emp")});
 document.addEventListener("change",e=>{const t=e.target;if(t.dataset&&t.dataset.emp&&t.dataset.f){let v=t.value;if(t.dataset.f==="sal")v=Math.max(0,+String(v).replace(/\s/g,"").replace(",",".")||0);empSetKey(t.dataset.emp,t.dataset.f,v);afterEmpChange();if(t.dataset.f==="email"&&window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("Почта сохранена","ok");return}const vr=t.closest&&t.closest("[data-vac-row]");if(vr&&t.dataset&&t.dataset.vf){saveVacations(vr.dataset.vacRow)}});
 document.addEventListener("input",e=>{if(e.target&&e.target.id==="emp-q")renderEmp()});

 window.SVODKA_NOTIFY_DATA=()=>{const now=new Date(),d0=new Date(now.getFullYear(),now.getMonth(),now.getDate()),ds=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),prob=[],vacs=[];
  (LASTRECS||[]).forEach(r=>{if(!r.fn)return;const email=empEmail(r);
   if(r.hire){const end=new Date(r.hire.getFullYear(),r.hire.getMonth()+3,r.hire.getDate());const dd=Math.round((end-d0)/864e5);if(dd>=-7&&dd<=30)prob.push({name:r.fn,tab:r.tab||"",email,date:ds(end),days:dd})}
   (r.vac||[]).forEach(v=>{const st=norm(String(v[2]||""));if(/перенес/.test(st))return;let s=v[0],t=v[1];if(v[3]instanceof Date&&v[4]instanceof Date){s=v[3];t=v[4]}if(!(s instanceof Date)||isNaN(s))return;const start=new Date(s.getFullYear(),s.getMonth(),s.getDate()),dd=Math.round((start-d0)/864e5);if(dd>=-1&&dd<=30)vacs.push({name:r.fn,tab:r.tab||"",email,start:ds(start),end:t instanceof Date?ds(t):"",days:dd,status:st})})});
  return{probation:prob.sort((a,b)=>a.days-b.days),vacations:vacs.sort((a,b)=>a.days-b.days)}};
 window.SVODKA_VACPLAN=()=>{const now=new Date();now.setHours(0,0,0,0);let total=0,used=0,moved=0,up=0;const upRows=[],mvRows=[];
  (LASTRECS||[]).forEach(r=>{if(!r.vac||!r.vac.length)return;total++;let u=false,m=false,uu=null;
   r.vac.forEach(v=>{const st=norm(String(v[2]||""));let s=v[0],t=v[1];if(v[3]instanceof Date&&v[4]instanceof Date){s=v[3];t=v[4]}if(!(s instanceof Date)||isNaN(s))return;
    if(/перенес/.test(st)){m=true;return}if(/использ|отгулян|факт/.test(st)){u=true;return}
    if(t instanceof Date&&t<now)u=true;else if(s>=now&&(!uu||s<uu.s))uu={s,t}});
   if(u)used++;if(m){moved++;if(mvRows.length<5)mvRows.push(short(r.fn||""))}if(uu){up++;if(upRows.length<5)upRows.push([short(r.fn||""),uu.s,uu.t])}});
  return{total,used,moved,up,upRows,mvRows}};
}
