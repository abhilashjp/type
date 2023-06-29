---
layout: post
title: How I increased the conversion rate of a mobile app by 60% ?
tags: [Coversion rate, Mobile app]
category: product
published: true
---

During my time at housing.com I was fortunate to work on the consumer mobile app. My primary job was to improve the conversion rate of the mobile app.  In this article I will try to discuss the some of the initiatives that helped me to increase the conversion rate of the app.

Housing is one of the real estate classifieds portals in India. [Housing.com](http://Housing.com) helps people to find real estate properties for buying or renting. The properties are listed on the platform by real estate agents or home owners. 

I was a newbie to mobile apps when I started working on the app. I also had a few constraints. At that point in time the traffic on the mobile app lagged behind the mobile web and the desktop. I couldn’t implement any new features which required back end APIs as the back end team was occupied with the web priorities. 

Through various initiatives, I was fortunate to improve the user conversion rates of the mobile app by more than 60%.

Let me first define the **conversion rate**. 

User conversion in this context refers to the percentage of users who submit a lead by verifying their phone number on a property they like, out of the total number of users who visit the mobile app. 

Below are some of the initiatives that helped me improve the conversion rates


## The Onboarding Journey 

### Then 

When a user opens the housing app for the first time after installation, they were taken to a city selection screen. Once they search and select city, they were taken to a Homepage. 

This homepage contained a search bar, where the user had to add the name of the locality they are looking for and click on search button. This home page also had a list of promoted properties and categories.  

Clicking on search button will take them to a search listings page. This page contained the list of properties available in the locality. The list of properties where sorted in the order of ranking. 

Since the we had very less click stream data, there was nearly no personlisation possible in this ranking list.

### Now 

We started with identifying the parameters that every home seeker will have in mind while they start looking for a property. Through user interviews, session recording  and the analysis property filter’s usage data, we came to the conclusion that even if a user hasn’t finalized on a locality, they will still have some basic criteria on the budget range and the BHK type(Bedroom Hall Kitchen). 

This is broadly true for both Rent and Buy cases. For buy cases there is also a knowledge building process which I will talk about in a separate blog post. 

Hence we decided to make budget range and the BHK type part of the first timer visitor’s user journey and called it ‘Basic Profiling’.  Once they click on search after selecting thes details, they were taken to a listings page with more refined list of properties as per their requirements. 

We released this as experiment. Initially we were slightly concerned about the drop off this new user journey can cause due to introduction of the additional steps in user journey. This was worry as unnecessary as the improvement in the conversion was far out weighed its impact on the drop offs when compared to the control group . We ran the experiment for a few weeks and once we established that the results were [statistically significant](https://abtestguide.com/calc/)  we rolled this out to the rest of user set.


<iframe src="https://youtube.com/shorts/g5kmohe1Hdc" frameborder="0"> </iframe>
