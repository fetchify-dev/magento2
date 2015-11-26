
var cc_attached = [];
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
		var address_dom = {
			company:	jQuery("[name$='[company]']"),
			address_1:	jQuery("[name$='[street][0]']"),
			address_2:	jQuery("[name$='[street][1]']"),
			postcode:	jQuery("[name$='[postcode]']"),
			town:		jQuery("[name$='[city]']"),
			county:		jQuery("[name$='[region]']"),
			county_list:jQuery("select[name$='[region_id]']"),
			country:	jQuery("select[name$='[country_id]']")
		};
		// special for admin panel: search each potential element
		address_dom.postcode.each(function(index){
			// different tagging method; tag object as active
			if(jQuery(this).data('cc') != 'active'){
				cfg.dom = {
					company:	jQuery(jQuery("[name$='[company]']")[index]),
					address_1:	jQuery(jQuery("[name$='[street][0]']")[index]),
					address_2:	jQuery(jQuery("[name$='[street][1]']")[index]),
					postcode:	jQuery(jQuery("[name$='[postcode]']")[index]),
					town:		jQuery(jQuery("[name$='[city]']")[index]),
					county:		jQuery(jQuery("[name$='[region]']")[index]),
					county_list:jQuery(jQuery("select[name$='[region_id]']")[index]),
					country:	jQuery(jQuery("select[name$='[country_id]']")[index])
				};
				jQuery(this).data('cc','active');
				console.log(cfg.dom);

				cfg.id = jQuery(this).attr('name');

				cc_attached.push(new cc_ui_handler(cfg));
				cc_attached[cc_attached.length - 1].activate();
			}
		});
	}
}

requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(crafty_cfg.enabled){
			setInterval(activate_cc_m2,200);
		}
	});
});
