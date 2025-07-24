require(['jquery', 'jquery/ui', 'jquery/validate'], function(jQuery) {
	function enhance_config() {
		if (document.getElementById('fetchify_global_gfx_options_accent')) {
			document.getElementById('fetchify_global_gfx_options_accent').style.display = 'none';

			var colourpicker = document.createElement('div');
			colourpicker.classList.add('colour-set');

			document.getElementById('fetchify_global_gfx_options_accent').after(colourpicker);

			var colours = {
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

			var keys = Object.keys(colours);

			for (var i = 0; i < keys.length; i++) {
				var colour_cube = document.createElement('div');
				colour_cube.classList.add('colour-cube');
				colour_cube.dataset.value = keys[i];
				colour_cube.style.backgroundColor = colours[keys[i]];

				document.querySelector('.colour-set').append(colour_cube);
			}

			var initial_cube = document.getElementById('fetchify_global_gfx_options_accent').value;

			document.querySelectorAll('.colour-set .colour-cube').forEach(function(item) {
				if (item.dataset.value == initial_cube) {
					item.classList.add('active');
				}

				item.addEventListener('click', (e) => {
					document.getElementById('fetchify_global_gfx_options_accent').value = e.target.dataset.value;
					document.querySelectorAll('.colour-set .colour-cube').forEach(function(cube) { cube.classList.remove('active'); });
					e.target.classList.add('active');
				});
			});
		}

		jQuery.validator.addMethod('token-format', function(value, element) {
			// attempt to correct typos
			value = value.toLowerCase().replace(/-{2,}/g, '-').replace(/^-|-$|[^a-f0-9-]/g, '');
			document.getElementById('fetchify_main_main_options_accesstoken').value = value;

			// validate token format
			var patt = /(?!xxxxx)^[a-f0-9?]{5}?(-[a-f0-9]{5}){3}?$/;
			if (patt.test(value)) {
				return this.optional(element) || patt.test(value);
			}

			return false;
		}, 'Please check your access token is formatted correctly or <a href="https://account.fetchify.com/#/signup">sign up for a token here</a>.');

		jQuery.validator.addMethod('exclusion-areas', function(value, element) {
			value = value.toLowerCase().replace(/ /g, '');
			document.getElementById('fetchify_global_exclusions_areas').value = value;

			var patt = /^[a-z_,]*$/;
			if (patt.test(value)) {
				return this.optional(element) || patt.test(value);
			}
		}, 'Please do not include numbers or special characters (except for underscores and commas).');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', enhance_config);
	} else {
		enhance_config();
	}
});
