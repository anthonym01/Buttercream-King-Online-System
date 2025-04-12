
//const running_subpath = window.location.origin;// Used to redirect 
const running_subpath = '';// Used to redirect 

// requests if a subpath is used with nginx

window.addEventListener('load', async function () {//Starting point
    try {
        await config.load();//Load config from local storage
    } catch (err) {
        console.warn('Something bad happened: ', err);
    } finally {
        //page startup
        console.log('Page startup complete');
        session_manager.initalize();
        staff_manager.initalize();
        catalog_manager.initalize();
        ui_controller.initalize();
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

let properties = {
    logedin: false,//User logged in
    privilage_level: 0,//User privilage_level level
}

/*
The `config` is used to manage local application data by saving,loading, and deleting configuration settings via local storage.
*/
let config = {
    data: {//Loacal app data
        credentials: { user: "", pass: "", token: "" },//User credentials
    },
    save: async function () {//Save config via local storage
        console.table('Configuration is being saved', config.data);
        localStorage.setItem("butterK_staff_cfg", JSON.stringify(config.data));
    },
    load: function () {//Load config from local storage
        console.log('Configuration is being loaded');
        if (localStorage.getItem("butterK_staff_cfg") == null) {//if no config is found, create a new one
            console.log('No config found, creating new one');
            localStorage.setItem("butterK_staff_cfg", JSON.stringify(config.data));
        }
        config.data = JSON.parse(localStorage.getItem("butterK_staff_cfg"));
        console.log('config Loaded: ', config.data);
    },
    delete: function () {//wipe the config
        localStorage.clear("butterK_staff_cfg");//yeet the storage key
        console.log('config deleted: ');
        console.table(config.data);
        config.data = {};
        config.save();
    },
}

let ui_controller = {
    initalize: function () {//Initialize the UI
        console.log('UI controller is being initialized');

        document.getElementById('Catalog_fullview_menu_item').addEventListener('click', async function () {//Catalog button
            console.log('Catalog button clicked');
            ui_controller.go_to_catalog();
        });
        document.getElementById('Catalog_menu_item').addEventListener('click', async function () {//Catalog button
            console.log('Catalog button clicked');
            ui_controller.go_to_catalog();
        });

        document.getElementById('Staff_fullview_menu_item').addEventListener('click', async function () {//Staff button
            console.log('Staff button clicked');
            ui_controller.go_to_staff();
        });
        document.getElementById('Staff_menu_item').addEventListener('click', async function () {//Staff button
            console.log('Staff button clicked');
            ui_controller.go_to_staff();
        });

        document.getElementById('Orders_fullview_menu_item').addEventListener('click', async function () {//Orders button
            console.log('Orders button clicked');
            ui_controller.go_to_orders();
        });
        document.getElementById('Orders_menu_item').addEventListener('click', async function () {//Orders button
            console.log('Orders button clicked');
            ui_controller.go_to_orders();
        });

        document.getElementById('Customers_fullview_menu_item').addEventListener('click', async function () {//Customers button
            console.log('Customers button clicked');
            ui_controller.go_to_customers();
        });
        document.getElementById('Customers_menu_item').addEventListener('click', async function () {//Customers button
            console.log('Customers button clicked');
            ui_controller.go_to_customers();
        });

        document.getElementById('nav_menu_target').addEventListener('click', function () {//Main menu button
            console.log('Main menu button clicked');
            if (document.getElementById('staff_dropdown_menu').classList == "staff_dropdown_menu") {
                ui_controller.close_staff_dropdown_menu();
            } else {
                ui_controller.open_staff_dropdown_menu();
            }
        });
    },
    close_staff_dropdown_menu: function () {//Close the dropdown menu 
        console.log('Closing dropdown menu');
        document.getElementById('staff_dropdown_menu').classList = "staff_dropdown_menu_hidden";
    },
    open_staff_dropdown_menu: function () {//Open the dropdown menu
        console.log('Opening dropdown menu');
        document.getElementById('staff_dropdown_menu').classList = "staff_dropdown_menu";
    },
    go_to_main_menu: function () {//Go to the main menu
        console.log('Going to main menu');
        this.close_staff_dropdown_menu();
        document.getElementById('nav_menu_target').classList = "menu_target";
        document.getElementById('staff_main_page').classList = "main_view_active";
        document.getElementById('staff_login_page').classList = "main_view";
        document.getElementById('manage_catalog_page').classList = "main_view";
        document.getElementById('manage_staff_page').classList = "main_view";
        document.getElementById('manage_orders_page').classList = "main_view";
        document.getElementById('manage_Customers_page').classList = "main_view";
    },
    go_to_catalog: function () {
        //Go to the catalog page
        console.log('Going to catalog');
        this.close_staff_dropdown_menu();
        document.getElementById('staff_main_page').classList = "main_view";
        document.getElementById('staff_login_page').classList = "main_view";
        document.getElementById('manage_catalog_page').classList = "main_view_active";
        document.getElementById('manage_staff_page').classList = "main_view";
        document.getElementById('manage_orders_page').classList = "main_view";
        document.getElementById('manage_Customers_page').classList = "main_view";
    },
    go_to_staff: function () {
        //Go to the staff page
        console.log('Going to staff');
        this.close_staff_dropdown_menu();
        document.getElementById('staff_main_page').classList = "main_view";
        document.getElementById('staff_login_page').classList = "main_view";
        document.getElementById('manage_catalog_page').classList = "main_view";
        document.getElementById('manage_staff_page').classList = "main_view_active";
        document.getElementById('manage_orders_page').classList = "main_view";
        document.getElementById('manage_Customers_page').classList = "main_view";
    },
    go_to_orders: function () {
        //Go to the orders page
        console.log('Going to orders');
        this.close_staff_dropdown_menu();
        document.getElementById('staff_main_page').classList = "main_view";
        document.getElementById('staff_login_page').classList = "main_view";
        document.getElementById('manage_catalog_page').classList = "main_view";
        document.getElementById('manage_staff_page').classList = "main_view";
        document.getElementById('manage_orders_page').classList = "main_view_active";
        document.getElementById('manage_Customers_page').classList = "main_view";
    },
    go_to_customers: function () {
        //Go to the customers page
        console.log('Going to customers');
        this.close_staff_dropdown_menu();
        document.getElementById('staff_main_page').classList = "main_view";
        document.getElementById('staff_login_page').classList = "main_view";
        document.getElementById('manage_catalog_page').classList = "main_view";
        document.getElementById('manage_staff_page').classList = "main_view";
        document.getElementById('manage_orders_page').classList = "main_view";
        document.getElementById('manage_Customers_page').classList = "main_view_active";
    },
    show_add_product: function () {
        document.getElementById('add_new_product_pannel').classList = "editor_pannel_active";
        document.getElementById('inventory_catalog').classList = "staff_catalog_compressed";
    }
}

let session_manager = {
    initalize: function () {//Initialize the session manager
        console.log('Session manager is being initialized');
        document.getElementById('submit_log_in_button').addEventListener('click', async function () {//Login button
            console.log('Login button clicked');
            session_manager.login();
        });

        document.getElementById('Logout_fullview_menu_item').addEventListener('click', async function () {//Logout button
            console.log('Logout button clicked');
            session_manager.logout();
        });
        document.getElementById('Logout_menu_item').addEventListener('click', async function () {//Logout button
            console.log('Logout button clicked');
            session_manager.logout();
        });

        this.attemptLogin();//check login status
    },
    attemptLogin: async function () {//Login to the server
        console.log('Attempting to login');
        let data = await post(config.data.credentials, 'get/stafflogin/');

        console.log('Login data: ', data);

        if (data == false || data == undefined) {
            console.log('Login failed');
            alert('Login failed');
            return false;
        }

        if (data.status == 'sucess') {
            console.log('Login sucess, logged in as', config.data.credentials.user);
            document.getElementById('staffidentifier').innerText = "Logged in as: " + config.data.credentials.user;
            properties.logedin = true;
            properties.privilage_level = data.privilage_level;
            ui_controller.go_to_main_menu();
            return true;
        } else {
            console.log('Login failed');
            config.data.credentials = { user: "", pass: "", token: "" };
            document.getElementById('log_in_error_message').classList = "sign_up_error_message";
            document.getElementById('log_in_error_message').innerHTML = "Username or password is incorrect";
            config.save();
            return false;
        }
    },
    login: async function () {
        console.log('login');
        const user = document.getElementById('log_in_username_put').value;
        const pass = document.getElementById('log_in_password_put').value;

        if (user == '' || pass == '') {
            alert('Please fill in all fields');
            document.getElementById('log_in_error_message').classList = "sign_up_error_message";
            document.getElementById('log_in_error_message').innerHTML = "";
            return false;
        }
        document.getElementById('log_in_error_message').classList = "sign_up_error_message_hidden";
        document.getElementById('log_in_error_message').innerHTML = "";
        config.data.credentials = { user: user, pass: pass, token: "" };//Set the credentials
        config.save();
        this.attemptLogin();
    },
    logout: function () {//Logout from the server
        console.log('Logging out');
        properties.logedin = false;
        properties.privilage_level = 0;
        config.data.credentials = { user: "", pass: "", token: "" };
        config.save();
        alert('Logged out');
        location.reload();
    },
}

let catalog_manager = {
    initalize: function () {//Initialize the catalog manager
        console.log('Catalog manager is being initialized');
        this.build();
    },
    build: async function () {
        console.log("Build catalog");
        const inventory_catalog = document.getElementById('inventory_catalog');
        inventory_catalog.innerHTML = "";//Clear the catalog

        //Add new product button
        const add_product_button = document.createElement('div');
        add_product_button.classList = "Cake_pedistal_short";
        add_product_button.tagName = `Cake add new`;
        add_product_button.title = `Add New Cake`;

        const cake_img = document.createElement('div');
        cake_img.classList = "cake_img";
        cake_img.style.backgroundImage = `url('img/add-svgrepo-com.svg')`;
        add_product_button.appendChild(cake_img);

        const cake_title = document.createElement('div');
        cake_title.classList = "cake_pedistal_title"
        cake_title.innerHTML = `Add New Cake`;
        add_product_button.appendChild(cake_title);

        inventory_catalog.appendChild(add_product_button);

        add_product_button.addEventListener('click', function () {
            ui_controller.show_add_product();
        });

        //Load the catalog from the server
        request('get/catalog').then((catalog) => {
            console.log('Got Catalog: ', catalog);//payload = { Title,  Description, image_uri, uuid }

            for (let cakeindex in catalog) {// construction zone
                const Cake_pedistal = document.createElement('div');
                Cake_pedistal.classList = "Cake_pedistal";
                Cake_pedistal.tagName = `Cake ${cakeindex}`;
                Cake_pedistal.title = `${catalog[cakeindex].Title}`;

                const cake_price = document.createElement('div');
                cake_price.classList = "cake_pedistal_price"
                cake_price.innerHTML = `\$${catalog[cakeindex].price.toFixed(2)}`;
                Cake_pedistal.appendChild(cake_price);

                const cake_img = document.createElement('div')
                cake_img.classList = "cake_img";
                cake_img.style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${catalog[cakeindex].image_uri}')`;
                Cake_pedistal.appendChild(cake_img);

                const cake_title = document.createElement('div');
                cake_title.classList = "cake_pedistal_title"
                cake_title.innerHTML = `${catalog[cakeindex].Title}`;
                Cake_pedistal.appendChild(cake_title);

                const cake_description = document.createElement('div');
                cake_description.classList = "cake_pedistal_description"
                cake_description.innerHTML = `${catalog[cakeindex].Description}`;
                Cake_pedistal.appendChild(cake_description);

                inventory_catalog.appendChild(Cake_pedistal);

                Cake_pedistal.addEventListener('click', function () {
                    console.log('clicked pedistal for cake', catalog[cakeindex].uuid);
                })
            }

        })
    },
    addProduct: async function () {//Add a product to the catalog
        console.log('Adding product');

    },
    editProduct: async function (uuid) {//Edit a product in the catalog
        console.log('Editing product', uuid);

    }
}

let staff_manager = {
    initalize: function () {//Initialize the staff manager
        console.log('Staff manager is being initialized');
        this.loadStaff();
    },
    loadStaff: async function () {//Load the staff from the server
        console.log('Loading staff');
        let data = await request('get/staff/');
        if (data == false || data == undefined) {
            console.log('Failed to load staff');
            return false;
        }
        console.log('gots Staff', data);
    },
}