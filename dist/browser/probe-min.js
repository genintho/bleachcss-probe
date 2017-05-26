!function(e){function t(){this.options={key:null,url:"https://www.bleachcss.com/api/v1/probes/",chunkSize:250,debug:!1,throttle:200},this._cssFilesURLs=[],this._allSelectors={},this._unseenSelectors={},this._buffer=[],this._timeMainLoopCall=0,this._timeBufferFlushCall=0,this._DOMObserver=null}t.prototype.start=function(e){for(var t in e)this.options[t]=e[t];if(!this.options.key)throw Error("BleachCSS require an API key");this.resume()},t.prototype.stop=function(){this._DOMObserver&&(this._DOMObserver.disconnect(),this._DOMObserver=null)},t.prototype.resume=function(){var e=this;e._DOMObserver||(e._DOMObserver=new MutationObserver(function(t){e._log("Mutation",t),e._mainLoop()}),e._DOMObserver.observe(document,{subtree:!0,childList:!0}),e._mainLoop())},t.prototype._log=function(){this.options.debug&&console.log.apply(console,arguments)},t.prototype._mainLoop=function(){var e=this,t=(new Date).getTime();if(!(t-this._timeMainLoopCall<this.options.throttle)){this._timeMainLoopCall=t,this._syncSelectors();for(var s in e._allSelectors)e._allSelectors[s].checked=!1;this._checkSelectorsByChunk(Object.keys(this._unseenSelectors),function(){var t=(new Date).getTime();t-e._timeBufferFlushCall>5e3&&(e._timeBufferFlushCall=t,e._sendBuffer())})}},t.prototype._syncSelectors=function(){var e=this,t=this._processStyleSheets();this._downloadCSSFiles(t,function(t,s){e._extractSelectors(t,s),e._mainLoop()})},t.prototype._processStyleSheets=function(){for(var e=document.styleSheets,t=[],s=0;s<e.length;s++){var n=e[s],o=n.href,r=n.cssRules;o&&"http"===o.substr(0,4)&&-1===this._cssFilesURLs.indexOf(o)&&(r?(this._cssFilesURLs.push(o),this._processCssRules(o,r)):t.push(o))}return t},t.prototype._processCssRules=function(e,t){for(var s=0;s<t.length;s++){var n=t[s].selectorText;n&&this._addSelector(e,n,!0)}},t.prototype._extractSelectors=function(e,t){if(void 0!==t){t=t.replace(new RegExp("(\\/\\*[\\s\\S]*?\\*\\/)","gi"),"");var s=new RegExp("((@(-.*?-)?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(t=t.replace(s,""),s=new RegExp("((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})","gi");;){var n=s.exec(t);if(null===n)break;var o="";o=void 0===n[2]?n[5].split("\r\n").join("\n").trim():n[2].split("\r\n").join("\n").trim(),o=o.replace(/\n+/,"\n"),-1!==o.indexOf("@media")?this._extractSelectors(e,n[3]+"\n}"):this._addSelector(e,o,!0)}}},t.prototype._addSelector=function(e,t,s){var n=this;t.split(",").forEach(function(t){var o=t.split(":"),r=t;if(-1===o[o.length-1].indexOf("-child")&&(r=o[0]),r=r.trim(),r.length){if("@font-face"===r)return;n._allSelectors[r]||(n._allSelectors[r]={files:[],seen:!1,exists:!1,checked:!1,fcn:n._findChecker(r),parent:n._findParentSelector(r)}),s&&(n._allSelectors[r].exists=!0,n._unseenSelectors[r]=!0),e&&-1===n._allSelectors[r].files.indexOf(e)&&n._allSelectors[r].files.push(e)}})},t.prototype._findParentSelector=function(e){var t=e.split(/\s|\+|~|>/);if(1===t.length)return null;var s=t.pop(),n=e.substr(0,e.length-s.length-1).trim();return-1!==["+","~",">"].indexOf(n.slice(-1))&&(n=n.slice(0,-1).trim()),this._addSelector(null,n,!1),n},t.prototype._checkSelectorsByChunk=function(e,t){for(var s=e.length,n=s>this.options.chunkSize?this.options.chunkSize:s,o=0;o<n;o++)this._selectorCheck(e.pop());if(0===e.length)return t();var r=this;setTimeout(function(){r._checkSelectorsByChunk(e,t)},0)},t.prototype._selectorCheck=function(e){var t=this.__selectorCheck(e);return this._allSelectors[e].checked=!0,t},t.prototype.__selectorCheck=function(e){var t=this._allSelectors[e];if(t.checked)return t.seen;if(t.seen)return!0;if(t.parent&&!this._selectorCheck(t.parent))return!1;try{if(t.fcn(e))return t.exists&&(delete this._unseenSelectors[e],this._buffer.push(e)),t.seen=!0,!0}catch(e){console.warn(e),console.warn("BleachCSS Probe encounter an error. Please file a bug https://github.com/genintho/bleachcss-probe/issues/new")}return!1},t.prototype._findChecker=function(e){return/^#[^\s]+$/.test(e)?this._fcnCheckByID:/^\.[^\s]+$/.test(e)?this._fcnCheckClass:this._fcnCheckFallback},t.prototype._fcnCheckByID=function(e){return!!document.getElementById(e.substr(1))},t.prototype._fcnCheckClass=function(e){return!!document.getElementsByClassName(e.substr(1)).length},t.prototype._fcnCheckFallback=function(e){return!!document.querySelector(e)},t.prototype._downloadCSSFiles=function(e,t){var s=this;e.forEach(function(e){if(s._log("try to load",e),-1!==s._cssFilesURLs.indexOf(e))return void s._log("Stylesheets",e," already downloaded");s._cssFilesURLs.push(e),s._log("do load",e);var n=new XMLHttpRequest;n.onreadystatechange=function(){4===n.readyState&&200===n.status&&t(e,n.responseText)};"data:text/css"!==e.substr(0,"data:text/css".length)&&(s._log("Download stylesheet at ",e),n.open("GET",e,!0),n.send(null))})},t.prototype._sendBuffer=function(){var e=this,t=[].concat(this._buffer);if(this._buffer=[],this._log("buffer",t.length,t),0!==t.length){var s={v:"0.1",k:this.options.key,f:{}};t.forEach(function(t){e._allSelectors[t].files.forEach(function(e){s.f[e]||(s.f[e]=[]),s.f[e].push(t)})});var n=new XMLHttpRequest;n.open("POST",e.options.url+"?t="+(new Date).getTime()),n.send(JSON.stringify(s))}},e.BleachCSS||(e.BleachCSS=new t)}(window);