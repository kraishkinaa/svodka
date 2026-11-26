/* «Сводка» — демонстрационные данные. Вынесено из index.html на Этапе 3 без изменения логики. */
const DEMO_BASE=[
 {fio:"Иванов Иван Иванович",sex:"М",dep:"Продажи",pos:"Менеджер по продажам",email:"ivanov.ivan@demo.ru"},
 {fio:"Петрова Анна Сергеевна",sex:"Ж",dep:"Бухгалтерия",pos:"Бухгалтер",email:"petrova.anna@demo.ru"},
 {fio:"Сидоров Пётр Алексеевич",sex:"М",dep:"IT",pos:"Разработчик 1С",email:"sidorov.petr@demo.ru"},
 {fio:"Кузнецова Мария Олеговна",sex:"Ж",dep:"Склад",pos:"Кладовщик",email:"kuznecova.maria@demo.ru"},
 {fio:"Смирнов Алексей Николаевич",sex:"М",dep:"Поддержка",pos:"Оператор поддержки",email:"smirnov.alexey@demo.ru"},
 {fio:"Попова Елена Дмитриевна",sex:"Ж",dep:"Юристы",pos:"Юрист",email:"popova.elena@demo.ru"},
 {fio:"Васильев Дмитрий Андреевич",sex:"М",dep:"IT",pos:"Системный администратор",email:"vasilev.dmitry@demo.ru"},
 {fio:"Соколова Ольга Михайловна",sex:"Ж",dep:"Бухгалтерия",pos:"Бухгалтер",email:"sokolova.olga@demo.ru"},
 {fio:"Михайлов Сергей Павлович",sex:"М",dep:"Склад",pos:"Грузчик",email:"mihaylov.sergey@demo.ru"},
 {fio:"Новикова Татьяна Владимировна",sex:"Ж",dep:"Поддержка",pos:"Оператор поддержки",email:"novikova.tatyana@demo.ru"},
 {fio:"Фёдоров Андрей Игоревич",sex:"М",dep:"Продажи",pos:"Старший менеджер",email:"fedorov.andrey@demo.ru"},
 {fio:"Морозова Ирина Алексеевна",sex:"Ж",dep:"Продажи",pos:"Менеджер по продажам",email:"morozova.irina@demo.ru"},
 {fio:"Волков Николай Сергеевич",sex:"М",dep:"Склад",pos:"Кладовщик",email:"volkov.nikolay@demo.ru"},
 {fio:"Алексеева Светлана Петровна",sex:"Ж",dep:"Продажи",pos:"Менеджер по продажам",email:"alekseeva.svetlana@demo.ru"},
 {fio:"Лебедев Артём Олегович",sex:"М",dep:"IT",pos:"Разработчик 1С",email:"lebedev.artem@demo.ru"}];
/* Демо-компания: размеры подразделений 15, 10, 7, 7, 3 и 1 человек.
   Возраст и пол распределены по группам, текучесть за год убывает с ~11% до ~5% в месяц. */
const DEMO_DEPTS=[["Продажи",15],["Склад",10],["Поддержка",7],["IT",7],["Бухгалтерия",3],["Юристы",1]];
const DEMO_POS={Продажи:["Менеджер по продажам","Старший менеджер","Руководитель отдела продаж"],Склад:["Кладовщик","Грузчик","Заведующий складом"],Поддержка:["Оператор поддержки","Старший оператор","Руководитель поддержки"],IT:["Разработчик 1С","Системный администратор","Тестировщик","Руководитель IT"],Бухгалтерия:["Бухгалтер","Главный бухгалтер"],Юристы:["Юрист"]};
const DEMO_M_SUR=["Иванов","Петров","Сидоров","Кузнецов","Смирнов","Попов","Васильев","Соколов","Михайлов","Новиков","Фёдоров","Морозов","Волков","Алексеев","Лебедев","Зайцев","Киселёв","Егоров","Павлов","Козлов","Степанов","Николаев","Орлов","Андреев","Макаров","Никитин","Захаров","Гусев","Тарасов","Беляев","Комаров","Куликов","Крылов","Борисов","Громов","Фролов","Власов","Тихонов","Сергеев"];
const DEMO_F_SUR=["Иванова","Петрова","Сидорова","Кузнецова","Смирнова","Попова","Васильева","Соколова","Михайлова","Новикова","Фёдорова","Морозова","Волкова","Алексеева","Лебедева","Зайцева","Киселёва","Егорова","Павлова","Козлова","Степанова","Николаева","Орлова","Андреева","Макарова","Никитина","Захарова","Гусева","Тарасова","Беляева","Комарова","Куликова","Крылова","Борисова","Громова","Фролова","Власова","Тихонова","Сергеева"];
const DEMO_M_NAMES=["Иван","Пётр","Алексей","Дмитрий","Сергей","Андрей","Николай","Артём","Михаил","Александр","Владимир","Павел","Максим","Роман","Егор","Кирилл","Антон","Олег","Виктор","Григорий"];
const DEMO_F_NAMES=["Анна","Мария","Ольга","Елена","Татьяна","Ирина","Светлана","Наталья","Екатерина","Юлия","Александра","Ксения","Дарья","Алина","Полина","Вера","Людмила","Галина","Нина","Валентина"];
const DEMO_M_PAT=["Иванович","Петрович","Алексеевич","Сергеевич","Андреевич","Николаевич","Дмитриевич","Михайлович","Александрович","Владимирович","Павлович","Максимович","Романович","Егорович","Кириллович","Антонович","Олегович","Викторович","Григорьевич","Борисович"];
const DEMO_F_PAT=["Ивановна","Петровна","Алексеевна","Сергеевна","Андреевна","Николаевна","Дмитриевна","Михайловна","Александровна","Владимировна","Павловна","Максимовна","Романовна","Егоровна","Кирилловна","Антоновна","Олеговна","Викторовна","Григорьевна","Борисовна"];
const DEMO_WHY=["Зарплата","Руководитель","Рост","Переезд"];
const DEMO_AGES=[22,23,24,22,23,24,22,26,28,30,32,27,29,31,33,26,28,30,33,36,38,40,42,37,39,41,43,36,38,40,42,37,46,48,50,52,55,58,59,47,49,53,57];
const DEMO_TR={а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"};
const demoTr=s=>String(s).toLowerCase().split("").map(c=>DEMO_TR[c]!==undefined?DEMO_TR[c]:c).join("");
const DEMO_DATA=(()=>{
 let sd=7;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
 const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),used=new Set();
 const active=DEMO_BASE.map(x=>({fio:x.fio,sex:x.sex,dep:x.dep,pos:x.pos,email:x.email}));
 active.forEach(e=>used.add(e.fio));
 let mi=0,fi=0;
 const mkName=sex=>{const S=sex==="М"?DEMO_M_SUR:DEMO_F_SUR,F=sex==="М"?DEMO_M_NAMES:DEMO_F_NAMES,P=sex==="М"?DEMO_M_PAT:DEMO_F_PAT,n=sex==="М"?mi++:fi++;for(let k=0;k<2000;k++){const nm=S[(n+k*3)%S.length]+" "+F[(n*3+k*5)%F.length]+" "+P[(n*7+k*2)%P.length];if(!used.has(nm)){used.add(nm);return nm}}const nm="Сотрудник "+(used.size+1);used.add(nm);return nm};
 DEMO_DEPTS.forEach(([dep,need])=>{let have=active.filter(x=>x.dep===dep).length;while(have<need){const sex=(mi+fi)%2?"Ж":"М",fio=mkName(sex),p=fio.split(" ");active.push({fio,sex,dep,pos:DEMO_POS[dep][have%DEMO_POS[dep].length],email:demoTr(p[0])+"."+demoTr(p[1]||"")+(active.length+1)+"@demo.ru"});have++}});
 const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
 active.forEach((e,i)=>{e.tab="Т-"+(i+1);e.age=DEMO_AGES[i];e.bd=new Date(now.getFullYear()-e.age,(i*5+2)%12,3+(i*3)%22);e.sal=50000+Math.round(rnd()*8)*10000;e.phone="+7 900 "+String(100+i).slice(-3)+"-"+String(10+(i*3)%80).padStart(2,"0")+"-"+String(10+(i*7)%80).padStart(2,"0")});
 [[38,59],[31,63],[42,58]].forEach(([i,a])=>{if(active[i])active[i].bd=new Date(now.getFullYear()-a,0,1)});
 [8,9,15].forEach((i,k)=>{if(active[i])active[i].sched=k===1?"1/3":"2/2"});
 active[0].hire=new Date(now.getFullYear()-3,Math.floor(rnd()*12),1+Math.floor(rnd()*27));
 const repl=active.slice(1),byDep={},di={};repl.forEach(e=>(byDep[e.dep]=byDep[e.dep]||[]).push(e));
 const order=[];while(order.length<repl.length){DEMO_DEPTS.forEach(([dep])=>{const a=byDep[dep]||[],j=di[dep]||0;if(j<a.length){order.push(a[j]);di[dep]=j+1}})};
 const FIRE=[5,5,4,4,4,3,3,3,3,3,3,2],former=[];let oi=0;
 FIRE.forEach((nf,b)=>{
  const d0=new Date(now.getFullYear(),now.getMonth()-(11-b),1),y=d0.getFullYear(),m=d0.getMonth(),last=dim2(y,m+1),cur=b===11,top=Math.max(1,now.getDate()-2);
  for(let j=0;j<nf&&oi<order.length;j++){
   const rep=order[oi++],day=cur?Math.max(1,Math.min(top,Math.round(1+(top-1)*(j+1)/(nf+1)))):Math.max(2,Math.min(last-1,2+Math.floor(rnd()*Math.max(1,last-4)))),
    fire=new Date(y,m,day);
   let hire=new Date(y,m,Math.min(last,day+1+(j%2)));if(hire>now)hire=new Date(now.getTime()-36e5);rep.hire=hire;
   former.push({fio:mkName(rep.sex),tab:"У-"+(former.length+1),dep:rep.dep,pos:rep.pos,hire:new Date(y-2-Math.floor(rnd()*5),Math.floor(rnd()*12),1+Math.floor(rnd()*27)),fire,why:DEMO_WHY[Math.floor(rnd()*DEMO_WHY.length)],sal:rep.sal,email:"",phone:""});
  }
 });
 const vac=[],HY=Math.max(now.getFullYear(),2027);let sentVac=null;
 const add=(e,s,days,status)=>vac.push([e.fio,s,new Date(s.getTime()+(days-1)*864e5),"Ежегодный",status||""]);
 const seen={},dsz={};DEMO_DEPTS.forEach(([d,n])=>dsz[d]=n);
 active.forEach((e,i)=>{
  if(i%3===0||i%7===0)add(e,new Date(today.getTime()-(25+i*9)*864e5),14,i%2?"использован":"");
  if(i<6){const s=new Date(today.getFullYear(),today.getMonth(),today.getDate()+[10,20,5,25,7,15][i]);add(e,s,14,"");if(i===2)sentVac={tab:e.tab,start:iso(s)}}
  const j=seen[e.dep]=(seen[e.dep]||0),size=dsz[e.dep]||1,mon=Math.min(11,Math.floor(j*12/size));seen[e.dep]=j+1;
  add(e,new Date(HY,mon,3+(i*7)%22),7+(i%2)*7,"");
  if(i%2===0)add(e,new Date(HY,(mon+6)%12,4+(i*5)%20),7,"");
  if([4,9,14,19].includes(i))add(e,new Date(today.getFullYear(),today.getMonth(),today.getDate()+40+i),10,"перенесён");
 });
 const units={Продажи:18,Склад:12,Поддержка:9,IT:8,Бухгалтерия:4,Юристы:2},staff=[];
 DEMO_DEPTS.forEach(([dep])=>{const p=DEMO_POS[dep]||["Специалист"],u=units[dep]||0,nr=Math.min(2,p.length),base=Math.floor(u/nr),rem=u-base*nr;const salOf=pos=>{const L=active.filter(e=>e.dep===dep&&e.pos===pos&&e.sal>0);return L.length?Math.round(L.reduce((s,e)=>s+e.sal,0)/L.length):60000};for(let j=0;j<nr;j++)staff.push([dep,p[j],base+(j<rem?1:0),salOf(p[j])])});
 return {active,former,vac,staff,sentVac};
})();
const DEMO_STAFF=DEMO_DATA.active;
const genStaff=()=>{const t1=[["ФИО","Табельный номер","Должность","Подразделение","Дата приема","Дата увольнения","Причина увольнения","Оклад","Почта","Телефон"]],t2=[["ФИО","Дата рождения","Пол"]],t3=[["ФИО","Дата начала отпуска","Дата окончания отпуска","Вид отпуска","Статус"]],t4=[["Подразделение","Должность","Штатные единицы","Оклад"]];
 DEMO_DATA.active.forEach(e=>{t1.push([e.fio,e.tab,e.pos,e.dep,e.hire,"","",e.sal,e.email,e.phone]);t2.push([e.fio,e.bd,e.sex])});
 DEMO_DATA.former.forEach(e=>t1.push([e.fio,e.tab,e.pos,e.dep,e.hire,e.fire,e.why,e.sal,e.email,e.phone]));
 DEMO_DATA.vac.forEach(v=>t3.push(v));DEMO_DATA.staff.forEach(s=>t4.push(s));
 t1.push(["Тестов Тест Тестович","Т-901","Тестер","IT","","","",70000,"",""],["Сидоров Пётр Андреевич","Т-1","Тестер","IT",new Date(2022,1,1),"","",70000,"",""],["Петров Иван Иванович","Т-902","Тестер","IT",new Date(2024,5,1),new Date(2023,5,1),"Рост",70000,"",""]);
 return [{n:"Сотрудники",a:t1},{n:"Личные данные",a:t2},{n:"Отпуска",a:t3},{n:"Штатное расписание",a:t4}]};
const seedDemoVac=()=>{try{const s=DEMO_DATA.sentVac;if(!s)return;const o=JSON.parse(localStorage.getItem("svodka_vac_sent"))||{};o[s.tab+"|"+s.start]=Date.now();localStorage.setItem("svodka_vac_sent",JSON.stringify(o))}catch(e){}};
const stg=s=>{s=String(s).toLowerCase();return /выход|принят|вышел|нанят/.test(s)?4:/оффер|предложен/.test(s)?3:/интервью|собеседов|встреч/.test(s)?2:/скрин|телефон|созвон|резюме|рассмотр/.test(s)?1:0};
const sn=s=>{s=String(s).trim();const l=s.toLowerCase();return /hh|headhunter|хэдхантер/.test(l)?"hh.ru":/avito|авито/.test(l)?"Авито":/linkedin|линкед/.test(l)?"LinkedIn":/рекоменд|реферал/.test(l)?"Рекомендации":s||"Другое"};
const CK=[["vo",/открыт/i],["vh",/дата.*(выход|закрыт|найм)|(выход|закрыт).*дата/i],["v",/вакан|позици|должност/i],["src",/источник|канал|площадк/i],["stg",/этап|статус|стади/i],["d",/^\s*дата/i]];
const cmap=a=>{for(let i=0;i<Math.min(a.length,15);i++){const m={};a[i].forEach((c,j)=>{const s=String(c),k=CK.find(k=>m[k[0]]==null&&k[1].test(s));if(k&&s.length<40)m[k[0]]=j});if(m.v!=null&&m.stg!=null&&m.src!=null)return[i,m]}return null};
const calcC=()=>{const t=new Date(),n=new Date(t.getFullYear(),t.getMonth()-PER,t.getDate()),day=864e5;
 VACN=[...new Set(CAND.map(c=>c.v))];if(VF&&!VACN.includes(VF))VF="";
 const L=CAND.filter(c=>!c.d||c.d>=n),Lv=VF?L.filter(c=>c.v==VF):L;HNC=L.filter(c=>c.k==4).length;
 FUN=ST.map((s,i)=>[s,Lv.filter(c=>c.k>=i).length]);
 const byv=Object.create(null);CAND.forEach(c=>{const o=byv[c.v]||(byv[c.v]={o:null,fo:null,x:null,h:0}),od=c.o||c.d;if(od&&(!o.o||od<o.o))o.o=od;if(c.o&&(!o.fo||c.o<o.fo))o.fo=c.o;if(c.k==4){o.h++;if(c.x&&(!o.x||c.x<o.x))o.x=c.x}});
 const od=o=>o.fo||o.o;
 VAC=[...new Set(L.map(c=>c.v))].map(v=>{const l=L.filter(c=>c.v==v),w=l.filter(c=>c.k==4),sm=Object.create(null);(w.length?w:l).forEach(c=>sm[c.s]=(sm[c.s]||0)+1);const b=Object.entries(sm).sort((x,y)=>y[1]-x[1])[0],o=byv[v],ttf=o&&o.x&&od(o)?Math.max(0,Math.round((o.x-od(o))/day)):null;return[v,l.length,l.filter(c=>c.k>=2).length,l.filter(c=>c.k>=3).length,w.length,l.length?+(w.length/l.length*100).toFixed(1):0,b?b[0]:"—",ttf]}).sort((x,y)=>y[1]-x[1]);
 const rw=Object.entries(byv).map(([v,o])=>({v,od:od(o),x:o.x,h:o.h})),closed=rw.filter(r=>r.od&&r.x&&r.x>=n&&r.x>=r.od).map(r=>[r.v,Math.round((r.x-r.od)/day)]).sort((a,b)=>b[1]-a[1]),open=rw.filter(r=>r.od&&!r.h).map(r=>[r.v,Math.floor((t-r.od)/day)]).filter(r=>r[1]>45).sort((a,b)=>b[1]-a[1]);
 TT={avg:closed.length?Math.round(closed.reduce((s,r)=>s+r[1],0)/closed.length):null,closed,open,hasOpen:CAND.some(c=>c.o)};
 const sx=Object.create(null);Lv.forEach(c=>{const o=sx[c.s]||(sx[c.s]=[0,0,0]);o[0]++;if(c.k==4)o[1]++;if(c.k>=2)o[2]++});
 SRCS=Object.entries(sx).map(([s,o])=>[s,o[0],o[1],o[2]]).sort((x,y)=>y[1]-x[1]);if(!SRCS.length)SRCS=[["Нет данных",1,0,0]]};
const ST=["Отклики","Скрининг","Интервью","Оффер","Выход"];
async function runC(a,name,q,app){if(!q&&window.SVODKA_LICENSE&&window.SVODKA_LICENSE.readonly()){if(window.SVODKA_UI)window.SVODKA_UI.toast("Подписка закончилась: импорт кандидатов недоступен","bad");return}const out=q?{}:$("#fs"),h=cmap(a);
 if(!h){out.innerHTML=`<span class="tag">Не нашёл колонки. Нужны «Вакансия», «Источник» и «Этап».</span>`;return}
 LASTC=[a,name];const m=h[1];DEMO_SRC.vac=(name===DEMO);
 CAND=a.slice(h[0]+1).filter(r=>String(r[m.v]).trim()).map(r=>({v:ec(String(r[m.v]).trim()),s:ec(sn(r[m.src])),k:stg(r[m.stg]),d:m.d!=null?pd(r[m.d]):null,o:m.vo!=null?pd(r[m.vo]):null,x:m.vh!=null?pd(r[m.vh]):null}));
 HASC={cand:1,tto:CAND.some(c=>c.o||c.d)?1:0,tth:CAND.some(c=>c.x)?1:0};
 calcC();
 out.innerHTML=(app?out.innerHTML:"")+`<span class="tag">${name}: ${CAND.length} кандидатов, ${VACN.length} вакансий</span><details><summary>Как обезличено</summary><p style="color:var(--mut)">ФИО, телефоны и почта не читаются. Берутся только вакансия, источник, этап и дата отклика.</p></details>`;
 if(!q&&name!=DEMO){UP.vac=Date.now();saveUP();try{saveSnapshot(true)}catch(e){}}draw();try{window.SVODKA_PERSIST&&window.SVODKA_PERSIST()}catch(e){}}
const genCand=()=>{let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647,now=new Date(),VS=[["Менеджер по продажам",["hh.ru","hh.ru","Авито","LinkedIn","Рекомендации"],150],["Кладовщик",["Авито","Авито","hh.ru","Рекомендации"],100],["Бухгалтер",["hh.ru","hh.ru","Авито","LinkedIn"],70],["Разработчик 1С",["LinkedIn","hh.ru","LinkedIn","Рекомендации"],40]],a=[["ФИО кандидата","Телефон","Вакансия","Источник","Этап","Дата открытия вакансии","Дата отклика","Дата выхода"]],E=["Отклик","Скрининг","Интервью","Оффер","Вышел на работу"];
 for(let i=1;i<=700;i++){const v=VS[Math.floor(r()*4)],q=r();let k=q<.42?0:q<.7?1:q<.88?2:q<.95?3:4;if(v[0]=="Бухгалтер"&&k==4)k=3;const od=new Date(now.getTime()-v[2]*864e5),d=new Date(od.getTime()+r()*(now-od)),x=k==4?new Date(Math.min(now.getTime(),d.getTime()+(7+r()*25)*864e5)):"";
  a.push(["Кандидат "+i,"+7 000 000-00-"+i%100,v[0],v[1][Math.floor(r()*v[1].length)],E[k],od,d,x])}
 return a};
const seedDemoTimesheet=()=>{try{const l=DEMO_DATA.active.map(d=>({name:d.fio,tab:d.tab,dep:d.dep,pos:d.pos,email:d.email,sched:d.sched}));window.SVODKA_TS_SEED_DEMO&&window.SVODKA_TS_SEED_DEMO(l)}catch(e){}};
$("#dm").onclick=async()=>{seedDemoVac();await ingest(genStaff(),DEMO);await runC(genCand(),DEMO,0,1);seedDemoTimesheet()};
$("#cl").onclick=async()=>{try{if(window.svodka&&window.svodka.records)await window.svodka.records.clear()}catch(e){}ACC=[];seedDemoVac();await ingest(genStaff(),DEMO);await runC(genCand(),DEMO,0,1);seedDemoTimesheet()};
