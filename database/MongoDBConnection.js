'use strict';

/*
 * CLASS USAGE: Create instance of this class, get a DB connection permanently 
 */

const mongoose = require("mongoose");
const user = require("./method/userMethod");
const armyuser = require("./method/armyUserMethod");
const connectString = require("./connection-config/config");

class MongoDBConnection {
    constructor() {
        console.log("DB connection has start... \n");
        mongoose.connect(connectString, { useNewUrlParser: true }, (err) => {
            if (err) {
                console.error("DB connection err", err);
                return;
            }
            console.log("DB connection has succeed... \n");
        });
    }

    /**************Users Collection**************/
    
    // GET all users
    getAllUser(res) {
        user.getAllUser(res);
    }

    // GET one user by userID
    getUserById(res, id) {
        user.getUserByID(res, id);
    }

    // POST a new user
    insertUser(res, data) {
        user.insertUser(res, data);
    }

    // PUT/UPDATA one user by userID
    updateUser(res, id, data) {
        user.updateUser(res, id, data);
    }

    // DELETE one user by userID
    deleteUser(res, id) {
        user.deleteUser(res, id);
    }


    /**************Users Collection**************/

    // GET all users
    getAllArmyUser(res) {
        armyuser.getAllArmyUser(res);
    }

    // GET one user by userID
    getArmyUserById(res, id) {
        armyuser.getArmyUserByID(res, id);
    }

    // POST a new user
    insertArmyUser(res, data) {
        armyuser.insertArmyUser(res, data);
    }

    // PUT/UPDATA one user by userID
    updateArmyUser(res, id, data) {
        armyuser.updateArmyUser(res, id, data);
    }

    // DELETE one user by userID
    deleteArmyUser(res, data) {
        armyuser.deleteArmyUser(res, data);
    }    
}

module.exports = { MongoDBConnection };