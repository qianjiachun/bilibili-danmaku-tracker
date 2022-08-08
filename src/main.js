"use strict";
// ==UserScript==
// @name         Bilibili弹幕查询发送者
// @namespace    https://github.com/qianjiachun
// @version      2022.08.08.01
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
	style.appendChild(document.createTextNode(`/*编译器标记 勿删*/`));
	document.head.appendChild(style);
}

// 编译器标记 勿删
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