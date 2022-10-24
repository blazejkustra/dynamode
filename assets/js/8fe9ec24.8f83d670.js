"use strict";(self.webpackChunkdynamode_docs=self.webpackChunkdynamode_docs||[]).push([[471],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>p});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),d=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},c=function(e){var t=d(e.components);return n.createElement(s.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=d(r),p=a,y=u["".concat(s,".").concat(p)]||u[p]||m[p]||o;return r?n.createElement(y,l(l({ref:t},c),{},{components:r})):n.createElement(y,l({ref:t},c))}));function p(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,l=new Array(o);l[0]=u;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:a,l[1]=i;for(var d=2;d<o;d++)l[d]=r[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},5162:(e,t,r)=>{r.d(t,{Z:()=>l});var n=r(7294),a=r(6010);const o="tabItem_Ymn6";function l(e){let{children:t,hidden:r,className:l}=e;return n.createElement("div",{role:"tabpanel",className:(0,a.Z)(o,l),hidden:r},t)}},5488:(e,t,r)=>{r.d(t,{Z:()=>p});var n=r(7462),a=r(7294),o=r(6010),l=r(2389),i=r(7392),s=r(7094),d=r(2466);const c="tabList__CuJ",m="tabItem_LNqP";function u(e){var t;const{lazy:r,block:l,defaultValue:u,values:p,groupId:y,className:f}=e,b=a.Children.map(e.children,(e=>{if((0,a.isValidElement)(e)&&"value"in e.props)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)})),v=p??b.map((e=>{let{props:{value:t,label:r,attributes:n}}=e;return{value:t,label:r,attributes:n}})),h=(0,i.l)(v,((e,t)=>e.value===t.value));if(h.length>0)throw new Error(`Docusaurus error: Duplicate values "${h.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`);const g=null===u?u:u??(null==(t=b.find((e=>e.props.default)))?void 0:t.props.value)??b[0].props.value;if(null!==g&&!v.some((e=>e.value===g)))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${g}" but none of its children has the corresponding value. Available values are: ${v.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);const{tabGroupChoices:k,setTabGroupChoices:w}=(0,s.U)(),[O,I]=(0,a.useState)(g),N=[],{blockElementScrollPositionUntilNextRender:E}=(0,d.o5)();if(null!=y){const e=k[y];null!=e&&e!==O&&v.some((t=>t.value===e))&&I(e)}const T=e=>{const t=e.currentTarget,r=N.indexOf(t),n=v[r].value;n!==O&&(E(t),I(n),null!=y&&w(y,String(n)))},D=e=>{var t;let r=null;switch(e.key){case"ArrowRight":{const t=N.indexOf(e.currentTarget)+1;r=N[t]??N[0];break}case"ArrowLeft":{const t=N.indexOf(e.currentTarget)-1;r=N[t]??N[N.length-1];break}}null==(t=r)||t.focus()};return a.createElement("div",{className:(0,o.Z)("tabs-container",c)},a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":l},f)},v.map((e=>{let{value:t,label:r,attributes:l}=e;return a.createElement("li",(0,n.Z)({role:"tab",tabIndex:O===t?0:-1,"aria-selected":O===t,key:t,ref:e=>N.push(e),onKeyDown:D,onFocus:T,onClick:T},l,{className:(0,o.Z)("tabs__item",m,null==l?void 0:l.className,{"tabs__item--active":O===t})}),r??t)}))),r?(0,a.cloneElement)(b.filter((e=>e.props.value===O))[0],{className:"margin-top--md"}):a.createElement("div",{className:"margin-top--md"},b.map(((e,t)=>(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==O})))))}function p(e){const t=(0,l.Z)();return a.createElement(u,(0,n.Z)({key:String(t)},e))}},5903:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>p,frontMatter:()=>i,metadata:()=>d,toc:()=>m});var n=r(7462),a=(r(7294),r(3905)),o=r(5488),l=r(5162);const i={title:"Import | Dynamode",description:"Import",sidebar_label:"Import",hide_title:!0},s="Import",d={unversionedId:"getting_started/import",id:"getting_started/import",title:"Import | Dynamode",description:"Import",source:"@site/docs/getting_started/import.mdx",sourceDirName:"getting_started",slug:"/getting_started/import",permalink:"/dynamode/docs/getting_started/import",draft:!1,editUrl:"https://github.com/blazejkustra/dynamode/tree/master/docs/docs/getting_started/import.mdx",tags:[],version:"current",frontMatter:{title:"Import | Dynamode",description:"Import",sidebar_label:"Import",hide_title:!0},sidebar:"sidebar",previous:{title:"Installation",permalink:"/dynamode/docs/getting_started/installation"},next:{title:"Configure",permalink:"/dynamode/docs/getting_started/configure"}},c={},m=[{value:"Import the whole Dynamode library",id:"import-the-whole-dynamode-library",level:2},{value:"Import specific classes/methods inside of curly brackets",id:"import-specific-classesmethods-inside-of-curly-brackets",level:2},{value:"Import specific classes/methods individually",id:"import-specific-classesmethods-individually",level:2}],u={toc:m};function p(e){let{components:t,...r}=e;return(0,a.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"import"},"Import"),(0,a.kt)("p",null,"In order to use ",(0,a.kt)("strong",{parentName:"p"},"Dynamode")," you need to either ",(0,a.kt)("inlineCode",{parentName:"p"},"import")," or ",(0,a.kt)("inlineCode",{parentName:"p"},"require")," it in your project."),(0,a.kt)(o.Z,{mdxType:"Tabs"},(0,a.kt)(l.Z,{value:"es-module",label:"ES module",default:!0,mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import dynamode from 'dynamode';\n"))),(0,a.kt)(l.Z,{value:"common-js",label:"CommonJS",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"const dynamode = require('dynamode');\n")))),(0,a.kt)("h2",{id:"import-the-whole-dynamode-library"},"Import the whole Dynamode library"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import dynamode from 'dynamode';\nconst { Entity, decorators, Dynamode } = dynamode;\n")),(0,a.kt)("h2",{id:"import-specific-classesmethods-inside-of-curly-brackets"},"Import specific classes/methods inside of curly brackets"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { Entity, decorators, Dynamode } from 'dynamode';\n")),(0,a.kt)("h2",{id:"import-specific-classesmethods-individually"},"Import specific classes/methods individually"),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"This is recommended way of importing Dynamode.")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import Entity from 'dynamode/entity';\nimport decorators from 'dynamode/decorators';\nimport { Dynamode } from 'dynamode';\n")))}p.isMDXComponent=!0}}]);