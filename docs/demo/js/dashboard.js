/* «Сводка» — панель, тема, палитры. Вынесено из index.html на Этапе 3 без изменения логики. */
document.addEventListener("click",e=>{const b=e.target.closest("[data-a],[data-add],[data-p],[data-pick],[data-src],[data-v],[data-q],[data-h],[data-hm],[data-hp],[data-stw]");if(!b)return;if(b.dataset.q!=null){const wid=String(b.dataset.q).split(":")[0];if(st.q!==b.dataset.q&&/^[a-z0-9_]{1,30}$/.test(wid)&&window.SVODKA_TELEMETRY)window.SVODKA_TELEMETRY.track("widget_open",{widget:wid});st.q=st.q==b.dataset.q?"":b.dataset.q;draw();return}if(b.dataset.stw){STW=b.dataset.stw==="table"?"table":"chart";try{localStorage.setItem("svodka_stw",STW)}catch(e){}draw();return}if(b.dataset.h){hist(b.dataset.h);return}if(b.dataset.hm){st.hm=b.dataset.hm;draw();return}if(b.dataset.hp){st.hp=b.dataset.hp;draw();return}if(b.dataset.src){if(window.SVODKA_SET_VIEW)window.SVODKA_SET_VIEW("connect");else{const ps=$("#ps");if(ps)ps.classList.add("on")}return}
 const c=b.closest("[data-id]"),id=c&&c.dataset.id,a=b.dataset.a;
 if(b.dataset.p){const nr=b.dataset.p;if(roleList().some(r=>r.id==nr)&&nr!=ROLED.role){rememberLayout();ROLED.role=nr;applyLayout(nr)}saveRoles();save();draw();if(window.SVODKA_UI&&window.SVODKA_UI.toast)window.SVODKA_UI.toast("Роль: "+roleOf(ROLED.role).name+". Экран роли сохранён отдельно.");return}
 else if(b.dataset.pick)st.pick=!st.pick;
 else if(b.dataset.v!=null){VF=VF==b.dataset.v?"":b.dataset.v;calcC()}
 else if(b.dataset.add){if(!canSee(b.dataset.add))return;st.hide=st.hide.filter(i=>i!=b.dataset.add);st.order=[...st.order.filter(i=>i!=b.dataset.add),b.dataset.add];st.pick=0}
 else if(a=="h")st.hide.push(id);
 else if(a=="m"){st.order=[id,...st.order.filter(i=>i!=id)]}
 else if(a=="l"||a=="r"){const v=st.order.filter(i=>!st.hide.includes(i)&&canSee(i)),j=v.indexOf(id),k=a=="l"?j-1:j+1;if(k<0||k>=v.length)return;
  const A=st.order.indexOf(id),B=st.order.indexOf(v[k]);[st.order[A],st.order[B]]=[st.order[B],st.order[A]]}
 else if(a=="pd"){st.pd=b.checked?1:0}
 else if(a=="rv"){st.pd=0}
 save();draw()});
$("#be").onclick=()=>{st.edit=!st.edit;draw()};
if($("#bs"))$("#bs").onclick=()=>{if(window.SVODKA_SET_VIEW)window.SVODKA_SET_VIEW("connect")};
const THEME_KEY="svodka_th";
const sysDark=()=>{try{return matchMedia("(prefers-color-scheme: dark)").matches}catch(e){return false}};
const themeGet=()=>{try{const v=localStorage.getItem(THEME_KEY);return v==="dark"||v==="light"?v:"auto"}catch(e){return "auto"}};
const themeEffective=()=>{const t=themeGet();return t==="auto"?(sysDark()?"dark":"light"):t};
const themePaint=()=>{const t=themeGet();if(t==="auto")R.removeAttribute("data-theme");else R.dataset.theme=t;
 const b=$("#theme-toggle");if(b){const dark=themeEffective()==="dark";b.textContent=dark?"☀️":"🌙";const label=dark?"Светлая тема":"Тёмная тема";b.title=label;b.setAttribute("aria-label",label)}
 document.querySelectorAll("[data-theme-set]").forEach(x=>x.classList.toggle("on",x.dataset.themeSet===t))};
const themeSet=v=>{try{if(v==="dark"||v==="light")localStorage.setItem(THEME_KEY,v);else localStorage.removeItem(THEME_KEY)}catch(e){}themePaint()};
window.SVODKA_THEME={get:themeGet,effective:themeEffective,set:themeSet,refresh:themePaint};
themePaint();
$("#theme-toggle")?.addEventListener("click",()=>themeSet(themeEffective()==="dark"?"light":"dark"));
try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",themePaint)}catch(e){}
const PALETTES=[{id:"violet",name:"Фиолетовая",color:"#3b4cdf"},{id:"blue",name:"Синяя",color:"#1d4ed8"},{id:"green",name:"Зелёная",color:"#15803d"},{id:"teal",name:"Бирюзовая",color:"#0f766e"},{id:"orange",name:"Тёплая оранжевая",color:"#c2410c"},{id:"graphite",name:"Графитовая",color:"#475569"}];
const PAL_KEY="svodka_palette";
let PAL="violet";try{const v=localStorage.getItem(PAL_KEY);if(PALETTES.some(p=>p.id===v))PAL=v}catch(e){}
R.dataset.palette=PAL;
window.SVODKA_PALETTE={get:()=>PAL,list:()=>PALETTES.slice(),set:v=>{PAL=PALETTES.some(p=>p.id===v)?v:"violet";R.dataset.palette=PAL;try{localStorage.setItem(PAL_KEY,PAL)}catch(e){}}};
if($("#bp"))$("#bp").onclick=()=>{try{window.print()}catch(e){}};
document.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.cp;if(!k||k=="spend")return;CP[k]=Math.max(0,+e.target.value||0);try{localStorage.setItem("svodka_cp",JSON.stringify(CP))}catch(x){}const o=$("#cpr");if(o)o.innerHTML=cres()});
document.addEventListener("change",e=>{const k=e.target.dataset&&e.target.dataset.cpf;if(k==null)return;if(e.target.checked){if(!CPF.includes(k))CPF.push(k)}else CPF=CPF.filter(x=>x!=k);saveCPF();draw()});
$("#up").onclick=()=>$("#fi").click();
