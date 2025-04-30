//product upload test

const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const readline = require('node:readline');

try {
    logs.info("Starting template test");

    
    const cake = {
        Title: req.body.title,
        Description: req.body.description || 'empty',
        price: req.body.price,
        image_uri: '',//fix no default image uri later
    }

    const title_input = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
    title_input.question(`Cake title\n`, title => {
        logs.info(`got input ${title}`);
        title_input.close();// close the readline interface
        cake.Title = title;
        const description_input = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
        description_input.question(`Cake description\n`, description => {
            logs.info(`got input ${description}`);
            description_input.close();// close the readline interface
            cake.Description = description;
            const price_input = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
            price_input.question(`Cake price\n`, price => {
                logs.info(`got input \$${price}`);
                price_input.close();// close the readline interface
                cake.price = price;
                const image_uri_input = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
                image_uri_input.question(`Cake image uri\n`, image_uri => {
                    logs.info(`got input ${image_uri}`);
                    image_uri_input.close();// close the readline interface
                    cake.image_uri = image_uri;

                    database.insert_into_Cakes(cake).then((result) => {
                        //logs.info('Lookup result: ', result);
                        if (typeof (result) != 'undefined' && result.affectedRows > 0) {
                            logs.info("Cake upload successful");
                            logs.info("\n\n--------------------------------------------------");
                            logs.info("test PASSED :)");
                        }
                        else {
                            logs.info("\n\n--------------------------------------------------");
                            logs.info("test failed, due to database error");
                        }
                    });
                    //test passes at end of callback swamp
                    logs.info("--------------------------------------------------");
                    logs.info("--TEST PASSED-- :)");
                });
            });
        });

    });

} catch (error) {
    logs.info("\n\n--------------------------------------------------");
    logs.error(error);
    logs.info("--------------------------------------------------");
    logs.info("test FG01 FAILED!! :( due to runtime error");
}