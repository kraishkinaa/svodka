/* «Сводка» — публичный API и запуск. Вынесено из index.html на Этапе 3 без изменения логики. */
window.SVODKA_APP={
 async ingestTabs(tabs,name){await ingest(tabs,name,0);draw();try{window.SVODKA_TS_SYNC&&window.SVODKA_TS_SYNC()}catch(e){}return{ok:true}},
 async ingestCandidates(a,name){await runC(a,name,0,1);draw();return{ok:true}},
 openFiles(){$("#fi").click()},
 demo(){$("#dm").click()},
 clear(){$("#cl").click()},
 draw,
 setPeriod(p){if([1,3,6,9,12].includes(+p)){$("#per").value=String(p);$("#per").dispatchEvent(new Event("change"))}},
 getSummary(){return{employees:(LASTRECS||[]).length,candidates:CAND.length,last:LAST?LAST[1]:null,has:!!(LASTRECS&&LASTRECS.length)}},
 exportState(){const o={};Object.keys(localStorage).filter(k=>k.startsWith("svodka")&&k!=="svodka_org").forEach(k=>o[k]=localStorage.getItem(k));return o},
 async importState(o){Object.keys(o||{}).filter(k=>/^svodka[\w]*$/.test(k)&&k!=="svodka_org").forEach(k=>localStorage.setItem(k,String(o[k])));location.reload()},
 hasTimeData(){try{return !!(window.TS&&window.TS.has())}catch(e){return false}}
};
window.SVODKA_INGEST_TABS=(tabs,name)=>window.SVODKA_APP.ingestTabs(tabs,name);

/* Сохранение исходных таблиц в зашифрованное хранилище организации.
 * Демо-данные не сохраняются: они генерируются при каждом запуске. */
let SVODKA_PERSIST_T=null;
window.SVODKA_PERSIST=()=>{
  try{
    if(!window.svodka||!window.svodka.records)return;
    if(SVODKA_PERSIST_T)clearTimeout(SVODKA_PERSIST_T);
    SVODKA_PERSIST_T=setTimeout(()=>{
      SVODKA_PERSIST_T=null;
      try{
        const staff=LAST&&LAST[1]!==DEMO?LAST:null;
        const candidates=LASTC&&LASTC[1]!==DEMO?LASTC:null;
        if(!staff&&!candidates)return;
        window.svodka.records.save({staff,candidates});
      }catch(e){}
    },800);
  }catch(e){}
};

document.addEventListener("input",e=>{if(!(e.target.dataset&&e.target.dataset.goal))return;GOAL=Math.max(0,+e.target.value||0);try{localStorage.setItem("svodka_goal",GOAL)}catch(x){}const o=$("#gs");if(o)o.innerHTML=gs()});
document.addEventListener("change",e=>{if(!(e.target.dataset&&e.target.dataset.rev!=null))return;REV=Math.max(0,+e.target.value||0);try{localStorage.setItem("svodka_revenue",REV)}catch(x){}draw()});
document.addEventListener("change",e=>{if(!(e.target.dataset&&e.target.dataset.pay!=null))return;const v=Math.max(0,Math.round(+String(e.target.value).replace(/\s/g,"").replace(",",".")||0));PAY_MANUAL=v;try{if(v>0)localStorage.setItem("svodka_payroll",String(v));else localStorage.removeItem("svodka_payroll")}catch(x){}draw()});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-pay-reset]");if(!b)return;PAY_MANUAL=0;try{localStorage.removeItem("svodka_payroll")}catch(x){}draw()});
document.addEventListener("change",async e=>{if(!(e.target.dataset&&e.target.dataset.hi!=null))return;const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(Array.isArray(j.hist)){const ok=j.hist.filter(x=>x&&/^\d{4}-\d{2}$/.test(x.m)&&isFinite(x.ta)&&isFinite(x.hc)).map(x=>({m:x.m,hc:+x.hc,ta:+x.ta,hr:+x.hr||0,fr:+x.fr||0,er:+x.er||0})),mp={};HIST.concat(ok).forEach(x=>mp[x.m]=x);HIST=Object.values(mp).sort((x,y)=>x.m<y.m?-1:1);try{localStorage.setItem("svodka_hist",JSON.stringify(HIST))}catch(x){}draw()}}catch(x){}});
document.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.ch;if(k==null)return;CHS[k]=Math.max(0,+e.target.value||0);try{localStorage.setItem("svodka_ch",JSON.stringify(CHS))}catch(x){}SRCS.slice(0,8).forEach((r,i)=>{const o=$("#cc"+i);if(o)o.textContent=chCost(r)});const o=$("#cpr");if(o)o.innerHTML=cres();const sp=$('[data-cp="spend"]');if(sp)sp.value=Math.round(chSpend())});
document.addEventListener("change",e=>{const k=e.target.dataset&&e.target.dataset.cpf;if(k==null)return;if(e.target.checked){if(!CPF.includes(k))CPF.push(k)}else CPF=CPF.filter(x=>x!==k);saveCPF();draw()});
$("#per").onchange=e=>{PER=+e.target.value;st.per=PER;save();try{if(LAST)ingest(LAST[0],LAST[1],1)}catch(x){}try{if(LASTC)runC(LASTC[0],LASTC[1],1)}catch(x){}};
document.addEventListener("change",e=>{if(e.target.dataset&&e.target.dataset.vf!=null){VF=e.target.value;calcC();draw()}});
document.addEventListener("change",e=>{if(!(e.target.dataset&&e.target.dataset.hm2!=null))return;const v=e.target.value;if(/^\d{4}-\d{2}$/.test(v)){st.hm=v;save();draw()}});
document.addEventListener("change",e=>{const d=e.target.dataset||{};if(d.hp!=null){if(["m","q","h","y"].includes(e.target.value)){st.hp=e.target.value;save();draw();return}}if(d.hy!=null){const y=+e.target.value,m=((st.hm||"").slice(5,7))||"01";if(y>=2000&&y<=2100){st.hm=y+"-"+m;save();draw()}}});
$("#snapshot-save")?.addEventListener("click",()=>{if(!LAST||LAST[1]==DEMO){alert("Сначала загрузите свой файл сотрудников. Демо-данные в историю не сохраняются.");return}hist("save");if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("Срез истории сохранён","ok")});
$("#snapshot-export")?.addEventListener("click",()=>hist("dl"));
$("#snapshot-import")?.addEventListener("click",()=>{const inp=document.createElement("input");inp.type="file";inp.accept=".json";inp.onchange=async()=>{const f=inp.files[0];if(!f)return;try{const j=JSON.parse(await f.text());let n=0;if(Array.isArray(j.snapshots)){const mp=Object.create(null);SNAPS.concat(j.snapshots).forEach(x=>{if(x&&/^\d{4}-\d{2}$/.test(x.m)){mp[x.m]=x;n++}});SNAPS=Object.values(mp).sort((a,b)=>a.m<b.m?-1:1);localStorage.setItem("svodka_snapshots",JSON.stringify(SNAPS))}if(Array.isArray(j.hist)){const mp=Object.create(null);HIST.concat(j.hist).forEach(x=>{if(x&&/^\d{4}-\d{2}$/.test(x.m))mp[x.m]=x});HIST=Object.values(mp).sort((a,b)=>a.m<b.m?-1:1);localStorage.setItem("svodka_hist",JSON.stringify(HIST))}draw();alert("Загружено месяцев истории: "+(n||HIST.length))}catch(x){alert("Не удалось прочитать файл истории")}};inp.click()});
window.SVODKA_SET_EDIT=v=>{st.edit=!!v;st.pick=0;draw()};
window.SVODKA_SHOW_HELP=id=>{st.edit=0;st.q=id;draw();setTimeout(()=>{const el=document.querySelector('#g [data-id="'+id+'"]');if(el&&el.scrollIntoView)el.scrollIntoView({block:"center",behavior:"smooth"})},60)};
window.SVODKA_ROLES_GET=()=>{const r=roleOf(ROLED.role);return{role:r.id,roleName:r.name,roleColor:r.color,base:r.base,allowed:ROLED.allowed.slice(),roles:roleList().map(x=>({id:x.id,name:x.name,color:x.color,base:x.base,custom:isCustomRole(x.id)})),widgets:Object.keys(WG).map(k=>({id:k,title:WG[k].t}))}};
window.SVODKA_ROLES_SET=x=>{if(!x||typeof x!="object")return;if(roleList().some(r=>r.id==x.role)&&x.role!=ROLED.role){rememberLayout();ROLED.role=x.role;applyLayout(x.role)}if(Array.isArray(x.allowed))ROLED.allowed=[...new Set(x.allowed.filter(k=>WG[k]))];saveRoles();save();draw();if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("Роли и доступ обновлены","ok")};
window.SVODKA_ROLES_ADD=x=>{const name=String((x&&x.name)||"").trim().replace(/\s+/g," ").slice(0,40);if(!name)throw new Error("Укажите название роли");const base=["owner","hrd","recruiter"].includes(x.base)?x.base:"recruiter";const color=/^#[0-9a-f]{6}$/i.test(x.color||"")?x.color:"#8b8f9a";if(ROLE_META.filter(r=>isCustomRole(r.id)).length>=12)throw new Error("Можно добавить до 12 своих ролей");const id="r_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);ROLE_META.push({id,name,color,base});saveRoleMeta();return id};
window.SVODKA_ROLES_RENAME=(id,name)=>{if(!isCustomRole(id))throw new Error("Встроенные роли не переименовываются");const m=ROLE_META.find(r=>r.id==id);if(!m)throw new Error("Роль не найдена");const n=String(name||"").trim().replace(/\s+/g," ").slice(0,40);if(!n)throw new Error("Пустое название");m.name=n;saveRoleMeta();draw()};
window.SVODKA_ROLES_COLOR=(id,color)=>{if(!/^#[0-9a-f]{6}$/i.test(color||""))throw new Error("Некорректный цвет");let m=ROLE_META.find(r=>r.id==id);if(!m){const b=BUILTIN_ROLES.find(x=>x.id==id);if(!b)throw new Error("Роль не найдена");m={id,name:b.name,color,base:b.base};ROLE_META.push(m)}m.color=color;saveRoleMeta();draw()};
window.SVODKA_ROLES_DEL=id=>{if(!isCustomRole(id))throw new Error("Встроенные роли нельзя удалить");ROLE_META=ROLE_META.filter(r=>r.id!=id);saveRoleMeta();delete LAYOUTS[id];saveLayouts();if(ROLED.role==id){ROLED.role="hrd";applyLayout("hrd")}saveRoles();save();draw()};

draw();
(async()=>{
  try{
    const saved=window.svodka&&window.svodka.records?await window.svodka.records.load():null;
    if(saved&&saved.staff&&saved.staff[0]){
      await ingest(saved.staff[0],saved.staff[1],1);
      if(saved.candidates&&saved.candidates[0])await runC(saved.candidates[0],saved.candidates[1],1);
      return;
    }
  }catch(e){}
  try{seedDemoVac();await ingest(genStaff(),DEMO,1);await runC(genCand(),DEMO,1);seedDemoTimesheet()}catch(e){}
})();
