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
	style.appendChild(document.createTextNode(`/*编译器标记 勿删*/`));
	document.head.appendChild(style);
}

// 编译器标记 勿删

(function() {
	let timer = setInterval(() => {
		let dom = document.getElementById("danmukuBox");
		if (dom) {
			clearInterval(timer);
			init();
		}
	}, 500);
})();