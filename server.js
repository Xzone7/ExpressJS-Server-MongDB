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
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.sendStatus(200);
    } else {
        console.log("------------------------------------\n");
        next();
    }
});

// Access Logger
app.use((req, res, next) => {
    console.log(`request user-agent url: ${req.url} \n`);
    console.log(`request user-agent IP: ${req.ip} \n`);
    next();
});

// Router Setting
app.use("/api", router);

/* Testing acc */
let testCount = 0;

/* ----------------------------------- */
/* Database configuration */
/* ----------------------------------- */

const conn = new MongoDBConnection();

/* ----------------------------------- */
/* Project-1 Router configuration */
/* ----------------------------------- */

/* GET Method Router */
router.get("/users", (req, res) => {
    console.log(`COUNT: ${testCount} \n`);
    if (testCount < 3) {
        testCount++;
        res.sendStatus(429);
    } else {
        conn.getAllUser(res);
    }
});

router.get("/users/:userId", (req, res) => {
    conn.getUserById(res, req.params.userId);
});

/* POST Method Router */
router.post("/users", (req, res) => {
    conn.insertUser(res, req.body);
});

/* PUT Method Router */
router.put("/users/:userId", (req, res) => {
    conn.updateUser(res, req.params.userId, req.body);
});

/* DELETE Method Router */
router.delete("/users/:userId", (req, res) => {
    conn.deleteUser(res, req.params.userId);
});


/* ----------------------------------- */
/* Project-2 Router configuration */
/* ----------------------------------- */

/* GET Method Router */
router.get("/armyusers", (req, res) => {
    console.log(req.url);
    conn.getArrayOfAllArmyUser(req, res);
});

/* GET Method Router: get all users for /create page  */
router.get("/armyuser-all-superior", (req, res) => {
    conn.getAllArmyUser(res);
});

/* GET Method Router: get all no circle superior for /edit page base on ID */
router.get("/allow-edit-superior/:userId", (req, res) => {
    conn.getValidSuperiorById(res, req.params.userId);
});

/* POST Method Router */
router.post("/armyusers", (req, res) => {
    conn.insertArmyUser(res, req.body);
});

/* PUT Method Router */
router.put("/armyusers/:userId", (req, res) => {
    conn.updateArmyUser(res, req.params.userId, req.body);
});

/* DELETE Method Router */
router.delete("/armyusers", (req, res) => {
    conn.deleteArmyUser(res, req.body);
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