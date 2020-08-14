<?php
namespace Craftyclicks\Clicktoaddress\Helper;

class Data extends \Magento\Framework\App\Helper\AbstractHelper
{
	/**
	 * @var \Magento\Framework\Escaper
	 */
	protected $_escaper;
	/**
	 * @var \Magento\Framework\Encryption\EncryptorInterface
	 */
	protected $_encryptor;
	/**
	 * @param \Magento\Framework\App\Helper\Context $context
	 * @param \Magento\Framework\Escaper $_escaper
	 * @param \Magento\Framework\Encryption\EncryptorInterface $_encryptor
	 */
	public function __construct(
		\Magento\Framework\App\Helper\Context $context,
		\Magento\Framework\Escaper $escaper,
		\Magento\Framework\Encryption\EncryptorInterface $encryptor
	) {
		$this->_escaper = $escaper;
		$this->_encryptor = $encryptor;
		parent::__construct($context);
	}
	private function getCfg($scope,$cfg_name,$default = null){
		$value = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				$scope.'/'.$cfg_name,
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		if($value == '' && $default != null){
			$value = $default;
		}
		return $value;
	}

	public function getFrontendCfg(){
		$cfg = [
			'main' => null,
			'autocomplete' => null,
			'postcodelookup' => null,
			'phonevalidation' => null,
			'emailvalidation' => null
		];
		// fetch new location for key
		$token = $this->scopeConfig->getValue(
			'cc_main/main_options/accesstoken',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		try{
			if(0 == preg_match("/^([a-zA-Z0-9]{5}-){3}[a-zA-Z0-9]{5}$/",$token)){
				// not decrypted yet (php 7.0.X?)
				$token = $this->_encryptor->decrypt($token);
				// $cfg['main']['rdcrypt'] = true;
			}
		} catch (\Exception $e) {
			// $cfg['main']['rdcrypt'] = false;
		}
		if(preg_match("/^([a-zA-Z0-9]{5}-){3}[a-zA-Z0-9]{5}$/",$token)){
			$cfg['main']['key'] = $this->_escaper->escapeHtml($token);
		} else {
			$cfg['main']['key'] = null;
		}

		// fetch old location for key
		if($cfg['main']['key'] == null){
			$token = $this->scopeConfig->getValue(
				'cc_global/main_options/accesstoken',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			);
			try{
				if(0 == preg_match("/^([a-zA-Z0-9]{5}-){3}[a-zA-Z0-9]{5}$/",$token)){
					// not decrypted yet (php 7.0.X?)
					$token = $this->_encryptor->decrypt($token);
					// $cfg['main']['rdcrypt'] = true;
				}
			} catch (\Exception $e) {
				// $cfg['main']['rdcrypt'] = false;
			}
			if(preg_match("/^([a-zA-Z0-9]{5}-){3}[a-zA-Z0-9]{5}$/",$token)){
				$cfg['main']['key'] = $this->_escaper->escapeHtml($token);
			} else {
				$cfg['main']['key'] = null;
			}
		}
		$cfg['main']['enable_extension'] = $this->scopeConfig->isSetFlag(
			'cc_main/main_options/enable_extension',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['autocomplete']['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_global/main_options/frontend_enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
/*
		$cfg['autocomplete']['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_global/main_options/enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
*/
		$cfg['autocomplete']['gfx_mode']		= $this->getCfg('cc_global','gfx_options/mode');
		$cfg['autocomplete']['gfx_ambient']		= $this->getCfg('cc_global','gfx_options/ambient');
		$cfg['autocomplete']['gfx_accent']		= $this->getCfg('cc_global','gfx_options/accent');
		// special search configs
		$cfg['autocomplete']['searchbar_type']	= $this->getCfg('cc_global','gfx_options/searchbar_type');

		$cfg['autocomplete']['texts'] = array(
			"search_label"			 => $this->getCfg('cc_global','txt_options/search_label'),
			"default_placeholder"	 => html_entity_decode($this->getCfg('cc_global','txt_options/search_placeholder')),
			"country_placeholder"	 => html_entity_decode($this->getCfg('cc_global','txt_options/country_placeholder')),
			"country_button"		 => $this->getCfg('cc_global','txt_options/country_button'),
			"generic_error"			 => $this->getCfg('cc_global','txt_options/error_msg_2'),
			"no_results"			 => $this->getCfg('cc_global','txt_options/error_msg_1'),
			"manual_entry_toggle"			 => $this->getCfg('cc_global','txt_options/manual_entry_toggle')
		);
		$match_country_list = $this->scopeConfig->getValue(
			'cc_global/advanced/match_country_list',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['autocomplete']['default_country'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'general/country/default',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		if($match_country_list){
			$cfg['autocomplete']['enabled_countries'] = explode(',',$this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'general/country/allow',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			));
		}

		$cfg['autocomplete']['advanced'] = array(
			"lock_country_to_dropdown" => $this->getCfg('cc_global','advanced/lock_country_to_dropdown') == "1",
			"hide_fields" => $this->getCfg('cc_global','advanced/hide_fields') == "1",
			"search_elem_id" => $this->getCfg('cc_global','advanced/search_elem_id'),
			"debug" => $this->getCfg('cc_global','advanced/debug') == "1",
			"transliterate" => $this->getCfg('cc_global','advanced/transliterate') == "1",
			"use_first_line" => $this->getCfg('cc_global','advanced/use_first_line') == "1",
		);

		// PCL OPTIONS
		$cfg['postcodelookup']['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_pcl/options/enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['postcodelookup']['hide_fields'] = $this->scopeConfig->isSetFlag(
			'cc_pcl/gfx_options/hide_fields',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);

		// errors
		$cfg['postcodelookup']['error_msg'] = [];
		$cfg['postcodelookup']['error_msg']["0001"] = $this->getCfg('cc_pcl','txt_options/error_msg_1');
		$cfg['postcodelookup']['error_msg']["0002"] = $this->getCfg('cc_pcl','txt_options/error_msg_2');
		$cfg['postcodelookup']['error_msg']["0003"] = $this->getCfg('cc_pcl','txt_options/error_msg_3');
		$cfg['postcodelookup']['error_msg']["0004"] = $this->getCfg('cc_pcl','txt_options/error_msg_4');
		$cfg['postcodelookup']['txt'] = [];
		$cfg['postcodelookup']['txt']["search_label"] = $this->getCfg('cc_pcl','txt_options/search_label');
		$cfg['postcodelookup']['txt']["search_placeholder"] = $this->getCfg('cc_pcl','txt_options/search_placeholder');
		$cfg['postcodelookup']['txt']['search_buttontext'] = $this->getCfg('cc_pcl','txt_options/search_buttontext');

		$cfg['postcodelookup']['advanced']['county_data'] = $this->getCfg('cc_pcl','advanced/county_data');

		// phone & email validation

		$cfg['phonevalidation']['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_phone/options/enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['emailvalidation']['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_email/options/enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);

		return json_encode($cfg);
	}




	public function getBackendCfg(){
		$cfg = [];

		$token = $this->scopeConfig->getValue(
			'cc_global/main_options/accesstoken',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		try{
			if(0 == preg_match("/^([a-zA-Z0-9]{5}-){3}[a-zA-Z0-9]{5}$/",$token)){
				// not decrypted yet (php 7.0.X?)
				$token = $this->_encryptor->decrypt($token);
				$cfg['rdcrypt'] = true;
			}
		} catch (\Exception $e) {
			$cfg['rdcrypt'] = false;
		}

		if(preg_match("/^([a-zA-Z0-9]{5}-){3}[a-zA-Z0-9]{5}$/",$token)){
			$cfg['key'] = $this->_escaper->escapeHtml($token);
		} else {
			$cfg['key'] = null;
		}
		$cfg['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_global/main_options/enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['gfx_mode']		= $this->getCfg('cc_global','gfx_options/mode');
		$cfg['gfx_ambient']		= $this->getCfg('cc_global','gfx_options/ambient');
		$cfg['gfx_accent']		= $this->getCfg('cc_global','gfx_options/accent');
		// special search configs
		$cfg['searchbar_type']	= $this->getCfg('cc_global','gfx_options/searchbar_type');

		$cfg['texts'] = array(
			"search_label"			=> $this->getCfg('cc_global','txt_options/search_label'),
			"default_placeholder"	=> html_entity_decode($this->getCfg('cc_global','txt_options/search_placeholder')),
			"country_placeholder"	=> html_entity_decode($this->getCfg('cc_global','txt_options/country_placeholder')),
			"country_button"		=> $this->getCfg('cc_global','txt_options/country_button'),
			"generic_error"			=> $this->getCfg('cc_global','txt_options/error_msg_2'),
			"no_results"			=> $this->getCfg('cc_global','txt_options/error_msg_1')
		);
		$match_country_list = $this->scopeConfig->getValue(
			'cc_global/advanced/match_country_list',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['default_country'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'general/country/default',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		if($match_country_list){
			$cfg['enabled_countries'] = explode(',',$this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'general/country/allow',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			));
		}

		$cfg['advanced'] = array(
			"lock_country_to_dropdown" => $this->getCfg('cc_global','advanced/lock_country_to_dropdown') == "1",
			"hide_fields" => $this->getCfg('cc_global','advanced/hide_fields') == "1",
			"transliterate" => $this->getCfg('cc_global','advanced/transliterate') == "1"
		);
		return json_encode($cfg);

	}

}
