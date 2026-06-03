var cc_activate_flags = [];

// Address Auto-Complete
function activate_cc_m2() {
	document.querySelectorAll('[name$="_address][postcode]"]').forEach(function(elem, index) {
		if (elem.dataset.cc_attach != '1' && !elem.disabled) {
			elem.dataset.cc_attach = '1';

			var form = elem.closest('fieldset');

			var search_elem = document.createElement('input');
			search_elem.id = 'cc_' + cc_index + '_search_input';
			search_elem.classList.add('cc_search_bar', 'admin__control-text');
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

			form.querySelector('[name$="_address][street][0]"]').closest('div.admin__field').before(big_wrapper_elem);
			form.id = 'cc-fieldset-' + index;

			window.cc_holder.attach({
				search:		form.querySelector('#cc_' + cc_index + '_search_input'),
				company:	form.querySelector('[name$="_address][company]"]'),
				line_1:		form.querySelector('[name$="_address][street][0]"]'),
				line_2:		form.querySelector('[name$="_address][street][1]"]'),
				postcode:	form.querySelector('[name$="_address][postcode]"]'),
				town:		form.querySelector('[name$="_address][city]"]'),
				county:		{
					input:	form.querySelector('[name$="_address][region]"]'),
					list:	form.querySelector('[name$="_address][region_id]"]'),
				},
				country:	form.querySelector('select[name$="_address][country_id]"]')
			});
			
			cc_index++;
		}
	});
}

var cc_index = 0;

// Postcode Lookup
var cc_activate_flags = [];
function activate_cc_m2_uk() {
	if (c2a_config.postcodelookup.enabled) {
		var dom = {
			company:	'[name$="_address][company]"]',
			address_1:	'[name$="_address][street][0]"]',
			address_2:	'[name$="_address][street][1]"]',
			address_3:	'[name$="_address][street][2]"]',
			address_4:	'[name$="_address][street][3]"]',
			postcode:	'[name$="_address][postcode]"]',
			town:		'[name$="_address][city]"]',
			county:		'[name$="_address][region]"]',
			county_list:'[name$="_address][region_id]"]',
			country:	'select[name$="_address][country_id]"]'
		};

		document.querySelectorAll(dom.postcode).forEach(function(postcode_field) {
			if (postcode_field.dataset.cc != '1') {
				var form = postcode_field.closest('fieldset');

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
						company: form.querySelector(dom.company),
						address_1: form.querySelector(dom.address_1),
						address_2: form.querySelector(dom.address_2),
						address_3: form.querySelector(dom.address_3),
						address_4: form.querySelector(dom.address_4),
						postcode: postcode_field,
						town: form.querySelector(dom.town),
						county: form.querySelector(dom.county),
						county_list: form.querySelector(dom.county_list),
						country: form.querySelector(dom.country)
					},
					sort_fields: {
						active: true,
						parent: 'div.admin__field'
					},
					txt: c2a_config.postcodelookup.txt,
					error_msg: c2a_config.postcodelookup.error_msg,
					county_data: c2a_config.postcodelookup.advanced.county_data,
					ui: {
						top_elem: 'div.admin__page-section-item'
					}
				};

				cc_index++;

				var search_bar = postcode_field.parentNode;
				search_bar.classList.add('search-bar');
				var search_container = postcode_field.closest(active_cfg.sort_fields.parent);
				search_container.id = active_cfg.id;
				search_container.classList.add('search-container');

				// add postcode lookup button
				var search_button_html = '<button type="button" class="action primary search-button">' + active_cfg.txt.search_buttontext + '</button>';
				search_bar.insertAdjacentHTML('beforeend', search_button_html);

				// add container for address results
				var search_results_html = '<select class="admin__control-select search-list" style="width: 100%;"></select>';
				search_bar.insertAdjacentHTML('beforeend', search_results_html);

				// add container for errors
				var search_subtext_html = '<div class="search-subtext"></div>';
				search_bar.insertAdjacentHTML('beforeend', search_subtext_html);

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
				setTimeout(function() {
					if (c2a.activeCountry === 'gbr' && !c2a_config.autocomplete.advanced.fill_uk_counties) {
						c2a.setCounty(elements.county.list, { code: '', name: '', preferred: '' });
						c2a.setCounty(elements.county.input, { code: '', name: '', preferred: '' });
					} else {
						c2a.setCounty(elements.county.list, county);
						c2a.setCounty(elements.county.input, county);
					}

					if (elements.county.input) elements.county.input.dispatchEvent(new Event('change'));

					// only trigger change on list if it's visible, otherwise county input val will be lost
					if (elements.county.list && elements.county.list.checkVisibility()) {
						elements.county.list.dispatchEvent(new Event('change'));
					}
				}, 100);
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

				if (elements.country) elements.country.dispatchEvent(new Event('change'));
				if (elements.company) elements.company.dispatchEvent(new Event('change'));
				if (elements.line_1) elements.line_1.dispatchEvent(new Event('change'));
				if (elements.line_2) elements.line_2.dispatchEvent(new Event('change'));
				if (elements.postcode) elements.postcode.dispatchEvent(new Event('change'));
				if (elements.town) elements.town.dispatchEvent(new Event('change'));

				var line_3 = elements.search.closest('fieldset').querySelector('[name$="_address][street][2]"]');
				if (line_3) {
					line_3.value = '';
					line_3.dispatchEvent(new Event('change'));
				}
				
				var line_4 = elements.search.closest('fieldset').querySelector('[name$="_address][street][3]"]');
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
			var countryOptions = document.getElementById('order-billing_address_country_id').querySelectorAll('option');

			for (var i = 1; i < countryOptions.length; i++) {
				countryList.push(countryOptions[i].value);
			}

			var isSame = true;

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
		// this page has two columns; for some reason magento doesn't trigger change event on shipping country when it is changed programatically

		document.querySelector('#order-billing_address_country_id').addEventListener('change', function() {
			if (document.querySelector('#order-shipping_same_as_billing').checked) {
				document.querySelector('#order-shipping_address_country_id').value = this.value;
				document.querySelector('#order-shipping_address_country_id').dispatchEvent(new Event('change'));
			}
		});

		document.querySelector('#order-shipping_same_as_billing').addEventListener('change', function() {
			if (this.checked) {
				document.querySelector('#order-shipping_address_country_id').dispatchEvent(new Event('change'));
			}
		});

		setInterval(activate_cc_m2_uk, 200);
	}

	if (c2a_config.emailvalidation.enabled && c2a_config.main.key != null) {
		if (window.cc_holder == null) {
			window.cc_holder = new clickToAddress({
				accessToken: c2a_config.main.key,
			});
		}

		setInterval(function() {
			var email_element = document.querySelector('input[name$="[email]"]');
			if (email_element.dataset.cc != '1') {
				email_element.dataset.cc = '1';
				window.cc_holder.addEmailVerify({
					email: email_element
				});
			}
		}, 200);
	}

	if (c2a_config.phonevalidation.enabled && c2a_config.main.key != null) {
		if (window.cc_holder == null) {
			window.cc_holder = new clickToAddress({
				accessToken: c2a_config.main.key,
			});
		}

		setInterval(function() {
			document.querySelectorAll('input[name$="[telephone]"]').forEach(function(phone_element) {
				if (phone_element.dataset.cc != '1') {
					var country = phone_element.closest('.admin__fieldset').querySelector('select[name$="[country_id]"]');
					if (country) {
						phone_element.dataset.cc = '1';
						window.cc_holder.addPhoneVerify({
							phone: phone_element,
							country: country
						});
					}
				}
			});
		}, 200);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', cc_init);
} else {
	cc_init();
}
