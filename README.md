# Crafty Clicks Magento 2 Integration
##Quick instructions

###Install via composer

First add the repository:
```
"repositories": [
   {
     "type": "vcs",
     "url": "https://github.com/craftyclicks/magento2"
   }
 ],
```
& make sure that your your minimum-stability is dev.
Then, add the module to the required list either via the composer.json, or execute
```
composer require craftyclicks/module-clicktoaddress
```
(or composer require craftyclicks/module-clicktoaddress:dev-branch for a specific branch)

Then execute
```
php -f bin/magento module:enable --clear-static-content Craftyclicks_Clicktoaddress
php -f bin/magento setup:upgrade
```
