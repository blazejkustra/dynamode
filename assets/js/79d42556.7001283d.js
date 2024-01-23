"use strict";(self.webpackChunkdynamode_docs=self.webpackChunkdynamode_docs||[]).push([[143],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>y});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),u=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=u(n),y=r,c=m["".concat(s,".").concat(y)]||m[y]||d[y]||i;return n?a.createElement(c,l(l({ref:t},p),{},{components:n})):a.createElement(c,l({ref:t},p))}));function y(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=m;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:r,l[1]=o;for(var u=2;u<i;u++)l[u]=n[u];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},5162:(e,t,n)=>{n.d(t,{Z:()=>l});var a=n(7294),r=n(6010);const i="tabItem_Ymn6";function l(e){let{children:t,hidden:n,className:l}=e;return a.createElement("div",{role:"tabpanel",className:(0,r.Z)(i,l),hidden:n},t)}},5488:(e,t,n)=>{n.d(t,{Z:()=>y});var a=n(7462),r=n(7294),i=n(6010),l=n(2389),o=n(7392),s=n(7094),u=n(2466);const p="tabList__CuJ",d="tabItem_LNqP";function m(e){var t;const{lazy:n,block:l,defaultValue:m,values:y,groupId:c,className:k}=e,g=r.Children.map(e.children,(e=>{if((0,r.isValidElement)(e)&&"value"in e.props)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)})),h=y??g.map((e=>{let{props:{value:t,label:n,attributes:a}}=e;return{value:t,label:n,attributes:a}})),b=(0,o.l)(h,((e,t)=>e.value===t.value));if(b.length>0)throw new Error(`Docusaurus error: Duplicate values "${b.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`);const v=null===m?m:m??(null==(t=g.find((e=>e.props.default)))?void 0:t.props.value)??g[0].props.value;if(null!==v&&!h.some((e=>e.value===v)))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${v}" but none of its children has the corresponding value. Available values are: ${h.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);const{tabGroupChoices:N,setTabGroupChoices:f}=(0,s.U)(),[q,K]=(0,r.useState)(v),w=[],{blockElementScrollPositionUntilNextRender:C}=(0,u.o5)();if(null!=c){const e=N[c];null!=e&&e!==q&&h.some((t=>t.value===e))&&K(e)}const T=e=>{const t=e.currentTarget,n=w.indexOf(t),a=h[n].value;a!==q&&(C(t),K(a),null!=c&&f(c,String(a)))},D=e=>{var t;let n=null;switch(e.key){case"ArrowRight":{const t=w.indexOf(e.currentTarget)+1;n=w[t]??w[0];break}case"ArrowLeft":{const t=w.indexOf(e.currentTarget)-1;n=w[t]??w[w.length-1];break}}null==(t=n)||t.focus()};return r.createElement("div",{className:(0,i.Z)("tabs-container",p)},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.Z)("tabs",{"tabs--block":l},k)},h.map((e=>{let{value:t,label:n,attributes:l}=e;return r.createElement("li",(0,a.Z)({role:"tab",tabIndex:q===t?0:-1,"aria-selected":q===t,key:t,ref:e=>w.push(e),onKeyDown:D,onFocus:T,onClick:T},l,{className:(0,i.Z)("tabs__item",d,null==l?void 0:l.className,{"tabs__item--active":q===t})}),n??t)}))),n?(0,r.cloneElement)(g.filter((e=>e.props.value===q))[0],{className:"margin-top--md"}):r.createElement("div",{className:"margin-top--md"},g.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==q})))))}function y(e){const t=(0,l.Z)();return r.createElement(m,(0,a.Z)({key:String(t)},e))}},7320:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>y,frontMatter:()=>o,metadata:()=>u,toc:()=>d});var a=n(7462),r=(n(7294),n(3905)),i=n(5488),l=n(5162);const o={title:"Query | Dynamode",description:"Query",sidebar_label:"Query",hide_title:!0},s="Query",u={unversionedId:"guide/query",id:"guide/query",title:"Query | Dynamode",description:"Query",source:"@site/docs/guide/query.mdx",sourceDirName:"guide",slug:"/guide/query",permalink:"/dynamode/docs/guide/query",draft:!1,editUrl:"https://www.github.com/blazejkustra/dynamode/tree/master/docs/docs/guide/query.mdx",tags:[],version:"current",frontMatter:{title:"Query | Dynamode",description:"Query",sidebar_label:"Query",hide_title:!0},sidebar:"sidebar",previous:{title:"Condition",permalink:"/dynamode/docs/guide/condition"},next:{title:"Scan",permalink:"/dynamode/docs/guide/scan"}},p={},d=[{value:"Condition",id:"condition",level:2},{value:"new Query(Entity) or EntityManager.query()",id:"new-queryentity-or-entitymanagerquery",level:2},{value:"Query.partitionKey(key)",id:"querypartitionkeykey",level:2},{value:".eq(value)",id:"eqvalue",level:3},{value:"Query.sortKey(key)",id:"querysortkeykey",level:2},{value:".eq(value)",id:"eqvalue-1",level:3},{value:".ne(value)",id:"nevalue",level:3},{value:".lt(value)",id:"ltvalue",level:3},{value:".le(value)",id:"levalue",level:3},{value:".gt(value)",id:"gtvalue",level:3},{value:".ge(value)",id:"gevalue",level:3},{value:".beginsWith(value)",id:"beginswithvalue",level:3},{value:".between(value1, value2)",id:"betweenvalue1-value2",level:3},{value:"Query.sort(order)",id:"querysortorder",level:2},{value:"Query.limit(count)",id:"querylimitcount",level:2},{value:"Query.startAt(key)",id:"querystartatkey",level:2},{value:"Query.consistent()",id:"queryconsistent",level:2},{value:"Query.count()",id:"querycount",level:2},{value:"Query.attributes(attributes)",id:"queryattributesattributes",level:2},{value:"Query.run(options?)",id:"queryrunoptions",level:2},{value:"Description",id:"description",level:3},{value:"Arguments",id:"arguments",level:3},{value:"Examples",id:"examples",level:3}],m={toc:d};function y(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"query"},"Query"),(0,r.kt)("p",null,"Dynamode provides the ability to query your items. Query class allows you to retrieve multiple items that have the same partition key but different sort keys."),(0,r.kt)("p",null,"Query class acts as a build to construct your query with appropriate filters, to run it use ",(0,r.kt)("a",{parentName:"p",href:"/docs/guide/query#queryrunoptions"},(0,r.kt)("inlineCode",{parentName:"a"},"Query.run(options?)"))," method."),(0,r.kt)("h2",{id:"condition"},"Condition"),(0,r.kt)("p",null,"Query is a child of ",(0,r.kt)("a",{parentName:"p",href:"/docs/guide/condition"},"Condition")," class, meaning that all methods listed on ",(0,r.kt)("a",{parentName:"p",href:"/docs/guide/condition"},"Condition")," page are also available in Query class. As example you can use ",(0,r.kt)("inlineCode",{parentName:"p"},"Query.attribute(key)")," method to filter out retrieved items."),(0,r.kt)("h2",{id:"new-queryentity-or-entitymanagerquery"},"new Query(Entity) or EntityManager.query()"),(0,r.kt)("p",null,"Every query has to be initialized with ",(0,r.kt)("a",{parentName:"p",href:"/docs/guide/managers/entityManager"},"Entity")," to infer its underlying properties. You can achieve this in two ways:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"// Below definitions are equivalent\nnew Query(AllPossibleProperties);\nAllPossiblePropertiesManager.query();\n")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/guide/entity/modeling#all-possible-properties"},"AllPossibleProperties")," is an example class that extends ",(0,r.kt)("a",{parentName:"p",href:"/docs/guide/managers/entityManager"},"Entity"),"."),(0,r.kt)("h2",{id:"querypartitionkeykey"},"Query.partitionKey(key)"),(0,r.kt)("p",null,"This method prepares a partition key conditional expression. The ",(0,r.kt)("inlineCode",{parentName:"p"},"key")," parameter is a string, narrowed down to entity partition keys."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"These properties are allowed for the ",(0,r.kt)("inlineCode",{parentName:"p"},"AllPossibleProperties")," model"),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"AllPossiblePropertiesManager.query().partitionKey('partitionKey');\nAllPossiblePropertiesManager.query().partitionKey('GSI_1_PK');\n"))),(0,r.kt)("admonition",{type:"caution"},(0,r.kt)("p",{parentName:"admonition"},"Typescript error: Argument of type '\"unknownProperty\"' is not assignable to parameter of type: ",(0,r.kt)("inlineCode",{parentName:"p"},'"partitionKey" | "GSI_1_PK"')),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"AllPossiblePropertiesManager.query().partitionKey('unknownProperty');\n"))),(0,r.kt)("p",null,"To complete partition key conditional you need to use ",(0,r.kt)("inlineCode",{parentName:"p"},".eq(value)")," function."),(0,r.kt)("h3",{id:"eqvalue"},".eq(value)"),(0,r.kt)("p",null,"This comparison function will check if the given key is equal to the value that is passed in as a parameter."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().partitionKey('partitionKey').eq('1'); // Resulting in: `partitionKey = 1`\n")),(0,r.kt)("h2",{id:"querysortkeykey"},"Query.sortKey(key)"),(0,r.kt)("p",null,"This method prepares a sort key conditional expression. The ",(0,r.kt)("inlineCode",{parentName:"p"},"key")," parameter is a string, narrowed down to entity sort keys."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"These properties are allowed for the ",(0,r.kt)("inlineCode",{parentName:"p"},"AllPossibleProperties")," model")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"AllPossiblePropertiesManager.query().sortKey('sortKey');\nAllPossiblePropertiesManager.query().sortKey('GSI_1_SK');\nAllPossiblePropertiesManager.query().sortKey('LSI_1_SK');\n")),(0,r.kt)("admonition",{type:"caution"},(0,r.kt)("p",{parentName:"admonition"},"Typescript error: Argument of type '\"unknownProperty\"' is not assignable to parameter of type: ",(0,r.kt)("inlineCode",{parentName:"p"},'"sortKey" | "GSI_1_SK" | "LSI_1_SK"')),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"AllPossiblePropertiesManager.query().sortKey('unknownProperty');\n"))),(0,r.kt)("p",null,"To complete sort key conditional you need to use one of undermentioned functions."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey'); // This condition has no impact on the final conditional\nUserManager.query().sortKey('sortKey').eq('blazej'); // Adding comparison function (eq) after `sortKey(key)` method will complete the conditional. Resulting in: `sortKey = blazej`\n")),(0,r.kt)("h3",{id:"eqvalue-1"},".eq(value)"),(0,r.kt)("p",null,"This comparison function will check if the given key is equal to the value that is passed in as a parameter."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey').eq('blazej'); // Resulting in: `sortKey = blazej`\n")),(0,r.kt)("h3",{id:"nevalue"},".ne(value)"),(0,r.kt)("p",null,"This comparison function will check if the given key is not equal to the value that is passed in as a parameter."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey').ne('blazej'); // Resulting in: `sortKey <> blazej`\n")),(0,r.kt)("h3",{id:"ltvalue"},".lt(value)"),(0,r.kt)("p",null,"This comparison function will check if the given key is less than the value that is passed in as a parameter."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey').lt('blazej'); // Resulting in: `sortKey < blazej`\n")),(0,r.kt)("h3",{id:"levalue"},".le(value)"),(0,r.kt)("p",null,"This comparison function will check if the given key is less than or equal to the value that is passed in as a parameter."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey').le('blazej'); // Resulting in: `sortKey <= blazej`\n")),(0,r.kt)("h3",{id:"gtvalue"},".gt(value)"),(0,r.kt)("p",null,"This comparison function will check if the given key is greater than the value that is passed in as a parameter."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey').gt('blazej'); // Resulting in: `sortKey > blazej`\n")),(0,r.kt)("h3",{id:"gevalue"},".ge(value)"),(0,r.kt)("p",null,"This comparison function will check if the given key is greater than or equal to the value that is passed in as a parameter."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey').ge('blazej'); // Resulting in: `sortKey >= blazej`\n")),(0,r.kt)("h3",{id:"beginswithvalue"},".beginsWith(value)"),(0,r.kt)("p",null,"This comparison function will check if the given key is begins with the value that is passed in as a parameter."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey').beginsWith('bla'); // Resulting in: `begins_with(sortKey, bla)`\n")),(0,r.kt)("h3",{id:"betweenvalue1-value2"},".between(value1, value2)"),(0,r.kt)("p",null,"This comparison function will check if the given key is between the values that were passed in as parameters."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().sortKey('sortKey').between('bla', 'cla'); // Resulting in: `sortKey BETWEEN 'bla' AND 'cla'`\n")),(0,r.kt)("h2",{id:"querysortorder"},"Query.sort(order)"),(0,r.kt)("p",null,"This method sorts the items you receive by using sort key. It uses DynamoDB's ",(0,r.kt)("inlineCode",{parentName:"p"},"ScanIndexForward"),"."),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"order")," parameter must be a string, either ",(0,r.kt)("inlineCode",{parentName:"p"},"'ascending'")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"'descending'"),". Query will return items in ascending order by default."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().partitionKey('partitionKey').eq('1').sort('descending'); // Resulting in: `ScanIndexForward: false`\n")),(0,r.kt)("h2",{id:"querylimitcount"},"Query.limit(count)"),(0,r.kt)("p",null,"This method will limit the number of items that DynamoDB query in one request. It uses DynamoDB's ",(0,r.kt)("inlineCode",{parentName:"p"},"Limit"),"."),(0,r.kt)("admonition",{type:"caution"},(0,r.kt)("p",{parentName:"admonition"},"Unlike most SQL databases ",(0,r.kt)("strong",{parentName:"p"},"this does not guarantee the response will contain 5 items"),". DynamoDB will only query a maximum of 5 items and check if they match and should be returned.")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"count")," argument should be a ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," representing how many items you wish DynamoDB to query."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().partitionKey('partitionKey').eq('1').limit(10); // Resulting in: `Limit: 10`\n")),(0,r.kt)("h2",{id:"querystartatkey"},"Query.startAt(key)"),(0,r.kt)("p",null,"In case there are more items to retrieve in a previous query response, Dynamode will return ",(0,r.kt)("inlineCode",{parentName:"p"},"lastKey")," property with primary key of last evaluated item. You can pass this property to further query your items. It uses DynamoDB's ",(0,r.kt)("inlineCode",{parentName:"p"},"LastEvaluatedKey"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const response1 = await UserManager.query().partitionKey('partitionKey').eq('1').run(); \nconst response2 = await UserManager.query().partitionKey('partitionKey').eq('1').startAt(response1.lastKey).run(); // Resulting in: `LastEvaluatedKey: response1.lastKey`\n")),(0,r.kt)("h2",{id:"queryconsistent"},"Query.consistent()"),(0,r.kt)("p",null,"This will cause the query to run a consistent read. By default read is eventually consistent. It uses DynamoDB's ",(0,r.kt)("inlineCode",{parentName:"p"},"ConsistentRead"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().partitionKey('partitionKey').eq('1').consistent(); // Resulting in: `ConsistentRead: true`\n")),(0,r.kt)("h2",{id:"querycount"},"Query.count()"),(0,r.kt)("p",null,"Instead of returning an array of items, this method will make the query operation to return an object with count information. This option saves bandwidth by using DynamoDB's ",(0,r.kt)("inlineCode",{parentName:"p"},"Select"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().partitionKey('partitionKey').eq('1').count(); // Resulting in: `Select: 'COUNT'`\n")),(0,r.kt)("h2",{id:"queryattributesattributes"},"Query.attributes(attributes)"),(0,r.kt)("p",null,"This method is used to tag what item attributes should be retrieved and returned. This uses DynamoDB's ",(0,r.kt)("inlineCode",{parentName:"p"},"ProjectionExpression"),". "),(0,r.kt)("p",null,"If this value is ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined"),", then all attributes will be returned. ",(0,r.kt)("inlineCode",{parentName:"p"},"attributes")," argument should be an array of strings representing the property names to return."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"UserManager.query().partitionKey('partitionKey').eq('1').attributes(['username', 'age']); // Resulting in: `ProjectionExpression: 'username, age'`\n")),(0,r.kt)("h2",{id:"queryrunoptions"},"Query.run(options?)"),(0,r.kt)("h3",{id:"description"},"Description"),(0,r.kt)("p",null,"This method is used to execute constructed query and retrieve multiple items from DynamoDB. It uses the ",(0,r.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html"},"Query DynamoDB operation"),"."),(0,r.kt)("p",null,"By default it makes one DynamoDB API call, but you can change it by passing ",(0,r.kt)("inlineCode",{parentName:"p"},"all")," option described below. With ",(0,r.kt)("inlineCode",{parentName:"p"},"all")," set to ",(0,r.kt)("inlineCode",{parentName:"p"},"true")," this function will send continuous query requests until all items are retrieved. "),(0,r.kt)("h3",{id:"arguments"},"Arguments"),(0,r.kt)("p",null,"You can add optional ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"options"))," parameter that is an object. The table below represents options that you can pass in:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"return")),(0,r.kt)("td",{parentName:"tr",align:null},"What the method should return. For ",(0,r.kt)("inlineCode",{parentName:"td"},"'default'")," method returns initialized classes with retrieved data. For ",(0,r.kt)("inlineCode",{parentName:"td"},"'input'")," method returns prepared DynamoDB input command and no request is made to DynamoDB (method no longer returns a promise). For ",(0,r.kt)("inlineCode",{parentName:"td"},"'output'")," method returns the bare output from DynamoDB operation."),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"'default'")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"'input'")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"'output'")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"'default'"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"all")),(0,r.kt)("td",{parentName:"tr",align:null},"In case it is set to ",(0,r.kt)("inlineCode",{parentName:"td"},"true")," this method will send continuous query requests until all items are retrieved (it checks ",(0,r.kt)("inlineCode",{parentName:"td"},"lastKey")," property from previous responses). This can be useful for getting all items autonomously in case you don't want to check ",(0,r.kt)("inlineCode",{parentName:"td"},"lastKey")," property manually and send multiple requests yourself."),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"false"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"max")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("strong",{parentName:"td"},"Use only if ",(0,r.kt)("inlineCode",{parentName:"strong"},"all")," option is set to ",(0,r.kt)("inlineCode",{parentName:"strong"},"true")),". The maximum number of items that should be retrieved, regardless if the ",(0,r.kt)("inlineCode",{parentName:"td"},"lastKey")," property still exists in the response. As default an unlimited number of items will be retrieved to the point that ",(0,r.kt)("inlineCode",{parentName:"td"},"lastKey")," property no longer exists."),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"Infinity"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"delay")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("strong",{parentName:"td"},"Use only if ",(0,r.kt)("inlineCode",{parentName:"strong"},"all")," option is set to ",(0,r.kt)("inlineCode",{parentName:"strong"},"true")),". Number of milliseconds to delay between receiving a response to the next query request."),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"number")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"0"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"extraInput")),(0,r.kt)("td",{parentName:"tr",align:null},"Extra input that is passed to QueryInput DynamoDB operation. Use it only in case that you know what are you are doing as it may override other properties passed to DynamoDB operation."),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("a",{parentName:"td",href:"https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/queryinput.html"},(0,r.kt)("inlineCode",{parentName:"a"},"QueryInput"))),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("p",null,"If ",(0,r.kt)("inlineCode",{parentName:"p"},"all")," option is set to ",(0,r.kt)("inlineCode",{parentName:"p"},"true")," all of the requests will be merged into a single array. ",(0,r.kt)("inlineCode",{parentName:"p"},"count")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"scannedCount")," properties will be summed in the response. If you pass ",(0,r.kt)("inlineCode",{parentName:"p"},"max")," option and there is still a ",(0,r.kt)("inlineCode",{parentName:"p"},"lastKey")," in the response it will be returned to you."),(0,r.kt)("h3",{id:"examples"},"Examples"),(0,r.kt)(i.Z,{mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"default",label:"return: 'default'",default:!0,mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const result = await UserManager.query()\n  .partitionKey('partitionKey').eq('1')\n  .sortKey('sortKey').beginsWith('bla')\n  .limit(1).sort('descending')\n  .run();\n// OR\nconst result = await UserManager.query()\n  .partitionKey('partitionKey').eq('1')\n  .sortKey('sortKey').beginsWith('bla')\n  .limit(1).sort('descending')\n  .run({ return: 'default' });\n")),(0,r.kt)("p",null,"Output:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"{\n  items: [\n    User {\n      dynamodeEntity: 'User',\n      partitionKey: '1',\n      sortKey: 'blazej3',\n      username: 'blazej',\n      email: 'blazej@gmail.com',\n      age: 18,\n      friends: [Array],\n      config: [Object]\n    }\n  ],\n  count: 1,\n  scannedCount: 1,\n  lastKey: { partitionKey: '1', sortKey: 'blazej3' }\n}\n"))),(0,r.kt)(l.Z,{value:"input",label:"return: 'input'",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const input = UserManager.query()\n  .partitionKey('partitionKey').eq('1')\n  .sortKey('sortKey').beginsWith('bla')\n  .limit(1).sort('descending')\n  .run({ return: 'input' });\n")),(0,r.kt)("p",null,"Output:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"{\n  TableName: 'users',\n  Limit: 1,\n  ScanIndexForward: false,\n  KeyConditionExpression: 'partitionKey = :partitionKey AND begins_with(sortKey, :sortKey)',\n  FilterExpression: undefined,\n  ExpressionAttributeNames: undefined,\n  ExpressionAttributeValues: { ':partitionKey': { S: '1' }, ':sortKey': { S: 'bla' } }\n}\n"))),(0,r.kt)(l.Z,{value:"output",label:"return: 'output'",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const output = await UserManager.query()\n  .partitionKey('partitionKey').eq('1')\n  .sortKey('sortKey').beginsWith('bla')\n  .limit(1).sort('descending')\n  .run({ return: 'output' });\n")),(0,r.kt)("p",null,"Output:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"{\n  '$metadata': {\n    ...\n  },\n  ConsumedCapacity: undefined,\n  Count: 1,\n  Items: [\n    {\n      dynamodeEntity: [Object],\n      sortKey: [Object],\n      partitionKey: [Object],\n      config: [Object],\n      email: [Object],\n      age: [Object],\n      friends: [Object],\n      username: [Object]\n    }\n  ],\n  LastEvaluatedKey: { partitionKey: { S: '1' }, sortKey: { S: 'blazej3' } },\n  ScannedCount: 1\n}\n")))))}y.isMDXComponent=!0}}]);