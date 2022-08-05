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
        console.log("哈哈",data)
        protobuf.loadFromString("dm", protoStr).then(root => {
            let dmList = root.lookupType("dm.dmList").decode(data);
            console.log("嘻嘻", dmList)
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
    console.log("route",route)
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
    console.log("videoCid", videoCid)
}