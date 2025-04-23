# Test list for my group memebers

|Test name|Script|Purpose
|---|---|---|
|'/get/cart'|tests/get_cart.js|get a customers cart|
|'/post/addtocart'|tests/add_to_cart.js|add an item to a customers cart|
|'/post/updatecartitems'|(test skipped due to redundancy from tests/add_to_cart.js)|change the quantity of a cake already in a customers cart|
|'/get/checkoutdata'|tests/check_out_data.js|get checkout data for a user|
|'/post/adddeliveryaddress'||add a delivery address to a customers account|
|'/post/addpaymentmethod'|tests/addpaymentmethod.js|add a payment method for a users account|
|'/post/login'|tests/user_login.js|user login|
|'/post/signup'|tests/user_signup.js|customer sign up|
|'/get/catalog'||get all cakes for the catalog|
|LoginStaff|LoginStaff.js|---|
|ViewAllOrders|ViewAllOrders.js||

Staff:
+ LoginStaff ()
+ UpdateProduct ()
+ ViewAllOrders()
------------------------------------
Customer:
+ LoginCustomer(username, password)
+ UpdateAccount(customer_id, new_info)
------------------------------------
Order:
+ CreateOrder(customer_id, items, total_price)
+ UpdateOrderStatus(order_id, status)
-------------------------------------
 Cakes:
+ GetAllCakes()
+ AddCake(cakeDetails)
+ DeleteCake(cakeId)
+ UpdateCake(cakeId, updatedDetails)
+ GetCakeByUUID(cakeId)