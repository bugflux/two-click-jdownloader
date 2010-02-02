chrome.extension.sendRequest({command : "getOptions"}, getOptions);
document.addEventListener("keydown", onAccelerator, false);
var destination, destinationPath, autostart, oneByOne, accelKey, accelAlt, accelCtrl, accelShift;

function getOptions(response) {
	if(response.command == "getOptions") {
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
		if(selection) {
			text = selection.toString();
			console.log("got:\n" + text);
		}
		else {
			console.log("no selection found");
			return;
		}

		/* extract urls */
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
		var baseurl = "http://localhost:9666/flashgot?urls=";
		if(oneByOne) {
			/* send a request for each url */
			for(var r = 0; r < urls.length; r++) {
				request = baseurl + encodeURI(urls[r]) + pdestinationpath + pautostart;

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
			request = baseurl + encodeURI(urls) + pdestinationpath + pautostart;

			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("GET", request, true);
			xmlHttp.send(null);
			console.log("sent [" + request + "]")
		}
	}
}

