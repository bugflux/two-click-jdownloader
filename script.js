

/* local variables */
var destination, destinationPath, dynamicPath, autostart, oneByOne, accelKey, accelAlt, accelCtrl, accelShift;
var baseurl = "http://localhost:9666/flashgot?urls=";

/* retrieve the user options */
chrome.extension.sendRequest({command : "getOptions"}, getOptions);

/* register event listeners */
document.addEventListener("keydown", onAccelerator, false);
document.addEventListener("dblclick", onDoubleClick, false);


/* callback for getOptions command message,
 * saves the options in current variables */
function getOptions(response) {
	if(response.command == "getOptions") {
		this.destination = response.destination;
		this.destinationPath = response.destinationPath;
		this.dynamicPath = response.dynamicPath;
		this.autostart = response.autostart;
		this.oneByOne = response.oneByOne;
		this.accelKey = response.accelKey;
		this.accelAlt = response.accelAlt;
		this.accelCtrl = response.accelCtrl;
		this.accelShift = response.accelShift;
	}
}

/* callback for key press event */
function onAccelerator(event) {
	if(acceleratorMatch(event)) {
		var selection = window.getSelection();
		if(selection == null) {
			return;
		}

		text = selection.toString();
		console.log("got:\n" + text);

		sendURLs(extractURLs(text));
	}
}

/* callback for double click event */
function onDoubleClick(event) {
	var selection = window.getSelection();
	if(selection == null) {
		return;
	}

	var host = extractHost(selection.focusNode.data);
	if((host == null) || (host.length == 0)) {
		console.log("couldn't find host");
		return;
	}

	console.log("selected host: " + host);

	/* extract the URLs */
	var text = selection.anchorNode.parentNode.innerText;
	urls = extractURLs(text);

	/* consider only the selected host */
	var hostUrls = new Array();
	for(var r = 0; r < urls.length; r++) {
		if(urls[r].indexOf(host) != -1) {
			hostUrls.push(urls[r]);
		}
	}

	sendURLs(hostUrls);
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
	return url.match(/https?:\/\/.+?\..+?\//i); /* shortest match */
}

/* given a block of text return an array with all the found URLs or null, if none found */
function extractURLs(text) {
	if((text == null) || (text.length == 0)) {
		return;
	}

	var urls = text.match(/https?:\/\/.+\..+\s*/gi);
	if(urls == null) {
		console.log("no urls found");
		return;
	}
	else {
		console.log("found " + urls.length + " url(s):");
	}

	/* trim strings (match() already trims the beginning!) */
	for(var r = 0; r < urls.length; r++) {
		urls[r] = urls[r].replace(/\s*$/, "");
		console.log(urls[r]);
	}

	return urls;
}

/* send the URLs, considering the user options */
function sendURLs(urls) {
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
			console.log("no path specified: aborting");
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
	console.log("sent [" + request + "]");
}
