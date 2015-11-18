#Crafty Clicks Magento 2 Integration
##Quick instructions

###Install via composer

First add the repository:
```
composer config repositories.inchoostripe git https://github.com/craftyclicks/magento2.git
```
& make sure that your your minimum-stability is alpha.
Then, request composer to fetch the module:
```
composer require craftyclicks/module-clicktoaddress
```
(or composer require craftyclicks/module-clicktoaddress:dev-branch for a specific branch)

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
The configuration for the extension is located under Stores -> Configuration -> Crafty Clicks -> Click to Address.
There are 3 sub-sections.
#### Main Options
Enable Frontend - Enable or disable the extension for Checkout / AddressBook areas.

Enable Backend - Enable or disable the extension for Admin -> Order / Customer address detail edit parts.

FrontEnd Access Token - Place your web CraftyClicks access token here.

BackEnd Access Token - Place your internal CraftyClicks access token here.
#### Search Options
Postcode Lookup Type - Traditional / Searchbar. (Determines the position of the lookup: postcode or dedicated field)

Hide Address Fields or New Address Entry - Hides address fields until lookup is used.

Auto-Search - Checks if an entered postcode is valid; if it is performs the lookup immediately.

Clean Input after Search - Cleans input after lookup (Searchbar only)

##End-user Instructions
- If the selected country on the checkout / address book is the UK, a "Find address" button will appear.
- Type in the desired postcode to the field next to it.
- Click on the Find Address button. A dropdown will be presented will all the possible address locations.
- Select the correct address from the dropdown.
- All remaining address parts will be filled with the details.
