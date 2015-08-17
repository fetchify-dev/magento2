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
	var uk_sort_order = ['country', 'postcode', 'company', 'address_1', 'town', 'county'];
	var other_sort_order = ['country', 'company', 'address_1', 'town', 'county', 'postcode'];
	if(is_uk){
		for(var i=0; i<uk_sort_order.length - 1; i++){
			this.sortTool(elems[uk_sort_order[i]], elems[uk_sort_order[i+1]]);
		}
	} else {
		for(var i=0; i<other_sort_order.length - 1; i++){
			this.sortTool(elems[other_sort_order[i]], elems[other_sort_order[i+1]]);
		}
	}
	var country = jQuery('[name="'+elems['country']+'"]').parents(this.cfg.sort_fields.parent).last();
	var searchContainer = this.search_object.parents(this.cfg.sort_fields.parent).last();
	country.after(searchContainer);

	if(this.cfg.hide_fields){
		for(var i=0; i<uk_sort_order.length; i++){
			jQuery('[name="'+elems[uk_sort_order[i]]+'"]').parents(this.cfg.sort_fields.parent).last().addClass('crafty_address_field');
		}
	}
}
cc_ui_handler.prototype.sortTool = function(a,b){
	var a_holder = jQuery('[name="'+a+'"]').parents(this.cfg.sort_fields.parent).last();
	var b_holder = jQuery('[name="'+b+'"]').parents(this.cfg.sort_fields.parent).last();
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
	if(this.cfg.hide_fields && (active_countries.indexOf(country) != -1) && (jQuery('[name="'+this.cfg.dom.postcode+'"]').val() == "")){
		jQuery('.crafty_address_field').hide();
	}
}

cc_ui_handler.prototype.activate = function(){
	this.addui();
	if(this.cfg.only_uk){
		this.country_change(jQuery('[name="'+this.cfg.dom.country+'"]').val());
		// transfer object to event scope
		var that = this;
		jQuery('[name="'+this.cfg.dom.country+'"]').on('change',function(){
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
	this.container_id = 'cc_275';
	var html = '<div class="search-container" id="'+this.container_id+'">'+
	'<div class="search-bar">'+
	'	<input class="search-box" type="text"placeholder="'+this.cfg.txt.search_placeholder+'">'+
	'	<div class="action">'+ this.cfg.txt.search_buttontext+'</div>'+
	'</div>'+
	'<ul class="search-list" style="display: none;">'+
	'</ul>'+
	'<div class="extra-info" style="display: none;"></div>';
	'<div class="error"></div>'+
	'</div>';
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
	jQuery('[name="'+this.cfg.dom.country+'"]').parents(this.cfg.sort_fields.parent).last().after(html);
	// apply postcode lookup (by button)
	this.search_object = jQuery('.search-container#'+this.container_id);
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

}

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
		if(endpoint.department_name != "")
			elems.push(endpoint.department_name);
		if(endpoint.organisation_name != "")
			elems.push(endpoint.organisation_name);
		if(endpoint.line_1 != "")
			elems.push(endpoint.line_1);
		if(endpoint.line_2 != "")
			elems.push(endpoint.line_2);
		new_html += '<li data-id="'+i+'">' + elems.join(', ') + '</li>';
	}
	var search_list = this.search_object.find('.search-list');
	search_list.html(new_html);
	search_list.show();

	this.search_object.find('.extra-info').html(dataset.town).show();
	var that = this;
	search_list.find('li').on('click',function(){
		that.select(postcode, jQuery(this).data('id'));
		search_list.hide();
		that.search_object.find('.extra-info').hide();
	});
}
cc_ui_handler.prototype.prompt_error = function(errorcode){
	this.search_object.find('.error').html(this.cfg.error_msg[errorcode]);
}
cc_ui_handler.prototype.select = function(postcode, id){
	var dataset = this.cc_core.get_store(this.cc_core.clean_input(postcode));

	jQuery('[name="'+this.cfg.dom.town+'"]').val(dataset.town);
	jQuery('[name="'+this.cfg.dom.postcode+'"]').val(dataset.postcode);

	var company_details = [];
	if(dataset.delivery_points[id].department_name != ""){
		company_details.push(dataset.delivery_points[id].department_name);
	}
	if(dataset.delivery_points[id].organisation_name != ""){
		company_details.push(dataset.delivery_points[id].organisation_name);
	}

	jQuery('[name="'+this.cfg.dom.company+'"]').val(company_details.join(', '));

	for(var i=1; i<=this.cfg.core.lines; i++){
		jQuery('[name="'+this.cfg.dom["address_"+i]+'"]').val(dataset.delivery_points[id]["line_"+i]);
	}

	if(this.cfg.hide_fields){
		jQuery('.crafty_address_field').show();
	}
	if(this.cfg.clean_postsearch){
		this.search_object.find('.search-box').val('');
	}
}

var cc_activate_flags = [];
function activate_cc_m2(){
	if(crafty_cfg.enabled){
		var cfg = {
			core: {
				key: crafty_cfg.key,
				preformat: true,
				capsformat: {
					address: true,
					organization: true,
					county: true,
					town: true
				}
			},
			dom: {
				company:	"billingAddress[company]",
				address_1:	"billingAddress[street][0]",
				address_2:	"billingAddress[street][1]",
				postcode:	"billingAddress[postcode]",
				town:		"billingAddress[city]",
				county:		"billingAddress[region_id]",
				country:	"billingAddress[country_id]"
			},
			sort_fields: {
				active: true,
				parent: 'div.field:not(.additional)'
			},
			hide_fields: crafty_cfg.hide_fields,
			auto_search: crafty_cfg.auto_search,
			clean_postsearch: crafty_cfg.clean_postsearch,
			only_uk: true,
			search_wrapper: {
				before: '<div class="field"><label class="label">Address Lookup</label><div class="control">',
				after: '</div></div>'
			},
			txt: crafty_cfg.txt,
			error_msg: crafty_cfg.error_msg
		}
		if(cc_activate_flags.indexOf('m2_billing') == -1 && jQuery('input[name="'+cfg.dom.postcode+'"]').length == 1){
			cc_activate_flags.push('m2_billing');
			var cc = new cc_ui_handler(cfg);
			cc.activate();
		}
	}
}

requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		setInterval(activate_cc_m2,200);
	});
});
