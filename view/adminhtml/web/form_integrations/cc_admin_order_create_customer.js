
var cc_activate_flags = [];
function activate_cc_m2(){
	jQuery('[name$="_address][postcode]"]').each(function(index,elem){
		if(jQuery(elem).data('cc_attach') != '1' && !jQuery(elem).prop('disabled')){
			jQuery(elem).data('cc_attach','1');
			var form = jQuery(elem).closest('fieldset');

			var tmp_html = '<div class="admin__field"><label class="admin__field-label">'+c2a_config.texts.search_label+'</label><div class="admin__field-control"><input id="cc_'+cc_index+'_search_input" class="admin__control-text" type="text"/></div></div>';
			form.find('[name$="_address][street][0]"]').closest('div.admin__field').before( tmp_html );

			cc_holder.attach({
				search:		form.find('#cc_'+cc_index+'_search_input')[0],
				company:	form.find('[name$="_address][company]"]')[0],
				line_1:		form.find('[name$="_address][street][0]"]')[0],
				line_2:		form.find('[name$="_address][street][1]"]')[0],
				postcode:	form.find('[name$="_address][postcode]"]')[0],
				town:		form.find('[name$="_address][city]"]')[0],
				county:		{
							input:	form.find('[name$="_address][region]"]'),
							list:	form.find('[name$="_address][region_id]"]')
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
				showLogo: false,
				texts: c2a_config.texts,
				cssPath: false,
				tag: 'Magento 2 - int'
			};
			cc_holder = new clickToAddress(config);
			setInterval(activate_cc_m2,200);
		}
	});
});
