// Fixtures / Pre-game Stats (638:19234) with Stats, Predictions, Squads and Table tabs, the prediction ticket
// sheet and the player page (Fixtures / Squads / Stats 638:19330).
// Written by a teammate straight into the published bundle (artifact v8-v14) and ported here unchanged:
// only the minified names were mapped back to the source modules below.
import * as te from 'react';
import * as l from 'react/jsx-runtime';
import { Header as cn, AppBar as fn, Button as Ft, Icon as de, useCopy as je, useSlot as qe, asset as dt, tx, matchNav, SubNav, SectionTitle, MatchCardLarge } from '../components/ui.jsx';
import { useNav as ae } from '../proto/runtime.jsx';
import { resolveTokens as Za } from '../tokens/theme.js';
import { getConfig } from '../config/store.js';
import { themeTable } from '../tokens/themeTables.js';
import THEME_SQUADS from '../tokens/theme-squads.json';
// Theme squad names / bench photos (theme-squads.json); squad photos themselves swap through asset() (theme-assets.json).
const PGS_sqName = (key, fallback) => THEME_SQUADS[getConfig().theme.mode]?.names?.[key] || fallback;
const PGS_sqBench = (row) => { const p = THEME_SQUADS[getConfig().theme.mode]?.benchImg?.[row]; return p ? dt(p) : PGS_sq('bench-home'); };
// Theme league table (theme-tables.json), else the original LaLiga table. Club row: 4 in the original.
const PGS_rowsNow = () => themeTable(getConfig().theme.mode)?.rows || PGS_table;
const PGS_clubIdx = () => themeTable(getConfig().theme.mode)?.club ?? 4;

function sr({ header, appbar, children, bg = 'var(--colour-surface-default)' }) {
  return l.jsxs('div', { className: 'p-screen', style: { background: bg }, children: [header, l.jsx('main', { className: 'p-main', children }), appbar] });
}

// The match card that was tapped decides the away team; opening a match starts on the Stats tab,
// or on Predictions when it's opened from a "Make Prediction" button.
let z1 = 'opponent-1';
export const setStatsOpponent = (e, tab = 'stats') => { z1 = e; PGS_tab = tab; };
matchNav.open = setStatsOpponent;

/* eslint-disable */
const PGS_h=(type,props,...children)=>{const c=children.flat().filter(x=>x!=null&&x!==!1).map(x=>typeof x==="string"?tx(x):x);return l.jsx(type,{...props||{},children:c.length===0?void 0:c.length===1?c[0]:c})};let PGS_tab="stats",PGS_points=1800;const PGS_blurDark='<svg width="637" height="640" viewBox="0 0 637 640" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><g filter="url(#pgs_blur_dark)"><ellipse cx="318.5" cy="320" rx="198.5" ry="200" style="fill:var(--colour-sports-match-page-header-blur)"/></g><defs><filter id="pgs_blur_dark" x="0" y="0" width="637" height="640" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="60" result="b"/><feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves="3" result="noise" seed="6213"/><feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise"/><feComponentTransfer in="alphaNoise" result="n1"><feFuncA type="discrete" tableValues="'+Array(51).fill(1).concat(Array(49).fill(0)).join(" ")+'"/></feComponentTransfer><feComposite operator="in" in2="b" in="n1" result="n1c"/><feFlood flood-color="rgba(0, 0, 0, 0.25)" result="cf"/><feComposite operator="in" in2="n1c" in="cf" result="c1"/><feMerge><feMergeNode in="b"/><feMergeNode in="c1"/></feMerge></filter></defs></svg>',PGS_blurLight='<svg width="1023" height="964" viewBox="0 0 1023 964" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><g filter="url(#pgs_blur_light)"><ellipse cx="511.5" cy="482" rx="391.5" ry="362" style="fill:var(--colour-sports-match-page-header-blur)"/></g><defs><filter id="pgs_blur_light" x="0" y="0" width="1023" height="964" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="60"/></filter></defs></svg>';function PGS_Card({title,children,bodyClass}){return PGS_h("section",{className:"p-sportscard"},PGS_h("div",{className:"p-sportscard__top"},PGS_h("h2",null,title)),PGS_h("div",{className:"p-sportscard__body"+(bodyClass?" "+bodyClass:"")},children))}const PGS_resultIcon={W:"result-win",L:"result-loss",D:"result-draw"},PGS_resultLabel={W:"Win",L:"Loss",D:"Draw"};function PGS_Form({results}){return PGS_h("ol",{className:"p-form","aria-label":"Last 5 results, oldest first"},results.map((r,i)=>PGS_h("li",{key:i,className:"p-form__pill p-form__pill--"+r+(i===results.length-1?" is-latest":""),"aria-label":PGS_resultLabel[r]},PGS_h(de,{name:PGS_resultIcon[r],size:12,color:"var(--colour-icon-white-overlay)"}))))}const PGS_sq=n=>dt("assets/fixtures/squads/"+n+".png"),PGS_lineups={home:{formation:"4-3-3",lines:[[[1,"\xC1lvaro","home-gk"]],[[3,"Llorente","home-d1"],[3,"Diego","home-d2"],[4,"Natan","home-d3"],[5,"Marc","home-d4"]],[[12,"\xC1ngel","home-m1"],[16,"Fornals","home-m2"],[23,"Junior","home-m3"]],[[19,"Parrott","home-f1"],[27,"Antonio","home-f2"],[20,"Petit","home-f3"]]]},away:{formation:"3-5-2",lines:[[[8,"Pereira","away-gk"]],[[4,"Giay","away-d1"],[12,"Khellven","away-d2"],[22,"Piquerez","away-d3"]],[[27,"Freitas","away-m1"],[17,"Arias","away-m2"],[40,"Allan","away-m3"],[7,"Anderson","away-m4"],[10,"Paulinho","away-m5"]],[[11,"Rodrigues","away-f1"],[9,"Roque","away-f2"]]]}},PGS_coaches=["Machado","Valent\xEDn"],PGS_bench=[[[2,"H\xE9ctor"],[4,"D\xF3ria"]],[[4,"D\xF3ria"],[4,"D\xF3ria"]],[[4,"Gallagherrrrr"],[4,"Rodgrigues"]],[[4,"D\xF3ria"],[4,"D\xF3ria"]],[[4,"D\xF3ria"],[4,"D\xF3ria"]],[[4,"D\xF3ria"],[4,"D\xF3ria"]],[[4,"D\xF3ria"],[4,"D\xF3ria"]],[[4,"D\xF3ria"],[4,"D\xF3ria"]],[[4,"D\xF3ria"],[4,"D\xF3ria"]]],PGS_lineY=[8.3,122.3,227.3,332.3];function PGS_lineX(n){const gap=n>=5?276/(n-1):97;return Array.from({length:n},(_,i)=>187.5+(i-(n-1)/2)*gap)}function PGS_Half({side,onPick}){const lu=PGS_lineups[side],cards=[];return lu.lines.forEach((line,li)=>{const xs=PGS_lineX(line.length),y=li<PGS_lineY.length?PGS_lineY[li]:PGS_lineY[PGS_lineY.length-1];line.forEach(([num,name0,img],pi)=>{const name=PGS_sqName(img,name0),top=side==="home"?y:882-y-65;cards.push(PGS_h("li",{key:side+li+"-"+pi,className:"p-pitch__player",style:{left:xs[pi]-28.5,top}},PGS_h("button",{type:"button",onClick:()=>onPick({side,num,name}),"aria-label":"#"+num+" "+name+", view player"},PGS_h("img",{src:PGS_sq(img),alt:""}),PGS_h("span",null,PGS_h("i",null,num),PGS_h("b",null,name)))))})}),cards}function PGS_TeamHeader({name,logo,formation}){return PGS_h("div",{className:"p-squad__header"},PGS_h("div",{className:"p-squad__team"},PGS_h("img",{src:logo,alt:""}),PGS_h("span",null,name)),PGS_h("span",{className:"p-squad__formation","aria-label":"Formation "+formation},formation))}function PGS_Squads({homeName,awayName,homeLogo,awayLogo,onPick}){return PGS_h("div",{className:"p-squads"},PGS_h("section",{className:"p-squad","aria-label":"Starting line-ups"},PGS_h(PGS_TeamHeader,{name:homeName,logo:homeLogo,formation:PGS_lineups.home.formation}),PGS_h("div",{className:"p-pitch"},PGS_h("img",{className:"p-pitch__goal is-top",src:dt("assets/fixtures/squads/pitch-goal-top.svg"),alt:""}),PGS_h("img",{className:"p-pitch__centre",src:dt("assets/fixtures/squads/pitch-centre.svg"),alt:""}),PGS_h("img",{className:"p-pitch__goal is-bottom",src:dt("assets/fixtures/squads/pitch-goal-bottom.svg"),alt:""}),PGS_h("ul",{"aria-label":homeName+" starting XI"},PGS_h(PGS_Half,{side:"home",onPick})),PGS_h("ul",{"aria-label":awayName+" starting XI"},PGS_h(PGS_Half,{side:"away",onPick}))),PGS_h(PGS_TeamHeader,{name:awayName,logo:awayLogo,formation:PGS_lineups.away.formation})),PGS_h(PGS_Card,{title:"Coach",bodyClass:"p-roster is-coaches"},PGS_h("div",{className:"p-roster__row"},PGS_h("div",{className:"p-roster__person"},PGS_h("img",{src:PGS_sq("coach-home"),alt:""}),PGS_h("b",null,PGS_sqName("coach-home",PGS_coaches[0]))),PGS_h("div",{className:"p-roster__person is-away"},PGS_h("b",null,PGS_coaches[1]),PGS_h("img",{src:PGS_sq("coach-away"),alt:""})))),PGS_h(PGS_Card,{title:"Bench",bodyClass:"p-roster is-bench"},PGS_bench.map(([h,a],i)=>PGS_h("div",{key:i,className:"p-roster__row"},PGS_h("div",{className:"p-roster__person"},PGS_h("img",{src:PGS_sqBench(i),alt:""}),PGS_h("span",null,h[0]),PGS_h("b",null,PGS_sqName("bench-"+i,h[1]))),PGS_h("div",{className:"p-roster__person is-away"},PGS_h("b",null,a[1]),PGS_h("span",null,a[0]),PGS_h("img",{src:PGS_sq("bench-away"),alt:""}))))))}const PGS_markets=[{id:"result",title:"Match Result",options:[["H","1.8"],["D","1.8"],["A","1.8"]]},{id:"first",title:"1st Goal",options:[["H","1.8"],["D","1.8"],["A","1.8"]]},{id:"goals",title:"Match Goals",line:"2.5",options:[["Over","1.8"],["Under","1.8"]]},{id:"dnb",title:"Draw No Bet",options:[["H","1.8"],["A","1.8"]]},{id:"scorer",title:"Goal Scorers",points:!0,options:[["Antony","500"],["Fornals","250"]]}];function PGS_Predictions({pick,onPick,onNext}){return PGS_h("div",{className:"p-predict"},PGS_h("div",{className:"p-predict__markets"},PGS_markets.map(m=>PGS_h("div",{key:m.id,className:"p-predict__row",role:"group","aria-label":m.title},PGS_h("h3",null,m.title),PGS_h("div",{className:"p-predict__options"},m.line&&PGS_h("span",{className:"p-predict__line"},m.line),m.options.map(([label,value])=>{const selected=!!pick&&pick.market===m.id&&pick.label===label;return PGS_h("button",{key:label,type:"button",className:"p-predict__card"+(selected?" is-selected":""),"aria-pressed":selected,onClick:()=>onPick(selected?null:{market:m.id,title:m.title,label,value,points:!!m.points,line:m.line})},PGS_h("span",null,label),PGS_h("b",null,value))}))))),PGS_h("button",{type:"button",className:"p-predict__next"+(pick?"":" is-disabled"),disabled:!pick,onClick:onNext},"Next"))}const PGS_ball=size=>PGS_h("img",{className:"p-ball",src:dt("assets/fixtures/ball.svg"),alt:"",style:{width:size*.9166,height:size*.9166,margin:size*.0417}});function PGS_Ticket({pick,homeName,awayName,onClose,onRemove,onConfirm}){const[wager,setWager]=te.useState(Math.min(500,PGS_points)),odds=parseFloat(pick.value),returns=pick.points?wager+odds:Math.round(wager*odds),profit=returns-wager,name=pick.label==="H"?homeName:pick.label==="A"?awayName:pick.label==="D"?"Draw":pick.line?pick.label+" "+pick.line:pick.label,add=n=>setWager(w=>Math.min(PGS_points,w+n)),fmt=n=>String(n);return PGS_h("div",{className:"p-sheet",role:"dialog","aria-modal":"true","aria-label":"Prediction ticket"},PGS_h("button",{type:"button",className:"p-sheet__scrim","aria-label":"Close ticket",onClick:onClose}),PGS_h("div",{className:"p-sheet__panel"},PGS_h("div",{className:"p-sheet__head"},PGS_h("h2",null,"Ticket"),PGS_h("button",{type:"button","aria-label":"Close",onClick:onClose},PGS_h(de,{name:"pgs-close",size:20}))),PGS_h("div",{className:"p-ticket__balance"},PGS_h("span",null,"Points Balance: "),PGS_h("span",{className:"p-ticket__pill"},PGS_ball(14),PGS_h("b",null,fmt(PGS_points)),PGS_h("small",null,"pts"))),PGS_h("div",{className:"p-ticket"},PGS_h("div",{className:"p-ticket__top"},PGS_h("div",{className:"p-ticket__title"},PGS_h("b",null,name),PGS_h("button",{type:"button","aria-label":"Remove selection",onClick:onRemove},PGS_h(de,{name:"pgs-trash",size:16}))),PGS_h("span",{className:"p-ticket__market"},pick.title," ",PGS_h("b",null,pick.points?"(+"+pick.value+"pts)":"("+pick.value+"x)"))),PGS_h("div",{className:"p-ticket__amounts"},PGS_h("label",{className:"p-ticket__wager"},PGS_h("span",null,"Wager"),PGS_h("span",{className:"p-ticket__wagerval"},PGS_ball(16),PGS_h("input",{inputMode:"numeric",value:wager,onChange:e=>setWager(Math.min(PGS_points,parseInt(e.target.value.replace(/\D/g,"")||"0",10))),"aria-label":"Wager in points"}))),PGS_h("div",{className:"p-ticket__returns"},PGS_h("span",null,"Returns"),PGS_h("span",null,PGS_h("b",null,fmt(returns)),PGS_h("small",null,"pts")))),PGS_h("div",{className:"p-ticket__picker"},[1,5,10,100,1e3].map(n=>PGS_h("button",{key:n,type:"button",onClick:()=>add(n)},"+",n)))),PGS_h("div",{className:"p-ticket__hint"},PGS_h(de,{name:"pgs-info",size:20}),PGS_h("p",null,"Once confirmed, your prediction cannot be changed. Points will be deducted immediately.")),PGS_h("div",{className:"p-ticket__summary"},PGS_h("div",null,PGS_h("span",null,"Total Wager"),PGS_h("span",null,fmt(wager),PGS_h("small",null,"pts"))),PGS_h("div",{className:"is-profit"},PGS_h("span",null,"Potential Profit"),PGS_h("span",null,"+",fmt(profit),PGS_h("small",null,"pts"))),PGS_h("div",{className:"is-total"},PGS_h("span",null,"Total Est. Returns"),PGS_h("span",null,PGS_ball(22),PGS_h("b",null,fmt(returns)),PGS_h("small",null,"pts")))),PGS_h("button",{type:"button",className:"p-ticket__confirm",disabled:wager<=0,onClick:()=>onConfirm({wager,returns,title:pick.title,name,odds:pick.points?"+"+pick.value+"pts":pick.value+"x"})},"Confirm Prediction")))}function PGS_Success({res,homeName,awayName,onClose}){const okRef=te.useRef(null);return te.useEffect(()=>{okRef.current&&okRef.current.focus()},[]),PGS_h("div",{className:"p-modal",role:"alertdialog","aria-modal":"true","aria-labelledby":"pgs-success-title","aria-describedby":"pgs-success-desc"},PGS_h("button",{type:"button",className:"p-sheet__scrim","aria-label":"Close",onClick:onClose}),PGS_h("div",{className:"p-success"},PGS_h("div",{className:"p-success__head"},PGS_h("img",{src:dt("assets/fixtures/success.svg"),alt:""}),PGS_h("h2",{id:"pgs-success-title"},"Success"),PGS_h("p",{id:"pgs-success-desc"},"Your prediction was submitted!")),PGS_h("div",{className:"p-success__ticket"},PGS_h("b",null,res.title,": ",res.name," (",res.odds,")"),PGS_h("span",{className:"p-success__match"},homeName," vs ",awayName),PGS_h("span",{className:"p-success__bet"},"You bet:",PGS_h("span",null,PGS_ball(16),PGS_h("em",null,res.wager," points")))),PGS_h("div",{className:"p-success__totals"},PGS_h("div",null,PGS_h("span",null,"Total Wager"),PGS_h("span",{className:"p-success__amt"},PGS_ball(20),res.wager)),PGS_h("i",{"aria-hidden":"true"}),PGS_h("div",{className:"is-returns"},PGS_h("span",null,"Total Est. Returns"),PGS_h("span",{className:"p-success__amt"},PGS_ball(20),res.returns))),PGS_h("button",{ref:okRef,type:"button",className:"p-ticket__confirm",onClick:onClose},"OK")))}const PGS_table=[["Barcelona","t1","cover",38,"+51",79],["Real Madrid","assets/logos/real-madrid.png","contain",38,"+33",76],["Villarreal","t3","cover",38,"+24",60],["Atl\xE9tico Madrid","t4",[80.26,-.65,8.53,99.46],38,"+24",67],["Betis","assets/fixtures/player/league-crest.png",[98.26,12,.39,78.48],38,"+11",64],["Celta","t6","cover",38,"+20",63],["Getafe","t7","cover",38,"+4",60],["Rayo Vallecano","t8","cover",38,"-4",51],["Valencia","assets/fixtures/player/rm-valencia.png",[113.47,3.99,-16.19,92.69],38,"-3",49],["Real Sociedad","t10",[96.15,6.8,1.2,85.23],38,"-1",48],["Espanyol","t11","cover",38,"-17",45],["Athletic","t12","cover",38,"-13",44],["Sevilla","t13","cover",38,"-6",43],["Alav\xE9s","t14",[104.46,8.41,3.41,82.39],38,"-15",43],["Elche","assets/logos/elche.png","cover",38,"-34",35],["Levante","assets/fixtures/player/rm-levante.png","cover",38,"-47",17]];function PGS_Logo({src,crop,size}){const style=Array.isArray(crop)?{position:"absolute",height:crop[0]+"%",left:crop[1]+"%",top:crop[2]+"%",width:crop[3]+"%",maxWidth:"none"}:{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:crop};return PGS_h("span",{className:"p-logo",style:{width:size,height:size}},PGS_h("img",{src,alt:"",style}))}function PGS_Table(){const t=n=>dt(n.indexOf("/")>=0?n:"assets/fixtures/table/"+n+".png");return PGS_h("div",{className:"p-pgs__cards"},PGS_h("section",{className:"p-table","aria-label":"LaLiga 2025/2026 standings"},PGS_h("div",{className:"p-table__title"},PGS_h(PGS_Logo,{src:t("laliga"),crop:[114.71,-7.72,-9.17,114.71],size:24}),PGS_h("h2",null,"LaLiga 2025/2026")),PGS_h("table",null,PGS_h("thead",null,PGS_h("tr",null,PGS_h("th",{className:"is-pos"},"#"),PGS_h("th",{className:"is-team"},"Team"),PGS_h("th",null,"GP"),PGS_h("th",null,"Diff"),PGS_h("th",null,"PTS"))),PGS_h("tbody",null,PGS_rowsNow().map(([name,logo,crop,gp,diff,pts],i)=>PGS_h("tr",{key:name},PGS_h("td",{className:"is-pos"},i+1),PGS_h("td",{className:"is-team"},PGS_h("span",null,PGS_h(PGS_Logo,{src:t(logo),crop,size:16}),name)),PGS_h("td",null,gp),PGS_h("td",null,diff),PGS_h("td",null,pts)))))))}let PGS_player=null;const PGS_playerMatches=[{date:"August 29, 2026",comp:"LaLiga",opp:"Levante",logo:"rm-levante",score:["5","2"],min:"65\u2019",rating:"7.05"},{date:"August 25, 2026",comp:"LaLiga",opp:"Valencia",logo:"rm-valencia",score:["1","0"],min:"65\u2019",rating:"7.05"}];function PGS_CareerTable({title,rows,logo}){return PGS_h("section",{className:"p-table p-career"},PGS_h("div",{className:"p-table__title"},PGS_h("h2",null,title)),PGS_h("table",null,PGS_h("thead",null,PGS_h("tr",null,PGS_h("th",{className:"is-team"},"Team"),PGS_h("th",null,"GP"),PGS_h("th",null,"G"),PGS_h("th",null,"A"))),PGS_h("tbody",null,rows.map(([name,season,gp,g,a],i)=>PGS_h("tr",{key:i},PGS_h("td",{className:"is-team"},PGS_h("span",null,PGS_h("img",{className:"p-career__logo",src:logo,alt:""}),PGS_h("span",{className:"p-career__team"},PGS_h("b",null,name),PGS_h("small",null,season)))),PGS_h("td",null,gp),PGS_h("td",null,g),PGS_h("td",null,a))))))}
// Fixtures / Squads / Career — 638:19342 (Senior Career + National Team)
function PGS_Career(){const team=je("team.main"),crest=qe("club-crest");return PGS_h(l.Fragment,null,PGS_h(PGS_CareerTable,{title:"Senior Career",logo:crest,rows:[[team,"2025/2026",38,8,20],[team,"2024/2025",38,20,10],[team,"2023/2024",38,12,8],[team,"2022/2023",24,8,4],[team,"2021/2022",20,6,4],[team,"2020/2021",14,3,2]]}),PGS_h(PGS_CareerTable,{title:"National Team",logo:dt("assets/fixtures/player/flag-esp.png"),rows:Array.from({length:6},()=>["Spain","2025/2026",12,6,4])}))}
function PGS_PlayerScreen(){const[ptab,setPtab]=te.useState("stats"),nav=ae(),p=n=>dt("assets/fixtures/player/"+n),team=je("team.main"),crest=qe("club-crest");return PGS_h(sr,{header:PGS_h(cn,{back:nav.canBack,title:"",ctas:["bell","search"]}),appbar:PGS_h(fn,{active:"none"})},PGS_h("div",{className:"p-player"},PGS_h("div",{className:"p-player__hero"},PGS_h("img",{className:"p-player__photo",src:qe("player-cutout"),alt:""}),PGS_h("div",{className:"p-player__id"},PGS_h("div",{className:"p-player__top"},PGS_h("span",{className:"p-player__tag"},PGS_h("img",{src:crest,alt:""}),team),PGS_h("h1",null,je("player.name"))),PGS_h("div",{className:"p-player__num"},PGS_h("b",null,"3"),PGS_h("span",null,"Defender")))),PGS_h("div",{className:"p-player__body"},PGS_h("div",{className:"p-tabs p-tabs--start p-tabs--fill",role:"tablist"},["stats","career"].map(t=>PGS_h("button",{key:t,role:"tab","aria-selected":ptab===t,className:"p-tabs__item"+(ptab===t?" is-active":""),onClick:()=>setPtab(t)},t==="stats"?"Stats":"Career"))),PGS_h("div",{className:"p-pgs__cards"},ptab==="career"&&PGS_h(PGS_Career,null),ptab==="stats"&&PGS_h(PGS_Card,{title:"Info",bodyClass:"p-pinfo"},PGS_h("div",{className:"p-pinfo__row is-top"},PGS_h("div",{className:"p-stat"},PGS_h("b",null,"185 cm"),PGS_h("span",null,"Height")),PGS_h("div",{className:"p-stat"},PGS_h("b",null,"33 yrs"),PGS_h("span",null,"Age")),PGS_h("div",{className:"p-stat"},PGS_h("b",{className:"p-stat__flag"},PGS_h("img",{src:p("flag-esp.png"),alt:""}),"ESP"),PGS_h("span",null,"Country"))),PGS_h("div",{className:"p-pinfo__row is-bottom"},PGS_h("div",{className:"p-stat is-w48"},PGS_h("b",null,"Right"),PGS_h("span",null,"Pref. Foot")),PGS_h("div",{className:"p-stat is-w48"},PGS_h("b",null,"CB"),PGS_h("span",null,"Position")))),ptab==="stats"&&PGS_h("section",{className:"p-sportscard"},PGS_h("div",{className:"p-sportscard__top is-logo"},PGS_h(PGS_Logo,{src:p("league-crest.png"),crop:[114.71,-7.72,-9.17,114.71],size:24}),PGS_h("h2",null,"LaLiga 2025/2026")),PGS_h("div",{className:"p-sportscard__body p-pseason"},PGS_h("div",{className:"p-stat"},PGS_h("b",null,"18"),PGS_h("span",null,"Matches")),PGS_h("div",{className:"p-stat is-w48"},PGS_h("b",null,"1,229"),PGS_h("span",null,"Minutes")),PGS_h("div",{className:"p-stat"},PGS_h("b",null,"1"),PGS_h("span",null,"Goals")),PGS_h("div",{className:"p-stat"},PGS_h("b",null,"0"),PGS_h("span",null,"Assists")),PGS_h("div",{className:"p-stat"},PGS_h("em",{className:"p-rating"},"7.05"),PGS_h("span",null,"Rating")))),ptab==="stats"&&PGS_h(PGS_Card,{title:"Recent Matches",bodyClass:"p-precent"},PGS_playerMatches.map(m=>PGS_h("div",{key:m.date,className:"p-precent__match"},PGS_h("div",{className:"p-h2h__top"},PGS_h("span",{className:"p-h2h__date"},m.date),PGS_h("span",{className:"p-h2h__tag"},m.comp)),PGS_h("div",{className:"p-precent__row"},PGS_h("div",{className:"p-precent__team"},PGS_h("img",{src:p(m.logo+".png"),alt:""}),PGS_h("div",null,PGS_h("b",null,m.opp),PGS_h("span",null,m.score[0]," - ",PGS_h("i",null,m.score[1])))),PGS_h("div",{className:"p-precent__meta"},PGS_ball(16),PGS_h("span",{className:"p-precent__min"},m.min),PGS_h("em",{className:"p-rating"},m.rating))))))))))}function PGS_Screen(){const nav=ae(),opp=z1,homeName=je("team.main"),awayName=je(opp),homeLogo=qe("club-crest"),awayLogo=qe(opp),kickoff=je("fixture.kickoff"),league=je("fixture.league"),venue=je("fixture.venue"),isLight=!!Za(nav.config.theme.mode,nav.config.theme.overrides)["theme/light"],[notify,setNotify]=te.useState(!1),[tab,setTabState]=te.useState(PGS_tab),setTab=t=>{PGS_tab=t,setTabState(t)},[pick,setPick]=te.useState(null),[ticket,setTicket]=te.useState(!1),[success,setSuccess]=te.useState(null),tabs=[{id:"stats",label:"Stats"},{id:"predictions",label:"Predictions"},{id:"squads",label:"Squads"},{id:"table",label:"Table"}].filter(t=>t.id!=="predictions"||nav.enabled("predictions")),h2h=[1,2,3].map(n=>({id:n,date:"May 10, 2025",comp:"Libertadores",hs:3,as:2}));return PGS_h(sr,{appbar:PGS_h(l.Fragment,null,PGS_h(fn,{active:"none"}),ticket&&pick&&PGS_h(PGS_Ticket,{pick,homeName,awayName,onClose:()=>setTicket(!1),onRemove:()=>{setTicket(!1),setPick(null)},onConfirm:res=>{PGS_points-=res.wager,setTicket(!1),setPick(null),setSuccess(res)}}),success&&PGS_h(PGS_Success,{res:success,homeName,awayName,onClose:()=>setSuccess(null)}))},PGS_h("div",{className:"p-pgs"},PGS_h("div",{className:"p-pgs__top"},PGS_h(cn,{back:nav.canBack,title:"",ctas:["bell","search"]}),PGS_h("div",{className:"p-pgs__hero"},isLight?PGS_h(l.Fragment,null,PGS_h("img",{className:"p-pgs__net is-light",src:dt("assets/fixtures/net.png"),alt:""}),PGS_h("span",{className:"p-pgs__blur is-light","aria-hidden":"true",dangerouslySetInnerHTML:{__html:PGS_blurLight}})):PGS_h(l.Fragment,null,PGS_h("span",{className:"p-pgs__blur is-dark","aria-hidden":"true",dangerouslySetInnerHTML:{__html:PGS_blurDark}}),PGS_h("img",{className:"p-pgs__net is-dark",src:dt("assets/fixtures/net.png"),alt:""})),PGS_h("div",{className:"p-pgs__teams",role:"img","aria-label":homeName+" vs "+awayName},PGS_h("img",{src:homeLogo,alt:""}),PGS_h("span",{className:"p-pgs__vs"},"VS"),PGS_h("img",{src:awayLogo,alt:""})),PGS_h("div",{className:"p-pgs__infocta"},PGS_h("div",{className:"p-pgs__info"},PGS_h("span",{className:"p-pgs__date"},kickoff),PGS_h("span",{className:"p-pgs__league"},league),PGS_h("span",{className:"p-pgs__venue"},venue)),PGS_h("div",{className:"p-pgs__ctas"},PGS_h(Ft,{variant:"primary",icon:"ticket",onClick:()=>nav.dead()},"Get Tickets"),PGS_h("button",{className:"p-btn p-btn--tertiary","aria-pressed":notify,onClick:()=>{const next=!notify;setNotify(next),nav.notify(next?"We'll remind you before kick-off":"Reminder removed")}},PGS_h(de,{name:"notify-add",size:18,color:"var(--colour-icon-on-tertiary)"}),PGS_h("span",null,"Notify Me")))))),PGS_h("div",{className:"p-tabs p-tabs--start p-pgs__tabs",role:"tablist"},tabs.map(t=>PGS_h("button",{key:t.id,role:"tab","aria-selected":t.id===tab,className:"p-tabs__item"+(t.id===tab?" is-active":""),onClick:()=>setTab(t.id)},t.label))),tab==="squads"?PGS_h(PGS_Squads,{homeName,awayName,homeLogo,awayLogo,onPick:pl=>{PGS_player=pl,nav.go("player-stats")}}):tab==="table"?PGS_h(PGS_Table,null):tab==="predictions"?PGS_h(PGS_Predictions,{pick,onPick:setPick,onNext:()=>setTicket(!0)}):PGS_h("div",{className:"p-pgs__cards"},PGS_h(PGS_Card,{title:"Past Meetings",bodyClass:"p-pastmeet"},[["27","Wins"],["13","Draws"],["6","Losses"]].map(([v,l])=>PGS_h("div",{key:l,className:"p-pastmeet__stat"},PGS_h("b",null,v),PGS_h("span",null,l))),PGS_h("span",{className:"p-pastmeet__goals is-num"},"127"),PGS_h("span",{className:"p-pastmeet__goals"},"Goals For"),PGS_h("span",{className:"p-pastmeet__goals is-num"},"66")),PGS_h(PGS_Card,{title:"Recent Form",bodyClass:"p-recentform"},PGS_h("div",{className:"p-recentform__row"},PGS_h("div",{className:"p-recentform__team"},PGS_h("img",{src:homeLogo,alt:""}),PGS_h("span",{className:"is-main"},homeName)),PGS_h(PGS_Form,{results:["W","L","D","W","W"]})),PGS_h("div",{className:"p-recentform__row"},PGS_h("div",{className:"p-recentform__team"},PGS_h("img",{src:awayLogo,alt:""}),PGS_h("span",null,awayName)),PGS_h(PGS_Form,{results:["D","L","L","W","D"]}))),PGS_h(PGS_Card,{title:"H2H Matches",bodyClass:"p-h2h"},h2h.map(m=>PGS_h("div",{key:m.id,className:"p-h2h__match"},PGS_h("div",{className:"p-h2h__top"},PGS_h("span",{className:"p-h2h__date"},m.date),PGS_h("span",{className:"p-h2h__tag"},m.comp)),PGS_h("div",{className:"p-h2h__mid"},PGS_h("div",{className:"p-h2h__side is-home"},PGS_h("span",null,homeName),PGS_h("img",{src:homeLogo,alt:""})),PGS_h("span",{className:"p-h2h__score"},PGS_h("span",{className:m.hs<m.as?"is-muted":void 0},m.hs)," - ",PGS_h("span",{className:m.as<m.hs?"is-muted":void 0},m.as)),PGS_h("div",{className:"p-h2h__side"},PGS_h("img",{src:awayLogo,alt:""}),PGS_h("span",null,awayName)))))))))};
export { PGS_Screen as PreGameStats, PGS_PlayerScreen as PlayerStats, PGS_blurDark, PGS_blurLight };

// ---- Teammate's second module (artifact 2026-11-03), ported verbatim by scratchpad apply.py:
// Fixtures / Results, Leagues, Post-game + Live stats, League page, Team page (PGR_/PGL_) and Predictions (PGP_).
// Minified names mapped back: Pi→setStatsOpponent, qe→cn (Header), We→fn (AppBar), Ee→qe (useSlot), ue→je (useCopy),
// xe→dt (asset), Rn→sr (Screen), ut→MatchCardLarge, ve→SectionTitle, F2→SubNav, plus the PGS_ internals above.
const PGR_svg = {
      graph:
        '<svg class="p-pgr__graph" preserveAspectRatio="none" viewBox="0 0 312 128.682" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M57.1462 59.9362C53.821 62.1453 52.2658 64.9394 51.691 66.7292C51.5074 67.3012 51.965 67.8274 52.5657 67.8262L152.995 67.6393C153.688 67.638 154.17 66.9489 153.933 66.2974L151.669 60.0769C151.644 60.0078 151.627 59.9351 151.617 59.8623C150.995 55.4283 147.785 53.1626 146.153 52.537C146.087 52.5118 146.025 52.4836 145.968 52.4433C144.496 51.4187 142.694 47.353 141.965 45.4118C140.032 39.894 136.822 38.0035 135.459 37.7481C132.931 37.135 130.192 34.1716 129.139 32.7666C128.395 31.847 126.722 31.2339 125.978 31.0423C123.45 30.5824 121.827 27.9129 121.331 26.6356L118.543 18.0139C117.516 14.2366 115.563 10.1491 114.677 8.50404C114.651 8.45638 114.622 8.4123 114.588 8.37084C114.075 7.75994 113.45 7.73142 113.1 7.81671C113.009 7.83876 112.93 7.88604 112.861 7.94888C110.97 9.67324 109.299 17.2508 108.69 20.8878C108.101 25.9 104.907 38.6007 103.342 44.4856C103.313 44.5942 103.268 44.6937 103.201 44.7836C102.173 46.1543 100.865 45.7831 100.325 45.4118C99.1353 44.3389 98.0943 41.7716 97.7225 40.622L95.12 32.0003C94.6805 30.6414 92.8821 25.9484 91.9993 23.6719C91.9726 23.6031 91.9384 23.5375 91.8957 23.4772C90.5793 21.6146 89.2874 22.7532 88.7996 23.5702C87.4612 25.4095 85.5155 33.6608 84.71 37.5565L80.9921 50.7765C79.3794 54.5542 76.791 52.5593 75.6494 51.0335C75.6167 50.9897 75.5889 50.9435 75.5643 50.8947L70.0244 39.8557C69.1321 38.4762 67.7936 38.1313 67.236 38.1313C65.154 38.1313 63.642 42.8573 63.1463 45.2203C61.9895 49.6914 58.9814 56.457 57.5057 59.5285C57.4258 59.6948 57.2998 59.8341 57.1462 59.9362Z" class="is-pos"/><path d="M157.608 74.2181C156.081 73.6872 154.936 70.8479 154.346 68.7554C154.174 68.1434 154.647 67.5586 155.283 67.5586H221.062C221.747 67.5586 222.229 68.231 222.009 68.8795L218.436 79.4269C218.391 79.5601 218.318 79.6823 218.222 79.7855L214.513 83.7902C214.48 83.826 214.453 83.8587 214.426 83.8996C212.18 87.325 207.398 107.416 207.028 108.56C206.656 109.709 204.983 112.966 204.239 112.966C203.699 112.966 202.913 112.228 202.495 111.758C202.418 111.671 202.36 111.569 202.321 111.46L199.964 104.919L197.547 97.8304L194.804 91.2336C194.774 91.1612 194.736 91.0918 194.688 91.03C193.816 89.9093 192.89 90.1096 192.528 90.3582C191.041 91.2779 189.678 95.4674 189.182 97.4472L184.721 119.672C183.828 123.504 182.738 126.378 182.304 127.336C181.609 128.768 180.645 128.082 180.167 127.465C180.102 127.381 180.03 127.306 179.965 127.222C178.67 125.549 175.067 110.899 173.381 103.578C172.935 100.819 170.717 98.3413 169.663 97.4472C166.54 95.3014 163.529 85.3129 162.413 80.587C162.125 77.7663 159.372 75.317 157.905 74.3534C157.813 74.2935 157.711 74.2539 157.608 74.2181Z" class="is-neg"/><path d="M228.585 59.6787C225.401 61.59 223.613 64.6545 222.834 66.693C222.605 67.294 223.072 67.8924 223.715 67.8939L300.606 68.0791C301.296 68.0808 301.78 67.3997 301.552 66.7485L299.645 61.3044C299.617 61.2252 299.577 61.1467 299.531 61.0762C297.633 58.1372 300.644 58.8215 294.584 53.5214C288.449 48.1568 288.077 43.5585 287.52 42.2174C287.094 41.1945 283.932 38.2329 282.188 36.686C282.028 36.5443 281.918 36.357 281.873 36.1484L275.622 7.53891C275.331 4.08234 273.586 1.57129 272.7 0.692053C272.665 0.657518 272.626 0.624369 272.583 0.599685C270.191 -0.794548 265.939 12.9042 264.097 19.9925C261.569 26.5833 258.21 22.2278 256.847 19.2261C254.765 13.7082 252.014 9.90187 250.899 8.68843C250.088 7.99214 249.216 8.19206 248.784 8.42604C248.705 8.46918 248.63 8.50563 248.551 8.55137C246.255 9.89635 241.043 28.0427 240.86 28.231C240.713 28.3825 237.648 31.6663 236.081 33.3458C236.045 33.3853 236.01 33.4144 235.981 33.46C235.25 34.6092 231.161 50.6164 229.067 59.0431C229 59.3133 228.824 59.5354 228.585 59.6787Z" class="is-pos"/><path d="M308.888 76.9425C305.099 75.134 302.787 70.3569 302.059 68.0688C302.039 68.0048 302.087 67.9419 302.154 67.9419H311.4C311.455 67.9419 311.5 67.9867 311.5 68.0419V80.1896C311.5 80.31 311.274 80.3409 311.232 80.2279C310.628 78.5749 309.486 77.3907 308.905 76.9526C308.9 76.9486 308.894 76.9454 308.888 76.9425Z" class="is-neg"/><path d="M8.25891 74.7917C6.032 72.5448 2.31502 69.4159 0.594219 68.0182C0.533617 67.969 0.5 67.8964 0.5 67.8183C0.5 67.675 0.616453 67.559 0.759754 67.5595L50.2517 67.745C50.929 67.7476 51.4079 68.4084 51.1995 69.0528L48.6465 76.9467C47.7542 80.7785 45.4243 82.7583 44.3709 83.2693C42.2889 84.6487 40.5291 89.3364 39.9094 91.5078C39.2052 96.5884 35.8889 102.757 34.0659 105.621C33.8858 105.903 33.5723 106.072 33.2401 106.026C32.9975 105.993 32.7625 105.945 32.5967 105.907C32.5147 105.888 32.4291 105.882 32.3497 105.854C31.0268 105.386 27.2086 98.0898 25.4097 94.3817C24.17 91.9681 21.7712 90.6833 20.4886 90.2532C20.3043 90.1914 20.1359 90.0918 20.0139 89.9405C18.3269 87.8472 15.2561 81.7516 13.8843 78.8626C12.6536 76.4666 10.176 75.399 8.82164 75.0938C8.60936 75.0459 8.41209 74.9462 8.25891 74.7917Z" class="is-neg"/></g></svg>',
      ball16:
        '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M7.33331 2.94273L6.56353 2.17303C5.15067 2.52015 3.93449 3.36774 3.11375 4.51712L3.41426 5.63861L5.2534 6.36311L7.33331 4.97655V2.94273ZM1.99997 8C1.99997 7.70062 2.0219 7.40631 2.06424 7.11867L2.93875 6.88436L4.73732 7.59289L5.20857 10.4375L4.0584 11.5877H3.19034C2.44268 10.587 1.99997 9.34524 1.99997 8ZM5.17543 13.2949C6.01719 13.7449 6.97882 14 7.99997 14C9.09891 14 10.1289 13.7045 11.0146 13.1888V12.5465L9.80149 11.3333H6.19842L5.17543 12.3564V13.2949ZM12.035 11.6812H12.7383C13.529 10.6649 14 9.38747 14 8C14 7.79911 13.9901 7.60062 13.9708 7.4048L13.066 6.8824L11.2626 7.59289L10.7913 10.4375L12.035 11.6812ZM12.9891 4.66588C12.1689 3.44101 10.9097 2.535 9.43642 2.17305L8.66664 2.94291V4.97655L10.7465 6.36311L12.381 5.71924L12.9891 4.66588ZM0.666641 8C0.666641 3.94991 3.94989 0.666667 7.99997 0.666667C12.05 0.666667 15.3333 3.94991 15.3333 8C15.3333 12.05 12.05 15.3333 7.99997 15.3333C3.94989 15.3333 0.666641 12.05 0.666641 8ZM6.06134 7.42693L6.48762 10H9.51224L9.93855 7.42693L7.99997 6.13457L6.06134 7.42693Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/></g></svg>',
      ball18:
        '<svg aria-hidden="true" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M8.24997 3.31057L7.38397 2.44466C5.7945 2.83517 4.4263 3.78871 3.50297 5.08176L3.84104 6.34344L5.91007 7.1585L8.24997 5.59862V3.31057ZM2.24997 9C2.24997 8.6632 2.27464 8.3321 2.32227 8.0085L3.30609 7.7449L5.32948 8.542L5.85964 11.7422L4.5657 13.0362H3.58913C2.74801 11.9104 2.24997 10.5134 2.24997 9ZM5.82236 14.9568C6.76934 15.463 7.85117 15.75 8.99997 15.75C10.2363 15.75 11.395 15.4176 12.3915 14.8374V14.1148L11.0267 12.75H6.97322L5.82236 13.9009V14.9568ZM13.5394 13.1414H14.3306C15.2202 11.998 15.75 10.5609 15.75 9C15.75 8.774 15.7389 8.5507 15.7172 8.3304L14.6993 7.7427L12.6704 8.542L12.1402 11.7422L13.5394 13.1414ZM14.6128 5.24912C13.69 3.87114 12.2734 2.85187 10.616 2.44468L9.74997 3.31077V5.59862L12.0898 7.1585L13.9286 6.43415L14.6128 5.24912ZM0.749971 9C0.749971 4.44365 4.44362 0.75 8.99997 0.75C13.5563 0.75 17.25 4.44365 17.25 9C17.25 13.5563 13.5563 17.25 8.99997 17.25C4.44362 17.25 0.749971 13.5563 0.749971 9ZM6.81901 8.3553L7.29857 11.25H10.7013L11.1809 8.3553L8.99997 6.90139L6.81901 8.3553Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/></g></svg>',
      ht: '<svg aria-hidden="true" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M16 0.5C18.0355 0.5 20.051 0.900919 21.9316 1.67987C23.8121 2.45882 25.5208 3.60054 26.9602 5.03985C28.3995 6.47915 29.5412 8.18786 30.3201 10.0684C31.0991 11.949 31.5 13.9645 31.5 16C31.5 18.0355 31.0991 20.051 30.3201 21.9316C29.5412 23.8121 28.3995 25.5208 26.9602 26.9602C25.5208 28.3995 23.8121 29.5412 21.9316 30.3201C20.051 31.0991 18.0355 31.5 16 31.5" stroke="currentColor"/><path d="M16 0.5C13.9645 0.5 11.949 0.900919 10.0684 1.67987C8.18786 2.45882 6.47915 3.60054 5.03984 5.03985C3.60054 6.47915 2.45881 8.18786 1.67987 10.0684C0.900919 11.949 0.5 13.9645 0.5 16C0.5 18.0355 0.90092 20.051 1.67987 21.9316C2.45882 23.8121 3.60054 25.5208 5.03985 26.9602C6.47915 28.3995 8.18786 29.5412 10.0684 30.3201C11.949 31.0991 13.9645 31.5 16 31.5" stroke="var(--colour-border-subtle)"/><g><path d="M15.999 21H14.463V17.196H10.695V21H9.159V12.432H10.695V15.888H14.463V12.432H15.999V21Z" fill="currentColor"/><path d="M21.3013 21H19.7653V13.728H17.3053V12.432H23.7613V13.728H21.3013V21Z" fill="currentColor"/></g></g></svg>',
      ft: '<svg aria-hidden="true" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="currentColor"/><g><path d="M11.5175 20.284H10.0055V11.716H14.8655V13H11.5175V15.52H14.6375V16.804H11.5175V20.284Z" fill="currentColor"/><path d="M19.5345 20.284H17.9985V13.012H15.5385V11.716H21.9945V13.012H19.5345V20.284Z" fill="currentColor"/></g></g></svg>',
      sub: '<svg aria-hidden="true" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M6 5.25H15M12 8.25L15 5.25L12 2.25M12 12.75H3M6 9.75L3 12.75L6 15.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor"/></g></svg>',
      trophy:
        '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M10.3332 10.4167C10.3332 10.3705 10.2959 10.3333 10.2498 10.3333H5.75015C5.70434 10.3333 5.66682 10.3709 5.66682 10.4167V12H10.3332V10.4167ZM5.0002 13.3333C4.6466 13.3333 4.30758 13.4739 4.05755 13.724C3.97465 13.8069 3.90497 13.9002 3.84728 14H12.1527C12.095 13.9002 12.0253 13.8069 11.9424 13.724C11.6924 13.4739 11.3534 13.3333 10.9998 13.3333H5.0002ZM8.45049 8.31185C8.15036 8.33806 7.84898 8.3381 7.54885 8.31185C7.50092 8.54517 7.43831 8.77485 7.36137 9H8.63928C8.56224 8.77477 8.49849 8.54526 8.45049 8.31185ZM8 2.33333C6.70255 2.33333 5.42314 2.41173 4.16692 2.5651V3.16667C4.16692 4.36356 4.71462 5.43193 5.57568 6.13607L5.75015 6.27083C6.16419 6.57183 6.63527 6.78679 7.13547 6.90234C7.70437 7.03353 8.29562 7.03353 8.86452 6.90234C9.43636 6.77037 9.96997 6.50817 10.4243 6.13607L10.5825 5.99935C11.352 5.29743 11.8331 4.2886 11.8331 3.16667V2.5651C10.5773 2.41217 9.29791 2.33333 8 2.33333ZM2.86753 3.76628C2.70631 3.7938 2.54555 3.82282 2.38514 3.85286C2.56122 4.31488 2.83879 4.73419 3.20019 5.07878C3.03514 4.66483 2.92055 4.22491 2.86753 3.76628ZM13.1318 3.76628C13.0788 4.22497 12.9642 4.66478 12.7992 5.07878C13.1608 4.73403 13.4381 4.31452 13.6142 3.85221C13.4537 3.82215 13.2928 3.79373 13.1318 3.76628ZM11.6664 12.0853C12.1237 12.2034 12.5455 12.4416 12.8851 12.7812C13.3851 13.2813 13.6663 13.9594 13.6663 14.6667C13.6663 14.8435 13.596 15.013 13.471 15.138C13.346 15.263 13.1765 15.3333 12.9997 15.3333H3.00033C2.63216 15.3333 2.33371 15.0349 2.33371 14.6667C2.33371 13.9594 2.61484 13.2813 3.11491 12.7812C3.45454 12.4416 3.87631 12.2034 4.33357 12.0853V10.4167C4.33357 9.63448 4.96801 9 5.75015 9H5.92657C6.07179 8.68943 6.17923 8.36308 6.24686 8.02734C5.7625 7.85257 5.30709 7.60523 4.89473 7.29427C3.94116 7.16932 3.04729 6.75226 2.33761 6.09831C1.57847 5.39866 1.07296 4.46697 0.899559 3.44922C0.839452 3.0963 1.06878 2.75882 1.41906 2.6849C1.88696 2.58616 2.35857 2.49804 2.83367 2.41992V1.98047C2.83377 1.64832 3.07831 1.36668 3.4072 1.32031C4.90865 1.10863 6.44236 1 8 1C9.55829 1 11.0922 1.10867 12.5928 1.31966C12.9217 1.36603 13.1662 1.64766 13.1663 1.97982V2.41927C13.64 2.49708 14.1119 2.58554 14.5816 2.6849C14.9317 2.75897 15.1605 3.09643 15.1004 3.44922C14.927 4.46697 14.4215 5.39865 13.6624 6.09831C12.9526 6.7525 12.0583 7.16931 11.1046 7.29427C10.6922 7.60522 10.237 7.85262 9.75248 8.02734C9.82022 8.36317 9.9287 8.68938 10.0741 9H10.2498C11.033 9.00001 11.6664 9.63487 11.6664 10.4167V12.0853Z" fill="currentColor"/></g></svg>',
    },
    PGR_h = (type, props, ...children) => {
      // theme text (tx) applied to text children at render
      const c = children.flat().filter((x) => x != null && x !== !1).map((x) => (typeof x === "string" ? tx(x) : x));
      return l.jsx(type, {
        ...(props || {}),
        children: c.length === 0 ? void 0 : c.length === 1 ? c[0] : c,
      });
    },
    PGR_matches = {
      "live-elche": {
        kind: "live",
        opp: "opponent-3",
        hs: 1,
        as: 0,
        minute: 82,
        league: "La Liga",
      },
      "live-home": {
        kind: "live",
        opp: "opponent-1",
        hs: 3,
        as: 2,
        minute: 82,
        league: "La Liga",
      },
      "res-rm": {
        kind: "result",
        opp: "opponent-1",
        hs: 2,
        as: 0,
        date: "Jan 12, 2026",
        kickoff: "Mon 12 January, 14:30",
        league: "La Liga",
        comp: "2025-2026 La Liga \xB7 Men\u2019s \xB7 Group Stage",
        replay: !0,
      },
      "res-elche": {
        kind: "result",
        opp: "opponent-3",
        hs: 1,
        as: 1,
        date: "Jan 4, 2026",
        kickoff: "Sun 4 January, 18:30",
        league: "Libertadores",
        comp: "2025-2026 Libertadores \xB7 Women\u2019s \xB7 Group Stage",
      },
      "res-pal-1": {
        kind: "result",
        opp: "opponent-2",
        hs: 3,
        as: 2,
        date: "Feb 8, 2026",
        kickoff: "Sun 8 February, 16:15",
        league: "Libertadores",
        comp: "2025-2026 Libertadores \xB7 Women\u2019s \xB7 Group Stage",
      },
      "res-pal-2": {
        kind: "result",
        opp: "opponent-2",
        hs: 3,
        as: 2,
        date: "Feb 15, 2026",
        kickoff: "Sun 15 February, 16:15",
        league: "Libertadores",
        comp: "2025-2026 Libertadores \xB7 Women\u2019s \xB7 Group Stage",
      },
      "res-pal-3": {
        kind: "result",
        opp: "opponent-2",
        hs: 3,
        as: 2,
        date: "Feb 22, 2026",
        kickoff: "Sun 22 February, 16:15",
        league: "Libertadores",
        comp: "2025-2026 Libertadores \xB7 Women\u2019s \xB7 Group Stage",
      },
      "watch-res": {
        kind: "result",
        opp: "opponent-2",
        hs: 3,
        as: 2,
        date: "Jan 12, 2026",
        kickoff: "Mon 12 January, 14:30",
        league: "La Liga",
        comp: "2025-2026 La Liga \xB7 Men\u2019s \xB7 Group Stage",
        replay: !0,
      },
      "watch-res-lib": {
        kind: "result",
        opp: "opponent-2",
        hs: 3,
        as: 2,
        date: "Jan 12, 2026",
        kickoff: "Mon 12 January, 14:30",
        league: "Libertadores",
        comp: "2025-2026 Libertadores \xB7 Women\u2019s \xB7 Group Stage",
      },
    };
  let PGR_match = PGR_matches["res-rm"],
    PGR_tab = "stats";
  function PGR_open(nav, id) {
    const m = PGR_matches[id];
    (setStatsOpponent(m.opp),
      (PGR_match = m),
      (PGR_tab = "stats"),
      nav.go(m.kind === "live" ? "live-stats" : "post-game-stats"));
  }
  const PGR_names = {
      home: {
        scorers: ["Antonio", "Petit", "Parrott", "Fornals"],
        assists: ["Junior", "\xC1ngel", "Marc", "Llorente"],
        card: "Natan",
        subIn: "H\xE9ctor",
        subOut: "Fornals",
      },
      away: {
        scorers: ["Roque", "Rodrigues", "Paulinho", "Anderson"],
        assists: ["Allan", "Freitas", "Arias", "Piquerez"],
        card: "Giay",
        red: "Khellven",
        subIn: "D\xF3ria",
        subOut: "Paulinho",
      },
    },
    PGR_goalSlots = [16, 36, 60, 62, 68, 74, 81, 87];
  function PGR_events(m) {
    const end = m.kind === "live" ? m.minute : 90,
      order = [];
    let h = m.hs,
      a = m.as;
    for (; h > 0 && a > 0;) (order.push("away", "home"), h--, a--);
    for (; h-- > 0;) order.push("home");
    for (; a-- > 0;) order.push("away");
    const slots = PGR_goalSlots.filter((x) => x < end),
      count = { home: 0, away: 0 },
      score = { home: 0, away: 0 },
      ev = [];
    return (
      order.forEach((side, i) => {
        const n = PGR_names[side],
          k = count[side]++;
        (score[side]++,
          ev.push({
            type: "goal",
            side,
            min:
              slots[Math.min(i, slots.length - 1)] +
              (i >= slots.length ? i - slots.length + 1 : 0),
            name: n.scorers[k % n.scorers.length],
            assist: n.assists[k % n.assists.length],
            hs: score.home,
            as: score.away,
          }));
      }),
      ev.push({
        type: "yellow",
        side: "away",
        min: 34,
        name: PGR_names.away.card,
      }),
      ev.push({
        type: "yellow",
        side: "home",
        min: 54,
        name: PGR_names.home.card,
      }),
      ev.push({ type: "red", side: "away", min: 64, name: PGR_names.away.red }),
      ev.push({
        type: "sub",
        side: "away",
        min: 70,
        name: PGR_names.away.subIn,
        out: PGR_names.away.subOut,
      }),
      ev.push({
        type: "sub",
        side: "home",
        min: 72,
        name: PGR_names.home.subIn,
        out: PGR_names.home.subOut,
      }),
      ev.filter((e) => e.min < end).sort((x, y) => x.min - y.min)
    );
  }
  const PGR_Svg = ({ k, className }) =>
    PGR_h("span", {
      className: "p-pgr__svg" + (className ? " " + className : ""),
      "aria-hidden": "true",
      dangerouslySetInnerHTML: { __html: PGR_svg[k] },
    });
  function PGR_ScoreSpan({ hs, as }) {
    return PGR_h(
      l.Fragment,
      null,
      PGR_h("span", { className: hs < as ? "is-muted" : void 0 }, hs),
      " - ",
      PGR_h("span", { className: as < hs ? "is-muted" : void 0 }, as),
    );
  }
  function PGR_FixturesNav({ active }) {
    const nav = ae(),
      items = [
        { id: "upcoming", label: "Upcoming", screen: "fixtures" },
        { id: "results", label: "Results", screen: "fixtures-results" },
        { id: "leagues", label: "Leagues", screen: "leagues" },
      ];
    return PGR_h(SubNav, {
      items,
      active,
      onSelect: (i) => i.id !== active && nav.go(i.screen),
    });
  }
  function PGR_FixturesFrame({ active, children }) {
    return PGR_h(
      sr,
      {
        header: PGR_h(cn, {
          back: !0,
          title: "Fixtures",
          ctas: ["bell", "search"],
        }),
        appbar: PGR_h(fn, { active: "none" }),
      },
      PGR_h(
        "div",
        {
          className: "p-stack",
          style: { padding: "var(--spacing-default) 0 32px" },
        },
        PGR_h(PGR_FixturesNav, { active }),
        children,
      ),
    );
  }
  function PGR_ResultsScreen() {
    const nav = ae(),
      card = (id) => {
        const m = PGR_matches[id],
          open = () => PGR_open(nav, id);
        return m.kind === "live"
          ? PGR_h(MatchCardLarge, {
              key: id,
              live: !0,
              opponent: m.opp,
              score: m.hs + " - " + m.as,
              minute: m.minute + "\u2019",
              onOpen: open,
            })
          : PGR_h(MatchCardLarge, {
              key: id,
              result: !0,
              replay: !!m.replay,
              competition: m.comp,
              opponent: m.opp,
              date: m.date,
              score: m.hs + " - " + m.as,
              onOpen: open,
              onDetails: open,
            });
      };
    return PGR_h(
      PGR_FixturesFrame,
      { active: "results" },
      PGR_h(
        "section",
        null,
        PGR_h(SectionTitle, { title: "January", count: 2 }),
        PGR_h(
          "div",
          { className: "p-vlist" },
          ["live-elche", "res-rm", "res-elche"].map(card),
        ),
      ),
      PGR_h(
        "section",
        null,
        PGR_h(SectionTitle, { title: "February", count: 3 }),
        PGR_h(
          "div",
          { className: "p-vlist" },
          ["res-pal-1", "res-pal-2", "res-pal-3"].map(card),
        ),
      ),
    );
  }
  const PGR_leagues = [
    {
      id: "laliga",
      name: "LaLiga",
      type: "League",
      crop: { left: "-7.72%", top: "-9.17%", size: "114.71%" },
    },
    { id: "ucl", name: "UCL", type: "League" },
    { id: "copa", name: "Copa del rey", type: "Tournament" },
    {
      id: "cwc",
      name: "Club World Cup",
      type: "Tournament",
      crop: { left: "-2.16%", top: "-4.21%", size: "104.62%" },
    },
  ];
  function PGR_LeaguesScreen() {
    const nav = ae();
    return PGR_h(
      PGR_FixturesFrame,
      { active: "leagues" },
      PGR_h(
        "div",
        { className: "p-leagues" },
        PGR_leagues.map((l) =>
          PGR_h(
            "button",
            {
              key: l.id,
              className: "p-leaguecard",
              onClick: () => PGL_openLeague(nav, l.id),
            },
            PGR_h(
              "span",
              { className: "p-leaguecard__logo" },
              PGR_h("img", {
                src: dt("assets/fixtures/leagues/" + l.id + ".png"),
                alt: "",
                style: l.crop
                  ? {
                      left: l.crop.left,
                      top: l.crop.top,
                      width: l.crop.size,
                      height: l.crop.size,
                    }
                  : void 0,
                className: l.crop ? "is-crop" : void 0,
              }),
            ),
            PGR_h("span", { className: "p-leaguecard__name" }, l.name),
            // A theme that renames the UCL slot to a cup (Junior: Copa Libertadores) labels it a Tournament.
            PGR_h("span", { className: "p-leaguecard__type" }, l.id === "ucl" && tx(l.name) !== l.name && /Copa/.test(tx(l.name)) ? "Tournament" : l.type),
          ),
        ),
      ),
    );
  }
  function PGR_Momentum({ m, homeLogo, awayLogo, goals }) {
    const live = m.kind === "live",
      by = (side) => {
        const rows = [];
        return (
          goals
            .filter((g) => g.side === side)
            .forEach((g) => {
              const r = rows.find((x) => x.name === g.name);
              r
                ? r.mins.push(g.min)
                : rows.push({ name: g.name, mins: [g.min] });
            }),
          rows
        );
      },
      scorers = (side) =>
        PGR_h(
          "div",
          { className: "p-pgr__scorers is-" + side },
          by(side).map((r) =>
            PGR_h(
              "div",
              { key: r.name, className: "p-pgr__scorer" },
              PGR_h("span", { className: "p-pgr__scorername" }, r.name),
              r.mins.map((x) => PGR_h("b", { key: x }, x, "\u2019")),
            ),
          ),
        );
    return PGR_h(
      PGS_Card,
      { title: "Key Events & Momentum", bodyClass: "p-pgr__momentum" },
      PGR_h(
        "div",
        {
          className: "p-pgr__graphwrap",
          style: live
            ? {
                clipPath:
                  "inset(-2px " +
                  (100 - (m.minute / 90) * 100).toFixed(2) +
                  "% -2px -2px)",
              }
            : void 0,
        },
        PGR_h("span", {
          "aria-hidden": "true",
          dangerouslySetInnerHTML: { __html: PGR_svg.graph },
        }),
      ),
      PGR_h(
        "div",
        { className: "p-pgr__axis" },
        PGR_h("span", null, "0\u2019"),
        PGR_h("i", null),
        PGR_h("span", null, "HT"),
        PGR_h("i", null),
        PGR_h("span", null, "90\u2019"),
      ),
      PGR_h(
        "div",
        { className: "p-pgr__keybox" },
        PGR_h(
          "div",
          { className: "p-pgr__keyside is-home" },
          PGR_h("img", { src: homeLogo, alt: "" }),
          scorers("home"),
        ),
        PGR_h(
          "div",
          { className: "p-pgr__keyside is-away" },
          PGR_h("img", { src: awayLogo, alt: "" }),
          scorers("away"),
        ),
        PGR_h(
          "span",
          { className: "p-pgr__keyscore" },
          PGR_h(PGR_ScoreSpan, { hs: m.hs, as: m.as }),
        ),
        PGR_h(PGR_Svg, { k: "ball16", className: "p-pgr__keyball" }),
      ),
    );
  }
  const PGR_stats = [
    ["Expected goals (xG)", "1.09", "0.87"],
    ["Total shots", "17", "8"],
    ["Shots on target", "5", "7"],
    ["Big chances", "3", "2"],
    ["Big chances missed", "1", "2", !0],
    ["Accurate passes", "272 (82%)", "578 (89%)"],
    ["Fouls committed", "16", "9", !0],
    ["Offsides", "1", "3", !0],
    ["Corners", "7", "8"],
  ];
  function PGR_Stats() {
    const lead = (h, a, low) => {
      const x = parseFloat(h),
        y = parseFloat(a);
      return x === y ? null : (low ? x < y : x > y) ? "home" : "away";
    };
    return PGR_h(
      PGS_Card,
      { title: "Stats", bodyClass: "p-pgr__stats" },
      PGR_h(
        "div",
        { className: "p-pgr__possession" },
        PGR_h("span", { className: "p-pgr__statlabel" }, "Ball Possession"),
        PGR_h(
          "div",
          { className: "p-pgr__posbar" },
          PGR_h(
            "span",
            { className: "is-home", style: { flexGrow: 50 } },
            "50%",
          ),
          PGR_h(
            "span",
            { className: "is-away", style: { flexGrow: 50 } },
            "50%",
          ),
        ),
      ),
      PGR_stats.map(([label, h, a, low]) => {
        const w = lead(h, a, low);
        return PGR_h(
          "div",
          { key: label, className: "p-pgr__statrow" },
          PGR_h(
            "span",
            { className: "p-pgr__pill" + (w === "home" ? " is-home" : "") },
            h,
          ),
          PGR_h("span", { className: "p-pgr__statlabel" }, label),
          PGR_h(
            "span",
            { className: "p-pgr__pill" + (w === "away" ? " is-away" : "") },
            a,
          ),
        );
      }),
    );
  }
  function PGR_Event({ e }) {
    const icon =
        e.type === "goal"
          ? PGR_h(PGR_Svg, { k: "ball18" })
          : e.type === "sub"
            ? PGR_h(PGR_Svg, { k: "sub" })
            : PGR_h("span", {
                className: "p-pgr__cardicon is-" + e.type,
                "aria-label": e.type === "red" ? "Red card" : "Yellow card",
              }),
      text =
        e.type === "goal"
          ? PGR_h(
              "div",
              { className: "p-pgr__evtext" },
              PGR_h(
                "span",
                { className: "p-pgr__evname" },
                e.name,
                " (",
                PGR_h(
                  "span",
                  { className: e.side === "home" ? "is-hl" : void 0 },
                  e.hs,
                ),
                " - ",
                PGR_h(
                  "span",
                  { className: e.side === "away" ? "is-hl" : void 0 },
                  e.as,
                ),
                ")",
              ),
              PGR_h(
                "span",
                { className: "p-pgr__evsub" },
                "Assist by ",
                e.assist,
              ),
            )
          : e.type === "sub"
            ? PGR_h(
                "div",
                { className: "p-pgr__evtext" },
                PGR_h("span", { className: "p-pgr__evname is-in" }, e.name),
                PGR_h("span", { className: "p-pgr__evname is-out" }, e.out),
              )
            : PGR_h("span", { className: "p-pgr__evname" }, e.name),
      mark = PGR_h(
        "span",
        { className: "p-pgr__evmark" },
        e.side === "home" && PGR_h("b", null, e.min, "\u2019"),
        icon,
        e.side === "away" && PGR_h("b", null, e.min, "\u2019"),
      );
    return PGR_h(
      "div",
      { className: "p-pgr__event is-" + e.side },
      e.side === "home"
        ? PGR_h(l.Fragment, null, mark, text)
        : PGR_h(l.Fragment, null, text, mark),
    );
  }
  function PGR_Divider({ k, hs, as }) {
    return PGR_h(
      "div",
      { className: "p-pgr__divider" },
      PGR_h("i", null),
      PGR_h(
        "span",
        { className: "p-pgr__divmark" },
        PGR_h(PGR_Svg, { k, className: "p-pgr__badge" }),
        PGR_h("b", null, hs, " - ", as),
      ),
      PGR_h("i", null),
    );
  }
  function PGR_Timeline({ m, events }) {
    const ht = ((pred) =>
        events.filter((e) => e.type === "goal" && pred(e.min)))((x) => x < 45),
      rows = [],
      first = events.filter((e) => e.min < 45),
      second = events.filter((e) => e.min >= 45);
    return (
      first.forEach((e, i) => rows.push(PGR_h(PGR_Event, { key: "a" + i, e }))),
      (m.kind === "result" || m.minute >= 45) &&
        rows.push(
          PGR_h(PGR_Divider, {
            key: "ht",
            k: "ht",
            hs: ht.filter((g) => g.side === "home").length,
            as: ht.filter((g) => g.side === "away").length,
          }),
        ),
      second.forEach((e, i) =>
        rows.push(PGR_h(PGR_Event, { key: "b" + i, e })),
      ),
      m.kind === "result" &&
        rows.push(
          PGR_h(PGR_Divider, { key: "ft", k: "ft", hs: m.hs, as: m.as }),
        ),
      PGR_h(PGS_Card, { title: "Timeline", bodyClass: "p-pgr__timeline" }, rows)
    );
  }
  function PGR_MatchScreen({ live }) {
    const nav = ae(),
      m =
        PGR_match.kind === (live ? "live" : "result")
          ? PGR_match
          : PGR_matches[live ? "live-elche" : "res-rm"],
      homeName = je("team.main"),
      awayName = m.oppName || je(m.opp),
      homeLogo = qe("club-crest"),
      awayLogo = m.oppLogo ? dt(m.oppLogo) : qe(m.opp),
      venue = je("fixture.venue"),
      isLight = !!Za(nav.config.theme.mode, nav.config.theme.overrides)[
        "theme/light"
      ],
      [tab, setTabState] = te.useState(PGR_tab),
      setTab = (t) => {
        ((PGR_tab = t), setTabState(t));
      },
      [pick, setPick] = te.useState(null),
      [ticket, setTicket] = te.useState(!1),
      [success, setSuccess] = te.useState(null),
      events = PGR_events(m),
      goals = events.filter((e) => e.type === "goal"),
      tabs = (
        live
          ? [
              { id: "stats", label: "Stats" },
              { id: "predictions", label: "Predictions" },
              { id: "squads", label: "Squads" },
              { id: "table", label: "Table" },
            ]
          : [
              { id: "stats", label: "Stats" },
              { id: "squads", label: "Squads" },
              { id: "table", label: "Table" },
            ]
      ).filter((t) => t.id !== "predictions" || nav.enabled("predictions")),
      cur = tabs.some((t) => t.id === tab) ? tab : "stats";
    return PGR_h(
      sr,
      {
        appbar: PGR_h(
          l.Fragment,
          null,
          PGR_h(fn, { active: "none" }),
          ticket &&
            pick &&
            PGR_h(PGS_Ticket, {
              pick,
              homeName,
              awayName,
              onClose: () => setTicket(!1),
              onRemove: () => {
                (setTicket(!1), setPick(null));
              },
              onConfirm: (res) => {
                ((PGS_points -= res.wager),
                  setTicket(!1),
                  setPick(null),
                  setSuccess(res));
              },
            }),
          success &&
            PGR_h(PGS_Success, {
              res: success,
              homeName,
              awayName,
              onClose: () => setSuccess(null),
            }),
        ),
      },
      PGR_h(
        "div",
        { className: "p-pgs p-pgr" },
        PGR_h(
          "div",
          { className: "p-pgs__top" },
          PGR_h(cn, { back: nav.canBack, title: "", ctas: ["bell", "search"] }),
          PGR_h(
            "div",
            { className: "p-pgs__hero" + (live ? " is-live" : "") },
            isLight
              ? PGR_h(
                  l.Fragment,
                  null,
                  PGR_h("img", {
                    className: "p-pgs__net is-light",
                    src: dt("assets/fixtures/net.png"),
                    alt: "",
                  }),
                  PGR_h("span", {
                    className: "p-pgs__blur is-light",
                    "aria-hidden": "true",
                    dangerouslySetInnerHTML: { __html: PGS_blurLight },
                  }),
                )
              : PGR_h(
                  l.Fragment,
                  null,
                  PGR_h("span", {
                    className: "p-pgs__blur is-dark",
                    "aria-hidden": "true",
                    dangerouslySetInnerHTML: { __html: PGS_blurDark },
                  }),
                  PGR_h("img", {
                    className: "p-pgs__net is-dark",
                    src: dt("assets/fixtures/net.png"),
                    alt: "",
                  }),
                ),
            PGR_h(
              "div",
              {
                className: "p-pgs__teams",
                role: "img",
                "aria-label":
                  homeName +
                  " " +
                  m.hs +
                  ", " +
                  awayName +
                  " " +
                  m.as +
                  (live ? ", live, " + m.minute + " minutes" : ", full time"),
              },
              PGR_h("img", { src: homeLogo, alt: "" }),
              live
                ? PGR_h(
                    "span",
                    { className: "p-pgr__livescore" },
                    PGR_h(
                      "span",
                      { className: "p-live p-pgr__livepill" },
                      "LIVE",
                    ),
                    PGR_h(
                      "span",
                      { className: "p-pgr__score" },
                      m.hs,
                      " - ",
                      m.as,
                    ),
                    PGR_h(
                      "span",
                      { className: "p-pgr__minute" },
                      m.minute,
                      "\u2019",
                    ),
                  )
                : PGR_h(
                    "span",
                    { className: "p-pgr__score" },
                    m.hs,
                    " - ",
                    m.as,
                  ),
              PGR_h("img", { src: awayLogo, alt: "" }),
            ),
            PGR_h(
              "div",
              { className: "p-pgs__infocta" },
              PGR_h(
                "div",
                { className: "p-pgs__info" },
                !live && PGR_h("span", { className: "p-pgs__date" }, m.kickoff),
                PGR_h("span", { className: "p-pgs__league" }, m.league),
                PGR_h("span", { className: "p-pgs__venue" }, venue),
              ),
              PGR_h(
                Ft,
                {
                  variant: "primary",
                  icon: live ? "play" : "replay",
                  onClick: () => nav.go("live-player"),
                },
                live ? "Watch Now" : "Watch Replay",
              ),
            ),
          ),
        ),
        PGR_h(
          "div",
          { className: "p-tabs p-tabs--start p-pgs__tabs", role: "tablist" },
          tabs.map((t) =>
            PGR_h(
              "button",
              {
                key: t.id,
                role: "tab",
                "aria-selected": t.id === cur,
                className: "p-tabs__item" + (t.id === cur ? " is-active" : ""),
                onClick: () => setTab(t.id),
              },
              t.label,
            ),
          ),
        ),
        cur === "squads"
          ? PGR_h(PGS_Squads, {
              homeName,
              awayName,
              homeLogo,
              awayLogo,
              onPick: () => nav.go("player-stats"),
            })
          : cur === "table"
            ? PGR_h(PGS_Table, null)
            : cur === "predictions"
              ? PGR_h(PGS_Predictions, {
                  pick,
                  onPick: setPick,
                  onNext: () => setTicket(!0),
                })
              : PGR_h(
                  "div",
                  { className: "p-pgs__cards" },
                  PGR_h(PGR_Momentum, { m, homeLogo, awayLogo, goals }),
                  PGR_h(PGR_Stats, null),
                  PGR_h(PGR_Timeline, { m, events }),
                ),
      ),
    );
  }
  // Watch / Stats (638:19075): the post-game cards under the Watch mini player, with Stats | Squads | Table tabs
  // (Figma's Watch / Squads 638:19084 and Watch / Table 638:19092 swap in place). Match: Betis 3-2 Palmeiras.
  let PGR_watchTab = "stats";
  function PGR_WatchStatsBody() {
    const nav = ae(),
      m = PGR_matches["watch-res"],
      homeName = je("team.main"),
      awayName = je(m.opp),
      homeLogo = qe("club-crest"),
      awayLogo = qe(m.opp),
      [tab, setTabState] = te.useState(PGR_watchTab),
      setTab = (t) => {
        ((PGR_watchTab = t), setTabState(t));
      },
      events = PGR_events(m),
      goals = events.filter((e) => e.type === "goal"),
      tabs = [
        { id: "stats", label: "Stats" },
        { id: "squads", label: "Squads" },
        { id: "table", label: "Table" },
      ];
    return PGR_h(
      l.Fragment,
      null,
      PGR_h(
        "div",
        { className: "p-tabs p-tabs--fill p-wstats__tabs", role: "tablist" },
        tabs.map((t) =>
          PGR_h(
            "button",
            {
              key: t.id,
              role: "tab",
              "aria-selected": t.id === tab,
              className: "p-tabs__item" + (t.id === tab ? " is-active" : ""),
              onClick: () => setTab(t.id),
            },
            t.label,
          ),
        ),
      ),
      tab === "squads"
        ? PGR_h(PGS_Squads, { homeName, awayName, homeLogo, awayLogo, onPick: () => nav.go("player-stats") })
        : tab === "table"
          ? PGR_h(PGS_Table, null)
          : PGR_h(
              "div",
              { className: "p-pgs__cards" },
              PGR_h(PGR_Momentum, { m, homeLogo, awayLogo, goals }),
              PGR_h(PGR_Stats, null),
              PGR_h(PGR_Timeline, { m, events }),
            ),
    );
  }
  const PGR_PostGameScreen = () => PGR_h(PGR_MatchScreen, { live: !1 }),
    PGR_LiveScreen = () => PGR_h(PGR_MatchScreen, { live: !0 }),
    PGL_tbl = (n) =>
      n.indexOf("/") >= 0 ? n : "assets/fixtures/table/" + n + ".png",
    PGL_leagues = {
      laliga: {
        name: "LaLiga",
        country: "Spain",
        logo: "assets/fixtures/leagues/laliga.png",
        crop: [114.71, -7.72, -9.17, 114.71],
      },
      ucl: {
        name: "UCL",
        country: "Europe",
        logo: "assets/fixtures/leagues/ucl.png",
        crop: "contain",
      },
      copa: {
        name: "Copa del Rey",
        country: "Spain",
        logo: "assets/fixtures/leagues/copa.png",
        crop: "contain",
      },
      cwc: {
        name: "Club World Cup",
        country: "Worldwide",
        logo: "assets/fixtures/leagues/cwc.png",
        crop: [104.62, -2.16, -4.21, 104.62],
      },
    };
  let PGL_league = "laliga",
    PGL_tab = "table",
    PGL_team = null; // null = the club's own row
  function PGL_openLeague(nav, id) {
    ((PGL_league = id), (PGL_tab = "table"), nav.go("league-page"));
  }
  function PGL_rows() {
    const club = je("team.main"),
      crest = qe("club-crest");
    const ci = PGS_clubIdx();
    return PGS_rowsNow().map(([name, logo, crop, gp, diff, pts], i) =>
      i === ci
        ? { name: club, src: crest, crop: "contain", gp, diff, pts, main: !0 }
        : { name, src: dt(PGL_tbl(logo)), crop, gp, diff, pts },
    );
  }
  const PGL_results = [
    {
      month: "May",
      rows: [
        {
          id: "lg-elche",
          opp: "opponent-3",
          hs: 2,
          as: 1,
          date: "May 12, 2026",
          kickoff: "Tue 12 May, 21:00",
          tag: "LaLiga",
        },
        {
          id: "lg-barca",
          opp: "opponent-4",
          hs: 1,
          as: 3,
          date: "May 17, 2026",
          kickoff: "Sun 17 May, 18:30",
          tag: "LaLiga",
        },
        {
          id: "lg-levante",
          opp: "opponent-1",
          oppName: "Levante",
          oppLogo: "assets/fixtures/player/rm-levante.png",
          hs: 2,
          as: 1,
          date: "May 23, 2026",
          kickoff: "Sat 23 May, 16:15",
          tag: "LaLiga",
        },
      ],
    },
    {
      month: "April",
      rows: [
        {
          id: "lg-rm",
          opp: "opponent-1",
          hs: 1,
          as: 1,
          date: "April 24, 2026",
          kickoff: "Fri 24 April, 21:00",
          tag: "LaLiga",
        },
        {
          id: "lg-pal-1",
          opp: "opponent-2",
          hs: 3,
          as: 2,
          date: "May 10, 2025",
          kickoff: "Sat 10 May, 21:30",
          tag: "Libertadores",
        },
        {
          id: "lg-pal-2",
          opp: "opponent-2",
          hs: 3,
          as: 2,
          date: "May 10, 2025",
          kickoff: "Sat 10 May, 21:30",
          tag: "Libertadores",
        },
      ],
    },
  ];
  PGL_results.forEach((g) =>
    g.rows.forEach((r) => {
      PGR_matches[r.id] = {
        kind: "result",
        opp: r.opp,
        oppName: r.oppName,
        oppLogo: r.oppLogo,
        hs: r.hs,
        as: r.as,
        date: r.date,
        kickoff: r.kickoff,
        league: r.tag,
        comp: "2025-2026 " + r.tag + " \xB7 Group Stage",
      };
    }),
  );
  function PGL_Header({ logo, crop, name, sub }) {
    return PGR_h(
      "div",
      { className: "p-lghead" },
      PGR_h(PGS_Logo, { src: logo, crop, size: 52 }),
      PGR_h(
        "div",
        { className: "p-lghead__text" },
        PGR_h("h1", null, name),
        PGR_h("span", null, sub),
      ),
    );
  }
  function PGL_Tabs({ tabs, active, onSelect }) {
    return PGR_h(
      "div",
      {
        className: "p-tabs p-tabs--start p-tabs--fill p-lg__tabs",
        role: "tablist",
      },
      tabs.map((t) =>
        PGR_h(
          "button",
          {
            key: t.id,
            role: "tab",
            "aria-selected": t.id === active,
            className: "p-tabs__item" + (t.id === active ? " is-active" : ""),
            onClick: () => onSelect(t.id),
          },
          t.label,
        ),
      ),
    );
  }
  function PGL_Score({ hs, as }) {
    return PGR_h(
      "span",
      { className: "p-lgscore" },
      PGR_h("span", { className: hs < as ? "is-muted" : void 0 }, hs),
      " - ",
      PGR_h("span", { className: as < hs ? "is-muted" : void 0 }, as),
    );
  }
  function PGL_MatchRow({
    date,
    tag,
    home,
    homeLogo,
    away,
    awayLogo,
    centre,
    onClick,
  }) {
    return PGR_h(
      "button",
      { className: "p-lgmatch", onClick },
      PGR_h(
        "span",
        { className: "p-lgmatch__top" },
        PGR_h("span", { className: "p-lgmatch__date" }, date),
        PGR_h("span", { className: "p-lgmatch__tag" }, tag),
      ),
      PGR_h(
        "span",
        { className: "p-lgmatch__mid" },
        PGR_h(
          "span",
          { className: "p-lgmatch__team is-home" },
          PGR_h("span", null, home),
          PGR_h("img", { src: homeLogo, alt: "" }),
        ),
        centre,
        PGR_h(
          "span",
          { className: "p-lgmatch__team" },
          PGR_h("img", { src: awayLogo, alt: "" }),
          PGR_h("span", null, away),
        ),
      ),
    );
  }
  function PGL_LeagueScreen() {
    const nav = ae(),
      lg = PGL_leagues[PGL_league] || PGL_leagues.laliga,
      [tab, setTabState] = te.useState(PGL_tab),
      setTab = (t) => {
        ((PGL_tab = t), setTabState(t));
      },
      club = je("team.main"),
      crest = qe("club-crest"),
      rows = PGL_rows(),
      tagFor = (t) => (PGL_league === "laliga" ? t : lg.name);
    return PGR_h(
      sr,
      {
        header: PGR_h(cn, {
          back: nav.canBack,
          title: "",
          ctas: ["bell", "search"],
        }),
        appbar: PGR_h(fn, { active: "none" }),
      },
      PGR_h(
        "div",
        { className: "p-lg" },
        PGR_h(PGL_Header, {
          logo: dt(lg.logo),
          crop: lg.crop,
          name: lg.name,
          sub: lg.country,
        }),
        PGR_h(
          "div",
          { className: "p-lg__body" },
          PGR_h(PGL_Tabs, {
            tabs: [
              { id: "table", label: "Table" },
              { id: "matches", label: "Matches" },
            ],
            active: tab,
            onSelect: setTab,
          }),
          tab === "table"
            ? PGR_h(
                "div",
                { className: "p-pgs__cards" },
                PGR_h(
                  "section",
                  {
                    className: "p-table",
                    "aria-label": lg.name + " 2025/2026 standings",
                  },
                  PGR_h(
                    "div",
                    { className: "p-table__title" },
                    PGR_h(PGS_Logo, { src: dt(lg.logo), crop: lg.crop, size: 24 }),
                    PGR_h("h2", null, lg.name, " 2025/2026"),
                  ),
                  PGR_h(
                    "table",
                    null,
                    PGR_h(
                      "thead",
                      null,
                      PGR_h(
                        "tr",
                        null,
                        PGR_h("th", { className: "is-pos" }, "#"),
                        PGR_h("th", { className: "is-team" }, "Team"),
                        PGR_h("th", null, "GP"),
                        PGR_h("th", null, "Diff"),
                        PGR_h("th", null, "PTS"),
                      ),
                    ),
                    PGR_h(
                      "tbody",
                      null,
                      rows.map((r, i) =>
                        PGR_h(
                          "tr",
                          {
                            key: i,
                            className: "is-link",
                            tabIndex: 0,
                            role: "button",
                            "aria-label": "Open " + r.name,
                            onClick: () => {
                              ((PGL_team = i), nav.go("team-page"));
                            },
                            onKeyDown: (e) => {
                              (e.key === "Enter" || e.key === " ") &&
                                (e.preventDefault(),
                                (PGL_team = i),
                                nav.go("team-page"));
                            },
                          },
                          PGR_h("td", { className: "is-pos" }, i + 1),
                          PGR_h(
                            "td",
                            { className: "is-team" },
                            PGR_h(
                              "span",
                              null,
                              PGR_h(PGS_Logo, { src: r.src, crop: r.crop, size: 16 }),
                              r.name,
                            ),
                          ),
                          PGR_h("td", null, r.gp),
                          PGR_h("td", null, r.diff),
                          PGR_h("td", null, r.pts),
                        ),
                      ),
                    ),
                  ),
                ),
              )
            : PGR_h(
                "div",
                { className: "p-pgs__cards" },
                PGL_results.map((g) =>
                  PGR_h(
                    PGS_Card,
                    { key: g.month, title: g.month, bodyClass: "p-lgmatches" },
                    g.rows.map((r) =>
                      PGR_h(PGL_MatchRow, {
                        key: r.id,
                        date: r.date,
                        tag: tagFor(r.tag),
                        home: club,
                        homeLogo: crest,
                        away: r.oppName || je(r.opp),
                        awayLogo: r.oppLogo ? dt(r.oppLogo) : qe(r.opp),
                        centre: PGR_h(PGL_Score, { hs: r.hs, as: r.as }),
                        onClick: () => PGR_open(nav, r.id),
                      }),
                    ),
                  ),
                ),
              ),
        ),
      ),
    );
  }
  const PGL_formScores = {
    W: ["2 - 1", "1 - 0", "3 - 1"],
    L: ["1 - 3", "0 - 2", "1 - 2"],
    D: ["1 - 1", "0 - 0", "2 - 2"],
  };
  function PGL_TeamScreen() {
    const nav = ae(),
      rows = PGL_rows(),
      idx = Math.min(PGL_team ?? PGS_clubIdx(), rows.length - 1),
      team = rows[idx],
      club = rows.find((r) => r.main) || rows[4],
      [tab, setTab] = te.useState("overview"),
      next = team.main
        ? {
            home: team,
            away: { name: je("opponent-1"), src: qe("opponent-1") },
            date: "September 4, 2026",
            time: ["2:00", "PM"],
          }
        : {
            home: team,
            away: rows[(idx + 1) % rows.length],
            date: "September 12, 2026",
            time: ["4:15", "PM"],
          },
      // Recent form names LaLiga clubs; a theme table without them (e.g. Liga DIMAYOR) uses other rows instead.
      others = rows.filter((r) => !r.main),
      byName = (n, alt) => rows.find((r) => r.name === n) || others[alt % others.length],
      form = team.main
        ? [
            ["W", "2 - 1", byName("Elche", 13)],
            ["L", "1 - 3", rows[0]],
            ["D", "1 - 1", rows[1]],
            ["W", "2 - 1", byName("Levante", 17)],
            ["W", "1 - 0", byName("Real Sociedad", 9)],
          ]
        : [0, 1, 2, 3, 4].map((k) => {
            const res = "WLDWW"[(idx + k) % 5],
              opp = rows[(idx + 3 + k * 2) % rows.length];
            return [
              res,
              PGL_formScores[res][(idx + k) % 3],
              opp.name === team.name ? club : opp,
            ];
          }),
      tournaments = [
        ["LaLiga", PGL_leagues.laliga],
        ["Copa del Rey", PGL_leagues.copa],
        ["UEFA Champions League", PGL_leagues.ucl],
      ],
      trophies = [
        [
          "LaLiga",
          PGL_leagues.laliga.logo,
          PGL_leagues.laliga.crop,
          "Last won 2025",
          3,
        ],
        [
          "Copa Libertadores",
          "assets/fixtures/leagues/libertadores.png",
          "contain",
          "Last won 2021",
          1,
        ],
      ];
    return PGR_h(
      sr,
      {
        header: PGR_h(cn, {
          back: nav.canBack,
          title: "",
          ctas: ["bell", "search"],
        }),
        appbar: PGR_h(fn, { active: "none" }),
      },
      PGR_h(
        "div",
        { className: "p-lg" },
        PGR_h(PGL_Header, {
          logo: team.src,
          crop: team.main ? "contain" : team.crop,
          name: team.name,
          sub: "Spain",
        }),
        PGR_h(
          "div",
          { className: "p-lg__body" },
          PGR_h(PGL_Tabs, {
            tabs: [
              { id: "overview", label: "Overview" },
              { id: "stats", label: "Stats" },
              { id: "squad", label: "Squad" },
            ],
            active: tab,
            onSelect: (t) => (t === "overview" ? setTab(t) : nav.dead()),
          }),
          PGR_h(
            "div",
            { className: "p-pgs__cards" },
            PGR_h(
              PGS_Card,
              { title: "Next Match", bodyClass: "p-lgmatches" },
              PGR_h(PGL_MatchRow, {
                date: next.date,
                tag: "LaLiga",
                home: next.home.name,
                homeLogo: next.home.src,
                away: next.away.name,
                awayLogo: next.away.src,
                centre: PGR_h(
                  "span",
                  { className: "p-lgtime" },
                  PGR_h("span", null, next.time[0]),
                  PGR_h("span", null, next.time[1]),
                ),
                onClick: () => {
                  team.main
                    ? (setStatsOpponent("opponent-1"), nav.go("pre-game-stats"))
                    : nav.dead();
                },
              }),
            ),
            PGR_h(
              PGS_Card,
              { title: "Team Form", bodyClass: "p-lgform" },
              form.map(([res, score, opp], k) =>
                PGR_h(
                  "div",
                  {
                    key: k,
                    className: "p-lgform__item",
                    "aria-label":
                      (res === "W" ? "Win" : res === "L" ? "Loss" : "Draw") +
                      " " +
                      score +
                      " against " +
                      opp.name,
                  },
                  PGR_h(
                    "span",
                    { className: "p-lgform__score is-" + res },
                    score,
                  ),
                  PGR_h(PGS_Logo, {
                    src: opp.src,
                    crop: opp.main ? "contain" : opp.crop,
                    size: 28,
                  }),
                ),
              ),
            ),
            PGR_h(
              PGS_Card,
              { title: "Tournaments", bodyClass: "p-lglist" },
              tournaments.map(([name, l]) =>
                PGR_h(
                  "div",
                  { key: name, className: "p-lglist__row" },
                  PGR_h(PGS_Logo, { src: dt(l.logo), crop: l.crop, size: 32 }),
                  PGR_h("span", { className: "p-lglist__name" }, name),
                ),
              ),
            ),
            PGR_h(
              PGS_Card,
              { title: "Trophies", bodyClass: "p-lglist" },
              trophies.map(([name, logo, crop, last, n]) =>
                PGR_h(
                  "div",
                  { key: name, className: "p-lglist__row is-trophy" },
                  PGR_h(PGS_Logo, { src: dt(logo), crop, size: 32 }),
                  PGR_h(
                    "span",
                    { className: "p-lglist__text" },
                    PGR_h("span", { className: "p-lglist__name" }, name),
                    PGR_h("span", { className: "p-lglist__sub" }, last),
                  ),
                  PGR_h("b", { className: "p-lglist__count" }, n),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
  const PGP_fixtures = ["opponent-1", "opponent-4", "opponent-2", "opponent-3"];
  function PGP_PredictionsScreen() {
    const nav = ae(),
      open = (opp) => {
        (setStatsOpponent(opp, "predictions"), nav.go("pre-game-stats"));
      };
    return PGR_h(
      sr,
      { header: PGR_h(cn, null), appbar: PGR_h(fn, { active: "predictions" }) },
      PGR_h(
        "div",
        {
          className: "p-stack",
          style: { padding: "var(--spacing-default) 0 32px" },
        },
        PGR_h(
          "div",
          { className: "p-predhead" },
          PGR_h("h1", { className: "p-title2" }, "Predictions"),
          PGR_h(
            "div",
            { className: "p-predhead__ctas" },
            PGR_h(
              "span",
              {
                className: "p-balance",
                "aria-label": "Balance: " + PGS_points + " points",
              },
              PGR_h("span", null, "Balance:"),
              PGR_h("img", { src: dt("assets/fixtures/ball.svg"), alt: "" }),
              PGR_h("b", null, PGS_points),
            ),
            PGR_h(
              "button",
              {
                className: "p-cta p-predhead__trophy",
                "aria-label": "Rankings",
                onClick: () => nav.go("predictions-ranking"),
              },
              PGR_h(PGR_Svg, { k: "trophy" }),
            ),
          ),
        ),
        PGR_h(
          "div",
          { className: "p-vlist" },
          PGP_fixtures.map((opp, i) =>
            PGR_h(MatchCardLarge, {
              key: i,
              opponent: opp,
              predict: !0,
              competition:
                "2025-2026  \xB7 LaLiga \xB7 Men\u2019s \xB7 Group Stage",
              onOpen: () => open(opp),
            }),
          ),
        ),
      ),
    );
  }
  const PGP_ranking = [
    ["lucas.oliveira.ok", "p98", 78.5, 2450],
    ["marta.verdiblanca", "p95", 76.2, 2310],
    ["javi_9", "p100", 74.8, 2185],
    ["sofi.gol", "p99", 72.1, 2040],
    ["pablo.r", "p99", 70.6, 1925],
    ["ana.manquepierda", "p99", 69.3, 1860],
    ["dani.betico", "p99", 67.9, 1790],
  ];
  function PGP_RankingScreen() {
    const nav = ae(),
      medal = ["gold", "silver", "bronze"];
    return PGR_h(
      sr,
      {
        header: PGR_h(cn, { back: nav.canBack, title: "Ranking", ctas: [] }),
        appbar: PGR_h(fn, { active: "predictions" }),
      },
      PGR_h(
        "div",
        {
          className: "p-stack",
          style: { padding: "var(--spacing-default) 0 32px" },
        },
        PGR_h(
          "section",
          null,
          PGR_h(SectionTitle, { title: "Top Predictors" }),
          PGR_h(
            "ol",
            { className: "p-vlist p-ranking" },
            PGP_ranking.map(([name, photo, acc, pts], i) =>
              PGR_h(
                "li",
                {
                  key: name,
                  className: "p-rankcard" + (i < 3 ? " is-top" : ""),
                },
                i < 3
                  ? PGR_h("img", {
                      className: "p-rankcard__medal",
                      src: dt("assets/predictions/rank/" + medal[i] + ".svg"),
                      alt: "Rank " + (i + 1),
                    })
                  : PGR_h("span", { className: "p-rankcard__pos" }, "#", i + 1),
                PGR_h(
                  "span",
                  { className: "p-rankcard__profile" },
                  PGR_h("img", {
                    src: dt("assets/predictions/rank/" + photo + ".webp"),
                    alt: "",
                  }),
                  PGR_h(
                    "span",
                    { className: "p-rankcard__name" },
                    PGR_h("b", null, name),
                    PGR_h("span", null, "Accuracy: ", acc, "%"),
                  ),
                ),
                PGR_h(
                  "span",
                  { className: "p-rankcard__pts" },
                  PGR_h("b", null, pts),
                  PGR_h("span", null, "Points"),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

export { PGR_WatchStatsBody, PGL_LeagueScreen, PGL_TeamScreen, PGP_PredictionsScreen, PGP_RankingScreen, PGR_LeaguesScreen, PGR_LiveScreen, PGR_MatchScreen, PGR_PostGameScreen, PGR_ResultsScreen, PGR_open };
