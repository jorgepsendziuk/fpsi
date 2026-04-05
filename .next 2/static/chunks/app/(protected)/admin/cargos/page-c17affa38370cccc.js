(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4124],{8316:(e,t,r)=>{Promise.resolve().then(r.bind(r,41096))},19781:(e,t,r)=>{"use strict";r.d(t,{A:()=>a});var i=r(40570),n=r(95155);let a=(0,i.A)((0,n.jsx)("path",{d:"M20 7h-5V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2M9 12c.83 0 1.5.67 1.5 1.5S9.83 15 9 15s-1.5-.67-1.5-1.5S8.17 12 9 12m3 6H6v-.75c0-1 2-1.5 3-1.5s3 .5 3 1.5zm1-9h-2V4h2zm5 7.5h-4V15h4zm0-3h-4V12h4z"}),"Badge")},41096:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>v});var i=r(95155),n=r(12115),a=r(32020),o=r(76010),s=r(64924),l=r(80590),h=r(95877),d=r(72852),c=r(29586),p=r(8682),u=r(30902),m=r(73039),A=r(57518),f=r(19781);function v(){let[e,t]=(0,n.useState)([]),[r,v]=(0,n.useState)(!0);return(0,n.useEffect)(()=>{fetch("/api/admin/cargos").then(e=>e.json()).then(e=>Array.isArray(e)?t(e):[]).catch(()=>t([])).finally(()=>v(!1))},[]),(0,i.jsxs)(a.A,{maxWidth:"lg",children:[(0,i.jsxs)(o.A,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[(0,i.jsx)(f.A,{color:"primary",sx:{fontSize:32}}),(0,i.jsx)(s.A,{variant:"h5",fontWeight:"bold",children:"Cargos"})]}),(0,i.jsx)(l.A,{component:h.A,children:(0,i.jsxs)(d.A,{children:[(0,i.jsx)(c.A,{children:(0,i.jsxs)(p.A,{children:[(0,i.jsx)(u.A,{children:"ID"}),(0,i.jsx)(u.A,{children:"Nome"}),(0,i.jsx)(u.A,{children:"Ativo"})]})}),(0,i.jsx)(m.A,{children:r?[void 0,void 0,void 0,void 0,void 0].map((e,t)=>(0,i.jsxs)(p.A,{children:[(0,i.jsx)(u.A,{children:(0,i.jsx)(A.A,{})}),(0,i.jsx)(u.A,{children:(0,i.jsx)(A.A,{})}),(0,i.jsx)(u.A,{children:(0,i.jsx)(A.A,{})})]},t)):e.map(e=>(0,i.jsxs)(p.A,{children:[(0,i.jsx)(u.A,{children:e.id}),(0,i.jsx)(u.A,{children:e.nome}),(0,i.jsx)(u.A,{children:e.ativo?"Sim":"N\xe3o"})]},e.id))})]})}),!r&&0===e.length&&(0,i.jsx)(s.A,{color:"text.secondary",sx:{mt:2},children:"Nenhum cargo encontrado."})]})}},57518:(e,t,r)=>{"use strict";r.d(t,{A:()=>y});var i=r(12115),n=r(29722),a=r(96748),o=r(31804),s=r(23462),l=r(42131),h=r(13957),d=r(64874),c=r(24318),p=r(14770);function u(e){return(0,p.Ay)("MuiSkeleton",e)}(0,c.A)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var m=r(95155);let A=(0,s.i7)`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,f=(0,s.i7)`
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
`,v="string"!=typeof A?(0,s.AH)`
        animation: ${A} 2s ease-in-out 0.5s infinite;
      `:null,x="string"!=typeof f?(0,s.AH)`
        &::after {
          animation: ${f} 2s linear 0.5s infinite;
        }
      `:null,g=(0,l.Ay)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[r.variant],!1!==r.animation&&t[r.animation],r.hasChildren&&t.withChildren,r.hasChildren&&!r.width&&t.fitContent,r.hasChildren&&!r.height&&t.heightAuto]}})((0,h.A)(({theme:e})=>{let t=String(e.shape.borderRadius).match(/[\d.\-+]*\s*(.*)/)[1]||"px",r=parseFloat(e.shape.borderRadius);return{display:"block",backgroundColor:e.vars?e.vars.palette.Skeleton.bg:(0,o.X4)(e.palette.text.primary,"light"===e.palette.mode?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${r}${t}/${Math.round(r/.6*10)/10}${t}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(e.vars||e).shape.borderRadius}},{props:({ownerState:e})=>e.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:e})=>e.hasChildren&&!e.width,style:{maxWidth:"fit-content"}},{props:({ownerState:e})=>e.hasChildren&&!e.height,style:{height:"auto"}},{props:{animation:"pulse"},style:v||{animation:`${A} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(e.vars||e).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:x||{"&::after":{animation:`${f} 2s linear 0.5s infinite`}}}]}})),y=i.forwardRef(function(e,t){let r=(0,d.b)({props:e,name:"MuiSkeleton"}),{animation:i="pulse",className:o,component:s="span",height:l,style:h,variant:c="text",width:p,...A}=r,f={...r,animation:i,component:s,variant:c,hasChildren:!!A.children},v=(e=>{let{classes:t,variant:r,animation:i,hasChildren:n,width:o,height:s}=e;return(0,a.A)({root:["root",r,i,n&&"withChildren",n&&!o&&"fitContent",n&&!s&&"heightAuto"]},u,t)})(f);return(0,m.jsx)(g,{as:s,ref:t,className:(0,n.A)(v.root,o),ownerState:f,...A,style:{width:p,height:l,...h}})})},80590:(e,t,r)=>{"use strict";r.d(t,{A:()=>u});var i=r(12115),n=r(29722),a=r(96748),o=r(42131),s=r(64874),l=r(24318),h=r(14770);function d(e){return(0,h.Ay)("MuiTableContainer",e)}(0,l.A)("MuiTableContainer",["root"]);var c=r(95155);let p=(0,o.Ay)("div",{name:"MuiTableContainer",slot:"Root",overridesResolver:(e,t)=>t.root})({width:"100%",overflowX:"auto"}),u=i.forwardRef(function(e,t){let r=(0,s.b)({props:e,name:"MuiTableContainer"}),{className:i,component:o="div",...l}=r,h={...r,component:o},u=(e=>{let{classes:t}=e;return(0,a.A)({root:["root"]},d,t)})(h);return(0,c.jsx)(p,{ref:t,as:o,className:(0,n.A)(u.root,i),ownerState:h,...l})})}},e=>{e.O(0,[5753,2149,3989,8441,6511,7358],()=>e(e.s=8316)),_N_E=e.O()}]);