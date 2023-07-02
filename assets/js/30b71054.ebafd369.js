"use strict";(self.webpackChunkdynamode_docs=self.webpackChunkdynamode_docs||[]).push([[821],{3905:(e,t,a)=>{a.d(t,{Zo:()=>u,kt:()=>p});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},l=Object.keys(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),d=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},u=function(e){var t=d(e.components);return n.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,l=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),m=d(a),p=r,b=m["".concat(s,".").concat(p)]||m[p]||c[p]||l;return a?n.createElement(b,i(i({ref:t},u),{},{components:a})):n.createElement(b,i({ref:t},u))}));function p(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=a.length,i=new Array(l);i[0]=m;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:r,i[1]=o;for(var d=2;d<l;d++)i[d]=a[d];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}m.displayName="MDXCreateElement"},5162:(e,t,a)=>{a.d(t,{Z:()=>i});var n=a(7294),r=a(6010);const l="tabItem_Ymn6";function i(e){let{children:t,hidden:a,className:i}=e;return n.createElement("div",{role:"tabpanel",className:(0,r.Z)(l,i),hidden:a},t)}},5488:(e,t,a)=>{a.d(t,{Z:()=>p});var n=a(7462),r=a(7294),l=a(6010),i=a(2389),o=a(7392),s=a(7094),d=a(2466);const u="tabList__CuJ",c="tabItem_LNqP";function m(e){var t;const{lazy:a,block:i,defaultValue:m,values:p,groupId:b,className:y}=e,g=r.Children.map(e.children,(e=>{if((0,r.isValidElement)(e)&&"value"in e.props)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)})),h=p??g.map((e=>{let{props:{value:t,label:a,attributes:n}}=e;return{value:t,label:a,attributes:n}})),v=(0,o.l)(h,((e,t)=>e.value===t.value));if(v.length>0)throw new Error(`Docusaurus error: Duplicate values "${v.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`);const f=null===m?m:m??(null==(t=g.find((e=>e.props.default)))?void 0:t.props.value)??g[0].props.value;if(null!==f&&!h.some((e=>e.value===f)))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${f}" but none of its children has the corresponding value. Available values are: ${h.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);const{tabGroupChoices:k,setTabGroupChoices:T}=(0,s.U)(),[w,x]=(0,r.useState)(f),M=[],{blockElementScrollPositionUntilNextRender:O}=(0,d.o5)();if(null!=b){const e=k[b];null!=e&&e!==w&&h.some((t=>t.value===e))&&x(e)}const E=e=>{const t=e.currentTarget,a=M.indexOf(t),n=h[a].value;n!==w&&(O(t),x(n),null!=b&&T(b,String(n)))},N=e=>{var t;let a=null;switch(e.key){case"ArrowRight":{const t=M.indexOf(e.currentTarget)+1;a=M[t]??M[0];break}case"ArrowLeft":{const t=M.indexOf(e.currentTarget)-1;a=M[t]??M[M.length-1];break}}null==(t=a)||t.focus()};return r.createElement("div",{className:(0,l.Z)("tabs-container",u)},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,l.Z)("tabs",{"tabs--block":i},y)},h.map((e=>{let{value:t,label:a,attributes:i}=e;return r.createElement("li",(0,n.Z)({role:"tab",tabIndex:w===t?0:-1,"aria-selected":w===t,key:t,ref:e=>M.push(e),onKeyDown:N,onFocus:E,onClick:E},i,{className:(0,l.Z)("tabs__item",c,null==i?void 0:i.className,{"tabs__item--active":w===t})}),a??t)}))),a?(0,r.cloneElement)(g.filter((e=>e.props.value===w))[0],{className:"margin-top--md"}):r.createElement("div",{className:"margin-top--md"},g.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==w})))))}function p(e){const t=(0,i.Z)();return r.createElement(m,(0,n.Z)({key:String(t)},e))}},4157:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>c,frontMatter:()=>l,metadata:()=>o,toc:()=>d});var n=a(7462),r=(a(7294),a(3905));a(5488),a(5162);const l={title:"Table Manager | Dynamode",description:"Table Manager",sidebar_label:"Table Manager",hide_title:!0},i="Table Manager",o={unversionedId:"guide/table/tableManager",id:"guide/table/tableManager",title:"Table Manager | Dynamode",description:"Table Manager",source:"@site/docs/guide/table/tableManager.mdx",sourceDirName:"guide/table",slug:"/guide/table/tableManager",permalink:"/dynamode/docs/guide/table/tableManager",draft:!1,editUrl:"https://github.com/blazejkustra/dynamode/tree/master/docs/docs/guide/table/tableManager.mdx",tags:[],version:"current",frontMatter:{title:"Table Manager | Dynamode",description:"Table Manager",sidebar_label:"Table Manager",hide_title:!0},sidebar:"sidebar",previous:{title:"Decorators",permalink:"/dynamode/docs/guide/entity/decorators"},next:{title:"Entity Manager",permalink:"/dynamode/docs/guide/table/entityManager"}},s={},d=[{value:"new TableManager(tableEntity, tableMetadata)",id:"new-tablemanagertableentity-tablemetadata",level:2},{value:"TableManager.entityManager(entity?)",id:"tablemanagerentitymanagerentity",level:2},{value:"TableManager.create(options?)",id:"tablemanagercreateoptions",level:2},{value:"TableManager.createIndex(indexName, options?)",id:"tablemanagercreateindexindexname-options",level:2},{value:"TableManager.deleteIndex(indexName, options?)",id:"tablemanagerdeleteindexindexname-options",level:2},{value:"TableManager.validate(options?)",id:"tablemanagervalidateoptions",level:2}],u={toc:d};function c(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},u,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"table-manager"},"Table Manager"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Entity")," takes one argument ",(0,r.kt)("inlineCode",{parentName:"p"},"tableName: string")," which defines the table in which the model will be saved. It also takes a generic type which describes primary key and secondary index keys. Dynamode uses this type in all underlying methods so be cautious when setting it up. "),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"type Keys = {\n  partitionKey: 'keyPk';\n  sortKey?: 'keySk';\n  indexes?: {\n    [indexName: string]: {\n      partitionKey?: 'indexKeyPk';\n      sortKey?: 'indexKeySk';\n    };\n  }\n};\n")),(0,r.kt)("h2",{id:"new-tablemanagertableentity-tablemetadata"},"new TableManager(tableEntity, tableMetadata)"),(0,r.kt)("h2",{id:"tablemanagerentitymanagerentity"},"TableManager.entityManager(entity?)"),(0,r.kt)("h2",{id:"tablemanagercreateoptions"},"TableManager.create(options?)"),(0,r.kt)("p",null,"This method creates a table in DynamoDB."),(0,r.kt)("admonition",{type:"danger"},(0,r.kt)("p",{parentName:"admonition"},"This method isn't tested yet. Use it at your own risk.")),(0,r.kt)("h2",{id:"tablemanagercreateindexindexname-options"},"TableManager.createIndex(indexName, options?)"),(0,r.kt)("p",null,"This method creates a secondary index in DynamoDB."),(0,r.kt)("admonition",{type:"danger"},(0,r.kt)("p",{parentName:"admonition"},"This method isn't tested yet. Use it at your own risk.")),(0,r.kt)("h2",{id:"tablemanagerdeleteindexindexname-options"},"TableManager.deleteIndex(indexName, options?)"),(0,r.kt)("p",null,"This method deletes a secondary index in DynamoDB."),(0,r.kt)("admonition",{type:"danger"},(0,r.kt)("p",{parentName:"admonition"},"This method isn't tested yet. Use it at your own risk.")),(0,r.kt)("h2",{id:"tablemanagervalidateoptions"},"TableManager.validate(options?)"),(0,r.kt)("p",null,"This method validates the integrity of TableEntity and DynamoDB table."),(0,r.kt)("admonition",{type:"danger"},(0,r.kt)("p",{parentName:"admonition"},"This method isn't tested yet. Use it at your own risk.")))}c.isMDXComponent=!0}}]);