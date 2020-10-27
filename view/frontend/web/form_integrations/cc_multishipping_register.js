var cc_activate_flags = [];
function cc_m2_c2a(){
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
		jQuery(postcode_elem).data('cc_attach','1');
		var form = jQuery(postcode_elem).closest('form');

		var custom_id = '';
		if(c2a_config.autocomplete.advanced.search_elem_id !== null){
			custom_id = ' id="'+ c2a_config.autocomplete.advanced.search_elem_id +'"'
		}

		// null fix for m2_1.1.16
		if (c2a_config.autocomplete.texts.search_label == null) c2a_config.autocomplete.texts.search_label = '';

		var tmp_html = '<div class="field"'+custom_id+'><label class="label">' +
						c2a_config.autocomplete.texts.search_label+'</label>' +
						'<div class="control"><input class="cc_search_input" type="text"/></div></div>';
		if(c2a_config.autocomplete.advanced.hide_fields){
			var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 305.67 179.25">'+
						'<rect x="-22.85" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(89.52 -37.99) rotate(45)"/>'+
						'<rect x="103.58" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(433.06 0.12) rotate(135)"/>'+
					'</svg>';
			tmp_html += '<div class="field cc_hide_fields_action"><label>'+c2a_config.autocomplete.texts.manual_entry_toggle+'</label>'+svg+'</div>';
		}
		if (!c2a_config.autocomplete.advanced.use_first_line || c2a_config.autocomplete.advanced.hide_fields) {
			form.find('#street_1').closest('.field').before( tmp_html );
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
			onSetCounty: function(c2a, elements, county){
				return
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
				// var event = new Event('change')
				if (typeof elements.country != 'undefined') { triggerEvent('change', elements.country)}

				var county = {
					preferred: address.province,
					code: address.province_code,
					name: address.province_name
				};

				if(elements.county.list.length == 1){
					c2a.setCounty(elements.county.list[0], county);
				}
				if(elements.county.input.length == 1){
					c2a.setCounty(elements.county.input[0], county);
				}

				if (typeof elements.county.input[0] != 'undefined') triggerEvent('change', elements.county.input[0]);
				if (typeof elements.county.list[0] != 'undefined') triggerEvent('change', elements.county.list[0]);
				if (typeof elements.company != 'undefined') triggerEvent('change', elements.company);
				if (typeof elements.line_1 != 'undefined') triggerEvent('change', elements.line_1);
				if (typeof elements.line_2 != 'undefined') triggerEvent('change', elements.line_2);
				if (typeof elements.postcode != 'undefined') triggerEvent('change', elements.postcode);
				if (typeof elements.town != 'undefined') triggerEvent('change', elements.town);

				cc_hide_fields(elements,'show');
			},
			transliterate: c2a_config.autocomplete.advanced.transliterate,
			debug: c2a_config.autocomplete.advanced.debug,
			cssPath: false,
			tag: 'Magento 2'
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

		// cc_hide_fields expect jquery elements
		var jquery_dom = {
			search:		form.find('.cc_search_input'),
			company:	form.find('[name="company"]'),
			line_1:		form.find('#street_1'),
			line_2:		form.find('#street_2'),
			postcode:	form.find('[name="postcode"]'),
			town:		form.find('[name="city"]'),
			county:		{
						input:	form.find('[name="region"]'),
						list:	form.find('[name="region_id"]')
			},
			country:	form.find('[name="country_id"]')
		};

		form.find('.cc_hide_fields_action').on('click',function(){
			cc_hide_fields(jquery_dom, 'manual-show')
		});

		cc_hide_fields(jquery_dom,'init');
	}
}

// Postcode Lookup
var cc_activate_flags = [];
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
			ui: {
				onResultSelected: function(dataset, id, fields) {
					if (cfg.county_data == 'former_postal') {
						fields.county[0].value = dataset.postal_county
					} else if (cfg.county_data == 'traditional') {
						fields.county[0].value = dataset.traditional_county
					} else {
						fields.county[0].value = ''
					}
					fields.county.trigger('change')
					fields.postcode.closest('form').find('.cp_manual_entry').hide(200)
				}
			}
		};
		var address_dom = {
			company:	jQuery("[name='company']"),
			address_1:	jQuery("#street_1"),
			address_2:	jQuery("#street_2"),
			postcode:	jQuery("[name='postcode']"),
			town:		jQuery("[name='city']"),
			county:		jQuery("[name='region']"),
			county_list:jQuery("[name='region_id']"),
			country:	jQuery("[name='country_id']")
		};
		cfg.dom = address_dom;
		cfg.id = "m2_address";
		if(cc_activate_flags.indexOf(cfg.id) == -1 && cfg.dom.postcode.length == 1){
			cc_activate_flags.push(cfg.id);

			// modify the Layout
			var postcode_elem = cfg.dom.postcode;
			postcode_elem.wrap('<div class="search-bar"></div>');
			// button has to go before input elem otherwise layout messed up when m2 validaton alert is displayed
			postcode_elem.before('<button type="button" class="action primary">'+
			'<span>'+cfg.txt.search_buttontext+'</span></button>');
			// STANDARD
			postcode_elem.closest('.search-bar').after('<div class="search-list" style="display: none;"><select></select></div>'+
									'<div class="mage-error" generated><div class="search-subtext"></div></div>');

			/* m2 expects the alert elem to be directly after postcode 
			input, so let's move it back there to prevent m2 using our 
			button for displaying invalid postcode error text */
			postcode_elem.after(postcode_elem.closest('.control').find('[role="alert"]'))

			var new_container = postcode_elem.closest(cfg.sort_fields.parent);
			new_container.addClass('search-container').attr('id',cfg.id).addClass('type_3');

			var form = postcode_elem.closest('form');

			// add/show manual entry text
			if (cfg.hide_fields) {
				if (jQuery('#'+cfg.id+'_cp_manual_entry').length === 0 && postcode_elem.val() === "") {
					var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 305.67 179.25">'+
								'<rect x="-22.85" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(89.52 -37.99) rotate(45)"/>'+
								'<rect x="103.58" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(433.06 0.12) rotate(135)"/>'+
							'</svg>';
					tmp_manual_html = '<div class="field cp_manual_entry" id="'+cfg.id+'_cp_manual_entry" style="margin-top: 15px; margin-bottom: 15px;"><label>'+cfg.txt.manual_entry+'</label>'+svg+'</div>';
					jQuery(postcode_elem).after(tmp_manual_html)

					jQuery('#'+cfg.id+'_cp_manual_entry').on('click', function() {
						jQuery(form).find('.crafty_address_field').removeClass('crafty_address_field_hidden');
						jQuery('#'+cfg.id+'_cp_manual_entry').hide(200)
					})
				}
			}

			var cc_multishipping_register = new cc_ui_handler(cfg);
			cc_multishipping_register.activate();
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
		})
	}

	var add_phone = setInterval(function() {
		var phone_element = jQuery('input[name="telephone"]');
		if (phone_element.length == 1 && phone_element.data('cc') != '1') {
			phone_element.data('cc', '1');
			var country = phone_element.closest('form').find('select[name="country_id"]')
			window.cc_holder.addPhoneVerify({
				phone: phone_element[0],
				country: country[0]
			})
			clearInterval(add_phone);
		}
	}, 200);
}

// Email Validation
function cc_m2_email() {
	// need to allow autocomplete to init cc_holder if enabled
	if (c2a_config.autocomplete.enabled && window.cc_holder == null) {
		return;
	} else if (!c2a_config.autocomplete.enabled && window.cc_holder == null) {
		window.cc_holder = new clickToAddress({
			accessToken: c2a_config.main.key,
		})
	}

	var add_email = setInterval(function(){
		var email_element = jQuery('input#email_address');
		if (email_element.data('cc') != '1'){
			email_element.data('cc', '1');
			window.cc_holder.addEmailVerify({
				email: email_element[0]
			})
			clearInterval(add_email);
		}
	}, 200);
}

window.cc_holder = null;

function cc_hide_fields(dom, action){
	var action = action || 'show';
	if(!c2a_config.autocomplete.advanced.hide_fields){
		return;
	}
	switch(action){
		case 'init':
			var elementsToHide = ['line_1', 'line_2', 'line_3', 'line_4', 'town', 'postcode', 'county'];
			// determine if we can hide by default
			var formEmpty = true;
			for(var i=0; i<elementsToHide.length - 1; i++){ // -1 is to skip County
				if(jQuery(dom[elementsToHide[i]]).length && jQuery(dom[elementsToHide[i]]).val() !== ''){
					formEmpty = false;
				}
			}
			if(!c2a_config.autocomplete.advanced.lock_country_to_dropdown){
				elementsToHide.push('country');
			}
			for(var i=0; i<elementsToHide.length; i++){
				if(jQuery(dom[elementsToHide[i]]).length){
					switch(elementsToHide[i]){
						case 'county':
							jQuery(dom[elementsToHide[i]].input).closest('.field').addClass('cc_hide');
							jQuery(dom[elementsToHide[i]].list).closest('.field').addClass('cc_hide');
							break;
						case 'line_1':
							jQuery(dom[elementsToHide[i]]).closest('.field').addClass('cc_hide');
							break;
						default:
							jQuery(dom[elementsToHide[i]]).closest('.field').addClass('cc_hide');
					}
				}
			}
			var form = jQuery(dom.country).closest('form');
			// store the checking loop in the DOM object
			form.data('cc_hidden',0);
			if(formEmpty){
				cc_hide_fields(dom, 'hide');
			} else {
				cc_hide_fields(dom, 'show');
			}
			setInterval(function(){cc_reveal_fields_on_error(dom);}, 250);
			break;
		case 'hide':
			var form = jQuery(dom.country).closest('form');
			form.find('.cc_hide').each(function(index, item){
				jQuery(item).addClass('cc_hidden');
			});
			form.find('.cc_hide_fields_action').removeClass('cc_slider_on');
			form.data('cc_hidden',1);
			break;
		case 'manual-show':
		case 'show':
			var form = jQuery(dom.country).closest('form');
			jQuery(dom.country).trigger('change');
			form.find('.cc_hide').each(function(index, item){
				jQuery(item).removeClass('cc_hidden');
			});
			form.find('.cc_hide_fields_action').hide(200);
			form.data('cc_hidden',0);
			if(action == 'manual-show'){
				jQuery(dom.country).trigger('change');
			}
			break;
		case 'toggle':
			var form = jQuery(dom.country).closest('form');
			if(form.data('cc_hidden') == 1){
				cc_hide_fields(dom, 'show');
			} else {
				cc_hide_fields(dom, 'hide');
			}
			break;
	}
}

function cc_reveal_fields_on_error(dom){
	var form = jQuery(dom.country).closest('form');
	var errors_present = false;
	form.find('.cc_hide').each(function(index, item){
		if(jQuery(item).hasClass('_error')){
			errors_present = true;
		}
	});
	if(errors_present){
		cc_hide_fields(dom, 'show');
		form.find('.cc_hide_fields_action').hide(); // prevent the user from hiding the fields again
	}
}

requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(!c2a_config.main.enable_extension){ return; }

		if (c2a_config.main.enable_extension && c2a_config.main.key == null) {
			console.warn('Fetchify: No access token configured.');
			return;
		}

		if (c2a_config.autocomplete.enabled) {
			setInterval(cc_m2_c2a,200);
		}

		if (c2a_config.postcodelookup.enabled){
			setInterval(activate_cc_m2_uk,200);
		}

		if (c2a_config.phonevalidation.enabled) {
			setInterval(cc_m2_phone, 200);
		}

		if(c2a_config.emailvalidation.enabled && c2a_config.main.key != null){
			setInterval(cc_m2_email, 200);
		}
	});
});

function triggerEvent(eventName, target){
	var event;
	if (typeof(Event) === 'function') {
		 event = new Event(eventName);
	} else {
		 event = document.createEvent('Event');
		 event.initEvent(eventName, true, true);
	}
	target.dispatchEvent(event);
}
