<?php

namespace Craftyclicks\Clicktoaddress\Model\Source;

class Ambient implements \Magento\Framework\Data\OptionSourceInterface
{
	/**
	* @return array
	*/
	public function toOptionArray()
	{
		return [
			[
				'value' => 'light',
				'label' => __('Light'),
			],
			[
				'value' => 'dark',
				'label' => __('Dark'),
			],
		];
	}
}
