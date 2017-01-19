
var cc_activate_flags = [];
function activate_cc_m2(){
	jQuery('[name$="_address][postcode]"]').each(function(index,elem){
		if(jQuery(elem).data('cc_attach') != '1' && !jQuery(elem).prop('disabled')){
			jQuery(elem).data('cc_attach','1');
			var form = jQuery(elem).closest('fieldset');

			var tmp_html = '<div class="admin__field"><label class="admin__field-label">'+c2a_config.texts.search_label+'</label><div class="admin__field-control"><input id="cc_'+cc_index+'_search_input" class="cc_search_bar admin__control-text" type="text"/></div></div>';
			form.find('[name$="_address][street][0]"]').closest('div.admin__field').before( tmp_html );
			form.attr('id','cc-fieldset-'+index);
			cc_holder.attach({
				search:		form.find('#cc_'+cc_index+'_search_input')[0],
				company:	form.find('[name$="_address][company]"]')[0],
				line_1:		form.find('[name$="_address][street][0]"]')[0],
				line_2:		form.find('[name$="_address][street][1]"]')[0],
				postcode:	form.find('[name$="_address][postcode]"]')[0],
				town:		form.find('[name$="_address][city]"]')[0],
				county:		{
							input:	form.find('[name$="_address][region]"]'),
							list:	form.find('[name$="_address][region_id]"]'),
							fieldsetSelector: '#cc-fieldset-'+index
				},
				country:	form.find('select[name$="_address][country_id]"]')[0]
			});
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
					var fieldset = jQuery(elements.county.fieldsetSelector);
					var current_id = fieldset.find('input.cc_search_bar').attr('id');

					if ("createEvent" in document) {
						var evt = document.createEvent("HTMLEvents");
						evt.initEvent("change", false, true);
						elements.country.dispatchEvent(evt);
					}
					else
						elements.country.fireEvent("onchange");

					if(fieldset.find(elements.county.list.selector).attr('id').indexOf('shipping') > -1){
						var change_tracker = setInterval(function(){
							var fieldset = jQuery(elements.county.fieldsetSelector);
							if( typeof fieldset.find('input.cc_search_bar').attr('id') == 'undefined' ||
								fieldset.find('input.cc_search_bar').attr('id') == current_id ){
								return;
							}
							clearInterval(change_tracker);
							c2a.setCounty(fieldset.find(elements.county.list.selector)[0], county);
							c2a.setCounty(fieldset.find(elements.county.input.selector)[0], county);
						},50);
					} else {
						setTimeout(function(){
							c2a.setCounty(elements.county.list[0], county);
							c2a.setCounty(elements.county.input[0], county);
						},100);
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
				cssPath: false,
				tag: 'Magento 2 - int'
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
			setInterval(activate_cc_m2,200);
		}
	});
});
