/* «Сводка» — импорт Excel/CSV/XML и разбор таблиц. Вынесено из index.html на Этапе 3 без изменения логики. */
const MN=["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],ec=s=>String(s).replace(/[<>&"']/g,"");
const KEYS=SvodkaImport.KEYS;
const pd=SvodkaImport.pd,pd1=SvodkaImport.pd1;

const topN=(m,n)=>{const a=Object.entries(m).sort((x,y)=>y[1]-x[1]),t=a.slice(0,n-1),r=a.slice(n-1).reduce((s,x)=>s+x[1],0);if(r)t.push(["Прочее",r]);return t};
const norm=s=>String(s).toLowerCase().replace(/ё/g,"е").replace(/\s+/g," ").trim(),short=s=>{const p=String(s).trim().split(/\s+/);return p[0]+(p.length>1?" "+p.slice(1).map(x=>x[0].toUpperCase()+".").join(" "):"")};
const periods=v=>{const s=v instanceof Date?"":String(v),o=[],re=/(\d{1,2})[.,\/](\d{1,2})[.,\/](\d{4})\s*[-–—]\s*(\d{1,2})[.,\/](\d{1,2})[.,\/](\d{4})/g;let m;while((m=re.exec(s)))o.push([new Date(+m[3],m[2]-1,+m[1]),new Date(+m[6],m[5]-1,+m[4])]);return o};
const sheetRows=ws=>{(ws["!merges"]||[]).forEach(m=>{if((m.e.r-m.s.r+1)*(m.e.c-m.s.c+1)>5000)return;const c0=ws[XLSX.utils.encode_cell(m.s)];if(!c0)return;for(let r=m.s.r;r<=m.e.r;r++)for(let c=m.s.c;c<=m.e.c;c++)if(r!=m.s.r||c!=m.s.c){const k=XLSX.utils.encode_cell({r,c});if(!ws[k])ws[k]={t:c0.t,v:c0.v,w:c0.w}}});
 let mr=0,mc=0;Object.keys(ws).forEach(k=>{if(k[0]=="!")return;const d=XLSX.utils.decode_cell(k);if(d.r>mr)mr=d.r;if(d.c>mc)mc=d.c});ws["!ref"]=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:Math.min(mr,49999),c:mc}});
 const o=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:""}).map(r=>{let n=r.length;while(n&&!String(r[n-1]).trim())n--;return r.slice(0,n)});o.trunc=mr>49999;return o};
const HOW=SvodkaImport.HOW;
const NMISS=SvodkaImport.NMISS;
async function ingest(tabs,name,q){if(!q&&window.SVODKA_LICENSE&&window.SVODKA_LICENSE.readonly()){const o=document.getElementById("fs");if(o)o.innerHTML="<span class=\"tag\">Подписка закончилась: импорт недоступен. Доступны просмотр и экспорт.</span>";if(window.SVODKA_UI)window.SVODKA_UI.toast("Подписка закончилась: импорт недоступен","bad");return}const out=q?{}:$("#fs"),recs=[],byId=new Map(),byFio=new Map(),cols={},info=[];let nVac=0,dup=0;
 const SHR=[];
 tabs.forEach((t,ti)=>{const a=t.a;let hi=-1;
  const scan=r=>{const m={};r.forEach((c,j)=>{const s=String(c),k=KEYS.find(k=>m[k[0]]==null&&k[1].test(s));if(k&&s.length<90)m[k[0]]=j});return m};
  for(let i=0;i<Math.min(a.length,40);i++){if(Object.keys(scan(a[i])).length>=2){hi=i;break}}
  if(hi<0){info.push(ec(t.n)+": заголовки не найдены, лист пропущен");return}
  let he=hi,ds=hi+1;for(let k=hi+1;k<=hi+4&&k<a.length;k++){const ne=a[k].filter(x=>String(x).trim());if(!ne.length)continue;if(ne.length>=3&&ne.every(x=>/^\d{1,2}$/.test(String(x).trim()))){ds=k+1;break}if(ne.some(x=>pd(x)||/^\d+([.,]\d+)?$/.test(String(x).trim())))break;he=k;ds=k+1}
  const W=Math.max(...a.slice(hi,he+1).map(r=>r.length)),hd=[];for(let j=0;j<W;j++){const p=[];for(let k=hi;k<=he;k++){const s=String(a[k][j]??"").replace(/\s+/g," ").trim();if(s&&!p.includes(s))p.push(s)}hd.push(p.join(" "))}
  const mp=scan(hd);
  if(mp.ft!=null&&mp.dep!=null&&mp.pos!=null){info.push(ec(t.n)+": штатное расписание: "+["dep","pos","ft","sal"].filter(k=>mp[k]!=null).map(k=>ec(hd[mp[k]])+" — "+HOW[k]).join("; ")+(mp.sal!=null?"":"; оклады не найдены"));
   for(const r of a.slice(ds)){if(r.some(x=>/^\s*итого/i.test(String(x))))continue;{const ne=r.filter(x=>String(x).trim());if(ne.length>=3&&ne.every(x=>/^\d{1,2}$/.test(String(x).trim())))continue}const n=parseFloat(String(r[mp.ft]).replace(",","."));const d=String(r[mp.dep]).trim(),p=String(r[mp.pos]).trim();let sal=0;if(mp.sal!=null){sal=parseFloat(String(r[mp.sal]).replace(/\s/g,"").replace(",","."));if(!(sal>0))sal=0}if(n>0&&d&&p)SHR.push({d:ec(d),p:ec(p),n,sal})}
   cols.shr=1;return}
  Object.keys(mp).forEach(k=>cols[k]=1);
  info.push(ec(t.n)+": "+Object.keys(mp).map(k=>ec(hd[mp[k]])+" — "+HOW[k]).join("; "));
  const isV=mp.vr!=null||(mp.vs!=null&&mp.ve!=null),hasKey=mp.id!=null||mp.fio!=null;
  for(const r of a.slice(ds)){if(!r.some(x=>String(x).trim()))continue;
   const ne=r.filter(x=>String(x).trim());if(ne.length>=3&&ne.every(x=>/^\d{1,2}$/.test(String(x).trim())))continue;
   if(r.some(x=>/^\s*итого/i.test(String(x))))continue;
   const id=mp.id!=null?String(r[mp.id]??"").trim():"",fio=mp.fio!=null?norm(r[mp.fio]??""):"";
   if(hasKey&&!id&&!fio)continue;
   let rec=(id&&byId.get(id))||(fio&&byFio.get(fio));
   if(rec&&!isV&&rec.t.has(ti))dup++;
   if(!rec){rec={t:new Set()};recs.push(rec)}
   if(!isV)rec.nv=1;rec.t.add(ti);if(id)byId.set(id,rec);if(fio)byFio.set(fio,rec);
   const put=(f,v)=>{if(rec[f]==null||rec[f]==="")rec[f]=v};
   if(mp.hire!=null)put("hire",pd(r[mp.hire]));if(mp.fire!=null)put("fire",pd(r[mp.fire]));if(mp.bd!=null)put("bd",pd(r[mp.bd]));
   if(mp.age!=null){const v=parseFloat(String(r[mp.age]).replace(",","."));if(v>0)put("age",v)}
   if(mp.sex!=null){const s=String(r[mp.sex]);put("sex",/^\s*м/i.test(s)?"М":/^\s*ж/i.test(s)?"Ж":"")}
   ["dep","dpt","dir","grp"].forEach(k=>{if(mp[k]!=null)put(k,ec(String(r[mp[k]]).trim()))});
   if(mp.why!=null)put("why",ec(String(r[mp.why]).trim()));if(mp.pos!=null)put("pos",ec(String(r[mp.pos]).trim()));
   if(mp.sal!=null){const v=parseFloat(String(r[mp.sal]).replace(/\s/g,"").replace(",","."));if(v>0)put("sal",v)}
   if(window.SVODKA_DESKTOP){if(mp.fio!=null)put("fn",ec(String(r[mp.fio]).trim()));if(id)put("tab",ec(id))}
   if(mp.ssrc!=null)put("ssrc",ec(sn(r[mp.ssrc])));if(mp.fio!=null)put("nm",ec(short(r[mp.fio])));
   if(mp.em!=null)put("email",ec(String(r[mp.em]||"").trim().slice(0,120)));
   if(mp.phone!=null)put("phone",ec(String(r[mp.phone]||"").trim().slice(0,40)));
   if(mp.acct!=null){const s=String(r[mp.acct]||"");if(/кварт/i.test(s))put("acct","quarter");else if(/год/i.test(s))put("acct","year");else if(/мес/i.test(s))put("acct","month")}
   if(isV){let ps=mp.vr!=null?periods(r[mp.vr]):[];
    if(!ps.length&&mp.vr!=null){const s=pd(r[mp.vr]),dd=mp.vd!=null?parseFloat(String(r[mp.vd]).replace(",",".")):0;if(s&&dd>0)ps=[[s,new Date(s.getTime()+(dd-1)*864e5)]]}
    if(mp.vs!=null&&mp.ve!=null){const s=pd(r[mp.vs]),e=pd(r[mp.ve]);if(s&&e&&e>=s)ps.push([s,e])}
    const vst=mp.vst!=null?String(r[mp.vst]??"").trim():"",vas=mp.vas!=null?pd(r[mp.vas]):null,vae=mp.vae!=null?pd(r[mp.vae]):null;
    ps.forEach(v=>{(rec.vac=rec.vac||[]).push([v[0],v[1],vst,vas,vae]);nVac++})}
  }});
 if(!recs.length){out.innerHTML=`<span class="tag">Не нашёл таблицу с сотрудниками. Нужны заголовки колонок, например «ФИО», «Дата приема», «Подразделение».</span>${info.length?"<p style='color:var(--mut)'>"+info.join("<br>")+"</p>":""}`;return}
 LAST=[tabs,name];LASTRECS=recs.slice();DEMO_SRC.staff=(name===DEMO);DEMO_SRC.leave=(name===DEMO);
 HAS={hire:!!cols.hire,fire:!!cols.fire,dep:!!(cols.dep||cols.dpt||cols.dir||cols.grp),shr:SHR.length>0,bd:!!(cols.bd||cols.age),sex:!!cols.sex,why:!!cols.why,sal:!!cols.sal||SHR.some(x=>x.sal>0),vac:nVac>0,name:!!cols.fio,email:!!cols.em,acct:!!cols.acct};
 const now=new Date(),end=new Date(now.getTime()+864e5),ms=[];for(let i=11;i>=0;i--)ms.push(new Date(now.getFullYear(),now.getMonth()-i,1));
 const E=HAS.hire?recs.filter(r=>r.hire).map(r=>({hire:r.hire,fire:HAS.fire?r.fire||null:null,bd:r.bd||null,age:r.age||0,sex:r.sex||"",dep:HAS.dep?(r.dep||r.dpt||r.dir||r.grp||"Без отдела"):"Все",unit:norm(r.grp||r.dep||r.dpt||r.dir||""),why:r.why||"",sal:r.sal||NaN,nm:r.nm||"",pos:r.pos||"",src:r.ssrc||""})):[];
 DQ=[];if(tabs.some(t=>t.a&&t.a.trunc))DQ.push("Одна из таблиц длиннее 50 000 строк, лишние строки не прочитаны");const nh=HAS.hire?recs.filter(r=>r.nv&&!r.hire).length:0,nvo=HAS.hire&&HAS.vac?recs.filter(r=>r.vac&&!r.nv).length:0;
 if(nh)DQ.push(nh+" записей без даты приёма пропущены при расчёте");if(nvo&&recs.some(r=>r.nv))DQ.push(nvo+" сотрудников из графика отпусков не найдены в списке сотрудников (проверьте написание ФИО)");if(dup)DQ.push(dup+" повторов строк внутри одной таблицы объединены");
 {const x1=E.filter(e=>e.fire&&e.fire<e.hire).length,x2=HAS.dep?E.filter(e=>e.dep=="Без отдела").length:0,x3=E.filter(e=>e.bd&&((e.hire-e.bd)/315576e5<16||(now-e.bd)/315576e5>80)).length;const ns=HAS.sex?E.filter(e=>(!e.fire||e.fire>now)&&!e.sex).length:0;if(ns)DQ.push(ns+" действующих сотрудников без указания пола (в доли не входят)");if(x1)DQ.push(x1+" сотрудников с датой увольнения раньше даты приёма");if(x2)DQ.push(x2+" сотрудников без подразделения");if(x3)DQ.push(x3+" сотрудников с неправдоподобным возрастом")}
 const act=(e,d)=>e.hire<=d&&(!e.fire||e.fire>d),cnt=(L,d)=>L.filter(e=>act(e,d)).length,t0=new Date(now.getFullYear(),now.getMonth()-PER,now.getDate()),cur=cnt(E,now);
 SH=null;
 if(HAS.shr||(HAS.dep&&HAS.hire)){
  const UF=HAS.hire?E.filter(e=>act(e,now)):[];
  const staffBy=Object.create(null),posMap=Object.create(null),salAgg={sum:0,units:0};
  SHR.forEach(x=>{const k=norm(x.d);(staffBy[k]=staffBy[k]||{d:x.d,n:0}).n+=x.n;(posMap[norm(x.p)]=posMap[norm(x.p)]||[]).push(k);if(x.sal>0){salAgg.sum+=x.sal*x.n;salAgg.units+=x.n}});
  const rows=new Map();
  const rowOf=d=>{let r=rows.get(d);if(!r){r={d,f:0,n:0,um:0,ms:new Set()};rows.set(d,r)}return r};
  UF.forEach(e=>{
   const d=e.dep||"Без подразделения",r=rowOf(d);r.f++;
   let k=staffBy[norm(d)]?norm(d):(staffBy[e.unit]?e.unit:null);
   if(!k){const c=(posMap[norm(e.pos||"")]||[]).filter(x=>staffBy[x]).sort((a2,b2)=>staffBy[b2].n-staffBy[a2].n)[0];if(c)k=c}
   if(k){if(!r.ms.has(k)){r.ms.add(k);r.n+=staffBy[k].n}}else r.um++;
  });
  if(!rows.size)SHR.forEach(x=>{rowOf(x.d).n+=x.n});
  const used=new Set();rows.forEach(r=>r.ms.forEach(k=>used.add(k)));
  const seen=new Set(),extra=[];SHR.forEach(x=>{const k=norm(x.d);if(used.has(k)||seen.has(k))return;seen.add(k);extra.push(x)});
  if(extra.length){const r=rowOf("Вакансии вне таблицы");extra.forEach(x=>r.n+=x.n)}
  const rw=[...rows.values()].sort((a2,b2)=>b2.f-a2.f||b2.n-a2.n).map(r=>({d:r.d,n:r.n,f:r.f,um:r.um}));
  const hasN=SHR.length>0;
  SH={hasStaff:hasN,m2:0,deps:rw.length,n:hasN?rw.reduce((s2,x)=>s2+x.n,0):null,f:HAS.hire?rw.reduce((s2,x)=>s2+x.f,0):null,vac:hasN&&HAS.hire?rw.reduce((s2,x)=>s2+Math.max(0,x.n-x.f),0):null,um:rw.reduce((s2,x)=>s2+x.um,0),tot:UF.length,salMonth:salAgg.units?Math.round(salAgg.sum/salAgg.units):0,rows:rw};
 }
 const tv=(L,s,e2)=>{const av=(cnt(L,s)+cnt(L,e2))/2;return av?L.filter(e=>e.fire&&e.fire>=s&&e.fire<e2).length/av*100:0};
 const fr=E.filter(e=>e.fire&&e.fire>=t0&&e.fire<=now),hr=E.filter(e=>e.hire>=t0&&e.hire<=now),T=tv(E,t0,end);TURN_PERIOD=T;
 M=ms.map(d=>MN[d.getMonth()]);V=ms.map((d,i)=>+tv(E,d,i<11?ms[i+1]:end).toFixed(1));
 DEP=[...new Set(E.map(e=>e.dep))].map(d=>{const L=E.filter(e=>e.dep==d),n=Math.max(cnt(L,t0),cnt(L,now));return[d,cur>=80&&n<5?null:+tv(L,t0,end).toFixed(1)]}).sort((x,y)=>(y[1]??-1)-(x[1]??-1)).slice(0,8);
 if(name===DEMO){const df=PER/12;DEP=[["Продажи",24*df],["Склад",24*df],["Юристы",24*df],["Поддержка",23*df],["IT",22*df],["Бухгалтерия",21*df]].map(([d,v])=>[d,+v.toFixed(1)])}
 const ag=e=>e.bd?(now-e.bd)/315576e5:e.age,ac=E.filter(e=>act(e,now)&&(e.bd||e.age>0));
 if(HAS.bd&&ac.length<5){HAS.bd=false;DQ.push("Для расчёта возраста данных меньше 5 человек")}
 if(HAS.bd){const g={"до 25":0,"25–34":0,"35–44":0,"45+":0};ac.forEach(e=>{const y=ag(e);g[y<25?"до 25":y<35?"25–34":y<45?"35–44":"45+"]++});AGE=Object.entries(g);for(let i=0;i<AGE.length;i++){if(AGE[i][1]>0&&AGE[i][1]<5){const j=i<AGE.length-1?i+1:i-1;if(AGE[j]&&AGE[j][1]>0){AGE[j]=[i<j?AGE[i][0]+" и "+AGE[j][0]:AGE[j][0]+" и "+AGE[i][0],AGE[j][1]+AGE[i][1]];AGE[i]=[AGE[i][0],0]}}}AGE=AGE.filter(x=>x[1]>0);AVG=(ac.reduce((s,e)=>s+ag(e),0)/ac.length).toFixed(1).replace(".",",")}
 const ax=E.filter(e=>act(e,now)&&e.sex),nm=ax.filter(e=>e.sex=="М").length;
 if(HAS.sex&&(ax.length<5||nm<5||ax.length-nm<5)){HAS.sex=false;DQ.push("Для расчёта по полу данных или одной из групп меньше 5 человек")}
 if(HAS.sex){SEX=[["Мужчины",nm],["Женщины",ax.length-nm]];WP=Math.round((ax.length-nm)/ax.length*100)}
 if(HAS.bd&&HAS.sex){const rb=ac.filter(e=>e.sex),c5=[0,0,0,0,0];rb.forEach(e=>{const l=(e.sex=="Ж"?60:65)-ag(e);c5[l<=0?0:l<=1?1:l<=3?2:l<=5?3:4]++});if(rb.length>=5)RET=[["Уже достигли",c5[0]],["В течение года",c5[1]],["Через 1–3 года",c5[2]],["Через 3–5 лет",c5[3]]];else HAS.sex=false}
 const wm={};fr.filter(e=>e.why).forEach(e=>wm[e.why]=(wm[e.why]||0)+1);
 if(Object.values(wm).reduce((s,x)=>s+x,0)>=5){WHY=topN(wm,4);const big=WHY.filter(x=>x[1]>=5||x[0]=="Прочее"),sm=WHY.filter(x=>x[1]<5&&x[0]!="Прочее").reduce((s,x)=>s+x[1],0);if(sm){const q=big.find(x=>x[0]=="Прочее");if(q)q[1]+=sm;else big.push(["Прочее",sm])}WHY=big}else WHY=[["Меньше 5 увольнений за период",1]];
 const sl=E.filter(e=>act(e,now)&&e.sal>0).map(e=>e.sal).sort((x,y)=>x-y),er=fr.filter(e=>(e.fire-e.hire)/864e5<90).length;
 TOT=cur;const pS=new Date(now.getFullYear(),now.getMonth()-2*PER,now.getDate()),Tp=tv(E,pS,t0),hp=E.filter(e=>e.hire>=pS&&e.hire<t0).length,fp=E.filter(e=>e.fire&&e.fire>=pS&&e.fire<t0).length,c0=cnt(E,t0),sg=n=>(n>0?"+":n<0?"−":"")+Math.abs(n),dT=T-Tp;TA=T*12/PER;TA_SHOW=TA;
 K=[[String(cur),"Численность",sg(cur-c0)+" к прошлому периоду",2]];
 if(HAS.fire)K.push([T.toFixed(1).replace(".",",")+"%","Текучесть за "+PL[PER],(dT>0?"+":dT<0?"−":"")+Math.abs(dT).toFixed(1).replace(".",",")+" п.п. к прошлому периоду",dT<=0?1:0]);
 K.push([String(hr.length),"Принято за "+PL[PER],sg(hr.length-hp)+" к прошлому периоду",2]);
 if(HAS.fire){K.push([String(fr.length),"Уволено за "+PL[PER],sg(fr.length-fp)+" к прошлому периоду",fr.length<=fp?1:0]);K.push([String(er),"Ушли до 90 дней",(hr.length?Math.round(er/hr.length*100):0)+"% от принятых",0])}
 if(SH&&SH.hasStaff&&SH.n>0)K.push([staffPct()+"%","Укомплектованность",SH.f+" из "+String(SH.n).replace(".",","),2]);
 if(name===DEMO){TA_SHOW=23.3;const pf=PER/12,hi=Math.round(22*pf),fi=Math.round(10*pf),ea=Math.max(0,Math.round(1*pf)),tr=+(23.3*pf).toFixed(1),dt=+(-13.9*pf).toFixed(1),hd=Math.round(12*pf),hpd=Math.round(12*pf),fpd=-Math.round(6*pf);K=[[String(cur),"Численность",(hd>0?"+":"")+hd+" за "+PL[PER],2],[tr.toFixed(1).replace(".",",")+"%","Текучесть за "+PL[PER],(dt>0?"+":dt<0?"−":"")+Math.abs(dt).toFixed(1).replace(".",",")+" п.п. к прошлому периоду",dt<=0?1:0],[String(hi),"Принято за "+PL[PER],(hpd>=0?"+":"")+hpd+" к прошлому периоду",1],[String(fi),"Уволено за "+PL[PER],(fpd<0?"−":"+")+Math.abs(fpd)+" к прошлому периоду",1],[String(ea),"Ушли до 90 дней",(hi?Math.round(ea/hi*100):0)+"% от принятых",0],[staffPct()==null?"—":staffPct()+"%","Укомплектованность",SH&&SH.n?SH.f+" из "+String(SH.n).replace(".",","):"нет штатного расписания",2]]}
 SN=HAS.fire?{hc:cur,ta:+TA.toFixed(1),hr:hr.length,fr:fr.length,er}:null;DIS12=HAS.fire?fr.length:null;HN=hr.length;QC=Object.create(null);
 if(HAS.fire)E.filter(e=>e.src&&e.hire<=new Date(now.getTime()-90*864e5)).forEach(e=>{const o=QC[e.src]||(QC[e.src]=[0,0]);o[0]++;if(!e.fire||(e.fire-e.hire)/864e5>=90)o[1]++});
 HM={vac:[],n:Object.create(null)};if(HAS.vac){const cd=Object.create(null),dv=Object.create(null);E.filter(e=>act(e,now)).forEach(e=>{cd[e.dep]=(cd[e.dep]||0)+1});recs.forEach(r=>{(r.vac||[]).forEach(v=>{const d=HAS.dep?(r.dep||r.dpt||r.dir||r.grp||"Без отдела"):"Все";HM.vac.push([d,v[0],v[1]]);(dv[d]=dv[d]||new Set()).add(r)})});Object.keys(dv).forEach(d=>HM.n[d]=Math.max(cd[d]||0,dv[d].size))}
 PRB=[];if(HAS.name&&HAS.hire){const lo=new Date(now.getTime()-7*864e5),hi2=new Date(now.getTime()+30*864e5);E.filter(e=>!e.fire||e.fire>now).forEach(e=>{const d=new Date(e.hire.getFullYear(),e.hire.getMonth()+3,e.hire.getDate());if(d>=lo&&d<=hi2)PRB.push([e.nm,e.pos,d])});PRB.sort((x,y)=>x[2]-y[2])}
 LV=[];LVO=0;if(HAS.vac&&HAS.name){const w2=new Date(now.getTime()+90*864e5);recs.forEach(r=>(r.vac||[]).forEach(v=>{if(v[1]>=now&&v[0]<=w2)LV.push([r.nm||"—",r.dep||"",v[0],v[1]])}));LV.sort((x,y)=>x[2]-y[2]);for(let i=0;i<LV.length;i++)for(let j=i+1;j<LV.length;j++)if(LV[i][1]&&LV[i][1]==LV[j][1]&&LV[i][2]<=LV[j][3]&&LV[j][2]<=LV[i][3])LVO++}
 MISS=NMISS.filter(n=>!HAS[n[0]]&&!(n[0]=="bd"&&cols.bd||n[0]=="sex"&&cols.sex)).map(n=>(n[0]=="vac"?"Нет ":"Нет колонки ")+n[1]+": не работает "+n[2]+".");
 const cloud={headcount:cur,hired:hr.length,dismissed:HAS.fire?fr.length:null,turnoverByMonth:HAS.fire?V:null,departments:HAS.dep?DEP:null,age:HAS.bd?AGE:null,sex:HAS.sex?SEX:null,reasons:HAS.why?WHY:null};
 out.innerHTML=`<span class="tag">В расчёте ${E.length} сотрудников, периодов отпусков: ${nVac}</span><details><summary>Как распознано и обезличено</summary><p style="color:var(--mut)">${info.join("<br>")}</p></details><details><summary>Что уйдёт в облако</summary><pre>${JSON.stringify(cloud,null,1)}</pre></details>${DQ.length?`<details open><summary>Проверка данных</summary><p style="color:var(--bad)">${DQ.join("; ")}</p></details>`:""}${MISS.length?`<details open><summary>Чего не хватает</summary><p style="color:var(--bad)">${MISS.join("<br>")}</p></details>`:""}`;
 const _co=(()=>{try{return (localStorage.getItem("svodka_company")||"").trim()}catch(e){return""}})();
  $("#sb").textContent=_co?`${_co} · ${name==DEMO?"демонстрационные данные":"обработано локально"}`:(name==DEMO?"ООО «Демо» · демонстрационные данные":`Файлы: ${name} · обработано локально`);
 if(!q&&name!=DEMO){UP.staff=Date.now();if(nVac)UP.leave=Date.now();saveUP();try{saveSnapshot(true)}catch(e){}}try{window.SVODKA_EMP_APPLY&&window.SVODKA_EMP_APPLY()}catch(e){}draw();try{window.SVODKA_REFRESH_BADGES&&window.SVODKA_REFRESH_BADGES()}catch(e){}try{const n=window.SVODKA_TS_SYNC&&window.SVODKA_TS_SYNC();if(n&&window.SVODKA_UI)window.SVODKA_UI.toast("В табель добавлено сотрудников: "+n,"ok")}catch(e){}try{const v=window.TS&&window.TS.syncVacations&&window.TS.syncVacations();if(v&&v.days&&window.SVODKA_UI)window.SVODKA_UI.toast("Отпуска из графика подставлены в табель: "+v.days+" дн.","ok")}catch(e){}try{window.SVODKA_PERSIST&&window.SVODKA_PERSIST()}catch(e){}}
const readTabs=async f=>{const buf=await f.arrayBuffer();let wb;
 if(/\.csv$/i.test(f.name)){let t;try{t=new TextDecoder("utf-8",{fatal:true}).decode(buf)}catch(e){t=new TextDecoder("windows-1251").decode(buf)}wb=XLSX.read(t,{type:"string",cellDates:true,FS:/;/.test(t.split("\n")[0])?";":undefined})}
 else if(/\.xml$/i.test(f.name)){let t;try{t=new TextDecoder("utf-8",{fatal:true}).decode(buf)}catch(e){t=new TextDecoder("windows-1251").decode(buf)}if(!/<\?xml|<\w+:?Workbook|<Table|<table/i.test(t))throw new Error("Файл «"+f.name+"» не похож на табличную XML-выгрузку");wb=XLSX.read(t,{type:"string",cellDates:true})}
 else wb=XLSX.read(buf,{type:"array",cellDates:true});
 return wb.SheetNames.filter(n=>!/инструкц|readme|справк|описан/i.test(n)).map(n=>({n:ec(f.name)+(wb.SheetNames.length>1?" / "+ec(n):""),a:sheetRows(wb.Sheets[n])}))};
const ld=async fl=>{const out=$("#fs");if(typeof XLSX=="undefined"){out.innerHTML=`<span class="tag">Не загрузилась библиотека чтения Excel. Проверьте интернет или подключите её локально (см. README).</span>`;return}
 out.innerHTML=`<span class="tag">Читаю файлы…</span>`;try{const all=[];for(const f of fl){if(f.size>25e6){out.innerHTML=`<span class="tag">Файл «${ec(f.name)}» больше 25 МБ, он не загружен.</span>`;return}all.push(...await readTabs(f))}
  const cs=all.filter(t=>cmap(t.a)),rest=all.filter(t=>!cmap(t.a)&&t.a.length>1);
  if(rest.length){rest.forEach(t=>{ACC=ACC.filter(x=>x.n!=t.n);ACC.push(t)});await ingest(ACC,ACC.map(t=>t.n).join(", "))}
  if(cs.length)await runC(cs[0].a,cs[0].n,0,rest.length>0)}catch(e){out.innerHTML=`<span class="tag">Не удалось прочитать файл: ${ec(e.message)}</span>`}};
$("#fi").onchange=e=>{const f=[...e.target.files];if(f.length)ld(f)};
