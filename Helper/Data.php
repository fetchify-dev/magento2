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
		$cfg['key'] = $this->_encryptor->decrypt(
			$this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_uk/main_options/frontend_accesstoken',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			)
		);
		$cfg['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_uk/main_options/frontend_enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['hide_fields'] = $this->scopeConfig->isSetFlag(
			'cc_uk/gfx_options/hide_fields',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['auto_search'] = $this->scopeConfig->isSetFlag(
			'cc_uk/gfx_options/searchbar_auto_search',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['clean_postsearch'] = $this->scopeConfig->isSetFlag(
			'cc_uk/gfx_options/searchbar_clean_postsearch',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		// special search configs
		$cfg['searchbar_type'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/gfx_options/searchbar_type',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);

		// errors
		$cfg['error_msg'] = [];
		$cfg['error_msg']["0001"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/error_msg_1',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['error_msg']["0002"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/error_msg_2',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['error_msg']["0003"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/error_msg_3',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['error_msg']["0004"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/error_msg_4',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['txt'] = [];
		$cfg['txt']["search_label"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/search_label',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['txt']["search_placeholder"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/search_placeholder',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['txt']['button_text'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/gfx_options/button_text',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);

		return json_encode($cfg);
	}
	public function getBackendCfg(){
		$cfg = [];
		$cfg['key'] = $this->_encryptor->decrypt(
			$this->_escaper->escapeHtml(
				$this->scopeConfig->getValue(
					'cc_uk/main_options/backend_accesstoken',
					\Magento\Store\Model\ScopeInterface::SCOPE_STORE
				)
			)
		);
		$cfg['enabled'] = $this->scopeConfig->isSetFlag(
			'cc_uk/main_options/backend_enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['auto_search'] = $this->scopeConfig->isSetFlag(
			'cc_uk/gfx_options/searchbar_auto_search',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['clean_postsearch'] = $this->scopeConfig->isSetFlag(
			'cc_uk/gfx_options/searchbar_clean_postsearch',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);

		$cfg['searchbar_type'] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/gfx_options/searchbar_type',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['error_msg'] = [];
		$cfg['error_msg']["0001"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/error_msg_1',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['error_msg']["0002"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/error_msg_2',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['error_msg']["0003"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/error_msg_3',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['error_msg']["0004"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/error_msg_4',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['txt'] = [];
		$cfg['txt']["search_label"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/search_label',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['txt']["search_placeholder"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/search_placeholder',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		$cfg['txt']["search_buttontext"] = $this->_escaper->escapeHtml(
			$this->scopeConfig->getValue(
				'cc_uk/txt_options/search_buttontext',
				\Magento\Store\Model\ScopeInterface::SCOPE_STORE
			)
		);
		return json_encode($cfg);

	}
}
