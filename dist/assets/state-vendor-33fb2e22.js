import{r as A,g as P,R as _}from"./react-vendor-bf0c2452.js";const y=e=>{let t;const n=new Set,o=(s,f)=>{const i=typeof s=="function"?s(t):s;if(!Object.is(i,t)){const a=t;t=f??(typeof i!="object"||i===null)?i:Object.assign({},t,i),n.forEach(c=>c(t,a))}},r=()=>t,E={setState:o,getState:r,getInitialState:()=>v,subscribe:s=>(n.add(s),()=>n.delete(s)),destroy:()=>{n.clear()}},v=t=e(o,r,E);return E},T=e=>e?y(e):y;var h={exports:{}},I={},D={exports:{}},g={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d=A;function V(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var w=typeof Object.is=="function"?Object.is:V,j=d.useState,O=d.useEffect,$=d.useLayoutEffect,W=d.useDebugValue;function x(e,t){var n=t(),o=j({inst:{value:n,getSnapshot:t}}),r=o[0].inst,u=o[1];return $(function(){r.value=n,r.getSnapshot=t,b(r)&&u({inst:r})},[e,n,t]),O(function(){return b(r)&&u({inst:r}),e(function(){b(r)&&u({inst:r})})},[e]),W(n),n}function b(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!w(e,n)}catch{return!0}}function M(e,t){return t()}var C=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?M:x;g.useSyncExternalStore=d.useSyncExternalStore!==void 0?d.useSyncExternalStore:C;D.exports=g;var L=D.exports;/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p=A,U=L;function F(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var z=typeof Object.is=="function"?Object.is:F,H=U.useSyncExternalStore,k=p.useRef,B=p.useEffect,q=p.useMemo,G=p.useDebugValue;I.useSyncExternalStoreWithSelector=function(e,t,n,o,r){var u=k(null);if(u.current===null){var l={hasValue:!1,value:null};u.current=l}else l=u.current;u=q(function(){function E(a){if(!v){if(v=!0,s=a,a=o(a),r!==void 0&&l.hasValue){var c=l.value;if(r(c,a))return f=c}return f=a}if(c=f,z(s,a))return c;var m=o(a);return r!==void 0&&r(c,m)?(s=a,c):(s=a,f=m)}var v=!1,s,f,i=n===void 0?null:n;return[function(){return E(t())},i===null?void 0:function(){return E(i())}]},[t,n,o,r]);var S=H(e,u[0],u[1]);return B(function(){l.hasValue=!0,l.value=S},[S]),G(S),S};h.exports=I;var J=h.exports;const K=P(J),{useDebugValue:N}=_,{useSyncExternalStoreWithSelector:Q}=K;const X=e=>e;function Y(e,t=X,n){const o=Q(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,n);return N(o),o}const R=e=>{const t=typeof e=="function"?T(e):e,n=(o,r)=>Y(t,o,r);return Object.assign(n,t),n},ee=e=>e?R(e):R;export{ee as c};
