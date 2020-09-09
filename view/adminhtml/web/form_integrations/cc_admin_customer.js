// autocomplete
function activate_cc_m2(){
	jQuery('[name="postcode"]').each(function(index,elem){
		if(jQuery(elem).data('cc_attach') != '1'){
			var form = jQuery(elem).closest('fieldset');
			// check if all form elements exist correctly
			if(!(
				0 != form.find('[name="company"]').length &&
				0 != form.find('[name="street[0]"]').length &&
				0 != form.find('[name="street[1]"]').length &&
				0 != form.find('[name="postcode"]').length &&
				0 != form.find('[name="city"]').length &&
				0 != form.find('[name="region"]').length &&
				0 != form.find('select[name="region_id"]').length &&
				0 != form.find('select[name="country_id"]').length
			)){
				// if anything is missing (some parts get loaded in a second ajax pass)
				return;
			}

			jQuery(elem).data('cc_attach','1');

			var tmp_html = '<div class="admin__field"><label class="admin__field-label">'+c2a_config.autocomplete.texts.search_label+'</label><div class="admin__field-control"><input class="cc_search_input admin__control-text" type="text"/></div></div>';
			form.find('[name="street[0]"]').closest('fieldset').before( tmp_html );

			window.cc_holder.attach({
				search:		form.find('.cc_search_input')[0],
				company:	form.find('[name="company"]')[0],
				line_1:		form.find('[name="street[0]"]')[0],
				line_2:		form.find('[name="street[1]"]')[0],
				postcode:	form.find('[name="postcode"]')[0],
				town:		form.find('[name="city"]')[0],
				county:		{
					input:	form.find('[name="region"]'),
					list:	form.find('select[name="region_id"]')
				},
				country:	form.find('select[name="country_id"]')[0]
			});
		}
	});
}
// postcodelookup
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
				parent: 'div.admin__field',
				/*	special structure workaround.
					can't move easily the street objects (special parent?!)
					Use company to move country up to a proper position & leave the rest as usual
				*/
				custom_order: ['company', 'country', 'company', 'postcode']
			},
			hide_fields: c2a_config.postcodelookup.hide_fields,
			txt: c2a_config.postcodelookup.txt,
			error_msg: c2a_config.postcodelookup.error_msg,
			county_data: c2a_config.postcodelookup.advanced.county_data
		};
		var dom = {
			company:	'[name$="company"]',
			address_1:	'[name$="street[0]"]',
			address_2:	'[name$="street[1]"]',
			postcode:	'[name$="postcode"]',
			town:		'[name$="city"]',
			county:		'[name$="region"]',
			county_list:'select[name$="region_id"]',
			country:	'select[name$="country_id"]'
		};
		// special for admin panel: search each potential element
		var postcode_elements = jQuery(dom.postcode);
		postcode_elements.each(function(index){
			if(postcode_elements.eq(index).data('cc') != '1'){
				var active_cfg = {};
				jQuery.extend(active_cfg, cfg);
				active_cfg.id = "m2_"+cc_index;
				var form = postcode_elements.eq(index).closest('fieldset');
				// check if all form elements exist correctly
				// the way this form loads, initially region and other fields might be missing
				if(!(
					0 != form.find('[name$="company"]').length &&
					0 != form.find('[name$="street[0]"]').length &&
					0 != form.find('[name$="street[1]"]').length &&
					0 != form.find('[name$="postcode"]').length &&
					0 != form.find('[name$="city"]').length &&
					0 != form.find('[name$="region"]').length &&
					0 != form.find('select[name$="region_id"]').length &&
					0 != form.find('select[name$="country_id"]').length
				)){
					// if anything is missing (some parts get loaded in a second ajax pass)
					return;
				}

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

				// modify the Layout
				var postcode_elem = active_cfg.dom.postcode;
				postcode_elem.wrap('<div class="search-bar"></div>');
				postcode_elem.after('<button type="button" class="action primary">'+
				'<span>'+active_cfg.txt.search_buttontext+'</span></button>');

				// ADMIN
				postcode_elem.closest('.search-bar').after('<div class="search-list" style="display: none;">'+
					'<select class="admin__control-select"></select>'+
					'</div><div class="mage-error" generated><div class="search-subtext"></div></div>');

				// input after postcode
				var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
				new_container.addClass('search-container').attr('id',active_cfg.id).addClass('type_3');

				active_cfg.ui = {
					top_elem: '.admin__fieldset'
				};

				active_cfg.dom.postcode.data('cc','1');
				var cc_generic = new cc_ui_handler(active_cfg);
				cc_generic.activate();
			}
		});
	}
}
var cc_index = 0;

window.cc_holder = null;
requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(!c2a_config.main.enable_extension){ return; }
		if(c2a_config.autocomplete.enabled && c2a_config.main.key != null){
			var config = {
				accessToken: c2a_config.main.key,
				onSetCounty: function(c2a, elements, county){
					if ("createEvent" in document) {
						var evt = document.createEvent("HTMLEvents");
						evt.initEvent("change", false, true);
						elements.country.dispatchEvent(evt);
					}
					else
						elements.country.fireEvent("onchange");
					c2a.setCounty(elements.county.list[0], county);
					c2a.setCounty(elements.county.input[0], county);
				},
				domMode: 'object',
				gfxMode: c2a_config.autocomplete.gfx_mode,
				style: {
					ambient: c2a_config.autocomplete.gfx_ambient,
					accent: c2a_config.autocomplete.gfx_accent
				},
				showLogo: false,
				texts: c2a_config.autocomplete.texts,
				onResultSelected: function(c2a, elements, address){
					switch(address.country_name) {
						case 'Jersey':
							jQuery(elements.country).val('JE')
							break;
						case 'Guernsey':
							jQuery(elements.country).val('GG')
							break;
						case 'Isle of Man':
							jQuery(elements.country).val('IM')
							break;
						default:
							jQuery(elements.country).val(address.country.iso_3166_1_alpha_2);
					}
					jQuery(elements.country).trigger('change');
					jQuery(elements.company).trigger('change');
					jQuery(elements.line_1).trigger('change');
					jQuery(elements.line_2).trigger('change');
					jQuery(elements.postcode).trigger('change');
					jQuery(elements.town).trigger('change');
					jQuery(elements.county.input).trigger('change');
					jQuery(elements.county.list).trigger('change');
				},
				transliterate: c2a_config.autocomplete.advanced.transliterate,
				debug: c2a_config.autocomplete.advanced.debug,
				cssPath: false,
				tag: 'Magento 2 - int'
			};
			if(typeof c2a_config.autocomplete.enabled_countries !== 'undefined'){
				config.countryMatchWith = 'iso_2';
				config.enabledCountries = c2a_config.autocomplete.enabled_countries;
			}
			if(c2a_config.autocomplete.advanced.lock_country_to_dropdown){
				config.countrySelector = false;
				config.onSearchFocus = function(c2a, dom){
					var currentCountry = dom.country.options[dom.country.selectedIndex].value;
					if(currentCountry !== ''){
						var countryCode = getCountryCode(c2a, currentCountry, 'iso_2');
						c2a.selectCountry(countryCode);
					}
				};
			}

			window.cc_holder = new clickToAddress(config);
			setInterval(activate_cc_m2,200);
		}
		if(c2a_config.autocomplete.enabled && c2a_config.main.key == null){
			console.warn('ClickToAddress: Incorrect token format supplied');
		}

		if(c2a_config.postcodelookup.enabled){
			setInterval(activate_cc_m2_uk,200);
		}
		if(c2a_config.phonevalidation.enabled && c2a_config.main.key != null){
			if(window.cc_holder == null){
				window.cc_holder = new clickToAddress({
					accessToken: c2a_config.main.key,
				})
			}
			setInterval(function(){
				var phone_elements = jQuery('input[name="telephone"]');
				phone_elements.each(function(index){
					var phone_element = phone_elements.eq(index);
					if( phone_element.data('cc') != '1'){
						var country = phone_element.closest('.admin__fieldset').find('select[name="country_id"]')
						if(country.length > 0){
							window.cc_holder.addPhoneVerify({
								phone: phone_element[0],
								country: country[0]
							})
							phone_element.data('cc', '1');
						}
					}
				});
			}, 200);
		}
	});
});
