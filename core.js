/* set defaults */
var currentVersion = 1.5;

if(localStorage["destination"] == null) { /* first run */
	/* accelerators */
	localStorage["accel.alt"] = false;
	localStorage["accel.ctrl"] = true;
	localStorage["accel.shift"] = true;
	localStorage["accel.key"] = 65; /* CTRL SHIFT a */

	/* destination */
	localStorage["destination"] = "destination.default";
	localStorage["destination.path"] = "";
	localStorage["destination.dpath"] = "";
	
	/* other */
	localStorage["other.doubleclick"] = true;
	localStorage["other.autostart"] = true;
	localStorage["other.onebyone"] = false;
}
localStorage["version"] = currentVersion;

/* handle communication with the contentscript */
chrome.extension.onRequest.addListener(
	function(request, sender, callback) {
		if(request.command == "getOptions") {
			callback({
					command: "getOptions",
					doubleClick: localStorage["other.doubleclick"] == "true",
					accelKey: parseInt(localStorage["accel.key"]),
					accelAlt: localStorage["accel.alt"] == "true",
					accelCtrl: localStorage["accel.ctrl"] == "true",
					accelShift: localStorage["accel.shift"] == "true"
				});
		}
		else if(request.command == "sendUrls") {
			sendUrls(request.urls, request.referer);
			// TODO: check if referer is actually needed!
		}
	}
);


/* create context menus */
chrome.contextMenus.create({
			"title": "Send to JDownloader",
			"contexts": [ "selection", "link", "editable" ],
			"onclick": onContextMenuClick
		});

function onContextMenuClick(info, tab) {
	if(info.selectionText) {
		sendUrls(extractUrls(info.selectionText), info.pageUrl);
	}
	else if(info.linkUrl) {
		sendUrls([info.linkUrl], info.pageUrl);
	}
}


/* send a bunch of links, considering the user's settings */
function sendUrls(urls, referer) {
	if((urls == null) || (urls.length <= 0)) {
		return;
	}

	/* set the referer */
	var baseurl = "http://127.0.0.1:9666/flashgot?referer=" + referer + "&urls=";

	/* set destination argument */
	var pdestinationpath = "";
	if(localStorage["destination"] == "destination.specify") {
		pdestinationpath = "&dir=" + localStorage["destinationPath"];
	}
	else if(localStorage["destination"] == "destination.ask") {
		var tpath = prompt("Please select a destination path: ", localStorage["destination.dpath"]);
		if((tpath == null) || (tpath.length <= 0)) {
			return;
		}

		localStorage["destination.dpath"] = tpath;
		pdestinationpath = "&dir=" + tpath;
	}
	
	/* set autostart argument */
	var pautostart = "";
	if(localStorage["other.autostart"] == "true") {
		pautostart = "&autostart=1";
	}

	/* send the urls */
	if(localStorage["other.onebyone"] == "true") {
		/* send a request for each url */
		for(var r = 0; r < urls.length; r++) {
			xmlHttpSend(baseurl + encodeURI(urls[r]) + pdestinationpath + pautostart);
		}
	}
	else {
		/* join in one string and send */
		urls = urls.join("\n");
		xmlHttpSend(baseurl + encodeURI(urls) + pdestinationpath + pautostart);
	}
}

function xmlHttpSend(request) {
	if((request == null) || (request.length == 0)) {
		return;
	}

	console.log(request);
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", request, false);
	xmlHttp.send(null);
}
