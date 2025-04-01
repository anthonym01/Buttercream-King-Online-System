
const running_subpath = window.location.pathname;// Used to redirect requests if a subpath is used with nginx

window.addEventListener('load', async function () {//Starting point
    try {
        await config.load();//Load config from local storage
    } catch (err) {
        console.warn('Something bad happened: ', err);
    } finally {
        //page startup
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
        credentials: { user: "", pass: "", token: "",privilage:0 },//User credentials
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

