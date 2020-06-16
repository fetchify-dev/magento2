window.cc_holder = null;
requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(!c2a_config.main.enable_extension){ return; }
		if(c2a_config.emailvalidation.enabled && c2a_config.main.key != null){
			if(window.cc_holder == null){
				window.cc_holder = new clickToAddress({
					accessToken: c2a_config.main.key,
				})
			}
			setInterval(function(){
				var email_elements = jQuery('input#email_address');
				email_elements.each(function(index){
					var email_element = email_elements.eq(index);
					if( email_element.data('cc') != '1'){
						email_element.data('cc', '1');
						window.cc_holder.addEmailVerify({
							email: email_element[0]
						})
					}
				});
			}, 200);
		}
	});
});

function triggerEvent(eventName, target){
	var event;
	if (typeof(Event) === 'function') {
		 event = new Event(eventName);
	} else {
		 event = document.createEvent('Event');
		 event.initEvent(eventName, true, true);
	}
	target.dispatchEvent(event);
}