chrome.extension.sendRequest({command : "options"}, getOptions);
document.addEventListener("keydown", onAccelerator, false);
var destination, destinationPath, autostart, oneByOne, accelKey, accelAlt, accelCtrl, accelShift;

function getOptions(response) {
	if(response.command == "options") {
		this.destination = response.destination;
		this.destinationPath = response.destinationPath;
		this.autostart = response.autostart;
		this.oneByOne = response.oneByOne;
		this.accelKey = response.accelKey;
		this.accelAlt = response.accelAlt;
		this.accelCtrl = response.accelCtrl;
		this.accelShift = response.accelShift;
	}
}

function acceleratorMatch(e) {
	return e.keyCode == parseInt(accelKey)
			&& e.altKey == accelAlt
			&& e.ctrlKey == accelCtrl
			&& e.shiftKey == accelShift;
}

function onAccelerator(event) {
	if(acceleratorMatch(event)) {
		var selection = window.getSelection();
		var text = selection ? selection.toString() : "";

		if(text.length != 0) {
			console.log("got:\n" + text);

			/* extract urls */
			var urls = text.match(/https?:\/\/.+\..+\s*/gi);
			console.log("found " + urls.length + " urls:");

			/* trim strings (match() already trims the beginning!) */
			for(var r = 0; r < urls.length; r++) {
				urls[r] = urls[r].replace(/\s*$/, "");
				console.log(urls[r]);
			}

			/* set destination argument */
			var pdestinationpath = "";
			if(destination == "destination.specify") {
				pdestinationpath = "&dir=" + destinationPath;
			}

			/* set autostart argument */
			var pautostart = "";
			if(autostart) {
				pautostart = "&autostart=1";
			}

			var request; /* easy on garbage collecting? */
			if(oneByOne) {
				/* send a request for each url */
				for(var r = 0; r < urls.length; r++) {
					request = "http://localhost:9666/flashgot?urls="
							+ encodeURI(urls[r])
							+ pdestinationpath
							+ pautostart;

					var xmlHttp = new XMLHttpRequest();
					xmlHttp.open("GET", request, true);
					xmlHttp.send(null);
					console.log("sent [" + request + "]");
				}
			}
			else {
				/* join in one string */
				urls = urls.join("\n");

				/* set variables */
				request = "http://localhost:9666/flashgot?urls="
						+ encodeURI(urls)
						+ pdestinationpath
						+ pautostart;

				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", request, true);
				xmlHttp.send(null);
				console.log("sent [" + request + "]")
			}
		}
	}
}

function magicOneByOne(urls) {
	console.log("selection:\n" + urls);

	/* replace all whitespace with single newline then split */
	var urls = urls.replace(/\s+/g, "\n").split("\n");

	/* set destination argument */
	var pdestinationpath = "";
	if(destination == "destination.default") {
		pdestinationpath = "&dir=" + destinationPath;
	}

	/* set autostart argument */
	var pautostart = "";
	if(autostart) {
		pautostart = "&autostart=1";
	}

	/* send a request for each url */
	var baseurl = "http://localhost:9666/flashgot?urls="
	for(var r = 0; r < urls.length; r++) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", baseurl + encodeURI(urls[r]) + pdestinationpath + pautostart, true);
		xmlHttp.send(null);
		console.log("sent to jdownloader:\n" + urls[r]);
		console.log("http request:\n", baseurl + encodeURI(urls[r]) + pdestinationpath + pautostart);
	}
}

function magicAllAtOnce(urls) {
	console.log("selection:\n" + urls);

	/* replace all whitespace with single newline */
	urls = urls.replace(/\s+/g, "\n");

	/* delete non urls */
	urls = urls.replace(/^[^http].*$/mg, "");

	/* repeat cleaning whitespace */
	urls = urls.replace(/\s+/g, "\n");

	/* trim */
	urls = urls.replace(/^\s*/, "").replace(/\s*$/, "");

	/* set destination argument */
	var pdestinationpath = "";
	if(destination == "destination.default") {
		pdestinationpath = "&dir=" + destinationPath;
	}

	/* set autostart argument */
	var pautostart = "";
	if(autostart) {
		pautostart = "&autostart=1";
	}

	/* send the request */
	var baseurl = "http://localhost:9666/flashgot?urls="
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", baseurl + encodeURI(urls) + pdestinationpath + pautostart, true);
	xmlHttp.send(null);

	console.log("sent to jdownloader:\n" + urls);
	console.log("http request:\n", baseurl + encodeURI(urls) + pdestinationpath + pautostart);
}
