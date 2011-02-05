
/* temporary variables (to permit saving only on button "Save") */
var accelerator = {};

/* accelerator saving callback. saves only to temporary variables */
function setAccelerator(event) {
	event.preventDefault(); /* prevents writing to the text field */
	accelerator = {
			alt: event.altKey,
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			key: event.keyCode
		};
	writeAccelerator();
}

/* writes accelerator in text form to the appropriate field */
function writeAccelerator() {
	document.getElementById("accelerator").value = accelerator.alt ? "ALT " : "";
	document.getElementById("accelerator").value += accelerator.ctrl ? "CTRL " : "";
	document.getElementById("accelerator").value += accelerator.shift ? "SHIFT " : "";
	document.getElementById("accelerator").value += String.fromCharCode(accelerator.key);
}

/* save options to local storage */
function save_options() {
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
	localStorage["controls.doubleclick"] = document.getElementById("controls.doubleclick").checked;
	localStorage["controls.contextmenu"] = document.getElementById("controls.contextmenu").checked;
	localStorage["controls.accelerator"] = document.getElementById("controls.accelerator").checked;

	/* save accelerator keys */
	localStorage["accelerator.alt"] = accelerator.alt;
	localStorage["accelerator.ctrl"] = accelerator.ctrl;
	localStorage["accelerator.shift"] = accelerator.shift;
	localStorage["accelerator.key"] = accelerator.key;

	/* save autostart option */
	localStorage["other.autostart"] = document.getElementById("other.autostart").checked;

	alert("Done!\nEffective on new/reloaded tabs.");
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

