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
	private function getCfg($cfg_name){
		return $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/'.$cfg_name,
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
	}

	public function getFrontendCfg(){
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

		$cfg['gfx_mode']		= $this->getCfg('gfx_options/mode');
		$cfg['gfx_ambient']		= $this->getCfg('gfx_options/ambient');
		$cfg['gfx_accent']		= $this->getCfg('gfx_options/accent');
		// special search configs
		$cfg['searchbar_type']	= $this->getCfg('gfx_options/searchbar_type');

		$cfg['texts'] = array(
			"search_label"			 => $this->getCfg('txt_options/search_label'),
			"default_placeholder"	 => html_entity_decode($this->getCfg('txt_options/search_placeholder')),
			"country_placeholder"	 => html_entity_decode($this->getCfg('txt_options/country_placeholder')),
			"country_button"		 => $this->getCfg('txt_options/country_button'),
			"generic_error"			 => $this->getCfg('txt_options/error_msg_2'),
			"no_results"			 => $this->getCfg('txt_options/error_msg_1'),
			"manual_entry_toggle"			 => $this->getCfg('txt_options/manual_entry_toggle')
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
			"lock_country_to_dropdown" => $this->getCfg('advanced/lock_country_to_dropdown') == "1",
			"hide_fields" => $this->getCfg('advanced/hide_fields') == "1",
			"search_elem_id" => $this->getCfg('advanced/search_elem_id'),
			"debug" => $this->getCfg('advanced/debug') == "1",
			"transliterate" => $this->getCfg('advanced/transliterate') == "1",
			"use_first_line" => $this->getCfg('advanced/use_first_line') == "1",
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
		$cfg['gfx_mode']		= $this->getCfg('gfx_options/mode');
		$cfg['gfx_ambient']		= $this->getCfg('gfx_options/ambient');
		$cfg['gfx_accent']		= $this->getCfg('gfx_options/accent');
		// special search configs
		$cfg['searchbar_type']	= $this->getCfg('gfx_options/searchbar_type');

		$cfg['texts'] = array(
			"search_label"			=> $this->getCfg('txt_options/search_label'),
			"default_placeholder"	=> html_entity_decode($this->getCfg('txt_options/search_placeholder')),
			"country_placeholder"	=> html_entity_decode($this->getCfg('txt_options/country_placeholder')),
			"country_button"		=> $this->getCfg('txt_options/country_button'),
			"generic_error"			=> $this->getCfg('txt_options/error_msg_2'),
			"no_results"			=> $this->getCfg('txt_options/error_msg_1')
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
			"lock_country_to_dropdown" => $this->getCfg('advanced/lock_country_to_dropdown') == "1",
			"hide_fields" => $this->getCfg('advanced/hide_fields') == "1",
			"transliterate" => $this->getCfg('advanced/transliterate') == "1"
		);
		return json_encode($cfg);

	}
}
