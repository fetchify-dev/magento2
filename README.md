#Crafty Clicks Magento 2 Integration
##Quick instructions

###Install via composer

First add the repository:
```
composer config repositories.craftyclicks git https://github.com/craftyclicks/magento2.git
```
& make sure that your your minimum-stability is beta.
Then, request composer to fetch the module:
```
composer require craftyclicks/module-clicktoaddress
```
(or composer require craftyclicks/module-clicktoaddress:dev-branch for a specific branch)

Then execute install script
```
php -f bin/magento setup:upgrade
```

#### NOTE!
There are two versions of this module:
- Main branch is using the Global Address endpoint. (Search as you type functionality)
- There's a separate branch for an older version, doing only UK postcode lookup. (different endpoint)


###Manual Install

- Create folder structure /app/code/Craftyclicks/Clicktoaddress/
- Download & copy the git contents to the folder
- Run install script
```
php -f bin/magento setup:upgrade
```

##Configuration Instructions
The configuration for the extension is located under Stores -> Configuration -> Crafty Clicks -> Global Address Auto-Complete.
There are 3 sub-sections, with configurations included.
