!function(t){function e(){this.options={key:null,url:"https://www.bleachcss.com/api/v1/probes/",chunkSize:250,debug:!1,throttle:200},this.a=[],this.b={},this.c={},this.d=[],this.e=0,this.g=0,this.h=null}e.prototype.start=function(t){for(var e in t)this.options[e]=t[e];if(!this.options.key)throw Error("BleachCSS require an API key");this.resume()},e.prototype.stop=function(){this.h&&(this.h.disconnect(),this.h=null)},e.prototype.resume=function(){var t=this;t.h||(t.h=new MutationObserver(function(e){t.i("Mutation",e),t.j()}),t.h.observe(document,{subtree:!0,childList:!0}),t.j())},e.prototype.i=function(){this.options.debug&&console.log.apply(console,arguments)},e.prototype.j=function(){var t=this,e=(new Date).getTime();if(!(e-this.e<this.options.throttle)){this.e=e,this.l();for(var n in t.b)t.b[n].checked=!1;this.m(Object.keys(this.c),function(){var e=(new Date).getTime();e-t.g>5e3&&(t.g=e,t.n())})}},e.prototype.l=function(){var t=this,e=this.o();this.p(e,function(e,n){t.q(e,n),t.j()})},e.prototype.o=function(){for(var t=document.styleSheets,e=[],n=0;n<t.length;n++){var i=t[n],s=i.href,o=i.cssRules;s&&"http"===s.substr(0,4)&&-1===this.a.indexOf(s)&&(o?(this.a.push(s),this.r(s,o)):e.push(s))}return e},e.prototype.r=function(t,e){for(var n=0;n<e.length;n++){var i=e[n].selectorText;i&&this.s(t,i,!0)}},e.prototype.q=function(t,e){if(void 0!==e){e=e.replace(new RegExp("(\\/\\*[\\s\\S]*?\\*\\/)","gi"),"");var n=new RegExp("((@(-.*?-)?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(e=e.replace(n,""),n=new RegExp("((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})","gi");;){var i=n.exec(e);if(null===i)break;var s="";s=void 0===i[2]?i[5].split("\r\n").join("\n").trim():i[2].split("\r\n").join("\n").trim(),s=s.replace(/\n+/,"\n"),-1!==s.indexOf("@media")?this.q(t,i[3]+"\n}"):this.s(t,s,!0)}}},e.prototype.s=function(t,e,n){var i=this;e.split(",").forEach(function(e){var s=e.split(":"),o=e;if(-1===s[s.length-1].indexOf("-child")&&(o=s[0]),o=o.trim(),o.length){if("@font-face"===o)return;i.b[o]||(i.b[o]={files:[],seen:!1,exists:!1,checked:!1,fcn:i.t(o),parent:i.u(o)}),n&&(i.b[o].exists=!0,i.c[o]=!0),t&&-1===i.b[o].files.indexOf(t)&&i.b[o].files.push(t)}})},e.prototype.u=function(t){for(var e=t.length;e;e--)if(" "==t.charAt(e)){var n=t.substr(0,e).trim();return">"===n.slice(-1)&&(n=n.slice(0,-1).trim()),this.s(null,n,!1),n}return null},e.prototype.m=function(t,e){for(var n=t.length,i=n>this.options.chunkSize?this.options.chunkSize:n,s=0;s<i;s++)this.w(t.pop());if(0===t.length)return e();var o=this;setTimeout(function(){o.m(t,e)},0)},e.prototype.w=function(t){var e=this.x(t);return this.b[t].checked=!0,e},e.prototype.x=function(t){var e=this.b[t];return e.checked?e.seen:!!e.seen||!(e.parent&&!this.w(e.parent))&&(!!e.fcn(t)&&(e.exists&&(delete this.c[t],this.d.push(t)),e.seen=!0,!0))},e.prototype.t=function(t){return/^#[^\s]+$/.test(t)?this.y:/^\.[^\s]+$/.test(t)?this.z:this.A},e.prototype.y=function(t){return!!document.getElementById(t.substr(1))},e.prototype.z=function(t){return!!document.getElementsByClassName(t.substr(1)).length},e.prototype.A=function(t){return!!document.querySelector(t)},e.prototype.p=function(t,e){var n=this;t.forEach(function(t){if(n.i("try to load",t),-1!==n.a.indexOf(t))return void n.i("Stylesheets",t," already downloaded");n.a.push(t),n.i("do load",t);var i=new XMLHttpRequest;i.onreadystatechange=function(){4===i.readyState&&200===i.status&&e(t,i.responseText)};"data:text/css"!==t.substr(0,"data:text/css".length)&&(n.i("Download stylesheet at ",t),i.open("GET",t,!0),i.send(null))})},e.prototype.n=function(){var t=this,e=[].concat(this.d);if(this.d=[],this.i("buffer",e.length,e),0!==e.length){var n={v:"0.1",k:this.options.key,f:{}};e.forEach(function(e){t.b[e].files.forEach(function(t){n.f[t]||(n.f[t]=[]),n.f[t].push(e)})});var i=new XMLHttpRequest;i.open("POST",t.options.url+"?t="+(new Date).getTime()),i.send(JSON.stringify(n))}},t.BleachCSS||(t.BleachCSS=new e)}(window);