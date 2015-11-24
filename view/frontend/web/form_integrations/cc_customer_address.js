
var cc_activate_flags = [];
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
				parent: 'div.field:not(.additional)'
			},
			search_type: crafty_cfg.searchbar_type,
			hide_fields: crafty_cfg.hide_fields,
			auto_search: crafty_cfg.auto_search,
			clean_postsearch: crafty_cfg.clean_postsearch,
			only_uk: true,
			search_wrapper: {
				before: '<div class="field"><label class="label">'+crafty_cfg.txt.search_label+'</label><div class="control">',
				after: '</div></div>'
			},
			txt: crafty_cfg.txt,
			error_msg: crafty_cfg.error_msg
		};
		var address_dom = {
			company:	jQuery("[name='company']"),
			address_1:	jQuery("#street_1"),
			address_2:	jQuery("#street_2"),
			postcode:	jQuery("[name='postcode']"),
			town:		jQuery("[name='city']"),
			county:		jQuery("[name='region']"),
			county_list:jQuery("[name='region_id']"),
			country:	jQuery("[name='country_id']")
		};
		cfg.dom = address_dom;
		cfg.id = "m2_address";
		if(cc_activate_flags.indexOf(cfg.id) == -1 && cfg.dom.postcode.length == 1){
			cc_activate_flags.push(cfg.id);
			var cc_billing = new cc_ui_handler(cfg);
			cc_billing.activate();
		}
	}
}

requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(crafty_cfg.enabled){
			setInterval(activate_cc_m2,200);
		}
	});
});
