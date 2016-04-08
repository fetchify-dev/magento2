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
#### NOTE!
There are two versions of this module:
- Main branch is using the Global Address endpoint. (Search as you type functionality)
- There's a separate branch for an older version, doing only UK postcode lookup. (different endpoint)

Then execute install script
```
php -f bin/magento setup:upgrade
```

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

##End-user Instructions
- If the selected country on the checkout / address book is the UK, a "Find address" button will appear.
- Type in the desired postcode to the field next to it.
- Click on the Find Address button. A dropdown will be presented will all the possible address locations.
- Select the correct address from the dropdown.
- All remaining address parts will be filled with the details.
