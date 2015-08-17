<?php

namespace Craftyclicks\Clicktoaddress\Model\Source;

class Searchbg implements \Magento\Framework\Option\ArrayInterface
{
	/**
	* @return array
	*/
	public function toOptionArray()
	{
		return [
			['value' => 'hex', 'label' => 'Hexagon'],
			['value' => 'flat', 'label' => 'Flat'],
			['value' => 'spike', 'label' => 'Spike'],
			['value' => 'convex', 'label' => 'Convex']
		];
	}
}
