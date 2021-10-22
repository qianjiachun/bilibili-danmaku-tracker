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
            let uidList = uhash2uid(uhash);
        }
    }
}