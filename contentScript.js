/* option variables */
var storage;

/* retrieve the user options */
chrome.extension.sendRequest({command : "getOptions"}, getOptions);

/* callback for getOptions command message,
 * saves the options in current variables */
function getOptions(response) {
	if(response.command == "getOptions") {
		storage = response.localStorage;
	}

	/* register event listeners */
	if(storage["controls.accelerator"] == "true") {
		document.addEventListener("keydown", onAccelerator, false);
	}
	if(storage["controls.doubleclick"] == "true") {
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
			if(selection.containsNode(document.links[r], true)) { /* entirely */
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
	return e.keyCode == storage["accelerator.key"]
			&& e.altKey == (storage["accelerator.alt"] == "true")
			&& e.ctrlKey == (storage["accelerator.ctrl"] == "true")
			&& e.shiftKey == (storage["accelerator.shift"] == "true");
}

/* extract a host from a URL */
function extractHost(url) {
	if((url == null) || (url.length == 0)) {
		return;
	}
	return url.match(/https?:\/\/.+?\..+?\//i); /* shortest match */
}

/* send the URLs, considering the user options */
function sendUrls(urls) {
	chrome.extension.sendRequest({
				command : "sendUrls",
				urls: urls,
				referer: document.URL
			});
}

