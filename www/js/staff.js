
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
        customer_manager.initalize();
        order_manager.initalize();
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
    editingProduct: false,//User editing a product
    editingStaff: false,//User editing a staff member
    editingCustomer: false,//User editing a customer
    editingOrder: false,//User editing an order
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

        //close edit product panel
        document.getElementById('close_edit_product_pannel_button').addEventListener('click', function () {
            console.log('Close edit product panel button clicked');
            ui_controller.hide_edit_product();
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
        catalog_manager.build();//rebuild the catalog
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
        staff_manager.loadStaff();//rebuild the staff
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
        order_manager.loadOrders();//rebuild the orders
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
        customer_manager.loadCustomers();//rebuild the customers
    },
    show_add_product: function () {//Show the add product panel in the catalog
        ui_controller.hide_edit_product();
        console.log('Showing add product panel');
        document.getElementById('add_new_product_pannel').classList = "editor_pannel_active";
        document.getElementById('inventory_catalog').classList = "staff_catalog_compressed";
        //reset form
        catalog_manager.reset_product_form();
    },
    hide_edit_product: function () {//Hide the edit product panel in the catalog
        document.getElementById('edit_product_pannel').classList = "editor_pannel";
        document.getElementById('inventory_catalog').classList = "staff_catalog";
    },
    show_edit_product: function () {//Show the edit product panel in the catalog
        ui_controller.hide_add_product();
        document.getElementById('edit_product_pannel').classList = "editor_pannel_active";
        document.getElementById('inventory_catalog').classList = "staff_catalog_compressed";
        //reset form
        //catalog_manager.reset_edit_product_form();
    },
    hide_add_product: function () {//Hide the add product panel in the catalog
        document.getElementById('add_new_product_pannel').classList = "editor_pannel";
        document.getElementById('inventory_catalog').classList = "staff_catalog";
    },
}

let catalog_manager = {
    initalize: function () {//Initialize the catalog manager
        console.log('Catalog manager is being initialized');

        //Upload product button
        document.getElementById('upload_product_button').addEventListener('click', async function () {
            console.log('upload_product_button clicked');
            catalog_manager.addProduct();
        });

        //Edit product button
        document.getElementById('upload_edit_product_button').addEventListener('click', async function () {
            console.log('upload_edit_product_button clicked');
            catalog_manager.submit_edits();
        });

        /*
            Add items to catalog handler
        */
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
                    //check file size
                    if (file.size > 1000000) {//1MB
                        console.log('selected file way too large');
                        document.getElementById('product_input_error_message').classList = "sign_up_error_message";
                        document.getElementById('product_input_error_message').innerHTML = "Image is too large, please select an image smaller than 1MB, current files size is " + (file.size / 1000000).toFixed(2) + "MB";
                    } else {
                        document.getElementById('product_input_error_message').classList = "sign_up_error_message_hidden";
                    }
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


        /*
            Edit product image preview processing
        */
        const cake_img_editor_preview = document.getElementById
            ('cake_img_editor_preview');
        const cake_img_edit_input = document.getElementById('cake_img_edit_input');
        cake_img_preview.style.backgroundImage = ``;

        document.getElementById('select_image_edit_button').addEventListener('click', async function () {//Select image button
            console.log('select_image_edit_button clicked');
            cake_img_edit_input.click();
        });

        document.getElementById('remove_image_edit_button').addEventListener('click', function (event) {//Close the add product panel
            console.log('remove_image_edit_button clicked');
            cake_img_edit_input.value = "";
            cake_img_editor_preview.style.backgroundImage = ``;
            document.getElementById('remove_image_edit_button').style.display = 'none';
        });

        cake_img_editor_preview.addEventListener('click', function () {
            console.log('Image preview clicked');
            cake_img_edit_input.click();//force click
        });

        cake_img_edit_input.addEventListener('change', async function (event) {
            const file = event.target.files[0];
            console.log('Image input changed', file);
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    //check file size
                    if (file.size > 1000000) {//1MB
                        console.log('selected file way too large');
                        document.getElementById('product_edit_error_message').classList = "sign_up_error_message";
                        document.getElementById('product_edit_error_message').innerHTML = "Image is too large, please select an image smaller than 1MB, current files size is " + (file.size / 1000000).toFixed(2) + "MB";
                    } else {
                        document.getElementById('product_edit_error_message').classList = "sign_up_error_message_hidden";
                    }
                    cake_img_editor_preview.style.backgroundImage = `url('${e.target.result}')`;
                    cake_img_editor_preview.style.display = 'block';
                    document.getElementById('remove_image_edit_button').style.display = 'block';
                    console.log('Image preview loaded');
                }
                reader.readAsDataURL(file);//read the file so it can be displayed onload
            } else {
                //cake_img_preview.style.display = 'none';
                //reset the image preview
                cake_img_editor_preview.style.backgroundImage = ``;
                cake_img_editor_preview.style.display = 'block';
            }
        });

        document.getElementById('cancel_new_cake_button').addEventListener('click', function () {//Cancel button    
            console.log('cancel_new_cake_button clicked');
            ui_controller.hide_add_product();
            //reset form
            catalog_manager.reset_product_form();
        })

        //delete product button
        document.getElementById('delete_product_button').addEventListener('click', async function () {
            console.log('delete_product_button clicked');
            const uuid = properties.editingProduct;
            if (uuid == false || uuid == undefined) {
                console.log('No product selected');
                alert('No product selected');
                return false;
            }
            const confirm = window.confirm('Are you sure you want to delete this product?');
            if (confirm) {
                console.log('Set to delete product', uuid);
                catalog_manager.deleteProduct(uuid);
            }
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
        const upload_product_button = document.getElementById('upload_product_button');
        upload_product_button.disabled = true;//Disable the button
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
            upload_product_button.disabled = false;//Enable the button

            return false;

        } else if (description == '') {
            product_input_error_message.classList = "sign_up_error_message";
            product_input_error_message.innerHTML = "Description is empty";
            upload_product_button.disabled = false;//Enable the button

            return false;

        } else if (price == '') {
            product_input_error_message.classList = "sign_up_error_message";
            upload_product_button.disabled = false;//Enable the button
            product_input_error_message.innerHTML = "No price selected";
            return false;

        } else if (image == undefined || image == null || image == '') {
            product_input_error_message.classList = "sign_up_error_message";
            upload_product_button.disabled = false;//Enable the button
            product_input_error_message.innerHTML = "No Image selected";
            //return false;
            //allow empty image for now
        } else if (image.size > 1000000) {//3MB
            product_input_error_message.classList = "sign_up_error_message";
            upload_product_button.disabled = false;//Enable the button
            product_input_error_message.innerHTML = "Image is too large, please select an image smaller than 1mb";
            return false;
        }

        //build the form data
        const formData = new FormData();
        formData.append('image_file', image);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        console.log('Form data: ', formData);

        //upload the form data to the server
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
    editProduct: async function (uuid) {//Load a project to Edit a product in the catalog
        console.log('Editing product', uuid);
        properties.editingProduct = uuid;//Set the editing product id
        ui_controller.show_edit_product();
        //show editing catalog form

        //load up product to be edited
        const data = await post(uuid, 'get/cakebyuuid');// expects { Title,  Description, image_uri, uuid }
        console.log('Got product data: ', data);

        if (data == false || data == undefined) {
            console.log('Failed to load product data');
            alert('Failed to load product data, check server');
            return false;
        }

        //populate the feilds
        const cake_name_edit_input = document.getElementById('cake_name_edit_input');
        const cake_description_edit_input = document.getElementById('cake_description_edit_input');
        const cake_price_edit_input = document.getElementById('cake_price_edit_input');
        const cake_img_editor_preview = document.getElementById('cake_img_editor_preview');

        cake_description_edit_input.value = data.Description;
        cake_name_edit_input.value = data.Title;
        cake_price_edit_input.value = data.price;
        cake_img_editor_preview.style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${data.image_uri}')`;
        cake_img_editor_preview.style.display = 'block';
        document.getElementById('remove_image_edit_button').style.display = 'block';

        properties.editingProduct = uuid;//Set the editing product id
    },
    submit_edits: async function () {//Submit the edits to the product
        console.log('Submitting edits on product', properties.editingProduct);
        /*
            Create dynamic loading animation here later
        */
        const upload_product_button = document.getElementById('upload_edit_product_button');
        upload_product_button.disabled = true;//Disable the button
        //Get the values from the input fields
        const title = document.getElementById('cake_name_edit_input').value;
        const description = document.getElementById('cake_description_edit_input').value;
        const price = document.getElementById('cake_price_edit_input').value;
        const image = document.getElementById('cake_img_edit_input').files[0];
        //Check if the values are empty
        const product_edit_error_message = document.getElementById('product_edit_error_message');
        if (title == '') {
            product_edit_error_message.classList = "sign_up_error_message";
            product_edit_error_message.innerHTML = "A name is required!";
            upload_product_button.disabled = false;//Enable the button

            return false;

        } else if (description == '') {
            product_edit_error_message.classList = "sign_up_error_message";
            product_edit_error_message.innerHTML = "Description is empty";
            upload_product_button.disabled = false;//Enable the button

            return false;

        } else if (price == '') {
            product_edit_error_message.classList = "sign_up_error_message";
            upload_product_button.disabled = false;//Enable the button
            product_edit_error_message.innerHTML = "No price selected";
            return false;

        } else if (image == undefined || image == null || image == '') {
            product_edit_error_message.classList = "sign_up_error_message";
            upload_product_button.disabled = false;//Enable the button
            product_edit_error_message.innerHTML = "No Image selected";
            //return false;
            //allow empty image for now
        } else if (image.size > 1000000) {//1MB
            product_edit_error_message.classList = "sign_up_error_message";
            upload_product_button.disabled = false;//Enable the button
            product_edit_error_message.innerHTML = "Image is too large, please select an image smaller than 1mb";
            return false;
        }

        //build the form data
        const formData = new FormData();
        formData.append('image_file', image);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('uuid', properties.editingProduct);
        //formData.append('uuid', properties.editingProduct);
        console.log('Form data: ', formData);

        const response = await fetch('post/editcake', {
            method: 'POST',
            body: formData,
        });

        const response_data = await response.json();
        console.log('Response data: ', response_data);
        if (response_data.status == 'success') {
            console.log('Product edited');
            alert('Product edited');
            ui_controller.hide_edit_product();
            catalog_manager.build();
            document.getElementById('upload_edit_product_button').disabled = false;
        } else {
            console.log('Product not edited, server error');
            alert('Error, was not edited, image file may be too large to upload');
            document.getElementById('upload_edit_product_button').disabled = false;
        }
    },
    deleteProduct: async function (uuid) {//Delete a product from the catalog
        console.log('Deleting product', uuid);
        const response = await post(uuid, 'post/deletecake');
        console.log('Response data: ', response);
        if (response.status == 'success') {
            console.log('Product deleted');
            alert('Product deleted');
            ui_controller.hide_edit_product();
            catalog_manager.build();
        } else {
            console.log('Product not deleted');
            alert('Error, was not deleted, internal server error');
        }
    }
}

let staff_manager = {
    initalize: function () {//Initialize the staff manager
        console.log('Staff manager is being initialized');

        document.getElementById('close_staff_input_pannel_button').addEventListener('click', function () {//Close the add new product panel
            console.log('Close staff input panel button clicked');
            staff_manager.hide_staff_input();
        });

        document.getElementById('cancel_staff_input_button').addEventListener('click', function () {//Close the add new product panel
            console.log('cancel_staff_input_button button clicked');
            staff_manager.hide_staff_input();
        });

        document.getElementById('upload_staff_input_button').addEventListener('click', async function () {//Upload staff button
            console.log('upload_staff_input_button clicked');
            staff_manager.submitStaff();
        });

        //delete staff button
        document.getElementById('delete_staff_button').addEventListener('click', async function () {
            //call to delete currently editing staff
            console.log('delete_staff_button clicked');
            staff_manager.deleteStaff();
        })

        this.loadStaff();
        setInterval(() => {
            console.log('Reloading staff');
            this.loadStaff();
        }, 20000);

    },
    show_staff_input: function () {//Show the staff input panel
        console.log('Showing staff input panel');
        document.getElementById('staff_input_pannel').classList = "editor_pannel_active";
        document.getElementById('staff_catalog').classList = "staff_catalog_compressed";
    },
    hide_staff_input: function () {//Hide the staff input panel
        console.log('Hiding staff input panel');
        document.getElementById('staff_input_pannel').classList = "editor_pannel";
        document.getElementById('staff_catalog').classList = "staff_catalog";
    },
    loadStaff: async function () {//Load the staff from the server
        console.log('Loading staff');
        //Create new staff button

        const staff_catalog = document.getElementById('staff_catalog');

        staff_catalog.innerHTML = "";//Clear the catalog

        const add_staff_button = document.createElement('div');
        add_staff_button.classList = "Staff_pedistal";
        add_staff_button.tagName = `Staff add new`;
        add_staff_button.title = `Add New Staff member`;
        const staff_name = document.createElement('div');
        staff_name.classList = "staff_pedistal_name"
        staff_name.innerHTML = `Add New Staff <br> +`;
        add_staff_button.appendChild(staff_name);
        staff_catalog.appendChild(add_staff_button);
        add_staff_button.addEventListener('click', function () {
            console.log('clicked pedistal for staff');
            staff_manager.addStaff();
        })


        //Load the staff from the server
        let data = await request('get/staff/');
        if (data == false || data == undefined) {
            console.log('Failed to load staff');
            return false;
        }
        console.log('gots Staff', data);//expects {id, username, password, privilage_level}


        for (let staffindex in data) {// construction zone
            const Staff_pedistal = document.createElement('div');
            Staff_pedistal.classList = "Staff_pedistal";
            Staff_pedistal.tagName = `Staff ${staffindex}`;
            Staff_pedistal.title = `${data[staffindex].username}`;

            const staff_name = document.createElement('div');
            staff_name.classList = "staff_pedistal_name"
            staff_name.innerHTML = `${data[staffindex].username}`;
            Staff_pedistal.appendChild(staff_name);

            const staff_privilage_level = document.createElement('div');
            staff_privilage_level.classList = "staff_pedistal_privilage_level"
            staff_privilage_level.innerHTML = `Privilage: ${data[staffindex].privilage_level}`;
            Staff_pedistal.appendChild(staff_privilage_level);

            staff_catalog.appendChild(Staff_pedistal);

            Staff_pedistal.addEventListener('click', function () {
                console.log('clicked pedistal for staff', data[staffindex].id);
                staff_manager.editStaff(data[staffindex].id);
            })
        }

    },
    editStaff: async function (id) {//Load a project to Edit a staff member
        console.log('Editing staff', id);
        properties.editingStaff = id;//Set the editing staff id
        this.show_staff_input();
        //show delete button
        document.getElementById('delete_staff_button').style.display = 'block';
        this.resetStaffForm().then(() => {
            //load up staff to be edited
            post(id, 'get/staffbyid').then((data) => {
                console.log('Got staff data: ', data);
                if (data == false || data == undefined) {
                    console.log('Failed to load staff data');
                    alert('Failed to load staff data, check server');
                    return false;
                }

                //populate the feilds
                const staff_username_input = document.getElementById('staff_username_input');
                const staff_password_input = document.getElementById('staff_password_input');
                const staff_password_confirm_input = document.getElementById('staff_password_input2');
                const staff_privilage_input = document.getElementById('staff_authority_input');

                staff_username_input.value = data.username;
                staff_password_input.value = data.password;
                staff_password_confirm_input.value = data.password;
                staff_privilage_input.value = data.privilage_level;

            });
        });

    },
    addStaff: async function () {//Add a staff member
        console.log('Adding staff');
        properties.editingStaff = 0;//if staff is 0 server will assume new staff
        this.show_staff_input();
        //Hide delete button
        document.getElementById('delete_staff_button').style.display = 'none';
        this.resetStaffForm();


    },
    resetStaffForm: async function () {//Reset the staff form
        //gather inputs
        const staff_username_input = document.getElementById('staff_username_input');
        const staff_password_input = document.getElementById('staff_password_input');
        const staff_password_confirm_input = document.getElementById('staff_password_input2');
        const staff_privilage_input = document.getElementById('staff_authority_input');

        staff_username_input.value = "";
        staff_password_input.value = "";
        staff_password_confirm_input.value = "";
        staff_privilage_input.value = "";
    },
    submitStaff: async function () {
        console.log('Submitting staff', properties.editingStaff);
        //Get the values from the input fields
        const staff_username_input = document.getElementById('staff_username_input').value;
        const staff_password_input = document.getElementById('staff_password_input').value;
        const staff_password_confirm_input = document.getElementById('staff_password_input2').value;
        const staff_privilage_input = document.getElementById('staff_authority_input').value;
        //Check if the values are empty
        const staff_input_error_message = document.getElementById('staff_input_error_message');
        if (staff_username_input == '') {
            staff_input_error_message.classList = "sign_up_error_message";
            staff_input_error_message.innerHTML = "A username is required!";
            return false;

        } else if (staff_password_input == '') {
            staff_input_error_message.classList = "sign_up_error_message";
            staff_input_error_message.innerHTML = "Password is empty";
            return false;

        } else if (staff_password_confirm_input == '') {
            staff_input_error_message.classList = "sign_up_error_message";
            staff_input_error_message.innerHTML = "Password confirmation is empty";
            return false;

        } else if (staff_password_input != staff_password_confirm_input) {
            staff_input_error_message.classList = "sign_up_error_message";
            staff_input_error_message.innerHTML = "Passwords do not match";
            return false;

        } else if (staff_privilage_input == '') {
            staff_input_error_message.classList = "sign_up_error_message";
            staff_input_error_message.innerHTML = "No Privilage level selected";
            return false;
        }

        //no need to build form, just post json data
        const staff = {
            id: properties.editingStaff,
            username: staff_username_input,
            password: staff_password_input,
            privilage_level: staff_privilage_input
        }

        const response = await post(staff, 'post/staffupdate');
        console.log('Response data: ', response);

        if (response.status == 'success') {
            console.log('Staff added');
            alert('Staff added');
            this.hide_staff_input();
            staff_manager.loadStaff();
        }
        else if (response.status == 'edited') {
            console.log('Staff edited');
            alert('Staff edited');
            this.hide_staff_input();
            staff_manager.loadStaff();
        } else {
            console.log('Staff not added');
            alert('Error, was not added, check server');
        }

    },
    deleteStaff: async function () {
        console.log('Deleting staff', properties.editingStaff);
        //obtain confirmation
        const confirm = window.confirm('Are you sure you want to delete this staff member?');
        if (confirm == false) {
            console.log('Delete staff cancelled');
            return false;
        }
        //delete staff

        const response = await post(properties.editingStaff, 'post/deletestaff');

        console.log('Response data: ', response);
        if (response.status == 'success') {
            console.log('Staff deleted');
            alert('Staff deleted');
            this.hide_staff_input();
            staff_manager.loadStaff();
        } else {
            console.log('Staff not deleted');
            alert('Error, was not deleted, internal server error');
        }
    }
}

let order_manager = {
    initalize: async function () {
        console.log('Order manager is being initialized');

        setInterval(() => {
            console.log('Reloading orders');
            this.build_orders();
        }, 15000);
        this.build_orders();
    },
    build_orders: async function () {
        console.log('Building orders');
    },
    show_order_details_for: async function (orderid) {
        console.log('Showing order details for order', orderid);
        this.show_popup_pannel();
    },
    show_popup_pannel: async function () {
        console.log('Opening popup pannel');
        document.getElementById('order_popup_pannel').classList = "Customer_popup_pannel_active";
    },
    close_popup_pannel: async function () {
        console.log('Closing popup pannel');
        document.getElementById('order_popup_pannel').classList = "Customer_popup_pannel"
    },

}

let customer_manager = {
    initalize: async function () {
        document.getElementById('close_Customer_popup_pannel').addEventListener('click', function () {//Close the customer popup panel
            console.log('Close customer popup panel button clicked');
            customer_manager.close_popup_pannel();
        });
        setInterval(() => {
            console.log('Reloading customers');
            this.loadCustomers();
        }, 16000);
        this.loadCustomers();

    },
    loadCustomers: async function () {
        console.log('Loading customers');
        //Load the customers from the server
        let data = await request('get/customers');
        if (data == false || data == undefined) {
            console.log('Failed to load customers');
            alert('Failed to load customers');
            return false;
        }
        console.log('gots Customers', data);//expects {`uuid`, `username`, `password`, `loyalty_points`, `payment_details`, `orders`, `Cart_items`, `Delivery_address`}
        const customer_catalog = document.getElementById('customer_catalog');
        customer_catalog.innerHTML = "";//Clear the catalog

        // Customers are created when they sign up

        //Load the customers from the server
        for (let customerindex in data) {// construction zone
            const Customer_pedistal = document.createElement('div');
            Customer_pedistal.classList = "Customer_pedistal";
            Customer_pedistal.tagName = `Customer ${customerindex}`;
            Customer_pedistal.title = `${data[customerindex].username}`;

            //username
            const customer_name = document.createElement('div');
            customer_name.classList = "customer_pedistal_name"
            customer_name.innerHTML = `${data[customerindex].username}`;
            Customer_pedistal.appendChild(customer_name);
            //loyalty points
            const customer_loyalty_points = document.createElement('div');
            customer_loyalty_points.classList = "customer_pedistal_loyalty_points"
            customer_loyalty_points.innerHTML = `Loyalty Points: ${data[customerindex].loyalty_points}`;
            Customer_pedistal.appendChild(customer_loyalty_points);

            //order count
            const customer_order_count = document.createElement('div');
            customer_order_count.classList = "customer_pedistal_order_count"
            customer_order_count.innerHTML = `Orders: ${data[customerindex].orders.length}`;
            Customer_pedistal.appendChild(customer_order_count);

            //

            customer_catalog.appendChild(Customer_pedistal);

            Customer_pedistal.addEventListener('click', function () {
                console.log('clicked pedistal for customer', data[customerindex].uuid);
                customer_manager.getadvanced_details(data[customerindex].uuid);
            });

        }
    },
    getadvanced_details: async function (uuid) {
        //open popup and get advanced detals from server
        console.log('Getting advanced details for customer', uuid);
        this.open_popup_pannel();

        ///get/customerbyid
        const data = await post(uuid, 'get/customerbyid');
        console.log('Got customer data: ', data);
        if (data == false || data == undefined) {
            console.log('Failed to load customer data');
            alert('Failed to load customer data, check server');
            return false;
        }
        //populate the feilds
        const customer_name_value = document.getElementById('customer_name_value');
        const customer_loyalty_points_value = document.getElementById('customer_Loyalty_points');
        const customer_orders_value = document.getElementById('customer_orders_value');

        customer_name_value.innerHTML = data.username;
        customer_loyalty_points_value.innerHTML = data.loyalty_points;
        customer_orders_value.innerHTML = data.orders.length;
        //clear the order history

        const customer_order_history = document.getElementById('customer_order_history');
        customer_order_history.innerHTML = "";//Clear the order history
        //already Loaded the order history from the server
        
        const catalog = await request('get/catalog');//load the catalog to get cake data

        post(data.username, 'get/orders').then((response) => {
            console.log('Orders response: ', response);//expects [{ordernumber: 3, Items: '[{cakeid,quantity}]', Date, Status, total_price}]

            if (response != "error") {
                console.log('loaded orders');
                //build orders display
                customer_order_history.innerHTML = "";
                for (let order in response) {
                    build_order(response[order]);
                }
            } else {
                console.error('failed to load orders');
            }
        });
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

            customer_order_history.appendChild(order_container);

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

            order_container.addEventListener('click', function () { 
                console.log('clicked order', order.ordernumber);
                //open order details
                order_manager.show_order_details_for(order.ordernumber);
            })
        }


    },
    open_popup_pannel: async function () {
        console.log('Opening popup pannel');
        document.getElementById('Customer_popup_pannel').classList = "Customer_popup_pannel_active";
    },
    close_popup_pannel: async function () {
        console.log('Closing popup pannel');
        document.getElementById('Customer_popup_pannel').classList = "Customer_popup_pannel"
    },
}