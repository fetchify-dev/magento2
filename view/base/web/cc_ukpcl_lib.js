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

/**
 * Lets define the CraftyClicks Constructor
 * @cfg {object} containing base configurations.
 */

function cc_ui_handler(cfg){
	this.cfg = cfg;

	var lines = 0;
	if(typeof cfg.dom.address_1 !== "undefined"){
		lines++;
	}
	if(typeof cfg.dom.address_2 !== "undefined"){
		lines++;
	}
	if(typeof cfg.dom.address_3 !== "undefined"){
		lines++;
	}
	this.cfg.core.lines = lines;
	this.cc_core = new cc_rapid(this.cfg.core);
}
/**
 * Fetches data from the api based on the configuration, and stores it.
 * Skips the lookup if the data is already looked up.
 * @return {object} the response data set.
 */

cc_ui_handler.prototype.sort = function(is_uk){
	var elems = this.cfg.dom;
	var country = elems.country.parents(this.cfg.sort_fields.parent).last();
	// Sort disabled; position country on top
	var company = elems.company.parents(this.cfg.sort_fields.parent).last();
	var line_1 = elems.address_1.parents(this.cfg.sort_fields.parent).last();
	var postcode = elems.postcode.parents(this.cfg.sort_fields.parent).last();
	if (company.length) {
		country.insertBefore(company);
	}
	else {
		country.insertBefore(line_1);
	}
	var searchContainer = {};
		searchContainer = this.search_object;
	country.after(searchContainer);
	//IWD checkout - temporary ???
	if (jQuery('.crafty-results-container').length > 0) {
		searchContainer.after(searchContainer.closest('.fieldset').find('.crafty-results-container'));
	}

	if(this.cfg.hide_fields){
		var tagElement = [];
			tagElement = ['company', 'address_1', 'town', 'county', 'county_list'];

		for(var i=0; i < tagElement.length; i++){
			elems[tagElement[i]].parents(this.cfg.sort_fields.parent).last().addClass('crafty_address_field');
		}
	}
};

cc_ui_handler.prototype.country_change = function(country){

	var active_countries = ['GB','IM','JE','GG'];
	if(active_countries.indexOf(country) != -1){
		if(this.cfg.sort_fields.active){
			this.sort(true);
		}
		this.search_object.parents(this.cfg.sort_fields.parent).last().show();

	} else {
		if(this.cfg.sort_fields.active){
			this.sort(false);
		}
		this.search_object.parents(this.cfg.sort_fields.parent).last().hide();
	}
	if(active_countries.indexOf(country) != -1){
		this.search_object.find('.search-bar .action').show();
	} else {
		this.search_object.find('.search-bar .action').hide();
	}
	if(this.cfg.hide_fields && (active_countries.indexOf(country) != -1) && (this.cfg.dom.postcode.val() === "")){
		this.search_object.closest(this.cfg.sort_fields.parent).parent().find('.crafty_address_field').addClass('crafty_address_field_hidden');
	} else {
		this.search_object.closest(this.cfg.sort_fields.parent).parent().find('.crafty_address_field').removeClass('crafty_address_field_hidden');
	}
};

cc_ui_handler.prototype.activate = function(){
	this.addui();

	this.country_change(this.cfg.dom.country.val());
	// transfer object to event scope
	var that = this;
	this.cfg.dom.country.on('change',function(){
		// selected country
		var sc = jQuery(this).val();
		that.country_change(sc);
	});
};

cc_ui_handler.prototype.addui = function(){
	// transfer object to event scope
	var that = this;
	// apply dom elements
	var html = '';

	// apply postcode lookup (by button)
	this.search_object = jQuery('.search-container[id="'+this.cfg.id+'"]');
	this.search_object.find('.action').on('click',function(){
		that.lookup(that.search_object.find('.search-bar input').val());
	});
	// apply hiding of list on input change && auto search
	this.search_object.find('.search-bar input').on('keyup',function(){
		that.search_object.find('.search-list').hide();
		that.search_object.find('.extra-info').hide();
		that.search_object.find('.mage-error').hide();
	});
	this.cfg.ui = this.cfg.ui || {};

};

cc_ui_handler.prototype.lookup = function(postcode){
	var dataset = this.cc_core.search(postcode);
	if(typeof dataset.error_code != "undefined"){
		this.prompt_error(dataset.error_code);
		return;
	}
	var new_html = "";
	results = ['Select Your Address'];
	for(var i=0; i < dataset.delivery_point_count; i++){
		var elems = [];
		var endpoint = dataset.delivery_points[i];
		if(endpoint.department_name !== "")
			elems.push(endpoint.department_name);
		if(endpoint.organisation_name !== "")
			elems.push(endpoint.organisation_name);
		if(endpoint.line_1 !== "")
			elems.push(endpoint.line_1);
		if(endpoint.line_2 !== "")
			elems.push(endpoint.line_2);
		results.push(elems.join(', ')+', '+dataset.town);
	}
	this.cfg.ui.top_elem = this.cfg.ui.top_elem || 'form';
	var search_list = this.search_object.closest(this.cfg.ui.top_elem).find('.search-list');
	var default_select_builder = function(lines, search_list){
		var html = '';
		for(var i=0; i<lines.length; i++){
			html += '<option data-id="'+i+'">'+lines[i]+'</option>';
		}
		search_list.find('select').html(html);
		search_list.show();
	};
	var select_builder = this.cfg.ui.select_builder || default_select_builder;
	select_builder(results, search_list);

	this.search_object.find('.extra-info .search-subtext').html(dataset.town);
	this.search_object.find('.extra-info').show();
	var that = this;

	var default_select_triger = function(search_list, cc){
		search_list.find('select').off('change');
		search_list.find('select').on('change',function(){
			var id = jQuery(this).find('option:selected').data('id');
			if(id != 0){ // not "select address below"
				cc.select(postcode, id - 1);
				search_list.hide();
			}
		});
	};
	var select_trigger = this.cfg.ui.select_trigger || default_select_triger;
	select_trigger(search_list, that);

	if(typeof this.cfg.ui.onResultSelected == 'function'){
		this.cfg.ui.onResultSelected();
	}
};

cc_ui_handler.prototype.prompt_error = function(error_code){
	if(!this.cfg.error_msg.hasOwnProperty(error_code)){
		// simplyfy complex error messages
		error_code = "0004";
	}
	this.search_object.find('.mage-error .search-subtext').html(this.cfg.error_msg[error_code]);
	this.search_object.find('.mage-error').show();
};
cc_ui_handler.prototype.countyFiller = function(element, county_value){
	if(element.tagName == 'SELECT'){
		var target_val = '';
		var options = element[0].getElementsByTagName('option');
		if(options.length){
			var found = 0;

			for(var i=0; i<options.length; i++){

				var option_content = options[i].innerHTML;
				var option_value = options[i].value;
				if(	(option_content !== '' && option_content == county_value) ||
					(option_value !== '' &&	option_value == county_value)		)
				{
					target_val = options[i].value;
					found++;
					break;
				}
			}
			if(!found){
				// longest common substring + most character match

				var matches = {
					rank: 0,
					ids: []
				};

				// iterate through all possible matches (longest common substring)
				for(var i=0; i<options.length; i++){
					var option_text = options[i].innerHTML;
					var highestRank = 0;

					var rankTable = [];
					for(var j=0; j<county_value.length; j++){
						rankTable[j] = [];

						for(var k=0; k < option_text.length; k++){
							if(county_value[j] == option_text[k]){
								if(j > 0 && k > 0){
									rankTable[j][k] = rankTable[j-1][k-1] + 1;
								} else {
									rankTable[j][k] = 1;
								}
								if(rankTable[j][k] > highestRank){
									highestRank = rankTable[j][k];
								}
							} else {
								rankTable[j][k] = 0;
							}
						}
					}
					// reset ids if new record
					if(matches.rank < highestRank){
						matches.rank = highestRank;
						matches.ids = [];
					}
					// if we're on the same rank, add new id
					if(matches.rank == highestRank){
						matches.ids.push(i);
					}
				}
				// end of reviewing every word with longest common string algorithm.
				if(matches.ids.length > 1){
					// check how many characters match in total
					var characterDifferences = function(a,b){
						var aTable = {};
						var bTable = {};
						// generate a list of each character's occurence in the string
						for(var i=0; i<a.length; i++){
							if(typeof aTable[a[i]] == 'undefined')
								aTable[a[i]] = 1;
							else {
								aTable[a[i]]++;
							}
						}
						for(var i=0; i<b.length; i++){
							if(typeof bTable[b[i]] == 'undefined')
								bTable[b[i]] = 1;
							else {
								bTable[b[i]]++;
							}
						}
						// compare occurances
						var totalScore = 0;
						var aKeys = Object.keys(aTable);
						for(var i=0; i<aKeys.length; i++){
							if(typeof bTable[aKeys[i]] == 'undefined'){
								totalScore += aTable[aKeys[i]];
							} else {
								totalScore += Math.abs(aTable[aKeys[i]] - bTable[aKeys[i]]);
								delete bTable[aKeys];
							}
						}
						var bKeys = Object.keys(bTable);
						for(var i=0; i<bKeys.length; i++){
							totalScore += bTable[bKeys[i]];
						}
						return totalScore;
					}
					// there are some options contesting!
					var charMatch = {
						id: 0,
						rank: 1000
					};
					for(var i=0; i<matches.ids.length; i++){
						var r = characterDifferences(options[matches.ids[i]].innerHTML, county_value);
						if(r<charMatch.rank){
							charMatch.rank = r;
							charMatch.id = i;
						}
					}
					target_val = options[matches.ids[charMatch.id]].value;

				} else {
					target_val = options[matches.ids[0]].value;
				}
			}
			element.val(target_val);
		}
	} else {
		element.val(county_value);
	}
}

cc_ui_handler.prototype.select = function(postcode, id){
	var dataset = this.cc_core.get_store(this.cc_core.clean_input(postcode));

	this.cfg.dom.town.val(dataset.town);
	this.cfg.dom.postcode.val(dataset.postcode);

	var company_details = [];
	if(dataset.delivery_points[id].department_name !== ""){
		company_details.push(dataset.delivery_points[id].department_name);
	}
	if(dataset.delivery_points[id].organisation_name !== ""){
		company_details.push(dataset.delivery_points[id].organisation_name);
	}

	this.cfg.dom.company.val(company_details.join(', '));

	for(var i=1; i<=this.cfg.core.lines; i++){
		this.cfg.dom["address_"+i].val(dataset.delivery_points[id]["line_"+i]);
	}
	var county_line = '';
	switch(this.cfg.county_data){
		case 'former_postal':
			county_line = dataset.postal_county;
			break;
		case 'traditional':
			county_line = dataset.traditional_county;
			break;
	}
	if(county_line != ''){
		this.countyFiller(this.cfg.dom.county, county_line)
		this.countyFiller(this.cfg.dom.county_list, county_line)
	}
	// Change country according to postcode
	if (typeof this.cfg.dom.country != 'undefined') {
		var crown_dependencies = ['GY', 'JE', 'IM'];
		var postcode_area = dataset.postcode.substring(0,2);
		switch(postcode_area) {
			case 'GY':
				if (this.cfg.dom.country.find('option[value="GG"]').length) {
					this.cfg.dom.country.val('GG');
				}
			break;
			case 'JE':
				if (this.cfg.dom.country.find('option[value="JE"]').length) {
					this.cfg.dom.country.val('JE');
				}
			break;
			case 'IM':
				if (this.cfg.dom.country.find('option[value="IM"]').length) {
					this.cfg.dom.country.val('IM');
				}
			break;
			default:
				this.cfg.dom.country.val('GB');
		}
	}
	if(this.cfg.hide_fields){
		jQuery('.crafty_address_field').removeClass('crafty_address_field_hidden');
	}
	// trigger change for checkout validation
	jQuery.each(this.cfg.dom, function(index, name){
		name.trigger('change');
	});
};
