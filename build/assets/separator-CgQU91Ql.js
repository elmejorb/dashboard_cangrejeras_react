import{c as d,r as p,j as e,P as v,x as u}from"./index-rVBsoLmu.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],z=d("circle",x);var m="Separator",n="horizontal",f=["horizontal","vertical"],c=p.forwardRef((a,t)=>{const{decorative:o,orientation:r=n,...s}=a,i=h(r)?r:n,l=o?{role:"none"}:{"aria-orientation":i==="vertical"?i:void 0,role:"separator"};return e.jsx(v.div,{"data-orientation":i,...l,...s,ref:t})});c.displayName=m;function h(a){return f.includes(a)}var N=c;function I({className:a,orientation:t="horizontal",decorative:o=!0,...r}){return e.jsx(N,{"data-slot":"separator-root",decorative:o,orientation:t,className:u("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",a),...r})}export{z as C,I as S};
