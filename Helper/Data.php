<?php
namespace Craftyclicks\Clicktoaddress\Helper;

class Data extends \Magento\Framework\App\Helper\AbstractHelper
{
	public function get_frontend_cfg(){
		$cfg = [];
		$cfg['key'] = $this->scopeConfig->getValue(
			'cc_uk/main_options/frontend_accesstoken',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['enabled'] = $this->scopeConfig->getValue(
			'cc_uk/main_options/frontend_enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		) == 1;
		$cfg['hide_fields'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/hide_fields',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		) == 1;
		$cfg['auto_search'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/searchbar_auto_search',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		) == 1;
		$cfg['clean_postsearch'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/searchbar_clean_postsearch',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		) == 1;
		// special search configs

		$cfg['searchbar_type'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/searchbar_type',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		/*
		$cfg['search_bg'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/search_bg',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['search_bg_color'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/search_bg_color',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['search_icon'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/search_icon',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);

		$cfg['search_icon_color'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/search_icon_color',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		*/

		// errors

		$cfg['error_msg'] = [];
		$cfg['error_msg']["0001"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/error_msg_1',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['error_msg']["0002"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/error_msg_2',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['error_msg']["0003"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/error_msg_3',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['error_msg']["0004"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/error_msg_4',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['txt'] = [];
		$cfg['txt']["search_label"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/search_label',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['txt']["search_placeholder"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/search_placeholder',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['txt']['button_text'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/button_text',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);

		return json_encode($cfg);
	}
	public function get_backend_cfg(){
		$cfg = [];
		$cfg['key'] = $this->scopeConfig->getValue(
			'cc_uk/main_options/backend_accesstoken',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['enabled'] = $this->scopeConfig->getValue(
			'cc_uk/main_options/backend_enabled',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		) == 1;
		$cfg['auto_search'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/searchbar_auto_search',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		) == 1;
		$cfg['clean_postsearch'] = $this->scopeConfig->getValue(
			'cc_uk/gfx_options/searchbar_clean_postsearch',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		) == 1;
		$cfg['error_msg'] = [];
		$cfg['error_msg']["0001"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/error_msg_1',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['error_msg']["0002"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/error_msg_2',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['error_msg']["0003"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/error_msg_3',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['error_msg']["0004"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/error_msg_4',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['txt'] = [];
		$cfg['txt']["search_placeholder"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/search_placeholder',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		$cfg['txt']["search_buttontext"] = $this->scopeConfig->getValue(
			'cc_uk/txt_options/search_buttontext',
			\Magento\Store\Model\ScopeInterface::SCOPE_STORE
		);
		return json_encode($cfg);

	}
}
