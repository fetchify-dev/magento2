<?php

namespace Craftyclicks\Clicktoaddress\Model\Source;

class Searchicon implements \Magento\Framework\Option\ArrayInterface
{
	/**
	* @return array
	*/
	public function toOptionArray()
	{
		return [
			['value' => 'search', 'label' => 'Magnifier']
		];
	}
}
