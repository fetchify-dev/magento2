require(['jquery', 'jquery/ui', 'jquery/validate', 'mage/translate'],function(jQuery){
	jQuery(document).ready(function() {
		if(jQuery('#cc_uk_gfx_options_accent').length){
			jQuery('#cc_uk_gfx_options_accent').hide();
			var colorpicker = '<div class="color-set"></div>';
			jQuery('#cc_uk_gfx_options_accent').after(colorpicker);
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
			for(var i=0; i<keys.length; i++){
				jQuery('.color-set').append('<div class="color-cube" data-value="'+keys[i]+'" style="background-color: '+colors[keys[i]]+'"></div>');
			}
			var initial_cube = jQuery('#cc_uk_gfx_options_accent').val();
			jQuery('.color-set .color-cube').each(function(index, item){
				if(jQuery(item).data('value') == initial_cube){
					jQuery(item).addClass('active');
				}
				jQuery(item).on('click', function(event){
					jQuery('#cc_uk_gfx_options_accent').val(jQuery(this).data('value'));
					jQuery('.color-set .color-cube').each(function(index, cube){ jQuery(cube).removeClass('active'); });
					jQuery(this).addClass('active');
				});
			});

			/*jQuery('#cc_uk_main_options_accesstoken').closest('tr').after('<tr><td class="label">Fetch Token</td><td class="value"><div class="cc-login-block"></div></td></tr>');
			jQuery('.cc-login-block').append('<input type="text" placeholder="email" name="cc-login-email"/>');
			jQuery('.cc-login-block').append('<input type="password" placeholder="password" name="cc-login-password"/>');
			jQuery('.cc-login-block').append('<button>Fetch</button>');
			jQuery('.cc-login-block').append('<select></select>');
			var ccBlock = jQuery('.cc-login-block');
			//LOGIN BUTTON
			ccBlock.find('button').on('click',function(event){
				event.preventDefault();
				getToken(ccBlock.find('input[name="cc-login-email"]').val(),ccBlock.find('input[name="cc-login-password"]').val());
			});
			*/
		}

		jQuery.validator.addMethod('token-format', function(value, element) {
			// attempt to correct typos
			value = value.toLowerCase().replace(/-{2,}/g, "-").replace(/^-|-$|[^a-f0-9-]/g, "");
			jQuery('#cc_global_main_options_accesstoken').val(value);

			// validate token format
			let patt = /(?!xxxxx)^[a-f0-9?]{5}?(-[a-f0-9]{5}){3}?$/;
			if (patt.test(value)) {
				return this.optional(element) || patt.test(value);
			}
			return false;
		}, 'Please check your access token is formatted correctly or <a href="https://account.craftyclicks.co.uk/#/signup">sign up for a token here</a>.');
	});
});

function getToken(email, password){

	var access_token="";
	var account_id ="";
	var tokenHolder=[];

	//first we fetch our access_token
	jQuery.ajax({
		dataType : "json",
		contentType: "application/json; charset=utf-8",
		headers : {"CRAFTY-CLICKS-APPLICATION-KEY" : "1234567890", "Content-Type" : "application/json"},
		url : "http://adam_pc.craftyclicks.lan/crafty_new_admin_api/access/token",
		type : "POST",
		beforeSend: function(xhr){
			xhr.setRequestHeader("Authorization", "Basic " + btoa(email + ":" + password));
		},
		success : function(accessTokenData){
			access_token=accessTokenData.access_token;
			account_id=accessTokenData.user_info.account_id;
			var data = {
				"account_id" : account_id
			};
			//if the access token fetch was successful we punch it into the Access Token acquiring request with a new ajax request
			jQuery.ajax({
				data: JSON.stringify(data),
				dataType : "json",
				beforeSend: function(jqXHR, settings) {},
				contentType: "application/json; charset=utf-8",
				headers : {"CRAFTY-CLICKS-APPLICATION-KEY" : "1234567890", "Content-Type" : "application/json", "CRAFTY-CLICKS-AUTHENTICATION-TOKEN" : access_token},
				url : "https://account-api.craftyclicks.lan/ws_tokens/get",
				type : "POST",
				success : function(wsTokenData){
					var tokens=[];
					var dropdown = jQuery('.cc-login-block select');
					for (var i = 0; i < wsTokenData.ws_tokens.length; i++) {
						var html = '<option value="'+wsTokenData.ws_tokens[i].token+'">';
						html += wsTokenData.ws_tokens[i].token;
						if(wsTokenData.ws_tokens[i].nickname != ''){
							html += '('+wsTokenData.ws_tokens[i].nickname+')';
						}
						html += '</option>';
						dropdown.append(html);
					}
				},
				error : function(error){
					console.log(error);
				}
			});
			jQuery('.login-form').hide(500);
			jQuery('.loading').hide(500);
			jQuery('.tokens').show(500);
			jQuery('.error').hide(500);
			jQuery('.btn-default').show();
		},
		error : function(error){
				jQuery('.login-form').show(500);
				jQuery('.error').show(1000);
		}
	});
}
