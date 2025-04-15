
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

//UI controller
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

        //close the add new product panel
        document.getElementById('close_add_new_product_pannel_button').addEventListener('click', function () {
            console.log('Close add new product panel button clicked');
            ui_controller.hide_add_product();
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
    show_add_product: function () {//Show the add product panel in the catalog
        document.getElementById('add_new_product_pannel').classList = "editor_pannel_active";
        document.getElementById('inventory_catalog').classList = "staff_catalog_compressed";
    },
    hide_add_product: function () {//Hide the add product panel in the catalog
        document.getElementById('add_new_product_pannel').classList = "editor_pannel";
        document.getElementById('inventory_catalog').classList = "staff_catalog";
    },
}

let catalog_manager = {
    initalize: function () {//Initialize the catalog manager
        console.log('Catalog manager is being initialized');
        document.getElementById('upload_product_button').addEventListener('click', async function () {//Upload product button
            console.log('upload_product_button clicked');
            catalog_manager.addProduct();
        });


        //Image preview processing
        const cake_img_preview = document.getElementById
            ('cake_img_preview');
        const cake_img_input = document.getElementById('cake_img_input');
        cake_img_preview.style.backgroundImage = `url('img/add-svgrepo-com.svg')`;

        document.getElementById('select_image_new_button').addEventListener('click', async function () {//Select image button
            console.log('select_image_new_button clicked');
            cake_img_input.click();
        });

        document.getElementById('remove_image_new_button').addEventListener('click', function (event) {//Close the add product panel
            console.log('remove_image_new_button clicked');
            cake_img_input.value = "";
            cake_img_preview.style.backgroundImage = `url('img/add-svgrepo-com.svg')`;
            document.getElementById('remove_image_new_button').style.display = 'none';
        });

        cake_img_preview.addEventListener('click', function () {
            console.log('Image preview clicked');
            cake_img_input.click();//force click
        });

        cake_img_input.addEventListener('change', async function (event) {
            const file = event.target.files[0];
            console.log('Image input changed', file);
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    cake_img_preview.style.backgroundImage = `url('${e.target.result}')`;
                    cake_img_preview.style.display = 'block';
                    document.getElementById('remove_image_new_button').style.display = 'block';
                    console.log('Image preview loaded');
                }
                reader.readAsDataURL(file);//read the file so it can be displayed onload
            } else {
                //cake_img_preview.style.display = 'none';
                //reset the image preview
                cake_img_preview.style.backgroundImage = `url('img/add-svgrepo-com.svg')`;
                cake_img_preview.style.display = 'block';
            }
        });

        document.getElementById('cancel_new_cake_button').addEventListener('click', function () {//Cancel button    
            console.log('cancel_new_cake_button clicked');
            ui_controller.hide_add_product();
            //reset form
            catalog_manager.reset_product_form();
        })

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
                if (catalog[cakeindex].image_uri != '') {
                    cake_img.style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${catalog[cakeindex].image_uri}')`;
                }
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
                    ui_controller.show_add_product();
                    catalog_manager.editProduct(catalog[cakeindex].uuid);
                })
            }

        })
    },
    reset_product_form: function () {//Reset the product form
        console.log('Resetting product form');
        document.getElementById('cake_name_input').value = "";
        document.getElementById('cake_description_input').value = "";
        document.getElementById('cake_price_input').value = "";
        document.getElementById('cake_img_input').value = "";
        cake_img_preview.style.backgroundImage = `url('img/add-svgrepo-com.svg')`;
        cake_img_preview.style.display = 'block';
        document.getElementById('remove_image_new_button').style.display = 'none';
    },
    addProduct: async function () {//Add a product to the catalog
        console.log('Adding product');
        /*
            Create dynamic loading animation here later
        */

        document.getElementById('upload_product_button').disabled = true;//Disable the button
        //Get the values from the input fields

        const title = document.getElementById('cake_name_input').value;
        const description = document.getElementById('cake_description_input').value;
        const price = document.getElementById('cake_price_input').value;
        const image = document.getElementById('cake_img_input').files[0];

        //Check if the values are empty
        const product_input_error_message = document.getElementById('product_input_error_message');
        if (title == '') {
            product_input_error_message.classList = "sign_up_error_message";
            product_input_error_message.innerHTML = "A name is required!";
            document.getElementById('upload_product_button').disabled = false;//Enable the button

            return false;

        } else if (description == '') {
            product_input_error_message.classList = "sign_up_error_message";
            product_input_error_message.innerHTML = "Description is empty";
            document.getElementById('upload_product_button').disabled = false;//Enable the button

            return false;

        } else if (price == '') {
            product_input_error_message.classList = "sign_up_error_message";
            document.getElementById('upload_product_button').disabled = false;//Enable the button
            product_input_error_message.innerHTML = "No price selected";
            return false;

        } else if (image == undefined || image == null || image == '') {
            product_input_error_message.classList = "sign_up_error_message";
            document.getElementById('upload_product_button').disabled = false;//Enable the button
            product_input_error_message.innerHTML = "No Image selected";
            //return false;
            //allow empty image for now
        }

        //build the form data
        const formData = new FormData();
        formData.append('image_file', image);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        console.log('Form data: ', formData);

        const response = await fetch('post/uploadcakedata', {
            method: 'POST',
            body: formData,
        });

        const response_data = await response.json();
        console.log('Response data: ', response_data);

        if (response_data.status == 'success') {
            console.log('Product added');
            alert('Product added');
            ui_controller.hide_add_product();
            catalog_manager.build();
            document.getElementById('upload_product_button').disabled = false;
        } else {
            console.log('Product not added');
            alert('Error, was not added, image file may be too large to upload');
            document.getElementById('upload_product_button').disabled = false;
        }

    },
    editProduct: async function (uuid) {//Edit a product in the catalog
        console.log('Editing product', uuid);
        //load up product to be edited
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