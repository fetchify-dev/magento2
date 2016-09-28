
var cc_activate_flags = [];
function activate_cc_m2(){
	jQuery('[name="postcode"]').each(function(index,elem){
		if(jQuery(elem).data('cc_attach') != '1'){
			jQuery(elem).data('cc_attach','1');
			var form = jQuery(elem).closest('form');

			var tmp_html = '<div class="field"><label class="label">'+c2a_config.texts.search_label+'</label><div class="value"><input id="cc_'+cc_index+'_search_input" type="text"/></div></div>';
			form.find('#street_1').closest('.field').before( tmp_html );

			var config = {
				accessToken: c2a_config.key,
				dom: {
					search:		form.find('#cc_'+cc_index+'_search_input')[0],
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
					jQuery(elements.country).trigger('change');
					c2a.setCounty(elements.county.list[0], county);
					c2a.setCounty(elements.county.input[0], county);
				},
				domMode: 'object',
				geocode: false,
				gfxMode: c2a_config.gfx_mode,
				defaultCountry: 'usa',
				style: {
					ambient: c2a_config.gfx_ambient,
					accent: c2a_config.gfx_accent
				},
				showLogo: false,
				texts: c2a_config.texts,
				onResultSelected: function(c2a, elements, address){
					jQuery(elements.country).trigger('change');
					jQuery(elements.company).trigger('change');
					jQuery(elements.line_1).trigger('change');
					jQuery(elements.line_2).trigger('change');
					jQuery(elements.postcode).trigger('change');
					jQuery(elements.town).trigger('change');
					jQuery(elements.county.input).trigger('change');
					jQuery(elements.county.list).trigger('change');
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
			new clickToAddress(config);
			cc_index++;
		}
	});
}
var cc_index = 0;
requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(c2a_config.enabled){
			setInterval(activate_cc_m2,200);
		}
	});
});
