/**
 * Lets define the CraftyClicks Constructor
 * @cfg {object} containing base configurations.
 */

function cc_rapid(cfg){
	this.baseURL	= 'https://pcls1.craftyclicks.co.uk/json/rapidaddress';
	this.key		= cfg.key;
	this.geocode	= cfg.geocode;
	if(typeof this.geocode == "undefined")
		this.geocode = false;
	this.alias		= cfg.alias;
	if(typeof this.alias == "undefined")
		this.alias = false;
	this.preformat	= cfg.preformat;
	if(typeof this.preformat == "undefined")
		this.preformat = false;
	this.capsformat = cfg.capsformat;
	if(typeof this.capsformat == "undefined")
		this.capsformat = {
			address : false,
			organization : false,
			county : false,
			town: false
		};
	// store previously retrieved datasets
	this.lines = cfg.lines;
	this.dataStore	= new Array();

}
/**
 * Fetches data from the api based on the configuration, and stores it.
 * Skips the lookup if the data is already looked up.
 * @return {object} the response data set.
 */


cc_rapid.prototype.search = function(input){
	// clean postcode
	var postcode = this.clean_input(input);
	if(postcode == null){
		return { error_code: "0002" };
	}
	var data = {};
	if(this.is_stored(postcode)){
		data = this.get_store(postcode);
	} else {
		data = this.fetch_data(postcode);
		if(typeof data.error_code == "undefined"){
			data = this.format_data(data);
		}
		this.store(postcode, data);
	}
	return data;
}
// gets data from storage
cc_rapid.prototype.get_store = function(postcode){
	//console.warn('retrieving data from store');
	return this.dataStore[postcode];
}
// adds data to storage
cc_rapid.prototype.store = function(postcode, object){
	this.dataStore[postcode] = object;
	//console.warn('data saved');
	return true;
}
// checks if postcode related data is already stored
cc_rapid.prototype.is_stored = function(postcode){
	return this.dataStore.hasOwnProperty(postcode);
}
// gets data from craftyclicks API
cc_rapid.prototype.fetch_data = function(postcode){
	// Set up the URL
	var url = this.baseURL + '?key=' + this.key + '&postcode=' + postcode;
	url += '&sort=asc';
	if(this.preformat){
		url += '&response=data_formatted';
		url += '&lines='+this.lines;
	}

	// Create new XMLHttpRequest, has to be synchronous so we can handle response
	request = new XMLHttpRequest();
	request.open('GET', url, false);

	// Wait for change and then either JSON parse response text or throw exception for HTTP error
	request.onreadystatechange = function() {
		if (this.readyState === 4){
			if (this.status >= 200 && this.status < 400){
				// Success!
				data = JSON.parse(this.responseText);
				//console.log(data);
			} else {
				data = { error_code: "0004" };
			}
		}
	};
	// Send request
	try{
		request.send();
	}
	catch(err){
		data = { error_code: "0003" };
	}
	// Nullify request object
	request = null;
	return data;
}
// formatting text from capital to leading caps based on cfg
cc_rapid.prototype.format_data = function(data){
	if(this.capsformat.county){
		data.postal_county = this.leading_caps(data.postal_county);
		data.traditional_county = this.leading_caps(data.traditional_county);
	}
	if(this.capsformat.town){
		data.town = this.leading_caps(data.town);
	}
	if(this.preformat){
		for(var i=0; i<data.delivery_point_count; i++){
			if(this.capsformat.address){
				data.delivery_points[i].line_1 = this.leading_caps(data.delivery_points[i].line_1);
				data.delivery_points[i].line_2 = this.leading_caps(data.delivery_points[i].line_2);
			}
			if(this.capsformat.organization){
				data.delivery_points[i].organisation_name = this.leading_caps(data.delivery_points[i].organisation_name);
			}
		}
	}
	return data;
}

// leading caps transformation
cc_rapid.prototype.leading_caps = function(txt){
	if (2 > txt.length) { return (txt) }
	var out_text = '';
	var words = txt.split(" ");
	for (var i=0; i<words.length; i++) {	// each word in turn
		var word = this.str_trim(words[i]);
		if ('' != word)	{
			if ('' != out_text)	{
				out_text = out_text + ' ';
			}
			out_text = out_text + this.cp_uc(word);
		}
	}
	return (out_text);
}
// simple trim functionality
cc_rapid.prototype.str_trim = function(s){
	var l=0;
	var r=s.length -1;
	while(l < s.length && s[l] == ' ') { l++; }
	while(r > l && s[r] == ' ') { r-=1;	}
	return s.substring(l, r+1);
}

cc_rapid.prototype.cp_uc = function(text) {
	if ("PC" == text || "UK" == text || "EU" == text) {return (text);}
	var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var out_text = '';
	var do_uc = 1;
	var all_uc = 0;
	for (var i=0; i<text.length; i++){
		if (-1 != alpha.indexOf(text.charAt(i))) {
			if (do_uc || all_uc) {
				out_text = out_text + text.charAt(i);
				do_uc = 0;
			} else {
				out_text = out_text + text.charAt(i).toLowerCase();
			}
		} else {
			out_text = out_text + text.charAt(i);
			if (i+2 >= text.length && "'" == text.charAt(i)) { // only one more char left, don't capitalise
				do_uc = 0;
			} else if ("(" == text.charAt(i)) {
				close_idx = text.indexOf(")",i+1);
				if (i+3 < close_idx) { // more than 2 chars
					all_uc = 0; do_uc = 1;
				} else { // no closing bracket or 2 or les chars in brackets, leave uppercase
					all_uc = 1;
				}
			} else if (")" == text.charAt(i)) {
				all_uc = 0; do_uc = 1;
			} else if ("-" == text.charAt(i)) {
				close_idx = text.indexOf("-",i+1);
				if ((-1 != close_idx && i+3 >= close_idx) || i+3 >= text.length) { // less than 2 chars
					all_uc = 0; do_uc = 0;
				} else { // 2 or more chars
					all_uc = 0; do_uc = 1;
				}
			} else if (i+2 < text.length && "0" <= text.charAt(i) && "9" >= text.charAt(i)) {
				do_uc = 0;
			} else {
				do_uc = 1;
			}
		}
	}
	return (out_text);
}
// cleaning the postcode input for all caps no space version
cc_rapid.prototype.clean_input = function(dirty_pc){
	// first strip out anything not alphanumenric
	var pc = '';
	do {
		pc = dirty_pc;
		dirty_pc = dirty_pc.replace(/[^A-Za-z0-9]/, "");
	} while (pc != dirty_pc);
	pc = dirty_pc.toUpperCase();
	// check if we have the right length with what is left
	if (7 >= pc.length && 5 <= pc.length) {
		// get the in code
		var inc = pc.substring(pc.length-3,pc.length);
		// get the out code
		var outc = pc.substring(0, pc.length-3);
		// now validate both in and out codes
		if (true == /[CIKMOV]/.test(inc)) {
			return null;
		}
		// inCode must be NAA
		if ( '0' <= inc.charAt(0) && '9' >= inc.charAt(0) &&
			 'A' <= inc.charAt(1) && 'Z' >= inc.charAt(1) &&
			 'A' <= inc.charAt(2) && 'Z' >= inc.charAt(2) ) {
			// outcode must be one of AN, ANN, AAN, ANA, AANN, AANA
			switch (outc.length) {
				case 2: // AN
					if ('A' <= outc.charAt(0) && 'Z' >= outc.charAt(0) &&
						'0' <= outc.charAt(1) && '9' >= outc.charAt(1) ) { return (pc); }
					break;
				case 3: // ANN, AAN, ANA
					if ('A' <= outc.charAt(0) && 'Z' >= outc.charAt(0)) {
						if ('0' <= outc.charAt(1) && '9' >= outc.charAt(1) &&
							'0' <= outc.charAt(2) && '9' >= outc.charAt(2) ) { return (pc); }
						else if ('A' <= outc.charAt(1) && 'Z' >= outc.charAt(1) &&
								 '0' <= outc.charAt(2) && '9' >= outc.charAt(2) ) { return (pc); }
						else if ('0' <= outc.charAt(1) && '9' >= outc.charAt(1) &&
								 'A' <= outc.charAt(2) && 'Z' >= outc.charAt(2) ) { return (pc); }
					}
					break;
				case 4: // AANN, AANA
					if ('A' <= outc.charAt(0) && 'Z' >= outc.charAt(0) &&
						'A' <= outc.charAt(1) && 'Z' >= outc.charAt(1) &&
						'0' <= outc.charAt(2) && '9' >= outc.charAt(2)) {
						if ('0' <= outc.charAt(3) && '9' >= outc.charAt(3) ) { return (pc); }
						else if ('A' <= outc.charAt(3) && 'Z' >= outc.charAt(3) ) { return (pc); }
					}
					break;
				default:
					break;
			}
		}
	}
	return null;
}
