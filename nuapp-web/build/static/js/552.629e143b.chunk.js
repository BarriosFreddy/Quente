"use strict";(self.webpackChunk_coreui_coreui_free_react_admin_template=self.webpackChunk_coreui_coreui_free_react_admin_template||[]).push([[552],{75806:function(n,e,t){t.r(e),t.d(e,{default:function(){return E}});var r=t(72791),a=(0,r.lazy)((function(){return Promise.all([t.e(879),t.e(901)]).then(t.bind(t,79901))})),o=(0,r.lazy)((function(){return Promise.all([t.e(325),t.e(716),t.e(982)]).then(t.bind(t,51982))})),i=(0,r.lazy)((function(){return t.e(296).then(t.bind(t,30296))})),s=(0,r.lazy)((function(){return Promise.all([t.e(325),t.e(270)]).then(t.bind(t,40601))})),c=(0,r.lazy)((function(){return t.e(468).then(t.bind(t,68468))})),u=[{path:"/",exact:!0,name:"Home"},{path:"/dashboard",name:"Dashboard",element:a},{path:"/billing",name:"Facturaci\xf3n",element:o},{path:"/billings",name:"Historial de facturas",element:i},{path:"/items",name:"Items",element:s},{path:"/listings",name:"Listings",element:(0,r.lazy)((function(){return t.e(873).then(t.bind(t,29873))}))},{path:"/data-loader",name:"Cargador de datos",element:(0,r.lazy)((function(){return t.e(930).then(t.bind(t,61930))}))},{path:"/item-categories",name:"Categorias de items",element:c},{path:"/synchronizer",name:"Sinchronizer",element:(0,r.lazy)((function(){return Promise.all([t.e(716),t.e(775)]).then(t.bind(t,74775))}))}],l=t(78983),m=t(80184),d=t(57689),f=t(59434),p=function(n){var e=n.children,t=n.isLoggedIn,r=n.redirectTo,a=void 0===r?"/login":r;return t?e:(0,m.jsx)(d.Fg,{to:a,replace:!0})},h=function(){var n=(0,f.v9)((function(n){return n.app.isLoggedIn}));return(0,m.jsx)(r.Suspense,{fallback:(0,m.jsx)(l.LQ,{color:"primary"}),children:(0,m.jsxs)(d.Z5,{children:[u.map((function(e,t){return e.element&&(0,m.jsx)(d.AW,{path:e.path,exact:e.exact,name:e.name,element:(0,m.jsx)(p,{isLoggedIn:n,children:(0,m.jsx)(e.element,{})})},t)})),(0,m.jsx)(d.AW,{render:!0,path:"/",element:(0,m.jsx)(d.Fg,{to:"dashboard",replace:!0})})]})})},x=r.memo(h),v=t(24846),g=t(90406),j=t(43744),b=t(1413),Z=t(44925),N=t(11087),C=["component","name","badge","icon"],k=["component","name","icon","to"],y=function(n){var e,t=n.items,a=(0,d.TH)(),o=(null!==(e=(0,f.v9)((function(n){return n.app.infoUser})))&&void 0!==e?e:{}).roles,i=void 0===o?[]:o,s=function(n,e,t){return(0,m.jsxs)(m.Fragment,{children:[e&&e,n&&n,t&&(0,m.jsx)(l.C_,{color:t.color,className:"ms-auto",children:t.text})]})},c=function(n,e){var t=n.component,a=n.name,o=n.badge,i=n.icon,c=(0,Z.Z)(n,C),u=t;return(0,r.createElement)(u,(0,b.Z)((0,b.Z)({},c.to&&!c.items&&{component:N.OL}),{},{key:e},c),s(a,i,o))},u=function n(e,t){var r,o=e.component,u=e.name,l=e.icon,d=e.to,f=(0,Z.Z)(e,k),p=o;return(0,m.jsx)(p,(0,b.Z)((0,b.Z)({idx:String(t),toggler:s(u,l),visible:a.pathname.startsWith(d)},f),{},{children:null===(r=e.items)||void 0===r?void 0:r.filter((function(n){var e=n.roles;return(void 0===e?[]:e).some((function(n){return i.includes(n)}))})).map((function(e,t){return e.items?n(e,t):c(e,t)}))}),t)};return(0,m.jsx)(r.Fragment,{children:t&&t.filter((function(n){var e=n.roles;return(void 0===e?[]:e).some((function(n){return i.includes(n)}))})).map((function(n,e){return n.items?u(n,e):c(n,e)}))})},w=t(34358),U=(t(82454),t(34708)),_=t(35425),I=t(91250);var L=[{component:l.U6,name:"Dashboard",to:"/dashboard",icon:(0,m.jsx)(v.Z,{icon:U.h,customClassName:"nav-icon"}),roles:["ADMIN"]},{component:l.dw,name:"Punto de venta",to:"/billing",icon:(0,m.jsx)(v.Z,{icon:_.T,customClassName:"nav-icon"}),roles:["ADMIN","SELLER"],items:[{component:l.U6,name:"Facturaci\xf3n",to:"/billing",icon:(0,m.jsx)(v.Z,{icon:_.T,customClassName:"nav-icon"}),roles:["ADMIN","SELLER"]},{component:l.U6,name:"Historial de facturas",to:"/billings",icon:(0,m.jsx)(v.Z,{icon:_.T,customClassName:"nav-icon"}),roles:["ADMIN","SELLER"]},{component:l.U6,name:"Items",to:"/items",icon:(0,m.jsx)(v.Z,{icon:_.T,customClassName:"nav-icon"}),roles:["ADMIN"]},{component:l.U6,name:"Categorias de items",to:"/item-categories",icon:(0,m.jsx)(v.Z,{icon:_.T,customClassName:"nav-icon"}),roles:["ADMIN"]},{component:l.U6,name:"Cargador de datos",to:"/data-loader",icon:(0,m.jsx)(v.Z,{icon:I.Q,customClassName:"nav-icon"}),roles:["ADMIN"]},{component:l.U6,name:"Sincronizador",to:"/synchronizer",icon:(0,m.jsx)(v.Z,{icon:I.Q,customClassName:"nav-icon"}),roles:["ADMIN"]}]}],z=t(63232),S=function(){var n,e,t,r=(0,f.I0)(),a=(0,f.v9)((function(n){return n.app.sidebarUnfoldable})),o=(0,f.v9)((function(n){return n.app.showToast})),i=(0,f.v9)((function(n){return n.app.toastConfig}));return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsxs)(l.z3,{position:"fixed",unfoldable:!0,visible:!0,onVisibleChange:function(n){r((0,j.bu)(n))},children:[(0,m.jsx)(l.Dl,{className:"d-none d-md-flex",to:"/",children:!a&&(0,m.jsx)("h4",{children:"Droguer\xeda Francisca"})}),(0,m.jsx)(l.Xk,{children:(0,m.jsx)(w.Z,{children:(0,m.jsx)(y,{items:L})})}),(0,m.jsxs)(l.oh,{onClick:function(){return r((0,g.kS)())},children:[(0,m.jsx)(v.Z,{icon:z.U,className:"me-2"}),"Logout"]}),(0,m.jsx)(l.iv,{className:"d-none d-lg-flex",onClick:function(){return r((0,j.r2)(!a))}})]}),(0,m.jsx)(l.KF,{placement:"top-end",children:(0,m.jsx)(l.oo,{visible:o,color:null!==(n=i.color)&&void 0!==n?n:"info",onClose:function(){r((0,j.W3)(!1))},delay:null!==(e=i.delay)&&void 0!==e?e:5e3,children:(0,m.jsxs)("div",{className:"d-flex",children:[(0,m.jsx)(l.S3,{className:"fs-6",children:null!==(t=i.message)&&void 0!==t?t:""}),(0,m.jsx)(l.Pv,{className:"me-2 m-auto"})]})})})]})},D=r.memo(S),A=t(47149),F=t(46470),E=function(n){var e=(0,f.I0)();return(0,r.useEffect)((function(){e((0,A.Nx)())}),[e]),(0,m.jsx)("div",{children:(0,m.jsxs)(F.SV,{fallback:(0,m.jsx)("h1",{children:"Algo sali\xf3 mal!"}),children:[(0,m.jsx)(D,{}),(0,m.jsx)("div",{className:"wrapper d-flex flex-column min-vh-100 bg-light",children:(0,m.jsx)("div",{className:"body flex-grow-1",children:(0,m.jsx)(x,{})})})]})})}},47149:function(n,e,t){t.d(e,{$G:function(){return u},Nx:function(){return f},OK:function(){return c},c:function(){return l},kk:function(){return d},lC:function(){return m}});var r=t(1413),a=t(74165),o=t(15861),i=t(72698),s=t(50500),c=function(n){return function(){var e=(0,o.Z)((0,a.Z)().mark((function e(t,r,o){var s,c;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,o.post("/items",n);case 2:s=e.sent,c=s.status,t(201===c?(0,i.gc)(!0):(0,i.gc)(!1));case 5:case"end":return e.stop()}}),e)})));return function(n,t,r){return e.apply(this,arguments)}}()},u=function(n){return function(){var e=(0,o.Z)((0,a.Z)().mark((function e(t,o,s){var c,u,l,m;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return c=(0,r.Z)({},n),u=c._id,delete c._id,e.next=5,s.put("/items/".concat(u),c);case 5:l=e.sent,m=l.status,t(201===m?(0,i.gc)(!0):(0,i.gc)(!1));case 8:case"end":return e.stop()}}),e)})));return function(n,t,r){return e.apply(this,arguments)}}()},l=function(n){return function(){var e=(0,o.Z)((0,a.Z)().mark((function e(t,r,o){var s,c;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,o.post("/items/bulk",n);case 2:s=e.sent,c=s.status,t(201===c?(0,i.gc)(!0):(0,i.gc)(!1));case 5:case"end":return e.stop()}}),e)})));return function(n,t,r){return e.apply(this,arguments)}}()},m=function(n){return function(){var e=(0,o.Z)((0,a.Z)().mark((function e(t,r,o){var s,c;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n){e.next=2;break}return e.abrupt("return");case 2:return e.next=4,o.get("/items/code/".concat(n));case 4:s=e.sent,c=s.data,200===s.status&&t((0,i.HZ)(c));case 8:case"end":return e.stop()}}),e)})));return function(n,t,r){return e.apply(this,arguments)}}()},d=function(n){return function(){var e=(0,o.Z)((0,a.Z)().mark((function e(t,r,o){var c,u,l;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return c=new URLSearchParams(n).toString(),e.next=3,(0,s.Z)();case 3:if(!e.sent){e.next=10;break}return e.next=7,o.get("/items".concat(c.length>0?"?"+c.toString():""));case 7:e.t0=e.sent,e.next=11;break;case 10:e.t0=p(r(),n);case 11:u=e.t0,l=u.data,200===u.status&&t((0,i.U7)(l));case 15:case"end":return e.stop()}}),e)})));return function(n,t,r){return e.apply(this,arguments)}}()},f=function(){return function(){var n=(0,o.Z)((0,a.Z)().mark((function n(e,t,r){var o,s;return(0,a.Z)().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,r.get("/items");case 2:o=n.sent,s=o.data,200===o.status&&e((0,i.P_)(s));case 6:case"end":return n.stop()}}),n)})));return function(e,t,r){return n.apply(this,arguments)}}()};function p(n,e){var t=n.items.offline.items.filter((function(n){var t=n.code,r=n.name;return t.toUpperCase().includes(e.code.toUpperCase())||r.toUpperCase().includes(e.name.toUpperCase())}));return t.length>10&&(t.length=10),{data:t,status:200}}}}]);
//# sourceMappingURL=552.629e143b.chunk.js.map