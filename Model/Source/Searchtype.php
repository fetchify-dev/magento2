<?php

namespace Craftyclicks\Clicktoaddress\Model\Source;

class Searchtype implements \Magento\Framework\Option\ArrayInterface
{
	/**
	* @return array
	*/
	public function toOptionArray()
	{
		return [
			//['value' => 'searchbar_icon', 'label' => 'SearchBar + Icon'],
			['value' => 'searchbar_text', 'label' => 'SearchBar'],
			['value' => 'traditional', 'label' => 'Traditional']
		];
	}
}
