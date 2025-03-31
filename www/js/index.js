

const running_subpath = window.location.pathname;// Used to redirect requests if a subpath is used with nginx

window.addEventListener('load', async function () {//Starting point
    try {
        await config.load();//Load config from local storage
    } catch (err) {
        console.warn('Something bad happened: ', err);
    } finally {
        //page startup
        session_manager.initalize();
        ui_controller.initalize();
        catalog_maintainer.initalize();
        cart_maintainer.initalize();
        checkout_maintainer.initalize();
        //ui_controller.got_to_catalog();
    }
});

async function request(what) {// fetch data from the server
    try {
        const response = await fetch(what);
        if (!response.ok) { throw new Error('Network failiure'); }
        const data = await response.json();
        //console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function post(what, where) {//'fetch' data to the server
    try {
        const response = await fetch(where, {
            method: "POST",
            body: JSON.stringify(what),//JSON.stringify({ payload: "test" }),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        });
        if (!response.ok) { throw new Error('Network failiure'); }

        const data = await response.json();
        //console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/*
The `config` is used to manage local application data by saving,loading, and deleting configuration settings via local storage.
*/
let config = {
    data: {//Loacal app data
        credentials: { user: "", pass: "", sessionKey: null },
    },
    save: async function () {//Save config via local storage
        console.table('Configuration is being saved', config.data);
        localStorage.setItem("butterK_cfg", JSON.stringify(config.data));
    },
    load: function () {//Load config from local storage
        console.log('Configuration is being loaded');
        if (localStorage.getItem("butterK_cfg") == null) {//if no config is found, create a new one
            console.log('No config found, creating new one');
            localStorage.setItem("butterK_cfg", JSON.stringify(config.data));
        }
        config.data = JSON.parse(localStorage.getItem("butterK_cfg"));
        console.log('config Loaded: ', config.data);
    },
    delete: function () {//wipe the config
        localStorage.clear("butterK_cfg");//yeet the storage key
        console.log('config deleted: ');
        console.table(config.data);
        config.data = {};
        config.save();
    },
}

let properties = {
    observingcake: null,
    loggedin: false,
    paymentinfo: {},
    deliveryinfo: {},
    cart: [],
    counter: { items: 0, total: 0 },
}

/* Logins and sign up */
let session_manager = {
    initalize: async function () {
        console.log('Session manager startup');
        session_manager.attempt_login();
        document.getElementById('Login_button').addEventListener('click', function () { session_manager.login() });
        document.getElementById('Logout_button').addEventListener('click', function () { session_manager.logout() });
    },
    attempt_login: function () {// USed to get credentials on load
        console.log('attempt login');
        try {
            if (config.data.credentials.user != null) {//if never logged in, user is null
                post(config.data.credentials, 'post/login').then((response) => {
                    console.log('login state: ', response.status);
                    if (response.status == "sucess") {
                        properties.loggedin = true;
                        console.log('logged in');
                        document.getElementById('Logout_button').classList = "account_dropdown_item";
                        document.getElementById('login_trigger_button').classList = "account_dropdown_item_hidden";
                        document.getElementById('Login_error_message').classList = "Login_error_message_hidden";
                        document.getElementById('cart_title').innerHTML = `${config.data.credentials.user}'s cart`;
                        ui_controller.hide_account_callout()
                        ui_controller.hide_login_dialog()
                    }
                    else {
                        session_manager.logout();//logout if not logged in to clear keys, jingle jingle
                        console.log('login failed');
                        document.getElementById('Login_error_message').classList = "Login_error_message";
                    }
                });
            }
        } catch (error) {
            console.error('Error during login attempt: ', error);
            session_manager.logout();
        }

    },
    logout: function () {
        console.log('logout');
        properties.loggedin = false;
        config.data.credentials = { user: null, pass: null, sessionKey: null };
        document.getElementById('Logout_button').classList = "account_dropdown_item_hidden";
        document.getElementById('login_trigger_button').classList = "account_dropdown_item";
        ui_controller.hide_account_callout()
        ui_controller.hide_login_dialog()
        config.save();
    },
    // Login Triggered by the users action
    login: function () {
        console.log('login');
        const username_put = document.getElementById('Login_usernmae_put').value || "";
        const password_put = document.getElementById('Login_password_put').value || "";
        config.data.credentials = { user: username_put, pass: password_put };
        config.save();
        session_manager.attempt_login();
    },
    Demand_login: function () {
        console.log('action demands login/sign up');
        if (properties.loggedin == false) {
            //display login form
            ui_controller.show_login_dialog();
            document.getElementById('Login_error_message').classList = "Login_error_message_hidden";
            alert('You must log in to proceed with this action.');
        }
    },

}

let ui_controller = {
    initalize: async function () {
        console.log('Navigation overider startup');
        this.got_to_catalog();

        document.getElementById('Add_new_address_pannel_close_button').addEventListener('click', function () { ui_controller.hide_Add_delivery_address_pannel() });
        document.getElementById('Add_new_payment_method_pannel_close_button').addEventListener('click', function () { ui_controller.hide_Add_new_payment_method_pannel() });
        document.getElementById('Login_close_btn').addEventListener('click', function () { ui_controller.hide_login_dialog() });
        document.getElementById('login_trigger_button').addEventListener('click', function () { ui_controller.show_login_dialog() });
        document.getElementById('branding_block').addEventListener('click', function () { ui_controller.got_to_catalog() });
        document.getElementById('cart_button').addEventListener('click', function () { ui_controller.go_to_cart() });
        document.getElementById('cake_display_close_btn').addEventListener('click', function () { catalog_maintainer.close_cake() });
        document.getElementById('Procede_to_cart_button').addEventListener('click', function () { catalog_maintainer.procede_to_cart() });
        document.getElementById('Add_to_cart_button').addEventListener('click', function (event) { catalog_maintainer.add_to_cart() });
        document.getElementById('account_callout').addEventListener('click', function () { ui_controller.show_account_callout() });

    },
    got_to_catalog: function () {
        console.log('Navigate to catalog');
        document.getElementById('cake_catalog_page').classList = "main_view_active"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view"
        document.getElementById('checkout_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view"
        this.hide_account_callout()
    },
    go_to_cart: function () {
        console.log('Navigate to cart');
        if (config.data.credentials.user == null || properties.loggedin == false) {//if not logged in, demand login
            console.log('Login required to view cart');
            session_manager.Demand_login();
            return false;
        }
        document.getElementById('cake_catalog_page').classList = "main_view"
        document.getElementById('cart_page').classList = "main_view_active"
        document.getElementById('orders_page').classList = "main_view"
        document.getElementById('checkout_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view"
        this.hide_account_callout();
        cart_maintainer.load_cart();
    },
    go_to_orders: function () {
        console.log('Navigate to order');
        document.getElementById('cake_catalog_page').classList = "main_view"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view_active"
        document.getElementById('checkout_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view"
        this.hide_account_callout()
    },
    go_to_checkout: function () {
        console.log('Navigate to checkout');
        document.getElementById('cake_catalog_page').classList = "main_view"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view"
        document.getElementById('checkout_page').classList = "main_view_active"
        document.getElementById('account_page').classList = "main_view"
        this.hide_account_callout()
        checkout_maintainer.load_checkout();
    },
    go_to_account: function () {
        console.log('Navigate to account');
        document.getElementById('cake_catalog_page').classList = "main_view"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view"
        document.getElementById('checkout_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view_active"
        this.hide_account_callout()
    },
    show_account_callout: function () {
        console.log('show account callout');
        if (document.getElementById('account_dropdown').classList != 'account_dropdown') {
            document.getElementById('account_dropdown').classList = 'account_dropdown'
        } else {
            this.hide_account_callout()
        }
    },
    hide_account_callout: function () {
        console.log('hide account callout');
        document.getElementById('account_dropdown').classList = 'account_dropdown_hidden';
    },
    show_login_dialog: function () {
        console.log('show login dialog');
        this.hide_account_callout()
        document.getElementById('Login_dialog').classList = "Login_dialog"
    },
    hide_login_dialog: function () {
        console.log('hide login dialog');
        document.getElementById('Login_dialog').classList = "Login_dialog_hidden"
    },
    show_Add_new_payment_method_pannel: function () {
        console.log('show add new payment method');
        document.getElementById('payment_hard_page_shader').classList = "hard_page_shader"
        document.getElementById('Add_new_payment_method_pannel').classList = "Payment_method_add_edit_pannel"
    },
    hide_Add_new_payment_method_pannel: function () {
        console.log('hide add new payment method');
        document.getElementById('payment_hard_page_shader').classList = "hard_page_shader_hidden"
        document.getElementById('Add_new_payment_method_pannel').classList = "Payment_method_add_edit_pannel_hidden"
    },
    show_Add_delivery_address_pannel: function () {
        console.log('show add new payment method');
        document.getElementById('address_hard_page_shader').classList = "hard_page_shader"
        document.getElementById('Add_new_address_pannel').classList = "Payment_method_add_edit_pannel"
    },
    hide_Add_delivery_address_pannel: function () {
        console.log('hide add new payment method');
        document.getElementById('address_hard_page_shader').classList = "hard_page_shader_hidden"
        document.getElementById('Add_new_address_pannel').classList = "Payment_method_add_edit_pannel_hidden"
    },

}

let catalog_maintainer = {
    initalize: async function () {
        console.log("catalog startup");
        this.build();
    },
    /*
        Display All cakes from the database for the user to select
    */
    build: async function () {
        console.log("Build catalog");
        request('get/catalog').then((catalog) => {
            console.log('Got Catalog: ', catalog);//payload = { Title,  Description, image_uri, uuid }

            const customer_cake_catalog = document.getElementById('customer_cake_catalog')
            customer_cake_catalog.innerHTML = ""//clear old pedistals

            for (let cakeindex in catalog) {// construction zone
                let Cake_pedistal = document.createElement('div');
                Cake_pedistal.classList = "Cake_pedistal";
                Cake_pedistal.tagName = `Cake ${cakeindex}`;
                Cake_pedistal.title = `${catalog[cakeindex].Title}`;

                let cake_price = document.createElement('div');
                cake_price.classList = "cake_pedistal_price"
                cake_price.innerHTML = `\$${catalog[cakeindex].price.toFixed(2)}`;
                Cake_pedistal.appendChild(cake_price);

                let cake_img = document.createElement('div')
                cake_img.classList = "cake_img";
                cake_img.style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${catalog[cakeindex].image_uri}')`;
                Cake_pedistal.appendChild(cake_img);

                let cake_title = document.createElement('div');
                cake_title.classList = "cake_pedistal_title"
                cake_title.innerHTML = `${catalog[cakeindex].Title}`;
                Cake_pedistal.appendChild(cake_title);

                let cake_description = document.createElement('div');
                cake_description.classList = "cake_pedistal_description"
                cake_description.innerHTML = `${catalog[cakeindex].Description}`;
                Cake_pedistal.appendChild(cake_description);

                customer_cake_catalog.appendChild(Cake_pedistal);

                Cake_pedistal.addEventListener('click', function () {
                    console.log(`clicked pedistal ${cakeindex} corresponds to ${catalog[cakeindex].uuid}`)
                    catalog_maintainer.trigger_cake(catalog[cakeindex].uuid);
                })
            }

        })
    },
    trigger_cake: async function (uuid) {// show cake display and load information for cake
        console.log("page cake: ", uuid);
        catalog_maintainer.close_cake();//close any open cakes

        document.getElementById('cake_display').classList = "cake_display";
        document.getElementById('Cake_cattalog_container').classList = "Cake_cattalog_container_shoved";
        document.getElementById('Add_to_cart_button').classList = "add_to_cart_button"
        document.getElementById('Procede_to_cart_button').classList = "add_to_cart_button_hidden"
        properties.observingcake = uuid;
        post(uuid, 'get/cakebyuuid').then((cakefromuuid) => {//cakefromuuid= {title, description, image_uri, uuid}
            console.log('Got cake ', cakefromuuid)
            document.getElementById('cake_display_title').innerHTML = `${cakefromuuid.Title}`
            document.getElementById('cake_display_banner').style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${cakefromuuid.image_uri}')`;
            document.getElementById('cake_display_description').innerHTML = `${cakefromuuid.Description}`
            document.getElementById('cake_display_price').innerHTML = `\$${cakefromuuid.price.toFixed(2)}`;
        })
    },
    close_cake: function () {//Close the user cake display
        document.getElementById('cake_display').classList = "cake_display_hidden";
        document.getElementById('Cake_cattalog_container').classList = "Cake_cattalog_container";
        document.getElementById('Add_to_cart_button').classList = "add_to_cart_button"
        document.getElementById('Procede_to_cart_button').classList = "add_to_cart_button_hidden"
    },
    add_to_cart: async function () {
        if (config.data.credentials.user == null || properties.loggedin == false) {//if not logged in, demand login
            console.log('Login required to add to cart')
            session_manager.Demand_login()
            return false;
        }

        document.getElementById('Add_to_cart_button').classList = "add_to_cart_button_hidden"
        document.getElementById('Procede_to_cart_button').classList = "add_to_cart_button"

        const quantity = document.getElementById('cake_quantity_selector').value;
        console.log('add to cart: ', properties.observingcake, ' quantity: ', quantity, 'for user: ', config.data.credentials.user);

        const payload = { cakeid: properties.observingcake, quantity: quantity, username: config.data.credentials.user };

        post(payload, 'post/addtocart').then((response) => {
            console.log('add to cart response: ', response);
            if (response.status == "success") {
                console.log('added to cart');
                //ui_controller.go_to_cart();
            } else {
                console.error('failed to add to cart');
            }
        });
    },
    procede_to_cart: function () {
        console.log('procede to cart from: ', properties.observingcake);
        ui_controller.go_to_cart();
        this.close_cake();
    }
}

let cart_maintainer = {
    initalize: async function () {
        console.log('Cart startup');

        document.getElementById('checkout_button').addEventListener('click', function () {
            if (properties.counter.items == 0) {
                console.error('No items in cart, cannot proceed to checkout');
                alert('No items in cart, cannot proceed to checkout');
                ui_controller.got_to_catalog();
                return false;
            }
            ui_controller.go_to_checkout()
        });
    },
    load_cart: async function () {
        console.log('Loading cart');

        let counter = { items: 0, total: 0 };
        const catalog = await request('get/catalog');//load the catalog to get cake data
        console.log('Got Catalog: ', catalog);
        post(config.data.credentials.user, 'get/cart').then((response) => {
            console.log('Cart response: ', response);
            properties.cart = response;//save the cart to the properties object
            document.getElementById('cart_container_handle').innerHTML = "";

            if (response != "error") {
                console.log('loaded cart');
                for (let cake in response) {
                    //console.log('cake in cart: ', response[cake]);
                    //build cart display
                    build_cart(response[cake]);
                    counter.items += Number(response[cake].quantity);
                    counter.total += Number(response[cake].quantity) * Number(catalog.find(c => c.uuid == response[cake].cakeid).price);
                }
                console.log('Cart total: ', counter.total, ' items: ', counter.items);
                properties.counter = counter;
                //update the cart summary
                document.getElementById('Summary_details').innerHTML = `
                items: ${counter.items}
                <br>
                Price: \$${counter.total.toFixed(2)}
                <br><br>
                <p>A total of ${counter.items} items in your cart, with a total price of \$${counter.total.toFixed(2)}</p>
                <p>payment and divery information will be collected at checkout.</p>
                <p>Click the checkout button to proceed.</p>
                `;
                //ui_controller.go_to_cart();
            } else {
                console.error('failed to load cart');
            }
        });
        //

        async function build_cart(cake) {
            console.log('Build cart for: ', cake);
            const cake_data = catalog.find(c => c.uuid == cake.cakeid);//find the cake data in the catalog
            console.log('Cake data: ', cake_data);//{ Title,  Description, image_uri, uuid }

            const cart_item = document.createElement('div');
            cart_item.classList = "cart_item";
            cart_item.tagName = `Cake ${cake_data.uuid}`;
            cart_item.title = `${cake_data.Title}`;

            const cake_price = document.createElement('div');
            cake_price.classList = "cart_item_price"
            cake_price.innerHTML = `\$${cake_data.price.toFixed(2)}`;
            cart_item.appendChild(cake_price);

            const cake_img = document.createElement('div');
            cake_img.classList = "cart_item_img";
            cake_img.style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${cake_data.image_uri}')`;
            cart_item.appendChild(cake_img);

            const cake_title = document.createElement('div');
            cake_title.classList = "cart_item_title"
            cake_title.innerHTML = `${cake_data.Title}`;
            cart_item.appendChild(cake_title);

            const cake_description = document.createElement('div');
            cake_description.classList = "cart_item_description";
            cake_description.innerHTML = `${cake_data.Description}`;
            cart_item.appendChild(cake_description);

            const cake_quantity = document.createElement('input');
            cake_quantity.type = "number";
            cake_quantity.classList = "cart_item_quantity";
            cake_quantity.value = Number(cake.quantity);
            cart_item.appendChild(cake_quantity);

            document.getElementById('cart_container_handle').appendChild(cart_item);

            cake_quantity.addEventListener('click', function (event) {
                event.stopPropagation();//stop the click from triggering the cart item click event
            })

            cart_item.addEventListener('click', function () {
                console.log(`clicked cart item ${cake_data.uuid}`)
                catalog_maintainer.trigger_cake(cake_data.uuid);
                ui_controller.got_to_catalog();
            })

        }
    },
}

let checkout_maintainer = {
    initalize: async function () {
        console.log('Checkout startup');
        document.getElementById('add_new_payment_button').addEventListener('click', function () {
            ui_controller.show_Add_new_payment_method_pannel();
        });
        document.getElementById('add_new_address_button').addEventListener('click', function () {
            console.log('add new address button clicked');
            ui_controller.show_Add_delivery_address_pannel();
        });

        document.getElementById('submit_order_button').addEventListener('click', function () {
            console.log('submit order button clicked');
            if (properties.counter.items == 0) {
                console.error('No items in cart, cannot proceed to checkout');
                alert('No items in cart, cannot proceed to checkout');
                ui_controller.got_to_catalog();
                return false;
            }
            const payload = { username: config.data.credentials.user, Items: properties.cart, Status: "pending",total_price: properties.counter.total,Date: new Date().toISOString() };
            
            console.log('submit order payload: ', payload);
            post(payload, 'post/submitorder').then((response) => {
                console.log('submit order response: ', response);
                if (response.status == "success") {
                    console.log('order submitted');
                    //ui_controller.go_to_cart();
                    setTimeout(() => {
                        ui_controller.go_to_orders();//reload the checkout data to show the new payment method
                    }, 1000);
                } else {
                    console.error('failed to submit order');
                    alert('Failed to submit order, please try again later.');
                }
            });
        });

        document.getElementById('card_save_button').addEventListener('click', function () {
            console.log('Save card button clicked');

            const payload = { card: properties.paymentinfo, username: config.data.credentials.user };
            post(payload, 'post/addpaymentmethod').then((response) => {
                console.log('add payment method response: ', response);
                if (response.status == "success") {
                    console.log('added payment method');
                    ui_controller.hide_Add_new_payment_method_pannel();
                    //ui_controller.go_to_cart();
                    setTimeout(() => {
                        checkout_maintainer.load_checkout();//reload the checkout data to show the new payment method
                    }, 1000);
                } else {
                    console.error('failed to add payment method');
                    alert('Failed to add payment method, please try again later.');
                }
            });
        });

        document.getElementById('address_save_button').addEventListener('click', function () {
            console.log('Save address button clicked');
            properties.deliveryinfo = document.getElementById('address_name_put').value;
            const payload = { Delivery_address: properties.deliveryinfo, username: config.data.credentials.user };
            post(payload, 'post/adddeliveryaddress').then((response) => {
                console.log('add delivery address response: ', response);
                if (response.status == "success") {
                    console.log('added delivery address');
                    ui_controller.hide_Add_delivery_address_pannel();
                    document.getElementById('address_represent').innerText = `${properties.deliveryinfo}`;
                    document.getElementById('add_new_address_button').innerHTML = "Change delivery address"
                    setTimeout(() => {
                        checkout_maintainer.load_checkout();//reload the checkout data to show the new payment method
                    }, 1000);
                    //ui_controller.go_to_cart();
                } else {
                    console.error('failed to add delivery address');
                    alert('Failed to add delivery address, please try again later.');
                    ui_controller.hide_Add_delivery_address_pannel();
                }
            });
        });
        //update the card representation name
        document.getElementById('creditcard_name_put').addEventListener('change', function () { update_card_name(); });
        document.getElementById('creditcard_name_put').addEventListener('input', function () { update_card_name(); });
        async function update_card_name() {
            const name = document.getElementById('creditcard_name_put').value;
            console.log('credit card name: ', name);
            properties.paymentinfo.name = name;//save the name to the properties object
            checkout_maintainer.update_card_representation();
        }

        //update the card representation expiry date
        document.getElementById('expiry_date_put').addEventListener('change', function () { update_expiry_date(); });
        document.getElementById('expiry_date_put').addEventListener('input', function () { update_expiry_date(); });
        async function update_expiry_date() {
            const expire = document.getElementById('expiry_date_put').value;
            console.log('cc expiry: ', expire);
            properties.paymentinfo.expire = expire;//save the name to the properties object
            checkout_maintainer.update_card_representation();
        }

        //update the card representation expiry date
        document.getElementById('creditcard_number_put').addEventListener('change', function () { update_creditcard_number(); });
        document.getElementById('creditcard_number_put').addEventListener('input', function () { update_creditcard_number(); });
        async function update_creditcard_number() {
            const number = document.getElementById('creditcard_number_put').value;
            console.log('cc number: ', number);
            properties.paymentinfo.number = number;//save the name to the properties object
            checkout_maintainer.update_card_representation();
        }

        //update ccv
        document.getElementById('cvc_put').addEventListener('change', function () { update_cvc(); });
        document.getElementById('cvc_put').addEventListener('input', function () { update_cvc(); });
        async function update_cvc() {
            const cvc = document.getElementById('cvc_put').value;
            console.log('cc cvc: ', cvc);
            properties.paymentinfo.cvc = cvc;//save the name to the properties object
            checkout_maintainer.update_card_representation();
        }

    },
    load_checkout: async function () {
        console.log('Loading checkout');
        //load credit card info and delivery address if any
        post(config.data.credentials.user, 'get/checkoutdata').then((response) => {
            console.log('Checkout data: ', response);
            if (response != "error") {
                console.log('loaded checkout data');
                //build checkout display
                properties.paymentinfo = JSON.parse(response.paymentinfo);//load the payment info
                if(response.paymentinfo.length > 5){
                    //hide add new button
                    document.getElementById('add_new_payment_button').innerHTML = "change payment method"
                }
                properties.deliveryinfo = JSON.parse(response.deliveryinfo).address;//load the delivery info

                if(response.deliveryinfo.length > 5){
                    //hide add new button
                    document.getElementById('add_new_address_button').innerHTML = "Change delivery address"
                    document.getElementById('address_represent').innerText = `${properties.deliveryinfo}`;
                }

                if(response.deliveryinfo.length > 5 && response.paymentinfo.length > 5){
                    document.getElementById('checkout_summary_details').innerHTML = `
                    <p>Items will be deivered to :<br> ${properties.deliveryinfo}</p>
                    <p>Payment will be process with card ending in: ${properties.paymentinfo.number.slice(-4)}</p>
                    <p>Click the checkout button to proceed.</p>
                    `
                }
                this.update_card_representation();//update the card representation


            } else {
                console.error('failed to load checkout data');
            }
        });

    },
    update_card_representation: async function () {
        if (properties.paymentinfo.name != undefined) {
            document.getElementById('card_name_represent').innerText = `${properties.paymentinfo.name}`;
            document.getElementById('card_name_represent2').innerText = `${properties.paymentinfo.name}`;
        }
        if (properties.paymentinfo.number != undefined) {
            document.getElementById('card_number_represent').innerText = `${properties.paymentinfo.number}`;
            document.getElementById('card_number_represent2').innerText = `**** **** **** ${properties.paymentinfo.number.slice(-4)}`;
        }
        if (properties.paymentinfo.expire != undefined) {
            const year = properties.paymentinfo.expire.slice(0, 4);
            const month = properties.paymentinfo.expire.slice(5, 7);

            document.getElementById('card_expiry_represent').innerText = `${month}/${year.slice(2, 4)}`;
            document.getElementById('card_expiry_represent2').innerText = `${month}/${year.slice(2, 4)}`;
        }
    },
}
