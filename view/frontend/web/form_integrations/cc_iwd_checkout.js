function activate_cc_m2_uk(){
	if(c2a_config.postcodelookup.enabled){
		var cfg = {
			id: "",
			core: {
				key: c2a_config.main.key,
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
				parent: '.field:not(.additional)'
			},
			hide_fields: c2a_config.postcodelookup.hide_fields,
			txt: c2a_config.postcodelookup.txt,
			error_msg: c2a_config.postcodelookup.error_msg,
			county_data: c2a_config.postcodelookup.advanced.county_data,
		};
		var dom = {
			company:	'[name="company"]',
			address_1:	'[name="street[0]"]',
			address_2:	'[name="street[1]"]',
			postcode:	'[name="postcode"]',
			town:		'[name="city"]',
			county:		'[name="region"]',
			county_list:'[name="region_id"]',
			country:	'[name="country_id"]'
		};
		var postcode_elements = jQuery(dom.postcode);
		postcode_elements.each(function(index){
			if(postcode_elements.eq(index).data('cc') != '1'){
				var active_cfg = {};
				jQuery.extend(active_cfg, cfg);
				active_cfg.id = "m2_"+cc_index;
				var form = postcode_elements.eq(index).closest('form');

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

				// modify the Chceckout
				var postcode_elem = active_cfg.dom.postcode;
				postcode_elem.wrap('<div class="search-bar"></div>');
				postcode_elem.after('<button type="button" class="action primary">'+
				'<span>'+active_cfg.txt.search_buttontext+'</span></button>');

				// IWD
				postcode_elem.closest('.field').after('<div class="field crafty-results-container" style="display:none;"><div class="control"><div class="scroll-wrapper" tabindex="0" style="position: relative;">'+
					'<div class="iwd_opc_select_container scroll-content selected search-list" style="height: auto;">'+
					'</div><div class="scroll-element scroll-x"><div class="scroll-element_outer"><div class="scroll-element_size"></div><div class="scroll-element_track"></div><div class="scroll-bar" style="width: 100px;"></div></div></div><div class="scroll-element scroll-y"><div class="scroll-element_outer"><div class="scroll-element_size"></div>'+
					'<div class="scroll-element_track"></div><div class="scroll-bar" style="height: 100px; top: 0px;"></div></div></div></div></div></div>');

				// input after postcode
				var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
				new_container.addClass('search-container').attr('id',active_cfg.id).addClass('type_3');

				active_cfg.ui = {
					select_builder: function(lines, search_list){
						var html = '';
						for(var i=0; i<lines.length; i++){
							html += '<div class="iwd_opc_select_option option_element" data-id="'+i+'">'+lines[i]+'</div>';
						}
						search_list.html(html);
						search_list.find('div.iwd_opc_select_option:eq(0)').addClass('selected');
						search_list.closest('div.field').show();
					},
					select_trigger: function(search_list, cc){
						jQuery(search_list).find('div.option_element').off('click');
						jQuery(search_list).find('div.option_element').on('click', function(){
							cc.select(postcode, jQuery(this).attr('data-id'));
							search_list.closest('div.field').hide();
						});
					}
				}
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
		if(!c2a_config.main.enable_extension){ return; }
		if(c2a_config.postcodelookup.enabled){
			setInterval(activate_cc_m2_uk,200);
		}
	});
});
