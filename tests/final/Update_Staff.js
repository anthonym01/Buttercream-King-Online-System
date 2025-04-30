// Update Staff()
// This test case is designed to update a staff member's information in the system.
const database = require('../../modules/database_wrapper');
const logs = require('../../modules/logger');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test() {
    try {

        logs.info("Starting update staff test");

        database.getStaff().then(async (results) => {
            let table = new Table;
            results.forEach(function (staff) {
                table.cell('Staff Id', staff.id)
                table.cell('username', staff.username)
                table.cell('PR level', staff.privilage_level)
                table.newRow()
            });

            logs.info(table.toString());
            logs.info("Enter a staff id to update: ");
            const staffid = await text('Staff ID: ', { default: results[results.length -1].id });

            //check if staffid is valid
            let found = false;
            let staffindex;
            for (let index in results) {
                if (results[index].id == staffid) {
                    staffindex = index;
                    found = true;
                    break;
                }
            }
            if (!found) {
                logs.info("--------------------------------------------------");
                logs.info("test failed, invalid staff id");
                return;
            }
            //update staff
            logs.info("Enter new username ");
            const username = await text('Username: ', { default: results[staffindex].username });
            logs.info("Enter new password ");
            const password = await text('Password: ', { default: results[staffindex].password });
            logs.info("Enter new privilege level ");
            const pr_level = await text('Privilege Level: ', { default: results[staffindex].privilage_level });
            const staff = {
                username: username,
                password: password,
                privilage_level: pr_level
            }
            database.updateStaff(staffid, staff);

            
            logs.info("--------------------------------------------------");
            logs.info("--TEST PASSED-- :)");

        });


    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test FAILED!! :( due to runtime error");
    }

}
test();
