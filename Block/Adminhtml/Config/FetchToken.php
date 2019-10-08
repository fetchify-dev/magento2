<?php

namespace Craftyclicks\Clicktoaddress\Block\Adminhtml\Config;

/**
 * Version block
 */
class FetchToken extends \Magento\Config\Block\System\Config\Form\Fieldset
{

	public function render(\Magento\Framework\Data\Form\Element\AbstractElement $element)
	{

		$html = "

		<div>
			<button id='cc_modal_button' style='margin: 10px 0 0 33%;'>Find My Token</button>
		</div>
		
		<script>
			// tell vue how many tokens to return
			var token_option = 'single';

			// listen for message from iframe
			window.addEventListener('message', getMessage, false);
			function getMessage(e) {
				if (e.data.payload) {
					// cancel token insertion?
					if (typeof e.data.payload.cancel != 'undefined') {
						document.querySelector('#crafty_background').remove();
					} else {
						handleTokens(e.data.payload);
					}
				}
			}

			// update form and destroy popup
			function handleTokens(tokens) {
				if (token_option == 'single') {
					document.querySelector('#cc_global_main_options_accesstoken').value = tokens.single;
				} else if (token_option == 'dual') {
					document.querySelector('cc_global_main_options_accesstoken').value = tokens.internal;
					// document.querySelector('#external_token_input').value = tokens.external;
				}
				document.querySelector('#crafty_background').remove();
			}

			// set event listener to launch the popup
			document.getElementById('cc_modal_button').addEventListener('click', () => {
				event.preventDefault();
				get_cc_token();
			});

			// launch the popup
			function get_cc_token() {
				cc_obj = {};

				cc_obj.make_popup = function() {
					if (document.querySelector('#crafty_background')) {
						return;
					}

					// create all html and insert onto page, but keep it hidden
					var crafty_background = document.createElement('div');
					crafty_background.setAttribute('id', 'crafty_background');
					crafty_background.style.display = 'none';
					var tmp_html = `
					<div id='crafty_content'>
						<div id='crafty_close'><svg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 490 490' style='enable-background:new 0 0 490 490;' xml:space='preserve'><g><g><g><path d='M207,182.8c-6.7-6.7-17.6-6.7-24.3,0s-6.7,17.6,0,24.3l38,38l-38,38c-6.7,6.7-6.7,17.6,0,24.3c3.3,3.3,7.7,5,12.1,5 c4.4,0,8.8-1.7,12.1-5l38-38l38,38c3.3,3.3,7.7,5,12.1,5s8.8-1.7,12.1-5c6.7-6.7,6.7-17.6,0-24.3l-38-38l38-38 c6.7-6.7,6.7-17.6,0-24.3s-17.6-6.7-24.3,0l-38,38L207,182.8z'></path><path d='M0,245c0,135.1,109.9,245,245,245s245-109.9,245-245S380.1,0,245,0S0,109.9,0,245z M455.7,245 c0,116.2-94.5,210.7-210.7,210.7S34.3,361.2,34.3,245S128.8,34.3,245,34.3S455.7,128.8,455.7,245z'></path></g></g></g></svg></div>
						<iframe id='crafty_iframe' src='https://account.craftyclicks.co.uk/#/external/fetch_my_tokens/` + token_option + `' frameborder='0'></iframe>
					</div>`;
					crafty_background.innerHTML = tmp_html;
					document.querySelector('body').appendChild(crafty_background);

					// add css styles, add event listener to close button, and finally unhide
					Object.assign(crafty_background.style, {
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						position: 'fixed',
						top: '0',
						right: '0',
						bottom: '0',
						left: '0',
						zIndex: '1000',
					});

					Object.assign(crafty_content.style, {
						position: 'relative',
						height: '500px',
						marginLeft: 'auto',
						marginRight: 'auto',
						marginTop: '8%',
						backgroundColor: '#fff',
						width: '100%',
						maxWidth: '600px',
						borderStyle: 'none',
						WebkitBoxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
					})

					Object.assign(document.querySelector('#crafty_iframe').style, {
						width: '600px',
						height: '500px',
					})

					Object.assign(document.querySelector('#crafty_close').style, {
						position: 'absolute',
						width: '20px',
						top: '15px',
						right: '15px',
						cursor: 'pointer',
						fill: 'silver',
					})

					document.querySelector('#crafty_close').addEventListener('click', () => {
						cc_obj.close_popup();
					})

					document.querySelector('#crafty_background').addEventListener('click', () => {
						cc_obj.close_popup();
					})

					document.querySelector('#crafty_background').style.display = 'block';
				}

				cc_obj.close_popup = function() {
					document.getElementById('crafty_background').remove();
				}

				cc_obj.make_popup();
			}			
		</script>";

		return $html;
	}
}
