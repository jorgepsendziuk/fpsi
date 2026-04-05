(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6216],{54200:(e,t,r)=>{"use strict";r.d(t,{A:()=>a});var i=r(40570),n=r(95155);let a=(0,i.A)((0,n.jsx)("path",{d:"M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z"}),"Business")},57518:(e,t,r)=>{"use strict";r.d(t,{A:()=>b});var i=r(12115),n=r(29722),a=r(96748),o=r(31804),s=r(23462),l=r(42131),h=r(13957),d=r(64874),p=r(24318),c=r(14770);function u(e){return(0,c.Ay)("MuiSkeleton",e)}(0,p.A)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var m=r(95155);let v=(0,s.i7)`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,A=(0,s.i7)`
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
`,f="string"!=typeof v?(0,s.AH)`
        animation: ${v} 2s ease-in-out 0.5s infinite;
      `:null,x="string"!=typeof A?(0,s.AH)`
        &::after {
          animation: ${A} 2s linear 0.5s infinite;
        }
      `:null,y=(0,l.Ay)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[r.variant],!1!==r.animation&&t[r.animation],r.hasChildren&&t.withChildren,r.hasChildren&&!r.width&&t.fitContent,r.hasChildren&&!r.height&&t.heightAuto]}})((0,h.A)(({theme:e})=>{let t=String(e.shape.borderRadius).match(/[\d.\-+]*\s*(.*)/)[1]||"px",r=parseFloat(e.shape.borderRadius);return{display:"block",backgroundColor:e.vars?e.vars.palette.Skeleton.bg:(0,o.X4)(e.palette.text.primary,"light"===e.palette.mode?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${r}${t}/${Math.round(r/.6*10)/10}${t}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(e.vars||e).shape.borderRadius}},{props:({ownerState:e})=>e.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:e})=>e.hasChildren&&!e.width,style:{maxWidth:"fit-content"}},{props:({ownerState:e})=>e.hasChildren&&!e.height,style:{height:"auto"}},{props:{animation:"pulse"},style:f||{animation:`${v} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(e.vars||e).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:x||{"&::after":{animation:`${A} 2s linear 0.5s infinite`}}}]}})),b=i.forwardRef(function(e,t){let r=(0,d.b)({props:e,name:"MuiSkeleton"}),{animation:i="pulse",className:o,component:s="span",height:l,style:h,variant:p="text",width:c,...v}=r,A={...r,animation:i,component:s,variant:p,hasChildren:!!v.children},f=(e=>{let{classes:t,variant:r,animation:i,hasChildren:n,width:o,height:s}=e;return(0,a.A)({root:["root",r,i,n&&"withChildren",n&&!o&&"fitContent",n&&!s&&"heightAuto"]},u,t)})(A);return(0,m.jsx)(y,{as:s,ref:t,className:(0,n.A)(f.root,o),ownerState:A,...v,style:{width:c,height:l,...h}})})},80590:(e,t,r)=>{"use strict";r.d(t,{A:()=>u});var i=r(12115),n=r(29722),a=r(96748),o=r(42131),s=r(64874),l=r(24318),h=r(14770);function d(e){return(0,h.Ay)("MuiTableContainer",e)}(0,l.A)("MuiTableContainer",["root"]);var p=r(95155);let c=(0,o.Ay)("div",{name:"MuiTableContainer",slot:"Root",overridesResolver:(e,t)=>t.root})({width:"100%",overflowX:"auto"}),u=i.forwardRef(function(e,t){let r=(0,s.b)({props:e,name:"MuiTableContainer"}),{className:i,component:o="div",...l}=r,h={...r,component:o},u=(e=>{let{classes:t}=e;return(0,a.A)({root:["root"]},d,t)})(h);return(0,p.jsx)(c,{ref:t,as:o,className:(0,n.A)(u.root,i),ownerState:h,...l})})},88056:(e,t,r)=>{Promise.resolve().then(r.bind(r,97444))},97444:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>f});var i=r(95155),n=r(12115),a=r(32020),o=r(76010),s=r(64924),l=r(80590),h=r(95877),d=r(72852),p=r(29586),c=r(8682),u=r(30902),m=r(73039),v=r(57518),A=r(54200);function f(){let[e,t]=(0,n.useState)([]),[r,f]=(0,n.useState)(!0);return(0,n.useEffect)(()=>{fetch("/api/admin/departamentos").then(e=>e.json()).then(e=>Array.isArray(e)?t(e):[]).catch(()=>t([])).finally(()=>f(!1))},[]),(0,i.jsxs)(a.A,{maxWidth:"lg",children:[(0,i.jsxs)(o.A,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[(0,i.jsx)(A.A,{color:"primary",sx:{fontSize:32}}),(0,i.jsx)(s.A,{variant:"h5",fontWeight:"bold",children:"Departamentos"})]}),(0,i.jsx)(l.A,{component:h.A,children:(0,i.jsxs)(d.A,{children:[(0,i.jsx)(p.A,{children:(0,i.jsxs)(c.A,{children:[(0,i.jsx)(u.A,{children:"ID"}),(0,i.jsx)(u.A,{children:"Nome"}),(0,i.jsx)(u.A,{children:"Ativo"})]})}),(0,i.jsx)(m.A,{children:r?[void 0,void 0,void 0,void 0,void 0].map((e,t)=>(0,i.jsxs)(c.A,{children:[(0,i.jsx)(u.A,{children:(0,i.jsx)(v.A,{})}),(0,i.jsx)(u.A,{children:(0,i.jsx)(v.A,{})}),(0,i.jsx)(u.A,{children:(0,i.jsx)(v.A,{})})]},t)):e.map(e=>(0,i.jsxs)(c.A,{children:[(0,i.jsx)(u.A,{children:e.id}),(0,i.jsx)(u.A,{children:e.nome}),(0,i.jsx)(u.A,{children:e.ativo?"Sim":"N\xe3o"})]},e.id))})]})}),!r&&0===e.length&&(0,i.jsx)(s.A,{color:"text.secondary",sx:{mt:2},children:"Nenhum departamento encontrado."})]})}}},e=>{e.O(0,[5753,2149,3989,8441,6511,7358],()=>e(e.s=88056)),_N_E=e.O()}]);