/* Entry UserList Backend Server */
/* Server Usage: $ node/nodemon server.js [port number --option] */
'use strict';

const express = require("express");
const app = express();
const router = express.Router();
const { MongoDBConnection } = require("./database/MongoDBConnection");

/* ----------------------------------- */
/* Middleware configuration */
/* ----------------------------------- */

// for parsing application/json request body
app.use(express.json()); 

// for parsing allication/x-www-form-urlencoded request body
app.use(express.urlencoded({ extended: true })); 

// CORS controll grant
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Resource-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Method", "*");
    next();
}); 

// Access Logger
app.use((req, res, next) => {
    console.log(`request user-agent url: ${req.url} \n`);
    console.log(`request user-agent IP: ${req.ip} \n`);
    next();
});

// Router Setting
app.use("/api", router);


/* ----------------------------------- */
/* Router configuration */
/* ----------------------------------- */

/* GET Method Router */
router.get("/users", (req, res) => {
    const conn = new MongoDBConnection();
    conn.getAllUser(res);
});

router.get("/users/:userId", (req, res) => {
    console.log(req.param.userId);
    const conn = new MongoDBConnection();
    conn.getUserById(res, req.params.userId);
});

/* POST Method Router */
router.post("/users", (req, res) => {
    const conn = new MongoDBConnection();
    conn.insertUser(res, req.body);
});

/* PUT Method Router */
router.put("/users/:userId", (req, res) => {
    const conn = new MongoDBConnection();
    conn.updateUser(res, req.params.userId, req.body);
});

/* DELETE Method Router */
router.delete("/users/:userId", (req, res) => {
    const conn = new MongoDBConnection();
    conn.deleteUser(res, req.params.userId);
});

/* Missing Resources 404 Page Router */
app.all("*", (req, res) => {
    res.status(404).send("<h1>Page Not Found</h1>");
});

router.all("*", (req, res) => {
    res.status(404).send("<h1>Resources Not Found</h1>");
});

/* ----------------------------------- */
/* Port configuration */
/* ----------------------------------- */

// Default port: 1024
const port = process.argv[2] || 1024
app.listen(port, () => console.log(`Server is listening on port ${port} \n`));