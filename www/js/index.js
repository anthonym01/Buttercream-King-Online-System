
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

let config = {
    /* The `config` is used to manage local application data by saving,loading, and deleting configuration settings via local storage. */
    data: {//Loacal app data

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

let navigation_overide = {
    initalize: async function () {
        console.log('Navigation overider startup');

    }
}

let catalog_maintainer = {
    initalize: async function () {
        console.log("catalog startup");
        this.build();
    },
    build: async function () {
        console.log("Build catalog");
        request('/get/catalog').then((catalog) => {
            console.log('Got Catalog: ', catalog);//payload = { title,    description, image_uri, uuid }
            for(let cakeindex in catalog){
                let Cake_pedistal = document.createElement('div');
                Cake_pedistal.classList="Cake_pedistal";
                Cake_pedistal.tagName=`Cake ${cakeindex}`;
                
            }

        })
    },
}