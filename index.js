"use strict";
// ==UserScript==
// @name         Bilibili弹幕查询发送者
// @namespace    https://github.com/qianjiachun
// @version      2021.10.19.02
// @description  bilibili（b站/哔哩哔哩）根据弹幕查询发送者信息
// @author       小淳
// @match        *://www.bilibili.com/video/*
// @grant        unsafeWindow
// @require      https://cdn.jsdelivr.net/npm/protobufjs@6.10.2/dist/protobuf.min.js
// ==/UserScript==

function init() {
	initPkg_CollectAllDanmaku();
    initPkg_Main();
}

function initStyles() {
	let style = document.createElement("style");
	style.appendChild(document.createTextNode(``));
	document.head.appendChild(style);
}

let cid = unsafeWindow.cid
let allDanmaku = {}

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
    fetch(
        `https://api.bilibili.com/x/v2/dm/web/seg.so?type=1&oid=${cid}&segment_index=${page}`
    ).then(response => {
        return response.arrayBuffer();
    }).then(ret => {
        let data = new Uint8Array(ret);
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
        let progress = "progress" in item ? item.progress : "0";
        let keyName = `${content}|${formatSeconds(progress)}`;
        if (keyName in allDanmaku) {
            allDanmaku[keyName].push(item.midHash);
        } else {
            allDanmaku[keyName] = [item.midHash];
        }
    }
}
function initPkg_Main() {
    initPkg_Main_Dom();
    initPkg_Main_Func();
}

function initPkg_Main_Dom() {
    
}

function initPkg_Main_Func() {
    document.addEventListener("click", (e) => {
        let isVideoDm = false;
        for (let i = 0; i < e.path.length; i++) {
            let item = e.path[i];
            if (item.className && item.className.indexOf("context-menu-a") !== -1) {
                isVideoDm = true;
                break;
            }
        }

        let domRight = document.querySelector(".danmaku-info-row.bpui-selected");
        if (isVideoDm) {
            setTimeout(() => {
                showSelectedInfo(document.querySelector(".danmaku-info-row.bpui-selected"));
            }, 0);
        }
        if (domRight && e.target.className === "danmaku-info-danmaku") {
            showSelectedInfo(domRight);
        }
    })
}

function showSelectedInfo(dom) {
    let progress = dom.getElementsByClassName("danmaku-info-time")[0].innerText;
    let content = dom.getElementsByClassName("danmaku-info-danmaku")[0].innerText;
    let keyName = `${content}|${progress}`;
    if (keyName in allDanmaku) {
        for (let i = 0; i < allDanmaku[keyName].length; i++) {
            let uhash = allDanmaku[keyName][i];
            console.log(uhash2uid(uhash));
        }
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
protobuf.loadFromString = (name, protoStr) => {
    const Root = protobuf.Root;
    const fetchFunc = Root.prototype.fetch;
    Root.prototype.fetch = (_, cb) => cb(null, protoStr);
    const root = new Root().load(name);
    Root.prototype.fetch = fetchFunc;
    return root;
};


(function() {
	let timer = setInterval(() => {
		let dom = document.getElementById("danmukuBox");
		if (dom) {
			clearInterval(timer);
			init();
		}
	}, 500);
})();