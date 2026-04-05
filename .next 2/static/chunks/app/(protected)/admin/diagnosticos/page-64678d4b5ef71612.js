(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5776],{26568:(e,t,r)=>{Promise.resolve().then(r.bind(r,59207))},57518:(e,t,r)=>{"use strict";r.d(t,{A:()=>v});var i=r(12115),n=r(29722),a=r(96748),s=r(31804),o=r(23462),l=r(42131),d=r(13957),h=r(64874),c=r(24318),p=r(14770);function u(e){return(0,p.Ay)("MuiSkeleton",e)}(0,c.A)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var A=r(95155);let x=(0,o.i7)`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,f=(0,o.i7)`
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
`,m="string"!=typeof x?(0,o.AH)`
        animation: ${x} 2s ease-in-out 0.5s infinite;
      `:null,j="string"!=typeof f?(0,o.AH)`
        &::after {
          animation: ${f} 2s linear 0.5s infinite;
        }
      `:null,g=(0,l.Ay)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[r.variant],!1!==r.animation&&t[r.animation],r.hasChildren&&t.withChildren,r.hasChildren&&!r.width&&t.fitContent,r.hasChildren&&!r.height&&t.heightAuto]}})((0,d.A)(({theme:e})=>{let t=String(e.shape.borderRadius).match(/[\d.\-+]*\s*(.*)/)[1]||"px",r=parseFloat(e.shape.borderRadius);return{display:"block",backgroundColor:e.vars?e.vars.palette.Skeleton.bg:(0,s.X4)(e.palette.text.primary,"light"===e.palette.mode?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${r}${t}/${Math.round(r/.6*10)/10}${t}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(e.vars||e).shape.borderRadius}},{props:({ownerState:e})=>e.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:e})=>e.hasChildren&&!e.width,style:{maxWidth:"fit-content"}},{props:({ownerState:e})=>e.hasChildren&&!e.height,style:{height:"auto"}},{props:{animation:"pulse"},style:m||{animation:`${x} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(e.vars||e).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:j||{"&::after":{animation:`${f} 2s linear 0.5s infinite`}}}]}})),v=i.forwardRef(function(e,t){let r=(0,h.b)({props:e,name:"MuiSkeleton"}),{animation:i="pulse",className:s,component:o="span",height:l,style:d,variant:c="text",width:p,...x}=r,f={...r,animation:i,component:o,variant:c,hasChildren:!!x.children},m=(e=>{let{classes:t,variant:r,animation:i,hasChildren:n,width:s,height:o}=e;return(0,a.A)({root:["root",r,i,n&&"withChildren",n&&!s&&"fitContent",n&&!o&&"heightAuto"]},u,t)})(f);return(0,A.jsx)(g,{as:o,ref:t,className:(0,n.A)(m.root,s),ownerState:f,...x,style:{width:p,height:l,...d}})})},59207:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>m});var i=r(95155),n=r(12115),a=r(32020),s=r(76010),o=r(64924),l=r(80590),d=r(95877),h=r(72852),c=r(29586),p=r(8682),u=r(30902),A=r(73039),x=r(57518),f=r(64090);function m(){let[e,t]=(0,n.useState)([]),[r,m]=(0,n.useState)(!0);return(0,n.useEffect)(()=>{fetch("/api/admin/diagnosticos").then(e=>e.json()).then(e=>Array.isArray(e)?t(e):[]).catch(()=>t([])).finally(()=>m(!1))},[]),(0,i.jsxs)(a.A,{maxWidth:"lg",children:[(0,i.jsxs)(s.A,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[(0,i.jsx)(f.A,{color:"primary",sx:{fontSize:32}}),(0,i.jsx)(o.A,{variant:"h5",fontWeight:"bold",children:"Diagn\xf3sticos"})]}),(0,i.jsx)(l.A,{component:d.A,children:(0,i.jsxs)(h.A,{children:[(0,i.jsx)(c.A,{children:(0,i.jsxs)(p.A,{children:[(0,i.jsx)(u.A,{children:"ID"}),(0,i.jsx)(u.A,{children:"Descri\xe7\xe3o"}),(0,i.jsx)(u.A,{children:"Cor"}),(0,i.jsx)(u.A,{children:"\xcdndice"}),(0,i.jsx)(u.A,{children:"Maturidade"})]})}),(0,i.jsx)(A.A,{children:r?[void 0,void 0,void 0].map((e,t)=>(0,i.jsxs)(p.A,{children:[(0,i.jsx)(u.A,{children:(0,i.jsx)(x.A,{})}),(0,i.jsx)(u.A,{children:(0,i.jsx)(x.A,{})}),(0,i.jsx)(u.A,{children:(0,i.jsx)(x.A,{})}),(0,i.jsx)(u.A,{children:(0,i.jsx)(x.A,{})}),(0,i.jsx)(u.A,{children:(0,i.jsx)(x.A,{})})]},t)):e.map(e=>(0,i.jsxs)(p.A,{children:[(0,i.jsx)(u.A,{children:e.id}),(0,i.jsx)(u.A,{children:e.descricao??"-"}),(0,i.jsx)(u.A,{children:(0,i.jsxs)(s.A,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.cor&&(0,i.jsx)(s.A,{sx:{width:20,height:20,borderRadius:1,bgcolor:e.cor}}),e.cor??"-"]})}),(0,i.jsx)(u.A,{children:e.indice??"-"}),(0,i.jsx)(u.A,{children:e.maturidade??"-"})]},e.id))})]})}),!r&&0===e.length&&(0,i.jsx)(o.A,{color:"text.secondary",sx:{mt:2},children:"Nenhum diagn\xf3stico encontrado."})]})}},64090:(e,t,r)=>{"use strict";r.d(t,{A:()=>a});var i=r(40570),n=r(95155);let a=(0,i.A)([(0,n.jsx)("path",{d:"m12 2-5.5 9h11z"},"0"),(0,n.jsx)("circle",{cx:"17.5",cy:"17.5",r:"4.5"},"1"),(0,n.jsx)("path",{d:"M3 13.5h8v8H3z"},"2")],"Category")},80590:(e,t,r)=>{"use strict";r.d(t,{A:()=>u});var i=r(12115),n=r(29722),a=r(96748),s=r(42131),o=r(64874),l=r(24318),d=r(14770);function h(e){return(0,d.Ay)("MuiTableContainer",e)}(0,l.A)("MuiTableContainer",["root"]);var c=r(95155);let p=(0,s.Ay)("div",{name:"MuiTableContainer",slot:"Root",overridesResolver:(e,t)=>t.root})({width:"100%",overflowX:"auto"}),u=i.forwardRef(function(e,t){let r=(0,o.b)({props:e,name:"MuiTableContainer"}),{className:i,component:s="div",...l}=r,d={...r,component:s},u=(e=>{let{classes:t}=e;return(0,a.A)({root:["root"]},h,t)})(d);return(0,c.jsx)(p,{ref:t,as:s,className:(0,n.A)(u.root,i),ownerState:d,...l})})}},e=>{e.O(0,[5753,2149,3989,8441,6511,7358],()=>e(e.s=26568)),_N_E=e.O()}]);