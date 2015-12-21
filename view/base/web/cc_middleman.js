/**
 * Lets define the CraftyClicks Constructor
 * @cfg {object} containing base configurations.
 */

function cc_ui_handler(cfg){
	//console.log(cfg);
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
	var postcode = elems.postcode.parents(this.cfg.sort_fields.parent).last();
	country.insertBefore(company);
	var searchContainer = {};
	if(this.cfg.search_type != 'traditional'){
		searchContainer = this.search_object.parents(this.cfg.sort_fields.parent).last();
		country.after(searchContainer);
	} else {
		searchContainer = this.search_object;
		country.after(searchContainer);
	}

	if(this.cfg.hide_fields){
		var tagElement = [];
		if(this.cfg.search_type != 'traditional'){
			tagElement = ['postcode', 'company', 'address_1', 'town', 'county', 'county_list'];
		} else {
			tagElement = ['company', 'address_1', 'town', 'county', 'county_list'];
		}
		for(var i=0; i < tagElement.length; i++){
			elems[tagElement[i]].parents(this.cfg.sort_fields.parent).last().addClass('crafty_address_field');
		}
	}
};
/*
cc_ui_handler.prototype.sortTool = function(a,b){
	var a_holder = a.parents(this.cfg.sort_fields.parent).last();
	var b_holder = b.parents(this.cfg.sort_fields.parent).last();
	a_holder.after(b_holder);
}*/
cc_ui_handler.prototype.country_change = function(country){

	var active_countries = ['GB','IM','JE','GY'];
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
		this.search_object.closest(this.cfg.sort_fields.parent).parent().find('.crafty_address_field').hide();
	} else {
		this.search_object.closest(this.cfg.sort_fields.parent).parent().find('.crafty_address_field').show();
	}
};

cc_ui_handler.prototype.activate = function(){
	this.addui();
	if(this.cfg.only_uk){
		this.country_change(this.cfg.dom.country.val());
		// transfer object to event scope
		var that = this;
		this.cfg.dom.country.on('change',function(){
			// selected country
			var sc = jQuery(this).val();
			that.country_change(sc);
		});
	}
};

cc_ui_handler.prototype.addui = function(){
	// transfer object to event scope
	var that = this;
	// apply dom elements
	var html = '';
	switch(this.cfg.search_type){
		case "searchbar_text":
			html = '<div class="search-container type_2" id="' + this.cfg.id + '">'
				+ '<div class="search-bar">'
					+ '<input class="search-box" type="text" placeholder="' + this.cfg.txt.search_placeholder + '">'
					+ '<button type="button" class="action primary">'
					+ '<span>Find Address</span></button>'
				+ '</div>'
				+ '<div class="search-list" style="display: none;">'
					+ '<ul>'
					+ '</ul>'
					+ '<div class="extra-info" style="display: none;"><div class="search-subtext"></div></div>'
				+ '</div>'
				+ '<div class="mage-error" generated><div class="search-subtext"></div></div>'
			+ '</div>';
		break;
	}

	if(this.cfg.search_type != 'traditional' && typeof this.cfg.search_wrapper !== 'undefined'){
		html = this.cfg.search_wrapper.before + html + this.cfg.search_wrapper.after;
	}
	if(this.cfg.search_type != 'traditional'){
		this.cfg.dom.country.parents(this.cfg.sort_fields.parent).last().after(html);
	} else {
		// input after postcode
		var postcode_elem = this.cfg.dom.postcode;
		postcode_elem.wrap('<div class="search-bar"></div>');
		postcode_elem.addClass('search-box');
		postcode_elem.after('<button type="button" class="action primary">'
					+ '<span>Find Address</span></button>');
		var new_container = postcode_elem.closest(this.cfg.sort_fields.parent);
		new_container.addClass('search-container').attr('id',this.cfg.id).addClass('type_3');
		// add search list
		postcode_elem.closest('.search-bar').after('<div class="search-list" style="display: none;">'
							+ '<select></select>'
						+ '</div>'
						+ '<div class="mage-error" generated><div class="search-subtext"></div></div>');
	}

	// apply postcode lookup (by button)
	this.search_object = jQuery('.search-container[id="'+this.cfg.id+'"]');
	this.search_object.find('.action').on('click',function(){
		that.lookup(that.search_object.find('.search-box').val());
	});
	// apply hiding of list on input change && auto search
	this.search_object.find('.search-box').on('keyup',function(){
		that.search_object.find('.search-list').hide();
		that.search_object.find('.extra-info').hide();

		that.search_object.find('.mage-error').hide();

		if(that.cfg.search_type != 'traditional'){
			// apply auto search
			if(that.cfg.auto_search && (that.cc_core.clean_input(jQuery(this).val()) !== null)){
				that.lookup(that.search_object.find('.search-box').val());
			}
		}
	});

};

cc_ui_handler.prototype.lookup = function(postcode){
	var dataset = this.cc_core.search(postcode);
	if(typeof dataset.error_code != "undefined"){
		this.prompt_error(dataset.error_code);
		return;
	}
	var new_html = "";
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
		if(this.cfg.search_type != 'traditional'){
			new_html += '<li data-id="'+i+'"><span style="font-weight: bold;">'+dataset.town+', </span><span style="font-style: italic;">' + elems.join(', ') + '</span></li>';
		} else {
			new_html += '<option data-id="'+i+'">'+dataset.town+', ' + elems.join(', ') + '</option>';
		}
	}
	var search_list = this.search_object.find('.search-list');
	if(this.cfg.search_type != 'traditional'){
		search_list.find('ul').html(new_html);
	} else {
		search_list.find('select').html('<option>Select Your Address</option>'+new_html);
	}
	search_list.show();

	this.search_object.find('.extra-info .search-subtext').html(dataset.town);
	this.search_object.find('.extra-info').show();
	var that = this;

	if(this.cfg.search_type != 'traditional'){
		search_list.find('li').on('click',function(){
			that.select(postcode, jQuery(this).data('id'));
			search_list.hide();
		});
	} else {
		search_list.find('select').off('change');
		search_list.find('select').on('change',function(){
			that.select(postcode, jQuery(this).find('option:selected').data('id'));
			search_list.hide();
		});
	}

	if(that.cfg.search_type != 'traditional'){
		this.search_object.on('focusout',function(){
			// give a tiny time for the on click event to trigger first
			setTimeout(function(){
				search_list.hide();
			}, 250);
		});
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

	if(this.cfg.hide_fields){
		jQuery('.crafty_address_field').show();
	}
	if(this.cfg.search_type != 'traditional' && this.cfg.clean_postsearch){
		this.search_object.find('.search-box').val('');
	}
	// trigger change for checkout validation
	jQuery.each(this.cfg.dom, function(index, name){
		name.trigger('change');
	});
};
