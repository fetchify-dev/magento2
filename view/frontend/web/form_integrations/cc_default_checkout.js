function cc_magento2(){
	jQuery('[name="postcode"]').each(function(index,elem){
		if(jQuery(elem).data('cc_attach') != '1'){
			jQuery(elem).data('cc_attach','1');
			var form = jQuery(elem).closest('form');

			var custom_id = '';
			if(c2a_config.advanced.search_elem_id !== null){
				custom_id = ' id="'+ c2a_config.advanced.search_elem_id +'"'
			}


			var tmp_html = '<div class="field"'+custom_id+'><label class="label">' +
							c2a_config.texts.search_label+'</label>' +
							'<div class="value"><input id="cc_'+cc_index+'_search_input" type="text"/></div></div>';
			form.find('[name="street[0]"]').closest('fieldset').before( tmp_html );

			var dom = {
				search:		form.find('#cc_'+cc_index+'_search_input'),
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
			cc_holder.attach({
				search:		dom.search[0],
				company:	dom.company[0],
				line_1:		dom.line_1[0],
				line_2:		dom.line_2[0],
				postcode:	dom.postcode[0],
				town:			dom.town[0],
				county:		{
							input:	dom.county.input,
							list:	dom.county.list
				},
				country:	dom.country[0]
			});
			cc_hide_fields(dom);
			cc_index++;
		}
	});
}
var cc_index = 0;
var cc_holder = null;
requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(c2a_config.enabled){
			var config = {
				accessToken: c2a_config.key,
				onSetCounty: function(c2a, elements, county){
					jQuery(elements.country).trigger('change');
					if(elements.county.list.length == 1){
						c2a.setCounty(elements.county.list[0], county);
					}
					if(elements.county.input.length == 1){
						c2a.setCounty(elements.county.input[0], county);
					}
				},
				domMode: 'object',
				gfxMode: c2a_config.gfx_mode,
				style: {
					ambient: c2a_config.gfx_ambient,
					accent: c2a_config.gfx_accent
				},
				showLogo: false,
				texts: c2a_config.texts,
				onResultSelected: function(c2a, elements, address){
					// set by iso 2, instead of default country selection by name
					jQuery(elements.country).val(address.country.iso_3166_1_alpha_2);

					jQuery(elements.country).trigger('change');
					jQuery(elements.company).trigger('change');
					jQuery(elements.line_1).trigger('change');
					jQuery(elements.line_2).trigger('change');
					jQuery(elements.postcode).trigger('change');
					jQuery(elements.town).trigger('change');
					jQuery(elements.county.input).trigger('change');
					jQuery(elements.county.list).trigger('change');

					cc_hide_fields(elements,true);
				},
				onError: function(){
					if(typeof this.activeDom.postcode !== 'undefined'){
						cc_hide_fields(this.activeDom,true);
					} else {
						c2a_config.advanced.hide_fields = false;
					}
				},
				cssPath: false,
				tag: 'Magento 2'
			};
			if(typeof c2a_config.enabled_countries !== 'undefined'){
				config.countryMatchWith = 'iso_2';
				config.enabledCountries = c2a_config.enabled_countries;
			}
			if(c2a_config.advanced.lock_country_to_dropdown){
				config.countrySelector = false;
				config.onSearchFocus = function(c2a, dom){
					var currentCountry = dom.country.options[dom.country.selectedIndex].value;
					if(currentCountry !== ''){
						var countryCode = getCountryCode(c2a, currentCountry, 'iso_2');
						c2a.selectCountry(countryCode);
					}
				};
			}

			cc_holder = new clickToAddress(config);
			setInterval(cc_magento2,200);
		}
	});
});

function cc_hide_fields(dom, show){
	var show = show || false;
	if(!c2a_config.advanced.hide_fields){
		return;
	}
	var elementsToHide = ['line_1', 'line_2', 'town', 'postcode', 'county'];
	var allEmptySkip = 1;
	if(!c2a_config.advanced.lock_country_to_dropdown){
		elementsToHide.push('country');
		allEmptySkip++;
	}

	if(!show){
		// check if there's anything in the input boxes
		var allEmpty = true;
		for(var i=0; i<elementsToHide.length - allEmptySkip; i++){
			if(jQuery(dom[elementsToHide[i]]).val() !== ''){
				allEmpty = false;
			}
		}
		if(!allEmpty){
			return;
		}

		for(var i=0; i<elementsToHide.length; i++){
			switch(elementsToHide[i]){
				case 'county':
					jQuery(dom[elementsToHide[i]].input).closest('.field').hide();
					jQuery(dom[elementsToHide[i]].list).closest('.field').hide();
					break;
				case 'line_1':
					jQuery(dom[elementsToHide[i]]).closest('fieldset.field').hide();
					break;
				default:
					jQuery(dom[elementsToHide[i]]).closest('.field').hide();
			}
		}
	} else {
		for(var i=0; i<elementsToHide.length; i++){
			switch(elementsToHide[i]){
				case 'county':
					jQuery(dom[elementsToHide[i]].input).closest('.field').show();
					jQuery(dom[elementsToHide[i]].list).closest('.field').show();
					break;
				case 'line_1':
					jQuery(dom[elementsToHide[i]]).closest('fieldset.field').show();
					break;
				default:
					jQuery(dom[elementsToHide[i]]).closest('.field').show();
			}
		}
	}
}
