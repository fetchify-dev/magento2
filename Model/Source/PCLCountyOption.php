<?php

namespace Fetchify\Fetchify\Model\Source;

class PCLCountyOption implements \Magento\Framework\Data\OptionSourceInterface
{
  /**
   * Returns the Postcode Lookup county field options array
   *
   * @return array
   */
    public function toOptionArray(): array
    {
        return [
        ['value' => 'none', 'label' => __('Empty Field')],
        ['value' => 'former_postal', 'label' => __('Former Postal Counties')],
        ['value' => 'traditional', 'label' => __('Traditional Counties')]
        ];
    }
}
