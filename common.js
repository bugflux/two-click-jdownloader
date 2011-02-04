
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

