/* set defaults */
var currentVersion = '2.5';

if(localStorage['version'] != currentVersion) {
	localStorage.clear();
	localStorage['version'] = currentVersion;
}
if(localStorage['firstrun'] == null) {
	localStorage['firstrun'] = false;

	/* destination */
	localStorage['destination.port'] = '9666';
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

	/* show the options page on first run */
	chrome.tabs.getAllInWindow(
			undefined,
			function(tabs) {
				chrome.tabs.create({url: 'options.html', selected: true});
			}
		);

	/* have people read the requirements */
	alert('Please read the requirements for the new JDChrome version!');
	chrome.tabs.getAllInWindow(
			undefined,
			function(tabs) {
				chrome.tabs.create({url: 'https://chrome.google.com/webstore/detail/ljhooappahaeilmbekgcokgjjplambgo', selected: true});
			}
		);
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
			console.debug('JDChrome, core.js: urls from hotkey or double click');
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
			console.debug('JDChrome, core.js: selection from contextmenu');
			sendUrls(extractUrls(info.selectionText), info.pageUrl);
		}
		else if(info.linkUrl) {
			console.debug('JDChrome, core.js: href from context menu');
			sendUrls([info.linkUrl], info.pageUrl);
		}
	}
}

/* send a bunch of links, considering the user's settings */
function sendUrls(urls, referer) {
	console.debug('JDChrome, core.js: jdownloader ' + localStorage['destination.address'] + ':' + localStorage['destination.port']);
	console.debug('JDChrome, core.js: autostart ' + localStorage['other.autostart']);
	console.debug('JDChrome, core.js: sending urls ' + urls);
	if((urls == null) || (urls.length <= 0)) {
		return;
	}

	/* set baseurl */
	var requestUrl = '/flashgot?';

	/* set referer */
	requestUrl += 'referer=' + encodeURIComponent(referer);

	/* set autostart */
	if(localStorage['other.autostart'] == 'true') {
		requestUrl += '&autostart=1';
	}

	/* set urls */
	requestUrl += '&urls=' + encodeURIComponent(urls.join('\n'));

	/* send urls */
	xmlHttpSend(requestUrl);
}

function xmlHttpSend(request) {
	console.debug('JDChrome, core.js: http request ' + request);
	if((request == null) || (request.length == 0)) {
		return;
	}

	var baseurl = 'http://' + localStorage['destination.address']
			+ ':' + localStorage['destination.port'];

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('GET', baseurl + request, false);
	xmlHttp.send(null);
}

