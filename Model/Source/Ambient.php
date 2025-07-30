<?php

namespace Fetchify\Fetchify\Model\Source;

class Ambient implements \Magento\Framework\Data\OptionSourceInterface
{
  /**
   * Returns the Auto-Complete highlight colour options array
   *
   * @return array
   */
    public function toOptionArray(): array
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
