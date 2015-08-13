
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
		}
		var billing_dom = {
			company:	jQuery("[name='billingAddresscheckmo[company]']"),
			address_1:	jQuery("[name='billingAddresscheckmo[street][0]']"),
			address_2:	jQuery("[name='billingAddresscheckmo[street][1]']"),
			postcode:	jQuery("[name='billingAddresscheckmo[postcode]']"),
			town:		jQuery("[name='billingAddresscheckmo[city]']"),
			county:		jQuery("[name='billingAddresscheckmo[region]']"),
			county_list:jQuery("[name='billingAddresscheckmo[region_id]']"),
			country:	jQuery("[name='billingAddresscheckmo[country_id]']")
		};
		var shipping_dom = {
			company:	jQuery("[name='shippingAddress[company]']"),
			address_1:	jQuery("[name='shippingAddress[street][0]']"),
			address_2:	jQuery("[name='shippingAddress[street][1]']"),
			postcode:	jQuery("[name='shippingAddress[postcode]']"),
			town:		jQuery("[name='shippingAddress[city]']"),
			county:		jQuery("[name='shippingAddress[region]']"),
			county_list:jQuery("[name='shippingAddress[region_id]']"),
			country:	jQuery("[name='shippingAddress[country_id]']")
		};
		cfg.dom = billing_dom;
		cfg.id = "m2_billing";
		if(cc_activate_flags.indexOf(cfg.id) == -1 && cfg.dom.postcode.length == 1){
			cc_activate_flags.push(cfg.id);
			var cc_billing = new cc_ui_handler(cfg);
			cc_billing.activate();
		}
		cfg.dom = shipping_dom;
		cfg.id = "m2_shipping";
		if(cc_activate_flags.indexOf(cfg.id) == -1 && cfg.dom.postcode.length == 1){
			cc_activate_flags.push(cfg.id);
			var cc_shipping = new cc_ui_handler(cfg);
			cc_shipping.activate();
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
