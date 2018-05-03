# Crafty Clicks Magento 2 Integration

## Download via composer

Request composer to fetch the module:
```
composer require craftyclicks/module-clicktoaddress
```

### Manual Download

- Create folder structure /app/code/Craftyclicks/Clicktoaddress/
- Download & copy the git contents to the folder

## Install

Please note that executing these lines can cause a downtime on your Magento shop until they finish.
```
php -f bin/magento setup:upgrade
php -f bin/magento setup:di:compile
```
- First line allows Magento to recognize the module
- Second line is required so that Magento would load configuration defaults. (I'm looking for an alternative, more direct command but couldn't find one so far)

## Configuration Instructions
The configuration for the extension is located under Stores -> Configuration -> Crafty Clicks -> Global Address Auto-Complete.
There are 3 sub-sections, with configurations included.

## Notes

### To add the latest dev branch version
First add the git directly as a repo to composer:
```
composer config repositories.craftyclicks git https://github.com/craftyclicks/magento2.git
```
Then request a specific branch (:dev-branch)
```
composer require craftyclicks/module-clicktoaddress:dev-dev
```

### UK Postcode Lookup
- Main branch is using the Global Address endpoint. (Address Auto-Complete)
- There's a separate branch for an older version, doing only UK postcode lookup. (different endpoint)
