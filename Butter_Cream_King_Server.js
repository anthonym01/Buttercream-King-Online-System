//'node Server.js'
//This is the server file, it will handle all requests and responses

//Server configuration
const port = 8083;
const express = require('express');
const app = express();
const logs = require('./modules/logger');
const database = require('./modules/database_wrapper');

app.listen(port, () => {
    try {
        logs.initalize();//initalize logger
        //logs.info('Subpath sample ',subpath+'/get/catalog');
        logs.info('Server starting');//log server start
        logs.info('Running on port ', port);
        logs.info('Process ID: ', process.pid);
        logs.info('Process path: ', process.cwd());
        //connection.connect();
    } catch (error) {
        logs.error('Catastrophy on server start: ', error);
    }
})//Listen for requests, this starts the server

//bind root path to /www folder
app.use(express.static('www')).listen(() => {
    logs.info('serving static files from ', __dirname + '/www');
}).on('error', (err) => { logs.error('Express JS error: ', err) }).on('listening', () => { logs.info('Express JS listening') }).on('connection', (socket) => { logs.info('Express JS connection', socket) });

//Template post handler
app.post('/post/template', (req, res) => {
    try {
        logs.info('Post template');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            res.end(JSON.stringify({ answer: "post template" }));
            //find cake
        });
    } catch (error) {
        logs.error('Catastrophy on template post: ', err);
    }
});

//Template get handler
app.get('/get/template', (req, res) => {
    try {
        logs.info('Get template');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            res.end(JSON.stringify({ answer: "get template" }));
        });
    } catch (error) {
        logs.error('Catastrophy template get: ', err);
    }
});

// Get cart handler
//This will get the users cart, and return it as a json object
app.post('/get/cart', (req, res) => {
    try {
        logs.info('Get users cart');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects username;
            try {
                if (typeof (data) != 'undefined') {
                    // Get old cart data
                    database.getCustomersViaUsername(data).then((result) => {
                        const cartdata = JSON.parse(result.Cart_items) || [];
                        logs.info('Old cart data: ', cartdata, ' for user: ', data);
                        res.end(JSON.stringify(cartdata));
                    });

                } else {
                    logs.error('No username provided in get cart request: ', data);
                    res.end(JSON.stringify({ status: "error" }));
                }
            } catch (error) {
                logs.error('Catastrophy on Get cart: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on Get cart: ', err);
    }
});

//Add to cart handler
//This will add a cake to the cart, or update the quantity if it already exists
app.post('/post/addtocart', (req, res) => {
    try {
        logs.info('Add to cart');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects { cakeid, quantity username };
            try {
                if (typeof (data.cakeid) != 'undefined' && typeof (data.quantity) != 'undefined' && typeof (data.username) != 'undefined') {
                    // Get old cart data
                    database.getCustomersViaUsername(data.username).then((result) => {
                        let oldcart = JSON.parse(result.Cart_items) || [];
                        logs.info('Old cart data: ', oldcart, ' for user: ', data.username);
                        console.log('Datatype: ', typeof (oldcart));
                        // Check if cake is already in cart
                        let existingItemindex = false;
                        for (let i = 0; i < oldcart.length; i++) {
                            if (oldcart[i].cakeid === data.cakeid) {
                                existingItemindex = i;
                                logs.info('Found existing item in cart: ', oldcart[i]);
                                break;
                            }
                        }
                        if (existingItemindex !== false) {
                            // Update quantity if cake is already in cart
                            oldcart[existingItemindex].quantity = Number(oldcart[existingItemindex].quantity) + Number(data.quantity);
                            logs.info('Updated existing item: ', oldcart[existingItemindex]);
                        } else {
                            // Add new item to cart
                            logs.info('Adding new item to cart: ', data);
                            oldcart.push({ cakeid: data.cakeid, quantity: data.quantity });
                            logs.info('New cart data: ', oldcart);
                        }
                        // Update the cart in the database
                        database.updateCustomer(data.username, { Cart_items: JSON.stringify(oldcart) });
                        logs.info('Updated cart: ', result);
                        res.end(JSON.stringify({ status: "success" }));
                    });

                }
            } catch (error) {
                logs.error('Catastrophy on add to cart post: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on add to cart: ', err);
    }
});

//get/checkoutdata handler
//This will get the users checkout data, and return it as a json object, specifically the address and payment method
app.post('/get/checkoutdata', (req, res) => {
    try {
        logs.info('Post template');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//quick checkout data, expects username ;
            database.getCustomersViaUsername(data).then((result) => {
                logs.info('Checkout data for : ', result);
                if (typeof (result) != 'undefined') {
                    res.end(JSON.stringify({ deliveryinfo: result.Delivery_address, paymentinfo: result.payment_details }));
                } else {
                    res.end(JSON.stringify({ status: "error" }));
                }
            });//find cake
        });
    } catch (error) {
        logs.error('Catastrophy on template post: ', err);
        res.end(JSON.stringify({ status: "error" }));
    }
});

//Add delivery address handler
//This will add a delivery address to the users account
app.post('/post/adddeliveryaddress', (req, res) => {
    try {
        logs.info('Add delivery address');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects { address, username };
            try {
                if (typeof (data.Delivery_address) != 'undefined' && typeof (data.username) != 'undefined') {
                    database.updateCustomer(data.username, { Delivery_address: JSON.stringify({ address: data.Delivery_address }) });
                    logs.info('Updated delivery address: ', data.address, ' for user: ', data.username);
                    res.end(JSON.stringify({ status: "success" }));
                }
            } catch (error) {
                logs.error('Catastrophy on add to cart post: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on add to cart: ', err);
    }
});

// Add payment method handler
app.post('/post/addpaymentmethod', (req, res) => {
    try {
        logs.info('Add payment method');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects { card, username };
            try {
                if (typeof (data.card) != 'undefined' && typeof (data.username) != 'undefined') {
                    database.updateCustomer(data.username, { payment_details: JSON.stringify(data.card) });
                    logs.info('Updated payment method: ', data.card, ' for user: ', data.username);
                    res.end(JSON.stringify({ status: "success" }));
                }
            } catch (error) {
                logs.error('Catastrophy on add to cart post: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on add to cart: ', err);
    }
});

//User login handler
app.post('/post/login', (req, res) => {
    /*This is a post request, it will be used to authenticate a user*/
    /* TO DO: impliment session key generation and storage later */
    try {
        logs.info('User login started');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            try {
                database.getCustomersViaUsername(data.user).then((result) => {
                    logs.info('Lookup result: ', result);
                    if (typeof (result) != 'undefined' && result.length!=0 && result.password == data.pass) {
                        res.end(JSON.stringify({ status: "sucess" }));
                    }
                    else {
                        logs.info('User does not exist or password is incorrect: ', data.user);
                        res.end(JSON.stringify({ status: "fail" }));
                    }
                });
            } catch (error) {
                logs.error('Catastrophy on login post: ', error);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on login post: ', err);
    }
});

//User registration handler
app.post('/post/signup', (req, res) => {
    /*This is a post request, it will be used to register a user*/
    try {
        logs.info('User signup started');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);// { user, pass };

            try {
                if (typeof (data.user) != 'undefined' && typeof (data.pass) != 'undefined') {
                    database.getCustomersViaUsername(data.user).then((result) => {
                        if (typeof (result) == 'undefined'|| result.length == 0) {
                            logs.info('User does not exist, creating new user: ', data.user);
                            // Create new user
                            const newUser = {
                                username: data.user,
                                password: data.pass,
                                Cart_items: JSON.stringify([]),
                                orders: JSON.stringify([]),
                                Delivery_address: JSON.stringify({ }),
                                payment_details: JSON.stringify({}),
                                loyalty_points: 0,
                            }
                            //Insert new user into database
                            database.insert_into_Customers(newUser).then((result) => {
                                logs.info('User created: ', result);
                            });
                            res.end(JSON.stringify({ status: "success" }));
                        } else {
                            res.end(JSON.stringify({ status: "exists" }));
                        }
                    });
                } else {
                    res.end(JSON.stringify({ status: "error" }));
                }
            } catch (error) {
                logs.error('Catastrophy on signup post: ', error);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on signup post: ', err);
    }
});

//get bakerys catalog
app.get('/get/catalog', (req, res) => {
    try {
        logs.info('Connection ', req.hostname, 'requested catalog');
        req.on('data', function (data) {
            logs.error('got payload: ', data, ' Despit not expecting any');
        });
        database.getCakes().then((results) => {
            logs.info('Database retuned inventory: ', results);
            res.end(JSON.stringify(results));
        });

    } catch (error) {
        logs.error('Catastrophy catalog conveyor: ', err);
    }
});

//submit order handler
//This will submit an order to the database, and update the users orders
app.post('/post/submitorder', (req, res) => {
    console.log('Submit order');
    try {
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//{ username, Items: {}, Status,total_price: float,Date: ISOString };
            try {
                const order = {
                    Items: JSON.stringify(data.Items),
                    Status: data.Status,
                    total_price: Number(data.total_price),
                    Date: new Date()//data.Date
                }
                if (typeof (data.username) != 'undefined') {
                    database.insert_into_Orders(order).then((result) => {
                        logs.info('Order submitted: ', result);

                        const orderid = result.insertId;
                        //Update the Customer with the order id
                        database.getCustomersViaUsername(data.username).then((result) => {
                            let old_order_data = JSON.parse(result.orders) || [];
                            logs.info('Old order data: ', old_order_data, ' for user: ', data.username);
                            console.log('Datatype: ', typeof (old_order_data));

                            logs.info('Adding new order to user: ', old_order_data);
                            old_order_data.push(orderid);
                            logs.info('New orders data: ', old_order_data);

                            // Update the cart in the database
                            database.updateCustomer(data.username, { orders: JSON.stringify(old_order_data), Cart_items: JSON.stringify([]) });
                            // Clear the cart after order is submitted
                            logs.info('Updated user orders: ', old_order_data);
                            res.end(JSON.stringify({ status: "success" }));

                            // update loyalty points
                            let loyaltypoints = Math.floor(data.total_price / 100);
                            logs.info('Adding loyalty points: ', loyaltypoints, ' for user: ', data.username);
                            database.updateCustomer(data.username, { loyalty_points: Number(result.loyalty_points) + Number(loyaltypoints) });
                        });
                        res.end(JSON.stringify({ status: "success" }));
                    });
                }
            } catch (error) {
                logs.error('Catastrophy on add to cart post: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on add to cart: ', err);
    }
});

//get orders for a user
//This will get the users orders, and return it as a json object
app.post('/get/orders', (req, res) => {
    try {
        logs.info('Get users orders');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects username;
            try {
                if (typeof (data) != 'undefined') {
                    // Get old order data
                    database.getCustomersViaUsername(data).then((result) => {
                        const orderdata = JSON.parse(result.orders) || [];
                        logs.info('order data: ', orderdata, ' for user: ', data);
                        console.log('Datatype: ', typeof (orderdata));
                        // Translate order ids to order objects
                        let orders = [];//Array to hold promised orders
                        for (let i = 0; i < orderdata.length; i++) {
                            orders.push(database.getOrdersViaUuid(orderdata[i]));
                        }
                        // Wait for all orders to be retrieved
                        logs.info('Waiting for all orders to be retrieved: ', orders);
                        // Use Promise.all to wait for all promises to resolve
                        Promise.all(orders).then((results) => {
                            logs.info('All orders retrieved: ', results);
                            // Filter out orders that are not in the database
                            let filteredOrders = results.filter((order) => {
                                return order != undefined && order != null;
                            });
                            logs.info('Filtered orders: ', filteredOrders);
                            res.end(JSON.stringify(filteredOrders));
                        }).catch((error) => {
                            logs.error('Error retrieving orders: ', error);
                            res.end(JSON.stringify({ status: "error" }));
                        });
                    });

                } else {
                    logs.error('No username provided in get orders request: ', data);
                    res.end(JSON.stringify({ status: "error" }));
                }
            } catch (error) {
                logs.error('Catastrophy on Get orders: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on Get orders: ', err);
    }
});

// find a cake by its uuid
app.post('/get/cakebyuuid', (req, res) => {
    try {
        logs.info('search cake');
        req.on('data', function (data) {
            const cakeid = JSON.parse(data);
            logs.info('got id to find : ', cakeid);
            database.getCakesViaUuid(cakeid).then((result) => {
                res.end(JSON.stringify(result));
            })
        });
    } catch (error) {
        logs.error('Catastrophy on test post: ', err);
    }
});

app.post('/get/loyaltypoints', (req, res) => {
    try {
        logs.info('Get loyalty points');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects username;
            try {
                if (typeof (data) != 'undefined') {
                    // Get old cart data
                    database.getCustomersViaUsername(data).then((result) => {
                        const loyaltypoints = Number(result.loyalty_points) || 0;
                        logs.info('Loyalty points: ', loyaltypoints, ' for user: ', data);
                        res.end(JSON.stringify({ loyaltypoints: loyaltypoints }));
                    });

                } else {
                    logs.error('No username provided in get cart request: ', data);
                    res.end(JSON.stringify({ status: "error" }));
                }
            } catch (error) {
                logs.error('Catastrophy on Get cart: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on Get cart: ', err);
    }
});

//Redirect to staff login
app.get('/staff', (req, res) => {
    try {
        logs.info('Redirecting to staff login');
        res.redirect('staff.html');
    } catch (error) {
        logs.error('Catastrophy on staff redirect: ', err);
    }
});

//Get staff login
app.post('/get/stafflogin', (req, res) => {
    try {
        logs.info('User login started');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            try {
                database.getStaffViaUsername(data.user).then((result) => {
                    logs.info('Lookup result: ', result);
                    if (typeof (result) != 'undefined' && result.length!=0 && result.password == data.pass) {
                        res.end(JSON.stringify({ status: "sucess" ,privilage: result.privilage_level}));
                    }
                    else {
                        logs.info('User does not exist or password is incorrect: ', data.user);
                        res.end(JSON.stringify({ status: "fail" }));
                    }
                });
            } catch (error) {
                logs.error('Catastrophy on login post: ', error);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on login post: ', err);
    }
})

// get all staff mambers for display
app.get('/get/staff', (req, res) => {
    try {
        logs.info('Get all staff members');
        database.getStaff().then((result) => {
            res.end(JSON.stringify(result));
        });
    } catch (error) {
        logs.error('Catastrophy on get staff: ', err);
        res.end(JSON.stringify({ status: "error" }));
    }
})