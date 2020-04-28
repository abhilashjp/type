---
layout: post
title: Introduction to Coupon Management Systems
category: product
tags:
- Coupons
- CMS
---
Building a coupon management was the first project I did at IB. Though I searched for a CMS to use as a reference but couldn’t find one. Eventually I conceptualised the entire system myself.

This is a post aimed at explaining the basic layout of a Coupon management system for websites. Hope this will be useful for someone who is building a coupon system particularly in the ecommerce space.

Offers provided to customers can be of 2 types

1. Coupons
2. Vouchers

**Types of Discounts**

1. **Flat discounts -**These are fixed discounts given on purchase of a particular Product.  
   Eg: Rs. 50 off on purchasing safety shoes .

**2. Percentage discounts -** In this type the discount will be a percentage of the price if a particular item.  
Eg: 20% off on purchasing safety shoes.

The Coupon codes can applicable at C1, C2, C3, Product or items levels.

**Functional Requirements for the CMS (Backend)**

A simple coupon management system should have the following

1. Create offers
2. Offer Dashboard
3. Consumption History
4. Voucher dashboard

**Offer creation**

**Create Coupon Code**

**Flat discounts**

![](https://cdn-images-1.medium.com/max/1600/0*mmKbBWX9sMAFXuW3.)

**Offer name**: Purpose of this field is for easy identification of a type of offer.

Field Type : Input field _—_ character limit -25

**Type :** Select type of discount

Select options 1.Flat 2.Percentage

**Method :** select options

1. Coupons
2. 2.Vouchers

**Start date & time** : The exact time at which the Coupon code will be active.

Field type : Date time picker

**End Date & time :** The exact time at which the Coupon code will expire and no longer will be applicable.

Filed type :Date time picker

**Max total usage:**

For vouchers- It is the total number of usages before expiry.

For coupons — the total usage is the cumulative sum of the number of times a coupon is used by a user.

No Value would indicate unlimited usage by a user. The tracking of a coupon/voucher code consumption per user would be done on the basis of email address

**Percentage Discounts**

![](https://cdn-images-1.medium.com/max/1600/0*E8gwmqm8_C2ShTm_.)

* **Discount Percentage** — A percentage discount based on the include/exclude rules.
* **Discount Amount** — A fixed total discount based on the include/exclude rules.
* **Minimum Range Amount —** The minimum amount in Rupees in the Cart based on the include/exclude rules.
* **Allowed Max. Discount —** The maximum discount in terms of absolute number in Rupees that could be given in the cart post the Offer Code application based on the include/exclude rules.
* **Maximum Usage —** Maximum no. of times the coupon code could be applied in the system.

**Coupon Details**

![](https://cdn-images-1.medium.com/max/1600/0*fIVjebUC78erdmNN.)

**Coupon Code**: Code used by the customer to avail a discount

Field Type : Input field — Character limit 25

**Message to be displayed on the website** : Not more than 100 characters.

Field Type: Text Area

**Max Usage per User** : It is the number of times a coupon code can be used an user. No Value would indicate unlimited usage by a user. The tracking of a coupon code consumption per user would be done on the basis of email address.

**All the field are mandatory except the terms and conditions**

**Add Terms and Conditions** :

Field Type : Button

On clicking the button a popup window should come. The window should contain a HTML editor. On submitting it should create a url for the terms page and link it with the coupon

**Voucher details**

![](https://cdn-images-1.medium.com/max/1600/0*s67UTyjTidHcTTHw.)

Here a user has to enter the number of vouchers to be generated. The other fields are same as that of coupons

**Selection Page**

![](https://cdn-images-1.medium.com/max/1600/0*HOR7sGOKmlYSqlCB.)

On clicking next button in the create page the user will be redirected to a page where he will be shown an option to choose the above option. The categories option will be the default page. This default page will have an option to select the categories for applying coupon codes.

This page should have a category treeview with checkboxes. Refer to the sample tree below. This design is aimed at simplifying the category selection process.

![](https://cdn-images-1.medium.com/max/1600/1*yvgyex6cVBHewKjdqgN9pw.png)

The user should have an option select , include and exclude brands from the above selected category. The design below is self explanatory. If no options are selected, all the brands will be included in the category list.

![](https://cdn-images-1.medium.com/max/1600/0*F7Cs5C5jUX2w5L5X.)

![](https://cdn-images-1.medium.com/max/1600/0*24XV2WFozUR-4OXT.)

If the user selects the other button **— “Create Coupon codes for Products”** then following design should be shown

![](https://cdn-images-1.medium.com/max/1600/0*VFAGRrJKlx0YUxe_.)

**Keyword search:** The user should be able to search SKU ID, product name, etc.

**Category :** This should include all the C1,C2,C3 and C4 categories.

Field type : combobox

**Brand :** Field type : combobox

**Min price & Maximum Price. :** For choosing price range. Field type : input field .

The **active coupons** shows the list of coupons already applicable for the particular product

Limit the number of pages to 100 . All other properties are self explanatory

On clicking DONE button a success message to be shown as follows:

For coupons

**Offer Created Successfully! Last created Offer’s Code is: XXXXXX**

For vouchers

**Offer Created Successfully! You can download list of voucher codes here. link**

On clicking the link a excel sheet should be generated with the voucher codes.

**Dashboards**

There will be three dashboards

1\.Offer Dashboard

2\.Coupon Dashboard

3\. Voucher Dashboard

**Offer Dashboard**

![](https://cdn-images-1.medium.com/max/1600/0*bPiCrdOnhUcmptm-.)

**Total usage:** It is the total number of times a particular offer was used

**Edit :** The edit option will be available only for active offers. On clicking edit button, the user will be shown a window where he will be able to change the end date of the offer.

**Deactivate:** This option will be available only for active offers.On clicking the deactivate button the offer will be deactivated immediately and the status will change to deactivated.

**Activate** : This option will be available for both expired and deactivated. On clicking edit button, the user will be shown a window where he will be able to asked change the start date and the end date of the offer. In the backend the same will be identified with a new offerid.

All the fields in this table would be searchable via a Database search.

On clicking **“view history”** the user should be redirected to the consumption dashboard with the prefilled search result as per the offer dashboard. Note that this option is available only for coupon offers

On Clicking “**View details**” the user will be redirected to the voucher dashboard with the prefilled search result as per the offer dashboard. Note that this option is available only for voucher offers.

**Consumption Dashboard**

Consumption dashboard would be shown in a Tabular format with Search facility/sort facilities for various fields.

The following Columns would be shown:

![](https://cdn-images-1.medium.com/max/1600/0*wLc06Y204X17YtG2.)

All the fields in this table would be searchable via a Database search

For seeing all the Voucher/Coupon Codes under an “Offer Name” the same should be possible. This implies that Offer Name — Voucher Code works as a Parent -Child relationship in a One-to-Many or One-to-One relationship.

**Voucher Dashboard**

Voucher consumption dashboard would be shown in a Tabular format with Search facility/sort facilities for various fields.

The following Columns would be shown:

![](https://cdn-images-1.medium.com/max/1600/0*qcaED1mz9tsMsEUe.)

All the fields in this table would be searchable via a Database search

On clicking view consumption dashboard the user should be redirected to consumption dashboard with the prefilled search filter as per the voucher dashboard.

**Additional Requirements**

* The Coupon code would be applicable in the cart page irrespective of user is logged in or not. In case of a Coupon being usable only a limited no. of times by a user, such a check would be based upon the email address (irrespective of Guest checkout or Registered User flow).
* The coupon code applied will be shown in the Corresponding Carts, Payment Page and Receipts.
* The coupon code Add and Edit History must be tracked so for any edit in any field, a new row should be created in the Coupons Table of the Database.
* Coupon consumption to be tracked in a separate table for each consumption attempt (Successful/Unsuccessful). For Offer aka Coupon code, the consumption track would be done from this table. For Vouchers (which are unique codes i.e. only one consumption per voucher code, the track could be done from the coupon table as well, though for each consumption attempt, an entry should be made in the Coupon Consumption Track table.
* Only one coupon code can be applied at a time.
* Once a coupon code is added to the cart it should remain in the cart until a the user remove the code or clicks on the make payment button.

**Website**

The coupons can be promoted with banners, offer filters etc. The banners or the filter should take the user to a landing page of products applicable to the coupons. Applicable coupons can also be displayed in the products details page. We can include a configuration in the coupon creation process whether to display the coupon in the product page or the listings.

**Applying voucher to cart**

The procedure is same as that for coupon codes. Whenever a user applies a voucher code, it applicability for the products and the validity should be checked. On successful completion of the transaction the voucher should be deactivated and rendered unusable permanently. in the table details of the email id of the user should be saved against the voucher code.

![](https://cdn-images-1.medium.com/max/1600/0*e9fe3YEdAL1rRvXm.)

![](https://cdn-images-1.medium.com/max/1600/0*LECy-sjfDO6teYNo.)

![](https://cdn-images-1.medium.com/max/1600/0*zU8bKdNWcSDOpJ70.)

The coupons will be applied at item level and the item level tax will be applied to the discounted amount.

The same coupon application option should be made available in the review cart section in the payment page.

**Messages based on coupon code applied**

1. The Coupon code you have entered is no longer valid.
2. The Coupon code you have entered is not applicable to the product in your cart. click here to view the applicable products.
3. The Voucher code you have entered is no longer valid.
4. The Voucher code you have entered is not applicable to the product in your cart. click here to view the applicable products.

**Post events**

**Coupon**

If the transaction fails the coupon code should be activated for the user further usage. But the history of failed transaction should be saved in the database. If the customer opts for COD option, then the coupon code should be made available if the delivery fails.

Usecases:

Assume a user can use a coupon code **XYZ123** 5 times. He/she uses it for the first time.

* If the transaction failed. Then he can use the same coupon 5 times. But history will be saved in the db.
* If the customer opts for COD, he is eligible for discount. If the delivery fails he will still have 5 coupons for usage.
* If the customer cancel the order, he will be left with 4 coupons.
* If the order is cancelled from our side then again he can use the coupons upto 5 times.

**Vouchers**

* If the transaction fails the voucher code should be activated for further usage. But the history of failed transaction should be saved in the database.
* If the customer opts for COD, he is eligible for discount of the applicable products . If the delivery fails the voucher should be made available for usage after confirmation.
* If the customer cancels the order the voucher will no longer be applicable
* If the order is canceled from our side. The voucher code will be made active for the user.

**Edit T&C option in the admin panel.**

In the promotions dashboard, corresponding to every offers there should be an option to edit T&C. On clicking the option the edit the text editor should open with the previously submitted Terms & Conditions

![](https://cdn-images-1.medium.com/max/1600/0*82wWycVrPKi_1mDq.)

**Copy T&C url to Clipboard**

There url of the terms and conditions page should be shown in the admin panel and the user should be able to copy this url to clipboard.

**Terms & Conditions Page.**

There should be a link to the T&C page in the cart along success message of the coupon/voucher

![](https://cdn-images-1.medium.com/max/1600/0*23N7cLknz6P8eSV0.)

If no terms & conditions are available there should be a default T&C page for the coupons

More type of coupons could be add to this system as per the business requirement

**The END**
