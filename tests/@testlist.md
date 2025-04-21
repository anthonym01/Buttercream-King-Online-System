# Test list for my group memebers

|Test name|Script|Purpose
|---|---|---|
|'/get/cart'|tests/get_cart.js|get a customers cart|
|'/post/addtocart'|tests/add_to_cart.js|add an item to a customers cart|
|'/post/updatecartitems'|(test skipped due to redundancy from tests/add_to_cart.js)|change the quantity of a cake already in a customers cart|
|'/get/checkoutdata'|tests/check_out_data.js|get checkout data for a user|
|'/post/adddeliveryaddress'||add a delivery address to a customers account|

## /post/addpaymentmethod
- add a payment method for a users account

## '/post/login'
- user login 

## '/post/signup'
- customer sign up

## '/get/catalog'
- get all cakes for the catalog

## '/post/submitorder'
- Submit an order for a user

## '/get/orders'
- get a users orders

## '/get/ordersall'
- get all orders

## '/get/orderbyid'
- get an order via its unique identifier

## '/get/cakebyuuid'
- Get a cake via its uuid

## '/get/loyaltypoints'
- get a customers loyalty points

## '/get/stafflogin'
- staf member login

## '/post/uploadcakedata'
- Create a cake 

## '/post/editcake'
- update a cakes data via its unique id

## '/post/deletecake'
- delete a cake via its unique id

## '/get/staff'
- get all staff members data

## '/post/staffupdate'
- update a staff members data by

## '/get/staffbyid'
- get a staff member by its id

## '/post/deletestaff'
- delete a staff member

## '/get/customers'
- get all customers data

## '/get/customerbyid'
- get a customers data via their uuid

## '/post/updateorderstatus'
- Change an orders status via order number

## '/post/cancelorder'
- relies on updateorder
- cancel an order by its ordernumber