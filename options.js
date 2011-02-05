
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
		writeAccelerator();
	}
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
	var showWarning = false;
	var fullRestart = false;

	/* save destination options */
	var dest = document.destinationForm.destination;
	for(var r = 0; r < dest.length; r++) {
		if(dest[r].checked) {
			localStorage["destination.type"] = dest[r].id;
			break;
		}
	}

	/* save "destinationPath" no matter what */
	localStorage["destination.path"] = document.getElementById("destination.path").value;

	/* enable/disable controls */
	var doubleclickSet = document.getElementById("controls.doubleclick").checked;
	var contextmenuSet = document.getElementById("controls.contextmenu").checked;
	var acceleratorSet = document.getElementById("controls.accelerator").checked;

	if((localStorage["controls.doubleclick"] == "true") != doubleclickSet) {
		showWarning = true;
		localStorage["controls.doubleclick"] = doubleclickSet;
	}
	if((localStorage["controls.contextmenu"] == "true") != contextmenuSet) {
		showWarning = true;
		fullRestart = true;
		localStorage["controls.contextmenu"] = contextmenuSet;
	}
	if((localStorage["controls.accelerator"] == "true") != acceleratorSet) {
		showWarning = true;
		localStorage["controls.accelerator"] = acceleratorSet;
	}

	/* save accelerator keys */
	if((localStorage["accelerator.alt"] == "true") != accelerator.alt) {
		showWarning = true;
		localStorage["accelerator.alt"] = accelerator.alt;
	}
	if((localStorage["accelerator.ctrl"] == "true") != accelerator.ctrl) {
		showWarning = true;
		localStorage["accelerator.ctrl"] = accelerator.ctrl;
	}
	if((localStorage["accelerator.shift"] == "true") != accelerator.shift) {
		showWarning = true;
		localStorage["accelerator.shift"] = accelerator.shift;
	}
	if(localStorage["accelerator.key"] != accelerator.key) {
		showWarning = true;
		localStorage["accelerator.key"] = accelerator.key;
	}

	/* save autostart option */
	localStorage["other.autostart"] = document.getElementById("other.autostart").checked;

	if(showWarning) {
		if(fullRestart) {
			alert("Changes will effect when the plugin is reloaded! (chrome restart)");
		}
		else {
			alert("Done!\nEffective on new/reloaded tabs.");
		}
	}
	else {
		alert("done!");
	}
}

/* load options from local storage */
function load_options() {
	/* load destination option */
	document.getElementById(localStorage["destination.type"]).checked = true;
	document.getElementById("destination.path").value = localStorage["destination.path"];

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


function tooltipon(id) {
	var tooltipImg = document.getElementById(id);
	var tooltipDiv = document.createElement("div");
	tooltipDiv.setAttribute("id", "tooltipdiv");

	var pos = getElementAbsolutePosition(tooltipImg);
	tooltipDiv.style.left = pos.x + tooltipImg.width;
	tooltipDiv.style.top = pos.y;

	tooltipDiv.innerHTML = tooltipImg.alt;
	document.body.appendChild(tooltipDiv);
}

function tooltipoff() {
	document.body.removeChild(document.getElementById("tooltipdiv"));
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
