<?php

namespace Fetchify\Fetchify\Model\Source;

class Mode implements \Magento\Framework\Data\OptionSourceInterface
{
  /**
   * Returns the Auto-Complete UI mode options array
   *
   * @return array
   */
    public function toOptionArray(): array
    {
        return [
        ['value' => 1, 'label' => __('Dropdown')],
        //['value' => 2, 'label' => __('Surround')]
        ];
    }
}
