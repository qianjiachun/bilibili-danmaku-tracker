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
    let keyName = `${content}|${toSecond(progress)}`;
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
        // fetch(`https://api.bilibili.com/x/space/acc/info?mid=${uid}&token=&platform=web&jsonp=jsonp`)
        // .then(res => res.json())
        // .then(ret => {
        //     const {data} = ret;
        //     domLoading.style.display = "none";
        //     let head = data.face;
        //     let name = data.name;
        //     let sign = data.sign
        //     // 此时arr[0]为名字 arr[1]为签名
        //     let html = `
        //         <div class="senderinfo__card">
        //             <div class="senderinfo__avatar">
        //                 <a href="https://space.bilibili.com/${uid}" target="_blank"><img src="${head}" /></a>
        //             </div>
        //             <div class="senderinfo__user">
        //                 <a href="https://space.bilibili.com/${uid}" target="_blank"><span class="senderinfo__name">${name}</span></a>
        //             </div>
        //             <div class="senderinfo__sign">${sign}</div>
        //         </div>
        //     `
        //     domCard.innerHTML += html;
        // })
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://m.bilibili.com/space/" + uid,
            headers: {
                "cookie": document.cookie,
                "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/105.0.0.0"
            },
            responseType: "text",
            onload: function(response) {
                domLoading.style.display = "none";
                let ret = response.response;
                let name = String(getStrMiddle(ret, `<title data-vue-meta="true">`, "的个人空间"));
                let head = String(getStrMiddle(ret, `<div class="face"><img src="`, `"`));
                let sign = String(getStrMiddle(ret, `<div class="desc"><span class="content">`, "</span>"));
                if (!name || name === "" || name === "false") return;
                let html = `
                    <div class="senderinfo__card">
                        <div class="senderinfo__avatar">
                            <a href="https://space.bilibili.com/${uid}" target="_blank"><img src="${head}" /></a>
                        </div>
                        <div class="senderinfo__user">
                            <a href="https://space.bilibili.com/${uid}" target="_blank"><span class="senderinfo__name">${name}</span></a>
                        </div>
                        <div class="senderinfo__sign">${sign}</div>
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