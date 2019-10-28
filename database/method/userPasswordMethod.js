'use strict';

const mongoose = require("mongoose");
const Passwords = require("../schema/passwordSchema");


/* Internal funcation to verify login in */
module.exports.getPassword = (username) => {

    console.log(`Start to fetch ${username}'s password... \n`);

    Passwords.findOne({username: username}, (err, data) => {
        if (err) {
            console.error(err);
            return null;
        }

        /* Case 1: username is not found */
        if (data === null) {
            console.error(`username: ${username} is not found in the database`);
            return null;
        }

        /* Case 2: username is found, return it's password */
        console.log("DB *FIND USER* transaction has succeed...\n");
        console.log("Return data to caller...\n");
        return data;
    });
}

/* POST NEW USER WITH PASSWORD */
/* Work flow: (2 depends on 1)
            1. check if username exist 
                case 1.1: if exsit, return reject message 
                case 1.2  if not exsit, proceed to 2
            
            2. save the username + password
*/
module.exports.insertNewUser = (res, data) => {

    console.log("Start to check user data validation...\n");

    // Go DB find is username is exist 
    Passwords.findOne({username: data.username}, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                DBconnection: `${err}`
            });
            return;
        }

        /* Case 1: username already exsit */
        if (result) {
            console.error(`username: ${data.username} already exist...\n`);
            res.status(400).json({
                success: false,
                message: `username: ${data.username} already exist`
            })
            return;
        }

        console.log("Request data is valid... \n");

        console.log("Start to create new document... \n");

        /* Case 2: username is not exsit */
        const newUser = new Passwords({
            _id: new mongoose.Types.ObjectId,
            username: data.username,
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
            console.log("New user has been saved, send 200 to client... \n");
            res.status(200).json({
                Message: "Insert New User Successfully"
            });
            console.log("DB *INSERT NEW USER* transaction has succeed... \n");
            console.log("Send message to client successfully... \n");
        })
    });
}