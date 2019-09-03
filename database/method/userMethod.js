'use strict';

const mongoose = require("mongoose");
const connectString = require("../connection-config/config");
const Users = require("../schema/userSchema");

/* GET ALL USERS */
module.exports.getAllUser = (res, connection) => {
    console.log("DB connection has start... \n");

    // Start to make a connction
    connection(connectString, { useNewUrlParser: true }, (err) => {
        // connection with db failed, notice user
        if (err) {
            console.error(err);
            res.status(500).json({
                DBconnection: "Connetion Falied",
                Error: `${err}`
            });
        }

        console.log("DB connection has succeed... \n");
        console.log("Start to fetch all users' data... \n");

        // Find all users from Users collection
        Users.find({}, (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({
                    DBconnection: `${err}`
                });
                return;
            }
            res.status(200).json(data);
            mongoose.connection.close();
            console.log("DB connection has closed successfully... \n");
            console.log("Send data to client successfully \n");
        });
    });
};

/* GET USER BY ID */
module.exports.getUserByID = (res, id, connection) => {
    console.log("DB connection has start... \n");

    // Start to make a connction
    connection(connectString, { useNewUrlParser: true }, (err) => {
        // connection with db failed, notice user
        if (err) {
            console.error(err);
            res.status(500).json({
                DBconnection: "Connetion Falied",
                Error: `${err}`
            });
        }

        console.log("DB connection has succeed... \n");
        console.log(`Start to fetch user: ${id} data... \n`);

        // Find one user by ID, ID was sent from client
        Users.findById(id, (err, data) => {
            if (err) {
                console.error(err);
                res.status(400).json({
                    DBconnection: `${err}`
                });
                return;
            } else if (data === null) {
                console.error(`user: ${id} is not found in database`);
                res.status(400).json({
                    DBconnection: `User: ${id} is not Found in Database`
                });
                return;
            }
            res.status(200).json(data);
            mongoose.connection.close();
            console.log("DB connection has closed successfully... \n");
            console.log("Send data to client successfully \n");
        });
    });
};

/* POST A NEW USER */
module.exports.insertUser = (res, data, connection) => {

    console.log("Start to check user data validation... \n");

    if (data === null || data === undefined || Object.keys(data).length < 5) {
        console.error("Invalid user data... \n");
        res.status(400).json({
            InvaildPost: `post data: ${data}`
        });
        return;
    }

    console.log("DB connection has start... \n");

    // Start to make a connction
    connection(connectString, { useNewUrlParser: true }, (err) => {
        // connection with db failed, notice user
        if (err) {
            console.error(err);
            res.status(500).json({
                DBconnection: "Connetion Falied",
                Error: `${err}`
            });
        }

        console.log("DB connection has succeed... \n");
        console.log("Start to create new document... \n");
        // insert new document to Users collection

        const newUser = new Users({
            _id: new mongoose.Types.ObjectId,
            firstname: data.firstname,
            lastname: data.lastname,
            sex: data.sex,
            age: data.age,
            password: data.password
        });

        console.log("New user has been created, save to DB now... \n");

        newUser.save((err) => {
            if (err) {
                console.error(err);
                res.status(500).json({
                    DBconnection: `${err}`
                });
                return;
            }
            res.status(200).json({
                Message: "Insert New User Successfully"
            });
            mongoose.connection.close();
            console.log("DB connection has closed successfully... \n");
            console.log("Send message to client successfully \n");
        });
    });
}

/* PUT/UPDATE A USER BY USERID */
module.exports.updateUser = (res, id, data, connection) => {
    console.log("DB connection has start... \n");

    // Start to make a connction
    connection(connectString, { useNewUrlParser: true, useFindAndModify: false }, (err) => {
        // connection with db failed, notice user
        if (err) {
            console.error(err);
            res.status(500).json({
                DBconnection: "Connetion Falied",
                Error: `${err}`
            });
        }

        console.log("DB connection has succeed... \n");
        console.log(`Start to update user: ${id} ... \n`);

        Users.findByIdAndUpdate(id, data, (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({
                    DBconnection: `${err}`
                });
                return;
            }
            res.status(200).json({
                Message: `Update User: ${id} Successfully`
            });
            mongoose.connection.close();
            console.log("DB connection has closed successfully... \n");
            console.log("Send message to client successfully \n");
        });
    });

}

/* DELETE USER BY USERID */
module.exports.deleteUser = (res, id, connection) => {
    console.log("DB connection has start... \n");

    // Start to make a connction
    connection(connectString, { useNewUrlParser: true }, (err) => {
        // connection with db failed, notice user
        if (err) {
            console.error(err);
            res.status(500).json({
                DBconnection: "Connetion Falied",
                Error: `${err}`
            });
        }

        console.log("DB connection has succeed... \n");
        console.log(`Start to delete user: ${id} ... \n`);

        // Find by ID and delete it
        Users.findByIdAndDelete(id, (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({
                    DBconnection: `${err}`
                });
                return;
            }
            res.status(200).json({
                Message: `Delete User: ${id} Successfully`
            });
            mongoose.connection.close();
            console.log("DB connection has closed successfully... \n");
            console.log("Send message to client successfully... \n");
        });
    });
}
