function initPkg_SelectDanmaku() {
    initPkg_SelectDanmaku_Dom();
    initPkg_SelectDanmaku_Func();
}

function initPkg_SelectDanmaku_Dom() {
    
}

function initPkg_SelectDanmaku_Func() {
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
            console.log("我点了视频区的弹幕", e)
            setTimeout(() => {
               console.log(document.querySelector(".danmaku-info-row.bpui-selected")) 
            }, timeout);
        }
        if (domRight && e.target.className === "danmaku-info-danmaku") {
            console.log("嘻嘻", domRight, e)
        }
    })
    // let hook = new DomHook(".player-auxiliary-area.relative", true, (m) => {
    //     console.log(m);
    // })
    // console.log(hook);
}