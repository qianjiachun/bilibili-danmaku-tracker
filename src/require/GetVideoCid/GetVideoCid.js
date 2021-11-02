function getVideoCid_Bangumi() {
    return String(unsafeWindow.__INITIAL_STATE__.epInfo.cid);
}

function getVideoCid_Cheese() {
    let episodes = unsafeWindow.PlayerAgent.getEpisodes();
    let _id = unsafeWindow.$('li.on.list-box-li').index();
    return String(episodes[_id].cid);
}

function getVideoCid_Main() {
    return String(unsafeWindow.cid);
}
