var cc_activate_flags = [];

// Address Auto-Complete
function cc_m2_c2a() {
	/**
	 * wait for form to exist before continuing
	 * (needed on sites that load page elements
	 * via multiple ajax requests)
	 */
	if (!document.querySelector('[name="postcode"]')) {
		return;
	}

	var postcode_elem = document.querySelector('[name="postcode"]');

	if (postcode_elem.dataset.cc_attach != '1') {
		postcode_elem.dataset.cc_attach = '1';

		var form = postcode_elem.closest('form');

		// null fix for m2_1.1.16
		if (c2a_config.autocomplete.texts.search_label == null) c2a_config.autocomplete.texts.search_label = '';

		var search_elem = document.createElement('input');
		search_elem.classList.add('cc_search_input');
		if (window.hyva) search_elem.classList.add('form-input', 'w-full');
		search_elem.name = 'fetchify_search';
		search_elem.setAttribute('type', 'text');

		var small_wrapper_elem = document.createElement('div');
		small_wrapper_elem.classList.add('control');
		small_wrapper_elem.appendChild(search_elem);

		var label_elem = document.createElement('label');
		label_elem.classList.add('label');
		label_elem.setAttribute('for', 'fetchify_search');
		label_elem.textContent = c2a_config.autocomplete.texts.search_label;

		var big_wrapper_elem = document.createElement('div');
		if (c2a_config.autocomplete.advanced.search_elem_id !== null) { big_wrapper_elem.id = c2a_config.autocomplete.advanced.search_elem_id; } // custom id
		big_wrapper_elem.classList.add('field');
		if (window.hyva) big_wrapper_elem.classList.add('field-reserved', 'w-full');
		big_wrapper_elem.appendChild(label_elem);
		big_wrapper_elem.appendChild(small_wrapper_elem);

		if (!c2a_config.autocomplete.advanced.use_first_line) {
			form.querySelector('#street_1').closest('.field').before(big_wrapper_elem);
		} else {
			form.querySelector('#street_1').classList.add('cc_search_input');
		}

		if (c2a_config.autocomplete.advanced.lock_country_to_dropdown || window.hyva) {
			form.querySelector('.cc_search_input').closest('div.field').before(form.querySelector('[name="country_id"]').closest('div.field'));
		}

		var config = {
			accessToken: c2a_config.main.key,
			dom: {
				search:		form.querySelector('.cc_search_input'),
				company:	form.querySelector('[name="company"]'),
				line_1:		form.querySelector('#street_1'),
				line_2:		form.querySelector('#street_2'),
				postcode:	form.querySelector('[name="postcode"]'),
				town:		form.querySelector('[name="city"]'),
				county:		{
					input:	form.querySelector('[name="region"]'),
					list:	form.querySelector('[name="region_id"]')
				}
			},
			domMode: 'object',
			gfxMode: c2a_config.autocomplete.gfx_mode,
			style: {
				ambient: c2a_config.autocomplete.gfx_ambient,
				accent: c2a_config.autocomplete.gfx_accent
			},
			showLogo: false,
			texts: c2a_config.autocomplete.texts,
			onSetCounty: function(c2a, elements, county) {
				return;
			},
			onResultSelected: function(c2a, elements, address) {
				// Hyva uses input events for fields, default Magento uses change events
				var event_name = (window.hyva) ? 'input' : 'change';

				// Hyva replaces the State/Province field on country change so we don't want to let AAC change the country when Hyva is enabled
				if (!window.hyva) {
					var postcode_prefix = address.postal_code.substring(0, 2);

					switch (postcode_prefix) {
						case 'JE':
						case 'GG':
						case 'IM':
							elements.country.value = postcode_prefix;
							break;
						default:
							elements.country.value = address.country.iso_3166_1_alpha_2;
					}

					elements.country.dispatchEvent(new Event(event_name));
				}

				var line_3 = elements.search.closest('form').querySelector('#street_3');
				if (line_3) line_3.value = '';

				var line_4 = elements.search.closest('form').querySelector('#street_4');
				if (line_4) line_4.value = '';

				// County value is cleared on country change, so we need to set it after that happens
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

				// Hyva removes/creates the county list element depending on the country (whereas regular Magento only hides/shows it)
				var county_list = (window.hyva) ? elements.search.closest('form').querySelector('[name="region_id"]') : elements.county.list;
				if (county_list) {
					c2a.setCounty(county_list, county);
					county_list.dispatchEvent(new Event(event_name));
				}

				// County input value is also cleared on county list change, so we need to set it after that is handled
				if (elements.county.input) {
					c2a.setCounty(elements.county.input, county);
					elements.county.input.dispatchEvent(new Event(event_name));
				}

				// Company, Address Lines 2-4, and State/Province can all be disabled in Magento config
				if (elements.company) elements.company.dispatchEvent(new Event(event_name));
				elements.line_1.dispatchEvent(new Event(event_name));
				if (elements.line_2) elements.line_2.dispatchEvent(new Event(event_name));
				if (line_3) line_3.dispatchEvent(new Event(event_name));
				if (line_4) line_4.dispatchEvent(new Event(event_name));
				elements.postcode.dispatchEvent(new Event(event_name));
				elements.town.dispatchEvent(new Event(event_name));
			},
			transliterate: c2a_config.autocomplete.advanced.transliterate,
			excludeAreas: c2a_config.autocomplete.exclusions.areas,
			excludePoBox: c2a_config.autocomplete.exclusions.po_box,
			debug: c2a_config.autocomplete.advanced.debug,
			cssPath: false,
			tag: 'magento2'
		};

		// Hyva replaces the State/Province field on country change so we don't want to let AAC change the country when Hyva is enabled
		if (!window.hyva) {
			config.dom.country = form.querySelector('[name="country_id"]');
		}

		if (typeof c2a_config.autocomplete.enabled_countries !== 'undefined') {
			config.countryMatchWith = 'iso_2';
			config.enabledCountries = c2a_config.autocomplete.enabled_countries;
		}

		if (c2a_config.autocomplete.advanced.lock_country_to_dropdown || window.hyva) {
			config.countrySelector = false;
			config.onSearchFocus = function(c2a, dom) {
				var countrySelect = dom.search.closest('form').querySelector('[name="country_id"]');
				var currentCountry = countrySelect.options[countrySelect.selectedIndex].value;
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
		var active_cfg = {
			id: 'm2_address',
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
			dom: {
				company:	document.querySelector('[name="company"]'),
				address_1:	document.querySelector('#street_1'),
				address_2:	document.querySelector('#street_2'),
				address_3:	document.querySelector('#street_3'),
				address_4:	document.querySelector('#street_4'),
				postcode:	document.querySelector('[name="postcode"]'),
				town:		document.querySelector('[name="city"]'),
				county:		document.querySelector('[name="region"]'),
				county_list:document.querySelector('[name="region_id"]'),
				country:	document.querySelector('[name="country_id"]')
			},
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
					var manual_entry_button = fields.postcode.closest('form').querySelector('.cp_manual_entry');
					if (manual_entry_button) manual_entry_button.style.display = 'none';
				}
			}
		};

		if (cc_activate_flags.indexOf(active_cfg.id) == -1 && active_cfg.dom.postcode) {
			cc_activate_flags.push(active_cfg.id);

			var postcode_field = active_cfg.dom.postcode;

			var search_bar = postcode_field.parentNode;
			search_bar.classList.add('search-bar');
			var search_container = postcode_field.closest(active_cfg.sort_fields.parent);
			search_container.id = active_cfg.id;
			search_container.classList.add('search-container');
			search_container.style.width = '100%'; // only frontend pages need width to be set

			// add postcode lookup button
			var search_button_html = '<button type="button" class="action primary search-button">' + active_cfg.txt.search_buttontext + '</button>';
			search_bar.insertAdjacentHTML('beforeend', search_button_html);

			// add container for address results
			var local_style_class = window.hyva ? 'form-select' : 'admin__control-select';
			var search_results_html = '<select class="' + local_style_class + ' search-list" style="width: 100%;"></select>';
			search_bar.insertAdjacentHTML('beforeend', search_results_html);

			// add container for errors
			var search_subtext_html = '<div class="search-subtext"></div>';
			search_bar.insertAdjacentHTML('beforeend', search_subtext_html);

			// add manual entry button (if enabled)
			if (active_cfg.hide_fields) {
				var manual_entry_button_html =
					'<div id="' + active_cfg.id + '_cp_manual_entry" class="cp_manual_entry">' +
						'<span>' + active_cfg.txt.manual_entry +
							'<svg viewBox="0 0 305.67 179.25">' +
								'<rect x="-22.85" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(89.52 -37.99) rotate(45)"></rect>' +
								'<rect x="103.58" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(433.06 0.12) rotate(135)"></rect>' +
							'</svg>' +
						'</span>' +
					'</div>';
				search_bar.insertAdjacentHTML('beforeend', manual_entry_button_html);

				postcode_field.closest('form').querySelector('.cp_manual_entry > span').addEventListener('click', function(event) {
					event.target.closest('form').querySelectorAll('.crafty_address_field').forEach(function(element) {
						element.classList.remove('cc_hidden');
					});
					event.target.parentNode.style.display = 'none';
				});
			}

			// when using Hyva theme, address line 2 has the class .additional
			if (window.hyva) active_cfg.sort_fields.parent = '.field';

			var cc_customer_address = new cc_ui_handler(active_cfg);

			// respect the form's two-column layout
			cc_customer_address.sort = function() {
				var elems = this.cfg.dom;
				var country = parents(elems.country, this.cfg.sort_fields.parent).at(-1);
				var line_1 = parents(elems.address_1, this.cfg.sort_fields.parent).at(-1);
				line_1.before(country);

				var searchContainer = this.search_object;
				country.after(searchContainer);

				//IWD checkout - temporary ???
				if (document.querySelector('.crafty-results-container')) {
					searchContainer.after(searchContainer.closest('.fieldset').querySelector('.crafty-results-container'));
				}

				if (this.cfg.hide_fields) {
					var tagElement = [];
					tagElement = ['company', 'address_1', 'address_2', 'address_3', 'address_4', 'town', 'county', 'county_list'];
					for (var i = 0; i < tagElement.length; i++) {
						if (elems[tagElement[i]]) {
							parents(elems[tagElement[i]], this.cfg.sort_fields.parent).at(-1).classList.add('crafty_address_field');
						}
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
		var phone_element = document.querySelector('input[name="telephone"]');
		if (phone_element && phone_element.dataset.cc != '1') {
			phone_element.dataset.cc = '1';
			var country = phone_element.closest('form').querySelector('select[name="country_id"]');
			window.cc_holder.addPhoneVerify({
				phone: phone_element,
				country: country
			});
			clearInterval(add_phone);
		}
	}, 200);
}

window.cc_holder = null;
function cc_init() {
	if (!c2a_config.main.enable_extension) { return; }

	if (c2a_config.main.enable_extension && c2a_config.main.key == null) {
		console.warn('Fetchify: No access token configured.');
		return;
	}

	if (window.hyva) document.body.classList.add('hyva-customer-address');

	if (c2a_config.autocomplete.enabled) {
		setInterval(cc_m2_c2a, 200);
	}

	if (c2a_config.postcodelookup.enabled) {
		setInterval(activate_cc_m2_uk, 200);
	}

	if (c2a_config.phonevalidation.enabled) {
		setInterval(cc_m2_phone, 200);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', cc_init);
} else {
	cc_init();
}
