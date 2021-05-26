require(['jquery', 'jquery/ui', 'jquery/validate', 'mage/translate'], function(jQuery) {
	jQuery(document).ready(function() {
		if (jQuery('#fetchify_global_gfx_options_accent').length) {
			jQuery('#fetchify_global_gfx_options_accent').hide();

			var colorpicker = '<div class="color-set"></div>';
			jQuery('#fetchify_global_gfx_options_accent').after(colorpicker);

			var colors = {
				default:	'#63a2f1',
				red:		'#F44336',
				pink:		'#E91E63',
				purple:		'#9C27B0',
				deepPurple:	'#673ab7',
				indigo:		'#3f51b5',
				blue:		'#2196f3',
				lightBlue:	'#03a9f4',
				cyan:		'#00bcd4',
				teal:		'#009688',
				green:		'#4caf50',
				lightGreen:	'#8bc34a',
				lime:		'#cddc39',
				yellow:		'#ffeb3b',
				amber:		'#ffc107',
				orange:		'#ff9800',
				deepOrange:	'#ff5722',
				brown:		'#795548',
				grey:		'#9e9e9e',
				blueGrey:	'#607d8b'
			};

			var keys = Object.keys(colors);

			for (var i = 0; i < keys.length; i++) {
				jQuery('.color-set').append('<div class="color-cube" data-value="' + keys[i] + '" style="background-color: ' + colors[keys[i]] + '"></div>');
			}

			var initial_cube = jQuery('#fetchify_global_gfx_options_accent').val();

			jQuery('.color-set .color-cube').each(function(index, item) {
				if (jQuery(item).data('value') == initial_cube) {
					jQuery(item).addClass('active');
				}

				jQuery(item).on('click', function(event) {
					jQuery('#fetchify_global_gfx_options_accent').val(jQuery(this).data('value'));
					jQuery('.color-set .color-cube').each(function(index, cube) { jQuery(cube).removeClass('active'); });
					jQuery(this).addClass('active');
				});
			});
		}

		jQuery.validator.addMethod('token-format', function(value, element) {
			// attempt to correct typos
			value = value.toLowerCase().replace(/-{2,}/g, '-').replace(/^-|-$|[^a-f0-9-]/g, '');
			jQuery('#fetchify_main_main_options_accesstoken').val(value);

			// validate token format
			var patt = /(?!xxxxx)^[a-f0-9?]{5}?(-[a-f0-9]{5}){3}?$/;
			if (patt.test(value)) {
				return this.optional(element) || patt.test(value);
			}

			return false;
		}, 'Please check your access token is formatted correctly or <a href="https://account.fetchify.com/#/signup">sign up for a token here</a>.');

		jQuery.validator.addMethod('exclusion-areas', function(value, element) {
			value = value.toLowerCase().replace(/ /g, '');
			jQuery('#fetchify_global_exclusions_areas').val(value);

			var patt = /^[a-z_,]*$/;
			if (patt.test(value)) {
				return this.optional(element) || patt.test(value);
			}
		}, 'Please do not include numbers or special characters (except for underscores and commas).');
	});
});