
//const running_subpath = window.location.pathname;// Used to redirect requests if a subpath is used with nginx
const running_subpath = '';// Used to redirect requests if a subpath is used with nginx

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
        order_maintainer.initalize();
        search_handler.initalize();
        console.log('Page startup complete');
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
    loyalty_points: 0,
    counter: { items: 0, total: 0 },
}

/* Logins and sign up */
let session_manager = {
    initalize: async function () {
        console.log('Session manager startup');
        session_manager.attempt_login();
        document.getElementById('Login_button').addEventListener('click', function () { session_manager.login() });
        document.getElementById('Logout_button').addEventListener('click', function () { session_manager.logout() });
        document.getElementById('Logout_button_quick').addEventListener('click', function () { session_manager.logout() });

        document.getElementById('submit_sign_up_button').addEventListener('click', function () { session_manager.submit_sign_up() });

        document.getElementById('sign_up_username_put').addEventListener('change', function () { session_manager.comparate_password() });
        document.getElementById('sign_up_username_put').addEventListener('input', function () { session_manager.comparate_password() });
        document.getElementById('sign_up_password_put').addEventListener('change', function () { session_manager.comparate_password() });
        document.getElementById('sign_up_password_put2').addEventListener('change', function () { session_manager.comparate_password() });
        document.getElementById('sign_up_password_put').addEventListener('input', function () { session_manager.comparate_password() });
        document.getElementById('sign_up_password_put2').addEventListener('input', function () { session_manager.comparate_password() });


    },
    attempt_login: function () {// USed to get credentials on load
        console.log('attempt login');
        try {
            if (config.data.credentials.user != null && config.data.credentials.user != "") {//if never logged in
                post(config.data.credentials, 'post/login').then((response) => {
                    console.log('login state: ', response.status);
                    if (response.status == "sucess") {
                        properties.loggedin = true;
                        console.log('logged in');
                        document.getElementById('Logout_button').classList = "account_dropdown_item";
                        document.getElementById('login_trigger_button').classList = "account_dropdown_item_hidden";
                        document.getElementById('Login_error_message').classList = "Login_error_message_hidden";
                        document.getElementById('cart_title').innerHTML = `${config.data.credentials.user}'s cart`;
                        document.getElementById('quick_account_username').innerText = `${config.data.credentials.user}`;
                        ui_controller.hide_account_callout();
                        ui_controller.hide_login_dialog();

                    }
                    else {
                        //session_manager.logout();//logout if not logged in to clear keys, jingle jingle
                        console.log('login failed/not logged in');
                        //alert('Login failed, please try again.');
                        //document.getElementById('Login_error_message').classList = "Login_error_message";
                    }
                });
            }
        } catch (error) {
            console.error('Error during login attempt: ', error);
            //session_manager.logout();
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
        location.reload();//reload the page to clear the session
    },
    // Login Triggered by the users action
    login: function () {
        console.log('login');
        const username_put = document.getElementById('Login_usernmae_put').value || "";
        const password_put = document.getElementById('Login_password_put').value || "";
        if (username_put == "" || password_put == "") {
            console.log('Login failed, empty fields');
            document.getElementById('Login_error_message').classList = "Login_error_message";
            document.getElementById('Login_error_message').innerHTML = "Please fill in all fields";
            return false;
        }

        config.data.credentials = { user: username_put, pass: password_put };
        config.save();
        session_manager.attempt_login();
        setTimeout(() => {
            if (properties.loggedin == true) {
                location.reload();
            }
        }, 1000);//wait for the login to finish before reloading the page
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
    comparate_password: function (username, password, password2) {
        console.log('comparate password');
        if (username == undefined) {
            username = document.getElementById('sign_up_username_put').value || "";
        }
        if (password == undefined) {
            password = document.getElementById('sign_up_password_put').value || "";
        }
        if (password2 == undefined) {
            password2 = document.getElementById('sign_up_password_put2').value || "";
        }
        if (username.length < 3) {
            console.log('username too short');
            document.getElementById('sign_up_error_message').classList = "sign_up_error_message";
            document.getElementById('sign_up_error_message').innerHTML = "Username too short, must be at least 3 characters";
            return false;
        } else if (username.length > 20) {
            console.log('username too long');
            document.getElementById('sign_up_error_message').classList = "sign_up_error_message";
            document.getElementById('sign_up_error_message').innerHTML = "Username too long, must be at most 20 characters";
            return false;
        } else if (password.length < 4) {
            console.log('password too short');
            document.getElementById('sign_up_error_message').classList = "sign_up_error_message";
            document.getElementById('sign_up_error_message').innerHTML = "Password too short, must be at least 4 characters";
            return false;
        } else if (password.length > 20) {
            console.log('password too long');
            document.getElementById('sign_up_error_message').classList = "sign_up_error_message";
            document.getElementById('sign_up_error_message').innerHTML = "Password too long, must be at most 20 characters";
            return false;
        }

        if (password != password2) {
            console.log('passwords do not match');
            document.getElementById('sign_up_error_message').classList = "sign_up_error_message";
            document.getElementById('sign_up_error_message').innerHTML = "Passwords do not match";
            return false;
        }

        document.getElementById('sign_up_error_message').classList = "sign_up_error_message_hidden";
        document.getElementById('sign_up_error_message').innerHTML = "";
        return true;
    },
    submit_sign_up: function () {
        console.log('submit sign up');

        const username_put = document.getElementById('sign_up_username_put').value || "";
        const password_put = document.getElementById('sign_up_password_put').value || "";
        const password_put2 = document.getElementById('sign_up_password_put2').value || "";

        const validity = session_manager.comparate_password(username_put, password_put, password_put2) || false;
        const payload = { user: username_put, pass: password_put };

        if (validity == true) {
            post(payload, 'post/signup').then((response) => {
                console.log('sign up response: ', response);
                if (response.status == "success") {
                    console.log('sign up success');
                    alert('Sign up success, please log in to continue.');
                    location.reload();//reload the page to clear the session
                    //ui_controller.got_to_catalog();
                } if (response.status == "exists") {
                    console.error('sign up failed, user exists');
                    document.getElementById('sign_up_error_message').classList = "sign_up_error_message";
                    document.getElementById('sign_up_error_message').innerHTML = "Passwords do not match";
                } else {
                    console.error('failed to sign up');
                }
            });
        }
    },
}

let ui_controller = {
    initalize: async function () {
        console.log('Navigation overider startup');
        this.got_to_catalog();

        document.getElementById('sign_up_button').addEventListener('click', function () { ui_controller.go_to_sign_up() });

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
        document.getElementById('account_button').addEventListener('click', function () { ui_controller.show_quick_account_info() });
        document.getElementById('quick_account_info_close_btn').addEventListener('click', function () { ui_controller.hide_quick_account_info() });

    },
    go_to_sign_up: function () {
        console.log('Navigate to sign up');
        document.getElementById('cake_catalog_page').classList = "main_view"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view"
        document.getElementById('checkout_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view"
        document.getElementById('sign_up_page').classList = "main_view_active"
        this.hide_account_callout();
        this.hide_quick_account_info();
        this.hide_login_dialog();
    },
    got_to_catalog: function () {
        console.log('Navigate to catalog');
        document.getElementById('cake_catalog_page').classList = "main_view_active"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view"
        document.getElementById('checkout_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view"
        document.getElementById('sign_up_page').classList = "main_view"
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
        document.getElementById('sign_up_page').classList = "main_view"
        this.hide_account_callout();
        cart_maintainer.load_cart();
    },
    go_to_orders: function () {
        console.log('Navigate to order');
        if (config.data.credentials.user == null || properties.loggedin == false) {//if not logged in, demand login
            console.log('Login required to view orders')
            session_manager.Demand_login()
            return false;
        }
        document.getElementById('cake_catalog_page').classList = "main_view"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view_active"
        document.getElementById('checkout_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view"
        document.getElementById('sign_up_page').classList = "main_view"
        this.hide_account_callout()
        this.hide_quick_account_info()
    },
    go_to_checkout: function () {
        if (config.data.credentials.user == null || properties.loggedin == false) {//if not logged in, demand login
            console.log('Login required to view checkout')
            session_manager.Demand_login()
            return false;
        }
        console.log('Navigate to checkout');
        document.getElementById('cake_catalog_page').classList = "main_view"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view"
        document.getElementById('checkout_page').classList = "main_view_active"
        document.getElementById('sign_up_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view"
        this.hide_account_callout()
        this.hide_quick_account_info()
        checkout_maintainer.load_checkout();
    },
    go_to_account: function () {
        if (config.data.credentials.user == null || properties.loggedin == false) {//if not logged in, demand login
            console.log('Login required to view account')
            session_manager.Demand_login()
            return false;
        }
        console.log('Navigate to account');
        document.getElementById('cake_catalog_page').classList = "main_view"
        document.getElementById('cart_page').classList = "main_view"
        document.getElementById('orders_page').classList = "main_view"
        document.getElementById('checkout_page').classList = "main_view"
        document.getElementById('account_page').classList = "main_view_active"
        document.getElementById('sign_up_page').classList = "main_view"
        this.hide_account_callout()
        this.hide_quick_account_info()
    },
    show_account_callout: function () {
        console.log('show account callout');
        if (document.getElementById('account_dropdown').classList != 'account_dropdown') {
            document.getElementById('account_dropdown').classList = 'account_dropdown'
            this.hide_quick_account_info()
        } else {
            this.hide_account_callout()
            this.hide_quick_account_info()
        }
    },
    show_quick_account_info: function () {
        if (properties.loggedin == false) {//if not logged in, demand login
            console.log('Login required to view account')
            session_manager.Demand_login()
            return false;
        }
        document.getElementById('quick_account_info').classList = 'quick_account_info'
        this.hide_account_callout()
    },
    hide_quick_account_info: function () {
        document.getElementById('quick_account_info').classList = 'quick_account_info_hidden'
    },
    hide_account_callout: function () {
        console.log('hide account callout');
        document.getElementById('account_dropdown').classList = 'account_dropdown_hidden';
    },
    show_login_dialog: function () {
        console.log('show login dialog');
        this.hide_account_callout()
        this.hide_quick_account_info()
        document.getElementById('Login_dialog').classList = "Login_dialog"
    },
    hide_login_dialog: function () {
        console.log('hide login dialog');
        this.hide_account_callout()
        this.hide_quick_account_info()
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
                if (catalog[cakeindex].image_uri != '') {
                    cake_img.style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${catalog[cakeindex].image_uri}')`;
                }
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
            if (cakefromuuid.image_uri != '') {
                document.getElementById('cake_display_banner').style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${cakefromuuid.image_uri}')`;
            }
            document.getElementById('cake_display_description').innerHTML = `${cakefromuuid.Description}`
            document.getElementById('cake_display_price').innerHTML = `Price: \$${cakefromuuid.price.toFixed(2)} JMD`;
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
        setTimeout(() => {
            if (properties.loggedin == true) {
                this.load_cart();//load the cart on startup
            }
        }, 500);
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
            if (cake_data.image_uri != '') {
                cake_img.style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${cake_data.image_uri}')`;
            }

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
        document.getElementById('add_new_payment_button').addEventListener('click', function () { ui_controller.show_Add_new_payment_method_pannel() });

        document.getElementById('add_new_address_button').addEventListener('click', function () {
            if (config.data.credentials.user == null || properties.loggedin == false) {//if not logged in, demand login
                console.log('Login required to add new address')
                session_manager.Demand_login()
                return false;
            }
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
            const payload = { username: config.data.credentials.user, Items: properties.cart, Status: "pending", total_price: properties.counter.total, Date: new Date().toISOString() };

            console.log('submit order payload: ', payload);
            post(payload, 'post/submitorder').then((response) => {
                console.log('submit order response: ', response);
                if (response.status == "success") {
                    console.log('order submitted');
                    //ui_controller.go_to_cart();
                    setTimeout(() => {
                        ui_controller.go_to_orders();//reload the checkout data to show the new payment method
                        order_maintainer.load_orders();//reload the orders page to show the new order
                        properties.cart = [];//clear the cart
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
                    }, 700);
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
        setTimeout(() => {
            if (properties.loggedin == true) {
                this.load_checkout();//load the checkout data on startup
            }
        }, 750);

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
                if (response.paymentinfo.length > 5) {
                    //hide add new button
                    document.getElementById('add_new_payment_button').innerHTML = "change payment method"
                }
                properties.deliveryinfo = JSON.parse(response.deliveryinfo).address;//load the delivery info

                if (response.deliveryinfo.length > 5) {
                    //hide add new button
                    document.getElementById('add_new_address_button').innerHTML = "Change delivery address"
                    document.getElementById('address_represent').innerText = `${properties.deliveryinfo}`;
                }

                if (response.deliveryinfo.length > 5 && response.paymentinfo.length > 5) {
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

        // To do: update the card representation with the new data
        // validate the card data and show errors if any
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

let order_maintainer = {
    initalize: async function () {
        console.log('Order startup');
        document.getElementById('Orders_button').addEventListener('click', function () {
            //demand login if not logged in
            if (config.data.credentials.user == null || properties.loggedin == false) {//if not logged in, demand login
                console.log('Login required to view orders')
                session_manager.Demand_login()
                return false;
            }
            //load the orders page
            ui_controller.go_to_orders();
            order_maintainer.load_orders();
        });
        setTimeout(() => {
            if (properties.loggedin == true) {
                this.load_orders();//load the orders on startup
            }
        }, 1000);
    },
    get_loyalty_points: async function () {
        console.log('Get loyalty points');
        if (properties.loggedin == false) {//if not logged in, ignore
            return false;
        }

        post(config.data.credentials.user, 'get/loyaltypoints').then((response) => {
            console.log('Loyalty points response: ', response);//expects {points: 3}
            if (response != "error") {
                console.log('loaded loyalty points');
                properties.loyalty_points = response.loyaltypoints;
                document.getElementById('quick_account_loyalty_points').innerText = `${response.loyaltypoints}`;
            } else {
                console.error('failed to load loyalty points');
            }
        });
    },
    load_orders: async function () {
        console.log('Loading orders');
        document.getElementById('orders title').innerHTML = `${config.data.credentials.user}'s previous orders`;

        const catalog = await request('get/catalog');//load the catalog to get cake data

        post(config.data.credentials.user, 'get/orders').then((response) => {
            console.log('Orders response: ', response);//expects [{ordernumber: 3, Items: '[{cakeid,quantity}]', Date, Status, total_price}]
            document.getElementById('quick_account_order').innerText = `${response.length}`;

            if (response != "error") {
                console.log('loaded orders');
                //build orders display
                document.getElementById('orders_container_handle').innerHTML = "";
                for (let order in response) {
                    build_order(response[order]);
                }
            } else {
                console.error('failed to load orders');
            }
        });
        this.get_loyalty_points();//get the loyalty points for the user
        async function build_order(order) {
            console.log('Build order for: ', order);

            const order_container = document.createElement('div');
            order_container.classList = "order_container";
            order_container.tagName = `Order #: ${order.ordernumber}`;
            order_container.title = `Order #: ${order.ordernumber}`;

            const sumation = document.createElement('div');
            sumation.classList = "sumation"
            const translate_date = new Date(order.Date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            sumation.innerHTML = `Order #: ${order.ordernumber} <br> Date: ${translate_date} <br> Status: ${order.Status} <br> Total Price: \$${order.total_price.toFixed(2)}`;
            order_container.appendChild(sumation);

            const order_items_constainer = document.createElement('div');
            order_items_constainer.classList = "order_items_constainer"
            order_container.appendChild(order_items_constainer);

            const items = JSON.parse(order.Items);//parse the items from the order
            console.log('Items: ', items);//[{cakeid,quantity}]

            for (let item in items) {
                build_order_item(items[item], order_items_constainer);//build the order item display
            }

            document.getElementById('orders_container_handle').appendChild(order_container);


            async function build_order_item(cake, order_items_constainer_passed) {
                console.log('Build item: ', cake, 'for order: ', order.ordernumber);

                const cake_data = catalog.find(c => c.uuid == cake.cakeid);//find the cake data in the catalog
                console.log('Cake data: ', cake_data);//{ Title,  Description, image_uri, uuid }

                const order_item = document.createElement('div');
                order_item.classList = "order_item";
                order_item.tagName = `Cake ${cake_data.uuid}`;
                order_item.title = `${cake_data.Title}`;

                const cake_img = document.createElement('div');
                cake_img.classList = "order_item_img";
                if (cake_data.image_uri != '') {
                    cake_img.style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${cake_data.image_uri}')`;
                }
                order_item.appendChild(cake_img);

                const cake_title = document.createElement('div');
                cake_title.classList = "order_item_title"
                cake_title.innerHTML = `${cake_data.Title}`;
                order_item.appendChild(cake_title);

                const cake_quantity = document.createElement('div');
                cake_quantity.classList = "order_item_quantity";
                cake_quantity.innerHTML = `quantity: ${Number(cake.quantity)}`;
                order_item.appendChild(cake_quantity);

                order_items_constainer_passed.appendChild(order_item);

            }

        }
    }
}

let search_handler = {
    initalize: function () {
        console.log('Search startup');
        document.getElementById('search_button').addEventListener('input', function () {
            console.log('search button clicked');

        });
    }
}