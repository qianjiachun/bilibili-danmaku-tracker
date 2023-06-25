function init_Router() {
    // refreshAllDanmaku();
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