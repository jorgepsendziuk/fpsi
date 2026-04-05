(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,742732,(e,r,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"HeadManagerContext",{enumerable:!0,get:function(){return o}});let o=e.r(563141)._(e.r(271645)).default.createContext({})},922737,(e,r,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"setAttributesFromProps",{enumerable:!0,get:function(){return s}});let o={acceptCharset:"accept-charset",className:"class",htmlFor:"for",httpEquiv:"http-equiv",noModule:"noModule"},n=["onLoad","onReady","dangerouslySetInnerHTML","children","onError","strategy","stylesheets"];function i(e){return["async","defer","noModule"].includes(e)}function s(e,r){for(let[t,s]of Object.entries(r)){if(!r.hasOwnProperty(t)||n.includes(t)||void 0===s)continue;let l=o[t]||t.toLowerCase();"SCRIPT"===e.tagName&&i(l)?e[l]=!!s:e.setAttribute(l,String(s)),(!1===s||"SCRIPT"===e.tagName&&i(l)&&(!s||"false"===s))&&(e.setAttribute(l,""),e.removeAttribute(l))}}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),r.exports=t.default)},18576,(e,r,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o={ErrorIcon:function(){return a},errorStyles:function(){return s},errorThemeCss:function(){return l}};for(var n in o)Object.defineProperty(t,n,{enumerable:!0,get:o[n]});e.r(563141);let i=e.r(843476);e.r(271645);let s={container:{fontFamily:'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"},card:{maxWidth:"420px",padding:"32px 28px",textAlign:"left"},icon:{marginBottom:"16px"},title:{fontSize:"17px",fontWeight:600,letterSpacing:"-0.01em",margin:"0 0 8px 0",color:"var(--next-error-title)"},message:{fontSize:"14px",fontWeight:400,lineHeight:1.6,margin:"0 0 6px 0",color:"var(--next-error-message)"},messageHint:{fontSize:"13px",fontWeight:400,lineHeight:1.5,margin:"0 0 20px 0",color:"var(--next-error-hint)"},buttonGroup:{display:"flex",gap:"12px",alignItems:"center"},button:{padding:"10px 20px",fontSize:"14px",fontWeight:500,letterSpacing:"0.01em",borderRadius:"6px",cursor:"pointer",color:"var(--next-error-btn-text)",background:"var(--next-error-btn-bg)",border:"var(--next-error-btn-border)"},buttonSecondary:{padding:"10px 20px",fontSize:"14px",fontWeight:500,letterSpacing:"0.01em",borderRadius:"6px",cursor:"pointer",color:"var(--next-error-btn-secondary-text)",background:"transparent",border:"none"},digestContainer:{marginTop:"20px",paddingTop:"16px",borderTop:"var(--next-error-digest-border)"},digest:{fontSize:"12px",fontWeight:400,margin:"0",color:"var(--next-error-digest)"},digestCode:{fontFamily:'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace',fontSize:"11px",color:"var(--next-error-digest-code)",userSelect:"all"}},l=`
:root {
  --next-error-bg: #fff;
  --next-error-text: #171717;
  --next-error-title: #171717;
  --next-error-message: #666;
  --next-error-hint: #888;
  --next-error-digest: #999;
  --next-error-digest-code: #888;
  --next-error-digest-border: 1px solid rgba(0,0,0,0.06);
  --next-error-btn-text: #171717;
  --next-error-btn-bg: #fff;
  --next-error-btn-border: 1px solid #e5e5e5;
  --next-error-btn-secondary-text: #666;
  --next-error-icon-ring: #fecaca;
  --next-error-icon-fill: #fef2f2;
}
@media (prefers-color-scheme: dark) {
  :root {
    --next-error-bg: #0a0a0a;
    --next-error-text: #ededed;
    --next-error-title: #ededed;
    --next-error-message: #a0a0a0;
    --next-error-hint: #707070;
    --next-error-digest: #606060;
    --next-error-digest-code: #707070;
    --next-error-digest-border: 1px solid rgba(255,255,255,0.08);
    --next-error-btn-text: #ededed;
    --next-error-btn-bg: #1a1a1a;
    --next-error-btn-border: 1px solid #333;
    --next-error-btn-secondary-text: #a0a0a0;
    --next-error-icon-ring: #5c2121;
    --next-error-icon-fill: #2a1618;
  }
}
body { margin: 0; color: var(--next-error-text); background: var(--next-error-bg); }
`.replace(/\n\s*/g,"");function a(){return(0,i.jsxs)("svg",{width:"40",height:"40",viewBox:"0 0 40 40",fill:"none",style:s.icon,children:[(0,i.jsx)("circle",{cx:"20",cy:"20",r:"19",stroke:"var(--next-error-icon-ring)",strokeWidth:"2"}),(0,i.jsx)("circle",{cx:"20",cy:"20",r:"16",fill:"var(--next-error-icon-fill)"}),(0,i.jsx)("path",{d:"M20 12v9",stroke:"#dc2626",strokeWidth:"2.5",strokeLinecap:"round"}),(0,i.jsx)("circle",{cx:"20",cy:"27",r:"1.5",fill:"#dc2626"})]})}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),r.exports=t.default)},168027,(e,r,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return s}});let o=e.r(843476),n=e.r(912354),i=e.r(18576),s=function({error:e}){let r=e?.digest,t=!!r,s=t?"If this keeps happening, it may be a server issue.":null;return(0,o.jsxs)("html",{id:"__next_error__",children:[(0,o.jsx)("head",{children:(0,o.jsx)("style",{dangerouslySetInnerHTML:{__html:i.errorThemeCss}})}),(0,o.jsxs)("body",{children:[(0,o.jsx)(n.HandleISRError,{error:e}),(0,o.jsx)("div",{style:i.errorStyles.container,children:(0,o.jsxs)("div",{style:i.errorStyles.card,children:[(0,o.jsx)(i.ErrorIcon,{}),(0,o.jsx)("h1",{style:i.errorStyles.title,children:t?"This page failed to load":"This page crashed"}),(0,o.jsx)("p",{style:i.errorStyles.message,children:t?"Something went wrong while loading this page.":"An error occurred while running this page."}),s&&(0,o.jsx)("p",{style:i.errorStyles.messageHint,children:s}),!t&&(0,o.jsx)("p",{style:i.errorStyles.messageHint,children:"Reloading usually fixes this."}),(0,o.jsxs)("div",{style:i.errorStyles.buttonGroup,children:[(0,o.jsx)("form",{children:(0,o.jsx)("button",{type:"submit",style:i.errorStyles.button,children:"Reload page"})}),!t&&(0,o.jsx)("button",{type:"button",style:i.errorStyles.buttonSecondary,onClick:()=>{window.history.length>1?window.history.back():window.location.href="/"},children:"Go back"})]}),r&&(0,o.jsx)("div",{style:i.errorStyles.digestContainer,children:(0,o.jsxs)("p",{style:i.errorStyles.digest,children:["Error reference:"," ",(0,o.jsx)("code",{style:i.errorStyles.digestCode,children:r})]})})]})})]})]})};("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),r.exports=t.default)}]);