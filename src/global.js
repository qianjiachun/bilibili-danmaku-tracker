let allDanmaku = {}

const DOM_MENU_MAIN = ".player-auxiliary-context-menu-container"
const DOM_MENU_BANGUMI = ".bpx-player-contextmenu.bpx-player-active"
const DOM_MENU_CHEESE = ".bpx-player-contextmenu.bpx-player-active"


function formatSeconds(value) {
	var secondTime = parseInt(value / 1000); // 秒
	var minuteTime = 0; // 分
	if (secondTime > 60) {
		minuteTime = parseInt(secondTime / 60);
		secondTime = parseInt(secondTime % 60);
	}
	var result ="" +(parseInt(secondTime) < 10? "0" + parseInt(secondTime): parseInt(secondTime));

	// if (minuteTime > 0) {
		result ="" + (parseInt(minuteTime) < 10? "0" + parseInt(minuteTime) : parseInt(minuteTime)) + ":" + result;
	// }
	return result;
}

function toSecond(e){
	var time = e;
	var len= time.split(':')
	if(len.length==3){
	var hour = time.split(':')[0];
	var min = time.split(':')[1];
	var sec = time.split(':')[2];
	return  Number(hour*3600) + Number(min*60) + Number(sec);
	}
	if(len.length==2){
				var min = time.split(':')[0];
				var sec = time.split(':')[1];
			return   Number(min*60) + Number(sec);
	}
	if(len.length==1){
				var sec = time.split(':')[0];
			return    Number(sec);
	}

// var hour = time.split(':')[0];
// var min = time.split(':')[1];
// var sec = time.split(':')[2];
// return  Number(hour*3600) + Number(min*60) + Number(sec);
}


function getStrMiddle(str, before, after) {
	let m = str.match(new RegExp(before + '(.*?)' + after));
	return m ? m[1] : false;
}