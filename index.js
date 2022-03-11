"use strict";
// ==UserScript==
// @name         Bilibili弹幕查询发送者
// @namespace    https://github.com/qianjiachun
// @version      2022.03.11.01
// @description  bilibili（b站/哔哩哔哩）根据弹幕查询发送者信息
// @author       小淳
// @match        *://www.bilibili.com/video/*
// @match        *://www.bilibili.com/festival/*
// @match        *://www.bilibili.com/bangumi/play/*
// @match        *://www.bilibili.com/cheese/play/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @require      https://cdn.jsdelivr.net/npm/protobufjs@6.10.2/dist/protobuf.min.js
// @connect      bilibili.com
// @license      MIT
// ==/UserScript==

function init() {
	init_Router();
}

function initStyles() {
	let style = document.createElement("style");
	style.appendChild(document.createTextNode(`.senderinfo__wrap {    width: 280px;    min-height: 110px;    height: auto;    z-index: 1;    background-color: white;    border-radius: 8px;    box-shadow: 0 0 30px 2px rgb(0 0 0 / 10%);    position: absolute;    left: 50%;    top: 50%;    transform: translate(-50%, -50%);    max-height: 300px;    box-sizing: border-box;    padding: 5px;    overflow: auto;}.senderinfo__card {    margin-bottom: 5px;    margin-top: 5px;}.senderinfo__github {    width: 16px;    height: 16px;    position: absolute;}.senderinfo__close {    margin-right: 5px;    margin-top: 5px;    cursor: pointer;    position: absolute;    margin-left: 260px;    margin-top: 0px;}.senderinfo__avatar {    width: 100%;    height: 70px;    overflow: hidden;    text-align: center;}.senderinfo__img-loding {    width: 70px;    height: 70px;    border-radius: 50%;    background-color: rgb(225,232,238);    display: inline-block;}.senderinfo__avatar img {    width: 70px;    height: 70px;    border-radius: 50%;}.senderinfo__user {    text-align: center;    margin-top: 10px;}.senderinfo__name {    font-size: 16px;    font-weight: bold;    color: black;}.senderinfo__name-loading {    width: 100px;    height: 16px;    background-color: rgb(225,232,238);    display: inline-block;}.senderinfo__level {    line-height: 17px;    margin-left: 5px;    position: absolute;    color: #99a2aa;}.senderinfo__sign {    color: #99a2aa;    word-break: break-all;    word-wrap: break-word;    margin-top: 10px;    text-align: center;    line-height: 12px;}.senderinfo__sign-loading {    width: 150px;    height: 16px;    background-color: rgb(225,232,238);    display: inline-block;}.senderinfo__wrap::-webkit-scrollbar {    width: 4px;    }.senderinfo__wrap::-webkit-scrollbar-thumb {    border-radius: 10px;    box-shadow: inset 0 0 5px rgba(0,0,0,0.2);    background: rgba(0,0,0,0.2);}.senderinfo__wrap::-webkit-scrollbar-track {    box-shadow: inset 0 0 5px rgba(0,0,0,0.2);    border-radius: 0;    background: rgba(0,0,0,0.1);}`));
	document.head.appendChild(style);
}

let allDanmaku = {}

const DOM_MENU_MAIN = ".player-auxiliary-context-menu-container"
const DOM_MENU_BANGUMI = ".bpx-player-contextmenu.bpx-player-active"
const DOM_MENU_CHEESE = ".bpx-player-contextmenu.bpx-player-active"


function formatSeconds(value) {
	var secondTime = parseInt(value / 1000); // 秒
	var minuteTime = 0; // 分
	if (secondTime > 60) {
		minuteTime = parseInt(secondTime / 60);
		secondTime = parseInt(secondTime % 60);
	}
	var result ="" +(parseInt(secondTime) < 10? "0" + parseInt(secondTime): parseInt(secondTime));

	// if (minuteTime > 0) {
		result ="" + (parseInt(minuteTime) < 10? "0" + parseInt(minuteTime) : parseInt(minuteTime)) + ":" + result;
	// }
	return result;
}

function getStrMiddle(str, before, after) {
	let m = str.match(new RegExp(before + '(.*?)' + after));
	return m ? m[1] : false;
}
let protoStr = `
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
}`;
let videoCid = "";


function initPkg_CollectAllDanmaku() {
    initPkg_CollectAllDanmaku_Dom();
    initPkg_CollectAllDanmaku_Func();
}

function initPkg_CollectAllDanmaku_Dom() {
}  

function initPkg_CollectAllDanmaku_Func() {
    allDanmaku = {};
    collectAllDanmaku(1);
}

function collectAllDanmaku(page) {
    if (page > 30) {
        // 熔断
        return;
    }
    fetch(
        `https://api.bilibili.com/x/v2/dm/web/seg.so?type=1&oid=${videoCid}&segment_index=${page}`
    ).then(response => {
        return response.arrayBuffer();
    }).then(ret => {
        let data = new Uint8Array(ret);
        protobuf.loadFromString("dm", protoStr).then(root => {
            let dmList = root.lookupType("dm.dmList").decode(data);
            handleDanmakuList(dmList.list);
        })
        if (ret.byteLength > 0) {
            collectAllDanmaku(page + 1);
        }
    }).catch(err => {
        console.log(err);
    })
}

function handleDanmakuList(list) {
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let content = item.content;
        let progress = "progress" in item ? item.progress : 0;
        let keyName = `${content}|${formatSeconds(progress)}`;
        if (keyName in allDanmaku) {
            allDanmaku[keyName].push(item.midHash);
        } else {
            allDanmaku[keyName] = [item.midHash];
        }
    }
}

function refreshAllDanmaku() {
    let route = getRoute();
    switch (route) {
        case 0:
            // 在普通页面
            videoCid = getVideoCid_Main();
            initPkg_CollectAllDanmaku();
            break;
        case 1:
            // 在番剧页面
            videoCid = getVideoCid_Bangumi();
            initPkg_CollectAllDanmaku();
            break;
        case 2:
            // 在课程页面
            videoCid = getVideoCid_Cheese();
            initPkg_CollectAllDanmaku();
            break;
        default:
            videoCid = getVideoCid_Main();
            initPkg_CollectAllDanmaku();
            break;
    }
}
function initPkg_Main() {
    initPkg_Main_Dom();
    initPkg_Main_Func();
}

function initPkg_Main_Dom() {
    
}

function initPkg_Main_Func() {
    let selectedDom = null;
    document.getElementById("danmukuBox").addEventListener("contextmenu", (e) => {
        let path = e.path || (e.composedPath && e.composedPath());
        setTimeout(() => {
            selectedDom = getSelectedDom(path);
            let dom = document.querySelector(DOM_MENU_MAIN) || document.querySelector(DOM_MENU_BANGUMI) || document.querySelector(DOM_MENU_CHEESE);
            if (dom) {
                if (dom.querySelector("#query-sender")) {
                    return;
                }
                removeSenderInfoWrap();
                
                let ul = dom.querySelector("ul");
                let li = document.createElement("li");
                li.id = "query-sender";
                li.className = "context-line context-menu-function";
                li.innerHTML = `
                <a style="color:#444" class="context-menu-a js-action" href="javascript:void(0);" data-disabled="0">
                    查看发送者
                </a>`;
                if (ul) {
                    ul.appendChild(li);
                } else {
                    dom.appendChild(li);
                }

                li.addEventListener("click", () => {
                    if (selectedDom) {
                        renderSenderInfoWrap();
                        showSelectedInfo(selectedDom);
                    }
                })
            }
        }, 0);
    }, true)
}

function getSelectedDom(path) {
    let ret = null;
    for (let i = 0; i < path.length; i++) {
        if (path[i].className && (path[i].className.includes("danmaku-info-row") || path[i].className.includes("dm-info-row"))) {
            ret = path[i];
            break;
        }
    }
    return ret;
}

function showSelectedInfo(dom) {
    let domTime = dom.getElementsByClassName("danmaku-info-time")[0];
    let domContent = dom.getElementsByClassName("danmaku-info-danmaku")[0];
    let progress = domTime ? domTime.innerText :dom.getElementsByClassName("dm-info-time")[0].innerText;
    let content = domContent ? domContent.innerText : dom.getElementsByClassName("dm-info-dm")[0].innerText;
    let keyName = `${content}|${progress}`;
    let uidList = [];
    if (keyName in allDanmaku) {
        for (let i = 0; i < allDanmaku[keyName].length; i++) {
            let uhash = allDanmaku[keyName][i];
            let list = uhash2uid(uhash);
            uidList.push(...list);
        }
        renderSenderInfoCard(uidList);
    }
}

function renderSenderInfoWrap() {
    removeSenderInfoWrap();
    let div = document.createElement("div");
    div.className = "senderinfo__wrap";
    div.innerHTML = `
    <div class="senderinfo__close">X</div>
    <a title="点个Star吧~" href="https://github.com/qianjiachun/bilibili-danmaku-tracker" target="_blank" class="senderinfo__github"><svg t="1639304975096" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2323" width="16" height="16"><path d="M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-121.173333s39.68-12.373333 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.306667 128-46.933333 128-46.933333a161.28 161.28 0 0 1 4.693334 121.173333A177.066667 177.066667 0 0 1 810.666667 477.866667c0 176.64-110.08 215.466667-213.333334 226.986666a106.666667 106.666667 0 0 1 32 85.333334v125.866666c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667" p-id="2324"></path></svg></a>
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
    `
    let b = document.getElementsByClassName("bui-collapse-wrap")[0];
    b.insertBefore(div, b.childNodes[0]);

    document.getElementsByClassName("senderinfo__close")[0].addEventListener("click", () => {
        div.remove();
    })
}

function renderSenderInfoCard(uidList) {
    let domCard = document.getElementsByClassName("senderinfo__content")[0];
    if (!domCard) {
        return;
    }
    let domLoading = document.getElementsByClassName("senderinfo__loading")[0];
    for (let i = 0; i < uidList.length; i++) {
        let uid = uidList[i];
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://m.bilibili.com/space/" + uid,
            responseType: "text",
            onload: function(response) {
                domLoading.style.display = "none";
                let ret = response.response;
                let str = String(getStrMiddle(ret, `<meta name="description" content="`, "的主页"));
                let head = String(getStrMiddle(ret, `<link rel="apple-touch-icon" href="`, `">`));
                let arr = str.split("，");
                if (arr.length < 2 || arr[0] === "") {
                    return
                }
                arr[1] = arr[1].replace(arr[0], "").replace(";", "");
                // 此时arr[0]为名字 arr[1]为签名
                let html = `
                    <div class="senderinfo__card">
                        <div class="senderinfo__avatar">
                            <a href="https://space.bilibili.com/${uid}" target="_blank"><img src="${head}" /></a>
                        </div>
                        <div class="senderinfo__user">
                            <a href="https://space.bilibili.com/${uid}" target="_blank"><span class="senderinfo__name">${arr[0]}</span></a>
                        </div>
                        <div class="senderinfo__sign">${arr[1]}</div>
                    </div>
                `
                domCard.innerHTML += html;
            }
        });
    }
}

function getVideoCid_Main() {
    return String(unsafeWindow.cid);
}

function removeSenderInfoWrap() {
    let domWrapList = document.getElementsByClassName("senderinfo__wrap");
    if (domWrapList.length > 0) {
        domWrapList[0].remove();
    }
}
function make_crc32_cracker() {
    var POLY = 0xedb88320;
    var crc32_table = new Uint32Array(256);
    function make_table() {
        for (var i = 0; i < 256; i++) {
            var crc = i;
            for (var _ = 0; _ < 8; _++) {
                if (crc & 1) {
                    crc = ((crc >>> 1) ^ POLY) >>> 0;
                } else {
                    crc = crc >>> 1;
                }
            }

            crc32_table[i] = crc;
        }
    }
    make_table();
    function update_crc(by, crc) {
        return ((crc >>> 8) ^ crc32_table[(crc & 0xff) ^ by]) >>> 0;
    }
    function compute(arr, init) {
        var crc = init || 0;
        for (var i = 0; i < arr.length; i++) {
            crc = update_crc(arr[i], crc);
        }
        return crc;
    }
    function make_rainbow(N) {
        var rainbow = new Uint32Array(N);
        for (var i = 0; i < N; i++) {
            var arr = [].slice.call(i.toString()).map(Number);
            rainbow[i] = compute(arr);
        }
        return rainbow;
    }
    var rainbow_0 = make_rainbow(100000);
    var five_zeros = Array(5).fill(0);
    var rainbow_1 = rainbow_0.map(function (crc) {
        return compute(five_zeros, crc);
    });
    var rainbow_pos = new Uint32Array(65537);
    var rainbow_hash = new Uint32Array(200000);
    function make_hash() {
        for (var i = 0; i < rainbow_0.length; i++) {
            rainbow_pos[rainbow_0[i] >>> 16]++;
        }
        for (var i = 1; i <= 65536; i++) {
            rainbow_pos[i] += rainbow_pos[i - 1];
        }
        for (var i = 0; i <= rainbow_0.length; i++) {
            var po = --rainbow_pos[rainbow_0[i] >>> 16];
            rainbow_hash[po << 1] = rainbow_0[i];
            rainbow_hash[po << 1 | 1] = i;
        }
    }
    function lookup(crc) {
        var results = [];
        var first = rainbow_pos[crc >>> 16],
            last = rainbow_pos[1 + (crc >>> 16)];
        for (var i = first; i < last; i++) {
            if (rainbow_hash[i << 1] == crc)
                results.push(rainbow_hash[i << 1 | 1]);
        }
        return results;
    }
    make_hash();
    function crack(maincrc, max_digit) {
        var results = [];
        maincrc = (~maincrc) >>> 0;
        var basecrc = 0xffffffff;
        for (var ndigits = 1; ndigits <= max_digit; ndigits++) {
            basecrc = update_crc(0x30, basecrc);
            if (ndigits < 6) {
                var first_uid = Math.pow(10, ndigits - 1),
                    last_uid = Math.pow(10, ndigits);
                for (var uid = first_uid; uid < last_uid; uid++) {
                    if (maincrc == ((basecrc ^ rainbow_0[uid]) >>> 0)) {
                        results.push(uid);
                    }
                }
            } else {
                var first_prefix = Math.pow(10, ndigits - 6);
                var last_prefix = Math.pow(10, ndigits - 5);
                for (var prefix = first_prefix; prefix < last_prefix; prefix++) {
                    var rem = (maincrc ^ basecrc ^ rainbow_1[prefix]) >>> 0;
                    var items = lookup(rem);
                    items.forEach(function (z) {
                        results.push(prefix * 100000 + z);
                    })
                }
            }
        }
        return results;
    }
    return {
        crack: crack
    };
}

function uhash2uid(uidhash, max_digit = 10) {
    let _crc32_cracker = null;
    _crc32_cracker = _crc32_cracker || make_crc32_cracker();
    return _crc32_cracker.crack(parseInt(uidhash, 16), max_digit);
}
function getVideoCid_Bangumi() {
    return String(unsafeWindow.__INITIAL_STATE__.epInfo.cid);
}

function getVideoCid_Cheese() {
    let episodes = unsafeWindow.PlayerAgent.getEpisodes();
    let _id = unsafeWindow.$('li.on.list-box-li').index();
    return String(episodes[_id].cid);
}

function getVideoCid_Main() {
    return String(unsafeWindow.cid);
}

protobuf.loadFromString = (name, protoStr) => {
    const Root = protobuf.Root;
    const fetchFunc = Root.prototype.fetch;
    Root.prototype.fetch = (_, cb) => cb(null, protoStr);
    const root = new Root().load(name);
    Root.prototype.fetch = fetchFunc;
    return root;
};
function init_Router() {
    refreshAllDanmaku();
    initPkg_Main();
}

function getRoute() {
    // 规定 0是默认页面 1是番剧bangumi页面 2是cheese课程页面
    let ret = 0;
    let url = String(location.href);
    if (url.includes("bangumi/play")) {
        // 在番剧页面
        ret = 1;
    } else if (url.includes("cheese/play")) {
        // 在课程页面
        ret = 2;
    }
    return ret;
}

const _historyWrap = function (type) {
	const orig = history[type];
	const e = new Event(type);
	return function () {
		const rv = orig.apply(this, arguments);
		e.arguments = arguments;
		window.dispatchEvent(e);
		return rv;
	};
};
history.pushState = _historyWrap('pushState');
history.replaceState = _historyWrap('replaceState');

window.addEventListener('pushState', refreshAllDanmaku);
window.addEventListener('replaceState', refreshAllDanmaku);
window.addEventListener('hashchange', refreshAllDanmaku);
window.addEventListener('popstate', refreshAllDanmaku);

(async function () {
	let timer = setInterval(() => {
		let dom = document.getElementById("danmukuBox");
		if (dom) {
			clearInterval(timer);
			initStyles();
			init();
		}
	}, 500);
})();