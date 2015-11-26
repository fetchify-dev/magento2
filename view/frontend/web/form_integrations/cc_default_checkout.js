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
			/*
			searchbar_gfx: {
				bg:		{
					color: crafty_cfg.search_bg_color,
					type: crafty_cfg.search_bg
				},
				icon:	{
					color: crafty_cfg.search_icon_color,
					type: crafty_cfg.search_icon
				}
			},
			*/
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
		/*
		var billing_dom = {
			company:	jQuery("[name='billingAddresscheckmo[company]']"),
			address_1:	jQuery("[name='billingAddresscheckmo[street][0]']"),
			address_2:	jQuery("[name='billingAddresscheckmo[street][1]']"),
			postcode:	jQuery("[name='billingAddresscheckmo[postcode]']"),
			town:		jQuery("[name='billingAddresscheckmo[city]']"),
			county:		jQuery("[name='billingAddresscheckmo[region]']"),
			county_list:jQuery("[name='billingAddresscheckmo[region_id]']"),
			country:	jQuery("[name='billingAddresscheckmo[country_id]']")
		};*/
		dom = {
			company:	jQuery("[name='company']"),
			address_1:	jQuery("[name='street[0]']"),
			address_2:	jQuery("[name='street[1]']"),
			postcode:	jQuery("[name='postcode']"),
			town:		jQuery("[name='city']"),
			county:		jQuery("[name='region']"),
			county_list:jQuery("[name='region_id']"),
			country:	jQuery("[name='country_id']")
		};
		dom.postcode.each(function(index){
			if(dom.postcode.eq(index).data('cc') != '1'){
				cfg.id = "m2_"+cc_index;
				cc_index++;
				cfg.dom = {
					company:		dom.company.eq(index),
					address_1:		dom.address_1.eq(index),
					address_2:		dom.address_2.eq(index),
					postcode:		dom.postcode.eq(index),
					town:			dom.town.eq(index),
					county:			dom.county.eq(index),
					county_list:	dom.county_list.eq(index),
					country:		dom.country.eq(index)
				};
				cfg.dom.postcode.data('cc','1');
				var cc_generic = new cc_ui_handler(cfg);
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
