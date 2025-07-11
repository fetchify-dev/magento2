var cc_activate_flags = [];

function cc_m2_c2a() {
	/**
	 * wait for form to exist before continuing
	 * (needed on sites that load page elements
	 * via multiple ajax requests)
	 */
	if (jQuery('[name="postcode"]').length == 0) {
		return;
	}

	var postcode_elem = jQuery('[name="postcode"]')[0];

	if (jQuery(postcode_elem).data('cc_attach') != '1') {
		jQuery(postcode_elem).data('cc_attach', '1');

		var form = jQuery(postcode_elem).closest('form');
		var custom_id = '';

		if (c2a_config.autocomplete.advanced.search_elem_id !== null) {
			custom_id = ' id="' + c2a_config.autocomplete.advanced.search_elem_id + '"';
		}

		// null fix for m2_1.1.16
		if (c2a_config.autocomplete.texts.search_label == null) c2a_config.autocomplete.texts.search_label = '';

		var tmp_html = '<div class="field"' + custom_id + '><label class="label" for="fetchify_search">' +
			c2a_config.autocomplete.texts.search_label + '</label>' +
			'<div class="control"><input class="cc_search_input" type="text" name="fetchify_search"/></div></div>';

		if (!c2a_config.autocomplete.advanced.use_first_line) {
			form.find('#street_1').closest('.field').before(tmp_html);
		} else {
			form.find('#street_1').addClass('cc_search_input');
		}

		if (c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
			form.find('.cc_search_input').closest('div.field').before(form.find('[name="country_id"]').closest('div.field'));
		}

		var config = {
			accessToken: c2a_config.main.key,
			dom: {
				search:		form.find('.cc_search_input')[0],
				company:	form.find('[name="company"]')[0],
				line_1:		form.find('#street_1')[0],
				line_2:		form.find('#street_2')[0],
				postcode:	form.find('[name="postcode"]')[0],
				town:		form.find('[name="city"]')[0],
				county:		{
					input:	form.find('[name="region"]'),
					list:	form.find('[name="region_id"]')
				},
				country:	form.find('[name="country_id"]')[0]
			},
			onSetCounty: function(c2a, elements, county) {
				return;
			},
			domMode: 'object',
			gfxMode: c2a_config.autocomplete.gfx_mode,
			style: {
				ambient: c2a_config.autocomplete.gfx_ambient,
				accent: c2a_config.autocomplete.gfx_accent
			},
			showLogo: false,
			texts: c2a_config.autocomplete.texts,
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
				
				if (typeof elements.country != 'undefined') { triggerEvent('change', elements.country); }

				var county;
				if (c2a.activeCountry === 'gbr' && !c2a_config.autocomplete.advanced.fill_uk_counties) {
					county = { code: '', name: '', preferred: '' };
				} else {
					county = {
						preferred: address.province,
						code: address.province_code,
						name: address.province_name
					};
				}

				if (elements.county.list.length == 1) {
					c2a.setCounty(elements.county.list[0], county);
				}

				if (elements.county.input.length == 1) {
					c2a.setCounty(elements.county.input[0], county);
				}

				if (typeof elements.county.input[0] != 'undefined') triggerEvent('change', elements.county.input[0]);
				if (typeof elements.county.list[0] != 'undefined') triggerEvent('change', elements.county.list[0]);
				if (typeof elements.company != 'undefined') triggerEvent('change', elements.company);
				if (typeof elements.line_1 != 'undefined') triggerEvent('change', elements.line_1);
				if (typeof elements.line_2 != 'undefined') triggerEvent('change', elements.line_2);
				if (typeof elements.postcode != 'undefined') triggerEvent('change', elements.postcode);
				if (typeof elements.town != 'undefined') triggerEvent('change', elements.town);

				
				var line_3 = jQuery(elements.search).closest('form').find('#street_3');
				if (line_3.length !== 0) {
					line_3.val('');
					triggerEvent('change', line_3[0]);
				}
				
				var line_4 = jQuery(elements.search).closest('form').find('#street_4');
				if (line_4.length !== 0) {
					line_4.val('');
					triggerEvent('change', line_4[0]);
				}
			},
			transliterate: c2a_config.autocomplete.advanced.transliterate,
			excludeAreas: c2a_config.autocomplete.exclusions.areas,
			excludePoBox: c2a_config.autocomplete.exclusions.po_box,
			debug: c2a_config.autocomplete.advanced.debug,
			cssPath: false,
			tag: 'magento2'
		};
		if (typeof c2a_config.autocomplete.enabled_countries !== 'undefined') {
			config.countryMatchWith = 'iso_2';
			config.enabledCountries = c2a_config.autocomplete.enabled_countries;
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
	}
}

// Postcode Lookup
var cc_activate_flags = [];
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
				parent: '.field:not(.additional)'
			},
			hide_fields: c2a_config.postcodelookup.hide_fields,
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
					fields.address_4.val('').change();

					fields.postcode.closest('form').find('.cp_manual_entry').hide(200);
				}
			}
		};

		var address_dom = {
			company:	jQuery('[name="company"]'),
			address_1:	jQuery('#street_1'),
			address_2:	jQuery('#street_2'),
			address_3:	jQuery('#street_3'),
			address_4:	jQuery('#street_4'),
			postcode:	jQuery('[name="postcode"]'),
			town:		jQuery('[name="city"]'),
			county:		jQuery('[name="region"]'),
			county_list:jQuery('[name="region_id"]'),
			country:	jQuery('[name="country_id"]')
		};

		cfg.dom = address_dom;
		cfg.id = 'm2_address';

		if (cc_activate_flags.indexOf(cfg.id) == -1 && cfg.dom.postcode.length == 1) {
			cc_activate_flags.push(cfg.id);

			// modify the Layout
			var postcode_elem = cfg.dom.postcode;
			postcode_elem.wrap('<div class="search-bar"></div>');

			// button has to go before input elem otherwise layout messed up when m2 validaton alert is displayed
			postcode_elem.before('<button type="button" class="action primary">' +
				'<span>' + cfg.txt.search_buttontext + '</span></button>');

			// STANDARD
			postcode_elem.closest('.search-bar').after('<div class="search-list" style="display: none;"><select></select></div>' +
				'<div class="mage-error" generated><div class="search-subtext"></div></div>');

			/* m2 expects the alert elem to be directly after postcode 
			input, so let's move it back there to prevent m2 using our 
			button for displaying invalid postcode error text */
			postcode_elem.after(postcode_elem.closest('.control').find('[role="alert"]'));

			// add/show manual entry text
			if (cfg.hide_fields) {
				if (jQuery('#' + cfg.id + '_cp_manual_entry').length === 0 && postcode_elem.val() === '') {
					var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 305.67 179.25">' +
						'<rect x="-22.85" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(89.52 -37.99) rotate(45)"/>' +
						'<rect x="103.58" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(433.06 0.12) rotate(135)"/>' +
						'</svg>';

					tmp_manual_html = '<div class="field cp_manual_entry" id="' + cfg.id + '_cp_manual_entry" style="margin-top: 15px; margin-bottom: 15px;"><label>' + cfg.txt.manual_entry + '</label>' + svg + '</div>';
					jQuery(postcode_elem).next('[role="alert"]').after(tmp_manual_html);

					jQuery('#' + cfg.id + '_cp_manual_entry').on('click', function() {
						jQuery(postcode_elem).closest('form').find('.crafty_address_field').removeClass('crafty_address_field_hidden');
						jQuery('#' + cfg.id + '_cp_manual_entry').hide(200);
					});
				}
			}

			var new_container = postcode_elem.closest(cfg.sort_fields.parent);
			new_container.addClass('search-container').attr('id', cfg.id).addClass('type_3');

			var cc_customer_address = new cc_ui_handler(cfg);

			// respect the form's two-column layout
			cc_customer_address.sort = function() {
				var elems = this.cfg.dom;
				var country = elems.country.parents(this.cfg.sort_fields.parent).last();
				var line_1 = elems.address_1.parents(this.cfg.sort_fields.parent).last();
				country.insertBefore(line_1);

				var searchContainer = {};
				searchContainer = this.search_object;
				country.after(searchContainer);

				//IWD checkout - temporary ???
				if (jQuery('.crafty-results-container').length > 0) {
					searchContainer.after(searchContainer.closest('.fieldset').find('.crafty-results-container'));
				}
				
				if (this.cfg.hide_fields) {
					var tagElement = [];
					tagElement = ['company', 'address_1', 'town', 'county', 'county_list'];
					for (var i = 0; i < tagElement.length; i++) {
						elems[tagElement[i]].parents(this.cfg.sort_fields.parent).last().addClass('crafty_address_field');
					}
				}
			};

			cc_customer_address.activate();
		}
	}
}

// Phone Validation
function cc_m2_phone() {
	// need to allow autocomplete to init cc_holder if enabled
	if (c2a_config.autocomplete.enabled && window.cc_holder == null) {
		return;
	} else if (!c2a_config.autocomplete.enabled && window.cc_holder == null) {
		window.cc_holder = new clickToAddress({
			accessToken: c2a_config.main.key,
		});
	}

	var add_phone = setInterval(function() {
		var phone_element = jQuery('input[name="telephone"]');
		if (phone_element.length == 1 && phone_element.data('cc') != '1') {
			phone_element.data('cc', '1');
			var country = phone_element.closest('form').find('select[name="country_id"]');
			window.cc_holder.addPhoneVerify({
				phone: phone_element[0],
				country: country[0]
			});
			clearInterval(add_phone);
		}
	}, 200);
}

window.cc_holder = null;
requirejs(['jquery'], function($) {
	jQuery(document).ready(function() {
		if (!c2a_config.main.enable_extension) { return; }

		if (c2a_config.main.enable_extension && c2a_config.main.key == null) {
			console.warn('Fetchify: No access token configured.');
			return;
		}

		if (c2a_config.autocomplete.enabled) {
			setInterval(cc_m2_c2a, 200);
		}

		if (c2a_config.postcodelookup.enabled) {
			setInterval(activate_cc_m2_uk, 200);
		}

		if (c2a_config.phonevalidation.enabled) {
			setInterval(cc_m2_phone, 200);
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
