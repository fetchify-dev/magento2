// Address AutoComplete
function activate_cc_m2() {
	document.querySelectorAll('[name="postcode"]').forEach(function(elem) {
		if (elem.dataset.cc_attach != '1' && !elem.disabled) {
			elem.dataset.cc_attach = '1';
			var form = elem.closest('.admin__fieldset');

			var search_elem = document.createElement('input');
			search_elem.classList.add('cc_search_input', 'admin__control-text');
			search_elem.setAttribute('type', 'text');

			var small_wrapper_elem = document.createElement('div');
			small_wrapper_elem.classList.add('admin__field-control');
			small_wrapper_elem.appendChild(search_elem);

			var label_elem = document.createElement('label');
			label_elem.classList.add('admin__field-label');
			label_elem.textContent = c2a_config.autocomplete.texts.search_label;

			var big_wrapper_elem = document.createElement('div');
			big_wrapper_elem.classList.add('admin__field');
			big_wrapper_elem.appendChild(label_elem);
			big_wrapper_elem.appendChild(small_wrapper_elem);

			form.querySelector('[name="street[0]"]').closest('div.admin__field').before(big_wrapper_elem);

			window.cc_holder.attach({
				search:		form.querySelector('.cc_search_input'),
				company:	form.querySelector('[name="company"]'),
				line_1:		form.querySelector('[name="street[0]"]'),
				line_2:		form.querySelector('[name="street[1]"]'),
				postcode:	form.querySelector('[name="postcode"]'),
				town:		form.querySelector('[name="city"]'),
				county:		{
					input:	form.querySelector('[name="region"]'),
					list:	form.querySelector('[name="region_id"]')
				},
				country:	form.querySelector('[name="country_id"]')
			});

			cc_index++;
		}
	});
}

// Postcode Lookup
function activate_cc_m2_uk() {
	if (c2a_config.postcodelookup.enabled) {
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

		document.querySelectorAll(dom.postcode).forEach(function(postcode_elem) {
			if (postcode_elem.dataset.cc != '1') {
				var form = postcode_elem.closest('.admin__fieldset');

				var active_cfg = {
					id: 'm2_' + cc_index,
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
						company:		form.querySelector(dom.company),
						address_1:		form.querySelector(dom.address_1),
						address_2:		form.querySelector(dom.address_2),
						address_3:		form.querySelector(dom.address_3),
						address_4:		form.querySelector(dom.address_4),
						postcode:		postcode_elem,
						town:			form.querySelector(dom.town),
						county:			form.querySelector(dom.county),
						county_list:	form.querySelector(dom.county_list),
						country:		form.querySelector(dom.country)
					},
					sort_fields: {
						active: true,
						parent: 'div.admin__field'
					},
					txt: c2a_config.postcodelookup.txt,
					error_msg: c2a_config.postcodelookup.error_msg,
					county_data: c2a_config.postcodelookup.advanced.county_data,
					ui: {
						onResultSelected: function(dataset, id, fields) {
							if (active_cfg.county_data == 'former_postal') {
								fields.county.value = dataset.postal_county;
							} else if (active_cfg.county_data == 'traditional') {
								fields.county.value = dataset.traditional_county;
							} else {
								fields.county.value = '';
							}
							fields.county.dispatchEvent(new Event('change'));;
							if (fields.address_4) {
								fields.address_4.value = '';
								fields.address_4.dispatchEvent(new Event('change'));
							}
						}
					}
				};

				cc_index++;

				// modify the Layout
				var button_text_elem = document.createElement('span');
				button_text_elem.textContent = active_cfg.txt.search_buttontext;

				var button_elem = document.createElement('button');
				button_elem.setAttribute('type', 'button');
				button_elem.classList.add('action', 'primary');
				button_elem.appendChild(button_text_elem);

				var postcode_wrapper_elem = document.createElement('div');
				postcode_wrapper_elem.classList.add('search-bar');
				postcode_elem.replaceWith(postcode_wrapper_elem);
				postcode_wrapper_elem.appendChild(postcode_elem);
				postcode_wrapper_elem.appendChild(button_elem);

				// ADMIN
				var error_elem = document.createElement('div');
				error_elem.classList.add('search-subtext');

				var error_wrapper_elem = document.createElement('div');
				error_wrapper_elem.classList.add('mage-error');
				error_wrapper_elem.setAttribute('generated', '');
				error_wrapper_elem.appendChild(error_elem);
				postcode_wrapper_elem.after(error_wrapper_elem);

				var results_elem = document.createElement('select');
				results_elem.classList.add('admin__control-select');

				var results_wrapper_elem = document.createElement('div');
				results_wrapper_elem.classList.add('search-list');
				results_wrapper_elem.style.display = 'none';
				results_wrapper_elem.appendChild(results_elem);
				postcode_wrapper_elem.after(results_wrapper_elem);

				// input after postcode
				var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
				new_container.id = active_cfg.id;
				new_container.classList.add('search-container', 'type_3');

				active_cfg.dom.postcode.dataset.cc = '1';

				var cc_generic = new cc_ui_handler(active_cfg);
				cc_generic.activate();
			}
		});
	}
}

var cc_index = 0;

window.cc_holder = null;
function cc_init() {
	if (!c2a_config.main.enable_extension) { return; }

	if (c2a_config.autocomplete.enabled && c2a_config.main.key != null) {
		var config = {
			accessToken: c2a_config.main.key,
			onSetCounty: function(c2a, elements, county) {
				elements.country.dispatchEvent(new Event('change'));

				if (c2a.activeCountry === 'gbr' && !c2a_config.autocomplete.advanced.fill_uk_counties) {
					c2a.setCounty(elements.county.list, { code: '', name: '', preferred: '' });
					c2a.setCounty(elements.county.input, { code: '', name: '', preferred: '' });
				} else {
					c2a.setCounty(elements.county.list, county);
					c2a.setCounty(elements.county.input, county);
				}
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
						elements.country.value = postcode;
						break;
					default:
						elements.country.value = address.country.iso_3166_1_alpha_2;
				}

				// county input value will be lost when country change event triggered so save it for later
				var county_input_val = elements.county.input.value;

				elements.country.dispatchEvent(new Event('change'));
				elements.company.dispatchEvent(new Event('change'));
				elements.line_1.dispatchEvent(new Event('change'));
				elements.line_2.dispatchEvent(new Event('change'));
				elements.postcode.dispatchEvent(new Event('change'));
				elements.town.dispatchEvent(new Event('change'));
				elements.county.input.value = county_input_val;
				elements.county.input.dispatchEvent(new Event('change'));

				// only trigger change on list if it's visible, otherwise county input val will be lost
				if (elements.county.list.checkVisibility()) {
					elements.county.list.dispatchEvent(new Event('change'));
				}

				var line_3 = elements.search.closest('form').querySelector('[name="street[2]"]');
				if (line_3) {
					line_3.value = '';
					line_3.dispatchEvent(new Event('change'));
				}
				
				var line_4 = elements.search.closest('form').querySelector('[name="street[3]"]');
				if (line_4) {
					line_4.value = '';
					line_4.dispatchEvent(new Event('change'));
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
			var countryOptions = document.getElementById('country_id').querySelectorAll('option');

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
			document.querySelectorAll('input[name="telephone"]').forEach(function(phone_element) {
				if (phone_element.dataset.cc != '1') {
					var country = phone_element.closest('form').querySelector('select[name="country_id"]');
					if (country) {
						window.cc_holder.addPhoneVerify({
							phone: phone_element,
							country: country
						});
						phone_element.dataset.cc = '1';
					}
				}
			});
		}, 200);
	}
}

requirejs(['jquery'], function($) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', cc_init);
	} else {
		cc_init();
	}
});
