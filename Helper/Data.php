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
	public function getFrontendCfg(){
		$cfg = [];
		$cfg['key'] = $this->_escaper->escapeHtml(
			$this->_encryptor->decrypt(
				$this->scopeConfig->getValue(
					'cc_global/main_options/accesstoken',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			)
		);

		$cfg['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_global/main_options/enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['gfx_mode'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/gfx_options/mode',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['gfx_ambient'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/gfx_options/ambient',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['gfx_accent'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/gfx_options/accent',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		// special search configs
		$cfg['searchbar_type'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/gfx_options/searchbar_type',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);

		$cfg['texts'] = array(
			"search_label" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/search_label',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),
			"default_placeholder" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/search_placeholder',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),

			"country_placeholder" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/country_placeholder',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),

			"country_button" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/country_button',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),

			"generic_error" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/error_msg_2',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),

			"no_results" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/error_msg_1',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			)
		);
		$match_country_list = $this->scopeConfig->getValue(
			'cc_global/advanced/match_country_list',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		if($match_country_list){
			$cfg['enabled_countries'] = explode(',',$this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'general/country/allow',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			));
		}
		return json_encode($cfg);
	}
	public function getBackendCfg(){
		$cfg = [];
		$cfg['key'] = $this->_escaper->escapeHtml(
			$this->_encryptor->decrypt(
				$this->scopeConfig->getValue(
					'cc_global/main_options/accesstoken',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			)
		);

		$cfg['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_global/main_options/enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['gfx_mode'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/gfx_options/mode',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['gfx_ambient'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/gfx_options/ambient',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['gfx_accent'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/gfx_options/accent',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		// special search configs
		$cfg['searchbar_type'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_global/gfx_options/searchbar_type',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);

		$cfg['texts'] = array(
			"search_label" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/search_label',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),
			"default_placeholder" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/search_placeholder',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),

			"country_placeholder" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/country_placeholder',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),

			"country_button" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/country_button',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),

			"generic_error" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/error_msg_2',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			),

			"no_results" => $this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_global/txt_options/error_msg_1',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			)
		);
		$match_country_list = $this->scopeConfig->getValue(
			'cc_global/advanced/match_country_list',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		if($match_country_list){
			$cfg['enabled_countries'] = explode(',',$this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'general/country/allow',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			));
		}
		return json_encode($cfg);

	}
}
