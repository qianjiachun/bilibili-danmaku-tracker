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