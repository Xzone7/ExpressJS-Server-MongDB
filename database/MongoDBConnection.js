'use strict';

const mongoose = require("mongoose");
const user = require("./method/userMethod");

class MongoDBConnection {
    constructor() {
        this.connection = mongoose.connect;
    }

    /**************Users Collection**************/
    
    // GET all users
    getAllUser(res) {
        user.getAllUser(res, this.connection);
    }

    // GET one user by userID
    getUserById(res, id) {
        user.getUserByID(res, id, this.connection);
    }

    // POST a new user
    insertUser(res, data) {
        user.insertUser(res, data, this.connection);
    }

    // PUT/UPDATA one user by userID
    updateUser(res, id, data) {
        user.updateUser(res, id, data, this.connection);
    }

    // DELETE one user by userID
    deleteUser(res, id) {
        user.deleteUser(res, id, this.connection);
    }
}

module.exports = { MongoDBConnection };