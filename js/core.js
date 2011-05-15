/* set defaults */
var currentVersion = '2.1';

if(localStorage['version'] != currentVersion) {
	localStorage.clear();
	localStorage['version'] = currentVersion;
}
if(localStorage['firstrun'] == null) {
	localStorage['firstrun'] = false;

	/* destination */
	localStorage['destination.port'] = '10025'; /* "specify", "ask" */
	localStorage['destination.address'] = '127.0.0.1'; 

	/* accelerators */
	localStorage['accelerator.alt'] = false;
	localStorage['accelerator.ctrl'] = true;
	localStorage['accelerator.shift'] = true;
	localStorage['accelerator.key'] = 65; /* CTRL SHIFT a */
	
	/* controls */
	localStorage['controls.doubleclick'] = true;
	localStorage['controls.contextmenu'] = true;
	localStorage['controls.accelerator'] = true;

	/* other */
	localStorage['other.autostart'] = true;

	if(localStorage['version'] == '2.1') { // open the options page on 2.0 launch
		chrome.tabs.getAllInWindow(
					undefined,
					function(tabs) {
						chrome.tabs.create({url: 'options.html', selected: true});
					}
				);
	}
}

/* handle communication with the contentscript */
chrome.extension.onRequest.addListener(
	function(request, sender, callback) {
		if(request.command == 'getOptions') {
			callback({
					command: 'getOptions',
					localStorage: localStorage
				});
		}
		else if(request.command == 'sendUrls') {
			sendUrls(request.urls, request.referer);
		}
	}
);

/* create context menus */
if(localStorage['controls.contextmenu'] == 'true') {
	chrome.contextMenus.create({
				'title': 'Send to JDownloader',
				'contexts': [ 'selection', 'link', 'editable' ],
				'onclick': onContextMenuClick
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
	var baseurl = 'http://' + localStorage['destination.address']
		+ ':' + localStorage['destination.port']
		+ '/action/add/links/grabber0/';

	/* set autostart argument */
	var pautostart = '';
	if(localStorage['other.autostart'] == 'true') {
		baseurl += 'start1/';
	}

	/* send the urls */
	urls = urls.join(' ');
	xmlHttpSend(baseurl + encodeURI(urls));
}

function xmlHttpSend(request) {
	if((request == null) || (request.length == 0)) {
		return;
	}

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('GET', request, false);
	xmlHttp.send(null);
}
