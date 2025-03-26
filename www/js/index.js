const running_subpath = window.location.pathname;// Used to redirect requests if a subpath is used with nginx

window.addEventListener('load', async function () {//Starting point
    try {
        await config.load();//Load config from local storage
    } catch (err) {
        console.warn('Something bad happened: ', err);
    } finally {
        //page startup
        navigation_overide.initalize();
        catalog_maintainer.initalize();
    }
});

async function request(what) {// fetch data from the server
    try {
        const response = await fetch(what);
        if (!response.ok) { throw new Error('Network failiure'); }
        const data = await response.json();
        console.log(data);
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
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/* The `config` is used to manage local application data by saving,loading, and deleting configuration settings via local storage. */
let config = {
    data: {//Loacal app data
        credentials: { user: null, pass: null },
    },
    save: async function () {//Save config via local storage
        console.table('Configuration is being saved', config.data);
        localStorage.setItem("butterK_cfg", JSON.stringify(config.data));
    },
    load: function () {//Load config from local storage
        console.log('Configuration is being loaded');
        config.data = JSON.parse(localStorage.getItem("butterK_cfg"));
        console.log('config Loaded: ', config.data);
    },
    delete: function () {//wipe the config
        localStorage.clear("butterK_cfg");//yeet the storage key
        console.log('config deleted: ');
        console.table(config.data);
        config.data = {};
    },
}

let session_manager = {
    initalize: async function () {
        console.log('Session manager startup');
    },
}

let navigation_overide = {
    initalize: async function () {
        console.log('Navigation overider startup');

    }
}



let catalog_maintainer = {
    initalize: async function () {
        console.log("catalog startup");
        document.getElementById('cake_display_close_btn').addEventListener('click', function () { catalog_maintainer.close_cake() });
        document.getElementById('Procede_to_cart_button').addEventListener('click', function () { catalog_maintainer.procede_to_cart() });
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


        document.getElementById('cake_display').classList = "cake_display";
        document.getElementById('Cake_cattalog_container').classList = "Cake_cattalog_container_shoved";

        post(uuid, 'get/cakebyuuid').then((cakefromuuid) => {//cakefromuuid= {title, description, image_uri, uuid}
            console.log('Got cake ', cakefromuuid)
            document.getElementById('cake_display_title').innerHTML = `${cakefromuuid.Title}`
            document.getElementById('cake_display_banner').style.backgroundImage = `url('${running_subpath}img_database_store/cakes/${cakefromuuid.image_uri}')`;
            document.getElementById('cake_display_description').innerHTML = `${cakefromuuid.Description}`
            document.getElementById('cake_display_price').innerHTML = `\$${cakefromuuid.price.toFixed(2)}`;
        })
        document.getElementById('Add_to_cart_button').addEventListener('click', function (event) {
            catalog_maintainer.add_to_cart(uuid);
        })
    },
    close_cake: function () {
        document.getElementById('cake_display').classList = "cake_display_hidden";
        document.getElementById('Cake_cattalog_container').classList = "Cake_cattalog_container";
        document.getElementById('Add_to_cart_button').removeEventListener('click');
        document.getElementById('Add_to_cart_button').classList="add_to_cart_button"
        document.getElementById('Procede_to_cart_button').classList="add_to_cart_button_hidden"
    },
    add_to_cart: function (uuid) {
        document.getElementById('Add_to_cart_button').classList="add_to_cart_button_hidden"
        document.getElementById('Procede_to_cart_button').classList="add_to_cart_button"
        
        const quantity = document.getElementById('cake_quantity_selector').value;
        console.log('add to cart: ', uuid, ' quantity: ', quantity);
    },
    procede_to_cart: function () {
        console.log('procede to cart');
    },
}