---
layout: post
title: Courier selection engine for E commerce companies
tags:
- Ecommerce
- Courier
share: true
category:
- product
modified: 2017-11-07 18:30:00 +0000
comments: true

---
E commerce companies ship their products to customers via multiple courier partners. Most of them have an automated courier selection process for shipping. At IB one of the major challenges we faced was the increasing logistics cost. Hence we developed a system to automatically recommend the courier to be selected for each package that was shipped from our warehouses and by our sellers spread across India. It is essential for every company who rely on multiple courier service to optimise their logistics cost. Through this article I would like to give a brief overview of a simple courier selection system. This system need not be a web app, this could be even run on a excel based system and hence even small companies can take the advantage of this approach.

#### **Master Data**

This include the data of From, To COD & To Prepaid pincodes of each LSPs along with amount limit and their pincode zones. Rate chart and other terms in the contract such as COD charges, AWB charges.

Pincode Zones — Couriers categorize their serviceable pincodes into different zones. e.g. North east, West etc..

#### Rules

Below are the criteria for selecting a courier for a shipment

1. Serviceability
2. Freight Cost
3. Turn around time
4. Service levels such as rate of RTOs, Damages, lost in transit, COD remittance TAT, Pickup TAT

Let us go through each step in detail

#### **1. Serviceability**

This process includes getting the list of LSPs which are serviceable.

This serviceability check is done on the following parameters

1\. Checking which all LSP serves both From & to Pincodes.

2\. Checking which all LSP serves COD/Prepaid amount of the package.

3\. Check if the Charged weight of the package exceeds the weight limit of the selected LSPs  
 **Charged weight of the packet** = Max (physical wt, Volumetric wt)

a. Physical weight = “Weight of SKU”

b. Volumetric weight = “ L_b_h / volumetric factor ( each LSP has a different volumetric factor. L,B,H in cm)

4\. If the Product Shipping Category is supported by the LSP.

Various Products types falls under the following category

* Normal
* Liquids
* Paints
* Dangerous goods
* Fragile
* Gases

5\. Number of Boxes — This is applicable in case of multi part shipment where a single product is shipped in multiple packages. Here a single AWB will have multiple boxes. Not all the LSPs support multi part shipments

#### 2. Freight Cost

Though cost is not the only criteria for selecting an LSP, it is one the most important parameter as its reduction can substantially improve the net earnings per package. Currently most of the ecommerce players charge a nominal shipping charge from the customers. However the actual freight charge will be different. This can go as high as 80% of the product value. I have even seen cases where freight charges is higher than the product value. The freight cost optimization can have a major impact especially in B2B ecommerce where the product size varies widely (from a small box of screws to big items such as solar panels and heavy machinery).

Every LSP shares a Rate chart according to the contract signed.

Below are some sample Rate charts.

![](https://cdn-images-1.medium.com/max/1600/1*nyKTzLtFJmWdmtHrWiCztA.png)Fig. 1 Rate Chart type 1

![](https://cdn-images-1.medium.com/max/1600/1*34sEcRbb0KJWg-_bX7JwBQ.png)Fig.2 Rate Chart Type 2

FedEx, Bluedart etc. have Type 1 rate chart. Delhivery has type 2 rate chart. Some other couriers such as Safexpress has a 3rd type of rate chart as below

![](https://cdn-images-1.medium.com/max/1600/1*zehqqR0zRi6rI51F-5AHsw.png)Fig.3 Rate Chart type 3

![](https://cdn-images-1.medium.com/max/1600/1*qtg3UZ2rpIcaOfLrKq5WNQ.png)Fig.4 Zone Matrix

Rate Charts- LSPs prepare rate charts by laying out the flat rates applicable on the kg slabs against the Rate group. Refer to fig.3

Zone matrix — This matrix defines rate group which will be applicable on movement of goods from one zone to another. Refer to Fig.4

Type 3 is similar to Type1. The difference here is that instead of directly mentioning the per kg rate against the from-to zones, they give us a flat rate against the weight slab and a weight group. And then this rate group is mentioned in the zone matrix.

Here we can take the type 3 case for freight calculation since type 1 & 2 charts can be structured to fit into type 3.

The rate chart and the zone matrix is used to calculate the base freight. There will be other charges contributing to the freight based on the contract. Below is a list of such charges.

* COD charges - max (min COD charge, % of invoice value)
* AWB charge — Flat amount
* Fuel Surcharge — % of invoice value
* Freight on Value(FOV)- % of invoice
* Risk on Value(ROV)- % of invoice
* Additional charges- % of invoice
* Chargeable weight — Max(Min chargeable weight , Max (physical wt, Volumetric wt))
* Base freight = If (chargeable weight ≤ max(weight slab))  
   { Rate(rate group,weight slab)   
  Else   
   { Rate(rate group, max(weight slab))+(Roundup((chargeable weight- max(weight slab))/additional slab),* charges per additional slab }

Note : Rate group is derived from the zone matrix. E.g.Suppose a case where ‘from pincode’ belongs to zone west and ‘ to pincode’ belongs to East and the packages chargeable weight is 3kg. Thus the rate group applicable will be ‘A’ as per fig.4 and referring to the fig.3, the base cost will be 80.

* CAF value= (Base freight+ COD charges+ AWB charges + Fuel surcharge+FOV+ROV+Additional Charges)* CAF(%)/100
* Service tax=(Base freight+ COD charges+ AWB charges + Fuel surcharge+FOV+ROV+Additional Charges + CAF)*18/100

**Total freight** = Base freight+ COD charges+ AWB charges + Fuel surcharge+FOV+ROV+Additional Charges + CAF+ service tax .

From this we would get the freight cost of all the serviceable LSPs and rank it in the ascending order of cost.

#### 3. Turn around time (TAT)

Each order may be having a expected delivery date. Based on historical trend of the we may derive a zone to zone TAT matrix. We can chose define a positive deviation in TAT that can be allowed either at global level or at package level. Or we use a

#### 4. Service levels such as rate of RTOs, Damages, lost in transit, COD remittance TAT, Pickup TAT etc.

The service level parameters can be used to derive performance rating for each LSP. A simple rating formula would look like this

Rating of an LSP =((1- ((RTO cases+Damage cases+Lost in transit)/Total number of shipments in the past 3 months))+(1/Avg COD remittance TAT)+(1+Avg Pickup TAT))*100

You can give more weightage to each items according to your choice.

**You can select the courier based on individual criteria or use a combination of all.**