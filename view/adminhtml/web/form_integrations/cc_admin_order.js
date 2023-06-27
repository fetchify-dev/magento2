function activate_cc_m2() {
	jQuery('[name="postcode"]').each(function(index, elem) {
		if (jQuery(elem).data('cc_attach') != '1' && !jQuery(elem).prop('disabled')) {
			jQuery(elem).data('cc_attach', '1');

			var form = jQuery(elem).closest('.admin__fieldset');
			var tmp_html = '<div class="admin__field"><label class="admin__field-label">' + c2a_config.autocomplete.texts.search_label + '</label><div class="admin__field-control"><input class="cc_search_input admin__control-text" type="text"/></div></div>';
			form.find('[name="street[0]"]').closest('div.admin__field').before(tmp_html);

			window.cc_holder.attach({
				search:		form.find('.cc_search_input')[0],
				company:	form.find('[name="company"]')[0],
				line_1:		form.find('[name="street[0]"]')[0],
				line_2:		form.find('[name="street[1]"]')[0],
				postcode:	form.find('[name="postcode"]')[0],
				town:		form.find('[name="city"]')[0],
				county:		{
					input:	form.find('[name="region"]'),
					list:	form.find('[name="region_id"]')
				},
				country:	form.find('[name="country_id"]')[0]
			});

			cc_index++;
		}
	});
}

// Postcode Lookup
function activate_cc_m2_uk() {
	if (c2a_config.postcodelookup.enabled) {
		var cfg = {
			id: '',
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
				parent: 'div.admin__field'
			},
			txt: c2a_config.postcodelookup.txt,
			error_msg: c2a_config.postcodelookup.error_msg,
			county_data: c2a_config.postcodelookup.advanced.county_data,
			ui: {
				onResultSelected: function(dataset, id, fields) {
					if (cfg.county_data == 'former_postal') {
						fields.county[0].value = dataset.postal_county;
					} else if (cfg.county_data == 'traditional') {
						fields.county[0].value = dataset.traditional_county;
					} else {
						fields.county[0].value = '';
					}
					fields.county.trigger('change');
					fields.address_4.val('').change;
				}
			}
		};

		var dom = {
			company:	'[name="company"]',
			address_1:	'[name="street[0]"]',
			address_2:	'[name="street[1]"]',
			address_3:	'[name="street[2]"]',
			address_4:	'[name="street[3]"]',
			postcode:	'[name="postcode"]',
			town:		'[name="city"]',
			county:		'[name="region"]',
			county_list:'[name="region_id"]',
			country:	'[name="country_id"]'
		};

		var postcode_elements = jQuery(dom.postcode);
		postcode_elements.each(function(index) {
			if (postcode_elements.eq(index).data('cc') != '1') {
				var active_cfg = {};
				jQuery.extend(active_cfg, cfg);
				active_cfg.id = 'm2_' + cc_index;
				cc_index++;

				var form = postcode_elements.eq(index).closest('.admin__fieldset');
				active_cfg.dom = {
					company:		form.find(dom.company),
					address_1:		form.find(dom.address_1),
					address_2:		form.find(dom.address_2),
					address_3:		form.find(dom.address_3),
					address_4:		form.find(dom.address_4),
					postcode:		postcode_elements.eq(index),
					town:			form.find(dom.town),
					county:			form.find(dom.county),
					county_list:	form.find(dom.county_list),
					country:		form.find(dom.country)
				};

				// modify the Layout
				var postcode_elem = active_cfg.dom.postcode;
				postcode_elem.wrap('<div class="search-bar"></div>');
				postcode_elem.after('<button type="button" class="action primary">' +
					'<span>' + active_cfg.txt.search_buttontext + '</span></button>');

				// ADMIN
				postcode_elem.closest('.search-bar').after('<div class="search-list" style="display: none;">' +
					'<select class="admin__control-select"></select>' +
					'</div><div class="mage-error" generated><div class="search-subtext"></div></div>');

				// input after postcode
				var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
				new_container.addClass('search-container').attr('id', active_cfg.id).addClass('type_3');

				active_cfg.dom.postcode.data('cc', '1');

				var cc_generic = new cc_ui_handler(active_cfg);
				cc_generic.activate();
			}
		});
	}
}

var cc_index = 0;

window.cc_holder = null;
requirejs(['jquery'], function($) {
	jQuery(document).ready(function() {
		if (!c2a_config.main.enable_extension) { return; }

		if (c2a_config.autocomplete.enabled && c2a_config.main.key != null) {
			var config = {
				accessToken: c2a_config.main.key,
				onSetCounty: function(c2a, elements, county) {
					if ('createEvent' in document) {
						var evt = document.createEvent('HTMLEvents');
						evt.initEvent('change', false, true);
						elements.country.dispatchEvent(evt);
					} else {
						elements.country.fireEvent('onchange');
					}

					c2a.setCounty(elements.county.list[0], county);
					c2a.setCounty(elements.county.input[0], county);
				},
				domMode: 'object',
				gfxMode: c2a_config.autocomplete.gfx_mode,
				style: {
					ambient: c2a_config.autocomplete.gfx_ambient,
					accent: c2a_config.autocomplete.gfx_accent
				},
				onResultSelected: function(c2a, elements, address) {
					var postcode = address.postal_code.substring(0, 2);

					switch (postcode) {
						case 'JE':
						case 'GG':
						case 'IM':
							jQuery(elements.country).val(postcode);
							break;
						default:
							jQuery(elements.country).val(address.country.iso_3166_1_alpha_2);
					}

					// county input value will be lost when country change event triggered so save it for later
					var county_input_val = jQuery(elements.county.input).val();

					jQuery(elements.country).trigger('change');
					jQuery(elements.company).trigger('change');
					jQuery(elements.line_1).trigger('change');
					jQuery(elements.line_2).trigger('change');
					jQuery(elements.postcode).trigger('change');
					jQuery(elements.town).trigger('change');
					jQuery(elements.county.input).val(county_input_val).trigger('change');

					// only trigger change on list if it's visible, otherwise county input val will be lost
					if (jQuery(elements.county.list).css('display') != 'none') {
						jQuery(elements.county.list).trigger('change');
					}
					
					var line_3 = jQuery(elements.search).closest('form').find('[name="street[2]"]');
					if (line_3.length !== 0) {
						line_3.val('');
						triggerEvent('change', line_3[0]);
					}
					
					var line_4 = jQuery(elements.search).closest('form').find('[name="street[3]"]');
					if (line_4.length !== 0) {
						line_4.val('');
						triggerEvent('change', line_4[0]);
					}
				},
				showLogo: false,
				texts: c2a_config.autocomplete.texts,
				transliterate: c2a_config.autocomplete.advanced.transliterate,
				excludeAreas: c2a_config.autocomplete.exclusions.areas,
				excludePoBox: c2a_config.autocomplete.exclusions.po_box,
				debug: c2a_config.autocomplete.advanced.debug,
				cssPath: false,
				tag: 'Magento 2 - int'
			};

			if (typeof c2a_config.autocomplete.enabled_countries !== 'undefined') {
				config.countryMatchWith = 'iso_2';

				var countryList = [];
				var countryOptions = jQuery('#country_id').find('option');

				for (var i = 1; i < countryOptions.length; i++) {
					countryList.push(countryOptions[i].value);
				}

				var isSame = c2a_config.autocomplete.enabled_countries.every(function (country) {
					return countryList.indexOf(country) > -1;
				});

				if (!isSame) {
					config.enabledCountries = countryList;
				} else {
					config.enabledCountries = c2a_config.autocomplete.enabled_countries;
				}
			}

			if (c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
				config.countrySelector = false;
				config.onSearchFocus = function(c2a, dom) {
					var currentCountry = dom.country.options[dom.country.selectedIndex].value;
					if (currentCountry !== '') {
						var countryCode = getCountryCode(c2a, currentCountry, 'iso_2');
						c2a.selectCountry(countryCode);
					}
				};
			}

			window.cc_holder = new clickToAddress(config);

			setInterval(activate_cc_m2, 200);
		}

		if (c2a_config.autocomplete.enabled && c2a_config.main.key == null) {
			console.warn('ClickToAddress: Incorrect token format supplied');
		}

		if (c2a_config.postcodelookup.enabled) {
			setInterval(activate_cc_m2_uk, 200);
		}

		if (c2a_config.phonevalidation.enabled && c2a_config.main.key != null) {
			if (window.cc_holder == null) {
				window.cc_holder = new clickToAddress({
					accessToken: c2a_config.main.key,
				});
			}
			
			setInterval(function() {
				var phone_elements = jQuery('input[name="telephone"]');
				phone_elements.each(function(index) {
					var phone_element = phone_elements.eq(index);
					if (phone_element.data('cc') != '1') {
						var country = phone_element.closest('form').find('select[name="country_id"]');
						if (country.length > 0) {
							window.cc_holder.addPhoneVerify({
								phone: phone_element[0],
								country: country[0]
							});
							phone_element.data('cc', '1');
						}
					}
				});
			}, 200);
		}
	});
});

// IE11 compatibility
function triggerEvent(eventName, target) {
	var event;
	if (typeof (Event) === 'function') {
		event = new Event(eventName);
	} else {
		event = document.createEvent('Event');
		event.initEvent(eventName, true, true);
	}
	target.dispatchEvent(event);
}
