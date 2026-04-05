(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[255],{6950:(e,t,r)=>{"use strict";r.d(t,{A:()=>a});var i=r(40570),o=r(95155);let a=(0,i.A)((0,o.jsx)("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"}),"Edit")},25427:(e,t,r)=>{"use strict";r.d(t,{A:()=>i});let i=r(90526).A},28656:(e,t,r)=>{"use strict";r.d(t,{A:()=>a});var i=r(40570),o=r(95155);let a=(0,i.A)([(0,o.jsx)("path",{d:"m21 5-9-4-9 4v6c0 5.55 3.84 10.74 9 12 2.3-.56 4.33-1.9 5.88-3.71l-3.12-3.12c-1.94 1.29-4.58 1.07-6.29-.64-1.95-1.95-1.95-5.12 0-7.07s5.12-1.95 7.07 0c1.71 1.71 1.92 4.35.64 6.29l2.9 2.9C20.29 15.69 21 13.38 21 11z"},"0"),(0,o.jsx)("circle",{cx:"12",cy:"12",r:"3"},"1")],"Policy")},41441:(e,t,r)=>{Promise.resolve().then(r.bind(r,47439))},47439:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>b});var i=r(95155),o=r(12115),a=r(37156),s=r(32020),n=r(64924),l=r(26576),d=r(57518),c=r(76010),u=r(99084),h=r(31804),p=r(83063),m=r(95473),f=r(60294),A=r(13021),v=r(28656),y=r(6950),x=r(98500),g=r.n(x);function b(){(0,a.A)();let[e,t]=(0,o.useState)([]),[r,x]=(0,o.useState)(!0);return((0,o.useEffect)(()=>{fetch("/api/admin/politica-modelo").then(e=>e.json()).then(e=>{Array.isArray(e)&&t(e)}).catch(e=>console.error(e)).finally(()=>x(!1))},[]),r)?(0,i.jsxs)(s.A,{maxWidth:"lg",children:[(0,i.jsx)(n.A,{variant:"h5",fontWeight:"bold",sx:{mb:3},children:"Modelos de Pol\xedticas"}),(0,i.jsx)(l.Ay,{container:!0,spacing:2,children:[1,2,3].map(e=>(0,i.jsx)(l.Ay,{item:!0,xs:12,md:6,children:(0,i.jsx)(d.A,{variant:"rectangular",height:120})},e))})]}):(0,i.jsxs)(s.A,{maxWidth:"lg",children:[(0,i.jsxs)(c.A,{sx:{mb:4},children:[(0,i.jsx)(n.A,{variant:"h5",fontWeight:"bold",gutterBottom:!0,children:"Modelos de Pol\xedticas"}),(0,i.jsx)(n.A,{variant:"body2",color:"text.secondary",children:"Edite os templates de pol\xedticas que ser\xe3o usados ao criar pol\xedticas nos programas."})]}),(0,i.jsx)(l.Ay,{container:!0,spacing:3,children:e.map(e=>(0,i.jsx)(l.Ay,{item:!0,xs:12,sm:6,md:4,children:(0,i.jsxs)(u.A,{sx:{height:"100%",display:"flex",flexDirection:"column",border:`2px solid ${(0,h.X4)(e.cor||"#2196F3",.2)}`,"&:hover":{borderColor:(0,h.X4)(e.cor||"#2196F3",.5)}},children:[(0,i.jsxs)(p.A,{sx:{flexGrow:1},children:[(0,i.jsx)(c.A,{sx:{width:48,height:48,borderRadius:2,bgcolor:(0,h.X4)(e.cor||"#2196F3",.12),display:"flex",alignItems:"center",justifyContent:"center",color:e.cor||"#2196F3",mb:1},children:(0,i.jsx)(v.A,{})}),(0,i.jsx)(n.A,{variant:"h6",fontWeight:"bold",gutterBottom:!0,children:e.nome}),(0,i.jsx)(n.A,{variant:"body2",color:"text.secondary",sx:{mb:1},children:e.descricao}),(0,i.jsx)(m.A,{label:e.ativo?"Ativo":"Inativo",size:"small",color:e.ativo?"success":"default",variant:"outlined"}),Array.isArray(e.secoes)&&(0,i.jsxs)(n.A,{variant:"caption",color:"text.secondary",sx:{display:"block",mt:1},children:[e.secoes.length," se\xe7\xf5es"]})]}),(0,i.jsx)(f.A,{children:(0,i.jsx)(A.A,{component:g(),href:`/admin/modelos-politicas/${e.id}`,startIcon:(0,i.jsx)(y.A,{}),sx:{color:e.cor||"#2196F3"},children:"Editar"})})]})},e.id))}),0===e.length&&!r&&(0,i.jsx)(n.A,{color:"text.secondary",children:"Nenhum modelo de pol\xedtica encontrado."})]})}},57518:(e,t,r)=>{"use strict";r.d(t,{A:()=>g});var i=r(12115),o=r(29722),a=r(96748),s=r(31804),n=r(23462),l=r(42131),d=r(13957),c=r(64874),u=r(24318),h=r(14770);function p(e){return(0,h.Ay)("MuiSkeleton",e)}(0,u.A)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var m=r(95155);let f=(0,n.i7)`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,A=(0,n.i7)`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,v="string"!=typeof f?(0,n.AH)`
        animation: ${f} 2s ease-in-out 0.5s infinite;
      `:null,y="string"!=typeof A?(0,n.AH)`
        &::after {
          animation: ${A} 2s linear 0.5s infinite;
        }
      `:null,x=(0,l.Ay)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[r.variant],!1!==r.animation&&t[r.animation],r.hasChildren&&t.withChildren,r.hasChildren&&!r.width&&t.fitContent,r.hasChildren&&!r.height&&t.heightAuto]}})((0,d.A)(({theme:e})=>{let t=String(e.shape.borderRadius).match(/[\d.\-+]*\s*(.*)/)[1]||"px",r=parseFloat(e.shape.borderRadius);return{display:"block",backgroundColor:e.vars?e.vars.palette.Skeleton.bg:(0,s.X4)(e.palette.text.primary,"light"===e.palette.mode?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${r}${t}/${Math.round(r/.6*10)/10}${t}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(e.vars||e).shape.borderRadius}},{props:({ownerState:e})=>e.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:e})=>e.hasChildren&&!e.width,style:{maxWidth:"fit-content"}},{props:({ownerState:e})=>e.hasChildren&&!e.height,style:{height:"auto"}},{props:{animation:"pulse"},style:v||{animation:`${f} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(e.vars||e).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:y||{"&::after":{animation:`${A} 2s linear 0.5s infinite`}}}]}})),g=i.forwardRef(function(e,t){let r=(0,c.b)({props:e,name:"MuiSkeleton"}),{animation:i="pulse",className:s,component:n="span",height:l,style:d,variant:u="text",width:h,...f}=r,A={...r,animation:i,component:n,variant:u,hasChildren:!!f.children},v=(e=>{let{classes:t,variant:r,animation:i,hasChildren:o,width:s,height:n}=e;return(0,a.A)({root:["root",r,i,o&&"withChildren",o&&!s&&"fitContent",o&&!n&&"heightAuto"]},p,t)})(A);return(0,m.jsx)(x,{as:n,ref:t,className:(0,o.A)(v.root,s),ownerState:A,...f,style:{width:h,height:l,...d}})})},60294:(e,t,r)=>{"use strict";r.d(t,{A:()=>p});var i=r(12115),o=r(29722),a=r(96748),s=r(42131),n=r(64874),l=r(24318),d=r(14770);function c(e){return(0,d.Ay)("MuiCardActions",e)}(0,l.A)("MuiCardActions",["root","spacing"]);var u=r(95155);let h=(0,s.Ay)("div",{name:"MuiCardActions",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,!r.disableSpacing&&t.spacing]}})({display:"flex",alignItems:"center",padding:8,variants:[{props:{disableSpacing:!1},style:{"& > :not(style) ~ :not(style)":{marginLeft:8}}}]}),p=i.forwardRef(function(e,t){let r=(0,n.b)({props:e,name:"MuiCardActions"}),{disableSpacing:i=!1,className:s,...l}=r,d={...r,disableSpacing:i},p=(e=>{let{classes:t,disableSpacing:r}=e;return(0,a.A)({root:["root",!r&&"spacing"]},c,t)})(d);return(0,u.jsx)(h,{className:(0,o.A)(p.root,s),ownerState:d,ref:t,...l})})},83063:(e,t,r)=>{"use strict";r.d(t,{A:()=>p});var i=r(12115),o=r(29722),a=r(96748),s=r(42131),n=r(64874),l=r(24318),d=r(14770);function c(e){return(0,d.Ay)("MuiCardContent",e)}(0,l.A)("MuiCardContent",["root"]);var u=r(95155);let h=(0,s.Ay)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(e,t)=>t.root})({padding:16,"&:last-child":{paddingBottom:24}}),p=i.forwardRef(function(e,t){let r=(0,n.b)({props:e,name:"MuiCardContent"}),{className:i,component:s="div",...l}=r,d={...r,component:s},p=(e=>{let{classes:t}=e;return(0,a.A)({root:["root"]},c,t)})(d);return(0,u.jsx)(h,{as:s,className:(0,o.A)(p.root,i),ownerState:d,ref:t,...l})})},90526:(e,t,r)=>{"use strict";r.d(t,{A:()=>n});var i,o=r(12115);let a=0,s={...i||(i=r.t(o,2))}.useId;function n(e){if(void 0!==s){let t=s();return e??t}return function(e){let[t,r]=o.useState(e),i=e||t;return o.useEffect(()=>{null==t&&(a+=1,r(`mui-${a}`))},[t]),i}(e)}},93385:(e,t,r)=>{"use strict";r.d(t,{A:()=>k});var i=r(12115),o=r(29722),a=r(96748),s=r(23462),n=r(42131),l=r(13957),d=r(64874),c=r(77785),u=r(42067),h=r(24318),p=r(14770);function m(e){return(0,p.Ay)("MuiCircularProgress",e)}(0,h.A)("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);var f=r(95155);let A=(0,s.i7)`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,v=(0,s.i7)`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`,y="string"!=typeof A?(0,s.AH)`
        animation: ${A} 1.4s linear infinite;
      `:null,x="string"!=typeof v?(0,s.AH)`
        animation: ${v} 1.4s ease-in-out infinite;
      `:null,g=(0,n.Ay)("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[r.variant],t[`color${(0,c.A)(r.color)}`]]}})((0,l.A)(({theme:e})=>({display:"inline-block",variants:[{props:{variant:"determinate"},style:{transition:e.transitions.create("transform")}},{props:{variant:"indeterminate"},style:y||{animation:`${A} 1.4s linear infinite`}},...Object.entries(e.palette).filter((0,u.A)()).map(([t])=>({props:{color:t},style:{color:(e.vars||e).palette[t].main}}))]}))),b=(0,n.Ay)("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(e,t)=>t.svg})({display:"block"}),C=(0,n.Ay)("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.circle,t[`circle${(0,c.A)(r.variant)}`],r.disableShrink&&t.circleDisableShrink]}})((0,l.A)(({theme:e})=>({stroke:"currentColor",variants:[{props:{variant:"determinate"},style:{transition:e.transitions.create("stroke-dashoffset")}},{props:{variant:"indeterminate"},style:{strokeDasharray:"80px, 200px",strokeDashoffset:0}},{props:({ownerState:e})=>"indeterminate"===e.variant&&!e.disableShrink,style:x||{animation:`${v} 1.4s ease-in-out infinite`}}]}))),k=i.forwardRef(function(e,t){let r=(0,d.b)({props:e,name:"MuiCircularProgress"}),{className:i,color:s="primary",disableShrink:n=!1,size:l=40,style:u,thickness:h=3.6,value:p=0,variant:A="indeterminate",...v}=r,y={...r,color:s,disableShrink:n,size:l,thickness:h,value:p,variant:A},x=(e=>{let{classes:t,variant:r,color:i,disableShrink:o}=e,s={root:["root",r,`color${(0,c.A)(i)}`],svg:["svg"],circle:["circle",`circle${(0,c.A)(r)}`,o&&"circleDisableShrink"]};return(0,a.A)(s,m,t)})(y),k={},j={},w={};if("determinate"===A){let e=2*Math.PI*((44-h)/2);k.strokeDasharray=e.toFixed(3),w["aria-valuenow"]=Math.round(p),k.strokeDashoffset=`${((100-p)/100*e).toFixed(3)}px`,j.transform="rotate(-90deg)"}return(0,f.jsx)(g,{className:(0,o.A)(x.root,i),style:{width:l,height:l,...j,...u},ownerState:y,ref:t,role:"progressbar",...w,...v,children:(0,f.jsx)(b,{className:x.svg,ownerState:y,viewBox:"22 22 44 44",children:(0,f.jsx)(C,{className:x.circle,style:k,ownerState:y,cx:44,cy:44,r:(44-h)/2,fill:"none",strokeWidth:h})})})})},99084:(e,t,r)=>{"use strict";r.d(t,{A:()=>m});var i=r(12115),o=r(29722),a=r(96748),s=r(42131),n=r(64874),l=r(95877),d=r(24318),c=r(14770);function u(e){return(0,c.Ay)("MuiCard",e)}(0,d.A)("MuiCard",["root"]);var h=r(95155);let p=(0,s.Ay)(l.A,{name:"MuiCard",slot:"Root",overridesResolver:(e,t)=>t.root})({overflow:"hidden"}),m=i.forwardRef(function(e,t){let r=(0,n.b)({props:e,name:"MuiCard"}),{className:i,raised:s=!1,...l}=r,d={...r,raised:s},c=(e=>{let{classes:t}=e;return(0,a.A)({root:["root"]},u,t)})(d);return(0,h.jsx)(p,{className:(0,o.A)(c.root,i),elevation:s?8:void 0,ref:t,ownerState:d,...l})})}},e=>{e.O(0,[5753,2149,2600,3021,8500,6576,5473,8441,6511,7358],()=>e(e.s=41441)),_N_E=e.O()}]);