<?php

namespace Fetchify\Fetchify\Setup;

use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\UninstallInterface;

class Uninstall implements UninstallInterface
{
  /**
   * Module uninstall code
   *
   * @param SchemaSetupInterface $setup
   * @param ModuleContextInterface $context
   * @return void
   */
  public function uninstall(
    SchemaSetupInterface $setup,
    ModuleContextInterface $context
  ) 
  {
    $setup->startSetup();

    $connection = $setup->getConnection();

    $connection->delete(
      $this->getTableNameWithPrefix($setup, 'core_config_data'),
      "path LIKE 'fetchify_main/%'"
    );

    $connection->delete(
      $this->getTableNameWithPrefix($setup, 'core_config_data'),
      "path LIKE 'fetchify_global/%'"
    );

    $connection->delete(
      $this->getTableNameWithPrefix($setup, 'core_config_data'),
      "path LIKE 'fetchify_pcl/%'"
    );

    $connection->delete(
      $this->getTableNameWithPrefix($setup, 'core_config_data'),
      "path LIKE 'fetchify_phone/%'"
    );

    $connection->delete(
      $this->getTableNameWithPrefix($setup, 'core_config_data'),
      "path LIKE 'fetchify_email/%'"
    );

    $setup->endSetup();
  }

  /**
   * @param SchemaSetupInterface $setup
   * @param string $tableName
   *
   * @return string
   */
  private function getTableNameWithPrefix(SchemaSetupInterface $setup, $tableName)
  {
    return $setup->getTable($tableName);
  }
}

