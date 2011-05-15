
/* temporary variables (to permit saving only on button "Save") */
var accelerator = {};

/* accelerator saving callback. saves only to temporary variables */
function setAccelerator(event) {
	event.preventDefault(); /* prevents writing to the text field */
	if((event.keyCode >= 32 && event.keyCode <= 126) // has a "letter"
			&& (event.altKey || event.ctrlKey || event.shiftKey)) { // has a "modifier"
		accelerator = {
				alt: event.altKey,
				ctrl: event.ctrlKey,
				shift: event.shiftKey,
				key: event.keyCode
			};
	}
	else {
		accelerator = {
			alt: false,
			ctrl: false,
			shift: false,
			key: false
		};
	}

	writeAccelerator();
}

/* writes accelerator in text form to the appropriate field */
function writeAccelerator() {
	document.getElementById("accelerator").value = accelerator.ctrl ? "CTRL " : "";
	document.getElementById("accelerator").value += accelerator.alt ? "ALT " : "";
	document.getElementById("accelerator").value += accelerator.shift ? "SHIFT " : "";
	document.getElementById("accelerator").value += String.fromCharCode(accelerator.key);
}

/* save options to local storage */
function save_options() {
	/* save destination options */
	var dest = document.destinationForm.destination;
	var destinationPort = document.getElementById("destination.port").value;
	if(!isNaN(destinationPort) || destinationPort < 1 || destinationPort > 65535) {
		alert("Invalid port number specified!");
	} else {
		localStorage["destination.port"] = destinationPort;
	}

	var destinationAddress = document.getElementById("destination.address").value;
	if(!destinationAddress || destinationAddress.length == 0) {
		localStorage["destination.address"] = '127.0.0.1';
	} else {
		localStorage["destination.address"] = destinationAddress;
	}

	/* enable/disable controls */
	var doubleclickSet = document.getElementById("controls.doubleclick").checked;
	var contextmenuSet = document.getElementById("controls.contextmenu").checked;
	var acceleratorSet = document.getElementById("controls.accelerator").checked;

	localStorage["controls.doubleclick"] = doubleclickSet;
	localStorage["controls.contextmenu"] = contextmenuSet;
	localStorage["controls.accelerator"] = acceleratorSet;

	/* save accelerator keys */
	localStorage["accelerator.alt"] = accelerator.alt;
	localStorage["accelerator.ctrl"] = accelerator.ctrl;
	localStorage["accelerator.shift"] = accelerator.shift;
	localStorage["accelerator.key"] = accelerator.key;

	/* save autostart option */
	localStorage["other.autostart"] = document.getElementById("other.autostart").checked;
}

/* load options from local storage */
function load_options() {
	/* load destination option */
	document.getElementById("destination.port").value = localStorage["destination.port"];
	document.getElementById("destination.address").value = localStorage["destination.address"];

	/* load doubleclick option */
	document.getElementById("controls.doubleclick").checked = localStorage["controls.doubleclick"] == "true";
	document.getElementById("controls.contextmenu").checked = localStorage["controls.contextmenu"] == "true";
	document.getElementById("controls.accelerator").checked = localStorage["controls.accelerator"] == "true";

	/* load accelerator */
	accelerator = {
			alt: localStorage["accelerator.alt"] == "true",
			ctrl: localStorage["accelerator.ctrl"] == "true",
			shift: localStorage["accelerator.shift"] == "true",
			key: localStorage["accelerator.key"]
		};
	writeAccelerator();

	/* load autostart option */
	document.getElementById("other.autostart").checked = localStorage["other.autostart"] == "true";
}


var father;
function tooltipon(id, tip) {
	var tooltipImg = document.getElementById(id);

	var tooltipSeta = document.createElement("img");
	tooltipSeta.setAttribute("id", "tooltipseta");
	tooltipSeta.src = "png/seta.png";

	var tooltipDiv = document.createElement("div");
	tooltipDiv.setAttribute("id", "tooltipdiv");

	var pos = getElementAbsolutePosition(tooltipImg);
	pos.x = pos.x + tooltipImg.clientWidth;
	pos.y = pos.y;

	tooltipSeta.style.position = "fixed";
	tooltipSeta.style.left = pos.x + "px";
	tooltipSeta.style.top = pos.y + "px";

	tooltipDiv.style.position = "fixed";
	tooltipDiv.style.left = (pos.x + tooltipSeta.width) + "px";
	tooltipDiv.style.top = (pos.y - 10) + "px";

	tooltipDiv.innerHTML = tip;

	father = document.getElementById("total");
	father.appendChild(tooltipSeta);
	father.appendChild(tooltipDiv);
}

function tooltipoff() {
	father.removeChild(document.getElementById("tooltipdiv"));
	father.removeChild(document.getElementById("tooltipseta"));
}

function getElementAbsolutePosition(element) {
	var pos = { x: 0, y: 0 };
	while(element != null) {
		pos.x += element.offsetLeft;
		pos.y += element.offsetTop;
		element = element.offsetParent;
	}

	return pos;
}
