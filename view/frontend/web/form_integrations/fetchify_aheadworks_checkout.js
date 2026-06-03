function cc_m2_c2a() {
	/**
	 * wait for form to exist before continuing
	 * (needed on sites that load page elements
	 * via multiple ajax requests)
	 */
	if (document.querySelectorAll('[name="postcode"]').length == 0) {
		return;
	}

	document.querySelectorAll('[name="postcode"]').forEach(function(elem) {
		if (elem.dataset.cc_attach != '1' && elem.closest('form').querySelector('[name="street[0]"]')) {
			elem.dataset.cc_attach = '1';

			var form = elem.closest('form');
			var custom_id = '';

			if (c2a_config.autocomplete.advanced.search_elem_id !== null) {
				custom_id = ' id="' + c2a_config.autocomplete.advanced.search_elem_id + '"';
			}

			// null fix for m2_1.1.16
			if (c2a_config.autocomplete.texts.search_label == null) c2a_config.autocomplete.texts.search_label = '';

			if (c2a_config.autocomplete.advanced.hide_fields) {
				// if hide fields is enabled, always add our own search input
				var tmp_html =
					'<div class="field-row"' + custom_id + '>' +
						'<div class="field">' +
							'<div style="display: flex; flex-direction: row; justify-content: space-between">' +
								'<label style="color: #838383; cursor: default; max-width: 150px; margin-bottom: 5px;" for="fetchify_search">' + c2a_config.autocomplete.texts.search_label + '</label>' +
								'<div class="field cc_hide_fields_action" style="font-size: 0.75em; color: #838383; max-width: 125px;">' +
									'<label style="text-align: right;">' + c2a_config.autocomplete.texts.manual_entry_toggle + '</label>' +
								'</div>' +
							'</div>' +
							'<div class="control"><input class="cc_search_input input-text" type="text" name="fetchify_search"></div>' +
						'</div>' +
					'</div>';
				form.querySelector('[name="street[0]"]').closest('.field-row').insertAdjacentHTML('beforebegin', tmp_html);
			} else if (!c2a_config.autocomplete.advanced.hide_fields && !c2a_config.autocomplete.advanced.use_first_line) {
				var tmp_html =
					'<div class="field-row"' + custom_id + '>' +
						'<div class="field">' +
							'<div style="display: flex; flex-direction: row; justify-content: space-between">' +
								'<label style="color: #838383; cursor: default; max-width: 150px; margin-bottom: 5px;" for="fetchify_search">' + c2a_config.autocomplete.texts.search_label + '</label>' +
							'</div>' +
							'<div class="control"><input class="cc_search_input input-text" type="text" name="fetchify_search"></div>' +
						'</div>' +
					'</div>';
				form.querySelector('[name="street[0]"]').closest('.field-row').insertAdjacentHTML('beforebegin', tmp_html);
			} else if (!c2a_config.autocomplete.advanced.hide_fields && c2a_config.autocomplete.advanced.use_first_line) {
				var tmp_html =
					'<div class="field-row">' +
						'<div class="field">' +
							'<div style="display: flex; flex-direction: row; justify-content: space-between">' +
								'<label style="color: #838383; cursor: default; max-width: 150px; margin-bottom: 5px;">' + c2a_config.autocomplete.texts.search_label + '</label>' +
							'</div>' +
						'</div>' +
					'</div>;';
				form.querySelector('[name="street[0]"]').closest('.field-row').insertAdjacentHTML('beforebegin', tmp_html);

				form.querySelector('[name="street[0]"]').classList.add('cc_search_input');
			}

			if (c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
				var wrapper = document.createElement('div');
				wrapper.classList.add('field-row');

				var country_field = form.querySelector('[name="country_id"]').closest('div.field');
				country_field.replaceWith(wrapper);
				wrapper.appendChild(country_field);

				if (c2a_config.autocomplete.advanced.use_first_line) {
					prev(form.querySelector('.cc_search_input').closest('div.field-row'), 'div.field-row').before(form.querySelector('[name="country_id"]').closest('div.field-row'));
				} else {
					form.querySelector('.cc_search_input').closest('div.field-row').before(form.querySelector('[name="country_id"]').closest('div.field-row'));
				}
			}

			var dom = {
				search:		form.querySelector('.cc_search_input'),
				company:	form.querySelector('[name="company"]'),
				line_1:		form.querySelector('[name="street[0]"]'),
				line_2:		form.querySelector('[name="street[1]"]'),
				postcode:	form.querySelector('[name="postcode"]'),
				town:		form.querySelector('[name="city"]'),
				county:		{
					input:	form.querySelectorAll('[name="region"]'),
					list:	form.querySelectorAll('[name="region_id"]')
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
				county:		{
					input:	dom.county.input,
					list:	dom.county.list
				},
				country:	dom.country
			});

			form.querySelector('.cc_hide_fields_action').addEventListener('click', function() {
				cc_hide_fields(dom, 'manual-show');
			});

			cc_hide_fields(dom, 'init');
		}
	});
}
window.cc_holder = null;

function cc_hide_fields(dom, action) {
	if (!c2a_config.autocomplete.advanced.hide_fields) {
		return;
	}

	var action = action || 'show';
	switch (action) {
		case 'init':
			var elementsToHide = ['line_1', 'line_2', 'line_3', 'line_4', 'town', 'postcode', 'county'];

			// determine if we can hide by default
			var formEmpty = true;
			for (var i = 0; i < elementsToHide.length - 1; i++) { // -1 is to skip County
				if (dom[elementsToHide[i]]) && dom[elementsToHide[i]].value !== '') {
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
							dom[elementsToHide[i]].input[0].closest('.field').classList.add('cc_hide');
							dom[elementsToHide[i]].list[0].closest('.field').classList.add('cc_hide');
							break;
						case 'line_1':
							dom[elementsToHide[i]].closest('fieldset.field').classList.add('cc_hide');
							break;
						default:
							dom[elementsToHide[i]].closest('.field').classList.add('cc_hide');
					}
				}
			}

			var form = dom.country.closest('form');

			// store the checking loop in the DOM object
			form.dataset.cc_hidden = 0;

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
			form.dataset.cc_hidden = 1;
			break;
		case 'manual-show':
		case 'show':
			dom.country.dispatchEvent(new Event('change'));

			var form = dom.country.closest('form');
			form.querySelectorAll('.cc_hide').forEach(function(item) {
				item.classList.remove('cc_hidden');
			});

			form.querySelector('.cc_hide_fields_action').style.display = 'none';
			form.dataset.cc_hidden = 0;

			if (action == 'manual-show') {
				dom.country.dispatchEvent(new Event('change'));
			}
			break;
		case 'toggle':
			var form = dom.country.closest('form');
			if (form.dataset.cc_hidden == 1) {
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

		// prevent the user from hiding the fields again
		form.querySelector('.cc_hide_fields_action').style.display = 'none';
	}
}

// replacement for jQuery's .prev()
function prev(el, selector) {
  const prevEl = el.previousElementSibling;
  if (!selector || (prevEl && prevEl.matches(selector))) {
    return prevEl;
  }
  return null;
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

				if (elements.county.list.length == 1) {
					c2a.setCounty(elements.county.list[0], county);
				}

				if (elements.county.input.length == 2) {
					c2a.setCounty(elements.county.input[1], county);
				}

				if (typeof elements.county.input[0] != 'undefined') elements.county.input[0].dispatchEvent(new Event('change'));
				if (typeof elements.county.list[0] != 'undefined') elements.county.list[0].dispatchEvent(new Event('change'));
				if (typeof elements.company != 'undefined') elements.company.dispatchEvent(new Event('change'));
				if (typeof elements.line_1 != 'undefined') elements.line_1.dispatchEvent(new Event('change'));
				if (typeof elements.line_2 != 'undefined') elements.line_2.dispatchEvent(new Event('change'));
				if (typeof elements.postcode != 'undefined') elements.postcode.dispatchEvent(new Event('change'));
				if (typeof elements.town != 'undefined') elements.town.dispatchEvent(new Event('change'));

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
			tag: 'magento2aw'
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
});

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', cc_init);
} else {
	cc_init();
}
