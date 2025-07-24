let cc_applied_phone = [];
let cc_applied_email = [];

function cc_m2_c2a() {
  /**
   * wait for form to exist before continuing
   * (needed on sites that load page elements
   * via multiple ajax requests)
   */
  if (document.querySelectorAll('[name="postcode"]').length === 0 || document.querySelectorAll('[name="street[0]"], [name="street"]').length === 0) {
    return;
  }

  document.querySelectorAll('[name="postcode"]').forEach((elem) => {
    if (elem.dataset.cc_attach != '1') {
      elem.dataset.cc_attach = '1';

      var form = elem.closest('form');
      var fetchify_search_id = 'fetchify-search';

      if (c2a_config.autocomplete.advanced.search_elem_id !== null) {
        fetchify_search_id = c2a_config.autocomplete.advanced.search_elem_id;
      }

      // null fix for m2_1.1.16
      if (c2a_config.autocomplete.texts.search_label == null) c2a_config.autocomplete.texts.search_label = '';

      const input = document.createElement('input');
      input.id = fetchify_search_id;
      input.classList.add('block', 'w-full', 'form-input', 'grow', 'renderer-text', 'cc_search_input');
      input.setAttribute('type', 'text');

      const wrapper1 = document.createElement('div');
      wrapper1.classList.add('flex', 'items-center', 'gap-4');
      wrapper1.appendChild(input);

      const label = document.createElement('label');
      label.classList.add('label');
      label.setAttribute('for', fetchify_search_id);
      label.innerText = c2a_config.autocomplete.texts.search_label;

      const wrapper2 = document.createElement('div');
      wrapper2.classList.add('w-full', 'font-medium', 'text-gray-700', 'relative');
      wrapper2.appendChild(label);
      wrapper2.appendChild(wrapper1);

      const wrapper3 = document.createElement('div');
      wrapper3.classList.add('col-span-12', 'group', 'field-wrapper', 'field-type-text', 'field', 'field-reserved', 'md:col-span-12');
      wrapper3.appendChild(wrapper2);

      if (c2a_config.autocomplete.advanced.hide_fields) {
        const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect1.setAttribute('x', '-22.85');
        rect1.setAttribute('y', '66.4');
        rect1.setAttribute('width', '226.32');
        rect1.setAttribute('height', '47.53');
        rect1.setAttribute('rx', '17.33');
        rect1.setAttribute('ry', '17.33');
        rect1.setAttribute('transform', 'translate(89.52 -37.99) rotate(45)');

        const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect2.setAttribute('x', '103.58');
        rect2.setAttribute('y', '66.4');
        rect2.setAttribute('width', '226.32');
        rect2.setAttribute('height', '47.53');
        rect2.setAttribute('rx', '17.33');
        rect2.setAttribute('ry', '17.33');
        rect2.setAttribute('transform', 'translate(433.06 0.12) rotate(135)');

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 305.67 179.25');
        svg.setAttribute('style', 'display: inline-block; width: 1em;');
        svg.appendChild(rect1);
        svg.appendChild(rect2);

        const button = document.createElement('span');
        button.innerText = c2a_config.autocomplete.texts.manual_entry_toggle;
        button.style.cursor = 'pointer';
        button.appendChild(svg);

        const button_wrapper = document.createElement('div');
        button_wrapper.classList.add('col-span-12', 'group', 'field-wrapper', 'field-type-text', 'field', 'field-reserved', 'md:col-span-12', 'cc_hide_fields_action');
        button_wrapper.appendChild(button);

        form.querySelector(':scope [name="country_id"]').closest('.field-wrapper').after(button_wrapper);
      }

      if (!c2a_config.autocomplete.advanced.use_first_line || c2a_config.autocomplete.advanced.hide_fields) {
        form.querySelector(':scope [name="street[0]"], :scope [name="street"]').closest('.field-wrapper').before(wrapper3);
      } else {
        form.querySelector(':scope [name="street[0]"], :scope [name="street"]').classList.add('cc_search_input');
      }

      if (c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
        if (c2a_config.autocomplete.advanced.use_first_line) {
          form.querySelector(':scope .cc_search_input').closest('div.field').before(form.querySelector(':scope [name="country_id"]').closest('div.field'));
        } else {
          form.querySelector(':scope .cc_search_input').closest('div.field').before(form.querySelector(':scope [name="country_id"]').closest('div.field'));
        }
      }

      var dom = {
        search:    form.querySelector(':scope .cc_search_input'),
        line_1:    form.querySelector(':scope [name="street[0]"], :scope [name="street"]'),
        line_2:    form.querySelector(':scope [name="street[1]"]'),
        country:  form.querySelector(':scope [name="country_id"]'),
        county:    form.querySelector(':scope [name="region"]') ?? form.querySelector(':scope [name="region_id"]'),
        postcode:  form.querySelector(':scope [name="postcode"]'),
        town:    form.querySelector(':scope [name="city"]'),
        company:  form.querySelector(':scope [name="company"]'),
      };

      window.cc_holder.attach({
        search:    dom.search,
        line_1:    dom.line_1,
        line_2:    dom.line_2,
        county:    dom.county,
        postcode:  dom.postcode,
        town:    dom.town,
        company:  dom.company,
      });

      if (!c2a_config.autocomplete.advanced.use_first_line || c2a_config.autocomplete.advanced.hide_fields) {
        form.querySelector(':scope .cc_hide_fields_action > span')?.addEventListener('click', () => {
          cc_hide_fields(dom, 'manual-show');
        });
      }

      cc_hide_fields(dom, 'init');
    }
  });
}

// Postcode Lookup
function activate_cc_m2_uk() {
  if (c2a_config.postcodelookup.enabled) {
    var cfg = {
      id: '',
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
      dom: {},
      sort_fields: {
        active: false,
        parent: '.field:not(.additional)'
      },
      hide_fields: c2a_config.postcodelookup.hide_fields,
      txt: c2a_config.postcodelookup.txt,
      error_msg: c2a_config.postcodelookup.error_msg,
      county_data: c2a_config.postcodelookup.advanced.county_data,
      disable_country_change: true,
      ui: {
        onResultSelected: function(dataset, id, fields) {
          //fields.postcode.closest('form').querySelector(':scope .cp_manual_entry').style.display = 'none';
          if (fields.address_4) {
            fields.address_4.value = '';
          }

          if (fields.company) fields.company.dispatchEvent(new Event('input'));
          if (fields.address_1) fields.address_1.dispatchEvent(new Event('input'));
          if (fields.address_2) fields.address_2.dispatchEvent(new Event('input'));
          if (fields.address_3) fields.address_3.dispatchEvent(new Event('input'));
          if (fields.address_4) fields.address_4.dispatchEvent(new Event('input'));
          if (fields.postcode) fields.postcode.dispatchEvent(new Event('input'));
          if (fields.town) fields.town.dispatchEvent(new Event('input'));
          if (fields.county) fields.county.dispatchEvent(new Event('input'));
          if (fields.county_list) fields.county_list.dispatchEvent(new Event('change'));
        }
      }
    };

    var dom = {
      company:  '[name="company"]',
      address_1:  '[name="street[0]"], [name="street"]', // When the form is configured to have only 1 address line, Hyva address line 1 uses 'street' instead of 'street[0]'
      address_2:  '[name="street[1]"]',
      address_3:  '[name="street[2]"]',
      address_4:  '[name="street[3]"]',
      postcode:  '[name="postcode"]',
      town:    '[name="city"]',
      county:    '[name="region"]',
      county_list:'[name="region_id"]',
      country:  '[name="country_id"]'
    };

    document.querySelectorAll(dom.postcode).forEach((postcode_elem) => {
      /**
       * The Magento 2 checkout loads fields
       * asynchronously so we need to check
       * for the existence of multiple fields
       * before continuing. This helps avoid
       * a race condition scenario on slow
       * devices/connections.
       */
      var form = postcode_elem.closest('form');
      if (
        postcode_elem.dataset.cc_pcl_applied !== '1'
        && form.querySelector(':scope ' + dom.address_1)
        && form.querySelector(':scope ' + dom.country)
      ) {
        var active_cfg = cfg;
        active_cfg.id = 'm2_' + cc_index;
        cc_index++;

        active_cfg.dom = {
          company:    form.querySelector(dom.company),
          address_1:    form.querySelector(dom.address_1),
          address_2:    form.querySelector(dom.address_2),
          address_3:    form.querySelector(dom.address_3),
          address_4:    form.querySelector(dom.address_4),
          postcode:    postcode_elem,
          town:      form.querySelector(dom.town),
          county:      form.querySelector(dom.county),
          county_list:  form.querySelector(dom.county_list),
          country:    form.querySelector(dom.country)
        };

        // STANDARD
        var postcodeButton = document.createElement('button');
        postcodeButton.setAttribute('type', 'button'); // Required to prevent form from submitting
        postcodeButton.classList.add('btn', 'btn-primary', 'action');
        postcodeButton.style.whiteSpace = 'nowrap';
        postcodeButton.innerHTML = active_cfg.txt.search_buttontext;

        var selectBox = document.createElement('select');
        selectBox.classList.add('block', 'w-full', 'form-input', 'renderer-select');

        var selectBoxWrapper = document.createElement('div');
        selectBoxWrapper.classList.add('search-list');
        selectBoxWrapper.style.display = 'none';
        selectBoxWrapper.style.gridColumnStart = '1';
        selectBoxWrapper.style.gridColumnEnd = '3';
        selectBoxWrapper.appendChild(selectBox);

        var errorBox = document.createElement('div');
        errorBox.classList.add('search-subtext');

        var errorBoxWrapper = document.createElement('div');
        errorBoxWrapper.classList.add('mage-error');
        errorBoxWrapper.style.gridColumnStart = '1';
        errorBoxWrapper.style.gridColumnEnd = '3';
        errorBoxWrapper.disabled = true;
        errorBoxWrapper.appendChild(errorBox);

        var wrappingElement = document.createElement('div');
        wrappingElement.classList.add('search-bar');
        wrappingElement.style.width = '100%';
        wrappingElement.style.display = 'grid';
        wrappingElement.style.gridTemplateColumns = 'auto min-content';
        wrappingElement.style.gridAutoRows = 'auto';
        wrappingElement.style.gridGap = '1em';
        postcode_elem.replaceWith(wrappingElement); // modify the Layout
        postcode_elem.style.width = '100%';
        wrappingElement.appendChild(postcode_elem);
        wrappingElement.appendChild(postcodeButton);
        wrappingElement.appendChild(selectBoxWrapper);
        wrappingElement.appendChild(errorBoxWrapper);

        // input after postcode
        var new_container = postcode_elem.closest(active_cfg.sort_fields.parent);
        new_container.classList.add('search-container');
        new_container.id = active_cfg.id;

        // add/show manual entry text
        if (active_cfg.hide_fields) {
          if (!document.getElementById(active_cfg.id + '_cp_manual_entry') && postcode_elem.value === '') {
            const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect1.setAttribute('x', '-22.85');
            rect1.setAttribute('y', '66.4');
            rect1.setAttribute('width', '226.32');
            rect1.setAttribute('height', '47.53');
            rect1.setAttribute('rx', '17.33');
            rect1.setAttribute('ry', '17.33');
            rect1.setAttribute('transform', 'translate(89.52 -37.99) rotate(45)');

            const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect2.setAttribute('x', '103.58');
            rect2.setAttribute('y', '66.4');
            rect2.setAttribute('width', '226.32');
            rect2.setAttribute('height', '47.53');
            rect2.setAttribute('rx', '17.33');
            rect2.setAttribute('ry', '17.33');
            rect2.setAttribute('transform', 'translate(433.06 0.12) rotate(135)');

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 305.67 179.25');
            svg.setAttribute('style', 'display: inline-block; width: 1em;');
            svg.append(rect1);
            svg.append(rect2);

            const button = document.createElement('span');
            button.innerText = active_cfg.txt.manual_entry;
            button.style.cursor = 'pointer';
            button.append(svg);

            const button_wrapper = document.createElement('div');
            button_wrapper.id = active_cfg.id + '_cp_manual_entry';
            button_wrapper.classList.add('col-span-12', 'group', 'field-wrapper', 'field-type-text', 'field', 'field-reserved', 'md:col-span-12', 'cp_manual_entry');
            button_wrapper.append(button);

            postcode_elem.closest('.field').after(button_wrapper);

            const style = document.createElement('style');
            style.textContent = '.crafty_address_field_hidden { display: none; }';
            document.head.appendChild(style);

            active_cfg.dom.address_1?.closest('.field').classList.add('crafty_address_field', 'crafty_address_field_hidden');
            active_cfg.dom.address_2?.closest('.field').classList.add('crafty_address_field', 'crafty_address_field_hidden');
            active_cfg.dom.address_3?.closest('.field').classList.add('crafty_address_field', 'crafty_address_field_hidden');
            active_cfg.dom.address_4?.closest('.field').classList.add('crafty_address_field', 'crafty_address_field_hidden');
            active_cfg.dom.company?.closest('.field').classList.add('crafty_address_field', 'crafty_address_field_hidden');
            active_cfg.dom.county?.closest('.field').classList.add('crafty_address_field', 'crafty_address_field_hidden');
            active_cfg.dom.county_list?.closest('.field').classList.add('crafty_address_field', 'crafty_address_field_hidden');
            active_cfg.dom.town?.closest('.field').classList.add('crafty_address_field', 'crafty_address_field_hidden');

            document.getElementById('shipping-country_id').addEventListener('change', () => {
              var active_countries = ['GB', 'IM', 'JE', 'GG'];
              if (active_countries.indexOf(this.value) !== -1) {
                form.querySelectorAll('.crafty_address_field:not(.crafty_address_field_hidden)').forEach((element) => {
                  element.classList.add('crafty_address_field_hidden');
                });
                document.getElementById(active_cfg.id + '_cp_manual_entry').style.display = 'block';
              } else {
                form.querySelectorAll('.crafty_address_field.crafty_address_field_hidden').forEach((element) => {
                  element.classList.remove('crafty_address_field_hidden');
                });
                document.getElementById(active_cfg.id + '_cp_manual_entry').style.display = 'none';
              }
            });

            document.getElementById(active_cfg.id + '_cp_manual_entry').addEventListener('click', () => {
              form.querySelectorAll('.crafty_address_field').forEach((element) => {
                element.classList.remove('crafty_address_field_hidden');
              });
              document.getElementById(active_cfg.id + '_cp_manual_entry').style.display = 'none';
            });
          }
        }

        var cc_generic = new cc_ui_handler(active_cfg);
        cc_generic.activate();

        postcode_elem.dataset.cc_pcl_applied = '1';
      }
    });
  }
}

var cc_index = 0;
window.cc_holder = null;

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
      var form = dom.country.closest('form');
      form.dataset.cc_hidden = 0;

      if (formEmpty) {
        cc_hide_fields(dom, 'hide');
      } else {
        cc_hide_fields(dom, 'show');
      }

      setInterval(function() { cc_reveal_fields_on_error(dom); }, 250);
      break;
    case 'hide':
      var form = dom.country.closest('form');
      form.querySelectorAll(':scope .cc_hide').forEach((item) => {
        item.classList.add('cc_hidden');
      });
      form.querySelector(':scope .cc_hide_fields_action').classList.remove('cc_slider_on');
      form.dataset.cc_hidden = 1;
      break;
    case 'manual-show':
    case 'show':
      var form = dom.country.closest('form');
      form.querySelectorAll(':scope .cc_hide').forEach((item) => {
        item.classList.remove('cc_hidden');
      });
      form.querySelector(':scope .cc_hide_fields_action').style.display = 'none';
      form.dataset.cc_hidden = 0;
      break;
    case 'toggle':
      var form = dom.country.closest('form');
      if (form.dataset.cc_hidden === 1) {
        cc_hide_fields(dom, 'show');
      } else {
        cc_hide_fields(dom, 'hide');
      }
      break;
  }
}

function cc_reveal_fields_on_error(dom) {
  var form = dom.country.closest('form');
  var errors_present = false;
  form.querySelectorAll(':scope .cc_hide').forEach((item) => {
    if (item.classList.contains('_error')) {
      errors_present = true;
    }
  });

  if (errors_present) {
    cc_hide_fields(dom, 'show');
    form.find('.cc_hide_fields_action').style.display = 'none'; // prevent the user from hiding the fields again
  }
}

window.addEventListener('load', function () {
  if (!c2a_config.main.enable_extension) { return; }

  if (c2a_config.autocomplete.enabled && c2a_config.main.key != null) {
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
        var line_3 = elements.search.closest('form').querySelector(':scope [name="street[2]"]');
        if (line_3) {
          line_3.value = '';
          line_3.dispatchEvent(new Event('input'));
        }

        var line_4 = elements.search.closest('form').querySelector(':scope [name="street[3]"]');
        if (line_4) {
          line_4.value = '';
          line_4.dispatchEvent(new Event('input'));
        }

        elements.line_1?.dispatchEvent(new Event('input'));
        elements.line_2?.dispatchEvent(new Event('input'));
        elements.county?.dispatchEvent(new Event('input'));
        elements.county?.dispatchEvent(new Event('change'));
        elements.postcode?.dispatchEvent(new Event('input'));
        elements.town?.dispatchEvent(new Event('input'));
        elements.company?.dispatchEvent(new Event('input'));

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
        if (c2a.activeCountry === 'gbr' && !c2a_config.autocomplete.advanced.fill_uk_counties) {
            c2a.setCounty(elements.county, { code: '', name: '', preferred: '' });
        } else {
            c2a.setCounty(elements.county, county);
        }
      },
      transliterate: c2a_config.autocomplete.advanced.transliterate,
      // hyva checkout refreshes fields after country changes so we need to make sure country can't be changed from our search
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

    // Hyva checkout refreshes fields after country changes so we need to make sure country can't be changed from our search
    //if (c2a_config.autocomplete.advanced.lock_country_to_dropdown) {
      config.countrySelector = false;
      config.onSearchFocus = function(c2a, dom) {
        var countryField = dom.search.closest('form').querySelector(':scope [name="country_id"]');
        var currentCountry = countryField.options[countryField.selectedIndex].value;
        if (currentCountry !== '') {
          var countryCode = getCountryCode(c2a, currentCountry, 'iso_2');
          c2a.selectCountry(countryCode);
        }
      };
    //}

    window.cc_holder = new clickToAddress(config);
    setInterval(cc_m2_c2a, 200);
  }

  if (c2a_config.autocomplete.enabled && c2a_config.main.key == null) {
    console.warn('ClickToAddress: Incorrect token format supplied');
  }

  if (c2a_config.postcodelookup.enabled) {
    setInterval(activate_cc_m2_uk, 200);
  }

  if (c2a_config.emailvalidation.enabled && c2a_config.main.key != null) {
    if (window.cc_holder == null) {
      window.cc_holder = new clickToAddress({
        accessToken: c2a_config.main.key,
      });
    }

    setInterval(function() {
      var email_elements = document.querySelectorAll('input[name="email_address"]');
      email_elements.forEach((email_element) => {
        if (cc_applied_email.indexOf(email_element.id) === -1) {
          cc_applied_email.push(email_element.id);
          window.cc_holder.addEmailVerify({
            email: email_element
          });
        }
      });
    }, 200);
  }

  if (c2a_config.phonevalidation.enabled && c2a_config.main.key != null) {
    if (window.cc_holder == null) {
      window.cc_holder = new clickToAddress({
        accessToken: c2a_config.main.key,
      });
    }

    setInterval(function() {
      var phone_elements = document.querySelectorAll('input[name="telephone"]');
      phone_elements.forEach((phone_element) => {
        if (cc_applied_phone.indexOf(phone_element.id) === -1) {
          cc_applied_phone.push(phone_element.id);
          var country = phone_element.closest('form').querySelector(':scope select[name="country_id"]');
          window.cc_holder.addPhoneVerify({
            phone: phone_element,
            country: country
          });
        }
      });
    }, 200);
  }
});
