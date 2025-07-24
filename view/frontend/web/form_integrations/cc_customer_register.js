window.cc_holder = null;

function cc_init() {
	if (!c2a_config.main.enable_extension) { return; }

	if (c2a_config.emailvalidation.enabled && c2a_config.main.key != null) {
		if (window.cc_holder == null) {
			window.cc_holder = new clickToAddress({
				accessToken: c2a_config.main.key,
				tag: 'magento2'
			});
		}

		setInterval(function() {
			var email_element = document.getElementById('email_address');
			if (email_element.dataset.cc != '1') {
				email_element.dataset.cc = '1';
				window.cc_holder.addEmailVerify({
					email: email_element
				});
			}
		}, 200);
	}
}

requirejs(['jquery'], function($) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', cc_init);
	} else {
		cc_init();
	}
});
