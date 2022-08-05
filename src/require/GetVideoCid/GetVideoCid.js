function getVideoCid_Bangumi() {
    return String(unsafeWindow.__INITIAL_STATE__.epInfo.cid);
}

function getVideoCid_Cheese() {
    let episodes = unsafeWindow.PlayerAgent.getEpisodes();
    let _id = unsafeWindow.$('li.on.list-box-li').index();
    return String(episodes[_id].cid);
}

function getVideoCid_Main() {
    let cidMap = unsafeWindow.__INITIAL_STATE__.cidMap;
    let keys = Object.keys(cidMap);
    if (keys.length > 0) {
        let cids = cidMap[keys[0]].cids;
        let cidsKeys = Object.keys(cids);
        if (cidsKeys.length > 0) {
            return String(cids[cidsKeys[0]]);
        } else {
            return "";
        }
    } else {
        return "";
    }
}
