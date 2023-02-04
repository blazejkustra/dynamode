"use strict";(self.webpackChunkdynamode_docs=self.webpackChunkdynamode_docs||[]).push([[896],{3905:(e,t,a)=>{a.d(t,{Zo:()=>s,kt:()=>k});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),d=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},s=function(e){var t=d(e.components);return n.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),u=d(a),k=r,c=u["".concat(p,".").concat(k)]||u[k]||m[k]||i;return a?n.createElement(c,l(l({ref:t},s),{},{components:a})):n.createElement(c,l({ref:t},s))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=u;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:r,l[1]=o;for(var d=2;d<i;d++)l[d]=a[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},5374:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var n=a(7462),r=(a(7294),a(3905));const i={title:"Decorators | Dynamode",description:"Decorators",sidebar_label:"Decorators",hide_title:!0},l="Decorators",o={unversionedId:"guide/entity/decorators",id:"guide/entity/decorators",title:"Decorators | Dynamode",description:"Decorators",source:"@site/docs/guide/entity/decorators.mdx",sourceDirName:"guide/entity",slug:"/guide/entity/decorators",permalink:"/dynamode/docs/guide/entity/decorators",draft:!1,editUrl:"https://github.com/blazejkustra/dynamode/tree/master/docs/docs/guide/entity/decorators.mdx",tags:[],version:"current",frontMatter:{title:"Decorators | Dynamode",description:"Decorators",sidebar_label:"Decorators",hide_title:!0},sidebar:"sidebar",previous:{title:"Methods",permalink:"/dynamode/docs/guide/entity/methods"},next:{title:"Modeling",permalink:"/dynamode/docs/guide/entity/modeling"}},p={},d=[{value:"register(ddb)",id:"registerddb",level:2},{value:"Description",id:"description",level:3},{value:"Arguments",id:"arguments",level:3},{value:"Examples",id:"examples",level:3},{value:"primaryPartitionKey(type, options?)",id:"primarypartitionkeytype-options",level:2},{value:"Description",id:"description-1",level:3},{value:"Arguments",id:"arguments-1",level:3},{value:"Examples",id:"examples-1",level:3},{value:"primarySortKey(type, options?)",id:"primarysortkeytype-options",level:2},{value:"Description",id:"description-2",level:3},{value:"Arguments",id:"arguments-2",level:3},{value:"Examples",id:"examples-2",level:3},{value:"gsiPartitionKey(type, indexName, options?)",id:"gsipartitionkeytype-indexname-options",level:2},{value:"Description",id:"description-3",level:3},{value:"Arguments",id:"arguments-3",level:3},{value:"Examples",id:"examples-3",level:3},{value:"gsiSortKey(type, indexName, options?)",id:"gsisortkeytype-indexname-options",level:2},{value:"Description",id:"description-4",level:3},{value:"Arguments",id:"arguments-4",level:3},{value:"Examples",id:"examples-4",level:3},{value:"lsiSortKey(type, indexName, options?)",id:"lsisortkeytype-indexname-options",level:2},{value:"Description",id:"description-5",level:3},{value:"Arguments",id:"arguments-5",level:3},{value:"Examples",id:"examples-5",level:3},{value:"attribute(type, options?)",id:"attributetype-options",level:2},{value:"Description",id:"description-6",level:3},{value:"Arguments",id:"arguments-6",level:3},{value:"Examples",id:"examples-6",level:3},{value:"createdAt(type, options?)",id:"createdattype-options",level:2},{value:"Description",id:"description-7",level:3},{value:"Arguments",id:"arguments-7",level:3},{value:"Examples",id:"examples-7",level:3},{value:"updatedAt(type, options?)",id:"updatedattype-options",level:2},{value:"Description",id:"description-8",level:3},{value:"Arguments",id:"arguments-8",level:3},{value:"Examples",id:"examples-8",level:3},{value:"prefix(value)",id:"prefixvalue",level:2},{value:"Description",id:"description-9",level:3},{value:"Arguments",id:"arguments-9",level:3},{value:"Examples",id:"examples-9",level:3},{value:"suffix(value)",id:"suffixvalue",level:2},{value:"Description",id:"description-10",level:3},{value:"Arguments",id:"arguments-10",level:3},{value:"Examples",id:"examples-10",level:3}],s={toc:d};function m(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},s,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"decorators"},"Decorators"),(0,r.kt)("p",null,"Decorators are crucial for modelling  entities. Dynamode uses them to bind model attributes with DynamoDB tables."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"Decorators are a language feature which hasn\u2019t yet been fully ratified into the JavaScript specification - ",(0,r.kt)("a",{parentName:"p",href:"https://www.typescriptlang.org/tsconfig#experimentalDecorators"},"source"),". "),(0,r.kt)("p",{parentName:"admonition"},"Add following lines in ",(0,r.kt)("inlineCode",{parentName:"p"},"tsconfig.json")," in order to use decorators with Typescript:"),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},'{\n  "compilerOptions": {\n    ...\n    "experimentalDecorators": true,\n    ...\n  }\n}\n'))),(0,r.kt)("p",null,"To see examples of decorators in use - check out ",(0,r.kt)("a",{parentName:"p",href:"/docs/guide/entity/modeling"},"modeling")," page."),(0,r.kt)("h2",{id:"registerddb"},"register(ddb)"),(0,r.kt)("h3",{id:"description"},"Description"),(0,r.kt)("p",null,"Every model that inherits ",(0,r.kt)("inlineCode",{parentName:"p"},"Entity")," has to be registered with this decorator. It is used to tag the entity for Dynamode internal use."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"register(ddb)")," is required for every entity.")),(0,r.kt)("h3",{id:"arguments"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"value: DynamoDB")," - DynamoDB instance that you can set up with ",(0,r.kt)("inlineCode",{parentName:"p"},"Dynamode")," class "),(0,r.kt)("h3",{id:"examples"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const ddb = Dynamode.ddb.get();\n\n@register(ddb)\nclass YourModel extends Entity<Keys>(tableName: string) { \n  ...\n}\n")),(0,r.kt)("h2",{id:"primarypartitionkeytype-options"},"primaryPartitionKey(type, options?)"),(0,r.kt)("h3",{id:"description-1"},"Description"),(0,r.kt)("p",null,"This decorator is used to tag the partition key attribute."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"primaryPartitionKey(type, options?)")," is required in every entity.")),(0,r.kt)("h3",{id:"arguments-1"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type: String | Number")," - Data type of the attribute."),(0,r.kt)("p",null,"In case ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String")," is passed, you can add optional ",(0,r.kt)("inlineCode",{parentName:"p"},"options")," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"prefix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#prefixvalue"},"prefix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"suffix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#suffixvalue"},"suffix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h3",{id:"examples-1"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @primaryPartitionKey(String)\n  PK: string;\n  ...\n}\n")),(0,r.kt)("h2",{id:"primarysortkeytype-options"},"primarySortKey(type, options?)"),(0,r.kt)("h3",{id:"description-2"},"Description"),(0,r.kt)("p",null,"This decorator is used to tag the sort key attribute."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"primarySortKey(type, options?)")," is required in entities that belongs to table with composite primary key.")),(0,r.kt)("h3",{id:"arguments-2"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type: String | Number")," - Data type of the attribute."),(0,r.kt)("p",null,"In case ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String")," is passed, you can add optional ",(0,r.kt)("inlineCode",{parentName:"p"},"options")," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"prefix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#prefixvalue"},"prefix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"suffix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#suffixvalue"},"suffix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h3",{id:"examples-2"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @primarySortKey(String)\n  SK: string;\n  ...\n}\n")),(0,r.kt)("h2",{id:"gsipartitionkeytype-indexname-options"},"gsiPartitionKey(type, indexName, options?)"),(0,r.kt)("h3",{id:"description-3"},"Description"),(0,r.kt)("p",null,"This decorator is used to tag a global secondary index partition key attribute."),(0,r.kt)("h3",{id:"arguments-3"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type: String | Number")," - Data type of the attribute."),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"indexName: string")," - Name of the index for the partition key."),(0,r.kt)("p",null,"In case ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String")," is passed, you can add optional ",(0,r.kt)("inlineCode",{parentName:"p"},"options")," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"prefix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#prefixvalue"},"prefix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"suffix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#suffixvalue"},"suffix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h3",{id:"examples-3"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @gsiPartitionKey(String)\n  GSI_PK: string;\n  ...\n}\n")),(0,r.kt)("h2",{id:"gsisortkeytype-indexname-options"},"gsiSortKey(type, indexName, options?)"),(0,r.kt)("h3",{id:"description-4"},"Description"),(0,r.kt)("p",null,"This decorator is used to tag a global secondary index sort key attribute."),(0,r.kt)("h3",{id:"arguments-4"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type: String | Number")," - Data type of the attribute."),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"indexName: string")," - Name of the index for the sort key."),(0,r.kt)("p",null,"In case ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String")," is passed, you can add optional ",(0,r.kt)("inlineCode",{parentName:"p"},"options")," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"prefix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#prefixvalue"},"prefix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"suffix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#suffixvalue"},"suffix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h3",{id:"examples-4"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @gsiSortKey(String)\n  GSI_SK: string;\n  ...\n}\n")),(0,r.kt)("h2",{id:"lsisortkeytype-indexname-options"},"lsiSortKey(type, indexName, options?)"),(0,r.kt)("h3",{id:"description-5"},"Description"),(0,r.kt)("p",null,"This decorator is used to tag a local secondary index sort key attribute."),(0,r.kt)("h3",{id:"arguments-5"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type: String | Number")," - Data type of the attribute."),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"indexName: string")," - Name of the index for the sort key."),(0,r.kt)("p",null,"In case ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String")," is passed, you can add optional ",(0,r.kt)("inlineCode",{parentName:"p"},"options")," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"prefix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#prefixvalue"},"prefix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"suffix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#suffixvalue"},"suffix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h3",{id:"examples-5"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @lsiSortKey(String)\n  LSI_SK: string;\n  ...\n}\n")),(0,r.kt)("h2",{id:"attributetype-options"},"attribute(type, options?)"),(0,r.kt)("h3",{id:"description-6"},"Description"),(0,r.kt)("p",null,"This decorator is used to tag a non partition/sort key attribute."),(0,r.kt)("h3",{id:"arguments-6"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type: String | Number | Boolean | Object | Array | Set | Map")," - Data type of the attribute."),(0,r.kt)("p",null,"In case ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String")," is passed, you can add optional ",(0,r.kt)("inlineCode",{parentName:"p"},"options")," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"prefix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#prefixvalue"},"prefix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"suffix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#suffixvalue"},"suffix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h3",{id:"examples-6"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @attribute(String)\n  attr1: string;\n  ...\n  @attribute(Boolean)\n  attr2: boolean;\n  ...\n  @attribute(Set)\n  attr3: Set<number>;\n  ...\n}\n")),(0,r.kt)("h2",{id:"createdattype-options"},"createdAt(type, options?)"),(0,r.kt)("h3",{id:"description-7"},"Description"),(0,r.kt)("p",null,"This decorator is used to tag an attribute that holds a ",(0,r.kt)("inlineCode",{parentName:"p"},"createdAt")," timestamp (moment when item is inserted to the table)."),(0,r.kt)("admonition",{type:"warning"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"createdAt(type, options?)")," can be used once for a single entity. ")),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"createdAt(type, options?)")," has to decorate attribute of ",(0,r.kt)("a",{parentName:"p",href:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date"},(0,r.kt)("inlineCode",{parentName:"a"},"Date"))," type.")),(0,r.kt)("h3",{id:"arguments-7"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type: String | Number")," - Data type of the attribute. Decorated ",(0,r.kt)("inlineCode",{parentName:"p"},"Date")," is saved to DynamoDB in ",(0,r.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Unix_time"},"Unix timestamp")," format for ",(0,r.kt)("inlineCode",{parentName:"p"},"type: Number")," and ",(0,r.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/ISO_8601"},"ISO 8601")," format for ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String"),"."),(0,r.kt)("p",null,"In case ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String")," is passed, you can add optional ",(0,r.kt)("inlineCode",{parentName:"p"},"options")," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"prefix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#prefixvalue"},"prefix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"suffix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#suffixvalue"},"suffix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h3",{id:"examples-7"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @createdAt(String)\n  CREATED_AT: string; // saved as ISO 8601: '2022-10-18T20:36:20.511Z'\n  ...\n}\n")),(0,r.kt)("h2",{id:"updatedattype-options"},"updatedAt(type, options?)"),(0,r.kt)("h3",{id:"description-8"},"Description"),(0,r.kt)("admonition",{type:"warning"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"updatedAt(type, options?)")," can be used once for a single entity. ")),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"updatedAt(type, options?)")," has to decorate attribute of ",(0,r.kt)("a",{parentName:"p",href:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date"},(0,r.kt)("inlineCode",{parentName:"a"},"Date"))," type.")),(0,r.kt)("p",null,"This decorator is used to tag an attribute that holds a ",(0,r.kt)("inlineCode",{parentName:"p"},"updatedAt")," timestamp (moment when item was last updated)."),(0,r.kt)("h3",{id:"arguments-8"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"type: String | Number")," - Data type of the attribute. Decorated ",(0,r.kt)("inlineCode",{parentName:"p"},"Date")," is saved to DynamoDB in ",(0,r.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Unix_time"},"Unix timestamp")," format for ",(0,r.kt)("inlineCode",{parentName:"p"},"type: Number")," and ",(0,r.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/ISO_8601"},"ISO 8601")," format for ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String"),"."),(0,r.kt)("p",null,"In case ",(0,r.kt)("inlineCode",{parentName:"p"},"type: String")," is passed, you can add optional ",(0,r.kt)("inlineCode",{parentName:"p"},"options")," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"prefix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#prefixvalue"},"prefix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"suffix")),(0,r.kt)("td",{parentName:"tr",align:null},"Shortcut for ",(0,r.kt)("a",{parentName:"td",href:"/docs/guide/entity/decorators#suffixvalue"},"suffix(value)")," decorator"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h3",{id:"examples-8"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @updatedAt(Number)\n  UPDATED_AT: number; // saved as Unix timestamp: 1666125293\n  ...\n}\n")),(0,r.kt)("h2",{id:"prefixvalue"},"prefix(value)"),(0,r.kt)("h3",{id:"description-9"},"Description"),(0,r.kt)("p",null,"This decorator is used to add a static prefix to the value (only for attributes of ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," type). You can customize a separator that is added between prefix and actual value with ",(0,r.kt)("inlineCode",{parentName:"p"},"Dynamode")," class."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"Prefix is added whenever you interact with a attribute."),(0,r.kt)("ul",{parentName:"admonition"},(0,r.kt)("li",{parentName:"ul"},"All Entity static methods (e.g. ",(0,r.kt)("inlineCode",{parentName:"li"},"Entity.get()"),", ",(0,r.kt)("inlineCode",{parentName:"li"},"Entity.update()"),")"),(0,r.kt)("li",{parentName:"ul"},"Condition, Query and Scan builders"),(0,r.kt)("li",{parentName:"ul"},"transactionGet and transactionWrite"))),(0,r.kt)("h3",{id:"arguments-9"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"value: string")," - String that will be prepended to the value"),(0,r.kt)("h3",{id:"examples-9"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @prefix(\"attr_prefix\")\n  @attribute(String)\n  attr: string; // for 'attr_value' -> 'attr_prefix#attr_value'\n  ...\n}\n")),(0,r.kt)("h2",{id:"suffixvalue"},"suffix(value)"),(0,r.kt)("h3",{id:"description-10"},"Description"),(0,r.kt)("p",null,"This decorator is used to add a static suffix to the value (only for attributes of ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," type). You can customize a separator that is added between actual value and suffix with ",(0,r.kt)("inlineCode",{parentName:"p"},"Dynamode")," class."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"Suffix is added whenever you interact with a attribute."),(0,r.kt)("ul",{parentName:"admonition"},(0,r.kt)("li",{parentName:"ul"},"All Entity static methods (e.g. ",(0,r.kt)("inlineCode",{parentName:"li"},"Entity.get()"),", ",(0,r.kt)("inlineCode",{parentName:"li"},"Entity.update()"),")"),(0,r.kt)("li",{parentName:"ul"},"Condition, Query and Scan builders"),(0,r.kt)("li",{parentName:"ul"},"transactionGet and transactionWrite"))),(0,r.kt)("h3",{id:"arguments-10"},"Arguments"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"value: string")," - String that will be appended to the value"),(0,r.kt)("h3",{id:"examples-10"},"Examples"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"class YourModel extends Entity<Keys>(tableName: string) { \n  ...\n  @suffix(\"attr_suffix\")\n  @attribute(String)\n  attr: string; // for 'attr_value' -> 'attr_value#attr_suffix'\n  ...\n}\n")))}m.isMDXComponent=!0}}]);