# Fetchify Magento 2 Integration

## Download via composer

Request composer to fetch the module:
```
composer require fetchify/module-fetchify
```

### Manual Download

- Create folder structure /app/code/Fetchify/Fetchify/
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
The configuration for the extension is located under Stores -> Configuration -> Fetchify.
