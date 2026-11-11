// js/app.js'e Supabase giris baglantilarini ekler (tek seferlik; her yama tam olarak 1 yerde eslesmeli).
// Calistirma: node tools/patch-auth.mjs   (ikinci kez calistirilirsa "zaten uygulanmis" der)
import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve(import.meta.dirname, '..', 'js', 'app.js');
let src = fs.readFileSync(file, 'utf8');

const CL = "window.KMCLOUD&&KMCLOUD.on";
const PATCHES = [
  {
    name: 'misafir karti -> giris formu (bulut aciksa)',
    from: "if(!signed)return pbx('',`<b style=\"font:700 20px var(--n)\">Misafir</b>",
    to: `if(!signed&&${CL})return KMAUTH.card(pbx);if(!signed)return pbx('',\`<b style="font:700 20px var(--n)">Misafir</b>`,
  },
  {
    name: 'ilk giris karti metni',
    from: "<div class='mut'>Giriş yapıldı (Claude hesabı). İki küçük ayar yeter.</div>",
    to: `<div class='mut'>\${${CL}?KMAUTH.t('signedin2'):\`Giriş yapıldı (Claude hesabı). İki küçük ayar yeter.\`}</div>`,
  },
  {
    name: 'profil karti: giris yapildi',
    from: "Giriş yapıldı (Claude hesabı)${jd?' · Üyelik: '+pe(jd):''}",
    to: `\${${CL}?KMAUTH.t('signedin'):\`Giriş yapıldı (Claude hesabı)\`}\${jd?' · Üyelik: '+pe(jd):''}`,
  },
  {
    name: 'profil karti: hesap aciklamasi',
    from: "Kuponların, favorilerin ve ayarların yalnızca sana aittir. Hesap değiştirmek için önce buradan çıkış yap, sonra claude.ai'de başka hesapla gir.",
    to: `\${${CL}?KMAUTH.t('own'):\`Kuponların, favorilerin ve ayarların yalnızca sana aittir. Hesap değiştirmek için önce buradan çıkış yap, sonra claude.ai'de başka hesapla gir.\`}`,
  },
  {
    name: 'memBind: giris dugmeleri',
    from: "function memBind(){const g=id=>document.getElementById(id),",
    to: "function memBind(){try{window.KMAUTH&&KMAUTH.bind()}catch(e){}const g=id=>document.getElementById(id),",
  },
  {
    name: 'sOut: bulutta gercek cikis',
    from: "const sOut=()=>{try{localStorage.setItem('km_out','1');",
    to: `const sOut=()=>{if(${CL}){try{KMCLOUD.signOut()}catch(e){}try{['kupon_v1','fav','kupon_uid'].forEach(k=>localStorage.removeItem(k))}catch(e){}SOUT=false;SCONF=false;PMSG='';clearTimeout(KPRT);KPD=[];KPS=[];KPX=[];KPTS=0;KPUID=null;KPDBR=false;FUID=null;FAV=new Set();PRF=null;PROF=null;PROFL=false;try{kpBadge()}catch(e){}profDraw();return}try{localStorage.setItem('km_out','1');`,
  },
];

let applied = 0;
for (const p of PATCHES) {
  const n = src.split(p.from).length - 1;
  if (n === 0 && src.includes(p.to)) { console.log('zaten uygulanmis :', p.name); continue; }
  if (n !== 1) throw new Error(`${p.name}: ${n} yerde eslesti (1 bekleniyordu)`);
  src = src.replace(p.from, () => p.to);
  applied++;
  console.log('uygulandi        :', p.name);
}
if (applied) fs.writeFileSync(file, src);
console.log(`bitti, ${applied} yama yazildi`);
