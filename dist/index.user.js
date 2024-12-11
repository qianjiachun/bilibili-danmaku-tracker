"use strict";
// ==UserScript==
// @name         Bilibili弹幕查询发送者
// @namespace    https://github.com/qianjiachun
// @version      2024.12.11.01
// @icon         https://static.hdslb.com/mobile/img/512.png
// @description  bilibili（b站/哔哩哔哩）根据弹幕查询发送者信息
// @author       小淳
// @match        *://www.bilibili.com/video/*
// @match        *://www.bilibili.com/festival/*
// @match        *://www.bilibili.com/bangumi/play/*
// @match        *://www.bilibili.com/cheese/play/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @require      https://lib.baomitu.com/protobufjs/6.11.2/protobuf.min.js
// @connect      bilibili.com
// @run-at       document-start
// @license      MIT
// ==/UserScript==
"use strict";unsafeWindow.requestHookList=[],unsafeWindow.requestHookCallback=function(e){if(e.responseURL.includes("/seg.so")){let n=new Uint8Array(e.response);protobuf.loadFromString("dm",protoStr).then(e=>{handleDanmakuList(e.lookupType("dm.dmList").decode(n).list)})}};var originalOpen=XMLHttpRequest.prototype.open,originalSend=XMLHttpRequest.prototype.send;function init(){init_Router()}function initStyles(){var e=document.createElement("style");e.appendChild(document.createTextNode(".senderinfo__wrap {    width: 280px;    min-height: 110px;    height: auto;    z-index: 1;    background-color: white;    border-radius: 8px;    box-shadow: 0 0 30px 2px rgb(0 0 0 / 10%);    position: absolute;    left: 50%;    top: 50%;    transform: translate(-50%, -50%);    max-height: 300px;    box-sizing: border-box;    padding: 5px;    overflow: auto;}.senderinfo__card {    margin-bottom: 5px;    margin-top: 5px;}.senderinfo__github {    width: 16px;    height: 16px;    position: absolute;}.senderinfo__close {    margin-right: 5px;    margin-top: 5px;    cursor: pointer;    position: absolute;    margin-left: 260px;    margin-top: 0px;}.senderinfo__avatar {    width: 100%;    height: 70px;    overflow: hidden;    text-align: center;}.senderinfo__img-loding {    width: 70px;    height: 70px;    border-radius: 50%;    background-color: rgb(225,232,238);    display: inline-block;}.senderinfo__avatar img {    width: 70px;    height: 70px;    border-radius: 50%;}.senderinfo__user {    text-align: center;    margin-top: 10px;}.senderinfo__name {    font-size: 16px;    font-weight: bold;    color: black;}.senderinfo__name-loading {    width: 100px;    height: 16px;    background-color: rgb(225,232,238);    display: inline-block;}.senderinfo__level {    line-height: 17px;    margin-left: 5px;    position: absolute;    color: #99a2aa;}.senderinfo__sign {    color: #99a2aa;    word-break: break-all;    word-wrap: break-word;    margin-top: 10px;    text-align: center;    line-height: 12px;}.senderinfo__sign-loading {    width: 150px;    height: 16px;    background-color: rgb(225,232,238);    display: inline-block;}.senderinfo__wrap::-webkit-scrollbar {    width: 4px;    }.senderinfo__wrap::-webkit-scrollbar-thumb {    border-radius: 10px;    box-shadow: inset 0 0 5px rgba(0,0,0,0.2);    background: rgba(0,0,0,0.2);}.senderinfo__wrap::-webkit-scrollbar-track {    box-shadow: inset 0 0 5px rgba(0,0,0,0.2);    border-radius: 0;    background: rgba(0,0,0,0.1);}")),document.head.appendChild(e)}XMLHttpRequest.prototype.open=function(){this._url=arguments[1],originalOpen.apply(this,arguments)},XMLHttpRequest.prototype.send=function(){var e=this;this.addEventListener("load",function(){4===e.readyState&&200===e.status&&(unsafeWindow.requestHookList.push(e),unsafeWindow.requestHookCallback(e))}),originalSend.apply(this,arguments)};let allDanmaku={};const DOM_MENU_MAIN=".player-auxiliary-context-menu-container",DOM_MENU_BANGUMI=".bpx-player-contextmenu.bpx-player-active",DOM_MENU_CHEESE=".bpx-player-contextmenu.bpx-player-active";function formatSeconds(e){var e=parseInt(e/1e3),n=0,e=(60<e&&(n=parseInt(e/60),e=parseInt(e%60)),""+(parseInt(e)<10?"0"+parseInt(e):parseInt(e)));return(parseInt(n)<10?"0"+parseInt(n):parseInt(n))+":"+e}function toSecond(e){var n=e.split(":");let t="";var i;let a="";return 3==n.length?(i=e.split(":")[0],t=e.split(":")[1],a=e.split(":")[2],Number(3600*i)+Number(60*t)+Number(a)):2==n.length?(t=e.split(":")[0],a=e.split(":")[1],Number(60*t)+Number(a)):1==n.length?(a=e.split(":")[0],Number(a)):void 0}function getStrMiddle(e,n,t){e=e.match(new RegExp(n+"(.*?)"+t));return!!e&&e[1]}let protoStr=`
syntax = "proto3";

package dm;

message dmList{
    repeated dmItem list=1;
}
message dmItem{
    int64 id = 1;
    int32 progress = 2;
    int32 mode = 3;
    int32 fontsize = 4;
    uint32 color = 5;
    string midHash = 6;
    string content = 7;
    int64 ctime = 8;
    int32 weight = 9;
    string action = 10;
    int32 pool = 11;
    string idStr = 12;
}`,videoCid="";function initPkg_CollectAllDanmaku(){initPkg_CollectAllDanmaku_Dom(),initPkg_CollectAllDanmaku_Func()}function initPkg_CollectAllDanmaku_Dom(){}function initPkg_CollectAllDanmaku_Func(){collectAllDanmaku(1)}function collectAllDanmaku(t){30<t||fetch(`https://api.bilibili.com/x/v2/dm/web/seg.so?type=1&oid=${videoCid}&segment_index=`+t).then(e=>e.arrayBuffer()).then(e=>{let n=new Uint8Array(e);protobuf.loadFromString("dm",protoStr).then(e=>{handleDanmakuList(e.lookupType("dm.dmList").decode(n).list)}),0<e.byteLength&&collectAllDanmaku(t+1)}).catch(e=>{console.log(e)})}function handleDanmakuList(n){for(let e=0;e<n.length;e++){var t=n[e],i=t.content,a="progress"in t?t.progress:0,i=i+"|"+parseInt(a/1e3);i in allDanmaku?allDanmaku[i].push(t.midHash):allDanmaku[i]=[t.midHash]}}async function refreshAllDanmaku(){switch(getRoute()){case 0:videoCid=getVideoCid_Main(),initPkg_CollectAllDanmaku();break;case 1:videoCid=getVideoCid_Bangumi(),initPkg_CollectAllDanmaku();break;case 2:videoCid=await getVideoCid_Cheese(),initPkg_CollectAllDanmaku();break;default:videoCid=getVideoCid_Main(),initPkg_CollectAllDanmaku()}}function initPkg_Main(){initPkg_Main_Dom(),initPkg_Main_Func()}function initPkg_Main_Dom(){}function initPkg_Main_Func(){let a;document.getElementById("danmukuBox").addEventListener("contextmenu",e=>{let i=e.path||e.composedPath&&e.composedPath();setTimeout(()=>{a=getSelectedDom(i);var e,n,t=document.querySelector(DOM_MENU_MAIN)||document.querySelector(DOM_MENU_BANGUMI)||document.querySelector(DOM_MENU_CHEESE);t&&!t.querySelector("#query-sender")&&(removeSenderInfoWrap(),e=t.querySelector("ul"),(n=document.createElement("li")).id="query-sender",n.className="context-line context-menu-function",n.innerHTML=`
                <a style="color:#444" class="context-menu-a js-action" href="javascript:void(0);" data-disabled="0">
                    查看发送者
                </a>`,(e||t).appendChild(n),n.addEventListener("click",()=>{a&&(renderSenderInfoWrap(),showSelectedInfo(a))}))},0)},!0)}function getSelectedDom(n){let t=null;for(let e=0;e<n.length;e++)if(n[e].className&&(n[e].className.includes("danmaku-info-row")||n[e].className.includes("dm-info-row"))){t=n[e];break}return t}function showSelectedInfo(e){var n=e.getElementsByClassName("danmaku-info-time")[0],t=e.getElementsByClassName("danmaku-info-danmaku")[0],n=(n||e.getElementsByClassName("dm-info-time")[0]).innerText,i=(t||e.getElementsByClassName("dm-info-dm")[0]).title+"|"+toSecond(n),a=[];if(i in allDanmaku){for(let e=0;e<allDanmaku[i].length;e++){var r=uhash2uid(allDanmaku[i][e]);a.push(...r)}renderSenderInfoCard(a)}}function renderSenderInfoWrap(){removeSenderInfoWrap();let e=document.createElement("div");e.className="senderinfo__wrap",e.innerHTML=`
    <div class="senderinfo__close">X</div>
    <a title="点个Star吧~" href="https://github.com/qianjiachun/bilibili-danmaku-tracker" target="_blank" class="senderinfo__github"><svg t="1639304975096" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2323" width="16" height="16"><path d="M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-121.173333s39.68-12.373333 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.306667 128-46.933333 128-46.933333a161.28 161.28 0 0 1 4.693334 121.173333A177.066667 177.066667 0 0 1 810.666667 477.866667c0 176.64-110.08 215.466667-213.333334 226.986666a106.666667 106.666667 0 0 1 32 85.333334v125.866666c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667" p-id="2324"></path></svg></a>
    <div style="display:flex;justify-content:center;">请先左键选中弹幕再右键查询</div>
    <div class="senderinfo__content">
        <div class="senderinfo__loading">
            <div class="senderinfo__card">
                <div class="senderinfo__avatar">
                    <div class="senderinfo__img-loding"></div>
                </div>
                <div class="senderinfo__user">
                    <span class="senderinfo__name-loading"></span>
                </div>
                <div class="senderinfo__sign">
                    <span class="senderinfo__sign-loading"></span>
                </div>
            </div>
        </div>
    </div>
    `;var n=document.getElementsByClassName("bui-collapse-wrap")[0];n.insertBefore(e,n.childNodes[0]),document.getElementsByClassName("senderinfo__close")[0].addEventListener("click",()=>{e.remove()})}function renderSenderInfoCard(n){let r=document.getElementsByClassName("senderinfo__content")[0];if(r){let a=document.getElementsByClassName("senderinfo__loading")[0];for(let e=0;e<n.length;e++){let i=n[e];GM_xmlhttpRequest({method:"GET",url:"https://m.bilibili.com/space/"+i,headers:{cookie:document.cookie,"user-agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/105.0.0.0"},responseType:"text",onload:function(e){a.style.display="none";var n,e=e.response,t=(new DOMParser).parseFromString(e,"text/html");t&&(e=String(getStrMiddle(e,"<html><head><title>","的个人空间")),n=String(t.querySelector(".m-space-info").querySelector(".face").querySelector("img").src),t=String(t.querySelector(".desc").querySelector(".content").innerHTML),e)&&""!==e&&"false"!==e&&(n=`
                    <div class="senderinfo__card">
                        <div class="senderinfo__avatar">
                            <a href="https://space.bilibili.com/${i}" target="_blank"><img src="${n}" /></a>
                        </div>
                        <div class="senderinfo__user">
                            <a href="https://space.bilibili.com/${i}" target="_blank"><span class="senderinfo__name">${e}</span></a>
                        </div>
                        <div class="senderinfo__sign">${t}</div>
                    </div>
                `,r.innerHTML+=n)}})}}}function removeSenderInfoWrap(){var e=document.getElementsByClassName("senderinfo__wrap");0<e.length&&e[0].remove()}function make_crc32_cracker(){var t=new Uint32Array(256);for(var e=0;e<256;e++){for(var n=e,i=0;i<8;i++)1&n?n=(n>>>1^3988292384)>>>0:n>>>=1;t[e]=n}function c(e,n){return(n>>>8^t[255&n^e])>>>0}function a(e,n){for(var t=n||0,i=0;i<e.length;i++)t=c(e[i],t);return t}var u=function(e){for(var n=new Uint32Array(e),t=0;t<e;t++){var i=[].slice.call(t.toString()).map(Number);n[t]=a(i)}return n}(1e5),r=Array(5).fill(0),p=u.map(function(e){return a(r,e)}),m=new Uint32Array(65537),f=new Uint32Array(2e5);for(var o=0;o<u.length;o++)m[u[o]>>>16]++;for(o=1;o<=65536;o++)m[o]+=m[o-1];for(o=0;o<=u.length;o++){var s=--m[u[o]>>>16];f[s<<1]=u[o],f[s<<1|1]=o}return{crack:function(e,n){for(var t=[],i=(e=~e>>>0,4294967295),a=1;a<=n;a++)if(i=c(48,i),a<6)for(var r=Math.pow(10,a-1),o=Math.pow(10,a),s=r;s<o;s++)e==(i^u[s])>>>0&&t.push(s);else for(var r=Math.pow(10,a-6),l=Math.pow(10,a-5),d=r;d<l;d++)(function(e){for(var n=[],t=m[e>>>16],i=m[1+(e>>>16)],a=t;a<i;a++)f[a<<1]==e&&n.push(f[a<<1|1]);return n})((e^i^p[d])>>>0).forEach(function(e){t.push(1e5*d+e)});return t}}}function uhash2uid(e,n=10){return make_crc32_cracker().crack(parseInt(e,16),n)}function getVideoCid_Bangumi(){return String(unsafeWindow.__INITIAL_STATE__.epInfo.cid)}function getVideoCid_Cheese(){return new Promise(e=>{let n=setInterval(()=>{unsafeWindow.bpNC_1&&(clearInterval(n),e(unsafeWindow.bpNC_1.config.cid))},1e3)})}function getVideoCid_Main(){var e=unsafeWindow.__INITIAL_STATE__.cidMap,n=Object.keys(e);return 0<n.length&&(e=e[n[0]].cids,0<(n=Object.keys(e)).length)?String(e[n[0]]):""}function init_Router(){initPkg_Main()}function getRoute(){let e=0;var n=String(location.href);return n.includes("bangumi/play")?e=1:n.includes("cheese/play")&&(e=2),e}protobuf.loadFromString=(e,t)=>{var n=protobuf.Root,i=n.prototype.fetch,e=(n.prototype.fetch=(e,n)=>n(null,t),(new n).load(e));return n.prototype.fetch=i,e};const _historyWrap=function(e){const n=history[e],t=new Event(e);return function(){var e=n.apply(this,arguments);return t.arguments=arguments,window.dispatchEvent(t),e}};history.pushState=_historyWrap("pushState"),history.replaceState=_historyWrap("replaceState"),window.addEventListener("pushState",refreshAllDanmaku),window.addEventListener("replaceState",refreshAllDanmaku),window.addEventListener("hashchange",refreshAllDanmaku),window.addEventListener("popstate",refreshAllDanmaku),async function(){let e=setInterval(()=>{document.getElementById("danmukuBox")&&(clearInterval(e),initStyles(),init())},500)}();