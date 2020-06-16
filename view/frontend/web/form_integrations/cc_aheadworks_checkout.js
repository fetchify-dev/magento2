function cc_m2_c2a(){
	/**
	 * wait for form to exist before continuing
	 * (needed on sites that load page elements
	 * via multiple ajax requests)
	 */
	if (jQuery('[name="postcode"]').length == 0) {
		return;
	}

	jQuery('[name="postcode"]').each(function(index,elem){
		if(jQuery(elem).data('cc_attach') != '1' && jQuery(elem).closest('form').find('[name="street[0]"]').length == 1){
			jQuery(elem).data('cc_attach','1');
			var form = jQuery(elem).closest('form');

			var custom_id = '';
			if(c2a_config.autocomplete.advanced.search_elem_id !== null){
				custom_id = ' id="'+ c2a_config.autocomplete.advanced.search_elem_id +'"'
			}

			// null fix for m2_1.1.16
			if (c2a_config.autocomplete.texts.search_label == null) c2a_config.autocomplete.texts.search_label = '';

			if (c2a_config.autocomplete.advanced.hide_fields) {
				//  if hide fields is enabled, always add our own search input
				var tmp_html = `
					<div class="field-row" ${custom_id}>
						<div class="field">
							<div style="display: flex; flex-direction: row; justify-content: space-between">
								<label style="color: #838383; cursor: default; max-width: 150px; margin-bottom: 5px;">${c2a_config.autocomplete.texts.search_label}</label>
								<div class="field cc_hide_fields_action" style="font-size: 0.75em; color: #838383; max-width: 125px;">
									<label style="text-align: right;">${c2a_config.autocomplete.texts.manual_entry_toggle}</label>
								</div>
							</div>
							<div class="control"><input class="cc_search_input input-text" type="text"/></div>
						</div>
					</div>
				`
				form.find('[name="street[0]"]').closest('.field-row').before( tmp_html );
			} else if (!c2a_config.autocomplete.advanced.hide_fields && !c2a_config.autocomplete.advanced.use_first_line) {
				var tmp_html = `
					<div class="field-row" ${custom_id}>
						<div class="field">
							<div style="display: flex; flex-direction: row; justify-content: space-between">
								<label style="color: #838383; cursor: default; max-width: 150px; margin-bottom: 5px;">${c2a_config.autocomplete.texts.search_label}</label>
							</div>
							<div class="control"><input class="cc_search_input input-text" type="text"/></div>
						</div>
					</div>
				`
				form.find('[name="street[0]"]').closest('.field-row').before( tmp_html );
			} else if (!c2a_config.autocomplete.advanced.hide_fields && c2a_config.autocomplete.advanced.use_first_line) {
				var tmp_html = `
					<div class="field-row">
						<div class="field">
							<div style="display: flex; flex-direction: row; justify-content: space-between">
								<label style="color: #838383; cursor: default; max-width: 150px; margin-bottom: 5px;">${c2a_config.autocomplete.texts.search_label}</label>
							</div>
						</div>
					</div>
				`
				form.find('[name="street[0]"]').closest('.field-row').before( tmp_html );
				form.find('[name="street[0]"]').addClass('cc_search_input');
			}

			if (c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
				form.find('[name="country_id"]').closest('div.field').wrap('<div class="field-row"></div>');
				if (c2a_config.autocomplete.advanced.use_first_line) {
					form.find('.cc_search_input').closest('div.field-row').prev('div.field-row').before(form.find('[name="country_id"]').closest('div.field-row'));
				} else {
					form.find('.cc_search_input').closest('div.field-row').before(form.find('[name="country_id"]').closest('div.field-row'));
				}
			}

			var dom = {
				search:		form.find('.cc_search_input'),
				company:	form.find('[name="company"]'),
				line_1:		form.find('[name="street[0]"]'),
				line_2:		form.find('[name="street[1]"]'),
				postcode:	form.find('[name="postcode"]'),
				town:		form.find('[name="city"]'),
				county:		{
							input:	form.find('[name="region"]'),
							list:	form.find('[name="region_id"]')
				},
				country:	form.find('[name="country_id"]')
			};
			window.cc_holder.attach({
				search:		dom.search[0],
				company:	dom.company[0],
				line_1:		dom.line_1[0],
				line_2:		dom.line_2[0],
				postcode:	dom.postcode[0],
				town:		dom.town[0],
				county:		{
					input:	dom.county.input,
					list:	dom.county.list
				},
				country:	dom.country[0]
			});
			form.find('.cc_hide_fields_action').on('click',function(){
				cc_hide_fields(dom, 'manual-show')
			});

			cc_hide_fields(dom,'init');
		}
	});
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
							jQuery(dom[elementsToHide[i]]).closest('fieldset.field').addClass('cc_hide');
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
		if(c2a_config.autocomplete.enabled && c2a_config.main.key != null){
			var config = {
				accessToken: c2a_config.main.key,
				onSetCounty: function(c2a, elements, county){
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
					if(elements.county.input.length == 2){
						c2a.setCounty(elements.county.input[1], county);
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
				onError: function(){
					if(typeof this.activeDom.postcode !== 'undefined'){
						cc_hide_fields(this.activeDom,'show');
					} else {
						c2a_config.autocomplete.advanced.hide_fields = false;
					}
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
			setInterval(cc_m2_c2a,200);
		}

		if(c2a_config.autocomplete.enabled && c2a_config.main.key == null){
			console.warn('ClickToAddress: Incorrect token format supplied');
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