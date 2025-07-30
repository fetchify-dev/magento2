<?php

namespace Fetchify\Fetchify\ViewModel;

class Data implements \Magento\Framework\View\Element\Block\ArgumentInterface
{
  /**
   * @var \Magento\Framework\Escaper
   */
    private \Magento\Framework\Escaper $escaper;

  /**
   * @var \Magento\Framework\Encryption\EncryptorInterface
   */
    private \Magento\Framework\Encryption\EncryptorInterface $encryptor;

  /**
   * @var \Magento\Framework\ObjectManagerInterface
   */
    private \Magento\Framework\ObjectManagerInterface $objectManager;

  /**
   * @var \Magento\Framework\App\Config\ScopeConfigInterface
   */
    private \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig;

  /**
   * @param \Magento\Framework\Escaper $escaper
   * @param \Magento\Framework\Encryption\EncryptorInterface $encryptor
   * @param \Magento\Framework\ObjectManagerInterface $objectManager
   * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
   */
    public function __construct(
        \Magento\Framework\Escaper $escaper,
        \Magento\Framework\Encryption\EncryptorInterface $encryptor,
        \Magento\Framework\ObjectManagerInterface $objectManager,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
    ) {
        $this->escaper = $escaper;
        $this->encryptor = $encryptor;
        $this->objectManager = $objectManager;
        $this->scopeConfig = $scopeConfig;
    }

  /**
   * Generate nonce
   */
    public function getNonce(): string
    {
        if (class_exists(\Magento\Csp\Helper\CspNonceProvider::class)) {
            $cspNonceProvider = $this->objectManager->get(
                \Magento\Csp\Helper\CspNonceProvider::class
            );

            return $cspNonceProvider->generateNonce();
        }

        return '';
    }

  /**
   * Get config
   *
   * @param string $scope
   * @param string $cfg_name
   * @param string $default
   */
    private function getCfg($scope, $cfg_name, $default = null)
    {
        $value = $this->escaper->escapeHtml(
            $this->scopeConfig->getValue(
                $scope . '/' . $cfg_name,
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            )
        );

        if ($value == '' && $default != null) {
            $value = $default;
        }

        return $value;
    }

  /**
   * Get frontend config
   */
    public function getFrontendCfg()
    {
        $cfg = [
        'main' => null,
        'autocomplete' => null,
        'postcodelookup' => null,
        'phonevalidation' => null,
        'emailvalidation' => null
        ];

        $token = $this->scopeConfig->getValue(
            'fetchify_main/main_options/accesstoken',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        if (0 == preg_match("/^([a-zA-Z0-9]{5}-){3}[a-zA-Z0-9]{5}$/", $token)) {
            // not decrypted yet (php 7.0.X?)
            $token = $this->encryptor->decrypt($token);
        }

        if (preg_match("/^([a-zA-Z0-9]{5}-){3}[a-zA-Z0-9]{5}$/", $token)) {
            $cfg['main']['key'] = $this->escaper->escapeHtml($token);
        } else {
            $cfg['main']['key'] = null;
        }

        $cfg['main']['enable_extension'] = $this->scopeConfig->isSetFlag(
            'fetchify_main/main_options/enable_extension',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        $cfg['autocomplete']['enabled'] = $this->scopeConfig->isSetFlag(
            'fetchify_global/main_options/frontend_enabled',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        $cfg['autocomplete']['gfx_mode']    = $this->getCfg('fetchify_global', 'gfx_options/mode');
        $cfg['autocomplete']['gfx_ambient']    = $this->getCfg('fetchify_global', 'gfx_options/ambient');
        $cfg['autocomplete']['gfx_accent']    = $this->getCfg('fetchify_global', 'gfx_options/accent');

        $cfg['autocomplete']['texts'] = [
        "search_label"       => $this->getCfg('fetchify_global', 'txt_options/search_label'),
        "default_placeholder"   => $this->escaper->escapeHtml(
            $this->getCfg('fetchify_global', 'txt_options/search_placeholder')
        ),
        "country_placeholder"   => $this->escaper->escapeHtml(
            $this->getCfg('fetchify_global', 'txt_options/country_placeholder')
        ),
        "country_button"     => $this->getCfg('fetchify_global', 'txt_options/country_button'),
        "generic_error"       => $this->getCfg('fetchify_global', 'txt_options/error_msg_2'),
        "no_results"       => $this->getCfg('fetchify_global', 'txt_options/error_msg_1'),
        "manual_entry_toggle"       => $this->getCfg('fetchify_global', 'txt_options/manual_entry_toggle')
        ];
    
        $cfg['autocomplete']['default_country'] = $this->escaper->escapeHtml(
            $this->scopeConfig->getValue(
                'general/country/default',
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            )
        );

        $cfg['autocomplete']['enabled_countries'] = explode(',', $this->escaper->escapeHtml(
            $this->scopeConfig->getValue(
                'general/country/allow',
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            )
        ));

        $cfg['autocomplete']['advanced'] = [
        "debug" => $this->getCfg('fetchify_global', 'advanced/debug') == "1",
        "fill_uk_counties" => $this->getCfg('fetchify_global', 'advanced/fill_uk_counties') == "1",
        "lock_country_to_dropdown" => $this->getCfg('fetchify_global', 'advanced/lock_country_to_dropdown') == "1",
        "hide_fields" => $this->getCfg('fetchify_global', 'advanced/hide_fields') == "1",
        "search_elem_id" => $this->getCfg('fetchify_global', 'advanced/search_elem_id'),
        "transliterate" => $this->getCfg('fetchify_global', 'advanced/transliterate') == "1",
        "use_first_line" => $this->getCfg('fetchify_global', 'advanced/use_first_line') == "1",
        ];

        $cfg['autocomplete']['exclusions']['areas'] = explode(
            ",",
            $this->getCfg('fetchify_global', 'exclusions/areas')
        );
        $cfg['autocomplete']['exclusions']['po_box'] = $this->getCfg('fetchify_global', 'exclusions/po_box') === "1";

      // PCL OPTIONS
        $cfg['postcodelookup']['enabled'] = $this->scopeConfig->isSetFlag(
            'fetchify_pcl/options/enabled',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        $cfg['postcodelookup']['hide_fields'] = $this->scopeConfig->isSetFlag(
            'fetchify_pcl/gfx_options/hide_fields',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        $cfg['postcodelookup']['error_msg'] = [];
        $cfg['postcodelookup']['error_msg']["0001"] = $this->getCfg('fetchify_pcl', 'txt_options/error_msg_1');
        $cfg['postcodelookup']['error_msg']["0002"] = $this->getCfg('fetchify_pcl', 'txt_options/error_msg_2');
        $cfg['postcodelookup']['error_msg']["0003"] = $this->getCfg('fetchify_pcl', 'txt_options/error_msg_3');
        $cfg['postcodelookup']['error_msg']["0004"] = $this->getCfg('fetchify_pcl', 'txt_options/error_msg_4');
        $cfg['postcodelookup']['txt'] = [];
        $cfg['postcodelookup']['txt']["search_label"] = $this->getCfg('fetchify_pcl', 'txt_options/search_label');
        $cfg['postcodelookup']['txt']["search_placeholder"] = $this->getCfg(
            'fetchify_pcl',
            'txt_options/search_placeholder'
        );
        $cfg['postcodelookup']['txt']['search_buttontext'] = $this->getCfg(
            'fetchify_pcl',
            'txt_options/search_buttontext'
        );
        $cfg['postcodelookup']['txt']["manual_entry"] = $this->getCfg('fetchify_pcl', 'txt_options/manual_entry');
        $cfg['postcodelookup']['advanced']['county_data'] = $this->getCfg('fetchify_pcl', 'advanced/county_data');

      // phone & email validation
        $cfg['phonevalidation']['enabled'] = $this->scopeConfig->isSetFlag(
            'fetchify_phone/options/enabled',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
        $cfg['emailvalidation']['enabled'] = $this->scopeConfig->isSetFlag(
            'fetchify_email/options/enabled',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        return json_encode($cfg);
    }
}
