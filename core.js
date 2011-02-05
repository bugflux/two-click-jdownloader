/* set defaults */
var currentVersion = "2.0";

if(localStorage["version"] != currentVersion) {
	localStorage.clear();
	localStorage["version"] = currentVersion;
}
if(localStorage["firstrun"] == null) {
	localStorage["firstrun"] = false;

	/* destination */
	localStorage["destination.type"] = "default"; /* "specify", "ask" */
	localStorage["destination.path"] = ""; 
	localStorage["destination.dynamicpath"] = ""; 

	/* accelerators */
	localStorage["accelerator.alt"] = false;
	localStorage["accelerator.ctrl"] = true;
	localStorage["accelerator.shift"] = true;
	localStorage["accelerator.key"] = 65; /* CTRL SHIFT a */
	
	/* controls */
	localStorage["controls.doubleclick"] = true;
	localStorage["controls.contextmenu"] = true;
	localStorage["controls.accelerator"] = true;

	/* other */
	localStorage["other.autostart"] = true;

	if(localStorage["version"] == "2.0") { // open the options page on 2.0 launch
		chrome.tabs.getAllInWindow(
					undefined,
					function(tabs) {
						chrome.tabs.create({url: "options.html", selected: true});
					}
				);
	}
}

/* handle communication with the contentscript */
chrome.extension.onRequest.addListener(
	function(request, sender, callback) {
		if(request.command == "getOptions") {
			callback({
					command: "getOptions",
					localStorage: localStorage
				});
		}
		else if(request.command == "sendUrls") {
			sendUrls(request.urls, request.referer);
		}
	}
);

/* create context menus */
if(localStorage["controls.contextmenu"] == "true") {
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
	if(localStorage["destination.type"] == "specify") {
		pdestinationpath = "&dir=" + localStorage["destination.path"];
	}
	else if(localStorage["destination.type"] == "ask") {
		var tpath = prompt("Please select a destination path: ", localStorage["destination.dynamicpath"]);
		if((tpath == null) || (tpath.length <= 0)) {
			return;
		}

		localStorage["destination.dynamicpath"] = tpath;
		pdestinationpath = "&dir=" + tpath;
	}
	
	/* set autostart argument */
	var pautostart = "";
	if(localStorage["other.autostart"] == "true") {
		pautostart = "&autostart=1";
	}

	/* send the urls */
	urls = urls.join("\n");
	xmlHttpSend(baseurl + encodeURI(urls) + pdestinationpath + pautostart);
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

