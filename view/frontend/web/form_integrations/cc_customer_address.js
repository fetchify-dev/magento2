var cc_activate_flags = [];

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
		big_wrapper_elem.appendChild(label_elem);
		big_wrapper_elem.appendChild(small_wrapper_elem);

		if (!c2a_config.autocomplete.advanced.use_first_line) {
			form.querySelector('#street_1').closest('.field').before(big_wrapper_elem);
		} else {
			form.querySelector('#street_1').classList.add('cc_search_input');
		}

		if (c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
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
				},
				country:	form.querySelector('[name="country_id"]')
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
						elements.country.value = postcode;
						break;
					default:
						elements.country.value = address.country.iso_3166_1_alpha_2;
				}
				
				if (typeof elements.country != 'undefined') { elements.country.dispatchEvent(new Event('change')); }

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

				if (elements.county.list) {
					c2a.setCounty(elements.county.list, county);
				}

				if (elements.county.input) {
					c2a.setCounty(elements.county.input, county);
				}

				if (elements.county.input) elements.county.input.dispatchEvent(new Event('change'));
				if (elements.county.list) elements.county.list.dispatchEvent(new Event('change'));
				if (elements.company) elements.company.dispatchEvent(new Event('change'));
				if (elements.line_1) elements.line_1.dispatchEvent(new Event('change'));
				if (elements.line_2) elements.line_2.dispatchEvent(new Event('change'));
				if (elements.postcode) elements.postcode.dispatchEvent(new Event('change'));
				if (elements.town) elements.town.dispatchEvent(new Event('change'));

				var line_3 = elements.search.closest('form').querySelector('#street_3');
				if (line_3) {
					line_3.value = '';
					elements.line_3.dispatchEvent(new Event('change'));
				}
				
				var line_4 = elements.search.closest('form').querySelector('#street_4');
				if (line_4) {
					line_4.value = '';
					elements.line_4.dispatchEvent(new Event('change'));
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

function parents(el, selector) {
  var parents = [];
  while ((el = el.parentNode) && el !== document) {
    if (!selector || el.matches(selector)) parents.push(el);
  }
  return parents;
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
				address_1:	document.getElementById('street_1'),
				address_2:	document.getElementById('street_2'),
				address_3:	document.getElementById('street_3'),
				address_4:	document.getElementById('street_4'),
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
					if (active_cfg.county_data == 'former_postal') {
						fields.county.value = dataset.postal_county;
					} else if (active_cfg.county_data == 'traditional') {
						fields.county.value = dataset.traditional_county;
					} else {
						fields.county.value = '';
					}

					if (fields.county) fields.county.dispatchEvent(new Event('change'));
					if (fields.address_4) {
						fields.address_4.value = '';
						fields.address_4.dispatchEvent(new Event('change'));
					}

					fields.postcode.closest('form').querySelector('.cp_manual_entry').style.display = 'none';
				}
			}
		};

		if (cc_activate_flags.indexOf(active_cfg.id) == -1 && active_cfg.dom.postcode) {
			cc_activate_flags.push(active_cfg.id);

			// modify the Layout
			var postcode_elem = active_cfg.dom.postcode;

			var postcode_wrapper_elem = document.createElement('div');
			postcode_wrapper_elem.classList.add('search-bar');
			postcode_elem.replaceWith(postcode_wrapper_elem);
			postcode_wrapper_elem.appendChild(postcode_elem);

			// button has to go before input elem otherwise layout messed up when m2 validaton alert is displayed
			var button_text_elem = document.createElement('span');
			button_text_elem.textContent = active_cfg.txt.search_buttontext;

			var button_elem = document.createElement('button');
			button_elem.setAttribute('type', 'button'); // Required to prevent form from submitting
			button_elem.classList.add('action', 'primary');
			button_elem.appendChild(button_text_elem);
			postcode_elem.before(button_elem);

			// STANDARD
			var error_elem = document.createElement('div');
			error_elem.classList.add('search-subtext');

			var error_wrapper_elem = document.createElement('div');
			error_wrapper_elem.classList.add('mage-error');
			error_wrapper_elem.setAttribute('generated', '');
			error_wrapper_elem.appendChild(error_elem);
			postcode_wrapper_elem.after(error_wrapper_elem);

			var results_elem = document.createElement('select');

			var results_wrapper_elem = document.createElement('div');
			results_wrapper_elem.classList.add('search-list');
			results_wrapper_elem.style.display = 'none';
			results_wrapper_elem.appendChild(results_elem);
			postcode_wrapper_elem.after(results_wrapper_elem);

			/* m2 expects the alert elem to be directly after postcode 
			input, so let's move it back there to prevent m2 using our 
			button for displaying invalid postcode error text */
			postcode_elem.after(postcode_elem.closest('.control').querySelector('[role="alert"]'));

			// add/show manual entry text
			if (active_cfg.hide_fields) {
				if (!document.getElementById(active_cfg.id + '_cp_manual_entry') && postcode_elem.value === '') {
					var rect1_elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					rect1_elem.setAttribute('x', '-22.85');
					rect1_elem.setAttribute('y', '66.4');
					rect1_elem.setAttribute('width', '226.32');
					rect1_elem.setAttribute('height', '47.53');
					rect1_elem.setAttribute('rx', '17.33');
					rect1_elem.setAttribute('ry', '17.33');
					rect1_elem.setAttribute('transform', 'translate(89.52 -37.99) rotate(45)');

					var rect2_elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					rect2_elem.setAttribute('x', '103.58');
					rect2_elem.setAttribute('y', '66.4');
					rect2_elem.setAttribute('width', '226.32');
					rect2_elem.setAttribute('height', '47.53');
					rect2_elem.setAttribute('rx', '17.33');
					rect2_elem.setAttribute('ry', '17.33');
					rect2_elem.setAttribute('transform', 'translate(433.06 0.12) rotate(135)');

					var svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
					svg_elem.setAttribute('viewBox', '0 0 305.67 179.25');
					svg_elem.setAttribute('style', 'display: inline-block; width: 1em;');
					svg_elem.appendChild(rect1_elem);
					svg_elem.appendChild(rect2_elem);

					var manual_entry_label_elem = document.createElement('label');
					manual_entry_label_elem.textContent = active_cfg.txt.manual_entry;
					manual_entry_label_elem.style.cursor = 'pointer';

					var manual_entry_wrapper_elem = document.createElement('div');
					manual_entry_wrapper_elem.id = active_cfg.id + '_cp_manual_entry';
					manual_entry_wrapper_elem.classList.add('field', 'cp_manual_entry');
					manual_entry_wrapper_elem.style.margin = '15px 0 15px 0';
					manual_entry_wrapper_elem.appendChild(manual_entry_label_elem);
					manual_entry_wrapper_elem.appendChild(svg_elem);

					postcode_elem.nextElementSibling.after(manual_entry_wrapper_elem);

					document.getElementById(active_cfg.id + '_cp_manual_entry').addEventListener('click', () => {
						postcode_elem.closest('form').querySelectorAll('.crafty_address_field').forEach((field) => {
							field.classList.remove('crafty_address_field_hidden');
						});
						document.getElementById(active_cfg.id + '_cp_manual_entry').style.display = 'none';
					});
				}
			}

			var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
			new_container.id = active_cfg.id;
			new_container.classList.add('search-container', 'type_3');

			var cc_customer_address = new cc_ui_handler(active_cfg);

			// respect the form's two-column layout
			cc_customer_address.sort = function() {
				var elems = this.cfg.dom;
				var country = parents(elems.country, this.cfg.sort_fields.parent).at(-1);
				var line_1 = parents(elems.address_1, this.cfg.sort_fields.parent).at(-1);
				line_1.before(country);

				var searchContainer = {};
				searchContainer = this.search_object[0];
				country.after(searchContainer);

				//IWD checkout - temporary ???
				if (document.querySelector('.crafty-results-container')) {
					searchContainer.after(searchContainer.closest('.fieldset').querySelector('.crafty-results-container'));
				}
				
				if (this.cfg.hide_fields) {
					var tagElement = [];
					tagElement = ['company', 'address_1', 'town', 'county', 'county_list'];
					for (var i = 0; i < tagElement.length; i++) {
						parents(elems[tagElement[i]], this.cfg.sort_fields.parent).at(-1).classList.add('crafty_address_field');
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

requirejs(['jquery'], function($) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', cc_init);
	} else {
		cc_init();
	}
});
