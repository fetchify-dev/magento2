function activate_cc_m2_uk() {
	if (c2a_config.postcodelookup.enabled) {
		var postcode_elements = document.querySelectorAll('[name="postcode"]');
		postcode_elements.forEach(function(postcode_elem) {
			if (postcode_elem.dataset.cc != '1') {
				var active_cfg = {
					id: 'm2_' + cc_index,
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
					dom: {
						company:	form.querySelector('[name="company"]'),
						address_1:	form.querySelector('[name="street[0]"]'),
						address_2:	form.querySelector('[name="street[1]"]'),
						address_3:	form.querySelector('[name="street[2]"]'),
						postcode:	postcode_elem,
						town:		form.querySelector('[name="city"]'),
						county:		form.querySelector('[name="region"]'),
						county_list:form.querySelector('[name="region_id"]'),
						country:	form.querySelector('[name="country_id"]')
					};
					sort_fields: {
						active: true,
						parent: '.field:not(.additional)'
					},
					hide_fields: c2a_config.postcodelookup.hide_fields,
					txt: c2a_config.postcodelookup.txt,
					error_msg: c2a_config.postcodelookup.error_msg,
					county_data: c2a_config.postcodelookup.advanced.county_data,
				};

				cc_index++;
				
				var form = postcode_elem.closest('form');

				// modify the Chceckout
				var wrapper = document.createElement('div');
				wrapper.classList.add('search-bar');
				postcode_elem.replaceWith(wrapper);
				wrapper.appendChild(postcode_elem);
				postcode_elem.insertAdjacentHTML('afterend', '<button type="button" class="action primary">' +
					'<span>' + active_cfg.txt.search_buttontext + '</span></button>');

				// IWD
				postcode_elem.closest('.field').insertAdjacentHTML('afterend', '<div class="field crafty-results-container" style="display:none;"><div class="control"><div class="scroll-wrapper" tabindex="0" style="position: relative;">' +
					'<div class="iwd_opc_select_container scroll-content selected search-list" style="height: auto;">' +
					'</div><div class="scroll-element scroll-x"><div class="scroll-element_outer"><div class="scroll-element_size"></div><div class="scroll-element_track"></div><div class="scroll-bar" style="width: 100px;"></div></div></div><div class="scroll-element scroll-y"><div class="scroll-element_outer"><div class="scroll-element_size"></div>' +
					'<div class="scroll-element_track"></div><div class="scroll-bar" style="height: 100px; top: 0px;"></div></div></div></div></div></div>');

				// input after postcode
				var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
				new_container.id = active_cfg.id;
				new_container.classList.add('search-container', 'type_3');

				active_cfg.ui = {
					select_builder: function(lines, search_list) {
						search_list.innerHtml = '';
						for (var i = 0; i < lines.length; i++) {
							var option = document.createElement('div');
							option.classList.add('iwd_opc_select_option', 'option_element');
							option.dataset.id = i;
							option.textContent = lines[i];
							search_list.appendChild(option);
						}
						search_list.querySelector('div.iwd_opc_select_option:first-child').classList.add('selected');
						search_list.closest('div.field').style.display = 'block';
					},
					select_trigger: function(search_list, cc) {
						search_list.querySelectorAll('div.option_element').forEach(function(option) {
							// We clone and replace the node to remove all event listeners, since native JavaScript has no easy replacement for jQuery's .off()
							option.replaceWith(option.cloneNode(true));
						});

						search_list.querySelectorAll('div.option_element').forEach(function(option) {
							option.addEventListener('click', function(event) {
								cc.select(postcode, event.target.dataset.id);
								search_list.closest('div.field').style.display = 'none';
							});
						});
					}
				};
				
				active_cfg.dom.postcode.dataset.cc = '1';

				var cc_generic = new cc_ui_handler(active_cfg);
				cc_generic.activate();
			}
		});
	}
}

var cc_index = 0;

function cc_init() {
	if (!c2a_config.main.enable_extension) { return; }
	if (c2a_config.postcodelookup.enabled) {
		setInterval(activate_cc_m2_uk, 200);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', cc_init);
} else {
	cc_init();
}
