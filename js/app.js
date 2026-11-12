/* ==== i18n katmanı (çalışma zamanı çeviri) ==== */
var LANGS={tr:'Türkçe',en:'English',es:'Español',pt:'Português',de:'Deutsch',it:'Italiano',fr:'Français'},LANG='tr',LOCALE='tr-TR';
// Gecici: tasarim bitene kadar uygulama yalnizca Turkce. Ceviri katmani (I18N, i18n-keys.js) yerinde; false yapinca diller geri gelir.
const KM_SADECE_TR=true;
const I18N=(()=>{
const CODEC=/[,]/,TZ_ES=/^(Europe\/Madrid|Atlantic\/Canary|Africa\/Ceuta|America\/(Mexico_City|Cancun|Merida|Monterrey|Tijuana|Chihuahua|Hermosillo|Mazatlan|Bogota|Lima|Caracas|Santiago|La_Paz|Guayaquil|Asuncion|Montevideo|Panama|Costa_Rica|Guatemala|El_Salvador|Tegucigalpa|Managua|Havana|Santo_Domingo|Puerto_Rico|Argentina\/.*)|Pacific\/Easter)$/,
TZ_PT=/^(Europe\/Lisbon|Atlantic\/(Azores|Madeira)|America\/(Sao_Paulo|Fortaleza|Recife|Bahia|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Rio_Branco|Maceio|Araguaina|Noronha|Boa_Vista|Santarem|Eirunepe)|Africa\/(Luanda|Maputo|Bissau)|Atlantic\/Cape_Verde)$/,
TZ_DE=/^(Europe\/(Berlin|Vienna|Zurich|Vaduz|Busingen))$/,TZ_IT=/^(Europe\/(Rome|Vatican|San_Marino))$/,
TZ_FR=/^(Europe\/(Paris|Monaco|Luxembourg|Brussels)|Africa\/(Algiers|Tunis|Casablanca|Dakar|Abidjan|Douala|Kinshasa|Libreville|Bamako|Ouagadougou|Conakry|Lome|Niamey|Djibouti)|America\/Martinique|Indian\/Reunion)$/,TZ_TR=/^(Europe\/Istanbul|Asia\/Istanbul|Europe\/Nicosia)$/;
const pickTz=()=>{let z='';try{z=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}return TZ_TR.test(z)?'tr':TZ_ES.test(z)?'es':TZ_PT.test(z)?'pt':TZ_DE.test(z)?'de':TZ_IT.test(z)?'it':TZ_FR.test(z)?'fr':''};
const pickNav=()=>{try{const l=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'']);for(const x of l){const c=String(x||'').toLowerCase().slice(0,2);if(LANGS[c])return c}}catch(e){}return ''};
const rdy=l=>l=='tr'||(I18N_T[l]&&I18N_T[l].some(x=>x));const detect=()=>{if(KM_SADECE_TR)return 'tr';let s='';try{s=localStorage.getItem('km_lang')||''}catch(e){}if(LANGS[s]&&rdy(s))return s;const b=pickTz();if(b&&rdy(b))return b;const a=pickNav();if(a&&rdy(a))return a;return 'en'};
const locOf=l=>{let z='';try{z=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}const am=/^America\//.test(z);return l=='tr'?'tr-TR':l=='en'?(am?'en-US':'en-GB'):l=='es'?(am?'es-MX':'es-ES'):l=='pt'?(am?'pt-BR':'pt-PT'):l=='de'?'de-DE':l=='it'?'it-IT':l=='fr'?'fr-FR':'en-GB'};
const COMMA=l=>l=='es'||l=='pt'||l=='de'||l=='it'||l=='fr';
let EX=new Map(),PH=[],SEGS=null,ORIG=new WeakMap(),OLAST=new WeakMap(),AORIG=new WeakMap(),obs=null,busy=false;
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const CT={'Ermenistan':'AM','Kıbrıs':'CY','Karadağ':'ME','Letonya':'LV','Çekya':'CZ','İspanya':'ES','Hırvatistan':'HR','Türkiye':'TR','Belçika':'BE','İtalya':'IT','Fransa':'FR','Almanya':'DE','Hollanda':'NL','Yunanistan':'GR','Sırbistan':'RS','Kuzey Makedonya':'MK','Portekiz':'PT','Danimarka':'DK','Bosna-Hersek':'BA','Romanya':'RO','İsveç':'SE','İsviçre':'CH','Finlandiya':'FI','Norveç':'NO','Polonya':'PL','Avusturya':'AT','Ukrayna':'UA','Macaristan':'HU','Slovakya':'SK','Slovenya':'SI','Bulgaristan':'BG','Arnavutluk':'AL','Gürcistan':'GE','İzlanda':'IS','İrlanda':'IE','İsrail':'IL','Kazakistan':'KZ','Lüksemburg':'LU','Andorra':'AD','Estonya':'EE','Litvanya':'LT','Belarus':'BY','Azerbaycan':'AZ','Kosova':'XK','Malta':'MT','Moldova':'MD','Faroe Adaları':'FO','Cebelitarık':'GI','Liechtenstein':'LI','San Marino':'SM'};
const LGI=[65, 66, 76, 77, 78, 79, 80, 81, 82, 96, 97, 98, 99, 136, 142, 160, 173, 174, 203, 204, 205, 223, 224, 247, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 305, 307, 325, 326, 327, 328, 329, 330, 331, 339, 340, 341, 356, 375, 376, 378, 379, 380, 381, 407, 415, 416, 417, 418, 419, 420, 421, 548, 549, 553, 554, 555, 556, 557, 560, 561, 562, 563, 564, 565, 624, 625, 626, 628];let DN=null;
const CXN={'İngiltere':['England','Inglaterra','Inglaterra','England','Inghilterra','Angleterre'],'İskoçya':['Scotland','Escocia','Escócia','Schottland','Scozia','Écosse'],'Galler':['Wales','Gales','País de Gales','Wales','Galles','Pays de Galles'],'Kuzey İrlanda':['Northern Ireland','Irlanda del Norte','Irlanda do Norte','Nordirland','Irlanda del Nord','Irlande du Nord'],'İrlanda Cumhuriyeti':['Republic of Ireland','República de Irlanda','República da Irlanda','Republik Irland',"Repubblica d'Irlanda","République d'Irlande"]};const CODE={'İSP':'ESP','İNG':'ENG','HIR':'CRO','TÜR':'TUR','KIB':'CYP','İTA':'ITA','İSK':'SCO','İZL':'ISL','İSR':'ISR','İRL':'IRL'};const isC=k=>!!(CT[k]||CXN[k]);
const cname=k=>{const x=CXN[k];if(x){const i=['en','es','pt','de','it','fr'].indexOf(LANG);return i<0?k:x[i]}const c=CT[k];if(!c)return null;if(LANG=='tr')return k;try{if(!DN)DN=new Intl.DisplayNames([LOCALE],{type:'region'});if(c=='XK')return LANG=='en'?'Kosovo':LANG=='de'?'Kosovo':'Kosovo';return DN.of(c)||k}catch(e){return k}};
const MS=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],ML=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const DRE=new RegExp('\\b(\\d{1,2}) ('+ML.join('|')+'|'+MS.join('|')+')(?: (\\d{4}))?(?![\\p{L}])','gu');
const dloc=s=>s.replace(DRE,(m,d,mo,y)=>{let i=ML.indexOf(mo),lg=true;if(i<0){i=MS.indexOf(mo);lg=false}try{const o={day:'numeric',month:lg?'long':'short',timeZone:'UTC'};if(y)o.year='numeric';return new Intl.DateTimeFormat(LOCALE,o).format(new Date(Date.UTC(+(y||2026),i,+d)))}catch(e){return m}});
const cssl=()=>{let e=document.getElementById('i18ncss');if(!e){e=document.createElement('style');e.id='i18ncss';document.head.appendChild(e)}if(LANG=='tr'){e.textContent='';return}const o=JSON.stringify('▾ '+tx('Aç')),c=JSON.stringify('▴ '+tx('Kapat'));e.textContent='.cpn>summary.cps::after,.betb>summary.bsm::after{content:'+o+'}.cpn[open]>summary.cps::after,.betb[open]>summary.bsm::after{content:'+c+'}'};
let NGM=new Map(),NGR=null;const build=()=>{DN=null;EX=new Map();PH=[];SEGS=null;NGM=new Map();NGR=null;if(LANG=='tr')return;const T=I18N_T[LANG]||[];I18N_KEYS.forEach((k,i)=>{const v=T[i];if(v==null||v==='')return;if(k.slice(0,2)=='@@'){NGM.set(k.slice(2).toLowerCase(),v);return}if(!/[\x01\x02]/.test(k))EX.set(k,v);else{const parts=k.split(/[\x01\x02]/),ty=k.match(/[\x01\x02]/g);let lit=0,re='^';parts.forEach((p,j)=>{lit+=p.length;re+=esc(p);if(j<ty.length)re+=ty[j]=='\x02'?'(\\d+(?:[.,]\\d+)?)':'(.+?)'});PH.push({re:new RegExp(re+'$'),out:v,lit,n:ty.length,semi:/^(Kaynak|Kadro): /.test(k)})}});PH.sort((a,b)=>b.lit-a.lit)};
const segs=()=>{if(SEGS)return SEGS;const ks=LGI.map(i=>I18N_KEYS[i]).filter(k=>k&&EX.has(k)).sort((a,b)=>b.length-a.length);SEGS=ks.length?new RegExp('(?<![\\p{L}\\p{N}])('+ks.map(esc).join('|')+')(?![\\p{L}\\p{N}])','gu'):null;return SEGS};
const num=s=>COMMA(LANG)?s.replace(/(?<![\d.,])(\d+)\.(\d+)(?!\d|\.\d)/g,'$1,$2'):s;
const pct=s=>s.replace(/%(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)/g,(m,a)=>LANG=='de'||LANG=='fr'||LANG=='es'?a+' %':a+'%');
const fin=s=>dloc(num(pct(s)));
const SB=/(?<![A-ZÇĞİÖŞÜ])[.!?]\s+[A-ZÇĞİÖŞÜ]/;const phm=(c,depth)=>{for(const p of PH){const r=p.re.exec(c);if(r&&(p.semi||!r.slice(1).some(x=>x.indexOf('; ')>=0||SB.test(x))))return p.out.replace(/\{(\d+)\?([^:}]*):([^}]*)\}/g,(x,i,a,b)=>+String(r[+i]).replace(',','.')==1?a:b).replace(/\{(\d+)\}/g,(x,i)=>depth<4?cap(r[+i]||'',depth+1):(r[+i]||''))}return null};
const part=(c,depth)=>{if(EX.has(c))return EX.get(c);const m=/^(.*?)([.!?]+)$/.exec(c);if(m&&m[1]){const o=phm(m[1],depth);if(o!=null)return /[.!?]$/.test(o)?o:o+m[2];if(EX.has(m[1])){const e=EX.get(m[1]);return /[.!?]$/.test(e)?e:e+m[2]}}return phm(c,depth)};
const ngr=()=>{if(NGR!==null)return NGR;const ks=[...NGM.keys()].sort((a,b)=>b.length-a.length);NGR=ks.length?new RegExp('(?<![\\p{L}\\p{N}])('+ks.map(esc).join('|')+')(?![\\p{L}\\p{N}])','giu'):false;return NGR};
const cap=(x,depth)=>{const t=x.trim();if(!t)return x;if(LANG!='tr'&&CODE[t])return CODE[t];let o=part(t,depth);if(o!=null)return o;const cn=cname(t);if(cn)return cn;if(/ [–-] /.test(t)){const ps=t.split(/ [–-] /);if(ps.every(q=>isC(q.trim()))){return ps.map(q=>cname(q.trim())).join(' – ')}}const g=segs();if(g){let lk=null,ix=-1;t.replace(g,(k,o)=>{lk=k;ix=o;return k});if(lk&&ix>0&&ix+lk.length==t.length)return t.slice(0,ix).trim()+' ('+EX.get(lk)+')';let ch=false;const o2=t.replace(g,k=>{ch=true;return EX.get(k)});if(ch)return o2}const cs=splitTx(t,depth);if(cs!=null)return cs;const ng=ngr();if(ng){let ch=false;const o3=t.replace(ng,k=>{ch=true;return NGM.get(k.toLowerCase())});if(ch)return o3}if(window.__LEFT)window.__LEFT.add(t);return t};
const trp=part;
const splitL=(txt,seps,depth)=>{const sep=seps[0];const ps=sep=='S'?txt.split(/(?<!(?:^|[\s(])[A-ZÇĞİÖŞÜ]\.)(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ“"])/):txt.split(sep);if(ps.length<2){return seps.length>1?splitL(txt,seps.slice(1),depth):null}let any=false;const out=ps.map(q=>{let o=trp(q,depth);if(o!=null){any=true;return o}if(seps.length>1){const r=splitL(q,seps.slice(1),depth);if(r!=null){any=true;return r}}if(window.__LEFT)window.__LEFT.add(q.trim());return q});return any?out.join(sep=='S'?' ':sep):null};
const splitTx=(core,depth)=>{if(depth>5)return null;return splitL(core,['S','; ',' · '],depth)};
const tx=(s,depth)=>{depth=depth||0;const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);const lead=m[1],core=m[2].replace(/\s+/g,' ').replace(/(\d+(?:[.,]\d+)?)%/g,'%$1'),tail=m[3];if(!core)return s;if(LANG!='tr'&&CODE[core])return lead+CODE[core]+tail;
 let out=trp(core,depth);if(out==null){const cn=cname(core);if(cn)out=cn}
 if(out==null){if(/ [–-] /.test(core)){const ps=core.split(/ [–-] /);if(ps.every(q=>isC(q.trim())))out=ps.map(q=>cname(q.trim())).join(' – ')}}
 if(out==null)out=splitTx(core,depth);
 if(out==null){const o3=fin(core);if(o3==core&&window.__LEFT)window.__LEFT.add(core);return o3==core?s:lead+o3+tail}
 return lead+fin(out)+tail};
const SKIP=/^(SCRIPT|STYLE|TEXTAREA)$/;
const doText=n=>{const cur=n.nodeValue;let o=ORIG.get(n);if(o===undefined||OLAST.get(n)!==cur){o=cur;ORIG.set(n,o)}const t=LANG=='tr'?o:tx(o);OLAST.set(n,t);if(t!==cur)n.nodeValue=t};
const AT=['placeholder','title','aria-label','alt'];
const doEl=e=>{AT.forEach(a=>{if(!e.hasAttribute||!e.hasAttribute(a))return;const cur=e.getAttribute(a);let M=AORIG.get(e);if(!M){M={};AORIG.set(e,M)}let r=M[a];if(!r||r.last!==cur){r={o:cur,last:cur};M[a]=r}const t=LANG=='tr'?r.o:tx(r.o);r.last=t;if(t!==cur)e.setAttribute(a,t)})};
const walk=root=>{if(!root)return;if(root.nodeType==3){if(root.parentNode&&SKIP.test(root.parentNode.nodeName))return;doText(root);return}if(root.nodeType!=1)return;if(SKIP.test(root.nodeName))return;doEl(root);const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,null);let n;while(n=w.nextNode()){if(n.nodeType==3){if(!SKIP.test(n.parentNode.nodeName))doText(n)}else if(!SKIP.test(n.nodeName))doEl(n)}};
const run=muts=>{if(busy)return;busy=true;try{if(muts){const seen=new Set();for(const m of muts){if(m.type=='childList')m.addedNodes.forEach(n=>{if(!seen.has(n)){seen.add(n);walk(n)}});else if(m.type=='characterData')walk(m.target);else if(m.type=='attributes')doEl(m.target)}}else walk(document.body);}finally{if(obs)obs.takeRecords();busy=false}};
const api={
 set(l,save){if(KM_SADECE_TR)l='tr';if(!LANGS[l])l='en';LANG=l;LOCALE=locOf(l);try{document.documentElement.lang=l}catch(e){}if(save){try{localStorage.setItem('km_lang',l)}catch(e){}}build();cssl();run(null);return l},
 init(){const l=detect();LANG=l;LOCALE=locOf(l);try{document.documentElement.lang=l}catch(e){}build();cssl();obs=new MutationObserver(run);obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:AT});run(null)},
 tx:s=>LANG=='tr'?s:tx(String(s)),detect,pickTz,pickNav,rdy
};return api})();
/* ==== /i18n ==== */
I18N.init();
const N={PL:"Premier Lig",LL:"La Liga",SA:"Serie A",BL:"Bundesliga",CL:"Şampiyonlar Ligi"};
const R=`PL|10-31T12:30|Chelsea|Man United|53|23.9|23.1
PL|10-31T15:00|Bournemouth|Leeds|45.4|27.3|27.3
PL|10-31T15:00|Brentford|N. Forest|48|25.8|26.2
PL|10-31T15:00|Coventry|Sunderland|31.5|27.7|40.8
PL|10-31T15:00|Hull|Ipswich|36.9|27.4|35.7
PL|10-31T15:00|Man City|Brighton|58|21.6|20.4
PL|10-31T17:30|Tottenham|C. Palace|62.3|20.5|17.2
PL|10-31T20:00|Aston Villa|Fulham|47.7|25.5|26.8
PL|11-01T16:30|Liverpool|Arsenal|31.4|27|41.6
PL|11-02T20:00|Newcastle|Everton|42.3|26.2|31.5
LL|10-30T20:00|Villarreal|Espanyol|66.6|18.7|14.7
LL|10-31T13:00|Levante|Atletico Madrid|19.2|21.4|59.4
LL|10-31T15:15|Rayo|Celta|40.4|28.7|30.9
LL|10-31T17:30|Betis|Malaga|70|17.3|12.7
LL|10-31T20:00|Barcelona|Alaves|88.5|7.8|3.7
LL|11-01T13:00|Getafe|Sevilla|31.1|31.6|37.3
LL|11-01T15:15|Racing Santander|Real Madrid|9.2|12.1|78.7
LL|11-01T17:30|Elche|Valencia|40|27.9|32.1
LL|11-01T20:00|Athletic|Real Sociedad|45.2|25.8|29
LL|11-02T20:00|Deportivo|Osasuna|43.7|29.4|26.9
SA|10-27T19:45|Roma|Cagliari|74.1|16.8|9.1
SA|10-27T19:45|Torino|Como|20.3|24.5|55.2
SA|10-28T17:30|Milan|Bologna|57.7|23.7|18.6
SA|10-28T17:30|Parma|Udinese|33.5|30.2|36.3
SA|10-28T17:30|Venezia|Inter|12.8|16|71.2
SA|10-28T19:45|Genoa|Juventus|18.1|25.4|56.5
SA|10-28T19:45|Monza|Napoli|21.9|24|54.1
SA|10-29T17:30|Frosinone|Lecce|57.3|22.3|20.4
SA|10-29T19:45|Fiorentina|Atalanta|42.9|25.9|31.2
SA|10-31T14:00|Bologna|Monza|54.1|25.2|20.7
BL|10-30T19:30|Elversberg|Mainz|30.3|24.7|45
BL|10-31T14:30|Leverkusen|Stuttgart|52.6|21.9|25.5
BL|10-31T14:30|Augsburg|Freiburg|31.7|24.8|43.5
BL|10-31T14:30|M’gladbach|Paderborn|48.8|24|27.2
BL|10-31T14:30|Werder Bremen|Hoffenheim|33.4|24.4|42.2
BL|10-31T14:30|Schalke|Leipzig|24.9|24.2|50.9
BL|10-31T17:30|Bayern|Dortmund|72|15|13
BL|11-01T14:30|Union Berlin|Köln|38.3|26|35.7
BL|11-01T16:30|Frankfurt|Hamburg|57.5|21.5|21
CL|11-03T17:45|Shakhtar|Sporting|26.6|25.5|47.9
CL|11-03T17:45|Galatasaray|Stuttgart|43|23.9|33.1
CL|11-03T20:00|Atletico Madrid|Bayern|29.7|23.5|46.8
CL|11-03T20:00|Barcelona|Aston Villa|74.3|13.4|12.3
CL|11-03T20:00|Feyenoord|Inter|23.9|22.1|54
CL|11-03T20:00|Bodø/Glimt|Lille|62.3|19.8|17.9
CL|11-03T20:00|LASK|Slovan Bratislava|73.7|15.3|11
CL|11-03T20:00|Man United|Roma|45|23.2|31.8
CL|11-03T20:00|Villarreal|PSG|22.2|22.5|55.3
CL|11-04T17:45|AEK Atina|Real Madrid|8.8|12.7|78.5`.split("\n").map(l=>{const[c,t,h,a,x,y,z]=l.split("|"),s=+x+ +y+ +z;return{c,t:new Date(`2026-${t}:00Z`),h,a,p:[x/s,y/s,z/s]}});
const $=s=>document.querySelector(s),pc=x=>Math.round(x*100)+"%";
const dk=t=>t.toLocaleDateString("sv"),hm=t=>t.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
let tab="k",comp="Hepsi",day="";
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{if(b.dataset.t){tab=b.dataset.t;det=null;PMV=null;NAVS.length=0;FWD.length=0;render()}});
N.SL="Süper Lig";
const C={PL:"#7a3fb0",LL:"#d2691e",SA:"#1f6fb5",BL:"#c0392b",CL:"#0a3d91",SL:"#c8102e"},TM={};
`PL|Man City:1:21:7:0:1,Arsenal:2:21:7:0:1,Brighton:3:16:5:1:2,Liverpool:4:15:4:3:1,Chelsea:5:13:4:1:3,Brentford:6:11:2:5:1,Leeds:7:11:2:5:1,Newcastle:8:11:3:2:3,Aston Villa:9:11:3:2:3,Hull:10:10:2:4:2,Everton:11:10:2:4:2,Ipswich:12:10:3:1:4,Bournemouth:13:9:2:3:3,Tottenham:14:9:2:3:3,Fulham:15:8:2:2:4,Man United:16:7:1:4:3,C. Palace:17:7:2:1:5,N. Forest:18:6:1:3:4,Coventry:19:6:2:0:6,Sunderland:20:5:1:2:5
LL|Barcelona:1:27:9:0:1,Atletico Madrid:2:25:8:1:1,Real Madrid:3:24:8:0:2,Betis:4:20:6:2:2,Real Sociedad:5:19:6:1:3,Sevilla:6:17:5:2:3,Alaves:7:12:3:3:4,Athletic:8:12:3:3:3,Celta:9:12:2:6:2,Villarreal:10:12:3:3:4,Deportivo:11:11:2:5:3,Osasuna:12:11:3:2:5,Racing Santander:13:11:3:2:5,Levante:14:10:2:4:4,Elche:15:10:2:4:4,Rayo:16:9:2:3:4,Getafe:17:9:2:3:5,Espanyol:18:8:2:2:6,Valencia:19:6:1:3:6,Malaga:20:5:0:5:5
SA|Inter:2:22:7:1:0,Roma:3:18:5:3:0,Milan:4:18:5:3:0,Como:5:17:5:2:1,Frosinone:6:14:4:2:2,Juventus:7:14:4:2:2,Torino:8:13:4:1:3,Cagliari:9:13:4:1:3,Napoli:10:11:3:2:3,Atalanta:11:10:3:1:4,Lecce:12:9:3:0:5,Bologna:13:8:2:2:4,Monza:15:7:2:1:5,Genoa:16:7:2:1:5,Udinese:17:4:1:1:6,Fiorentina:18:4:1:1:6,Parma:19:4:1:1:6,Venezia:20:3:1:0:7
BL|Bayern:1:17:5:2:0,Dortmund:2:17:5:2:0,Freiburg:3:13:4:1:2,Leverkusen:4:13:4:1:2,Leipzig:5:12:4:0:3,Werder Bremen:6:12:3:3:1,Mainz:7:10:3:1:3,Elversberg:8:10:3:1:3,Augsburg:9:9:2:3:2,Hoffenheim:10:9:3:0:4,Hamburg:11:9:3:0:4,Köln:12:8:2:2:3,Paderborn:13:8:2:2:3,Frankfurt:14:8:2:2:3,Stuttgart:15:6:2:0:5,Schalke:16:6:1:3:3,Union Berlin:17:6:1:3:3,M’gladbach:18:3:1:0:6
SL|Galatasaray:1:22:7:1:1:19:12,Amedspor:2:20:6:2:1:20:10,Trabzonspor:3:19:6:1:2:22:8,Beşiktaş:4:18:6:0:3:18:10,Fenerbahçe:5:16:5:1:3:23:8,Kasımpaşa:6:16:4:4:1:13:9,Kocaelispor:7:15:5:0:4:11:9,Erzurumspor:8:14:4:2:3:8:12,Çorum:9:13:4:1:4:18:15,Göztepe:10:12:3:3:3:19:16,Alanyaspor:11:12:3:3:3:9:11,Başakşehir:12:11:3:2:4:12:14,Rizespor:13:10:3:1:5:11:15,Konyaspor:14:8:2:2:5:6:9,Gaziantep:15:8:2:2:5:9:15,Gençlerbirliği:16:8:2:2:5:7:18,Samsunspor:17:4:1:1:7:8:21,Eyüpspor:18:3:1:0:8:2:23`.split("\n").forEach(l=>{const[g,s]=l.split("|");s.split(",").forEach(t=>{const a=t.split(":");TM[a[0]]={l:g,r:+a[1],p:+a[2],w:+a[3],d:+a[4],o:+a[5],f:a[6]?+a[6]:null,a:a[7]?+a[7]:null}})});
const pm=l=>Array.from({length:9},(_,k)=>{let f=1;for(let i=2;i<=k;i++)f*=i;return Math.exp(-l)*l**k/f});
`SL|10-30T17:00|Konyaspor|Galatasaray
SL|10-31T10:30|Erzurumspor|Çorum
SL|10-31T13:00|Kocaelispor|Rizespor
SL|10-31T16:00|Fenerbahçe|Göztepe
SL|11-01T10:30|Amedspor|Eyüpspor
SL|11-01T13:00|Trabzonspor|Gaziantep
SL|11-01T13:00|Başakşehir|Samsunspor
SL|11-01T16:00|Kasımpaşa|Beşiktaş
SL|11-02T17:00|Gençlerbirliği|Alanyaspor`.split("\n").forEach(l=>{const[c,t,h,a]=l.split("|"),m={c,t:new Date(`2026-${t}:00Z`),h,a};R.push(m)});
const LN={PL:"İngiltere – Premier Lig",LL:"İspanya – La Liga",SA:"İtalya – Serie A",BL:"Almanya – Bundesliga",SL:"Türkiye – Süper Lig",CL:"Avrupa – Şampiyonlar Ligi"};
const CD={GAL:'Galatasaray',COR:'Çorum',GAZ:'Gaziantep',ALA:'Alanyaspor',GEN:'Gençlerbirliği',FEN:'Fenerbahçe',KAS:'Kasımpaşa',TRA:'Trabzonspor',KON:'Konyaspor',RIZ:'Rizespor',BJK:'Beşiktaş',EYU:'Eyüpspor',BAS:'Başakşehir',KOC:'Kocaelispor',AME:'Amedspor',ERZ:'Erzurumspor',SAM:'Samsunspor',GOZ:'Göztepe'},SLG={},LM={};
`1|GAL|COR|2-2
1|GAZ|ALA|1-1
1|GEN|FEN|2-1
1|KAS|TRA|1-1
1|KON|RIZ|0-1
1|BJK|EYU|1-0
1|BAS|KOC|2-0
1|AME|ERZ|3-0
1|SAM|GOZ|3-3
2|ERZ|GAL|0-4
2|COR|KAS|0-1
2|RIZ|SAM|0-2
2|FEN|KON|4-2
2|ALA|BJK|1-0
2|GOZ|GEN|0-1
2|TRA|BAS|2-1
2|EYU|GAZ|0-1
2|KOC|AME|2-0
3|GEN|ERZ|1-1
3|GAL|GOZ|3-2
3|GAZ|RIZ|1-2
3|KON|KOC|1-2
3|BAS|KAS|1-1
3|EYU|ALA|2-1
3|SAM|FEN|0-2
3|AME|TRA|2-1
3|BJK|COR|6-2
4|BAS|GAL|2-3
4|ERZ|KON|1-0
4|FEN|BJK|1-2
4|KOC|SAM|1-0
4|TRA|GEN|5-0
4|COR|EYU|3-0
4|KAS|AME|2-2
4|GOZ|GAZ|2-4
4|RIZ|ALA|0-1
5|BJK|ERZ|3-0
5|SAM|COR|1-5
5|KON|TRA|1-0
5|ALA|GOZ|2-2
5|EYU|RIZ|0-2
5|AME|BAS|5-0
5|GAL|KOC|1-0
5|GEN|KAS|1-2
5|GAZ|FEN|0-0
6|KAS|KON|0-0
6|COR|ALA|1-2
6|KOC|GAZ|2-0
6|BAS|GEN|4-0
6|TRA|GAL|4-0
6|FEN|EYU|8-0
6|GOZ|RIZ|2-2
6|ERZ|SAM|1-0
6|AME|BJK|3-2
7|GAL|KAS|3-1
7|RIZ|FEN|0-3
7|SAM|TRA|0-3
7|GEN|AME|2-2
7|ALA|ERZ|0-0
7|KON|BAS|0-0
7|BJK|KOC|2-1
7|GAZ|COR|0-3
7|EYU|GOZ|0-4
8|COR|RIZ|2-1
8|ERZ|EYU|2-0
8|GEN|GAL|0-1
8|AME|KON|1-0
8|FEN|ALA|3-0
8|KAS|SAM|4-1
8|KOC|GOZ|1-2
8|BAS|GAZ|2-1
8|TRA|BJK|2-0
9|ALA|KOC|1-2
9|EYU|KAS|0-1
9|SAM|AME|1-2
9|GAZ|ERZ|1-3
9|KON|GEN|2-0
9|GOZ|COR|2-0
9|RIZ|TRA|3-4
9|GAL|FEN|2-1
9|BJK|BAS|2-0`.split('\n').forEach(l=>{const[w,h,a,s]=l.split('|'),[x,y]=s.split('-').map(Number),H=CD[h],A=CD[a];(SLG[H]=SLG[H]||[]).push({w:+w,H:1,o:A,f:x,c:y,r:x>y?'G':x==y?'B':'M'});(SLG[A]=SLG[A]||[]).push({w:+w,H:0,o:H,f:y,c:x,r:y>x?'G':x==y?'B':'M'})});
`C|Stuttgart|Atletico Madrid|1-1
C|Como|Man United|4-1
C|Lille|Galatasaray|2-4
C|Aston Villa|Viking|3-1
C|Bayern|Arsenal|2-2
C|Inter|Shakhtar|1-0
C|Real Madrid|Leipzig|4-1
C|Betis|Feyenoord|1-0
C|Sporting|LASK|2-3
L|Ipswich|N. Forest|1-1
L|Aston Villa|Man City|2-1
L|Arsenal|Everton|2-0
L|Coventry|Fulham|0-1
L|Chelsea|Tottenham|0-2
L|C. Palace|Newcastle|0-2
L|Hull|Brentford|1-1
L|Liverpool|Brighton|2-0
L|Man United|Bournemouth|0-3
L|Sunderland|Leeds|0-0
L|Alaves|Malaga|1-1
L|Rayo|Elche|0-3
L|Racing Santander|Espanyol|2-1
L|Valencia|Villarreal|1-2
L|Atletico Madrid|Deportivo|1-0
L|Athletic|Getafe|4-0
L|Celta|Betis|0-0
L|Real Sociedad|Levante|2-1
L|Barcelona|Real Madrid|1-2
L|Sevilla|Osasuna|2-0
L|Torino|Monza|3-2
L|Cagliari|Bologna|0-2
L|Napoli|Roma|3-3
L|Inter|Fiorentina|2-1
L|Atalanta|Frosinone|4-4
L|Genoa|Venezia|1-0
L|Lecce|Juventus|0-2
L|Udinese|Milan|0-2
L|Stuttgart|M’gladbach|2-3
L|Leipzig|Elversberg|4-0
L|Augsburg|Union Berlin|1-1
L|Mainz|Werder Bremen|2-3
L|Köln|Schalke|0-0
L|Paderborn|Hamburg|1-0
L|Dortmund|Frankfurt|1-0
L|Hoffenheim|Leverkusen|3-0
L|Freiburg|Bayern|1-3`.split('\n').forEach(l=>{const[c,h,a,s]=l.split('|'),[x,y]=s.split('-').map(Number);[[h,a,x,y,1],[a,h,y,x,0]].forEach(([t,o,f,g,H])=>{(LM[t]=LM[t]||[]).push({c,o,f,g,H,r:f>g?'G':f==g?'B':'M'})})});
const sm=g=>g.reduce((s,r)=>(s[r.r]++,s.f+=r.f,s.c+=r.c,s.n++,s),{G:0,B:0,M:0,f:0,c:0,n:0});
function slp2(m){const hg=SLG[m.h],ag=SLG[m.a],av=(g,k)=>g.reduce((s,r)=>s+r[k],0)/(g.length||1),hh=hg.filter(r=>r.H),aa=ag.filter(r=>!r.H),fm=g=>{const q=sm(g.slice(-5));return 1+((q.G*3+q.B)/15-.5)*.2};
const lh=((av(hg,'f')+av(hh,'f'))/2+(av(ag,'c')+av(aa,'c'))/2)/2*1.05*fm(hg),la=((av(ag,'f')+av(aa,'f'))/2+(av(hg,'c')+av(hh,'c'))/2)/2*.95*fm(ag),A=pm(lh),B=pm(la);let p=[0,0,0],o15=0,o25=0,kg=0;A.forEach((x,i)=>B.forEach((y,j)=>{const z=x*y;p[i>j?0:i==j?1:2]+=z;if(i+j>1)o15+=z;if(i+j>2)o25+=z;if(i&&j)kg+=z}));const s=p[0]+p[1]+p[2];m.p=p.map(v=>v/s);m.g=[lh,la];m.x={'Ü1.5':o15,'Ü2.5':o25,'KG Var':kg}}
R.filter(m=>m.c=='SL').forEach(slp2);
const lab=(k,m)=>({'1':`${m.h} kazanır`,X:'Beraberlik','2':`${m.a} kazanır`,'1X':`${m.h} yenilmez (kazanır ya da berabere)`,X2:`${m.a} yenilmez (kazanır ya da berabere)`,'12':'Beraberlik olmaz (biri kazanır)','Ü1.5':'Maçta en az 2 gol','Ü2.5':'Maçta en az 3 gol','KG Var':'İki takım da gol atar',EG1:`${m.h} en az 1 gol atar`,DG1:`${m.a} en az 1 gol atar`,EG2:`${m.h} en az 2 gol atar`}[k]);
const vt=(n,H)=>{const g=SLG[n],v=sm(g.filter(r=>r.H==H));return`${n} ${H?'evinde':'deplasmanda'} ${v.n} maçta ${v.G}G ${v.B}B ${v.M}M (${v.f} attı, ${v.c} yedi)`};
const l5=n=>{const q=sm(SLG[n].slice(-5));return`son 5 maçta ${q.G}G ${q.B}B ${q.M}M`};
const rk=n=>{const t=TM[n];return t?`${n} ${N[t.l]} ${t.r}. sırada (${t.w}G ${t.d}B ${t.o}M)`:n};
function rsn(m,x){const lw=(LU[[m.c,m.h,m.a].join('|')]||{}).why;return rsn1(m,x)+(lw?' Kadro: '+lw:'')}
function rsn1(m,x){if(m.un)return rsUN(m,x);if(m.eu)return rsEU(m,x);if(x.g)return rsg(m,x);const v=m.mp&&{'1':m.mp[0],X:m.mp[1],'2':m.mp[2],'1X':m.mp[0]+m.mp[1],X2:m.mp[1]+m.mp[2],'12':m.mp[0]+m.mp[2]}[x.k];return rsn0(m,x)+(v?` Kontrol modeli (son 6 sezon CSV): %${Math.round(v*100)}, veri sağlayıcıyla uyumlu.`:'')}
function rsn0(m,x){const k=x.k,h=m.h,a=m.a,sl=!!(SLG[m.h]&&SLG[m.a]),i=(n,H)=>sl?`${vt(n,H)}; ${l5(n)}`:rk(n),p=pc(x.p),d=n=>TM[n]?`${n} ${TM[n].d} beraberlik`:null,T=`Ev sahibi ${i(h,1)}. Deplasman ${i(a,0)}.`;
if(['1','1X','2','X2'].includes(k))return T+` ${k.length==1?'Kazanma':'Yenilmeme'} ihtimali ${p}.`;
if(k=='X'||k=='12')return T+` Sezonda ${[d(h),d(a)].filter(Boolean).join(', ')} aldı. Beraberlik ihtimali ${pc(m.p[1])}${k=='12'?`, yani biri kazanır ihtimali ${p}`:''}.`;
const g=n=>SLG[n]?`${n} maç başı ${(sm(SLG[n]).f/SLG[n].length).toFixed(1)} atıp ${(sm(SLG[n]).c/SLG[n].length).toFixed(1)} yiyor`:'';return`${g(h)}; ${g(a)}. Beklenen toplam gol ${m.g?(m.g[0]+m.g[1]).toFixed(1):'?'}. İhtimal ${p}.`}
const GB={o15:.80,o25:.569,kg:.55,h1:.78,a1:.722,h2:.473};
function gmk(m,f){const[a,b,c]=m.p,d=a-c,T=2.682+.85*Math.abs(d);let lo=.02,hi=.98,s=.5;
for(let it=0;it<40;it++){s=(lo+hi)/2;const A=pm(T*s),B=pm(T*(1-s));let w=0,l=0;A.forEach((x,i)=>B.forEach((y,j)=>{if(i>j)w+=x*y;else if(i<j)l+=x*y}));if(w-l<d)lo=s;else hi=s}
const fh=f?f[0]:1,fa=f?f[1]:1,A=pm(T*s*fh),B=pm(T*(1-s)*fa);let t=0,r={o15:0,o25:0,kg:0,h1:0,a1:0,h2:0};A.forEach((x,i)=>B.forEach((y,j)=>{const z=x*y;t+=z;if(i+j>1)r.o15+=z;if(i+j>2)r.o25+=z;if(i&&j)r.kg+=z;if(i>0)r.h1+=z;if(j>0)r.a1+=z;if(i>1)r.h2+=z}));for(const k in r)r[k]/=t;r.lh=T*s*fh;r.la=T*(1-s)*fa;return r}
const rsg=(m,x)=>{const g=n=>SLG[n]?`${n} bu sezon maç başı ${(sm(SLG[n]).f/SLG[n].length).toFixed(1)} atıp ${(sm(SLG[n]).c/SLG[n].length).toFixed(1)} yiyor.`:'',q=gmk(m);return`${g(m.h)} ${g(m.a)} Beklenen gol: ${m.h} ${q.lh.toFixed(1)}, ${m.a} ${q.la.toFixed(1)} (1-X-2 ihtimallerinden ve ligin gol ortalamasından hesaplandı). Bu seçeneğin lig geneli baz oranı %${Math.round(x.bs*100)}, bu maçta %${Math.round(x.p*100)}.`};
let LU={};let PS={};
const p3=(l,k)=>{const A=pm(l),B=pm(k);let w=0,d=0,v=0;A.forEach((x,i)=>B.forEach((y,j)=>{const z=x*y;i>j?w+=z:i==j?d+=z:v+=z}));const t=w+d+v;return[w/t,d/t,v/t]};
const luf=m=>{const f=(LU[[m.c,m.h,m.a].join('|')]||{}).f;return f&&(f[0]!=1||f[1]!=1)?f:null};
const pa=m=>{const f=luf(m);if(!f)return m.p;const g=gmk(m),q0=p3(g.lh,g.la),q1=p3(g.lh*f[0],g.la*f[1]),r=m.p.map((p,i)=>p*q1[i]/q0[i]),t=r[0]+r[1]+r[2];return r.map(x=>x/t)};
const NOTOT=new Set(['SA','BL']);const NB=m=>{const t=+m.t;return t>=Date.UTC(2026,10,8)&&t<Date.UTC(2026,10,9)};
const EO=x=>x.o*({'Ü1.5':.88,'Ü2.5':.78,'EG1':.9,'DG1':.9,'EG2':.9}[x.k]||.88);
function pick(m){if(m.np)return{o:[],s:null};const[a,b,c]=pa(m),mv=m.mp?{'1':m.mp[0],X:m.mp[1],'2':m.mp[2],'1X':m.mp[0]+m.mp[1],X2:m.mp[1]+m.mp[2],'12':m.mp[0]+m.mp[2]}:null,okm=x=>!mv||Math.abs(x.p-mv[x.k])<=.1,
good=x=>x.p>=.55&&x.o>=1.15&&(x.k=='1'||x.k=='1X'?a>=c:x.k=='2'||x.k=='X2'?c>=a:b<=.22),gm=gmk(m,luf(m)),Bz=(GP[m.c]||GP._).B,
gd=[['Ü1.5',gm.o15,Bz.o15,.05],['Ü2.5',gm.o25,Bz.o25,.05],['KG Var',gm.kg,Bz.kg,.05],['EG1',gm.h1,Bz.h1,.03],['DG1',gm.a1,Bz.a1,.03],['EG2',gm.h2,Bz.h2,.03]].map(([k,p,bs,mg])=>({k,p,o:1/p,bs,g:1,mg})).filter(x=>x.p>=.55&&x.o>=1.15&&x.p>=x.bs+x.mg&&!(NOTOT.has(m.c)&&['Ü1.5','Ü2.5','KG Var'].includes(x.k))),
rs=[['1',a],['2',c],['1X',a+b],['X2',b+c],['12',a+c]].map(([k,p])=>({k,p,o:1/p})).filter(okm).filter(good),
fam=x=>x.g?(['Ü1.5','Ü2.5','KG Var'].includes(x.k)?'t':'k'):'r',all=[...rs,...gd].sort((x,y)=>y.p-x.p),o=[];
['r','t','k'].forEach(f=>{const x=all.find(y=>fam(y)==f);if(x)o.push(x)});all.forEach(x=>{if(o.length<3&&!o.includes(x))o.push(x)});o.sort((x,y)=>y.p-x.p);
if(NB(m)){const bd2=[['Ü1.5',gm.o15,Bz.o15],['Ü2.5',gm.o25,Bz.o25],['KG Var',gm.kg,Bz.kg],['EG1',gm.h1,Bz.h1],['DG1',gm.a1,Bz.a1],['EG2',gm.h2,Bz.h2]].map(([k,p,bs])=>({k,p,o:1/p,bs,mg:0,g:1})).filter(x=>x.p>=.60&&x.p<=.85&&!(NOTOT.has(m.c)&&['Ü1.5','Ü2.5','KG Var'].includes(x.k))),o2=[],dz=x=>Math.abs(x.p-.72);['r','t','k'].forEach(f=>{const x=bd2.filter(y=>fam(y)==f).sort((u,v)=>dz(u)-dz(v))[0];if(x)o2.push(x)});bd2.forEach(x=>{if(o2.length<3&&!o2.includes(x))o2.push(x)});o2.sort((x,y)=>y.p-x.p);return{o:o2,s:[...o2].sort((u,v)=>dz(u)-dz(v))[0]||null}}
const s=o.filter(x=>x.p>=.7).sort((x,y)=>y.o-x.o)[0]||null;return{o,s}}
const NO=['Bu maçta %70 üzeri güvenli seçim yok, maç belirsiz.','Bu maçta dengeli (%45-69) seçenek yok.','Bu maçta makul yüksek oranlı (%22-44) seçenek yok.'];
const rsnH=(m,x)=>{const t=rsn(m,x),s=t.split(/(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ])/),k=s.find(z=>/ihtimal/i.test(z))||s[0],r=s.filter(z=>z!==k);return`<div class='rs1'>${k}</div>`+(r.length?`<details class='rsd'><summary>Neden? Ayrıntılar</summary><div class='rsb'>${r.join(' ')}</div></details>`:'')};const pcard=(t,i,m,x,sub)=>x?`<div class='pc k${i}'>${sub||''}<div class='ph'><span class='tg'>${t}</span><span class='chp'><span>Tahmini oran <b>${(EO(x)).toFixed(2)}</b></span><span>İhtimal <b>%${Math.round(x.p*100)}</b></span></span></div><div class='pl'>${lab(x.k,m)}</div>${x.o<1.15?`<div class='mut'>Oran çok düşük, kuponda anlamsız.</div>`:''}<div class='pw'>${rsnH(m,x)}</div></div>`:`<div class='pc k${i}' style='opacity:.55'><div class='ph'><span class='tg'>${t}</span></div><div class='pw'>${NO[i]}</div></div>`;
const seg=(G,B,M)=>{const t=G+B+M||1;return`<div class='seg'><i style='width:${G/t*100}%;background:var(--ok)'></i><i style='width:${B/t*100}%;background:var(--mut)'></i><i style='width:${M/t*100}%;background:var(--hot)'></i></div>`};
const tp=(n,H)=>{const t=TM[n],g=SLG[n],l=LM[n];let s=`<div class='an'><h4>${H?'Ev sahibi':'Deplasman'}: ${n}${t?` · ${N[t.l]} ${t.r}. sıra`:''}</h4>`;
if(t)s+=`<div class='mut'>${t.p} puan · ${t.w}G ${t.d}B ${t.o}M${t.f!=null?` · ${t.f} attı ${t.a} yedi`:''}</div>`+seg(t.w,t.d,t.o);
if(g){const v=sm(g.filter(r=>r.H==H));s+=`<div class='tr'>Son 5 maç: ${g.slice(-5).map(r=>`<i class='fi f${r.r}'>${r.r}</i>`).join('')}</div><div class='tr'>${H?'Evinde':'Deplasmanda'}: ${v.G}G ${v.B}B ${v.M}M, ${v.f} attı ${v.c} yedi</div>${seg(v.G,v.B,v.M)}<div class='mut'>${g.slice(-5).reverse().map(r=>`${r.w}. hafta ${r.H?'ev':'dep'} ${r.o} ${r.f}–${r.c}`).join(' · ')}</div>`}
else s+=`<div class='mut'>Bu lig için son 5 lig maçı ve ev/deplasman verisi henüz eklenmedi.</div>`;return s+'</div>'};
`SA|10-31T17:00|Udinese|Roma|16.3|20.7|63
SA|10-31T19:45|Milan|Inter|26.6|25.1|48.3
SA|11-01T11:30|Como|Venezia|74.4|14.9|10.7
SA|11-01T14:00|Frosinone|Torino|43.6|25|31.4
SA|11-01T14:00|Lazio|Cagliari|68.3|19.5|12.2
SA|11-01T17:00|Lecce|Genoa|31.7|30.3|38
SA|11-01T19:45|Juventus|Napoli|42.1|28.3|29.6
SA|11-02T17:30|Sassuolo|Fiorentina|34.2|25.8|40
SA|11-02T19:45|Atalanta|Parma|64.4|20.3|15.3`.split("\n").forEach(l=>{const[c,t,h,a,x,y,z]=l.split("|"),q=+x+ +y+ +z;R.push({c,t:new Date(`2026-${t}:00Z`),h,a,p:[x/q,y/q,z/q]})});
N.L1="Ligue 1";C.L1="#1b4f9c";LN.L1="Fransa – Ligue 1";
`L1|10-30T18:00|Le Havre|PSG|8.9|12.9|78.2
L1|10-30T18:00|Nice|Rennes|34.7|25|40.3
L1|10-30T20:05|Lille|Lens|38.6|26.3|35.1
L1|10-31T19:45|Troyes|Le Mans|41.9|27.1|31
L1|11-01T14:00|Strasbourg|Auxerre|52.6|23.8|23.6
L1|11-01T16:15|Lyon|Angers|69.4|17.8|12.8
L1|11-01T16:15|Paris FC|Monaco|41.9|26.8|31.3
L1|11-01T19:45|Marseille|Toulouse|50|24.3|25.7
L1|11-02T19:45|Lorient|Brest|39|28.7|32.3`.split("\n").forEach(l=>{const[c,t,h,a,x,y,z]=l.split("|"),q=+x+ +y+ +z;R.push({c,t:new Date(`2026-${t}:00Z`),h,a,p:[x/q,y/q,z/q]})});
"PSG:1:17:5:2:1,Rennes:2:16:5:1:2,Lille:3:15:4:3:1,Monaco:4:15:4:3:1,Lyon:5:14:4:2:2,Paris FC:6:14:4:2:2,Lens:7:13:4:1:3,Marseille:8:12:4:0:4,Lorient:9:12:3:3:2,Nice:10:11:3:2:3,Toulouse:11:10:2:4:2,Auxerre:12:10:3:1:4,Brest:13:9:2:3:3,Angers:14:8:2:2:4,Le Mans:15:7:1:4:3,Strasbourg:16:7:2:1:5,Troyes:17:5:1:2:5,Le Havre:18:2:0:2:6".split(",").forEach(t=>{const a=t.split(":");TM[a[0]]={l:"L1",r:+a[1],p:+a[2],w:+a[3],d:+a[4],o:+a[5],f:null,a:null}});
N.KSA="Suudi Pro Lig";C.KSA="#006c35";LN.KSA="Suudi Arabistan – Roshn Pro Lig (13. hafta ertelendi, yeni tarih yok)";
"Al Hilal:1:30:10:0:1:32:9,Al Qadsiah:2:28:9:1:2:32:12,Al Nassr:3:28:9:1:1:28:11,Al Ittihad:4:24:7:3:1:21:11,Neom:5:22:7:1:4:18:10,Al Ahli:6:21:7:0:4:28:19,Al Ettifaq:7:19:5:4:3:18:17,Diriyah:8:15:4:3:5:10:13,Al Khaleej:9:15:3:6:3:14:19,Al Shabab:10:14:3:5:3:20:15,Al Kholood:11:12:3:3:5:17:26,Al Riyadh:12:12:3:3:5:11:25,Al Fayha:13:11:2:5:5:16:20,Al Hazem:14:10:2:4:6:14:20,Al Faisaly:15:10:2:4:6:13:24,Al Fateh:16:6:1:3:8:10:25,Al Taawoun:17:5:0:5:7:6:20,Abha:18:3:0:3:8:7:19".split(",").forEach(t=>{const a=t.split(":");TM[a[0]]={l:"KSA",r:+a[1],p:+a[2],w:+a[3],d:+a[4],o:+a[5],f:+a[6],a:+a[7]}});
const KM=(()=>{let f=0,p=0;Object.values(TM).forEach(t=>{if(t.l=='KSA'){f+=t.f;p+=t.w+t.d+t.o}});return f/p})();
function ksa(m){const h=TM[m.h],a=TM[m.a],k=4,at=t=>((t.f+k*KM)/(t.w+t.d+t.o+k))/KM,df=t=>((t.a+k*KM)/(t.w+t.d+t.o+k))/KM,lh=KM*1.12*at(h)*df(a),la=KM/1.12*at(a)*df(h),A=pm(lh),B=pm(la);let p=[0,0,0];A.forEach((x,i)=>B.forEach((y,j)=>{p[i>j?0:i==j?1:2]+=x*y}));const q=p[0]+p[1]+p[2];m.p=p.map(v=>v/q);m.g=[lh,la]}
`KSA|10-29T14:35|Al Khaleej|Al Hazem
KSA|10-29T18:00|Al Riyadh|Al Qadsiah
KSA|10-29T18:00|Al Nassr|Al Kholood
KSA|10-30T12:30|Abha|Al Ittihad
KSA|10-30T14:50|Diriyah|Neom
KSA|10-30T18:00|Al Shabab|Al Ahli
KSA|10-31T13:30|Al Taawoun|Al Ettifaq
KSA|10-31T14:55|Al Fayha|Al Faisaly
KSA|10-31T18:00|Al Hilal|Al Fateh`.split("\n").forEach(l=>{const[c,t,h,a]=l.split("|"),m={c,t:new Date(`2026-${t}:00Z`),h,a};ksa(m);R.push(m)});
N.BEL="Belçika Pro Lig";C.BEL="#c8102e";LN.BEL="Belçika – Jupiler Pro Lig";
"Club Brugge:1:27:9:0:1:26:8,Union SG:2:26:8:2:0:29:7,Gent:3:25:8:1:1:19:6,Charleroi:4:24:8:0:2:21:12,Anderlecht:5:19:6:1:3:13:11,Genk:6:15:4:3:3:18:14,Lommel SK:7:15:4:3:3:13:11,Westerlo:8:14:4:2:4:25:25,Standard:9:12:3:3:4:15:16,Mechelen:10:12:3:3:4:13:18,Zulte Waregem:11:11:3:2:5:12:16,Antwerp:12:10:3:1:6:16:22,Beveren:13:10:3:1:6:13:20,OH Leuven:14:9:2:3:5:10:17,STVV:15:8:2:2:6:18:21,La Louvière:16:7:2:1:7:13:23,Cercle Brugge:17:6:1:3:6:13:22,Kortrijk:18:4:1:1:8:4:22".split(",").forEach(t=>{const a=t.split(":");TM[a[0]]={l:"BEL",r:+a[1],p:+a[2],w:+a[3],d:+a[4],o:+a[5],f:+a[6],a:+a[7]}});
const KB=(()=>{let f=0,p=0;Object.values(TM).forEach(t=>{if(t.l=='BEL'){f+=t.f;p+=t.w+t.d+t.o}});return f/p})();
function bel(m){const h=TM[m.h],a=TM[m.a],k=4,at=t=>((t.f+k*KB)/(t.w+t.d+t.o+k))/KB,df=t=>((t.a+k*KB)/(t.w+t.d+t.o+k))/KB,lh=KB*1.12*at(h)*df(a),la=KB/1.12*at(a)*df(h),A=pm(lh),B=pm(la);let p=[0,0,0];A.forEach((x,i)=>B.forEach((y,j)=>{p[i>j?0:i==j?1:2]+=x*y}));const q=p[0]+p[1]+p[2];m.p=p.map(v=>v/q);m.g=[lh,la]}
`BEL|10-30T19:45|Zulte Waregem|Club Brugge
BEL|10-31T15:00|Mechelen|Genk
BEL|10-31T17:15|Standard|Kortrijk
BEL|10-31T19:45|Beveren|Union SG
BEL|10-31T19:45|Anderlecht|Westerlo
BEL|11-01T12:30|Cercle Brugge|Antwerp
BEL|11-01T15:00|STVV|OH Leuven
BEL|11-01T17:30|Lommel SK|Gent
BEL|11-01T18:15|Charleroi|La Louvière
BEL|11-04T19:45|Kortrijk|Mechelen`.split("\n").forEach(l=>{const[c,t,h,a]=l.split("|"),m={c,t:new Date(`2026-${t}:00Z`),h,a};bel(m);R.push(m)});
`PL|11-06T20:00|Everton|Coventry|56.1|23.6|20.3
PL|11-07T12:30|Leeds|Tottenham|34.6|28.2|37.2
PL|11-07T15:00|Arsenal|Hull|83.5|11.3|5.2
PL|11-07T15:00|Fulham|Newcastle|45.9|25.9|28.2
PL|11-07T17:30|N. Forest|Man City|20.8|23.3|55.9
PL|11-08T14:00|Brighton|Brentford|49.8|24.6|25.6
PL|11-08T14:00|C. Palace|Liverpool|18.3|21.4|60.3
PL|11-08T14:00|Ipswich|Bournemouth|25.4|25.6|49
PL|11-08T14:00|Sunderland|Chelsea|25.6|26.2|48.2
PL|11-08T16:30|Man United|Aston Villa|43.6|25.9|30.5
LL|11-06T20:00|Sevilla|Alaves|49.1|27.6|23.3
LL|11-07T13:00|Malaga|Racing Santander|40.2|26.4|33.4
LL|11-07T15:15|Espanyol|Deportivo|40.9|28.6|30.5
LL|11-07T17:30|Osasuna|Athletic|26.3|27.8|45.9
LL|11-07T20:00|Valencia|Real Madrid|9.8|14.6|75.6
LL|11-08T13:00|Elche|Betis|29.6|25.7|44.7
LL|11-08T15:15|Real Sociedad|Rayo|56.9|22.9|20.2
LL|11-08T17:30|Celta|Levante|52.5|25.6|21.9
LL|11-08T17:30|Villarreal|Getafe|66.7|20|13.3
LL|11-08T20:00|Atletico Madrid|Barcelona|26|22|52
SA|11-06T19:45|Venezia|Udinese|42.1|27.3|30.6
SA|11-07T14:00|Cagliari|Frosinone|35|26.1|38.9
SA|11-07T14:00|Torino|Lecce|53.4|25.8|20.8
SA|11-07T17:00|Parma|Bologna|21.4|27.1|51.5
SA|11-07T19:45|Roma|Sassuolo|74.2|14.9|10.9
SA|11-08T11:30|Napoli|Lazio|42.3|26.5|31.2
SA|11-08T14:00|Genoa|Milan|20.6|26.3|53.1
SA|11-08T14:00|Monza|Atalanta|28|25.6|46.4
SA|11-08T17:00|Inter|Como|51.4|23.1|25.5
SA|11-08T19:45|Fiorentina|Juventus|27.5|26.7|45.8
BL|11-06T19:30|Hamburg|M’gladbach|38.7|26.2|35.1
BL|11-07T14:30|Dortmund|Elversberg|74.5|14.6|10.9
BL|11-07T14:30|Leipzig|Augsburg|66.5|17.1|16.4
BL|11-07T14:30|Mainz|Bayern|12.9|14.4|72.7
BL|11-07T14:30|Paderborn|Frankfurt|31.6|24.8|43.6
BL|11-07T17:30|Stuttgart|Werder Bremen|59.6|19.9|20.5
BL|11-08T14:30|Köln|Leverkusen|23.5|22.5|54
BL|11-08T16:30|Freiburg|Union Berlin|64.4|20.1|15.5
BL|11-08T18:30|Hoffenheim|Schalke|59.4|21.2|19.4
L1|11-06T19:45|Toulouse|Strasbourg|45.7|25.3|29
L1|11-07T18:00|Auxerre|Paris FC|21.9|23.9|54.2
L1|11-07T20:05|PSG|Troyes|88.4|7.9|3.7
L1|11-08T14:00|Rennes|Lille|44|25.9|30.1
L1|11-08T16:15|Angers|Nice|27.6|26.1|46.3
L1|11-08T16:15|Brest|Lyon|33.9|27.3|38.8
L1|11-08T16:15|Le Havre|Lorient|33.9|28.5|37.6
L1|11-08T16:15|Le Mans|Monaco|21.8|23.4|54.8
L1|11-08T19:45|Lens|Marseille|43.8|24.5|31.7`.split("\n").forEach(l=>{const[c,t,h,a,x,y,z]=l.split("|"),q=+x+ +y+ +z;R.push({c,t:new Date(`2026-${t}:00Z`),h,a,p:[x/q,y/q,z/q]})});
/* EL/ECL: 5 Kasım */N.EL="Avrupa Ligi";C.EL="#f58220";LN.EL="Avrupa – UEFA Avrupa Ligi";N.ECL="Konferans Ligi";C.ECL="#2db34a";LN.ECL="Avrupa – Konferans Ligi";
const EUR={EL:`Ararat-Armenia|Sparta Praha|1|4
Omonia|Celta|1|0
Milan|Benfica|0|2
Leverkusen|Celje|2|0
Hapoel Beer-Sheva|Dinamo Zagreb|0|0
Olympiacos|Jagiellonia|2|1
Anderlecht|Lyon|1|2
Sturm Graz|Rennes|0|0
Sunderland|AZ Alkmaar|1|0
OFI Crete|Hoffenheim|2|0
Levski Sofia|Salzburg|0|1
Beşiktaş|Marseille|4|1
Celtic|Ferencváros|1|3
C. Palace|Lech Poznań|4|0
Viktoria Plzeň|Union SG|0|3
Juventus|NEC Nijmegen|5|0
Lillestrøm|Torreense|1|2
Real Sociedad|Bournemouth|1|2
Sparta Praha|Lillestrøm|1|1
AZ Alkmaar|Hapoel Beer-Sheva|2|1
Salzburg|Milan|0|4
Lech Poznań|Leverkusen|0|4
Celje|Omonia|0|3
Lyon|C. Palace|3|2
Union SG|Real Sociedad|1|1
Torreense|Sunderland|1|2
Bournemouth|Sturm Graz|3|0
Ferencváros|Viktoria Plzeň|2|1
Dinamo Zagreb|Anderlecht|1|0
Jagiellonia|Ararat-Armenia|3|1
NEC Nijmegen|Levski Sofia|1|1
Marseille|Olympiacos|0|1
Celta|Juventus|1|2
Benfica|Celtic|4|1
Rennes|OFI Crete|2|1
Hoffenheim|Beşiktaş|2|3
Ararat-Armenia|AZ Alkmaar|0|4
Ferencváros|Torreense|4|1
Dinamo Zagreb|NEC Nijmegen|2|4
Juventus|Rennes|2|2
Lech Poznań|Sunderland|1|1
OFI Crete|Leverkusen|0|2
Union SG|Hapoel Beer-Sheva|4|0
Sturm Graz|Marseille|1|0
Bournemouth|Milan|3|0
Beşiktaş|C. Palace|2|2
Celtic|Celta|1|2
Viktoria Plzeň|Levski Sofia|1|2
Jagiellonia|Anderlecht|0|3
Lillestrøm|Real Sociedad|0|6
Celje|Salzburg|2|2
Olympiacos|Sparta Praha|1|0
Omonia|Benfica|1|4
Hoffenheim|Lyon|3|0
Rennes|Olympiacos|0|0
Sparta Praha|Bournemouth|1|3
Real Sociedad|Lyon|1|1
Lillestrøm|Viktoria Plzeň|0|1
C. Palace|Hoffenheim|1|1
Levski Sofia|Jagiellonia|1|0
Milan|Ferencváros|0|2
Anderlecht|Salzburg|2|0
Celtic|Beşiktaş|3|2
NEC Nijmegen|Omonia|3|1
AZ Alkmaar|Juventus|1|2
Benfica|Lech Poznań|3|1
Celta|Union SG|1|2
Hapoel Beer-Sheva|OFI Crete|0|2
Leverkusen|Marseille|0|1
Sturm Graz|Celje|2|3
Sunderland|Dinamo Zagreb|0|2
Torreense|Ararat-Armenia|3|2`,ECL:`Lugano|Crvena Zvezda|3|2
Hajduk Split|Ajax|2|1
Gent|Aarhus|1|0
Egnatia|Midtjylland|1|1
KuPS Kuopio|Trabzonspor|2|4
Mjällby|Inter Escaldes|2|0
Panathinaikos|Borac|2|1
CSKA Sofia|Monaco|1|2
Riga|Kairat Almaty|1|1
Craiova|Getafe|1|1
Atalanta|Pafos|3|1
Brighton|Kauno Žalgiris|4|0
Copenhagen|Braga|3|0
Twente|Thun|1|0
Hearts|Nordsjælland|1|1
Sint-Truidense|Iberia Tbilisi|2|0
Freiburg|Jablonec|3|2
Brann|Lincoln Red Imps|2|1
Kairat Almaty|Panathinaikos|1|5
Iberia Tbilisi|Mjällby|1|1
Nordsjælland|CSKA Sofia|2|2
Crvena Zvezda|Copenhagen|2|2
Jablonec|Brighton|0|0
Kauno Žalgiris|Brann|1|4
Getafe|Lugano|2|5
Inter Escaldes|Craiova|1|3
Pafos|Riga|1|1
Trabzonspor|Hearts|2|0
Ajax|Atalanta|2|0
Aarhus|Egnatia|1|1
Monaco|Freiburg|3|0
Midtjylland|Sint-Truidense|0|1
Thun|Hajduk Split|0|1
Borac|KuPS Kuopio|2|0
Lincoln Red Imps|Twente|1|4
Braga|Gent|2|0
Getafe|Brighton|0|1
Trabzonspor|Freiburg|0|1
Aarhus|Braga|0|0
Atalanta|Kairat Almaty|1|1
Crvena Zvezda|Inter Escaldes|2|1
KuPS Kuopio|Gent|0|0
Lincoln Red Imps|Hajduk Split|1|0
Midtjylland|Ajax|1|6
Mjällby|Borac|2|0
Thun|Hearts|3|1
Copenhagen|Iberia Tbilisi|2|1
Lugano|Kauno Žalgiris|3|0
Monaco|Nordsjælland|2|0
Panathinaikos|CSKA Sofia|2|1
Riga|Jablonec|1|1
Sint-Truidense|Brann|1|1
Twente|Pafos|3|1
Craiova|Egnatia|2|0`};
const euS=c=>{const s={};EUR[c].split("\n").forEach(l=>{const[h,a,x,y]=l.split("|");[[h,+x,+y],[a,+y,+x]].forEach(([n,f,g])=>{const q=s[n]=s[n]||{n:0,f:0,c:0,w:0,d:0,l:0,p:0};q.n++;q.f+=f;q.c+=g;f>g?(q.w++,q.p+=3):f==g?(q.d++,q.p++):q.l++})});return s};
const EUS={EL:euS('EL'),ECL:euS('ECL')},EUG={};
Object.keys(EUS).forEach(c=>{let f=0,n=0;Object.values(EUS[c]).forEach(q=>{f+=q.f;n+=q.n});EUG[c]=f/n});
function eum(m){const S=EUS[m.c],g=EUG[m.c],k=8,e=n=>S[n]||{n:0,f:0,c:0},at=t=>((t.f+k*g)/(t.n+k))/g,df=t=>((t.c+k*g)/(t.n+k))/g,h=e(m.h),a=e(m.a),lh=g*1.12*at(h)*df(a),la=g/1.12*at(a)*df(h),A=pm(lh),B=pm(la);let p=[0,0,0];A.forEach((x,i)=>B.forEach((y,j)=>{p[i>j?0:i==j?1:2]+=x*y}));const q=p[0]+p[1]+p[2];m.p=p.map(v=>v/q);m.g=[lh,la];m.eu=1}
const rsEU=(m,x)=>{const S=EUS[m.c],f=n=>{const q=S[n];return q?`${n} lig aşamasında ${q.n} maçta ${q.f} attı, ${q.c} yedi`:`${n} için lig aşaması verisi yok`},q=x.g?gmk(m):null,g=q?[q.lh,q.la]:m.g;return`${f(m.h)}; ${f(m.a)}. Model yalnızca bu sezonki lig aşaması skorlarına dayanır (${m.c=='EL'?'3-4':'2'} maç), güvenilirliği düşüktür ve kontrol modeli yoktur. Beklenen gol: ${m.h} ${g[0].toFixed(1)}, ${m.a} ${g[1].toFixed(1)}. İhtimal ${pc(x.p)}.`};
const euTbl=m=>{const rows=Object.entries(EUS[m.c]).sort((x,y)=>y[1].p-x[1].p||(y[1].f-y[1].c)-(x[1].f-x[1].c)||y[1].f-x[1].f||y[1].w-x[1].w);return`<div class='box'><div class='tb th'><span>#</span><span>Takım</span><span>O</span><span>G</span><span>B</span><span>M</span><span>A</span><span>Y</span><span>Av</span><span>P</span></div>${rows.map(([n,q],i)=>`<div class='tb${n==m.h||n==m.a?' hl':''}' style='border-left:3px solid ${i<8?'var(--ok)':i<24?'var(--warn)':'var(--mut)'}'><span>${i+1}</span><span>${bd(n)} <span data-tm="${n}">${n}</span></span><span>${q.n}</span><span>${q.w}</span><span>${q.d}</span><span>${q.l}</span><span>${q.f}</span><span>${q.c}</span><span>${q.f-q.c>0?'+':''}${q.f-q.c}</span><b>${q.p}</b></div>`).join('')}<div class='mut'>Lig aşaması, UEFA sayfasındaki oynanmış maç skorlarından hesaplandı; bugünkü maçlar sonuçlanınca güncellenir. Eşitlikte puan, averaj, atılan gol ve galibiyet sırası kullanıldı, UEFA kriterleriyle küçük farklar olabilir. Yeşil: ilk 8, sarı: 9-24 (play-off), gri: elenir.</div></div>`};
`EL|11-05T17:45|Milan|Ferencváros
EL|11-05T17:45|Sparta Praha|Bournemouth
EL|11-05T17:45|C. Palace|Hoffenheim
EL|11-05T17:45|Lillestrøm|Viktoria Plzeň
EL|11-05T17:45|NEC Nijmegen|Omonia
EL|11-05T17:45|Levski Sofia|Jagiellonia
EL|11-05T17:45|Real Sociedad|Lyon
EL|11-05T17:45|Anderlecht|Salzburg
EL|11-05T20:00|AZ Alkmaar|Juventus
EL|11-05T20:00|Leverkusen|Marseille
EL|11-05T20:00|Celtic|Beşiktaş
EL|11-05T20:00|Hapoel Beer-Sheva|OFI Crete
EL|11-05T20:00|Celta|Union SG
EL|11-05T20:00|Torreense|Ararat-Armenia
EL|11-05T20:00|Sturm Graz|Celje
EL|11-05T20:00|Benfica|Lech Poznań
EL|11-05T20:00|Sunderland|Dinamo Zagreb
ECL|11-05T17:45|Aarhus|Braga
ECL|11-05T17:45|Atalanta|Kairat Almaty
ECL|11-05T17:45|Crvena Zvezda|Inter Escaldes
ECL|11-05T17:45|Midtjylland|Ajax
ECL|11-05T17:45|Thun|Hearts
ECL|11-05T17:45|KuPS Kuopio|Gent
ECL|11-05T17:45|Lincoln Red Imps|Hajduk Split
ECL|11-05T17:45|Mjällby|Borac
ECL|11-05T17:45|Trabzonspor|Freiburg
ECL|11-05T20:00|Craiova|Egnatia
ECL|11-05T20:00|Copenhagen|Iberia Tbilisi
ECL|11-05T20:00|Lugano|Kauno Žalgiris
ECL|11-05T20:00|Twente|Pafos
ECL|11-05T20:00|Getafe|Brighton
ECL|11-05T20:00|Monaco|Nordsjælland
ECL|11-05T20:00|Panathinaikos|CSKA Sofia
ECL|11-05T20:00|Riga|Jablonec
ECL|11-05T20:00|Sint-Truidense|Brann`.split("\n").forEach(l=>{const[c,t,h,a]=l.split("|"),m={c,t:new Date(`2026-${t}:00Z`),h,a};eum(m);R.push(m)});
/* Fikstür genişletme: CL 5. hafta, BL/L1 20 Kas, EL 5. hafta, ECL 4. hafta */
`CL|11-24T17:45|Bodø/Glimt|LASK|63|18.6|18.4
CL|11-24T17:45|Galatasaray|Aston Villa|36.4|24.2|39.4
CL|11-24T20:00|Arsenal|Dortmund|68|18.8|13.2
CL|11-24T20:00|Como|AEK Atina|72.8|15.9|11.3
CL|11-24T20:00|Feyenoord|Porto|33|24.8|42.2
CL|11-24T20:00|Man City|Napoli|77.6|13.4|9
CL|11-24T20:00|Leipzig|Lens|67.9|17.1|15
CL|11-24T20:00|Real Madrid|PSV|80.3|11.4|8.3
CL|11-24T20:00|Slovan Bratislava|Betis|10.3|14.8|74.9
CL|11-25T17:45|Sabah|Barcelona|3.8|6.3|89.9
BL|11-20T19:30|Bayern|Köln|90|6.6|3.4
L1|11-20T19:45|Troyes|Le Havre|46.5|26.1|27.4`.split("\n").forEach(l=>{const[c,t,h,a,x,y,z]=l.split("|"),q=+x+ +y+ +z;R.push({c,t:new Date(`2026-${t}:00Z`),h,a,p:[x/q,y/q,z/q]})});
`EL|11-26T17:45|Beşiktaş|Hapoel Beer-Sheva
EL|11-26T17:45|Salzburg|Ararat-Armenia
EL|11-26T17:45|Viktoria Plzeň|Benfica
EL|11-26T17:45|Dinamo Zagreb|Leverkusen
EL|11-26T17:45|Olympiacos|Milan
EL|11-26T17:45|Marseille|Levski Sofia
EL|11-26T17:45|Union SG|Lech Poznań
EL|11-26T17:45|Celta|Bournemouth
EL|11-26T20:00|Sparta Praha|AZ Alkmaar
EL|11-26T20:00|C. Palace|Real Sociedad
EL|11-26T17:45|Ferencváros|Celje
EL|11-26T20:00|Juventus|Omonia
EL|11-26T20:00|NEC Nijmegen|Rennes
EL|11-26T20:00|OFI Crete|Anderlecht
EL|11-26T20:00|Lyon|Lillestrøm
EL|11-26T20:00|Torreense|Celtic
EL|11-26T20:00|Sunderland|Jagiellonia
EL|11-26T20:00|Hoffenheim|Sturm Graz
ECL|11-26T15:30|Kairat Almaty|Mjällby
ECL|11-26T17:45|Ajax|Thun
ECL|11-26T17:45|Brighton|Craiova
ECL|11-26T17:45|Iberia Tbilisi|Getafe
ECL|11-26T17:45|Jablonec|Lugano
ECL|11-26T17:45|Kauno Žalgiris|Riga
ECL|11-26T17:45|Hearts|Monaco
ECL|11-26T17:45|Egnatia|Lincoln Red Imps
ECL|11-26T17:45|Pafos|Midtjylland
ECL|11-26T17:45|Brann|Aarhus
ECL|11-26T20:00|Nordsjælland|Panathinaikos
ECL|11-26T20:00|Borac|Atalanta
ECL|11-26T20:00|Hajduk Split|Sint-Truidense
ECL|11-26T20:00|Inter Escaldes|Copenhagen
ECL|11-26T20:00|Gent|Crvena Zvezda
ECL|11-26T20:00|CSKA Sofia|Trabzonspor
ECL|11-26T20:00|Braga|KuPS Kuopio
ECL|11-26T20:00|Freiburg|Twente`.split("\n").forEach(l=>{const[c,t,h,a]=l.split("|"),m={c,t:new Date(`2026-${t}:00Z`),h,a};eum(m);R.push(m)});
/* UNL */N.UNL="Milli Takımlar Ligi";C.UNL="#1d4ed8";LN.UNL="Avrupa – UEFA Uluslar Ligi";
const UNR=`D1|Andorra|1|2|Malta
A2|Hollanda|1|1|Almanya
A2|Sırbistan|1|2|Yunanistan
A4|Norveç|3|2|Danimarka
A4|Portekiz|1|0|Galler
B3|Avusturya|3|1|İsrail
B3|Kosova|1|0|İrlanda Cumhuriyeti
D2|Liechtenstein|0|2|Litvanya
B2|Gürcistan|0|1|Kuzey İrlanda
C2|Ermenistan|2|0|Letonya
A1|İtalya|0|2|Belçika
A1|Türkiye|0|1|Fransa
B2|Macaristan|0|1|Ukrayna
B4|Polonya|0|0|Bosna-Hersek
B4|İsveç|2|1|Romanya
C2|Karadağ|2|1|Kıbrıs
B1|Slovenya|0|0|İskoçya
C1|San Marino|0|7|Finlandiya
C3|Faroe Adaları|1|1|Kazakistan
C4|Bulgaristan|1|2|Lüksemburg
C4|İzlanda|1|1|Estonya
A3|Çekya|1|2|Hırvatistan
A3|İngiltere|2|3|İspanya
B1|Kuzey Makedonya|0|3|İsviçre
C1|Arnavutluk|2|0|Belarus
C3|Slovakya|2|0|Moldova
D2|Litvanya|1|1|Azerbaycan
A2|Sırbistan|1|2|Hollanda
A4|Danimarka|2|0|Galler
B3|Avusturya|3|1|Kosova
D1|Gibraltar|0|0|Andorra
A2|Almanya|0|1|Yunanistan
A4|Norveç|1|2|Portekiz
B3|İsrail|0|3|İrlanda Cumhuriyeti
B2|Gürcistan|0|0|Ukrayna
C2|Ermenistan|2|3|Karadağ
C2|Letonya|0|0|Kıbrıs
A1|Belçika|0|1|Fransa
A1|Türkiye|1|4|İtalya
B2|Kuzey İrlanda|0|0|Macaristan
B4|Romanya|2|4|Bosna-Hersek
B4|İsveç|3|1|Polonya
C1|Finlandiya|0|0|Belarus
C3|Moldova|1|1|Faroe Adaları
A3|Çekya|0|2|İngiltere
A3|İspanya|4|1|Hırvatistan
B1|İskoçya|0|3|İsviçre
B1|Slovenya|2|0|Kuzey Makedonya
C1|San Marino|0|3|Arnavutluk
C3|Slovakya|2|1|Kazakistan
C4|Bulgaristan|0|0|Estonya
C4|Lüksemburg|0|3|İzlanda
D2|Azerbaycan|0|0|Liechtenstein
A2|Almanya|2|0|Sırbistan
A2|Yunanistan|2|2|Hollanda
A4|Danimarka|2|4|Portekiz
A4|Galler|2|1|Norveç
B3|İsrail|0|0|Kosova
B3|İrlanda Cumhuriyeti|2|2|Avusturya
D1|Malta|1|1|Gibraltar
C3|Kazakistan|1|2|Moldova
C2|Kıbrıs|2|0|Ermenistan
C2|Letonya|1|2|Karadağ
A1|Belçika|3|0|Türkiye
A1|Fransa|1|1|İtalya
B2|Macaristan|1|0|Gürcistan
B2|Ukrayna|0|3|Kuzey İrlanda
B4|Bosna-Hersek|1|1|İsveç
B4|Polonya|6|0|Romanya
C3|Faroe Adaları|1|1|Slovakya
C1|Finlandiya|2|1|Arnavutluk
A3|Hırvatistan|0|7|İngiltere
C1|Belarus|4|0|San Marino
C4|Estonya|1|0|Lüksemburg
C4|İzlanda|3|0|Bulgaristan
A3|İspanya|3|1|Çekya
B1|Kuzey Makedonya|0|2|İskoçya
B1|İsviçre|2|1|Slovenya
D2|Azerbaycan|1|0|Litvanya
B3|Kosova|1|1|Avusturya
D1|Malta|1|0|Andorra
A2|Yunanistan|0|0|Almanya
A2|Hollanda|2|1|Sırbistan
A4|Portekiz|2|1|Norveç
A4|Galler|0|1|Danimarka
B3|İrlanda Cumhuriyeti|1|1|İsrail
C2|Kıbrıs|2|1|Letonya
A1|Fransa|4|1|Belçika
A1|İtalya|3|1|Türkiye
B2|Kuzey İrlanda|0|0|Gürcistan
B2|Ukrayna|1|2|Macaristan
B4|Bosna-Hersek|1|0|Polonya
B4|Romanya|0|1|İsveç
C2|Karadağ|0|0|Ermenistan
C3|Kazakistan|2|2|Faroe Adaları
A3|Hırvatistan|1|2|İspanya
A3|İngiltere|3|0|Çekya
B1|İskoçya|1|2|Slovenya
B1|İsviçre|3|0|Kuzey Makedonya
C1|Arnavutluk|2|1|San Marino
C1|Belarus|1|0|Finlandiya
C3|Moldova|0|4|Slovakya
C4|Estonya|0|0|İzlanda
C4|Lüksemburg|0|2|Bulgaristan`;
const UNF=`11-12T17:00|A1|Türkiye|Belçika
11-12T17:00|C2|Ermenistan|Kıbrıs
11-12T19:45|A1|İtalya|Fransa
11-12T19:45|A3|Çekya|İspanya
11-12T19:45|A3|İngiltere|Hırvatistan
11-12T19:45|C1|Arnavutluk|Finlandiya
11-12T19:45|C1|San Marino|Belarus
11-12T19:45|C2|Karadağ|Letonya
11-13T17:00|C3|Moldova|Kazakistan
11-13T19:45|A2|Hollanda|Yunanistan
11-13T19:45|A2|Sırbistan|Almanya
11-13T19:45|B1|İskoçya|Kuzey Makedonya
11-13T19:45|B1|Slovenya|İsviçre
11-13T19:45|C3|Slovakya|Faroe Adaları
11-13T19:45|C4|Bulgaristan|İzlanda
11-13T19:45|C4|Lüksemburg|Estonya
11-13T19:45|D1|Andorra|Gibraltar
11-13T19:45|D2|Liechtenstein|Azerbaycan
11-14T14:00|B3|Kosova|İsrail
11-14T17:00|A4|Norveç|Galler
11-14T17:00|B2|Gürcistan|Macaristan
11-14T19:45|A4|Portekiz|Danimarka
11-14T19:45|B2|Kuzey İrlanda|Ukrayna
11-14T19:45|B3|Avusturya|İrlanda Cumhuriyeti
11-14T19:45|B4|Romanya|Polonya
11-14T19:45|B4|İsveç|Bosna-Hersek
11-15T14:00|C2|Kıbrıs|Karadağ
11-15T14:00|C2|Letonya|Ermenistan
11-15T17:00|C1|Belarus|Arnavutluk
11-15T17:00|C1|Finlandiya|San Marino
11-15T19:45|A1|Belçika|İtalya
11-15T19:45|A1|Fransa|Türkiye
11-15T19:45|A3|Hırvatistan|Çekya
11-15T19:45|A3|İspanya|İngiltere
11-16T15:00|C3|Faroe Adaları|Moldova
11-16T15:00|C3|Kazakistan|Slovakya
11-16T17:00|C4|Estonya|Bulgaristan
11-16T17:00|C4|İzlanda|Lüksemburg
11-16T17:00|D2|Litvanya|Liechtenstein
11-16T19:45|A2|Almanya|Hollanda
11-16T19:45|A2|Yunanistan|Sırbistan
11-16T19:45|B1|Kuzey Makedonya|Slovenya
11-16T19:45|B1|İsviçre|İskoçya
11-16T19:45|D1|Gibraltar|Malta
11-17T19:45|A4|Danimarka|Norveç
11-17T19:45|A4|Galler|Portekiz
11-17T19:45|B2|Macaristan|Kuzey İrlanda
11-17T19:45|B2|Ukrayna|Gürcistan
11-17T19:45|B3|İsrail|Avusturya
11-17T19:45|B3|İrlanda Cumhuriyeti|Kosova
11-17T19:45|B4|Bosna-Hersek|Romanya
11-17T19:45|B4|Polonya|İsveç`;
const UNP=()=>UNR.split("\n").map(l=>{const[g,h,x,y,a]=l.split("|");return{g,h,a,x:+x,y:+y}});
const unAll=()=>{const r=UNP(),ex=new Set(r.map(q=>q.h+'|'+q.a));UNF.split("\n").forEach(l=>{const[t,g,h,a]=l.split("|"),s=(typeof RES!='undefined'&&RES['UNL|'+h+'|'+a])||'';if(/^\d+-\d+$/.test(s)&&!ex.has(h+'|'+a)){const[x,y]=s.split('-').map(Number);r.push({g,h,a,x,y})}});return r};
const unS=rs=>{const s={};rs.forEach(q=>{[[q.h,q.x,q.y],[q.a,q.y,q.x]].forEach(([n,f,c])=>{const z=s[n]=s[n]||{g:q.g,n:0,f:0,c:0,w:0,d:0,l:0,p:0};z.n++;z.f+=f;z.c+=c;f>c?(z.w++,z.p+=3):f==c?(z.d++,z.p++):z.l++})});return s};
const UNS0=unS(UNP()),UNG={};
['A','B','C','D'].forEach(L=>{let f=0,n=0;Object.values(UNS0).filter(q=>q.g[0]==L).forEach(q=>{f+=q.f;n+=q.n});UNG[L]=f/n});
function unm(m){const S=UNS0,L=m.gr[0],g=UNG[L],k=6,e=n=>S[n]||{n:0,f:0,c:0},at=t=>((t.f+k*g)/(t.n+k))/g,df=t=>((t.c+k*g)/(t.n+k))/g,h=e(m.h),a=e(m.a),lh=g*1.12*at(h)*df(a),la=g/1.12*at(a)*df(h),A=pm(lh),B=pm(la);let p=[0,0,0];A.forEach((x,i)=>B.forEach((y,j)=>{p[i>j?0:i==j?1:2]+=x*y}));const q=p[0]+p[1]+p[2];m.p=p.map(v=>v/q);m.g=[lh,la];m.un=1}
const rsUN=(m,x)=>{const S=UNS0,f=n=>{const q=S[n];return q?`${n} bu ligde ${q.n} maçta ${q.f} attı, ${q.c} yedi`:`${n} için veri yok`},q=x.g?gmk(m):null,g=q?[q.lh,q.la]:m.g;return`${f(m.h)}; ${f(m.a)}. Model yalnızca bu sezonki grup maçlarının skorlarına dayanır (takım başına 4 maç), güvenilirliği düşüktür; sağlayıcı olasılığı ve kontrol modeli yoktur. Beklenen gol: ${m.h} ${g[0].toFixed(1)}, ${m.a} ${g[1].toFixed(1)}. İhtimal ${pc(x.p)}.`};
const unBox=(gr,m)=>{const rs=unS(unAll().filter(q=>q.g==gr)),rows=Object.entries(rs).sort((x,y)=>y[1].p-x[1].p||(y[1].f-y[1].c)-(x[1].f-x[1].c)||y[1].f-x[1].f||y[1].w-x[1].w);return`<div class='box'><h4>${gr[0]} Ligi · Grup ${gr[1]}</h4><div class='tb th'><span>#</span><span>Takım</span><span>O</span><span>G</span><span>B</span><span>M</span><span>A</span><span>Y</span><span>Av</span><span>P</span></div>${rows.map(([n,q],i)=>`<div class='tb${m&&(n==m.h||n==m.a)?' hl':''}'><span>${i+1}</span><span>${bd(n)} <span data-tm="${n}">${n}</span></span><span>${q.n}</span><span>${q.w}</span><span>${q.d}</span><span>${q.l}</span><span>${q.f}</span><span>${q.c}</span><span>${q.f-q.c>0?'+':''}${q.f-q.c}</span><b>${q.p}</b></div>`).join('')}</div>`};
const unTbl=m=>{const L=m.gr[0],gs=['1','2','3','4'].map(i=>L+i).filter(g=>UNF.includes('|'+g+'|')||UNR.includes(g+'|')).sort((a,b)=>(a==m.gr?-1:b==m.gr?1:0));return gs.map(g=>unBox(g,g==m.gr?m:null)).join('')+`<div class='mut'>Puanlar UEFA sayfasındaki oynanmış maç skorlarından hesaplandı. Eşitlikte puan, averaj, atılan gol ve galibiyet sırası kullanıldı; UEFA'nın ikili maç kuralıyla küçük farklar olabilir. Hangi sıranın çeyrek final, play-off veya düşme hattı olduğunu bu sayfaya işlemedim (veri yok).</div>`};
UNF.split("\n").forEach(l=>{const[t,gr,h,a]=l.split("|"),m={c:'UNL',t:new Date(`2026-${t}:00Z`),h,a,gr};unm(m);R.push(m)});
`CL|11-04T17:45|Fenerbahçe|Liverpool
CL|11-04T20:00|Dortmund|Betis
CL|11-04T20:00|Porto|Napoli
CL|11-04T20:00|PSV|Club Brugge
CL|11-04T20:00|Leipzig|Man City
CL|11-04T20:00|Lens|Como
CL|11-04T20:00|Slavia Prague|Arsenal
CL|11-04T20:00|Viking|Sabah`.split("\n").forEach(l=>{const[c,t,h,a]=l.split("|");{const q={'Fenerbahçe|Liverpool':[16.5,18.4,65.1],'Dortmund|Betis':[56.8,22,21.2],'Porto|Napoli':[52.7,25,22.3],'PSV|Club Brugge':[49.9,22.4,27.7],'Leipzig|Man City':[18.2,18.7,63.1],'Lens|Como':[26.2,24.4,49.4],'Slavia Prague|Arsenal':[7,14.5,78.5],'Viking|Sabah':[70.4,16.2,13.4]}[h+'|'+a],z=q?q[0]+q[1]+q[2]:1;R.push({c,t:new Date(`2026-${t}:00Z`),h,a,p:q?q.map(v=>v/z):[1/3,1/3,1/3],np:!q})}});
const sa=[0,0,0];Object.values(SLG).forEach(g=>g.filter(r=>r.H).forEach(r=>sa[r.r=='G'?0:r.r=='B'?1:2]++));const sn=sa[0]+sa[1]+sa[2];R.filter(m=>m.c=='SL').forEach(m=>{m.p=m.p.map((v,i)=>.7*v+.3*sa[i]/sn)});
const PLR=`Arsenal|Coventry|3|0
Brentford|Tottenham|3|0
Everton|C. Palace|2|0
Hull|Man United|2|0
Ipswich|Sunderland|2|1
N. Forest|Leeds|0|1
Brighton|Aston Villa|4|0
Man City|Bournemouth|2|1
Newcastle|Liverpool|2|2
Fulham|Chelsea|2|3
C. Palace|Man City|1|4
Bournemouth|Everton|1|1
Coventry|Hull|0|1
Liverpool|N. Forest|2|2
Tottenham|Newcastle|0|2
Chelsea|Brighton|4|3
Leeds|Brentford|1|1
Man United|Ipswich|5|2
Sunderland|Fulham|1|0
Aston Villa|Arsenal|0|1
Ipswich|Liverpool|0|2
Brentford|Sunderland|1|1
Brighton|Leeds|1|1
Fulham|C. Palace|2|3
Hull|Aston Villa|0|0
Man City|Coventry|1|0
N. Forest|Tottenham|0|0
Newcastle|Bournemouth|2|2
Arsenal|Chelsea|2|1
Everton|Man United|2|2
Aston Villa|N. Forest|1|2
Bournemouth|Brentford|2|2
C. Palace|Ipswich|2|3
Chelsea|Hull|2|2
Liverpool|Fulham|0|0
Sunderland|Arsenal|0|2
Tottenham|Everton|0|0
Coventry|Brighton|0|5
Man United|Man City|0|1
Leeds|Newcastle|4|1
Brentford|Chelsea|3|0
Brighton|Arsenal|3|0
Everton|Ipswich|1|0
N. Forest|Coventry|0|1
Newcastle|Hull|2|1
Tottenham|Aston Villa|2|3
Bournemouth|Liverpool|0|1
Fulham|Man United|1|1
Leeds|C. Palace|0|0
Man City|Sunderland|5|3
Arsenal|Leeds|2|1
Aston Villa|Brentford|2|2
Chelsea|Bournemouth|5|1
Ipswich|Fulham|2|1
Man United|Tottenham|1|1
Sunderland|Brighton|0|2
C. Palace|N. Forest|3|1
Hull|Everton|2|2
Liverpool|Man City|0|3
Coventry|Newcastle|4|1
Brentford|Liverpool|1|2
Everton|Chelsea|0|2
Fulham|Hull|1|0
Man City|Ipswich|3|2
Newcastle|Aston Villa|0|1
Bournemouth|Sunderland|2|0
Brighton|C. Palace|5|0
Leeds|Man United|1|1
N. Forest|Arsenal|0|1
Tottenham|Coventry|3|1
Ipswich|N. Forest|1|1
Arsenal|Everton|2|0
Aston Villa|Man City|2|1
Chelsea|Tottenham|0|2
Coventry|Fulham|0|1
C. Palace|Newcastle|0|2
Hull|Brentford|1|1
Liverpool|Brighton|2|0
Man United|Bournemouth|0|3
Sunderland|Leeds|0|0`,PLH=`Bournemouth|Leeds~22.04.2026|Bournemouth|Leeds|2|2
Bournemouth|Leeds~27.09.2025|Leeds|Bournemouth|2|2
Bournemouth|Leeds~30.04.2023|Bournemouth|Leeds|4|1
Bournemouth|Leeds~05.11.2022|Leeds|Bournemouth|4|3
Brentford|N. Forest~25.01.2026|Brentford|N. Forest|0|2
Brentford|N. Forest~17.08.2025|N. Forest|Brentford|3|1
Brentford|N. Forest~01.05.2025|N. Forest|Brentford|0|2
Brentford|N. Forest~21.12.2024|Brentford|N. Forest|0|2
Brentford|N. Forest~20.01.2024|Brentford|N. Forest|3|2
Brighton|Man City~07.01.2026|Man City|Brighton|1|1
Brighton|Man City~31.08.2025|Brighton|Man City|2|1
Brighton|Man City~15.03.2025|Man City|Brighton|2|2
Brighton|Man City~09.11.2024|Brighton|Man City|2|1
Brighton|Man City~25.04.2024|Brighton|Man City|0|4
C. Palace|Tottenham~05.03.2026|Tottenham|C. Palace|1|3
C. Palace|Tottenham~28.12.2025|C. Palace|Tottenham|0|1
C. Palace|Tottenham~11.05.2025|Tottenham|C. Palace|0|2
C. Palace|Tottenham~27.10.2024|C. Palace|Tottenham|1|0
C. Palace|Tottenham~02.03.2024|Tottenham|C. Palace|3|1
Aston Villa|Fulham~25.04.2026|Fulham|Aston Villa|1|0
Aston Villa|Fulham~28.09.2025|Aston Villa|Fulham|3|1
Aston Villa|Fulham~03.05.2025|Aston Villa|Fulham|1|0
Aston Villa|Fulham~19.10.2024|Fulham|Aston Villa|1|3
Aston Villa|Fulham~17.02.2024|Fulham|Aston Villa|1|2
Arsenal|Liverpool~08.01.2026|Arsenal|Liverpool|0|0
Arsenal|Liverpool~31.08.2025|Liverpool|Arsenal|1|0
Arsenal|Liverpool~11.05.2025|Liverpool|Arsenal|2|2
Arsenal|Liverpool~27.10.2024|Arsenal|Liverpool|2|2
Arsenal|Liverpool~04.02.2024|Arsenal|Liverpool|3|1
Everton|Newcastle~28.02.2026|Newcastle|Everton|2|3
Everton|Newcastle~29.11.2025|Everton|Newcastle|1|4
Everton|Newcastle~25.05.2025|Newcastle|Everton|0|1
Everton|Newcastle~05.10.2024|Everton|Newcastle|0|0
Everton|Newcastle~02.04.2024|Newcastle|Everton|1|1
Chelsea|Man United~18.04.2026|Chelsea|Man United|0|1
Chelsea|Man United~20.09.2025|Man United|Chelsea|2|1
Chelsea|Man United~16.05.2025|Chelsea|Man United|1|0
Chelsea|Man United~03.11.2024|Man United|Chelsea|1|1
Chelsea|Man United~04.04.2024|Chelsea|Man United|4|3`,HH={};
PLR.split('\n').forEach(l=>{const[h,a,x,y]=l.split('|').map((v,i)=>i<2?v:+v);[[h,a,x,y,1],[a,h,y,x,0]].forEach(([t,o,f,c,H])=>{const g=SLG[t]=SLG[t]||[];g.push({w:g.length+1,H,o,f,c,r:f>c?'G':f==c?'B':'M'})})});
PLH.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
const PLM={"Chelsea|Man United": [0.451, 0.228, 0.32], "Bournemouth|Leeds": [0.437, 0.263, 0.3], "Brentford|N. Forest": [0.483, 0.253, 0.264], "Coventry|Sunderland": [0.386, 0.275, 0.34], "Hull|Ipswich": [0.526, 0.237, 0.238], "Man City|Brighton": [0.516, 0.225, 0.259], "Tottenham|C. Palace": [0.479, 0.248, 0.274], "Aston Villa|Fulham": [0.475, 0.258, 0.267], "Liverpool|Arsenal": [0.314, 0.265, 0.421], "Newcastle|Everton": [0.448, 0.254, 0.298]};R.filter(m=>m.c=='PL').forEach(m=>{m.mp=PLM[m.h+'|'+m.a]});
const LLR=`Alaves|Getafe|3|0
Sevilla|Rayo|2|1
Racing Santander|Villarreal|2|2
Espanyol|Levante|3|0
Deportivo|Elche|1|1
Atletico Madrid|Malaga|2|0
Rayo|Alaves|1|1
Betis|Real Sociedad|1|0
Athletic|Sevilla|1|3
Valencia|Celta|0|0
Espanyol|Real Madrid|1|2
Atletico Madrid|Villarreal|2|2
Getafe|Racing Santander|1|0
Elche|Barcelona|0|5
Osasuna|Levante|0|0
Malaga|Deportivo|1|1
Valencia|Betis|0|1
Real Madrid|Real Sociedad|4|1
Celta|Osasuna|1|2
Barcelona|Athletic|2|0
Racing Santander|Elche|3|2
Alaves|Villarreal|1|0
Levante|Betis|5|2
Real Sociedad|Espanyol|2|1
Sevilla|Atletico Madrid|1|3
Real Madrid|Malaga|4|0
Deportivo|Valencia|3|1
Celta|Athletic|0|2
Osasuna|Getafe|1|0
Barcelona|Rayo|5|2
Real Sociedad|Celta|0|0
Betis|Real Madrid|1|0
Athletic|Atletico Madrid|3|0
Rayo|Racing Santander|3|2
Villarreal|Deportivo|2|3
Valencia|Barcelona|0|5
Alaves|Osasuna|5|2
Malaga|Levante|0|0
Espanyol|Sevilla|1|1
Getafe|Celta|1|1
Elche|Real Sociedad|2|3
Sevilla|Valencia|1|0
Racing Santander|Alaves|2|1
Osasuna|Espanyol|0|2
Athletic|Elche|1|1
Real Madrid|Rayo|4|1
Celta|Malaga|1|1
Levante|Barcelona|2|4
Getafe|Deportivo|1|1
Real Sociedad|Atletico Madrid|0|3
Villarreal|Betis|1|2
Rayo|Espanyol|2|1
Alaves|Valencia|0|1
Elche|Real Madrid|2|3
Atletico Madrid|Osasuna|4|0
Deportivo|Sevilla|0|1
Barcelona|Racing Santander|7|2
Betis|Getafe|1|0
Malaga|Villarreal|1|3
Espanyol|Elche|1|3
Osasuna|Rayo|1|1
Athletic|Alaves|0|0
Celta|Racing Santander|5|0
Sevilla|Barcelona|1|3
Getafe|Malaga|1|0
Atletico Madrid|Real Madrid|2|1
Deportivo|Betis|1|1
Villarreal|Levante|3|1
Valencia|Real Sociedad|2|3
Malaga|Espanyol|1|1
Alaves|Atletico Madrid|1|2
Barcelona|Getafe|3|0
Real Madrid|Villarreal|1|0
Elche|Celta|0|0
Real Sociedad|Deportivo|3|2
Betis|Osasuna|5|2
Racing Santander|Valencia|2|2
Levante|Sevilla|3|3
Deportivo|Levante|1|1
Espanyol|Atletico Madrid|0|1
Villarreal|Elche|0|0
Betis|Barcelona|2|5
Valencia|Athletic|0|0
Osasuna|Racing Santander|2|0
Celta|Alaves|2|1
Malaga|Real Sociedad|2|5
Real Madrid|Sevilla|4|1
Getafe|Rayo|1|1
Levante|Athletic|3|1
Alaves|Malaga|1|1
Rayo|Elche|0|3
Racing Santander|Espanyol|2|1
Valencia|Villarreal|1|2
Atletico Madrid|Deportivo|1|0
Athletic|Getafe|4|0
Celta|Betis|0|0
Real Sociedad|Levante|2|1
Barcelona|Real Madrid|1|2
Sevilla|Osasuna|2|0`,LLH=`Espanyol|Villarreal~09.02.2026|Villarreal|Espanyol|4|1
Espanyol|Villarreal~08.11.2025|Espanyol|Villarreal|0|2
Espanyol|Villarreal~27.04.2025|Villarreal|Espanyol|1|0
Espanyol|Villarreal~26.09.2024|Espanyol|Villarreal|1|2
Espanyol|Villarreal~27.04.2023|Villarreal|Espanyol|4|2
Atletico Madrid|Levante~31.01.2026|Levante|Atletico Madrid|0|0
Atletico Madrid|Levante~08.11.2025|Atletico Madrid|Levante|3|1
Atletico Madrid|Levante~16.02.2022|Atletico Madrid|Levante|0|1
Atletico Madrid|Levante~28.10.2021|Levante|Atletico Madrid|2|2
Celta|Rayo~18.01.2026|Celta|Rayo|3|0
Celta|Rayo~21.09.2025|Rayo|Celta|1|1
Celta|Rayo~18.05.2025|Celta|Rayo|1|2
Celta|Rayo~10.01.2025|Rayo|Celta|2|1
Celta|Rayo~31.03.2024|Celta|Rayo|0|0
Alaves|Barcelona~13.05.2026|Alaves|Barcelona|1|0
Alaves|Barcelona~29.11.2025|Barcelona|Alaves|3|1
Alaves|Barcelona~02.02.2025|Barcelona|Alaves|1|0
Alaves|Barcelona~06.10.2024|Alaves|Barcelona|0|3
Alaves|Barcelona~03.02.2024|Alaves|Barcelona|1|3
Getafe|Sevilla~22.02.2026|Getafe|Sevilla|0|1
Getafe|Sevilla~25.08.2025|Sevilla|Getafe|1|2
Getafe|Sevilla~01.02.2025|Getafe|Sevilla|0|0
Getafe|Sevilla~14.09.2024|Sevilla|Getafe|1|0
Getafe|Sevilla~30.03.2024|Getafe|Sevilla|0|1
Elche|Valencia~11.04.2026|Elche|Valencia|1|0
Elche|Valencia~10.01.2026|Valencia|Elche|1|1
Elche|Valencia~23.04.2023|Elche|Valencia|0|2
Elche|Valencia~15.10.2022|Valencia|Elche|2|2
Elche|Valencia~19.03.2022|Elche|Valencia|0|1
Athletic|Real Sociedad~01.02.2026|Athletic|Real Sociedad|1|1
Athletic|Real Sociedad~01.11.2025|Real Sociedad|Athletic|3|2
Athletic|Real Sociedad~04.05.2025|Real Sociedad|Athletic|0|0
Athletic|Real Sociedad~24.11.2024|Athletic|Real Sociedad|1|0
Athletic|Real Sociedad~13.01.2024|Athletic|Real Sociedad|2|1`,LLM={"Villarreal|Espanyol": [0.61, 0.215, 0.175], "Levante|Atletico Madrid": [0.31, 0.242, 0.448], "Rayo|Celta": [0.379, 0.282, 0.339], "Betis|Malaga": [0.675, 0.19, 0.134], "Barcelona|Alaves": [0.806, 0.12, 0.075], "Getafe|Sevilla": [0.376, 0.301, 0.323], "Racing Santander|Real Madrid": [0.159, 0.17, 0.672], "Elche|Valencia": [0.511, 0.248, 0.241], "Athletic|Real Sociedad": [0.481, 0.237, 0.282], "Deportivo|Osasuna": [0.527, 0.246, 0.227]};
LLR.split('\n').forEach(l=>{const[h,a,x,y]=l.split('|').map((v,i)=>i<2?v:+v);[[h,a,x,y,1],[a,h,y,x,0]].forEach(([t,o,f,c,H])=>{const g=SLG[t]=SLG[t]||[];g.push({w:g.length+1,H,o,f,c,r:f>c?'G':f==c?'B':'M'})})});
LLH.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
R.filter(m=>m.c=='LL').forEach(m=>{m.mp=LLM[m.h+'|'+m.a]});
const SAR=`Inter|Monza|4|1
Udinese|Como|1|1
Genoa|Napoli|0|2
Parma|Cagliari|0|1
Frosinone|Juventus|0|1
Venezia|Lecce|0|2
Atalanta|Sassuolo|2|1
Torino|Milan|1|2
Bologna|Lazio|0|1
Roma|Fiorentina|4|0
Milan|Venezia|2|0
Fiorentina|Frosinone|0|3
Monza|Udinese|2|3
Sassuolo|Torino|2|1
Juventus|Parma|2|0
Napoli|Como|1|2
Cagliari|Inter|0|1
Lazio|Genoa|1|0
Lecce|Roma|0|4
Atalanta|Bologna|1|0
Genoa|Como|1|4
Fiorentina|Torino|1|2
Inter|Napoli|3|2
Roma|Atalanta|2|1
Frosinone|Venezia|3|2
Parma|Monza|1|1
Bologna|Sassuolo|2|2
Juventus|Milan|1|1
Cagliari|Lecce|1|0
Udinese|Lazio|1|2
Venezia|Fiorentina|2|4
Genoa|Frosinone|1|1
Lazio|Milan|2|2
Atalanta|Cagliari|1|2
Lecce|Monza|3|2
Napoli|Bologna|1|0
Sassuolo|Juventus|3|2
Como|Parma|2|1
Torino|Roma|0|2
Inter|Udinese|5|3
Monza|Sassuolo|2|1
Bologna|Torino|1|1
Udinese|Cagliari|0|1
Roma|Inter|2|2
Venezia|Lazio|0|2
Fiorentina|Napoli|1|1
Frosinone|Como|2|0
Parma|Genoa|2|1
Juventus|Atalanta|2|0
Milan|Lecce|3|0
Genoa|Fiorentina|2|1
Inter|Parma|3|0
Napoli|Frosinone|3|0
Como|Roma|0|0
Lazio|Monza|3|1
Lecce|Bologna|1|2
Sassuolo|Milan|1|1
Cagliari|Juventus|1|1
Atalanta|Venezia|3|1
Torino|Udinese|2|1
Frosinone|Sassuolo|4|2
Venezia|Napoli|1|0
Bologna|Inter|1|3
Roma|Genoa|2|0
Udinese|Lecce|0|3
Fiorentina|Como|1|3
Milan|Atalanta|3|2
Juventus|Lazio|0|3
Monza|Cagliari|4|0
Parma|Torino|0|3
Torino|Monza|3|2
Cagliari|Bologna|0|2
Como|Sassuolo|2|0
Napoli|Roma|3|3
Lazio|Parma|2|1
Inter|Fiorentina|2|1
Atalanta|Frosinone|4|4
Genoa|Venezia|1|0
Lecce|Juventus|0|2
Udinese|Milan|0|2
Sassuolo|Lazio|2|6
Roma|Cagliari|4|2
Torino|Como|1|3
Milan|Bologna|2|4
Parma|Udinese|0|0
Venezia|Inter|0|2
Genoa|Juventus|2|0
Monza|Napoli|1|4
Frosinone|Lecce|5|1
Fiorentina|Atalanta|2|2`,SAH=`Cagliari|Roma~27.10.2026|Roma|Cagliari|4|2
Cagliari|Roma~09.02.2026|Roma|Cagliari|2|0
Cagliari|Roma~07.12.2025|Cagliari|Roma|1|0
Cagliari|Roma~16.03.2025|Roma|Cagliari|1|0
Cagliari|Roma~18.08.2024|Cagliari|Roma|0|0
Como|Torino~27.10.2026|Torino|Como|1|3
Como|Torino~24.01.2026|Como|Torino|6|0
Como|Torino~24.11.2025|Torino|Como|1|5
Como|Torino~13.04.2025|Como|Torino|1|0
Como|Torino~25.10.2024|Torino|Como|1|0
Bologna|Milan~28.10.2026|Milan|Bologna|2|4
Bologna|Milan~03.02.2026|Bologna|Milan|0|3
Bologna|Milan~14.09.2025|Milan|Bologna|1|0
Bologna|Milan~09.05.2025|Milan|Bologna|3|1
Bologna|Milan~27.02.2025|Bologna|Milan|2|1
Parma|Udinese~28.10.2026|Parma|Udinese|0|0
Parma|Udinese~18.04.2026|Udinese|Parma|0|1
Parma|Udinese~29.11.2025|Parma|Udinese|0|2
Parma|Udinese~01.03.2025|Udinese|Parma|1|0
Parma|Udinese~16.09.2024|Parma|Udinese|2|3
Inter|Venezia~28.10.2026|Venezia|Inter|0|2
Inter|Venezia~12.01.2025|Venezia|Inter|0|1
Inter|Venezia~03.11.2024|Inter|Venezia|1|0
Inter|Venezia~22.01.2022|Inter|Venezia|2|1
Inter|Venezia~27.11.2021|Venezia|Inter|0|2
Genoa|Juventus~28.10.2026|Genoa|Juventus|2|0
Genoa|Juventus~06.04.2026|Juventus|Genoa|2|0
Genoa|Juventus~31.08.2025|Genoa|Juventus|0|1
Genoa|Juventus~29.03.2025|Juventus|Genoa|1|0
Genoa|Juventus~28.09.2024|Genoa|Juventus|0|3
Monza|Napoli~28.10.2026|Monza|Napoli|1|4
Monza|Napoli~19.04.2025|Monza|Napoli|0|1
Monza|Napoli~29.09.2024|Napoli|Monza|2|0
Monza|Napoli~07.04.2024|Monza|Napoli|2|4
Monza|Napoli~29.12.2023|Napoli|Monza|0|0
Frosinone|Lecce~29.10.2026|Frosinone|Lecce|5|1
Frosinone|Lecce~03.03.2024|Frosinone|Lecce|1|1
Frosinone|Lecce~16.12.2023|Lecce|Frosinone|2|1
Atalanta|Fiorentina~29.10.2026|Fiorentina|Atalanta|2|2
Atalanta|Fiorentina~22.05.2026|Fiorentina|Atalanta|1|1
Atalanta|Fiorentina~30.11.2025|Atalanta|Fiorentina|2|0
Atalanta|Fiorentina~30.03.2025|Fiorentina|Atalanta|1|0
Atalanta|Fiorentina~15.09.2024|Atalanta|Fiorentina|3|2
Bologna|Monza~18.01.2025|Bologna|Monza|3|1
Bologna|Monza~22.09.2024|Monza|Bologna|1|2
Bologna|Monza~13.04.2024|Bologna|Monza|0|0
Bologna|Monza~28.09.2023|Monza|Bologna|0|0
Bologna|Monza~12.02.2023|Bologna|Monza|0|1
Inter|Milan~08.03.2026|Milan|Inter|1|0
Inter|Milan~23.11.2025|Inter|Milan|0|1
Inter|Milan~02.02.2025|Milan|Inter|1|1
Inter|Milan~22.09.2024|Inter|Milan|1|2
Inter|Milan~22.04.2024|Milan|Inter|1|2
Como|Venezia~08.03.2025|Como|Venezia|1|1
Como|Venezia~08.12.2024|Venezia|Como|2|2
Frosinone|Torino~21.04.2024|Torino|Frosinone|0|0
Frosinone|Torino~10.12.2023|Frosinone|Torino|0|0
Cagliari|Lazio~21.02.2026|Cagliari|Lazio|0|0
Cagliari|Lazio~03.11.2025|Lazio|Cagliari|2|0
Cagliari|Lazio~03.02.2025|Cagliari|Lazio|1|2
Cagliari|Lazio~04.11.2024|Lazio|Cagliari|2|1
Cagliari|Lazio~10.02.2024|Cagliari|Lazio|1|3
Genoa|Lecce~24.05.2026|Lecce|Genoa|1|0
Genoa|Lecce~23.08.2025|Genoa|Lecce|0|0
Genoa|Lecce~14.03.2025|Genoa|Lecce|2|1
Genoa|Lecce~05.01.2025|Lecce|Genoa|0|0
Genoa|Lecce~28.01.2024|Genoa|Lecce|2|1
Juventus|Napoli~25.01.2026|Juventus|Napoli|3|0
Juventus|Napoli~07.12.2025|Napoli|Juventus|2|1
Juventus|Napoli~25.01.2025|Napoli|Juventus|2|1
Juventus|Napoli~21.09.2024|Juventus|Napoli|0|0
Juventus|Napoli~03.03.2024|Napoli|Juventus|2|1
Fiorentina|Sassuolo~26.04.2026|Fiorentina|Sassuolo|0|0
Fiorentina|Sassuolo~06.12.2025|Sassuolo|Fiorentina|3|1
Fiorentina|Sassuolo~28.04.2024|Fiorentina|Sassuolo|5|1
Fiorentina|Sassuolo~06.01.2024|Sassuolo|Fiorentina|1|0
Fiorentina|Sassuolo~02.06.2023|Sassuolo|Fiorentina|1|3
Atalanta|Parma~25.01.2026|Atalanta|Parma|4|0
Atalanta|Parma~30.08.2025|Parma|Atalanta|1|1
Atalanta|Parma~25.05.2025|Atalanta|Parma|2|3
Atalanta|Parma~23.11.2024|Parma|Atalanta|1|3
Roma|Udinese~02.02.2026|Udinese|Roma|1|0
Roma|Udinese~09.11.2025|Roma|Udinese|2|0
Roma|Udinese~26.01.2025|Udinese|Roma|1|2
Roma|Udinese~22.09.2024|Roma|Udinese|3|0
Roma|Udinese~25.04.2024|Udinese|Roma|1|2`,SAM={"Roma|Cagliari": [0.655, 0.205, 0.14], "Torino|Como": [0.214, 0.235, 0.551], "Milan|Bologna": [0.453, 0.256, 0.291], "Parma|Udinese": [0.325, 0.298, 0.377], "Venezia|Inter": [0.106, 0.16, 0.735], "Genoa|Juventus": [0.266, 0.282, 0.452], "Monza|Napoli": [0.197, 0.202, 0.601], "Frosinone|Lecce": [0.641, 0.191, 0.168], "Fiorentina|Atalanta": [0.3, 0.246, 0.454], "Bologna|Monza": [0.548, 0.215, 0.237], "Milan|Inter": [0.268, 0.226, 0.506], "Como|Venezia": [0.685, 0.196, 0.119], "Frosinone|Torino": [0.562, 0.201, 0.237], "Lazio|Cagliari": [0.558, 0.243, 0.199], "Lecce|Genoa": [0.306, 0.29, 0.404], "Juventus|Napoli": [0.349, 0.277, 0.374], "Sassuolo|Fiorentina": [0.386, 0.244, 0.37], "Atalanta|Parma": [0.558, 0.249, 0.193], "Udinese|Roma": [0.177, 0.221, 0.602]},BLR=`Bayern|Stuttgart|5|1
Elversberg|Leverkusen|3|2
Köln|Hoffenheim|3|2
Mainz|Paderborn|0|0
Leipzig|M’gladbach|3|0
Union Berlin|Frankfurt|3|3
Dortmund|Hamburg|2|0
Freiburg|Werder Bremen|4|1
Augsburg|Schalke|3|0
Stuttgart|Köln|4|1
Hoffenheim|Dortmund|2|3
Leverkusen|Union Berlin|4|0
M’gladbach|Elversberg|3|4
Paderborn|Freiburg|0|1
Werder Bremen|Leipzig|3|1
Schalke|Bayern|0|0
Hamburg|Mainz|0|5
Frankfurt|Augsburg|1|4
Union Berlin|Schalke|1|3
Augsburg|Leverkusen|2|2
Dortmund|Paderborn|3|0
Freiburg|M’gladbach|5|0
Hoffenheim|Stuttgart|2|1
Mainz|Frankfurt|1|3
Köln|Werder Bremen|1|1
Leipzig|Hamburg|5|0
Elversberg|Bayern|1|2
Bayern|Union Berlin|7|0
Frankfurt|Freiburg|2|2
Hamburg|Köln|2|1
M’gladbach|Mainz|3|4
Werder Bremen|Augsburg|3|2
Stuttgart|Dortmund|0|1
Leverkusen|Leipzig|2|0
Schalke|Elversberg|0|0
Paderborn|Hoffenheim|3|1
Dortmund|Werder Bremen|2|2
Augsburg|Bayern|2|2
Hoffenheim|Hamburg|2|3
Mainz|Leverkusen|3|4
Paderborn|Stuttgart|0|2
Union Berlin|Elversberg|1|0
Leipzig|Frankfurt|6|0
Köln|M’gladbach|2|1
Freiburg|Schalke|2|1
Frankfurt|Köln|1|0
Elversberg|Augsburg|4|3
Hamburg|Stuttgart|1|0
Schalke|Mainz|0|1
Union Berlin|Dortmund|0|0
Werder Bremen|Paderborn|2|2
Bayern|Leipzig|6|1
Leverkusen|Freiburg|2|1
M’gladbach|Hoffenheim|1|2
Stuttgart|M’gladbach|2|3
Augsburg|Union Berlin|1|1
Köln|Schalke|0|0
Mainz|Werder Bremen|2|3
Paderborn|Hamburg|1|0
Leipzig|Elversberg|4|0
Dortmund|Frankfurt|1|0
Hoffenheim|Leverkusen|3|0
Freiburg|Bayern|1|3`,BLH=`Leverkusen|Stuttgart~09.05.2026|Stuttgart|Leverkusen|3|1
Leverkusen|Stuttgart~10.01.2026|Leverkusen|Stuttgart|1|4
Leverkusen|Stuttgart~16.03.2025|Stuttgart|Leverkusen|3|4
Leverkusen|Stuttgart~01.11.2024|Leverkusen|Stuttgart|0|0
Leverkusen|Stuttgart~27.04.2024|Leverkusen|Stuttgart|2|2
Augsburg|Freiburg~18.01.2026|Augsburg|Freiburg|2|2
Augsburg|Freiburg~23.08.2025|Freiburg|Augsburg|1|3
Augsburg|Freiburg~02.03.2025|Augsburg|Freiburg|0|0
Augsburg|Freiburg~19.10.2024|Freiburg|Augsburg|3|1
Augsburg|Freiburg~25.02.2024|Augsburg|Freiburg|2|1
Hoffenheim|Werder Bremen~09.05.2026|Hoffenheim|Werder Bremen|1|0
Hoffenheim|Werder Bremen~27.01.2026|Werder Bremen|Hoffenheim|0|2
Hoffenheim|Werder Bremen~16.02.2025|Werder Bremen|Hoffenheim|1|3
Hoffenheim|Werder Bremen~29.09.2024|Hoffenheim|Werder Bremen|3|4
Hoffenheim|Werder Bremen~03.03.2024|Hoffenheim|Werder Bremen|2|1
Leipzig|Schalke~27.05.2023|Leipzig|Schalke|4|2
Leipzig|Schalke~24.01.2023|Schalke|Leipzig|1|6
Bayern|Dortmund~28.02.2026|Dortmund|Bayern|2|3
Bayern|Dortmund~18.10.2025|Bayern|Dortmund|2|1
Bayern|Dortmund~12.04.2025|Bayern|Dortmund|2|2
Bayern|Dortmund~30.11.2024|Dortmund|Bayern|1|1
Bayern|Dortmund~30.03.2024|Bayern|Dortmund|0|2
Köln|Union Berlin~02.05.2026|Union Berlin|Köln|2|2
Köln|Union Berlin~20.12.2025|Köln|Union Berlin|0|1
Köln|Union Berlin~11.05.2024|Köln|Union Berlin|3|2
Köln|Union Berlin~20.12.2023|Union Berlin|Köln|2|0
Köln|Union Berlin~04.03.2023|Union Berlin|Köln|0|0
Frankfurt|Hamburg~02.05.2026|Frankfurt|Hamburg|1|2
Frankfurt|Hamburg~20.12.2025|Hamburg|Frankfurt|1|1`,BLM={"Elversberg|Mainz": [0.456, 0.22, 0.324], "Leverkusen|Stuttgart": [0.529, 0.209, 0.262], "Augsburg|Freiburg": [0.43, 0.231, 0.338], "M’gladbach|Paderborn": [0.433, 0.254, 0.313], "Werder Bremen|Hoffenheim": [0.43, 0.223, 0.348], "Schalke|Leipzig": [0.311, 0.267, 0.422], "Bayern|Dortmund": [0.65, 0.18, 0.169], "Union Berlin|Köln": [0.442, 0.249, 0.309], "Frankfurt|Hamburg": [0.541, 0.22, 0.239]};
[SAR,BLR].forEach(t=>t.split('\n').forEach(l=>{const[h,a,x,y]=l.split('|').map((v,i)=>i<2?v:+v);[[h,a,x,y,1],[a,h,y,x,0]].forEach(([t2,o,f,c,H])=>{const g=SLG[t2]=SLG[t2]||[];g.push({w:g.length+1,H,o,f,c,r:f>c?'G':f==c?'B':'M'})})}));
[SAH,BLH].forEach(t=>t.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})}));
R.filter(m=>m.c=='SA').forEach(m=>{m.mp=SAM[m.h+'|'+m.a]});R.filter(m=>m.c=='BL').forEach(m=>{m.mp=BLM[m.h+'|'+m.a]});
"Inter:1:25:8:1:0:25:10,Lazio:2:25:8:1:0:22:7,Roma:3:21:6:3:0:23:8,Como:4:20:6:2:1:17:8,Milan:5:18:5:3:1:18:11,Frosinone:6:17:5:2:2:22:14,Napoli:7:14:4:2:3:17:11,Juventus:8:14:4:2:3:11:10,Torino:9:13:4:1:4:14:14,Cagliari:10:13:4:1:4:8:13,Bologna:11:11:3:2:4:12:12,Atalanta:12:11:3:2:4:16:17,Genoa:13:10:3:1:5:8:13,Lecce:14:9:3:0:6:10:19,Sassuolo:15:8:2:2:5:14:22,Monza:16:7:2:1:6:16:22,Udinese:17:5:1:2:6:9:18,Fiorentina:18:5:1:2:6:11:21,Parma:19:5:1:2:6:5:15,Venezia:20:3:1:0:8:6:19".split(',').forEach(t=>{const a=t.split(':');TM[a[0]]={l:'SA',r:+a[1],p:+a[2],w:+a[3],d:+a[4],o:+a[5],f:+a[6],a:+a[7]}});
"Bayern:1:17:5:2:0:25:6,Dortmund:2:17:5:2:0:12:4,Freiburg:3:13:4:1:2:16:9,Leverkusen:4:13:4:1:2:16:12,Leipzig:5:12:4:0:3:20:11,Werder Bremen:6:12:3:3:1:15:14,Mainz:7:10:3:1:3:16:13,Elversberg:8:10:3:1:3:12:15,Augsburg:9:9:2:3:2:17:13,Hoffenheim:10:9:3:0:4:14:14,Hamburg:11:9:3:0:4:6:16,Köln:12:8:2:2:3:8:11,Paderborn:13:8:2:2:3:6:9,Frankfurt:14:8:2:2:3:10:17,Stuttgart:15:6:2:0:5:10:13,Schalke:16:6:1:3:3:4:7,Union Berlin:17:6:1:3:3:6:18,M’gladbach:18:3:1:0:6:11:22".split(',').forEach(t=>{const a=t.split(':');TM[a[0]]={l:'BL',r:+a[1],p:+a[2],w:+a[3],d:+a[4],o:+a[5],f:+a[6],a:+a[7]}});
const GP={LL:{B:{o15:0.754,o25:0.502,kg:0.558,h1:0.806,a1:0.7,h2:0.424}},_:{B:GB},KSA:{B:{o15:.785,o25:.554,kg:.586,h1:.765,a1:.765,h2:.425}},BEL:{B:{o15:.829,o25:.620,kg:.637,h1:.798,a1:.798,h2:.475}},SA:{B:{o15:0.73,o25:0.485,kg:0.477,h1:0.704,a1:0.691,h2:0.396}},BL:{B:{o15:0.829,o25:0.65,kg:0.61,h1:0.827,a1:0.737,h2:0.528}}};

const CSVL=new Set(['PL','LL','SA','BL','L1','SL','ERE','POR','BEL','SCO']),h2h=m=>{const l=HH[[m.h,m.a].sort().join('|')];if(!l)return CSVL.has(m.c)?'Yüklenen lig CSV’lerinde (2021-22’den bugüne) bu iki takımın lig maçı yok; en az biri son yıllarda bu ligde oynamadı.':'Veri yok: bu yarışma için geçmiş karşılaşma verisi yüklenmedi.';const w={[m.h]:0,[m.a]:0,B:0};l.forEach(r=>{w[r.x>r.y?r.h:r.x<r.y?r.a:'B']++});return `Son ${l.length} lig maçı: ${m.h} ${w[m.h]}G, ${w.B}B, ${m.a} ${w[m.a]}G<br>`+l.map(r=>`${r.d} ${r.h} ${r.x}–${r.y} ${r.a}`).join('<br>')};
const TC={};`Arsenal:EF0107:FFFFFF,Aston Villa:670E36:95BFE5,Bournemouth:DA291C:000000,Brentford:E30613:FFFFFF,Brighton:0057B8:FFFFFF,Chelsea:034694:FFFFFF,C. Palace:1B458F:C4122E,Everton:003399:FFFFFF,Fulham:F2F2F2:000000,Ipswich:0044AA:FFFFFF,Leeds:1D428A:FFCD00,Liverpool:C8102E:FFFFFF,Man City:6CABDD:1C2C5B,Man United:DA291C:FBE122,Newcastle:241F20:FFFFFF,N. Forest:DD0000:FFFFFF,Hull:F5A12D:000000,Coventry:59CBE8:FFFFFF,Sunderland:EB172B:FFFFFF,Tottenham:132257:FFFFFF,Alaves:0761AF:FFFFFF,Athletic:EE2523:FFFFFF,Atletico Madrid:CB3524:272E61,Barcelona:A50044:004D98,Betis:0BB363:FFFFFF,Celta:8AC3EE:FFFFFF,Deportivo:0067B1:FFFFFF,Elche:00A24E:FFFFFF,Espanyol:007FC8:FFFFFF,Getafe:005999:FFFFFF,Levante:B4053F:094A9E,Malaga:0075C9:FFFFFF,Osasuna:D91A21:0A346F,Racing Santander:00A859:FFFFFF,Rayo:F2F2F2:E53935,Real Madrid:F2F2F2:FEBE10,Real Sociedad:0067B1:FFFFFF,Sevilla:F2F2F2:D8232A,Valencia:F2F2F2:F18E00,Villarreal:FBE10F:005187,Atalanta:1E71B8:000000,Bologna:A21C26:1A2F48,Cagliari:A3102A:002B5C,Como:0F4FA6:FFFFFF,Fiorentina:5B2C83:FFFFFF,Frosinone:FFD100:1B3E8C,Genoa:A6192E:0A2A5C,Inter:0068A8:000000,Juventus:000000:FFFFFF,Lecce:F5D000:C8102E,Milan:FB090B:000000,Monza:E21B2A:FFFFFF,Napoli:12A0D7:FFFFFF,Parma:FFD200:0A3A8C,Roma:8E1F2F:F0BC42,Torino:8A1E41:FFFFFF,Udinese:000000:FFFFFF,Venezia:E5742B:1E1E1E,Lazio:87D8F7:FFFFFF,Augsburg:BA3733:46714D,Leverkusen:E32221:000000,Bayern:DC052D:0066B2,Dortmund:FDE100:000000,Frankfurt:E1000F:000000,Freiburg:D40000:000000,Hamburg:005CA9:FFFFFF,Hoffenheim:1961B5:FFFFFF,Köln:ED1C24:FFFFFF,Leipzig:DD0741:001F47,M’gladbach:1A1A1A:00A650,Mainz:C3141E:FFFFFF,Paderborn:1E5BA8:000000,Schalke:004D9D:FFFFFF,Stuttgart:E32219:FFFFFF,Union Berlin:EB1923:FDD000,Werder Bremen:1D9053:FFFFFF,Elversberg:111111:FFFFFF,Galatasaray:A90432:FDB912,Fenerbahçe:002D72:FFED00,Beşiktaş:000000:FFFFFF,Trabzonspor:7B1E3A:00A9E0,Başakşehir:F26522:1B2A5C,Konyaspor:00A650:FFFFFF,Alanyaspor:F58220:00A651,Samsunspor:E30A17:FFFFFF,Gaziantep:D40000:000000,Göztepe:FFDD00:E30613,Kasımpaşa:1E3A8A:FFFFFF,Rizespor:00A651:0066CC,Eyüpspor:6A1B9A:FFD600,Kocaelispor:00A651:000000,Erzurumspor:0066CC:FFFFFF,Çorum:E30613:000000,Gençlerbirliği:E30613:000000,Amedspor:E30613:00A651,PSG:004170:DA291C,Rennes:E13327:000000,Lille:E01E13:24216A,Monaco:E51B22:FFFFFF,Lyon:1D3A8A:DA291C,Paris FC:1C3A6B:FFFFFF,Lens:FFD100:E30613,Marseille:2FAEE0:FFFFFF,Lorient:F58220:000000,Nice:E01E13:000000,Toulouse:4B2C82:FFFFFF,Auxerre:0057B8:FFFFFF,Brest:E30613:FFFFFF,Angers:111111:FFFFFF,Le Mans:FFD100:E30613,Strasbourg:0075C9:FFFFFF,Troyes:0055A5:FFFFFF,Le Havre:5BA3DB:0A2A5C,Shakhtar:F58220:000000,Sporting:00805A:FFFFFF,Feyenoord:E30613:FFFFFF,Bodø/Glimt:FFD200:000000,LASK:111111:FFFFFF,Slovan Bratislava:1E73BE:FFFFFF,AEK Atina:FFD100:000000,Al Hilal:0054A6:FFFFFF,Al Nassr:FFD500:0B2A66,Al Ahli:00693E:FFFFFF,Al Ittihad:FFD100:000000,Al Ettifaq:00843D:FFFFFF,Sassuolo:00A650:000000,PSV:E30613:FFFFFF,Porto:003C7F:FFFFFF,Slavia Prague:E30613:FFFFFF,Viking:003DA5:FFFFFF,Club Brugge:0057B8:000000,Anderlecht:5B2A86:FFFFFF,Gent:0057A8:FFFFFF,Standard:E2001A:FFFFFF,Antwerp:E30613:FFFFFF,Union SG:FFD100:0A2A5C,Charleroi:111111:FFFFFF,Westerlo:FFD100:0057B8,Mechelen:E30613:FFD100,Cercle Brugge:00843D:000000,Kortrijk:D2232A:FFFFFF,OH Leuven:00843D:FFFFFF,Zulte Waregem:E30613:00843D,STVV:FFD100:0A2A5C,Beveren:FFD100:0057B8,Ferencváros:00A650:FFFFFF,Sparta Praha:9E1B32:FFD100,Lillestrøm:FFD500:111111,Viktoria Plzeň:E30613:1D3C8F,NEC Nijmegen:E2001A:00A651,Omonia:00873E:FFFFFF,Levski Sofia:0057B8:FFFFFF,Jagiellonia:FFD500:C8102E,Salzburg:E30613:FFFFFF,AZ Alkmaar:E30613:FFFFFF,Celtic:0A8A3E:FFFFFF,Hapoel Beer-Sheva:E30613:FFFFFF,OFI Crete:111111:FFFFFF,Torreense:C8102E:FFFFFF,Ararat-Armenia:FFD500:111111,Sturm Graz:111111:FFFFFF,Celje:FFD500:1D3C8F,Benfica:E30613:FFFFFF,Lech Poznań:0A3D91:FFFFFF,Dinamo Zagreb:0A3D91:FFFFFF,Aarhus:1D3C8F:FFFFFF,Braga:C8102E:FFFFFF,Kairat Almaty:FFD500:111111,Crvena Zvezda:C8102E:FFFFFF,Inter Escaldes:0057B8:FFFFFF,Midtjylland:E30613:111111,Ajax:D2122E:FFFFFF,Thun:E30613:FFFFFF,Hearts:7A1530:FFFFFF,KuPS Kuopio:FFD500:111111,Lincoln Red Imps:E30613:FFFFFF,Hajduk Split:0A3D91:FFFFFF,Mjällby:FFD500:111111,Borac:C8102E:0A3D91,Craiova:0A3D91:FFFFFF,Egnatia:0A3D91:FFD500,Copenhagen:1D3C8F:FFFFFF,Iberia Tbilisi:0A3D91:FFFFFF,Lugano:111111:FFFFFF,Kauno Žalgiris:0A8A3E:FFFFFF,Twente:E30613:FFFFFF,Pafos:0057B8:FFFFFF,Nordsjælland:E30613:FFD500,Panathinaikos:0A8A3E:FFFFFF,CSKA Sofia:C8102E:FFFFFF,Riga:0057B8:FFFFFF,Jablonec:0A8A3E:FFFFFF,Sint-Truidense:FFD500:0A3D91,Brann:C8102E:FFFFFF,Willem II:C8102E:FFFFFF,PEC Zwolle:0057B8:FFFFFF,Fortuna Sittard:FFD500:111111,Telstar:111111:FFFFFF,ADO Den Haag:0A8A3E:FFD500,Sparta Rotterdam:C8102E:FFFFFF,Excelsior:C8102E:111111,Go Ahead Eagles:E30613:FFD500,Heerenveen:0057B8:FFFFFF,Groningen:0A8A3E:FFFFFF,Cambuur:FFD500:0A3D91,Utrecht:E30613:FFFFFF,Famalicão:1D3C8F:FFFFFF,Arouca:FFD500:0057B8,Nacional:111111:FFFFFF,Académico Viseu:0A8A3E:FFFFFF,Alverca:C8102E:FFD500,Casa Pia:FFD500:111111,Moreirense:0A8A3E:FFFFFF,Santa Clara:C8102E:FFFFFF,Gil Vicente:C8102E:0A3D91,Estoril:FFD500:0A3D91,Marítimo:0A8A3E:C8102E,Guimarães:111111:FFFFFF,Rio Ave:0A8A3E:FFFFFF,Estrela Amadora:C8102E:0A8A3E,St Johnstone:0057B8:FFFFFF,Dundee:1D3C8F:FFFFFF,Dundee Utd:FF7F00:111111,Motherwell:7A1530:FFD500,Aberdeen:E30613:FFFFFF,Hibernian:0A8A3E:FFFFFF,St Mirren:111111:FFFFFF,Rangers:0057B8:FFFFFF,Falkirk:1D3C8F:FFFFFF,Kilmarnock:0057B8:FFFFFF,Lommel SK:0A8A3E:FFFFFF,La Louvière:0A8A3E:C8102E,Genk:0057B8:FFFFFF,Türkiye:E30A17:FFFFFF,Belçika:E30613:FFD500,Ermenistan:C8102E:0057B8,Kıbrıs:0057B8:FFFFFF,İtalya:0057B8:FFFFFF,Fransa:1D3C8F:FFFFFF,Çekya:C8102E:FFFFFF,İspanya:C8102E:FFD500,İngiltere:1D3C8F:FFFFFF,Hırvatistan:C8102E:FFFFFF,Arnavutluk:C8102E:111111,Finlandiya:0057B8:FFFFFF,San Marino:5EB6E4:FFFFFF,Belarus:C8102E:0A8A3E,Karadağ:C8102E:FFD500,Letonya:7A1530:FFFFFF,Moldova:0057B8:FFD500,Kazakistan:00AFCA:FFD500,Hollanda:FF6A13:FFFFFF,Yunanistan:0057B8:FFFFFF,Sırbistan:C8102E:FFFFFF,Almanya:111111:FFFFFF,İskoçya:1D3C8F:FFFFFF,Kuzey Makedonya:C8102E:FFD500,Slovenya:0A8A3E:FFFFFF,İsviçre:E30613:FFFFFF,Slovakya:0057B8:FFFFFF,Faroe Adaları:0057B8:C8102E,Bulgaristan:0A8A3E:FFFFFF,İzlanda:0057B8:C8102E,Lüksemburg:C8102E:FFFFFF,Estonya:0057B8:FFFFFF,Andorra:0057B8:FFD500,Gibraltar:C8102E:FFFFFF,Liechtenstein:C8102E:0057B8,Azerbaycan:0A8A3E:C8102E,Kosova:0057B8:FFD500,İsrail:0057B8:FFFFFF,Norveç:C8102E:FFFFFF,Galler:C8102E:FFFFFF,Gürcistan:C8102E:FFFFFF,Macaristan:C8102E:FFFFFF,Portekiz:C8102E:0A8A3E,Danimarka:C8102E:FFFFFF,Kuzey İrlanda:0A8A3E:FFFFFF,Ukrayna:FFD500:0057B8,Avusturya:C8102E:FFFFFF,İrlanda Cumhuriyeti:0A8A3E:FFFFFF,Romanya:FFD500:C8102E,Polonya:C8102E:FFFFFF,İsveç:FFD500:0057B8,Bosna-Hersek:1D3C8F:FFD500,Litvanya:FFD500:0A8A3E,Malta:C8102E:FFFFFF,Al Fateh:0A8A3E:FFFFFF,Al Riyadh:0057B8:FFFFFF,Al Hazem:C8102E:FFFFFF,Neom:00AFCA:FFFFFF,Al Faisaly:C8102E:111111,Diriyah:0057B8:FFD100,Al Taawoun:FFA500:111111`.split(',').forEach(t=>{const[n,p,q]=t.split(':');TC[n]=['#'+p,'#'+q]});
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const bd=(n,l)=>{const[p,q]=TC[n]||['#4a5a68','#cbd5dc'];return`<i class='bd${l?' lg':''}' style='background:${p};box-shadow:0 0 0 2px ${q};color:${lum(p)>.55?'#111':'#fff'}'>${n.replace(/^Al[ -]/,'').replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g,'').slice(0,3).toUpperCase()}${window.kmLogo?kmLogo(n):''}</i>`};
const chp=(m,x)=>{const s=stt(m);if(s.k=='wait')return'';let t,c='var(--warn)';if(s.k=='ft'||(s.k=='live'&&s.sc)){const h=hit(x.k,+s.sc[0],+s.sc[1]);t=s.k=='ft'?(h?'Tuttu':'Tutmadı'):(s.old?'Son skor ':'Oynanıyor ')+s.sc.join('-')+(h?' (şu an tutuyor)':' (şu an tutmuyor)');c=s.k=='ft'?(h?'var(--ok)':'var(--hot)'):'var(--warn)'}else t=s.k=='unk'?'Skor aranıyor':'Oynanıyor';return`<br><span class='cs' style='background:${c}'>${t}</span>${s.sc?' <span class="mut">Skor '+s.sc.join('-')+'</span>':''}`};
const kst=(rs,f)=>{const st=rs.map(r=>{const s=stt(r.m);return s.k=='ft'?(hit(f(r).k,+s.sc[0],+s.sc[1])?'h':'m'):'b'}),h=st.filter(x=>x=='h').length;return st.includes('m')?`<span class='cs' style='background:var(--hot)'>Kupon tutmadı (${h}/${rs.length} seçim tuttu)</span>`:h==rs.length?`<span class='cs' style='background:var(--ok)'>Kupon tuttu</span>`:`<span class='cs' style='background:var(--mut)'>Kupon bekliyor: ${h}/${rs.length} tuttu, ${rs.length-h} sonuç bekleniyor</span>`};
const cl=(r,x)=>{const key=[r.m.c,r.m.h,r.m.a].join('|');return`<div class='pk cr'><div class='cr1'><span data-m='${key}'>${bd(r.m.h)}${bd(r.m.a)}</span><span class='cn' data-m='${key}'>${r.m.h} – ${r.m.a}<small>${r.m.c} · ${hm(r.m.t)}</small></span><span class='co'>${(EO(x)).toFixed(2)}<small>%${Math.round(x.p*100)}</small></span></div><div class='cr2'>${lab(x.k,r.m)}${chp(r.m,x)}</div><details><summary>Neden bu seçim?</summary><div class='why'>${rsn(r.m,x)}</div></details></div>`};
const sel=(rows,f,n)=>{const u=new Set(),o=[];let dn=0;for(const r of rows.sort((a,b)=>f(b).p-f(a).p)){if(u.has(r.m.h)||u.has(r.m.a))continue;if(['1X','X2','12'].includes(f(r).k)&&dn++>=2)continue;u.add(r.m.h);u.add(r.m.a);o.push(r);if(o.length==n)break}return o};
const ok1=k=>k.s&&k.s.o>=1.15?k.s:null;
function card(m){const k=pick(m),[a,b,c]=m.p,ps=k.o;
return`<details class='box m mc' style='--cc:${C[m.c]}'><summary><div class='cp'>${hm(m.t)}${m.t<=Date.now()?' · başladı veya bitti':''}</div><div class='tm'><span>${bd(m.h)} ${m.h}</span><span>${m.a} ${bd(m.a)}</span></div><div class='bar'><i style='width:${a*100}%;background:var(--acc)'></i><i style='width:${b*100}%;background:var(--mut)'></i><i style='width:${c*100}%;background:var(--warn)'></i></div><div class='mut'>%${Math.round(a*100)} · Beraberlik %${Math.round(b*100)} · %${Math.round(c*100)}</div><div class='mut'>▸ Dokun: seçimler ve analiz</div></summary>${ps.length?"<h3>Önerilen düşük oranlı seçenekler</h3>"+ps.map(x=>pcard(x.p>=.7?'Güvenli':'Orta',x.p>=.7?0:1,m,x)).join(''):"<p class='mut'>Bu maçta güvenilir düşük oranlı seçenek yok.</p>"}<details><summary>Detaylı analiz: form, ev/deplasman</summary>${tp(m.h,1)}${tp(m.a,0)}<div class='an'><h4>Aralarındaki maçlar</h4><div class='mut'>${h2h(m)}</div><h4>Tahmini kadro ve sakatlıklar</h4><div class='mut'>Veri yok. Maç öncesi onaylı kadroyu kontrol et.</div></div></details></details>`}
const selN=(rows,n)=>{const u=new Set(),o=[];const sc=r=>Math.abs(r.k.s.p-.72)-(isFavM(r.m)?.03:0);for(const r of rows.sort((a,b)=>sc(a)-sc(b))){if(u.has(r.m.h)||u.has(r.m.a))continue;u.add(r.m.h);u.add(r.m.a);o.push(r);if(o.length==n)break}return o.sort((a,b)=>a.m.t-b.m.t)};
const KPC=[];let CPO=false;function coupon(ms,ttl){const rows=ms.map(m=>({m,k:pick(m)})),isN=ms.length>0&&NB(ms[0]),lo=isN?selN(rows.filter(r=>r.k.s),4):sel(rows.filter(r=>r.k.s),r=>r.k.s,3);
const bx=(t,rs,f,q)=>rs.length?`<details class='box cpn' id='cpd' ${CPO?'open':''}><summary class='cps'><h3>${t}</h3><span class='mut'>${rs.length} seçim · tahmini oran ${rs.reduce((a,r)=>a*EO(f(r)),1).toFixed(2)}</span></summary><div class='mut'>${q}</div>${rs.map(r=>cl(r,f(r))).join('')}<div class='pk'><span class='big'>${rs.reduce((a,r)=>a*EO(f(r)),1).toFixed(2)}</span><span class='s'>Toplam tahmini oran<br>Birlikte tutma ihtimali ~%${Math.round(rs.reduce((a,r)=>a*f(r).p,1)*100)}</span></div><button class='kpb' data-kall='${KPC.push(rs.map(r=>({mk:[r.m.c,r.m.h,r.m.a].join('|'),k:f(r).k})))-1}'>Kupona ekle (${rs.length} seçim)</button><div>${kst(rs,f)}</div></details>`:'';
const nb=()=>{let b=null;ms.forEach(m=>pick(m).o.forEach(x=>{if(!b||x.p>b.p)b={p:x.p,m,x}}));return b?`<p class="mut">Bu gün düşük riskli eşiği (%70) geçen seçim yok. Günün en yüksek ihtimalli mantıklı seçeneği: ${lab(b.x.k,b.m)} (%${Math.round(b.x.p*100)}, ${b.m.h} – ${b.m.a}). Bu bir öneri değil; seçenekler için "Tüm maçlar" sekmesine bak.</p>`:'<p class="mut">Bu gün düşük oranlı mantıklı seçenek yok.</p>'};
return bx(ttl||(isN?'Günün kuponu · yükseltilmiş oran (rolling)':'Günün düşük riskli kuponu'),lo,r=>r.k.s,isN?'Her seçimin ihtimali %62-80 arasında, hedef yaklaşık %72 (model oranı ~1.4, bahis sitesinde genelde 1.2-1.3). Yalnızca gol seçenekleri (takım golü, Ü/KG), taraf bahsi yok. Favori takımların maçları küçük öncelik alır. Seçimler maç saatine göre sıralı. Hiçbir bahis risksiz değildir.':'Her seçimin ihtimali en az %70 ve en çok %87 (çok düşük oranlı seçimler elenir). Hiçbir bahis risksiz değildir.')||nb()}
const LGR=`SA|10-29T17:30|Frosinone|Lecce|1X|0.796|1.256
SA|10-29T17:30|Frosinone|Lecce|12|0.777|1.287
SA|10-29T19:45|Fiorentina|Atalanta|12|0.741|1.350
SL|10-30T17:00|Konyaspor|Galatasaray|12|0.765|1.307
L1|10-30T18:00|Le Havre|PSG|2|0.782|1.279
L1|10-30T18:00|Nice|Rennes|12|0.750|1.333
BL|10-30T19:30|Elversberg|Mainz|12|0.753|1.328
LL|10-30T20:00|Villarreal|Espanyol|1X|0.853|1.172
LL|10-30T20:00|Villarreal|Espanyol|12|0.813|1.230
L1|10-30T20:05|Lille|Lens|12|0.737|1.357
SL|10-31T10:30|Erzurumspor|Çorum|12|0.784|1.275
PL|10-31T12:30|Chelsea|Man United|1X|0.769|1.300
PL|10-31T12:30|Chelsea|Man United|12|0.761|1.314
LL|10-31T13:00|Levante|Atletico Madrid|X2|0.808|1.238
LL|10-31T13:00|Levante|Atletico Madrid|12|0.786|1.272
SL|10-31T13:00|Kocaelispor|Rizespor|12|0.758|1.319
SL|10-31T13:00|Kocaelispor|Rizespor|1X|0.711|1.407
SA|10-31T14:00|Bologna|Monza|1X|0.793|1.261
SA|10-31T14:00|Bologna|Monza|12|0.748|1.337
BL|10-31T14:30|Leverkusen|Stuttgart|12|0.781|1.280
BL|10-31T14:30|Leverkusen|Stuttgart|1X|0.745|1.342
BL|10-31T14:30|Augsburg|Freiburg|12|0.752|1.330
BL|10-31T14:30|M’gladbach|Paderborn|12|0.760|1.316
BL|10-31T14:30|M’gladbach|Paderborn|1X|0.728|1.374
BL|10-31T14:30|Werder Bremen|Hoffenheim|12|0.756|1.323
BL|10-31T14:30|Schalke|Leipzig|12|0.758|1.319
BL|10-31T14:30|Schalke|Leipzig|X2|0.751|1.332
PL|10-31T15:00|Bournemouth|Leeds|1X|0.727|1.376
PL|10-31T15:00|Brentford|N. Forest|12|0.742|1.348
PL|10-31T15:00|Brentford|N. Forest|1X|0.738|1.355
PL|10-31T15:00|Man City|Brighton|1X|0.796|1.256
PL|10-31T15:00|Man City|Brighton|12|0.784|1.276
SL|10-31T16:00|Fenerbahçe|Göztepe|12|0.826|1.210
SL|10-31T16:00|Fenerbahçe|Göztepe|1X|0.745|1.342
PL|10-31T17:30|Tottenham|C. Palace|12|0.795|1.258
LL|10-31T17:30|Betis|Malaga|12|0.827|1.209
LL|10-31T17:30|Betis|Malaga|1|0.700|1.429
BL|10-31T17:30|Bayern|Dortmund|12|0.850|1.176
BL|10-31T17:30|Bayern|Dortmund|1|0.720|1.389
PL|10-31T20:00|Aston Villa|Fulham|12|0.745|1.342
PL|10-31T20:00|Aston Villa|Fulham|1X|0.732|1.366
SL|11-01T10:30|Amedspor|Eyüpspor|1|0.769|1.300
SL|11-01T13:00|Trabzonspor|Gaziantep|12|0.837|1.195
SL|11-01T13:00|Trabzonspor|Gaziantep|1X|0.827|1.210
SL|11-01T13:00|Başakşehir|Samsunspor|12|0.797|1.255
SL|11-01T13:00|Başakşehir|Samsunspor|1X|0.777|1.286
L1|11-01T14:00|Strasbourg|Auxerre|1X|0.764|1.309
L1|11-01T14:00|Strasbourg|Auxerre|12|0.762|1.312
BL|11-01T14:30|Union Berlin|Köln|12|0.740|1.351
LL|11-01T15:15|Racing Santander|Real Madrid|2|0.787|1.271
SL|11-01T16:00|Kasımpaşa|Beşiktaş|12|0.778|1.286
L1|11-01T16:15|Lyon|Angers|12|0.822|1.217
L1|11-01T16:15|Paris FC|Monaco|12|0.732|1.366
PL|11-01T16:30|Liverpool|Arsenal|12|0.730|1.370
BL|11-01T16:30|Frankfurt|Hamburg|1X|0.790|1.266
BL|11-01T16:30|Frankfurt|Hamburg|12|0.785|1.274
L1|11-01T19:45|Marseille|Toulouse|12|0.757|1.321
L1|11-01T19:45|Marseille|Toulouse|1X|0.743|1.346
LL|11-01T20:00|Athletic|Real Sociedad|12|0.742|1.348
LL|11-01T20:00|Athletic|Real Sociedad|1X|0.710|1.408
SL|11-02T17:00|Gençlerbirliği|Alanyaspor|12|0.752|1.329
PL|11-02T20:00|Newcastle|Everton|12|0.738|1.355
LL|11-02T20:00|Deportivo|Osasuna|1X|0.731|1.368
CL|11-03T17:45|Shakhtar|Sporting|12|0.745|1.342
CL|11-03T17:45|Shakhtar|Sporting|X2|0.734|1.362
CL|11-03T17:45|Galatasaray|Stuttgart|12|0.757|1.321
CL|11-03T20:00|Atletico Madrid|Bayern|12|0.766|1.305
CL|11-03T20:00|Atletico Madrid|Bayern|X2|0.711|1.406
CL|11-03T20:00|Barcelona|Aston Villa|1|0.786|1.272
CL|11-03T20:00|Feyenoord|Inter|X2|0.782|1.279
CL|11-03T20:00|Feyenoord|Inter|12|0.780|1.282
CL|11-03T20:00|Bodø/Glimt|Lille|12|0.757|1.321
CL|11-03T20:00|Bodø/Glimt|Lille|1X|0.738|1.355
CL|11-03T20:00|LASK|Slovan Bratislava|1X|0.849|1.178
CL|11-03T20:00|LASK|Slovan Bratislava|12|0.817|1.224
CL|11-03T20:00|Man United|Roma|12|0.750|1.333
CL|11-03T20:00|Villarreal|PSG|12|0.797|1.255
CL|11-03T20:00|Villarreal|PSG|X2|0.795|1.258
CL|11-04T17:45|AEK Atina|Real Madrid|12|0.851|1.175
CL|11-04T17:45|AEK Atina|Real Madrid|2|0.736|1.359
SA|10-29T17:30|Frosinone|Lecce|EG1|0.855|1.170
SL|10-30T17:00|Konyaspor|Galatasaray|DG1|0.761|1.315
L1|10-30T18:00|Nice|Rennes|DG1|0.760|1.316
BL|10-30T19:30|Elversberg|Mainz|DG1|0.791|1.264
PL|10-31T12:30|Chelsea|Man United|EG1|0.837|1.195
LL|10-31T13:00|Levante|Atletico Madrid|DG1|0.863|1.159
SA|10-31T14:00|Bologna|Monza|EG1|0.846|1.182
BL|10-31T14:30|Leverkusen|Stuttgart|EG1|0.829|1.207
BL|10-31T14:30|Augsburg|Freiburg|DG1|0.782|1.279
BL|10-31T14:30|M’gladbach|Paderborn|EG1|0.813|1.230
BL|10-31T14:30|Werder Bremen|Hoffenheim|DG1|0.771|1.297
BL|10-31T14:30|Schalke|Leipzig|DG1|0.826|1.211
PL|10-31T15:00|Brentford|N. Forest|EG1|0.813|1.229
PL|10-31T15:00|Coventry|Sunderland|DG1|0.773|1.294
PL|10-31T15:00|Man City|Brighton|EG1|0.857|1.168
SL|10-31T16:00|Fenerbahçe|Göztepe|EG1|0.841|1.189
PL|10-31T20:00|Aston Villa|Fulham|EG1|0.811|1.233
LL|10-31T20:00|Barcelona|Alaves|Ü1.5|0.853|1.172
LL|10-31T20:00|Barcelona|Alaves|EG2|0.798|1.253
SL|11-01T10:30|Amedspor|Eyüpspor|EG2|0.705|1.419
LL|11-01T13:00|Getafe|Sevilla|DG1|0.762|1.313
SL|11-01T13:00|Başakşehir|Samsunspor|EG1|0.850|1.176
L1|11-01T14:00|Strasbourg|Auxerre|EG1|0.834|1.199
PL|11-01T16:30|Liverpool|Arsenal|DG1|0.776|1.289
BL|11-01T16:30|Frankfurt|Hamburg|EG1|0.854|1.171
L1|11-01T19:45|Marseille|Toulouse|EG1|0.821|1.218
CL|11-03T17:45|Shakhtar|Sporting|DG1|0.812|1.232
CL|11-03T20:00|Atletico Madrid|Bayern|DG1|0.804|1.243
CL|11-03T20:00|Barcelona|Aston Villa|EG2|0.726|1.378
CL|11-03T20:00|Feyenoord|Inter|DG1|0.848|1.179
CL|11-03T20:00|Bodø/Glimt|Lille|EG1|0.818|1.223
CL|11-03T20:00|Villarreal|PSG|DG1|0.859|1.164
LL|10-30T20:00|Villarreal|Espanyol|Ü1.5|0.818|1.222
LL|10-31T13:00|Levante|Atletico Madrid|Ü1.5|0.804|1.243
LL|10-31T17:30|Betis|Malaga|Ü1.5|0.825|1.213
LL|11-01T15:15|Racing Santander|Real Madrid|Ü1.5|0.838|1.194
SA|10-31T17:00|Udinese|Roma|X2|0.837|1.195
SA|10-31T17:00|Udinese|Roma|12|0.793|1.261
SA|10-31T19:45|Milan|Inter|DG1|0.813|1.230
SA|10-31T19:45|Milan|Inter|X2|0.734|1.362
SA|11-01T11:30|Como|Venezia|12|0.851|1.175
SA|11-01T14:00|Lazio|Cagliari|12|0.805|1.242
SA|11-01T17:00|Lecce|Genoa|DG1|0.762|1.312
SA|11-01T19:45|Juventus|Napoli|1X|0.704|1.420
SA|10-29T17:30|Frosinone|Lecce|EG2|0.575|1.741
SA|10-29T19:45|Fiorentina|Atalanta|1X|0.688|1.453
SL|10-30T17:00|Konyaspor|Galatasaray|X2|0.647|1.546
L1|10-30T18:00|Le Havre|PSG|Ü2.5|0.634|1.577
L1|10-30T18:00|Nice|Rennes|X2|0.653|1.531
BL|10-30T19:30|Elversberg|Mainz|X2|0.697|1.435
LL|10-30T20:00|Villarreal|Espanyol|EG2|0.646|1.549
L1|10-30T20:05|Lille|Lens|1X|0.649|1.541
SL|10-31T10:30|Erzurumspor|Çorum|1X|0.618|1.618
SA|10-31T14:00|Bologna|Monza|EG2|0.558|1.794
BL|10-31T14:30|Augsburg|Freiburg|X2|0.683|1.464
BL|10-31T14:30|Werder Bremen|Hoffenheim|X2|0.666|1.502
PL|10-31T15:00|Coventry|Sunderland|X2|0.685|1.460
LL|10-31T15:15|Rayo|Celta|1X|0.691|1.447
SA|10-31T17:00|Udinese|Roma|2|0.630|1.587
PL|10-31T17:30|Tottenham|C. Palace|EG2|0.614|1.630
LL|10-31T17:30|Betis|Malaga|EG2|0.670|1.491
BL|10-31T17:30|Bayern|Dortmund|EG2|0.678|1.474
L1|10-31T19:45|Troyes|Le Mans|1X|0.690|1.449
LL|10-31T20:00|Barcelona|Alaves|Ü2.5|0.660|1.516
SL|11-01T10:30|Amedspor|Eyüpspor|Ü2.5|0.626|1.596
SA|11-01T11:30|Como|Venezia|EG2|0.700|1.429
SA|11-01T11:30|Como|Venezia|Ü2.5|0.625|1.601
LL|11-01T13:00|Getafe|Sevilla|X2|0.689|1.451
SL|11-01T13:00|Trabzonspor|Gaziantep|EG2|0.632|1.583
SA|11-01T14:00|Frosinone|Torino|1X|0.686|1.458
SA|11-01T14:00|Lazio|Cagliari|1|0.683|1.464
SA|11-01T14:00|Lazio|Cagliari|EG2|0.665|1.504
BL|11-01T14:30|Union Berlin|Köln|1X|0.643|1.555
LL|11-01T15:15|Racing Santander|Real Madrid|Ü2.5|0.635|1.576
SL|11-01T16:00|Kasımpaşa|Beşiktaş|1X|0.699|1.431
L1|11-01T16:15|Lyon|Angers|1|0.694|1.441
L1|11-01T16:15|Lyon|Angers|EG2|0.667|1.499
L1|11-01T16:15|Paris FC|Monaco|1X|0.687|1.456
PL|11-01T16:30|Liverpool|Arsenal|X2|0.686|1.458
SA|11-01T17:00|Lecce|Genoa|X2|0.683|1.464
LL|11-01T17:30|Elche|Valencia|1X|0.679|1.473
SL|11-02T17:00|Gençlerbirliği|Alanyaspor|X2|0.627|1.595
L1|11-02T19:45|Lorient|Brest|1X|0.677|1.477
PL|11-02T20:00|Newcastle|Everton|1X|0.685|1.460
CL|11-03T17:45|Galatasaray|Stuttgart|1X|0.671|1.490
CL|11-03T20:00|Barcelona|Aston Villa|Ü2.5|0.634|1.576
CL|11-03T20:00|LASK|Slovan Bratislava|EG2|0.644|1.554
CL|11-03T20:00|Man United|Roma|1X|0.659|1.517
CL|11-04T17:45|AEK Atina|Real Madrid|Ü2.5|0.622|1.608
KSA|10-30T12:30|Abha|Al Ittihad|X2|0.843|1.187
KSA|10-30T12:30|Abha|Al Ittihad|12|0.788|1.268
KSA|10-30T12:30|Abha|Al Ittihad|2|0.631|1.584
KSA|10-30T14:50|Diriyah|Neom|X2|0.734|1.363
KSA|10-30T18:00|Al Shabab|Al Ahli|DG1|0.817|1.224
KSA|10-30T18:00|Al Shabab|Al Ahli|12|0.785|1.274
KSA|10-30T18:00|Al Shabab|Al Ahli|X2|0.723|1.384
KSA|10-31T13:30|Al Taawoun|Al Ettifaq|DG1|0.847|1.180
KSA|10-31T13:30|Al Taawoun|Al Ettifaq|X2|0.797|1.255
KSA|10-31T14:55|Al Fayha|Al Faisaly|EG1|0.797|1.254
KSA|10-31T14:55|Al Fayha|Al Faisaly|1X|0.708|1.413
KSA|10-31T18:00|Al Hilal|Al Fateh|Ü1.5|0.855|1.170
KSA|10-31T18:00|Al Hilal|Al Fateh|EG2|0.808|1.238
KSA|10-31T18:00|Al Hilal|Al Fateh|Ü2.5|0.663|1.509
SA|11-02T17:30|Sassuolo|Fiorentina|DG1|0.760|1.315
SA|11-02T17:30|Sassuolo|Fiorentina|X2|0.658|1.520
SA|11-02T19:45|Atalanta|Parma|1X|0.847|1.181
SA|11-02T19:45|Atalanta|Parma|12|0.797|1.255
SA|11-02T19:45|Atalanta|Parma|EG2|0.632|1.581
BEL|10-31T15:00|Mechelen|Genk|DG1|0.833|1.201
BEL|10-31T15:00|Mechelen|Genk|12|0.786|1.272
BEL|10-31T15:00|Mechelen|Genk|X2|0.750|1.333
BEL|10-31T17:15|Standard|Kortrijk|12|0.828|1.208
BEL|10-31T17:15|Standard|Kortrijk|1|0.736|1.359
BEL|10-31T17:15|Standard|Kortrijk|EG2|0.703|1.423
BEL|10-31T19:45|Beveren|Union SG|12|0.849|1.178
BEL|10-31T19:45|Beveren|Union SG|2|0.741|1.350
BEL|10-31T19:45|Anderlecht|Westerlo|1X|0.635|1.576
BEL|11-01T12:30|Cercle Brugge|Antwerp|12|0.788|1.269
BEL|11-01T12:30|Cercle Brugge|Antwerp|X2|0.612|1.633
BEL|11-01T15:00|STVV|OH Leuven|EG1|0.859|1.164
BEL|11-01T15:00|STVV|OH Leuven|12|0.797|1.254
BEL|11-01T15:00|STVV|OH Leuven|1X|0.795|1.258
BEL|11-01T17:30|Lommel SK|Gent|DG1|0.849|1.178
BEL|11-01T17:30|Lommel SK|Gent|X2|0.807|1.239
BEL|11-01T18:15|Charleroi|La Louvière|1X|0.857|1.167
BEL|11-01T18:15|Charleroi|La Louvière|12|0.814|1.229
BEL|11-01T18:15|Charleroi|La Louvière|EG2|0.649|1.540
BEL|11-04T19:45|Kortrijk|Mechelen|X2|0.752|1.330
SA|11-01T11:30|Como|Venezia|1|0.744|1.344
SA|11-01T14:00|Frosinone|Torino|EG1|0.783|1.277
BL|11-01T16:30|Frankfurt|Hamburg|EG2|0.573|1.746
SA|11-01T19:45|Juventus|Napoli|EG1|0.784|1.276
CL|11-04T17:45|Fenerbahçe|Liverpool|X2|0.836|1.196
CL|11-04T17:45|Fenerbahçe|Liverpool|12|0.811|1.233
CL|11-04T17:45|Fenerbahçe|Liverpool|2|0.647|1.546
CL|11-04T20:00|Dortmund|Betis|EG1|0.844|1.185
CL|11-04T20:00|Dortmund|Betis|1X|0.776|1.289
CL|11-04T20:00|Dortmund|Betis|EG2|0.554|1.806
CL|11-04T20:00|Porto|Napoli|EG1|0.816|1.225
CL|11-04T20:00|Porto|Napoli|1X|0.741|1.350
CL|11-04T20:00|PSV|Club Brugge|1X|0.694|1.441
CL|11-04T20:00|Leipzig|Man City|X2|0.819|1.221
CL|11-04T20:00|Leipzig|Man City|12|0.811|1.233
CL|11-04T20:00|Leipzig|Man City|2|0.630|1.587
CL|11-04T20:00|Lens|Como|DG1|0.790|1.266
CL|11-04T20:00|Lens|Como|X2|0.697|1.435
CL|11-04T20:00|Slavia Prague|Arsenal|12|0.860|1.163
CL|11-04T20:00|Slavia Prague|Arsenal|2|0.784|1.276
CL|11-04T20:00|Slavia Prague|Arsenal|Ü2.5|0.637|1.570
CL|11-04T20:00|Viking|Sabah|1X|0.859|1.164
CL|11-04T20:00|Viking|Sabah|12|0.828|1.208
CL|11-04T20:00|Viking|Sabah|EG2|0.658|1.520
CL|11-04T20:00|Dortmund|Betis|12|0.780|1.282
CL|11-04T20:00|PSV|Club Brugge|EG1|0.815|1.228
EL|11-05T17:45|Milan|Ferencváros|DG1|0.781|1.281
EL|11-05T17:45|Milan|Ferencváros|X2|0.673|1.486
EL|11-05T17:45|Sparta Praha|Bournemouth|DG1|0.757|1.320
EL|11-05T17:45|Sparta Praha|Bournemouth|X2|0.650|1.539
EL|11-05T17:45|Palace|Hoffenheim|EG1|0.829|1.206
EL|11-05T17:45|Palace|Hoffenheim|12|0.790|1.266
EL|11-05T17:45|Palace|Hoffenheim|1X|0.741|1.349
EL|11-05T17:45|Lillestrøm|Viktoria Plzeň|1X|0.661|1.512
EL|11-05T17:45|NEC Nijmegen|Omonia|1X|0.616|1.625
EL|11-05T17:45|Levski Sofia|Jagiellonia|EG1|0.813|1.230
EL|11-05T17:45|Levski Sofia|Jagiellonia|1X|0.729|1.371
EL|11-05T17:45|Real Sociedad|Lyon|EG1|0.859|1.165
EL|11-05T17:45|Real Sociedad|Lyon|12|0.801|1.249
EL|11-05T17:45|Real Sociedad|Lyon|1X|0.792|1.263
EL|11-05T17:45|Anderlecht|Salzburg|EG1|0.835|1.197
EL|11-05T17:45|Anderlecht|Salzburg|1X|0.764|1.309
EL|11-05T20:00|AZ Alkmaar|Juventus|1X|0.666|1.502
EL|11-05T20:00|Leverkusen|Marseille|12|0.820|1.220
EL|11-05T20:00|Leverkusen|Marseille|1|0.704|1.419
EL|11-05T20:00|Leverkusen|Marseille|EG2|0.678|1.475
EL|11-05T20:00|Celtic|Beşiktaş|DG1|0.818|1.223
EL|11-05T20:00|Celtic|Beşiktaş|12|0.794|1.260
EL|11-05T20:00|Celtic|Beşiktaş|X2|0.719|1.390
EL|11-05T20:00|Hapoel Beer-Sheva|OFI Crete|X2|0.641|1.559
EL|11-05T20:00|Celta|Union SG|DG1|0.798|1.254
EL|11-05T20:00|Celta|Union SG|X2|0.708|1.413
EL|11-05T20:00|Torreense|Ararat-Armenia|EG1|0.857|1.167
EL|11-05T20:00|Torreense|Ararat-Armenia|12|0.803|1.245
EL|11-05T20:00|Torreense|Ararat-Armenia|1X|0.787|1.270
EL|11-05T20:00|Sturm Graz|Celje|EG1|0.817|1.224
EL|11-05T20:00|Sturm Graz|Celje|1X|0.743|1.346
EL|11-05T20:00|Benfica|Lech Poznań|12|0.864|1.157
EL|11-05T20:00|Benfica|Lech Poznań|EG2|0.721|1.386
EL|11-05T20:00|Benfica|Lech Poznań|Ü2.5|0.633|1.580
EL|11-05T20:00|Sunderland|Dinamo Zagreb|EG1|0.823|1.214
EL|11-05T20:00|Sunderland|Dinamo Zagreb|1X|0.752|1.330
ECL|11-05T17:45|Aarhus|Braga|1X|0.697|1.434
ECL|11-05T17:45|Atalanta|Kairat Almaty|EG1|0.841|1.188
ECL|11-05T17:45|Atalanta|Kairat Almaty|12|0.785|1.275
ECL|11-05T17:45|Atalanta|Kairat Almaty|1X|0.766|1.305
ECL|11-05T17:45|Crvena Zvezda|Inter Escaldes|EG1|0.835|1.197
ECL|11-05T17:45|Crvena Zvezda|Inter Escaldes|12|0.785|1.274
ECL|11-05T17:45|Crvena Zvezda|Inter Escaldes|1X|0.755|1.325
ECL|11-05T17:45|Midtjylland|Ajax|1X|0.657|1.522
ECL|11-05T17:45|Thun|Hearts|1X|0.699|1.431
ECL|11-05T17:45|KuPS Kuopio|Gent|1X|0.641|1.561
ECL|11-05T17:45|Lincoln Red Imps|Hajduk Split|DG1|0.779|1.283
ECL|11-05T17:45|Lincoln Red Imps|Hajduk Split|X2|0.677|1.477
ECL|11-05T17:45|Mjällby|Borac|1X|0.718|1.392
ECL|11-05T17:45|Trabzonspor|Freiburg|EG1|0.864|1.157
ECL|11-05T17:45|Trabzonspor|Freiburg|12|0.805|1.242
ECL|11-05T17:45|Trabzonspor|Freiburg|1X|0.801|1.248
ECL|11-05T20:00|Craiova|Egnatia|EG1|0.816|1.226
ECL|11-05T20:00|Craiova|Egnatia|1X|0.734|1.362
ECL|11-05T20:00|Copenhagen|Iberia Tbilisi|EG1|0.851|1.176
ECL|11-05T20:00|Copenhagen|Iberia Tbilisi|1X|0.788|1.270
ECL|11-05T20:00|Copenhagen|Iberia Tbilisi|EG2|0.567|1.765
ECL|11-05T20:00|Lugano|Kauno Žalgiris|12|0.855|1.170
ECL|11-05T20:00|Lugano|Kauno Žalgiris|1|0.727|1.375
ECL|11-05T20:00|Lugano|Kauno Žalgiris|EG2|0.683|1.465
ECL|11-05T20:00|Twente|Pafos|EG1|0.862|1.161
ECL|11-05T20:00|Twente|Pafos|1X|0.804|1.244
ECL|11-05T20:00|Twente|Pafos|12|0.788|1.268
ECL|11-05T20:00|Getafe|Brighton|DG1|0.796|1.256
ECL|11-05T20:00|Getafe|Brighton|X2|0.700|1.430
ECL|11-05T20:00|Monaco|Nordsjælland|EG1|0.841|1.188
ECL|11-05T20:00|Monaco|Nordsjælland|1X|0.770|1.298
ECL|11-05T20:00|Panathinaikos|CSKA Sofia|EG1|0.863|1.159
ECL|11-05T20:00|Panathinaikos|CSKA Sofia|12|0.804|1.244
ECL|11-05T20:00|Panathinaikos|CSKA Sofia|1X|0.799|1.251
ECL|11-05T20:00|Riga|Jablonec|1X|0.717|1.395
ECL|11-05T20:00|Sint-Truidense|Brann|1X|0.687|1.455
EL|11-05T17:45|C. Palace|Hoffenheim|EG1|0.829|1.206
EL|11-05T17:45|C. Palace|Hoffenheim|12|0.790|1.266
EL|11-05T17:45|C. Palace|Hoffenheim|1X|0.741|1.349
EL|11-05T17:45|NEC Nijmegen|Omonia|12|0.782|1.278
EL|11-05T17:45|Anderlecht|Salzburg|EG2|0.595|1.682
EL|11-05T20:00|Leverkusen|Marseille|1X|0.856|1.168
EL|11-05T20:00|Hapoel Beer-Sheva|OFI Crete|DG1|0.794|1.259
EL|11-05T20:00|Torreense|Ararat-Armenia|EG2|0.606|1.649
EL|11-05T20:00|Benfica|Lech Poznań|1|0.813|1.229
ECL|11-05T17:45|Midtjylland|Ajax|DG1|0.846|1.182
ECL|11-05T17:45|Midtjylland|Ajax|12|0.787|1.270
ECL|11-05T17:45|Midtjylland|Ajax|X2|0.774|1.292
ECL|11-05T17:45|Thun|Hearts|EG1|0.834|1.199
ECL|11-05T17:45|Mjällby|Borac|EG1|0.845|1.183
ECL|11-05T17:45|Mjällby|Borac|EG2|0.556|1.797
ECL|11-05T20:00|Craiova|Egnatia|EG2|0.574|1.743
ECL|11-05T20:00|Copenhagen|Iberia Tbilisi|12|0.783|1.277
ECL|11-05T20:00|Lugano|Kauno Žalgiris|Ü2.5|0.641|1.559
ECL|11-05T20:00|Twente|Pafos|EG2|0.648|1.543
ECL|11-05T20:00|Monaco|Nordsjælland|12|0.785|1.273
ECL|11-05T20:00|Monaco|Nordsjælland|EG2|0.612|1.634
ECL|11-05T20:00|Panathinaikos|CSKA Sofia|EG2|0.617|1.620
UNL|11-12T17:00|Türkiye|Belçika|DG1|0.830|1.205
UNL|11-12T17:00|Türkiye|Belçika|X2|0.754|1.326
UNL|11-12T17:00|Ermenistan|Kıbrıs|X2|0.657|1.522
UNL|11-12T19:45|İtalya|Fransa|1X|0.643|1.555
UNL|11-12T19:45|Çekya|İspanya|X2|0.829|1.207
UNL|11-12T19:45|Çekya|İspanya|12|0.815|1.227
UNL|11-12T19:45|Çekya|İspanya|2|0.644|1.554
UNL|11-12T19:45|İngiltere|Hırvatistan|Ü1.5|0.852|1.174
UNL|11-12T19:45|İngiltere|Hırvatistan|EG2|0.791|1.264
UNL|11-12T19:45|İngiltere|Hırvatistan|Ü2.5|0.657|1.521
UNL|11-12T19:45|Arnavutluk|Finlandiya|1X|0.652|1.534
UNL|11-12T19:45|San Marino|Belarus|12|0.811|1.233
UNL|11-12T19:45|San Marino|Belarus|2|0.699|1.432
UNL|11-12T19:45|Karadağ|Letonya|1X|0.840|1.191
UNL|11-12T19:45|Karadağ|Letonya|EG2|0.612|1.634
UNL|11-12T19:45|Karadağ|Letonya|1|0.608|1.644
UNL|11-13T17:00|Moldova|Kazakistan|X2|0.634|1.576
UNL|11-13T19:45|Hollanda|Yunanistan|1X|0.693|1.443
UNL|11-13T19:45|Sırbistan|Almanya|DG1|0.780|1.282
UNL|11-13T19:45|Sırbistan|Almanya|X2|0.701|1.427
UNL|11-13T19:45|İskoçya|Kuzey Makedonya|1X|0.860|1.163
UNL|11-13T19:45|İskoçya|Kuzey Makedonya|EG2|0.625|1.599
UNL|11-13T19:45|İskoçya|Kuzey Makedonya|1|0.617|1.622
UNL|11-13T19:45|Slovenya|İsviçre|DG1|0.817|1.223
UNL|11-13T19:45|Slovenya|İsviçre|X2|0.754|1.327
UNL|11-13T19:45|Slovakya|Faroe Adaları|1X|0.835|1.198
UNL|11-13T19:45|Slovakya|Faroe Adaları|1|0.612|1.633
UNL|11-13T19:45|Slovakya|Faroe Adaları|EG2|0.612|1.635
UNL|11-13T19:45|Bulgaristan|İzlanda|DG1|0.825|1.212
UNL|11-13T19:45|Bulgaristan|İzlanda|X2|0.774|1.292
UNL|11-13T19:45|Lüksemburg|Estonya|DG1|0.792|1.262
UNL|11-13T19:45|Lüksemburg|Estonya|X2|0.744|1.344
UNL|11-13T19:45|Andorra|Gibraltar|DG1|0.754|1.326
UNL|11-13T19:45|Andorra|Gibraltar|X2|0.725|1.380
UNL|11-13T19:45|Liechtenstein|Azerbaycan|DG1|0.785|1.274
UNL|11-13T19:45|Liechtenstein|Azerbaycan|X2|0.776|1.288
UNL|11-14T14:00|Kosova|İsrail|EG1|0.836|1.195
UNL|11-14T14:00|Kosova|İsrail|1X|0.792|1.263
UNL|11-14T17:00|Norveç|Galler|EG1|0.810|1.234
UNL|11-14T17:00|Norveç|Galler|1X|0.730|1.371
UNL|11-14T17:00|Gürcistan|Macaristan|DG1|0.760|1.316
UNL|11-14T17:00|Gürcistan|Macaristan|X2|0.733|1.365
UNL|11-14T19:45|Portekiz|Danimarka|EG1|0.854|1.170
UNL|11-14T19:45|Portekiz|Danimarka|12|0.796|1.257
UNL|11-14T19:45|Portekiz|Danimarka|1X|0.786|1.272
UNL|11-14T19:45|Kuzey İrlanda|Ukrayna|EG1|0.869|1.151
UNL|11-14T19:45|Kuzey İrlanda|Ukrayna|1X|0.863|1.159
UNL|11-14T19:45|Kuzey İrlanda|Ukrayna|EG2|0.602|1.662
UNL|11-14T19:45|Avusturya|İrlanda Cumhuriyeti|EG1|0.814|1.228
UNL|11-14T19:45|Avusturya|İrlanda Cumhuriyeti|1X|0.731|1.369
UNL|11-14T19:45|Romanya|Polonya|X2|0.828|1.208
UNL|11-14T19:45|Romanya|Polonya|12|0.801|1.248
UNL|11-14T19:45|Romanya|Polonya|2|0.629|1.589
UNL|11-14T19:45|İsveç|Bosna-Hersek|1X|0.724|1.382
UNL|11-15T14:00|Kıbrıs|Karadağ|1X|0.687|1.455
UNL|11-15T14:00|Letonya|Ermenistan|X2|0.661|1.513
UNL|11-15T17:00|Belarus|Arnavutluk|1X|0.676|1.480
UNL|11-15T17:00|Finlandiya|San Marino|Ü1.5|0.855|1.170
UNL|11-15T17:00|Finlandiya|San Marino|EG2|0.809|1.236
UNL|11-15T17:00|Finlandiya|San Marino|Ü2.5|0.663|1.509
UNL|11-15T19:45|Belçika|İtalya|1X|0.655|1.527
UNL|11-15T19:45|Fransa|Türkiye|12|0.838|1.193
UNL|11-15T19:45|Fransa|Türkiye|EG2|0.705|1.418
UNL|11-15T19:45|Fransa|Türkiye|Ü2.5|0.627|1.596
UNL|11-15T19:45|Hırvatistan|Çekya|1X|0.683|1.465
UNL|11-15T19:45|İspanya|İngiltere|12|0.787|1.270
UNL|11-15T19:45|İspanya|İngiltere|X2|0.613|1.632
UNL|11-16T15:00|Faroe Adaları|Moldova|EG1|0.853|1.172
UNL|11-16T15:00|Faroe Adaları|Moldova|1X|0.800|1.250
UNL|11-16T15:00|Faroe Adaları|Moldova|EG2|0.572|1.749
UNL|11-16T15:00|Kazakistan|Slovakya|DG1|0.836|1.196
UNL|11-16T15:00|Kazakistan|Slovakya|X2|0.768|1.302
UNL|11-16T17:00|Estonya|Bulgaristan|EG1|0.819|1.221
UNL|11-16T17:00|Estonya|Bulgaristan|1X|0.785|1.274
UNL|11-16T17:00|İzlanda|Lüksemburg|12|0.794|1.259
UNL|11-16T17:00|İzlanda|Lüksemburg|1|0.691|1.447
UNL|11-16T17:00|İzlanda|Lüksemburg|EG2|0.678|1.476
UNL|11-16T17:00|Litvanya|Liechtenstein|EG1|0.840|1.191
UNL|11-16T17:00|Litvanya|Liechtenstein|1X|0.833|1.200
UNL|11-16T19:45|Almanya|Hollanda|1X|0.692|1.446
UNL|11-16T19:45|Yunanistan|Sırbistan|EG1|0.865|1.156
UNL|11-16T19:45|Yunanistan|Sırbistan|1X|0.821|1.217
UNL|11-16T19:45|Yunanistan|Sırbistan|EG2|0.595|1.680
UNL|11-16T19:45|Kuzey Makedonya|Slovenya|X2|0.847|1.181
UNL|11-16T19:45|Kuzey Makedonya|Slovenya|2|0.595|1.682
UNL|11-16T19:45|İsviçre|İskoçya|12|0.815|1.227
UNL|11-16T19:45|İsviçre|İskoçya|EG2|0.695|1.439
UNL|11-16T19:45|İsviçre|İskoçya|Ü2.5|0.623|1.606
UNL|11-16T19:45|Gibraltar|Malta|X2|0.699|1.431
UNL|11-17T19:45|Danimarka|Norveç|EG1|0.821|1.218
UNL|11-17T19:45|Danimarka|Norveç|12|0.786|1.273
UNL|11-17T19:45|Danimarka|Norveç|1X|0.730|1.371
UNL|11-17T19:45|Galler|Portekiz|DG1|0.808|1.238
UNL|11-17T19:45|Galler|Portekiz|X2|0.729|1.371
UNL|11-17T19:45|Macaristan|Kuzey İrlanda|DG1|0.760|1.316
UNL|11-17T19:45|Macaristan|Kuzey İrlanda|X2|0.720|1.389
UNL|11-17T19:45|Ukrayna|Gürcistan|1X|0.732|1.366
UNL|11-17T19:45|İsrail|Avusturya|DG1|0.841|1.189
UNL|11-17T19:45|İsrail|Avusturya|X2|0.777|1.288
UNL|11-17T19:45|İrlanda Cumhuriyeti|Kosova|EG1|0.827|1.209
UNL|11-17T19:45|İrlanda Cumhuriyeti|Kosova|1X|0.772|1.295
UNL|11-17T19:45|Bosna-Hersek|Romanya|12|0.847|1.180
UNL|11-17T19:45|Bosna-Hersek|Romanya|EG2|0.713|1.402
UNL|11-17T19:45|Bosna-Hersek|Romanya|Ü2.5|0.630|1.588
UNL|11-17T19:45|Polonya|İsveç|1X|0.673|1.487

CL|11-24T17:45|Bodø/Glimt|LASK|1X|0.816|1.225
CL|11-24T17:45|Bodø/Glimt|LASK|12|0.814|1.229
CL|11-24T17:45|Bodø/Glimt|LASK|EG2|0.611|1.636
CL|11-24T17:45|Galatasaray|Aston Villa|X2|0.636|1.572
CL|11-24T20:00|Arsenal|Dortmund|1X|0.868|1.152
CL|11-24T20:00|Arsenal|Dortmund|12|0.812|1.232
CL|11-24T20:00|Arsenal|Dortmund|EG2|0.659|1.518
CL|11-24T20:00|Como|AEK Atina|12|0.841|1.189
CL|11-24T20:00|Como|AEK Atina|EG2|0.690|1.450
CL|11-24T20:00|Como|AEK Atina|Ü2.5|0.621|1.611
CL|11-24T20:00|Feyenoord|Porto|DG1|0.773|1.294
CL|11-24T20:00|Feyenoord|Porto|X2|0.670|1.493
CL|11-24T20:00|Man City|Napoli|12|0.866|1.155
CL|11-24T20:00|Man City|Napoli|EG2|0.722|1.385
CL|11-24T20:00|Man City|Napoli|Ü2.5|0.633|1.580
CL|11-24T20:00|Leipzig|Lens|1X|0.850|1.176
CL|11-24T20:00|Leipzig|Lens|12|0.829|1.206
CL|11-24T20:00|Leipzig|Lens|EG2|0.650|1.538
CL|11-24T20:00|Real Madrid|PSV|1|0.803|1.245
CL|11-24T20:00|Real Madrid|PSV|EG2|0.738|1.356
CL|11-24T20:00|Real Madrid|PSV|Ü2.5|0.639|1.565
CL|11-24T20:00|Slovan Bratislava|Betis|12|0.852|1.174
CL|11-24T20:00|Slovan Bratislava|Betis|2|0.749|1.335
CL|11-24T20:00|Slovan Bratislava|Betis|Ü2.5|0.626|1.597
CL|11-25T17:45|Sabah|Barcelona|Ü1.5|0.854|1.171
CL|11-25T17:45|Sabah|Barcelona|Ü2.5|0.662|1.512
BL|11-20T19:30|Bayern|Köln|EG2|0.807|1.239
L1|11-20T19:45|Troyes|Le Havre|1X|0.726|1.377
EL|11-26T17:45|Beşiktaş|Hapoel Beer-Sheva|1X|0.845|1.183
EL|11-26T17:45|Beşiktaş|Hapoel Beer-Sheva|12|0.819|1.221
EL|11-26T17:45|Beşiktaş|Hapoel Beer-Sheva|EG2|0.641|1.560
EL|11-26T17:45|Salzburg|Ararat-Armenia|EG1|0.833|1.200
EL|11-26T17:45|Salzburg|Ararat-Armenia|12|0.785|1.274
EL|11-26T17:45|Salzburg|Ararat-Armenia|1X|0.751|1.331
EL|11-26T17:45|Viktoria Plzeň|Benfica|DG1|0.847|1.181
EL|11-26T17:45|Viktoria Plzeň|Benfica|12|0.782|1.279
EL|11-26T17:45|Viktoria Plzeň|Benfica|X2|0.778|1.285
EL|11-26T17:45|Dinamo Zagreb|Leverkusen|DG1|0.770|1.298
EL|11-26T17:45|Dinamo Zagreb|Leverkusen|X2|0.679|1.473
EL|11-26T17:45|Olympiacos|Milan|EG1|0.847|1.181
EL|11-26T17:45|Olympiacos|Milan|1X|0.796|1.257
EL|11-26T17:45|Olympiacos|Milan|EG2|0.560|1.787
EL|11-26T17:45|Marseille|Levski Sofia|DG1|0.758|1.319
EL|11-26T17:45|Marseille|Levski Sofia|X2|0.669|1.496
EL|11-26T17:45|Union SG|Lech Poznań|12|0.862|1.160
EL|11-26T17:45|Union SG|Lech Poznań|EG2|0.726|1.378
EL|11-26T17:45|Union SG|Lech Poznań|Ü2.5|0.634|1.576
EL|11-26T17:45|Celta|Bournemouth|DG1|0.821|1.217
EL|11-26T17:45|Celta|Bournemouth|X2|0.742|1.347
EL|11-26T20:00|Sparta Praha|AZ Alkmaar|1X|0.641|1.560
EL|11-26T20:00|C. Palace|Real Sociedad|1X|0.652|1.533
EL|11-26T17:45|Ferencváros|Celje|1X|0.860|1.162
EL|11-26T17:45|Ferencváros|Celje|12|0.829|1.206
EL|11-26T17:45|Ferencváros|Celje|EG2|0.660|1.515
EL|11-26T20:00|Juventus|Omonia|EG1|0.869|1.151
EL|11-26T20:00|Juventus|Omonia|1X|0.811|1.234
EL|11-26T20:00|Juventus|Omonia|12|0.805|1.242
EL|11-26T20:00|NEC Nijmegen|Rennes|1X|0.659|1.517
EL|11-26T20:00|OFI Crete|Anderlecht|1X|0.666|1.502
EL|11-26T20:00|Lyon|Lillestrøm|EG1|0.862|1.161
EL|11-26T20:00|Lyon|Lillestrøm|1X|0.803|1.245
EL|11-26T20:00|Lyon|Lillestrøm|12|0.790|1.265
EL|11-26T20:00|Torreense|Celtic|EG1|0.829|1.206
EL|11-26T20:00|Torreense|Celtic|12|0.799|1.251
EL|11-26T20:00|Torreense|Celtic|1X|0.737|1.358
EL|11-26T20:00|Sunderland|Jagiellonia|EG1|0.820|1.220
EL|11-26T20:00|Sunderland|Jagiellonia|1X|0.745|1.341
EL|11-26T20:00|Hoffenheim|Sturm Graz|EG1|0.824|1.214
EL|11-26T20:00|Hoffenheim|Sturm Graz|1X|0.748|1.338
ECL|11-26T15:30|Kairat Almaty|Mjällby|DG1|0.805|1.243
ECL|11-26T15:30|Kairat Almaty|Mjällby|X2|0.721|1.386
ECL|11-26T17:45|Ajax|Thun|EG1|0.852|1.173
ECL|11-26T17:45|Ajax|Thun|1X|0.791|1.264
ECL|11-26T17:45|Ajax|Thun|EG2|0.570|1.754
ECL|11-26T17:45|Brighton|Craiova|1X|0.730|1.370
ECL|11-26T17:45|Iberia Tbilisi|Getafe|1X|0.709|1.411
ECL|11-26T17:45|Jablonec|Lugano|DG1|0.793|1.261
ECL|11-26T17:45|Jablonec|Lugano|X2|0.691|1.447
ECL|11-26T17:45|Kauno Žalgiris|Riga|DG1|0.818|1.222
ECL|11-26T17:45|Kauno Žalgiris|Riga|X2|0.739|1.353
ECL|11-26T17:45|Hearts|Monaco|DG1|0.828|1.208
ECL|11-26T17:45|Hearts|Monaco|X2|0.757|1.321
ECL|11-26T17:45|Egnatia|Lincoln Red Imps|1X|0.713|1.403
ECL|11-26T17:45|Pafos|Midtjylland|EG1|0.817|1.224
ECL|11-26T17:45|Pafos|Midtjylland|1X|0.731|1.367
ECL|11-26T17:45|Brann|Aarhus|EG1|0.841|1.189
ECL|11-26T17:45|Brann|Aarhus|1X|0.784|1.275
ECL|11-26T20:00|Nordsjælland|Panathinaikos|DG1|0.799|1.251
ECL|11-26T20:00|Nordsjælland|Panathinaikos|X2|0.704|1.420
ECL|11-26T20:00|Borac|Atalanta|1X|0.679|1.474
ECL|11-26T20:00|Hajduk Split|Sint-Truidense|1X|0.668|1.498
ECL|11-26T20:00|Inter Escaldes|Copenhagen|DG1|0.815|1.227
ECL|11-26T20:00|Inter Escaldes|Copenhagen|X2|0.730|1.370
ECL|11-26T20:00|Gent|Crvena Zvezda|1X|0.677|1.478
ECL|11-26T20:00|CSKA Sofia|Trabzonspor|DG1|0.761|1.314
ECL|11-26T20:00|CSKA Sofia|Trabzonspor|X2|0.652|1.534
ECL|11-26T20:00|Braga|KuPS Kuopio|EG1|0.821|1.219
ECL|11-26T20:00|Braga|KuPS Kuopio|1X|0.752|1.330
ECL|11-26T20:00|Freiburg|Twente|DG1|0.789|1.267
ECL|11-26T20:00|Freiburg|Twente|X2|0.691|1.447
SL|11-06T17:00|Gaziantep|Kasımpaşa|DG1|0.834|1.200
BL|11-06T19:30|Hamburg|M’gladbach|1X|0.662|1.510
ERE|11-06T19:00|Willem II|PEC Zwolle|DG1|0.807|1.238
ERE|11-06T19:00|Willem II|PEC Zwolle|X2|0.720|1.389
SA|11-06T19:45|Venezia|Udinese|EG1|0.779|1.284
L1|11-06T19:45|Toulouse|Strasbourg|1X|0.700|1.429
BEL|11-06T19:45|Standard|Beveren|EG1|0.830|1.204
BEL|11-06T19:45|Standard|Beveren|1X|0.754|1.326
PL|11-06T20:00|Everton|Coventry|EG1|0.850|1.176
PL|11-06T20:00|Everton|Coventry|1X|0.797|1.255
PL|11-06T20:00|Everton|Coventry|EG2|0.566|1.767
PL|11-07T12:30|Leeds|Tottenham|1X|0.645|1.550
PL|11-07T15:00|Arsenal|Hull|EG2|0.743|1.346
PL|11-07T15:00|Arsenal|Hull|Ü2.5|0.625|1.600
PL|11-07T17:30|N. Forest|Man City|DG1|0.841|1.188
PL|11-07T17:30|N. Forest|Man City|X2|0.783|1.277
LL|11-06T20:00|Sevilla|Alaves|1X|0.758|1.319
LL|11-07T13:00|Malaga|Racing Santander|1X|0.667|1.500
LL|11-07T15:15|Espanyol|Deportivo|1X|0.691|1.448
LL|11-07T17:30|Osasuna|Athletic|DG1|0.801|1.249
LL|11-07T17:30|Osasuna|Athletic|X2|0.738|1.356
LL|11-07T20:00|Valencia|Real Madrid|12|0.839|1.191
LL|11-07T20:00|Valencia|Real Madrid|Ü1.5|0.812|1.232
LL|11-07T20:00|Valencia|Real Madrid|Ü2.5|0.593|1.686
SA|11-07T14:00|Cagliari|Frosinone|DG1|0.753|1.327
SA|11-07T14:00|Cagliari|Frosinone|X2|0.659|1.517
SA|11-07T14:00|Torino|Lecce|EG1|0.846|1.182
SA|11-07T14:00|Torino|Lecce|1X|0.800|1.249
SA|11-07T14:00|Torino|Lecce|EG2|0.558|1.791
SA|11-07T17:00|Parma|Bologna|DG1|0.833|1.201
SA|11-07T17:00|Parma|Bologna|X2|0.782|1.279
SA|11-07T19:45|Roma|Sassuolo|12|0.856|1.169
SA|11-07T19:45|Roma|Sassuolo|1|0.756|1.323
SA|11-07T19:45|Roma|Sassuolo|EG2|0.704|1.421
BL|11-07T14:30|Dortmund|Elversberg|12|0.838|1.194
BL|11-07T14:30|Dortmund|Elversberg|1|0.709|1.411
BL|11-07T14:30|Dortmund|Elversberg|EG2|0.660|1.515
BL|11-07T14:30|Leipzig|Augsburg|1X|0.843|1.186
BL|11-07T14:30|Leipzig|Augsburg|12|0.830|1.205
BL|11-07T14:30|Leipzig|Augsburg|EG2|0.637|1.571
BL|11-07T14:30|Mainz|Bayern|X2|0.851|1.175
BL|11-07T14:30|Mainz|Bayern|12|0.841|1.190
BL|11-07T14:30|Mainz|Bayern|2|0.691|1.446
BL|11-07T14:30|Paderborn|Frankfurt|DG1|0.788|1.269
BL|11-07T14:30|Paderborn|Frankfurt|X2|0.700|1.428
BL|11-07T17:30|Stuttgart|Werder Bremen|EG1|0.860|1.163
BL|11-07T17:30|Stuttgart|Werder Bremen|1X|0.812|1.232
BL|11-07T17:30|Stuttgart|Werder Bremen|12|0.802|1.246
L1|11-07T18:00|Auxerre|Paris FC|DG1|0.836|1.197
L1|11-07T20:05|PSG|Troyes|1|0.858|1.166
L1|11-07T20:05|PSG|Troyes|EG2|0.756|1.323
ERE|11-07T15:30|Fortuna Sittard|Telstar|1X|0.669|1.495
ERE|11-07T17:45|ADO Den Haag|Sparta Rotterdam|DG1|0.755|1.324
ERE|11-07T17:45|ADO Den Haag|Sparta Rotterdam|X2|0.639|1.565
ERE|11-07T20:00|Excelsior|Go Ahead Eagles|12|0.783|1.278
ERE|11-07T20:00|Excelsior|Go Ahead Eagles|DG1|0.767|1.304
ERE|11-07T20:00|Excelsior|Go Ahead Eagles|X2|0.649|1.541
POR|11-06T20:45|Famalicão|Arouca|DG1|0.734|1.363
POR|11-06T20:45|Famalicão|Arouca|1X|0.649|1.540
POR|11-07T15:30|Nacional|Académico Viseu|DG1|0.830|1.205
POR|11-07T15:30|Nacional|Académico Viseu|Ü1.5|0.788|1.269
POR|11-07T15:30|Nacional|Académico Viseu|X2|0.760|1.315
POR|11-07T18:00|Alverca|Casa Pia|EG1|0.812|1.231
POR|11-07T18:00|Alverca|Casa Pia|1X|0.745|1.342
POR|11-07T18:00|Alverca|Casa Pia|KG Var|0.565|1.768
POR|11-07T20:30|Sporting|Moreirense|1X|0.854|1.171
POR|11-07T20:30|Sporting|Moreirense|Ü1.5|0.821|1.219
POR|11-07T20:30|Sporting|Moreirense|EG2|0.655|1.528
SCO|11-07T15:00|St Johnstone|Dundee|DG1|0.740|1.352
SCO|11-07T15:00|St Johnstone|Dundee|X2|0.633|1.579
SCO|11-07T15:00|Dundee Utd|Motherwell|DG1|0.714|1.401
SCO|11-07T15:00|Dundee Utd|Motherwell|1X|0.690|1.449
SCO|11-07T15:00|Dundee Utd|Motherwell|KG Var|0.561|1.782
SCO|11-07T17:45|Aberdeen|Hibernian|DG1|0.728|1.373
SCO|11-07T17:45|Aberdeen|Hibernian|1X|0.669|1.494
SCO|11-07T20:00|St Mirren|Rangers|DG1|0.848|1.179
SCO|11-07T20:00|St Mirren|Rangers|X2|0.789|1.267
SCO|11-07T20:00|St Mirren|Rangers|KG Var|0.562|1.778
SL|11-07T10:30|Eyüpspor|Kocaelispor|DG1|0.858|1.166
SL|11-07T13:00|Samsunspor|Konyaspor|DG1|0.800|1.249
SL|11-07T16:00|Galatasaray|Amedspor|12|0.782|1.279
SL|11-07T16:00|Göztepe|Başakşehir|EG1|0.832|1.202
SL|11-07T16:00|Göztepe|Başakşehir|12|0.786|1.272
BEL|11-07T15:00|Westerlo|Charleroi|12|0.786|1.273
BEL|11-07T15:00|Westerlo|Charleroi|DG1|0.748|1.337
BEL|11-07T15:00|Westerlo|Charleroi|X2|0.620|1.614
BEL|11-07T17:15|OH Leuven|Mechelen|1X|0.694|1.442
BEL|11-07T19:45|Antwerp|Lommel SK|1X|0.642|1.558
BEL|11-07T19:45|La Louvière|Cercle Brugge|1X|0.647|1.546
SL|11-08T10:30|Rizespor|Erzurumspor|DG1|0.772|1.295
SL|11-08T10:30|Rizespor|Erzurumspor|Ü1.5|0.762|1.312
SL|11-08T10:30|Rizespor|Erzurumspor|EG1|0.722|1.385
ERE|11-08T11:15|Heerenveen|Feyenoord|DG1|0.841|1.190
ERE|11-08T11:15|Heerenveen|Feyenoord|Ü1.5|0.793|1.261
ERE|11-08T11:15|Heerenveen|Feyenoord|EG1|0.671|1.490
SA|11-08T11:30|Napoli|Lazio|EG1|0.779|1.283
SA|11-08T11:30|Napoli|Lazio|DG1|0.718|1.393
BEL|11-08T12:30|Club Brugge|Anderlecht|Ü1.5|0.814|1.228
BEL|11-08T12:30|Club Brugge|Anderlecht|EG2|0.629|1.591
BEL|11-08T12:30|Club Brugge|Anderlecht|DG1|0.617|1.621
LL|11-08T13:00|Elche|Betis|DG1|0.793|1.262
LL|11-08T13:00|Elche|Betis|Ü1.5|0.771|1.298
LL|11-08T13:00|Elche|Betis|EG1|0.710|1.409
SL|11-08T13:00|Çorum|Fenerbahçe|DG1|0.756|1.323
SL|11-08T13:00|Çorum|Fenerbahçe|Ü1.5|0.755|1.324
SL|11-08T13:00|Çorum|Fenerbahçe|EG1|0.730|1.369
ERE|11-08T13:30|Twente|Ajax|Ü1.5|0.750|1.333
ERE|11-08T13:30|Twente|Ajax|DG1|0.744|1.344
ERE|11-08T13:30|Twente|Ajax|EG1|0.736|1.359
PL|11-08T14:00|Brighton|Brentford|EG1|0.820|1.219
PL|11-08T14:00|Brighton|Brentford|Ü1.5|0.783|1.276
PL|11-08T14:00|Brighton|Brentford|DG1|0.690|1.450
PL|11-08T14:00|C. Palace|Liverpool|Ü1.5|0.807|1.240
PL|11-08T14:00|C. Palace|Liverpool|EG1|0.639|1.564
PL|11-08T14:00|Ipswich|Bournemouth|DG1|0.819|1.221
PL|11-08T14:00|Ipswich|Bournemouth|Ü1.5|0.783|1.278
PL|11-08T14:00|Ipswich|Bournemouth|EG1|0.691|1.447
PL|11-08T14:00|Sunderland|Chelsea|DG1|0.816|1.226
PL|11-08T14:00|Sunderland|Chelsea|Ü1.5|0.781|1.280
PL|11-08T14:00|Sunderland|Chelsea|EG1|0.693|1.442
SA|11-08T14:00|Genoa|Milan|DG1|0.843|1.186
SA|11-08T14:00|Genoa|Milan|EG1|0.668|1.496
SA|11-08T14:00|Monza|Atalanta|DG1|0.803|1.245
SA|11-08T14:00|Monza|Atalanta|EG1|0.703|1.423
L1|11-08T14:00|Rennes|Lille|EG1|0.789|1.268
L1|11-08T14:00|Rennes|Lille|Ü1.5|0.769|1.300
L1|11-08T14:00|Rennes|Lille|DG1|0.712|1.404
BL|11-08T14:30|Köln|Leverkusen|DG1|0.838|1.193
BL|11-08T14:30|Köln|Leverkusen|EG1|0.674|1.484
SCO|11-08T15:00|Hearts|Falkirk|EG1|0.845|1.183
SCO|11-08T15:00|Hearts|Falkirk|Ü1.5|0.795|1.257
SCO|11-08T15:00|Hearts|Falkirk|DG1|0.666|1.501
BEL|11-08T15:00|Gent|Kortrijk|Ü1.5|0.838|1.194
BEL|11-08T15:00|Gent|Kortrijk|EG2|0.726|1.377
BEL|11-08T15:00|Gent|Kortrijk|Ü2.5|0.634|1.576
LL|11-08T15:15|Real Sociedad|Rayo|Ü1.5|0.800|1.250
LL|11-08T15:15|Real Sociedad|Rayo|DG1|0.656|1.524
POR|11-08T15:30|Santa Clara|Gil Vicente|EG1|0.800|1.250
POR|11-08T15:30|Santa Clara|Gil Vicente|Ü1.5|0.774|1.292
POR|11-08T15:30|Santa Clara|Gil Vicente|DG1|0.705|1.419
POR|11-08T15:30|Estoril|Marítimo|EG1|0.804|1.245
POR|11-08T15:30|Estoril|Marítimo|Ü1.5|0.776|1.289
POR|11-08T15:30|Estoril|Marítimo|DG1|0.703|1.423
SL|11-08T15:30|Alanyaspor|Trabzonspor|DG1|0.845|1.183
SL|11-08T15:30|Alanyaspor|Trabzonspor|Ü1.5|0.795|1.257
SL|11-08T15:30|Alanyaspor|Trabzonspor|EG1|0.666|1.501
ERE|11-08T15:45|AZ Alkmaar|Groningen|EG1|0.825|1.212
ERE|11-08T15:45|AZ Alkmaar|Groningen|Ü1.5|0.786|1.273
ERE|11-08T15:45|AZ Alkmaar|Groningen|DG1|0.686|1.458
ERE|11-08T15:45|Cambuur|PSV|Ü1.5|0.808|1.237
ERE|11-08T15:45|Cambuur|PSV|EG1|0.635|1.575
SCO|11-08T16:00|Celtic|Kilmarnock|Ü1.5|0.840|1.191
SCO|11-08T16:00|Celtic|Kilmarnock|EG2|0.735|1.360
SCO|11-08T16:00|Celtic|Kilmarnock|Ü2.5|0.638|1.568
L1|11-08T16:15|Angers|Nice|DG1|0.804|1.244
L1|11-08T16:15|Angers|Nice|Ü1.5|0.776|1.289
L1|11-08T16:15|Angers|Nice|EG1|0.702|1.424
L1|11-08T16:15|Brest|Lyon|DG1|0.757|1.321
L1|11-08T16:15|Brest|Lyon|Ü1.5|0.756|1.323
L1|11-08T16:15|Brest|Lyon|EG1|0.730|1.370
L1|11-08T16:15|Le Havre|Lorient|Ü1.5|0.754|1.327
L1|11-08T16:15|Le Havre|Lorient|DG1|0.753|1.329
L1|11-08T16:15|Le Havre|Lorient|EG1|0.732|1.366
L1|11-08T16:15|Le Mans|Monaco|DG1|0.845|1.184
L1|11-08T16:15|Le Mans|Monaco|Ü1.5|0.795|1.258
L1|11-08T16:15|Le Mans|Monaco|EG1|0.667|1.499
PL|11-08T16:30|Man United|Aston Villa|EG1|0.786|1.272
PL|11-08T16:30|Man United|Aston Villa|Ü1.5|0.768|1.302
PL|11-08T16:30|Man United|Aston Villa|DG1|0.714|1.400
BL|11-08T16:30|Freiburg|Union Berlin|EG2|0.632|1.584
BL|11-08T16:30|Freiburg|Union Berlin|DG1|0.615|1.627
SA|11-08T17:00|Inter|Como|EG1|0.825|1.212
SA|11-08T17:00|Inter|Como|DG1|0.686|1.459
LL|11-08T17:30|Celta|Levante|EG1|0.838|1.193
LL|11-08T17:30|Celta|Levante|Ü1.5|0.792|1.263
LL|11-08T17:30|Celta|Levante|DG1|0.673|1.485
LL|11-08T17:30|Villarreal|Getafe|Ü1.5|0.820|1.219
LL|11-08T17:30|Villarreal|Getafe|EG2|0.652|1.533
LL|11-08T17:30|Villarreal|Getafe|Ü2.5|0.606|1.649
BEL|11-08T17:30|Union SG|Genk|Ü1.5|0.819|1.221
BEL|11-08T17:30|Union SG|Genk|EG2|0.649|1.541
BEL|11-08T17:30|Union SG|Genk|Ü2.5|0.605|1.653
POR|11-08T18:00|Guimarães|Porto|Ü1.5|0.804|1.244
POR|11-08T18:00|Guimarães|Porto|EG1|0.646|1.547
SL|11-08T18:00|Beşiktaş|Gençlerbirliği|Ü1.5|0.834|1.200
SL|11-08T18:00|Beşiktaş|Gençlerbirliği|EG2|0.708|1.412
SL|11-08T18:00|Beşiktaş|Gençlerbirliği|Ü2.5|0.628|1.593
BEL|11-08T18:15|STVV|Zulte Waregem|EG1|0.820|1.220
BEL|11-08T18:15|STVV|Zulte Waregem|Ü1.5|0.783|1.277
BEL|11-08T18:15|STVV|Zulte Waregem|DG1|0.690|1.448
BL|11-08T18:30|Hoffenheim|Schalke|DG1|0.646|1.548
ERE|11-08T19:00|Utrecht|NEC Nijmegen|Ü1.5|0.749|1.334
ERE|11-08T19:00|Utrecht|NEC Nijmegen|DG1|0.742|1.348
ERE|11-08T19:00|Utrecht|NEC Nijmegen|EG1|0.737|1.357
SA|11-08T19:45|Fiorentina|Juventus|DG1|0.803|1.246
SA|11-08T19:45|Fiorentina|Juventus|EG1|0.703|1.422
L1|11-08T19:45|Lens|Marseille|EG1|0.783|1.278
L1|11-08T19:45|Lens|Marseille|Ü1.5|0.766|1.305
L1|11-08T19:45|Lens|Marseille|DG1|0.716|1.397
LL|11-08T20:00|Atletico Madrid|Barcelona|DG1|0.826|1.211
LL|11-08T20:00|Atletico Madrid|Barcelona|Ü1.5|0.786|1.272
LL|11-08T20:00|Atletico Madrid|Barcelona|EG1|0.685|1.459
POR|11-08T20:30|Rio Ave|Braga|DG1|0.845|1.184
POR|11-08T20:30|Rio Ave|Braga|Ü1.5|0.795|1.258
POR|11-08T20:30|Rio Ave|Braga|EG1|0.667|1.500
POR|11-08T20:30|Estrela Amadora|Benfica|Ü1.5|0.828|1.207
POR|11-08T20:30|Estrela Amadora|Benfica|Ü2.5|0.619|1.615`.split("\n").map(l=>{const[c,t,h,a,k,p,o]=l.split("|");return{c,t:`2026-${t}:00Z`,h,a,k,p:+p,o:+o,mk:[c,h,a].join("|")}}),RES={'EL|Celtic|Beşiktaş':'3-2','EL|NEC Nijmegen|Omonia':'3-1','EL|AZ Alkmaar|Juventus':'1-2','EL|Benfica|Lech Poznań':'3-1','EL|Celta|Union SG':'1-2','EL|Hapoel Beer-Sheva|OFI Crete':'0-2','EL|Leverkusen|Marseille':'0-1','EL|Sturm Graz|Celje':'2-3','EL|Sunderland|Dinamo Zagreb':'0-2','EL|Torreense|Ararat-Armenia':'3-2','ECL|Trabzonspor|Freiburg':'0-1','ECL|Aarhus|Braga':'0-0','ECL|Atalanta|Kairat Almaty':'1-1','ECL|Crvena Zvezda|Inter Escaldes':'2-1','ECL|KuPS Kuopio|Gent':'0-0','ECL|Lincoln Red Imps|Hajduk Split':'1-0','ECL|Midtjylland|Ajax':'1-6','ECL|Mjällby|Borac':'2-0','ECL|Thun|Hearts':'3-1','ECL|Copenhagen|Iberia Tbilisi':'2-1','ECL|Lugano|Kauno Žalgiris':'3-0','ECL|Monaco|Nordsjælland':'2-0','ECL|Panathinaikos|CSKA Sofia':'2-1','ECL|Riga|Jablonec':'1-1','ECL|Sint-Truidense|Brann':'1-1','ECL|Twente|Pafos':'3-1','ECL|Craiova|Egnatia':'2-0','EL|Sparta Praha|Bournemouth':'1-3','EL|Real Sociedad|Lyon':'1-1','EL|Lillestrøm|Viktoria Plzeň':'0-1','EL|C. Palace|Hoffenheim':'1-1','EL|Levski Sofia|Jagiellonia':'1-0','EL|Milan|Ferencváros':'0-2','EL|Anderlecht|Salzburg':'2-0','ECL|Getafe|Brighton':'0-1','EL|Rennes|Olympiacos':'0-0','BEL|Kortrijk|Mechelen':'1-3','CL|Dortmund|Betis':'2-1','CL|Porto|Napoli':'4-1','CL|PSV|Club Brugge':'1-2','CL|Leipzig|Man City':'2-3','CL|Lens|Como':'1-9','CL|Slavia Prague|Arsenal':'1-2','CL|Viking|Sabah':'4-1','CL|AEK Atina|Real Madrid':'2-3','CL|Fenerbahçe|Liverpool':'3-2','CL|Atletico Madrid|Bayern':'0-2','CL|Barcelona|Aston Villa':'3-0','CL|Feyenoord|Inter':'0-3','CL|Bodø/Glimt|Lille':'0-0','CL|LASK|Slovan Bratislava':'4-0','CL|Man United|Roma':'3-2','CL|Villarreal|PSG':'0-6','CL|Shakhtar|Sporting':'0-1','CL|Galatasaray|Stuttgart':'2-0','SA|Lecce|Genoa':'1-2','SA|Juventus|Napoli':'2-0','SA|Sassuolo|Fiorentina':'2-4','SA|Atalanta|Parma':'0-3','LL|Elche|Valencia':'0-1','LL|Athletic|Real Sociedad':'2-1','LL|Deportivo|Osasuna':'2-1','L1|Marseille|Toulouse':'2-0','L1|Lorient|Brest':'0-2','PL|Newcastle|Everton':'0-1','SL|Gençlerbirliği|Alanyaspor':'5-0','BEL|Lommel SK|Gent':'2-0','BEL|Charleroi|La Louvière':'5-2','SA|Frosinone|Lecce':'5-1','SA|Fiorentina|Atalanta':'2-2','KSA|Al Khaleej|Al Hazem':'4-2','KSA|Al Riyadh|Al Qadsiah':'0-6','KSA|Al Nassr|Al Kholood':'5-3','SA|Como|Venezia':'1-0','SA|Frosinone|Torino':'2-0','SA|Lazio|Cagliari':'2-1','LL|Racing Santander|Real Madrid':'0-3','LL|Getafe|Sevilla':'3-1','PL|Liverpool|Arsenal':'0-1','BL|Union Berlin|Köln':'1-1','BL|Frankfurt|Hamburg':'3-1','L1|Strasbourg|Auxerre':'5-1','L1|Lyon|Angers':'2-0','L1|Paris FC|Monaco':'3-1','SL|Amedspor|Eyüpspor':'5-1','SL|Trabzonspor|Gaziantep':'2-0','SL|Başakşehir|Samsunspor':'5-2','SL|Kasımpaşa|Beşiktaş':'2-2','BEL|Cercle Brugge|Antwerp':'2-1','BEL|STVV|OH Leuven':'1-2','PL|Chelsea|Man United':'2-0','PL|Bournemouth|Leeds':'2-0','PL|Brentford|N. Forest':'2-0','PL|Coventry|Sunderland':'3-1','PL|Hull|Ipswich':'2-2','PL|Man City|Brighton':'0-1','PL|Tottenham|C. Palace':'2-0','PL|Aston Villa|Fulham':'1-1','LL|Levante|Atletico Madrid':'0-2','LL|Rayo|Celta':'3-0','LL|Betis|Malaga':'2-1','LL|Barcelona|Alaves':'6-1','SA|Bologna|Monza':'2-1','SA|Udinese|Roma':'2-5','SA|Milan|Inter':'3-1','BL|Leverkusen|Stuttgart':'2-4','BL|Augsburg|Freiburg':'1-2','BL|M’gladbach|Paderborn':'0-0','BL|Werder Bremen|Hoffenheim':'2-0','BL|Schalke|Leipzig':'0-2','BL|Bayern|Dortmund':'2-2','L1|Troyes|Le Mans':'2-0','SL|Erzurumspor|Çorum':'1-3','SL|Kocaelispor|Rizespor':'0-0','SL|Fenerbahçe|Göztepe':'1-2','KSA|Al Taawoun|Al Ettifaq':'1-1','KSA|Al Fayha|Al Faisaly':'4-1','KSA|Al Hilal|Al Fateh':'2-0','BEL|Mechelen|Genk':'1-0','BEL|Standard|Kortrijk':'1-1','BEL|Beveren|Union SG':'1-2','BEL|Anderlecht|Westerlo':'4-1','L1|Lille|Lens':'1-0','SL|Konyaspor|Galatasaray':'0-4','KSA|Abha|Al Ittihad':'1-1','KSA|Diriyah|Neom':'1-2','KSA|Al Shabab|Al Ahli':'6-1','LL|Villarreal|Espanyol':'0-1','BL|Elversberg|Mainz':'4-1','L1|Le Havre|PSG':'1-5','L1|Nice|Rennes':'5-2','BEL|Zulte Waregem|Club Brugge':'2-4','SA|Roma|Cagliari':'4-2','SA|Torino|Como':'1-3','SA|Milan|Bologna':'2-4','SA|Parma|Udinese':'0-0','SA|Venezia|Inter':'0-2','SA|Genoa|Juventus':'2-0','SA|Monza|Napoli':'1-4'};let LGC="";const fixAt=a=>{try{const M=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],m=/^(\d+) (\S+) (\d{4}), (\d{2}):(\d{2})/.exec(a);if(!m)return a;const mi=M.indexOf(m[2]);if(mi<0)return a;const tp=ms=>{const q=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms)),g=t=>+q.find(x=>x.type==t).value;return Date.UTC(g('year'),g('month')-1,g('day'),g('hour'),g('minute'))-ms};const u0=Date.UTC(+m[3],mi,+m[1],+m[4],+m[5]);let u=u0-tp(u0);u=u0-tp(u);if(u>Date.now())u=Date.now();const z=Intl.DateTimeFormat().resolvedOptions().timeZone||'',c=z.indexOf('/')>0?z.split('/').pop().replace(/_/g,' '):'',q=new Intl.DateTimeFormat(LOCALE,{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(u)),g=t=>(q.find(x=>x.type==t)||{}).value||'';return g('day')+' '+g('month')+' '+g('year')+', '+g('hour')+':'+g('minute')+(c?' ('+c+')':'')}catch(e){return a}};
const hit=(k,x,y)=>{const v=({'1':x>y,X:x==y,'2':x<y,'1X':x>=y,X2:x<=y,'12':x!=y,'Ü1.5':x+y>1,'Ü2.5':x+y>2,'KG Var':x>0&&y>0,EG1:x>0,DG1:y>0,EG2:x>1})[k];return v===undefined?khit(k,x,y):v};
const st=r=>{const v=RES[r.mk];if(v){if(v[0]=='L')return{s:Date.now()<new Date(r.t).getTime()+8e6?'live':'unk',sc:v.slice(1)};const[x,y]=v.split('-').map(Number);return{s:hit(r.k,x,y)?'hit':'miss',sc:v}}const t=new Date(r.t).getTime(),n=Date.now();return{s:n<t?'wait':n<t+6.6e6?'live':'unk'}};
let HL=new Set(),HD=new Set(),HO=new Set();
const tgl=(S,k)=>{S.has(k)?S.delete(k):S.add(k)};
function hist(){const all=LGR.map(r=>({r,...st(r),d:dk(new Date(r.t))})),H=x=>x.s=='hit'||x.s=='miss',fl=x=>!HL.size||HL.has(x.r.c),fd=x=>true,rows=all.filter(x=>fl(x)&&fd(x)),dn=rows.filter(H),ht=dn.filter(x=>x.s=='hit').length,cn=s=>rows.filter(x=>x.s==s).length;
const rt=a=>{const f=a.filter(H),h=f.filter(x=>x.s=='hit').length;return f.length?`${h}/${f.length} (%${Math.round(h/f.length*100)})`:'henüz yok'},GK=['Ü1.5','Ü2.5','KG Var','EG1','DG1','EG2'],ex=dn.length?dn.reduce((a,x)=>a+x.r.p,0)/dn.length:0;
const dl=d=>(x=>x.toLocaleDateString(LOCALE,{weekday:'short'})+' '+dd(x))(new Date(d+'T12:00')),lgs=Object.keys(LN).filter(c=>all.some(x=>x.r.c==c)),dts=[...new Set(all.map(x=>x.d))].sort();
const ch={hit:['Tuttu','var(--ok)'],miss:['Tutmadı','var(--hot)'],live:['Oynanıyor','var(--warn)'],wait:['Başlamadı','var(--mut)'],unk:['Sonuç bekleniyor','var(--mut)']};
const gc=g=>{const r=g[0].r,s=stt({c:r.c,h:r.h,a:r.a,t:new Date(r.t)}),f=g.filter(H),h=f.filter(x=>x.s=='hit').length;
return`<div class='box'><div class='cp'>${N[r.c]} · ${new Date(r.t).toLocaleString(LOCALE,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div><div class='tm'><span>${bd(r.h)} ${r.h}</span>${s.sc?`<span>${s.sc[0]} - ${s.sc[1]}</span>`:''}<span>${r.a} ${bd(r.a)}</span></div><div class='mut'>${f.length?`Bu maçta ${f.length} tahminden ${h} tanesi tuttu (%${Math.round(h/f.length*100)})`:ch[g[0].s][0]+(s.k=='live'&&s.sc?' · şu an '+s.sc.join('-'):'')+` · ${g.length} tahmin`}</div>${g.map(x=>`<div class='pk' style='flex-wrap:wrap'><span style='flex:1'>${lab(x.r.k,x.r)}<br><span class='mut'>${x.r.p>=.7?'Güvenli':'Orta'} · tahmini oran ${(EO(x.r)).toFixed(2)} · %${Math.round(x.r.p*100)}</span></span><span class='tg' style='background:${ch[x.s][1]}'>${ch[x.s][0]}</span></div>`).join('')}</div>`};
const lgb=(a,c,asc)=>{const b=a.filter(x=>x.r.c==c),ms={};b.forEach(x=>{(ms[x.r.mk]=ms[x.r.mk]||[]).push(x)});return Object.values(ms).sort((p,q)=>asc?new Date(p[0].r.t)-new Date(q[0].r.t):new Date(q[0].r.t)-new Date(p[0].r.t)).map(g=>gc(g.sort((u,v)=>v.r.p-u.r.p))).join('')};
const acc=(id,t,sub,body)=>`<details class='ac' data-ho='${id}' ${HO.has(id)?'open':''}><summary><span>${t}</span><span class='mut'>${sub}</span></summary><div class='in'>${body}</div></details>`;
const lgs2=(list,asc,pre)=>Object.keys(LN).filter(c=>list.some(x=>x.r.c==c)).map(c=>{const b=list.filter(x=>x.r.c==c);return acc(pre+c,N[c],`${new Set(b.map(x=>x.r.mk)).size} maç · ${rt(b)}`,lgb(list,c,asc))}).join('');
const fm=new Set(rows.filter(H).map(x=>x.r.mk)),fin=rows.filter(x=>fm.has(x.r.mk)),oth=rows.filter(x=>!fm.has(x.r.mk));
const lo=lgs,chL=lo.map(c=>`<button data-hl='${c}' class='${HL.has(c)?'on':''}'>${N[c]}</button>`).join('');
const lrt=c=>{const f=all.filter(x=>x.r.c==c&&H(x));return f.length?[f.filter(x=>x.s=='hit').length/f.length,f.length]:[-1,0]},bL=[...lo].sort((a,b)=>{const p=lrt(a),q=lrt(b);return q[0]-p[0]||q[1]-p[1]}).map(c=>`<div class='br'><span>${N[c]}</span><b>${rt(all.filter(x=>x.r.c==c))}</b></div>`).join('');
const tk=dk(new Date()),td=fin.filter(x=>x.d==tk),todayBox=acc('today','Bugünkü maç sonuçları',td.length?`${new Set(td.map(x=>x.r.mk)).size} maç · ${rt(td)}`:'yok',td.length?Object.keys(LN).filter(c=>td.some(x=>x.r.c==c)).map(c=>`<div class='mut' style='margin:6px 2px 4px'><b>${N[c]}</b> · ${rt(td.filter(x=>x.r.c==c))}</div>`+lgb(td,c,false)).join(''):"<div class='mut'>Bugün sonuçlanan maç yok.</div>");
const sel=HL.size?'seçili filtre':'tümü';
$('#app').innerHTML=segc()+`<h2 class='vt'>Tahmin geçmişi</h2><p class='mut'>Uygulamanın bir maç için önerdiği tüm seçenekler tek tek kaydedilir. Hiçbir şey seçmezsen hepsi görünür; lig seçerek tutma oranını daraltabilirsin.</p><div class='box'><h3>Filtre</h3><div class='mut'>Lig (birden fazla seçebilirsin)</div><div class='chips wrap'>${chL}</div>${HL.size?"<div class='chips'><button data-hc='1'>✕ Filtreyi temizle</button></div>":''}</div>
<div class='box'><h3>Tutma oranı (${sel})</h3>${dn.length?`<div class='big'>%${Math.round(ht/dn.length*100)}</div><div class='mut'>${dn.length} sonuçlanan tahminin ${ht} tanesi tuttu. Tahmin ihtimallerinin ortalaması %${Math.round(ex*100)} idi: gerçekleşen oran bundan belirgin düşükse model fazla iddialı demektir.${dn.length<30?' Örneklem küçük (30’dan az), sonuç şansa bağlı olabilir.':''}</div>`:`<div class='mut'>Seçili filtrede sonuçlanan tahmin yok.</div>`}<div class='sr'><span>Güvenli (ihtimal %70 ve üstü)</span><b>${rt(dn.filter(x=>x.r.p>=.7))}</b></div><div class='sr'><span>Orta (%55-69)</span><b>${rt(dn.filter(x=>x.r.p<.7))}</b></div><div class='sr'><span>Maç sonucu seçenekleri</span><b>${rt(dn.filter(x=>!GK.includes(x.r.k)))}</b></div><div class='sr'><span>Gol seçenekleri</span><b>${rt(dn.filter(x=>GK.includes(x.r.k)))}</b></div><div class='mut' style='margin-top:6px'>Bekleyen: ${cn('wait')+cn('unk')} · Oynanıyor: ${cn('live')} · Toplam: ${rows.length} tahmin, ${new Set(rows.map(x=>x.r.mk)).size} maç</div><div class='mut'>Son kontrol: ${LGC||'henüz yapılmadı'}. Sayfa canlı güncellenmez; durum yalnızca son kontrolde işlenen sonuçlara göre gösterilir. Kayıt 28 Ekim 2026’da başladı, öncesi kayıtlı değil.</div></div>
<div class='box'><h3>Liglere göre tutma oranı</h3><div class='mut'>Sıralama: en yüksek tutma oranı üstte.</div>${bL}</div>`+todayBox+(fin.length?`<h2 class='vt' style='font-size:20px'>Sonuçlanan maçlar</h2>`+lgs2(fin,false,'f'):'')+`<h2 class='vt' style='font-size:20px'>Bekleyen veya oynanan maçlar</h2>`+(oth.length?lgs2(oth,true,'o'):"<div class='mut'>Yok.</div>")}
const L1R=`Marseille|Strasbourg|4|0
Lens|Auxerre|5|2
Le Mans|Brest|2|2
Nice|Lorient|0|0
Toulouse|Lyon|0|2
Troyes|Paris FC|0|0
Angers|Lille|0|2
Le Havre|Monaco|0|1
Rennes|PSG|2|2
Lille|PSG|2|2
Strasbourg|Lens|2|1
Auxerre|Angers|1|3
Brest|Toulouse|2|2
Lorient|Troyes|1|2
Lyon|Le Havre|1|1
Paris FC|Nice|3|0
Rennes|Le Mans|3|2
Monaco|Marseille|2|0
Toulouse|Lille|0|1
Lyon|Auxerre|3|1
PSG|Monaco|1|2
Lens|Lorient|0|1
Le Havre|Brest|1|2
Nice|Le Mans|1|1
Troyes|Strasbourg|2|6
Angers|Rennes|1|2
Marseille|Paris FC|2|3
Rennes|Marseille|1|0
Strasbourg|Monaco|1|1
Auxerre|Nice|1|0
Le Havre|Angers|0|0
Lorient|Toulouse|2|2
Paris FC|Lyon|0|0
Lille|Troyes|2|0
Le Mans|Lens|2|2
Brest|PSG|0|1
Monaco|Lens|2|1
Paris FC|Strasbourg|2|1
Angers|Troyes|2|0
Le Mans|Lorient|2|1
Lyon|Rennes|4|0
Toulouse|Le Havre|3|2
Auxerre|Brest|2|1
Nice|Lille|2|1
Marseille|PSG|1|2
Lens|Lyon|2|1
Lille|Le Havre|1|0
Brest|Angers|5|1
Lorient|Paris FC|1|0
Monaco|Toulouse|2|2
PSG|Le Mans|3|1
Nice|Strasbourg|2|1
Rennes|Auxerre|4|1
Troyes|Marseille|0|2
Le Mans|Toulouse|0|3
Strasbourg|PSG|1|3
Lille|Brest|1|1
Troyes|Lens|1|3
Angers|Marseille|2|5
Le Havre|Auxerre|1|3
Lorient|Monaco|1|0
Paris FC|Rennes|4|3
Lyon|Nice|2|1
Brest|Nice|1|2
Lens|Paris FC|2|1
Monaco|Lille|1|1
Angers|Lorient|0|0
Auxerre|Le Mans|1|1
Marseille|Le Havre|4|3
Rennes|Strasbourg|3|0
Toulouse|Troyes|0|0
PSG|Lyon|2|0`,L1H=`Lyon|PSG~26.10.2026|PSG|Lyon|2|0
Lyon|PSG~19.04.2026|PSG|Lyon|1|2
Lyon|PSG~09.11.2025|Lyon|PSG|2|3
Lyon|PSG~23.02.2025|Lyon|PSG|2|3
Lyon|PSG~15.12.2024|PSG|Lyon|3|1
Lille|Monaco~25.10.2026|Monaco|Lille|1|1
Lille|Monaco~10.05.2026|Monaco|Lille|0|1
Lille|Monaco~24.08.2025|Lille|Monaco|1|0
Lille|Monaco~22.02.2025|Lille|Monaco|2|1
Lille|Monaco~18.10.2024|Monaco|Lille|0|0
Angers|Lorient~25.10.2026|Angers|Lorient|0|0
Angers|Lorient~15.02.2026|Lorient|Angers|2|0
Angers|Lorient~26.10.2025|Angers|Lorient|2|0
Angers|Lorient~05.02.2023|Lorient|Angers|0|0
Angers|Lorient~01.01.2023|Angers|Lorient|1|2
Auxerre|Le Mans~25.10.2026|Auxerre|Le Mans|1|1
Le Havre|Marseille~25.10.2026|Marseille|Le Havre|4|3
Le Havre|Marseille~10.05.2026|Le Havre|Marseille|0|1
Le Havre|Marseille~18.10.2025|Marseille|Le Havre|6|2
Le Havre|Marseille~10.05.2025|Le Havre|Marseille|1|3
Le Havre|Marseille~05.01.2025|Marseille|Le Havre|5|1
Rennes|Strasbourg~25.10.2026|Rennes|Strasbourg|3|0
Rennes|Strasbourg~19.04.2026|Strasbourg|Rennes|0|3
Rennes|Strasbourg~02.11.2025|Rennes|Strasbourg|4|1
Rennes|Strasbourg~02.02.2025|Rennes|Strasbourg|1|0
Rennes|Strasbourg~25.08.2024|Strasbourg|Rennes|3|1
Toulouse|Troyes~25.10.2026|Toulouse|Troyes|0|0
Toulouse|Troyes~01.02.2023|Toulouse|Troyes|4|1
Toulouse|Troyes~14.08.2022|Troyes|Toulouse|0|3
Lens|Paris FC~24.10.2026|Lens|Paris FC|2|1
Lens|Paris FC~14.02.2026|Paris FC|Lens|0|5
Lens|Paris FC~19.10.2025|Lens|Paris FC|2|1
Brest|Nice~23.10.2026|Brest|Nice|1|2
Brest|Nice~01.02.2026|Nice|Brest|2|2
Brest|Nice~20.09.2025|Brest|Nice|4|1
Brest|Nice~17.05.2025|Nice|Brest|6|0
Brest|Nice~02.11.2024|Brest|Nice|0|1
Angers|Marseille~18.10.2026|Angers|Marseille|2|5
Angers|Marseille~17.01.2026|Angers|Marseille|2|5
Angers|Marseille~29.10.2025|Marseille|Angers|2|2
Angers|Marseille~09.02.2025|Angers|Marseille|0|2
Angers|Marseille~04.10.2024|Marseille|Angers|1|1
Auxerre|Le Havre~18.10.2026|Le Havre|Auxerre|1|3
Auxerre|Le Havre~05.04.2026|Le Havre|Auxerre|1|1
Auxerre|Le Havre~26.10.2025|Auxerre|Le Havre|0|1
Auxerre|Le Havre~04.05.2025|Auxerre|Le Havre|1|2
Auxerre|Le Havre~01.09.2024|Le Havre|Auxerre|3|1
Lorient|Monaco~18.10.2026|Lorient|Monaco|1|0
Lorient|Monaco~16.01.2026|Monaco|Lorient|1|3
Lorient|Monaco~27.09.2025|Lorient|Monaco|3|1
Lorient|Monaco~17.03.2024|Monaco|Lorient|2|2
Lorient|Monaco~17.09.2023|Lorient|Monaco|2|2
Paris FC|Rennes~18.10.2026|Paris FC|Rennes|4|3
Paris FC|Rennes~10.05.2026|Rennes|Paris FC|2|1
Paris FC|Rennes~07.11.2025|Paris FC|Rennes|0|1
Lyon|Nice~18.10.2026|Lyon|Nice|2|1
Lyon|Nice~15.02.2026|Lyon|Nice|2|0
Lyon|Nice~18.10.2025|Nice|Lyon|3|2
Lyon|Nice~09.03.2025|Nice|Lyon|0|2
Lyon|Nice~01.12.2024|Lyon|Nice|4|1
PSG|Strasbourg~17.10.2026|Strasbourg|PSG|1|3
PSG|Strasbourg~01.02.2026|Strasbourg|PSG|1|2
PSG|Strasbourg~17.10.2025|PSG|Strasbourg|3|3
PSG|Strasbourg~03.05.2025|Strasbourg|PSG|2|1
PSG|Strasbourg~19.10.2024|PSG|Strasbourg|4|2
Brest|Lille~17.10.2026|Lille|Brest|1|1
Brest|Lille~14.02.2026|Lille|Brest|1|1
Brest|Lille~17.08.2025|Brest|Lille|3|3
Brest|Lille~10.05.2025|Brest|Lille|2|0
Brest|Lille~06.12.2024|Lille|Brest|3|1
Lens|Troyes~17.10.2026|Troyes|Lens|1|3
Lens|Troyes~28.01.2023|Troyes|Lens|1|1
Lens|Troyes~09.09.2022|Lens|Troyes|1|0
Lens|Troyes~14.05.2022|Troyes|Lens|1|3
Lens|Troyes~05.11.2021|Lens|Troyes|4|0
Le Mans|Toulouse~16.10.2026|Le Mans|Toulouse|0|3
Nice|Strasbourg~11.10.2026|Nice|Strasbourg|2|1
Nice|Strasbourg~04.04.2026|Strasbourg|Nice|3|1
Nice|Strasbourg~03.01.2026|Nice|Strasbourg|1|1
Nice|Strasbourg~12.04.2025|Strasbourg|Nice|2|2
Nice|Strasbourg~24.11.2024|Nice|Strasbourg|2|1
Auxerre|Rennes~11.10.2026|Rennes|Auxerre|4|1
Auxerre|Rennes~22.02.2026|Auxerre|Rennes|0|3
Auxerre|Rennes~19.10.2025|Rennes|Auxerre|2|2
Auxerre|Rennes~06.04.2025|Rennes|Auxerre|0|1
Auxerre|Rennes~03.11.2024|Auxerre|Rennes|4|0
Marseille|Troyes~11.10.2026|Troyes|Marseille|0|2
Marseille|Troyes~16.04.2023|Marseille|Troyes|3|1
Marseille|Troyes~11.01.2023|Troyes|Marseille|0|2
Marseille|Troyes~27.02.2022|Troyes|Marseille|1|1
Marseille|Troyes~28.11.2021|Marseille|Troyes|1|0
Le Havre|Lille~10.10.2026|Lille|Le Havre|1|0
Le Havre|Lille~03.05.2026|Lille|Le Havre|1|1
Le Havre|Lille~30.11.2025|Le Havre|Lille|0|1
Le Havre|Lille~08.02.2025|Lille|Le Havre|1|2
Le Havre|Lille~28.09.2024|Le Havre|Lille|0|3
Angers|Brest~10.10.2026|Brest|Angers|5|1
Angers|Brest~17.05.2026|Brest|Angers|1|1
Angers|Brest~28.09.2025|Angers|Brest|0|2
Angers|Brest~09.03.2025|Brest|Angers|2|0
Angers|Brest~05.01.2025|Angers|Brest|2|0
Lorient|Paris FC~10.10.2026|Lorient|Paris FC|1|0
Lorient|Paris FC~05.04.2026|Lorient|Paris FC|1|1
Lorient|Paris FC~03.10.2025|Paris FC|Lorient|2|0
Monaco|Toulouse~10.10.2026|Monaco|Toulouse|2|2
Monaco|Toulouse~25.04.2026|Toulouse|Monaco|2|2
Monaco|Toulouse~25.10.2025|Monaco|Toulouse|1|0
Monaco|Toulouse~07.03.2025|Toulouse|Monaco|1|1
Monaco|Toulouse~07.12.2024|Monaco|Toulouse|2|0
Le Mans|PSG~10.10.2026|PSG|Le Mans|3|1
Lens|Lyon~09.10.2026|Lens|Lyon|2|1
Lens|Lyon~17.05.2026|Lyon|Lens|0|4
Lens|Lyon~16.08.2025|Lens|Lyon|0|1
Lens|Lyon~04.05.2025|Lyon|Lens|1|2
Lens|Lyon~15.09.2024|Lens|Lyon|0|0
Auxerre|Brest~20.09.2026|Auxerre|Brest|2|1
Auxerre|Brest~21.03.2026|Auxerre|Brest|3|0
Auxerre|Brest~04.01.2026|Brest|Auxerre|2|0
Auxerre|Brest~14.02.2025|Brest|Auxerre|2|2
Auxerre|Brest~27.09.2024|Auxerre|Brest|3|0
Lille|Nice~20.09.2026|Nice|Lille|2|1
Lille|Nice~18.04.2026|Lille|Nice|0|0
Lille|Nice~29.10.2025|Nice|Lille|2|0
Lille|Nice~17.01.2025|Lille|Nice|2|1
Lille|Nice~10.11.2024|Nice|Lille|2|2
Marseille|PSG~20.09.2026|Marseille|PSG|1|2
Marseille|PSG~08.02.2026|PSG|Marseille|5|0
Marseille|PSG~22.09.2025|Marseille|PSG|1|0
Marseille|PSG~16.03.2025|PSG|Marseille|3|1
Marseille|PSG~27.10.2024|Marseille|PSG|0|3
Paris FC|Strasbourg~19.09.2026|Paris FC|Strasbourg|2|1
Paris FC|Strasbourg~15.03.2026|Strasbourg|Paris FC|0|0
Paris FC|Strasbourg~21.09.2025|Paris FC|Strasbourg|2|3
Angers|Troyes~19.09.2026|Angers|Troyes|2|0
Angers|Troyes~27.05.2023|Angers|Troyes|2|1
Angers|Troyes~28.08.2022|Troyes|Angers|3|1
Angers|Troyes~23.01.2022|Angers|Troyes|2|1
Angers|Troyes~26.09.2021|Troyes|Angers|1|1
Le Mans|Lorient~19.09.2026|Le Mans|Lorient|2|1
Lyon|Rennes~19.09.2026|Lyon|Rennes|4|0
Lyon|Rennes~03.05.2026|Lyon|Rennes|4|2
Lyon|Rennes~14.09.2025|Rennes|Lyon|3|1
Lyon|Rennes~26.04.2025|Lyon|Rennes|4|1
Lyon|Rennes~18.08.2024|Rennes|Lyon|3|0
Le Havre|Toulouse~19.09.2026|Toulouse|Le Havre|3|2
Le Havre|Toulouse~15.02.2026|Le Havre|Toulouse|2|1
Le Havre|Toulouse~02.11.2025|Toulouse|Le Havre|0|0
Le Havre|Toulouse~23.02.2025|Le Havre|Toulouse|1|4
Le Havre|Toulouse~15.09.2024|Toulouse|Le Havre|2|0
Lens|Monaco~18.09.2026|Monaco|Lens|2|1
Lens|Monaco~21.02.2026|Lens|Monaco|2|3
Lens|Monaco~08.11.2025|Monaco|Lens|1|4
Lens|Monaco~17.05.2025|Lens|Monaco|4|0
Lens|Monaco~01.09.2024|Monaco|Lens|1|1
Lille|Troyes~13.09.2026|Lille|Troyes|2|0
Lille|Troyes~03.06.2023|Troyes|Lille|1|1
Lille|Troyes~15.01.2023|Lille|Troyes|5|1
Lille|Troyes~01.05.2022|Troyes|Lille|3|0
Lille|Troyes~04.12.2021|Lille|Troyes|2|1
Le Mans|Lens~13.09.2026|Le Mans|Lens|2|2
Brest|PSG~13.09.2026|Brest|PSG|0|1
Brest|PSG~10.05.2026|PSG|Brest|1|0
Brest|PSG~25.10.2025|Brest|PSG|0|3
Brest|PSG~01.02.2025|Brest|PSG|2|5
Brest|PSG~14.09.2024|PSG|Brest|3|1
Monaco|Strasbourg~12.09.2026|Strasbourg|Monaco|1|1
Monaco|Strasbourg~17.05.2026|Strasbourg|Monaco|5|4
Monaco|Strasbourg~31.08.2025|Monaco|Strasbourg|3|2
Monaco|Strasbourg~19.04.2025|Monaco|Strasbourg|0|0
Monaco|Strasbourg~09.11.2024|Strasbourg|Monaco|1|3
Auxerre|Nice~12.09.2026|Auxerre|Nice|1|0
Auxerre|Nice~10.05.2026|Auxerre|Nice|2|1
Auxerre|Nice~23.08.2025|Nice|Auxerre|3|1
Auxerre|Nice~14.03.2025|Nice|Auxerre|1|1
Auxerre|Nice~18.08.2024|Auxerre|Nice|2|1
Angers|Le Havre~12.09.2026|Le Havre|Angers|0|0
Angers|Le Havre~18.04.2026|Angers|Le Havre|1|1
Angers|Le Havre~04.01.2026|Le Havre|Angers|2|1
Angers|Le Havre~02.02.2025|Angers|Le Havre|1|1
Angers|Le Havre~01.12.2024|Le Havre|Angers|0|1
Lorient|Toulouse~12.09.2026|Lorient|Toulouse|2|2
Lorient|Toulouse~21.03.2026|Toulouse|Lorient|1|0
Lorient|Toulouse~09.11.2025|Lorient|Toulouse|1|1
Lorient|Toulouse~28.04.2024|Lorient|Toulouse|1|2
Lorient|Toulouse~03.12.2023|Toulouse|Lorient|1|1
Lyon|Paris FC~12.09.2026|Paris FC|Lyon|0|0
Lyon|Paris FC~08.03.2026|Lyon|Paris FC|1|1
Lyon|Paris FC~29.10.2025|Paris FC|Lyon|3|3
Marseille|Rennes~11.09.2026|Rennes|Marseille|1|0
Marseille|Rennes~17.05.2026|Marseille|Rennes|3|1
Marseille|Rennes~15.08.2025|Rennes|Marseille|1|0
Marseille|Rennes~17.05.2025|Marseille|Rennes|4|2
Marseille|Rennes~11.01.2025|Rennes|Marseille|1|2
Strasbourg|Troyes~06.09.2026|Troyes|Strasbourg|2|6
Strasbourg|Troyes~21.05.2023|Troyes|Strasbourg|1|1
Strasbourg|Troyes~02.01.2023|Strasbourg|Troyes|2|3
Strasbourg|Troyes~17.04.2022|Troyes|Strasbourg|1|1
Strasbourg|Troyes~22.08.2021|Strasbourg|Troyes|1|1
Angers|Rennes~06.09.2026|Angers|Rennes|1|2
Angers|Rennes~11.04.2026|Rennes|Angers|2|1
Angers|Rennes~31.08.2025|Angers|Rennes|1|1
Angers|Rennes~30.03.2025|Angers|Rennes|0|3
Angers|Rennes~15.12.2024|Rennes|Angers|2|0
Marseille|Paris FC~06.09.2026|Marseille|Paris FC|2|3
Marseille|Paris FC~31.01.2026|Paris FC|Marseille|2|2
Marseille|Paris FC~23.08.2025|Marseille|Paris FC|5|2
Lens|Lorient~05.09.2026|Lens|Lorient|0|1
Lens|Lorient~14.03.2026|Lorient|Lens|2|1
Lens|Lorient~02.11.2025|Lens|Lorient|3|0
Lens|Lorient~03.05.2024|Lens|Lorient|2|0
Lens|Lorient~04.11.2023|Lorient|Lens|0|0
Brest|Le Havre~05.09.2026|Le Havre|Brest|1|2
Brest|Le Havre~08.03.2026|Brest|Le Havre|2|0
Brest|Le Havre~29.10.2025|Le Havre|Brest|1|0
Brest|Le Havre~26.01.2025|Le Havre|Brest|0|1
Brest|Le Havre~06.10.2024|Brest|Le Havre|2|0
Le Mans|Nice~05.09.2026|Nice|Le Mans|1|1
Auxerre|Lyon~04.09.2026|Lyon|Auxerre|3|1
Auxerre|Lyon~25.04.2026|Lyon|Auxerre|3|2
Auxerre|Lyon~23.11.2025|Auxerre|Lyon|0|0
Auxerre|Lyon~13.04.2025|Auxerre|Lyon|1|3
Auxerre|Lyon~27.10.2024|Lyon|Auxerre|2|2
Monaco|PSG~04.09.2026|PSG|Monaco|1|2
Monaco|PSG~06.03.2026|PSG|Monaco|1|3
Monaco|PSG~29.11.2025|Monaco|PSG|1|0
Monaco|PSG~07.02.2025|PSG|Monaco|4|1
Monaco|PSG~18.12.2024|Monaco|PSG|2|4
Lille|Toulouse~03.09.2026|Toulouse|Lille|0|1
Lille|Toulouse~12.04.2026|Toulouse|Lille|0|4
Lille|Toulouse~14.09.2025|Lille|Toulouse|2|1
Lille|Toulouse~12.04.2025|Toulouse|Lille|1|2
Lille|Toulouse~05.10.2024|Lille|Toulouse|2|1
Nice|Paris FC~30.08.2026|Paris FC|Nice|3|0
Nice|Paris FC~01.03.2026|Paris FC|Nice|1|0
Nice|Paris FC~28.09.2025|Nice|Paris FC|1|1
Le Mans|Rennes~30.08.2026|Rennes|Le Mans|3|2
Marseille|Monaco~30.08.2026|Monaco|Marseille|2|0
Marseille|Monaco~05.04.2026|Monaco|Marseille|2|1
Marseille|Monaco~14.12.2025|Marseille|Monaco|1|0
Marseille|Monaco~12.04.2025|Monaco|Marseille|3|0
Marseille|Monaco~01.12.2024|Marseille|Monaco|2|1
Lens|Strasbourg~29.08.2026|Strasbourg|Lens|2|1
Lens|Strasbourg~27.02.2026|Strasbourg|Lens|1|1
Lens|Strasbourg~22.11.2025|Lens|Strasbourg|1|0
Lens|Strasbourg~16.02.2025|Lens|Strasbourg|0|2
Lens|Strasbourg~06.10.2024|Strasbourg|Lens|2|2
Angers|Auxerre~29.08.2026|Auxerre|Angers|1|3
Angers|Auxerre~03.05.2026|Auxerre|Angers|3|1
Angers|Auxerre~09.11.2025|Angers|Auxerre|2|0
Angers|Auxerre~19.01.2025|Angers|Auxerre|2|0
Angers|Auxerre~24.11.2024|Auxerre|Angers|1|0
Brest|Toulouse~29.08.2026|Brest|Toulouse|2|2
Brest|Toulouse~25.01.2026|Brest|Toulouse|0|2
Brest|Toulouse~24.08.2025|Toulouse|Brest|2|0
Brest|Toulouse~30.03.2025|Toulouse|Brest|2|4
Brest|Toulouse~22.09.2024|Brest|Toulouse|2|0
Lorient|Troyes~29.08.2026|Lorient|Troyes|1|2
Lorient|Troyes~12.03.2023|Lorient|Troyes|2|0
Lorient|Troyes~23.10.2022|Troyes|Lorient|2|2
Lorient|Troyes~21.05.2022|Lorient|Troyes|1|1
Lorient|Troyes~01.12.2021|Troyes|Lorient|2|0
Le Havre|Lyon~29.08.2026|Lyon|Le Havre|1|1
Le Havre|Lyon~15.03.2026|Le Havre|Lyon|0|0
Le Havre|Lyon~14.12.2025|Lyon|Le Havre|1|0
Le Havre|Lyon~16.03.2025|Lyon|Le Havre|4|2
Le Havre|Lyon~20.10.2024|Le Havre|Lyon|0|4
Lille|PSG~28.08.2026|Lille|PSG|2|2
Lille|PSG~16.01.2026|PSG|Lille|3|0
Lille|PSG~05.10.2025|Lille|PSG|1|1
Lille|PSG~01.03.2025|PSG|Lille|4|1
Lille|PSG~01.09.2024|Lille|PSG|1|3
Angers|Lille~23.08.2026|Angers|Lille|0|2
Angers|Lille~22.02.2026|Angers|Lille|0|1
Angers|Lille~02.11.2025|Lille|Angers|1|0
Angers|Lille~27.04.2025|Angers|Lille|0|2
Angers|Lille~24.08.2024|Lille|Angers|2|0
Le Havre|Monaco~23.08.2026|Le Havre|Monaco|0|1
Le Havre|Monaco~24.01.2026|Le Havre|Monaco|0|0
Le Havre|Monaco~16.08.2025|Monaco|Le Havre|3|1
Le Havre|Monaco~26.04.2025|Le Havre|Monaco|1|1
Le Havre|Monaco~22.09.2024|Monaco|Le Havre|3|1
PSG|Rennes~23.08.2026|Rennes|PSG|2|2
PSG|Rennes~13.02.2026|Rennes|PSG|3|1
PSG|Rennes~06.12.2025|PSG|Rennes|5|0
PSG|Rennes~08.03.2025|Rennes|PSG|1|4
PSG|Rennes~27.09.2024|PSG|Rennes|3|1
Auxerre|Lens~22.08.2026|Lens|Auxerre|5|2
Auxerre|Lens~17.01.2026|Lens|Auxerre|1|0
Auxerre|Lens~04.10.2025|Auxerre|Lens|1|2
Auxerre|Lens~27.04.2025|Lens|Auxerre|0|4
Auxerre|Lens~14.12.2024|Auxerre|Lens|2|2
Brest|Le Mans~22.08.2026|Le Mans|Brest|2|2
Lorient|Nice~22.08.2026|Nice|Lorient|0|0
Lorient|Nice~22.02.2026|Nice|Lorient|3|3
Lorient|Nice~30.11.2025|Lorient|Nice|3|1
Lorient|Nice~19.04.2024|Nice|Lorient|3|0
Lorient|Nice~20.08.2023|Lorient|Nice|1|1
Lyon|Toulouse~22.08.2026|Toulouse|Lyon|0|2
Lyon|Toulouse~10.05.2026|Toulouse|Lyon|2|1
Lyon|Toulouse~05.10.2025|Lyon|Toulouse|1|2
Lyon|Toulouse~18.01.2025|Lyon|Toulouse|0|0
Lyon|Toulouse~29.09.2024|Toulouse|Lyon|1|2
Paris FC|Troyes~22.08.2026|Troyes|Paris FC|0|0
Marseille|Strasbourg~21.08.2026|Marseille|Strasbourg|4|0
Marseille|Strasbourg~14.02.2026|Marseille|Strasbourg|2|2
Marseille|Strasbourg~26.09.2025|Strasbourg|Marseille|1|2
Marseille|Strasbourg~19.01.2025|Marseille|Strasbourg|1|1
Marseille|Strasbourg~29.09.2024|Strasbourg|Marseille|1|0
Auxerre|Lille~17.05.2026|Lille|Auxerre|0|2
Auxerre|Lille~14.12.2025|Auxerre|Lille|3|4
Auxerre|Lille~20.04.2025|Lille|Auxerre|3|1
Auxerre|Lille~10.01.2025|Auxerre|Lille|0|0
Auxerre|Lille~22.04.2023|Auxerre|Lille|1|1
Le Havre|Lorient~17.05.2026|Lorient|Le Havre|0|2
Le Havre|Lorient~21.09.2025|Le Havre|Lorient|1|1
Le Havre|Lorient~28.01.2024|Lorient|Le Havre|3|3
Le Havre|Lorient~03.09.2023|Le Havre|Lorient|3|0
Nantes|Toulouse~17.05.2026|Nantes|Toulouse|0|0
Nantes|Toulouse~27.09.2025|Toulouse|Nantes|2|2
Nantes|Toulouse~27.04.2025|Nantes|Toulouse|0|0
Nantes|Toulouse~18.08.2024|Toulouse|Nantes|0|0
Nantes|Toulouse~11.02.2024|Toulouse|Nantes|1|2
Metz|Nice~17.05.2026|Nice|Metz|0|0
Metz|Nice~09.11.2025|Metz|Nice|2|1
Metz|Nice~27.01.2024|Nice|Metz|1|0
Metz|Nice~07.10.2023|Metz|Nice|0|1
Metz|Nice~23.01.2022|Metz|Nice|0|2
PSG|Paris FC~17.05.2026|Paris FC|PSG|2|1
PSG|Paris FC~04.01.2026|PSG|Paris FC|2|1
Brest|Strasbourg~13.05.2026|Brest|Strasbourg|1|2
Brest|Strasbourg~30.11.2025|Strasbourg|Brest|1|2
Brest|Strasbourg~23.02.2025|Strasbourg|Brest|0|0
Brest|Strasbourg~30.11.2024|Brest|Strasbourg|3|1
Brest|Strasbourg~24.02.2024|Strasbourg|Brest|0|3
Lens|PSG~13.05.2026|Lens|PSG|0|2
Lens|PSG~14.09.2025|PSG|Lens|2|0
Lens|PSG~18.01.2025|Lens|PSG|1|2
Lens|PSG~02.11.2024|PSG|Lens|1|0
Lens|PSG~14.01.2024|Lens|PSG|0|2
Angers|Strasbourg~10.05.2026|Angers|Strasbourg|1|1
Angers|Strasbourg~05.10.2025|Strasbourg|Angers|5|0
Angers|Strasbourg~10.05.2025|Angers|Strasbourg|2|1
Angers|Strasbourg~15.09.2024|Strasbourg|Angers|1|1
Angers|Strasbourg~18.02.2023|Strasbourg|Angers|2|1
Lorient|Metz~10.05.2026|Metz|Lorient|0|4
Lorient|Metz~04.01.2026|Lorient|Metz|1|1
Lorient|Metz~04.02.2024|Metz|Lorient|1|2
Lorient|Metz~26.11.2023|Lorient|Metz|2|3
Lorient|Metz~20.04.2022|Lorient|Metz|1|0
Lens|Nantes~08.05.2026|Lens|Nantes|1|0
Lens|Nantes~06.12.2025|Nantes|Lens|1|2
Lens|Nantes~23.02.2025|Nantes|Lens|3|1
Lens|Nantes~09.11.2024|Lens|Nantes|3|2
Lens|Nantes~03.02.2024|Nantes|Lens|0|1
Brest|Paris FC~03.05.2026|Paris FC|Brest|4|0
Brest|Paris FC~14.09.2025|Brest|Paris FC|1|2
Strasbourg|Toulouse~03.05.2026|Strasbourg|Toulouse|1|2
Strasbourg|Toulouse~06.12.2025|Toulouse|Strasbourg|1|0
Strasbourg|Toulouse~16.03.2025|Strasbourg|Toulouse|2|1
Strasbourg|Toulouse~12.01.2025|Toulouse|Strasbourg|1|2
Strasbourg|Toulouse~07.04.2024|Toulouse|Strasbourg|0|0
Marseille|Nantes~02.05.2026|Nantes|Marseille|3|0
Marseille|Nantes~04.01.2026|Marseille|Nantes|0|2
Marseille|Nantes~02.03.2025|Marseille|Nantes|2|0
Marseille|Nantes~03.11.2024|Nantes|Marseille|1|2
Marseille|Nantes~10.03.2024|Marseille|Nantes|2|0
Lorient|PSG~02.05.2026|PSG|Lorient|2|2
Lorient|PSG~29.10.2025|Lorient|PSG|1|1
Lorient|PSG~24.04.2024|Lorient|PSG|1|4
Lorient|PSG~12.08.2023|PSG|Lorient|0|0
Lorient|PSG~30.04.2023|PSG|Lorient|1|3
Metz|Monaco~02.05.2026|Metz|Monaco|1|2
Metz|Monaco~21.09.2025|Monaco|Metz|5|2
Metz|Monaco~30.03.2024|Metz|Monaco|2|5
Metz|Monaco~22.10.2023|Monaco|Metz|2|1
Metz|Monaco~03.04.2022|Metz|Monaco|1|2
Lens|Nice~02.05.2026|Nice|Lens|1|1
Lens|Nice~14.12.2025|Lens|Nice|2|0
Lens|Nice~08.02.2025|Nice|Lens|2|0
Lens|Nice~28.09.2024|Lens|Nice|0|0
Lens|Nice~16.03.2024|Lens|Nice|1|3
Lorient|Strasbourg~26.04.2026|Lorient|Strasbourg|2|3
Lorient|Strasbourg~14.12.2025|Strasbourg|Lorient|0|0
Lorient|Strasbourg~18.02.2024|Strasbourg|Lorient|1|3
Lorient|Strasbourg~17.12.2023|Lorient|Strasbourg|1|2
Lorient|Strasbourg~03.06.2023|Lorient|Strasbourg|2|1
Le Havre|Metz~26.04.2026|Le Havre|Metz|4|4
Le Havre|Metz~28.09.2025|Metz|Le Havre|0|0
Le Havre|Metz~21.04.2024|Le Havre|Metz|0|1
Le Havre|Metz~29.10.2023|Metz|Le Havre|0|0
Lille|Paris FC~26.04.2026|Paris FC|Lille|0|1
Lille|Paris FC~23.11.2025|Lille|Paris FC|4|2
Nantes|Rennes~26.04.2026|Rennes|Nantes|2|1
Nantes|Rennes~20.09.2025|Nantes|Rennes|2|2
Nantes|Rennes~18.04.2025|Rennes|Nantes|2|1
Nantes|Rennes~08.12.2024|Nantes|Rennes|1|0
Nantes|Rennes~20.04.2024|Nantes|Rennes|0|3
Marseille|Nice~26.04.2026|Marseille|Nice|1|1
Marseille|Nice~21.11.2025|Nice|Marseille|1|5
Marseille|Nice~26.01.2025|Nice|Marseille|2|0
Marseille|Nice~14.09.2024|Marseille|Nice|2|0
Marseille|Nice~24.04.2024|Marseille|Nice|2|2
Angers|PSG~25.04.2026|Angers|PSG|0|3
Angers|PSG~22.08.2025|PSG|Angers|1|0
Angers|PSG~05.04.2025|PSG|Angers|1|0
Angers|PSG~09.11.2024|Angers|PSG|2|4
Angers|PSG~21.04.2023|Angers|PSG|1|2
Brest|Lens~24.04.2026|Brest|Lens|3|3
Brest|Lens~29.08.2025|Lens|Brest|3|1
Brest|Lens~20.04.2025|Brest|Lens|1|3
Brest|Lens~25.08.2024|Lens|Brest|2|0
Brest|Lens~09.03.2024|Lens|Brest|1|0
Nantes|PSG~22.04.2026|PSG|Nantes|3|0
Nantes|PSG~17.08.2025|Nantes|PSG|0|1
Nantes|PSG~22.04.2025|Nantes|PSG|1|1
Nantes|PSG~30.11.2024|PSG|Nantes|1|1
Nantes|PSG~17.02.2024|Nantes|PSG|0|2
Auxerre|Monaco~19.04.2026|Monaco|Auxerre|2|2
Auxerre|Monaco~13.09.2025|Auxerre|Monaco|1|2
Auxerre|Monaco~01.02.2025|Monaco|Auxerre|4|2
Auxerre|Monaco~14.09.2024|Auxerre|Monaco|0|3
Auxerre|Monaco~01.02.2023|Monaco|Auxerre|3|2
Metz|Paris FC~19.04.2026|Metz|Paris FC|1|3
Metz|Paris FC~31.08.2025|Paris FC|Metz|3|2
Brest|Nantes~19.04.2026|Nantes|Brest|1|1
Brest|Nantes~04.10.2025|Brest|Nantes|0|0
Brest|Nantes~07.02.2025|Nantes|Brest|0|2
Brest|Nantes~15.12.2024|Brest|Nantes|4|1
Brest|Nantes~04.05.2024|Brest|Nantes|0|0
Lorient|Marseille~18.04.2026|Lorient|Marseille|2|0
Lorient|Marseille~12.09.2025|Marseille|Lorient|4|0
Lorient|Marseille~12.05.2024|Marseille|Lorient|3|1
Lorient|Marseille~10.12.2023|Lorient|Marseille|2|4
Lorient|Marseille~09.04.2023|Lorient|Marseille|0|0
Lens|Toulouse~17.04.2026|Lens|Toulouse|3|2
Lens|Toulouse~02.01.2026|Toulouse|Lens|0|3
Lens|Toulouse~10.05.2025|Toulouse|Lens|1|1
Lens|Toulouse~05.01.2025|Lens|Toulouse|0|1
Lens|Toulouse~28.01.2024|Toulouse|Lens|0|2
Le Havre|Nice~12.04.2026|Nice|Le Havre|1|1
Le Havre|Nice~31.08.2025|Le Havre|Nice|3|1
Le Havre|Nice~16.02.2025|Le Havre|Nice|1|3
Le Havre|Nice~07.12.2024|Nice|Le Havre|2|1
Le Havre|Nice~10.05.2024|Nice|Le Havre|1|0
Lorient|Lyon~12.04.2026|Lyon|Lorient|2|0
Lorient|Lyon~07.12.2025|Lorient|Lyon|1|0
Lorient|Lyon~09.03.2024|Lorient|Lyon|0|2
Lorient|Lyon~08.10.2023|Lyon|Lorient|3|3
Lorient|Lyon~05.03.2023|Lyon|Lorient|0|0
Auxerre|Nantes~11.04.2026|Auxerre|Nantes|0|0
Auxerre|Nantes~30.08.2025|Nantes|Auxerre|1|0
Auxerre|Nantes~10.05.2025|Auxerre|Nantes|1|1
Auxerre|Nantes~25.08.2024|Nantes|Auxerre|2|0
Auxerre|Nantes~16.04.2023|Auxerre|Nantes|2|1
Monaco|Paris FC~10.04.2026|Paris FC|Monaco|4|1
Monaco|Paris FC~01.11.2025|Monaco|Paris FC|0|1
Marseille|Metz~10.04.2026|Marseille|Metz|3|1
Marseille|Metz~04.10.2025|Metz|Marseille|0|3
Marseille|Metz~09.02.2024|Marseille|Metz|1|1
Marseille|Metz~18.08.2023|Metz|Marseille|2|2
Marseille|Metz~13.02.2022|Metz|Marseille|1|2
Angers|Lyon~05.04.2026|Angers|Lyon|0|0
Angers|Lyon~19.09.2025|Lyon|Angers|1|0
Angers|Lyon~17.05.2025|Lyon|Angers|2|0
Angers|Lyon~07.12.2024|Angers|Lyon|0|3
Angers|Lyon~25.02.2023|Angers|Lyon|1|3
Metz|Nantes~05.04.2026|Metz|Nantes|0|0
Metz|Nantes~02.11.2025|Nantes|Metz|0|2
Metz|Nantes~03.03.2024|Nantes|Metz|0|2
Metz|Nantes~12.11.2023|Metz|Nantes|3|1
Metz|Nantes~27.02.2022|Metz|Nantes|0|0
Brest|Rennes~04.04.2026|Brest|Rennes|3|4
Brest|Rennes~13.12.2025|Rennes|Brest|3|1
Brest|Rennes~18.01.2025|Rennes|Brest|1|2
Brest|Rennes~19.10.2024|Brest|Rennes|1|1
Brest|Rennes~28.04.2024|Rennes|Brest|4|5
Lens|Lille~04.04.2026|Lille|Lens|3|0
Lens|Lille~20.09.2025|Lens|Lille|3|0
Lens|Lille~30.03.2025|Lille|Lens|1|0
Lens|Lille~26.10.2024|Lens|Lille|0|2
Lens|Lille~29.03.2024|Lille|Lens|2|1
PSG|Toulouse~03.04.2026|PSG|Toulouse|3|1
PSG|Toulouse~30.08.2025|Toulouse|PSG|3|6
PSG|Toulouse~15.02.2025|Toulouse|PSG|0|1
PSG|Toulouse~22.11.2024|PSG|Toulouse|3|0
PSG|Toulouse~12.05.2024|PSG|Toulouse|1|3
Lyon|Monaco~22.03.2026|Lyon|Monaco|1|2
Lyon|Monaco~03.01.2026|Monaco|Lyon|1|3
Lyon|Monaco~10.05.2025|Monaco|Lyon|2|0
Lyon|Monaco~24.08.2024|Lyon|Monaco|0|2
Lyon|Monaco~28.04.2024|Lyon|Monaco|3|2
Lille|Marseille~22.03.2026|Marseille|Lille|1|2
Lille|Marseille~05.12.2025|Lille|Marseille|1|0
Lille|Marseille~04.05.2025|Lille|Marseille|1|1
Lille|Marseille~14.12.2024|Marseille|Lille|1|1
Lille|Marseille~05.04.2024|Lille|Marseille|3|1
Le Havre|Paris FC~22.03.2026|Paris FC|Le Havre|3|2
Le Havre|Paris FC~07.12.2025|Le Havre|Paris FC|0|0
Metz|Rennes~22.03.2026|Rennes|Metz|0|0
Metz|Rennes~28.11.2025|Metz|Rennes|0|1
Metz|Rennes~04.05.2024|Metz|Rennes|2|3
Metz|Rennes~13.08.2023|Rennes|Metz|5|1
Metz|Rennes~20.03.2022|Rennes|Metz|6|1
Nantes|Strasbourg~22.03.2026|Nantes|Strasbourg|2|3
Nantes|Strasbourg~24.08.2025|Strasbourg|Nantes|1|0
Nantes|Strasbourg~09.03.2025|Nantes|Strasbourg|0|1
Nantes|Strasbourg~27.10.2024|Strasbourg|Nantes|3|1
Nantes|Strasbourg~16.03.2024|Nantes|Strasbourg|1|3
Nice|PSG~21.03.2026|Nice|PSG|0|4
Nice|PSG~01.11.2025|PSG|Nice|1|0
Nice|PSG~25.04.2025|PSG|Nice|1|3
Nice|PSG~06.10.2024|Nice|PSG|1|1
Nice|PSG~15.05.2024|Nice|PSG|1|2
Angers|Lens~20.03.2026|Lens|Angers|5|1
Angers|Lens~30.11.2025|Angers|Lens|1|2
Angers|Lens~26.01.2025|Lens|Angers|1|0
Angers|Lens~18.08.2024|Angers|Lens|0|1
Angers|Lens~18.03.2023|Lens|Angers|3|0
Metz|Toulouse~15.03.2026|Metz|Toulouse|3|4
Metz|Toulouse~19.10.2025|Toulouse|Metz|4|0
Metz|Toulouse~14.01.2024|Metz|Toulouse|0|1
Metz|Toulouse~01.10.2023|Toulouse|Metz|3|0
Lille|Rennes~15.03.2026|Rennes|Lille|1|2
Lille|Rennes~03.01.2026|Lille|Rennes|0|2
Lille|Rennes~16.02.2025|Rennes|Lille|0|2
Lille|Rennes~24.11.2024|Lille|Rennes|1|0
Lille|Rennes~10.03.2024|Lille|Rennes|2|2
Angers|Nice~14.03.2026|Angers|Nice|0|2
Angers|Nice~07.12.2025|Nice|Angers|0|1
Angers|Nice~20.04.2025|Nice|Angers|2|1
Angers|Nice~01.09.2024|Angers|Nice|1|4
Angers|Nice~02.04.2023|Angers|Nice|1|1
Brest|Monaco~14.03.2026|Monaco|Brest|2|0
Brest|Monaco~05.12.2025|Brest|Monaco|1|0
Brest|Monaco~05.04.2025|Brest|Monaco|2|1
Brest|Monaco~22.11.2024|Monaco|Brest|3|2
Brest|Monaco~21.04.2024|Brest|Monaco|0|2
Auxerre|Marseille~13.03.2026|Marseille|Auxerre|1|0
Auxerre|Marseille~01.11.2025|Auxerre|Marseille|0|1
Auxerre|Marseille~22.02.2025|Auxerre|Marseille|3|0
Auxerre|Marseille~08.11.2024|Marseille|Auxerre|1|3
Auxerre|Marseille~30.04.2023|Marseille|Auxerre|2|1
Lens|Metz~08.03.2026|Lens|Metz|3|0
Lens|Metz~29.10.2025|Metz|Lens|2|0
Lens|Metz~12.04.2024|Metz|Lens|2|1
Lens|Metz~16.09.2023|Lens|Metz|0|1
Lens|Metz~13.03.2022|Metz|Lens|0|0
Lille|Lorient~08.03.2026|Lille|Lorient|1|1
Lille|Lorient~30.08.2025|Lorient|Lille|1|7
Lille|Lorient~14.01.2024|Lille|Lorient|3|0
Lille|Lorient~27.08.2023|Lorient|Lille|4|1
Lille|Lorient~02.04.2023|Lille|Lorient|3|1
Nice|Rennes~08.03.2026|Nice|Rennes|0|4
Nice|Rennes~26.10.2025|Rennes|Nice|1|2
Nice|Rennes~10.05.2025|Rennes|Nice|2|0
Nice|Rennes~03.01.2025|Nice|Rennes|3|2
Nice|Rennes~13.01.2024|Rennes|Nice|2|0
Angers|Nantes~07.03.2026|Nantes|Angers|0|1
Angers|Nantes~12.12.2025|Angers|Nantes|4|1
Angers|Nantes~04.05.2025|Nantes|Angers|0|1
Angers|Nantes~22.09.2024|Angers|Nantes|1|1
Angers|Nantes~03.06.2023|Nantes|Angers|1|0
Auxerre|Strasbourg~07.03.2026|Auxerre|Strasbourg|0|0
Auxerre|Strasbourg~29.10.2025|Strasbourg|Auxerre|3|0
Auxerre|Strasbourg~02.03.2025|Auxerre|Strasbourg|0|1
Auxerre|Strasbourg~05.01.2025|Strasbourg|Auxerre|3|1
Auxerre|Strasbourg~19.03.2023|Strasbourg|Auxerre|2|0
Marseille|Toulouse~07.03.2026|Toulouse|Marseille|0|1
Marseille|Toulouse~29.11.2025|Marseille|Toulouse|2|2
Marseille|Toulouse~06.04.2025|Marseille|Toulouse|3|2
Marseille|Toulouse~31.08.2024|Toulouse|Marseille|1|3
Marseille|Toulouse~21.04.2024|Toulouse|Marseille|2|2
Lille|Nantes~01.03.2026|Lille|Nantes|1|0
Lille|Nantes~19.10.2025|Nantes|Lille|0|2
Lille|Nantes~15.03.2025|Nantes|Lille|1|0
Lille|Nantes~04.01.2025|Lille|Nantes|1|1
Lille|Nantes~12.05.2024|Nantes|Lille|1|2
Auxerre|Lorient~01.03.2026|Lorient|Auxerre|2|2
Auxerre|Lorient~17.08.2025|Auxerre|Lorient|1|0
Auxerre|Lorient~26.02.2023|Lorient|Auxerre|0|1
Auxerre|Lorient~16.09.2022|Auxerre|Lorient|1|3
Brest|Metz~01.03.2026|Metz|Brest|0|1
Brest|Metz~23.11.2025|Brest|Metz|3|2
Brest|Metz~07.04.2024|Brest|Metz|4|3
Brest|Metz~10.12.2023|Metz|Brest|0|1
Brest|Metz~24.04.2022|Metz|Brest|0|1
Lyon|Marseille~01.03.2026|Marseille|Lyon|3|2
Lyon|Marseille~31.08.2025|Lyon|Marseille|1|0
Lyon|Marseille~02.02.2025|Marseille|Lyon|3|2
Lyon|Marseille~22.09.2024|Lyon|Marseille|2|3
Lyon|Marseille~04.02.2024|Lyon|Marseille|1|0
Rennes|Toulouse~28.02.2026|Rennes|Toulouse|1|0
Rennes|Toulouse~29.10.2025|Toulouse|Rennes|2|2
Rennes|Toulouse~03.05.2025|Toulouse|Rennes|2|1
Rennes|Toulouse~10.11.2024|Rennes|Toulouse|0|2
Rennes|Toulouse~13.04.2024|Rennes|Toulouse|1|2
Angers|Monaco~28.02.2026|Monaco|Angers|2|0
Angers|Monaco~18.10.2025|Angers|Monaco|1|1
Angers|Monaco~15.03.2025|Angers|Monaco|0|2
Angers|Monaco~01.11.2024|Monaco|Angers|0|1
Angers|Monaco~07.05.2023|Angers|Monaco|1|2
Le Havre|PSG~28.02.2026|Le Havre|PSG|0|1
Le Havre|PSG~22.11.2025|PSG|Le Havre|3|0
Le Havre|PSG~19.04.2025|PSG|Le Havre|2|1
Le Havre|PSG~16.08.2024|Le Havre|PSG|1|4
Le Havre|PSG~27.04.2024|PSG|Le Havre|3|3
Le Havre|Nantes~22.02.2026|Nantes|Le Havre|2|0
Le Havre|Nantes~08.11.2025|Le Havre|Nantes|1|1
Le Havre|Nantes~30.03.2025|Le Havre|Nantes|3|2
Le Havre|Nantes~24.11.2024|Nantes|Le Havre|0|2
Le Havre|Nantes~14.04.2024|Le Havre|Nantes|0|1
Lyon|Strasbourg~22.02.2026|Strasbourg|Lyon|3|1
Lyon|Strasbourg~26.10.2025|Lyon|Strasbourg|2|1
Lyon|Strasbourg~28.03.2025|Strasbourg|Lyon|4|2
Lyon|Strasbourg~30.08.2024|Lyon|Strasbourg|4|3
Lyon|Strasbourg~19.05.2024|Lyon|Strasbourg|2|1
Paris FC|Toulouse~21.02.2026|Toulouse|Paris FC|1|1
Paris FC|Toulouse~13.12.2025|Paris FC|Toulouse|0|3
Metz|PSG~21.02.2026|PSG|Metz|3|0
Metz|PSG~13.12.2025|Metz|PSG|2|3
Metz|PSG~19.05.2024|Metz|PSG|0|2
Metz|PSG~20.12.2023|PSG|Metz|3|1
Metz|PSG~21.05.2022|PSG|Metz|5|0
Brest|Marseille~20.02.2026|Brest|Marseille|2|0
Brest|Marseille~08.11.2025|Marseille|Brest|3|0
Brest|Marseille~27.04.2025|Marseille|Brest|4|1
Brest|Marseille~17.08.2024|Brest|Marseille|1|5
Brest|Marseille~18.02.2024|Brest|Marseille|1|0
Auxerre|Metz~15.02.2026|Metz|Auxerre|1|3
Auxerre|Metz~07.12.2025|Auxerre|Metz|3|1
Monaco|Nantes~13.02.2026|Monaco|Nantes|3|1
Monaco|Nantes~29.10.2025|Nantes|Monaco|3|5
Monaco|Nantes~15.02.2025|Monaco|Nantes|7|1
Monaco|Nantes~10.01.2025|Nantes|Monaco|2|2
Monaco|Nantes~19.05.2024|Monaco|Nantes|4|0
Monaco|Nice~08.02.2026|Nice|Monaco|0|0
Monaco|Nice~05.10.2025|Monaco|Nice|2|2
Monaco|Nice~29.03.2025|Monaco|Nice|2|1
Monaco|Nice~27.10.2024|Nice|Monaco|2|1
Monaco|Nice~11.02.2024|Nice|Monaco|2|3
Angers|Toulouse~08.02.2026|Angers|Toulouse|1|0
Angers|Toulouse~23.11.2025|Toulouse|Angers|0|1
Angers|Toulouse~02.03.2025|Angers|Toulouse|0|4
Angers|Toulouse~20.10.2024|Toulouse|Angers|1|1
Angers|Toulouse~12.03.2023|Angers|Toulouse|0|2
Auxerre|Paris FC~08.02.2026|Auxerre|Paris FC|0|0
Auxerre|Paris FC~29.11.2025|Paris FC|Auxerre|1|1
Le Havre|Strasbourg~08.02.2026|Le Havre|Strasbourg|2|1
Le Havre|Strasbourg~14.09.2025|Strasbourg|Le Havre|1|0
Le Havre|Strasbourg~17.05.2025|Strasbourg|Le Havre|2|3
Le Havre|Strasbourg~15.12.2024|Le Havre|Strasbourg|0|3
Le Havre|Strasbourg~04.05.2024|Le Havre|Strasbourg|3|1
Lens|Rennes~07.02.2026|Lens|Rennes|3|1
Lens|Rennes~28.09.2025|Rennes|Lens|0|0
Lens|Rennes~15.03.2025|Lens|Rennes|1|0
Lens|Rennes~21.09.2024|Rennes|Lens|1|1
Lens|Rennes~12.05.2024|Rennes|Lens|1|1
Brest|Lorient~07.02.2026|Brest|Lorient|2|0
Brest|Lorient~19.10.2025|Lorient|Brest|3|3
Brest|Lorient~31.03.2024|Lorient|Brest|0|1
Brest|Lorient~20.12.2023|Brest|Lorient|4|0
Brest|Lorient~07.05.2023|Lorient|Brest|2|1
Lyon|Nantes~07.02.2026|Nantes|Lyon|0|1
Lyon|Nantes~30.11.2025|Lyon|Nantes|3|0
Lyon|Nantes~26.01.2025|Nantes|Lyon|1|1
Lyon|Nantes~06.10.2024|Lyon|Nantes|2|0
Lyon|Nantes~07.04.2024|Nantes|Lyon|1|3
Lille|Metz~06.02.2026|Metz|Lille|0|0
Lille|Metz~26.10.2025|Lille|Metz|6|1
Lille|Metz~28.04.2024|Metz|Lille|1|2
Lille|Metz~03.12.2023|Lille|Metz|2|0
Lille|Metz~18.02.2022|Lille|Metz|0|0
Lille|Lyon~01.02.2026|Lyon|Lille|1|0
Lille|Lyon~28.09.2025|Lille|Lyon|0|1
Lille|Lyon~05.04.2025|Lyon|Lille|2|1
Lille|Lyon~01.11.2024|Lille|Lyon|1|1
Lille|Lyon~06.05.2024|Lille|Lyon|3|4
Angers|Metz~01.02.2026|Angers|Metz|1|0
Angers|Metz~14.09.2025|Metz|Angers|1|1
Angers|Metz~14.05.2022|Metz|Angers|1|0
Angers|Metz~03.10.2021|Angers|Metz|3|2
Auxerre|Toulouse~01.02.2026|Toulouse|Auxerre|0|0
Auxerre|Toulouse~21.09.2025|Auxerre|Toulouse|1|0
Auxerre|Toulouse~09.02.2025|Auxerre|Toulouse|2|2
Auxerre|Toulouse~01.12.2024|Toulouse|Auxerre|2|0
Auxerre|Toulouse~27.05.2023|Toulouse|Auxerre|1|1
Lorient|Nantes~31.01.2026|Lorient|Nantes|2|1
Lorient|Nantes~23.11.2025|Nantes|Lorient|1|1
Lorient|Nantes~24.02.2024|Lorient|Nantes|0|1
Lorient|Nantes~23.09.2023|Nantes|Lorient|5|3
Lorient|Nantes~12.02.2023|Nantes|Lorient|1|0
Monaco|Rennes~31.01.2026|Monaco|Rennes|4|0
Monaco|Rennes~22.11.2025|Rennes|Monaco|4|1
Monaco|Rennes~25.01.2025|Monaco|Rennes|3|2
Monaco|Rennes~05.10.2024|Rennes|Monaco|1|2
Monaco|Rennes~07.04.2024|Monaco|Rennes|1|0
Le Havre|Lens~30.01.2026|Lens|Le Havre|1|0
Le Havre|Lens~24.08.2025|Le Havre|Lens|1|2
Le Havre|Lens~01.03.2025|Lens|Le Havre|3|4
Le Havre|Lens~12.01.2025|Le Havre|Lens|1|2
Le Havre|Lens~06.04.2024|Lens|Le Havre|1|1
Nantes|Nice~25.01.2026|Nantes|Nice|1|4
Nantes|Nice~13.09.2025|Nice|Nantes|1|0
Nantes|Nice~04.04.2025|Nice|Nantes|1|2
Nantes|Nice~20.10.2024|Nantes|Nice|1|1
Nantes|Nice~31.03.2024|Nice|Nantes|1|2
Lyon|Metz~25.01.2026|Metz|Lyon|2|5
Lyon|Metz~23.08.2025|Lyon|Metz|3|0
Lyon|Metz~23.02.2024|Metz|Lyon|1|2
Lyon|Metz~05.11.2023|Lyon|Metz|1|1
Lyon|Metz~08.05.2022|Metz|Lyon|3|2
Angers|Paris FC~25.01.2026|Paris FC|Angers|0|0
Angers|Paris FC~17.08.2025|Angers|Paris FC|1|0
Lille|Strasbourg~25.01.2026|Lille|Strasbourg|1|4
Lille|Strasbourg~09.11.2025|Strasbourg|Lille|2|0
Lille|Strasbourg~25.01.2025|Strasbourg|Lille|2|1
Lille|Strasbourg~21.09.2024|Lille|Strasbourg|3|3
Lille|Strasbourg~21.04.2024|Lille|Strasbourg|1|0
Lorient|Rennes~24.01.2026|Rennes|Lorient|0|2
Lorient|Rennes~24.08.2025|Lorient|Rennes|4|0
Lorient|Rennes~03.03.2024|Rennes|Lorient|1|2
Lorient|Rennes~22.10.2023|Lorient|Rennes|2|1
Lorient|Rennes~27.01.2023|Lorient|Rennes|2|1
Lens|Marseille~24.01.2026|Marseille|Lens|3|1
Lens|Marseille~25.10.2025|Lens|Marseille|2|1
Lens|Marseille~08.03.2025|Marseille|Lens|0|1
Lens|Marseille~23.11.2024|Lens|Marseille|1|3
Lens|Marseille~28.04.2024|Marseille|Lens|2|1
Auxerre|PSG~23.01.2026|Auxerre|PSG|0|1
Auxerre|PSG~27.09.2025|PSG|Auxerre|2|0
Auxerre|PSG~17.05.2025|PSG|Auxerre|3|1
Auxerre|PSG~06.12.2024|Auxerre|PSG|0|0
Auxerre|PSG~21.05.2023|Auxerre|PSG|1|2
Metz|Strasbourg~18.01.2026|Strasbourg|Metz|2|1
Metz|Strasbourg~17.08.2025|Metz|Strasbourg|0|1
Metz|Strasbourg~12.05.2024|Strasbourg|Metz|2|1
Metz|Strasbourg~24.09.2023|Metz|Strasbourg|0|1
Metz|Strasbourg~09.01.2022|Metz|Strasbourg|0|2
Nantes|Paris FC~18.01.2026|Nantes|Paris FC|1|2
Nantes|Paris FC~24.10.2025|Paris FC|Nantes|1|2
Le Havre|Rennes~18.01.2026|Rennes|Le Havre|1|1
Le Havre|Rennes~05.10.2025|Le Havre|Rennes|2|2
Le Havre|Rennes~13.04.2025|Le Havre|Rennes|1|5
Le Havre|Rennes~25.10.2024|Rennes|Le Havre|1|0
Le Havre|Rennes~11.02.2024|Le Havre|Rennes|0|1
Brest|Lyon~18.01.2026|Lyon|Brest|2|1
Brest|Lyon~02.11.2025|Brest|Lyon|0|0
Brest|Lyon~02.03.2025|Lyon|Brest|2|1
Brest|Lyon~11.01.2025|Brest|Lyon|2|1
Brest|Lyon~14.04.2024|Lyon|Brest|4|3
Nice|Toulouse~17.01.2026|Toulouse|Nice|5|1
Nice|Toulouse~16.08.2025|Nice|Toulouse|0|1
Nice|Toulouse~02.02.2025|Toulouse|Nice|1|1
Nice|Toulouse~25.08.2024|Nice|Toulouse|1|1
Nice|Toulouse~03.03.2024|Toulouse|Nice|2|1
Lille|Reims~17.05.2025|Lille|Reims|2|1
Lille|Reims~17.08.2024|Reims|Lille|0|2
Lille|Reims~02.03.2024|Reims|Lille|0|1
Lille|Reims~26.09.2023|Lille|Reims|1|2
Lille|Reims~06.05.2023|Reims|Lille|1|0
Montpellier|Nantes~17.05.2025|Nantes|Montpellier|3|0
Montpellier|Nantes~31.08.2024|Montpellier|Nantes|1|3
Montpellier|Nantes~26.04.2024|Montpellier|Nantes|1|1
Montpellier|Nantes~22.10.2023|Nantes|Montpellier|2|0
Montpellier|Nantes~20.05.2023|Nantes|Montpellier|0|3
St Etienne|Toulouse~17.05.2025|St Etienne|Toulouse|2|3
St Etienne|Toulouse~13.12.2024|Toulouse|St Etienne|2|1
Montpellier|PSG~10.05.2025|Montpellier|PSG|1|4
Montpellier|PSG~23.08.2024|PSG|Montpellier|6|0
Montpellier|PSG~17.03.2024|Montpellier|PSG|2|6
Montpellier|PSG~03.11.2023|PSG|Montpellier|3|0
Montpellier|PSG~01.02.2023|Montpellier|PSG|1|3
Reims|St Etienne~10.05.2025|Reims|St Etienne|0|2
Reims|St Etienne~04.01.2025|St Etienne|Reims|3|1
Reims|St Etienne~14.05.2022|St Etienne|Reims|1|2
Reims|St Etienne~11.12.2021|Reims|St Etienne|2|0
Brest|Montpellier~04.05.2025|Brest|Montpellier|1|0
Brest|Montpellier~10.11.2024|Montpellier|Brest|3|1
Brest|Montpellier~14.01.2024|Brest|Montpellier|2|0
Brest|Montpellier~26.11.2023|Montpellier|Brest|1|3
Brest|Montpellier~12.02.2023|Montpellier|Brest|3|0
Monaco|St Etienne~03.05.2025|St Etienne|Monaco|1|3
Monaco|St Etienne~17.08.2024|Monaco|St Etienne|1|0
Monaco|St Etienne~23.04.2022|St Etienne|Monaco|1|4
Monaco|St Etienne~22.09.2021|Monaco|St Etienne|3|1
Nice|Reims~02.05.2025|Nice|Reims|1|0
Nice|Reims~11.01.2025|Reims|Nice|2|4
Nice|Reims~07.04.2024|Reims|Nice|0|0
Nice|Reims~10.12.2023|Nice|Reims|2|1
Nice|Reims~18.02.2023|Nice|Reims|0|0
Montpellier|Reims~27.04.2025|Montpellier|Reims|0|0
Montpellier|Reims~06.10.2024|Reims|Montpellier|4|2
Montpellier|Reims~21.04.2024|Reims|Montpellier|1|2
Montpellier|Reims~27.08.2023|Montpellier|Reims|1|3
Montpellier|Reims~03.06.2023|Reims|Montpellier|1|3
St Etienne|Strasbourg~26.04.2025|Strasbourg|St Etienne|3|1
St Etienne|Strasbourg~02.11.2024|St Etienne|Strasbourg|2|0
St Etienne|Strasbourg~20.02.2022|St Etienne|Strasbourg|2|2
St Etienne|Strasbourg~17.10.2021|Strasbourg|St Etienne|5|1
Reims|Toulouse~20.04.2025|Reims|Toulouse|1|0
Reims|Toulouse~03.11.2024|Toulouse|Reims|1|0
Reims|Toulouse~04.02.2024|Reims|Toulouse|2|3
Reims|Toulouse~22.10.2023|Toulouse|Reims|1|1
Reims|Toulouse~26.02.2023|Reims|Toulouse|3|0
Lyon|St Etienne~20.04.2025|St Etienne|Lyon|2|1
Lyon|St Etienne~10.11.2024|Lyon|St Etienne|1|0
Lyon|St Etienne~21.01.2022|Lyon|St Etienne|1|0
Lyon|St Etienne~03.10.2021|St Etienne|Lyon|1|1
Marseille|Montpellier~19.04.2025|Marseille|Montpellier|5|1
Marseille|Montpellier~20.10.2024|Montpellier|Marseille|0|5
Marseille|Montpellier~25.02.2024|Marseille|Montpellier|4|1
Marseille|Montpellier~20.12.2023|Montpellier|Marseille|1|1
Marseille|Montpellier~31.03.2023|Marseille|Montpellier|1|1
Brest|St Etienne~13.04.2025|St Etienne|Brest|3|3
Brest|St Etienne~31.08.2024|Brest|St Etienne|4|0
Brest|St Etienne~16.04.2022|St Etienne|Brest|2|1
Brest|St Etienne~01.12.2021|Brest|St Etienne|1|0
Angers|Montpellier~13.04.2025|Angers|Montpellier|2|0
Angers|Montpellier~12.01.2025|Montpellier|Angers|1|3
Angers|Montpellier~05.03.2023|Montpellier|Angers|5|0
Angers|Montpellier~11.09.2022|Angers|Montpellier|2|1
Angers|Montpellier~21.05.2022|Angers|Montpellier|2|0
Lens|Reims~11.04.2025|Lens|Reims|0|2
Lens|Reims~29.11.2024|Reims|Lens|0|2
Lens|Reims~18.02.2024|Reims|Lens|1|1
Lens|Reims~16.12.2023|Lens|Reims|2|0
Lens|Reims~12.05.2023|Lens|Reims|2|1
Lens|St Etienne~06.04.2025|Lens|St Etienne|1|0
Lens|St Etienne~19.10.2024|St Etienne|Lens|0|2
Lens|St Etienne~15.01.2022|St Etienne|Lens|1|2
Lens|St Etienne~15.08.2021|Lens|St Etienne|2|2
Le Havre|Montpellier~06.04.2025|Montpellier|Le Havre|0|2
Le Havre|Montpellier~03.11.2024|Le Havre|Montpellier|1|0
Le Havre|Montpellier~31.03.2024|Le Havre|Montpellier|0|2
Le Havre|Montpellier~13.08.2023|Montpellier|Le Havre|2|2
Reims|Strasbourg~06.04.2025|Reims|Strasbourg|0|1
Reims|Strasbourg~08.12.2024|Strasbourg|Reims|0|0
Reims|Strasbourg~13.04.2024|Strasbourg|Reims|3|1
Reims|Strasbourg~01.12.2023|Reims|Strasbourg|2|1
Reims|Strasbourg~23.04.2023|Reims|Strasbourg|0|2
Auxerre|Montpellier~30.03.2025|Auxerre|Montpellier|1|0
Auxerre|Montpellier~22.09.2024|Montpellier|Auxerre|3|2
Auxerre|Montpellier~29.01.2023|Auxerre|Montpellier|0|2
Auxerre|Montpellier~21.08.2022|Montpellier|Auxerre|1|2
Marseille|Reims~29.03.2025|Reims|Marseille|3|1
Marseille|Reims~25.08.2024|Marseille|Reims|2|2
Marseille|Reims~15.05.2024|Reims|Marseille|1|0
Marseille|Reims~12.08.2023|Marseille|Reims|2|1
Marseille|Reims~19.03.2023|Reims|Marseille|1|2
PSG|St Etienne~29.03.2025|St Etienne|PSG|1|6
PSG|St Etienne~12.01.2025|PSG|St Etienne|2|1
PSG|St Etienne~26.02.2022|PSG|St Etienne|3|1
PSG|St Etienne~28.11.2021|St Etienne|PSG|1|3
Brest|Reims~16.03.2025|Brest|Reims|0|0
Brest|Reims~26.10.2024|Reims|Brest|1|2
Brest|Reims~10.05.2024|Brest|Reims|1|1
Brest|Reims~17.09.2023|Reims|Brest|1|2
Brest|Reims~09.04.2023|Reims|Brest|1|1
Montpellier|St Etienne~16.03.2025|Montpellier|St Etienne|0|2
Montpellier|St Etienne~23.11.2024|St Etienne|Montpellier|1|0
Montpellier|St Etienne~05.02.2022|St Etienne|Montpellier|3|1
Montpellier|St Etienne~12.09.2021|Montpellier|St Etienne|2|0
Le Havre|St Etienne~09.03.2025|Le Havre|St Etienne|1|1
Le Havre|St Etienne~24.08.2024|St Etienne|Le Havre|0|2
Auxerre|Reims~09.03.2025|Reims|Auxerre|0|2
Auxerre|Reims~20.10.2024|Auxerre|Reims|2|1
Auxerre|Reims~05.02.2023|Auxerre|Reims|0|0
Auxerre|Reims~23.10.2022|Reims|Auxerre|2|1
Lille|Montpellier~08.03.2025|Lille|Montpellier|1|0
Lille|Montpellier~01.12.2024|Montpellier|Lille|2|2
Lille|Montpellier~28.01.2024|Montpellier|Lille|0|0
Lille|Montpellier~03.09.2023|Lille|Montpellier|1|0
Lille|Montpellier~16.04.2023|Lille|Montpellier|2|1
Montpellier|Rennes~02.03.2025|Montpellier|Rennes|0|4
Montpellier|Rennes~15.09.2024|Rennes|Montpellier|3|0
Montpellier|Rennes~03.02.2024|Rennes|Montpellier|2|1
Montpellier|Rennes~24.09.2023|Montpellier|Rennes|0|0
Montpellier|Rennes~23.04.2023|Montpellier|Rennes|1|0
Nice|St Etienne~01.03.2025|St Etienne|Nice|1|3
Nice|St Etienne~20.09.2024|Nice|St Etienne|8|0
Nice|St Etienne~11.05.2022|Nice|St Etienne|4|2
Nice|St Etienne~25.09.2021|St Etienne|Nice|0|3
Monaco|Reims~28.02.2025|Monaco|Reims|3|0
Monaco|Reims~14.12.2024|Reims|Monaco|0|0
Monaco|Reims~13.01.2024|Monaco|Reims|1|3
Monaco|Reims~07.10.2023|Reims|Monaco|1|3
Monaco|Reims~12.03.2023|Monaco|Reims|0|1
Montpellier|Nice~23.02.2025|Nice|Montpellier|2|0
Montpellier|Nice~15.12.2024|Montpellier|Nice|2|2
Montpellier|Nice~08.03.2024|Nice|Montpellier|1|2
Montpellier|Nice~10.11.2023|Montpellier|Nice|0|0
Montpellier|Nice~27.05.2023|Montpellier|Nice|2|3
Angers|St Etienne~22.02.2025|St Etienne|Angers|3|3
Angers|St Etienne~26.10.2024|Angers|St Etienne|4|2
Angers|St Etienne~26.01.2022|Angers|St Etienne|0|1
Angers|St Etienne~22.10.2021|St Etienne|Angers|2|2
Reims|Rennes~21.02.2025|Rennes|Reims|1|0
Reims|Rennes~01.09.2024|Reims|Rennes|2|1
Reims|Rennes~19.05.2024|Reims|Rennes|2|1
Reims|Rennes~26.11.2023|Rennes|Reims|3|1
Reims|Rennes~15.04.2023|Rennes|Reims|3|0
Lyon|Montpellier~16.02.2025|Montpellier|Lyon|1|4
Lyon|Montpellier~04.01.2025|Lyon|Montpellier|1|0
Lyon|Montpellier~11.02.2024|Montpellier|Lyon|1|2
Lyon|Montpellier~19.08.2023|Lyon|Montpellier|1|4
Lyon|Montpellier~07.05.2023|Lyon|Montpellier|5|4
Angers|Reims~16.02.2025|Reims|Angers|0|1
Angers|Reims~29.09.2024|Angers|Reims|1|3
Angers|Reims~21.05.2023|Reims|Angers|2|2
Angers|Reims~31.08.2022|Angers|Reims|2|4
Angers|Reims~13.03.2022|Angers|Reims|0|1
Marseille|St Etienne~15.02.2025|Marseille|St Etienne|5|1
Marseille|St Etienne~08.12.2024|St Etienne|Marseille|0|2
Marseille|St Etienne~03.04.2022|St Etienne|Marseille|2|4
Marseille|St Etienne~28.08.2021|Marseille|St Etienne|3|1
Lyon|Reims~09.02.2025|Lyon|Reims|4|0
Lyon|Reims~23.11.2024|Reims|Lyon|1|1
Lyon|Reims~30.03.2024|Lyon|Reims|1|1
Lyon|Reims~01.10.2023|Reims|Lyon|2|0
Lyon|Reims~27.05.2023|Lyon|Reims|3|0
Montpellier|Strasbourg~09.02.2025|Strasbourg|Montpellier|2|0
Montpellier|Strasbourg~18.08.2024|Montpellier|Strasbourg|1|1
Montpellier|Strasbourg~03.03.2024|Montpellier|Strasbourg|2|2
Montpellier|Strasbourg~17.09.2023|Strasbourg|Montpellier|2|2
Montpellier|Strasbourg~05.02.2023|Strasbourg|Montpellier|2|0
Rennes|St Etienne~08.02.2025|St Etienne|Rennes|0|2
Rennes|St Etienne~30.11.2024|Rennes|St Etienne|5|0
Rennes|St Etienne~30.04.2022|Rennes|St Etienne|2|0
Rennes|St Etienne~05.12.2021|St Etienne|Rennes|0|5
Nantes|Reims~02.02.2025|Reims|Nantes|1|2
Nantes|Reims~15.09.2024|Nantes|Reims|1|2
Nantes|Reims~28.01.2024|Reims|Nantes|0|0
Nantes|Reims~05.11.2023|Nantes|Reims|0|1
Nantes|Reims~02.04.2023|Nantes|Reims|0|3
Lille|St Etienne~01.02.2025|Lille|St Etienne|4|1
Lille|St Etienne~13.09.2024|St Etienne|Lille|1|0
Lille|St Etienne~11.03.2022|Lille|St Etienne|0|0
Lille|St Etienne~21.08.2021|St Etienne|Lille|1|1
Lens|Montpellier~31.01.2025|Montpellier|Lens|0|2
Lens|Montpellier~08.12.2024|Lens|Montpellier|2|0
Lens|Montpellier~19.05.2024|Lens|Montpellier|2|2
Lens|Montpellier~08.12.2023|Montpellier|Lens|0|0
Lens|Montpellier~25.02.2023|Montpellier|Lens|1|1
Montpellier|Toulouse~26.01.2025|Toulouse|Montpellier|1|2
Montpellier|Toulouse~27.10.2024|Montpellier|Toulouse|0|3
Montpellier|Toulouse~03.05.2024|Toulouse|Montpellier|1|2
Montpellier|Toulouse~29.10.2023|Montpellier|Toulouse|3|0
Montpellier|Toulouse~09.04.2023|Montpellier|Toulouse|1|2
PSG|Reims~25.01.2025|PSG|Reims|1|1
PSG|Reims~21.09.2024|Reims|PSG|1|1
PSG|Reims~10.03.2024|PSG|Reims|2|2
PSG|Reims~11.11.2023|Reims|PSG|0|3
PSG|Reims~29.01.2023|PSG|Reims|1|1
Auxerre|St Etienne~24.01.2025|Auxerre|St Etienne|1|1
Auxerre|St Etienne~05.10.2024|St Etienne|Auxerre|3|1
Nantes|St Etienne~19.01.2025|St Etienne|Nantes|1|1
Nantes|St Etienne~29.09.2024|Nantes|St Etienne|2|2
Nantes|St Etienne~21.05.2022|Nantes|St Etienne|1|1
Nantes|St Etienne~22.12.2021|St Etienne|Nantes|0|1
Le Havre|Reims~19.01.2025|Reims|Le Havre|1|1
Le Havre|Reims~10.11.2024|Le Havre|Reims|0|3
Le Havre|Reims~25.02.2024|Le Havre|Reims|1|2
Le Havre|Reims~20.12.2023|Reims|Le Havre|1|0
Monaco|Montpellier~17.01.2025|Montpellier|Monaco|2|1
Monaco|Montpellier~28.09.2024|Monaco|Montpellier|2|1
Monaco|Montpellier~12.05.2024|Montpellier|Monaco|0|2
Monaco|Montpellier~03.12.2023|Monaco|Montpellier|2|0
Monaco|Montpellier~30.04.2023|Monaco|Montpellier|0|4
Clermont|Lorient~19.05.2024|Lorient|Clermont|5|0
Clermont|Lorient~12.11.2023|Clermont|Lorient|1|0
Clermont|Lorient~27.05.2023|Clermont|Lorient|2|0
Clermont|Lorient~28.08.2022|Lorient|Clermont|2|1
Clermont|Lorient~13.03.2022|Clermont|Lorient|0|2
Clermont|Lyon~12.05.2024|Clermont|Lyon|0|1
Clermont|Lyon~22.10.2023|Lyon|Clermont|1|2
Clermont|Lyon~14.05.2023|Clermont|Lyon|2|1
Clermont|Lyon~01.01.2023|Lyon|Clermont|0|1
Clermont|Lyon~21.05.2022|Clermont|Lyon|1|2
Clermont|Monaco~04.05.2024|Monaco|Clermont|4|1
Clermont|Monaco~13.08.2023|Clermont|Monaco|2|4
Clermont|Monaco~05.02.2023|Clermont|Monaco|0|2
Clermont|Monaco~16.10.2022|Monaco|Clermont|1|1
Clermont|Monaco~16.01.2022|Monaco|Clermont|4|0
Clermont|Reims~28.04.2024|Clermont|Reims|4|1
Clermont|Reims~20.08.2023|Reims|Clermont|2|0
Clermont|Reims~30.04.2023|Clermont|Reims|1|0
Clermont|Reims~14.08.2022|Reims|Clermont|2|4
Clermont|Reims~09.01.2022|Clermont|Reims|0|0
Clermont|Lens~20.04.2024|Lens|Clermont|1|0
Clermont|Lens~25.11.2023|Clermont|Lens|0|3
Clermont|Lens~12.03.2023|Clermont|Lens|0|4
Clermont|Lens~12.11.2022|Lens|Clermont|2|1
Clermont|Lens~19.03.2022|Lens|Clermont|3|1
Clermont|Montpellier~14.04.2024|Clermont|Montpellier|1|1
Clermont|Montpellier~29.11.2023|Montpellier|Clermont|1|1
Clermont|Montpellier~19.03.2023|Montpellier|Clermont|2|1
Clermont|Montpellier~06.11.2022|Clermont|Montpellier|1|1
Clermont|Montpellier~08.05.2022|Clermont|Montpellier|2|1
Lorient|Montpellier~07.04.2024|Montpellier|Lorient|2|0
Lorient|Montpellier~01.10.2023|Lorient|Montpellier|0|3
Lorient|Montpellier~14.05.2023|Montpellier|Lorient|1|1
Lorient|Montpellier~29.12.2022|Lorient|Montpellier|0|2
Lorient|Montpellier~20.02.2022|Lorient|Montpellier|0|1
Clermont|PSG~06.04.2024|PSG|Clermont|1|1
Clermont|PSG~30.09.2023|Clermont|PSG|0|0
Clermont|PSG~03.06.2023|PSG|Clermont|2|3
Clermont|PSG~06.08.2022|Clermont|PSG|0|5
Clermont|PSG~09.04.2022|Clermont|PSG|1|6
Clermont|Toulouse~31.03.2024|Clermont|Toulouse|0|3
Clermont|Toulouse~03.09.2023|Toulouse|Clermont|2|2
Clermont|Toulouse~05.03.2023|Toulouse|Clermont|0|1
Clermont|Toulouse~04.09.2022|Clermont|Toulouse|2|0
Clermont|Le Havre~17.03.2024|Clermont|Le Havre|2|1
Clermont|Le Havre~24.09.2023|Le Havre|Clermont|2|1
Metz|Reims~17.03.2024|Reims|Metz|2|1
Metz|Reims~03.09.2023|Metz|Reims|2|2
Metz|Reims~16.01.2022|Reims|Metz|0|1
Metz|Reims~22.08.2021|Metz|Reims|1|1
Clermont|Metz~10.03.2024|Metz|Clermont|1|0
Clermont|Metz~27.08.2023|Clermont|Metz|0|1
Clermont|Metz~17.04.2022|Metz|Clermont|1|1
Clermont|Metz~29.08.2021|Clermont|Metz|2|2
Clermont|Marseille~02.03.2024|Clermont|Marseille|1|5
Clermont|Marseille~17.12.2023|Marseille|Clermont|2|1
Clermont|Marseille~11.02.2023|Clermont|Marseille|0|2
Clermont|Marseille~31.08.2022|Marseille|Clermont|1|0
Clermont|Marseille~20.02.2022|Marseille|Clermont|0|2
Clermont|Nice~25.02.2024|Nice|Clermont|0|0
Clermont|Nice~27.10.2023|Clermont|Nice|0|1
Clermont|Nice~23.04.2023|Nice|Clermont|1|2
Clermont|Nice~21.08.2022|Clermont|Nice|1|0
Clermont|Nice~06.02.2022|Nice|Clermont|0|1
Metz|Montpellier~18.02.2024|Montpellier|Metz|3|0
Metz|Montpellier~17.12.2023|Metz|Montpellier|0|1
Metz|Montpellier~01.05.2022|Montpellier|Metz|2|2
Metz|Montpellier~01.12.2021|Metz|Montpellier|1|3
Clermont|Rennes~18.02.2024|Rennes|Clermont|3|1
Clermont|Rennes~20.12.2023|Clermont|Rennes|1|3
Clermont|Rennes~19.02.2023|Rennes|Clermont|2|0
Clermont|Rennes~11.01.2023|Clermont|Rennes|2|1
Clermont|Rennes~23.01.2022|Clermont|Rennes|2|1
Brest|Clermont~11.02.2024|Clermont|Brest|1|1
Brest|Clermont~03.12.2023|Brest|Clermont|3|0
Brest|Clermont~21.05.2023|Brest|Clermont|2|1
Brest|Clermont~23.10.2022|Clermont|Brest|1|3
Brest|Clermont~01.05.2022|Brest|Clermont|2|0
Lorient|Reims~11.02.2024|Lorient|Reims|2|0
Lorient|Reims~28.10.2023|Reims|Lorient|1|0
Lorient|Reims~01.02.2023|Reims|Lorient|4|2
Lorient|Reims~15.10.2022|Lorient|Reims|0|0
Lorient|Reims~01.05.2022|Lorient|Reims|1|2
Clermont|Lille~04.02.2024|Lille|Clermont|4|0
Clermont|Lille~10.12.2023|Clermont|Lille|0|0
Clermont|Lille~01.02.2023|Lille|Clermont|0|0
Clermont|Lille~28.12.2022|Clermont|Lille|0|2
Clermont|Lille~06.03.2022|Lille|Clermont|4|0
Clermont|Strasbourg~28.01.2024|Clermont|Strasbourg|1|1
Clermont|Strasbourg~05.11.2023|Strasbourg|Clermont|0|0
Clermont|Strasbourg~26.02.2023|Clermont|Strasbourg|1|1
Clermont|Strasbourg~11.09.2022|Strasbourg|Clermont|0|0
Clermont|Strasbourg~14.05.2022|Strasbourg|Clermont|1|0
Clermont|Nantes~14.01.2024|Nantes|Clermont|1|2
Clermont|Nantes~17.09.2023|Clermont|Nantes|0|1
Clermont|Nantes~29.01.2023|Clermont|Nantes|0|0
Clermont|Nantes~30.10.2022|Nantes|Clermont|1|1
Clermont|Nantes~03.04.2022|Clermont|Nantes|2|3
Ajaccio|Marseille~03.06.2023|Ajaccio|Marseille|1|0
Ajaccio|Marseille~08.10.2022|Marseille|Ajaccio|1|2
Ajaccio|Lens~27.05.2023|Lens|Ajaccio|3|0
Ajaccio|Lens~14.08.2022|Ajaccio|Lens|0|0
Ajaccio|Rennes~21.05.2023|Ajaccio|Rennes|0|5
Ajaccio|Rennes~21.08.2022|Rennes|Ajaccio|2|1
Rennes|Troyes~14.05.2023|Rennes|Troyes|4|0
Rennes|Troyes~04.09.2022|Troyes|Rennes|1|1
Rennes|Troyes~20.02.2022|Rennes|Troyes|4|1
Rennes|Troyes~31.10.2021|Troyes|Rennes|2|2
Ajaccio|PSG~13.05.2023|PSG|Ajaccio|5|0
Ajaccio|PSG~21.10.2022|Ajaccio|PSG|0|3
Ajaccio|Toulouse~07.05.2023|Ajaccio|Toulouse|0|0
Ajaccio|Toulouse~01.01.2023|Toulouse|Ajaccio|2|0
Auxerre|Clermont~07.05.2023|Auxerre|Clermont|1|1
Auxerre|Clermont~09.10.2022|Clermont|Auxerre|2|1
PSG|Troyes~07.05.2023|Troyes|PSG|1|3
PSG|Troyes~29.10.2022|PSG|Troyes|4|3
PSG|Troyes~08.05.2022|PSG|Troyes|2|2
PSG|Troyes~07.08.2021|Troyes|PSG|1|2
Nice|Troyes~30.04.2023|Troyes|Nice|0|1
Nice|Troyes~09.10.2022|Nice|Troyes|3|2
Nice|Troyes~24.04.2022|Nice|Troyes|1|0
Nice|Troyes~17.10.2021|Troyes|Nice|1|0
Ajaccio|Lille~29.04.2023|Lille|Ajaccio|3|0
Ajaccio|Lille~26.08.2022|Ajaccio|Lille|1|3
Ajaccio|Brest~23.04.2023|Ajaccio|Brest|0|0
Ajaccio|Brest~18.09.2022|Brest|Ajaccio|0|1
Nantes|Troyes~23.04.2023|Nantes|Troyes|2|2
Nantes|Troyes~28.12.2022|Troyes|Nantes|0|0
Nantes|Troyes~12.03.2022|Troyes|Nantes|1|0
Nantes|Troyes~03.10.2021|Nantes|Troyes|2|0
Angers|Clermont~16.04.2023|Clermont|Angers|2|1
Angers|Clermont~15.01.2023|Angers|Clermont|1|2
Angers|Clermont~24.04.2022|Clermont|Angers|2|2
Angers|Clermont~12.12.2021|Angers|Clermont|0|1
Ajaccio|Strasbourg~16.04.2023|Strasbourg|Ajaccio|3|1
Ajaccio|Strasbourg~05.11.2022|Ajaccio|Strasbourg|4|2
Ajaccio|Auxerre~09.04.2023|Ajaccio|Auxerre|0|3
Ajaccio|Auxerre~30.10.2022|Auxerre|Ajaccio|1|0
Clermont|Troyes~09.04.2023|Troyes|Clermont|0|2
Clermont|Troyes~18.09.2022|Clermont|Troyes|1|3
Clermont|Troyes~20.04.2022|Troyes|Clermont|0|1
Clermont|Troyes~15.08.2021|Clermont|Troyes|2|0
Ajaccio|Clermont~02.04.2023|Clermont|Ajaccio|2|1
Ajaccio|Clermont~02.10.2022|Ajaccio|Clermont|1|3
Auxerre|Troyes~01.04.2023|Auxerre|Troyes|1|0
Auxerre|Troyes~04.11.2022|Troyes|Auxerre|1|1
Ajaccio|Monaco~19.03.2023|Ajaccio|Monaco|0|2
Ajaccio|Monaco~15.01.2023|Monaco|Ajaccio|7|1
Brest|Troyes~19.03.2023|Troyes|Brest|2|2
Brest|Troyes~13.11.2022|Brest|Troyes|2|1
Brest|Troyes~13.02.2022|Brest|Troyes|5|1
Brest|Troyes~22.12.2021|Troyes|Brest|1|1
Ajaccio|Montpellier~12.03.2023|Ajaccio|Montpellier|0|1
Ajaccio|Montpellier~31.08.2022|Montpellier|Ajaccio|2|0
Monaco|Troyes~05.03.2023|Troyes|Monaco|2|2
Monaco|Troyes~31.08.2022|Monaco|Troyes|2|4
Monaco|Troyes~10.04.2022|Monaco|Troyes|2|1
Monaco|Troyes~29.08.2021|Troyes|Monaco|1|2
Ajaccio|Reims~05.03.2023|Reims|Ajaccio|1|0
Ajaccio|Reims~11.01.2023|Ajaccio|Reims|0|1
Ajaccio|Troyes~26.02.2023|Ajaccio|Troyes|2|1
Ajaccio|Troyes~16.10.2022|Troyes|Ajaccio|1|1
Ajaccio|Lorient~19.02.2023|Lorient|Ajaccio|3|0
Ajaccio|Lorient~04.09.2022|Ajaccio|Lorient|0|1
Montpellier|Troyes~19.02.2023|Troyes|Montpellier|0|1
Montpellier|Troyes~07.08.2022|Montpellier|Troyes|3|2
Montpellier|Troyes~19.01.2022|Montpellier|Troyes|0|1
Montpellier|Troyes~19.09.2021|Troyes|Montpellier|1|1
Reims|Troyes~12.02.2023|Reims|Troyes|4|0
Reims|Troyes~02.10.2022|Troyes|Reims|2|2
Reims|Troyes~03.04.2022|Troyes|Reims|1|0
Reims|Troyes~24.10.2021|Reims|Troyes|1|2
Ajaccio|Nice~10.02.2023|Nice|Ajaccio|3|0
Ajaccio|Nice~11.09.2022|Ajaccio|Nice|0|1
Ajaccio|Nantes~05.02.2023|Ajaccio|Nantes|0|2
Ajaccio|Nantes~13.11.2022|Nantes|Ajaccio|2|2
Lyon|Troyes~04.02.2023|Troyes|Lyon|1|3
Lyon|Troyes~19.08.2022|Lyon|Troyes|4|1
Lyon|Troyes~16.01.2022|Troyes|Lyon|0|1
Lyon|Troyes~22.09.2021|Lyon|Troyes|3|1
Ajaccio|Angers~01.02.2023|Angers|Ajaccio|1|2
Ajaccio|Angers~28.12.2022|Ajaccio|Angers|1|0
Ajaccio|Lyon~29.01.2023|Ajaccio|Lyon|0|2
Ajaccio|Lyon~05.08.2022|Lyon|Ajaccio|2|1
Bordeaux|Brest~21.05.2022|Brest|Bordeaux|2|4
Bordeaux|Brest~28.11.2021|Bordeaux|Brest|1|2
Bordeaux|Lorient~14.05.2022|Bordeaux|Lorient|0|0
Bordeaux|Lorient~24.10.2021|Lorient|Bordeaux|1|1
Angers|Bordeaux~08.05.2022|Angers|Bordeaux|4|1
Angers|Bordeaux~22.08.2021|Bordeaux|Angers|1|1
Bordeaux|Nice~01.05.2022|Bordeaux|Nice|0|1
Bordeaux|Nice~28.08.2021|Nice|Bordeaux|4|0
Bordeaux|Nantes~24.04.2022|Nantes|Bordeaux|5|3
Bordeaux|Nantes~17.10.2021|Bordeaux|Nantes|1|1
Bordeaux|St Etienne~20.04.2022|Bordeaux|St Etienne|2|2
Bordeaux|St Etienne~18.09.2021|St Etienne|Bordeaux|1|2
Bordeaux|Lyon~17.04.2022|Lyon|Bordeaux|6|1
Bordeaux|Lyon~05.12.2021|Bordeaux|Lyon|2|2
Bordeaux|Metz~10.04.2022|Bordeaux|Metz|3|1
Bordeaux|Metz~21.11.2021|Metz|Bordeaux|3|3
Lorient|St Etienne~08.04.2022|Lorient|St Etienne|6|2
Lorient|St Etienne~08.08.2021|St Etienne|Lorient|1|1
Bordeaux|Lille~02.04.2022|Lille|Bordeaux|0|0
Bordeaux|Lille~22.12.2021|Bordeaux|Lille|2|3
Bordeaux|Montpellier~20.03.2022|Bordeaux|Montpellier|0|2
Bordeaux|Montpellier~22.09.2021|Montpellier|Bordeaux|3|3
St Etienne|Troyes~18.03.2022|St Etienne|Troyes|1|1
St Etienne|Troyes~21.11.2021|Troyes|St Etienne|0|1
Bordeaux|PSG~13.03.2022|PSG|Bordeaux|3|0
Bordeaux|PSG~06.11.2021|Bordeaux|PSG|2|3
Metz|St Etienne~06.03.2022|St Etienne|Metz|1|0
Metz|St Etienne~30.10.2021|Metz|St Etienne|1|1
Bordeaux|Troyes~06.03.2022|Bordeaux|Troyes|0|2
Bordeaux|Troyes~12.12.2021|Troyes|Bordeaux|1|2
Bordeaux|Clermont~27.02.2022|Clermont|Bordeaux|1|1
Bordeaux|Clermont~08.08.2021|Bordeaux|Clermont|0|2
Bordeaux|Monaco~20.02.2022|Bordeaux|Monaco|1|1
Bordeaux|Monaco~03.10.2021|Monaco|Bordeaux|3|0
Clermont|St Etienne~13.02.2022|Clermont|St Etienne|1|2
Clermont|St Etienne~07.11.2021|St Etienne|Clermont|3|2
Bordeaux|Lens~13.02.2022|Lens|Bordeaux|3|2
Bordeaux|Lens~12.09.2021|Bordeaux|Lens|2|3
Bordeaux|Reims~06.02.2022|Reims|Bordeaux|5|0
Bordeaux|Reims~31.10.2021|Bordeaux|Reims|3|2
Metz|Troyes~06.02.2022|Troyes|Metz|0|0
Metz|Troyes~12.09.2021|Metz|Troyes|0|2
Bordeaux|Strasbourg~23.01.2022|Bordeaux|Strasbourg|4|3
Bordeaux|Strasbourg~01.12.2021|Strasbourg|Bordeaux|5|2
Bordeaux|Rennes~16.01.2022|Rennes|Bordeaux|6|0
Bordeaux|Rennes~26.09.2021|Bordeaux|Rennes|1|1
Bordeaux|Marseille~07.01.2022|Bordeaux|Marseille|0|1
Bordeaux|Marseille~15.08.2021|Marseille|Bordeaux|2|2`,L1M={"Toulouse|Strasbourg": [0.413, 0.251, 0.336], "Auxerre|Paris FC": [0.338, 0.261, 0.401], "PSG|Troyes": [0.863, 0.093, 0.044], "Rennes|Lille": [0.401, 0.254, 0.345], "Angers|Nice": [0.266, 0.277, 0.457], "Brest|Lyon": [0.338, 0.242, 0.42], "Le Havre|Lorient": [0.36, 0.272, 0.368], "Le Mans|Monaco": [0.281, 0.218, 0.501], "Lens|Marseille": [0.45, 0.24, 0.31]};
L1R.split('\n').forEach(l=>{const[h,a,x,y]=l.split('|').map((v,i)=>i<2?v:+v);[[h,a,x,y,1],[a,h,y,x,0]].forEach(([t2,o,f,c,H])=>{const g=SLG[t2]=SLG[t2]||[];g.push({w:g.length+1,H,o,f,c,r:f>c?'G':f==c?'B':'M'})})});
L1H.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
R.filter(m=>m.c=='L1'&&m.t>new Date('2026-11-05T12:00:00Z')).forEach(m=>{m.mp=L1M[m.h+'|'+m.a]});
/* NL/PT/BEL CSV */N.ERE="Eredivisie";C.ERE="#e8590c";LN.ERE="Hollanda – Eredivisie";N.POR="Portekiz Ligi";C.POR="#0b7a3b";LN.POR="Portekiz – Liga Portugal";
const ERER=`Cambuur|Excelsior|0|4
NEC Nijmegen|Telstar|1|2
Go Ahead Eagles|Willem II|4|1
PSV|Fortuna Sittard|2|2
AZ Alkmaar|ADO Den Haag|2|0
Sparta Rotterdam|Feyenoord|0|1
Groningen|Utrecht|2|1
PEC Zwolle|Ajax|0|2
Heerenveen|Twente|1|0
Telstar|Sparta Rotterdam|1|3
Willem II|NEC Nijmegen|1|4
Utrecht|AZ Alkmaar|1|4
Excelsior|PSV|1|2
Fortuna Sittard|Cambuur|3|1
ADO Den Haag|Groningen|1|4
Feyenoord|Go Ahead Eagles|2|2
Twente|PEC Zwolle|3|1
Ajax|Heerenveen|2|2
Fortuna Sittard|AZ Alkmaar|0|2
Sparta Rotterdam|Utrecht|3|3
Heerenveen|PEC Zwolle|0|2
Go Ahead Eagles|ADO Den Haag|3|1
PSV|Groningen|5|1
Cambuur|Feyenoord|2|5
Groningen|Fortuna Sittard|2|3
Excelsior|Sparta Rotterdam|2|1
AZ Alkmaar|Go Ahead Eagles|5|2
PEC Zwolle|NEC Nijmegen|1|3
Utrecht|PSV|1|6
Feyenoord|ADO Den Haag|2|2
Willem II|Heerenveen|2|2
Telstar|Ajax|0|4
Cambuur|Twente|1|4
Sparta Rotterdam|PEC Zwolle|2|2
NEC Nijmegen|Feyenoord|1|3
Ajax|PSV|1|3
Willem II|Excelsior|0|3
Groningen|Twente|2|2
Heerenveen|AZ Alkmaar|2|3
Telstar|Cambuur|2|2
ADO Den Haag|Fortuna Sittard|2|3
Utrecht|Go Ahead Eagles|3|3
NEC Nijmegen|Excelsior|2|2
Twente|Telstar|1|0
AZ Alkmaar|Willem II|1|1
Twente|ADO Den Haag|2|0
Go Ahead Eagles|Groningen|1|1
Fortuna Sittard|Ajax|1|5
Cambuur|NEC Nijmegen|3|0
Excelsior|Utrecht|1|2
Heerenveen|Telstar|0|0
PEC Zwolle|Feyenoord|0|7
PSV|Sparta Rotterdam|4|1
Ajax|Willem II|5|1
Groningen|PEC Zwolle|3|0
ADO Den Haag|Cambuur|1|1
Sparta Rotterdam|Heerenveen|0|4
Ajax|Excelsior|2|2
Willem II|Fortuna Sittard|0|1
Feyenoord|Utrecht|5|0
AZ Alkmaar|Telstar|1|0
Twente|PSV|3|2
NEC Nijmegen|Go Ahead Eagles|1|1
PSV|Heerenveen|2|0
Go Ahead Eagles|Sparta Rotterdam|3|3
Feyenoord|AZ Alkmaar|2|0
Fortuna Sittard|Twente|1|1
Ajax|NEC Nijmegen|1|1
Utrecht|Willem II|3|1
Telstar|ADO Den Haag|2|2
PEC Zwolle|Cambuur|0|1
Excelsior|Groningen|1|5
Heerenveen|Excelsior|4|0
ADO Den Haag|PSV|2|1
Telstar|Feyenoord|3|4
Sparta Rotterdam|Willem II|3|2
PEC Zwolle|Go Ahead Eagles|4|1
Cambuur|AZ Alkmaar|2|2
Groningen|Ajax|2|5
NEC Nijmegen|Fortuna Sittard|2|2
Twente|Utrecht|1|2
Go Ahead Eagles|Telstar|3|2
Utrecht|PEC Zwolle|1|1
Willem II|Cambuur|1|6
ADO Den Haag|Heerenveen|2|3
Fortuna Sittard|Excelsior|1|0
NEC Nijmegen|Groningen|2|2
PSV|Feyenoord|1|1
Sparta Rotterdam|Ajax|1|2
AZ Alkmaar|Twente|0|2
Feyenoord|Fortuna Sittard|1|1
Heerenveen|NEC Nijmegen|1|0
PSV|Willem II|7|0
Ajax|AZ Alkmaar|1|0
Cambuur|Go Ahead Eagles|4|0
PEC Zwolle|ADO Den Haag|1|0
Excelsior|Twente|0|9
Telstar|Utrecht|4|2
Groningen|Sparta Rotterdam|2|3`,EREH=`ADO Den Haag|PEC Zwolle~01.11.2026|PEC Zwolle|ADO Den Haag|1|0
Excelsior|Twente~01.11.2026|Excelsior|Twente|0|9
Excelsior|Twente~24.01.2026|Twente|Excelsior|0|0
Excelsior|Twente~30.08.2025|Excelsior|Twente|1|0
Excelsior|Twente~10.02.2024|Excelsior|Twente|0|3
Excelsior|Twente~08.12.2023|Twente|Excelsior|4|2
Telstar|Utrecht~01.11.2026|Telstar|Utrecht|4|2
Telstar|Utrecht~11.04.2026|Utrecht|Telstar|4|1
Telstar|Utrecht~23.11.2025|Telstar|Utrecht|1|1
Groningen|Sparta Rotterdam~01.11.2026|Groningen|Sparta Rotterdam|2|3
Groningen|Sparta Rotterdam~31.01.2026|Sparta Rotterdam|Groningen|2|0
Groningen|Sparta Rotterdam~19.10.2025|Groningen|Sparta Rotterdam|0|2
Groningen|Sparta Rotterdam~02.02.2025|Sparta Rotterdam|Groningen|1|0
Groningen|Sparta Rotterdam~09.11.2024|Groningen|Sparta Rotterdam|1|0
Feyenoord|Fortuna Sittard~31.10.2026|Feyenoord|Fortuna Sittard|1|1
Feyenoord|Fortuna Sittard~03.05.2026|Fortuna Sittard|Feyenoord|1|2
Feyenoord|Fortuna Sittard~17.09.2025|Feyenoord|Fortuna Sittard|2|0
Feyenoord|Fortuna Sittard~12.04.2025|Fortuna Sittard|Feyenoord|0|2
Feyenoord|Fortuna Sittard~30.11.2024|Feyenoord|Fortuna Sittard|1|1
Heerenveen|NEC Nijmegen~31.10.2026|Heerenveen|NEC Nijmegen|1|0
Heerenveen|NEC Nijmegen~22.03.2026|NEC Nijmegen|Heerenveen|2|2
Heerenveen|NEC Nijmegen~21.09.2025|Heerenveen|NEC Nijmegen|3|2
Heerenveen|NEC Nijmegen~27.04.2025|Heerenveen|NEC Nijmegen|1|0
Heerenveen|NEC Nijmegen~19.10.2024|NEC Nijmegen|Heerenveen|3|0
PSV|Willem II~31.10.2026|PSV|Willem II|7|0
PSV|Willem II~08.02.2025|PSV|Willem II|1|1
PSV|Willem II~28.09.2024|Willem II|PSV|0|2
PSV|Willem II~01.05.2022|PSV|Willem II|4|2
PSV|Willem II~25.09.2021|Willem II|PSV|2|1
AZ Alkmaar|Ajax~31.10.2026|Ajax|AZ Alkmaar|1|0
AZ Alkmaar|Ajax~08.02.2026|AZ Alkmaar|Ajax|1|1
AZ Alkmaar|Ajax~18.10.2025|Ajax|AZ Alkmaar|0|2
AZ Alkmaar|Ajax~16.03.2025|Ajax|AZ Alkmaar|2|2
AZ Alkmaar|Ajax~08.12.2024|AZ Alkmaar|Ajax|2|1
Cambuur|Go Ahead Eagles~31.10.2026|Cambuur|Go Ahead Eagles|4|0
Cambuur|Go Ahead Eagles~05.03.2023|Cambuur|Go Ahead Eagles|4|1
Cambuur|Go Ahead Eagles~09.10.2022|Go Ahead Eagles|Cambuur|0|0
Cambuur|Go Ahead Eagles~19.03.2022|Go Ahead Eagles|Cambuur|3|0
Cambuur|Go Ahead Eagles~11.09.2021|Cambuur|Go Ahead Eagles|5|2
Excelsior|Fortuna Sittard~25.10.2026|Fortuna Sittard|Excelsior|1|0
Excelsior|Fortuna Sittard~20.02.2026|Fortuna Sittard|Excelsior|2|1
Excelsior|Fortuna Sittard~19.10.2025|Excelsior|Fortuna Sittard|1|0
Excelsior|Fortuna Sittard~03.03.2024|Fortuna Sittard|Excelsior|5|2
Excelsior|Fortuna Sittard~26.08.2023|Excelsior|Fortuna Sittard|2|2
Groningen|NEC Nijmegen~25.10.2026|NEC Nijmegen|Groningen|2|2
Groningen|NEC Nijmegen~10.05.2026|Groningen|NEC Nijmegen|2|1
Groningen|NEC Nijmegen~09.11.2025|NEC Nijmegen|Groningen|2|0
Groningen|NEC Nijmegen~08.02.2025|Groningen|NEC Nijmegen|2|1
Groningen|NEC Nijmegen~03.11.2024|NEC Nijmegen|Groningen|6|0
Feyenoord|PSV~25.10.2026|PSV|Feyenoord|1|1
Feyenoord|PSV~01.02.2026|PSV|Feyenoord|3|0
Feyenoord|PSV~26.10.2025|Feyenoord|PSV|2|3
Feyenoord|PSV~11.05.2025|Feyenoord|PSV|2|3
Feyenoord|PSV~22.12.2024|PSV|Feyenoord|3|0
Ajax|Sparta Rotterdam~25.10.2026|Sparta Rotterdam|Ajax|1|2
Ajax|Sparta Rotterdam~14.03.2026|Ajax|Sparta Rotterdam|4|0
Ajax|Sparta Rotterdam~04.10.2025|Sparta Rotterdam|Ajax|3|3
Ajax|Sparta Rotterdam~27.04.2025|Ajax|Sparta Rotterdam|1|1
Ajax|Sparta Rotterdam~22.12.2024|Sparta Rotterdam|Ajax|0|2
AZ Alkmaar|Twente~25.10.2026|AZ Alkmaar|Twente|0|2
AZ Alkmaar|Twente~03.05.2026|AZ Alkmaar|Twente|2|2
AZ Alkmaar|Twente~30.11.2025|Twente|AZ Alkmaar|1|0
AZ Alkmaar|Twente~14.05.2025|Twente|AZ Alkmaar|2|3
AZ Alkmaar|Twente~21.12.2024|AZ Alkmaar|Twente|1|0
PEC Zwolle|Utrecht~24.10.2026|Utrecht|PEC Zwolle|1|1
PEC Zwolle|Utrecht~22.02.2026|Utrecht|PEC Zwolle|1|1
PEC Zwolle|Utrecht~31.08.2025|PEC Zwolle|Utrecht|0|2
PEC Zwolle|Utrecht~01.02.2025|PEC Zwolle|Utrecht|3|3
PEC Zwolle|Utrecht~11.08.2024|Utrecht|PEC Zwolle|1|0
Cambuur|Willem II~24.10.2026|Willem II|Cambuur|1|6
Cambuur|Willem II~11.05.2022|Cambuur|Willem II|1|1
Cambuur|Willem II~10.12.2021|Willem II|Cambuur|1|3
ADO Den Haag|Heerenveen~24.10.2026|ADO Den Haag|Heerenveen|2|3
Go Ahead Eagles|Telstar~23.10.2026|Go Ahead Eagles|Telstar|3|2
Go Ahead Eagles|Telstar~08.02.2026|Go Ahead Eagles|Telstar|1|1
Go Ahead Eagles|Telstar~28.09.2025|Telstar|Go Ahead Eagles|4|2
Go Ahead Eagles|PEC Zwolle~18.10.2026|PEC Zwolle|Go Ahead Eagles|4|1
Go Ahead Eagles|PEC Zwolle~05.04.2026|Go Ahead Eagles|PEC Zwolle|5|0
Go Ahead Eagles|PEC Zwolle~21.09.2025|PEC Zwolle|Go Ahead Eagles|0|2
Go Ahead Eagles|PEC Zwolle~11.05.2025|PEC Zwolle|Go Ahead Eagles|1|1
Go Ahead Eagles|PEC Zwolle~03.11.2024|Go Ahead Eagles|PEC Zwolle|2|2
AZ Alkmaar|Cambuur~18.10.2026|Cambuur|AZ Alkmaar|2|2
AZ Alkmaar|Cambuur~25.02.2023|AZ Alkmaar|Cambuur|2|1
AZ Alkmaar|Cambuur~28.08.2022|Cambuur|AZ Alkmaar|0|1
AZ Alkmaar|Cambuur~22.01.2022|AZ Alkmaar|Cambuur|0|0
AZ Alkmaar|Cambuur~03.10.2021|Cambuur|AZ Alkmaar|1|3
Ajax|Groningen~18.10.2026|Groningen|Ajax|2|5
Ajax|Groningen~07.03.2026|Groningen|Ajax|3|1
Ajax|Groningen~02.12.2025|Ajax|Groningen|2|0
Ajax|Groningen~14.05.2025|Groningen|Ajax|2|2
Ajax|Groningen~06.10.2024|Ajax|Groningen|3|1
Fortuna Sittard|NEC Nijmegen~18.10.2026|NEC Nijmegen|Fortuna Sittard|2|2
Fortuna Sittard|NEC Nijmegen~28.02.2026|NEC Nijmegen|Fortuna Sittard|2|3
Fortuna Sittard|NEC Nijmegen~31.08.2025|Fortuna Sittard|NEC Nijmegen|3|2
Fortuna Sittard|NEC Nijmegen~19.01.2025|NEC Nijmegen|Fortuna Sittard|4|1
Fortuna Sittard|NEC Nijmegen~31.08.2024|Fortuna Sittard|NEC Nijmegen|0|3
Twente|Utrecht~18.10.2026|Twente|Utrecht|1|2
Twente|Utrecht~15.03.2026|Twente|Utrecht|0|2
Twente|Utrecht~07.12.2025|Utrecht|Twente|1|1
Twente|Utrecht~11.05.2025|Twente|Utrecht|2|0
Twente|Utrecht~01.09.2024|Utrecht|Twente|2|1
ADO Den Haag|PSV~17.10.2026|ADO Den Haag|PSV|2|1
Feyenoord|Telstar~17.10.2026|Telstar|Feyenoord|3|4
Feyenoord|Telstar~22.02.2026|Feyenoord|Telstar|2|1
Feyenoord|Telstar~30.11.2025|Telstar|Feyenoord|1|2
Sparta Rotterdam|Willem II~17.10.2026|Sparta Rotterdam|Willem II|3|2
Sparta Rotterdam|Willem II~02.03.2025|Sparta Rotterdam|Willem II|4|0
Sparta Rotterdam|Willem II~31.08.2024|Willem II|Sparta Rotterdam|1|2
Sparta Rotterdam|Willem II~13.02.2022|Sparta Rotterdam|Willem II|1|0
Sparta Rotterdam|Willem II~06.11.2021|Willem II|Sparta Rotterdam|0|3
Excelsior|Heerenveen~16.10.2026|Heerenveen|Excelsior|4|0
Excelsior|Heerenveen~07.03.2026|Excelsior|Heerenveen|1|2
Excelsior|Heerenveen~04.10.2025|Heerenveen|Excelsior|2|1
Excelsior|Heerenveen~19.01.2024|Excelsior|Heerenveen|3|0
Excelsior|Heerenveen~23.09.2023|Heerenveen|Excelsior|0|3
Utrecht|Willem II~11.10.2026|Utrecht|Willem II|3|1
Utrecht|Willem II~09.03.2025|Willem II|Utrecht|2|3
Utrecht|Willem II~21.09.2024|Utrecht|Willem II|3|2
Utrecht|Willem II~15.05.2022|Willem II|Utrecht|3|0
Utrecht|Willem II~31.10.2021|Utrecht|Willem II|5|1
ADO Den Haag|Telstar~11.10.2026|Telstar|ADO Den Haag|2|2
Cambuur|PEC Zwolle~11.10.2026|PEC Zwolle|Cambuur|0|1
Cambuur|PEC Zwolle~12.02.2022|Cambuur|PEC Zwolle|3|4
Cambuur|PEC Zwolle~06.11.2021|PEC Zwolle|Cambuur|1|2
Excelsior|Groningen~11.10.2026|Excelsior|Groningen|1|5
Excelsior|Groningen~02.05.2026|Groningen|Excelsior|2|3
Excelsior|Groningen~05.12.2025|Excelsior|Groningen|0|2
Excelsior|Groningen~25.02.2023|Groningen|Excelsior|3|0
Excelsior|Groningen~08.01.2023|Excelsior|Groningen|1|0
Go Ahead Eagles|Sparta Rotterdam~10.10.2026|Go Ahead Eagles|Sparta Rotterdam|3|3
Go Ahead Eagles|Sparta Rotterdam~03.05.2026|Sparta Rotterdam|Go Ahead Eagles|2|2
Go Ahead Eagles|Sparta Rotterdam~23.08.2025|Go Ahead Eagles|Sparta Rotterdam|0|3
Go Ahead Eagles|Sparta Rotterdam~14.02.2025|Go Ahead Eagles|Sparta Rotterdam|1|0
Go Ahead Eagles|Sparta Rotterdam~15.09.2024|Sparta Rotterdam|Go Ahead Eagles|1|2
AZ Alkmaar|Feyenoord~10.10.2026|Feyenoord|AZ Alkmaar|2|0
AZ Alkmaar|Feyenoord~10.05.2026|Feyenoord|AZ Alkmaar|1|1
AZ Alkmaar|Feyenoord~21.09.2025|AZ Alkmaar|Feyenoord|3|3
AZ Alkmaar|Feyenoord~05.04.2025|AZ Alkmaar|Feyenoord|0|1
AZ Alkmaar|Feyenoord~02.11.2024|Feyenoord|AZ Alkmaar|3|2
Fortuna Sittard|Twente~10.10.2026|Fortuna Sittard|Twente|1|1
Fortuna Sittard|Twente~21.03.2026|Fortuna Sittard|Twente|1|2
Fortuna Sittard|Twente~26.09.2025|Twente|Fortuna Sittard|3|2
Fortuna Sittard|Twente~05.04.2025|Twente|Fortuna Sittard|1|1
Fortuna Sittard|Twente~23.11.2024|Fortuna Sittard|Twente|1|2
Ajax|NEC Nijmegen~10.10.2026|Ajax|NEC Nijmegen|1|1
Ajax|NEC Nijmegen~21.02.2026|Ajax|NEC Nijmegen|1|1
Ajax|NEC Nijmegen~20.12.2025|NEC Nijmegen|Ajax|2|2
Ajax|NEC Nijmegen~11.05.2025|Ajax|NEC Nijmegen|0|3
Ajax|NEC Nijmegen~01.12.2024|NEC Nijmegen|Ajax|1|2
Heerenveen|PSV~09.10.2026|PSV|Heerenveen|2|0
Heerenveen|PSV~21.02.2026|PSV|Heerenveen|3|1
Heerenveen|PSV~06.12.2025|Heerenveen|PSV|0|2
Heerenveen|PSV~08.03.2025|PSV|Heerenveen|2|1
Heerenveen|PSV~14.12.2024|Heerenveen|PSV|1|0
Feyenoord|Utrecht~20.09.2026|Feyenoord|Utrecht|5|0
Feyenoord|Utrecht~08.02.2026|Utrecht|Feyenoord|0|1
Feyenoord|Utrecht~05.10.2025|Feyenoord|Utrecht|3|2
Feyenoord|Utrecht~12.01.2025|Feyenoord|Utrecht|1|2
Feyenoord|Utrecht~27.10.2024|Utrecht|Feyenoord|0|2
AZ Alkmaar|Telstar~20.09.2026|AZ Alkmaar|Telstar|1|0
AZ Alkmaar|Telstar~25.01.2026|Telstar|AZ Alkmaar|0|1
AZ Alkmaar|Telstar~05.10.2025|AZ Alkmaar|Telstar|2|1
PSV|Twente~20.09.2026|Twente|PSV|3|2
PSV|Twente~17.05.2026|PSV|Twente|5|1
PSV|Twente~17.08.2025|Twente|PSV|0|2
PSV|Twente~24.04.2025|Twente|PSV|1|3
PSV|Twente~06.12.2024|PSV|Twente|6|1
Go Ahead Eagles|NEC Nijmegen~20.09.2026|NEC Nijmegen|Go Ahead Eagles|1|1
Go Ahead Eagles|NEC Nijmegen~17.05.2026|NEC Nijmegen|Go Ahead Eagles|2|1
Go Ahead Eagles|NEC Nijmegen~05.10.2025|Go Ahead Eagles|NEC Nijmegen|1|1
Go Ahead Eagles|NEC Nijmegen~09.03.2025|NEC Nijmegen|Go Ahead Eagles|2|3
Go Ahead Eagles|NEC Nijmegen~07.12.2024|Go Ahead Eagles|NEC Nijmegen|5|0
ADO Den Haag|Cambuur~19.09.2026|ADO Den Haag|Cambuur|1|1
Heerenveen|Sparta Rotterdam~19.09.2026|Sparta Rotterdam|Heerenveen|0|4
Heerenveen|Sparta Rotterdam~28.02.2026|Heerenveen|Sparta Rotterdam|2|1
Heerenveen|Sparta Rotterdam~14.12.2025|Sparta Rotterdam|Heerenveen|0|3
Heerenveen|Sparta Rotterdam~12.04.2025|Sparta Rotterdam|Heerenveen|3|1
Heerenveen|Sparta Rotterdam~26.10.2024|Heerenveen|Sparta Rotterdam|2|0
Ajax|Excelsior~19.09.2026|Ajax|Excelsior|2|2
Ajax|Excelsior~01.02.2026|Excelsior|Ajax|2|2
Ajax|Excelsior~22.11.2025|Ajax|Excelsior|1|2
Ajax|Excelsior~24.04.2024|Ajax|Excelsior|2|2
Ajax|Excelsior~19.08.2023|Excelsior|Ajax|2|2
Fortuna Sittard|Willem II~19.09.2026|Willem II|Fortuna Sittard|0|1
Fortuna Sittard|Willem II~27.04.2025|Fortuna Sittard|Willem II|1|0
Fortuna Sittard|Willem II~20.10.2024|Willem II|Fortuna Sittard|0|0
Fortuna Sittard|Willem II~13.03.2022|Fortuna Sittard|Willem II|1|0
Fortuna Sittard|Willem II~22.10.2021|Willem II|Fortuna Sittard|1|1
Groningen|PEC Zwolle~18.09.2026|Groningen|PEC Zwolle|3|0
Groningen|PEC Zwolle~13.03.2026|PEC Zwolle|Groningen|1|1
Groningen|PEC Zwolle~23.11.2025|Groningen|PEC Zwolle|2|2
Groningen|PEC Zwolle~18.05.2025|PEC Zwolle|Groningen|2|0
Groningen|PEC Zwolle~08.12.2024|Groningen|PEC Zwolle|0|0
Ajax|Willem II~15.09.2026|Ajax|Willem II|5|1
Ajax|Willem II~13.04.2025|Willem II|Ajax|1|2
Ajax|Willem II~27.10.2024|Ajax|Willem II|1|0
Ajax|Willem II~19.02.2022|Willem II|Ajax|0|1
Ajax|Willem II~02.12.2021|Ajax|Willem II|5|0
Excelsior|Utrecht~13.09.2026|Excelsior|Utrecht|1|2
Excelsior|Utrecht~26.04.2026|Excelsior|Utrecht|5|0
Excelsior|Utrecht~24.08.2025|Utrecht|Excelsior|4|1
Excelsior|Utrecht~27.01.2024|Excelsior|Utrecht|1|1
Excelsior|Utrecht~12.11.2023|Utrecht|Excelsior|2|2
Heerenveen|Telstar~13.09.2026|Heerenveen|Telstar|0|0
Heerenveen|Telstar~14.03.2026|Heerenveen|Telstar|3|0
Heerenveen|Telstar~19.10.2025|Telstar|Heerenveen|2|3
Feyenoord|PEC Zwolle~13.09.2026|PEC Zwolle|Feyenoord|0|7
Feyenoord|PEC Zwolle~17.05.2026|PEC Zwolle|Feyenoord|0|2
Feyenoord|PEC Zwolle~06.12.2025|Feyenoord|PEC Zwolle|6|1
Feyenoord|PEC Zwolle~25.04.2025|Feyenoord|PEC Zwolle|4|0
Feyenoord|PEC Zwolle~18.08.2024|PEC Zwolle|Feyenoord|1|5
PSV|Sparta Rotterdam~13.09.2026|PSV|Sparta Rotterdam|4|1
PSV|Sparta Rotterdam~11.04.2026|Sparta Rotterdam|PSV|0|2
PSV|Sparta Rotterdam~09.08.2025|PSV|Sparta Rotterdam|6|1
PSV|Sparta Rotterdam~18.05.2025|Sparta Rotterdam|PSV|1|3
PSV|Sparta Rotterdam~05.10.2024|PSV|Sparta Rotterdam|2|1
ADO Den Haag|Twente~12.09.2026|Twente|ADO Den Haag|2|0
Go Ahead Eagles|Groningen~12.09.2026|Go Ahead Eagles|Groningen|1|1
Go Ahead Eagles|Groningen~11.04.2026|Groningen|Go Ahead Eagles|0|0
Go Ahead Eagles|Groningen~21.12.2025|Go Ahead Eagles|Groningen|1|1
Go Ahead Eagles|Groningen~18.01.2025|Go Ahead Eagles|Groningen|2|1
Go Ahead Eagles|Groningen~29.09.2024|Groningen|Go Ahead Eagles|0|1
Ajax|Fortuna Sittard~12.09.2026|Fortuna Sittard|Ajax|1|5
Ajax|Fortuna Sittard~14.02.2026|Ajax|Fortuna Sittard|4|1
Ajax|Fortuna Sittard~06.12.2025|Fortuna Sittard|Ajax|1|3
Ajax|Fortuna Sittard~09.02.2025|Fortuna Sittard|Ajax|0|2
Ajax|Fortuna Sittard~18.09.2024|Ajax|Fortuna Sittard|5|0
Cambuur|NEC Nijmegen~12.09.2026|Cambuur|NEC Nijmegen|3|0
Cambuur|NEC Nijmegen~11.02.2023|NEC Nijmegen|Cambuur|0|0
Cambuur|NEC Nijmegen~04.11.2022|Cambuur|NEC Nijmegen|0|1
Cambuur|NEC Nijmegen~03.04.2022|Cambuur|NEC Nijmegen|1|2
Cambuur|NEC Nijmegen~26.11.2021|NEC Nijmegen|Cambuur|2|3
AZ Alkmaar|Willem II~11.09.2026|AZ Alkmaar|Willem II|1|1
AZ Alkmaar|Willem II~02.02.2025|Willem II|AZ Alkmaar|0|2
AZ Alkmaar|Willem II~10.11.2024|AZ Alkmaar|Willem II|1|2
AZ Alkmaar|Willem II~20.03.2022|Willem II|AZ Alkmaar|2|2
AZ Alkmaar|Willem II~18.12.2021|AZ Alkmaar|Willem II|4|1
Telstar|Twente~09.09.2026|Twente|Telstar|1|0
Telstar|Twente~15.02.2026|Telstar|Twente|1|1
Telstar|Twente~07.11.2025|Twente|Telstar|0|0
Go Ahead Eagles|Utrecht~08.09.2026|Utrecht|Go Ahead Eagles|3|3
Go Ahead Eagles|Utrecht~22.03.2026|Utrecht|Go Ahead Eagles|2|0
Go Ahead Eagles|Utrecht~30.11.2025|Go Ahead Eagles|Utrecht|2|2
Go Ahead Eagles|Utrecht~06.04.2025|Go Ahead Eagles|Utrecht|2|2
Go Ahead Eagles|Utrecht~15.12.2024|Utrecht|Go Ahead Eagles|3|3
Excelsior|NEC Nijmegen~08.09.2026|NEC Nijmegen|Excelsior|2|2
Excelsior|NEC Nijmegen~04.04.2026|Excelsior|NEC Nijmegen|0|2
Excelsior|NEC Nijmegen~09.08.2025|NEC Nijmegen|Excelsior|5|0
Excelsior|NEC Nijmegen~06.05.2024|Excelsior|NEC Nijmegen|0|3
Excelsior|NEC Nijmegen~13.08.2023|NEC Nijmegen|Excelsior|3|4
Groningen|Twente~06.09.2026|Groningen|Twente|2|2
Groningen|Twente~22.02.2026|Twente|Groningen|2|1
Groningen|Twente~02.11.2025|Groningen|Twente|1|1
Groningen|Twente~01.03.2025|Groningen|Twente|1|1
Groningen|Twente~15.12.2024|Twente|Groningen|2|0
AZ Alkmaar|Heerenveen~06.09.2026|Heerenveen|AZ Alkmaar|2|3
AZ Alkmaar|Heerenveen~12.04.2026|AZ Alkmaar|Heerenveen|3|0
AZ Alkmaar|Heerenveen~23.11.2025|Heerenveen|AZ Alkmaar|3|1
AZ Alkmaar|Heerenveen~02.03.2025|Heerenveen|AZ Alkmaar|3|1
AZ Alkmaar|Heerenveen~14.09.2024|AZ Alkmaar|Heerenveen|9|1
Cambuur|Telstar~06.09.2026|Telstar|Cambuur|2|2
ADO Den Haag|Fortuna Sittard~06.09.2026|ADO Den Haag|Fortuna Sittard|2|3
Feyenoord|NEC Nijmegen~05.09.2026|NEC Nijmegen|Feyenoord|1|3
Feyenoord|NEC Nijmegen~12.04.2026|NEC Nijmegen|Feyenoord|1|1
Feyenoord|NEC Nijmegen~23.11.2025|Feyenoord|NEC Nijmegen|2|4
Feyenoord|NEC Nijmegen~01.03.2025|Feyenoord|NEC Nijmegen|0|0
Feyenoord|NEC Nijmegen~28.09.2024|NEC Nijmegen|Feyenoord|1|1
Ajax|PSV~05.09.2026|Ajax|PSV|1|3
Ajax|PSV~02.05.2026|Ajax|PSV|2|2
Ajax|PSV~21.09.2025|PSV|Ajax|2|2
Ajax|PSV~30.03.2025|PSV|Ajax|0|2
Ajax|PSV~02.11.2024|Ajax|PSV|3|2
Excelsior|Willem II~05.09.2026|Willem II|Excelsior|0|3
PEC Zwolle|Sparta Rotterdam~04.09.2026|Sparta Rotterdam|PEC Zwolle|2|2
PEC Zwolle|Sparta Rotterdam~08.03.2026|Sparta Rotterdam|PEC Zwolle|1|1
PEC Zwolle|Sparta Rotterdam~08.11.2025|PEC Zwolle|Sparta Rotterdam|1|0
PEC Zwolle|Sparta Rotterdam~15.03.2025|Sparta Rotterdam|PEC Zwolle|1|1
PEC Zwolle|Sparta Rotterdam~30.11.2024|PEC Zwolle|Sparta Rotterdam|1|0
PSV|Utrecht~30.08.2026|Utrecht|PSV|1|6
PSV|Utrecht~04.04.2026|PSV|Utrecht|4|3
PSV|Utrecht~21.12.2025|Utrecht|PSV|1|2
PSV|Utrecht~15.02.2025|PSV|Utrecht|2|2
PSV|Utrecht~01.12.2024|Utrecht|PSV|2|5
ADO Den Haag|Feyenoord~30.08.2026|Feyenoord|ADO Den Haag|2|2
Heerenveen|Willem II~30.08.2026|Willem II|Heerenveen|2|2
Heerenveen|Willem II~04.04.2025|Heerenveen|Willem II|3|1
Heerenveen|Willem II~08.12.2024|Willem II|Heerenveen|1|2
Heerenveen|Willem II~05.03.2022|Willem II|Heerenveen|0|0
Heerenveen|Willem II~21.11.2021|Heerenveen|Willem II|2|1
Ajax|Telstar~30.08.2026|Telstar|Ajax|0|4
Ajax|Telstar~11.01.2026|Telstar|Ajax|2|3
Ajax|Telstar~10.08.2025|Ajax|Telstar|2|0
Cambuur|Twente~30.08.2026|Cambuur|Twente|1|4
Cambuur|Twente~09.04.2023|Twente|Cambuur|4|0
Cambuur|Twente~23.10.2022|Cambuur|Twente|0|1
Cambuur|Twente~06.03.2022|Twente|Cambuur|1|0
Cambuur|Twente~28.08.2021|Cambuur|Twente|2|0
Excelsior|Sparta Rotterdam~29.08.2026|Excelsior|Sparta Rotterdam|2|1
Excelsior|Sparta Rotterdam~17.05.2026|Sparta Rotterdam|Excelsior|2|3
Excelsior|Sparta Rotterdam~14.09.2025|Excelsior|Sparta Rotterdam|0|1
Excelsior|Sparta Rotterdam~17.02.2024|Sparta Rotterdam|Excelsior|4|2
Excelsior|Sparta Rotterdam~01.10.2023|Excelsior|Sparta Rotterdam|2|1
AZ Alkmaar|Go Ahead Eagles~29.08.2026|AZ Alkmaar|Go Ahead Eagles|5|2
AZ Alkmaar|Go Ahead Eagles~23.04.2026|Go Ahead Eagles|AZ Alkmaar|0|0
AZ Alkmaar|Go Ahead Eagles~07.12.2025|AZ Alkmaar|Go Ahead Eagles|2|2
AZ Alkmaar|Go Ahead Eagles~04.05.2025|Go Ahead Eagles|AZ Alkmaar|0|3
AZ Alkmaar|Go Ahead Eagles~27.10.2024|AZ Alkmaar|Go Ahead Eagles|2|2
NEC Nijmegen|PEC Zwolle~29.08.2026|PEC Zwolle|NEC Nijmegen|1|3
NEC Nijmegen|PEC Zwolle~24.01.2026|NEC Nijmegen|PEC Zwolle|2|1
NEC Nijmegen|PEC Zwolle~25.10.2025|PEC Zwolle|NEC Nijmegen|2|2
NEC Nijmegen|PEC Zwolle~11.01.2025|PEC Zwolle|NEC Nijmegen|0|1
NEC Nijmegen|PEC Zwolle~24.08.2024|NEC Nijmegen|PEC Zwolle|1|0
Fortuna Sittard|Groningen~28.08.2026|Groningen|Fortuna Sittard|2|3
Fortuna Sittard|Groningen~25.01.2026|Groningen|Fortuna Sittard|1|2
Fortuna Sittard|Groningen~25.10.2025|Fortuna Sittard|Groningen|1|2
Fortuna Sittard|Groningen~16.03.2025|Groningen|Fortuna Sittard|1|0
Fortuna Sittard|Groningen~26.10.2024|Fortuna Sittard|Groningen|1|0
ADO Den Haag|Go Ahead Eagles~23.08.2026|Go Ahead Eagles|ADO Den Haag|3|1
Groningen|PSV~23.08.2026|PSV|Groningen|5|1
Groningen|PSV~08.02.2026|Groningen|PSV|1|2
Groningen|PSV~23.08.2025|PSV|Groningen|4|2
Groningen|PSV~05.04.2025|Groningen|PSV|1|3
Groningen|PSV~23.11.2024|PSV|Groningen|5|0
Cambuur|Feyenoord~23.08.2026|Cambuur|Feyenoord|2|5
Cambuur|Feyenoord~16.04.2023|Cambuur|Feyenoord|0|3
Cambuur|Feyenoord~10.11.2022|Feyenoord|Cambuur|1|0
Cambuur|Feyenoord~20.02.2022|Feyenoord|Cambuur|3|1
Cambuur|Feyenoord~24.10.2021|Cambuur|Feyenoord|2|3
AZ Alkmaar|Fortuna Sittard~22.08.2026|Fortuna Sittard|AZ Alkmaar|0|2
AZ Alkmaar|Fortuna Sittard~04.04.2026|AZ Alkmaar|Fortuna Sittard|2|0
AZ Alkmaar|Fortuna Sittard~21.12.2025|Fortuna Sittard|AZ Alkmaar|4|3
AZ Alkmaar|Fortuna Sittard~23.02.2025|AZ Alkmaar|Fortuna Sittard|1|0
AZ Alkmaar|Fortuna Sittard~06.10.2024|Fortuna Sittard|AZ Alkmaar|1|0
Sparta Rotterdam|Utrecht~22.08.2026|Sparta Rotterdam|Utrecht|3|3
Sparta Rotterdam|Utrecht~25.01.2026|Utrecht|Sparta Rotterdam|0|1
Sparta Rotterdam|Utrecht~17.08.2025|Sparta Rotterdam|Utrecht|2|1
Sparta Rotterdam|Utrecht~14.05.2025|Utrecht|Sparta Rotterdam|1|1
Sparta Rotterdam|Utrecht~03.11.2024|Sparta Rotterdam|Utrecht|1|4
Heerenveen|PEC Zwolle~22.08.2026|Heerenveen|PEC Zwolle|0|2
Heerenveen|PEC Zwolle~15.02.2026|Heerenveen|PEC Zwolle|4|2
Heerenveen|PEC Zwolle~28.11.2025|PEC Zwolle|Heerenveen|2|1
Heerenveen|PEC Zwolle~16.02.2025|PEC Zwolle|Heerenveen|1|1
Heerenveen|PEC Zwolle~06.10.2024|Heerenveen|PEC Zwolle|1|1
ADO Den Haag|Groningen~16.08.2026|ADO Den Haag|Groningen|1|4
Feyenoord|Go Ahead Eagles~16.08.2026|Feyenoord|Go Ahead Eagles|2|2
Feyenoord|Go Ahead Eagles~15.02.2026|Feyenoord|Go Ahead Eagles|1|0
Feyenoord|Go Ahead Eagles~09.11.2025|Go Ahead Eagles|Feyenoord|2|1
Feyenoord|Go Ahead Eagles~30.03.2025|Feyenoord|Go Ahead Eagles|3|2
Feyenoord|Go Ahead Eagles~19.10.2024|Go Ahead Eagles|Feyenoord|1|5
PEC Zwolle|Twente~16.08.2026|Twente|PEC Zwolle|3|1
PEC Zwolle|Twente~10.01.2026|Twente|PEC Zwolle|1|1
PEC Zwolle|Twente~10.08.2025|PEC Zwolle|Twente|1|0
PEC Zwolle|Twente~13.04.2025|PEC Zwolle|Twente|1|1
PEC Zwolle|Twente~14.09.2024|Twente|PEC Zwolle|1|1
Ajax|Heerenveen~16.08.2026|Ajax|Heerenveen|2|2
Ajax|Heerenveen~17.05.2026|Heerenveen|Ajax|0|0
Ajax|Heerenveen~01.11.2025|Ajax|Heerenveen|1|1
Ajax|Heerenveen~19.01.2025|Heerenveen|Ajax|0|2
Ajax|Heerenveen~11.08.2024|Ajax|Heerenveen|1|0
NEC Nijmegen|Willem II~15.08.2026|Willem II|NEC Nijmegen|1|4
NEC Nijmegen|Willem II~03.05.2025|NEC Nijmegen|Willem II|1|1
NEC Nijmegen|Willem II~22.12.2024|Willem II|NEC Nijmegen|4|1
NEC Nijmegen|Willem II~22.12.2021|Willem II|NEC Nijmegen|0|1
NEC Nijmegen|Willem II~12.09.2021|NEC Nijmegen|Willem II|0|0
AZ Alkmaar|Utrecht~15.08.2026|Utrecht|AZ Alkmaar|1|4
AZ Alkmaar|Utrecht~01.03.2026|Utrecht|AZ Alkmaar|2|0
AZ Alkmaar|Utrecht~26.10.2025|AZ Alkmaar|Utrecht|4|1
AZ Alkmaar|Utrecht~18.01.2025|Utrecht|AZ Alkmaar|0|0
AZ Alkmaar|Utrecht~29.09.2024|AZ Alkmaar|Utrecht|1|2
Excelsior|PSV~15.08.2026|Excelsior|PSV|1|2
Excelsior|PSV~10.01.2026|PSV|Excelsior|5|1
Excelsior|PSV~27.09.2025|Excelsior|PSV|1|2
Excelsior|PSV~02.04.2024|Excelsior|PSV|0|2
Excelsior|PSV~13.01.2024|PSV|Excelsior|3|1
Cambuur|Fortuna Sittard~15.08.2026|Fortuna Sittard|Cambuur|3|1
Cambuur|Fortuna Sittard~29.01.2023|Cambuur|Fortuna Sittard|1|2
Cambuur|Fortuna Sittard~20.08.2022|Fortuna Sittard|Cambuur|1|4
Cambuur|Fortuna Sittard~26.02.2022|Cambuur|Fortuna Sittard|2|1
Cambuur|Fortuna Sittard~16.10.2021|Fortuna Sittard|Cambuur|1|0
Sparta Rotterdam|Telstar~14.08.2026|Telstar|Sparta Rotterdam|1|3
Sparta Rotterdam|Telstar~22.04.2026|Telstar|Sparta Rotterdam|4|1
Sparta Rotterdam|Telstar~25.10.2025|Sparta Rotterdam|Telstar|1|0
Feyenoord|Sparta Rotterdam~09.08.2026|Sparta Rotterdam|Feyenoord|0|1
Feyenoord|Sparta Rotterdam~18.01.2026|Feyenoord|Sparta Rotterdam|3|4
Feyenoord|Sparta Rotterdam~31.08.2025|Sparta Rotterdam|Feyenoord|0|4
Feyenoord|Sparta Rotterdam~08.02.2025|Feyenoord|Sparta Rotterdam|3|0
Feyenoord|Sparta Rotterdam~25.08.2024|Sparta Rotterdam|Feyenoord|1|1
Groningen|Utrecht~09.08.2026|Groningen|Utrecht|2|1
Groningen|Utrecht~14.02.2026|Groningen|Utrecht|1|2
Groningen|Utrecht~14.09.2025|Utrecht|Groningen|0|1
Groningen|Utrecht~13.04.2025|Utrecht|Groningen|3|1
Groningen|Utrecht~20.10.2024|Groningen|Utrecht|0|1
Ajax|PEC Zwolle~09.08.2026|PEC Zwolle|Ajax|0|2
Ajax|PEC Zwolle~01.03.2026|PEC Zwolle|Ajax|0|0
Ajax|PEC Zwolle~13.09.2025|Ajax|PEC Zwolle|3|1
Ajax|PEC Zwolle~09.03.2025|PEC Zwolle|Ajax|0|1
Ajax|PEC Zwolle~24.11.2024|Ajax|PEC Zwolle|2|0
Heerenveen|Twente~09.08.2026|Heerenveen|Twente|1|0
Heerenveen|Twente~07.02.2026|Twente|Heerenveen|5|0
Heerenveen|Twente~24.08.2025|Heerenveen|Twente|1|2
Heerenveen|Twente~09.02.2025|Heerenveen|Twente|3|3
Heerenveen|Twente~17.09.2024|Twente|Heerenveen|2|0
NEC Nijmegen|Telstar~08.08.2026|NEC Nijmegen|Telstar|1|2
NEC Nijmegen|Telstar~02.05.2026|NEC Nijmegen|Telstar|1|1
NEC Nijmegen|Telstar~13.12.2025|Telstar|NEC Nijmegen|2|2
Go Ahead Eagles|Willem II~08.08.2026|Go Ahead Eagles|Willem II|4|1
Go Ahead Eagles|Willem II~16.03.2025|Go Ahead Eagles|Willem II|1|0
Go Ahead Eagles|Willem II~18.08.2024|Willem II|Go Ahead Eagles|2|0
Go Ahead Eagles|Willem II~08.04.2022|Go Ahead Eagles|Willem II|4|0
Go Ahead Eagles|Willem II~27.11.2021|Willem II|Go Ahead Eagles|0|1
Fortuna Sittard|PSV~08.08.2026|PSV|Fortuna Sittard|2|2
Fortuna Sittard|PSV~17.01.2026|Fortuna Sittard|PSV|1|2
Fortuna Sittard|PSV~31.10.2025|PSV|Fortuna Sittard|5|2
Fortuna Sittard|PSV~03.05.2025|PSV|Fortuna Sittard|4|1
Fortuna Sittard|PSV~22.09.2024|Fortuna Sittard|PSV|1|3
ADO Den Haag|AZ Alkmaar~08.08.2026|AZ Alkmaar|ADO Den Haag|2|0
Cambuur|Excelsior~07.08.2026|Cambuur|Excelsior|0|4
Cambuur|Excelsior~19.03.2023|Excelsior|Cambuur|4|1
Cambuur|Excelsior~06.08.2022|Cambuur|Excelsior|0|2
AZ Alkmaar|NAC Breda~17.05.2026|AZ Alkmaar|NAC Breda|3|3
AZ Alkmaar|NAC Breda~31.08.2025|NAC Breda|AZ Alkmaar|0|1
AZ Alkmaar|NAC Breda~24.04.2025|AZ Alkmaar|NAC Breda|1|1
AZ Alkmaar|NAC Breda~15.12.2024|NAC Breda|AZ Alkmaar|1|2
Groningen|Heracles~17.05.2026|Heracles|Groningen|1|2
Groningen|Heracles~29.08.2025|Groningen|Heracles|4|0
Groningen|Heracles~23.04.2025|Groningen|Heracles|4|1
Groningen|Heracles~28.01.2025|Heracles|Groningen|1|1
Groningen|Heracles~24.04.2022|Groningen|Heracles|0|1
Fortuna Sittard|Utrecht~17.05.2026|Utrecht|Fortuna Sittard|2|0
Fortuna Sittard|Utrecht~20.09.2025|Fortuna Sittard|Utrecht|1|0
Fortuna Sittard|Utrecht~18.05.2025|Fortuna Sittard|Utrecht|0|0
Fortuna Sittard|Utrecht~22.12.2024|Utrecht|Fortuna Sittard|2|5
Fortuna Sittard|Utrecht~11.02.2024|Utrecht|Fortuna Sittard|4|0
Telstar|Volendam~17.05.2026|Volendam|Telstar|1|2
Telstar|Volendam~23.08.2025|Telstar|Volendam|2|2
Ajax|Utrecht~10.05.2026|Ajax|Utrecht|1|2
Ajax|Utrecht~09.11.2025|Utrecht|Ajax|2|1
Ajax|Utrecht~20.04.2025|Utrecht|Ajax|4|0
Ajax|Utrecht~04.12.2024|Ajax|Utrecht|2|2
Ajax|Utrecht~03.03.2024|Ajax|Utrecht|2|0
Excelsior|Volendam~10.05.2026|Excelsior|Volendam|1|1
Excelsior|Volendam~20.09.2025|Volendam|Excelsior|1|2
Excelsior|Volendam~12.04.2024|Excelsior|Volendam|4|0
Excelsior|Volendam~29.10.2023|Volendam|Excelsior|3|1
Excelsior|Volendam~28.05.2023|Volendam|Excelsior|3|2
Fortuna Sittard|PEC Zwolle~10.05.2026|Fortuna Sittard|PEC Zwolle|3|2
Fortuna Sittard|PEC Zwolle~13.12.2025|PEC Zwolle|Fortuna Sittard|1|0
Fortuna Sittard|PEC Zwolle~26.01.2025|Fortuna Sittard|PEC Zwolle|1|4
Fortuna Sittard|PEC Zwolle~09.11.2024|PEC Zwolle|Fortuna Sittard|3|1
Fortuna Sittard|PEC Zwolle~16.03.2024|Fortuna Sittard|PEC Zwolle|3|1
Go Ahead Eagles|PSV~10.05.2026|Go Ahead Eagles|PSV|1|4
Go Ahead Eagles|PSV~18.10.2025|PSV|Go Ahead Eagles|2|1
Go Ahead Eagles|PSV~01.03.2025|Go Ahead Eagles|PSV|3|2
Go Ahead Eagles|PSV~01.09.2024|PSV|Go Ahead Eagles|3|0
Go Ahead Eagles|PSV~08.03.2024|Go Ahead Eagles|PSV|0|1
Heerenveen|NAC Breda~10.05.2026|NAC Breda|Heerenveen|2|0
Heerenveen|NAC Breda~24.10.2025|Heerenveen|NAC Breda|3|3
Heerenveen|NAC Breda~12.01.2025|NAC Breda|Heerenveen|2|4
Heerenveen|NAC Breda~31.08.2024|Heerenveen|NAC Breda|4|0
Heracles|Telstar~10.05.2026|Telstar|Heracles|3|0
Heracles|Telstar~06.12.2025|Heracles|Telstar|1|1
Sparta Rotterdam|Twente~10.05.2026|Twente|Sparta Rotterdam|4|0
Sparta Rotterdam|Twente~19.09.2025|Sparta Rotterdam|Twente|1|5
Sparta Rotterdam|Twente~04.05.2025|Sparta Rotterdam|Twente|0|2
Sparta Rotterdam|Twente~17.08.2024|Twente|Sparta Rotterdam|1|1
Sparta Rotterdam|Twente~09.03.2024|Twente|Sparta Rotterdam|2|1
Heerenveen|Volendam~03.05.2026|Volendam|Heerenveen|0|2
Heerenveen|Volendam~09.08.2025|Heerenveen|Volendam|1|1
Heerenveen|Volendam~25.02.2024|Volendam|Heerenveen|0|4
Heerenveen|Volendam~16.12.2023|Heerenveen|Volendam|1|2
Heerenveen|Volendam~08.04.2023|Heerenveen|Volendam|2|1
Heracles|PEC Zwolle~03.05.2026|PEC Zwolle|Heracles|1|0
Heracles|PEC Zwolle~02.11.2025|Heracles|PEC Zwolle|8|2
Heracles|PEC Zwolle~02.03.2025|Heracles|PEC Zwolle|4|2
Heracles|PEC Zwolle~01.09.2024|PEC Zwolle|Heracles|3|0
Heracles|PEC Zwolle~28.04.2024|PEC Zwolle|Heracles|3|1
NAC Breda|Utrecht~02.05.2026|Utrecht|NAC Breda|2|0
NAC Breda|Utrecht~14.12.2025|NAC Breda|Utrecht|1|1
NAC Breda|Utrecht~01.03.2025|Utrecht|NAC Breda|1|0
NAC Breda|Utrecht~24.08.2024|NAC Breda|Utrecht|1|2
Heracles|Volendam~26.04.2026|Heracles|Volendam|0|2
Heracles|Volendam~25.10.2025|Volendam|Heracles|3|0
Heracles|Volendam~20.01.2024|Heracles|Volendam|1|1
Heracles|Volendam~23.09.2023|Volendam|Heracles|2|2
Feyenoord|Groningen~25.04.2026|Feyenoord|Groningen|3|1
Feyenoord|Groningen~28.09.2025|Groningen|Feyenoord|0|1
Feyenoord|Groningen~02.04.2025|Feyenoord|Groningen|4|1
Feyenoord|Groningen~14.09.2024|Groningen|Feyenoord|2|2
Feyenoord|Groningen~04.03.2023|Feyenoord|Groningen|1|0
Fortuna Sittard|Heerenveen~25.04.2026|Heerenveen|Fortuna Sittard|2|1
Fortuna Sittard|Heerenveen~08.11.2025|Fortuna Sittard|Heerenveen|2|0
Fortuna Sittard|Heerenveen~01.02.2025|Heerenveen|Fortuna Sittard|2|2
Fortuna Sittard|Heerenveen~02.11.2024|Fortuna Sittard|Heerenveen|3|0
Fortuna Sittard|Heerenveen~03.02.2024|Fortuna Sittard|Heerenveen|3|3
Ajax|NAC Breda~25.04.2026|NAC Breda|Ajax|0|2
Ajax|NAC Breda~27.09.2025|Ajax|NAC Breda|2|1
Ajax|NAC Breda~06.04.2025|Ajax|NAC Breda|3|1
Ajax|NAC Breda~18.08.2024|NAC Breda|Ajax|2|1
NEC Nijmegen|Twente~25.04.2026|Twente|NEC Nijmegen|1|1
NEC Nijmegen|Twente~18.10.2025|NEC Nijmegen|Twente|3|3
NEC Nijmegen|Twente~23.02.2025|Twente|NEC Nijmegen|2|0
NEC Nijmegen|Twente~10.08.2024|NEC Nijmegen|Twente|1|2
NEC Nijmegen|Twente~20.01.2024|NEC Nijmegen|Twente|1|0
PEC Zwolle|PSV~23.04.2026|PSV|PEC Zwolle|6|1
PEC Zwolle|PSV~04.10.2025|PEC Zwolle|PSV|0|4
PEC Zwolle|PSV~18.01.2025|PEC Zwolle|PSV|3|1
PEC Zwolle|PSV~26.10.2024|PSV|PEC Zwolle|6|0
PEC Zwolle|PSV~24.02.2024|PEC Zwolle|PSV|1|7
Fortuna Sittard|NAC Breda~12.04.2026|Fortuna Sittard|NAC Breda|1|1
Fortuna Sittard|NAC Breda~17.08.2025|NAC Breda|Fortuna Sittard|2|1
Fortuna Sittard|NAC Breda~10.05.2025|Fortuna Sittard|NAC Breda|1|0
Fortuna Sittard|NAC Breda~14.09.2024|NAC Breda|Fortuna Sittard|1|0
Excelsior|PEC Zwolle~12.04.2026|PEC Zwolle|Excelsior|2|2
Excelsior|PEC Zwolle~20.12.2025|Excelsior|PEC Zwolle|2|1
Excelsior|PEC Zwolle~06.04.2024|PEC Zwolle|Excelsior|2|1
Excelsior|PEC Zwolle~22.10.2023|Excelsior|PEC Zwolle|2|4
Ajax|Heracles~11.04.2026|Heracles|Ajax|0|3
Ajax|Heracles~24.08.2025|Ajax|Heracles|2|0
Ajax|Heracles~16.02.2025|Ajax|Heracles|4|0
Ajax|Heracles~20.10.2024|Heracles|Ajax|3|4
Ajax|Heracles~27.01.2024|Heracles|Ajax|2|4
Twente|Volendam~10.04.2026|Twente|Volendam|2|1
Twente|Volendam~22.11.2025|Volendam|Twente|1|1
Twente|Volendam~12.05.2024|Twente|Volendam|7|2
Twente|Volendam~03.09.2023|Volendam|Twente|0|2
Twente|Volendam~12.02.2023|Twente|Volendam|3|0
Heerenveen|Heracles~05.04.2026|Heerenveen|Heracles|4|1
Heerenveen|Heracles~20.12.2025|Heracles|Heerenveen|0|3
Heerenveen|Heracles~15.03.2025|Heerenveen|Heracles|1|1
Heerenveen|Heracles~27.09.2024|Heracles|Heerenveen|2|1
Heerenveen|Heracles~14.04.2024|Heracles|Heerenveen|0|2
Feyenoord|Volendam~05.04.2026|Volendam|Feyenoord|0|0
Feyenoord|Volendam~01.11.2025|Feyenoord|Volendam|3|1
Feyenoord|Volendam~04.04.2024|Volendam|Feyenoord|0|0
Feyenoord|Volendam~07.12.2023|Feyenoord|Volendam|3|1
Feyenoord|Volendam~12.03.2023|Feyenoord|Volendam|2|1
NAC Breda|Sparta Rotterdam~05.04.2026|NAC Breda|Sparta Rotterdam|0|0
NAC Breda|Sparta Rotterdam~07.12.2025|Sparta Rotterdam|NAC Breda|1|0
NAC Breda|Sparta Rotterdam~07.03.2025|NAC Breda|Sparta Rotterdam|1|1
NAC Breda|Sparta Rotterdam~07.12.2024|Sparta Rotterdam|NAC Breda|0|2
Groningen|Telstar~04.04.2026|Telstar|Groningen|0|2
Groningen|Telstar~20.09.2025|Groningen|Telstar|2|0
Ajax|Twente~04.04.2026|Ajax|Twente|1|2
Ajax|Twente~26.10.2025|Twente|Ajax|2|3
Ajax|Twente~18.05.2025|Ajax|Twente|2|0
Ajax|Twente~10.11.2024|Twente|Ajax|2|2
Ajax|Twente~14.04.2024|Ajax|Twente|2|1
Ajax|Feyenoord~22.03.2026|Feyenoord|Ajax|1|1
Ajax|Feyenoord~14.12.2025|Ajax|Feyenoord|2|0
Ajax|Feyenoord~02.02.2025|Ajax|Feyenoord|2|1
Ajax|Feyenoord~30.10.2024|Feyenoord|Ajax|0|2
Ajax|Feyenoord~07.04.2024|Feyenoord|Ajax|6|0
AZ Alkmaar|Groningen~22.03.2026|Groningen|AZ Alkmaar|3|0
AZ Alkmaar|Groningen~10.08.2025|AZ Alkmaar|Groningen|4|1
AZ Alkmaar|Groningen~11.05.2025|AZ Alkmaar|Groningen|3|0
AZ Alkmaar|Groningen~25.08.2024|Groningen|AZ Alkmaar|0|0
AZ Alkmaar|Groningen~11.03.2023|AZ Alkmaar|Groningen|1|0
PSV|Telstar~22.03.2026|Telstar|PSV|3|1
PSV|Telstar~30.08.2025|PSV|Telstar|0|2
Sparta Rotterdam|Volendam~21.03.2026|Sparta Rotterdam|Volendam|2|0
Sparta Rotterdam|Volendam~21.12.2025|Volendam|Sparta Rotterdam|0|1
Sparta Rotterdam|Volendam~28.04.2024|Sparta Rotterdam|Volendam|1|0
Sparta Rotterdam|Volendam~12.11.2023|Volendam|Sparta Rotterdam|1|4
Sparta Rotterdam|Volendam~13.05.2023|Volendam|Sparta Rotterdam|2|1
NAC Breda|PEC Zwolle~21.03.2026|PEC Zwolle|NAC Breda|2|1
NAC Breda|PEC Zwolle~18.10.2025|NAC Breda|PEC Zwolle|2|2
NAC Breda|PEC Zwolle~04.05.2025|NAC Breda|PEC Zwolle|1|3
NAC Breda|PEC Zwolle~20.10.2024|PEC Zwolle|NAC Breda|1|2
Excelsior|Heracles~20.03.2026|Heracles|Excelsior|1|1
Excelsior|Heracles~08.11.2025|Excelsior|Heracles|1|2
Excelsior|Heracles~12.05.2024|Excelsior|Heracles|4|0
Excelsior|Heracles~02.09.2023|Heracles|Excelsior|3|1
AZ Alkmaar|Heracles~15.03.2026|AZ Alkmaar|Heracles|4|0
AZ Alkmaar|Heracles~14.09.2025|Heracles|AZ Alkmaar|1|2
AZ Alkmaar|Heracles~13.04.2025|Heracles|AZ Alkmaar|1|0
AZ Alkmaar|Heracles~01.12.2024|AZ Alkmaar|Heracles|1|0
AZ Alkmaar|Heracles~03.04.2024|Heracles|AZ Alkmaar|5|0
Excelsior|Feyenoord~15.03.2026|Feyenoord|Excelsior|2|1
Excelsior|Feyenoord~16.08.2025|Excelsior|Feyenoord|1|2
Excelsior|Feyenoord~19.05.2024|Feyenoord|Excelsior|4|0
Excelsior|Feyenoord~25.11.2023|Excelsior|Feyenoord|2|4
Excelsior|Feyenoord~07.05.2023|Excelsior|Feyenoord|0|2
Go Ahead Eagles|NAC Breda~15.03.2026|Go Ahead Eagles|NAC Breda|6|0
Go Ahead Eagles|NAC Breda~01.11.2025|NAC Breda|Go Ahead Eagles|1|0
Go Ahead Eagles|NAC Breda~12.04.2025|NAC Breda|Go Ahead Eagles|1|1
Go Ahead Eagles|NAC Breda~21.12.2024|Go Ahead Eagles|NAC Breda|2|1
Fortuna Sittard|Volendam~14.03.2026|Volendam|Fortuna Sittard|1|2
Fortuna Sittard|Volendam~04.10.2025|Fortuna Sittard|Volendam|1|0
Fortuna Sittard|Volendam~28.01.2024|Volendam|Fortuna Sittard|0|1
Fortuna Sittard|Volendam~16.09.2023|Fortuna Sittard|Volendam|3|1
Fortuna Sittard|Volendam~17.03.2023|Volendam|Fortuna Sittard|2|1
NEC Nijmegen|PSV~14.03.2026|PSV|NEC Nijmegen|2|3
NEC Nijmegen|PSV~13.09.2025|NEC Nijmegen|PSV|3|5
NEC Nijmegen|PSV~01.02.2025|NEC Nijmegen|PSV|3|3
NEC Nijmegen|PSV~14.09.2024|PSV|NEC Nijmegen|2|0
NEC Nijmegen|PSV~30.03.2024|NEC Nijmegen|PSV|3|1
Fortuna Sittard|Telstar~08.03.2026|Fortuna Sittard|Telstar|1|4
Fortuna Sittard|Telstar~14.09.2025|Telstar|Fortuna Sittard|1|3
Go Ahead Eagles|Twente~08.03.2026|Go Ahead Eagles|Twente|1|4
Go Ahead Eagles|Twente~14.12.2025|Twente|Go Ahead Eagles|2|0
Go Ahead Eagles|Twente~02.02.2025|Go Ahead Eagles|Twente|2|2
Go Ahead Eagles|Twente~01.12.2024|Twente|Go Ahead Eagles|3|2
Go Ahead Eagles|Twente~25.02.2024|Twente|Go Ahead Eagles|3|0
Feyenoord|NAC Breda~08.03.2026|NAC Breda|Feyenoord|3|3
Feyenoord|NAC Breda~09.08.2025|Feyenoord|NAC Breda|2|0
Feyenoord|NAC Breda~15.02.2025|NAC Breda|Feyenoord|0|0
Feyenoord|NAC Breda~22.09.2024|Feyenoord|NAC Breda|2|0
NEC Nijmegen|Volendam~08.03.2026|NEC Nijmegen|Volendam|3|0
NEC Nijmegen|Volendam~07.12.2025|Volendam|NEC Nijmegen|2|3
NEC Nijmegen|Volendam~01.03.2024|Volendam|NEC Nijmegen|2|5
NEC Nijmegen|Volendam~05.11.2023|NEC Nijmegen|Volendam|3|3
NEC Nijmegen|Volendam~25.02.2023|NEC Nijmegen|Volendam|3|0
AZ Alkmaar|PSV~07.03.2026|PSV|AZ Alkmaar|2|1
AZ Alkmaar|PSV~09.11.2025|AZ Alkmaar|PSV|1|5
AZ Alkmaar|PSV~11.01.2025|PSV|AZ Alkmaar|2|2
AZ Alkmaar|PSV~19.10.2024|AZ Alkmaar|PSV|1|2
AZ Alkmaar|PSV~06.04.2024|PSV|AZ Alkmaar|5|1
Heracles|Utrecht~06.03.2026|Heracles|Utrecht|0|0
Heracles|Utrecht~10.08.2025|Utrecht|Heracles|4|0
Heracles|Utrecht~24.01.2025|Heracles|Utrecht|1|1
Heracles|Utrecht~08.11.2024|Utrecht|Heracles|1|0
Heracles|Utrecht~23.02.2024|Utrecht|Heracles|1|0
Feyenoord|Twente~01.03.2026|Twente|Feyenoord|2|0
Feyenoord|Twente~21.12.2025|Feyenoord|Twente|1|1
Feyenoord|Twente~16.03.2025|Twente|Feyenoord|2|6
Feyenoord|Twente~06.10.2024|Feyenoord|Twente|2|1
Feyenoord|Twente~28.01.2024|Feyenoord|Twente|0|0
Groningen|Volendam~01.03.2026|Volendam|Groningen|3|2
Groningen|Volendam~13.12.2025|Groningen|Volendam|3|0
Groningen|Volendam~29.01.2023|Volendam|Groningen|3|2
Groningen|Volendam~07.08.2022|Groningen|Volendam|2|2
Excelsior|Go Ahead Eagles~01.03.2026|Excelsior|Go Ahead Eagles|0|1
Excelsior|Go Ahead Eagles~26.10.2025|Go Ahead Eagles|Excelsior|2|0
Excelsior|Go Ahead Eagles~30.03.2024|Go Ahead Eagles|Excelsior|3|0
Excelsior|Go Ahead Eagles~16.12.2023|Excelsior|Go Ahead Eagles|1|1
Excelsior|Go Ahead Eagles~14.04.2023|Excelsior|Go Ahead Eagles|2|1
Heracles|PSV~28.02.2026|Heracles|PSV|1|3
Heracles|PSV~13.12.2025|PSV|Heracles|4|3
Heracles|PSV~14.05.2025|PSV|Heracles|4|1
Heracles|PSV~18.08.2024|Heracles|PSV|1|3
Heracles|PSV~16.02.2024|PSV|Heracles|2|0
NAC Breda|Telstar~27.02.2026|Telstar|NAC Breda|3|0
NAC Breda|Telstar~20.12.2025|NAC Breda|Telstar|0|1
Go Ahead Eagles|Heracles~22.02.2026|Go Ahead Eagles|Heracles|4|0
Go Ahead Eagles|Heracles~22.11.2025|Heracles|Go Ahead Eagles|4|2
Go Ahead Eagles|Heracles~08.02.2025|Heracles|Go Ahead Eagles|4|2
Go Ahead Eagles|Heracles~06.10.2024|Go Ahead Eagles|Heracles|4|1
Go Ahead Eagles|Heracles~15.03.2024|Heracles|Go Ahead Eagles|2|0
AZ Alkmaar|Sparta Rotterdam~22.02.2026|AZ Alkmaar|Sparta Rotterdam|3|1
AZ Alkmaar|Sparta Rotterdam~02.11.2025|Sparta Rotterdam|AZ Alkmaar|0|1
AZ Alkmaar|Sparta Rotterdam~26.01.2025|AZ Alkmaar|Sparta Rotterdam|1|2
AZ Alkmaar|Sparta Rotterdam~24.11.2024|Sparta Rotterdam|AZ Alkmaar|1|2
AZ Alkmaar|Sparta Rotterdam~02.03.2024|Sparta Rotterdam|AZ Alkmaar|1|1
NAC Breda|Volendam~21.02.2026|NAC Breda|Volendam|1|0
NAC Breda|Volendam~08.11.2025|Volendam|NAC Breda|2|1
NEC Nijmegen|Sparta Rotterdam~17.02.2026|Sparta Rotterdam|NEC Nijmegen|1|1
NEC Nijmegen|Sparta Rotterdam~29.11.2025|NEC Nijmegen|Sparta Rotterdam|3|1
NEC Nijmegen|Sparta Rotterdam~06.04.2025|Sparta Rotterdam|NEC Nijmegen|2|0
NEC Nijmegen|Sparta Rotterdam~15.12.2024|NEC Nijmegen|Sparta Rotterdam|1|1
NEC Nijmegen|Sparta Rotterdam~24.02.2024|NEC Nijmegen|Sparta Rotterdam|2|0
Heracles|NAC Breda~14.02.2026|Heracles|NAC Breda|0|1
Heracles|NAC Breda~20.09.2025|NAC Breda|Heracles|2|1
Heracles|NAC Breda~31.01.2025|NAC Breda|Heracles|1|1
Heracles|NAC Breda~02.11.2024|Heracles|NAC Breda|2|0
AZ Alkmaar|Excelsior~14.02.2026|Excelsior|AZ Alkmaar|1|2
AZ Alkmaar|Excelsior~21.01.2026|AZ Alkmaar|Excelsior|1|1
AZ Alkmaar|Excelsior~10.03.2024|AZ Alkmaar|Excelsior|4|0
AZ Alkmaar|Excelsior~04.11.2023|Excelsior|AZ Alkmaar|1|1
AZ Alkmaar|Excelsior~10.02.2023|AZ Alkmaar|Excelsior|5|0
PSV|Volendam~13.02.2026|Volendam|PSV|2|1
PSV|Volendam~30.11.2025|PSV|Volendam|3|0
PSV|Volendam~11.02.2024|Volendam|PSV|1|5
PSV|Volendam~30.09.2023|PSV|Volendam|3|1
PSV|Volendam~16.04.2023|Volendam|PSV|2|3
Go Ahead Eagles|Heerenveen~11.02.2026|Go Ahead Eagles|Heerenveen|1|3
Go Ahead Eagles|Heerenveen~30.08.2025|Heerenveen|Go Ahead Eagles|2|2
Go Ahead Eagles|Heerenveen~14.05.2025|Go Ahead Eagles|Heerenveen|1|0
Go Ahead Eagles|Heerenveen~10.11.2024|Heerenveen|Go Ahead Eagles|1|0
Go Ahead Eagles|Heerenveen~17.02.2024|Heerenveen|Go Ahead Eagles|0|2
NEC Nijmegen|Utrecht~11.02.2026|NEC Nijmegen|Utrecht|1|3
NEC Nijmegen|Utrecht~02.11.2025|Utrecht|NEC Nijmegen|1|0
NEC Nijmegen|Utrecht~15.03.2025|Utrecht|NEC Nijmegen|0|1
NEC Nijmegen|Utrecht~24.11.2024|NEC Nijmegen|Utrecht|1|2
NEC Nijmegen|Utrecht~17.03.2024|Utrecht|NEC Nijmegen|1|0
Heracles|NEC Nijmegen~07.02.2026|NEC Nijmegen|Heracles|4|1
Heracles|NEC Nijmegen~16.08.2025|Heracles|NEC Nijmegen|1|4
Heracles|NEC Nijmegen~18.05.2025|Heracles|NEC Nijmegen|1|2
Heracles|NEC Nijmegen~21.09.2024|NEC Nijmegen|Heracles|1|2
Heracles|NEC Nijmegen~03.02.2024|NEC Nijmegen|Heracles|3|1
PEC Zwolle|Volendam~07.02.2026|PEC Zwolle|Volendam|1|2
PEC Zwolle|Volendam~27.09.2025|Volendam|PEC Zwolle|2|1
PEC Zwolle|Volendam~10.03.2024|PEC Zwolle|Volendam|1|1
PEC Zwolle|Volendam~02.12.2023|Volendam|PEC Zwolle|0|5
Fortuna Sittard|Sparta Rotterdam~07.02.2026|Fortuna Sittard|Sparta Rotterdam|2|2
Fortuna Sittard|Sparta Rotterdam~22.11.2025|Sparta Rotterdam|Fortuna Sittard|1|1
Fortuna Sittard|Sparta Rotterdam~29.03.2025|Fortuna Sittard|Sparta Rotterdam|0|3
Fortuna Sittard|Sparta Rotterdam~28.09.2024|Sparta Rotterdam|Fortuna Sittard|1|1
Fortuna Sittard|Sparta Rotterdam~30.03.2024|Sparta Rotterdam|Fortuna Sittard|4|0
Excelsior|NAC Breda~06.02.2026|NAC Breda|Excelsior|0|2
Excelsior|NAC Breda~29.11.2025|Excelsior|NAC Breda|1|0
Fortuna Sittard|Heracles~01.02.2026|Heracles|Fortuna Sittard|2|1
Fortuna Sittard|Heracles~29.11.2025|Fortuna Sittard|Heracles|1|1
Fortuna Sittard|Heracles~08.03.2025|Fortuna Sittard|Heracles|1|0
Fortuna Sittard|Heracles~07.12.2024|Heracles|Fortuna Sittard|2|2
Fortuna Sittard|Heracles~19.05.2024|Heracles|Fortuna Sittard|0|0
Heerenveen|Utrecht~01.02.2026|Heerenveen|Utrecht|1|1
Heerenveen|Utrecht~28.09.2025|Utrecht|Heerenveen|2|2
Heerenveen|Utrecht~30.03.2025|Utrecht|Heerenveen|2|0
Heerenveen|Utrecht~17.08.2024|Heerenveen|Utrecht|1|1
Heerenveen|Utrecht~07.04.2024|Heerenveen|Utrecht|2|3
Go Ahead Eagles|Volendam~01.02.2026|Volendam|Go Ahead Eagles|1|1
Go Ahead Eagles|Volendam~13.09.2025|Go Ahead Eagles|Volendam|3|0
Go Ahead Eagles|Volendam~19.05.2024|Volendam|Go Ahead Eagles|1|2
Go Ahead Eagles|Volendam~19.08.2023|Go Ahead Eagles|Volendam|4|1
Go Ahead Eagles|Volendam~21.05.2023|Go Ahead Eagles|Volendam|3|0
AZ Alkmaar|NEC Nijmegen~31.01.2026|AZ Alkmaar|NEC Nijmegen|1|3
AZ Alkmaar|NEC Nijmegen~28.09.2025|NEC Nijmegen|AZ Alkmaar|2|1
AZ Alkmaar|NEC Nijmegen~29.03.2025|NEC Nijmegen|AZ Alkmaar|3|3
AZ Alkmaar|NEC Nijmegen~17.08.2024|AZ Alkmaar|NEC Nijmegen|1|0
AZ Alkmaar|NEC Nijmegen~28.04.2024|NEC Nijmegen|AZ Alkmaar|0|3
PEC Zwolle|Telstar~31.01.2026|PEC Zwolle|Telstar|4|1
PEC Zwolle|Telstar~15.08.2025|Telstar|PEC Zwolle|0|2
NAC Breda|Twente~30.01.2026|NAC Breda|Twente|2|2
NAC Breda|Twente~13.09.2025|Twente|NAC Breda|2|2
NAC Breda|Twente~19.01.2025|NAC Breda|Twente|2|1
NAC Breda|Twente~29.09.2024|Twente|NAC Breda|1|0
Feyenoord|Heracles~25.01.2026|Feyenoord|Heracles|4|2
Feyenoord|Heracles~19.10.2025|Heracles|Feyenoord|0|7
Feyenoord|Heracles~03.05.2025|Heracles|Feyenoord|1|4
Feyenoord|Heracles~14.12.2024|Feyenoord|Heracles|5|2
Feyenoord|Heracles~10.03.2024|Feyenoord|Heracles|3|0
Ajax|Volendam~24.01.2026|Ajax|Volendam|2|0
Ajax|Volendam~30.08.2025|Volendam|Ajax|1|1
Ajax|Volendam~05.05.2024|Volendam|Ajax|1|4
Ajax|Volendam~02.11.2023|Ajax|Volendam|2|0
Ajax|Volendam~26.01.2023|Ajax|Volendam|1|1
NAC Breda|PSV~24.01.2026|PSV|NAC Breda|2|2
NAC Breda|PSV~22.11.2025|NAC Breda|PSV|0|1
NAC Breda|PSV~25.01.2025|PSV|NAC Breda|3|2
NAC Breda|PSV~09.11.2024|NAC Breda|PSV|0|3
Groningen|Heerenveen~18.01.2026|Heerenveen|Groningen|0|2
Groningen|Heerenveen~16.08.2025|Groningen|Heerenveen|2|1
Groningen|Heerenveen~25.01.2025|Groningen|Heerenveen|1|0
Groningen|Heerenveen~22.09.2024|Heerenveen|Groningen|2|1
Groningen|Heerenveen~19.03.2023|Groningen|Heerenveen|0|2
Heracles|Twente~18.01.2026|Heracles|Twente|0|2
Heracles|Twente~05.10.2025|Twente|Heracles|2|1
Heracles|Twente~30.03.2025|Heracles|Twente|2|1
Heracles|Twente~27.10.2024|Twente|Heracles|5|0
Heracles|Twente~31.03.2024|Twente|Heracles|1|0
Utrecht|Volendam~18.01.2026|Volendam|Utrecht|2|1
Utrecht|Volendam~18.10.2025|Utrecht|Volendam|3|1
Utrecht|Volendam~04.02.2024|Utrecht|Volendam|4|2
Utrecht|Volendam~06.10.2023|Volendam|Utrecht|1|0
Utrecht|Volendam~02.04.2023|Utrecht|Volendam|0|0
Ajax|Go Ahead Eagles~17.01.2026|Ajax|Go Ahead Eagles|2|2
Ajax|Go Ahead Eagles~17.08.2025|Go Ahead Eagles|Ajax|2|2
Ajax|Go Ahead Eagles~23.02.2025|Ajax|Go Ahead Eagles|2|0
Ajax|Go Ahead Eagles~21.09.2024|Go Ahead Eagles|Ajax|1|1
Ajax|Go Ahead Eagles~04.04.2024|Ajax|Go Ahead Eagles|1|1
AZ Alkmaar|PEC Zwolle~17.01.2026|PEC Zwolle|AZ Alkmaar|3|1
AZ Alkmaar|PEC Zwolle~24.09.2025|AZ Alkmaar|PEC Zwolle|2|2
AZ Alkmaar|PEC Zwolle~09.02.2025|AZ Alkmaar|PEC Zwolle|2|0
AZ Alkmaar|PEC Zwolle~20.09.2024|PEC Zwolle|AZ Alkmaar|1|2
AZ Alkmaar|PEC Zwolle~20.01.2024|AZ Alkmaar|PEC Zwolle|2|2
Excelsior|Telstar~17.01.2026|Excelsior|Telstar|2|2
Excelsior|Telstar~01.11.2025|Telstar|Excelsior|2|2
NAC Breda|NEC Nijmegen~17.01.2026|NAC Breda|NEC Nijmegen|3|4
NAC Breda|NEC Nijmegen~24.08.2025|NEC Nijmegen|NAC Breda|3|0
NAC Breda|NEC Nijmegen~14.05.2025|NEC Nijmegen|NAC Breda|3|0
NAC Breda|NEC Nijmegen~05.10.2024|NAC Breda|NEC Nijmegen|1|0
Feyenoord|Heerenveen~11.01.2026|Heerenveen|Feyenoord|2|2
Feyenoord|Heerenveen~13.09.2025|Feyenoord|Heerenveen|1|0
Feyenoord|Heerenveen~18.05.2025|Heerenveen|Feyenoord|2|0
Feyenoord|Heerenveen~23.11.2024|Feyenoord|Heerenveen|3|0
Feyenoord|Heerenveen~17.03.2024|Heerenveen|Feyenoord|2|3
Fortuna Sittard|Go Ahead Eagles~11.01.2026|Go Ahead Eagles|Fortuna Sittard|2|2
Fortuna Sittard|Go Ahead Eagles~08.08.2025|Fortuna Sittard|Go Ahead Eagles|2|2
Fortuna Sittard|Go Ahead Eagles~10.01.2025|Fortuna Sittard|Go Ahead Eagles|0|3
Fortuna Sittard|Go Ahead Eagles~11.08.2024|Go Ahead Eagles|Fortuna Sittard|0|2
Fortuna Sittard|Go Ahead Eagles~03.05.2024|Fortuna Sittard|Go Ahead Eagles|0|0
Heracles|Sparta Rotterdam~11.01.2026|Sparta Rotterdam|Heracles|2|0
Heracles|Sparta Rotterdam~27.09.2025|Heracles|Sparta Rotterdam|3|0
Heracles|Sparta Rotterdam~11.01.2025|Heracles|Sparta Rotterdam|1|1
Heracles|Sparta Rotterdam~11.08.2024|Sparta Rotterdam|Heracles|0|0
Heracles|Sparta Rotterdam~06.04.2024|Sparta Rotterdam|Heracles|1|2
AZ Alkmaar|Volendam~10.01.2026|AZ Alkmaar|Volendam|1|0
AZ Alkmaar|Volendam~17.08.2025|Volendam|AZ Alkmaar|2|2
AZ Alkmaar|Volendam~17.03.2024|Volendam|AZ Alkmaar|0|4
AZ Alkmaar|Volendam~26.11.2023|AZ Alkmaar|Volendam|3|0
AZ Alkmaar|Volendam~04.02.2023|Volendam|AZ Alkmaar|1|1
Groningen|NAC Breda~10.01.2026|Groningen|NAC Breda|0|0
Groningen|NAC Breda~03.10.2025|NAC Breda|Groningen|1|2
Groningen|NAC Breda~29.03.2025|NAC Breda|Groningen|1|1
Groningen|NAC Breda~09.08.2024|Groningen|NAC Breda|4|1
AZ Alkmaar|Almere City~18.05.2025|AZ Alkmaar|Almere City|1|1
AZ Alkmaar|Almere City~10.08.2024|Almere City|AZ Alkmaar|0|1
AZ Alkmaar|Almere City~10.02.2024|Almere City|AZ Alkmaar|0|0
AZ Alkmaar|Almere City~09.12.2023|AZ Alkmaar|Almere City|4|1
NAC Breda|Willem II~18.05.2025|NAC Breda|Willem II|1|1
NAC Breda|Willem II~24.11.2024|Willem II|NAC Breda|2|2
Go Ahead Eagles|Waalwijk~18.05.2025|Waalwijk|Go Ahead Eagles|5|3
Go Ahead Eagles|Waalwijk~25.08.2024|Go Ahead Eagles|Waalwijk|2|0
Go Ahead Eagles|Waalwijk~02.03.2024|Go Ahead Eagles|Waalwijk|1|0
Go Ahead Eagles|Waalwijk~11.11.2023|Waalwijk|Go Ahead Eagles|0|1
Go Ahead Eagles|Waalwijk~19.04.2023|Go Ahead Eagles|Waalwijk|3|2
Almere City|Fortuna Sittard~14.05.2025|Almere City|Fortuna Sittard|1|1
Almere City|Fortuna Sittard~16.08.2024|Fortuna Sittard|Almere City|3|0
Almere City|Fortuna Sittard~24.01.2024|Almere City|Fortuna Sittard|0|0
Almere City|Fortuna Sittard~19.08.2023|Fortuna Sittard|Almere City|2|1
Feyenoord|Waalwijk~14.05.2025|Feyenoord|Waalwijk|2|0
Feyenoord|Waalwijk~07.12.2024|Waalwijk|Feyenoord|2|3
Feyenoord|Waalwijk~18.02.2024|Feyenoord|Waalwijk|1|0
Feyenoord|Waalwijk~04.11.2023|Waalwijk|Feyenoord|1|2
Feyenoord|Waalwijk~09.04.2023|Feyenoord|Waalwijk|5|1
PEC Zwolle|Willem II~14.05.2025|Willem II|PEC Zwolle|1|2
PEC Zwolle|Willem II~13.12.2024|PEC Zwolle|Willem II|0|1
PEC Zwolle|Willem II~14.01.2022|PEC Zwolle|Willem II|2|0
PEC Zwolle|Willem II~28.08.2021|Willem II|PEC Zwolle|1|0
Heerenveen|Waalwijk~10.05.2025|Waalwijk|Heerenveen|3|1
Heerenveen|Waalwijk~29.11.2024|Heerenveen|Waalwijk|1|1
Heerenveen|Waalwijk~30.03.2024|Waalwijk|Heerenveen|1|1
Heerenveen|Waalwijk~12.08.2023|Heerenveen|Waalwijk|3|1
Heerenveen|Waalwijk~25.02.2023|Heerenveen|Waalwijk|1|4
Almere City|Sparta Rotterdam~10.05.2025|Almere City|Sparta Rotterdam|0|3
Almere City|Sparta Rotterdam~19.10.2024|Sparta Rotterdam|Almere City|2|2
Almere City|Sparta Rotterdam~13.04.2024|Almere City|Sparta Rotterdam|2|3
Almere City|Sparta Rotterdam~05.11.2023|Sparta Rotterdam|Almere City|1|2
Heracles|Willem II~09.05.2025|Willem II|Heracles|1|2
Heracles|Willem II~25.08.2024|Heracles|Willem II|1|1
Heracles|Willem II~07.05.2022|Willem II|Heracles|2|0
Heracles|Willem II~02.10.2021|Heracles|Willem II|3|2
Groningen|Waalwijk~03.05.2025|Groningen|Waalwijk|6|1
Groningen|Waalwijk~17.08.2024|Waalwijk|Groningen|1|2
Groningen|Waalwijk~15.04.2023|Waalwijk|Groningen|2|1
Groningen|Waalwijk~07.10.2022|Groningen|Waalwijk|2|3
Groningen|Waalwijk~01.05.2022|Waalwijk|Groningen|3|1
Almere City|Go Ahead Eagles~27.04.2025|Almere City|Go Ahead Eagles|0|0
Almere City|Go Ahead Eagles~23.11.2024|Go Ahead Eagles|Almere City|3|0
Almere City|Go Ahead Eagles~07.04.2024|Go Ahead Eagles|Almere City|1|1
Almere City|Go Ahead Eagles~28.10.2023|Almere City|Go Ahead Eagles|0|0
Utrecht|Waalwijk~25.04.2025|Waalwijk|Utrecht|0|4
Utrecht|Waalwijk~05.10.2024|Utrecht|Waalwijk|3|2
Utrecht|Waalwijk~28.04.2024|Waalwijk|Utrecht|2|2
Utrecht|Waalwijk~16.12.2023|Utrecht|Waalwijk|1|1
Utrecht|Waalwijk~13.05.2023|Utrecht|Waalwijk|2|0
Almere City|Heerenveen~19.04.2025|Heerenveen|Almere City|2|1
Almere City|Heerenveen~21.12.2024|Almere City|Heerenveen|3|0
Almere City|Heerenveen~03.05.2024|Almere City|Heerenveen|1|1
Almere City|Heerenveen~01.12.2023|Heerenveen|Almere City|3|0
Almere City|PSV~12.04.2025|PSV|Almere City|5|0
Almere City|PSV~24.08.2024|Almere City|PSV|1|7
Almere City|PSV~27.01.2024|PSV|Almere City|2|0
Almere City|PSV~23.09.2023|Almere City|PSV|0|4
NEC Nijmegen|Waalwijk~11.04.2025|NEC Nijmegen|Waalwijk|2|1
NEC Nijmegen|Waalwijk~09.11.2024|Waalwijk|NEC Nijmegen|0|3
NEC Nijmegen|Waalwijk~09.02.2024|Waalwijk|NEC Nijmegen|2|0
NEC Nijmegen|Waalwijk~26.08.2023|NEC Nijmegen|Waalwijk|3|0
NEC Nijmegen|Waalwijk~18.03.2023|Waalwijk|NEC Nijmegen|1|3
Heracles|Waalwijk~06.04.2025|Waalwijk|Heracles|0|0
Heracles|Waalwijk~23.11.2024|Heracles|Waalwijk|2|2
Heracles|Waalwijk~05.05.2024|Heracles|Waalwijk|0|5
Heracles|Waalwijk~12.01.2024|Waalwijk|Heracles|1|2
Heracles|Waalwijk~11.05.2022|Waalwijk|Heracles|2|0
Almere City|PEC Zwolle~05.04.2025|Almere City|PEC Zwolle|2|2
Almere City|PEC Zwolle~29.09.2024|PEC Zwolle|Almere City|1|0
Almere City|PEC Zwolle~17.02.2024|PEC Zwolle|Almere City|0|1
Almere City|PEC Zwolle~02.09.2023|Almere City|PEC Zwolle|1|2
AZ Alkmaar|Waalwijk~01.04.2025|AZ Alkmaar|Waalwijk|2|2
AZ Alkmaar|Waalwijk~30.08.2024|Waalwijk|AZ Alkmaar|0|3
AZ Alkmaar|Waalwijk~13.04.2024|AZ Alkmaar|Waalwijk|3|2
AZ Alkmaar|Waalwijk~20.08.2023|Waalwijk|AZ Alkmaar|1|3
AZ Alkmaar|Waalwijk~23.04.2023|AZ Alkmaar|Waalwijk|3|0
Almere City|Willem II~29.03.2025|Willem II|Almere City|0|2
Almere City|Willem II~04.10.2024|Almere City|Willem II|0|1
PEC Zwolle|Waalwijk~29.03.2025|PEC Zwolle|Waalwijk|2|0
PEC Zwolle|Waalwijk~20.12.2024|Waalwijk|PEC Zwolle|1|1
PEC Zwolle|Waalwijk~12.05.2024|Waalwijk|PEC Zwolle|1|1
PEC Zwolle|Waalwijk~25.11.2023|PEC Zwolle|Waalwijk|1|2
PEC Zwolle|Waalwijk~23.04.2022|Waalwijk|PEC Zwolle|0|2
PSV|Waalwijk~15.03.2025|Waalwijk|PSV|0|3
PSV|Waalwijk~10.08.2024|PSV|Waalwijk|5|1
PSV|Waalwijk~19.05.2024|PSV|Waalwijk|3|1
PSV|Waalwijk~02.09.2023|Waalwijk|PSV|0|4
PSV|Waalwijk~05.03.2023|Waalwijk|PSV|0|1
Almere City|NAC Breda~14.03.2025|Almere City|NAC Breda|1|1
Almere City|NAC Breda~30.11.2024|NAC Breda|Almere City|1|0
Almere City|Twente~09.03.2025|Twente|Almere City|1|0
Almere City|Twente~22.09.2024|Almere City|Twente|0|5
Almere City|Twente~24.04.2024|Twente|Almere City|3|1
Almere City|Twente~13.08.2023|Almere City|Twente|1|4
Ajax|Almere City~02.03.2025|Almere City|Ajax|0|1
Ajax|Almere City~15.12.2024|Ajax|Almere City|3|0
Ajax|Almere City~12.05.2024|Ajax|Almere City|3|0
Ajax|Almere City~12.11.2023|Almere City|Ajax|2|2
Fortuna Sittard|Waalwijk~28.02.2025|Waalwijk|Fortuna Sittard|1|2
Fortuna Sittard|Waalwijk~14.12.2024|Fortuna Sittard|Waalwijk|3|2
Fortuna Sittard|Waalwijk~24.02.2024|Waalwijk|Fortuna Sittard|0|1
Fortuna Sittard|Waalwijk~10.12.2023|Fortuna Sittard|Waalwijk|1|0
Fortuna Sittard|Waalwijk~17.02.2023|Waalwijk|Fortuna Sittard|3|1
Almere City|Feyenoord~22.02.2025|Feyenoord|Almere City|2|1
Almere City|Feyenoord~10.11.2024|Almere City|Feyenoord|1|4
Almere City|Feyenoord~25.02.2024|Almere City|Feyenoord|0|2
Almere City|Feyenoord~27.08.2023|Feyenoord|Almere City|6|1
Almere City|NEC Nijmegen~16.02.2025|NEC Nijmegen|Almere City|2|2
Almere City|NEC Nijmegen~25.10.2024|Almere City|NEC Nijmegen|1|0
Almere City|NEC Nijmegen~19.05.2024|Almere City|NEC Nijmegen|1|4
Almere City|NEC Nijmegen~21.10.2023|NEC Nijmegen|Almere City|1|1
Twente|Waalwijk~16.02.2025|Twente|Waalwijk|2|0
Twente|Waalwijk~19.10.2024|Waalwijk|Twente|2|2
Twente|Waalwijk~03.02.2024|Twente|Waalwijk|3|0
Twente|Waalwijk~24.09.2023|Waalwijk|Twente|1|0
Twente|Waalwijk~21.05.2023|Waalwijk|Twente|0|5
Groningen|Willem II~15.02.2025|Willem II|Groningen|1|3
Groningen|Willem II~30.11.2024|Groningen|Willem II|2|0
Groningen|Willem II~26.02.2022|Groningen|Willem II|1|0
Groningen|Willem II~18.09.2021|Willem II|Groningen|2|1
Almere City|Utrecht~09.02.2025|Utrecht|Almere City|0|1
Almere City|Utrecht~08.12.2024|Almere City|Utrecht|1|3
Almere City|Utrecht~09.03.2024|Almere City|Utrecht|1|1
Almere City|Utrecht~30.09.2023|Utrecht|Almere City|0|2
NAC Breda|Waalwijk~09.02.2025|Waalwijk|NAC Breda|5|0
NAC Breda|Waalwijk~26.10.2024|NAC Breda|Waalwijk|4|1
Almere City|Waalwijk~02.02.2025|Almere City|Waalwijk|1|4
Almere City|Waalwijk~03.11.2024|Waalwijk|Almere City|2|0
Almere City|Waalwijk~04.04.2024|Waalwijk|Almere City|0|0
Almere City|Waalwijk~07.10.2023|Almere City|Waalwijk|1|0
Waalwijk|Willem II~26.01.2025|Waalwijk|Willem II|2|0
Waalwijk|Willem II~15.09.2024|Willem II|Waalwijk|3|0
Waalwijk|Willem II~06.02.2022|Willem II|Waalwijk|3|1
Waalwijk|Willem II~21.09.2021|Waalwijk|Willem II|1|2
Almere City|Heracles~19.01.2025|Almere City|Heracles|0|2
Almere City|Heracles~15.09.2024|Heracles|Almere City|0|0
Almere City|Heracles~03.03.2024|Heracles|Almere City|2|2
Almere City|Heracles~26.11.2023|Almere City|Heracles|0|5
Sparta Rotterdam|Waalwijk~19.01.2025|Sparta Rotterdam|Waalwijk|1|1
Sparta Rotterdam|Waalwijk~21.09.2024|Waalwijk|Sparta Rotterdam|1|2
Sparta Rotterdam|Waalwijk~27.01.2024|Waalwijk|Sparta Rotterdam|1|1
Sparta Rotterdam|Waalwijk~28.10.2023|Sparta Rotterdam|Waalwijk|2|0
Sparta Rotterdam|Waalwijk~24.01.2023|Sparta Rotterdam|Waalwijk|0|0
Feyenoord|Willem II~18.01.2025|Willem II|Feyenoord|1|1
Feyenoord|Willem II~10.08.2024|Feyenoord|Willem II|1|1
Feyenoord|Willem II~02.04.2022|Feyenoord|Willem II|2|0
Feyenoord|Willem II~15.08.2021|Willem II|Feyenoord|0|4
Twente|Willem II~12.01.2025|Twente|Willem II|6|2
Twente|Willem II~02.11.2024|Willem II|Twente|0|1
Twente|Willem II~22.01.2022|Willem II|Twente|0|1
Twente|Willem II~17.10.2021|Twente|Willem II|1|1
Almere City|Groningen~12.01.2025|Groningen|Almere City|0|0
Almere City|Groningen~31.08.2024|Almere City|Groningen|1|1
Ajax|Waalwijk~11.01.2025|Ajax|Waalwijk|2|1
Ajax|Waalwijk~29.09.2024|Waalwijk|Ajax|0|2
Ajax|Waalwijk~21.01.2024|Ajax|Waalwijk|4|1
Ajax|Waalwijk~06.12.2023|Waalwijk|Ajax|2|3
Ajax|Waalwijk~12.02.2023|Ajax|Waalwijk|3|1
Ajax|Vitesse~19.05.2024|Vitesse|Ajax|2|2
Ajax|Vitesse~25.11.2023|Ajax|Vitesse|5|0
Ajax|Vitesse~26.02.2023|Vitesse|Ajax|1|2
Ajax|Vitesse~09.11.2022|Ajax|Vitesse|2|2
Ajax|Vitesse~15.05.2022|Vitesse|Ajax|2|2
Heerenveen|Vitesse~12.05.2024|Heerenveen|Vitesse|1|3
Heerenveen|Vitesse~11.11.2023|Vitesse|Heerenveen|1|3
Heerenveen|Vitesse~28.01.2023|Heerenveen|Vitesse|1|3
Heerenveen|Vitesse~20.08.2022|Vitesse|Heerenveen|0|4
Heerenveen|Vitesse~08.05.2022|Vitesse|Heerenveen|1|2
Utrecht|Vitesse~05.05.2024|Utrecht|Vitesse|1|0
Utrecht|Vitesse~14.01.2024|Vitesse|Utrecht|0|0
Utrecht|Vitesse~12.02.2023|Vitesse|Utrecht|2|0
Utrecht|Vitesse~11.09.2022|Utrecht|Vitesse|1|0
Utrecht|Vitesse~20.02.2022|Utrecht|Vitesse|1|1
Fortuna Sittard|Vitesse~28.04.2024|Vitesse|Fortuna Sittard|3|2
Fortuna Sittard|Vitesse~02.12.2023|Fortuna Sittard|Vitesse|3|1
Fortuna Sittard|Vitesse~07.05.2023|Fortuna Sittard|Vitesse|2|0
Fortuna Sittard|Vitesse~09.10.2022|Vitesse|Fortuna Sittard|1|2
Fortuna Sittard|Vitesse~11.05.2022|Fortuna Sittard|Vitesse|1|2
PSV|Vitesse~13.04.2024|PSV|Vitesse|6|0
PSV|Vitesse~19.08.2023|Vitesse|PSV|1|3
PSV|Vitesse~19.03.2023|Vitesse|PSV|1|1
PSV|Vitesse~21.01.2023|PSV|Vitesse|1|0
PSV|Vitesse~12.02.2022|Vitesse|PSV|0|5
NEC Nijmegen|Vitesse~07.04.2024|Vitesse|NEC Nijmegen|0|3
NEC Nijmegen|Vitesse~01.10.2023|NEC Nijmegen|Vitesse|1|3
NEC Nijmegen|Vitesse~16.04.2023|NEC Nijmegen|Vitesse|1|4
NEC Nijmegen|Vitesse~15.01.2023|Vitesse|NEC Nijmegen|0|0
NEC Nijmegen|Vitesse~27.02.2022|Vitesse|NEC Nijmegen|4|1
Volendam|Waalwijk~07.04.2024|Volendam|Waalwijk|3|2
Volendam|Waalwijk~21.10.2023|Waalwijk|Volendam|2|1
Volendam|Waalwijk~05.05.2023|Waalwijk|Volendam|4|1
Volendam|Waalwijk~14.01.2023|Volendam|Waalwijk|2|1
Sparta Rotterdam|Vitesse~02.04.2024|Vitesse|Sparta Rotterdam|1|4
Sparta Rotterdam|Vitesse~24.09.2023|Sparta Rotterdam|Vitesse|1|0
Sparta Rotterdam|Vitesse~11.03.2023|Sparta Rotterdam|Vitesse|3|1
Sparta Rotterdam|Vitesse~05.11.2022|Vitesse|Sparta Rotterdam|0|4
Sparta Rotterdam|Vitesse~19.04.2022|Vitesse|Sparta Rotterdam|0|1
Almere City|Volendam~31.03.2024|Almere City|Volendam|1|1
Almere City|Volendam~14.01.2024|Volendam|Almere City|0|1
AZ Alkmaar|Vitesse~30.03.2024|AZ Alkmaar|Vitesse|2|0
AZ Alkmaar|Vitesse~03.09.2023|Vitesse|AZ Alkmaar|0|2
AZ Alkmaar|Vitesse~03.03.2023|Vitesse|AZ Alkmaar|0|1
AZ Alkmaar|Vitesse~07.01.2023|AZ Alkmaar|Vitesse|1|1
AZ Alkmaar|Vitesse~02.04.2022|AZ Alkmaar|Vitesse|3|1
Excelsior|Waalwijk~16.03.2024|Excelsior|Waalwijk|1|1
Excelsior|Waalwijk~02.12.2023|Waalwijk|Excelsior|2|2
Excelsior|Waalwijk~04.02.2023|Excelsior|Waalwijk|0|0
Excelsior|Waalwijk~04.09.2022|Waalwijk|Excelsior|5|2
Almere City|Vitesse~16.03.2024|Vitesse|Almere City|1|1
Almere City|Vitesse~17.12.2023|Almere City|Vitesse|5|0
Vitesse|Waalwijk~09.03.2024|Waalwijk|Vitesse|3|1
Vitesse|Waalwijk~16.09.2023|Vitesse|Waalwijk|0|2
Vitesse|Waalwijk~01.04.2023|Waalwijk|Vitesse|1|0
Vitesse|Waalwijk~27.08.2022|Vitesse|Waalwijk|2|2
Vitesse|Waalwijk~20.03.2022|Vitesse|Waalwijk|1|2
Twente|Vitesse~02.03.2024|Vitesse|Twente|1|2
Twente|Vitesse~27.09.2023|Twente|Vitesse|1|0
Twente|Vitesse~25.01.2023|Vitesse|Twente|2|2
Twente|Vitesse~01.10.2022|Twente|Vitesse|3|0
Twente|Vitesse~05.02.2022|Twente|Vitesse|3|0
Excelsior|Vitesse~25.02.2024|Excelsior|Vitesse|1|2
Excelsior|Vitesse~07.10.2023|Vitesse|Excelsior|0|0
Excelsior|Vitesse~22.04.2023|Vitesse|Excelsior|0|0
Excelsior|Vitesse~12.08.2022|Excelsior|Vitesse|3|1
Vitesse|Volendam~18.02.2024|Vitesse|Volendam|1|1
Vitesse|Volendam~11.08.2023|Volendam|Vitesse|1|2
Vitesse|Volendam~18.02.2023|Volendam|Vitesse|2|0
Vitesse|Volendam~17.09.2022|Vitesse|Volendam|1|1
Heracles|Vitesse~10.02.2024|Heracles|Vitesse|3|2
Heracles|Vitesse~10.12.2023|Vitesse|Heracles|2|0
Heracles|Vitesse~13.03.2022|Heracles|Vitesse|0|0
Heracles|Vitesse~12.12.2021|Vitesse|Heracles|2|1
Go Ahead Eagles|Vitesse~04.02.2024|Vitesse|Go Ahead Eagles|0|2
Go Ahead Eagles|Vitesse~04.11.2023|Go Ahead Eagles|Vitesse|5|1
Go Ahead Eagles|Vitesse~08.04.2023|Vitesse|Go Ahead Eagles|2|0
Go Ahead Eagles|Vitesse~13.11.2022|Go Ahead Eagles|Vitesse|2|2
Go Ahead Eagles|Vitesse~01.05.2022|Go Ahead Eagles|Vitesse|1|2
Almere City|Excelsior~02.02.2024|Almere City|Excelsior|2|1
Almere City|Excelsior~17.09.2023|Excelsior|Almere City|0|0
PEC Zwolle|Vitesse~26.01.2024|PEC Zwolle|Vitesse|1|0
PEC Zwolle|Vitesse~27.10.2023|Vitesse|PEC Zwolle|1|1
PEC Zwolle|Vitesse~21.12.2021|Vitesse|PEC Zwolle|1|0
PEC Zwolle|Vitesse~15.08.2021|PEC Zwolle|Vitesse|0|1
Feyenoord|Vitesse~21.01.2024|Vitesse|Feyenoord|1|2
Feyenoord|Vitesse~21.10.2023|Feyenoord|Vitesse|4|0
Feyenoord|Vitesse~28.05.2023|Feyenoord|Vitesse|0|1
Feyenoord|Vitesse~07.08.2022|Vitesse|Feyenoord|2|5
Feyenoord|Vitesse~15.01.2022|Feyenoord|Vitesse|0|1
Cambuur|Waalwijk~28.05.2023|Cambuur|Waalwijk|4|0
Cambuur|Waalwijk~17.09.2022|Waalwijk|Cambuur|5|1
Cambuur|Waalwijk~06.05.2022|Cambuur|Waalwijk|1|1
Cambuur|Waalwijk~31.10.2021|Waalwijk|Cambuur|0|1
FC Emmen|Utrecht~28.05.2023|Utrecht|FC Emmen|3|2
FC Emmen|Utrecht~20.08.2022|FC Emmen|Utrecht|3|2
FC Emmen|Feyenoord~21.05.2023|FC Emmen|Feyenoord|1|3
FC Emmen|Feyenoord~27.08.2022|Feyenoord|FC Emmen|4|0
Cambuur|Sparta Rotterdam~21.05.2023|Sparta Rotterdam|Cambuur|4|1
Cambuur|Sparta Rotterdam~21.01.2023|Cambuur|Sparta Rotterdam|0|3
Cambuur|Sparta Rotterdam~16.01.2022|Cambuur|Sparta Rotterdam|1|1
Cambuur|Sparta Rotterdam~26.09.2021|Sparta Rotterdam|Cambuur|0|4
Groningen|Vitesse~21.05.2023|Vitesse|Groningen|6|0
Groningen|Vitesse~04.09.2022|Groningen|Vitesse|0|1
Groningen|Vitesse~22.01.2022|Vitesse|Groningen|1|3
Groningen|Vitesse~22.09.2021|Groningen|Vitesse|0|1
Cambuur|Vitesse~14.05.2023|Vitesse|Cambuur|2|0
Cambuur|Vitesse~15.10.2022|Cambuur|Vitesse|0|3
Cambuur|Vitesse~10.04.2022|Vitesse|Cambuur|1|0
Cambuur|Vitesse~04.12.2021|Cambuur|Vitesse|1|6
AZ Alkmaar|FC Emmen~14.05.2023|AZ Alkmaar|FC Emmen|5|1
AZ Alkmaar|FC Emmen~04.09.2022|FC Emmen|AZ Alkmaar|0|3
FC Emmen|Twente~07.05.2023|FC Emmen|Twente|0|3
FC Emmen|Twente~06.01.2023|Twente|FC Emmen|2|0
Cambuur|Utrecht~06.05.2023|Cambuur|Utrecht|0|3
Cambuur|Utrecht~13.08.2022|Utrecht|Cambuur|0|0
Cambuur|Utrecht~05.02.2022|Utrecht|Cambuur|3|2
Cambuur|Utrecht~21.11.2021|Cambuur|Utrecht|2|1
FC Emmen|Heerenveen~22.04.2023|Heerenveen|FC Emmen|2|3
FC Emmen|Heerenveen~02.10.2022|FC Emmen|Heerenveen|0|0
Cambuur|Volendam~21.04.2023|Volendam|Cambuur|2|0
Cambuur|Volendam~08.01.2023|Cambuur|Volendam|0|3
Ajax|FC Emmen~16.04.2023|Ajax|FC Emmen|3|1
Ajax|FC Emmen~12.11.2022|FC Emmen|Ajax|3|3
FC Emmen|NEC Nijmegen~09.04.2023|FC Emmen|NEC Nijmegen|0|0
FC Emmen|NEC Nijmegen~21.01.2023|NEC Nijmegen|FC Emmen|3|1
Cambuur|FC Emmen~01.04.2023|Cambuur|FC Emmen|1|2
Cambuur|FC Emmen~15.01.2023|FC Emmen|Cambuur|0|0
FC Emmen|Sparta Rotterdam~18.03.2023|FC Emmen|Sparta Rotterdam|0|2
FC Emmen|Sparta Rotterdam~08.10.2022|Sparta Rotterdam|FC Emmen|3|1
Cambuur|PSV~12.03.2023|PSV|Cambuur|5|2
Cambuur|PSV~01.10.2022|Cambuur|PSV|3|0
Cambuur|PSV~23.04.2022|Cambuur|PSV|1|2
Cambuur|PSV~21.08.2021|PSV|Cambuur|4|1
Excelsior|FC Emmen~11.03.2023|FC Emmen|Excelsior|2|0
Excelsior|FC Emmen~10.09.2022|Excelsior|FC Emmen|2|1
FC Emmen|Volendam~04.03.2023|Volendam|FC Emmen|3|1
FC Emmen|Volendam~14.10.2022|FC Emmen|Volendam|1|1
FC Emmen|Go Ahead Eagles~26.02.2023|FC Emmen|Go Ahead Eagles|2|2
FC Emmen|Go Ahead Eagles~18.09.2022|Go Ahead Eagles|FC Emmen|2|0
Cambuur|Heerenveen~19.02.2023|Cambuur|Heerenveen|1|2
Cambuur|Heerenveen~13.11.2022|Heerenveen|Cambuur|2|1
Cambuur|Heerenveen~01.05.2022|Heerenveen|Cambuur|3|3
Cambuur|Heerenveen~19.12.2021|Cambuur|Heerenveen|1|2
FC Emmen|Groningen~18.02.2023|Groningen|FC Emmen|1|1
FC Emmen|Groningen~30.10.2022|FC Emmen|Groningen|0|0
FC Emmen|Fortuna Sittard~11.02.2023|FC Emmen|Fortuna Sittard|0|1
FC Emmen|Fortuna Sittard~05.11.2022|Fortuna Sittard|FC Emmen|0|1
Ajax|Cambuur~05.02.2023|Cambuur|Ajax|0|5
Ajax|Cambuur~03.09.2022|Ajax|Cambuur|4|0
Ajax|Cambuur~11.03.2022|Cambuur|Ajax|2|3
Ajax|Cambuur~18.09.2021|Ajax|Cambuur|9|0
FC Emmen|Vitesse~04.02.2023|FC Emmen|Vitesse|2|2
FC Emmen|Vitesse~22.10.2022|Vitesse|FC Emmen|2|1
FC Emmen|Waalwijk~28.01.2023|Waalwijk|FC Emmen|2|0
FC Emmen|Waalwijk~13.08.2022|FC Emmen|Waalwijk|1|1
Cambuur|Groningen~26.01.2023|Groningen|Cambuur|0|1
Cambuur|Groningen~11.09.2022|Cambuur|Groningen|0|1
Cambuur|Groningen~15.05.2022|Groningen|Cambuur|2|3
Cambuur|Groningen~15.08.2021|Cambuur|Groningen|1|2
FC Emmen|PSV~24.01.2023|FC Emmen|PSV|1|0
FC Emmen|PSV~06.08.2022|PSV|FC Emmen|4|1
Vitesse|Willem II~24.04.2022|Willem II|Vitesse|1|0
Vitesse|Willem II~22.08.2021|Vitesse|Willem II|0|3
Cambuur|Heracles~22.12.2021|Heracles|Cambuur|1|1
Cambuur|Heracles~23.09.2021|Cambuur|Heracles|2|1`;
const PORR=`Estoril|Famalicão|1|1
Marítimo|Casa Pia|1|0
Guimarães|Arouca|0|1
Estrela Amadora|Sporting|2|2
Porto|Alverca|2|0
Benfica|Académico Viseu|2|2
Gil Vicente|Rio Ave|1|0
Moreirense|Braga|2|2
Santa Clara|Nacional|2|2
Sporting|Guimarães|3|2
Alverca|Estrela Amadora|2|2
Académico Viseu|Santa Clara|0|1
Rio Ave|Porto|0|2
Nacional|Estoril|2|0
Arouca|Moreirense|4|0
Famalicão|Marítimo|1|2
Casa Pia|Benfica|0|7
Marítimo|Académico Viseu|2|2
Estoril|Rio Ave|0|2
Sporting|Alverca|3|1
Guimarães|Nacional|1|0
Santa Clara|Famalicão|1|0
Porto|Arouca|2|0
Gil Vicente|Casa Pia|2|0
Rio Ave|Sporting|0|4
Alverca|Santa Clara|1|1
Arouca|Marítimo|2|1
Académico Viseu|Porto|0|3
Nacional|Estrela Amadora|2|3
Casa Pia|Moreirense|0|1
Famalicão|Gil Vicente|0|0
Benfica|Estoril|2|1
Braga|Guimarães|1|0
Porto|Moreirense|2|1
Estrela Amadora|Famalicão|2|2
Alverca|Braga|1|2
Marítimo|Benfica|0|3
Sporting|Nacional|2|0
Santa Clara|Rio Ave|4|0
Guimarães|Casa Pia|0|0
Gil Vicente|Académico Viseu|0|1
Estoril|Arouca|0|0
Moreirense|Benfica|0|4
Estrela Amadora|Braga|2|1
Nacional|Alverca|1|3
Casa Pia|Porto|1|4
Académico Viseu|Guimarães|2|1
Arouca|Santa Clara|1|2
Benfica|Gil Vicente|3|1
Famalicão|Sporting|1|1
Rio Ave|Estrela Amadora|3|3
Moreirense|Marítimo|3|1
Braga|Estoril|1|0
Gil Vicente|Marítimo|1|1
Nacional|Famalicão|0|4
Alverca|Rio Ave|1|0
Sporting|Arouca|2|2
Estrela Amadora|Académico Viseu|0|2
Guimarães|Moreirense|1|1
Estoril|Casa Pia|1|2
Santa Clara|Braga|0|0
Porto|Benfica|3|1
Moreirense|Gil Vicente|0|1
Braga|Sporting|1|3
Marítimo|Porto|1|2
Académico Viseu|Estoril|2|1
Casa Pia|Santa Clara|0|1
Rio Ave|Nacional|3|2
Benfica|Guimarães|2|0
Arouca|Estrela Amadora|1|0
Famalicão|Alverca|1|4
Braga|Gil Vicente|1|2
Guimarães|Marítimo|5|0
Estrela Amadora|Casa Pia|0|2
Alverca|Arouca|0|1
Gil Vicente|Porto|0|1
Estoril|Moreirense|1|3
Nacional|Braga|1|0
Rio Ave|Famalicão|0|4
Sporting|Académico Viseu|1|2
Santa Clara|Benfica|1|2
Casa Pia|Sporting|0|2
Moreirense|Estrela Amadora|2|1
Porto|Estoril|4|0
Arouca|Nacional|1|0
Académico Viseu|Rio Ave|2|1
Marítimo|Santa Clara|0|2
Braga|Famalicão|3|0
Benfica|Alverca|1|0
Gil Vicente|Guimarães|0|0`,PORH=`Alverca|Benfica~02.11.2026|Benfica|Alverca|1|0
Alverca|Benfica~08.02.2026|Benfica|Alverca|2|1
Alverca|Benfica~31.08.2025|Alverca|Benfica|1|2
Gil Vicente|Guimarães~02.11.2026|Gil Vicente|Guimarães|0|0
Gil Vicente|Guimarães~18.04.2026|Gil Vicente|Guimarães|0|1
Gil Vicente|Guimarães~08.12.2025|Guimarães|Gil Vicente|0|0
Gil Vicente|Guimarães~11.04.2025|Gil Vicente|Guimarães|0|1
Gil Vicente|Guimarães~02.12.2024|Guimarães|Gil Vicente|4|0
Arouca|Nacional~01.11.2026|Arouca|Nacional|1|0
Arouca|Nacional~21.02.2026|Arouca|Nacional|3|0
Arouca|Nacional~20.09.2025|Nacional|Arouca|1|2
Arouca|Nacional~01.02.2025|Nacional|Arouca|1|2
Arouca|Nacional~25.08.2024|Arouca|Nacional|1|0
Académico Viseu|Rio Ave~01.11.2026|Académico Viseu|Rio Ave|2|1
Marítimo|Santa Clara~01.11.2026|Marítimo|Santa Clara|0|2
Marítimo|Santa Clara~25.02.2023|Marítimo|Santa Clara|3|1
Marítimo|Santa Clara~04.09.2022|Santa Clara|Marítimo|2|1
Marítimo|Santa Clara~23.04.2022|Santa Clara|Marítimo|2|2
Marítimo|Santa Clara~11.12.2021|Marítimo|Santa Clara|4|1
Braga|Famalicão~01.11.2026|Braga|Famalicão|3|0
Braga|Famalicão~19.04.2026|Braga|Famalicão|2|2
Braga|Famalicão~06.12.2025|Famalicão|Braga|1|2
Braga|Famalicão~25.04.2025|Famalicão|Braga|1|1
Braga|Famalicão~16.12.2024|Braga|Famalicão|3|3
Estrela Amadora|Moreirense~31.10.2026|Moreirense|Estrela Amadora|2|1
Estrela Amadora|Moreirense~02.05.2026|Moreirense|Estrela Amadora|3|2
Estrela Amadora|Moreirense~20.12.2025|Estrela Amadora|Moreirense|0|0
Estrela Amadora|Moreirense~02.03.2025|Moreirense|Estrela Amadora|1|1
Estrela Amadora|Moreirense~28.09.2024|Estrela Amadora|Moreirense|2|1
Estoril|Porto~31.10.2026|Porto|Estoril|4|0
Estoril|Porto~12.04.2026|Estoril|Porto|1|3
Estoril|Porto~30.11.2025|Porto|Estoril|1|0
Estoril|Porto~30.03.2025|Estoril|Porto|1|2
Estoril|Porto~03.11.2024|Porto|Estoril|4|0
Casa Pia|Sporting~30.10.2026|Casa Pia|Sporting|0|2
Casa Pia|Sporting~16.01.2026|Sporting|Casa Pia|3|0
Casa Pia|Sporting~08.08.2025|Casa Pia|Sporting|0|2
Casa Pia|Sporting~09.03.2025|Casa Pia|Sporting|1|3
Casa Pia|Sporting~05.10.2024|Sporting|Casa Pia|2|0
Benfica|Santa Clara~26.10.2026|Santa Clara|Benfica|1|2
Benfica|Santa Clara~13.02.2026|Santa Clara|Benfica|1|2
Benfica|Santa Clara~12.09.2025|Benfica|Santa Clara|1|1
Benfica|Santa Clara~15.02.2025|Santa Clara|Benfica|0|1
Benfica|Santa Clara~14.09.2024|Benfica|Santa Clara|4|1
Estoril|Moreirense~25.10.2026|Estoril|Moreirense|1|3
Estoril|Moreirense~20.04.2026|Moreirense|Estoril|1|0
Estoril|Moreirense~07.12.2025|Estoril|Moreirense|3|3
Estoril|Moreirense~11.05.2025|Moreirense|Estoril|2|2
Estoril|Moreirense~28.12.2024|Estoril|Moreirense|2|2
Braga|Nacional~25.10.2026|Nacional|Braga|1|0
Braga|Nacional~28.02.2026|Nacional|Braga|1|2
Braga|Nacional~28.09.2025|Braga|Nacional|0|1
Braga|Nacional~21.02.2025|Braga|Nacional|1|0
Braga|Nacional~20.09.2024|Nacional|Braga|0|3
Famalicão|Rio Ave~25.10.2026|Rio Ave|Famalicão|0|4
Famalicão|Rio Ave~01.03.2026|Rio Ave|Famalicão|0|0
Famalicão|Rio Ave~28.09.2025|Famalicão|Rio Ave|0|0
Famalicão|Rio Ave~10.03.2025|Famalicão|Rio Ave|1|0
Famalicão|Rio Ave~04.10.2024|Rio Ave|Famalicão|1|1
Académico Viseu|Sporting~25.10.2026|Sporting|Académico Viseu|1|2
Casa Pia|Estrela Amadora~24.10.2026|Estrela Amadora|Casa Pia|0|2
Casa Pia|Estrela Amadora~20.03.2026|Estrela Amadora|Casa Pia|4|0
Casa Pia|Estrela Amadora~01.11.2025|Casa Pia|Estrela Amadora|3|5
Casa Pia|Estrela Amadora~09.02.2025|Casa Pia|Estrela Amadora|1|0
Casa Pia|Estrela Amadora~31.08.2024|Estrela Amadora|Casa Pia|0|1
Alverca|Arouca~24.10.2026|Alverca|Arouca|0|1
Alverca|Arouca~24.04.2026|Alverca|Arouca|2|1
Alverca|Arouca~14.12.2025|Arouca|Alverca|1|0
Gil Vicente|Porto~24.10.2026|Gil Vicente|Porto|0|1
Gil Vicente|Porto~26.01.2026|Porto|Gil Vicente|3|0
Gil Vicente|Porto~18.08.2025|Gil Vicente|Porto|0|2
Gil Vicente|Porto~19.01.2025|Gil Vicente|Porto|3|1
Gil Vicente|Porto~10.08.2024|Porto|Gil Vicente|3|0
Guimarães|Marítimo~23.10.2026|Guimarães|Marítimo|5|0
Guimarães|Marítimo~29.04.2023|Marítimo|Guimarães|1|2
Guimarães|Marítimo~13.11.2022|Guimarães|Marítimo|1|0
Guimarães|Marítimo~13.03.2022|Marítimo|Guimarães|0|1
Guimarães|Marítimo~22.10.2021|Guimarães|Marítimo|2|1
Braga|Gil Vicente~19.10.2026|Braga|Gil Vicente|1|2
Braga|Gil Vicente~14.02.2026|Gil Vicente|Braga|2|1
Braga|Gil Vicente~14.09.2025|Braga|Gil Vicente|0|1
Braga|Gil Vicente~09.02.2025|Braga|Gil Vicente|2|0
Braga|Gil Vicente~01.09.2024|Gil Vicente|Braga|0|0
Alverca|Famalicão~12.10.2026|Famalicão|Alverca|1|4
Alverca|Famalicão~16.05.2026|Famalicão|Alverca|1|0
Alverca|Famalicão~04.01.2026|Alverca|Famalicão|1|0
Nacional|Rio Ave~11.10.2026|Rio Ave|Nacional|3|2
Nacional|Rio Ave~25.01.2026|Nacional|Rio Ave|4|0
Nacional|Rio Ave~17.08.2025|Rio Ave|Nacional|1|1
Nacional|Rio Ave~10.05.2025|Nacional|Rio Ave|3|3
Nacional|Rio Ave~29.12.2024|Rio Ave|Nacional|2|1
Benfica|Guimarães~11.10.2026|Benfica|Guimarães|2|0
Benfica|Guimarães~21.03.2026|Benfica|Guimarães|3|0
Benfica|Guimarães~01.11.2025|Guimarães|Benfica|0|3
Benfica|Guimarães~19.04.2025|Guimarães|Benfica|0|3
Benfica|Guimarães~07.12.2024|Benfica|Guimarães|1|0
Arouca|Estrela Amadora~11.10.2026|Arouca|Estrela Amadora|1|0
Arouca|Estrela Amadora~19.04.2026|Arouca|Estrela Amadora|1|0
Arouca|Estrela Amadora~07.12.2025|Estrela Amadora|Arouca|3|1
Arouca|Estrela Amadora~19.04.2025|Arouca|Estrela Amadora|1|0
Arouca|Estrela Amadora~09.12.2024|Estrela Amadora|Arouca|2|1
Marítimo|Porto~10.10.2026|Marítimo|Porto|1|2
Marítimo|Porto~01.02.2023|Marítimo|Porto|0|2
Marítimo|Porto~06.08.2022|Porto|Marítimo|5|1
Marítimo|Porto~30.01.2022|Porto|Marítimo|2|1
Marítimo|Porto~22.08.2021|Marítimo|Porto|1|1
Académico Viseu|Estoril~10.10.2026|Académico Viseu|Estoril|2|1
Casa Pia|Santa Clara~10.10.2026|Casa Pia|Santa Clara|0|1
Casa Pia|Santa Clara~18.04.2026|Casa Pia|Santa Clara|0|0
Casa Pia|Santa Clara~06.12.2025|Santa Clara|Casa Pia|1|0
Casa Pia|Santa Clara~01.02.2025|Santa Clara|Casa Pia|2|1
Casa Pia|Santa Clara~24.08.2024|Casa Pia|Santa Clara|0|2
Gil Vicente|Moreirense~09.10.2026|Moreirense|Gil Vicente|0|1
Gil Vicente|Moreirense~07.02.2026|Moreirense|Gil Vicente|1|2
Gil Vicente|Moreirense~29.08.2025|Gil Vicente|Moreirense|2|0
Gil Vicente|Moreirense~06.04.2025|Gil Vicente|Moreirense|0|1
Gil Vicente|Moreirense~08.11.2024|Moreirense|Gil Vicente|3|2
Braga|Sporting~09.10.2026|Braga|Sporting|1|3
Braga|Sporting~07.03.2026|Braga|Sporting|2|2
Braga|Sporting~05.10.2025|Sporting|Braga|1|1
Braga|Sporting~07.04.2025|Sporting|Braga|1|1
Braga|Sporting~10.11.2024|Braga|Sporting|2|4
Académico Viseu|Estrela Amadora~20.09.2026|Estrela Amadora|Académico Viseu|0|2
Guimarães|Moreirense~20.09.2026|Guimarães|Moreirense|1|1
Guimarães|Moreirense~30.01.2026|Guimarães|Moreirense|1|0
Guimarães|Moreirense~23.08.2025|Moreirense|Guimarães|2|0
Guimarães|Moreirense~30.03.2025|Moreirense|Guimarães|2|2
Guimarães|Moreirense~03.11.2024|Guimarães|Moreirense|1|0
Casa Pia|Estoril~20.09.2026|Estoril|Casa Pia|1|2
Casa Pia|Estoril~07.03.2026|Estoril|Casa Pia|0|0
Casa Pia|Estoril~03.10.2025|Casa Pia|Estoril|2|2
Casa Pia|Estoril~29.04.2025|Casa Pia|Estoril|1|3
Casa Pia|Estoril~15.12.2024|Estoril|Casa Pia|0|2
Braga|Santa Clara~20.09.2026|Santa Clara|Braga|0|0
Braga|Santa Clara~26.04.2026|Santa Clara|Braga|2|1
Braga|Santa Clara~15.12.2025|Braga|Santa Clara|1|0
Braga|Santa Clara~03.05.2025|Braga|Santa Clara|1|1
Braga|Santa Clara~22.12.2024|Santa Clara|Braga|0|2
Benfica|Porto~20.09.2026|Porto|Benfica|3|1
Benfica|Porto~08.03.2026|Benfica|Porto|2|2
Benfica|Porto~05.10.2025|Porto|Benfica|0|0
Benfica|Porto~06.04.2025|Porto|Benfica|1|4
Benfica|Porto~10.11.2024|Benfica|Porto|4|1
Gil Vicente|Marítimo~19.09.2026|Gil Vicente|Marítimo|1|1
Gil Vicente|Marítimo~05.03.2023|Gil Vicente|Marítimo|2|0
Gil Vicente|Marítimo~11.09.2022|Marítimo|Gil Vicente|1|2
Gil Vicente|Marítimo~20.03.2022|Gil Vicente|Marítimo|1|1
Gil Vicente|Marítimo~31.10.2021|Marítimo|Gil Vicente|1|2
Famalicão|Nacional~19.09.2026|Nacional|Famalicão|0|4
Famalicão|Nacional~21.03.2026|Famalicão|Nacional|1|0
Famalicão|Nacional~01.11.2025|Nacional|Famalicão|0|1
Famalicão|Nacional~01.03.2025|Nacional|Famalicão|2|1
Famalicão|Nacional~29.09.2024|Famalicão|Nacional|0|0
Alverca|Rio Ave~19.09.2026|Alverca|Rio Ave|1|0
Alverca|Rio Ave~04.04.2026|Rio Ave|Alverca|1|2
Alverca|Rio Ave~08.11.2025|Alverca|Rio Ave|1|1
Arouca|Sporting~19.09.2026|Sporting|Arouca|2|2
Arouca|Sporting~24.01.2026|Arouca|Sporting|1|2
Arouca|Sporting~17.08.2025|Sporting|Arouca|6|0
Arouca|Sporting~15.02.2025|Sporting|Arouca|2|2
Arouca|Sporting~13.09.2024|Arouca|Sporting|0|3
Estrela Amadora|Rio Ave~14.09.2026|Rio Ave|Estrela Amadora|3|3
Estrela Amadora|Rio Ave~15.03.2026|Rio Ave|Estrela Amadora|2|1
Estrela Amadora|Rio Ave~25.10.2025|Estrela Amadora|Rio Ave|1|2
Estrela Amadora|Rio Ave~05.05.2025|Rio Ave|Estrela Amadora|2|0
Estrela Amadora|Rio Ave~23.12.2024|Estrela Amadora|Rio Ave|1|0
Marítimo|Moreirense~14.09.2026|Moreirense|Marítimo|3|1
Marítimo|Moreirense~06.03.2022|Moreirense|Marítimo|0|1
Marítimo|Moreirense~01.10.2021|Marítimo|Moreirense|0|0
Braga|Estoril~14.09.2026|Braga|Estoril|1|0
Braga|Estoril~03.05.2026|Braga|Estoril|1|1
Braga|Estoril~19.12.2025|Estoril|Braga|1|0
Braga|Estoril~19.04.2025|Estoril|Braga|0|2
Braga|Estoril~06.12.2024|Braga|Estoril|2|2
Arouca|Santa Clara~13.09.2026|Arouca|Santa Clara|1|2
Arouca|Santa Clara~02.05.2026|Arouca|Santa Clara|2|2
Arouca|Santa Clara~21.12.2025|Santa Clara|Arouca|0|0
Arouca|Santa Clara~26.04.2025|Santa Clara|Arouca|2|0
Arouca|Santa Clara~15.12.2024|Arouca|Santa Clara|1|0
Benfica|Gil Vicente~13.09.2026|Benfica|Gil Vicente|3|1
Benfica|Gil Vicente~02.03.2026|Gil Vicente|Benfica|1|2
Benfica|Gil Vicente~26.09.2025|Benfica|Gil Vicente|2|1
Benfica|Gil Vicente~28.03.2025|Gil Vicente|Benfica|0|3
Benfica|Gil Vicente~28.09.2024|Benfica|Gil Vicente|5|1
Famalicão|Sporting~13.09.2026|Famalicão|Sporting|1|1
Famalicão|Sporting~15.02.2026|Sporting|Famalicão|1|0
Famalicão|Sporting~13.09.2025|Famalicão|Sporting|1|2
Famalicão|Sporting~15.03.2025|Sporting|Famalicão|3|1
Famalicão|Sporting~26.10.2024|Famalicão|Sporting|0|3
Alverca|Nacional~12.09.2026|Nacional|Alverca|1|3
Alverca|Nacional~18.04.2026|Nacional|Alverca|1|0
Alverca|Nacional~07.12.2025|Alverca|Nacional|1|0
Casa Pia|Porto~12.09.2026|Casa Pia|Porto|1|4
Casa Pia|Porto~02.02.2026|Casa Pia|Porto|2|1
Casa Pia|Porto~24.08.2025|Porto|Casa Pia|4|0
Casa Pia|Porto~12.04.2025|Casa Pia|Porto|0|1
Casa Pia|Porto~02.12.2024|Porto|Casa Pia|2|0
Académico Viseu|Guimarães~12.09.2026|Académico Viseu|Guimarães|2|1
Braga|Estrela Amadora~10.09.2026|Estrela Amadora|Braga|2|1
Braga|Estrela Amadora~16.05.2026|Braga|Estrela Amadora|2|2
Braga|Estrela Amadora~03.01.2026|Estrela Amadora|Braga|3|3
Braga|Estrela Amadora~19.01.2025|Estrela Amadora|Braga|0|1
Braga|Estrela Amadora~11.08.2024|Braga|Estrela Amadora|1|1
Benfica|Moreirense~09.09.2026|Moreirense|Benfica|0|4
Benfica|Moreirense~25.04.2026|Benfica|Moreirense|4|1
Benfica|Moreirense~14.12.2025|Moreirense|Benfica|0|4
Benfica|Moreirense~08.02.2025|Benfica|Moreirense|3|2
Benfica|Moreirense~30.08.2024|Moreirense|Benfica|1|1
Arouca|Estoril~07.09.2026|Estoril|Arouca|0|0
Arouca|Estoril~06.04.2026|Arouca|Estoril|3|2
Arouca|Estoril~07.11.2025|Estoril|Arouca|4|3
Arouca|Estoril~16.03.2025|Arouca|Estoril|1|1
Arouca|Estoril~26.10.2024|Estoril|Arouca|4|1
Rio Ave|Santa Clara~06.09.2026|Santa Clara|Rio Ave|4|0
Rio Ave|Santa Clara~11.04.2026|Santa Clara|Rio Ave|0|2
Rio Ave|Santa Clara~30.11.2025|Rio Ave|Santa Clara|1|1
Rio Ave|Santa Clara~18.04.2025|Rio Ave|Santa Clara|1|1
Rio Ave|Santa Clara~07.12.2024|Santa Clara|Rio Ave|1|0
Casa Pia|Guimarães~06.09.2026|Guimarães|Casa Pia|0|0
Casa Pia|Guimarães~11.05.2026|Guimarães|Casa Pia|0|1
Casa Pia|Guimarães~28.12.2025|Casa Pia|Guimarães|0|0
Casa Pia|Guimarães~01.03.2025|Guimarães|Casa Pia|1|0
Casa Pia|Guimarães~28.09.2024|Casa Pia|Guimarães|1|1
Académico Viseu|Gil Vicente~06.09.2026|Gil Vicente|Académico Viseu|0|1
Estrela Amadora|Famalicão~05.09.2026|Estrela Amadora|Famalicão|2|2
Estrela Amadora|Famalicão~11.05.2026|Estrela Amadora|Famalicão|0|0
Estrela Amadora|Famalicão~27.12.2025|Famalicão|Estrela Amadora|2|3
Estrela Amadora|Famalicão~25.01.2025|Famalicão|Estrela Amadora|0|0
Estrela Amadora|Famalicão~19.08.2024|Estrela Amadora|Famalicão|0|3
Alverca|Braga~05.09.2026|Alverca|Braga|1|2
Alverca|Braga~25.01.2026|Braga|Alverca|5|0
Alverca|Braga~17.08.2025|Alverca|Braga|0|3
Benfica|Marítimo~05.09.2026|Marítimo|Benfica|0|3
Benfica|Marítimo~12.03.2023|Marítimo|Benfica|0|3
Benfica|Marítimo~18.09.2022|Benfica|Marítimo|5|0
Benfica|Marítimo~30.04.2022|Marítimo|Benfica|0|1
Benfica|Marítimo~19.12.2021|Benfica|Marítimo|7|1
Nacional|Sporting~05.09.2026|Sporting|Nacional|2|0
Nacional|Sporting~01.02.2026|Sporting|Nacional|2|1
Nacional|Sporting~23.08.2025|Nacional|Sporting|1|4
Nacional|Sporting~25.01.2025|Sporting|Nacional|2|0
Nacional|Sporting~17.08.2024|Nacional|Sporting|1|6
Moreirense|Porto~04.09.2026|Porto|Moreirense|2|1
Moreirense|Porto~15.03.2026|Porto|Moreirense|3|0
Moreirense|Porto~27.10.2025|Moreirense|Porto|1|2
Moreirense|Porto~02.05.2025|Porto|Moreirense|3|1
Moreirense|Porto~21.12.2024|Moreirense|Porto|0|3
Benfica|Estoril~31.08.2026|Benfica|Estoril|2|1
Benfica|Estoril~16.05.2026|Estoril|Benfica|1|3
Benfica|Estoril~03.01.2026|Benfica|Estoril|3|1
Benfica|Estoril~03.05.2025|Estoril|Benfica|1|2
Benfica|Estoril~23.12.2024|Benfica|Estoril|3|0
Braga|Guimarães~31.08.2026|Braga|Guimarães|1|0
Braga|Guimarães~21.02.2026|Braga|Guimarães|3|2
Braga|Guimarães~20.09.2025|Guimarães|Braga|1|1
Braga|Guimarães~16.02.2025|Guimarães|Braga|0|0
Braga|Guimarães~15.09.2024|Braga|Guimarães|0|2
Estrela Amadora|Nacional~30.08.2026|Nacional|Estrela Amadora|2|3
Estrela Amadora|Nacional~04.04.2026|Nacional|Estrela Amadora|2|0
Estrela Amadora|Nacional~09.11.2025|Estrela Amadora|Nacional|1|1
Estrela Amadora|Nacional~06.04.2025|Nacional|Estrela Amadora|0|1
Estrela Amadora|Nacional~10.11.2024|Estrela Amadora|Nacional|2|0
Casa Pia|Moreirense~30.08.2026|Casa Pia|Moreirense|0|1
Casa Pia|Moreirense~01.03.2026|Casa Pia|Moreirense|1|1
Casa Pia|Moreirense~27.09.2025|Moreirense|Casa Pia|2|1
Casa Pia|Moreirense~15.02.2025|Moreirense|Casa Pia|3|2
Casa Pia|Moreirense~14.09.2024|Casa Pia|Moreirense|3|1
Famalicão|Gil Vicente~30.08.2026|Famalicão|Gil Vicente|0|0
Famalicão|Gil Vicente~01.02.2026|Gil Vicente|Famalicão|5|0
Famalicão|Gil Vicente~24.08.2025|Famalicão|Gil Vicente|0|0
Famalicão|Gil Vicente~17.02.2025|Gil Vicente|Famalicão|0|2
Famalicão|Gil Vicente~14.09.2024|Famalicão|Gil Vicente|1|1
Alverca|Santa Clara~29.08.2026|Alverca|Santa Clara|1|1
Alverca|Santa Clara~21.02.2026|Alverca|Santa Clara|1|1
Alverca|Santa Clara~20.09.2025|Santa Clara|Alverca|2|1
Arouca|Marítimo~29.08.2026|Arouca|Marítimo|2|1
Arouca|Marítimo~08.04.2023|Arouca|Marítimo|1|0
Arouca|Marítimo~23.10.2022|Marítimo|Arouca|1|1
Arouca|Marítimo~14.02.2022|Arouca|Marítimo|0|3
Arouca|Marítimo~13.09.2021|Marítimo|Arouca|2|2
Académico Viseu|Porto~29.08.2026|Académico Viseu|Porto|0|3
Rio Ave|Sporting~28.08.2026|Rio Ave|Sporting|0|4
Rio Ave|Sporting~11.05.2026|Rio Ave|Sporting|1|4
Rio Ave|Sporting~28.12.2025|Sporting|Rio Ave|4|0
Rio Ave|Sporting~18.01.2025|Rio Ave|Sporting|0|3
Rio Ave|Sporting~09.08.2024|Sporting|Rio Ave|3|1
Casa Pia|Gil Vicente~24.08.2026|Gil Vicente|Casa Pia|2|0
Casa Pia|Gil Vicente~27.04.2026|Gil Vicente|Casa Pia|2|1
Casa Pia|Gil Vicente~13.12.2025|Casa Pia|Gil Vicente|1|1
Casa Pia|Gil Vicente~22.02.2025|Casa Pia|Gil Vicente|1|0
Casa Pia|Gil Vicente~22.09.2024|Gil Vicente|Casa Pia|1|1
Guimarães|Nacional~23.08.2026|Guimarães|Nacional|1|0
Guimarães|Nacional~16.05.2026|Nacional|Guimarães|2|0
Guimarães|Nacional~02.01.2026|Guimarães|Nacional|2|1
Guimarães|Nacional~03.05.2025|Nacional|Guimarães|1|2
Guimarães|Nacional~23.12.2024|Guimarães|Nacional|2|2
Famalicão|Santa Clara~23.08.2026|Santa Clara|Famalicão|1|0
Famalicão|Santa Clara~18.01.2026|Santa Clara|Famalicão|0|1
Famalicão|Santa Clara~10.08.2025|Famalicão|Santa Clara|3|0
Famalicão|Santa Clara~10.05.2025|Santa Clara|Famalicão|2|1
Famalicão|Santa Clara~30.12.2024|Famalicão|Santa Clara|1|2
Arouca|Porto~23.08.2026|Porto|Arouca|2|0
Arouca|Porto~27.02.2026|Porto|Arouca|3|1
Arouca|Porto~29.09.2025|Arouca|Porto|0|4
Arouca|Porto~01.03.2025|Arouca|Porto|0|2
Arouca|Porto~29.09.2024|Porto|Arouca|4|0
Académico Viseu|Marítimo~22.08.2026|Marítimo|Académico Viseu|2|2
Estoril|Rio Ave~22.08.2026|Estoril|Rio Ave|0|2
Estoril|Rio Ave~22.03.2026|Estoril|Rio Ave|1|2
Estoril|Rio Ave~01.11.2025|Rio Ave|Estoril|0|4
Estoril|Rio Ave~22.02.2025|Estoril|Rio Ave|2|1
Estoril|Rio Ave~21.09.2024|Rio Ave|Estoril|2|2
Alverca|Sporting~22.08.2026|Sporting|Alverca|3|1
Alverca|Sporting~22.03.2026|Alverca|Sporting|1|4
Alverca|Sporting~31.10.2025|Sporting|Alverca|2|0
Benfica|Casa Pia~17.08.2026|Casa Pia|Benfica|0|7
Benfica|Casa Pia~06.04.2026|Casa Pia|Benfica|1|1
Benfica|Casa Pia~09.11.2025|Benfica|Casa Pia|2|2
Benfica|Casa Pia~25.01.2025|Casa Pia|Benfica|3|1
Benfica|Casa Pia~17.08.2024|Benfica|Casa Pia|3|0
Estoril|Nacional~16.08.2026|Nacional|Estoril|2|0
Estoril|Nacional~15.03.2026|Nacional|Estoril|0|1
Estoril|Nacional~26.10.2025|Estoril|Nacional|1|1
Estoril|Nacional~15.02.2025|Nacional|Estoril|2|2
Estoril|Nacional~15.09.2024|Estoril|Nacional|1|0
Arouca|Moreirense~16.08.2026|Arouca|Moreirense|4|0
Arouca|Moreirense~21.03.2026|Moreirense|Arouca|0|1
Arouca|Moreirense~02.11.2025|Arouca|Moreirense|0|2
Arouca|Moreirense~24.01.2025|Arouca|Moreirense|1|0
Arouca|Moreirense~18.08.2024|Moreirense|Arouca|3|1
Famalicão|Marítimo~16.08.2026|Famalicão|Marítimo|1|2
Famalicão|Marítimo~22.04.2023|Famalicão|Marítimo|3|2
Famalicão|Marítimo~06.11.2022|Marítimo|Famalicão|0|0
Famalicão|Marítimo~20.02.2022|Marítimo|Famalicão|0|1
Famalicão|Marítimo~18.09.2021|Famalicão|Marítimo|0|0
Alverca|Estrela Amadora~15.08.2026|Alverca|Estrela Amadora|2|2
Alverca|Estrela Amadora~31.01.2026|Alverca|Estrela Amadora|1|1
Alverca|Estrela Amadora~25.08.2025|Estrela Amadora|Alverca|2|2
Académico Viseu|Santa Clara~15.08.2026|Académico Viseu|Santa Clara|0|1
Porto|Rio Ave~15.08.2026|Rio Ave|Porto|0|2
Porto|Rio Ave~22.02.2026|Porto|Rio Ave|1|0
Porto|Rio Ave~19.09.2025|Rio Ave|Porto|0|3
Porto|Rio Ave~03.02.2025|Rio Ave|Porto|2|2
Porto|Rio Ave~24.08.2024|Porto|Rio Ave|2|0
Guimarães|Sporting~14.08.2026|Sporting|Guimarães|3|2
Guimarães|Sporting~04.05.2026|Sporting|Guimarães|5|1
Guimarães|Sporting~23.12.2025|Guimarães|Sporting|1|4
Guimarães|Sporting~17.05.2025|Sporting|Guimarães|2|0
Guimarães|Sporting~03.01.2025|Guimarães|Sporting|4|4
Nacional|Santa Clara~10.08.2026|Santa Clara|Nacional|2|2
Nacional|Santa Clara~11.05.2026|Santa Clara|Nacional|2|0
Nacional|Santa Clara~11.01.2026|Nacional|Santa Clara|3|3
Nacional|Santa Clara~30.03.2025|Santa Clara|Nacional|1|0
Nacional|Santa Clara~04.11.2024|Nacional|Santa Clara|2|0
Alverca|Porto~09.08.2026|Porto|Alverca|2|0
Alverca|Porto~02.05.2026|Porto|Alverca|1|0
Alverca|Porto~22.12.2025|Alverca|Porto|0|3
Académico Viseu|Benfica~09.08.2026|Benfica|Académico Viseu|2|2
Gil Vicente|Rio Ave~09.08.2026|Gil Vicente|Rio Ave|1|0
Gil Vicente|Rio Ave~03.05.2026|Rio Ave|Gil Vicente|0|0
Gil Vicente|Rio Ave~20.12.2025|Gil Vicente|Rio Ave|2|2
Gil Vicente|Rio Ave~16.05.2025|Rio Ave|Gil Vicente|1|1
Gil Vicente|Rio Ave~06.01.2025|Gil Vicente|Rio Ave|1|1
Braga|Moreirense~09.08.2026|Moreirense|Braga|2|2
Braga|Moreirense~04.04.2026|Moreirense|Braga|0|1
Braga|Moreirense~09.11.2025|Braga|Moreirense|2|1
Braga|Moreirense~03.02.2025|Moreirense|Braga|1|2
Braga|Moreirense~25.08.2024|Braga|Moreirense|3|1
Casa Pia|Marítimo~08.08.2026|Marítimo|Casa Pia|1|0
Casa Pia|Marítimo~19.03.2023|Casa Pia|Marítimo|2|0
Casa Pia|Marítimo~03.10.2022|Marítimo|Casa Pia|1|2
Arouca|Guimarães~08.08.2026|Guimarães|Arouca|0|1
Arouca|Guimarães~07.02.2026|Arouca|Guimarães|3|2
Arouca|Guimarães~30.08.2025|Guimarães|Arouca|1|1
Arouca|Guimarães~18.01.2025|Guimarães|Arouca|2|2
Arouca|Guimarães~12.08.2024|Arouca|Guimarães|0|1
Estrela Amadora|Sporting~08.08.2026|Estrela Amadora|Sporting|2|2
Estrela Amadora|Sporting~11.04.2026|Estrela Amadora|Sporting|0|1
Estrela Amadora|Sporting~30.11.2025|Sporting|Estrela Amadora|4|0
Estrela Amadora|Sporting~29.03.2025|Estrela Amadora|Sporting|0|3
Estrela Amadora|Sporting~01.11.2024|Sporting|Estrela Amadora|5|1
Estoril|Famalicão~07.08.2026|Estoril|Famalicão|1|1
Estoril|Famalicão~26.04.2026|Estoril|Famalicão|0|1
Estoril|Famalicão~14.12.2025|Famalicão|Estoril|4|0
Estoril|Famalicão~12.04.2025|Famalicão|Estoril|3|0
Estoril|Famalicão~01.12.2024|Estoril|Famalicão|2|1
AVS|Moreirense~16.05.2026|Moreirense|AVS|0|0
AVS|Moreirense~03.01.2026|AVS|Moreirense|0|2
AVS|Moreirense~17.05.2025|AVS|Moreirense|0|3
AVS|Moreirense~04.01.2025|Moreirense|AVS|1|1
Porto|Santa Clara~16.05.2026|Porto|Santa Clara|1|0
Porto|Santa Clara~04.01.2026|Santa Clara|Porto|0|1
Porto|Santa Clara~26.01.2025|Porto|Santa Clara|1|1
Porto|Santa Clara~16.08.2024|Santa Clara|Porto|0|2
Porto|Santa Clara~15.04.2023|Porto|Santa Clara|2|1
Arouca|Tondela~16.05.2026|Arouca|Tondela|3|1
Arouca|Tondela~03.01.2026|Tondela|Arouca|3|1
Arouca|Tondela~19.03.2022|Tondela|Arouca|2|2
Arouca|Tondela~29.10.2021|Arouca|Tondela|2|0
Casa Pia|Rio Ave~16.05.2026|Casa Pia|Rio Ave|1|1
Casa Pia|Rio Ave~04.01.2026|Rio Ave|Casa Pia|3|1
Casa Pia|Rio Ave~29.03.2025|Casa Pia|Rio Ave|2|1
Casa Pia|Rio Ave~02.11.2024|Rio Ave|Casa Pia|2|2
Casa Pia|Rio Ave~11.02.2024|Rio Ave|Casa Pia|1|0
Gil Vicente|Sporting~16.05.2026|Sporting|Gil Vicente|3|0
Gil Vicente|Sporting~02.01.2026|Gil Vicente|Sporting|1|1
Gil Vicente|Sporting~04.05.2025|Sporting|Gil Vicente|2|1
Gil Vicente|Sporting~22.12.2024|Gil Vicente|Sporting|0|0
Gil Vicente|Sporting~12.04.2024|Gil Vicente|Sporting|0|4
Benfica|Braga~11.05.2026|Benfica|Braga|2|2
Benfica|Braga~28.12.2025|Braga|Benfica|2|2
Benfica|Braga~17.05.2025|Braga|Benfica|1|1
Benfica|Braga~04.01.2025|Benfica|Braga|1|2
Benfica|Braga~27.04.2024|Benfica|Braga|3|1
Arouca|Gil Vicente~11.05.2026|Gil Vicente|Arouca|1|3
Arouca|Gil Vicente~28.12.2025|Arouca|Gil Vicente|2|2
Arouca|Gil Vicente~10.05.2025|Gil Vicente|Arouca|1|1
Arouca|Gil Vicente~27.12.2024|Arouca|Gil Vicente|1|1
Arouca|Gil Vicente~26.04.2024|Gil Vicente|Arouca|2|2
Moreirense|Tondela~11.05.2026|Tondela|Moreirense|2|0
Moreirense|Tondela~11.01.2026|Moreirense|Tondela|1|0
Moreirense|Tondela~16.04.2022|Moreirense|Tondela|2|0
Moreirense|Tondela~03.01.2022|Tondela|Moreirense|2|1
AVS|Porto~10.05.2026|AVS|Porto|3|1
AVS|Porto~29.12.2025|Porto|AVS|2|0
AVS|Porto~15.03.2025|Porto|AVS|2|0
AVS|Porto~28.10.2024|AVS|Porto|0|5
Alverca|Estoril~10.05.2026|Alverca|Estoril|1|1
Alverca|Estoril~27.12.2025|Estoril|Alverca|4|1
Casa Pia|Tondela~03.05.2026|Casa Pia|Tondela|0|1
Casa Pia|Tondela~21.12.2025|Tondela|Casa Pia|1|2
AVS|Nacional~02.05.2026|Nacional|AVS|1|2
AVS|Nacional~21.12.2025|AVS|Nacional|2|2
AVS|Nacional~19.01.2025|Nacional|AVS|3|1
AVS|Nacional~10.08.2024|AVS|Nacional|1|1
Benfica|Famalicão~02.05.2026|Famalicão|Benfica|2|2
Benfica|Famalicão~22.12.2025|Benfica|Famalicão|1|0
Benfica|Famalicão~17.01.2025|Benfica|Famalicão|4|0
Benfica|Famalicão~11.08.2024|Famalicão|Benfica|2|0
Benfica|Famalicão~05.05.2024|Famalicão|Benfica|2|0
Sporting|Tondela~29.04.2026|Sporting|Tondela|2|2
Sporting|Tondela~26.10.2025|Tondela|Sporting|0|3
Sporting|Tondela~09.04.2022|Tondela|Sporting|1|3
Sporting|Tondela~28.11.2021|Sporting|Tondela|2|0
Estrela Amadora|Porto~26.04.2026|Estrela Amadora|Porto|1|2
Estrela Amadora|Porto~15.12.2025|Porto|Estrela Amadora|3|1
Estrela Amadora|Porto~26.04.2025|Estrela Amadora|Porto|2|0
Estrela Amadora|Porto~16.12.2024|Porto|Estrela Amadora|2|0
Estrela Amadora|Porto~17.02.2024|Porto|Estrela Amadora|2|0
AVS|Sporting~26.04.2026|AVS|Sporting|1|1
AVS|Sporting~13.12.2025|Sporting|AVS|6|0
AVS|Sporting~23.02.2025|AVS|Sporting|2|2
AVS|Sporting~22.09.2024|Sporting|AVS|3|0
Nacional|Tondela~25.04.2026|Tondela|Nacional|0|2
Nacional|Tondela~15.12.2025|Nacional|Tondela|3|1
Guimarães|Rio Ave~25.04.2026|Guimarães|Rio Ave|2|0
Guimarães|Rio Ave~13.12.2025|Rio Ave|Guimarães|0|1
Guimarães|Rio Ave~27.04.2025|Guimarães|Rio Ave|3|0
Guimarães|Rio Ave~16.12.2024|Rio Ave|Guimarães|2|2
Guimarães|Rio Ave~04.05.2024|Rio Ave|Guimarães|2|1
Braga|Casa Pia~23.04.2026|Casa Pia|Braga|0|1
Braga|Casa Pia~26.10.2025|Braga|Casa Pia|4|0
Braga|Casa Pia~10.05.2025|Casa Pia|Braga|2|1
Braga|Casa Pia~29.12.2024|Braga|Casa Pia|1|2
Braga|Casa Pia~05.05.2024|Braga|Casa Pia|4|3
Benfica|Sporting~19.04.2026|Sporting|Benfica|1|2
Benfica|Sporting~05.12.2025|Benfica|Sporting|1|1
Benfica|Sporting~10.05.2025|Benfica|Sporting|1|1
Benfica|Sporting~29.12.2024|Sporting|Benfica|1|0
Benfica|Sporting~06.04.2024|Sporting|Benfica|2|1
Porto|Tondela~19.04.2026|Porto|Tondela|2|0
Porto|Tondela~07.12.2025|Tondela|Porto|0|2
Porto|Tondela~13.03.2022|Porto|Tondela|4|0
Porto|Tondela~23.10.2021|Tondela|Porto|1|3
AVS|Rio Ave~17.04.2026|Rio Ave|AVS|2|2
AVS|Rio Ave~06.12.2025|AVS|Rio Ave|1|2
AVS|Rio Ave~16.02.2025|Rio Ave|AVS|1|1
AVS|Rio Ave~14.09.2024|AVS|Rio Ave|1|0
Gil Vicente|Tondela~13.04.2026|Tondela|Gil Vicente|2|2
Gil Vicente|Tondela~29.11.2025|Gil Vicente|Tondela|0|1
Gil Vicente|Tondela~08.05.2022|Gil Vicente|Tondela|3|0
Gil Vicente|Tondela~28.12.2021|Tondela|Gil Vicente|0|3
Alverca|Casa Pia~12.04.2026|Alverca|Casa Pia|3|1
Alverca|Casa Pia~29.11.2025|Casa Pia|Alverca|0|2
Benfica|Nacional~12.04.2026|Benfica|Nacional|2|0
Benfica|Nacional~29.11.2025|Nacional|Benfica|1|2
Benfica|Nacional~08.03.2025|Benfica|Nacional|3|0
Benfica|Nacional~19.12.2024|Nacional|Benfica|0|2
Arouca|Braga~12.04.2026|Braga|Arouca|1|0
Arouca|Braga~01.12.2025|Arouca|Braga|0|4
Arouca|Braga~29.03.2025|Braga|Arouca|2|1
Arouca|Braga~03.11.2024|Arouca|Braga|1|2
Arouca|Braga~06.04.2024|Braga|Arouca|0|3
AVS|Guimarães~11.04.2026|AVS|Guimarães|1|1
AVS|Guimarães~28.11.2025|Guimarães|AVS|4|0
AVS|Guimarães~01.02.2025|Guimarães|AVS|2|0
AVS|Guimarães~25.08.2024|AVS|Guimarães|1|0
Famalicão|Moreirense~10.04.2026|Famalicão|Moreirense|1|1
Famalicão|Moreirense~29.11.2025|Moreirense|Famalicão|2|2
Famalicão|Moreirense~23.02.2025|Famalicão|Moreirense|2|0
Famalicão|Moreirense~21.09.2024|Moreirense|Famalicão|0|0
Famalicão|Moreirense~28.01.2024|Moreirense|Famalicão|1|0
Famalicão|Porto~04.04.2026|Porto|Famalicão|2|2
Famalicão|Porto~09.11.2025|Famalicão|Porto|0|1
Famalicão|Porto~18.04.2025|Porto|Famalicão|2|1
Famalicão|Porto~07.12.2024|Famalicão|Porto|1|1
Famalicão|Porto~13.04.2024|Porto|Famalicão|2|2
AVS|Gil Vicente~03.04.2026|Gil Vicente|AVS|3|0
AVS|Gil Vicente~09.11.2025|AVS|Gil Vicente|1|1
AVS|Gil Vicente~27.01.2025|AVS|Gil Vicente|1|0
AVS|Gil Vicente~16.08.2024|Gil Vicente|AVS|4|2
Guimarães|Tondela~03.04.2026|Guimarães|Tondela|5|0
Guimarães|Tondela~08.11.2025|Tondela|Guimarães|0|1
Guimarães|Tondela~24.04.2022|Tondela|Guimarães|1|1
Guimarães|Tondela~11.12.2021|Guimarães|Tondela|5|2
Santa Clara|Sporting~03.04.2026|Sporting|Santa Clara|4|2
Santa Clara|Sporting~08.11.2025|Santa Clara|Sporting|1|2
Santa Clara|Sporting~12.04.2025|Santa Clara|Sporting|0|1
Santa Clara|Sporting~30.11.2024|Sporting|Santa Clara|0|1
Santa Clara|Sporting~01.04.2023|Sporting|Santa Clara|3|0
Braga|Porto~22.03.2026|Braga|Porto|1|2
Braga|Porto~02.11.2025|Porto|Braga|2|1
Braga|Porto~08.03.2025|Braga|Porto|1|0
Braga|Porto~06.10.2024|Porto|Braga|2|1
Braga|Porto~18.05.2024|Braga|Porto|0|1
Gil Vicente|Santa Clara~21.03.2026|Santa Clara|Gil Vicente|1|0
Gil Vicente|Santa Clara~03.11.2025|Gil Vicente|Santa Clara|1|0
Gil Vicente|Santa Clara~15.03.2025|Gil Vicente|Santa Clara|0|1
Gil Vicente|Santa Clara~25.10.2024|Santa Clara|Gil Vicente|2|1
Gil Vicente|Santa Clara~06.05.2023|Santa Clara|Gil Vicente|3|2
AVS|Tondela~21.03.2026|Tondela|AVS|0|0
AVS|Tondela~02.11.2025|AVS|Tondela|2|2
AVS|Santa Clara~15.03.2026|AVS|Santa Clara|0|1
AVS|Santa Clara~25.10.2025|Santa Clara|AVS|2|0
AVS|Santa Clara~08.02.2025|AVS|Santa Clara|1|2
AVS|Santa Clara~31.08.2024|Santa Clara|AVS|2|1
Famalicão|Guimarães~14.03.2026|Guimarães|Famalicão|1|2
Famalicão|Guimarães~26.10.2025|Famalicão|Guimarães|2|0
Famalicão|Guimarães~08.02.2025|Famalicão|Guimarães|0|0
Famalicão|Guimarães~01.09.2024|Guimarães|Famalicão|2|1
Famalicão|Guimarães~09.03.2024|Guimarães|Famalicão|1|0
Alverca|Gil Vicente~14.03.2026|Gil Vicente|Alverca|2|2
Alverca|Gil Vicente~24.10.2025|Alverca|Gil Vicente|0|4
Arouca|Benfica~14.03.2026|Arouca|Benfica|1|2
Arouca|Benfica~25.10.2025|Benfica|Arouca|5|0
Arouca|Benfica~13.04.2025|Benfica|Arouca|2|2
Arouca|Benfica~01.12.2024|Arouca|Benfica|0|2
Arouca|Benfica~12.05.2024|Benfica|Arouca|5|0
Rio Ave|Tondela~09.03.2026|Tondela|Rio Ave|0|1
Rio Ave|Tondela~05.10.2025|Rio Ave|Tondela|3|0
Estrela Amadora|Gil Vicente~08.03.2026|Estrela Amadora|Gil Vicente|2|2
Estrela Amadora|Gil Vicente~04.10.2025|Gil Vicente|Estrela Amadora|2|0
Estrela Amadora|Gil Vicente~07.03.2025|Estrela Amadora|Gil Vicente|1|1
Estrela Amadora|Gil Vicente~05.10.2024|Gil Vicente|Estrela Amadora|3|0
Estrela Amadora|Gil Vicente~18.05.2024|Estrela Amadora|Gil Vicente|1|0
Guimarães|Santa Clara~08.03.2026|Santa Clara|Guimarães|2|0
Guimarães|Santa Clara~04.10.2025|Guimarães|Santa Clara|2|1
Guimarães|Santa Clara~05.04.2025|Guimarães|Santa Clara|2|0
Guimarães|Santa Clara~10.11.2024|Santa Clara|Guimarães|1|0
Guimarães|Santa Clara~05.03.2023|Santa Clara|Guimarães|1|3
AVS|Alverca~07.03.2026|Alverca|AVS|0|0
AVS|Alverca~04.10.2025|AVS|Alverca|1|3
Moreirense|Nacional~07.03.2026|Moreirense|Nacional|1|1
Moreirense|Nacional~04.10.2025|Nacional|Moreirense|3|2
Moreirense|Nacional~27.04.2025|Moreirense|Nacional|1|1
Moreirense|Nacional~14.12.2024|Nacional|Moreirense|1|0
Arouca|Famalicão~06.03.2026|Famalicão|Arouca|1|0
Arouca|Famalicão~05.10.2025|Arouca|Famalicão|1|1
Arouca|Famalicão~05.04.2025|Arouca|Famalicão|1|2
Arouca|Famalicão~09.11.2024|Famalicão|Arouca|0|0
Arouca|Famalicão~23.02.2024|Arouca|Famalicão|3|2
Santa Clara|Tondela~01.03.2026|Tondela|Santa Clara|2|2
Santa Clara|Tondela~27.09.2025|Santa Clara|Tondela|1|2
Santa Clara|Tondela~16.01.2022|Santa Clara|Tondela|2|2
Santa Clara|Tondela~08.08.2021|Tondela|Santa Clara|3|0
AVS|Estrela Amadora~28.02.2026|AVS|Estrela Amadora|0|0
AVS|Estrela Amadora~27.09.2025|Estrela Amadora|AVS|3|0
AVS|Estrela Amadora~11.05.2025|Estrela Amadora|AVS|0|1
AVS|Estrela Amadora~28.12.2024|AVS|Estrela Amadora|1|1
Alverca|Guimarães~28.02.2026|Guimarães|Alverca|1|1
Alverca|Guimarães~28.09.2025|Alverca|Guimarães|2|0
Estoril|Sporting~27.02.2026|Sporting|Estoril|3|0
Estoril|Sporting~27.09.2025|Estoril|Sporting|0|1
Estoril|Sporting~03.03.2025|Sporting|Estoril|3|1
Estoril|Sporting~27.09.2024|Estoril|Sporting|0|3
Estoril|Sporting~11.05.2024|Estoril|Sporting|0|1
Casa Pia|Famalicão~23.02.2026|Famalicão|Casa Pia|2|0
Casa Pia|Famalicão~21.09.2025|Casa Pia|Famalicão|1|1
Casa Pia|Famalicão~16.05.2025|Famalicão|Casa Pia|2|1
Casa Pia|Famalicão~05.01.2025|Casa Pia|Famalicão|1|1
Casa Pia|Famalicão~17.05.2024|Famalicão|Casa Pia|1|2
Estoril|Gil Vicente~22.02.2026|Estoril|Gil Vicente|3|1
Estoril|Gil Vicente~21.09.2025|Gil Vicente|Estoril|2|0
Estoril|Gil Vicente~01.02.2025|Gil Vicente|Estoril|1|2
Estoril|Gil Vicente~25.08.2024|Estoril|Gil Vicente|0|0
Estoril|Gil Vicente~18.02.2024|Estoril|Gil Vicente|1|3
AVS|Benfica~21.02.2026|Benfica|AVS|3|0
AVS|Benfica~20.09.2025|AVS|Benfica|0|3
AVS|Benfica~27.04.2025|Benfica|AVS|6|0
AVS|Benfica~15.12.2024|AVS|Benfica|1|1
Moreirense|Sporting~21.02.2026|Moreirense|Sporting|0|3
Moreirense|Sporting~22.09.2025|Sporting|Moreirense|3|0
Moreirense|Sporting~18.04.2025|Sporting|Moreirense|3|1
Moreirense|Sporting~05.12.2024|Moreirense|Sporting|2|1
Moreirense|Sporting~19.02.2024|Moreirense|Sporting|0|2
Estrela Amadora|Tondela~20.02.2026|Estrela Amadora|Tondela|0|2
Estrela Amadora|Tondela~21.09.2025|Tondela|Estrela Amadora|0|0
Moreirense|Rio Ave~16.02.2026|Rio Ave|Moreirense|1|2
Moreirense|Rio Ave~13.09.2025|Moreirense|Rio Ave|3|1
Moreirense|Rio Ave~13.04.2025|Moreirense|Rio Ave|0|2
Moreirense|Rio Ave~30.11.2024|Rio Ave|Moreirense|3|2
Moreirense|Rio Ave~02.03.2024|Moreirense|Rio Ave|0|0
Nacional|Porto~15.02.2026|Nacional|Porto|0|1
Nacional|Porto~13.09.2025|Porto|Nacional|1|0
Nacional|Porto~17.05.2025|Porto|Nacional|3|0
Nacional|Porto~12.01.2025|Nacional|Porto|2|0
AVS|Estoril~15.02.2026|AVS|Estoril|3|0
AVS|Estoril~13.09.2025|Estoril|AVS|3|1
AVS|Estoril~04.04.2025|AVS|Estoril|0|3
AVS|Estoril~09.11.2024|Estoril|AVS|0|0
Arouca|Casa Pia~14.02.2026|Casa Pia|Arouca|3|2
Arouca|Casa Pia~14.09.2025|Arouca|Casa Pia|0|2
Arouca|Casa Pia~04.05.2025|Arouca|Casa Pia|0|0
Arouca|Casa Pia~20.12.2024|Casa Pia|Arouca|3|1
Arouca|Casa Pia~18.02.2024|Casa Pia|Arouca|1|0
Estrela Amadora|Guimarães~14.02.2026|Guimarães|Estrela Amadora|2|1
Estrela Amadora|Guimarães~14.09.2025|Estrela Amadora|Guimarães|0|2
Estrela Amadora|Guimarães~16.03.2025|Guimarães|Estrela Amadora|2|0
Estrela Amadora|Guimarães~27.10.2024|Estrela Amadora|Guimarães|2|2
Estrela Amadora|Guimarães~21.01.2024|Guimarães|Estrela Amadora|3|0
Alverca|Tondela~13.02.2026|Tondela|Alverca|1|1
Alverca|Tondela~12.09.2025|Alverca|Tondela|1|0
AVS|Famalicão~09.02.2026|Famalicão|AVS|3|1
AVS|Famalicão~30.08.2025|AVS|Famalicão|0|1
AVS|Famalicão~30.03.2025|Famalicão|AVS|4|1
AVS|Famalicão~03.11.2024|AVS|Famalicão|2|3
Porto|Sporting~09.02.2026|Porto|Sporting|1|1
Porto|Sporting~30.08.2025|Sporting|Porto|1|2
Porto|Sporting~07.02.2025|Porto|Sporting|1|1
Porto|Sporting~31.08.2024|Sporting|Porto|2|0
Porto|Sporting~28.04.2024|Porto|Sporting|2|2
Casa Pia|Nacional~08.02.2026|Nacional|Casa Pia|0|0
Casa Pia|Nacional~30.08.2025|Casa Pia|Nacional|0|2
Casa Pia|Nacional~16.03.2025|Nacional|Casa Pia|3|1
Casa Pia|Nacional~25.10.2024|Casa Pia|Nacional|1|0
Braga|Rio Ave~08.02.2026|Braga|Rio Ave|3|0
Braga|Rio Ave~31.08.2025|Rio Ave|Braga|2|2
Braga|Rio Ave~02.03.2025|Rio Ave|Braga|2|1
Braga|Rio Ave~29.09.2024|Braga|Rio Ave|4|0
Braga|Rio Ave~09.03.2024|Rio Ave|Braga|0|0
Estrela Amadora|Santa Clara~07.02.2026|Estrela Amadora|Santa Clara|1|0
Estrela Amadora|Santa Clara~31.08.2025|Santa Clara|Estrela Amadora|0|0
Estrela Amadora|Santa Clara~23.02.2025|Estrela Amadora|Santa Clara|0|0
Estrela Amadora|Santa Clara~21.09.2024|Santa Clara|Estrela Amadora|1|0
Estoril|Tondela~07.02.2026|Estoril|Tondela|2|2
Estoril|Tondela~31.08.2025|Tondela|Estoril|2|2
Estoril|Tondela~12.02.2022|Estoril|Tondela|1|0
Estoril|Tondela~13.09.2021|Tondela|Estoril|1|2
AVS|Braga~02.02.2026|AVS|Braga|0|4
AVS|Braga~24.08.2025|Braga|AVS|2|2
AVS|Braga~13.04.2025|Braga|AVS|4|1
AVS|Braga~01.12.2024|AVS|Braga|0|1
Benfica|Tondela~01.02.2026|Tondela|Benfica|0|0
Benfica|Tondela~23.08.2025|Benfica|Tondela|3|0
Benfica|Tondela~07.02.2022|Tondela|Benfica|1|3
Benfica|Tondela~29.08.2021|Benfica|Tondela|2|1
Estoril|Santa Clara~31.01.2026|Santa Clara|Estoril|2|4
Estoril|Santa Clara~06.09.2025|Estoril|Santa Clara|0|1
Estoril|Santa Clara~18.01.2025|Santa Clara|Estoril|2|3
Estoril|Santa Clara~11.08.2024|Estoril|Santa Clara|1|4
Estoril|Santa Clara~30.04.2023|Estoril|Santa Clara|3|0
Arouca|Rio Ave~31.01.2026|Rio Ave|Arouca|0|3
Arouca|Rio Ave~23.08.2025|Arouca|Rio Ave|3|3
Arouca|Rio Ave~10.02.2025|Arouca|Rio Ave|1|1
Arouca|Rio Ave~01.09.2024|Rio Ave|Arouca|1|0
Arouca|Rio Ave~19.04.2024|Rio Ave|Arouca|1|1
Benfica|Estrela Amadora~25.01.2026|Benfica|Estrela Amadora|4|0
Benfica|Estrela Amadora~16.08.2025|Estrela Amadora|Benfica|0|1
Benfica|Estrela Amadora~02.02.2025|Estrela Amadora|Benfica|2|3
Benfica|Estrela Amadora~24.08.2024|Benfica|Estrela Amadora|1|0
Benfica|Estrela Amadora~29.01.2024|Estrela Amadora|Benfica|1|4
Famalicão|Tondela~25.01.2026|Famalicão|Tondela|3|0
Famalicão|Tondela~16.08.2025|Tondela|Famalicão|0|1
Famalicão|Tondela~26.02.2022|Famalicão|Tondela|2|1
Famalicão|Tondela~25.09.2021|Tondela|Famalicão|3|2
Moreirense|Santa Clara~24.01.2026|Moreirense|Santa Clara|1|0
Moreirense|Santa Clara~17.08.2025|Santa Clara|Moreirense|0|1
Moreirense|Santa Clara~09.03.2025|Santa Clara|Moreirense|1|1
Moreirense|Santa Clara~05.10.2024|Moreirense|Santa Clara|1|0
Moreirense|Santa Clara~22.01.2022|Moreirense|Santa Clara|0|2
Estoril|Guimarães~24.01.2026|Estoril|Guimarães|4|2
Estoril|Guimarães~16.08.2025|Guimarães|Estoril|3|2
Estoril|Guimarães~26.01.2025|Estoril|Guimarães|1|0
Estoril|Guimarães~18.08.2024|Guimarães|Estoril|1|0
Estoril|Guimarães~02.03.2024|Estoril|Guimarães|1|3
AVS|Casa Pia~23.01.2026|Casa Pia|AVS|3|3
AVS|Casa Pia~15.08.2025|AVS|Casa Pia|0|2
AVS|Casa Pia~19.04.2025|AVS|Casa Pia|1|1
AVS|Casa Pia~08.12.2024|Casa Pia|AVS|1|1
Estoril|Estrela Amadora~19.01.2026|Estrela Amadora|Estoril|0|5
Estoril|Estrela Amadora~11.08.2025|Estoril|Estrela Amadora|1|1
Estoril|Estrela Amadora~17.05.2025|Estoril|Estrela Amadora|4|0
Estoril|Estrela Amadora~05.01.2025|Estrela Amadora|Estoril|2|4
Estoril|Estrela Amadora~04.02.2024|Estoril|Estrela Amadora|1|0
Braga|Tondela~18.01.2026|Tondela|Braga|0|1
Braga|Tondela~10.08.2025|Braga|Tondela|3|0
Braga|Tondela~20.02.2022|Tondela|Braga|0|1
Braga|Tondela~20.09.2021|Braga|Tondela|3|1
Guimarães|Porto~18.01.2026|Guimarães|Porto|0|1
Guimarães|Porto~11.08.2025|Porto|Guimarães|3|0
Guimarães|Porto~24.02.2025|Porto|Guimarães|1|1
Guimarães|Porto~21.09.2024|Guimarães|Porto|0|3
Guimarães|Porto~07.04.2024|Porto|Guimarães|1|2
Gil Vicente|Nacional~17.01.2026|Gil Vicente|Nacional|2|1
Gil Vicente|Nacional~09.08.2025|Nacional|Gil Vicente|0|2
Gil Vicente|Nacional~19.04.2025|Nacional|Gil Vicente|0|3
Gil Vicente|Nacional~07.12.2024|Gil Vicente|Nacional|2|1
Alverca|Moreirense~17.01.2026|Alverca|Moreirense|2|1
Alverca|Moreirense~10.08.2025|Moreirense|Alverca|2|1
AVS|Arouca~17.01.2026|AVS|Arouca|0|1
AVS|Arouca~09.08.2025|Arouca|AVS|3|1
AVS|Arouca~08.03.2025|AVS|Arouca|0|1
AVS|Arouca~05.10.2024|Arouca|AVS|1|1
Benfica|Rio Ave~17.01.2026|Rio Ave|Benfica|0|2
Benfica|Rio Ave~23.09.2025|Benfica|Rio Ave|1|1
Benfica|Rio Ave~16.03.2025|Rio Ave|Benfica|2|3
Benfica|Rio Ave~27.10.2024|Benfica|Rio Ave|5|0
Benfica|Rio Ave~17.05.2024|Rio Ave|Benfica|1|1
Arouca|Boavista~17.05.2025|Arouca|Boavista|4|1
Arouca|Boavista~04.01.2025|Boavista|Arouca|1|3
Arouca|Boavista~14.04.2024|Arouca|Boavista|2|1
Arouca|Boavista~03.12.2023|Boavista|Arouca|0|4
Arouca|Boavista~03.03.2023|Boavista|Arouca|0|0
Farense|Santa Clara~17.05.2025|Farense|Santa Clara|1|2
Farense|Santa Clara~05.01.2025|Santa Clara|Farense|0|0
Farense|Guimarães~11.05.2025|Guimarães|Farense|1|2
Farense|Guimarães~29.12.2024|Farense|Guimarães|2|2
Farense|Guimarães~13.04.2024|Guimarães|Farense|1|1
Farense|Guimarães~02.12.2023|Farense|Guimarães|1|2
Boavista|Porto~11.05.2025|Boavista|Porto|1|2
Boavista|Porto~28.12.2024|Porto|Boavista|4|0
Boavista|Porto~12.05.2024|Porto|Boavista|2|1
Boavista|Porto~05.01.2024|Boavista|Porto|1|1
Boavista|Porto~30.04.2023|Porto|Boavista|1|0
AVS|Boavista~05.05.2025|AVS|Boavista|1|2
AVS|Boavista~21.12.2024|Boavista|AVS|0|0
Famalicão|Farense~03.05.2025|Farense|Famalicão|2|1
Famalicão|Farense~21.12.2024|Famalicão|Farense|1|2
Famalicão|Farense~10.02.2024|Farense|Famalicão|1|1
Famalicão|Farense~02.09.2023|Famalicão|Farense|1|0
Boavista|Sporting~27.04.2025|Boavista|Sporting|0|5
Boavista|Sporting~14.12.2024|Sporting|Boavista|3|2
Boavista|Sporting~17.03.2024|Sporting|Boavista|6|1
Boavista|Sporting~30.10.2023|Boavista|Sporting|0|2
Boavista|Sporting~12.03.2023|Sporting|Boavista|3|0
Farense|Gil Vicente~26.04.2025|Gil Vicente|Farense|1|0
Farense|Gil Vicente~14.12.2024|Farense|Gil Vicente|0|1
Farense|Gil Vicente~12.05.2024|Gil Vicente|Farense|2|0
Farense|Gil Vicente~06.01.2024|Farense|Gil Vicente|1|0
Boavista|Farense~18.04.2025|Farense|Boavista|0|1
Boavista|Farense~08.12.2024|Boavista|Farense|1|1
Boavista|Farense~05.04.2024|Farense|Boavista|2|0
Boavista|Farense~12.11.2023|Boavista|Farense|1|3
Estrela Amadora|Farense~13.04.2025|Estrela Amadora|Farense|0|1
Estrela Amadora|Farense~29.11.2024|Farense|Estrela Amadora|1|0
Estrela Amadora|Farense~29.04.2024|Estrela Amadora|Farense|0|3
Estrela Amadora|Farense~15.12.2023|Farense|Estrela Amadora|0|0
Boavista|Nacional~12.04.2025|Boavista|Nacional|0|1
Boavista|Nacional~30.11.2024|Nacional|Boavista|0|0
Casa Pia|Farense~07.04.2025|Farense|Casa Pia|0|0
Casa Pia|Farense~09.11.2024|Casa Pia|Farense|1|1
Casa Pia|Farense~20.01.2024|Casa Pia|Farense|1|3
Casa Pia|Farense~12.08.2023|Farense|Casa Pia|0|3
Boavista|Rio Ave~07.04.2025|Rio Ave|Boavista|0|2
Boavista|Rio Ave~09.11.2024|Boavista|Rio Ave|0|2
Boavista|Rio Ave~30.03.2024|Boavista|Rio Ave|0|0
Boavista|Rio Ave~05.11.2023|Rio Ave|Boavista|2|0
Boavista|Rio Ave~22.04.2023|Boavista|Rio Ave|3|2
Benfica|Farense~02.04.2025|Benfica|Farense|3|2
Benfica|Farense~02.11.2024|Farense|Benfica|1|2
Benfica|Farense~22.04.2024|Farense|Benfica|1|3
Benfica|Farense~08.12.2023|Benfica|Farense|1|1
Boavista|Gil Vicente~01.04.2025|Boavista|Gil Vicente|1|3
Boavista|Gil Vicente~02.11.2024|Gil Vicente|Boavista|1|2
Boavista|Gil Vicente~04.05.2024|Boavista|Gil Vicente|1|1
Boavista|Gil Vicente~30.12.2023|Gil Vicente|Boavista|1|0
Boavista|Gil Vicente~12.05.2023|Gil Vicente|Boavista|3|1
Boavista|Moreirense~16.03.2025|Moreirense|Boavista|1|0
Boavista|Moreirense~26.10.2024|Boavista|Moreirense|0|2
Boavista|Moreirense~09.03.2024|Boavista|Moreirense|1|0
Boavista|Moreirense~06.10.2023|Moreirense|Boavista|1|1
Boavista|Moreirense~01.05.2022|Moreirense|Boavista|1|2
Braga|Farense~15.03.2025|Farense|Braga|0|1
Braga|Farense~27.10.2024|Braga|Farense|2|0
Braga|Farense~18.02.2024|Braga|Farense|2|1
Braga|Farense~16.09.2023|Farense|Braga|3|1
Boavista|Guimarães~09.03.2025|Boavista|Guimarães|1|2
Boavista|Guimarães~06.10.2024|Guimarães|Boavista|2|2
Boavista|Guimarães~27.04.2024|Guimarães|Boavista|1|0
Boavista|Guimarães~16.12.2023|Boavista|Guimarães|1|1
Boavista|Guimarães~07.04.2023|Boavista|Guimarães|2|1
Estoril|Farense~08.03.2025|Estoril|Farense|2|2
Estoril|Farense~06.10.2024|Farense|Estoril|1|0
Estoril|Farense~05.05.2024|Farense|Estoril|3|2
Estoril|Farense~30.12.2023|Estoril|Farense|4|0
Boavista|Santa Clara~02.03.2025|Boavista|Santa Clara|1|0
Boavista|Santa Clara~29.09.2024|Santa Clara|Boavista|1|0
Boavista|Santa Clara~04.02.2023|Santa Clara|Boavista|2|2
Boavista|Santa Clara~14.08.2022|Boavista|Santa Clara|2|1
Boavista|Santa Clara~01.02.2022|Santa Clara|Boavista|2|1
AVS|Farense~02.03.2025|Farense|AVS|0|1
AVS|Farense~30.09.2024|AVS|Farense|0|0
Arouca|Farense~23.02.2025|Arouca|Farense|2|2
Arouca|Farense~22.09.2024|Farense|Arouca|0|1
Arouca|Farense~30.03.2024|Arouca|Farense|2|1
Arouca|Farense~06.11.2023|Farense|Arouca|2|0
Benfica|Boavista~22.02.2025|Benfica|Boavista|3|0
Benfica|Boavista~23.09.2024|Boavista|Benfica|0|3
Benfica|Boavista~19.01.2024|Benfica|Boavista|2|0
Benfica|Boavista~14.08.2023|Boavista|Benfica|3|2
Benfica|Boavista~20.02.2023|Benfica|Boavista|3|1
Farense|Porto~16.02.2025|Farense|Porto|0|1
Farense|Porto~15.09.2024|Porto|Farense|2|1
Farense|Porto~28.01.2024|Farense|Porto|1|3
Farense|Porto~20.08.2023|Porto|Farense|2|1
Boavista|Estrela Amadora~14.02.2025|Boavista|Estrela Amadora|0|1
Boavista|Estrela Amadora~16.09.2024|Estrela Amadora|Boavista|2|2
Boavista|Estrela Amadora~20.04.2024|Boavista|Estrela Amadora|1|1
Boavista|Estrela Amadora~10.12.2023|Estrela Amadora|Boavista|3|1
Boavista|Estoril~09.02.2025|Estoril|Boavista|2|1
Boavista|Estoril~31.08.2024|Boavista|Estoril|0|0
Boavista|Estoril~10.02.2024|Boavista|Estoril|2|1
Boavista|Estoril~03.09.2023|Estoril|Boavista|1|2
Boavista|Estoril~06.05.2023|Boavista|Estoril|1|0
Farense|Nacional~09.02.2025|Farense|Nacional|0|2
Farense|Nacional~01.09.2024|Nacional|Farense|2|0
Farense|Sporting~02.02.2025|Sporting|Farense|3|1
Farense|Sporting~23.08.2024|Farense|Sporting|0|5
Farense|Sporting~03.03.2024|Sporting|Farense|3|2
Farense|Sporting~30.09.2023|Farense|Sporting|2|3
Boavista|Famalicão~31.01.2025|Boavista|Famalicão|0|2
Boavista|Famalicão~24.08.2024|Famalicão|Boavista|1|0
Boavista|Famalicão~04.03.2024|Famalicão|Boavista|1|1
Boavista|Famalicão~30.09.2023|Boavista|Famalicão|2|2
Boavista|Famalicão~19.03.2023|Boavista|Famalicão|1|2
Boavista|Braga~26.01.2025|Braga|Boavista|3|0
Boavista|Braga~18.08.2024|Boavista|Braga|0|1
Boavista|Braga~26.02.2024|Boavista|Braga|0|4
Boavista|Braga~24.09.2023|Braga|Boavista|4|1
Boavista|Braga~20.05.2023|Boavista|Braga|1|1
Farense|Rio Ave~25.01.2025|Farense|Rio Ave|1|2
Farense|Rio Ave~17.08.2024|Rio Ave|Farense|1|0
Farense|Rio Ave~16.03.2024|Farense|Rio Ave|1|1
Farense|Rio Ave~29.10.2023|Rio Ave|Farense|3|4
Boavista|Casa Pia~20.01.2025|Boavista|Casa Pia|2|3
Boavista|Casa Pia~10.08.2024|Casa Pia|Boavista|0|1
Boavista|Casa Pia~05.02.2024|Casa Pia|Boavista|0|0
Boavista|Casa Pia~27.08.2023|Boavista|Casa Pia|1|1
Boavista|Casa Pia~13.02.2023|Boavista|Casa Pia|0|0
Farense|Moreirense~19.01.2025|Moreirense|Farense|0|0
Farense|Moreirense~11.08.2024|Farense|Moreirense|1|2
Farense|Moreirense~24.02.2024|Farense|Moreirense|0|1
Farense|Moreirense~23.09.2023|Moreirense|Farense|1|0
Boavista|Vizela~18.05.2024|Boavista|Vizela|2|2
Boavista|Vizela~14.01.2024|Vizela|Boavista|1|4
Boavista|Vizela~17.04.2023|Vizela|Boavista|1|1
Boavista|Vizela~30.10.2022|Boavista|Vizela|2|2
Boavista|Vizela~06.02.2022|Boavista|Vizela|2|2
Farense|Portimonense~18.05.2024|Farense|Portimonense|1|3
Farense|Portimonense~12.01.2024|Portimonense|Farense|1|0
Chaves|Sporting~18.05.2024|Sporting|Chaves|3|0
Chaves|Sporting~13.01.2024|Chaves|Sporting|0|3
Chaves|Sporting~20.02.2023|Chaves|Sporting|2|3
Chaves|Sporting~27.08.2022|Sporting|Chaves|0|2
Portimonense|Rio Ave~11.05.2024|Portimonense|Rio Ave|2|2
Portimonense|Rio Ave~07.01.2024|Rio Ave|Portimonense|2|0
Portimonense|Rio Ave~08.04.2023|Portimonense|Rio Ave|2|2
Portimonense|Rio Ave~24.10.2022|Rio Ave|Portimonense|1|0
Estrela Amadora|Vizela~11.05.2024|Vizela|Estrela Amadora|4|0
Estrela Amadora|Vizela~06.01.2024|Estrela Amadora|Vizela|1|1
Chaves|Famalicão~10.05.2024|Chaves|Famalicão|0|1
Chaves|Famalicão~07.01.2024|Famalicão|Chaves|2|2
Chaves|Famalicão~08.05.2023|Famalicão|Chaves|1|2
Chaves|Famalicão~30.12.2022|Chaves|Famalicão|0|2
Portimonense|Sporting~04.05.2024|Sporting|Portimonense|3|0
Portimonense|Sporting~30.12.2023|Portimonense|Sporting|1|2
Portimonense|Sporting~04.03.2023|Portimonense|Sporting|0|1
Portimonense|Sporting~10.09.2022|Sporting|Portimonense|4|0
Portimonense|Sporting~07.05.2022|Portimonense|Sporting|2|3
Chaves|Porto~04.05.2024|Chaves|Porto|0|3
Chaves|Porto~29.12.2023|Porto|Chaves|1|0
Chaves|Porto~04.03.2023|Chaves|Porto|1|3
Chaves|Porto~10.09.2022|Porto|Chaves|3|0
Moreirense|Vizela~03.05.2024|Moreirense|Vizela|1|0
Moreirense|Vizela~23.12.2023|Vizela|Moreirense|0|0
Moreirense|Vizela~14.05.2022|Moreirense|Vizela|4|1
Moreirense|Vizela~08.01.2022|Vizela|Moreirense|0|1
Moreirense|Portimonense~28.04.2024|Portimonense|Moreirense|0|2
Moreirense|Portimonense~17.12.2023|Moreirense|Portimonense|5|2
Moreirense|Portimonense~23.04.2022|Portimonense|Moreirense|1|0
Moreirense|Portimonense~12.12.2021|Moreirense|Portimonense|0|1
Casa Pia|Chaves~27.04.2024|Casa Pia|Chaves|3|1
Casa Pia|Chaves~17.12.2023|Chaves|Casa Pia|1|3
Casa Pia|Chaves~29.04.2023|Chaves|Casa Pia|1|0
Casa Pia|Chaves~13.11.2022|Casa Pia|Chaves|1|2
Rio Ave|Vizela~27.04.2024|Vizela|Rio Ave|1|1
Rio Ave|Vizela~16.12.2023|Rio Ave|Vizela|1|1
Rio Ave|Vizela~29.01.2023|Vizela|Rio Ave|3|1
Rio Ave|Vizela~06.08.2022|Rio Ave|Vizela|0|1
Chaves|Estoril~21.04.2024|Chaves|Estoril|2|2
Chaves|Estoril~10.12.2023|Estoril|Chaves|4|0
Chaves|Estoril~18.03.2023|Estoril|Chaves|0|2
Chaves|Estoril~01.10.2022|Chaves|Estoril|1|1
Famalicão|Portimonense~21.04.2024|Famalicão|Portimonense|2|2
Famalicão|Portimonense~09.12.2023|Portimonense|Famalicão|1|1
Famalicão|Portimonense~24.02.2023|Famalicão|Portimonense|1|0
Famalicão|Portimonense~04.09.2022|Portimonense|Famalicão|1|0
Famalicão|Portimonense~10.04.2022|Portimonense|Famalicão|1|0
Braga|Vizela~20.04.2024|Braga|Vizela|2|1
Braga|Vizela~08.12.2023|Vizela|Braga|1|3
Braga|Vizela~11.03.2023|Vizela|Braga|0|4
Braga|Vizela~18.09.2022|Braga|Vizela|2|0
Braga|Vizela~10.04.2022|Vizela|Braga|0|1
Chaves|Vizela~15.04.2024|Vizela|Chaves|0|1
Chaves|Vizela~01.12.2023|Chaves|Vizela|2|1
Chaves|Vizela~10.02.2023|Vizela|Chaves|0|0
Chaves|Vizela~20.08.2022|Chaves|Vizela|1|1
Casa Pia|Portimonense~14.04.2024|Portimonense|Casa Pia|2|2
Casa Pia|Portimonense~02.12.2023|Casa Pia|Portimonense|1|0
Casa Pia|Portimonense~05.05.2023|Casa Pia|Portimonense|1|1
Casa Pia|Portimonense~28.12.2022|Portimonense|Casa Pia|1|2
Chaves|Portimonense~07.04.2024|Chaves|Portimonense|2|3
Chaves|Portimonense~11.11.2023|Portimonense|Chaves|2|1
Chaves|Portimonense~11.03.2023|Chaves|Portimonense|2|0
Chaves|Portimonense~16.09.2022|Portimonense|Chaves|1|0
Famalicão|Vizela~06.04.2024|Famalicão|Vizela|3|2
Famalicão|Vizela~11.11.2023|Vizela|Famalicão|0|0
Famalicão|Vizela~13.05.2023|Vizela|Famalicão|0|0
Famalicão|Vizela~06.01.2023|Famalicão|Vizela|2|1
Famalicão|Vizela~18.03.2022|Vizela|Famalicão|1|1
Braga|Portimonense~01.04.2024|Portimonense|Braga|3|5
Braga|Portimonense~04.11.2023|Braga|Portimonense|6|1
Braga|Portimonense~29.04.2023|Braga|Portimonense|4|1
Braga|Portimonense~13.11.2022|Portimonense|Braga|1|2
Braga|Portimonense~20.03.2022|Portimonense|Braga|1|2
Casa Pia|Vizela~31.03.2024|Vizela|Casa Pia|0|4
Casa Pia|Vizela~05.11.2023|Casa Pia|Vizela|0|1
Casa Pia|Vizela~01.04.2023|Vizela|Casa Pia|3|1
Casa Pia|Vizela~09.10.2022|Casa Pia|Vizela|0|1
Benfica|Chaves~29.03.2024|Benfica|Chaves|1|0
Benfica|Chaves~04.11.2023|Chaves|Benfica|0|2
Benfica|Chaves~15.04.2023|Chaves|Benfica|1|0
Benfica|Chaves~29.10.2022|Benfica|Chaves|5|0
Chaves|Guimarães~17.03.2024|Chaves|Guimarães|1|2
Chaves|Guimarães~28.10.2023|Guimarães|Chaves|5|0
Chaves|Guimarães~30.01.2023|Guimarães|Chaves|2|1
Chaves|Guimarães~07.08.2022|Chaves|Guimarães|0|1
Porto|Vizela~16.03.2024|Porto|Vizela|4|1
Porto|Vizela~29.10.2023|Vizela|Porto|0|2
Porto|Vizela~05.02.2023|Porto|Vizela|2|0
Porto|Vizela~14.08.2022|Vizela|Porto|0|1
Porto|Vizela~30.04.2022|Porto|Vizela|4|2
Estoril|Portimonense~15.03.2024|Estoril|Portimonense|1|0
Estoril|Portimonense~28.10.2023|Portimonense|Estoril|1|0
Estoril|Portimonense~15.04.2023|Estoril|Portimonense|0|1
Estoril|Portimonense~30.10.2022|Portimonense|Estoril|1|1
Estoril|Portimonense~12.03.2022|Estoril|Portimonense|2|0
Chaves|Gil Vicente~11.03.2024|Gil Vicente|Chaves|0|0
Chaves|Gil Vicente~07.10.2023|Chaves|Gil Vicente|4|2
Chaves|Gil Vicente~10.04.2023|Gil Vicente|Chaves|0|0
Chaves|Gil Vicente~23.10.2022|Chaves|Gil Vicente|3|1
Farense|Vizela~09.03.2024|Vizela|Farense|2|1
Farense|Vizela~07.10.2023|Farense|Vizela|0|0
Portimonense|Porto~08.03.2024|Portimonense|Porto|0|3
Portimonense|Porto~08.10.2023|Porto|Portimonense|1|0
Portimonense|Porto~02.04.2023|Porto|Portimonense|1|0
Portimonense|Porto~08.10.2022|Portimonense|Porto|0|2
Portimonense|Porto~16.04.2022|Porto|Portimonense|7|0
Portimonense|Vizela~03.03.2024|Portimonense|Vizela|0|0
Portimonense|Vizela~30.09.2023|Vizela|Portimonense|2|3
Portimonense|Vizela~18.03.2023|Portimonense|Vizela|0|1
Portimonense|Vizela~01.10.2022|Vizela|Portimonense|1|0
Portimonense|Vizela~27.02.2022|Vizela|Portimonense|1|1
Arouca|Chaves~01.03.2024|Chaves|Arouca|1|5
Arouca|Chaves~01.10.2023|Arouca|Chaves|0|2
Arouca|Chaves~20.05.2023|Arouca|Chaves|1|0
Arouca|Chaves~15.01.2023|Chaves|Arouca|1|1
Estoril|Vizela~25.02.2024|Vizela|Estoril|3|3
Estoril|Vizela~23.09.2023|Estoril|Vizela|2|2
Estoril|Vizela~04.03.2023|Estoril|Vizela|0|3
Estoril|Vizela~12.09.2022|Vizela|Estoril|0|1
Estoril|Vizela~02.04.2022|Estoril|Vizela|1|2
Benfica|Portimonense~25.02.2024|Benfica|Portimonense|4|0
Benfica|Portimonense~24.09.2023|Portimonense|Benfica|1|3
Benfica|Portimonense~13.05.2023|Portimonense|Benfica|1|5
Benfica|Portimonense~06.01.2023|Benfica|Portimonense|1|0
Benfica|Portimonense~05.03.2022|Portimonense|Benfica|1|2
Chaves|Estrela Amadora~24.02.2024|Estrela Amadora|Chaves|1|1
Chaves|Estrela Amadora~24.09.2023|Chaves|Estrela Amadora|2|2
Benfica|Vizela~18.02.2024|Benfica|Vizela|6|1
Benfica|Vizela~16.09.2023|Vizela|Benfica|1|2
Benfica|Vizela~25.02.2023|Vizela|Benfica|0|2
Benfica|Vizela~02.09.2022|Benfica|Vizela|2|1
Benfica|Vizela~11.03.2022|Benfica|Vizela|1|1
Boavista|Chaves~17.02.2024|Chaves|Boavista|2|1
Boavista|Chaves~18.09.2023|Boavista|Chaves|4|1
Boavista|Chaves~27.05.2023|Chaves|Boavista|1|4
Boavista|Chaves~23.01.2023|Boavista|Chaves|1|1
Guimarães|Portimonense~17.02.2024|Portimonense|Guimarães|1|1
Guimarães|Portimonense~17.09.2023|Guimarães|Portimonense|1|2
Guimarães|Portimonense~11.02.2023|Guimarães|Portimonense|1|0
Guimarães|Portimonense~21.08.2022|Portimonense|Guimarães|2|1
Guimarães|Portimonense~17.01.2022|Portimonense|Guimarães|1|1
Gil Vicente|Vizela~13.02.2024|Gil Vicente|Vizela|0|1
Gil Vicente|Vizela~01.09.2023|Vizela|Gil Vicente|1|0
Gil Vicente|Vizela~17.02.2023|Gil Vicente|Vizela|1|1
Gil Vicente|Vizela~29.08.2022|Vizela|Gil Vicente|2|2
Gil Vicente|Vizela~13.02.2022|Vizela|Gil Vicente|0|1
Chaves|Moreirense~10.02.2024|Moreirense|Chaves|1|0
Chaves|Moreirense~03.09.2023|Chaves|Moreirense|1|2
Estrela Amadora|Portimonense~09.02.2024|Estrela Amadora|Portimonense|3|0
Estrela Amadora|Portimonense~02.09.2023|Portimonense|Estrela Amadora|1|1
Chaves|Farense~04.02.2024|Chaves|Farense|1|1
Chaves|Farense~26.08.2023|Farense|Chaves|5|0
Guimarães|Vizela~04.02.2024|Vizela|Guimarães|0|1
Guimarães|Vizela~27.08.2023|Guimarães|Vizela|2|0
Guimarães|Vizela~07.05.2023|Guimarães|Vizela|3|0
Guimarães|Vizela~30.12.2022|Vizela|Guimarães|3|0
Guimarães|Vizela~30.01.2022|Vizela|Guimarães|3|2
Arouca|Portimonense~03.02.2024|Portimonense|Arouca|1|2
Arouca|Portimonense~26.08.2023|Arouca|Portimonense|1|1
Arouca|Portimonense~27.05.2023|Portimonense|Arouca|0|2
Arouca|Portimonense~20.01.2023|Arouca|Portimonense|4|0
Arouca|Portimonense~30.04.2022|Arouca|Portimonense|1|0
Braga|Chaves~31.01.2024|Braga|Chaves|1|1
Braga|Chaves~19.08.2023|Chaves|Braga|2|4
Braga|Chaves~02.04.2023|Chaves|Braga|1|2
Braga|Chaves~09.10.2022|Braga|Chaves|0|1
Boavista|Portimonense~28.01.2024|Boavista|Portimonense|1|4
Boavista|Portimonense~19.08.2023|Portimonense|Boavista|1|4
Boavista|Portimonense~29.01.2023|Boavista|Portimonense|4|2
Boavista|Portimonense~07.08.2022|Portimonense|Boavista|0|1
Boavista|Portimonense~12.02.2022|Portimonense|Boavista|1|1
Arouca|Vizela~28.01.2024|Arouca|Vizela|5|0
Arouca|Vizela~20.08.2023|Vizela|Arouca|2|2
Arouca|Vizela~23.04.2023|Arouca|Vizela|1|0
Arouca|Vizela~05.11.2022|Vizela|Arouca|0|1
Arouca|Vizela~22.04.2022|Vizela|Arouca|2|1
Gil Vicente|Portimonense~21.01.2024|Portimonense|Gil Vicente|0|2
Gil Vicente|Portimonense~12.08.2023|Gil Vicente|Portimonense|5|0
Gil Vicente|Portimonense~23.04.2023|Portimonense|Gil Vicente|1|0
Gil Vicente|Portimonense~04.11.2022|Gil Vicente|Portimonense|1|2
Gil Vicente|Portimonense~23.01.2022|Gil Vicente|Portimonense|1|0
Chaves|Rio Ave~21.01.2024|Chaves|Rio Ave|0|0
Chaves|Rio Ave~13.08.2023|Rio Ave|Chaves|2|0
Chaves|Rio Ave~26.02.2023|Rio Ave|Chaves|1|0
Chaves|Rio Ave~05.09.2022|Chaves|Rio Ave|1|1
Sporting|Vizela~18.01.2024|Vizela|Sporting|2|5
Sporting|Vizela~12.08.2023|Sporting|Vizela|3|2
Sporting|Vizela~26.05.2023|Vizela|Sporting|1|2
Sporting|Vizela~20.01.2023|Sporting|Vizela|2|1
Sporting|Vizela~16.01.2022|Vizela|Sporting|0|2
Estoril|Marítimo~27.05.2023|Estoril|Marítimo|3|1
Estoril|Marítimo~22.01.2023|Marítimo|Estoril|1|0
Estoril|Marítimo~05.02.2022|Marítimo|Estoril|0|0
Estoril|Marítimo~27.08.2021|Estoril|Marítimo|2|1
Braga|Pacos Ferreira~27.05.2023|Braga|Pacos Ferreira|3|0
Braga|Pacos Ferreira~21.01.2023|Pacos Ferreira|Braga|1|2
Braga|Pacos Ferreira~12.02.2022|Braga|Pacos Ferreira|2|1
Braga|Pacos Ferreira~11.09.2021|Pacos Ferreira|Braga|0|0
Pacos Ferreira|Rio Ave~21.05.2023|Pacos Ferreira|Rio Ave|3|1
Pacos Ferreira|Rio Ave~14.01.2023|Rio Ave|Pacos Ferreira|0|1
Portimonense|Santa Clara~20.05.2023|Santa Clara|Portimonense|1|0
Portimonense|Santa Clara~13.01.2023|Portimonense|Santa Clara|0|0
Portimonense|Santa Clara~21.02.2022|Santa Clara|Portimonense|1|1
Portimonense|Santa Clara~17.09.2021|Portimonense|Santa Clara|2|1
Marítimo|Vizela~19.05.2023|Marítimo|Vizela|1|0
Marítimo|Vizela~14.01.2023|Vizela|Marítimo|3|0
Marítimo|Vizela~08.05.2022|Vizela|Marítimo|1|1
Marítimo|Vizela~28.12.2021|Marítimo|Vizela|2|0
Chaves|Pacos Ferreira~13.05.2023|Chaves|Pacos Ferreira|2|0
Chaves|Pacos Ferreira~08.01.2023|Pacos Ferreira|Chaves|1|1
Marítimo|Sporting~13.05.2023|Sporting|Marítimo|2|1
Marítimo|Sporting~08.01.2023|Marítimo|Sporting|1|0
Marítimo|Sporting~26.02.2022|Marítimo|Sporting|1|1
Marítimo|Sporting~24.09.2021|Sporting|Marítimo|1|0
Marítimo|Rio Ave~07.05.2023|Marítimo|Rio Ave|2|2
Marítimo|Rio Ave~23.12.2022|Rio Ave|Marítimo|1|1
Pacos Ferreira|Sporting~07.05.2023|Pacos Ferreira|Sporting|0|4
Pacos Ferreira|Sporting~29.12.2022|Sporting|Pacos Ferreira|3|0
Pacos Ferreira|Sporting~03.04.2022|Sporting|Pacos Ferreira|2|0
Pacos Ferreira|Sporting~07.11.2021|Pacos Ferreira|Sporting|0|2
Pacos Ferreira|Vizela~29.04.2023|Vizela|Pacos Ferreira|1|2
Pacos Ferreira|Vizela~13.11.2022|Pacos Ferreira|Vizela|0|2
Pacos Ferreira|Vizela~19.02.2022|Pacos Ferreira|Vizela|2|1
Pacos Ferreira|Vizela~19.09.2021|Vizela|Pacos Ferreira|1|1
Chaves|Santa Clara~23.04.2023|Santa Clara|Chaves|1|1
Chaves|Santa Clara~07.11.2022|Chaves|Santa Clara|0|0
Pacos Ferreira|Porto~22.04.2023|Pacos Ferreira|Porto|0|2
Pacos Ferreira|Porto~05.11.2022|Porto|Pacos Ferreira|4|0
Pacos Ferreira|Porto~06.03.2022|Pacos Ferreira|Porto|2|4
Pacos Ferreira|Porto~02.10.2021|Porto|Pacos Ferreira|2|1
Marítimo|Pacos Ferreira~15.04.2023|Marítimo|Pacos Ferreira|3|1
Marítimo|Pacos Ferreira~28.10.2022|Pacos Ferreira|Marítimo|0|1
Marítimo|Pacos Ferreira~09.04.2022|Pacos Ferreira|Marítimo|2|0
Marítimo|Pacos Ferreira~28.11.2021|Marítimo|Pacos Ferreira|2|0
Famalicão|Pacos Ferreira~08.04.2023|Pacos Ferreira|Famalicão|1|3
Famalicão|Pacos Ferreira~22.10.2022|Famalicão|Pacos Ferreira|2|1
Famalicão|Pacos Ferreira~16.01.2022|Famalicão|Pacos Ferreira|0|0
Famalicão|Pacos Ferreira~08.08.2021|Pacos Ferreira|Famalicão|2|0
Santa Clara|Vizela~07.04.2023|Santa Clara|Vizela|0|1
Santa Clara|Vizela~23.10.2022|Vizela|Santa Clara|0|1
Santa Clara|Vizela~06.03.2022|Santa Clara|Vizela|3|1
Santa Clara|Vizela~02.10.2021|Vizela|Santa Clara|1|1
Boavista|Marítimo~02.04.2023|Marítimo|Boavista|4|2
Boavista|Marítimo~09.10.2022|Boavista|Marítimo|1|1
Boavista|Marítimo~16.04.2022|Marítimo|Boavista|4|0
Boavista|Marítimo~04.12.2021|Boavista|Marítimo|1|1
Guimarães|Pacos Ferreira~01.04.2023|Guimarães|Pacos Ferreira|0|0
Guimarães|Pacos Ferreira~08.10.2022|Pacos Ferreira|Guimarães|0|1
Guimarães|Pacos Ferreira~15.04.2022|Guimarães|Pacos Ferreira|4|0
Guimarães|Pacos Ferreira~04.12.2021|Pacos Ferreira|Guimarães|1|2
Arouca|Pacos Ferreira~18.03.2023|Arouca|Pacos Ferreira|1|1
Arouca|Pacos Ferreira~02.10.2022|Pacos Ferreira|Arouca|1|1
Arouca|Pacos Ferreira~12.03.2022|Arouca|Pacos Ferreira|0|1
Arouca|Pacos Ferreira~24.10.2021|Pacos Ferreira|Arouca|0|0
Pacos Ferreira|Santa Clara~11.03.2023|Pacos Ferreira|Santa Clara|1|0
Pacos Ferreira|Santa Clara~17.09.2022|Santa Clara|Pacos Ferreira|1|1
Pacos Ferreira|Santa Clara~08.05.2022|Santa Clara|Pacos Ferreira|2|0
Pacos Ferreira|Santa Clara~30.12.2021|Pacos Ferreira|Santa Clara|2|1
Casa Pia|Pacos Ferreira~06.03.2023|Casa Pia|Pacos Ferreira|2|1
Casa Pia|Pacos Ferreira~11.09.2022|Pacos Ferreira|Casa Pia|2|3
Boavista|Pacos Ferreira~26.02.2023|Pacos Ferreira|Boavista|1|3
Boavista|Pacos Ferreira~05.09.2022|Boavista|Pacos Ferreira|1|0
Boavista|Pacos Ferreira~21.01.2022|Pacos Ferreira|Boavista|1|1
Boavista|Pacos Ferreira~16.08.2021|Boavista|Pacos Ferreira|3|0
Estoril|Pacos Ferreira~18.02.2023|Estoril|Pacos Ferreira|1|3
Estoril|Pacos Ferreira~26.08.2022|Pacos Ferreira|Estoril|0|3
Estoril|Pacos Ferreira~31.01.2022|Estoril|Pacos Ferreira|0|0
Estoril|Pacos Ferreira~23.08.2021|Pacos Ferreira|Estoril|1|3
Marítimo|Portimonense~18.02.2023|Portimonense|Marítimo|2|1
Marítimo|Portimonense~27.08.2022|Marítimo|Portimonense|0|1
Marítimo|Portimonense~14.05.2022|Marítimo|Portimonense|0|1
Marítimo|Portimonense~09.01.2022|Portimonense|Marítimo|1|2
Braga|Marítimo~12.02.2023|Marítimo|Braga|1|2
Braga|Marítimo~21.08.2022|Braga|Marítimo|5|0
Braga|Marítimo~15.01.2022|Braga|Marítimo|0|1
Braga|Marítimo~07.08.2021|Marítimo|Braga|0|2
Pacos Ferreira|Portimonense~06.02.2023|Portimonense|Pacos Ferreira|1|0
Pacos Ferreira|Portimonense~15.08.2022|Pacos Ferreira|Portimonense|0|3
Pacos Ferreira|Portimonense~05.02.2022|Pacos Ferreira|Portimonense|1|1
Pacos Ferreira|Portimonense~29.08.2021|Portimonense|Pacos Ferreira|0|1
Chaves|Marítimo~05.02.2023|Chaves|Marítimo|2|1
Chaves|Marítimo~15.08.2022|Marítimo|Chaves|1|2
Gil Vicente|Pacos Ferreira~31.01.2023|Pacos Ferreira|Gil Vicente|2|1
Gil Vicente|Pacos Ferreira~08.08.2022|Gil Vicente|Pacos Ferreira|1|0
Gil Vicente|Pacos Ferreira~23.04.2022|Gil Vicente|Pacos Ferreira|1|1
Gil Vicente|Pacos Ferreira~10.12.2021|Pacos Ferreira|Gil Vicente|0|1
Benfica|Pacos Ferreira~26.01.2023|Pacos Ferreira|Benfica|0|2
Benfica|Pacos Ferreira~30.08.2022|Benfica|Pacos Ferreira|3|2
Benfica|Pacos Ferreira~13.05.2022|Pacos Ferreira|Benfica|0|2
Benfica|Pacos Ferreira~09.01.2022|Benfica|Pacos Ferreira|2|0
Arouca|Belenenses~14.05.2022|Arouca|Belenenses|0|0
Arouca|Belenenses~09.01.2022|Belenenses|Arouca|2|1
Boavista|Tondela~14.05.2022|Tondela|Boavista|2|2
Boavista|Tondela~08.01.2022|Boavista|Tondela|1|1
Belenenses|Famalicão~09.05.2022|Belenenses|Famalicão|2|3
Belenenses|Famalicão~13.01.2022|Famalicão|Belenenses|1|0
Pacos Ferreira|Tondela~02.05.2022|Pacos Ferreira|Tondela|1|1
Pacos Ferreira|Tondela~18.12.2021|Tondela|Pacos Ferreira|0|1
Belenenses|Braga~30.04.2022|Belenenses|Braga|0|1
Belenenses|Braga~19.12.2021|Braga|Belenenses|1|0
Belenenses|Estoril~24.04.2022|Estoril|Belenenses|2|2
Belenenses|Estoril~12.12.2021|Belenenses|Estoril|0|1
Belenenses|Vizela~16.04.2022|Belenenses|Vizela|1|0
Belenenses|Vizela~02.01.2022|Vizela|Belenenses|2|0
Belenenses|Benfica~09.04.2022|Benfica|Belenenses|3|1
Belenenses|Benfica~27.11.2021|Belenenses|Benfica|0|7
Marítimo|Tondela~03.04.2022|Marítimo|Tondela|1|3
Marítimo|Tondela~07.11.2021|Tondela|Marítimo|4|2
Belenenses|Portimonense~02.04.2022|Belenenses|Portimonense|2|0
Belenenses|Portimonense~06.11.2021|Portimonense|Belenenses|2|0
Moreirense|Pacos Ferreira~20.03.2022|Pacos Ferreira|Moreirense|2|1
Moreirense|Pacos Ferreira~01.11.2021|Moreirense|Pacos Ferreira|1|1
Belenenses|Santa Clara~19.03.2022|Santa Clara|Belenenses|0|0
Belenenses|Santa Clara~31.10.2021|Belenenses|Santa Clara|2|1
Belenenses|Boavista~12.03.2022|Belenenses|Boavista|0|0
Belenenses|Boavista~25.10.2021|Boavista|Belenenses|0|0
Belenenses|Tondela~07.03.2022|Tondela|Belenenses|1|1
Belenenses|Tondela~03.10.2021|Belenenses|Tondela|0|2
Belenenses|Pacos Ferreira~25.02.2022|Belenenses|Pacos Ferreira|0|2
Belenenses|Pacos Ferreira~27.09.2021|Pacos Ferreira|Belenenses|2|2
Belenenses|Gil Vicente~19.02.2022|Gil Vicente|Belenenses|2|0
Belenenses|Gil Vicente~18.09.2021|Belenenses|Gil Vicente|1|1
Belenenses|Guimarães~13.02.2022|Belenenses|Guimarães|1|0
Belenenses|Guimarães~12.09.2021|Guimarães|Belenenses|0|0
Belenenses|Moreirense~07.02.2022|Moreirense|Belenenses|4|1
Belenenses|Moreirense~27.08.2021|Belenenses|Moreirense|1|1
Belenenses|Sporting~02.02.2022|Belenenses|Sporting|1|4
Belenenses|Sporting~21.08.2021|Sporting|Belenenses|2|0
Portimonense|Tondela~30.01.2022|Portimonense|Tondela|1|2
Portimonense|Tondela~22.08.2021|Tondela|Portimonense|0|3
Belenenses|Marítimo~23.01.2022|Marítimo|Belenenses|1|1
Belenenses|Marítimo~16.08.2021|Belenenses|Marítimo|1|2
Tondela|Vizela~22.01.2022|Tondela|Vizela|2|3
Tondela|Vizela~14.08.2021|Vizela|Tondela|2|1
Belenenses|Porto~16.01.2022|Belenenses|Porto|1|4
Belenenses|Porto~08.08.2021|Porto|Belenenses|2|0`;
const BELR=`Club Brugge|Kortrijk|3|0
Standard|Cercle Brugge|2|2
STVV|Lommel SK|1|1
Westerlo|Union SG|1|5
Gent|Mechelen|2|0
Charleroi|OH Leuven|3|1
Zulte Waregem|Genk|2|1
Anderlecht|La Louvière|2|1
Antwerp|Beveren|2|1
Cercle Brugge|STVV|3|3
Union SG|Zulte Waregem|0|0
Kortrijk|Antwerp|0|3
Genk|Westerlo|3|2
OH Leuven|Club Brugge|0|3
Beveren|Anderlecht|1|0
La Louvière|Gent|1|2
Mechelen|Standard|3|3
Lommel SK|Charleroi|0|1
Standard|La Louvière|2|0
Zulte Waregem|Beveren|4|0
Charleroi|Mechelen|2|0
Antwerp|Genk|4|4
Lommel SK|Westerlo|4|0
Club Brugge|Cercle Brugge|1|0
Genk|Beveren|4|0
La Louvière|Mechelen|2|2
Kortrijk|Charleroi|1|3
Cercle Brugge|Lommel SK|0|1
OH Leuven|Standard|1|2
Gent|Club Brugge|2|1
Antwerp|STVV|1|4
Union SG|Anderlecht|3|0
Westerlo|Zulte Waregem|2|2
STVV|Union SG|0|3
Anderlecht|Kortrijk|1|0
Gent|OH Leuven|1|0
Lommel SK|Club Brugge|0|1
Charleroi|Union SG|2|3
Mechelen|Westerlo|0|4
STVV|La Louvière|4|0
Standard|Antwerp|1|0
Cercle Brugge|Gent|0|3
Kortrijk|Zulte Waregem|0|2
Anderlecht|Genk|0|0
Beveren|OH Leuven|3|0
Mechelen|Anderlecht|0|1
Beveren|STVV|2|0
Westerlo|Standard|4|2
OH Leuven|Cercle Brugge|1|1
Union SG|Lommel SK|5|0
Club Brugge|Antwerp|3|1
Genk|Gent|1|1
Zulte Waregem|Charleroi|0|1
La Louvière|Kortrijk|3|0
Gent|Standard|2|1
OH Leuven|La Louvière|2|0
Charleroi|Cercle Brugge|3|2
Anderlecht|Zulte Waregem|3|0
Lommel SK|Mechelen|0|0
Antwerp|Union SG|0|2
STVV|Westerlo|0|2
Club Brugge|Genk|3|0
Kortrijk|Beveren|1|0
Beveren|Lommel SK|1|3
Cercle Brugge|Anderlecht|1|2
La Louvière|Club Brugge|1|4
Genk|Kortrijk|3|0
Zulte Waregem|Gent|0|2
Standard|Charleroi|0|1
Union SG|OH Leuven|1|1
Westerlo|Antwerp|5|1
Mechelen|STVV|4|3
Antwerp|Charleroi|3|0
OH Leuven|Lommel SK|2|2
La Louvière|Zulte Waregem|3|0
Westerlo|Beveren|4|4
Genk|Standard|2|1
Club Brugge|STVV|3|2
Gent|Anderlecht|4|0
Union SG|Cercle Brugge|5|2
Zulte Waregem|Club Brugge|2|4
Mechelen|Genk|1|0
Standard|Kortrijk|1|1
Anderlecht|Westerlo|4|1
Beveren|Union SG|1|2
Cercle Brugge|Antwerp|2|1
STVV|OH Leuven|1|2
Lommel SK|Gent|2|0
Charleroi|La Louvière|5|2
Kortrijk|Mechelen|1|3`,BELH=`Kortrijk|Mechelen~04.11.2026|Kortrijk|Mechelen|1|3
Kortrijk|Mechelen~29.11.2024|Kortrijk|Mechelen|3|1
Kortrijk|Mechelen~20.10.2024|Mechelen|Kortrijk|3|0
Kortrijk|Mechelen~24.02.2024|Mechelen|Kortrijk|3|0
Kortrijk|Mechelen~26.11.2023|Kortrijk|Mechelen|0|3
Antwerp|Cercle Brugge~01.11.2026|Cercle Brugge|Antwerp|2|1
Antwerp|Cercle Brugge~31.01.2026|Cercle Brugge|Antwerp|0|4
Antwerp|Cercle Brugge~04.10.2025|Antwerp|Cercle Brugge|1|1
Antwerp|Cercle Brugge~01.03.2025|Cercle Brugge|Antwerp|0|0
Antwerp|Cercle Brugge~06.10.2024|Antwerp|Cercle Brugge|3|0
OH Leuven|STVV~01.11.2026|STVV|OH Leuven|1|2
OH Leuven|STVV~18.01.2026|STVV|OH Leuven|1|0
OH Leuven|STVV~23.11.2025|OH Leuven|STVV|1|2
OH Leuven|STVV~16.03.2025|OH Leuven|STVV|3|2
OH Leuven|STVV~15.09.2024|STVV|OH Leuven|2|1
Gent|Lommel SK~01.11.2026|Lommel SK|Gent|2|0
Charleroi|La Louvière~01.11.2026|Charleroi|La Louvière|5|2
Charleroi|La Louvière~29.11.2025|Charleroi|La Louvière|0|0
Charleroi|La Louvière~10.08.2025|La Louvière|Charleroi|1|0
Genk|Mechelen~31.10.2026|Mechelen|Genk|1|0
Genk|Mechelen~13.02.2026|Mechelen|Genk|2|3
Genk|Mechelen~23.11.2025|Genk|Mechelen|0|1
Genk|Mechelen~18.01.2025|Mechelen|Genk|1|2
Genk|Mechelen~28.09.2024|Genk|Mechelen|2|1
Kortrijk|Standard~31.10.2026|Standard|Kortrijk|1|1
Kortrijk|Standard~10.01.2025|Standard|Kortrijk|1|0
Kortrijk|Standard~18.08.2024|Kortrijk|Standard|1|0
Kortrijk|Standard~20.01.2024|Standard|Kortrijk|0|1
Kortrijk|Standard~26.08.2023|Kortrijk|Standard|1|1
Anderlecht|Westerlo~31.10.2026|Anderlecht|Westerlo|4|1
Anderlecht|Westerlo~07.12.2025|Westerlo|Anderlecht|4|0
Anderlecht|Westerlo~27.07.2025|Anderlecht|Westerlo|5|2
Anderlecht|Westerlo~09.03.2025|Westerlo|Anderlecht|2|0
Anderlecht|Westerlo~14.09.2024|Anderlecht|Westerlo|2|2
Beveren|Union SG~31.10.2026|Beveren|Union SG|1|2
Club Brugge|Zulte Waregem~30.10.2026|Zulte Waregem|Club Brugge|2|4
Club Brugge|Zulte Waregem~24.01.2026|Club Brugge|Zulte Waregem|4|3
Club Brugge|Zulte Waregem~16.08.2025|Zulte Waregem|Club Brugge|0|1
Club Brugge|Zulte Waregem~29.01.2023|Zulte Waregem|Club Brugge|1|2
Club Brugge|Zulte Waregem~05.08.2022|Club Brugge|Zulte Waregem|1|1
Genk|Standard~25.10.2026|Genk|Standard|2|1
Genk|Standard~16.05.2026|Standard|Genk|0|0
Genk|Standard~25.04.2026|Genk|Standard|1|1
Genk|Standard~22.02.2026|Genk|Standard|0|3
Genk|Standard~10.08.2025|Standard|Genk|2|1
Club Brugge|STVV~25.10.2026|Club Brugge|STVV|3|2
Club Brugge|STVV~09.05.2026|Club Brugge|STVV|2|0
Club Brugge|STVV~11.04.2026|STVV|Club Brugge|1|2
Club Brugge|STVV~06.12.2025|STVV|Club Brugge|3|2
Club Brugge|STVV~21.09.2025|Club Brugge|STVV|2|0
Anderlecht|Gent~25.10.2026|Gent|Anderlecht|4|0
Anderlecht|Gent~10.05.2026|Gent|Anderlecht|1|1
Anderlecht|Gent~12.04.2026|Anderlecht|Gent|3|1
Anderlecht|Gent~18.01.2026|Gent|Anderlecht|4|2
Anderlecht|Gent~23.09.2025|Anderlecht|Gent|1|0
Cercle Brugge|Union SG~25.10.2026|Union SG|Cercle Brugge|5|2
Cercle Brugge|Union SG~26.12.2025|Cercle Brugge|Union SG|1|1
Cercle Brugge|Union SG~22.11.2025|Union SG|Cercle Brugge|2|0
Cercle Brugge|Union SG~08.12.2024|Cercle Brugge|Union SG|0|0
Cercle Brugge|Union SG~27.10.2024|Union SG|Cercle Brugge|1|3
Antwerp|Charleroi~24.10.2026|Antwerp|Charleroi|3|0
Antwerp|Charleroi~10.05.2026|Antwerp|Charleroi|0|1
Antwerp|Charleroi~10.04.2026|Charleroi|Antwerp|2|1
Antwerp|Charleroi~25.01.2026|Antwerp|Charleroi|0|2
Antwerp|Charleroi~17.08.2025|Charleroi|Antwerp|1|1
Lommel SK|OH Leuven~24.10.2026|OH Leuven|Lommel SK|2|2
La Louvière|Zulte Waregem~24.10.2026|La Louvière|Zulte Waregem|3|0
La Louvière|Zulte Waregem~26.04.2026|Zulte Waregem|La Louvière|4|0
La Louvière|Zulte Waregem~19.04.2026|La Louvière|Zulte Waregem|0|2
La Louvière|Zulte Waregem~13.12.2025|Zulte Waregem|La Louvière|2|2
La Louvière|Zulte Waregem~04.10.2025|La Louvière|Zulte Waregem|0|0
Beveren|Westerlo~24.10.2026|Westerlo|Beveren|4|4
Charleroi|Standard~11.10.2026|Standard|Charleroi|0|1
Charleroi|Standard~23.05.2026|Standard|Charleroi|0|2
Charleroi|Standard~18.04.2026|Charleroi|Standard|1|2
Charleroi|Standard~18.01.2026|Charleroi|Standard|2|0
Charleroi|Standard~31.10.2025|Standard|Charleroi|3|1
OH Leuven|Union SG~11.10.2026|Union SG|OH Leuven|1|1
OH Leuven|Union SG~24.01.2026|OH Leuven|Union SG|0|0
OH Leuven|Union SG~03.08.2025|Union SG|OH Leuven|5|0
OH Leuven|Union SG~19.01.2025|Union SG|OH Leuven|1|0
OH Leuven|Union SG~24.11.2024|OH Leuven|Union SG|1|1
Antwerp|Westerlo~11.10.2026|Westerlo|Antwerp|5|1
Antwerp|Westerlo~23.05.2026|Antwerp|Westerlo|2|0
Antwerp|Westerlo~25.04.2026|Westerlo|Antwerp|2|4
Antwerp|Westerlo~15.02.2026|Antwerp|Westerlo|0|2
Antwerp|Westerlo~30.08.2025|Westerlo|Antwerp|2|0
Mechelen|STVV~11.10.2026|Mechelen|STVV|4|3
Mechelen|STVV~24.05.2026|STVV|Mechelen|3|0
Mechelen|STVV~26.04.2026|Mechelen|STVV|1|4
Mechelen|STVV~21.12.2025|STVV|Mechelen|1|0
Mechelen|STVV~04.10.2025|Mechelen|STVV|1|3
Anderlecht|Cercle Brugge~10.10.2026|Cercle Brugge|Anderlecht|1|2
Anderlecht|Cercle Brugge~22.03.2026|Anderlecht|Cercle Brugge|2|3
Anderlecht|Cercle Brugge~03.08.2025|Cercle Brugge|Anderlecht|0|2
Anderlecht|Cercle Brugge~16.03.2025|Anderlecht|Cercle Brugge|3|0
Anderlecht|Cercle Brugge~10.11.2024|Cercle Brugge|Anderlecht|0|5
Club Brugge|La Louvière~10.10.2026|La Louvière|Club Brugge|1|4
Club Brugge|La Louvière~16.01.2026|Club Brugge|La Louvière|2|3
Club Brugge|La Louvière~13.09.2025|La Louvière|Club Brugge|1|0
Genk|Kortrijk~10.10.2026|Genk|Kortrijk|3|0
Genk|Kortrijk~07.12.2024|Genk|Kortrijk|3|2
Genk|Kortrijk~05.10.2024|Kortrijk|Genk|2|1
Genk|Kortrijk~17.12.2023|Genk|Kortrijk|4|0
Genk|Kortrijk~29.10.2023|Kortrijk|Genk|0|3
Gent|Zulte Waregem~10.10.2026|Zulte Waregem|Gent|0|2
Gent|Zulte Waregem~13.03.2026|Gent|Zulte Waregem|2|0
Gent|Zulte Waregem~19.10.2025|Zulte Waregem|Gent|4|1
Gent|Zulte Waregem~12.03.2023|Zulte Waregem|Gent|2|6
Gent|Zulte Waregem~11.09.2022|Gent|Zulte Waregem|2|0
Beveren|Lommel SK~09.10.2026|Beveren|Lommel SK|1|3
Antwerp|Union SG~20.09.2026|Antwerp|Union SG|0|2
Antwerp|Union SG~21.02.2026|Union SG|Antwerp|2|1
Antwerp|Union SG~25.07.2025|Antwerp|Union SG|1|1
Antwerp|Union SG~17.05.2025|Antwerp|Union SG|0|4
Antwerp|Union SG~29.03.2025|Union SG|Antwerp|5|1
STVV|Westerlo~20.09.2026|STVV|Westerlo|0|2
STVV|Westerlo~06.02.2026|Westerlo|STVV|0|4
STVV|Westerlo~14.09.2025|STVV|Westerlo|0|3
STVV|Westerlo~11.01.2025|Westerlo|STVV|1|2
STVV|Westerlo~26.10.2024|STVV|Westerlo|2|0
Club Brugge|Genk~20.09.2026|Club Brugge|Genk|3|0
Club Brugge|Genk~26.12.2025|Genk|Club Brugge|3|5
Club Brugge|Genk~27.07.2025|Club Brugge|Genk|2|1
Club Brugge|Genk~11.05.2025|Genk|Club Brugge|0|2
Club Brugge|Genk~13.04.2025|Club Brugge|Genk|1|0
Beveren|Kortrijk~20.09.2026|Kortrijk|Beveren|1|0
La Louvière|OH Leuven~19.09.2026|OH Leuven|La Louvière|2|0
La Louvière|OH Leuven~27.12.2025|La Louvière|OH Leuven|0|0
La Louvière|OH Leuven~20.09.2025|OH Leuven|La Louvière|1|2
Cercle Brugge|Charleroi~19.09.2026|Charleroi|Cercle Brugge|3|2
Cercle Brugge|Charleroi~07.02.2026|Charleroi|Cercle Brugge|3|4
Cercle Brugge|Charleroi~14.09.2025|Cercle Brugge|Charleroi|2|3
Cercle Brugge|Charleroi~25.01.2025|Charleroi|Cercle Brugge|1|1
Cercle Brugge|Charleroi~03.11.2024|Cercle Brugge|Charleroi|2|0
Anderlecht|Zulte Waregem~19.09.2026|Anderlecht|Zulte Waregem|3|0
Anderlecht|Zulte Waregem~22.02.2026|Zulte Waregem|Anderlecht|2|4
Anderlecht|Zulte Waregem~10.08.2025|Anderlecht|Zulte Waregem|2|3
Anderlecht|Zulte Waregem~18.01.2023|Anderlecht|Zulte Waregem|2|3
Anderlecht|Zulte Waregem~20.10.2022|Zulte Waregem|Anderlecht|3|2
Lommel SK|Mechelen~19.09.2026|Lommel SK|Mechelen|0|0
Gent|Standard~18.09.2026|Gent|Standard|2|1
Gent|Standard~23.01.2026|Standard|Gent|0|4
Gent|Standard~25.10.2025|Gent|Standard|4|0
Gent|Standard~22.12.2024|Standard|Gent|0|1
Gent|Standard~10.11.2024|Gent|Standard|5|0
Antwerp|Club Brugge~13.09.2026|Club Brugge|Antwerp|3|1
Antwerp|Club Brugge~30.11.2025|Club Brugge|Antwerp|0|1
Antwerp|Club Brugge~26.10.2025|Antwerp|Club Brugge|0|1
Antwerp|Club Brugge~25.05.2025|Club Brugge|Antwerp|1|1
Antwerp|Club Brugge~06.04.2025|Antwerp|Club Brugge|2|3
Genk|Gent~13.09.2026|Genk|Gent|1|1
Genk|Gent~01.03.2026|Genk|Gent|3|0
Genk|Gent~09.11.2025|Gent|Genk|1|1
Genk|Gent~18.05.2025|Gent|Genk|1|4
Genk|Gent~30.03.2025|Genk|Gent|4|0
Charleroi|Zulte Waregem~13.09.2026|Zulte Waregem|Charleroi|0|1
Charleroi|Zulte Waregem~22.03.2026|Zulte Waregem|Charleroi|1|0
Charleroi|Zulte Waregem~20.09.2025|Charleroi|Zulte Waregem|1|2
Charleroi|Zulte Waregem~08.04.2023|Charleroi|Zulte Waregem|3|2
Charleroi|Zulte Waregem~21.08.2022|Zulte Waregem|Charleroi|1|3
Kortrijk|La Louvière~13.09.2026|La Louvière|Kortrijk|3|0
Beveren|STVV~12.09.2026|Beveren|STVV|2|0
Standard|Westerlo~12.09.2026|Westerlo|Standard|4|2
Standard|Westerlo~19.05.2026|Westerlo|Standard|1|2
Standard|Westerlo~11.04.2026|Standard|Westerlo|1|2
Standard|Westerlo~22.03.2026|Standard|Westerlo|0|0
Standard|Westerlo~21.09.2025|Westerlo|Standard|0|2
Cercle Brugge|OH Leuven~12.09.2026|OH Leuven|Cercle Brugge|1|1
Cercle Brugge|OH Leuven~21.12.2025|OH Leuven|Cercle Brugge|0|2
Cercle Brugge|OH Leuven~08.11.2025|Cercle Brugge|OH Leuven|1|2
Cercle Brugge|OH Leuven~22.12.2024|Cercle Brugge|OH Leuven|1|0
Cercle Brugge|OH Leuven~18.08.2024|OH Leuven|Cercle Brugge|1|1
Lommel SK|Union SG~12.09.2026|Union SG|Lommel SK|5|0
Anderlecht|Mechelen~11.09.2026|Mechelen|Anderlecht|0|1
Anderlecht|Mechelen~17.05.2026|Anderlecht|Mechelen|2|2
Anderlecht|Mechelen~18.04.2026|Mechelen|Anderlecht|1|2
Anderlecht|Mechelen~15.03.2026|Mechelen|Anderlecht|1|0
Anderlecht|Mechelen~01.11.2025|Anderlecht|Mechelen|3|1
Cercle Brugge|Gent~06.09.2026|Cercle Brugge|Gent|0|3
Cercle Brugge|Gent~20.02.2026|Gent|Cercle Brugge|0|1
Cercle Brugge|Gent~28.09.2025|Cercle Brugge|Gent|2|4
Cercle Brugge|Gent~15.12.2024|Gent|Cercle Brugge|1|1
Cercle Brugge|Gent~26.09.2024|Cercle Brugge|Gent|2|1
Kortrijk|Zulte Waregem~06.09.2026|Kortrijk|Zulte Waregem|0|2
Kortrijk|Zulte Waregem~24.02.2023|Zulte Waregem|Kortrijk|3|3
Kortrijk|Zulte Waregem~15.10.2022|Kortrijk|Zulte Waregem|1|3
Kortrijk|Zulte Waregem~19.02.2022|Kortrijk|Zulte Waregem|5|0
Kortrijk|Zulte Waregem~25.09.2021|Zulte Waregem|Kortrijk|2|2
Anderlecht|Genk~06.09.2026|Anderlecht|Genk|0|0
Anderlecht|Genk~08.02.2026|Genk|Anderlecht|2|0
Anderlecht|Genk~14.09.2025|Anderlecht|Genk|1|1
Anderlecht|Genk~25.05.2025|Genk|Anderlecht|2|1
Anderlecht|Genk~06.04.2025|Anderlecht|Genk|1|2
Beveren|OH Leuven~06.09.2026|Beveren|OH Leuven|3|0
Charleroi|Union SG~05.09.2026|Charleroi|Union SG|2|3
Charleroi|Union SG~14.12.2025|Charleroi|Union SG|1|1
Charleroi|Union SG~18.10.2025|Union SG|Charleroi|3|1
Charleroi|Union SG~11.01.2025|Charleroi|Union SG|1|2
Charleroi|Union SG~16.08.2024|Union SG|Charleroi|1|0
Mechelen|Westerlo~05.09.2026|Mechelen|Westerlo|0|4
Mechelen|Westerlo~25.01.2026|Mechelen|Westerlo|1|1
Mechelen|Westerlo~09.08.2025|Westerlo|Mechelen|0|1
Mechelen|Westerlo~26.04.2025|Westerlo|Mechelen|2|2
Mechelen|Westerlo~22.04.2025|Mechelen|Westerlo|2|3
La Louvière|STVV~05.09.2026|STVV|La Louvière|4|0
La Louvière|STVV~24.01.2026|La Louvière|STVV|1|2
La Louvière|STVV~17.08.2025|STVV|La Louvière|2|1
Antwerp|Standard~05.09.2026|Standard|Antwerp|1|0
Antwerp|Standard~03.05.2026|Antwerp|Standard|0|5
Antwerp|Standard~21.04.2026|Standard|Antwerp|1|2
Antwerp|Standard~15.03.2026|Antwerp|Standard|1|1
Antwerp|Standard~20.10.2025|Standard|Antwerp|1|0
Club Brugge|Lommel SK~04.09.2026|Lommel SK|Club Brugge|0|1
Anderlecht|Kortrijk~03.09.2026|Anderlecht|Kortrijk|1|0
Anderlecht|Kortrijk~19.01.2025|Kortrijk|Anderlecht|0|2
Anderlecht|Kortrijk~03.11.2024|Anderlecht|Kortrijk|4|0
Anderlecht|Kortrijk~16.03.2024|Anderlecht|Kortrijk|0|1
Anderlecht|Kortrijk~17.09.2023|Kortrijk|Anderlecht|2|2
Gent|OH Leuven~03.09.2026|Gent|OH Leuven|1|0
Gent|OH Leuven~07.02.2026|Gent|OH Leuven|1|3
Gent|OH Leuven~02.11.2025|OH Leuven|Gent|4|0
Gent|OH Leuven~26.01.2025|OH Leuven|Gent|0|0
Gent|OH Leuven~29.09.2024|Gent|OH Leuven|3|0
STVV|Union SG~02.09.2026|STVV|Union SG|0|3
STVV|Union SG~02.05.2026|STVV|Union SG|2|1
STVV|Union SG~04.04.2026|Union SG|STVV|1|0
STVV|Union SG~22.03.2026|STVV|Union SG|1|3
STVV|Union SG~26.10.2025|Union SG|STVV|2|0
Club Brugge|Gent~30.08.2026|Gent|Club Brugge|2|1
Club Brugge|Gent~24.05.2026|Club Brugge|Gent|5|0
Club Brugge|Gent~26.04.2026|Gent|Club Brugge|0|2
Club Brugge|Gent~21.12.2025|Club Brugge|Gent|2|1
Club Brugge|Gent~31.08.2025|Gent|Club Brugge|1|1
Antwerp|STVV~30.08.2026|Antwerp|STVV|1|4
Antwerp|STVV~28.02.2026|Antwerp|STVV|1|0
Antwerp|STVV~02.11.2025|STVV|Antwerp|1|0
Antwerp|STVV~24.01.2025|STVV|Antwerp|1|1
Antwerp|STVV~11.08.2024|Antwerp|STVV|6|1
Anderlecht|Union SG~30.08.2026|Union SG|Anderlecht|3|0
Anderlecht|Union SG~24.05.2026|Union SG|Anderlecht|5|1
Anderlecht|Union SG~26.04.2026|Anderlecht|Union SG|1|3
Anderlecht|Union SG~30.11.2025|Anderlecht|Union SG|1|0
Anderlecht|Union SG~31.08.2025|Union SG|Anderlecht|2|0
Westerlo|Zulte Waregem~30.08.2026|Westerlo|Zulte Waregem|2|2
Westerlo|Zulte Waregem~31.01.2026|Zulte Waregem|Westerlo|0|1
Westerlo|Zulte Waregem~02.08.2025|Westerlo|Zulte Waregem|3|1
Westerlo|Zulte Waregem~21.01.2023|Zulte Waregem|Westerlo|1|1
Westerlo|Zulte Waregem~01.10.2022|Westerlo|Zulte Waregem|2|0
La Louvière|Mechelen~29.08.2026|La Louvière|Mechelen|2|2
La Louvière|Mechelen~22.02.2026|La Louvière|Mechelen|0|2
La Louvière|Mechelen~30.08.2025|Mechelen|La Louvière|3|2
Charleroi|Kortrijk~29.08.2026|Kortrijk|Charleroi|1|3
Charleroi|Kortrijk~26.12.2024|Kortrijk|Charleroi|0|1
Charleroi|Kortrijk~25.08.2024|Charleroi|Kortrijk|1|0
Charleroi|Kortrijk~11.05.2024|Charleroi|Kortrijk|3|1
Charleroi|Kortrijk~14.04.2024|Kortrijk|Charleroi|1|2
Cercle Brugge|Lommel SK~29.08.2026|Cercle Brugge|Lommel SK|0|1
OH Leuven|Standard~29.08.2026|OH Leuven|Standard|1|2
OH Leuven|Standard~08.05.2026|Standard|OH Leuven|2|1
OH Leuven|Standard~04.04.2026|OH Leuven|Standard|1|3
OH Leuven|Standard~12.12.2025|Standard|OH Leuven|0|1
OH Leuven|Standard~31.08.2025|OH Leuven|Standard|1|0
Beveren|Genk~28.08.2026|Genk|Beveren|4|0
Lommel SK|Westerlo~23.08.2026|Lommel SK|Westerlo|4|0
Cercle Brugge|Club Brugge~23.08.2026|Club Brugge|Cercle Brugge|1|0
Cercle Brugge|Club Brugge~15.02.2026|Cercle Brugge|Club Brugge|1|2
Cercle Brugge|Club Brugge~09.08.2025|Club Brugge|Cercle Brugge|2|0
Cercle Brugge|Club Brugge~09.03.2025|Cercle Brugge|Club Brugge|1|3
Cercle Brugge|Club Brugge~01.09.2024|Club Brugge|Cercle Brugge|3|0
Beveren|Zulte Waregem~22.08.2026|Zulte Waregem|Beveren|4|0
Charleroi|Mechelen~22.08.2026|Charleroi|Mechelen|2|0
Charleroi|Mechelen~07.12.2025|Mechelen|Charleroi|1|0
Charleroi|Mechelen~28.09.2025|Charleroi|Mechelen|0|2
Charleroi|Mechelen~18.05.2025|Mechelen|Charleroi|1|1
Charleroi|Mechelen~19.04.2025|Charleroi|Mechelen|3|0
Antwerp|Genk~22.08.2026|Antwerp|Genk|4|4
Antwerp|Genk~19.05.2026|Genk|Antwerp|0|0
Antwerp|Genk~03.04.2026|Antwerp|Genk|1|2
Antwerp|Genk~07.12.2025|Antwerp|Genk|3|0
Antwerp|Genk~03.08.2025|Genk|Antwerp|1|1
La Louvière|Standard~21.08.2026|Standard|La Louvière|2|0
La Louvière|Standard~27.02.2026|Standard|La Louvière|1|1
La Louvière|Standard~26.07.2025|La Louvière|Standard|0|2
Anderlecht|Beveren~16.08.2026|Beveren|Anderlecht|1|0
Gent|La Louvière~16.08.2026|La Louvière|Gent|1|2
Gent|La Louvière~30.01.2026|La Louvière|Gent|1|1
Gent|La Louvière~02.08.2025|Gent|La Louvière|1|0
Mechelen|Standard~16.08.2026|Mechelen|Standard|3|3
Mechelen|Standard~28.11.2025|Mechelen|Standard|0|1
Mechelen|Standard~12.09.2025|Standard|Mechelen|1|1
Mechelen|Standard~10.05.2025|Mechelen|Standard|0|0
Mechelen|Standard~29.03.2025|Standard|Mechelen|2|2
Charleroi|Lommel SK~16.08.2026|Lommel SK|Charleroi|0|1
Union SG|Zulte Waregem~15.08.2026|Union SG|Zulte Waregem|0|0
Union SG|Zulte Waregem~20.12.2025|Union SG|Zulte Waregem|2|0
Union SG|Zulte Waregem~01.11.2025|Zulte Waregem|Union SG|1|4
Union SG|Zulte Waregem~05.02.2023|Union SG|Zulte Waregem|4|0
Union SG|Zulte Waregem~04.09.2022|Zulte Waregem|Union SG|1|3
Antwerp|Kortrijk~15.08.2026|Kortrijk|Antwerp|0|3
Antwerp|Kortrijk~15.02.2025|Antwerp|Kortrijk|2|1
Antwerp|Kortrijk~09.11.2024|Kortrijk|Antwerp|1|2
Antwerp|Kortrijk~09.03.2024|Kortrijk|Antwerp|0|1
Antwerp|Kortrijk~11.08.2023|Antwerp|Kortrijk|6|0
Genk|Westerlo~15.08.2026|Genk|Westerlo|3|2
Genk|Westerlo~10.05.2026|Genk|Westerlo|3|0
Genk|Westerlo~18.04.2026|Westerlo|Genk|1|2
Genk|Westerlo~14.12.2025|Genk|Westerlo|1|1
Genk|Westerlo~02.11.2025|Westerlo|Genk|0|1
Club Brugge|OH Leuven~15.08.2026|OH Leuven|Club Brugge|0|3
Club Brugge|OH Leuven~21.02.2026|Club Brugge|OH Leuven|2|1
Club Brugge|OH Leuven~18.10.2025|OH Leuven|Club Brugge|0|1
Club Brugge|OH Leuven~08.02.2025|Club Brugge|OH Leuven|1|0
Club Brugge|OH Leuven~02.11.2024|OH Leuven|Club Brugge|0|1
Cercle Brugge|STVV~14.08.2026|Cercle Brugge|STVV|3|3
Cercle Brugge|STVV~08.03.2026|STVV|Cercle Brugge|2|1
Cercle Brugge|STVV~29.08.2025|Cercle Brugge|STVV|1|1
Cercle Brugge|STVV~26.04.2025|Cercle Brugge|STVV|3|1
Cercle Brugge|STVV~12.04.2025|STVV|Cercle Brugge|3|1
Gent|Mechelen~09.08.2026|Gent|Mechelen|2|0
Gent|Mechelen~03.05.2026|Mechelen|Gent|1|0
Gent|Mechelen~06.04.2026|Gent|Mechelen|1|1
Gent|Mechelen~08.03.2026|Gent|Mechelen|3|1
Gent|Mechelen~16.08.2025|Mechelen|Gent|1|1
Charleroi|OH Leuven~09.08.2026|Charleroi|OH Leuven|3|1
Charleroi|OH Leuven~19.05.2026|Charleroi|OH Leuven|1|1
Charleroi|OH Leuven~25.04.2026|OH Leuven|Charleroi|0|2
Charleroi|OH Leuven~14.03.2026|Charleroi|OH Leuven|0|2
Charleroi|OH Leuven~27.07.2025|OH Leuven|Charleroi|2|2
Genk|Zulte Waregem~09.08.2026|Zulte Waregem|Genk|2|1
Genk|Zulte Waregem~17.01.2026|Zulte Waregem|Genk|2|1
Genk|Zulte Waregem~31.08.2025|Genk|Zulte Waregem|3|2
Genk|Zulte Waregem~14.01.2023|Genk|Zulte Waregem|1|0
Genk|Zulte Waregem~14.08.2022|Zulte Waregem|Genk|1|4
Anderlecht|La Louvière~09.08.2026|Anderlecht|La Louvière|2|1
Anderlecht|La Louvière~15.02.2026|Anderlecht|La Louvière|0|0
Anderlecht|La Louvière~23.11.2025|La Louvière|Anderlecht|0|1
Antwerp|Beveren~09.08.2026|Antwerp|Beveren|2|1
Cercle Brugge|Standard~08.08.2026|Standard|Cercle Brugge|2|2
Cercle Brugge|Standard~06.12.2025|Cercle Brugge|Standard|1|2
Cercle Brugge|Standard~23.08.2025|Standard|Cercle Brugge|0|3
Cercle Brugge|Standard~01.02.2025|Cercle Brugge|Standard|1|1
Cercle Brugge|Standard~23.11.2024|Standard|Cercle Brugge|1|0
Lommel SK|STVV~08.08.2026|STVV|Lommel SK|1|1
Union SG|Westerlo~08.08.2026|Westerlo|Union SG|1|5
Union SG|Westerlo~01.03.2026|Westerlo|Union SG|0|0
Union SG|Westerlo~27.09.2025|Union SG|Westerlo|2|0
Union SG|Westerlo~15.12.2024|Union SG|Westerlo|3|1
Union SG|Westerlo~10.08.2024|Westerlo|Union SG|4|3
Club Brugge|Kortrijk~07.08.2026|Club Brugge|Kortrijk|3|0
Club Brugge|Kortrijk~25.01.2025|Club Brugge|Kortrijk|1|1
Club Brugge|Kortrijk~14.09.2024|Kortrijk|Club Brugge|0|3
Club Brugge|Kortrijk~30.01.2024|Club Brugge|Kortrijk|3|3
Club Brugge|Kortrijk~21.10.2023|Kortrijk|Club Brugge|1|0
Genk|OH Leuven~23.05.2026|OH Leuven|Genk|0|2
Genk|OH Leuven~12.04.2026|Genk|OH Leuven|0|0
Genk|OH Leuven~30.11.2025|Genk|OH Leuven|2|1
Genk|OH Leuven~15.08.2025|OH Leuven|Genk|1|2
Genk|OH Leuven~11.01.2025|Genk|OH Leuven|2|0
Anderlecht|STVV~21.05.2026|Anderlecht|STVV|3|1
Anderlecht|STVV~23.04.2026|STVV|Anderlecht|2|0
Anderlecht|STVV~13.12.2025|Anderlecht|STVV|2|1
Anderlecht|STVV~19.10.2025|STVV|Anderlecht|2|2
Anderlecht|STVV~15.12.2024|STVV|Anderlecht|0|2
Gent|Union SG~21.05.2026|Gent|Union SG|0|0
Gent|Union SG~22.04.2026|Union SG|Gent|0|0
Gent|Union SG~06.12.2025|Union SG|Gent|1|1
Gent|Union SG~09.08.2025|Gent|Union SG|2|3
Gent|Union SG~25.05.2025|Union SG|Gent|3|1
Club Brugge|Mechelen~21.05.2026|Mechelen|Club Brugge|2|2
Club Brugge|Mechelen~22.04.2026|Club Brugge|Mechelen|6|1
Club Brugge|Mechelen~22.03.2026|Club Brugge|Mechelen|4|1
Club Brugge|Mechelen~01.08.2025|Mechelen|Club Brugge|2|1
Club Brugge|Mechelen~07.12.2024|Mechelen|Club Brugge|1|2
Club Brugge|Union SG~17.05.2026|Club Brugge|Union SG|5|0
Club Brugge|Union SG~19.04.2026|Union SG|Club Brugge|2|1
Club Brugge|Union SG~01.02.2026|Union SG|Club Brugge|1|0
Club Brugge|Union SG~05.10.2025|Club Brugge|Union SG|1|0
Club Brugge|Union SG~27.04.2025|Union SG|Club Brugge|0|0
Charleroi|Westerlo~16.05.2026|Charleroi|Westerlo|0|1
Charleroi|Westerlo~05.04.2026|Westerlo|Charleroi|2|0
Charleroi|Westerlo~22.02.2026|Westerlo|Charleroi|2|1
Charleroi|Westerlo~08.11.2025|Charleroi|Westerlo|2|0
Charleroi|Westerlo~09.05.2025|Charleroi|Westerlo|4|3
Gent|STVV~16.05.2026|STVV|Gent|1|1
Gent|STVV~19.04.2026|Gent|STVV|0|0
Gent|STVV~30.11.2025|Gent|STVV|1|2
Gent|STVV~27.07.2025|STVV|Gent|3|1
Gent|STVV~07.12.2024|Gent|STVV|2|0
Antwerp|OH Leuven~15.05.2026|OH Leuven|Antwerp|3|0
Antwerp|OH Leuven~18.04.2026|Antwerp|OH Leuven|2|0
Antwerp|OH Leuven~22.03.2026|OH Leuven|Antwerp|1|0
Antwerp|OH Leuven~10.08.2025|Antwerp|OH Leuven|3|1
Antwerp|OH Leuven~22.02.2025|Antwerp|OH Leuven|2|2
Mechelen|Union SG~10.05.2026|Union SG|Mechelen|3|0
Mechelen|Union SG~12.04.2026|Mechelen|Union SG|0|1
Mechelen|Union SG~17.01.2026|Union SG|Mechelen|1|0
Mechelen|Union SG~09.11.2025|Mechelen|Union SG|1|1
Mechelen|Union SG~16.02.2025|Union SG|Mechelen|0|1
Cercle Brugge|La Louvière~09.05.2026|La Louvière|Cercle Brugge|4|1
Cercle Brugge|La Louvière~11.04.2026|Cercle Brugge|La Louvière|3|0
Cercle Brugge|La Louvière~15.03.2026|Cercle Brugge|La Louvière|1|3
Cercle Brugge|La Louvière~02.11.2025|La Louvière|Cercle Brugge|2|1
Dender|Zulte Waregem~09.05.2026|Zulte Waregem|Dender|2|1
Dender|Zulte Waregem~12.04.2026|Dender|Zulte Waregem|1|2
Dender|Zulte Waregem~07.02.2026|Zulte Waregem|Dender|1|0
Dender|Zulte Waregem~07.11.2025|Dender|Zulte Waregem|2|2
Anderlecht|Club Brugge~03.05.2026|Anderlecht|Club Brugge|1|3
Anderlecht|Club Brugge~06.04.2026|Club Brugge|Anderlecht|4|2
Anderlecht|Club Brugge~08.03.2026|Club Brugge|Anderlecht|2|2
Anderlecht|Club Brugge~09.11.2025|Anderlecht|Club Brugge|1|0
Anderlecht|Club Brugge~18.05.2025|Anderlecht|Club Brugge|1|3
OH Leuven|Westerlo~02.05.2026|Westerlo|OH Leuven|3|3
OH Leuven|Westerlo~21.04.2026|OH Leuven|Westerlo|0|2
OH Leuven|Westerlo~07.03.2026|OH Leuven|Westerlo|0|1
OH Leuven|Westerlo~05.10.2025|Westerlo|OH Leuven|2|0
OH Leuven|Westerlo~16.05.2025|OH Leuven|Westerlo|0|2
Charleroi|Genk~02.05.2026|Charleroi|Genk|2|0
Charleroi|Genk~21.04.2026|Genk|Charleroi|1|1
Charleroi|Genk~19.12.2025|Charleroi|Genk|2|2
Charleroi|Genk~17.09.2025|Genk|Charleroi|0|1
Charleroi|Genk~28.02.2025|Charleroi|Genk|1|1
Cercle Brugge|Zulte Waregem~01.05.2026|Cercle Brugge|Zulte Waregem|2|3
Cercle Brugge|Zulte Waregem~04.04.2026|Zulte Waregem|Cercle Brugge|2|2
Cercle Brugge|Zulte Waregem~29.11.2025|Zulte Waregem|Cercle Brugge|1|1
Cercle Brugge|Zulte Waregem~26.10.2025|Cercle Brugge|Zulte Waregem|1|1
Cercle Brugge|Zulte Waregem~23.04.2023|Zulte Waregem|Cercle Brugge|2|3
Cercle Brugge|Dender~24.04.2026|Cercle Brugge|Dender|2|1
Cercle Brugge|Dender~19.04.2026|Dender|Cercle Brugge|1|4
Cercle Brugge|Dender~01.03.2026|Cercle Brugge|Dender|0|0
Cercle Brugge|Dender~26.07.2025|Dender|Cercle Brugge|0|0
Cercle Brugge|Dender~18.01.2025|Dender|Cercle Brugge|0|1
Dender|La Louvière~06.04.2026|La Louvière|Dender|0|1
Dender|La Louvière~05.12.2025|La Louvière|Dender|1|2
Dender|La Louvière~28.09.2025|Dender|La Louvière|0|0
Dender|Gent~22.03.2026|Dender|Gent|1|3
Dender|Gent~19.09.2025|Gent|Dender|3|0
Dender|Gent~12.01.2025|Dender|Gent|0|0
Dender|Gent~04.08.2024|Gent|Dender|1|2
Genk|La Louvière~22.03.2026|La Louvière|Genk|5|5
Genk|La Louvière~26.10.2025|Genk|La Louvière|1|1
Genk|STVV~15.03.2026|Genk|STVV|1|0
Genk|STVV~28.09.2025|STVV|Genk|1|2
Genk|STVV~01.12.2024|STVV|Genk|2|2
Genk|STVV~20.10.2024|Genk|STVV|3|2
Genk|STVV~28.01.2024|STVV|Genk|1|1
Dender|Union SG~14.03.2026|Union SG|Dender|2|0
Dender|Union SG~13.09.2025|Dender|Union SG|0|1
Dender|Union SG~01.03.2025|Union SG|Dender|4|1
Dender|Union SG~27.07.2024|Dender|Union SG|0|0
Club Brugge|Westerlo~14.03.2026|Westerlo|Club Brugge|1|2
Club Brugge|Westerlo~24.09.2025|Club Brugge|Westerlo|5|5
Club Brugge|Westerlo~26.12.2024|Club Brugge|Westerlo|4|3
Club Brugge|Westerlo~19.10.2024|Westerlo|Club Brugge|1|2
Club Brugge|Westerlo~20.01.2024|Club Brugge|Westerlo|3|0
Standard|Zulte Waregem~08.03.2026|Zulte Waregem|Standard|0|1
Standard|Zulte Waregem~21.11.2025|Standard|Zulte Waregem|0|0
Standard|Zulte Waregem~18.03.2023|Standard|Zulte Waregem|2|2
Standard|Zulte Waregem~29.10.2022|Zulte Waregem|Standard|0|3
Standard|Zulte Waregem~26.12.2021|Standard|Zulte Waregem|0|1
Charleroi|Dender~07.03.2026|Dender|Charleroi|2|2
Charleroi|Dender~30.08.2025|Charleroi|Dender|3|1
Charleroi|Dender~26.04.2025|Charleroi|Dender|4|1
Charleroi|Dender~22.04.2025|Dender|Charleroi|2|1
Charleroi|Dender~01.02.2025|Charleroi|Dender|5|0
Genk|Union SG~07.03.2026|Union SG|Genk|2|1
Genk|Union SG~21.09.2025|Genk|Union SG|1|2
Genk|Union SG~03.05.2025|Union SG|Genk|1|0
Genk|Union SG~20.04.2025|Genk|Union SG|1|2
Genk|Union SG~15.03.2025|Genk|Union SG|2|1
Antwerp|La Louvière~06.03.2026|La Louvière|Antwerp|0|0
Antwerp|La Louvière~08.11.2025|Antwerp|La Louvière|3|1
Charleroi|Club Brugge~01.03.2026|Charleroi|Club Brugge|1|2
Charleroi|Club Brugge~22.11.2025|Club Brugge|Charleroi|1|0
Charleroi|Club Brugge~16.03.2025|Club Brugge|Charleroi|4|2
Charleroi|Club Brugge~27.09.2024|Charleroi|Club Brugge|1|1
Charleroi|Club Brugge~27.01.2024|Charleroi|Club Brugge|1|4
Mechelen|Zulte Waregem~28.02.2026|Mechelen|Zulte Waregem|2|1
Mechelen|Zulte Waregem~26.07.2025|Zulte Waregem|Mechelen|1|1
Mechelen|Zulte Waregem~08.01.2023|Zulte Waregem|Mechelen|2|0
Mechelen|Zulte Waregem~05.11.2022|Mechelen|Zulte Waregem|2|2
Mechelen|Zulte Waregem~18.12.2021|Zulte Waregem|Mechelen|3|2
Anderlecht|OH Leuven~28.02.2026|Anderlecht|OH Leuven|5|1
Anderlecht|OH Leuven~26.09.2025|OH Leuven|Anderlecht|1|1
Anderlecht|OH Leuven~01.12.2024|OH Leuven|Anderlecht|0|0
Anderlecht|OH Leuven~10.08.2024|Anderlecht|OH Leuven|1|1
Anderlecht|OH Leuven~21.01.2024|OH Leuven|Anderlecht|1|1
Dender|STVV~21.02.2026|Dender|STVV|1|4
Dender|STVV~08.08.2025|STVV|Dender|2|0
Dender|STVV~08.02.2025|Dender|STVV|2|1
Dender|STVV~17.08.2024|STVV|Dender|3|3
STVV|Zulte Waregem~15.02.2026|STVV|Zulte Waregem|3|2
STVV|Zulte Waregem~23.08.2025|Zulte Waregem|STVV|0|2
STVV|Zulte Waregem~27.12.2022|STVV|Zulte Waregem|2|0
STVV|Zulte Waregem~17.09.2022|Zulte Waregem|STVV|0|3
STVV|Zulte Waregem~02.04.2022|Zulte Waregem|STVV|0|2
Dender|OH Leuven~14.02.2026|OH Leuven|Dender|3|2
Dender|OH Leuven~24.08.2025|Dender|OH Leuven|0|1
Dender|OH Leuven~11.05.2025|Dender|OH Leuven|5|0
Dender|OH Leuven~19.04.2025|OH Leuven|Dender|4|4
Dender|OH Leuven~15.02.2025|OH Leuven|Dender|3|2
Charleroi|Gent~14.02.2026|Charleroi|Gent|2|3
Charleroi|Gent~03.10.2025|Gent|Charleroi|2|1
Charleroi|Gent~17.01.2025|Gent|Charleroi|1|1
Charleroi|Gent~11.08.2024|Charleroi|Gent|1|0
Charleroi|Gent~17.03.2024|Gent|Charleroi|5|0
Standard|Union SG~14.02.2026|Standard|Union SG|1|1
Standard|Union SG~16.08.2025|Union SG|Standard|3|0
Standard|Union SG~09.03.2025|Union SG|Standard|3|0
Standard|Union SG~20.09.2024|Standard|Union SG|0|0
Standard|Union SG~25.02.2024|Union SG|Standard|2|1
La Louvière|Union SG~08.02.2026|Union SG|La Louvière|2|1
La Louvière|Union SG~24.08.2025|La Louvière|Union SG|0|0
Club Brugge|Standard~08.02.2026|Club Brugge|Standard|3|0
Club Brugge|Standard~27.09.2025|Standard|Club Brugge|1|2
Club Brugge|Standard~23.02.2025|Club Brugge|Standard|1|2
Club Brugge|Standard~04.08.2024|Standard|Club Brugge|1|0
Club Brugge|Standard~03.12.2023|Club Brugge|Standard|2|0
Antwerp|Mechelen~08.02.2026|Mechelen|Antwerp|2|0
Antwerp|Mechelen~24.08.2025|Antwerp|Mechelen|2|1
Antwerp|Mechelen~13.12.2024|Mechelen|Antwerp|1|1
Antwerp|Mechelen~24.08.2024|Antwerp|Mechelen|0|1
Antwerp|Mechelen~17.02.2024|Antwerp|Mechelen|0|1
Anderlecht|Standard~01.02.2026|Standard|Anderlecht|2|0
Anderlecht|Standard~05.10.2025|Anderlecht|Standard|1|0
Anderlecht|Standard~02.03.2025|Standard|Anderlecht|0|2
Anderlecht|Standard~06.10.2024|Anderlecht|Standard|3|0
Anderlecht|Standard~10.12.2023|Anderlecht|Standard|2|2
Dender|Genk~01.02.2026|Dender|Genk|1|2
Dender|Genk~05.10.2025|Genk|Dender|2|1
Dender|Genk~08.03.2025|Dender|Genk|0|1
Dender|Genk~22.09.2024|Genk|Dender|4|0
Mechelen|OH Leuven~01.02.2026|OH Leuven|Mechelen|2|2
Mechelen|OH Leuven~25.10.2025|Mechelen|OH Leuven|1|1
Mechelen|OH Leuven~03.05.2025|OH Leuven|Mechelen|1|2
Mechelen|OH Leuven~13.04.2025|Mechelen|OH Leuven|1|1
Mechelen|OH Leuven~31.01.2025|OH Leuven|Mechelen|1|0
Charleroi|STVV~31.01.2026|STVV|Charleroi|0|2
Charleroi|STVV~03.08.2025|Charleroi|STVV|1|1
Charleroi|STVV~21.12.2024|Charleroi|STVV|2|1
Charleroi|STVV~03.08.2024|STVV|Charleroi|1|4
Charleroi|STVV~23.12.2023|STVV|Charleroi|1|0
Cercle Brugge|Genk~25.01.2026|Genk|Cercle Brugge|1|1
Cercle Brugge|Genk~19.10.2025|Cercle Brugge|Genk|2|2
Cercle Brugge|Genk~08.02.2025|Genk|Cercle Brugge|2|1
Cercle Brugge|Genk~14.09.2024|Cercle Brugge|Genk|2|3
Cercle Brugge|Genk~04.05.2024|Cercle Brugge|Genk|4|1
Anderlecht|Dender~25.01.2026|Anderlecht|Dender|0|0
Anderlecht|Dender~17.08.2025|Dender|Anderlecht|0|2
Anderlecht|Dender~27.12.2024|Anderlecht|Dender|2|3
Anderlecht|Dender~28.09.2024|Dender|Anderlecht|1|1
Antwerp|Dender~18.01.2026|Dender|Antwerp|1|0
Antwerp|Dender~23.11.2025|Antwerp|Dender|1|2
Antwerp|Dender~21.12.2024|Dender|Antwerp|1|3
Antwerp|Dender~22.11.2024|Antwerp|Dender|1|1
Cercle Brugge|Westerlo~17.01.2026|Westerlo|Cercle Brugge|0|2
Cercle Brugge|Westerlo~17.08.2025|Cercle Brugge|Westerlo|4|1
Cercle Brugge|Westerlo~16.02.2025|Cercle Brugge|Westerlo|1|1
Cercle Brugge|Westerlo~28.07.2024|Westerlo|Cercle Brugge|3|0
Cercle Brugge|Westerlo~30.01.2024|Westerlo|Cercle Brugge|4|2
Antwerp|Zulte Waregem~27.12.2025|Antwerp|Zulte Waregem|2|1
Antwerp|Zulte Waregem~27.09.2025|Zulte Waregem|Antwerp|2|0
Antwerp|Zulte Waregem~31.03.2023|Zulte Waregem|Antwerp|0|2
Antwerp|Zulte Waregem~31.07.2022|Antwerp|Zulte Waregem|1|0
Antwerp|Zulte Waregem~19.03.2022|Antwerp|Zulte Waregem|1|0
Dender|Mechelen~27.12.2025|Mechelen|Dender|1|1
Dender|Mechelen~19.10.2025|Dender|Mechelen|1|3
Dender|Mechelen~24.05.2025|Dender|Mechelen|2|2
Dender|Mechelen~04.04.2025|Mechelen|Dender|5|2
Dender|Mechelen~16.03.2025|Mechelen|Dender|2|1
Gent|Westerlo~27.12.2025|Gent|Westerlo|2|0
Gent|Westerlo~22.11.2025|Westerlo|Gent|0|0
Gent|Westerlo~01.12.2024|Westerlo|Gent|2|2
Gent|Westerlo~18.08.2024|Gent|Westerlo|4|1
Gent|Westerlo~27.04.2024|Gent|Westerlo|3|2
STVV|Standard~26.12.2025|Standard|STVV|1|2
STVV|Standard~09.11.2025|STVV|Standard|1|0
STVV|Standard~19.01.2025|STVV|Standard|1|2
STVV|Standard~02.11.2024|Standard|STVV|2|1
STVV|Standard~27.04.2024|Standard|STVV|1|1
Anderlecht|Charleroi~26.12.2025|Anderlecht|Charleroi|1|2
Anderlecht|Charleroi~24.10.2025|Charleroi|Anderlecht|1|0
Anderlecht|Charleroi~16.02.2025|Charleroi|Anderlecht|0|1
Anderlecht|Charleroi~21.09.2024|Anderlecht|Charleroi|0|0
Anderlecht|Charleroi~11.02.2024|Charleroi|Anderlecht|1|3
Anderlecht|Antwerp~21.12.2025|Antwerp|Anderlecht|2|2
Anderlecht|Antwerp~20.09.2025|Anderlecht|Antwerp|0|0
Anderlecht|Antwerp~01.05.2025|Antwerp|Anderlecht|1|3
Anderlecht|Antwerp~20.04.2025|Anderlecht|Antwerp|0|0
Anderlecht|Antwerp~09.02.2025|Anderlecht|Antwerp|2|0
Dender|Standard~20.12.2025|Dender|Standard|0|1
Dender|Standard~02.08.2025|Standard|Dender|1|1
Dender|Standard~17.05.2025|Standard|Dender|0|0
Dender|Standard~13.04.2025|Dender|Standard|1|1
Dender|Standard~26.01.2025|Standard|Dender|1|0
La Louvière|Westerlo~20.12.2025|Westerlo|La Louvière|2|1
La Louvière|Westerlo~18.10.2025|La Louvière|Westerlo|0|0
Antwerp|Gent~14.12.2025|Gent|Antwerp|0|2
Antwerp|Gent~14.09.2025|Antwerp|Gent|1|2
Antwerp|Gent~11.05.2025|Gent|Antwerp|0|3
Antwerp|Gent~13.04.2025|Antwerp|Gent|0|1
Antwerp|Gent~09.03.2025|Antwerp|Gent|0|1
Club Brugge|Dender~14.12.2025|Dender|Club Brugge|1|5
Club Brugge|Dender~01.11.2025|Club Brugge|Dender|2|1
Club Brugge|Dender~30.11.2024|Club Brugge|Dender|4|1
Club Brugge|Dender~25.08.2024|Dender|Club Brugge|1|2
Cercle Brugge|Mechelen~13.12.2025|Cercle Brugge|Mechelen|2|3
Cercle Brugge|Mechelen~21.09.2025|Mechelen|Cercle Brugge|0|0
Cercle Brugge|Mechelen~12.01.2025|Cercle Brugge|Mechelen|1|0
Cercle Brugge|Mechelen~22.09.2024|Mechelen|Cercle Brugge|2|0
Cercle Brugge|Mechelen~02.03.2024|Cercle Brugge|Mechelen|2|3
OH Leuven|Zulte Waregem~07.12.2025|OH Leuven|Zulte Waregem|1|1
OH Leuven|Zulte Waregem~13.09.2025|Zulte Waregem|OH Leuven|2|0
OH Leuven|Zulte Waregem~04.03.2023|OH Leuven|Zulte Waregem|4|2
OH Leuven|Zulte Waregem~08.10.2022|Zulte Waregem|OH Leuven|2|5
OH Leuven|Zulte Waregem~26.01.2022|Zulte Waregem|OH Leuven|1|1
Dender|Westerlo~29.11.2025|Dender|Westerlo|2|2
Dender|Westerlo~25.10.2025|Westerlo|Dender|1|1
Dender|Westerlo~02.05.2025|Westerlo|Dender|4|2
Dender|Westerlo~30.03.2025|Dender|Westerlo|1|0
Dender|Westerlo~08.12.2024|Dender|Westerlo|1|0
Beerschot VA|Cercle Brugge~10.05.2025|Beerschot VA|Cercle Brugge|4|2
Beerschot VA|Cercle Brugge~05.04.2025|Cercle Brugge|Beerschot VA|2|1
Beerschot VA|Cercle Brugge~01.12.2024|Beerschot VA|Cercle Brugge|3|2
Beerschot VA|Cercle Brugge~11.08.2024|Cercle Brugge|Beerschot VA|4|1
Beerschot VA|Cercle Brugge~19.02.2022|Cercle Brugge|Beerschot VA|2|0
Kortrijk|STVV~10.05.2025|Kortrijk|STVV|2|2
Kortrijk|STVV~06.04.2025|STVV|Kortrijk|0|3
Kortrijk|STVV~01.03.2025|STVV|Kortrijk|4|2
Kortrijk|STVV~01.09.2024|Kortrijk|STVV|1|1
Kortrijk|STVV~09.02.2024|STVV|Kortrijk|1|0
Beerschot VA|STVV~04.05.2025|STVV|Beerschot VA|2|1
Beerschot VA|STVV~29.03.2025|Beerschot VA|STVV|0|1
Beerschot VA|STVV~07.03.2025|STVV|Beerschot VA|2|0
Beerschot VA|STVV~21.09.2024|Beerschot VA|STVV|0|3
Beerschot VA|STVV~20.03.2022|STVV|Beerschot VA|3|2
Cercle Brugge|Kortrijk~03.05.2025|Cercle Brugge|Kortrijk|0|2
Cercle Brugge|Kortrijk~30.03.2025|Kortrijk|Cercle Brugge|2|2
Cercle Brugge|Kortrijk~23.02.2025|Kortrijk|Cercle Brugge|1|1
Cercle Brugge|Kortrijk~04.08.2024|Cercle Brugge|Kortrijk|1|2
Cercle Brugge|Kortrijk~20.12.2023|Cercle Brugge|Kortrijk|3|0
Beerschot VA|Kortrijk~25.04.2025|Beerschot VA|Kortrijk|2|0
Beerschot VA|Kortrijk~12.04.2025|Kortrijk|Beerschot VA|3|2
Beerschot VA|Kortrijk~21.12.2024|Beerschot VA|Kortrijk|2|2
Beerschot VA|Kortrijk~25.10.2024|Kortrijk|Beerschot VA|1|0
Beerschot VA|Kortrijk~13.02.2022|Beerschot VA|Kortrijk|2|1
Gent|Kortrijk~16.03.2025|Gent|Kortrijk|1|2
Gent|Kortrijk~28.07.2024|Kortrijk|Gent|0|1
Gent|Kortrijk~26.12.2023|Kortrijk|Gent|0|2
Gent|Kortrijk~30.07.2023|Gent|Kortrijk|3|2
Gent|Kortrijk~15.01.2023|Gent|Kortrijk|2|1
Beerschot VA|Westerlo~16.03.2025|Beerschot VA|Westerlo|1|2
Beerschot VA|Westerlo~04.10.2024|Westerlo|Beerschot VA|2|2
Kortrijk|OH Leuven~08.03.2025|Kortrijk|OH Leuven|2|0
Kortrijk|OH Leuven~22.09.2024|OH Leuven|Kortrijk|1|1
Kortrijk|OH Leuven~27.01.2024|Kortrijk|OH Leuven|0|0
Kortrijk|OH Leuven~01.09.2023|OH Leuven|Kortrijk|3|0
Kortrijk|OH Leuven~08.01.2023|OH Leuven|Kortrijk|2|3
Beerschot VA|Mechelen~02.03.2025|Beerschot VA|Mechelen|1|0
Beerschot VA|Mechelen~24.11.2024|Mechelen|Beerschot VA|3|0
Beerschot VA|Mechelen~06.02.2022|Mechelen|Beerschot VA|3|2
Beerschot VA|Mechelen~17.10.2021|Beerschot VA|Mechelen|0|1
Beerschot VA|Dender~22.02.2025|Dender|Beerschot VA|0|0
Beerschot VA|Dender~31.08.2024|Beerschot VA|Dender|1|2
Beerschot VA|Gent~16.02.2025|Gent|Beerschot VA|3|2
Beerschot VA|Gent~03.11.2024|Beerschot VA|Gent|0|0
Beerschot VA|Gent~13.03.2022|Beerschot VA|Gent|0|2
Beerschot VA|Gent~01.08.2021|Gent|Beerschot VA|2|2
Kortrijk|Union SG~09.02.2025|Kortrijk|Union SG|1|2
Kortrijk|Union SG~29.09.2024|Union SG|Kortrijk|3|0
Kortrijk|Union SG~18.02.2024|Kortrijk|Union SG|1|3
Kortrijk|Union SG~12.11.2023|Union SG|Kortrijk|3|0
Kortrijk|Union SG~23.04.2023|Kortrijk|Union SG|2|4
Beerschot VA|Charleroi~09.02.2025|Beerschot VA|Charleroi|1|1
Beerschot VA|Charleroi~15.09.2024|Charleroi|Beerschot VA|3|0
Beerschot VA|Charleroi~25.02.2022|Beerschot VA|Charleroi|2|3
Beerschot VA|Charleroi~28.08.2021|Charleroi|Beerschot VA|5|2
Kortrijk|Westerlo~02.02.2025|Kortrijk|Westerlo|1|2
Kortrijk|Westerlo~24.11.2024|Westerlo|Kortrijk|4|0
Kortrijk|Westerlo~08.12.2023|Kortrijk|Westerlo|1|2
Kortrijk|Westerlo~07.10.2023|Westerlo|Kortrijk|1|0
Kortrijk|Westerlo~11.03.2023|Westerlo|Kortrijk|3|1
Beerschot VA|Genk~01.02.2025|Genk|Beerschot VA|1|0
Beerschot VA|Genk~17.08.2024|Beerschot VA|Genk|3|4
Beerschot VA|Genk~16.01.2022|Genk|Beerschot VA|4|1
Beerschot VA|Genk~21.11.2021|Beerschot VA|Genk|2|0
Beerschot VA|Union SG~26.01.2025|Beerschot VA|Union SG|0|4
Beerschot VA|Union SG~02.08.2024|Union SG|Beerschot VA|3|1
Beerschot VA|Union SG~10.04.2022|Union SG|Beerschot VA|5|0
Beerschot VA|Union SG~07.08.2021|Beerschot VA|Union SG|0|3
Beerschot VA|Club Brugge~18.01.2025|Club Brugge|Beerschot VA|4|2
Beerschot VA|Club Brugge~10.11.2024|Beerschot VA|Club Brugge|2|2
Beerschot VA|Club Brugge~01.04.2022|Beerschot VA|Club Brugge|1|3
Beerschot VA|Club Brugge~22.08.2021|Club Brugge|Beerschot VA|3|2
Antwerp|Beerschot VA~12.01.2025|Beerschot VA|Antwerp|1|1
Antwerp|Beerschot VA~29.09.2024|Antwerp|Beerschot VA|5|0
Antwerp|Beerschot VA~06.03.2022|Antwerp|Beerschot VA|2|1
Antwerp|Beerschot VA~05.12.2021|Beerschot VA|Antwerp|0|1
Beerschot VA|OH Leuven~27.12.2024|OH Leuven|Beerschot VA|2|0
Beerschot VA|OH Leuven~27.07.2024|Beerschot VA|OH Leuven|0|0
Beerschot VA|OH Leuven~22.01.2022|Beerschot VA|OH Leuven|3|1
Beerschot VA|OH Leuven~02.10.2021|OH Leuven|Beerschot VA|0|0
Beerschot VA|Standard~14.12.2024|Beerschot VA|Standard|0|0
Beerschot VA|Standard~25.08.2024|Standard|Beerschot VA|1|0
Beerschot VA|Standard~02.03.2022|Standard|Beerschot VA|1|0
Beerschot VA|Standard~15.08.2021|Beerschot VA|Standard|0|1
Dender|Kortrijk~14.12.2024|Kortrijk|Dender|0|3
Dender|Kortrijk~10.08.2024|Dender|Kortrijk|4|1
Anderlecht|Beerschot VA~08.12.2024|Anderlecht|Beerschot VA|2|1
Anderlecht|Beerschot VA~18.10.2024|Beerschot VA|Anderlecht|2|1
Anderlecht|Beerschot VA~27.12.2021|Beerschot VA|Anderlecht|0|7
Anderlecht|Beerschot VA~24.10.2021|Anderlecht|Beerschot VA|4|2
Eupen|RWD Molenbeek~11.05.2024|Eupen|RWD Molenbeek|2|0
Eupen|RWD Molenbeek~13.04.2024|RWD Molenbeek|Eupen|3|1
Eupen|RWD Molenbeek~24.01.2024|RWD Molenbeek|Eupen|0|1
Eupen|RWD Molenbeek~11.11.2023|Eupen|RWD Molenbeek|1|3
Eupen|Kortrijk~05.05.2024|Kortrijk|Eupen|1|0
Eupen|Kortrijk~07.04.2024|Eupen|Kortrijk|1|1
Eupen|Kortrijk~02.12.2023|Eupen|Kortrijk|1|1
Eupen|Kortrijk~20.08.2023|Kortrijk|Eupen|1|3
Eupen|Kortrijk~08.04.2023|Kortrijk|Eupen|0|0
Charleroi|RWD Molenbeek~04.05.2024|RWD Molenbeek|Charleroi|1|3
Charleroi|RWD Molenbeek~06.04.2024|Charleroi|RWD Molenbeek|0|0
Charleroi|RWD Molenbeek~02.12.2023|RWD Molenbeek|Charleroi|0|0
Charleroi|RWD Molenbeek~06.10.2023|Charleroi|RWD Molenbeek|2|1
Kortrijk|RWD Molenbeek~28.04.2024|RWD Molenbeek|Kortrijk|0|1
Kortrijk|RWD Molenbeek~21.04.2024|Kortrijk|RWD Molenbeek|2|4
Kortrijk|RWD Molenbeek~03.03.2024|Kortrijk|RWD Molenbeek|3|2
Kortrijk|RWD Molenbeek~04.11.2023|RWD Molenbeek|Kortrijk|1|1
Charleroi|Eupen~26.04.2024|Eupen|Charleroi|1|2
Charleroi|Eupen~21.04.2024|Charleroi|Eupen|1|0
Charleroi|Eupen~31.01.2024|Charleroi|Eupen|1|0
Charleroi|Eupen~28.10.2023|Eupen|Charleroi|2|0
Charleroi|Eupen~07.01.2023|Eupen|Charleroi|1|2
Cercle Brugge|RWD Molenbeek~17.03.2024|Cercle Brugge|RWD Molenbeek|4|0
Cercle Brugge|RWD Molenbeek~16.09.2023|RWD Molenbeek|Cercle Brugge|2|1
Eupen|Standard~16.03.2024|Standard|Eupen|4|0
Eupen|Standard~17.09.2023|Eupen|Standard|1|3
Eupen|Standard~27.01.2023|Standard|Eupen|3|1
Eupen|Standard~05.11.2022|Eupen|Standard|2|0
Eupen|Standard~26.01.2022|Eupen|Standard|0|2
Eupen|STVV~10.03.2024|Eupen|STVV|1|0
Eupen|STVV~03.11.2023|STVV|Eupen|1|1
Eupen|STVV~14.01.2023|Eupen|STVV|0|2
Eupen|STVV~02.10.2022|STVV|Eupen|0|1
Eupen|STVV~27.12.2021|STVV|Eupen|2|0
Anderlecht|RWD Molenbeek~09.03.2024|RWD Molenbeek|Anderlecht|0|3
Anderlecht|RWD Molenbeek~26.11.2023|Anderlecht|RWD Molenbeek|2|1
Anderlecht|Eupen~03.03.2024|Anderlecht|Eupen|1|0
Anderlecht|Eupen~30.09.2023|Eupen|Anderlecht|1|3
Anderlecht|Eupen~02.04.2023|Eupen|Anderlecht|0|1
Anderlecht|Eupen~30.10.2022|Anderlecht|Eupen|4|2
Anderlecht|Eupen~06.02.2022|Anderlecht|Eupen|4|1
Cercle Brugge|Eupen~25.02.2024|Eupen|Cercle Brugge|0|2
Cercle Brugge|Eupen~25.11.2023|Cercle Brugge|Eupen|2|0
Cercle Brugge|Eupen~25.02.2023|Eupen|Cercle Brugge|2|2
Cercle Brugge|Eupen~15.10.2022|Cercle Brugge|Eupen|5|1
Cercle Brugge|Eupen~16.01.2022|Eupen|Cercle Brugge|0|2
OH Leuven|RWD Molenbeek~24.02.2024|RWD Molenbeek|OH Leuven|1|1
OH Leuven|RWD Molenbeek~05.08.2023|OH Leuven|RWD Molenbeek|1|2
Eupen|Gent~18.02.2024|Eupen|Gent|0|2
Eupen|Gent~24.09.2023|Gent|Eupen|2|1
Eupen|Gent~19.03.2023|Gent|Eupen|3|0
Eupen|Gent~09.10.2022|Eupen|Gent|0|4
Eupen|Gent~12.02.2022|Eupen|Gent|0|1
Genk|RWD Molenbeek~17.02.2024|Genk|RWD Molenbeek|3|1
Genk|RWD Molenbeek~29.07.2023|RWD Molenbeek|Genk|0|4
Antwerp|RWD Molenbeek~11.02.2024|RWD Molenbeek|Antwerp|0|4
Antwerp|RWD Molenbeek~23.09.2023|Antwerp|RWD Molenbeek|0|0
Club Brugge|Eupen~10.02.2024|Club Brugge|Eupen|4|0
Club Brugge|Eupen~13.08.2023|Eupen|Club Brugge|0|5
Club Brugge|Eupen~23.04.2023|Club Brugge|Eupen|7|0
Club Brugge|Eupen~31.07.2022|Eupen|Club Brugge|2|1
Club Brugge|Eupen~20.02.2022|Eupen|Club Brugge|1|3
Eupen|Mechelen~04.02.2024|Eupen|Mechelen|0|1
Eupen|Mechelen~02.09.2023|Mechelen|Eupen|1|0
Eupen|Mechelen~10.02.2023|Eupen|Mechelen|2|1
Eupen|Mechelen~22.10.2022|Mechelen|Eupen|2|1
Eupen|Mechelen~19.03.2022|Eupen|Mechelen|1|1
RWD Molenbeek|Standard~03.02.2024|RWD Molenbeek|Standard|2|2
RWD Molenbeek|Standard~02.09.2023|Standard|RWD Molenbeek|1|1
RWD Molenbeek|Union SG~31.01.2024|Union SG|RWD Molenbeek|3|2
RWD Molenbeek|Union SG~28.09.2023|RWD Molenbeek|Union SG|2|3
Antwerp|Eupen~28.01.2024|Eupen|Antwerp|1|0
Antwerp|Eupen~08.10.2023|Antwerp|Eupen|4|1
Antwerp|Eupen~18.02.2023|Antwerp|Eupen|2|0
Antwerp|Eupen~14.08.2022|Eupen|Antwerp|0|1
Antwerp|Eupen~16.12.2021|Antwerp|Eupen|4|2
Mechelen|RWD Molenbeek~28.01.2024|Mechelen|RWD Molenbeek|3|1
Mechelen|RWD Molenbeek~12.08.2023|RWD Molenbeek|Mechelen|1|0
Eupen|OH Leuven~26.12.2023|OH Leuven|Eupen|3|0
Eupen|OH Leuven~26.08.2023|Eupen|OH Leuven|3|1
Eupen|OH Leuven~17.01.2023|OH Leuven|Eupen|1|1
Eupen|OH Leuven~18.10.2022|Eupen|OH Leuven|4|2
Eupen|OH Leuven~06.03.2022|Eupen|OH Leuven|3|1
RWD Molenbeek|Westerlo~26.12.2023|Westerlo|RWD Molenbeek|3|0
RWD Molenbeek|Westerlo~21.10.2023|RWD Molenbeek|Westerlo|1|1
Eupen|Union SG~23.12.2023|Eupen|Union SG|1|2
Eupen|Union SG~20.10.2023|Union SG|Eupen|4|1
Eupen|Union SG~05.03.2023|Union SG|Eupen|2|1
Eupen|Union SG~18.09.2022|Eupen|Union SG|1|2
Eupen|Union SG~26.02.2022|Union SG|Eupen|0|0
Club Brugge|RWD Molenbeek~22.12.2023|RWD Molenbeek|Club Brugge|1|6
Club Brugge|RWD Molenbeek~20.08.2023|Club Brugge|RWD Molenbeek|7|1
RWD Molenbeek|STVV~16.12.2023|RWD Molenbeek|STVV|3|0
RWD Molenbeek|STVV~27.10.2023|STVV|RWD Molenbeek|2|1
Eupen|Westerlo~15.12.2023|Westerlo|Eupen|2|0
Eupen|Westerlo~29.07.2023|Eupen|Westerlo|2|2
Eupen|Westerlo~04.02.2023|Eupen|Westerlo|1|1
Eupen|Westerlo~28.08.2022|Westerlo|Eupen|0|1
Eupen|Genk~10.12.2023|Eupen|Genk|1|3
Eupen|Genk~05.08.2023|Genk|Eupen|0|1
Eupen|Genk~01.02.2023|Eupen|Genk|1|1
Eupen|Genk~06.08.2022|Genk|Eupen|4|2
Eupen|Genk~03.04.2022|Genk|Eupen|5|0
Gent|RWD Molenbeek~09.12.2023|Gent|RWD Molenbeek|4|0
Gent|RWD Molenbeek~01.10.2023|RWD Molenbeek|Gent|1|1
Gent|Oostende~23.04.2023|Gent|Oostende|1|2
Gent|Oostende~12.08.2022|Oostende|Gent|1|3
Gent|Oostende~25.01.2022|Gent|Oostende|1|1
Gent|Oostende~08.08.2021|Oostende|Gent|1|0
Seraing|Westerlo~22.04.2023|Seraing|Westerlo|1|1
Seraing|Westerlo~14.10.2022|Westerlo|Seraing|2|2
Seraing|Union SG~16.04.2023|Union SG|Seraing|2|1
Seraing|Union SG~30.10.2022|Seraing|Union SG|1|2
Seraing|Union SG~18.01.2022|Seraing|Union SG|0|4
Seraing|Union SG~16.10.2021|Union SG|Seraing|4|2
Eupen|Zulte Waregem~15.04.2023|Eupen|Zulte Waregem|1|5
Eupen|Zulte Waregem~12.11.2022|Zulte Waregem|Eupen|5|5
Eupen|Zulte Waregem~12.03.2022|Zulte Waregem|Eupen|3|0
Eupen|Zulte Waregem~06.11.2021|Eupen|Zulte Waregem|1|1
OH Leuven|Oostende~15.04.2023|Oostende|OH Leuven|0|4
OH Leuven|Oostende~27.08.2022|OH Leuven|Oostende|2|1
OH Leuven|Oostende~05.02.2022|Oostende|OH Leuven|1|3
OH Leuven|Oostende~05.11.2021|OH Leuven|Oostende|1|0
Oostende|STVV~09.04.2023|STVV|Oostende|5|0
Oostende|STVV~20.08.2022|Oostende|STVV|0|1
Oostende|STVV~26.02.2022|Oostende|STVV|0|0
Oostende|STVV~02.10.2021|STVV|Oostende|1|1
Club Brugge|Seraing~07.04.2023|Club Brugge|Seraing|2|0
Club Brugge|Seraing~10.09.2022|Seraing|Club Brugge|0|2
Club Brugge|Seraing~05.03.2022|Seraing|Club Brugge|0|5
Club Brugge|Seraing~04.12.2021|Club Brugge|Seraing|3|2
Gent|Seraing~01.04.2023|Seraing|Gent|0|5
Gent|Seraing~23.10.2022|Gent|Seraing|2|1
Gent|Seraing~23.02.2022|Gent|Seraing|4|0
Gent|Seraing~07.11.2021|Seraing|Gent|0|0
Oostende|Standard~01.04.2023|Oostende|Standard|1|3
Oostende|Standard~03.09.2022|Standard|Oostende|1|0
Oostende|Standard~19.02.2022|Oostende|Standard|1|0
Oostende|Standard~20.08.2021|Standard|Oostende|1|0
Oostende|Westerlo~18.03.2023|Oostende|Westerlo|1|2
Oostende|Westerlo~12.11.2022|Westerlo|Oostende|6|0
STVV|Seraing~18.03.2023|STVV|Seraing|2|1
STVV|Seraing~05.11.2022|Seraing|STVV|1|2
STVV|Seraing~22.01.2022|STVV|Seraing|3|1
STVV|Seraing~27.11.2021|Seraing|STVV|2|0
Eupen|Oostende~11.03.2023|Eupen|Oostende|4|4
Eupen|Oostende~10.09.2022|Oostende|Eupen|1|0
Eupen|Oostende~09.04.2022|Eupen|Oostende|0|2
Eupen|Oostende~04.12.2021|Oostende|Eupen|2|1
Antwerp|Seraing~11.03.2023|Seraing|Antwerp|0|2
Antwerp|Seraing~16.09.2022|Antwerp|Seraing|2|1
Antwerp|Seraing~11.02.2022|Seraing|Antwerp|0|1
Antwerp|Seraing~19.09.2021|Antwerp|Seraing|2|1
Cercle Brugge|Seraing~04.03.2023|Cercle Brugge|Seraing|3|1
Cercle Brugge|Seraing~18.10.2022|Seraing|Cercle Brugge|0|1
Cercle Brugge|Seraing~14.12.2021|Cercle Brugge|Seraing|2|0
Cercle Brugge|Seraing~21.08.2021|Seraing|Cercle Brugge|2|1
Club Brugge|Oostende~03.03.2023|Oostende|Club Brugge|3|0
Club Brugge|Oostende~29.10.2022|Club Brugge|Oostende|4|2
Club Brugge|Oostende~12.03.2022|Oostende|Club Brugge|1|3
Club Brugge|Oostende~10.09.2021|Club Brugge|Oostende|3|0
Mechelen|Seraing~25.02.2023|Seraing|Mechelen|0|2
Mechelen|Seraing~03.09.2022|Mechelen|Seraing|2|3
Mechelen|Seraing~27.12.2021|Mechelen|Seraing|2|0
Mechelen|Seraing~31.07.2021|Seraing|Mechelen|1|0
Genk|Oostende~25.02.2023|Genk|Oostende|3|0
Genk|Oostende~01.10.2022|Oostende|Genk|1|2
Genk|Oostende~26.12.2021|Oostende|Genk|0|4
Genk|Oostende~30.07.2021|Genk|Oostende|3|4
Charleroi|Oostende~18.02.2023|Oostende|Charleroi|0|0
Charleroi|Oostende~06.08.2022|Charleroi|Oostende|1|3
Charleroi|Oostende~10.12.2021|Charleroi|Oostende|1|0
Charleroi|Oostende~24.07.2021|Oostende|Charleroi|0|3
Seraing|Zulte Waregem~18.02.2023|Seraing|Zulte Waregem|1|1
Seraing|Zulte Waregem~23.07.2022|Zulte Waregem|Seraing|2|0
Seraing|Zulte Waregem~27.02.2022|Zulte Waregem|Seraing|1|0
Seraing|Zulte Waregem~03.10.2021|Seraing|Zulte Waregem|5|1
Oostende|Zulte Waregem~12.02.2023|Zulte Waregem|Oostende|1|1
Oostende|Zulte Waregem~23.10.2022|Oostende|Zulte Waregem|2|1
Oostende|Zulte Waregem~09.02.2022|Zulte Waregem|Oostende|0|0
Oostende|Zulte Waregem~29.08.2021|Oostende|Zulte Waregem|0|2
Charleroi|Seraing~11.02.2023|Charleroi|Seraing|3|0
Charleroi|Seraing~13.08.2022|Seraing|Charleroi|0|1
Charleroi|Seraing~04.02.2022|Charleroi|Seraing|2|0
Charleroi|Seraing~22.10.2021|Seraing|Charleroi|1|3
OH Leuven|Seraing~04.02.2023|Seraing|OH Leuven|2|1
OH Leuven|Seraing~11.11.2022|OH Leuven|Seraing|5|0
OH Leuven|Seraing~19.03.2022|Seraing|OH Leuven|1|1
OH Leuven|Seraing~20.11.2021|OH Leuven|Seraing|1|3
Anderlecht|Oostende~03.02.2023|Oostende|Anderlecht|0|2
Anderlecht|Oostende~24.07.2022|Anderlecht|Oostende|2|0
Anderlecht|Oostende~06.03.2022|Anderlecht|Oostende|3|0
Anderlecht|Oostende~26.09.2021|Oostende|Anderlecht|2|2
Genk|Seraing~29.01.2023|Genk|Seraing|4|0
Genk|Seraing~27.08.2022|Seraing|Genk|0|4
Genk|Seraing~10.04.2022|Seraing|Genk|0|2
Genk|Seraing~26.09.2021|Genk|Seraing|3|0
Kortrijk|Oostende~28.01.2023|Kortrijk|Oostende|2|2
Kortrijk|Oostende~06.11.2022|Oostende|Kortrijk|3|1
Kortrijk|Oostende~14.12.2021|Oostende|Kortrijk|0|2
Kortrijk|Oostende~23.10.2021|Kortrijk|Oostende|1|0
Anderlecht|Seraing~22.01.2023|Seraing|Anderlecht|0|1
Anderlecht|Seraing~07.08.2022|Anderlecht|Seraing|3|1
Anderlecht|Seraing~11.12.2021|Seraing|Anderlecht|0|5
Anderlecht|Seraing~08.08.2021|Anderlecht|Seraing|3|0
Cercle Brugge|Oostende~21.01.2023|Oostende|Cercle Brugge|1|2
Cercle Brugge|Oostende~17.09.2022|Cercle Brugge|Oostende|2|2
Cercle Brugge|Oostende~29.01.2022|Cercle Brugge|Oostende|0|1
Cercle Brugge|Oostende~16.10.2021|Oostende|Cercle Brugge|2|1
Antwerp|Oostende~18.01.2023|Oostende|Antwerp|0|3
Antwerp|Oostende~20.10.2022|Antwerp|Oostende|3|0
Antwerp|Oostende~21.01.2022|Oostende|Antwerp|1|2
Antwerp|Oostende~28.11.2021|Antwerp|Oostende|3|0
Kortrijk|Seraing~18.01.2023|Kortrijk|Seraing|3|2
Kortrijk|Seraing~31.07.2022|Seraing|Kortrijk|0|1
Kortrijk|Seraing~17.12.2021|Seraing|Kortrijk|0|2
Kortrijk|Seraing~24.07.2021|Kortrijk|Seraing|2|0
Seraing|Standard~14.01.2023|Seraing|Standard|1|1
Seraing|Standard~30.09.2022|Standard|Seraing|0|2
Seraing|Standard~13.03.2022|Standard|Seraing|0|1
Seraing|Standard~12.09.2021|Seraing|Standard|0|1
Mechelen|Oostende~14.01.2023|Mechelen|Oostende|2|1
Mechelen|Oostende~30.07.2022|Oostende|Mechelen|2|1
Mechelen|Oostende~12.02.2022|Mechelen|Oostende|3|0
Mechelen|Oostende~29.10.2021|Oostende|Mechelen|2|4
Oostende|Seraing~07.01.2023|Oostende|Seraing|1|2
Oostende|Seraing~08.10.2022|Seraing|Oostende|1|1
Oostende|Seraing~02.04.2022|Oostende|Seraing|2|2
Oostende|Seraing~14.08.2021|Seraing|Oostende|2|3
Oostende|Union SG~26.12.2022|Union SG|Oostende|3|0
Oostende|Union SG~16.10.2022|Oostende|Union SG|1|6
Oostende|Union SG~18.03.2022|Union SG|Oostende|1|1
Oostende|Union SG~21.11.2021|Oostende|Union SG|1|7
Eupen|Seraing~23.12.2022|Seraing|Eupen|0|1
Eupen|Seraing~19.08.2022|Eupen|Seraing|1|3
Eupen|Seraing~29.01.2022|Seraing|Eupen|0|0
Eupen|Seraing~28.08.2021|Eupen|Seraing|1|2
Beerschot VA|Zulte Waregem~29.01.2022|Beerschot VA|Zulte Waregem|3|3
Beerschot VA|Zulte Waregem~28.11.2021|Zulte Waregem|Beerschot VA|2|0
Beerschot VA|Seraing~26.01.2022|Seraing|Beerschot VA|2|1
Beerschot VA|Seraing~30.10.2021|Beerschot VA|Seraing|3|0
Beerschot VA|Oostende~18.12.2021|Beerschot VA|Oostende|0|2
Beerschot VA|Oostende~18.09.2021|Oostende|Beerschot VA|3|1
Beerschot VA|Eupen~11.12.2021|Eupen|Beerschot VA|1|0
Beerschot VA|Eupen~25.09.2021|Beerschot VA|Eupen|0|3`;
const NLM={"ERE": {"Willem II|PEC Zwolle": [0.327, 0.25, 0.423], "Fortuna Sittard|Telstar": [0.394, 0.245, 0.361], "ADO Den Haag|Sparta Rotterdam": [0.36, 0.248, 0.392], "Excelsior|Go Ahead Eagles": [0.344, 0.231, 0.425], "Heerenveen|Feyenoord": [0.208, 0.21, 0.582], "Twente|Ajax": [0.419, 0.242, 0.339], "AZ Alkmaar|Groningen": [0.598, 0.212, 0.19], "Cambuur|PSV": [0.109, 0.127, 0.763], "Utrecht|NEC Nijmegen": [0.433, 0.233, 0.334]}, "POR": {"Famalicão|Arouca": [0.478, 0.263, 0.259], "Nacional|Académico Viseu": [0.263, 0.265, 0.472], "Alverca|Casa Pia": [0.472, 0.272, 0.256], "Sporting|Moreirense": [0.803, 0.128, 0.069], "Santa Clara|Gil Vicente": [0.382, 0.311, 0.306], "Estoril|Marítimo": [0.536, 0.227, 0.237], "Guimarães|Porto": [0.172, 0.246, 0.582], "Rio Ave|Braga": [0.192, 0.222, 0.586], "Estrela Amadora|Benfica": [0.091, 0.155, 0.754]}, "BEL": {"Standard|Beveren": [0.491, 0.249, 0.26], "Westerlo|Charleroi": [0.426, 0.237, 0.337], "OH Leuven|Mechelen": [0.388, 0.261, 0.351], "Antwerp|Lommel SK": [0.42, 0.28, 0.3], "La Louvière|Cercle Brugge": [0.36, 0.256, 0.384], "Club Brugge|Anderlecht": [0.623, 0.202, 0.175], "Gent|Kortrijk": [0.696, 0.186, 0.118], "Union SG|Genk": [0.609, 0.222, 0.169], "STVV|Zulte Waregem": [0.52, 0.225, 0.255]}},NLT={"ERE": ["ADO Den Haag", "AZ Alkmaar", "Ajax", "Cambuur", "Excelsior", "Feyenoord", "Fortuna Sittard", "Go Ahead Eagles", "Groningen", "Heerenveen", "NEC Nijmegen", "PEC Zwolle", "PSV", "Sparta Rotterdam", "Telstar", "Twente", "Utrecht", "Willem II"], "POR": ["Académico Viseu", "Alverca", "Arouca", "Benfica", "Braga", "Casa Pia", "Estoril", "Estrela Amadora", "Famalicão", "Gil Vicente", "Guimarães", "Marítimo", "Moreirense", "Nacional", "Porto", "Rio Ave", "Santa Clara", "Sporting"], "BEL": ["Anderlecht", "Antwerp", "Beveren", "Cercle Brugge", "Charleroi", "Club Brugge", "Genk", "Gent", "Kortrijk", "La Louvière", "Lommel SK", "Mechelen", "OH Leuven", "STVV", "Standard", "Union SG", "Westerlo", "Zulte Waregem"]};
GP.ERE={B:{"o15": 0.82, "o25": 0.599, "kg": 0.572, "h1": 0.802, "a1": 0.722, "h2": 0.487}};GP.POR={B:{"o15": 0.733, "o25": 0.512, "kg": 0.491, "h1": 0.748, "a1": 0.68, "h2": 0.415}};GP.BEL={B:{"o15": 0.783, "o25": 0.544, "kg": 0.539, "h1": 0.772, "a1": 0.707, "h2": 0.462}};
['ERE','POR'].forEach(lg=>NLT[lg].forEach(t=>{TM[t]={l:lg,r:0,p:0,w:0,d:0,o:0,f:0,a:0}}));
['ERE','POR','BEL'].forEach(lg=>{const Rw=({ERE:ERER,POR:PORR,BEL:BELR})[lg],Hw=({ERE:EREH,POR:PORH,BEL:BELH})[lg];Rw.split('\n').forEach(l=>{const[h,a,x,y]=l.split('|').map((v,i)=>i<2?v:+v);RES[lg+'|'+h+'|'+a]=x+'-'+y;[[h,a,x,y,1],[a,h,y,x,0]].forEach(([t2,o,f,c,H])=>{const g=SLG[t2]=SLG[t2]||[];g.push({w:g.length+1,H,o,f,c,r:f>c?'G':f==c?'B':'M'})})});Hw.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})})});
const NLF={ERE:`2026-11-06T19:00|Willem II|PEC Zwolle
2026-11-07T15:30|Fortuna Sittard|Telstar
2026-11-07T17:45|ADO Den Haag|Sparta Rotterdam
2026-11-07T20:00|Excelsior|Go Ahead Eagles
2026-11-08T11:15|Heerenveen|Feyenoord
2026-11-08T13:30|Twente|Ajax
2026-11-08T15:45|AZ Alkmaar|Groningen
2026-11-08T15:45|Cambuur|PSV
2026-11-08T19:00|Utrecht|NEC Nijmegen`,POR:`2026-11-06T20:45|Famalicão|Arouca
2026-11-07T15:30|Nacional|Académico Viseu
2026-11-07T18:00|Alverca|Casa Pia
2026-11-07T20:30|Sporting|Moreirense
2026-11-08T15:30|Santa Clara|Gil Vicente
2026-11-08T15:30|Estoril|Marítimo
2026-11-08T18:00|Guimarães|Porto
2026-11-08T20:30|Rio Ave|Braga
2026-11-08T20:30|Estrela Amadora|Benfica`};
['ERE','POR'].forEach(lg=>NLF[lg].split('\n').forEach(l=>{const[t,h,a]=l.split('|'),m={c:lg,t:new Date(t+':00Z'),h,a};slp2(m);R.push(m)}));
/* SCO CSV */N.SCO="İskoçya Ligi";C.SCO="#0e7490";LN.SCO="İskoçya – Premiership";
const SCOR=`Dundee Utd|Rangers|1|1
Falkirk|St Mirren|0|2
Aberdeen|Hearts|2|1
St Johnstone|Kilmarnock|4|3
Hibernian|Motherwell|1|2
Celtic|Dundee|1|0
Dundee|Aberdeen|2|0
St Mirren|St Johnstone|1|0
Kilmarnock|Celtic|1|5
Hearts|Dundee Utd|4|0
Motherwell|Falkirk|0|0
Rangers|Hibernian|1|2
Dundee Utd|Dundee|0|2
Celtic|Falkirk|2|1
Hearts|St Johnstone|2|1
Kilmarnock|Dundee Utd|0|4
Aberdeen|Rangers|0|1
Dundee|Hibernian|1|2
St Mirren|Motherwell|3|3
Celtic|Aberdeen|3|0
Dundee|St Johnstone|1|1
Kilmarnock|St Mirren|0|1
Motherwell|Dundee Utd|3|0
Falkirk|Rangers|1|2
Hibernian|Hearts|1|3
Aberdeen|Kilmarnock|0|0
Dundee Utd|Falkirk|1|1
Rangers|Motherwell|1|0
St Mirren|Celtic|1|2
Hearts|Dundee|2|1
St Johnstone|Hibernian|2|1
Rangers|St Mirren|1|0
St Johnstone|Celtic|0|1
Falkirk|Hearts|2|1
Hibernian|Kilmarnock|0|1
Motherwell|Aberdeen|0|4
Dundee|Motherwell|2|1
Hibernian|Aberdeen|1|1
St Johnstone|Falkirk|1|1
St Mirren|Dundee Utd|0|3
Kilmarnock|Hearts|1|1
Celtic|Rangers|0|1
Dundee Utd|Hibernian|1|0
Falkirk|Dundee|1|2
Hearts|St Mirren|5|0
Rangers|Kilmarnock|3|1
Motherwell|Celtic|0|2
Aberdeen|St Johnstone|0|1
Aberdeen|St Mirren|3|1
Hibernian|Falkirk|1|2
Kilmarnock|Motherwell|3|2
St Johnstone|Dundee Utd|1|1
Dundee|Rangers|2|2
Celtic|Hearts|7|1
Dundee Utd|Aberdeen|3|2
Falkirk|Kilmarnock|3|0
Rangers|St Johnstone|4|0
St Mirren|Dundee|2|1
Hibernian|Celtic|1|2
Motherwell|Hearts|0|2
Aberdeen|Falkirk|0|1
Celtic|Dundee Utd|2|2
Dundee|Kilmarnock|3|1
St Johnstone|Motherwell|2|2
St Mirren|Hibernian|1|1
Hearts|Rangers|2|2
Kilmarnock|St Johnstone|2|2
Motherwell|St Mirren|1|0
Falkirk|Celtic|2|0`,SCOH=`Celtic|Falkirk~01.11.2026|Falkirk|Celtic|2|0
Celtic|Falkirk~29.08.2026|Celtic|Falkirk|2|1
Celtic|Falkirk~25.04.2026|Celtic|Falkirk|3|1
Celtic|Falkirk~01.02.2026|Celtic|Falkirk|2|0
Celtic|Falkirk~14.01.2026|Falkirk|Celtic|0|1
Kilmarnock|St Johnstone~31.10.2026|Kilmarnock|St Johnstone|2|2
Kilmarnock|St Johnstone~02.08.2026|St Johnstone|Kilmarnock|4|3
Kilmarnock|St Johnstone~03.05.2025|St Johnstone|Kilmarnock|0|2
Kilmarnock|St Johnstone~15.02.2025|Kilmarnock|St Johnstone|3|1
Kilmarnock|St Johnstone~23.11.2024|St Johnstone|Kilmarnock|1|0
Motherwell|St Mirren~31.10.2026|Motherwell|St Mirren|1|0
Motherwell|St Mirren~30.08.2026|St Mirren|Motherwell|3|3
Motherwell|St Mirren~21.02.2026|St Mirren|Motherwell|0|5
Motherwell|St Mirren~03.01.2026|Motherwell|St Mirren|2|0
Motherwell|St Mirren~09.08.2025|St Mirren|Motherwell|0|0
Aberdeen|Falkirk~28.10.2026|Aberdeen|Falkirk|0|1
Aberdeen|Falkirk~14.03.2026|Aberdeen|Falkirk|1|1
Aberdeen|Falkirk~03.01.2026|Falkirk|Aberdeen|1|0
Aberdeen|Falkirk~31.08.2025|Aberdeen|Falkirk|0|1
Celtic|Dundee Utd~28.10.2026|Celtic|Dundee Utd|2|2
Celtic|Dundee Utd~22.03.2026|Dundee Utd|Celtic|2|0
Celtic|Dundee Utd~10.01.2026|Celtic|Dundee Utd|4|0
Celtic|Dundee Utd~17.12.2025|Dundee Utd|Celtic|2|1
Celtic|Dundee Utd~26.04.2025|Dundee Utd|Celtic|0|5
Dundee|Kilmarnock~28.10.2026|Dundee|Kilmarnock|3|1
Dundee|Kilmarnock~12.05.2026|Kilmarnock|Dundee|3|1
Dundee|Kilmarnock~11.04.2026|Kilmarnock|Dundee|2|2
Dundee|Kilmarnock~30.12.2025|Dundee|Kilmarnock|2|1
Dundee|Kilmarnock~23.08.2025|Kilmarnock|Dundee|0|0
Motherwell|St Johnstone~28.10.2026|St Johnstone|Motherwell|2|2
Motherwell|St Johnstone~26.04.2025|Motherwell|St Johnstone|3|2
Motherwell|St Johnstone~25.01.2025|St Johnstone|Motherwell|2|1
Motherwell|St Johnstone~09.11.2024|Motherwell|St Johnstone|2|1
Motherwell|St Johnstone~31.08.2024|St Johnstone|Motherwell|1|2
Hibernian|St Mirren~28.10.2026|St Mirren|Hibernian|1|1
Hibernian|St Mirren~14.02.2026|Hibernian|St Mirren|2|0
Hibernian|St Mirren~08.11.2025|St Mirren|Hibernian|0|3
Hibernian|St Mirren~31.08.2025|Hibernian|St Mirren|1|1
Hibernian|St Mirren~14.05.2025|St Mirren|Hibernian|2|2
Hearts|Rangers~28.10.2026|Hearts|Rangers|2|2
Hearts|Rangers~04.05.2026|Hearts|Rangers|2|1
Hearts|Rangers~15.02.2026|Rangers|Hearts|4|2
Hearts|Rangers~21.12.2025|Hearts|Rangers|2|1
Hearts|Rangers~13.09.2025|Rangers|Hearts|0|2
Celtic|Hibernian~25.10.2026|Hibernian|Celtic|1|2
Celtic|Hibernian~03.05.2026|Hibernian|Celtic|1|2
Celtic|Hibernian~22.02.2026|Celtic|Hibernian|1|2
Celtic|Hibernian~30.11.2025|Hibernian|Celtic|1|2
Celtic|Hibernian~27.09.2025|Celtic|Hibernian|0|0
Hearts|Motherwell~25.10.2026|Motherwell|Hearts|0|2
Hearts|Motherwell~09.05.2026|Motherwell|Hearts|1|1
Hearts|Motherwell~11.04.2026|Hearts|Motherwell|3|1
Hearts|Motherwell~29.11.2025|Motherwell|Hearts|0|0
Hearts|Motherwell~23.08.2025|Hearts|Motherwell|3|3
Aberdeen|Dundee Utd~24.10.2026|Dundee Utd|Aberdeen|3|2
Aberdeen|Dundee Utd~09.05.2026|Aberdeen|Dundee Utd|2|0
Aberdeen|Dundee Utd~24.02.2026|Dundee Utd|Aberdeen|0|0
Aberdeen|Dundee Utd~27.12.2025|Aberdeen|Dundee Utd|1|1
Aberdeen|Dundee Utd~23.09.2025|Dundee Utd|Aberdeen|2|0
Falkirk|Kilmarnock~24.10.2026|Falkirk|Kilmarnock|3|0
Falkirk|Kilmarnock~28.02.2026|Falkirk|Kilmarnock|5|1
Falkirk|Kilmarnock~20.12.2025|Kilmarnock|Falkirk|0|1
Falkirk|Kilmarnock~01.11.2025|Falkirk|Kilmarnock|3|1
Rangers|St Johnstone~24.10.2026|Rangers|St Johnstone|4|0
Rangers|St Johnstone~12.01.2025|Rangers|St Johnstone|3|1
Rangers|St Johnstone~01.12.2024|St Johnstone|Rangers|0|1
Rangers|St Johnstone~06.10.2024|Rangers|St Johnstone|2|0
Rangers|St Johnstone~18.02.2024|St Johnstone|Rangers|0|3
Dundee|St Mirren~24.10.2026|St Mirren|Dundee|2|1
Dundee|St Mirren~02.05.2026|Dundee|St Mirren|1|0
Dundee|St Mirren~31.01.2026|St Mirren|Dundee|0|0
Dundee|St Mirren~29.11.2025|Dundee|St Mirren|3|1
Dundee|St Mirren~27.09.2025|St Mirren|Dundee|1|0
Celtic|Hearts~18.10.2026|Celtic|Hearts|7|1
Celtic|Hearts~16.05.2026|Celtic|Hearts|3|1
Celtic|Hearts~25.01.2026|Hearts|Celtic|2|2
Celtic|Hearts~07.12.2025|Celtic|Hearts|1|2
Celtic|Hearts~26.10.2025|Hearts|Celtic|3|1
Aberdeen|St Mirren~17.10.2026|Aberdeen|St Mirren|3|1
Aberdeen|St Mirren~12.05.2026|Aberdeen|St Mirren|0|2
Aberdeen|St Mirren~04.04.2026|St Mirren|Aberdeen|2|0
Aberdeen|St Mirren~03.12.2025|Aberdeen|St Mirren|3|3
Aberdeen|St Mirren~18.10.2025|St Mirren|Aberdeen|0|1
Falkirk|Hibernian~17.10.2026|Hibernian|Falkirk|1|2
Falkirk|Hibernian~09.05.2026|Falkirk|Hibernian|1|3
Falkirk|Hibernian~24.01.2026|Falkirk|Hibernian|4|1
Falkirk|Hibernian~06.12.2025|Hibernian|Falkirk|3|0
Falkirk|Hibernian~23.09.2025|Falkirk|Hibernian|2|2
Kilmarnock|Motherwell~17.10.2026|Kilmarnock|Motherwell|3|2
Kilmarnock|Motherwell~24.01.2026|Motherwell|Kilmarnock|4|0
Kilmarnock|Motherwell~22.11.2025|Kilmarnock|Motherwell|1|3
Kilmarnock|Motherwell~30.08.2025|Motherwell|Kilmarnock|2|2
Kilmarnock|Motherwell~14.05.2025|Motherwell|Kilmarnock|3|0
Dundee Utd|St Johnstone~17.10.2026|St Johnstone|Dundee Utd|1|1
Dundee Utd|St Johnstone~12.04.2025|Dundee Utd|St Johnstone|1|0
Dundee Utd|St Johnstone~26.12.2024|St Johnstone|Dundee Utd|1|2
Dundee Utd|St Johnstone~24.08.2024|Dundee Utd|St Johnstone|2|0
Dundee Utd|St Johnstone~06.05.2023|St Johnstone|Dundee Utd|1|0
Dundee|Rangers~17.10.2026|Dundee|Rangers|2|2
Dundee|Rangers~25.01.2026|Rangers|Dundee|3|0
Dundee|Rangers~09.11.2025|Dundee|Rangers|0|3
Dundee|Rangers~09.08.2025|Rangers|Dundee|1|1
Dundee|Rangers~29.03.2025|Dundee|Rangers|3|4
Celtic|Motherwell~11.10.2026|Motherwell|Celtic|0|2
Celtic|Motherwell~13.05.2026|Motherwell|Celtic|2|3
Celtic|Motherwell~14.03.2026|Celtic|Motherwell|3|1
Celtic|Motherwell~30.12.2025|Motherwell|Celtic|2|0
Celtic|Motherwell~05.10.2025|Celtic|Motherwell|3|2
Aberdeen|St Johnstone~11.10.2026|Aberdeen|St Johnstone|0|1
Aberdeen|St Johnstone~15.03.2025|St Johnstone|Aberdeen|0|0
Aberdeen|St Johnstone~07.12.2024|Aberdeen|St Johnstone|1|1
Aberdeen|St Johnstone~05.08.2024|St Johnstone|Aberdeen|1|2
Aberdeen|St Johnstone~04.05.2024|Aberdeen|St Johnstone|1|0
Dundee Utd|Hibernian~10.10.2026|Dundee Utd|Hibernian|1|0
Dundee Utd|Hibernian~04.02.2026|Hibernian|Dundee Utd|3|2
Dundee Utd|Hibernian~20.12.2025|Dundee Utd|Hibernian|1|1
Dundee Utd|Hibernian~13.09.2025|Hibernian|Dundee Utd|3|3
Dundee Utd|Hibernian~03.05.2025|Hibernian|Dundee Utd|3|1
Dundee|Falkirk~10.10.2026|Falkirk|Dundee|1|2
Dundee|Falkirk~11.02.2026|Falkirk|Dundee|1|0
Dundee|Falkirk~27.12.2025|Dundee|Falkirk|1|0
Dundee|Falkirk~25.10.2025|Falkirk|Dundee|2|1
Hearts|St Mirren~10.10.2026|Hearts|St Mirren|5|0
Hearts|St Mirren~03.02.2026|St Mirren|Hearts|1|0
Hearts|St Mirren~14.01.2026|Hearts|St Mirren|2|0
Hearts|St Mirren~29.10.2025|St Mirren|Hearts|2|2
Hearts|St Mirren~26.02.2025|Hearts|St Mirren|3|1
Kilmarnock|Rangers~10.10.2026|Rangers|Kilmarnock|3|1
Kilmarnock|Rangers~04.02.2026|Rangers|Kilmarnock|5|1
Kilmarnock|Rangers~06.12.2025|Kilmarnock|Rangers|0|3
Kilmarnock|Rangers~26.10.2025|Rangers|Kilmarnock|3|1
Kilmarnock|Rangers~26.02.2025|Kilmarnock|Rangers|2|4
Celtic|Rangers~20.09.2026|Celtic|Rangers|0|1
Celtic|Rangers~10.05.2026|Celtic|Rangers|3|1
Celtic|Rangers~01.03.2026|Rangers|Celtic|2|2
Celtic|Rangers~03.01.2026|Celtic|Rangers|1|3
Celtic|Rangers~31.08.2025|Rangers|Celtic|0|0
Dundee|Motherwell~19.09.2026|Dundee|Motherwell|2|1
Dundee|Motherwell~07.03.2026|Dundee|Motherwell|2|1
Dundee|Motherwell~20.12.2025|Motherwell|Dundee|1|0
Dundee|Motherwell~13.09.2025|Dundee|Motherwell|1|1
Dundee|Motherwell~03.05.2025|Dundee|Motherwell|1|2
Aberdeen|Hibernian~19.09.2026|Hibernian|Aberdeen|1|1
Aberdeen|Hibernian~11.04.2026|Aberdeen|Hibernian|2|0
Aberdeen|Hibernian~30.12.2025|Hibernian|Aberdeen|2|0
Aberdeen|Hibernian~26.10.2025|Aberdeen|Hibernian|1|2
Aberdeen|Hibernian~26.04.2025|Aberdeen|Hibernian|1|0
Falkirk|St Johnstone~19.09.2026|St Johnstone|Falkirk|1|1
Dundee Utd|St Mirren~19.09.2026|St Mirren|Dundee Utd|0|3
Dundee Utd|St Mirren~17.05.2026|St Mirren|Dundee Utd|1|1
Dundee Utd|St Mirren~03.03.2026|Dundee Utd|St Mirren|2|1
Dundee Utd|St Mirren~06.12.2025|St Mirren|Dundee Utd|2|0
Dundee Utd|St Mirren~25.10.2025|Dundee Utd|St Mirren|3|1
Hearts|Kilmarnock~19.09.2026|Kilmarnock|Hearts|1|1
Hearts|Kilmarnock~14.03.2026|Kilmarnock|Hearts|1|0
Hearts|Kilmarnock~03.12.2025|Hearts|Kilmarnock|1|1
Hearts|Kilmarnock~18.10.2025|Kilmarnock|Hearts|0|3
Hearts|Kilmarnock~18.05.2025|Kilmarnock|Hearts|0|1
Falkirk|Hearts~15.09.2026|Falkirk|Hearts|2|1
Falkirk|Hearts~13.05.2026|Hearts|Falkirk|3|0
Falkirk|Hearts~21.02.2026|Hearts|Falkirk|1|0
Falkirk|Hearts~13.12.2025|Falkirk|Hearts|0|2
Falkirk|Hearts~27.09.2025|Hearts|Falkirk|3|0
Hibernian|Kilmarnock~15.09.2026|Hibernian|Kilmarnock|0|1
Hibernian|Kilmarnock~04.04.2026|Hibernian|Kilmarnock|3|0
Hibernian|Kilmarnock~03.01.2026|Kilmarnock|Hibernian|1|3
Hibernian|Kilmarnock~10.08.2025|Hibernian|Kilmarnock|2|2
Hibernian|Kilmarnock~15.03.2025|Kilmarnock|Hibernian|1|1
Aberdeen|Motherwell~15.09.2026|Motherwell|Aberdeen|0|4
Aberdeen|Motherwell~15.02.2026|Motherwell|Aberdeen|2|0
Aberdeen|Motherwell~09.11.2025|Aberdeen|Motherwell|1|1
Aberdeen|Motherwell~27.09.2025|Motherwell|Aberdeen|2|0
Aberdeen|Motherwell~29.03.2025|Aberdeen|Motherwell|4|1
Rangers|St Mirren~09.09.2026|Rangers|St Mirren|1|0
Rangers|St Mirren~15.03.2026|St Mirren|Rangers|0|1
Rangers|St Mirren~30.12.2025|Rangers|St Mirren|2|1
Rangers|St Mirren~24.08.2025|St Mirren|Rangers|1|1
Rangers|St Mirren~26.04.2025|St Mirren|Rangers|2|2
Celtic|St Johnstone~09.09.2026|St Johnstone|Celtic|0|1
Celtic|St Johnstone~06.04.2025|St Johnstone|Celtic|1|0
Celtic|St Johnstone~29.12.2024|Celtic|St Johnstone|4|0
Celtic|St Johnstone~28.09.2024|St Johnstone|Celtic|0|6
Celtic|St Johnstone~16.03.2024|Celtic|St Johnstone|3|1
Dundee|Hearts~06.09.2026|Hearts|Dundee|2|1
Dundee|Hearts~21.03.2026|Hearts|Dundee|1|0
Dundee|Hearts~11.01.2026|Dundee|Hearts|0|1
Dundee|Hearts~01.11.2025|Hearts|Dundee|4|0
Dundee|Hearts~26.04.2025|Hearts|Dundee|0|1
Hibernian|St Johnstone~06.09.2026|St Johnstone|Hibernian|2|1
Hibernian|St Johnstone~29.03.2025|Hibernian|St Johnstone|3|0
Hibernian|St Johnstone~02.01.2025|St Johnstone|Hibernian|1|1
Hibernian|St Johnstone~14.09.2024|Hibernian|St Johnstone|2|0
Hibernian|St Johnstone~27.04.2024|St Johnstone|Hibernian|1|3
Aberdeen|Kilmarnock~05.09.2026|Aberdeen|Kilmarnock|0|0
Aberdeen|Kilmarnock~25.04.2026|Aberdeen|Kilmarnock|1|0
Aberdeen|Kilmarnock~31.01.2026|Kilmarnock|Aberdeen|3|0
Aberdeen|Kilmarnock~14.12.2025|Aberdeen|Kilmarnock|2|1
Aberdeen|Kilmarnock~29.10.2025|Kilmarnock|Aberdeen|0|1
Dundee Utd|Falkirk~05.09.2026|Dundee Utd|Falkirk|1|1
Dundee Utd|Falkirk~14.02.2026|Falkirk|Dundee Utd|2|3
Dundee Utd|Falkirk~22.11.2025|Dundee Utd|Falkirk|0|3
Dundee Utd|Falkirk~03.08.2025|Falkirk|Dundee Utd|2|2
Motherwell|Rangers~05.09.2026|Rangers|Motherwell|1|0
Motherwell|Rangers~26.04.2026|Rangers|Motherwell|2|3
Motherwell|Rangers~11.02.2026|Motherwell|Rangers|1|1
Motherwell|Rangers~27.12.2025|Rangers|Motherwell|1|0
Motherwell|Rangers~02.08.2025|Motherwell|Rangers|1|1
Celtic|St Mirren~05.09.2026|St Mirren|Celtic|1|2
Celtic|St Mirren~11.04.2026|Celtic|St Mirren|1|0
Celtic|St Mirren~22.11.2025|St Mirren|Celtic|0|1
Celtic|St Mirren~03.08.2025|Celtic|St Mirren|1|0
Celtic|St Mirren~17.05.2025|Celtic|St Mirren|1|1
Hearts|Hibernian~03.09.2026|Hibernian|Hearts|1|3
Hearts|Hibernian~26.04.2026|Hibernian|Hearts|1|2
Hearts|Hibernian~10.02.2026|Hearts|Hibernian|1|0
Hearts|Hibernian~27.12.2025|Hibernian|Hearts|3|2
Hearts|Hibernian~04.10.2025|Hearts|Hibernian|1|0
Aberdeen|Celtic~02.09.2026|Celtic|Aberdeen|3|0
Aberdeen|Celtic~04.03.2026|Aberdeen|Celtic|1|2
Aberdeen|Celtic~21.12.2025|Celtic|Aberdeen|3|1
Aberdeen|Celtic~10.08.2025|Aberdeen|Celtic|0|2
Aberdeen|Celtic~14.05.2025|Aberdeen|Celtic|1|5
Dundee|St Johnstone~02.09.2026|Dundee|St Johnstone|1|1
Dundee|St Johnstone~18.05.2025|St Johnstone|Dundee|0|2
Dundee|St Johnstone~01.03.2025|Dundee|St Johnstone|1|1
Dundee|St Johnstone~05.01.2025|St Johnstone|Dundee|1|3
Dundee|St Johnstone~26.10.2024|Dundee|St Johnstone|1|2
Kilmarnock|St Mirren~02.09.2026|Kilmarnock|St Mirren|0|1
Kilmarnock|St Mirren~09.05.2026|St Mirren|Kilmarnock|0|3
Kilmarnock|St Mirren~11.02.2026|Kilmarnock|St Mirren|4|3
Kilmarnock|St Mirren~27.12.2025|St Mirren|Kilmarnock|0|0
Kilmarnock|St Mirren~04.10.2025|Kilmarnock|St Mirren|2|0
Dundee Utd|Motherwell~02.09.2026|Motherwell|Dundee Utd|3|0
Dundee Utd|Motherwell~28.02.2026|Motherwell|Dundee Utd|2|0
Dundee Utd|Motherwell~13.12.2025|Dundee Utd|Motherwell|0|0
Dundee Utd|Motherwell~29.10.2025|Motherwell|Dundee Utd|2|0
Dundee Utd|Motherwell~22.02.2025|Dundee Utd|Motherwell|1|0
Falkirk|Rangers~02.09.2026|Falkirk|Rangers|1|2
Falkirk|Rangers~16.05.2026|Falkirk|Rangers|2|5
Falkirk|Rangers~12.04.2026|Falkirk|Rangers|3|6
Falkirk|Rangers~30.11.2025|Rangers|Falkirk|0|0
Falkirk|Rangers~05.10.2025|Falkirk|Rangers|1|1
Aberdeen|Rangers~30.08.2026|Aberdeen|Rangers|0|1
Aberdeen|Rangers~21.03.2026|Rangers|Aberdeen|4|1
Aberdeen|Rangers~11.01.2026|Aberdeen|Rangers|0|2
Aberdeen|Rangers~06.01.2026|Rangers|Aberdeen|2|0
Aberdeen|Rangers~11.05.2025|Rangers|Aberdeen|4|0
Dundee|Hibernian~30.08.2026|Dundee|Hibernian|1|2
Dundee|Hibernian~28.02.2026|Dundee|Hibernian|3|3
Dundee|Hibernian~22.11.2025|Hibernian|Dundee|2|0
Dundee|Hibernian~03.08.2025|Dundee|Hibernian|1|2
Dundee|Hibernian~13.04.2025|Hibernian|Dundee|4|0
Hearts|St Johnstone~29.08.2026|Hearts|St Johnstone|2|1
Hearts|St Johnstone~14.05.2025|Hearts|St Johnstone|2|1
Hearts|St Johnstone~23.02.2025|St Johnstone|Hearts|1|2
Hearts|St Johnstone~22.12.2024|Hearts|St Johnstone|2|1
Hearts|St Johnstone~02.11.2024|St Johnstone|Hearts|1|2
Dundee Utd|Kilmarnock~29.08.2026|Kilmarnock|Dundee Utd|0|4
Dundee Utd|Kilmarnock~02.05.2026|Kilmarnock|Dundee Utd|3|0
Dundee Utd|Kilmarnock~21.02.2026|Dundee Utd|Kilmarnock|1|1
Dundee Utd|Kilmarnock~29.11.2025|Kilmarnock|Dundee Utd|1|1
Dundee Utd|Kilmarnock~27.09.2025|Dundee Utd|Kilmarnock|0|2
Dundee|Dundee Utd~22.08.2026|Dundee Utd|Dundee|0|2
Dundee|Dundee Utd~26.04.2026|Dundee Utd|Dundee|3|0
Dundee|Dundee Utd~15.03.2026|Dundee|Dundee Utd|2|2
Dundee|Dundee Utd~03.01.2026|Dundee Utd|Dundee|0|1
Dundee|Dundee Utd~31.08.2025|Dundee|Dundee Utd|0|2
Celtic|Kilmarnock~09.08.2026|Kilmarnock|Celtic|1|5
Celtic|Kilmarnock~15.02.2026|Kilmarnock|Celtic|2|3
Celtic|Kilmarnock~09.11.2025|Celtic|Kilmarnock|4|0
Celtic|Kilmarnock~14.09.2025|Kilmarnock|Celtic|1|2
Celtic|Kilmarnock~12.04.2025|Celtic|Kilmarnock|5|1
Dundee Utd|Hearts~09.08.2026|Hearts|Dundee Utd|4|0
Dundee Utd|Hearts~31.01.2026|Dundee Utd|Hearts|0|3
Dundee Utd|Hearts~09.11.2025|Hearts|Dundee Utd|1|1
Dundee Utd|Hearts~10.08.2025|Dundee Utd|Hearts|2|3
Dundee Utd|Hearts~06.04.2025|Hearts|Dundee Utd|0|1
Falkirk|Motherwell~09.08.2026|Motherwell|Falkirk|0|0
Falkirk|Motherwell~02.05.2026|Falkirk|Motherwell|1|0
Falkirk|Motherwell~04.04.2026|Motherwell|Falkirk|2|3
Falkirk|Motherwell~03.12.2025|Falkirk|Motherwell|0|0
Falkirk|Motherwell~18.10.2025|Motherwell|Falkirk|1|2
Hibernian|Rangers~09.08.2026|Rangers|Hibernian|1|2
Hibernian|Rangers~13.05.2026|Rangers|Hibernian|1|2
Hibernian|Rangers~01.02.2026|Hibernian|Rangers|0|0
Hibernian|Rangers~15.12.2025|Rangers|Hibernian|1|0
Hibernian|Rangers~29.10.2025|Hibernian|Rangers|0|1
Aberdeen|Dundee~08.08.2026|Dundee|Aberdeen|2|0
Aberdeen|Dundee~17.05.2026|Dundee|Aberdeen|3|2
Aberdeen|Dundee~21.02.2026|Aberdeen|Dundee|2|3
Aberdeen|Dundee~06.12.2025|Dundee|Aberdeen|1|3
Aberdeen|Dundee~05.10.2025|Aberdeen|Dundee|4|0
St Johnstone|St Mirren~08.08.2026|St Mirren|St Johnstone|1|0
St Johnstone|St Mirren~01.02.2025|St Mirren|St Johnstone|0|1
St Johnstone|St Mirren~14.12.2024|St Johnstone|St Mirren|2|3
St Johnstone|St Mirren~30.10.2024|St Mirren|St Johnstone|3|1
St Johnstone|St Mirren~24.02.2024|St Mirren|St Johnstone|2|0
Celtic|Dundee~03.08.2026|Celtic|Dundee|1|0
Celtic|Dundee~05.04.2026|Dundee|Celtic|1|2
Celtic|Dundee~03.12.2025|Celtic|Dundee|1|0
Celtic|Dundee~19.10.2025|Dundee|Celtic|2|0
Celtic|Dundee~05.02.2025|Celtic|Dundee|6|0
Hibernian|Motherwell~02.08.2026|Hibernian|Motherwell|1|2
Hibernian|Motherwell~16.05.2026|Hibernian|Motherwell|0|1
Hibernian|Motherwell~21.03.2026|Motherwell|Hibernian|0|0
Hibernian|Motherwell~10.01.2026|Hibernian|Motherwell|1|1
Hibernian|Motherwell~25.11.2025|Motherwell|Hibernian|2|0
Falkirk|St Mirren~01.08.2026|Falkirk|St Mirren|0|2
Falkirk|St Mirren~21.03.2026|Falkirk|St Mirren|1|2
Falkirk|St Mirren~10.01.2026|St Mirren|Falkirk|0|2
Falkirk|St Mirren~13.09.2025|Falkirk|St Mirren|1|2
Aberdeen|Hearts~01.08.2026|Aberdeen|Hearts|2|1
Aberdeen|Hearts~28.02.2026|Hearts|Aberdeen|1|0
Aberdeen|Hearts~23.11.2025|Aberdeen|Hearts|1|0
Aberdeen|Hearts~04.08.2025|Hearts|Aberdeen|2|0
Aberdeen|Hearts~12.01.2025|Aberdeen|Hearts|0|0
Dundee Utd|Rangers~31.07.2026|Dundee Utd|Rangers|1|1
Dundee Utd|Rangers~04.04.2026|Rangers|Dundee Utd|4|2
Dundee Utd|Rangers~03.12.2025|Dundee Utd|Rangers|2|2
Dundee Utd|Rangers~18.10.2025|Rangers|Dundee Utd|2|2
Dundee Utd|Rangers~14.05.2025|Rangers|Dundee Utd|3|1
Kilmarnock|Livingston~17.05.2026|Livingston|Kilmarnock|1|4
Kilmarnock|Livingston~21.03.2026|Kilmarnock|Livingston|2|0
Kilmarnock|Livingston~10.01.2026|Livingston|Kilmarnock|1|1
Kilmarnock|Livingston~02.08.2025|Kilmarnock|Livingston|2|2
Kilmarnock|Livingston~07.02.2024|Kilmarnock|Livingston|1|0
Dundee Utd|Livingston~12.05.2026|Dundee Utd|Livingston|0|0
Dundee Utd|Livingston~11.04.2026|Dundee Utd|Livingston|3|2
Dundee Utd|Livingston~30.12.2025|Livingston|Dundee Utd|1|3
Dundee Utd|Livingston~04.10.2025|Dundee Utd|Livingston|1|1
Dundee Utd|Livingston~20.05.2023|Livingston|Dundee Utd|2|1
Dundee|Livingston~09.05.2026|Dundee|Livingston|3|0
Dundee|Livingston~14.02.2026|Dundee|Livingston|2|2
Dundee|Livingston~13.12.2025|Livingston|Dundee|2|2
Dundee|Livingston~20.09.2025|Dundee|Livingston|3|2
Dundee|Livingston~27.01.2024|Livingston|Dundee|1|4
Aberdeen|Livingston~01.05.2026|Livingston|Aberdeen|2|2
Aberdeen|Livingston~24.01.2026|Aberdeen|Livingston|6|2
Aberdeen|Livingston~30.11.2025|Livingston|Aberdeen|0|1
Aberdeen|Livingston~13.09.2025|Aberdeen|Livingston|0|0
Aberdeen|Livingston~15.05.2024|Aberdeen|Livingston|5|1
Livingston|St Mirren~25.04.2026|St Mirren|Livingston|0|2
Livingston|St Mirren~28.02.2026|Livingston|St Mirren|1|1
Livingston|St Mirren~20.01.2026|Livingston|St Mirren|1|1
Livingston|St Mirren~20.12.2025|St Mirren|Livingston|1|0
Livingston|St Mirren~17.02.2024|Livingston|St Mirren|1|0
Hearts|Livingston~05.04.2026|Livingston|Hearts|2|2
Hearts|Livingston~03.01.2026|Hearts|Livingston|1|0
Hearts|Livingston~30.08.2025|Livingston|Hearts|1|2
Hearts|Livingston~13.04.2024|Hearts|Livingston|4|2
Hearts|Livingston~02.01.2024|Livingston|Hearts|1|2
Hibernian|Livingston~14.03.2026|Hibernian|Livingston|0|0
Hibernian|Livingston~01.11.2025|Livingston|Hibernian|2|2
Hibernian|Livingston~18.10.2025|Hibernian|Livingston|4|0
Hibernian|Livingston~19.05.2024|Livingston|Hibernian|1|1
Hibernian|Livingston~16.03.2024|Hibernian|Livingston|3|0
Livingston|Rangers~22.02.2026|Livingston|Rangers|2|2
Livingston|Rangers~22.11.2025|Rangers|Livingston|2|1
Livingston|Rangers~28.09.2025|Livingston|Rangers|1|2
Livingston|Rangers~03.02.2024|Rangers|Livingston|3|0
Livingston|Rangers~12.11.2023|Livingston|Rangers|0|2
Celtic|Livingston~11.02.2026|Celtic|Livingston|2|1
Celtic|Livingston~27.12.2025|Livingston|Celtic|2|4
Celtic|Livingston~23.08.2025|Celtic|Livingston|3|0
Celtic|Livingston~31.03.2024|Livingston|Celtic|0|3
Celtic|Livingston~23.12.2023|Celtic|Livingston|2|0
Falkirk|Livingston~04.02.2026|Livingston|Falkirk|1|2
Falkirk|Livingston~08.11.2025|Falkirk|Livingston|1|1
Falkirk|Livingston~09.08.2025|Livingston|Falkirk|3|1
Livingston|Motherwell~31.01.2026|Livingston|Motherwell|0|2
Livingston|Motherwell~06.12.2025|Motherwell|Livingston|3|0
Livingston|Motherwell~25.10.2025|Livingston|Motherwell|1|2
Livingston|Motherwell~04.05.2024|Motherwell|Livingston|4|1
Livingston|Motherwell~28.02.2024|Livingston|Motherwell|1|3
Motherwell|Ross County~18.05.2025|Ross County|Motherwell|1|1
Motherwell|Ross County~15.02.2025|Motherwell|Ross County|0|3
Motherwell|Ross County~23.11.2024|Ross County|Motherwell|2|1
Motherwell|Ross County~03.08.2024|Motherwell|Ross County|0|0
Motherwell|Ross County~11.05.2024|Ross County|Motherwell|1|5
Dundee|Ross County~14.05.2025|Dundee|Ross County|1|1
Dundee|Ross County~22.02.2025|Ross County|Dundee|3|1
Dundee|Ross County~26.12.2024|Dundee|Ross County|0|3
Dundee|Ross County~14.09.2024|Ross County|Dundee|2|0
Dundee|Ross County~17.02.2024|Dundee|Ross County|2|0
Ross County|St Johnstone~10.05.2025|St Johnstone|Ross County|2|1
Ross County|St Johnstone~26.02.2025|St Johnstone|Ross County|1|0
Ross County|St Johnstone~19.10.2024|St Johnstone|Ross County|3|0
Ross County|St Johnstone~21.09.2024|Ross County|St Johnstone|3|3
Ross County|St Johnstone~15.05.2024|St Johnstone|Ross County|1|1
Hearts|Ross County~03.05.2025|Ross County|Hearts|1|3
Hearts|Ross County~15.03.2025|Hearts|Ross County|2|0
Hearts|Ross County~29.12.2024|Ross County|Hearts|2|2
Hearts|Ross County~28.09.2024|Hearts|Ross County|1|1
Hearts|Ross County~16.03.2024|Ross County|Hearts|2|1
Kilmarnock|Ross County~26.04.2025|Kilmarnock|Ross County|2|0
Kilmarnock|Ross County~01.03.2025|Ross County|Kilmarnock|1|0
Kilmarnock|Ross County~05.01.2025|Kilmarnock|Ross County|0|1
Kilmarnock|Ross County~26.10.2024|Ross County|Kilmarnock|2|1
Kilmarnock|Ross County~06.04.2024|Kilmarnock|Ross County|1|0
Ross County|St Mirren~12.04.2025|St Mirren|Ross County|3|2
Ross County|St Mirren~21.12.2024|Ross County|St Mirren|1|2
Ross County|St Mirren~02.11.2024|St Mirren|Ross County|0|0
Ross County|St Mirren~27.02.2024|Ross County|St Mirren|1|1
Ross County|St Mirren~09.12.2023|St Mirren|Ross County|2|0
Aberdeen|Ross County~05.04.2025|Ross County|Aberdeen|0|1
Aberdeen|Ross County~02.01.2025|Aberdeen|Ross County|1|2
Aberdeen|Ross County~31.08.2024|Ross County|Aberdeen|0|1
Aberdeen|Ross County~19.05.2024|Ross County|Aberdeen|2|2
Aberdeen|Ross County~30.03.2024|Aberdeen|Ross County|2|1
Dundee Utd|Ross County~30.03.2025|Ross County|Dundee Utd|0|1
Dundee Utd|Ross County~09.11.2024|Dundee Utd|Ross County|3|0
Dundee Utd|Ross County~10.08.2024|Ross County|Dundee Utd|1|1
Dundee Utd|Ross County~13.05.2023|Dundee Utd|Ross County|1|3
Dundee Utd|Ross County~25.02.2023|Ross County|Dundee Utd|4|0
Rangers|Ross County~02.02.2025|Rangers|Ross County|4|0
Rangers|Ross County~08.12.2024|Ross County|Rangers|0|3
Rangers|Ross County~24.08.2024|Rangers|Ross County|6|0
Rangers|Ross County~14.04.2024|Ross County|Rangers|3|2
Rangers|Ross County~14.02.2024|Rangers|Ross County|3|1
Hibernian|Ross County~25.01.2025|Ross County|Hibernian|1|1
Hibernian|Ross County~14.12.2024|Hibernian|Ross County|3|1
Hibernian|Ross County~30.10.2024|Ross County|Hibernian|0|0
Hibernian|Ross County~04.05.2024|Ross County|Hibernian|2|1
Hibernian|Ross County~13.03.2024|Ross County|Hibernian|2|2
Celtic|Ross County~11.01.2025|Ross County|Celtic|1|4
Celtic|Ross County~30.11.2024|Celtic|Ross County|5|0
Celtic|Ross County~06.10.2024|Ross County|Celtic|1|2
Celtic|Ross County~27.01.2024|Celtic|Ross County|1|0
Celtic|Ross County~04.11.2023|Ross County|Celtic|0|3
Livingston|St Johnstone~11.05.2024|Livingston|St Johnstone|2|1
Livingston|St Johnstone~02.03.2024|St Johnstone|Livingston|1|1
Livingston|St Johnstone~27.12.2023|Livingston|St Johnstone|0|0
Livingston|St Johnstone~30.09.2023|St Johnstone|Livingston|1|1
Livingston|St Johnstone~28.05.2023|St Johnstone|Livingston|2|0
Livingston|Ross County~27.04.2024|Livingston|Ross County|2|0
Livingston|Ross County~24.02.2024|Ross County|Livingston|3|2
Livingston|Ross County~30.01.2024|Livingston|Ross County|2|2
Livingston|Ross County~16.09.2023|Ross County|Livingston|1|1
Livingston|Ross County~06.05.2023|Ross County|Livingston|2|0`,SCOM={"St Johnstone|Dundee": [0.387, 0.264, 0.349], "Dundee Utd|Motherwell": [0.393, 0.261, 0.346], "Aberdeen|Hibernian": [0.365, 0.269, 0.366], "St Mirren|Rangers": [0.18, 0.222, 0.598], "Hearts|Falkirk": [0.567, 0.231, 0.203], "Celtic|Kilmarnock": [0.851, 0.098, 0.05]};
GP.SCO={B:{"o15": 0.772, "o25": 0.539, "kg": 0.511, "h1": 0.785, "a1": 0.668, "h2": 0.466}};
const SCOT=["Aberdeen", "Celtic", "Dundee", "Dundee Utd", "Falkirk", "Hearts", "Hibernian", "Kilmarnock", "Motherwell", "Rangers", "St Johnstone", "St Mirren"],SCOF=`2026-11-07T15:00|St Johnstone|Dundee
2026-11-07T15:00|Dundee Utd|Motherwell
2026-11-07T17:45|Aberdeen|Hibernian
2026-11-07T20:00|St Mirren|Rangers
2026-11-08T15:00|Hearts|Falkirk
2026-11-08T16:00|Celtic|Kilmarnock`;
SCOT.forEach(t=>{TM[t]={l:'SCO',r:0,p:0,w:0,d:0,o:0,f:0,a:0}});
SCOR.split('\n').forEach(l=>{const[h,a,x,y]=l.split('|').map((v,i)=>i<2?v:+v);RES['SCO|'+h+'|'+a]=x+'-'+y;[[h,a,x,y,1],[a,h,y,x,0]].forEach(([t2,o,f,c,H])=>{const g=SLG[t2]=SLG[t2]||[];g.push({w:g.length+1,H,o,f,c,r:f>c?'G':f==c?'B':'M'})})});
SCOH.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
SCOF.split('\n').forEach(l=>{const[t,h,a]=l.split('|'),m={c:'SCO',t:new Date(t+':00Z'),h,a};slp2(m);R.push(m)});
/* H2H CSV: PL LL SA BL */
const PLHH=`Leeds|Sunderland~25.10.2026|Sunderland|Leeds|0|0
Leeds|Sunderland~03.03.2026|Leeds|Sunderland|0|1
Leeds|Sunderland~28.12.2025|Sunderland|Leeds|1|1
Bournemouth|Man United~25.10.2026|Man United|Bournemouth|0|3
Bournemouth|Man United~20.03.2026|Bournemouth|Man United|2|2
Bournemouth|Man United~15.12.2025|Man United|Bournemouth|4|4
Bournemouth|Man United~27.04.2025|Bournemouth|Man United|1|1
Bournemouth|Man United~22.12.2024|Man United|Bournemouth|0|3
Brighton|Liverpool~25.10.2026|Liverpool|Brighton|2|0
Brighton|Liverpool~21.03.2026|Brighton|Liverpool|2|1
Brighton|Liverpool~13.12.2025|Liverpool|Brighton|2|0
Brighton|Liverpool~19.05.2025|Brighton|Liverpool|3|2
Brighton|Liverpool~02.11.2024|Liverpool|Brighton|2|1
Brentford|Hull~25.10.2026|Hull|Brentford|1|1
C. Palace|Newcastle~25.10.2026|C. Palace|Newcastle|0|2
C. Palace|Newcastle~12.04.2026|C. Palace|Newcastle|2|1
C. Palace|Newcastle~04.01.2026|Newcastle|C. Palace|2|0
C. Palace|Newcastle~16.04.2025|Newcastle|C. Palace|5|0
C. Palace|Newcastle~30.11.2024|C. Palace|Newcastle|1|1
Coventry|Fulham~24.10.2026|Coventry|Fulham|0|1
Chelsea|Tottenham~24.10.2026|Chelsea|Tottenham|0|2
Chelsea|Tottenham~19.05.2026|Chelsea|Tottenham|2|1
Chelsea|Tottenham~01.11.2025|Tottenham|Chelsea|0|1
Chelsea|Tottenham~03.04.2025|Chelsea|Tottenham|1|0
Chelsea|Tottenham~08.12.2024|Tottenham|Chelsea|3|4
Aston Villa|Man City~24.10.2026|Aston Villa|Man City|2|1
Aston Villa|Man City~24.05.2026|Man City|Aston Villa|1|2
Aston Villa|Man City~26.10.2025|Aston Villa|Man City|1|0
Aston Villa|Man City~22.04.2025|Man City|Aston Villa|2|1
Aston Villa|Man City~21.12.2024|Aston Villa|Man City|2|1
Arsenal|Everton~24.10.2026|Arsenal|Everton|2|0
Arsenal|Everton~14.03.2026|Arsenal|Everton|2|0
Arsenal|Everton~20.12.2025|Everton|Arsenal|0|1
Arsenal|Everton~05.04.2025|Everton|Arsenal|1|1
Arsenal|Everton~14.12.2024|Arsenal|Everton|0|0
Ipswich|N. Forest~23.10.2026|Ipswich|N. Forest|1|1
Ipswich|N. Forest~15.03.2025|Ipswich|N. Forest|2|4
Ipswich|N. Forest~30.11.2024|N. Forest|Ipswich|1|0
Coventry|Tottenham~19.10.2026|Tottenham|Coventry|3|1
Arsenal|N. Forest~18.10.2026|N. Forest|Arsenal|0|1
Arsenal|N. Forest~17.01.2026|N. Forest|Arsenal|0|0
Arsenal|N. Forest~13.09.2025|Arsenal|N. Forest|3|0
Arsenal|N. Forest~26.02.2025|N. Forest|Arsenal|0|0
Arsenal|N. Forest~23.11.2024|Arsenal|N. Forest|3|0
Leeds|Man United~18.10.2026|Leeds|Man United|1|1
Leeds|Man United~13.04.2026|Man United|Leeds|1|2
Leeds|Man United~04.01.2026|Leeds|Man United|1|1
Leeds|Man United~12.02.2023|Leeds|Man United|0|2
Leeds|Man United~08.02.2023|Man United|Leeds|2|2
Brighton|C. Palace~18.10.2026|Brighton|C. Palace|5|0
Brighton|C. Palace~08.02.2026|Brighton|C. Palace|0|1
Brighton|C. Palace~09.11.2025|C. Palace|Brighton|0|0
Brighton|C. Palace~05.04.2025|C. Palace|Brighton|2|1
Brighton|C. Palace~15.12.2024|Brighton|C. Palace|1|3
Bournemouth|Sunderland~18.10.2026|Bournemouth|Sunderland|2|0
Bournemouth|Sunderland~28.02.2026|Bournemouth|Sunderland|1|1
Bournemouth|Sunderland~29.11.2025|Sunderland|Bournemouth|3|2
Aston Villa|Newcastle~17.10.2026|Newcastle|Aston Villa|0|1
Aston Villa|Newcastle~25.01.2026|Newcastle|Aston Villa|0|2
Aston Villa|Newcastle~16.08.2025|Aston Villa|Newcastle|0|0
Aston Villa|Newcastle~19.04.2025|Aston Villa|Newcastle|4|1
Aston Villa|Newcastle~26.12.2024|Newcastle|Aston Villa|3|0
Ipswich|Man City~17.10.2026|Man City|Ipswich|3|2
Ipswich|Man City~19.01.2025|Ipswich|Man City|0|6
Ipswich|Man City~24.08.2024|Man City|Ipswich|4|1
Fulham|Hull~17.10.2026|Fulham|Hull|1|0
Chelsea|Everton~17.10.2026|Everton|Chelsea|0|2
Chelsea|Everton~21.03.2026|Everton|Chelsea|3|0
Chelsea|Everton~13.12.2025|Chelsea|Everton|2|0
Chelsea|Everton~26.04.2025|Chelsea|Everton|1|0
Chelsea|Everton~22.12.2024|Everton|Chelsea|0|0
Brentford|Liverpool~17.10.2026|Brentford|Liverpool|1|2
Brentford|Liverpool~24.05.2026|Liverpool|Brentford|1|1
Brentford|Liverpool~25.10.2025|Brentford|Liverpool|3|2
Brentford|Liverpool~18.01.2025|Brentford|Liverpool|0|2
Brentford|Liverpool~25.08.2024|Liverpool|Brentford|2|0
Coventry|Newcastle~12.10.2026|Coventry|Newcastle|4|1
Liverpool|Man City~11.10.2026|Liverpool|Man City|0|3
Liverpool|Man City~08.02.2026|Liverpool|Man City|1|2
Liverpool|Man City~09.11.2025|Man City|Liverpool|3|0
Liverpool|Man City~23.02.2025|Man City|Liverpool|0|2
Liverpool|Man City~01.12.2024|Liverpool|Man City|2|0
Everton|Hull~11.10.2026|Hull|Everton|2|2
C. Palace|N. Forest~11.10.2026|C. Palace|N. Forest|3|1
C. Palace|N. Forest~01.02.2026|N. Forest|C. Palace|1|1
C. Palace|N. Forest~24.08.2025|C. Palace|N. Forest|1|1
C. Palace|N. Forest~05.05.2025|C. Palace|N. Forest|1|1
C. Palace|N. Forest~21.10.2024|N. Forest|C. Palace|1|0
Brighton|Sunderland~10.10.2026|Sunderland|Brighton|0|2
Brighton|Sunderland~14.03.2026|Sunderland|Brighton|0|1
Brighton|Sunderland~20.12.2025|Brighton|Sunderland|0|0
Man United|Tottenham~10.10.2026|Man United|Tottenham|1|1
Man United|Tottenham~07.02.2026|Man United|Tottenham|2|0
Man United|Tottenham~08.11.2025|Tottenham|Man United|2|2
Man United|Tottenham~16.02.2025|Tottenham|Man United|1|0
Man United|Tottenham~29.09.2024|Man United|Tottenham|0|3
Fulham|Ipswich~10.10.2026|Ipswich|Fulham|2|1
Fulham|Ipswich~05.01.2025|Fulham|Ipswich|2|2
Fulham|Ipswich~31.08.2024|Ipswich|Fulham|1|1
Bournemouth|Chelsea~10.10.2026|Chelsea|Bournemouth|5|1
Bournemouth|Chelsea~30.12.2025|Chelsea|Bournemouth|2|2
Bournemouth|Chelsea~06.12.2025|Bournemouth|Chelsea|0|0
Bournemouth|Chelsea~14.01.2025|Chelsea|Bournemouth|2|2
Bournemouth|Chelsea~14.09.2024|Bournemouth|Chelsea|0|1
Aston Villa|Brentford~10.10.2026|Aston Villa|Brentford|2|2
Aston Villa|Brentford~01.02.2026|Aston Villa|Brentford|0|1
Aston Villa|Brentford~23.08.2025|Brentford|Aston Villa|1|0
Aston Villa|Brentford~08.03.2025|Brentford|Aston Villa|0|1
Aston Villa|Brentford~04.12.2024|Aston Villa|Brentford|3|1
Arsenal|Leeds~10.10.2026|Arsenal|Leeds|2|1
Arsenal|Leeds~31.01.2026|Leeds|Arsenal|0|4
Arsenal|Leeds~23.08.2025|Arsenal|Leeds|5|0
Arsenal|Leeds~01.04.2023|Arsenal|Leeds|4|1
Arsenal|Leeds~16.10.2022|Leeds|Arsenal|0|1
Man City|Sunderland~20.09.2026|Man City|Sunderland|5|3
Man City|Sunderland~01.01.2026|Sunderland|Man City|0|0
Man City|Sunderland~06.12.2025|Man City|Sunderland|3|0
C. Palace|Leeds~20.09.2026|Leeds|C. Palace|0|0
C. Palace|Leeds~15.03.2026|C. Palace|Leeds|0|0
C. Palace|Leeds~20.12.2025|Leeds|C. Palace|4|1
C. Palace|Leeds~09.04.2023|Leeds|C. Palace|1|5
C. Palace|Leeds~09.10.2022|C. Palace|Leeds|2|1
Fulham|Man United~20.09.2026|Fulham|Man United|1|1
Fulham|Man United~01.02.2026|Man United|Fulham|3|2
Fulham|Man United~24.08.2025|Fulham|Man United|1|1
Fulham|Man United~26.01.2025|Fulham|Man United|0|1
Fulham|Man United~16.08.2024|Man United|Fulham|1|0
Bournemouth|Liverpool~20.09.2026|Bournemouth|Liverpool|0|1
Bournemouth|Liverpool~24.01.2026|Bournemouth|Liverpool|3|2
Bournemouth|Liverpool~15.08.2025|Liverpool|Bournemouth|4|2
Bournemouth|Liverpool~01.02.2025|Bournemouth|Liverpool|0|2
Bournemouth|Liverpool~21.09.2024|Liverpool|Bournemouth|3|0
Aston Villa|Tottenham~19.09.2026|Tottenham|Aston Villa|2|3
Aston Villa|Tottenham~03.05.2026|Aston Villa|Tottenham|1|2
Aston Villa|Tottenham~19.10.2025|Tottenham|Aston Villa|1|2
Aston Villa|Tottenham~16.05.2025|Aston Villa|Tottenham|2|0
Aston Villa|Tottenham~03.11.2024|Tottenham|Aston Villa|4|1
Hull|Newcastle~19.09.2026|Newcastle|Hull|2|1
Coventry|N. Forest~19.09.2026|N. Forest|Coventry|0|1
Everton|Ipswich~19.09.2026|Everton|Ipswich|1|0
Everton|Ipswich~03.05.2025|Everton|Ipswich|2|2
Everton|Ipswich~19.10.2024|Ipswich|Everton|0|2
Arsenal|Brighton~19.09.2026|Brighton|Arsenal|3|0
Arsenal|Brighton~04.03.2026|Brighton|Arsenal|0|1
Arsenal|Brighton~27.12.2025|Arsenal|Brighton|2|1
Arsenal|Brighton~04.01.2025|Brighton|Arsenal|1|1
Arsenal|Brighton~31.08.2024|Arsenal|Brighton|1|1
Brentford|Chelsea~18.09.2026|Brentford|Chelsea|3|0
Brentford|Chelsea~17.01.2026|Chelsea|Brentford|2|0
Brentford|Chelsea~13.09.2025|Brentford|Chelsea|2|2
Brentford|Chelsea~06.04.2025|Brentford|Chelsea|0|0
Brentford|Chelsea~15.12.2024|Chelsea|Brentford|2|1
Leeds|Newcastle~14.09.2026|Leeds|Newcastle|4|1
Leeds|Newcastle~07.01.2026|Newcastle|Leeds|4|3
Leeds|Newcastle~30.08.2025|Leeds|Newcastle|0|0
Leeds|Newcastle~13.05.2023|Leeds|Newcastle|2|2
Leeds|Newcastle~31.12.2022|Newcastle|Leeds|0|0
Man City|Man United~13.09.2026|Man United|Man City|0|1
Man City|Man United~17.01.2026|Man United|Man City|2|0
Man City|Man United~14.09.2025|Man City|Man United|3|0
Man City|Man United~06.04.2025|Man United|Man City|0|0
Man City|Man United~15.12.2024|Man City|Man United|1|2
Brighton|Coventry~13.09.2026|Coventry|Brighton|0|5
Everton|Tottenham~12.09.2026|Tottenham|Everton|0|0
Everton|Tottenham~24.05.2026|Tottenham|Everton|1|0
Everton|Tottenham~26.10.2025|Everton|Tottenham|0|3
Everton|Tottenham~19.01.2025|Everton|Tottenham|3|2
Everton|Tottenham~24.08.2024|Tottenham|Everton|4|0
Arsenal|Sunderland~12.09.2026|Sunderland|Arsenal|0|2
Arsenal|Sunderland~07.02.2026|Arsenal|Sunderland|3|0
Arsenal|Sunderland~08.11.2025|Sunderland|Arsenal|2|2
Fulham|Liverpool~12.09.2026|Liverpool|Fulham|0|0
Fulham|Liverpool~11.04.2026|Liverpool|Fulham|2|0
Fulham|Liverpool~04.01.2026|Fulham|Liverpool|2|2
Fulham|Liverpool~06.04.2025|Fulham|Liverpool|3|2
Fulham|Liverpool~14.12.2024|Liverpool|Fulham|2|2
Chelsea|Hull~12.09.2026|Chelsea|Hull|2|2
C. Palace|Ipswich~12.09.2026|C. Palace|Ipswich|2|3
C. Palace|Ipswich~08.03.2025|C. Palace|Ipswich|1|0
C. Palace|Ipswich~03.12.2024|Ipswich|C. Palace|0|1
Bournemouth|Brentford~12.09.2026|Bournemouth|Brentford|2|2
Bournemouth|Brentford~03.03.2026|Bournemouth|Brentford|0|0
Bournemouth|Brentford~27.12.2025|Brentford|Bournemouth|4|1
Bournemouth|Brentford~15.03.2025|Bournemouth|Brentford|1|2
Bournemouth|Brentford~09.11.2024|Brentford|Bournemouth|3|2
Aston Villa|N. Forest~12.09.2026|Aston Villa|N. Forest|1|2
Aston Villa|N. Forest~12.04.2026|N. Forest|Aston Villa|1|1
Aston Villa|N. Forest~03.01.2026|Aston Villa|N. Forest|3|1
Aston Villa|N. Forest~05.04.2025|Aston Villa|N. Forest|2|1
Aston Villa|N. Forest~14.12.2024|N. Forest|Aston Villa|2|1
Everton|Man United~06.09.2026|Everton|Man United|2|2
Everton|Man United~23.02.2026|Everton|Man United|0|1
Everton|Man United~24.11.2025|Man United|Everton|0|1
Everton|Man United~22.02.2025|Everton|Man United|2|2
Everton|Man United~01.12.2024|Man United|Everton|4|0
Arsenal|Chelsea~06.09.2026|Arsenal|Chelsea|2|1
Arsenal|Chelsea~01.03.2026|Arsenal|Chelsea|2|1
Arsenal|Chelsea~30.11.2025|Chelsea|Arsenal|1|1
Arsenal|Chelsea~16.03.2025|Arsenal|Chelsea|1|0
Arsenal|Chelsea~10.11.2024|Chelsea|Arsenal|1|1
Bournemouth|Newcastle~05.09.2026|Newcastle|Bournemouth|2|2
Bournemouth|Newcastle~18.04.2026|Newcastle|Bournemouth|1|2
Bournemouth|Newcastle~21.09.2025|Bournemouth|Newcastle|0|0
Bournemouth|Newcastle~18.01.2025|Newcastle|Bournemouth|1|4
Bournemouth|Newcastle~25.08.2024|Bournemouth|Newcastle|1|1
N. Forest|Tottenham~05.09.2026|N. Forest|Tottenham|0|0
N. Forest|Tottenham~22.03.2026|Tottenham|N. Forest|0|3
N. Forest|Tottenham~14.12.2025|N. Forest|Tottenham|3|0
N. Forest|Tottenham~21.04.2025|Tottenham|N. Forest|1|2
N. Forest|Tottenham~26.12.2024|N. Forest|Tottenham|1|0
Coventry|Man City~05.09.2026|Man City|Coventry|1|0
Aston Villa|Hull~05.09.2026|Hull|Aston Villa|0|0
C. Palace|Fulham~05.09.2026|Fulham|C. Palace|2|3
C. Palace|Fulham~01.01.2026|C. Palace|Fulham|1|1
C. Palace|Fulham~07.12.2025|Fulham|C. Palace|1|2
C. Palace|Fulham~22.02.2025|Fulham|C. Palace|0|2
C. Palace|Fulham~09.11.2024|C. Palace|Fulham|0|2
Brighton|Leeds~05.09.2026|Brighton|Leeds|1|1
Brighton|Leeds~17.05.2026|Leeds|Brighton|1|0
Brighton|Leeds~01.11.2025|Brighton|Leeds|3|0
Brighton|Leeds~11.03.2023|Leeds|Brighton|2|2
Brighton|Leeds~27.08.2022|Brighton|Leeds|1|0
Brentford|Sunderland~05.09.2026|Brentford|Sunderland|1|1
Brentford|Sunderland~07.01.2026|Brentford|Sunderland|3|0
Brentford|Sunderland~30.08.2025|Sunderland|Brentford|2|1
Ipswich|Liverpool~04.09.2026|Ipswich|Liverpool|0|2
Ipswich|Liverpool~25.01.2025|Liverpool|Ipswich|4|1
Ipswich|Liverpool~17.08.2024|Ipswich|Liverpool|0|2
Arsenal|Aston Villa~31.08.2026|Aston Villa|Arsenal|0|1
Arsenal|Aston Villa~30.12.2025|Arsenal|Aston Villa|4|1
Arsenal|Aston Villa~06.12.2025|Aston Villa|Arsenal|2|1
Arsenal|Aston Villa~18.01.2025|Arsenal|Aston Villa|2|2
Arsenal|Aston Villa~24.08.2024|Aston Villa|Arsenal|0|2
Fulham|Sunderland~30.08.2026|Sunderland|Fulham|1|0
Fulham|Sunderland~22.02.2026|Sunderland|Fulham|1|3
Fulham|Sunderland~22.11.2025|Fulham|Sunderland|1|0
Ipswich|Man United~30.08.2026|Man United|Ipswich|5|2
Ipswich|Man United~26.02.2025|Man United|Ipswich|3|2
Ipswich|Man United~24.11.2024|Ipswich|Man United|1|1
Brentford|Leeds~30.08.2026|Leeds|Brentford|1|1
Brentford|Leeds~21.03.2026|Leeds|Brentford|0|0
Brentford|Leeds~14.12.2025|Brentford|Leeds|1|1
Brentford|Leeds~22.01.2023|Leeds|Brentford|0|0
Brentford|Leeds~03.09.2022|Brentford|Leeds|5|2
Brighton|Chelsea~30.08.2026|Chelsea|Brighton|4|3
Brighton|Chelsea~21.04.2026|Brighton|Chelsea|3|0
Brighton|Chelsea~27.09.2025|Chelsea|Brighton|1|3
Brighton|Chelsea~14.02.2025|Brighton|Chelsea|3|0
Brighton|Chelsea~28.09.2024|Chelsea|Brighton|4|2
Newcastle|Tottenham~29.08.2026|Tottenham|Newcastle|0|2
Newcastle|Tottenham~10.02.2026|Tottenham|Newcastle|1|2
Newcastle|Tottenham~02.12.2025|Newcastle|Tottenham|2|2
Newcastle|Tottenham~04.01.2025|Tottenham|Newcastle|1|2
Newcastle|Tottenham~01.09.2024|Newcastle|Tottenham|2|1
Liverpool|N. Forest~29.08.2026|Liverpool|N. Forest|2|2
Liverpool|N. Forest~22.02.2026|N. Forest|Liverpool|0|1
Liverpool|N. Forest~22.11.2025|Liverpool|N. Forest|0|3
Liverpool|N. Forest~14.01.2025|N. Forest|Liverpool|1|1
Liverpool|N. Forest~14.09.2024|Liverpool|N. Forest|0|1
Coventry|Hull~29.08.2026|Coventry|Hull|0|1
Bournemouth|Everton~29.08.2026|Bournemouth|Everton|1|1
Bournemouth|Everton~10.02.2026|Everton|Bournemouth|1|2
Bournemouth|Everton~02.12.2025|Bournemouth|Everton|0|1
Bournemouth|Everton~04.01.2025|Bournemouth|Everton|1|0
Bournemouth|Everton~31.08.2024|Everton|Bournemouth|2|3
C. Palace|Man City~28.08.2026|C. Palace|Man City|1|4
C. Palace|Man City~13.05.2026|Man City|C. Palace|3|0
C. Palace|Man City~14.12.2025|C. Palace|Man City|0|3
C. Palace|Man City~12.04.2025|Man City|C. Palace|5|2
C. Palace|Man City~07.12.2024|C. Palace|Man City|2|2
Chelsea|Fulham~24.08.2026|Fulham|Chelsea|2|3
Chelsea|Fulham~07.01.2026|Fulham|Chelsea|2|1
Chelsea|Fulham~30.08.2025|Chelsea|Fulham|2|0
Chelsea|Fulham~20.04.2025|Fulham|Chelsea|1|2
Chelsea|Fulham~26.12.2024|Chelsea|Fulham|1|2
Liverpool|Newcastle~23.08.2026|Newcastle|Liverpool|2|2
Liverpool|Newcastle~31.01.2026|Liverpool|Newcastle|4|1
Liverpool|Newcastle~25.08.2025|Newcastle|Liverpool|2|3
Liverpool|Newcastle~26.02.2025|Liverpool|Newcastle|2|0
Liverpool|Newcastle~04.12.2024|Newcastle|Liverpool|3|3
Bournemouth|Man City~23.08.2026|Man City|Bournemouth|2|1
Bournemouth|Man City~19.05.2026|Bournemouth|Man City|1|1
Bournemouth|Man City~02.11.2025|Man City|Bournemouth|3|1
Bournemouth|Man City~20.05.2025|Man City|Bournemouth|3|1
Bournemouth|Man City~02.11.2024|Bournemouth|Man City|2|1
Aston Villa|Brighton~23.08.2026|Brighton|Aston Villa|4|0
Aston Villa|Brighton~11.02.2026|Aston Villa|Brighton|1|0
Aston Villa|Brighton~03.12.2025|Brighton|Aston Villa|3|4
Aston Villa|Brighton~02.04.2025|Brighton|Aston Villa|0|3
Aston Villa|Brighton~30.12.2024|Aston Villa|Brighton|2|2
Leeds|N. Forest~22.08.2026|N. Forest|Leeds|0|1
Leeds|N. Forest~06.02.2026|Leeds|N. Forest|3|1
Leeds|N. Forest~09.11.2025|N. Forest|Leeds|3|1
Leeds|N. Forest~04.04.2023|Leeds|N. Forest|2|1
Leeds|N. Forest~05.02.2023|N. Forest|Leeds|1|0
Ipswich|Sunderland~22.08.2026|Ipswich|Sunderland|2|1
Hull|Man United~22.08.2026|Hull|Man United|2|0
C. Palace|Everton~22.08.2026|Everton|C. Palace|2|0
C. Palace|Everton~10.05.2026|C. Palace|Everton|2|2
C. Palace|Everton~05.10.2025|Everton|C. Palace|2|1
C. Palace|Everton~15.02.2025|C. Palace|Everton|1|2
C. Palace|Everton~28.09.2024|Everton|C. Palace|2|1
Brentford|Tottenham~22.08.2026|Brentford|Tottenham|3|0
Brentford|Tottenham~01.01.2026|Brentford|Tottenham|0|0
Brentford|Tottenham~06.12.2025|Tottenham|Brentford|2|0
Brentford|Tottenham~02.02.2025|Brentford|Tottenham|0|2
Brentford|Tottenham~21.09.2024|Tottenham|Brentford|3|1
Arsenal|Coventry~21.08.2026|Arsenal|Coventry|3|0
Chelsea|Sunderland~24.05.2026|Sunderland|Chelsea|2|1
Chelsea|Sunderland~25.10.2025|Chelsea|Sunderland|1|2
Bournemouth|N. Forest~24.05.2026|N. Forest|Bournemouth|1|1
Bournemouth|N. Forest~26.10.2025|Bournemouth|N. Forest|2|0
Bournemouth|N. Forest~25.01.2025|Bournemouth|N. Forest|5|0
Bournemouth|N. Forest~17.08.2024|N. Forest|Bournemouth|1|1
Bournemouth|N. Forest~04.02.2024|Bournemouth|N. Forest|1|1
Fulham|Newcastle~24.05.2026|Fulham|Newcastle|2|0
Fulham|Newcastle~25.10.2025|Newcastle|Fulham|2|1
Fulham|Newcastle~01.02.2025|Newcastle|Fulham|1|2
Fulham|Newcastle~21.09.2024|Fulham|Newcastle|3|1
Fulham|Newcastle~06.04.2024|Fulham|Newcastle|0|1
Arsenal|C. Palace~24.05.2026|C. Palace|Arsenal|1|2
Arsenal|C. Palace~26.10.2025|Arsenal|C. Palace|1|0
Arsenal|C. Palace~23.04.2025|Arsenal|C. Palace|2|2
Arsenal|C. Palace~21.12.2024|C. Palace|Arsenal|1|5
Arsenal|C. Palace~20.01.2024|Arsenal|C. Palace|5|0
Brighton|Man United~24.05.2026|Brighton|Man United|0|3
Brighton|Man United~25.10.2025|Man United|Brighton|4|2
Brighton|Man United~19.01.2025|Man United|Brighton|1|3
Brighton|Man United~24.08.2024|Brighton|Man United|2|1
Brighton|Man United~19.05.2024|Brighton|Man United|0|2
Man United|N. Forest~17.05.2026|Man United|N. Forest|3|2
Man United|N. Forest~01.11.2025|N. Forest|Man United|2|2
Man United|N. Forest~01.04.2025|N. Forest|Man United|1|0
Man United|N. Forest~07.12.2024|Man United|N. Forest|2|3
Man United|N. Forest~30.12.2023|N. Forest|Man United|2|1
Everton|Sunderland~17.05.2026|Everton|Sunderland|1|3
Everton|Sunderland~03.11.2025|Sunderland|Everton|1|1
Brentford|C. Palace~17.05.2026|Brentford|C. Palace|2|2
Brentford|C. Palace~01.11.2025|C. Palace|Brentford|2|0
Brentford|C. Palace~26.01.2025|C. Palace|Brentford|1|2
Brentford|C. Palace~18.08.2024|Brentford|C. Palace|2|1
Brentford|C. Palace~30.12.2023|C. Palace|Brentford|3|1
Aston Villa|Liverpool~15.05.2026|Aston Villa|Liverpool|4|2
Aston Villa|Liverpool~01.11.2025|Liverpool|Aston Villa|2|0
Aston Villa|Liverpool~19.02.2025|Aston Villa|Liverpool|2|2
Aston Villa|Liverpool~09.11.2024|Liverpool|Aston Villa|2|0
Aston Villa|Liverpool~13.05.2024|Aston Villa|Liverpool|3|3
Leeds|Tottenham~11.05.2026|Tottenham|Leeds|1|1
Leeds|Tottenham~04.10.2025|Leeds|Tottenham|1|2
Leeds|Tottenham~28.05.2023|Leeds|Tottenham|1|4
Leeds|Tottenham~12.11.2022|Tottenham|Leeds|4|3
Leeds|Tottenham~26.02.2022|Leeds|Tottenham|0|4
N. Forest|Newcastle~10.05.2026|N. Forest|Newcastle|1|1
N. Forest|Newcastle~05.10.2025|Newcastle|N. Forest|2|0
N. Forest|Newcastle~23.02.2025|Newcastle|N. Forest|4|3
N. Forest|Newcastle~10.11.2024|N. Forest|Newcastle|1|3
N. Forest|Newcastle~10.02.2024|N. Forest|Newcastle|2|3
Man United|Sunderland~09.05.2026|Sunderland|Man United|0|0
Man United|Sunderland~04.10.2025|Man United|Sunderland|2|0
Brentford|Man City~09.05.2026|Man City|Brentford|3|0
Brentford|Man City~05.10.2025|Brentford|Man City|0|1
Brentford|Man City~14.01.2025|Brentford|Man City|2|2
Brentford|Man City~14.09.2024|Man City|Brentford|2|1
Brentford|Man City~20.02.2024|Man City|Brentford|1|0
Chelsea|Liverpool~09.05.2026|Liverpool|Chelsea|1|1
Chelsea|Liverpool~04.10.2025|Chelsea|Liverpool|2|1
Chelsea|Liverpool~04.05.2025|Chelsea|Liverpool|3|1
Chelsea|Liverpool~20.10.2024|Liverpool|Chelsea|2|1
Chelsea|Liverpool~31.01.2024|Liverpool|Chelsea|4|1
Bournemouth|Fulham~09.05.2026|Fulham|Bournemouth|0|1
Bournemouth|Fulham~03.10.2025|Bournemouth|Fulham|3|1
Bournemouth|Fulham~14.04.2025|Bournemouth|Fulham|1|0
Bournemouth|Fulham~29.12.2024|Fulham|Bournemouth|2|2
Bournemouth|Fulham~10.02.2024|Fulham|Bournemouth|3|1
Everton|Man City~04.05.2026|Everton|Man City|3|3
Everton|Man City~18.10.2025|Man City|Everton|2|0
Everton|Man City~19.04.2025|Everton|Man City|0|2
Everton|Man City~26.12.2024|Man City|Everton|1|1
Everton|Man City~10.02.2024|Man City|Everton|2|0
Chelsea|N. Forest~04.05.2026|Chelsea|N. Forest|1|3
Chelsea|N. Forest~18.10.2025|N. Forest|Chelsea|0|3
Chelsea|N. Forest~25.05.2025|N. Forest|Chelsea|0|1
Chelsea|N. Forest~06.10.2024|Chelsea|N. Forest|1|1
Chelsea|N. Forest~11.05.2024|N. Forest|Chelsea|2|3
Liverpool|Man United~03.05.2026|Man United|Liverpool|3|2
Liverpool|Man United~19.10.2025|Liverpool|Man United|1|2
Liverpool|Man United~05.01.2025|Liverpool|Man United|2|2
Liverpool|Man United~01.09.2024|Man United|Liverpool|0|3
Liverpool|Man United~07.04.2024|Man United|Liverpool|2|2
Bournemouth|C. Palace~03.05.2026|Bournemouth|C. Palace|3|0
Bournemouth|C. Palace~18.10.2025|C. Palace|Bournemouth|3|3
Bournemouth|C. Palace~19.04.2025|C. Palace|Bournemouth|0|0
Bournemouth|C. Palace~26.12.2024|Bournemouth|C. Palace|0|0
Bournemouth|C. Palace~02.04.2024|Bournemouth|C. Palace|1|0
Brighton|Newcastle~02.05.2026|Newcastle|Brighton|3|1
Brighton|Newcastle~18.10.2025|Brighton|Newcastle|2|1
Brighton|Newcastle~04.05.2025|Brighton|Newcastle|1|1
Brighton|Newcastle~19.10.2024|Newcastle|Brighton|0|1
Brighton|Newcastle~11.05.2024|Newcastle|Brighton|1|1
Arsenal|Fulham~02.05.2026|Arsenal|Fulham|3|0
Arsenal|Fulham~18.10.2025|Fulham|Arsenal|0|1
Arsenal|Fulham~01.04.2025|Arsenal|Fulham|2|1
Arsenal|Fulham~08.12.2024|Fulham|Arsenal|1|1
Arsenal|Fulham~31.12.2023|Fulham|Arsenal|2|1
Brentford|Man United~27.04.2026|Man United|Brentford|2|1
Brentford|Man United~27.09.2025|Brentford|Man United|3|1
Brentford|Man United~04.05.2025|Brentford|Man United|4|3
Brentford|Man United~19.10.2024|Man United|Brentford|2|1
Brentford|Man United~30.03.2024|Brentford|Man United|1|1
C. Palace|Liverpool~25.04.2026|Liverpool|C. Palace|3|1
C. Palace|Liverpool~27.09.2025|C. Palace|Liverpool|2|1
C. Palace|Liverpool~25.05.2025|Liverpool|C. Palace|1|1
C. Palace|Liverpool~05.10.2024|C. Palace|Liverpool|0|1
C. Palace|Liverpool~14.04.2024|Liverpool|C. Palace|0|1
Aston Villa|Fulham~25.04.2026|Fulham|Aston Villa|1|0
Aston Villa|Fulham~28.09.2025|Aston Villa|Fulham|3|1
Aston Villa|Fulham~03.05.2025|Aston Villa|Fulham|1|0
Aston Villa|Fulham~19.10.2024|Fulham|Aston Villa|1|3
Aston Villa|Fulham~17.02.2024|Fulham|Aston Villa|1|2
Arsenal|Newcastle~25.04.2026|Arsenal|Newcastle|1|0
Arsenal|Newcastle~28.09.2025|Newcastle|Arsenal|1|2
Arsenal|Newcastle~18.05.2025|Arsenal|Newcastle|1|0
Arsenal|Newcastle~02.11.2024|Newcastle|Arsenal|1|0
Arsenal|Newcastle~24.02.2024|Arsenal|Newcastle|4|1
N. Forest|Sunderland~24.04.2026|Sunderland|N. Forest|0|5
N. Forest|Sunderland~27.09.2025|N. Forest|Sunderland|0|1
Bournemouth|Leeds~22.04.2026|Bournemouth|Leeds|2|2
Bournemouth|Leeds~27.09.2025|Leeds|Bournemouth|2|2
Bournemouth|Leeds~30.04.2023|Bournemouth|Leeds|4|1
Bournemouth|Leeds~05.11.2022|Leeds|Bournemouth|4|3
Arsenal|Man City~19.04.2026|Man City|Arsenal|2|1
Arsenal|Man City~21.09.2025|Arsenal|Man City|1|1
Arsenal|Man City~02.02.2025|Arsenal|Man City|5|1
Arsenal|Man City~22.09.2024|Man City|Arsenal|2|2
Arsenal|Man City~31.03.2024|Man City|Arsenal|0|0
Everton|Liverpool~19.04.2026|Everton|Liverpool|1|2
Everton|Liverpool~20.09.2025|Liverpool|Everton|2|1
Everton|Liverpool~02.04.2025|Liverpool|Everton|1|0
Everton|Liverpool~12.02.2025|Everton|Liverpool|2|2
Everton|Liverpool~24.04.2024|Everton|Liverpool|2|0
Aston Villa|Sunderland~19.04.2026|Aston Villa|Sunderland|4|3
Aston Villa|Sunderland~21.09.2025|Sunderland|Aston Villa|1|1
Brighton|Tottenham~18.04.2026|Tottenham|Brighton|2|2
Brighton|Tottenham~20.09.2025|Brighton|Tottenham|2|2
Brighton|Tottenham~25.05.2025|Tottenham|Brighton|1|4
Brighton|Tottenham~06.10.2024|Brighton|Tottenham|3|2
Brighton|Tottenham~10.02.2024|Tottenham|Brighton|2|1
Chelsea|Man United~18.04.2026|Chelsea|Man United|0|1
Chelsea|Man United~20.09.2025|Man United|Chelsea|2|1
Chelsea|Man United~16.05.2025|Chelsea|Man United|1|0
Chelsea|Man United~03.11.2024|Man United|Chelsea|1|1
Chelsea|Man United~04.04.2024|Chelsea|Man United|4|3
Brentford|Fulham~18.04.2026|Brentford|Fulham|0|0
Brentford|Fulham~20.09.2025|Fulham|Brentford|3|1
Brentford|Fulham~18.05.2025|Brentford|Fulham|2|3
Brentford|Fulham~04.11.2024|Fulham|Brentford|2|1
Brentford|Fulham~04.05.2024|Brentford|Fulham|0|0
Sunderland|Tottenham~12.04.2026|Sunderland|Tottenham|1|0
Sunderland|Tottenham~04.01.2026|Tottenham|Sunderland|1|1
Chelsea|Man City~12.04.2026|Chelsea|Man City|0|3
Chelsea|Man City~04.01.2026|Man City|Chelsea|1|1
Chelsea|Man City~25.01.2025|Man City|Chelsea|3|1
Chelsea|Man City~18.08.2024|Chelsea|Man City|0|2
Chelsea|Man City~17.02.2024|Man City|Chelsea|1|1
Brentford|Everton~11.04.2026|Brentford|Everton|2|2
Brentford|Everton~04.01.2026|Everton|Brentford|2|4
Brentford|Everton~26.02.2025|Brentford|Everton|1|1
Brentford|Everton~23.11.2024|Everton|Brentford|0|0
Brentford|Everton~27.04.2024|Everton|Brentford|1|0
Arsenal|Bournemouth~11.04.2026|Arsenal|Bournemouth|1|2
Arsenal|Bournemouth~03.01.2026|Bournemouth|Arsenal|2|3
Arsenal|Bournemouth~03.05.2025|Arsenal|Bournemouth|1|2
Arsenal|Bournemouth~19.10.2024|Bournemouth|Arsenal|2|0
Arsenal|Bournemouth~04.05.2024|Arsenal|Bournemouth|3|0
Newcastle|Sunderland~22.03.2026|Newcastle|Sunderland|1|2
Newcastle|Sunderland~14.12.2025|Sunderland|Newcastle|1|0
Fulham|N. Forest~15.03.2026|N. Forest|Fulham|0|0
Fulham|N. Forest~22.12.2025|Fulham|N. Forest|1|0
Fulham|N. Forest~15.02.2025|Fulham|N. Forest|2|1
Fulham|N. Forest~28.09.2024|N. Forest|Fulham|0|1
Fulham|N. Forest~02.04.2024|N. Forest|Fulham|3|1
Aston Villa|Man United~15.03.2026|Man United|Aston Villa|3|1
Aston Villa|Man United~21.12.2025|Aston Villa|Man United|2|1
Aston Villa|Man United~25.05.2025|Man United|Aston Villa|2|0
Aston Villa|Man United~06.10.2024|Aston Villa|Man United|0|0
Aston Villa|Man United~11.02.2024|Aston Villa|Man United|1|2
Liverpool|Tottenham~15.03.2026|Liverpool|Tottenham|1|1
Liverpool|Tottenham~20.12.2025|Tottenham|Liverpool|1|2
Liverpool|Tottenham~27.04.2025|Liverpool|Tottenham|5|1
Liverpool|Tottenham~22.12.2024|Tottenham|Liverpool|3|6
Liverpool|Tottenham~05.05.2024|Liverpool|Tottenham|4|2
Chelsea|Newcastle~14.03.2026|Chelsea|Newcastle|0|1
Chelsea|Newcastle~20.12.2025|Newcastle|Chelsea|2|2
Chelsea|Newcastle~11.05.2025|Newcastle|Chelsea|2|0
Chelsea|Newcastle~27.10.2024|Chelsea|Newcastle|2|1
Chelsea|Newcastle~11.03.2024|Chelsea|Newcastle|3|2
C. Palace|Tottenham~05.03.2026|Tottenham|C. Palace|1|3
C. Palace|Tottenham~28.12.2025|C. Palace|Tottenham|0|1
C. Palace|Tottenham~11.05.2025|Tottenham|C. Palace|0|2
C. Palace|Tottenham~27.10.2024|C. Palace|Tottenham|1|0
C. Palace|Tottenham~02.03.2024|Tottenham|C. Palace|3|1
Man United|Newcastle~04.03.2026|Newcastle|Man United|2|1
Man United|Newcastle~26.12.2025|Man United|Newcastle|1|0
Man United|Newcastle~13.04.2025|Newcastle|Man United|4|1
Man United|Newcastle~30.12.2024|Man United|Newcastle|0|2
Man United|Newcastle~15.05.2024|Man United|Newcastle|3|2
Man City|N. Forest~04.03.2026|Man City|N. Forest|2|2
Man City|N. Forest~27.12.2025|N. Forest|Man City|1|2
Man City|N. Forest~08.03.2025|N. Forest|Man City|1|0
Man City|N. Forest~04.12.2024|Man City|N. Forest|3|0
Man City|N. Forest~28.04.2024|N. Forest|Man City|0|2
Aston Villa|Chelsea~04.03.2026|Aston Villa|Chelsea|1|4
Aston Villa|Chelsea~27.12.2025|Chelsea|Aston Villa|1|2
Aston Villa|Chelsea~22.02.2025|Aston Villa|Chelsea|2|1
Aston Villa|Chelsea~01.12.2024|Chelsea|Aston Villa|3|0
Aston Villa|Chelsea~27.04.2024|Aston Villa|Chelsea|2|2
C. Palace|Man United~01.03.2026|Man United|C. Palace|2|1
C. Palace|Man United~30.11.2025|C. Palace|Man United|1|2
C. Palace|Man United~02.02.2025|Man United|C. Palace|0|2
C. Palace|Man United~21.09.2024|C. Palace|Man United|0|0
C. Palace|Man United~06.05.2024|C. Palace|Man United|4|0
Fulham|Tottenham~01.03.2026|Fulham|Tottenham|2|1
Fulham|Tottenham~29.11.2025|Tottenham|Fulham|1|2
Fulham|Tottenham~16.03.2025|Fulham|Tottenham|2|0
Fulham|Tottenham~01.12.2024|Tottenham|Fulham|1|1
Fulham|Tottenham~16.03.2024|Fulham|Tottenham|3|0
Brighton|N. Forest~01.03.2026|Brighton|N. Forest|2|1
Brighton|N. Forest~30.11.2025|N. Forest|Brighton|0|2
Brighton|N. Forest~01.02.2025|N. Forest|Brighton|7|0
Brighton|N. Forest~22.09.2024|Brighton|N. Forest|2|2
Brighton|N. Forest~10.03.2024|Brighton|N. Forest|1|0
Everton|Newcastle~28.02.2026|Newcastle|Everton|2|3
Everton|Newcastle~29.11.2025|Everton|Newcastle|1|4
Everton|Newcastle~25.05.2025|Newcastle|Everton|0|1
Everton|Newcastle~05.10.2024|Everton|Newcastle|0|0
Everton|Newcastle~02.04.2024|Newcastle|Everton|1|1
Leeds|Man City~28.02.2026|Leeds|Man City|0|1
Leeds|Man City~29.11.2025|Man City|Leeds|3|2
Leeds|Man City~06.05.2023|Man City|Leeds|2|1
Leeds|Man City~28.12.2022|Leeds|Man City|1|3
Leeds|Man City~30.04.2022|Leeds|Man City|0|4
Arsenal|Tottenham~22.02.2026|Tottenham|Arsenal|1|4
Arsenal|Tottenham~23.11.2025|Arsenal|Tottenham|4|1
Arsenal|Tottenham~15.01.2025|Arsenal|Tottenham|2|1
Arsenal|Tottenham~15.09.2024|Tottenham|Arsenal|0|1
Arsenal|Tottenham~28.04.2024|Tottenham|Arsenal|2|3
Man City|Newcastle~21.02.2026|Man City|Newcastle|2|1
Man City|Newcastle~22.11.2025|Newcastle|Man City|2|1
Man City|Newcastle~15.02.2025|Man City|Newcastle|4|0
Man City|Newcastle~28.09.2024|Newcastle|Man City|1|1
Man City|Newcastle~13.01.2024|Newcastle|Man City|2|3
Brentford|Brighton~21.02.2026|Brentford|Brighton|0|2
Brentford|Brighton~22.11.2025|Brighton|Brentford|2|1
Brentford|Brighton~19.04.2025|Brentford|Brighton|4|2
Brentford|Brighton~27.12.2024|Brighton|Brentford|0|0
Brentford|Brighton~03.04.2024|Brentford|Brighton|0|0
Aston Villa|Leeds~21.02.2026|Aston Villa|Leeds|1|1
Aston Villa|Leeds~23.11.2025|Leeds|Aston Villa|1|2
Aston Villa|Leeds~13.01.2023|Aston Villa|Leeds|2|1
Aston Villa|Leeds~02.10.2022|Leeds|Aston Villa|0|0
Aston Villa|Leeds~10.03.2022|Leeds|Aston Villa|0|3
Arsenal|Brentford~12.02.2026|Brentford|Arsenal|1|1
Arsenal|Brentford~03.12.2025|Arsenal|Brentford|2|0
Arsenal|Brentford~12.04.2025|Arsenal|Brentford|1|1
Arsenal|Brentford~01.01.2025|Brentford|Arsenal|1|3
Arsenal|Brentford~09.03.2024|Arsenal|Brentford|2|1
Liverpool|Sunderland~11.02.2026|Sunderland|Liverpool|0|1
Liverpool|Sunderland~03.12.2025|Liverpool|Sunderland|1|1
Fulham|Man City~11.02.2026|Man City|Fulham|3|0
Fulham|Man City~02.12.2025|Fulham|Man City|4|5
Fulham|Man City~25.05.2025|Fulham|Man City|0|2
Fulham|Man City~05.10.2024|Man City|Fulham|3|2
Fulham|Man City~11.05.2024|Fulham|Man City|0|4
Chelsea|Leeds~10.02.2026|Chelsea|Leeds|2|2
Chelsea|Leeds~03.12.2025|Leeds|Chelsea|3|1
Chelsea|Leeds~04.03.2023|Chelsea|Leeds|1|0
Chelsea|Leeds~21.08.2022|Leeds|Chelsea|3|0
Chelsea|Leeds~11.05.2022|Leeds|Chelsea|0|3
Brentford|Newcastle~07.02.2026|Newcastle|Brentford|2|3
Brentford|Newcastle~09.11.2025|Brentford|Newcastle|3|1
Brentford|Newcastle~02.04.2025|Newcastle|Brentford|2|1
Brentford|Newcastle~07.12.2024|Brentford|Newcastle|4|2
Brentford|Newcastle~19.05.2024|Brentford|Newcastle|2|4
Everton|Fulham~07.02.2026|Fulham|Everton|1|2
Everton|Fulham~08.11.2025|Everton|Fulham|2|0
Everton|Fulham~10.05.2025|Fulham|Everton|1|3
Everton|Fulham~26.10.2024|Everton|Fulham|1|1
Everton|Fulham~30.01.2024|Fulham|Everton|0|0
Aston Villa|Bournemouth~07.02.2026|Bournemouth|Aston Villa|1|1
Aston Villa|Bournemouth~09.11.2025|Aston Villa|Bournemouth|4|0
Aston Villa|Bournemouth~10.05.2025|Bournemouth|Aston Villa|0|1
Aston Villa|Bournemouth~26.10.2024|Aston Villa|Bournemouth|1|1
Aston Villa|Bournemouth~21.04.2024|Aston Villa|Bournemouth|3|1
Man City|Tottenham~01.02.2026|Tottenham|Man City|2|2
Man City|Tottenham~23.08.2025|Man City|Tottenham|0|2
Man City|Tottenham~26.02.2025|Tottenham|Man City|0|1
Man City|Tottenham~23.11.2024|Man City|Tottenham|0|4
Man City|Tottenham~14.05.2024|Tottenham|Man City|0|2
Brighton|Everton~31.01.2026|Brighton|Everton|1|1
Brighton|Everton~24.08.2025|Everton|Brighton|2|0
Brighton|Everton~25.01.2025|Brighton|Everton|0|1
Brighton|Everton~17.08.2024|Everton|Brighton|0|3
Brighton|Everton~24.02.2024|Brighton|Everton|1|1
Everton|Leeds~26.01.2026|Everton|Leeds|1|1
Everton|Leeds~18.08.2025|Leeds|Everton|1|0
Everton|Leeds~18.02.2023|Everton|Leeds|1|0
Everton|Leeds~30.08.2022|Leeds|Everton|1|1
Everton|Leeds~12.02.2022|Everton|Leeds|3|0
C. Palace|Chelsea~25.01.2026|C. Palace|Chelsea|1|3
C. Palace|Chelsea~17.08.2025|Chelsea|C. Palace|0|0
C. Palace|Chelsea~04.01.2025|C. Palace|Chelsea|1|1
C. Palace|Chelsea~01.09.2024|Chelsea|C. Palace|1|1
C. Palace|Chelsea~12.02.2024|C. Palace|Chelsea|1|3
Brentford|N. Forest~25.01.2026|Brentford|N. Forest|0|2
Brentford|N. Forest~17.08.2025|N. Forest|Brentford|3|1
Brentford|N. Forest~01.05.2025|N. Forest|Brentford|0|2
Brentford|N. Forest~21.12.2024|Brentford|N. Forest|0|2
Brentford|N. Forest~20.01.2024|Brentford|N. Forest|3|2
Arsenal|Man United~25.01.2026|Arsenal|Man United|2|3
Arsenal|Man United~17.08.2025|Man United|Arsenal|0|1
Arsenal|Man United~09.03.2025|Man United|Arsenal|1|1
Arsenal|Man United~04.12.2024|Arsenal|Man United|2|0
Arsenal|Man United~12.05.2024|Man United|Arsenal|0|1
Brighton|Fulham~24.01.2026|Fulham|Brighton|2|1
Brighton|Fulham~16.08.2025|Brighton|Fulham|1|1
Brighton|Fulham~08.03.2025|Brighton|Fulham|2|1
Brighton|Fulham~05.12.2024|Fulham|Brighton|3|1
Brighton|Fulham~02.03.2024|Fulham|Brighton|3|0
Bournemouth|Brighton~19.01.2026|Brighton|Bournemouth|1|1
Bournemouth|Brighton~13.09.2025|Bournemouth|Brighton|2|1
Bournemouth|Brighton~25.02.2025|Brighton|Bournemouth|2|1
Bournemouth|Brighton~23.11.2024|Bournemouth|Brighton|1|2
Bournemouth|Brighton~28.04.2024|Bournemouth|Brighton|3|0
Aston Villa|Everton~18.01.2026|Aston Villa|Everton|0|1
Aston Villa|Everton~13.09.2025|Everton|Aston Villa|0|0
Aston Villa|Everton~15.01.2025|Everton|Aston Villa|0|1
Aston Villa|Everton~14.09.2024|Aston Villa|Everton|3|2
Aston Villa|Everton~14.01.2024|Everton|Aston Villa|0|0
C. Palace|Sunderland~17.01.2026|Sunderland|C. Palace|2|1
C. Palace|Sunderland~13.09.2025|C. Palace|Sunderland|0|0
Fulham|Leeds~17.01.2026|Leeds|Fulham|1|0
Fulham|Leeds~13.09.2025|Fulham|Leeds|1|0
Fulham|Leeds~22.04.2023|Fulham|Leeds|2|1
Fulham|Leeds~23.10.2022|Leeds|Fulham|2|3
Arsenal|Liverpool~08.01.2026|Arsenal|Liverpool|0|0
Arsenal|Liverpool~31.08.2025|Liverpool|Arsenal|1|0
Arsenal|Liverpool~11.05.2025|Liverpool|Arsenal|2|2
Arsenal|Liverpool~27.10.2024|Arsenal|Liverpool|2|2
Arsenal|Liverpool~04.02.2024|Arsenal|Liverpool|3|1
Brighton|Man City~07.01.2026|Man City|Brighton|1|1
Brighton|Man City~31.08.2025|Brighton|Man City|2|1
Brighton|Man City~15.03.2025|Man City|Brighton|2|2
Brighton|Man City~09.11.2024|Brighton|Man City|2|1
Brighton|Man City~25.04.2024|Brighton|Man City|0|4
Aston Villa|C. Palace~07.01.2026|C. Palace|Aston Villa|0|0
Aston Villa|C. Palace~31.08.2025|Aston Villa|C. Palace|0|3
Aston Villa|C. Palace~25.02.2025|C. Palace|Aston Villa|4|1
Aston Villa|C. Palace~23.11.2024|Aston Villa|C. Palace|2|2
Aston Villa|C. Palace~19.05.2024|C. Palace|Aston Villa|5|0
Bournemouth|Tottenham~07.01.2026|Bournemouth|Tottenham|3|2
Bournemouth|Tottenham~30.08.2025|Tottenham|Bournemouth|0|1
Bournemouth|Tottenham~09.03.2025|Tottenham|Bournemouth|2|2
Bournemouth|Tottenham~05.12.2024|Bournemouth|Tottenham|1|0
Bournemouth|Tottenham~31.12.2023|Tottenham|Bournemouth|3|1
Leeds|Liverpool~01.01.2026|Liverpool|Leeds|0|0
Leeds|Liverpool~06.12.2025|Leeds|Liverpool|3|3
Leeds|Liverpool~17.04.2023|Leeds|Liverpool|1|6
Leeds|Liverpool~29.10.2022|Liverpool|Leeds|1|2
Leeds|Liverpool~23.02.2022|Liverpool|Leeds|6|0
Everton|N. Forest~30.12.2025|N. Forest|Everton|0|2
Everton|N. Forest~06.12.2025|Everton|N. Forest|3|0
Everton|N. Forest~12.04.2025|N. Forest|Everton|0|1
Everton|N. Forest~29.12.2024|Everton|N. Forest|0|2
Everton|N. Forest~21.04.2024|Everton|N. Forest|2|0
Brentford|Ipswich~10.05.2025|Ipswich|Brentford|0|1
Brentford|Ipswich~26.10.2024|Brentford|Ipswich|4|3
Ipswich|Newcastle~26.04.2025|Newcastle|Ipswich|3|0
Ipswich|Newcastle~21.12.2024|Ipswich|Newcastle|0|4
Arsenal|Ipswich~20.04.2025|Ipswich|Arsenal|0|4
Arsenal|Ipswich~27.12.2024|Arsenal|Ipswich|1|0
Chelsea|Ipswich~13.04.2025|Chelsea|Ipswich|2|2
Chelsea|Ipswich~30.12.2024|Ipswich|Chelsea|2|0
Bournemouth|Ipswich~02.04.2025|Bournemouth|Ipswich|1|2
Bournemouth|Ipswich~08.12.2024|Ipswich|Bournemouth|1|2
Ipswich|Tottenham~22.02.2025|Ipswich|Tottenham|1|4
Ipswich|Tottenham~10.11.2024|Tottenham|Ipswich|1|2
Aston Villa|Ipswich~15.02.2025|Aston Villa|Ipswich|1|1
Aston Villa|Ipswich~29.09.2024|Ipswich|Aston Villa|2|2
Brighton|Ipswich~16.01.2025|Ipswich|Brighton|0|2
Brighton|Ipswich~14.09.2024|Brighton|Ipswich|0|0`;
PLHH.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
const LLHH=`Osasuna|Sevilla~26.10.2026|Sevilla|Osasuna|2|0
Osasuna|Sevilla~26.04.2026|Osasuna|Sevilla|2|1
Osasuna|Sevilla~08.11.2025|Sevilla|Osasuna|1|0
Osasuna|Sevilla~24.04.2025|Osasuna|Sevilla|1|0
Osasuna|Sevilla~02.12.2024|Sevilla|Osasuna|1|1
Levante|Real Sociedad~25.10.2026|Real Sociedad|Levante|2|1
Levante|Real Sociedad~04.04.2026|Real Sociedad|Levante|2|0
Levante|Real Sociedad~20.12.2025|Levante|Real Sociedad|1|1
Levante|Real Sociedad~06.05.2022|Levante|Real Sociedad|2|1
Levante|Real Sociedad~28.08.2021|Real Sociedad|Levante|1|0
Betis|Celta~25.10.2026|Celta|Betis|0|0
Betis|Celta~15.03.2026|Betis|Celta|1|1
Betis|Celta~27.08.2025|Celta|Betis|1|1
Betis|Celta~08.02.2025|Celta|Betis|3|2
Betis|Celta~10.11.2024|Betis|Celta|2|2
Barcelona|Real Madrid~25.10.2026|Barcelona|Real Madrid|1|2
Barcelona|Real Madrid~10.05.2026|Barcelona|Real Madrid|2|0
Barcelona|Real Madrid~26.10.2025|Real Madrid|Barcelona|2|1
Barcelona|Real Madrid~11.05.2025|Barcelona|Real Madrid|4|3
Barcelona|Real Madrid~26.10.2024|Real Madrid|Barcelona|0|4
Athletic|Getafe~25.10.2026|Athletic|Getafe|4|0
Athletic|Getafe~05.04.2026|Getafe|Athletic|2|0
Athletic|Getafe~25.10.2025|Athletic|Getafe|0|1
Athletic|Getafe~15.05.2025|Getafe|Athletic|0|2
Athletic|Getafe~15.08.2024|Athletic|Getafe|1|1
Valencia|Villarreal~24.10.2026|Valencia|Villarreal|1|2
Valencia|Villarreal~22.02.2026|Villarreal|Valencia|2|1
Valencia|Villarreal~25.10.2025|Valencia|Villarreal|0|2
Valencia|Villarreal~15.02.2025|Villarreal|Valencia|1|1
Valencia|Villarreal~31.08.2024|Valencia|Villarreal|1|1
Elche|Rayo~24.10.2026|Rayo|Elche|0|3
Elche|Rayo~03.04.2026|Rayo|Elche|1|0
Elche|Rayo~21.12.2025|Elche|Rayo|4|0
Elche|Rayo~29.04.2023|Elche|Rayo|4|0
Elche|Rayo~03.10.2022|Rayo|Elche|2|1
Espanyol|Racing Santander~24.10.2026|Racing Santander|Espanyol|2|1
Atletico Madrid|Deportivo~24.10.2026|Atletico Madrid|Deportivo|1|0
Alaves|Malaga~23.10.2026|Alaves|Malaga|1|1
Athletic|Levante~21.10.2026|Levante|Athletic|3|1
Athletic|Levante~08.02.2026|Athletic|Levante|4|2
Athletic|Levante~29.11.2025|Levante|Athletic|0|2
Athletic|Levante~07.03.2022|Athletic|Levante|3|1
Athletic|Levante~19.11.2021|Levante|Athletic|0|0
Getafe|Rayo~19.10.2026|Getafe|Rayo|1|1
Getafe|Rayo~03.05.2026|Getafe|Rayo|0|2
Getafe|Rayo~02.01.2026|Rayo|Getafe|1|1
Getafe|Rayo~02.05.2025|Rayo|Getafe|1|0
Getafe|Rayo~24.08.2024|Getafe|Rayo|0|0
Real Madrid|Sevilla~18.10.2026|Real Madrid|Sevilla|4|1
Real Madrid|Sevilla~17.05.2026|Sevilla|Real Madrid|0|1
Real Madrid|Sevilla~20.12.2025|Real Madrid|Sevilla|2|0
Real Madrid|Sevilla~18.05.2025|Sevilla|Real Madrid|0|2
Real Madrid|Sevilla~22.12.2024|Real Madrid|Sevilla|4|2
Osasuna|Racing Santander~18.10.2026|Osasuna|Racing Santander|2|0
Malaga|Real Sociedad~18.10.2026|Malaga|Real Sociedad|2|5
Alaves|Celta~18.10.2026|Celta|Alaves|2|1
Alaves|Celta~22.03.2026|Celta|Alaves|3|4
Alaves|Celta~22.11.2025|Alaves|Celta|0|1
Alaves|Celta~27.01.2025|Alaves|Celta|1|1
Alaves|Celta~16.08.2024|Celta|Alaves|2|1
Elche|Villarreal~17.10.2026|Villarreal|Elche|0|0
Elche|Villarreal~08.03.2026|Villarreal|Elche|2|1
Elche|Villarreal~03.01.2026|Elche|Villarreal|1|3
Elche|Villarreal~04.02.2023|Elche|Villarreal|3|1
Elche|Villarreal~04.09.2022|Villarreal|Elche|4|0
Athletic|Valencia~17.10.2026|Valencia|Athletic|0|0
Athletic|Valencia~10.05.2026|Athletic|Valencia|0|1
Athletic|Valencia~20.09.2025|Valencia|Athletic|2|0
Athletic|Valencia~18.05.2025|Valencia|Athletic|0|1
Athletic|Valencia~28.08.2024|Athletic|Valencia|1|0
Atletico Madrid|Espanyol~17.10.2026|Espanyol|Atletico Madrid|0|1
Atletico Madrid|Espanyol~21.02.2026|Atletico Madrid|Espanyol|4|2
Atletico Madrid|Espanyol~17.08.2025|Espanyol|Atletico Madrid|2|1
Atletico Madrid|Espanyol~29.03.2025|Espanyol|Atletico Madrid|1|1
Atletico Madrid|Espanyol~28.08.2024|Atletico Madrid|Espanyol|0|0
Barcelona|Betis~17.10.2026|Betis|Barcelona|2|5
Barcelona|Betis~17.05.2026|Barcelona|Betis|3|1
Barcelona|Betis~06.12.2025|Betis|Barcelona|3|5
Barcelona|Betis~05.04.2025|Barcelona|Betis|1|1
Barcelona|Betis~07.12.2024|Betis|Barcelona|2|2
Deportivo|Levante~16.10.2026|Deportivo|Levante|1|1
Levante|Sevilla~12.10.2026|Levante|Sevilla|3|3
Levante|Sevilla~23.04.2026|Levante|Sevilla|2|0
Levante|Sevilla~04.01.2026|Sevilla|Levante|0|3
Levante|Sevilla~21.04.2022|Levante|Sevilla|2|3
Levante|Sevilla~24.10.2021|Sevilla|Levante|5|3
Deportivo|Real Sociedad~11.10.2026|Real Sociedad|Deportivo|3|2
Racing Santander|Valencia~11.10.2026|Racing Santander|Valencia|2|2
Celta|Elche~11.10.2026|Elche|Celta|0|0
Celta|Elche~03.05.2026|Celta|Elche|3|1
Celta|Elche~28.09.2025|Elche|Celta|2|1
Celta|Elche~26.04.2023|Celta|Elche|1|0
Celta|Elche~06.01.2023|Elche|Celta|0|1
Betis|Osasuna~11.10.2026|Betis|Osasuna|5|2
Betis|Osasuna~12.04.2026|Osasuna|Betis|1|1
Betis|Osasuna~28.09.2025|Betis|Osasuna|2|0
Betis|Osasuna~11.05.2025|Betis|Osasuna|1|1
Betis|Osasuna~19.10.2024|Osasuna|Betis|1|2
Real Madrid|Villarreal~10.10.2026|Real Madrid|Villarreal|1|0
Real Madrid|Villarreal~24.01.2026|Villarreal|Real Madrid|0|2
Real Madrid|Villarreal~04.10.2025|Real Madrid|Villarreal|3|1
Real Madrid|Villarreal~15.03.2025|Villarreal|Real Madrid|1|2
Real Madrid|Villarreal~05.10.2024|Real Madrid|Villarreal|2|0
Barcelona|Getafe~10.10.2026|Barcelona|Getafe|3|0
Barcelona|Getafe~25.04.2026|Getafe|Barcelona|0|2
Barcelona|Getafe~21.09.2025|Barcelona|Getafe|3|0
Barcelona|Getafe~18.01.2025|Getafe|Barcelona|1|1
Barcelona|Getafe~25.09.2024|Barcelona|Getafe|1|0
Alaves|Atletico Madrid~10.10.2026|Alaves|Atletico Madrid|1|2
Alaves|Atletico Madrid~18.01.2026|Atletico Madrid|Alaves|1|0
Alaves|Atletico Madrid~30.08.2025|Alaves|Atletico Madrid|1|1
Alaves|Atletico Madrid~03.05.2025|Alaves|Atletico Madrid|0|0
Alaves|Atletico Madrid~23.11.2024|Atletico Madrid|Alaves|2|1
Espanyol|Malaga~09.10.2026|Malaga|Espanyol|1|1
Levante|Villarreal~20.09.2026|Villarreal|Levante|3|1
Levante|Villarreal~02.05.2026|Villarreal|Levante|5|1
Levante|Villarreal~18.02.2026|Levante|Villarreal|0|1
Levante|Villarreal~02.04.2022|Levante|Villarreal|2|0
Levante|Villarreal~03.01.2022|Villarreal|Levante|5|0
Real Sociedad|Valencia~20.09.2026|Valencia|Real Sociedad|2|3
Real Sociedad|Valencia~17.05.2026|Real Sociedad|Valencia|3|4
Real Sociedad|Valencia~16.08.2025|Valencia|Real Sociedad|1|1
Real Sociedad|Valencia~19.01.2025|Valencia|Real Sociedad|1|0
Real Sociedad|Valencia~28.09.2024|Real Sociedad|Valencia|3|0
Getafe|Malaga~20.09.2026|Getafe|Malaga|1|0
Betis|Deportivo~20.09.2026|Deportivo|Betis|1|1
Atletico Madrid|Real Madrid~20.09.2026|Atletico Madrid|Real Madrid|2|1
Atletico Madrid|Real Madrid~22.03.2026|Real Madrid|Atletico Madrid|3|2
Atletico Madrid|Real Madrid~27.09.2025|Atletico Madrid|Real Madrid|5|2
Atletico Madrid|Real Madrid~08.02.2025|Real Madrid|Atletico Madrid|1|1
Atletico Madrid|Real Madrid~29.09.2024|Atletico Madrid|Real Madrid|1|1
Barcelona|Sevilla~19.09.2026|Sevilla|Barcelona|1|3
Barcelona|Sevilla~15.03.2026|Barcelona|Sevilla|5|2
Barcelona|Sevilla~05.10.2025|Sevilla|Barcelona|4|1
Barcelona|Sevilla~09.02.2025|Sevilla|Barcelona|1|4
Barcelona|Sevilla~20.10.2024|Barcelona|Sevilla|5|1
Osasuna|Rayo~19.09.2026|Osasuna|Rayo|1|1
Osasuna|Rayo~24.01.2026|Rayo|Osasuna|1|3
Osasuna|Rayo~14.09.2025|Osasuna|Rayo|2|0
Osasuna|Rayo~19.01.2025|Osasuna|Rayo|1|1
Osasuna|Rayo~16.09.2024|Rayo|Osasuna|3|1
Celta|Racing Santander~19.09.2026|Celta|Racing Santander|5|0
Alaves|Athletic~19.09.2026|Athletic|Alaves|0|0
Alaves|Athletic~02.05.2026|Alaves|Athletic|2|4
Alaves|Athletic~13.09.2025|Athletic|Alaves|0|1
Alaves|Athletic~11.05.2025|Athletic|Alaves|1|0
Alaves|Athletic~15.12.2024|Alaves|Athletic|1|1
Elche|Espanyol~18.09.2026|Espanyol|Elche|1|3
Elche|Espanyol~01.03.2026|Elche|Espanyol|2|2
Elche|Espanyol~25.10.2025|Espanyol|Elche|1|0
Elche|Espanyol~19.02.2023|Elche|Espanyol|0|1
Elche|Espanyol~23.10.2022|Espanyol|Elche|2|2
Malaga|Villarreal~17.09.2026|Malaga|Villarreal|1|3
Betis|Getafe~17.09.2026|Betis|Getafe|1|0
Betis|Getafe~08.03.2026|Getafe|Betis|2|0
Betis|Getafe~21.12.2025|Betis|Getafe|4|0
Betis|Getafe~23.02.2025|Getafe|Betis|1|2
Betis|Getafe~18.09.2024|Betis|Getafe|2|1
Deportivo|Sevilla~16.09.2026|Deportivo|Sevilla|0|1
Barcelona|Racing Santander~16.09.2026|Barcelona|Racing Santander|7|2
Atletico Madrid|Osasuna~16.09.2026|Atletico Madrid|Osasuna|4|0
Atletico Madrid|Osasuna~12.05.2026|Osasuna|Atletico Madrid|1|2
Atletico Madrid|Osasuna~18.10.2025|Atletico Madrid|Osasuna|1|0
Atletico Madrid|Osasuna~15.05.2025|Osasuna|Atletico Madrid|2|0
Atletico Madrid|Osasuna~12.01.2025|Atletico Madrid|Osasuna|1|0
Espanyol|Rayo~15.09.2026|Rayo|Espanyol|2|1
Espanyol|Rayo~23.04.2026|Rayo|Espanyol|1|0
Espanyol|Rayo~07.12.2025|Espanyol|Rayo|1|0
Espanyol|Rayo~04.04.2025|Rayo|Espanyol|0|4
Espanyol|Rayo~31.08.2024|Espanyol|Rayo|2|1
Elche|Real Madrid~15.09.2026|Elche|Real Madrid|2|3
Elche|Real Madrid~14.03.2026|Real Madrid|Elche|4|1
Elche|Real Madrid~23.11.2025|Elche|Real Madrid|2|2
Elche|Real Madrid~15.02.2023|Real Madrid|Elche|4|0
Elche|Real Madrid~19.10.2022|Elche|Real Madrid|0|3
Alaves|Valencia~15.09.2026|Alaves|Valencia|0|1
Alaves|Valencia~08.03.2026|Valencia|Alaves|3|2
Alaves|Valencia~20.10.2025|Alaves|Valencia|0|0
Alaves|Valencia~14.05.2025|Alaves|Valencia|1|0
Alaves|Valencia~22.12.2024|Valencia|Alaves|2|2
Betis|Villarreal~14.09.2026|Villarreal|Betis|1|2
Betis|Villarreal~17.01.2026|Betis|Villarreal|2|0
Betis|Villarreal~18.10.2025|Villarreal|Betis|2|2
Betis|Villarreal~13.04.2025|Betis|Villarreal|1|2
Betis|Villarreal~15.12.2024|Villarreal|Betis|1|2
Atletico Madrid|Real Sociedad~13.09.2026|Real Sociedad|Atletico Madrid|0|3
Atletico Madrid|Real Sociedad~07.03.2026|Atletico Madrid|Real Sociedad|3|2
Atletico Madrid|Real Sociedad~04.01.2026|Real Sociedad|Atletico Madrid|1|1
Atletico Madrid|Real Sociedad~10.05.2025|Atletico Madrid|Real Sociedad|4|0
Atletico Madrid|Real Sociedad~06.10.2024|Real Sociedad|Atletico Madrid|1|1
Barcelona|Levante~13.09.2026|Levante|Barcelona|2|4
Barcelona|Levante~22.02.2026|Barcelona|Levante|3|0
Barcelona|Levante~23.08.2025|Levante|Barcelona|2|3
Barcelona|Levante~10.04.2022|Levante|Barcelona|2|3
Barcelona|Levante~26.09.2021|Barcelona|Levante|3|0
Deportivo|Getafe~13.09.2026|Getafe|Deportivo|1|1
Celta|Malaga~13.09.2026|Celta|Malaga|1|1
Rayo|Real Madrid~12.09.2026|Real Madrid|Rayo|4|1
Rayo|Real Madrid~01.02.2026|Real Madrid|Rayo|2|1
Rayo|Real Madrid~09.11.2025|Rayo|Real Madrid|0|0
Rayo|Real Madrid~09.03.2025|Real Madrid|Rayo|2|1
Rayo|Real Madrid~14.12.2024|Rayo|Real Madrid|3|3
Alaves|Racing Santander~12.09.2026|Racing Santander|Alaves|2|1
Espanyol|Osasuna~12.09.2026|Osasuna|Espanyol|0|2
Espanyol|Osasuna~17.05.2026|Osasuna|Espanyol|1|2
Espanyol|Osasuna~31.08.2025|Espanyol|Osasuna|1|0
Espanyol|Osasuna~18.05.2025|Osasuna|Espanyol|2|0
Espanyol|Osasuna~14.12.2024|Espanyol|Osasuna|0|0
Athletic|Elche~12.09.2026|Athletic|Elche|1|1
Athletic|Elche~20.02.2026|Athletic|Elche|2|1
Athletic|Elche~19.10.2025|Elche|Athletic|0|0
Athletic|Elche~28.05.2023|Athletic|Elche|0|1
Athletic|Elche~11.09.2022|Elche|Athletic|1|4
Sevilla|Valencia~11.09.2026|Sevilla|Valencia|1|0
Sevilla|Valencia~21.03.2026|Sevilla|Valencia|0|2
Sevilla|Valencia~07.12.2025|Valencia|Sevilla|1|1
Sevilla|Valencia~11.04.2025|Valencia|Sevilla|1|0
Sevilla|Valencia~11.01.2025|Sevilla|Valencia|1|1
Celta|Getafe~07.09.2026|Getafe|Celta|1|1
Celta|Getafe~01.02.2026|Getafe|Celta|0|0
Celta|Getafe~17.08.2025|Celta|Getafe|0|2
Celta|Getafe~24.05.2025|Getafe|Celta|1|2
Celta|Getafe~04.11.2024|Celta|Getafe|1|0
Elche|Real Sociedad~07.09.2026|Elche|Real Sociedad|2|3
Elche|Real Sociedad~07.02.2026|Real Sociedad|Elche|3|1
Elche|Real Sociedad~07.11.2025|Elche|Real Sociedad|1|1
Elche|Real Sociedad~19.03.2023|Real Sociedad|Elche|2|0
Elche|Real Sociedad~27.08.2022|Elche|Real Sociedad|0|1
Barcelona|Valencia~06.09.2026|Valencia|Barcelona|0|5
Barcelona|Valencia~23.05.2026|Valencia|Barcelona|3|1
Barcelona|Valencia~14.09.2025|Barcelona|Valencia|6|0
Barcelona|Valencia~26.01.2025|Barcelona|Valencia|7|1
Barcelona|Valencia~17.08.2024|Valencia|Barcelona|1|2
Levante|Malaga~06.09.2026|Malaga|Levante|0|0
Espanyol|Sevilla~06.09.2026|Espanyol|Sevilla|1|1
Espanyol|Sevilla~09.05.2026|Sevilla|Espanyol|2|1
Espanyol|Sevilla~24.11.2025|Espanyol|Sevilla|2|1
Espanyol|Sevilla~25.01.2025|Sevilla|Espanyol|1|1
Espanyol|Sevilla~25.10.2024|Espanyol|Sevilla|0|2
Alaves|Osasuna~06.09.2026|Alaves|Osasuna|5|2
Alaves|Osasuna~05.04.2026|Alaves|Osasuna|2|2
Alaves|Osasuna~20.12.2025|Osasuna|Alaves|3|0
Alaves|Osasuna~24.05.2025|Alaves|Osasuna|1|1
Alaves|Osasuna~08.12.2024|Osasuna|Alaves|2|2
Deportivo|Villarreal~05.09.2026|Villarreal|Deportivo|2|3
Racing Santander|Rayo~05.09.2026|Rayo|Racing Santander|3|2
Athletic|Atletico Madrid~05.09.2026|Athletic|Atletico Madrid|3|0
Athletic|Atletico Madrid~25.04.2026|Atletico Madrid|Athletic|3|2
Athletic|Atletico Madrid~06.12.2025|Athletic|Atletico Madrid|1|0
Athletic|Atletico Madrid~01.03.2025|Atletico Madrid|Athletic|1|0
Athletic|Atletico Madrid~31.08.2024|Athletic|Atletico Madrid|0|1
Betis|Real Madrid~04.09.2026|Betis|Real Madrid|1|0
Betis|Real Madrid~24.04.2026|Betis|Real Madrid|1|1
Betis|Real Madrid~04.01.2026|Real Madrid|Betis|5|1
Betis|Real Madrid~01.03.2025|Betis|Real Madrid|2|1
Betis|Real Madrid~01.09.2024|Real Madrid|Betis|2|0
Celta|Real Sociedad~03.09.2026|Real Sociedad|Celta|0|0
Celta|Real Sociedad~25.01.2026|Real Sociedad|Celta|3|1
Celta|Real Sociedad~19.10.2025|Celta|Real Sociedad|1|1
Celta|Real Sociedad~13.05.2025|Real Sociedad|Celta|0|1
Celta|Real Sociedad~21.12.2024|Celta|Real Sociedad|2|0
Getafe|Osasuna~31.08.2026|Osasuna|Getafe|1|0
Getafe|Osasuna~23.05.2026|Getafe|Osasuna|1|0
Getafe|Osasuna~03.10.2025|Osasuna|Getafe|2|1
Getafe|Osasuna~16.03.2025|Osasuna|Getafe|1|2
Getafe|Osasuna~05.10.2024|Getafe|Osasuna|1|1
Barcelona|Rayo~31.08.2026|Barcelona|Rayo|5|2
Barcelona|Rayo~22.03.2026|Barcelona|Rayo|1|0
Barcelona|Rayo~31.08.2025|Rayo|Barcelona|1|1
Barcelona|Rayo~17.02.2025|Barcelona|Rayo|1|0
Barcelona|Rayo~27.08.2024|Rayo|Barcelona|1|2
Malaga|Real Madrid~30.08.2026|Real Madrid|Malaga|4|0
Deportivo|Valencia~30.08.2026|Deportivo|Valencia|3|1
Athletic|Celta~30.08.2026|Celta|Athletic|0|2
Athletic|Celta~17.05.2026|Athletic|Celta|1|1
Athletic|Celta~14.12.2025|Celta|Athletic|2|0
Athletic|Celta~19.01.2025|Celta|Athletic|1|2
Athletic|Celta~22.09.2024|Athletic|Celta|3|1
Atletico Madrid|Sevilla~29.08.2026|Sevilla|Atletico Madrid|1|3
Atletico Madrid|Sevilla~11.04.2026|Sevilla|Atletico Madrid|2|1
Atletico Madrid|Sevilla~01.11.2025|Atletico Madrid|Sevilla|3|0
Atletico Madrid|Sevilla~06.04.2025|Sevilla|Atletico Madrid|1|2
Atletico Madrid|Sevilla~08.12.2024|Atletico Madrid|Sevilla|4|3
Espanyol|Real Sociedad~29.08.2026|Real Sociedad|Espanyol|2|1
Espanyol|Real Sociedad~23.05.2026|Espanyol|Real Sociedad|1|1
Espanyol|Real Sociedad~24.08.2025|Real Sociedad|Espanyol|2|2
Espanyol|Real Sociedad~09.02.2025|Real Sociedad|Espanyol|2|1
Espanyol|Real Sociedad~24.08.2024|Espanyol|Real Sociedad|0|1
Betis|Levante~29.08.2026|Levante|Betis|5|2
Betis|Levante~23.05.2026|Betis|Levante|2|1
Betis|Levante~14.09.2025|Levante|Betis|2|2
Betis|Levante~13.02.2022|Levante|Betis|2|4
Betis|Levante~28.11.2021|Betis|Levante|3|1
Elche|Racing Santander~28.08.2026|Racing Santander|Elche|3|2
Alaves|Villarreal~28.08.2026|Alaves|Villarreal|1|0
Alaves|Villarreal~13.03.2026|Alaves|Villarreal|1|1
Alaves|Villarreal~10.01.2026|Villarreal|Alaves|3|1
Alaves|Villarreal~08.03.2025|Alaves|Villarreal|1|0
Alaves|Villarreal~09.11.2024|Villarreal|Alaves|3|0
Celta|Osasuna~27.08.2026|Celta|Osasuna|1|2
Celta|Osasuna~06.02.2026|Celta|Osasuna|1|2
Celta|Osasuna~26.10.2025|Osasuna|Celta|2|3
Celta|Osasuna~21.02.2025|Celta|Osasuna|1|0
Celta|Osasuna~01.09.2024|Osasuna|Celta|3|2
Athletic|Barcelona~27.08.2026|Barcelona|Athletic|2|0
Athletic|Barcelona~07.03.2026|Athletic|Barcelona|0|1
Athletic|Barcelona~22.11.2025|Barcelona|Athletic|4|0
Athletic|Barcelona~25.05.2025|Athletic|Barcelona|0|3
Athletic|Barcelona~24.08.2024|Barcelona|Athletic|2|1
Real Madrid|Real Sociedad~26.08.2026|Real Madrid|Real Sociedad|4|1
Real Madrid|Real Sociedad~14.02.2026|Real Madrid|Real Sociedad|4|1
Real Madrid|Real Sociedad~13.09.2025|Real Sociedad|Real Madrid|1|2
Real Madrid|Real Sociedad~24.05.2025|Real Madrid|Real Sociedad|2|0
Real Madrid|Real Sociedad~14.09.2024|Real Sociedad|Real Madrid|0|2
Betis|Valencia~25.08.2026|Valencia|Betis|0|1
Betis|Valencia~01.02.2026|Betis|Valencia|2|1
Betis|Valencia~09.11.2025|Valencia|Betis|1|1
Betis|Valencia~23.05.2025|Betis|Valencia|1|1
Betis|Valencia~23.11.2024|Valencia|Betis|4|2
Levante|Osasuna~24.08.2026|Osasuna|Levante|0|0
Levante|Osasuna~08.05.2026|Levante|Osasuna|3|2
Levante|Osasuna~08.12.2025|Osasuna|Levante|2|0
Levante|Osasuna~19.03.2022|Osasuna|Levante|3|1
Levante|Osasuna~05.12.2021|Levante|Osasuna|0|0
Deportivo|Malaga~24.08.2026|Malaga|Deportivo|1|1
Getafe|Racing Santander~23.08.2026|Getafe|Racing Santander|1|0
Barcelona|Elche~23.08.2026|Elche|Barcelona|0|5
Barcelona|Elche~31.01.2026|Elche|Barcelona|1|3
Barcelona|Elche~02.11.2025|Barcelona|Elche|3|1
Barcelona|Elche~01.04.2023|Elche|Barcelona|0|4
Barcelona|Elche~17.09.2022|Barcelona|Elche|3|0
Atletico Madrid|Villarreal~23.08.2026|Atletico Madrid|Villarreal|2|2
Atletico Madrid|Villarreal~24.05.2026|Villarreal|Atletico Madrid|5|1
Atletico Madrid|Villarreal~13.09.2025|Atletico Madrid|Villarreal|2|0
Atletico Madrid|Villarreal~25.01.2025|Atletico Madrid|Villarreal|1|1
Atletico Madrid|Villarreal~19.08.2024|Villarreal|Atletico Madrid|2|2
Celta|Valencia~22.08.2026|Valencia|Celta|0|0
Celta|Valencia~05.04.2026|Valencia|Celta|2|3
Celta|Valencia~03.01.2026|Celta|Valencia|4|1
Celta|Valencia~02.02.2025|Valencia|Celta|2|1
Celta|Valencia~23.08.2024|Celta|Valencia|3|1
Espanyol|Real Madrid~22.08.2026|Espanyol|Real Madrid|1|2
Espanyol|Real Madrid~03.05.2026|Espanyol|Real Madrid|0|2
Espanyol|Real Madrid~20.09.2025|Real Madrid|Espanyol|2|0
Espanyol|Real Madrid~01.02.2025|Espanyol|Real Madrid|1|0
Espanyol|Real Madrid~21.09.2024|Real Madrid|Espanyol|4|1
Athletic|Sevilla~22.08.2026|Athletic|Sevilla|1|3
Athletic|Sevilla~24.01.2026|Sevilla|Athletic|2|1
Athletic|Sevilla~17.08.2025|Athletic|Sevilla|3|2
Athletic|Sevilla~16.03.2025|Sevilla|Athletic|0|1
Athletic|Sevilla~29.09.2024|Athletic|Sevilla|1|1
Betis|Real Sociedad~21.08.2026|Betis|Real Sociedad|1|0
Betis|Real Sociedad~09.05.2026|Real Sociedad|Betis|2|2
Betis|Real Sociedad~19.09.2025|Betis|Real Sociedad|3|1
Betis|Real Sociedad~16.02.2025|Betis|Real Sociedad|3|0
Betis|Real Sociedad~01.12.2024|Real Sociedad|Betis|2|0
Alaves|Rayo~20.08.2026|Rayo|Alaves|1|1
Alaves|Rayo~23.05.2026|Alaves|Rayo|1|2
Alaves|Rayo~26.10.2025|Rayo|Alaves|1|0
Alaves|Rayo~29.03.2025|Alaves|Rayo|0|2
Alaves|Rayo~26.10.2024|Rayo|Alaves|1|0
Atletico Madrid|Malaga~19.08.2026|Atletico Madrid|Malaga|2|0
Deportivo|Elche~17.08.2026|Deportivo|Elche|1|1
Racing Santander|Villarreal~16.08.2026|Racing Santander|Villarreal|2|2
Espanyol|Levante~16.08.2026|Espanyol|Levante|3|0
Espanyol|Levante~27.04.2026|Espanyol|Levante|0|0
Espanyol|Levante~11.01.2026|Levante|Espanyol|1|1
Espanyol|Levante~12.03.2022|Levante|Espanyol|1|1
Espanyol|Levante~11.12.2021|Espanyol|Levante|4|3
Rayo|Sevilla~15.08.2026|Sevilla|Rayo|2|1
Rayo|Sevilla~08.03.2026|Sevilla|Rayo|1|1
Rayo|Sevilla~28.09.2025|Rayo|Sevilla|0|1
Rayo|Sevilla~01.03.2025|Rayo|Sevilla|1|1
Rayo|Sevilla~24.11.2024|Sevilla|Rayo|1|0
Alaves|Getafe~15.08.2026|Alaves|Getafe|3|0
Alaves|Getafe~08.02.2026|Alaves|Getafe|0|2
Alaves|Getafe~24.09.2025|Getafe|Alaves|1|1
Alaves|Getafe~09.02.2025|Alaves|Getafe|0|1
Alaves|Getafe~28.09.2024|Getafe|Alaves|2|0
Athletic|Real Madrid~23.05.2026|Real Madrid|Athletic|4|2
Athletic|Real Madrid~03.12.2025|Athletic|Real Madrid|0|3
Athletic|Real Madrid~20.04.2025|Real Madrid|Athletic|1|0
Athletic|Real Madrid~04.12.2024|Athletic|Real Madrid|2|1
Athletic|Real Madrid~31.03.2024|Real Madrid|Athletic|2|0
Celta|Sevilla~23.05.2026|Celta|Sevilla|1|0
Celta|Sevilla~12.01.2026|Sevilla|Celta|0|1
Celta|Sevilla~10.05.2025|Celta|Sevilla|3|2
Celta|Sevilla~14.12.2024|Sevilla|Celta|1|0
Celta|Sevilla~17.03.2024|Sevilla|Celta|1|2
Rayo|Villarreal~17.05.2026|Rayo|Villarreal|2|0
Rayo|Villarreal~01.11.2025|Villarreal|Rayo|4|0
Rayo|Villarreal~22.02.2025|Rayo|Villarreal|0|1
Rayo|Villarreal~18.12.2024|Villarreal|Rayo|1|1
Rayo|Villarreal~28.04.2024|Villarreal|Rayo|3|0
Elche|Getafe~17.05.2026|Elche|Getafe|1|0
Elche|Getafe~28.11.2025|Getafe|Elche|1|0
Elche|Getafe~20.05.2023|Getafe|Elche|1|1
Elche|Getafe~31.10.2022|Elche|Getafe|0|1
Elche|Getafe~22.05.2022|Elche|Getafe|3|1
Rayo|Valencia~14.05.2026|Valencia|Rayo|1|1
Rayo|Valencia~01.12.2025|Rayo|Valencia|1|1
Rayo|Valencia~19.04.2025|Rayo|Valencia|1|1
Rayo|Valencia~07.12.2024|Valencia|Rayo|0|1
Rayo|Valencia~12.05.2024|Valencia|Rayo|0|0
Sevilla|Villarreal~13.05.2026|Villarreal|Sevilla|2|3
Sevilla|Villarreal~23.09.2025|Sevilla|Villarreal|1|2
Sevilla|Villarreal~25.05.2025|Villarreal|Sevilla|4|2
Sevilla|Villarreal~23.08.2024|Sevilla|Villarreal|1|2
Sevilla|Villarreal~11.05.2024|Villarreal|Sevilla|3|2
Athletic|Espanyol~13.05.2026|Espanyol|Athletic|2|0
Athletic|Espanyol~22.12.2025|Athletic|Espanyol|1|2
Athletic|Espanyol~16.02.2025|Espanyol|Athletic|1|1
Athletic|Espanyol~19.10.2024|Athletic|Espanyol|4|1
Athletic|Espanyol~08.04.2023|Espanyol|Athletic|1|2
Alaves|Barcelona~13.05.2026|Alaves|Barcelona|1|0
Alaves|Barcelona~29.11.2025|Barcelona|Alaves|3|1
Alaves|Barcelona~02.02.2025|Barcelona|Alaves|1|0
Alaves|Barcelona~06.10.2024|Alaves|Barcelona|0|3
Alaves|Barcelona~03.02.2024|Alaves|Barcelona|1|3
Celta|Levante~12.05.2026|Celta|Levante|2|3
Celta|Levante~02.11.2025|Levante|Celta|1|2
Celta|Levante~21.02.2022|Celta|Levante|1|1
Celta|Levante~21.09.2021|Levante|Celta|0|2
Betis|Elche~12.05.2026|Betis|Elche|2|1
Betis|Elche~18.08.2025|Elche|Betis|1|1
Betis|Elche~24.02.2023|Elche|Betis|2|3
Betis|Elche~15.08.2022|Betis|Elche|3|0
Betis|Elche~19.04.2022|Betis|Elche|0|1
Alaves|Elche~09.05.2026|Elche|Alaves|1|1
Alaves|Elche~05.10.2025|Alaves|Elche|3|1
Alaves|Elche~05.02.2022|Elche|Alaves|3|1
Alaves|Elche~26.10.2021|Alaves|Elche|1|0
Atletico Madrid|Celta~09.05.2026|Atletico Madrid|Celta|0|1
Atletico Madrid|Celta~05.10.2025|Celta|Atletico Madrid|1|1
Atletico Madrid|Celta~15.02.2025|Atletico Madrid|Celta|1|1
Atletico Madrid|Celta~26.09.2024|Celta|Atletico Madrid|0|1
Atletico Madrid|Celta~12.05.2024|Atletico Madrid|Celta|1|0
Real Sociedad|Sevilla~04.05.2026|Sevilla|Real Sociedad|1|0
Real Sociedad|Sevilla~24.10.2025|Real Sociedad|Sevilla|2|1
Real Sociedad|Sevilla~09.03.2025|Real Sociedad|Sevilla|0|1
Real Sociedad|Sevilla~03.11.2024|Sevilla|Real Sociedad|0|2
Real Sociedad|Sevilla~02.03.2024|Sevilla|Real Sociedad|3|2
Atletico Madrid|Valencia~02.05.2026|Valencia|Atletico Madrid|0|2
Atletico Madrid|Valencia~13.12.2025|Atletico Madrid|Valencia|2|1
Atletico Madrid|Valencia~22.02.2025|Valencia|Atletico Madrid|0|3
Atletico Madrid|Valencia~15.09.2024|Atletico Madrid|Valencia|3|0
Atletico Madrid|Valencia~28.01.2024|Atletico Madrid|Valencia|2|0
Barcelona|Osasuna~02.05.2026|Osasuna|Barcelona|1|2
Barcelona|Osasuna~13.12.2025|Barcelona|Osasuna|2|0
Barcelona|Osasuna~27.03.2025|Barcelona|Osasuna|3|0
Barcelona|Osasuna~28.09.2024|Osasuna|Barcelona|4|2
Barcelona|Osasuna~31.01.2024|Barcelona|Osasuna|1|0
Celta|Villarreal~26.04.2026|Villarreal|Celta|2|1
Celta|Villarreal~31.08.2025|Celta|Villarreal|1|1
Celta|Villarreal~23.04.2025|Celta|Villarreal|3|0
Celta|Villarreal~26.08.2024|Villarreal|Celta|4|3
Celta|Villarreal~05.05.2024|Celta|Villarreal|3|2
Rayo|Real Sociedad~26.04.2026|Rayo|Real Sociedad|3|3
Rayo|Real Sociedad~05.10.2025|Real Sociedad|Rayo|0|1
Rayo|Real Sociedad~16.03.2025|Rayo|Real Sociedad|2|2
Rayo|Real Sociedad~18.08.2024|Real Sociedad|Rayo|1|2
Rayo|Real Sociedad~27.01.2024|Real Sociedad|Rayo|0|0
Getafe|Real Sociedad~22.04.2026|Real Sociedad|Getafe|0|1
Getafe|Real Sociedad~09.01.2026|Getafe|Real Sociedad|1|2
Getafe|Real Sociedad~26.01.2025|Real Sociedad|Getafe|0|3
Getafe|Real Sociedad~01.09.2024|Getafe|Real Sociedad|0|0
Getafe|Real Sociedad~21.04.2024|Getafe|Real Sociedad|1|1
Atletico Madrid|Elche~22.04.2026|Elche|Atletico Madrid|3|2
Atletico Madrid|Elche~23.08.2025|Atletico Madrid|Elche|1|1
Atletico Madrid|Elche~14.05.2023|Elche|Atletico Madrid|1|0
Atletico Madrid|Elche~29.12.2022|Atletico Madrid|Elche|2|0
Atletico Madrid|Elche~11.05.2022|Elche|Atletico Madrid|0|2
Barcelona|Celta~22.04.2026|Barcelona|Celta|1|0
Barcelona|Celta~09.11.2025|Celta|Barcelona|2|4
Barcelona|Celta~19.04.2025|Barcelona|Celta|4|3
Barcelona|Celta~23.11.2024|Celta|Barcelona|2|2
Barcelona|Celta~17.02.2024|Celta|Barcelona|1|2
Alaves|Real Madrid~21.04.2026|Real Madrid|Alaves|2|1
Alaves|Real Madrid~14.12.2025|Alaves|Real Madrid|1|2
Alaves|Real Madrid~13.04.2025|Alaves|Real Madrid|0|1
Alaves|Real Madrid~24.09.2024|Real Madrid|Alaves|3|2
Alaves|Real Madrid~14.05.2024|Real Madrid|Alaves|5|0
Athletic|Osasuna~21.04.2026|Athletic|Osasuna|1|0
Athletic|Osasuna~03.01.2026|Osasuna|Athletic|1|1
Athletic|Osasuna~30.03.2025|Athletic|Osasuna|0|0
Athletic|Osasuna~21.12.2024|Osasuna|Athletic|1|2
Athletic|Osasuna~11.05.2024|Athletic|Osasuna|2|2
Getafe|Levante~13.04.2026|Levante|Getafe|1|0
Getafe|Levante~27.09.2025|Getafe|Levante|1|1
Getafe|Levante~04.02.2022|Getafe|Levante|3|0
Getafe|Levante~16.10.2021|Levante|Getafe|0|0
Athletic|Villarreal~12.04.2026|Athletic|Villarreal|1|2
Athletic|Villarreal~27.09.2025|Villarreal|Athletic|1|0
Athletic|Villarreal~06.04.2025|Villarreal|Athletic|0|0
Athletic|Villarreal~08.12.2024|Athletic|Villarreal|2|0
Athletic|Villarreal~14.04.2024|Athletic|Villarreal|1|1
Alaves|Real Sociedad~11.04.2026|Real Sociedad|Alaves|3|3
Alaves|Real Sociedad~06.12.2025|Alaves|Real Sociedad|1|0
Alaves|Real Sociedad~23.04.2025|Alaves|Real Sociedad|1|0
Alaves|Real Sociedad~28.08.2024|Real Sociedad|Alaves|1|2
Alaves|Real Sociedad~31.03.2024|Alaves|Real Sociedad|0|1
Elche|Valencia~11.04.2026|Elche|Valencia|1|0
Elche|Valencia~10.01.2026|Valencia|Elche|1|1
Elche|Valencia~23.04.2023|Elche|Valencia|0|2
Elche|Valencia~15.10.2022|Valencia|Elche|2|2
Elche|Valencia~19.03.2022|Elche|Valencia|0|1
Barcelona|Espanyol~11.04.2026|Barcelona|Espanyol|4|1
Barcelona|Espanyol~03.01.2026|Espanyol|Barcelona|0|2
Barcelona|Espanyol~15.05.2025|Espanyol|Barcelona|0|2
Barcelona|Espanyol~03.11.2024|Barcelona|Espanyol|3|1
Barcelona|Espanyol~14.05.2023|Espanyol|Barcelona|2|4
Betis|Espanyol~04.04.2026|Betis|Espanyol|0|0
Betis|Espanyol~05.10.2025|Espanyol|Betis|1|2
Betis|Espanyol~04.05.2025|Espanyol|Betis|1|2
Betis|Espanyol~29.09.2024|Betis|Espanyol|1|0
Betis|Espanyol~15.04.2023|Betis|Espanyol|3|1
Atletico Madrid|Barcelona~04.04.2026|Atletico Madrid|Barcelona|1|2
Atletico Madrid|Barcelona~02.12.2025|Barcelona|Atletico Madrid|3|1
Atletico Madrid|Barcelona~16.03.2025|Atletico Madrid|Barcelona|2|4
Atletico Madrid|Barcelona~21.12.2024|Barcelona|Atletico Madrid|1|2
Atletico Madrid|Barcelona~17.03.2024|Atletico Madrid|Barcelona|0|3
Athletic|Betis~22.03.2026|Athletic|Betis|2|1
Athletic|Betis~31.08.2025|Betis|Athletic|1|2
Athletic|Betis~02.02.2025|Betis|Athletic|2|2
Athletic|Betis~03.11.2024|Athletic|Betis|1|1
Athletic|Betis~25.02.2024|Betis|Athletic|3|1
Espanyol|Getafe~21.03.2026|Espanyol|Getafe|1|2
Espanyol|Getafe~13.12.2025|Getafe|Espanyol|0|1
Espanyol|Getafe~18.04.2025|Espanyol|Getafe|1|0
Espanyol|Getafe~09.12.2024|Getafe|Espanyol|1|0
Espanyol|Getafe~30.04.2023|Espanyol|Getafe|1|0
Real Sociedad|Villarreal~20.03.2026|Villarreal|Real Sociedad|3|1
Real Sociedad|Villarreal~30.11.2025|Real Sociedad|Villarreal|2|3
Real Sociedad|Villarreal~20.04.2025|Villarreal|Real Sociedad|2|2
Real Sociedad|Villarreal~13.01.2025|Real Sociedad|Villarreal|1|0
Real Sociedad|Villarreal~23.02.2024|Real Sociedad|Villarreal|1|3
Levante|Rayo~16.03.2026|Rayo|Levante|1|1
Levante|Rayo~19.10.2025|Levante|Rayo|0|3
Levante|Rayo~20.05.2022|Rayo|Levante|2|4
Levante|Rayo~11.09.2021|Levante|Rayo|1|1
Osasuna|Real Sociedad~15.03.2026|Real Sociedad|Osasuna|3|1
Osasuna|Real Sociedad~22.11.2025|Osasuna|Real Sociedad|1|3
Osasuna|Real Sociedad~02.02.2025|Osasuna|Real Sociedad|2|1
Osasuna|Real Sociedad~27.10.2024|Real Sociedad|Osasuna|0|2
Osasuna|Real Sociedad~10.02.2024|Real Sociedad|Osasuna|0|1
Atletico Madrid|Getafe~14.03.2026|Atletico Madrid|Getafe|1|0
Atletico Madrid|Getafe~23.11.2025|Getafe|Atletico Madrid|0|1
Atletico Madrid|Getafe~09.03.2025|Getafe|Atletico Madrid|2|1
Atletico Madrid|Getafe~15.12.2024|Atletico Madrid|Getafe|1|0
Atletico Madrid|Getafe~15.05.2024|Getafe|Atletico Madrid|0|3
Celta|Real Madrid~06.03.2026|Celta|Real Madrid|1|2
Celta|Real Madrid~07.12.2025|Real Madrid|Celta|0|2
Celta|Real Madrid~04.05.2025|Real Madrid|Celta|3|2
Celta|Real Madrid~19.10.2024|Celta|Real Madrid|1|2
Celta|Real Madrid~10.03.2024|Real Madrid|Celta|4|0
Getafe|Real Madrid~02.03.2026|Real Madrid|Getafe|0|1
Getafe|Real Madrid~19.10.2025|Getafe|Real Madrid|0|1
Getafe|Real Madrid~23.04.2025|Getafe|Real Madrid|0|1
Getafe|Real Madrid~01.12.2024|Real Madrid|Getafe|2|0
Getafe|Real Madrid~01.02.2024|Getafe|Real Madrid|0|2
Osasuna|Valencia~01.03.2026|Valencia|Osasuna|1|0
Osasuna|Valencia~24.08.2025|Osasuna|Valencia|1|0
Osasuna|Valencia~02.03.2025|Osasuna|Valencia|3|3
Osasuna|Valencia~24.09.2024|Valencia|Osasuna|0|0
Osasuna|Valencia~15.04.2024|Osasuna|Valencia|0|1
Betis|Sevilla~01.03.2026|Betis|Sevilla|2|2
Betis|Sevilla~30.11.2025|Sevilla|Betis|0|2
Betis|Sevilla~30.03.2025|Betis|Sevilla|2|1
Betis|Sevilla~06.10.2024|Sevilla|Betis|1|0
Betis|Sevilla~28.04.2024|Betis|Sevilla|1|1
Athletic|Rayo~28.02.2026|Rayo|Athletic|1|1
Athletic|Rayo~25.08.2025|Athletic|Rayo|1|0
Athletic|Rayo~13.04.2025|Athletic|Rayo|3|1
Athletic|Rayo~01.12.2024|Rayo|Athletic|1|2
Athletic|Rayo~25.05.2024|Rayo|Athletic|0|1
Barcelona|Villarreal~28.02.2026|Barcelona|Villarreal|4|1
Barcelona|Villarreal~21.12.2025|Villarreal|Barcelona|0|2
Barcelona|Villarreal~18.05.2025|Barcelona|Villarreal|2|3
Barcelona|Villarreal~22.09.2024|Villarreal|Barcelona|1|5
Barcelona|Villarreal~27.01.2024|Barcelona|Villarreal|3|5
Alaves|Levante~27.02.2026|Levante|Alaves|2|0
Alaves|Levante~16.08.2025|Alaves|Levante|2|1
Alaves|Levante~15.05.2022|Levante|Alaves|3|1
Alaves|Levante~06.11.2021|Alaves|Levante|2|1
Getafe|Sevilla~22.02.2026|Getafe|Sevilla|0|1
Getafe|Sevilla~25.08.2025|Sevilla|Getafe|1|2
Getafe|Sevilla~01.02.2025|Getafe|Sevilla|0|0
Getafe|Sevilla~14.09.2024|Sevilla|Getafe|1|0
Getafe|Sevilla~30.03.2024|Getafe|Sevilla|0|1
Osasuna|Real Madrid~21.02.2026|Osasuna|Real Madrid|2|1
Osasuna|Real Madrid~19.08.2025|Real Madrid|Osasuna|1|0
Osasuna|Real Madrid~15.02.2025|Osasuna|Real Madrid|1|1
Osasuna|Real Madrid~09.11.2024|Real Madrid|Osasuna|4|0
Osasuna|Real Madrid~16.03.2024|Osasuna|Real Madrid|2|4
Betis|Rayo~21.02.2026|Betis|Rayo|1|1
Betis|Rayo~15.12.2025|Rayo|Betis|0|0
Betis|Rayo~15.05.2025|Rayo|Betis|2|2
Betis|Rayo~22.12.2024|Betis|Rayo|1|1
Betis|Rayo~17.03.2024|Rayo|Betis|2|0
Atletico Madrid|Rayo~15.02.2026|Rayo|Atletico Madrid|3|0
Atletico Madrid|Rayo~24.09.2025|Atletico Madrid|Rayo|3|2
Atletico Madrid|Rayo~24.04.2025|Atletico Madrid|Rayo|3|0
Atletico Madrid|Rayo~22.09.2024|Rayo|Atletico Madrid|1|1
Atletico Madrid|Rayo~31.01.2024|Atletico Madrid|Rayo|2|1
Levante|Valencia~15.02.2026|Levante|Valencia|0|2
Levante|Valencia~21.11.2025|Valencia|Levante|1|0
Levante|Valencia~30.04.2022|Valencia|Levante|1|1
Levante|Valencia~20.12.2021|Levante|Valencia|3|4
Alaves|Sevilla~14.02.2026|Sevilla|Alaves|1|1
Alaves|Sevilla~20.09.2025|Alaves|Sevilla|1|2
Alaves|Sevilla~20.04.2025|Sevilla|Alaves|1|1
Alaves|Sevilla~20.09.2024|Alaves|Sevilla|2|1
Alaves|Sevilla~12.01.2024|Sevilla|Alaves|2|3
Getafe|Villarreal~14.02.2026|Getafe|Villarreal|2|1
Getafe|Villarreal~06.12.2025|Villarreal|Getafe|2|0
Getafe|Villarreal~30.03.2025|Getafe|Villarreal|1|2
Getafe|Villarreal~20.10.2024|Villarreal|Getafe|1|1
Getafe|Villarreal~16.02.2024|Villarreal|Getafe|1|1
Celta|Espanyol~14.02.2026|Espanyol|Celta|2|2
Celta|Espanyol~30.11.2025|Celta|Espanyol|0|1
Celta|Espanyol~12.04.2025|Celta|Espanyol|0|2
Celta|Espanyol~30.11.2024|Espanyol|Celta|3|1
Celta|Espanyol~18.03.2023|Espanyol|Celta|1|3
Elche|Osasuna~13.02.2026|Elche|Osasuna|0|0
Elche|Osasuna~25.09.2025|Osasuna|Elche|1|1
Elche|Osasuna~08.04.2023|Osasuna|Elche|2|1
Elche|Osasuna~22.01.2023|Elche|Osasuna|1|1
Elche|Osasuna~01.05.2022|Elche|Osasuna|1|1
Espanyol|Villarreal~09.02.2026|Villarreal|Espanyol|4|1
Espanyol|Villarreal~08.11.2025|Espanyol|Villarreal|0|2
Espanyol|Villarreal~27.04.2025|Villarreal|Espanyol|1|0
Espanyol|Villarreal~26.09.2024|Espanyol|Villarreal|1|2
Espanyol|Villarreal~27.04.2023|Villarreal|Espanyol|4|2
Real Madrid|Valencia~08.02.2026|Valencia|Real Madrid|0|2
Real Madrid|Valencia~01.11.2025|Real Madrid|Valencia|4|0
Real Madrid|Valencia~05.04.2025|Real Madrid|Valencia|1|2
Real Madrid|Valencia~03.01.2025|Valencia|Real Madrid|1|2
Real Madrid|Valencia~02.03.2024|Valencia|Real Madrid|2|2
Atletico Madrid|Betis~08.02.2026|Atletico Madrid|Betis|0|1
Atletico Madrid|Betis~27.10.2025|Betis|Atletico Madrid|0|2
Atletico Madrid|Betis~18.05.2025|Atletico Madrid|Betis|4|1
Atletico Madrid|Betis~27.10.2024|Betis|Atletico Madrid|1|0
Atletico Madrid|Betis~03.03.2024|Atletico Madrid|Betis|2|1
Athletic|Real Sociedad~01.02.2026|Athletic|Real Sociedad|1|1
Athletic|Real Sociedad~01.11.2025|Real Sociedad|Athletic|3|2
Athletic|Real Sociedad~04.05.2025|Real Sociedad|Athletic|0|0
Athletic|Real Sociedad~24.11.2024|Athletic|Real Sociedad|1|0
Athletic|Real Sociedad~13.01.2024|Athletic|Real Sociedad|2|1
Osasuna|Villarreal~31.01.2026|Osasuna|Villarreal|2|2
Osasuna|Villarreal~20.09.2025|Villarreal|Osasuna|2|1
Osasuna|Villarreal~03.05.2025|Villarreal|Osasuna|4|2
Osasuna|Villarreal~24.11.2024|Osasuna|Villarreal|2|2
Osasuna|Villarreal~25.05.2024|Osasuna|Villarreal|1|1
Atletico Madrid|Levante~31.01.2026|Levante|Atletico Madrid|0|0
Atletico Madrid|Levante~08.11.2025|Atletico Madrid|Levante|3|1
Atletico Madrid|Levante~16.02.2022|Atletico Madrid|Levante|0|1
Atletico Madrid|Levante~28.10.2021|Levante|Atletico Madrid|2|2
Alaves|Espanyol~30.01.2026|Espanyol|Alaves|1|2
Alaves|Espanyol~02.11.2025|Alaves|Espanyol|2|1
Alaves|Espanyol~22.02.2025|Alaves|Espanyol|0|1
Alaves|Espanyol~14.09.2024|Espanyol|Alaves|3|2
Alaves|Espanyol~11.05.2022|Alaves|Espanyol|2|1
Alaves|Betis~25.01.2026|Alaves|Betis|2|1
Alaves|Betis~22.08.2025|Betis|Alaves|1|0
Alaves|Betis~18.01.2025|Betis|Alaves|1|3
Alaves|Betis~25.08.2024|Alaves|Betis|0|0
Alaves|Betis~18.02.2024|Betis|Alaves|0|0
Espanyol|Valencia~24.01.2026|Valencia|Espanyol|3|2
Espanyol|Valencia~23.09.2025|Espanyol|Valencia|2|2
Espanyol|Valencia~22.04.2025|Valencia|Espanyol|1|1
Espanyol|Valencia~18.12.2024|Espanyol|Valencia|1|1
Espanyol|Valencia~28.05.2023|Valencia|Espanyol|2|2
Elche|Levante~23.01.2026|Levante|Elche|3|2
Elche|Levante~29.08.2025|Elche|Levante|2|0
Elche|Levante~25.02.2022|Levante|Elche|3|0
Elche|Levante~18.09.2021|Elche|Levante|1|1
Elche|Sevilla~19.01.2026|Elche|Sevilla|2|2
Elche|Sevilla~12.09.2025|Sevilla|Elche|2|2
Elche|Sevilla~24.05.2023|Elche|Sevilla|1|1
Elche|Sevilla~28.01.2023|Sevilla|Elche|3|0
Elche|Sevilla~11.02.2022|Sevilla|Elche|2|0
Barcelona|Real Sociedad~18.01.2026|Real Sociedad|Barcelona|2|1
Barcelona|Real Sociedad~28.09.2025|Barcelona|Real Sociedad|2|1
Barcelona|Real Sociedad~02.03.2025|Barcelona|Real Sociedad|4|0
Barcelona|Real Sociedad~10.11.2024|Real Sociedad|Barcelona|1|0
Barcelona|Real Sociedad~13.05.2024|Barcelona|Real Sociedad|2|0
Getafe|Valencia~18.01.2026|Getafe|Valencia|0|1
Getafe|Valencia~29.08.2025|Valencia|Getafe|3|0
Getafe|Valencia~10.05.2025|Valencia|Getafe|3|0
Getafe|Valencia~27.10.2024|Getafe|Valencia|1|1
Getafe|Valencia~09.03.2024|Valencia|Getafe|1|0
Celta|Rayo~18.01.2026|Celta|Rayo|3|0
Celta|Rayo~21.09.2025|Rayo|Celta|1|1
Celta|Rayo~18.05.2025|Celta|Rayo|1|2
Celta|Rayo~10.01.2025|Rayo|Celta|2|1
Celta|Rayo~31.03.2024|Celta|Rayo|0|0
Levante|Real Madrid~17.01.2026|Real Madrid|Levante|2|0
Levante|Real Madrid~23.09.2025|Levante|Real Madrid|1|4
Levante|Real Madrid~12.05.2022|Real Madrid|Levante|6|0
Levante|Real Madrid~22.08.2021|Levante|Real Madrid|3|3`;
LLHH.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
const SAHH=`Frosinone|Lecce~29.10.2026|Frosinone|Lecce|5|1
Frosinone|Lecce~03.03.2024|Frosinone|Lecce|1|1
Frosinone|Lecce~16.12.2023|Lecce|Frosinone|2|1
Atalanta|Fiorentina~29.10.2026|Fiorentina|Atalanta|2|2
Atalanta|Fiorentina~22.05.2026|Fiorentina|Atalanta|1|1
Atalanta|Fiorentina~30.11.2025|Atalanta|Fiorentina|2|0
Atalanta|Fiorentina~30.03.2025|Fiorentina|Atalanta|1|0
Atalanta|Fiorentina~15.09.2024|Atalanta|Fiorentina|3|2
Inter|Venezia~28.10.2026|Venezia|Inter|0|2
Inter|Venezia~12.01.2025|Venezia|Inter|0|1
Inter|Venezia~03.11.2024|Inter|Venezia|1|0
Inter|Venezia~22.01.2022|Inter|Venezia|2|1
Inter|Venezia~27.11.2021|Venezia|Inter|0|2
Parma|Udinese~28.10.2026|Parma|Udinese|0|0
Parma|Udinese~18.04.2026|Udinese|Parma|0|1
Parma|Udinese~29.11.2025|Parma|Udinese|0|2
Parma|Udinese~01.03.2025|Udinese|Parma|1|0
Parma|Udinese~16.09.2024|Parma|Udinese|2|3
Monza|Napoli~28.10.2026|Monza|Napoli|1|4
Monza|Napoli~19.04.2025|Monza|Napoli|0|1
Monza|Napoli~29.09.2024|Napoli|Monza|2|0
Monza|Napoli~07.04.2024|Monza|Napoli|2|4
Monza|Napoli~29.12.2023|Napoli|Monza|0|0
Bologna|Milan~28.10.2026|Milan|Bologna|2|4
Bologna|Milan~03.02.2026|Bologna|Milan|0|3
Bologna|Milan~14.09.2025|Milan|Bologna|1|0
Bologna|Milan~09.05.2025|Milan|Bologna|3|1
Bologna|Milan~27.02.2025|Bologna|Milan|2|1
Genoa|Juventus~28.10.2026|Genoa|Juventus|2|0
Genoa|Juventus~06.04.2026|Juventus|Genoa|2|0
Genoa|Juventus~31.08.2025|Genoa|Juventus|0|1
Genoa|Juventus~29.03.2025|Juventus|Genoa|1|0
Genoa|Juventus~28.09.2024|Genoa|Juventus|0|3
Como|Torino~27.10.2026|Torino|Como|1|3
Como|Torino~24.01.2026|Como|Torino|6|0
Como|Torino~24.11.2025|Torino|Como|1|5
Como|Torino~13.04.2025|Como|Torino|1|0
Como|Torino~25.10.2024|Torino|Como|1|0
Lazio|Sassuolo~27.10.2026|Sassuolo|Lazio|2|6
Lazio|Sassuolo~09.03.2026|Lazio|Sassuolo|2|1
Lazio|Sassuolo~14.09.2025|Sassuolo|Lazio|1|0
Lazio|Sassuolo~26.05.2024|Lazio|Sassuolo|1|1
Lazio|Sassuolo~21.10.2023|Sassuolo|Lazio|0|2
Cagliari|Roma~27.10.2026|Roma|Cagliari|4|2
Cagliari|Roma~09.02.2026|Roma|Cagliari|2|0
Cagliari|Roma~07.12.2025|Cagliari|Roma|1|0
Cagliari|Roma~16.03.2025|Roma|Cagliari|1|0
Cagliari|Roma~18.08.2024|Cagliari|Roma|0|0
Milan|Udinese~25.10.2026|Udinese|Milan|0|2
Milan|Udinese~11.04.2026|Milan|Udinese|0|3
Milan|Udinese~20.09.2025|Udinese|Milan|0|3
Milan|Udinese~11.04.2025|Udinese|Milan|0|4
Milan|Udinese~19.10.2024|Milan|Udinese|1|0
Juventus|Lecce~25.10.2026|Lecce|Juventus|0|2
Juventus|Lecce~09.05.2026|Lecce|Juventus|0|1
Juventus|Lecce~03.01.2026|Juventus|Lecce|1|1
Juventus|Lecce~12.04.2025|Juventus|Lecce|2|1
Juventus|Lecce~01.12.2024|Lecce|Juventus|1|1
Fiorentina|Inter~25.10.2026|Inter|Fiorentina|2|1
Fiorentina|Inter~22.03.2026|Fiorentina|Inter|1|1
Fiorentina|Inter~29.10.2025|Inter|Fiorentina|3|0
Fiorentina|Inter~10.02.2025|Inter|Fiorentina|2|1
Fiorentina|Inter~06.02.2025|Fiorentina|Inter|3|0
Genoa|Venezia~25.10.2026|Genoa|Venezia|1|0
Genoa|Venezia~17.02.2025|Genoa|Venezia|2|0
Genoa|Venezia~21.09.2024|Venezia|Genoa|2|0
Genoa|Venezia~20.02.2022|Venezia|Genoa|1|1
Genoa|Venezia~31.10.2021|Genoa|Venezia|0|0
Atalanta|Frosinone~25.10.2026|Atalanta|Frosinone|4|4
Atalanta|Frosinone~15.01.2024|Atalanta|Frosinone|5|0
Atalanta|Frosinone~26.08.2023|Frosinone|Atalanta|2|1
Napoli|Roma~24.10.2026|Napoli|Roma|3|3
Napoli|Roma~15.02.2026|Napoli|Roma|2|2
Napoli|Roma~30.11.2025|Roma|Napoli|0|1
Napoli|Roma~02.02.2025|Roma|Napoli|1|1
Napoli|Roma~24.11.2024|Napoli|Roma|1|0
Lazio|Parma~24.10.2026|Lazio|Parma|2|1
Lazio|Parma~04.04.2026|Lazio|Parma|1|1
Lazio|Parma~13.12.2025|Parma|Lazio|0|1
Lazio|Parma~28.04.2025|Lazio|Parma|2|2
Lazio|Parma~01.12.2024|Parma|Lazio|3|1
Como|Sassuolo~24.10.2026|Como|Sassuolo|2|0
Como|Sassuolo~17.04.2026|Sassuolo|Como|2|1
Como|Sassuolo~28.11.2025|Como|Sassuolo|2|0
Bologna|Cagliari~24.10.2026|Cagliari|Bologna|0|2
Bologna|Cagliari~03.05.2026|Bologna|Cagliari|0|0
Bologna|Cagliari~19.10.2025|Cagliari|Bologna|0|2
Bologna|Cagliari~02.03.2025|Bologna|Cagliari|2|1
Bologna|Cagliari~29.10.2024|Cagliari|Bologna|0|2
Monza|Torino~23.10.2026|Torino|Monza|3|2
Monza|Torino~02.03.2025|Monza|Torino|0|2
Monza|Torino~24.11.2024|Torino|Monza|1|1
Monza|Torino~30.03.2024|Torino|Monza|1|0
Monza|Torino~11.11.2023|Monza|Torino|1|1
Parma|Torino~19.10.2026|Parma|Torino|0|3
Parma|Torino~13.03.2026|Torino|Parma|4|1
Parma|Torino~29.09.2025|Parma|Torino|2|1
Parma|Torino~08.03.2025|Parma|Torino|2|2
Parma|Torino~05.01.2025|Torino|Parma|0|0
Cagliari|Monza~19.10.2026|Monza|Cagliari|4|0
Cagliari|Monza~30.03.2025|Cagliari|Monza|3|0
Cagliari|Monza~05.01.2025|Monza|Cagliari|1|2
Cagliari|Monza~16.03.2024|Monza|Cagliari|1|0
Cagliari|Monza~26.11.2023|Cagliari|Monza|1|1
Lecce|Udinese~18.10.2026|Udinese|Lecce|0|3
Lecce|Udinese~08.02.2026|Lecce|Udinese|2|1
Lecce|Udinese~25.10.2025|Udinese|Lecce|3|2
Lecce|Udinese~21.02.2025|Lecce|Udinese|0|1
Lecce|Udinese~05.10.2024|Udinese|Lecce|1|0
Atalanta|Milan~18.10.2026|Milan|Atalanta|3|2
Atalanta|Milan~10.05.2026|Milan|Atalanta|2|3
Atalanta|Milan~28.10.2025|Atalanta|Milan|1|1
Atalanta|Milan~20.04.2025|Milan|Atalanta|0|1
Atalanta|Milan~06.12.2024|Atalanta|Milan|2|1
Juventus|Lazio~18.10.2026|Juventus|Lazio|0|3
Juventus|Lazio~08.02.2026|Juventus|Lazio|2|2
Juventus|Lazio~26.10.2025|Lazio|Juventus|1|0
Juventus|Lazio~10.05.2025|Lazio|Juventus|1|1
Juventus|Lazio~19.10.2024|Juventus|Lazio|1|0
Como|Fiorentina~18.10.2026|Fiorentina|Como|1|3
Como|Fiorentina~14.02.2026|Como|Fiorentina|1|2
Como|Fiorentina~21.09.2025|Fiorentina|Como|1|2
Como|Fiorentina~16.02.2025|Fiorentina|Como|0|2
Como|Fiorentina~24.11.2024|Como|Fiorentina|0|2
Napoli|Venezia~17.10.2026|Venezia|Napoli|1|0
Napoli|Venezia~16.03.2025|Venezia|Napoli|0|0
Napoli|Venezia~29.12.2024|Napoli|Venezia|1|0
Napoli|Venezia~06.02.2022|Venezia|Napoli|0|2
Napoli|Venezia~22.08.2021|Napoli|Venezia|2|0
Genoa|Roma~17.10.2026|Roma|Genoa|2|0
Genoa|Roma~08.03.2026|Genoa|Roma|2|1
Genoa|Roma~29.12.2025|Roma|Genoa|3|1
Genoa|Roma~17.01.2025|Roma|Genoa|3|1
Genoa|Roma~15.09.2024|Genoa|Roma|1|1
Bologna|Inter~17.10.2026|Bologna|Inter|1|3
Bologna|Inter~23.05.2026|Bologna|Inter|3|3
Bologna|Inter~04.01.2026|Inter|Bologna|3|1
Bologna|Inter~20.04.2025|Bologna|Inter|1|0
Bologna|Inter~15.01.2025|Inter|Bologna|2|2
Frosinone|Sassuolo~16.10.2026|Frosinone|Sassuolo|4|2
Frosinone|Sassuolo~09.03.2024|Sassuolo|Frosinone|1|0
Frosinone|Sassuolo~17.09.2023|Frosinone|Sassuolo|4|2
Torino|Udinese~12.10.2026|Torino|Udinese|2|1
Torino|Udinese~02.05.2026|Udinese|Torino|2|0
Torino|Udinese~07.01.2026|Torino|Udinese|1|2
Torino|Udinese~23.04.2025|Torino|Udinese|2|0
Torino|Udinese~29.12.2024|Udinese|Torino|2|2
Atalanta|Venezia~12.10.2026|Atalanta|Venezia|3|1
Atalanta|Venezia~01.03.2025|Atalanta|Venezia|0|0
Atalanta|Venezia~20.10.2024|Venezia|Atalanta|0|2
Atalanta|Venezia~23.04.2022|Venezia|Atalanta|1|3
Atalanta|Venezia~30.11.2021|Atalanta|Venezia|4|0
Milan|Sassuolo~11.10.2026|Sassuolo|Milan|1|1
Milan|Sassuolo~03.05.2026|Sassuolo|Milan|2|0
Milan|Sassuolo~14.12.2025|Milan|Sassuolo|2|2
Milan|Sassuolo~14.04.2024|Sassuolo|Milan|3|3
Milan|Sassuolo~30.12.2023|Milan|Sassuolo|1|0
Bologna|Lecce~11.10.2026|Lecce|Bologna|1|2
Bologna|Lecce~12.04.2026|Bologna|Lecce|2|0
Bologna|Lecce~28.09.2025|Lecce|Bologna|2|2
Bologna|Lecce~09.02.2025|Lecce|Bologna|0|0
Bologna|Lecce~02.11.2024|Bologna|Lecce|1|0
Lazio|Monza~11.10.2026|Lazio|Monza|3|1
Lazio|Monza~09.02.2025|Lazio|Monza|5|1
Lazio|Monza~10.11.2024|Monza|Lazio|0|1
Lazio|Monza~04.05.2024|Monza|Lazio|2|2
Lazio|Monza~23.09.2023|Lazio|Monza|1|1
Como|Roma~11.10.2026|Como|Roma|0|0
Como|Roma~15.03.2026|Como|Roma|2|1
Como|Roma~15.12.2025|Roma|Como|1|0
Como|Roma~02.03.2025|Roma|Como|2|1
Como|Roma~15.12.2024|Como|Roma|2|0
Cagliari|Juventus~11.10.2026|Cagliari|Juventus|1|1
Cagliari|Juventus~17.01.2026|Cagliari|Juventus|1|0
Cagliari|Juventus~29.11.2025|Juventus|Cagliari|2|1
Cagliari|Juventus~23.02.2025|Cagliari|Juventus|0|1
Cagliari|Juventus~06.10.2024|Juventus|Cagliari|1|1
Frosinone|Napoli~10.10.2026|Napoli|Frosinone|3|0
Frosinone|Napoli~14.04.2024|Napoli|Frosinone|2|2
Frosinone|Napoli~19.08.2023|Frosinone|Napoli|1|3
Inter|Parma~10.10.2026|Inter|Parma|3|0
Inter|Parma~03.05.2026|Inter|Parma|2|0
Inter|Parma~07.01.2026|Parma|Inter|0|2
Inter|Parma~05.04.2025|Parma|Inter|2|2
Inter|Parma~06.12.2024|Inter|Parma|3|1
Fiorentina|Genoa~10.10.2026|Genoa|Fiorentina|2|1
Fiorentina|Genoa~10.05.2026|Fiorentina|Genoa|0|0
Fiorentina|Genoa~09.11.2025|Genoa|Fiorentina|2|2
Fiorentina|Genoa~02.02.2025|Fiorentina|Genoa|2|1
Fiorentina|Genoa~31.10.2024|Genoa|Fiorentina|0|1
Genoa|Parma~20.09.2026|Parma|Genoa|2|1
Genoa|Parma~18.01.2026|Parma|Genoa|0|0
Genoa|Parma~19.10.2025|Genoa|Parma|0|0
Genoa|Parma~12.01.2025|Genoa|Parma|1|0
Genoa|Parma~04.11.2024|Parma|Genoa|0|1
Lecce|Milan~20.09.2026|Milan|Lecce|3|0
Lecce|Milan~18.01.2026|Milan|Lecce|1|0
Lecce|Milan~29.08.2025|Lecce|Milan|0|2
Lecce|Milan~08.03.2025|Lecce|Milan|2|3
Lecce|Milan~27.09.2024|Milan|Lecce|3|0
Atalanta|Juventus~20.09.2026|Juventus|Atalanta|2|0
Atalanta|Juventus~11.04.2026|Atalanta|Juventus|0|1
Atalanta|Juventus~27.09.2025|Juventus|Atalanta|1|1
Atalanta|Juventus~09.03.2025|Juventus|Atalanta|0|4
Atalanta|Juventus~14.01.2025|Atalanta|Juventus|1|1
Como|Frosinone~20.09.2026|Frosinone|Como|2|0
Fiorentina|Napoli~20.09.2026|Fiorentina|Napoli|1|1
Fiorentina|Napoli~31.01.2026|Napoli|Fiorentina|2|1
Fiorentina|Napoli~13.09.2025|Fiorentina|Napoli|1|3
Fiorentina|Napoli~09.03.2025|Napoli|Fiorentina|2|1
Fiorentina|Napoli~04.01.2025|Fiorentina|Napoli|0|3
Lazio|Venezia~19.09.2026|Venezia|Lazio|0|2
Lazio|Venezia~22.02.2025|Venezia|Lazio|0|0
Lazio|Venezia~18.08.2024|Lazio|Venezia|3|1
Lazio|Venezia~14.03.2022|Lazio|Venezia|1|0
Lazio|Venezia~22.12.2021|Venezia|Lazio|1|3
Cagliari|Udinese~19.09.2026|Udinese|Cagliari|0|1
Cagliari|Udinese~09.05.2026|Cagliari|Udinese|0|2
Cagliari|Udinese~05.10.2025|Udinese|Cagliari|1|1
Cagliari|Udinese~03.05.2025|Cagliari|Udinese|1|2
Cagliari|Udinese~25.10.2024|Udinese|Cagliari|2|0
Inter|Roma~19.09.2026|Roma|Inter|2|2
Inter|Roma~05.04.2026|Inter|Roma|5|2
Inter|Roma~18.10.2025|Roma|Inter|0|1
Inter|Roma~27.04.2025|Inter|Roma|0|1
Inter|Roma~20.10.2024|Roma|Inter|0|1
Bologna|Torino~19.09.2026|Bologna|Torino|1|1
Bologna|Torino~15.02.2026|Torino|Bologna|1|2
Bologna|Torino~29.10.2025|Bologna|Torino|0|0
Bologna|Torino~14.02.2025|Bologna|Torino|3|2
Bologna|Torino~21.12.2024|Torino|Bologna|0|2
Monza|Sassuolo~18.09.2026|Monza|Sassuolo|2|1
Monza|Sassuolo~28.01.2024|Monza|Sassuolo|1|0
Monza|Sassuolo~02.10.2023|Sassuolo|Monza|0|1
Monza|Sassuolo~19.05.2023|Sassuolo|Monza|1|2
Monza|Sassuolo~22.01.2023|Monza|Sassuolo|1|1
Roma|Torino~14.09.2026|Torino|Roma|0|2
Roma|Torino~18.01.2026|Torino|Roma|0|2
Roma|Torino~14.09.2025|Roma|Torino|0|1
Roma|Torino~25.05.2025|Torino|Roma|0|2
Roma|Torino~31.10.2024|Roma|Torino|1|0
Inter|Udinese~14.09.2026|Inter|Udinese|5|3
Inter|Udinese~17.01.2026|Udinese|Inter|0|1
Inter|Udinese~31.08.2025|Inter|Udinese|1|2
Inter|Udinese~30.03.2025|Inter|Udinese|2|1
Inter|Udinese~28.09.2024|Udinese|Inter|2|3
Como|Parma~14.09.2026|Como|Parma|2|1
Como|Parma~17.05.2026|Como|Parma|1|0
Como|Parma~25.10.2025|Parma|Como|0|0
Como|Parma~03.05.2025|Parma|Como|0|1
Como|Parma~19.10.2024|Como|Parma|1|1
Juventus|Sassuolo~13.09.2026|Sassuolo|Juventus|3|2
Juventus|Sassuolo~21.03.2026|Juventus|Sassuolo|1|1
Juventus|Sassuolo~06.01.2026|Sassuolo|Juventus|0|3
Juventus|Sassuolo~16.01.2024|Juventus|Sassuolo|3|0
Juventus|Sassuolo~23.09.2023|Sassuolo|Juventus|4|2
Bologna|Napoli~13.09.2026|Napoli|Bologna|1|0
Bologna|Napoli~11.05.2026|Napoli|Bologna|2|3
Bologna|Napoli~09.11.2025|Bologna|Napoli|2|0
Bologna|Napoli~07.04.2025|Bologna|Napoli|1|1
Bologna|Napoli~25.08.2024|Napoli|Bologna|3|0
Lecce|Monza~13.09.2026|Lecce|Monza|3|2
Lecce|Monza~16.02.2025|Monza|Lecce|0|0
Lecce|Monza~15.12.2024|Lecce|Monza|2|1
Lecce|Monza~27.04.2024|Lecce|Monza|1|1
Lecce|Monza~17.09.2023|Monza|Lecce|1|1
Lazio|Milan~12.09.2026|Lazio|Milan|2|2
Lazio|Milan~15.03.2026|Lazio|Milan|1|0
Lazio|Milan~29.11.2025|Milan|Lazio|1|0
Lazio|Milan~02.03.2025|Milan|Lazio|1|2
Lazio|Milan~31.08.2024|Lazio|Milan|2|2
Frosinone|Genoa~12.09.2026|Genoa|Frosinone|1|1
Frosinone|Genoa~30.03.2024|Genoa|Frosinone|1|1
Frosinone|Genoa~26.11.2023|Frosinone|Genoa|2|1
Atalanta|Cagliari~12.09.2026|Atalanta|Cagliari|1|2
Atalanta|Cagliari~27.04.2026|Cagliari|Atalanta|3|2
Atalanta|Cagliari~13.12.2025|Atalanta|Cagliari|2|1
Atalanta|Cagliari~15.02.2025|Atalanta|Cagliari|0|0
Atalanta|Cagliari~14.12.2024|Cagliari|Atalanta|0|1
Fiorentina|Venezia~11.09.2026|Venezia|Fiorentina|2|4
Fiorentina|Venezia~12.05.2025|Venezia|Fiorentina|2|1
Fiorentina|Venezia~25.08.2024|Fiorentina|Venezia|0|0
Fiorentina|Venezia~16.04.2022|Fiorentina|Venezia|1|0
Fiorentina|Venezia~18.10.2021|Venezia|Fiorentina|1|0
Lazio|Udinese~07.09.2026|Udinese|Lazio|1|2
Lazio|Udinese~27.04.2026|Lazio|Udinese|3|3
Lazio|Udinese~27.12.2025|Udinese|Lazio|1|1
Lazio|Udinese~10.03.2025|Lazio|Udinese|1|1
Lazio|Udinese~24.08.2024|Udinese|Lazio|2|1
Cagliari|Lecce~07.09.2026|Cagliari|Lecce|1|0
Cagliari|Lecce~16.02.2026|Cagliari|Lecce|0|2
Cagliari|Lecce~19.09.2025|Lecce|Cagliari|1|2
Cagliari|Lecce~19.01.2025|Cagliari|Lecce|4|1
Cagliari|Lecce~31.08.2024|Lecce|Cagliari|1|0
Monza|Parma~06.09.2026|Parma|Monza|1|1
Monza|Parma~15.03.2025|Monza|Parma|1|1
Monza|Parma~28.12.2024|Parma|Monza|2|1
Juventus|Milan~06.09.2026|Juventus|Milan|1|1
Juventus|Milan~26.04.2026|Milan|Juventus|0|0
Juventus|Milan~05.10.2025|Juventus|Milan|0|0
Juventus|Milan~18.01.2025|Juventus|Milan|2|0
Juventus|Milan~23.11.2024|Milan|Juventus|0|0
Frosinone|Venezia~06.09.2026|Frosinone|Venezia|3|2
Bologna|Sassuolo~06.09.2026|Bologna|Sassuolo|2|2
Bologna|Sassuolo~15.03.2026|Sassuolo|Bologna|0|1
Bologna|Sassuolo~28.12.2025|Bologna|Sassuolo|1|1
Bologna|Sassuolo~03.02.2024|Bologna|Sassuolo|4|2
Bologna|Sassuolo~28.10.2023|Sassuolo|Bologna|1|1
Atalanta|Roma~05.09.2026|Roma|Atalanta|2|1
Atalanta|Roma~18.04.2026|Roma|Atalanta|1|1
Atalanta|Roma~03.01.2026|Atalanta|Roma|1|0
Atalanta|Roma~12.05.2025|Atalanta|Roma|2|1
Atalanta|Roma~02.12.2024|Roma|Atalanta|0|2
Inter|Napoli~05.09.2026|Inter|Napoli|3|2
Inter|Napoli~11.01.2026|Inter|Napoli|2|2
Inter|Napoli~25.10.2025|Napoli|Inter|3|1
Inter|Napoli~01.03.2025|Napoli|Inter|1|1
Inter|Napoli~10.11.2024|Inter|Napoli|1|1
Fiorentina|Torino~05.09.2026|Fiorentina|Torino|1|2
Fiorentina|Torino~07.02.2026|Fiorentina|Torino|2|2
Fiorentina|Torino~31.08.2025|Torino|Fiorentina|0|0
Fiorentina|Torino~19.01.2025|Fiorentina|Torino|1|1
Fiorentina|Torino~03.11.2024|Torino|Fiorentina|0|1
Como|Genoa~04.09.2026|Genoa|Como|1|4
Como|Genoa~26.04.2026|Genoa|Como|0|2
Como|Genoa~15.09.2025|Como|Genoa|1|1
Como|Genoa~27.04.2025|Como|Genoa|1|0
Como|Genoa~07.11.2024|Genoa|Como|1|1
Lecce|Roma~31.08.2026|Lecce|Roma|0|4
Lecce|Roma~22.03.2026|Roma|Lecce|1|0
Lecce|Roma~06.01.2026|Lecce|Roma|0|2
Lecce|Roma~29.03.2025|Lecce|Roma|0|1
Lecce|Roma~07.12.2024|Roma|Lecce|4|1
Atalanta|Bologna~31.08.2026|Atalanta|Bologna|1|0
Atalanta|Bologna~17.05.2026|Atalanta|Bologna|0|1
Atalanta|Bologna~07.01.2026|Bologna|Atalanta|0|2
Atalanta|Bologna~13.04.2025|Atalanta|Bologna|2|0
Atalanta|Bologna~28.09.2024|Bologna|Atalanta|1|1
Como|Napoli~30.08.2026|Napoli|Como|1|2
Como|Napoli~02.05.2026|Como|Napoli|0|0
Como|Napoli~01.11.2025|Napoli|Como|0|0
Como|Napoli~23.02.2025|Como|Napoli|2|1
Como|Napoli~04.10.2024|Napoli|Como|3|1
Genoa|Lazio~30.08.2026|Lazio|Genoa|1|0
Genoa|Lazio~30.01.2026|Lazio|Genoa|3|2
Genoa|Lazio~29.09.2025|Genoa|Lazio|0|3
Genoa|Lazio~23.04.2025|Genoa|Lazio|0|2
Genoa|Lazio~27.10.2024|Lazio|Genoa|3|0
Cagliari|Inter~30.08.2026|Cagliari|Inter|0|1
Cagliari|Inter~17.04.2026|Inter|Cagliari|3|0
Cagliari|Inter~27.09.2025|Cagliari|Inter|0|2
Cagliari|Inter~12.04.2025|Inter|Cagliari|3|1
Cagliari|Inter~28.12.2024|Cagliari|Inter|0|3
Sassuolo|Torino~29.08.2026|Sassuolo|Torino|2|1
Sassuolo|Torino~08.05.2026|Torino|Sassuolo|2|1
Sassuolo|Torino~21.12.2025|Sassuolo|Torino|0|1
Sassuolo|Torino~10.02.2024|Sassuolo|Torino|1|1
Sassuolo|Torino~06.11.2023|Torino|Sassuolo|2|1
Monza|Udinese~29.08.2026|Monza|Udinese|2|3
Monza|Udinese~11.05.2025|Udinese|Monza|1|2
Monza|Udinese~09.12.2024|Monza|Udinese|1|2
Monza|Udinese~03.02.2024|Udinese|Monza|0|0
Monza|Udinese~29.10.2023|Monza|Udinese|1|1
Juventus|Parma~29.08.2026|Juventus|Parma|2|0
Juventus|Parma~01.02.2026|Parma|Juventus|1|4
Juventus|Parma~24.08.2025|Juventus|Parma|2|0
Juventus|Parma~23.04.2025|Parma|Juventus|1|0
Juventus|Parma~30.10.2024|Juventus|Parma|2|2
Fiorentina|Frosinone~29.08.2026|Fiorentina|Frosinone|0|3
Fiorentina|Frosinone~11.02.2024|Fiorentina|Frosinone|5|1
Fiorentina|Frosinone~28.09.2023|Frosinone|Fiorentina|1|1
Milan|Venezia~28.08.2026|Milan|Venezia|2|0
Milan|Venezia~27.04.2025|Venezia|Milan|0|2
Milan|Venezia~14.09.2024|Milan|Venezia|4|0
Milan|Venezia~09.01.2022|Venezia|Milan|0|3
Milan|Venezia~22.09.2021|Milan|Venezia|2|0
Fiorentina|Roma~24.08.2026|Roma|Fiorentina|4|0
Fiorentina|Roma~04.05.2026|Roma|Fiorentina|4|0
Fiorentina|Roma~05.10.2025|Fiorentina|Roma|1|2
Fiorentina|Roma~04.05.2025|Roma|Fiorentina|1|0
Fiorentina|Roma~27.10.2024|Fiorentina|Roma|5|1
Bologna|Lazio~24.08.2026|Bologna|Lazio|0|1
Bologna|Lazio~22.03.2026|Bologna|Lazio|0|2
Bologna|Lazio~07.12.2025|Lazio|Bologna|1|1
Bologna|Lazio~16.03.2025|Bologna|Lazio|5|0
Bologna|Lazio~24.11.2024|Lazio|Bologna|3|0
Lecce|Venezia~23.08.2026|Venezia|Lecce|0|2
Lecce|Venezia~06.04.2025|Lecce|Venezia|1|1
Lecce|Venezia~25.11.2024|Venezia|Lecce|0|1
Milan|Torino~23.08.2026|Torino|Milan|1|2
Milan|Torino~21.03.2026|Milan|Torino|3|2
Milan|Torino~08.12.2025|Torino|Milan|2|3
Milan|Torino~22.02.2025|Torino|Milan|2|1
Milan|Torino~17.08.2024|Milan|Torino|2|2
Frosinone|Juventus~23.08.2026|Frosinone|Juventus|0|1
Frosinone|Juventus~25.02.2024|Juventus|Frosinone|3|2
Frosinone|Juventus~23.12.2023|Frosinone|Juventus|1|2
Atalanta|Sassuolo~23.08.2026|Atalanta|Sassuolo|2|1
Atalanta|Sassuolo~01.03.2026|Sassuolo|Atalanta|2|1
Atalanta|Sassuolo~09.11.2025|Atalanta|Sassuolo|0|3
Atalanta|Sassuolo~17.02.2024|Atalanta|Sassuolo|3|0
Atalanta|Sassuolo~20.08.2023|Sassuolo|Atalanta|0|2
Como|Udinese~22.08.2026|Udinese|Como|1|1
Como|Udinese~06.04.2026|Udinese|Como|0|0
Como|Udinese~03.01.2026|Como|Udinese|1|0
Como|Udinese~20.01.2025|Como|Udinese|4|1
Como|Udinese~01.09.2024|Udinese|Como|1|0
Cagliari|Parma~22.08.2026|Parma|Cagliari|0|1
Cagliari|Parma~27.02.2026|Parma|Cagliari|1|1
Cagliari|Parma~13.09.2025|Cagliari|Parma|2|0
Cagliari|Parma~09.02.2025|Cagliari|Parma|2|1
Cagliari|Parma~30.09.2024|Parma|Cagliari|2|3
Inter|Monza~22.08.2026|Inter|Monza|4|1
Inter|Monza~08.03.2025|Inter|Monza|3|2
Inter|Monza~15.09.2024|Monza|Inter|1|1
Inter|Monza~13.01.2024|Monza|Inter|1|5
Inter|Monza~19.08.2023|Inter|Monza|2|0
Genoa|Napoli~22.08.2026|Genoa|Napoli|0|2
Genoa|Napoli~07.02.2026|Genoa|Napoli|2|3
Genoa|Napoli~05.10.2025|Napoli|Genoa|2|1
Genoa|Napoli~11.05.2025|Napoli|Genoa|2|2
Genoa|Napoli~21.12.2024|Genoa|Napoli|1|2
Juventus|Torino~24.05.2026|Torino|Juventus|2|2
Juventus|Torino~08.11.2025|Juventus|Torino|0|0
Juventus|Torino~11.01.2025|Torino|Juventus|1|1
Juventus|Torino~09.11.2024|Juventus|Torino|2|0
Juventus|Torino~13.04.2024|Torino|Juventus|0|0
Parma|Sassuolo~24.05.2026|Parma|Sassuolo|1|0
Parma|Sassuolo~03.01.2026|Sassuolo|Parma|1|1
Napoli|Udinese~24.05.2026|Napoli|Udinese|1|0
Napoli|Udinese~14.12.2025|Udinese|Napoli|1|0
Napoli|Udinese~09.02.2025|Napoli|Udinese|1|1
Napoli|Udinese~14.12.2024|Udinese|Napoli|1|3
Napoli|Udinese~06.05.2024|Udinese|Napoli|1|1
Cagliari|Milan~24.05.2026|Milan|Cagliari|1|2
Cagliari|Milan~02.01.2026|Cagliari|Milan|0|1
Cagliari|Milan~11.01.2025|Milan|Cagliari|1|1
Cagliari|Milan~09.11.2024|Cagliari|Milan|3|3
Cagliari|Milan~11.05.2024|Milan|Cagliari|5|1
Genoa|Lecce~24.05.2026|Lecce|Genoa|1|0
Genoa|Lecce~23.08.2025|Genoa|Lecce|0|0
Genoa|Lecce~14.03.2025|Genoa|Lecce|2|1
Genoa|Lecce~05.01.2025|Lecce|Genoa|0|0
Genoa|Lecce~28.01.2024|Genoa|Lecce|2|1
Lecce|Sassuolo~17.05.2026|Sassuolo|Lecce|2|3
Lecce|Sassuolo~18.10.2025|Lecce|Sassuolo|0|0
Lecce|Sassuolo~21.04.2024|Sassuolo|Lecce|0|3
Lecce|Sassuolo~06.10.2023|Lecce|Sassuolo|1|1
Lecce|Sassuolo~25.02.2023|Lecce|Sassuolo|0|1
Lazio|Roma~17.05.2026|Roma|Lazio|2|0
Lazio|Roma~21.09.2025|Lazio|Roma|0|1
Lazio|Roma~13.04.2025|Lazio|Roma|1|1
Lazio|Roma~05.01.2025|Roma|Lazio|2|0
Lazio|Roma~06.04.2024|Roma|Lazio|1|0
Fiorentina|Juventus~17.05.2026|Juventus|Fiorentina|0|2
Fiorentina|Juventus~22.11.2025|Fiorentina|Juventus|1|1
Fiorentina|Juventus~16.03.2025|Fiorentina|Juventus|3|0
Fiorentina|Juventus~29.12.2024|Juventus|Fiorentina|2|2
Fiorentina|Juventus~07.04.2024|Juventus|Fiorentina|1|0
Genoa|Milan~17.05.2026|Genoa|Milan|1|2
Genoa|Milan~08.01.2026|Milan|Genoa|1|1
Genoa|Milan~05.05.2025|Genoa|Milan|1|2
Genoa|Milan~15.12.2024|Milan|Genoa|0|0
Genoa|Milan~05.05.2024|Milan|Genoa|3|3
Cagliari|Torino~17.05.2026|Cagliari|Torino|2|1
Cagliari|Torino~27.12.2025|Torino|Cagliari|1|2
Cagliari|Torino~24.01.2025|Torino|Cagliari|2|0
Cagliari|Torino~20.10.2024|Cagliari|Torino|3|2
Cagliari|Torino~26.01.2024|Cagliari|Torino|1|2
Parma|Roma~10.05.2026|Parma|Roma|2|3
Parma|Roma~29.10.2025|Roma|Parma|2|1
Parma|Roma~16.02.2025|Parma|Roma|0|1
Parma|Roma~22.12.2024|Roma|Parma|5|0
Inter|Lazio~09.05.2026|Lazio|Inter|0|3
Inter|Lazio~09.11.2025|Inter|Lazio|2|0
Inter|Lazio~18.05.2025|Inter|Lazio|2|2
Inter|Lazio~16.12.2024|Lazio|Inter|0|6
Inter|Lazio~19.05.2024|Inter|Lazio|1|1
Atalanta|Genoa~02.05.2026|Atalanta|Genoa|0|0
Atalanta|Genoa~21.12.2025|Genoa|Atalanta|0|1
Atalanta|Genoa~17.05.2025|Genoa|Atalanta|2|3
Atalanta|Genoa~05.10.2024|Atalanta|Genoa|5|1
Atalanta|Genoa~11.02.2024|Genoa|Atalanta|1|4
Inter|Torino~26.04.2026|Torino|Inter|2|2
Inter|Torino~25.08.2025|Inter|Torino|5|0
Inter|Torino~11.05.2025|Torino|Inter|0|2
Inter|Torino~05.10.2024|Inter|Torino|3|2
Inter|Torino~28.04.2024|Inter|Torino|2|0
Fiorentina|Sassuolo~26.04.2026|Fiorentina|Sassuolo|0|0
Fiorentina|Sassuolo~06.12.2025|Sassuolo|Fiorentina|3|1
Fiorentina|Sassuolo~28.04.2024|Fiorentina|Sassuolo|5|1
Fiorentina|Sassuolo~06.01.2024|Sassuolo|Fiorentina|1|0
Fiorentina|Sassuolo~02.06.2023|Sassuolo|Fiorentina|1|3
Bologna|Roma~25.04.2026|Bologna|Roma|0|2
Bologna|Roma~23.08.2025|Roma|Bologna|1|0
Bologna|Roma~12.01.2025|Bologna|Roma|2|2
Bologna|Roma~10.11.2024|Roma|Bologna|2|3
Bologna|Roma~22.04.2024|Roma|Bologna|1|3
Fiorentina|Lecce~20.04.2026|Lecce|Fiorentina|1|1
Fiorentina|Lecce~02.11.2025|Fiorentina|Lecce|0|1
Fiorentina|Lecce~28.02.2025|Fiorentina|Lecce|1|0
Fiorentina|Lecce~20.10.2024|Lecce|Fiorentina|0|6
Fiorentina|Lecce~02.02.2024|Lecce|Fiorentina|3|2
Bologna|Juventus~19.04.2026|Juventus|Bologna|2|0
Bologna|Juventus~14.12.2025|Bologna|Juventus|0|1
Bologna|Juventus~04.05.2025|Bologna|Juventus|1|1
Bologna|Juventus~07.12.2024|Juventus|Bologna|2|2
Bologna|Juventus~20.05.2024|Bologna|Juventus|3|3
Lazio|Napoli~18.04.2026|Napoli|Lazio|0|2
Lazio|Napoli~04.01.2026|Lazio|Napoli|0|2
Lazio|Napoli~15.02.2025|Lazio|Napoli|2|2
Lazio|Napoli~08.12.2024|Napoli|Lazio|0|1
Lazio|Napoli~28.01.2024|Lazio|Napoli|0|0
Fiorentina|Lazio~13.04.2026|Fiorentina|Lazio|1|0
Fiorentina|Lazio~07.01.2026|Lazio|Fiorentina|2|2
Fiorentina|Lazio~26.01.2025|Lazio|Fiorentina|1|2
Fiorentina|Lazio~22.09.2024|Fiorentina|Lazio|2|1
Fiorentina|Lazio~26.02.2024|Fiorentina|Lazio|2|1
Napoli|Parma~12.04.2026|Parma|Napoli|1|1
Napoli|Parma~14.01.2026|Napoli|Parma|0|0
Napoli|Parma~18.05.2025|Parma|Napoli|0|0
Napoli|Parma~31.08.2024|Napoli|Parma|2|1
Genoa|Sassuolo~12.04.2026|Genoa|Sassuolo|2|1
Genoa|Sassuolo~03.11.2025|Sassuolo|Genoa|1|2
Genoa|Sassuolo~12.05.2024|Genoa|Sassuolo|2|1
Genoa|Sassuolo~22.12.2023|Sassuolo|Genoa|1|2
Genoa|Sassuolo~06.01.2022|Sassuolo|Genoa|1|1
Como|Inter~12.04.2026|Como|Inter|3|4
Como|Inter~06.12.2025|Inter|Como|4|0
Como|Inter~23.05.2025|Como|Inter|0|2
Como|Inter~23.12.2024|Inter|Como|2|0
Milan|Napoli~06.04.2026|Napoli|Milan|1|0
Milan|Napoli~28.09.2025|Milan|Napoli|2|1
Milan|Napoli~30.03.2025|Napoli|Milan|2|1
Milan|Napoli~29.10.2024|Milan|Napoli|0|2
Milan|Napoli~11.02.2024|Milan|Napoli|1|0
Atalanta|Lecce~06.04.2026|Lecce|Atalanta|0|3
Atalanta|Lecce~14.09.2025|Atalanta|Lecce|4|1
Atalanta|Lecce~27.04.2025|Atalanta|Lecce|1|1
Atalanta|Lecce~19.08.2024|Lecce|Atalanta|0|4
Atalanta|Lecce~18.05.2024|Lecce|Atalanta|0|2
Cagliari|Sassuolo~04.04.2026|Sassuolo|Cagliari|2|1
Cagliari|Sassuolo~30.10.2025|Cagliari|Sassuolo|1|2
Cagliari|Sassuolo~19.05.2024|Sassuolo|Cagliari|0|2
Cagliari|Sassuolo~11.12.2023|Cagliari|Sassuolo|2|1
Cagliari|Sassuolo~16.04.2022|Cagliari|Sassuolo|1|0
Genoa|Udinese~20.03.2026|Genoa|Udinese|0|2
Genoa|Udinese~08.12.2025|Udinese|Genoa|1|2
Genoa|Udinese~04.04.2025|Genoa|Udinese|1|0
Genoa|Udinese~01.12.2024|Udinese|Genoa|0|2
Genoa|Udinese~24.02.2024|Genoa|Udinese|2|0
Cagliari|Napoli~20.03.2026|Cagliari|Napoli|0|1
Cagliari|Napoli~30.08.2025|Napoli|Cagliari|1|0
Cagliari|Napoli~23.05.2025|Napoli|Cagliari|2|0
Cagliari|Napoli~15.09.2024|Cagliari|Napoli|0|4
Cagliari|Napoli~25.02.2024|Cagliari|Napoli|1|1
Juventus|Udinese~14.03.2026|Udinese|Juventus|0|1
Juventus|Udinese~29.10.2025|Juventus|Udinese|3|1
Juventus|Udinese~18.05.2025|Juventus|Udinese|2|0
Juventus|Udinese~02.11.2024|Udinese|Juventus|0|2
Juventus|Udinese~12.02.2024|Juventus|Udinese|0|1
Lecce|Napoli~14.03.2026|Napoli|Lecce|2|1
Lecce|Napoli~28.10.2025|Lecce|Napoli|0|1
Lecce|Napoli~03.05.2025|Lecce|Napoli|0|1
Lecce|Napoli~26.10.2024|Napoli|Lecce|1|0
Lecce|Napoli~26.05.2024|Napoli|Lecce|0|0
Atalanta|Inter~14.03.2026|Inter|Atalanta|1|1
Atalanta|Inter~28.12.2025|Atalanta|Inter|0|1
Atalanta|Inter~16.03.2025|Atalanta|Inter|0|2
Atalanta|Inter~30.08.2024|Inter|Atalanta|4|0
Atalanta|Inter~28.02.2024|Inter|Atalanta|4|0
Inter|Milan~08.03.2026|Milan|Inter|1|0
Inter|Milan~23.11.2025|Inter|Milan|0|1
Inter|Milan~02.02.2025|Milan|Inter|1|1
Inter|Milan~22.09.2024|Inter|Milan|1|2
Inter|Milan~22.04.2024|Milan|Inter|1|2
Fiorentina|Parma~08.03.2026|Fiorentina|Parma|0|0
Fiorentina|Parma~27.12.2025|Parma|Fiorentina|1|0
Fiorentina|Parma~13.04.2025|Fiorentina|Parma|0|0
Fiorentina|Parma~17.08.2024|Parma|Fiorentina|1|1
Cagliari|Como~07.03.2026|Cagliari|Como|1|2
Cagliari|Como~08.11.2025|Como|Cagliari|0|0
Cagliari|Como~10.05.2025|Como|Cagliari|3|1
Cagliari|Como~26.08.2024|Cagliari|Como|1|1
Atalanta|Udinese~07.03.2026|Atalanta|Udinese|2|2
Atalanta|Udinese~01.11.2025|Udinese|Atalanta|1|0
Atalanta|Udinese~11.01.2025|Udinese|Atalanta|0|0
Atalanta|Udinese~10.11.2024|Atalanta|Udinese|2|1
Atalanta|Udinese~27.01.2024|Atalanta|Udinese|2|0
Napoli|Torino~06.03.2026|Napoli|Torino|2|1
Napoli|Torino~18.10.2025|Torino|Napoli|1|0
Napoli|Torino~27.04.2025|Napoli|Torino|2|0
Napoli|Torino~01.12.2024|Torino|Napoli|0|1
Napoli|Torino~08.03.2024|Napoli|Torino|1|1
Fiorentina|Udinese~02.03.2026|Udinese|Fiorentina|3|0
Fiorentina|Udinese~21.12.2025|Fiorentina|Udinese|5|1
Fiorentina|Udinese~25.05.2025|Udinese|Fiorentina|2|3
Fiorentina|Udinese~23.12.2024|Fiorentina|Udinese|1|2
Fiorentina|Udinese~14.01.2024|Fiorentina|Udinese|2|2
Lazio|Torino~01.03.2026|Torino|Lazio|2|0
Lazio|Torino~04.10.2025|Lazio|Torino|3|3
Lazio|Torino~31.03.2025|Lazio|Torino|1|1
Lazio|Torino~29.09.2024|Torino|Lazio|2|3
Lazio|Torino~22.02.2024|Torino|Lazio|0|2
Juventus|Roma~01.03.2026|Roma|Juventus|3|3
Juventus|Roma~20.12.2025|Juventus|Roma|2|1
Juventus|Roma~06.04.2025|Roma|Juventus|1|1
Juventus|Roma~01.09.2024|Juventus|Roma|0|0
Juventus|Roma~05.05.2024|Roma|Juventus|1|1
Genoa|Inter~28.02.2026|Inter|Genoa|2|0
Genoa|Inter~14.12.2025|Genoa|Inter|1|2
Genoa|Inter~22.02.2025|Inter|Genoa|1|0
Genoa|Inter~17.08.2024|Genoa|Inter|2|2
Genoa|Inter~04.03.2024|Inter|Genoa|2|1
Como|Lecce~28.02.2026|Como|Lecce|3|1
Como|Lecce~27.12.2025|Lecce|Como|0|3
Como|Lecce~19.04.2025|Lecce|Como|0|3
Como|Lecce~30.12.2024|Como|Lecce|2|0
Bologna|Udinese~23.02.2026|Bologna|Udinese|1|0
Bologna|Udinese~22.11.2025|Udinese|Bologna|0|3
Bologna|Udinese~28.04.2025|Udinese|Bologna|0|0
Bologna|Udinese~18.08.2024|Bologna|Udinese|1|1
Bologna|Udinese~28.04.2024|Bologna|Udinese|1|1
Milan|Parma~22.02.2026|Milan|Parma|0|1
Milan|Parma~08.11.2025|Parma|Milan|2|2
Milan|Parma~26.01.2025|Milan|Parma|3|2
Milan|Parma~24.08.2024|Parma|Milan|2|1
Genoa|Torino~22.02.2026|Genoa|Torino|3|0
Genoa|Torino~26.10.2025|Torino|Genoa|2|1
Genoa|Torino~08.02.2025|Torino|Genoa|1|1
Genoa|Torino~07.12.2024|Genoa|Torino|0|0
Genoa|Torino~13.01.2024|Genoa|Torino|0|0
Atalanta|Napoli~22.02.2026|Atalanta|Napoli|2|1
Atalanta|Napoli~22.11.2025|Napoli|Atalanta|3|1
Atalanta|Napoli~18.01.2025|Atalanta|Napoli|2|3
Atalanta|Napoli~03.11.2024|Napoli|Atalanta|0|3
Atalanta|Napoli~30.03.2024|Napoli|Atalanta|0|3
Inter|Lecce~21.02.2026|Lecce|Inter|0|2
Inter|Lecce~14.01.2026|Inter|Lecce|1|0
Inter|Lecce~26.01.2025|Lecce|Inter|0|4
Inter|Lecce~24.08.2024|Inter|Lecce|2|0
Inter|Lecce~25.02.2024|Lecce|Inter|0|4
Como|Juventus~21.02.2026|Juventus|Como|0|2
Como|Juventus~19.10.2025|Como|Juventus|2|0
Como|Juventus~07.02.2025|Como|Juventus|1|2
Como|Juventus~19.08.2024|Juventus|Como|3|0
Cagliari|Lazio~21.02.2026|Cagliari|Lazio|0|0
Cagliari|Lazio~03.11.2025|Lazio|Cagliari|2|0
Cagliari|Lazio~03.02.2025|Cagliari|Lazio|1|2
Cagliari|Lazio~04.11.2024|Lazio|Cagliari|2|1
Cagliari|Lazio~10.02.2024|Cagliari|Lazio|1|3
Como|Milan~18.02.2026|Milan|Como|1|1
Como|Milan~15.01.2026|Como|Milan|1|3
Como|Milan~15.03.2025|Milan|Como|2|1
Como|Milan~14.01.2025|Como|Milan|1|2
Sassuolo|Udinese~15.02.2026|Udinese|Sassuolo|1|2
Sassuolo|Udinese~28.09.2025|Sassuolo|Udinese|3|1
Sassuolo|Udinese~01.04.2024|Sassuolo|Udinese|1|1
Sassuolo|Udinese~17.12.2023|Udinese|Sassuolo|2|2
Sassuolo|Udinese~12.02.2023|Udinese|Sassuolo|2|2
Atalanta|Lazio~14.02.2026|Lazio|Atalanta|0|2
Atalanta|Lazio~19.10.2025|Atalanta|Lazio|0|0
Atalanta|Lazio~06.04.2025|Atalanta|Lazio|0|1
Atalanta|Lazio~28.12.2024|Lazio|Atalanta|1|1
Atalanta|Lazio~04.02.2024|Atalanta|Lazio|3|1
Inter|Juventus~14.02.2026|Inter|Juventus|3|2
Inter|Juventus~13.09.2025|Juventus|Inter|4|3
Inter|Juventus~16.02.2025|Juventus|Inter|1|0
Inter|Juventus~27.10.2024|Inter|Juventus|4|4
Inter|Juventus~04.02.2024|Inter|Juventus|1|0
Inter|Sassuolo~08.02.2026|Sassuolo|Inter|0|5
Inter|Sassuolo~21.09.2025|Inter|Sassuolo|2|1
Inter|Sassuolo~04.05.2024|Sassuolo|Inter|1|0
Inter|Sassuolo~27.09.2023|Inter|Sassuolo|1|2
Inter|Sassuolo~13.05.2023|Inter|Sassuolo|4|2
Bologna|Parma~08.02.2026|Bologna|Parma|0|1
Bologna|Parma~02.11.2025|Parma|Bologna|1|3
Bologna|Parma~22.02.2025|Parma|Bologna|2|0
Bologna|Parma~06.10.2024|Bologna|Parma|0|0
Roma|Udinese~02.02.2026|Udinese|Roma|1|0
Roma|Udinese~09.11.2025|Roma|Udinese|2|0
Roma|Udinese~26.01.2025|Udinese|Roma|1|2
Roma|Udinese~22.09.2024|Roma|Udinese|3|0
Roma|Udinese~25.04.2024|Udinese|Roma|1|2
Lecce|Torino~01.02.2026|Torino|Lecce|1|0
Lecce|Torino~30.11.2025|Lecce|Torino|2|1
Lecce|Torino~18.05.2025|Lecce|Torino|1|0
Lecce|Torino~15.09.2024|Torino|Lecce|0|0
Lecce|Torino~16.02.2024|Torino|Lecce|2|0
Atalanta|Como~01.02.2026|Como|Atalanta|0|0
Atalanta|Como~04.10.2025|Atalanta|Como|1|1
Atalanta|Como~25.01.2025|Como|Atalanta|1|2
Atalanta|Como~24.09.2024|Atalanta|Como|2|3
Milan|Roma~25.01.2026|Roma|Milan|1|1
Milan|Roma~02.11.2025|Milan|Roma|1|0
Milan|Roma~18.05.2025|Roma|Milan|3|1
Milan|Roma~29.12.2024|Milan|Roma|1|1
Milan|Roma~14.01.2024|Milan|Roma|3|1
Juventus|Napoli~25.01.2026|Juventus|Napoli|3|0
Juventus|Napoli~07.12.2025|Napoli|Juventus|2|1
Juventus|Napoli~25.01.2025|Napoli|Juventus|2|1
Juventus|Napoli~21.09.2024|Juventus|Napoli|0|0
Juventus|Napoli~03.03.2024|Napoli|Juventus|2|1
Bologna|Genoa~25.01.2026|Genoa|Bologna|3|2
Bologna|Genoa~20.09.2025|Bologna|Genoa|2|1
Bologna|Genoa~24.05.2025|Bologna|Genoa|1|3
Bologna|Genoa~19.10.2024|Genoa|Bologna|2|2
Bologna|Genoa~24.05.2024|Genoa|Bologna|2|0
Atalanta|Parma~25.01.2026|Atalanta|Parma|4|0
Atalanta|Parma~30.08.2025|Parma|Atalanta|1|1
Atalanta|Parma~25.05.2025|Atalanta|Parma|2|3
Atalanta|Parma~23.11.2024|Parma|Atalanta|1|3
Lazio|Lecce~24.01.2026|Lecce|Lazio|0|0
Lazio|Lecce~23.11.2025|Lazio|Lecce|2|0
Lazio|Lecce~25.05.2025|Lazio|Lecce|0|1
Lazio|Lecce~21.12.2024|Lecce|Lazio|1|2
Lazio|Lecce~14.01.2024|Lazio|Lecce|1|0
Cagliari|Fiorentina~24.01.2026|Fiorentina|Cagliari|1|2
Cagliari|Fiorentina~24.08.2025|Cagliari|Fiorentina|1|1
Cagliari|Fiorentina~23.04.2025|Cagliari|Fiorentina|1|2
Cagliari|Fiorentina~08.12.2024|Fiorentina|Cagliari|1|0
Cagliari|Fiorentina~23.05.2024|Cagliari|Fiorentina|2|3
Como|Lazio~19.01.2026|Lazio|Como|0|3
Como|Lazio~24.08.2025|Como|Lazio|2|0
Como|Lazio~10.01.2025|Lazio|Como|1|1
Como|Lazio~31.10.2024|Como|Lazio|1|5
Bologna|Fiorentina~18.01.2026|Bologna|Fiorentina|1|2
Bologna|Fiorentina~26.10.2025|Fiorentina|Bologna|2|2
Bologna|Fiorentina~18.05.2025|Fiorentina|Bologna|3|2
Bologna|Fiorentina~15.12.2024|Bologna|Fiorentina|1|0
Bologna|Fiorentina~14.02.2024|Bologna|Fiorentina|2|0
Napoli|Sassuolo~17.01.2026|Napoli|Sassuolo|1|0
Napoli|Sassuolo~23.08.2025|Sassuolo|Napoli|0|2
Napoli|Sassuolo~28.02.2024|Sassuolo|Napoli|1|6
Napoli|Sassuolo~27.08.2023|Napoli|Sassuolo|2|0
Napoli|Sassuolo~17.02.2023|Sassuolo|Napoli|0|2
Cagliari|Genoa~12.01.2026|Genoa|Cagliari|3|0
Cagliari|Genoa~22.11.2025|Cagliari|Genoa|3|3
Cagliari|Genoa~07.03.2025|Cagliari|Genoa|1|1
Cagliari|Genoa~24.11.2024|Genoa|Cagliari|2|2
Cagliari|Genoa~29.04.2024|Genoa|Cagliari|3|0
Lecce|Parma~11.01.2026|Lecce|Parma|1|2
Lecce|Parma~04.10.2025|Parma|Lecce|0|1
Lecce|Parma~31.01.2025|Parma|Lecce|1|3
Lecce|Parma~21.09.2024|Lecce|Parma|2|2
Fiorentina|Milan~11.01.2026|Fiorentina|Milan|1|1
Fiorentina|Milan~19.10.2025|Milan|Fiorentina|2|1
Fiorentina|Milan~05.04.2025|Milan|Fiorentina|2|2
Fiorentina|Milan~06.10.2024|Fiorentina|Milan|2|1
Fiorentina|Milan~30.03.2024|Fiorentina|Milan|1|2
Roma|Sassuolo~10.01.2026|Roma|Sassuolo|2|0
Roma|Sassuolo~26.10.2025|Sassuolo|Roma|0|1
Roma|Sassuolo~17.03.2024|Roma|Sassuolo|1|0
Roma|Sassuolo~03.12.2023|Sassuolo|Roma|1|2
Roma|Sassuolo~12.03.2023|Roma|Sassuolo|3|4
Bologna|Como~10.01.2026|Como|Bologna|1|1
Bologna|Como~30.08.2025|Bologna|Como|1|0
Bologna|Como~01.02.2025|Bologna|Como|2|0
Bologna|Como~14.09.2024|Como|Bologna|2|2
Atalanta|Torino~10.01.2026|Atalanta|Torino|2|0
Atalanta|Torino~21.09.2025|Torino|Atalanta|0|3
Atalanta|Torino~01.02.2025|Atalanta|Torino|1|1
Atalanta|Torino~25.08.2024|Torino|Atalanta|2|1
Atalanta|Torino~26.05.2024|Atalanta|Torino|3|0
Juventus|Venezia~25.05.2025|Venezia|Juventus|2|3
Juventus|Venezia~14.12.2024|Juventus|Venezia|2|2
Juventus|Venezia~01.05.2022|Juventus|Venezia|2|1
Juventus|Venezia~11.12.2021|Venezia|Juventus|1|1
Milan|Monza~24.05.2025|Milan|Monza|2|0
Milan|Monza~02.11.2024|Monza|Milan|0|1
Milan|Monza~18.02.2024|Monza|Milan|4|2
Milan|Monza~17.12.2023|Milan|Monza|3|0
Milan|Monza~18.02.2023|Monza|Milan|0|1
Cagliari|Venezia~18.05.2025|Cagliari|Venezia|3|0
Cagliari|Venezia~22.12.2024|Venezia|Cagliari|2|1
Cagliari|Venezia~22.05.2022|Venezia|Cagliari|0|0
Cagliari|Venezia~01.10.2021|Cagliari|Venezia|1|1
Atalanta|Monza~04.05.2025|Monza|Atalanta|0|4
Atalanta|Monza~30.10.2024|Atalanta|Monza|2|0
Atalanta|Monza~21.04.2024|Monza|Atalanta|1|2
Atalanta|Monza~02.09.2023|Atalanta|Monza|3|0
Atalanta|Monza~04.06.2023|Atalanta|Monza|5|2
Torino|Venezia~02.05.2025|Torino|Venezia|1|1
Torino|Venezia~30.08.2024|Venezia|Torino|0|1
Torino|Venezia~12.02.2022|Torino|Venezia|1|2
Torino|Venezia~27.09.2021|Venezia|Torino|1|1
Juventus|Monza~27.04.2025|Juventus|Monza|2|0
Juventus|Monza~22.12.2024|Monza|Juventus|1|2
Juventus|Monza~25.05.2024|Juventus|Monza|2|0
Juventus|Monza~01.12.2023|Monza|Juventus|1|2
Juventus|Monza~29.01.2023|Juventus|Monza|0|2
Monza|Venezia~12.04.2025|Venezia|Monza|1|0
Monza|Venezia~27.10.2024|Monza|Venezia|2|2
Como|Monza~05.04.2025|Monza|Como|1|3
Como|Monza~30.11.2024|Como|Monza|1|1
Bologna|Venezia~29.03.2025|Venezia|Bologna|0|1
Bologna|Venezia~30.11.2024|Bologna|Venezia|3|0
Bologna|Venezia~08.05.2022|Venezia|Bologna|4|3
Bologna|Venezia~21.11.2021|Bologna|Venezia|0|1
Como|Venezia~08.03.2025|Como|Venezia|1|1
Como|Venezia~08.12.2024|Venezia|Como|2|2
Monza|Roma~24.02.2025|Roma|Monza|4|0
Monza|Roma~06.10.2024|Monza|Roma|1|1
Monza|Roma~02.03.2024|Monza|Roma|1|4
Monza|Roma~22.10.2023|Roma|Monza|1|0
Monza|Roma~03.05.2023|Monza|Roma|1|1
Roma|Venezia~09.02.2025|Venezia|Roma|0|1
Roma|Venezia~29.09.2024|Roma|Venezia|2|1
Roma|Venezia~14.05.2022|Roma|Venezia|1|1
Roma|Venezia~07.11.2021|Venezia|Roma|3|2
Udinese|Venezia~01.02.2025|Udinese|Venezia|3|2
Udinese|Venezia~30.10.2024|Venezia|Udinese|3|2
Udinese|Venezia~10.04.2022|Venezia|Udinese|1|2
Udinese|Venezia~27.08.2021|Udinese|Venezia|3|0
Genoa|Monza~27.01.2025|Genoa|Monza|2|0
Genoa|Monza~24.08.2024|Monza|Genoa|0|1
Genoa|Monza~09.03.2024|Genoa|Monza|2|3
Genoa|Monza~10.12.2023|Monza|Genoa|1|0
Parma|Venezia~19.01.2025|Parma|Venezia|1|1
Parma|Venezia~09.11.2024|Venezia|Parma|1|2
Bologna|Monza~18.01.2025|Bologna|Monza|3|1
Bologna|Monza~22.09.2024|Monza|Bologna|1|2
Bologna|Monza~13.04.2024|Bologna|Monza|0|0
Bologna|Monza~28.09.2023|Monza|Bologna|0|0
Bologna|Monza~12.02.2023|Bologna|Monza|0|1
Fiorentina|Monza~13.01.2025|Monza|Fiorentina|2|1
Fiorentina|Monza~01.09.2024|Fiorentina|Monza|2|2
Fiorentina|Monza~13.05.2024|Fiorentina|Monza|2|1
Fiorentina|Monza~22.12.2023|Monza|Fiorentina|0|1
Fiorentina|Monza~23.04.2023|Monza|Fiorentina|3|2
Frosinone|Udinese~26.05.2024|Frosinone|Udinese|0|1
Frosinone|Udinese~02.09.2023|Udinese|Frosinone|0|0
Frosinone|Monza~19.05.2024|Monza|Frosinone|0|1
Frosinone|Monza~06.01.2024|Frosinone|Monza|2|3
Frosinone|Inter~10.05.2024|Frosinone|Inter|0|5
Frosinone|Inter~12.11.2023|Inter|Frosinone|2|0
Frosinone|Torino~21.04.2024|Torino|Frosinone|0|0
Frosinone|Torino~10.12.2023|Frosinone|Torino|0|0
Bologna|Frosinone~07.04.2024|Frosinone|Bologna|0|0
Bologna|Frosinone~22.10.2023|Bologna|Frosinone|2|1
Frosinone|Lazio~16.03.2024|Frosinone|Lazio|2|3
Frosinone|Lazio~29.12.2023|Lazio|Frosinone|3|1
Frosinone|Roma~18.02.2024|Frosinone|Roma|0|3
Frosinone|Roma~01.10.2023|Roma|Frosinone|2|0
Frosinone|Milan~03.02.2024|Frosinone|Milan|2|3
Frosinone|Milan~02.12.2023|Milan|Frosinone|3|1
Cagliari|Frosinone~21.01.2024|Frosinone|Cagliari|3|1
Cagliari|Frosinone~29.10.2023|Cagliari|Frosinone|4|3
Sassuolo|Venezia~06.03.2022|Venezia|Sassuolo|1|4
Sassuolo|Venezia~23.10.2021|Sassuolo|Venezia|3|1`;
SAHH.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
const BLHH=`Hoffenheim|Leverkusen~25.10.2026|Hoffenheim|Leverkusen|3|0
Hoffenheim|Leverkusen~17.01.2026|Hoffenheim|Leverkusen|1|0
Hoffenheim|Leverkusen~23.08.2025|Leverkusen|Hoffenheim|1|2
Hoffenheim|Leverkusen~02.02.2025|Leverkusen|Hoffenheim|3|1
Hoffenheim|Leverkusen~14.09.2024|Hoffenheim|Leverkusen|1|4
Bayern|Freiburg~25.10.2026|Freiburg|Bayern|1|3
Bayern|Freiburg~04.04.2026|Freiburg|Bayern|2|3
Bayern|Freiburg~22.11.2025|Bayern|Freiburg|6|2
Bayern|Freiburg~25.01.2025|Freiburg|Bayern|1|2
Bayern|Freiburg~01.09.2024|Bayern|Freiburg|2|0
Hamburg|Paderborn~24.10.2026|Paderborn|Hamburg|1|0
Mainz|Werder Bremen~24.10.2026|Mainz|Werder Bremen|2|3
Mainz|Werder Bremen~15.03.2026|Werder Bremen|Mainz|0|2
Mainz|Werder Bremen~01.11.2025|Mainz|Werder Bremen|1|1
Mainz|Werder Bremen~31.01.2025|Werder Bremen|Mainz|1|0
Mainz|Werder Bremen~15.09.2024|Mainz|Werder Bremen|1|2
Elversberg|Leipzig~24.10.2026|Leipzig|Elversberg|4|0
Köln|Schalke~24.10.2026|Köln|Schalke|0|0
Köln|Schalke~29.01.2023|Schalke|Köln|0|0
Köln|Schalke~07.08.2022|Köln|Schalke|3|1
Dortmund|Frankfurt~24.10.2026|Dortmund|Frankfurt|1|0
Dortmund|Frankfurt~08.05.2026|Dortmund|Frankfurt|3|2
Dortmund|Frankfurt~09.01.2026|Frankfurt|Dortmund|3|3
Dortmund|Frankfurt~17.01.2025|Frankfurt|Dortmund|2|0
Dortmund|Frankfurt~24.08.2024|Dortmund|Frankfurt|2|0
Augsburg|Union Berlin~24.10.2026|Augsburg|Union Berlin|1|1
Augsburg|Union Berlin~16.05.2026|Union Berlin|Augsburg|4|0
Augsburg|Union Berlin~15.01.2026|Augsburg|Union Berlin|1|1
Augsburg|Union Berlin~17.05.2025|Augsburg|Union Berlin|1|2
Augsburg|Union Berlin~15.01.2025|Union Berlin|Augsburg|0|2
M’gladbach|Stuttgart~23.10.2026|Stuttgart|M’gladbach|2|3
M’gladbach|Stuttgart~25.01.2026|M’gladbach|Stuttgart|0|3
M’gladbach|Stuttgart~30.08.2025|Stuttgart|M’gladbach|1|0
M’gladbach|Stuttgart~01.02.2025|Stuttgart|M’gladbach|1|2
M’gladbach|Stuttgart~14.09.2024|M’gladbach|Stuttgart|1|3
Hoffenheim|M’gladbach~18.10.2026|M’gladbach|Hoffenheim|1|2
Hoffenheim|M’gladbach~16.05.2026|M’gladbach|Hoffenheim|4|0
Hoffenheim|M’gladbach~14.01.2026|Hoffenheim|M’gladbach|5|1
Hoffenheim|M’gladbach~03.05.2025|M’gladbach|Hoffenheim|4|4
Hoffenheim|M’gladbach~21.12.2024|Hoffenheim|M’gladbach|1|2
Freiburg|Leverkusen~18.10.2026|Leverkusen|Freiburg|2|1
Freiburg|Leverkusen~07.03.2026|Freiburg|Leverkusen|3|3
Freiburg|Leverkusen~26.10.2025|Leverkusen|Freiburg|2|0
Freiburg|Leverkusen~04.05.2025|Freiburg|Leverkusen|2|2
Freiburg|Leverkusen~21.12.2024|Leverkusen|Freiburg|5|1
Paderborn|Werder Bremen~17.10.2026|Werder Bremen|Paderborn|2|2
Dortmund|Union Berlin~17.10.2026|Union Berlin|Dortmund|0|0
Dortmund|Union Berlin~24.01.2026|Union Berlin|Dortmund|0|3
Dortmund|Union Berlin~31.08.2025|Dortmund|Union Berlin|3|0
Dortmund|Union Berlin~22.02.2025|Dortmund|Union Berlin|6|0
Dortmund|Union Berlin~05.10.2024|Union Berlin|Dortmund|2|1
Mainz|Schalke~17.10.2026|Schalke|Mainz|0|1
Mainz|Schalke~05.05.2023|Mainz|Schalke|2|3
Mainz|Schalke~09.11.2022|Schalke|Mainz|1|0
Hamburg|Stuttgart~17.10.2026|Hamburg|Stuttgart|1|0
Hamburg|Stuttgart~12.04.2026|Stuttgart|Hamburg|4|0
Hamburg|Stuttgart~30.11.2025|Hamburg|Stuttgart|2|1
Augsburg|Elversberg~17.10.2026|Elversberg|Augsburg|4|3
Bayern|Leipzig~17.10.2026|Bayern|Leipzig|6|1
Bayern|Leipzig~17.01.2026|Leipzig|Bayern|1|5
Bayern|Leipzig~22.08.2025|Bayern|Leipzig|6|0
Bayern|Leipzig~03.05.2025|Leipzig|Bayern|3|3
Bayern|Leipzig~20.12.2024|Bayern|Leipzig|5|1
Frankfurt|Köln~16.10.2026|Frankfurt|Köln|1|0
Frankfurt|Köln~05.04.2026|Frankfurt|Köln|2|2
Frankfurt|Köln~22.11.2025|Köln|Frankfurt|3|4
Frankfurt|Köln~03.02.2024|Köln|Frankfurt|2|0
Frankfurt|Köln~03.09.2023|Frankfurt|Köln|1|1
Köln|M’gladbach~11.10.2026|Köln|M’gladbach|2|1
Köln|M’gladbach~21.03.2026|Köln|M’gladbach|3|3
Köln|M’gladbach~08.11.2025|M’gladbach|Köln|3|1
Köln|M’gladbach~09.03.2024|M’gladbach|Köln|3|3
Köln|M’gladbach~22.10.2023|Köln|M’gladbach|3|1
Freiburg|Schalke~11.10.2026|Freiburg|Schalke|2|1
Freiburg|Schalke~23.04.2023|Freiburg|Schalke|4|0
Freiburg|Schalke~30.10.2022|Schalke|Freiburg|0|2
Elversberg|Union Berlin~10.10.2026|Union Berlin|Elversberg|1|0
Paderborn|Stuttgart~10.10.2026|Paderborn|Stuttgart|0|2
Leverkusen|Mainz~10.10.2026|Mainz|Leverkusen|3|4
Leverkusen|Mainz~28.02.2026|Leverkusen|Mainz|1|1
Leverkusen|Mainz~18.10.2025|Mainz|Leverkusen|3|4
Leverkusen|Mainz~17.05.2025|Mainz|Leverkusen|2|2
Leverkusen|Mainz~14.01.2025|Leverkusen|Mainz|1|0
Frankfurt|Leipzig~10.10.2026|Leipzig|Frankfurt|6|0
Frankfurt|Leipzig~18.04.2026|Frankfurt|Leipzig|1|3
Frankfurt|Leipzig~06.12.2025|Leipzig|Frankfurt|6|0
Frankfurt|Leipzig~26.04.2025|Frankfurt|Leipzig|4|0
Frankfurt|Leipzig~15.12.2024|Leipzig|Frankfurt|2|1
Hamburg|Hoffenheim~10.10.2026|Hoffenheim|Hamburg|2|3
Hamburg|Hoffenheim~25.04.2026|Hamburg|Hoffenheim|1|2
Hamburg|Hoffenheim~13.12.2025|Hoffenheim|Hamburg|4|1
Augsburg|Bayern~10.10.2026|Augsburg|Bayern|2|2
Augsburg|Bayern~24.01.2026|Bayern|Augsburg|1|2
Augsburg|Bayern~30.08.2025|Augsburg|Bayern|2|3
Augsburg|Bayern~04.04.2025|Augsburg|Bayern|1|3
Augsburg|Bayern~22.11.2024|Bayern|Augsburg|3|0
Dortmund|Werder Bremen~09.10.2026|Dortmund|Werder Bremen|2|2
Dortmund|Werder Bremen~16.05.2026|Werder Bremen|Dortmund|0|2
Dortmund|Werder Bremen~13.01.2026|Dortmund|Werder Bremen|3|0
Dortmund|Werder Bremen~25.01.2025|Dortmund|Werder Bremen|2|2
Dortmund|Werder Bremen~31.08.2024|Werder Bremen|Dortmund|0|0
Elversberg|Schalke~20.09.2026|Schalke|Elversberg|0|0
Hoffenheim|Paderborn~20.09.2026|Paderborn|Hoffenheim|3|1
Leipzig|Leverkusen~20.09.2026|Leverkusen|Leipzig|2|0
Leipzig|Leverkusen~02.05.2026|Leverkusen|Leipzig|4|1
Leipzig|Leverkusen~20.12.2025|Leipzig|Leverkusen|1|3
Leipzig|Leverkusen~25.01.2025|Leipzig|Leverkusen|2|2
Leipzig|Leverkusen~31.08.2024|Leverkusen|Leipzig|2|3
Augsburg|Werder Bremen~19.09.2026|Werder Bremen|Augsburg|3|2
Augsburg|Werder Bremen~02.05.2026|Werder Bremen|Augsburg|1|3
Augsburg|Werder Bremen~20.12.2025|Augsburg|Werder Bremen|0|0
Augsburg|Werder Bremen~19.01.2025|Werder Bremen|Augsburg|0|2
Augsburg|Werder Bremen~24.08.2024|Augsburg|Werder Bremen|2|2
Dortmund|Stuttgart~19.09.2026|Stuttgart|Dortmund|0|1
Dortmund|Stuttgart~04.04.2026|Stuttgart|Dortmund|0|2
Dortmund|Stuttgart~22.11.2025|Dortmund|Stuttgart|3|3
Dortmund|Stuttgart~08.02.2025|Dortmund|Stuttgart|1|2
Dortmund|Stuttgart~22.09.2024|Stuttgart|Dortmund|5|1
Mainz|M’gladbach~19.09.2026|M’gladbach|Mainz|3|4
Mainz|M’gladbach~19.04.2026|M’gladbach|Mainz|1|1
Mainz|M’gladbach~05.12.2025|Mainz|M’gladbach|0|1
Mainz|M’gladbach~07.03.2025|M’gladbach|Mainz|1|3
Mainz|M’gladbach~25.10.2024|Mainz|M’gladbach|1|1
Hamburg|Köln~19.09.2026|Hamburg|Köln|2|1
Hamburg|Köln~14.03.2026|Hamburg|Köln|1|1
Hamburg|Köln~02.11.2025|Köln|Hamburg|4|1
Frankfurt|Freiburg~19.09.2026|Frankfurt|Freiburg|2|2
Frankfurt|Freiburg~01.03.2026|Frankfurt|Freiburg|2|0
Frankfurt|Freiburg~19.10.2025|Freiburg|Frankfurt|2|2
Frankfurt|Freiburg~17.05.2025|Freiburg|Frankfurt|1|3
Frankfurt|Freiburg~14.01.2025|Frankfurt|Freiburg|4|1
Bayern|Union Berlin~18.09.2026|Bayern|Union Berlin|7|0
Bayern|Union Berlin~21.03.2026|Bayern|Union Berlin|4|0
Bayern|Union Berlin~08.11.2025|Union Berlin|Bayern|2|2
Bayern|Union Berlin~15.03.2025|Union Berlin|Bayern|1|1
Bayern|Union Berlin~02.11.2024|Bayern|Union Berlin|3|0
Hamburg|Leipzig~13.09.2026|Leipzig|Hamburg|5|0
Hamburg|Leipzig~01.03.2026|Hamburg|Leipzig|1|2
Hamburg|Leipzig~18.10.2025|Leipzig|Hamburg|2|1
Bayern|Elversberg~13.09.2026|Elversberg|Bayern|1|2
Frankfurt|Mainz~12.09.2026|Mainz|Frankfurt|1|3
Frankfurt|Mainz~22.03.2026|Mainz|Frankfurt|2|1
Frankfurt|Mainz~09.11.2025|Frankfurt|Mainz|1|0
Frankfurt|Mainz~04.05.2025|Mainz|Frankfurt|1|1
Frankfurt|Mainz~21.12.2024|Frankfurt|Mainz|1|3
Köln|Werder Bremen~12.09.2026|Köln|Werder Bremen|1|1
Köln|Werder Bremen~12.04.2026|Köln|Werder Bremen|3|1
Köln|Werder Bremen~29.11.2025|Werder Bremen|Köln|1|1
Köln|Werder Bremen~16.02.2024|Köln|Werder Bremen|0|1
Köln|Werder Bremen~23.09.2023|Werder Bremen|Köln|2|1
Hoffenheim|Stuttgart~12.09.2026|Hoffenheim|Stuttgart|2|1
Hoffenheim|Stuttgart~02.05.2026|Hoffenheim|Stuttgart|3|3
Hoffenheim|Stuttgart~20.12.2025|Stuttgart|Hoffenheim|0|0
Hoffenheim|Stuttgart~23.02.2025|Hoffenheim|Stuttgart|1|1
Hoffenheim|Stuttgart~06.10.2024|Stuttgart|Hoffenheim|1|1
Freiburg|M’gladbach~12.09.2026|Freiburg|M’gladbach|5|0
Freiburg|M’gladbach~22.02.2026|Freiburg|M’gladbach|2|1
Freiburg|M’gladbach~05.10.2025|M’gladbach|Freiburg|0|0
Freiburg|M’gladbach~12.04.2025|M’gladbach|Freiburg|1|2
Freiburg|M’gladbach~30.11.2024|Freiburg|M’gladbach|3|1
Dortmund|Paderborn~12.09.2026|Dortmund|Paderborn|3|0
Augsburg|Leverkusen~12.09.2026|Augsburg|Leverkusen|2|2
Augsburg|Leverkusen~18.04.2026|Leverkusen|Augsburg|1|2
Augsburg|Leverkusen~06.12.2025|Augsburg|Leverkusen|2|0
Augsburg|Leverkusen~26.04.2025|Leverkusen|Augsburg|2|0
Augsburg|Leverkusen~14.12.2024|Augsburg|Leverkusen|0|2
Schalke|Union Berlin~11.09.2026|Union Berlin|Schalke|1|3
Schalke|Union Berlin~19.02.2023|Union Berlin|Schalke|0|0
Schalke|Union Berlin~27.08.2022|Schalke|Union Berlin|1|6
Hamburg|Mainz~06.09.2026|Hamburg|Mainz|0|5
Hamburg|Mainz~20.02.2026|Mainz|Hamburg|1|1
Hamburg|Mainz~05.10.2025|Hamburg|Mainz|4|0
Augsburg|Frankfurt~06.09.2026|Frankfurt|Augsburg|1|4
Augsburg|Frankfurt~25.04.2026|Augsburg|Frankfurt|1|1
Augsburg|Frankfurt~13.12.2025|Frankfurt|Augsburg|1|0
Augsburg|Frankfurt~20.04.2025|Augsburg|Frankfurt|0|0
Augsburg|Frankfurt~07.12.2024|Frankfurt|Augsburg|2|2
Leipzig|Werder Bremen~05.09.2026|Werder Bremen|Leipzig|3|1
Leipzig|Werder Bremen~04.04.2026|Werder Bremen|Leipzig|1|2
Leipzig|Werder Bremen~23.11.2025|Leipzig|Werder Bremen|2|0
Leipzig|Werder Bremen~10.05.2025|Werder Bremen|Leipzig|0|0
Leipzig|Werder Bremen~12.01.2025|Leipzig|Werder Bremen|4|2
Bayern|Schalke~05.09.2026|Schalke|Bayern|0|0
Bayern|Schalke~13.05.2023|Bayern|Schalke|6|0
Bayern|Schalke~12.11.2022|Schalke|Bayern|0|2
Freiburg|Paderborn~05.09.2026|Paderborn|Freiburg|0|1
Elversberg|M’gladbach~05.09.2026|M’gladbach|Elversberg|3|4
Leverkusen|Union Berlin~05.09.2026|Leverkusen|Union Berlin|4|0
Leverkusen|Union Berlin~21.02.2026|Union Berlin|Leverkusen|1|0
Leverkusen|Union Berlin~04.10.2025|Leverkusen|Union Berlin|2|0
Leverkusen|Union Berlin~12.04.2025|Leverkusen|Union Berlin|0|0
Leverkusen|Union Berlin~30.11.2024|Union Berlin|Leverkusen|1|2
Dortmund|Hoffenheim~05.09.2026|Hoffenheim|Dortmund|2|3
Dortmund|Hoffenheim~18.04.2026|Hoffenheim|Dortmund|2|1
Dortmund|Hoffenheim~07.12.2025|Dortmund|Hoffenheim|2|0
Dortmund|Hoffenheim~26.04.2025|Hoffenheim|Dortmund|2|3
Dortmund|Hoffenheim~15.12.2024|Dortmund|Hoffenheim|1|1
Köln|Stuttgart~04.09.2026|Stuttgart|Köln|4|1
Köln|Stuttgart~14.02.2026|Stuttgart|Köln|3|1
Köln|Stuttgart~28.09.2025|Köln|Stuttgart|1|2
Köln|Stuttgart~24.02.2024|Stuttgart|Köln|1|1
Köln|Stuttgart~30.09.2023|Köln|Stuttgart|0|2
Freiburg|Werder Bremen~30.08.2026|Freiburg|Werder Bremen|4|1
Freiburg|Werder Bremen~07.02.2026|Freiburg|Werder Bremen|1|0
Freiburg|Werder Bremen~20.09.2025|Werder Bremen|Freiburg|0|3
Freiburg|Werder Bremen~21.02.2025|Freiburg|Werder Bremen|5|0
Freiburg|Werder Bremen~05.10.2024|Werder Bremen|Freiburg|0|1
Augsburg|Schalke~30.08.2026|Augsburg|Schalke|3|0
Augsburg|Schalke~18.03.2023|Augsburg|Schalke|1|1
Augsburg|Schalke~02.10.2022|Schalke|Augsburg|2|3
Frankfurt|Union Berlin~29.08.2026|Union Berlin|Frankfurt|3|3
Frankfurt|Union Berlin~06.02.2026|Union Berlin|Frankfurt|1|1
Frankfurt|Union Berlin~21.09.2025|Frankfurt|Union Berlin|3|4
Frankfurt|Union Berlin~09.03.2025|Frankfurt|Union Berlin|1|2
Frankfurt|Union Berlin~27.10.2024|Union Berlin|Frankfurt|1|1
Mainz|Paderborn~29.08.2026|Mainz|Paderborn|0|0
Leipzig|M’gladbach~29.08.2026|Leipzig|M’gladbach|3|0
Leipzig|M’gladbach~11.04.2026|Leipzig|M’gladbach|1|0
Leipzig|M’gladbach~28.11.2025|M’gladbach|Leipzig|0|0
Leipzig|M’gladbach~29.03.2025|M’gladbach|Leipzig|1|0
Leipzig|M’gladbach~09.11.2024|Leipzig|M’gladbach|0|0
Hoffenheim|Köln~29.08.2026|Köln|Hoffenheim|3|2
Hoffenheim|Köln~21.02.2026|Köln|Hoffenheim|2|2
Hoffenheim|Köln~03.10.2025|Hoffenheim|Köln|0|1
Hoffenheim|Köln~11.02.2024|Hoffenheim|Köln|1|1
Hoffenheim|Köln~16.09.2023|Köln|Hoffenheim|1|3
Elversberg|Leverkusen~29.08.2026|Elversberg|Leverkusen|3|2
Dortmund|Hamburg~29.08.2026|Dortmund|Hamburg|2|0
Dortmund|Hamburg~21.03.2026|Dortmund|Hamburg|3|2
Dortmund|Hamburg~08.11.2025|Hamburg|Dortmund|1|1
Bayern|Stuttgart~28.08.2026|Bayern|Stuttgart|5|1
Bayern|Stuttgart~19.04.2026|Bayern|Stuttgart|4|2
Bayern|Stuttgart~06.12.2025|Stuttgart|Bayern|0|5
Bayern|Stuttgart~28.02.2025|Stuttgart|Bayern|1|3
Bayern|Stuttgart~19.10.2024|Bayern|Stuttgart|4|0
Hamburg|Leverkusen~16.05.2026|Leverkusen|Hamburg|1|1
Hamburg|Leverkusen~04.03.2026|Hamburg|Leverkusen|0|1
Freiburg|Leipzig~16.05.2026|Freiburg|Leipzig|4|1
Freiburg|Leipzig~14.01.2026|Leipzig|Freiburg|2|0
Freiburg|Leipzig~08.03.2025|Freiburg|Leipzig|0|0
Freiburg|Leipzig~26.10.2024|Leipzig|Freiburg|3|1
Freiburg|Leipzig~06.04.2024|Freiburg|Leipzig|1|4
Frankfurt|Stuttgart~16.05.2026|Frankfurt|Stuttgart|2|2
Frankfurt|Stuttgart~13.01.2026|Stuttgart|Frankfurt|3|2
Frankfurt|Stuttgart~29.03.2025|Frankfurt|Stuttgart|1|0
Frankfurt|Stuttgart~10.11.2024|Stuttgart|Frankfurt|2|3
Frankfurt|Stuttgart~13.04.2024|Stuttgart|Frankfurt|3|0
Bayern|Köln~16.05.2026|Bayern|Köln|5|1
Bayern|Köln~14.01.2026|Köln|Bayern|1|3
Bayern|Köln~13.04.2024|Bayern|Köln|2|0
Bayern|Köln~24.11.2023|Köln|Bayern|0|1
Bayern|Köln~27.05.2023|Köln|Bayern|1|2
Mainz|Union Berlin~10.05.2026|Mainz|Union Berlin|1|3
Mainz|Union Berlin~10.01.2026|Union Berlin|Mainz|2|2
Mainz|Union Berlin~19.01.2025|Union Berlin|Mainz|2|1
Mainz|Union Berlin~24.08.2024|Mainz|Union Berlin|1|1
Mainz|Union Berlin~07.02.2024|Mainz|Union Berlin|1|1
Freiburg|Hamburg~10.05.2026|Hamburg|Freiburg|3|2
Freiburg|Hamburg~10.01.2026|Freiburg|Hamburg|2|1
Leverkusen|Stuttgart~09.05.2026|Stuttgart|Leverkusen|3|1
Leverkusen|Stuttgart~10.01.2026|Leverkusen|Stuttgart|1|4
Leverkusen|Stuttgart~16.03.2025|Stuttgart|Leverkusen|3|4
Leverkusen|Stuttgart~01.11.2024|Leverkusen|Stuttgart|0|0
Leverkusen|Stuttgart~27.04.2024|Leverkusen|Stuttgart|2|2
Hoffenheim|Werder Bremen~09.05.2026|Hoffenheim|Werder Bremen|1|0
Hoffenheim|Werder Bremen~27.01.2026|Werder Bremen|Hoffenheim|0|2
Hoffenheim|Werder Bremen~16.02.2025|Werder Bremen|Hoffenheim|1|3
Hoffenheim|Werder Bremen~29.09.2024|Hoffenheim|Werder Bremen|3|4
Hoffenheim|Werder Bremen~03.03.2024|Hoffenheim|Werder Bremen|2|1
Augsburg|M’gladbach~09.05.2026|Augsburg|M’gladbach|3|1
Augsburg|M’gladbach~11.01.2026|M’gladbach|Augsburg|4|0
Augsburg|M’gladbach~22.02.2025|M’gladbach|Augsburg|0|3
Augsburg|M’gladbach~04.10.2024|Augsburg|M’gladbach|2|1
Augsburg|M’gladbach~21.01.2024|M’gladbach|Augsburg|1|2
Dortmund|M’gladbach~03.05.2026|M’gladbach|Dortmund|1|0
Dortmund|M’gladbach~19.12.2025|Dortmund|M’gladbach|2|0
Dortmund|M’gladbach~20.04.2025|Dortmund|M’gladbach|3|2
Dortmund|M’gladbach~07.12.2024|M’gladbach|Dortmund|1|1
Dortmund|M’gladbach~13.04.2024|M’gladbach|Dortmund|1|2
Köln|Union Berlin~02.05.2026|Union Berlin|Köln|2|2
Köln|Union Berlin~20.12.2025|Köln|Union Berlin|0|1
Köln|Union Berlin~11.05.2024|Köln|Union Berlin|3|2
Köln|Union Berlin~20.12.2023|Union Berlin|Köln|2|0
Köln|Union Berlin~04.03.2023|Union Berlin|Köln|0|0
Frankfurt|Hamburg~02.05.2026|Frankfurt|Hamburg|1|2
Frankfurt|Hamburg~20.12.2025|Hamburg|Frankfurt|1|1
Stuttgart|Werder Bremen~26.04.2026|Stuttgart|Werder Bremen|1|1
Stuttgart|Werder Bremen~14.12.2025|Werder Bremen|Stuttgart|0|4
Stuttgart|Werder Bremen~13.04.2025|Stuttgart|Werder Bremen|1|2
Stuttgart|Werder Bremen~30.11.2024|Werder Bremen|Stuttgart|2|2
Stuttgart|Werder Bremen~21.04.2024|Werder Bremen|Stuttgart|2|1
Dortmund|Freiburg~26.04.2026|Dortmund|Freiburg|4|0
Dortmund|Freiburg~14.12.2025|Freiburg|Dortmund|1|1
Dortmund|Freiburg~05.04.2025|Freiburg|Dortmund|1|4
Dortmund|Freiburg~23.11.2024|Dortmund|Freiburg|4|0
Dortmund|Freiburg~09.02.2024|Dortmund|Freiburg|3|0
Bayern|Mainz~25.04.2026|Mainz|Bayern|3|4
Bayern|Mainz~14.12.2025|Bayern|Mainz|2|2
Bayern|Mainz~26.04.2025|Bayern|Mainz|3|0
Bayern|Mainz~14.12.2024|Mainz|Bayern|2|1
Bayern|Mainz~09.03.2024|Bayern|Mainz|8|1
Köln|Leverkusen~25.04.2026|Köln|Leverkusen|1|2
Köln|Leverkusen~13.12.2025|Leverkusen|Köln|2|0
Köln|Leverkusen~03.03.2024|Köln|Leverkusen|0|2
Köln|Leverkusen~08.10.2023|Leverkusen|Köln|3|0
Köln|Leverkusen~05.05.2023|Leverkusen|Köln|1|2
Leipzig|Union Berlin~24.04.2026|Leipzig|Union Berlin|3|1
Leipzig|Union Berlin~12.12.2025|Union Berlin|Leipzig|3|1
Leipzig|Union Berlin~01.02.2025|Union Berlin|Leipzig|0|0
Leipzig|Union Berlin~14.09.2024|Leipzig|Union Berlin|0|0
Leipzig|Union Berlin~04.02.2024|Leipzig|Union Berlin|2|0
Hamburg|Werder Bremen~18.04.2026|Werder Bremen|Hamburg|3|1
Hamburg|Werder Bremen~07.12.2025|Hamburg|Werder Bremen|3|2
Freiburg|Mainz~12.04.2026|Mainz|Freiburg|0|1
Freiburg|Mainz~30.11.2025|Freiburg|Mainz|4|0
Freiburg|Mainz~15.03.2025|Mainz|Freiburg|2|2
Freiburg|Mainz~03.11.2024|Freiburg|Mainz|0|0
Freiburg|Mainz~21.04.2024|Freiburg|Mainz|1|1
Dortmund|Leverkusen~11.04.2026|Dortmund|Leverkusen|0|1
Dortmund|Leverkusen~29.11.2025|Leverkusen|Dortmund|1|2
Dortmund|Leverkusen~11.05.2025|Leverkusen|Dortmund|2|4
Dortmund|Leverkusen~10.01.2025|Dortmund|Leverkusen|2|3
Dortmund|Leverkusen~21.04.2024|Dortmund|Leverkusen|1|1
Augsburg|Hoffenheim~10.04.2026|Augsburg|Hoffenheim|2|2
Augsburg|Hoffenheim~29.11.2025|Hoffenheim|Augsburg|3|0
Augsburg|Hoffenheim~29.03.2025|Hoffenheim|Augsburg|1|1
Augsburg|Hoffenheim~10.11.2024|Augsburg|Hoffenheim|0|0
Augsburg|Hoffenheim~07.04.2024|Hoffenheim|Augsburg|3|1
Hoffenheim|Mainz~04.04.2026|Hoffenheim|Mainz|1|2
Hoffenheim|Mainz~21.11.2025|Mainz|Hoffenheim|1|1
Hoffenheim|Mainz~12.04.2025|Hoffenheim|Mainz|2|0
Hoffenheim|Mainz~01.12.2024|Mainz|Hoffenheim|2|0
Hoffenheim|Mainz~13.04.2024|Mainz|Hoffenheim|4|1
Augsburg|Hamburg~04.04.2026|Hamburg|Augsburg|1|1
Augsburg|Hamburg~22.11.2025|Augsburg|Hamburg|1|0
Augsburg|Stuttgart~22.03.2026|Augsburg|Stuttgart|2|5
Augsburg|Stuttgart~09.11.2025|Stuttgart|Augsburg|3|2
Augsburg|Stuttgart~11.05.2025|Stuttgart|Augsburg|4|0
Augsburg|Stuttgart~12.01.2025|Augsburg|Stuttgart|0|1
Augsburg|Stuttgart~10.05.2024|Augsburg|Stuttgart|0|1
Hoffenheim|Leipzig~20.03.2026|Leipzig|Hoffenheim|5|0
Hoffenheim|Leipzig~08.11.2025|Hoffenheim|Leipzig|3|1
Hoffenheim|Leipzig~05.04.2025|Leipzig|Hoffenheim|3|1
Hoffenheim|Leipzig~23.11.2024|Hoffenheim|Leipzig|4|3
Hoffenheim|Leipzig~03.05.2024|Hoffenheim|Leipzig|1|1
Leipzig|Stuttgart~15.03.2026|Stuttgart|Leipzig|1|0
Leipzig|Stuttgart~01.11.2025|Leipzig|Stuttgart|3|1
Leipzig|Stuttgart~17.05.2025|Leipzig|Stuttgart|2|3
Leipzig|Stuttgart~15.01.2025|Stuttgart|Leipzig|2|1
Leipzig|Stuttgart~27.01.2024|Stuttgart|Leipzig|5|2
Freiburg|Union Berlin~15.03.2026|Freiburg|Union Berlin|0|1
Freiburg|Union Berlin~01.11.2025|Union Berlin|Freiburg|0|0
Freiburg|Union Berlin~30.03.2025|Freiburg|Union Berlin|1|2
Freiburg|Union Berlin~08.11.2024|Union Berlin|Freiburg|0|0
Freiburg|Union Berlin~18.05.2024|Union Berlin|Freiburg|2|1
Bayern|Leverkusen~14.03.2026|Leverkusen|Bayern|1|1
Bayern|Leverkusen~01.11.2025|Bayern|Leverkusen|3|0
Bayern|Leverkusen~15.02.2025|Leverkusen|Bayern|0|0
Bayern|Leverkusen~28.09.2024|Bayern|Leverkusen|1|1
Bayern|Leverkusen~10.02.2024|Leverkusen|Bayern|3|0
Augsburg|Dortmund~14.03.2026|Dortmund|Augsburg|2|0
Augsburg|Dortmund~31.10.2025|Augsburg|Dortmund|0|1
Augsburg|Dortmund~08.03.2025|Dortmund|Augsburg|0|1
Augsburg|Dortmund~26.10.2024|Augsburg|Dortmund|2|1
Augsburg|Dortmund~04.05.2024|Dortmund|Augsburg|5|1
Union Berlin|Werder Bremen~08.03.2026|Union Berlin|Werder Bremen|1|4
Union Berlin|Werder Bremen~24.10.2025|Werder Bremen|Union Berlin|1|0
Union Berlin|Werder Bremen~03.05.2025|Union Berlin|Werder Bremen|2|2
Union Berlin|Werder Bremen~21.12.2024|Werder Bremen|Union Berlin|4|1
Union Berlin|Werder Bremen~16.03.2024|Union Berlin|Werder Bremen|2|1
Mainz|Stuttgart~07.03.2026|Mainz|Stuttgart|2|2
Mainz|Stuttgart~26.10.2025|Stuttgart|Mainz|2|1
Mainz|Stuttgart~25.01.2025|Mainz|Stuttgart|2|0
Mainz|Stuttgart~31.08.2024|Stuttgart|Mainz|3|3
Mainz|Stuttgart~11.02.2024|Stuttgart|Mainz|3|1
Augsburg|Leipzig~07.03.2026|Leipzig|Augsburg|2|1
Augsburg|Leipzig~25.10.2025|Augsburg|Leipzig|0|6
Augsburg|Leipzig~14.02.2025|Augsburg|Leipzig|0|0
Augsburg|Leipzig~28.09.2024|Leipzig|Augsburg|4|0
Augsburg|Leipzig~10.02.2024|Augsburg|Leipzig|2|2
Dortmund|Köln~07.03.2026|Köln|Dortmund|1|2
Dortmund|Köln~25.10.2025|Dortmund|Köln|1|0
Dortmund|Köln~20.01.2024|Köln|Dortmund|0|4
Dortmund|Köln~19.08.2023|Dortmund|Köln|1|0
Dortmund|Köln~18.03.2023|Dortmund|Köln|6|1
Bayern|M’gladbach~06.03.2026|Bayern|M’gladbach|4|1
Bayern|M’gladbach~25.10.2025|M’gladbach|Bayern|0|3
Bayern|M’gladbach~10.05.2025|Bayern|M’gladbach|2|0
Bayern|M’gladbach~11.01.2025|M’gladbach|Bayern|0|1
Bayern|M’gladbach~03.02.2024|Bayern|M’gladbach|3|1
M’gladbach|Union Berlin~28.02.2026|M’gladbach|Union Berlin|1|0
M’gladbach|Union Berlin~17.10.2025|Union Berlin|M’gladbach|3|1
M’gladbach|Union Berlin~15.02.2025|Union Berlin|M’gladbach|1|2
M’gladbach|Union Berlin~28.09.2024|M’gladbach|Union Berlin|1|0
M’gladbach|Union Berlin~28.04.2024|M’gladbach|Union Berlin|0|0
Bayern|Dortmund~28.02.2026|Dortmund|Bayern|2|3
Bayern|Dortmund~18.10.2025|Bayern|Dortmund|2|1
Bayern|Dortmund~12.04.2025|Bayern|Dortmund|2|2
Bayern|Dortmund~30.11.2024|Dortmund|Bayern|1|1
Bayern|Dortmund~30.03.2024|Bayern|Dortmund|0|2
Augsburg|Köln~27.02.2026|Augsburg|Köln|2|0
Augsburg|Köln~18.10.2025|Köln|Augsburg|1|1
Augsburg|Köln~31.03.2024|Augsburg|Köln|1|1
Augsburg|Köln~04.11.2023|Köln|Augsburg|1|1
Augsburg|Köln~08.04.2023|Augsburg|Köln|1|3
Dortmund|Leipzig~21.02.2026|Leipzig|Dortmund|2|2
Dortmund|Leipzig~04.10.2025|Dortmund|Leipzig|1|1
Dortmund|Leipzig~15.03.2025|Leipzig|Dortmund|2|0
Dortmund|Leipzig~02.11.2024|Dortmund|Leipzig|2|1
Dortmund|Leipzig~27.04.2024|Leipzig|Dortmund|4|1
Bayern|Frankfurt~21.02.2026|Bayern|Frankfurt|3|2
Bayern|Frankfurt~04.10.2025|Frankfurt|Bayern|0|3
Bayern|Frankfurt~23.02.2025|Bayern|Frankfurt|4|0
Bayern|Frankfurt~06.10.2024|Frankfurt|Bayern|3|3
Bayern|Frankfurt~27.04.2024|Bayern|Frankfurt|2|1
Bayern|Werder Bremen~14.02.2026|Werder Bremen|Bayern|0|3
Bayern|Werder Bremen~26.09.2025|Bayern|Werder Bremen|4|0
Bayern|Werder Bremen~07.02.2025|Bayern|Werder Bremen|3|0
Bayern|Werder Bremen~21.09.2024|Werder Bremen|Bayern|0|5
Bayern|Werder Bremen~21.01.2024|Bayern|Werder Bremen|0|1
Freiburg|Hoffenheim~14.02.2026|Hoffenheim|Freiburg|3|0
Freiburg|Hoffenheim~28.09.2025|Freiburg|Hoffenheim|1|1
Freiburg|Hoffenheim~19.04.2025|Freiburg|Hoffenheim|3|2
Freiburg|Hoffenheim~08.12.2024|Hoffenheim|Freiburg|1|1
Freiburg|Hoffenheim~20.01.2024|Freiburg|Hoffenheim|3|2
Hamburg|Union Berlin~14.02.2026|Hamburg|Union Berlin|3|2
Hamburg|Union Berlin~28.09.2025|Union Berlin|Hamburg|0|0
Frankfurt|M’gladbach~14.02.2026|Frankfurt|M’gladbach|3|0
Frankfurt|M’gladbach~27.09.2025|M’gladbach|Frankfurt|4|6
Frankfurt|M’gladbach~08.02.2025|M’gladbach|Frankfurt|1|1
Frankfurt|M’gladbach~21.09.2024|Frankfurt|M’gladbach|2|0
Frankfurt|M’gladbach~11.05.2024|M’gladbach|Frankfurt|1|1
Dortmund|Mainz~13.02.2026|Dortmund|Mainz|4|0
Dortmund|Mainz~27.09.2025|Mainz|Dortmund|0|2
Dortmund|Mainz~30.03.2025|Dortmund|Mainz|3|1
Dortmund|Mainz~09.11.2024|Mainz|Dortmund|3|1
Dortmund|Mainz~11.05.2024|Mainz|Dortmund|3|0
Köln|Leipzig~08.02.2026|Köln|Leipzig|1|2
Köln|Leipzig~20.09.2025|Leipzig|Köln|3|1
Köln|Leipzig~15.03.2024|Köln|Leipzig|1|5
Köln|Leipzig~28.10.2023|Leipzig|Köln|6|0
Köln|Leipzig~04.02.2023|Köln|Leipzig|0|0
Bayern|Hoffenheim~08.02.2026|Bayern|Hoffenheim|5|1
Bayern|Hoffenheim~20.09.2025|Hoffenheim|Bayern|1|4
Bayern|Hoffenheim~17.05.2025|Hoffenheim|Bayern|0|4
Bayern|Hoffenheim~15.01.2025|Bayern|Hoffenheim|5|0
Bayern|Hoffenheim~18.05.2024|Hoffenheim|Bayern|4|2
Leverkusen|M’gladbach~07.02.2026|M’gladbach|Leverkusen|1|1
Leverkusen|M’gladbach~21.09.2025|Leverkusen|M’gladbach|1|1
Leverkusen|M’gladbach~18.01.2025|Leverkusen|M’gladbach|3|1
Leverkusen|M’gladbach~23.08.2024|M’gladbach|Leverkusen|2|3
Leverkusen|M’gladbach~27.01.2024|Leverkusen|M’gladbach|0|0
Augsburg|Mainz~07.02.2026|Mainz|Augsburg|2|0
Augsburg|Mainz~20.09.2025|Augsburg|Mainz|1|4
Augsburg|Mainz~08.02.2025|Mainz|Augsburg|0|0
Augsburg|Mainz~20.09.2024|Augsburg|Mainz|2|3
Augsburg|Mainz~17.02.2024|Mainz|Augsburg|1|0
Freiburg|Stuttgart~01.02.2026|Stuttgart|Freiburg|1|0
Freiburg|Stuttgart~13.09.2025|Freiburg|Stuttgart|3|1
Freiburg|Stuttgart~18.01.2025|Stuttgart|Freiburg|4|0
Freiburg|Stuttgart~24.08.2024|Freiburg|Stuttgart|3|1
Freiburg|Stuttgart~03.02.2024|Freiburg|Stuttgart|1|3
M’gladbach|Werder Bremen~31.01.2026|Werder Bremen|M’gladbach|1|1
M’gladbach|Werder Bremen~14.09.2025|M’gladbach|Werder Bremen|0|4
M’gladbach|Werder Bremen~15.03.2025|Werder Bremen|M’gladbach|2|4
M’gladbach|Werder Bremen~03.11.2024|M’gladbach|Werder Bremen|4|1
M’gladbach|Werder Bremen~04.05.2024|Werder Bremen|M’gladbach|2|2
Leipzig|Mainz~31.01.2026|Leipzig|Mainz|1|2
Leipzig|Mainz~13.09.2025|Mainz|Leipzig|0|1
Leipzig|Mainz~01.03.2025|Leipzig|Mainz|1|2
Leipzig|Mainz~19.10.2024|Mainz|Leipzig|0|2
Leipzig|Mainz~30.03.2024|Leipzig|Mainz|0|0
Hoffenheim|Union Berlin~31.01.2026|Hoffenheim|Union Berlin|3|1
Hoffenheim|Union Berlin~13.09.2025|Union Berlin|Hoffenheim|2|4
Hoffenheim|Union Berlin~08.02.2025|Hoffenheim|Union Berlin|0|4
Hoffenheim|Union Berlin~21.09.2024|Union Berlin|Hoffenheim|2|1
Hoffenheim|Union Berlin~17.02.2024|Hoffenheim|Union Berlin|0|1
Bayern|Hamburg~31.01.2026|Hamburg|Bayern|2|2
Bayern|Hamburg~13.09.2025|Bayern|Hamburg|5|0
Frankfurt|Leverkusen~31.01.2026|Frankfurt|Leverkusen|1|3
Frankfurt|Leverkusen~12.09.2025|Leverkusen|Frankfurt|3|1
Frankfurt|Leverkusen~01.03.2025|Frankfurt|Leverkusen|1|4
Frankfurt|Leverkusen~19.10.2024|Leverkusen|Frankfurt|2|1
Frankfurt|Leverkusen~05.05.2024|Frankfurt|Leverkusen|1|5
Freiburg|Köln~25.01.2026|Freiburg|Köln|2|1
Freiburg|Köln~31.08.2025|Köln|Freiburg|4|1
Freiburg|Köln~04.05.2024|Köln|Freiburg|0|0
Freiburg|Köln~17.12.2023|Freiburg|Köln|2|0
Freiburg|Köln~29.04.2023|Köln|Freiburg|0|1
Leverkusen|Werder Bremen~24.01.2026|Leverkusen|Werder Bremen|1|0
Leverkusen|Werder Bremen~30.08.2025|Werder Bremen|Leverkusen|3|3
Leverkusen|Werder Bremen~08.03.2025|Leverkusen|Werder Bremen|0|2
Leverkusen|Werder Bremen~26.10.2024|Werder Bremen|Leverkusen|2|2
Leverkusen|Werder Bremen~14.04.2024|Leverkusen|Werder Bremen|5|0
Frankfurt|Hoffenheim~24.01.2026|Frankfurt|Hoffenheim|1|3
Frankfurt|Hoffenheim~30.08.2025|Hoffenheim|Frankfurt|1|3
Frankfurt|Hoffenheim~26.01.2025|Hoffenheim|Frankfurt|2|2
Frankfurt|Hoffenheim~31.08.2024|Frankfurt|Hoffenheim|3|1
Frankfurt|Hoffenheim~10.03.2024|Frankfurt|Hoffenheim|3|1
Stuttgart|Union Berlin~18.01.2026|Stuttgart|Union Berlin|1|1
Stuttgart|Union Berlin~23.08.2025|Union Berlin|Stuttgart|2|1
Stuttgart|Union Berlin~19.04.2025|Union Berlin|Stuttgart|4|4
Stuttgart|Union Berlin~06.12.2024|Stuttgart|Union Berlin|3|2
Stuttgart|Union Berlin~08.03.2024|Stuttgart|Union Berlin|2|0
Augsburg|Freiburg~18.01.2026|Augsburg|Freiburg|2|2
Augsburg|Freiburg~23.08.2025|Freiburg|Augsburg|1|3
Augsburg|Freiburg~02.03.2025|Augsburg|Freiburg|0|0
Augsburg|Freiburg~19.10.2024|Freiburg|Augsburg|3|1
Augsburg|Freiburg~25.02.2024|Augsburg|Freiburg|2|1
Köln|Mainz~17.01.2026|Köln|Mainz|2|1
Köln|Mainz~24.08.2025|Mainz|Köln|0|1
Köln|Mainz~28.04.2024|Mainz|Köln|1|1
Köln|Mainz~10.12.2023|Köln|Mainz|0|0
Köln|Mainz~15.04.2023|Köln|Mainz|1|1
Hamburg|M’gladbach~17.01.2026|Hamburg|M’gladbach|0|0
Hamburg|M’gladbach~24.08.2025|M’gladbach|Hamburg|0|0
Frankfurt|Werder Bremen~16.01.2026|Werder Bremen|Frankfurt|3|3
Frankfurt|Werder Bremen~23.08.2025|Frankfurt|Werder Bremen|4|1
Frankfurt|Werder Bremen~05.04.2025|Werder Bremen|Frankfurt|2|0
Frankfurt|Werder Bremen~23.11.2024|Frankfurt|Werder Bremen|1|0
Frankfurt|Werder Bremen~05.04.2024|Frankfurt|Werder Bremen|1|1
Leipzig|Schalke~27.05.2023|Leipzig|Schalke|4|2
Leipzig|Schalke~24.01.2023|Schalke|Leipzig|1|6
Frankfurt|Schalke~20.05.2023|Schalke|Frankfurt|2|2
Frankfurt|Schalke~21.01.2023|Frankfurt|Schalke|3|0
Schalke|Werder Bremen~29.04.2023|Schalke|Werder Bremen|2|1
Schalke|Werder Bremen~05.11.2022|Werder Bremen|Schalke|2|1
Hoffenheim|Schalke~09.04.2023|Hoffenheim|Schalke|2|0
Hoffenheim|Schalke~14.10.2022|Schalke|Hoffenheim|0|3
Leverkusen|Schalke~01.04.2023|Schalke|Leverkusen|0|3
Leverkusen|Schalke~08.10.2022|Leverkusen|Schalke|4|0
Dortmund|Schalke~11.03.2023|Schalke|Dortmund|2|2
Dortmund|Schalke~17.09.2022|Dortmund|Schalke|1|0
Schalke|Stuttgart~25.02.2023|Schalke|Stuttgart|2|1
Schalke|Stuttgart~03.09.2022|Stuttgart|Schalke|1|1
M’gladbach|Schalke~04.02.2023|M’gladbach|Schalke|0|0
M’gladbach|Schalke~13.08.2022|Schalke|M’gladbach|2|2`;
BLHH.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
recalc();
const SEEN=new Set();Object.keys(SLG).forEach(t=>SLG[t].filter(r=>r.H).forEach(r=>SEEN.add([(TM[t]||{}).l,t,r.o].join('|'))));
function addH(txt){let n=0;txt.split('\n').forEach(l=>{const[c,h,a,x,y,d]=l.split('|'),k=[c,h,a].join('|');if(!y||SEEN.has(k))return;SEEN.add(k);n++;[[h,a,+x,+y,1],[a,h,+y,+x,0]].forEach(([t,o,f,g,H])=>{const q=SLG[t]=SLG[t]||[];q.push({w:q.length+1,H,o,f,c:g,r:f>g?'G':f==g?'B':'M'})});const key=[h,a].sort().join('|');HH[key]=[{d:d||'',h,a,x:+x,y:+y},...(HH[key]||[])].slice(0,5);RES[k]=x+'-'+y});return n}
function recalc(){['PL','LL','SA','BL','SL','L1','ERE','POR','BEL','SCO'].forEach(lg=>{const ts=Object.keys(TM).filter(t=>TM[t].l==lg&&SLG[t]&&SLG[t].length);ts.forEach(t=>{let w=0,d=0,o=0,f=0,a=0;SLG[t].forEach(r=>{f+=r.f;a+=r.c;r.r=='G'?w++:r.r=='B'?d++:o++});Object.assign(TM[t],{w,d,o,f,a,p:w*3+d})});ts.sort((x,y)=>TM[y].p-TM[x].p||(TM[y].f-TM[y].a)-(TM[x].f-TM[x].a)||TM[y].f-TM[x].f).forEach((t,i)=>{TM[t].r=i+1})})}
let LVD={},STX={},CURM=null;
const evp=(m,side,nm)=>{if(!m||!nm||/^\(/.test(nm))return nm||'';let tm=side=='a'?m.a:m.h;const own=/kendi kalesine|\(kk\)/.test(nm);if(own)tm=side=='a'?m.h:m.a;let k=null;try{k=plFind(tm,nm.replace(/\s*\([^)]*\)/g,''))}catch(e){}return k?`<span class='pln' data-pl="${k}">${nm}</span>`:nm};
const evh=(ev,m)=>{if(!ev.length)return"<div class='mut'>Önemli an verisi: doğrulanmış olay yok.</div>";const ic={g:'⚽',y:'🟨',r:'🟥',s:'🔁'};return"<div class='evl'>"+(ev.some(e=>!e||typeof e!='object')?[...ev].reverse():[...ev].sort((x,y)=>(y.k=='ht'?45.5:+y.m||0)-(x.k=='ht'?45.5:+x.m||0))).map(e=>{if(typeof e=='string')return`<div class='tr'>${e}</div>`;if(e.k=='ht')return`<div class='evd'>${e.n||'HT'} ${e.sc}</div>`;if(e.k=='ex')return`<div class='evd'>${e.n}</div>`;const nm=x=>x&&!/^\(/.test(x)?x:'',pn=x=>evp(m,e.s,nm(x)),t=e.k=='s'?`<b class='on'>▲ ${pn(e.a)}</b><span class='of'>▼ ${pn(e.b)}</span>`:`<b>${pn(e.a)}</b>${nm(e.b)?`<span class='of'>${e.k=='g'?'asist: ':''}${pn(e.b)}</span>`:''}`;const sc=e.k=='g'&&e.sc?`<i class='pill'>${e.sc}</i>`:'';return`<div class='ev ${e.s=='a'?'ra':''} evk-${e.k}'><span class='em'>${+e.m>90?'90+'+(e.m-90):e.m}'</span><span>${ic[e.k]||''}</span>${sc}<div class='et'>${t}</div></div>`}).join('')+'</div>'};
let NW=[];const nwh=tms=>{const dn=d=>{const[y,m,dd2]=d.split('-');return`${dd2}/${m}/${y.slice(2)}`},it=NW.filter(x=>tms.includes(x.tm)).slice(0,6);if(!it.length)return'';return`<div class='box nwb'><h3>Son dakika · takım haberleri</h3>${it.map(x=>`<div class='nw'><div class='nwh'><b data-tm="${x.tm}">${x.tm}</b><span>${dn(x.d)}${x.h?' · '+x.h:''}</span></div><div>${x.x}</div><div class='mut'>Kaynak: ${x.src}</div></div>`).join('')}</div>`};
const lvbox0=m=>{const z0=stt(m),v=LVD[[m.c,m.h,m.a].join('|')];if(!v){if(z0.k=='ft'||z0.k=='live'||z0.k=='unk'||z0.k=='on')return`<div class='box'><h3>Maç özeti</h3><div class='mut'>${z0.sc?`Skor ${z0.sc[0]}-${z0.sc[1]}. `:'Skor henüz bulunamadı. '}Gol, kart ve değişiklik verisi henüz bulunamadı; kaynaklardan çekilene kadar aranıyor.</div></div>`;return''}const st=v.st||{},row=(l,k)=>st[k]?`<div class='tb2'><b>${st[k][0]}</b><span>${l}</span><b>${st[k][1]}</b></div>`:'';return`<div class='box'><h3>${stt(m).k=='ft'?'Maç özeti':'Canlı gidişat'} · ${v.m} · ${v.at}</h3>${evh(v.ev||[],m)}${(()=>{const sc=z0.sc;if(!sc)return'';const tot=(+sc[0]||0)+(+sc[1]||0),got=(v.ev||[]).filter(e=>e&&e.k=='g').length;return got<tot?`<div class='mut' style='color:#e8a33d'>Skor ${sc[0]}-${sc[1]}: ${tot} golün ${got}'i kayıtlı. Eksik gol bilgisi henüz bulunamadı, aranıyor.</div>`:''})()}<div class='tb2'><b class='tmc' data-tm="${m.h}">${m.h}</b><span></span><b class='tmc' data-tm="${m.a}">${m.a}</b></div>${row('Topla oynama %','pos')}${row('Şut','sh')}${row('İsabetli şut','sot')}${row('Korner','co')}${row('Faul','fo')}${row('Sarı kart','yc')}${row('Kırmızı kart','rc')}<div class='mut'>Kaynak: ${v.src}. Sayfa canlı güncellenmez; ben “güncelle” yazınca yenilerim.</div></div>`};
const stE=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stRc=r=>{r=+r;return!(r>0)?'#7f8ea0':r>=8?'#2f9fd8':r>=7?'#2fb15a':r>=6.5?'#c9a521':r>=6?'#e8873d':'#e0443a'};
const stN=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
const stRow=(m,n,nm)=>{const x=STX[mkey(m)];if(!x||!x.p)return null;const L=x.p[n==m.h?'h':'a'];if(!Array.isArray(L)||!L.length)return null;const q=stN(nm);if(!q)return null;let r=L.find(p=>stN(p[0])==q);if(r)return r;const lt=q.split(' ').pop(),c=L.filter(p=>stN(p[0]).split(' ').includes(lt));if(c.length==1)return c[0];if(c.length>1){const c2=c.filter(p=>stN(p[0])[0]==q[0]);if(c2.length==1)return c2[0]}const c3=L.filter(p=>q.includes(stN(p[0]))&&stN(p[0]).length>3);return c3.length==1?c3[0]:null};
const stDec=r=>{if(!r)return{b:'',i:'',s:''};const rt=!isNaN(+r[2])&&r[2]!==''&&r[2]!=null?`<b class='prt' style='background:${stRc(r[2])}'>${(+r[2]).toFixed(1)}</b>`:'',g=+r[4]||0,a=+r[5]||0,c=String(r[9]||''),sb=String(r[10]||'');let ic='';if(g)ic+=`<i class='ico'>⚽${g>1?g:''}</i>`;if(a)ic+=`<i class='ico'>👟${a>1?a:''}</i>`;if(c=='Y'||c=='YR')ic+="<i class='ico cy'></i>";if(c=='R'||c=='YR')ic+="<i class='ico cr'></i>";const s2=sb[0]=='▼'?`<em class='sbo of'>${stE(sb)}'</em>`:sb[0]=='▲'?`<em class='sbo on'>${stE(sb)}'</em>`:'';return{b:rt,i:ic?`<span class='ics'>${ic}</span>`:'',s:s2}};
const stSubs=(m,n)=>{const x=STX[mkey(m)];if(!x||!x.p)return'';const L=(x.p[n==m.h?'h':'a']||[]).filter(p=>String(p[10]||'')[0]=='▲');if(!L.length)return'';return`<h4>Oyuna girenler</h4><div class='pgr' style='gap:20px 0'>${L.map(p=>shirtP(n,p[0])).join('')}</div>`};
const stAll=(m,n)=>{const x=STX[mkey(m)];if(!x||!x.p)return'';const L=x.p[n==m.h?'h':'a'];if(!Array.isArray(L)||!L.length)return'';const st=L.filter(p=>String(p[10]||'')[0]!='▲'),sb=L.filter(p=>String(p[10]||'')[0]=='▲');return`<div class='box lvt'><div class='lvh'>${bd(n,1)}<b>${n}</b><span>Maçta oynayanlar</span></div><div class='pgr'>${st.concat(sb).map(p=>shirtP(n,p[0])).join('')}</div></div>`};
const stStat=m=>{const x=STX[mkey(m)];if(!x||!Array.isArray(x.t)||!x.t.length)return"<div class='box'><div class='mut'>Bu maç için istatistik verisi yok. Kaynak güncellenince eklenir.</div></div>";const T={};x.t.forEach(r=>T[r[0]]=[r[1],r[2]]);let hc=(TC[m.h]||['#4a5a68'])[0],ac=(TC[m.a]||['#4a5a68'])[0];try{if(Math.abs(lum(hc)-lum(ac))<.12)ac='#e8a33d'}catch(e){}const LOW=['Faul','Ofsayt','Sarı kart','Kırmızı kart'],bar=l=>{const v=T[l];if(!v)return'';const a=+v[0],b=+v[1],t=a+b,ok=t>0&&!isNaN(t),wa=ok?a/t*100:0,wb=ok?b/t*100:0;let ha=a>b,hb=b>a;if(LOW.includes(l)){ha=a<b;hb=b<a}if(a==b){ha=hb=true}return`<div class='sbk'><div class='sbv'><b class='${a!=b&&ha?'ld':''}'>${stE(v[0])}</b><span${l.includes('xG')?" style='color:#7b7ff6'":''}>${stE(l)}</span><b class='${a!=b&&hb?'ld':''}'>${stE(v[1])}</b></div><div class='sbb'><div class='sbt'><i style='width:${wa}%;background:${ha?'#44c554':'#2d6b3a'}'></i></div><div class='sbt r'><i style='width:${wb}%;background:${hb?'#7b7ff6':'#42468a'}'></i></div></div></div>`};const pos=T['Topla oynama %'],pa=pos?(+pos[0]/((+pos[0])+(+pos[1])||1)*100):0;const sec=[['Genel bakış',['Beklenen gol (xG)','Toplam pas','İsabetli pas','Korner','Faul','Ofsayt','Kaleci kurtarışı']],['Şutlar',['Şut','İsabetli şut','İsabetsiz şut','Engellenen şut','Ceza sahası içi şut','Ceza sahası dışı şut']],['Disiplin',['Sarı kart','Kırmızı kart']]].map(([h,ls])=>{const b=ls.map(bar).join('');return b?`<div class='sbh'>${h}</div>${b}`:''}).join('');return`<div class='box sbx' style='--hc:${hc};--ac:${ac};--hf:${lum(hc)>.55?'#111':'#fff'};--af:${lum(ac)>.55?'#111':'#fff'}'><div style='display:flex;justify-content:space-between;align-items:center;gap:8px'><div style='display:flex;align-items:center;gap:8px;font:700 16px var(--n)'>${bd(m.h,1)}<b>${m.h}</b></div><div style='display:flex;align-items:center;gap:8px;font:700 16px var(--n);text-align:right'><b>${m.a}</b>${bd(m.a,1)}</div></div>${pos?`<div class='sbp'><b style='background:#44c554'>${stE(pos[0])}%</b><span>Topla oynama</span><b style='background:#7b7ff6'>${stE(pos[1])}%</b></div><div class='sbbig'><i style='width:${pa}%;background:#44c554'></i><i style='width:${100-pa}%;background:#7b7ff6'></i></div>`:''}${sec}${x.note?`<div class='mut' style='color:#e8a33d;margin-top:8px'>${stE(x.note)}</div>`:''}<div class='mut' style='margin-top:6px'>Kaynak: ${stE(x.src||'?')}${x.at?', '+stE(x.at):''}. Sayfa canlı güncellenmez; ben “güncelle” yazınca yenilerim.</div></div>`};
const lvbox=lvbox0;
let RT=null,RM='';
const ss=()=>{const e=$('#rs');if(e)e.textContent=LGC?`Son güncelleme: ${LGC}`:'Son güncelleme: veri yok'};
let KMC=0,KMCH={};const KMSEED={"favs/latest": {"list": ["Galatasaray", "Man City", "Real Madrid", "Bayern", "PSG", "Roma", "Rangers", "Fenerbahçe", "Betis", "Barcelona", "Lazio", "Inter", "Como", "Benfica", "Porto", "PSV", "Ajax", "Union SG", "Celtic"]}, "results/latest": {"res": "{\"SL|Gaziantep|Kasımpaşa\": \"0-2\", \"PL|Everton|Coventry\": \"3-1\", \"LL|Sevilla|Alaves\": \"0-0\", \"SA|Venezia|Udinese\": \"2-1\", \"BL|Hamburg|M’gladbach\": \"3-1\", \"L1|Toulouse|Strasbourg\": \"3-1\", \"ERE|Willem II|PEC Zwolle\": \"1-1\", \"POR|Famalicão|Arouca\": \"1-0\", \"BEL|Standard|Beveren\": \"3-0\", \"SL|Eyüpspor|Kocaelispor\": \"0-2\", \"PL|Leeds|Tottenham\": \"1-0\", \"LL|Malaga|Racing Santander\": \"1-2\", \"SL|Samsunspor|Konyaspor\": \"1-0\", \"SA|Cagliari|Frosinone\": \"1-0\", \"SA|Torino|Lecce\": \"1-1\", \"PL|Arsenal|Hull\": \"1-0\", \"PL|Fulham|Newcastle\": \"1-1\", \"BL|Dortmund|Elversberg\": \"2-1\", \"BL|Leipzig|Augsburg\": \"5-2\", \"BL|Mainz|Bayern\": \"1-2\", \"BL|Paderborn|Frankfurt\": \"2-2\", \"SA|Parma|Bologna\": \"1-2\", \"LL|Espanyol|Deportivo\": \"0-0\", \"SL|Göztepe|Başakşehir\": \"1-2\", \"SL|Galatasaray|Amedspor\": \"4-3\", \"ERE|Fortuna Sittard|Telstar\": \"2-2\", \"BEL|OH Leuven|Mechelen\": \"2-0\", \"PL|N. Forest|Man City\": \"3-1\", \"BL|Stuttgart|Werder Bremen\": \"1-0\", \"LL|Osasuna|Athletic\": \"1-1\", \"LL|Valencia|Real Madrid\": \"L0-2\", \"SA|Roma|Sassuolo\": \"L2-0\", \"L1|Auxerre|Paris FC\": \"0-1\"}", "lv": "{\"LL|Elche|Valencia\": {\"m\": \"MS\", \"at\": \"2 Kas 19:45 Toronto\", \"s\": \"Elche 0-1 Valencia\", \"src\": \"SportRadar verisi\", \"ev\": [\"62' Sari kart: Elche\", \"Valencia'nin golu 62' sonrasinda geldi\"], \"st\": {\"pos\": [71, 29], \"sh\": [7, 3], \"sot\": [2, 1], \"co\": [4, 1], \"fo\": [7, 8], \"yc\": [3, 0], \"rc\": [0, 0]}}, \"SA|Lecce|Genoa\": {\"m\": \"MS\", \"at\": \"2 Kas 19:45 Toronto\", \"s\": \"Lecce 1-2 Genoa\", \"src\": \"SportRadar verisi\", \"ev\": [\"11' Gol: Genoa 0-1\", \"28' Gol: Genoa 0-2\", \"40' Gol: Lecce 1-2\"], \"st\": {\"pos\": [54, 46], \"sh\": [19, 11], \"sot\": [7, 3], \"co\": [6, 2], \"fo\": [17, 9], \"yc\": [2, 1], \"rc\": [0, 0]}}, \"LL|Getafe|Sevilla\": {\"m\": \"MS\", \"at\": \"1 Kas 13:55 Toronto\", \"s\": \"Getafe 3-1 Sevilla\", \"src\": \"SportRadar verisi\", \"ev\": [\"19' Gol: Sevilla 0-1\", \"68' Gol: Getafe 1-1\", \"74' Gol: Getafe 2-1\", \"90' Gol: Getafe 3-1\", \"90' Kirmizi kart: Sevilla\"], \"st\": {\"pos\": [48, 52], \"sh\": [9, 12], \"sot\": [5, 5], \"co\": [2, 2], \"fo\": [18, 18], \"yc\": [2, 4], \"rc\": [0, 1]}}, \"SL|Gaziantep|Kasımpaşa\": {\"m\": \"Bitti\", \"at\": \"6 Kas\", \"s\": \"Gaziantep 0-2 Kasımpaşa\", \"src\": \"ASpor ve Sporx maç haberleri (goller); kart ve değişiklik bilgisi kaynaklarda yok\", \"ev\": [{\"k\": \"g\", \"m\": 3, \"s\": \"a\", \"a\": \"Haris Hajradinovic\", \"sc\": \"0 - 1\"}, {\"k\": \"g\", \"m\": 21, \"s\": \"a\", \"a\": \"Adrian Benedyczak (penaltı)\", \"sc\": \"0 - 2\"}, {\"k\": \"ht\", \"sc\": \"0 - 2\"}]}, \"PL|Everton|Coventry\": {\"m\": \"MS\", \"at\": \"6 Kas 17:15 Toronto\", \"s\": \"Everton 3-1 Coventry\", \"src\": \"SportRadar verisi (final skor); olay verisi doğrulanamadı\", \"ev\": []}, \"LL|Sevilla|Alaves\": {\"m\": \"MS\", \"at\": \"6 Kas 17:15 Toronto\", \"s\": \"Sevilla 0-0 Alaves\", \"src\": \"SportRadar verisi (final skor); olay verisi doğrulanamadı\", \"ev\": []}, \"SA|Venezia|Udinese\": {\"m\": \"MS\", \"at\": \"6 Kas 17:15 Toronto\", \"s\": \"Venezia 2-1 Udinese\", \"src\": \"SportRadar verisi (final skor); olay verisi doğrulanamadı\", \"ev\": []}, \"BL|Hamburg|M’gladbach\": {\"m\": \"MS\", \"at\": \"6 Kas 17:15 Toronto\", \"s\": \"Hamburg 3-1 M’gladbach\", \"src\": \"SportRadar verisi (final skor); olay verisi doğrulanamadı\", \"ev\": []}, \"L1|Toulouse|Strasbourg\": {\"m\": \"MS\", \"at\": \"6 Kas 17:15 Toronto\", \"s\": \"Toulouse 3-1 Strasbourg\", \"src\": \"SportRadar verisi (final skor); olay verisi doğrulanamadı\", \"ev\": []}, \"ERE|Willem II|PEC Zwolle\": {\"m\": \"MS\", \"at\": \"6 Kas 18:30 Toronto\", \"s\": \"Willem II 1-1 PEC Zwolle\", \"src\": \"NOS maç raporu (final skor, goller); kart bilgisi yok\", \"ev\": [{\"k\": \"g\", \"m\": 2, \"s\": \"a\", \"a\": \"Sydney van Hooijdonk\", \"sc\": \"0 - 1\"}, {\"k\": \"g\", \"m\": 3, \"s\": \"h\", \"a\": \"Hidde ter Avest\", \"sc\": \"1 - 1\"}, {\"k\": \"s\", \"m\": 46, \"s\": \"h\", \"a\": \"Boogaard\", \"b\": \"Zarrouk\"}]}, \"POR|Famalicão|Arouca\": {\"m\": \"MS\", \"at\": \"6 Kas 18:30 Toronto\", \"s\": \"Famalicão 1-0 Arouca\", \"src\": \"O Jogo maç raporu; kart bilgisi yok\", \"ev\": [{\"k\": \"g\", \"m\": 90, \"s\": \"h\", \"a\": \"Paulo Moreira (90+6')\", \"sc\": \"1 - 0\"}]}, \"BEL|Standard|Beveren\": {\"m\": \"MS\", \"at\": \"6 Kas 18:30 Toronto\", \"s\": \"Standard 3-0 Beveren\", \"src\": \"Sporza maç raporu\", \"ev\": [{\"k\": \"g\", \"m\": 5, \"s\": \"h\", \"a\": \"Dennis Eckert Ayensa\", \"sc\": \"1 - 0\"}, {\"k\": \"y\", \"m\": 36, \"s\": \"a\", \"a\": \"Christophe Janssens\"}, {\"k\": \"y\", \"m\": 38, \"s\": \"a\", \"a\": \"Bruno Godeau\"}, {\"k\": \"g\", \"m\": 64, \"s\": \"h\", \"a\": \"Dennis Eckert Ayensa (penaltı)\", \"sc\": \"2 - 0\"}, {\"k\": \"g\", \"m\": 68, \"s\": \"h\", \"a\": \"Dennis Eckert Ayensa\", \"sc\": \"3 - 0\"}, {\"k\": \"y\", \"m\": 87, \"s\": \"a\", \"a\": \"Stephane Keller\"}]}, \"SL|Eyüpspor|Kocaelispor\": {\"m\": \"MS\", \"at\": \"7 Kas\", \"s\": \"Eyüpspor 0-2 Kocaelispor\", \"src\": \"Sporx maç yazısı (goller)\", \"ev\": [{\"k\": \"g\", \"m\": 5, \"s\": \"a\", \"a\": \"Daniel Agyei\", \"sc\": \"0 - 1\"}, {\"k\": \"g\", \"m\": 28, \"s\": \"a\", \"a\": \"Berkan Kutlu\", \"sc\": \"0 - 2\"}, {\"k\": \"ht\", \"sc\": \"0 - 2\"}]}, \"PL|Leeds|Tottenham\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 11:18 (Toronto)\", \"s\": \"Leeds 1-0 Tottenham\", \"src\": \"fetch_sports_data (SportRadar, final skor); olay verisi yok\", \"ev\": []}, \"LL|Malaga|Racing Santander\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 10:57 (Toronto)\", \"s\": \"Malaga 1-2 Racing Santander\", \"src\": \"fetch_sports_data (SportRadar, final skor); olay verisi yok\", \"ev\": []}, \"SL|Samsunspor|Konyaspor\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:22 (Toronto)\", \"s\": \"Samsunspor 1-0 Konyaspor\", \"src\": \"A Spor maç raporu (final skor, gol, kırmızı kart); sarı kart: yenikonya (tek kaynak)\", \"ev\": [{\"k\": \"y\", \"m\": 14, \"s\": \"h\", \"a\": \"Samed Onur\"}, {\"k\": \"g\", \"m\": 39, \"s\": \"h\", \"a\": \"Antoine Sekongo\", \"sc\": \"1 - 0\"}, {\"k\": \"ht\", \"m\": 45, \"sc\": \"1 - 0\"}, {\"k\": \"r\", \"m\": 84, \"s\": \"a\", \"a\": \"Enis Destan\"}]}, \"SA|Cagliari|Frosinone\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 10:57 (Toronto)\", \"s\": \"Cagliari 1-0 Frosinone\", \"src\": \"fetch_sports_data (SportRadar, final skor); olay verisi yok\", \"ev\": []}, \"SA|Torino|Lecce\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 11:18 (Toronto)\", \"s\": \"Torino 1-1 Lecce\", \"src\": \"fetch_sports_data (SportRadar, final skor); olay verisi yok\", \"ev\": []}, \"SL|Göztepe|Başakşehir\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:50 (Toronto)\", \"s\": \"Göztepe 1-2 Başakşehir\", \"src\": \"ASpor, Sporx, Fanatik (skor, goller)\", \"ev\": [{\"k\": \"g\", \"m\": 18, \"s\": \"h\", \"a\": \"Juan\", \"sc\": \"1 - 0\"}, {\"k\": \"g\", \"m\": 22, \"s\": \"a\", \"a\": \"Davie Selke\", \"sc\": \"1 - 1\"}, {\"k\": \"g\", \"m\": 83, \"s\": \"a\", \"sc\": \"1 - 2\"}]}, \"SL|Galatasaray|Amedspor\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:59 (Toronto)\", \"s\": \"Galatasaray 4-3 Amedspor\", \"src\": \"Sporx, Fanatik, ASpor maç haberleri\", \"ev\": [{\"k\": \"g\", \"m\": 7, \"s\": \"h\", \"a\": \"Rafael Leao\", \"sc\": \"1 - 0\"}, {\"k\": \"g\", \"m\": 45, \"s\": \"h\", \"sc\": \"2 - 0\"}, {\"k\": \"ht\", \"m\": 45, \"sc\": \"2 - 0\"}, {\"k\": \"s\", \"m\": 46, \"s\": \"a\", \"a\": \"Gökhan Gül\", \"b\": \"Ali Turap Bülbül\"}, {\"k\": \"s\", \"m\": 46, \"s\": \"a\", \"a\": \"Mbaye Diagne\", \"b\": \"Yira Sor\"}, {\"k\": \"y\", \"m\": 50, \"s\": \"a\", \"a\": \"Raveloson\"}, {\"k\": \"s\", \"m\": 51, \"s\": \"h\", \"a\": \"Rafael Leao (sakatlık)\", \"b\": \"Deniz Gül\"}, {\"k\": \"g\", \"m\": 59, \"s\": \"h\", \"a\": \"Aleksey Batrakov\", \"sc\": \"3 - 0\"}, {\"k\": \"g\", \"m\": 62, \"s\": \"a\", \"a\": \"Dia Saba\", \"sc\": \"3 - 1\"}, {\"k\": \"g\", \"m\": 65, \"s\": \"a\", \"a\": \"Gift Orban\", \"sc\": \"3 - 2\"}, {\"k\": \"s\", \"m\": 69, \"s\": \"h\", \"a\": \"Yunus Akgün\", \"b\": \"Leroy Sane\"}, {\"k\": \"s\", \"m\": 69, \"s\": \"h\", \"a\": \"Torreira\", \"b\": \"Gabriel Sara\"}, {\"k\": \"g\", \"m\": 80, \"s\": \"h\", \"a\": \"Barış Alper Yılmaz\", \"sc\": \"4 - 2\"}, {\"k\": \"g\", \"m\": 90, \"s\": \"a\", \"sc\": \"4 - 3\", \"a\": \"Yira Sor\"}]}, \"PL|Arsenal|Hull\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:50 (Toronto)\", \"s\": \"Arsenal 1-0 Hull\", \"src\": \"SportRadar (dakika/kart) + Sky Sports (gol atan)\", \"ev\": [{\"k\": \"y\", \"m\": 34, \"s\": \"a\"}, {\"k\": \"y\", \"m\": 48, \"s\": \"a\"}, {\"k\": \"y\", \"m\": 61, \"s\": \"a\"}, {\"k\": \"g\", \"m\": 72, \"s\": \"h\", \"a\": \"Martin Ødegaard\", \"sc\": \"1 - 0\"}, {\"k\": \"y\", \"m\": 75, \"s\": \"a\"}, {\"k\": \"y\", \"m\": 87, \"s\": \"a\"}]}, \"PL|Fulham|Newcastle\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:50 (Toronto)\", \"s\": \"Fulham 1-1 Newcastle\", \"src\": \"SportRadar (dakika) + Sky Sports (gol atan)\", \"ev\": [{\"k\": \"g\", \"m\": 80, \"s\": \"a\", \"a\": \"Jacob Murphy\", \"sc\": \"0 - 1\"}, {\"k\": \"g\", \"m\": 83, \"s\": \"h\", \"a\": \"R. Muniz Carvalho\", \"sc\": \"1 - 1\"}, {\"k\": \"y\", \"m\": 90, \"s\": \"a\"}, {\"k\": \"y\", \"m\": 90, \"s\": \"a\"}]}, \"SA|Parma|Bologna\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:59 (Toronto)\", \"s\": \"Parma 0-0 Bologna\", \"src\": \"football-italia.net, tuttosport.com, corrieredellosport.it\", \"ev\": [{\"k\": \"r\", \"m\": 9, \"s\": \"h\", \"a\": \"Abdoulaye Ndiaye\"}, {\"k\": \"y\", \"m\": 14, \"s\": \"h\", \"a\": \"David Romero\"}, {\"k\": \"y\", \"m\": 20, \"s\": \"a\", \"a\": \"Nicolò Casale\"}, {\"k\": \"y\", \"m\": 42, \"s\": \"h\", \"a\": \"Mariano Troilo\"}, {\"k\": \"ht\", \"m\": 45, \"sc\": \"0 - 0\"}, {\"k\": \"g\", \"m\": 53, \"s\": \"a\", \"a\": \"Arthur Theate\", \"sc\": \"0 - 1\"}, {\"k\": \"y\", \"m\": 72, \"s\": \"h\", \"a\": \"Enrico Delprato\"}, {\"k\": \"g\", \"m\": 72, \"s\": \"a\", \"a\": \"Riccardo Orsolini (penaltı)\", \"sc\": \"0 - 2\"}, {\"k\": \"y\", \"m\": 80, \"s\": \"a\", \"a\": \"Martin Vitik\"}, {\"k\": \"g\", \"m\": 81, \"s\": \"h\", \"a\": \"Vincent Sierro (penaltı)\", \"sc\": \"1 - 2\"}]}, \"ERE|Fortuna Sittard|Telstar\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:39 (Toronto)\", \"s\": \"Fortuna Sittard 2-2 Telstar\", \"src\": \"NOS maç raporu\", \"ev\": [{\"k\": \"g\", \"m\": 15, \"s\": \"h\", \"a\": \"Mohamed Ihattaren (penaltı)\", \"sc\": \"1 - 0\"}, {\"k\": \"y\", \"m\": 32, \"s\": \"a\", \"a\": \"Marvin Peersman\"}, {\"k\": \"g\", \"m\": 43, \"s\": \"h\", \"a\": \"Sem Valk (kendi kalesine)\", \"sc\": \"2 - 0\"}, {\"k\": \"g\", \"m\": 45, \"s\": \"a\", \"a\": \"Abdelnour Soualhia\", \"sc\": \"2 - 1\"}, {\"k\": \"g\", \"m\": 47, \"s\": \"a\", \"a\": \"Patrick Brouwer\", \"sc\": \"2 - 2\"}, {\"k\": \"y\", \"m\": 72, \"s\": \"a\", \"a\": \"Isaiah Ahmed\"}]}, \"BEL|OH Leuven|Mechelen\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:39 (Toronto)\", \"s\": \"OH Leuven 2-0 Mechelen\", \"src\": \"Sporza maç raporu\", \"ev\": [{\"k\": \"g\", \"m\": 50, \"s\": \"h\", \"sc\": \"1 - 0\"}, {\"k\": \"g\", \"m\": 90, \"s\": \"h\", \"sc\": \"2 - 0\"}]}, \"LL|Espanyol|Deportivo\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:39 (Toronto)\", \"s\": \"Espanyol 0-0 Deportivo\", \"src\": \"ElDesmarque (final skor); olay verisi yok\", \"ev\": []}, \"PL|N. Forest|Man City\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:45 (Toronto)\", \"s\": \"N. Forest 3-1 Man City\", \"src\": \"Sky Sports maç raporu ve gol videoları\", \"ev\": [{\"k\": \"g\", \"m\": 6, \"s\": \"h\", \"sc\": \"1 - 0\", \"a\": \"Jair Cunha\"}, {\"k\": \"g\", \"m\": 18, \"s\": \"h\", \"sc\": \"2 - 0\", \"a\": \"Liam Delap\"}, {\"k\": \"g\", \"m\": 52, \"s\": \"a\", \"sc\": \"2 - 1\", \"a\": \"Rayan Cherki\"}, {\"k\": \"g\", \"m\": 73, \"s\": \"h\", \"sc\": \"3 - 1\", \"a\": \"Liam Delap\"}]}, \"BL|Stuttgart|Werder Bremen\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:45 (Toronto)\", \"s\": \"Stuttgart 1-0 Werder Bremen\", \"src\": \"bundesliga.com maç raporu\", \"ev\": [{\"k\": \"g\", \"m\": 7, \"s\": \"h\", \"a\": \"Maximilian Mittelstädt\", \"sc\": \"1 - 0\"}]}, \"LL|Osasuna|Athletic\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 12:45 (Toronto)\", \"s\": \"Osasuna 0-0 Athletic\", \"src\": \"SportRadar\", \"ev\": []}, \"LL|Valencia|Real Madrid\": {\"m\": \"Canlı\", \"at\": \"7 Kas 2026, 15:41 (Toronto)\", \"s\": \"Valencia 0-2 Real Madrid (36')\", \"src\": \"Sporx canlı sayfası (snapshot 36')\", \"ev\": [{\"k\": \"y\", \"m\": 26, \"s\": \"h\", \"a\": \"Pablo Maffeo\"}, {\"k\": \"g\", \"m\": 28, \"s\": \"a\", \"a\": \"Federico Valverde\", \"sc\": \"0 - 1\"}, {\"k\": \"g\", \"m\": 36, \"s\": \"a\", \"a\": \"Arda Güler\", \"sc\": \"0 - 2\"}]}, \"SA|Roma|Sassuolo\": {\"m\": \"Canlı\", \"at\": \"7 Kas 2026, 15:41 (Toronto)\", \"s\": \"Roma 2-0 Sassuolo (38')\", \"src\": \"FotMob (snapshot 38')\", \"ev\": [{\"k\": \"g\", \"m\": 27, \"s\": \"h\", \"a\": \"Mario Hermoso\", \"sc\": \"1 - 0\"}, {\"k\": \"g\", \"m\": 30, \"s\": \"h\", \"a\": \"Sebastian Walukiewicz (kk)\", \"sc\": \"2 - 0\"}]}, \"BL|Dortmund|Elversberg\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 15:26 (Toronto)\", \"s\": \"Dortmund 2-1 Elversberg\", \"ev\": [{\"k\": \"g\", \"m\": 55, \"s\": \"h\", \"a\": \"Felix Nmecha\", \"sc\": \"1 - 0\"}, {\"k\": \"g\", \"m\": 71, \"s\": \"h\", \"a\": \"Felix Nmecha\", \"sc\": \"2 - 0\"}, {\"k\": \"g\", \"m\": 81, \"s\": \"a\", \"a\": \"Noel Futkeu\", \"sc\": \"2 - 1\"}], \"src\": \"bundesliga.com maç raporu\"}, \"BL|Mainz|Bayern\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 15:30 (Toronto)\", \"s\": \"Mainz 1-2 Bayern\", \"ev\": [{\"k\": \"g\", \"m\": 14, \"s\": \"a\", \"a\": \"Joshua Kimmich\", \"sc\": \"0 - 1\"}, {\"k\": \"g\", \"m\": 57, \"s\": \"a\", \"a\": \"Lennart Karl\", \"sc\": \"0 - 2\"}, {\"k\": \"g\", \"m\": 90, \"s\": \"h\", \"a\": \"Phillip Tietz\", \"sc\": \"1 - 2\"}], \"src\": \"bundesliga.com maç raporu\"}, \"BL|Paderborn|Frankfurt\": {\"m\": \"MS\", \"at\": \"7 Kas 2026, 15:30 (Toronto)\", \"s\": \"Paderborn 2-2 Frankfurt\", \"ev\": [{\"k\": \"g\", \"m\": 23, \"s\": \"a\", \"a\": \"Jonathan Burkardt\", \"sc\": \"0 - 1\"}, {\"k\": \"g\", \"m\": 45, \"s\": \"h\", \"a\": \"Raphael Obermair\", \"sc\": \"1 - 1\"}, {\"k\": \"y\", \"m\": 60, \"s\": \"a\", \"a\": \"Elias Baum\"}, {\"k\": \"g\", \"m\": 73, \"s\": \"h\", \"a\": \"Marvin Pieringer (penaltı)\", \"sc\": \"2 - 1\"}, {\"k\": \"r\", \"m\": 75, \"s\": \"a\", \"a\": \"Elias Baum\"}, {\"k\": \"y\", \"m\": 80, \"s\": \"h\", \"a\": \"Deniz Zeitler\"}, {\"k\": \"y\", \"m\": 86, \"s\": \"a\", \"a\": \"Nnamdi Collins\"}, {\"k\": \"g\", \"m\": 90, \"s\": \"a\", \"a\": \"Jonathan Burkardt\", \"sc\": \"2 - 2\"}], \"src\": \"bundesliga.com canlı anlatım\"}, \"L1|Auxerre|Paris FC\": {\"m\": \"MS\", \"at\": \"7 Kas 15:29 Toronto\", \"s\": \"Auxerre 0-1 Paris FC\", \"src\": \"gidstats ve TheScore maç sayfaları (skor, gol, sarı kartlar)\", \"ev\": [{\"k\": \"y\", \"m\": 15, \"s\": \"h\", \"a\": \"Cameron Archer\"}, {\"k\": \"y\", \"m\": 15, \"s\": \"a\", \"a\": \"Pierre Lees-Melou\"}, {\"k\": \"y\", \"m\": 16, \"s\": \"h\", \"a\": \"Sinaly Diomandé\"}, {\"k\": \"g\", \"m\": 63, \"s\": \"a\", \"a\": \"Lassine Sinayoko\", \"sc\": \"0 - 1\"}]}}", "nw": "[{\"tm\": \"Barcelona\", \"d\": \"2026-11-06\", \"x\": \"Koundé grupla antrenman yapamadı, Atlético maçında oynamayacak. Éric García ve Christensen grupla çalıştı; Christensen'in yedek başlaması bekleniyor.\", \"src\": \"Jornada Perfecta\"}, {\"tm\": \"Lazio\", \"d\": \"2026-11-04\", \"x\": \"Kaptan Zaccagni sol uyluk ön kasında (quadriceps) lezyon, yaklaşık bir ay yok. Napoli (8 Kas) ve Lecce maçlarını kaçıracak; hedef 6 Aralık Atalanta maçı.\", \"src\": \"Corriere dello Sport (Lazio resmi açıklaması)\"}, {\"tm\": \"Milan\", \"d\": \"2026-11-04\", \"x\": \"Chukwueze'nin sol kalçadaki tendon kopması için Londra'da yapılan ameliyat başarılı geçti. 2026'da oynamayacak, Ocak-Şubat'ta dönmesi hedefleniyor.\", \"src\": \"Corriere dello Sport (Milan resmi açıklaması)\"}, {\"tm\": \"Galatasaray\", \"d\": \"2026-11-06\", \"x\": \"Osimhen: Şampiyonlar Ligi Stuttgart maçında sol dizinde esneme; MR'da serbest fragman bulundu. 7 Kasım'da artroskopik diz ameliyatı olacak, Amedspor maçı kadrosunda yok. Kulüp iyileşme süresi açıklamadı; A Spor'a göre hedef 24 Kasım'daki Aston Villa maçı.\", \"src\": \"A Spor (Galatasaray resmi açıklaması aktarımı)\"}, {\"tm\": \"Kasımpaşa\", \"d\": \"2026-11-06\", \"x\": \"Teknik direktör Alfred Schreuder'in ilk maçında Gaziantep FK'yı deplasmanda 2-0 yendi (Hajradinovic 3', Benedyczak 21' penaltı).\", \"src\": \"ASpor, Sporx\"}]", "cl": "03.11|Shakhtar|Sporting|0|1\n03.11|Galatasaray|Stuttgart|2|0\n03.11|Atletico Madrid|Bayern|0|2\n03.11|Barcelona|Aston Villa|3|0\n03.11|Feyenoord|Inter|0|3\n03.11|Bodø/Glimt|Lille|0|0\n03.11|LASK|Slovan Bratislava|4|0\n03.11|Man United|Roma|3|2\n03.11|Villarreal|PSG|0|6\n04.11|AEK Atina|Real Madrid|2|3\n04.11|Fenerbahçe|Liverpool|3|2\n04.11|Dortmund|Betis|2|1\n04.11|Porto|Napoli|4|1\n04.11|PSV|Club Brugge|1|2\n04.11|Leipzig|Man City|2|3\n04.11|Lens|Como|1|9\n04.11|Slavia Prague|Arsenal|1|2\n04.11|Viking|Sabah|4|1", "at": "7 Kas 2026, 15:41 (Toronto)"}};try{KMCH=JSON.parse(localStorage.getItem('km_c1')||'{}')}catch(e){}for(const k in KMSEED)if(!KMCH[k])KMCH[k]=KMSEED[k];
async function KMDB(){if(KMC)return{doc:p=>({get:async()=>KMCH[p]?{exists:true,data:()=>KMCH[p]}:{exists:false,data:()=>({})}})};const db=await claude.use('db');if(!db)return db;return{doc:p=>{const d=db.doc(p);return{get:async()=>{const sn=await d.get();try{if(sn.exists){KMCH[p]=sn.data();try{localStorage.setItem('km_c1',JSON.stringify(KMCH))}catch(e){}}}catch(e){}return sn},set:(...a)=>d.set(...a)}}}}
var KAT='';
setInterval(async()=>{try{if(document.visibilityState!='visible')return;const ae=document.activeElement;if(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))return;if(document.getElementById('kpq'))return;const db=await KMDB();if(!db)return;const sn=await db.doc('results/latest').get();if(!sn.exists)return;const d=sn.data();if(!d||!d.at||d.at===KAT)return;KAT=d.at;Object.assign(RES,JSON.parse(d.res||'{}'));LVD=d.lv?JSON.parse(d.lv):{};try{const s2=await db.doc('results/stats').get();if(s2.exists)STX=JSON.parse(s2.data().st||'{}')}catch(e){}try{NW=d.nw?JSON.parse(d.nw):[]}catch(e){NW=[]}if(d.cl)addCL(d.cl);LGC=fixAt(d.at);RT=new Date();const y=window.scrollY;render();try{window.scrollTo(0,y)}catch(e){}}catch(e){}},60000);
async function refresh(){const b=$('#rf');if(b&&b.classList)b.classList.add('spin');try{const db=await KMDB();if(db){const sn=await db.doc('results/latest').get();if(sn.exists){const d=sn.data();Object.assign(RES,JSON.parse(d.res||'{}'));LVD=d.lv?JSON.parse(d.lv):{};try{const s2=await db.doc('results/stats').get();if(s2.exists)STX=JSON.parse(s2.data().st||'{}')}catch(e){}try{NW=d.nw?JSON.parse(d.nw):[]}catch(e){NW=[]};if(d.cl)addCL(d.cl);if(d.at){LGC=fixAt(d.at);KAT=d.at}RM='sonuç kaydı okundu'}else RM='kayıtlı sonuç yok';try{const hs=await db.doc('history/all').get();if(hs.exists){const n=addH(hs.data().h||'');RM+=`, ${n} yeni maç sonucu işlendi`;recalc()}}catch(e){}try{await favLoad(db)}catch(e){}try{const l2=await db.doc('lineups/latest').get();if(l2.exists){LU=JSON.parse(l2.data().lu||'{}');RM+=', kadro bilgisi okundu'}}catch(e){}try{const p2=await db.doc('players/latest').get();if(p2.exists)PS=JSON.parse(p2.data().pl||'{}');try{const p3=await db.doc('players/more').get();if(p3.exists)Object.assign(PS,JSON.parse(p3.data().pl||'{}'))}catch(e){}try{const p4=await db.doc('players/more2').get();if(p4.exists)Object.assign(PS,JSON.parse(p4.data().pl||'{}'))}catch(e){}}catch(e){}}else RM='sonuç kaydına ulaşılamadı, saat durumu güncellendi'}catch(e){RM='sonuç kaydı okunamadı, saat durumu güncellendi'}RT=new Date();if(b&&b.classList)b.classList.remove('spin');render();ss()}
let Q='',QX='',F='',LV=false,TS=false,FS=false,VF=false,FV=false,FAV=new Set();try{FAV=new Set(JSON.parse(localStorage.getItem('fav')||'[]'))}catch(e){}
let FUID=null;const favDb=async()=>{try{const id=FUID||KPUID;if(!id)return;const db=await claude.use('db');if(db)await db.doc('data/users/'+id+'/favs').set({list:[...FAV]})}catch(e){}},favSave=()=>{try{localStorage.setItem('fav',JSON.stringify([...FAV]))}catch(e){}favDb()},favTgl=n=>{FAV.has(n)?FAV.delete(n):FAV.add(n);favSave()},isFavM=m=>FAV.has(m.h)||FAV.has(m.a);
const dd=t=>{const d=new Date(t);if(LANG!='tr'){try{return new Intl.DateTimeFormat(LOCALE,{day:'2-digit',month:'2-digit',year:'2-digit'}).format(d)}catch(e){}}return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getFullYear()).slice(2)};const fdr=d=>{if(!d)return'';const q=d.split('.');if(LANG!='tr'&&q.length>=2){try{return new Intl.DateTimeFormat(LOCALE,{day:'2-digit',month:'2-digit',year:'2-digit'}).format(new Date(2026,+q[1]-1,+q[0]))}catch(e){}}return d.split('.').join('/')+'/26'};
const segc=()=>`<div class='seg2'><button data-tt='k' class='${tab=='k'?'on':''}'>Maçlar</button><button data-tt='l' class='${tab=='l'?'on':''}'>Ligler</button><button data-tt='g' class='${tab=='g'?'on':''}'>Geçmiş</button></div>`;
function bindU(ds){document.querySelectorAll('[data-tt]').forEach(b=>b.onclick=()=>{tab=b.dataset.tt;det=null;PMV=null;NAVS.length=0;FWD.length=0;render()});
document.querySelectorAll('[data-dd]').forEach(b=>b.onclick=()=>{const i=ds.indexOf(day)+ +b.dataset.dd;if(i>=0&&i<ds.length){day=ds[i];render()}});
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{F=b.dataset.f;render()});document.querySelectorAll('[data-fv]').forEach(b=>b.onclick=()=>{FV=!FV;render()});
document.querySelectorAll('[data-hl]').forEach(b=>b.onclick=()=>{tgl(HL,b.dataset.hl);render()});document.querySelectorAll('[data-hd]').forEach(b=>b.onclick=()=>{tgl(HD,b.dataset.hd);render()});document.querySelectorAll('[data-hc]').forEach(b=>b.onclick=()=>{HL.clear();HD.clear();render()});document.querySelectorAll('details[data-ho]').forEach(d=>{d.ontoggle=()=>{d.open?HO.add(d.dataset.ho):HO.delete(d.dataset.ho)}});
const f=$('#flt');if(f)f.onclick=()=>{FS=!FS;render()};const l=$('#lv');if(l)l.onclick=()=>{LV=!LV;render()};document.querySelectorAll('[data-fall]').forEach(b=>b.onclick=()=>{LV=false;TS=false;F='';FV=false;render()});document.querySelectorAll('[data-fts]').forEach(b=>b.onclick=()=>{TS=!TS;render()})}
const wl=r=>`<i class='wl w${r}'>${r}</i>`;
const tz2=(a,x,b,y)=>`<div class='tz'><div>${bd(a)} ${a}</div><div>${bd(b)} ${b}</div></div><div class='sc'><b>${x}</b><b>${y}</b></div>`;
const trow=(n,r)=>{const h=r.H?n:r.o,a=r.H?r.o:n,x=r.H?r.f:r.c,y=r.H?r.c:r.f;return`<div class='mr'><div class='lt'>${r.w}. maç<span>MS</span></div>${tz2(h,x,a,y)}${wl(r.r)}</div>`};
const CLT="1:PSG:3:0:0:14:5:9,2:Aston Villa:3:0:0:12:3:9,3:Liverpool:3:0:0:12:7:9,4:Real Madrid:3:0:0:10:5:9,5:Betis:3:0:0:7:4:9,6:Stuttgart:2:1:0:7:2:7,7:Arsenal:2:1:0:6:2:7,8:Barcelona:2:0:1:11:6:6,9:Como:2:0:1:10:5:6,10:Man City:2:0:1:9:5:6,11:Club Brugge:2:0:1:9:6:6,12:Sporting:2:0:1:7:4:6,13:Dortmund:2:0:1:5:4:6,14:Bayern:1:2:0:10:5:5,15:Roma:1:1:1:8:5:4,16:Atletico Madrid:1:1:1:4:3:4,17:Shakhtar:1:1:1:4:3:4,18:PSV:1:1:1:2:2:4,19:Villarreal:1:0:2:8:8:3,20:Inter:1:0:2:5:6:3,20:Man United:1:0:2:5:6:3,22:Napoli:1:0:2:5:7:3,23:Galatasaray:1:0:2:6:9:3,24:LASK:1:0:2:6:9:3,25:Sabah:1:0:2:3:6:3,26:Feyenoord:1:0:2:4:8:3,27:Lens:1:0:2:3:7:3,28:Bodø/Glimt:1:0:2:4:9:3,29:AEK Atina:1:0:2:3:8:3,29:Leipzig:1:0:2:3:8:3,31:Fenerbahçe:0:2:1:3:9:2,32:Slavia Prague:0:1:2:4:7:1,33:Viking:0:1:2:5:9:1,34:Porto:0:0:3:2:6:0,35:Lille:0:0:3:4:10:0,36:Slovan Bratislava:0:0:3:1:13:0".split(',').map(t=>t.split(':'));
const clT=()=>{const t={};CLR.forEach(r=>{[[r.h,r.x,r.y],[r.a,r.y,r.x]].forEach(([n,f,c])=>{const q=t[n]=t[n]||{w:0,d:0,l:0,gf:0,ga:0,p:0};q.gf+=f;q.ga+=c;f>c?(q.w++,q.p+=3):f==c?(q.d++,q.p++):q.l++})});return Object.entries(t).sort((x,y)=>y[1].p-x[1].p||(y[1].gf-y[1].ga)-(x[1].gf-x[1].ga)||y[1].gf-x[1].gf||y[1].w-x[1].w).map(([n,q],i)=>[i+1,n,q.w,q.d,q.l,q.gf,q.ga,q.p])};
function addCL(txt){txt.split('\n').forEach(l=>{const[d,h,a,x,y]=l.split('|');if(!y||CLR.some(r=>r.h==h&&r.a==a))return;CLR.push({d,h,a,x:+x,y:+y});RES['CL|'+h+'|'+a]=x+'-'+y})}
const cltbl=m=>`<div class='box'><div class='tb th'><span>#</span><span>Takım</span><span>O</span><span>G</span><span>B</span><span>M</span><span>A</span><span>Y</span><span>Av</span><span>P</span></div>${clT().map(([r,n,w,d,l,gf,ga,p])=>`<div class='tb${n==m.h||n==m.a?' hl':''}' style='border-left:3px solid ${+r<=8?'var(--ok)':+r<=24?'var(--warn)':'var(--mut)'}'><span>${r}</span><span>${bd(n)} <span data-tm="${n}">${n}</span></span><span>${+w+ +d+ +l}</span><span>${w}</span><span>${d}</span><span>${l}</span><span>${gf}</span><span>${ga}</span><span>${gf-ga>0?'+':''}${gf-ga}</span><b>${p}</b></div>`).join('')}<div class='mut'>Lig aşaması (oynanan maçlara göre otomatik hesaplanır). 54 maçtan hesaplandı, puanlar sağlayıcı tablosuyla birebir uyumlu; sıralama UEFA kriterleriyle sağlayıcıdan alındı. Yeşil: ilk 8 (son 16'ya doğrudan), sarı: 9-24 (play-off), gri: elenir.</div></div>`;
const CLR=`08.09|AEK Atina|LASK|1|0
08.09|Club Brugge|Aston Villa|2|3
08.09|Dortmund|Villarreal|3|2
08.09|Porto|Man City|0|2
08.09|Lille|Betis|2|3
08.09|Real Madrid|Inter|2|1
09.09|Barcelona|Feyenoord|5|1
09.09|Stuttgart|Viking|3|1
09.09|Liverpool|Atletico Madrid|2|1
09.09|PSG|Slovan Bratislava|6|1
09.09|Sporting|Galatasaray|3|1
09.09|Napoli|Arsenal|0|1
10.09|Fenerbahçe|Roma|1|1
10.09|PSV|Shakhtar|1|1
10.09|Como|Leipzig|4|1
10.09|Bayern|Bodø/Glimt|5|0
10.09|Man United|Sabah|4|0
10.09|Slavia Prague|Lens|2|3
13.10|Lens|Sporting|0|2
13.10|Sabah|Slavia Prague|2|0
13.10|Arsenal|Lille|3|0
13.10|Atletico Madrid|Man United|2|0
13.10|Inter|Club Brugge|3|4
13.10|Galatasaray|Barcelona|1|4
13.10|Leipzig|PSV|1|0
13.10|Viking|Bayern|3|3
13.10|Villarreal|Napoli|3|1
14.10|Feyenoord|Como|3|2
14.10|LASK|Liverpool|3|6
14.10|Roma|Real Madrid|3|4
14.10|Aston Villa|Fenerbahçe|6|0
14.10|Shakhtar|AEK Atina|3|1
14.10|Bodø/Glimt|Dortmund|1|0
14.10|Man City|PSG|2|4
14.10|Betis|Porto|3|2
14.10|Slovan Bratislava|Stuttgart|0|3
20.10|Fenerbahçe|Slavia Prague|2|2
20.10|Sabah|Dortmund|1|2
20.10|Roma|Slovan Bratislava|4|0
20.10|Porto|PSV|0|1
20.10|Liverpool|Villarreal|4|3
20.10|Man City|AEK Atina|5|1
20.10|PSG|Barcelona|4|2
20.10|Napoli|Bodø/Glimt|4|3
20.10|Stuttgart|Atletico Madrid|1|1
21.10|Como|Man United|4|1
21.10|Lille|Galatasaray|2|4
21.10|Aston Villa|Viking|3|1
21.10|Club Brugge|Lens|3|0
21.10|Bayern|Arsenal|2|2
21.10|Inter|Shakhtar|1|0
21.10|Real Madrid|Leipzig|4|1
21.10|Betis|Feyenoord|1|0
21.10|Sporting|LASK|2|3
03.11|Shakhtar|Sporting|0|1
03.11|Galatasaray|Stuttgart|2|0
03.11|Atletico Madrid|Bayern|0|2
03.11|Barcelona|Aston Villa|3|0
03.11|Feyenoord|Inter|0|3
03.11|Bodø/Glimt|Lille|0|0
03.11|LASK|Slovan Bratislava|4|0
03.11|Man United|Roma|3|2
03.11|Villarreal|PSG|0|6
04.11|AEK Atina|Real Madrid|2|3
04.11|Fenerbahçe|Liverpool|3|2
04.11|Dortmund|Betis|2|1
04.11|Porto|Napoli|4|1
04.11|PSV|Club Brugge|1|2
04.11|Leipzig|Man City|2|3
04.11|Lens|Como|1|9
04.11|Slavia Prague|Arsenal|1|2
04.11|Viking|Sabah|4|1`.split('\n').map(l=>{const[d,h,a,x,y]=l.split('|');return{d,h,a,x:+x,y:+y}});
const CLF=`4|03.11|Shakhtar|Sporting
4|03.11|Galatasaray|Stuttgart
4|03.11|Atletico Madrid|Bayern
4|03.11|Barcelona|Aston Villa
4|03.11|Feyenoord|Inter
4|03.11|Bodø/Glimt|Lille
4|03.11|LASK|Slovan Bratislava
4|03.11|Man United|Roma
4|03.11|Villarreal|PSG
4|04.11|AEK Atina|Real Madrid
4|04.11|Fenerbahçe|Liverpool
4|04.11|Dortmund|Betis
4|04.11|Porto|Napoli
4|04.11|PSV|Club Brugge
4|04.11|Leipzig|Man City
4|04.11|Lens|Como
4|04.11|Slavia Prague|Arsenal
4|04.11|Viking|Sabah
5|24.11|Bodø/Glimt|LASK
5|24.11|Galatasaray|Aston Villa
5|24.11|Arsenal|Dortmund
5|24.11|Como|AEK Atina
5|24.11|Feyenoord|Porto
5|24.11|Man City|Napoli
5|24.11|Leipzig|Lens
5|24.11|Real Madrid|PSV
5|24.11|Slovan Bratislava|Betis
5|25.11|Sabah|Barcelona
5|25.11|Slavia Prague|Villarreal
5|25.11|Atletico Madrid|Viking
5|25.11|Club Brugge|Liverpool
5|25.11|Inter|Stuttgart
5|25.11|Shakhtar|Fenerbahçe
5|25.11|Lille|Bayern
5|25.11|PSG|Roma
5|25.11|Sporting|Man United
6|08.12|Viking|Feyenoord
6|08.12|Villarreal|Sabah
6|08.12|AEK Atina|Galatasaray
6|08.12|Roma|Sporting
6|08.12|Aston Villa|PSG
6|08.12|Barcelona|Man City
6|08.12|Bayern|Slavia Prague
6|08.12|Man United|Leipzig
6|08.12|Napoli|Club Brugge
6|09.12|Betis|Como
6|09.12|Slovan Bratislava|Shakhtar
6|09.12|Arsenal|Real Madrid
6|09.12|Dortmund|Inter
6|09.12|LASK|Fenerbahçe
6|09.12|Liverpool|Porto
6|09.12|Lens|Bodø/Glimt
6|09.12|PSV|Atletico Madrid
6|09.12|Stuttgart|Lille
7|19.01|Bodø/Glimt|Atletico Madrid
7|19.01|Galatasaray|Feyenoord
7|19.01|AEK Atina|Roma
7|19.01|Aston Villa|Dortmund
7|19.01|Inter|Liverpool
7|19.01|Porto|Slavia Prague
7|19.01|Lille|Slovan Bratislava
7|19.01|Real Madrid|LASK
7|19.01|Stuttgart|Club Brugge
7|20.01|Fenerbahçe|Villarreal
7|20.01|Sabah|Napoli
7|20.01|Como|PSG
7|20.01|Man United|Bayern
7|20.01|Leipzig|Shakhtar
7|20.01|Lens|Man City
7|20.01|Betis|Arsenal
7|20.01|Sporting|Barcelona
7|20.01|Viking|PSV
8|27.01|Arsenal|Sabah
8|27.01|Roma|Lille
8|27.01|Atletico Madrid|Fenerbahçe
8|27.01|Dortmund|AEK Atina
8|27.01|Club Brugge|Bodø/Glimt
8|27.01|Bayern|Betis
8|27.01|Barcelona|Como
8|27.01|Shakhtar|Real Madrid
8|27.01|Feyenoord|Leipzig
8|27.01|LASK|Porto
8|27.01|Liverpool|Lens
8|27.01|Man City|Sporting
8|27.01|PSG|Galatasaray
8|27.01|PSV|Stuttgart
8|27.01|Slavia Prague|Aston Villa
8|27.01|Napoli|Viking
8|27.01|Villarreal|Man United
8|27.01|Slovan Bratislava|Inter`.split('\n').map(l=>{const[md,d,h,a]=l.split('|');return{md,d,h,a}});
const clm=m=>[m.h,m.a].map(n=>{const g=CLR.filter(r=>r.h==n||r.a==n).reverse(),f=CLF.filter(r=>(r.h==n||r.a==n)&&!CLR.some(x=>x.h==r.h&&x.a==r.a));return`<div class='box'><div class='lg2'>${bd(n)}<div>${n}<small>Şampiyonlar Ligi lig aşaması</small></div></div>${g.map(r=>{const H=r.h==n,fo=H?r.x:r.y,c=H?r.y:r.x;return`<div class='mr'><div class='lt'>${r.d}<span>MS</span></div>${tz2(r.h,r.x,r.a,r.y)}${wl(fo>c?'G':fo==c?'B':'M')}</div>`}).join('')}<h3 style='margin:10px 0 2px'>Kalan maçlar</h3>${f.map(r=>`<div class='mr'><div class='lt'>${r.d}<span>${r.md}. hafta</span></div><div class='tz'><div>${bd(r.h)} ${r.h}</div><div>${bd(r.a)} ${r.a}</div></div></div>`).join('')}</div>`}).join('');
const tbl=m=>{if(m.c=='CL')return cltbl(m);if(m.un)return unTbl(m);if(m.eu)return euTbl(m);const ts=Object.entries(TM).filter(([n,t])=>t.l==m.c).sort((a,b)=>a[1].r-b[1].r);if(!ts.length)return"<div class='box'><div class='mut'>Bu lig için puan durumu verisi yok.</div></div>";return`<div class='box'><div class='tb th'><span>#</span><span>Takım</span><span>O</span><span>G</span><span>B</span><span>M</span><span>A</span><span>Y</span><span>Av</span><span>P</span></div>${ts.map(([n,t])=>`<div class='tb${n==m.h||n==m.a?' hl':''}'><span>${t.r}</span><span>${bd(n)} <span data-tm="${n}">${n}</span></span><span>${t.w+t.d+t.o}</span><span>${t.w}</span><span>${t.d}</span><span>${t.o}</span><span>${t.f!=null?t.f:'-'}</span><span>${t.f!=null?t.a:'-'}</span><span>${t.f!=null?t.f-t.a:'-'}</span><b>${t.p}</b></div>`).join('')}<div class='mut'>O oynanan, G galibiyet, B beraberlik, M mağlubiyet, A atılan gol, Y yenilen gol, Av averaj, P puan. Oynanan tüm maçlardan hesaplanır; son güncelleme: ${typeof KAT=='string'&&KAT?KAT:'son yayın'}.</div></div>`};
const mtab=m=>{let h=`<div class='ck'><label><input type='checkbox' id='vf' ${VF?'checked':''}> Sadece ${m.h} evinde / ${m.a} deplasmanda</label><label><input type='checkbox' checked disabled> Bu lig</label></div>`;
[[m.h,1],[m.a,0]].forEach(([n,H])=>{let g=(SLG[n]||[]).slice().reverse();if(VF)g=g.filter(r=>r.H==H);h+=`<div class='box'><div class='lg2'>${bd(n)}<div>${n}<small>Son lig maçları</small></div></div>${g.length?g.slice(0,10).map(r=>trow(n,r)).join(''):"<div class='mut'>Bu takım için kayıtlı lig maçı yok (lig CSV’si veya birkaç güncelleme gerekiyor).</div>"}</div>`});
const l=HH[[m.h,m.a].sort().join('|')];h+=`<div class='box'><div class='lg2'>⚔<div>Aralarındaki maçlar<small>Son ${l?l.length:0} karşılaşma</small></div></div>${l?l.map(r=>`<div class='mr'><div class='lt'>${r.d||'—'}<span>MS</span></div>${tz2(r.h,r.x,r.a,r.y)}${wl(r.x==r.y?'B':(r.x>r.y?r.h:r.a)==m.h?'G':'M')}</div>`).join(''):`<div class='mut'>${h2h(m)}</div>`}</div>`;return m.c=='CL'?clm(m)+"<h3>Kendi liglerindeki son maçlar</h3>"+h:h};
let det=null,dt='p';
const stt=m=>{const v=RES[[m.c,m.h,m.a].join('|')],t=m.t.getTime(),n=Date.now();if(v)return v[0]=='L'?{k:'live',sc:v.slice(1).split('-'),old:n>=t+8e6}:{k:'ft',sc:v.split('-')};return{k:n<t?'wait':n<t+6.6e6?'on':'unk'}};
const SLB={ft:'MS',live:'Canlı',on:'Canlı',unk:'Skor aranıyor',wait:''};
const sh=(k,m)=>({'1':`${m.h} kazanır`,X:'Beraberlik','2':`${m.a} kazanır`,'1X':`${m.h} yenilmez`,X2:`${m.a} yenilmez`,'12':'Beraberlik olmaz','Ü1.5':'2+ gol','Ü2.5':'3+ gol','KG Var':'İki takım da gol atar',EG1:`${m.h} gol atar`,DG1:`${m.a} gol atar`,EG2:`${m.h} 2+ gol atar`}[k]);
const pso=(m,x)=>{const z=stt(m);if(z.k=='ft'&&z.sc){if(isI(x.k)){const h=kht(m,z.sc);if(!h)return'unk';return kxs(x.k,[h[0],h[1],+z.sc[0]-h[0],+z.sc[1]-h[1]])?'hit':'miss'}return hit(x.k,+z.sc[0],+z.sc[1])?'hit':'miss'}if(z.k=='live'&&z.sc&&!isI(x.k)){const h=+z.sc[0],g=+z.sc[1];if(!isNaN(h)&&!isNaN(g)){let hi=0,lo=0;for(let i=0;i<=9;i++)for(let j=0;j<=9;j++){hit(x.k,h+i,g+j)?hi++:lo++}if(hi==0)return'miss';if(lo==0)return'hit'}}return z.k=='live'?'live':'wait'};
const pops=m=>{const key=[m.c,m.h,m.a].join('|'),l=LGR.filter(r=>r.mk==key);return l.length?l.map(r=>({k:r.k,p:r.p})).sort((a,b)=>b.p-a.p):pick(m).o.map(x=>({k:x.k,p:x.p}))};
const hwf=s=>s&&s.k=='ft'&&s.sc?(+s.sc[0]>+s.sc[1]?1:+s.sc[0]<+s.sc[1]?2:0):0;const PL2={hit:'Tuttu',miss:'Tutmadı',live:'Oynanıyor'};
const BETS=[{stake:21,ret:70.31,legs:[{c:'SL',h:'Eyüpspor',a:'Kocaelispor',side:'a',kind:'tg',line:0.5,odd:1.25},{c:'BL',h:'Mainz',a:'Bayern',side:'t',kind:'tot',line:2.5,odd:1.25},{c:'SL',h:'Galatasaray',a:'Amedspor',side:'a',kind:'tg',line:0.5,odd:1.5},{c:'SA',h:'Roma',a:'Sassuolo',side:'h',kind:'tg',line:1.5,odd:1.25},{c:'L1',h:'PSG',a:'Troyes',side:'h',kind:'tg',line:1.5,odd:1.14}]},{stake:10,ret:26.5,legs:[{c:'ERE',h:'Heerenveen',a:'Feyenoord',side:'t',kind:'tot',line:1.5,odd:1.10},{c:'SA',h:'Napoli',a:'Lazio',side:'a',kind:'tg',line:0.5,odd:1.28},{c:'BEL',h:'Club Brugge',a:'Anderlecht',side:'t',kind:'tot',line:1.5,odd:1.11},{c:'LL',h:'Elche',a:'Betis',side:'a',kind:'tg',line:0.5,odd:1.16},{c:'SL',h:'Çorum',a:'Fenerbahçe',side:'t',kind:'tot',line:1.5,odd:1.18},{c:'ERE',h:'Twente',a:'Ajax',side:'t',kind:'tot',line:1.5,odd:1.12},{c:'PL',h:'Brighton',a:'Brentford',side:'h',kind:'tg',line:0.5,odd:1.12}]}];
const betLeg=l=>{const m=R.find(r=>r.c==l.c&&r.h==l.h&&r.a==l.a),v=RES[[l.c,l.h,l.a].join('|')];let g=null,fin=false,stale=false;if(v){const L=v[0]=='L',p=(L?v.slice(1):v).split('-').map(Number);if(p.length==2&&!isNaN(p[0])&&!isNaN(p[1])){g=p;fin=!L;stale=L&&m&&Date.now()>m.t.getTime()+8e6}}const cnt=g?(l.side=='h'?g[0]:l.side=='a'?g[1]:g[0]+g[1]):null;let s='wait';if(cnt!=null){if(cnt>l.line)s='hit';else if(fin)s='miss';else s=stale?'unk':'live'}else if(m){const k=stt(m).k;s=k=='on'||k=='live'?'live':k=='unk'||k=='ft'?'unk':'wait'}let p=null,lh=null,la=null;try{if(m&&!m.np&&m.p){const q=gmk(m,luf(m));lh=q.lh;la=q.la;const cd=(x,n)=>{const A=pm(x),t=A.reduce((u,v)=>u+v,0);let c=0;for(let i=0;i<n&&i<A.length;i++)c+=A[i];return 1-c/t},n=Math.floor(l.line)+1;p=l.kind=='tot'?cd(lh+la,n):cd(l.side=='h'?lh:la,n)}}catch(e){}return{m,g,s,p,lh,la}};
let BTO=false;const betsBox=day=>{const ss=(typeof KPS!='undefined'&&Array.isArray(KPS)?KPS:[]).filter(s=>s.home&&s.legs.some(l=>{const m=kmatch(l);return m&&dk(m.t)==day}));if(!ss.length)return'';return`<div class='betw'><div class='betlbl'>Simülasyon kuponlarım</div>`+ss.map(s=>kSlipD(s,true)).join('')+`</div>`};
const mrow=m=>{const s=stt(m),po=pops(m),st={ft:'MS',live:s.old?'Son skor':'Canlı',on:'Canlı',unk:'Skor aranıyor',wait:hm(m.t)}[s.k];return`<div class='mr' data-k='${s.k}' data-m='${[m.c,m.h,m.a].join('|')}'><div class='lt'><span class='${s.k=='live'||s.k=='on'?'lv2':''}'>${s.k=='wait'?hm(m.t):st}</span></div><div class='tz'><div class='${hwf(s)==2?'l':hwf(s)==1?'w':''}'>${bd(m.h)} <span data-tm="${m.h}">${m.h}</span></div><div class='${hwf(s)==1?'l':hwf(s)==2?'w':''}'>${bd(m.a)} <span data-tm="${m.a}">${m.a}</span></div></div>${s.k=='ft'&&po.length?(()=>{const h=po.filter(x=>pso(m,x)=='hit').length,n=po.length;return`<div class='pr ${h==n?'ok':h==0?'miss':'mid'}'>${n==1?(h?'Tuttu':'Tutmadı'):h+'/'+n+' tuttu'}</div>`})():po.length?`<div class='pr wait'>${po.length} tahmin</div>`:''}<div class='sc'>${s.sc?`<b class='${hwf(s)==2?'l':''}'>${s.sc[0]}</b><b class='${hwf(s)==1?'l':''}'>${s.sc[1]}</b>`:s.k=='on'?`<b>–</b><b>–</b>`:(m.np?`<span class='mut' style='font-size:11px'>olasılık<br>yok</span>`:`<span class='mut' style='font-size:13px'>%${Math.round(m.p[0]*100)}<br>%${Math.round(m.p[2]*100)}</span>`)}${s.sc||s.k=='on'?'':`<i class='sct'>${hm(m.t)}</i>`}</div>${mpb(m)}</div>`};
// Tasarim v2: masaustu satirindaki olasilik cubugu (telefonda gizli)
// Tasarim v2: "Saate gore" gorunumu (tum ligler tek listede, saat sirasiyla)
const tsb=ms=>`<div class='box tsb'><div class='lg2'><i class='bd sq' style='background:var(--sf2);color:var(--ink)'>⏱</i><div>Saate göre<small>${ms.length} maç · tüm ligler</small></div></div>${ms.map(mrow).join('')}</div>`;
const mpb=m=>{if(m.np||!m.p||m.p.length!=3)return`<div class='pb yok'>olasılık yok</div>`;const i=m.p.indexOf(Math.max(...m.p)),k=['1','X','2'][i],P=m.p.map(v=>Math.round(v*100));return`<div class='pb' title='Model olasılığı: 1 %${P[0]} · X %${P[1]} · 2 %${P[2]}'><span>${m.p.map((v,j)=>`<i class='${j==i?'f':''}' style='flex:${v.toFixed(3)}'></i>`).join('')}</span><b>${k} %${P[i]}</b></div>`};
const nzq=x=>x.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
let TV='all',TVT='',DSEL='',RF='all';
const rr_=(f,c)=>f>c?'G':f==c?'B':'M',BIGC=['CL','EL','ECL','UNL'];
function teamComps(n){const t=TM[n],g=SLG[n]||[],cs=[],tt=rc=>{const q=sm(rc);return{w:q.G,d:q.B,l:q.M,f:q.f,a:q.c}},
 fromList=(lines,key)=>lines.map(r=>r.h==n?{H:1,o:r.a,d:r.d,f:r.x,c:r.y,r:rr_(r.x,r.y)}:{H:0,o:r.h,d:r.d,f:r.y,c:r.x,r:rr_(r.y,r.x)}),
 lgc=t?t.l:(R.find(m=>(m.h==n||m.a==n)&&!BIGC.includes(m.c))||{}).c;
 if(lgc&&!BIGC.includes(lgc)&&(t||g.length)){const o=t&&t.w+t.d+t.o>0?{w:t.w,d:t.d,l:t.o,f:t.f,a:t.a}:(g.length?tt(g):null);cs.push({id:lgc,name:LN[lgc]?LN[lgc].split(' – ')[1]:lgc,rl:'Lig sırası',rank:t?t.r:null,pts:t?t.p:null,recs:g,tot:o,lg:1})}
 if(R.some(m=>m.c=='CL'&&(m.h==n||m.a==n))||CLR.some(r=>r.h==n||r.a==n)){const rs=fromList(CLR.filter(r=>r.h==n||r.a==n).map(r=>({...r,k:r.d.split('.').reverse().join('')})).sort((a,b)=>a.k<b.k?-1:a.k>b.k?1:0)),row=clT().find(x=>x[1]==n);cs.push({id:'CL',name:'Şampiyonlar Ligi',rl:'Lig aşaması sırası',rank:row?row[0]:null,pts:row?row[7]:null,recs:rs,tot:rs.length?tt(rs):null})}
 ['EL','ECL'].forEach(c=>{if(!EUS[c])return;const part=R.some(m=>m.c==c&&(m.h==n||m.a==n))||EUS[c][n];if(!part)return;const rs=fromList(EUR[c].split('\n').map(l=>{const[h,a,x,y]=l.split('|');return{h,a,x:+x,y:+y}}).filter(r=>r.h==n||r.a==n)),e=Object.entries(EUS[c]).sort((x,y)=>y[1].p-x[1].p||(y[1].f-y[1].c)-(x[1].f-x[1].c)||y[1].f-x[1].f||y[1].w-x[1].w),i=e.findIndex(x=>x[0]==n);cs.push({id:c,name:N[c]||c,rl:'Lig aşaması sırası',rank:i>=0?i+1:null,pts:EUS[c][n]?EUS[c][n].p:null,recs:rs,tot:rs.length?tt(rs):null})});
 if(typeof UNS0!='undefined'&&UNS0[n]){const all=unAll(),rs=fromList(all.filter(q=>q.h==n||q.a==n)),s=unS(all.filter(q=>q.g==UNS0[n].g)),e=Object.entries(s).sort((a,b)=>b[1].p-a[1].p||(b[1].f-b[1].c)-(a[1].f-a[1].c)||b[1].f-a[1].f||b[1].w-a[1].w),i=e.findIndex(x=>x[0]==n),z=s[n],gr=UNS0[n].g;cs.push({id:'UNL',name:N.UNL||'Uluslar Ligi',rl:'Grup sırası ('+gr[0]+' Ligi, Grup '+gr[1]+')',rank:z?i+1:null,pts:z?z.p:null,recs:rs,tot:rs.length?tt(rs):null})}
 return cs}
let NAVS=[],FWD=[],PMV=null,TCS=[];
const snap=()=>({tab,Q,QX,det,dt,PMV,F,day,TV,TVT,y:(window.pageYOffset||0)}),push=()=>{NAVS.push(snap());FWD.length=0;if(NAVS.length>40)NAVS.shift()};
const goS=s=>{({tab,Q,QX,det,dt,PMV,F,day,TV,TVT}=s);const q=$('#q');if(q)q.value=Q;render();try{scrollTo(0,s.y||0)}catch(e){}},back=()=>{const s=NAVS.pop();if(!s)return false;FWD.push(snap());goS(s);return true},fwd=()=>{const s=FWD.pop();if(!s)return false;NAVS.push(snap());goS(s);return true};
const gbm=(w,d,l)=>`<span class='xg'>${w}</span>-<span class='xb'>${d}</span>-<span class='xr'>${l}</span>`,gbmL=v=>`<span class='xg'>${v.G}G</span> <span class='xb'>${v.B}B</span> <span class='xr'>${v.M}M</span>`,blu=x=>`<span class='bq'>${x}</span>`;
const WK=(()=>{const a=[],b=['09-05','10-10','11-14'];for(let d=Date.UTC(2026,7,15);d<Date.UTC(2027,0,31);d+=7*864e5){const x=new Date(d),k=String(x.getUTCMonth()+1).padStart(2,'0')+'-'+String(x.getUTCDate()).padStart(2,'0');if(!b.includes(k))a.push(d+12*36e5)}return a})();
function recT(cs,n){const U=(m,d)=>Date.UTC(2026,m-1,d,12),tb={EL:[[9,24],[10,1],[10,22],[11,5]],ECL:[[9,25],[10,2],[10,23],[11,5]],UNL:[[9,3],[9,6],[10,9],[10,12]]},now=Date.now();
cs.forEach(c=>{const rc=c.recs;if(c.id=='CL'){rc.forEach(r=>{const[d,m]=(r.d||'01.01').split('.').map(Number);r.t=U(m,d)});return}
if(tb[c.id]){rc.forEach((r,i)=>{const z=tb[c.id][Math.min(i,3)];r.t=U(z[0],z[1])+Math.max(0,i-3)*7*864e5});return}
rc.forEach((r,i)=>{const h=r.H?n:r.o,a=r.H?r.o:n,m=R.find(x=>x.c==c.id&&x.h==h&&x.a==a);r.wk=r.w||i+1;if(m&&stt(m).k=='ft'){r.t=+m.t;r.ex=1}});
let ai=-1;for(let i=rc.length-1;i>=0;i--)if(rc[i].ex){ai=i;break}
let aw,at;if(ai>=0){aw=rc[ai].wk;at=rc[ai].t}else if(rc.length){aw=rc[rc.length-1].wk;at=WK.filter(x=>x<=now).pop()||WK[0]}else return;
const near=t=>{let b=0;WK.forEach((x,i)=>{if(Math.abs(x-t)<Math.abs(WK[b]-t))b=i});return b},ia=near(at);
rc.forEach(r=>{if(!r.ex)r.t=WK[Math.max(0,Math.min(WK.length-1,ia-(aw-r.wk)))]})})}
const recOf=k=>{const i=k.indexOf('|'),c=TCS.find(c=>c.id==k.slice(0,i));return c&&c.recs[+k.slice(i+1)]?{c,r:c.recs[+k.slice(i+1)]}:null};
const recLb=k=>{const z=recOf(k);if(!z)return'';const{c,r}=z,n=TVT,h=r.H?n:r.o,a=r.H?r.o:n;return`${h} ${r.H?r.f:r.c}-${r.H?r.c:r.f} ${a} · ${c.name}${r.w?' · Hafta '+r.w:r.d?' · '+fdr(r.d):''} — maçı açmak için tekrar dokun`};
function openRec(k){const z=recOf(k);if(!z)return;const{c,r}=z,n=TVT,h=r.H?n:r.o,a=r.H?r.o:n,key=c.id+'|'+h+'|'+a;push();if(R.some(m=>[m.c,m.h,m.a].join('|')==key)){det=key;dt='p';PMV=null}else{PMV={cn:c.name,h,a,x:r.H?r.f:r.c,y:r.H?r.c:r.f,w:r.w,d:r.d};det=null}render();try{scrollTo(0,0)}catch(e){}}
const prw=(c,r,i,h,a)=>`<div class='box'><div class='cp'>${c.name}</div><div class='mr' data-pk='${c.id}|${i}'><div class='lt'>${r.w?'H'+r.w:fdr(r.d)}<span>MS</span></div><div class='tz'><div class='${r.r=='M'?(r.H?'l':'w'):r.r=='G'?(r.H?'w':'l'):''}'>${bd(h)} <span data-tm="${h}">${h}</span></div><div class='${r.r=='M'?(r.H?'w':'l'):r.r=='G'?(r.H?'l':'w'):''}'>${bd(a)} <span data-tm="${a}">${a}</span></div></div><div style='margin-right:10px'><i class='fi f${r.r}'>${r.r}</i></div><div class='sc'><b class='${r.r=='M'?(r.H?'l':''):r.r=='G'?(r.H?'':'l'):''}'>${r.H?r.f:r.c}</b><b class='${r.r=='M'?(r.H?'':'l'):r.r=='G'?(r.H?'l':''):''}'>${r.H?r.c:r.f}</b></div></div><div class='mut' style='padding:0 2px 8px'>Tahmin kaydı yok</div></div>`;
function pastView(p){const hc=(TC[p.h]||['#4a5a68'])[0],ac=(TC[p.a]||['#4a5a68'])[0];return`<div class='dh2' style='background:linear-gradient(100deg,${hc}88,#0b0f14 50%,${ac}88)'><div class='dr'><button class='bk' data-bk='1'>←</button><div class='tm2'>${bd(p.h,1)}<br><span data-tm="${p.h}">${p.h}</span></div><div class='ct'><b>${p.x} - ${p.y}</b><div>Maç sonu · ${p.x>p.y?p.h+' kazandı':p.x<p.y?p.a+' kazandı':'Berabere'}</div><div>${p.cn}${p.w?' · Hafta '+p.w:p.d?' · '+fdr(p.d):''}</div></div><div class='tm2'>${bd(p.a,1)}<br><span data-tm="${p.a}">${p.a}</span></div></div></div><div class='box'><div class='mut'>Bu maç için maç öncesi tahmin kaydı yok (tahmin kaydı 28 Ekim 2026’da başladı). Skor, uygulamadaki sonuç verilerinden alındı.</div></div>`}
const SQG=[['F','Forvetler'],['O','Orta Sahalar'],['D','Defans'],['K','Kaleciler']],SQP={F:'Forvet',O:'Orta saha',D:'Defans',K:'Kaleci'};
const sqAv=(n,nm)=>{const[a,b]=kitc(n),w=nm.replace(/[^A-Za-zÇĞİÖŞÜçğıöşüÀ-ÿØø' -]/g,'').trim().split(/\s+/),ini=((w[0]||'')[0]||'')+(w.length>1?w[w.length-1][0]:'');return`<i class='kav' style='background:${a};color:${lum(a)>.55?'#111':'#fff'};box-shadow:0 0 0 2px ${b}'>${ini.toUpperCase()}</i>`};
const BOOT="<span class='kbt' title='Asist' data-tip='Asist'>👟</span>";
const sqHd=(t,g)=>`<div class='kh'><b>${t}</b><span title='Oynadığı maç' data-tip='Oynadığı maç'>M</span><span title='Oynadığı dakika' data-tip='Oynadığı dakika'>Dk</span>${g?`<span title='Gol yemeden biten maç' data-tip='Gol yemeden biten maç'>🧤</span><span title='Yediği gol' data-tip='Yediği gol'>🥅</span>`:`<span title='Gol' data-tip='Gol'>⚽</span><span>${BOOT}</span>`}<span title='Sarı kart' data-tip='Sarı kart'><i class='ky'></i></span><span title='Kırmızı kart' data-tip='Kırmızı kart'><i class='ky kr2'></i></span></div>`;
const squadB=n=>{const l=plAll().filter(x=>x.team==n);if(!l.length)return"<div class='mut'>Bu takım için oyuncu verisi yok.</div>";const T=PS[l[0].tk]||{},row=x=>{const p=x.p;return`<button class='kr' data-pl="${x.k}">${sqAv(n,p[0])}<span class='kn'><b>${p[0]}</b><small>${p[7]?'#'+p[7]+' · ':''}${SQP[p[6]]||'Mevki kaynakta yok'}</small></span><span>${p[1]}</span><span>${p[2]}</span>${p[6]=='K'?`<span>${p[8]==null?'–':p[8]}</span><span>${p[9]==null?'–':p[9]}</span>`:`<span>${p[3]}</span><span>${p[4]}</span>`}<span>${p[5]}</span><span class='kx'>–</span></button>`},grp=(t,a)=>a.length?`<div class='kg'>${sqHd(t,a.length&&a[0].p[6]=='K')}${a.sort((x,y)=>y.p[2]-x.p[2]).map(row).join('')}</div>`:'';const hasPos=l.some(x=>x.p[6]);const body=hasPos?SQG.map(([c,t])=>grp(t,l.filter(x=>x.p[6]==c))).join('')+grp('Mevki kaynakta yok',l.filter(x=>!x.p[6])):grp('Oyuncular',l.slice());return body};
function teamHead(n,pend,ps){if(TVT!=n){TVT=n;TV='all';RF='all'}const cs=teamComps(n);TCS=cs;recT(cs,n);const cm=Object.fromEntries(cs.map(c=>[c.id,c]));if(TV!='all'&&TV!='kd'&&!cm[TV])TV='all';if(RF!='all'&&!cm[RF])RF='all';if(cs.length==1&&TV!='kd')TV=cs[0].id;
const dots=c=>c.recs.map((r,i)=>[r,i]).slice(-5).map(([r,i])=>`<i class='fi f${r.r}' data-dk='${c.id}|${i}'>${r.r}</i>`).join(''),sr=(a,b)=>`<div class='sr'><span>${a}</span><b>${b}</b></div>`,
pv=(rc,H)=>rc.some(r=>r.H==H)?(()=>{const v=sm(rc.filter(r=>r.H==H));return sr(H?'Evinde':'Deplasmanda',`${gbmL(v)} · ${v.f}:${v.c}`)})():'',
lgn=cs.map(c=>c.name).join(' · ')||'Veri yok',inc=c=>c.tot&&c.recs.length<c.tot.w+c.tot.d+c.tot.l?`<div class='mut' style='padding:4px 2px 8px;font-size:13px'>${c.name}: puan durumu ${c.tot.w+c.tot.d+c.tot.l} maç gösteriyor ama elimde yalnızca ${c.recs.length} maçın skoru var (maç geçmişi veri yok).</div>`:'',
tabs=((cs.length>1?[['all','Tümü']].concat(cs.map(c=>[c.id,c.name])):cs.length==1?[[cs[0].id,cs[0].name]]:[]).concat(plAll().some(x=>x.team==n)?[['kd','Kadro']]:[])).length>1?`<div class='chips' style='margin:10px 0 2px'>${(cs.length>1?[['all','Tümü']].concat(cs.map(c=>[c.id,c.name])):cs.length==1?[[cs[0].id,cs[0].name]]:[]).concat(plAll().some(x=>x.team==n)?[['kd','Kadro']]:[]).map(([k,l])=>`<button data-ct='${k}' class='${TV==k?'on':''}'>${l}</button>`).join('')}</div>`:'',
nxm=TV=='all'?(pend&&pend[0]?pend[0].m:null):((pend||[]).find(x=>x.m.c==TV)||{}).m||null,
nx=nxm?(()=>{const o=nxm.h==n?nxm.a:nxm.h;return sr('Sıradaki maç',`<span data-tm="${o}">${o}</span> (${nxm.h==n?'ev':'dep'}) · ${dd(nxm.t)} ${hm(nxm.t)}${TV=='all'?' · '+N[nxm.c]:''}`)})():'';
let body='';
if(TV=='kd')body=squadB(n);else if(!cs.length)body="<div class='mut'>Bu takım için puan durumu verisi yok.</div>";
else if(TV=='all'){const T=cs.filter(c=>c.tot).reduce((s,c)=>({w:s.w+c.tot.w,d:s.d+c.tot.d,l:s.l+c.tot.l,f:s.f+c.tot.f,a:s.a+c.tot.a}),{w:0,d:0,l:0,f:0,a:0});body=sr('Tüm maçlar / G-B-M',`${blu(T.w+T.d+T.l)} · ${gbm(T.w,T.d,T.l)}`)+sr('Atılan / yenen gol',`${T.f}:${T.a}`)+cs.map(c=>`<div class='sr ps'><span>${c.name}</span><span style='flex:none'><b>${c.tot?`${c.rank?blu(c.rank+'.')+' · '+c.pts+' puan · ':''}${gbm(c.tot.w,c.tot.d,c.tot.l)} · ${c.tot.f}:${c.tot.a}`:'Veri yok'}</b>${c.recs.length?'<br>'+dots(c):''}</span></div>`).join('')+cs.map(inc).join('')}
else{const c=cm[TV];body=(c.rank?sr(c.rl,`${blu(c.rank+'.')} · ${c.pts} puan`):'')+(c.tot?sr('Maç / G-B-M',`${blu(c.tot.w+c.tot.d+c.tot.l)} · ${gbm(c.tot.w,c.tot.d,c.tot.l)}`)+sr('Atılan / yenen gol',`${c.tot.f}:${c.tot.a}`):"<div class='mut'>Bu yarışmada henüz oynanan maç yok.</div>")+(c.recs.length?`<div class='sr'><span>Son ${Math.min(5,c.recs.length)} ${c.lg?'lig maçı':'maç'}</span><span>${dots(c)}</span></div>`+pv(c.recs,1)+pv(c.recs,0):'')+inc(c)}
return`<div class='box tmh'><div class='lg2'>${bd(n,1)}<div>${n}<small>${lgn}</small></div><button class='fav${FAV.has(n)?' on':''}' data-fav="${n}" aria-label='Favori'>${FAV.has(n)?'★':'☆'}</button></div>${tabs}${TV=='kd'?'':ps||''}${body}<div id='dlb' style='display:none'></div>${nx}</div>${nwh([n])}`}
const LGA={CL:['Şampiyonlar Ligi','Şampiyonlar','UEFA Şampiyonlar Ligi','Champions League','UCL','Avrupa Şampiyonlar'],EL:['Avrupa Ligi','UEFA Avrupa Ligi','Europa League','UEL'],ECL:['Konferans Ligi','Avrupa Konferans Ligi','Conference League','UECL'],UNL:['Milli Takımlar Ligi','Uluslar Ligi','UEFA Uluslar Ligi','Nations League','Milli Takım','Milli Takımlar'],SL:['Süper Lig','Türkiye Süper Ligi','Türkiye','Türk Ligi','Türk','TFF','Trendyol Süper Lig'],PL:['Premier Lig','Premier League','İngiltere','İngiltere Ligi','İngiliz','England','EPL'],LL:['La Liga','LaLiga','İspanya','İspanya Ligi','İspanyol','Spain'],SA:['Serie A','İtalya','İtalya Ligi','İtalyan','Italy'],BL:['Bundesliga','Almanya','Almanya Ligi','Alman','Germany'],L1:['Ligue 1','Fransa','Fransa Ligi','Fransız','France'],POR:['Portekiz Ligi','Portekiz','Liga Portugal','Primeira Liga','Portugal','Portekiz Süper Ligi'],ERE:['Hollanda Ligi','Eredivisie','Hollanda','Hollanda Eredivisie','Netherlands','Dutch','Holland'],BEL:['Belçika Ligi','Belçika','Jupiler','Jupiler Pro League','Pro League','Belgium','Belçika Pro Ligi'],SCO:['İskoçya Ligi','İskoçya','Skoçya','Scottish Premiership','İskoç Premiership','Scotland','Premiership'],KSA:['Suudi Ligi','Suudi Arabistan','Suudi Pro Ligi','Saudi Pro League','Saudi','Roshn','Suudi Arabistan Ligi']};
const LGNM={CL:'Şampiyonlar Ligi',EL:'Avrupa Ligi',ECL:'Konferans Ligi',UNL:'Milli Takımlar Ligi',SL:'Süper Lig',PL:'Premier Lig',LL:'La Liga',SA:'Serie A',BL:'Bundesliga',L1:'Ligue 1',POR:'Portekiz Ligi',ERE:'Hollanda Ligi',BEL:'Belçika Ligi',SCO:'İskoçya Ligi',KSA:'Suudi Ligi'};
const LGAN=Object.fromEntries(Object.entries(LGA).map(([c,a])=>[c,a.map(x=>nzq(x))]));
const lgm=q=>{q=nzq(q.trim());if(q.length<3)return[];const ex=[],pt=[];Object.entries(LGAN).forEach(([c,al])=>{if(!R.some(m=>m.c==c))return;if(al.includes(q))ex.push(c);else if(al.some(x=>x.startsWith(q)||x.split(' ').some(w=>w.startsWith(q))))pt.push(c)});return ex.length?ex:pt};
let LGT='p';const LORD=['CL','EL','ECL','UNL','SL','PL','LL','BL','L1','SA','POR','ERE','BEL','SCO','KSA'];
function lgStats(c){let h=0,m=0,w=0,tot=0;R.filter(x=>x.c==c).forEach(mm=>{LGR.filter(r=>r.mk==[mm.c,mm.h,mm.a].join('|')).forEach(r=>{tot++;const z=pso(mm,{k:r.k,p:r.p});if(z=='hit')h++;else if(z=='miss')m++;else w++})});return{tot,h,m,w}}
function ligView(){const rows=LORD.filter(c=>R.some(m=>m.c==c)).map(c=>{const k=lgStats(c),n=R.filter(m=>m.c==c).length,nx=R.filter(m=>m.c==c&&stt(m).k=='wait').sort((a,b)=>a.t-b.t)[0];return`<div class='box lgc' data-lg2='${c}'><div class='lg2'><div class='bd' style='background:${C[c]||'#4a5a68'};width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 13px var(--n);color:#fff'>${c}</div><div>${LGNM[c]||N[c]||c}<small>${LN[c]?LN[c].split(' – ')[0]:'Avrupa'} · ${n} maç kayıtlı${nx?' · sıradaki '+dd(nx.t):''}<br>${k.tot?`Tahmin: <b>${k.tot}</b> · Tutma: <b>${k.h+k.m?`${k.h}/${k.h+k.m} (%${Math.round(k.h/(k.h+k.m)*100)})`:'henüz yok'}</b>`:'Kayıtlı tahmin yok'}</small></div></div></div>`}).join('');$('#app').innerHTML=segc()+(FAV.size?`<div class='box'><h3>★ Favori takımlarım</h3><div class='mut'>Takıma dokun, sayfasına git</div><div class='chips wrap'>${[...FAV].map(n=>`<button data-tm="${n}">${n}</button>`).join('')}</div></div>`:'')+`<h3 style='margin:4px 0 8px'>Ligler ve kupalar</h3>`+rows;bindU([]);document.querySelectorAll('[data-lg2]').forEach(x=>x.onclick=()=>{push();Q=LGNM[x.dataset.lg2];QX='';LGT='p';tab='k';const e=$('#q');if(e)e.value=Q;render();try{scrollTo(0,0)}catch(e){}})}
function lgBind(){const c=$('#clr');if(c)c.onclick=()=>{Q='';const e=$('#q');if(e)e.value='';render()};const b=$('#bk2');if(b)b.onclick=()=>{back()};document.querySelectorAll('[data-lg]').forEach(x=>x.onclick=()=>{Q=LGNM[x.dataset.lg];QX='';const e=$('#q');if(e)e.value=Q;render()});document.querySelectorAll('[data-lt]').forEach(x=>x.onclick=()=>{LGT=x.dataset.lt;render()});document.querySelectorAll('[data-m]').forEach(r=>r.onclick=()=>{push();det=r.dataset.m;dt='p';PMV=null;render();try{scrollTo(0,0)}catch(e){}})}
function leagueView(c){const nm=LGNM[c]||N[c]||c,ms=R.filter(m=>m.c==c),now=Date.now(),fin=m=>stt(m).k=='ft',led=m=>LGR.some(r=>r.mk==[m.c,m.h,m.a].join('|')),
pend=ms.filter(m=>!fin(m)).sort((a,b)=>b.t-a.t),done=ms.filter(fin).sort((a,b)=>b.t-a.t),
frow=m=>{const s=stt(m);return`<div class='box'><div class='mr' data-m='${[m.c,m.h,m.a].join('|')}'><div class='lt'>${dd(m.t)}<span>MS</span></div><div class='tz'><div class='${hwf(s)==2?'l':hwf(s)==1?'w':''}'>${bd(m.h)} <span data-tm="${m.h}">${m.h}</span></div><div class='${hwf(s)==1?'l':hwf(s)==2?'w':''}'>${bd(m.a)} <span data-tm="${m.a}">${m.a}</span></div></div><div class='sc'>${s.sc?`<b class='${hwf(s)==2?'l':''}'>${s.sc[0]}</b><b class='${hwf(s)==1?'l':''}'>${s.sc[1]}</b>`:''}</div></div><div class='mut' style='padding:0 2px 8px'>Tahmin kaydı yok</div></div>`},
card=m=>`<div class='box'>${mrow(m)}</div>`,
tm=[...new Set(R.filter(m=>nzq(m.h+' '+m.a).includes(nzq(Q.trim()))).flatMap(m=>[m.h,m.a]).filter(n=>nzq(n).includes(nzq(Q.trim()))))].slice(0,6);
const first=ms[0]||{c},st=tbl({...first,h:'',a:''}),LK=(()=>{let h=0,m=0,w=0,tot=0;ms.forEach(mm=>{LGR.filter(r=>r.mk==[mm.c,mm.h,mm.a].join('|')).forEach(r=>{tot++;const z=pso(mm,{k:r.k,p:r.p});if(z=='hit')h++;else if(z=='miss')m++;else w++})});return{tot,h,m,w}})(),lks=LK.tot?`Toplam tahmin: <b>${LK.tot}</b> · Tutma oranı: <b>${LK.h+LK.m?`${LK.h}/${LK.h+LK.m} (%${Math.round(LK.h/(LK.h+LK.m)*100)})`:'henüz sonuçlanan yok'}</b>${LK.w?` · ${LK.w} bekliyor`:''}`:'Bu ligde kayıtlı tahmin yok';
return`<div class='dn'>${NAVS.length?"<button class='fl' id='bk2'>← Geri</button>":''}<button class='fl' id='clr'>✕ Aramayı temizle</button></div><div class='box'><div class='lg2'><div class='bd' style='background:${C[c]||'#4a5a68'};width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 14px var(--n);color:#fff'>${c}</div><div>${nm}<small>${LN[c]?LN[c].split(' – ')[0]:'Avrupa'} · ${ms.length} maç kayıtlı<br>${lks}</small></div></div><div class='chips' style='margin:10px 0 2px'>${[['p','Puan durumu'],['m','Maçlar']].map(([k,l])=>`<button data-lt='${k}' class='${LGT==k?'on':''}'>${l}</button>`).join('')}</div></div>${tm.length?`<div class='mut' style='margin:0 0 8px'>Takım sonuçları: ${tm.map(n=>`<button class='fl' data-tm="${n}" style='padding:5px 11px;font-size:15px;margin:2px'>${n}</button>`).join('')}</div>`:''}`+(LGT=='p'?st:(pend.length?`<h3 style='margin:14px 0 6px'>Bekleyen veya oynanan maçlar</h3>`+pend.map(card).join(''):'')+(done.length?`<h3 style='margin:14px 0 6px'>Sonuçlanan maçlar</h3>`+done.map(m=>led(m)?card(m):frow(m)).join(''):''))}
const plAll=()=>{const o=[];Object.entries(PS).forEach(([k,t])=>(t.p||[]).forEach((p,i)=>o.push({k:k+'#'+i,tk:k,team:k.split('|').slice(1).join('|'),c:k.split('|')[0],p,nz:nzq(p[0])})));return o};
const plFind=(team,nm)=>{const q=nzq(nm.trim());if(!q)return null;const l=plAll().filter(x=>x.team==team);return(l.find(x=>x.nz==q)||l.find(x=>x.nz.endsWith(' '+q))||l.find(x=>x.nz.split(' ').includes(q))||l.find(x=>x.nz.includes(q))||{}).k||null};
const plOpen=(key,nm)=>{push();det=null;PMV=null;tab='k';Q=nm;QX='@p:'+key;const q=$('#q');if(q)q.value=Q;render();try{scrollTo(0,0)}catch(e){}};
const plRes=(q,ex)=>{if(ex||q.length<3)return'';const l=plAll().filter(x=>x.nz.includes(q)).slice(0,12);if(!l.length)return'';return`<div class='box'><h3>Oyuncular</h3><div class='chips wrap'>${l.map(x=>`<button data-pl="${x.k}">${x.p[0]} · ${x.team}</button>`).join('')}</div></div>`};
const plMt=(full,sh)=>{const a=nzq(full),b=nzq(sh);return a==b||a.endsWith(' '+b)||a.split(' ').includes(b)};
const plLast=(team,c,nm)=>{const t=PS[c+'|'+team],ms=t&&t.m;if(!ms||!ms.length)return`<div class='box'><h3>Son 5 maç</h3><div class='mut'>Veri yok: bu takımın maç bazlı kaydı henüz eklenmedi.</div></div>`;const is=x=>plMt(nm,x);const rows=ms.slice(0,5).map(m=>{let st='';const ux=m.x.some(is),ui=m.u.find(u=>is(u[0])),uo=m.u.find(u=>is(u[1]));const pg=m.g.some(g=>is(g[0])||(g[2]&&is(g[2]))),py=m.y.some(y=>is(y[0]));if(!m.x.length)st=ui?`Yedekten ${ui[2]}' girdi`:(uo?`Maçta oynadı, ${uo[2]}' çıktı (ilk 11 kaynakta yok)`:((pg||py)?'Maçta oynadı (ilk 11 ve süre kaynakta yok)':'Bu oyuncunun maçtaki durumu kaynakta yok (yalnızca maç skoru var)'));else if(ux)st=uo?`İlk 11, ${uo[2]>90?'90+':uo[2]}' çıktı`:(m.uc?'İlk 11, tam süre':'İlk 11 (çıkış dakikası bilinmiyor)');else if(ui)st=`Yedekten ${ui[2]}' girdi`;else st=m.uc?'Oynamadı ya da kadroda değil':'Yedekte ya da kadro dışında (değişiklik verisi eksik olabilir)';const ev=[];m.g.filter(g=>is(g[0])).forEach(g=>ev.push(`<b title='Gol' data-tip='Gol'>⚽ ${g[1]}' gol</b>`));m.g.filter(g=>g[2]&&is(g[2])).forEach(g=>ev.push(`<b title='Asist' data-tip='Asist'>🅰 ${g[1]}' asist</b>`));m.y.filter(y=>is(y[0])).forEach(y=>ev.push(`<b title='Sarı kart' data-tip='Sarı kart'>🟨 ${y[1]}'</b>`));return`<div class='sr' style='flex-direction:column;align-items:flex-start;gap:2px'><span><b class='${m.r=='G'?'':''}'>${m.d}</b> · ${m.c} · ${m.t}</span><span class='mut'>${st}${ev.length?' · '+ev.join(' · '):''}</span></div>`}).join('');const nn=ms.slice(0,5).filter(m=>m.n).map(m=>`${m.d}: ${m.n}`).join(' ')+(ms.some(m=>!m.x.length)?' Bazı maçlarda yalnızca skor var (çoğunlukla yalnızca lig maçları; skorlar SportRadar ve çeşitli skor sitelerinden); ilk 11, değişiklik, gol ve kart bilgisi yok.':'');return`<div class='box'><h3>Son ${Math.min(5,ms.length)} maç</h3>${rows}<div class='mut' style='margin-top:6px;font-size:12px'>Kaynak notları: ${nn} Çelişen veya tek kaynaklı bilgi gösterilmedi ya da işaretlendi; kırmızı kart verisi yok.</div></div>`};
const plPage=v=>{let p=null,team='',nm='',c='';if(v.includes('#')){const x=plAll().find(y=>y.k==v);if(x){p=x.p;team=x.team;c=x.c;nm=p[0]}}else{const a=v.split('|');team=a[0];nm=a.slice(1).join('|')}const t=PS[c+'|'+team]||{};const f1=n=>(Math.round(n*100)/100).toFixed(2);const row=(a,b)=>`<div class='sr'><span>${a}</span><b>${b}</b></div>`;let body;if(p){const m90=p[2]/90;body=row('Maç',p[1])+row('Oynadığı dakika',p[2])+row('Gol',p[3])+row('Asist',p[4])+row('Sarı kart',p[5])+row('Kırmızı kart',t.kr||'kaynakta yok')+(p[6]=='K'?row('Gol yemeden biten maç',p[8]==null?'veri yok':p[8])+row('Yediği gol',p[9]==null?'veri yok':p[9])+(t.gk?`<div class='mut'>${t.gk}</div>`:''):'')+(p[2]>=180?row('90 dakikada gol (hesaplanan)',f1(p[3]/m90))+row('90 dakikada gol+asist (hesaplanan)',f1((p[3]+p[4])/m90)):'')+`<div class='mut' style='margin-top:6px'>Kaynak: ${t.src||'–'}, ${t.at||'–'}. Yalnızca bu sezonun kayıtlı yarışmaları.</div>`}else body=`<div class='mut'>Bu oyuncu için istatistik verisi yok (takımın oyuncu verisi henüz eklenmedi ya da isim eşleşmedi).</div>`;return`<div class='dn'>${NAVS.length?"<button class='fl' id='bk2'>← Geri</button>":''}<button class='fl' id='clr'>✕ Aramayı temizle</button></div><div class='box tmh'><div class='lg2'>${team?bd(team,1):''}<div>${nm}<small>${team?`<span data-tm="${team}" style='text-decoration:underline;cursor:pointer'>${team}</span>`:''}</small></div></div>${body}</div>${plLast(team,c,nm)}`};
function teamView(){if(QX.startsWith('@p:')){$('#app').innerHTML=plPage(QX.slice(3));const c=$('#clr');if(c)c.onclick=()=>{Q='';QX='';const e=$('#q');if(e)e.value='';render()};const b=$('#bk2');if(b)b.onclick=()=>{back()};return}const lgs=QX&&Q==QX?[]:lgm(Q);if(lgs.length==1){$('#app').innerHTML=leagueView(lgs[0]);lgBind();return}const ex=QX&&Q==QX,q=nzq(Q.trim()),now=Date.now(),ms=R.filter(m=>ex?(m.h==QX||m.a==QX):nzq(m.h+' '+m.a).includes(q)),teams=ex?[QX]:[...new Set(ms.flatMap(m=>[m.h,m.a]).filter(n=>nzq(n).includes(q)))];
const it=ms.map(m=>{const key=[m.c,m.h,m.a].join('|');return{m,o:(LGR.some(r=>r.mk==key)||m.t>now)?pops(m):[]}}).filter(x=>x.o.length);
const fin=x=>stt(x.m).k=='ft',pend0=it.filter(x=>!fin(x)).sort((a,b)=>a.m.t-b.m.t),pend=pend0,pendD=pend0.slice().reverse(),done=it.filter(fin).sort((a,b)=>b.m.t-a.m.t);
const all=it.flatMap(x=>x.o.map(o=>pso(x.m,o))),hh=all.filter(z=>z=='hit').length,mm=all.filter(z=>z=='miss').length,card=x=>`<div class='box'><div class='cp'>${N[x.m.c]}</div>${mrow(x.m)}</div>`;
const title=teams.length==1?'':`“${Q.trim()}” ile eşleşen maçlar`,tps=(()=>{if(teams.length!=1)return'';const hl=[],ml=[];done.forEach(x=>x.o.forEach(o=>{const z=pso(x.m,o),lb=sh(o.k,x.m)+' %'+Math.round(o.p*100);if(z=='hit')hl.push(lb);else if(z=='miss')ml.push(lb)}));const n=hl.length+ml.length,pc=it.filter(x=>!fin(x)).reduce((a,x)=>a+x.o.length,0);if(!it.length)return"<div class='sr ps'><span>Tahmin başarısı</span><b>Kayıtlı tahmin yok</b></div>";return`<div class='sr ps'><span>Tahmin başarısı</span><b>${n?hl.length+'/'+n+' tuttu · %'+Math.round(hl.length/n*100):'Henüz sonuçlanan yok'}${pc?`<br><small style='color:var(--mut);font:600 12px var(--n)'>${pc} tahmin bekliyor</small>`:''}</b></div>`})(),thd=teams.length==1?teamHead(teams[0],pend,tps):'';
const PL_=teams.length==1?(()=>{const n=teams[0],shown=new Set(),its=[];TCS.forEach(c=>{c.recs.forEach((r,i)=>{const h=r.H?n:r.o,a=r.H?r.o:n,key=c.id+'|'+h+'|'+a;if(RF!='all'&&c.id!=RF)return;shown.add(key);const x=done.find(d=>[d.m.c,d.m.h,d.m.a].join('|')==key);its.push({t:r.t||0,h:x?card(x):prw(c,r,i,h,a)})})});done.filter(x=>!shown.has([x.m.c,x.m.h,x.m.a].join('|'))&&(RF=='all'||x.m.c==RF)).forEach(x=>its.push({t:+x.m.t,h:card(x)}));its.sort((a,b)=>b.t-a.t);const ch=TCS.length>1?`<div class='chips' style='margin:2px 0 6px'>${[['all','Tümü']].concat(TCS.map(c=>[c.id,c.name])).map(([k,l])=>`<button data-rf='${k}' class='${RF==k?'on':''}'>${l}</button>`).join('')}</div>`:'';return ch+`<div class='mut' style='margin:0 0 8px;font-size:13px'>En son oynanan maç üstte. Tarihi kayıtlı olmayan lig maçlarında hafta numarasından tahmin edilen tarih kullanılır.</div>`+its.map(x=>x.h).join('')})():null;
const KD=TV=='kd'&&teams.length==1;let HT=`<div class='dn'>${NAVS.length?"<button class='fl' id='bk2'>← Geri</button>":''}<button class='fl' id='clr'>✕ Aramayı temizle</button></div>${lgs.length>1?`<div class='box'><div class='mut'>Hangi lig? ${lgs.map(c=>`<button class='fl' data-lg='${c}' style='padding:6px 12px;font-size:16px;margin:3px'>${LGNM[c]}</button>`).join('')}</div></div>`:''}${title?`<h2 class='vt'>${title}</h2>`:''}${plRes(q,ex)}${thd}<div class='box'><div class='mut'>${it.length?`${it.length} maç için ${all.length} tahmin kayıtlı.${hh+mm?` Sonuçlanan ${hh+mm} tahminin ${hh} tanesi tuttu (%${Math.round(hh/(hh+mm)*100)}), ${mm} tanesi tutmadı.`:' Henüz sonuçlanan tahmin yok.'} Kayıt 28 Ekim 2026’da başladı, öncesi kayıtlı değil.`:'Bu takım için kayıtlı tahmin yok.'}</div></div>`+(pend.length?`<h3 style='margin:14px 0 6px'>Bekleyen veya oynanan maçlar</h3>`+pendD.map(card).join(''):'')+(PL_!==null?(PL_?`<h3 style='margin:14px 0 6px'>Sonuçlanan maçlar</h3>`+PL_:''):(done.length?`<h3 style='margin:14px 0 6px'>Sonuçlanan maçlar</h3>`+done.map(card).join(''):''));if(KD)HT=`<div class='dn'>${NAVS.length?"<button class='fl' id='bk2'>← Geri</button>":''}<button class='fl' id='clr'>✕ Aramayı temizle</button></div>${thd}`;$('#app').innerHTML=HT;
const c=$('#clr');if(c)c.onclick=()=>{Q='';const e=$('#q');if(e)e.value='';render()};document.querySelectorAll('[data-ct]').forEach(b=>b.onclick=()=>{TV=b.dataset.ct;DSEL='';render()});lgBind();document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();favTgl(b.dataset.fav);b.classList.toggle('on',FAV.has(b.dataset.fav));b.textContent=FAV.has(b.dataset.fav)?'★':'☆'});document.querySelectorAll('[data-rf]').forEach(b=>b.onclick=()=>{RF=b.dataset.rf;render()});const bk2=$('#bk2');if(bk2)bk2.onclick=()=>{back()};
document.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{DSEL='';openRec(b.dataset.pk)});
document.querySelectorAll('[data-dk]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.dk;if(DSEL==k){DSEL='';openRec(k)}else{DSEL=k;document.querySelectorAll('[data-dk]').forEach(x=>x.classList.toggle('sel',x.dataset.dk==k));const L=$('#dlb');if(L){L.textContent=recLb(k);L.style.display='block'}}});
document.querySelectorAll('[data-m]').forEach(r=>r.onclick=()=>{push();det=r.dataset.m;dt='p';PMV=null;render();try{scrollTo(0,0)}catch(e){}})}
const stk=n=>{const g=SLG[n];if(!g||g.length<5)return null;const l=g.slice(-10),c=l.length,f=fn=>l.filter(fn).length,a=[['Ü1.5 gol',f(r=>r.f+r.c>1)],['Ü2.5 gol',f(r=>r.f+r.c>2)],['İki takım da gol attı',f(r=>r.f>0&&r.c>0)],['Gol attı',f(r=>r.f>0)],['Gol yedi',f(r=>r.c>0)],['Galibiyet',f(r=>r.r=='G')],['Yenilmedi',f(r=>r.r!='M')],['Gol yemedi',f(r=>r.c==0)]];return{c,l:a.filter(x=>x[1]/c>=.6).sort((x,y)=>y[1]-x[1]).slice(0,6)}};
const hstk=m=>{const l=HH[[m.h,m.a].sort().join('|')];if(!l)return'';const c=l.length,f=fn=>l.filter(fn).length,w=n=>f(r=>(r.h==n&&r.x>r.y)||(r.a==n&&r.y>r.x));return[[m.h+' kazandı',w(m.h)],[m.a+' kazandı',w(m.a)],['Beraberlik',f(r=>r.x==r.y)],['Ü2.5 gol',f(r=>r.x+r.y>2)],['İki takım da gol attı',f(r=>r.x>0&&r.y>0)]].filter(x=>x[1]>0).map(x=>`<div class='sr'><span>${x[0]}</span><b>${x[1]}/${c}</b></div>`).join('')};
const kitc=n=>TC[n]||['#4a5a68','#cbd5dc'];
const shirtP=(n,p)=>{const[a,b]=kitc(n),i=p.indexOf('|'),num=i>0?p.slice(0,i):'',nm=i>0?p.slice(i+1):p,ini=nm.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü ]/g,'').trim().split(' ').pop().slice(0,2).toUpperCase(),d=stDec(CURM?stRow(CURM,n,nm):null);return`<div class='pp' data-pn="${n}|${nm}"><div class='shw'><i class='sh' style='background:${a};box-shadow:0 0 0 2px ${b};color:${lum(a)>.55?'#111':'#fff'}'>${num||ini}</i>${d.i}${d.b}</div><span>${nm}</span>${d.s}</div>`};
const pitch=(n,t)=>{if(!t||!t.xi||!t.xi.length)return'';if(t.xi.length!=11)return`<div class='mut'>Muhtemel 11 eksik (kaynakta ${t.xi.length} isim): ${t.xi.map(p=>p.split('|').pop()).join(', ')}</div>`;const fm=t.f?t.f.split('-').map(Number):null,ok=fm&&fm.reduce((a,b)=>a+b,0)==10;if(!ok)return`<div class='chipx'>${t.xi.map(p=>{const[a,b]=kitc(n),i=p.indexOf('|'),num=i>0?p.slice(0,i):'',nm=i>0?p.slice(i+1):p;return`<div class='abc'><i class='sh sm' style='background:${a};box-shadow:0 0 0 2px ${b};color:${lum(a)>.55?'#111':'#fff'}'>${num||nm.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü ]/g,'').trim().split(' ').pop().slice(0,2).toUpperCase()}</i><b>${nm}</b></div>`}).join('')}</div><div class='mut' style='font-size:12px'>Diziliş ve mevkiler kaynakta yok, bu yüzden saha çizilmedi; 11 oyuncu kaynaktaki sırayla listelendi.</div>`;let rows=[[t.xi[0]]],i=1;fm.forEach(k=>{rows.push(t.xi.slice(i,i+k));i+=k});return`<div class='pch'><div class='pbx'></div><div class='pcc'></div><div class='pbx b'></div>${rows.slice().reverse().map(r=>`<div class='pcr'>${r.map(p=>shirtP(n,p)).join('')}</div>`).join('')}</div>`};
const absIc=k=>k=='sakat'||k.startsWith('sakat')?['ab r','✚']:k.startsWith('cezalı')?['ab c','▮']:k.startsWith('şüpheli')?['ab w','!']:['ab g','?'];
const absB=o=>o&&o.length?`<div class='absg'>${o.map(x=>{const[c,ic]=absIc(x[1]);return`<div class='abc'><i class='${c}' title='${x[1]}' data-tip='${x[1]}'>${ic}</i><b>${x[0]}</b><span>${x[1]}</span></div>`}).join('')}</div>`:`<div class='mut'>Açıklanan eksik yok.</div>`;
const pitchOk=t=>{if(!t||!t.xi||t.xi.length!=11||!t.f)return false;const fm=t.f.split('-').map(Number);return fm.every(x=>x>0)&&fm.reduce((a,b)=>a+b,0)==10};
const rowsOf=t=>{const fm=t.f.split('-').map(Number);let r=[[t.xi[0]]],i=1;fm.forEach(k=>{r.push(t.xi.slice(i,i+k));i+=k});return r};
const twoPitch=(H,A)=>{const[hn,ht]=H,[an,at]=A,hr=rowsOf(ht).map(r=>r.slice().reverse()),ar=rowsOf(at).slice().reverse(),row=(n,r)=>`<div class='pcr'>${r.map(p=>shirtP(n,p)).join('')}</div>`;return`<div class='pch two'><div class='pbx'></div><div class='pbx b'></div><div class='pcl'></div><div class='pcc'></div><div class='ptg t'>${hn} · ${ht.f}</div><div class='ptg b'>${an} · ${at.f}</div>${hr.map(r=>row(hn,r)).join('')}${ar.map(r=>row(an,r)).join('')}</div>`};
const psB=(c,n)=>{const t=PS[c+'|'+n];if(!t||!t.p||!t.p.length)return`<h4>Oyuncu istatistikleri</h4><div class='mut'>Veri yok (henüz eklenmedi).</div>`;const r=t.p.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td>${x[5]}</td></tr>`).join('');return`<details class='psd'><summary><h4 style='display:inline'>Oyuncu istatistikleri (${t.p.length})</h4></summary><div class='mut'>Kaynak: ${t.src}, ${t.at}. Kırmızı kart: ${t.kr||'–'}.</div><div style='overflow-x:auto'><table class='pst'><tr><th>Oyuncu</th><th>Maç</th><th>Dk</th><th>Gol</th><th>Asist</th><th>Sarı</th></tr>${r}</table></div></details>`};
const benchB=b=>b&&b.length?`<div class='bnc'>${b.map(x=>`<span>${x}</span>`).join('')}</div>`:`<div class='mut'>Yedek listesi kaynakta yok.</div>`;
const lineupv=m=>{CURM=m;try{return lineupv0(m)}finally{CURM=null}};
const lineupv0=m=>{const lu=LU[[m.c,m.h,m.a].join('|')],sx=stAll(m,m.h)+stAll(m,m.a);if(!lu)return sx||(window.KMX&&KMX.squadBox&&KMX.squadBox(m))||"<div class='box'><div class='mut'>Kadro verisi yok: bu maç için güvenilir bir kaynakta muhtemel 11 ya da eksik listesi bulunamadı.</div></div>";const H=[m.h,lu.h],A=[m.a,lu.a],two=pitchOk(lu.h)&&pitchOk(lu.a);return`<div class='lvtt'>${lu.t}</div>`+(two?`<div class='box lvt'>${twoPitch(H,A)}</div>`:'')+[H,A].map(([n,t])=>`<div class='box lvt'><div class='lvh'>${bd(n,1)}<b>${n}</b><span>${t&&t.f?t.f:''}</span></div>${two?'':pitch(n,t)}${stSubs(m,n)}<h4>Yedekler</h4>${benchB(t&&t.bn)}<h4>Eksikler</h4>${absB(t&&t.out)}</div>`).join('')};
// Tasarim v2 (masaustu): baslik altinda golculer ve 1-X-2 karti. Telefonda CSS ile gizli.
const dgl=m=>{const v=LVD[[m.c,m.h,m.a].join('|')],ev=((v&&v.ev)||[]).filter(e=>e&&typeof e=='object'&&e.k=='g');if(!ev.length)return'';const yan=sd=>{const g={};ev.filter(e=>e.s==sd).forEach(e=>{(g[e.a||'']=g[e.a||'']||[]).push((+e.m>90?'90+'+(e.m-90):e.m)+"'")});return Object.entries(g).map(([n,x])=>`<div>${n?stE(n):'Golcü verisi yok'} ${x.join(', ')}</div>`).join('')};return`<div class='dgl'><div>${yan('h')}</div><i></i><div>${yan('a')}</div></div>`};
const u3d=(m,a,b,c)=>{const P=[a,b,c],f=P.indexOf(Math.max(a,b,c)),L=[m.h+' kazanır','Beraberlik',m.a+' kazanır'];return`<div class='u3d'><h3>Model olasılığı <small>maç öncesi</small></h3><div class='u3'>${P.map((p,i)=>`<div class='${i==f?'f':''}'><small>${['1','X','2'][i]}</small><b>%${Math.round(p*100)}</b><span>${stE(L[i])}</span><em>adil oran ${p>0?(1/p).toFixed(2):'–'}</em></div>`).join('')}</div><div class='ub'>${P.map((p,i)=>`<i class='${i==f?'f':''}' style='flex:${p.toFixed(3)}'></i>`).join('')}</div><p>Adil oran = 1 ÷ ihtimal; bahis sitesi oranı değildir. Hiçbir bahis risksiz değildir.</p></div>`};
function detail0(m){const s=stt(m),k=pick(m),LL_=LGR.filter(r=>r.mk==[m.c,m.h,m.a].join('|')).map(r=>({k:r.k,p:r.p,o:r.o||1/r.p})).sort((a,b)=>b.p-a.p),IT_=LL_.length?LL_:k.o,[a,b,c]=pa(m),hc=(TC[m.h]||['#4a5a68'])[0],ac=(TC[m.a]||['#4a5a68'])[0],r=x=>Math.round(x*100);
let h=`<div class='dh2' style='background:linear-gradient(100deg,${hc}88,#0b0f14 50%,${ac}88)'><div class='dr'><button class='bk' data-bk='1'>←</button><div class='tm2'>${bd(m.h,1)}<br><span data-tm="${m.h}">${m.h}</span></div><div class='ct'>${s.sc?`<b>${s.sc[0]} - ${s.sc[1]}</b><div>${s.k=='ft'?'Maç sonu · '+(+s.sc[0]>+s.sc[1]?m.h+' kazandı':+s.sc[0]<+s.sc[1]?m.a+' kazandı':'Berabere'):(s.old?'Son skor (maç bitmiş olabilir)':'Canlı')}</div>`:`<b>${hm(m.t)}</b><div>${dd(m.t)}${s.k=='wait'?'':s.k=='on'?' · oynanıyor, skor için Yenile':' · bitti, skor için Yenile'}</div>`}<div>${N[m.c]}</div></div><div class='tm2'>${bd(m.a,1)}<br><span data-tm="${m.a}">${m.a}</span></div></div>${dgl(m)}<div class='dtab'>${[['p','Tahmin'],['k','Kadro'],['i','İstatistik'],['z','Puan'],['m','Maçlar'],['s','Seriler']].map(([i,l])=>`<button data-dt='${i}' class='${dt==i?'on':''}'>${l}</button>`).join('')}</div></div></div>`;
if(dt=='p'&&m.np)h+="<div class='box'><div class='mut'>Bu maç için olasılık verisi henüz yok. Sağlayıcı genellikle maça 1-2 gün kala yayınlıyor; “güncelle” dediğinde eklerim.</div></div>"+lvbox(m);else if(dt=='p')h+=`<div class='box dpb'>${u3d(m,a,b,c)}<div class='bar'><i style='width:${a*100}%;background:var(--acc)'></i><i style='width:${b*100}%;background:var(--mut)'></i><i style='width:${c*100}%;background:var(--warn)'></i></div><div class='mut'>${m.h} %${r(a)} · Beraberlik %${r(b)} · ${m.a} %${r(c)}</div></div>`+lvbox(m)+nwh([m.h,m.a])+"<div class='tbx'>"+(s.k=='ft'&&!LL_.length?"<p class='mut'>Bu maç oynandı. Seçenekler maç öncesi ihtimallerden hesaplandı, ama maçtan önce kaydedilmediği için Geçmiş sekmesine girmez.</p>":'')+(IT_.length?"<h3>Tahminler</h3>"+IT_.map(x=>{const z=LL_.length?pso(m,x):'wait';return pcard(x.p>=.7?'Düşük riskli':'Orta',x.p>=.7?0:1,m,x,(z=='hit'?"<div class='st ok'>✓ Tuttu</div>":z=='miss'?"<div class='st miss'>✗ Tutmadı</div>":z=='live'?"<div class='st mid'>● Oynanıyor</div>":'')+kpBtn(m,x.k))}).join(''):"<p class='mut'>Bu maçta güvenilir düşük oranlı seçenek yok.</p>")+"</div>";
else if(dt=='s')h+=[m.h,m.a].map(n=>{const z=stk(n);return z?`<div class='box'><h3>${n} · son ${z.c} lig maçı</h3>${z.l.map(x=>`<div class='sr'>${bd(n)}<span>${x[0]}</span><b>${x[1]}/${z.c} ✓</b></div>`).join('')||"<div class='mut'>Öne çıkan seri yok.</div>"}</div>`:`<div class='box'><h3>${n}</h3>${(SLG[n]||[]).length?`<div class='tr'>Kayıtlı lig maçları: ${SLG[n].slice(-5).map(r=>`<i class='fi f${r.r}'>${r.r}</i>`).join('')} (${SLG[n].length} maç)</div>`:''}<div class='mut'>Seri çıkarmak için en az 5 lig maçı gerekiyor. Bu ligin sezon sonuçları henüz yüklenmedi; her güncellemede yeni biten maçlar ekleniyor. Hemen doldurmak için lig CSV’si gerekiyor.</div></div>`}).join('')+`<div class='box'><h3>Aralarındaki maçlar</h3>${hstk(m)||"<div class='mut'>Veri yok.</div>"}</div>`;
else if(dt=='m')h+=mtab(m);else if(dt=='z')h+=tbl(m);else if(dt=='i')h+=stStat(m);
else h+=lineupv(m);
return h}
/* ===== KUPON SEKMESİ ===== */
const KALL=['1','X','2','1X','X2','12','HE1','HEX','HD1','HDX','Ü0.5','Ü1.5','Ü2.5','Ü3.5','Ü4.5','A0.5','A1.5','A2.5','A3.5','A4.5','TEK','CIFT','G0-1','G2-3','G4+','EG1','EG2','EG3','EG4','EA0','EA1','EA2','EA3','DG1','DG2','DG3','DG4','DA0','DA1','DA2','DA3','KG Var','KG Yok','KGV+Ü2.5','KGV+A2.5','KGY+Ü2.5','KGY+A2.5','I1','IX','I2','I1X','IX2','I12','IÜ0.5','IA0.5','IÜ1.5','IA1.5','IÜ2.5','IA2.5','IKGV','IKGY','IM:11','IM:1X','IM:12','IM:X1','IM:XX','IM:X2','IM:21','IM:2X','IM:22','J1','JX','J2'];
function khit(k,x,y){let r;if(r=/^Ü(\d)\.5$/.exec(k))return x+y>+r[1];if(r=/^A(\d)\.5$/.exec(k))return x+y<=+r[1];if(r=/^EG(\d)$/.exec(k))return x>=+r[1];if(r=/^EA(\d)$/.exec(k))return x<=+r[1];if(r=/^DG(\d)$/.exec(k))return y>=+r[1];if(r=/^DA(\d)$/.exec(k))return y<=+r[1];if(k=='KG Yok')return!(x>0&&y>0);if(r=/^KG([VY])\+([ÜA])(\d)\.5$/.exec(k)){const kg=x>0&&y>0,ok=r[1]=='V'?kg:!kg,t=x+y;return ok&&(r[2]=='Ü'?t>+r[3]:t<=+r[3])}if(k=='TEK')return(x+y)%2==1;if(k=='CIFT')return(x+y)%2==0;if(r=/^G(\d)-(\d)$/.exec(k))return x+y>=+r[1]&&x+y<=+r[2];if(k=='G4+')return x+y>=4;if(k=='HE1')return x-y>=2;if(k=='HEX')return x-y==1;if(k=='HD1')return y-x>=2;if(k=='HDX')return y-x==1;return false}
const KGC={};
const kgrid=m=>{const id=mkey(m);if(KGC[id])return KGC[id];const g=gmk(m,luf(m)),A=pm(g.lh),B=pm(g.la);let t=0;const P=A.map(x=>B.map(y=>{t+=x*y;return x*y}));return KGC[id]=P.map(r=>r.map(z=>z/t))};
const FHS=.45,KSPC={},KIC={};
const isI=k=>/^(I|J)/.test(k);
const ksp=m=>{const id=mkey(m);if(KSPC[id])return KSPC[id];const g=gmk(m,luf(m)),N=7,pp=l=>{const A=pm(l).slice(0,N),t=A.reduce((a,b)=>a+b,0);return A.map(x=>x/t)},H1=pp(g.lh*FHS),A1=pp(g.la*FHS),H2=pp(g.lh*(1-FHS)),A2=pp(g.la*(1-FHS)),o=[];for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++)for(let d=0;d<N;d++){const p=H1[a]*A1[b]*H2[c]*A2[d];if(p>1e-9)o.push([a,b,c,d,p])}let t=0;o.forEach(s=>t+=s[4]);o.forEach(s=>s[4]/=t);try{const T=pa(m),q=[0,0,0],rs=s=>{const x=s[0]+s[2],y=s[1]+s[3];return x>y?0:x==y?1:2};o.forEach(s=>q[rs(s)]+=s[4]);o.forEach(s=>{const r=rs(s);if(q[r]>0)s[4]*=T[r]/q[r]});let u=0;o.forEach(s=>u+=s[4]);o.forEach(s=>s[4]/=u)}catch(e){}return KSPC[id]=o};
const kxs=(k,s)=>{const[a,b,c,d]=s;if(!isI(k))return hit(k,a+c,b+d);const rs=(x,y)=>x>y?'1':x<y?'2':'X';let r;
if(k=='I1')return a>b;if(k=='IX')return a==b;if(k=='I2')return a<b;if(k=='I1X')return a>=b;if(k=='IX2')return a<=b;if(k=='I12')return a!=b;
if(r=/^I([ÜA])(\d)\.5$/.exec(k)){const t=a+b;return r[1]=='Ü'?t>+r[2]:t<=+r[2]}
if(k=='IKGV')return a>0&&b>0;if(k=='IKGY')return!(a>0&&b>0);
if(r=/^IM:([1X2])([1X2])$/.exec(k))return rs(a,b)==r[1]&&rs(a+c,b+d)==r[2];
if(k=='J1')return c>d;if(k=='JX')return c==d;if(k=='J2')return c<d;return false};
const KS4=(()=>{const o=[];for(let a=0;a<5;a++)for(let b=0;b<5;b++)for(let c=0;c<5;c++)for(let d=0;d<5;d++)o.push([a,b,c,d]);return o})();
const kht=(m,sc)=>{const tot=(+sc[0])+(+sc[1]);if(tot==0)return[0,0];const v=(typeof LVD!='undefined'&&LVD[mkey(m)])||null;if(!v||!Array.isArray(v.ev))return null;const gs=v.ev.filter(e=>e.k=='g');if(gs.length!=tot)return null;if(gs.some(e=>e.m>45&&e.m<=47))return null;let a=0,b=0;gs.forEach(e=>{if(e.m<=45){if(e.s=='h')a++;else b++}});return[a,b]};
const ilab=(k,m)=>{let r;const T=x=>x=='1'?m.h+' önde':x=='2'?m.a+' önde':'berabere',F=x=>x=='1'?m.h+' kazanır':x=='2'?m.a+' kazanır':'beraberlik';
if(k=='I1')return`İlk yarı sonu ${m.h} önde`;if(k=='IX')return'İlk yarı berabere biter';if(k=='I2')return`İlk yarı sonu ${m.a} önde`;
if(k=='I1X')return`İlk yarıda ${m.h} yenilmez`;if(k=='IX2')return`İlk yarıda ${m.a} yenilmez`;if(k=='I12')return'İlk yarı beraberlikle bitmez';
if(r=/^I([ÜA])(\d)\.5$/.exec(k))return r[1]=='Ü'?`İlk yarıda en az ${+r[2]+1} gol (Üst ${r[2]}.5)`:(+r[2]?`İlk yarıda en fazla ${r[2]} gol (Alt ${r[2]}.5)`:'İlk yarıda gol olmaz (Alt 0.5)');
if(k=='IKGV')return'İlk yarıda iki takım da gol atar';if(k=='IKGY')return'İlk yarıda en az bir takım gol atamaz';
if(r=/^IM:([1X2])([1X2])$/.exec(k))return`İlk yarı ${T(r[1])}, maç sonu ${F(r[2])}`;
if(k=='J1')return`İkinci yarıyı ${m.h} kazanır`;if(k=='JX')return'İkinci yarı berabere biter';if(k=='J2')return`İkinci yarıyı ${m.a} kazanır`;return k};
const kfh=m=>{try{const g=gmk(m,luf(m)),e1=g.lh*FHS,e2=g.la*FHS,pr=k=>kprob(m,k)||0,hs=[['1',pr('I1')],['X',pr('IX')],['2',pr('I2')]].sort((x,y)=>y[1]-x[1])[0],nm=hs[0]=='1'?m.h+' önde':hs[0]=='2'?m.a+' önde':'berabere';return`<div class='mut kfhn'>Maçın beklenen golü ${m.h} ${g.lh.toFixed(2)}, ${m.a} ${g.la.toFixed(2)}. Gollerin %45’i ilk yarıda atılıyor varsayılırsa ilk yarı beklentisi ${m.h} ${e1.toFixed(2)}, ${m.a} ${e2.toFixed(2)} olur. Model ilk yarı için en olası sonucu “${nm}” (%${Math.round(hs[1]*100)}) görüyor; ilk yarıda en az 1 gol ihtimali %${Math.round(pr('IÜ0.5')*100)}, iki takımın da gol atma ihtimali %${Math.round(pr('IKGV')*100)}.</div>`}catch(e){return''}};
const kprob=(m,k)=>{if(m.np)return null;try{if(isI(k)){const ck=mkey(m)+'#'+k;if(ck in KIC)return KIC[ck];let v=0;ksp(m).forEach(s=>{if(kxs(k,s))v+=s[4]});return KIC[ck]=v>=.02&&v<=.985?v:null}const[a,b,c]=pa(m),S={'1':a,X:b,'2':c,'1X':a+b,X2:b+c,'12':a+c};let v=S[k];if(v===undefined){v=0;kgrid(m).forEach((r,i)=>r.forEach((z,j)=>{if(hit(k,i,j))v+=z}))}return v>=.02&&v<=.985?v:null}catch(e){return null}};
const kodd=(m,k)=>{const p=kprob(m,k);return p?Math.max(1.01,+EO({o:1/p,k}).toFixed(2)):null};
const labx=(k,m)=>{let r;if(isI(k))return ilab(k,m);if(r=/^Ü(\d)\.5$/.exec(k))return`Maçta en az ${+r[1]+1} gol (Üst ${r[1]}.5)`;if(r=/^A(\d)\.5$/.exec(k))return+r[1]?`Maçta en fazla ${r[1]} gol (Alt ${r[1]}.5)`:'Maçta hiç gol olmaz (Alt 0.5)';if(r=/^EG(\d)$/.exec(k))return`${m.h} en az ${r[1]} gol atar`;if(r=/^EA(\d)$/.exec(k))return+r[1]?`${m.h} en fazla ${r[1]} gol atar`:`${m.h} gol atamaz`;if(r=/^DG(\d)$/.exec(k))return`${m.a} en az ${r[1]} gol atar`;if(r=/^DA(\d)$/.exec(k))return+r[1]?`${m.a} en fazla ${r[1]} gol atar`:`${m.a} gol atamaz`;if(k=='KG Yok')return'En az bir takım gol atamaz (KG Yok)';if(r=/^KG([VY])\+([ÜA])(\d)\.5$/.exec(k))return`${r[1]=='V'?'İki takım da gol atar':'En az bir takım gol atamaz'} ve maçta ${r[2]=='Ü'?'en az '+(+r[3]+1):'en fazla '+r[3]} gol`;if(k=='TEK')return'Toplam gol tek sayı';if(k=='CIFT')return'Toplam gol çift sayı (0 dahil)';if(r=/^G(\d)-(\d)$/.exec(k))return`Maçta toplam ${r[1]}-${r[2]} gol`;if(k=='G4+')return'Maçta 4 veya daha çok gol';if(k=='HE1')return`${m.h} en az 2 farkla kazanır`;if(k=='HEX')return`${m.h} tam 1 farkla kazanır`;if(k=='HD1')return`${m.a} en az 2 farkla kazanır`;if(k=='HDX')return`${m.a} tam 1 farkla kazanır`;return lab(k,m)||k};
let KPD=[],KPS=[],KPX=[],KPST=10,KPDEL=null,KPEC='',KPEN='';
let SOUT=false;try{SOUT=localStorage.getItem('km_out')=='1'}catch(e){}
const kpLoad=()=>{try{if(SOUT)return;const s=JSON.parse(localStorage.getItem('kupon_v1')||'{}');KPD=Array.isArray(s.d)?s.d:[];KPS=Array.isArray(s.s)?s.s:[];if(s.st>0)KPST=s.st;KPEC=s.ec||'';KPEN=s.en||'';KPX=Array.isArray(s.x)?s.x:[];KPTS=s.ts||0}catch(e){}};
const kpBadge=()=>{const e=document.getElementById('kpn');if(!e)return;let n=KPD.length?1:0;try{n+=KPS.filter(s=>kStat(s)=='wait').length}catch(x){n+=KPS.length}e.textContent=n?'Simülatör ('+n+')':'Simülatör'};
let KPTS=0,KPUID=null,KPRT=null,KPDBR=false;
const kpObj=()=>({d:KPD,s:KPS,x:KPX,st:KPST,ec:KPEC,en:KPEN,ts:KPTS});
const kpRem=async()=>{try{if(KPUID||SOUT)return;const u=await claude.use('user'),db=await claude.use('db');if(!u||!db||!u.id)return;const id=await u.id();if(!id)return;try{const pu=localStorage.getItem('kupon_uid');if(pu&&pu!=id){KPD=[];KPS=[];KPX=[];KPTS=0;FAV=new Set();localStorage.removeItem('kupon_v1');localStorage.removeItem('fav')}localStorage.setItem('kupon_uid',id)}catch(e){}KPUID=id;const ref=db.doc('data/users/'+id+'/kupon'),sn=await ref.get();KPDBR=true;if(sn.exists){const r=JSON.parse(JSON.stringify(sn.data()||{})),dbs=Array.isArray(r.s)?r.s:[],dx=Array.isArray(r.x)?r.x:[],nx=[...new Set([...KPX,...dx])],ids=new Set(KPS.map(z=>z.id));KPX=nx;const ns=[...KPS,...dbs.filter(z=>!ids.has(z.id))].filter(z=>!nx.includes(z.id));ns.sort((p,q)=>(q.id||0)-(p.id||0));KPS=ns;if((r.ts||0)>KPTS){KPD=Array.isArray(r.d)?r.d:[];if(r.st>0)KPST=r.st;KPEC=r.ec||'';KPEN=r.en||'';KPTS=r.ts}const same=KPS.length==dbs.length&&KPS.every(z=>dbs.some(q=>q.id==z.id));try{localStorage.setItem('kupon_v1',JSON.stringify(kpObj()))}catch(e){}kpBadge();try{render()}catch(e){}if(!same){KPTS=Math.max(KPTS,Date.now());await ref.set(JSON.parse(JSON.stringify(kpObj())))}return}if(KPS.length||KPD.length){KPTS=KPTS||Date.now();await ref.set(JSON.parse(JSON.stringify(kpObj())))}}catch(e){}};
const kpPush=()=>{clearTimeout(KPRT);KPRT=setTimeout(async()=>{try{if(!KPUID||!KPDBR)return;const db=await claude.use('db');if(db)await db.doc('data/users/'+KPUID+'/kupon').set(JSON.parse(JSON.stringify(kpObj())))}catch(e){}},600)};
const kpSave=()=>{KPTS=Date.now();try{localStorage.setItem('kupon_v1',JSON.stringify(kpObj()))}catch(e){}kpBadge();kpPush()};
kpLoad();setTimeout(kpRem,300);
const mkey=m=>[m.c,m.h,m.a].join('|');
const kmatch=l=>R.find(x=>mkey(x)==l.mk);
const kin=(m,k)=>KPD.some(l=>l.mk==mkey(m)&&l.k==k);
const KSC=(()=>{const g=[];for(let x=0;x<=7;x++)for(let y=0;y<=7;y++)g.push([x,y]);return g})();
const kset=k=>KSC.filter(([x,y])=>hit(k,x,y));
const KCFC={};const kcf=(k1,k2)=>{if(k1==k2)return null;if(isI(k1)||isI(k2)){const ck=k1+'~'+k2;if(ck in KCFC)return KCFC[ck];return KCFC[ck]=kcfI(k1,k2)}return kcf0(k1,k2)};
const kcfI=(k1,k2)=>{const A=KS4.filter(s=>kxs(k1,s)),B=KS4.filter(s=>kxs(k2,s)),bo=A.filter(s=>kxs(k2,s));if(!bo.length)return'ex';if(bo.length==A.length)return'a';if(bo.length==B.length)return'b';return null};
const kcf0=(k1,k2)=>{const A=kset(k1),B=kset(k2),bo=A.filter(a=>B.some(b=>b[0]==a[0]&&b[1]==a[1]));if(!bo.length)return'ex';if(bo.length==A.length)return'a';if(bo.length==B.length)return'b';return null};
const kmsg=(r,a,b,m)=>r=='ex'?`“${labx(a,m)}” ile “${labx(b,m)}” aynı maçta birlikte olamaz. İkisinden yalnızca biri tutabilir, birini seçmelisin.`:r=='a'?`“${labx(a,m)}” tutarsa “${labx(b,m)}” da tutar. İkisini birlikte eklemenin anlamı yok, birini seç.`:`“${labx(b,m)}” tutarsa “${labx(a,m)}” da tutar. İkisini birlikte eklemenin anlamı yok, birini seç.`;
const kcfl=(m,k)=>{for(const l of KPD){if(l.mk!=mkey(m)||l.k==k)continue;const r=kcf(l.k,k);if(r)return kmsg(r,l.k,k,m)}return null};
const kdConf=()=>{const o=[];for(let i=0;i<KPD.length;i++)for(let j=i+1;j<KPD.length;j++){if(KPD[i].mk!=KPD[j].mk)continue;const r=kcf(KPD[i].k,KPD[j].k),m=kmatch(KPD[i]);if(r&&m)o.push(kmsg(r,KPD[i].k,KPD[j].k,m))}return o};
const kToast=(t,ok)=>{try{let e=document.getElementById('kpt');if(!e){e=document.createElement('div');e.id='kpt';document.body.appendChild(e)}e.textContent=t;e.className='show'+(ok==2?' info':ok?' ok':'');clearTimeout(kToast.t);kToast.t=setTimeout(()=>{e.className=''},5500)}catch(x){}};
const TABST={};
const kStat=s=>{const z=s.legs.map(l=>{const m=kmatch(l);return m?pso(m,{k:l.k}):'wait'});return z.some(x=>x=='miss')?'miss':z.every(x=>x=='hit')?'hit':'wait'};
const kpBtn=(m,k,c)=>{if(m.np||stt(m).k=='ft'||!kprob(m,k))return'';const on=kin(m,k),cf=!on&&kcfl(m,k);if(cf)return`<button class='kpa lock' data-ka='${mkey(m)}' data-kk='${k}'>Çakışıyor</button>`;return`<button class='kpa${on?' on':''}' data-ka='${mkey(m)}' data-kk='${k}'>${on?(c?'✓ Kuponda':'✓ Kuponda · çıkar'):(c?'+ Ekle':'+ Kupona ekle')}</button>`};
let KPO={son:1,top:1};
const kc=(m,k,lbl)=>{const p=kprob(m,k);if(!p)return`<span class='kc na'><span class='kcl'>${lbl}</span><b>–</b></span>`;const on=kin(m,k),lk=!on&&kcfl(m,k);return`<button class='kc${on?' on':''}${lk?' lock':''}' data-ka='${mkey(m)}' data-kk='${k}' title='${lk?'Bu seçimle çakışıyor':'İhtimal %'+Math.round(p*100)}'><span class='kcl'>${on?'✓ ':''}${lbl}<small>%${Math.round(p*100)}</small></span><b>${kodd(m,k).toFixed(2)}</b></button>`};
const krow=(m,t,cells,n)=>`<div class='kbt'>${t}</div><div class='kcg' style='--n:${n||cells.length}'>${cells.map(([k,l])=>kc(m,k,l)).join('')}</div>`;
const klines=(m,t,rows)=>`<div class='kbt'>${t}</div>${rows.map(([ln,o,u])=>`<div class='kln'><span class='kll'>${ln}</span>${kc(m,o,'Üst')}${kc(m,u,'Alt')}</div>`).join('')}`;
const kpSecs=m=>[
['son','Maç sonucu',krow(m,'Maç sonucu · 1 = '+m.h+' · 2 = '+m.a,[['1','1'],['X','X'],['2','2']])+krow(m,'Çifte şans',[['1X','1X'],['X2','X2'],['12','12']])+krow(m,'Kazanma farkı · Ev = '+m.h+' · Dep = '+m.a,[['HE1','Ev 2+ farkla'],['HEX','Ev 1 farkla'],['HD1','Dep 2+ farkla'],['HDX','Dep 1 farkla']],2)],
['top','Toplam gol (Alt/Üst)',klines(m,'Maçtaki toplam gol',[['0.5','Ü0.5','A0.5'],['1.5','Ü1.5','A1.5'],['2.5','Ü2.5','A2.5'],['3.5','Ü3.5','A3.5'],['4.5','Ü4.5','A4.5']])+krow(m,'Gol aralığı',[['G0-1','0-1 gol'],['G2-3','2-3 gol'],['G4+','4+ gol']])],
['iy','İlk yarı ve devre/maç sonu',kfh(m)+krow(m,'İlk yarı sonucu · 1 = '+m.h+' · 2 = '+m.a,[['I1','1'],['IX','X'],['I2','2']])+krow(m,'İlk yarı çifte şans',[['I1X','1X'],['IX2','X2'],['I12','12']])+klines(m,'İlk yarı toplam gol',[['0.5','IÜ0.5','IA0.5'],['1.5','IÜ1.5','IA1.5'],['2.5','IÜ2.5','IA2.5']])+krow(m,'İlk yarı iki takım da gol atar',[['IKGV','Var'],['IKGY','Yok']])+krow(m,'İlk yarı / maç sonu',[['IM:11','1/1'],['IM:1X','1/X'],['IM:12','1/2'],['IM:X1','X/1'],['IM:XX','X/X'],['IM:X2','X/2'],['IM:21','2/1'],['IM:2X','2/X'],['IM:22','2/2']],3)+krow(m,'İkinci yarı sonucu',[['J1','1'],['JX','X'],['J2','2']])],
['ev',m.h+' golleri',klines(m,m.h+' kaç gol atar',[['0.5','EG1','EA0'],['1.5','EG2','EA1'],['2.5','EG3','EA2'],['3.5','EG4','EA3']])],
['dep',m.a+' golleri',klines(m,m.a+' kaç gol atar',[['0.5','DG1','DA0'],['1.5','DG2','DA1'],['2.5','DG3','DA2'],['3.5','DG4','DA3']])],
['kg','İki takım da gol atar',krow(m,'KG',[['KG Var','Var'],['KG Yok','Yok']])+krow(m,'KG ve 2.5 Alt/Üst',[['KGV+Ü2.5','Var + Üst'],['KGV+A2.5','Var + Alt'],['KGY+Ü2.5','Yok + Üst'],['KGY+A2.5','Yok + Alt']],2)]];
const kpBox=m=>{if(m.np||stt(m).k=='ft')return'';const g=kpSecs(m).map(([id,nm,body])=>{const n=KALL.filter(k=>kin(m,k)&&body.includes("data-kk='"+k+"'")).length,op=KPO[id];return`<div class='kgr'><button class='kgh' data-kgrp='${id}'><b>${nm}</b><span>${n?`<em>${n} seçili</em>`:''}<i class='kch${op?' op':''}'>›</i></span></button>${op?`<div class='kgb'>${body}</div>`:''}</div>`}).join('');return`<div class='box'><h3>Simülatöre ekle</h3><div class='mut'>Simülatör, seçtiğin maçlardan sanal bir kupon kurup hepsinin tutma ihtimalini ve en zayıf seçimi hesaplar; bahis yaptırmaz. Hücreye dokun, seçim simülatöre eklensin; analizi Simülatör sekmesinde gör. Oranlar modelden türetilmiş tahmindir (ilk yarı marketleri varsayımla hesaplanır).</div>${g}${KPD.length?`<button class='kpb' data-kgo='1'>Kuponuma git (${KPD.length} seçim)</button>`:''}</div>`};
const ksw=(l,i)=>{const m=kmatch(l);if(!m)return'';return`<select class='kpsw' data-ksw='${i}' aria-label='Seçimi değiştir'>${KALL.filter(k=>kprob(m,k)||k==l.k).map(k=>`<option value='${k}'${k==l.k?' selected':''}>${labx(k,m)} · %${Math.round((kprob(m,k)||l.p)*100)} · ${(kodd(m,k)||l.od).toFixed(2)}</option>`).join('')}</select>`};
const kLeg=(l,x,i,st)=>{const m=kmatch(l),tx=m?labx(l.k,m):l.k;return`<div class='kpg'><div class='kpm' data-kopen='${l.mk}'>${m?bd(m.h)+' '+bd(m.a):''}<div><b>${tx}</b><small>${m?m.h+' – '+m.a+' · '+dd(m.t)+' '+hm(m.t):l.mk}</small></div></div><div class='kpx'>${st?`<span class='st ${st=='hit'?'ok':st=='miss'?'miss':'mid'}'>${st=='hit'?'✓ Tuttu':st=='miss'?'✗ Tutmadı':st=='live'?'● Oynanıyor':st=='unk'?'? İlk yarı verisi yok':'Bekliyor'}</span>`:`<button class='kpd' data-krm='${i}' aria-label='Çıkar'>✕</button>`}<span class='kpo'>${st?(+l.od).toFixed(2):`<input type='number' step='0.01' min='1.01' value='${(+l.od).toFixed(2)}' data-kod='${i}' aria-label='Oran'>`}<small>%${Math.round(l.p*100)}</small></span></div>${st?'':ksw(l,i)}</div>`};
const kgrp=ls=>{const o=[],mp={};ls.forEach((l,i)=>{if(!mp[l.mk]){mp[l.mk]={mk:l.mk,it:[]};o.push(mp[l.mk])}mp[l.mk].it.push([l,i])});return o};
const kjp=g=>{if(g.it.length==1)return g.it[0][0].p;const m=kmatch(g.it[0][0]);if(!m)return g.it.reduce((a,[l])=>a*l.p,1);if(g.it.some(([l])=>isI(l.k))){let w=0;ksp(m).forEach(s=>{if(g.it.every(([l])=>kxs(l.k,s)))w+=s[4]});return w}let v=0;kgrid(m).forEach((r,i)=>r.forEach((z,j)=>{if(g.it.every(([l])=>hit(l.k,i,j)))v+=z}));return v};
const kFm=n=>{n=+n;if(!isFinite(n))return'0,00';const f=Math.abs(n).toFixed(2),[i,d]=f.split('.');return(n<0?'-':'')+i.replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+d};
const kgo=g=>{const prod=g.it.reduce((a,[l])=>a*(+l.od||1),1);if(g.it.length==1)return +g.it[0][0].od||1;const m=kmatch(g.it[0][0]),pj=kjp(g);if(!m||!(pj>0))return prod;let r=1,mx=1;g.it.forEach(([l])=>{const b=kodd(m,l.k);if(b){mx=Math.max(mx,b);if(+l.od>0)r*=(+l.od/b)}});return Math.max(1.01,+(Math.max(0.88/pj,mx)*r).toFixed(2))};
const kpTot=ls=>({od:kgrp(ls).reduce((a,g)=>a*kgo(g),1),p:kgrp(ls).reduce((a,g)=>a*kjp(g),1)});
const kRow=(l,i,st)=>{const m=kmatch(l);return`<div class='kpg'><div class='kpm2'><b>${m?labx(l.k,m):l.k}</b><small>İhtimal %${Math.round(l.p*100)}</small></div><div class='kpx'>${st?`<span class='st ${st=='hit'?'ok':st=='miss'?'miss':'mid'}'>${st=='hit'?'✓ Tuttu':st=='miss'?'✗ Tutmadı':st=='live'?'● Oynanıyor':st=='unk'?'? İlk yarı verisi yok':'Bekliyor'}</span><span class='kpo'>${(+l.od).toFixed(2)}</span>`:`<span class='kpo'><input type='number' step='0.01' min='1.01' value='${(+l.od).toFixed(2)}' data-kod='${i}' aria-label='Oran'></span><button class='kpd' data-krm='${i}' aria-label='Çıkar'>✕</button>`}</div></div>`};
const kBlocks=(ls,sts)=>kgrp(ls).map(g=>{const m=kmatch(g.it[0][0]),od=kgo(g),p=kjp(g);return`<div class='kgm'><div class='kgh2' data-kopen='${g.mk}'>${m?bd(m.h)+' '+bd(m.a):''}<div><b>${m?m.h+' – '+m.a:g.mk}</b><small>${m?dd(m.t)+' '+hm(m.t)+' · '+(N[m.c]||m.c)+(sts&&stt(m).sc?' · Maç sonu '+stt(m).sc.join('-'):''):''}</small></div></div><div class='kgl'>${g.it.map(([l,i])=>kRow(l,i,sts?sts[i]:null)).join('')}</div>${g.it.length>1?`<div class='kgf' data-kgf='${g.mk}'><span>Bu maçtaki ${g.it.length} seçimin ortak oranı <b class='kgo'>${od.toFixed(2)}</b></span><span>Bu ${g.it.length} seçimin birlikte tutma ihtimali <b>%${Math.round(p*100)}</b></span></div><div class='mut kgn'>Aynı maçtaki seçimler birbirine bağlı olduğu için ortak oran, birlikte tutma ihtimalinden hesaplanır (oranların çarpımı değildir). Sitede gerçek oran farklı olabilir.</div>`:''}</div>`}).join('');
const KPOPEN=new Set();
const kSlipD=(s,pg)=>{const sts=s.legs.map(l=>{const m=kmatch(l);return m?pso(m,{k:l.k}):'wait'}),all=sts.every(z=>z=='hit'),any=sts.some(z=>z=='miss'),t=kpTot(s.legs),hn=sts.filter(z=>z=='hit').length,stl=all?'Tuttu':any?'Tutmadı':'Bekliyor',cl=all?'ok':any?'miss':'mid',pr=hn&&!all?` (${hn}/${sts.length})`:'',dots=sts.map(z=>`<i class='kd ${z=='hit'?'ok':z=='miss'?'miss':'mid'}'></i>`).join(''),key=(pg?'h':'s')+s.id,btn=pg?`<button class='kpb2' data-kgo='1'>Simülatörde aç</button><button class='kpb2' data-khome='${s.id}'>Ana sayfadan kaldır</button>`:`<button class='kpb2 shr' data-kshare='${s.id}'>${KPSH==s.id?'Paylaşımı kapat':'Paylaş'}</button><button class='kpb2 ${s.home?'hm':''}' data-khome='${s.id}'>${s.home?'✓ Ana sayfada':'Ana sayfaya ekle'}</button><button class='kpb2' data-kedit='${s.id}'>Düzenle</button><button class='kpb2 del' data-kdel='${s.id}'>${KPDEL==s.id?'Emin misin? Sil':'Sil'}</button>`;return`<details class='box kps kpd ${cl}' data-kdt='${key}' ${KPOPEN.has(key)?'open':''}><summary class='kpsum'><div class='kph'><b>${s.name||'Kupon'}</b><span class='st ${cl}'>${all?'✓ ':any?'✗ ':''}${stl}${pr}</span></div><div class='kmeta'><span class='kdots'>${dots}</span><span class='mut'>Oran <b>${t.od.toFixed(2)}</b> · Getiri <b>${kFm(s.stake*t.od)}</b></span></div></summary><div class='mut' style='margin-top:8px'>Miktar ${kFm(s.stake)} · ${s.legs.length} seçim</div>${s.code?`<div class='kcode'>Kupon kodu <b>${s.code}</b>${pg?'':`<button class='kshb' data-sh='cod' data-shid='${s.id}'>Kodu kopyala</button>`}</div>`:''}${kBlocks(s.legs,sts)}<div class='kpf'>${btn}</div>${!pg&&KPSH==s.id?kShPanel(s):''}</details>`};
const kslip=s=>kSlipD(s,false);
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.kdt){d.open?KPOPEN.add(d.dataset.kdt):KPOPEN.delete(d.dataset.kdt)}},true);
(()=>{const st=document.createElement('style');st.textContent=`.kpd{padding:10px 12px;margin-top:8px}.kpd>summary.kpsum{list-style:none;cursor:pointer;position:relative;padding-right:18px}.kpd>summary.kpsum::-webkit-details-marker{display:none}.kpd>summary.kpsum::after{content:'▾';position:absolute;right:0;top:2px;color:var(--mut)}.kpd[open]>summary.kpsum::after{content:'▴'}.kmeta{display:flex;align-items:center;gap:10px;margin-top:6px;font-size:12px;flex-wrap:wrap}.kdots{display:flex;gap:5px}.kd{display:inline-block;width:12px;height:12px;border-radius:50%}.kd.ok{background:#3ecf8e}.kd.miss{background:#f0706a}.kd.mid{background:#f5a524}.betw .kpd{background:color-mix(in srgb,#3ecf8e 14%,var(--sf));border-color:#3ecf8e}.betw .kpd.miss{border-color:var(--hot)}.betlbl{font:700 13px var(--n);margin:10px 0 0;color:var(--mut)}`;document.head.appendChild(st)})();

let KPSH=null,KPIMP=null,KPIERR='';
const KLINK=location.origin+location.pathname;
const kEnc=s=>{try{const j=JSON.stringify({n:(s.name||'').slice(0,40),s:+s.stake||0,l:s.legs.map(l=>[l.mk,l.k,+(+l.od).toFixed(2)])});return btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch(e){return''}};
const kDec=c=>{try{c=String(c||'').trim().replace(/^.*kupon=/,'').replace(/[^A-Za-z0-9_\-]/g,'');if(!c)return null;c=c.replace(/-/g,'+').replace(/_/g,'/');while(c.length%4)c+='=';const o=JSON.parse(decodeURIComponent(escape(atob(c))));if(!o||!Array.isArray(o.l)||!o.l.length||o.l.length>40)return null;const legs=o.l.map(([mk,k,od])=>{const m=R.find(x=>mkey(x)==mk),p=m&&kprob(m,k);return{mk:String(mk),k:String(k),od:+od>=1.01?+od:(m&&kodd(m,k))||1.01,p:p?+p.toFixed(4):0,t:m?+m.t:0}});return{name:String(o.n||'').slice(0,40),stake:+o.s>=0?+o.s:10,legs}}catch(e){return null}};
const kFromObj=o=>{if(!o||!Array.isArray(o.l)||!o.l.length||o.l.length>40)return null;const legs=o.l.map(([mk,k,od])=>{const m=R.find(x=>mkey(x)==mk),p=m&&kprob(m,k);return{mk:String(mk),k:String(k),od:+od>=1.01?+od:(m&&kodd(m,k))||1.01,p:p?+p.toFixed(4):0,t:m?+m.t:0}});return{name:String(o.n||'').slice(0,40),stake:+o.s>=0?+o.s:10,legs}};
const kDb=async()=>{try{return await claude.use('db')}catch(e){return null}};
const kRnd=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,6).join('')};
const kDoc=s=>({n:s.name||'',s:+s.stake||0,l:s.legs.map(l=>[l.mk,l.k,+(+l.od).toFixed(2)]),at:Date.now()});
const KPPUB=new Set();
async function kPublish(s){try{const db=await kDb();if(!db)return;if(s.code){await db.doc('kupon/'+s.code).set(kDoc(s));return}for(let i=0;i<6;i++){const c=kRnd(),d=db.doc('kupon/'+c),sn=await d.get();if(sn.exists)continue;await d.set(kDoc(s));s.code=c;kpSave();if(tab=='c')render();return}}catch(e){}}
async function kUnpub(s){try{if(!s||!s.code)return;const db=await kDb();if(db)await db.doc('kupon/'+s.code).delete()}catch(e){}}
async function kFetch(c){try{const db=await kDb();if(!db)return null;const sn=await db.doc('kupon/'+c).get();return sn.exists?kFromObj(sn.data()):null}catch(e){return null}}
const kLink=s=>KLINK+'#kupon='+kEnc(s);
const kTxt=s=>{const t=kpTot(s.legs),g=kgrp(s.legs);return 'Kupon Masası simülasyonum'+(s.name?' – '+s.name:'')+(s.code?' · Kupon kodu: '+s.code:'')+'\n'+g.map(x=>{const m=kmatch(x.it[0][0]);return '• '+(m?m.h+' – '+m.a:x.mk)+': '+x.it.map(([l])=>(m?labx(l.k,m):l.k)+' ('+(+l.od).toFixed(2)+')').join(', ')}).join('\n')+'\nToplam tahmini oran: '+t.od.toFixed(2)+' · Hepsinin tutma ihtimali: %'+Math.round(t.p*100)+'\n(Bu bir simülasyondur, bahis tavsiyesi değildir. Oranlar tahmindir.)'};
const kShPanel=s=>{const tx=kTxt(s),lk=kLink(s),all=encodeURIComponent(tx+'\n'+lk);return`<div class='kshp'><div class='mut'>Kuponunu arkadaşlarınla paylaş. Bağlantıyı açan kişi kuponunu görür ve kendi simülatörüne ekleyebilir. Uygulamayı açabilmesi için sayfaya erişimi olması gerekir.</div><div class='kshg'><a class='kshb' target='_blank' rel='noopener' href='https://wa.me/?text=${all}'><svg class='shi' viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5z'/></svg>WhatsApp</a><a class='kshb' target='_blank' rel='noopener' href='https://t.me/share/url?url=${encodeURIComponent(lk)}&text=${encodeURIComponent(tx)}'><svg class='shi' viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M21 4 3 11l6 2.5L11.5 20l3-4.5L19 19z'/><path d='m9 13.5 12-9.5'/></svg>Telegram</a><a class='kshb' target='_blank' rel='noopener' href='https://twitter.com/intent/tweet?text=${encodeURIComponent(tx.slice(0,220))}&url=${encodeURIComponent(lk)}'><svg class='shi' viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M5 5l14 14M19 5 5 19'/></svg>X</a><a class='kshb' target='_blank' rel='noopener' href='https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lk)}&quote=${encodeURIComponent(tx.slice(0,200))}'><svg class='shi' viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z'/></svg>Facebook</a><a class='kshb' target='_blank' rel='noopener' href='https://www.reddit.com/submit?url=${encodeURIComponent(lk)}&title=${encodeURIComponent('Kupon Masası simülasyonum'+(s.name?' – '+s.name:''))}'><svg class='shi' viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='12' cy='13' r='7'/><circle cx='9.5' cy='12.5' r='.8'/><circle cx='14.5' cy='12.5' r='.8'/><path d='M9.5 15.5c1.5 1 3.5 1 5 0M12 6l1-3 4 1'/></svg>Reddit</a><button class='kshb' data-sh='lnk' data-shid='${s.id}'><svg class='shi' viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1'/><path d='M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'/></svg>Bağlantıyı kopyala</button></div></div>`};
const kImpHtml=()=>{let h=`<div class='box'><h3>Arkadaşımın kuponu</h3><div class='mut'>Arkadaşının sana gönderdiği 6 harfli kupon kodunu (ya da bağlantıyı) buraya yapıştır.</div><div class='kimp'><input type='text' id='kimpc' placeholder='Kupon kodu, ör. KMBTRS' inputmode='text' aria-label='Kupon kodu'><button class='kpb2' data-kimp='1'>Aç</button></div>${KPIERR?`<div class='kpw'>${KPIERR}</div>`:''}</div>`;if(KPIMP){const t=kpTot(KPIMP.legs),sts=KPIMP.legs.map(l=>{const m=kmatch(l);return m?pso(m,{k:l.k}):'wait'});h+=`<div class='box kps mid'><div class='kph'><b>Paylaşılan kupon${KPIMP.name?' · '+KPIMP.name:''}</b></div><div class='mut'>Toplam tahmini oran ${t.od.toFixed(2)} · hepsinin tutma ihtimali %${Math.round(t.p*100)}</div>${kBlocks(KPIMP.legs,sts)}<div class='kpf'><button class='kpb' data-kimadd='1'>Simülatörüme ekle</button><button class='kpb2' data-kimx='1'>Kapat</button></div></div>`}return h};
const kCopy=(t,msg,btn)=>{const ok=()=>{try{if(btn&&btn.isConnected){const o=btn.dataset.o||btn.textContent;btn.dataset.o=o;btn.textContent='Kopyalandı';btn.classList.add('cpd');clearTimeout(btn._t);btn._t=setTimeout(()=>{btn.textContent=o;btn.classList.remove('cpd')},1800)}}catch(e){}},fb=()=>{try{const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok()}catch(e){kToast('Kopyalanamadı. Metni elle seçip kopyalayabilirsin.')}};try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-kshare],[data-sh],[data-kimp],[data-kimadd],[data-kimx]');if(!t)return;e.stopPropagation();e.preventDefault();const ds=t.dataset;
if(ds.kshare){KPSH=KPSH==+ds.kshare?null:+ds.kshare;render();return}
if(ds.sh){const s=KPS.find(z=>z.id==+ds.shid);if(!s)return;if(ds.sh=='lnk')kCopy(kLink(s),'',t);else if(ds.sh=='txt')kCopy(kTxt(s)+'\n'+kLink(s),'',t);else if(ds.sh=='cod')kCopy(s.code||kEnc(s),'',t);else if(ds.sh=='nat'){try{navigator.share({title:'Kupon Masası',text:kTxt(s),url:kLink(s)}).catch(()=>{})}catch(x){}}return}
if(ds.kimp){const v=((document.getElementById('kimpc')||{}).value||'').trim(),dg=v.replace(/\s|-/g,'');if(/^(\d{6}|[A-Za-z]{6})$/.test(dg)){KPIERR='Kupon aranıyor…';render();kFetch(dg.toUpperCase()).then(o=>{if(o){KPIMP=o;KPIERR=''}else{KPIMP=null;KPIERR='Bu kodla bir kupon bulunamadı. Kodu doğru yazdığından ve sayfaya erişimin olduğundan emin ol.'}render()});return}const o=kDec(v);if(o){KPIMP=o;KPIERR=''}else{KPIMP=null;KPIERR='Bu kod okunamadı. 6 harfli kodu ya da bağlantıyı eksiksiz yapıştır.'}render();return}
if(ds.kimx){KPIMP=null;KPIERR='';render();return}
if(ds.kimadd){if(!KPIMP)return;let ad=0,sk=0;KPIMP.legs.forEach(q=>{const m=R.find(x=>mkey(x)==q.mk),p=m&&kprob(m,q.k);if(!m||!p||stt(m).k=='ft'||kin(m,q.k)||kcfl(m,q.k)){sk++;return}KPD.push({mk:q.mk,k:q.k,p:+p.toFixed(4),od:q.od,t:+m.t});ad++});KPIMP=null;kpSave();render();kToast(ad+' seçim taslağa eklendi'+(sk?', '+sk+' tanesi (biten, çakışan ya da bulunamayan maç) eklenemedi':'')+'.',1);return}},true);
(()=>{const st=document.createElement('style');st.textContent=`.kshp{margin-top:10px;padding-top:10px;border-top:1px dashed var(--ln)}.kshg{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.kshb{padding:9px 12px;border-radius:10px;border:1px solid var(--ln);background:transparent;color:var(--ink);font:600 13px var(--f);cursor:pointer;text-decoration:none}.kshb:hover{border-color:var(--acc)}.kshb{display:inline-flex;align-items:center;gap:7px}.shi{flex:0 0 auto}.kimp{display:flex;gap:8px;margin-top:8px}.kimp input{flex:1;min-width:0;padding:10px;border-radius:10px;border:1px solid var(--ln);background:transparent;color:var(--ink);font:14px var(--f)}.kimp .kpb2{flex:0 0 auto;padding:10px 16px}.kpb2.shr{border-color:var(--acc);color:var(--acc)}.kcode{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0 2px;font-size:13px;color:var(--mut)}.kshb.cpd{background:var(--acc);border-color:var(--acc);color:var(--bg)}.kcode b{font:700 18px var(--f);letter-spacing:.08em;color:var(--ink)}`;(document.head||document.body||document.documentElement).appendChild(st)})();

const kTargets=mk=>{try{return KPS.filter(s=>s.legs.some(l=>l.mk==mk)&&kStat(s)=='wait').slice(0,4)}catch(e){return[]}};
window.addEventListener('error',ev=>{try{kToast('Hata: '+(ev.message||'bilinmeyen'))}catch(x){}});
const kAskHome=id=>{try{const sl=KPS.find(z=>z.id==id);if(!sl)return;let e=document.getElementById('kpq');if(e)e.remove();e=document.createElement('div');e.id='kpq';e.innerHTML=`<div class='kpqb' role='dialog' aria-modal='true'><b>Maçlar sayfasına eklensin mi?</b><p>${sl.name?'“'+sl.name+'” kuponu':'Kuponun'} ilgili günün Maçlar sayfasında “Simülasyon kuponlarım” kutusunda görünür; seçimlerinin tutup tutmadığını oradan takip edebilirsin.</p><button class='kpb' data-kh='1'>Evet, ekle</button><button class='kpb2' data-kh='0'>Hayır, sadece simülatörde kalsın</button></div>`;e.addEventListener('click',ev=>{const t=ev.target.closest('[data-kh]');if(!t&&ev.target!==e)return;e.remove();if(t&&t.dataset.kh=='1'){sl.home=true;kpSave();render();kToast('Maçlar sayfasına eklendi.',1)}});document.body.appendChild(e)}catch(x){}};
const kAsk=(mk,k,tg)=>{try{const m=R.find(x=>mkey(x)==mk);if(!m)return;let e=document.getElementById('kpq');if(e)e.remove();e=document.createElement('div');e.id='kpq';e.innerHTML=`<div class='kpqb' role='dialog' aria-modal='true'><b>Bu maç zaten kuponunda var</b><p>${m.h} – ${m.a} maçı ${tg.length>1?'kayıtlı kuponlarında':'“'+(tg[0].name||'Kupon')+'” kuponunda'} yer alıyor. “${labx(k,m)}” seçimini nereye ekleyelim?</p>${tg.map(s=>`<button class='kpb' data-kqs='${s.id}'>${tg.length>1||!s.name?(s.name||'Kupon')+' kuponuna ekle':'“'+s.name+'” kuponuna ekle'}</button>`).join('')}<button class='kpb2' data-kqn='1'>Ayrı yeni kupon olsun</button><button class='kpb2' data-kqc='1'>Vazgeç</button></div>`;e.addEventListener('click',ev=>{const t=ev.target.closest('[data-kqs],[data-kqn],[data-kqc]');if(!t&&ev.target!==e)return;const d=t?t.dataset:{kqc:1};e.remove();if(d.kqs){const sl=KPS.find(z=>z.id==+d.kqs);if(!sl)return;if(sl.legs.some(l=>l.mk==mk&&l.k==k)){kToast('Bu seçim zaten bu kuponda var.');return}for(const l of sl.legs){if(l.mk!=mk)continue;const r=kcf(l.k,k);if(r){kToast(kmsg(r,l.k,k,m));return}}const p=kprob(m,k);if(!p)return;sl.legs.push({mk,k,p:+p.toFixed(4),od:kodd(m,k),t:+m.t});kpSave();kPublish(sl);render();kToast('“'+labx(k,m)+'” '+(sl.name?'“'+sl.name+'”':'kayıtlı')+' kuponuna eklendi.',1)}else if(d.kqn){const p=kprob(m,k);if(p){KPD.push({mk,k,p:+p.toFixed(4),od:kodd(m,k),t:+m.t});kpSave();render();kToast('Yeni kupon taslağına eklendi.',1)}}});document.body.appendChild(e)}catch(x){}};
(()=>{const st=document.createElement('style');st.textContent=`#kpq{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}.kpqb{background:var(--bg);color:var(--ink);border:1px solid var(--ln);border-radius:16px;padding:18px;max-width:380px;width:100%;display:flex;flex-direction:column;gap:10px}.kpqb p{margin:0;font-size:14px;color:var(--mut)}.kpqb b{font-size:16px}`;(document.head||document.body||document.documentElement).appendChild(st)})();
function kupView(){$('#app').innerHTML=kupHtml();kpBadge();KPS.filter(s=>!s.code&&!KPPUB.has(s.id)).forEach(s=>{KPPUB.add(s.id);kPublish(s)})}
function kupHtml(){const t=kpTot(KPD),dup=new Set(KPD.map(l=>l.mk)).size<KPD.length;let h=`<h3>Kupon simülasyonu</h3><div class='mut'>Burası bir kupon yapma ya da bahis oynama yeri değil, bir simülasyon. Beğendiğin seçimleri buraya ekleyip yaklaşık oranı ve hepsinin birlikte tutma ihtimalini görebilir, sonra kendi bahis sitende kolayca bulup inceleyebilirsin. Oranlar tahmindir; ülkeye ve bahis sitesine göre değişir, sitende gördüğün oran buradakinden farklı olabilir. Oran kutusuna kendi sitendeki oranı yazarak hesabı güncelleyebilirsin. Hiçbir bahis risksiz değildir.</div>`;
if(!KPD.length){if(!KPS.length)h+=`<div class='box'><div class='mut'>Taslak simülasyon boş. Maçlar sekmesinden bir maça gir, “Kupona ekle”ye bas. Kaydettikten sonra buradan yeni bir kupon başlatabilirsin; her kupon ayrı kaydedilir.</div></div>`}
else h+=`<div class='box'><h3>Taslak simülasyon</h3>${kBlocks(KPD,null)}<div class='kps2'><label>Yatırılacak miktar<input type='number' step='1' min='0' value='${KPST}' data-kst='1'></label><label>Kupon adı<input type='text' maxlength='40' placeholder='ör. Sabah serisi' id='kpname' value='${(KPEN||'').replace(/'/g,'&#39;')}'></label></div><div class='kpt'><div><small>Toplam tahmini oran</small><b id='kpod'>${t.od.toFixed(2)}</b></div><div><small>Tahmini getiri</small><b id='kpget'>${kFm(KPST*t.od)}</b></div><div><small>Hepsinin tutma ihtimali</small><b>%${(t.p*100).toFixed(0)}</b></div></div><div class='mut'>Tahmini oran ve getiri, bahis sitende gördüğünden farklı olabilir; oranlar ülkeye ve siteye göre değişir.</div><div class='mut'>Farklı maçlar birbirinden bağımsız varsayılır; aynı maçtaki seçimlerin ihtimali birlikte hesaplanır.</div>${kdConf().map(z=>`<div class='kpw'>⚠ ${z}</div>`).join('')}<div class='kpf'><button class='kpb${kdConf().length?' off':''}' data-ksave='1'>Simülasyonu kaydet</button><button class='kpb2' data-kclr='1'>Taslağı temizle</button></div></div>`;
const days=[...new Set(KPS.map(s=>s.day))].sort().reverse();
h+=`<h3>Kayıtlı simülasyonlarım</h3>`+(days.length?days.map(d=>`<h4 class='kpday'>${dd(new Date(d+'T12:00:00'))}</h4>`+KPS.filter(s=>s.day==d).map(kslip).join('')).join(''):`<div class='box'><div class='mut'>Henüz kayıtlı kupon yok.</div></div>`);
h+=kImpHtml();
return h}
(()=>{const st=document.createElement('style');st.textContent=`.kgl{border-left:3px solid var(--acc);margin:4px 0 6px 8px;padding-left:12px}.kgl .kpg{border-top:0;padding:6px 0}.kgm{border:1px solid var(--ln);border-radius:12px;padding:6px 10px;margin-top:10px}.kgh2{display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:14px}.kgh2 small,.kpm2 small{display:block;color:var(--mut);font-size:12px;font-weight:400}.kpm2{flex:1;min-width:0;font-size:14px}.kgf{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:8px 0 2px;border-top:1px dashed var(--ln);font-size:13px;color:var(--mut)}.kgf b{color:var(--ink);font-size:15px}.kgn{font-size:11px!important;padding-bottom:4px}.kbt{font:600 12px var(--f);color:var(--mut);margin:12px 0 6px;text-transform:uppercase;letter-spacing:.04em}.kgb{padding-bottom:6px}.kcg{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:6px}.kc{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid var(--ln);background:color-mix(in srgb,var(--ink) 5%,transparent);color:var(--ink);font:600 14px var(--f);cursor:pointer;min-width:0;text-align:left}.kc b{font-size:15px;color:var(--acc)}.kc .kcl{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kc small{display:block;font-size:11px;font-weight:400;color:var(--mut)}.kc.on{background:var(--acc);border-color:var(--acc);color:var(--bg)}.kc.on b,.kc.on small{color:var(--bg)}.kc.lock{border-color:var(--hot);opacity:.55}.kc.na{opacity:.35;cursor:default}.kln{display:grid;grid-template-columns:34px minmax(0,1fr) minmax(0,1fr);gap:6px;align-items:center;margin-top:6px}.kll{font:700 14px var(--f);color:var(--mut);text-align:center}.kpg{flex-wrap:wrap}.kpsw{flex-basis:100%;width:100%;margin-top:4px;padding:7px 8px;border-radius:8px;border:1px solid var(--ln);background:var(--sf);color:var(--ink);font:500 13px var(--f)}.kgr{border-top:1px solid var(--ln);margin-top:8px}.kgh{width:100%;display:flex;justify-content:space-between;align-items:center;padding:12px 2px;border:0;background:transparent;color:var(--ink);font:700 16px var(--f);cursor:pointer}.kgh span{display:flex;align-items:center;gap:10px}.kgh em{font:600 12px var(--f);font-style:normal;color:var(--acc);background:color-mix(in srgb,var(--acc) 14%,transparent);padding:3px 8px;border-radius:999px}.kch{font-style:normal;font-size:22px;color:var(--mut);transition:transform .15s;display:inline-block}.kch.op{transform:rotate(90deg)}.kpn2{display:flex;gap:12px}.kpn2 span{text-align:center;min-width:44px}.kpn2 small{display:block;font-size:11px;color:var(--mut);font-weight:400}.kpn2 b{font-size:15px}.kpr .kpl{flex:1;min-width:0}.kpr .kpa{padding:7px 10px;font-size:13px}#kpt.ok{background:var(--ok)}#kpt.info{background:var(--acc);color:var(--bg)}.kps.ok{border-color:var(--ok)}.kps.miss{border-color:var(--hot)}#kpt{position:fixed;left:12px;right:12px;bottom:120px;max-width:560px;margin:0 auto;z-index:60;background:var(--hot);color:#fff;padding:12px 14px;border-radius:12px;font:600 14px var(--f);opacity:0;pointer-events:none;transition:opacity .2s}#kpt.show{opacity:1}.kpa.lock{border-color:var(--hot);color:var(--hot);opacity:.8}.kpb.off{opacity:.45}.kpw{margin-top:8px;padding:8px 10px;border-radius:10px;border:1px solid var(--hot);color:var(--hot);font-size:13px;font-weight:600}.kpa{margin:8px 0 0;font:600 14px var(--f);padding:7px 12px;border-radius:999px;border:1px solid var(--acc);background:transparent;color:var(--acc);cursor:pointer}.kpa.on{background:var(--acc);color:var(--bg)}.kpr{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid var(--ln)}.kpr .kpa{margin:0;white-space:nowrap}.kpl{font-size:15px}.kpl small,.kpm small,.kpo small{display:block;color:var(--mut);font-size:12px;font-weight:400}.kpb{width:100%;margin-top:10px;padding:12px;border-radius:12px;border:0;background:var(--acc);color:var(--bg);font:700 16px var(--f);cursor:pointer}.kpb2.hm{background:var(--acc);color:var(--bg);border-color:var(--acc)}
.kpb2{flex:1;padding:10px;border-radius:12px;border:1px solid var(--ln);background:transparent;color:var(--ink);font:600 14px var(--f);cursor:pointer}.kpb2.del{color:var(--hot);border-color:var(--hot)}.kpf{display:flex;gap:8px;margin-top:10px}.kpf .kpb{margin:0;flex:2}.kpg{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid var(--ln)}.kpm{display:flex;align-items:center;gap:8px;flex:1;min-width:0;cursor:pointer;font-size:14px}.kpm>div{min-width:0}.kpx{display:flex;align-items:center;gap:8px}.kpo{text-align:right;font-weight:700}.kpo input{width:64px;font:700 15px var(--f);padding:5px;border-radius:8px;border:1px solid var(--ln);background:var(--sf);color:var(--ink);text-align:right}.kpd{border:0;background:transparent;color:var(--mut);font-size:16px;cursor:pointer;padding:4px 6px}.kps2{display:flex;gap:10px;margin-top:10px}.kps2 label{flex:1;font-size:12px;color:var(--mut)}.kps2 input{display:block;width:100%;box-sizing:border-box;margin-top:3px;font:600 15px var(--f);padding:8px;border-radius:8px;border:1px solid var(--ln);background:var(--sf);color:var(--ink)}.kpt{display:flex;gap:6px;margin-top:12px;text-align:center}.kpt>div{flex:1;background:color-mix(in srgb,var(--acc) 8%,transparent);border-radius:10px;padding:8px 4px}.kpt small{display:block;font-size:11px;color:var(--mut)}.kpt b{font-size:19px}.kph{display:flex;justify-content:space-between;align-items:center}.kpday{margin:14px 0 4px;color:var(--mut)}`;(document.head||document.body||document.documentElement).appendChild(st)})();
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-ka],[data-kall],[data-kgrp],[data-krm],[data-ksave],[data-kclr],[data-kdel],[data-kedit],[data-khome],[data-kopen],[data-kgo]');if(!t)return;e.stopPropagation();e.preventDefault();const y=window.scrollY,ds=t.dataset;
if(ds.ka){const i=KPD.findIndex(l=>l.mk==ds.ka&&l.k==ds.kk);if(i>=0)KPD.splice(i,1);else{const m=R.find(x=>mkey(x)==ds.ka),p=m&&kprob(m,ds.kk),cm=m&&kcfl(m,ds.kk);if(cm){kToast(cm);return}const tg=kTargets(ds.ka);if(p&&tg.length&&!KPD.some(l=>l.mk==ds.ka)){kAsk(ds.ka,ds.kk,tg);return}if(p)KPD.push({mk:ds.ka,k:ds.kk,p:+p.toFixed(4),od:kodd(m,ds.kk),t:+m.t})}kpSave();render();try{scrollTo(0,y)}catch(x){}return}
if(ds.kgrp){KPO[ds.kgrp]=!KPO[ds.kgrp];render();try{scrollTo(0,y)}catch(x){}return}
if(ds.kall){const ls=KPC[+ds.kall]||[];let ad=0,sk=0;ls.forEach(q=>{const m=R.find(x=>mkey(x)==q.mk),p=m&&kprob(m,q.k);if(!m||!p||stt(m).k=='ft'||kin(m,q.k)||kcfl(m,q.k)){sk++;return}KPD.push({mk:q.mk,k:q.k,p:+p.toFixed(4),od:kodd(m,q.k),t:+m.t});ad++});kpSave();push();TABST[tab]=tab=='c'?null:{det,dt,PMV,y};det=null;PMV=null;tab='c';render();kToast(ad+' seçim simülatöre eklendi'+(sk?' ('+sk+' tanesi zaten simülatörde ya da çakışıyordu)':''),1);try{scrollTo(0,0)}catch(x){}return}
if(ds.kgo){push();TABST[tab]=tab=='c'?null:{det,dt,PMV,y};det=null;PMV=null;tab='c';render();try{scrollTo(0,0)}catch(x){}return}
if(ds.krm!==undefined){KPD.splice(+ds.krm,1);kpSave();render();return}
if(ds.kclr){if(KPEC)kUnpub({code:KPEC});KPEC='';KPEN='';KPD=[];kpSave();render();return}
if(ds.ksave){if(!KPD.length)return;const cc=kdConf();if(cc.length){kToast(cc[0]);return}const nm=(document.getElementById('kpname')||{}).value||'';{const sl={id:Date.now(),name:nm.trim(),stake:KPST,legs:KPD.map(l=>({...l})),day:dk(new Date(Math.min(...KPD.map(l=>l.t))))};if(KPEC)sl.code=KPEC;KPEC='';KPEN='';KPS.unshift(sl);KPPUB.add(sl.id);setTimeout(()=>kPublish(sl),0);setTimeout(()=>kAskHome(sl.id),50)}KPD=[];kpSave();render();kToast('Kaydedildi. Yeni bir simülasyon için maçlardan seçim eklemeye devam edebilirsin.',1);try{scrollTo(0,0)}catch(x){}return}
if(ds.khome){const sl=KPS.find(z=>z.id==+ds.khome);if(sl){sl.home=!sl.home;kpSave();kToast(sl.home?'Ana sayfaya eklendi':'Ana sayfadan kaldırıldı',sl.home?1:2)}render();return}
if(ds.kdel){const id=+ds.kdel;if(KPDEL==id){kUnpub(KPS.find(s=>s.id==id));KPX.push(id);KPS=KPS.filter(s=>s.id!=id);KPDEL=null;kpSave()}else KPDEL=id;render();return}
if(ds.kedit){const id=+ds.kedit,s=KPS.find(z=>z.id==id);if(s){KPD=s.legs.map(l=>({...l}));KPST=s.stake;KPEC=s.code||'';KPEN=s.name||'';KPX.push(id);KPS=KPS.filter(z=>z.id!=id);kpSave();render();try{scrollTo(0,0)}catch(x){}}return}
if(ds.kopen){push();det=ds.kopen;dt='p';render();try{scrollTo(0,0)}catch(x){}}},true);
const kLive=()=>{const t=kpTot(KPD),a=document.getElementById('kpod'),b=document.getElementById('kpget');if(a)a.textContent=t.od.toFixed(2);if(b)b.textContent=kFm(KPST*t.od);kgrp(KPD).forEach(g=>{if(g.it.length<2)return;const e=document.querySelector(`[data-kgf="${g.mk}"] .kgo`);if(e)e.textContent=kgo(g).toFixed(2)})};
$('#app').addEventListener('input',e=>{if(e.target&&e.target.id=='kpname'){KPEN=e.target.value;kpSave()}});
$('#app').addEventListener('input',e=>{const t=e.target;if(!t.dataset)return;const v=parseFloat(String(t.value).replace(',','.'));if(t.dataset.kst){KPST=v>=0?v:0;kpSave();kLive()}else if(t.dataset.kod!==undefined){const l=KPD[+t.dataset.kod];if(l&&v>=1.01){l.od=+v.toFixed(2);kpSave();kLive()}}});
$('#app').addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;if(t.dataset.kod!==undefined){const l=KPD[+t.dataset.kod],v=parseFloat(String(t.value).replace(',','.'));if(l&&v>=1.01){l.od=+v.toFixed(2);kpSave()}render()}else if(t.dataset.ksw!==undefined){const i=+t.dataset.ksw,l=KPD[i],nk=t.value,m=l&&kmatch(l);if(m){let cm=null;KPD.forEach((o,j)=>{if(j!=i&&o.mk==l.mk&&!cm){const r=kcf(o.k,nk);if(r)cm=kmsg(r,o.k,nk,m)}});if(cm)kToast(cm);else if(!KPD.some((o,j)=>j!=i&&o.mk==l.mk&&o.k==nk)){const p=kprob(m,nk);if(p){l.k=nk;l.p=+p.toFixed(4);l.od=kodd(m,nk);kpSave()}}}render()}else if(t.dataset.kst){const v=parseFloat(String(t.value).replace(',','.'));KPST=v>=0?v:0;kpSave();render()}});
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{const nt=b.dataset.t;if(!nt)return;if(nt==tab){TABST[nt]=null;det=null;PMV=null;NAVS.length=0;FWD.length=0;render();return}const y=window.scrollY;TABST[tab]=tab=='c'?null:{det,dt,PMV,y};const st=TABST[nt];tab=nt;NAVS.length=0;FWD.length=0;det=st?st.det:null;PMV=st?st.PMV:null;if(st&&st.dt)dt=st.dt;render();try{scrollTo(0,st?st.y:0)}catch(x){}});
try{kpBadge()}catch(e){}
function detail(m){return detail0(m)+(dt=='p'?kpBox(m):'')}


const favLoad=async db=>{try{if(SOUT)return;const us=await claude.use('user');if(!us||!us.id)return;const id=await us.id();if(!id)return;FUID=id;const fr=db.doc('data/users/'+id+'/favs'),fv=await fr.get();if(fv.exists){FAV=new Set((fv.data()||{}).list||[])}else{let f=null;if(us.isOwner&&await us.isOwner()){const g=await db.doc('favs/latest').get();if(g.exists)f=(g.data()||{}).list||null}if(f&&!FAV.size)FAV=new Set(f);if(FAV.size)await fr.set({list:[...FAV]})}try{localStorage.setItem('fav',JSON.stringify([...FAV]))}catch(e){}}catch(e){}};
let PRF=null,PROF=null,PROFL=false,SCONF=false,PMSG='';
const pe=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function profDraw(){if(tab!='u')return;const me=PRF||{},nm=me.name||'',signed=!!me.id;let n=0,hit=0,miss=0,wait=0,stk=0,ret=0;(Array.isArray(KPS)?KPS:[]).forEach(sl=>{n++;let st='wait',t=null;try{st=kStat(sl);t=kpTot(sl.legs)}catch(e){}if(st=='hit'){hit++;stk+=+sl.stake||0;ret+=(+sl.stake||0)*(t?t.od:0)}else if(st=='miss'){miss++;stk+=+sl.stake||0}else wait++});const net=ret-stk,f2=x=>(Math.round(x*100)/100).toFixed(2),fav=[...FAV].sort((a,b)=>a.localeCompare(b,'tr'));
const row=(a,b,c)=>`<div class='sr'><span style='text-align:left'>${a}</span><b${c?` style='color:${c}'`:''}>${b}</b></div>`;
$('#app').innerHTML=`${memCard(me,signed)}
<div class='box'><h3>Kupon simülasyonlarım</h3>${row('Kayıtlı simülasyon',n)}${row('Tuttu',hit,'var(--ok)')}${row('Tutmadı',miss,'var(--hot)')}${row('Sonuç bekleyen',wait)}${row('Sonuçlanan toplam bahis',f2(stk))}${row('Tutanların getirisi',f2(ret))}${row('Net',(net>=0?'+':'')+f2(net),net>0?'var(--ok)':net<0?'var(--hot)':'')}<div class='mut' style='padding:6px 0 4px'>Bunlar simülasyondur, gerçek bahis değildir. Oranlar senin girdiğin oranlardır. Hiçbir bahis risksiz değildir.</div><div class='kpf'><button class='kpb2' id='pgo'>Simülatörü aç</button></div></div>
<div class='box'${KM_SADECE_TR?' hidden':''}><h3>🌐 Language / Dil</h3><div class='sr'><select id='plang' style='width:100%;background:var(--bg);color:var(--ink);border:1px solid var(--ln);border-radius:8px;padding:9px 10px;font:600 16px var(--n)'>${[['auto','🌐 Auto · '+LANGS[I18N.detect()]]].concat(Object.keys(LANGS).filter(k=>I18N.rdy(k)).map(k=>[k,LANGS[k]])).map(([k,l])=>`<option value='${k}'${(k==(()=>{try{return localStorage.getItem('km_lang')||'auto'}catch(e){return 'auto'}})())?' selected':''}>${l}</option>`).join('')}</select></div></div>
<div class='box'><h3>Ayarlarım</h3><div class='sr'><span style='text-align:left'>Varsayılan bahis miktarı</span><input id='pst' type='number' min='1' step='1' value='${+KPST||10}' style='width:90px;text-align:right;background:var(--bg);color:var(--ink);border:1px solid var(--ln);border-radius:8px;padding:6px 8px;font:600 16px var(--n)'></div></div>
<div class='box'><h3>Favori takımlarım (${fav.length})</h3>${fav.length?`<div class='chips wrap'>${fav.map(t=>`<button data-pf="${pe(t)}">★ ${pe(t)} ✕</button>`).join('')}</div>`:`<div class='mut'>Henüz favori takım yok. Bir takımın sayfasındaki ☆ simgesiyle ekleyebilirsin.</div>`}</div>`;
const ls=$('#plang');if(ls)ls.onchange=()=>{const v=ls.value;if(v=='auto'){try{localStorage.removeItem('km_lang')}catch(e){}I18N.set(I18N.detect())}else I18N.set(v,true);try{refresh()}catch(e){}render()};const g=$('#pgo');if(g)g.onclick=()=>{tab='c';det=null;PMV=null;render();try{scrollTo(0,0)}catch(x){}};const p=$('#pst');if(p)p.onchange=()=>{const v=+p.value;if(v>0){KPST=v;kpSave()}};document.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{FAV.delete(b.dataset.pf);favSave();profDraw()});memBind()}
const pbx=(t,x)=>`<div class='box'>${t?`<h3>${t}</h3>`:''}${x}</div>`,btn=(id,t,c)=>`<button class='kpb2' id='${id}'${c?` style='${c}'`:''}>${t}</button>`,inp=(id,v,w,ty)=>`<input id='${id}' type='${ty||'text'}' value="${pe(v)}" ${ty=='number'?"min='1' step='1'":"maxlength='30'"} style='width:${w}px;max-width:100%;background:var(--bg);color:var(--ink);border:1px solid var(--ln);border-radius:8px;padding:8px 10px;font:600 16px var(--n)'>`;
function memCard(me,signed){const msg=PMSG?`<div class='mut' style='color:var(--hot);padding:6px 0'>${pe(PMSG)}</div>`:'';
if(SOUT)return pbx('',`<b style="font:700 20px var(--n)">Misafir</b><div class='mut' style='padding:4px 0 8px'>Çıkış yaptın. Bu cihazda kupon ve favorilerin gizlendi; hesabındaki kayıtlar silinmedi, tekrar girince geri gelir.</div><div class='kpf'>${btn('pin','Giriş yap')}</div>`);
if(!signed&&window.KMCLOUD&&KMCLOUD.on)return KMAUTH.card(pbx);if(!signed)return pbx('',`<b style="font:700 20px var(--n)">Misafir</b><div class='mut' style='padding:2px 0 8px'>Şu an misafirsin: kuponların ve favorilerin yalnızca bu cihazda durur.</div>`);
const av=me.avatarUrl?`<img src="${pe(me.avatarUrl)}" width='56' height='56' alt='' style='border-radius:50%;flex:none'>`:'';
if(PROFL&&!(PROF&&PROF.ob)){const g=['Günün kuponu sekmesinde modelin seçimlerini gör.','Tüm maçlar sekmesinden maçlara gir, ☆ ile takım favorile.','Simülatörde kendi kuponunu kur; kayıtların yalnızca sende durur.'];return pbx('Hoş geldin! Üyeliğini tamamla',`<div style='display:flex;align-items:center;gap:12px;padding:2px 0 8px'>${av}<div class='mut'>${window.KMCLOUD&&KMCLOUD.on?KMAUTH.t('signedin2'):`Giriş yapıldı (Claude hesabı). İki küçük ayar yeter.`}</div></div><div class='sr'><span style='text-align:left'>Takma adın</span>${inp('pnk',me.name||'',170)}</div><div class='sr'><span style='text-align:left'>Varsayılan bahis miktarı</span>${inp('pst0',+KPST||10,90,'number')}</div>${msg}<div class='kpf' style='padding-top:8px'>${btn('pok','Üyeliği tamamla')}</div><ul style='margin:10px 0 0 18px;padding:0;line-height:1.5' class='mut'>${g.map(x=>`<li>${x}</li>`).join('')}</ul><div class='mut' style='padding-top:6px'>Bunlar simülasyondur, gerçek bahis değildir. Hiçbir bahis risksiz değildir.</div>`)}
const nick=(PROF&&PROF.nick)||me.name||'Üye',jd=PROF&&PROF.joined?new Date(PROF.joined).toLocaleDateString(LOCALE):'';
return pbx('',`<div style='display:flex;align-items:center;gap:12px;padding:4px 0'>${av}<div style='min-width:0'><b style="font:700 20px var(--n)">${pe(nick)}</b><div class='mut'>${window.KMCLOUD&&KMCLOUD.on?KMAUTH.t('signedin'):`Giriş yapıldı (Claude hesabı)`}${jd?' · Üyelik: '+pe(jd):''}</div></div></div><div class='sr' style='padding-top:8px'><span style='text-align:left'>Takma adım</span>${inp('pnk',nick,150)}</div><div class='kpf' style='padding:8px 0'>${btn('pns','Adı kaydet')}</div>${msg}<div class='mut' style='padding:2px 0 8px'>${window.KMCLOUD&&KMCLOUD.on?KMAUTH.t('own'):`Kuponların, favorilerin ve ayarların yalnızca sana aittir. Hesap değiştirmek için önce buradan çıkış yap, sonra claude.ai'de başka hesapla gir.`}</div>${SCONF?`<div class='mut' style='color:var(--hot);padding-bottom:6px'>Emin misin? Bu cihazdaki kupon ve favoriler gizlenir. Hesabındaki kayıtlar silinmez.</div><div class='kpf'>${btn('poy','Evet, çıkış yap','background:var(--hot);color:#fff')}${btn('pon','Vazgeç')}</div>`:`<div class='kpf'>${btn('pout','Çıkış yap')}</div>`}`)}
const sOut=()=>{if(window.KMCLOUD&&KMCLOUD.on){try{KMCLOUD.signOut()}catch(e){}try{['kupon_v1','fav','kupon_uid'].forEach(k=>localStorage.removeItem(k))}catch(e){}SOUT=false;SCONF=false;PMSG='';clearTimeout(KPRT);KPD=[];KPS=[];KPX=[];KPTS=0;KPUID=null;KPDBR=false;FUID=null;FAV=new Set();PRF=null;PROF=null;PROFL=false;try{kpBadge()}catch(e){}profDraw();return}try{localStorage.setItem('km_out','1');['kupon_v1','fav','kupon_uid'].forEach(k=>localStorage.removeItem(k))}catch(e){}SOUT=true;SCONF=false;PMSG='';clearTimeout(KPRT);KPD=[];KPS=[];KPX=[];KPTS=0;KPUID=null;KPDBR=false;FUID=null;FAV=new Set();PRF=null;PROF=null;PROFL=false;try{kpBadge()}catch(e){}profDraw()};
const sIn=async()=>{try{localStorage.removeItem('km_out');['kupon_v1','fav','kupon_uid'].forEach(k=>localStorage.removeItem(k))}catch(e){}SOUT=false;PMSG='';KPD=[];KPS=[];KPX=[];KPTS=0;FAV=new Set();profView();try{await kpRem();const db=await claude.use('db');if(db)await favLoad(db)}catch(e){}try{kpBadge()}catch(e){}profDraw()};
const profSave=async(nick,stake,first)=>{PMSG='';try{const db=await claude.use('db');if(!db||!PRF||!PRF.id)throw 0;const o=Object.assign({},PROF||{},{nick:nick,ob:1});if(!o.joined)o.joined=Date.now();await db.doc('data/users/'+PRF.id+'/profile').set(o);PROF=o;if(stake>0){KPST=stake;kpSave()}}catch(e){PMSG='Kaydedilemedi, birazdan tekrar dene.'}profDraw()};
function memBind(){try{window.KMAUTH&&KMAUTH.bind()}catch(e){}const g=id=>document.getElementById(id),nk=()=>((g('pnk')||{}).value||'').trim().slice(0,30);
if(g('pin'))g('pin').onclick=sIn;
if(g('pre'))g('pre').onclick=()=>{PRF=null;PROFL=false;PMSG='';profView();setTimeout(()=>{if(!(PRF&&PRF.id)){PMSG='Hâlâ giriş görünmüyor. claude.ai\'de girdiğinden ve sayfayı oradan açtığından emin ol.';profDraw()}},1500)};
if(g('pcp'))g('pcp').onclick=()=>{try{navigator.clipboard.writeText(location.href).then(()=>{PMSG='';g('pcp').textContent='Kopyalandı'},()=>{g('pcp').textContent='Kopyalanamadı'})}catch(e){g('pcp').textContent='Kopyalanamadı'}};
if(g('pok'))g('pok').onclick=()=>{const n=nk();if(!n){PMSG='Bir takma ad yaz.';profDraw();return}profSave(n,+((g('pst0')||{}).value),true)};
if(g('pns'))g('pns').onclick=()=>{const n=nk();if(!n){PMSG='Takma ad boş olamaz.';profDraw();return}profSave(n,0)};
if(g('pout'))g('pout').onclick=()=>{SCONF=true;profDraw()};
if(g('pon'))g('pon').onclick=()=>{SCONF=false;profDraw()};
if(g('poy'))g('poy').onclick=sOut}
function profView(){profDraw();(async()=>{try{if(SOUT)return;const u=await claude.use('user');if(u&&u.me){PRF=await u.me();profDraw();if(PRF&&PRF.id&&!PROFL){const db=await claude.use('db');if(!db){PROF={ob:1}}else{const s=await db.doc('data/users/'+PRF.id+'/profile').get();PROF=s.exists?JSON.parse(JSON.stringify(s.data()||{})):((KPS.length||FAV.size)?{ob:1}:{})}PROFL=true;profDraw()}}}catch(e){}})()}
function render(){KPC.length=0;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==tab));
if(PMV&&tab!='g'){$('#app').innerHTML=pastView(PMV);document.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{if(!back()){PMV=null;render()}});return}
if(det&&tab!='g'){const m=R.find(x=>[x.c,x.h,x.a].join('|')==det);if(m){$('#app').innerHTML=detail(m);document.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{if(!back()){det=null;render()}});document.querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>{dt=b.dataset.dt;render()});const vf=$('#vf');if(vf)vf.onchange=()=>{VF=!VF;render()};return}det=null}
if(tab=='u'){profView();return}
if(tab=='c'){kupView();return}
if((tab=='k'||tab=='l')&&Q.trim()){teamView();return}
if(tab=='l'){ligView();return}
if(tab=='g'){hist();bindU([]);return}const now=Date.now(),tdk=dk(new Date()),LDS=new Set(LGR.map(r=>dk(new Date(r.t)))),L=R.filter(m=>dk(m.t)>=tdk||LDS.has(dk(m.t))),ds=[...new Set(L.map(m=>dk(m.t)))].sort();if(!ds.includes(day))day=ds.find(d=>d>=tdk)||ds[ds.length-1];
document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==tab));
const lb=d=>(x=>x.toLocaleDateString(LOCALE,{weekday:'short'})+' '+dd(x))(new Date(d+'T12:00'));
const ms0=L.filter(m=>dk(m.t)==day).sort((a,b)=>a.t-b.t),q=Q.trim().toLocaleLowerCase('tr'),ms=ms0.filter(m=>(!F||m.c==F)&&(!LV||['on','live'].includes(stt(m).k))&&(!FV||isFavM(m))&&(!q||(m.h+' '+m.a).toLocaleLowerCase('tr').includes(q))),fm=ms.filter(isFavM),rest=ms,lg=Object.keys(LN).filter(c=>rest.some(m=>m.c==c)),la=Object.keys(LN).filter(c=>ms0.some(m=>m.c==c));
const td=dk(new Date()),lab2=day==td?'Bugün':day==dk(new Date(Date.now()+864e5))?'Yarın':day==dk(new Date(Date.now()-864e5))?'Dün':lb(day),ix=ds.indexOf(day),nl=ms0.filter(m=>['on','live'].includes(stt(m).k)).length;
let h=segc()+`<div class='stk'><div class='dn'><button class='fl${FS?" on":""}' id='flt'><svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 5h18l-7 8.5V20l-4-2v-4.5z'/></svg>Filtre</button><div class='dp'><button data-dd='-1' ${ix<=0?'disabled':''}>‹</button><span>${lab2}</span><button data-dd='1' ${ix>=ds.length-1?'disabled':''}>›</button></div></div><div class='fpl'><button id='lv' class='${LV?'on':''}'><i></i>Canlı${nl?' '+nl:''}</button><button data-fall='1' class='${!LV&&!TS?'on':''}'>Tüm maçlar</button><button data-fts='1' class='${TS?'on':''}'>Saate göre</button></div>`+(FS?`<div class='chips wrap'><button data-fv='1' class='${FV?'on':''}'>★ Favoriler</button><button data-f='' class='${F==''?'on':''}'>Hepsi</button>${la.map(c=>`<button data-f='${c}' class='${F==c?'on':''}'>${N[c]}</button>`).join('')}</div>`:'')+`</div>`;
h+=betsBox(day);h+=ms0.length?(F||LV||q?'':'')+(day<tdk?'<div class="mut" style="margin:4px 0">Geçmiş gün: kupon, kayıtlı model olasılıklarından yeniden hesaplandı; sonuçlar gerçek skorla işaretli.</div>':'')+(F?coupon(ms0.filter(m=>m.c==F),N[F]+' · günün düşük riskli kuponu'):coupon(ms0))+(ms.length?(fm.length?`<div class='box fvb'><div class='lg2'><i class='bd sq' style='background:#f5c542;color:#111'>★</i><div>Favori takımlarım<small>${fm.length} maç</small></div></div>${fm.map(mrow).join('')}</div>`:'')+(TS?tsb(rest):lg.map(c=>{const g=rest.filter(m=>m.c==c),[ct,ln]=LN[c].split(' – ');return`<div class='box'><div class='lg2'><i class='bd sq' style='background:${C[c]};color:#fff'>${ln.slice(0,2).toUpperCase()}</i><div>${ln}<small>${ct}</small></div></div>${g.map(mrow).join('')}</div>`}).join('')):(FV?`<p class="mut">${FAV.size?'Favori takımlarının bu gün maçı yok.':'Henüz favori takım yok. Bir takımın sayfasındaki ☆ simgesiyle ekleyebilirsin.'}</p>`:'<p class="mut">Filtreye uyan maç yok.</p>')):'<p class="mut">Bu gün maç yok.</p>';
h+=`<details class='note'><summary>Veri kaynağı ve sınırlar</summary><div class='why'>Her maçta en fazla 3 düşük oranlı seçenek gösterilir: ihtimali en az %55 ve en çok %87. Tahmini oran: modelin olasılıktan hesapladığı oranın, senin paylaştığın 12 gerçek oranla karşılaştırılıp küçültülmüş halidir (takım golü ve Ü1.5 için yaklaşık %88-90, Ü2.5 için %78; Ü2.5 yalnızca 2 örnekle, KG Var için örnek yok). Gerçek site oranı değildir, sapabilir. 8 Kasım maçlarında yeni kural: yalnızca gol seçenekleri, ihtimal %62-80 aralığında, hedef yaklaşık %72, günün kuponu 4 seçim. Çifte şans yalnızca maçta önde olan taraf için, “beraberlik olmaz” yalnızca beraberlik ihtimali %22 veya altındaysa (ortalamanın belirgin altında) çıkar. Uygun seçenek yoksa gösterilmez. Premier Lig geriye dönük testinde (2026, 274 maç) modelin %50-60 verdiği favoriler %51, %60-70 verdikleri %62 tuttu; örneklem küçük, temkinli oku. Gol seçenekleri (takım golü, Ü/KG): 1-X-2 ihtimallerinden ve Premier Lig'de ölçülen toplam gol ilişkisinden (beklenen toplam gol = 2.68 + 0.85 × |ev-dep ihtimal farkı|) hesaplanır. Aynı testte takım golü seçenekleri baz orandan daha iyi tahmin edildi (ör. ev sahibi en az 1 gol: kayıp 0.533, baz oran 0.572); toplam gol ve KG baz orandan neredeyse ayrışmadı, o yüzden yalnızca baz oranın en az 5 puan üstündeyse gösterilir; “deplasman en az 2 gol” baz orandan iyi çıkmadığı için yok. Aynı ilişki La Liga'da da test edildi (2026, 308 maç): tüm gol seçenekleri baz orandan iyi tahmin edildi (ör. ev sahibi en az 2 gol: kayıp 0.661, baz oran 0.702). Serie A ve Bundesliga'da da test edildi: takım golü seçenekleri baz orandan iyi (Serie A ev sahibi en az 1 gol: kayıp 0.556, baz oran 0.603), ama toplam gol ve KG iyi değil, bu iki ligde yalnızca takım golü seçenekleri gösterilir. Bundesliga'da 2025-26 CSV'si iki kez gelmişti (tekilleştirildi), 2024-25 sonradan eklendi; aralarındaki maçlar beş sezondan. Süper Lig, Ligue 1, Suudi ve Belçika'da bu ilişki uygulanıyor ama test edilmedi. La Liga'da gol sayısı arttı (bu sezon maç başı 3.0, geçen sezon 2.7), bu yüzden La Liga baz oranları son iki sezondan alındı. Süper Lig: TFF (tff.org, resmi) ilk 9 hafta sonuçlarından Poisson modeli, %70 model + %30 lig ortalaması (test edilmedi). Premier Lig, La Liga, Serie A ve Bundesliga: 1-X-2 SportRadar'dan, son 5 maç, ev/deplasman ve aralarındaki maçlar football-data.co.uk CSV'lerinden (resmi değil); CSV'den kurulan kontrol modeliyle %10'dan fazla ayrışan seçenekler elenir. Belçika Pro Lig: 18 takımın puan durumu FOX Sports ve Voetbalkrant'tan, 10. hafta fikstürü Voetbalkrant'tan (Kortrijk–Mechelen 4 Kasım'a ertelendi, saati doğrulanmadı); ihtimaller Suudi Pro Lig'deki gibi puan durumundaki gollerden hesaplanır, test edilmedi. Suudi Pro Lig: 9 maçlık 12. hafta fikstürü The National, ESPN ve Fancode'dan; ihtimaller yalnızca puan durumundaki atılan/yenen gol sayılarından (takım başı 4 maçlık lig ortalaması ağırlığıyla), ev avantajı 1.12 varsayımıyla Poisson modeliyle hesaplanır. Bu model test edilmedi, maç sonuçları ve kadro verisi yok, temkinli oku. Diğer ligler: yalnızca SportRadar 1-X-2 (Ligue 1 dahil), son 5 maç ve kadro verisi yok. Tahmini oran = ihtimalden hesaplanan oranın %10 düşüğü (bahis sitesi marjını taklit etmek için); gerçek bahis sitesi oranı değildir, farklı olabilir. Sayfa kendi kendine güncellenmez.</div></details><p class='mut'>Hiçbir bahis risksiz değildir; yalnızca kaybetmeyi göze alabileceğin kadarını oyna.</p>`;
$('#app').innerHTML=h;bindU(ds);{const hd=document.querySelector('header');if(hd){const sh=()=>{const r=hd.getBoundingClientRect?hd.getBoundingClientRect():null;if(r&&r.height)document.documentElement.style.setProperty('--hh',r.height+'px')};sh();if(window.ResizeObserver&&!window.__ro){window.__ro=new ResizeObserver(sh);window.__ro.observe(hd)}}}const cpd=$('#cpd');if(cpd)cpd.ontoggle=()=>{CPO=cpd.open};const btd=$('#btd');if(btd)btd.ontoggle=()=>{BTO=btd.open};document.querySelectorAll('[data-m]').forEach(r=>r.onclick=()=>{push();det=r.dataset.m;dt='p';PMV=null;render();try{scrollTo(0,0)}catch(e){}});document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{day=b.dataset.d;render()});document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{comp=b.dataset.c;render()})}
addH(`BEL|Kortrijk|Mechelen|1|3
SA|Lecce|Genoa|1|2
SA|Juventus|Napoli|2|0
SA|Sassuolo|Fiorentina|2|4
SA|Atalanta|Parma|0|3
LL|Elche|Valencia|0|1
LL|Athletic|Real Sociedad|2|1
LL|Deportivo|Osasuna|2|1
L1|Marseille|Toulouse|2|0
L1|Lorient|Brest|0|2
PL|Newcastle|Everton|0|1
SL|Gençlerbirliği|Alanyaspor|5|0
BEL|Lommel SK|Gent|2|0
BEL|Charleroi|La Louvière|5|2
SA|Frosinone|Lecce|5|1
SA|Fiorentina|Atalanta|2|2
KSA|Al Khaleej|Al Hazem|4|2
KSA|Al Riyadh|Al Qadsiah|0|6
KSA|Al Nassr|Al Kholood|5|3
SA|Como|Venezia|1|0
SA|Frosinone|Torino|2|0
SA|Lazio|Cagliari|2|1
LL|Racing Santander|Real Madrid|0|3
LL|Getafe|Sevilla|3|1
PL|Liverpool|Arsenal|0|1
BL|Union Berlin|Köln|1|1
BL|Frankfurt|Hamburg|3|1
L1|Strasbourg|Auxerre|5|1
L1|Lyon|Angers|2|0
L1|Paris FC|Monaco|3|1
SL|Amedspor|Eyüpspor|5|1
SL|Trabzonspor|Gaziantep|2|0
SL|Başakşehir|Samsunspor|5|2
SL|Kasımpaşa|Beşiktaş|2|2
BEL|Cercle Brugge|Antwerp|2|1
BEL|STVV|OH Leuven|1|2
LL|Villarreal|Espanyol|0|1
BL|Elversberg|Mainz|4|1
L1|Le Havre|PSG|1|5
L1|Nice|Rennes|5|2
L1|Lille|Lens|1|0
BEL|Zulte Waregem|Club Brugge|2|4
SL|Konyaspor|Galatasaray|0|4
KSA|Abha|Al Ittihad|1|1
KSA|Diriyah|Neom|1|2
KSA|Al Shabab|Al Ahli|6|1
PL|Chelsea|Man United|2|0
PL|Bournemouth|Leeds|2|0
PL|Brentford|N. Forest|2|0
PL|Coventry|Sunderland|3|1
PL|Hull|Ipswich|2|2
PL|Man City|Brighton|0|1
PL|Tottenham|C. Palace|2|0
PL|Aston Villa|Fulham|1|1
LL|Levante|Atletico Madrid|0|2
LL|Rayo|Celta|3|0
LL|Betis|Malaga|2|1
LL|Barcelona|Alaves|6|1
SA|Bologna|Monza|2|1
SA|Udinese|Roma|2|5
SA|Milan|Inter|3|1
BL|Leverkusen|Stuttgart|2|4
BL|Augsburg|Freiburg|1|2
BL|M’gladbach|Paderborn|0|0
BL|Werder Bremen|Hoffenheim|2|0
BL|Schalke|Leipzig|0|2
BL|Bayern|Dortmund|2|2
L1|Troyes|Le Mans|2|0
SL|Erzurumspor|Çorum|1|3
SL|Kocaelispor|Rizespor|0|0
SL|Fenerbahçe|Göztepe|1|2
KSA|Al Taawoun|Al Ettifaq|1|1
KSA|Al Fayha|Al Faisaly|4|1
KSA|Al Hilal|Al Fateh|2|0
BEL|Mechelen|Genk|1|0
BEL|Standard|Kortrijk|1|1
BEL|Beveren|Union SG|1|2
BEL|Anderlecht|Westerlo|4|1`);`SL|11-06T17:00|Gaziantep|Kasımpaşa
SL|11-07T10:30|Eyüpspor|Kocaelispor
SL|11-07T13:00|Samsunspor|Konyaspor
SL|11-07T16:00|Galatasaray|Amedspor
SL|11-07T16:00|Göztepe|Başakşehir
SL|11-08T10:30|Rizespor|Erzurumspor
SL|11-08T13:00|Çorum|Fenerbahçe
SL|11-08T15:30|Alanyaspor|Trabzonspor
SL|11-08T18:00|Beşiktaş|Gençlerbirliği
BEL|11-06T19:45|Standard|Beveren
BEL|11-07T15:00|Westerlo|Charleroi
BEL|11-07T17:15|OH Leuven|Mechelen
BEL|11-07T19:45|Antwerp|Lommel SK
BEL|11-07T19:45|La Louvière|Cercle Brugge
BEL|11-08T12:30|Club Brugge|Anderlecht
BEL|11-08T15:00|Gent|Kortrijk
BEL|11-08T17:30|Union SG|Genk
BEL|11-08T18:15|STVV|Zulte Waregem`.split("\n").forEach(l=>{const[c,t,h,a]=l.split("|"),m={c,t:new Date(`2026-${t}:00Z`),h,a};c=='SL'?slp2(m):bel(m);R.push(m)});
const WKM={"PL": {"Everton|Coventry": [0.492, 0.274, 0.234], "Leeds|Tottenham": [0.377, 0.245, 0.379], "Arsenal|Hull": [0.623, 0.232, 0.145], "Fulham|Newcastle": [0.366, 0.249, 0.385], "N. Forest|Man City": [0.188, 0.22, 0.593], "Brighton|Brentford": [0.475, 0.235, 0.29], "C. Palace|Liverpool": [0.243, 0.235, 0.521], "Ipswich|Bournemouth": [0.264, 0.226, 0.51], "Sunderland|Chelsea": [0.301, 0.264, 0.435], "Man United|Aston Villa": [0.42, 0.247, 0.333]}, "LL": {"Sevilla|Alaves": [0.478, 0.263, 0.259], "Malaga|Racing Santander": [0.438, 0.227, 0.335], "Espanyol|Deportivo": [0.406, 0.27, 0.324], "Osasuna|Athletic": [0.343, 0.285, 0.373], "Valencia|Real Madrid": [0.185, 0.227, 0.588], "Elche|Betis": [0.342, 0.256, 0.402], "Real Sociedad|Rayo": [0.514, 0.259, 0.227], "Celta|Levante": [0.538, 0.227, 0.235], "Villarreal|Getafe": [0.604, 0.235, 0.16], "Atletico Madrid|Barcelona": [0.361, 0.235, 0.404]}, "SA": {"Venezia|Udinese": [0.286, 0.276, 0.438], "Cagliari|Frosinone": [0.324, 0.234, 0.442], "Torino|Lecce": [0.49, 0.285, 0.225], "Parma|Bologna": [0.248, 0.28, 0.472], "Roma|Sassuolo": [0.658, 0.193, 0.148], "Napoli|Lazio": [0.469, 0.264, 0.267], "Genoa|Milan": [0.233, 0.258, 0.509], "Monza|Atalanta": [0.186, 0.209, 0.605], "Inter|Como": [0.54, 0.23, 0.229], "Fiorentina|Juventus": [0.289, 0.269, 0.442]}, "BL": {"Hamburg|M’gladbach": [0.396, 0.249, 0.355], "Dortmund|Elversberg": [0.702, 0.16, 0.139], "Leipzig|Augsburg": [0.658, 0.188, 0.155], "Mainz|Bayern": [0.164, 0.176, 0.66], "Paderborn|Frankfurt": [0.351, 0.263, 0.386], "Stuttgart|Werder Bremen": [0.605, 0.199, 0.196], "Köln|Leverkusen": [0.223, 0.217, 0.561], "Freiburg|Union Berlin": [0.532, 0.24, 0.228]}, "SL": {"Gaziantep|Kasımpaşa": [0.379, 0.25, 0.37], "Eyüpspor|Kocaelispor": [0.334, 0.328, 0.338], "Samsunspor|Konyaspor": [0.441, 0.267, 0.292], "Galatasaray|Amedspor": [0.582, 0.198, 0.22], "Göztepe|Başakşehir": [0.399, 0.253, 0.349], "Rizespor|Erzurumspor": [0.475, 0.26, 0.265], "Çorum|Fenerbahçe": [0.299, 0.205, 0.496], "Alanyaspor|Trabzonspor": [0.298, 0.247, 0.454], "Beşiktaş|Gençlerbirliği": [0.623, 0.217, 0.16]}},SLH=`Alanyaspor|Gençlerbirliği~02.11.2026|Gençlerbirliği|Alanyaspor|5|0
Alanyaspor|Gençlerbirliği~09.03.2026|Alanyaspor|Gençlerbirliği|0|0
Alanyaspor|Gençlerbirliği~04.10.2025|Gençlerbirliği|Alanyaspor|2|2
Amedspor|Eyüpspor~01.11.2026|Amedspor|Eyüpspor|5|1
Başakşehir|Samsunspor~01.11.2026|Başakşehir|Samsunspor|5|2
Başakşehir|Samsunspor~09.05.2026|Başakşehir|Samsunspor|3|0
Başakşehir|Samsunspor~14.12.2025|Samsunspor|Başakşehir|0|2
Başakşehir|Samsunspor~01.02.2025|Başakşehir|Samsunspor|4|0
Başakşehir|Samsunspor~18.09.2024|Samsunspor|Başakşehir|2|0
Gaziantep|Trabzonspor~01.11.2026|Trabzonspor|Gaziantep|2|0
Gaziantep|Trabzonspor~22.02.2026|Gaziantep|Trabzonspor|1|2
Gaziantep|Trabzonspor~20.09.2025|Trabzonspor|Gaziantep|1|1
Gaziantep|Trabzonspor~23.02.2025|Trabzonspor|Gaziantep|3|2
Gaziantep|Trabzonspor~23.09.2024|Gaziantep|Trabzonspor|0|0
Beşiktaş|Kasımpaşa~01.11.2026|Kasımpaşa|Beşiktaş|2|2
Beşiktaş|Kasımpaşa~19.03.2026|Beşiktaş|Kasımpaşa|2|1
Beşiktaş|Kasımpaşa~26.10.2025|Kasımpaşa|Beşiktaş|1|1
Beşiktaş|Kasımpaşa~07.04.2025|Kasımpaşa|Beşiktaş|1|1
Beşiktaş|Kasımpaşa~02.11.2024|Beşiktaş|Kasımpaşa|1|3
Erzurumspor|Çorum~31.10.2026|Erzurumspor|Çorum|1|3
Kocaelispor|Rizespor~31.10.2026|Kocaelispor|Rizespor|0|0
Kocaelispor|Rizespor~20.02.2026|Rizespor|Kocaelispor|2|0
Kocaelispor|Rizespor~21.09.2025|Kocaelispor|Rizespor|1|1
Fenerbahçe|Göztepe~31.10.2026|Fenerbahçe|Göztepe|1|2
Fenerbahçe|Göztepe~25.01.2026|Fenerbahçe|Göztepe|1|1
Fenerbahçe|Göztepe~16.08.2025|Göztepe|Fenerbahçe|0|0
Fenerbahçe|Göztepe~26.01.2025|Fenerbahçe|Göztepe|3|2
Fenerbahçe|Göztepe~17.08.2024|Göztepe|Fenerbahçe|2|2
Galatasaray|Konyaspor~30.10.2026|Konyaspor|Galatasaray|0|4
Galatasaray|Konyaspor~21.02.2026|Konyaspor|Galatasaray|2|0
Galatasaray|Konyaspor~22.09.2025|Galatasaray|Konyaspor|3|1
Galatasaray|Konyaspor~25.01.2025|Galatasaray|Konyaspor|1|0
Galatasaray|Konyaspor~16.08.2024|Konyaspor|Galatasaray|1|2
Başakşehir|Beşiktaş~26.10.2026|Beşiktaş|Başakşehir|2|0
Başakşehir|Beşiktaş~15.02.2026|Başakşehir|Beşiktaş|2|3
Başakşehir|Beşiktaş~13.09.2025|Beşiktaş|Başakşehir|2|1
Başakşehir|Beşiktaş~12.04.2025|Beşiktaş|Başakşehir|0|2
Başakşehir|Beşiktaş~10.11.2024|Başakşehir|Beşiktaş|0|0
Rizespor|Trabzonspor~26.10.2026|Rizespor|Trabzonspor|3|4
Rizespor|Trabzonspor~14.03.2026|Trabzonspor|Rizespor|1|0
Rizespor|Trabzonspor~18.10.2025|Rizespor|Trabzonspor|1|2
Rizespor|Trabzonspor~13.04.2025|Trabzonspor|Rizespor|2|0
Rizespor|Trabzonspor~09.11.2024|Rizespor|Trabzonspor|3|1
Fenerbahçe|Galatasaray~26.10.2026|Galatasaray|Fenerbahçe|2|1
Fenerbahçe|Galatasaray~26.04.2026|Galatasaray|Fenerbahçe|3|0
Fenerbahçe|Galatasaray~01.12.2025|Fenerbahçe|Galatasaray|1|1
Fenerbahçe|Galatasaray~24.02.2025|Galatasaray|Fenerbahçe|0|0
Fenerbahçe|Galatasaray~21.09.2024|Fenerbahçe|Galatasaray|1|3
Gençlerbirliği|Konyaspor~25.10.2026|Konyaspor|Gençlerbirliği|2|0
Gençlerbirliği|Konyaspor~19.03.2026|Konyaspor|Gençlerbirliği|1|0
Gençlerbirliği|Konyaspor~26.10.2025|Gençlerbirliği|Konyaspor|1|2
Göztepe|Çorum~25.10.2026|Göztepe|Çorum|2|0
Eyüpspor|Kasımpaşa~24.10.2026|Eyüpspor|Kasımpaşa|0|1
Eyüpspor|Kasımpaşa~15.03.2026|Kasımpaşa|Eyüpspor|1|0
Eyüpspor|Kasımpaşa~20.10.2025|Eyüpspor|Kasımpaşa|2|0
Eyüpspor|Kasımpaşa~10.05.2025|Eyüpspor|Kasımpaşa|0|3
Eyüpspor|Kasımpaşa~13.12.2024|Kasımpaşa|Eyüpspor|2|0
Erzurumspor|Gaziantep~24.10.2026|Gaziantep|Erzurumspor|1|3
Amedspor|Samsunspor~24.10.2026|Samsunspor|Amedspor|1|2
Alanyaspor|Kocaelispor~23.10.2026|Alanyaspor|Kocaelispor|1|2
Alanyaspor|Kocaelispor~18.03.2026|Alanyaspor|Kocaelispor|5|0
Alanyaspor|Kocaelispor~25.10.2025|Kocaelispor|Alanyaspor|2|0
Beşiktaş|Trabzonspor~19.10.2026|Trabzonspor|Beşiktaş|2|0
Beşiktaş|Trabzonspor~09.05.2026|Beşiktaş|Trabzonspor|1|2
Beşiktaş|Trabzonspor~14.12.2025|Trabzonspor|Beşiktaş|3|3
Beşiktaş|Trabzonspor~15.02.2025|Beşiktaş|Trabzonspor|2|1
Beşiktaş|Trabzonspor~15.09.2024|Trabzonspor|Beşiktaş|1|1
Kasımpaşa|Samsunspor~18.10.2026|Kasımpaşa|Samsunspor|4|1
Kasımpaşa|Samsunspor~30.01.2026|Kasımpaşa|Samsunspor|0|1
Kasımpaşa|Samsunspor~17.09.2025|Samsunspor|Kasımpaşa|0|0
Kasımpaşa|Samsunspor~29.03.2025|Samsunspor|Kasımpaşa|0|2
Kasımpaşa|Samsunspor~26.10.2024|Kasımpaşa|Samsunspor|1|4
Göztepe|Kocaelispor~18.10.2026|Kocaelispor|Göztepe|1|2
Göztepe|Kocaelispor~18.04.2026|Kocaelispor|Göztepe|1|1
Göztepe|Kocaelispor~23.11.2025|Göztepe|Kocaelispor|0|0
Başakşehir|Gaziantep~18.10.2026|Başakşehir|Gaziantep|2|1
Başakşehir|Gaziantep~16.05.2026|Gaziantep|Başakşehir|1|2
Başakşehir|Gaziantep~22.12.2025|Başakşehir|Gaziantep|5|1
Başakşehir|Gaziantep~20.04.2025|Başakşehir|Gaziantep|2|1
Başakşehir|Gaziantep~23.11.2024|Gaziantep|Başakşehir|3|0
Erzurumspor|Eyüpspor~17.10.2026|Erzurumspor|Eyüpspor|2|0
Amedspor|Konyaspor~17.10.2026|Amedspor|Konyaspor|1|0
Galatasaray|Gençlerbirliği~17.10.2026|Gençlerbirliği|Galatasaray|0|1
Galatasaray|Gençlerbirliği~18.04.2026|Gençlerbirliği|Galatasaray|1|2
Galatasaray|Gençlerbirliği~22.11.2025|Galatasaray|Gençlerbirliği|3|2
Alanyaspor|Fenerbahçe~17.10.2026|Fenerbahçe|Alanyaspor|3|0
Alanyaspor|Fenerbahçe~18.01.2026|Alanyaspor|Fenerbahçe|2|3
Alanyaspor|Fenerbahçe~17.09.2025|Fenerbahçe|Alanyaspor|2|2
Alanyaspor|Fenerbahçe~09.02.2025|Alanyaspor|Fenerbahçe|0|2
Alanyaspor|Fenerbahçe~30.08.2024|Fenerbahçe|Alanyaspor|3|0
Rizespor|Çorum~16.10.2026|Çorum|Rizespor|2|1
Eyüpspor|Göztepe~12.10.2026|Eyüpspor|Göztepe|0|4
Eyüpspor|Göztepe~28.02.2026|Göztepe|Eyüpspor|0|0
Eyüpspor|Göztepe~27.09.2025|Eyüpspor|Göztepe|0|0
Eyüpspor|Göztepe~16.03.2025|Göztepe|Eyüpspor|1|1
Eyüpspor|Göztepe~19.10.2024|Eyüpspor|Göztepe|1|0
Başakşehir|Konyaspor~11.10.2026|Konyaspor|Başakşehir|0|0
Başakşehir|Konyaspor~27.02.2026|Başakşehir|Konyaspor|2|0
Başakşehir|Konyaspor~28.09.2025|Konyaspor|Başakşehir|2|1
Başakşehir|Konyaspor~05.04.2025|Başakşehir|Konyaspor|1|0
Başakşehir|Konyaspor~03.11.2024|Konyaspor|Başakşehir|3|2
Gaziantep|Çorum~11.10.2026|Gaziantep|Çorum|0|3
Beşiktaş|Kocaelispor~11.10.2026|Beşiktaş|Kocaelispor|2|1
Beşiktaş|Kocaelispor~28.02.2026|Kocaelispor|Beşiktaş|0|1
Beşiktaş|Kocaelispor~29.09.2025|Beşiktaş|Kocaelispor|3|1
Amedspor|Gençlerbirliği~10.10.2026|Gençlerbirliği|Amedspor|2|2
Alanyaspor|Erzurumspor~10.10.2026|Alanyaspor|Erzurumspor|0|0
Samsunspor|Trabzonspor~10.10.2026|Samsunspor|Trabzonspor|0|3
Samsunspor|Trabzonspor~07.02.2026|Samsunspor|Trabzonspor|0|3
Samsunspor|Trabzonspor~31.08.2025|Trabzonspor|Samsunspor|1|1
Samsunspor|Trabzonspor~25.05.2025|Trabzonspor|Samsunspor|2|2
Samsunspor|Trabzonspor~04.01.2025|Samsunspor|Trabzonspor|2|1
Fenerbahçe|Rizespor~10.10.2026|Rizespor|Fenerbahçe|0|3
Fenerbahçe|Rizespor~17.04.2026|Fenerbahçe|Rizespor|2|2
Fenerbahçe|Rizespor~23.11.2025|Rizespor|Fenerbahçe|2|5
Fenerbahçe|Rizespor~02.02.2025|Fenerbahçe|Rizespor|3|2
Fenerbahçe|Rizespor~25.08.2024|Rizespor|Fenerbahçe|0|5
Galatasaray|Kasımpaşa~09.10.2026|Galatasaray|Kasımpaşa|3|1
Galatasaray|Kasımpaşa~17.05.2026|Kasımpaşa|Galatasaray|1|0
Galatasaray|Kasımpaşa~21.12.2025|Galatasaray|Kasımpaşa|3|0
Galatasaray|Kasımpaşa~02.03.2025|Kasımpaşa|Galatasaray|3|3
Galatasaray|Kasımpaşa~28.09.2024|Galatasaray|Kasımpaşa|3|3
Erzurumspor|Samsunspor~20.09.2026|Erzurumspor|Samsunspor|1|0
Eyüpspor|Fenerbahçe~20.09.2026|Fenerbahçe|Eyüpspor|8|0
Eyüpspor|Fenerbahçe~17.05.2026|Fenerbahçe|Eyüpspor|3|3
Eyüpspor|Fenerbahçe~20.12.2025|Eyüpspor|Fenerbahçe|0|3
Eyüpspor|Fenerbahçe~18.05.2025|Fenerbahçe|Eyüpspor|2|1
Eyüpspor|Fenerbahçe~20.12.2024|Eyüpspor|Fenerbahçe|1|1
Amedspor|Beşiktaş~20.09.2026|Amedspor|Beşiktaş|3|2
Göztepe|Rizespor~20.09.2026|Göztepe|Rizespor|2|2
Göztepe|Rizespor~19.01.2026|Göztepe|Rizespor|3|1
Göztepe|Rizespor~10.08.2025|Rizespor|Göztepe|0|3
Göztepe|Rizespor~18.05.2025|Rizespor|Göztepe|6|3
Göztepe|Rizespor~22.12.2024|Göztepe|Rizespor|3|0
Alanyaspor|Çorum~19.09.2026|Çorum|Alanyaspor|1|2
Gaziantep|Kocaelispor~19.09.2026|Kocaelispor|Gaziantep|2|0
Gaziantep|Kocaelispor~15.02.2026|Kocaelispor|Gaziantep|3|0
Gaziantep|Kocaelispor~14.09.2025|Gaziantep|Kocaelispor|2|0
Başakşehir|Gençlerbirliği~19.09.2026|Başakşehir|Gençlerbirliği|4|0
Başakşehir|Gençlerbirliği~11.04.2026|Başakşehir|Gençlerbirliği|3|0
Başakşehir|Gençlerbirliği~07.11.2025|Gençlerbirliği|Başakşehir|2|1
Galatasaray|Trabzonspor~19.09.2026|Trabzonspor|Galatasaray|4|0
Galatasaray|Trabzonspor~04.04.2026|Trabzonspor|Galatasaray|2|1
Galatasaray|Trabzonspor~01.11.2025|Galatasaray|Trabzonspor|0|0
Galatasaray|Trabzonspor~10.05.2025|Trabzonspor|Galatasaray|0|2
Galatasaray|Trabzonspor~16.12.2024|Galatasaray|Trabzonspor|4|3
Kasımpaşa|Konyaspor~18.09.2026|Kasımpaşa|Konyaspor|0|0
Kasımpaşa|Konyaspor~08.03.2026|Konyaspor|Kasımpaşa|1|1
Kasımpaşa|Konyaspor~05.10.2025|Kasımpaşa|Konyaspor|1|1
Kasımpaşa|Konyaspor~19.01.2025|Konyaspor|Kasımpaşa|3|3
Kasımpaşa|Konyaspor~10.08.2024|Kasımpaşa|Konyaspor|2|3
Fenerbahçe|Gaziantep~14.09.2026|Gaziantep|Fenerbahçe|0|0
Fenerbahçe|Gaziantep~17.03.2026|Fenerbahçe|Gaziantep|4|1
Fenerbahçe|Gaziantep~27.10.2025|Gaziantep|Fenerbahçe|0|4
Fenerbahçe|Gaziantep~26.04.2025|Gaziantep|Fenerbahçe|1|3
Fenerbahçe|Gaziantep~02.12.2024|Fenerbahçe|Gaziantep|3|1
Gençlerbirliği|Kasımpaşa~13.09.2026|Gençlerbirliği|Kasımpaşa|1|2
Gençlerbirliği|Kasımpaşa~09.05.2026|Gençlerbirliği|Kasımpaşa|3|2
Gençlerbirliği|Kasımpaşa~12.12.2025|Kasımpaşa|Gençlerbirliği|0|0
Amedspor|Başakşehir~13.09.2026|Amedspor|Başakşehir|5|0
Galatasaray|Kocaelispor~13.09.2026|Galatasaray|Kocaelispor|1|0
Galatasaray|Kocaelispor~12.04.2026|Galatasaray|Kocaelispor|1|1
Galatasaray|Kocaelispor~09.11.2025|Kocaelispor|Galatasaray|1|0
Eyüpspor|Rizespor~12.09.2026|Eyüpspor|Rizespor|0|2
Eyüpspor|Rizespor~09.05.2026|Eyüpspor|Rizespor|4|0
Eyüpspor|Rizespor~13.12.2025|Rizespor|Eyüpspor|3|0
Eyüpspor|Rizespor~20.04.2025|Rizespor|Eyüpspor|1|0
Eyüpspor|Rizespor~23.11.2024|Eyüpspor|Rizespor|1|2
Samsunspor|Çorum~12.09.2026|Samsunspor|Çorum|1|5
Alanyaspor|Göztepe~12.09.2026|Alanyaspor|Göztepe|2|2
Alanyaspor|Göztepe~14.03.2026|Göztepe|Alanyaspor|2|2
Alanyaspor|Göztepe~19.10.2025|Alanyaspor|Göztepe|1|0
Alanyaspor|Göztepe~02.02.2025|Göztepe|Alanyaspor|0|1
Alanyaspor|Göztepe~23.08.2024|Alanyaspor|Göztepe|1|1
Konyaspor|Trabzonspor~12.09.2026|Konyaspor|Trabzonspor|1|0
Konyaspor|Trabzonspor~27.04.2026|Konyaspor|Trabzonspor|2|1
Konyaspor|Trabzonspor~29.11.2025|Trabzonspor|Konyaspor|3|1
Konyaspor|Trabzonspor~03.03.2025|Konyaspor|Trabzonspor|1|0
Konyaspor|Trabzonspor~29.09.2024|Trabzonspor|Konyaspor|3|2
Beşiktaş|Erzurumspor~11.09.2026|Beşiktaş|Erzurumspor|3|0
Gaziantep|Göztepe~07.09.2026|Göztepe|Gaziantep|2|4
Gaziantep|Göztepe~09.05.2026|Göztepe|Gaziantep|2|1
Gaziantep|Göztepe~14.12.2025|Gaziantep|Göztepe|0|1
Gaziantep|Göztepe~07.04.2025|Göztepe|Gaziantep|1|1
Gaziantep|Göztepe~01.11.2024|Gaziantep|Göztepe|2|1
Alanyaspor|Rizespor~07.09.2026|Rizespor|Alanyaspor|0|1
Alanyaspor|Rizespor~25.01.2026|Rizespor|Alanyaspor|1|1
Alanyaspor|Rizespor~16.08.2025|Alanyaspor|Rizespor|0|0
Alanyaspor|Rizespor~02.03.2025|Rizespor|Alanyaspor|3|1
Alanyaspor|Rizespor~28.09.2024|Alanyaspor|Rizespor|1|0
Eyüpspor|Çorum~06.09.2026|Çorum|Eyüpspor|3|0
Amedspor|Kasımpaşa~06.09.2026|Kasımpaşa|Amedspor|2|2
Kocaelispor|Samsunspor~06.09.2026|Kocaelispor|Samsunspor|1|0
Kocaelispor|Samsunspor~24.01.2026|Samsunspor|Kocaelispor|0|0
Kocaelispor|Samsunspor~16.08.2025|Kocaelispor|Samsunspor|0|1
Gençlerbirliği|Trabzonspor~06.09.2026|Trabzonspor|Gençlerbirliği|5|0
Gençlerbirliği|Trabzonspor~17.05.2026|Trabzonspor|Gençlerbirliği|0|3
Gençlerbirliği|Trabzonspor~22.12.2025|Gençlerbirliği|Trabzonspor|4|3
Erzurumspor|Konyaspor~05.09.2026|Erzurumspor|Konyaspor|1|0
Beşiktaş|Fenerbahçe~05.09.2026|Fenerbahçe|Beşiktaş|1|2
Beşiktaş|Fenerbahçe~05.04.2026|Fenerbahçe|Beşiktaş|1|0
Beşiktaş|Fenerbahçe~02.11.2025|Beşiktaş|Fenerbahçe|2|3
Beşiktaş|Fenerbahçe~04.05.2025|Fenerbahçe|Beşiktaş|0|1
Beşiktaş|Fenerbahçe~07.12.2024|Beşiktaş|Fenerbahçe|1|0
Başakşehir|Galatasaray~04.09.2026|Başakşehir|Galatasaray|2|3
Başakşehir|Galatasaray~14.03.2026|Galatasaray|Başakşehir|3|0
Başakşehir|Galatasaray~18.10.2025|Başakşehir|Galatasaray|1|2
Başakşehir|Galatasaray~30.05.2025|Galatasaray|Başakşehir|2|0
Başakşehir|Galatasaray~12.01.2025|Başakşehir|Galatasaray|1|2
Amedspor|Trabzonspor~31.08.2026|Amedspor|Trabzonspor|2|1
Beşiktaş|Çorum~31.08.2026|Beşiktaş|Çorum|6|2
Alanyaspor|Eyüpspor~30.08.2026|Eyüpspor|Alanyaspor|2|1
Alanyaspor|Eyüpspor~31.01.2026|Alanyaspor|Eyüpspor|1|3
Alanyaspor|Eyüpspor~25.08.2025|Eyüpspor|Alanyaspor|2|1
Alanyaspor|Eyüpspor~19.01.2025|Eyüpspor|Alanyaspor|3|0
Alanyaspor|Eyüpspor~11.08.2024|Alanyaspor|Eyüpspor|1|1
Başakşehir|Kasımpaşa~30.08.2026|Başakşehir|Kasımpaşa|1|1
Başakşehir|Kasımpaşa~24.04.2026|Başakşehir|Kasımpaşa|4|0
Başakşehir|Kasımpaşa~29.11.2025|Kasımpaşa|Başakşehir|1|3
Başakşehir|Kasımpaşa~18.05.2025|Kasımpaşa|Başakşehir|2|3
Başakşehir|Kasımpaşa~23.12.2024|Başakşehir|Kasımpaşa|2|2
Fenerbahçe|Samsunspor~30.08.2026|Samsunspor|Fenerbahçe|0|2
Fenerbahçe|Samsunspor~08.03.2026|Fenerbahçe|Samsunspor|3|2
Fenerbahçe|Samsunspor~05.10.2025|Samsunspor|Fenerbahçe|0|0
Fenerbahçe|Samsunspor~16.03.2025|Fenerbahçe|Samsunspor|0|0
Fenerbahçe|Samsunspor~20.10.2024|Samsunspor|Fenerbahçe|2|2
Kocaelispor|Konyaspor~29.08.2026|Konyaspor|Kocaelispor|1|2
Kocaelispor|Konyaspor~14.03.2026|Kocaelispor|Konyaspor|1|2
Kocaelispor|Konyaspor~18.10.2025|Konyaspor|Kocaelispor|2|3
Galatasaray|Göztepe~29.08.2026|Galatasaray|Göztepe|3|2
Galatasaray|Göztepe~08.04.2026|Göztepe|Galatasaray|1|3
Galatasaray|Göztepe~26.10.2025|Galatasaray|Göztepe|3|1
Galatasaray|Göztepe~24.05.2025|Göztepe|Galatasaray|0|2
Galatasaray|Göztepe~04.01.2025|Galatasaray|Göztepe|2|1
Gaziantep|Rizespor~29.08.2026|Gaziantep|Rizespor|1|2
Gaziantep|Rizespor~13.04.2026|Rizespor|Gaziantep|2|1
Gaziantep|Rizespor~08.11.2025|Gaziantep|Rizespor|2|2
Gaziantep|Rizespor~03.05.2025|Rizespor|Gaziantep|2|0
Gaziantep|Rizespor~09.12.2024|Gaziantep|Rizespor|1|0
Erzurumspor|Gençlerbirliği~28.08.2026|Gençlerbirliği|Erzurumspor|1|1
Amedspor|Kocaelispor~24.08.2026|Kocaelispor|Amedspor|2|0
Eyüpspor|Gaziantep~23.08.2026|Eyüpspor|Gaziantep|0|1
Eyüpspor|Gaziantep~25.04.2026|Eyüpspor|Gaziantep|3|0
Eyüpspor|Gaziantep~29.11.2025|Gaziantep|Eyüpspor|1|2
Eyüpspor|Gaziantep~03.03.2025|Gaziantep|Eyüpspor|3|1
Eyüpspor|Gaziantep~29.09.2024|Eyüpspor|Gaziantep|3|2
Başakşehir|Trabzonspor~23.08.2026|Trabzonspor|Başakşehir|2|1
Başakşehir|Trabzonspor~19.04.2026|Trabzonspor|Başakşehir|1|1
Başakşehir|Trabzonspor~24.11.2025|Başakşehir|Trabzonspor|3|4
Başakşehir|Trabzonspor~15.03.2025|Başakşehir|Trabzonspor|0|3
Başakşehir|Trabzonspor~19.10.2024|Trabzonspor|Başakşehir|1|0
Alanyaspor|Beşiktaş~23.08.2026|Alanyaspor|Beşiktaş|1|0
Alanyaspor|Beşiktaş~08.02.2026|Beşiktaş|Alanyaspor|2|2
Alanyaspor|Beşiktaş~31.08.2025|Alanyaspor|Beşiktaş|2|0
Alanyaspor|Beşiktaş~18.05.2025|Alanyaspor|Beşiktaş|1|1
Alanyaspor|Beşiktaş~21.12.2024|Beşiktaş|Alanyaspor|1|1
Gençlerbirliği|Göztepe~23.08.2026|Göztepe|Gençlerbirliği|0|1
Gençlerbirliği|Göztepe~04.04.2026|Gençlerbirliği|Göztepe|0|2
Gençlerbirliği|Göztepe~01.11.2025|Göztepe|Gençlerbirliği|1|0
Kasımpaşa|Çorum~22.08.2026|Çorum|Kasımpaşa|0|1
Rizespor|Samsunspor~22.08.2026|Rizespor|Samsunspor|0|2
Rizespor|Samsunspor~09.04.2026|Rizespor|Samsunspor|4|1
Rizespor|Samsunspor~27.10.2025|Samsunspor|Rizespor|1|1
Rizespor|Samsunspor~22.02.2025|Samsunspor|Rizespor|2|3
Rizespor|Samsunspor~22.09.2024|Rizespor|Samsunspor|0|1
Fenerbahçe|Konyaspor~22.08.2026|Fenerbahçe|Konyaspor|4|2
Fenerbahçe|Konyaspor~09.05.2026|Konyaspor|Fenerbahçe|0|3
Fenerbahçe|Konyaspor~15.12.2025|Fenerbahçe|Konyaspor|4|0
Fenerbahçe|Konyaspor~31.05.2025|Fenerbahçe|Konyaspor|2|1
Fenerbahçe|Konyaspor~13.01.2025|Konyaspor|Fenerbahçe|2|3
Erzurumspor|Galatasaray~21.08.2026|Erzurumspor|Galatasaray|0|4
Göztepe|Samsunspor~17.08.2026|Samsunspor|Göztepe|3|3
Göztepe|Samsunspor~16.05.2026|Samsunspor|Göztepe|3|0
Göztepe|Samsunspor~21.12.2025|Göztepe|Samsunspor|2|0
Göztepe|Samsunspor~03.03.2025|Göztepe|Samsunspor|2|2
Göztepe|Samsunspor~28.09.2024|Samsunspor|Göztepe|4|3
Başakşehir|Kocaelispor~16.08.2026|Başakşehir|Kocaelispor|2|0
Başakşehir|Kocaelispor~06.04.2026|Kocaelispor|Başakşehir|0|0
Başakşehir|Kocaelispor~31.10.2025|Başakşehir|Kocaelispor|1|0
Amedspor|Erzurumspor~16.08.2026|Amedspor|Erzurumspor|3|0
Beşiktaş|Eyüpspor~16.08.2026|Beşiktaş|Eyüpspor|1|0
Beşiktaş|Eyüpspor~26.01.2026|Eyüpspor|Beşiktaş|2|2
Beşiktaş|Eyüpspor~17.08.2025|Beşiktaş|Eyüpspor|2|1
Beşiktaş|Eyüpspor~21.02.2025|Eyüpspor|Beşiktaş|1|3
Beşiktaş|Eyüpspor~22.09.2024|Beşiktaş|Eyüpspor|2|1
Kasımpaşa|Trabzonspor~15.08.2026|Kasımpaşa|Trabzonspor|1|1
Kasımpaşa|Trabzonspor~23.01.2026|Trabzonspor|Kasımpaşa|2|1
Kasımpaşa|Trabzonspor~18.08.2025|Kasımpaşa|Trabzonspor|0|1
Kasımpaşa|Trabzonspor~05.05.2025|Kasımpaşa|Trabzonspor|1|1
Kasımpaşa|Trabzonspor~06.12.2024|Trabzonspor|Kasımpaşa|2|2
Konyaspor|Rizespor~15.08.2026|Konyaspor|Rizespor|0|1
Konyaspor|Rizespor~01.05.2026|Rizespor|Konyaspor|3|2
Konyaspor|Rizespor~06.12.2025|Konyaspor|Rizespor|1|1
Konyaspor|Rizespor~10.05.2025|Konyaspor|Rizespor|2|1
Konyaspor|Rizespor~14.12.2024|Rizespor|Konyaspor|1|1
Alanyaspor|Gaziantep~15.08.2026|Gaziantep|Alanyaspor|1|1
Alanyaspor|Gaziantep~04.04.2026|Gaziantep|Alanyaspor|1|1
Alanyaspor|Gaziantep~03.11.2025|Alanyaspor|Gaziantep|0|0
Alanyaspor|Gaziantep~09.05.2025|Gaziantep|Alanyaspor|0|1
Alanyaspor|Gaziantep~14.12.2024|Alanyaspor|Gaziantep|3|0
Fenerbahçe|Gençlerbirliği~15.08.2026|Gençlerbirliği|Fenerbahçe|2|1
Fenerbahçe|Gençlerbirliği~09.02.2026|Fenerbahçe|Gençlerbirliği|3|1
Fenerbahçe|Gençlerbirliği~31.08.2025|Gençlerbirliği|Fenerbahçe|1|3
Galatasaray|Çorum~14.08.2026|Galatasaray|Çorum|2|2
Kayserispor|Konyaspor~17.05.2026|Kayserispor|Konyaspor|2|1
Kayserispor|Konyaspor~20.12.2025|Konyaspor|Kayserispor|1|1
Kayserispor|Konyaspor~08.02.2025|Kayserispor|Konyaspor|3|2
Kayserispor|Konyaspor~31.08.2024|Konyaspor|Kayserispor|0|0
Kayserispor|Konyaspor~18.05.2024|Kayserispor|Konyaspor|2|2
Antalyaspor|Kocaelispor~17.05.2026|Antalyaspor|Kocaelispor|1|0
Antalyaspor|Kocaelispor~19.12.2025|Kocaelispor|Antalyaspor|2|1
Alanyaspor|Karagumruk~16.05.2026|Karagumruk|Alanyaspor|2|1
Alanyaspor|Karagumruk~21.12.2025|Alanyaspor|Karagumruk|2|0
Alanyaspor|Karagumruk~25.02.2024|Karagumruk|Alanyaspor|1|1
Alanyaspor|Karagumruk~06.10.2023|Alanyaspor|Karagumruk|2|1
Alanyaspor|Karagumruk~22.01.2023|Alanyaspor|Karagumruk|2|2
Beşiktaş|Rizespor~15.05.2026|Rizespor|Beşiktaş|2|2
Beşiktaş|Rizespor~20.12.2025|Beşiktaş|Rizespor|1|0
Beşiktaş|Rizespor~25.05.2025|Beşiktaş|Rizespor|1|2
Beşiktaş|Rizespor~03.01.2025|Rizespor|Beşiktaş|1|1
Beşiktaş|Rizespor~03.05.2024|Beşiktaş|Rizespor|3|2
Alanyaspor|Kayserispor~09.05.2026|Alanyaspor|Kayserispor|3|1
Alanyaspor|Kayserispor~13.12.2025|Kayserispor|Alanyaspor|0|0
Alanyaspor|Kayserispor~03.05.2025|Alanyaspor|Kayserispor|1|1
Alanyaspor|Kayserispor~08.12.2024|Kayserispor|Alanyaspor|2|0
Alanyaspor|Kayserispor~16.03.2024|Alanyaspor|Kayserispor|1|0
Antalyaspor|Galatasaray~09.05.2026|Galatasaray|Antalyaspor|4|2
Antalyaspor|Galatasaray~13.12.2025|Antalyaspor|Galatasaray|1|4
Antalyaspor|Galatasaray~14.03.2025|Galatasaray|Antalyaspor|4|0
Antalyaspor|Galatasaray~19.10.2024|Antalyaspor|Galatasaray|0|3
Antalyaspor|Galatasaray~26.02.2024|Galatasaray|Antalyaspor|2|1
Karagumruk|Kocaelispor~09.05.2026|Kocaelispor|Karagumruk|0|1
Karagumruk|Kocaelispor~14.12.2025|Karagumruk|Kocaelispor|1|1
Alanyaspor|Antalyaspor~03.05.2026|Antalyaspor|Alanyaspor|0|0
Alanyaspor|Antalyaspor~08.12.2025|Alanyaspor|Antalyaspor|0|0
Alanyaspor|Antalyaspor~28.03.2025|Antalyaspor|Alanyaspor|2|1
Alanyaspor|Antalyaspor~27.10.2024|Alanyaspor|Antalyaspor|1|2
Alanyaspor|Antalyaspor~24.05.2024|Alanyaspor|Antalyaspor|1|1
Gençlerbirliği|Karagumruk~03.05.2026|Karagumruk|Gençlerbirliği|1|0
Gençlerbirliği|Karagumruk~07.12.2025|Gençlerbirliği|Karagumruk|3|0
Kasımpaşa|Kocaelispor~03.05.2026|Kasımpaşa|Kocaelispor|1|1
Kasımpaşa|Kocaelispor~07.12.2025|Kocaelispor|Kasımpaşa|0|0
Eyüpspor|Kayserispor~03.05.2026|Kayserispor|Eyüpspor|1|1
Eyüpspor|Kayserispor~06.12.2025|Eyüpspor|Kayserispor|1|1
Eyüpspor|Kayserispor~16.02.2025|Eyüpspor|Kayserispor|1|1
Eyüpspor|Kayserispor~15.09.2024|Kayserispor|Eyüpspor|2|2
Başakşehir|Fenerbahçe~02.05.2026|Fenerbahçe|Başakşehir|3|1
Başakşehir|Fenerbahçe~06.12.2025|Başakşehir|Fenerbahçe|1|1
Başakşehir|Fenerbahçe~09.05.2025|Başakşehir|Fenerbahçe|1|4
Başakşehir|Fenerbahçe~15.12.2024|Fenerbahçe|Başakşehir|3|1
Başakşehir|Fenerbahçe~24.01.2024|Başakşehir|Fenerbahçe|0|1
Galatasaray|Samsunspor~02.05.2026|Samsunspor|Galatasaray|4|1
Galatasaray|Samsunspor~05.12.2025|Galatasaray|Samsunspor|3|2
Galatasaray|Samsunspor~11.04.2025|Samsunspor|Galatasaray|0|2
Galatasaray|Samsunspor~10.11.2024|Galatasaray|Samsunspor|3|2
Galatasaray|Samsunspor~02.02.2024|Samsunspor|Galatasaray|0|2
Göztepe|Trabzonspor~02.05.2026|Trabzonspor|Göztepe|1|1
Göztepe|Trabzonspor~07.12.2025|Göztepe|Trabzonspor|1|2
Göztepe|Trabzonspor~29.03.2025|Trabzonspor|Göztepe|1|1
Göztepe|Trabzonspor~26.10.2024|Göztepe|Trabzonspor|2|1
Göztepe|Trabzonspor~12.03.2022|Trabzonspor|Göztepe|4|2
Beşiktaş|Gaziantep~01.05.2026|Gaziantep|Beşiktaş|0|2
Beşiktaş|Gaziantep~08.12.2025|Beşiktaş|Gaziantep|2|2
Beşiktaş|Gaziantep~10.03.2025|Beşiktaş|Gaziantep|1|2
Beşiktaş|Gaziantep~06.10.2024|Gaziantep|Beşiktaş|1|1
Beşiktaş|Gaziantep~11.03.2024|Gaziantep|Beşiktaş|2|0
Alanyaspor|Samsunspor~27.04.2026|Alanyaspor|Samsunspor|2|3
Alanyaspor|Samsunspor~01.12.2025|Samsunspor|Alanyaspor|1|1
Alanyaspor|Samsunspor~21.04.2025|Alanyaspor|Samsunspor|1|0
Alanyaspor|Samsunspor~24.11.2024|Samsunspor|Alanyaspor|1|1
Alanyaspor|Samsunspor~18.05.2024|Samsunspor|Alanyaspor|1|1
Beşiktaş|Karagumruk~27.04.2026|Beşiktaş|Karagumruk|0|0
Beşiktaş|Karagumruk~30.11.2025|Karagumruk|Beşiktaş|0|2
Beşiktaş|Karagumruk~13.01.2024|Beşiktaş|Karagumruk|3|0
Beşiktaş|Karagumruk~14.08.2023|Karagumruk|Beşiktaş|0|1
Beşiktaş|Karagumruk~31.01.2023|Karagumruk|Beşiktaş|1|1
Gençlerbirliği|Kocaelispor~26.04.2026|Gençlerbirliği|Kocaelispor|1|0
Gençlerbirliği|Kocaelispor~28.11.2025|Kocaelispor|Gençlerbirliği|1|0
Kayserispor|Rizespor~25.04.2026|Kayserispor|Rizespor|2|0
Kayserispor|Rizespor~29.11.2025|Rizespor|Kayserispor|0|1
Kayserispor|Rizespor~27.04.2025|Kayserispor|Rizespor|1|0
Kayserispor|Rizespor~01.12.2024|Rizespor|Kayserispor|3|0
Kayserispor|Rizespor~02.03.2024|Rizespor|Kayserispor|3|0
Antalyaspor|Göztepe~25.04.2026|Göztepe|Antalyaspor|2|0
Antalyaspor|Göztepe~30.11.2025|Antalyaspor|Göztepe|1|2
Antalyaspor|Göztepe~19.01.2025|Göztepe|Antalyaspor|1|0
Antalyaspor|Göztepe~10.08.2024|Antalyaspor|Göztepe|0|0
Antalyaspor|Göztepe~09.01.2022|Göztepe|Antalyaspor|4|0
Gaziantep|Kayserispor~20.04.2026|Gaziantep|Kayserispor|3|0
Gaziantep|Kayserispor~22.11.2025|Kayserispor|Gaziantep|0|3
Gaziantep|Kayserispor~15.03.2025|Gaziantep|Kayserispor|1|0
Gaziantep|Kayserispor~19.10.2024|Kayserispor|Gaziantep|2|2
Gaziantep|Kayserispor~03.02.2024|Gaziantep|Kayserispor|1|1
Alanyaspor|Kasımpaşa~19.04.2026|Kasımpaşa|Alanyaspor|1|0
Alanyaspor|Kasımpaşa~23.11.2025|Alanyaspor|Kasımpaşa|1|2
Alanyaspor|Kasımpaşa~15.03.2025|Kasımpaşa|Alanyaspor|2|1
Alanyaspor|Kasımpaşa~20.10.2024|Alanyaspor|Kasımpaşa|1|2
Alanyaspor|Kasımpaşa~04.02.2024|Kasımpaşa|Alanyaspor|2|1
Beşiktaş|Samsunspor~19.04.2026|Samsunspor|Beşiktaş|2|1
Beşiktaş|Samsunspor~23.11.2025|Beşiktaş|Samsunspor|1|1
Beşiktaş|Samsunspor~18.01.2025|Beşiktaş|Samsunspor|0|0
Beşiktaş|Samsunspor~11.08.2024|Samsunspor|Beşiktaş|0|2
Beşiktaş|Samsunspor~13.04.2024|Beşiktaş|Samsunspor|1|1
Eyüpspor|Karagumruk~18.04.2026|Karagumruk|Eyüpspor|1|2
Eyüpspor|Karagumruk~22.11.2025|Eyüpspor|Karagumruk|1|1
Antalyaspor|Konyaspor~17.04.2026|Antalyaspor|Konyaspor|0|2
Antalyaspor|Konyaspor~24.11.2025|Konyaspor|Antalyaspor|0|0
Antalyaspor|Konyaspor~02.05.2025|Antalyaspor|Konyaspor|1|0
Antalyaspor|Konyaspor~07.12.2024|Konyaspor|Antalyaspor|1|1
Antalyaspor|Konyaspor~21.01.2024|Konyaspor|Antalyaspor|1|1
Eyüpspor|Samsunspor~13.04.2026|Eyüpspor|Samsunspor|1|2
Eyüpspor|Samsunspor~09.11.2025|Samsunspor|Eyüpspor|1|0
Eyüpspor|Samsunspor~04.05.2025|Samsunspor|Eyüpspor|3|0
Eyüpspor|Samsunspor~08.12.2024|Eyüpspor|Samsunspor|3|0
Karagumruk|Konyaspor~12.04.2026|Konyaspor|Karagumruk|3|0
Karagumruk|Konyaspor~09.11.2025|Karagumruk|Konyaspor|2|0
Karagumruk|Konyaspor~15.03.2024|Karagumruk|Konyaspor|1|1
Karagumruk|Konyaspor~05.11.2023|Konyaspor|Karagumruk|1|1
Karagumruk|Konyaspor~03.06.2023|Konyaspor|Karagumruk|1|1
Göztepe|Kasımpaşa~12.04.2026|Göztepe|Kasımpaşa|3|3
Göztepe|Kasımpaşa~08.11.2025|Kasımpaşa|Göztepe|0|2
Göztepe|Kasımpaşa~30.05.2025|Kasımpaşa|Göztepe|1|2
Göztepe|Kasımpaşa~13.01.2025|Göztepe|Kasımpaşa|5|0
Göztepe|Kasımpaşa~05.03.2022|Göztepe|Kasımpaşa|2|3
Alanyaspor|Trabzonspor~11.04.2026|Alanyaspor|Trabzonspor|1|1
Alanyaspor|Trabzonspor~08.11.2025|Trabzonspor|Alanyaspor|1|1
Alanyaspor|Trabzonspor~27.04.2025|Trabzonspor|Alanyaspor|4|3
Alanyaspor|Trabzonspor~30.11.2024|Alanyaspor|Trabzonspor|2|1
Alanyaspor|Trabzonspor~04.03.2024|Alanyaspor|Trabzonspor|3|1
Fenerbahçe|Kayserispor~11.04.2026|Kayserispor|Fenerbahçe|0|4
Fenerbahçe|Kayserispor~09.11.2025|Fenerbahçe|Kayserispor|4|2
Fenerbahçe|Kayserispor~20.04.2025|Fenerbahçe|Kayserispor|3|3
Fenerbahçe|Kayserispor~23.11.2024|Kayserispor|Fenerbahçe|2|6
Fenerbahçe|Kayserispor~12.05.2024|Fenerbahçe|Kayserispor|3|0
Antalyaspor|Beşiktaş~10.04.2026|Beşiktaş|Antalyaspor|4|2
Antalyaspor|Beşiktaş~08.11.2025|Antalyaspor|Beşiktaş|1|3
Antalyaspor|Beşiktaş~26.01.2025|Antalyaspor|Beşiktaş|1|1
Antalyaspor|Beşiktaş~18.08.2024|Beşiktaş|Antalyaspor|4|2
Antalyaspor|Beşiktaş~16.03.2024|Beşiktaş|Antalyaspor|1|2
Karagumruk|Rizespor~05.04.2026|Karagumruk|Rizespor|2|1
Karagumruk|Rizespor~03.11.2025|Rizespor|Karagumruk|1|0
Karagumruk|Rizespor~28.01.2024|Karagumruk|Rizespor|4|0
Karagumruk|Rizespor~01.09.2023|Rizespor|Karagumruk|1|0
Karagumruk|Rizespor~15.01.2022|Karagumruk|Rizespor|2|0
Konyaspor|Samsunspor~05.04.2026|Samsunspor|Konyaspor|2|2
Konyaspor|Samsunspor~02.11.2025|Konyaspor|Samsunspor|1|3
Konyaspor|Samsunspor~16.02.2025|Konyaspor|Samsunspor|0|1
Konyaspor|Samsunspor~14.09.2024|Samsunspor|Konyaspor|0|1
Konyaspor|Samsunspor~12.05.2024|Konyaspor|Samsunspor|3|0
Antalyaspor|Eyüpspor~05.04.2026|Antalyaspor|Eyüpspor|3|0
Antalyaspor|Eyüpspor~03.11.2025|Eyüpspor|Antalyaspor|0|1
Antalyaspor|Eyüpspor~24.05.2025|Eyüpspor|Antalyaspor|2|1
Antalyaspor|Eyüpspor~04.01.2025|Antalyaspor|Eyüpspor|1|4
Kasımpaşa|Kayserispor~04.04.2026|Kasımpaşa|Kayserispor|2|0
Kasımpaşa|Kayserispor~02.11.2025|Kayserispor|Kasımpaşa|3|2
Kasımpaşa|Kayserispor~13.04.2025|Kayserispor|Kasımpaşa|1|0
Kasımpaşa|Kayserispor~08.11.2024|Kasımpaşa|Kayserispor|1|2
Kasımpaşa|Kayserispor~03.04.2024|Kayserispor|Kasımpaşa|0|2
Karagumruk|Kayserispor~19.03.2026|Kayserispor|Karagumruk|1|0
Karagumruk|Kayserispor~24.10.2025|Karagumruk|Kayserispor|2|2
Karagumruk|Kayserispor~04.05.2024|Kayserispor|Karagumruk|2|2
Karagumruk|Kayserispor~10.01.2024|Karagumruk|Kayserispor|4|1
Karagumruk|Kayserispor~30.05.2023|Karagumruk|Kayserispor|2|0
Antalyaspor|Başakşehir~18.03.2026|Başakşehir|Antalyaspor|0|0
Antalyaspor|Başakşehir~26.10.2025|Antalyaspor|Başakşehir|0|4
Antalyaspor|Başakşehir~09.02.2025|Antalyaspor|Başakşehir|0|0
Antalyaspor|Başakşehir~01.09.2024|Başakşehir|Antalyaspor|5|2
Antalyaspor|Başakşehir~09.03.2024|Başakşehir|Antalyaspor|1|0
Eyüpspor|Trabzonspor~18.03.2026|Eyüpspor|Trabzonspor|0|1
Eyüpspor|Trabzonspor~25.10.2025|Trabzonspor|Eyüpspor|2|0
Eyüpspor|Trabzonspor~10.02.2025|Trabzonspor|Eyüpspor|1|0
Eyüpspor|Trabzonspor~01.09.2024|Eyüpspor|Trabzonspor|0|0
Beşiktaş|Gençlerbirliği~15.03.2026|Gençlerbirliği|Beşiktaş|0|2
Beşiktaş|Gençlerbirliği~18.10.2025|Beşiktaş|Gençlerbirliği|1|2
Kayserispor|Samsunspor~15.03.2026|Samsunspor|Kayserispor|2|1
Kayserispor|Samsunspor~19.10.2025|Kayserispor|Samsunspor|1|3
Kayserispor|Samsunspor~01.06.2025|Samsunspor|Kayserispor|2|1
Kayserispor|Samsunspor~11.01.2025|Kayserispor|Samsunspor|0|1
Kayserispor|Samsunspor~25.01.2024|Samsunspor|Kayserispor|2|0
Antalyaspor|Gaziantep~13.03.2026|Antalyaspor|Gaziantep|1|4
Antalyaspor|Gaziantep~19.10.2025|Gaziantep|Antalyaspor|3|2
Antalyaspor|Gaziantep~18.05.2025|Antalyaspor|Gaziantep|0|0
Antalyaspor|Gaziantep~22.12.2024|Gaziantep|Antalyaspor|2|0
Antalyaspor|Gaziantep~04.03.2024|Antalyaspor|Gaziantep|1|0
Fenerbahçe|Karagumruk~13.03.2026|Karagumruk|Fenerbahçe|2|0
Fenerbahçe|Karagumruk~19.10.2025|Fenerbahçe|Karagumruk|2|1
Fenerbahçe|Karagumruk~14.04.2024|Karagumruk|Fenerbahçe|1|2
Fenerbahçe|Karagumruk~26.11.2023|Fenerbahçe|Karagumruk|2|1
Fenerbahçe|Karagumruk~10.04.2023|Karagumruk|Fenerbahçe|1|2
Eyüpspor|Kocaelispor~09.03.2026|Eyüpspor|Kocaelispor|0|1
Eyüpspor|Kocaelispor~04.10.2025|Kocaelispor|Eyüpspor|1|0
Kayserispor|Trabzonspor~09.03.2026|Kayserispor|Trabzonspor|1|3
Kayserispor|Trabzonspor~03.10.2025|Trabzonspor|Kayserispor|4|0
Kayserispor|Trabzonspor~01.02.2025|Kayserispor|Trabzonspor|0|0
Kayserispor|Trabzonspor~19.09.2024|Trabzonspor|Kayserispor|2|2
Kayserispor|Trabzonspor~20.04.2024|Kayserispor|Trabzonspor|1|2
Gaziantep|Karagumruk~08.03.2026|Gaziantep|Karagumruk|1|1
Gaziantep|Karagumruk~05.10.2025|Karagumruk|Gaziantep|0|2
Gaziantep|Karagumruk~18.05.2024|Gaziantep|Karagumruk|3|1
Gaziantep|Karagumruk~23.12.2023|Karagumruk|Gaziantep|0|3
Gaziantep|Karagumruk~07.05.2023|Gaziantep|Karagumruk|0|3
Antalyaspor|Rizespor~08.03.2026|Rizespor|Antalyaspor|1|0
Antalyaspor|Rizespor~03.10.2025|Antalyaspor|Rizespor|2|5
Antalyaspor|Rizespor~08.03.2025|Antalyaspor|Rizespor|2|1
Antalyaspor|Rizespor~04.10.2024|Rizespor|Antalyaspor|2|1
Antalyaspor|Rizespor~14.04.2024|Rizespor|Antalyaspor|3|0
Başakşehir|Göztepe~07.03.2026|Başakşehir|Göztepe|2|1
Başakşehir|Göztepe~05.10.2025|Göztepe|Başakşehir|1|0
Başakşehir|Göztepe~28.04.2025|Göztepe|Başakşehir|4|1
Başakşehir|Göztepe~30.11.2024|Başakşehir|Göztepe|4|1
Başakşehir|Göztepe~22.01.2022|Başakşehir|Göztepe|1|2
Beşiktaş|Galatasaray~07.03.2026|Beşiktaş|Galatasaray|0|1
Beşiktaş|Galatasaray~04.10.2025|Galatasaray|Beşiktaş|1|1
Beşiktaş|Galatasaray~29.03.2025|Beşiktaş|Galatasaray|2|1
Beşiktaş|Galatasaray~28.10.2024|Galatasaray|Beşiktaş|2|1
Beşiktaş|Galatasaray~03.03.2024|Beşiktaş|Galatasaray|0|1
Gençlerbirliği|Kayserispor~01.03.2026|Gençlerbirliği|Kayserispor|0|0
Gençlerbirliği|Kayserispor~28.09.2025|Kayserispor|Gençlerbirliği|1|1
Antalyaspor|Fenerbahçe~01.03.2026|Antalyaspor|Fenerbahçe|2|2
Antalyaspor|Fenerbahçe~28.09.2025|Fenerbahçe|Antalyaspor|2|0
Antalyaspor|Fenerbahçe~02.03.2025|Fenerbahçe|Antalyaspor|3|0
Antalyaspor|Fenerbahçe~29.09.2024|Antalyaspor|Fenerbahçe|0|2
Antalyaspor|Fenerbahçe~03.02.2024|Antalyaspor|Fenerbahçe|0|2
Gaziantep|Samsunspor~01.03.2026|Samsunspor|Gaziantep|0|0
Gaziantep|Samsunspor~27.09.2025|Gaziantep|Samsunspor|2|2
Gaziantep|Samsunspor~24.01.2025|Samsunspor|Gaziantep|2|1
Gaziantep|Samsunspor~18.08.2024|Gaziantep|Samsunspor|0|1
Gaziantep|Samsunspor~18.02.2024|Gaziantep|Samsunspor|1|1
Kasımpaşa|Rizespor~28.02.2026|Kasımpaşa|Rizespor|0|3
Kasımpaşa|Rizespor~28.09.2025|Rizespor|Kasımpaşa|1|2
Kasımpaşa|Rizespor~09.02.2025|Kasımpaşa|Rizespor|3|2
Kasımpaşa|Rizespor~31.08.2024|Rizespor|Kasımpaşa|0|1
Kasımpaşa|Rizespor~18.05.2024|Rizespor|Kasımpaşa|0|0
Alanyaspor|Galatasaray~28.02.2026|Galatasaray|Alanyaspor|3|1
Alanyaspor|Galatasaray~26.09.2025|Alanyaspor|Galatasaray|0|1
Alanyaspor|Galatasaray~09.03.2025|Alanyaspor|Galatasaray|1|2
Alanyaspor|Galatasaray~06.10.2024|Galatasaray|Alanyaspor|1|0
Alanyaspor|Galatasaray~15.04.2024|Alanyaspor|Galatasaray|0|4
Karagumruk|Trabzonspor~27.02.2026|Trabzonspor|Karagumruk|3|1
Karagumruk|Trabzonspor~27.09.2025|Karagumruk|Trabzonspor|3|4
Karagumruk|Trabzonspor~09.03.2024|Trabzonspor|Karagumruk|5|1
Karagumruk|Trabzonspor~29.10.2023|Karagumruk|Trabzonspor|0|0
Karagumruk|Trabzonspor~22.05.2023|Trabzonspor|Karagumruk|4|1
Fenerbahçe|Kasımpaşa~23.02.2026|Fenerbahçe|Kasımpaşa|1|1
Fenerbahçe|Kasımpaşa~21.09.2025|Kasımpaşa|Fenerbahçe|1|1
Fenerbahçe|Kasımpaşa~16.02.2025|Fenerbahçe|Kasımpaşa|3|1
Fenerbahçe|Kasımpaşa~15.09.2024|Kasımpaşa|Fenerbahçe|0|2
Fenerbahçe|Kasımpaşa~24.02.2024|Fenerbahçe|Kasımpaşa|2|1
Antalyaspor|Kayserispor~22.02.2026|Kayserispor|Antalyaspor|1|0
Antalyaspor|Kayserispor~20.09.2025|Antalyaspor|Kayserispor|1|1
Antalyaspor|Kayserispor~12.05.2025|Kayserispor|Antalyaspor|3|1
Antalyaspor|Kayserispor~15.12.2024|Antalyaspor|Kayserispor|2|0
Antalyaspor|Kayserispor~29.01.2024|Kayserispor|Antalyaspor|1|1
Beşiktaş|Göztepe~22.02.2026|Beşiktaş|Göztepe|4|0
Beşiktaş|Göztepe~19.09.2025|Göztepe|Beşiktaş|3|0
Beşiktaş|Göztepe~19.04.2025|Göztepe|Beşiktaş|1|1
Beşiktaş|Göztepe~24.11.2024|Beşiktaş|Göztepe|2|4
Beşiktaş|Göztepe~15.05.2022|Göztepe|Beşiktaş|0|2
Karagumruk|Samsunspor~22.02.2026|Karagumruk|Samsunspor|0|0
Karagumruk|Samsunspor~21.09.2025|Samsunspor|Karagumruk|3|2
Karagumruk|Samsunspor~25.05.2024|Karagumruk|Samsunspor|3|1
Karagumruk|Samsunspor~06.01.2024|Samsunspor|Karagumruk|1|0
Eyüpspor|Gençlerbirliği~21.02.2026|Eyüpspor|Gençlerbirliği|1|0
Eyüpspor|Gençlerbirliği~20.09.2025|Gençlerbirliği|Eyüpspor|1|0
Alanyaspor|Başakşehir~21.02.2026|Alanyaspor|Başakşehir|1|2
Alanyaspor|Başakşehir~21.09.2025|Başakşehir|Alanyaspor|1|1
Alanyaspor|Başakşehir~25.01.2025|Alanyaspor|Başakşehir|5|4
Alanyaspor|Başakşehir~18.08.2024|Başakşehir|Alanyaspor|4|2
Alanyaspor|Başakşehir~13.01.2024|Başakşehir|Alanyaspor|3|2
Karagumruk|Kasımpaşa~16.02.2026|Kasımpaşa|Karagumruk|3|2
Karagumruk|Kasımpaşa~13.09.2025|Karagumruk|Kasımpaşa|0|1
Karagumruk|Kasımpaşa~16.02.2024|Kasımpaşa|Karagumruk|1|1
Karagumruk|Kasımpaşa~01.10.2023|Karagumruk|Kasımpaşa|2|3
Karagumruk|Kasımpaşa~06.06.2023|Karagumruk|Kasımpaşa|3|0
Göztepe|Kayserispor~15.02.2026|Göztepe|Kayserispor|0|0
Göztepe|Kayserispor~14.09.2025|Kayserispor|Göztepe|1|1
Göztepe|Kayserispor~23.02.2025|Kayserispor|Göztepe|1|0
Göztepe|Kayserispor~23.09.2024|Göztepe|Kayserispor|3|0
Göztepe|Kayserispor~09.04.2022|Göztepe|Kayserispor|1|2
Gençlerbirliği|Rizespor~14.02.2026|Gençlerbirliği|Rizespor|2|2
Gençlerbirliği|Rizespor~15.09.2025|Rizespor|Gençlerbirliği|1|0
Alanyaspor|Konyaspor~14.02.2026|Alanyaspor|Konyaspor|2|1
Alanyaspor|Konyaspor~13.09.2025|Konyaspor|Alanyaspor|1|2
Alanyaspor|Konyaspor~25.05.2025|Konyaspor|Alanyaspor|1|2
Alanyaspor|Konyaspor~03.01.2025|Alanyaspor|Konyaspor|2|1
Alanyaspor|Konyaspor~20.04.2024|Konyaspor|Alanyaspor|0|2
Fenerbahçe|Trabzonspor~14.02.2026|Trabzonspor|Fenerbahçe|2|3
Fenerbahçe|Trabzonspor~14.09.2025|Fenerbahçe|Trabzonspor|1|0
Fenerbahçe|Trabzonspor~06.04.2025|Fenerbahçe|Trabzonspor|4|1
Fenerbahçe|Trabzonspor~03.11.2024|Trabzonspor|Fenerbahçe|2|3
Fenerbahçe|Trabzonspor~17.03.2024|Trabzonspor|Fenerbahçe|2|3
Antalyaspor|Samsunspor~13.02.2026|Antalyaspor|Samsunspor|3|1
Antalyaspor|Samsunspor~13.09.2025|Samsunspor|Antalyaspor|1|2
Antalyaspor|Samsunspor~05.04.2025|Antalyaspor|Samsunspor|2|1
Antalyaspor|Samsunspor~04.11.2024|Samsunspor|Antalyaspor|2|0
Antalyaspor|Samsunspor~12.02.2024|Samsunspor|Antalyaspor|2|0
Eyüpspor|Galatasaray~13.02.2026|Galatasaray|Eyüpspor|5|1
Eyüpspor|Galatasaray~13.09.2025|Eyüpspor|Galatasaray|0|2
Eyüpspor|Galatasaray~27.04.2025|Eyüpspor|Galatasaray|1|5
Eyüpspor|Galatasaray~01.12.2024|Galatasaray|Eyüpspor|2|2
Kayserispor|Kocaelispor~09.02.2026|Kayserispor|Kocaelispor|1|2
Kayserispor|Kocaelispor~30.08.2025|Kocaelispor|Kayserispor|1|1
Gaziantep|Kasımpaşa~09.02.2026|Gaziantep|Kasımpaşa|2|1
Gaziantep|Kasımpaşa~30.08.2025|Kasımpaşa|Gaziantep|2|3
Gaziantep|Kasımpaşa~24.05.2025|Gaziantep|Kasımpaşa|2|2
Gaziantep|Kasımpaşa~05.01.2025|Kasımpaşa|Gaziantep|2|2
Gaziantep|Kasımpaşa~21.04.2024|Gaziantep|Kasımpaşa|2|0
Başakşehir|Eyüpspor~08.02.2026|Eyüpspor|Başakşehir|1|2
Başakşehir|Eyüpspor~31.08.2025|Başakşehir|Eyüpspor|0|0
Başakşehir|Eyüpspor~31.03.2025|Eyüpspor|Başakşehir|1|3
Başakşehir|Eyüpspor~28.10.2024|Başakşehir|Eyüpspor|1|1
Göztepe|Konyaspor~08.02.2026|Konyaspor|Göztepe|0|0
Göztepe|Konyaspor~29.08.2025|Göztepe|Konyaspor|1|1
Göztepe|Konyaspor~12.04.2025|Konyaspor|Göztepe|1|0
Göztepe|Konyaspor~10.11.2024|Göztepe|Konyaspor|2|0
Göztepe|Konyaspor~03.04.2022|Konyaspor|Göztepe|3|0
Galatasaray|Rizespor~08.02.2026|Rizespor|Galatasaray|0|3
Galatasaray|Rizespor~30.08.2025|Galatasaray|Rizespor|3|1
Galatasaray|Rizespor~17.02.2025|Rizespor|Galatasaray|1|2
Galatasaray|Rizespor~14.09.2024|Galatasaray|Rizespor|5|0
Galatasaray|Rizespor~08.03.2024|Galatasaray|Rizespor|6|2
Antalyaspor|Karagumruk~07.02.2026|Karagumruk|Antalyaspor|1|0
Antalyaspor|Karagumruk~30.08.2025|Antalyaspor|Karagumruk|1|2
Antalyaspor|Karagumruk~29.04.2024|Karagumruk|Antalyaspor|4|1
Antalyaspor|Karagumruk~09.12.2023|Antalyaspor|Karagumruk|2|1
Antalyaspor|Karagumruk~29.04.2023|Karagumruk|Antalyaspor|0|1
Fenerbahçe|Kocaelispor~02.02.2026|Kocaelispor|Fenerbahçe|0|2
Fenerbahçe|Kocaelispor~23.08.2025|Fenerbahçe|Kocaelispor|3|1
Gaziantep|Gençlerbirliği~01.02.2026|Gençlerbirliği|Gaziantep|2|1
Gaziantep|Gençlerbirliği~23.08.2025|Gaziantep|Gençlerbirliği|2|1
Galatasaray|Kayserispor~01.02.2026|Galatasaray|Kayserispor|4|0
Galatasaray|Kayserispor~24.08.2025|Kayserispor|Galatasaray|0|4
Galatasaray|Kayserispor~18.05.2025|Galatasaray|Kayserispor|3|0
Galatasaray|Kayserispor~22.12.2024|Kayserispor|Galatasaray|1|5
Galatasaray|Kayserispor~15.01.2024|Galatasaray|Kayserispor|2|1
Başakşehir|Rizespor~31.01.2026|Başakşehir|Rizespor|2|2
Başakşehir|Rizespor~22.10.2025|Rizespor|Başakşehir|0|0
Başakşehir|Rizespor~18.01.2025|Başakşehir|Rizespor|2|0
Başakşehir|Rizespor~12.08.2024|Rizespor|Başakşehir|1|1
Başakşehir|Rizespor~21.04.2024|Başakşehir|Rizespor|2|0
Beşiktaş|Konyaspor~31.01.2026|Beşiktaş|Konyaspor|2|1
Beşiktaş|Konyaspor~22.10.2025|Konyaspor|Beşiktaş|0|2
Beşiktaş|Konyaspor~15.03.2025|Konyaspor|Beşiktaş|1|0
Beşiktaş|Konyaspor~20.10.2024|Beşiktaş|Konyaspor|2|0
Beşiktaş|Konyaspor~19.02.2024|Beşiktaş|Konyaspor|2|0
Göztepe|Karagumruk~31.01.2026|Göztepe|Karagumruk|2|1
Göztepe|Karagumruk~22.08.2025|Karagumruk|Göztepe|0|2
Göztepe|Karagumruk~07.05.2022|Karagumruk|Göztepe|3|1
Göztepe|Karagumruk~19.12.2021|Göztepe|Karagumruk|0|1
Antalyaspor|Trabzonspor~30.01.2026|Antalyaspor|Trabzonspor|1|1
Antalyaspor|Trabzonspor~24.08.2025|Trabzonspor|Antalyaspor|1|0
Antalyaspor|Trabzonspor~30.05.2025|Antalyaspor|Trabzonspor|0|2
Antalyaspor|Trabzonspor~12.01.2025|Trabzonspor|Antalyaspor|5|0
Antalyaspor|Trabzonspor~14.01.2024|Antalyaspor|Trabzonspor|1|1
Gaziantep|Konyaspor~25.01.2026|Gaziantep|Konyaspor|1|1
Gaziantep|Konyaspor~17.08.2025|Konyaspor|Gaziantep|3|0
Gaziantep|Konyaspor~28.03.2025|Konyaspor|Gaziantep|1|0
Gaziantep|Konyaspor~27.10.2024|Gaziantep|Konyaspor|3|1
Gaziantep|Konyaspor~24.01.2024|Gaziantep|Konyaspor|1|1
Antalyaspor|Gençlerbirliği~25.01.2026|Antalyaspor|Gençlerbirliği|2|1
Antalyaspor|Gençlerbirliği~17.08.2025|Gençlerbirliği|Antalyaspor|0|1
Başakşehir|Kayserispor~24.01.2026|Kayserispor|Başakşehir|0|3
Başakşehir|Kayserispor~17.08.2025|Başakşehir|Kayserispor|1|1
Başakşehir|Kayserispor~08.03.2025|Kayserispor|Başakşehir|3|1
Başakşehir|Kayserispor~05.10.2024|Başakşehir|Kayserispor|1|1
Başakşehir|Kayserispor~19.02.2024|Başakşehir|Kayserispor|2|3
Galatasaray|Karagumruk~24.01.2026|Karagumruk|Galatasaray|1|3
Galatasaray|Karagumruk~15.08.2025|Galatasaray|Karagumruk|3|0
Galatasaray|Karagumruk~12.05.2024|Karagumruk|Galatasaray|2|3
Galatasaray|Karagumruk~20.12.2023|Galatasaray|Karagumruk|1|0
Galatasaray|Karagumruk~23.04.2023|Galatasaray|Karagumruk|3|3
Eyüpspor|Konyaspor~19.01.2026|Konyaspor|Eyüpspor|1|1
Eyüpspor|Konyaspor~10.08.2025|Eyüpspor|Konyaspor|1|4
Eyüpspor|Konyaspor~09.03.2025|Eyüpspor|Konyaspor|2|1
Eyüpspor|Konyaspor~06.10.2024|Konyaspor|Eyüpspor|2|1
Beşiktaş|Kayserispor~19.01.2026|Beşiktaş|Kayserispor|1|0
Beşiktaş|Kayserispor~24.09.2025|Kayserispor|Beşiktaş|0|4
Beşiktaş|Kayserispor~01.03.2025|Beşiktaş|Kayserispor|2|0
Beşiktaş|Kayserispor~30.09.2024|Kayserispor|Beşiktaş|0|3
Beşiktaş|Kayserispor~12.02.2024|Kayserispor|Beşiktaş|0|0
Antalyaspor|Kasımpaşa~18.01.2026|Kasımpaşa|Antalyaspor|0|0
Antalyaspor|Kasımpaşa~09.08.2025|Antalyaspor|Kasımpaşa|2|1
Antalyaspor|Kasımpaşa~22.02.2025|Antalyaspor|Kasımpaşa|2|1
Antalyaspor|Kasımpaşa~22.09.2024|Kasımpaşa|Antalyaspor|0|0
Antalyaspor|Kasımpaşa~12.05.2024|Kasımpaşa|Antalyaspor|3|1
Gençlerbirliği|Samsunspor~18.01.2026|Gençlerbirliği|Samsunspor|1|1
Gençlerbirliği|Samsunspor~09.08.2025|Samsunspor|Gençlerbirliği|2|1
Kocaelispor|Trabzonspor~18.01.2026|Kocaelispor|Trabzonspor|1|2
Kocaelispor|Trabzonspor~11.08.2025|Trabzonspor|Kocaelispor|1|0
Başakşehir|Karagumruk~17.01.2026|Başakşehir|Karagumruk|2|1
Başakşehir|Karagumruk~17.09.2025|Karagumruk|Başakşehir|0|2
Başakşehir|Karagumruk~20.01.2024|Karagumruk|Başakşehir|1|1
Başakşehir|Karagumruk~20.08.2023|Başakşehir|Karagumruk|0|2
Başakşehir|Karagumruk~19.03.2023|Karagumruk|Başakşehir|2|2
Galatasaray|Gaziantep~17.01.2026|Galatasaray|Gaziantep|1|1
Galatasaray|Gaziantep~08.08.2025|Gaziantep|Galatasaray|0|3
Galatasaray|Gaziantep~03.02.2025|Gaziantep|Galatasaray|0|1
Galatasaray|Gaziantep~17.09.2024|Galatasaray|Gaziantep|3|1
Galatasaray|Gaziantep~29.01.2024|Galatasaray|Gaziantep|2|1
Beşiktaş|Bodrumspor~01.06.2025|Bodrumspor|Beşiktaş|0|4
Beşiktaş|Bodrumspor~11.01.2025|Beşiktaş|Bodrumspor|2|1
Hatayspor|Rizespor~31.05.2025|Rizespor|Hatayspor|5|2
Hatayspor|Rizespor~11.01.2025|Hatayspor|Rizespor|1|2
Hatayspor|Rizespor~26.05.2024|Hatayspor|Rizespor|2|0
Hatayspor|Rizespor~06.01.2024|Rizespor|Hatayspor|2|0
Hatayspor|Rizespor~23.01.2022|Hatayspor|Rizespor|0|0
Ad. Demirspor|Gaziantep~31.05.2025|Ad. Demirspor|Gaziantep|2|2
Ad. Demirspor|Gaziantep~12.01.2025|Gaziantep|Ad. Demirspor|1|0
Ad. Demirspor|Gaziantep~12.05.2024|Ad. Demirspor|Gaziantep|1|6
Ad. Demirspor|Gaziantep~19.12.2023|Gaziantep|Ad. Demirspor|2|2
Ad. Demirspor|Gaziantep~09.04.2023|Ad. Demirspor|Gaziantep|3|0
Alanyaspor|Sivasspor~31.05.2025|Alanyaspor|Sivasspor|2|0
Alanyaspor|Sivasspor~12.01.2025|Sivasspor|Alanyaspor|1|1
Alanyaspor|Sivasspor~09.03.2024|Sivasspor|Alanyaspor|1|2
Alanyaspor|Sivasspor~28.10.2023|Alanyaspor|Sivasspor|1|2
Alanyaspor|Sivasspor~31.01.2023|Alanyaspor|Sivasspor|0|3
Fenerbahçe|Hatayspor~26.05.2025|Hatayspor|Fenerbahçe|4|2
Fenerbahçe|Hatayspor~05.01.2025|Fenerbahçe|Hatayspor|2|1
Fenerbahçe|Hatayspor~02.03.2024|Hatayspor|Fenerbahçe|0|2
Fenerbahçe|Hatayspor~22.10.2023|Fenerbahçe|Hatayspor|4|2
Fenerbahçe|Hatayspor~21.05.2023|Hatayspor|Fenerbahçe|0|3
Ad. Demirspor|Başakşehir~25.05.2025|Başakşehir|Ad. Demirspor|2|3
Ad. Demirspor|Başakşehir~04.01.2025|Ad. Demirspor|Başakşehir|0|1
Ad. Demirspor|Başakşehir~26.05.2024|Ad. Demirspor|Başakşehir|2|6
Ad. Demirspor|Başakşehir~06.01.2024|Başakşehir|Ad. Demirspor|0|0
Ad. Demirspor|Başakşehir~03.06.2023|Ad. Demirspor|Başakşehir|2|3
Bodrumspor|Kayserispor~25.05.2025|Kayserispor|Bodrumspor|1|1
Bodrumspor|Kayserispor~05.01.2025|Bodrumspor|Kayserispor|1|1
Bodrumspor|Trabzonspor~18.05.2025|Bodrumspor|Trabzonspor|1|1
Bodrumspor|Trabzonspor~22.12.2024|Trabzonspor|Bodrumspor|1|0
Samsunspor|Sivasspor~18.05.2025|Samsunspor|Sivasspor|1|0
Samsunspor|Sivasspor~21.12.2024|Sivasspor|Samsunspor|0|0
Samsunspor|Sivasspor~14.01.2024|Samsunspor|Sivasspor|2|0
Samsunspor|Sivasspor~13.08.2023|Sivasspor|Samsunspor|1|1
Ad. Demirspor|Hatayspor~17.05.2025|Ad. Demirspor|Hatayspor|0|5
Ad. Demirspor|Hatayspor~23.12.2024|Hatayspor|Ad. Demirspor|1|3
Ad. Demirspor|Hatayspor~27.01.2024|Ad. Demirspor|Hatayspor|0|1
Ad. Demirspor|Hatayspor~03.09.2023|Hatayspor|Ad. Demirspor|3|3
Ad. Demirspor|Hatayspor~05.03.2023|Ad. Demirspor|Hatayspor|3|0
Bodrumspor|Sivasspor~11.05.2025|Sivasspor|Bodrumspor|0|0
Bodrumspor|Sivasspor~13.12.2024|Bodrumspor|Sivasspor|2|0
Ad. Demirspor|Beşiktaş~11.05.2025|Beşiktaş|Ad. Demirspor|4|1
Ad. Demirspor|Beşiktaş~16.12.2024|Ad. Demirspor|Beşiktaş|2|1
Ad. Demirspor|Beşiktaş~23.01.2024|Beşiktaş|Ad. Demirspor|0|0
Ad. Demirspor|Beşiktaş~27.09.2023|Ad. Demirspor|Beşiktaş|4|2
Ad. Demirspor|Beşiktaş~21.05.2023|Ad. Demirspor|Beşiktaş|1|4
Göztepe|Hatayspor~11.05.2025|Göztepe|Hatayspor|1|1
Göztepe|Hatayspor~15.12.2024|Hatayspor|Göztepe|1|1
Göztepe|Hatayspor~14.02.2022|Hatayspor|Göztepe|2|1
Göztepe|Hatayspor~22.09.2021|Göztepe|Hatayspor|0|2
Ad. Demirspor|Göztepe~04.05.2025|Ad. Demirspor|Göztepe|1|2
Ad. Demirspor|Göztepe~07.12.2024|Göztepe|Ad. Demirspor|3|1
Ad. Demirspor|Göztepe~22.05.2022|Ad. Demirspor|Göztepe|7|0
Ad. Demirspor|Göztepe~26.12.2021|Göztepe|Ad. Demirspor|1|1
Galatasaray|Sivasspor~03.05.2025|Galatasaray|Sivasspor|4|1
Galatasaray|Sivasspor~08.12.2024|Sivasspor|Galatasaray|2|3
Galatasaray|Sivasspor~05.05.2024|Galatasaray|Sivasspor|6|1
Galatasaray|Sivasspor~11.01.2024|Sivasspor|Galatasaray|1|1
Galatasaray|Sivasspor~20.05.2023|Galatasaray|Sivasspor|2|0
Başakşehir|Hatayspor~03.05.2025|Hatayspor|Başakşehir|2|4
Başakşehir|Hatayspor~08.12.2024|Başakşehir|Hatayspor|3|0
Başakşehir|Hatayspor~27.04.2024|Hatayspor|Başakşehir|1|2
Başakşehir|Hatayspor~10.12.2023|Başakşehir|Hatayspor|1|0
Başakşehir|Hatayspor~30.04.2023|Başakşehir|Hatayspor|3|0
Ad. Demirspor|Konyaspor~27.04.2025|Konyaspor|Ad. Demirspor|3|1
Ad. Demirspor|Konyaspor~30.11.2024|Ad. Demirspor|Konyaspor|0|1
Ad. Demirspor|Konyaspor~09.03.2024|Konyaspor|Ad. Demirspor|2|2
Ad. Demirspor|Konyaspor~28.10.2023|Ad. Demirspor|Konyaspor|3|0
Ad. Demirspor|Konyaspor~19.04.2023|Konyaspor|Ad. Demirspor|1|2
Antalyaspor|Sivasspor~26.04.2025|Sivasspor|Antalyaspor|2|0
Antalyaspor|Sivasspor~29.11.2024|Antalyaspor|Sivasspor|2|1
Antalyaspor|Sivasspor~24.01.2024|Antalyaspor|Sivasspor|2|1
Antalyaspor|Sivasspor~26.08.2023|Sivasspor|Antalyaspor|1|1
Antalyaspor|Sivasspor~24.04.2023|Antalyaspor|Sivasspor|1|2
Bodrumspor|Samsunspor~26.04.2025|Bodrumspor|Samsunspor|1|2
Bodrumspor|Samsunspor~30.11.2024|Samsunspor|Bodrumspor|4|0
Beşiktaş|Hatayspor~25.04.2025|Beşiktaş|Hatayspor|5|1
Beşiktaş|Hatayspor~02.12.2024|Hatayspor|Beşiktaş|1|1
Beşiktaş|Hatayspor~18.05.2024|Beşiktaş|Hatayspor|2|2
Beşiktaş|Hatayspor~25.12.2023|Hatayspor|Beşiktaş|1|2
Beşiktaş|Hatayspor~19.04.2023|Beşiktaş|Hatayspor|3|0
Kasımpaşa|Sivasspor~19.04.2025|Kasımpaşa|Sivasspor|3|1
Kasımpaşa|Sivasspor~24.11.2024|Sivasspor|Kasımpaşa|0|0
Kasımpaşa|Sivasspor~01.03.2024|Kasımpaşa|Sivasspor|0|0
Kasımpaşa|Sivasspor~22.10.2023|Sivasspor|Kasımpaşa|0|1
Kasımpaşa|Sivasspor~16.05.2023|Sivasspor|Kasımpaşa|1|2
Ad. Demirspor|Trabzonspor~19.04.2025|Ad. Demirspor|Trabzonspor|0|1
Ad. Demirspor|Trabzonspor~25.11.2024|Trabzonspor|Ad. Demirspor|5|0
Ad. Demirspor|Trabzonspor~25.02.2024|Trabzonspor|Ad. Demirspor|1|0
Ad. Demirspor|Trabzonspor~06.10.2023|Ad. Demirspor|Trabzonspor|1|0
Ad. Demirspor|Trabzonspor~12.03.2023|Trabzonspor|Ad. Demirspor|4|1
Bodrumspor|Galatasaray~18.04.2025|Galatasaray|Bodrumspor|2|0
Bodrumspor|Galatasaray~23.11.2024|Bodrumspor|Galatasaray|0|1
Hatayspor|Konyaspor~18.04.2025|Hatayspor|Konyaspor|2|3
Hatayspor|Konyaspor~24.11.2024|Konyaspor|Hatayspor|1|1
Hatayspor|Konyaspor~24.02.2024|Konyaspor|Hatayspor|2|0
Hatayspor|Konyaspor~08.10.2023|Hatayspor|Konyaspor|3|1
Hatayspor|Konyaspor~12.03.2023|Hatayspor|Konyaspor|0|3
Ad. Demirspor|Eyüpspor~14.04.2025|Eyüpspor|Ad. Demirspor|6|0
Ad. Demirspor|Eyüpspor~09.11.2024|Ad. Demirspor|Eyüpspor|0|1
Gaziantep|Hatayspor~13.04.2025|Gaziantep|Hatayspor|2|1
Gaziantep|Hatayspor~09.11.2024|Hatayspor|Gaziantep|3|1
Gaziantep|Hatayspor~05.05.2024|Gaziantep|Hatayspor|1|1
Gaziantep|Hatayspor~10.01.2024|Hatayspor|Gaziantep|0|0
Gaziantep|Hatayspor~01.02.2023|Gaziantep|Hatayspor|4|1
Fenerbahçe|Sivasspor~13.04.2025|Sivasspor|Fenerbahçe|1|3
Fenerbahçe|Sivasspor~10.11.2024|Fenerbahçe|Sivasspor|4|0
Fenerbahçe|Sivasspor~22.04.2024|Sivasspor|Fenerbahçe|2|2
Fenerbahçe|Sivasspor~04.12.2023|Fenerbahçe|Sivasspor|4|1
Fenerbahçe|Sivasspor~29.04.2023|Sivasspor|Fenerbahçe|1|3
Antalyaspor|Bodrumspor~12.04.2025|Bodrumspor|Antalyaspor|0|0
Antalyaspor|Bodrumspor~09.11.2024|Antalyaspor|Bodrumspor|3|2
Alanyaspor|Bodrumspor~06.04.2025|Alanyaspor|Bodrumspor|0|1
Alanyaspor|Bodrumspor~03.11.2024|Bodrumspor|Alanyaspor|0|0
Eyüpspor|Hatayspor~06.04.2025|Hatayspor|Eyüpspor|0|1
Eyüpspor|Hatayspor~03.11.2024|Eyüpspor|Hatayspor|2|0
Rizespor|Sivasspor~05.04.2025|Rizespor|Sivasspor|1|1
Rizespor|Sivasspor~02.11.2024|Sivasspor|Rizespor|2|1
Rizespor|Sivasspor~11.02.2024|Sivasspor|Rizespor|1|0
Rizespor|Sivasspor~23.09.2023|Rizespor|Sivasspor|1|1
Rizespor|Sivasspor~16.05.2022|Rizespor|Sivasspor|1|2
Ad. Demirspor|Kayserispor~04.04.2025|Ad. Demirspor|Kayserispor|0|2
Ad. Demirspor|Kayserispor~02.11.2024|Kayserispor|Ad. Demirspor|0|0
Ad. Demirspor|Kayserispor~13.04.2024|Ad. Demirspor|Kayserispor|0|0
Ad. Demirspor|Kayserispor~26.11.2023|Kayserispor|Ad. Demirspor|1|1
Ad. Demirspor|Kayserispor~23.04.2023|Ad. Demirspor|Kayserispor|5|3
Ad. Demirspor|Sivasspor~29.03.2025|Sivasspor|Ad. Demirspor|5|1
Ad. Demirspor|Sivasspor~25.10.2024|Ad. Demirspor|Sivasspor|2|4
Ad. Demirspor|Sivasspor~16.03.2024|Ad. Demirspor|Sivasspor|4|1
Ad. Demirspor|Sivasspor~05.11.2023|Sivasspor|Ad. Demirspor|1|1
Ad. Demirspor|Sivasspor~28.01.2023|Sivasspor|Ad. Demirspor|1|2
Hatayspor|Kayserispor~28.03.2025|Kayserispor|Hatayspor|5|0
Hatayspor|Kayserispor~26.10.2024|Hatayspor|Kayserispor|0|1
Hatayspor|Kayserispor~10.03.2024|Kayserispor|Hatayspor|1|1
Hatayspor|Kayserispor~27.10.2023|Hatayspor|Kayserispor|1|2
Hatayspor|Kayserispor~19.03.2023|Kayserispor|Hatayspor|3|0
Bodrumspor|Fenerbahçe~28.03.2025|Bodrumspor|Fenerbahçe|2|4
Bodrumspor|Fenerbahçe~27.10.2024|Fenerbahçe|Bodrumspor|2|0
Bodrumspor|Rizespor~16.03.2025|Rizespor|Bodrumspor|0|2
Bodrumspor|Rizespor~21.10.2024|Bodrumspor|Rizespor|0|1
Hatayspor|Sivasspor~16.03.2025|Hatayspor|Sivasspor|3|2
Hatayspor|Sivasspor~20.10.2024|Sivasspor|Hatayspor|3|2
Hatayspor|Sivasspor~17.02.2024|Hatayspor|Sivasspor|1|1
Hatayspor|Sivasspor~30.09.2023|Sivasspor|Hatayspor|0|0
Hatayspor|Sivasspor~02.04.2023|Hatayspor|Sivasspor|0|3
Göztepe|Sivasspor~09.03.2025|Sivasspor|Göztepe|3|1
Göztepe|Sivasspor~05.10.2024|Göztepe|Sivasspor|3|2
Göztepe|Sivasspor~19.01.2022|Göztepe|Sivasspor|2|1
Göztepe|Sivasspor~29.08.2021|Sivasspor|Göztepe|2|2
Ad. Demirspor|Samsunspor~09.03.2025|Samsunspor|Ad. Demirspor|3|2
Ad. Demirspor|Samsunspor~06.10.2024|Ad. Demirspor|Samsunspor|1|3
Ad. Demirspor|Samsunspor~20.04.2024|Samsunspor|Ad. Demirspor|1|1
Ad. Demirspor|Samsunspor~02.12.2023|Ad. Demirspor|Samsunspor|2|3
Hatayspor|Trabzonspor~08.03.2025|Trabzonspor|Hatayspor|1|2
Hatayspor|Trabzonspor~05.10.2024|Hatayspor|Trabzonspor|1|1
Hatayspor|Trabzonspor~12.02.2024|Trabzonspor|Hatayspor|2|0
Hatayspor|Trabzonspor~25.09.2023|Hatayspor|Trabzonspor|3|2
Hatayspor|Trabzonspor~28.01.2023|Hatayspor|Trabzonspor|2|1
Bodrumspor|Kasımpaşa~07.03.2025|Bodrumspor|Kasımpaşa|1|0
Bodrumspor|Kasımpaşa~05.10.2024|Kasımpaşa|Bodrumspor|0|0
Başakşehir|Sivasspor~03.03.2025|Başakşehir|Sivasspor|1|0
Başakşehir|Sivasspor~27.09.2024|Sivasspor|Başakşehir|1|2
Başakşehir|Sivasspor~12.05.2024|Sivasspor|Başakşehir|0|1
Başakşehir|Sivasspor~19.12.2023|Başakşehir|Sivasspor|3|1
Başakşehir|Sivasspor~09.04.2023|Sivasspor|Başakşehir|1|1
Ad. Demirspor|Bodrumspor~01.03.2025|Ad. Demirspor|Bodrumspor|0|0
Ad. Demirspor|Bodrumspor~29.09.2024|Bodrumspor|Ad. Demirspor|3|1
Ad. Demirspor|Alanyaspor~23.02.2025|Alanyaspor|Ad. Demirspor|3|2
Ad. Demirspor|Alanyaspor~22.09.2024|Ad. Demirspor|Alanyaspor|0|2
Ad. Demirspor|Alanyaspor~18.02.2024|Alanyaspor|Ad. Demirspor|3|3
Ad. Demirspor|Alanyaspor~01.10.2023|Ad. Demirspor|Alanyaspor|4|0
Ad. Demirspor|Alanyaspor~06.05.2023|Ad. Demirspor|Alanyaspor|4|2
Konyaspor|Sivasspor~22.02.2025|Sivasspor|Konyaspor|1|1
Konyaspor|Sivasspor~21.09.2024|Konyaspor|Sivasspor|0|0
Konyaspor|Sivasspor~27.04.2024|Sivasspor|Konyaspor|1|0
Konyaspor|Sivasspor~11.12.2023|Konyaspor|Sivasspor|0|1
Konyaspor|Sivasspor~30.05.2023|Sivasspor|Konyaspor|1|0
Bodrumspor|Hatayspor~21.02.2025|Bodrumspor|Hatayspor|1|0
Bodrumspor|Hatayspor~20.09.2024|Hatayspor|Bodrumspor|0|1
Alanyaspor|Hatayspor~16.02.2025|Hatayspor|Alanyaspor|1|0
Alanyaspor|Hatayspor~15.09.2024|Alanyaspor|Hatayspor|0|0
Alanyaspor|Hatayspor~23.01.2024|Hatayspor|Alanyaspor|1|1
Alanyaspor|Hatayspor~27.08.2023|Alanyaspor|Hatayspor|0|0
Alanyaspor|Hatayspor~09.04.2023|Alanyaspor|Hatayspor|3|0
Gaziantep|Sivasspor~15.02.2025|Gaziantep|Sivasspor|2|1
Gaziantep|Sivasspor~14.09.2024|Sivasspor|Gaziantep|3|2
Gaziantep|Sivasspor~21.01.2024|Sivasspor|Gaziantep|2|2
Gaziantep|Sivasspor~20.08.2023|Gaziantep|Sivasspor|1|3
Gaziantep|Sivasspor~22.01.2023|Gaziantep|Sivasspor|1|2
Başakşehir|Bodrumspor~15.02.2025|Başakşehir|Bodrumspor|0|1
Başakşehir|Bodrumspor~14.09.2024|Bodrumspor|Başakşehir|0|1
Ad. Demirspor|Antalyaspor~14.02.2025|Ad. Demirspor|Antalyaspor|1|1
Ad. Demirspor|Antalyaspor~16.09.2024|Antalyaspor|Ad. Demirspor|2|1
Ad. Demirspor|Antalyaspor~17.05.2024|Antalyaspor|Ad. Demirspor|2|1
Ad. Demirspor|Antalyaspor~24.12.2023|Ad. Demirspor|Antalyaspor|2|1
Ad. Demirspor|Antalyaspor~18.03.2023|Ad. Demirspor|Antalyaspor|2|0
Bodrumspor|Göztepe~10.02.2025|Bodrumspor|Göztepe|0|0
Bodrumspor|Göztepe~31.08.2024|Göztepe|Bodrumspor|2|0
Ad. Demirspor|Galatasaray~09.02.2025|Galatasaray|Ad. Demirspor|3|0
Ad. Demirspor|Galatasaray~31.08.2024|Ad. Demirspor|Galatasaray|1|5
Ad. Demirspor|Galatasaray~26.04.2024|Ad. Demirspor|Galatasaray|0|3
Ad. Demirspor|Galatasaray~08.12.2023|Galatasaray|Ad. Demirspor|3|1
Ad. Demirspor|Galatasaray~01.04.2023|Galatasaray|Ad. Demirspor|2|0
Beşiktaş|Sivasspor~08.02.2025|Sivasspor|Beşiktaş|0|2
Beşiktaş|Sivasspor~01.09.2024|Beşiktaş|Sivasspor|2|0
Beşiktaş|Sivasspor~28.01.2024|Sivasspor|Beşiktaş|1|0
Beşiktaş|Sivasspor~03.09.2023|Beşiktaş|Sivasspor|2|0
Beşiktaş|Sivasspor~04.02.2023|Sivasspor|Beşiktaş|1|0
Hatayspor|Samsunspor~07.02.2025|Samsunspor|Hatayspor|2|0
Hatayspor|Samsunspor~01.09.2024|Hatayspor|Samsunspor|0|3
Hatayspor|Samsunspor~17.03.2024|Hatayspor|Samsunspor|3|0
Hatayspor|Samsunspor~04.11.2023|Samsunspor|Hatayspor|2|1
Ad. Demirspor|Kasımpaşa~02.02.2025|Ad. Demirspor|Kasımpaşa|3|5
Ad. Demirspor|Kasımpaşa~25.08.2024|Kasımpaşa|Ad. Demirspor|2|2
Ad. Demirspor|Kasımpaşa~09.02.2024|Ad. Demirspor|Kasımpaşa|1|3
Ad. Demirspor|Kasımpaşa~24.09.2023|Kasımpaşa|Ad. Demirspor|2|1
Ad. Demirspor|Kasımpaşa~15.04.2023|Ad. Demirspor|Kasımpaşa|5|0
Antalyaspor|Hatayspor~01.02.2025|Hatayspor|Antalyaspor|2|3
Antalyaspor|Hatayspor~25.08.2024|Antalyaspor|Hatayspor|3|2
Antalyaspor|Hatayspor~21.04.2024|Antalyaspor|Hatayspor|2|1
Antalyaspor|Hatayspor~01.12.2023|Hatayspor|Antalyaspor|3|3
Antalyaspor|Hatayspor~03.06.2023|Antalyaspor|Hatayspor|3|0
Eyüpspor|Sivasspor~31.01.2025|Eyüpspor|Sivasspor|1|0
Eyüpspor|Sivasspor~24.08.2024|Sivasspor|Eyüpspor|0|1
Bodrumspor|Konyaspor~31.01.2025|Konyaspor|Bodrumspor|3|1
Bodrumspor|Konyaspor~24.08.2024|Bodrumspor|Konyaspor|3|1
Hatayspor|Kasımpaşa~27.01.2025|Kasımpaşa|Hatayspor|5|4
Hatayspor|Kasımpaşa~19.08.2024|Hatayspor|Kasımpaşa|1|1
Hatayspor|Kasımpaşa~20.01.2024|Kasımpaşa|Hatayspor|3|0
Hatayspor|Kasımpaşa~19.08.2023|Hatayspor|Kasımpaşa|0|0
Hatayspor|Kasımpaşa~05.02.2023|Hatayspor|Kasımpaşa|1|0
Ad. Demirspor|Rizespor~26.01.2025|Rizespor|Ad. Demirspor|3|2
Ad. Demirspor|Rizespor~17.08.2024|Ad. Demirspor|Rizespor|1|2
Ad. Demirspor|Rizespor~13.01.2024|Rizespor|Ad. Demirspor|1|0
Ad. Demirspor|Rizespor~13.08.2023|Ad. Demirspor|Rizespor|2|1
Ad. Demirspor|Rizespor~06.02.2022|Rizespor|Ad. Demirspor|1|3
Bodrumspor|Eyüpspor~26.01.2025|Bodrumspor|Eyüpspor|0|1
Bodrumspor|Eyüpspor~19.08.2024|Eyüpspor|Bodrumspor|4|1
Kayserispor|Sivasspor~25.01.2025|Sivasspor|Kayserispor|5|2
Kayserispor|Sivasspor~17.08.2024|Kayserispor|Sivasspor|1|2
Kayserispor|Sivasspor~25.05.2024|Sivasspor|Kayserispor|2|1
Kayserispor|Sivasspor~07.01.2024|Kayserispor|Sivasspor|1|3
Kayserispor|Sivasspor~06.06.2023|Sivasspor|Kayserispor|1|1
Sivasspor|Trabzonspor~20.01.2025|Trabzonspor|Sivasspor|4|0
Sivasspor|Trabzonspor~11.08.2024|Sivasspor|Trabzonspor|0|0
Sivasspor|Trabzonspor~12.04.2024|Trabzonspor|Sivasspor|0|1
Sivasspor|Trabzonspor~27.11.2023|Sivasspor|Trabzonspor|3|3
Sivasspor|Trabzonspor~20.04.2023|Sivasspor|Trabzonspor|4|1
Ad. Demirspor|Fenerbahçe~19.01.2025|Ad. Demirspor|Fenerbahçe|0|4
Ad. Demirspor|Fenerbahçe~10.08.2024|Fenerbahçe|Ad. Demirspor|1|0
Ad. Demirspor|Fenerbahçe~03.04.2024|Fenerbahçe|Ad. Demirspor|4|2
Ad. Demirspor|Fenerbahçe~12.11.2023|Ad. Demirspor|Fenerbahçe|0|0
Ad. Demirspor|Fenerbahçe~02.02.2023|Ad. Demirspor|Fenerbahçe|1|1
Bodrumspor|Gaziantep~18.01.2025|Gaziantep|Bodrumspor|0|0
Bodrumspor|Gaziantep~12.08.2024|Bodrumspor|Gaziantep|0|1
Galatasaray|Hatayspor~17.01.2025|Hatayspor|Galatasaray|1|1
Galatasaray|Hatayspor~09.08.2024|Galatasaray|Hatayspor|2|1
Galatasaray|Hatayspor~02.04.2024|Galatasaray|Hatayspor|1|0
Galatasaray|Hatayspor~11.11.2023|Hatayspor|Galatasaray|2|1
Galatasaray|Hatayspor~07.06.2023|Hatayspor|Galatasaray|0|3
Fenerbahçe|Istanbulspor~26.05.2024|Fenerbahçe|Istanbulspor|6|0
Fenerbahçe|Istanbulspor~07.01.2024|Istanbulspor|Fenerbahçe|1|5
Fenerbahçe|Istanbulspor~24.04.2023|Fenerbahçe|Istanbulspor|3|3
Fenerbahçe|Istanbulspor~30.10.2022|Istanbulspor|Fenerbahçe|2|5
Gaziantep|Pendikspor~26.05.2024|Pendikspor|Gaziantep|0|1
Gaziantep|Pendikspor~05.01.2024|Gaziantep|Pendikspor|2|2
Ankaragucu|Trabzonspor~26.05.2024|Trabzonspor|Ankaragucu|4|2
Ankaragucu|Trabzonspor~06.01.2024|Ankaragucu|Trabzonspor|0|1
Ankaragucu|Trabzonspor~08.05.2023|Trabzonspor|Ankaragucu|2|0
Ankaragucu|Trabzonspor~11.11.2022|Ankaragucu|Trabzonspor|1|1
Ankaragucu|Pendikspor~18.05.2024|Ankaragucu|Pendikspor|0|0
Ankaragucu|Pendikspor~25.12.2023|Pendikspor|Ankaragucu|1|1
Istanbulspor|Sivasspor~17.05.2024|Istanbulspor|Sivasspor|1|3
Istanbulspor|Sivasspor~23.12.2023|Sivasspor|Istanbulspor|1|0
Istanbulspor|Sivasspor~13.03.2023|Istanbulspor|Sivasspor|3|0
Istanbulspor|Sivasspor~11.09.2022|Sivasspor|Istanbulspor|1|1
Ankaragucu|Hatayspor~12.05.2024|Hatayspor|Ankaragucu|2|1
Ankaragucu|Hatayspor~21.12.2023|Ankaragucu|Hatayspor|0|0
Ankaragucu|Hatayspor~23.04.2023|Hatayspor|Ankaragucu|0|3
Ankaragucu|Hatayspor~30.10.2022|Ankaragucu|Hatayspor|4|1
Pendikspor|Rizespor~12.05.2024|Pendikspor|Rizespor|2|1
Pendikspor|Rizespor~21.12.2023|Rizespor|Pendikspor|5|1
Istanbulspor|Trabzonspor~12.05.2024|Trabzonspor|Istanbulspor|3|0
Istanbulspor|Trabzonspor~19.12.2023|Istanbulspor|Trabzonspor|0|3
Istanbulspor|Trabzonspor~22.01.2023|Trabzonspor|Istanbulspor|4|0
Istanbulspor|Trabzonspor~05.08.2022|Istanbulspor|Trabzonspor|0|2
Antalyaspor|Pendikspor~06.05.2024|Antalyaspor|Pendikspor|1|2
Antalyaspor|Pendikspor~09.01.2024|Pendikspor|Antalyaspor|0|1
Ad. Demirspor|Istanbulspor~04.05.2024|Istanbulspor|Ad. Demirspor|0|1
Ad. Demirspor|Istanbulspor~10.01.2024|Ad. Demirspor|Istanbulspor|2|2
Ad. Demirspor|Istanbulspor~30.05.2023|Istanbulspor|Ad. Demirspor|0|2
Ad. Demirspor|Istanbulspor~05.01.2023|Ad. Demirspor|Istanbulspor|6|0
Alanyaspor|Ankaragucu~03.05.2024|Ankaragucu|Alanyaspor|1|1
Alanyaspor|Ankaragucu~09.01.2024|Alanyaspor|Ankaragucu|1|1
Alanyaspor|Ankaragucu~12.03.2023|Ankaragucu|Alanyaspor|2|0
Alanyaspor|Ankaragucu~09.09.2022|Alanyaspor|Ankaragucu|2|1
Alanyaspor|Istanbulspor~28.04.2024|Alanyaspor|Istanbulspor|6|0
Alanyaspor|Istanbulspor~10.12.2023|Istanbulspor|Alanyaspor|0|1
Alanyaspor|Istanbulspor~05.02.2023|Istanbulspor|Alanyaspor|2|1
Alanyaspor|Istanbulspor~27.08.2022|Alanyaspor|Istanbulspor|0|1
Kayserispor|Pendikspor~28.04.2024|Pendikspor|Kayserispor|1|2
Kayserispor|Pendikspor~10.12.2023|Kayserispor|Pendikspor|2|0
Ankaragucu|Rizespor~28.04.2024|Rizespor|Ankaragucu|2|2
Ankaragucu|Rizespor~11.12.2023|Ankaragucu|Rizespor|1|1
Galatasaray|Pendikspor~21.04.2024|Galatasaray|Pendikspor|4|1
Galatasaray|Pendikspor~02.12.2023|Pendikspor|Galatasaray|0|2
Istanbulspor|Karagumruk~20.04.2024|Istanbulspor|Karagumruk|1|2
Istanbulspor|Karagumruk~01.12.2023|Karagumruk|Istanbulspor|3|0
Istanbulspor|Karagumruk~03.04.2023|Istanbulspor|Karagumruk|0|1
Istanbulspor|Karagumruk~03.10.2022|Karagumruk|Istanbulspor|1|2
Ankaragucu|Beşiktaş~19.04.2024|Beşiktaş|Ankaragucu|2|0
Ankaragucu|Beşiktaş~03.12.2023|Ankaragucu|Beşiktaş|1|1
Ankaragucu|Beşiktaş~05.03.2023|Beşiktaş|Ankaragucu|2|1
Ankaragucu|Beşiktaş~04.09.2022|Ankaragucu|Beşiktaş|2|3
Başakşehir|Pendikspor~14.04.2024|Pendikspor|Başakşehir|2|3
Başakşehir|Pendikspor~27.11.2023|Başakşehir|Pendikspor|4|1
Hatayspor|Istanbulspor~14.04.2024|Hatayspor|Istanbulspor|0|3
Hatayspor|Istanbulspor~25.11.2023|Istanbulspor|Hatayspor|2|1
Hatayspor|Istanbulspor~07.05.2023|Hatayspor|Istanbulspor|0|3
Hatayspor|Istanbulspor~13.11.2022|Istanbulspor|Hatayspor|0|1
Ankaragucu|Gaziantep~13.04.2024|Ankaragucu|Gaziantep|3|1
Ankaragucu|Gaziantep~25.11.2023|Gaziantep|Ankaragucu|0|1
Ankaragucu|Gaziantep~28.01.2023|Ankaragucu|Gaziantep|0|2
Ankaragucu|Gaziantep~14.08.2022|Gaziantep|Ankaragucu|1|0
Pendikspor|Samsunspor~04.04.2024|Samsunspor|Pendikspor|0|0
Pendikspor|Samsunspor~12.11.2023|Pendikspor|Samsunspor|1|0
Karagumruk|Sivasspor~03.04.2024|Sivasspor|Karagumruk|1|0
Karagumruk|Sivasspor~11.11.2023|Karagumruk|Sivasspor|3|0
Karagumruk|Sivasspor~04.03.2023|Karagumruk|Sivasspor|4|3
Karagumruk|Sivasspor~03.09.2022|Sivasspor|Karagumruk|0|0
Karagumruk|Sivasspor~20.02.2022|Karagumruk|Sivasspor|1|0
Istanbulspor|Rizespor~02.04.2024|Istanbulspor|Rizespor|0|4
Istanbulspor|Rizespor~12.11.2023|Rizespor|Istanbulspor|1|0
Ankaragucu|Antalyaspor~02.04.2024|Antalyaspor|Ankaragucu|1|1
Ankaragucu|Antalyaspor~10.11.2023|Ankaragucu|Antalyaspor|0|4
Ankaragucu|Antalyaspor~17.05.2023|Ankaragucu|Antalyaspor|1|1
Ankaragucu|Antalyaspor~23.12.2022|Antalyaspor|Ankaragucu|0|2
Ankaragucu|Başakşehir~16.03.2024|Ankaragucu|Başakşehir|2|1
Ankaragucu|Başakşehir~05.11.2023|Başakşehir|Ankaragucu|3|3
Ankaragucu|Başakşehir~01.04.2023|Başakşehir|Ankaragucu|1|0
Ankaragucu|Başakşehir~01.10.2022|Ankaragucu|Başakşehir|1|2
Istanbulspor|Pendikspor~15.03.2024|Pendikspor|Istanbulspor|1|0
Istanbulspor|Pendikspor~04.11.2023|Istanbulspor|Pendikspor|2|4
Istanbulspor|Kasımpaşa~10.03.2024|Istanbulspor|Kasımpaşa|1|2
Istanbulspor|Kasımpaşa~27.10.2023|Kasımpaşa|Istanbulspor|3|1
Istanbulspor|Kasımpaşa~20.05.2023|Kasımpaşa|Istanbulspor|1|0
Istanbulspor|Kasımpaşa~28.12.2022|Istanbulspor|Kasımpaşa|2|1
Ankaragucu|Samsunspor~10.03.2024|Samsunspor|Ankaragucu|2|1
Ankaragucu|Samsunspor~29.10.2023|Ankaragucu|Samsunspor|2|0
Fenerbahçe|Pendikspor~10.03.2024|Fenerbahçe|Pendikspor|4|1
Fenerbahçe|Pendikspor~29.10.2023|Pendikspor|Fenerbahçe|0|5
Ad. Demirspor|Karagumruk~04.03.2024|Ad. Demirspor|Karagumruk|1|0
Ad. Demirspor|Karagumruk~23.10.2023|Karagumruk|Ad. Demirspor|2|0
Ad. Demirspor|Karagumruk~17.05.2023|Karagumruk|Ad. Demirspor|2|3
Ad. Demirspor|Karagumruk~25.12.2022|Ad. Demirspor|Karagumruk|2|1
Ad. Demirspor|Karagumruk~22.01.2022|Ad. Demirspor|Karagumruk|5|0
Konyaspor|Pendikspor~03.03.2024|Pendikspor|Konyaspor|0|2
Konyaspor|Pendikspor~21.10.2023|Konyaspor|Pendikspor|1|2
Ankaragucu|Istanbulspor~02.03.2024|Ankaragucu|Istanbulspor|1|1
Ankaragucu|Istanbulspor~22.10.2023|Istanbulspor|Ankaragucu|2|1
Ankaragucu|Istanbulspor~08.04.2023|Ankaragucu|Istanbulspor|3|2
Ankaragucu|Istanbulspor~08.10.2022|Istanbulspor|Ankaragucu|1|2
Pendikspor|Sivasspor~25.02.2024|Sivasspor|Pendikspor|4|1
Pendikspor|Sivasspor~07.10.2023|Pendikspor|Sivasspor|2|3
Beşiktaş|Istanbulspor~25.02.2024|Istanbulspor|Beşiktaş|0|2
Beşiktaş|Istanbulspor~08.10.2023|Beşiktaş|Istanbulspor|2|0
Beşiktaş|Istanbulspor~18.03.2023|Beşiktaş|Istanbulspor|3|1
Beşiktaş|Istanbulspor~17.09.2022|Istanbulspor|Beşiktaş|2|2
Ankaragucu|Kayserispor~24.02.2024|Kayserispor|Ankaragucu|3|2
Ankaragucu|Kayserispor~07.10.2023|Ankaragucu|Kayserispor|3|0
Ankaragucu|Kayserispor~03.06.2023|Kayserispor|Ankaragucu|0|1
Ankaragucu|Kayserispor~08.01.2023|Ankaragucu|Kayserispor|2|1
Pendikspor|Trabzonspor~18.02.2024|Pendikspor|Trabzonspor|0|2
Pendikspor|Trabzonspor~30.09.2023|Trabzonspor|Pendikspor|2|1
Ankaragucu|Galatasaray~18.02.2024|Ankaragucu|Galatasaray|0|3
Ankaragucu|Galatasaray~30.09.2023|Galatasaray|Ankaragucu|2|1
Ankaragucu|Galatasaray~30.05.2023|Ankaragucu|Galatasaray|1|4
Ankaragucu|Galatasaray~04.01.2023|Galatasaray|Ankaragucu|2|1
Antalyaspor|Istanbulspor~17.02.2024|Antalyaspor|Istanbulspor|2|2
Antalyaspor|Istanbulspor~30.09.2023|Istanbulspor|Antalyaspor|1|2
Antalyaspor|Istanbulspor~19.04.2023|Istanbulspor|Antalyaspor|3|3
Antalyaspor|Istanbulspor~21.10.2022|Antalyaspor|Istanbulspor|2|1
Gaziantep|Istanbulspor~11.02.2024|Istanbulspor|Gaziantep|1|3
Gaziantep|Istanbulspor~22.09.2023|Gaziantep|Istanbulspor|2|0
Gaziantep|Istanbulspor~03.06.2023|Gaziantep|Istanbulspor|0|3
Gaziantep|Istanbulspor~09.01.2023|Istanbulspor|Gaziantep|1|1
Ankaragucu|Konyaspor~11.02.2024|Konyaspor|Ankaragucu|1|0
Ankaragucu|Konyaspor~24.09.2023|Ankaragucu|Konyaspor|1|1
Ankaragucu|Konyaspor~23.01.2023|Konyaspor|Ankaragucu|0|1
Ankaragucu|Konyaspor~08.08.2022|Ankaragucu|Konyaspor|0|0
Karagumruk|Pendikspor~10.02.2024|Karagumruk|Pendikspor|2|0
Karagumruk|Pendikspor~23.09.2023|Pendikspor|Karagumruk|1|1
Ad. Demirspor|Pendikspor~04.02.2024|Pendikspor|Ad. Demirspor|2|1
Ad. Demirspor|Pendikspor~16.09.2023|Ad. Demirspor|Pendikspor|3|0
Başakşehir|Istanbulspor~03.02.2024|Başakşehir|Istanbulspor|2|0
Başakşehir|Istanbulspor~17.09.2023|Istanbulspor|Başakşehir|0|2
Başakşehir|Istanbulspor~15.04.2023|Istanbulspor|Başakşehir|1|0
Başakşehir|Istanbulspor~16.10.2022|Başakşehir|Istanbulspor|2|0
Ankaragucu|Sivasspor~02.02.2024|Ankaragucu|Sivasspor|0|0
Ankaragucu|Sivasspor~18.09.2023|Sivasspor|Ankaragucu|1|3
Ankaragucu|Sivasspor~19.03.2023|Sivasspor|Ankaragucu|2|0
Ankaragucu|Sivasspor~18.09.2022|Ankaragucu|Sivasspor|2|1
Hatayspor|Karagumruk~02.02.2024|Hatayspor|Karagumruk|3|1
Hatayspor|Karagumruk~18.09.2023|Karagumruk|Hatayspor|0|0
Hatayspor|Karagumruk~16.04.2023|Hatayspor|Karagumruk|0|3
Hatayspor|Karagumruk~15.10.2022|Karagumruk|Hatayspor|3|0
Hatayspor|Karagumruk~12.03.2022|Hatayspor|Karagumruk|3|0
Istanbulspor|Samsunspor~29.01.2024|Istanbulspor|Samsunspor|1|1
Istanbulspor|Samsunspor~08.11.2023|Samsunspor|Istanbulspor|2|1
Ankaragucu|Fenerbahçe~28.01.2024|Fenerbahçe|Ankaragucu|2|1
Ankaragucu|Fenerbahçe~03.09.2023|Ankaragucu|Fenerbahçe|0|1
Ankaragucu|Fenerbahçe~15.04.2023|Fenerbahçe|Ankaragucu|2|1
Ankaragucu|Fenerbahçe~17.10.2022|Ankaragucu|Fenerbahçe|0|3
Alanyaspor|Pendikspor~27.01.2024|Alanyaspor|Pendikspor|1|1
Alanyaspor|Pendikspor~02.09.2023|Pendikspor|Alanyaspor|1|1
Galatasaray|Istanbulspor~25.01.2024|Galatasaray|Istanbulspor|3|1
Galatasaray|Istanbulspor~26.09.2023|Istanbulspor|Galatasaray|0|1
Galatasaray|Istanbulspor~16.05.2023|Istanbulspor|Galatasaray|0|2
Galatasaray|Istanbulspor~25.12.2022|Galatasaray|Istanbulspor|2|1
Ankaragucu|Karagumruk~24.01.2024|Ankaragucu|Karagumruk|2|0
Ankaragucu|Karagumruk~27.08.2023|Karagumruk|Ankaragucu|1|1
Ankaragucu|Karagumruk~04.02.2023|Ankaragucu|Karagumruk|0|2
Ankaragucu|Karagumruk~27.08.2022|Karagumruk|Ankaragucu|4|1
Kasımpaşa|Pendikspor~23.01.2024|Pendikspor|Kasımpaşa|3|2
Kasımpaşa|Pendikspor~26.08.2023|Kasımpaşa|Pendikspor|1|1
Istanbulspor|Kayserispor~22.01.2024|Kayserispor|Istanbulspor|0|1
Istanbulspor|Kayserispor~18.08.2023|Istanbulspor|Kayserispor|1|1
Istanbulspor|Kayserispor~29.01.2023|Istanbulspor|Kayserispor|2|4
Istanbulspor|Kayserispor~13.08.2022|Kayserispor|Istanbulspor|1|0
Ad. Demirspor|Ankaragucu~20.01.2024|Ad. Demirspor|Ankaragucu|1|1
Ad. Demirspor|Ankaragucu~21.08.2023|Ankaragucu|Ad. Demirspor|1|1
Ad. Demirspor|Ankaragucu~07.06.2023|Ankaragucu|Ad. Demirspor|1|2
Ad. Demirspor|Ankaragucu~14.01.2023|Ad. Demirspor|Ankaragucu|3|1
Beşiktaş|Pendikspor~20.01.2024|Pendikspor|Beşiktaş|4|0
Beşiktaş|Pendikspor~20.08.2023|Beşiktaş|Pendikspor|1|1
Istanbulspor|Konyaspor~14.01.2024|Istanbulspor|Konyaspor|0|0
Istanbulspor|Konyaspor~12.08.2023|Konyaspor|Istanbulspor|1|1
Istanbulspor|Konyaspor~02.02.2023|Konyaspor|Istanbulspor|0|1
Istanbulspor|Konyaspor~22.08.2022|Istanbulspor|Konyaspor|0|4
Ankaragucu|Kasımpaşa~13.01.2024|Ankaragucu|Kasımpaşa|3|1
Ankaragucu|Kasımpaşa~12.08.2023|Kasımpaşa|Ankaragucu|3|2
Ankaragucu|Kasımpaşa~29.04.2023|Ankaragucu|Kasımpaşa|0|0
Ankaragucu|Kasımpaşa~04.11.2022|Kasımpaşa|Ankaragucu|1|1
Hatayspor|Pendikspor~13.01.2024|Hatayspor|Pendikspor|1|1
Hatayspor|Pendikspor~12.08.2023|Pendikspor|Hatayspor|1|5
Antalyaspor|Giresunspor~07.06.2023|Giresunspor|Antalyaspor|2|0
Antalyaspor|Giresunspor~14.01.2023|Antalyaspor|Giresunspor|2|2
Antalyaspor|Giresunspor~20.03.2022|Antalyaspor|Giresunspor|4|1
Antalyaspor|Giresunspor~01.11.2021|Giresunspor|Antalyaspor|1|2
Istanbulspor|Umraniyespor~07.06.2023|Istanbulspor|Umraniyespor|4|0
Istanbulspor|Umraniyespor~15.01.2023|Umraniyespor|Istanbulspor|0|2
Giresunspor|Umraniyespor~03.06.2023|Umraniyespor|Giresunspor|0|1
Giresunspor|Umraniyespor~08.01.2023|Giresunspor|Umraniyespor|0|1
Giresunspor|Trabzonspor~30.05.2023|Giresunspor|Trabzonspor|2|4
Giresunspor|Trabzonspor~05.01.2023|Trabzonspor|Giresunspor|3|0
Giresunspor|Trabzonspor~19.01.2022|Trabzonspor|Giresunspor|1|1
Giresunspor|Trabzonspor~29.08.2021|Giresunspor|Trabzonspor|0|1
Hatayspor|Umraniyespor~30.05.2023|Hatayspor|Umraniyespor|0|3
Hatayspor|Umraniyespor~03.01.2023|Umraniyespor|Hatayspor|2|2
Ankaragucu|Umraniyespor~21.05.2023|Umraniyespor|Ankaragucu|1|2
Ankaragucu|Umraniyespor~27.12.2022|Ankaragucu|Umraniyespor|1|2
Gaziantep|Giresunspor~21.05.2023|Gaziantep|Giresunspor|0|3
Gaziantep|Giresunspor~29.12.2022|Giresunspor|Gaziantep|2|1
Gaziantep|Giresunspor~14.03.2022|Giresunspor|Gaziantep|2|1
Gaziantep|Giresunspor~23.10.2021|Gaziantep|Giresunspor|1|1
Başakşehir|Umraniyespor~17.05.2023|Başakşehir|Umraniyespor|1|1
Başakşehir|Umraniyespor~23.12.2022|Umraniyespor|Başakşehir|1|3
Giresunspor|Hatayspor~17.05.2023|Giresunspor|Hatayspor|3|0
Giresunspor|Hatayspor~24.12.2022|Hatayspor|Giresunspor|1|1
Giresunspor|Hatayspor~22.05.2022|Hatayspor|Giresunspor|4|1
Giresunspor|Hatayspor~25.12.2021|Giresunspor|Hatayspor|0|1
Sivasspor|Umraniyespor~07.05.2023|Umraniyespor|Sivasspor|4|1
Sivasspor|Umraniyespor~12.11.2022|Sivasspor|Umraniyespor|2|2
Fenerbahçe|Giresunspor~07.05.2023|Giresunspor|Fenerbahçe|1|1
Fenerbahçe|Giresunspor~12.11.2022|Fenerbahçe|Giresunspor|1|2
Fenerbahçe|Giresunspor~12.02.2022|Giresunspor|Fenerbahçe|1|2
Fenerbahçe|Giresunspor~23.09.2021|Fenerbahçe|Giresunspor|2|1
Giresunspor|Istanbulspor~01.05.2023|Istanbulspor|Giresunspor|1|0
Giresunspor|Istanbulspor~05.11.2022|Giresunspor|Istanbulspor|3|2
Alanyaspor|Umraniyespor~28.04.2023|Alanyaspor|Umraniyespor|1|0
Alanyaspor|Umraniyespor~04.11.2022|Umraniyespor|Alanyaspor|3|1
Başakşehir|Giresunspor~24.04.2023|Giresunspor|Başakşehir|2|4
Başakşehir|Giresunspor~31.10.2022|Başakşehir|Giresunspor|3|1
Başakşehir|Giresunspor~15.05.2022|Giresunspor|Başakşehir|1|1
Başakşehir|Giresunspor~21.12.2021|Başakşehir|Giresunspor|3|1
Beşiktaş|Umraniyespor~22.04.2023|Umraniyespor|Beşiktaş|0|2
Beşiktaş|Umraniyespor~30.10.2022|Beşiktaş|Umraniyespor|5|2
Ankaragucu|Giresunspor~20.04.2023|Ankaragucu|Giresunspor|3|1
Ankaragucu|Giresunspor~24.10.2022|Giresunspor|Ankaragucu|1|1
Karagumruk|Umraniyespor~18.04.2023|Karagumruk|Umraniyespor|4|2
Karagumruk|Umraniyespor~22.10.2022|Umraniyespor|Karagumruk|1|3
Giresunspor|Sivasspor~16.04.2023|Giresunspor|Sivasspor|1|0
Giresunspor|Sivasspor~17.10.2022|Sivasspor|Giresunspor|3|0
Giresunspor|Sivasspor~02.04.2022|Giresunspor|Sivasspor|2|2
Giresunspor|Sivasspor~06.11.2021|Sivasspor|Giresunspor|0|0
Kayserispor|Umraniyespor~10.04.2023|Kayserispor|Umraniyespor|3|1
Kayserispor|Umraniyespor~09.10.2022|Umraniyespor|Kayserispor|2|2
Beşiktaş|Giresunspor~09.04.2023|Beşiktaş|Giresunspor|3|1
Beşiktaş|Giresunspor~08.10.2022|Giresunspor|Beşiktaş|0|1
Beşiktaş|Giresunspor~17.04.2022|Giresunspor|Beşiktaş|0|0
Beşiktaş|Giresunspor~27.11.2021|Beşiktaş|Giresunspor|0|4
Konyaspor|Umraniyespor~02.04.2023|Umraniyespor|Konyaspor|2|2
Konyaspor|Umraniyespor~02.10.2022|Konyaspor|Umraniyespor|1|0
Alanyaspor|Giresunspor~02.04.2023|Giresunspor|Alanyaspor|2|2
Alanyaspor|Giresunspor~02.10.2022|Alanyaspor|Giresunspor|1|1
Alanyaspor|Giresunspor~23.01.2022|Giresunspor|Alanyaspor|1|3
Alanyaspor|Giresunspor~13.09.2021|Alanyaspor|Giresunspor|1|0
Kasımpaşa|Umraniyespor~18.03.2023|Kasımpaşa|Umraniyespor|1|1
Kasımpaşa|Umraniyespor~17.09.2022|Umraniyespor|Kasımpaşa|1|2
Giresunspor|Karagumruk~10.03.2023|Giresunspor|Karagumruk|2|2
Giresunspor|Karagumruk~10.09.2022|Karagumruk|Giresunspor|1|1
Giresunspor|Karagumruk~23.04.2022|Karagumruk|Giresunspor|2|1
Giresunspor|Karagumruk~05.12.2021|Giresunspor|Karagumruk|3|1
Giresunspor|Konyaspor~05.03.2023|Konyaspor|Giresunspor|0|0
Giresunspor|Konyaspor~03.09.2022|Giresunspor|Konyaspor|0|1
Giresunspor|Konyaspor~04.02.2022|Konyaspor|Giresunspor|1|0
Giresunspor|Konyaspor~19.09.2021|Giresunspor|Konyaspor|0|0
Trabzonspor|Umraniyespor~04.03.2023|Trabzonspor|Umraniyespor|1|2
Trabzonspor|Umraniyespor~02.09.2022|Umraniyespor|Trabzonspor|0|1
Ad. Demirspor|Umraniyespor~26.02.2023|Umraniyespor|Ad. Demirspor|1|1
Ad. Demirspor|Umraniyespor~27.08.2022|Ad. Demirspor|Umraniyespor|1|0
Gaziantep|Umraniyespor~25.02.2023|Umraniyespor|Gaziantep|3|0
Gaziantep|Umraniyespor~11.09.2022|Gaziantep|Umraniyespor|1|1
Giresunspor|Kayserispor~25.02.2023|Giresunspor|Kayserispor|1|2
Giresunspor|Kayserispor~28.08.2022|Kayserispor|Giresunspor|3|0
Giresunspor|Kayserispor~19.02.2022|Kayserispor|Giresunspor|2|1
Giresunspor|Kayserispor~26.09.2021|Giresunspor|Kayserispor|1|1
Giresunspor|Kasımpaşa~01.02.2023|Kasımpaşa|Giresunspor|5|1
Giresunspor|Kasımpaşa~20.08.2022|Giresunspor|Kasımpaşa|1|0
Giresunspor|Kasımpaşa~16.01.2022|Giresunspor|Kasımpaşa|0|2
Giresunspor|Kasımpaşa~21.08.2021|Kasımpaşa|Giresunspor|2|0
Galatasaray|Umraniyespor~01.02.2023|Galatasaray|Umraniyespor|3|2
Galatasaray|Umraniyespor~19.08.2022|Umraniyespor|Galatasaray|0|1
Antalyaspor|Umraniyespor~28.01.2023|Antalyaspor|Umraniyespor|3|2
Antalyaspor|Umraniyespor~14.08.2022|Umraniyespor|Antalyaspor|0|1
Galatasaray|Giresunspor~28.01.2023|Giresunspor|Galatasaray|0|4
Galatasaray|Giresunspor~13.08.2022|Galatasaray|Giresunspor|0|1
Galatasaray|Giresunspor~08.01.2022|Galatasaray|Giresunspor|0|1
Galatasaray|Giresunspor~16.08.2021|Giresunspor|Galatasaray|0|2
Fenerbahçe|Umraniyespor~23.01.2023|Umraniyespor|Fenerbahçe|1|2
Fenerbahçe|Umraniyespor~08.08.2022|Fenerbahçe|Umraniyespor|3|3
Ad. Demirspor|Giresunspor~20.01.2023|Ad. Demirspor|Giresunspor|1|1
Ad. Demirspor|Giresunspor~07.08.2022|Giresunspor|Ad. Demirspor|2|3
Ad. Demirspor|Giresunspor~29.04.2022|Giresunspor|Ad. Demirspor|2|0
Ad. Demirspor|Giresunspor~12.12.2021|Ad. Demirspor|Giresunspor|1|0
Altay|Kasımpaşa~21.05.2022|Altay|Kasımpaşa|2|4
Altay|Kasımpaşa~25.12.2021|Kasımpaşa|Altay|2|0
Fenerbahçe|Yeni Malatyaspor~21.05.2022|Yeni Malatyaspor|Fenerbahçe|0|5
Fenerbahçe|Yeni Malatyaspor~26.12.2021|Fenerbahçe|Yeni Malatyaspor|2|0
Altay|Trabzonspor~15.05.2022|Trabzonspor|Altay|2|1
Altay|Trabzonspor~21.12.2021|Altay|Trabzonspor|1|2
Kayserispor|Yeni Malatyaspor~14.05.2022|Kayserispor|Yeni Malatyaspor|3|0
Kayserispor|Yeni Malatyaspor~23.12.2021|Yeni Malatyaspor|Kayserispor|2|2
Altay|Giresunspor~08.05.2022|Altay|Giresunspor|1|1
Altay|Giresunspor~17.12.2021|Giresunspor|Altay|3|1
Rizespor|Yeni Malatyaspor~08.05.2022|Yeni Malatyaspor|Rizespor|1|3
Rizespor|Yeni Malatyaspor~19.12.2021|Rizespor|Yeni Malatyaspor|1|0
Alanyaspor|Yeni Malatyaspor~01.05.2022|Alanyaspor|Yeni Malatyaspor|2|1
Alanyaspor|Yeni Malatyaspor~12.12.2021|Yeni Malatyaspor|Alanyaspor|2|6
Altay|Hatayspor~30.04.2022|Hatayspor|Altay|0|1
Altay|Hatayspor~10.12.2021|Altay|Hatayspor|1|2
Konyaspor|Yeni Malatyaspor~24.04.2022|Yeni Malatyaspor|Konyaspor|2|3
Konyaspor|Yeni Malatyaspor~06.12.2021|Konyaspor|Yeni Malatyaspor|0|0
Altay|Galatasaray~24.04.2022|Altay|Galatasaray|0|1
Altay|Galatasaray~04.12.2021|Galatasaray|Altay|2|2
Galatasaray|Yeni Malatyaspor~18.04.2022|Galatasaray|Yeni Malatyaspor|2|0
Galatasaray|Yeni Malatyaspor~28.11.2021|Yeni Malatyaspor|Galatasaray|0|0
Altay|Başakşehir~16.04.2022|Altay|Başakşehir|1|1
Altay|Başakşehir~26.11.2021|Başakşehir|Altay|0|0
Giresunspor|Yeni Malatyaspor~10.04.2022|Yeni Malatyaspor|Giresunspor|0|1
Giresunspor|Yeni Malatyaspor~20.11.2021|Giresunspor|Yeni Malatyaspor|1|0
Ad. Demirspor|Altay~10.04.2022|Ad. Demirspor|Altay|3|1
Ad. Demirspor|Altay~21.11.2021|Altay|Ad. Demirspor|1|3
Başakşehir|Yeni Malatyaspor~04.04.2022|Başakşehir|Yeni Malatyaspor|1|0
Başakşehir|Yeni Malatyaspor~06.11.2021|Yeni Malatyaspor|Başakşehir|1|3
Altay|Antalyaspor~02.04.2022|Altay|Antalyaspor|1|2
Altay|Antalyaspor~06.11.2021|Antalyaspor|Altay|1|0
Altay|Sivasspor~20.03.2022|Sivasspor|Altay|2|1
Altay|Sivasspor~30.10.2021|Altay|Sivasspor|1|1
Kasımpaşa|Yeni Malatyaspor~19.03.2022|Yeni Malatyaspor|Kasımpaşa|0|2
Kasımpaşa|Yeni Malatyaspor~30.10.2021|Kasımpaşa|Yeni Malatyaspor|2|0
Altay|Yeni Malatyaspor~12.03.2022|Altay|Yeni Malatyaspor|1|0
Altay|Yeni Malatyaspor~22.10.2021|Yeni Malatyaspor|Altay|2|1
Altay|Karagumruk~06.03.2022|Karagumruk|Altay|0|0
Altay|Karagumruk~17.10.2021|Altay|Karagumruk|0|1
Giresunspor|Rizespor~05.03.2022|Rizespor|Giresunspor|1|2
Giresunspor|Rizespor~16.10.2021|Giresunspor|Rizespor|2|0
Ad. Demirspor|Yeni Malatyaspor~04.03.2022|Yeni Malatyaspor|Ad. Demirspor|1|0
Ad. Demirspor|Yeni Malatyaspor~16.10.2021|Ad. Demirspor|Yeni Malatyaspor|0|2
Altay|Gaziantep~27.02.2022|Altay|Gaziantep|3|2
Altay|Gaziantep~03.10.2021|Gaziantep|Altay|4|1
Giresunspor|Göztepe~27.02.2022|Giresunspor|Göztepe|3|1
Giresunspor|Göztepe~02.10.2021|Göztepe|Giresunspor|0|1
Hatayspor|Yeni Malatyaspor~27.02.2022|Hatayspor|Yeni Malatyaspor|5|2
Hatayspor|Yeni Malatyaspor~03.10.2021|Yeni Malatyaspor|Hatayspor|0|2
Gaziantep|Yeni Malatyaspor~23.02.2022|Gaziantep|Yeni Malatyaspor|0|0
Gaziantep|Yeni Malatyaspor~28.08.2021|Yeni Malatyaspor|Gaziantep|2|0
Antalyaspor|Yeni Malatyaspor~19.02.2022|Yeni Malatyaspor|Antalyaspor|1|2
Antalyaspor|Yeni Malatyaspor~25.09.2021|Antalyaspor|Yeni Malatyaspor|1|0
Altay|Beşiktaş~19.02.2022|Beşiktaş|Altay|1|0
Altay|Beşiktaş~24.09.2021|Altay|Beşiktaş|2|1
Sivasspor|Yeni Malatyaspor~13.02.2022|Sivasspor|Yeni Malatyaspor|2|1
Sivasspor|Yeni Malatyaspor~21.09.2021|Yeni Malatyaspor|Sivasspor|0|1
Altay|Rizespor~11.02.2022|Altay|Rizespor|0|0
Altay|Rizespor~21.09.2021|Rizespor|Altay|1|2
Altay|Göztepe~06.02.2022|Göztepe|Altay|0|2
Altay|Göztepe~17.09.2021|Altay|Göztepe|2|1
Karagumruk|Yeni Malatyaspor~05.02.2022|Karagumruk|Yeni Malatyaspor|1|0
Karagumruk|Yeni Malatyaspor~17.09.2021|Yeni Malatyaspor|Karagumruk|3|4
Altay|Konyaspor~23.01.2022|Altay|Konyaspor|0|1
Altay|Konyaspor~11.09.2021|Konyaspor|Altay|3|1
Beşiktaş|Yeni Malatyaspor~22.01.2022|Yeni Malatyaspor|Beşiktaş|1|1
Beşiktaş|Yeni Malatyaspor~11.09.2021|Beşiktaş|Yeni Malatyaspor|3|0
Altay|Fenerbahçe~19.01.2022|Fenerbahçe|Altay|2|1
Altay|Fenerbahçe~29.08.2021|Altay|Fenerbahçe|0|2
Alanyaspor|Altay~16.01.2022|Altay|Alanyaspor|0|2
Alanyaspor|Altay~21.08.2021|Alanyaspor|Altay|1|4
Göztepe|Yeni Malatyaspor~14.01.2022|Yeni Malatyaspor|Göztepe|1|2
Göztepe|Yeni Malatyaspor~22.08.2021|Göztepe|Yeni Malatyaspor|0|1
Altay|Kayserispor~09.01.2022|Kayserispor|Altay|1|0
Altay|Kayserispor~14.08.2021|Altay|Kayserispor|3|0
Trabzonspor|Yeni Malatyaspor~07.01.2022|Trabzonspor|Yeni Malatyaspor|1|0
Trabzonspor|Yeni Malatyaspor~16.08.2021|Yeni Malatyaspor|Trabzonspor|1|5`;
SLH.split('\n').forEach(l=>{const[k,r]=l.split('~'),[d,h,a,x,y]=r.split('|');(HH[k]=HH[k]||[]).push({d,h,a,x:+x,y:+y})});
R.filter(m=>m.t>new Date('2026-11-05T22:00:00Z')&&WKM[m.c]&&WKM[m.c][m.h+'|'+m.a]).forEach(m=>{m.mp=WKM[m.c][m.h+'|'+m.a]});
R.filter(m=>m.c=='SCO'&&m.t>new Date('2026-11-05T22:00:00Z')).forEach(m=>{m.mp=SCOM[m.h+'|'+m.a];m.p=m.p.map((v,i)=>.5*v+.5*m.mp[i])});
R.filter(m=>m.t>new Date('2026-11-05T22:00:00Z')&&NLM[m.c]&&NLM[m.c][m.h+'|'+m.a]).forEach(m=>{m.mp=NLM[m.c][m.h+'|'+m.a];m.p=m.p.map((v,i)=>.5*v+.5*m.mp[i])});
{const o=['CL','EL','ECL','UNL','SL','PL','LL','BL','L1','SA','POR','ERE','BEL','SCO','KSA'],t={...LN};Object.keys(LN).forEach(k=>delete LN[k]);o.forEach(k=>{if(t[k]){LN[k]=t[k];delete t[k]}});Object.assign(LN,t)}
recalc();try{const hm0=(location.hash||'').match(/kupon=([A-Za-z0-9_\-]+)/);if(hm0){const o=kDec(hm0[1]);if(o){KPIMP=o;tab='c'}}}catch(e){}render();
$('#q').oninput=e=>{Q=e.target.value;QX='';render()};(()=>{let sx=0,sy=0,st=0,ok=false;const hs=el=>{while(el&&el!==document.body){if(el.scrollWidth>el.clientWidth+2){const o=getComputedStyle(el).overflowX;if(o=='auto'||o=='scroll')return true}el=el.parentElement}return false};
document.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;st=Date.now();ok=e.touches.length==1&&!hs(e.target)},{passive:true});
document.addEventListener('touchend',e=>{if(!ok)return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>80&&Math.abs(dy)<60&&Math.abs(dx)>2*Math.abs(dy)&&Date.now()-st<700){const DT=['p','k','i','z','m','s'],up=()=>{try{scrollTo(0,0)}catch(e){}},dayb=d=>{const b=document.querySelector('[data-dd="'+d+'"]');if(b&&!b.disabled){b.click();up();return true}return false};
if(dx>0){if(det){const i=DT.indexOf(dt);if(i>0){dt=DT[i-1];render();up()}else if(!back()){det=null;render()}}
else if(PMV||Q.trim()||tab!='k'){if(NAVS.length)back();else if(PMV){PMV=null;render()}else if(Q.trim()){Q='';QX='';const q=$('#q');if(q)q.value='';render()}}
else if(!dayb(-1)&&NAVS.length)back()}
else{if(det){const i=DT.indexOf(dt);if(i<DT.length-1){dt=DT[i+1];render();up()}else fwd()}
else if(PMV||Q.trim()||tab!='k')fwd();else dayb(1)}}},{passive:true})})();document.body.classList.add('cmp');document.addEventListener('click',e=>{const pl=e.target.closest&&e.target.closest('[data-pl]');if(pl){e.stopPropagation();e.preventDefault();const k=pl.dataset.pl,x=plAll().find(y=>y.k==k);plOpen(k,x?x.p[0]:k);return}const pn=e.target.closest&&e.target.closest('[data-pn]');if(pn){e.stopPropagation();e.preventDefault();const a=pn.dataset.pn.split('|'),tm=a[0],nm=a.slice(1).join('|'),k=plFind(tm,nm);plOpen(k||(tm+'|'+nm),nm);return}const t=e.target.closest&&e.target.closest('[data-tm]');if(t){e.stopPropagation();e.preventDefault();push();det=null;PMV=null;tab='k';Q=t.dataset.tm;QX=Q;const q=$('#q');if(q)q.value=Q;render();try{scrollTo(0,0)}catch(x){}}},true);$('#q').onkeydown=e=>{if(e.key==='Enter'||e.keyCode===13){e.preventDefault();e.target.blur()}};KMC=1;refresh().then(function(){KMC=0;return refresh()},function(){KMC=0;return refresh()});(function ar(){const n=new Date(),w=((3-n.getMinutes()%10+10)%10)*60000-n.getSeconds()*1000-n.getMilliseconds();setTimeout(()=>{try{if(!document.hidden){const ae=document.activeElement;if(!(ae&&ae.id==='q')){const y=window.scrollY||0;refresh().then(()=>{try{window.scrollTo(0,y)}catch(e){}}).catch(()=>{})}}}catch(e){}ar()},w>5000?w:w+600000)})();
