function cc_magento2(){
	jQuery('[name="postcode"]').each(function(index,elem){
		if(jQuery(elem).data('cc_attach') != '1'){
			jQuery(elem).data('cc_attach','1');
			var form = jQuery(elem).closest('form');

			var tmp_html = '<div class="field"><label class="label">'+c2a_config.texts.search_label+'</label><div class="value"><input id="cc_'+cc_index+'_search_input" type="text"/></div></div>';
			form.find('[name="street[0]"]').closest('fieldset').before( tmp_html );

			cc_holder.attach({
				search:		form.find('#cc_'+cc_index+'_search_input')[0],
				company:	form.find('[name="company"]')[0],
				line_1:		form.find('[name="street[0]"]')[0],
				line_2:		form.find('[name="street[1]"]')[0],
				postcode:	form.find('[name="postcode"]')[0],
				town:		form.find('[name="city"]')[0],
				county:		{
							input:	form.find('[name="region"]'),
							list:	form.find('[name="region_id"]')
				},
				country:	form.find('[name="country_id"]')[0]
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
			cc_holder = new clickToAddress(config);
			setInterval(cc_magento2,200);
		}
	});
});
