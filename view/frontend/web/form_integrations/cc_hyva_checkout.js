window.cc_holder = null;
var cc_index = 0;
var cc_applied_phone = [];
var cc_applied_email = [];

function fetchify_init() {
  if (!c2a_config.main.enable_extension) return;

  if (c2a_config.main.key == null) {
    console.warn('Fetchify: No token supplied');
    return;
  }

  if (c2a_config.autocomplete.enabled) activate_address_autocomplete();
  if (c2a_config.postcodelookup.enabled) activate_postcode_lookup();
  if (c2a_config.phonevalidation.enabled) activate_phone_validation();
  if (c2a_config.emailvalidation.enabled) activate_email_validation();
}

// Address Auto-Complete
function activate_address_autocomplete() {
  var config = {
    accessToken: c2a_config.main.key,
    domMode: 'object',
    gfxMode: c2a_config.autocomplete.gfx_mode,
    style: {
      ambient: c2a_config.autocomplete.gfx_ambient,
      accent: c2a_config.autocomplete.gfx_accent
    },
    showLogo: false,
    texts: c2a_config.autocomplete.texts,
    beforePopulate: function(c2a, elements, address) {
      // our js library only clears company field if it's value was set from a previous lookup
      // we need to clear it manually in case the value was set by something else
      elements.company.value = '';
    },
    onResultSelected: function(c2a, elements, address) {
      var line_3 = elements.search.closest('form').querySelector('[name="street[2]"]');
      if (line_3) {
        line_3.value = '';
        line_3.dispatchEvent(new Event('input'));
      }

      var line_4 = elements.search.closest('form').querySelector('[name="street[3]"]');
      if (line_4) {
        line_4.value = '';
        line_4.dispatchEvent(new Event('input'));
      }

      // Company, Address Line 2, and State/Province can all be disabled in Magento config
      if (elements.company) elements.company.dispatchEvent(new Event('input'));
      elements.line_1.dispatchEvent(new Event('input'));
      if (elements.line_2) elements.line_2.dispatchEvent(new Event('input'));
      elements.town.dispatchEvent(new Event('input'));
      if (elements.county) elements.county.dispatchEvent(new Event('input'));
      if (elements.county) elements.county.dispatchEvent(new Event('change'));
      elements.postcode.dispatchEvent(new Event('input'));

      cc_hide_fields(elements, 'show');
    },
    onError: function() {
      if (typeof this.activeDom.postcode !== 'undefined') {
        cc_hide_fields(this.activeDom, 'show');
      } else {
        c2a_config.autocomplete.advanced.hide_fields = false;
      }
    },
    onSetCounty: function(c2a, elements, county) {
      if (elements.county) {
        if (c2a.activeCountry === 'gbr' && !c2a_config.autocomplete.advanced.fill_uk_counties) {
            c2a.setCounty(elements.county, { code: '', name: '', preferred: '' });
        } else {
            c2a.setCounty(elements.county, county);
        }
      }
    },
    transliterate: c2a_config.autocomplete.advanced.transliterate,
    excludeAreas: c2a_config.autocomplete.exclusions.areas.concat(['gbr_channel_islands', 'gbr_isle_of_man']),
    excludePoBox: c2a_config.autocomplete.exclusions.po_box,
    debug: c2a_config.autocomplete.advanced.debug,
    cssPath: false,
    tag: 'magento2hy'
  };

  if (typeof c2a_config.autocomplete.enabled_countries !== 'undefined') {
    config.countryMatchWith = 'iso_2';
    config.enabledCountries = c2a_config.autocomplete.enabled_countries;
  }

  // Hyva checkout refreshes fields after country changes so we need to make sure country can't be changed from our search (lock_country_to_dropdown)
  config.countrySelector = false;
  config.onSearchFocus = function(c2a, dom) {
    var countryField = dom.search.closest('form').querySelector('[name="country_id"]');
    var currentCountry = countryField.options[countryField.selectedIndex].value;
    if (currentCountry !== '') {
      var countryCode = getCountryCode(c2a, currentCountry, 'iso_2');
      c2a.selectCountry(countryCode);
    }
  };

  window.cc_holder = new clickToAddress(config);

  setInterval(function() {
    document.querySelectorAll('[name="postcode"]:not([data-cc_attach="1"])').forEach(function(postcode_element) {
      var form = postcode_element.closest('form');

      // Wait for form to exist before continuing (needed on sites that load page elements via multiple ajax requests)
      if (
        !form.querySelector('[name="street[0]"], [name="street"]') ||
        !form.querySelector('[name="city"]') ||
        !form.querySelector('[name="country_id"]')
      ) {
        return;
      }

      postcode_element.dataset.cc_attach = '1';

      var fetchify_search_id = 'fetchify-search';

      if (c2a_config.autocomplete.advanced.search_elem_id !== null) {
        fetchify_search_id = c2a_config.autocomplete.advanced.search_elem_id;
      }

      // Null fix for m2_1.1.16
      if (c2a_config.autocomplete.texts.search_label == null) c2a_config.autocomplete.texts.search_label = '';

      // 'Use first address line for search' does not work when 'Hide Address Fields' is enabled
      if (c2a_config.autocomplete.advanced.use_first_line && !c2a_config.autocomplete.advanced.hide_fields) {
        form.querySelector('[name="street[0]"], [name="street"]').classList.add('cc_search_input');
      } else {
        var search_field =
          '<div class="col-span-12 field-wrapper field-type-text field field-reserved md:col-span-12">' +
            '<div class="field field-wrapper-inner">' +
              '<label for="' + fetchify_search_id + '" class="label text-sm text-slate-700">' + c2a_config.autocomplete.texts.search_label + '</label>' +
              '<div class="group input-group flex gap-4">' +
                '<input type="text" id="' + fetchify_search_id + '" class="form-input w-full grow text cc_search_input">' +
              '</div>' +
            '</div>' +
          '</div>';

        form.querySelector('[name="street[0]"], [name="street"]').closest('.field-wrapper').insertAdjacentHTML('beforebegin', search_field);
      }

      // Hyva checkout refreshes fields after country changes, so we act as if 'Lock country selection' is enabled even if it's not
      var country_element_wrapper = form.querySelector('[name="country_id"]').closest('div.field-wrapper');
      form.querySelector('.cc_search_input').closest('div.field-wrapper').before(country_element_wrapper);
      country_element_wrapper.classList.remove('md:col-span-6');
      country_element_wrapper.classList.add('md:col-span-12');

      var dom = {
        search:   form.querySelector('.cc_search_input'),
        company:  form.querySelector('[name="company"]'),
        line_1:   form.querySelector('[name="street[0]"], [name="street"]'),
        line_2:   form.querySelector('[name="street[1]"]'),
        town:     form.querySelector('[name="city"]'),
        county:   form.querySelector('[name="region"]') ?? form.querySelector('[name="region_id"]'),
        postcode: postcode_element,
      };

      window.cc_holder.attach(dom);

      // We don't want AAC to interact with the country field becuase Hyva refreshes the page on country change - so this has to be after running attach()
      dom.country = form.querySelector('[name="country_id"]');

      if (c2a_config.autocomplete.advanced.hide_fields) {
        var manual_entry_button =
          '<div class="col-span-12 field-wrapper field-type-text field field-reserved md:col-span-12 cc_hide_fields_action">' +
            '<span style="cursor: pointer;">' + c2a_config.autocomplete.texts.manual_entry_toggle +
              '<svg viewBox="0 0 305.67 179.25" style="display: inline-block; width: 1em;">' +
                '<rect x="-22.85" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(89.52 -37.99) rotate(45)"></rect>' +
                '<rect x="103.58" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(433.06 0.12) rotate(135)"></rect>' +
              '</svg>' +
            '</span>' +
          '</div>';

        form.querySelector('.cc_search_input').closest('.field-wrapper').insertAdjacentHTML('afterend', manual_entry_button);

        form.querySelector('.cc_hide_fields_action').addEventListener('click', function() {
          cc_hide_fields(dom, 'manual-show');
        });
      }

      cc_hide_fields(dom, 'init');
    });
  }, 200);
}

// Postcode Lookup
function activate_postcode_lookup() {
  setInterval(function() {
    document.querySelectorAll('[name="postcode"]:not([data-cc_pcl_applied="1"])').forEach(function(postcode_elem) {
      var form = postcode_elem.closest('form');

      /**
       * The Magento 2 checkout loads fields
       * asynchronously so we need to check
       * for the existence of multiple fields
       * before continuing. This helps avoid
       * a race condition scenario on slow
       * devices/connections.
       */
      if (
        !form.querySelector('[name="street[0]"], [name="street"]') ||
        !form.querySelector('[name="city"]') ||
        !form.querySelector('[name="country_id"]')
      ) {
        return;
      }

      postcode_elem.dataset.cc_pcl_applied = '1';

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
          company:     form.querySelector('[name="company"]'),
          address_1:   form.querySelector('[name="street[0]"], [name="street"]'), // When the form is configured to have only 1 address line, Hyva address line 1 uses 'street' instead of 'street[0]'
          address_2:   form.querySelector('[name="street[1]"]'),
          address_3:   form.querySelector('[name="street[2]"]'),
          address_4:   form.querySelector('[name="street[3]"]'),
          town:        form.querySelector('[name="city"]'),
          county:      form.querySelector('[name="region"]'),
          county_list: form.querySelector('[name="region_id"]'),
          postcode:    postcode_elem,
          country:     form.querySelector('[name="country_id"]')
        },
        sort_fields: {
          active: false,
          parent: '.field-wrapper:not(.additional)'
        },
        hide_fields: c2a_config.postcodelookup.hide_fields,
        txt: c2a_config.postcodelookup.txt,
        error_msg: c2a_config.postcodelookup.error_msg,
        county_data: c2a_config.postcodelookup.advanced.county_data,
        disable_country_change: true,
        ui: {
          onResultSelected: function(dataset, id, fields) {
            //fields.postcode.closest('form').querySelector('.cp_manual_entry').style.display = 'none';

            // Company, Address Line 2, and State/Province can all be disabled in Magento config
            if (fields.company) fields.company.dispatchEvent(new Event('input'));
            fields.address_1.dispatchEvent(new Event('input'));
            if (fields.address_2) fields.address_2.dispatchEvent(new Event('input'));
            if (fields.address_3) { fields.address_3.value = ''; fields.address_3.dispatchEvent(new Event('input')); }
            if (fields.address_4) { fields.address_4.value = ''; fields.address_4.dispatchEvent(new Event('input')); }
            fields.postcode.dispatchEvent(new Event('input'));
            fields.town.dispatchEvent(new Event('input'));
            if (fields.county) fields.county.dispatchEvent(new Event('input'));
            if (fields.county_list) fields.county_list.dispatchEvent(new Event('change'));
          }
        }
      };

      cc_index++;

      // STANDARD
      var postcode_wrapper =
        '<div class="search-bar" style="width: 100%; display: grid; grid-template-columns: auto min-content; grid-auto-rows: auto; grid-gap: 0.75em; width: 100%">' +
	      '<button type="button" class="btn btn-primary action" style="white-space: nowrap;">' + active_cfg.txt.search_buttontext + '</button>' +
          '<div class="search-list" style="display: none; grid-column-start: 1; grid-column-end: 3;">' +
            '<select class="block w-full form-input renderer-select"></select>' +
          '</div>' +
          '<div class="mage-error" style="grid-column-start: 1; grid-column-end: 3;" disabled>' +
            '<div class="search-subtext"></div>' +
          '</div>' +
        '</div>';
      postcode_elem.parentNode.insertAdjacentHTML('afterend', postcode_wrapper); // modify the Layout
      postcode_elem.style.width = '100%';
      form.querySelector('.search-bar').prepend(postcode_elem.parentNode);

      // input after postcode
      var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
      new_container.classList.add('search-container');
      new_container.id = active_cfg.id;

      // add/show manual entry text
      if (active_cfg.hide_fields) {
        if (!document.getElementById(active_cfg.id + '_cp_manual_entry') && postcode_elem.value === '') {
          var manual_entry_button =
            '<div id="' + active_cfg.id + '_cp_manual_entry" class="col-span-12 field-wrapper field-type-text field field-reserved md:col-span-12 cp_manual_entry">' +
              '<span style="cursor: pointer;">' + active_cfg.txt.manual_entry +
                '<svg viewBox="0 0 305.67 179.25" style="display: inline-block; width: 1em;">' +
                  '<rect x="-22.85" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(89.52 -37.99) rotate(45)"></rect>' +
                  '<rect x="103.58" y="66.4" width="226.32" height="47.53" rx="17.33" ry="17.33" transform="translate(433.06 0.12) rotate(135)"></rect>' +
                '</svg>' +
              '</span>' +
            '</div>';

          postcode_elem.closest('.field-wrapper').insertAdjacentHTML('afterend', manual_entry_button);

          var style = document.createElement('style');
          style.textContent = '.crafty_address_field_hidden { display: none; }';
          document.head.append(style);

          // Company, Address Line 2, and State/Province can all be disabled in Magento config
          if (active_cfg.dom.company) active_cfg.dom.company.closest('.field-wrapper').classList.add('crafty_address_field', 'crafty_address_field_hidden');
          active_cfg.dom.address_1.closest('.field-wrapper').classList.add('crafty_address_field', 'crafty_address_field_hidden');
          if (active_cfg.dom.address_2) active_cfg.dom.address_2.closest('.field-wrapper').classList.add('crafty_address_field', 'crafty_address_field_hidden');
          if (active_cfg.dom.address_3) active_cfg.dom.address_3.closest('.field-wrapper').classList.add('crafty_address_field', 'crafty_address_field_hidden');
          if (active_cfg.dom.address_4) active_cfg.dom.address_4.closest('.field-wrapper').classList.add('crafty_address_field', 'crafty_address_field_hidden');
          active_cfg.dom.town.closest('.field-wrapper').classList.add('crafty_address_field', 'crafty_address_field_hidden');
          if (active_cfg.dom.county) active_cfg.dom.county.closest('.field-wrapper').classList.add('crafty_address_field', 'crafty_address_field_hidden');
          if (active_cfg.dom.county_list) active_cfg.dom.county_list.closest('.field-wrapper').classList.add('crafty_address_field', 'crafty_address_field_hidden');

          document.getElementById('shipping-country_id').addEventListener('change', function() {
            var active_countries = ['GB', 'IM', 'JE', 'GG'];
            if (active_countries.indexOf(this.value) !== -1) {
              form.querySelectorAll('.crafty_address_field:not(.crafty_address_field_hidden)').forEach(function(element) {
                element.classList.add('crafty_address_field_hidden');
              });

              document.getElementById(active_cfg.id + '_cp_manual_entry').style.display = 'block';
            } else {
              form.querySelectorAll('.crafty_address_field.crafty_address_field_hidden').forEach(function(element) {
                element.classList.remove('crafty_address_field_hidden');
              });

              document.getElementById(active_cfg.id + '_cp_manual_entry').style.display = 'none';
            }
          });

          document.getElementById(active_cfg.id + '_cp_manual_entry').addEventListener('click', function() {
            form.querySelectorAll('.crafty_address_field').forEach(function(element) {
              element.classList.remove('crafty_address_field_hidden');
            });

            document.getElementById(active_cfg.id + '_cp_manual_entry').style.display = 'none';
          });
        }
      }

      var cc_generic = new cc_ui_handler(active_cfg);
      cc_generic.activate();
    });
  }, 200);
}

// Phone Validation
function activate_phone_validation() {
  if (window.cc_holder == null) {
    window.cc_holder = new clickToAddress({
      accessToken: c2a_config.main.key,
    });
  }

  setInterval(function() {
    var phone_elements = document.querySelectorAll('input[name="telephone"]');
    phone_elements.forEach(function(phone_element) {
      if (cc_applied_phone.indexOf(phone_element.id) === -1) {
        cc_applied_phone.push(phone_element.id);
        var country = phone_element.closest('form').querySelector('select[name="country_id"]');
        window.cc_holder.addPhoneVerify({
          phone: phone_element,
          country: country
        });
      }
    });
  }, 200);
}

// Email Validation
function activate_email_validation() {
  if (window.cc_holder == null) {
    window.cc_holder = new clickToAddress({
      accessToken: c2a_config.main.key,
    });
  }

  setInterval(function() {
    var email_elements = document.querySelectorAll('input[name="email_address"]');
    email_elements.forEach(function(email_element) {
      if (cc_applied_email.indexOf(email_element.id) === -1) {
        cc_applied_email.push(email_element.id);
        window.cc_holder.addEmailVerify({
          email: email_element
        });
      }
    });
  }, 200);
}

function cc_hide_fields(dom, action) {
  if (!c2a_config.autocomplete.advanced.hide_fields) {
    return;
  }

  var action = action || 'show';
  switch (action) {
    case 'init':
      // determine if we can hide by default
      var formEmpty = true;

      // for hyva the country will always be locked in the dropdown so we can't hide the country field here
      var elementsToHide = ['line_1', 'line_2', 'town', 'postcode', 'company', 'county'];

      for (var i = 0; i < elementsToHide.length - 1; i++) { // -1 is to skip County
        if (dom[elementsToHide[i]] && dom[elementsToHide[i]].value !== '') {
          formEmpty = false;
        }
      }

      for (var i = 0; i < elementsToHide.length; i++) {
        if (dom[elementsToHide[i]]) {
          dom[elementsToHide[i]].closest('div.field-wrapper').classList.add('cc_hide');
        }
      }

      // store the checking loop in the DOM object
      var form = dom.postcode.closest('form');
      form.dataset.cc_hidden = 0;

      if (formEmpty) {
        cc_hide_fields(dom, 'hide');
      } else {
        cc_hide_fields(dom, 'show');
      }

      setInterval(function() { cc_reveal_fields_on_error(dom); }, 250);
      break;
    case 'hide':
      var form = dom.postcode.closest('form');
      form.querySelectorAll('.cc_hide').forEach(function(item) {
        item.classList.add('cc_hidden');
      });
      form.querySelector('.cc_hide_fields_action').classList.remove('cc_slider_on');
      form.dataset.cc_hidden = 1;
      break;
    case 'manual-show':
    case 'show':
      var form = dom.postcode.closest('form');
      form.querySelectorAll('.cc_hide').forEach(function(item) {
        item.classList.remove('cc_hidden');
      });
      form.querySelector('.cc_hide_fields_action').style.display = 'none';
      form.dataset.cc_hidden = 0;
      break;
    case 'toggle':
      var form = dom.postcode.closest('form');
      if (form.dataset.cc_hidden === 1) {
        cc_hide_fields(dom, 'show');
      } else {
        cc_hide_fields(dom, 'hide');
      }
      break;
  }
}

function cc_reveal_fields_on_error(dom) {
  var form = dom.postcode.closest('form');
  var errors_present = false;
  form.querySelectorAll('.cc_hide').forEach(function(item) {
    if (item.classList.contains('_error')) {
      errors_present = true;
    }
  });

  if (errors_present) {
    cc_hide_fields(dom, 'show');
    form.find('.cc_hide_fields_action').style.display = 'none'; // prevent the user from hiding the fields again
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchify_init);
} else {
  fetchify_init();
}
