<?php

namespace Craftyclicks\Clicktoaddress\Model\Source;

class Mode implements \Magento\Framework\Data\OptionSourceInterface
{
	/**
	* @return array
	*/
	public function toOptionArray()
	{
		return [
			['value' => 1, 'label' => __('Dropdown')],
			//['value' => 2, 'label' => __('Surround')]
		];
	}
}
