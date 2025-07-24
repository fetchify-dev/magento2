function cc_m2_c2a() {
	/**
	 * wait for form to exist before continuing
	 * (needed on sites that load page elements
	 * via multiple ajax requests)
	 */
	if (!document.querySelector('[name="postcode"]')) {
		return;
	}

	document.querySelectorAll('[name="postcode"]').forEach(function(postcode_elem) {
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
			label_elem.textContent = c2a_config.autocomplete.texts.search_label_elem;

			var big_wrapper_elem = document.createElement('div');
			if (c2a_config.autocomplete.advanced.search_elem_id !== null) { big_wrapper_elem.id = c2a_config.autocomplete.advanced.search_elem_id; } // custom id
			big_wrapper_elem.classList.add('field');
			big_wrapper_elem.appendChild(label_elem);
			big_wrapper_elem.appendChild(small_wrapper_elem);

			if (!c2a_config.autocomplete.advanced.use_first_line || c2a_config.autocomplete.advanced.hide_fields) {
				form.querySelector('#street_1').closest('div.street').before(big_wrapper_elem);
			} else {
				form.querySelector('#street_1').classList.add('cc_search_input');
			}

			if (c2a_config.autocomplete.advanced.hide_fields) {
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
				svg_elem.appendChild(rect1_elem);
				svg_elem.appendChild(rect2_elem);

				var manual_entry_label_elem = document.createElement('label');
				manual_entry_label_elem.innerText = c2a_config.autocomplete.texts.manual_entry_toggle;
				manual_entry_label_elem.style.cursor = 'pointer';

				var manual_entry_wrapper_elem = document.createElement('div');
				manual_entry_wrapper_elem.classList.add('field', 'cc_hide_fields_action');
				manual_entry_wrapper_elem.appendChild(manual_entry_label_elem);
				manual_entry_wrapper_elem.appendChild(svg_elem);

				big_wrapper_elem.after(manual_entry_wrapper_elem);
			}

			if (c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
				form.querySelector('.cc_search_input').closest('div.field').before(form.querySelector('[name="country_id"]').closest('div.field'));
			}

			var dom = {
				search:		form.querySelector('.cc_search_input'),
				company:	form.querySelector('[name="company"]'),
				line_1:		form.querySelector('#street_1'),
				line_2:		form.querySelector('#street_2'),
				postcode:	form.querySelector('[name="postcode"]'),
				town:		form.querySelector('[name="city"]'),
				county: {
					input: form.querySelector('[name="region"]'),
					list: form.querySelector('[name="region_id"]')
				},
				country:	form.querySelector('[name="country_id"]')
			};

			window.cc_holder.attach({
				search:		dom.search,
				company:	dom.company,
				line_1:		dom.line_1,
				line_2:		dom.line_2,
				postcode:	dom.postcode,
				town:		dom.town,
				county: {
					input: dom.county.input,
					list: dom.county.list
				},
				country:	dom.country
			});

			if (c2a_config.autocomplete.advanced.hide_fields) {
				form.querySelector('.cc_hide_fields_action').addEventListener('click', () => {
					cc_hide_fields(dom, 'manual-show');
				});
			}

			cc_hide_fields(dom, 'init');
		}
	});
}

window.cc_holder = null;

function parents(el, selector) {
  var parents = [];
  while ((el = el.parentNode) && el !== document) {
    if (!selector || el.matches(selector)) parents.push(el);
  }
  return parents;
}

// Postcode Lookup
function activate_cc_m2_uk() {
	// TODO: arrange fields based on country
	if (c2a_config.postcodelookup.enabled) {
		var dom = {
			company:	'[name="company"]',
			address_1:	'#street_1',
			address_2:	'#street_2',
			address_3:	'#street_3',
			address_4:	'#street_4',
			postcode:	'[name="postcode"]',
			town:		'[name="city"]',
			county:		'[name="region"]',
			county_list:'[name="region_id"]',
			country:	'[name="country_id"]'
		};

		document.querySelectorAll(dom.postcode).forEach(function(postcode_elem) {
			/**
			 * The Magento 2 checkout loads fields
			 * asynchronously so we need to check 
			 * for the existence of multiple fields
			 * before continuing. This helps avoid
			 * a race condition scenario on slow 
			 * devices/connections.
			 */
			var form = postcode_elem.closest('form');
			if (
				postcode_elem.dataset.cc_pcl_applied != '1'
				&& form.querySelector(dom.address_1)
				&& form.querySelector(dom.country)
			) {
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
							fields.postcode.closest('form').querySelector('.cp_manual_entry').style.display = 'none';
							if (fields.address_4) {
								fields.address_4.value = '';
								fields.address_4.dispatchEvent(new Event('change'));
							}
						}
					}
				};

				cc_index++;

				// modify the Layout
				var postcode_wrapper_elem = document.createElement('div');
				postcode_wrapper_elem.classList.add('search-bar');
				postcode_elem.replaceWith(postcode_wrapper_elem);
				postcode_wrapper_elem.appendChild(postcode_elem);

				// STANDARD
				var button_text_elem = document.createElement('span');
				button_text_elem.textContent = active_cfg.txt.search_buttontext;

				var button_elem = document.createElement('button');
				button_elem.setAttribute('type', 'button'); // Required to prevent form from submitting
				button_elem.classList.add('action', 'primary');
				button_elem.appendChild(button_text_elem);
				postcode_wrapper_elem.appendChild(button_elem);

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

				// input after postcode
				var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
				new_container.id = active_cfg.id;
				new_container.classList.add('search-container', 'type_3');

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
						manual_entry_wrapper_elem.appendChild(manual_entry_label_elem);
						manual_entry_wrapper_elem.appendChild(svg_elem);

						postcode_elem.closest('.field').after(manual_entry_wrapper_elem);

						document.getElementById(active_cfg.id + '_cp_manual_entry').addEventListener('click', () => {
							form.querySelectorAll('.crafty_address_field').forEach((element) => {
								element.classList.remove('crafty_address_field_hidden');
							});
							document.getElementById(active_cfg.id + '_cp_manual_entry').style.display = 'none';
						});
					}
				}

				postcode_elem.dataset.cc_pcl_applied = '1';
				cc_generic = new cc_ui_handler(active_cfg);

				// respect the form's two-column layout
				cc_generic.sort = function() {
					var elems = this.cfg.dom;
					var country = parents(elems.country, this.cfg.sort_fields.parent).at(-1);
					var line_1 = parents(elems.address_1, this.cfg.sort_fields.parent).at(-1);
					var searchContainer = {};

					line_1.before(country);
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

				cc_generic.activate();
			}
		});
	}
}
var cc_index = 0;

function cc_hide_fields(dom, action) {
	if (!c2a_config.autocomplete.advanced.hide_fields) {
		return;
	}

	var action = action || 'show';
	switch (action) {
		case 'init':
			// determine if we can hide by default
			var elementsToHide = ['line_1', 'line_2', 'line_3', 'line_4', 'town', 'postcode', 'county'];
			var formEmpty = true;
			for (var i = 0; i < elementsToHide.length - 1; i++) { // -1 is to skip County
				if (dom[elementsToHide[i]] && dom[elementsToHide[i]].value !== '') {
					formEmpty = false;
				}
			}

			if (!c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
				elementsToHide.push('country');
			}

			for (var i = 0; i < elementsToHide.length; i++) {
				if (dom[elementsToHide[i]]) {
					switch (elementsToHide[i]) {
						case 'county':
							dom[elementsToHide[i]].input.closest('.field').classList.add('cc_hide');
							dom[elementsToHide[i]].list.closest('.field').classList.add('cc_hide');
							break;
						case 'line_1':
							dom[elementsToHide[i]].closest('div.street').classList.add('cc_hide');
							break;
						default:
							dom[elementsToHide[i]].closest('.field').classList.add('cc_hide');
					}
				}
			}

			// store the checking loop in the DOM object
			var form = dom.country.closest('form');
			form.dataset.cc_hidden = '0';
			if (formEmpty) {
				cc_hide_fields(dom, 'hide');
			} else {
				cc_hide_fields(dom, 'show');
			}

			setInterval(function() { cc_reveal_fields_on_error(dom); }, 250);
			break;
		case 'hide':
			var form = dom.country.closest('form');
			form.querySelectorAll('.cc_hide').forEach(function(item) {
				item.classList.add('cc_hidden');
			});
			form.querySelector('.cc_hide_fields_action').classList.remove('cc_slider_on');
			form.dataset.cc_hidden = '1';
			break;
		case 'manual-show':
		case 'show':
			dom.country.dispatchEvent(new Event('change'));

			var form = dom.country.closest('form');
			form.querySelectorAll('.cc_hide').forEach(function(item) {
				item.classList.remove('cc_hidden');
			});
			form.querySelector('.cc_hide_fields_action').style.display = 'none';
			form.dataset.cc_hidden = '0';

			if (action == 'manual-show') {
				dom.country.dispatchEvent(new Event('change'));
			}
			break;
		case 'toggle':
			var form = dom.country.closest('form');
			if (form.dataset.cc_hidden == '1') {
				cc_hide_fields(dom, 'show');
			} else {
				cc_hide_fields(dom, 'hide');
			}
			break;
	}
}

function cc_reveal_fields_on_error(dom) {
	var form = dom.country.closest('form');
	var errors_present = false;

	form.querySelectorAll('.cc_hide').forEach(function(item) {
		if (item.classList.contains('_error')) {
			errors_present = true;
		}
	});

	if (errors_present) {
		cc_hide_fields(dom, 'show');
		form.querySelector('.cc_hide_fields_action').style.display = 'none'; // prevent the user from hiding the fields again
	}
}

function cc_init() {
	if (!c2a_config.main.enable_extension) { return; }

	if (c2a_config.autocomplete.enabled && c2a_config.main.key != null) {
		var config = {
			accessToken: c2a_config.main.key,
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

				cc_hide_fields(elements, 'show');
			},
			onError: function() {
				if (typeof this.activeDom.postcode !== 'undefined') {
					cc_hide_fields(this.activeDom, 'show');
				} else {
					c2a_config.autocomplete.advanced.hide_fields = false;
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
		setInterval(cc_m2_c2a, 200);
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
					phone_element.dataset.cc = '1';
					var country = phone_element.closest('form').querySelector('select[name="country_id"]');
					window.cc_holder.addPhoneVerify({
						phone: phone_element,
						country: country
					});
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
