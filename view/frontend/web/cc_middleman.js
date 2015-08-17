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
	var uk_sort_order = ['country', 'postcode', 'company', 'address_1', 'town', 'county', 'county_list'];
	var other_sort_order = ['country', 'company', 'address_1', 'town', 'county', 'county_list', 'postcode'];
	if(is_uk){
		for(var i=0; i<uk_sort_order.length - 1; i++){
			this.sortTool(elems[uk_sort_order[i]], elems[uk_sort_order[i+1]]);
		}
	} else {
		for(var i=0; i<other_sort_order.length - 1; i++){
			this.sortTool(elems[other_sort_order[i]], elems[other_sort_order[i+1]]);
		}
	}
	var country = elems['country'].parents(this.cfg.sort_fields.parent).last();
	var searchContainer = this.search_object.parents(this.cfg.sort_fields.parent).last();
	country.after(searchContainer);

	if(this.cfg.hide_fields){
		for(var i=0; i<uk_sort_order.length; i++){
			elems[uk_sort_order[i]].parents(this.cfg.sort_fields.parent).last().addClass('crafty_address_field');
		}
	}
}
cc_ui_handler.prototype.sortTool = function(a,b){
	var a_holder = a.parents(this.cfg.sort_fields.parent).last();
	var b_holder = b.parents(this.cfg.sort_fields.parent).last();
	a_holder.after(b_holder);
}
cc_ui_handler.prototype.country_change = function(country){

	var active_countries = ['GB','IM','JE','GY'];
	if(active_countries.indexOf(country) != -1){
		if(this.cfg.sort_fields.active){
			this.sort(true);
			this.search_object.parents(this.cfg.sort_fields.parent).last().show();
		}
	} else {
		if(this.cfg.sort_fields.active){
			this.sort(false);
			this.search_object.parents(this.cfg.sort_fields.parent).last().hide();
		}
	}
	if(this.cfg.hide_fields && (active_countries.indexOf(country) != -1) && (this.cfg.dom.postcode.val() == "")){
		jQuery('.crafty_address_field').hide();
	}
}

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
}

cc_ui_handler.prototype.addui = function(){
	// transfer object to event scope
	var that = this;
	// apply dom elements
	var html = '<div class="search-container" id="' + this.cfg.id + '">'
		+ '<div class="search-bar">'
			+ '<input class="search-box" type="text"placeholder="' + this.cfg.txt.search_placeholder + '">'
	//		+ '<div class="action">' + this.cfg.txt.search_buttontext + '</div>'
			+ '<div class="action"><div class="icon"></div></div>'
		+ '</div>'
		+ '<div class="search-list" style="display: none;">'
			+ '<ul>'
			+ '</ul>'
			+ '<div class="extra-info" style="display: none;"></div>'
		+ '</div>'
		+ '<div class="error"></div>'
	+ '</div>';
	/*
	switch(gfx_type){
		case "simple":
			html = '<div class="primary">'+
			'<button type="submit" class="action login primary" data-action="checkout-method-login"><span data-bind="text: $t(\'Login\')">Login</span></button>';
			'</div>';
			break;
	}*/
	if(typeof this.cfg.search_wrapper !== 'undefined'){
		html = this.cfg.search_wrapper.before + html + this.cfg.search_wrapper.after;
	}
	this.cfg.dom.country.parents(this.cfg.sort_fields.parent).last().after(html);

	// apply postcode lookup (by button)
	this.search_object = jQuery('.search-container#'+this.cfg.id);
	this.search_object.find('.action').on('click',function(){
		that.lookup(that.search_object.find('.search-box').val());
	});
	// apply hiding of list on input change && auto search
	this.search_object.find('.search-box').on('keyup',function(){
		that.search_object.find('.search-list').hide();
		that.search_object.find('.extra-info').hide();
		// apply auto search
		if(that.cfg.auto_search && (that.cc_core.clean_input(jQuery(this).val()) != null)){
			that.lookup(that.search_object.find('.search-box').val());
		}
	});
	this.icon_handler("search");

}

cc_ui_handler.prototype.lookup = function(postcode){
	this.icon_handler("work");

	var dataset = this.cc_core.search(postcode);
	if(typeof dataset.error_code != "undefined"){
		this.prompt_error(dataset.error_code);
		this.icon_handler("error");
		return;
	}
	var new_html = "";
	for(var i=0; i < dataset.delivery_point_count; i++){
		var elems = [];
		var endpoint = dataset.delivery_points[i];
		if(endpoint.department_name != "")
			elems.push(endpoint.department_name);
		if(endpoint.organisation_name != "")
			elems.push(endpoint.organisation_name);
		if(endpoint.line_1 != "")
			elems.push(endpoint.line_1);
		if(endpoint.line_2 != "")
			elems.push(endpoint.line_2);
		new_html += '<li data-id="'+i+'"><span style="font-weight: bold;">'+dataset.town+', </span><span style="font-style: italic;">' + elems.join(', ') + '</span></li>';
	}
	var search_list = this.search_object.find('.search-list');
	search_list.find('ul').html(new_html);
	search_list.show();

	this.search_object.find('.extra-info').html(dataset.town).show();
	var that = this;
	search_list.find('li').on('click',function(){
		that.select(postcode, jQuery(this).data('id'));
		search_list.hide();
	});

	this.search_object.on('focusout',function(){
		// give a tiny time for the on click event to trigger first
		setTimeout(function(){
			search_list.hide();
		}, 250);
	});

	this.icon_handler("search");
}
cc_ui_handler.prototype.prompt_error = function(errorcode){
	this.search_object.find('.error').html(this.cfg.error_msg[errorcode]);
}
cc_ui_handler.prototype.select = function(postcode, id){
	var dataset = this.cc_core.get_store(this.cc_core.clean_input(postcode));

	this.cfg.dom.town.val(dataset.town);
	this.cfg.dom.postcode.val(dataset.postcode);

	var company_details = [];
	if(dataset.delivery_points[id].department_name != ""){
		company_details.push(dataset.delivery_points[id].department_name);
	}
	if(dataset.delivery_points[id].organisation_name != ""){
		company_details.push(dataset.delivery_points[id].organisation_name);
	}

	this.cfg.dom.company.val(company_details.join(', '));

	for(var i=1; i<=this.cfg.core.lines; i++){
		this.cfg.dom["address_"+i].val(dataset.delivery_points[id]["line_"+i]);
	}

	if(this.cfg.hide_fields){
		jQuery('.crafty_address_field').show();
	}
	if(this.cfg.clean_postsearch){
		this.search_object.find('.search-box').val('');
	}
	// trigger change for checkout validation
	jQuery.each(this.cfg.dom, function(index, name){
		name.trigger('change');
	});
}
cc_ui_handler.prototype.icon_handler = function(state){
	var icon = this.search_object.find('.icon');
	switch(state){
		case "search":
			icon.html(cc_svg_store("icon_search","white"));
			icon.removeClass('spin');
			break;
		case "work":
			icon.html(cc_svg_store("icon_work","white"));
			icon.addClass('spin');
			break;
		case "error":
			icon.hide();
			icon.html(cc_svg_store("icon_error","white"));
			icon.removeClass('spin');
			icon.fadeIn(400,function(){
				icon.fadeOut(400, function(){
					icon.html(cc_svg_store("icon_search","white"));
					icon.show();
				});
			});
			break;
	}
}
