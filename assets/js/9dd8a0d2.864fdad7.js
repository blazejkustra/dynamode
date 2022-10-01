/*! For license information please see 9dd8a0d2.864fdad7.js.LICENSE.txt */
(self.webpackChunkdynamode_docs=self.webpackChunkdynamode_docs||[]).push([[54],{6157:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>w});var a=n(7462),o=n(7294),r=n(4184),l=n.n(r),c=n(9030),s=n(814),i=n(9960),m=n(2263),u=n(4996);const d={heroBanner:"heroBanner_UJJx",buttons:"buttons_pzbO",features:"features_keug",row:"row_BFIh",codeBlock:"codeBlock_VLQY"},g=[{title:o.createElement(o.Fragment,null,"Use DynamoDB with more ease than ever before"),description:o.createElement(o.Fragment,null,"Complexity reduced from tens to just a few classes and methods. Try it out today: Check out our"," ",o.createElement("a",{href:"docs/getting_started/introduction"},"Documentation"),".")},{title:o.createElement(o.Fragment,null,"Lorem ipsum dolor sit amet consectetur, adipisicing elit. "),description:o.createElement(o.Fragment,null,"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea nostrum inventore nihil expedita fugiat dignissimos itaque nobis, officiis aliquid ex provident deserunt laborum quos.")}];function h(e){let{title:t,description:n}=e;return o.createElement("div",{className:"col col--6 info-box"},o.createElement("h3",null,t),o.createElement("p",null,n))}function p(){const e=(0,m.Z)(),{siteConfig:t={}}=e;return o.createElement("header",{className:l()("hero hero--secondary",d.heroBanner)},o.createElement("div",{className:"container"},o.createElement("div",{className:"row row-hero "+l()("row",d.row)},o.createElement("div",{className:"col col--8 hero-content"},o.createElement("h1",{className:"hero__title"},t.title),o.createElement("p",{className:"hero__p"},t.tagline),o.createElement("div",{className:l()("hero-buttons",d.buttons)},o.createElement(i.Z,{className:l()("button button--primary button--lg",d.getStarted),to:(0,u.Z)("docs/getting_started/introduction")},"View Docs"))),o.createElement("div",{className:"col col--4 hero-image",style:{backgroundImage:"url(img/dynamodb-logo.svg)"}}))))}function E(){return o.createElement(o.Fragment,null,o.createElement("div",{className:"col col--8 section-boxes"},g&&g.length>0&&o.createElement("div",{className:"row box-container "+l()("row",d.row)},g.map(((e,t)=>o.createElement(h,(0,a.Z)({key:t},e)))))),o.createElement("div",{className:"col col--4 section-image",style:{backgroundImage:"url(img/engine_frame.svg)",backgroundSize:"contain",backgroundPosition:"center center",backgroundRepeat:"no-repeat"}}))}const w=function(){const e=(0,m.Z)(),{siteConfig:t={}}=e;return o.createElement(c.Z,{title:"Hello from "+t.title,description:"Description will go into a meta tag in <head />"},o.createElement(p,null),o.createElement("main",null,o.createElement("section",null,o.createElement("div",{className:"container"},o.createElement("div",{className:"row row--box-section "+l()("row",d.row)},o.createElement(E,null)))),o.createElement("section",null,o.createElement("div",{className:"container container--center"},o.createElement("div",{className:"row row--center "+l()("row",d.row)},o.createElement("div",{className:"col col--7 text--center col--bottom-section"},o.createElement("h2",null,"Easier. Better. Faster."),o.createElement("p",null,"Check out the documentation and learn how to quickly get up and running with Dynamode. Go to"," ",o.createElement("a",{href:"docs/getting_started/introduction"},"Getting started page")," to see how you can run it locally along with local DynamoDB instance."),o.createElement("h3",null,"Bare DynamoDB"),o.createElement(s.Z,{className:"language-ts "+l()("codeBlock",d.codeBlock)},"DynamoDB.getItem({\n  TableName: 'users',\n  Key: {\n    PK: { S: 'blazejkustra' },\n    SK: { S: 'nwj\u0142a7pa31e2' }\n  },\n});"),o.createElement("h3",null,"with Dynamode"),o.createElement(s.Z,{className:"language-ts "+l()("codeBlock",d.codeBlock)},"const user = await User.get({ pk: 'blazejkustra', sk: 'nwj\u0142a7pa31e2' });"))))),o.createElement("section",null,o.createElement("div",{className:"container"},o.createElement("div",{className:"row row--center "+l()("row",d.row)},o.createElement("div",{className:"col col--7 text--center col--bottom-section"},o.createElement("h2",null,"Sponsors"),o.createElement("p",null,"We really appreciate our sponsors! Thanks to them we can develop our library and make the working with DynamoDB much easier. Special thanks for:"),o.createElement("div",{className:"row row--center "+l()("row",d.row)},o.createElement("a",{href:"https://www.swmansion.com"},o.createElement("img",{className:"imageHolder-sponsor",src:"img/swm-logo-small.svg"}),o.createElement("h5",null,"Software Mansion")))))))))}},4184:(e,t)=>{var n;!function(){"use strict";var a={}.hasOwnProperty;function o(){for(var e=[],t=0;t<arguments.length;t++){var n=arguments[t];if(n){var r=typeof n;if("string"===r||"number"===r)e.push(n);else if(Array.isArray(n)){if(n.length){var l=o.apply(null,n);l&&e.push(l)}}else if("object"===r)if(n.toString===Object.prototype.toString)for(var c in n)a.call(n,c)&&n[c]&&e.push(c);else e.push(n.toString())}}return e.join(" ")}e.exports?(o.default=o,e.exports=o):void 0===(n=function(){return o}.apply(t,[]))||(e.exports=n)}()}}]);