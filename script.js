

/* local variables */
var destination, destinationPath, dynamicPath, autostart, oneByOne, accelKey, accelAlt, accelCtrl, accelShift, doubleClick;
var baseurl = "http://localhost:9666/flashgot?urls=";

/* retrieve the user options */
chrome.extension.sendRequest({command : "getOptions"}, getOptions);

/* callback for getOptions command message,
 * saves the options in current variables */
function getOptions(response) {
	if(response.command == "getOptions") {
		this.destination = response.destination;
		this.destinationPath = response.destinationPath;
		this.dynamicPath = response.dynamicPath;
		this.autostart = response.autostart;
		this.oneByOne = response.oneByOne;
		this.doubleClick = response.doubleClick;
		this.accelKey = response.accelKey;
		this.accelAlt = response.accelAlt;
		this.accelCtrl = response.accelCtrl;
		this.accelShift = response.accelShift;
	}

	/* register event listeners */
	document.addEventListener("keydown", onAccelerator, false);
	if(this.doubleClick) {
		document.addEventListener("dblclick", onDoubleClick, false);
	}
}

function arrayContains(array, item) {
	if((array != null) && (item != null)) {
		for(var r = 0; r < array.length; r++) {
			if(array[r] == item) {
				return true;
			}
		}
	}

	return false;
}

/* callback for key press event */
function onAccelerator(event) {
	if(acceleratorMatch(event)) {
		var selection = window.getSelection();
		if(selection == null) {
			return;
		}

		/* get the text urls */
		var text = selection.toString();
		urls = extractUrls(text);
		if(urls == null) {
			urls = new Array();
		}

		/* add the html urls */
		for(var r = 0; r < document.links.length; r++) {
			if(selection.containsNode(document.links[r], true)) { /* enirely */
				if(!arrayContains(urls, document.links[r].href)) {
					urls.push(document.links[r].href);
				}
			}
		}

		sendUrls(urls);
	}
}

/* callback for double click event */
function onDoubleClick(event) {
	var selection = window.getSelection();
	if(selection == null) {
		return;
	}

	/* extract the clicked host */
	var host = extractHost(selection.anchorNode.textContent);
	if((host == null) || (host.length == 0)) {
		return;
	}

	/* select all links from the same host that are close to each other */
	var ptr = selection.anchorNode;
	var hostUrls = new Array();

	var linkRangeStart = ptr, linkRangeEnd = ptr;
	var linkRange = document.createRange();

	while(ptr.previousSibling != null) { /* go back */
		ptr = ptr.previousSibling;
		if(ptr.nodeType == 3) { /* #text */
			if(ptr.textContent.indexOf(host) != -1) {
				hostUrls.push(extractUrls(ptr.textContent));
				linkRangeStart = ptr;
			}
			else {
				break;
			}
		}
	}
	ptr = selection.anchorNode; /* reset initial position */
	do { /* go forth */
		if(ptr.nodeType == 3) { /* #text */
			if(ptr.textContent.indexOf(host) != -1) {
				hostUrls.push(extractUrls(ptr.textContent));
				linkRangeEnd = ptr;
			}
			else {
				break;
			}
		}
		ptr = ptr.nextSibling;
	} while(ptr != null);

	/* mark the collected links as a selection */
	linkRange.setStartBefore(linkRangeStart);
	linkRange.setEndAfter(linkRangeEnd);
	selection.removeAllRanges();
	selection.addRange(linkRange);

	sendUrls(hostUrls);
}

/* checks if the pressed keys match the user defined */
function acceleratorMatch(e) {
	return e.keyCode == this.accelKey
			&& e.altKey == this.accelAlt
			&& e.ctrlKey == this.accelCtrl
			&& e.shiftKey == this.accelShift;
}

/* extract a host from a URL */
function extractHost(url) {
	if((url == null) || (url.length == 0)) {
		return;
	}
	return url.match(/https?:\/\/.+?\..+?\//i); /* shortest match */
}

/* given a block of text return an array with all the found URLs or null, if none found */
function extractUrls(text) {
	if((text == null) || (text.length == 0)) {
		return;
	}

	var urls = text.match(/https?:\/\/.+\.[^\s]+/gi);
	if(urls == null) {
		return;
	}

	/* trim strings (match() already trims the beginning!) */
	for(var r = 0; r < urls.length; r++) {
		urls[r] = urls[r].replace(/\s*$/, "");
	}

	return urls;
}

/* send the URLs, considering the user options */
function sendUrls(urls) {
	if((urls == null) || (urls.length == 0)) {
		return;
	}

	/* set destination argument */
	var pdestinationpath = "";
	if(this.destination == "destination.specify") {
		pdestinationpath = "&dir=" + this.destinationPath;
	}
	else if(this.destination == "destination.ask") {
		var tpath = prompt("Please select a destination path:", this.dynamicPath);
		if((tpath == null) || (tpath.length == 0)) {
			return;
		}

		this.dynamicPath = tpath;
		chrome.extension.sendRequest({command : "saveDynamicPath", dynamicPath : this.dynamicPath});
		pdestinationpath = "&dir=" + tpath;
	}

	/* set autostart argument */
	var pautostart = "";
	if(this.autostart) {
		pautostart = "&autostart=1";
	}

	if(this.oneByOne) {
		/* send a request for each url */
		for(var r = 0; r < urls.length; r++) {
			xmlHttpSend(baseurl + encodeURI(urls[r]) + pdestinationpath + pautostart);
		}
	}
	else {
		/* join in one string */
		urls = urls.join("\n");

		/* send */
		xmlHttpSend(baseurl + encodeURI(urls) + pdestinationpath + pautostart);
	}
}

/* send a request to JDownloader, ignore the answer */
function xmlHttpSend(request) {
	if((request == null) || (request.length == 0)) {
		return;
	}

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", request, true);
	xmlHttp.send(null);
}
