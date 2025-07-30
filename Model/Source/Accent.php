<?php

namespace Fetchify\Fetchify\Model\Source;

class Accent implements \Magento\Framework\Data\OptionSourceInterface
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
        'value' => 'default',
        'label' => __('Default'),
        ],
        [
        'value' => 'red',
        'label' => __('Red')
        ],
        [
        'value' => 'pink',
        'label' => __('Pink')
        ],
        [
        'value' => 'purple',
        'label' => __('Purple')
        ],
        [
        'value' => 'deepPurple',
        'label' => __('Deep Purple')
        ],
        [
        'value' => 'indigo',
        'label' => __('Indigo')
        ],
        [
        'value' => 'blue',
        'label' => __('Blue')
        ],
        [
        'value' => 'lightBlue',
        'label' => __('Light Blue')
        ],
        [
        'value' => 'cyan',
        'label' => __('Cyan')
        ],
        [
        'value' => 'teal',
        'label' => __('Teal')
        ],
        [
        'value' => 'green',
        'label' => __('Green')
        ],
        [
        'value' => 'lightGreen',
        'label' => __('Light Green')
        ],
        [
        'value' => 'lime',
        'label' => __('Lime')
        ],
        [
        'value' => 'yellow',
        'label' => __('Yellow')
        ],
        [
        'value' => 'amber',
        'label' => __('Amber')
        ],
        [
        'value' => 'orange',
        'label' => __('Orange')
        ],
        [
        'value' => 'deepOrange',
        'label' => __('Deep Orange')
        ],
        [
        'value' => 'brown',
        'label' => __('Brown')
        ],
        [
        'value' => 'grey',
        'label' => __('Grey')
        ],
        [
        'value' => 'blueGrey',
        'label' => __('Blue Grey')
        ]
        ];
    }
}
