function activate_cc_m2(){
	if(crafty_cfg.enabled){
		var cfg = {
			id: "",
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
			dom: {},
			sort_fields: {
				active: true,
				parent: 'div.admin__field',
				/*	special structure workaround.
					can't move easily the street objects (special parent?!)
					Use company to move country up to a proper position & leave the rest as usual
				*/
				custom_order: ['company', 'country', 'company', 'postcode']
			},
			search_type: crafty_cfg.searchbar_type,
			hide_fields: crafty_cfg.hide_fields,
			auto_search: crafty_cfg.auto_search,
			clean_postsearch: crafty_cfg.clean_postsearch,
			only_uk: true,
			search_wrapper: {
				before: '<div class="admin__field"><label class="admin__field-label">'+crafty_cfg.txt.search_label+'</label><div class="admin__field-control">',
				after: '</div></div>'
			},
			txt: crafty_cfg.txt,
			error_msg: crafty_cfg.error_msg
		};
		var dom = {
			company:	'[name$="[company]"]',
			address_1:	'[name$="[street][0]"]',
			address_2:	'[name$="[street][1]"]',
			postcode:	'[name$="[postcode]"]',
			town:		'[name$="[city]"]',
			county:		'[name$="[region]"]',
			county_list:'select[name$="[region_id]"]',
			country:	'select[name$="[country_id]"]'
		};
		// special for admin panel: search each potential element
		var postcode_elements = jQuery(dom.postcode);
		postcode_elements.each(function(index){
			if(postcode_elements.eq(index).data('cc') != '1'){
				var active_cfg = {};
				jQuery.extend(active_cfg, cfg);
				active_cfg.id = "m2_"+cc_index;
				var form = postcode_elements.eq(index).closest('fieldset');
				cc_index++;
				active_cfg.dom = {
					company:		form.find(dom.company),
					address_1:		form.find(dom.address_1),
					address_2:		form.find(dom.address_2),
					postcode:		postcode_elements.eq(index),
					town:			form.find(dom.town),
					county:			form.find(dom.county),
					county_list:	form.find(dom.county_list),
					country:		form.find(dom.country)
				};
				active_cfg.dom.postcode.data('cc','1');
				var cc_generic = new cc_ui_handler(active_cfg);
				cc_generic.activate();
			}
		});
	}
}

var cc_index = 0;
requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(crafty_cfg.enabled){
			setInterval(activate_cc_m2,200);
		}
	});
});
